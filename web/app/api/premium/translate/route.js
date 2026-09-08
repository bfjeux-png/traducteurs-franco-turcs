import Anthropic from '@anthropic-ai/sdk';
export const runtime = 'nodejs';

export async function POST(req) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return Response.json(
        { error: 'ANTHROPIC_API_KEY absente. Ajoutez-la dans les variables d’environnement.' },
        { status: 503 }
      );
    }

    const { text, source, target, context = 'voyage' } = await req.json();
    if (!text || text.length > 10000) {
      return Response.json({ error: 'Texte vide ou trop long.' }, { status: 400 });
    }

    const names = { fr: 'français de France', tr: 'turc naturel de Turquie' };
    const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-6',
      max_tokens: 1200,
      temperature: 0.2,
      system: `Tu es un interprète professionnel. Traduis du ${names[source]} vers le ${names[target]}. Conserve strictement les noms, adresses, nombres et le sens juridique. Adapte la politesse et le registre au contexte suivant : ${context}. Réponds uniquement avec un objet JSON valide ayant exactement cette forme : {"translation":"...","note":"courte note utile ou chaîne vide"}.`,
      messages: [{ role: 'user', content: text }]
    });

    const block = message.content.find(item => item.type === 'text');
    if (!block) throw new Error('Claude n’a renvoyé aucun texte.');
    const cleaned = block.text.trim().replace(/^```json\s*/i, '').replace(/\s*```$/, '');
    const output = JSON.parse(cleaned);
    return Response.json(output);
  } catch (error) {
    return Response.json({ error: `Erreur Claude : ${error.message}` }, { status: 500 });
  }
}

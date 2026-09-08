export const runtime='nodejs';
export async function POST(req){
 try{
  const {text,source,target}=await req.json(); if(!text||text.length>5000)return Response.json({error:'Texte vide ou trop long.'},{status:400});
  const endpoint=process.env.FREE_TRANSLATION_ENDPOINT;
  if(endpoint){const r=await fetch(endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({q:text,source,target,format:'text',api_key:process.env.FREE_TRANSLATION_API_KEY||undefined})});if(!r.ok)throw new Error('Service LibreTranslate indisponible');const d=await r.json();return Response.json({translation:d.translatedText,note:'Traduction gratuite via le serveur configuré.'})}
  const pair=`${source}|${target}`; const url=`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${pair}`;
  const r=await fetch(url,{headers:{'User-Agent':'Erasmus-Turkiye-PWA/1.0'}});if(!r.ok)throw new Error('Service gratuit indisponible');const d=await r.json();
  if(!d.responseData?.translatedText)throw new Error('Aucune traduction reçue');return Response.json({translation:d.responseData.translatedText,note:'Traduction gratuite. Vérifiez les formulations sensibles ou administratives.'});
 }catch(e){return Response.json({error:e.message},{status:502})}
}

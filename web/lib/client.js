export function speak(text, lang){
  if(!text || typeof window==='undefined') return;
  speechSynthesis.cancel(); const u=new SpeechSynthesisUtterance(text); u.lang=lang==='tr'?'tr-TR':'fr-FR'; u.rate=.93; speechSynthesis.speak(u);
}
export function startRecognition(lang,onResult,onEnd){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR) throw new Error('La reconnaissance vocale n’est pas disponible dans ce navigateur. Ouvrez l’application dans Safari.');
  const r=new SR(); r.lang=lang==='tr'?'tr-TR':'fr-FR'; r.interimResults=false; r.continuous=false;
  r.onresult=e=>onResult(e.results[0][0].transcript); r.onerror=e=>onEnd?.(e.error); r.onend=()=>onEnd?.(); r.start(); return r;
}
export async function copyText(text){await navigator.clipboard.writeText(text)}

'use client';
import {useEffect,useRef,useState} from 'react';
import {speak,startRecognition,copyText} from '../lib/client';
import {premiumPhrases,studentPhrases,offline} from '../lib/phrases';

export default function TranslatorApp({variant}){
 const premium=variant==='premium', phrases=premium?premiumPhrases:studentPhrases;
 const [source,setSource]=useState('fr'),[target,setTarget]=useState('tr'),[text,setText]=useState(''),[result,setResult]=useState('');
 const [note,setNote]=useState(''),[busy,setBusy]=useState(false),[listening,setListening]=useState(false),[xxl,setXxl]=useState(false),[tab,setTab]=useState('Traduire');
 const cameraRef=useRef(null);
 useEffect(()=>{if('serviceWorker' in navigator) navigator.serviceWorker.register(premium?'/sw-premium.js':'/sw-erasmus.js');},[premium]);
 function swap(){setSource(target);setTarget(source);setText(result);setResult(text);setNote('')}
 async function translate(input=text,context='conversation'){
  if(!input.trim())return; setBusy(true);setNote('');
  try{
   const r=await fetch(premium?'/api/premium/translate':'/api/free/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({text:input,source,target,context})});
   const data=await r.json(); if(!r.ok) throw new Error(data.error||'Traduction indisponible');
   setResult(data.translation);setNote(data.note||''); localStorage.setItem(`${variant}-last`,JSON.stringify({input,translation:data.translation,source,target}));
  }catch(e){
   const simple=offline[input.trim().toLowerCase()]; if(simple&&source==='fr'&&target==='tr'){setResult(simple);setNote('Traduction hors ligne.')} else setNote(e.message+' Les phrases rapides restent disponibles hors ligne.');
  }finally{setBusy(false)}
 }
 function listen(){try{setListening(true);startRecognition(source,t=>{setText(t);setTimeout(()=>translate(t),0)},()=>setListening(false))}catch(e){setNote(e.message);setListening(false)}}
 async function photo(e){const file=e.target.files?.[0];if(!file)return;setBusy(true);setNote('Lecture de la photo…');try{const {createWorker}=await import('tesseract.js');const worker=await createWorker(source==='tr'?'tur':'fra');const {data:{text:ocr}}=await worker.recognize(file);await worker.terminate();setText(ocr.trim());await translate(ocr.trim(),'menu, étiquette ou achat en commerce');}catch(err){setNote('Impossible de lire cette photo : '+err.message)}finally{setBusy(false);e.target.value=''}}
 function choose(p){setText(p[source==='fr'?1:2]);setResult(p[target==='tr'?2:1]);setNote('Phrase essentielle disponible hors ligne');window.scrollTo({top:0,behavior:'smooth'})}
 const tabs=premium?['Traduire','Taxi','Transport','Restaurant','Urgence']:['Traduire','Restaurant','Commerces','Université','Vie quotidienne','Urgence'];
 const shown=tab==='Traduire'?phrases:phrases.filter(p=>tab==='Vie quotidienne'||p[0].toLowerCase().includes(tab.toLowerCase().replace('commerces','commerce'))||p[0]==='Allergies'&&tab==='Restaurant'||p[0]==='Supermarché'&&tab==='Commerces'||p[0]==='Santé'&&tab==='Urgence');
 return <main className="app">
  <link rel="manifest" href={premium?'/manifest-premium.json':'/manifest-erasmus.json'}/>
  <header className="topbar"><div className="brand"><div className="logo">{premium?'AI':'E+'}</div><div><h1>{premium?'Istanbul AI Premium':'Erasmus Türkiye+'}</h1><small>{premium?'Assistant IA privé':'Assistant quotidien gratuit'}</small></div></div><button className="iconbtn" onClick={()=>location.href='/'} aria-label="Accueil">⌂</button></header>
  <nav className="tabs">{tabs.map(t=><button key={t} className={'chip '+(tab===t?'active':'')} onClick={()=>setTab(t)}>{t}</button>)}</nav>
  <section className="panel">
   <div className="language-row"><select value={source} onChange={e=>setSource(e.target.value)}><option value="fr">Français</option><option value="tr">Türkçe</option></select><button className="swap" onClick={swap}>⇄</button><select value={target} onChange={e=>setTarget(e.target.value)}><option value="tr">Türkçe</option><option value="fr">Français</option></select></div>
   <textarea className="input" value={text} onChange={e=>setText(e.target.value)} placeholder={source==='fr'?'Écrivez ou parlez en français…':'Türkçe yazın veya konuşun…'}/>
   <div className="actions"><button className="primary" onClick={()=>translate()} disabled={busy}>{busy?'Traitement…':'Traduire'}</button><button className="secondary" onClick={listen}>{listening?'Écoute…':'🎤 Parler'}</button><button className="secondary" onClick={()=>cameraRef.current.click()}>📷 Photo</button></div>
   <input ref={cameraRef} className="camera" type="file" accept="image/*" capture="environment" onChange={photo}/>
   <div className="output"><div className="translated">{result||'La traduction apparaîtra ici.'}</div>{note&&<div className="note">{note}</div>}</div>
   <div className="actions"><button className="secondary" onClick={()=>speak(result,target)}>🔊 Écouter</button><button className="secondary" onClick={()=>copyText(result)}>Copier</button><button className="secondary" onClick={()=>setXxl(true)}>Plein écran</button></div>
   <div className="status">{premium?'Traduction contextuelle via votre clé Anthropic. La clé reste côté serveur.':'Traduction gratuite en ligne, avec phrases essentielles hors connexion.'}</div>
  </section>
  <h2 className="section-title">Phrases rapides {tab!=='Traduire'&&'· '+tab}</h2><section className="quick-grid">{shown.map((p,i)=><button className={'quick '+(p[0]==='Urgence'?'danger':'')} key={i} onClick={()=>choose(p)}><b>{p[0]}</b><span>{p[source==='fr'?1:2]}</span></button>)}</section>
  <div className="install">Sur iPhone : ouvrez cette page dans Safari, touchez Partager, puis « Sur l’écran d’accueil ». Installez séparément les pages Premium et Erasmus.</div>
  {xxl&&<div className="full-overlay"><button className="closexxl" onClick={()=>setXxl(false)}>×</button>{result||'Aucune traduction'}</div>}
 </main>
}

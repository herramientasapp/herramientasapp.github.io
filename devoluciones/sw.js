/* Devoluciones · service worker (versión 3.0)
   - Caché propia con prefijo «devoluciones-»: al actualizarse SOLO borra sus propias cachés antiguas.
     (La versión anterior borraba las cachés de TODAS las demás apps del mismo github.io.)
   - Solo atiende archivos de SU carpeta: lo de otras apps y el puente de Google no se toca.
   - Ya no usa fuentes de Google. No toca localStorage ni IndexedDB. */
const C='devoluciones-v3-0';
const BASE=new URL('./',self.location).href;
const SHELL=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('devoluciones-')&&x!==C).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  if(new URL(r.url).origin!==location.origin||!r.url.startsWith(BASE))return;
  // red primero (para recibir actualizaciones), caché si no hay conexión
  e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(C).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{cacheName:C,ignoreSearch:true}).then(m=>m||caches.match('./index.html',{cacheName:C}))));
});

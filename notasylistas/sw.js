// Service worker del Gestor de notas (versión 5.0): guarda la app para abrirla sin conexión.
// Primero intenta la red (así siempre recibes la última versión) y, si no hay conexión, usa la copia.
// Si cambias index.html y no se actualiza en el móvil, cambia el número de versión de abajo.
// Solo borra SUS cachés antiguas (prefijo «gestornotas-»): nunca las de tus otras apps.
// Solo atiende archivos de SU carpeta: el puente de Google y las demás apps no se tocan.
const P='gestornotas-',V=P+'v5-0';
const BASE=new URL('./',self.location).href;
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith(P)&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin||!r.url.startsWith(BASE))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{cacheName:V}).then(m=>m||caches.match('index.html',{cacheName:V}))));
});

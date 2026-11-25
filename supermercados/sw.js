// Service worker de Supermercados v16: guarda la app para abrirla sin conexión.
// Primero intenta la red (así siempre recibes la última versión) y, si no hay conexión, usa la copia.
// Si cambias index.html y no se actualiza en el móvil, cambia el número de versión de abajo.
// Solo borra SUS cachés antiguas («compras-v…» de la v14 y «supermercados-v…»): nunca las de tus otras apps.
// Solo atiende archivos de SU carpeta. Ya no descarga nada de servidores externos (pdf.js y Chart.js eliminados).
// No guarda datos: tus datos están en IndexedDB y el service worker no los toca.
const V='supermercados-v16';
const BASE=new URL('./',self.location).href;
const SHELL=['./','index.html','manifest.webmanifest','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.allSettled(SHELL.map(u=>c.add(new Request(u,{cache:'reload'}))))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>/^(compras|supermercados)-v/.test(k)&&k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin||!r.url.startsWith(BASE))return;
  e.respondWith(fetch(r).then(res=>{if(res.ok&&res.type==='basic'){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r,{cacheName:V,ignoreSearch:true}).then(m=>m||caches.match('index.html',{cacheName:V}))));
});

// Service worker de Mi Lector RSS: guarda la app para abrirla sin conexión.
// Primero intenta la red (así siempre recibes la última versión) y, si no hay conexión, usa la copia.
// Si cambias index.html y no se actualiza en el móvil, cambia el número de versión de abajo.
const V='milector-v4';
const SHELL=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return; // feeds y artículos van directos al proxy
  e.respondWith(fetch(r).then(res=>{if(res.ok){const cp=res.clone();caches.open(V).then(c=>c.put(r,cp))}return res})
    .catch(()=>caches.match(r).then(m=>m||caches.match('index.html'))));
});

/* Service worker de "Gestor de viajes". Al subir una versión nueva, cambia CACHE (p. ej. v10). */
const CACHE='gestor-viajes-v9';
const FILES=['./','index.html','style.css','manifest.json','icon-192.png','icon-512.png','icon-maskable-512.png','apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(f=>c.add(new Request(f,{cache:'reload'})).catch(()=>{})))).then(()=>self.skipWaiting()));
});
self.addEventListener('activate',e=>{
  /* Solo borra cachés de esta app (el origen puede compartirse con otras apps) */
  e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n.startsWith('gestor-viajes-')&&n!==CACHE).map(n=>caches.delete(n)))).then(()=>self.clients.claim()));
});
/* Primero la copia local (rápido y sin conexión) y se refresca en segundo plano */
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  e.respondWith(caches.open(CACHE).then(async c=>{
    const m=await c.match(r,{ignoreSearch:true});
    const f=fetch(r).then(n=>{if(n&&n.ok)c.put(r,n.clone());return n}).catch(()=>null);
    if(m){e.waitUntil(f);return m}
    const n=await f;
    return n||(r.mode==='navigate'?(await c.match('index.html')):null)||Response.error();
  }));
});

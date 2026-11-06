/* Mi música · service worker (v8.0). Solo guarda la propia app para que abra sin conexión.
   NO toca YouTube ni ningún otro sitio: todo lo externo va directo a la red. */
const V='musica-v8-0';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('musica-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin)return;
  if(r.mode==='navigate'){
    /* Con red: página al día (y se guarda). Sin red o red muy lenta (3,5 s): la copia guardada. */
    e.respondWith(
      Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,3500))])
        .then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(ch=>ch.put('./index.html',c))}return x})
        .catch(()=>caches.match('./index.html').then(h=>h||caches.match('./')))
    );
    return;
  }
  e.respondWith(caches.match(r).then(h=>h||fetch(r).then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(ch=>ch.put(r,c))}return x})));
});

/* Mi música · service worker (v9.0). Solo guarda la propia app para que abra sin conexión.
   NO toca YouTube, el puente de Google ni ningún otro sitio: todo lo externo va directo a la red.
   Solo atiende archivos de SU carpeta y solo usa SU caché (prefijo «musica-»): no toca las de otras apps. */
const V='musica-v9-0';
const BASE=new URL('./',self.location).href;
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/icon.svg'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>Promise.all(SHELL.map(u=>c.add(new Request(u,{cache:'reload'})).catch(()=>0)))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith('musica-')&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(u.origin!==location.origin||!r.url.startsWith(BASE))return;
  if(r.mode==='navigate'){
    /* Con red: página al día (y se guarda). Sin red o red muy lenta (3,5 s): la copia guardada. */
    e.respondWith(
      Promise.race([fetch(r),new Promise((_,no)=>setTimeout(no,3500))])
        .then(x=>{if(x.ok){const c=x.clone();caches.open(V).then(ch=>ch.put('./index.html',c))}return x})
        .catch(()=>caches.match('./index.html',{cacheName:V}).then(h=>h||caches.match('./',{cacheName:V})))
    );
    return;
  }
  e.respondWith(caches.match(r,{cacheName:V}).then(h=>h||fetch(r).then(x=>{if(x.ok&&x.type==='basic'){const c=x.clone();caches.open(V).then(ch=>ch.put(r,c))}return x})));
});

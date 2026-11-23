/* Apps status · service worker
   - Caché propia con prefijo «controlapps-»: al actualizar SOLO borra sus propias cachés antiguas
     (nunca las de las demás apps del mismo github.io).
   - Solo atiende peticiones de sus propios archivos (dentro de su carpeta). El resto (otras apps,
     el puente de Google) pasa directo a la red sin tocarlo.
   - No toca localStorage ni IndexedDB. */
const P='controlapps-',V=P+'7.0.0';
const BASE=new URL('./',self.location).href;
const ASSETS=['./','./index.html','./manifest.webmanifest','./icon.svg','./icon-192.png','./icon-512.png','./icon-maskable-512.png','./apple-touch-icon.png'];
const OWN=new Set(ASSETS.map(a=>new URL(a,BASE).href));
self.addEventListener('install',e=>{e.waitUntil(caches.open(V).then(c=>c.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x.startsWith(P)&&x!==V).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
  const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);u.search='';u.hash='';
  if(!OWN.has(u.href))return;                       // no es de esta app: no se intercepta
  const isPage=r.mode==='navigate'||u.href===BASE||u.href===BASE+'index.html';
  if(isPage){                                         // página: primero red (para recibir versiones nuevas), si no, caché
    e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(V).then(x=>x.put('./index.html',c))}return res}).catch(()=>caches.match('./index.html',{cacheName:V}).then(m=>m||caches.match('./'))));
  }else{                                              // iconos y manifiesto: primero caché
    e.respondWith(caches.match(r,{ignoreSearch:true}).then(m=>m||fetch(r)));
  }
});

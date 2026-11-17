/* Mis servicios · service worker. Alcance: solo su carpeta. Cambiar VERSION junto con APP_VERSION del index.html. */
const VERSION='2.7.0',CACHE='mis_servicios-v'+VERSION,FILES=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon-maskable-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all(FILES.map(u=>fetch(new Request(u,{cache:'reload'})).then(r=>{if(!r.ok)throw new Error('No se pudo descargar '+u);return c.put(u,r)})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('mis_servicios-')&&k!==CACHE).map(k=>caches.delete(k)))))});
self.addEventListener('message',e=>{if(e.data==='SKIP')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;if(new URL(r.url).origin!==location.origin)return;
 e.respondWith(caches.open(CACHE).then(c=>c.match(r,{ignoreSearch:true}).then(h=>h||fetch(r).catch(()=>r.mode==='navigate'?c.match('./index.html'):Response.error()))))});

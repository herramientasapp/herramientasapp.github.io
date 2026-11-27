/* Mi gente · service worker v2.0.0
   Solo toca SUS cachés (prefijo mg-, y la antigua migente-v…): nunca borra cachés de otras apps del mismo subdominio. */
const P='mg-',V=P+'2.0.0',FILES=['./','index.html','manifest.json','icon-192.png','icon-512.png'];
const MIA=x=>(x.startsWith(P)||x.startsWith('migente-v'))&&x!==V;
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(FILES.map(f=>new Request(f,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(MIA).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
const nr=r.mode==='navigate'?new Request(r.url,{cache:'no-cache',credentials:'same-origin'}):new Request(r,{cache:'no-cache'});
e.respondWith(fetch(nr).then(x=>{if(x.ok&&x.type==='basic'){const cp=x.clone();e.waitUntil(caches.open(V).then(c=>c.put(r,cp)).catch(()=>{}))}return x})
.catch(()=>caches.open(V).then(c=>c.match(r,{ignoreSearch:true}).then(x=>x||(r.mode==='navigate'?c.match('index.html'):undefined))).then(x=>x||Response.error())))});

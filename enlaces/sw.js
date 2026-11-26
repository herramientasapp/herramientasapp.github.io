/* Service worker de "Mis enlaces": red primero (siempre la versión nueva) y, sin conexión, la copia guardada.
   - Caché propia con prefijo «misenlaces-»: al actualizarse SOLO borra sus propias cachés antiguas.
     (La versión anterior borraba las cachés de TODAS las demás apps del mismo github.io.)
   - Solo atiende peticiones de su propia carpeta; el resto (otras apps, el puente de Google) no lo toca.
   - No toca localStorage ni IndexedDB. */
const P = "misenlaces-", V = P + "v2-5.0.2";
const BASE = new URL("./", self.location).href;
const ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(ARCHIVOS.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k.startsWith(P) && k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin || !r.url.startsWith(BASE)) return; // no es de esta app
  const clave = u.origin + u.pathname; // sin ?title=…&url=… del "compartir"
  e.respondWith(
    fetch(r.url, { cache: "no-cache" })
      .then(res => { if (res.ok && res.type === "basic") { const c = res.clone(); caches.open(V).then(ca => ca.put(clave, c)); } return res; })
      .catch(() => caches.match(clave, { cacheName: V }).then(x => x || caches.match(r, { ignoreSearch: true, cacheName: V })))
  );
});

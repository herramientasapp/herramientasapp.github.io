/* Service worker de "Mis enlaces": red primero (siempre la versión nueva) y, sin conexión, la copia guardada. */
const V = "misenlaces-v1";
const ARCHIVOS = ["./", "index.html", "manifest.webmanifest", "icon.svg", "icon-192.png", "icon-512.png"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(V).then(c => Promise.allSettled(ARCHIVOS.map(u => c.add(u)))).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return;
  const clave = u.origin + u.pathname; // sin ?title=…&url=… del "compartir"
  e.respondWith(
    fetch(r.url, { cache: "no-cache" })
      .then(res => { if (res.ok) { const c = res.clone(); caches.open(V).then(ca => ca.put(clave, c)); } return res; })
      .catch(() => caches.match(clave).then(x => x || caches.match(r, { ignoreSearch: true })))
  );
});

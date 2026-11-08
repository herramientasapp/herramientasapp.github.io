/* Clases y Deporte — service worker.
   Solo guarda el CÓDIGO de la app (para usarla sin conexión). Los datos viven en IndexedDB y no se tocan.
   Rutas relativas: funciona en cualquier carpeta. Al publicar una versión nueva, cambia VER. */
const VER = '4.5.0';
const CACHE = 'clases-y-deporte-' + VER + '@' + self.registration.scope;
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => c.addAll(SHELL.map(u => new Request(u, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  const sufijo = '@' + self.registration.scope;
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k.startsWith('clases-y-deporte-') && k.endsWith(sufijo) && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

/* Primero la copia guardada (rápido y sin conexión) y se refresca en segundo plano. */
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return;
  e.respondWith((async () => {
    const c = await caches.open(CACHE);
    const hit = await c.match(r, { ignoreSearch: true });
    const red = fetch(r).then(res => { if (res && res.ok) c.put(r, res.clone()); return res; }).catch(() => null);
    if (hit) { e.waitUntil(red); return hit; }
    const res = await red;
    if (res) return res;
    if (r.mode === 'navigate') { const idx = await c.match('./index.html'); if (idx) return idx; }
    return Response.error();
  })());
});

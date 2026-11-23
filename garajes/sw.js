/* Garajes · service worker. Solo guarda en caché los archivos de la app (nunca datos). */
const VERSION = '8.0.0';
const CACHE = 'garajes-v' + VERSION;
const FILES = ['./', './index.html', './manifest.webmanifest', './favicon.svg', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)));
});
self.addEventListener('activate', e => {
  // Solo borra cachés antiguas de ESTA app (el dominio github.io se comparte con otras apps)
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n.startsWith('garajes-v') && n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim()));
});
self.addEventListener('message', e => { if (e.data === 'skip') self.skipWaiting(); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return; // POST y Google: directo a la red
  if (r.mode === 'navigate') {
    e.respondWith(caches.match('./index.html').then(x => x || fetch(r)));
    return;
  }
  e.respondWith(caches.match(r).then(x => x || fetch(r)));
});

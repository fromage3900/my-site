// Minimal service worker for Resonant Wilds PWA
const CACHE = 'resonant-wilds-v3-glb100';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './js/main.js',
  './js/game.js',
  './js/audio.js',
  './js/rhythm.js',
  './js/world.js',
  './js/harmonic-grove.js',
  './assets/models/harmonic-grove-37.glb',
  './vendor/loaders/GLTFLoader.js',
  './vendor/utils/BufferGeometryUtils.js',
  './js/entities.js',
  './js/combat.js',
  './js/loot.js',
  './js/activities.js',
  './js/progress.js',
  './js/ui.js',
  './js/player.js',
  './js/design.js',
  './js/fx.js',
  './js/util.js',
  './js/generated/ue_data.js',
  './vendor/three.module.min.js'
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(async (hit) => {
    if (hit) return hit;
    const response = await fetch(e.request);
    // The 63 optional GLBs are cached on demand, rather than making SW
    // installation depend on all of them succeeding over mobile networks.
    const url = new URL(e.request.url);
    if (response.ok && url.origin === self.location.origin &&
        url.pathname.includes('/assets/models/') && url.pathname.endsWith('.glb')) {
      const copy = response.clone();
      e.waitUntil(caches.open(CACHE).then((cache) => cache.put(e.request, copy)).catch(() => {}));
    }
    return response;
  }));
});

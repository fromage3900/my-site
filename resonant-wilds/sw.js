// Minimal service worker for Resonant Wilds PWA
const CACHE = 'resonant-wilds-v1';
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
  e.respondWith(
    caches.match(e.request).then((hit) => hit || fetch(e.request))
  );
});

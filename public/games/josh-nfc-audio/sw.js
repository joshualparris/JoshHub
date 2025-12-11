// sw.js — service worker for offline caching
// Bumping version to v2 to force update
const CACHE_NAME = 'nfc-audio-shell-v2';

function assetUrl(path){ return new URL(path, self.registration.scope).href; }

const ASSETS = [
  assetUrl('./index.html'),
  assetUrl('./styles.css'),
  assetUrl('./app.js'),
  assetUrl('./db.js'),
  assetUrl('./manifest.json'),
  assetUrl('./icons/icon-192.svg'),
  assetUrl('./icons/icon-512.svg')
];

self.addEventListener('install', ev=>{
  self.skipWaiting();
  ev.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(ASSETS)).catch(()=>{}));
});

self.addEventListener('activate', ev=>{
  // Clean up old caches (v1)
  ev.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.map(key => {
        if (key !== CACHE_NAME) return caches.delete(key);
      })
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', ev=>{
  const reqUrl = ev.request.url;
  if(ev.request.mode === 'navigate'){
    ev.respondWith(fetch(ev.request).catch(()=>caches.match(assetUrl('./index.html'))));
    return;
  }
  if(ASSETS.includes(reqUrl)){
    ev.respondWith(fetch(ev.request).catch(()=>caches.match(reqUrl)));
    return;
  }
  ev.respondWith(fetch(ev.request).catch(()=>caches.match(ev.request)));
});

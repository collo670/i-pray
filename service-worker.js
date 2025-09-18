const CACHE_NAME = 'ipray-v2';
const urlsToCache = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/manifest.json',
  '/i-pray/output.css',
  '/i-pray/assets/images/favicon.ico.jpg',
  '/i-pray/assets/images/icon-192x192.png',
  '/i-pray/assets/images/maria mdogo.png',
  '/i-pray/assets/images/carmen.jpg',
  '/i-pray/assets/images/bikira maria.jpg',
  '/i-pray/calendar.html',
  '/i-pray/holy-rosary.html',
  '/i-pray/prayer.html',
  '/i-pray/sacraments.html',
  '/i-pray/settings.html',
  '/i-pray/mwaka3-week21.html',
  '/i-pray/mwaka3-week22.html',
  '/i-pray/mwaka3-week23.html',
  '/i-pray/mwaka3-week24.html',
  '/i-pray/mwaka3-week25.html',
  '/i-pray/mwaka3-week26.html',
  '/i-pray/mwaka3-week27.html',
  '/i-pray/mwaka3-week28.html',
  '/i-pray/mwaka3-week29.html',
  '/i-pray/mwaka3-week30.html',
  '/i-pray/mwaka3-week31.html',
  '/i-pray/mwaka3-week32.html',
  '/i-pray/mwaka3-week33.html',
  '/i-pray/mwaka3-week34.html'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
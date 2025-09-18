const CACHE_NAME = 'ipray-v3';
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
  '/i-pray/settings.html'
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
        if (response) {
          return response;
        }
        return fetch(event.request).then(networkResponse => {
          // Cache mwaka3-week files on first access
          if (event.request.url.includes('/i-pray/mwaka3-week')) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
  );
});
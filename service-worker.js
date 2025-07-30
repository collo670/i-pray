const CACHE_NAME = 'ipray-v2';
const BASE_URL = '/ipray/'; // Match your GitHub Pages repo name
const ASSETS = [
  `${BASE_URL}`,
  `${BASE_URL}index.html`,
  `${BASE_URL}assets/css/styles.css`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/images/bikira maria.jpg`,
  `${BASE_URL}assets/js/main.js`,
  `${BASE_URL}manifest.json`,
  // Add other core pages
  `${BASE_URL}prayer.html`,
  `${BASE_URL}calendar.html`,
  `${BASE_URL}settings.html`,
  `${BASE_URL}holy-rosary.html`,
  `${BASE_URL}lauds.html`

];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  if (!(event.request.url.indexOf('http') === 0)) return;
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          if(!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(() => {
          // Fallback for pages
          if (event.request.mode === 'navigate') {
            return caches.match(`${BASE_URL}offline.html`);
          }
        });
      })
  );
});
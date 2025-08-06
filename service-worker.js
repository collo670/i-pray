const CACHE_NAME = 'ipray-v1';
const urlsToCache = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/output.css',
  '/i-pray/assets/images/bikira maria.jpg',
  '/i-pray/assets/images/carmen.jpg'
  // Add more assets if needed
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});
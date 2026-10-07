// The service worker moved to /i-pray/service-worker.js so it can cover the
// whole app (a worker only controls pages at or below its own folder, and
// this one sat in js/). If an old copy of a page still registers this path,
// this stub takes over that registration and removes it. It doesn't touch
// the caches: those belong to the real worker.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
    event.waitUntil(self.registration.unregister());
});

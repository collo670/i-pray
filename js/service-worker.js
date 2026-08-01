const CACHE_NAME = 'ipray-v202608011233';

// Critical app shell: cached during install. If any of these fail, the
// install fails, so keep this list short and only list files that exist.
const CRITICAL_ASSETS = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/dist/output.css',
  '/i-pray/css/index.css',
  '/i-pray/js/index.js',
  '/i-pray/js/logo-loader.js',
  '/i-pray/js/liturgical-calendar.js',
  '/i-pray/js/translation.js',
  '/i-pray/manifest.json',
  '/i-pray/assets/images/logo-small.jpg',
  '/i-pray/assets/images/maria-mdogo.jpg',
  '/i-pray/assets/images/icon-192x192.png',
  '/i-pray/pages/fallback.html'
];

// Everything else (prayer pages, scripts, styles, readings) is cached in the
// background after install. Each URL is fetched independently, so a missing
// file never blocks the rest. Generated from the actual files on disk.
const PRECACHE_URLS = [
  "/i-pray/pages/alhamisi1-jioni.html",
  "/i-pray/pages/alhamisi1-saa-sita.html",
  "/i-pray/pages/alhamisi1.html",
  "/i-pray/pages/alhamisi2-jioni.html",
  "/i-pray/pages/alhamisi2-saa-sita.html",
  "/i-pray/pages/alhamisi2.html",
  "/i-pray/pages/alhamisi3-jioni.html",
  "/i-pray/pages/alhamisi3-saa-sita.html",
  "/i-pray/pages/alhamisi3.html",
  "/i-pray/pages/alhamisi4-jioni.html",
  "/i-pray/pages/alhamisi4-saa-sita.html",
  "/i-pray/pages/alhamisi4.html",
  "/i-pray/pages/amefufuka.html",
  "/i-pray/pages/antifona.html",
  "/i-pray/pages/calendar.html",
  "/i-pray/pages/carmen.html",
  "/i-pray/pages/compline.html",
  "/i-pray/pages/daily-readings.html",
  "/i-pray/pages/fallback.html",
  "/i-pray/pages/holy-rosary.html",
  "/i-pray/pages/ijumaa1-jioni.html",
  "/i-pray/pages/ijumaa1-saa-sita.html",
  "/i-pray/pages/ijumaa1.html",
  "/i-pray/pages/ijumaa2-jioni.html",
  "/i-pray/pages/ijumaa2-saa-sita.html",
  "/i-pray/pages/ijumaa2.html",
  "/i-pray/pages/ijumaa3-jioni.html",
  "/i-pray/pages/ijumaa3-saa-sita.html",
  "/i-pray/pages/ijumaa3.html",
  "/i-pray/pages/ijumaa4-jioni.html",
  "/i-pray/pages/ijumaa4-saa-sita.html",
  "/i-pray/pages/ijumaa4.html",
  "/i-pray/pages/jumamosi1-jioni.html",
  "/i-pray/pages/jumamosi1-saa-sita.html",
  "/i-pray/pages/jumamosi1.html",
  "/i-pray/pages/jumamosi2-jioni.html",
  "/i-pray/pages/jumamosi2-saa-sita.html",
  "/i-pray/pages/jumamosi2.html",
  "/i-pray/pages/jumamosi3-jioni.html",
  "/i-pray/pages/jumamosi3-saa-sita.html",
  "/i-pray/pages/jumamosi3.html",
  "/i-pray/pages/jumamosi4-jioni.html",
  "/i-pray/pages/jumamosi4-saa-sita.html",
  "/i-pray/pages/jumamosi4.html",
  "/i-pray/pages/jumanne1-jioni.html",
  "/i-pray/pages/jumanne1-saa-sita.html",
  "/i-pray/pages/jumanne1.html",
  "/i-pray/pages/jumanne2-jioni.html",
  "/i-pray/pages/jumanne2-saa-sita.html",
  "/i-pray/pages/jumanne2.html",
  "/i-pray/pages/jumanne3-jioni.html",
  "/i-pray/pages/jumanne3-saa-sita.html",
  "/i-pray/pages/jumanne3.html",
  "/i-pray/pages/jumanne4-jioni.html",
  "/i-pray/pages/jumanne4-saa-sita.html",
  "/i-pray/pages/jumanne4.html",
  "/i-pray/pages/jumapili1-jioni.html",
  "/i-pray/pages/jumapili1-saa-sita.html",
  "/i-pray/pages/jumapili1.html",
  "/i-pray/pages/jumapili2-jioni.html",
  "/i-pray/pages/jumapili2-saa-sita.html",
  "/i-pray/pages/jumapili2.html",
  "/i-pray/pages/jumapili3-jioni.html",
  "/i-pray/pages/jumapili3-saa-sita.html",
  "/i-pray/pages/jumapili3.html",
  "/i-pray/pages/jumapili4-jioni.html",
  "/i-pray/pages/jumapili4-saa-sita.html",
  "/i-pray/pages/jumapili4.html",
  "/i-pray/pages/jumatano1-jioni.html",
  "/i-pray/pages/jumatano1-saa-sita.html",
  "/i-pray/pages/jumatano1.html",
  "/i-pray/pages/jumatano2-jioni.html",
  "/i-pray/pages/jumatano2-saa-sita.html",
  "/i-pray/pages/jumatano2.html",
  "/i-pray/pages/jumatano3-jioni.html",
  "/i-pray/pages/jumatano3-saa-sita.html",
  "/i-pray/pages/jumatano3.html",
  "/i-pray/pages/jumatano4-jioni.html",
  "/i-pray/pages/jumatano4-saa-sita.html",
  "/i-pray/pages/jumatano4.html",
  "/i-pray/pages/jumatatu1-jioni.html",
  "/i-pray/pages/jumatatu1-saa-sita.html",
  "/i-pray/pages/jumatatu1.html",
  "/i-pray/pages/jumatatu2-jioni.html",
  "/i-pray/pages/jumatatu2-saa-sita.html",
  "/i-pray/pages/jumatatu2.html",
  "/i-pray/pages/jumatatu3-jioni.html",
  "/i-pray/pages/jumatatu3-saa-sita.html",
  "/i-pray/pages/jumatatu3.html",
  "/i-pray/pages/jumatatu4-jioni.html",
  "/i-pray/pages/jumatatu4-saa-sita.html",
  "/i-pray/pages/jumatatu4.html",
  "/i-pray/pages/lauds.html",
  "/i-pray/pages/mwaka-week11.html",
  "/i-pray/pages/mwaka-week12.html",
  "/i-pray/pages/mwaka1.html",
  "/i-pray/pages/mwaka2-week11.html",
  "/i-pray/pages/mwaka2-week12.html",
  "/i-pray/pages/mwaka2-week13.html",
  "/i-pray/pages/mwaka2-week14.html",
  "/i-pray/pages/mwaka2-week15.html",
  "/i-pray/pages/mwaka2-week16.html",
  "/i-pray/pages/mwaka2-week17.html",
  "/i-pray/pages/mwaka2-week18.html",
  "/i-pray/pages/mwaka2-week19.html",
  "/i-pray/pages/mwaka2-week20.html",
  "/i-pray/pages/mwaka2.html",
  "/i-pray/pages/mwaka3-week21.html",
  "/i-pray/pages/mwaka3-week22.html",
  "/i-pray/pages/mwaka3-week23.html",
  "/i-pray/pages/mwaka3-week24.html",
  "/i-pray/pages/mwaka3-week25.html",
  "/i-pray/pages/mwaka3-week26.html",
  "/i-pray/pages/mwaka3-week27.html",
  "/i-pray/pages/mwaka3-week28.html",
  "/i-pray/pages/mwaka3-week29.html",
  "/i-pray/pages/mwaka3-week30.html",
  "/i-pray/pages/mwaka3-week31.html",
  "/i-pray/pages/mwaka3-week32.html",
  "/i-pray/pages/mwaka3-week33.html",
  "/i-pray/pages/mwaka3-week34.html",
  "/i-pray/pages/mwaka3.html",
  "/i-pray/pages/prayer-hour.html",
  "/i-pray/pages/prayer.html",
  "/i-pray/pages/sacraments.html",
  "/i-pray/pages/settings.html",
  "/i-pray/pages/via-cruce.html"
];

// Shared JS/CSS/data cached in the background too. Daily readings, months and
// "ofisi ya masomo" pages are cached at runtime the first time they are viewed.
const PRECACHE_EXTRA = [
  "/i-pray/js/daily-readings-module.js",
  "/i-pray/js/daily-readings.js",
  "/i-pray/js/fallback.js",
  "/i-pray/js/image-optimizer.js",
  "/i-pray/js/index.js",
  "/i-pray/js/liturgical-calendar.js",
  "/i-pray/js/liturgy-day-banner.js",
  "/i-pray/js/loading-states.js",
  "/i-pray/js/logo-loader.js",
  "/i-pray/js/micro-interactions.js",
  "/i-pray/js/mobile-navigation.js",
  "/i-pray/js/nav-theme.js",
  "/i-pray/js/page-transitions.js",
  "/i-pray/js/search.js",
  "/i-pray/js/settings.js",
  "/i-pray/js/translation.js",
  "/i-pray/js/masifu.js",
  "/i-pray/js/text-size-control.js",
  "/i-pray/css/fallback.css",
  "/i-pray/css/improved-nav.css",
  "/i-pray/css/index.css",
  "/i-pray/css/main.css",
  "/i-pray/css/masifu.css",
  "/i-pray/css/settings.css",
  "/i-pray/assets/css/styles.css",
  "/i-pray/dist/output.css",
  "/i-pray/data/readings.json",
  "/i-pray/data/translations.json",
  "/i-pray/data/office-readings-sw/week-1.json",
  "/i-pray/data/office-readings-sw/week-2.json",
  "/i-pray/data/office-readings-sw/week-3.json",
  "/i-pray/data/office-readings-sw/week-4.json",
  "/i-pray/data/office-readings-sw/week-5.json",
  "/i-pray/data/office-readings-sw/week-6.json",
  "/i-pray/data/office-readings-sw/week-7.json",
  "/i-pray/data/office-readings-sw/week-8.json",
  "/i-pray/data/office-readings-sw/week-9.json",
  "/i-pray/data/office-readings-sw/week-10.json",
  "/i-pray/data/office-readings-sw/week-11.json",
  "/i-pray/data/office-readings-sw/week-12.json",
  "/i-pray/data/office-readings-sw/week-13.json",
  "/i-pray/data/office-readings-sw/week-14.json",
  "/i-pray/data/office-readings-sw/week-15.json",
  "/i-pray/data/office-readings-sw/week-16.json",
  "/i-pray/data/office-readings-sw/week-17.json",
  "/i-pray/data/office-readings-sw/week-18.json",
  "/i-pray/data/office-readings-sw/week-19.json",
  "/i-pray/data/office-readings-sw/week-20.json",
  "/i-pray/data/office-readings-sw/week-21.json",
  "/i-pray/data/office-readings-sw/week-22.json",
  "/i-pray/data/office-readings-sw/week-23.json",
  "/i-pray/data/office-readings-sw/week-24.json",
  "/i-pray/data/office-readings-sw/week-25.json",
  "/i-pray/data/office-readings-sw/week-26.json",
  "/i-pray/data/office-readings-sw/week-27.json",
  "/i-pray/data/office-readings-sw/week-28.json",
  "/i-pray/data/office-readings-sw/week-29.json",
  "/i-pray/data/office-readings-sw/week-30.json",
  "/i-pray/data/office-readings-sw/week-31.json",
  "/i-pray/data/office-readings-sw/week-32.json",
  "/i-pray/data/office-readings-sw/week-33.json",
  "/i-pray/data/office-readings-sw/week-34.json",
  "/i-pray/data/office-readings-sw/index.json"
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      // Shell first: these must succeed for the app to work offline
      await cache.addAll(CRITICAL_ASSETS);
      // Then everything else, one by one, ignoring individual failures so a
      // single missing file never breaks the install
      const rest = [...PRECACHE_URLS, ...PRECACHE_EXTRA]
        .filter(url => !CRITICAL_ASSETS.includes(url));
      await Promise.allSettled(rest.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames =>
      Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// Refresh a cached entry from the network in the background.
function revalidate(request) {
  return fetch(request)
    .then(networkResponse => {
      if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, responseClone));
      }
      return networkResponse;
    });
}

self.addEventListener('fetch', event => {
  const requestURL = new URL(event.request.url);

  if (event.request.method !== 'GET' || !requestURL.protocol.startsWith('http')) {
    return;
  }

  const isNavigation = event.request.mode === 'navigate' ||
    requestURL.pathname.endsWith('.html') ||
    requestURL.pathname === '/i-pray/';

  // Stale-while-revalidate for everything, including pages: serve from cache
  // instantly for fast in-app navigation, refresh the cache in the background
  // so updates arrive on the next visit. Never-seen requests hit the network
  // and are cached for next time.
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      const networkFetch = revalidate(event.request);

      if (cachedResponse) {
        // Kick off the background refresh but don't wait for it
        networkFetch.catch(() => {/* offline: cached copy is fine */});
        return cachedResponse;
      }

      return networkFetch.catch(() => {
        if (isNavigation) {
          return caches.match('/i-pray/pages/fallback.html');
        }
        return new Response('Resource not available', { status: 404 });
      });
    })
  );
});

// ipray service worker - offline support.
// ---------------------------------------------------------------------------
// It lives at the app root (/i-pray/service-worker.js) so that its scope is
// the whole app; a worker can only control pages at or below its own folder.
//
// - Pages: network first, so a fix to a page reaches people as soon as they
//   are online; the cached copy (or pages/fallback.html) when offline.
// - Styles, scripts, data, images: served from the cache straight away and
//   refreshed in the background.
// - Fonts and icon sets from the CDNs: cached on first use.
// - Anything else from another site (Universalis proxies, the Bible API,
//   the app's Cloudflare Worker) goes straight to the network: those
//   answers change by date and the pages keep their own caches for them.
//
// PRECACHE and VERSION below are written by scripts/build-sw.js from the
// files on disk (`npm run build:generated`); don't edit them by hand.

// BEGIN GENERATED
const VERSION = '9c7e206840';
const PRECACHE = [
    '/i-pray/',
    '/i-pray/assets/images/carmen.jpg',
    '/i-pray/assets/images/favicon.ico.jpg',
    '/i-pray/assets/images/icon-192x192.png',
    '/i-pray/assets/images/icon-512x512.png',
    '/i-pray/assets/images/logo-small.jpg',
    '/i-pray/assets/images/maria-mdogo.jpg',
    '/i-pray/css/amefufuka.css',
    '/i-pray/css/index.css',
    '/i-pray/css/masifu.css',
    '/i-pray/css/prevent-zoom.css',
    '/i-pray/css/status-bar-safe-area.css',
    '/i-pray/data/office-readings-sw/index.json',
    '/i-pray/data/office-readings-sw/week-1.json',
    '/i-pray/data/office-readings-sw/week-10.json',
    '/i-pray/data/office-readings-sw/week-11.json',
    '/i-pray/data/office-readings-sw/week-12.json',
    '/i-pray/data/office-readings-sw/week-13.json',
    '/i-pray/data/office-readings-sw/week-14.json',
    '/i-pray/data/office-readings-sw/week-15.json',
    '/i-pray/data/office-readings-sw/week-16.json',
    '/i-pray/data/office-readings-sw/week-17.json',
    '/i-pray/data/office-readings-sw/week-18.json',
    '/i-pray/data/office-readings-sw/week-19.json',
    '/i-pray/data/office-readings-sw/week-2.json',
    '/i-pray/data/office-readings-sw/week-20.json',
    '/i-pray/data/office-readings-sw/week-21.json',
    '/i-pray/data/office-readings-sw/week-22.json',
    '/i-pray/data/office-readings-sw/week-23.json',
    '/i-pray/data/office-readings-sw/week-24.json',
    '/i-pray/data/office-readings-sw/week-25.json',
    '/i-pray/data/office-readings-sw/week-26.json',
    '/i-pray/data/office-readings-sw/week-27.json',
    '/i-pray/data/office-readings-sw/week-28.json',
    '/i-pray/data/office-readings-sw/week-29.json',
    '/i-pray/data/office-readings-sw/week-3.json',
    '/i-pray/data/office-readings-sw/week-30.json',
    '/i-pray/data/office-readings-sw/week-31.json',
    '/i-pray/data/office-readings-sw/week-32.json',
    '/i-pray/data/office-readings-sw/week-33.json',
    '/i-pray/data/office-readings-sw/week-34.json',
    '/i-pray/data/office-readings-sw/week-4.json',
    '/i-pray/data/office-readings-sw/week-5.json',
    '/i-pray/data/office-readings-sw/week-6.json',
    '/i-pray/data/office-readings-sw/week-7.json',
    '/i-pray/data/office-readings-sw/week-8.json',
    '/i-pray/data/office-readings-sw/week-9.json',
    '/i-pray/data/readings.json',
    '/i-pray/data/translations.json',
    '/i-pray/dist/output.css',
    '/i-pray/index.html',
    '/i-pray/js/amefufuka.js',
    '/i-pray/js/bibilia-reader.js',
    '/i-pray/js/daily-readings-module.js',
    '/i-pray/js/daily-readings.js',
    '/i-pray/js/image-optimizer.js',
    '/i-pray/js/index.js',
    '/i-pray/js/liturgical-calendar.js',
    '/i-pray/js/loading-states.js',
    '/i-pray/js/logo-loader.js',
    '/i-pray/js/masifu.js',
    '/i-pray/js/micro-interactions.js',
    '/i-pray/js/mobile-navigation.js',
    '/i-pray/js/nav-theme.js',
    '/i-pray/js/ofisi-readings-dropdown.js',
    '/i-pray/js/prayers-nav.js',
    '/i-pray/js/prevent-zoom.js',
    '/i-pray/js/settings.js',
    '/i-pray/js/sikukuu.js',
    '/i-pray/js/somo-la-kwanza-bible.js',
    '/i-pray/js/status-bar.js',
    '/i-pray/js/text-size-control.js',
    '/i-pray/js/text-size.js',
    '/i-pray/js/theme.js',
    '/i-pray/js/universalis-office.js',
    '/i-pray/manifest.json',
    '/i-pray/pages/alhamisi1.html',
    '/i-pray/pages/alhamisi2.html',
    '/i-pray/pages/alhamisi3.html',
    '/i-pray/pages/alhamisi4.html',
    '/i-pray/pages/amefufuka.html',
    '/i-pray/pages/antifona.html',
    '/i-pray/pages/bibilia-reader.html',
    '/i-pray/pages/calendar.html',
    '/i-pray/pages/carmen.html',
    '/i-pray/pages/compline.html',
    '/i-pray/pages/daily-readings.html',
    '/i-pray/pages/fallback.html',
    '/i-pray/pages/holy-rosary.html',
    '/i-pray/pages/ijumaa1.html',
    '/i-pray/pages/ijumaa2.html',
    '/i-pray/pages/ijumaa3.html',
    '/i-pray/pages/ijumaa4.html',
    '/i-pray/pages/jumamosi1.html',
    '/i-pray/pages/jumamosi2.html',
    '/i-pray/pages/jumamosi3.html',
    '/i-pray/pages/jumamosi4.html',
    '/i-pray/pages/jumanne1.html',
    '/i-pray/pages/jumanne2.html',
    '/i-pray/pages/jumanne3.html',
    '/i-pray/pages/jumanne4.html',
    '/i-pray/pages/jumapili1.html',
    '/i-pray/pages/jumapili2.html',
    '/i-pray/pages/jumapili3.html',
    '/i-pray/pages/jumapili4.html',
    '/i-pray/pages/jumatano1.html',
    '/i-pray/pages/jumatano2.html',
    '/i-pray/pages/jumatano3.html',
    '/i-pray/pages/jumatano4.html',
    '/i-pray/pages/jumatatu1.html',
    '/i-pray/pages/jumatatu2.html',
    '/i-pray/pages/jumatatu3.html',
    '/i-pray/pages/jumatatu4.html',
    '/i-pray/pages/masifu-asubuhi.html',
    '/i-pray/pages/office-of-readings.html',
    '/i-pray/pages/prayer-hour.html',
    '/i-pray/pages/sacraments.html',
    '/i-pray/pages/settings.html',
    '/i-pray/pages/via-cruce.html'
];
// END GENERATED

const BASE = '/i-pray/';
const SHELL_CACHE = 'ipray-shell-' + VERSION;
// Pages and files picked up while browsing, and what "Save for offline"
// stores. Not versioned, so a new release doesn't throw it away.
const RUNTIME_CACHE = 'ipray-runtime';
const OFFLINE_PAGE = BASE + 'pages/fallback.html';
const CDN_HOSTS = ['fonts.googleapis.com', 'fonts.gstatic.com', 'cdnjs.cloudflare.com', 'cdn.jsdelivr.net', 'unpkg.com'];

self.addEventListener('install', (event) => {
    event.waitUntil((async () => {
        const cache = await caches.open(SHELL_CACHE);
        // One request per file, so a single missing file can't fail the
        // whole install (cache.addAll is all-or-nothing).
        await Promise.allSettled(PRECACHE.map((url) => cache.add(new Request(url, { cache: 'reload' }))));
        await self.skipWaiting();
    })());
});

self.addEventListener('activate', (event) => {
    event.waitUntil((async () => {
        const keep = [SHELL_CACHE, RUNTIME_CACHE];
        const names = await caches.keys();
        await Promise.all(names
            .filter((name) => name.indexOf('ipray-') === 0 && keep.indexOf(name) === -1)
            .map((name) => caches.delete(name)));
        await self.clients.claim();
    })());
});

function isCacheable(response) {
    return response && response.ok && response.status !== 206;
}

async function putRuntime(request, response) {
    const cache = await caches.open(RUNTIME_CACHE);
    await cache.put(request, response);
}

async function networkFirstPage(request) {
    try {
        const response = await fetch(request);
        if (isCacheable(response)) putRuntime(request, response.clone());
        return response;
    } catch (e) {
        // prayer-hour.html?hour=vespers is the same file as
        // prayer-hour.html, so the query is ignored as a second try.
        return (await caches.match(request))
            || (await caches.match(request, { ignoreSearch: true }))
            || (await caches.match(OFFLINE_PAGE))
            || new Response('Offline', { status: 503, headers: { 'Content-Type': 'text/plain' } });
    }
}

async function staleWhileRevalidate(event) {
    const request = event.request;
    const cached = await caches.match(request);
    const refresh = fetch(request).then((response) => {
        if (isCacheable(response)) putRuntime(request, response.clone());
        return response;
    });
    if (cached) {
        event.waitUntil(refresh.catch(() => {}));
        return cached;
    }
    return refresh;
}

async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    // Cross-origin font and stylesheet responses can be opaque; they are
    // still worth keeping for offline use.
    if (response && (response.ok || response.type === 'opaque')) putRuntime(request, response.clone());
    return response;
}

self.addEventListener('fetch', (event) => {
    const request = event.request;
    if (request.method !== 'GET' || request.headers.has('range')) return;
    const url = new URL(request.url);

    if (url.origin === self.location.origin) {
        if (url.pathname.indexOf(BASE) !== 0) return;
        if (request.mode === 'navigate') {
            event.respondWith(networkFirstPage(request));
        } else {
            event.respondWith(staleWhileRevalidate(event));
        }
        return;
    }

    if (CDN_HOSTS.indexOf(url.hostname) !== -1) {
        event.respondWith(cacheFirst(request));
    }
    // Everything else: not intercepted.
});

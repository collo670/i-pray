const CACHE_NAME = 'ipray-v202607111000';
// Define critical assets that should be cached immediately for faster initial load
const CRITICAL_ASSETS = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/js/index.js',
  '/i-pray/js/logo-loader.js',
  '/i-pray/css/index.css',
  '/i-pray/manifest.json',
  '/i-pray/js/translation.js',
  '/i-pray/assets/css/styles.css',
  '/i-pray/assets/images/icon-192x192.png',
  '/i-pray/assets/images/icon-512x512.png',
  '/i-pray/assets/images/maria mdogo.png',
  '/i-pray/pages/fallback.html'
];

// Define all assets that should be cached
const urlsToCache = [
  '/i-pray/',
  '/i-pray/index.html',
  '/i-pray/pages/alhamisi1.html',
  '/i-pray/pages/alhamisi2.html',
  '/i-pray/pages/alhamisi3.html',
  '/i-pray/pages/alhamisi4.html',
  '/i-pray/pages/amefufuka.html',
  '/i-pray/pages/antifona.html',
  '/i-pray/pages/calendar.html',
  '/i-pray/pages/carmen.html',
  '/i-pray/pages/fallback.html',
  '/i-pray/pages/holy-rosary.html',
  '/i-pray/pages/ijumaa1.html',
  '/i-pray/pages/ijumaa2.html',
  '/i-pray/pages/ijumaa3.html',
  '/i-pray/pages/ijumaa4.html',
  '/i-pray/index.html',
  '/i-pray/pages/jumamosi1.html',
  '/i-pray/pages/jumamosi2.html',
  '/i-pray/pages/jumamosi3.html',
  '/i-pray/pages/jumamosi4.html',
  '/i-pray/pages/jumanne1.html',
  '/i-pray/pages/jumanne2.html',
  '/i-pray/pages/jumanne3.html',
  '/i-pray/pages/jumanne4.html',
  '/i-pray/pages/dominika1.html',
  '/i-pray/pages/dominika2.html',
  '/i-pray/pages/dominika3.html',
  '/i-pray/pages/dominika4.html',
  '/i-pray/pages/jumatano1.html',
  '/i-pray/pages/jumatano2.html',
  '/i-pray/pages/jumatano3.html',
  '/i-pray/pages/jumatano4.html',
  '/i-pray/pages/jumatatu1.html',
  '/i-pray/pages/jumatatu2.html',
  '/i-pray/pages/jumatatu3.html',
  '/i-pray/pages/jumatatu4.html',
  '/i-pray/pages/lauds.html',
  '/i-pray/css/main.css',
  '/i-pray/manifest.json',
  '/i-pray/pages/mwaka-week11.html',
  '/i-pray/pages/mwaka-week12.html',
  '/i-pray/pages/mwaka1.html',
  '/i-pray/pages/mwaka2-week11.html',
  '/i-pray/pages/mwaka2-week12.html',
  '/i-pray/pages/mwaka2-week13.html',
  '/i-pray/pages/mwaka2-week14.html',
  '/i-pray/pages/mwaka2-week15.html',
  '/i-pray/pages/mwaka2-week16.html',
  '/i-pray/pages/mwaka2-week17.html',
  '/i-pray/pages/mwaka2-week18.html',
  '/i-pray/pages/mwaka2-week19.html',
  '/i-pray/pages/mwaka2-week20.html',
  '/i-pray/pages/mwaka2.html',
  '/i-pray/pages/mwaka3-week21.html',
  '/i-pray/pages/mwaka3-week22.html',
  '/i-pray/pages/mwaka3-week23.html',
  '/i-pray/pages/mwaka3-week24.html',
  '/i-pray/pages/mwaka3-week25.html',
  '/i-pray/pages/mwaka3-week26.html',
  '/i-pray/pages/mwaka3-week27.html',
  '/i-pray/pages/mwaka3-week28.html',
  '/i-pray/pages/mwaka3-week29.html',
  '/i-pray/pages/mwaka3-week30.html',
  '/i-pray/pages/mwaka3-week31.html',
  '/i-pray/pages/mwaka3-week32.html',
  '/i-pray/pages/mwaka3-week33.html',
  '/i-pray/pages/mwaka3-week34.html',
  '/i-pray/pages/mwaka3.html',
  '/i-pray/docs/MwakaSehemu2.txt',
  '/i-pray/package-lock.json',
  '/i-pray/package.json',
  '/i-pray/postcss.config.js',
  '/i-pray/pages/prayer.html',
  '/i-pray/pages/sacraments.html',
  '/i-pray/js/service-worker.js',
  '/i-pray/js/logo-loader.js',
  '/i-pray/pages/settings.html',
  '/i-pray/tailwind.config.js',
  '/i-pray/assets/months/august/10aug.html',
  '/i-pray/assets/months/august/11aug.html',
  '/i-pray/assets/months/august/12aug.html',
  '/i-pray/assets/months/august/13aug.html',
  '/i-pray/assets/months/august/14aug.html',
  '/i-pray/assets/months/august/15aug.html',
  '/i-pray/assets/months/august/16aug.html',
  '/i-pray/assets/months/august/17aug.html',
  '/i-pray/assets/months/august/18aug.html',
  '/i-pray/assets/months/august/19aug.html',
  '/i-pray/assets/months/august/1aug.html',
  '/i-pray/assets/months/august/20aug.html',
  '/i-pray/assets/months/august/21aug.html',
  '/i-pray/assets/months/august/22aug.html',
  '/i-pray/assets/months/august/23aug.html',
  '/i-pray/assets/months/august/24aug.html',
  '/i-pray/assets/months/august/25aug.html',
  '/i-pray/assets/months/august/26aug.html',
  '/i-pray/assets/months/august/27aug.html',
  '/i-pray/assets/months/august/28aug.html',
  '/i-pray/assets/months/august/29aug.html',
  '/i-pray/assets/months/august/2aug.html',
  '/i-pray/assets/months/august/30aug.html',
  '/i-pray/assets/months/august/31aug.html',
  '/i-pray/assets/months/august/3aug.html',
  '/i-pray/assets/months/august/4aug.html',
  '/i-pray/assets/months/august/5aug.html',
  '/i-pray/assets/months/august/6aug.html',
  '/i-pray/assets/months/august/7aug.html',
  '/i-pray/assets/months/august/8aug.html',
  '/i-pray/assets/months/august/9aug.html',
  '/i-pray/assets/css/styles.css',
  '/i-pray/assets/icons/icon-144x144.png',
  '/i-pray/assets/icons/icon-192x192.png',
  '/i-pray/assets/icons/icon-512x512.png',
  '/i-pray/assets/icons/icon-72x72.png',
  '/i-pray/assets/icons/icon-96x96.png',
  '/i-pray/assets/icons/icons.json',
  '/i-pray/assets/icons/android/android-launchericon-48-48.png',
  '/i-pray/assets/icons/ios/100.png',
  '/i-pray/assets/icons/ios/1024.png',
  '/i-pray/assets/icons/ios/114.png',
  '/i-pray/assets/icons/ios/120.png',
  '/i-pray/assets/icons/ios/128.png',
  '/i-pray/assets/icons/ios/144.png',
  '/i-pray/assets/icons/ios/152.png',
  '/i-pray/assets/icons/ios/16.png',
  '/i-pray/assets/icons/ios/167.png',
  '/i-pray/assets/icons/ios/180.png',
  '/i-pray/assets/icons/ios/192.png',
  '/i-pray/assets/icons/ios/20.png',
  '/i-pray/assets/icons/ios/256.png',
  '/i-pray/assets/icons/ios/29.png',
  '/i-pray/assets/icons/ios/32.png',
  '/i-pray/assets/icons/ios/40.png',
  '/i-pray/assets/icons/ios/50.png',
  '/i-pray/assets/icons/ios/512.png',
  '/i-pray/assets/icons/ios/57.png',
  '/i-pray/assets/icons/ios/58.png',
  '/i-pray/assets/icons/ios/60.png',
  '/i-pray/assets/icons/ios/64.png',
  '/i-pray/assets/icons/ios/72.png',
  '/i-pray/assets/icons/ios/76.png',
  '/i-pray/assets/icons/ios/80.png',
  '/i-pray/assets/icons/ios/87.png',
  '/i-pray/assets/icons/windows11/LargeTile.scale-100.png',
  '/i-pray/assets/icons/windows11/LargeTile.scale-125.png',
  '/i-pray/assets/icons/windows11/LargeTile.scale-150.png',
  '/i-pray/assets/icons/windows11/LargeTile.scale-200.png',
  '/i-pray/assets/icons/windows11/LargeTile.scale-400.png',
  '/i-pray/assets/icons/windows11/SmallTile.scale-100.png',
  '/i-pray/assets/icons/windows11/SmallTile.scale-125.png',
  '/i-pray/assets/icons/windows11/SmallTile.scale-150.png',
  '/i-pray/assets/icons/windows11/SmallTile.scale-200.png',
  '/i-pray/assets/icons/windows11/SmallTile.scale-400.png',
  '/i-pray/assets/icons/windows11/SplashScreen.scale-100.png',
  '/i-pray/assets/icons/windows11/SplashScreen.scale-125.png',
  '/i-pray/assets/icons/windows11/SplashScreen.scale-150.png',
  '/i-pray/assets/icons/windows11/SplashScreen.scale-200.png',
  '/i-pray/assets/icons/windows11/SplashScreen.scale-400.png',
  '/i-pray/assets/icons/windows11/Square150x150Logo.scale-100.png',
  '/i-pray/assets/icons/windows11/Square150x150Logo.scale-125.png',
  '/i-pray/assets/icons/windows11/Square150x150Logo.scale-150.png',
  '/i-pray/assets/icons/windows11/Square150x150Logo.scale-200.png',
  '/i-pray/assets/icons/windows11/Square150x150Logo.scale-400.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-16.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-20.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-24.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-256.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-30.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-32.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-36.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-40.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-44.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-48.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-60.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-64.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-72.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-80.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-lightunplated_targetsize-96.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-16.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-20.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-24.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-256.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-30.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-32.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-36.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-40.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-44.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-48.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-60.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-64.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-72.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-80.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.altform-unplated_targetsize-96.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.scale-100.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.scale-125.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.scale-150.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.scale-200.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.scale-400.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-16.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-20.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-24.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-256.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-30.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-32.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-36.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-40.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-44.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-48.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-60.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-64.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-72.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-80.png',
  '/i-pray/assets/icons/windows11/Square44x44Logo.targetsize-96.png',
  '/i-pray/assets/icons/windows11/StoreLogo.scale-100.png',
  '/i-pray/assets/icons/windows11/StoreLogo.scale-125.png',
  '/i-pray/assets/icons/windows11/StoreLogo.scale-150.png',
  '/i-pray/assets/icons/windows11/StoreLogo.scale-200.png',
  '/i-pray/assets/icons/windows11/StoreLogo.scale-400.png',
  '/i-pray/assets/icons/windows11/Wide310x150Logo.scale-100.png',
  '/i-pray/assets/icons/windows11/Wide310x150Logo.scale-125.png',
  '/i-pray/assets/icons/windows11/Wide310x150Logo.scale-150.png',
  '/i-pray/assets/icons/windows11/Wide310x150Logo.scale-200.png',
  '/i-pray/assets/icons/windows11/Wide310x150Logo.scale-400.png',
  '/i-pray/assets/images/bikira maria.jpg',
  '/i-pray/assets/images/bikira wa pentekoste.jpg',
  '/i-pray/assets/images/Camino_Neocatecumenal_Carmen_Hernandez-OG.jpg',
  '/i-pray/assets/images/Carmen baracas.jpg',
  '/i-pray/assets/images/carmen-hernandez- grave.jpg',
  '/i-pray/assets/images/carmen-hernandez-camino.jpg',
  '/i-pray/assets/images/carmen.jpg',
  '/i-pray/assets/images/Carmen_Casimiro_Morcillo_Barracas_Madrid.jpg',
  '/i-pray/assets/images/familia takatifu.jpg',
  '/i-pray/assets/images/favicon.ico.jpg',
  '/i-pray/assets/images/icon-192x192.png',
  '/i-pray/assets/images/icon-512x512.png',
  '/i-pray/assets/images/maria mdogo.png',
  '/i-pray/assets/images/unsplash-photo-1.jpg',
  '/i-pray/assets/images/unsplash-photo-2.jpg',
  '/i-pray/assets/months/july/31jul.html',
  '/i-pray/assets/months/october/23 oct.html',
  '/i-pray/assets/months/october/24 oct.html',
  '/i-pray/assets/months/october/25 oct.html',
  '/i-pray/assets/months/october/26 oct.html',
  '/i-pray/assets/months/october/27 oct.html',
  '/i-pray/assets/months/october/28 oct.html',
  '/i-pray/assets/months/october/29 oct.html',
  '/i-pray/assets/months/october/30 oct.html',
  '/i-pray/assets/months/october/31 oct.html',
  '/i-pray/assets/readings/fri18.html',
  '/i-pray/assets/readings/fri19.html',
  '/i-pray/assets/readings/fri20.html',
  '/i-pray/assets/readings/fri21.html',
  '/i-pray/assets/readings/fri22.html',
  '/i-pray/assets/readings/mon18.html',
  '/i-pray/assets/readings/mon19.html',
  '/i-pray/assets/readings/mon20.html',
  '/i-pray/assets/readings/mon21.html',
  '/i-pray/assets/readings/mon22.html',
  '/i-pray/assets/readings/sat18.html',
  '/i-pray/assets/readings/sat19.html',
  '/i-pray/assets/readings/sat20.html',
  '/i-pray/assets/readings/sat21.html',
  '/i-pray/assets/readings/sun18.html',
  '/i-pray/assets/readings/sun19.html',
  '/i-pray/assets/readings/sun21.html',
  '/i-pray/assets/readings/sun22.html',
  '/i-pray/assets/readings/thur18.html',
  '/i-pray/assets/readings/thur19.html',
  '/i-pray/assets/readings/thur21.html',
  '/i-pray/assets/readings/thur22.html',
  '/i-pray/assets/readings/tue18.html',
  '/i-pray/assets/readings/tue19.html',
  '/i-pray/assets/readings/tue20.html',
  '/i-pray/assets/readings/tue21.html',
  '/i-pray/assets/readings/tue22.html',
  '/i-pray/assets/readings/wed 20.html',
  '/i-pray/assets/readings/wed18.html',
  '/i-pray/assets/readings/wed19.html',
  '/i-pray/assets/readings/wed21.html',
  '/i-pray/assets/readings/wed22.html',
  '/i-pray/assets/readings/office/Mass-Readings-August-2025-PDF-Download.pdf',
  '/i-pray/assets/readings/office/Mass-Readings-December-2025-PDF-Download.pdf',
  '/i-pray/assets/readings/office/Mass-Readings-November-2025-PDF-Download.pdf',
  '/i-pray/assets/readings/office/Mass-Readings-October-2025-PDF-Download.pdf',
  '/i-pray/assets/readings/office/Mass-Readings-September-2025-PDF-Download.pdf',
  '/i-pray/assets/months/september/10sep.html',
  '/i-pray/assets/months/september/11sep.html',
  '/i-pray/assets/months/september/12sep.html',
  '/i-pray/assets/months/september/13sep.html',
  '/i-pray/assets/months/september/14sep.html',
  '/i-pray/assets/months/september/15sep.html',
  '/i-pray/assets/months/september/16sep.html',
  '/i-pray/assets/months/september/17sep.html',
  '/i-pray/assets/months/september/18sep.html',
  '/i-pray/assets/months/september/19sep.html',
  '/i-pray/assets/months/september/1sep.html',
  '/i-pray/assets/months/september/20sep.html',
  '/i-pray/assets/months/september/21sep.html',
  '/i-pray/assets/months/september/22sep.html',
  '/i-pray/assets/months/september/23sep.html',
  '/i-pray/assets/months/september/24sep.html',
  '/i-pray/assets/months/september/25sep.html',
  '/i-pray/assets/months/september/26sep.html',
  '/i-pray/assets/months/september/27sep.html',
  '/i-pray/assets/months/september/28sep.html',
  '/i-pray/assets/months/september/29sep.html',
  '/i-pray/assets/months/september/2sep.html',
  '/i-pray/assets/months/september/30sep.html',
  '/i-pray/assets/months/september/3sep.html',
  '/i-pray/assets/months/september/4sep.html',
  '/i-pray/assets/months/september/5sep.html',
  '/i-pray/assets/months/september/6sep.html',
  '/i-pray/assets/months/september/7sep.html',
  '/i-pray/assets/months/september/8sep.html',
  '/i-pray/assets/months/september/9sep.html',
  '/i-pray/docs/pdfs/advent 1.pdf',
  '/i-pray/docs/pdfs/advent 2.pdf',
  '/i-pray/docs/pdfs/advent 3.pdf',
  '/i-pray/docs/pdfs/advent 4.pdf',
  '/i-pray/docs/pdfs/amefufuka.pdf',
  '/i-pray/docs/pdfs/christmas.pdf',
  '/i-pray/docs/pdfs/comon saints.pdf',
  '/i-pray/docs/pdfs/easter 1.pdf',
  '/i-pray/docs/pdfs/easter 2.pdf',
  '/i-pray/docs/pdfs/easter 3.pdf',
  '/i-pray/docs/pdfs/easter 4.pdf',
  '/i-pray/docs/pdfs/easter 5.pdf',
  '/i-pray/docs/pdfs/easter 6.pdf',
  '/i-pray/docs/pdfs/easter 7.pdf',
  '/i-pray/docs/pdfs/lent 1.pdf',
  '/i-pray/docs/pdfs/lent 2.pdf',
  '/i-pray/docs/pdfs/lent 3.pdf',
  '/i-pray/docs/pdfs/lent 4.pdf',
  '/i-pray/docs/pdfs/lent 5.pdf',
  '/i-pray/docs/pdfs/lent 6.pdf',
  '/i-pray/docs/pdfs/lent.pdf',
  '/i-pray/docs/pdfs/MajilioNaNoeli.pdf',
  '/i-pray/docs/pdfs/MasifuYaAsubuhi.pdf',
  '/i-pray/docs/pdfs/MwakaSehemu1.pdf',
  '/i-pray/docs/pdfs/MwakaSehemu2.pdf',
  '/i-pray/docs/pdfs/MwakaSehemu3.pdf',
  '/i-pray/docs/pdfs/noel 1.pdf',
  '/i-pray/docs/pdfs/noel 2.pdf',
  '/i-pray/docs/pdfs/noel 3.pdf',
  '/i-pray/docs/pdfs/ordinary 1.pdf',
  '/i-pray/docs/pdfs/ordinary 10.pdf',
  '/i-pray/docs/pdfs/ordinary 11.pdf',
  '/i-pray/docs/pdfs/ordinary 12.pdf',
  '/i-pray/docs/pdfs/ordinary 2.pdf',
  '/i-pray/docs/pdfs/ordinary 24.pdf',
  '/i-pray/docs/pdfs/ordinary 25.pdf',
  '/i-pray/docs/pdfs/ordinary 26.pdf',
  '/i-pray/docs/pdfs/ordinary 27.pdf',
  '/i-pray/docs/pdfs/ordinary 28.pdf',
  '/i-pray/docs/pdfs/ordinary 29.pdf',
  '/i-pray/docs/pdfs/ordinary 3.pdf',
  '/i-pray/docs/pdfs/ordinary 30.pdf',
  '/i-pray/docs/pdfs/ordinary 31.pdf',
  '/i-pray/docs/pdfs/ordinary 32.pdf',
  '/i-pray/docs/pdfs/ordinary 33.pdf',
  '/i-pray/docs/pdfs/ordinary 4.pdf',
  '/i-pray/docs/pdfs/ordinary 5.pdf',
  '/i-pray/docs/pdfs/ordinary 6.pdf',
  '/i-pray/docs/pdfs/ordinary 7.pdf',
  '/i-pray/docs/pdfs/ordinary 8.pdf',
  '/i-pray/docs/pdfs/ordinary 9.pdf',
  '/i-pray/docs/pdfs/pentecost.pdf',
  '/i-pray/docs/pdfs/saints feb.pdf',
  '/i-pray/docs/pdfs/saints jan.pdf',
  '/i-pray/docs/pdfs/saints jun.pdf',
  '/i-pray/docs/pdfs/solemnities.pdf',
  '/i-pray/docs/pdfs/tinywow_V5034W_80795109.pdf',
  '/i-pray/scripts/dump-mwaka2-text.js',
  '/i-pray/scripts/generate-mwaka2-weeks.js',
  '/i-pray/src/input.css',
  '/i-pray/src/output.css'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        // First cache critical assets for immediate app functionality
        return cache.addAll(CRITICAL_ASSETS)
          .then(() => {
            // Then cache all other assets in the background
            // This ensures the app loads quickly while still caching everything
            return cache.addAll(urlsToCache.filter(url => !CRITICAL_ASSETS.includes(url)));
          });
      })
  );
  // Skip waiting to activate the new service worker immediately
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
  // Apply different strategies based on request type
  const requestURL = new URL(event.request.url);
  
  // Skip non-GET requests and non-HTTP/HTTPS requests
  if (event.request.method !== 'GET' || 
      !requestURL.protocol.startsWith('http')) {
    return;
  }
  
  // For API requests or external resources, use network first
  if (!requestURL.pathname.startsWith('/i-pray/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match(event.request))
    );
    return;
  }
  
  // For HTML files, use network first with cache fallback
  if (requestURL.pathname.endsWith('.html') || 
      requestURL.pathname === '/i-pray/' || 
      event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          return caches.match(event.request)
            .then(cachedResponse => {
              return cachedResponse || caches.match('/i-pray/pages/fallback.html');
            });
        })
    );
    return;
  }
  
  // For images, CSS, JS, and other static assets, use cache first with network fallback
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          // Fetch from network in the background to update cache
          fetch(event.request)
            .then(networkResponse => {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, networkResponse.clone());
              });
            })
            .catch(() => {/* Ignore network errors */});
          
          return cachedResponse;
        }
        
        // If not in cache, fetch from network
        return fetch(event.request)
          .then(networkResponse => {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, responseClone);
            });
            return networkResponse;
          })
          .catch(() => {
            // For images, return a placeholder if available
            if (event.request.destination === 'image') {
              return caches.match('/i-pray/assets/images/placeholder.png')
                .catch(() => new Response('Image not available', { status: 404 }));
            }
            
            // For other resources, just fail
            return new Response('Resource not available', { status: 404 });
          });
      })
  );
});

// "Save this week for offline use" (Settings > Offline).
// ---------------------------------------------------------------------------
// Saves what the next seven days of prayer need, so they can be prayed with
// no connection:
//  - the prayer pages, including the right Masifu ya Asubuhi page for each
//    day (by psalter week), into the service worker's cache;
//  - Midday Prayer, Vespers and the English Office of Readings for each day,
//    fetched from Universalis and kept where the office pages look for them
//    (localStorage, via UniversalisOffice.saveOffice).
// They are kept, in a cache of their own that the service worker leaves
// alone, for one week; js/prayer-day.js deletes them after that and lets the
// user pick which of the seven days the app shows.
// Needs js/liturgical-calendar.js, js/universalis-office.js and
// js/prayer-day.js on the page.
(function () {
    'use strict';

    var DAYS = 7;
    var HOURS = ['sext', 'vespers', 'readings'];
    var DAY_PREFIX = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
    var PAGES = [
        'index.html',
        'pages/masifu-asubuhi.html',
        'pages/office-of-readings.html',
        'pages/prayer-hour.html',
        'pages/compline.html',
        'pages/daily-readings.html',
        'pages/holy-rosary.html',
        'pages/via-cruce.html',
        'pages/calendar.html'
    ];

    var ROOT = (function () {
        var s = document.currentScript || document.querySelector('script[src*="js/offline-week.js"]');
        return s ? s.src.replace(/js\/offline-week\.js.*$/, '') : location.origin + '/i-pray/';
    })();

    function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
    function stampOf(d) {
        return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }

    // Same rule as pages/masifu-asubuhi.html: the liturgical psalter week,
    // or the rolling four-week cycle on the few days it isn't numbered.
    function psalterWeek(date) {
        var week = null;
        try { week = getLiturgicalToday(date).psalterWeek; } catch (e) {}
        if (week) return week;
        var sunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay());
        var weeks = Math.floor((sunday - new Date(2025, 9, 19)) / (7 * 24 * 60 * 60 * 1000));
        return ((weeks % 4) + 4) % 4 + 1;
    }

    function pagesFor(start) {
        var pages = PAGES.slice();
        for (var i = 0; i < DAYS; i++) {
            var day = addDays(start, i);
            var page = 'pages/' + DAY_PREFIX[day.getDay()] + psalterWeek(day) + '.html';
            if (pages.indexOf(page) === -1) pages.push(page);
        }
        return pages;
    }

    /**
     * Saves the coming week. onProgress(done, total) is called as it goes.
     * Resolves to { pages, offices, failed }.
     */
    function saveWeek(onProgress) {
        var start = new Date();
        start = new Date(start.getFullYear(), start.getMonth(), start.getDate());
        var pages = pagesFor(start);
        var offices = [];
        for (var i = 0; i < DAYS; i++) {
            HOURS.forEach(function (h) { offices.push({ stamp: stampOf(addDays(start, i)), hour: h }); });
        }
        var total = pages.length + offices.length;
        var done = 0, failed = 0, savedPages = 0, savedOffices = 0;
        var tick = function () { done++; if (onProgress) onProgress(done, total); };

        // Ask the browser not to clear what is saved when space runs low
        if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(function () {});
        var cacheReady = 'caches' in window ? caches.open(IPrayDay.CACHE) : Promise.resolve(null);
        return cacheReady.then(function (cache) {
            return pages.reduce(function (chain, page) {
                return chain.then(function () {
                    return fetch(ROOT + page, { cache: 'reload' })
                        .then(function (r) {
                            if (!r.ok) throw new Error('HTTP ' + r.status);
                            savedPages++;
                            return cache ? cache.put(ROOT + page, r) : null;
                        })
                        .catch(function () { failed++; })
                        .then(tick);
                });
            }, Promise.resolve());
        }).then(function () {
            return offices.reduce(function (chain, o) {
                return chain.then(function () {
                    return UniversalisOffice.saveOffice(o.stamp, o.hour)
                        .then(function (ok) { if (ok) savedOffices++; else failed++; })
                        .then(tick);
                });
            }, Promise.resolve());
        }).then(function () {
            if (savedPages || savedOffices) IPrayDay.saveWeek(start);
            return { pages: savedPages, offices: savedOffices, failed: failed };
        });
    }

    window.IPrayOffline = { saveWeek: saveWeek, pagesFor: pagesFor };
})();

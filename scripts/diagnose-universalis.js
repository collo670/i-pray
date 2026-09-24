/*
 * diagnose-universalis.js
 * ---------------------------------------------------------------------------
 * Paste this whole file into the browser console while an iPray office page
 * (pages/office-of-readings.html or pages/prayer-hour.html) is open, then:
 *
 *     ipraydiag()                 // today, all three hours
 *     ipraydiag('20260915')       // a specific date
 *     ipraydiag(null, 'vespers')  // one hour only
 *
 * It fetches each hour through the same proxy chain the app uses, runs the
 * real extractor over the response, and prints what survived each step. Use
 * it when an hour reports that it loaded nothing: the log says whether the
 * fetch failed, the container was not found, or a tidying step threw the
 * office away.
 *
 * It also stashes the raw HTML on window.__ipraydiag so a failing page can be
 * copied out (copy(__ipraydiag.vespers.html)) and turned into a test fixture.
 */
(function () {
    'use strict';

    var PROXIES = [
        function (u) { return 'https://corsproxy.io/?url=' + encodeURIComponent(u); },
        function (u) { return 'https://api.cors.lol/?url=' + encodeURIComponent(u); },
        function (u) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(u); }
    ];

    var HOUR_PAGES = { readings: 'readings', sext: 'sext', vespers: 'vespers' };

    function stampToday() {
        var d = new Date();
        return d.getFullYear() +
            String(d.getMonth() + 1).padStart(2, '0') +
            String(d.getDate()).padStart(2, '0');
    }

    function fetchAny(url) {
        var i = 0;
        return new Promise(function (resolve) {
            (function next() {
                if (i >= PROXIES.length) { resolve({ ok: false, via: null, text: '' }); return; }
                var via = PROXIES[i++];
                fetch(via(url))
                    .then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.text(); })
                    .then(function (t) { resolve({ ok: true, via: via(url).split('?')[0], text: t }); })
                    .catch(next);
            })();
        });
    }

    window.ipraydiag = function (stamp, onlyHour) {
        if (!window.UniversalisOffice || !window.UniversalisOffice.diagnose) {
            console.error('[iPray] js/universalis-office.js is not loaded on this page ' +
                '(or is an older build without diagnose()).');
            return;
        }
        stamp = stamp || stampToday();
        var hours = onlyHour ? [onlyHour] : Object.keys(HOUR_PAGES);
        window.__ipraydiag = window.__ipraydiag || {};

        console.log('[iPray] extractor v' + window.UniversalisOffice.VERSION + ', date ' + stamp);

        return hours.reduce(function (chain, hour) {
            return chain.then(function () {
                var url = 'https://universalis.com/' + stamp + '/' + HOUR_PAGES[hour] + '.htm';
                return fetchAny(url).then(function (res) {
                    console.group('%c' + hour, 'font-weight:bold');
                    console.log('url:', url);

                    if (!res.ok) {
                        console.error('every proxy failed - this is a network/proxy problem, ' +
                            'not an extraction one.');
                        console.groupEnd();
                        return;
                    }
                    console.log('fetched', res.text.length, 'bytes via', res.via);

                    var d = window.UniversalisOffice.diagnose(res.text, hour);
                    window.__ipraydiag[hour] = { html: res.text, diagnosis: d };

                    d.log.forEach(function (line) { console.log('  ' + line); });
                    if (d.ok && d.lines > 0) {
                        console.log('%cOK - ' + d.lines + ' prayer lines rendered',
                            'color:#15803d;font-weight:bold');
                    } else {
                        console.error('FAILED - nothing extractable. Raw HTML is at ' +
                            '__ipraydiag.' + hour + '.html (copy() it and send it over).');
                    }
                    console.groupEnd();
                });
            });
        }, Promise.resolve()).then(function () {
            console.log('[iPray] done. Raw responses on window.__ipraydiag');
        });
    };

    console.log('[iPray] diagnostic loaded - run ipraydiag()');
})();

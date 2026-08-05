// Somo la Kwanza — Bible verse fetcher
// -----------------------------------------------------------------
// Reads the "SOMO LA KWANZA : <rejea>" heading on an Ofisi ya Masomo
// page, resolves the citation against the Bolls Bible API
// (https://bolls.life/api/) using the Swahili Union Version (SUV,
// 1997) translation, and injects the actual verse text between the
// SOMO LA KWANZA heading and the Kiitikizano heading that follows it.
//
// No build step, no dependency — a plain self-contained script, in
// the same style as js/logo-loader.js.
(function () {
    'use strict';

    var TRANSLATION = 'SUV'; // Swahili Union Version, 1997 (bolls.life)
    var API_BASE = 'https://ancient-rice-28a1.otienocollo95.workers.dev';

    // ---------------------------------------------------------------
    // Swahili book-abbreviation -> Bolls numeric book id.
    // Bolls uses the standard 66-book ordering (Mwanzo=1 ... Ufunuo=66).
    // Keys are matched with whitespace stripped and lower-cased, so
    // "I Tim", "1 Tim" and "1tim" all resolve the same way.
    // ---------------------------------------------------------------
    var BOOK_MAP = {
        // Torati
        'mwa': 1, 'mwanzo': 1,
        'kut': 2, 'kutoka': 2,
        'law': 3, 'mambo ya walawi': 3, 'walawi': 3,
        'hes': 4, 'hesabu': 4,
        'kum': 5, 'kumbukumbu': 5, 'kumbukumbularomu': 5,
        // Vitabu vya historia
        'yos': 6, 'yoshua': 6,
        'amu': 7, 'waamuzi': 7,
        'ruth': 8, 'ruthi': 8,
        '1sam': 9, 'isamweli': 9, '1samweli': 9,
        '2sam': 10, 'iisamweli': 10, '2samweli': 10,
        '1fal': 11, 'iwafalme': 11, '1wafalme': 11,
        '2fal': 12, 'iiwafalme': 12, '2wafalme': 12,
        '1nya': 13, 'inyakati': 13, '1nyakati': 13,
        '2nya': 14, 'iinyakati': 14, '2nyakati': 14,
        'ezr': 15, 'ezra': 15,
        'neh': 16, 'nehemia': 16,
        'est': 17, 'esta': 17,
        // Vitabu vya hekima
        'ayu': 18, 'ayubu': 18,
        'zab': 19, 'zaburi': 19,
        'mit': 20, 'mithali': 20,
        'mhu': 21, 'mhubiri': 21,
        'wim': 22, 'wimboulibora': 22,
        // Manabii wakuu
        'isa': 23, 'isaya': 23,
        'yer': 24, 'yeremia': 24,
        'omb': 25, 'maombolezo': 25,
        'eze': 26, 'ezekieli': 26,
        'dan': 27, 'danieli': 27,
        // Manabii wadogo
        'hos': 28, 'hosea': 28,
        'yoeli': 29, 'yl': 29,
        'amo': 30, 'amosi': 30,
        'oba': 31, 'obadia': 31,
        'yona': 32,
        'mik': 33, 'mika': 33,
        'nah': 34, 'nahumu': 34,
        'hab': 35, 'habakuki': 35,
        'sef': 36, 'sefania': 36,
        'hag': 37, 'hagai': 37,
        'zek': 38, 'zekaria': 38,
        'mal': 39, 'malaki': 39,
        // Agano Jipya
        'mt': 40, 'mathayo': 40,
        'mk': 41, 'ma': 41, 'marko': 41,
        'lk': 42, 'luka': 42,
        'yoh': 43, 'yohana': 43,
        'mdo': 44, 'matendo': 44,
        'rum': 45, 'warumi': 45,
        '1kor': 46, 'ikorintho': 46, '1korintho': 46,
        '2kor': 47, 'iikorintho': 47, '2korintho': 47,
        'gal': 48, 'wagalatia': 48,
        'efe': 49, 'waefeso': 49,
        'flp': 50, 'wafilipi': 50,
        'kol': 51, 'wakolosai': 51,
        '1the': 52, 'ithesalonike': 52, '1thesalonike': 52,
        '2the': 53, 'iithesalonike': 53, '2thesalonike': 53,
        '1tim': 54, 'itim': 54, 'itimotheo': 54,
        '2tim': 55, 'iitim': 55, 'iitimotheo': 55,
        'tit': 56, 'tito': 56,
        'flm': 57, 'filemoni': 57,
        'ebr': 58, 'hek': 58, 'waebrania': 58,
        'yak': 59, 'yakobo': 59,
        '1pet': 60, 'ipetro': 60, '1petro': 60,
        '2pet': 61, 'iipetro': 61, '2petro': 61,
        '1yoh': 62, 'iyohana': 62,
        '2yoh': 63, 'iiyohana': 63,
        '3yoh': 64, 'iiiyohana': 64,
        'yud': 65, 'yuda': 65,
        'ufu': 66, 'ufunuo': 66
    };

    // Deuterocanonical / apocryphal books that appear in this lectionary
    // (Catholic Ofisi ya Masomo) but are not carried by the SUV
    // translation on Bolls. We recognise these so we can show a clear,
    // honest message instead of silently failing.
    var DEUTEROCANONICAL = {
        'bar': 'Baruku', 'baruku': 'Baruku',
        'ybs': 'Yesu bin Sira (Sirach)',
        'imak': '1 Wamakabayo', '1mak': '1 Wamakabayo',
        'iimak': '2 Wamakabayo', '2mak': '2 Wamakabayo',
        'tob': 'Tobiti', 'tobiti': 'Tobiti',
        'yud t': 'Yuditi', 'yuditi': 'Yuditi',
        'hekima': 'Kitabu cha Hekima'
    };

    function normKey(s) {
        return s.toLowerCase().replace(/\s+/g, '');
    }

    // -----------------------------------------------------------------
    // Reference parsing
    // -----------------------------------------------------------------
    // Splits "Sef 1, 1-7. 14-2,3" into a book token and the rest, then
    // walks the rest to build a list of {chapter, verseStart, verseEnd}
    // spans, carrying the "current chapter" across segments the way
    // Bible citations normally omit it (e.g. "14-2,3" continues from
    // the chapter set earlier in the same reference).
    function normalizeRef(raw) {
        return raw
            .replace(/[\u2013\u2014]/g, '-') // en/em dash -> hyphen
            .replace(/\s+/g, ' ')
            .trim();
    }

    function splitBookAndRest(ref) {
        var m = ref.match(/^([A-Za-zĀ-ž]+(?:\s+[A-Za-zĀ-ž]+)?)\s+(\d.*)$/);
        if (!m) return null;
        return { book: m[1].trim(), rest: trimToCitation(m[2].trim()) };
    }

    // Some scraped headings carry a trailing title after the citation,
    // e.g. "2:21-32 Siku za mwisho" — keep only the leading run of
    // tokens that actually look like chapter/verse citation syntax.
    function trimToCitation(rest) {
        var tokenPattern = /^[\d,.:;\-–—]+[ab]?$/i;
        var tokens = rest.split(/\s+/);
        var kept = [];
        for (var i = 0; i < tokens.length; i++) {
            if (tokenPattern.test(tokens[i])) {
                kept.push(tokens[i]);
            } else {
                break;
            }
        }
        return kept.length ? kept.join(' ') : rest;
    }

    function parseToken(tok, currentChapter) {
        tok = tok.trim().replace(/[ab]$/i, ''); // drop half-verse marker (14a, 20b)
        var chVerse = tok.match(/^(\d+)\s*[,:]\s*(\d+)$/);
        if (chVerse) return { chapter: parseInt(chVerse[1], 10), verse: parseInt(chVerse[2], 10) };
        var verseOnly = tok.match(/^(\d+)$/);
        if (verseOnly && currentChapter != null) {
            return { chapter: currentChapter, verse: parseInt(verseOnly[1], 10) };
        }
        if (verseOnly) return { chapter: parseInt(verseOnly[1], 10), verse: 1 };
        return null;
    }

    function parseCitation(rest) {
        var segments = rest.split(/[.;]/).map(function (s) { return s.trim(); }).filter(Boolean);
        var currentChapter = null;
        var spans = [];

        segments.forEach(function (seg) {
            var parts = seg.split('-').map(function (s) { return s.trim(); }).filter(Boolean);
            if (!parts.length) return;
            var start = parseToken(parts[0], currentChapter);
            if (!start) return;
            currentChapter = start.chapter;

            if (parts.length > 1) {
                var end = parseToken(parts[1], currentChapter);
                if (!end) {
                    spans.push({ chapter: start.chapter, vStart: start.verse, vEnd: start.verse });
                    return;
                }
                if (end.chapter === start.chapter) {
                    spans.push({ chapter: start.chapter, vStart: start.verse, vEnd: end.verse });
                } else {
                    // Crosses a chapter boundary: rest of start chapter,
                    // any full chapters between, then 1..end.verse.
                    spans.push({ chapter: start.chapter, vStart: start.verse, vEnd: null });
                    for (var c = start.chapter + 1; c < end.chapter; c++) {
                        spans.push({ chapter: c, vStart: 1, vEnd: null });
                    }
                    spans.push({ chapter: end.chapter, vStart: 1, vEnd: end.verse });
                }
                currentChapter = end.chapter;
            } else {
                spans.push({ chapter: start.chapter, vStart: start.verse, vEnd: start.verse });
            }
        });

        return spans;
    }

    // -----------------------------------------------------------------
    // Fetching
    // -----------------------------------------------------------------
    // bolls.life's JSON endpoints are not reachable directly from a
    // browser on another origin (no Access-Control-Allow-Origin header
    // — confirmed independently: the Obsidian Bible Reference plugin
    // needs its own backend proxy for this exact API, and a dedicated
    // Cloudflare Worker proxy exists for the same reason). Since this
    // site has no backend of its own:
    //
    //   1. If you deploy the included cloudflare-worker/bolls-proxy.js
    //      (free, ~5 min, see that file), put its URL here. This is
    //      the reliable path — set it and everything else is a safety
    //      net you likely won't need.
    //   2. Otherwise we fall back to a chain of public CORS relays.
    //      These are free, third-party, and can go down or rate-limit
    //      independently of anything in this codebase — treat them as
    //      a best-effort fallback, not a guarantee.
    var WORKER_PROXY = ''; // e.g. 'https://bolls-proxy.<you>.workers.dev'

    var CORS_RELAYS = [
        function (url) { return 'https://corsproxy.io/?url=' + encodeURIComponent(url); },
        function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
        function (url) { return 'https://thingproxy.freeboard.io/fetch/' + url; }
    ];

    function tryFetchJson(url) {
        return fetch(url, { headers: { 'Accept': 'application/json' } }).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
    }

    function fetchJson(url) {
        var attempt;
        if (WORKER_PROXY) {
            // Worker mirrors bolls.life's path/query exactly, so just
            // swap the origin.
            var workerUrl = WORKER_PROXY.replace(/\/$/, '') + url.replace(API_BASE, '');
            attempt = tryFetchJson(workerUrl).catch(function () { return tryFetchJson(url); });
        } else {
            attempt = tryFetchJson(url);
        }
        CORS_RELAYS.forEach(function (buildRelayUrl) {
            attempt = attempt.catch(function () { return tryFetchJson(buildRelayUrl(url)); });
        });
        return attempt;
    }

    function fetchChapter(bookId, chapter) {
        var url = API_BASE + '/get-text/' + TRANSLATION + '/' + bookId + '/' + chapter + '/';
        return fetchJson(url);
    }

    function stripHtml(html) {
        var tmp = document.createElement('div');
        tmp.innerHTML = html;
        return tmp.textContent || tmp.innerText || '';
    }

    function fetchVerses(bookId, spans) {
        var chapters = [];
        spans.forEach(function (s) { if (chapters.indexOf(s.chapter) === -1) chapters.push(s.chapter); });

        return Promise.all(chapters.map(function (c) { return fetchChapter(bookId, c); }))
            .then(function (chapterResults) {
                var byChapter = {};
                chapters.forEach(function (c, i) { byChapter[c] = chapterResults[i]; });

                var verses = [];
                spans.forEach(function (span) {
                    var verseList = byChapter[span.chapter] || [];
                    verseList.forEach(function (v) {
                        var inRange = v.verse >= span.vStart && (span.vEnd === null || v.verse <= span.vEnd);
                        if (inRange) {
                            verses.push({ chapter: span.chapter, verse: v.verse, text: stripHtml(v.text) });
                        }
                    });
                });
                // De-duplicate (adjacent spans can overlap on shared verses) and order.
                var seen = {};
                var ordered = verses.filter(function (v) {
                    var key = v.chapter + ':' + v.verse;
                    if (seen[key]) return false;
                    seen[key] = true;
                    return true;
                });
                ordered.sort(function (a, b) { return a.chapter - b.chapter || a.verse - b.verse; });
                return ordered;
            });
    }

    // -----------------------------------------------------------------
    // Rendering
    // -----------------------------------------------------------------
    function findSomoLaKwanzaHeading() {
        // Most pages use <h2>, OCR-sourced pages may use <h3>, and the
        // dynamic Liturgy of the Hours view uses <h4> — tolerate all.
        var headings = document.querySelectorAll('h2, h3, h4');
        var pattern = /SOMO\s+LA\s+KWA\s*NZA/i;
        for (var i = 0; i < headings.length; i++) {
            if (pattern.test(headings[i].textContent)) return headings[i];
        }
        return null;
    }

    function extractCitation(headingEl) {
        var text = (headingEl.textContent || '').trim();
        var idx = text.search(/:/);
        if (idx !== -1) {
            var after = text.slice(idx + 1).trim();
            if (after) return normalizeRef(after);
        }
        var next = headingEl.nextElementSibling;
        if (next && /sw-citation/i.test(next.className)) {
            return normalizeRef((next.textContent || '').trim());
        }
        return normalizeRef(text);
    }

    function buildContainer(citation) {
        var cite = document.createElement('p');
        cite.className = 'citation';
        cite.textContent = citation;
        return cite;
    }

    function renderVerses(citeEl, verses) {
        if (!verses.length) {
            renderError(citeEl, 'Aya hazikupatikana kwa rejea hii.');
            return;
        }
        verses.forEach(function (v) {
            var p = document.createElement('p');
            var sup = document.createElement('sup');
            sup.textContent = (v.chapter + ':' + v.verse);
            p.appendChild(sup);
            p.appendChild(document.createTextNode(v.text.trim()));
            citeEl.insertAdjacentElement('afterend', p);
        });
    }

    function renderError(citeEl, message, helpUrl) {
        var p = document.createElement('p');
        p.style.fontStyle = 'italic';
        p.style.opacity = '0.7';
        var span = document.createElement('span');
        span.textContent = message + ' ';
        p.appendChild(span);
        if (helpUrl) {
            var a = document.createElement('a');
            a.href = helpUrl;
            a.target = '_blank';
            a.rel = 'noopener';
            a.textContent = 'Soma andiko kwenye Bolls Bible';
            a.style.color = 'inherit';
            a.style.textDecoration = 'underline';
            span.appendChild(a);
        }
        citeEl.insertAdjacentElement('afterend', p);
    }

    function init() {
        var heading = findSomoLaKwanzaHeading();
        if (!heading) return;

        var citation = extractCitation(heading);
        var split = splitBookAndRest(citation);
        var built = buildContainer(citation);
        heading.insertAdjacentElement('afterend', built);

        if (!split) {
            renderError(built, 'Imeshindikana kusoma rejea "' + citation + '".');
            return;
        }

        var key = normKey(split.book);
        var bookId = BOOK_MAP[key];

        if (!bookId) {
            if (DEUTEROCANONICAL[key]) {
                renderError(
                    built,
                    'Kitabu cha ' + DEUTEROCANONICAL[key] + ' (' + split.book + ') hakipatikani kwenye tafsiri ya ' +
                    TRANSLATION + ' ya Bolls Bible API — kinapatikana katika Biblia ya Kikatoliki pekee.'
                );
            } else {
                renderError(built, 'Kitabu "' + split.book + '" hakikutambuliwa.');
            }
            return;
        }

        var spans = parseCitation(split.rest);
        if (!spans.length) {
            renderError(built, 'Imeshindikana kusoma rejea "' + citation + '".');
            return;
        }

        fetchVerses(bookId, spans)
            .then(function (verses) { renderVerses(built, verses); })
            .catch(function () {
                var firstChapter = spans[0].chapter;
                renderError(
                    built,
                    'Imeshindwa kupata andiko kutoka Bolls Bible API kwa sasa.',
                    API_BASE + '/' + TRANSLATION + '/' + bookId + '/' + firstChapter + '/'
                );
            });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposed for debugging / reuse elsewhere.
    window.SomoLaKwanzaBible = {
        BOOK_MAP: BOOK_MAP,
        parseCitation: parseCitation,
        splitBookAndRest: splitBookAndRest,
        normalizeRef: normalizeRef,
        init: init
    };
})();

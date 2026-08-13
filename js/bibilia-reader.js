// Bibilia Takatifu reader — fetches and renders actual biblical books/chapters.
// -----------------------------------------------------------------
// Wires into the "Bibilia Takatifu" card on index.html: each book button
// (data-book="ot-NN" / "nt-NN") opens this reader with ?book=<bolls id>, rendering
// real Swahili (SUV) verse text from the Bolls Bible API, proxied through the
// free Cloudflare Worker in cloudflare-worker/bolls-proxy.js so the static site
// can call an API that otherwise has no ACAO header.
//
// Data flow:
//   index.html book button  ->  pages/bibilia-reader.html?book=ot-01&chapter=1
//   bibilia-reader.js        ->  Worker (bolls.life) via get-text/SUV/<id>/<ch>/
//                                (+ CORS-relay fallbacks if the Worker is down)
//   Renders: chapter nav (prev • chapter select • next) + verses with numbers
//
// Self-contained: no build step, no framework, plain ES5 IIFE like
// js/somo-la-kwanza-bible.js.
(function () {
    'use strict';

    // -----------------------------------------------------------------
    // Configuration
    // -----------------------------------------------------------------
    var TRANSLATION = 'SUV'; // Swahili Union Version, 1997 (bolls.life)

    // Deployed Cloudflare Worker that mirrors bolls.life with permissive CORS.
    // If you deploy your own copy of cloudflare-worker/bolls-proxy.js, drop its
    // URL here (e.g. 'https://bolls-proxy.<you>.workers.dev'). Leave blank to
    // rely on the public CORS-relay fallbacks only.
    var WORKER_PROXY = 'https://ancient-rice-28a1.otienocollo95.workers.dev';

    // bolls.life origin (used by the relay fallbacks as the URL to wrap).
    var BOLLS_ORIGIN = 'https://bolls.life';

    // Public CORS relays used as a safety net when the Worker (or bolls
    // directly) is unreachable / rate-limited. Free, third-party, best-effort.
    var CORS_RELAYS = [
        function (url) { return 'https://corsproxy.io/?url=' + encodeURIComponent(url); },
        function (url) { return 'https://api.allorigins.win/raw?url=' + encodeURIComponent(url); },
        function (url) { return 'https://thingproxy.freeboard.io/fetch/' + url; }
    ];

    // -----------------------------------------------------------------
    // The 66 books: bolls numeric id, Swahili name (as shown in index.html),
    // English name, testament, and standard chapter count. Chapter counts are
    // hardcoded because bolls.life's /books endpoint serves HTML (not JSON)
    // and these counts are stable — this also lets chapter navigation work
    // before any network request completes.
    // -----------------------------------------------------------------
    var BOOKS = [
        // --- Agano la Kale / Old Testament ---
        { id: 1,  sw: 'Mwanzo',                  en: 'Genesis',              testament: 'ot', chapters: 50,  abbrev: 'Mwa' },
        { id: 2,  sw: 'Kutoka',                  en: 'Exodus',               testament: 'ot', chapters: 40,  abbrev: 'Kut' },
        { id: 3,  sw: 'Mambo ya Walawi',         en: 'Leviticus',            testament: 'ot', chapters: 27,  abbrev: 'Law' },
        { id: 4,  sw: 'Hesabu',                  en: 'Numbers',              testament: 'ot', chapters: 36,  abbrev: 'Hes' },
        { id: 5,  sw: 'Kumbukumbu la Torati',    en: 'Deuteronomy',          testament: 'ot', chapters: 34,  abbrev: 'Kum' },
        { id: 6,  sw: 'Yoshua',                  en: 'Joshua',               testament: 'ot', chapters: 24,  abbrev: 'Yos' },
        { id: 7,  sw: 'Waamuzi',                 en: 'Judges',               testament: 'ot', chapters: 21,  abbrev: 'Amu' },
        { id: 8,  sw: 'Ruthu',                   en: 'Ruth',                 testament: 'ot', chapters: 4,   abbrev: 'Ruth' },
        { id: 9,  sw: '1 Samweli',               en: '1 Samuel',             testament: 'ot', chapters: 25,  abbrev: '1Sam' },
        { id: 10, sw: '2 Samweli',               en: '2 Samuel',             testament: 'ot', chapters: 24,  abbrev: '2Sam' },
        { id: 11, sw: '1 Wafalme',               en: '1 Kings',              testament: 'ot', chapters: 22,  abbrev: '1Fal' },
        { id: 12, sw: '2 Wafalme',               en: '2 Kings',              testament: 'ot', chapters: 25,  abbrev: '2Fal' },
        { id: 13, sw: '1 Mambo ya Nyakati',      en: '1 Chronicles',         testament: 'ot', chapters: 29,  abbrev: '1Nya' },
        { id: 14, sw: '2 Mambo ya Nyakati',      en: '2 Chronicles',         testament: 'ot', chapters: 36,  abbrev: '2Nya' },
        { id: 15, sw: 'Ezra',                    en: 'Ezra',                 testament: 'ot', chapters: 10,  abbrev: 'Ezr' },
        { id: 16, sw: 'Nehemia',                 en: 'Nehemiah',             testament: 'ot', chapters: 13,  abbrev: 'Neh' },
        { id: 17, sw: 'Esta',                    en: 'Esther',               testament: 'ot', chapters: 10,  abbrev: 'Est' },
        { id: 18, sw: 'Ayubu',                   en: 'Job',                  testament: 'ot', chapters: 42,  abbrev: 'Ayub' },
        { id: 19, sw: 'Zaburi',                  en: 'Psalms',               testament: 'ot', chapters: 150, abbrev: 'Zab' },
        { id: 20, sw: 'Mithali',                 en: 'Proverbs',             testament: 'ot', chapters: 31,  abbrev: 'Mit' },
        { id: 21, sw: 'Mhubiri',                 en: 'Ecclesiastes',         testament: 'ot', chapters: 12,  abbrev: 'Mhu' },
        { id: 22, sw: 'Wimbo Ulio Bora',         en: 'Song of Solomon',      testament: 'ot', chapters: 8,   abbrev: 'Wim' },
        { id: 23, sw: 'Isaya',                   en: 'Isaiah',               testament: 'ot', chapters: 66,  abbrev: 'Isa' },
        { id: 24, sw: 'Yeremia',                 en: 'Jeremiah',             testament: 'ot', chapters: 52,  abbrev: 'Yer' },
        { id: 25, sw: 'Maombolezo',              en: 'Lamentations',         testament: 'ot', chapters: 5,   abbrev: 'Omb' },
        { id: 26, sw: 'Ezekieli',                en: 'Ezekiel',              testament: 'ot', chapters: 48,  abbrev: 'Eze' },
        { id: 27, sw: 'Danieli',                 en: 'Daniel',               testament: 'ot', chapters: 12,  abbrev: 'Dan' },
        { id: 28, sw: 'Hosea',                   en: 'Hosea',                testament: 'ot', chapters: 14,  abbrev: 'Hos' },
        { id: 29, sw: 'Yoeli',                   en: 'Joel',                 testament: 'ot', chapters: 3,   abbrev: 'Yoe' },
        { id: 30, sw: 'Amosi',                   en: 'Amos',                 testament: 'ot', chapters: 9,   abbrev: 'Amo' },
        { id: 31, sw: 'Obadia',                  en: 'Obadiah',              testament: 'ot', chapters: 1,   abbrev: 'Oba' },
        { id: 32, sw: 'Yona',                    en: 'Jonah',                testament: 'ot', chapters: 4,   abbrev: 'Yon' },
        { id: 33, sw: 'Mika',                    en: 'Micah',                testament: 'ot', chapters: 7,   abbrev: 'Mik' },
        { id: 34, sw: 'Nahumu',                  en: 'Nahum',                testament: 'ot', chapters: 3,   abbrev: 'Nah' },
        { id: 35, sw: 'Habakuki',                en: 'Habakkuk',             testament: 'ot', chapters: 3,   abbrev: 'Hab' },
        { id: 36, sw: 'Sefania',                 en: 'Zephaniah',            testament: 'ot', chapters: 3,   abbrev: 'Sef' },
        { id: 37, sw: 'Hagai',                   en: 'Haggai',               testament: 'ot', chapters: 2,   abbrev: 'Hag' },
        { id: 38, sw: 'Zekaria',                 en: 'Zechariah',            testament: 'ot', chapters: 14,  abbrev: 'Zek' },
        { id: 39, sw: 'Malaki',                  en: 'Malachi',              testament: 'ot', chapters: 3,   abbrev: 'Mal' },
        // --- Agano Jipya / New Testament ---
        { id: 40, sw: 'Mathayo',                 en: 'Matthew',              testament: 'nt', chapters: 28,  abbrev: 'Mt' },
        { id: 41, sw: 'Marko',                   en: 'Mark',                 testament: 'nt', chapters: 16,  abbrev: 'Mk' },
        { id: 42, sw: 'Luka',                    en: 'Luke',                 testament: 'nt', chapters: 24,  abbrev: 'Lk' },
        { id: 43, sw: 'Yohana',                  en: 'John',                 testament: 'nt', chapters: 21,  abbrev: 'Yh' },
        { id: 44, sw: 'Matendo ya Mitume',       en: 'Acts',                 testament: 'nt', chapters: 28,  abbrev: 'Mdo' },
        { id: 45, sw: 'Warumi',                  en: 'Romans',               testament: 'nt', chapters: 16,  abbrev: 'Rum' },
        { id: 46, sw: '1 Wakorintho',            en: '1 Corinthians',        testament: 'nt', chapters: 16,  abbrev: '1Kor' },
        { id: 47, sw: '2 Wakorintho',            en: '2 Corinthians',        testament: 'nt', chapters: 13,  abbrev: '2Kor' },
        { id: 48, sw: 'Wagalatia',               en: 'Galatians',            testament: 'nt', chapters: 6,   abbrev: 'Gal' },
        { id: 49, sw: 'Waefeso',                 en: 'Ephesians',            testament: 'nt', chapters: 6,   abbrev: 'Efe' },
        { id: 50, sw: 'Wafilipi',                en: 'Philippians',          testament: 'nt', chapters: 4,   abbrev: 'Flp' },
        { id: 51, sw: 'Wakolosai',               en: 'Colossians',           testament: 'nt', chapters: 4,   abbrev: 'Kol' },
        { id: 52, sw: '1 Wathesalonike',         en: '1 Thessalonians',      testament: 'nt', chapters: 5,   abbrev: '1The' },
        { id: 53, sw: '2 Wathesalonike',         en: '2 Thessalonians',      testament: 'nt', chapters: 3,   abbrev: '2The' },
        { id: 54, sw: '1 Timotheo',              en: '1 Timothy',            testament: 'nt', chapters: 6,   abbrev: '1Tim' },
        { id: 55, sw: '2 Timotheo',              en: '2 Timothy',            testament: 'nt', chapters: 4,   abbrev: '2Tim' },
        { id: 56, sw: 'Tito',                    en: 'Titus',                testament: 'nt', chapters: 3,   abbrev: 'Tit' },
        { id: 57, sw: 'Filemoni',                en: 'Philemon',             testament: 'nt', chapters: 1,   abbrev: 'Flm' },
        { id: 58, sw: 'Waebrania',               en: 'Hebrews',              testament: 'nt', chapters: 13,  abbrev: 'Ebr' },
        { id: 59, sw: 'Yakobo',                  en: 'James',                testament: 'nt', chapters: 5,   abbrev: 'Yak' },
        { id: 60, sw: '1 Petro',                 en: '1 Peter',              testament: 'nt', chapters: 5,   abbrev: '1Pet' },
        { id: 61, sw: '2 Petro',                 en: '2 Peter',              testament: 'nt', chapters: 3,   abbrev: '2Pet' },
        { id: 62, sw: '1 Yohana',                en: '1 John',               testament: 'nt', chapters: 5,   abbrev: '1Yh' },
        { id: 63, sw: '2 Yohana',                en: '2 John',               testament: 'nt', chapters: 1,   abbrev: '2Yh' },
        { id: 64, sw: '3 Yohana',                en: '3 John',               testament: 'nt', chapters: 1,   abbrev: '3Yh' },
        { id: 65, sw: 'Yuda',                    en: 'Jude',                 testament: 'nt', chapters: 1,   abbrev: 'Yud' },
        { id: 66, sw: 'Ufunuo',                  en: 'Revelation',           testament: 'nt', chapters: 22,  abbrev: 'Ufu' }
    ];

    // Lookup tables for fast access.
    var BY_ID = {};
    BOOKS.forEach(function (b) { BY_ID[b.id] = b; });

    // Swahili book name -> numeric id, normalised (whitespace collapsed, lower-cased).
    var NAME_TO_ID = {};
    BOOKS.forEach(function (b) {
        NAME_TO_ID[normKey(b.sw)] = b.id;
        NAME_TO_ID[normKey(b.en)] = b.id;
        NAME_TO_ID[normKey(b.abbrev)] = b.id;
    });

    function normKey(s) { return String(s).toLowerCase().replace(/\s+/g, ' ').trim(); }

    // Convert the index.html data-book id ("ot-01".."ot-39", "nt-01".."nt-27")
    // to the Bolls numeric book id (1..66).
    function dataBookToId(dataBook) {
        if (typeof dataBook === 'number' && dataBook >= 1 && dataBook <= 66) return dataBook;
        var parts = String(dataBook).split('-');
        var num = parseInt(parts[1], 10);
        if (parts[0] === 'ot' && num >= 1 && num <= 39) return num;
        if (parts[0] === 'nt' && num >= 1 && num <= 27) return 39 + num;
        // Already a numeric id passed through the URL.
        var direct = parseInt(parts[0], 10);
        return direct >= 1 && direct <= 66 ? direct : null;
    }

    // -----------------------------------------------------------------
    // URL parsing
    // -----------------------------------------------------------------
    function getQueryParam(name) {
        var params = new URLSearchParams(window.location.search);
        return params.get(name);
    }

    // -----------------------------------------------------------------
    // Fetching — Bolls chapter text via Worker (ACA0) with relay fallbacks.
    // Returns a Promise of the JSON array: [{ verse, text }, ...]
    // -----------------------------------------------------------------
    function tryFetch(url) {
        return fetch(url, { headers: { 'Accept': 'application/json' } }).then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
        });
    }

    function fetchChapterJson(bookId, chapter, translation) {
        var bollsUrl = BOLLS_ORIGIN + '/get-text/' + translation + '/' + bookId + '/' + chapter + '/';
        var attempt;

        if (WORKER_PROXY) {
            // Worker mirrors bolls.life's path/query exactly; swap the origin.
            var workerUrl = WORKER_PROXY.replace(/\/$/, '') + '/get-text/' + translation + '/' + bookId + '/' + chapter + '/';
            attempt = tryFetch(workerUrl).catch(function () { return tryFetch(bollsUrl); });
        } else {
            attempt = tryFetch(bollsUrl);
        }

        CORS_RELAYS.forEach(function (build) {
            attempt = attempt.catch(function () { return tryFetch(build(bollsUrl)); });
        });
        return attempt;
    }

    // Session cache: "id:chapter" -> array of {verse,text}. Makes prev/next
    // instantaneous and is kinder to bolls.life / the Worker.
    var CHAPTER_CACHE = (function () {
        try { return JSON.parse(sessionStorage.getItem('bibiliaReaderCache') || '{}'); } catch (e) { return {}; }
    })();
    function cacheKey(id, ch) { return id + ':' + ch; }
    function cacheSet(id, ch, data) {
        CHAPTER_CACHE[cacheKey(id, ch)] = data;
        try { sessionStorage.setItem('bibiliaReaderCache', JSON.stringify(CHAPTER_CACHE)); } catch (e) { /* ignore */ }
    }
    function cacheGet(id, ch) { return CHAPTER_CACHE[cacheKey(id, ch)] || null; }

    function fetchChapter(id, chapter, translation) {
        var cached = cacheGet(id, chapter);
        if (cached) return Promise.resolve(cached);
        return fetchChapterJson(id, chapter, translation).then(function (arr) {
            // Normalise + sanity check the payload (some chapters may come back
            // as a single object instead of an array on odd edge cases).
            var verses = [];
            if (Array.isArray(arr)) {
                verses = arr.map(function (v) {
                    return { verse: v.verse, text: stripHtml(v.text || '') };
                }).filter(function (v) { return v.text.length > 0; });
            } else if (arr && arr.chapters) {
                // Alternate payload shape — flatten the first chapter's verses.
                (arr.chapters[0] || []).forEach(function (v) {
                    verses.push({ verse: v.verse, text: stripHtml(v.text || '') });
                });
            }
            cacheSet(id, chapter, verses);
            return verses;
        });
    }

    function stripHtml(html) {
        var div = document.createElement('div');
        div.innerHTML = html;
        return (div.textContent || div.innerText || '').replace(/\s+/g, ' ').trim();
    }

    // -----------------------------------------------------------------
    // Rendering
    // -----------------------------------------------------------------
    function setText(id, text) {
        var el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function clearContent() {
        var out = document.getElementById('bibleContent');
        var err = document.getElementById('bibleError');
        if (out) out.innerHTML = '';
        if (err) err.classList.add('hidden');
    }

    function renderLoading(message) {
        var out = document.getElementById('bibleContent');
        if (!out) return;
        out.innerHTML = '<div class="bible-loading py-10 text-center"><div class="spinner mx-auto mb-3"></div><p class="text-gray-500 dark:text-gray-400">' + (message || 'Inapakia...') + '</p></div>';
    }

    function renderError(message) {
        var out = document.getElementById('bibleContent');
        var err = document.getElementById('bibleError');
        if (out) out.innerHTML = '';
        if (err) {
            err.textContent = message;
            err.classList.remove('hidden');
        } else if (out) {
            out.innerHTML = '<p class="error-state">' + message + '</p>';
        }
    }

    function renderVerses(book, chapter, verses) {
        var out = document.getElementById('bibleContent');
        if (!out) return;
        if (!verses.length) {
            renderError('Hakuna maandishi yaliyopatikana kwa sura hii.');
            return;
        }
        // Group verses into paragraphs on blank-text boundaries is overkill;
        // render each verse on its own line — the standard Bible layout.
        out.innerHTML = '';
        verses.forEach(function (v) {
            var p = document.createElement('p');
            p.className = 'bible-verse';
            var sup = document.createElement('sup');
            sup.className = 'verse-num';
            sup.setAttribute('aria-label', 'Verse');
            sup.textContent = v.verse;
            p.appendChild(sup);
            // createTextNode auto-escapes any <, &, etc. in the verse text.
            p.appendChild(document.createTextNode(' ' + (v.text || '').replace(/\s+/g, ' ').trim()));
            out.appendChild(p);
        });
        out.classList.remove('hidden');

        // Scroll to top of content so you don't keep the previous chapter's
        // position when flipping through chapters.
        var main = out.parentElement;
        if (main && main.scrollTo) main.scrollTo({ top: 0, behavior: 'auto' });
    }

    // -----------------------------------------------------------------
    // UI helpers
    // -----------------------------------------------------------------
    function buildChapterOptions(book) {
        var opts = [];
        for (var c = 1; c <= book.chapters; c++) opts.push(c);
        return opts;
    }

    function renderChapterSelector(book, currentChapter) {
        var sel = document.getElementById('chapterSelect');
        if (!sel) return;
        sel.innerHTML = '';
        var opts = buildChapterOptions(book);
        opts.forEach(function (c) {
            var opt = document.createElement('option');
            opt.value = c;
            opt.textContent = 'Sura ' + c;
            if (c === currentChapter) opt.selected = true;
            sel.appendChild(opt);
        });
        sel.disabled = book.chapters <= 1;
    }

    function updateNavButtons(book, chapter) {
        var prev = document.getElementById('prevChapter');
        var next = document.getElementById('nextChapter');
        if (prev) prev.disabled = chapter <= 1;
        if (next) next.disabled = chapter >= book.chapters;
    }

    function updateHeader(book, chapter) {
        // Use the Swahili name (the app is primarily Kiswahili) and show the
        // English in a smaller subtitle so the card matches the index labels.
        setText('bookTitle', book.sw);
        setText('bookSubtitle', book.en + ' ' + book.abbrev);
        document.title = book.sw + ' ' + chapter + ' | Bibilia Takatifu';

        // Highlight the currently open testament in the (hypothetical) nav.
        var badge = document.getElementById('testamentBadge');
        if (badge) {
            badge.textContent = book.testament === 'ot' ? 'Agano la Kale' : 'Agano Jipya';
        }
    }

    function updateChapterLabel(chapter) {
        setText('chapterLabel', 'Sura ' + chapter);
    }

    // -----------------------------------------------------------------
    // Main load + navigation
    // -----------------------------------------------------------------
    var STATE = { book: null, chapter: 1, translation: TRANSLATION, loading: false };

    function loadChapter(id, chapter, translation) {
        var book = BY_ID[id];
        if (!book) { renderError('Kitabu hakipatikana (id ' + id + ').'); return; }
        STATE.book = book;
        STATE.chapter = chapter;
        STATE.translation = translation || TRANSLATION;

        updateHeader(book, chapter);
        renderChapterSelector(book, chapter);
        updateNavButtons(book, chapter);
        updateChapterLabel(chapter);

        document.getElementById('chapterSelect').value = String(chapter);

        renderLoading('Inapakia ' + book.sw + ' sura ' + chapter + '...');
        STATE.loading = true;

        fetchChapter(id, chapter, translation || TRANSLATION)
            .then(function (verses) {
                renderVerses(book, chapter, verses);
            })
            .catch(function (err) {
                renderError(
                    'Imeshindwa kupata ' + book.sw + ' ' + chapter + '. ' +
                    'Hakikisha umeconnect kwenye mtandao, kisha ubonye tena. ' +
                    '(Data inapatikana kutoka Bolls Bible API kupitia Cloudflare Worker.)'
                );
                if (window.console && console.error) console.error('bibilia-reader fetch failed', err);
            })
            .then(function () { STATE.loading = false; });
    }

    function navigateTo(id, chapter, translation) {
        var url = 'bibilia-reader.html?book=' + id + '&chapter=' + chapter;
        if (translation && translation !== TRANSLATION) url += '&translation=' + translation;
        window.location.href = url;
    }

    function setChapter(chapter) {
        var book = STATE.book;
        if (!book) return;
        var clamped = Math.max(1, Math.min(book.chapters, chapter));
        if (clamped === STATE.chapter) return;
        // Update the URL without reloading the page.
        var params = new URLSearchParams(window.location.search);
        params.set('book', book.id);
        params.set('chapter', clamped);
        window.history.replaceState({}, '', 'bibilia-reader.html?' + params.toString());
        loadChapter(book.id, clamped, STATE.translation);
    }

    function bindControls() {
        var prev = document.getElementById('prevChapter');
        var next = document.getElementById('nextChapter');
        var sel = document.getElementById('chapterSelect');
        var topBtn = document.getElementById('backToTop');

        if (prev) prev.addEventListener('click', function () {
            if (STATE.book && STATE.chapter > 1) setChapter(STATE.chapter - 1);
        });
        if (next) next.addEventListener('click', function () {
            if (STATE.book && STATE.chapter < STATE.book.chapters) setChapter(STATE.chapter + 1);
        });
        if (sel) sel.addEventListener('change', function () {
            var ch = parseInt(sel.value, 10);
            if (!isNaN(ch)) setChapter(ch);
        });
        if (topBtn) topBtn.addEventListener('click', function () {
            var el = document.querySelector('main');
            if (el && el.scrollTo) el.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    function init() {
        bindControls();

        var bookParam = getQueryParam('book');
        var chapterParam = parseInt(getQueryParam('chapter') || '1', 10);
        var translationParam = getQueryParam('translation') || TRANSLATION;

        // Accept either a Bolls numeric id (1..66) or an index.html data-book
        // string ("ot-01"/"nt-27") in the `book` query param.
        var id = dataBookToId(bookParam);
        if (!id) {
            renderError('Hakijani kipengele cha kitabu. Tafadhari kamwe kwenye "Bibilia Takatifu" kwenye ukurasa wa mwenye.' );
            return;
        }

        var book = BY_ID[id];
        var chapter = Math.max(1, Math.min(book.chapters, chapterParam || 1));

        loadChapter(id, chapter, translationParam);

        // Browser back/forward: re-read params and (re)load.
        window.addEventListener('popstate', function () {
            var id2 = dataBookToId(getQueryParam('book'));
            var ch2 = parseInt(getQueryParam('chapter') || '1', 10) || 1;
            var tr2 = getQueryParam('translation') || TRANSLATION;
            if (id2) {
                var b2 = BY_ID[id2];
                var ch2c = Math.max(1, Math.min(b2.chapters, ch2));
                loadChapter(id2, ch2c, tr2);
            }
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Exposed for debugging / wiring from index.html if needed.
    window.BibiliaReader = {
        BOOKS: BOOKS,
        BY_ID: BY_ID,
        NAME_TO_ID: NAME_TO_ID,
        dataBookToId: dataBookToId,
        loadChapter: loadChapter,
        navigateTo: navigateTo,
        fetchChapter: fetchChapter,
        init: init
    };
})();

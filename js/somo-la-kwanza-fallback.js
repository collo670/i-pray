// Somo la Kwanza — secondary Bible source (fallback)
// -----------------------------------------------------------------
// js/somo-la-kwanza-bible.js reads the first reading from the Swahili
// Union Version (SUV) on bolls.life. SUV has the 66 books only, so it
// cannot give the readings the Catholic Office of Readings takes from
// Tobiti, Yudithi, Hekima, Yoshua bin Sira, Baruku and 1-2 Wamakabayo,
// nor the Greek parts of Esta and Danieli. js/somo-la-kwanza-bible.js
// loads this script only when the primary source cannot give a reading
// (and never when it can), and asks it for the whole passage.
//
// Source: Swahili Revised Union Version with the Deuterocanonical books
// (SRUVDC, 2005, (c) Bible Society of Kenya and Bible Society of
// Tanzania) - YouVersion version 1817, 78 books: the 66, the seven
// deuterocanonical books, Esta's Greek text (ESG) and Danieli's Greek
// parts (S3Y, SUS, BEL), plus the Letter of Jeremiah (LJE). It is the
// revision of the Union Version the primary source uses. Read from
// Bible.com's chapter JSON, which allows cross-origin reads, so the
// static site needs no proxy. (Scripture Earth labels this version
// "1818"; YouVersion's own metadata shows 1818 is the 66-book SRUV and
// 1817 the one with the deuterocanonical books.)
//
// The reading comes back as the verses the primary renders,
// { chapter, verse, label, text }, labelled as the citation counts them,
// so js/somo-la-kwanza-bible.js shows it with its own renderer. Nothing
// is shown unless every part of the citation was found in SRUVDC: a
// passage it cannot map exactly is refused, never guessed at.
//
// No build step, no dependency - a plain ES5 IIFE like the primary.
(function (global) {
    'use strict';

    var VERSION = {
        id: 1817,
        abbreviation: 'SRUVDC',
        name: 'Swahili Revised Union Version'
    };
    var API = 'https://nodejs.bible.com/api/bible/chapter/3.1';
    var CREDIT = 'Andiko hili limetoka katika Swahili Revised Union Version (SRUVDC), ' +
        '© Bible Society of Kenya na Bible Society of Tanzania, 2005.';
    var TIMEOUT_MS = 10000;

    // Chapters read are kept on the phone for good (the text never
    // changes), in the same Cache API store as js/bibilia-reader.js's
    // chapters - service-worker.js keeps it across releases.
    var STORE = 'ipray-bible';

    // -----------------------------------------------------------------
    // Books
    // -----------------------------------------------------------------
    // Bolls book id (1-66, the primary's numbering) -> USFM book code.
    var USFM = [null,
        'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
        '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
        'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
        'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL', 'MAT',
        'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP',
        'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE',
        '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'
    ];

    // The deuterocanonical books, by the names and abbreviations the
    // books (and Kiswahili Bibles generally) give them. Keys are matched
    // lower-cased with spaces and full stops removed, as the primary's.
    // "Yud" is Yudithi here; Yuda (Jude) is "Yda", which the primary has.
    var DEUTERO_BOOKS = {
        TOB: ['tob', 'tobiti', 'tobit'],
        JDT: ['yud', 'yudt', 'ydt', 'yuditi', 'yudithi', 'judith'],
        WIS: ['hek', 'hekima', 'hekimayasulemani', 'wis'],
        SIR: ['ybs', 'yoshuabinsira', 'yesubinsira', 'yoshuamwanawasira', 'sira', 'siraki', 'sir'],
        BAR: ['bar', 'baruku', 'baruk'],
        '1MA': ['1mak', 'imak', '1wamakabayo', 'iwamakabayo', '1makabayo', 'imakabayo'],
        '2MA': ['2mak', 'iimak', '2wamakabayo', 'iiwamakabayo', '2makabayo', 'iimakabayo']
    };
    var DEUTERO = {};
    Object.keys(DEUTERO_BOOKS).forEach(function (code) {
        DEUTERO_BOOKS[code].forEach(function (k) { DEUTERO[k] = code; });
    });

    function normKey(s) {
        return String(s).toLowerCase().replace(/[\s.]+/g, '');
    }

    // -----------------------------------------------------------------
    // The Greek parts of Danieli and Esta
    // -----------------------------------------------------------------
    // The books number Danieli as the Greek Bible does (3,24-90 is the
    // Song of the Three, 13 Susanna, 14 Bel) and Esta as the Vulgate does
    // (its Greek parts gathered in 10,4 - 16,24). SRUVDC gives those
    // parts books of their own. Each run is a verse range of the books'
    // chapter; the rest of each chapter is numbered as SUV numbers it
    // (js/somo-la-kwanza-bible.js's toSuvSpans), as SRUVDC does too.
    //
    // Danieli: S3Y 1,1-67 is 3,24-90 ("Nao vijana walitembea katikati ya
    // moto" ... "Mshukuruni BWANA, kwa kuwa yu mwema").
    var GREEK_DANIEL = {
        3: [{ from: 24, to: 90, book: 'S3Y', chapter: '1', offset: 23 }],
        13: [{ from: 1, to: 64, book: 'SUS', chapter: '1', offset: 0 }],
        14: [{ from: 1, to: 42, book: 'BEL', chapter: '1', offset: 0 }]
    };

    // Esta: ESG prints the Greek parts with lettered verses (Esta 4,17a,
    // 4,17b ...) all under one verse id, so they are picked by their
    // letters. Where a Vulgate verse has a letter of its own (A, B, F)
    // the reading is labelled as the citation counts it; where the
    // letters gather several verses (C, E) only the whole section can be
    // given, and is labelled with SRUVDC's letters. Addition D (Vulgate
    // 15) SRUVDC does not set apart from 5,1-2, so it is not offered.
    function letters(prefix, first, last) {
        var out = [];
        for (var c = first.charCodeAt(0); c <= last.charCodeAt(0); c++) {
            out.push(prefix + String.fromCharCode(c));
        }
        return out;
    }
    var GREEK_ESTHER = {
        // F - Mordekai's dream fulfilled ("Mordekai akasema, Mambo hayo
        // yametoka kwa Mungu")
        10: [{ from: 4, to: 13, book: 'ESG', chapter: '10_1', labels: letters('3', 'a', 'j'), exact: true }],
        11: [
            // The closing note ("Katika mwaka wa nne wa utawala wa Tolemayo")
            { from: 1, to: 1, book: 'ESG', chapter: '10_1', labels: ['3k'], exact: true },
            // A - Mordekai's dream
            { from: 2, to: 12, book: 'ESG', chapter: '1_1', labels: letters('1', 'a', 'k'), exact: true }
        ],
        // A - the plot against the king
        12: [{ from: 1, to: 6, book: 'ESG', chapter: '1_1', labels: letters('1', 'l', 'q'), exact: true }],
        13: [
            // B - the king's letter ("Hii ndiyo nakala ya barua")
            { from: 1, to: 7, book: 'ESG', chapter: '3_1', labels: letters('13', 'a', 'g'), exact: true },
            // C - Mordekai's prayer ("Sala ya Mordekai")
            { from: 8, to: 18, book: 'ESG', chapter: '4_1', labels: letters('17', 'a', 'i'), exact: false }
        ],
        // C - Esta's prayer ("Sala ya Esta", "Malkia Esta naye alimkimbilia
        // BWANA" ... "uniokoe katika hofu yangu")
        14: [{ from: 1, to: 19, book: 'ESG', chapter: '4_1', labels: letters('17', 'j', 'x'), exact: false }],
        // D - not set apart in SRUVDC
        15: [{ from: 1, to: 19, book: null }],
        // E - the king's decree ("Tangazo la mfalme Artashasta")
        16: [{ from: 1, to: 24, book: 'ESG', chapter: '8_1', labels: letters('12', 'a', 'u'), exact: false }]
    };

    // Where a chapter with Greek parts ends, in the books' numbering - for
    // citations that run to the end of one ("Dan 3,1 - 4,3").
    var CHAPTER_END = {
        27: { 3: 100, 13: 64, 14: 42 },
        17: { 10: 13, 11: 12, 12: 6, 13: 18, 14: 19, 15: 19, 16: 24 }
    };

    // -----------------------------------------------------------------
    // Planning: which chapters to read, and which verses of each
    // -----------------------------------------------------------------
    // A span { chapter, vStart, vEnd } (vEnd null: to the chapter's end)
    // cut by the runs of its chapter: the pieces inside a run, and the
    // pieces between runs, in verse order.
    function carve(span, runs, chapterEnd) {
        var start = span.vStart;
        var end = span.vEnd === null ? (chapterEnd || Infinity) : span.vEnd;
        var pieces = [];
        var cursor = start;
        (runs || []).forEach(function (run) {
            var from = Math.max(cursor, run.from);
            var to = Math.min(end, run.to);
            if (from > to) return;
            if (from > cursor) pieces.push({ run: null, from: cursor, to: from - 1 });
            pieces.push({ run: run, from: from, to: to });
            cursor = to + 1;
        });
        if (cursor <= end) pieces.push({ run: null, from: cursor, to: end === Infinity ? null : end });
        return pieces;
    }

    // The parts of a reading: one per chapter range or verse list, in
    // citation order. Returns null when SRUVDC cannot give the whole
    // passage exactly.
    function planParts(target, spans, toSuvSpans) {
        var parts = [];
        var ok = true;

        function fromSuv(bookId, suvInput) {
            if (!suvInput.length) return;
            if (typeof toSuvSpans !== 'function') { ok = false; return; }
            var suv = toSuvSpans(bookId, suvInput);
            if (suv.missing) ok = false;
            suv.spans.forEach(function (s) {
                parts.push({
                    book: USFM[bookId], chapter: String(s.chapter), from: s.vStart, to: s.vEnd,
                    labelChapter: s.bookChapter, offset: s.offset
                });
            });
        }

        spans.forEach(function (span) {
            if (!ok) return;
            if (target.deutero) {
                // Baruku 6 is the Letter of Jeremiah, a book of its own in SRUVDC.
                var lje = target.deutero === 'BAR' && span.chapter === 6;
                parts.push({
                    book: lje ? 'LJE' : target.deutero, chapter: lje ? '1' : String(span.chapter),
                    from: span.vStart, to: span.vEnd, labelChapter: span.chapter, offset: 0
                });
                return;
            }

            var bookId = target.bookId;
            var greek = bookId === 27 ? GREEK_DANIEL : bookId === 17 ? GREEK_ESTHER : null;
            var runs = greek && greek[span.chapter];
            if (!runs) {
                fromSuv(bookId, [span]);
                return;
            }
            var pieces = carve(span, runs, (CHAPTER_END[bookId] || {})[span.chapter]);
            pieces.forEach(function (piece) {
                if (!ok) return;
                var run = piece.run;
                if (!run) {
                    fromSuv(bookId, [{ chapter: span.chapter, vStart: piece.from, vEnd: piece.to }]);
                    return;
                }
                if (!run.book) { ok = false; return; }
                if (!run.labels) {
                    parts.push({
                        book: run.book, chapter: run.chapter, from: piece.from - run.offset, to: piece.to - run.offset,
                        labelChapter: span.chapter, offset: run.offset
                    });
                    return;
                }
                var picks = [];
                if (run.exact) {
                    for (var v = piece.from; v <= piece.to; v++) {
                        picks.push({ label: run.labels[v - run.from], display: span.chapter + ':' + v });
                    }
                } else if (piece.from === run.from && piece.to === run.to) {
                    var shown = run.chapter.split('_')[0];
                    run.labels.forEach(function (l) { picks.push({ label: l, display: shown + ':' + l }); });
                } else {
                    // Part of a section whose letters gather several verses.
                    ok = false;
                    return;
                }
                parts.push({ book: run.book, chapter: run.chapter, picks: picks });
            });
        });

        return ok && parts.length ? parts : null;
    }

    // Splits a citation the primary could not ("Yoshua bin Sira 24,1-22",
    // "Hekima ya Sulemani 7,15-30"): book names of up to four words.
    function splitBook(citation) {
        var m = String(citation || '').replace(/^:/, '').trim()
            .match(/^((?:[IVXLCDM\d]+\s+)?[A-Za-zĀ-ž]+(?:\s+[A-Za-zĀ-ž]+){0,3})\s+(\d.*)$/);
        if (!m) return null;
        var rest = [];
        var tokens = m[2].trim().split(/\s+/);
        for (var i = 0; i < tokens.length && /^[0-9abcd,.:;\-–—]+$/i.test(tokens[i]); i++) rest.push(tokens[i]);
        return { book: m[1].trim(), rest: rest.length ? rest.join(' ') : m[2].trim() };
    }

    // The SRUVDC book for a book token the primary has no id for.
    function deuteroBook(book) {
        return DEUTERO[normKey(book)] || null;
    }

    // request: { citation, book, bookId, spans, toSuvSpans, parseCitation }
    //   bookId - the primary's book id (1-66), when it knows the book
    //   spans  - the citation's spans in the books' numbering (the
    //            primary's parseCitation); worked out here from the
    //            citation when the primary could not split it.
    function plan(request) {
        request = request || {};
        var bookId = request.bookId;
        var spans = request.spans;
        var book = request.book;

        if (!book || !spans) {
            var split = splitBook(request.citation);
            if (!split) return null;
            if (!book) book = split.book;
            if (!spans) {
                if (typeof request.parseCitation !== 'function') return null;
                spans = request.parseCitation(split.rest, false);
            }
        }
        if (!spans || !spans.length) return null;

        var target = bookId >= 1 && bookId <= 66 ? { bookId: bookId } : null;
        if (!target) {
            var code = deuteroBook(book);
            if (!code) return null;
            target = { deutero: code };
        }
        return planParts(target, spans, request.toSuvSpans);
    }

    // -----------------------------------------------------------------
    // Parsing a chapter
    // -----------------------------------------------------------------
    // Bible.com marks each verse <span class="verse vN" data-usfm="BOOK.C.V">
    // with a <span class="label"> (its number) and <span class="content">
    // (its text), repeated where a verse runs over several paragraphs or
    // poetry lines; bridged verses carry "BOOK.C.15+BOOK.C.16". Cross
    // references (.note) and section headings (.heading) are not Scripture.
    // A small tag walker, so this runs the same without a DOM (in tests).
    var TOKEN = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>|([^<]+)/g;
    var VOID_TAGS = { br: true, img: true, hr: true, wbr: true, meta: true, link: true, input: true };
    var NAMED_ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };

    function decodeEntities(s) {
        return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, function (all, e) {
            if (e.charAt(0) === '#') {
                var code = e.charAt(1).toLowerCase() === 'x' ? parseInt(e.slice(2), 16) : parseInt(e.slice(1), 10);
                return isNaN(code) ? all : String.fromCharCode(code);
            }
            var named = NAMED_ENTITIES[e.toLowerCase()];
            return named === undefined ? all : named;
        });
    }

    function attr(attrs, name) {
        var m = attrs.match(new RegExp('\\s' + name + '\\s*=\\s*"([^"]*)"'));
        return m ? m[1] : null;
    }

    function hasClass(frame, name) {
        return frame.cls.indexOf(' ' + name + ' ') !== -1;
    }

    // [{ nums: [15, 16], label: '15-16', text }], in the chapter's order.
    function parseChapter(html) {
        var items = [];
        var last = {}; // usfm -> the item that verse's text goes to
        var stack = [];
        var newFragment = false;
        var m;

        function numbers(usfm) {
            return usfm.split('+').map(function (u) {
                return parseInt(u.split('.').pop(), 10);
            }).filter(function (n) { return !isNaN(n); });
        }

        function startItem(usfm, label) {
            var nums = numbers(usfm);
            if (!nums.length) return null;
            var item = { nums: nums, label: label || nums.join('-'), text: '' };
            items.push(item);
            last[usfm] = item;
            return item;
        }

        TOKEN.lastIndex = 0;
        while ((m = TOKEN.exec(html || ''))) {
            if (m[2]) {
                var tag = m[2].toLowerCase();
                if (m[1]) {
                    for (var i = stack.length - 1; i >= 0; i--) {
                        if (stack[i].tag === tag) { stack.length = i; break; }
                    }
                    continue;
                }
                if (VOID_TAGS[tag] || /\/\s*$/.test(m[3])) {
                    newFragment = true;
                    continue;
                }
                var cls = ' ' + (attr(m[3], 'class') || '').replace(/\s+/g, ' ') + ' ';
                var frame = { tag: tag, cls: cls, usfm: null };
                if (hasClass(frame, 'verse')) frame.usfm = attr(m[3], 'data-usfm');
                stack.push(frame);
                if (hasClass(frame, 'content')) newFragment = true;
                continue;
            }

            var usfm = null;
            var skip = false;
            var inLabel = false;
            var inContent = false;
            for (var j = 0; j < stack.length; j++) {
                var f = stack[j];
                if (f.usfm) usfm = f.usfm;
                if (hasClass(f, 'note') || hasClass(f, 'heading')) skip = true;
                if (hasClass(f, 'label')) inLabel = true;
                if (hasClass(f, 'content')) inContent = true;
            }
            if (!usfm || skip) continue;
            var text = decodeEntities(m[4]);
            if (inLabel) {
                startItem(usfm, text.trim());
                continue;
            }
            if (!inContent) continue;
            var item = last[usfm] || startItem(usfm, null);
            if (!item) continue;
            // Poetry lines and paragraphs are separate fragments: keep a
            // space between them, but not before punctuation.
            if (newFragment && item.text && !/\s$/.test(item.text) && /^[^\s,.;:!?)\]”’]/.test(text)) {
                item.text += ' ';
            }
            item.text += text;
            if (/\S/.test(text)) newFragment = false;
        }

        return items.map(function (it) {
            return { nums: it.nums, label: it.label, text: it.text.replace(/\s+/g, ' ').trim() };
        }).filter(function (it) { return it.text; });
    }

    // The verses of one part, as the primary renders them. Returns null
    // when the chapter lacks part of what was asked for.
    function pick(part, items) {
        var out = [];
        if (part.picks) {
            var byLabel = {};
            items.forEach(function (it) { byLabel[it.label] = it; });
            for (var i = 0; i < part.picks.length; i++) {
                var it = byLabel[part.picks[i].label];
                if (!it) return null;
                out.push({ chapter: part.chapter, verse: it.nums[0], label: part.picks[i].display, text: it.text });
            }
            return out;
        }
        var covered = {};
        items.forEach(function (it) {
            var hit = it.nums.some(function (n) { return n >= part.from && (part.to === null || n <= part.to); });
            if (!hit) return;
            it.nums.forEach(function (n) { covered[n] = true; });
            var first = it.nums[0] + part.offset;
            var lastNum = it.nums[it.nums.length - 1] + part.offset;
            out.push({
                chapter: part.chapter,
                verse: it.nums[0],
                label: part.labelChapter + ':' + (first === lastNum ? first : first + '-' + lastNum),
                text: it.text
            });
        });
        // The first and the last verse asked for must be there: a chapter
        // that stops short is not the passage.
        if (!out.length || !covered[part.from] || (part.to !== null && !covered[part.to])) return null;
        return out;
    }

    // -----------------------------------------------------------------
    // Fetching
    // -----------------------------------------------------------------
    var MEMORY = {};
    var IN_FLIGHT = {};

    function chapterUrl(book, chapter) {
        return API + '?id=' + VERSION.id + '&reference=' + book + '.' + chapter;
    }

    function cacheStorage() {
        return global.caches && typeof global.caches.open === 'function' ? global.caches : null;
    }

    function storedChapter(url) {
        var store = cacheStorage();
        if (!store) return Promise.resolve(null);
        return store.open(STORE)
            .then(function (cache) { return cache.match(url); })
            .then(function (r) { return r ? r.json() : null; })
            .catch(function () { return null; });
    }

    function storeChapter(url, items) {
        var store = cacheStorage();
        if (!store || typeof global.Response !== 'function') return;
        store.open(STORE).then(function (cache) {
            return cache.put(url, new global.Response(JSON.stringify(items), {
                headers: { 'Content-Type': 'application/json' }
            }));
        }).catch(function () { /* fetched again next time */ });
    }

    // One request, given up on after TIMEOUT_MS.
    function fetchJson(url) {
        if (global.navigator && global.navigator.onLine === false) {
            return Promise.reject(new Error('offline'));
        }
        var ctrl = typeof global.AbortController === 'function' ? new global.AbortController() : null;
        var timer;
        var timeout = new Promise(function (resolve, reject) {
            timer = setTimeout(function () {
                if (ctrl) ctrl.abort();
                reject(new Error('timeout'));
            }, TIMEOUT_MS);
        });
        var init = { headers: { 'Accept': 'application/json' } };
        if (ctrl) init.signal = ctrl.signal;
        var request = global.fetch(url, init).then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        });
        return Promise.race([request, timeout]).then(function (json) {
            clearTimeout(timer);
            return json;
        }, function (err) {
            clearTimeout(timer);
            throw err;
        });
    }

    // The verses of one SRUVDC chapter: from memory, the phone's store,
    // or Bible.com - each chapter asked for once, however many readings
    // on the page need it.
    function loadChapter(book, chapter) {
        var url = chapterUrl(book, chapter);
        if (MEMORY[url]) return Promise.resolve(MEMORY[url]);
        if (IN_FLIGHT[url]) return IN_FLIGHT[url];
        var p = storedChapter(url).then(function (stored) {
            if (stored && stored.length) return stored;
            return fetchJson(url).then(function (json) {
                // Only this version's text of this chapter: never another
                // translation or another chapter in its place.
                var ref = json && json.reference;
                if (!ref || ref.version_id !== VERSION.id ||
                    !ref.usfm || ref.usfm[0] !== book + '.' + chapter) {
                    throw new Error('not ' + VERSION.abbreviation + ' ' + book + '.' + chapter);
                }
                var items = parseChapter(json.content);
                if (!items.length) throw new Error('empty chapter');
                storeChapter(url, items);
                return items;
            });
        }).then(function (items) {
            MEMORY[url] = items;
            return items;
        });
        IN_FLIGHT[url] = p;
        var done = function () { delete IN_FLIGHT[url]; };
        p.then(done, done);
        return p;
    }

    // The whole reading, or a rejection when SRUVDC cannot give all of it.
    // Resolves { verses, credit, version }.
    function fetchReading(request) {
        var parts = plan(request);
        if (!parts) return Promise.reject(new Error('not available in ' + VERSION.abbreviation));
        if (typeof global.fetch !== 'function' && !cacheStorage()) {
            return Promise.reject(new Error('no fetch'));
        }

        var keys = [];
        var chapters = {};
        parts.forEach(function (p) {
            var key = p.book + '.' + p.chapter;
            if (!chapters[key]) {
                keys.push(key);
                chapters[key] = { book: p.book, chapter: p.chapter };
            }
        });

        return Promise.all(keys.map(function (key) {
            return loadChapter(chapters[key].book, chapters[key].chapter);
        })).then(function (results) {
            var byKey = {};
            keys.forEach(function (key, i) { byKey[key] = results[i]; });
            var verses = [];
            var seen = {};
            parts.forEach(function (part) {
                var key = part.book + '.' + part.chapter;
                var got = pick(part, byKey[key]);
                if (!got) throw new Error(VERSION.abbreviation + ' ' + key + ' lacks part of the reading');
                got.forEach(function (v) {
                    // Spans of a citation can share a verse.
                    var id = key + ':' + v.label;
                    if (seen[id]) return;
                    seen[id] = true;
                    verses.push(v);
                });
            });
            if (!verses.length) throw new Error('no verses');
            return { verses: verses, credit: CREDIT, version: VERSION };
        });
    }

    global.SomoLaKwanzaFallback = {
        VERSION: VERSION,
        CREDIT: CREDIT,
        DEUTERO: DEUTERO,
        GREEK_DANIEL: GREEK_DANIEL,
        GREEK_ESTHER: GREEK_ESTHER,
        deuteroBook: deuteroBook,
        splitBook: splitBook,
        plan: plan,
        parseChapter: parseChapter,
        chapterUrl: chapterUrl,
        fetchReading: fetchReading
    };
})(typeof window !== 'undefined' ? window : this);

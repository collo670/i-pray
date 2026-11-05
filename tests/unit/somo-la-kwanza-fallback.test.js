// The first reading's secondary source (js/somo-la-kwanza-fallback.js): the
// Swahili Revised Union Version with the deuterocanonical books (SRUVDC) on
// Bible.com, asked only when SUV on bolls.life cannot give a reading. Each
// citation must map to the right SRUVDC book, chapter and verses - or be
// refused - and a chapter's markup must give back just the Scripture text.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');

// Both scripts in one page, as js/somo-la-kwanza-bible.js loads the fallback
// next to itself. `fetch` answers Bible.com chapter requests.
function load({ fetch, setTimeout: timer } = {}) {
    const document = { readyState: 'complete', querySelectorAll: () => [], addEventListener() {} };
    const sandbox = { document, fetch, setTimeout: timer || setTimeout, clearTimeout };
    sandbox.window = sandbox;
    vm.createContext(sandbox);
    for (const file of ['somo-la-kwanza-bible.js', 'somo-la-kwanza-fallback.js']) {
        vm.runInContext(fs.readFileSync(path.join(ROOT, 'js', file), 'utf8'), sandbox, { filename: file });
    }
    return { S: sandbox.SomoLaKwanzaBible, F: sandbox.SomoLaKwanzaFallback, sandbox };
}

// Plain objects: the sandbox's arrays fail deepEqual's prototype check.
const plain = (x) => JSON.parse(JSON.stringify(x));
const key = (book) => book.toLowerCase().replace(/\s+/g, '');

// The request js/somo-la-kwanza-bible.js makes for a citation.
function request(S, citation) {
    const cit = S.normalizeRef(citation);
    const req = { citation: cit, toSuvSpans: S.toSuvSpans, parseCitation: S.parseCitation };
    const split = S.splitBookAndRest(cit);
    if (split) {
        req.book = split.book;
        req.bookId = S.BOOK_MAP[key(split.book)];
        req.spans = S.parseCitation(split.rest, S.SINGLE_CHAPTER[req.bookId]);
    }
    return req;
}

// "BOOK.CH from-to" for each range part, "BOOK.CH label>shown ..." for letters.
function describe(parts) {
    if (!parts) return null;
    return plain(parts).map((p) => p.picks
        ? p.book + '.' + p.chapter + ' ' + p.picks.map((x) => x.label + '>' + x.display).join(' ')
        : p.book + '.' + p.chapter + ' ' + p.from + '-' + p.to + ' as ' + p.labelChapter + ':' + (p.from + p.offset));
}

// A Bible.com chapter answer, in the markup Bible.com uses.
function chapterJson(ref, verses, extra) {
    const body = verses.map((v) => {
        const label = typeof v === 'object' ? v.label : String(v);
        const usfm = typeof v === 'object' ? v.usfm : ref + '.' + v;
        return '<div class="p"><span class="verse v' + label + '" data-usfm="' + usfm + '"><span class="label">' + label +
            '</span><span class="content">' + ref + ' aya ' + label + ' </span></span></div>';
    }).join('');
    return Object.assign({
        reference: { usfm: [ref], human: ref, version_id: 1817 },
        content: '<div class="version vid1817"><div class="chapter" data-usfm="' + ref + '"><div class="label">1</div>' + body + '</div></div>'
    }, extra || {});
}

function range(n) {
    return Array.from({ length: n }, (_, i) => i + 1);
}

// A fetch that answers every chapter with `n` verses, and records the asks.
function bibleCom(n = 80, overrides = {}) {
    const asked = [];
    const fetch = async (url) => {
        const ref = new URL(url).searchParams.get('reference');
        asked.push(ref);
        if (overrides[ref] === 'fail') return { ok: false, status: 503, json: async () => ({}) };
        const json = overrides[ref] || chapterJson(ref, range(n));
        return { ok: true, status: 200, json: async () => json };
    };
    return { fetch, asked };
}

test('the deuterocanonical books, by their abbreviations and their names', () => {
    const { S, F } = load();
    const books = {
        Tob: 'TOB', Tobiti: 'TOB', Yud: 'JDT', Yudithi: 'JDT', Yuditi: 'JDT', Hek: 'WIS', Hekima: 'WIS',
        'Hekima ya Sulemani': 'WIS', YbS: 'SIR', 'Yoshua bin Sira': 'SIR', Siraki: 'SIR', Sira: 'SIR',
        Bar: 'BAR', Baruku: 'BAR', 'I Mak': '1MA', '1 Mak': '1MA', '1 Wamakabayo': '1MA',
        'II Mak': '2MA', '2 Mak': '2MA', '2 Wamakabayo': '2MA'
    };
    for (const [name, code] of Object.entries(books)) assert.equal(F.deuteroBook(name), code, name);
    // Yuda (Jude) stays with the primary; "Yud" is Yudithi.
    assert.equal(S.BOOK_MAP.yda, 65);
    assert.equal(F.deuteroBook('Yda'), null);
    assert.equal(F.deuteroBook('Mwa'), null);
});

test('every first reading SUV cannot give is found in SRUVDC', () => {
    const { S, F } = load();
    const dir = path.join(ROOT, 'data', 'office-readings-sw');
    const citations = new Set();
    const walk = (o) => {
        if (!o || typeof o !== 'object') return;
        if (o.firstReading && o.firstReading.citation) citations.add(o.firstReading.citation);
        Object.values(o).forEach(walk);
    };
    fs.readdirSync(dir).forEach((f) => walk(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));

    let asked = 0;
    for (const citation of citations) {
        const req = request(S, citation);
        const suv = req.bookId ? S.toSuvSpans(req.bookId, req.spans) : null;
        if (suv && !suv.missing && suv.spans.length) continue; // SUV has it
        asked++;
        assert.ok(F.plan(req), 'not planned in SRUVDC: ' + citation);
    }
    assert.ok(asked >= 26, 'deuterocanonical and Greek readings: ' + asked);
});

test('deuterocanonical readings keep their chapters and verses', () => {
    const { S, F } = load();
    const plan = (c) => describe(F.plan(request(S, c)));
    assert.deepEqual(plan('Hek 1,16 – 2,1a. 10-24'), ['WIS.1 16-null as 1:16', 'WIS.2 1-1 as 2:1', 'WIS.2 10-24 as 2:10']);
    assert.deepEqual(plan('YbS 44, 1-2. 16 - 45,5'), ['SIR.44 1-2 as 44:1', 'SIR.44 16-null as 44:16', 'SIR.45 1-5 as 45:1']);
    assert.deepEqual(plan('I Mak 2,1.15-28. 42-50. 65-70'), ['1MA.2 1-1 as 2:1', '1MA.2 15-28 as 2:15', '1MA.2 42-50 as 2:42', '1MA.2 65-70 as 2:65']);
    assert.deepEqual(plan('II Mak 7,1-14'), ['2MA.7 1-14 as 7:1']);
    assert.deepEqual(plan('Tob 4,1-11'), ['TOB.4 1-11 as 4:1']);
    assert.deepEqual(plan('Yud 8,1-8'), ['JDT.8 1-8 as 8:1']);
    // Baruku 6 is the Letter of Jeremiah, a book of its own in SRUVDC.
    assert.deepEqual(plan('Bar 5,1-9; 6,1-7'), ['BAR.5 1-9 as 5:1', 'LJE.1 1-7 as 6:1']);
    // Book names the primary cannot split
    assert.deepEqual(describe(F.plan({ citation: 'Yoshua bin Sira 24, 1-22', parseCitation: S.parseCitation })), ['SIR.24 1-22 as 24:1']);
    assert.deepEqual(describe(F.plan({ citation: 'Hekima ya Sulemani 7,15-30 Hekima', parseCitation: S.parseCitation })), ['WIS.7 15-30 as 7:15']);
});

test('the Greek parts of Danieli are its Greek books, the rest numbered as SUV', () => {
    const { S, F } = load();
    const plan = (c) => describe(F.plan(request(S, c)));
    assert.deepEqual(plan('Dan 3,8-12. 19-24. 91-97'), [
        'DAN.3 8-12 as 3:8', 'DAN.3 19-23 as 3:19', 'S3Y.1 1-1 as 3:24', 'DAN.3 24-30 as 3:91'
    ]);
    assert.deepEqual(plan('Dan 3,1 – 4,3'), [
        'DAN.3 1-23 as 3:1', 'S3Y.1 1-67 as 3:24', 'DAN.3 24-30 as 3:91', 'DAN.4 1-3 as 3:98', 'DAN.4 4-6 as 4:1'
    ]);
    assert.deepEqual(plan('Dan 13,1-9. 15-17. 19-30. 33-62'), ['SUS.1 1-9 as 13:1', 'SUS.1 15-17 as 13:15', 'SUS.1 19-30 as 13:19', 'SUS.1 33-62 as 13:33']);
    assert.deepEqual(plan('Dan 14,1-22'), ['BEL.1 1-22 as 14:1']);
});

test('the Greek parts of Esta are picked by SRUVDC\'s letters, or refused', () => {
    const { S, F } = load();
    const plan = (c) => describe(F.plan(request(S, c)));
    const letters = (prefix, a, b) => {
        const out = [];
        for (let c = a.charCodeAt(0); c <= b.charCodeAt(0); c++) out.push(prefix + String.fromCharCode(c));
        return out;
    };
    // Esta's prayer: the whole section, labelled with SRUVDC's letters
    assert.deepEqual(plan('Est 14, 1-19'), ['ESG.4_1 ' + letters('17', 'j', 'x').map((l) => l + '>4:' + l).join(' ')]);
    // A verse a letter of its own: labelled as the citation counts it
    assert.deepEqual(plan('Est 11,2-4'), ['ESG.1_1 1a>11:2 1b>11:3 1c>11:4']);
    assert.deepEqual(plan('Est 10,1-13'), ['EST.10 1-3 as 10:1', 'ESG.10_1 ' + letters('3', 'a', 'j').map((l, i) => l + '>10:' + (i + 4)).join(' ')]);
    assert.deepEqual(plan('Est 13,1-7'), ['ESG.3_1 ' + letters('13', 'a', 'g').map((l, i) => l + '>13:' + (i + 1)).join(' ')]);
    // Hebrew Esta is SUV's numbering
    assert.deepEqual(plan('Est 3,1-13. 14-15'), ['EST.3 1-13 as 3:1', 'EST.3 14-15 as 3:14']);
    // Part of a section whose letters gather several verses, or Addition D,
    // which SRUVDC does not set apart: refused, never guessed at
    assert.equal(plan('Est 14,1-10'), null);
    assert.equal(plan('Est 13,8-12'), null);
    assert.equal(plan('Est 16,1-10'), null);
    assert.equal(plan('Est 15,1-16'), null);
});

test('the books\' Hebrew verse numbers are SUV\'s in SRUVDC too', () => {
    const { S, F } = load();
    const plan = (c) => describe(F.plan(request(S, c)));
    assert.deepEqual(plan('Yoe 4,1-3.9-21'), ['JOL.3 1-3 as 4:1', 'JOL.3 9-21 as 4:9']);
    assert.deepEqual(plan('Mal 3,19-24'), ['MAL.4 1-6 as 3:19']);
    assert.deepEqual(plan('Ma 1,1-12. 18-20'), ['LAM.1 1-12 as 1:1', 'LAM.1 18-20 as 1:18']);
    // Not a book, or no verses: nothing to ask for
    assert.equal(F.plan(request(S, 'Kitabu 3,1-4')), null);
    assert.equal(F.plan({ citation: 'SOMO LA KWANZA', parseCitation: S.parseCitation }), null);
});

test('a chapter\'s markup gives back the Scripture text only', () => {
    const { F } = load();
    const html = [
        '<div class="version vid1817"><div class="book bkSIR"><div class="chapter ch11" data-usfm="SIR.11">',
        '<div class="label">11</div><div class="s"><span class="heading">KICHWA CHA HABARI</span></div>',
        '<div class="p"><span class="content">  </span><span class="verse v1" data-usfm="SIR.11.1"><span class="label">1</span>',
        '<span class="note x"><span class="label">#</span><span class=" body"><span class="ref" data-usfm="PRO.1.1">Mit 1:1</span></span></span>',
        '<span class="content">Ee </span><span class="content">BWANA</span><span class="content">, usikie &#8220;sala&#8221; &amp; dua. </span></span>',
        '<span class="verse v2" data-usfm="SIR.11.2"><span class="label">2</span><span class="content">Mwanzo wa aya</span></span></div>',
        '<div class="s"><span class="heading">KICHWA KINGINE</span></div>',
        '<div class="p"><span class="verse v2" data-usfm="SIR.11.2"><span class="content">mwisho wa aya.</span></span></div>',
        '<div class="q1"><span class="verse v3" data-usfm="SIR.11.3"><span class="label">3</span><span class="content">Mstari wa kwanza,</span></span></div>',
        '<div class="q2"><span class="verse v3" data-usfm="SIR.11.3"><span class="content">Mstari wa pili.</span></span></div>',
        '<div class="p"><span class="verse v15 v16" data-usfm="SIR.11.15+SIR.11.16"><span class="label">15-16</span>',
        '<span class="it"><span class="content">Aya mbili pamoja.</span></span></span></div>',
        '</div></div></div>'
    ].join('');
    assert.deepEqual(plain(F.parseChapter(html)), [
        { nums: [1], label: '1', text: 'Ee BWANA, usikie “sala” & dua.' },
        { nums: [2], label: '2', text: 'Mwanzo wa aya mwisho wa aya.' },
        { nums: [3], label: '3', text: 'Mstari wa kwanza, Mstari wa pili.' },
        { nums: [15, 16], label: '15-16', text: 'Aya mbili pamoja.' }
    ]);

    // Esta's Greek parts: lettered verses under one verse id
    const esg = '<div class="p"><span class="verse v17" data-usfm="ESG.4_1.17"><span class="label">17a</span><span class="content">Ya kwanza.</span></span>' +
        '<span class="verse v17" data-usfm="ESG.4_1.17"><span class="label">17b</span><span class="content">Ya pili.</span></span></div>';
    assert.deepEqual(plain(F.parseChapter(esg)), [
        { nums: [17], label: '17a', text: 'Ya kwanza.' },
        { nums: [17], label: '17b', text: 'Ya pili.' }
    ]);
    assert.deepEqual(plain(F.parseChapter('')), []);
});

test('a reading is put together in citation order, labelled as the citation counts', async () => {
    const net = bibleCom();
    const { S, F } = load({ fetch: net.fetch });
    const reading = plain(await F.fetchReading(request(S, 'Dan 3,8-12. 19-24. 91-97')));
    assert.deepEqual(reading.verses.map((v) => v.label), [
        '3:8', '3:9', '3:10', '3:11', '3:12', '3:19', '3:20', '3:21', '3:22', '3:23', '3:24',
        '3:91', '3:92', '3:93', '3:94', '3:95', '3:96', '3:97'
    ]);
    assert.equal(reading.verses.find((v) => v.label === '3:24').text, 'S3Y.1 aya 1');
    assert.equal(reading.verses.find((v) => v.label === '3:91').text, 'DAN.3 aya 24');
    assert.match(reading.credit, /Swahili Revised Union Version \(SRUVDC\)/);
    assert.deepEqual(net.asked.sort(), ['DAN.3', 'S3Y.1']);

    const esg = bibleCom(0, {
        'ESG.4_1': chapterJson('ESG.4_1', 'abcdefghijklmnopqrstuvwx'.split('').map((l) => ({ label: '17' + l, usfm: 'ESG.4_1.17' })))
    });
    const est = load({ fetch: esg.fetch });
    const prayer = plain(await est.F.fetchReading(request(est.S, 'Est 14, 1-19')));
    assert.equal(prayer.verses.length, 15);
    assert.deepEqual([prayer.verses[0].label, prayer.verses[14].label], ['4:17j', '4:17x']);
    assert.equal(prayer.verses[0].text, 'ESG.4_1 aya 17j');
});

test('each chapter is asked for once, however many readings need it', async () => {
    const net = bibleCom();
    const { S, F } = load({ fetch: net.fetch });
    await Promise.all([F.fetchReading(request(S, 'Hek 7,15-30')), F.fetchReading(request(S, 'Hek 7,1-5'))]);
    await F.fetchReading(request(S, 'Hek 7,20-22'));
    assert.deepEqual(net.asked, ['WIS.7']);
});

test('another translation, another chapter or a short one is never shown', async () => {
    const reject = async (overrides, citation) => {
        const net = bibleCom(80, overrides);
        const { S, F } = load({ fetch: net.fetch });
        await assert.rejects(F.fetchReading(request(S, citation)));
    };
    // Bible.com answering with another version, or another chapter
    await reject({ 'WIS.7': chapterJson('WIS.7', range(30), { reference: { usfm: ['WIS.7'], version_id: 1818 } }) }, 'Hek 7,15-30');
    await reject({ 'WIS.7': chapterJson('WIS.8', range(30)) }, 'Hek 7,15-30');
    // A chapter that stops before the reading does
    await reject({ 'WIS.7': chapterJson('WIS.7', range(20)) }, 'Hek 7,15-30');
    // One of the reading's chapters not answering
    await reject({ 'WIS.2': 'fail' }, 'Hek 1,16 – 2,1a. 10-24');
    // A citation SRUVDC cannot give: nothing is asked for
    const net = bibleCom();
    const { S, F } = load({ fetch: net.fetch });
    await assert.rejects(F.fetchReading(request(S, 'Est 15,1-16')));
    assert.deepEqual(net.asked, []);
});

test('a request that does not answer is given up on', async () => {
    const timers = [];
    const never = () => new Promise(() => {});
    const { S, F } = load({ fetch: never, setTimeout: (fn, ms) => { timers.push({ fn, ms }); return timers.length; } });
    const reading = F.fetchReading(request(S, 'Tob 1,1-10'));
    await new Promise((r) => setImmediate(r));
    assert.equal(timers.length, 1);
    assert.ok(timers[0].ms <= 15000, 'timeout ' + timers[0].ms);
    timers[0].fn();
    await assert.rejects(reading, /timeout/);
});

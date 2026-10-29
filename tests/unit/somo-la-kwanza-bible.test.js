// The first reading's Bible text (js/somo-la-kwanza-bible.js): each citation
// in the Swahili Office of Readings resolves to the right book of the SUV
// Bible on bolls.life, and to the verses SUV numbers as the books do.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

function loadScript() {
    const code = fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'somo-la-kwanza-bible.js'), 'utf8');
    const document = { readyState: 'complete', querySelectorAll: () => [], addEventListener() {} };
    const sandbox = { window: {}, document };
    vm.runInNewContext(code, sandbox, { filename: 'somo-la-kwanza-bible.js' });
    return sandbox.window.SomoLaKwanzaBible;
}

const S = loadScript();
const key = (book) => book.toLowerCase().replace(/\s+/g, '');

// { book, id, spans (the books' numbering), suv: { spans, missing } }
function resolve(citation) {
    const split = S.splitBookAndRest(S.normalizeRef(citation));
    assert.ok(split, 'parsed: ' + citation);
    const id = S.BOOK_MAP[key(split.book)];
    const spans = S.parseCitation(split.rest, S.SINGLE_CHAPTER[id]);
    // Plain objects: the sandbox's arrays fail deepEqual's prototype check.
    const plain = (x) => JSON.parse(JSON.stringify(x));
    return { book: split.book, id, spans: plain(spans), suv: id ? plain(S.toSuvSpans(id, spans)) : null };
}

function suvRanges(citation) {
    return resolve(citation).suv.spans.map((s) => s.chapter + ':' + s.vStart + '-' + s.vEnd);
}

function firstReadings() {
    const dir = path.join(__dirname, '..', '..', 'data', 'office-readings-sw');
    const found = new Set();
    const walk = (o) => {
        if (!o || typeof o !== 'object') return;
        if (o.firstReading && o.firstReading.citation) found.add(o.firstReading.citation);
        Object.values(o).forEach(walk);
    };
    fs.readdirSync(dir).forEach((f) => walk(JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))));
    return [...found];
}

test('the books\' abbreviations name the right books', () => {
    const books = {
        'Ma 1,1-12. 18-20': 25, // Maombolezo, not Marko
        'Mk 1,1-8': 41,
        'Ebr 2,9-17': 58,
        'Yda 1-8. 12-13. 17-25': 65, // Yuda
        'Kum 1, 1. 6-10': 5,
        'Amu 4, 1-24': 7,
        'Ayu 1, 1-22': 18,
        'Mhu 1, 1-18': 21,
        'I Fal 18, 16-39': 11,
        'II Kor 1, 1-14': 47,
        'Yoe 2,21 – 3,5': 29,
        'Zek 8,1-17.20-23': 38
    };
    for (const [citation, id] of Object.entries(books)) assert.equal(resolve(citation).id, id, citation);
});

test('books SUV does not carry are named, not fetched from another book', () => {
    const deutero = { 'Hek 7,15-30': 'Hekima', 'YbS 1,1-18': 'Yesu bin Sira (Sirach)', 'I Mak 1,1-24': '1 Wamakabayo', 'Bar 3,9-15.24 – 4,4': 'Baruku', 'Yud 6,19': 'Yuditi' };
    for (const [citation, name] of Object.entries(deutero)) {
        const r = resolve(citation);
        assert.equal(r.id, undefined, citation + ' must not resolve to an SUV book');
        assert.equal(S.DEUTEROCANONICAL[key(r.book)], name, citation);
    }
});

test('every first reading in the data resolves to a book and to verses', () => {
    const citations = firstReadings();
    assert.ok(citations.length > 250);
    for (const citation of citations) {
        const r = resolve(citation);
        if (!r.id) {
            assert.ok(S.DEUTEROCANONICAL[key(r.book)], 'unknown book: ' + citation);
            continue;
        }
        assert.ok(r.spans.length > 0, 'no verses: ' + citation);
        r.spans.forEach((s) => assert.ok(s.vEnd === null || s.vEnd >= s.vStart, citation + ' ' + JSON.stringify(s)));
    }
});

test('citations the books write unusually', () => {
    // A chapter after a semicolon, written with a full stop
    assert.deepEqual(resolve('Hos 1,1-9; 3.1-5').spans, [
        { chapter: 1, vStart: 1, vEnd: 9 }, { chapter: 3, vStart: 1, vEnd: 5 }
    ]);
    // A one-chapter book gives verses only
    assert.deepEqual(suvRanges('Yda 1-8. 12-13. 17-25'), ['1:1-8', '1:12-13', '1:17-25']);
    assert.deepEqual(suvRanges('Yda 17-25'), ['1:17-25']);
    // Colon between chapter and verse, commas between verses
    assert.deepEqual(resolve('Yoeli 4:1-3,9-21').spans, [
        { chapter: 4, vStart: 1, vEnd: 3 }, { chapter: 4, vStart: 9, vEnd: 21 }
    ]);
    assert.deepEqual(resolve('Zekaria 12:9-12,13:1-9').spans, [
        { chapter: 12, vStart: 9, vEnd: 12 }, { chapter: 13, vStart: 1, vEnd: 9 }
    ]);
});

test('the books\' Hebrew verse numbers become SUV\'s', () => {
    assert.deepEqual(suvRanges('Yoe 4,1-3.9-21'), ['3:1-3', '3:9-21']);
    assert.deepEqual(suvRanges('Yoe 2,21 – 3,5'), ['2:21-27', '2:28-32']);
    assert.deepEqual(suvRanges('Mal 3,1-24'), ['3:1-18', '4:1-6']);
    assert.deepEqual(suvRanges('Hos 2, 4.8-25'), ['2:2-2', '2:6-23']);
    assert.deepEqual(suvRanges('Hos 14,2-10'), ['14:1-9']);
    assert.deepEqual(suvRanges('Mik 4,14 – 5,7'), ['5:1-1', '5:2-8']);
    assert.deepEqual(suvRanges('Zek 1,1 – 2,4'), ['1:1-17', '1:18-21']);
    assert.deepEqual(suvRanges('Isa 9,7 – 10,4'), ['9:8-21', '10:1-4']);
    assert.deepEqual(suvRanges('Mhu 5, 9 - 6, 8'), ['5:10-20', '6:1-8']);
    // Verses are still labelled as the citation counts them
    const mal = resolve('Mal 3,19-24').suv.spans[0];
    assert.equal(mal.bookChapter + ':' + (mal.vStart + mal.offset), '3:19');
    // A verse past the chapter's end: the citation already counts as SUV does
    assert.deepEqual(suvRanges('Yoeli 2:21-32 Siku za mwisho'), ['2:21-32']);
    // Books numbered alike are left as they are
    assert.deepEqual(suvRanges('Isa 1,1-18'), ['1:1-18']);
    assert.deepEqual(suvRanges('Amo 1,1 – 2,3'), ['1:1-null', '2:1-3']);
});

test('the Greek parts of Daniel and Esther are not fetched', () => {
    const dan = resolve('Dan 3,8-12. 19-24. 91-97').suv;
    assert.deepEqual(dan.spans.map((s) => s.chapter + ':' + s.vStart + '-' + s.vEnd), ['3:8-12', '3:19-23', '3:24-30']);
    assert.equal(dan.missing, true);
    const est = resolve('Est 14, 1-19').suv;
    assert.deepEqual(est.spans, []);
    assert.equal(est.missing, true);
    assert.equal(resolve('Est 3,1-13. 14-15').suv.missing, false);
});

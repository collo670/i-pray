// The proper psalm antiphons of Feasts and Solemnities (js/sikukuu-antiphons.js):
// the table covers every Feast and Solemnity of the calendar, and forDate()
// gives them on that celebration's day and on no other.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const loadCalendar = require('./load-calendar');

const ROOT = path.join(__dirname, '..', '..');

function loadAntiphons() {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'sikukuu-antiphons.js'), 'utf8'), sandbox, { filename: 'sikukuu-antiphons.js' });
    return sandbox.window.IPraySikukuuAntiphons;
}

const calendar = loadCalendar();
const { ANTIPHONS, forDate, withAlleluia } = loadAntiphons();
const day = (iso) => new Date(iso + 'T08:00:00');

// Every id the calendar gives a Feast or a Solemnity, over enough years for
// every movable day and transfer to come round.
function feastIds() {
    const ids = new Set();
    for (let y = 2025; y <= 2040; y++) {
        for (let d = new Date(y, 0, 1); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
            calendar.celebrationsFor(new Date(d)).forEach((c) => {
                if (c.type === 'Feast' || c.type === 'Solemnity') ids.add(c.id);
            });
        }
    }
    return ids;
}

test('the table has a line for every Feast and Solemnity of the calendar, and nothing else', () => {
    const ids = feastIds();
    assert.deepEqual([...ids].filter((id) => !(id in ANTIPHONS)), [], 'missing from the table');
    assert.deepEqual(Object.keys(ANTIPHONS).filter((id) => !ids.has(id)), [], 'not a Feast or Solemnity');
});

test('each entry is three antiphons with a source, null, or the id of one that is', () => {
    for (const [id, entry] of Object.entries(ANTIPHONS)) {
        if (entry === null) continue;
        if (typeof entry === 'string') {
            assert.ok(entry in ANTIPHONS && typeof ANTIPHONS[entry] !== 'string', id + ' points to ' + entry);
            continue;
        }
        assert.ok(entry.source, id + ' has a source');
        assert.equal(entry.antiphons.length, 3, id);
        entry.antiphons.forEach((a, i) => assert.ok(a.trim().length > 10, id + ' antiphon ' + (i + 1)));
    }
});

for (const [iso, id, first] of [
    ['2027-05-23', 'trinity', 'Enzi yote na nguvu'],
    ['2027-05-30', 'corpus-christi', 'Watu wako wanakula'],
    ['2027-06-04', 'sacred-heart', 'Yesu akasimama'],
    ['2026-11-22', 'christ-the-king', 'Tazameni, mtu']
]) {
    test(id + ': its antiphons on ' + iso + ' only', () => {
        const proper = forDate(day(iso), calendar);
        assert.equal(proper.id, id);
        assert.equal(proper.rank, 'Sherehe');
        assert.equal(proper.antiphons.length, 3);
        assert.ok(proper.antiphons[0].startsWith(first), proper.antiphons[0]);
        assert.deepEqual([...proper.antiphons], [...ANTIPHONS[id].antiphons], 'no aleluya added outside Eastertide');

        // The day before and the day after keep their own antiphons.
        for (const offset of [-1, 1]) {
            const other = day(iso);
            other.setDate(other.getDate() + offset);
            const p = forDate(other, calendar);
            assert.ok(!p || p.id !== id, id + ' antiphons on ' + other.toDateString());
        }
    });
}

test('the same antiphons come back for that solemnity in another year', () => {
    assert.equal(forDate(day('2026-05-31'), calendar).id, 'trinity');
    assert.equal(forDate(day('2028-11-26'), calendar).id, 'christ-the-king');
});

test('nothing on an ordinary day, a memorial, or All Souls (which has psalms of its own)', () => {
    assert.equal(forDate(day('2026-11-04'), calendar), null); // Charles Borromeo, a memorial
    assert.equal(forDate(day('2026-11-05'), calendar), null); // a weekday
    assert.equal(forDate(day('2026-11-02'), calendar), null); // All Souls
});

test('every other Feast and Solemnity has its antiphons on its day, every year', () => {
    const missing = new Set();
    for (let y = 2025; y <= 2040; y++) {
        for (let d = new Date(y, 0, 1, 8); d.getFullYear() === y; d.setDate(d.getDate() + 1)) {
            const c = calendar.celebrationFor(new Date(d));
            if (!c || (c.type !== 'Feast' && c.type !== 'Solemnity') || c.id === '11-02') continue;
            const proper = forDate(new Date(d), calendar);
            if (!proper || proper.id !== c.id) missing.add(c.id + ' ' + d.toDateString());
        }
    }
    assert.deepEqual([...missing], []);
});

test('the Easter octave has the antiphons of Easter Sunday', () => {
    assert.deepEqual([...forDate(day('2027-03-29'), calendar).antiphons], [...forDate(day('2027-03-28'), calendar).antiphons]);
});

test('St Matthias has "aleluya" in Eastertide only', () => {
    const easter = forDate(day('2027-05-14'), calendar); // before Pentecost (16 May)
    const after = forDate(day('2035-05-14'), calendar); // after Pentecost (13 May)
    assert.equal(easter.id, '05-14');
    assert.equal(after.id, '05-14');
    easter.antiphons.forEach((a) => assert.match(a, /, aleluya\.$/));
    after.antiphons.forEach((a) => assert.doesNotMatch(a, /aleluya/));
});

test('in Eastertide "aleluya" ends every antiphon', () => {
    assert.equal(withAlleluia('Mwanangu, nipe moyo wako.'), 'Mwanangu, nipe moyo wako, aleluya.');
    assert.equal(withAlleluia('Jina jipya, aleluya.'), 'Jina jipya, aleluya.');
    // A Solemnity kept in Eastertide (e.g. the Annunciation moved after Easter).
    const easter = {
        celebrationFor: () => ({ id: 'sacred-heart', type: 'Solemnity', nameSw: 'Moyo Mtakatifu', rankLabel: 'Sherehe' }),
        today: () => ({ season: 'Easter' })
    };
    const proper = forDate(day('2027-04-05'), easter);
    proper.antiphons.forEach((a) => assert.match(a, /, aleluya\.$/));
    assert.equal(proper.antiphons[2], 'Mwanangu, nipe moyo wako, uzingatie ushauri wangu, aleluya.');
});

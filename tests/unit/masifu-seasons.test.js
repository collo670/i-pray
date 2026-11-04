// Masifu ya Asubuhi: which seasonal antiphon js/masifu.js picks for a day,
// and the content rules that pick depends on.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..', '..');
const CONTENT = path.join(ROOT, 'content', 'masifu-asubuhi');

function loadMasifu() {
    const sandbox = { window: {} };
    vm.runInNewContext(fs.readFileSync(path.join(ROOT, 'js', 'masifu.js'), 'utf8'), sandbox, { filename: 'masifu.js' });
    return sandbox.window.__masifu;
}

const { seasonInfo, classifyAntiphon, appliesToday } = loadMasifu();

function applies(label, isoDate) {
    const cls = classifyAntiphon('Ant. ya ' + label + ': maneno.');
    assert.equal(cls.kind, 'season', label);
    return appliesToday(cls, seasonInfo(isoDate + 'T08:00:00'));
}

test('the Sundays of Lent are counted, Palm Sunday aside', () => {
    assert.equal(seasonInfo('2027-02-14T08:00:00').lentSunday, 1);
    assert.equal(seasonInfo('2027-03-14T08:00:00').lentSunday, 5);
    assert.equal(seasonInfo('2027-03-21T08:00:00').lentSunday, null); // Palm Sunday
    assert.equal(seasonInfo('2027-02-17T08:00:00').lentSunday, null); // a weekday
});

for (const [label, yes, no] of [
    // label, dates it applies on, dates it does not
    ['Majilio', ['2026-11-29', '2026-12-20'], ['2026-12-25', '2026-11-28']],
    ['Kipindi cha Majilio I (hadi Des. 16)', ['2026-12-16'], ['2026-12-25']],
    ['Kipindi cha Majilio II (Desemba 17-23)', ['2026-12-17', '2026-12-23'], ['2026-12-16', '2026-12-24']],
    ['Kipindi cha Noeli I (kabla ya Tokeo la Bwana)', ['2026-12-25', '2027-01-05'], ['2027-01-06', '2026-12-24']],
    ['Kipindi cha Noeli II (baada ya Tokeo la Bwana)', ['2027-01-06', '2027-01-10'], ['2027-01-05', '2027-01-11']],
    ['Kipindi cha Kwaresima I (pamoja na Juma Kuu)', ['2027-02-10', '2027-03-23'], ['2027-03-28']],
    ['Kipindi cha Kwaresima II (isipokuwa kwa Juma Kuu)', ['2027-02-10', '2027-03-20'], ['2027-03-21', '2027-03-23']],
    ['Kwaresima (Jumapili 1)', ['2027-02-14'], ['2027-02-15', '2027-03-14']],
    ['Kwaresima (Jumapili 5)', ['2027-03-14'], ['2027-02-14', '2027-03-21']],
    ['Kwaresima', ['2027-02-15', '2027-03-23'], ['2027-03-28']],
    ['Kipindi cha Pasaka I (hadi Kupaa)', ['2027-03-28', '2027-05-05'], ['2027-05-06']],
    ['Kipindi cha Pasaka II (Kupaa hadi Pentekoste)', ['2027-05-06', '2027-05-16'], ['2027-05-05', '2027-05-17']],
    ['Kipindi cha Pasaka', ['2027-03-28', '2027-05-16'], ['2027-05-17']]
]) {
    test('"Ant. ya ' + label + '" follows its days', () => {
        for (const d of yes) assert.equal(applies(label, d), true, label + ' on ' + d);
        for (const d of no) assert.equal(applies(label, d), false, label + ' on ' + d);
    });
}

test('no antiphon in the content is hidden by an inline style (masifu.js does the hiding)', () => {
    const hidden = fs.readdirSync(CONTENT)
        .filter((f) => /<p class="antiphon"[^>]*\sstyle=/.test(fs.readFileSync(path.join(CONTENT, f), 'utf8')));
    assert.deepEqual(hidden, []);
});

test('every page has the invitatory antiphon of each season', () => {
    const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.html'));
    assert.equal(files.length, 28);
    for (const f of files) {
        const html = fs.readFileSync(path.join(CONTENT, f), 'utf8');
        const head = html.slice(0, html.indexOf('Zaburi 95'));
        const labels = [...head.matchAll(/<p class="antiphon">Ant\. ya ([^:]+):/g)].map((m) => m[1]);
        assert.equal(labels.length, 9, f);
        assert.equal(labels[0], 'Kawaida ya Mwaliko', f);
    }
});

// The Swahili Office of Readings data (data/office-readings-sw/*.json, made
// by scripts/extract-office-readings-sw.js) and the parser behind it.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { isHeadingLine, untilHeading } = require('../../scripts/lib/readings-sw');

const DIR = path.join(__dirname, '..', '..', 'data', 'office-readings-sw');
const load = (name) => JSON.parse(fs.readFileSync(path.join(DIR, name + '.json'), 'utf8'));

// A run of capitalised words is a heading that leaked into the text.
const LEAKED_HEADING = /\b[A-Z]{3,}[.,]?\s+(?:[A-Z]{2,}[.,]?\s+)*[A-Z]{3,}\b/;

function checkDay(where, day) {
    assert.ok(day.firstReading && day.firstReading.citation, where + ': first reading citation');
    assert.ok(day.secondReading.paragraphs.length > 0, where + ': second reading');
    for (const r of [day.responsory1, day.responsory2]) {
        assert.ok(r.verses.length >= 2, where + ': responsory verses');
        r.verses.forEach((v) => {
            assert.match(v.speaker, /^[KW]$/, where);
            assert.doesNotMatch(v.text, LEAKED_HEADING, where + ': ' + v.text.slice(-60));
        });
    }
    day.secondReading.paragraphs.forEach((p) => assert.doesNotMatch(p, LEAKED_HEADING, where));
}

test('headings are recognised, readings are not', () => {
    assert.ok(isHeadingLine('JUMA LA PILI. KIPINDI CHA MWAKA'));
    assert.ok(isHeadingLine('UTATU MTAKATIFU'));
    assert.ok(isHeadingLine('KIPINDI CHA NOELI'));
    assert.ok(!isHeadingLine('K. Natazama toka mbali, ninaona kufika uwezo wa Bwana'));
    assert.ok(!isHeadingLine('YBS 1,5.7.8'));
    assert.ok(!isHeadingLine('Isa 1,16,18.17'));
    assert.equal(untilHeading('W. Na kuzishika amri zake.\nJUMA LA PILI. KIPINDI CHA MWAKA\nDOMINIKA'), 'W. Na kuzishika amri zake.');
});

test('Ordinary Time weeks 1-34', () => {
    for (let w = 1; w <= 34; w++) {
        const week = load('week-' + w);
        assert.equal(week.weekNum, w);
        const days = Object.keys(week.days);
        assert.ok(days.length >= (w === 1 ? 6 : 7), 'week ' + w + ' has ' + days.length + ' days');
        days.forEach((k) => checkDay('week ' + w + ' ' + k, week.days[k]));
    }
});

test('Trinity Sunday and Corpus Christi', () => {
    const s = load('solemnities');
    checkDay('trinity', s.trinity);
    checkDay('corpus-christi', s['corpus-christi']);
    assert.equal(s.trinity.firstReading.citation, 'I Kor 2, 1-16');
});

test('Advent and Christmas', () => {
    const ac = load('advent-christmas');
    for (const w of ['1', '2', '3']) {
        for (const day of ['dominika', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa']) {
            checkDay('advent ' + w + ' ' + day, ac.advent[w][day]);
        }
    }
    const dated = [];
    for (let d = 17; d <= 31; d++) dated.push('12-' + d);
    for (let d = 1; d <= 12; d++) dated.push('01-' + String(d).padStart(2, '0'));
    dated.forEach((k) => checkDay(k, ac.dated[k]));
    checkDay('holy family', ac.holyFamily);
    checkDay('baptism', ac.baptism);
    assert.equal(ac.advent['1'].dominika.firstReading.citation, 'Isa 1,1-18');
});

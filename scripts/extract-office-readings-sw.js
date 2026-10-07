#!/usr/bin/env node
/*
 * Extracts the Swahili Office of Readings (Ofisi ya Masomo) from the source
 * PDFs into small JSON files the app looks up offline, with no PDF parsing
 * at runtime:
 *
 *   docs/pdfs/MwakaSehemu1-3.pdf  -> data/office-readings-sw/week-1..34.json
 *                                    (Ordinary Time, by week and weekday)
 *                                 -> data/office-readings-sw/solemnities.json
 *                                    (Trinity Sunday, Corpus Christi)
 *   docs/pdfs/MajilioNaNoeli.pdf  -> data/office-readings-sw/advent-christmas.json
 *                                    (Advent weeks 1-3 by weekday, 18-24
 *                                    December, the Christmas season by date,
 *                                    Holy Family, Baptism of the Lord)
 *
 * Usage: npm run extract:readings-sw
 *
 * The books have no Swahili Office of Readings for Lent or Easter, and the
 * Advent book none for 17 December, the Fourth Sunday of Advent or the
 * Second Sunday after Christmas: on those days the app shows the English
 * office with a note.
 */
const fs = require('fs');
const path = require('path');
const { pdfText, parseDays } = require('./lib/readings-sw');

const ROOT = path.join(__dirname, '..');
const PDF = (name) => path.join(ROOT, 'docs', 'pdfs', name);
// One small file per week (not one 850KB blob), so the app only fetches the
// current week's ~25KB.
const OUT_DIR = path.join(ROOT, 'data', 'office-readings-sw');

// Swahili number words used in "JUMA LA <word>" / "<DAY> YA <word>".
const WEEK_WORD_TO_NUM = {
    'KWANZA': 1, 'PILI': 2, 'TATU': 3, 'NNE': 4, 'TANO': 5, 'SITA': 6, 'SABA': 7, 'NANE': 8, 'TISA': 9, 'KUMI': 10,
    'KUMI NA MOJA': 11, 'KUMI NA MBILI': 12, 'KUMI NA TATU': 13, 'KUMI NA NNE': 14, 'KUMI NA TANO': 15,
    'KUMI NA SITA': 16, 'KUMI NA SABA': 17, 'KUMI NA NANE': 18, 'KUMI NA TISA': 19, 'ISHIRINI': 20,
    'ISHIRINI NA MOJA': 21, 'ISHIRINI NA MBILI': 22, 'ISHIRINI NA TATU': 23, 'ISHIRINI NA NNE': 24,
    'ISHIRINI NA TANO': 25, 'ISHIRINI NA SITA': 26, 'ISHIRINI NA SABA': 27, 'ISHIRINI NA NANE': 28,
    'ISHIRINI NA TISA': 29, 'THELATHINI': 30, 'THELATHINI NA MOJA': 31, 'THELATHINI NA MBILI': 32,
    'THELATHINI NA TATU': 33, 'THELATHINI NA NNE': 34
};
const NUM_TO_WEEK_LABEL = {};
Object.keys(WEEK_WORD_TO_NUM).forEach((word) => {
    NUM_TO_WEEK_LABEL[WEEK_WORD_TO_NUM[word]] = word.split(' ').map((w) => w[0] + w.slice(1).toLowerCase()).join(' ');
});

// Day word as printed -> app day key (matching Date#getDay(), 0 = Sunday).
const DAY_WORD_TO_KEY = {
    'DOMINIKA': 'dominika', 'JUMATATU': 'jumatatu', 'JUMANNE': 'jumanne', 'JUMATANO': 'jumatano',
    'ALHAMISI': 'alhamisi', 'IJUMAA': 'ijumaa', 'JUMAMOSI': 'jumamosi',
    // A literal typo in Mwaka Sehemu 1 (week 7, Monday).
    'JUAMATATU': 'jumatatu'
};
const DAY_KEY_TO_LABEL = {
    dominika: 'Dominika', jumatatu: 'Jumatatu', jumanne: 'Jumanne', jumatano: 'Jumatano',
    alhamisi: 'Alhamisi', ijumaa: 'Ijumaa', jumamosi: 'Jumamosi'
};
const DAY_ALT = Object.keys(DAY_WORD_TO_KEY).join('|');
// Longest first, so "KUMI NA MOJA" is tried before "KUMI".
const WEEK_ALT = Object.keys(WEEK_WORD_TO_NUM).sort((a, b) => b.length - a.length).join('|');
const pad = (n) => String(n).padStart(2, '0');
const cap = (w) => w[0] + w.slice(1).toLowerCase();

const log = (msg) => console.warn('  ' + msg);

async function ordinaryTime() {
    const weeks = {};
    const solemnities = {};
    let total = 0;
    for (const name of ['MwakaSehemu1.pdf', 'MwakaSehemu2.pdf', 'MwakaSehemu3.pdf']) {
        const text = await pdfText(PDF(name));
        const days = parseDays(text, [
            {
                re: new RegExp('^(' + DAY_ALT + ')\\s+YA\\s+(' + WEEK_ALT + ')\\b', 'gm'),
                key: (m) => WEEK_WORD_TO_NUM[m[2]] ? WEEK_WORD_TO_NUM[m[2]] + ':' + DAY_WORD_TO_KEY[m[1]] : null,
                label: (m) => DAY_KEY_TO_LABEL[DAY_WORD_TO_KEY[m[1]]] + ' ya ' + NUM_TO_WEEK_LABEL[WEEK_WORD_TO_NUM[m[2]]]
            },
            // Solemnities of the Lord after Pentecost, printed after week 10.
            {
                re: /^DOMINIKA YA ([12]) BAADA YA PENTEKOSTE/gm,
                key: (m) => (m[1] === '1' ? 'trinity' : 'corpus-christi'),
                label: (m) => (m[1] === '1' ? 'Utatu Mtakatifu' : 'Mwili na Damu ya Kristo')
            }
        ], log);
        console.log(name + ': ' + days.length + ' days');
        days.forEach((d) => {
            const { key, ...day } = d;
            if (key === 'trinity' || key === 'corpus-christi') { solemnities[key] = day; return; }
            const [week, dayKey] = key.split(':');
            const weekNum = Number(week);
            weeks[weekNum] = weeks[weekNum] || {};
            weeks[weekNum][dayKey] = Object.assign({ weekNum, weekLabel: 'Juma la ' + NUM_TO_WEEK_LABEL[weekNum] }, day);
            total++;
        });
    }

    const index = { source: 'Ofisi ya Masomo - Kipindi cha Mwaka (Mwaka Sehemu 1-3)', language: 'sw', weeksCovered: '1-34', totalDays: total, weeks: {} };
    for (let w = 1; w <= 34; w++) {
        const days = weeks[w] ? Object.keys(weeks[w]) : [];
        index.weeks[w] = days;
        if (days.length) {
            fs.writeFileSync(path.join(OUT_DIR, 'week-' + w + '.json'),
                JSON.stringify({ weekNum: w, weekLabel: 'Juma la ' + NUM_TO_WEEK_LABEL[w], days: weeks[w] }), 'utf8');
        }
        const expected = w === 1 ? 6 : 7; // week 1 has no Sunday (the Baptism of the Lord takes it)
        if (days.length < expected) console.log('  week ' + w + ': ' + days.length + '/' + expected + ' days');
    }
    fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');
    fs.writeFileSync(path.join(OUT_DIR, 'solemnities.json'), JSON.stringify(solemnities), 'utf8');
    console.log('Ordinary Time: ' + total + ' days; solemnities: ' + Object.keys(solemnities).join(', '));
}

async function adventChristmas() {
    const text = await pdfText(PDF('MajilioNaNoeli.pdf'));
    const days = parseDays(text, [
        {
            re: new RegExp('^(' + DAY_ALT + ')\\s+YA\\s+(KWANZA|PILI|TATU|NNE)\\s+YA\\s+MAJILIO', 'gm'),
            key: (m) => 'advent:' + WEEK_WORD_TO_NUM[m[2]] + ':' + DAY_WORD_TO_KEY[m[1]],
            label: (m) => cap(m[1]) + ' ya ' + cap(m[2]) + ' ya Majilio'
        },
        { re: /^(\d{1,2})\s+D[EI]SEMBA\b/gm, key: (m) => '12-' + pad(m[1]), label: (m) => Number(m[1]) + ' Desemba' },
        { re: /^D[EI]SEMBA\s+(\d{1,2})\b/gm, key: (m) => '12-' + pad(m[1]), label: (m) => Number(m[1]) + ' Desemba' },
        { re: /^JANUARI\s+(\d{1,2})\b/gm, key: (m) => '01-' + pad(m[1]), label: (m) => Number(m[1]) + ' Januari' },
        { re: /^DOMINIKA KATIKA OKTAVA YA NOELI/gm, key: () => 'holy-family', label: () => 'Familia Takatifu ya Yesu, Maria na Yosefu' },
        { re: /^DOMINIKA\s+BAADA\s+YA\s+EPIFANIA/gm, key: () => 'baptism', label: () => 'Ubatizo wa Bwana' }
    ], log);

    const out = { source: 'Ofisi ya Masomo - Majilio na Noeli', language: 'sw', advent: {}, dated: {} };
    days.forEach((d) => {
        const { key, ...day } = d;
        if (key.indexOf('advent:') === 0) {
            const [, week, dayKey] = key.split(':');
            (out.advent[week] = out.advent[week] || {})[dayKey] = day;
        } else if (key === 'holy-family' || key === 'baptism') {
            out[key === 'holy-family' ? 'holyFamily' : 'baptism'] = day;
        } else {
            out.dated[key] = day;
        }
    });
    fs.writeFileSync(path.join(OUT_DIR, 'advent-christmas.json'), JSON.stringify(out), 'utf8');
    console.log('Advent and Christmas: ' + days.length + ' days ('
        + Object.keys(out.advent).map((w) => 'Advent ' + w + ': ' + Object.keys(out.advent[w]).length).join(', ')
        + '; dated: ' + Object.keys(out.dated).sort().join(' ') + ')');
}

async function main() {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    await ordinaryTime();
    await adventChristmas();
}

main().catch((err) => { console.error(err); process.exit(1); });

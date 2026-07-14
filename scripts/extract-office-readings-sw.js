#!/usr/bin/env node
/*
 * Extracts the Swahili Office of Readings (Ofisi ya Masomo) for Ordinary Time
 * weeks 1-34 from the three source PDFs (Mwaka Sehemu 1/2/3) and writes a
 * structured JSON file the app can look up offline, with no PDF parsing at
 * runtime.
 *
 * Usage: node scripts/extract-office-readings-sw.js
 */
const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const PDFS = [
    path.join(__dirname, '..', 'docs', 'pdfs', 'MwakaSehemu1.pdf'),
    path.join(__dirname, '..', 'docs', 'pdfs', 'MwakaSehemu2.pdf'),
    path.join(__dirname, '..', 'docs', 'pdfs', 'MwakaSehemu3.pdf')
];
// One small JSON file per liturgical week (not one 850KB blob), so the app
// only ever fetches the current week's ~25KB - not the whole liturgical year.
const OUT_DIR = path.join(__dirname, '..', 'data', 'office-readings-sw');

// Swahili number-word -> week number (1-34), as used in "JUMA LA <word>" /
// "<DAY> YA <word>" headers in the source text.
const WEEK_WORD_TO_NUM = {
    'KWANZA': 1, 'PILI': 2, 'TATU': 3, 'NNE': 4, 'TANO': 5, 'SITA': 6, 'SABA': 7, 'NANE': 8, 'TISA': 9, 'KUMI': 10,
    'KUMI NA MOJA': 11, 'KUMI NA MBILI': 12, 'KUMI NA TATU': 13, 'KUMI NA NNE': 14, 'KUMI NA TANO': 15,
    'KUMI NA SITA': 16, 'KUMI NA SABA': 17, 'KUMI NA NANE': 18, 'KUMI NA TISA': 19, 'ISHIRINI': 20,
    'ISHIRINI NA MOJA': 21, 'ISHIRINI NA MBILI': 22, 'ISHIRINI NA TATU': 23, 'ISHIRINI NA NNE': 24,
    'ISHIRINI NA TANO': 25, 'ISHIRINI NA SITA': 26, 'ISHIRINI NA SABA': 27, 'ISHIRINI NA NANE': 28,
    'ISHIRINI NA TISA': 29, 'THELATHINI': 30, 'THELATHINI NA MOJA': 31, 'THELATHINI NA MBILI': 32,
    'THELATHINI NA TATU': 33, 'THELATHINI NA NNE': 34
};
// Reverse map, properly capitalised, for building display labels.
const NUM_TO_WEEK_LABEL = {};
Object.keys(WEEK_WORD_TO_NUM).forEach(word => {
    const n = WEEK_WORD_TO_NUM[word];
    NUM_TO_WEEK_LABEL[n] = word.split(' ').map(w => w[0] + w.slice(1).toLowerCase()).join(' ');
});

// Source day-name (as printed) -> app day key, matching Date#getDay() (0=Sun).
const DAY_WORD_TO_KEY = {
    'DOMINIKA': 'dominika', 'JUMATATU': 'jumatatu', 'JUMANNE': 'jumanne', 'JUMATANO': 'jumatano',
    'ALHAMISI': 'alhamisi', 'IJUMAA': 'ijumaa', 'JUMAMOSI': 'jumamosi',
    // JUAMATATU: a literal typo present in the Mwaka Sehemu 1 source PDF
    // (week 7, Monday) - tolerated so that day isn't silently dropped.
    'JUAMATATU': 'jumatatu'
};
const DAY_KEY_TO_LABEL = {
    dominika: 'Dominika', jumatatu: 'Jumatatu', jumanne: 'Jumanne', jumatano: 'Jumatano',
    alhamisi: 'Alhamisi', ijumaa: 'Ijumaa', jumamosi: 'Jumamosi'
};

const DAY_ALT = Object.keys(DAY_WORD_TO_KEY).join('|');
// Week phrases, longest first, so "KUMI NA MOJA" is tried before "KUMI" -
// alternation picks the first matching branch, not the longest overall.
const WEEK_PHRASE_ALT = Object.keys(WEEK_WORD_TO_NUM)
    .sort((a, b) => b.length - a.length)
    .join('|');
// A day header, e.g. "JUMATATU  YA KUMI NA MOJA" (whitespace between words in
// the extracted PDF text is irregular). Sometimes the following field
// ("SOMO LA KWANZA...") gets glued onto the same line by the PDF extractor
// at a page break, so this is NOT anchored to end-of-line - only end-of-match
// (a following field name or another word boundary) matters.
const DAY_HEADER_RE = new RegExp('^(' + DAY_ALT + ')\\s+YA\\s+(' + WEEK_PHRASE_ALT + ')\\b', 'gm');

function cleanText(raw) {
    // Strip the running page header/footer line, which repeats once per page
    // and carries no reading content (e.g. "Kipindi cha kawaida ... Ofisi ya
    // Masomo - 85" or "86 - Ofisi ya Masomo ... Kipindi cha kawaida").
    return raw
        .split('\n')
        .filter(line => !/Ofisi ya [Mm]asomo/.test(line))
        .join('\n');
}

// The source attribution line ("Toka ...", "Tokea ...", "Mwanzo wa ...")
// isn't reliably separated from the title/body by a blank line in the
// source, so it's pulled off by line content rather than paragraph position.
const RE_SOURCE_LINE = /^(Tok(a|ea)|Mwanzo wa)\b/i;

function splitSourceAndParagraphs(block) {
    const lines = block.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim());
    let start = 0;
    while (start < lines.length && lines[start] === '') start++;
    let source = '';
    if (start < lines.length && RE_SOURCE_LINE.test(lines[start])) {
        source = lines[start];
        lines[start] = '';
    }
    return { source, paragraphs: normaliseParagraphs(lines.join('\n')) };
}

function normaliseParagraphs(block) {
    // Collapse runs of internal whitespace within a line, keep blank lines as
    // paragraph separators, drop now-empty lines.
    const lines = block.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim());
    const paragraphs = [];
    let current = [];
    for (const line of lines) {
        if (line === '') {
            if (current.length) { paragraphs.push(current.join(' ')); current = []; }
        } else {
            current.push(line);
        }
    }
    if (current.length) paragraphs.push(current.join(' '));
    return paragraphs.filter(Boolean);
}

// Splits a responsory block ("Kiitikizano:" citation + K./W./K. verses) into
// a citation and an array of {speaker, text}. K./W. lines are not reliably
// separated by blank lines in the source, so this scans for the markers
// directly across the flattened block rather than relying on paragraphing.
function parseResponsory(block) {
    const flat = block.replace(/\s+/g, ' ').trim();
    const markerRe = /\b([KW])\.\s*/g;
    const matches = [...flat.matchAll(markerRe)];
    if (!matches.length) return { citation: flat, verses: [] };
    const citation = flat.slice(0, matches[0].index).trim();
    const verses = [];
    for (let i = 0; i < matches.length; i++) {
        const start = matches[i].index + matches[i][0].length;
        const end = i + 1 < matches.length ? matches[i + 1].index : flat.length;
        const text = flat.slice(start, end).trim();
        if (text) verses.push({ speaker: matches[i][1], text });
    }
    return { citation, verses };
}

// Field markers occasionally get split across a line break by the PDF
// extractor (e.g. "SOMO\nLA KWANZA:"), so whitespace between words - not just
// spaces - must be tolerated.
const RE_SOMO_KWANZA = /SOMO\s+LA\s+KWANZA:?/i;
const RE_SOMO_PILI = /SOMO\s+LA\s+PILI:?/i;
const RE_KIITIKIZANO = /Kiitikizano:?/gi;

function parseDayChunk(chunk) {
    const firstM = RE_SOMO_KWANZA.exec(chunk);
    const secondM = RE_SOMO_PILI.exec(chunk);
    const firstIdx = firstM ? firstM.index : -1;
    const secondIdx = secondM ? secondM.index : -1;
    RE_KIITIKIZANO.lastIndex = 0;
    const kiiIdx = [...chunk.matchAll(RE_KIITIKIZANO)].map(m => ({ index: m.index, len: m[0].length }));

    if (firstIdx === -1 || secondIdx === -1 || kiiIdx.length < 2) return null;
    const kii1 = kiiIdx.find(k => k.index > firstIdx && k.index < secondIdx);
    const kii2 = kiiIdx.find(k => k.index > secondIdx);
    if (!kii1 || !kii2) return null;

    const firstReadingBlock = chunk.slice(firstIdx + firstM[0].length, kii1.index);
    const responsory1Block = chunk.slice(kii1.index + kii1.len, secondIdx);
    const secondReadingBlock = chunk.slice(secondIdx + secondM[0].length, kii2.index);
    const responsory2Block = chunk.slice(kii2.index + kii2.len);

    const firstReadingParas = normaliseParagraphs(firstReadingBlock);
    const secondReading = splitSourceAndParagraphs(secondReadingBlock);
    if (!secondReading.paragraphs.length) return null;

    return {
        firstReading: { citation: firstReadingParas.join(' ') },
        responsory1: parseResponsory(responsory1Block),
        secondReading: secondReading,
        responsory2: parseResponsory(responsory2Block)
    };
}

async function extractFromPdf(filePath) {
    const buf = fs.readFileSync(filePath);
    const data = await pdf(buf);
    return cleanText(data.text);
}

function findDayHeaders(text) {
    // Collapse intra-line whitespace runs (irregular spacing from PDF
    // extraction) while preserving line breaks, so ^ anchors stay meaningful
    // and week phrases match against single-spaced text.
    const normalised = text.split('\n').map(l => l.replace(/[ \t]+/g, ' ').trim()).join('\n');
    const headers = [];
    let m;
    DAY_HEADER_RE.lastIndex = 0;
    while ((m = DAY_HEADER_RE.exec(normalised)) !== null) {
        const dayKey = DAY_WORD_TO_KEY[m[1]];
        const weekNum = WEEK_WORD_TO_NUM[m[2]];
        if (weekNum) {
            headers.push({ index: m.index, endOfHeader: m.index + m[0].length, dayKey, weekNum });
        }
    }
    return { headers, normalised };
}

async function main() {
    const weeks = {};
    let totalDays = 0;
    let skipped = 0;

    for (const pdfPath of PDFS) {
        const rawText = await extractFromPdf(pdfPath);
        const { headers, normalised: text } = findDayHeaders(rawText);
        console.log(path.basename(pdfPath) + ': found ' + headers.length + ' day headers');

        for (let i = 0; i < headers.length; i++) {
            const h = headers[i];
            const chunkEnd = i + 1 < headers.length ? headers[i + 1].index : text.length;
            const chunk = text.slice(h.endOfHeader, chunkEnd);
            const parsed = parseDayChunk(chunk);
            if (!parsed) { skipped++; console.warn('  could not parse week ' + h.weekNum + ' ' + h.dayKey); continue; }

            if (!weeks[h.weekNum]) weeks[h.weekNum] = {};
            weeks[h.weekNum][h.dayKey] = Object.assign({
                weekNum: h.weekNum,
                weekLabel: 'Juma la ' + NUM_TO_WEEK_LABEL[h.weekNum],
                dayLabel: DAY_KEY_TO_LABEL[h.dayKey] + ' ya ' + NUM_TO_WEEK_LABEL[h.weekNum]
            }, parsed);
            totalDays++;
        }
    }

    fs.mkdirSync(OUT_DIR, { recursive: true });
    const index = { source: 'Ofisi ya Masomo - Kipindi cha Mwaka (Mwaka Sehemu 1-3)', language: 'sw', weeksCovered: '1-34', generatedAt: new Date().toISOString(), totalDays, skipped, weeks: {} };
    for (let w = 1; w <= 34; w++) {
        const days = weeks[w] ? Object.keys(weeks[w]) : [];
        index.weeks[w] = days;
        if (days.length) {
            fs.writeFileSync(path.join(OUT_DIR, 'week-' + w + '.json'), JSON.stringify({ weekNum: w, weekLabel: 'Juma la ' + NUM_TO_WEEK_LABEL[w], days: weeks[w] }), 'utf8');
        }
    }
    fs.writeFileSync(path.join(OUT_DIR, 'index.json'), JSON.stringify(index), 'utf8');
    console.log('Wrote ' + OUT_DIR + '/week-*.json (' + totalDays + ' days, ' + skipped + ' skipped)');

    const missingWeeks = [];
    for (let w = 1; w <= 34; w++) if (!weeks[w]) missingWeeks.push(w);
    if (missingWeeks.length) console.log('Weeks with NO days at all: ' + missingWeeks.join(', '));
    for (let w = 1; w <= 34; w++) {
        if (!weeks[w]) continue;
        const days = Object.keys(weeks[w]);
        const expected = w === 1 ? 6 : 7; // week 1 of OT has no Sunday (Baptism of the Lord takes it)
        if (days.length < expected) console.log('Week ' + w + ': only ' + days.length + '/' + expected + ' days (' + days.join(',') + ')');
    }
}

main().catch(err => { console.error(err); process.exit(1); });

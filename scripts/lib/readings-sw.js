/*
 * Parsing shared by the Swahili Office of Readings extractors
 * (scripts/extract-office-readings-sw.js). Each source book lays a day out
 * the same way:
 *
 *   <DAY HEADING>
 *   SOMO LA KWANZA: <citation>
 *   Kiitikizano: <citation>  K. ... W. ... K. ...
 *   SOMO LA PILI:
 *   Toka <source>
 *   <title and paragraphs>
 *   Kiitikizano: <citation>  K. ... W. ... K. ...
 *
 * followed by the next day's heading - or by a section heading in capitals
 * ("JUMA LA PILI. KIPINDI CHA MWAKA", "KIPINDI CHA NOELI", "UTATU
 * MTAKATIFU"), which must not be read as part of the last responsory.
 */
const pdf = require('pdf-parse');
const fs = require('fs');

async function pdfText(filePath) {
    const data = await pdf(fs.readFileSync(filePath));
    return cleanText(data.text);
}

// Strips the running page header/footer line, which repeats once per page
// and carries no reading content (e.g. "Kipindi cha kawaida ... Ofisi ya
// Masomo - 85"), and collapses irregular spacing inside lines.
function cleanText(raw) {
    return raw
        .split('\n')
        .filter((line) => !/Ofisi ya [Mm]asomo/.test(line))
        .map((l) => l.replace(/[ \t]+/g, ' ').trim())
        .join('\n');
}

// A line set entirely in capitals, with at least two words of three or more
// letters, is a heading, never reading text: the readings and responsories
// are in sentence case (K./W. lines included), and a citation has at most
// one capitalised abbreviation.
function isHeadingLine(line) {
    if (/[a-z]/.test(line) || /^[KW]\.\s/.test(line)) return false;
    return line.split(/\s+/).filter((w) => /^[A-Z]{3,}[.,:;]?$/.test(w)).length >= 2;
}

// Cuts a block at its first heading line.
function untilHeading(block) {
    const lines = block.split('\n');
    const at = lines.findIndex((l) => isHeadingLine(l.trim()));
    return at === -1 ? block : lines.slice(0, at).join('\n');
}

const RE_SOURCE_LINE = /^(Tok(a|ea)|Mwanzo wa)\b/i;

function normaliseParagraphs(block) {
    const lines = block.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim());
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

// The source attribution line ("Toka ...", "Tokea ...", "Mwanzo wa ...")
// isn't reliably separated from the title/body by a blank line, so it's
// pulled off by line content rather than paragraph position.
function splitSourceAndParagraphs(block) {
    const lines = block.split('\n').map((l) => l.replace(/[ \t]+/g, ' ').trim());
    let start = 0;
    while (start < lines.length && lines[start] === '') start++;
    let source = '';
    if (start < lines.length && RE_SOURCE_LINE.test(lines[start])) {
        source = lines[start];
        lines[start] = '';
    }
    return { source, paragraphs: normaliseParagraphs(lines.join('\n')) };
}

// Splits a responsory ("Kiitikizano:" citation + K./W./K. verses) into a
// citation and [{speaker, text}]. K./W. lines aren't reliably separated by
// blank lines, so the markers are found across the flattened block.
function parseResponsory(block) {
    const flat = block.replace(/\s+/g, ' ').trim();
    const matches = [...flat.matchAll(/\b([KW])\.\s*/g)];
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

// Field markers are sometimes split across a line break by the PDF
// extractor ("SOMO\nLA KWANZA:"), so any whitespace between words is
// accepted.
const RE_SOMO_KWANZA = /SOMO\s+LA\s+KWANZA\s*:?/i;
const RE_SOMO_PILI = /SOMO\s+LA\s+PILI\s*:?/i;
const RE_KIITIKIZANO = /Kiitikizano:?/gi;

function parseDayChunk(chunk) {
    const firstM = RE_SOMO_KWANZA.exec(chunk);
    const secondM = RE_SOMO_PILI.exec(chunk);
    const firstIdx = firstM ? firstM.index : -1;
    const secondIdx = secondM ? secondM.index : -1;
    const kiiIdx = [...chunk.matchAll(RE_KIITIKIZANO)].map((m) => ({ index: m.index, len: m[0].length }));

    if (firstIdx === -1 || secondIdx === -1 || kiiIdx.length < 2) return null;
    const kii1 = kiiIdx.find((k) => k.index > firstIdx && k.index < secondIdx);
    const kii2 = kiiIdx.find((k) => k.index > secondIdx);
    if (!kii1 || !kii2) return null;

    const firstReadingBlock = chunk.slice(firstIdx + firstM[0].length, kii1.index);
    const responsory1Block = chunk.slice(kii1.index + kii1.len, secondIdx);
    const secondReadingBlock = chunk.slice(secondIdx + secondM[0].length, kii2.index);
    const responsory2Block = untilHeading(chunk.slice(kii2.index + kii2.len));

    const secondReading = splitSourceAndParagraphs(secondReadingBlock);
    if (!secondReading.paragraphs.length) return null;

    return {
        firstReading: { citation: normaliseParagraphs(firstReadingBlock).join(' ') },
        responsory1: parseResponsory(responsory1Block),
        secondReading,
        responsory2: parseResponsory(responsory2Block)
    };
}

/**
 * Finds day headings in `text` with the given matchers and returns one
 * parsed day per heading: [{ key, label, ...parsedDay }]. Each matcher is
 * { re, key(match), label(match) }; `re` must be global and multiline.
 */
function parseDays(text, matchers, log) {
    const heads = [];
    matchers.forEach((m) => {
        m.re.lastIndex = 0;
        let hit;
        while ((hit = m.re.exec(text)) !== null) {
            const key = m.key(hit);
            if (key) heads.push({ index: hit.index, end: hit.index + hit[0].length, key, label: m.label(hit) });
        }
    });
    heads.sort((a, b) => a.index - b.index);
    const days = [];
    heads.forEach((h, i) => {
        const chunk = text.slice(h.end, i + 1 < heads.length ? heads[i + 1].index : text.length);
        const parsed = parseDayChunk(chunk);
        if (!parsed) { if (log) log('could not parse ' + h.key); return; }
        days.push(Object.assign({ key: h.key, dayLabel: h.label }, parsed));
    });
    return days;
}

module.exports = { pdfText, cleanText, isHeadingLine, untilHeading, normaliseParagraphs, splitSourceAndParagraphs, parseResponsory, parseDayChunk, parseDays };

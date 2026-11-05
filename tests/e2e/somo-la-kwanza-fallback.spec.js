// The first reading's secondary source (js/somo-la-kwanza-fallback.js): SUV on
// bolls.life stays the first choice; SRUVDC on Bible.com is asked only for what
// SUV cannot give, and when neither can, the page says what it always said.
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

// Answers the first reading's requests to bolls.life (through the app's
// Worker) with 40 verses naming the book and chapter, or fails them.
async function serveSuv(page, mode) {
    const calls = [];
    await page.route(/\/get-text\/SUV\/\d+\/\d+\//, (route) => {
        const m = route.request().url().match(/get-text\/SUV\/(\d+)\/(\d+)\//);
        calls.push(m[1] + '/' + m[2]);
        if (mode === 'down') return route.abort();
        const verses = [];
        for (let v = 1; v <= 40; v++) verses.push({ verse: v, text: 'Kitabu ' + m[1] + ' sura ' + m[2] + ' aya ' + v });
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify(verses)
        });
    });
    return calls;
}

// Answers Bible.com's chapter API in its own markup - a section heading and a
// cross reference included, which are not Scripture - or fails it. Greek
// Esta's chapters carry lettered verses (17a, 17b ...) under one verse id.
async function serveSruvdc(page, mode) {
    const calls = [];
    await page.route(/^https:\/\/nodejs\.bible\.com\/api\/bible\/chapter\//, (route) => {
        const ref = new URL(route.request().url()).searchParams.get('reference');
        calls.push(ref);
        if (mode === 'down') return route.abort();
        const lettered = ref === 'ESG.4_1';
        const labels = lettered ? 'abcdefghijklmnopqrstuvwx'.split('').map((l) => '17' + l) : Array.from({ length: 70 }, (_, i) => String(i + 1));
        const verses = labels.map((label) => {
            const usfm = ref + '.' + (lettered ? '17' : label);
            const note = label === '1' ? '<span class="note x"><span class="label">#</span><span class="body">MAREJEO</span></span>' : '';
            return '<span class="verse v' + label + '" data-usfm="' + usfm + '"><span class="label">' + label + '</span>' + note +
                '<span class="content">SRUVDC ' + ref + ' aya ' + label + ' </span></span>';
        }).join('');
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify({
                reference: { usfm: [ref], human: ref, version_id: 1817 },
                content: '<div class="chapter"><div class="s"><span class="heading">KICHWA</span></div><div class="p">' + verses + '</div></div>'
            })
        });
    });
    return calls;
}

async function openOn(page, date, { suv = 'up', sruvdc = 'up' } = {}) {
    const errors = collectErrors(page);
    const scripts = [];
    page.on('request', (r) => { if (/somo-la-kwanza-fallback\.js/.test(r.url())) scripts.push(r.url()); });
    await isolate(page, { universalis: 'fail' });
    const suvCalls = await serveSuv(page, suv);
    const sruvdcCalls = await serveSruvdc(page, sruvdc);
    await setLanguage(page, 'sw');
    await page.clock.setFixedTime(date);
    await page.goto('pages/office-of-readings.html');
    return { errors, scripts, suvCalls, sruvdcCalls, office: page.locator('#officeContent') };
}

const CREDIT = /Swahili Revised Union Version \(SRUVDC\)/;

test('a reading SUV has: shown from SUV, the secondary source not even loaded', async ({ page }) => {
    const { errors, scripts, suvCalls, sruvdcCalls, office } = await openOn(page, new Date(2026, 8, 10, 8));
    await expect(office.locator('.sw-citation').first()).toHaveText('Ma 1,1-12. 18-20');
    await expect(office).toContainText('Kitabu 25 sura 1 aya 20');
    await expect(office.locator('sup').first()).toHaveText('1:1');
    expect(suvCalls).toEqual(['25/1']);
    expect(sruvdcCalls).toEqual([]);
    expect(scripts).toEqual([]);
    await expect(office).not.toContainText('SRUVDC');
    expect(errors).toEqual([]);
});

test('Hekima, which SUV lacks: read from SRUVDC, shown as SUV readings are', async ({ page }) => {
    const { errors, suvCalls, sruvdcCalls, office } = await openOn(page, new Date(2026, 9, 29, 8));
    await expect(office.locator('.sw-citation').first()).toHaveText('Hek 7,15-30');
    await expect(office).toContainText('SRUVDC WIS.7 aya 30');
    await expect(office.locator('sup').first()).toHaveText('7:15');
    await expect(office.locator('sup')).toHaveCount(16);
    await expect(office).toContainText(CREDIT);
    await expect(office).not.toContainText('hakipatikani');
    await expect(office).not.toContainText('KICHWA');
    await expect(office).not.toContainText('MAREJEO');
    expect(suvCalls).toEqual([]);
    expect(sruvdcCalls).toEqual(['WIS.7']);
    expect(errors).toEqual([]);
});

test('Danieli\'s Greek part: SUV first, then the whole reading from SRUVDC', async ({ page }) => {
    const { errors, suvCalls, sruvdcCalls, office } = await openOn(page, new Date(2026, 10, 10, 8));
    await expect(office.locator('.sw-citation').first()).toHaveText('Dan 3,8-12. 19-24. 91-97');
    await expect(office).toContainText('SRUVDC S3Y.1 aya 1');
    const labels = await office.locator('sup').allTextContents();
    expect(labels).toEqual(['3:8', '3:9', '3:10', '3:11', '3:12', '3:19', '3:20', '3:21', '3:22', '3:23', '3:24',
        '3:91', '3:92', '3:93', '3:94', '3:95', '3:96', '3:97']);
    // One translation for the whole reading: no SUV verses mixed in.
    await expect(office).not.toContainText('Kitabu 27');
    await expect(office).not.toContainText('nyongeza za Kigiriki');
    expect(suvCalls).toEqual(['27/3']);
    expect(sruvdcCalls.sort()).toEqual(['DAN.3', 'S3Y.1']);
    expect(errors).toEqual([]);
});

test('Esta 14, all Greek: Esta\'s prayer from SRUVDC', async ({ page }) => {
    const { errors, suvCalls, sruvdcCalls, office } = await openOn(page, new Date(2026, 9, 21, 8));
    await expect(office.locator('.sw-citation').first()).toHaveText('Est 14, 1-19');
    await expect(office).toContainText('SRUVDC ESG.4_1 aya 17x');
    await expect(office.locator('sup').first()).toHaveText('4:17j');
    await expect(office.locator('sup')).toHaveCount(15);
    expect(suvCalls).toEqual([]);
    expect(sruvdcCalls).toEqual(['ESG.4_1']);
    expect(errors).toEqual([]);
});

test('SUV not answering: the reading from SRUVDC', async ({ page }) => {
    const { errors, sruvdcCalls, office } = await openOn(page, new Date(2026, 8, 10, 8), { suv: 'down' });
    await expect(office).toContainText('SRUVDC LAM.1 aya 20');
    await expect(office.locator('sup').first()).toHaveText('1:1');
    await expect(office).toContainText(CREDIT);
    expect(sruvdcCalls).toEqual(['LAM.1']);
    expect(errors).toEqual([]);
});

test('neither source answering: the messages the page always gave', async ({ page }) => {
    const hek = await openOn(page, new Date(2026, 9, 29, 8), { sruvdc: 'down' });
    await expect(hek.office).toContainText('Kitabu cha Hekima (Hek) hakipatikani');
    await expect(hek.office.locator('sup')).toHaveCount(0);
    expect(hek.errors).toEqual([]);
});

test('both down for a reading SUV has: the Bolls error, nothing else', async ({ page }) => {
    const { errors, office } = await openOn(page, new Date(2026, 8, 10, 8), { suv: 'down', sruvdc: 'down' });
    await expect(office).toContainText('Imeshindwa kupata andiko kutoka Bolls Bible API kwa sasa.');
    await expect(office.locator('sup')).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('a static Ofisi ya Masomo page: the fallback found next to the primary script', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page);
    const suvCalls = await serveSuv(page, 'up');
    const sruvdcCalls = await serveSruvdc(page, 'up');
    await page.goto('pages/ofisi ya masomo/thelathini/dominika.html');
    await expect(page.locator('body')).toContainText('SRUVDC WIS.1 aya 15');
    await expect(page.locator('sup').first()).toHaveText('1:1');
    await expect(page.locator('body')).toContainText(CREDIT);
    expect(suvCalls).toEqual([]);
    expect(sruvdcCalls).toEqual(['WIS.1']);
    expect(errors).toEqual([]);
});

test('SRUVDC down for a Greek part: SUV\'s verses and the note, as before', async ({ page }) => {
    const { errors, office } = await openOn(page, new Date(2026, 10, 10, 8), { sruvdc: 'down' });
    await expect(office).toContainText('Kitabu 27 sura 3 aya 8');
    await expect(office).toContainText('nyongeza za Kigiriki');
    await expect(office).not.toContainText(CREDIT);
    expect(errors).toEqual([]);
});

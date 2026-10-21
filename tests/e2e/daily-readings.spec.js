// The Kiswahili daily readings (pages/daily-readings.html), from
// mkatolikileo.com: through the Reader (r.jina.ai, Markdown) or, when it is
// down, the site's own HTML through a CORS proxy. The pages in
// tests/fixtures/mkatolikileo/ are the real ones as they were on 21 October
// 2026, with the long readings cut short and the site's scripts taken out.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { collectErrors, setLanguage } = require('./helpers');

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'mkatolikileo');
const fixture = (name) => fs.readFileSync(path.join(FIXTURES, name), 'utf8');
const CORS = { 'access-control-allow-origin': '*' };
// Article id on the site -> saved page
const ARTICLES = { 3942: 'sunday', 3944: 'article' };
const TUESDAY = new Date(2026, 9, 20, 9, 0, 0);
const SUNDAY = new Date(2026, 9, 18, 9, 0, 0);

// reader: 'up' answers r.jina.ai with the saved Markdown; 'down' fails it,
// so the page falls back to the HTML through corsproxy.io.
// list: edits the list of days before it is served.
async function serveSite(page, { reader = 'up', day = TUESDAY, list = (text) => text } = {}) {
    await page.clock.setFixedTime(day);
    await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => {
        const url = route.request().url();
        let target = null, ext = null;
        if (url.startsWith('https://r.jina.ai/')) {
            if (reader !== 'up') return route.abort();
            target = url.slice('https://r.jina.ai/'.length);
            ext = 'md';
        } else if (url.startsWith('https://corsproxy.io/')) {
            target = new URL(url).searchParams.get('url') || '';
            ext = 'html';
        }
        if (!target) return route.abort();
        const id = (target.match(/masomo-ya-misa\/(\d+)\//) || [])[1];
        const name = id ? ARTICLES[id] : /masomo-ya-misa$/.test(target) ? 'list' : null;
        if (!name) return route.fulfill({ status: 404, headers: CORS, body: '' });
        const body = fixture(name + '.' + ext);
        return route.fulfill({
            status: 200,
            headers: CORS,
            contentType: ext === 'md' ? 'text/plain; charset=utf-8' : 'text/html; charset=utf-8',
            body: name === 'list' ? list(body) : body
        });
    });
}

const cards = (page) => page.locator('#readingsContainer article');

for (const reader of ['up', 'down']) {
    test(`Kiswahili readings render from the site's pages (Reader ${reader})`, async ({ page }) => {
        const errors = collectErrors(page);
        await serveSite(page, { reader });
        await setLanguage(page, 'sw');
        await page.goto('pages/daily-readings.html');

        await expect(cards(page)).toHaveCount(4);
        await expect(page.locator('#liturgicalDayTitle')).toHaveText('Jumanne ya 29 ya Mwaka');
        await expect(page.locator('#readingsDate')).toHaveText('Jumanne, 20 Oktoba 2026');
        await expect(cards(page).locator('span')).toHaveText(['Somo la Kwanza', 'Wimbo wa Katikati', 'Shangilio la Injili', 'Injili']);
        await expect(cards(page).locator('p')).toHaveText(['Efe 2:12–22', 'Zab 85:9–14', 'Yn 10:27', 'Lk 12:35-38']);
        await expect(page.locator('#readingsSwNote')).toBeHidden();

        const text = await page.locator('#readingsContainer').innerText();
        expect(text).not.toMatch(/\*\*|\\|\]\(|#|Tafakari|Maoni|Masomo yote|Imependwa|WhatsApp/);

        // The reading, then its response
        const first = cards(page).nth(0);
        await expect(first.locator('.sw-para')).toHaveCount(2);
        await expect(first.locator('.sw-para').first()).toContainText(/^Msisahau kwamba zamani zile/);
        await expect(first.locator('.sw-para').last()).toHaveText('Neno la Bwana. — Tumshukuru Mungu.');
        await expect(first.locator('strong')).toHaveText('Tumshukuru Mungu.');
        // The psalm: its refrain in bold, then three stanzas, each followed
        // by the refrain, with their line breaks
        const psalm = cards(page).nth(1).locator('.sw-para');
        await expect(psalm).toHaveCount(7);
        await expect(psalm.first()).toHaveText('K. Bwana anawaambia watu wake amani.');
        await expect(psalm.first().locator('strong')).toHaveCount(1);
        await expect(psalm.nth(1).locator('br')).toHaveCount(3);
        await expect(psalm.nth(1)).toContainText(/^Nisikie atakavyosema Bwana,/);
        await expect(psalm.nth(2)).toHaveText('K. Bwana anawaambia watu wake amani.');
        await expect(cards(page).nth(2).locator('.sw-para br')).toHaveCount(2);
        await expect(cards(page).nth(3).locator('.sw-para').last()).toHaveText('Injili ya Bwana. — Sifa kwako, Ee Kristo.');
        await expect(page.locator('#readingsCopyright')).toHaveText('Masomo yametolewa na Mkatoliki Leo.');

        // Paragraphs are visibly apart
        const gap = await first.locator('.sw-para').first().evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
        expect(gap).toBeGreaterThan(8);
        expect(errors).toEqual([]);
    });
}

test('Sundays have the second reading', async ({ page }) => {
    await serveSite(page, { day: SUNDAY });
    await setLanguage(page, 'sw');
    await page.goto('pages/daily-readings.html');
    await expect(cards(page).locator('span')).toHaveText(['Somo la Kwanza', 'Wimbo wa Katikati', 'Somo la Pili', 'Shangilio la Injili', 'Injili']);
    await expect(page.locator('#liturgicalDayTitle')).toHaveText('Dominika ya 29 ya Mwaka');
});

// The Reader's list of days stops at today; days after it are found by
// projecting their id (one a day) and checking the date on the page.
const dropDays = (...ids) => (list) => list.split('\n')
    .filter((line) => !ids.some((id) => line.includes('/masomo-ya-misa/' + id + '/'))).join('\n');

test('a day the list does not show yet is found by its projected id', async ({ page }) => {
    await serveSite(page, { list: dropDays(3944, 3945) });
    await setLanguage(page, 'sw');
    await page.goto('pages/daily-readings.html');
    await expect(cards(page)).toHaveCount(4);
    await expect(page.locator('#liturgicalDayTitle')).toHaveText('Jumanne ya 29 ya Mwaka');
});

test('a projected id that opens another day is not shown as this one', async ({ page }) => {
    // Monday listed as 3941, so Tuesday is projected to 3942: Sunday's page
    await serveSite(page, {
        list: (list) => dropDays(3944, 3945)(list).replace('/3943/jumatatu', '/3941/jumatatu').replace(/.*\/3941\/jumamosi.*\n/, '')
    });
    await setLanguage(page, 'sw');
    await page.goto('pages/daily-readings.html');
    await expect(page.locator('#readingsSwNote')).toHaveText(/hayapatikani kwa sasa/);
    await expect(page.locator('#readingsContainer')).not.toContainText('Dominika');
});

test('the Kiswahili Gospel alone, for the Office of Readings', async ({ page }) => {
    await serveSite(page);
    await page.goto('pages/daily-readings.html?view=gospel');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).locator('span')).toHaveText('Injili');
    await expect(cards(page).locator('.sw-para')).toHaveCount(2);
    await expect(cards(page)).not.toContainText('Tafakari');
});

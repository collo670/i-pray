// The Kiswahili daily readings (pages/daily-readings.html), from
// mkatolikileo.com: through the Reader (r.jina.ai, Markdown) or, when it is
// down, the site's own HTML through a CORS proxy. The saved pages are in
// tests/fixtures/mkatolikileo/.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const { collectErrors, setLanguage } = require('./helpers');

const FIXTURES = path.join(__dirname, '..', 'fixtures', 'mkatolikileo');
const fixture = (name) => fs.readFileSync(path.join(FIXTURES, name), 'utf8');
const CORS = { 'access-control-allow-origin': '*' };

// reader: 'up' answers r.jina.ai with the saved Markdown; 'down' fails it,
// so the page falls back to the HTML through corsproxy.io.
async function serveSite(page, { reader = 'up' } = {}) {
    await page.clock.setFixedTime(new Date(2026, 9, 21, 9, 0, 0));
    await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => {
        const url = route.request().url();
        if (url.startsWith('https://r.jina.ai/')) {
            if (reader !== 'up') return route.abort();
            const name = /\/1250\//.test(url) ? 'article.md' : /masomo-ya-misa$/.test(url) ? 'list.md' : null;
            if (!name) return route.fulfill({ status: 404, headers: CORS, body: '' });
            return route.fulfill({ status: 200, headers: CORS, contentType: 'text/plain; charset=utf-8', body: fixture(name) });
        }
        if (url.startsWith('https://corsproxy.io/')) {
            const target = new URL(url).searchParams.get('url') || '';
            if (/\/1250\//.test(target)) {
                return route.fulfill({ status: 200, headers: CORS, contentType: 'text/html; charset=utf-8', body: fixture('article.html') });
            }
            if (/masomo-ya-misa$/.test(target)) {
                return route.fulfill({ status: 200, headers: CORS, contentType: 'text/html; charset=utf-8', body: fixture('list.md') });
            }
        }
        return route.abort();
    });
}

const cards = (page) => page.locator('#readingsContainer article');

for (const reader of ['up', 'down']) {
    test(`Kiswahili readings render as text, not Markdown (Reader ${reader})`, async ({ page }) => {
        const errors = collectErrors(page);
        await serveSite(page, { reader });
        await setLanguage(page, 'sw');
        await page.goto('pages/daily-readings.html');

        await expect(cards(page)).toHaveCount(4);
        await expect(page.locator('#liturgicalDayTitle')).toHaveText('Jumanne ya Juma la 29 la Mwaka');
        await expect(cards(page).locator('span')).toHaveText(['Somo la 1', 'Wimbo wa Katikati', 'Shangilio', 'Injili']);

        const text = await page.locator('#readingsContainer').innerText();
        expect(text).not.toMatch(/\*\*|\\|!\[|Image \d|Imependwa|Shiriki|Masomo ya Jana/);
        expect(text).not.toMatch(/(^|\s)_\S/);

        // Every paragraph of a reading is kept, not just the first
        const first = cards(page).nth(0);
        await expect(first.locator('.sw-para')).toHaveCount(3);
        await expect(first.locator('em')).toHaveText('Neno la Bwana.');
        await expect(first.locator('strong')).toHaveText('Tumshukuru Mungu.');
        // The psalm keeps its refrain and its numbered stanzas
        const psalm = cards(page).nth(1);
        await expect(psalm.locator('.sw-para').first()).toHaveText('K. Mimi hapa, Bwana, nimekuja kufanya mapenzi yako.');
        await expect(psalm.locator('.sw-para').nth(1)).toContainText(/^1\. Dhabihu/);
        await expect(cards(page).nth(3).locator('.sw-para').last()).toHaveText('Injili ya Bwana. Sifa kwako Ee Kristo.');

        // Paragraphs are visibly apart
        const gap = await first.locator('.sw-para').first().evaluate((el) => parseFloat(getComputedStyle(el).marginBottom));
        expect(gap).toBeGreaterThan(8);
        expect(errors).toEqual([]);
    });
}

test('the Kiswahili Gospel alone, for the Office of Readings', async ({ page }) => {
    await serveSite(page);
    await page.goto('pages/daily-readings.html?view=gospel');
    await expect(cards(page)).toHaveCount(1);
    await expect(cards(page).locator('span')).toHaveText('Injili');
    await expect(cards(page).locator('.sw-para')).toHaveCount(3);
    await expect(cards(page)).not.toContainText('Image');
});

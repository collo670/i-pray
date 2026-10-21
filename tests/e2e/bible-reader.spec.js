// The Bible reader (pages/bibilia-reader.html, js/bibilia-reader.js): Swahili
// chapters from bolls.life through the app's Worker, kept on the phone once
// read.
const { test, expect } = require('@playwright/test');
const { collectErrors } = require('./helpers');

const CORS = { 'access-control-allow-origin': '*' };

// Answers every route to bolls.life with a two-verse chapter naming the
// host it came through. worker: 'down' makes the Worker answer 404.
async function serveBible(page, { worker = 'up' } = {}) {
    const calls = [];
    await page.route(/^https?:\/\/(?!localhost[:/])/, (route) => {
        const url = route.request().url();
        const m = decodeURIComponent(url).match(/get-text\/SUV\/(\d+)\/(\d+)\//);
        if (!m) return route.abort();
        const host = new URL(url).hostname;
        calls.push({ host, book: m[1], chapter: m[2] });
        if (/workers\.dev$/.test(host) && worker === 'down') return route.fulfill({ status: 404, headers: CORS, body: 'Not Found' });
        if (host === 'bolls.life') return route.abort();
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: CORS,
            body: JSON.stringify([
                { verse: 1, text: 'Kitabu ' + m[1] + ' sura ' + m[2] + ' kupitia ' + host },
                { verse: 2, text: 'Mstari wa pili.' }
            ])
        });
    });
    return calls;
}

test('a chapter read once opens again offline, and the next one is fetched ahead', async ({ page, context }) => {
    const errors = collectErrors(page);
    const calls = await serveBible(page);
    await page.goto('pages/bibilia-reader.html?book=nt-01&chapter=1');
    await expect(page.locator('#bibleContent')).toContainText('Kitabu 40 sura 1');
    // Chapter 2 is fetched in the background
    await expect.poll(() => calls.some((c) => c.chapter === '2')).toBe(true);

    await context.setOffline(true);
    await page.click('#nextChapter');
    await expect(page.locator('#bibleContent')).toContainText('Kitabu 40 sura 2');
    await page.click('#nextChapter');
    await expect(page.locator('#bibleError')).toContainText('Uko nje ya mtandao');

    // Kept beyond the page: opened again, chapter 1 needs no request
    await context.setOffline(false);
    calls.length = 0;
    await page.goto('pages/bibilia-reader.html?book=nt-01&chapter=1');
    await expect(page.locator('#bibleContent')).toContainText('Kitabu 40 sura 1');
    expect(calls.filter((c) => c.chapter === '1')).toEqual([]);
    expect(errors).toEqual([]);
});

test('the relays take over at once when the Worker fails', async ({ page }) => {
    const errors = collectErrors(page);
    const calls = await serveBible(page, { worker: 'down' });
    await page.goto('pages/bibilia-reader.html?book=nt-02&chapter=5');
    await expect(page.locator('#bibleContent')).toContainText('Kitabu 41 sura 5 kupitia');
    expect(calls[0].host).toBe('ancient-rice-28a1.otienocollo95.workers.dev');
    expect(errors).toEqual([]);
});

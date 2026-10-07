// Offline support: once the home page has been opened, the service worker has
// saved the prayer pages and they open with no connection; a page that was
// never saved shows the offline page instead of the browser's error.
//
// "Offline" here means the app's server is really gone: each test runs its
// own copy of scripts/serve.js and stops it. (Playwright's setOffline() and
// request routing don't reach the requests a service worker makes itself,
// so they can't be used to test one.)
const path = require('path');
const { spawn } = require('child_process');
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors } = require('./helpers');

test.use({ serviceWorkers: 'allow' });

let nextPort = 4400;

async function startServer() {
    const port = nextPort++ + Math.floor(Math.random() * 200) * 3;
    const proc = spawn(process.execPath, [path.join(__dirname, '..', '..', 'scripts', 'serve.js'), String(port)]);
    await new Promise((resolve, reject) => {
        proc.stdout.once('data', resolve);
        proc.once('exit', () => reject(new Error('test server exited')));
    });
    return {
        url: (p) => 'http://localhost:' + port + '/i-pray/' + p,
        stop: () => new Promise((resolve) => { proc.once('exit', resolve); proc.kill(); })
    };
}

test('prayer pages open offline after the first visit', async ({ page, context }) => {
    const errors = collectErrors(page);
    await isolate(context, { universalis: 'fail' });
    const server = await startServer();
    try {
        await page.goto(server.url('index.html'));
        const scope = await page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
        expect(scope).toMatch(/\/i-pray\/$/);
    } finally {
        await server.stop();
    }

    await page.goto(server.url('pages/compline.html'));
    await expect(page.locator('body')).toContainText('COMPLINE');

    // Same file as prayer-hour.html: the query string mustn't stop it
    // being found in the cache.
    await page.goto(server.url('pages/prayer-hour.html?hour=vespers'));
    await expect(page.locator('#hourTitle')).toBeVisible();

    await page.goto(server.url('pages/jumatatu1.html'));
    await expect(page.locator('h1').first()).toContainText('JUMATATU');

    // Never opened, not saved at install: the offline page.
    await page.goto(server.url('pages/amefufuka/017-tenzi-ya-masifu-ya-jioni-ya-siku.html'));
    await expect(page.locator('#retry')).toBeVisible();
    await expect(page.locator('h1')).toHaveText(/nje ya mtandao|offline/);

    expect(errors).toEqual([]);
});

test('a page opened once online is kept for offline use', async ({ page, context }) => {
    await isolate(context, { universalis: 'fail' });
    const server = await startServer();
    let title;
    try {
        await page.goto(server.url('index.html'));
        await page.evaluate(() => navigator.serviceWorker.ready);
        // Not saved at install; saved because it was opened.
        await page.goto(server.url('pages/amefufuka/016-tenzi-ya-masifu-ya-jioni-toka-pasaka.html'));
        title = await page.title();
    } finally {
        await server.stop();
    }
    await page.reload();
    await expect(page).toHaveTitle(title);
});

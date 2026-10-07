// Every page of the app opens without an uncaught JavaScript error, in
// English and in Kiswahili, with all outside network blocked (so a page that
// throws when a fetch fails is caught too).
const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

const ROOT = path.join(__dirname, '..', '..');

function htmlFiles(dir) {
    return fs.readdirSync(path.join(ROOT, dir), { withFileTypes: true }).flatMap((d) => {
        const rel = path.posix.join(dir, d.name);
        if (d.isDirectory()) return htmlFiles(rel);
        return d.name.endsWith('.html') ? [rel] : [];
    });
}

const PAGES = ['index.html', ...htmlFiles('pages')];

for (const lang of ['en', 'sw']) {
    test.describe('pages load (' + lang + ')', () => {
        for (const page of PAGES) {
            test(page, async ({ page: tab }) => {
                const errors = collectErrors(tab);
                await isolate(tab, { universalis: 'fail' });
                await setLanguage(tab, lang);
                const res = await tab.goto(page.split('/').map(encodeURIComponent).join('/'));
                expect(res.status()).toBe(200);
                await tab.waitForLoadState('load');
                // Let deferred scripts and the first timers run.
                await tab.waitForTimeout(300);
                expect(errors, 'uncaught errors on ' + page).toEqual([]);
            });
        }
    });
}

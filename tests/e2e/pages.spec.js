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

test('calendar page uses the shared calendar rules', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'sw');
    // Sunday 4 October 2026: the Sunday, not St Francis
    await page.clock.setFixedTime(new Date(2026, 9, 4, 9, 0));
    await page.goto('pages/calendar.html');
    await expect(page.locator('#todayFeast')).toHaveText('Hakuna sherehe leo');
    await expect(page.locator('#upcomingEvents')).toContainText('Mt. Faustina Kowalska');
});

test('calendar weekdays are short English names in every language', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'sw');
    await page.goto('pages/calendar.html');
    await expect(page.locator('#calendarGrid .cal-weekday')).toHaveText(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
});

test('no page has a bottom navigation bar; every page but home has the round Home button', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await page.goto('index.html');
    await expect(page.locator('nav[aria-label="Main Navigation"], .bottom-nav')).toHaveCount(0);
    await expect(page.locator('.ipray-home-btn')).toHaveCount(0);
    for (const url of ['pages/via-cruce.html', 'pages/mwaka1.html', 'pages/jumatano2.html', 'pages/amefufuka/031-amefufuka.html']) {
        await page.goto(url);
        await expect(page.locator('nav[aria-label="Main Navigation"], .bottom-nav')).toHaveCount(0);
        const home = page.locator('.ipray-home-btn');
        await expect(home).toBeVisible();
        await expect(home).toHaveAttribute('href', /\/i-pray\/index\.html$/);
        // Round, and centred along the bottom of the screen
        const box = await home.boundingBox();
        const vw = page.viewportSize().width;
        expect(Math.abs(box.x + box.width / 2 - vw / 2)).toBeLessThan(2);
        expect(box.width).toBe(box.height);
        expect(await home.evaluate((el) => getComputedStyle(el).borderRadius)).not.toBe('0px');
    }
    await page.goto('pages/sacraments.html');
    await page.locator('.ipray-home-btn').click();
    await expect(page).toHaveURL(/\/i-pray\/index\.html$/);
    expect(errors).toEqual([]);
});

test('the splash shows briefly, and only when the app opens on its home page', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await page.goto('pages/jumatano2.html');
    await expect(page.locator('#logoLoader')).toHaveCount(0);

    await page.evaluate(() => sessionStorage.clear());
    await page.goto('index.html');
    await expect(page.locator('#logoLoader')).toHaveCount(1);
    await expect(page.locator('#logoLoader')).toBeHidden({ timeout: 1000 });
});

test('the dark-mode button is a moon on the prayer pages, as on the home page', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    for (const url of ['pages/jumatano2.html', 'pages/antifona.html', 'pages/mwaka1.html', 'pages/amefufuka/031-amefufuka.html']) {
        await page.goto(url);
        const btn = page.locator('.toggle-btn');
        await expect(btn.locator('svg')).toBeVisible();
        await expect(btn).toHaveText('');
        await expect(btn).toHaveAttribute('aria-label', 'Toggle dark mode');
    }
    const btn = page.locator('.toggle-btn');
    const moon = await btn.innerHTML();
    await btn.click();
    await expect(btn).toHaveAttribute('aria-pressed', 'true');
    expect(await btn.innerHTML()).not.toBe(moon);
    expect(errors).toEqual([]);
});

test('the buttons along the bottom make way while the page scrolls down', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await page.goto('pages/jumatano2.html');
    const controls = page.locator('.ipray-home-btn, .ipray-fav, .masifu-textctl');
    await expect(controls).toHaveCount(3);
    for (const c of await controls.all()) await expect(c).toBeVisible();

    await page.mouse.wheel(0, 600);
    for (const c of await controls.all()) await expect(c).toBeHidden();
    await page.mouse.wheel(0, -200);
    for (const c of await controls.all()) await expect(c).toBeVisible();
    // Always there at the end of the page
    await page.mouse.wheel(0, 600);
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    for (const c of await controls.all()) await expect(c).toBeVisible();
    expect(errors).toEqual([]);
});

test('the Options button holds Home, Prayers, Calendar and Settings', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'en');

    // Home page: the Options sheet's "Go to" section
    await page.goto('index.html');
    await page.click('#optionsToggle');
    const goTo = page.locator('#optionsPanel .options-section').first();
    await expect(goTo.locator('.options-quicklink-label')).toHaveText(['Home', 'Prayers', 'Calendar', 'Settings']);
    await goTo.locator('#prayersNavBtn').click();
    await expect(page.locator('#prayersSheet')).toBeVisible();
    await expect(page.locator('#optionsPanel')).toBeHidden();

    // Any other page: the same items behind an Options button in the app bar
    await page.goto('pages/via-cruce.html');
    await page.click('#appBar #optionsToggle');
    const sheet = page.locator('#ipoOptionsSheet');
    await expect(sheet).toBeVisible();
    await expect(sheet.locator('.ipo-quicklink-label')).toHaveText(['Home', 'Prayers', 'Calendar', 'Settings']);
    await expect(sheet.locator('a[href$="/i-pray/pages/calendar.html"]')).toHaveCount(1);
    await expect(sheet.locator('a[href$="/i-pray/pages/settings.html"]')).toHaveCount(1);
    await sheet.locator('[data-action="prayers"]').click();
    await expect(page.locator('#ipnPrayersSheet')).toBeVisible();
    await expect(page.locator('#ipnPrayersSheet .ipn-item')).toHaveCount(8);
    expect(errors).toEqual([]);
});

test('the Masifu ya Asubuhi and Amefufuka menus drop down as a sheet, like the Options button, with their own links', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'sw');
    const MASIFU = ['Nyumbani', 'Ofisi ya Masomo', 'Masomo ya Siku', 'Sala za Mchana', 'Masifu ya Jioni'];

    for (const [url, links] of [
        ['pages/jumatano2.html', MASIFU],
        ['pages/antifona.html', MASIFU],
        ['pages/amefufuka.html', ['Nyumbani', 'Masomo ya Siku / Daily Readings', 'Ofisi ya Masomo', 'Sala za Mchana', 'Masifu ya Jioni']],
        ['pages/amefufuka/031-amefufuka.html', ['Nyumbani', 'Amefufuka — Orodha ya Nyimbo']]
    ]) {
        await page.goto(url);
        const button = page.locator('#appBar .hamburger');
        const sheet = page.locator('#masifuMenuSheet');
        await expect(page.locator('#appBar .nav-links')).toHaveCount(0);
        await expect(sheet).toBeHidden();

        await button.click();
        await expect(sheet).toBeVisible();
        await expect(button).toHaveAttribute('aria-expanded', 'true');
        await expect(sheet.locator('.masifu-sheet-title')).toHaveText('Chaguo');
        await expect(sheet.locator('.masifu-sheet-label')).toHaveText(links);
        await expect(sheet.locator('.masifu-sheet-link').last()).toBeInViewport();

        // Closed by its X, by Escape and by a tap outside the panel
        await sheet.locator('.masifu-sheet-close').click();
        await expect(sheet).toBeHidden();
        await expect(button).toHaveAttribute('aria-expanded', 'false');
        await button.click();
        await page.keyboard.press('Escape');
        await expect(sheet).toBeHidden();
        await button.click();
        await page.mouse.click(page.viewportSize().width / 2, page.viewportSize().height * 0.75);
        await expect(sheet).toBeHidden();
    }

    // A song's link back to the list of songs opens it
    await page.click('#appBar .hamburger');
    await page.click('#masifuMenuSheet a[href="../amefufuka.html"]');
    await expect(page).toHaveURL(/\/pages\/amefufuka\.html$/);
    expect(errors).toEqual([]);
});

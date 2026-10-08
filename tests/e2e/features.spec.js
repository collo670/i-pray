// Favourites, recently opened, continue where you left off (js/library.js),
// prayer reminders (js/reminders.js) and "Save this week" (js/offline-week.js).
const fs = require('fs');
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

test.beforeEach(async ({ page }) => {
    await isolate(page);
    await setLanguage(page, 'sw');
});

test('the star keeps a prayer among the favourites on the home page', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('pages/jumatano2.html');
    const star = page.locator('.ipray-fav');
    await expect(star).toHaveAttribute('aria-pressed', 'false');
    await star.click();
    await expect(star).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.ipray-toast')).toHaveText('Imehifadhiwa kwenye vipendwa');

    await page.goto('index.html');
    const card = page.locator('#myPrayersCard');
    await expect(card).toBeVisible();
    await expect(card.locator('.ipray-mine-list a').first()).toHaveText('Masifu ya Asubuhi - Jumatano · Juma 2');
    await card.locator('.ipray-mine-remove').click();
    await expect(card.locator('.ipray-mine-remove')).toHaveCount(0);
    expect(errors).toEqual([]);
});

test('recently opened prayers are listed on the home page', async ({ page }) => {
    await page.goto('pages/compline.html');
    await page.waitForFunction(() => (JSON.parse(localStorage.getItem('ipray:recent')) || []).length > 0);
    await page.goto('index.html');
    await expect(page.locator('#myPrayersCard')).toContainText('Ulizofungua hivi karibuni');
    await expect(page.locator('#myPrayersCard a[href="/i-pray/pages/compline.html"]')).toHaveCount(1);
});

test('continue where you left off', async ({ page }) => {
    await page.goto('pages/jumatatu3.html');
    await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) * 0.5));
    await page.waitForFunction(() => !!localStorage.getItem('ipray:lastReading'));

    await page.goto('index.html');
    const cont = page.locator('#continueCard');
    await expect(cont).toContainText('Endelea pale ulipoishia');
    await expect(cont).toContainText('Masifu ya Asubuhi - Jumatatu (Juma III)');
    await cont.locator('a').click();

    await expect(page).toHaveURL(/jumatatu3\.html$/);
    await page.waitForFunction(() => {
        const max = document.documentElement.scrollHeight - innerHeight;
        return max > 0 && scrollY / max > 0.4;
    });
});

test('reminder settings, the phone calendar file and a notification', async ({ page }) => {
    const errors = collectErrors(page);
    // Headless Chromium reports notifications as denied even when granted,
    // so a stand-in records what the app would show.
    await page.addInitScript(() => {
        window.__shown = [];
        window.Notification = function (title, options) { window.__shown.push({ title, body: options && options.body }); };
        window.Notification.permission = 'default';
        window.Notification.requestPermission = () => { window.Notification.permission = 'granted'; return Promise.resolve('granted'); };
    });
    await page.clock.install({ time: new Date(2026, 9, 7, 5, 59, 30) });
    await page.goto('pages/settings.html');

    const rows = page.locator('#reminderList .prayer-reminder');
    await expect(rows).toHaveCount(5);
    await expect(rows.first().locator('h3')).toHaveText('Masifu ya Asubuhi');

    // Turn Night Prayer on and move it to 20:30
    const night = rows.nth(4);
    await night.locator('input[type="time"]').fill('20:30');
    await night.locator('label').click();
    await expect(night.locator('input[type="checkbox"]')).toBeChecked();
    const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ipray:reminders')));
    expect(saved.items.compline).toEqual({ time: '20:30', on: true });

    // The calendar file has one daily event per reminder that is on
    const download = page.waitForEvent('download');
    await page.click('#reminderCalendarBtn');
    const ics = fs.readFileSync(await (await download).path(), 'utf8');
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics.match(/BEGIN:VEVENT/g)).toHaveLength(4);
    expect(ics).toContain('SUMMARY:Sala ya Usiku');
    expect(ics).toMatch(/DTSTART:\d{8}T203000/);
    expect(ics).toContain('RRULE:FREQ=DAILY');
    expect(ics).not.toContain('Saa ya Huruma');

    // Notifications: on, then at 06:00 the Morning Prayer reminder fires
    await page.click('#reminderNotifyBtn');
    await expect(page.locator('#reminderNotifyBtn')).toHaveText('Zima arifa za ipray');
    expect(await page.evaluate(() => window.__shown)).toEqual([]);
    await page.clock.runFor(60 * 1000);
    await page.waitForFunction(() => window.__shown.length === 1);
    expect(await page.evaluate(() => window.__shown[0])).toEqual({ title: 'Masifu ya Asubuhi', body: 'Ni wakati wa sala: Masifu ya Asubuhi' });
    // Shown once a day, however many ipray pages are open
    expect(await page.evaluate(() => JSON.parse(localStorage.getItem('ipray:remindersFired')).lauds)).toBe('2026-10-7');
    expect(errors).toEqual([]);
});

test('save this week for offline use', async ({ page }) => {
    const errors = collectErrors(page);
    await page.goto('pages/settings.html');
    await page.click('#saveWeekBtn');
    await expect(page.locator('#saveWeekStatus')).toContainText('Imehifadhiwa', { timeout: 30000 });
    const saved = await page.evaluate(async () => ({
        offices: Object.keys(localStorage).filter((k) => k.indexOf(UniversalisOffice.CACHE_PREFIX) === 0).length,
        pages: (await (await caches.open('ipray-runtime')).keys()).map((r) => new URL(r.url).pathname)
    }));
    expect(saved.offices).toBe(21);
    expect(saved.pages).toContain('/i-pray/pages/prayer-hour.html');
    expect(saved.pages.filter((p) => /\/(jumapili|jumatatu|jumanne|jumatano|alhamisi|ijumaa|jumamosi)[1-4]\.html$/.test(p)).length).toBeGreaterThanOrEqual(7);
    expect(errors).toEqual([]);
});

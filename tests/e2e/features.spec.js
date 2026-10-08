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
        pages: (await (await caches.open('ipray-offline-week')).keys()).map((r) => new URL(r.url).pathname)
    }));
    expect(saved.offices).toBe(21);
    expect(saved.pages).toContain('/i-pray/pages/prayer-hour.html');
    expect(saved.pages.filter((p) => /\/(jumapili|jumatatu|jumanne|jumatano|alhamisi|ijumaa|jumamosi)[1-4]\.html$/.test(p)).length).toBeGreaterThanOrEqual(7);
    expect(errors).toEqual([]);
});

test('the saved days are listed and picking one changes the day the prayer pages show', async ({ page }) => {
    const errors = collectErrors(page);
    // Wednesday 7 October 2026
    await page.clock.install({ time: new Date(2026, 9, 7, 10, 0, 0) });
    await page.goto('pages/settings.html');
    await page.click('#saveWeekBtn');
    await expect(page.locator('#saveWeekStatus')).toContainText('Imehifadhiwa', { timeout: 30000 });

    const days = page.locator('#savedDays .saved-day');
    await expect(days).toHaveCount(7);
    await expect(days.first()).toHaveAttribute('data-day', '20261007');
    await expect(days.first()).toContainText('Leo');
    await expect(days.first()).toHaveAttribute('aria-pressed', 'true');
    await expect(days.last()).toHaveAttribute('data-day', '20261013');
    await expect(page.locator('#iprayDayBar')).toHaveCount(0);

    // Friday 9 October
    await days.nth(2).click();
    await expect(days.nth(2)).toHaveAttribute('aria-pressed', 'true');
    await expect(days.first()).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('#iprayDayBar')).toBeVisible();

    await page.goto('pages/masifu-asubuhi.html');
    await expect(page).toHaveURL(/\/ijumaa[1-4]\.html$/);
    await expect(page.locator('#iprayDayBar')).toContainText('Rudi leo');

    await page.goto('pages/prayer-hour.html?hour=vespers');
    await expect(page.locator('#datePicker')).toHaveValue('2026-10-09');

    // Still listed after leaving Settings, with the choice kept
    await page.goto('pages/settings.html');
    await expect(days).toHaveCount(7);
    await expect(days.nth(2)).toHaveAttribute('aria-pressed', 'true');

    // Back to today from the bar
    await page.goto('pages/masifu-asubuhi.html');
    await page.locator('#iprayDayBar button').click();
    await expect(page.locator('#iprayDayBar')).toHaveCount(0);
    await page.goto('pages/masifu-asubuhi.html');
    await expect(page).toHaveURL(/\/jumatano[1-4]\.html$/);
    expect(errors).toEqual([]);
});

test('the saved week is deleted a week after it was saved', async ({ page }) => {
    const errors = collectErrors(page);
    await page.clock.install({ time: new Date(2026, 9, 14, 0, 0, 1) });
    await page.addInitScript(() => {
        if (sessionStorage.getItem('seeded')) return;
        sessionStorage.setItem('seeded', '1');
        localStorage.setItem('ipray:offlineWeek', JSON.stringify({ start: '2026-10-07' }));
        localStorage.setItem('ipray:prayerDay', JSON.stringify({ day: '2026-10-09', on: '2026-10-14' }));
        localStorage.setItem('officeHtml-v1-vespers-20261009', '<p>office</p>');
        localStorage.setItem('officeHtml-v1-vespers-20261020', '<p>not saved</p>');
    });
    await page.goto('pages/settings.html');
    const left = await page.evaluate(() => ({
        week: localStorage.getItem('ipray:offlineWeek'),
        choice: localStorage.getItem('ipray:prayerDay'),
        saved: localStorage.getItem('officeHtml-v1-vespers-20261009'),
        other: localStorage.getItem('officeHtml-v1-vespers-20261020')
    }));
    expect(left).toEqual({ week: null, choice: null, saved: null, other: '<p>not saved</p>' });
    await expect(page.locator('#savedWeek')).toBeHidden();
    await expect(page.locator('#iprayDayBar')).toHaveCount(0);
    expect(errors).toEqual([]);
});

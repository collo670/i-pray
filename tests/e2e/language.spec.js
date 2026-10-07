// One language setting for the whole app (js/i18n.js).
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

test('with nothing saved the app opens in Kiswahili', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await page.goto('pages/via-cruce.html');
    expect(await page.evaluate(() => IPrayI18n.lang())).toBe('sw');
    await expect(page.locator('.bottom-nav [data-translate="home"]')).toHaveText('Nyumbani');
});

test('the old Settings key is still honoured', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await page.addInitScript(() => localStorage.setItem('language', 'en'));
    await page.goto('pages/compline.html');
    expect(await page.evaluate(() => IPrayI18n.lang())).toBe('en');
});

test('bottom navigation and the Prayers sheet follow the language on any page', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'sw');
    await page.goto('pages/via-cruce.html');
    await expect(page.locator('.bottom-nav [data-translate="calendar"]')).toHaveText('Kalenda');
    await expect(page.locator('#ipnPrayersTitle')).toHaveText('Sala');
    await expect(page.locator('.ipn-item-label[data-translate="nightPrayer"]')).toHaveText('Sala ya Usiku');
    await page.evaluate(() => IPrayI18n.set('en'));
    await expect(page.locator('.bottom-nav [data-translate="calendar"]')).toHaveText('Calendar');
    await expect(page.locator('.ipn-item-label[data-translate="nightPrayer"]')).toHaveText('Night Prayer');
    // The icon beside each label survives the change.
    await expect(page.locator('.ipn-item .ipn-item-icon i').first()).toBeAttached();
    expect(errors).toEqual([]);
});

test('a change in Settings reaches a page that is already open', async ({ context }) => {
    await isolate(context, { universalis: 'fixture' });
    const hour = await context.newPage();
    await hour.addInitScript(() => { if (!sessionStorage.getItem('seeded')) { sessionStorage.setItem('seeded', '1'); localStorage.setItem('preferredLanguage', 'en'); } });
    await hour.goto('pages/prayer-hour.html?hour=vespers');
    await expect(hour.locator('#hourTitle')).toHaveText('Vespers');

    const settings = await context.newPage();
    await settings.goto('pages/settings.html');
    await settings.locator('.language-option[data-lang="sw"]').first().click();

    await expect(hour.locator('#hourTitle')).toHaveText('Masifu ya Jioni');
    await expect(hour.locator('#tabSext')).toHaveText('Mchana');
});

test('the Rosary language switch is the app language', async ({ page }) => {
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'en');
    await page.goto('pages/holy-rosary.html');
    await expect(page.locator('#rosaryTitle')).toHaveText('Holy Rosary');
    await page.click('#rosaryLangToggle');
    await expect(page.locator('#rosaryTitle')).toHaveText('Rozari Takatifu');
    expect(await page.evaluate(() => localStorage.getItem('preferredLanguage'))).toBe('sw');
});

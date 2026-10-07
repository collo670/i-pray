// Office of Readings in Kiswahili: local data for Ordinary Time, Advent,
// Christmas, Trinity Sunday and Corpus Christi; the English office with a
// note where the Swahili books have nothing.
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

async function openOn(page, date) {
    const errors = collectErrors(page);
    await isolate(page, { universalis: 'fail' });
    await setLanguage(page, 'sw');
    await page.clock.setFixedTime(date);
    await page.goto('pages/office-of-readings.html');
    await expect(page.locator('#officeContent:not(.hidden), #hourUnavailable:not(.hidden)')).toBeVisible({ timeout: 20000 });
    return errors;
}

for (const [label, date, citation, source] of [
    ['an Ordinary Time weekday', new Date(2026, 9, 7, 8), null, null],
    ['the First Sunday of Advent', new Date(2026, 10, 29, 8), 'Isa 1,1-18', 'Sirilo wa Yerusalemu'],
    ['18 December', new Date(2026, 11, 18, 8), 'Isa 46, 1-13', null],
    ['the Holy Family', new Date(2026, 11, 27, 8), 'Efe 5,21 – 6,4', null],
    ['Trinity Sunday', new Date(2026, 4, 31, 8), 'I Kor 2, 1-16', null]
]) {
    test('Kiswahili on ' + label, async ({ page }) => {
        const errors = await openOn(page, date);
        const office = page.locator('#officeContent');
        await expect(office.locator('.office-hour-heading')).toContainText('Kiswahili');
        await expect(office.locator('.sw-title-box').first()).toHaveText('Somo la Kwanza');
        if (citation) await expect(office.locator('.sw-citation').first()).toHaveText(citation);
        if (source) await expect(office.locator('.sw-source')).toContainText(source);
        await expect(office.locator('.sw-fallback-note')).toHaveCount(0);
        expect(errors).toEqual([]);
    });
}

test('a solemnity the Swahili books lack: the English office with a note', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page);
    await setLanguage(page, 'sw');
    await page.clock.setFixedTime(new Date(2026, 7, 15, 8));
    await page.goto('pages/office-of-readings.html');
    await expect(page.locator('.sw-fallback-note')).toHaveText(/Leo ni Sherehe: Kupalizwa Mbinguni kwa Bikira Maria/);
    await expect(page.locator('#officeContent')).toContainText('READINGS-FIXTURE');
    expect(errors).toEqual([]);
});

test('Lent: no Swahili book yet, the English office with a note', async ({ page }) => {
    const errors = collectErrors(page);
    await isolate(page);
    await setLanguage(page, 'sw');
    await page.clock.setFixedTime(new Date(2026, 2, 4, 8));
    await page.goto('pages/office-of-readings.html');
    await expect(page.locator('.sw-fallback-note')).toContainText('Kipindi cha Mwaka, Majilio na Noeli');
    await expect(page.locator('#officeContent')).toContainText('READINGS-FIXTURE');
    expect(errors).toEqual([]);
});

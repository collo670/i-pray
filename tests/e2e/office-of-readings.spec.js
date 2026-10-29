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

// Answers the first reading's requests to bolls.life (through the app's
// Worker) with 40 verses naming the book and chapter asked for.
async function serveBible(page) {
    const calls = [];
    await page.route(/\/get-text\/SUV\/\d+\/\d+\//, (route) => {
        const m = route.request().url().match(/get-text\/SUV\/(\d+)\/(\d+)\//);
        calls.push(m[1] + '/' + m[2]);
        const verses = [];
        for (let v = 1; v <= 40; v++) verses.push({ verse: v, text: 'Kitabu ' + m[1] + ' sura ' + m[2] + ' aya ' + v });
        return route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { 'access-control-allow-origin': '*' },
            body: JSON.stringify(verses)
        });
    });
    return calls;
}

for (const [label, date, citation, calls, firstVerse, text] of [
    ['Maombolezo, not Marko', new Date(2026, 8, 10, 8), 'Ma 1,1-12. 18-20', ['25/1'], '1:1', 'Kitabu 25 sura 1 aya 20'],
    ['Yoeli 4, which SUV numbers 3', new Date(2026, 10, 16, 8), 'Yoe 4,1-3.9-21', ['29/3'], '4:1', 'Kitabu 29 sura 3 aya 21'],
    ['Yuda, a book of one chapter', new Date(2026, 10, 28, 8), 'Yda 1-8. 12-13. 17-25', ['65/1'], '1:1', 'Kitabu 65 sura 1 aya 25'],
    ['Hekima, which SUV lacks, and not Waebrania', new Date(2026, 9, 29, 8), 'Hek 7,15-30', [], null, 'Kitabu cha Hekima (Hek) hakipatikani']
]) {
    test('first reading: ' + label, async ({ page }) => {
        const errors = collectErrors(page);
        await isolate(page, { universalis: 'fail' });
        const requested = await serveBible(page);
        await setLanguage(page, 'sw');
        await page.clock.setFixedTime(date);
        await page.goto('pages/office-of-readings.html');
        const office = page.locator('#officeContent');
        await expect(office.locator('.sw-citation').first()).toHaveText(citation);
        await expect(office).toContainText(text);
        if (firstVerse) await expect(office.locator('sup').first()).toHaveText(firstVerse);
        expect(requested).toEqual(calls);
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

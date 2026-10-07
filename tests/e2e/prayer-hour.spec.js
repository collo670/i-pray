// Midday Prayer and Vespers (pages/prayer-hour.html): the office is fetched
// from Universalis (answered here with saved pages), cut down to the prayer
// text, and shown with English or Kiswahili page wording.
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors, setLanguage } = require('./helpers');

async function openHour(page, hour, { lang = 'en', universalis = 'fixture' } = {}) {
    const errors = collectErrors(page);
    const calls = await isolate(page, { universalis });
    await setLanguage(page, lang);
    await page.goto('pages/prayer-hour.html?hour=' + hour);
    await expect(page.locator('#officeContent:not(.hidden), #hourUnavailable:not(.hidden)')).toBeVisible({ timeout: 20000 });
    return { errors, calls };
}

test('Midday Prayer in English shows one psalmody and no site furniture', async ({ page }) => {
    const { errors } = await openHour(page, 'sext');
    const office = page.locator('#officeContent');
    await expect(office.locator('.office-hour-heading')).toHaveText('Midday Prayer — English');
    const text = await office.innerText();
    expect(text.match(/DAYPSALM-[ABC]/g)).toHaveLength(6);
    expect(text).not.toContain('COMPPSALM');
    expect(text).toContain('A blessing on the man');
    expect(text).toContain('Through Christ our Lord.');
    for (const chrome of ['Copyright', 'Universalis app', 'Psalm week', 'Psalms of the day', 'Complementary psalms', 'Continue', 'Privacy']) {
        expect(text).not.toContain(chrome);
    }
    await expect(office.locator('a, script, style, audio')).toHaveCount(0);
    await expect(page).toHaveTitle('Midday Prayer - ipray');
    expect(errors).toEqual([]);
});

test('Vespers in English keeps the Magnificat and ends with the dismissal', async ({ page }) => {
    await openHour(page, 'vespers');
    const office = page.locator('#officeContent');
    await expect(office.locator('.office-hour-heading')).toHaveText('Vespers — English');
    const text = await office.innerText();
    expect(text).toContain('My soul proclaims the greatness of the Lord');
    expect(text.trim().split('\n').filter(Boolean).slice(-2)).toEqual([
        'The Lord bless us, and keep us from all evil, and bring us to everlasting life.',
        'Amen.'
    ]);
});

for (const [hour, title, subtitle] of [
    ['sext', 'Sala ya Mchana', 'Saa Sita · Sala ya Wakati wa Mchana'],
    ['vespers', 'Masifu ya Jioni', 'Sala ya Jioni ya Kanisa']
]) {
    test(title + ' in Kiswahili: Swahili page wording around the English office', async ({ page }) => {
        const { errors } = await openHour(page, hour, { lang: 'sw' });
        await expect(page.locator('html')).toHaveAttribute('lang', 'sw');
        await expect(page.locator('#hourTitle')).toHaveText(title);
        await expect(page.locator('#hourSubtitle')).toHaveText(subtitle);
        await expect(page).toHaveTitle(title + ' - ipray');
        await expect(page.locator('#tabSext')).toHaveText('Mchana');
        await expect(page.locator('#tabVespers')).toHaveText('Jioni');
        await expect(page.locator('#tabCompline')).toHaveText('Usiku');
        await expect(page.locator('.office-hour-heading')).toHaveText(title + ' — Kiingereza');
        await expect(page.locator('.sw-fallback-note')).toContainText('bado hakipatikani');
        await expect(page.locator('.bottom-nav [data-translate="home"]')).toHaveText('Nyumbani');
        expect(errors).toEqual([]);
    });
}

test('switching language and hour re-renders without a reload', async ({ page }) => {
    await openHour(page, 'vespers');
    await page.click('#langSw');
    await expect(page.locator('#hourTitle')).toHaveText('Masifu ya Jioni');
    await page.click('#tabSext');
    await expect(page.locator('.office-hour-heading')).toHaveText('Sala ya Mchana — Kiingereza');
    await expect(page).toHaveURL(/hour=sext/);
});

test('when every proxy fails the page says so (English and Kiswahili)', async ({ page }) => {
    await openHour(page, 'vespers', { universalis: 'fail' });
    await expect(page.locator('#unavailableMsg')).toHaveText('The text of this hour could not be loaded right now.');
    await page.click('#langSw');
    await expect(page.locator('#unavailableMsg')).toHaveText('Maandishi ya sala hayakuweza kupakuliwa kwa sasa.');
});

test('a proxy that answers without an office is reported as such', async ({ page }) => {
    await openHour(page, 'sext', { universalis: 'junk' });
    await expect(page.locator('#unavailableMsg')).toHaveText('The page loaded, but no prayer text could be read from it.');
});

test('a fetched office is cached and shown again without the network', async ({ page }) => {
    const { calls } = await openHour(page, 'sext');
    expect(calls.length).toBeGreaterThan(0);
    const first = await page.locator('#officeContent').innerHTML();
    calls.length = 0;
    await page.reload();
    await expect(page.locator('#officeContent:not(.hidden)')).toBeVisible();
    expect(calls).toEqual([]);
    expect(await page.locator('#officeContent').innerHTML()).toBe(first);
});

test('on Saturday evening Vespers is First Vespers of Sunday', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 10, 18, 0));
    await openHour(page, 'vespers', { lang: 'sw' });
    await expect(page.locator('#bannerDay')).toContainText('Masifu ya Jioni I · Dominika ya 28 ya Mwaka');
    await page.click('#langEn');
    await expect(page.locator('#bannerDay')).toContainText('First Vespers · 28th Sunday in Ordinary Time');
    // Midday on the same Saturday is still Saturday's office.
    await page.click('#tabSext');
    await expect(page.locator('#bannerDay')).toContainText('Saturday of the 27th Week in Ordinary Time');
});

test('the celebration of the day is named in the chosen language', async ({ page }) => {
    await page.clock.setFixedTime(new Date(2026, 9, 7, 9, 0));
    await openHour(page, 'sext', { lang: 'sw' });
    await expect(page.locator('#celebrationTag')).toHaveText('Kumbukumbu: Bikira Maria wa Rozari');
});

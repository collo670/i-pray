// Masifu ya Asubuhi: each page shows the antiphons of today's season and
// keeps the other seasons' behind "Misimu mingine". None of the dates below
// is a feast, so js/sikukuu.js leaves the psalms alone.
const { test, expect } = require('@playwright/test');
const { isolate, collectErrors } = require('./helpers');

const DAYS = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
const PAGES = [1, 2, 3, 4].flatMap((w) => DAYS.map((d) => d + w));

// The text of every antiphon line the reader can see.
async function open(page, name, date) {
    await page.clock.setFixedTime(date);
    await page.goto('pages/' + name + '.html');
    await expect(page.locator('.masifu-season-badge')).toBeVisible();
    return page.locator('p.antiphon').evaluateAll((els) => els
        .filter((e) => e.getClientRects().length)
        .map((e) => e.textContent.replace(/\s+/g, ' ').trim()));
}

const label = (line) => (line.match(/^Ant\. ya ([^:]+):/) || [])[1];

// The invitatory (above Zaburi 95) shows exactly one antiphon, today's, and
// no "Misimu mingine" button.
async function expectInvitatory(page, name, expected) {
    const opening = page.locator('.container > .prayer-section').first();
    const shown = await opening.locator('p.antiphon').evaluateAll((els) => els
        .filter((e) => e.getClientRects().length)
        .map((e) => (e.textContent.match(/^\s*Ant\. ya ([^:]+):/) || [])[1]));
    expect(shown, name).toEqual([expected]);
    expect(await opening.locator('.ant-toggle').count(), name).toBe(0);
    expect(await opening.locator('p.antiphon').count(), name).toBe(9); // the others stay in the page
}

// The psalmody's headings (not Psalm 95, not the Benedictus), each with
// whether it sits in a .prayer-section together with its antiphons, which
// is what js/sikukuu.js and js/masifu.js work on.
function psalmody(page) {
    return page.locator('.container h2').evaluateAll((hs) => hs
        .map((h) => ({
            text: h.textContent.replace(/\s+/g, ' ').trim(),
            inSection: h.parentElement.matches('.container > .prayer-section') && !!h.parentElement.querySelector('p.antiphon')
        }))
        .filter((h) => /^(Zab|WIMBO)/.test(h.text) && !/^Zaburi 95\b|ZAKARIA/.test(h.text)));
}

test.beforeEach(async ({ page }) => {
    await isolate(page);
});

test('in Advent every page shows the Advent antiphons and hides the other seasons', async ({ page }) => {
    test.setTimeout(120000);
    const errors = collectErrors(page);
    for (const name of PAGES) {
        const shown = await open(page, name, new Date(2026, 11, 1, 8)); // Tuesday, Advent week 1
        const labels = shown.map(label).filter(Boolean);
        expect(labels.filter((l) => /Pasaka|Kwaresima|Juma Kuu|Matawi|Desemba|Noeli/.test(l)), name).toEqual([]);
        await expectInvitatory(page, name, 'Kipindi cha Majilio I (hadi Des. 16)');
        if (name.startsWith('jumapili')) {
            // The Sundays have Advent psalm antiphons; weekdays keep the psalter's until December 17.
            expect(labels.filter((l) => l === 'Majilio').length, name).toBeGreaterThanOrEqual(3);
            expect(labels.filter((l) => l === 'Kawaida'), name).toEqual([]);
        }
    }
    expect(errors).toEqual([]);
});

test('from December 17 the December antiphons and the second Advent invitatory', async ({ page }) => {
    test.setTimeout(120000);
    for (const name of PAGES) {
        const shown = await open(page, name, new Date(2026, 11, 18, 8));
        const labels = shown.map(label).filter(Boolean);
        await expectInvitatory(page, name, 'Kipindi cha Majilio II (Desemba 17-23)');
        expect(labels.filter((l) => /Pasaka|Kwaresima|Noeli/.test(l)), name).toEqual([]);
    }
    // December 17-23 falls in psalter weeks III and IV, whose weekdays have
    // December antiphons: they show instead of the psalter's.
    const labels = (await open(page, 'ijumaa4', new Date(2026, 11, 18, 8))).map(label).filter(Boolean);
    expect(labels.filter((l) => l === 'Desemba 17-23')).toHaveLength(6);
    expect(labels).not.toContain('Kawaida');
});

test('Christmas: the invitatory changes at the Epiphany', async ({ page }) => {
    await open(page, 'jumatatu1', new Date(2027, 0, 4, 8));
    await expectInvitatory(page, 'jumatatu1', 'Kipindi cha Noeli I (kabla ya Tokeo la Bwana)');
    await open(page, 'ijumaa1', new Date(2027, 0, 8, 8));
    await expectInvitatory(page, 'ijumaa1', 'Kipindi cha Noeli II (baada ya Tokeo la Bwana)');
});

for (const [sunday, date, other] of [[1, new Date(2027, 1, 14, 8), 5], [5, new Date(2027, 2, 14, 8), 1]]) {
    test('Jumapili I on Lent Sunday ' + sunday + ' has that Sunday\'s antiphons', async ({ page }) => {
        const labels = (await open(page, 'jumapili1', date)).map(label).filter(Boolean);
        expect(labels.filter((l) => l === 'Kwaresima (Jumapili ' + sunday + ')')).toHaveLength(6);
        expect(labels).not.toContain('Kwaresima (Jumapili ' + other + ')');
        expect(labels.filter((l) => /^(Kawaida|Majilio|Kipindi cha Pasaka)$/.test(l))).toEqual([]);
        await expectInvitatory(page, 'jumapili1', 'Kipindi cha Kwaresima I (pamoja na Juma Kuu)');
    });
}

test('Holy Week keeps only the first Lent invitatory', async ({ page }) => {
    await open(page, 'jumanne2', new Date(2027, 2, 23, 8));
    await expectInvitatory(page, 'jumanne2', 'Kipindi cha Kwaresima I (pamoja na Juma Kuu)');
});

test('Easter: the seasonal antiphons show on every page, and the invitatory changes at the Ascension', async ({ page }) => {
    test.setTimeout(120000);
    for (const name of PAGES) {
        const labels = (await open(page, name, new Date(2027, 3, 13, 8))).map(label).filter(Boolean);
        await expectInvitatory(page, name, 'Kipindi cha Pasaka I (hadi Kupaa)');
        expect(labels.filter((l) => /Kwaresima|Majilio|Desemba|Noeli|Juma Kuu/.test(l)), name).toEqual([]);
    }
    // Week IV used to hide its Easter antiphons with an inline style.
    const week4 = (await open(page, 'jumanne4', new Date(2027, 3, 13, 8))).map(label);
    expect(week4).toContain('Kipindi cha Pasaka');
    await open(page, 'jumatatu4', new Date(2027, 4, 10, 8));
    await expectInvitatory(page, 'jumatatu4', 'Kipindi cha Pasaka II (Kupaa hadi Pentekoste)');
});

test('on a feast every page prays the psalms of Jumapili I, and none of its own', async ({ page }) => {
    test.setTimeout(120000);
    const errors = collectErrors(page);
    for (const name of PAGES.filter((n) => n !== 'jumapili1')) {
        const shown = await open(page, name, new Date(2027, 8, 14, 8)); // Exaltation of the Holy Cross, a Feast
        const psalms = await psalmody(page);
        expect(psalms.map((h) => h.text), name).toEqual(['Zaburi 63:1-8', 'WIMBO: Dan. 3:57-88,56', 'Zaburi 149']);
        expect(await page.locator('.container h2', { hasText: /^\s*Zaburi 95\b/ }).count(), name).toBe(1);
        expect(shown.filter((l) => /^ANT\. [IV]+$/.test(l)), name).toEqual(['ANT. I', 'ANT. I', 'ANT. II', 'ANT. II', 'ANT. III', 'ANT. III']);
        expect(shown.filter((l) => /^Ant\. ya Kawaida:/.test(l)).map((l) => l.split(' ')[3]), name)
            .toEqual(['Nitakutafuta', 'Nitakutafuta', 'Katikati', 'Katikati', 'Wana', 'Wana']);
    }
    expect(errors).toEqual([]);
});

test('in Ordinary Time only the ordinary antiphons show, and the others open on request', async ({ page }) => {
    test.setTimeout(120000);
    for (const name of PAGES) {
        const labels = (await open(page, name, new Date(2026, 10, 4, 8))).map(label).filter(Boolean);
        expect(labels.filter((l) => /Pasaka|Kwaresima|Majilio|Desemba|Noeli|Juma Kuu|Matawi/.test(l)), name).toEqual([]);
        await expectInvitatory(page, name, 'Kawaida ya Mwaliko');
        // Two psalms and a canticle, each in one section with its antiphons.
        const psalms = await psalmody(page);
        expect(psalms, name).toHaveLength(3);
        expect(psalms.filter((h) => !h.inSection).map((h) => h.text), name).toEqual([]);
    }
    // The psalms' antiphons for other seasons open on request.
    const group = page.locator('.ant-group', { has: page.locator('.ant-toggle') }).first();
    await expect(group.locator('p.antiphon.ant-alt').first()).toBeHidden();
    await group.locator('.ant-toggle').click();
    await expect(group.locator('p.antiphon.ant-alt').first()).toBeVisible();
});

// A page left open, or shown again, on a later day switches to that day's season.
test('a page left open into Advent switches to the Advent antiphons at midnight', async ({ page }) => {
    await page.clock.install({ time: new Date(2026, 10, 28, 23, 59, 0) }); // Saturday before Advent
    await page.goto('pages/jumapili1.html');
    await expect(page.locator('.masifu-season-badge')).toHaveText('Leo: Kipindi cha Kawaida');
    await expectInvitatory(page, 'jumapili1', 'Kawaida ya Mwaliko');
    await page.clock.runFor(2 * 60 * 1000); // past midnight: the First Sunday of Advent
    await expect(page.locator('.masifu-season-badge')).toHaveText('Leo: Kipindi cha Majilio');
    await expectInvitatory(page, 'jumapili1', 'Kipindi cha Majilio I (hadi Des. 16)');
    const labels = (await page.locator('p.antiphon').evaluateAll((els) => els
        .filter((e) => e.getClientRects().length).map((e) => e.textContent.trim()))).map(label).filter(Boolean);
    expect(labels.filter((l) => l === 'Majilio')).toHaveLength(6);
    expect(labels).not.toContain('Kawaida');
});

test('a page shown again on the Ascension switches the invitatory', async ({ page }) => {
    await page.clock.install({ time: new Date(2027, 4, 5, 8) }); // Wednesday before the Ascension
    await page.goto('pages/jumatano4.html');
    await expectInvitatory(page, 'jumatano4', 'Kipindi cha Pasaka I (hadi Kupaa)');
    await page.clock.setSystemTime(new Date(2027, 4, 6, 8)); // the phone wakes up the next day
    await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange')));
    await expectInvitatory(page, 'jumatano4', 'Kipindi cha Pasaka II (Kupaa hadi Pentekoste)');
});

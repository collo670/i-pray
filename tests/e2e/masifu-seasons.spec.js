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
        expect(labels.filter((l) => /Mwaliko|Majilio I/.test(l)), name).toEqual(['Kipindi cha Majilio I (hadi Des. 16)']);
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
        expect(labels.filter((l) => /Mwaliko|Majilio I/.test(l)), name).toEqual(['Kipindi cha Majilio II (Desemba 17-23)']);
        expect(labels.filter((l) => /Pasaka|Kwaresima|Noeli/.test(l)), name).toEqual([]);
    }
    // December 17-23 falls in psalter weeks III and IV, whose weekdays have
    // December antiphons: they show instead of the psalter's.
    const labels = (await open(page, 'ijumaa4', new Date(2026, 11, 18, 8))).map(label).filter(Boolean);
    expect(labels.filter((l) => l === 'Desemba 17-23')).toHaveLength(6);
    expect(labels).not.toContain('Kawaida');
});

test('Christmas: the invitatory changes at the Epiphany', async ({ page }) => {
    const before = (await open(page, 'jumatatu1', new Date(2027, 0, 4, 8))).map(label);
    expect(before).toContain('Kipindi cha Noeli I (kabla ya Tokeo la Bwana)');
    expect(before).not.toContain('Kipindi cha Noeli II (baada ya Tokeo la Bwana)');
    const after = (await open(page, 'ijumaa1', new Date(2027, 0, 8, 8))).map(label);
    expect(after).toContain('Kipindi cha Noeli II (baada ya Tokeo la Bwana)');
    expect(after).not.toContain('Kipindi cha Noeli I (kabla ya Tokeo la Bwana)');
    expect(after).not.toContain('Kawaida ya Mwaliko');
});

for (const [sunday, date, other] of [[1, new Date(2027, 1, 14, 8), 5], [5, new Date(2027, 2, 14, 8), 1]]) {
    test('Jumapili I on Lent Sunday ' + sunday + ' has that Sunday\'s antiphons', async ({ page }) => {
        const labels = (await open(page, 'jumapili1', date)).map(label).filter(Boolean);
        expect(labels.filter((l) => l === 'Kwaresima (Jumapili ' + sunday + ')')).toHaveLength(6);
        expect(labels).not.toContain('Kwaresima (Jumapili ' + other + ')');
        expect(labels.filter((l) => /^(Kawaida|Majilio|Kipindi cha Pasaka)$/.test(l))).toEqual([]);
        expect(labels).toContain('Kipindi cha Kwaresima I (pamoja na Juma Kuu)');
    });
}

test('Holy Week keeps only the first Lent invitatory', async ({ page }) => {
    const labels = (await open(page, 'jumanne2', new Date(2027, 2, 23, 8))).map(label);
    expect(labels).toContain('Kipindi cha Kwaresima I (pamoja na Juma Kuu)');
    expect(labels).not.toContain('Kipindi cha Kwaresima II (isipokuwa kwa Juma Kuu)');
});

test('Easter: the seasonal antiphons show on every page, and the invitatory changes at the Ascension', async ({ page }) => {
    test.setTimeout(120000);
    for (const name of PAGES) {
        const labels = (await open(page, name, new Date(2027, 3, 13, 8))).map(label).filter(Boolean);
        expect(labels.filter((l) => /Mwaliko|Pasaka I/.test(l)), name).toEqual(['Kipindi cha Pasaka I (hadi Kupaa)']);
        expect(labels.filter((l) => /Kwaresima|Majilio|Desemba|Noeli|Juma Kuu/.test(l)), name).toEqual([]);
    }
    // Week IV used to hide its Easter antiphons with an inline style.
    const week4 = (await open(page, 'jumanne4', new Date(2027, 3, 13, 8))).map(label);
    expect(week4).toContain('Kipindi cha Pasaka');
    const ascension = (await open(page, 'jumatatu4', new Date(2027, 4, 10, 8))).map(label);
    expect(ascension).toContain('Kipindi cha Pasaka II (Kupaa hadi Pentekoste)');
    expect(ascension).not.toContain('Kipindi cha Pasaka I (hadi Kupaa)');
});

test('in Ordinary Time only the ordinary antiphons show, and the others open on request', async ({ page }) => {
    test.setTimeout(120000);
    for (const name of PAGES) {
        const labels = (await open(page, name, new Date(2026, 10, 4, 8))).map(label).filter(Boolean);
        expect(labels.filter((l) => /Pasaka|Kwaresima|Majilio|Desemba|Noeli|Juma Kuu|Matawi/.test(l)), name).toEqual([]);
        expect(labels[0], name).toBe('Kawaida ya Mwaliko');
    }
    await page.locator('.ant-toggle').first().click();
    await expect(page.locator('.ant-group').first().locator('p.antiphon')).toHaveCount(9);
    await expect(page.locator('.ant-group').first().locator('p.antiphon').nth(8)).toBeVisible();
});

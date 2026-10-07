// Liturgical calendar engine (js/liturgical-calendar.js): `npm run test:unit`.
const test = require('node:test');
const assert = require('node:assert/strict');
const loadCalendar = require('./load-calendar');

const cal = loadCalendar();
const d = (iso) => { const [y, m, day] = iso.split('-').map(Number); return new Date(y, m - 1, day); };
const iso = (date) => date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');

test('Easter Sunday', () => {
    for (const [year, easter] of [[2024, '2024-03-31'], [2025, '2025-04-20'], [2026, '2026-04-05'], [2027, '2027-03-28'], [2030, '2030-04-21'], [2035, '2035-03-25']]) {
        assert.equal(iso(cal.easterFor(year)), easter, String(year));
    }
});

test('season and week labels', () => {
    assert.equal(cal.today(d('2026-10-07'), 'en').dayLabel, 'Wednesday of the 27th Week in Ordinary Time');
    assert.equal(cal.today(d('2026-10-07'), 'sw').dayLabel, 'Jumatano, Juma la 27 la Mwaka');
    assert.equal(cal.today(d('2026-11-29'), 'en').dayLabel, '1st Sunday of Advent');
    assert.equal(cal.today(d('2026-02-18'), 'en').season, 'Lent');
    assert.equal(cal.today(d('2026-04-12'), 'en').season, 'Easter');
});

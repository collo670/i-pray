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

const top = (isoDate, lang) => {
    const c = cal.celebrationFor(d(isoDate), lang);
    return c ? c.name : null;
};

test('dates and data corrected against the General Roman Calendar', () => {
    assert.equal(top('2027-10-04'), 'Francis of Assisi');
    assert.equal(top('2026-10-03'), null);
    assert.equal(top('2027-02-05'), 'Agatha, virgin and martyr');
    assert.equal(top('2027-05-26'), 'Philip Neri');
    assert.equal(top('2027-07-05'), 'Anthony Zaccaria');
    assert.equal(top('2027-01-20'), 'Fabian or Sebastian');
    assert.equal(cal.celebrationFor(d('2026-11-30')).color, 'red', 'apostles are red');
    assert.equal(cal.celebrationFor(d('2027-11-02')).color, 'purple', 'All Souls');
});

test('no national (US-only) celebrations', () => {
    for (const day of ['2026-07-01', '2026-09-09', '2027-01-04', '2027-01-05', '2027-11-13', '2027-10-06']) {
        const c = cal.celebrationFor(d(day));
        assert.ok(!c || !/Seton|Neumann|Serra|Claver|Cabrini|Durocher/.test(c.name), day + ': ' + (c && c.name));
    }
});

test('Sundays outrank memorials and saints’ feasts', () => {
    assert.equal(top('2026-10-04'), null, 'Francis of Assisi on the 27th Sunday');
    assert.equal(top('2026-02-08'), null, 'Josephine Bakhita on the 5th Sunday');
    assert.equal(top('2026-10-18'), null, 'St Luke (feast) on the 29th Sunday');
    // ...but feasts of the Lord and solemnities replace a Sunday in Ordinary Time
    assert.equal(top('2023-08-06'), 'Transfiguration of the Lord');
    assert.equal(top('2025-09-14'), 'Exaltation of the Holy Cross');
    assert.equal(top('2025-11-09'), 'Dedication of the Lateran Basilica');
    assert.equal(top('2025-11-02'), 'Commemoration of All the Faithful Departed');
});

test('privileged seasons', () => {
    // Memorials in Lent are only commemorated
    assert.equal(cal.celebrationFor(d('2026-03-07')).type, 'Commemoration');
    // A saint's feast still is celebrated on a Lenten weekday
    assert.equal(top('2027-02-22'), 'Chair of Saint Peter, Apostle');
    // Nothing else in Holy Week or the Easter octave
    assert.equal(top('2026-03-30'), null);
    assert.equal(top('2025-04-25'), 'Friday within the Octave of Easter');
    assert.equal(top('2024-02-14'), 'Ash Wednesday');
});

test('impeded solemnities are transferred', () => {
    assert.notEqual(top('2024-12-08'), 'Immaculate Conception of the Blessed Virgin Mary', 'Advent Sunday');
    assert.equal(top('2024-12-09'), 'Immaculate Conception of the Blessed Virgin Mary');
    assert.equal(top('2024-04-08'), 'Annunciation of the Lord');
    assert.equal(top('2035-03-17'), 'Joseph, Spouse of the Blessed Virgin Mary');
    assert.equal(top('2035-04-02'), 'Annunciation of the Lord');
    assert.equal(top('2022-06-24'), 'The Most Sacred Heart of Jesus');
    assert.equal(top('2022-06-25'), 'Nativity of Saint John the Baptist');
});

test('First Vespers', () => {
    const v = (isoDate) => cal.vespersFor(d(isoDate), 'en');
    assert.equal(v('2026-10-10').first, true);
    assert.equal(v('2026-10-10').info.dayLabel, '28th Sunday in Ordinary Time');
    assert.equal(v('2026-08-14').celebration.name, 'Assumption of the Blessed Virgin Mary');
    assert.equal(v('2026-08-15').first, false, 'a solemnity keeps its own Vespers over an ordinary Sunday');
    assert.equal(v('2026-12-24').celebration.name, 'Nativity of the Lord');
    assert.equal(v('2026-04-04').first, false, 'Holy Saturday');
    assert.equal(v('2026-10-07').first, false);
});

test('every celebration has a Swahili name', () => {
    for (let day = d('2026-01-01'); day.getFullYear() === 2026; day.setDate(day.getDate() + 1)) {
        for (const c of cal.celebrationsFor(new Date(day), 'sw')) {
            assert.ok(c.name && c.name !== c.nameEn, iso(day) + ' ' + c.nameEn);
        }
    }
    assert.equal(top('2026-10-07', 'sw'), 'Bikira Maria wa Rozari');
    assert.equal(cal.celebrationFor(d('2026-10-07'), 'sw').rankLabel, 'Kumbukumbu');
});

test('upcoming celebrations', () => {
    const next = cal.upcoming(d('2026-10-07'), 3, 'en', { minType: 'Memorial' });
    assert.deepEqual(Array.from(next, (c) => c.name), ['Our Lady of the Rosary', 'Teresa of Jesus', 'Ignatius of Antioch']);
});

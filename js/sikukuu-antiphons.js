// ---------------------------------------------------------------------------
// Masifu ya Asubuhi: the proper psalm antiphons of Feasts and Solemnities.
//
// On a Feast or Solemnity js/sikukuu.js gives every Morning Prayer page the
// psalms of Jumapili I (Zab. 63, Dan. 3, Zab. 149). This table gives those
// psalms the day's own antiphons in place of the Sunday ones. forDate()
// returns them only for the day the calendar (js/liturgical-calendar.js)
// keeps that celebration - a transferred solemnity on the day it is moved
// to - so on every other day the pages are unchanged.
//
// ANTIPHONS is keyed by the calendar's celebration id: 'MM-DD' for a fixed
// date, a name for a movable day. Each entry is one of
//   { source, antiphons: [Ant. 1, Ant. 2, Ant. 3] }
//   null        no Swahili text yet: the page keeps the Sunday antiphons
//   'other-id'  the same antiphons as that celebration
// In Eastertide "aleluya" is added to an antiphon that does not end with it.
//
//   IPraySikukuuAntiphons.forDate(date[, calendar])
//       { id, name, rank, antiphons: [3 strings] } or null
//   IPraySikukuuAntiphons.ANTIPHONS   the table
// ---------------------------------------------------------------------------
(function () {
    'use strict';

    const BREVIARY = 'docs/pdfs/MasifuYaAsubuhi.pdf';

    const ANTIPHONS = {
        // ---- Movable days -----------------------------------------------------
        'baptism': null, // Ubatizo wa Bwana
        'easter': null, // Dominika ya Pasaka
        'easter-octave': 'easter', // Oktava ya Pasaka: the antiphons of Easter Sunday
        'ascension': null, // Kupaa kwa Bwana
        'pentecost': null, // Dominika ya Pentekoste
        'trinity': {
            source: BREVIARY + ', Sherehe za Bwana: Utatu Mtakatifu',
            antiphons: [
                'Enzi yote na nguvu, utukufu na heshima, sifa na ibada ni mali yako, Ee Utatu Mtakatifu, daima na milele.',
                'Viumbe vyako vyote kwa haki vinakusifu, vinakuabudu na kukuheshimu, Ee Utatu Mtakatifu.',
                'Vitu vyote vimetoka kwake, vimeumbwa kwa njia yake, na vimo ndani yake: atukuzwe milele.'
            ]
        },
        'corpus-christi': {
            source: BREVIARY + ', Sherehe za Bwana: Mwili na Damu ya Kristo',
            antiphons: [
                'Watu wako wanakula chakula cha malaika, unawapa mkate utokao mbinguni, aleluya.',
                'Makuhani huwekwa wakf ili wamtolee Mungu ubani na mkate, aleluya.',
                'Atakayeshinda nitampa manna iliyofichika, na jina jipya, aleluya.'
            ]
        },
        'sacred-heart': {
            source: BREVIARY + ', Sherehe za Bwana: Moyo Mtakatifu wa Yesu',
            antiphons: [
                'Yesu akasimama na kusema kwa sauti kubwa: \'Aonaye kiu, na aje kwangu anywe.\'',
                'Njooni kwangu, ninyi nyote mnaosumbuka na kulemewa na mizigo, nami nitawapumzisha.',
                'Mwanangu, nipe moyo wako, uzingatie ushauri wangu.'
            ]
        },
        'christ-the-king': {
            source: BREVIARY + ', Jumapili la 34: Kristo Mfalme',
            antiphons: [
                'Tazameni, mtu ambaye jina lake ni \'Jua Lichomozalo\'; atakalia kiti cha enzi na kutawala vyote; atayatangazia mataifa amani.',
                'Atatukuzwa duniani kote, na yeye mwenyewe atakuwa amani.',
                'Bwana amempa mamlaka, heshima na ufalme; kila kabila na taifa, na watu wote watamwabudu.'
            ]
        },
        'holy-family': null, // Familia Takatifu

        // ---- Fixed dates --------------------------------------------------------
        '01-01': null, // Maria Mtakatifu, Mama wa Mungu
        '01-06': null, // Epifania ya Bwana
        '01-25': null, // Kuongoka kwa Mt. Paulo
        '02-02': null, // Kutolewa kwa Bwana Hekaluni
        '02-22': null, // Kiti cha Mt. Petro
        '03-19': null, // Mt. Yosefu
        '03-25': null, // Kupashwa Habari kwa Bwana
        '04-25': null, // Mt. Marko
        '05-03': null, // Wat. Filipo na Yakobo
        '05-14': null, // Mt. Mathia
        '05-31': null, // Bikira Maria Kumtembelea Elisabeti
        '06-24': null, // Kuzaliwa kwa Mt. Yohane Mbatizaji
        '06-29': null, // Wat. Petro na Paulo
        '07-03': null, // Mt. Thoma
        '07-22': null, // Mt. Maria Magdalena
        '07-25': null, // Mt. Yakobo
        '08-06': null, // Kugeuka Sura kwa Bwana
        '08-10': null, // Mt. Laurenti
        '08-15': null, // Kupalizwa Mbinguni kwa Bikira Maria
        '08-24': null, // Mt. Bartolomayo
        '09-08': null, // Kuzaliwa kwa Bikira Maria
        '09-14': null, // Kutukuzwa kwa Msalaba Mtakatifu
        '09-21': null, // Mt. Mathayo
        '09-29': null, // Malaika Wakuu
        '10-18': null, // Mt. Luka
        '10-28': null, // Wat. Simoni na Yuda
        '11-01': null, // Watakatifu Wote
        // Marehemu Wote: Morning Prayer of the Office of the Dead has its own
        // psalms (Zab. 51, Isa. 38, Zab. 146), not those of Jumapili I, so
        // its antiphons cannot go on the Sunday psalms.
        '11-02': null,
        '11-09': null, // Kutabarukiwa kwa Basilika ya Laterani
        '11-30': null, // Mt. Andrea
        '12-08': null, // Bikira Maria Mkingiwa Dhambi ya Asili
        '12-25': null, // Kuzaliwa kwa Bwana
        '12-26': null, // Mt. Stefano
        '12-27': null, // Mt. Yohane, Mtume na Mwinjili
        '12-28': null // Watoto Wafiadini
    };

    // The entry for a celebration id, following an alias; null when there
    // is no text for it.
    function entryFor(id) {
        let entry = ANTIPHONS[id];
        if (typeof entry === 'string') entry = ANTIPHONS[entry];
        return entry && Array.isArray(entry.antiphons) && entry.antiphons.length === 3 ? entry : null;
    }

    function withAlleluia(text) {
        if (/aleluya[.!]?\s*$/i.test(text)) return text;
        return text.replace(/[\s.;:,]+$/, '') + ', aleluya.';
    }

    // The proper psalm antiphons for `date`, or null when that day is not a
    // Feast or Solemnity with antiphons in the table.
    function forDate(date, calendar) {
        const cal = calendar || (typeof window !== 'undefined' ? window.LiturgicalCalendar : null);
        if (!date || !cal || typeof cal.celebrationFor !== 'function') return null;
        const celebration = cal.celebrationFor(date, 'sw');
        if (!celebration || (celebration.type !== 'Feast' && celebration.type !== 'Solemnity')) return null;
        const entry = entryFor(celebration.id);
        if (!entry) return null;
        const eastertide = typeof cal.today === 'function' && cal.today(date).season === 'Easter';
        return {
            id: celebration.id,
            name: celebration.nameSw || celebration.name,
            rank: celebration.rankLabel || (celebration.type === 'Solemnity' ? 'Sherehe' : 'Sikukuu'),
            antiphons: entry.antiphons.map(function (a) { return eastertide ? withAlleluia(a) : a; })
        };
    }

    window.IPraySikukuuAntiphons = { ANTIPHONS: ANTIPHONS, forDate: forDate, withAlleluia: withAlleluia };
}());

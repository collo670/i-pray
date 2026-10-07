// ipray language setting - one for the whole app.
// ---------------------------------------------------------------------------
// Loaded in <head> of every page, next to js/theme.js and js/text-size.js.
// It owns the saved language (localStorage 'preferredLanguage'), so every
// page reads it the same way and agrees on the default, and it translates
// the labels every page shares - the bottom navigation and the Prayers
// sheet - wherever they are marked with data-translate.
//
//   IPrayI18n.lang()        'sw' | 'en' | 'es' | 'it' | 'fr' | 'pt'
//   IPrayI18n.prayerLang()  'sw' or 'en': the prayer texts exist only in
//                           these two, so every other language reads English
//   IPrayI18n.set(lang)     save and apply it here and in every open page
//   IPrayI18n.onChange(fn)  fn(lang) whenever the language changes, in this
//                           page or another one
//   IPrayI18n.t(key)        a shared label in the current language
//   IPrayI18n.apply(root)   translate [data-translate] labels under root
//
// Pages with more words of their own (home, calendar, settings) keep their
// own dictionaries and use this only for reading, saving and following the
// setting.
(function () {
    'use strict';

    var KEY = 'preferredLanguage';
    var SUPPORTED = ['sw', 'en', 'es', 'it', 'fr', 'pt'];
    // Kiswahili first: the app's prayers are Swahili-first, and this is the
    // home page's long-standing default.
    var DEFAULT = 'sw';

    var LABELS = {
        en: { home: 'Home', prayers: 'Prayers', calendar: 'Calendar', settings: 'Settings', morningPrayer: 'Morning Prayer', officeOfReadings: 'Office of Readings', middayPrayer: 'Midday Prayer', eveningPrayer: 'Evening Prayer', nightPrayer: 'Night Prayer', holyRosary: 'Holy Rosary', stationsOfCross: 'Stations of the Cross', carmenPrayer: 'Prayer to Carmen Hernández' },
        sw: { home: 'Nyumbani', prayers: 'Sala', calendar: 'Kalenda', settings: 'Mipangilio', morningPrayer: 'Masifu ya Asubuhi', officeOfReadings: 'Ofisi ya Masomo', middayPrayer: 'Sala ya Mchana', eveningPrayer: 'Masifu ya Jioni', nightPrayer: 'Sala ya Usiku', holyRosary: 'Rozari Takatifu', stationsOfCross: 'Njia ya Msalaba', carmenPrayer: 'Sala kwa Carmen Hernández' },
        es: { home: 'Inicio', prayers: 'Oraciones', calendar: 'Calendario', settings: 'Ajustes', morningPrayer: 'Oración de la Mañana', officeOfReadings: 'Oficio de Lectura', middayPrayer: 'Oración del Mediodía', eveningPrayer: 'Vísperas', nightPrayer: 'Completas', holyRosary: 'Santo Rosario', stationsOfCross: 'Vía Crucis', carmenPrayer: 'Oración a Carmen Hernández' },
        it: { home: 'Home', prayers: 'Preghiere', calendar: 'Calendario', settings: 'Impostazioni', morningPrayer: 'Lodi Mattutine', officeOfReadings: 'Ufficio delle Letture', middayPrayer: 'Ora Media', eveningPrayer: 'Vespri', nightPrayer: 'Compieta', holyRosary: 'Santo Rosario', stationsOfCross: 'Via Crucis', carmenPrayer: 'Preghiera a Carmen Hernández' },
        fr: { home: 'Accueil', prayers: 'Prières', calendar: 'Calendrier', settings: 'Paramètres', morningPrayer: 'Laudes', officeOfReadings: 'Office des Lectures', middayPrayer: 'Prière de Midi', eveningPrayer: 'Vêpres', nightPrayer: 'Complies', holyRosary: 'Saint Rosaire', stationsOfCross: 'Chemin de Croix', carmenPrayer: 'Prière à Carmen Hernández' },
        pt: { home: 'Início', prayers: 'Orações', calendar: 'Calendário', settings: 'Configurações', morningPrayer: 'Oração da Manhã', officeOfReadings: 'Ofício das Leituras', middayPrayer: 'Oração do Meio-Dia', eveningPrayer: 'Vésperas', nightPrayer: 'Completas', holyRosary: 'Santo Rosário', stationsOfCross: 'Via-Sacra', carmenPrayer: 'Oração a Carmen Hernández' }
    };

    function read() {
        var saved = null;
        try {
            // 'language' is where Settings used to keep it.
            saved = localStorage.getItem(KEY) || localStorage.getItem('language');
        } catch (e) {}
        return SUPPORTED.indexOf(saved) !== -1 ? saved : DEFAULT;
    }

    var current = read();
    var listeners = [];

    function t(key, lang) {
        var l = LABELS[lang || current] || LABELS.en;
        return l[key] || LABELS.en[key] || null;
    }

    function apply(root) {
        var scope = root || document;
        if (!scope.querySelectorAll) return;
        Array.prototype.forEach.call(scope.querySelectorAll('[data-translate]'), function (el) {
            var label = t(el.getAttribute('data-translate'));
            if (label && el.children.length === 0) el.textContent = label;
        });
    }

    function changed(lang) {
        current = lang;
        apply(document);
        listeners.slice().forEach(function (fn) {
            try { fn(lang); } catch (e) { if (window.console) console.error(e); }
        });
    }

    function set(lang) {
        if (SUPPORTED.indexOf(lang) === -1) lang = DEFAULT;
        try {
            localStorage.setItem(KEY, lang);
            // Other open pages hear about it through this key.
            localStorage.setItem('langUpdatedAt', String(Date.now()));
        } catch (e) {}
        if (lang !== current) changed(lang);
    }

    function follow() {
        var lang = read();
        if (lang !== current) changed(lang);
    }

    // Another tab or page changed it; or this page came back from the
    // back/forward cache after Settings changed it.
    window.addEventListener('storage', function (e) {
        if (e.key === KEY || e.key === 'langUpdatedAt' || e.key === null) follow();
    });
    window.addEventListener('pageshow', follow);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { apply(document); });
    } else {
        apply(document);
    }

    window.IPrayI18n = {
        lang: function () { return current; },
        prayerLang: function () { return current === 'sw' ? 'sw' : 'en'; },
        set: set,
        onChange: function (fn) { listeners.push(fn); },
        t: t,
        apply: apply,
        SUPPORTED: SUPPORTED.slice()
    };
})();

// The saved week and the day the app shows.
// ---------------------------------------------------------------------------
// Settings > Offline (js/offline-week.js) saves seven days of prayer. They
// are kept for one week from the day they were saved, then deleted here, on
// the first page opened after that.
//
// Picking one of those days in Settings makes the prayer pages (home,
// Morning Prayer, Office of Readings, Midday Prayer, Vespers, Night Prayer,
// daily readings, the Rosary) show that day instead of today, with a bar at
// the top to go back to today. The choice holds until midnight.
//
//   IPrayDay.today()        the day to show: the chosen day (at the current
//                           time of day), or now
//   IPrayDay.chosen()       the chosen day (midnight), or null
//   IPrayDay.choose(date)   show this day of the saved week; null for today
//   IPrayDay.week()         { savedOn, expires, days: [Date x7] } or null
//   IPrayDay.saveWeek(start) record a newly saved week starting on start
//   IPrayDay.isSaved(stamp) true if YYYYMMDD is a day of the saved week
//   IPrayDay.purge()        delete the saved week (and the choice)
//
// Loaded in <head>, after js/i18n.js.
(function () {
    'use strict';

    var WEEK_KEY = 'ipray:offlineWeek';
    var CHOICE_KEY = 'ipray:prayerDay';
    var CACHE = 'ipray-offline-week';
    var DAYS = 7;

    function startOfDay(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }
    function addDays(d, n) { var c = new Date(d); c.setDate(c.getDate() + n); return c; }
    function stampOf(d) {
        return '' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }
    function isoOf(d) { var s = stampOf(d); return s.slice(0, 4) + '-' + s.slice(4, 6) + '-' + s.slice(6); }
    function parseIso(s) {
        var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s || '');
        return m ? new Date(+m[1], +m[2] - 1, +m[3]) : null;
    }
    function readJson(key) {
        try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; }
    }

    function week() {
        var w = readJson(WEEK_KEY);
        var start = w && parseIso(w.start);
        if (!start) return null;
        var days = [];
        for (var i = 0; i < DAYS; i++) days.push(addDays(start, i));
        return { savedOn: start, expires: addDays(start, DAYS), days: days };
    }

    function isSaved(stamp) {
        var w = week();
        return !!w && w.days.some(function (d) { return stampOf(d) === String(stamp); });
    }

    // Deletes the saved week: its cache, the offices kept for its days and
    // the record of it.
    function purge() {
        var w = week();
        if (w) {
            var stamps = w.days.map(stampOf);
            try {
                for (var i = localStorage.length - 1; i >= 0; i--) {
                    var k = localStorage.key(i);
                    if (k && k.indexOf('officeHtml-') === 0 && stamps.indexOf(k.slice(k.lastIndexOf('-') + 1)) !== -1) {
                        localStorage.removeItem(k);
                    }
                }
            } catch (e) {}
        }
        try { localStorage.removeItem(WEEK_KEY); localStorage.removeItem(CHOICE_KEY); } catch (e) {}
        if (typeof caches !== 'undefined') return caches.delete(CACHE).catch(function () {});
        return Promise.resolve();
    }

    // Records a newly saved week. Offices kept for days of an earlier week
    // that the new one doesn't cover go now; they would never be deleted.
    function saveWeek(start) {
        var old = week();
        var next = [];
        for (var i = 0; i < DAYS; i++) next.push(stampOf(addDays(startOfDay(start), i)));
        if (old) {
            old.days.map(stampOf).filter(function (s) { return next.indexOf(s) === -1; }).forEach(function (s) {
                try {
                    for (var j = localStorage.length - 1; j >= 0; j--) {
                        var k = localStorage.key(j);
                        if (k && k.indexOf('officeHtml-') === 0 && k.slice(k.lastIndexOf('-') + 1) === s) localStorage.removeItem(k);
                    }
                } catch (e) {}
            });
        }
        try { localStorage.setItem(WEEK_KEY, JSON.stringify({ start: isoOf(startOfDay(start)) })); } catch (e) {}
    }

    function chosen() {
        var c = readJson(CHOICE_KEY);
        var day = c && parseIso(c.day);
        // Holds for the day it was made, and only for a day still saved
        if (!day || c.on !== isoOf(new Date()) || !isSaved(stampOf(day))) return null;
        return day;
    }

    function choose(date) {
        try {
            if (!date || stampOf(date) === stampOf(new Date())) localStorage.removeItem(CHOICE_KEY);
            else localStorage.setItem(CHOICE_KEY, JSON.stringify({ day: isoOf(date), on: isoOf(new Date()) }));
        } catch (e) {}
        paintBar();
    }

    function today() {
        var now = new Date();
        var day = chosen();
        if (!day) return now;
        day.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
        return day;
    }

    // ---- The bar shown while another day is chosen --------------------------

    var WORDS = {
        sw: { showing: 'Unasali siku ya', back: 'Rudi leo', locale: 'sw' },
        en: { showing: 'Praying for', back: 'Back to today', locale: 'en-GB' }
    };

    function paintBar() {
        if (!document.body) return;
        var bar = document.getElementById('iprayDayBar');
        var day = chosen();
        if (!day) { if (bar) bar.remove(); return; }
        var w = WORDS[window.IPrayI18n && IPrayI18n.prayerLang() === 'en' ? 'en' : 'sw'];
        if (!bar) {
            bar = document.createElement('div');
            bar.id = 'iprayDayBar';
            bar.setAttribute('role', 'status');
            bar.style.cssText = 'position:sticky;top:0;z-index:60;display:flex;align-items:center;justify-content:center;gap:12px;flex-wrap:wrap;'
                + 'padding:8px 16px;padding-top:calc(8px + env(safe-area-inset-top,0px));background:#7c2133;color:#fff;font:600 14px/1.3 system-ui,sans-serif;text-align:center';
            bar.innerHTML = '<span></span><button type="button" style="border:1px solid rgba(255,255,255,.7);border-radius:999px;padding:3px 12px;background:transparent;color:inherit;font:inherit;cursor:pointer"></button>';
            bar.querySelector('button').addEventListener('click', function () {
                choose(null);
                location.reload();
            });
            document.body.insertBefore(bar, document.body.firstChild);
        }
        var label;
        try { label = day.toLocaleDateString(w.locale, { weekday: 'long', day: 'numeric', month: 'long' }); }
        catch (e) { label = day.toDateString(); }
        bar.querySelector('span').textContent = w.showing + ' ' + label;
        bar.querySelector('button').textContent = w.back;
    }

    // Delete a week that has had its seven days
    var w = week();
    if (w && new Date() >= w.expires) purge();

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', paintBar);
    else paintBar();
    if (window.IPrayI18n && IPrayI18n.onChange) IPrayI18n.onChange(paintBar);

    window.IPrayDay = {
        CACHE: CACHE,
        today: today,
        chosen: chosen,
        choose: choose,
        week: week,
        saveWeek: saveWeek,
        isSaved: isSaved,
        purge: purge,
        stampOf: stampOf
    };
})();

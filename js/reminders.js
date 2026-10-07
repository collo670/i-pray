// ipray prayer reminders.
// ---------------------------------------------------------------------------
// Loaded (deferred) on every page. Settings > Prayer Reminders lets the user
// pick which prayers to be reminded of and when. Two ways to be reminded:
//
//  - The phone's calendar: "Add to phone calendar" downloads an .ics file
//    with one daily event (and alarm) per reminder. The calendar app rings
//    at the right time whether or not ipray is open - the reliable way on
//    a website, which can't wake itself up.
//  - Notifications from the app itself, once the user turns them on: shown
//    at the chosen times while any ipray page is open (in a tab or the
//    installed app running in the background). Tapping one opens the
//    prayer.
//
// Saved in localStorage 'ipray:reminders': { notify, items: { id: {on, time} } }.
(function () {
    'use strict';

    var KEY = 'ipray:reminders';
    var FIRED_KEY = 'ipray:remindersFired';

    // The reminders offered, with their default times. `page` is relative to
    // the app root.
    var REMINDERS = [
        { id: 'lauds', time: '06:00', on: true, page: 'pages/masifu-asubuhi.html', sw: 'Masifu ya Asubuhi', en: 'Morning Prayer' },
        { id: 'angelus', time: '12:00', on: true, page: 'index.html', sw: 'Malaika wa Bwana (Angelus)', en: 'The Angelus' },
        { id: 'mercy', time: '15:00', on: false, page: 'index.html', sw: 'Saa ya Huruma ya Mungu', en: 'Hour of Divine Mercy' },
        { id: 'vespers', time: '18:00', on: true, page: 'pages/prayer-hour.html?hour=vespers', sw: 'Masifu ya Jioni', en: 'Evening Prayer' },
        { id: 'compline', time: '21:00', on: false, page: 'pages/compline.html', sw: 'Sala ya Usiku', en: 'Night Prayer' }
    ];

    var WORDS = {
        sw: { body: 'Ni wakati wa sala: ', calendarFile: 'ipray-ukumbusho-wa-sala.ics' },
        en: { body: 'Time to pray: ', calendarFile: 'ipray-prayer-reminders.ics' }
    };

    function lang() { return window.IPrayI18n ? window.IPrayI18n.prayerLang() : 'sw'; }

    // The app root (…/i-pray/), from this script's own address, so links and
    // the calendar file work on any host and from any page depth.
    var ROOT = (function () {
        var s = document.currentScript || document.querySelector('script[src*="js/reminders.js"]');
        return s ? s.src.replace(/js\/reminders\.js.*$/, '') : location.origin + '/i-pray/';
    })();

    function read() {
        var saved = null;
        try { saved = JSON.parse(localStorage.getItem(KEY)); } catch (e) {}
        if (!saved) saved = migrate();
        return { notify: !!saved.notify, items: saved.items || {} };
    }

    // Settings used to keep only the times, as '<prayer>Time'.
    function migrate() {
        var items = {};
        try {
            var morning = localStorage.getItem('morningPrayerTime');
            var angelus = localStorage.getItem('angelusTime');
            if (morning) items.lauds = { time: morning };
            if (angelus) items.angelus = { time: angelus };
        } catch (e) {}
        return { notify: false, items: items };
    }

    function write(state) {
        try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {}
    }

    function list() {
        var state = read();
        var l = lang();
        return REMINDERS.map(function (r) {
            var saved = state.items[r.id] || {};
            return {
                id: r.id,
                title: r[l],
                time: /^\d\d:\d\d$/.test(saved.time || '') ? saved.time : r.time,
                on: typeof saved.on === 'boolean' ? saved.on : r.on,
                url: ROOT + r.page
            };
        });
    }

    function update(id, changes) {
        var state = read();
        state.items[id] = Object.assign({}, state.items[id] || {}, changes);
        write(state);
        schedule();
    }

    // ----- Notifications ----------------------------------------------------

    function notificationsSupported() {
        return 'Notification' in window;
    }

    function notificationsOn() {
        return read().notify && notificationsSupported() && Notification.permission === 'granted';
    }

    // Must be called from a tap: browsers only ask for permission then.
    function enableNotifications() {
        if (!notificationsSupported()) return Promise.resolve('unsupported');
        return Notification.requestPermission().then(function (permission) {
            var state = read();
            state.notify = permission === 'granted';
            write(state);
            schedule();
            return permission;
        });
    }

    function disableNotifications() {
        var state = read();
        state.notify = false;
        write(state);
        schedule();
    }

    function show(reminder) {
        var title = reminder.title;
        var options = {
            body: WORDS[lang()].body + reminder.title,
            icon: ROOT + 'assets/images/icon-192x192.png',
            badge: ROOT + 'assets/images/icon-192x192.png',
            tag: 'ipray-' + reminder.id,
            data: { url: reminder.url }
        };
        // Android only shows notifications through the service worker.
        if (navigator.serviceWorker && navigator.serviceWorker.controller) {
            return navigator.serviceWorker.ready.then(function (reg) { return reg.showNotification(title, options); });
        }
        var n = new Notification(title, options);
        n.onclick = function () { window.focus(); location.href = reminder.url; };
        return Promise.resolve();
    }

    function today() {
        var d = new Date();
        return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
    }

    // Several ipray pages may be open at once; only the first to reach the
    // time shows the notification.
    function claim(id) {
        var fired = {};
        try { fired = JSON.parse(localStorage.getItem(FIRED_KEY)) || {}; } catch (e) {}
        if (fired[id] === today()) return false;
        fired[id] = today();
        try { localStorage.setItem(FIRED_KEY, JSON.stringify(fired)); } catch (e) {}
        return true;
    }

    var timers = [];
    function schedule() {
        timers.forEach(clearTimeout);
        timers = [];
        if (!notificationsOn()) return;
        var now = new Date();
        list().forEach(function (r) {
            if (!r.on) return;
            var parts = r.time.split(':');
            var at = new Date(now.getFullYear(), now.getMonth(), now.getDate(), Number(parts[0]), Number(parts[1]));
            var wait = at - now;
            if (wait < 0) return; // already past today; tomorrow's page load schedules it
            timers.push(setTimeout(function () {
                if (claim(r.id)) show(r);
            }, wait));
        });
    }

    // ----- Phone calendar (.ics) --------------------------------------------

    function pad(n) { return String(n).padStart(2, '0'); }

    function icsEscape(s) {
        return String(s).replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
    }

    function icsText() {
        var now = new Date();
        var stamp = now.getUTCFullYear() + pad(now.getUTCMonth() + 1) + pad(now.getUTCDate()) + 'T'
            + pad(now.getUTCHours()) + pad(now.getUTCMinutes()) + pad(now.getUTCSeconds()) + 'Z';
        var day = now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate());
        var lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//ipray//Prayer reminders//' + lang().toUpperCase(),
            'CALSCALE:GREGORIAN', 'METHOD:PUBLISH'];
        list().filter(function (r) { return r.on; }).forEach(function (r) {
            lines.push(
                'BEGIN:VEVENT',
                'UID:ipray-' + r.id + '@ipray',
                'DTSTAMP:' + stamp,
                // No time zone: the phone keeps it at this time wherever it is.
                'DTSTART:' + day + 'T' + r.time.replace(':', '') + '00',
                'DURATION:PT15M',
                'RRULE:FREQ=DAILY',
                'SUMMARY:' + icsEscape(r.title),
                'DESCRIPTION:' + icsEscape(r.url),
                'URL:' + r.url,
                'BEGIN:VALARM',
                'ACTION:DISPLAY',
                'DESCRIPTION:' + icsEscape(r.title),
                'TRIGGER:PT0M',
                'END:VALARM',
                'END:VEVENT'
            );
        });
        lines.push('END:VCALENDAR');
        return lines.join('\r\n') + '\r\n';
    }

    function downloadCalendar() {
        var blob = new Blob([icsText()], { type: 'text/calendar;charset=utf-8' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = WORDS[lang()].calendarFile;
        document.body.appendChild(a);
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
    }

    // ----- Start ------------------------------------------------------------

    window.addEventListener('storage', function (e) {
        if (e.key === KEY) schedule();
    });
    schedule();

    window.IPrayReminders = {
        list: list,
        update: update,
        notificationsSupported: notificationsSupported,
        notificationsOn: notificationsOn,
        enableNotifications: enableNotifications,
        disableNotifications: disableNotifications,
        icsText: icsText,
        downloadCalendar: downloadCalendar
    };
})();

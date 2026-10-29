// ---------------------------------------------------------------------------
// Masifu ya Asubuhi — shared page behaviour.
//
// 1. Liturgical season detection (self-contained, no other script needed).
// 2. Seasonal antiphons: only the variant for the current season is shown;
//    the rest stay in the page, hidden behind a per-group "Misimu mingine"
//    toggle so nothing is ever lost.
// 3. Text size controls: A− / A / A+ with persistence, replacing the old
//    3-step cycle button.
//
// Loaded with `defer` by the morning-prayer pages together with
// css/masifu.css. All prayer text stays untouched in the HTML.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    // ---- Liturgical season -------------------------------------------------

    // Anonymous Gregorian computus (same algorithm as js/liturgical-calendar.js)
    function easterDate(year) {
        const a = year % 19, b = Math.floor(year / 100), c = year % 100;
        const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25);
        const g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
        const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7;
        const m = Math.floor((a + 11 * h + 22 * l) / 451);
        const month = Math.floor((h + l - 7 * m + 114) / 31) - 1;
        const day = ((h + l - 7 * m + 114) % 31) + 1;
        return new Date(year, month, day);
    }

    function addDays(date, days) {
        const d = new Date(date);
        d.setDate(d.getDate() + days);
        return d;
    }

    // First Sunday of Advent: 4th Sunday before Christmas
    function adventStart(year) {
        const xmas = new Date(year, 11, 25);
        const dow = xmas.getDay();
        return addDays(addDays(xmas, dow === 0 ? -7 : -dow), -21);
    }

    // Baptism of the Lord: first Sunday after January 6
    function baptismOfLord(year) {
        const epiphany = new Date(year, 0, 6);
        return addDays(epiphany, (7 - epiphany.getDay()) % 7 || 7);
    }

    // Returns { key, name, color, isPalmSunday, isHolyWeek, decDay }
    // key: 'kawaida' | 'majilio' | 'noeli' | 'kwaresima' | 'pasaka'
    function seasonInfo(today) {
        const now = today ? new Date(today) : (window.IPrayDay ? IPrayDay.today() : new Date());
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const year = d.getFullYear();
        const easter = easterDate(year);
        const ashWednesday = addDays(easter, -46);
        const palmSunday = addDays(easter, -7);
        const pentecost = addDays(easter, 49);
        const christmas = new Date(year, 11, 25);

        const info = {
            key: 'kawaida',
            name: 'Kipindi cha Kawaida',
            color: 'green',
            isPalmSunday: false,
            isHolyWeek: false,
            decDay: null
        };

        if (d >= adventStart(year) && d < christmas) {
            info.key = 'majilio';
            info.name = 'Kipindi cha Majilio';
            info.color = 'purple';
            if (d.getMonth() === 11) info.decDay = d.getDate();
        } else if (d >= christmas || d <= baptismOfLord(year)) {
            info.key = 'noeli';
            info.name = 'Kipindi cha Noeli';
            info.color = 'white';
        } else if (d >= ashWednesday && d < easter) {
            info.key = 'kwaresima';
            info.name = 'Kipindi cha Kwaresima';
            info.color = 'purple';
            info.isPalmSunday = +d === +palmSunday;
            info.isHolyWeek = d >= palmSunday;
            if (info.isHolyWeek) info.name = 'Juma Kuu';
        } else if (d >= easter && d <= pentecost) {
            info.key = 'pasaka';
            info.name = 'Kipindi cha Pasaka';
            info.color = 'white';
        }
        return info;
    }

    // ---- Antiphon classification -------------------------------------------

    // Classifies one antiphon line by its printed label.
    // kind: 'heading' (ANT. I/II/III), 'always' (Benedictus/unlabelled),
    //       or 'season' with season key + optional December day range.
    function classifyAntiphon(text) {
        const t = text.replace(/\s+/g, ' ').trim();
        if (/^ANT\.?\s*[IVX]+\.?$/i.test(t)) return { kind: 'heading' };
        const m = t.match(/^Ant\.?\s*ya\s+([^:]+):/i);
        if (!m) return { kind: 'always' };
        const label = m[1].toLowerCase();
        if (label.indexOf('zakaria') !== -1) return { kind: 'always' };
        if (label.indexOf('matawi') !== -1) return { kind: 'season', season: 'matawi' };
        if (label.indexOf('juma kuu') !== -1) return { kind: 'season', season: 'jumakuu' };
        if (label.indexOf('kwaresima') !== -1) return { kind: 'season', season: 'kwaresima' };
        if (label.indexOf('majilio') !== -1) return { kind: 'season', season: 'majilio' };
        const dec = label.match(/desemba\s*(\d{1,2})\s*(?:-\s*(\d{1,2}))?/);
        if (dec) {
            return {
                kind: 'season', season: 'desemba',
                from: parseInt(dec[1], 10),
                to: parseInt(dec[2] || dec[1], 10)
            };
        }
        if (label.indexOf('pasaka') !== -1) return { kind: 'season', season: 'pasaka' };
        if (label.indexOf('kawaida') !== -1) return { kind: 'season', season: 'kawaida' };
        return { kind: 'always' };
    }

    // Does this seasonal antiphon apply today?
    function appliesToday(cls, ctx) {
        switch (cls.season) {
            case 'matawi': return ctx.isPalmSunday;
            case 'jumakuu': return ctx.isHolyWeek;
            case 'desemba':
                return ctx.key === 'majilio' && ctx.decDay !== null &&
                    ctx.decDay >= cls.from && ctx.decDay <= cls.to;
            case 'majilio': return ctx.key === 'majilio';
            case 'kwaresima': return ctx.key === 'kwaresima';
            case 'pasaka': return ctx.key === 'pasaka';
            default: return false;
        }
    }

    // More specific variants win when several apply (e.g. Palm Sunday is also
    // Holy Week and Lent; Desemba 17-23 is also Advent).
    const SEASON_PRIORITY = ['matawi', 'jumakuu', 'desemba', 'kwaresima', 'majilio', 'pasaka'];

    // Expose the pure logic for tests / other pages.
    if (typeof window !== 'undefined') {
        window.__masifu = { seasonInfo: seasonInfo, classifyAntiphon: classifyAntiphon, appliesToday: appliesToday };
    }
    if (typeof document === 'undefined') return; // running outside a browser (tests)

    // ---- DOM: seasonal antiphons -------------------------------------------

    // Some pages mark up each season's antiphon as its own <p class="antiphon">;
    // others join several in one <p> separated by <br>. Split the joined ones
    // so every antiphon line is one element.
    function normalizeAntiphons() {
        document.querySelectorAll('p.antiphon').forEach(function (p) {
            const parts = p.innerHTML.split(/(?:\s*<br[^>]*>\s*)+/i)
                .map(function (s) { return s.trim(); })
                .filter(Boolean);
            if (parts.length < 2) return;
            const frag = document.createDocumentFragment();
            parts.forEach(function (html) {
                const np = document.createElement('p');
                np.className = 'antiphon';
                np.innerHTML = html;
                frag.appendChild(np);
            });
            p.replaceWith(frag);
        });
    }

    // Groups of consecutive antiphon <p> siblings share one season toggle.
    function collectGroups() {
        const groups = [];
        document.querySelectorAll('p.antiphon').forEach(function (p) {
            const last = groups[groups.length - 1];
            if (last && last[last.length - 1].nextElementSibling === p) {
                last.push(p);
            } else {
                groups.push([p]);
            }
        });
        return groups;
    }

    function setupSeasonalAntiphons(ctx) {
        normalizeAntiphons();

        collectGroups().forEach(function (group) {
            const entries = group.map(function (p) {
                return { el: p, cls: classifyAntiphon(p.textContent) };
            });

            entries.forEach(function (e) {
                if (e.cls.kind === 'heading') e.el.classList.add('ant-heading');
            });

            const seasonal = entries.filter(function (e) { return e.cls.kind === 'season'; });
            if (seasonal.length < 2) return; // nothing to choose between

            // Pick today's antiphon: most specific applicable seasonal variant,
            // otherwise the ordinary ("ya Kawaida") one, otherwise the first.
            let active = null;
            for (let i = 0; i < SEASON_PRIORITY.length && !active; i++) {
                active = seasonal.find(function (e) {
                    return e.cls.season === SEASON_PRIORITY[i] && appliesToday(e.cls, ctx);
                }) || null;
            }
            if (!active) {
                active = seasonal.find(function (e) { return e.cls.season === 'kawaida'; }) || seasonal[0];
            }

            const hidden = seasonal.filter(function (e) { return e !== active; });
            if (!hidden.length) return;

            // Wrap the group so the toggle only affects these antiphons.
            const wrapper = document.createElement('div');
            wrapper.className = 'ant-group';
            group[0].parentNode.insertBefore(wrapper, group[0]);
            group.forEach(function (p) { wrapper.appendChild(p); });

            hidden.forEach(function (e) { e.el.classList.add('ant-alt'); });

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'ant-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            const label = 'Misimu mingine (' + hidden.length + ')';
            toggle.innerHTML = '<span class="chev">▾</span><span class="txt"></span>';
            toggle.querySelector('.txt').textContent = label;
            toggle.addEventListener('click', function () {
                const open = wrapper.classList.toggle('show-all');
                toggle.setAttribute('aria-expanded', String(open));
                toggle.querySelector('.txt').textContent = open ? 'Ficha misimu mingine' : label;
            });
            wrapper.appendChild(toggle);
        });
    }

    // ---- DOM: season badge ---------------------------------------------------

    function insertSeasonBadge(ctx) {
        const h1 = document.querySelector('.container h1');
        if (!h1) return;
        const badge = document.createElement('div');
        badge.className = 'masifu-season-badge';
        const pill = document.createElement('span');
        const dot = document.createElement('i');
        dot.className = 'dot ' + ctx.color;
        pill.appendChild(dot);
        pill.appendChild(document.createTextNode('Leo: ' + ctx.name));
        badge.appendChild(pill);
        h1.insertAdjacentElement('afterend', badge);
    }

    // ---- DOM: card layout for unclassed sections ------------------------------

    function classifyPlainSections() {
        document.querySelectorAll('.container > div:not([class])').forEach(function (div) {
            div.classList.add('prayer-section');
        });
    }

    // ---- Navigation -------------------------------------------------------------

    function buildTodayMorningPrayerLink() {
        const now = window.IPrayDay ? IPrayDay.today() : new Date();
        const dayToPrefix = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
        const dayPrefix = dayToPrefix[now.getDay()];
        const weekSequence = [2, 3, 4, 1];
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const daysSinceSunday = today.getDay();
        const currentSunday = new Date(today);
        currentSunday.setDate(today.getDate() - daysSinceSunday);

        const referenceWeek2Sunday = new Date(2025, 7, 3);
        referenceWeek2Sunday.setHours(0, 0, 0, 0);

        const msPerWeek = 7 * 24 * 60 * 60 * 1000;
        const weeksSinceRef = Math.floor((currentSunday - referenceWeek2Sunday) / msPerWeek);
        const weekIndex = ((weeksSinceRef % weekSequence.length) + weekSequence.length) % weekSequence.length;
        const week = weekSequence[weekIndex];

        return dayPrefix + week + '.html';
    }

    function getPreferredLanguage() {
        return window.IPrayI18n ? window.IPrayI18n.prayerLang() : 'sw';
    }

    function buildDailyReadingsLabel() {
        return getPreferredLanguage() === 'en' ? 'Daily Readings' : 'Masomo ya Siku';
    }

    function samePage(href) {
        try {
            const linkUrl = new URL(href, window.location.href);
            const pageUrl = new URL(window.location.href);
            return linkUrl.pathname === pageUrl.pathname && linkUrl.search === pageUrl.search;
        } catch (e) {
            return false;
        }
    }

    // ---- Menu ---------------------------------------------------------------

    // The top bar's menu button drops the menu down from the top bar as a
    // sheet, like the Options button on the other prayer pages
    // (js/app-options.js). It replaces the dropdown list in the page's
    // <nav class="app-bar-menu">, keeping its links. The Amefufuka pages
    // share the markup and css/masifu.css but keep the dropdown, so the
    // pages that use the sheet say so with body.masifu-menu-sheet.

    const MENU_ICONS = {
        home: '<path fill="currentColor" stroke="none" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
        office: '<path d="M12 6.25C10.5 5 8.25 4.5 4 4.5v13c4.25 0 6.5.5 8 1.75 1.5-1.25 3.75-1.75 8-1.75v-13c-4.25 0-6.5.5-8 1.75zm0 0v13"/>',
        readings: '<path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 01-2-2V4zm0 14a2 2 0 012-2h10M12 7v6m-2.5-3.5h5"/>',
        midday: '<path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14l-1.41-1.41M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>',
        evening: '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>',
        close: '<path d="M6 18L18 6M6 6l12 12"/>',
        chevron: '<path d="M9 5l7 7-7 7"/>'
    };

    function menuIcon(name, size) {
        return '<svg width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"'
            + ' stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">'
            + MENU_ICONS[name] + '</svg>';
    }

    function menuItems() {
        return [
            { href: '../index.html', label: 'Nyumbani', icon: 'home' },
            { href: 'office-of-readings.html', label: 'Ofisi ya Masomo', icon: 'office' },
            { href: 'daily-readings.html', label: buildDailyReadingsLabel(), icon: 'readings', dailyReadings: true },
            { href: 'prayer-hour.html?hour=sext', label: 'Sala za Mchana', icon: 'midday' },
            { href: 'prayer-hour.html?hour=vespers', label: 'Masifu ya Jioni', icon: 'evening' }
        ];
    }

    function buildMenuSheet() {
        const sheet = document.createElement('div');
        sheet.id = 'masifuMenuSheet';
        sheet.className = 'masifu-sheet';
        sheet.hidden = true;
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-labelledby', 'masifuMenuTitle');

        const links = menuItems().map(function (item) {
            const current = samePage(item.href) ? ' aria-current="page"' : '';
            return '<a class="masifu-sheet-link" href="' + item.href + '"' + current + '>'
                + '<span class="masifu-sheet-icon">' + menuIcon(item.icon, 20) + '</span>'
                + '<span class="masifu-sheet-label"' + (item.dailyReadings ? ' data-daily-readings' : '') + '>' + item.label + '</span>'
                + '<span class="masifu-sheet-chevron">' + menuIcon('chevron', 16) + '</span>'
                + '</a>';
        }).join('');

        sheet.innerHTML = '<div class="masifu-sheet-panel">'
            + '<div class="masifu-sheet-header">'
            + '<h2 id="masifuMenuTitle" class="masifu-sheet-title" data-translate="options">Chaguo</h2>'
            + '<button type="button" class="masifu-sheet-close">' + menuIcon('close', 18) + '</button>'
            + '</div>'
            + '<section class="masifu-sheet-section" aria-labelledby="masifuMenuGoTo">'
            + '<h3 id="masifuMenuGoTo" class="masifu-sheet-section-title" data-translate="menuGoTo">Nenda</h3>'
            + '<nav class="masifu-sheet-list" aria-label="Morning prayer navigation">' + links + '</nav>'
            + '</section>'
            + '<div class="masifu-sheet-handle" aria-hidden="true"></div>'
            + '</div>';
        return sheet;
    }

    function setupMenuSheet() {
        const button = document.querySelector('body.masifu-menu-sheet .hamburger');
        if (!button || document.getElementById('masifuMenuSheet')) return;

        const oldMenu = document.querySelector('.app-bar-menu');
        if (oldMenu) oldMenu.remove();

        const sheet = buildMenuSheet();
        document.body.appendChild(sheet);
        const closeButton = sheet.querySelector('.masifu-sheet-close');

        // isOpen, not the classes, says whether the sheet is open: it can be
        // closed again before the frame that slides it in.
        let isOpen = false;
        function open() {
            isOpen = true;
            sheet.hidden = false;
            requestAnimationFrame(function () {
                if (isOpen) sheet.classList.add('is-open');
            });
            document.body.classList.add('masifu-sheet-open');
            button.setAttribute('aria-expanded', 'true');
        }
        function close() {
            if (!isOpen) return;
            isOpen = false;
            sheet.classList.remove('is-open');
            document.body.classList.remove('masifu-sheet-open');
            button.setAttribute('aria-expanded', 'false');
            setTimeout(function () {
                if (!isOpen) sheet.hidden = true;
            }, 250);
        }

        // The button's inline onclick="toggleMenu()" opened the dropdown.
        button.removeAttribute('onclick');
        button.setAttribute('aria-controls', sheet.id);
        button.setAttribute('aria-haspopup', 'dialog');
        button.addEventListener('click', open);
        window.toggleMenu = function (forceClose) {
            if (forceClose === true || (forceClose === undefined && isOpen)) close();
            else open();
        };

        closeButton.addEventListener('click', close);
        sheet.addEventListener('click', function (e) {
            if (e.target === sheet) close();
        });
        sheet.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', close);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        function paint() {
            const sw = getPreferredLanguage() === 'sw';
            closeButton.setAttribute('aria-label', sw ? 'Funga' : 'Close');
            button.setAttribute('aria-label', sw ? 'Fungua menyu' : 'Open menu');
            sheet.querySelector('[data-daily-readings]').textContent = buildDailyReadingsLabel();
            if (window.IPrayI18n) window.IPrayI18n.apply(sheet);
        }
        paint();
        if (window.IPrayI18n) window.IPrayI18n.onChange(paint);
    }

    // ---- Text size controls ----------------------------------------------------

    // The size is the app-wide setting kept by js/text-size.js: it sets
    // --prayer-text-scale on <html>, which css/index.css's .container rule
    // multiplies its font-size by, instead of scaling the root <html>
    // font-size: the navbar sits outside .container as a sibling, so it stays
    // a fixed size while only the prayer text grows and shrinks.
    function setupTextControls() {
        if (!window.IPrayTextSize) return;
        const ctl = window.IPrayTextSize.createControl({
            className: 'masifu-textctl',
            buttonClass: { dec: 'tc-dec', reset: 'tc-reset', inc: 'tc-inc' }
        });
        document.body.appendChild(ctl);
    }

    // ---- Init -------------------------------------------------------------------

    function init() {
        document.body.classList.add('masifu-modern');
        const ctx = seasonInfo();
        classifyPlainSections();
        setupSeasonalAntiphons(ctx);
        insertSeasonBadge(ctx);
        setupTextControls();
    }

    function initAfterSikukuu() {
        // The menu does not wait for the feast days to load
        setupMenuSheet();
        const ready = window.sikukuuReady;
        if (ready && typeof ready.then === 'function') ready.then(init);
        else init();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAfterSikukuu);
    } else {
        initAfterSikukuu();
    }
})();

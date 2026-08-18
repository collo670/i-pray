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
        const now = today ? new Date(today) : new Date();
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
        const now = new Date();
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
        try {
            return localStorage.getItem('preferredLanguage') === 'en' ? 'en' : 'sw';
        } catch (e) {
            return 'sw';
        }
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

    function wireMobileMenuClose(nav) {
        if (!nav) return;
        nav.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768 && typeof window.toggleMenu === 'function') {
                    window.toggleMenu(true);
                }
            });
        });
    }

    function normalizeTopNavigation() {
        const nav = document.querySelector('#nav-links.nav-links');
        if (!nav) return;

        const items = [
            { href: '../index.html', label: 'Nyumbani' },
            { href: 'office-of-readings.html', label: 'Ofisi ya Masomo' },
            { href: 'daily-readings.html', label: buildDailyReadingsLabel() },
            { href: 'prayer-hour.html?hour=sext', label: 'Sala za Mchana' },
            { href: 'prayer-hour.html?hour=vespers', label: 'Masifu ya Jioni' }
        ];

        nav.innerHTML = items.map(function (item) {
            const currentAttrs = samePage(item.href) ? ' aria-current="page" class="is-current"' : '';
            return '<li><a href="' + item.href + '"' + currentAttrs + '>' + item.label + '</a></li>';
        }).join('');

        wireMobileMenuClose(nav);
    }

    // ---- Text size controls ----------------------------------------------------

    const SCALE_MIN = 0.8;
    const SCALE_MAX = 1.7;
    const SCALE_STEP = 0.1;
    const SCALE_KEY = 'masifuTextScale';

    function loadScale() {
        try {
            const saved = parseFloat(localStorage.getItem(SCALE_KEY));
            if (!isNaN(saved)) return Math.min(SCALE_MAX, Math.max(SCALE_MIN, saved));
            // Migrate the old 3-step cycle button setting
            const old = { small: 0.9, normal: 1, large: 1.25, xlarge: 1.5 }[localStorage.getItem('textSize')];
            if (old) return old;
        } catch (e) { /* storage unavailable */ }
        return 1;
    }

    function setupTextControls() {
        const ctl = document.createElement('div');
        ctl.className = 'masifu-textctl';
        ctl.setAttribute('role', 'group');
        ctl.setAttribute('aria-label', 'Ukubwa wa maandishi');

        const dec = document.createElement('button');
        dec.type = 'button';
        dec.className = 'tc-dec';
        dec.textContent = '−';
        dec.setAttribute('aria-label', 'Punguza ukubwa wa maandishi');

        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'tc-reset';
        reset.setAttribute('aria-label', 'Rejesha ukubwa wa kawaida');

        const inc = document.createElement('button');
        inc.type = 'button';
        inc.className = 'tc-inc';
        inc.textContent = '+';
        inc.setAttribute('aria-label', 'Ongeza ukubwa wa maandishi');

        let scale = loadScale();

        function apply() {
            scale = Math.round(scale * 10) / 10;
            // Set a custom property that css/index.css's .container rule
            // multiplies its font-size by, instead of scaling the root
            // <html> font-size: the navbar sits outside .container as a
            // sibling, so it (and the bottom nav, on pages that have one)
            // never picks up --prayer-text-scale and stays a fixed size
            // while only the prayer text grows and shrinks.
            document.documentElement.style.setProperty('--prayer-text-scale', scale);
            reset.textContent = Math.round(scale * 100) + '%';
            reset.title = 'Rejesha 100%';
            dec.disabled = scale <= SCALE_MIN;
            inc.disabled = scale >= SCALE_MAX;
            try { localStorage.setItem(SCALE_KEY, String(scale)); } catch (e) { /* ignore */ }
        }

        dec.addEventListener('click', function () { scale -= SCALE_STEP; apply(); });
        inc.addEventListener('click', function () { scale += SCALE_STEP; apply(); });
        reset.addEventListener('click', function () { scale = 1; apply(); });

        ctl.appendChild(dec);
        ctl.appendChild(reset);
        ctl.appendChild(inc);
        document.body.appendChild(ctl);
        apply();

        // A few asubuhi pages also carry a fixed bottom nav; without this
        // the floating control would sit on top of it.
        const bottomNav = document.querySelector('.bottom-nav, nav[role="navigation"][aria-label="Main Navigation"]');
        if (bottomNav) {
            const navHeight = bottomNav.getBoundingClientRect().height;
            ctl.style.bottom = 'calc(' + navHeight + 'px + env(safe-area-inset-bottom, 0px) + 0.75rem)';
        }
    }

    // ---- Init -------------------------------------------------------------------

    function init() {
        document.body.classList.add('masifu-modern');
        const ctx = seasonInfo();
        classifyPlainSections();
        normalizeTopNavigation();
        setupSeasonalAntiphons(ctx);
        insertSeasonBadge(ctx);
        setupTextControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

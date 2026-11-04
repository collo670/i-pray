// ---------------------------------------------------------------------------
// Masifu ya Asubuhi — shared page behaviour.
//
// 1. Liturgical season detection (self-contained, no other script needed).
// 2. Seasonal antiphons: only the variant for the current season is shown;
//    the rest stay in the page, hidden behind a per-group "Misimu mingine"
//    toggle so nothing is ever lost. The invitatory (Ant. ya Mwaliko) has
//    no toggle: it shows today's antiphon only. The choice is made again
//    when the page is still open, or shown again, on a later day.
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

    // Returns { key, name, color, isPalmSunday, isHolyWeek, decDay,
    //           lentSunday, beforeEpiphany, beforeAscension }
    // key: 'kawaida' | 'majilio' | 'noeli' | 'kwaresima' | 'pasaka'
    // lentSunday: 1-5 on the Sundays of Lent (Palm Sunday is not counted),
    // otherwise null. Epiphany is January 6 and the Ascension is Easter + 39,
    // as in js/liturgical-calendar.js.
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
            decDay: null,
            lentSunday: null,
            beforeEpiphany: false,
            beforeAscension: false
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
            info.beforeEpiphany = d.getMonth() === 11 || d.getDate() < 6;
        } else if (d >= ashWednesday && d < easter) {
            info.key = 'kwaresima';
            info.name = 'Kipindi cha Kwaresima';
            info.color = 'purple';
            info.isPalmSunday = +d === +palmSunday;
            info.isHolyWeek = d >= palmSunday;
            if (info.isHolyWeek) info.name = 'Juma Kuu';
            if (d.getDay() === 0 && !info.isHolyWeek) {
                info.lentSunday = Math.round((d - addDays(ashWednesday, 4)) / (7 * 864e5)) + 1;
            }
        } else if (d >= easter && d <= pentecost) {
            info.key = 'pasaka';
            info.name = 'Kipindi cha Pasaka';
            info.color = 'white';
            info.beforeAscension = d < addDays(easter, 39);
        }
        return info;
    }

    // ---- Antiphon classification -------------------------------------------

    // Classifies one antiphon line by its printed label.
    // kind: 'heading' (ANT. I/II/III), 'always' (Benedictus/unlabelled),
    //       or 'season' with season key and, where the label says so, the
    //       part of the season it belongs to:
    //   "Kwaresima I (pamoja na Juma Kuu)" / "Kwaresima II (isipokuwa kwa
    //   Juma Kuu)": with or without Holy Week; "Kwaresima (Jumapili 5)": that
    //   Sunday of Lent only; "Majilio II (Desemba 17-23)": those days of
    //   December; "Noeli I (kabla ya Tokeo la Bwana)" / "Noeli II (baada
    //   ...)": before / after Epiphany; "Pasaka I (hadi Kupaa)" / "Pasaka II
    //   (Kupaa hadi Pentekoste)": before / from the Ascension.
    function classifyAntiphon(text) {
        const t = text.replace(/\s+/g, ' ').trim();
        if (/^ANT\.?\s*[IVX]+\.?$/i.test(t)) return { kind: 'heading' };
        const m = t.match(/^Ant\.?\s*ya\s+([^:]+):/i);
        if (!m) return { kind: 'always' };
        const label = m[1].toLowerCase();
        if (label.indexOf('zakaria') !== -1) return { kind: 'always' };
        if (label.indexOf('matawi') !== -1) return { kind: 'season', season: 'matawi' };
        // Before "juma kuu": a Lent label may say whether it covers Holy Week.
        if (label.indexOf('kwaresima') !== -1) {
            const sunday = label.match(/jumapili\s*(\d)/);
            return {
                kind: 'season', season: 'kwaresima',
                holyWeek: label.indexOf('isipokuwa') === -1,
                lentSunday: sunday ? parseInt(sunday[1], 10) : null
            };
        }
        if (label.indexOf('juma kuu') !== -1) return { kind: 'season', season: 'jumakuu' };
        // Before "majilio": "Majilio II (Desemba 17-23)" is the December one.
        const dec = label.match(/desemba\s*(\d{1,2})\s*(?:-\s*(\d{1,2}))?/);
        if (dec) {
            return {
                kind: 'season', season: 'desemba',
                from: parseInt(dec[1], 10),
                to: parseInt(dec[2] || dec[1], 10)
            };
        }
        if (label.indexOf('majilio') !== -1) return { kind: 'season', season: 'majilio' };
        if (label.indexOf('noeli') !== -1) {
            return { kind: 'season', season: 'noeli', part: /kabla/.test(label) ? 1 : /baada/.test(label) ? 2 : null };
        }
        if (label.indexOf('pasaka') !== -1) {
            return { kind: 'season', season: 'pasaka', part: /hadi\s+kupaa/.test(label) ? 1 : /kupaa\s+hadi/.test(label) ? 2 : null };
        }
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
            case 'kwaresima':
                if (ctx.key !== 'kwaresima') return false;
                if (cls.lentSunday) return ctx.lentSunday === cls.lentSunday;
                return cls.holyWeek || !ctx.isHolyWeek;
            case 'noeli':
                return ctx.key === 'noeli' && (!cls.part || (cls.part === 1) === ctx.beforeEpiphany);
            case 'pasaka':
                return ctx.key === 'pasaka' && (!cls.part || (cls.part === 1) === ctx.beforeAscension);
            default: return false;
        }
    }

    // More specific variants win when several apply (e.g. Palm Sunday is also
    // Holy Week and Lent; Desemba 17-23 is also Advent).
    const SEASON_PRIORITY = ['matawi', 'jumakuu', 'desemba', 'kwaresima', 'majilio', 'noeli', 'pasaka'];

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

    // Today's antiphon in a group: the most specific seasonal variant that
    // applies, otherwise the ordinary ("ya Kawaida") one, otherwise the first.
    function pickActive(seasonal, ctx) {
        for (let i = 0; i < SEASON_PRIORITY.length; i++) {
            const found = seasonal.find(function (e) {
                return e.cls.season === SEASON_PRIORITY[i] && appliesToday(e.cls, ctx);
            });
            if (found) return found;
        }
        return seasonal.find(function (e) { return e.cls.season === 'kawaida'; }) || seasonal[0];
    }

    // The invitatory (Ant. ya Mwaliko, above Zaburi 95) shows today's
    // antiphon only, with no "Misimu mingine" button.
    function isInvitatory(seasonal) {
        return seasonal.some(function (e) { return /mwaliko/i.test(e.el.textContent.split(':')[0]); });
    }

    // Groups of seasonal variants, set up once by setupSeasonalAntiphons();
    // showSeason() picks today's antiphon in each, again when the day changes.
    const seasonGroups = [];

    function setupSeasonalAntiphons() {
        normalizeAntiphons();

        collectGroups().forEach(function (group) {
            // A feast's own antiphon (js/sikukuu.js) is the day's, whatever
            // words its label holds.
            const entries = group.map(function (p) {
                return { el: p, cls: p.classList.contains('ant-proper') ? { kind: 'always' } : classifyAntiphon(p.textContent) };
            });

            entries.forEach(function (e) {
                if (e.cls.kind === 'heading') e.el.classList.add('ant-heading');
            });

            const seasonal = entries.filter(function (e) { return e.cls.kind === 'season'; });
            if (seasonal.length < 2) return; // nothing to choose between

            // Wrap the group: hiding (and the toggle) apply to these antiphons only.
            const wrapper = document.createElement('div');
            wrapper.className = 'ant-group';
            group[0].parentNode.insertBefore(wrapper, group[0]);
            group.forEach(function (p) { wrapper.appendChild(p); });
            seasonGroups.push(seasonal);

            if (isInvitatory(seasonal)) return;

            const toggle = document.createElement('button');
            toggle.type = 'button';
            toggle.className = 'ant-toggle';
            toggle.setAttribute('aria-expanded', 'false');
            const label = 'Misimu mingine (' + (seasonal.length - 1) + ')';
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

    function showSeason(ctx) {
        seasonGroups.forEach(function (seasonal) {
            const active = pickActive(seasonal, ctx);
            seasonal.forEach(function (e) { e.el.classList.toggle('ant-alt', e !== active); });
        });
    }

    // ---- DOM: season badge ---------------------------------------------------

    function showSeasonBadge(ctx) {
        const h1 = document.querySelector('.container h1');
        if (!h1) return;
        let badge = document.querySelector('.masifu-season-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'masifu-season-badge';
            h1.insertAdjacentElement('afterend', badge);
        }
        const pill = document.createElement('span');
        const dot = document.createElement('i');
        dot.className = 'dot ' + ctx.color;
        pill.appendChild(dot);
        pill.appendChild(document.createTextNode('Leo: ' + ctx.name));
        badge.replaceChildren(pill);
    }

    // ---- Day change -------------------------------------------------------------

    // A page left open, or brought back from the back/forward cache, may be
    // shown on a later day: then show that day's season. Checked at each
    // midnight and whenever the page is shown again.
    function followDay(onNewDay) {
        function dayOf() {
            const now = window.IPrayDay ? IPrayDay.today() : new Date();
            return new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
        }
        let shown = dayOf();
        function check() {
            const day = dayOf();
            if (day === shown) return;
            shown = day;
            onNewDay(seasonInfo());
        }
        (function atMidnight() {
            const now = new Date();
            const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
            setTimeout(function () { check(); atMidnight(); }, next - now + 1000);
        })();
        window.addEventListener('pageshow', check);
        document.addEventListener('visibilitychange', function () {
            if (!document.hidden) check();
        });
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

    // ---- Menu -----------------------------------------------------------------

    // The top bar's menu (js/menu-sheet.js): these links, in this order, on
    // every Masifu page, whatever its own markup lists.
    function menuItems() {
        return [
            { href: '../index.html', label: 'Nyumbani' },
            { href: 'office-of-readings.html', label: 'Ofisi ya Masomo' },
            { href: 'daily-readings.html', label: buildDailyReadingsLabel() },
            { href: 'prayer-hour.html?hour=sext', label: 'Sala za Mchana' },
            { href: 'prayer-hour.html?hour=vespers', label: 'Masifu ya Jioni' }
        ];
    }

    function setupMenu() {
        if (!window.IPrayMenuSheet) return;
        const menu = window.IPrayMenuSheet.setup(menuItems());
        if (menu && window.IPrayI18n) {
            window.IPrayI18n.onChange(function () { menu.setItems(menuItems()); });
        }
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

    // The Feast or Solemnity kept on the page's day ('' when none). On one,
    // js/sikukuu.js gave the page the psalms of Jumapili I and the day's own
    // antiphons when it loaded.
    function feastOfDay() {
        const cal = window.LiturgicalCalendar;
        if (!cal || typeof cal.celebrationFor !== 'function') return '';
        const c = cal.celebrationFor(window.IPrayDay ? IPrayDay.today() : new Date());
        return c && (c.type === 'Feast' || c.type === 'Solemnity') ? c.id : '';
    }

    function init() {
        document.body.classList.add('masifu-modern');
        const ctx = seasonInfo();
        const feast = feastOfDay();
        classifyPlainSections();
        setupSeasonalAntiphons();
        showSeason(ctx);
        showSeasonBadge(ctx);
        followDay(function (newCtx) {
            // Into, out of, or between feasts: the psalms and antiphons
            // change, so load the page again for the new day.
            if (feastOfDay() !== feast) {
                window.location.reload();
                return;
            }
            showSeason(newCtx);
            showSeasonBadge(newCtx);
        });
        setupTextControls();
    }

    function initAfterSikukuu() {
        // The menu does not wait for the feast days to load
        setupMenu();
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

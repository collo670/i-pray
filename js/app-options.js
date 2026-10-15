// ipray Options menu for the app's inner pages.
// ---------------------------------------------------------------------------
// The pages that used to carry the bottom navigation bar (Home, Prayers,
// Calendar, Settings) load this instead. It adds an Options button to the
// right end of the page's app bar; the button drops a sheet down from the top
// bar, like the Options sheet on index.html, holding those same items. The
// Prayers item opens the Prayers sheet (the Liturgy of the Hours and the
// other prayers), as the bottom-nav item did. index.html builds its own
// Options and Prayers sheets, so this script does nothing there.
//
// Links are worked out from this script's own address, so they are right at
// any folder depth. Labels follow the app language (js/i18n.js).
(function () {
    'use strict';

    if (window.__iprayAppOptions) return;
    window.__iprayAppOptions = true;

    if (document.getElementById('optionsPanel')) return; // index.html handles itself

    var script = document.currentScript;
    var ROOT = script && script.src ? new URL('../', script.src).href : '/i-pray/';

    // Ensure Font Awesome is available for the prayer icons, as on index.html
    (function injectFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
        link.media = 'print';
        link.onload = function () { this.media = 'all'; };
        document.head.appendChild(link);
    })();

    var PRAYER_MENU = [
        { key: 'morningPrayer', label: 'Morning Prayer', icon: 'fa-sun', color: '#eab308', type: 'hours' },
        { key: 'officeOfReadings', label: 'Office of Readings', icon: 'fa-book-open', color: '#f97316', link: 'pages/office-of-readings.html' },
        { key: 'middayPrayer', label: 'Midday Prayer', icon: 'fa-cloud-sun', color: '#f59e0b', link: 'pages/prayer-hour.html?hour=sext' },
        { key: 'eveningPrayer', label: 'Evening Prayer', icon: 'fa-moon', color: '#6366f1', link: 'pages/prayer-hour.html?hour=vespers' },
        { key: 'nightPrayer', label: 'Night Prayer', icon: 'fa-star', color: '#3b82f6', link: 'pages/compline.html' },
        { key: 'holyRosary', label: 'Holy Rosary', icon: 'fa-hands-praying', color: '#ef4444', link: 'pages/holy-rosary.html' },
        { key: 'stationsOfCross', label: 'Way of the Cross', icon: 'fa-cross', color: '#ec4899', link: 'pages/via-cruce.html' },
        { key: 'carmenPrayer', label: 'Carmen Prayer', icon: 'fa-heart', color: '#a855f7', link: 'pages/carmen.html' }
    ];

    var ICONS = {
        options: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>',
        // Used instead when the page's app bar already has a menu button with three lines
        more: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/></svg>',
        close: '<svg width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
        home: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>',
        prayers: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m-5-11h10M9 4h6"/></svg>',
        calendar: '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>',
        settings: '<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.48.48 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.63-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32a.49.49 0 00-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1112 8.4a3.6 3.6 0 010 7.2z"/></svg>',
        chevron: '<svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>'
    };

    function t(key, fallback) {
        return (window.IPrayI18n && window.IPrayI18n.t(key)) || fallback;
    }

    // Today's Masifu ya Asubuhi page (the four-week psalter cycle, same as index.html)
    function morningPrayerLink() {
        var now = window.IPrayDay ? IPrayDay.today() : new Date();
        var days = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
        var weekSequence = [2, 3, 4, 1];
        var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        var sunday = new Date(today);
        sunday.setDate(today.getDate() - today.getDay());
        var ref = new Date(2025, 7, 3);
        ref.setHours(0, 0, 0, 0);
        var weeks = Math.floor((sunday - ref) / (7 * 24 * 60 * 60 * 1000));
        var week = weekSequence[((weeks % 4) + 4) % 4];
        return ROOT + 'pages/' + days[now.getDay()] + week + '.html';
    }

    function prayerLink(item) {
        return item.type === 'hours' ? morningPrayerLink() : ROOT + item.link;
    }

    // ----- Options button in the app bar -----------------------------------

    function addOptionsButton(header) {
        var row = header.querySelector('.header-content') || header;
        var hasMenuButton = !!row.querySelector('.hamburger, [aria-label="Toggle navigation menu"]');

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.id = 'optionsToggle';
        btn.className = 'app-bar-btn ipo-toggle';
        btn.setAttribute('aria-expanded', 'false');
        btn.setAttribute('aria-controls', 'ipoOptionsSheet');
        btn.innerHTML = hasMenuButton ? ICONS.more : ICONS.options;

        // Keep the brand on the left and every action button together on the
        // right: join an existing group of actions, or start one.
        var last = row.lastElementChild;
        var isBrand = !last || last.classList.contains('app-bar-brand') || !!last.querySelector('.app-bar-brand');
        if (isBrand) {
            row.appendChild(btn);
        } else if (last.tagName === 'DIV') {
            last.appendChild(btn);
        } else {
            var group = document.createElement('div');
            group.className = 'ipo-actions';
            row.insertBefore(group, last);
            group.appendChild(last);
            group.appendChild(btn);
        }
        return btn;
    }

    // ----- Sheets -----------------------------------------------------------

    function quicklink(tag, attrs, icon, key, fallback) {
        var el = document.createElement(tag);
        Object.keys(attrs).forEach(function (k) { el.setAttribute(k, attrs[k]); });
        el.className = 'ipo-quicklink';
        el.innerHTML = '<span class="ipo-quicklink-icon">' + icon + '</span>'
            + '<span class="ipo-quicklink-label" data-translate="' + key + '">' + fallback + '</span>';
        return el;
    }

    function buildOptionsSheet() {
        var overlay = document.createElement('div');
        overlay.id = 'ipoOptionsSheet';
        overlay.className = 'ipo-overlay ipo-from-top ipo-hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'ipoOptionsTitle');
        overlay.innerHTML =
            '<div class="ipo-panel">' +
            '<div class="ipo-header">' +
            '<h2 id="ipoOptionsTitle" class="ipo-title" data-translate="options">Options</h2>' +
            '<button type="button" class="ipo-close" aria-label="Close options">' + ICONS.close + '</button>' +
            '</div>' +
            '<section class="ipo-section" aria-labelledby="ipoGoToTitle">' +
            '<h3 id="ipoGoToTitle" class="ipo-section-title" data-translate="menuGoTo">Go to</h3>' +
            '<div class="ipo-grid"></div>' +
            '</section>' +
            '<div class="ipo-handle" aria-hidden="true"></div>' +
            '</div>';

        var grid = overlay.querySelector('.ipo-grid');
        grid.appendChild(quicklink('a', { href: ROOT + 'index.html' }, ICONS.home, 'home', 'Home'));
        grid.appendChild(quicklink('button', { type: 'button', 'data-action': 'prayers', 'aria-haspopup': 'dialog', 'aria-controls': 'ipnPrayersSheet' }, ICONS.prayers, 'prayers', 'Prayers'));
        grid.appendChild(quicklink('a', { href: ROOT + 'pages/calendar.html' }, ICONS.calendar, 'calendar', 'Calendar'));
        grid.appendChild(quicklink('a', { href: ROOT + 'pages/settings.html' }, ICONS.settings, 'settings', 'Settings'));
        return overlay;
    }

    function buildPrayersSheet() {
        var overlay = document.createElement('div');
        overlay.id = 'ipnPrayersSheet';
        overlay.className = 'ipo-overlay ipo-hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'ipnPrayersTitle');

        var items = PRAYER_MENU.map(function (item) {
            return '<a class="ipn-item" href="' + prayerLink(item) + '">' +
                '<span class="ipn-item-icon"><i class="fas ' + item.icon + '" style="color:' + item.color + '" aria-hidden="true"></i></span>' +
                '<span class="ipn-item-label" data-translate="' + item.key + '">' + item.label + '</span>' +
                '<span class="ipn-chevron">' + ICONS.chevron + '</span>' +
                '</a>';
        }).join('');

        overlay.innerHTML =
            '<div class="ipo-panel">' +
            '<div class="ipo-handle" aria-hidden="true"></div>' +
            '<div class="ipo-header">' +
            '<h2 id="ipnPrayersTitle" class="ipo-title" data-translate="prayers">Prayers</h2>' +
            '<button type="button" class="ipo-close" aria-label="Close prayers menu">' + ICONS.close + '</button>' +
            '</div>' +
            '<nav class="ipn-list" aria-label="All prayers">' + items + '</nav>' +
            '</div>';
        return overlay;
    }

    function sheetControls(sheet, trigger) {
        function open() {
            sheet.classList.remove('ipo-hidden');
            requestAnimationFrame(function () { sheet.classList.add('ipo-open'); });
            document.body.classList.add('overflow-hidden');
            if (trigger) trigger.setAttribute('aria-expanded', 'true');
        }
        function close() {
            sheet.classList.remove('ipo-open');
            document.body.classList.remove('overflow-hidden');
            if (trigger) trigger.setAttribute('aria-expanded', 'false');
            setTimeout(function () { sheet.classList.add('ipo-hidden'); }, 250);
        }
        sheet.querySelector('.ipo-close').addEventListener('click', close);
        sheet.addEventListener('click', function (e) {
            if (e.target === sheet) close();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !sheet.classList.contains('ipo-hidden')) close();
        });
        return { open: open, close: close };
    }

    function translate(root) {
        if (window.IPrayI18n) window.IPrayI18n.apply(root);
    }

    function init() {
        var header = document.querySelector('#appBar, header.app-bar');
        if (!header) return;

        injectStyles();
        var toggle = addOptionsButton(header);
        var optionsSheet = buildOptionsSheet();
        var prayersSheet = buildPrayersSheet();
        document.body.appendChild(optionsSheet);
        document.body.appendChild(prayersSheet);

        var options = sheetControls(optionsSheet, toggle);
        var prayers = sheetControls(prayersSheet, null);

        function paintToggle() {
            var label = t('options', 'Options');
            toggle.setAttribute('aria-label', label);
            toggle.title = label;
        }
        paintToggle();

        toggle.addEventListener('click', options.open);
        optionsSheet.querySelector('[data-action="prayers"]').addEventListener('click', function () {
            options.close();
            prayers.open();
        });

        translate(optionsSheet);
        translate(prayersSheet);
        if (window.IPrayI18n) {
            window.IPrayI18n.onChange(function () {
                translate(optionsSheet);
                translate(prayersSheet);
                paintToggle();
            });
        }
    }

    function injectStyles() {
        if (document.getElementById('ipoStyles')) return;
        var style = document.createElement('style');
        style.id = 'ipoStyles';
        style.textContent =
            '.ipo-actions{display:flex;align-items:center;gap:.25rem;}' +
            '.ipo-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1300;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s ease;}' +
            '.ipo-overlay.ipo-open{opacity:1;}' +
            '.ipo-overlay.ipo-hidden{display:none;}' +
            '.ipo-panel{width:100%;max-width:32rem;max-height:80vh;max-height:80dvh;overflow-y:auto;background:#fff;color:#1f2937;border-radius:1.5rem 1.5rem 0 0;padding-bottom:max(env(safe-area-inset-bottom),1rem);transform:translateY(100%);transition:transform .28s cubic-bezier(.32,.72,.24,1);box-shadow:0 -12px 40px rgba(0,0,0,.25);font-family:inherit;}' +
            '.ipo-overlay.ipo-open .ipo-panel{transform:translateY(0);}' +
            /* Options drops down from the app bar; the part behind the status bar stays maroon */
            '.ipo-overlay.ipo-from-top{align-items:flex-start;}' +
            '.ipo-from-top .ipo-panel{border-radius:0 0 1.5rem 1.5rem;padding-top:calc(env(safe-area-inset-top,0px) + .75rem);padding-bottom:.25rem;transform:translateY(-100%);box-shadow:0 12px 40px rgba(0,0,0,.25);' +
            'background:linear-gradient(to bottom,#7c2133 env(safe-area-inset-top,0px),#fff env(safe-area-inset-top,0px));}' +
            '.ipo-handle{width:2.5rem;height:.3rem;border-radius:9999px;background:#c7d2d0;margin:.6rem auto .9rem;}' +
            '.ipo-from-top .ipo-handle{margin:.5rem auto .6rem;}' +
            '.ipo-header{display:flex;align-items:center;justify-content:space-between;padding:0 1.25rem .5rem;}' +
            '.ipo-overlay .ipo-title{font-family:inherit;letter-spacing:normal;font-size:1.25rem;font-weight:700;color:inherit;margin:0;}' +
            '.ipo-close{padding:.5rem;border-radius:9999px;background:#e5e7eb;border:none;color:#374151;display:flex;cursor:pointer;}' +
            '.ipo-section{padding:.75rem 1.25rem 1rem;border-top:1px solid #e5e7eb;}' +
            '.ipo-overlay .ipo-section-title{font-family:inherit;text-align:left;margin:0 0 .75rem;font-size:.72rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#6b7280;}' +
            '.ipo-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem .5rem;}' +
            '.ipo-quicklink{display:flex;flex-direction:column;align-items:center;gap:.35rem;padding:0;border:0;background:none;color:inherit;font:inherit;text-align:center;text-decoration:none;cursor:pointer;-webkit-tap-highlight-color:transparent;}' +
            '.ipo-quicklink-icon{display:flex;align-items:center;justify-content:center;width:3rem;height:3rem;border-radius:9999px;background:#f3e8eb;color:#7c2133;transition:transform .15s ease;}' +
            '.ipo-quicklink:active .ipo-quicklink-icon{transform:scale(.94);}' +
            '.ipo-overlay .ipo-quicklink-label{font-size:.75rem;font-weight:600;line-height:1.15;}' +
            '.ipn-list{display:flex;flex-direction:column;padding:.25rem 0;}' +
            '.ipn-item{display:flex;align-items:center;gap:.875rem;padding:.8rem 1.25rem;min-height:48px;color:inherit;font-weight:500;font-size:1.05rem;border-bottom:1px solid #e5e7eb;text-decoration:none;}' +
            '.ipn-item:last-child{border-bottom:none;}' +
            '.ipn-item:hover,.ipn-item:active{background-color:#f3f4f6;}' +
            '.ipn-item-icon{display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:9999px;background:#f3f4f6;flex-shrink:0;}' +
            '.ipn-item-label{flex:1;}' +
            '.ipn-chevron{display:flex;color:#6b7280;flex-shrink:0;}' +
            '@media (min-width:768px){.ipo-overlay{align-items:center;padding:1rem;}.ipo-panel{border-radius:1.5rem;}' +
            '.ipo-overlay.ipo-from-top{align-items:flex-start;padding:0 1rem 1rem;}.ipo-from-top .ipo-panel{border-radius:0 0 1.5rem 1.5rem;}}' +
            'html.dark .ipo-panel{background:#1f2937;color:#f3f4f6;}' +
            'html.dark .ipo-from-top .ipo-panel{background:linear-gradient(to bottom,#7c2133 env(safe-area-inset-top,0px),#1f2937 env(safe-area-inset-top,0px));}' +
            'html.dark .ipo-close{background:#374151;color:#e5e7eb;}' +
            'html.dark .ipo-section,html.dark .ipn-item{border-color:#374151;}' +
            'html.dark .ipo-overlay .ipo-section-title,html.dark .ipn-chevron{color:#9ca3af;}' +
            'html.dark .ipo-quicklink-icon{background:#374151;color:#f0c96a;}' +
            'html.dark .ipn-item:hover,html.dark .ipn-item:active{background-color:#374151;}' +
            'html.dark .ipn-item-icon{background:#374151;}';
        document.head.appendChild(style);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

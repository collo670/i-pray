// Top bar menu for the Masifu ya Asubuhi and Amefufuka pages.
// ---------------------------------------------------------------------------
// Their top bar has a menu button (.hamburger) and the page's menu links in
// <nav class="app-bar-menu">. IPrayMenuSheet.setup() replaces that dropdown:
// the button drops the links down from the top bar as a sheet, like the
// Options button on the other prayer pages (js/app-options.js), styled the
// same way in css/masifu.css. js/masifu.js and js/amefufuka.js call it.
//
//   IPrayMenuSheet.setup(items)  build the sheet; items is a list of
//                                { href, label }, by default the page's own
//                                links. Returns { setItems(items) }, or null
//                                on a page without the menu button.
(function () {
    'use strict';

    var ICONS = {
        home: '<path fill="currentColor" stroke="none" d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>',
        office: '<path d="M12 6.25C10.5 5 8.25 4.5 4 4.5v13c4.25 0 6.5.5 8 1.75 1.5-1.25 3.75-1.75 8-1.75v-13c-4.25 0-6.5.5-8 1.75zm0 0v13"/>',
        readings: '<path d="M6 4h10a2 2 0 012 2v14H8a2 2 0 01-2-2V4zm0 14a2 2 0 012-2h10M12 7v6m-2.5-3.5h5"/>',
        midday: '<path d="M12 4V2m0 20v-2m8-8h2M2 12h2m13.66-5.66l1.41-1.41M4.93 19.07l1.41-1.41m0-11.32L4.93 4.93m14.14 14.14l-1.41-1.41M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>',
        evening: '<path d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>',
        songs: '<path d="M9 18V5l12-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm12-2a3 3 0 11-6 0 3 3 0 016 0z"/>',
        page: '<path d="M9 12h6m-6 4h6M7 3h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z"/>',
        close: '<path d="M6 18L18 6M6 6l12 12"/>',
        chevron: '<path d="M9 5l7 7-7 7"/>'
    };

    // A link's icon, by where it goes
    var LINK_ICONS = [
        [/index\.html$/, 'home'],
        [/office-of-readings\.html/, 'office'],
        [/daily-readings\.html/, 'readings'],
        [/hour=sext/, 'midday'],
        [/hour=vespers/, 'evening'],
        [/amefufuka\.html$/, 'songs']
    ];

    function icon(name, size) {
        return '<svg width="' + size + '" height="' + size + '" fill="none" stroke="currentColor" stroke-width="2"'
            + ' stroke-linecap="round" stroke-linejoin="round" viewBox="0 0 24 24" aria-hidden="true">'
            + ICONS[name] + '</svg>';
    }

    function iconFor(href) {
        for (var i = 0; i < LINK_ICONS.length; i++) {
            if (LINK_ICONS[i][0].test(href)) return LINK_ICONS[i][1];
        }
        return 'page';
    }

    function samePage(href) {
        try {
            var link = new URL(href, window.location.href);
            return link.pathname === window.location.pathname && link.search === window.location.search;
        } catch (e) {
            return false;
        }
    }

    function esc(s) {
        return String(s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    function linksHtml(items) {
        return items.map(function (item) {
            return '<a class="masifu-sheet-link" href="' + esc(item.href) + '"' + (samePage(item.href) ? ' aria-current="page"' : '') + '>'
                + '<span class="masifu-sheet-icon">' + icon(iconFor(item.href), 20) + '</span>'
                + '<span class="masifu-sheet-label">' + esc(item.label) + '</span>'
                + '<span class="masifu-sheet-chevron">' + icon('chevron', 16) + '</span>'
                + '</a>';
        }).join('');
    }

    function buildSheet(navLabel) {
        var sheet = document.createElement('div');
        sheet.id = 'masifuMenuSheet';
        sheet.className = 'masifu-sheet';
        sheet.hidden = true;
        sheet.setAttribute('role', 'dialog');
        sheet.setAttribute('aria-modal', 'true');
        sheet.setAttribute('aria-labelledby', 'masifuMenuTitle');
        sheet.innerHTML = '<div class="masifu-sheet-panel">'
            + '<div class="masifu-sheet-header">'
            + '<h2 id="masifuMenuTitle" class="masifu-sheet-title" data-translate="options">Chaguo</h2>'
            + '<button type="button" class="masifu-sheet-close">' + icon('close', 18) + '</button>'
            + '</div>'
            + '<section class="masifu-sheet-section" aria-labelledby="masifuMenuGoTo">'
            + '<h3 id="masifuMenuGoTo" class="masifu-sheet-section-title" data-translate="menuGoTo">Nenda</h3>'
            + '<nav class="masifu-sheet-list" aria-label="' + esc(navLabel) + '"></nav>'
            + '</section>'
            + '<div class="masifu-sheet-handle" aria-hidden="true"></div>'
            + '</div>';
        return sheet;
    }

    function setup(items) {
        var button = document.querySelector('#appBar .hamburger');
        if (!button || document.getElementById('masifuMenuSheet')) return null;

        var oldMenu = document.querySelector('#appBar .app-bar-menu');
        if (!items) {
            items = Array.prototype.map.call(oldMenu ? oldMenu.querySelectorAll('a') : [], function (a) {
                return { href: a.getAttribute('href'), label: a.textContent.trim() };
            });
        }
        var sheet = buildSheet((oldMenu && oldMenu.getAttribute('aria-label')) || 'Menu');
        if (oldMenu) oldMenu.remove();
        document.body.appendChild(sheet);
        var list = sheet.querySelector('.masifu-sheet-list');
        var closeButton = sheet.querySelector('.masifu-sheet-close');

        // isOpen, not the classes, says whether the sheet is open: it can be
        // closed again before the frame that slides it in.
        var isOpen = false;
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

        function setItems(next) {
            list.innerHTML = linksHtml(next);
            list.querySelectorAll('a').forEach(function (link) {
                link.addEventListener('click', close);
            });
        }
        setItems(items);

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
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') close();
        });

        function paint() {
            var sw = !window.IPrayI18n || window.IPrayI18n.prayerLang() === 'sw';
            closeButton.setAttribute('aria-label', sw ? 'Funga' : 'Close');
            button.setAttribute('aria-label', sw ? 'Fungua menyu' : 'Open menu');
            if (window.IPrayI18n) window.IPrayI18n.apply(sheet);
        }
        paint();
        if (window.IPrayI18n) window.IPrayI18n.onChange(paint);

        return { setItems: setItems };
    }

    window.IPrayMenuSheet = { setup: setup };
})();

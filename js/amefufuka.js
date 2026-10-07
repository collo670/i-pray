// ---------------------------------------------------------------------------
// Amefufuka songbook — shared behaviour for the index and the song pages.
//   - top bar hamburger menu (same markup as the Masifu ya Asubuhi pages)
//   - index: live search over the song titles
//   - song page: show/hide chords, "Mlalo" (keep the PDF's side-by-side
//     columns on narrow screens) and the app-wide text size control
// Light/dark mode comes from js/theme.js, text size from js/text-size.js.
// ---------------------------------------------------------------------------
(function () {
    'use strict';

    function store(key, value) {
        try {
            if (value === undefined) return localStorage.getItem(key);
            localStorage.setItem(key, value);
        } catch (e) {}
        return null;
    }

    window.toggleMenu = function (forceClose) {
        var navLinks = document.querySelector('.nav-links');
        var hamburger = document.querySelector('.hamburger');
        if (!navLinks || !hamburger) return;
        var open = typeof forceClose === 'boolean' ? !forceClose : !navLinks.classList.contains('active');
        navLinks.classList.toggle('active', open);
        hamburger.classList.toggle('active', open);
        hamburger.setAttribute('aria-expanded', String(open));
    };

    function setupMenu() {
        document.querySelectorAll('.nav-links a').forEach(function (link) {
            link.addEventListener('click', function () {
                if (window.innerWidth <= 768) window.toggleMenu(true);
            });
        });
    }

    // ---- Index: filter titles ----------------------------------------------

    function normalize(s) {
        return (s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9 ]+/g, ' ');
    }

    function setupSearch() {
        var input = document.getElementById('amefSearch');
        if (!input) return;
        var items = Array.prototype.slice.call(document.querySelectorAll('.amef-list li'));
        var sections = Array.prototype.slice.call(document.querySelectorAll('.amef-section'));
        var count = document.getElementById('amefCount');
        var empty = document.getElementById('amefEmpty');
        items.forEach(function (li) { li.dataset.q = normalize(li.textContent); });

        function run() {
            var q = normalize(input.value).trim();
            var words = q ? q.split(/\s+/) : [];
            var shown = 0;
            items.forEach(function (li) {
                var hit = words.every(function (w) { return li.dataset.q.indexOf(w) !== -1; }) ||
                    (/^\d+$/.test(q) && li.dataset.page === q);
                li.hidden = !hit;
                if (hit) shown++;
            });
            sections.forEach(function (sec) {
                sec.hidden = !sec.querySelector('li:not([hidden])');
            });
            if (count) count.textContent = q ? shown + ' kati ya ' + items.length : items.length + ' nyimbo';
            if (empty) empty.hidden = shown !== 0;
        }

        input.addEventListener('input', run);
        run();
    }

    // ---- Song page: toggles -------------------------------------------------

    function setupToggle(id, bodyClass, key, onWhenSaved) {
        var btn = document.getElementById(id);
        if (!btn) return;
        function apply(on) {
            document.body.classList.toggle(bodyClass, on);
            btn.setAttribute('aria-pressed', String(on === onWhenSaved));
        }
        apply(store(key) === '1');
        btn.addEventListener('click', function () {
            var on = !document.body.classList.contains(bodyClass);
            store(key, on ? '1' : '0');
            apply(on);
        });
    }

    function setupTextControls() {
        if (!window.IPrayTextSize || !document.querySelector('.song-sheet')) return;
        var ctl = window.IPrayTextSize.createControl({
            className: 'masifu-textctl',
            buttonClass: { dec: 'tc-dec', reset: 'tc-reset', inc: 'tc-inc' }
        });
        document.body.appendChild(ctl);
    }

    function init() {
        setupMenu();
        setupSearch();
        // "Chords" is pressed while chords are shown (body has no amef-no-chords)
        setupToggle('chordToggle', 'amef-no-chords', 'amefufukaHideChords', false);
        setupToggle('layoutToggle', 'amef-horizontal', 'amefufukaHorizontal', true);
        setupTextControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

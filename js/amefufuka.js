// ---------------------------------------------------------------------------
// Amefufuka songbook — shared behaviour for the index and the song pages.
//   - top bar menu: its links drop down as a sheet (js/menu-sheet.js)
//   - index: live search over the song titles
//   - song page: the app-wide text size control
// Light/dark mode comes from js/theme.js, text size from js/text-size.js.
// ---------------------------------------------------------------------------
(function () {
    'use strict';

    function setupMenu() {
        if (window.IPrayMenuSheet) window.IPrayMenuSheet.setup();
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

    // ---- Song page ---------------------------------------------------------

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
        setupTextControls();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

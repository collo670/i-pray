// Size of the home page's main cards: the liturgical date card and the four
// tiles (Sala za Kanisa, Masomo ya Siku, Bibilia Takatifu, Amefufuka).
//
// Load it synchronously in <head> of index.html, next to js/text-size.js, so
// the saved size is set as data-card-size="small|medium|large" on <html>
// before first paint; css/index.css ("Home card sizes") reads it. Medium is
// the default; Large is the size the cards had before Medium was added.
//
// The choice is made in the Options sheet, with buttons marked
//   data-card-size-option="small|medium|large"   (aria-pressed is kept here)
// Clicks are handled here, so the buttons need no script of their own. It is
// saved under one key, and other open tabs follow a change via `storage`, a
// page restored from the back/forward cache via `pageshow`.
//
//   IPrayCardSize.get()      'small' | 'medium' | 'large'
//   IPrayCardSize.set(size)  save and apply it
(function () {
    'use strict';

    if (window.IPrayCardSize) return;

    var KEY = 'homeCardSize';
    var SIZES = ['small', 'medium', 'large'];
    var DEFAULT = 'medium';
    var root = document.documentElement;
    var current = DEFAULT;

    function valid(size) {
        return SIZES.indexOf(size) !== -1;
    }

    function read() {
        try {
            var saved = localStorage.getItem(KEY);
            if (valid(saved)) return saved;
        } catch (e) {}
        return DEFAULT;
    }

    function syncButtons() {
        var buttons = document.querySelectorAll('[data-card-size-option]');
        Array.prototype.forEach.call(buttons, function (btn) {
            var on = btn.getAttribute('data-card-size-option') === current;
            btn.setAttribute('aria-pressed', on ? 'true' : 'false');
        });
    }

    function apply(size) {
        current = size;
        root.setAttribute('data-card-size', size);
        syncButtons();
    }

    function set(size) {
        if (!valid(size)) size = DEFAULT;
        try {
            localStorage.setItem(KEY, size);
        } catch (e) {}
        apply(size);
    }

    function follow() {
        var size = read();
        if (size !== current) apply(size);
    }

    apply(read());

    document.addEventListener('click', function (e) {
        var btn = e.target && e.target.closest ? e.target.closest('[data-card-size-option]') : null;
        if (btn) set(btn.getAttribute('data-card-size-option'));
    });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', syncButtons);
    } else {
        syncButtons();
    }

    window.addEventListener('storage', function (e) {
        if (e.key === KEY || e.key === null) follow();
    });
    window.addEventListener('pageshow', follow);

    window.IPrayCardSize = {
        get: function () { return current; },
        set: set,
        SIZES: SIZES.slice()
    };
})();

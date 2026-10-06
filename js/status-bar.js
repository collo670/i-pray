// ---------------------------------------------------------------------------
// Status-bar scrim — shared by every page (loaded right after
// css/status-bar-safe-area.css).
//
// While a page sits at the top, its maroon top nav bar paints the mobile
// status-bar area itself. Once the page is scrolled the bar either scrolls
// away or stays pinned; either way a fixed strip exactly as tall as the
// status bar (env(safe-area-inset-top)) fades in with a faded version of
// the nav maroon, so page content never shows raw under the clock and
// battery icons. css/status-bar-safe-area.css styles the strip; this script
// only adds it and toggles html.sb-scrolled.
//
// Where the browser paints the status bar itself from <meta name=
// "theme-color"> (Android Chrome, Safari tabs) the safe-area inset is 0 and
// the strip collapses, so the theme-color is swapped between the solid and
// the faded maroon instead.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    if (window.__iprayStatusBarInit) return;
    window.__iprayStatusBarInit = true;

    // Keep in sync with --nav-maroon / --nav-maroon-faded in
    // css/status-bar-safe-area.css (theme-color ignores alpha, so FADED is
    // the opaque faded maroon).
    var NAV = '#7c2133';
    var FADED = '#964e5c';
    var THRESHOLD = 4;
    // Only touch devices have a status bar the browser paints from
    // theme-color; on desktop the swap would just retint the title bar.
    var SWAP_THEME = !window.matchMedia || window.matchMedia('(pointer: coarse)').matches;

    var root = document.documentElement;
    var scrim = null;
    var themeMetas = [];
    var scrolled = null;

    function ensureScrim() {
        if (scrim || !document.body) return;
        scrim = document.createElement('div');
        scrim.className = 'sb-scrim';
        scrim.setAttribute('aria-hidden', 'true');
        // A child of <html>, not <body>: a transform or filter on body (page
        // transitions) would otherwise turn position:fixed into body-relative.
        root.appendChild(scrim);
        themeMetas = Array.prototype.slice.call(document.querySelectorAll('meta[name="theme-color"]'));
    }

    // A scroll container that stands in for the page (full-height inner
    // scroller) counts as the page scrolling; small scrollers (menus, tab
    // strips, carousels) don't.
    function isPageScroller(el) {
        if (!el || el.nodeType !== 1 || el === root || el === document.body) return false;
        var r = el.getBoundingClientRect();
        return r.top <= 1 && r.bottom > 1 && r.height >= window.innerHeight * 0.6;
    }

    function apply(next) {
        if (next === scrolled) return;
        scrolled = next;
        root.classList.toggle('sb-scrolled', next);
        if (!SWAP_THEME) return;
        // Only swap our own maroon: pages that choose another theme-color
        // (login, signup, the Settings theme picker) keep theirs.
        for (var i = 0; i < themeMetas.length; i++) {
            var current = (themeMetas[i].getAttribute('content') || '').toLowerCase();
            if (current === NAV || current === FADED) {
                themeMetas[i].setAttribute('content', next ? FADED : NAV);
            }
        }
    }

    var pending = false;
    var lastInner = null;
    // Re-check when the tracked inner scroller resizes or is hidden (e.g. a
    // scrolled sheet being closed fires no scroll event).
    var ro = window.ResizeObserver ? new ResizeObserver(function () { schedule(); }) : null;

    function track(el) {
        if (el === lastInner) return;
        if (ro && lastInner) ro.unobserve(lastInner);
        lastInner = el;
        if (ro && el) ro.observe(el);
    }

    function update() {
        pending = false;
        ensureScrim();
        var y = window.pageYOffset || root.scrollTop || (document.body && document.body.scrollTop) || 0;
        if (lastInner) {
            if (lastInner.isConnected && isPageScroller(lastInner)) {
                y = Math.max(y, lastInner.scrollTop);
            } else {
                track(null);
            }
        }
        apply(y > THRESHOLD);
    }

    function schedule(e) {
        var t = e && e.target;
        if (t && t !== document && isPageScroller(t)) track(t);
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(update);
    }

    // Capture phase so scrolls of inner containers (which don't bubble) are
    // seen too.
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.addEventListener('pageshow', schedule);

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', update);
    } else {
        update();
    }
})();

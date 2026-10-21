// ipray Home button: a round button centred at the bottom of every page that
// takes the reader back to the home page (it replaced the bottom navigation
// bar, whose other items now live in the app bar's Options menu, see
// js/app-options.js and the Options sheet on index.html).
// ---------------------------------------------------------------------------
// Loaded (deferred) on every page. The link to index.html is worked out from
// this script's own address, so it is right at any folder depth. The home
// page has no Home button.
//
// While the page scrolls down, the Home button and the other round controls
// along the bottom (the favourite star, js/library.js; text size,
// js/text-size-control.js and js/masifu.js) slide out of the way so they
// don't cover the text being read; they come back as soon as it scrolls up,
// and at the top and the end of the page.
(function () {
    'use strict';

    if (window.__iprayHomeButton) return;
    window.__iprayHomeButton = true;

    var script = document.currentScript;
    var homeUrl = script && script.src ? new URL('../index.html', script.src).href : '/i-pray/index.html';

    // The floating controls along the bottom of a page, and the class on
    // <html> that moves them out of the way.
    var CONTROLS = ['.ipray-home-btn', '.ipray-fav', '.prayer-textctl', '.masifu-textctl'];
    var AWAY = 'ipray-controls-away';
    // Scrolled this far (px) in one direction before they move, and this
    // close to the top or the end of the page they always show.
    var STEP = 8;
    var EDGE = 80;

    var HOME_ICON = '<svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>';

    function label() {
        return (window.IPrayI18n && window.IPrayI18n.t('home')) || 'Nyumbani';
    }

    function isHomePage() {
        var here = location.pathname.replace(/index\.html$/, '');
        var home = new URL(homeUrl).pathname.replace(/index\.html$/, '');
        return here === home;
    }

    function injectStyles() {
        if (document.getElementById('iprayHomeButtonStyles')) return;
        var style = document.createElement('style');
        style.id = 'iprayHomeButtonStyles';
        // Below the sheets and pop-ups (z-index 50 and up) so an open menu
        // covers it, above the page content.
        style.textContent = ''
            + '.ipray-home-btn{position:fixed;left:50%;bottom:calc(0.9rem + env(safe-area-inset-bottom,0px));z-index:45;'
            + 'transform:translateX(-50%);width:56px;height:56px;border-radius:9999px;border:0;padding:0;'
            + 'display:flex;align-items:center;justify-content:center;text-decoration:none;cursor:pointer;'
            + 'background:#7c2133;color:#fff;box-shadow:0 6px 18px rgba(124,33,51,0.35),0 2px 6px rgba(0,0,0,0.2);'
            + '-webkit-tap-highlight-color:transparent;touch-action:manipulation;transition:transform .15s ease,box-shadow .15s ease;}'
            + '.ipray-home-btn:hover{box-shadow:0 8px 22px rgba(124,33,51,0.45),0 2px 6px rgba(0,0,0,0.2);}'
            + '.ipray-home-btn:active{transform:translateX(-50%) scale(0.94);}'
            + '.ipray-home-btn:focus-visible{outline:3px solid #f0c96a;outline-offset:3px;}'
            + 'html.dark .ipray-home-btn,body.dark-mode .ipray-home-btn,body.dark .ipray-home-btn,[data-theme="dark"] .ipray-home-btn'
            + '{background:#f0c96a;color:#1f2937;box-shadow:0 6px 18px rgba(0,0,0,0.45);}'
            + '.ipray-home-spacer{height:calc(5.5rem + env(safe-area-inset-bottom,0px));}'
            + '@media print{.ipray-home-btn,.ipray-home-spacer{display:none;}}'
            + CONTROLS.join(',') + '{transition:transform .15s ease,box-shadow .15s ease,opacity .2s ease,translate .25s ease;}'
            + CONTROLS.map(function (c) { return 'html.' + AWAY + ' ' + c; }).join(',')
            + '{opacity:0;translate:0 1.5rem;pointer-events:none;visibility:hidden;'
            + 'transition:transform .15s ease,box-shadow .15s ease,opacity .2s ease,translate .25s ease,visibility 0s linear .25s;}'
            + '@media (prefers-reduced-motion:reduce){'
            + CONTROLS.map(function (c) { return 'html.' + AWAY + ' ' + c; }).join(',') + '{translate:none;}}';
        document.head.appendChild(style);
    }

    function hideWhileScrollingDown() {
        var root = document.documentElement;
        var lastY = window.pageYOffset;
        window.addEventListener('scroll', function () {
            var y = window.pageYOffset;
            var dy = y - lastY;
            if (Math.abs(dy) < STEP) return;
            lastY = y;
            var end = Math.max(root.scrollHeight, document.body.scrollHeight) - window.innerHeight;
            // Not while one of them has the keyboard focus.
            var focused = document.activeElement && document.activeElement.closest && document.activeElement.closest(CONTROLS.join(','));
            root.classList.toggle(AWAY, dy > 0 && y > EDGE && y < end - EDGE && !focused);
        }, { passive: true });
    }

    function init() {
        // Not inside another page (the gospel card embeds daily-readings.html).
        if (window.self !== window.top) return;
        if (!document.body || document.querySelector('.ipray-home-btn')) return;
        if (isHomePage()) return;
        injectStyles();
        hideWhileScrollingDown();

        var btn = document.createElement('a');
        btn.className = 'ipray-home-btn';
        btn.href = homeUrl;
        function paint() {
            btn.setAttribute('aria-label', label());
            btn.title = label();
        }
        btn.innerHTML = HOME_ICON;
        paint();

        // Room at the end of the page so the button never hides the last line.
        var spacer = document.createElement('div');
        spacer.className = 'ipray-home-spacer';
        spacer.setAttribute('aria-hidden', 'true');

        document.body.appendChild(spacer);
        document.body.appendChild(btn);
        if (window.IPrayI18n) window.IPrayI18n.onChange(paint);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();

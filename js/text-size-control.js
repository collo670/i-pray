// ---------------------------------------------------------------------------
// Floating text-size control (−  100%  +) for prayer pages that don't load
// js/masifu.js: midday (saa-sita), vespers (jioni) and office of readings
// (ofisi ya masomo) — including the English versions of all three, pulled
// live from Universalis in pages/prayer-hour.html — plus the Mwaka, daily
// readings and Bible reader pages. It only draws the button: the size itself
// is the app-wide setting kept by js/text-size.js (--prayer-text-scale on
// <html>), so a change made here also applies on Settings, the home page and
// every other page, and a change made there shows up here.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    function injectStyle() {
        const style = document.createElement('style');
        style.textContent = [
            '.prayer-textctl{position:fixed;bottom:max(1.1rem,env(safe-area-inset-bottom,0px) + 0.75rem);right:1rem;z-index:1200;display:flex;align-items:stretch;border-radius:999px;overflow:hidden;background:rgba(34,34,34,0.92);box-shadow:0 4px 14px rgba(0,0,0,0.3);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}',
            '.prayer-textctl button{appearance:none;background:none;border:none;cursor:pointer;color:#fff;font-family:inherit;font-weight:700;min-width:44px;min-height:44px;padding:0 0.35rem;display:flex;align-items:center;justify-content:center;transition:background 0.15s ease,opacity 0.15s ease;}',
            '.prayer-textctl button:hover,.prayer-textctl button:focus-visible{background:rgba(255,255,255,0.15);}',
            '.prayer-textctl button[disabled]{opacity:0.35;cursor:default;}',
            '.prayer-textctl .ptc-dec,.prayer-textctl .ptc-inc{font-size:1.35rem;line-height:1;}',
            '.prayer-textctl .ptc-reset{font-size:0.8rem;letter-spacing:0.02em;border-left:1px solid rgba(255,255,255,0.18);border-right:1px solid rgba(255,255,255,0.18);min-width:52px;}'
        ].join('\n');
        document.head.appendChild(style);
    }

    function init() {
        if (!window.IPrayTextSize) return;
        injectStyle();

        const ctl = window.IPrayTextSize.createControl({
            className: 'prayer-textctl',
            buttonClass: { dec: 'ptc-dec', reset: 'ptc-reset', inc: 'ptc-inc' }
        });
        document.body.appendChild(ctl);

        // Pages with a fixed bottom nav (mwaka*.html, daily-readings.html)
        // would otherwise have this floating control overlap it.
        const bottomNav = document.querySelector('.bottom-nav, nav[role="navigation"][aria-label="Main Navigation"]');
        if (bottomNav) {
            const navHeight = bottomNav.getBoundingClientRect().height;
            ctl.style.bottom = 'calc(' + navHeight + 'px + env(safe-area-inset-bottom, 0px) + 0.75rem)';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

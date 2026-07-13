// ---------------------------------------------------------------------------
// Shared text-size control (A− / A / A+) for prayer pages that don't load
// js/masifu.js: midday (saa-sita), vespers (jioni) and office of readings
// (ofisi ya masomo). Scales the root <html> font-size so every rem/em-based
// rule on the page — psalm text included — grows and shrinks together, and
// persists the choice across all prayer pages via localStorage.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    const SCALE_MIN = 0.8;
    const SCALE_MAX = 1.7;
    const SCALE_STEP = 0.1;
    const SCALE_KEY = 'masifuTextScale';

    function loadScale() {
        try {
            const saved = parseFloat(localStorage.getItem(SCALE_KEY));
            if (!isNaN(saved)) return Math.min(SCALE_MAX, Math.max(SCALE_MIN, saved));
            // Migrate the old 3-step cycle button setting used on these pages
            const old = { small: 0.9, normal: 1, large: 1.25, xlarge: 1.5 }[localStorage.getItem('textSize')];
            if (old) return old;
        } catch (e) { /* storage unavailable */ }
        return 1;
    }

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
        injectStyle();

        const ctl = document.createElement('div');
        ctl.className = 'prayer-textctl';
        ctl.setAttribute('role', 'group');
        ctl.setAttribute('aria-label', 'Ukubwa wa maandishi');

        const dec = document.createElement('button');
        dec.type = 'button';
        dec.className = 'ptc-dec';
        dec.textContent = '−';
        dec.setAttribute('aria-label', 'Punguza ukubwa wa maandishi');

        const reset = document.createElement('button');
        reset.type = 'button';
        reset.className = 'ptc-reset';
        reset.setAttribute('aria-label', 'Rejesha ukubwa wa kawaida');

        const inc = document.createElement('button');
        inc.type = 'button';
        inc.className = 'ptc-inc';
        inc.textContent = '+';
        inc.setAttribute('aria-label', 'Ongeza ukubwa wa maandishi');

        let scale = loadScale();

        function apply() {
            scale = Math.round(scale * 10) / 10;
            document.documentElement.style.fontSize = (scale * 100) + '%';
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
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

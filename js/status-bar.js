// ---------------------------------------------------------------------------
// Status bar blend — shared by every page (loaded right after
// css/status-bar-safe-area.css).
//
// While a page sits at the top, its maroon top nav bar paints the mobile
// status-bar area itself. As the page scrolls and the bar slides up under
// the status bar, the bar fades out and the status bar fades from the
// bar's maroon into the colour of the page underneath it, so the bar
// dissolves into the page instead of leaving a maroon (or raw content)
// strip behind the clock and battery icons:
//
// - Where the page draws under the status bar (iOS installed app and
//   other viewport-fit=cover cases, env(safe-area-inset-top) > 0) a fixed
//   strip exactly as tall as the status bar, .sb-scrim, fades in with the
//   page colour while the bar fades out beneath it, with a short feather
//   below it so content melts into it rather than meeting a hard edge.
// - Where the browser paints the status bar itself from <meta name=
//   "theme-color"> (Android Chrome, Samsung Internet, Safari tabs) the
//   inset is 0 and the strip collapses, so each theme-color is moved
//   between its own value and the page colour instead.
//
// Bars that stay pinned (position: fixed, or a sticky bar that engages)
// never leave the top, so they stay opaque and the status bar keeps their
// colour. css/status-bar-safe-area.css styles the strip.
// ---------------------------------------------------------------------------

(function () {
    'use strict';

    if (window.__iprayStatusBarInit) return;
    window.__iprayStatusBarInit = true;

    // Keep in sync with --nav-maroon in css/status-bar-safe-area.css.
    // Used to darken too-light page colours behind white iOS icons.
    var NAV = [124, 33, 51];
    var BAR_SELECTOR = '.app-bar, header[role="banner"], .navbar, .page-nav, nav[class*="bg-[#202847]"]';
    // Scroll distance over which a page without a top bar blends in.
    var NO_BAR_FADE = 64;
    // How often (ms) the colour under the status bar is re-sampled while
    // scrolling; update() eases between samples.
    var SAMPLE_EVERY = 120;
    // Scrim alpha once fully blended: just enough see-through for the
    // backdrop blur to show content passing underneath.
    var SCRIM_ALPHA = 0.9;

    var root = document.documentElement;
    var scrim = null;
    var bar = null;
    // Page colour under the status bar: each side, and their average for
    // theme-color (a single colour).
    var pageColor = null;
    var pageLeft = null;
    var pageRight = null;
    var lastSample = 0;
    var sampleTimer = null;
    var lastInner = null;
    var lastKey = '';
    var themeMetas = [];

    // iOS installed app: the status bar style is fixed at launch
    // (black-translucent: always white icons), so the strip must stay dark
    // enough behind them.
    var iosStandalone = window.navigator.standalone === true;

    // ---- colour helpers ---------------------------------------------------

    var parseCtx = null;
    var parseCache = {};

    // Any CSS colour string (rgb, hex, oklch, color(), ...) -> [r, g, b, a].
    function parseColor(str) {
        if (!str) return null;
        if (parseCache.hasOwnProperty(str)) return parseCache[str];
        var out = null;
        var m = /^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.]+%?))?\s*\)$/i.exec(str);
        if (m) {
            var a = m[4] === undefined ? 1 : (m[4].slice(-1) === '%' ? parseFloat(m[4]) / 100 : parseFloat(m[4]));
            out = [+m[1], +m[2], +m[3], a];
        } else {
            try {
                if (!parseCtx) {
                    var c = document.createElement('canvas');
                    c.width = c.height = 1;
                    parseCtx = c.getContext('2d', { willReadFrequently: true });
                }
                parseCtx.clearRect(0, 0, 1, 1);
                parseCtx.fillStyle = 'rgba(0,0,0,0)';
                parseCtx.fillStyle = str;
                parseCtx.fillRect(0, 0, 1, 1);
                var d = parseCtx.getImageData(0, 0, 1, 1).data;
                out = d[3] ? [d[0] * 255 / d[3], d[1] * 255 / d[3], d[2] * 255 / d[3], d[3] / 255] : [0, 0, 0, 0];
            } catch (e) {
                out = null;
            }
        }
        parseCache[str] = out;
        return out;
    }

    var GRADIENT_STOP = /(?:rgba?|hsla?|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|#[0-9a-f]{3,8}\b/gi;

    // Split on commas that are not inside parentheses.
    function splitTop(str) {
        var parts = [];
        var depth = 0;
        var from = 0;
        for (var i = 0; i < str.length; i++) {
            var ch = str[i];
            if (ch === '(') depth++;
            else if (ch === ')') depth--;
            else if (ch === ',' && depth === 0) {
                parts.push(str.slice(from, i).trim());
                from = i + 1;
            }
        }
        parts.push(str.slice(from).trim());
        return parts;
    }

    var SIDE_ANGLE = { top: 0, right: 90, bottom: 180, left: 270 };

    // Colour of a linear-gradient(...) at (x, y) inside box, or null when
    // it can't be worked out.
    function linearAt(args, box, x, y) {
        var parts = splitTop(args);
        var angle = 180;
        var first = parts[0];
        if (/^-?[\d.]+(deg|turn|rad|grad)$/.test(first)) {
            var v = parseFloat(first);
            angle = /turn$/.test(first) ? v * 360 : /grad$/.test(first) ? v * 0.9 : /rad$/.test(first) ? v * 180 / Math.PI : v;
            parts.shift();
        } else if (/^to /.test(first)) {
            var sides = first.slice(3).split(/\s+/);
            if (sides.length === 1) {
                angle = SIDE_ANGLE[sides[0]];
            } else {
                // Corner: perpendicular to the diagonal through the other two.
                var a = Math.atan2(box.width, box.height) * 180 / Math.PI;
                var v2 = sides.indexOf('top') !== -1 ? 'top' : 'bottom';
                var h2 = sides.indexOf('left') !== -1 ? 'left' : 'right';
                angle = v2 === 'top' ? (h2 === 'right' ? a : 360 - a) : (h2 === 'right' ? 180 - a : 180 + a);
            }
            parts.shift();
        }
        if (angle === undefined || parts.length < 1) return null;
        var rad = angle * Math.PI / 180;
        var dx = Math.sin(rad);
        var dy = -Math.cos(rad);
        var len = Math.abs(box.width * dx) + Math.abs(box.height * dy);
        if (!len) return null;

        var stops = [];
        for (var i = 0; i < parts.length; i++) {
            var m = parts[i].match(GRADIENT_STOP);
            if (!m) continue;
            var c = parseColor(m[0]);
            if (!c) return null;
            var rest = parts[i].replace(m[0], '').trim().split(/\s+/);
            var pos = null;
            for (var j = 0; j < rest.length; j++) {
                if (/%$/.test(rest[j])) pos = parseFloat(rest[j]) / 100;
                else if (/px$/.test(rest[j])) pos = parseFloat(rest[j]) / len;
                if (pos !== null) {
                    stops.push({ c: c, p: pos });
                    pos = undefined;
                }
            }
            if (pos === null) stops.push({ c: c, p: null });
        }
        if (!stops.length) return null;
        // Unpositioned stops: first 0, last 1, the rest spread between.
        if (stops[0].p === null) stops[0].p = 0;
        if (stops[stops.length - 1].p === null) stops[stops.length - 1].p = 1;
        for (var k = 1; k < stops.length; k++) {
            if (stops[k].p !== null) {
                stops[k].p = Math.max(stops[k].p, stops[k - 1].p);
                continue;
            }
            var end = k;
            while (stops[end].p === null) end++;
            var from = stops[k - 1].p;
            var step = (stops[end].p - from) / (end - k + 1);
            for (var n = k; n < end; n++) stops[n].p = from + step * (n - k + 1);
        }

        var t = ((x - box.left - box.width / 2) * dx + (y - box.top - box.height / 2) * dy) / len + 0.5;
        if (t <= stops[0].p) return stops[0].c;
        for (var s = 1; s < stops.length; s++) {
            if (t <= stops[s].p) {
                var a0 = stops[s - 1];
                var a1 = stops[s];
                var f = a1.p > a0.p ? (t - a0.p) / (a1.p - a0.p) : 1;
                var rgb = mix(a0.c, a1.c, f);
                rgb.push(a0.c[3] + (a1.c[3] - a0.c[3]) * f);
                return rgb;
            }
        }
        return stops[stops.length - 1].c;
    }

    // Colour a background-image's gradients show at (x, y) inside box:
    // linear gradients are evaluated there, anything else is averaged.
    function gradientColor(image, box, x, y) {
        if (!image || image === 'none' || image.indexOf('gradient') === -1) return null;
        var lin = /^(?:-webkit-)?linear-gradient\((.*)\)$/.exec(splitTop(image)[0]);
        if (lin && box) {
            var at = linearAt(lin[1], box, x, y);
            if (at) return at;
        }
        var stops = image.match(GRADIENT_STOP);
        if (!stops) return null;
        var sum = [0, 0, 0, 0];
        var n = 0;
        for (var i = 0; i < stops.length; i++) {
            var c = parseColor(stops[i]);
            if (!c) continue;
            sum[0] += c[0] * c[3]; sum[1] += c[1] * c[3]; sum[2] += c[2] * c[3]; sum[3] += c[3];
            n++;
        }
        if (!n || !sum[3]) return null;
        return [sum[0] / sum[3], sum[1] / sum[3], sum[2] / sum[3], sum[3] / n];
    }

    function mix(a, b, t) {
        return [
            a[0] + (b[0] - a[0]) * t,
            a[1] + (b[1] - a[1]) * t,
            a[2] + (b[2] - a[2]) * t
        ];
    }

    function luminance(c) {
        var ch = c.map(function (v) {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
        });
        return 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
    }

    function hex(c) {
        return '#' + c.slice(0, 3).map(function (v) {
            var s = Math.round(Math.max(0, Math.min(255, v))).toString(16);
            return s.length === 1 ? '0' + s : s;
        }).join('');
    }

    function rgba(c, a) {
        return 'rgba(' + Math.round(c[0]) + ', ' + Math.round(c[1]) + ', ' + Math.round(c[2]) + ', ' + a + ')';
    }

    // ---- page structure ---------------------------------------------------

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

    // The page's top nav bar: the first visible bar that starts at the top
    // of the document.
    function findBar() {
        var scrollY = window.pageYOffset || 0;
        var list = document.querySelectorAll(BAR_SELECTOR);
        for (var i = 0; i < list.length; i++) {
            var el = list[i];
            if (el.parentElement && el.parentElement.closest(BAR_SELECTOR)) continue;
            var r = el.getBoundingClientRect();
            if (!r.height || !r.width) continue;
            var cs = getComputedStyle(el);
            if (cs.display === 'none' || cs.visibility === 'hidden') continue;
            var top = cs.position === 'fixed' ? r.top : r.top + scrollY;
            if (top <= 8) return el;
        }
        return null;
    }

    function refreshBar() {
        if (bar) bar.style.opacity = '';
        bar = findBar();
    }

    var PSEUDOS = ['::before', '::after'];

    function isOwn(el) {
        return el === scrim || (bar && bar.contains(el));
    }

    // Composite the backgrounds stacked at (x, y), skipping the top bar and
    // the strip itself, i.e. the colour the page shows there.
    function colorAt(x, y) {
        var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [];
        var acc = [0, 0, 0];
        var alpha = 0;
        function layer(c) {
            if (!c || !c[3]) return;
            var w = (1 - alpha) * c[3];
            acc[0] += c[0] * w; acc[1] += c[1] * w; acc[2] += c[2] * w;
            alpha += w;
        }
        var viewport = { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        for (var i = 0; i < stack.length && alpha < 0.995; i++) {
            var el = stack[i];
            if (isOwn(el)) continue;
            var cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || cs.opacity === '0') continue;
            var box = el === root ? viewport : el.getBoundingClientRect();
            layer(gradientColor(cs.backgroundImage, box, x, y));
            layer(parseColor(cs.backgroundColor));
            // Full-size ::before / ::after used as a background layer (e.g.
            // body.page-index::before, a fixed wash behind the page).
            for (var k = 0; k < PSEUDOS.length; k++) {
                var ps = getComputedStyle(el, PSEUDOS[k]);
                if (!ps.content || ps.content === 'none' || ps.display === 'none') continue;
                var fixed = ps.position === 'fixed';
                if (!fixed && ps.position !== 'absolute') continue;
                var ref = fixed ? viewport : box;
                if (parseFloat(ps.width) < ref.width * 0.9 || parseFloat(ps.height) < Math.min(ref.height, window.innerHeight) * 0.5) continue;
                layer(gradientColor(ps.backgroundImage, ref, x, y));
                layer(parseColor(ps.backgroundColor));
            }
        }
        if (alpha < 0.995) {
            // Canvas colour behind everything
            var dark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches &&
                getComputedStyle(root).colorScheme.indexOf('dark') !== -1;
            layer(dark ? [18, 18, 18, 1] : [255, 255, 255, 1]);
        }
        return acc;
    }

    function samplePage() {
        lastSample = Date.now();
        var y = (scrim ? scrim.getBoundingClientRect().height : 0) + 2;
        var w = window.innerWidth;
        // The side edges show the page background more reliably than the
        // middle, where cards pass by.
        pageLeft = colorAt(4, y);
        pageRight = colorAt(Math.max(4, w - 5), y);
        pageColor = mix(pageLeft, pageRight, 0.5);
    }

    // Keep white status-bar icons readable on the iOS installed app.
    function forIosIcons(c) {
        if (!iosStandalone || luminance(c) <= 0.3) return c;
        for (var t = 0.1; t <= 1; t += 0.1) {
            var d = mix(c, NAV, t);
            if (luminance(d) <= 0.3) return d;
        }
        return NAV;
    }

    // ---- scroll progress --------------------------------------------------

    function scrollTop() {
        var y = window.pageYOffset || root.scrollTop || (document.body && document.body.scrollTop) || 0;
        if (lastInner && lastInner.isConnected && isPageScroller(lastInner)) {
            y = Math.max(y, lastInner.scrollTop);
        }
        return y;
    }

    // 0 while the bar fully covers the status bar, 1 once it has scrolled up
    // past it (or, without a bar, once the page has scrolled a little).
    function progress() {
        if (bar && bar.isConnected) {
            var r = bar.getBoundingClientRect();
            var inset = scrim ? scrim.getBoundingClientRect().height : 0;
            var travel = r.height - inset;
            if (r.top >= 0) return 0;
            if (travel <= 0) return 1;
            return Math.max(0, Math.min(1, -r.top / travel));
        }
        return Math.max(0, Math.min(1, scrollTop() / NO_BAR_FADE));
    }

    function applyThemeColors(p) {
        for (var i = 0; i < themeMetas.length; i++) {
            var meta = themeMetas[i];
            var current = meta.getAttribute('content') || '';
            // Whatever the page last set (Settings theme picker, login's own
            // colour) is the colour at the top of the page.
            if (current !== meta.__sbWritten) meta.__sbBase = current;
            var base = parseColor(meta.__sbBase);
            if (!base) continue;
            var next = p > 0 && pageColor ? hex(mix(base, pageColor, p)) : meta.__sbBase;
            if (next !== current) meta.setAttribute('content', next);
            meta.__sbWritten = next;
        }
    }

    var shownLeft = null;
    var shownRight = null;
    var easing = false;

    function ease(from, to) {
        if (!from) return to;
        var d = Math.abs(from[0] - to[0]) + Math.abs(from[1] - to[1]) + Math.abs(from[2] - to[2]);
        if (d < 3) return to;
        easing = true;
        return mix(from, to, 0.25);
    }

    function update() {
        easing = false;
        pending = false;
        ensureScrim();
        if (!scrim) return;
        if (bar && !bar.isConnected) refreshBar();

        var p = progress();
        var moved = scrolledSince;
        scrolledSince = false;
        if (p > 0) {
            var since = Date.now() - lastSample;
            if (!pageColor || since >= SAMPLE_EVERY) {
                samplePage();
            } else if (moved && !sampleTimer) {
                // Trailing sample so the colour settles where scrolling stops.
                sampleTimer = setTimeout(function () {
                    sampleTimer = null;
                    samplePage();
                    schedule();
                }, SAMPLE_EVERY - since);
            }
        }

        // Ease towards newly sampled colours rather than jumping, as
        // differently coloured sections pass under the status bar.
        var left = shownLeft = ease(shownLeft, pageColor ? forIosIcons(pageLeft) : NAV);
        var right = shownRight = ease(shownRight, pageColor ? forIosIcons(pageRight) : NAV);
        if (easing) schedule();

        var key = p.toFixed(3) + hex(left) + hex(right);
        if (key === lastKey) return;
        lastKey = key;

        root.classList.toggle('sb-scrolled', p > 0);
        if (bar) bar.style.opacity = p > 0 ? String(1 - p) : '';
        // The strip fades in with the page colour as the bar fades out over
        // it, so the status bar always matches what is right below it.
        // Left-to-right so backgrounds that change across the screen
        // (diagonal gradients) still line up with the strip.
        root.style.setProperty('--sb-scrim-left', rgba(left, SCRIM_ALPHA * p));
        root.style.setProperty('--sb-scrim-right', rgba(right, SCRIM_ALPHA * p));
        applyThemeColors(p);
    }

    // ---- wiring -----------------------------------------------------------

    // A scroll container that stands in for the page (full-height inner
    // scroller) counts as the page scrolling; small scrollers (menus, tab
    // strips, carousels) don't.
    function isPageScroller(el) {
        if (!el || el.nodeType !== 1 || el === root || el === document.body) return false;
        var r = el.getBoundingClientRect();
        return r.top <= 1 && r.height >= window.innerHeight * 0.6;
    }

    var pending = false;
    var scrolledSince = false;
    function schedule(e) {
        var t = e && e.target;
        if (e) scrolledSince = true;
        if (t && t !== document && isPageScroller(t)) lastInner = t;
        if (pending) return;
        pending = true;
        window.requestAnimationFrame(update);
    }

    function resample() {
        pageColor = null;
        shownLeft = shownRight = null;
        lastKey = '';
        schedule();
    }

    function init() {
        ensureScrim();
        refreshBar();
        update();
        // Theme / dark-mode switches recolour both the bar and the page.
        if (window.MutationObserver) {
            var strip = function (v) { return (v || '').replace(/\bsb-scrolled\b/g, '').trim().split(/\s+/).sort().join(' '); };
            var mo = new MutationObserver(function (records) {
                // Our own sb-scrolled toggle is not a theme change.
                var changed = records.some(function (r) {
                    return r.attributeName !== 'class' || strip(r.oldValue) !== strip(r.target.getAttribute('class'));
                });
                if (!changed) return;
                resample();
            });
            var opts = { attributes: true, attributeOldValue: true, attributeFilter: ['class', 'data-theme'] };
            mo.observe(root, opts);
            if (document.body) mo.observe(document.body, opts);
        }
    }

    // Capture phase so scrolls of inner containers (which don't bubble) are
    // seen too.
    document.addEventListener('scroll', schedule, { capture: true, passive: true });
    window.addEventListener('resize', function () { refreshBar(); resample(); }, { passive: true });
    window.addEventListener('pageshow', function () { refreshBar(); resample(); });
    window.addEventListener('load', function () { refreshBar(); resample(); });

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

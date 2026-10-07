// Shared text size for every page of the app.
//
// Load it synchronously in <head>, next to js/theme.js, so the saved size is
// applied before first paint. One value - a scale factor from 0.8 to 1.7 - is
// saved under one key, and a change made on any page (Settings, the home
// Accessibility menu, a prayer page's floating  −  100%  +  button) is picked
// up everywhere:
//   - other open tabs/windows via the `storage` event,
//   - pages restored from the back/forward cache via `pageshow`,
//   - every page loaded afterwards on startup.
//
// The scale is set as --prayer-text-scale on <html>. Prayer pages multiply
// their reading text by it in their own CSS (.container, .office-content,
// .reading-text, ...); on every page the rules injected below also scale the
// text inside <main>, unless it has data-fixed-text-size (the home page).
// The top app bar, the bottom nav and the size controls themselves sit
// outside <main>, so they keep a fixed size.
//
// Controls need no script of their own - clicks are handled here:
//   data-text-size="dec" | "inc" | "reset" | "cycle"    buttons
//   data-text-size-preset="small|normal|large|xlarge"   preset buttons (aria-pressed)
//   data-text-size-value                                shows the current "NN%"
// IPrayTextSize.createControl() builds the usual  −  100%  +  group.
(function () {
  'use strict';

  if (window.IPrayTextSize) return;

  var MIN = 0.8;
  var MAX = 1.7;
  var STEP = 0.1;
  // The key the prayer pages' A−/A+ buttons already saved to, kept so their
  // saved size carries over.
  var KEY = 'masifuTextScale';
  // Older Small / Normal / Large / Extra Large setting (Settings, home menu).
  var LEGACY_KEY = 'textSize';
  var PRESETS = { small: 0.9, normal: 1, large: 1.25, xlarge: 1.5 };
  var SCALE_VAR = 'var(--prayer-text-scale, 1)';

  var current = 1;

  function clamp(scale) {
    scale = Math.round(scale * 100) / 100;
    return Math.min(MAX, Math.max(MIN, scale));
  }

  function readSaved() {
    try {
      var saved = parseFloat(localStorage.getItem(KEY));
      if (!isNaN(saved)) return clamp(saved);
      // Value written by older page scripts: migrate to the canonical key.
      var legacy = PRESETS[localStorage.getItem(LEGACY_KEY)];
      if (legacy) {
        localStorage.setItem(KEY, String(legacy));
        return legacy;
      }
    } catch (e) {}
    return 1;
  }

  // Tailwind's text-* utilities read --text-*, so redefining them on <main>
  // scales classed text there; plain text follows main's own font-size. A
  // <main> inside .container (css/index.css already scales .container) is
  // left alone so its text isn't scaled twice, and so is a <main> marked
  // data-fixed-text-size.
  function injectStyle() {
    if (document.getElementById('ipray-text-size-style')) return;
    var sizes = {
      xs: 0.75, sm: 0.875, base: 1, lg: 1.125, xl: 1.25,
      '2xl': 1.5, '3xl': 1.875, '4xl': 2.25, '5xl': 3, '6xl': 3.75
    };
    var vars = ['--ipray-text-scale:' + SCALE_VAR];
    for (var k in sizes) {
      vars.push('--text-' + k + ':calc(' + sizes[k] + 'rem * ' + SCALE_VAR + ')');
    }
    var style = document.createElement('style');
    style.id = 'ipray-text-size-style';
    style.textContent =
      'main:not([data-fixed-text-size]){' + vars.join(';') + '}\n' +
      'main:not([data-fixed-text-size]):not(.container):not(.container main)' +
      '{font-size:calc(100% * ' + SCALE_VAR + ')}';
    (document.head || document.documentElement).appendChild(style);
  }

  function each(root, selector, fn) {
    var els = root.querySelectorAll(selector);
    for (var i = 0; i < els.length; i++) fn(els[i]);
  }

  function syncControls(root) {
    root = root || document;
    var pct = Math.round(current * 100) + '%';
    each(root, '[data-text-size-value]', function (el) { el.textContent = pct; });
    each(root, '[data-text-size="dec"]', function (el) { el.disabled = current <= MIN; });
    each(root, '[data-text-size="inc"]', function (el) { el.disabled = current >= MAX; });
    each(root, '[data-text-size-preset]', function (el) {
      var preset = PRESETS[el.getAttribute('data-text-size-preset')];
      el.setAttribute('aria-pressed', String(Math.abs(preset - current) < 0.001));
    });
  }

  function apply(scale) {
    var changed = scale !== current;
    current = scale;
    document.documentElement.style.setProperty('--prayer-text-scale', String(scale));
    syncControls();
    if (changed) {
      try {
        window.dispatchEvent(new CustomEvent('ipray:textsizechange', { detail: { scale: scale } }));
      } catch (e) {}
    }
  }

  function set(scale) {
    scale = clamp(parseFloat(scale) || 1);
    try { localStorage.setItem(KEY, String(scale)); } catch (e) {}
    apply(scale);
  }

  function step(direction) {
    set(current + STEP * direction);
  }

  // One button that walks through the presets (used where a page has a
  // single "Text Size" button rather than − / +).
  function cycle() {
    var order = [PRESETS.small, PRESETS.normal, PRESETS.large, PRESETS.xlarge];
    for (var i = 0; i < order.length; i++) {
      if (order[i] > current + 0.001) return set(order[i]);
    }
    set(order[0]);
  }

  function refresh() {
    apply(readSaved());
  }

  function createControl(opts) {
    opts = opts || {};
    var classes = opts.buttonClass || {};
    var group = document.createElement('div');
    group.className = opts.className || '';
    group.setAttribute('role', 'group');
    group.setAttribute('aria-label', 'Ukubwa wa maandishi');

    [
      ['dec', '−', 'Punguza ukubwa wa maandishi'],
      ['reset', '', 'Rejesha ukubwa wa kawaida'],
      ['inc', '+', 'Ongeza ukubwa wa maandishi']
    ].forEach(function (b) {
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = classes[b[0]] || '';
      btn.setAttribute('data-text-size', b[0]);
      btn.setAttribute('aria-label', b[2]);
      if (b[0] === 'reset') {
        btn.setAttribute('data-text-size-value', '');
        btn.title = 'Rejesha 100%';
      } else {
        btn.textContent = b[1];
      }
      group.appendChild(btn);
    });

    syncControls(group);
    return group;
  }

  window.IPrayTextSize = {
    MIN: MIN,
    MAX: MAX,
    STEP: STEP,
    get: function () { return current; },
    set: set,
    step: step,
    reset: function () { set(1); },
    cycle: cycle,
    refresh: refresh,
    createControl: createControl
  };

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest
      ? e.target.closest('[data-text-size], [data-text-size-preset]')
      : null;
    if (!el || el.disabled) return;
    var action = el.getAttribute('data-text-size');
    if (action === 'dec') step(-1);
    else if (action === 'inc') step(1);
    else if (action === 'reset') set(1);
    else if (action === 'cycle') cycle();
    else if (el.hasAttribute('data-text-size-preset')) {
      var preset = PRESETS[el.getAttribute('data-text-size-preset')];
      if (preset) set(preset);
    }
  });

  // Before first paint: <html> is available now, the controls once parsed.
  injectStyle();
  refresh();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  }

  // A change on another page or tab.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) refresh();
  });

  // Returning to a page from the back/forward cache, or to a backgrounded tab.
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refresh();
  });
})();

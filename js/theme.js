// Shared light/dark theme manager for every page of the app.
//
// Load it synchronously in <head> (before any page script that touches the
// theme) so the saved choice is applied before first paint. A switch made on
// any page is saved under one key and picked up everywhere:
//   - other open tabs/windows via the `storage` event,
//   - pages restored from the back/forward cache via `pageshow`,
//   - every page loaded afterwards on startup.
//
// Pages style dark mode with different hooks (Tailwind's `html.dark`,
// `body.dark-mode`, `body.dark`, `[data-theme]`), so all of them are set
// together and any page stylesheet keeps working.
(function () {
  'use strict';

  if (window.IPrayTheme) return;

  var KEY = 'darkMode';      // canonical: 'true' | 'false'
  var LEGACY_KEY = 'theme';  // older pages: 'dark' | 'light'

  function readSaved() {
    try {
      var v = localStorage.getItem(KEY);
      if (v === 'true') return true;
      if (v === 'false') return false;
      // Values written by older page scripts: migrate to the canonical form.
      var legacy = localStorage.getItem(LEGACY_KEY);
      var dark = null;
      if (v === 'enabled' || v === 'disabled') dark = v === 'enabled';
      else if (legacy === 'dark' || legacy === 'light') dark = legacy === 'dark';
      if (dark !== null) {
        localStorage.setItem(KEY, dark ? 'true' : 'false');
        return dark;
      }
    } catch (e) {}
    return false;
  }

  function isDark() {
    return document.documentElement.classList.contains('dark');
  }

  function syncControls(dark) {
    var btns = document.querySelectorAll('.toggle-btn');
    for (var i = 0; i < btns.length; i++) {
      var btn = btns[i];
      // Keep each button's own label style ("Dark" vs "Dark Mode").
      if (!btn.getAttribute('data-theme-label')) {
        btn.setAttribute('data-theme-label', /mode/i.test(btn.textContent) ? 'long' : 'short');
      }
      var long = btn.getAttribute('data-theme-label') === 'long';
      btn.textContent = dark ? (long ? 'Light Mode' : 'Light') : (long ? 'Dark Mode' : 'Dark');
      btn.setAttribute('aria-pressed', String(dark));
    }
    var checkbox = document.getElementById('darkModeToggle');
    if (checkbox && checkbox.type === 'checkbox') checkbox.checked = dark;
  }

  function applyToBody(dark) {
    var body = document.body;
    if (!body) return;
    body.classList.toggle('dark', dark);
    body.classList.toggle('dark-mode', dark);
    syncControls(dark);
  }

  function apply(dark) {
    dark = !!dark;
    var root = document.documentElement;
    var changed = root.classList.contains('dark') !== dark;
    root.classList.toggle('dark', dark);
    root.classList.toggle('light', !dark);
    root.setAttribute('data-theme', dark ? 'dark' : 'light');
    applyToBody(dark);
    if (changed) {
      try {
        window.dispatchEvent(new CustomEvent('ipray:themechange', { detail: { dark: dark } }));
      } catch (e) {}
    }
  }

  function set(dark) {
    dark = !!dark;
    try {
      localStorage.setItem(KEY, dark ? 'true' : 'false');
      localStorage.setItem(LEGACY_KEY, dark ? 'dark' : 'light');
    } catch (e) {}
    apply(dark);
  }

  function toggle() {
    set(!isDark());
  }

  function refresh() {
    apply(readSaved());
  }

  window.IPrayTheme = {
    isDark: isDark,
    set: set,
    toggle: toggle,
    refresh: refresh
  };

  // Inline `onclick="toggleDarkMode()"` handlers on older pages.
  window.toggleDarkMode = toggle;

  // Before first paint: <html> is available now, <body> once parsed.
  refresh();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', refresh);
  }

  // A switch on another page or tab.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === LEGACY_KEY || e.key === null) refresh();
  });

  // Returning to a page from the back/forward cache, or to a backgrounded tab.
  window.addEventListener('pageshow', refresh);
  document.addEventListener('visibilitychange', function () {
    if (document.visibilityState === 'visible') refresh();
  });
})();

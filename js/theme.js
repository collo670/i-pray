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

  // The light/dark button in the app bar is a moon (a sun in dark mode),
  // round like the home page's. Older pages still carry the word "Dark" or
  // "Dark Mode" in their markup and get the icon here; only the old pages'
  // buttons outside an app bar that spell out "Dark Mode" keep their words.
  var MOON = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/></svg>';
  var SUN = '<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/></svg>';
  // Specific enough to win over the pages' own .toggle-btn rules, which
  // size it for a word.
  var ICON_CSS = 'html body .toggle-btn.toggle-btn-icon{width:2.75rem;height:2.75rem;min-width:0;min-height:0;padding:0;border:0;border-radius:9999px;background:transparent;}';

  function injectIconStyle() {
    if (document.getElementById('iprayThemeIconStyle')) return;
    var style = document.createElement('style');
    style.id = 'iprayThemeIconStyle';
    style.textContent = ICON_CSS;
    (document.head || document.documentElement).appendChild(style);
  }

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
      // Keep each button's own label style (icon vs "Dark Mode").
      if (!btn.getAttribute('data-theme-label')) {
        btn.setAttribute('data-theme-label', /mode/i.test(btn.textContent) ? 'long' : 'short');
      }
      if (btn.getAttribute('data-theme-label') === 'long' && !btn.classList.contains('app-bar-btn')) {
        btn.textContent = dark ? 'Light Mode' : 'Dark Mode';
      } else {
        btn.innerHTML = dark ? SUN : MOON;
        btn.classList.add('toggle-btn-icon');
        if (!btn.getAttribute('aria-label')) btn.setAttribute('aria-label', 'Toggle dark mode');
      }
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
  injectIconStyle();
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

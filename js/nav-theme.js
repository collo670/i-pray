// Centralized navigation and theme manager for pages
(function () {
  'use strict';

  // Immediate fallback wrappers so inline `onclick="toggleMenu()"` and
  // `onclick="toggleDarkMode()"` work even if DOMContentLoaded hasn't fired
  // or if other inline scripts expect those globals synchronously.
  if (!window.toggleMenu) {
    window.toggleMenu = function () {
      const navLinks = document.querySelector('.nav-links');
      const hamburger = document.querySelector('.hamburger');
      if (!navLinks || !hamburger) return;
      navLinks.classList.toggle('active');
      hamburger.classList.toggle('active');
      const isOpen = navLinks.classList.contains('active');
      try { hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false'); } catch (e) {}
      try { navLinks.setAttribute('aria-hidden', isOpen ? 'false' : 'true'); } catch (e) {}
    };
  }

  if (!window.toggleDarkMode) {
    window.toggleDarkMode = function () {
      document.body.classList.toggle('dark-mode');
      const btn = document.querySelector('.toggle-btn');
      if (btn) btn.textContent = document.body.classList.contains('dark-mode') ? 'Light Mode' : 'Dark Mode';
      try { localStorage.setItem('darkMode', document.body.classList.contains('dark-mode') ? 'enabled' : 'disabled'); } catch (e) {}
    };
  }

  document.addEventListener('DOMContentLoaded', function () {
    let navLinks = document.querySelector('.nav-links');
    let hamburger = document.querySelector('.hamburger');
    let toggleBtn = document.querySelector('.toggle-btn');

    // Defensive: replace elements with clones to remove any previously attached
    // inline or ad-hoc event listeners from page-specific scripts so the
    // centralized handlers below are the only ones active.
    try {
      if (hamburger && hamburger.parentNode) {
        const newHamb = hamburger.cloneNode(true);
        hamburger.parentNode.replaceChild(newHamb, hamburger);
        hamburger = newHamb;
      }
      if (navLinks && navLinks.parentNode) {
        const newNav = navLinks.cloneNode(true);
        navLinks.parentNode.replaceChild(newNav, navLinks);
        navLinks = newNav;
      }
      if (toggleBtn && toggleBtn.parentNode) {
        const newToggle = toggleBtn.cloneNode(true);
        toggleBtn.parentNode.replaceChild(newToggle, toggleBtn);
        toggleBtn = newToggle;
      }
    } catch (e) {
      // ignore replacement errors on strange DOMs
    }

    if (!navLinks || !hamburger) {
      // Nothing to do if page doesn't have the expected structure
      // Expose no-op functions so existing onclick attributes won't error
      window.toggleMenu = function () {};
      window.toggleDarkMode = function () {};
      return;
    }

    // Utility to set ARIA attributes consistently
    function setAria(open) {
      hamburger.setAttribute('aria-expanded', open ? 'true' : 'false');
      navLinks.setAttribute('aria-hidden', open ? 'false' : 'true');
    }

    function openMenu() {
      navLinks.classList.add('active');
      hamburger.classList.add('active');
      setAria(true);
      if (navigator.vibrate) navigator.vibrate(50);
      // focus first link for better keyboard accessibility
      setTimeout(function () {
        const first = navLinks.querySelector('a');
        if (first) first.focus();
      }, 100);
    }

    function closeMenu() {
      navLinks.classList.remove('active');
      hamburger.classList.remove('active');
      setAria(false);
    }

    // Ensure the global toggle delegates to the richer implementation
    window.toggleMenu = function () {
      if (navLinks.classList.contains('active')) closeMenu();
      else openMenu();
    };

    // Attach interactions
    hamburger.addEventListener('click', function (e) {
      e.stopPropagation();
      window.toggleMenu();
    });

    hamburger.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.toggleMenu();
      }
    });

    // Close when link clicked on small screens
    document.querySelectorAll('.nav-links a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth <= 768) closeMenu();
      });
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('active')) {
        closeMenu();
      }
    });

    // Close when clicking outside
    document.addEventListener('click', function (e) {
      if (
        navLinks.classList.contains('active') &&
        !navLinks.contains(e.target) &&
        !hamburger.contains(e.target)
      ) {
        closeMenu();
      }
    });

    // Dark mode handling
    function setDark(enabled) {
      document.body.classList.toggle('dark-mode', enabled);
      if (toggleBtn) toggleBtn.textContent = enabled ? 'Light Mode' : 'Dark Mode';
      localStorage.setItem('darkMode', enabled ? 'enabled' : 'disabled');
    }

    window.toggleDarkMode = function () {
      setDark(!document.body.classList.contains('dark-mode'));
    };

    // Mark that the enhanced implementation is active
    window.__navThemeLoaded = true;

    if (toggleBtn) {
      toggleBtn.addEventListener('click', window.toggleDarkMode);
    }

    // Initialize dark mode preference
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved === 'enabled') setDark(true);
      else if (saved === 'disabled') setDark(false);
      else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDark(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  });
})();

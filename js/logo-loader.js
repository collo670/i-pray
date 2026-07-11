// ipray logo loading animation
// Self-contained: injects its own styles and overlay markup.
// Shows the app logo with 3 expanding rings and the "ipray" wordmark
// on initial page load and whenever the user navigates to another page.
(function () {
    'use strict';

    var SHOW_DURATION = 3000; // how long the loader stays visible (ms)
    var LOGO_FILE = 'assets/images/maria mdogo.png';

    // Resolve the app root from this script's own URL so the logo path
    // works from any page depth (/, /pages/, /pages/ofisi ya masomo/..., etc.)
    var script = document.currentScript;
    var appRoot = '';
    if (script && script.src) {
        appRoot = script.src.replace(/js\/logo-loader\.js.*$/, '');
    }
    var logoSrc = appRoot + LOGO_FILE;

    var css = '' +
        '.logo-loader {' +
        '    position: fixed;' +
        '    inset: 0;' +
        '    z-index: 10000;' +
        '    display: flex;' +
        '    flex-direction: column;' +
        '    align-items: center;' +
        '    justify-content: center;' +
        '    gap: 1.25rem;' +
        '    background: rgba(255, 255, 255, 0.95);' +
        '    -webkit-backdrop-filter: blur(6px);' +
        '    backdrop-filter: blur(6px);' +
        '    opacity: 1;' +
        '    transition: opacity 0.4s ease;' +
        '}' +
        'html.dark .logo-loader {' +
        '    background: rgba(17, 24, 39, 0.95);' +
        '}' +
        '.logo-loader.logo-loader-hidden {' +
        '    opacity: 0;' +
        '    pointer-events: none;' +
        '    visibility: hidden;' +
        '    transition: opacity 0.4s ease, visibility 0s linear 0.4s;' +
        '}' +
        '.logo-loader-stage {' +
        '    position: relative;' +
        '    width: 100px;' +
        '    height: 100px;' +
        '}' +
        '.logo-loader-img {' +
        '    position: relative;' +
        '    z-index: 1;' +
        '    width: 100px;' +
        '    height: 100px;' +
        '    border-radius: 50%;' +
        '    border: 4px solid #ffc107;' +
        '    object-fit: cover;' +
        '    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);' +
        '}' +
        '.logo-loader-ring {' +
        '    position: absolute;' +
        '    inset: -4px;' +
        '    border-radius: 50%;' +
        '    border: 3px solid #7c3aed;' +
        '    opacity: 0;' +
        '    animation: logo-loader-ring 3s ease-out infinite;' +
        '}' +
        '.logo-loader-ring:nth-child(2) {' +
        '    border-color: #db2777;' +
        '    animation-delay: 1s;' +
        '}' +
        '.logo-loader-ring:nth-child(3) {' +
        '    border-color: #ffc107;' +
        '    animation-delay: 2s;' +
        '}' +
        '@keyframes logo-loader-ring {' +
        '    0% { transform: scale(1); opacity: 0.9; }' +
        '    100% { transform: scale(2.6); opacity: 0; }' +
        '}' +
        '.logo-loader-text {' +
        '    font-size: 1.5rem;' +
        '    font-weight: 700;' +
        '    letter-spacing: 0.02em;' +
        '    background: linear-gradient(to right, #9333ea, #db2777);' +
        '    -webkit-background-clip: text;' +
        '    background-clip: text;' +
        '    color: transparent;' +
        '    animation: logo-loader-pulse 1.5s ease-in-out infinite;' +
        '}' +
        '@keyframes logo-loader-pulse {' +
        '    0%, 100% { opacity: 1; }' +
        '    50% { opacity: 0.6; }' +
        '}' +
        '@media (prefers-reduced-motion: reduce) {' +
        '    .logo-loader-ring, .logo-loader-text { animation: none; }' +
        '    .logo-loader-ring { opacity: 0.4; }' +
        '}';

    var style = document.createElement('style');
    style.textContent = css;
    (document.head || document.documentElement).appendChild(style);

    var overlay = document.createElement('div');
    overlay.id = 'logoLoader';
    overlay.className = 'logo-loader';
    overlay.setAttribute('role', 'status');
    overlay.setAttribute('aria-label', 'Loading ipray');
    overlay.innerHTML =
        '<div class="logo-loader-stage">' +
            '<span class="logo-loader-ring"></span>' +
            '<span class="logo-loader-ring"></span>' +
            '<span class="logo-loader-ring"></span>' +
            '<img class="logo-loader-img" src="' + logoSrc + '" alt="ipray logo">' +
        '</div>' +
        '<p class="logo-loader-text">ipray</p>';

    var hideTimer = null;

    function mount() {
        var parent = document.body || document.documentElement;
        if (!overlay.parentNode) {
            parent.appendChild(overlay);
        }
    }

    function show() {
        mount();
        clearTimeout(hideTimer);
        overlay.classList.remove('logo-loader-hidden');
        hideTimer = setTimeout(hide, SHOW_DURATION);
    }

    function hide() {
        clearTimeout(hideTimer);
        overlay.classList.add('logo-loader-hidden');
    }

    // Show immediately while the current page loads
    show();

    // Re-mount into <body> once it exists so the overlay isn't a direct
    // child of <html> (harmless, but keeps the DOM tidy)
    document.addEventListener('DOMContentLoaded', function () {
        if (overlay.parentNode !== document.body) {
            document.body.appendChild(overlay);
        }
    });

    // Show the loader when navigating to another page in the app
    document.addEventListener('click', function (event) {
        if (event.defaultPrevented || event.button !== 0 ||
            event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
            return;
        }
        var link = event.target && event.target.closest ? event.target.closest('a[href]') : null;
        if (!link) return;
        if (link.target && link.target !== '_self') return;
        if (link.hasAttribute('download')) return;

        var href = link.getAttribute('href');
        if (!href || href.charAt(0) === '#') return;
        if (/^(javascript|mailto|tel|sms):/i.test(href)) return;
        if (link.origin && link.origin !== window.location.origin) return;
        // Same-page hash navigation
        if (link.pathname === window.location.pathname && link.hash) return;

        show();
    }, true);

    // Hide the loader when a page is restored from the back/forward cache
    window.addEventListener('pageshow', function (event) {
        if (event.persisted) {
            hide();
        }
    });
})();

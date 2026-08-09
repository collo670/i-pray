// Makes the "Prayers" bottom-nav item open the same Prayers menu sheet used
// on index.html, on every other page. index.html already builds this sheet
// itself (see js/index.js + its inline scripts), so this script no-ops there.
// Also injects Font Awesome if missing, so the menu items match index.html.
(function () {
    'use strict';

    if (window.__ipnPrayersNavInit) return;
    window.__ipnPrayersNavInit = true;

    if (document.getElementById('prayersSheet')) return; // index.html already handles itself

    // Ensure Font Awesome is available for prayer menu icons
    (function injectFontAwesome() {
        if (document.querySelector('link[href*="font-awesome"]')) return;
        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
        link.media = 'print';
        link.onload = function () { this.media = 'all'; };
        var noscript = document.createElement('noscript');
        var fallback = document.createElement('link');
        fallback.rel = 'stylesheet';
        fallback.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.2/css/all.min.css';
        noscript.appendChild(fallback);
        document.head.appendChild(link);
        document.head.appendChild(noscript);
    })();

    function init() {
        var nav = document.querySelector('.bottom-nav, nav[role="navigation"][aria-label="Main Navigation"]');
        if (!nav) return;

        var label = nav.querySelector('[data-translate="prayers"]');
        var prayersLink = label ? label.closest('a, button') : null;
        if (!prayersLink) return;

        var basePath = resolveBasePath(prayersLink.getAttribute('href') || '');

        var PRAYER_MENU = [
            { id: 'lauds', key: 'morningPrayer', label: 'Morning Prayer', icon: 'fa-sun', iconColor: 'text-yellow-500', type: 'hours', suffix: '' },
            { id: 'scripture', key: 'officeOfReadings', label: 'Office of Readings', icon: 'fa-book-open', iconColor: 'text-orange-500', link: 'pages/prayer-hour.html?hour=readings' },
            { id: 'midday', key: 'middayPrayer', label: 'Midday Prayer', icon: 'fa-cloud-sun', iconColor: 'text-amber-500', link: 'pages/prayer-hour.html?hour=sext' },
            { id: 'vespers', key: 'eveningPrayer', label: 'Evening Prayer', icon: 'fa-moon', iconColor: 'text-indigo-500', link: 'pages/prayer-hour.html?hour=vespers' },
            { id: 'readings', key: 'nightPrayer', label: 'Night Prayer', icon: 'fa-star', iconColor: 'text-blue-500', link: 'pages/compline.html' },
            { id: 'rosary', key: 'holyRosary', label: 'Holy Rosary', icon: 'fa-hands-praying', iconColor: 'text-red-500', link: 'pages/holy-rosary.html' },
            { id: 'sacraments', key: 'stationsOfCross', label: 'Way of the Cross', icon: 'fa-cross', iconColor: 'text-pink-500', link: 'pages/via-cruce.html' },
            { id: 'morning', key: 'otherPrayers', label: 'Other Prayers', icon: 'fa-book', iconColor: 'text-green-600', link: 'pages/prayer.html' },
            { id: 'carmen-page', key: 'carmenPrayer', label: 'Carmen Prayer', icon: 'fa-heart', iconColor: 'text-purple-500', link: 'pages/carmen.html' }
        ];

        injectStyles();
        var sheet = buildSheet(PRAYER_MENU, basePath);
        document.body.appendChild(sheet);
        wireUp(prayersLink, sheet);
    }

    function resolveBasePath(href) {
        if (href && href.indexOf('pages/prayer.html') !== -1) {
            var match = href.match(/^(.*?)pages\/prayer\.html(?:[?#].*)?$/);
            if (match) return match[1];
        }
        var parts = (href || '').split('/');
        parts.pop();
        if (parts[parts.length - 1] === 'pages') parts.pop();
        if (parts.length === 0) return '../';
        return parts.join('/') + '/';
    }

    function resolvePrayerLink(item, basePath) {
        if (item.type === 'hours') {
            var now = new Date();
            var dayToPrefix = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
            var dayPrefix = dayToPrefix[now.getDay()];
            var weekSequence = [2, 3, 4, 1];
            var today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            var daysSinceSunday = today.getDay();
            var currentSunday = new Date(today);
            currentSunday.setDate(today.getDate() - daysSinceSunday);
            var referenceWeek2Sunday = new Date(2025, 7, 3);
            referenceWeek2Sunday.setHours(0, 0, 0, 0);
            var msPerWeek = 7 * 24 * 60 * 60 * 1000;
            var weeksSinceRef = Math.floor((currentSunday - referenceWeek2Sunday) / msPerWeek);
            var weekIndex = ((weeksSinceRef % weekSequence.length) + weekSequence.length) % weekSequence.length;
            var week = weekSequence[weekIndex];
            var suffixPart = item.suffix ? '-' + item.suffix : '';
            return basePath + 'pages/' + dayPrefix + week + suffixPart + '.html';
        }
        return basePath + item.link;
    }

    function buildSheet(items, basePath) {
        var overlay = document.createElement('div');
        overlay.id = 'ipnPrayersSheet';
        overlay.className = 'ipn-overlay ipn-hidden';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-modal', 'true');
        overlay.setAttribute('aria-labelledby', 'ipnPrayersTitle');

        var itemsHtml = items.map(function (item) {
            var href = resolvePrayerLink(item, basePath);
            var label = item.label;
            return '<a class="ipn-item" href="' + href + '" data-translate="' + item.key + '">' +
                '<span class="ipn-item-icon"><i class="fas ' + item.icon + ' ' + item.iconColor + '" aria-hidden="true"></i></span>' +
                '<span class="ipn-item-label">' + label + '</span>' +
                '<svg class="ipn-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
                '<path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" /></svg>' +
                '</a>';
        }).join('');

        overlay.innerHTML =
            '<div class="ipn-panel">' +
            '<div class="ipn-handle" aria-hidden="true"></div>' +
            '<div class="ipn-header">' +
            '<h2 id="ipnPrayersTitle" class="ipn-title">Prayers</h2>' +
            '<button type="button" id="ipnClosePrayersSheet" class="ipn-close" aria-label="Close prayers menu">' +
            '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">' +
            '<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>' +
            '</button>' +
            '</div>' +
            '<nav class="ipn-list" aria-label="All prayers">' + itemsHtml + '</nav>' +
            '</div>';

        return overlay;
    }

    function wireUp(prayersLink, sheet) {
        var closeBtn = sheet.querySelector('#ipnClosePrayersSheet');

        function openSheet() {
            sheet.classList.remove('ipn-hidden');
            requestAnimationFrame(function () { sheet.classList.add('ipn-open'); });
            document.body.classList.add('overflow-hidden');
        }

        function closeSheet() {
            sheet.classList.remove('ipn-open');
            document.body.classList.remove('overflow-hidden');
            setTimeout(function () { sheet.classList.add('ipn-hidden'); }, 250);
        }

        prayersLink.setAttribute('aria-haspopup', 'dialog');
        prayersLink.setAttribute('aria-controls', 'ipnPrayersSheet');
        prayersLink.addEventListener('click', function (e) {
            e.preventDefault();
            openSheet();
        });
        closeBtn.addEventListener('click', closeSheet);
        sheet.addEventListener('click', function (e) {
            if (e.target === sheet) closeSheet();
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && !sheet.classList.contains('ipn-hidden')) closeSheet();
        });
    }

    function injectStyles() {
        if (document.getElementById('ipnPrayersNavStyles')) return;
        var style = document.createElement('style');
        style.id = 'ipnPrayersNavStyles';
        style.textContent =
            '.ipn-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:1000;display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .25s ease;}' +
            '.ipn-overlay.ipn-open{opacity:1;}' +
            '.ipn-overlay.ipn-hidden{display:none;}' +
            '.ipn-panel{width:100%;max-width:32rem;max-height:80vh;max-height:80dvh;overflow-y:auto;background:#fff;border-radius:1.5rem 1.5rem 0 0;padding-bottom:max(env(safe-area-inset-bottom),1rem);transform:translateY(100%);transition:transform .28s cubic-bezier(.32,.72,.24,1);box-shadow:0 -12px 40px rgba(0,0,0,.25);}' +
            '.ipn-overlay.ipn-open .ipn-panel{transform:translateY(0);}' +
            '.ipn-handle{width:2.5rem;height:.3rem;border-radius:9999px;background:#c7d2d0;margin:.6rem auto .9rem;}' +
            '.ipn-header{display:flex;align-items:center;justify-content:space-between;padding:0 1.25rem .5rem;}' +
            '.ipn-title{font-size:1.25rem;font-weight:700;color:#1f2937;margin:0;}' +
            '.ipn-close{padding:.5rem;border-radius:9999px;background:#e5e7eb;border:none;color:#374151;display:flex;cursor:pointer;}' +
            '.ipn-list{display:flex;flex-direction:column;padding:.25rem 0;}' +
            '.ipn-item{display:flex;align-items:center;gap:.875rem;padding:.8rem 1.25rem;min-height:48px;color:#1f2937;font-weight:500;font-size:1.05rem;border-bottom:1px solid #e5e7eb;text-decoration:none;}' +
            '.ipn-item:last-child{border-bottom:none;}' +
            '.ipn-item:hover,.ipn-item:active{background-color:#f3f4f6;}' +
            '.ipn-item-icon{display:flex;align-items:center;justify-content:center;width:2.25rem;height:2.25rem;border-radius:9999px;background:#f3f4f6;flex-shrink:0;}' +
            '.ipn-item-label{flex:1;}' +
            '.ipn-chevron{color:#6b7280;flex-shrink:0;}' +
            '@media (min-width:768px){.ipn-overlay{align-items:center;padding:1rem;}.ipn-panel{border-radius:1.5rem;}}' +
            '@media (prefers-color-scheme:dark){.ipn-panel{background:#1f2937;}.ipn-title{color:#f3f4f6;}.ipn-close{background:#374151;color:#e5e7eb;}.ipn-item{color:#f3f4f6;border-bottom-color:#374151;}.ipn-item:hover,.ipn-item:active{background-color:#374151;}.ipn-chevron{color:#9ca3af;}.ipn-item-icon{background:#374151;}}' +
            'html.dark .ipn-panel{background:#1f2937;}html.dark .ipn-title{color:#f3f4f6;}html.dark .ipn-close{background:#374151;color:#e5e7eb;}html.dark .ipn-item{color:#f3f4f6;border-bottom-color:#374151;}html.dark .ipn-item:hover,html.dark .ipn-item:active{background-color:#374151;}html.dark .ipn-chevron{color:#9ca3af;}html.dark .ipn-item-icon{background:#374151;}';
        document.head.appendChild(style);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

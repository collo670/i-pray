// ipray library: favourites, recently opened prayers, and "continue where
// you left off".
// ---------------------------------------------------------------------------
// Loaded (deferred) on every page. On a prayer page it:
//   - adds a star button to keep the page among the favourites;
//   - records the visit in the recent list;
//   - remembers how far down the page the reader got, and when the page is
//     opened from the home page's "Continue" card (#endelea) scrolls back
//     there.
// On the home page it fills #continueCard and #myPrayersCard.
//
// Everything is kept in this browser (localStorage): 'favorites' (the key
// the home page always used), 'ipray:recent' and 'ipray:lastReading'.
(function () {
    'use strict';

    var FAV_KEY = 'favorites';
    var RECENT_KEY = 'ipray:recent';
    var LAST_KEY = 'ipray:lastReading';
    var MAX_RECENT = 8;
    var RESUME_HASH = '#endelea';

    var WORDS = {
        sw: {
            add: 'Hifadhi kwenye vipendwa', remove: 'Ondoa kwenye vipendwa',
            added: 'Imehifadhiwa kwenye vipendwa', removed: 'Imeondolewa kwenye vipendwa',
            continueTitle: 'Endelea pale ulipoishia', read: 'umesoma',
            favourites: 'Vipendwa', recent: 'Ulizofungua hivi karibuni', myPrayers: 'Sala zangu',
            clearRecent: 'Futa orodha', week: 'Juma'
        },
        en: {
            add: 'Add to favourites', remove: 'Remove from favourites',
            added: 'Added to favourites', removed: 'Removed from favourites',
            continueTitle: 'Continue where you left off', read: 'read',
            favourites: 'Favourites', recent: 'Recently opened', myPrayers: 'My prayers',
            clearRecent: 'Clear list', week: 'Week'
        }
    };

    function lang() { return window.IPrayI18n ? window.IPrayI18n.prayerLang() : 'sw'; }
    function w(key) { return WORDS[lang()][key]; }

    function load(key, fallback) {
        try {
            var v = JSON.parse(localStorage.getItem(key));
            return v == null ? fallback : v;
        } catch (e) { return fallback; }
    }
    function save(key, value) {
        try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) {}
    }

    function esc(s) {
        return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
        });
    }

    // ----- Which page is this? ---------------------------------------------

    // Pages that hold prayers or readings: everything under pages/ except
    // the app's own screens.
    var NOT_CONTENT = /\/pages\/(settings|calendar|fallback|masifu-asubuhi)\.html$/;

    function isContentPage() {
        var p = location.pathname;
        return p.indexOf('/pages/') !== -1 && /\.html$/.test(p) && !NOT_CONTENT.test(p);
    }

    // The page's address as stored: path plus query (prayer-hour.html?hour=…
    // is a different prayer from ?hour=sext), never the #fragment.
    function pageKey() {
        return location.pathname + location.search;
    }

    function pageTitle() {
        var t = document.title.replace(/\s*[-|–]\s*ipray\s*$/i, '').trim();
        // The four weeks of Masifu ya Asubuhi share one title per weekday.
        var m = location.pathname.match(/\/(jumapili|jumatatu|jumanne|jumatano|alhamisi|ijumaa|jumamosi)([1-4])\.html$/);
        if (m && !/\b(juma|week)\b/i.test(t)) t += ' · ' + w('week') + ' ' + m[2];
        return t || location.pathname.split('/').pop();
    }

    // ----- Favourites -------------------------------------------------------

    function favourites() { return load(FAV_KEY, []); }

    function isFavourite(key) {
        return favourites().some(function (f) { return f.id === key; });
    }

    function toggleFavourite(key, title) {
        var list = favourites();
        var i = -1;
        list.forEach(function (f, n) { if (f.id === key) i = n; });
        if (i === -1) list.unshift({ id: key, title: title, link: key, date: new Date().toISOString() });
        else list.splice(i, 1);
        save(FAV_KEY, list);
        return i === -1;
    }

    // ----- Recent and position ---------------------------------------------

    function recordVisit(key, title) {
        var list = load(RECENT_KEY, []).filter(function (r) { return r.url !== key; });
        list.unshift({ url: key, title: title, at: Date.now() });
        save(RECENT_KEY, list.slice(0, MAX_RECENT));
    }

    function scrollRatio() {
        var max = document.documentElement.scrollHeight - window.innerHeight;
        return max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    }

    function rememberPosition(key, title) {
        var ratio = scrollRatio();
        var last = load(LAST_KEY, null);
        if (ratio > 0.03 && ratio < 0.97) {
            save(LAST_KEY, { url: key, title: title, ratio: ratio, at: Date.now() });
        } else if (last && last.url === key) {
            // Back at the top, or finished: nothing left to continue here.
            try { localStorage.removeItem(LAST_KEY); } catch (e) {}
        }
    }

    // The office pages load their text after the page itself, so the
    // position is restored a few times as the page grows, until the reader
    // scrolls on their own.
    function restorePosition(key) {
        var last = load(LAST_KEY, null);
        if (!last || last.url !== key) return;
        var userMoved = false;
        var stop = function () { userMoved = true; };
        ['wheel', 'touchmove', 'keydown'].forEach(function (ev) { window.addEventListener(ev, stop, { once: true, passive: true }); });
        [0, 400, 1200, 2500, 4500].forEach(function (delay) {
            setTimeout(function () {
                if (userMoved) return;
                var max = document.documentElement.scrollHeight - window.innerHeight;
                if (max > 0) window.scrollTo(0, Math.round(last.ratio * max));
            }, delay);
        });
        history.replaceState(null, '', location.pathname + location.search);
    }

    // ----- Star button ------------------------------------------------------

    var STAR_OUTLINE = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.5a.56.56 0 011.04 0l2.12 5.11a.56.56 0 00.48.35l5.52.44c.5.04.7.66.32.99l-4.2 3.6a.56.56 0 00-.18.56l1.28 5.38a.56.56 0 01-.84.61l-4.73-2.89a.56.56 0 00-.58 0l-4.73 2.89a.56.56 0 01-.84-.61l1.28-5.38a.56.56 0 00-.18-.56l-4.2-3.6a.56.56 0 01.32-.99l5.52-.44a.56.56 0 00.47-.35z"/></svg>';
    var STAR_FILLED = STAR_OUTLINE.replace('fill="none"', 'fill="currentColor"');

    function injectStyles() {
        var css = ''
            + '.ipray-fav{position:fixed;left:1rem;bottom:max(1.1rem,env(safe-area-inset-bottom,0px) + 0.75rem);z-index:1200;'
            + 'width:44px;height:44px;border-radius:999px;border:0;display:flex;align-items:center;justify-content:center;'
            + 'background:rgba(34,34,34,0.92);color:#fff;box-shadow:0 4px 14px rgba(0,0,0,0.3);cursor:pointer;'
            + 'backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);}'
            + '.ipray-fav[aria-pressed="true"]{color:#f0c96a;}'
            + 'body:has(.bottom-nav) .ipray-fav{bottom:calc(5.5rem + env(safe-area-inset-bottom,0px));}'
            + '.ipray-toast{position:fixed;left:50%;transform:translateX(-50%);bottom:calc(5rem + env(safe-area-inset-bottom,0px));'
            + 'z-index:1300;background:#1f2937;color:#fff;padding:0.55rem 1rem;border-radius:0.6rem;font-size:0.9rem;'
            + 'box-shadow:0 4px 14px rgba(0,0,0,0.25);transition:opacity .3s;}';
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function toast(message) {
        var el = document.createElement('div');
        el.className = 'ipray-toast';
        el.setAttribute('role', 'status');
        el.textContent = message;
        document.body.appendChild(el);
        setTimeout(function () { el.style.opacity = '0'; setTimeout(function () { el.remove(); }, 300); }, 1800);
    }

    function addStar(key) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ipray-fav';
        function paint() {
            var on = isFavourite(key);
            btn.innerHTML = on ? STAR_FILLED : STAR_OUTLINE;
            btn.setAttribute('aria-pressed', String(on));
            btn.setAttribute('aria-label', on ? w('remove') : w('add'));
            btn.title = btn.getAttribute('aria-label');
        }
        btn.addEventListener('click', function () {
            var added = toggleFavourite(key, pageTitle());
            paint();
            toast(added ? w('added') : w('removed'));
        });
        paint();
        document.body.appendChild(btn);
        if (window.IPrayI18n) window.IPrayI18n.onChange(paint);
    }

    // ----- Home page --------------------------------------------------------

    function renderHome() {
        var cont = document.getElementById('continueCard');
        var mine = document.getElementById('myPrayersCard');
        var last = load(LAST_KEY, null);
        var weekAgo = Date.now() - 7 * 24 * 3600 * 1000;

        if (cont) {
            if (last && last.at > weekAgo) {
                cont.innerHTML = '<a class="ipray-continue" href="' + esc(last.url + RESUME_HASH) + '">'
                    + '<span class="ipray-continue-label">' + esc(w('continueTitle')) + '</span>'
                    + '<span class="ipray-continue-title">' + esc(last.title) + '</span>'
                    + '<span class="ipray-continue-meta">' + Math.round(last.ratio * 100) + '% ' + esc(w('read')) + '</span>'
                    + '<span class="ipray-continue-bar"><span style="width:' + Math.round(last.ratio * 100) + '%"></span></span>'
                    + '</a>';
                cont.classList.remove('hidden');
            } else {
                cont.classList.add('hidden');
            }
        }

        if (mine) {
            var favs = favourites();
            var recent = load(RECENT_KEY, []).slice(0, 5);
            var html = '<h2 class="ipray-mine-title">' + esc(w('myPrayers')) + '</h2>';
            if (favs.length) {
                html += '<h3 class="ipray-mine-sub">' + esc(w('favourites')) + '</h3><ul class="ipray-mine-list">'
                    + favs.map(function (f) {
                        return '<li><a href="' + esc(f.link) + '">' + esc(f.title) + '</a>'
                            + '<button type="button" class="ipray-mine-remove" data-fav="' + esc(f.id) + '" aria-label="' + esc(w('remove')) + '">&times;</button></li>';
                    }).join('') + '</ul>';
            }
            if (recent.length) {
                html += '<h3 class="ipray-mine-sub">' + esc(w('recent'))
                    + ' <button type="button" class="ipray-mine-clear">' + esc(w('clearRecent')) + '</button></h3><ul class="ipray-mine-list">'
                    + recent.map(function (r) { return '<li><a href="' + esc(r.url) + '">' + esc(r.title) + '</a></li>'; }).join('')
                    + '</ul>';
            }
            mine.innerHTML = html;
            mine.classList.toggle('hidden', !favs.length && !recent.length);
            Array.prototype.forEach.call(mine.querySelectorAll('.ipray-mine-remove'), function (b) {
                b.addEventListener('click', function () {
                    save(FAV_KEY, favourites().filter(function (f) { return f.id !== b.getAttribute('data-fav'); }));
                    renderHome();
                });
            });
            var clear = mine.querySelector('.ipray-mine-clear');
            if (clear) clear.addEventListener('click', function () { save(RECENT_KEY, []); renderHome(); });
        }
    }

    // ----- Start ------------------------------------------------------------

    function init() {
        if (isContentPage()) {
            var key = pageKey();
            injectStyles();
            addStar(key);
            // Recorded once the page has its final title (the office pages
            // set theirs after loading).
            setTimeout(function () { recordVisit(key, pageTitle()); }, 1500);
            var timer = null;
            window.addEventListener('scroll', function () {
                clearTimeout(timer);
                timer = setTimeout(function () { rememberPosition(key, pageTitle()); }, 600);
            }, { passive: true });
            window.addEventListener('pagehide', function () { rememberPosition(key, pageTitle()); });
            if (location.hash === RESUME_HASH) restorePosition(key);
        }
        if (document.getElementById('continueCard') || document.getElementById('myPrayersCard')) {
            renderHome();
            if (window.IPrayI18n) window.IPrayI18n.onChange(renderHome);
            window.addEventListener('pageshow', renderHome);
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();

    window.IPrayLibrary = {
        favourites: favourites,
        isFavourite: isFavourite,
        toggleFavourite: toggleFavourite,
        recent: function () { return load(RECENT_KEY, []); },
        lastReading: function () { return load(LAST_KEY, null); },
        renderHome: renderHome
    };
})();

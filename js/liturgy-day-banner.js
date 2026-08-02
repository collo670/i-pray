// Liturgy of the Hours day banner
// Injected into the Midday (saa-sita) and Vespers (jioni) pages. Shows the
// current liturgical day, psalter week, and the day's celebration (saint
// memorials, feasts and solemnities) from the shared calendar engine in
// js/liturgical-calendar.js, which must be loaded before this script.
(function () {
    var LABELS = {
        en: {
            psalter: 'Psalter Week',
            ranks: {
                'Triduum': 'Sacred Triduum',
                'Solemnity': 'Solemnity',
                'Feast': 'Feast',
                'Special': 'Liturgical Day',
                'Memorial': 'Memorial',
                'Optional Memorial': 'Optional Memorial'
            },
            properNote: 'Today the office has its own proper texts for this celebration.',
            properLink: 'View the proper office (Universalis)'
        },
        sw: {
            psalter: 'Juma la Zaburi',
            ranks: {
                'Triduum': 'Siku Kuu Tatu Takatifu',
                'Solemnity': 'Sherehe',
                'Feast': 'Sikukuu',
                'Special': 'Siku Maalum',
                'Memorial': 'Kumbukumbu',
                'Optional Memorial': 'Kumbukumbu ya Hiari'
            },
            properNote: 'Leo sala ya Kanisa ina sehemu zake maalum kwa ajili ya adhimisho hili.',
            properLink: 'Tazama sala kamili ya adhimisho (Universalis)'
        }
    };
    var COLOR_DOTS = {
        white: '#e6cc6e', red: '#C41E3A', green: '#2E7D32',
        purple: '#7c2133', rose: '#DB2777', gold: '#b45309'
    };
    var ROMAN = { 1: 'I', 2: 'II', 3: 'III', 4: 'IV' };

    function universalisHourUrl(date) {
        var page = /-jioni\.html/i.test(window.location.pathname) ? 'vespers' : 'sext';
        var stamp = '' + date.getFullYear()
            + String(date.getMonth() + 1).padStart(2, '0')
            + String(date.getDate()).padStart(2, '0');
        return 'https://universalis.com/' + stamp + '/' + page + '.htm';
    }

    function injectStyles() {
        var css = ''
            + '.lit-day-banner{margin:0 0 1.5rem;padding:1rem 1.25rem;border-radius:12px;'
            + 'background:#f6f8f6;border:1px solid #dfe6df;border-left:5px solid var(--lit-banner-accent,#2E7D32);'
            + 'font-family:inherit;line-height:1.5;}'
            + 'body.dark-mode .lit-day-banner{background:#1f2937;border-color:#374151;color:#e5e7eb;}'
            + '.lit-day-banner .lit-date{font-size:0.85rem;opacity:0.75;margin:0;}'
            + '.lit-day-banner .lit-day{font-size:1.15rem;font-weight:700;margin:0.15rem 0 0;}'
            + '.lit-day-banner .lit-psalter{display:inline-block;font-size:0.8rem;font-weight:600;'
            + 'margin-top:0.4rem;padding:0.15rem 0.6rem;border-radius:999px;'
            + 'background:rgba(46,125,50,0.12);color:#1b5e20;}'
            + 'body.dark-mode .lit-day-banner .lit-psalter{background:rgba(129,199,132,0.15);color:#a5d6a7;}'
            + '.lit-day-banner .lit-celebration{margin-top:0.7rem;padding-top:0.7rem;'
            + 'border-top:1px dashed rgba(0,0,0,0.15);}'
            + 'body.dark-mode .lit-day-banner .lit-celebration{border-top-color:rgba(255,255,255,0.15);}'
            + '.lit-day-banner .lit-rank{font-size:0.75rem;font-weight:700;text-transform:uppercase;'
            + 'letter-spacing:0.05em;opacity:0.85;}'
            + '.lit-day-banner .lit-name{font-size:1.05rem;font-weight:700;margin:0.1rem 0 0;}'
            + '.lit-day-banner .lit-color-dot{display:inline-block;width:0.65em;height:0.65em;'
            + 'border-radius:50%;margin-right:0.4em;border:1px solid rgba(0,0,0,0.25);vertical-align:baseline;}'
            + '.lit-day-banner .lit-note{font-size:0.85rem;margin:0.4rem 0 0;opacity:0.85;font-style:italic;}'
            + '.lit-day-banner .lit-proper-link{display:inline-block;margin-top:0.35rem;font-size:0.85rem;'
            + 'font-weight:600;color:#1d4ed8;text-decoration:underline;}'
            + 'body.dark-mode .lit-day-banner .lit-proper-link{color:#93c5fd;}';
        var style = document.createElement('style');
        style.textContent = css;
        document.head.appendChild(style);
    }

    function render() {
        if (typeof getLiturgicalToday !== 'function' || typeof getCelebrationForDate !== 'function') return;
        var anchor = document.querySelector('h1');
        if (!anchor) return;

        var lang = 'en';
        try {
            if (localStorage.getItem('preferredLanguage') === 'sw') lang = 'sw';
        } catch (e) {}
        var t = LABELS[lang];

        var now = new Date();
        var info = getLiturgicalToday(now, lang);
        var celebration = getCelebrationForDate(now);

        injectStyles();

        var banner = document.createElement('section');
        banner.className = 'lit-day-banner';
        banner.setAttribute('aria-label', lang === 'sw' ? 'Taarifa za siku ya kiliturujia' : 'Liturgical day information');
        var accent = COLOR_DOTS[(celebration && celebration.color) || info.color] || '#2E7D32';
        banner.style.setProperty('--lit-banner-accent', accent);

        var dateStr = now.toLocaleDateString(lang === 'sw' ? 'sw' : 'en-US', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        var html = ''
            + '<p class="lit-date">' + dateStr + '</p>'
            + '<p class="lit-day">' + info.dayLabel + '</p>';
        if (info.psalterWeek) {
            html += '<span class="lit-psalter">' + t.psalter + ' ' + (ROMAN[info.psalterWeek] || info.psalterWeek) + '</span>';
        }

        if (celebration) {
            var rankLabel = t.ranks[celebration.type] || celebration.type;
            var dot = COLOR_DOTS[celebration.color] || COLOR_DOTS.green;
            var isMajor = celebration.type === 'Solemnity' || celebration.type === 'Feast' || celebration.type === 'Triduum';
            html += '<div class="lit-celebration">'
                + '<span class="lit-rank">' + rankLabel + '</span>'
                + '<p class="lit-name"><span class="lit-color-dot" style="background:' + dot + '"></span>'
                + celebration.name + '</p>';
            if (isMajor) {
                html += '<p class="lit-note">' + t.properNote + '</p>'
                    + '<a class="lit-proper-link" target="_blank" rel="noopener" href="'
                    + universalisHourUrl(now) + '">' + t.properLink + '</a>';
            }
            html += '</div>';
        }

        banner.innerHTML = html;
        anchor.insertAdjacentElement('afterend', banner);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', render);
    } else {
        render();
    }
})();

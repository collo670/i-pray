/*
 * universalis-office.js
 * ---------------------------------------------------------------------------
 * Turns a fetched Universalis hour page (Office of Readings, Midday Prayer /
 * Sext, Vespers) into a fragment of liturgical text that can be dropped
 * straight into iPray's own layout.
 *
 * Nothing from the Universalis *site* is meant to survive this: the page
 * header, the hour links, the calendar strip, the QR/app plug boxes, the
 * audio players, the footers, any script/style/link/iframe, any inline
 * event handler and any class that isn't one of the handful Universalis
 * uses to mark up the prayer itself. What comes out is the office only -
 * hymn, psalms with their antiphons, readings, responsories, canticle,
 * intercessions and the concluding prayer - styled by iPray's own
 * `.office-content` rules.
 *
 * The sanitiser is an allow-list, not a block-list: an element, an
 * attribute or a class has to be named here to survive. That way a change
 * on the Universalis side can at worst lose a bit of formatting - it can
 * never leak site chrome, tracking or styling into the app.
 *
 * Used by pages/office-of-readings.html and pages/prayer-hour.html.
 * Exposed as window.UniversalisOffice (no build step; the app loads plain
 * scripts).
 */
(function (global) {
    'use strict';

    var ORIGIN = 'https://universalis.com';

    // Bumped whenever extraction changes shape, so offices cached by an
    // older version of this file are re-fetched instead of re-rendered.
    var EXTRACT_VERSION = 3;

    // ---------------------------------------------------------------------
    // Sanitiser allow-lists
    // ---------------------------------------------------------------------

    // Elements that may appear in the output at all. Anything not listed is
    // either dropped with its subtree (DROP_WITH_CONTENT) or unwrapped, so
    // its text survives even when the wrapper does not.
    var ALLOWED_TAGS = {
        DIV: 1, P: 1, SPAN: 1, BR: 1, HR: 1,
        B: 1, STRONG: 1, I: 1, EM: 1, U: 1, SMALL: 1, SUP: 1, SUB: 1, ABBR: 1,
        H1: 1, H2: 1, H3: 1, H4: 1, H5: 1, H6: 1,
        UL: 1, OL: 1, LI: 1, DL: 1, DT: 1, DD: 1, BLOCKQUOTE: 1,
        TABLE: 1, THEAD: 1, TBODY: 1, TFOOT: 1, TR: 1, TH: 1, TD: 1,
        A: 1
    };

    // Dropped together with everything inside them. Scripts and styles are
    // the security-relevant ones; the media/form/graphic tags are here
    // because Universalis uses them for players, search boxes and logos,
    // none of which are prayer text.
    var DROP_WITH_CONTENT = {
        SCRIPT: 1, STYLE: 1, LINK: 1, META: 1, BASE: 1, TITLE: 1, NOSCRIPT: 1,
        IFRAME: 1, FRAME: 1, FRAMESET: 1, OBJECT: 1, EMBED: 1, APPLET: 1,
        AUDIO: 1, VIDEO: 1, SOURCE: 1, TRACK: 1, CANVAS: 1, SVG: 1, MATH: 1,
        IMG: 1, PICTURE: 1, FIGURE: 1, MAP: 1, AREA: 1,
        FORM: 1, INPUT: 1, BUTTON: 1, SELECT: 1, OPTION: 1, TEXTAREA: 1,
        LABEL: 1, FIELDSET: 1, LEGEND: 1, DATALIST: 1, OUTPUT: 1, PROGRESS: 1,
        TEMPLATE: 1, DIALOG: 1, SLOT: 1, PORTAL: 1, MARQUEE: 1
    };

    // Attributes kept on surviving elements. `id` is deliberately absent:
    // Universalis ids (#texts, #mainheading, #appplug…) would otherwise
    // collide with iPray's own ids and with its CSS. `style` is absent so
    // the Universalis look cannot override the app's typography.
    var ALLOWED_ATTRS = { class: 1, align: 1, valign: 1, colspan: 1, rowspan: 1, lang: 1, dir: 1 };

    // The only classes Universalis uses to mark up the prayer itself. Any
    // other class (site layout, colour themes, ad slots…) is stripped; the
    // element stays, so no text is ever lost to this step.
    var ALLOWED_CLASSES = {
        // verse lines and their runover/indented continuations
        v: 1, vi: 1, vii: 1, viii: 1,
        // prose paragraphs, indented prose, gap-before blocks
        p: 1, pi: 1, pii: 1, gb: 1, gbi: 1,
        // section heading tables ("PSALM 62", "READING", "CANTICLE"…)
        each: 1,
        // rubrics, scripture citations, section rules, closing block
        rubric: 1, boldrubric: 1, smallrubric: 1, redsmall: 1,
        citation: 1, shortrule: 1, lastblock: 1,
        // antiphon / responsory markers
        ant: 1, resp: 1
    };

    // Universalis chrome: ids and classes that are never prayer text. Used
    // before the allow-list runs so their subtrees go in one pass, and so
    // an `#innertexst` that happens to contain a plug box comes out clean.
    var CHROME_SELECTOR = [
        '#overallcontainer', '#mainheading', '#topheading', '#hourlinks',
        '#calendar-heading', '#datename', '#dateblock', '#feastname',
        '#univPageName', '#univQRLink', '#appplug', '#linktomain',
        '#footer', '#pagefooter', '#sitefooter', '#navbar', '#nav',
        '#menu', '#sidebar', '#searchbox', '#cookiebanner', '#cookienotice',
        'header', 'footer', 'nav', 'aside',
        '.toprightbox', '.audioclip', '.audiobox', '.adsbygoogle',
        '.advert', '.advertisement', '.ad', '.banner', '.social',
        '.sharebuttons', '.cookie', '.cookie-notice', '.privacy-notice',
        '.sitenav', '.navigation', '.breadcrumb', '.menu', '.sidebar',
        '.skiplink', '.printonly', '.screenonly'
    ].join(', ');

    // Headings and link-paragraphs that are page controls rather than
    // prayer: the "which psalms do you want" chooser and the conclusion
    // marker Universalis prints above its own footer.
    var CHOOSER_TEXT = /^(Psalms of the day|Complementary psalms|Continue|Back|Top|Next|Previous)$/i;
    var CHOOSER_HEADING = /^(PSALMS OF THE DAY|COMPLEMENTARY PSALMS|CONCLUSION)$/i;

    // Rubrics that are website instructions, not liturgical ones. Genuine
    // rubrics ("The psalms and antiphons are taken from the current
    // weekday", "In Ordinary Time the Te Deum is not said") are kept,
    // because they are part of how the hour is prayed.
    var SITE_RUBRIC = /(click|tap|scroll|browser|website|web site|this page|audio|recording|download|subscribe|app store|google play|copyright|universalis publishing|select .*(option|psalms)|choose .*(option|psalms))/i;

    // ---------------------------------------------------------------------
    // Small helpers
    // ---------------------------------------------------------------------

    function text(node) {
        return String(node == null ? '' : (node.textContent || ''))
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
    }

    function remove(node) {
        if (node && node.parentNode) node.parentNode.removeChild(node);
    }

    function unwrap(node) {
        if (!node || !node.parentNode) return;
        var parent = node.parentNode;
        while (node.firstChild) parent.insertBefore(node.firstChild, node);
        parent.removeChild(node);
    }

    function toArray(list) {
        return Array.prototype.slice.call(list || []);
    }

    // ---------------------------------------------------------------------
    // Sanitising
    // ---------------------------------------------------------------------

    function stripChrome(scope) {
        toArray(scope.querySelectorAll(CHROME_SELECTOR)).forEach(remove);
    }

    function cleanClasses(el) {
        var raw = el.getAttribute('class');
        if (raw == null) return;
        var kept = raw.split(/\s+/).filter(function (c) {
            return c && ALLOWED_CLASSES[c] === 1;
        });
        if (kept.length) el.setAttribute('class', kept.join(' '));
        else el.removeAttribute('class');
    }

    function cleanLink(a) {
        var href = a.getAttribute('href') || '';
        // In-page anchors point at the Universalis page we just threw away,
        // so the link is meaningless here - keep the words, drop the link.
        if (!href || href.charAt(0) === '#' || /^\s*javascript:/i.test(href)) {
            unwrap(a);
            return false;
        }
        if (href.charAt(0) === '/') href = ORIGIN + href;
        if (!/^https?:\/\//i.test(href)) { unwrap(a); return false; }
        a.setAttribute('href', href);
        a.setAttribute('target', '_blank');
        a.setAttribute('rel', 'noopener noreferrer');
        return true;
    }

    // Walks the subtree bottom-up so unwrapping a parent can't skip
    // children that still need cleaning.
    function sanitize(root) {
        toArray(root.querySelectorAll('*')).reverse().forEach(function (el) {
            var tag = el.tagName;

            if (DROP_WITH_CONTENT[tag] === 1) { remove(el); return; }
            if (ALLOWED_TAGS[tag] !== 1) { unwrap(el); return; }

            // Strip every attribute that isn't allow-listed. This is what
            // takes out inline handlers (onclick…), style, data-*,
            // srcset, and any tracking attribute.
            toArray(el.attributes).forEach(function (attr) {
                if (ALLOWED_ATTRS[attr.name.toLowerCase()] !== 1) {
                    el.removeAttribute(attr.name);
                }
            });

            cleanClasses(el);
            if (tag === 'A') cleanLink(el);
        });
    }

    // ---------------------------------------------------------------------
    // Trimming to the office proper
    // ---------------------------------------------------------------------

    // Removes every node that comes before `startNode` in document order,
    // walking up to `root`, so the office starts exactly at its first
    // liturgical section.
    function trimBefore(root, startNode) {
        var current = startNode;
        while (current && current !== root && current.parentNode) {
            while (current.previousSibling) current.parentNode.removeChild(current.previousSibling);
            current = current.parentNode;
        }
    }

    function trimAfter(root, endNode) {
        var current = endNode;
        while (current && current !== root && current.parentNode) {
            while (current.nextSibling) current.parentNode.removeChild(current.nextSibling);
            current = current.parentNode;
        }
    }

    function sectionHeadings(root) {
        return toArray(root.querySelectorAll('table.each th[align="left"]'));
    }

    function tableOf(node) {
        var n = node;
        while (n && n.tagName !== 'TABLE') n = n.parentNode;
        return n;
    }

    // The office always opens with INTRODUCTION; if that heading is missing
    // (Universalis varies a little by season and by hour) fall back to the
    // first section heading of any kind, and only then to the first verse.
    function findStart(root) {
        var heads = sectionHeadings(root);
        for (var i = 0; i < heads.length; i++) {
            if (/^INTRODUCTION$/i.test(text(heads[i]))) return tableOf(heads[i]);
        }
        if (heads.length) return tableOf(heads[0]);
        return root.querySelector('.v, .p, .gb');
    }

    // Anything after the office's own last line is Universalis' page tail
    // (app plug, QR box, footer). The closing line is either the
    // `.lastblock` dismissal ("Let us praise the Lord. - Thanks be to
    // God.") or, when there's no such block, the Amen of the concluding
    // prayer. Looking for the *last* of these means the psalmody,
    // canticle and readings above can never be caught by the trim.
    var CLOSING_LINE = /^(Amen\.?|Amen\.\s*Alleluia\.?|Thanks be to God\.?|Deo gratias\.?|Alleluia\.?)$/i;

    function findEnd(root) {
        var blocks = toArray(root.querySelectorAll('.lastblock'));
        if (blocks.length) return blocks[blocks.length - 1];

        var lines = toArray(root.querySelectorAll('.v, .vi, .p, .pi, .gb'));
        for (var i = lines.length - 1; i >= 0; i--) {
            if (CLOSING_LINE.test(text(lines[i]))) return lines[i];
        }
        return null;
    }

    // ---------------------------------------------------------------------
    // Office-specific tidying
    // ---------------------------------------------------------------------

    function dropChoosers(root) {
        // "Psalms of the day / Complementary psalms" switcher: a heading
        // plus a paragraph of in-page links. Universalis already serves
        // the psalms of the day inline, so only the control goes.
        toArray(root.querySelectorAll('p')).forEach(function (p) {
            var links = p.querySelectorAll('a[href]');
            var allInPage = links.length > 0 && toArray(links).every(function (a) {
                return (a.getAttribute('href') || '').charAt(0) === '#';
            });
            if (allInPage && CHOOSER_TEXT.test(text(p))) remove(p);
        });
        toArray(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(function (h) {
            if (CHOOSER_HEADING.test(text(h))) remove(h);
        });
        // A lone "OR:" left behind once an alternative block is gone.
        toArray(root.querySelectorAll('.boldrubric')).forEach(function (n) {
            if (/^OR:?$/i.test(text(n))) remove(n);
        });
    }

    function dropSiteRubrics(root) {
        toArray(root.querySelectorAll('.rubric, .smallrubric')).forEach(function (n) {
            if (SITE_RUBRIC.test(text(n))) remove(n);
        });
    }

    // Universalis lays the office out in `table.each` blocks; any other
    // table on the page is layout scaffolding. It's only removed when it
    // holds no prayer lines, so a reading that happens to sit in a plain
    // table is never thrown away.
    function dropLayoutTables(root) {
        toArray(root.querySelectorAll('table')).forEach(function (table) {
            if (table.classList && table.classList.contains('each')) return;
            if (table.querySelector('.v, .vi, .p, .pi, .gb')) return;
            remove(table);
        });
    }

    function dropEmptyBlocks(root) {
        toArray(root.querySelectorAll('p, div, span')).forEach(function (n) {
            if (n.querySelector('table, hr, p, div, br')) return;
            if (text(n) === '') remove(n);
        });
    }

    // ---------------------------------------------------------------------
    // Post-processing (also applied to cached offices)
    // ---------------------------------------------------------------------

    function postProcessNode(root, hourKey) {
        dropSiteRubrics(root);
        dropLayoutTables(root);
        dropChoosers(root);

        // Midday Prayer ends at the concluding prayer; the `.lastblock`
        // tail Universalis appends belongs to the longer hours.
        if (hourKey === 'sext') {
            toArray(root.querySelectorAll('.lastblock')).forEach(remove);
        }

        var start = findStart(root);
        if (start) trimBefore(root, start);

        var end = findEnd(root);
        if (end) trimAfter(root, end);

        dropEmptyBlocks(root);
        return root;
    }

    function postProcessHtml(htmlStr, hourKey) {
        var wrapper = global.document.createElement('div');
        wrapper.innerHTML = htmlStr || '';
        postProcessNode(wrapper, hourKey);
        return wrapper.innerHTML;
    }

    // ---------------------------------------------------------------------
    // Entry point
    // ---------------------------------------------------------------------

    /**
     * Extract the liturgical body of a Universalis hour page.
     *
     * @param {string} html    raw page source as fetched
     * @param {string} hourKey 'readings' | 'sext' | 'vespers'
     * @returns {string|null}  sanitised HTML fragment, or null when the
     *                         page held no office (redirect, error page,
     *                         proxy error body…)
     */
    function extract(html, hourKey) {
        var doc = new global.DOMParser().parseFromString(String(html || ''), 'text/html');

        // Kill scripts and styles before anything else reads the tree.
        toArray(doc.querySelectorAll('script, style, link, iframe, object, embed, form')).forEach(remove);

        // The text container is located *before* chrome is stripped: the
        // chrome selectors match its ancestors (#overallcontainer wraps
        // the whole page, texts included), so stripping first would throw
        // the office away with the wrapper.
        var root = doc.getElementById('innertexst') || doc.getElementById('texts');
        if (root && root.id === 'texts') {
            var nested = root.querySelector('#innertexst');
            if (nested) root = nested;
        }
        // No recognised container, or a container with no prayer lines in
        // it, means this isn't an office page - let the caller fall back.
        if (!root || !root.querySelector('.v, .p, .gb')) return null;

        // Work on a detached copy so nothing in the source document can be
        // re-read after sanitising.
        var work = global.document.createElement('div');
        work.innerHTML = root.innerHTML;

        stripChrome(work);
        sanitize(work);
        postProcessNode(work, hourKey);

        if (!work.querySelector('.v, .p, .gb')) return null;
        return work.innerHTML;
    }

    /**
     * True if `htmlStr` still looks like a whole Universalis page rather
     * than an extracted office - used to throw away caches written by an
     * earlier version of the app.
     */
    function looksLikeFullPage(htmlStr) {
        return /id=["']?(mainheading|overallcontainer|hourlinks|texts|appplug)|<script|<iframe|universalis\.com\/[a-z]/i
            .test(String(htmlStr || ''));
    }

    global.UniversalisOffice = {
        VERSION: EXTRACT_VERSION,
        extract: extract,
        postProcessHtml: postProcessHtml,
        looksLikeFullPage: looksLikeFullPage,
        ORIGIN: ORIGIN
    };
})(typeof window !== 'undefined' ? window : this);

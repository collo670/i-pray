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
    var EXTRACT_VERSION = 6;

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

    // Block-level rubrics are instructions about the hour ("The hymn may be
    // taken from…", "Choose which celebration…", the italic psalm captions)
    // rather than words that are prayed, so they are dropped. These few are
    // the exceptions: short labels or abbreviated prayers that are said.
    var KEPT_RUBRIC = /^(psalm[- ]?prayer|let us pray\.?|(the )?lord'?s prayer|our father\b.*|ant\.?\s*\d*\b.*|[\u2123\u211f]\.?.*)$/i;

    // Page information Universalis prints in and around the office: the
    // date and celebration lines, "Year / Psalm week / Liturgical Colour",
    // the celebration and hour pickers, copyright and translation notes and
    // the app plug. Only ever matched against blocks that hold no prayer
    // lines (see dropMetaBlocks), so a psalm verse can't be caught by it.
    // "listen" is only matched as part of an audio prompt: on its own it
    // would also catch a prayer ("Listen to my prayer, O Lord").
    var META_TEXT = /(copyright|\u00a9|all rights reserved|universalis|psalm week|liturgical colou?r|^year\s*:|today'?s options|other hours|choose which|you can also|see also|this page|click|tap here|browser|website|download|subscribe|app store|google play|listen (to )?(this|the) (hour|office|audio|recording)|listen (online|now|again)|audio|recording|jerusalem bible|grail|icel|international commission|translation|texts? (are|from|of)|^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\b.*\b(19|20)\d\d$)/i;

    // Prayer lines get a much narrower test: only a copyright or publisher
    // notice that happens to be styled as a paragraph of text.
    var META_LINE = /(copyright|\u00a9|all rights reserved|universalis publishing|universalis apps?)/i;

    // Headings of the parts of an hour, used to find where the office
    // starts when INTRODUCTION is missing.
    var OFFICE_HEADING = /^(introduction|invitatory|hymn|psalmody|psalm|canticle|(short |scripture |first |second )?reading|(short )?responsory|benedictus|magnificat|gospel canticle|(prayers and )?intercessions|prayers|(the )?lord'?s prayer|our father|concluding prayer|prayer|te deum|conclusion|dismissal)\b/i;

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

    // Links in the office lead back into the Universalis site (other hours,
    // the psalm and Bible pages, in-page anchors to the page we just threw
    // away). None of that belongs in the prayer, so every link becomes its
    // plain text.
    function cleanLink(a) {
        unwrap(a);
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

    // Section headings come as `table.each` header cells, as h1-h6 or as a
    // bold rubric, depending on the hour and the season.
    var HEADING_SELECTOR = 'table.each th[align="left"], h1, h2, h3, h4, h5, h6, .boldrubric';

    function sectionHeadings(root) {
        return toArray(root.querySelectorAll(HEADING_SELECTOR));
    }

    function tableOf(node) {
        var n = node;
        while (n && n.tagName !== 'TABLE') n = n.parentNode;
        return n;
    }

    // The office always opens with INTRODUCTION; if that heading is missing
    // (Universalis varies a little by season and by hour) fall back to the
    // first section heading of any kind, and only then to the first verse.
    function headingBlock(head) {
        return head.tagName === 'TH' ? tableOf(head) : head;
    }

    function findStart(root) {
        var heads = sectionHeadings(root);
        for (var i = 0; i < heads.length; i++) {
            if (/^INTRODUCTION$/i.test(text(heads[i]))) return headingBlock(heads[i]);
        }
        for (var j = 0; j < heads.length; j++) {
            if (OFFICE_HEADING.test(text(heads[j]))) return headingBlock(heads[j]);
        }
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
        // plus paragraphs of in-page links. Universalis already serves the
        // psalms of the day inline, so only the control goes. By the time
        // this runs sanitize() has already unwrapped the links, so the
        // paragraphs are matched on their text alone - but never a prayer
        // line, only a bare paragraph.
        toArray(root.querySelectorAll('p, div')).forEach(function (p) {
            if (isLine(p) || hasLines(p)) return;
            if (CHOOSER_TEXT.test(text(p))) remove(p);
        });
        toArray(root.querySelectorAll('h1, h2, h3, h4, h5, h6')).forEach(function (h) {
            if (CHOOSER_HEADING.test(text(h))) remove(h);
        });
        // A lone "OR:" left behind once an alternative block is gone.
        toArray(root.querySelectorAll('.boldrubric')).forEach(function (n) {
            if (/^OR:?$/i.test(text(n))) remove(n);
        });
    }

    // Midday Prayer: Universalis prints both the psalms of the day and the
    // complementary (gradual) psalmody on the one page, each under its own
    // heading, with in-page links to jump over the set that isn't wanted.
    // dropChoosers() removes those headings and links as page controls,
    // which used to leave the two sets running on as one long psalmody.
    // The psalms of the day are what is prayed when one daytime hour is
    // said, so the complementary set goes - from its heading up to the
    // next section (CONCLUSION, the reading, or the psalms of the day when
    // the complementary set comes first). If that next section can't be
    // found among the following siblings, nothing is removed.
    var COMPLEMENTARY_HEADING = /^complementary psalm(s|ody):?$/i;
    var AFTER_COMPLEMENTARY = /^(psalms of the day|conclusion|(short |scripture )?reading|(short )?responsory|concluding prayer|prayer)\b/i;

    function startsSectionAfterComplementary(el) {
        if (el.nodeType !== 1) return false;
        var heads = toArray(el.querySelectorAll(HEADING_SELECTOR));
        if (el.matches && el.matches(HEADING_SELECTOR)) heads.unshift(el);
        return heads.some(function (h) { return AFTER_COMPLEMENTARY.test(text(h)); });
    }

    function dropComplementaryPsalmody(root) {
        var head = sectionHeadings(root).filter(function (h) {
            return COMPLEMENTARY_HEADING.test(text(h));
        })[0];
        if (!head) return;
        var start = headingBlock(head);
        var doomed = [start];
        for (var n = start.nextSibling; n; n = n.nextSibling) {
            if (startsSectionAfterComplementary(n)) {
                doomed.forEach(remove);
                return;
            }
            doomed.push(n);
        }
    }

    // Drops rubric *blocks* - instructions, captions, site notes. A rubric
    // span inside a prayer line (the red "Ant." or "℟.") is part of that
    // line and stays.
    function dropRubricBlocks(root) {
        toArray(root.querySelectorAll('.rubric, .smallrubric, .redsmall')).forEach(function (n) {
            if (!/^(P|DIV|TD|LI|DD|BLOCKQUOTE)$/.test(n.tagName)) return;
            if (n.parentNode && n.parentNode.closest && n.parentNode.closest(LINE_SELECTOR)) return;
            if (hasLines(n)) return;
            if (KEPT_RUBRIC.test(text(n))) return;
            remove(n);
        });
    }

    // Date and celebration headings, "Year / Psalm week / Colour", copyright
    // and translation notes, "Other hours" and similar page information. The
    // app prints its own date banner and hour heading, so none of it is
    // needed - and it is not prayer.
    function dropMetaBlocks(root) {
        toArray(root.querySelectorAll('p, div, h1, h2, h3, h4, h5, h6, li, dl, ul, ol, blockquote'))
            .forEach(function (n) {
                if (!n.parentNode) return;
                var t = text(n);
                if (!t) return;
                if (isLine(n)) {
                    if (META_LINE.test(t) && !hasLines(n)) remove(n);
                    return;
                }
                if (hasLines(n)) return;
                if (OFFICE_HEADING.test(t) && /^H[1-6]$/.test(n.tagName)) return;
                if (META_TEXT.test(t)) remove(n);
            });
    }

    // Lines made of nothing but links ("Tuesday of week 27 | Saint Bruno",
    // "Lauds | Midday | Vespers", "Terce · None") are site navigation. Runs
    // before sanitize(), which turns every link into plain text.
    function dropLinkBlocks(root) {
        toArray(root.querySelectorAll('p, div, li, td, h1, h2, h3, h4, h5, h6')).forEach(function (n) {
            if (!n.parentNode || isLine(n) || hasLines(n)) return;
            var links = toArray(n.querySelectorAll('a'));
            if (!links.length) return;
            var rest = text(n);
            links.forEach(function (a) {
                var t = text(a);
                if (t) rest = rest.split(t).join(' ');
            });
            if (!/[A-Za-z0-9]/.test(rest.replace(/\b(or|and)\b/gi, ''))) remove(n);
        });
    }

    // A rule or break left with no prayer on one side of it - at the very
    // top or bottom, or doubled up where a block in between was dropped.
    function dropStrayRules(root) {
        toArray(root.querySelectorAll('hr')).forEach(function (hr) {
            var prev = hr.previousElementSibling;
            if (prev && prev.tagName === 'HR') remove(hr);
        });
        var first;
        while ((first = root.firstElementChild) && /^(HR|BR)$/.test(first.tagName)) remove(first);
        var last;
        while ((last = root.lastElementChild) && /^(HR|BR)$/.test(last.tagName)) remove(last);
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

    var LINE_SELECTOR = '.v, .vi, .vii, .viii, .p, .pi, .pii, .gb, .gbi';

    function lineCount(node) {
        return node.querySelectorAll(LINE_SELECTOR).length;
    }

    function isLine(node) {
        return !!(node.matches && node.matches(LINE_SELECTOR));
    }

    function hasLines(node) {
        return !!node.querySelector(LINE_SELECTOR);
    }

    // Every tidying step below is a heuristic about Universalis' markup, and
    // Universalis does not use identical markup for every hour or every
    // season. A step that is right for Midday Prayer can be wrong for
    // Vespers, and the failure mode used to be silent and total: the step
    // emptied the office, extract() returned null, and the page reported it
    // as if the network had failed.
    //
    // So each step runs behind this guard. If it removes all the prayer
    // lines - or more than half of them, which always means the heuristic
    // misfired rather than that it trimmed some chrome - the step is rolled
    // back and the office is rendered without it. Losing a bit of tidying is
    // always better than losing the office.
    function guard(root, name, step, log) {
        var before = lineCount(root);
        if (!before) return;
        var snapshot = root.innerHTML;

        try {
            step(root);
        } catch (e) {
            root.innerHTML = snapshot;
            log.push(name + ': threw (' + e.message + '), rolled back');
            return;
        }

        var after = lineCount(root);
        if (after === 0 || after * 2 < before) {
            root.innerHTML = snapshot;
            log.push(name + ': removed ' + (before - after) + '/' + before + ' lines, rolled back');
        } else if (after !== before) {
            log.push(name + ': ' + before + ' -> ' + after + ' lines');
        }
    }

    function postProcessNode(root, hourKey, log) {
        log = log || [];

        // Runs first: later steps (dropChoosers, dropRubricBlocks) remove
        // the headings it finds the complementary psalmody by.
        if (hourKey === 'sext') {
            guard(root, 'dropComplementaryPsalmody', dropComplementaryPsalmody, log);
        }

        // Midday Prayer and Vespers render as prayer text only. The Office
        // of Readings keeps its rubrics, which there carry the sources of
        // the readings.
        if (hourKey === 'sext' || hourKey === 'vespers') {
            guard(root, 'dropRubricBlocks', dropRubricBlocks, log);
        }
        guard(root, 'dropMetaBlocks', dropMetaBlocks, log);
        guard(root, 'dropLayoutTables', dropLayoutTables, log);
        guard(root, 'dropChoosers', dropChoosers, log);

        // Midday Prayer ends at the concluding prayer; the `.lastblock`
        // tail Universalis appends belongs to the longer hours.
        if (hourKey === 'sext') {
            guard(root, 'dropLastblock', function (r) {
                toArray(r.querySelectorAll('.lastblock')).forEach(remove);
            }, log);
        }

        guard(root, 'trimBefore', function (r) {
            var start = findStart(r);
            if (start && r.contains(start)) trimBefore(r, start);
        }, log);

        guard(root, 'trimAfter', function (r) {
            var end = findEnd(r);
            if (end && r.contains(end)) trimAfter(r, end);
        }, log);

        guard(root, 'dropEmptyBlocks', dropEmptyBlocks, log);
        guard(root, 'dropStrayRules', dropStrayRules, log);
        return root;
    }

    function postProcessHtml(htmlStr, hourKey) {
        var wrapper = global.document.createElement('div');
        wrapper.innerHTML = htmlStr || '';
        var before = wrapper.innerHTML;
        postProcessNode(wrapper, hourKey, []);
        // Cached offices are already extracted; if re-tidying them somehow
        // empties the card, give back what was cached rather than nothing.
        if (!lineCount(wrapper)) return before;
        return wrapper.innerHTML;
    }

    // ---------------------------------------------------------------------
    // Entry point
    // ---------------------------------------------------------------------

    // Universalis' text container is #innertexst inside #texts, but that has
    // not always been true and is not guaranteed to stay true. If neither id
    // is there, fall back to whichever element in the document holds the most
    // prayer lines while being as deep as possible - i.e. the tightest
    // wrapper around the office.
    function findContainer(doc) {
        var byId = doc.getElementById('innertexst') || doc.getElementById('texts');
        if (byId) {
            var nested = byId.querySelector('#innertexst');
            if (nested) byId = nested;
            if (lineCount(byId)) return byId;
        }

        var best = null, bestCount = 0;
        toArray(doc.querySelectorAll('div, td, section, article, main')).forEach(function (el) {
            var n = lineCount(el);
            if (n < 3) return;
            // Prefer the deepest element that still holds (nearly) all the
            // lines its ancestors hold, so we get the office and not <body>.
            if (n > bestCount || (n === bestCount && best && best.contains(el))) {
                best = el;
                bestCount = n;
            }
        });
        return best;
    }

    /**
     * Extract the liturgical body of a Universalis hour page.
     *
     * @param {string} html    raw page source as fetched
     * @param {string} hourKey 'readings' | 'sext' | 'vespers'
     * @param {Array}  [log]   optional array; step-by-step notes are pushed
     *                         onto it for diagnostics
     * @returns {string|null}  sanitised HTML fragment, or null only when the
     *                         page genuinely held no office (redirect, error
     *                         page, proxy error body...)
     */
    function extract(html, hourKey, log) {
        log = log || [];
        var doc = new global.DOMParser().parseFromString(String(html || ''), 'text/html');

        // Kill scripts and styles before anything else reads the tree.
        toArray(doc.querySelectorAll('script, style, link, iframe, object, embed, form')).forEach(remove);

        // The text container is located *before* chrome is stripped: the
        // chrome selectors match its ancestors (#overallcontainer wraps
        // the whole page, texts included), so stripping first would throw
        // the office away with the wrapper.
        var root = findContainer(doc);
        if (!root) {
            log.push('no container with prayer lines found (' + String(html || '').length + ' bytes fetched)');
            return null;
        }
        log.push('container <' + root.tagName.toLowerCase() +
            (root.id ? ' id=' + root.id : '') + '> with ' + lineCount(root) + ' lines');

        // Work on a detached copy so nothing in the source document can be
        // re-read after sanitising.
        var work = global.document.createElement('div');
        work.innerHTML = root.innerHTML;

        guard(work, 'stripChrome', stripChrome, log);
        guard(work, 'dropLinkBlocks', dropLinkBlocks, log);
        guard(work, 'sanitize', sanitize, log);

        if (!lineCount(work)) {
            log.push('sanitising left no prayer lines');
            return null;
        }

        // Keep the sanitised-but-untrimmed text as a floor. Everything after
        // this point is presentation tidying, and none of it is worth
        // failing the whole hour over.
        var floor = work.innerHTML;

        postProcessNode(work, hourKey, log);

        if (!lineCount(work)) {
            log.push('post-processing emptied the office; falling back to untrimmed text');
            work.innerHTML = floor;
        }

        log.push('rendered ' + lineCount(work) + ' lines');
        return work.innerHTML;
    }

    /**
     * Run extraction purely for its step log. Returns { ok, lines, log }.
     * Used by scripts/diagnose-universalis.js.
     */
    function diagnose(html, hourKey) {
        var log = [];
        var out = extract(html, hourKey, log);
        return {
            ok: out !== null,
            bytes: String(html || '').length,
            lines: out === null ? 0 : (function () {
                var d = global.document.createElement('div');
                d.innerHTML = out;
                return lineCount(d);
            })(),
            log: log
        };
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
        diagnose: diagnose,
        postProcessHtml: postProcessHtml,
        looksLikeFullPage: looksLikeFullPage,
        ORIGIN: ORIGIN
    };
})(typeof window !== 'undefined' ? window : this);

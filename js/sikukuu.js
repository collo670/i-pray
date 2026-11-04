(function () {
    'use strict';

    // The psalmody: the three psalms and canticles after the hymn ("Zab. 43",
    // "Zaburi 63:1-8", "WIMBO: Isa.38:10-14", "WIMBO Isa. 61:10 - 62:5"...).
    // Not Psalm 95, the invitatory, which is the same on every page, and not
    // the Benedictus (WIMBO WA ZAKARIA).
    function isPsalmSection(section) {
        const heading = section.querySelector(':scope > h2');
        if (!heading) return false;
        const text = heading.textContent.replace(/\s+/g, ' ').trim();
        if (/^Zab(?:uri)?\.?\s*95\b/i.test(text) || /^WIMBO WA ZAKARIA\b/i.test(text)) return false;
        return /^(?:Zab(?:uri)?\b|WIMBO\b)/i.test(text);
    }

    function psalmEndIndex(section) {
        const children = Array.from(section.childNodes);
        let end = -1;

        children.forEach(function (node, index) {
            if (node.nodeType === 1 && node.matches('.antiphon, .response')) end = index;
        });

        return end === -1 ? children.length - 1 : end;
    }

    function psalmNodes(section) {
        return Array.from(section.childNodes)
            .slice(0, psalmEndIndex(section) + 1)
            .map(function (node) { return node.cloneNode(true); });
    }

    function trailingNodes(section) {
        return Array.from(section.childNodes)
            .slice(psalmEndIndex(section) + 1);
    }

    function replacePsalmSections(currentContainer, sundayContainer) {
        const currentSections = Array.from(currentContainer.querySelectorAll('.container > .prayer-section'))
            .filter(isPsalmSection);
        const sundaySections = Array.from(sundayContainer.querySelectorAll('.container > .prayer-section'))
            .filter(isPsalmSection);

        if (!currentSections.length || !sundaySections.length) return;

        let extraTail = [];

        currentSections.forEach(function (section, index) {
            const tail = trailingNodes(section);

            if (index >= sundaySections.length) {
                section.replaceChildren();
                if (tail.length) section.append.apply(section, tail);
                else section.remove();
                return;
            }

            section.replaceChildren.apply(section, psalmNodes(sundaySections[index]));

            if (index === currentSections.length - 1 && sundaySections.length > currentSections.length) {
                extraTail = tail;
            } else {
                section.append.apply(section, tail);
            }
        });

        if (sundaySections.length <= currentSections.length) return;

        const lastSection = currentSections[currentSections.length - 1];
        const additionalSections = sundaySections.slice(currentSections.length).map(function (section) {
            const copy = section.cloneNode(false);
            copy.append.apply(copy, psalmNodes(section));
            return copy;
        });

        let tailSection = null;
        if (extraTail.length) {
            tailSection = lastSection.cloneNode(false);
            tailSection.append.apply(tailSection, extraTail);
        }

        lastSection.after.apply(lastSection, additionalSections.concat(tailSection ? [tailSection] : []));
    }

    // The antiphon lines that go with a psalm section's psalm, in runs of
    // consecutive <p class="antiphon">: the one before the psalm and the one
    // after it. Stops at a second heading (Jumapili I's last psalm section
    // also holds the reading).
    function psalmAntiphonRuns(section) {
        const runs = [];
        let headings = 0;
        for (const el of Array.from(section.children)) {
            if (el.tagName === 'H2' && ++headings > 1) break;
            if (!el.matches('p.antiphon')) continue;
            const run = runs[runs.length - 1];
            if (run && run[run.length - 1].nextElementSibling === el) run.push(el);
            else runs.push([el]);
        }
        return runs;
    }

    // "ANT. II" when an antiphon line starts with that heading.
    function antiphonHeading(p) {
        const first = p.innerHTML.split(/<br[^>]*>/i)[0].trim();
        return /^ANT\.?\s*[IVX]+\.?$/i.test(first) ? first : null;
    }

    function antiphonLine(text, className) {
        const p = document.createElement('p');
        p.className = className;
        p.textContent = text;
        return p;
    }

    // The day's own antiphons (js/sikukuu-antiphons.js) before and after
    // each psalm, in place of every seasonal antiphon the psalm came with.
    // js/masifu.js leaves lines marked .ant-proper alone.
    function applyProperAntiphons(container, proper) {
        const sections = Array.from(container.querySelectorAll('.container > .prayer-section'))
            .filter(isPsalmSection);
        sections.slice(0, proper.antiphons.length).forEach(function (section, index) {
            const text = 'Ant. ya ' + proper.rank + ' (' + proper.name + '): ' + proper.antiphons[index];
            psalmAntiphonRuns(section).forEach(function (run) {
                const heading = antiphonHeading(run[0]);
                const lines = heading ? [antiphonLine(heading, 'antiphon')] : [];
                lines.push(antiphonLine(text, 'antiphon ant-proper'));
                run[0].before.apply(run[0], lines);
                run.forEach(function (el) { el.remove(); });
            });
        });
    }

    // The day the page is for: the day chosen in Settings, or today, as in
    // js/masifu.js.
    function prayerDay() {
        return window.IPrayDay ? window.IPrayDay.today() : new Date();
    }

    async function applySikukuuPsalms() {
        const calendar = window.LiturgicalCalendar;
        const container = document.querySelector('.container');
        if (!calendar || typeof calendar.celebrationFor !== 'function' || !container) return;

        const day = prayerDay();
        const celebration = calendar.celebrationFor(day);
        if (!celebration || (celebration.type !== 'Feast' && celebration.type !== 'Solemnity')) return;

        // Jumapili I already has the psalms; every other page fetches them.
        const sundayUrl = new URL('jumapili1.html', window.location.href);
        if (sundayUrl.pathname !== window.location.pathname) {
            try {
                const response = await fetch(sundayUrl);
                if (!response.ok) throw new Error('Could not load Sunday 1 psalms');

                const html = await response.text();
                const sundayDocument = new DOMParser().parseFromString(html, 'text/html');
                replacePsalmSections(container, sundayDocument);
            } catch (error) {
                // The page keeps its own psalms, so not the feast's antiphons either.
                console.error('Unable to apply feast-day psalms:', error);
                return;
            }
        }

        const proper = window.IPraySikukuuAntiphons && window.IPraySikukuuAntiphons.forDate(day, calendar);
        if (proper) applyProperAntiphons(container, proper);
    }

    function start() {
        window.sikukuuReady = applySikukuuPsalms();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', start, { once: true });
    } else {
        start();
    }
}());
(function () {
    'use strict';

    function isPsalmSection(section) {
        const heading = section.querySelector(':scope > h2');
        return heading && /^(?:Zab(?:uri)?\b|WIMBO:\s*Dan\b)/i.test(heading.textContent.trim());
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

    async function applySikukuuPsalms() {
        const calendar = window.LiturgicalCalendar;
        const container = document.querySelector('.container');
        if (!calendar || typeof calendar.celebrationFor !== 'function' || !container) return;

        const celebration = calendar.celebrationFor(new Date());
        if (!celebration || (celebration.type !== 'Feast' && celebration.type !== 'Solemnity')) return;

        const sundayUrl = new URL('jumapili1.html', window.location.href);
        if (sundayUrl.pathname === window.location.pathname) return;

        try {
            const response = await fetch(sundayUrl);
            if (!response.ok) throw new Error('Could not load Sunday 1 psalms');

            const html = await response.text();
            const sundayDocument = new DOMParser().parseFromString(html, 'text/html');
            replacePsalmSections(container, sundayDocument);
        } catch (error) {
            console.error('Unable to apply feast-day psalms:', error);
        }
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
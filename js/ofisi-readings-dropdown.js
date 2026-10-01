(function () {
    'use strict';

    var DAY_KEYS = ['dominika', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
    var trigger = document.querySelector('.ofisi-link');
    var panel = trigger && trigger.parentElement.nextElementSibling;

    if (!trigger || !panel) return;

    function setStatus(message) {
        var status = document.createElement('p');
        status.className = 'reading ofisi-reading-status';
        status.textContent = message;
        panel.replaceChildren(status);
    }

    function findDay(days, targetKey) {
        if (days[targetKey]) return days[targetKey];

        var index = DAY_KEYS.indexOf(targetKey);
        for (var offset = 1; offset < DAY_KEYS.length; offset++) {
            var earlier = days[DAY_KEYS[(index - offset + DAY_KEYS.length) % DAY_KEYS.length]];
            var later = days[DAY_KEYS[(index + offset) % DAY_KEYS.length]];
            if (earlier) return earlier;
            if (later) return later;
        }
        return null;
    }

    function addReading(title, paragraphs) {
        var section = document.createElement('section');
        section.className = 'reading ofisi-reading';

        var heading = document.createElement('h2');
        heading.textContent = title;
        section.appendChild(heading);

        paragraphs.forEach(function (item) {
            var paragraph = document.createElement('p');
            if (item.className) paragraph.className = item.className;
            paragraph.textContent = item.text;
            section.appendChild(paragraph);
        });

        panel.appendChild(section);
        return section;
    }

    function addResponsory(section, responsory) {
        if (!responsory || !responsory.verses || !responsory.verses.length) return;

        var heading = document.createElement('h3');
        heading.textContent = 'KIITIKIZANO';
        section.appendChild(heading);

        if (responsory.citation) {
            var citation = document.createElement('p');
            citation.className = 'reading-ref';
            citation.textContent = responsory.citation;
            section.appendChild(citation);
        }

        responsory.verses.forEach(function (verse) {
            var paragraph = document.createElement('p');
            paragraph.className = verse.speaker === 'K' ? 'leader' : 'response';
            paragraph.textContent = (verse.speaker ? verse.speaker + '. ' : '') + verse.text;
            section.appendChild(paragraph);
        });
    }

    function renderReadings(dayData) {
        panel.replaceChildren();
        var firstReading = addReading('SOMO LA KWANZA', [
            { className: 'sw-citation reading-ref', text: dayData.firstReading.citation }
        ]);
        addResponsory(firstReading, dayData.responsory1);

        var secondReading = addReading('SOMO LA PILI', [
            { className: 'reading-ref', text: dayData.secondReading.source || '' }
        ].concat((dayData.secondReading.paragraphs || []).map(function (text) {
            return { text: text };
        })));
        addResponsory(secondReading, dayData.responsory2);

        if (window.SomoLaKwanzaBible && window.SomoLaKwanzaBible.init) {
            window.SomoLaKwanzaBible.init();
        }
    }

    function loadReadings() {
        if (panel.dataset.loaded === 'loading' || panel.dataset.loaded === 'loaded') return;
        panel.dataset.loaded = 'loading';
        setStatus('Inapakia masomo...');

        var calendar = window.LiturgicalCalendar;
        if (!calendar || !calendar.today) {
            panel.dataset.loaded = 'error';
            setStatus('Kalenda ya liturujia haipatikani kwa sasa.');
            return;
        }

        var today = new Date();
        var info = calendar.today(today, 'sw');
        if (info.season !== 'Ordinary Time' || !info.weekNum || info.weekNum > 34) {
            panel.dataset.loaded = 'error';
            setStatus('Masomo haya ya Kiswahili hayapatikani kwa kipindi hiki cha liturujia.');
            return;
        }

        fetch('../data/office-readings-sw/week-' + info.weekNum + '.json')
            .then(function (response) {
                if (!response.ok) throw new Error('Reading data unavailable');
                return response.json();
            })
            .then(function (weekData) {
                var dayData = findDay(weekData.days || {}, DAY_KEYS[today.getDay()]);
                if (!dayData || !dayData.firstReading || !dayData.secondReading) {
                    throw new Error('Readings unavailable');
                }
                renderReadings(dayData);
                panel.dataset.loaded = 'loaded';
            })
            .catch(function () {
                panel.dataset.loaded = 'error';
                setStatus('Imeshindikana kupakia masomo kwa sasa. Tafadhali jaribu tena.');
            });
    }

    trigger.setAttribute('aria-expanded', 'false');
    trigger.addEventListener('click', function () {
        var open = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        if (open) loadReadings();
    });
})();
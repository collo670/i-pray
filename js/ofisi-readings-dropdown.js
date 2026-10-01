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

    function createPrayerTimer() {
        var duration = 15 * 60;
        var remaining = duration;
        var deadline = 0;
        var interval = null;
        var cancelAlarm = null;
        var state = 'idle';
        var timer = document.createElement('div');
        timer.className = 'masifu-prayer-timer';

        var details = document.createElement('div');
        details.className = 'masifu-prayer-timer-details';
        var label = document.createElement('p');
        label.className = 'masifu-prayer-timer-label';
        label.textContent = 'SALA YA KIMYA';
        var display = document.createElement('div');
        display.className = 'masifu-prayer-timer-display';
        display.setAttribute('role', 'timer');
        display.setAttribute('aria-live', 'off');

        var button = document.createElement('button');
        button.className = 'masifu-prayer-timer-start';
        button.type = 'button';
        button.setAttribute('aria-label', 'Start 15 minute timer');
        button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg><span>START</span>';
        var stopButton = document.createElement('button');
        stopButton.className = 'masifu-prayer-timer-stop';
        stopButton.type = 'button';
        stopButton.setAttribute('aria-label', 'Stop timer and reset');
        stopButton.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6h12v12H6z"></path></svg><span>STOP</span>';
        stopButton.hidden = true;
        var actions = document.createElement('div');
        actions.className = 'masifu-prayer-timer-actions';
        actions.appendChild(button);
        actions.appendChild(stopButton);
        details.appendChild(label);
        details.appendChild(display);
        timer.appendChild(details);
        timer.appendChild(actions);

        function formatTime(seconds) {
            var minutes = Math.floor(seconds / 60);
            var remainder = seconds % 60;
            return String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0');
        }

        function setButtonState(icon, text, accessibleLabel, showStop) {
            var path = icon === 'pause'
                ? '<path d="M7 5h4v14H7zm6 0h4v14h-4z"></path>'
                : icon === 'stop'
                    ? '<path d="M6 6h12v12H6z"></path>'
                    : '<path d="M8 5v14l11-7z"></path>';
            button.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true">' + path + '</svg><span>' + text + '</span>';
            button.setAttribute('aria-label', accessibleLabel);
            stopButton.hidden = !showStop;
        }

        function scheduleAlarm(endTime) {
            var AudioContextType = window.AudioContext || window.webkitAudioContext;
            if (!AudioContextType) return null;

            var context = null;
            var oscillator = null;
            var cancelled = false;

            function closeContext() {
                if (context && context.state !== 'closed') {
                    context.close().catch(function () {});
                }
            }

            try {
                context = new AudioContextType();
                context.resume().then(function () {
                    if (cancelled) {
                        closeContext();
                        return;
                    }
                    oscillator = context.createOscillator();
                    var gain = context.createGain();
                    var startAt = context.currentTime + Math.max(0, endTime - Date.now()) / 1000;
                    oscillator.type = 'triangle';
                    oscillator.frequency.setValueAtTime(660, startAt);
                    gain.gain.setValueAtTime(0, context.currentTime);
                    gain.gain.setValueAtTime(0.32, startAt);
                    for (var pulse = 1; pulse < 20; pulse++) {
                        var pulseAt = startAt + pulse * 0.5;
                        oscillator.frequency.setValueAtTime(pulse % 2 === 0 ? 660 : 880, pulseAt);
                    }
                    oscillator.connect(gain);
                    gain.connect(context.destination);
                    oscillator.onended = function () { context.close(); };
                    oscillator.start(startAt);
                    oscillator.stop(startAt + 10);
                }).catch(function () {
                    closeContext();
                });
            } catch (error) {
                closeContext();
            }

            return function () {
                cancelled = true;
                if (oscillator) {
                    try { oscillator.stop(); } catch (error) {}
                }
                closeContext();
            };
        }

        function updateTimer() {
            remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
            display.textContent = formatTime(remaining);
            if (remaining > 0) return;

            window.clearInterval(interval);
            interval = null;
            state = 'ringing';
            setButtonState('stop', 'STOP', 'Stop alarm and reset timer', false);
        }

        function resetTimer() {
            window.clearInterval(interval);
            interval = null;
            if (cancelAlarm) cancelAlarm();
            cancelAlarm = null;
            remaining = duration;
            display.textContent = formatTime(remaining);
            state = 'idle';
            setButtonState('play', 'START', 'Start 15 minute timer', false);
        }

        display.textContent = formatTime(remaining);
        button.addEventListener('click', function () {
            if (state === 'ringing') {
                resetTimer();
                return;
            }

            if (state === 'running') {
                remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
                if (remaining === 0) {
                    updateTimer();
                    return;
                }
                window.clearInterval(interval);
                interval = null;
                if (cancelAlarm) cancelAlarm();
                cancelAlarm = null;
                display.textContent = formatTime(remaining);
                state = 'paused';
                setButtonState('play', 'CONTINUE', 'Continue 15 minute timer', true);
                return;
            }

            deadline = Date.now() + remaining * 1000;
            cancelAlarm = scheduleAlarm(deadline);
            state = 'running';
            setButtonState('pause', 'PAUSE', 'Pause 15 minute timer', true);
            interval = window.setInterval(updateTimer, 250);
            updateTimer();
        });

        stopButton.addEventListener('click', resetTimer);

        return timer;
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

        var gospelLinkContainer = document.createElement('div');
        gospelLinkContainer.className = 'gospel-link-container';
        var gospelLink = document.createElement('button');
        gospelLink.type = 'button';
        gospelLink.className = 'gospel-link';
        gospelLink.setAttribute('aria-expanded', 'false');
        gospelLink.setAttribute('aria-controls', 'daily-gospel-panel');
        gospelLink.textContent = 'GUSA KUONA INJILI YA SIKU';
        gospelLinkContainer.appendChild(gospelLink);
        panel.appendChild(gospelLinkContainer);

        var gospelPanel = document.createElement('div');
        gospelPanel.id = 'daily-gospel-panel';
        gospelPanel.className = 'gospel-reading-panel';
        gospelPanel.hidden = true;
        gospelPanel.setAttribute('aria-live', 'polite');
        panel.appendChild(gospelPanel);

        var gospelFrame = null;

        function loadGospel() {
            var status = document.createElement('p');
            status.className = 'reading gospel-reading-status';
            status.textContent = 'Inapakia Injili ya siku...';
            gospelPanel.replaceChildren(status);

            gospelFrame = document.createElement('iframe');
            gospelFrame.hidden = true;
            gospelFrame.title = 'Injili ya Siku';

            function handleGospelMessage(event) {
                if (event.source !== gospelFrame.contentWindow || event.origin !== window.location.origin) return;
                if (!event.data || event.data.type !== 'daily-gospel-content') return;
                window.removeEventListener('message', handleGospelMessage);

                if (event.data.status !== 'ready' || !event.data.gospel || typeof event.data.gospel.textHtml !== 'string') {
                    status.textContent = event.data.message || 'Injili ya Kiswahili haipatikani kwa sasa.';
                    gospelFrame.remove();
                    gospelFrame = null;
                    return;
                }

                var reading = document.createElement('section');
                reading.className = 'reading ofisi-reading gospel-inline-reading';
                var heading = document.createElement('h2');
                heading.textContent = event.data.gospel.label || 'Injili';
                reading.appendChild(heading);

                if (event.data.gospel.citation) {
                    var citation = document.createElement('p');
                    citation.className = 'reading-ref';
                    citation.textContent = event.data.gospel.citation;
                    reading.appendChild(citation);
                }

                var text = document.createElement('div');
                text.className = 'reading-text';
                text.innerHTML = event.data.gospel.textHtml;
                reading.appendChild(text);
                gospelPanel.replaceChildren(reading, createPrayerTimer());
                gospelFrame.remove();
                gospelFrame = null;
            }

            window.addEventListener('message', handleGospelMessage);
            gospelFrame.src = 'daily-readings.html?view=gospel&embed=1';
            gospelPanel.appendChild(gospelFrame);
        }

        gospelLink.addEventListener('click', function () {
            var open = gospelLink.getAttribute('aria-expanded') !== 'true';
            gospelLink.setAttribute('aria-expanded', String(open));
            gospelPanel.hidden = !open;
            if (open && !gospelFrame && !gospelPanel.querySelector('.gospel-inline-reading')) loadGospel();
        });

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
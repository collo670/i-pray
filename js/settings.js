document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    loadPreferences();
    setupEventListeners();
    checkPWAInstallation();
    setupReminders();
    setupOfflineWeek();
    if (window.IPrayI18n) {
        IPrayI18n.onChange(() => { setupReminders(); setupOfflineWeek(); });
    }
});

let translations = {};

async function loadTranslations() {
    if (Object.keys(translations).length === 0) {
        const response = await fetch('../data/translations.json');
        translations = await response.json();
    }
    return translations;
}

// Renders this page in `lang`. The setting itself is saved and shared by
// js/i18n.js (IPrayI18n.set).
function setLanguage(lang) {
    document.documentElement.lang = lang;
    loadTranslations().then(trans => {
        document.querySelectorAll('[data-translate]').forEach(el => {
            const key = el.getAttribute('data-translate');
            if (trans[lang] && trans[lang][key]) {
                el.textContent = trans[lang][key];
            }
        });
    });
}

function loadPreferences() {
    const darkMode = window.IPrayTheme ? window.IPrayTheme.isDark() : localStorage.getItem('darkMode') === 'true';
    updateThemeIcon(darkMode);
    updateManifestThemeColor();
    // Keep the switch and icons in step when the theme changes in another page or tab.
    window.addEventListener('ipray:themechange', function (e) {
        const toggle = document.getElementById('darkModeToggle');
        if (toggle) toggle.checked = e.detail.dark;
        updateThemeIcon(e.detail.dark);
        updateManifestThemeColor();
    });

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = darkMode;
    }

    const highContrast = localStorage.getItem('highContrast') === 'true';
    document.getElementById('highContrastToggle').checked = highContrast;
    document.body.classList.toggle('high-contrast', highContrast);

    // The Text Size buttons are wired, saved and applied app-wide by js/text-size.js.

    const language = IPrayI18n.lang();
    highlightSelectedLanguage(language);
    setLanguage(language);
    // Follow changes made here or on another open page
    IPrayI18n.onChange((l) => {
        highlightSelectedLanguage(l);
        setLanguage(l);
    });

}

function updateThemeIcon(isDark) {
    const quickSunIcon = document.getElementById('darkModeIconSun');
    const quickMoonIcon = document.getElementById('darkModeIconMoon');
    const themeIcon = document.getElementById('themeIcon');

    if (quickSunIcon && quickMoonIcon) {
        quickSunIcon.classList.toggle('hidden', !isDark);
        quickMoonIcon.classList.toggle('hidden', isDark);
    }

    if (!themeIcon) return;
    themeIcon.innerHTML = isDark ?
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />' :
        '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />';
}

function applyDarkMode(isDark) {
    // Saved and applied app-wide by js/theme.js.
    window.IPrayTheme.set(isDark);
    updateThemeIcon(isDark);
    updateManifestThemeColor();
}

function setupEventListeners() {
    const quickToggle = document.getElementById('darkModeQuickToggle');
    if (quickToggle) {
        quickToggle.addEventListener('click', function() {
            const isDark = !document.documentElement.classList.contains('dark');
            applyDarkMode(isDark);
        });
    }

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', function() {
            applyDarkMode(this.checked);
        });
    }

    document.querySelectorAll('.language-option').forEach(option => {
        option.addEventListener('click', function() {
            // Saved, applied here and passed to every open page by js/i18n.js
            IPrayI18n.set(this.dataset.lang);
        });
    });

    document.getElementById('highContrastToggle').addEventListener('change', function() {
        const highContrast = this.checked;
        document.body.classList.toggle('high-contrast', highContrast);
        localStorage.setItem('highContrast', highContrast);
    });


    document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
    document.getElementById('exportDataBtn').addEventListener('click', exportData);
    document.getElementById('checkUpdatesBtn').addEventListener('click', checkForUpdates);

    // Lauds link in the bottom nav (same week/day cycle as js/index.js)
    const masifuAsubuhiLink = document.getElementById('masifuAsubuhiLink');
    if (masifuAsubuhiLink) {
        masifuAsubuhiLink.addEventListener('click', function() {
            const { dayPrefix, week } = getCurrentWeekAndDay();
            window.location.href = `${dayPrefix}${week}.html`;
        });
    }
}

function getCurrentWeekAndDay() {
    const dayToPrefix = ['jumapili', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const currentSunday = new Date(today);
    currentSunday.setDate(today.getDate() - today.getDay());
    currentSunday.setHours(0, 0, 0, 0);

    // Reference Sunday for week 1 of the 4-week cycle (keep in sync with js/index.js)
    const referenceWeek1Sunday = new Date(2025, 9, 19);
    referenceWeek1Sunday.setHours(0, 0, 0, 0);

    const msPerWeek = 7 * 24 * 60 * 60 * 1000;
    const weeksSinceRef = Math.floor((currentSunday - referenceWeek1Sunday) / msPerWeek);
    const week = ((weeksSinceRef % 4) + 4) % 4 + 1;

    return { dayPrefix: dayToPrefix[today.getDay()], week };
}

function updateManifestThemeColor() {
    const theme = localStorage.getItem('appTheme') || 'default';
    const isDark = localStorage.getItem('darkMode') === 'true';
    let themeColor;

    switch (theme) {
        case 'purple':
            themeColor = isDark ? '#111827' : '#7c2133';
            break;
        case 'green':
            themeColor = isDark ? '#111827' : '#2E7D32';
            break;
        case 'red':
            themeColor = isDark ? '#111827' : '#C41E3A';
            break;
        case 'white':
            themeColor = isDark ? '#111827' : '#F8F9FA';
            break;
        default:
            themeColor = isDark ? '#111827' : '#7c2133';
    }

    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
}

function highlightSelectedLanguage(lang) {
    document.querySelectorAll('.language-option').forEach(option => {
        const selected = option.dataset.lang === lang;
        option.classList.toggle('border-primary', selected);
        option.classList.toggle('ring-2', selected);
        option.classList.toggle('ring-primary', selected);
    });
}

// Frees space taken by downloaded content: the offline copies kept by the
// service worker and the offices saved from Universalis. Settings and the
// user's own things (language, text size, theme, favourites, bookmarks,
// reminders, reading positions) are kept.
function clearCache() {
    if (confirm('Clear all cached data? This will free up storage but require re-downloading content.')) {
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => caches.delete(cacheName));
            });
        }

        for (let i = localStorage.length - 1; i >= 0; i--) {
            const key = localStorage.key(i);
            if (key && key.indexOf('officeHtml-') === 0) localStorage.removeItem(key);
        }

        showToast('Cache cleared successfully. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
    }
}

function exportData() {
    const data = {
        theme: localStorage.getItem('appTheme'),
        darkMode: localStorage.getItem('darkMode'),
        language: localStorage.getItem('language'),
        textScale: window.IPrayTextSize ? window.IPrayTextSize.get() : 1,
        highContrast: localStorage.getItem('highContrast')
    };
    const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ipray-data.json';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Prayer data exported successfully.');
}

function checkForUpdates() {
    showToast('Checking for updates... Current version is 1.2.0. No updates available.');
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-20 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded shadow-lg z-50';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

function checkPWAInstallation() {
    if (window.matchMedia('(display-mode: standalone)').matches) {
        console.log('Running as PWA');
    }
    window.addEventListener('appinstalled', () => {
        console.log('iPray was installed as PWA');
        alert('iPray has been successfully installed!');
    });
}

if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/i-pray/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
}
// ---------------------------------------------------------------------------
// Prayer reminders (js/reminders.js) and "Save this week" (js/offline-week.js)
// ---------------------------------------------------------------------------
const SETTINGS_WORDS = {
    sw: {
        calendar: 'Ongeza kwenye kalenda ya simu',
        notifyOn: 'Washa arifa za ipray',
        notifyOff: 'Zima arifa za ipray',
        notifyBlocked: 'Arifa zimezuiwa kwenye kivinjari',
        note: 'Kalenda ya simu hukukumbusha hata ipray ikiwa imefungwa: pakua faili kisha ulifungue ili kuongeza ukumbusho. Arifa za ipray huonekana tu ipray ikiwa wazi.',
        noNotify: 'Kivinjari hiki hakiwezi kuonyesha arifa; tumia kalenda ya simu.',
        toggle: 'Washa au zima ukumbusho wa',
        time: 'Saa ya ukumbusho wa',
        offlineTitle: 'Bila mtandao',
        offlineText: 'Hifadhi sala za siku saba zijazo kwenye simu yako ili uzisali hata bila mtandao: Masifu ya Asubuhi, Ofisi ya Masomo, Sala ya Mchana, Masifu ya Jioni, Sala ya Usiku na nyinginezo.',
        save: 'Hifadhi juma hili',
        saving: 'Inahifadhi… {done} kati ya {total}',
        saved: 'Imehifadhiwa: kurasa {pages} na sala {offices} za Universalis.',
        partly: ' Baadhi ({failed}) hazikupatikana; jaribu tena ukiwa na mtandao.'
    },
    en: {
        calendar: 'Add to phone calendar',
        notifyOn: 'Turn on ipray notifications',
        notifyOff: 'Turn off ipray notifications',
        notifyBlocked: 'Notifications are blocked in this browser',
        note: 'The phone calendar reminds you even when ipray is closed: download the file, then open it to add the reminders. ipray notifications only show while ipray is open.',
        noNotify: 'This browser can\'t show notifications; use the phone calendar.',
        toggle: 'Turn reminder on or off:',
        time: 'Reminder time:',
        offlineTitle: 'Offline',
        offlineText: 'Save the next seven days of prayer on your phone so you can pray them with no connection: Morning Prayer, Office of Readings, Midday Prayer, Vespers, Night Prayer and more.',
        save: 'Save this week',
        saving: 'Saving… {done} of {total}',
        saved: 'Saved: {pages} pages and {offices} offices from Universalis.',
        partly: ' Some ({failed}) could not be fetched; try again when online.'
    }
};

function settingsWords() {
    return SETTINGS_WORDS[window.IPrayI18n ? IPrayI18n.prayerLang() : 'sw'];
}

function setupReminders() {
    const list = document.getElementById('reminderList');
    if (!list || !window.IPrayReminders) return;
    const w = settingsWords();
    list.innerHTML = '';
    IPrayReminders.list().forEach(r => {
        const row = document.createElement('div');
        row.className = 'prayer-reminder flex flex-wrap items-center justify-between gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg';
        row.innerHTML = `
            <h3 class="font-medium flex-1"></h3>
            <div class="flex items-center">
                <input type="time" class="bg-white dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded px-2 py-1 mr-3">
                <label class="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" class="sr-only peer">
                    <div class="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
            </div>`;
        row.querySelector('h3').textContent = r.title;
        const time = row.querySelector('input[type="time"]');
        const on = row.querySelector('input[type="checkbox"]');
        time.value = r.time;
        time.setAttribute('aria-label', `${w.time} ${r.title}`);
        on.checked = r.on;
        on.setAttribute('aria-label', `${w.toggle} ${r.title}`);
        time.addEventListener('change', () => { if (time.value) IPrayReminders.update(r.id, { time: time.value }); });
        on.addEventListener('change', () => IPrayReminders.update(r.id, { on: on.checked }));
        list.appendChild(row);
    });

    const calendarBtn = document.getElementById('reminderCalendarBtn');
    calendarBtn.textContent = w.calendar;
    calendarBtn.onclick = () => IPrayReminders.downloadCalendar();

    const notifyBtn = document.getElementById('reminderNotifyBtn');
    const note = document.getElementById('reminderNote');
    note.textContent = w.note;
    if (!IPrayReminders.notificationsSupported()) {
        notifyBtn.classList.add('hidden');
        note.textContent = w.noNotify;
        return;
    }
    const paint = () => {
        if (Notification.permission === 'denied') {
            notifyBtn.textContent = w.notifyBlocked;
            notifyBtn.disabled = true;
        } else {
            notifyBtn.textContent = IPrayReminders.notificationsOn() ? w.notifyOff : w.notifyOn;
            notifyBtn.disabled = false;
        }
    };
    notifyBtn.onclick = () => {
        if (IPrayReminders.notificationsOn()) {
            IPrayReminders.disableNotifications();
            paint();
        } else {
            IPrayReminders.enableNotifications().then(paint);
        }
    };
    paint();
}

function setupOfflineWeek() {
    const btn = document.getElementById('saveWeekBtn');
    if (!btn || !window.IPrayOffline) return;
    const w = settingsWords();
    document.getElementById('offlineTitle').textContent = w.offlineTitle;
    document.getElementById('offlineText').textContent = w.offlineText;
    if (!btn.disabled) btn.textContent = w.save;
    btn.onclick = () => {
        const progress = document.getElementById('saveWeekProgress');
        const bar = document.getElementById('saveWeekBar');
        const status = document.getElementById('saveWeekStatus');
        btn.disabled = true;
        progress.classList.remove('hidden');
        IPrayOffline.saveWeek((done, total) => {
            bar.style.width = Math.round(done / total * 100) + '%';
            status.textContent = settingsWords().saving.replace('{done}', done).replace('{total}', total);
        }).then(result => {
            const words = settingsWords();
            status.textContent = words.saved.replace('{pages}', result.pages).replace('{offices}', result.offices)
                + (result.failed ? words.partly.replace('{failed}', result.failed) : '');
            btn.disabled = false;
            btn.textContent = words.save;
        });
    };
}

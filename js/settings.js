document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('copyrightYear').textContent = new Date().getFullYear();
    loadPreferences();
    setupEventListeners();
    checkPWAInstallation();
});

let translations = {};

async function loadTranslations() {
    if (Object.keys(translations).length === 0) {
        const response = await fetch('../data/translations.json');
        translations = await response.json();
    }
    return translations;
}

function setLanguage(lang) {
    localStorage.setItem('preferredLanguage', lang);
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
    const darkMode = localStorage.getItem('darkMode') === 'true';
    applyDarkMode(darkMode);

    const darkModeToggle = document.getElementById('darkModeToggle');
    if (darkModeToggle) {
        darkModeToggle.checked = darkMode;
    }

    const highContrast = localStorage.getItem('highContrast') === 'true';
    document.getElementById('highContrastToggle').checked = highContrast;
    document.body.classList.toggle('high-contrast', highContrast);

    const textSize = localStorage.getItem('textSize') || 'normal';
    document.getElementById('textSizeSelect').value = textSize;
    document.body.classList.remove('text-small', 'text-large', 'text-xlarge');
    if (textSize !== 'normal') {
        document.body.classList.add(`text-${textSize}`);
    }

    const language = localStorage.getItem('preferredLanguage') || localStorage.getItem('language') || 'en';
    highlightSelectedLanguage(language);
    setLanguage(language);
    window.addEventListener('storage', (e) => {
        if (e.key === 'preferredLanguage' || e.key === 'langUpdatedAt') {
            const l = localStorage.getItem('preferredLanguage') || 'en';
            highlightSelectedLanguage(l);
            setLanguage(l);
        }
    });

    // Load saved times
    document.querySelectorAll('input[type="time"]').forEach(input => {
        const reminderType = input.closest('.prayer-reminder').querySelector('h3').getAttribute('data-translate');
        const savedTime = localStorage.getItem(`${reminderType}Time`);
        if (savedTime) input.value = savedTime;
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
    document.documentElement.classList.toggle('dark', isDark);
    document.body.classList.toggle('dark', isDark);
    localStorage.setItem('darkMode', String(isDark));
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
            const lang = this.dataset.lang;
            // Store under unified key and legacy key for backward compatibility
            localStorage.setItem('preferredLanguage', lang);
            localStorage.setItem('language', lang);
            highlightSelectedLanguage(lang);
            // Notify other tabs/pages via storage event
            try { localStorage.setItem('langUpdatedAt', Date.now().toString()); } catch (e) {}
            window.location.reload();
        });
    });

    document.getElementById('highContrastToggle').addEventListener('change', function() {
        const highContrast = this.checked;
        document.body.classList.toggle('high-contrast', highContrast);
        localStorage.setItem('highContrast', highContrast);
    });

    document.getElementById('textSizeSelect').addEventListener('change', function() {
        const size = this.value;
        document.body.classList.remove('text-small', 'text-large', 'text-xlarge');
        if (size !== 'normal') {
            document.body.classList.add(`text-${size}`);
        }
        localStorage.setItem('textSize', size);
    });

    // Add time input listeners
    document.querySelectorAll('input[type="time"]').forEach(input => {
        input.addEventListener('change', function() {
            const reminderType = this.closest('.prayer-reminder').querySelector('h3').getAttribute('data-translate');
            localStorage.setItem(`${reminderType}Time`, this.value);
            showToast('Time updated successfully');
        });
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
            themeColor = '#4A1E8A';
            break;
        case 'green':
            themeColor = '#2E7D32';
            break;
        case 'red':
            themeColor = '#C41E3A';
            break;
        case 'white':
            themeColor = isDark ? '#374151' : '#F8F9FA';
            break;
        default:
            themeColor = '#7C3AED';
    }

    document.querySelector('meta[name="theme-color"]').setAttribute('content', themeColor);
}

function highlightSelectedLanguage(lang) {
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.toggle('border-primary', option.dataset.lang === lang);
    });
}

function clearCache() {
    if (confirm('Clear all cached data? This will free up storage but require re-downloading content.')) {
        const preservedData = {
            appTheme: localStorage.getItem('appTheme'),
            darkMode: localStorage.getItem('darkMode'),
            language: localStorage.getItem('language'),
            textSize: localStorage.getItem('textSize'),
            highContrast: localStorage.getItem('highContrast')
        };

        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => caches.delete(cacheName));
            });
        }

        localStorage.clear();
        Object.entries(preservedData).forEach(([key, value]) => {
            if (value !== null) localStorage.setItem(key, value);
        });

        showToast('Cache cleared successfully. Reloading...');
        setTimeout(() => window.location.reload(), 1000);
    }
}

function exportData() {
    const data = {
        theme: localStorage.getItem('appTheme'),
        darkMode: localStorage.getItem('darkMode'),
        language: localStorage.getItem('language'),
        textSize: localStorage.getItem('textSize'),
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
    navigator.serviceWorker.register('/i-pray/js/service-worker.js')
        .then(reg => console.log('Service Worker registered', reg))
        .catch(err => console.error('Service Worker registration failed', err));
}
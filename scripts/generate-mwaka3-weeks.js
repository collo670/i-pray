const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const ROOT = path.resolve(__dirname, '..');
// CLI args: --pdf <path> --prefix <name> --title <Title Prefix> --offset <N>
const argv = process.argv.slice(2);
function getArg(flag, fallback = undefined) {
  const idx = argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];
  return fallback;
}
const inputPdf = getArg('--pdf', path.join(ROOT, 'PDFS', 'MwakaSehemu3.pdf'));
const outPrefix = getArg('--prefix', 'mwaka3-week');
const titlePrefix = getArg('--title', 'Kipindi cha Mwaka - Wiki');
const offset = parseInt(getArg('--offset', '26'), 10); // so week 1 -> 27 by default

function escapeHtml(content) {
  return content
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function buildHtml({ displayWeekNum, days }) {
  const dayOrder = [
    'Dominika',
    'Jumatatu',
    'Jumanne',
    'Jumatano',
    'Alhamisi',
    'Ijumaa',
    'Jumamosi',
  ];

  function sectionFor(dayKey, idKey) {
    const content = (days[dayKey] || '').trim();
    const safe = escapeHtml(content)
      .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed">')
      .replace(/\n/g, '<br>');
    return `
        <section class="collapsed-section card card-hover season-border" id="${idKey}-section" onclick="toggleSection('${idKey}')">
            <h2 class="text-xl font-bold text-green-800 mb-3">${dayKey} ya ${displayWeekNum}</h2>
            <a id="${idKey}-link" class="block text-sm text-purple-600 mb-2 cursor-pointer">Tap to view</a>
            <div id="${idKey}-content">
                <p class="text-gray-700 leading-relaxed">${safe}</p><br><br>
            </div>
        </section>`;
  }

  const sections = [
    sectionFor('Dominika', 'dominika'),
    sectionFor('Jumatatu', 'jumatatu'),
    sectionFor('Jumanne', 'jumanne'),
    sectionFor('Jumatano', 'jumatano'),
    sectionFor('Alhamisi', 'alhamisi'),
    sectionFor('Ijumaa', 'ijumaa'),
    sectionFor('Jumamosi', 'jumamosi'),
  ].join('\n\n');

  return `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${titlePrefix} ${displayWeekNum}</title>
    <link rel="icon" href="/assets/images/favicon.ico.jpg" type="image/x-icon">
    <meta name="theme-color" content="#7C3AED">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        'primary': '#7C3AED',
                        'secondary': '#DB2777',
                        'accent': '#F59E0B',
                        'liturgical-green': '#2E7D32'
                    }
                }
            }
        }
    </script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f3e7ff 0%, #ffeaf0 50%, #e0f2fe 100%); }
        .card { background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 1rem; padding: 1.5rem; margin-top: 1rem; }
        .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -6px rgba(0,0,0,0.12), 0 6px 8px -6px rgba(0,0,0,0.06); }
        .season-border { border-style: dashed; border-width: 1px; border-color: #bbf7d0; }
    </style>
    <meta name="description" content="Wiki ya Mwaka Sehemu 3 - Wiki ${displayWeekNum}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</head>
<body class="min-h-screen" style="text-align: justify;">
    <header class="px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-purple-600">Wiki ${displayWeekNum}</h1>
                <p class="text-sm text-gray-600">Dominika ${displayWeekNum} - Jumamosi ${displayWeekNum}</p><br><br>
            </div>
            <a href="/i-pray/index.html" class="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all" title="Nyumbani">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </a>
        </div>
    </header>
    <main class="max-w-4xl mx-auto px-6 py-8 pb-24">
${sections}
    </main>
    <nav class="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-4 shadow-lg z-40" style="height: 4.5rem;">
        <div class="flex justify-around h-full items-center">
            <a href="index.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-purple-600">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span class="text-xs font-medium">Home</span>
            </a>
            <a href="calendar.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span class="text-xs font-medium">Calendar</span>
            </a>
            <a href="settings.html" class="flex flex-col items-center px-3 py-2 rounded-lg text-gray-600 hover:text-gray-800">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 2.924 1.756 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-2.924-1.756 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span class="text-xs font-medium">Settings</span>
            </a>
        </div>
    </nav>
    <script>
    function toggleSection(day) {
        const content = document.getElementById(day + '-content');
        const link = document.getElementById(day + '-link');
        const section = document.getElementById(day + '-section') || event.currentTarget;
        
        if (content.classList.contains('hidden')) {
            document.querySelectorAll('[id$="-content"]').forEach(el => {
                if (el !== content) {
                    el.classList.add('hidden');
                    const otherLink = document.getElementById(el.id.replace('-content', '-link'));
                    if (otherLink) otherLink.textContent = 'Tap to view';
                }
            });
            content.classList.remove('hidden');
            link.textContent = 'Tap to hide';
        } else {
            content.classList.add('hidden');
            link.textContent = 'Tap to view';
        }
    }
    
    document.addEventListener('DOMContentLoaded', function() {
        const dayMapping = {
            0: 'dominika', 1: 'jumatatu', 2: 'jumanne', 3: 'jumatano', 
            4: 'alhamisi', 5: 'ijumaa', 6: 'jumamosi'
        };
        const currentDayIndex = new Date().getDay();
        const currentDayId = dayMapping[currentDayIndex];
        const allSections = ['dominika', 'jumatatu', 'jumanne', 'jumatano', 'alhamisi', 'ijumaa', 'jumamosi'];
        allSections.forEach(day => {
            const content = document.getElementById(day + '-content');
            if (content) {
                content.classList.add('hidden');
                const link = document.getElementById(day + '-link');
                if (link) link.textContent = 'Tap to view';
            }
        });
        const currentContent = document.getElementById(currentDayId + '-content');
        if (currentContent) {
            currentContent.classList.remove('hidden');
            const currentLink = document.getElementById(currentDayId + '-link');
            if (currentLink) currentLink.textContent = 'Tap to hide';
        }
    });
    </script>
<script>
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
      navigator.serviceWorker.register('/i-pray/service-worker.js')
        .then(function(registration) {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(function(error) {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
  }
</script>
</body>
</html>`;
}

function splitWeeks(fullText) {
  const normalized = fullText
    .replace(/\r/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(/[\t ]+/g, ' ')
    .replace(/\n{2,}/g, '\n\n');

  const dayVariants = {
    Dominika: ['Dominika', 'DOMINIKA'],
    Jumatatu: ['Jumatatu', 'JUMATATU'],
    Jumanne: ['Jumanne', 'JUMANNE'],
    Jumatano: ['Jumatano', 'JUMATANO'],
    Alhamisi: ['Alhamisi', 'ALHAMISI'],
    Ijumaa: ['Ijumaa', 'IJUMAA'],
    Jumamosi: ['Jumamosi', 'JUMAMOSI']
  };
  const makeFuzzy = (word) => word.split('').join('\\s*');
  const patternParts = Object.values(dayVariants)
    .map((variants) => `(?:${variants.map(v => makeFuzzy(v)).join('|')})`)
    .join('|');
  const dayRegex = new RegExp(`(${patternParts})(?:\\s*[:.\-])?`, 'gi');

  const tokens = [];
  let match;
  let lastIndex = 0;
  while ((match = dayRegex.exec(normalized)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) tokens.push({ type: 'text', text: normalized.slice(lastIndex, idx) });
    tokens.push({ type: 'day', day: match[0], index: idx });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < normalized.length) tokens.push({ type: 'text', text: normalized.slice(lastIndex) });

  const segments = [];
  let currentDay = null;
  let currentText = '';
  for (const token of tokens) {
    if (token.type === 'day') {
      if (currentDay !== null) segments.push({ day: currentDay, text: currentText.trim() });
      const normalizedDay = token.day.replace(/\s+/g, '');
      let canonical = null;
      for (const [canon, variants] of Object.entries(dayVariants)) {
        if (variants.some(v => v.replace(/\s+/g, '').toLowerCase() === normalizedDay.toLowerCase())) {
          canonical = canon; break;
        }
      }
      currentDay = canonical || (token.day || '').trim();
      currentText = '';
    } else {
      currentText += token.text;
    }
  }
  if (currentDay !== null) segments.push({ day: currentDay, text: currentText.trim() });

  const weeks = [];
  let week = {};
  function pushWeek(force = false) {
    if (force && Object.keys(week).length) { weeks.push(week); week = {}; }
  }
  for (const seg of segments) {
    const day = seg.day;
    if (day === 'Dominika') {
      pushWeek(true);
      week['Dominika'] = seg.text;
    } else if (['Jumatatu','Jumanne','Jumatano','Alhamisi','Ijumaa','Jumamosi'].includes(day)) {
      if (Object.keys(week).length === 0) continue; // ignore before first Sunday
      week[day] = seg.text;
      if (day === 'Jumamosi') pushWeek(true);
    }
  }
  pushWeek(true);
  return weeks.filter(w => w['Dominika']);
}

async function main() {
  if (!fs.existsSync(inputPdf)) {
    console.error('PDF not found at', inputPdf);
    process.exit(1);
  }
  const dataBuffer = fs.readFileSync(inputPdf);
  const data = await pdf(dataBuffer);
  const fullText = data.text || '';
  const weeks = splitWeeks(fullText);
  if (!weeks.length) {
    console.error('No weeks detected. Please verify day markers in PDF text.');
    process.exit(2);
  }
  weeks.forEach((days, i) => {
    const displayWeekNum = i + 1 + offset;
    const html = buildHtml({ displayWeekNum, days });
    const outName = `${outPrefix}${String(displayWeekNum).padStart(2, '0')}.html`;
    const outPath = path.join(ROOT, outName);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log('Generated', outName);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



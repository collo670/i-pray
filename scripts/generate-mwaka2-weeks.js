const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

const ROOT = path.resolve(__dirname, '..');
// CLI args: --pdf <path> --prefix <name> --title <Title Prefix>
const argv = process.argv.slice(2);
function getArg(flag, fallback = undefined) {
  const idx = argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];
  return fallback;
}
const inputPdf = getArg('--pdf', path.join(ROOT, 'PDFS', 'MwakaSehemu2.pdf'));
const outPrefix = getArg('--prefix', 'mwaka2-week');
const titlePrefix = getArg('--title', 'Mwaka Sehemu 2 - Wiki');

function buildHtml({ title, weekIndex, days }) {
  const dayOrder = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  const headings = dayOrder
    .filter((day) => days[day])
    .map((day) => {
      const content = days[day].trim();
      const safe = content
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\n\n/g, '</p><p class="text-gray-700 leading-relaxed">')
        .replace(/\n/g, '<br>');
      return `
            <section class="card card-hover">
                <h2 class="text-xl font-bold text-green-800 mb-3">${day}</h2>
                <p class="text-gray-700 leading-relaxed">${safe}</p>
            </section>`;
    })
    .join('\n');

  return `<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
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
    <meta name="description" content="Wiki ya ${title}">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
</head>
<body class="min-h-screen">
    <header class="px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm">
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-2xl font-bold text-purple-600">${title}</h1>
                <p class="text-sm text-gray-600">Wiki ya Mwaka Sehemu ya 2</p>
            </div>
            <a href="/i-pray/index.html" class="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all" title="Nyumbani">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
            </a>
        </div>
    </header>
    <main class="max-w-4xl mx-auto px-6 py-8 pb-24">
        <div class="rounded-3xl p-6 bg-green-100 backdrop-blur-sm shadow-xl border border-dashed border-green-200 season-border space-y-6">
${headings}
        </div>
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
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c-.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-2.924-1.756 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
                <span class="text-xs font-medium">Settings</span>
            </a>
        </div>
    </nav>
</body>
</html>`;
}

function splitWeeks(fullText) {
  // Normalize whitespace
  const normalized = fullText.replace(/\r/g, '\n').replace(/\u00a0/g, ' ').replace(/[\t ]+/g, ' ').replace(/\n{2,}/g, '\n\n');

  // Split by days markers; we will scan sequentially and cut weeks
  const dayVariants = {
    Jumapili: ['Jumapili', 'Dominika', 'DOMINIKA'],
    Jumatatu: ['Jumatatu', 'JUMATATU'],
    Jumanne: ['Jumanne', 'JUMANNE'],
    Jumatano: ['Jumatano', 'JUMATANO'],
    Alhamisi: ['Alhamisi', 'ALHAMISI'],
    Ijumaa: ['Ijumaa', 'IJUMAA'],
    Jumamosi: ['Jumamosi', 'JUMAMOSI']
  };
  const canonicalDays = Object.keys(dayVariants);
  const makeFuzzy = (word) => word.split('').join('\\s*');
  const patternParts = [];
  for (const variants of Object.values(dayVariants)) {
    const vPart = variants.map(v => makeFuzzy(v)).join('|');
    patternParts.push(`(?:${vPart})`);
  }
  const dayRegex = new RegExp(`(${patternParts.join('|')})(?:\\s*[:.\-])?`, 'gi');
  const tokens = [];
  let match;
  let lastIndex = 0;
  while ((match = dayRegex.exec(normalized)) !== null) {
    const idx = match.index;
    if (idx > lastIndex) {
      tokens.push({ type: 'text', text: normalized.slice(lastIndex, idx) });
    }
    tokens.push({ type: 'day', day: match[0], index: idx });
    lastIndex = idx + match[0].length;
  }
  if (lastIndex < normalized.length) {
    tokens.push({ type: 'text', text: normalized.slice(lastIndex) });
  }

  // Reconstruct segments per day preserving order
  const segments = [];
  let currentDay = null;
  let currentText = '';
  for (const token of tokens) {
    if (token.type === 'day') {
      if (currentDay !== null) {
        segments.push({ day: currentDay, text: currentText.trim() });
      }
      const normalizedDay = token.day.replace(/\s+/g, '');
      let canonical = null;
      for (const [canon, variants] of Object.entries(dayVariants)) {
        if (variants.some(v => v.replace(/\s+/g, '').toLowerCase() === normalizedDay.toLowerCase())) {
          canonical = canon;
          break;
        }
      }
      currentDay = canonical || (token.day || '').trim();
      currentText = '';
    } else {
      currentText += token.text;
    }
  }
  if (currentDay !== null) {
    segments.push({ day: currentDay, text: currentText.trim() });
  }

  // Group into weeks starting at Jumapili and ending at Jumamosi
  const weeks = [];
  let week = {};
  const order = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  let expectingIndex = 0; // expecting next day index in order

  function pushWeekIfComplete(force = false) {
    const hasStart = typeof week['Jumapili'] === 'string' && week['Jumapili'].length > 0;
    const hasEnd = typeof week['Jumamosi'] === 'string' && week['Jumamosi'].length > 0;
    const anyDays = Object.keys(week).length > 0;
    if (force || (hasStart && hasEnd)) {
      if (anyDays) weeks.push(week);
      week = {};
      expectingIndex = 0;
    }
  }

  for (const seg of segments) {
    const idx = order.indexOf(seg.day);
    if (idx === -1) continue;

    if (idx === 0) {
      // Start of a week
      // If we already have content, close previous week
      pushWeekIfComplete(true);
      week['Jumapili'] = seg.text;
      expectingIndex = 1;
    } else {
      if (Object.keys(week).length === 0) {
        // Ignore days before first Sunday
        continue;
      }
      // Fill days in order but allow skips
      week[seg.day] = seg.text;
      expectingIndex = idx + 1;
      if (seg.day === 'Jumamosi') {
        pushWeekIfComplete(true);
      }
    }
  }

  // Flush last week if it has content
  pushWeekIfComplete(true);
  return weeks.filter((w) => w['Jumapili']);
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
    const weekNum = i + 1;
    const title = `${titlePrefix} ${weekNum}`;
    const html = buildHtml({ title, weekIndex: weekNum, days });
    const outName = `${outPrefix}${String(weekNum).padStart(2, '0')}.html`;
    const outPath = path.join(ROOT, outName);
    fs.writeFileSync(outPath, html, 'utf8');
    console.log('Generated', outName);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});



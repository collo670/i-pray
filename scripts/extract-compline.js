const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');
const pdfParse = require('pdf-parse');

async function main() {
  const pdfPath = path.resolve(__dirname, '..', 'PDFS', 'Compline.pdf');
  const outDir = path.resolve(__dirname, '..', 'assets', 'images', 'compline');
  const htmlOut = path.resolve(__dirname, '..', 'compline.html');

  if (!fs.existsSync(pdfPath)) {
    console.error('Compline.pdf not found at', pdfPath);
    process.exit(1);
  }

  fs.mkdirSync(outDir, { recursive: true });

  const dataBuffer = fs.readFileSync(pdfPath);
  const data = await pdfParse(dataBuffer);

  // Basic split by days keywords in Swahili (Jumapili..Jumamosi)
  const days = ['Jumapili', 'Jumatatu', 'Jumanne', 'Jumatano', 'Alhamisi', 'Ijumaa', 'Jumamosi'];
  const sections = {};
  for (const d of days) sections[d.toLowerCase()] = '';

  const text = (data.text || '').replace(/\r/g, '');
  const lines = text.split(/\n+/);
  let current = null;
  for (const line of lines) {
    const trimmed = line.trim();
    const found = days.find(d => new RegExp('^' + d + '\\b', 'i').test(trimmed));
    if (found) {
      current = found.toLowerCase();
      sections[current] += `<p class=\"text-gray-700 leading-relaxed\"><strong>${found}</strong></p>`;
      continue;
    }
    if (!current) continue;
    if (trimmed.length === 0) {
      sections[current] += '<br />';
    } else {
      sections[current] += `<p class=\"text-gray-700 leading-relaxed\">${escapeHtml(trimmed)}</p>`;
    }
  }

  // Try to extract page images using pdftoppm if available
  extractPageImagesWithPdftoppm(pdfPath, outDir);

  // Build HTML by borrowing head and scripts from mwaka3-week25 where possible
  const week25Path = path.resolve(__dirname, '..', 'mwaka3-week25.html');
  let headAndNav = buildDefaultHead();
  try {
    const week25 = fs.readFileSync(week25Path, 'utf8');
    headAndNav = reuseHeadAndNav(week25);
  } catch (_) {}

  const html = buildHtml(headAndNav, sections, outDir);
  fs.writeFileSync(htmlOut, html, 'utf8');
  console.log('Wrote', htmlOut);
}

function renderDay(id, title, contentHtml, outDir){
  const candidates = [
    path.resolve(outDir, `${id}.png`),
    path.resolve(outDir, `${id}.jpg`)
  ];
  let imgTag = '';
  for (const abs of candidates) {
    if (fs.existsSync(abs)) {
      const rel = path.relative(path.resolve(__dirname, '..'), abs).replace(/\\\\/g,'/');
      imgTag = `<img src=\"${rel}\" alt=\"${title}\" class=\"img-responsive my-4\" />`;
      break;
    }
  }
  return `
  <section class=\"collapsed-section card card-hover season-border\" id=\"${id}-section\" onclick=\"toggleSection('${id}')\">\n    <h2 class=\"text-xl font-bold text-green-800 mb-3\">${title}</h2>\n    <a id=\"${id}-link\" class=\"block text-sm text-purple-600 mb-2 cursor-pointer\">Tap to view</a>\n    <div id=\"${id}-content\">${contentHtml||'<p class=\\"text-gray-700 leading-relaxed\\">(Hakuna yaliyopatikana kutoka PDF)</p>'}${imgTag}</div>\n  </section>`;
}

function escapeHtml(str){
  return str
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/\"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

main().catch(err=>{console.error(err);process.exit(1);});

function commandExists(cmd){
  const which = process.platform === 'win32' ? 'where' : 'which';
  const res = spawnSync(which, [cmd], { stdio: 'ignore' });
  return res.status === 0;
}

function extractPageImagesWithPdftoppm(pdfPath, outDir){
  if (!commandExists('pdftoppm')) return;
  const prefix = path.join(outDir, 'page');
  try {
    spawnSync('pdftoppm', ['-png', pdfPath, prefix], { stdio: 'ignore' });
    const files = fs.readdirSync(outDir)
      .filter(f => /^page-?\d+\.png$/i.test(f))
      .sort((a,b)=>{
        const na = parseInt(a.match(/(\d+)/)[1],10);
        const nb = parseInt(b.match(/(\d+)/)[1],10);
        return na - nb;
      });
    const dayOrder = ['jumapili','jumatatu','jumanne','jumatano','alhamisi','ijumaa','jumamosi'];
    for (let i=0;i<Math.min(7, files.length);i++){
      const src = path.join(outDir, files[i]);
      const dst = path.join(outDir, `${dayOrder[i]}.png`);
      try { fs.copyFileSync(src, dst); } catch(_) {}
    }
  } catch (_) {}
}

function reuseHeadAndNav(html){
  const head = (html.match(/<head>[\s\S]*?<\/head>/i) || [])[0] || '';
  const nav = (html.match(/<nav[\s\S]*?<\/nav>/i) || [])[0] || '';
  const scripts = (html.match(/<script[\s\S]*?<\/script>/gi) || []).join('\n');
  const updatedHead = head
    .replace(/<title>[\s\S]*?<\/title>/i, '<title>Compline<\/title>')
    .replace(/content=\"Wiki ya Mwaka[\s\S]*?\"/i, 'content=\"Compline\"');
  return { head: `<!DOCTYPE html>\n<html lang=\"sw\">\n${updatedHead}`, nav, scripts };
}

function buildDefaultHead(){
  return {
    head: `<!DOCTYPE html>\n<html lang=\"sw\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Compline</title>\n    <link rel=\"icon\" href=\"/assets/images/favicon.ico.jpg\" type=\"image/x-icon\">\n    <meta name=\"theme-color\" content=\"#7C3AED\">\n    <script src=\"https://cdn.tailwindcss.com\"></script>\n    <script>tailwind.config={theme:{extend:{colors:{primary:'#7C3AED',secondary:'#DB2777',accent:'#F59E0B','liturgical-green':'#2E7D32'}}}};</script>\n    <link href=\"https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\" rel=\"stylesheet\">\n    <style>\n      body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #f3e7ff 0%, #ffeaf0 50%, #e0f2fe 100%); }\n      .card { background-color: #ffffff; box-shadow: 0 4px 6px rgba(0,0,0,0.1); border-radius: 1rem; padding: 1.5rem; margin-top: 1rem; }\n      .card-hover:hover { transform: translateY(-3px); box-shadow: 0 12px 20px -6px rgba(0,0,0,0.12), 0 6px 8px -6px rgba(0,0,0,0.06); }\n      .season-border { border-style: dashed; border-width: 1px; border-color: #bbf7d0; }\n      .img-responsive { width: 100%; height: auto; max-width: 100%; display: block; border-radius: 0.5rem; }\n    </style>\n    <meta name=\"description\" content=\"Compline\">\n    <meta name=\"apple-mobile-web-app-capable\" content=\"yes\">\n    <meta name=\"apple-mobile-web-app-status-bar-style\" content=\"black-translucent\">\n</head>`,
    nav: '',
    scripts: ''
  };
}

function buildHtml(headAndNav, sections, outDir){
  const top = `${headAndNav.head}\n<body class=\\"min-h-screen\\" style=\\"text-align: justify;\\">\n  <header class=\\"px-6 py-4 bg-white/80 backdrop-blur-sm shadow-sm\\">\n    <div class=\\"flex items-center justify-between\\"> \n      <div>\n        <h1 class=\\"text-2xl font-bold text-purple-600\\">Compline</h1>\n        <p class=\\"text-sm text-gray-600\\">Prayer at Night</p><br><br>\n      </div>\n      <a href=\\"/i-pray/index.html\\" class=\\"p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all\\" title=\\"Nyumbani\\"> \n        <svg class=\\"w-5 h-5\\" fill=\\"none\\" stroke=\\"currentColor\\" viewBox=\\"0 0 24 24\\"><path stroke-linecap=\\"round\\" stroke-linejoin=\\"round\\" stroke-width=\\"2\\" d=\\"M10 19l-7-7m0 0l7-7m-7 7h18\\" /></svg>\n      </a>\n    </div>\n  </header>\n  <main class=\\"max-w-4xl mx-auto px-6 py-8 pb-24\\">`;
  const body = [
    renderDay('jumapili', 'Jumapili', sections['jumapili'], outDir),
    renderDay('jumatatu', 'Jumatatu', sections['jumatatu'], outDir),
    renderDay('jumanne', 'Jumanne', sections['jumanne'], outDir),
    renderDay('jumatano', 'Jumatano', sections['jumatano'], outDir),
    renderDay('alhamisi', 'Alhamisi', sections['alhamisi'], outDir),
    renderDay('ijumaa', 'Ijumaa', sections['ijumaa'], outDir),
    renderDay('jumamosi', 'Jumamosi', sections['jumamosi'], outDir)
  ].join('\n');
  const bottom = `\n  </main>\n  ${headAndNav.nav}\n  ${headAndNav.scripts}\n` + '</body>\n</html>';
  return top + body + bottom;
}




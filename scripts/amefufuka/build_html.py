"""Build the Amefufuka index page and one HTML page per song from songs.json.

usage: build_html.py songs.json figs_dir repo_root
"""
import html, json, os, re, shutil, sys, unicodedata
from collections import Counter

songs = json.load(open(sys.argv[1]))
FIGS, ROOT = sys.argv[2], sys.argv[3]
OUT = os.path.join(ROOT, 'pages', 'amefufuka')
PT_PER_EM = 10.5

SECTIONS = [
    # (key, colour, title, note, first page, last page) — from the book's UTANGULIZI
    ('liturjia', 'yellow', 'Maadhimisho ya Kiliturjia', 'uk. 1–30', 1, 30),
    ('prekatekumenato', 'white', 'Nyimbo za Prekatekumenato', 'uk. 31–200', 31, 200),
    ('katekumenato', 'green', 'Nyimbo za Katekumenato', 'uk. 201–260', 201, 260),
    ('uteuzi', 'blue', 'Nyimbo za Uteuzi', 'uk. 261–300', 261, 300),
    ('nyongeza', 'extra', 'Nyimbo za Nyongeza', 'bila namba ya ukurasa', None, None),
]

def section_of(page):
    for s in SECTIONS:
        if s[4] is not None and s[4] <= (page or 0) <= s[5]:
            return s
    return SECTIONS[-1]

def esc(s):
    return html.escape(s, quote=False)

def slugify(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()
    t = re.sub(r'\([^)]*\)', ' ', t)
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return '-'.join(t.split('-')[:7]) or 'wimbo'

def nice_title(t):
    return re.sub(r'\s+', ' ', t).strip()

# ---------------------------------------------------------------- lines -----

def runs(text, styles, a, b):
    out, cur, buf = [], None, ''
    for k in range(a, b):
        st = styles[k] if k < len(styles) else ''
        st = st or ''
        if st != cur and buf:
            out.append((cur, buf)); buf = ''
        cur = st; buf += text[k]
    if buf: out.append((cur, buf))
    res = ''
    for st, s in out:
        if st:
            res += f'<span class="{" ".join(st)}">{esc(s)}</span>'
        else:
            res += esc(s)
    return res

def chunk(chord, inner):
    return f'<span class="c"><span class="ch">{chord}</span><span class="cw">{inner or "&#8203;"}</span></span>'

def line_text(l):
    """Lyric HTML with each chord over the character it was printed above.

    A word carrying chords is kept in one unbreakable span so a narrow
    screen never wraps it between a syllable and its chord.
    """
    text, styles = l['text'], l.get('styles') or [''] * len(l['text'])
    anchors = sorted(l.get('chords', []), key=lambda a: (a['i'], a.get('pad') or 0))
    inside = [a for a in anchors if a['i'] < len(text)]
    tail = [a for a in anchors if a['i'] >= len(text)]
    by_pos = {}
    for a in inside:
        by_pos.setdefault(a['i'], []).append(a)
    out = []
    k = 0
    n = len(text)
    while k < n:
        if text[k] in ' \u2002':
            j = k
            while j < n and text[j] in ' \u2002' and j not in by_pos:
                j += 1
            if j == k:  # a chord printed over a gap
                for a in by_pos[k]:
                    out.append(chunk(a['c'], runs(text, styles, k, k + 1)))
                k += 1
                continue
            out.append(runs(text, styles, k, j)); k = j
            continue
        we = k
        while we < n and text[we] not in ' \u2002':
            we += 1
        cuts = sorted(pos for pos in by_pos if k <= pos < we)
        if not cuts:
            out.append(runs(text, styles, k, we))
        else:
            parts = []
            if cuts[0] > k:
                parts.append(runs(text, styles, k, cuts[0]))
            for ci, pos in enumerate(cuts):
                end = cuts[ci + 1] if ci + 1 < len(cuts) else we
                chords = by_pos[pos]
                for a in chords[:-1]:
                    parts.append(chunk(a['c'], ''))
                parts.append(chunk(chords[-1]['c'], runs(text, styles, pos, end)))
            word = ''.join(parts)
            out.append(f'<span class="w">{word}</span>' if len(parts) > 1 else word)
        k = we
    for a in tail:
        out.append('&#160;' * (a.get('pad') or 1))
        out.append(chunk(a['c'], ''))
    return ''.join(out)

def em(pt):
    return f'{pt / PT_PER_EM:.2f}'.rstrip('0').rstrip('.') + 'em'

def column_base(lines):
    xs = Counter(round(l['x0']) for l in lines if l['type'] == 'line' and l.get('x0') is not None)
    # the text column starts at the left-most common position
    cands = [x for x, c in xs.items() if c >= 2] or list(xs)
    return min(cands) if cands else None

def render_lines(lines, groups, base=None):
    if not lines: return ''
    if base is None:
        base = column_base(lines) or 0
    parts = []
    for idx, l in enumerate(lines):
        style = []
        gap = l.get('gap', 0) if idx else 0
        if gap and gap > 4:
            style.append(f'margin-top:{min(2.2, (gap - 3) / 11):.2f}em')
        ind = (l.get('x0') or base) - base
        if l['type'] in ('line', 'note') and ind > 4:
            style.append(f'padding-left:min({em(ind)},{min(45, ind / 4):.0f}%)')
        st = f' style="{";".join(style)}"' if style else ''
        if l['type'] == 'line':
            lab = esc(l['label']) if l.get('label') else ''
            cls = 'ln has-ch' if l.get('chords') else 'ln'
            parts.append(f'<div class="{cls}"{st}><span class="lb">{lab}</span><span class="tx">{line_text(l)}</span></div>')
        elif l['type'] == 'chords':
            inner = []
            prev_end = base
            for it in l['items']:
                gap_pt = max(0, it['x'] - prev_end)
                inner.append(f'<span class="c" style="margin-left:{em(gap_pt)}"><span class="ch">{it["c"]}</span><span class="cw">&#8203;</span></span>')
                prev_end = it['x'] + 5.2 * len(re.sub('<[^>]+>', '', it['c'])) + 3.6
            parts.append(f'<div class="ln chords-only"{st}><span class="lb"></span><span class="tx">{"".join(inner)}</span></div>')
        elif l['type'] == 'note':
            spans = []
            for p in l['parts']:
                cls = ' '.join(p['s'])
                spans.append(f'<span class="{cls}">{esc(p["t"])}</span>' if cls else esc(p['t']))
            parts.append(f'<div class="ln note"{st}><span class="lb"></span><span class="tx">{" ".join(spans)}</span></div>')
    # repeat braces wrap their lines
    for g in sorted(groups, key=lambda g: g['start'], reverse=True):
        s, e = g['start'], g['end']
        if s < 0 or e >= len(parts) or s > e: continue
        note = esc(g.get('note') or '')
        block = ''.join(parts[s:e + 1])
        parts[s:e + 1] = [f'<div class="rep" data-note="{html.escape(note)}">{block}</div>']
    return ''.join(parts)

def render_song_body(s):
    out = []
    for pi, part in enumerate(s['parts']):
        # full-width bands are indented against the page's first text column
        first = []
        for b in part['bands']:
            first.extend(b['cols'][0]['lines'] if b['kind'] == 'cols' else b['lines'])
        page_base = column_base(first)
        if pi and part.get('page') and part['page'] != s['parts'][pi - 1].get('page'):
            out.append(f'<div class="pg-mark">uk. {part["page"]}</div>')
        for b in part['bands']:
            if b['kind'] == 'cols':
                cols = [c for c in b['cols']]
                inner = ''.join(f'<div class="col">{render_lines(c["lines"], c["groups"])}</div>' for c in cols)
                out.append(f'<div class="sheet-band sheet-cols n{len(cols)}">{inner}</div>')
            elif b['kind'] == 'foot':
                out.append(f'<div class="sheet-band sheet-foot">{render_lines(b["lines"], b.get("groups", []))}</div>')
            else:
                out.append(f'<div class="sheet-band">{render_lines(b["lines"], b.get("groups", []), page_base if b.get("full") else None)}</div>')
        for f in part.get('figures', []):
            w = round(f['w'] / 200 * 72 * 1.25)  # print size, a little larger
            out.append(f'<figure class="song-fig"><img src="img/{f["img"]}" alt="Maelezo ya chords / musiki, uk. {part.get("page") or ""}" width="{w}" height="{round(w * f["h"] / f["w"])}" loading="lazy"></figure>')
    return '\n'.join(out)

# ---------------------------------------------------------------- pages -----

HEAD = '''<!DOCTYPE html>
<html lang="sw">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
    <meta name="theme-color" content="#7c2133">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
    <meta name="apple-mobile-web-app-title" content="ipray">
    <link rel="stylesheet" href="{r}css/prevent-zoom.css">
    <title>{title}</title>
    <link rel="icon" href="/i-pray/assets/images/favicon.ico.jpg" type="image/x-icon">
    <!-- Masifu ya Asubuhi styles (light & dark) + the songbook layer -->
    <link rel="stylesheet" href="{r}css/index.css">
    <link rel="stylesheet" href="{r}css/masifu.css">
    <link rel="stylesheet" href="{r}css/amefufuka.css">
    <script src="{r}js/logo-loader.js"></script>
    <link rel="stylesheet" href="{r}css/status-bar-safe-area.css">
    <script src="{r}js/status-bar.js" defer></script>
    <script src="{r}js/theme.js"></script>
    <script src="{r}js/text-size.js"></script>
    <script src="{r}js/i18n.js"></script>
    <script src="{r}js/library.js" defer></script>
    <script src="{r}js/reminders.js" defer></script>
</head>
<body class="masifu-topbar masifu-modern amefufuka{extra}">
    <header id="appBar" class="app-bar" role="banner">
        <div class="header-content">
            <div class="app-bar-brand">
                <h2 class="brand-title">ipray</h2>
                <p class="brand-subtitle">Amefufuka</p>
            </div>
            <div class="app-bar-actions">
                <div class="toggle-container">
                    <button class="app-bar-btn toggle-btn" onclick="toggleDarkMode()" aria-label="Toggle dark mode" title="Toggle dark mode">Dark</button>
                </div>
                <button class="app-bar-btn hamburger" onclick="toggleMenu()" aria-label="Toggle navigation menu" aria-controls="nav-links" aria-expanded="false" type="button">
                    <span></span>
                    <span></span>
                    <span></span>
                </button>
            </div>
        </div>
        <nav class="app-bar-menu" aria-label="Amefufuka navigation">
            <ul id="nav-links" class="nav-links">
{nav}
            </ul>
        </nav>
    </header>
'''

FOOT = '''
    <script src="{r}js/amefufuka.js" defer></script>
    <script src="{r}js/prevent-zoom.js" defer></script>
    <script>
      if ('serviceWorker' in navigator) {{
        window.addEventListener('load', function () {{
          navigator.serviceWorker.register('/i-pray/service-worker.js').catch(function () {{}});
        }});
      }}
    </script>
</body>
</html>
'''

def nav_items(items):
    return '\n'.join(f'                <li><a href="{h}">{esc(t)}</a></li>' for h, t in items)

# file names in book order
order = []
extra_n = 0
used = set()
for s in songs:
    if s['page']:
        name = f"{s['page']:03d}-{slugify(s['title'])}"
    else:
        extra_n += 1
        name = f"nyongeza-{extra_n:02d}-{slugify(s['title'])}"
    while name in used: name += '-2'
    used.add(name)
    s['file'] = name + '.html'
    order.append(s)

if os.path.isdir(OUT):
    shutil.rmtree(OUT)
os.makedirs(os.path.join(OUT, 'img'))
for f in os.listdir(FIGS):
    if f.endswith('.png'):
        shutil.copy(os.path.join(FIGS, f), os.path.join(OUT, 'img', f))

def page_label(s):
    if s['page']:
        pages = sorted(set(p['page'] for p in s['parts'] if p.get('page')))
        return f"Ukurasa {pages[0]}" + (f"–{pages[-1]}" if len(pages) > 1 else '')
    return 'Nyongeza'

for s in order:
    sec = section_of(s['page'])
    title = nice_title(s['title'])
    nav = nav_items([('../../index.html', 'Nyumbani'), ('../amefufuka.html', 'Amefufuka — Orodha ya Nyimbo')])
    sub = ''.join(f'<p class="song-subtitle">{esc(t)}</p>' for t in s['subtitle'])
    body = f'''
    <div class="container">
        <div class="song-meta"><span><i class="amef-dot {sec[1]}"></i>{page_label(s)}</span><span>{esc(sec[2])}</span></div>
        <h1 class="song-title">{esc(title)}</h1>
        {sub}
        <article class="song-sheet" aria-label="{html.escape(title)}">
{render_song_body(s)}
        </article>
    </div>
'''
    doc = HEAD.format(r='../../', title=esc(title.title()) + ' - Amefufuka', extra=f' amef-song', nav=nav) + body + FOOT.format(r='../../')
    open(os.path.join(OUT, s['file']), 'w').write(doc)

# ---------------------------------------------------------------- index -----

about = open(os.path.join(os.path.dirname(__file__), 'about.html')).read()
secs_html = []
for sec in SECTIONS:
    items = [s for s in order if section_of(s['page']) is sec]
    if not items: continue
    lis = []
    for s in items:
        title = nice_title(s['title'])
        sub = ''.join(f'<small>{esc(t)}</small>' for t in s['subtitle'])
        pg = s['page'] if s['page'] else '—'
        lis.append(f'                <li data-page="{s["page"] or ""}"><a href="amefufuka/{s["file"]}"><span class="pg">{pg}</span><span class="ttl">{esc(title)}{sub}</span></a></li>')
    secs_html.append(f'''        <section class="amef-section" aria-labelledby="sec-{sec[0]}">
            <h2 id="sec-{sec[0]}"><i class="amef-dot {sec[1]}"></i>{esc(sec[2])} <small>{esc(sec[3])}</small></h2>
            <ul class="amef-list">
{chr(10).join(lis)}
            </ul>
        </section>''')

index_body = f'''
    <div class="container">
        <h1>AMEFUFUKA</h1>
        <p class="amef-intro">Nyimbo za Njia ya Neokatekumenato · Kenya – Tanzania</p>
        <div class="amef-search">
            <label for="amefSearch" class="sr-only" style="position:absolute;left:-9999px">Tafuta wimbo</label>
            <input id="amefSearch" type="search" placeholder="Tafuta wimbo au namba ya ukurasa…" autocomplete="off" enterkeyhint="search">
        </div>
        <p id="amefCount" class="amef-count">{len(order)} nyimbo</p>
        <p id="amefEmpty" class="amef-empty" hidden>Hakuna wimbo unaolingana na utafutaji wako.</p>
{chr(10).join(secs_html)}
{about}
    </div>
'''
nav = nav_items([('../index.html', 'Nyumbani'), ('daily-readings.html', 'Masomo ya Siku / Daily Readings'),
                 ('office-of-readings.html', 'Ofisi ya Masomo'), ('prayer-hour.html?hour=sext', 'Sala za Mchana'), ('prayer-hour.html?hour=vespers', 'Masifu ya Jioni')])
doc = HEAD.format(r='../', title='Amefufuka - Nyimbo', extra=' amef-index', nav=nav) + index_body + FOOT.format(r='../')
open(os.path.join(ROOT, 'pages', 'amefufuka.html'), 'w').write(doc)
print('wrote', len(order), 'songs')

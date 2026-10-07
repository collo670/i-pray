"""Parse the Amefufuka songbook (chars.json from dump_chars.py) into songs.json.

Each song keeps the PDF's own structure: per PDF page a list of bands, each
band either full width ('span') or two side-by-side columns ('cols'). Every
lyric line carries its chords anchored to the exact character they sit over.
"""
import json, re, sys
from collections import Counter, defaultdict

SRC, OUT = sys.argv[1], sys.argv[2]
pages = json.load(open(SRC))
IMAGES = json.load(open(SRC.replace('chars.json', 'images.json')))

FIRST, LAST = 14, 221           # 1-based PDF pages holding songs (222 is a scan)

def book_page(n):
    if 14 <= n <= 151: return n - 13
    if 152 <= n <= 173: return n + 49
    if 174 <= n <= 205: return n + 87
    return None

def colclass(col):
    if len(col) == 3:
        r, g, b = col
        if r > 0.5 and g < 0.3 and b < 0.3: return 'red'
        if r < 0.2 and g < 0.2 and b > 0.5: return 'blue'
        if max(col) < 0.25: return 'black'
        return 'other'
    if len(col) == 1:
        v = col[0]
        if v is None or v < 0.25: return 'black'
        return 'gray'
    if len(col) == 4:  # cmyk
        c, m, y, k = col
        if k > 0.75: return 'black'
        if m > 0.5 and y > 0.5 and c < 0.3: return 'red'
        return 'other'
    return 'black'

CHORD_RE = re.compile(r'^\(?(?:[A-G]|Do|Re|Mi|Fa|Sol|La|Si)(?:b|d|#|♯|♭)?(?:-|m|maj|min|dim|aug|sus|add|°|\+|\*|[0-9])*'
                      r'(?:/[A-G](?:b|d|#)?)?\*{0,3}\)?(?:\.\.\.|…)?$')
MARK_RE = re.compile(r'^(?:\(?\*{1,3}\)?|\(\d+\)|\.\.\.|…)$')

def is_chord_tok(t):
    return bool(CHORD_RE.match(t))

def is_chord_or_mark(t):
    return bool(CHORD_RE.match(t) or MARK_RE.match(t))

class Word:
    __slots__ = ('chars', 'text', 'x0', 'x1', 'top', 'bot', 'color', 'bold', 'italic', 'size', 'font')
    def __init__(self, chars):
        self.chars = chars
        self.text = ''.join(c['t'] for c in chars)
        self.x0 = min(c['x0'] for c in chars); self.x1 = max(c['x1'] for c in chars)
        self.top = min(c['top'] for c in chars); self.bot = max(c['bot'] for c in chars)
        cc = Counter(c['cls'] for c in chars)
        self.color = cc.most_common(1)[0][0]
        self.bold = sum(1 for c in chars if 'Bold' in c['font']) * 2 > len(chars)
        self.italic = sum(1 for c in chars if 'Italic' in c['font']) * 2 > len(chars)
        self.size = max(c['size'] for c in chars)
        self.font = Counter(c['font'] for c in chars).most_common(1)[0][0]
    @property
    def cy(self): return (self.top + self.bot) / 2
    def __repr__(self): return f'W({self.text!r},{self.x0:.0f},{self.top:.0f},{self.color})'

def cluster_rows(chars, tol=3.0):
    """Group chars into visual rows by their top coordinate."""
    chars = sorted(chars, key=lambda c: c['top'])
    rows, cur, last = [], [], None
    for c in chars:
        if cur and c['top'] - last > tol:
            rows.append(cur); cur = []
        cur.append(c); last = c['top']
    if cur: rows.append(cur)
    return rows

def split_words(row):
    row = sorted(row, key=lambda c: c['x0'])
    words, cur = [], []
    prev = None
    for c in row:
        if not c['t'].strip():
            if cur: words.append(cur); cur = []
            prev = c; continue
        if cur:
            p = cur[-1]
            gap = c['x0'] - p['x1']
            if gap > max(1.6, 0.18 * c['size']) or (c['cls'] != p['cls'] and gap > 0.4):
                words.append(cur); cur = []
        cur.append(c); prev = c
    if cur: words.append(cur)
    return [Word(w) for w in words]

CHORD_PIECE = re.compile(r'[A-G](?:b|d|#)?(?:-|m(?!a)|maj|dim|sus|°|\+|\*|[0-9])*')

def split_fused_chords(w):
    """'B-A' printed tight together -> two chord words."""
    if w.color != 'red' or is_chord_tok(w.text) or len(w.text) < 2:
        return [w]
    if not re.search(r'[-0-9]', w.text):
        return [w]
    pieces = []
    pos = 0
    t = w.text
    while pos < len(t):
        m = CHORD_PIECE.match(t, pos)
        if not m or m.end() == pos:
            return [w]
        pieces.append((pos, m.end())); pos = m.end()
    if len(pieces) < 2:
        return [w]
    return [Word(w.chars[a:b]) for a, b in pieces]

def page_words(p):
    """Return (words, braces, figures) for one page."""
    chars = []
    braces = []
    for c in p['chars']:
        c = dict(c)
        c['cls'] = colclass(c['col'])
        if not c['t'].strip() and c['size'] > 14:
            continue
        if c['t'] in '}{' and c['size'] >= 20:
            braces.append(c); continue
        if c['t'] == '\uf020':
            continue
        chars.append(c)
    words = []
    for row in cluster_rows(chars):
        for w in split_words(row):
            words.extend(split_fused_chords(w))
    W, H = p['w'], p['h']
    # footnote rule: a short thin bar low on the page
    rule = None
    for s in p['rects'] + p['lines']:
        if s['bot'] - s['top'] < 1.5 and 55 <= s['x1'] - s['x0'] <= 220 and s['top'] > 0.55 * H:
            if rule is None or s['top'] < rule['top']:
                rule = s
    # graphics: chord diagrams, music staves, scanned images
    gfx = [s for s in p['curves'] + p['lines'] if s is not rule and s['x1'] - s['x0'] < 400]
    gfx += IMAGES.get(str(p['n']), [])
    clusters = []
    for g in sorted(gfx, key=lambda g: (g['top'], g['x0'])):
        for c in clusters:
            if g['x0'] < c['x1'] + 30 and g['x1'] > c['x0'] - 30 and g['top'] < c['bot'] + 30 and g['bot'] > c['top'] - 30:
                c['x0'] = min(c['x0'], g['x0']); c['x1'] = max(c['x1'], g['x1'])
                c['top'] = min(c['top'], g['top']); c['bot'] = max(c['bot'], g['bot'])
                break
        else:
            clusters.append(dict(x0=g['x0'], x1=g['x1'], top=g['top'], bot=g['bot']))
    figures = []
    for c in clusters:
        z = dict(x0=c['x0'] - 50, x1=c['x1'] + 50, top=c['top'] - 24, bot=c['bot'] + 16)
        if rule and c['top'] > rule['top']:
            # the whole footnote under the rule becomes one figure
            z = dict(x0=rule['x0'] - 25, x1=max(c['x1'] + 10, rule['x1']), top=rule['top'] + 1, bot=c['bot'] + 16)
        inside = [w for w in words if z['x0'] <= (w.x0 + w.x1) / 2 <= z['x1'] and z['top'] <= w.cy <= z['bot']]
        if rule and c['top'] > rule['top']:
            inside = [w for w in words if w.top > rule['top']]
        if inside:
            z['x0'] = min(z['x0'], min(w.x0 for w in inside) - 6)
            z['x1'] = max(z['x1'], max(w.x1 for w in inside) + 6)
            z['top'] = min(z['top'] + 20, min(w.top for w in inside) - 4) if not (rule and c['top'] > rule['top']) else min(z['top'], min(w.top for w in inside) - 4)
            z['bot'] = max(z['bot'], max(w.bot for w in inside) + 4)
        z['x0'] = max(0, z['x0']); z['top'] = max(0, z['top'])
        z['x1'] = min(W, z['x1']); z['bot'] = min(H, z['bot'])
        ids = set(id(w) for w in inside)
        words = [w for w in words if id(w) not in ids]
        figures.append({k: round(v, 1) for k, v in z.items()})
    for f in figures:
        if rule and f['top'] > rule['top'] - 2:
            f['top'] = min(f['top'], rule['top'] - 3)
    merged = []
    for f in sorted(figures, key=lambda f: f['top']):
        for m in merged:
            if f['x0'] < m['x1'] and f['x1'] > m['x0'] and f['top'] < m['bot'] and f['bot'] > m['top']:
                m.update(x0=min(m['x0'], f['x0']), x1=max(m['x1'], f['x1']), top=min(m['top'], f['top']), bot=max(m['bot'], f['bot']))
                break
        else:
            merged.append(dict(f))
    figures = merged
    page_words.rule = rule
    return words, braces, figures

# ---------------------------------------------------------------- titles ----

def is_title_word(w, n):
    if w.color != 'red': return False
    if is_chord_tok(w.text) and not (w.bold and w.size >= 10.9 and n < 206): return False
    if w.italic and w.size < 13: return False
    if w.bold and w.size >= 10.9: return True
    if w.size >= 13 and not is_chord_tok(w.text): return True
    return False

def group_lines(words, ytol=3.5):
    rows = []
    for w in sorted(words, key=lambda w: (w.top, w.x0)):
        for r in rows:
            if abs(r[0].top - w.top) <= ytol:
                r.append(w); break
        else:
            rows.append([w])
    return [sorted(r, key=lambda w: w.x0) for r in rows]

def split_by_gap(row, gap):
    parts, cur = [], [row[0]]
    for w in row[1:]:
        if w.x0 - cur[-1].x1 > gap:
            parts.append(cur); cur = []
        cur.append(w)
    parts.append(cur)
    return parts

def find_titles(words, n):
    cands = [w for w in words if is_title_word(w, n)]
    lines = []
    for row in group_lines(cands):
        for part in split_by_gap(row, 40):
            lines.append(part)
    # extend each title line with red words on the same row (references like
    # "(Rej. Yn 15...)" printed in a lighter weight)
    used = set(id(w) for l in lines for w in l)
    for l in lines:
        changed = True
        while changed:
            changed = False
            for w in words:
                if id(w) in used or w.color != 'red': continue
                if abs(w.top - l[0].top) > 4 and abs(w.bot - l[0].bot) > 4: continue
                if (0 <= w.x0 - l[-1].x1 <= 14) or (0 <= l[0].x0 - w.x1 <= 14):
                    if is_chord_tok(w.text) and w.size < 10.9: continue
                    l.append(w); used.add(id(w)); l.sort(key=lambda w: w.x0); changed = True
    lines.sort(key=lambda l: (l[0].top, l[0].x0))
    # merge subtitle lines that sit just under a title line
    blocks = []
    for l in lines:
        x0 = min(w.x0 for w in l); x1 = max(w.x1 for w in l); top = min(w.top for w in l); bot = max(w.bot for w in l)
        cx = (x0 + x1) / 2
        for b in blocks:
            if 0 <= top - b["bot"] <= 22 and b["x0"] - 60 <= cx <= b["x1"] + 60:
                b['lines'].append(l); b['bot'] = bot; b['x0'] = min(b['x0'], x0); b['x1'] = max(b['x1'], x1)
                break
        else:
            blocks.append(dict(lines=[l], x0=x0, x1=x1, top=top, bot=bot))
    # subtitles in another colour/weight centred right under a title
    used = set(id(w) for b in blocks for l in b['lines'] for w in l)
    for b in blocks:
        cx = (b['x0'] + b['x1']) / 2
        extra = [w for w in words if id(w) not in used and w.color in ('red', 'gray', 'other')
                 and 0 <= w.top - b['bot'] <= 9 and not is_chord_tok(w.text)]
        if extra:
            rows = group_lines(extra)
            row = rows[0]
            rx0 = row[0].x0; rx1 = row[-1].x1
            if abs((rx0 + rx1) / 2 - cx) < 40 and not any(w.text.lower().startswith('cape') for w in row):
                b['lines'].append(row); b['bot'] = max(w.bot for w in row)
                for w in row: used.add(id(w))
    for b in blocks:
        b['words'] = [w for l in b['lines'] for w in l]
        b['text'] = [' '.join(w.text for w in l) for l in b['lines']]
    return blocks

# --------------------------------------------------------------- columns ----

PLAIN_LABELS = {'K.', 'M.', 'P.', 'W.', 'M.+K.', 'M+K.', 'K.+M.', 'D.', 'S.', 'B.', 'T.'}

def looks_label(w):
    if w.color != 'black': return False
    if w.text in PLAIN_LABELS: return True
    return w.bold and len(w.text) <= 6 and (w.text.endswith('.') or w.text.endswith(':')) and w.text[:1].isupper()

BASE = [10.5]   # dominant lyric font size of the region being laid out

def BIG(): return BASE[0] * 0.9
def SMALL(): return BASE[0] * 0.877

def set_base(words):
    sizes = Counter(round(w.size * 2) / 2 for w in words if w.color == 'black' and len(w.text) > 1)
    BASE[0] = sizes.most_common(1)[0][0] if sizes else 10.5

def _alnum(ws):
    return sum(sum(ch.isalnum() for ch in w.text) for w in ws)

def detect_split(words):
    """Find the best gutter between two columns. Returns x or None."""
    body = [w for w in words if w.size >= BIG() and w.color in ('black', 'gray')]
    if len(body) < 6: body = [w for w in words if w.size >= BIG()]
    if len(body) < 6: return None
    rows = group_lines(body, 3)
    span_lo = min(w.x0 for w in body); span_hi = max(w.x1 for w in body)
    width = span_hi - span_lo
    if width < 120: return None
    lo = span_lo + 0.18 * width; hi = span_hi - 0.18 * width
    if hi <= lo: return None
    xs = [lo + k * 0.5 for k in range(int((hi - lo) * 2) + 1)]
    cov = [sum(1 for r in rows if any(w.x0 - 0.3 <= x <= w.x1 + 0.3 for w in r)) for x in xs]
    limit = max(1, int(0.3 * len(rows)))
    for t in sorted(set(c for c in cov if c <= limit)):
        runs, run = [], None
        for x, c in zip(xs, cov):
            if c <= t:
                run = [run[0], x, max(run[2], c)] if run else [x, x, c]
            elif run:
                runs.append(run); run = None
        if run: runs.append(run)
        best = None
        for a, b, c in runs:
            wrun = b - a
            # cut right where the next column begins: notes beside the left
            # column ("(m. 2)", braces) stay with it, and hairline gutters work
            split = b
            L = [w for w in body if w.x1 <= split]; R = [w for w in body if w.x0 >= split]
            la, ra = _alnum(L), _alnum(R)
            if la < 30 or ra < 30 or min(la, ra) < 0.12 * (la + ra): continue
            nl = sum(1 for r in rows if any(w.x1 <= split for w in r))
            nr = sum(1 for r in rows if any(w.x0 >= split for w in r))
            if nl < 2 or nr < 2: continue
            # labels (K., M.) belong with the text on their right: never cut
            # between a label and its line
            edge = [w for w in body if split - 16 <= w.x1 <= split]
            if edge and sum(1 for w in edge if looks_label(w)) * 2 >= len(edge):
                continue
            # rows holding text on both sides: a real gutter leaves a wide gap
            # there (or the right part opens with a K./M. label); a double
            # space inside one line does not
            gaps = []
            left_edge = min(min(w.x0 for w in r) for r in rows)
            for r in rows:
                Lw = [w for w in r if w.x1 <= split]; Rw = [w for w in r if w.x0 >= split]
                if min(w.x0 for w in r) > left_edge + 30:
                    continue  # centred/indented full-width rows (refrains)
                if any(w.x0 < split < w.x1 for w in r):
                    gaps.append(0)
                elif Lw and Rw:
                    r0 = min(Rw, key=lambda w: w.x0)
                    gaps.append(99 if looks_label(r0) else r0.x0 - max(w.x1 for w in Lw))
            if gaps:
                gaps.sort()
                if gaps[len(gaps) // 2] < 10:
                    continue
            lastL = [max([w for w in r if w.x1 <= split], key=lambda w: w.x1) for r in rows
                     if any(w.x1 <= split for w in r) and any(w.x0 >= split for w in r)]
            if lastL and sum(1 for w in lastL if looks_label(w) and w.x1 >= split - 30) * 2 >= len(lastL):
                continue
            # tab-aligned responses inside one column ("– Shemá Israel") are
            # not a column: no labels, few rows, each sharing a line with the left
            rrows = [r for r in rows if any(w.x0 >= split for w in r)]
            lrows = [r for r in rows if any(w.x1 <= split for w in r)]
            if not any(looks_label(w) for r in rrows for w in r if w.x0 >= split) \
                    and all(any(w.x1 <= split for w in r) for r in rrows) \
                    and len(rrows) < 0.4 * len(lrows):
                continue
            rstarts = [min(w.x0 for w in r if w.x0 >= split) for r in rows if any(w.x0 >= split for w in r)]
            m0 = min(rstarts)
            align = sum(1 for s in rstarts if s - m0 <= 2.5)
            if not (wrun >= 6 or (wrun >= 0.5 and align >= 3)):
                continue
            key = (min(wrun, 20) + 2 * align)
            if best is None or key > best[0]:
                best = (key, split)
        if best:
            return best[1]
    return None

def find_splits(words, depth=0):
    if depth > 2: return []
    s = detect_split(words)
    if s is None: return []
    L = [w for w in words if w.x1 <= s or (w.size < BIG() and (w.x0 + w.x1) / 2 <= s)]
    R = [w for w in words if w.x0 >= s or (w.size < BIG() and (w.x0 + w.x1) / 2 > s)]
    return find_splits(L, depth + 1) + [s] + find_splits(R, depth + 1)

# ---------------------------------------------------------------- lines -----

LABEL_RE = re.compile(r'^(?:[A-Z][a-z]?\d?\.?(?:\s?\+\s?[A-Z]\.?)*|M\.?\s?na\s?K\.?|Wote|WOTE|Solo|SOLO|Wanaume|Wanawake)[.:]?$')

def is_label_words(ws):
    t = ' '.join(w.text for w in ws)
    if not all(w.color == 'black' for w in ws):
        return False
    if not all(w.bold for w in ws) and t not in PLAIN_LABELS:
        return False
    if len(t) > 8: return False
    if not (t.endswith('.') or t.endswith(':') or t in ('K', 'M')): return False
    return bool(LABEL_RE.match(t.replace(' ', ' ')))

def chord_html(w):
    out = []
    for c in w.chars:
        t = c['t']
        t = t.replace('&', '&amp;').replace('<', '&lt;')
        if 'Italic' in c['font']:
            out.append(f'<i>{t}</i>')
        elif c['size'] < w.size * 0.8 and t.isdigit():
            out.append(f'<sup>{t}</sup>')
        else:
            out.append(t)
    html = ''.join(out).replace('</i><i>', '')
    return html

def merge_chord_words(ws):
    """'B' 'b' printed as two words -> 'Bb'; keeps a lone italic 'd' with its root."""
    out = []
    for w in sorted(ws, key=lambda w: w.x0):
        if out and w.text in ('b', 'd', '-', '7') and w.x0 - out[-1].x1 < 3.2 and out[-1].text[:1] in 'ABCDEFG':
            out[-1] = Word(out[-1].chars + w.chars)
        elif out and MARK_RE.match(w.text) and w.x0 - out[-1].x1 < 8 and is_chord_tok(out[-1].text.split('\u00a0')[0]):
            # footnote marks printed after a chord ("G7 *", "E (**)")
            sp = dict(w.chars[0]); sp['t'] = '\u00a0'
            nw = Word(out[-1].chars + [sp] + w.chars)
            out[-1] = nw
        else:
            out.append(w)
    return out

def row_kind(ws):
    toks = [w for w in ws]
    if all(w.color == 'red' and is_chord_or_mark(w.text) for w in toks) and any(is_chord_tok(w.text) for w in toks):
        return 'chord'
    if all(w.color == 'red' for w in toks):
        # a red row that is mostly chords with a stray symbol
        ch = sum(1 for w in toks if is_chord_tok(w.text) or w.text in ('b', 'd', '-', '|', '/', '(', ')'))
        if ch == len(toks):
            return 'chord'
        return 'note'
    return 'text'

def build_line(chord_ws, text_ws, col_x0):
    """Build a lyric line: label + runs + chords anchored to char indices."""
    text_ws = sorted(text_ws, key=lambda w: w.x0)
    all_ws = list(text_ws) + list(chord_ws)
    label = None
    # label = leading bold black short words close to the column's left edge
    for k in (3, 2, 1):
        if len(text_ws) > k - 1 and is_label_words(text_ws[:k]):
            # require a visible gap after the label or a typical label shape
            label = ' '.join(w.text for w in text_ws[:k])
            label_x0 = text_ws[0].x0
            text_ws = text_ws[k:]
            break
    chars = []   # (char, x0, x1, style)
    for i, w in enumerate(text_ws):
        if i > 0:
            prev = text_ws[i - 1]
            gap = w.x0 - prev.x1
            if gap > 12:
                # tab-aligned part of the line: keep the horizontal distance
                nsp = max(2, round(gap / 5.5))
                step = gap / nsp
                for k in range(nsp):
                    chars.append(('\u2002', prev.x1 + k * step, prev.x1 + (k + 1) * step, None))
            else:
                chars.append((' ', prev.x1, w.x0, None))
        for c in w.chars:
            style = []
            if 'Bold' in c['font'] and c['cls'] == 'black': style.append('b')
            if 'Italic' in c['font']: style.append('i')
            if c['cls'] == 'red': style.append('r')
            if c['cls'] in ('gray', 'other'): style.append('g')
            if c['size'] <= SMALL(): style.append('s')
            chars.append((c['t'], c['x0'], c['x1'], ''.join(style)))
    text = ''.join(c[0] for c in chars)
    maxgap = max([text_ws[i + 1].x0 - text_ws[i].x1 for i in range(len(text_ws) - 1)] or [0])
    anchors = []
    if chord_ws and chars:
        first_x = chars[0][1]; last_x = chars[-1][2]
        avgw = max(3.0, (last_x - first_x) / max(1, len(chars)))
        for cw in merge_chord_words(chord_ws):
            x = cw.x0 + 0.8
            idx = None
            if x >= last_x - 0.5:
                pad = max(1, round((cw.x0 - last_x) / avgw))
                anchors.append(dict(i=len(chars), pad=pad, c=chord_html(cw), raw=cw.text))
                continue
            if x <= first_x:
                idx = 0
            else:
                for j, ch in enumerate(chars):
                    if ch[1] - 0.6 <= x < ch[2] + 0.6 or (j + 1 < len(chars) and ch[2] <= x < chars[j + 1][1]):
                        idx = j; break
                if idx is None: idx = len(chars) - 1
            # a chord over the space between words belongs to the next word
            while idx < len(chars) - 1 and chars[idx][0] in (' ', '\u2002'):
                idx += 1
            anchors.append(dict(i=idx, c=chord_html(cw), raw=cw.text, lead=(cw.x0 < first_x - 4)))
    # resolve duplicate anchors by pushing later chords one char right
    anchors.sort(key=lambda a: (a['i'], a.get('pad', 0)))
    for k in range(1, len(anchors)):
        if anchors[k]['i'] <= anchors[k - 1]['i'] and anchors[k].get('pad') is None:
            anchors[k]['i'] = min(anchors[k - 1]['i'] + 1, len(chars))
    runs = []
    for ch in chars:
        if runs and runs[-1][1] == ch[3]:
            runs[-1][0] += ch[0]
        else:
            runs.append([ch[0], ch[3]])
    tx0 = text_ws[0].x0 if text_ws else (chord_ws[0].x0 if chord_ws else col_x0)
    return dict(type='line', label=label, text=text, styles=[c[3] for c in chars],
                chords=anchors, x0=round(tx0, 1), maxgap=round(maxgap, 1),
                ttop=min(w.top for w in text_ws) if text_ws else None,
                top=min(w.top for w in all_ws),
                bot=max(w.bot for w in all_ws if w not in chord_ws) if any(w not in chord_ws for w in all_ws) else max(w.bot for w in all_ws))

def chord_only_line(chord_ws, col_x0):
    ws = merge_chord_words(chord_ws)
    items = []
    for w in ws:
        items.append(dict(x=round(w.x0, 1), c=chord_html(w), raw=w.text))
    return dict(type='chords', items=items, x0=round(ws[0].x0, 1), top=min(w.top for w in ws), bot=max(w.bot for w in ws))

def note_line(ws):
    ws = sorted(ws, key=lambda w: w.x0)
    parts = []
    for w in ws:
        st = ''
        if w.color == 'red': st += 'r'
        if w.italic: st += 'i'
        if w.bold: st += 'b'
        if w.size <= SMALL(): st += 's'
        parts.append(dict(t=w.text, s=st))
    return dict(type='note', parts=parts, x0=round(ws[0].x0, 1), top=min(w.top for w in ws), bot=max(w.bot for w in ws))

REPEAT_NOTE = re.compile(r'^\(?\s*(m\.?|mara|bis|BIS|x|\d|\*+|2\)?|\)|\.)$')

def pull_brace_notes(words, braces):
    """Detach the '(m. 2)' style notes printed beside a repeat brace."""
    notes = {}
    rest = list(words)
    for bi, br in enumerate(braces):
        lo = br['top']; hi = br['bot']
        near = [w for w in rest if br['x0'] - 2 <= w.x0 <= br['x0'] + 70 and lo <= w.cy <= hi
                and ((w.size <= SMALL() + 0.4) or ((w.size <= BASE[0] + 0.1) and (REPEAT_NOTE.match(w.text) or w.text.startswith('(') or w.text.endswith(')') or w.text in ('BIS', 'bis', '**', '*'))))]
        if near:
            near.sort(key=lambda w: (round(w.top / 4), w.x0))
            notes[bi] = ' '.join(w.text for w in near).replace('( ', '(')
            ids = set(id(w) for w in near)
            rest = [w for w in rest if id(w) not in ids]
    return rest, notes

def build_column(words, braces, col_x0=None):
    """Turn a column's words into ordered line objects."""
    if not words: return [], []
    words, bnotes = pull_brace_notes(words, braces)
    if not words: return [], []
    rows = group_lines(words, 3.0)
    rows.sort(key=lambda r: min(w.top for w in r))
    if col_x0 is None:
        col_x0 = Counter(round(r[0].x0) for r in rows).most_common(1)[0][0]
    kinds = [row_kind(r) for r in rows]
    out = []
    i = 0
    while i < len(rows):
        r, k = rows[i], kinds[i]
        if k == 'chord':
            nxt = rows[i + 1] if i + 1 < len(rows) else None
            if nxt is not None and kinds[i + 1] == 'text':
                dy = min(w.top for w in nxt) - min(w.top for w in r)
                if 4 <= dy <= 19:
                    out.append(build_line(r, nxt, col_x0)); i += 2; continue
            out.append(chord_only_line(r, col_x0)); i += 1; continue
        if k == 'note':
            out.append(note_line(r)); i += 1; continue
        out.append(build_line([], r, col_x0)); i += 1
    # stanza gaps
    for a, b in zip(out, out[1:]):
        gap = b['top'] - a['bot']
        b['gap'] = round(gap, 1)
    if out: out[0]['gap'] = 0
    # repeat braces
    groups = []
    for bi, br in enumerate(braces):
        size = br['size']
        lo = br['top'] + 0.12 * size; hi = br['bot'] - 0.08 * size
        def mid(l):
            if l['type'] == 'line' and l.get('ttop') is not None:
                return (l['ttop'] + l['bot']) / 2
            return (l['top'] + l['bot']) / 2
        members = [j for j, l in enumerate(out) if l['type'] in ('line', 'chords', 'note') and lo <= mid(l) <= hi]
        if members:
            groups.append(dict(start=min(members), end=max(members), note=bnotes.get(bi, ''), x=br['x0'], cy=(br['top'] + br['bot']) / 2, size=size))
    return out, groups

# ---------------------------------------------------------------- pages -----

def col_of(x, splits):
    k = 0
    for s in splits:
        if x > s: k += 1
    return k

def is_crossing(w, splits):
    if w.size < BIG(): return False
    return any(w.x0 < s - 3 and w.x1 > s + 3 for s in splits)

def row_runs_over(r, splits):
    """True when a row is one continuous line running across a gutter."""
    if any(is_crossing(w, splits) for w in r): return True
    big = [w for w in r if w.size >= BIG()]
    for s in splits:
        L = [w for w in big if (w.x0 + w.x1) / 2 < s]; R = [w for w in big if (w.x0 + w.x1) / 2 >= s]
        if L and R:
            l1 = max(L, key=lambda w: w.x1); r0 = min(R, key=lambda w: w.x0)
            if r0.x0 - l1.x1 < 8 and not looks_label(r0) and l1.color == r0.color and not (l1.color == 'red'):
                return True
    return False

def assign_rows_to_columns(words, splits):
    """Split words into per-column word lists plus full-width rows."""
    ncol = len(splits) + 1
    cols = [[] for _ in range(ncol)]
    rows = group_lines(words, 3.0)
    rows.sort(key=lambda r: min(w.top for w in r))
    if not splits:
        return [[w for r in rows for w in r]], []
    starts = []
    for k in range(ncol):
        parts = []
        for r in rows:
            ws = [w for w in r if not is_crossing(w, splits) and col_of((w.x0 + w.x1) / 2, splits) == k]
            if ws: parts.append(round(min(w.x0 for w in ws)))
        starts.append(Counter(parts).most_common(1)[0][0] if parts else None)
    kinds = []
    for r in rows:
        if not row_runs_over(r, splits):
            kinds.append(None); continue
        first = min(r, key=lambda w: w.x0)
        k = col_of(first.x0 + 0.1, splits)
        # a long line of column k runs over the gutter: keep it in column k
        tail = sorted([w for w in r if w.x0 >= first.x0], key=lambda w: w.x0)
        contiguous = all(tail[i + 1].x0 - tail[i].x1 < 14 for i in range(len(tail) - 1))
        if starts[k] is not None and abs(first.x0 - starts[k]) <= 30 and contiguous:
            kinds.append(('col', k))
        else:
            kinds.append(('span',))
    # a chord row right above a full-width row belongs to it
    for i, r in enumerate(rows):
        if kinds[i] and kinds[i][0] == 'span' and i > 0 and kinds[i - 1] is None and row_kind(rows[i - 1]) == 'chord':
            if 4 <= min(w.top for w in r) - min(w.top for w in rows[i - 1]) <= 19:
                sx0 = min(w.x0 for w in r) - 12; sx1 = max(w.x1 for w in r) + 12
                if all(sx0 <= w.x0 and w.x1 <= sx1 for w in rows[i - 1]):
                    kinds[i - 1] = ('span',)
    span_rows = []
    pending = []
    for r, kd in zip(rows, kinds):
        if kd is None:
            for w in r: cols[col_of((w.x0 + w.x1) / 2, splits)].append(w)
        elif kd[0] == 'col':
            cols[kd[1]].extend(r)
        else:
            pending.extend(r)
            continue
        if pending:
            span_rows.append(pending); pending = []
    if pending: span_rows.append(pending)
    # merge chord row + its text row into one span block
    return cols, span_rows

def is_footnote_start(text):
    return bool(re.match(r'^\(?\*{1,3}\)?(\s|$)', text)) or text.startswith('(*)')

def layout_region(words, braces, n, region_box, rule_top=None):
    """Order a region's words into full-width and multi-column bands."""
    if not words:
        return []
    set_base(words)
    splits = find_splits(words)
    cols, span_rows = assign_rows_to_columns(words, splits)
    lower = region_box[1] + 0.45 * (region_box[3] - region_box[1])
    region_x0 = min(w.x0 for w in words)
    # footnotes: rows starting with (*) / * in the lower part of the region
    foot_top = rule_top
    for ws in ([] if rule_top else cols + span_rows):
        rows = group_lines(ws, 3.0)
        rows.sort(key=lambda r: r[0].top)
        for idx, r in enumerate(rows):
            t = ' '.join(w.text for w in sorted(r, key=lambda w: w.x0))
            if is_footnote_start(t) and r[0].top > lower and min(w.x0 for w in r) <= region_x0 + 40:
                prev = rows[idx - 1] if idx else None
                if prev and row_kind(prev) == 'chord' and r[0].top - prev[0].top < 18: continue
                if foot_top is None or r[0].top < foot_top: foot_top = r[0].top
                break
    foot = []
    if foot_top is not None:
        for k in range(len(cols)):
            foot.extend(w for w in cols[k] if w.top >= foot_top - 1)
            cols[k] = [w for w in cols[k] if w.top < foot_top - 1]
        keep = []
        for r in span_rows:
            if min(w.top for w in r) >= foot_top - 1: foot.extend(r)
            else: keep.append(r)
        span_rows = keep
    span_rows.sort(key=lambda r: min(w.top for w in r))
    bcol = [[] for _ in cols]
    for b in braces:
        bcol[min(len(cols) - 1, col_of(b['x0'] - 5, splits))].append(b)
    bands = []
    cuts = [min(w.top for w in r) for r in span_rows] + [1e9]
    prev = -1e9
    for ci, cut in enumerate(cuts):
        parts = []
        for k, ws in enumerate(cols):
            sel = [w for w in ws if prev <= w.top < cut]
            br = [b for b in bcol[k] if prev - 20 <= b['top'] < cut]
            if sel:
                lines, groups = build_column(sel, br)
                parts.append(dict(lines=lines, groups=groups))
            else:
                parts.append(None)
        filled = [p for p in parts if p]
        if len(filled) == 1:
            bands.append(dict(kind='span', lines=filled[0]['lines'], groups=filled[0]['groups']))
        elif filled:
            bands.append(dict(kind='cols', cols=[p or dict(lines=[], groups=[]) for p in parts], splits=splits))
        if ci < len(span_rows):
            lines, groups = build_column(span_rows[ci], [b for b in braces if min(w.top for w in span_rows[ci]) - 20 <= b['top'] <= max(w.bot for w in span_rows[ci])])
            if bands and bands[-1]['kind'] == 'span' and bands[-1].get('full'):
                bands[-1]['lines'].extend(lines); bands[-1]['groups'].extend(groups)
            else:
                bands.append(dict(kind='span', full=True, lines=lines, groups=groups))
            prev = max(w.top for w in span_rows[ci]) + 0.5
    if foot:
        lines, groups = build_column(foot, [])
        bands.append(dict(kind='foot', lines=lines, groups=groups))
    return bands

songs = []
current = None
log = []

for p in pages:
    n = p['n']
    if n < FIRST or n > LAST:
        continue
    words, braces, figures = page_words(p)
    rule = page_words.rule
    # drop the page number in the top corner
    words = [w for w in words if not (w.top < 45 and re.fullmatch(r'\d{1,3}', w.text) and w.color == 'black' and (w.x0 < 70 or w.x1 > p['w'] - 70 or w.size >= 11.4))]
    titles = find_titles(words, n)
    tw = set(id(w) for t in titles for w in t['words'])
    body = [w for w in words if id(w) not in tw]
    W = p['w']; H = p['h']
    # region boxes
    titles.sort(key=lambda t: (round(t['top'] / 8), t['x0']))
    # group side-by-side titles
    tiers = []
    for t in titles:
        if tiers and abs(tiers[-1][0]['top'] - t['top']) < 8:
            tiers[-1].append(t)
        else:
            tiers.append([t])
    regions = []  # (title or None, box)
    first_top = tiers[0][0]['top'] if tiers else H + 1
    if any(w.top < first_top - 2 for w in body):
        regions.append((None, (0, 0, W, first_top - 2)))
    for ti, tier in enumerate(tiers):
        top = min(t['top'] for t in tier)
        bot = min(t['top'] for t in tiers[ti + 1]) - 2 if ti + 1 < len(tiers) else H + 10
        if len(tier) == 1:
            regions.append((tier[0], (0, top, W, bot)))
        else:
            tier.sort(key=lambda t: t['x0'])
            for k, t in enumerate(tier):
                xl = 0 if k == 0 else (tier[k - 1]['x1'] + t['x0']) / 2
                xr = W if k == len(tier) - 1 else (t['x1'] + tier[k + 1]['x0']) / 2
                regions.append((t, (xl, top, xr, bot)))
    # side-by-side titles: split region by the body gutter rather than title midpoint
    for title, box in regions:
        rw = [w for w in body if box[0] <= (w.x0 + w.x1) / 2 < box[2] and box[1] <= w.top < box[3]]
        rb = [b for b in braces if box[0] <= b['x0'] < box[2] + 40 and box[1] - 10 <= b['top'] < box[3]]
        if title is None:
            if current is None:
                log.append(f'PDF{n}: orphan content before first title'); continue
        else:
            current = dict(title=title['text'][0], subtitle=title['text'][1:], page=book_page(n),
                           pdf=[n], parts=[], title_html=None,
                           title_words=[[dict(t=w.text, b=w.bold, i=w.italic, red=w.color == 'red', size=w.size) for w in l] for l in title['lines']])
            songs.append(current)
        if current['pdf'][-1] != n:
            current['pdf'].append(n)
        foot_top = rule['top'] if rule and box[1] <= rule['top'] <= box[3] else None
        bands = layout_region(rw, rb, n, box, foot_top)
        part = dict(pdf=n, page=book_page(n), bands=bands)
        figs = [f for f in figures if box[1] <= f['top'] + 4 <= box[3] and box[0] <= (f['x0'] + f['x1']) / 2 <= box[2]]
        if figs:
            part['figures'] = figs
        current['parts'].append(part)

json.dump(songs, open(OUT, 'w'), ensure_ascii=False, indent=0)
print(len(songs), 'songs')
for l in log: print(l)

"""Render figure zones of songs.json to transparent PNGs."""
import json, subprocess, sys, os
from PIL import Image
songs = json.load(open(sys.argv[1])); pdf = sys.argv[2]; outdir = sys.argv[3]
os.makedirs(outdir, exist_ok=True)
DPI = 200; k = DPI / 72
for s in songs:
    for part in s['parts']:
        for i, f in enumerate(part.get('figures', [])):
            name = f"fig-{part['pdf']}-{i + 1}"
            f['img'] = name + '.png'
            x, y = int(f['x0'] * k), int(f['top'] * k)
            w, h = int((f['x1'] - f['x0']) * k), int((f['bot'] - f['top']) * k)
            base = os.path.join(outdir, name)
            subprocess.run(['pdftoppm', '-f', str(part['pdf']), '-l', str(part['pdf']), '-r', str(DPI),
                            '-x', str(x), '-y', str(y), '-W', str(w), '-H', str(h), '-png', '-singlefile', pdf, base], check=True)
            im = Image.open(base + '.png').convert('RGBA')
            px = im.load()
            # page background = most common border colour -> transparent
            from collections import Counter
            border = Counter()
            for xx in range(im.width):
                border[px[xx, 0][:3]] += 1; border[px[xx, im.height - 1][:3]] += 1
            bg = border.most_common(1)[0][0]
            for yy in range(im.height):
                for xx in range(im.width):
                    r, g, b, a = px[xx, yy]
                    d = abs(r - bg[0]) + abs(g - bg[1]) + abs(b - bg[2])
                    if d < 40:
                        px[xx, yy] = (r, g, b, 0)
                    elif d < 160:
                        px[xx, yy] = (r, g, b, int(255 * (d - 40) / 120))
            im.save(base + '.png', optimize=True)
            f['w'] = im.width; f['h'] = im.height
json.dump(songs, open(sys.argv[1], 'w'), ensure_ascii=False, indent=0)
print('ok')

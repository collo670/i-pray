"""Append the hand-transcribed scanned page (PDF 222) to songs.json."""
import json, re, sys
songs = json.load(open(sys.argv[1]))
src = open(sys.argv[2]).read().splitlines()
song = dict(title='', subtitle=[], page=None, pdf=[222], parts=[], manual=True)
lines = []
for raw in src:
    if raw.startswith('#title '): song['title'] = raw[7:]; continue
    if raw.startswith('#subtitle '): song['subtitle'].append(raw[10:]); continue
    if raw.startswith('#note '):
        lines.append(dict(type='note', parts=[dict(t=raw[6:], s='r')], gap=0)); continue
    label, body = raw.split('|', 1)
    bold = body.startswith('*')
    if bold: body = body[1:]
    text = ''; styles = []; chords = []
    pos = 0
    for m in re.finditer(r'\[([^\]]+)\]|\*\*(.+)$|([^\[*]+|\*)', body):
        if m.group(1):
            chords.append(dict(i=len(text), c=m.group(1), raw=m.group(1)))
        elif m.group(2):
            for ch in m.group(2): text += ch; styles.append('b')
        else:
            for ch in m.group(3): text += ch; styles.append('b' if bold else '')
    lines.append(dict(type='line', label=label or None, text=text, styles=styles, chords=chords, gap=0))
song['parts'].append(dict(pdf=222, page=None, bands=[dict(kind='span', lines=lines, groups=[])]))
songs.append(song)
json.dump(songs, open(sys.argv[1], 'w'), ensure_ascii=False, indent=0)
print(len(songs))

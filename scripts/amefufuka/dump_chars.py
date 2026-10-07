"""Dump every character of the songbook PDF (text, box, font, colour) to JSON.

usage: dump_chars.py amefufuka.pdf work/chars.json   (also writes work/images.json)
"""
import pdfplumber, json, sys
pdf=pdfplumber.open(sys.argv[1])
out=[]
for i,p in enumerate(pdf.pages):
    chars=[]
    for c in p.chars:
        col=c.get('non_stroking_color')
        if isinstance(col,(list,tuple)): col=[round(float(v),3) for v in col]
        else: col=[col] if col is not None else []
        chars.append(dict(t=c['text'],x0=round(c['x0'],2),x1=round(c['x1'],2),top=round(c['top'],2),bot=round(c['bottom'],2),
                          size=round(c['size'],2),font=c['fontname'].split('+')[-1],col=col,up=c.get('upright',True)))
    lines=[dict(x0=round(l['x0'],1),x1=round(l['x1'],1),top=round(l['top'],1),bot=round(l['bottom'],1)) for l in p.lines]
    rects=[dict(x0=round(l['x0'],1),x1=round(l['x1'],1),top=round(l['top'],1),bot=round(l['bottom'],1)) for l in p.rects]
    curves=[dict(x0=round(l['x0'],1),x1=round(l['x1'],1),top=round(l['top'],1),bot=round(l['bottom'],1)) for l in p.curves]
    out.append(dict(n=i+1,w=float(p.width),h=float(p.height),chars=chars,lines=lines,rects=rects,curves=curves,images=len(p.images)))
json.dump(out,open(sys.argv[2],'w'))
# embedded raster images (the violin score, the scanned last page)
imgs={}
for i,p in enumerate(pdf.pages):
    if p.images:
        imgs[i+1]=[dict(x0=round(im['x0'],1),top=round(im['top'],1),x1=round(im['x1'],1),bot=round(im['bottom'],1)) for im in p.images]
json.dump(imgs,open(sys.argv[2].replace('chars.json','images.json'),'w'))
print('ok',len(out))

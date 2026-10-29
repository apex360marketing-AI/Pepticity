"""Temporary dashboard bottle art: her vial (clear glass, silver crimp, black flip top), cut out on transparency.
Back view: product name + strength face the camera; the vertical PEPTICITY wordmark shows faintly through the glass.
Label carries ONLY: PEPTICITY + product name + strength (no Rx, pharmacy or lot lines).
Usage: python3 -I dashvials.py -> ../src/dash/<slug>.webp
"""
import sys, re, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import label as L

OUT = L.ROOT / 'src/dash'; OUT.mkdir(exist_ok=True)
FB = str(L.ROOT / 'fonts/bc700.ttf'); FS = str(L.ROOT / 'fonts/bc600.ttf')

# name, strength (sizes from shared/inventory.js, as used on the dashboard)
PRODUCTS = [
    ('Tirzepatide', '15 mg'), ('Retatrutide', '10 mg'), ('Tesamorelin', '10 mg'), ('AOD-9604', '5 mg'),
    ('5-Amino-1MQ', '10 mg'), ('KLOW blend', '80 mg'), ('BPC-157', '10 mg'), ('TB-500', '10 mg'),
    ('Wolverine blend', '10 mg'), ('GLOW blend', '70 mg'), ('KPV', '10 mg'), ('Thymosin Alpha-1', '10 mg'),
    ('HGH (human growth hormone)', '100 iu'), ('CJC-1295', 'with DAC 5 mg'), ('Ipamorelin', '10 mg'),
    ('IGF-1 LR3', ''), ('Epitalon', '10 mg'), ('MOTS-c', '10 mg'), ('SS-31', '10 mg'), ('NAD+', '1000 mg'),
    ('Glutathione', '1500 mg'), ('Semax', '10 mg'), ('Selank', '10 mg'), ('Oxytocin', '2 mg'), ('GHK-Cu', '50 mg'),
    ('PT-141', '10 mg'), ('Melanotan II', '10 mg'), ('Bacteriostatic water (Pfizer)', '30 ml'),
]


def slug(n):
    return re.sub(r'[^a-z0-9]+', '-', n.lower()).strip('-')


def label_lines(name):
    n = re.sub(r'\s*\(.*?\)', '', name).upper()
    n = n.replace('GHK-CU', 'GHK-Cu')
    if len(n) > 11 and ' ' in n:
        a, b = n.rsplit(' ', 1)
        return [a, b]
    return [n]


def panel(name, strength):
    """Flat white back-panel art on transparency, drawn big then mapped onto the glass."""
    W, H = 1200, 900
    im = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    lines = label_lines(name)
    size = 230 if len(lines) == 1 else 190
    f = ImageFont.truetype(FB, size)
    while max(d.textlength(t, font=f) for t in lines) > W * .96:
        size -= 6; f = ImageFont.truetype(FB, size)
    y = 40
    for t in lines:
        w = d.textlength(t, font=f); d.text(((W - w) / 2, y), t, font=f, fill=(255, 255, 255, 255))
        bottom = d.textbbox(((W - w) / 2, y), t, font=f)[3]; y += size * .98
    y = bottom
    if strength:
        fs = ImageFont.truetype(FS, 104); s = strength.upper(); sp = 16
        w = sum(d.textlength(c, font=fs) + sp for c in s) - sp; x = (W - w) / 2; y += 34
        top = y
        for c in s:
            d.text((x, top), c, font=fs, fill=(255, 255, 255, 235)); bottom = max(bottom, d.textbbox((x, top), c, font=fs)[3]); x += d.textlength(c, font=fs) + sp
        y = bottom
    d.rectangle(((W - 210) / 2, y + 95, (W + 210) / 2, y + 105), fill=(255, 255, 255, 220))
    return im.crop(im.getbbox())


def vial_mask():
    m = Image.new('L', (1435, 1800), 0); d = ImageDraw.Draw(m)
    d.rounded_rectangle((545, 436, 902, 524), 14, fill=255)
    d.rounded_rectangle((551, 518, 897, 644), 8, fill=255)
    d.rectangle((592, 636, 858, 760), fill=255)
    d.rounded_rectangle((503, 732, 949, 1436), 66, fill=255)
    d.rounded_rectangle((503, 1000, 949, 1436), 30, fill=255)
    return np.asarray(m.filter(ImageFilter.GaussianBlur(2.2))).astype(np.float32) / 255


def main():
    base = np.asarray(Image.open(L.PH / 'b2.jpg').convert('RGB')).astype(np.float32) / 255
    grey = base.mean(axis=2, keepdims=True).repeat(3, axis=2)
    grey = np.clip((grey - .1) / .9, 0, 1) ** 1.12           # sink the wall seen through the glass so it sits on dark UI
    front = L.trim(L.ART / 'V2.png')
    mask = vial_mask()
    panels = {n: panel(n, s) for n, s in PRODUCTS}
    widest = max(panels.values(), key=lambda im: im.width / max(im.height, 1) * 1)
    sc_w = L.B['r'] * 1.25 / max(p.width for p in panels.values())
    sc_h = (L.B['bot'] - L.B['top']) * .5 / max(p.height for p in panels.values())
    sc = min(sc_w, sc_h) * 1.0
    box = (490, 424, 962, 1446)
    for n, s in PRODUCTS:
        res = grey.copy()
        L.put(res, L.wrap(front, 0.95, 0.86, 0.5, True), 0.24, far=True)          # PEPTICITY through the glass
        p = panels[n]
        psc = min(sc * 1.35, L.B['r'] * 1.25 / p.width, (L.B['bot'] - L.B['top']) * .5 / p.height)
        Ly = L.wrap(p, 1.3, 0.6, 0.42, False, scale=psc); L.put(res, Ly, 0.95)
        rgba = np.dstack([np.clip(res, 0, 1), mask])
        im = Image.fromarray((rgba * 255).astype(np.uint8), 'RGBA').crop(box)
        im = im.resize((round(im.width * 380 / im.height), 380), Image.LANCZOS)
        im.save(OUT / f'{slug(n)}.webp', 'WEBP', quality=80, method=6)
        print('ok', slug(n))


if __name__ == '__main__':
    main()

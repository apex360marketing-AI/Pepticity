"""Warm-cast check (pepticity-brand-lock): sample pixels from screenshots, convert to LAB/LCh and flag
pink/orange/yellow casts on near-white or metal pixels (hue 0-75 deg with chroma > 8), gold that is too
yellow/orange (b* > 20 or a* > 6 when the hue is warm) and any green (hue 90-160 deg, chroma > 10).
python3 -I brand/tools/warmcheck.py shots/*.png"""
import sys, math
from PIL import Image


def lab(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    R, G, B = lin(r), lin(g), lin(b)
    X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047
    Y = 0.2126 * R + 0.7152 * G + 0.0722 * B
    Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    fx, fy, fz = f(X), f(Y), f(Z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)


tot = {'px': 0, 'warm_white': 0, 'gold_hot': 0, 'green': 0}
for path in sys.argv[1:]:
    im = Image.open(path).convert('RGB'); W, H = im.size
    step = max(4, int((W * H / 6000) ** 0.5))
    ww = gh = gr = n = 0; worst = None
    for y in range(0, H, step):
        for x in range(0, W, step):
            r, g, b = im.getpixel((x, y)); L, A, B = lab(r, g, b)
            C = math.hypot(A, B); h = math.degrees(math.atan2(B, A)) % 360; n += 1
            if L > 70 and C > 8 and h <= 75: ww += 1; worst = worst or (x, y, (r, g, b))
            if L > 30 and 0 <= h <= 90 and C > 10 and (B > 20 or A > 6): gh += 1
            if 90 <= h <= 160 and C > 10: gr += 1
    tot['px'] += n; tot['warm_white'] += ww; tot['gold_hot'] += gh; tot['green'] += gr
    flag = 'FAIL' if (ww + gh + gr) > n * 0.002 else 'pass'
    print(f'{flag}  {path.split("/")[-1]}: {n} px, warm-white {ww}, hot-gold {gh}, green {gr}' + (f', first warm px {worst}' if worst else ''))
print('TOTAL', tot)

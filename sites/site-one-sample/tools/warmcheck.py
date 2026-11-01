#!/usr/bin/env python3
"""Brand-lock colour check on screenshots: samples a grid of pixels per image, converts to LAB/LCh and flags
warm casts on whites/metals (hue 0-75 deg with chroma > 8 on light pixels), yellow/orange gold (b* > 20 or a* > 6 on
metal-like pixels) and green (hue 90-160 with chroma > 10). Prints a per-image verdict. Usage: warmcheck.py shots/*.png"""
import sys, math
from PIL import Image

def lab(r, g, b):
    def lin(c):
        c /= 255
        return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4
    R, G, B = lin(r), lin(g), lin(b)
    X = (R * .4124 + G * .3576 + B * .1805) / .95047
    Y = R * .2126 + G * .7152 + B * .0722
    Z = (R * .0193 + G * .1192 + B * .9505) / 1.08883
    f = lambda t: t ** (1 / 3) if t > 216 / 24389 else (24389 / 27 * t + 16) / 116
    fx, fy, fz = f(X), f(Y), f(Z)
    return 116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)

tot_bad = 0
for path in sys.argv[1:]:
    im = Image.open(path).convert('RGB'); W, H = im.size
    n = warm = green = gold = 0
    for yi in range(12):
        for xi in range(16):
            x, y = int((xi + .5) * W / 16), int((yi + .5) * H / 12)
            L, a, b = lab(*im.getpixel((x, y))); C = math.hypot(a, b); h = math.degrees(math.atan2(b, a)) % 360; n += 1
            if L > 70 and C > 8 and h <= 75: warm += 1
            if 90 <= h <= 160 and C > 10: green += 1
            if 30 < L <= 70 and 40 <= h <= 100 and (b > 20 or a > 6) and C > 12: gold += 1
    bad = warm + green + gold
    tot_bad += bad
    print(f"{'PASS' if bad == 0 else 'FLAG'}  {path.split('/')[-1]:40s} samples={n} warm={warm} gold={gold} green={green}")
print('TOTAL FLAGGED SAMPLES:', tot_bad)

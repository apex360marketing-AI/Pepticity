#!/usr/bin/env python3
"""cheap-detector: how much of a screenshot is ACCENT colour (hue near the accent, clearly saturated, not dark).
Usage: python3 tools/cheap-detector.py <screenshot.png> <accent-hex> [limit-percent=5]
Exit 1 if over the limit. Skill: premium-restraint."""
import sys, colorsys, warnings
warnings.filterwarnings("ignore")
from PIL import Image
path, hexv = sys.argv[1], sys.argv[2].lstrip('#'); limit = float(sys.argv[3]) if len(sys.argv) > 3 else 5.0
ah, _, _ = colorsys.rgb_to_hsv(*[int(hexv[i:i+2], 16) / 255 for i in (0, 2, 4)])
im = Image.open(path).convert('RGB'); im.thumbnail((480, 300))
px = list(im.getdata()); hit = 0
for r, g, b in px:
    h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
    d = min(abs(h - ah), 1 - abs(h - ah))
    if d < 0.045 and s > 0.30 and v > 0.22: hit += 1
pct = 100 * hit / len(px)
print(f"accent coverage {pct:.2f}% (limit {limit}%)  {'PASS' if pct <= limit else 'FAIL: too colourful'}")
sys.exit(0 if pct <= limit else 1)

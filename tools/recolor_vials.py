# Turn the violet in the vial photos into the logo blue (hue 218.6). Only violet hues move (232-315 deg, soft edges);
# the label's chrome and its blue light (already ~218) stay as they are. Originals are kept in /home/user/work/vial-originals/.
# usage: python3 -I recolor_vials.py ASSETS_DIR [--check]   (--check only reports the violet share, changes nothing)
import sys, os, glob, shutil
import numpy as np
from PIL import Image

TARGET = 218.6

def hsv(rgb):
    mx, mn = rgb.max(-1), rgb.min(-1); d = mx - mn
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    h = np.zeros_like(mx); m = d > 1e-6
    rc = m & (mx == r); gc = m & ~rc & (mx == g); bc = m & ~rc & ~gc
    h[rc] = ((g - b)[rc] / d[rc]) % 6; h[gc] = (b - r)[gc] / d[gc] + 2; h[bc] = (r - g)[bc] / d[bc] + 4
    s = np.where(mx > 1e-6, d / np.maximum(mx, 1e-6), 0)
    return h * 60, s, mx

def rgb_from(h, s, v):
    c = v * s; hp = (h % 360) / 60; x = c * (1 - np.abs(hp % 2 - 1)); z = np.zeros_like(c)
    i = np.floor(hp).astype(int) % 6
    r = np.choose(i, [c, x, z, z, x, c]); g = np.choose(i, [x, c, c, x, z, z]); b = np.choose(i, [z, z, x, c, c, x])
    m = v - c
    return np.stack([r + m, g + m, b + m], -1)

def weight(h, s):
    return np.clip((h - 232) / 13, 0, 1) * np.clip((315 - h) / 15, 0, 1) * np.clip((s - .08) / .12, 0, 1)

def violet_share(a):
    h, s, v = hsv(a[..., :3])
    vis = (a[..., 3] > .1) & (v > .08)
    return float((weight(h, s)[vis] > .5).mean()) if vis.any() else 0.0

files = [f for pat in ('vials/*.webp', 'vials/sizes/*.webp', 'vial-print.webp', 'vial-front-clear.webp', 'lineup-stage*.webp')
         for f in sorted(glob.glob(os.path.join(sys.argv[1], pat)))]
check = '--check' in sys.argv
for f in files:
    a = np.asarray(Image.open(f).convert('RGBA')).astype(np.float32) / 255
    before = violet_share(a)
    if check or before < .002:
        print(f'{"check" if check else "skip "} {os.path.relpath(f, sys.argv[1]):45} violet {before:.3f}'); continue
    h, s, v = hsv(a[..., :3]); w = weight(h, s)
    out = a.copy(); out[..., :3] = rgb_from(h * (1 - w) + TARGET * w, s, v)
    keep = os.path.join('/home/user/work/vial-originals', os.path.relpath(f, sys.argv[1]))
    os.makedirs(os.path.dirname(keep), exist_ok=True)
    if not os.path.exists(keep): shutil.copy2(f, keep)
    Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8), 'RGBA').save(f, 'WEBP', quality=92, method=6)
    after = violet_share(out)
    print(f'fixed {os.path.relpath(f, sys.argv[1]):45} violet {before:.3f} -> {after:.3f}')

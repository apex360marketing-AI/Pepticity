#!/usr/bin/env python3
"""Black-and-white / too-dark detector for PEPTICITY screenshots. Usage: python3 -I tools/colour-check.py a.png [b.png ...]
Reports mean chroma (CIE LCh), share of coloured pixels (chroma > 14), distinct hue families, mean lightness; FAIL if monochrome or too dark."""
import sys
import numpy as np
from PIL import Image

def srgb_to_lab(rgb):
    c = rgb / 255.0
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    m = np.array([[0.4124564, 0.3575761, 0.1804375], [0.2126729, 0.7151522, 0.0721750], [0.0193339, 0.1191920, 0.9503041]])
    xyz = c @ m.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > 0.008856, np.cbrt(xyz), 7.787 * xyz + 16 / 116)
    L = 116 * f[..., 1] - 16
    a = 500 * (f[..., 0] - f[..., 1])
    b = 200 * (f[..., 1] - f[..., 2])
    return L, a, b

def check(path):
    im = Image.open(path).convert("RGB")
    im.thumbnail((480, 480))
    L, a, b = srgb_to_lab(np.asarray(im, dtype=np.float64))
    C = np.hypot(a, b)
    H = (np.degrees(np.arctan2(b, a)) + 360) % 360
    coloured = C > 14
    share = coloured.mean() * 100
    hues = set(int(h // 45) for h in H[coloured]) if coloured.any() else set()
    big = [h for h in range(8) if (coloured & ((H // 45).astype(int) == h)).mean() * 100 > 1.5]
    mc, ml = float(C.mean()), float(L.mean())
    ok = mc >= 8 and share >= 12 and ml >= 22
    print(f"{path}: mean chroma {mc:.1f} | coloured pixels {share:.1f}% | hue families {len(big)} | mean L* {ml:.1f} -> {'PASS' if ok else 'FAIL'}")
    return ok

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit("usage: colour-check.py image.png [...]")
    res = [check(p) for p in sys.argv[1:]]
    sys.exit(0 if all(res) else 1)

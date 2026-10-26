"""One vial per quiz focus (no peptide name on it: front wordmark only), lit in that focus's colour.
Same light map as litvial.py. Usage: python3 -I litcat.py -> ../src/lit/cat-<KEY>-lit.jpg and cat-clear.jpg"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image, ImageFilter
import label as L

OUT = L.ROOT / 'src/lit'; OUT.mkdir(exist_ok=True)
SHADES = {'performance': (205, 222, 235), 'weight': (200, 16, 46), 'energy': (212, 255, 58), 'aging': (214, 36, 110),
          'skin': (232, 96, 120), 'sleep': (124, 92, 255), 'hormones': (226, 64, 200)}
src = np.asarray(Image.open(L.PH / 'b2.jpg').convert('RGB')).astype(np.float32) / 255
grey = src.mean(axis=2, keepdims=True).repeat(3, axis=2)
lm = np.clip((src[..., 0] - np.maximum(src[..., 1], src[..., 2])) * 3.2, 0, 1)
lm = np.asarray(Image.fromarray((lm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
H, W = lm.shape; yy, xx = np.mgrid[0:H, 0:W]
cx, cy = L.B['cx'] - 40, L.B['contact'] + 26
pool = np.exp(-(((xx - cx) / 300) ** 2 + ((yy - cy) / 40) ** 2)) * (yy > L.B['contact'] - 6)
inner = np.exp(-(((xx - (L.B['cx'] - L.B['r'] * .8)) / 30) ** 2)) * ((yy > L.B['top'] + 40) & (yy < L.B['bot'] - 10)) * .35
light = np.clip(lm + pool * .35 + inner, 0, 1)[..., None]
front = L.trim(L.ART / 'V2.png')

def compose(base):
    res = base.copy()
    Ly = L.wrap(front, 0.95, 0.86, 0.5, False); ink = L.put(res, Ly, 0.95); L.reflect(res, Ly, ink)
    return res

def save(arr, name):
    arr = arr + (np.random.default_rng(7).standard_normal(arr.shape[:2])[..., None] * 0.005).astype(np.float32)
    im = Image.fromarray((np.clip(arr, 0, 1) * 255).astype(np.uint8))
    im = im.crop((int(L.B['cx'] - 560), int(L.B['top'] - 520), int(L.B['cx'] + 560), int(L.B['contact'] + 330)))
    im.thumbnail((900, 1400)); im.save(OUT / name, quality=84, optimize=True, progressive=True)

save(compose(grey), 'cat-clear.jpg')
for key, rgb in SHADES.items():
    c = np.array(rgb, np.float32)[None, None, :] / 255
    lit = grey * (1 - light * .85) + c * light * (0.55 + grey * 1.1)
    lit = 1 - (1 - lit) * (1 - c * light * .35)
    save(compose(np.clip(lit, 0, 1)), f'cat-{key}-lit.jpg'); print('ok', key)

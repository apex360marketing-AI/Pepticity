"""One vial per peptide, lit by that peptide's own colour (or unlit: clear glass, no colour).
The light map comes from the photograph itself: the coloured streak where the studio light bends through her
bottle's glass. Colour is removed everywhere, then put back only along that light, in the peptide's shade.
Usage: python3 -I litvial.py  -> ../src/lit/<KEY>-lit.jpg and <KEY>-clear.jpg"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image, ImageFilter
import label as L

OUT = L.ROOT / 'src/lit'; OUT.mkdir(exist_ok=True)
SHADES = {'AOD': (200, 16, 46), 'NAD': (212, 255, 58), 'EPI': (214, 36, 110), 'GHK': (232, 96, 120)}
src = np.asarray(Image.open(L.PH / 'b2.jpg').convert('RGB')).astype(np.float32) / 255
grey = src.mean(axis=2, keepdims=True).repeat(3, axis=2)
# where the photo is coloured, that is the light: red above the other two channels
lm = np.clip((src[..., 0] - np.maximum(src[..., 1], src[..., 2])) * 3.2, 0, 1)
lm = np.asarray(Image.fromarray((lm * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2))).astype(np.float32) / 255
# a soft pool of the same light on the slab, under the vial (where a real coloured light would land)
H, W = lm.shape; yy, xx = np.mgrid[0:H, 0:W]
cx, cy = L.B['cx'] - 40, L.B['contact'] + 26
pool = np.exp(-(((xx - cx) / 300) ** 2 + ((yy - cy) / 40) ** 2)) * (yy > L.B['contact'] - 6)
inner = np.exp(-(((xx - (L.B['cx'] - L.B['r'] * .8)) / 30) ** 2)) * ((yy > L.B['top'] + 40) & (yy < L.B['bot'] - 10)) * .35
light = np.clip(lm + pool * .35 + inner, 0, 1)[..., None]
front = L.trim(L.ART / 'V2.png')

def compose(base, key):
    res = base.copy()
    back = L.trim(L.ART / f'back-{key}.png')
    L.put(res, L.wrap(back, 1.3, 0.62, 0.47, True), 0.2, far=True)
    Ly = L.wrap(front, 0.95, 0.86, 0.5, False); ink = L.put(res, Ly, 0.95); L.reflect(res, Ly, ink)
    return res

for key, rgb in SHADES.items():
    c = np.array(rgb, np.float32)[None, None, :] / 255
    lit = grey * (1 - light * .85) + c * light * (0.55 + grey * 1.1)       # coloured light replaces the grey along the light map
    lit = 1 - (1 - lit) * (1 - c * light * .35)                               # a little screen bloom
    for name, base in (('lit', np.clip(lit, 0, 1)), ('clear', grey)):
        res = compose(base, key)
        res += (np.random.default_rng(7).standard_normal(res.shape[:2])[..., None] * 0.005).astype(np.float32)
        Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(OUT / f'{key}-{name}.jpg', quality=86, optimize=True, progressive=True)
    print('ok', key)

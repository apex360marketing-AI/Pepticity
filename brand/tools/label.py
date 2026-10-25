"""Her current bottle (clear glass, silver crimp, black flip top) with the PEPTICITY label.

Front view: vertical wordmark faces the camera, the back panel shows faintly through the glass.
Back view: the peptide panel faces the camera, the wordmark shows faintly reversed through the glass.
Usage: python3 -I label.py  -> src/her/front-<K>.jpg, back-<K>.jpg
"""
import pathlib
import numpy as np
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
PH, ART, OUT = ROOT / 'src/photos', ROOT / 'art', ROOT / 'src/her'
OUT.mkdir(exist_ok=True)
B = dict(cx=725.5, r=223.5, top=840, bot=1410, contact=1435)  # b2: matches her vial


def trim(path):
    im = Image.open(path).convert('RGBA')
    return im.crop(im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox())


def wrap(art, wfrac, hfrac, ymid, far=False, scale=None):
    """Map flat art onto the cylinder. far=True = printed on the far side, seen through the glass (mirrored)."""
    cx, r, body = B['cx'], B['r'], B['bot'] - B['top']
    s = scale or min(r * wfrac / art.width, body * hfrac / art.height)
    art = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    A = np.asarray(art).astype(np.float32) / 255.0
    aw, ah = art.width, art.height
    y0 = int(round(B['top'] + body * ymid - ah / 2))
    xs = np.arange(int(cx - r) + 1, int(cx + r))
    theta = np.arcsin(np.clip((xs - cx) / r, -0.999, 0.999))
    src = aw / 2 + (-theta if far else theta) * r
    ok = (src >= 0) & (src <= aw - 1)
    xs, theta, src = xs[ok], theta[ok], src[ok]
    ys = np.arange(y0, y0 + ah)
    x0 = np.floor(src).astype(int); fx = (src - x0)[None, :, None]; x1 = np.clip(x0 + 1, 0, aw - 1)
    samp = A[:, x0] * (1 - fx) + A[:, x1] * fx
    edge = np.clip((np.cos(theta) - 0.08) / 0.35, 0, 1) ** 0.8
    a = samp[..., 3] * edge[None, :]
    a = np.asarray(Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.6 if far else 0.55))).astype(np.float32) / 255
    return ys, xs, samp[..., :3], a, theta


def put(res, layer, opacity, far=False):
    ys, xs, rgb, a, theta = layer
    reg = res[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1]
    lum = reg.mean(axis=2); med = np.median(lum, axis=1, keepdims=True)
    hl = np.clip((lum - med) * 2.2, -0.25, 0.6)
    shade = (0.62 + 0.38 * np.cos(theta) ** 0.7)[None, :]
    if far:   # seen through glass + liquid: dimmer, cooler, no specular
        ink = np.clip(rgb * 0.78 * shade[..., None], 0, 1)
    else:
        ink = np.clip(rgb * (0.92 * shade[..., None]) + hl[..., None] * 0.55, 0, 1)
    al = a[..., None] * opacity
    reg[:] = reg * (1 - al) + ink * al
    return ink


def reflect(res, layer, ink, strength=0.2):
    ys, xs, rgb, a, theta = layer
    yc, body = B['contact'], B['bot'] - B['top']
    ry = np.arange(yc, min(res.shape[0], yc + int(body * 0.7)))
    src = 2 * yc - ry - (B['contact'] - B['bot']) * 2
    ok = (src >= ys[0]) & (src <= ys[-1])
    if not ok.any():
        return
    ry, src = ry[ok], src[ok]
    fade = np.clip(1 - (ry - yc) / (body * 0.6), 0, 1) ** 1.6 * strength
    ra = a[src - ys[0]] * fade[:, None]
    reg = res[ry[0]:ry[-1] + 1, xs[0]:xs[-1] + 1]
    reg[:] = reg * (1 - ra[..., None]) + ink[src - ys[0]] * ra[..., None]


def render(key, fr='V1'):
    base = np.asarray(Image.open(PH / 'b2.jpg').convert('RGB')).astype(np.float32) / 255
    front = trim(ART / f'{fr}.png')
    back = trim(ART / f'back-{key}.png')
    # one type size for the whole range: fit the widest panel, use that scale for all
    widest = max((trim(ART / f'back-{k}.png') for k in KEYS), key=lambda im: im.width)
    sc = min(B['r'] * 1.3 / widest.width, (B['bot'] - B['top']) * 0.62 / widest.height)
    lf = lambda far: wrap(front, 0.9, 0.86, 0.5, far)
    lb = lambda far: wrap(back, 1.3, 0.62, 0.47, far, scale=sc)
    rng = np.random.default_rng(7)
    for view, near, farl in (('front', lf, lb), ('back', lb, lf)):
        res = base.copy()
        put(res, farl(True), 0.2 if view == 'front' else 0.28, far=True)        # far-side print through the glass
        L = near(False)
        ink = put(res, L, 0.95)
        reflect(res, L, ink)
        res += (rng.standard_normal(res.shape[:2])[..., None] * 0.006).astype(np.float32)
        Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(OUT / f'{view}-{key}{"" if fr == "V1" else "-" + fr}.jpg', quality=88, optimize=True, progressive=True)
        print(view, key, fr)


KEYS = ('AOD', 'NAD', 'EPI', 'GHK')

if __name__ == '__main__':
    import sys
    fr = sys.argv[1] if len(sys.argv) > 1 else 'V1'
    for k in (sys.argv[2:] or KEYS):
        render(k, fr)

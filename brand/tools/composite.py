"""Print each vector logo onto its photographed Higgsfield bottle.

Wraps the flat artwork around the vial cylinder (orthographic arcsine mapping),
lights it with the photo's own shading and highlights, and adds a faint mirror
reflection on the obsidian. Usage: python3 -I composite.py [D01 ...]
"""
import sys, json, pathlib
import numpy as np
from PIL import Image, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
PH, ART, OUT = ROOT / 'src/photos', ROOT / 'art', ROOT / 'src/bottles'
OUT.mkdir(exist_ok=True)

# vial geometry in the 1435x1800 photos: centre x, radius, straight body top/bottom, contact line
BASES = {
    'b0': dict(cx=727.5, r=221.5, top=850, bot=1415, contact=1440, mode='dark'),
    'b1': dict(cx=719.5, r=224.5, top=880, bot=1430, contact=1455, mode='glass'),
    'b2': dict(cx=725.5, r=223.5, top=840, bot=1410, contact=1435, mode='glass'),
    'b3': dict(cx=729.5, r=222.5, top=850, bot=1395, contact=1418, mode='glass'),
    'b4': dict(cx=731.5, r=241.5, top=800, bot=1500, contact=1535, mode='light'),
}
# per-design ink treatment and how big the print sits (fraction of body)
DESIGNS = json.loads((ROOT / 'tools/designs.json').read_text())


def load_art(did):
    im = Image.open(ART / f'{did}.png').convert('RGBA')
    bb = im.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    return im.crop(bb)


def composite(did):
    d = DESIGNS[did]
    B = BASES[d['base']]
    base = Image.open(PH / f"{d['base']}.jpg").convert('RGB')
    bf = np.asarray(base).astype(np.float32) / 255.0
    H, Wd = bf.shape[:2]
    cx, r = B['cx'], B['r']
    body_h = B['bot'] - B['top']

    art = load_art(d.get('art', did))
    # size: arc width limit and height limit
    max_arc = r * d.get('wfrac', 1.42)
    max_h = body_h * d.get('hfrac', 0.66)
    s = min(max_arc / art.width, max_h / art.height)
    art = art.resize((max(1, round(art.width * s)), max(1, round(art.height * s))), Image.LANCZOS)
    A = np.asarray(art).astype(np.float32) / 255.0
    aw, ah = art.width, art.height
    ymid = B['top'] + body_h * d.get('ymid', 0.5)
    y0 = int(round(ymid - ah / 2))

    # destination grid over the body
    xs = np.arange(int(cx - r) + 1, int(cx + r))
    u = np.clip((xs - cx) / r, -0.999, 0.999)
    theta = np.arcsin(u)
    src_x = aw / 2 + theta * r                      # arc length from the front line
    valid = (src_x >= 0) & (src_x <= aw - 1)
    xs, theta, src_x = xs[valid], theta[valid], src_x[valid]
    ys = np.arange(max(0, y0), min(H, y0 + ah))
    sy = ys - y0
    # bilinear sample columns (rows map 1:1)
    x0 = np.floor(src_x).astype(int); fx = (src_x - x0)[None, :, None]
    x1 = np.clip(x0 + 1, 0, aw - 1)
    rows = A[sy]
    samp = rows[:, x0] * (1 - fx) + rows[:, x1] * fx
    rgb, a = samp[..., :3], samp[..., 3]

    # foreshortening fade at the edges and soft print edge
    edge = np.clip((np.cos(theta) - 0.08) / 0.35, 0, 1) ** 0.8
    a = a * edge[None, :]
    a_img = Image.fromarray((a * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.55))
    a = np.asarray(a_img).astype(np.float32) / 255.0

    region = bf[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1]
    lum = region.mean(axis=2)
    # local highlight = how much brighter the photo is than the row's median (softbox streaks)
    med = np.median(lum, axis=1, keepdims=True)
    hl = np.clip((lum - med) * 2.2, -0.25, 0.6)
    shade = (0.62 + 0.38 * np.cos(theta) ** 0.7)[None, :]

    mode = B['mode']
    if d.get('ink') == 'silver':
        grad = np.linspace(1.0, 0.86, rgb.shape[0])[:, None, None]
        ink = np.clip(np.array([0.93, 0.95, 0.97])[None, None, :] * grad * shade[..., None] + hl[..., None] * 0.9, 0, 1)
        out = region * (1 - a[..., None]) + ink * a[..., None]
    elif mode == 'light':
        # ink printed into a light ceramic: multiply keeps the photo's shading
        ink = np.clip(rgb * (0.92 + 0.12 * shade[..., None]) + hl[..., None] * 0.15, 0, 1)
        out = region * (1 - a[..., None]) + (region * ink * 1.08) * a[..., None]
    else:
        lift = 0.80 if mode == 'dark' else 0.92
        ink = np.clip(rgb * (lift * shade[..., None]) + hl[..., None] * 0.55, 0, 1)
        op = 0.97 if mode == 'dark' else 0.93
        out = region * (1 - a[..., None] * op) + ink * a[..., None] * op
    res = bf.copy()
    res[ys[0]:ys[-1] + 1, xs[0]:xs[-1] + 1] = out

    # mirror reflection on the slab
    yc = B['contact']
    ry = np.arange(yc, min(H, yc + int(body_h * 0.7)))
    src = 2 * yc - ry - (B['contact'] - B['bot']) * 2
    ok = (src >= ys[0]) & (src <= ys[-1])
    if ok.any():
        ry, src = ry[ok], src[ok]
        fade = np.clip(1 - (ry - yc) / (body_h * 0.6), 0, 1) ** 1.6 * d.get('refl', 0.22)
        ra = a[src - ys[0]] * fade[:, None]
        rc = ink if ink.shape[0] == a.shape[0] else None
        rimg = rc[src - ys[0]]
        reg = res[ry[0]:ry[-1] + 1, xs[0]:xs[-1] + 1]
        if mode == 'light':
            reg[:] = reg * (1 - ra[..., None]) + reg * rimg * ra[..., None]
        else:
            reg[:] = reg * (1 - ra[..., None]) + rimg * ra[..., None]

    # a whisper of grain so the print sits in the photo
    rng = np.random.default_rng(sum(map(ord, did)))
    res += (rng.standard_normal(res.shape[:2])[..., None] * 0.006).astype(np.float32)
    img = Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8))
    img.save(OUT / f'{did}.jpg', quality=86, optimize=True, progressive=True)
    return OUT / f'{did}.jpg'


if __name__ == '__main__':
    ids = sys.argv[1:] or sorted(DESIGNS)
    for i in ids:
        print(composite(i))

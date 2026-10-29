"""PEPTICITY vial SAMPLE (one product): Thymosin Alpha-1 10 MG, front + back.
Dark smoked see-through glass, frosted transparent smoke label, platinum-chrome type in the owner's
PepticityBlack.otf, PEPTICITY vertical and off-centre (left third), lit from underneath.
Swap the logo: pass a different SVG (single path, M/L/Z) via MARK below, or set MARK_PNG to a
white-on-transparent PNG and it is used as the mask instead.
Usage: python3 render_sample.py
"""
import re
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = '/home/user/pepticity'
BASE = f'{ROOT}/brand/vials-final/src/vial-base.png'
FONT = f'{ROOT}/brand/font/PepticityBlack.otf'
MARK = f'{ROOT}/brand/logo/p-mark.svg'
MARK_PNG = None
OUT = f'{ROOT}/brand/vial-sample'

NAME, AMOUNT = 'THYMOSIN ALPHA-1', '10 MG'

SS = 4                       # supersample for the flat label art
XC, R = 680, 311             # body centre / radius (silhouette 368..993)
Y0, Y1, CURVE = 902, 1676, 10
GLASS_TOP = 486              # below the crimp: everything under this is glass

base = np.array(Image.open(BASE).convert('RGBA')).astype(np.float32)
H, W = base.shape[:2]
RGB0, A0 = base[..., :3], base[..., 3] / 255.0
xs = np.arange(W, dtype=np.float32)
yy, xx = np.mgrid[0:H, 0:W].astype(np.float32)
U = np.clip((xs - XC) / R, -1, 1)
COSU = np.sqrt(1 - U ** 2)
LW = int(np.ceil(np.pi * R)) + 4     # visible half-wrap in arc pixels
LH = Y1 - Y0


def gblur(a, r):
    """Float gaussian approximation: three passes of a box blur on each axis (cumsum)."""
    if a.ndim == 3:
        return np.stack([gblur(a[..., i], r) for i in range(a.shape[2])], -1)
    a = a.astype(np.float32)
    k = max(1, int(round(np.sqrt(12 * r * r / 3 + 1))))  # box width for 3 passes
    k += (k % 2 == 0)
    h = k // 2
    for ax in (0, 1):
        for _ in range(3):
            p = np.pad(a, [(h + 1, h) if i == ax else (0, 0) for i in range(2)], mode='edge')
            c = np.cumsum(p, axis=ax, dtype=np.float64)
            n = a.shape[ax]
            hi = np.take(c, np.arange(k, k + n), axis=ax); lo = np.take(c, np.arange(0, n), axis=ax)
            a = ((hi - lo) / k).astype(np.float32)
    return a


def bilinear(img, sx, sy):
    h, w = img.shape[:2]
    sx = np.clip(sx, 0, w - 1.001); sy = np.clip(sy, 0, h - 1.001)
    x0 = np.floor(sx).astype(int); y0 = np.floor(sy).astype(int)
    fx = (sx - x0)[..., None]; fy = (sy - y0)[..., None]
    a = img[y0, x0]; b = img[y0, x0 + 1]; c = img[y0 + 1, x0]; d = img[y0 + 1, x0 + 1]
    return (a * (1 - fx) + b * fx) * (1 - fy) + (c * (1 - fx) + d * fx) * fy


def downsample(img):
    h, w = img.shape[:2]
    return img.reshape(h // SS, SS, w // SS, SS, -1).mean((1, 3))


# ---------------- label-space art (arc px x label px, at SS) ----------------
def font(px):
    return ImageFont.truetype(FONT, px)


def text_mask(txt, cap, track=0.06):
    """White-on-black mask of txt with cap height `cap` (SS px), letter-spaced."""
    f = font(int(cap * 1.0 / 0.70))
    bb = f.getbbox('H'); s = cap / (bb[3] - bb[1]); f = font(int(round(f.size * s)))
    bb = f.getbbox('H'); top, capr = bb[1], bb[3] - bb[1]
    sp = track * capr
    widths = [f.getlength(c) for c in txt]
    tw = int(sum(widths) + sp * (len(txt) - 1)) + 8
    im = Image.new('L', (tw, capr + 8), 0); d = ImageDraw.Draw(im)
    x = 4
    for c, w_ in zip(txt, widths):
        d.text((x, 4 - top), c, font=f, fill=255); x += w_ + sp
    return np.array(im).astype(np.float32) / 255


def mark_mask(height):
    if MARK_PNG:
        im = Image.open(MARK_PNG).convert('RGBA'); a = im.split()[3]
        a = a.crop(a.getbbox()); w = int(a.width * height / a.height)
        return np.array(a.resize((w, height), Image.LANCZOS)).astype(np.float32) / 255
    svg = open(MARK).read()
    vb = [float(v) for v in re.search(r'viewBox="([^"]+)"', svg).group(1).split()]
    d = re.search(r' d="([^"]+)"', svg).group(1)
    pts = [(float(a), float(b)) for a, b in re.findall(r'[ML]\s*(-?[\d.]+)\s+(-?[\d.]+)', d)]
    xs_, ys_ = [p[0] for p in pts], [p[1] for p in pts]
    mnx, mxx, mny, mxy = min(xs_), max(xs_), min(ys_), max(ys_)
    sc = height / (mxy - mny); w = int((mxx - mnx) * sc) + 4
    im = Image.new('L', (w, height + 4), 0)
    ImageDraw.Draw(im).polygon([((x - mnx) * sc + 2, (y - mny) * sc + 2) for x, y in pts], fill=255)
    return np.array(im).astype(np.float32) / 255


CHROME = [(0.00, (244, 246, 248)), (0.40, (205, 209, 214)), (0.50, (122, 127, 134)),
          (0.60, (176, 181, 188)), (1.00, (236, 239, 242))]


def chrome_ramp(n):
    t = np.linspace(0, 1, n); out = np.zeros((n, 3), np.float32)
    for c in range(3):
        out[:, c] = np.interp(t, [s[0] for s in CHROME], [s[1][c] for s in CHROME])
    return out


def place(canvas, mask, x, y, across_axis):
    """Composite a chrome, bevelled glyph mask into the RGBA label canvas (SS space).
    across_axis: axis along which the chrome bands run across the letter height (0=rows, 1=cols).
    Light comes from BELOW the bottle, so the lit bevel is on the lower edge and the soft
    shadow falls upward."""
    P = 12 * SS
    h0, w0 = mask.shape
    ramp = chrome_ramp(h0 if across_axis == 0 else w0)
    fill = ramp[:, None, :].repeat(w0, 1) if across_axis == 0 else ramp[None, :, :].repeat(h0, 0)
    fill = np.pad(fill, ((P, P), (P, P), (0, 0)), mode='edge')
    m = np.pad(mask, P); x -= P; y -= P
    h, w = m.shape
    e = 1.6 * SS
    blurred = gblur(m, e)
    gy = np.gradient(blurred, axis=0); gx = np.gradient(blurred, axis=1)
    # under-light direction in label space: light from +y (down)
    lit = (-gy).clip(0, None) * 7.0 * e; dark = (gy).clip(0, None) * 5.0 * e
    fill = fill + (lit[..., None] * 70) - (dark[..., None] * 60) + (np.abs(gx)[..., None] * 18 * e)
    fill = fill.clip(0, 255)
    reg = canvas[y:y + h, x:x + w]
    # upward soft shadow (light from below) for raised print
    sh = gblur(m, 2.5 * SS)
    sh = np.roll(sh, -int(2 * SS), 0) * 0.55
    # channel 4 = darkening amount of the soft shadow on the label
    reg[..., 4] = np.maximum(reg[..., 4], sh * (1 - m))
    a = m
    reg[..., :3] = reg[..., :3] * (1 - a[..., None]) + fill * a[..., None]
    reg[..., 3] = np.maximum(reg[..., 3], a)


def new_canvas():
    return np.zeros((LH * SS, LW * SS, 5), np.float32)   # rgb, ink alpha, shadow


def arc_to_cx(a):          # arc px (0 = facing centre) -> canvas x at SS
    return int(round((a + LW / 2) * SS))



def swirl_mask(height, width):
    """Peptide swirl: two thin intertwined strands with small beads (amino acids), vertical, clean."""
    import math
    im = Image.new('L', (width, height), 0); d = ImageDraw.Draw(im)
    lw = max(2, int(2.2 * SS)); turns = 2.5; n = 400
    for ph in (0, math.pi):
        pts = [(width / 2 + (width / 2 - 6 * SS) * math.sin(2 * math.pi * turns * i / n + ph), 4 * SS + (height - 8 * SS) * i / n) for i in range(n + 1)]
        d.line(pts, fill=255, width=lw, joint='curve')
    for k in range(11):
        t = k / 10; ph = 0 if k % 2 == 0 else math.pi
        x = width / 2 + (width / 2 - 6 * SS) * math.sin(2 * math.pi * turns * t + ph); y = 4 * SS + (height - 8 * SS) * t
        r = 4.5 * SS
        d.ellipse([x - r, y - r, x + r, y + r], fill=255)
    return np.array(im).astype(np.float32) / 255

def build_front():
    c = new_canvas()
    cap = 66 * SS
    word = text_mask('PEPTICITY', cap, track=0.10)
    word = np.rot90(word, 1)                         # reads bottom -> top
    col = -0.43 * R                                  # left third of the body
    ww, wh = word.shape[1], word.shape[0]
    mk = mark_mask(int(96 * SS))
    gap = 46 * SS
    total = mk.shape[0] + gap + wh
    top = (LH * SS - total) // 2 + 6 * SS
    cx = arc_to_cx(col)
    place(c, mk, cx - mk.shape[1] // 2, top, 0)
    place(c, word, cx - ww // 2, top + mk.shape[0] + gap, 1)
    sw = swirl_mask(wh, int(30 * SS))
    place(c, sw, cx + ww // 2 + 22 * SS, top + mk.shape[0] + gap, 1)
    return downsample(c)


def build_back():
    c = new_canvas()
    left = arc_to_cx(-0.60 * R)
    n1, n2 = text_mask('THYMOSIN', 40 * SS, 0.10), text_mask('ALPHA-1', 40 * SS, 0.10)
    amt = text_mask(AMOUNT, 40 * SS, 0.12)
    y = int(LH * SS * 0.52)
    place(c, n1, left, y, 0); y += n1.shape[0] + 18 * SS
    place(c, n2, left, y, 0); y += n2.shape[0] + 30 * SS
    # platinum hairline between name and amount, fading to the right
    rule_w = int(0.55 * R * SS)
    r = np.zeros((int(2.2 * SS) + 2, rule_w), np.float32); r[1:-1] = 1
    r *= np.linspace(1, 0, rule_w)[None, :] ** 0.7
    place(c, r, left + 4 * SS, y, 1); y += r.shape[0] + 30 * SS
    place(c, amt, left, y, 0)
    return downsample(c)


# ---------------- warp label space -> screen (cylinder) ----------------
inside = (np.abs(xs - XC) < R - 1.5)
ARC = R * np.arcsin(U)


def warp(flat, mirror=False):
    a = -ARC if mirror else ARC
    sx = np.broadcast_to((a + LW / 2)[None, :], (H, W))
    sy = yy - Y0 - CURVE * COSU[None, :]
    out = bilinear(flat, sx, sy)
    valid = (sy >= 0) & (sy <= LH - 1) & inside[None, :]
    out[~valid] = 0
    return out


band = (yy >= Y0 + CURVE * COSU[None, :]) & (yy <= Y1 + CURVE * COSU[None, :]) & inside[None, :] & (A0 > 0.95)
band = gblur(band.astype(np.float32), 0.7)


def compose(face_flat, ghost_flat, out_name):
    rgb = RGB0.copy()
    glass = (yy > GLASS_TOP).astype(np.float32)
    glass = gblur(glass, 3)
    lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    hp = (lum - gblur(lum, 14)).clip(0, None)                  # glass highlights / edges
    # 1) dark smoked see-through glass (neutral, a whisper cool)
    smoke = np.array([0.80, 0.82, 0.86], np.float32)
    dark = rgb * 0.40 * smoke + hp[..., None] * 0.55
    rgb = rgb * (1 - glass[..., None]) + dark * glass[..., None]

    # 2) under-light: cool white rising from the base through the liquid
    ny = (yy - 1840) / 900.0
    rise = np.exp(-(ny ** 2) * 3.2) * (yy > GLASS_TOP)
    core = np.exp(-((xx - XC) / (R * 0.95)) ** 2)
    up = rise * (0.35 + 0.65 * core)
    rgb += up[..., None] * np.array([58, 62, 68], np.float32) * A0[..., None]
    heel = np.exp(-((yy - 1745) / 34.0) ** 2) * inside[None, :]
    rgb += heel[..., None] * np.array([120, 126, 134], np.float32) * (0.4 + 0.6 * COSU[None, :, None])
    rim = np.exp(-(((np.abs(xx - XC) - (R - 6)) / 7.0) ** 2)) * rise
    rgb += rim[..., None] * np.array([70, 74, 80], np.float32)

    # 3) ghost: the far side of the label seen through liquid, reversed + lens-stretched, soft
    if ghost_flat is not None:
        g = warp(ghost_flat, mirror=True)
        ga = gblur(g[..., 3], 3.0) * 0.10 * glass
        rgb = rgb + ga[..., None] * 150

    # 4) frosted smoke label: transparent, the liquid and back glass still read through it
    frost = gblur(rgb, 7)
    tint = np.array([16, 17, 20], np.float32)
    lab = frost * 0.48 + tint * 0.52
    rng = np.random.default_rng(11)
    lab += rng.normal(0, 2.4, (H, W, 1)).astype(np.float32)
    sheen = np.exp(-((xs - (XC - 0.56 * R)) / 22.0) ** 2) * 30 + np.exp(-((xs - (XC + 0.70 * R)) / 10.0) ** 2) * 14
    lab += sheen[None, :, None] * (0.5 + 0.5 * COSU[None, :, None])
    lab += hp[..., None] * 0.35
    lab *= (0.72 + 0.28 * COSU[None, :, None])
    lab = lab * (1 - 0.0) + up[..., None] * np.array([26, 28, 31], np.float32)
    rgb = rgb * (1 - band[..., None]) + lab * band[..., None]
    # cut edges of the label catch the under-light
    for yE, k in ((Y0, 95), (Y1, 140)):
        e = np.exp(-((yy - (yE + CURVE * COSU[None, :])) / 1.1) ** 2) * inside[None, :]
        rgb += e[..., None] * k * (0.35 + 0.65 * COSU[None, :, None])

    # 5) print (chrome ink) on the label face
    f = warp(face_flat)
    shade = (0.55 + 0.45 * COSU[None, :]) ** 0.8
    shadow = f[..., 4] * band
    rgb = rgb * (1 - shadow[..., None] * 0.65)
    ink = f[..., 3] * band
    inkrgb = f[..., :3] * shade[..., None] + sheen[None, :, None] * 0.6
    rgb = rgb * (1 - ink[..., None]) + inkrgb * ink[..., None]

    # neutralise: no warm cast anywhere (b* <= a whisper cool)
    l2 = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
    rgb = l2[..., None] * np.array([0.985, 0.995, 1.012], np.float32)
    out = np.dstack([rgb.clip(0, 255), base[..., 3]]).astype(np.uint8)
    img = Image.fromarray(out, 'RGBA')
    bb = img.split()[3].point(lambda v: 255 if v > 8 else 0).getbbox()
    pad = 40
    img = img.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))
    img.save(f'{OUT}/{out_name}')
    return img


front_flat, back_flat = build_front(), build_back()
fi = compose(front_flat, back_flat, 'front.png')
bi = compose(back_flat, front_flat, 'back.png')

# ---------------- preview: both on near-black with the under-light ----------------
PW, PH = 2400, 1800
bg = np.zeros((PH, PW, 3), np.float32) + np.array([9, 9, 11], np.float32)
py, px = np.mgrid[0:PH, 0:PW].astype(np.float32)
floor_y = 1560
pv = Image.fromarray(bg.astype(np.uint8))
for img, cx in ((fi, 800), (bi, 1600)):
    s = 1300 / img.height
    im = img.resize((int(img.width * s), int(img.height * s)), Image.LANCZOS)
    # light pool under each vial
    pool = np.exp(-(((px - cx) / 360) ** 2 + ((py - floor_y) / 46) ** 2)) * 150 \
        + np.exp(-(((px - cx) / 560) ** 2 + ((py - floor_y) / 170) ** 2)) * 34
    arr = np.array(pv).astype(np.float32) + pool[..., None] * np.array([0.93, 0.96, 1.0])
    pv = Image.fromarray(arr.clip(0, 255).astype(np.uint8))
    x0 = cx - im.width // 2; y0 = floor_y - im.height + int(40 * s)
    # faint reflection on the floor
    refl = im.transpose(Image.FLIP_TOP_BOTTOM)
    ra = np.array(refl).astype(np.float32)
    fade = np.linspace(0.20, 0, ra.shape[0])[:, None] ** 1.0
    fade[int(ra.shape[0] * 0.3):] = 0
    ra[..., 3] *= fade
    refl = Image.fromarray(ra.astype(np.uint8)).filter(ImageFilter.GaussianBlur(3))
    pv.paste(refl, (x0, floor_y - int(40 * s) + 4), refl)
    pv.paste(im, (x0, y0), im)
f2 = ImageFont.truetype(FONT, 26)
d = ImageDraw.Draw(pv)
for t, cx in (('FRONT', 800), ('REAR', 1600)):
    tw = d.textlength(t, font=f2); d.text((cx - tw / 2, 1700), t, font=f2, fill=(120, 124, 130))
pv.save(f'{OUT}/preview.png')
print('done', fi.size, bi.size)

"""PEPTICITY vials-final: composite frosted dark labels onto the clean vial base.
FRONT: vertical PEPTICITY (owner's PepticityBlack font, chrome + bevel), off-centre, P mark, clear window.
BACK : product name + strength only, platinum, wrapped to the cylinder.
Usage: python3 render_vials.py [slug ...]   (no args = all products in shared/catalogue.json)"""
import json, sys, os, re
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

ROOT = '/home/user/pepticity'
BASE = f'{ROOT}/brand/vials-final/src/vial-base.png'
FONT = f'{ROOT}/brand/font/PepticityBlack.otf'
PMARK = f'{ROOT}/brand/logo/p-mark.svg'
OUT = f'{ROOT}/brand/vials-final'
CAT = f'{ROOT}/shared/catalogue.json'

XC, R = 680, 317            # body centre and radius (silhouette 363..997)
Y0, Y1, CURVE = 948, 1676, 9  # label band (front edge dips by CURVE at centre)
CROP = (300, 150, 1060, 1880)  # bottle bbox + padding
OUT_H = 900

base = Image.open(BASE).convert('RGBA')
B = np.array(base).astype(np.float32)
H, W = B.shape[:2]
ALPHA = B[..., 3] / 255


def blur(arr, r):
    ch = [np.array(Image.fromarray(arr[..., i].clip(0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32)
          for i in range(arr.shape[2])]
    return np.stack(ch, -1)


def blur1(m, r):
    return np.array(Image.fromarray((m.clip(0, 1) * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))).astype(np.float32) / 255


# ---------- cylinder geometry ----------
xs = np.arange(W)
U = np.clip((xs - XC) / R, -1, 1)
COSU = np.sqrt(1 - U ** 2)                       # facing factor
ARC = R * np.arcsin(U)                           # screen x -> arc length from centre
yy, xx = np.mgrid[0:H, 0:W]
top_edge = Y0 + CURVE * COSU[None, :]
bot_edge = Y1 + CURVE * COSU[None, :]
band = ((yy >= top_edge) & (yy <= bot_edge)).astype(np.float32)
band *= (np.abs(xx - XC) <= R - 1)
band = np.minimum(band, (ALPHA > 0.9).astype(np.float32))
band_s = blur1(band, 0.8)


def warp(flat, cy_shift=True):
    """flat: RGBA float array in label space, width LW centred on arc 0, height H.
    Map to screen using x = XC + R*sin(arc/R); also bend rows with the band curvature."""
    LW = flat.shape[1]
    src_x = np.clip(np.round(ARC + LW / 2).astype(int), 0, LW - 1)
    out = flat[:, src_x]
    if cy_shift:  # rows dip toward centre like the band edges
        dy = np.round(CURVE * COSU).astype(int)
        res = np.zeros_like(out)
        for x in range(W):
            if dy[x]:
                res[dy[x]:, x] = out[:-dy[x], x]
            else:
                res[:, x] = out[:, x]
        out = res
    vis = (np.abs(xs - XC) < R - 2).astype(np.float32)
    out[..., 3] *= vis[None, :] * (0.35 + 0.65 * COSU[None, :] ** 0.5)
    return out


# ---------- frosted smoke band ----------
def frost_layer(seed=7):
    soft = blur(B[..., :3], 12)
    smoke = np.array([13, 14, 17], np.float32)
    fill = soft * 0.34 + smoke * 0.66                         # see-through: 34 % of the glass/liquid still reads
    hp = (B[..., :3] - blur(B[..., :3], 16)).clip(0, None)     # glass highlights survive on top of the frost
    rng = np.random.default_rng(seed)
    grain = rng.normal(0, 4.2, (H, W, 1)).astype(np.float32)
    shade = (0.62 + 0.38 * COSU)[None, :, None]
    spec = np.exp(-((xs - (XC - 0.52 * R)) / 26.0) ** 2)[None, :, None] * 26  # soft vertical sheen
    spec2 = np.exp(-((xs - (XC + 0.70 * R)) / 14.0) ** 2)[None, :, None] * 12
    f = fill * shade + hp * 0.55 + grain + spec + spec2
    lum = f.mean(-1, keepdims=True)
    f = lum + (f - lum) * 0.0 + np.array([-0.6, 0, 1.4])  # neutral, a hair cool
    return f.clip(0, 255)


FROST = frost_layer()

# hairline edges top + bottom (chrome), stronger at the facing centre
edge = np.zeros((H, W), np.float32)
for e in (top_edge, bot_edge):
    d = np.abs(yy - e)
    edge = np.maximum(edge, np.clip(1.6 - d, 0, 1))
edge *= (np.abs(xx - XC) <= R - 2) * (0.25 + 0.75 * COSU[None, :])


# ---------- type ----------
def font(px):
    return ImageFont.truetype(FONT, px)


def cap_px(size):
    return size * 0.70  # cap 700 / 1000 em


def text_mask(txt, size, track=0.0):
    """Render text (supports '+', which the font lacks) as an L mask tightly cropped to cap box."""
    f = font(size)
    cap = cap_px(size)
    stem = cap * 0.155
    parts = []
    widths = []
    for ch in txt:
        if ch == '+':
            w = cap * 0.78
        elif ch == ' ':
            w = f.getlength(' ')
        else:
            w = f.getlength(ch)
        widths.append(w)
    # simple kerning from the font's kern table is in the OTF; PIL basic layout ignores GPOS: use pairwise getlength
    total = 0
    pos = []
    for i, ch in enumerate(txt):
        pos.append(total)
        total += widths[i] + track * size
        if i + 1 < len(txt) and ch not in '+ ' and txt[i + 1] not in '+ ':
            total += f.getlength(ch + txt[i + 1]) - f.getlength(ch) - f.getlength(txt[i + 1])
    total -= track * size
    pad = int(size * 0.3)
    Wt = int(total + 2 * pad)
    Ht = int(size * 1.4)
    im = Image.new('L', (Wt, Ht), 0)
    d = ImageDraw.Draw(im)
    asc = f.getmetrics()[0]
    baseline = pad + asc
    for ch, x in zip(txt, pos):
        if ch == '+':
            cx = pad + x + cap * 0.39
            cy = baseline - cap / 2
            h = cap * 0.62
            d.rectangle([cx - stem / 2, cy - h / 2, cx + stem / 2, cy + h / 2], fill=255)
            d.rectangle([cx - h / 2, cy - stem / 2, cx + h / 2, cy + stem / 2], fill=255)
        elif ch != ' ':
            d.text((pad + x, pad), ch, font=f, fill=255)
    a = np.array(im)
    ys, xs_ = np.where(a > 10)
    return im.crop((xs_.min(), ys.min(), xs_.max() + 1, ys.max() + 1))


def chrome_fill(h, w, axis, stops):
    """Chrome gradient across `axis` (0 = rows, 1 = columns)."""
    n = h if axis == 0 else w
    t = np.linspace(0, 1, n)
    cols = np.zeros((n, 3), np.float32)
    ps = [s[0] for s in stops]
    for c in range(3):
        cols[:, c] = np.interp(t, ps, [s[1][c] for s in stops])
    return np.broadcast_to(cols[:, None, :] if axis == 0 else cols[None, :, :], (h, w, 3)).copy()


def hexrgb(h):
    h = h.lstrip('#')
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


CHROME = [(0, hexrgb('f6f8fa')), (.40, hexrgb('cfd3d8')), (.49, hexrgb('7a8087')), (.53, hexrgb('5d6269')),
          (.62, hexrgb('a9aeb5')), (1, hexrgb('eef1f4'))]
PLAT = [(0, hexrgb('f2f4f6')), (.5, hexrgb('d4d8dd')), (1, hexrgb('aeb3ba'))]


def place_chrome(flat, mask_img, x, y, stops, axis, bevel=2.0, shadow=0.6, glow=0.0):
    """Composite a chrome-filled, bevelled glyph mask into flat RGBA (float) at x,y (top-left)."""
    m = np.array(mask_img).astype(np.float32) / 255
    h, w = m.shape
    padm = 16
    M = np.zeros((h + 2 * padm, w + 2 * padm), np.float32)
    M[padm:padm + h, padm:padm + w] = m
    hh, ww = M.shape
    col = chrome_fill(hh, ww, axis, stops)
    # bevel: light from top-left
    sh = lambda a, dx, dy: np.roll(np.roll(a, dy, 0), dx, 1)
    hi = (M - sh(M, int(bevel), int(bevel))).clip(0, 1)
    lo = (M - sh(M, -int(bevel), -int(bevel))).clip(0, 1)
    col = col + hi[..., None] * 70 - lo[..., None] * 70
    col = col.clip(0, 255)
    x0, y0 = int(x) - padm, int(y) - padm
    region = flat[y0:y0 + hh, x0:x0 + ww]
    # drop shadow onto frost
    if shadow:
        S = blur1(sh(M, 3, 4), 4) * shadow
        region[..., :3] = region[..., :3] * (1 - S[..., None] * (region[..., 3:4] > 0))
    if glow:
        G = blur1(M, 10) * glow
        region[..., :3] = region[..., :3] + G[..., None] * 60
        region[..., 3] = np.maximum(region[..., 3], G * 0.6)
    a = M[..., None]
    region[..., :3] = region[..., :3] * (1 - a) + col * a
    region[..., 3] = np.maximum(region[..., 3], M)


def p_mark_mask(height):
    """Rasterise the P mark path from p-mark.svg (polygon outer + inner counter)."""
    svg = open(PMARK).read()
    d = re.search(r' d="([^"]+)"', svg).group(1)
    subs = [s for s in d.split('Z') if s.strip()]
    vb = (-0.708, -0.58, 1.416, 1.16)
    sc = height / vb[3]
    Wm, Hm = int(vb[2] * sc) + 2, int(height) + 2
    im = Image.new('L', (Wm * 4, Hm * 4), 0)
    dr = ImageDraw.Draw(im)
    for i, s in enumerate(subs):
        pts = [(float(a), float(b)) for a, b in re.findall(r'(-?[\d.]+) (-?[\d.]+)', s)]
        pts = [((px - vb[0]) * sc * 4, (py - vb[1]) * sc * 4) for px, py in pts]
        dr.polygon(pts, fill=255 if i == 0 else 0)
    return im.resize((Wm, Hm), Image.LANCZOS)


def render(prod, side):
    LW = 1400
    flat = np.zeros((H, LW, 4), np.float32)
    cxl = LW // 2  # arc 0
    if side == 'front':
        # vertical PEPTICITY, reads bottom -> top, off-centre left
        word = text_mask('PEPTICITY', 132, track=0.04).rotate(90, expand=True)
        ww, wh = word.size
        wx = cxl - 128 - ww // 2
        pm = p_mark_mask(int(ww * 0.86))
        pw, ph = pm.size
        gap = 34
        total = wh + gap + ph
        top = int((Y0 + Y1) / 2 - total / 2) + 6
        place_chrome(flat, word, wx, top, CHROME, axis=1, bevel=2, shadow=0.7)
        place_chrome(flat, pm, wx + ww // 2 - pw // 2, top + wh + gap, CHROME, axis=0, bevel=2, shadow=0.7)
        # clear window (chamfered) to the right of the word
        win = dict(x0=cxl - 22, x1=cxl + 30, y0=top, y1=top + total)
        flat_win = np.zeros((H, LW), np.float32)
        c = 9
        poly = [(win['x0'] + c, win['y0']), (win['x1'] - c, win['y0']), (win['x1'], win['y0'] + c), (win['x1'], win['y1'] - c),
                (win['x1'] - c, win['y1']), (win['x0'] + c, win['y1']), (win['x0'], win['y1'] - c), (win['x0'], win['y0'] + c)]
        wim = Image.new('L', (LW, H), 0)
        ImageDraw.Draw(wim).polygon(poly, fill=255)
        wmask = np.array(wim).astype(np.float32) / 255
        rim = Image.new('L', (LW, H), 0)
        ImageDraw.Draw(rim).line(poly + [poly[0]], fill=255, width=2)
        rmask = np.array(rim).astype(np.float32) / 255
        win_layer = np.dstack([np.zeros((H, LW, 3), np.float32), wmask])
        rim_layer = np.dstack([np.full((H, LW, 3), 222, np.float32), rmask * 0.75])
        return flat, win_layer, rim_layer
    else:
        lab = prod['label']
        lines = lab['lines']
        maxw = 440
        size = 74
        while True:
            ms = [text_mask(l, size, track=0.03) for l in lines]
            if max(m.size[0] for m in ms) <= maxw or size <= 34:
                break
            size -= 2
        sub = text_mask(lab['sub'], int(size * 0.42), track=0.10) if lab.get('sub') else None
        st = text_mask(lab['strength'], 46 if size > 46 else max(30, size - 4), track=0.08)
        lh = int(cap_px(size) * 1.55)
        blocks = []
        y = 0
        for m in ms:
            blocks.append(('name', m, y)); y += lh
        y -= lh - ms[-1].size[1]
        if sub:
            y += int(cap_px(size) * 0.62); blocks.append(('sub', sub, y)); y += sub.size[1]
        y += 30; rule_y = y; y += 2 + 30
        blocks.append(('st', st, y)); y += st.size[1]
        top = int((Y0 + Y1) / 2 - y / 2) - 8
        for kind, m, by in blocks:
            stops = CHROME if kind == 'name' else PLAT
            place_chrome(flat, m, cxl - m.size[0] // 2, top + by, stops, axis=0,
                         bevel=2 if kind == 'name' else 1, shadow=0.6 if kind == 'name' else 0.45)
        rw = 92
        flat[top + rule_y:top + rule_y + 2, cxl - rw // 2:cxl + rw // 2, :3] = 210
        flat[top + rule_y:top + rule_y + 2, cxl - rw // 2:cxl + rw // 2, 3] = 0.8
        return flat, None, None


def compose(prod, side):
    flat, win, rim = render(prod, side)
    art = warp(flat)
    out = B.copy()
    bm = band_s[..., None]
    if win is not None:
        wm = warp(win)[..., 3:4] * band_s[..., None]
        bm = bm * (1 - wm)   # window: label cut away, raw glass shows
    out[..., :3] = out[..., :3] * (1 - bm) + FROST * bm
    out[..., :3] = out[..., :3] * (1 - edge[..., None] * 0.55) + 226 * edge[..., None] * 0.55
    if rim is not None:
        r = warp(rim)
        a = r[..., 3:4] * band_s[..., None]
        out[..., :3] = out[..., :3] * (1 - a) + r[..., :3] * a
    a = art[..., 3:4] * band_s[..., None]
    out[..., :3] = out[..., :3] * (1 - a) + art[..., :3] * a
    # glass sits OVER the label: re-apply the bottle's own specular highlights faintly
    hp = (B[..., :3] - blur(B[..., :3], 10)).clip(0, None)
    out[..., :3] += hp * 0.35 * band_s[..., None]
    out[..., :3] = out[..., :3].clip(0, 255)
    img = Image.fromarray(out.astype(np.uint8), 'RGBA').crop(CROP)
    w = round(img.size[0] * OUT_H / img.size[1])
    return img.resize((w, OUT_H), Image.LANCZOS)


def main():
    cat = json.load(open(CAT))['products']
    want = set(sys.argv[1:])
    for p in cat:
        if want and p['slug'] not in want:
            continue
        for side in ('front', 'back'):
            im = compose(p, side)
            im.save(f"{OUT}/{p['slug']}-{side}.webp", 'WEBP', quality=92, method=6)
        print('ok', p['slug'])


if __name__ == '__main__':
    main()

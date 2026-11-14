"""Cut the store's menu art out of the owner's pick, menu 58 (Higgsfield render, blue toned down 25%).

Nothing is redrawn: every output pixel comes from the render. The only edits are
  - the bar is cut from its background along its own edges (alpha),
  - the lettering baked on the keys (SHOP, PEPTIDES, RESEARCH, ABOUT, CART) is lifted off so the store can set
    the same words live in the PEPTICITY font, bolder (owner, Nov 13),
  - the crystal's light is taken down a touch (owner, Nov 13: "tone down the center light").
usage: slice58.py art/m58_full.png out_dir
"""
import sys, os
import numpy as np
import cv2

src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
im = cv2.imread(src)                                   # BGR, 2688 x 1520
Hh, Ww = im.shape[:2]

# ---------- 1. lift the baked lettering off the keys ----------
def lift(img, box, thr, grow=4, rad=7, lowsat=False):
    x0, y0, x1, y1 = box
    roi = img[y0:y1, x0:x1]
    mx = roi.max(-1).astype(np.int32)
    m = mx > thr
    if lowsat:                                         # on the blue crystal the letters are the pale, low-saturation pixels
        hsv = cv2.cvtColor(roi, cv2.COLOR_BGR2HSV)
        m = (mx > thr) & (hsv[..., 1] < 150)
    m = cv2.dilate(m.astype(np.uint8), np.ones((2 * grow + 1, 2 * grow + 1), np.uint8))
    mask = np.zeros(img.shape[:2], np.uint8)
    mask[y0:y1, x0:x1] = m * 255
    return cv2.inpaint(img, mask, rad, cv2.INPAINT_TELEA)

work = im.copy()
for box in [(940, 380, 1112, 450), (1692, 380, 1992, 450), (2080, 380, 2280, 450), (2360, 380, 2525, 450)]:
    work = lift(work, box, 70)
work = lift(work, (1250, 372, 1556, 452), 150, grow=5, rad=9, lowsat=True)

# ---------- 2. the crystal's light, a touch lower ----------
hsv = cv2.cvtColor(work, cv2.COLOR_BGR2HSV).astype(np.float32)
hue = hsv[..., 0] * 2
blue = np.clip(1 - np.abs(hue - 220) / 40, 0, 1) * np.clip((hsv[..., 1] / 255 - .25) / .3, 0, 1)
zone = np.zeros((Hh, Ww), np.float32)
cv2.rectangle(zone, (1120, 215), (1720, 560), 1, -1)
zone = cv2.GaussianBlur(zone, (0, 0), 30)
hsv[..., 2] *= 1 - 0.14 * blue * zone
work = cv2.cvtColor(np.clip(hsv, 0, 255).astype(np.uint8), cv2.COLOR_HSV2BGR)

# ---------- 3. the bar's own outline ----------
alpha = np.zeros((Hh, Ww), np.uint8)
poly = np.array([(132, 285), (2558, 285), (2621, 350), (2621, 492), (2574, 538), (114, 538), (68, 492), (68, 352)], np.int32)
cv2.fillPoly(alpha, [poly], 255, lineType=cv2.LINE_AA)
# the crystal and the liquid chrome that rise above the top edge: bright or blue pixels joined to the bar
x0, x1, y0, y1 = 1080, 1800, 205, 292
roi = work[y0:y1, x0:x1].astype(np.int32)
mx = roi.max(-1)
bl = (roi[..., 0] - roi[..., 2] > 22) & (roi[..., 0] > 60)
m = ((mx > 74) | bl).astype(np.uint8)
m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
m = cv2.morphologyEx(m, cv2.MORPH_CLOSE, np.ones((15, 15), np.uint8))
full = np.zeros((Hh, Ww), np.uint8)
full[y0:y1, x0:x1] = m
n, lab = cv2.connectedComponents(full)
seed = np.unique(lab[286:290, 1150:1750]); seed = seed[seed > 0]          # components touching the top edge
keep = np.isin(lab, seed)
# fill holes inside the bulge (dark facets)
k = keep.astype(np.uint8)
ff = k.copy(); h2 = np.zeros((Hh + 2, Ww + 2), np.uint8); cv2.floodFill(ff, h2, (0, 0), 1)
k = k | (1 - ff)
k = cv2.morphologyEx(k, cv2.MORPH_OPEN, np.ones((9, 9), np.uint8))          # no stray spikes
k = cv2.GaussianBlur((k * 255).astype(np.uint8), (0, 0), 1.2)
alpha = np.maximum(alpha, k)
alpha = cv2.GaussianBlur(alpha, (0, 0), 0.7)

rgba = np.dstack([work, alpha])

def save(name, arr, q=90):
    cv2.imwrite(os.path.join(out, name), arr, [cv2.IMWRITE_WEBP_QUALITY, q])
    print(name, arr.shape[1], 'x', arr.shape[0], os.path.getsize(os.path.join(out, name)) // 1024, 'KB')

# ---------- 4. the plates ----------
BX0, BX1, BY0, BY1 = 56, 2634, 205, 550                 # the wide bar's box (with the crystal's rise)
save('bar.webp', rgba[BY0:BY1, BX0:BX1])
print('BAR_BOX', BX0, BY0, BX1 - BX0, BY1 - BY0)
CY0, CY1 = 275, 548                                     # the compact bar: the same blade, no crystal on it
save('bar-left.webp', rgba[CY0:CY1, 56:846])        # the whole wordmark: its Y ends at x 836
save('bar-mid.webp', rgba[CY0:CY1, 846:854])         # plain plate between the wordmark and the divider
save('bar-right.webp', rgba[CY0:CY1, 2572:2634])
print('COMPACT heights', CY1 - CY0, 'left', 846 - 56, 'right', 2634 - 2572)

# a key, blank: ABOUT's plate with its own chamfered outline
kx0, kx1, ky0, ky1 = 2040, 2312, 346, 491
key = rgba[ky0:ky1, kx0:kx1].copy()
kw, kh = kx1 - kx0, ky1 - ky0
ka = np.zeros((kh, kw), np.uint8)
c = 30
cv2.fillPoly(ka, [np.array([(c, 0), (kw - c, 0), (kw - 1, c), (kw - 1, kh - c), (kw - c, kh - 1), (c, kh - 1), (0, kh - c), (0, c)], np.int32)], 255, lineType=cv2.LINE_AA)
key[..., 3] = cv2.GaussianBlur(ka, (0, 0), 0.8)
save('key-left.webp', key[:, :84]); save('key-mid.webp', key[:, 120:152]); save('key-right.webp', key[:, kw - 84:])
print('KEY', kw, kh)

# the crystal's face, for the PEPTIDES key in the phone menu
gx0, gx1, gy0, gy1 = 1126, 1696, 278, 528
gem = rgba[gy0:gy1, gx0:gx1].copy()
ga = np.zeros((gy1 - gy0, gx1 - gx0), np.uint8)
cv2.fillPoly(ga, [np.array([(1246 - gx0, 357 - gy0), (1691 - gx0, 283 - gy0), (1551 - gx0, 455 - gy0), (1131 - gx0, 523 - gy0)], np.int32)], 255, lineType=cv2.LINE_AA)
gem[..., 3] = cv2.GaussianBlur(ga, (0, 0), 1.0)
save('gem.webp', gem)
cv2.imwrite(os.path.join(out, '_check_bar.png'), rgba[BY0:BY1, BX0:BX1])

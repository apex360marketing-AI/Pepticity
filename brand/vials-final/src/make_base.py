"""Derive ONE clean label-less vial base from round-1 render 07 (vertical chrome spine).
Removes the printed text (column fill from clean rows) and the chrome spine (mirror of the
clean opposite side), then neutralises colour so glass and crimp stay pure platinum."""
import numpy as np
from PIL import Image, ImageFilter
SRC = '/home/user/pepticity/brand/vials20/07-vertical-chrome-spine.png'
OUT = '/home/user/pepticity/brand/vials-final/src/vial-base.png'
im = np.array(Image.open(SRC).convert('RGBA')).astype(np.float32)
rgb, a = im[..., :3].copy(), im[..., 3]
H, W = a.shape
XC = 680  # body centre (363..997)

def feather(mask, r=3):
    m = Image.fromarray((mask * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(r))
    return (np.array(m).astype(np.float32) / 255)[..., None]

# 1) text block: x 640..960, y 1118..1322 -> per-column interpolation between clean rows above/below
x0, x1, y0, y1 = 636, 964, 1112, 1328
fixed = rgb.copy()
above = rgb[y0 - 40:y0].mean(0)   # (w,3) per column
below = rgb[y1:y1 + 40].mean(0)
for y in range(y0, y1):
    t = (y - y0) / (y1 - y0)
    fixed[y, x0:x1] = (1 - t) * above[x0:x1] + t * below[x0:x1]
m = np.zeros((H, W), np.float32); m[y0:y1, x0:x1] = 1
rgb = rgb * (1 - feather(m, 4)) + fixed * feather(m, 4)

# 2) spine: x 488..632, y 826..1722 -> mirror of the clean right side
sx0, sx1, sy0, sy1 = 486, 634, 822, 1726
mir = rgb.copy()
for x in range(sx0, sx1):
    mir[sy0:sy1, x] = rgb[sy0:sy1, 2 * XC - x]
m = np.zeros((H, W), np.float32); m[sy0:sy1, sx0:sx1] = 1
rgb = rgb * (1 - feather(m, 5)) + mir * feather(m, 5)

# 3) neutralise: luminance with a whisper of cool (platinum), no warm cast
lum = rgb @ np.array([0.2126, 0.7152, 0.0722], np.float32)
out = np.stack([lum * 0.985, lum * 0.993, lum * 1.008], -1).clip(0, 255)
res = np.dstack([out, a]).astype(np.uint8)
Image.fromarray(res, 'RGBA').save(OUT)
print('saved', OUT)

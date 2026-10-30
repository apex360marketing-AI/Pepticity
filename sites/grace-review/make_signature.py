#!/usr/bin/env python3
"""PEPTICITY · Grace review: signature assets, all cut from the owner's Higgsfield signature
(brand/signature/sig-final.png, falls back to sig-a.png). Nothing is redrawn or recoloured:
  email/signature.png      tight crop, 1000 px wide, black ground kept (email fallback + Outlook)
  email/signature.gif      900 px, 27 frames: frame 0 = the signature as is (held 2.4 s), then a narrow
                           light streak runs left to right across the strokes (1.6 s). The streak is the
                           signature's own pixels screened brighter where a moving band meets the strokes
                           (mask = the signature's own luminance), so it stays tight to the lettering.
  assets/sig-page.webp     page copy: the same pixels with the black made transparent (alpha = brightness,
                           colour un-premultiplied), so it sits on the smoke with no black box
  assets/sig-mask.png      stroke mask for the CSS streak (white, alpha = the signature's luminance)
Run: python3 sites/grace-review/make_signature.py   (needs Pillow + numpy; ImageMagick optional for GIF optimise)"""
import os, pathlib, shutil, subprocess
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-review"
SRC = ROOT / "brand/signature/sig-final.png"
if not SRC.exists():
    SRC = ROOT / "brand/signature/sig-a.png"
(SITE / "email").mkdir(parents=True, exist_ok=True)
(SITE / "assets").mkdir(parents=True, exist_ok=True)

im = Image.open(SRC).convert("RGB")
a = np.asarray(im).astype(int)
ys, xs = np.where(a.max(axis=2) > 2)
pad = 14
crop = im.crop((max(0, xs.min() - pad), max(0, ys.min() - pad), min(im.width, xs.max() + pad + 1), min(im.height, ys.max() + pad + 1)))


def sized(w):
    return crop.resize((w, round(crop.height * w / crop.width)), Image.LANCZOS)


def mask_of(img, lo=26, hi=150):
    f = np.asarray(img).astype(float)
    L = .2126 * f[..., 0] + .7152 * f[..., 1] + .0722 * f[..., 2]
    t = np.clip((L - lo) / (hi - lo), 0, 1)
    return t * t * (3 - 2 * t)


# 1) email static copy
png = sized(1000)
png.save(SITE / "email/signature.png", optimize=True)

# 2) page copy with alpha + stroke mask
f = np.asarray(png).astype(float)
al = f.max(axis=2)
al[al < 3] = 0
rgb = np.where(al[..., None] > 0, np.clip(f / np.maximum(al[..., None], 1) * 255, 0, 255), 0)
Image.fromarray(np.dstack([rgb, al]).astype(np.uint8), "RGBA").save(SITE / "assets/sig-page.webp", "WEBP", quality=90, alpha_quality=90, method=6)
mk = mask_of(png)
Image.fromarray(np.dstack([np.full(mk.shape, 255, np.uint8)] * 3 + [(mk * 255).astype(np.uint8)]), "RGBA").save(SITE / "assets/sig-mask.png", optimize=True)

# 3) email GIF: one light streak, left to right, masked to the strokes
g = sized(900)
base = np.asarray(g).astype(float) / 255
H, W = base.shape[:2]
mk = mask_of(g)
yy, xx = np.mgrid[0:H, 0:W].astype(float)
u = (xx + (yy - H / 2) * np.tan(np.radians(18))) / W
streak = np.array([196, 222, 255]) / 255
frames, dur, N = [g], [2400], 26
for i in range(N):
    t = i / (N - 1)
    c = -0.12 + 1.24 * t * t * (3 - 2 * t)
    band = np.exp(-((u - c) / 0.03) ** 2) * 0.92 + np.exp(-((u - c) / 0.11) ** 2) * 0.30
    out = 1 - (1 - base) * (1 - (band * mk)[..., None] * streak)   # screen
    frames.append(Image.fromarray((np.clip(out, 0, 1) * 255 + .5).astype(np.uint8), "RGB"))
    dur.append(60)
strip = Image.new("RGB", (W, H * len(frames)))
for k, fr in enumerate(frames):
    strip.paste(fr, (0, k * H))
pal = strip.quantize(colors=255, method=Image.Quantize.MEDIANCUT)
q = [fr.quantize(palette=pal, dither=Image.Dither.NONE) for fr in frames]
gif = SITE / "email/signature.gif"
q[0].save(gif, save_all=True, append_images=q[1:], duration=dur, loop=0, optimize=False, disposal=1)
if shutil.which("convert"):
    tmp = gif.with_suffix(".opt.gif")
    subprocess.run(["convert", str(gif), "-layers", "Optimize", str(tmp)], check=True)
    if tmp.stat().st_size < gif.stat().st_size:
        tmp.replace(gif)
    else:
        tmp.unlink()

for p in ["email/signature.png", "email/signature.gif", "assets/sig-page.webp", "assets/sig-mask.png"]:
    print(f"{p:24s} {os.path.getsize(SITE / p):>8,d} bytes")
print("source:", SRC.relative_to(ROOT), "| gif", W, "x", H, "|", len(frames), "frames")

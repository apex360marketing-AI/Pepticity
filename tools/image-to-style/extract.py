#!/usr/bin/env python3
"""image-to-style / extract.py

Measure a reference image (background, texture, colour) from its PIXELS and
write a style spec: palette (hex + OKLCH + share), background colour, role
tokens, luminance gradients, grain/noise numbers and a 512 px seamless tile.

Only numpy + Pillow. Run isolated:
    python3 -I extract.py IMAGE [--out DIR] [--k 8] [--tile 512] [--tile-mode blend|mirror]

Writes into DIR (default: <image-stem>.style/ next to the image):
    style.json         the full measured spec (also printed to stdout)
    tokens.css         :root { --bg --surface --ink --muted --accent --texture }
    tile.png           512 px seamless tile cut from the image's own pixels
    tile-3x3.png       the tile repeated 3x3, to prove there is no seam
    swatches.png       palette strip, width proportional to share

Colour maths: sRGB -> linear -> OKLab (Bjorn Ottosson, https://bottosson.github.io/posts/oklab/).
OKLab distances are reported x100 ("dE_ok"), so ~2 is a just-noticeable difference.
"""
import argparse
import json
import math
import os
import sys

import numpy as np
from PIL import Image, ImageFilter

# ---------------------------------------------------------------- colour maths

def srgb_to_linear(c):
    c = np.asarray(c, dtype=np.float64)
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(c):
    c = np.clip(np.asarray(c, dtype=np.float64), 0, 1)
    return np.where(c <= 0.0031308, c * 12.92, 1.055 * np.power(c, 1 / 2.4) - 0.055)


_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806675834, 0.1073304186],
                [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]])
_M1i = np.linalg.inv(_M1)
_M2i = np.linalg.inv(_M2)


def rgb8_to_oklab(rgb):
    """rgb: (..., 3) uint8 or 0-255 floats -> (..., 3) OKLab."""
    lin = srgb_to_linear(np.asarray(rgb, dtype=np.float64) / 255.0)
    lms = np.cbrt(lin @ _M1.T)
    return lms @ _M2.T


def oklab_to_rgb8(lab):
    lms = np.asarray(lab, dtype=np.float64) @ _M2i.T
    lin = (lms ** 3) @ _M1i.T
    return np.round(linear_to_srgb(lin) * 255).astype(np.int64)


def oklab_to_oklch(lab):
    L, a, b = lab[..., 0], lab[..., 1], lab[..., 2]
    C = np.hypot(a, b)
    h = np.degrees(np.arctan2(b, a)) % 360
    return np.stack([L, C, h], axis=-1)


def hex_of(rgb):
    r, g, b = [int(max(0, min(255, v))) for v in rgb]
    return "#%02x%02x%02x" % (r, g, b)


def lab_entry(lab, share=None, **extra):
    lab = np.asarray(lab, dtype=np.float64)
    L, C, h = oklab_to_oklch(lab)
    rgb = oklab_to_rgb8(lab)
    d = {
        "hex": hex_of(rgb),
        "oklch": "oklch(%.3f %.4f %.1f)" % (L, C, h if C > 0.002 else 0),
        "L": round(float(L), 4), "C": round(float(C), 4), "h": round(float(h), 1),
    }
    if share is not None:
        d["share"] = round(float(share), 4)
    d.update(extra)
    return d

# ---------------------------------------------------------------- k-means

def kmeans(X, k, iters=40, seed=7):
    """k-means++ init, Lloyd iterations. X: (N, 3) OKLab. Deterministic."""
    rng = np.random.default_rng(seed)
    N = len(X)
    centres = [X[rng.integers(N)]]
    d2 = np.sum((X - centres[0]) ** 2, axis=1)
    for _ in range(1, k):
        p = d2 / d2.sum() if d2.sum() > 0 else None
        centres.append(X[rng.choice(N, p=p)])
        d2 = np.minimum(d2, np.sum((X - centres[-1]) ** 2, axis=1))
    C = np.array(centres)
    for _ in range(iters):
        dist = ((X[:, None, :] - C[None, :, :]) ** 2).sum(-1)
        lab = dist.argmin(1)
        newC = np.array([X[lab == j].mean(0) if np.any(lab == j) else C[j] for j in range(k)])
        if np.allclose(newC, C, atol=1e-6):
            break
        C = newC
    dist = ((X[:, None, :] - C[None, :, :]) ** 2).sum(-1)
    return C, dist.argmin(1)


def merge_close(C, labels, min_de=0.02):
    """Merge clusters closer than min_de in OKLab (avoid near-duplicate swatches)."""
    C = list(C)
    counts = [int(np.sum(labels == j)) for j in range(len(C))]
    groups = [[j] for j in range(len(C))]
    changed = True
    while changed and len(C) > 1:
        changed = False
        best = None
        for i in range(len(C)):
            for j in range(i + 1, len(C)):
                d = float(np.linalg.norm(np.asarray(C[i]) - np.asarray(C[j])))
                if d < min_de and (best is None or d < best[0]):
                    best = (d, i, j)
        if best:
            _, i, j = best
            w = counts[i] + counts[j]
            C[i] = (np.asarray(C[i]) * counts[i] + np.asarray(C[j]) * counts[j]) / max(w, 1)
            counts[i] = w
            groups[i] += groups[j]
            del C[j], counts[j], groups[j]
            changed = True
    remap = np.zeros(max(max(g) for g in groups) + 1, dtype=np.int64)
    for new, g in enumerate(groups):
        for old in g:
            remap[old] = new
    return np.array(C), remap[labels]

# ---------------------------------------------------------------- helpers

def gauss_blur(a, sigma):
    """Separable Gaussian blur on a 2-D float array (reflect edges)."""
    r = max(1, int(3 * sigma))
    x = np.arange(-r, r + 1)
    k = np.exp(-(x ** 2) / (2 * sigma ** 2))
    k /= k.sum()
    p = np.pad(a, ((r, r), (0, 0)), mode="reflect")
    a = sum(k[i] * p[i:i + a.shape[0], :] for i in range(2 * r + 1))
    p = np.pad(a, ((0, 0), (r, r)), mode="reflect")
    return sum(k[i] * p[:, i:i + a.shape[1]] for i in range(2 * r + 1))


def radial_spectrum(gray):
    """Radially averaged power spectrum of a square greyscale crop (Hann window)."""
    n = gray.shape[0]
    g = gray - gray.mean()
    w = np.outer(np.hanning(n), np.hanning(n))
    P = np.abs(np.fft.fftshift(np.fft.fft2(g * w))) ** 2
    y, x = np.indices(P.shape)
    r = np.hypot(x - n // 2, y - n // 2).astype(np.int64)
    radial = np.bincount(r.ravel(), P.ravel()) / np.maximum(np.bincount(r.ravel()), 1)
    return radial[: n // 2]  # index = cycles per n px


def grain_stats(L, size=512):
    """L: OKLab lightness 0..1 (2-D). Returns grain/noise numbers."""
    hp1 = L - gauss_blur(L, 1.0)      # fine grain (film/sensor noise scale)
    hp3 = L - gauss_blur(L, 3.0)      # texture scale (stone, brushed metal, fabric)
    h, w = L.shape
    n = min(size, h, w)
    n -= n % 2
    cy, cx = h // 2, w // 2
    crop = L[cy - n // 2: cy + n // 2, cx - n // 2: cx + n // 2]
    rad = radial_spectrum(crop)
    f = np.arange(len(rad))
    lo = max(2, n // 128)                    # skip DC / page-scale structure
    band = slice(lo, len(rad) - 1)
    peak = int(f[band][np.argmax(rad[band] * f[band])])  # f*P: energy per octave
    # spectral slope beta (P ~ 1/f^beta): 0 white noise, 1 pink, 2 brown/fbm-like
    ff, pp = f[band].astype(float), rad[band]
    ok = pp > 0
    beta = -np.polyfit(np.log(ff[ok]), np.log(pp[ok]), 1)[0] if ok.sum() > 4 else None
    return {
        "fine_std_L": round(float(hp1.std()), 5),
        "fine_std_8bit": round(float(hp1.std() * 255), 2),
        "texture_std_L": round(float(hp3.std()), 5),
        "texture_std_8bit": round(float(hp3.std() * 255), 2),
        "dominant_frequency_cycles_per_px": round(peak / n, 5),
        "dominant_period_px": round(n / peak, 1) if peak else None,
        "spectral_slope_beta": round(float(beta), 3) if beta is not None else None,
        "analysed_crop_px": n,
        "note": "std values are in OKLab L (0-1) and 8-bit units. Use fine_std as shader/film grain "
                "amplitude, dominant_period_px as noise scale, beta to pick noise type "
                "(~0 white, ~1 pink/value noise, ~2+ fbm/brown).",
    }

# ---------------------------------------------------------------- tile

def pick_tile_window(lab_img, bg_lab, tile):
    """Choose the tile-sized window whose statistics best match the whole image
    and which has the least large-scale structure (gradients, objects)."""
    H, W, _ = lab_img.shape
    L = lab_img[..., 0]
    gstd = L.std() + 1e-6
    hi = np.percentile(L, 98)              # specular highlights / bright objects
    step = max(16, tile // 8)
    q = tile // 4                          # 4x4 coarse means = large-scale structure
    best = None
    for y in range(0, H - tile + 1, step):
        for x in range(0, W - tile + 1, step):
            win = lab_img[y:y + tile, x:x + tile]
            Lw = win[..., 0]
            blocks = Lw[: q * 4, : q * 4].reshape(4, q, 4, q)
            coarse = blocks.mean((1, 3))
            bstd = blocks.std((1, 3))
            unevenness = float(bstd.std() / (bstd.mean() + 1e-6))   # local contrast varies = objects
            structure = coarse.std() / gstd
            highlights = float((Lw > hi).mean())
            colour_off = abs(Lw.mean() - bg_lab[0]) / gstd + np.linalg.norm(win.reshape(-1, 3).mean(0)[1:] - bg_lab[1:]) * 50
            score = structure * 3 + highlights * 20 + colour_off + unevenness * 2
            if best is None or score < best[0]:
                best = (score, x, y, float(coarse.std()), highlights, unevenness)
    return best


def make_seamless(t, mode="blend"):
    """t: (n, n, 3) float 0-255. blend = offset + histogram-preserving blend
    (Heitz & Neyret 2018), keeps grain contrast. mirror = 2x2 mirror of the
    top-left quarter scaled up (always seamless, but symmetric)."""
    n = t.shape[0]
    if mode == "mirror":
        h = n // 2
        q = t[:h, :h]
        top = np.concatenate([q, q[:, ::-1]], 1)
        return np.concatenate([top, top[::-1]], 0)
    # 4 copies: as-is, shifted half in x, in y, in both. Each copy's seam lies where
    # its weight is 0, so no seam survives (bilinear weights, 0 at edges, 1 in middle).
    h = n // 2
    ramp = np.sin(np.linspace(0, np.pi, n)) ** 2
    wy, wx = ramp[:, None, None], ramp[None, :, None]
    copies = [(t, wx * wy), (np.roll(t, h, 1), (1 - wx) * wy),
              (np.roll(t, h, 0), wx * (1 - wy)), (np.roll(t, (h, h), (0, 1)), (1 - wx) * (1 - wy))]
    mu = t.reshape(-1, 3).mean(0)
    mix = sum(w * (c - mu) for c, w in copies)
    mix /= np.sqrt(sum(w ** 2 for _, w in copies))      # variance-preserving
    return np.clip(mix + mu, 0, 255)


def seam_score(t):
    """Mean |difference| across the wrap seams vs the average neighbour-row/column
    difference inside the tile (8-bit). Seamless when wrap <= ~1.5x interior."""
    t = t.astype(np.float64)
    wrap = (np.abs(t[0] - t[-1]).mean() + np.abs(t[:, 0] - t[:, -1]).mean()) / 2
    inner = (np.abs(np.diff(t, axis=0)).mean() + np.abs(np.diff(t, axis=1)).mean()) / 2
    return round(float(wrap), 2), round(float(inner), 2)

# ---------------------------------------------------------------- main

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("image")
    ap.add_argument("--out", help="output folder (default <stem>.style next to image)")
    ap.add_argument("--k", type=int, default=8, help="k-means clusters before merging (6-8)")
    ap.add_argument("--tile", type=int, default=512)
    ap.add_argument("--tile-mode", choices=["blend", "mirror"], default="blend")
    ap.add_argument("--region", help="x,y,w,h in source px: only cut the tile from here (e.g. the marble counter)")
    ap.add_argument("--tile-url", default="tile.png", help="url used for --texture in tokens.css")
    a = ap.parse_args()

    src = Image.open(a.image)
    src = src.convert("RGB")
    W0, H0 = src.size
    out = a.out or os.path.splitext(a.image)[0] + ".style"
    os.makedirs(out, exist_ok=True)

    # ---- palette: k-means in OKLab on a ~200 px thumbnail (area-averaged)
    thumb = src.copy()
    thumb.thumbnail((200, 200), Image.Resampling.BOX)
    tl = rgb8_to_oklab(np.asarray(thumb)).reshape(-1, 3)
    C, lab = kmeans(tl, max(2, a.k))
    C, lab = merge_close(C, lab)
    shares = np.bincount(lab, minlength=len(C)) / len(lab)
    order = np.argsort(-shares)
    palette = [lab_entry(C[j], shares[j]) for j in order]

    # ---- background: median of the outer 6 % frame (what sits behind content)
    full = src.copy()
    full.thumbnail((800, 800), Image.Resampling.BOX)
    fl = rgb8_to_oklab(np.asarray(full))
    h, w, _ = fl.shape
    b = max(2, int(min(h, w) * 0.06))
    frame = np.concatenate([fl[:b].reshape(-1, 3), fl[-b:].reshape(-1, 3),
                            fl[:, :b].reshape(-1, 3), fl[:, -b:].reshape(-1, 3)])
    bg_frame = np.median(frame, axis=0)
    # bg = what sits behind the content: the median of the frame, not the biggest
    # cluster (the biggest cluster can be a shadow or an object filling the shot)
    bg = bg_frame
    dark = bg[0] < 0.6

    # ---- role tokens (only measured colours; derived ones are labelled)
    def dist_L(c):
        return abs(c[0] - bg[0])
    clusters = [(C[j], shares[j]) for j in order]
    # ink: the most extreme-lightness pixels (robust 99th / 1st percentile), low chroma
    Lall = fl[..., 0].ravel()
    sel = Lall >= np.percentile(Lall, 99) if dark else Lall <= np.percentile(Lall, 1)
    ink = np.median(fl.reshape(-1, 3)[sel], axis=0)
    # surface: a real cluster stepped 2-12 L points off bg toward ink, else derived
    step_dir = 1 if dark else -1
    surf_cands = [(c, s) for c, s in clusters
                  if 0.015 <= (c[0] - bg[0]) * step_dir <= 0.12 and s >= 0.02]
    if surf_cands:
        surface = max(surf_cands, key=lambda cs: cs[1])[0]
        surface_src = "measured cluster"
    else:
        surface = bg + np.array([0.04 * step_dir, 0, 0])
        surface_src = "derived: bg lightness +/-0.04, same hue/chroma (no cluster in range)"
    # muted: cluster nearest the bg-ink midpoint in L
    mid = (bg[0] + ink[0]) / 2
    muted = min(clusters, key=lambda cs: abs(cs[0][0] - mid) + 0.5 * np.hypot(cs[0][1], cs[0][2]))[0]
    if abs(muted[0] - mid) > 0.2:
        muted = np.array([mid, *(bg[1:] + ink[1:]) / 2])
        muted_src = "derived: midpoint of bg and ink (no cluster near the midpoint)"
    else:
        muted_src = "measured cluster"

    # accent: only if real chroma outliers exist (pixel level, so small accents survive)
    lch = oklab_to_oklch(fl).reshape(-1, 3)
    Cpx = lch[:, 1]
    medC = float(np.median(Cpx))
    madC = float(np.median(np.abs(Cpx - medC))) + 1e-4
    thr = max(0.05, medC + 6 * madC)
    hot = Cpx > thr
    accent = None
    accent_info = {"threshold_C": round(thr, 4), "median_C": round(medC, 4),
                   "outlier_share": round(float(hot.mean()), 5)}
    if hot.mean() >= 0.001:
        hp_ = fl.reshape(-1, 3)[hot]
        hues = lch[hot, 2]
        # dominant hue among outliers (36 x 10-degree bins), then median colour of that hue
        hb = np.bincount((hues // 10).astype(int) % 36, minlength=36)
        k = int(hb.argmax())
        dh = np.abs(((hues - (k * 10 + 5)) + 180) % 360 - 180)
        sel = dh < 20
        acc = np.median(hp_[sel], axis=0)
        accent = lab_entry(acc, float(hot.mean() * sel.mean()), source="chroma outliers (pixel level)")
    tokens = {
        "mode": "dark" if dark else "light",
        "bg": lab_entry(bg, source="median of the outer 6% frame",
                        nearest_palette_hex=palette[int(np.argmin([np.linalg.norm(C[j] - bg) for j in order]))]["hex"]),
        "surface": lab_entry(surface, source=surface_src),
        "ink": lab_entry(ink, source="99th-percentile lightness pixels" if dark else "1st-percentile lightness pixels"),
        "muted": lab_entry(muted, source=muted_src),
        "accent": accent,
        "accent_test": accent_info,
    }
    def wcag(c1, c2):
        y = [float(srgb_to_linear(oklab_to_rgb8(c) / 255.0) @ np.array([0.2126, 0.7152, 0.0722])) for c in (c1, c2)]
        return (max(y) + 0.05) / (min(y) + 0.05)
    cr = wcag(ink, bg)
    tokens["ink_contrast_vs_bg"] = round(cr, 2)
    if cr < 4.5:
        tokens["warning"] = ("ink vs bg contrast %.2f < 4.5: the image has no readable text colour. Keep the "
                             "measured bg/surface/texture, take ink from the brand tokens, and say so." % cr)

    # ---- gradients: 5 bands top->bottom and left->right (mean OKLab per band)
    def bands(axis):
        res = []
        n = fl.shape[axis]
        for i in range(5):
            s = slice(i * n // 5, (i + 1) * n // 5)
            part = fl[s] if axis == 0 else fl[:, s]
            m = part.reshape(-1, 3).mean(0)
            e = lab_entry(m)
            res.append({"stop": "%d%%" % (i * 25), "hex": e["hex"], "L": e["L"], "oklch": e["oklch"]})
        return res
    grad_tb, grad_lr = bands(0), bands(1)

    def css_grad(dirn, g):
        return "linear-gradient(%s, %s)" % (dirn, ", ".join("%s %s" % (s["hex"], s["stop"]) for s in g))

    # ---- grain on the full-resolution lightness (capped 2048 px)
    g = src.copy()
    g.thumbnail((2048, 2048), Image.Resampling.LANCZOS)
    gl = rgb8_to_oklab(np.asarray(g))
    grain = grain_stats(gl[..., 0])

    # ---- tile: pick the most representative window, make it seamless
    T = a.tile
    rx = ry = 0
    base = src
    if a.region:
        rx, ry, rw, rh = [int(v) for v in a.region.split(",")]
        base = src.crop((rx, ry, rx + rw, ry + rh))
    W0r, H0r = base.size
    scale_note = None
    f = 1.0
    if min(W0r, H0r) < T:
        f = T / min(W0r, H0r)
        base = base.resize((math.ceil(W0r * f), math.ceil(H0r * f)), Image.Resampling.LANCZOS)
        scale_note = "image smaller than tile; upscaled x%.2f (grain softened)" % f
    bl = rgb8_to_oklab(np.asarray(base))
    tile_bg = bg if not a.region else np.median(bl.reshape(-1, 3), axis=0)
    score, tx, ty, structure, highlights, unevenness = pick_tile_window(bl, tile_bg, T)
    texture_ok = structure < 0.02 and highlights < 0.04 and unevenness < 0.4  # 2% sit above p98 by definition
    tx_src, ty_src = int(rx + tx / f), int(ry + ty / f)
    raw = np.asarray(base)[ty:ty + T, tx:tx + T].astype(np.float64)
    tile = make_seamless(raw, a.tile_mode).round().astype(np.uint8)
    Image.fromarray(tile).save(os.path.join(out, "tile.png"))
    Image.fromarray(np.tile(tile, (3, 3, 1))).resize((768, 768), Image.Resampling.BOX).save(
        os.path.join(out, "tile-3x3.png"))
    seam_wrap, seam_inner = seam_score(tile)
    tile_grain = grain_stats(rgb8_to_oklab(tile)[..., 0], size=T)
    tile_mean = lab_entry(rgb8_to_oklab(tile).reshape(-1, 3).mean(0))

    # ---- swatch sheet
    sw = np.zeros((120, 1000, 3), dtype=np.uint8)
    x = 0
    for p in palette:
        wpx = max(6, int(round(p["share"] * 1000)))
        sw[:, x:x + wpx] = [int(p["hex"][i:i + 2], 16) for i in (1, 3, 5)]
        x += wpx
    sw = sw[:, :max(x, 1)]
    Image.fromarray(sw).save(os.path.join(out, "swatches.png"))

    # ---- tokens.css
    t = tokens
    css = [":root{",
           "  /* measured by tools/image-to-style/extract.py from %s */" % os.path.basename(a.image),
           "  --bg: %s; /* %s */" % (t["bg"]["hex"], t["bg"]["oklch"]),
           "  --surface: %s; /* %s */" % (t["surface"]["hex"], t["surface"]["oklch"]),
           "  --ink: %s; /* %s */" % (t["ink"]["hex"], t["ink"]["oklch"]),
           "  --muted: %s; /* %s */" % (t["muted"]["hex"], t["muted"]["oklch"])]
    if accent:
        css.append("  --accent: %s; /* %s */" % (accent["hex"], accent["oklch"]))
    else:
        css.append("  /* --accent: none measured (no chroma outlier); do not invent one */")
    css += ["  --texture: url(%s);" % a.tile_url,
            "  --grad-tb: %s;" % css_grad("to bottom", grad_tb),
            "  --grad-lr: %s;" % css_grad("to right", grad_lr),
            "  --grain-opacity: %.3f; /* fine_std x4, for an overlay of the tile */" % min(1, grain["fine_std_L"] * 4),
            "}"]
    with open(os.path.join(out, "tokens.css"), "w") as fh:
        fh.write("\n".join(css) + "\n")

    spec = {
        "source": os.path.abspath(a.image),
        "size": [W0, H0],
        "palette": palette,
        "background": lab_entry(bg),
        "background_frame_median": lab_entry(bg_frame),
        "tokens": tokens,
        "gradient": {"top_to_bottom": grad_tb, "left_to_right": grad_lr,
                     "css_top_to_bottom": css_grad("to bottom", grad_tb),
                     "css_left_to_right": css_grad("to right", grad_lr)},
        "grain": grain,
        "tile": {"file": os.path.join(out, "tile.png"), "size": T, "mode": a.tile_mode,
                 "crop_xywh_in_source": [tx_src, ty_src, int(T / f), int(T / f)], "pick_score": round(float(score), 3),
                 "structure_L_std": round(structure, 4), "highlight_share": round(highlights, 4), "unevenness": round(unevenness, 3),
                 "verdict": ("texture: tile is usable as a repeating background" if texture_ok else
                             "SCENE, not a texture: this tile carries objects/light shapes and will look "
                             "patterned when repeated. Re-run with --region on a flat textured area, or "
                             "generate the texture in Higgsfield with this image attached as the reference."),
                 "seam_wrap_mean_diff_8bit": seam_wrap, "interior_line_mean_diff_8bit": seam_inner,
                 "mean_colour": tile_mean,
                 "grain_fine_std_8bit": tile_grain["fine_std_8bit"],
                 "grain_texture_std_8bit": tile_grain["texture_std_8bit"],
                 "upscale_note": scale_note},
        "files": {k: os.path.join(out, k) for k in ["style.json", "tokens.css", "tile.png", "tile-3x3.png", "swatches.png"]},
        "units": "L 0-1, C 0-~0.37, h degrees (OKLCH). share = fraction of pixels.",
    }
    with open(os.path.join(out, "style.json"), "w") as fh:
        json.dump(spec, fh, indent=2)
    json.dump(spec, sys.stdout, indent=2)
    print()


if __name__ == "__main__":
    main()

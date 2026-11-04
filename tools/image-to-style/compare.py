#!/usr/bin/env python3
"""image-to-style / compare.py

Score a rendered screenshot against the reference image, from pixels.

    python3 -I compare.py REFERENCE RENDER [--out report.png] [--json report.json]
                          [--ssim-min 0.85] [--de-max 3] [--size 512] [--texture]

Default (layout) mode, both images resized to the reference aspect:
  * SSIM (Wang et al. 2004, Gaussian 11x11 sigma 1.5) on greyscale, long side --size px
  * mean dE_ok = OKLab distance x100 on colour images area-averaged to 64 px long side
    (measures colour, not grain phase); also reports per-pixel dE_ok at --size and
    CIEDE2000 on the same 64 px images for reference.
  PASS = SSIM >= --ssim-min AND mean dE_ok <= --de-max.

--texture mode (backgrounds / materials, where pixels never line up 1:1):
  * colour: dE_ok between mean colours, and between the two 6-colour palettes (matched)
  * grain: ratio of fine high-pass std (render / reference)
  * spectrum: correlation of log radially-averaged power spectra
  PASS = mean-colour dE_ok <= --de-max AND palette dE_ok <= 2*--de-max AND
         0.8 <= grain ratio <= 1.25 AND spectrum corr >= 0.9

Writes a sheet: reference | render | dE heat map (| SSIM map), with the numbers.
Exit code 0 = PASS, 1 = FAIL.
"""
import argparse
import json
import sys

import numpy as np
from PIL import Image, ImageDraw

# ---------------------------------------------------------------- colour maths (same as extract.py)
_M1 = np.array([[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806675834, 0.1073304186],
                [0.0883024619, 0.2817188376, 0.6299787005]])
_M2 = np.array([[0.2104542553, 0.7936177850, -0.0040720468],
                [1.9779984951, -2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662, -0.8086757660]])


def lin(c):
    c = np.asarray(c, dtype=np.float64) / 255.0
    return np.where(c <= 0.04045, c / 12.92, ((c + 0.055) / 1.055) ** 2.4)


def oklab(rgb):
    return np.cbrt(lin(rgb) @ _M1.T) @ _M2.T


def cielab(rgb):
    M = np.array([[0.4124564, 0.3575761, 0.1804375],
                  [0.2126729, 0.7151522, 0.0721750],
                  [0.0193339, 0.1191920, 0.9503041]])
    xyz = lin(rgb) @ M.T / np.array([0.95047, 1.0, 1.08883])
    f = np.where(xyz > (6 / 29) ** 3, np.cbrt(xyz), xyz / (3 * (6 / 29) ** 2) + 4 / 29)
    return np.stack([116 * f[..., 1] - 16, 500 * (f[..., 0] - f[..., 1]), 200 * (f[..., 1] - f[..., 2])], -1)


def ciede2000(l1, l2):
    """Sharma, Wu, Dalal (2005) reference formulation, vectorised."""
    L1, a1, b1 = l1[..., 0], l1[..., 1], l1[..., 2]
    L2, a2, b2 = l2[..., 0], l2[..., 1], l2[..., 2]
    C1, C2 = np.hypot(a1, b1), np.hypot(a2, b2)
    Cb = (C1 + C2) / 2
    G = 0.5 * (1 - np.sqrt(Cb ** 7 / (Cb ** 7 + 25 ** 7)))
    a1p, a2p = (1 + G) * a1, (1 + G) * a2
    C1p, C2p = np.hypot(a1p, b1), np.hypot(a2p, b2)
    h1p = np.degrees(np.arctan2(b1, a1p)) % 360
    h2p = np.degrees(np.arctan2(b2, a2p)) % 360
    dLp, dCp = L2 - L1, C2p - C1p
    dh = h2p - h1p
    dh = np.where(C1p * C2p == 0, 0, np.where(dh > 180, dh - 360, np.where(dh < -180, dh + 360, dh)))
    dHp = 2 * np.sqrt(C1p * C2p) * np.sin(np.radians(dh / 2))
    Lbp, Cbp = (L1 + L2) / 2, (C1p + C2p) / 2
    hs = h1p + h2p
    hbp = np.where(C1p * C2p == 0, hs,
                   np.where(np.abs(h1p - h2p) <= 180, hs / 2, np.where(hs < 360, (hs + 360) / 2, (hs - 360) / 2)))
    T = (1 - 0.17 * np.cos(np.radians(hbp - 30)) + 0.24 * np.cos(np.radians(2 * hbp))
         + 0.32 * np.cos(np.radians(3 * hbp + 6)) - 0.20 * np.cos(np.radians(4 * hbp - 63)))
    dth = 30 * np.exp(-(((hbp - 275) / 25) ** 2))
    Rc = 2 * np.sqrt(Cbp ** 7 / (Cbp ** 7 + 25 ** 7))
    Sl = 1 + 0.015 * (Lbp - 50) ** 2 / np.sqrt(20 + (Lbp - 50) ** 2)
    Sc, Sh = 1 + 0.045 * Cbp, 1 + 0.015 * Cbp * T
    Rt = -np.sin(np.radians(2 * dth)) * Rc
    return np.sqrt((dLp / Sl) ** 2 + (dCp / Sc) ** 2 + (dHp / Sh) ** 2 + Rt * (dCp / Sc) * (dHp / Sh))

# ---------------------------------------------------------------- SSIM


def gauss_filter(a, sigma=1.5, r=5):
    x = np.arange(-r, r + 1)
    k = np.exp(-(x ** 2) / (2 * sigma ** 2))
    k /= k.sum()
    p = np.pad(a, ((r, r), (0, 0)), mode="reflect")
    a = sum(k[i] * p[i:i + a.shape[0]] for i in range(2 * r + 1))
    p = np.pad(a, ((0, 0), (r, r)), mode="reflect")
    return sum(k[i] * p[:, i:i + a.shape[1]] for i in range(2 * r + 1))


def ssim(x, y, data_range=1.0):
    """Wang, Bovik, Sheikh, Simoncelli 2004. x, y: 2-D float arrays. Returns (mean, map)."""
    C1, C2 = (0.01 * data_range) ** 2, (0.03 * data_range) ** 2
    mx, my = gauss_filter(x), gauss_filter(y)
    sxx = gauss_filter(x * x) - mx * mx
    syy = gauss_filter(y * y) - my * my
    sxy = gauss_filter(x * y) - mx * my
    m = ((2 * mx * my + C1) * (2 * sxy + C2)) / ((mx * mx + my * my + C1) * (sxx + syy + C2))
    return float(m[5:-5, 5:-5].mean()), m

# ---------------------------------------------------------------- texture stats


def radial_spectrum(g):
    n = min(g.shape) - min(g.shape) % 2
    g = g[:n, :n] - g[:n, :n].mean()
    w = np.outer(np.hanning(n), np.hanning(n))
    P = np.abs(np.fft.fftshift(np.fft.fft2(g * w))) ** 2
    yy, xx = np.indices(P.shape)
    r = np.hypot(xx - n // 2, yy - n // 2).astype(int)
    rad = np.bincount(r.ravel(), P.ravel()) / np.maximum(np.bincount(r.ravel()), 1)
    return rad[1: n // 2]


def palette6(lab, k=6, seed=3):
    X = lab.reshape(-1, 3)
    rng = np.random.default_rng(seed)
    C = X[rng.choice(len(X), k, replace=False)]
    for _ in range(30):
        l = ((X[:, None] - C[None]) ** 2).sum(-1).argmin(1)
        C = np.array([X[l == j].mean(0) if np.any(l == j) else C[j] for j in range(k)])
    s = np.bincount(l, minlength=k) / len(l)
    return C, s


def palette_distance(A, sa, B, sb):
    """Share-weighted mean distance from each swatch to its nearest swatch in the other set (both ways)."""
    d = np.linalg.norm(A[:, None] - B[None], axis=-1)
    return float((d.min(1) * sa).sum() / 2 + (d.min(0) * sb).sum() / 2)

# ---------------------------------------------------------------- sheet


def heat(v, vmax):
    """0..vmax -> black, violet, orange, white (perceptually ordered, like 'inferno')."""
    t = np.clip(v / vmax, 0, 1)[..., None]
    stops = np.array([[0, 0, 4], [87, 16, 110], [188, 55, 84], [249, 142, 9], [252, 255, 164]], float)
    pos = t * (len(stops) - 1)
    i = np.clip(pos.astype(int), 0, len(stops) - 2)
    f = pos - i
    return (stops[i[..., 0]] * (1 - f) + stops[i[..., 0] + 1] * f).astype(np.uint8)


def sheet(panels, labels, lines, path):
    h = max(p.height for p in panels)
    pad, head = 12, 26
    W = sum(p.width for p in panels) + pad * (len(panels) + 1)
    H = h + head + pad * 2 + 18 * len(lines) + 8
    out = Image.new("RGB", (W, H), (18, 18, 18))
    d = ImageDraw.Draw(out)
    x = pad
    for p, lab in zip(panels, labels):
        d.text((x, 8), lab, fill=(230, 230, 230))
        out.paste(p, (x, head))
        x += p.width + pad
    y = head + h + pad
    for ln in lines:
        d.text((pad, y), ln, fill=(120, 230, 140) if "PASS" in ln else (240, 110, 110) if "FAIL" in ln else (220, 220, 220))
        y += 18
    out.save(path)

# ---------------------------------------------------------------- main


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("reference")
    ap.add_argument("render")
    ap.add_argument("--out", default="compare.png")
    ap.add_argument("--json", dest="json_out")
    ap.add_argument("--ssim-min", type=float, default=0.85)
    ap.add_argument("--de-max", type=float, default=3.0)
    ap.add_argument("--size", type=int, default=512)
    ap.add_argument("--texture", action="store_true", help="statistical texture match instead of pixel alignment")
    a = ap.parse_args()

    ref = Image.open(a.reference).convert("RGB")
    ren = Image.open(a.render).convert("RGB")
    rw, rh = ref.size
    s = a.size / max(rw, rh)
    size = (max(16, round(rw * s)), max(16, round(rh * s)))
    R = np.asarray(ref.resize(size, Image.Resampling.BOX), dtype=np.float64)
    if a.texture:
        # crop the render to the reference aspect (centre) instead of stretching it
        ar = rw / rh
        w, h = ren.size
        cw, ch = (w, round(w / ar)) if w / h < ar else (round(h * ar), h)
        ren_c = ren.crop(((w - cw) // 2, (h - ch) // 2, (w - cw) // 2 + cw, (h - ch) // 2 + ch))
    else:
        ren_c = ren
    X = np.asarray(ren_c.resize(size, Image.Resampling.BOX), dtype=np.float64)
    Rl, Xl = oklab(R), oklab(X)
    de_px = np.linalg.norm(Rl - Xl, axis=-1) * 100
    res = {"reference": a.reference, "render": a.render, "mode": "texture" if a.texture else "layout",
           "compared_at_px": list(size)}

    if not a.texture:
        ss, smap = ssim(Rl[..., 0], Xl[..., 0])
        s64 = 64 / max(rw, rh)
        sz64 = (max(4, round(rw * s64)), max(4, round(rh * s64)))
        R64 = np.asarray(ref.resize(sz64, Image.Resampling.BOX), dtype=np.float64)
        X64 = np.asarray(ren_c.resize(sz64, Image.Resampling.BOX), dtype=np.float64)
        de64 = np.linalg.norm(oklab(R64) - oklab(X64), axis=-1) * 100
        d2000 = ciede2000(cielab(R64), cielab(X64))
        res.update({
            "ssim_grey": round(ss, 4),
            "mean_dE_ok_64px": round(float(de64.mean()), 3),
            "p95_dE_ok_64px": round(float(np.percentile(de64, 95)), 3),
            "mean_dE_ok_per_pixel": round(float(de_px.mean()), 3),
            "mean_CIEDE2000_64px": round(float(d2000.mean()), 3),
            "thresholds": {"ssim_min": a.ssim_min, "dE_max": a.de_max},
        })
        res["pass"] = bool(ss >= a.ssim_min and de64.mean() <= a.de_max)
        res["fails"] = ([] if ss >= a.ssim_min else ["SSIM %.3f < %.2f (shapes/edges/lightness layout differ)" % (ss, a.ssim_min)]) + \
                       ([] if de64.mean() <= a.de_max else ["mean dE_ok %.2f > %.1f (colour differs)" % (de64.mean(), a.de_max)])
        # lightness / chroma direction hints for the adjust step
        dL = float((Xl[..., 0] - Rl[..., 0]).mean())
        dab = (Xl[..., 1:] - Rl[..., 1:]).reshape(-1, 2).mean(0)
        res["hint"] = {"render_minus_ref_L": round(dL, 4), "render_minus_ref_a": round(float(dab[0]), 4),
                       "render_minus_ref_b": round(float(dab[1]), 4),
                       "read": "L>0 render too light; a>0 too red/magenta, a<0 too green; b>0 too yellow/warm, b<0 too blue/cool"}
        smap_img = Image.fromarray(heat(1 - np.clip(smap, 0, 1), 0.6))
        panels = [ref.resize(size), ren_c.resize(size), Image.fromarray(heat(de_px, 15)), smap_img]
        labels = ["reference", "render", "dE_ok heat (0..15)", "1-SSIM heat (0..0.6)"]
        lines = ["%s   SSIM %.3f (min %.2f)   mean dE_ok %.2f (max %.1f)   CIEDE2000 %.2f" %
                 ("PASS" if res["pass"] else "FAIL", ss, a.ssim_min, de64.mean(), a.de_max, d2000.mean())] + res["fails"]
    else:
        mr, mx = Rl.reshape(-1, 3).mean(0), Xl.reshape(-1, 3).mean(0)
        de_mean = float(np.linalg.norm(mr - mx) * 100)
        Pa, sa = palette6(Rl)
        Pb, sb = palette6(Xl)
        de_pal = palette_distance(Pa, sa, Pb, sb) * 100
        gr = Rl[..., 0] - gauss_filter(Rl[..., 0], 1.0, 3)
        gx = Xl[..., 0] - gauss_filter(Xl[..., 0], 1.0, 3)
        ratio = float(gx.std() / (gr.std() + 1e-9))
        sr, sx = np.log(radial_spectrum(Rl[..., 0]) + 1e-12), np.log(radial_spectrum(Xl[..., 0]) + 1e-12)
        corr = float(np.corrcoef(sr, sx)[0, 1]) if sr.std() > 1e-9 and sx.std() > 1e-9 else 0.0  # flat image: no texture
        ok = de_mean <= a.de_max and de_pal <= 2 * a.de_max and 0.8 <= ratio <= 1.25 and corr >= 0.9
        res.update({"mean_colour_dE_ok": round(de_mean, 3), "palette_dE_ok": round(de_pal, 3),
                    "grain_ratio_render_over_ref": round(ratio, 3), "spectrum_correlation": round(corr, 4),
                    "pass": bool(ok)})
        res["fails"] = [m for c, m in [
            (de_mean <= a.de_max, "mean colour dE_ok %.2f > %.1f" % (de_mean, a.de_max)),
            (de_pal <= 2 * a.de_max, "palette dE_ok %.2f > %.1f" % (de_pal, 2 * a.de_max)),
            (0.8 <= ratio <= 1.25, "grain ratio %.2f outside 0.8-1.25 (%s)" % (ratio, "too smooth" if ratio < 1 else "too noisy")),
            (corr >= 0.9, "spectrum corr %.3f < 0.9 (texture scale/pattern differs)" % corr)] if not c]
        panels = [ref.resize(size), ren_c.resize(size), Image.fromarray(heat(de_px, 15))]
        labels = ["reference", "render (centre crop)", "dE_ok heat (0..15) - info only in texture mode"]
        lines = ["%s   mean colour dE_ok %.2f   palette dE_ok %.2f   grain ratio %.2f   spectrum corr %.3f" %
                 ("PASS" if ok else "FAIL", de_mean, de_pal, ratio, corr)] + res["fails"]

    sheet(panels, labels, lines, a.out)
    res["sheet"] = a.out
    if a.json_out:
        with open(a.json_out, "w") as fh:
            json.dump(res, fh, indent=2)
    json.dump(res, sys.stdout, indent=2)
    print()
    sys.exit(0 if res["pass"] else 1)


if __name__ == "__main__":
    main()

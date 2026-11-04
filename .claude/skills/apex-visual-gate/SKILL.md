---
name: "apex-visual-gate"
description: "Run before showing Maverick any page, console, site or prototype: renders it at 1440 and 390 and measures his hard design rules (no grid grounds, real see-through glass, moving ground, no pills, radii, no yellow). A failing page is not shown."
---

# Apex visual gate

The written rules (neon-glass-ui, apex-site-build, his design preferences) are
advice, and advice gets graded by the builder who wrote the page. That is how
a console with a square grid behind it and opaque boxes for "glass" was shown
to him after he had said "no squares" ten times. This gate turns the rules
into numbers. Nothing in it is taste.

## When

Before anything visual is shown to him, published, or called done — and again
after every visual change. It runs after the build skills, before
`build-report`.

## How

1. Copy the script below to the scratchpad as `visual_gate.py`. Needs
   Playwright (preinstalled in the cloud workspace — never `playwright
   install`), numpy and Pillow.
2. Serve the page (a local server, a file:// URL, or the published URL).
3. Run:

   ```
   python3 visual_gate.py <url> <outdir> [selector-that-proves-it-rendered]
   # page with a sign-in code:
   GATE_FILL="input[name=code]||THECODE" GATE_CLICK="button[type=submit]" python3 visual_gate.py ...
   ```

4. Exit 0 = PASS. Exit 1 = do not show the page. Every FAIL line names the
   element and the number that failed.
5. Look at `<outdir>/desk-page.png`, `phone-page.png` and the
   `*-ground-only.png` shots yourself. The gate is the floor, not the ceiling.

## Rules for using it

- Never present, publish or call done a page with a hard FAIL. Fix it and
  rerun.
- Never loosen a threshold to make a page pass. If a rule looks wrong for a
  specific page, ask him.
- A page that cannot be gated (blocked host, no browser) is reported as
  ungated, never as passed.
- Put the RESULT line in the build report.

## What it checks

Hard: NO_LATTICE (no square, grid, dot or hex background, by pixel
autocorrelation and by CSS), GLASS_PRESENT (backdrop-filter 6-16px, thin
fill), GLASS_VISIBLE (the ground behind the panes has something to show),
SILHOUETTES (cut-corner panes, no two alike), GROUND_MOVES (something
organic visibly moves behind the glass), NO_PILLS, RADIUS (at most 3px),
NO_YELLOW (no yellow or gold anywhere, including gradients and shadows),
TYPE (a declared webfont, not a default stack), FALLBACKS (@supports-not
backdrop-filter and reduced-motion), NO_OVERFLOW (no sideways scroll, no page
errors). Warning: TEMPLATE_SMELL (rows of identical tiles, a stock left
sidebar shell).

## The script

```python
#!/usr/bin/env python3
"""Apex visual gate.

    python3 visual_gate.py <url> [outdir] [wait-selector]     exit 0 = pass, 1 = fail
    (sign-in, if the page has one:  GATE_FILL="input[name=code]||XYZ" GATE_CLICK="button[type=submit]")
"""
import io
import json
import os
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from playwright.sync_api import sync_playwright

URL = sys.argv[1]
OUT = Path(sys.argv[2] if len(sys.argv) > 2 else "gate-out")
WAIT = sys.argv[3] if len(sys.argv) > 3 else None
OUT.mkdir(parents=True, exist_ok=True)
VIEWS = [("desk", 1440, 900), ("phone", 390, 844)]

# thresholds -- change them here and nowhere else
MAX_RADIUS = 3.5
BLUR_MIN, BLUR_MAX = 6, 16
MAX_FILL_ALPHA = 0.35
SEEN_RANGE = 16
SEEN_FRACTION = 0.60
GROUND_RANGE = 40
LATTICE_PEAK = 0.45
DEFAULT_FONTS = {"system-ui", "-apple-system", "blinkmacsystemfont", "segoe ui",
                 "arial", "helvetica", "helvetica neue", "roboto", "inter",
                 "sans-serif", "serif", "monospace", "ui-sans-serif", "ui-monospace",
                 "times new roman", "georgia", "courier new", "verdana", "tahoma"}

PROBE = r"""
() => {
  const vw = innerWidth, vh = innerHeight, va = vw * vh;
  const all = [...document.querySelectorAll('body *')];
  const rect = e => e.getBoundingClientRect();
  const vis = e => { const r = rect(e), c = getComputedStyle(e);
    return r.width > 0 && r.height > 0 && c.visibility !== 'hidden' && c.display !== 'none'; };
  const lab = e => e.tagName.toLowerCase() + (e.id ? '#' + e.id : '') +
    ((typeof e.className === 'string' && e.className.trim())
       ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  const alphaOf = s => { const m = /rgba?\(([^)]+)\)/.exec(s); if (!m) return null;
    const p = m[1].split(/[ ,\/]+/).filter(Boolean); return p.length > 3 ? parseFloat(p[3]) : 1; };
  const out = { glass: [], radii: [], pills: [], yellow: [], smell: [], static: [], errors: [] };

  for (const e of all) {
    const c = getComputedStyle(e);
    const bf = c.backdropFilter || c.webkitBackdropFilter || 'none';
    if (bf === 'none' || !vis(e)) continue;
    const r = rect(e), m = /blur\(([\d.]+)px\)/.exec(bf);
    const al = [];
    const a0 = alphaOf(c.backgroundColor); if (a0 !== null) al.push(a0);
    for (const mm of c.backgroundImage.matchAll(/rgba?\([^)]+\)/g)) { const a = alphaOf(mm[0]); if (a !== null) al.push(a); }
    out.glass.push({ sel: lab(e), x: r.x, y: r.y, w: r.width, h: r.height,
      blur: m ? parseFloat(m[1]) : null, alpha: al.length ? Math.max(...al) : 0,
      clip: c.clipPath && c.clipPath !== 'none' ? c.clipPath : '' });
  }

  const SHAPE = 'button,[role=button],a.btn,.btn,input,select,textarea,' +
    '[class*=pane],[class*=card],[class*=tile],[class*=panel],[class*=chip],[class*=tag],[class*=badge],[class*=pill]';
  const seen = new Set();
  const shapes = [...document.querySelectorAll(SHAPE)];
  for (const e of all) { const c = getComputedStyle(e);
    if ((c.backdropFilter && c.backdropFilter !== 'none') || e.matches(SHAPE)) shapes.push(e); }
  for (const e of shapes) {
    if (seen.has(e) || !vis(e)) continue; seen.add(e);
    const r = rect(e), c = getComputedStyle(e);
    const mn = Math.min(r.width, r.height);
    if (mn < 14) continue;
    let rad = parseFloat(c.borderTopLeftRadius) || 0;
    if (/%/.test(c.borderTopLeftRadius)) rad = mn * rad / 100;
    if (rad > 3.5) out.radii.push({ sel: lab(e), r: Math.round(rad * 10) / 10 });
    if (mn >= 18 && rad >= 0.45 * mn) out.pills.push({ sel: lab(e), r: Math.round(rad), h: Math.round(mn) });
  }

  const toHsl = (r, g, b) => { r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2; let h = 0, s = 0;
    if (mx !== mn) { const d = mx - mn; s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
      if (mx === r) h = ((g - b) / d + (g < b ? 6 : 0)); else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; }
    return [h, s, l]; };
  const scan = (str) => { const hits = [];
    for (const mm of String(str).matchAll(/rgba?\(([^)]+)\)/g)) {
      const p = mm[1].split(/[ ,\/]+/).filter(Boolean).map(parseFloat);
      const a = p.length > 3 ? p[3] : 1; if (a < 0.25) continue;
      const [h, s, l] = toHsl(p[0], p[1], p[2]);
      if (h >= 36 && h <= 68 && s >= 0.35 && l >= 0.25 && l <= 0.88) hits.push(mm[0]); }
    return hits; };
  for (const e of all.slice(0, 3000)) {
    if (!vis(e)) continue; const c = getComputedStyle(e);
    const h = [...scan(c.color), ...scan(c.backgroundColor), ...scan(c.borderTopColor),
               ...scan(c.backgroundImage), ...scan(c.boxShadow), ...scan(c.textShadow)];
    if (h.length) out.yellow.push({ sel: lab(e), c: h[0] });
  }

  for (const e of [document.documentElement, document.body, ...all]) {
    for (const ps of [null, '::before', '::after']) {
      const c = getComputedStyle(e, ps); const bi = c.backgroundImage;
      if (!bi || bi === 'none') continue;
      const r = rect(e); if (r.width * r.height < 0.4 * va) continue;
      const sizes = (c.backgroundSize.match(/([\d.]+)px/g) || []).map(parseFloat);
      const small = sizes.length && Math.min(...sizes) <= 240;
      const lin = (bi.match(/linear-gradient/g) || []).length;
      const hairline = /\b1(\.\d)?px\b/.test(bi);
      const svgGrid = /data:image\/svg/.test(bi) && /(%3Cline|<line|%3Crect|<rect|%3Cpattern|<pattern)/i.test(decodeURIComponent(bi));
      if (small && ((lin >= 2 && hairline) || /repeating-(linear|conic)/.test(bi) || svgGrid))
        out.static.push({ sel: lab(e) + (ps || ''), bg: bi.slice(0, 90), size: c.backgroundSize });
    }
  }

  const first = s => (s || '').split(',')[0].replace(/["']/g, '').trim().toLowerCase();
  const hd = document.querySelector('h1,h2,h3,[class*=title]') || document.body;
  out.fontBody = first(getComputedStyle(document.body).fontFamily);
  out.fontHead = first(getComputedStyle(hd).fontFamily);
  let ff = false;
  for (const l of document.querySelectorAll('link[href]')) if (/fonts\.googleapis|fonts\.bunny|typekit|fontshare/.test(l.href)) ff = true;
  const walk = rules => { for (const r of rules) { if (r.type === 5) ff = true; if (r.cssRules) walk(r.cssRules); } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch (e) {} }
  out.webfont = ff || document.fonts.size > 0;

  let sup = false, rm = false;
  const walk2 = rules => { for (const r of rules) {
      const t = (r.conditionText || r.media && r.media.mediaText || '') + '';
      if (r.type === 12 && /backdrop-filter/.test(t) && /not/.test(t)) sup = true;
      if (r.type === 4 && /prefers-reduced-motion/.test(t)) rm = true;
      if (r.cssRules) walk2(r.cssRules); } };
  for (const s of document.styleSheets) { try { walk2(s.cssRules); } catch (e) {} }
  out.supportsNot = sup; out.reducedMotion = rm;

  for (const p of all) {
    const kids = [...p.children].filter(k => vis(k) && rect(k).width * rect(k).height >= 6000);
    if (kids.length < 4) continue;
    const g = {};
    for (const k of kids) { const r = rect(k); const key = Math.round(r.width / 3) + 'x' + Math.round(r.height / 3); (g[key] = g[key] || []).push(k); }
    for (const key in g) if (g[key].length >= 4) out.smell.push('identical tile row x' + g[key].length + ' in ' + lab(p));
  }
  for (const e of document.querySelectorAll('nav,aside,[class*=sidebar],[id*=sidebar]')) {
    const r = rect(e); if (r.left < 8 && r.width >= 140 && r.width <= 340 && r.height >= 0.6 * vh) out.smell.push('left sidebar shell (' + lab(e) + ')');
  }

  out.overflow = document.documentElement.scrollWidth - innerWidth;

  for (const e of all) {
    const c = getComputedStyle(e);
    if (!(c.position === 'fixed' || c.position === 'absolute') || !vis(e)) continue;
    const r = rect(e); if (r.width * r.height < 0.6 * va) continue;
    if ((c.backdropFilter && c.backdropFilter !== 'none') || (e.innerText || '').trim().length >= 20) continue;
    e.setAttribute('data-gate-ground', '1');
  }
  return out;
}
"""


def lum(img):
    a = np.asarray(img.convert("RGB"), dtype=np.float64)
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


def periodic(profile):
    """Strongest normalised autocorrelation peak of a high-passed 1-D profile."""
    k = 31
    pad = np.pad(profile, (k // 2, k // 2), mode="edge")
    hp = profile - np.convolve(pad, np.ones(k) / k, mode="valid")
    if hp.std() < 0.08:
        return 0.0, 0
    hp = hp - hp.mean()
    n = len(hp)
    f = np.fft.rfft(hp, 2 * n)
    ac = np.fft.irfft(f * np.conj(f))[:n]
    ac = ac / ac[0]
    lo, hi = 8, min(260, n // 2)
    lag = int(np.argmax(ac[lo:hi])) + lo
    return float(ac[lag]), lag


def analyse(probe, ground_png, ground_png2):
    res = {}
    Y = lum(Image.open(io.BytesIO(ground_png)))
    h, w = Y.shape
    cp, cl = periodic(Y.mean(axis=0))
    rp, rl = periodic(Y.mean(axis=1))
    pix = cp >= LATTICE_PEAK and rp >= LATTICE_PEAK
    st = probe["static"]
    res["NO_LATTICE"] = (not pix and not st,
        f"columns repeat every {cl}px (strength {cp:.2f}), rows every {rl}px (strength {rp:.2f})"
        + (f"; CSS lattice in {st[0]['sel']} size {st[0]['size']}" if st else ""))
    g = probe["glass"]
    ok_blur = [x for x in g if x["blur"] is not None and BLUR_MIN <= x["blur"] <= BLUR_MAX]
    thin = [x for x in g if x["alpha"] <= MAX_FILL_ALPHA]
    res["GLASS_PRESENT"] = (len(ok_blur) >= 3 and len(thin) >= 0.8 * max(1, len(g)),
        f"{len(g)} backdrop-filter elements, {len(ok_blur)} with blur {BLUR_MIN}-{BLUR_MAX}px, "
        f"{len(thin)} with fill alpha <= {MAX_FILL_ALPHA}")
    tot = seen = 0.0
    worst = None
    for x in g:
        x0, y0 = max(0, int(x["x"])), max(0, int(x["y"]))
        x1, y1 = min(w, int(x["x"] + x["w"])), min(h, int(x["y"] + x["h"]))
        if (x1 - x0) * (y1 - y0) < 8000:
            continue
        reg = Y[y0:y1, x0:x1].ravel()
        rng = float(np.percentile(reg, 95) - np.percentile(reg, 5))
        a = (x1 - x0) * (y1 - y0)
        tot += a
        if rng >= SEEN_RANGE:
            seen += a
        elif worst is None or rng < worst[0]:
            worst = (rng, x["sel"])
    frac = seen / tot if tot else 0.0
    grange = float(np.percentile(Y, 99) - np.percentile(Y, 1))
    res["GLASS_VISIBLE"] = (tot > 0 and frac >= SEEN_FRACTION and grange >= GROUND_RANGE,
        f"{frac*100:.0f}% of glass area sits over something (need {SEEN_FRACTION*100:.0f}%); "
        f"ground varies by {grange:.0f} levels (need {GROUND_RANGE})"
        + (f"; emptiest: {worst[1]} sees {worst[0]:.0f}" if worst else ""))
    big = [x for x in g if x["w"] * x["h"] >= 8000]
    cut = [x for x in big if x["clip"].startswith("polygon")]
    sigs = [(x["clip"], round(x["w"] / 8), round(x["h"] / 8)) for x in cut]
    dupes = len(sigs) - len(set(sigs))
    res["SILHOUETTES"] = (bool(big) and len(cut) >= 0.8 * len(big) and dupes == 0,
        f"{len(cut)} of {len(big)} panes are cut-corner shapes (need 80%), {dupes} look-alike pairs")
    d = np.abs(lum(Image.open(io.BytesIO(ground_png2))) - Y)
    p99, mean = float(np.percentile(d, 99)), float(d.mean())
    res["GROUND_MOVES"] = (p99 >= 3.0 or mean >= 0.3,
        f"after 2.5s the ground changed by {mean:.2f} on average, {p99:.1f} at the 99th percentile")
    res["NO_PILLS"] = (not probe["pills"], "none" if not probe["pills"] else
        f"{len(probe['pills'])} pills, e.g. {probe['pills'][0]['sel']}")
    rr = probe["radii"]
    res["RADIUS"] = (not rr, "all <= 3px" if not rr else f"{len(rr)} over 3px, e.g. {rr[0]['sel']} = {rr[0]['r']}px")
    yl = probe["yellow"]
    res["NO_YELLOW"] = (not yl, "none" if not yl else f"{len(yl)} elements, e.g. {yl[0]['sel']} uses {yl[0]['c']}")
    bad_font = probe["fontHead"] in DEFAULT_FONTS or probe["fontBody"] in DEFAULT_FONTS
    res["TYPE"] = (probe["webfont"] and not bad_font,
        f"heading '{probe['fontHead']}', body '{probe['fontBody']}', webfont declared: {probe['webfont']}")
    res["FALLBACKS"] = (probe["supportsNot"] and probe["reducedMotion"],
        f"@supports-not-backdrop {probe['supportsNot']}, prefers-reduced-motion {probe['reducedMotion']}")
    res["NO_OVERFLOW"] = (probe["overflow"] <= 1 and not probe["errors"],
        f"horizontal overflow {probe['overflow']}px, page errors {len(probe['errors'])}")
    res["_warn"] = probe["smell"]
    return res


def main():
    results, state = {}, None
    with sync_playwright() as pw:
        br = pw.chromium.launch()
        for name, w, h in VIEWS:
            ctx = br.new_context(viewport={"width": w, "height": h}, bypass_csp=True, storage_state=state)
            page = ctx.new_page()
            errors = []
            page.on("pageerror", lambda e: errors.append(str(e)))
            page.goto(URL if state is None else URL.split("?")[0], wait_until="load")
            if state is None:
                fill, click = os.environ.get("GATE_FILL"), os.environ.get("GATE_CLICK")
                if fill:
                    sel, _, val = fill.partition("||")
                    page.fill(sel, val)
                if click:
                    page.click(click)
                if fill or click:
                    page.wait_for_load_state("load")
                state = ctx.storage_state()
            if WAIT:
                page.wait_for_selector(WAIT, timeout=15000)
            page.wait_for_timeout(1200)
            probe = page.evaluate(PROBE)
            probe["errors"] = errors
            (OUT / f"{name}-page.png").write_bytes(page.screenshot())
            page.add_style_tag(content="body *{visibility:hidden!important}"
                               "[data-gate-ground],[data-gate-ground] *{visibility:visible!important}")
            page.wait_for_timeout(150)
            ground_png = page.screenshot()
            page.wait_for_timeout(2500)
            ground_png2 = page.screenshot()
            (OUT / f"{name}-ground-only.png").write_bytes(ground_png)
            results[name] = analyse(probe, ground_png, ground_png2)
            ctx.close()
        br.close()
    failed = 0
    print(f"\nAPEX VISUAL GATE  {URL.split('?')[0]}\n")
    for name in results:
        print(f"-- {name}")
        for k, v in results[name].items():
            if k == "_warn":
                for s in v[:4]:
                    print(f"   WARN  TEMPLATE_SMELL      {s}")
                continue
            ok, why = v
            failed += 0 if ok else 1
            print(f"   {'PASS' if ok else 'FAIL'}  {k:<14}  {why}")
    print(f"\nRESULT: {'PASS' if not failed else f'FAIL ({failed} hard failures)'}")
    (OUT / "gate.json").write_text(json.dumps(
        {n: {k: (list(v) if k != '_warn' else v) for k, v in r.items()} for n, r in results.items()},
        indent=1, default=str))
    sys.exit(1 if failed else 0)


main()
```
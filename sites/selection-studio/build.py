#!/usr/bin/env python3
"""SELECTION STUDIO · build (PEPTICITY first, the APEX template for every client).

The studio itself needs no build: index.html + studio.css + studio.js read config.json and the module
manifests at runtime. This script only refreshes the brand pieces and the picture sets it reuses, so the
folder stays in step with the approved sources. Run it again whenever a brand file or a picture set changes.

  assets/PepticityBlack.woff2   brand/font/PepticityBlack.woff2                (the owner's font)
  assets/glyphs.json            the glyph table the dashboards use (regular cut + the approved LOGO_P)
  assets/type3d-engine.js       brand/font/type3d-engine.js, unchanged         (PEPTICITY STUDIO 3D type)
  assets/button.css             brand/ui/button.css, unchanged                 (BTN-P01, the approved button)
  assets/smoke-bg.js            brand/ui/smoke-bg.js, unchanged                (BG-P01 silver smoke ground)
  assets/p-mark.svg             brand/logo/p-mark.svg                          (the approved P, 2D fallback)
  assets/sig-page.webp          sites/grace-review/assets/sig-page.webp        (the thank-you signature)
  data/sets.json                the BUSINESS CARDS / LABELS / BOTTLES sets, read from grace-review/picks.html
                                (image paths stay relative to the picks folder; config.json "sets.base" says where)

Run: python3 sites/selection-studio/build.py
"""
import json, pathlib, re, shutil

ROOT = pathlib.Path(__file__).resolve().parents[2]
HERE = ROOT / "sites/selection-studio"
A = HERE / "assets"; A.mkdir(parents=True, exist_ok=True)
D = HERE / "data"; D.mkdir(parents=True, exist_ok=True)

COPY = {
    "brand/font/PepticityBlack.woff2": "PepticityBlack.woff2",
    "brand/font/type3d-engine.js": "type3d-engine.js",
    "brand/ui/button.css": "button.css",
    "brand/ui/smoke-bg.js": "smoke-bg.js",
    "brand/logo/p-mark.svg": "p-mark.svg",
    "sites/grace-review/assets/sig-page.webp": "sig-page.webp",
}
for src, dst in COPY.items():
    shutil.copy2(ROOT / src, A / dst)
    print(f"assets/{dst:22s} <- {src}")

# the approved P in matte gunmetal (the source file's fill is platinum, which CLAUDE.md rules out for the logo)
pd = re.search(r'<path[^>]* d="([^"]+)"', (ROOT / "brand/logo/p-mark.svg").read_text()).group(1)
(A / "p-mark-gunmetal.svg").write_text(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-0.708 -0.58 1.416 1.16"><title>PEPTICITY P MARK</title>'
    '<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#8e8d85"/><stop offset=".46" stop-color="#5d5c57"/>'
    '<stop offset=".54" stop-color="#2a2a28"/><stop offset="1" stop-color="#77766f"/></linearGradient></defs>'
    f'<path fill="url(#g)" stroke="rgba(220,214,255,.55)" stroke-width=".012" d="{pd}"/></svg>')
print("assets/p-mark-gunmetal.svg    <- brand/logo/p-mark.svg path, gunmetal fill (as on the review page)")

dash = (ROOT / "sites/dashboard/index.html").read_text()
glyphs = json.loads(re.search(r'<script type="application/json" id="glyph-data">(.*?)</script>', dash, re.S).group(1))
assert "LOGO_P" in glyphs["regular"], "LOGO_P glyph missing from the dashboard glyph table"
(A / "glyphs.json").write_text(json.dumps(glyphs, separators=(",", ":")))
print("assets/glyphs.json            <- sites/dashboard/index.html #glyph-data")

picks = (ROOT / "sites/grace-review/picks.html").read_text()
m = re.search(r'<script type="application/json" id="sets-data">(.*?)</script>', picks, re.S)
assert m, "sets-data block not found in grace-review/picks.html (run build_picks.py first)"
sets = json.loads(m.group(1).replace("<\\/", "</"))
out = []
for s in sets:
    out.append({k: s[k] for k in ("id", "title", "short", "unit", "fine", "ratio", "orient")} | {
        "items": [{k: it.get(k) for k in ("n", "name", "tag", "desc", "src", "thumb", "w", "h", "current", "wide")} for it in s["items"]]})
    print(f"data/sets.json  {s['id']:8s} {len(s['items']):2d} items")
(D / "sets.json").write_text(json.dumps(out, indent=1))
print("done")

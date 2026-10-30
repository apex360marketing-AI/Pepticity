#!/usr/bin/env python3
"""SELECTION STUDIO · live modules (manifest-a) · asset + shared-code build.

Everything here is REUSED, never drawn: Higgsfield films and stills already in the repo, the owner's font, the approved
P mark / emblem, and the brand 3D type engine. This script only copies, crops, re-encodes and extracts frames.

  _assets/fonts/        PepticityBlack.woff2 (brand/font) + Instrument Sans 400/500/600 (OFL, fetched once from jsDelivr @fontsource)
  _assets/vial/         vial.webp        brand/vial-hf/front-cutout.png cropped to the bottle (the approved Higgsfield bottle)
                        vial-clear.webp  brand/vial-hf/front-clear.png (same shot, print removed) with the cut-out's own alpha
                        vial-print.webp  front.png minus front-clear.png: only the printed lettering, on black (shown with screen blend)
                        vial-pepticity.webp  sites/main/v2/assets (the store bottle, unchanged)
  _assets/chest/        c-000..c-119.webp  sites/main/media/chest-black.mp4 (the Higgsfield chest film), 12 fps, 1280 wide
  _assets/weave/        w-000..w-112.webp  sites/main/media/frames-hd black-weave (the Higgsfield city film), every 2nd frame, 1280 wide
  _assets/stills/       city / doors / lab-* / chest-poster crops of sites/main/media (Higgsfield stills)
  _assets/earth/        sites/main/v2/assets earth-* (public-domain NASA textures, already neutral grey)
  _assets/logo/         brand/logo/emblem.svg, brand/logo/p-mark.svg
  _shared/type3d.mjs    brand/font/type3d-engine.js with two marked build patches (glyph table inlined; kick() only when slots exist)
                        + the dashboard glyph table (regular cut + approved LOGO_P) + condensed/split cuts + the emblem layout
  _shared/smoke.js      brand/ui/smoke-bg.js + a play()/pause() handle for the module runtime (marked)
  _shared/button.css    brand/ui/button.css (BTN-P01), unchanged

Run: python3 sites/selection-studio/modules/_build/build_assets.py [--skip-frames]
"""
import json, pathlib, re, shutil, subprocess, sys
import numpy as np
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[4]
MOD = ROOT / "sites/selection-studio/modules"
A = MOD / "_assets"; S = MOD / "_shared"
for d in ["fonts", "vial", "chest", "weave", "stills", "earth", "logo"]:
    (A / d).mkdir(parents=True, exist_ok=True)
S.mkdir(parents=True, exist_ok=True)
SKIP_FRAMES = "--skip-frames" in sys.argv


def log(dst, src):
    print(f"  {str(dst.relative_to(MOD)):34s} <- {src}")


# ---------------------------------------------------------------- fonts + logo
shutil.copy2(ROOT / "brand/font/PepticityBlack.woff2", A / "fonts/PepticityBlack.woff2")
shutil.copy2(ROOT / "brand/font/PepticityBlackCondensed.woff2", A / "fonts/PepticityBlackCondensed.woff2")
log(A / "fonts/PepticityBlack.woff2", "brand/font")
for f in ["emblem.svg", "p-mark.svg"]:
    shutil.copy2(ROOT / "brand/logo" / f, A / "logo" / f); log(A / "logo" / f, "brand/logo")
for f in ["earth-land.webp", "earth-lights.webp", "earth-bump.webp"]:
    shutil.copy2(ROOT / "sites/main/v2/assets" / f, A / "earth" / f); log(A / "earth" / f, "sites/main/v2/assets")
shutil.copy2(ROOT / "brand/ui/button.css", S / "button.css"); log(S / "button.css", "brand/ui/button.css")

# ---------------------------------------------------------------- vial (Higgsfield bottle, approved 30 Oct)
V = ROOT / "brand/vial-hf"
cut = np.asarray(Image.open(V / "front-cutout.png").convert("RGBA"))
front = np.asarray(Image.open(V / "front.png").convert("RGB")).astype(np.int16)
clear = np.asarray(Image.open(V / "front-clear.png").convert("RGB")).astype(np.int16)
a = cut[..., 3]
ys, xs = np.where(a > 8)
x0, x1, y0, y1 = int(max(0, xs.min() - 4)), int(xs.max() + 5), int(max(0, ys.min() - 4)), int(ys.max() + 5)
box = (x0, y0, x1, y1)
Image.fromarray(cut).crop(box).save(A / "vial/vial.webp", quality=90, method=6)
clr = np.dstack([clear.astype(np.uint8), a])
Image.fromarray(clr).crop(box).save(A / "vial/vial-clear.webp", quality=90, method=6)
diff = np.clip(front - clear, 0, 255).astype(np.uint8)
diff[a < 8] = 0
Image.fromarray(diff).crop(box).save(A / "vial/vial-print.webp", quality=92, method=6)
shutil.copy2(ROOT / "sites/main/v2/assets/vial-pepticity.webp", A / "vial/vial-pepticity.webp")
# label band (rows where the frosted label sits) in crop space, for the mercury mask
lum = clear.mean(2)
col = lum[:, (x0 + x1) // 2 - 40:(x0 + x1) // 2 + 40].mean(1)
geo = {"crop": box, "w": int(x1 - x0), "h": int(y1 - y0)}
(A / "vial/vial.json").write_text(json.dumps(geo))
log(A / "vial/vial.webp", f"brand/vial-hf/front-cutout.png crop {box}")
log(A / "vial/vial-clear.webp", "brand/vial-hf/front-clear.png + cut-out alpha")
log(A / "vial/vial-print.webp", "front.png - front-clear.png (print only)")

# ---------------------------------------------------------------- stills (Higgsfield)
M = ROOT / "sites/main/media"
def still(src, dst, crop=None, width=1600, q=74):
    im = Image.open(M / src).convert("RGB")
    W, H = im.size
    if crop:
        cx, cy, s = crop                       # centre (fractions) + zoom; result keeps the frame's aspect
        w, h = W / s, H / s
        l = min(max(cx * W - w / 2, 0), W - w); t = min(max(cy * H - h / 2, 0), H - h)
        im = im.crop((int(l), int(t), int(l + w), int(t + h)))
    if im.width > width:
        im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    im.save(A / "stills" / dst, quality=q, method=6); log(A / "stills" / dst, f"media/{src} {crop or ''}")
still("black-city.jpg", "city.webp")
still("black-doors.jpg", "doors-full.webp", width=1912)
# the doors without the film's serif sign (the sign sits in the top 15%)
im = Image.open(M / "black-doors.jpg").convert("RGB"); im = im.crop((0, 170, im.width, im.height)); im.save(A / "stills/doors.webp", quality=76, method=6)
log(A / "stills/doors.webp", "media/black-doors.jpg below the sign")
still("black-lab.jpg", "lab.webp")
still("black-lab.jpg", "lab-dropper.webp", (0.42, 0.68, 1.7))      # the dropper fills the vial (v2 lab station 3)
still("black-lab.jpg", "lab-columns.webp", (0.15, 0.55, 1.6))      # purification columns (station 2)
still("black-lab.jpg", "lab-cabinets.webp", (0.85, 0.52, 1.6))     # freeze-drying cabinets (station 4)
still("chest-black-poster.jpg", "chest.webp", width=1600)

# ---------------------------------------------------------------- frames
def webp_dir(d):
    for f in d.glob("*.webp"):
        f.unlink()
if not SKIP_FRAMES:
    # chest film -> 120 frames
    cd = A / "chest"; webp_dir(cd)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(M / "chest-black.mp4"), "-vf", "fps=12,scale=1280:-2:flags=lanczos",
                    "-c:v", "libwebp", "-quality", "58", "-compression_level", "5", str(cd / "c-%03d.webp")], check=True)
    fs = sorted(cd.glob("c-*.webp"))
    for i, f in enumerate(fs):
        f.rename(cd / f"c-{i:03d}.webp")
    print(f"  _assets/chest/ {len(fs)} frames <- media/chest-black.mp4")
    # city weave (HD atlas 2x2 of 1920x1080) -> every 2nd frame
    man = json.loads((M / "frames-hd/manifest.json").read_text())["black-weave"]["d"]
    n, tw, th, cols, rows = man["n"], man["tw"], man["th"], man["cols"], man["rows"]
    per = cols * rows
    wd = A / "weave"; webp_dir(wd)
    k = 0; cache = {}
    for fi in range(0, n, 2):
        a_i, j = fi // per, fi % per
        if a_i not in cache:
            cache.clear(); cache[a_i] = Image.open(M / f"frames-hd/black-weave-d-{a_i:03d}.webp").convert("RGB")
        sheet = cache[a_i]
        sx, sy = (j % cols) * tw, (j // cols) * th
        fr = sheet.crop((sx, sy, sx + tw, sy + th)).resize((1280, 720), Image.LANCZOS)
        fr.save(wd / f"w-{k:03d}.webp", quality=60, method=5); k += 1
    (wd / "weave.json").write_text(json.dumps({"n": k, "src": "media/frames-hd black-weave d", "step": 2, "srcN": n}))
    print(f"  _assets/weave/ {k} frames <- media/frames-hd/black-weave-d (every 2nd of {n})")

# ---------------------------------------------------------------- shared code
eng = (ROOT / "brand/font/type3d-engine.js").read_text()
dash = (ROOT / "sites/dashboard/index.html").read_text()
g_dash = json.loads(re.search(r'<script type="application/json" id="glyph-data">(.*?)</script>', dash, re.S).group(1))
assert "LOGO_P" in g_dash["regular"], "LOGO_P glyph missing from the dashboard glyph table"
g_brand = json.loads((ROOT / "brand/font/glyphs.json").read_text())
G = {"cap": g_brand.get("cap", 700), "kern": g_dash.get("kern", g_brand["kern"]), "regular": g_dash["regular"],
     "condensed": g_brand["condensed"], "split": g_brand["split"]}
dcol = (ROOT / "sites/dashboard-color/index.html").read_text()
emb = json.loads(re.search(r'<script type="application/json" id="emblem-data">(.*?)</script>', dcol, re.S).group(1))

PATCH1_OLD = "const GLYPHS = JSON.parse(document.getElementById('glyph-data').textContent);"
PATCH2_OLD = "function kick() { if (!raf) raf = requestAnimationFrame(frame); }"
assert PATCH1_OLD in eng and PATCH2_OLD in eng, "type3d-engine.js changed: re-check the two build patches"
eng = eng.replace(PATCH1_OLD, "/* BUILD PATCH 1 (selection-studio): the glyph table is inlined below instead of read from #glyph-data */\nconst GLYPHS = __GLYPHS__;")
eng = eng.replace(PATCH2_OLD, "/* BUILD PATCH 2 (selection-studio): modules render through their own loop; the stage only runs frames for real slots */\n  function kick() { if (!raf && slots.length) raf = requestAnimationFrame(frame); }")
eng = eng.replace("__GLYPHS__", json.dumps(G, separators=(",", ":")))
head = ("/* GENERATED by modules/_build/build_assets.py from brand/font/type3d-engine.js (the PEPTICITY STUDIO 3D type engine, r160).\n"
        "   Do not edit by hand: change the engine and rebuild. Glyph table = sites/dashboard (regular + approved LOGO_P) + brand condensed/split. */\n")
tail = "\nexport const EMBLEM = " + json.dumps(emb, separators=(",", ":")) + ";\nexport { GLYPHS };\n"
(S / "type3d.mjs").write_text(head + eng + tail)
log(S / "type3d.mjs", "brand/font/type3d-engine.js + glyph tables + emblem layout")

smoke = (ROOT / "brand/ui/smoke-bg.js").read_text()
OLD = "    start();\n    return api;"
assert OLD in smoke, "smoke-bg.js changed: re-check the play/pause handle"
smoke = smoke.replace(OLD, "    /* MODULE PATCH (selection-studio): the module runtime can hold or release the loop (play/pause from the shell) */\n"
                           "    let held = !!opt.held;\n    api.pause = () => { held = true; stop(); };\n    api.play = () => { held = false; start(); };\n"
                           "    const _start = start; start = function () { if (!held) _start(); };\n    start();\n    return api;")
smoke = smoke.replace("function start() {", "let start = function () {").replace(
    "raf = requestAnimationFrame(loop); }\n    function stop()", "raf = requestAnimationFrame(loop); };\n    function stop()")
(S / "smoke.js").write_text("/* COPY of brand/ui/smoke-bg.js (BG-P01) with a marked play()/pause() handle. Rebuilt by _build/build_assets.py. */\n" + smoke)
log(S / "smoke.js", "brand/ui/smoke-bg.js + play/pause")
print("done")

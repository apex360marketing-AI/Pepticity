#!/usr/bin/env python3
"""PEPTICITY · GRACE'S PICKS: builds sites/grace-review/picks.html from picks.src.html.

1. Copies the option images from sites/grace-picks/assets/{cards,labels,bottles}/ into
   sites/grace-review/assets/{cards,labels,bottles}/ (the folder stays self-contained) and makes a
   lighter grid copy of each image in .../thumbs/ (same picture, resized; the lightbox uses the full file).
2. Reads cards.json, labels.json and bottles.json and inlines them as one data block (@SETSJSON@).
3. Inlines the brand pieces exactly like sites/grace-feedback/build.py:
     /*@INLINE:path@*/ or //@INLINE:path@   file contents (repo-root relative), unchanged
     @FONT_B64@     brand/font/PepticityBlack.woff2 as a data: URI
     @ENGINE@       brand/font/type3d-engine.js (imports and 'export' stripped)
     @GLYPHSJSON@   the dashboard glyph table (regular cut + the approved LOGO_P)
     @PMARK@        path of brand/logo/p-mark.svg (2D fallback of the P mark only)
Only three.js r160 loads from jsDelivr (pinned), plus Instrument Sans from Google Fonts, as on the dashboards.
Run: python3 sites/grace-review/build_picks.py"""
import base64, json, pathlib, re, shutil, sys
from PIL import Image

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-review"
SRC_ASSETS = ROOT / "sites/grace-picks/assets"
OUT_ASSETS = SITE / "assets"
THUMB_W = 760

SETS = [
    dict(id="cards", json="cards/cards.json", title="BUSINESS CARDS", short="CARDS", unit="CARD"),
    dict(id="labels", json="labels/labels.json", title="LABELS", short="LABELS", unit="LABEL"),
    dict(id="bottles", json="bottles/bottles.json", title="BOTTLES", short="BOTTLES", unit="BOTTLE"),
]


def b64(p):
    p = ROOT / p
    mime = {".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png"}[p.suffix]
    return f"data:{mime};base64," + base64.b64encode(p.read_bytes()).decode()


def first(d, *keys, default=None):
    for k in keys:
        if isinstance(d, dict) and d.get(k) not in (None, ""):
            return d[k]
    return default


def items_of(raw):
    if isinstance(raw, list):
        return raw
    for k in ("items", "options", "cards", "labels", "bottles", "data"):
        if isinstance(raw.get(k), list):
            return raw[k]
    raise SystemExit("cannot find the item list in JSON")


def title_case(s):
    s = str(s).strip()
    if s.isupper():
        small = {"AND", "OR", "OF", "THE", "A", "ON", "IN", "WITH"}
        return " ".join(w if any(c.isdigit() for c in w) else (w.lower() if (w in small and i) else w.capitalize())
                        for i, w in enumerate(s.split()))
    return s


def build_set(cfg):
    jp = SRC_ASSETS / cfg["json"]
    if not jp.exists():
        return None
    folder = jp.parent
    raw = json.loads(jp.read_text())
    out_dir = OUT_ASSETS / cfg["id"]
    (out_dir / "thumbs").mkdir(parents=True, exist_ok=True)
    shutil.copy2(jp, out_dir / jp.name)
    items = []
    for i, it in enumerate(items_of(raw)):
        if isinstance(it, str):
            it = {"file": it}
        f = first(it, "file", "image", "src", "webp", "path", "filename")
        if not f:
            print(f"  ! {cfg['id']} item {i}: no image file, skipped", file=sys.stderr); continue
        src = (folder / f) if not pathlib.Path(f).is_absolute() else pathlib.Path(f)
        if not src.exists():
            src = folder / pathlib.Path(f).name
        if not src.exists():
            print(f"  ! {cfg['id']} item {i}: missing {f}, skipped", file=sys.stderr); continue
        dst = out_dir / src.name
        if src.resolve() != dst.resolve():
            shutil.copy2(src, dst)
        im = Image.open(dst); w, h = im.size
        thumb = out_dir / "thumbs" / (dst.stem + ".webp")
        if w > THUMB_W * 1.15:
            if not thumb.exists() or thumb.stat().st_mtime < dst.stat().st_mtime:
                t = im.convert("RGBA" if im.mode in ("RGBA", "LA", "P") else "RGB")
                t = t.resize((THUMB_W, round(h * THUMB_W / w)), Image.LANCZOS)
                t.save(thumb, "WEBP", quality=82, method=6)
            thumb_rel = f"assets/{cfg['id']}/thumbs/{thumb.name}"
        else:
            thumb_rel = f"assets/{cfg['id']}/{dst.name}"
        n = first(it, "n", "num", "number", "id", "index", default=i + 1)
        m = re.search(r"\d+", str(n))
        n = f"{int(m.group()):02d}" if m else f"{i + 1:02d}"
        name = first(it, "name", "title", "label", default=f"{cfg['unit'].title()} {n}")
        tag = first(it, "type", "kind", "finish", "material", "style", "group", default="")
        status = str(first(it, "status", "state", default="")).lower()
        current = bool(first(it, "current", "approved", "current_pick", "currentPick", "is_current", "pick", default=False)) \
            or status in ("approved", "current", "current pick", "current_pick")
        items.append(dict(
            n=n, name=title_case(name), desc=str(first(it, "desc", "description", "blurb", "note", "summary", "caption", default="")).strip(),
            tag=str(tag).replace("_", " ").replace("-", " ").upper().strip() if tag else "",
            src=f"assets/{cfg['id']}/{dst.name}", thumb=thumb_rel, w=w, h=h, current=current))
    if not items:
        return None
    r = sorted(i["w"] / i["h"] for i in items)[len(items) // 2]
    orient = "land" if r > 1.15 else ("port" if r < 0.87 else "sq")
    return dict(id=cfg["id"], title=cfg["title"], short=cfg["short"], unit=cfg["unit"],
                ratio=round(r, 4), orient=orient, items=items)


sets = []
for cfg in SETS:
    s = build_set(cfg)
    if s:
        sets.append(s)
        print(f"{s['id']:8s} {len(s['items']):2d} items · {s['orient']} {s['ratio']} · current: {[i['n'] for i in s['items'] if i['current']]}")
    else:
        print(f"{cfg['id']:8s} not ready (no {cfg['json']})", file=sys.stderr)
if "--allow-missing" not in sys.argv and len(sets) < len(SETS):
    raise SystemExit("not all sets are ready; run again when every JSON file exists (or pass --allow-missing)")

src = (SITE / "picks.src.html").read_text()


def _inl(m):
    return (ROOT / (m.group(1) or m.group(2))).read_text().rstrip()


src = re.sub(r"(?:/\*@INLINE:([^@]+)@\*/|//@INLINE:([^@]+)@)", _inl, src)
eng = "\n".join(l for l in (ROOT / "brand/font/type3d-engine.js").read_text().splitlines() if not l.startswith("import "))
eng = re.sub(r"^export ", "", eng, flags=re.M)
dash = (ROOT / "sites/dashboard/index.html").read_text()
glyphs = json.loads(re.search(r'<script type="application/json" id="glyph-data">(.*?)</script>', dash, re.S).group(1))
assert "LOGO_P" in glyphs["regular"], "LOGO_P glyph missing from the dashboard glyph table"
pmark = re.search(r'<path[^>]* d="([^"]+)"', (ROOT / "brand/logo/p-mark.svg").read_text()).group(1)
src = (src.replace("@FONT_B64@", b64("brand/font/PepticityBlack.woff2"))
          .replace("@ENGINE@", eng)
          .replace("@GLYPHSJSON@", json.dumps(glyphs, separators=(",", ":")))
          .replace("@PMARK@", pmark)
          .replace("@SETSJSON@", json.dumps(sets, separators=(",", ":")).replace("</", "<\\/")))
left = re.findall(r"@[A-Z_]+@", src)
assert not left, f"unreplaced markers: {left}"
(SITE / "picks.html").write_text(src)
print("picks.html", f"{len(src.encode()):,d} bytes")

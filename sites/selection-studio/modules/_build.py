#!/usr/bin/env python3
"""SELECTION STUDIO · module builder (library B: buttons, glass cards, type).

Every module is written once in modules/_src/<cat>/<CODE>.html and built into a standalone file
modules/<cat>/<CODE>.html (works alone or in an iframe; only images stay outside, in modules/_assets/).
The builder inlines the shared runtime, the brand fonts and, where asked, the approved brand pieces:

  <!--@meta {...}-->   manifest entry (code, cat, name, desc, interact, source, weight)
  <!--@head-->         Google Fonts link, the three PEPTICITY BLACK cuts (inline), runtime.css
  <!--@stage-->        the smoke stage (BG-P01) + grain
  <!--@tail-->         runtime.js (accent, play/pause, hint, smoke)
  <!--@btnp01-->       brand/ui/button.css (BTN-P01, the approved button), unchanged
  <!--@glyphs-->       brand/font/glyphs.json as <script id="glyph-data"> (commit 6de50ec)
  <!--@pmark-->        brand/logo/p-mark.svg path as <symbol id="pmark">
  <!--@importmap-->    three@0.160.0 from jsDelivr (same build as the brand font page)
  /*@t3d*/             brand/font/type3d-engine.js, unchanged except `export` dropped (inside a module script)
  <!--@fonts:Geist-->  extra Google font families (comma list)

Writes modules/manifest-b.json. Run: python3 sites/selection-studio/modules/_build.py
"""
import base64, json, pathlib, re, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SRC = HERE / "_src"
OUT_CATS = ["buttons", "cards", "type"]


def b64(p):
    return base64.b64encode((ROOT / p).read_bytes()).decode()


FONTS = (
    '<style>'
    '@font-face{font-family:"PEPTICITY BLACK";src:url(data:font/woff2;base64,%s) format("woff2");font-display:block}'
    '@font-face{font-family:"PEPTICITY BLACK CONDENSED";src:url(data:font/woff2;base64,%s) format("woff2");font-display:block}'
    '@font-face{font-family:"PEPTICITY BLACK SPLIT";src:url(data:font/woff2;base64,%s) format("woff2");font-display:block}'
    '</style>'
) % (b64("brand/font/PepticityBlack.woff2"), b64("brand/font/PepticityBlackCondensed.woff2"), b64("brand/font/PepticityBlackSplit.woff2"))

GF_BASE = "family=Instrument+Sans:wght@400;500;600;700"
GF_EXTRA = {"Geist": "family=Geist:wght@300;400;500;600", "Geist Mono": "family=Geist+Mono:wght@400;500"}

RUNTIME_CSS = (SRC / "runtime.css").read_text()
RUNTIME_JS = (SRC / "runtime.js").read_text()
BTN_CSS = (ROOT / "brand/ui/button.css").read_text()
GLYPHS = (ROOT / "brand/font/glyphs.json").read_text()
T3D = (ROOT / "brand/font/type3d-engine.js").read_text()
T3D = re.sub(r"^export\s+", "", T3D, flags=re.M)
PMARK_D = re.search(r'<path[^>]* d="([^"]+)"', (ROOT / "brand/logo/p-mark.svg").read_text()).group(1)
PMARK = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'
         '<symbol id="pmark" viewBox="-0.708 -0.58 1.416 1.16"><path d="%s"/></symbol></svg>') % PMARK_D
IMPORTMAP = ('<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",'
             '"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>')
STAGE = ('<div class="pm-bg" aria-hidden="true"><canvas data-smoke></canvas></div>'
         '<div class="pm-grain" aria-hidden="true"></div>')


def build(path):
    s = path.read_text()
    m = re.search(r"<!--@meta\s+(\{.*?\})\s*-->", s, re.S)
    if not m:
        raise SystemExit(f"{path}: missing <!--@meta {{...}}-->")
    meta = json.loads(m.group(1))
    s = s.replace(m.group(0), "")
    extra = re.search(r"<!--@fonts:([^>]*)-->", s)
    fams = [GF_BASE]
    if extra:
        fams += [GF_EXTRA[f.strip()] for f in extra.group(1).split(",") if f.strip()]
        s = s.replace(extra.group(0), "")
    gf = ('<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
          '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?%s&display=swap">') % "&".join(fams)
    head = gf + FONTS + "<style>\n" + RUNTIME_CSS + "</style>"
    s = s.replace("<!--@head-->", head)
    s = s.replace("<!--@stage-->", STAGE)
    s = s.replace("<!--@tail-->", "<script>\n" + RUNTIME_JS + "</script>")
    s = s.replace("<!--@btnp01-->", "<style>\n" + BTN_CSS + "</style>")
    s = s.replace("<!--@glyphs-->", '<script type="application/json" id="glyph-data">' + GLYPHS.strip() + "</script>")
    s = s.replace("<!--@pmark-->", PMARK)
    s = s.replace("<!--@importmap-->", IMPORTMAP)
    s = s.replace("/*@t3d*/", T3D)
    left = re.findall(r"<!--@\w+-->|/\*@\w+\*/", s)
    if left:
        raise SystemExit(f"{path}: unresolved markers {left}")
    cat = path.parent.name
    out = HERE / cat / path.name
    out.write_text(s)
    entry = {"code": meta["code"], "cat": cat, "name": meta["name"], "desc": meta["desc"],
             "file": f"{cat}/{path.name}", "interact": meta["interact"], "source": meta["source"],
             "weight": meta.get("weight", "Light"), "motionSafe": True, "_o": meta.get("order", 99)}
    if meta.get("note"):
        entry["note"] = meta["note"]
    return entry, len(s)


def main():
    only = set(sys.argv[1:])
    entries = []
    for cat in OUT_CATS:
        for p in sorted((SRC / cat).glob("*.html"), key=lambda q: q.stem):
            if only and p.stem not in only:
                e = json.loads(re.search(r"<!--@meta\s+(\{.*?\})\s*-->", p.read_text(), re.S).group(1))
                entries.append({"code": e["code"], "cat": cat, "name": e["name"], "desc": e["desc"], "file": f"{cat}/{p.name}",
                                "interact": e["interact"], "source": e["source"], "weight": e.get("weight", "Light"), "motionSafe": True, "_o": e.get("order", 99)})
                continue
            e, n = build(p)
            entries.append(e)
            print(f"{e['file']:34s} {n // 1024:4d} KB  {e['name']}")
    order = {"buttons": 0, "cards": 1, "type": 2}
    entries.sort(key=lambda e: (order[e["cat"]], e.get("_o", 99)))
    for e in entries:
        e.pop("_o", None)
    man = {"_about": "SELECTION STUDIO · module library B (buttons, glass cards, type). Built by modules/_build.py from modules/_src/. "
                     "Every file is a standalone live module: ?acc=<slug> or postMessage({acc}) re-tints it, postMessage({cmd:'play'|'pause'}) runs it.",
           "accents": ["chartreuse", "blue", "cyan", "red", "violet", "orchid", "copper", "salmon", "platinum"],
           "modules": entries}
    (HERE / "manifest-b.json").write_text(json.dumps(man, indent=1, ensure_ascii=False) + "\n")
    counts = {c: sum(1 for e in entries if e["cat"] == c) for c in OUT_CATS}
    print("manifest-b.json", counts)


if __name__ == "__main__":
    main()

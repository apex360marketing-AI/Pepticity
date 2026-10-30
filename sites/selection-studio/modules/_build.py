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
# one patch, so the shell can pause it (materials, light, geometry and edge settings stay exactly as approved):
_T3D_LOOP = "if (!REDUCED && !document.hidden && slots.some(s => s.visible)) raf = requestAnimationFrame(frame);"
assert _T3D_LOOP in T3D, "type3d-engine.js render loop moved"
T3D = T3D.replace(_T3D_LOOP, "if (!REDUCED && !document.hidden && slots.some(s => s.visible) && (!window.PM || PM.playing || window.__t3dBusy)) raf = requestAnimationFrame(frame);")
PMARK_D = re.search(r'<path[^>]* d="([^"]+)"', (ROOT / "brand/logo/p-mark.svg").read_text()).group(1)
PMARK = ('<svg width="0" height="0" style="position:absolute" aria-hidden="true" focusable="false">'
         '<symbol id="pmark" viewBox="-0.708 -0.58 1.416 1.16"><path d="%s"/></symbol></svg>') % PMARK_D
IMPORTMAP = ('<script type="importmap">{"imports":{"three":"https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",'
             '"three/addons/":"https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"}}</script>')
STAGE = ('<div class="pm-bg" aria-hidden="true"><canvas data-smoke></canvas></div>'
         '<div class="pm-grain" aria-hidden="true"></div>')


CARD3D = (ROOT / "sites/main/v2/card3d.js").read_text()
_C3D_PATCH = [
    ("const glyphs = await fetch('brand/font/glyphs.json').then(r => r.json());",
     "const glyphs = JSON.parse(document.getElementById('glyph-data').textContent);"),
    ("const isBlack = () => D.getAttribute('data-version') === 'black';", "const isBlack = () => true;   /* the studio shows the BLACK look */"),
    ("function visible() { return gate && gate.style.visibility !== 'hidden' && getComputedStyle(gate).visibility !== 'hidden' && btn.offsetWidth > 0; }",
     "function visible() { return btn.offsetWidth > 0; }"),
    ("if (!REDUCED || busy) raf = requestAnimationFrame(frame);",
     "if ((!REDUCED && window.PM && PM.playing) || busy || st.pointerIn) raf = requestAnimationFrame(frame);"),
    ("  setLook(); document.addEventListener('pc-version', setLook);",
     "  setLook(); document.addEventListener('pc-version', setLook);\n  /*@card3d-acc*/"),
    ("  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);",
     "  addEventListener('pointerup', endDrag); addEventListener('pointercancel', endDrag);\n  /*@card3d-tap*/"),
]
for a, b in _C3D_PATCH:
    assert a in CARD3D, "card3d.js patch point moved: " + a[:60]
    CARD3D = CARD3D.replace(a, b)
CARD3D = CARD3D.replace("/*@card3d-acc*/", """/* SELECTION STUDIO: the chip glow, its rim and the edge light take the client's accent (mixed toward white so the glass stays glass) */
  const accTint = () => { const c = new THREE.Color(PM.acc.hex), w = new THREE.Color(0xffffff);
    halo.material.color.copy(c.clone().lerp(w, .3)); chipRim.material.color.copy(c.clone().lerp(w, .25)); edgeMat.emissive.copy(c.clone().lerp(w, .6)); uvSide.emissive.copy(c.clone().lerp(w, .35)); kick(); };
  accTint(); PM.on('acc', accTint); PM.on('play', () => kick());""")
CARD3D = CARD3D.replace("/*@card3d-tap*/", """/* SELECTION STUDIO: tap or Enter flips it; arrow keys turn it */
  btn.addEventListener('click', () => { if (btn.dataset.dragged) return; api.flip(); });
  btn.addEventListener('keydown', e => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); st.flipT += d * Math.PI; st.flare = 1; kick(); } });""")


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
    early = ('<script>/* accent before first paint (no fade from the default) */(function(){try{var a=(new URLSearchParams(location.search).get("acc")||"").toLowerCase();'
             'if(["chartreuse","blue","cyan","red","violet","orchid","copper","salmon","platinum"].indexOf(a)>-1)document.documentElement.setAttribute("data-acc",a)}catch(e){}})();</script>')
    head = '<link rel="icon" href="data:,">' + early + gf + FONTS + "<style>\n" + RUNTIME_CSS + "</style>"
    s = s.replace("<!--@head-->", head)
    s = s.replace("<!--@stage-->", STAGE)
    s = s.replace("<!--@tail-->", "<script>\n" + RUNTIME_JS + "</script>")
    s = s.replace("<!--@btnp01-->", "<style>\n" + BTN_CSS + "</style>")
    s = s.replace("<!--@glyphs-->", '<script type="application/json" id="glyph-data">' + GLYPHS.strip() + "</script>")
    s = s.replace("<!--@pmark-->", PMARK)
    s = s.replace("<!--@importmap-->", IMPORTMAP)
    s = s.replace("/*@t3d*/", T3D)
    s = s.replace("/*@card3d*/", CARD3D)
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

#!/usr/bin/env python3
"""PEPTICITY ARSENAL: builds sites/grace-arsenal/index.html (self-contained; only three.js loads from jsDelivr).
Markers in index.src.html:
  /*@INLINE:path@*/ or //@INLINE:path@   file contents (repo-root relative)
  @FONTFACE@                              @font-face rules, fonts embedded as base64
  @B64:path@                              data: URI of a file
  @SVG:path@                              raw SVG markup (title stripped)
  @GLYPHS@                                JSON list of the characters in PepticityBlack.woff2
  @FRAMES@                                JSON list of data: URIs for the city weave frames
Run: python3 sites/grace-arsenal/build.py"""
import base64, json, pathlib, re
from fontTools.ttLib import TTFont

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-arsenal"
MIME = {".woff2": "font/woff2", ".webp": "image/webp", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg"}


def b64(p):
    p = ROOT / p
    return f"data:{MIME[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()


def fontface():
    faces = [("PB", "brand/font/PepticityBlack.woff2"), ("PBC", "brand/font/PepticityBlackCondensed.woff2"),
             ("PBS", "brand/font/PepticityBlackSplit.woff2")]
    out = [f'@font-face{{font-family:"{n}";src:url({b64(p)}) format("woff2");font-weight:400;font-style:normal;font-display:block}}' for n, p in faces]
    out.append(f'@font-face{{font-family:"HG";src:url({b64("brand/fonts/b8f117656b5c.woff2")}) format("woff2");font-weight:300 700;font-style:normal;font-display:swap}}')
    return "\n".join(out)


def glyphs():
    cm = TTFont(ROOT / "brand/font/PepticityBlack.woff2").getBestCmap()
    chars = [chr(c) for c in sorted(cm) if chr(c) != " " and not chr(c).islower()]
    return json.dumps(chars)


def frames():
    return json.dumps([b64(f"sites/grace-arsenal/assets/{p.name}") for p in sorted((SITE / "assets").glob("weave-*.webp"))])


src = (SITE / "index.src.html").read_text()
src = re.sub(r"(?:/\*@INLINE:([^@]+)@\*/|//@INLINE:([^@]+)@)", lambda m: (ROOT / (m.group(1) or m.group(2))).read_text().rstrip(), src)
eng = "\n".join(l for l in (ROOT / "brand/font/type3d-engine.js").read_text().splitlines() if not l.startswith("import "))
eng = re.sub(r"^export ", "", eng, flags=re.M)
src = src.replace("@ENGINE@", eng).replace("@GLYPHSJSON@", json.dumps(json.loads((ROOT / "brand/font/glyphs.json").read_text()), separators=(",", ":")))
src = src.replace("@FONTFACE@", fontface()).replace("@GLYPHS@", glyphs()).replace("@FRAMES@", frames())
src = re.sub(r"@B64:([^@]+)@", lambda m: b64(m.group(1)), src)
src = src.replace("@PMARK@", re.search(r'<path[^>]* d="([^"]+)"', (ROOT / "brand/logo/p-mark.svg").read_text()).group(1))
src = re.sub(r"@SVGJSON:([^@]+)@", lambda m: json.dumps((ROOT / m.group(1)).read_text()), src)
src = re.sub(r"@SVG:([^@]+)@", lambda m: re.sub(r"<title>.*?</title>", "", (ROOT / m.group(1)).read_text()).strip(), src)
CHAT = """<div class="chatline" id="chatline">
            <div class="bub gl me"><em>VISITOR · SAMPLE</em>Is GHK-Cu back in stock?</div>
            <div class="bub gl"><em>CONCIERGE · SAMPLE</em>Not yet. Leave your email and I will tell you the moment it is back. Want me to show you what is on the shelf today?</div>
            <div class="bub gl me"><em>VISITOR · SAMPLE</em>Yes please.</div>
          </div>"""
BOT_JS, BOT_CSS = ROOT / "shared/bot/pep-bot.js", ROOT / "shared/bot/pep-bot.css"
if BOT_JS.exists() and BOT_CSS.exists():
    state = "LIVE BELOW"
    block = CHAT + '\n<div class="slotb" id="pepBotMount"></div><style>' + BOT_CSS.read_text() + '</style><script>' + BOT_JS.read_text() + '</script>'
else:
    state = "DEMO ARRIVING"
    block = CHAT + """
          <div class="slotb"><div><b>[CONCIERGE DEMO SLOT]</b><p>The working concierge is being finished. It drops into this space when it is ready, and you will be able to talk to it right here.</p></div></div>"""
src = src.replace("@CONCIERGE_STATE@", state).replace("@CONCIERGE@", block)
print("concierge:", state)
(SITE / "index.html").write_text(src)
print("built", SITE / "index.html", len(src), "bytes")

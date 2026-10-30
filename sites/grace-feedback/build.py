#!/usr/bin/env python3
"""PEPTICITY · Grace's feedback questionnaire: builds sites/grace-feedback/index.html (self-contained;
only three.js r160 loads from jsDelivr, plus the Instrument Sans stylesheet from Google Fonts, as on the dashboards).
Markers in index.src.html:
  /*@INLINE:path@*/ or //@INLINE:path@   file contents (repo-root relative), unchanged
  @FONT_B64@     brand/font/PepticityBlack.woff2 as a data: URI
  @ENGINE@       brand/font/type3d-engine.js (imports and 'export' stripped, wrapped by the page)
  @GLYPHSJSON@   the glyph table the dashboards use (regular cut + the approved LOGO_P), read from sites/dashboard/index.html
  @PMARK@        path of brand/logo/p-mark.svg (2D fallback of the P mark only)
  @SIG@ / @SIGMASK@  assets/sig-page.webp and assets/sig-mask.png (made by make_signature.py from the owner's signature)
Run: python3 sites/grace-feedback/make_signature.py && python3 sites/grace-feedback/build.py"""
import base64, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-feedback"
MIME = {".woff2": "font/woff2", ".webp": "image/webp", ".png": "image/png"}


def b64(p):
    p = ROOT / p
    return f"data:{MIME[p.suffix]};base64," + base64.b64encode(p.read_bytes()).decode()


src = (SITE / "index.src.html").read_text()


def _inl(m):
    path = m.group(1) or m.group(2)
    return (ROOT / path).read_text().rstrip()


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
          .replace("@SIGMASK@", b64("sites/grace-feedback/assets/sig-mask.png"))
          .replace("@SIG@", b64("sites/grace-feedback/assets/sig-page.webp")))
left = re.findall(r"@[A-Z_]+@", src)
assert not left, f"unreplaced markers: {left}"
(SITE / "index.html").write_text(src)
print("index.html", f"{len(src.encode()):,d} bytes")

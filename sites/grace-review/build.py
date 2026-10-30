#!/usr/bin/env python3
"""PEPTICITY · Grace's review (look on the left, answer on the right): builds sites/grace-review/index.html (self-contained;
only three.js r160 loads from jsDelivr, plus the Instrument Sans stylesheet from Google Fonts, as on the dashboards).
Markers in index.src.html:
  /*@INLINE:path@*/ or //@INLINE:path@   file contents (repo-root relative), unchanged
  @FONT_B64@     brand/font/PepticityBlack.woff2 as a data: URI
  @ENGINE@       brand/font/type3d-engine.js (imports and 'export' stripped, wrapped by the page)
  @GLYPHSJSON@   the glyph table the dashboards use (regular cut + the approved LOGO_P), read from sites/dashboard/index.html
  @PMARK@        path of brand/logo/p-mark.svg (2D fallback of the P mark only)
  @SIG@          assets/sig-page.webp (made by make_signature.py from the owner's signature)
Also writes email/preview.html: a browser copy of email/thank-you.html with the hosted image/font URLs made relative
(so it shows before the files are published) and a small inbox-style preview bar on top.
Run: python3 sites/grace-review/make_signature.py && python3 sites/grace-review/build.py"""
import base64, json, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parents[2]
SITE = ROOT / "sites/grace-review"
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
          .replace("@SIG@", b64("sites/grace-review/assets/sig-page.webp")))
left = re.findall(r"@[A-Z_]+@", src)
assert not left, f"unreplaced markers: {left}"
(SITE / "index.html").write_text(src)
print("index.html", f"{len(src.encode()):,d} bytes")

# ---- email preview: same letter, local assets, preview bar ----
HOST = "https://apex360marketing-ai.github.io/Pepticity/grace/email/"
mail = (SITE / "email/thank-you.html").read_text()
assert HOST + "signature.gif" in mail and HOST + "signature.png" in mail
bar = ('<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#050506;"><tr><td align="center" style="padding:18px 12px 0;">'
       '<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:Helvetica,Arial,sans-serif;">'
       '<tr><td style="padding:0 2px 10px;font-size:10px;letter-spacing:3px;color:#6b7077;text-transform:uppercase;">BROWSER PREVIEW &middot; NOT SENT</td></tr>'
       '<tr><td style="padding:12px 16px;border:1px solid #1f2124;background:#0b0b0c;font-size:13px;line-height:20px;color:#9ba1aa;">'
       '<b style="color:#e6e8ec;font-weight:600;">Maverick &middot; APEX 360</b><br>To: Gracet@live.ca<br>Subject: <span style="color:#e6e8ec;">Thank you, Grace. Your notes are in.</span></td></tr></table></td></tr></table>')
prev = mail.replace(HOST, "").replace("<title>", "<title>PREVIEW · ", 1)
i = prev.index(">", prev.index("<body")) + 1
prev = prev[:i] + "\n" + bar + prev[i:]
(SITE / "email/preview.html").write_text(prev)
print("email/preview.html", f"{len(prev.encode()):,d} bytes")

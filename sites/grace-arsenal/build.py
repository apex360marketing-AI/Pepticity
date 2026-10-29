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
src = src.replace("@FONTFACE@", fontface()).replace("@GLYPHS@", glyphs()).replace("@FRAMES@", frames())
src = re.sub(r"@B64:([^@]+)@", lambda m: b64(m.group(1)), src)
src = re.sub(r"@SVGJSON:([^@]+)@", lambda m: json.dumps((ROOT / m.group(1)).read_text()), src)
src = re.sub(r"@SVG:([^@]+)@", lambda m: re.sub(r"<title>.*?</title>", "", (ROOT / m.group(1)).read_text()).strip(), src)
(SITE / "index.html").write_text(src)
print("built", SITE / "index.html", len(src), "bytes")

#!/usr/bin/env python3
"""Build self-contained review pages: replaces /*@INLINE:path@*/ and //@INLINE:path@ markers
in <site>/index.src.html with the file contents (paths relative to the repo root) and writes index.html.
Usage: python3 brand/tools/inline_ui.py sites/brand-background sites/brand-button"""
import pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parents[2]
PAT = re.compile(r"(?:/\*@INLINE:([^@]+)@\*/|//@INLINE:([^@]+)@)")

for site in sys.argv[1:]:
    d = ROOT / site
    src = (d / "index.src.html").read_text()
    out = PAT.sub(lambda m: (ROOT / (m.group(1) or m.group(2))).read_text().rstrip(), src)
    (d / "index.html").write_text(out)
    print("built", d / "index.html", len(out), "bytes")

#!/usr/bin/env python3
"""Builds docs/owner/startup-review/index.html from .claude/startup/STARTUP.md.
Run after every change to STARTUP.md:  python3 tools/build-startup-review.py"""
import json, re, pathlib
root = pathlib.Path(__file__).resolve().parent.parent
md = (root / ".claude/startup/STARTUP.md").read_text()
items = []
for block in re.split(r"^## ", md, flags=re.M)[1:]:
    head, _, body = block.partition("\n")
    m = re.match(r"(S\d+)\s*·\s*(.+)", head.strip())
    if not m: continue
    lines = [l[2:].strip() for l in body.splitlines() if l.startswith("- ")]
    items.append({"id": m.group(1), "title": m.group(2).strip(), "lines": lines})
tpl = (root / "tools/startup-review.template.html").read_text()
out = tpl.replace("/*ITEMS*/[]", json.dumps(items, ensure_ascii=True))
(root / "docs/owner/startup-review/index.html").write_text(out)
print(f"{len(items)} items -> docs/owner/startup-review/index.html")

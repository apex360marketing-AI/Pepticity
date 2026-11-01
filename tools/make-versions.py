#!/usr/bin/env python3
"""Scaffolds sites/versions/<n-slug>/ from sites/main/v4 (owner, 1 Nov: 8 quick versions, same shape,
new accent + 7 effect slots each). Run once; builders then wire each slot module into the page.
Usage: python3 tools/make-versions.py [--force]"""
import json, re, shutil, sys, pathlib
R = pathlib.Path(__file__).resolve().parent.parent
V4 = R / "sites/main/v4"; OUT = R / "sites/versions"
LIB = pathlib.Path("/home/user/apex_agents_bots/design/library")
CAT = {e["code"]: e for e in json.load(open(LIB.parent / "effects.json"))}
SLOTS = ["MENU", "BUTTON", "CARD", "SCROLL SECTION", "READING TEXT", "HOVER", "EXTRA"]
VERS = [
 (1,"blue","ORIGINAL PICKS","#0066FF",["NAV-102","BTN-101","CRD-118","SCR-102","TXT-04","HOV-103","BGD-102"],"BGD-102 Plexus inside the quiz panel"),
 (2,"chartreuse","CHROME","#D4FF3A",["NAV-101","BTN-109","CRD-108","SCR-16","TXT-104","HOV-102","GLS-103"],"GLS-103 Molten Numerals for the stats/steps"),
 (3,"cyan","LIQUID","#0FFFFF",["NAV-104","BTN-110","CRD-109","SCR-103","TXT-103","HOV-101","ILL-102"],"ILL-102 Caustic Glass light in one section"),
 (4,"red","BOLD","#FF004F",["NAV-103","BTN-124","CRD-117","SCR-105","TXT-102","HOV-105","TRN-101"],"TRN-101 Venetian Wipe between sections"),
 (5,"violet","PRISM","#6F00FF",["NAV-105","BTN-111","CRD-110","SCR-17","TXT-04","HOV-103","BTN-106"],"BTN-106 Hex Bloom on the main CTA; TXT-04 with a prism gradient"),
 (6,"orchid","GLASS","#8D029B",["NAV-04","BTN-118","CRD-107","SCR-18","TXT-101","HOV-101","GLS-101"],"GLS-101 Two-Piece Glass offer card"),
 (7,"copper","CRAFTED","#C46210",["NAV-17","BTN-125","CRD-130","SCR-101","TXT-103","HOV-102","OBJ-101"],"OBJ-101 Blacklight Relic medallion moment"),
 (8,"salmon","SOFT","#FA8072",["NAV-101","BTN-119","CRD-111","SCR-19","TXT-104","HOV-105","GLS-105"],"GLS-105 Living Condensation wipe-to-reveal offer; NAV-101 soft variant"),
]
KEEP_FX = ["FRM-102", "LAY-101", "LAY-102", "CRD-124"]  # shape pieces kept in all 8 (tour + layout)
PAT = re.compile(r"""(['"(`])(?:\./)?(brand|media|vendor|shared|assets|data)/""")
def rw(s): return PAT.sub(r"\1../_common/\2/", s)
force = "--force" in sys.argv
for n, slug, name, hexv, codes, note in VERS:
    d = OUT / f"{n}-{slug}"
    if d.exists():
        if not force: print("skip (exists)", d.name); continue
        shutil.rmtree(d)
    (d / "fx").mkdir(parents=True)
    for f in ["index.html","v4.css","v4-tour.css","v4.js","gl3d.js","hero-p.js","card3d.js"]:
        (d / f).write_text(rw((V4 / f).read_text()))
    for c in KEEP_FX:
        shutil.copytree(V4 / "fx" / c, d / "fx" / c)
    for c in dict.fromkeys(codes):
        src = LIB / c; dst = d / "fx" / c; dst.mkdir()
        for f in ["module.css","module.js","notes.md","demo.html"]:
            if (src / f).exists(): shutil.copy(src / f, dst / f)
    effects = [{"slot":SLOTS[i],"code":c,"name":CAT.get(c,{}).get("name",c),"where":"[set by builder]"} for i,c in enumerate(codes)]
    meta = {"n":f"{n:02d}","slug":slug,"name":name,"hex":hexv,"colour":slug,"note":note,"effects":effects}
    (d / "version.json").write_text(json.dumps(meta, indent=1))
    html = (d / "index.html").read_text()
    html = html.replace("<html ", f'<html data-colour="{slug}" ', 1)
    head = (f'<link rel="stylesheet" href="../_kit/accent.css">\n<link rel="stylesheet" href="../_kit/chip.css">\n'
            f'<script>window.PC_VERSION={json.dumps(meta)};</script>\n')
    html = html.replace("</head>", head + "</head>", 1)
    html = html.replace("</body>", '<script src="../_kit/chip.js"></script>\n</body>', 1)
    html = re.sub(r"<title>.*?</title>", f"<title>PEPTICITY · VERSION {n:02d} · {name}</title>", html, count=1, flags=re.S)
    (d / "index.html").write_text(html)
    print("made", d.name, codes)

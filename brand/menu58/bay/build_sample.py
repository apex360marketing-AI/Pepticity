"""Tyson, Nov 14 2026: the PEPTIDES drop-down becomes THE BAY (four matching vials, arrow to change, vial opens its screen).
usage: build_sample.py SRC.html OUT.html   Exact string edits on the built store page; stops if a string is not found once."""
import sys, os
src, out = sys.argv[1], sys.argv[2]
here = os.path.dirname(os.path.abspath(__file__))
rd = lambda n: open(os.path.join(here, n), encoding="utf-8").read()
s = open(src, encoding="utf-8").read()

def one(old, new, what):
    global s
    n = s.count(old)
    if n != 1: sys.exit(f"NOT APPLIED ({n} matches): {what}")
    s = s.replace(old, new)

# ---- styles: the list's rules go, the bay's rules come (inside the header's own style block)
one(""".pep-header-cols { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0; }
.pep-header-col { min-width: 0; padding: 0 26px; border-left: 1px solid rgba(185, 190, 197, .28); }
.pep-header-col:first-child { border-left: 0; padding-left: 6px; }
""", "", "old column rules")
a = s.find(".pep-header-col-list { list-style: none;"); b = s.find(".pep-header-drop-note { margin: 0 4px;")
assert 0 < a < b, "old list rules"
s = s[:a] + s[b:]
one("""  .pep-header-cols { grid-template-columns: repeat(2, minmax(0, 1fr)); row-gap: 20px; }
  .pep-header-col { padding: 0 12px; }
  .pep-header-col:nth-child(odd) { border-left: 0; padding-left: 4px; }
""", "", "old phone column rules")
one("  .pep-header-item { font-size: 15px; }\n", "", "old phone item rule")
one("  .pep-header-drop-in { padding: 20px 14px 10px; -webkit-backdrop-filter: none; backdrop-filter: none; }", "  .pep-header-drop-in { -webkit-backdrop-filter: none; backdrop-filter: none; }", "phone sheet padding")
a = s.find('<style data-pep-src="modules/05-header/header.css">'); b = s.find("</style>", a)
assert a > 0 and b > a
s = s[:b] + rd("bay.css") + s[b:]

# ---- markup
one("""<div class="pep-header-cols" data-cols data-groups=""", """<div class="pep-header-cols" data-cols data-next-word="Next in" data-open-word="see what it is" data-groups=""", "cols words")
a = s.find('<p class="pep-header-drop-note" data-drop-fail'); a = s.rfind("\n", 0, a) + 1
s = s[:a] + rd("bay_view.html") + s[a:]
one("""<template data-tpl="col"><div class="pep-header-col" data-col><p class="pep-header-col-h"></p><ul class="pep-header-col-list" role="list"></ul></div></template>""",
    """<template data-tpl="col"><div class="pep-header-col" data-col><p class="pep-header-col-h"></p><button class="pep-header-vial" type="button" data-vial aria-haspopup="dialog"><img class="pep-header-vial-img" data-vial-img alt="" decoding="async"></button><p class="pep-header-col-name" data-name></p><button class="pep-header-next" type="button" data-next><i aria-hidden="true"></i></button></div></template>""", "col template")
one("  <!-- one column of the drop-down -->", "  <!-- one bay of the drop-down: heading, vial (opens its screen), the one name, the arrow to the next -->", "template note")

# ---- behaviour
one("""        if (open) { place(); root.setAttribute('data-drop-open', ''); show(); } else { root.removeAttribute('data-drop-open'); }""",
    """        if (open) { place(); root.setAttribute('data-drop-open', ''); show(); if (onDropOpen) { onDropOpen(); } }
        else { root.removeAttribute('data-drop-open'); if (onDropClose) { onDropClose(); } }""", "drop hooks")
one("""      // ---- the drop-down under PEPTIDES
      function place() {""", """      // ---- the drop-down under PEPTIDES
      var onDropOpen = null, onDropClose = null;     // the bay listens for these
      function place() {""", "hook vars")
a = s.find("      // ---- the catalogue, names only, while names show"); b = s.find("</script>", a) + len("</script>")
assert a > 0 and b > a, "catalogue block"
s = s[:a] + rd("bay.js").rstrip("\n") + s[b:]
one("""     - PEPTIDES opens the drop-down: on hover with a mouse, on a click, or with Enter or Space. Esc, a click outside it, or
       the keyboard leaving it closes it. It is filled from assets/catalogue.json while names show: names only, products
       held back in config.js (hidden) left out, four columns (peptides in two halves, blends, everything else). A name asks
       THE LINEUP to stand on that product (lineup:go { sku }); if the lineup cannot, the page goes to the lineup.""",
    """     - PEPTIDES opens the drop-down: on hover with a mouse, on a click, or with Enter or Space. Esc, a click outside it, or
       the keyboard leaving it closes it. It is THE BAY (Tyson, Nov 14 2026): four matching vials, one per heading, filled
       from assets/catalogue.json while names show (products held back in config.js left out). The arrow under a vial
       stands the next product in its place; the vial opens its screen; SEE IT IN THE LINEUP asks THE LINEUP to stand on
       that product (lineup:go { sku }); if the lineup cannot, the page goes to the lineup.""", "header note")
open(out, "w", encoding="utf-8").write(s)
print("built", out, len(s), "bytes")

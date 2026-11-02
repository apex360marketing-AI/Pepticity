#!/usr/bin/env python3
"""Build the CONCIERGE control-panel preview.

Takes the published Grace dashboard (gh-pages graces-dashboard/index.html,
pinned commit below) and adds ONE new owner tab, "11 CONCIERGE", made only of
the dashboard's own card markup. Nothing else in the file is changed; the
build asserts that the original text survives byte for byte around the three
insertion points. Sample data only.

Usage: python3 sites/concierge-panel/build.py   (writes sites/concierge-panel/index.html)
"""
import pathlib
import subprocess
import sys

HERE = pathlib.Path(__file__).resolve().parent
BASE_REF = "c9abbe5:graces-dashboard/index.html"  # gh-pages commit the preview is built on

base = subprocess.run(["git", "show", BASE_REF], cwd=HERE, capture_output=True, text=True, check=True).stdout

TAB_ANCHOR = '<button class="tab" role="tab" data-tab="money"><span class="n">10</span>MONEY + TAXES</button>'
PANEL_ANCHOR = "    </section>\n  </main>\n\n  <!-- ===================== CLIENT"
BODY_END = "</body>" if "</body>" in base else None

for name, a in [("tab", TAB_ANCHOR), ("panel", PANEL_ANCHOR)]:
    if base.count(a) != 1:
        sys.exit(f"anchor {name} found {base.count(a)} times; expected 1")

TAB = TAB_ANCHOR + '\n      <button class="tab" role="tab" data-tab="concierge"><span class="n">11</span>CONCIERGE</button>'

PANEL = (HERE / "panel.html").read_text()
STYLE = (HERE / "panel.css").read_text()
SCRIPT = (HERE / "panel.js").read_text()

out = base.replace(TAB_ANCHOR, TAB, 1)
out = out.replace(PANEL_ANCHOR, "    </section>\n\n" + PANEL + "\n  </main>\n\n  <!-- ===================== CLIENT", 1)
extra = "\n<style id=\"concierge-panel-css\">\n" + STYLE + "\n</style>\n<script id=\"concierge-panel-js\">\n" + SCRIPT + "\n</script>\n"
out = out + extra if BODY_END is None else out.replace(BODY_END, extra + BODY_END, 1)
out = out.replace("<title>GRACE'S DASHBOARD · PEPTICITY</title>", "<title>CONCIERGE PANEL · PREVIEW</title>", 1)

# Proof that nothing else moved: removing our insertions gives back the base.
undo = (out.replace(TAB, TAB_ANCHOR, 1)
           .replace("    </section>\n\n" + PANEL + "\n  </main>", "    </section>\n  </main>", 1)
           .replace(extra, "", 1)
           .replace("<title>CONCIERGE PANEL · PREVIEW</title>", "<title>GRACE'S DASHBOARD · PEPTICITY</title>", 1))
assert undo == base, "insertions are not clean"

(HERE / "index.html").write_text(out)
print(f"wrote {HERE/'index.html'} ({len(out):,} bytes; base {len(base):,}); undo check OK")

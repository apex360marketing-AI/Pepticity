#!/usr/bin/env python3
"""Build the DESK GLASS previews (sample data only). Live pages are never touched.

  python3 tools/glass-skin/build.py <out_dir> <command_center_html> <concierge_html> <concierge_panel_dir>

Writes  <out>/dashboard-glass/  <out>/client-glass/  <out>/concierge-glass/ (+ panel/)  <out>/command-center/
Every page gets the same skin (skin.css + skin.js): liquid-glass panes and the 10-colour switcher.
"""
import pathlib, sys

HERE = pathlib.Path(__file__).resolve().parent
ROOT = HERE.parents[1]
OUT = pathlib.Path(sys.argv[1])
CC_HTML, CG_HTML, CG_PANEL = (pathlib.Path(a) for a in sys.argv[2:5])

CSS = (HERE / 'skin.css').read_text()
JS = (HERE / 'skin.js').read_text()
FONT = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Michroma&display=swap">'


def rep(s, a, b, n=1):
    if s.count(a) != n:
        sys.exit(f'expected {n}x {a[:70]!r}, found {s.count(a)}')
    return s.replace(a, b)


def skin(s):
    """Skin style after the page's last stylesheet (so it wins), script at the very end."""
    i = s.rindex('</style>') + len('</style>')
    s = s[:i] + '\n' + FONT + '\n<style id="desk-skin">\n' + CSS + '</style>' + s[i:]
    tail = '\n<script id="desk-skin-js">\n' + JS + '</script>\n'
    return s.replace('</body>', tail + '</body>', 1) if '</body>' in s else s + tail


def dash_fixes(s):
    s = rep(s, ' · every name, order and figure is SAMPLE DATA · logo is a placeholder</p>',
            ' · every name, order and figure is SAMPLE DATA</p>')
    s = rep(s, " ['Melanotan II','10 mg',69,21,63,0,8,0],\n ['Bacteriostatic water (Pfizer)','30 ml',19,7,402,64,40,0]\n]",
            " ['Melanotan II','10 mg',69,21,63,0,8,0]\n]")
    s = rep(s, ",['Bacteriostatic water (Pfizer)','30 ml',19]", '')
    s = rep(s, "'GHK-Cu · 50 mg','Bacteriostatic water · 30 ml']", "'GHK-Cu · 50 mg']")
    return s


def write(rel, s):
    p = OUT / rel
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(s)
    print(rel, len(s))


owner = dash_fixes((ROOT / 'sites/dashboard/index.html').read_text())
write('dashboard-glass/index.html', skin(owner))

client = dash_fixes((ROOT / 'sites/dashboard-client/index.html').read_text())
# customer link: client view only, owner switch and owner view never shown
client = rep(client, """setView(h==='client'?'client':'owner',true);
if(!location.hash){try{history.replaceState(null,'','#owner')}catch(e){}}
if(h!=='owner'){addEventListener('load',function(){setTimeout(function(){setView('client')},400)})}""",
             """var _setView=setView;setView=function(v,f){return _setView('client',f)};
setView('client',true);
try{history.replaceState(null,'','#client')}catch(e){}""")
client = rep(client, '</style>', '</style>\n<style id="client-only">#vswitch,#view-owner,#ubOwner{display:none!important}</style>')
write('client-glass/index.html', skin(client))

write('concierge-glass/index.html', skin(CG_HTML.read_text()))

# concierge control-panel tab, built on the glass owner dashboard with the same anchors as sites/concierge-panel/build.py
TAB = '<button class="tab" role="tab" data-tab="money"><span class="n">10</span>MONEY + TAXES</button>'
PAN = "    </section>\n  </main>\n\n  <!-- ===================== CLIENT"
p = rep(owner, TAB, TAB + '\n      <button class="tab" role="tab" data-tab="concierge"><span class="n">11</span>CONCIERGE</button>')
p = rep(p, PAN, "    </section>\n\n" + (CG_PANEL / 'panel.html').read_text() + "\n  </main>\n\n  <!-- ===================== CLIENT")
p += '\n<style id="concierge-panel-css">\n' + (CG_PANEL / 'panel.css').read_text() + '\n</style>\n<script id="concierge-panel-js">\n' + (CG_PANEL / 'panel.js').read_text() + '\n</script>\n'
p = rep(p, "<title>GRACE'S DASHBOARD · PEPTICITY</title>", "<title>CONCIERGE PANEL · PREVIEW</title>")
write('concierge-glass/panel/index.html', skin(p))

write('command-center/index.html', skin(CC_HTML.read_text()))

#!/usr/bin/env python3
"""Builds sites/versions/index.html from each sites/versions/<n-slug>/version.json (+ thumbs/<n-slug>.webp)."""
import json, html, pathlib
R = pathlib.Path(__file__).resolve().parent.parent / "sites/versions"
vs = [json.loads((d / "version.json").read_text()) | {"dir": d.name} for d in sorted(R.iterdir()) if (d / "version.json").exists()]
RGB = lambda h: ",".join(str(int(h[i:i+2], 16)) for i in (1, 3, 5))
cards = []
for v in vs:
    e = "".join(f'<li><span class="c">{html.escape(x["code"])}</span><span class="n">{html.escape(x["name"])}</span><span class="w">{html.escape(x["where"])}</span></li>' for x in v["effects"])
    cards.append(f'''<a class="card" href="{v["dir"]}/" style="--v:{v["hex"]};--v-rgb:{RGB(v["hex"])}">
  <div class="thumb"><img src="thumbs/{v["dir"]}.webp" alt="Version {v["n"]} {html.escape(v["name"])}, desktop hero" loading="lazy" width="720" height="450"></div>
  <div class="meta"><p class="no">VERSION {v["n"]}</p><h2><i class="dot" aria-hidden="true"></i>{html.escape(v["name"])}</h2>
  <p class="hex">{v["hex"]}</p><ol>{e}</ol><span class="go">OPEN VERSION {v["n"]} <b aria-hidden="true">&rarr;</b></span></div></a>''')
page = f'''<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>PEPTICITY · 8 VERSIONS</title><link rel="icon" href="_common/brand/logo/p-mark.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500&display=swap">
<style>
@font-face{{font-family:"PEPTICITY BLACK";src:url("_common/brand/font/PepticityBlack.woff2") format("woff2");font-display:swap}}
*{{box-sizing:border-box}}html{{background:radial-gradient(1400px 800px at 70% -10%,#3a3b40 0%,#222327 55%,#1b1c1f 100%) fixed;color:#eceff3;font:400 16px/1.5 "Hanken Grotesk",system-ui,sans-serif}}
body{{margin:0;padding:clamp(28px,5vw,64px) clamp(16px,4vw,48px) 80px;max-width:1360px;margin-inline:auto}}
h1,h2,.no,.go,.hex{{font-family:"PEPTICITY BLACK","Arial Black",sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:.08em}}
header{{display:flex;align-items:center;gap:16px;margin-bottom:10px}}header img{{width:38px;height:38px}}
h1{{font-size:clamp(24px,4vw,46px);margin:0}}.lede{{color:#a9b0b9;max-width:720px;margin:6px 0 34px}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,400px),1fr));gap:22px}}
.card{{display:flex;flex-direction:column;text-decoration:none;color:inherit;background:linear-gradient(180deg,rgba(255,255,255,.07),rgba(255,255,255,.025));
 border:1px solid rgba(255,255,255,.14);clip-path:polygon(18px 0,100% 0,100% calc(100% - 18px),calc(100% - 18px) 100%,0 100%,0 18px);
 transition:transform .45s cubic-bezier(.16,1,.3,1),border-color .3s,box-shadow .3s}}
.card:hover,.card:focus-visible{{transform:translateY(-6px);border-color:rgba(var(--v-rgb),.8);box-shadow:0 18px 50px -20px rgba(var(--v-rgb),.6)}}
.card:focus-visible{{outline:2px solid var(--v);outline-offset:4px}}
.thumb{{aspect-ratio:16/10;overflow:hidden;border-bottom:1px solid rgba(var(--v-rgb),.45)}}.thumb img{{width:100%;height:100%;object-fit:cover;display:block;transition:transform .8s cubic-bezier(.16,1,.3,1)}}
.card:hover .thumb img{{transform:scale(1.045)}}
.meta{{padding:18px 20px 20px;display:flex;flex-direction:column;gap:6px;flex:1}}.no{{margin:0;font-size:11px;color:#9aa1aa}}
h2{{margin:0;font-size:22px;display:flex;align-items:center;gap:12px}}.dot{{width:11px;height:11px;transform:rotate(45deg);background:var(--v);box-shadow:0 0 14px rgba(var(--v-rgb),.9)}}
.hex{{margin:0;font-size:11px;color:var(--v)}}
ol{{list-style:none;margin:8px 0 12px;padding:0;display:grid;gap:4px;font-size:13px}}li{{display:grid;grid-template-columns:62px 1fr;gap:0 10px}}
li .c{{color:var(--v);font:500 11.5px/1.7 ui-monospace,Menlo,monospace;grid-row:span 2}}li .n{{text-transform:uppercase;letter-spacing:.06em;font-size:12px}}li .w{{color:#8f97a1;font-size:12px}}
.go{{margin-top:auto;font-size:12px;color:#eceff3;display:flex;gap:10px;align-items:center}}.go b{{transition:transform .3s}}.card:hover .go b{{transform:translateX(6px)}}
.card:hover .go{{color:var(--v)}}
@media (prefers-reduced-motion:reduce){{.card,.thumb img,.go b{{transition:none}}}}
</style></head><body>
<header><img src="_common/brand/logo/p-mark.svg" alt=""><h1>PEPTICITY · 8 VERSIONS</h1></header>
<p class="lede">Same site shape, logo, spinning coin, films and tour in all 8. Each version has its own colour and 7 different effects. Open one, then tap THIS VERSION (bottom-left) to see its effects on the page.</p>
<main class="grid">{"".join(cards)}</main></body></html>'''
(R / "index.html").write_text(page)
print(len(vs), "versions -> sites/versions/index.html")

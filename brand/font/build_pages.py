#!/usr/bin/env python3
"""Assemble the two review pages and the logo SVG exports.

  sites/brand-font/index.html   R128 font review (reference vs live 3D BLACK, PEPTICITY, STUDIO, glyph sheet, 2 sister cuts)
  sites/brand-logo/index.html   R127 logo review (flat P mark, 3D metal P, spinning emblem on dark and on white)
  brand/logo/p-mark.svg, brand/logo/emblem.svg

Run after build_font.py:  python3 brand/font/build_pages.py
"""
import base64, json, math, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
FONT = os.path.join(ROOT, 'brand', 'font')
LOGO = os.path.join(ROOT, 'brand', 'logo')
os.makedirs(LOGO, exist_ok=True)

J = json.load(open(os.path.join(FONT, 'glyphs.json')))
CAP = J['cap']
b64 = lambda p: base64.b64encode(open(p, 'rb').read()).decode()
WOFF = {k: b64(os.path.join(FONT, f'{k}.woff2')) for k in ['PepticityBlack', 'PepticityBlackCondensed', 'PepticityBlackSplit']}
REF = b64(os.path.join(ROOT, 'design', 'references', 'pepticity', '3d-metal-type-BLACK.png'))
ENGINE = open(os.path.join(FONT, 'type3d-engine.js')).read()
ENGINE = re.sub(r'^export ', '', ENGINE, flags=re.M)
ENGINE = re.sub(r"^import .*$", '', ENGINE, flags=re.M)
SYMBOLS = open(os.path.join(FONT, 'pepticity-black.svg')).read()
GLYPH_JSON = json.dumps({'kern': J['kern'], 'regular': J['regular'], 'condensed': J['condensed'], 'split': J['split']}, separators=(',', ':'))

IMPORTMAP = '''<script type="importmap">
{ "imports": {
  "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
  "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/"
} }
</script>'''
MODULE_HEAD = '''import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
'''

# ------------------------------------------------------------------ shared CSS
CSS = '''
@font-face{font-family:"PEPTICITY BLACK";src:url(data:font/woff2;base64,%(PepticityBlack)s) format("woff2");font-display:block}
@font-face{font-family:"PEPTICITY BLACK CONDENSED";src:url(data:font/woff2;base64,%(PepticityBlackCondensed)s) format("woff2");font-display:block}
@font-face{font-family:"PEPTICITY BLACK SPLIT";src:url(data:font/woff2;base64,%(PepticityBlackSplit)s) format("woff2");font-display:block}
:root{
  --ground:#0b0b0c; --uv:#120f1a; --panel:rgba(230,233,237,.035); --line:rgba(230,233,237,.13);
  --plat-0:#2a2d31; --plat-1:#6b7077; --plat-2:#b9bec5; --plat-3:#e6e9ed; --ink:#111214;
  --text:#e6e9ed; --muted:#8e939a; --glow:#dcd6ff; --cut:14px;
  --display:"PEPTICITY BLACK",system-ui,sans-serif; --body:"Geist",system-ui,sans-serif; --mono:"Geist Mono",ui-monospace,monospace;
  color-scheme:dark;
}
*{box-sizing:border-box;margin:0}
html{background:var(--ground)}
body{background:radial-gradient(1200px 700px at 78%% -10%%,#1a1722 0,transparent 60%%),var(--ground);color:var(--text);font:400 16px/1.6 var(--body);
  min-height:100vh;overflow-x:hidden;-webkit-font-smoothing:antialiased}
#gl{position:fixed;inset:0;width:100%%;height:100%%;z-index:3;pointer-events:none}
.wrap{max-width:1240px;margin:0 auto;padding:0 32px}
h1,h2,h3,.cap{text-transform:uppercase;letter-spacing:.06em}
h1,h2{font-family:var(--display);font-weight:400}
h3{font:500 12px/1.4 var(--mono);letter-spacing:.18em;color:var(--muted)}
.top{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:26px 0;border-bottom:1px solid var(--line)}
.wordmark{font-family:var(--display);font-size:26px;letter-spacing:.04em;background:linear-gradient(180deg,#f4f6f8 0,#b9bec5 48%%,#7d828a 52%%,#e6e9ed 100%%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.tag{font:500 11px/1 var(--mono);letter-spacing:.2em;color:var(--muted);text-transform:uppercase}
.intro{padding:72px 0 40px}
.intro h1{font-size:clamp(40px,7vw,92px);line-height:.95;letter-spacing:.03em;background:linear-gradient(180deg,#f7f8fa 0,#c9cdd3 46%%,#6f747b 54%%,#dfe2e6 100%%);
  -webkit-background-clip:text;background-clip:text;color:transparent}
.intro p{max-width:62ch;color:var(--muted);margin-top:18px}
section{padding:56px 0;border-top:1px solid var(--line)}
.sec-head{display:flex;align-items:baseline;gap:18px;margin-bottom:26px;flex-wrap:wrap}
.sec-head h2{font-size:clamp(22px,3vw,34px);color:var(--plat-3)}
.sec-head .n{font:500 12px/1 var(--mono);letter-spacing:.2em;color:var(--glow);opacity:.8}
.sec-head p{flex-basis:100%%;color:var(--muted);max-width:70ch}
.panel{position:relative;background:var(--panel);border:1px solid var(--line);
  clip-path:polygon(var(--cut) 0,100%% 0,100%% calc(100%% - var(--cut)),calc(100%% - var(--cut)) 100%%,0 100%%,0 var(--cut));
  backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px)}
.panel::after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(105deg,transparent 35%%,rgba(230,233,237,.07) 50%%,transparent 65%%);
  transform:translateX(-120%%);transition:transform 1.4s cubic-bezier(.45,0,.2,1)}
.panel:hover::after{transform:translateX(120%%)}
figure{margin:0}
figcaption{font:500 11px/1 var(--mono);letter-spacing:.2em;text-transform:uppercase;color:var(--muted);padding:14px 16px}
.slot{position:relative;width:100%%}
.slot .fb{position:absolute;inset:0;display:none;align-items:center;justify-content:center}
.no3d .slot .fb{display:flex}
.files{font:400 13px/1.9 var(--mono);color:var(--muted)}
.files code{color:var(--text)}
footer{padding:40px 0 80px;color:var(--muted);font-size:13px;border-top:1px solid var(--line)}
@media (max-width:760px){.wrap{padding:0 16px}.intro{padding:48px 0 28px}section{padding:40px 0}}
@media (prefers-reduced-motion:reduce){.panel::after{display:none}}
''' % WOFF

FALLBACK_JS = '''
<script>
// SVG fallback if WebGL or the CDN is unavailable (also ?nogl)
window.type3dFallback = function (why) {
  if (window.__fb) return; window.__fb = why || 'fallback';
  document.documentElement.classList.add('no3d');
  var gl = document.getElementById('gl'); if (gl) gl.style.display = 'none';
};
if (/[?&]nogl/.test(location.search)) addEventListener('DOMContentLoaded', function () { window.type3dFallback('nogl'); });
setTimeout(function () { if (!window.__type3d) window.type3dFallback('timeout'); }, 9000);
</script>'''


def word_svg(text, cut='regular', fill='url(#plat)', h=None):
    """Flat SVG of a word from the glyph contours (used for fallbacks and flat marks)."""
    G = J[cut]; x = 0; paths = []
    for i, ch in enumerate(text):
        g = G.get(ch)
        if not g: x += 320; continue
        d = ''
        for p in g['p']:
            for ring in [p['o']] + p['h']:
                d += 'M' + ' L'.join(f'{px + x:.0f} {CAP - py:.0f}' for px, py in ring) + 'Z'
        paths.append(d)
        x += g['adv'] + J['kern'].get(text[i:i + 2], 0)
    return f'<svg viewBox="0 -40 {x:.0f} 780" preserveAspectRatio="xMidYMid meet" style="width:88%;height:auto"><path fill="{fill}" d="{"".join(paths)}"/></svg>'


GRAD_DEFS = '''<svg width="0" height="0" style="position:absolute" aria-hidden="true"><defs>
<linearGradient id="plat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".46" stop-color="#b9bec5"/><stop offset=".54" stop-color="#6b7077"/><stop offset="1" stop-color="#e6e9ed"/></linearGradient>
<linearGradient id="ink" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a3d42"/><stop offset=".5" stop-color="#111214"/><stop offset="1" stop-color="#2a2d31"/></linearGradient>
</defs></svg>'''

# ------------------------------------------------------------------ FONT PAGE
glyph_cells = ''.join(
    f'<div class="cell"><svg viewBox="0 -30 {J["regular"][c]["adv"]} 760"><use href="#pb-{n}" fill="url(#plat)"/></svg><span>{c}</span></div>'
    for c, n in [(c, {'.': 'period', '-': 'hyphen', **{str(i): w for i, w in enumerate('zero one two three four five six seven eight nine'.split())}}.get(c, c))
                 for c in J['regular'].keys()])

TRAITS = [
    ('Very wide letters, 1.1 to 1.45 times wider than tall', 'MATCH'),
    ('One stroke weight everywhere, about 0.19 of the letter height', 'MATCH'),
    ('B drawn with no stem: three bars, open counters, left ends cut on one 45 degree line, lower bowl a touch wider', 'MATCH'),
    ('L bar ends in a cut that runs parallel to the A leg', 'MATCH'),
    ('A is an open chevron, no crossbar, with a separate lighter bar split off inside the right leg', 'MATCH'),
    ('C ends are mirrored diagonal cuts; outer corners rounded, inner corners tight', 'MATCH'),
    ('K arm and leg leave the stem near mid height; tops and feet cut flat', 'MATCH'),
    ('Brushed gunmetal faces, raised off a dark matte wall with a soft shadow down and to the left', 'MATCH'),
    ('Reference faces are slightly warm grey; ours are kept neutral to stay on brand (no warm or gold cast)', 'CLOSE'),
]
trait_rows = ''.join(f'<li><span class="tk tk-{v.lower()}">{v}</span>{t}</li>' for t, v in TRAITS)

FONT_HTML = f'''<title>PEPTICITY BLACK TYPE</title>
<style>{CSS}
.pair{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.pair img{{display:block;width:100%;aspect-ratio:555/231;object-fit:cover}}
.slot.match{{aspect-ratio:555/231;background:#2b2a2c}}
.traits{{list-style:none;padding:0;margin-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:8px 28px}}
.traits li{{display:flex;gap:12px;align-items:baseline;color:#c9cdd3;font-size:14px;line-height:1.5}}
.tk{{flex:none;font:500 10px/1 var(--mono);letter-spacing:.16em;padding:5px 7px;border:1px solid var(--line);color:var(--plat-3)}}
.tk-close{{color:var(--glow);border-color:rgba(220,214,255,.35)}}
.slot.big{{aspect-ratio:3.1/1}}
.slot.mid{{aspect-ratio:3.6/1}}
.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(112px,1fr));gap:10px}}
.cell{{position:relative;background:var(--panel);border:1px solid var(--line);aspect-ratio:1/1.05;display:flex;flex-direction:column;align-items:center;justify-content:center;
  clip-path:polygon(9px 0,100% 0,100% calc(100% - 9px),calc(100% - 9px) 100%,0 100%,0 9px)}}
.cell svg{{height:46%;width:auto;max-width:84%;overflow:visible}}
.cell span{{position:absolute;left:9px;bottom:7px;font:500 10px/1 var(--mono);color:var(--muted);letter-spacing:.1em}}
.typeset{{margin-top:22px;padding:22px 20px;font-family:var(--display);font-size:clamp(20px,3.4vw,40px);line-height:1.25;letter-spacing:.04em;color:var(--plat-3);word-break:break-word}}
.sisters{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.sisters .slot{{aspect-ratio:2.5/1}}
.alpha{{padding:4px 16px 18px;font-size:clamp(16px,2vw,22px);line-height:1.35;letter-spacing:.05em;color:#c9cdd3;word-break:break-all}}
@media (max-width:760px){{.pair,.sisters,.traits{{grid-template-columns:1fr}}.slot.big{{aspect-ratio:2.2/1}}.slot.mid{{aspect-ratio:2.6/1}}}}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
{IMPORTMAP}
{FALLBACK_JS}
{GRAD_DEFS}
{SYMBOLS}
<canvas id="gl" aria-hidden="true"></canvas>
<div class="wrap">
  <header class="top"><span class="wordmark">PEPTICITY</span><span class="tag">TYPE REVIEW · R128</span></header>
  <div class="intro">
    <h1>PEPTICITY BLACK</h1>
    <p>Your BLACK lettering, drawn as a full typeface: every capital A to Z, the digits and the basics, on one grid, with the same cuts, corners and weight as your picture. Everything in 3D below is live: move the pointer and scroll.</p>
  </div>

  <section id="match">
    <div class="sec-head"><span class="n">01</span><h2>MATCH CHECK</h2><p>Left: your reference picture. Right: the word BLACK set in the new font and rendered live in 3D, same framing and light direction.</p></div>
    <div class="pair">
      <figure class="panel"><img alt="Owner reference: the word BLACK in 3D brushed metal letters" src="data:image/png;base64,{REF}"><figcaption>YOUR REFERENCE</figcaption></figure>
      <figure class="panel"><div class="slot match" data-slot="match"><div class="fb">{word_svg('BLACK')}</div></div><figcaption>PEPTICITY BLACK · LIVE 3D</figcaption></figure>
    </div>
    <ul class="traits">{trait_rows}</ul>
  </section>

  <section id="words">
    <div class="sec-head"><span class="n">02</span><h2>PEPTICITY IN 3D</h2><p>Matte gunmetal faces, UV-black sides with a faint violet sheen, a hairline of light on every edge and a soft cast shadow. Letters turn into place as you scroll.</p></div>
    <div class="panel"><div class="slot big" data-slot="pepticity"><div class="fb">{word_svg('PEPTICITY')}</div></div></div>
    <div style="height:18px"></div>
    <div class="panel"><div class="slot mid" data-slot="studio"><div class="fb">{word_svg('STUDIO')}</div></div></div>
  </section>

  <section id="sheet">
    <div class="sec-head"><span class="n">03</span><h2>GLYPH SHEET</h2><p>All {len(J['regular'])} drawn glyphs. Lower case types as the capitals, so every heading comes out in capitals automatically.</p></div>
    <div class="grid">{glyph_cells}</div>
    <div class="panel typeset">PEPTICITY STUDIO · GRAND OPENING · 0123456789 · BLACK EDITION</div>
  </section>

  <section id="sisters">
    <div class="sec-head"><span class="n">04</span><h2>TWO SISTER CUTS</h2><p>Same 3D finish, related letters. CONDENSED keeps the weight in a narrow body for labels and vials. SPLIT runs a hairline seam through every letter.</p></div>
    <div class="sisters">
      <figure class="panel"><div class="slot" data-slot="condensed"><div class="fb">{word_svg('PEPTICITY', 'condensed')}</div></div>
        <figcaption>PEPTICITY BLACK CONDENSED</figcaption><div class="alpha" style="font-family:'PEPTICITY BLACK CONDENSED'">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div></figure>
      <figure class="panel"><div class="slot" data-slot="split"><div class="fb">{word_svg('PEPTICITY', 'split')}</div></div>
        <figcaption>PEPTICITY BLACK SPLIT</figcaption><div class="alpha" style="font-family:'PEPTICITY BLACK SPLIT'">ABCDEFGHIJKLMNOPQRSTUVWXYZ 0123456789</div></figure>
    </div>
  </section>

  <footer>
    <h3>FILES</h3>
    <div class="files"><code>brand/font/pepticity-black.svg</code> one symbol per glyph · <code>brand/font/PepticityBlack.otf</code> + <code>.woff2</code> ·
      <code>PepticityBlackCondensed</code> and <code>PepticityBlackSplit</code> (.otf, .woff2, .svg) · <code>brand/font/build_font.py</code> rebuilds them all</div>
  </footer>
</div>
<script type="application/json" id="glyph-data">{GLYPH_JSON}</script>
<script type="module">
{MODULE_HEAD}{ENGINE}
// ---------------------------------------------------------------- font page
const stage = createStage(document.getElementById('gl'));
if (stage) {{
  const slotEl = n => document.querySelector(`[data-slot="${{n}}"]`);
  function wordSlot(name, text, o = {{}}) {{
    const ws = wallScene(stage, o.wall || {{}});
    const w = makeWord(stage, text, o.word || {{}});
    ws.scene.add(w.group);
    const st = {{ ry: 0, rx: 0, l: w.letters.map(() => ({{ ry: o.funky ? 1.2 : 0, z: 0 }})) }};
    return stage.addSlot(slotEl(name), {{
      scene: ws.scene, camera: ws.camera,
      fit: a => fitCamera(ws.camera, w.width, w.height, a, o.fill || 0.86, o.lookY || 0),
      update(dt, t, prog, p) {{
        const k = o.tilt ?? 1;
        st.ry = damp(st.ry, p.x * 0.16 * k, 3, dt); st.rx = damp(st.rx, p.y * 0.1 * k, 3, dt);
        w.group.rotation.set(st.rx, st.ry, 0);
        if (o.funky) {{
          const local = clamp((prog - 0.5) * 2.6, -1, 1);
          w.letters.forEach((L, i) => {{
            const s = st.l[i], n = w.letters.length, phase = (i - (n - 1) / 2) / n;
            const tgt = -local * (1.15 + phase * 1.4) * (o.funky);
            s.ry = damp(s.ry, tgt + Math.sin(t * 0.7 + i * 0.6) * 0.035, 5, dt);
            s.z = damp(s.z, Math.abs(local) * 0.07 * Math.sin(i * 1.7 + 1), 5, dt);
            L.rotation.y = s.ry; L.position.z = s.z;
          }});
        }}
      }}
    }});
  }}
  wordSlot('match', 'BLACK', {{ fill: 0.9, lookY: -0.012, tilt: 0.15, wall: {{ keyPos: [3.0, 2.0, 2.2], shadowRadius: 8 }} }});
  wordSlot('pepticity', 'PEPTICITY', {{ fill: 0.84, funky: 1 }});
  wordSlot('studio', 'STUDIO', {{ fill: 0.6, funky: 0.8 }});
  wordSlot('condensed', 'PEPTICITY', {{ fill: 0.8, funky: 1.3, word: {{ cut: 'condensed' }} }});
  wordSlot('split', 'PEPTICITY', {{ fill: 0.86, funky: 1.3, word: {{ cut: 'split' }} }});
}}
</script>
'''
os.makedirs(os.path.join(ROOT, 'sites', 'brand-font'), exist_ok=True)
open(os.path.join(ROOT, 'sites', 'brand-font', 'index.html'), 'w').write(FONT_HTML)

# ------------------------------------------------------------------ LOGO: flat SVG geometry
def glyph_d(ch, sx, sy, tx, ty, rot=0, cut='regular', cx=None, cy=None):
    """Path data for a glyph scaled, centred on (cx,cy) of its box, rotated (radians, CCW in y-up) and placed at (tx,ty) (y-up)."""
    g = J[cut][ch]
    if cx is None: cx = g['adv'] / 2
    if cy is None: cy = CAP / 2
    c, s = math.cos(rot), math.sin(rot); d = ''
    for p in g['p']:
        for ring in [p['o']] + p['h']:
            pts = []
            for px, py in ring:
                x, y = (px - cx) * sx, (py - cy) * sy
                X, Y = tx + x * c - y * s, ty + x * s + y * c
                pts.append(f'{X:.4f} {-Y:.4f}')
            d += 'M' + ' L'.join(pts) + 'Z'
    return d


def annulus(r0, r1):
    a = lambda r, sweep: f'M{r} 0 A{r} {r} 0 1 {sweep} {-r} 0 A{r} {r} 0 1 {sweep} {r} 0Z'
    return a(r1, 0) + a(r0, 1)


# P mark: the font's P, its box normalised to height 1
P = J['regular']['P']
pxs = [x for p in P['p'] for x, _ in p['o']]
p_minx, p_maxx = min(pxs), max(pxs)
p_w = (p_maxx - p_minx) / CAP


def p_mark_d(h, tx=0, ty=0):
    sc = h / CAP
    return glyph_d('P', sc, sc, tx, ty, 0, cx=(p_minx + p_maxx) / 2, cy=CAP / 2)


# emblem layout (unit radius 1): outer ring .93-1, inner ring .62-.66, text band, P in the middle
EMB_TEXT = 'PEPTICITY*PEPTICITY*'
LH = 0.165                 # letter height
RB = 0.715                 # baseline radius
RC = RB + LH / 2


def emblem_layout():
    """Top PEPTICITY reads clockwise (letters point out); bottom PEPTICITY reads left to right upright
    (letters point in), like a minted seal. Diamonds sit at 3 and 9 o'clock. Items: (char, phi, upright_flag)."""
    sc = LH / CAP
    word = 'PEPTICITY'
    advs = [J['regular'][c]['adv'] * sc + J['kern'].get(word[i:i + 2], 0) * sc for i, c in enumerate(word)]
    track = 0.026
    span = sum(advs) + track * (len(word) - 1)
    out = []
    s = 0
    for c, a in zip(word, advs):                       # top: clockwise, centred on 12 o'clock
        out.append((c, math.pi / 2 + (span / 2 - (s + a / 2)) / RC, 0)); s += a + track
    s = 0
    for c, a in zip(word, advs):                       # bottom: counter-clockwise, centred on 6 o'clock
        out.append((c, -math.pi / 2 - (span / 2 - (s + a / 2)) / RC, 1)); s += a + track
    out += [('*', 0.0, 0), ('*', math.pi, 0)]
    return out, sc


def emblem_d():
    lay, sc = emblem_layout(); d = ''
    for ch, phi, up in lay:
        X, Y = RC * math.cos(phi), RC * math.sin(phi)
        if ch == '*':
            r = 0.028; rot = phi - math.pi / 2
            pts = [(0, r), (r, 0), (0, -r), (-r, 0)]
            d += 'M' + ' L'.join(f'{X + x * math.cos(rot) - y * math.sin(rot):.4f} {-(Y + x * math.sin(rot) + y * math.cos(rot)):.4f}' for x, y in pts) + 'Z'
        else:
            d += glyph_d(ch, sc, sc, X, Y, phi + math.pi / 2 if up else phi - math.pi / 2)
    return d


EMB_TEXT_D = emblem_d()
EMB_RINGS_D = annulus(0.935, 1.0) + annulus(0.62, 0.655)
EMB_P_D = p_mark_d(0.74)
PM_D = p_mark_d(1.0)

SVG_DEFS = '''<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f6f8"/><stop offset=".46" stop-color="#b9bec5"/><stop offset=".54" stop-color="#6b7077"/><stop offset="1" stop-color="#e6e9ed"/></linearGradient></defs>'''
open(os.path.join(LOGO, 'p-mark.svg'), 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-p_w / 2 - 0.08:.3f} -0.58 {p_w + 0.16:.3f} 1.16">\n<title>PEPTICITY P MARK</title>\n{SVG_DEFS}\n<path fill="url(#g)" d="{PM_D}"/>\n</svg>\n')
open(os.path.join(LOGO, 'emblem.svg'), 'w').write(
    f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-1.04 -1.04 2.08 2.08">\n<title>PEPTICITY EMBLEM</title>\n{SVG_DEFS}\n'
    f'<path fill="url(#g)" fill-rule="evenodd" d="{EMB_RINGS_D}"/>\n<path fill="url(#g)" d="{EMB_TEXT_D}"/>\n<path fill="url(#g)" d="{EMB_P_D}"/>\n</svg>\n')


def inline_mark(fill, size_style):
    return f'<svg viewBox="{-p_w / 2 - 0.08:.3f} -0.58 {p_w + 0.16:.3f} 1.16" style="{size_style}"><path fill="{fill}" d="{PM_D}"/></svg>'


def inline_emblem(fill, size_style):
    return (f'<svg viewBox="-1.04 -1.04 2.08 2.08" style="{size_style}"><path fill="{fill}" fill-rule="evenodd" d="{EMB_RINGS_D}"/>'
            f'<path fill="{fill}" d="{EMB_TEXT_D}"/><path fill="{fill}" d="{EMB_P_D}"/></svg>')


EMB_JSON = json.dumps({'layout': emblem_layout()[0], 'sc': emblem_layout()[1], 'RC': RC, 'LH': LH, 'pw': p_w, 'pminx': p_minx, 'pmaxx': p_maxx})

LOGO_HTML = f'''<title>PEPTICITY P MARK</title>
<style>{CSS}
.duo{{display:grid;grid-template-columns:1fr 1fr;gap:18px}}
.tile{{aspect-ratio:1.25/1;display:flex;align-items:center;justify-content:center}}
.tile.white{{background:#f7f8fa;border-color:rgba(17,18,20,.12)}}
.tile.white + figcaption, .white figcaption{{color:#5a5f66}}
figure.wt{{background:#f7f8fa;border-color:rgba(17,18,20,.1)}}
figure.wt figcaption{{color:#60656c}}
.slot.p3d{{aspect-ratio:1/1}}
.slot.emb{{aspect-ratio:1/1}}
.dark-wall{{background:#2b2a2c}}
.white-wall{{background:#f4f5f7}}
.mini{{display:flex;gap:18px;margin-top:18px}}
.mini figure{{flex:1}}
.mini .tile{{aspect-ratio:2/1}}
@media (max-width:760px){{.duo{{grid-template-columns:1fr}}.mini{{flex-direction:column}}}}
</style>
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500&family=Geist+Mono:wght@500&display=swap" rel="stylesheet">
{IMPORTMAP}
{FALLBACK_JS}
{GRAD_DEFS}
<canvas id="gl" aria-hidden="true"></canvas>
<div class="wrap">
  <header class="top"><span class="wordmark">PEPTICITY</span><span class="tag">LOGO REVIEW · R127</span></header>
  <div class="intro">
    <h1>THE P MARK</h1>
    <p>The logo is the P from the new PEPTICITY BLACK font: same stroke, the rounded outer corner and half-round counter of the B, flat-cut stem. Below it as a flat mark, in 3D metal, and as the spinning emblem with PEPTICITY raised around the ring.</p>
  </div>

  <section>
    <div class="sec-head"><span class="n">01</span><h2>FLAT MARK</h2><p>The vector mark on dark and on white. Exported as brand/logo/p-mark.svg.</p></div>
    <div class="duo">
      <figure class="panel"><div class="tile">{inline_mark('url(#plat)', 'height:62%')}</div><figcaption>ON DARK · PLATINUM</figcaption></figure>
      <figure class="panel wt"><div class="tile">{inline_mark('url(#ink)', 'height:62%')}</div><figcaption>ON WHITE · INK</figcaption></figure>
    </div>
  </section>

  <section>
    <div class="sec-head"><span class="n">02</span><h2>3D METAL</h2><p>Real extruded metal with a UV-black side wall, a hairline of light on the edge and a soft shadow. Platinum is the main finish; the pale gold-chrome is shown as the accent option. Move the pointer to tilt it.</p></div>
    <div class="duo">
      <figure class="panel"><div class="slot p3d dark-wall" data-slot="p-plat"><div class="fb">{inline_mark('url(#plat)', 'height:60%')}</div></div><figcaption>PLATINUM CHROME</figcaption></figure>
      <figure class="panel"><div class="slot p3d dark-wall" data-slot="p-gold"><div class="fb">{inline_mark('url(#plat)', 'height:60%')}</div></div><figcaption>GOLD-CHROME ACCENT</figcaption></figure>
    </div>
  </section>

  <section>
    <div class="sec-head"><span class="n">03</span><h2>THE SPINNING EMBLEM</h2><p>The P inside a ring with PEPTICITY raised around it in the font, turning slowly like a coin. Both faces read the right way round. Scroll speeds it up a little.</p></div>
    <div class="duo">
      <figure class="panel"><div class="slot emb dark-wall" data-slot="emb-dark"><div class="fb">{inline_emblem('url(#plat)', 'width:70%')}</div></div><figcaption>ON DARK</figcaption></figure>
      <figure class="panel wt"><div class="slot emb white-wall" data-slot="emb-white"><div class="fb">{inline_emblem('url(#ink)', 'width:70%')}</div></div><figcaption>ON WHITE</figcaption></figure>
    </div>
    <div class="mini">
      <figure class="panel"><div class="tile">{inline_emblem('url(#plat)', 'height:84%')}</div><figcaption>FLAT EMBLEM · DARK</figcaption></figure>
      <figure class="panel wt"><div class="tile">{inline_emblem('url(#ink)', 'height:84%')}</div><figcaption>FLAT EMBLEM · WHITE</figcaption></figure>
    </div>
  </section>

  <footer>
    <h3>FILES</h3>
    <div class="files"><code>brand/logo/p-mark.svg</code> · <code>brand/logo/emblem.svg</code> · built from <code>brand/font/glyphs.json</code> by <code>brand/font/build_pages.py</code></div>
  </footer>
</div>
<script type="application/json" id="glyph-data">{GLYPH_JSON}</script>
<script type="application/json" id="emblem-data">{EMB_JSON}</script>
<script type="module">
{MODULE_HEAD}{ENGINE}
// ---------------------------------------------------------------- logo page
const stage = createStage(document.getElementById('gl'));
const E = JSON.parse(document.getElementById('emblem-data').textContent);
if (stage) {{
  const slotEl = n => document.querySelector(`[data-slot="${{n}}"]`);
  const M = stage.MAT;
  // centred P mesh group (geometry in glyph units/1000, P box centred)
  function pMesh(face, height, depth, bevel) {{
    const geo = glyphGeometries('regular', 'P', {{ depth, bevel }});
    const g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
    geo.parts.forEach(p => {{ const m = new THREE.Mesh(p.g, [M[face], M.uv]); m.castShadow = m.receiveShadow = true; inner.add(m); inner.add(new THREE.LineSegments(p.lg, M.edge)); }});
    inner.position.set(-(E.pminx + E.pmaxx) / 2000, -0.35, -depth / 2);
    const s = height / 0.7; g.scale.setScalar(s); return g;
  }}
  function pSlot(name, face) {{
    const ws = wallScene(stage, {{ keyPos: [2.0, 2.4, 3.4], wallZ: -0.32 }});
    const P = pMesh(face, 1, 0.16, 0.016); ws.scene.add(P);
    const st = {{ ry: 0, rx: 0 }};
    stage.addSlot(slotEl(name), {{ scene: ws.scene, camera: ws.camera,
      fit: a => fitCamera(ws.camera, 1.0, 1.0, a, 0.62),
      update(dt, t, prog, p) {{
        st.ry = damp(st.ry, Math.sin(t * 0.45) * 0.32 + p.x * 0.35 + (prog - 0.5) * 0.6, 3, dt);
        st.rx = damp(st.rx, p.y * 0.2 + Math.sin(t * 0.33) * 0.05, 3, dt);
        P.rotation.set(st.rx, st.ry, 0);
      }} }});
  }}
  pSlot('p-plat', 'platinum'); pSlot('p-gold', 'goldchrome');

  // emblem: UV-black coin, platinum rings, PEPTICITY raised around, P in the middle, both faces
  function ringGeo(r0, r1, depth, bevel) {{
    const s = new THREE.Shape(); s.absarc(0, 0, r1, 0, Math.PI * 2, false);
    const h = new THREE.Path(); h.absarc(0, 0, r0, 0, Math.PI * 2, true); s.holes.push(h);
    return new THREE.ExtrudeGeometry(s, {{ depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * .8, bevelOffset: -bevel * .8, bevelSegments: 2, curveSegments: 96 }});
  }}
  function face(group, zFront, light) {{
    const f = new THREE.Group();
    const rd = 0.035;
    [[0.935, 1.0], [0.62, 0.655]].forEach(([a, b]) => {{ const m = new THREE.Mesh(ringGeo(a, b, rd, 0.008), [M.platinum, M.uv]); m.castShadow = true; f.add(m); }});
    const sc = E.sc;
    E.layout.forEach(([ch, phi, up]) => {{
      const X = E.RC * Math.cos(phi), Y = E.RC * Math.sin(phi);
      let obj;
      if (ch === '*') {{
        const s = new THREE.Shape([[0, .028], [.028, 0], [0, -.028], [-.028, 0]].map(([x, y]) => new THREE.Vector2(x, y)));
        obj = new THREE.Mesh(new THREE.ExtrudeGeometry(s, {{ depth: rd, bevelEnabled: false }}), [M.platinum, M.uv]);
      }} else {{
        const geo = glyphGeometries('regular', ch, {{ depth: 0.2, bevel: 0.03 }});
        obj = new THREE.Group(); const inner = new THREE.Group(); obj.add(inner);
        geo.parts.forEach(p => {{ const m = new THREE.Mesh(p.g, [M.gunmetal, M.uv]); m.castShadow = true; inner.add(m); inner.add(new THREE.LineSegments(p.lg, M.edge)); }});
        inner.position.set(-geo.adv / 2, -0.35, 0); obj.scale.setScalar(sc * 1000);
      }}
      obj.position.set(X, Y, 0); obj.rotation.z = up ? phi + Math.PI / 2 : phi - Math.PI / 2; f.add(obj);
    }});
    const P = pMesh('platinum', 0.74, 0.042, 0.006); P.position.z = 0.025; f.add(P);
    f.position.z = zFront; group.add(f); return f;
  }}
  function embSlot(name, light) {{
    const ws = wallScene(stage, {{ light, keyPos: [1.6, 2.2, 3.6], wallZ: -0.9, shadowRadius: 8 }});
    ws.key.shadow.camera.left = -3; ws.key.shadow.camera.right = 3; ws.key.shadow.camera.top = 3; ws.key.shadow.camera.bottom = -3;
    const coin = new THREE.Group();
    const discS = new THREE.Shape(); discS.absarc(0, 0, 0.985, 0, Math.PI * 2, false);
    const disc = new THREE.Mesh(new THREE.ExtrudeGeometry(discS, {{ depth: 0.07, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 96 }}), [M.uv, M.platinum]);
    disc.position.z = -0.035; disc.castShadow = true; coin.add(disc);
    face(coin, 0.047, light);
    const back = face(coin, 0, light); back.rotation.y = Math.PI; back.position.z = -0.047;
    ws.scene.add(coin);
    const st = {{ a: 0.0, v: 0.42 }};
    stage.addSlot(slotEl(name), {{ scene: ws.scene, camera: ws.camera,
      fit: a => fitCamera(ws.camera, 2.15, 2.15, a, 0.9),
      update(dt, t, prog, p) {{
        st.v = damp(st.v, 0.42 + Math.abs(prog - 0.5) * 0.9, 2, dt);
        st.a += dt * st.v;
        coin.rotation.set(0.1 + p.y * 0.08, st.a, 0);
      }} }});
  }}
  embSlot('emb-dark', false); embSlot('emb-white', true);
}}
</script>
'''
os.makedirs(os.path.join(ROOT, 'sites', 'brand-logo'), exist_ok=True)
open(os.path.join(ROOT, 'sites', 'brand-logo', 'index.html'), 'w').write(LOGO_HTML)
print('pages + logo svgs written')

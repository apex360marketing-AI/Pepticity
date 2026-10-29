"""Re-embed the owner's font into sites/dashboard/index.html whenever brand/font is rebuilt:
the PEPTICITY BLACK @font-face (PepticityBlack.woff2), the glyph contours (glyphs.json) used by the inlined
3D engine, the engine itself (type3d-engine.js), the emblem layout, and the flat P mark + emblem symbols.
python3 -I brand/tools/dash_font.py"""
import base64, json, math, pathlib, re
ROOT = pathlib.Path(__file__).resolve().parents[2]
FONT, PAGE = ROOT / 'brand/font', ROOT / 'sites/dashboard/index.html'
s = PAGE.read_text()
J = json.load(open(FONT / 'glyphs.json')); CAP = J['cap']

def sub(pattern, repl, flags=re.S):
    global s
    s2, n = re.subn(pattern, lambda m: repl, s, count=1, flags=flags)
    if n != 1: raise SystemExit('pattern not found: ' + pattern[:80])
    s = s2

woff = base64.b64encode((FONT / 'PepticityBlack.woff2').read_bytes()).decode()
sub(r'@font-face\{font-family:"PEPTICITY BLACK";src:url\(data:font/woff2;base64,[A-Za-z0-9+/=]+\)', '@font-face{font-family:"PEPTICITY BLACK";src:url(data:font/woff2;base64,' + woff + ')')

src = (FONT / 'build_pages.py').read_text()
ns = {'J': J, 'CAP': CAP, 'math': math, 'json': json}
exec(src[src.index('def glyph_d('):src.index('SVG_DEFS =')], ns)
lay, sc = ns['emblem_layout']()
emb = json.dumps({'layout': lay, 'sc': sc, 'RC': ns['RC'], 'LH': ns['LH'], 'pw': ns['p_w'], 'pminx': ns['p_minx'], 'pmaxx': ns['p_maxx']}, separators=(',', ':'))
glyph = json.dumps({'kern': J['kern'], 'regular': J['regular']}, separators=(',', ':'))
sub(r'<script type="application/json" id="glyph-data">.*?</script>', '<script type="application/json" id="glyph-data">' + glyph + '</script>')
sub(r'<script type="application/json" id="emblem-data">.*?</script>', '<script type="application/json" id="emblem-data">' + emb + '</script>')

p_w = ns['p_w']; vb = f'{-p_w / 2 - 0.08:.3f} -0.58 {p_w + 0.16:.3f} 1.16'
sub(r'<symbol id="pep-pmark" viewBox="[^"]*"><path fill="url\(#gPlat\)" d="[^"]*"/></symbol>',
    f'<symbol id="pep-pmark" viewBox="{vb}"><path fill="url(#gPlat)" d="{ns["PM_D"]}"/></symbol>')
sub(r'<symbol id="pep-logo" viewBox="-1.04 -1.04 2.08 2.08">.*?</symbol>',
    f'<symbol id="pep-logo" viewBox="-1.04 -1.04 2.08 2.08"><path fill="url(#gPlat)" fill-rule="evenodd" d="{ns["EMB_RINGS_D"]}"/><path fill="url(#gPlat)" d="{ns["EMB_TEXT_D"]}"/><path fill="url(#gPlat)" d="{ns["EMB_P_D"]}"/></symbol>')
sub(r'<svg class="pfb" viewBox="[^"]*"', f'<svg class="pfb" viewBox="{vb}"')

eng = (FONT / 'type3d-engine.js').read_text()
eng = re.sub(r'^export ', '', eng, flags=re.M); eng = re.sub(r'^import .*$', '', eng, flags=re.M)
i = s.index('const ENGINE = (() => {\n') + len('const ENGINE = (() => {\n'); j = s.index('\n  return { createStage', i)
s = s[:i] + '/* ---- brand/font/type3d-engine.js (inlined by brand/tools/dash_font.py) ---- */\n' + eng + s[j:]
PAGE.write_text(s)
print('font', len(woff) * 3 // 4, 'B · glyphs', len(glyph), 'B · page', PAGE.stat().st_size // 1024, 'KB')

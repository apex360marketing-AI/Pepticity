# Final colour pass (runs LAST, after every worker's apply.py): ONE BLUE ONLY.
# Violet/purple -> the logo blue (rgb 42,120,255) or, for light tints, its hot core (207,230,255); alpha kept.
# Gold/yellow -> platinum. Module 02-logo3d (the locked logo 07) is never touched.
# usage: python3 -I final_sweep.py IN.html OUT.html
import re, sys, colorsys
SRC = r'(<(style|script)[^>]*data-pep-src="([^"]+)"[^>]*>)(.*?)(</\2>)'
HTML = r'(<!-- module:([0-9]+-[a-z0-9-]+) -->)(.*?)(?=<!-- module:|<script|</body)'
BLUE, CORE = (42, 120, 255), (207, 230, 255)
PLAT_D, PLAT_L = (42, 45, 49), (230, 233, 237)
TOKENS = {'--pep-uv-light-1': '#2a78ff', '--pep-uv-light-2': '#2a78ff', '--pep-uv-light-3': '#cfe6ff', '--pep-uv-light-4': '#cfe6ff'}  # chrome gold is allowed again (Jeff, 13 Nov evening)

def target(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    hue = h * 360
    if s < .2 or l < .16 or l > .96: return None  # very dark tints (UV black #120f1a) stay
    if 245 <= hue <= 320: return CORE if l >= .7 else BLUE          # violet / purple
    return None

def fix(txt, counts):
    def hexsub(m):
        x = m.group(1); full = x if len(x) == 6 else ''.join(c * 2 for c in x)
        t = target(*(int(full[i:i + 2], 16) for i in (0, 2, 4)))
        if not t: return m.group(0)
        counts['n'] += 1; return '#%02x%02x%02x' % t
    def rgbsub(m):
        t = target(int(m.group(2)), int(m.group(3)), int(m.group(4)))
        if not t: return m.group(0)
        counts['n'] += 1; return '%s(%d, %d, %d' % (m.group(1), *t)
    def hex0x(m):
        x = m.group(1); t = target(*(int(x[i:i + 2], 16) for i in (0, 2, 4)))
        if not t: return m.group(0)
        counts['n'] += 1; return '0x%02x%02x%02x' % t
    def trip(m):  # CSS custom property holding "r, g, b"
        t = target(int(m.group(2)), int(m.group(3)), int(m.group(4)))
        if not t: return m.group(0)
        counts['n'] += 1; return '%s%d, %d, %d;' % (m.group(1), *t)
    txt = re.sub(r'(--[a-z0-9-]+:\s*)(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*;', trip, txt)
    txt = re.sub(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b(?![0-9a-zA-Z-])', hexsub, txt)
    txt = re.sub(r'(rgba?)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})', rgbsub, txt)
    txt = re.sub(r'0x([0-9a-fA-F]{6})\b', hex0x, txt)
    return txt

h = open(sys.argv[1]).read()
report = []
def block(m):
    name = m.group(3)
    if name.startswith('modules/02-logo3d/'): return m.group(0)
    c = {'n': 0}; body = m.group(4)
    if name == 'tokens.css':
        for k, v in TOKENS.items():
            body, n = re.subn(r'(%s\s*:\s*)#[0-9a-fA-F]{3,6}' % re.escape(k), r'\g<1>' + v, body); c['n'] += n
    if name == 'modules/06-bottle/bottle.css':
        # the bottle's light is the logo blue all the way down (Jeff: never white); light tints keep their alpha
        global target
        keep = target
        target = lambda r, g, b: (BLUE if keep(r, g, b) == CORE else keep(r, g, b))
        body = fix(body, c)
        target = keep
        # the photo's own violet (liquid, floor reflection) is recoloured in the file itself by recolor_vials.py,
        # so no CSS filter is needed here (a filter would push the now-blue photo towards cyan).
    else:
        body = fix(body, c)
    if c['n']: report.append(f'{name}: {c["n"]}')
    return m.group(1) + body + m.group(5)
h = re.sub(SRC, block, h, flags=re.S)
def html(m):
    if m.group(2) == '02-logo3d': return m.group(0)
    c = {'n': 0}; body = fix(m.group(3), c)
    if c['n']: report.append(f'html:{m.group(2)}: {c["n"]}')
    return m.group(1) + body
h = re.sub(HTML, html, h, flags=re.S)
open(sys.argv[2], 'w').write(h)
print('\n'.join(report) or 'nothing to change')

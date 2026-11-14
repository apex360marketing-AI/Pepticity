# Off-brand colour scan per module block. usage: python3 -I scan_colors.py FILE.html [--all]
# Flags violet/purple (hue 245-320), gold/yellow (hue 35-65, sat > .35), cyan (hue 170-200, sat > .35),
# and blues that are not the logo blue family (hue 200-240, sat > .45, more than 12 RGB steps from #2a78ff / #2f7dff / #cfe6ff).
import re, sys, colorsys
h = open(sys.argv[1]).read()
SRC = r'<(style|script)[^>]*data-pep-src="([^"]+)"[^>]*>(.*?)</\1>'
HTML = r'<!-- module:([0-9]+-[a-z0-9-]+) -->(.*?)(?=<!-- module:|<script|</body)'
OK_BLUES = [(42, 120, 255), (47, 125, 255), (207, 230, 255)]
def classify(r, g, b):
    hh, l, s = colorsys.rgb_to_hls(r / 255, g / 255, b / 255)
    hue = hh * 360
    if s < .2 or l < .08 or l > .96: return None
    if 245 <= hue <= 320: return 'violet'
    if 35 <= hue <= 65 and s > .35: return 'gold'
    if 170 <= hue < 200 and s > .35: return 'cyan'
    if 200 <= hue <= 240 and s > .45 and min(max(abs(r - a), abs(g - b2), abs(b - c)) for a, b2, c in OK_BLUES) > 12: return 'other-blue'
    return None
def colours(txt):
    for m in re.finditer(r'#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b', txt):
        x = m.group(1)
        if len(x) == 3: x = ''.join(c * 2 for c in x)
        yield m.group(0), tuple(int(x[i:i + 2], 16) for i in (0, 2, 4))
    for m in re.finditer(r'rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)', txt):
        yield m.group(0) + ')', tuple(int(m.group(i)) for i in (1, 2, 3))
    for m in re.finditer(r'0x([0-9a-fA-F]{6})\b', txt):
        x = m.group(1); yield m.group(0), tuple(int(x[i:i + 2], 16) for i in (0, 2, 4))
blocks = [(m.group(2), m.group(3)) for m in re.finditer(SRC, h, re.S)] + [('html:' + m.group(1), m.group(2)) for m in re.finditer(HTML, h, re.S)]
total = 0
for name, txt in blocks:
    hits = {}
    for lit, rgb in colours(txt):
        c = classify(*rgb)
        if c: hits.setdefault(c, set()).add(lit)
    if hits:
        n = sum(len(v) for v in hits.values()); total += n
        print(f'{name:38} ' + '; '.join(f'{k}: {" ".join(sorted(v)[:6])}' for k, v in hits.items()))
print('distinct off-brand literals:', total)

# One build: 3-way merge per section.
#   base   = store-8e40044.html  (the PC build /new/ started from)
#   ours   = base-new.html       (/new/ now: menu 58, ground 21 A, logo 21 accent, footer links, label line removed, hidden list)
#   theirs = store-a0ba5d9.html  (Grace's /store/ now: final chrome look, logo 07, header P B tuned, bottle)
# Skeleton = theirs. Sections changed on one side take that side; sections changed on both are merged with git merge-file.
# Header sections take ours (menu 58); the TOP worker seats the store's P into it.
# usage: python3 -I merge_base.py OUT.html
import re, subprocess, sys, tempfile, os

W = '/home/user/work/'
BLOCK = r'<(style|script)([^>]*)data-pep-src="%s"([^>]*)>(.*?)</\1>'
SRC = r'<(style|script)[^>]*data-pep-src="([^"]+)"[^>]*>(.*?)</\1>'
HTML = r'<!-- module:([0-9]+-[a-z0-9-]+) -->(.*?)(?=<!-- module:|<script|</body)'

def blocks(h):
    out = {}
    for m in re.finditer(SRC, h, re.S): out[m.group(2)] = m.group(3)
    for m in re.finditer(HTML, h, re.S): out['html:' + m.group(1)] = m.group(2)
    return out

STRAT = {'modules/02-logo3d/logo3d.js': '--union', 'html:10-hero': '--theirs', 'html:50-footer': '--theirs'}

def merge3(o, b, t, name):
    with tempfile.TemporaryDirectory() as d:
        paths = []
        for tag, txt in (('ours', o), ('base', b), ('theirs', t)):
            p = os.path.join(d, tag); open(p, 'w').write(txt); paths.append(p)
        r = subprocess.run(['git', 'merge-file', '-p'] + ([STRAT[name]] if name in STRAT else []) + ['-L', 'ours', '-L', 'base', '-L', 'theirs'] + paths, capture_output=True, text=True)
        return r.stdout, r.returncode  # returncode = number of conflicts

base = open(W + 'store-8e40044.html').read()
ours = open(W + 'base-new.html').read()
theirs = open(W + 'store-a0ba5d9.html').read()
B, O, T = blocks(base), blocks(ours), blocks(theirs)
TAKE_OURS = {'html:05-header', 'modules/05-header/header.css', 'modules/05-header/header.js'}
out = theirs
log = []
for k in sorted(set(O) | set(T)):
    o, b, t = O.get(k), B.get(k, ''), T.get(k)
    if o == t: continue
    if t is None:
        log.append(f'ADD-OURS   {k}'); continue  # inserted below
    if k in TAKE_OURS or t == b: new, how = o, 'ours'
    elif o == b or o is None: continue  # theirs already in skeleton
    else:
        new, n = merge3(o, b, t, k)
        how = f'merged ({n} conflicts)'
        if n: open(W + 'conflict-' + k.replace('/', '_').replace(':', '_') + '.txt', 'w').write(new)
    if k.startswith('html:'):
        mod = k[5:]
        pat = re.compile(r'(<!-- module:%s -->)(.*?)(?=<!-- module:|<script|</body)' % re.escape(mod), re.S)
        out, c = pat.subn(lambda m: m.group(1) + new, out, count=1)
    else:
        pat = re.compile(BLOCK % re.escape(k), re.S)
        out, c = pat.subn(lambda m: '<%s%sdata-pep-src="%s"%s>%s</%s>' % (m.group(1), m.group(2), k, m.group(3), new, m.group(1)), out, count=1)
    assert c == 1, k
    log.append(f'{how:22} {k}')

# blocks only in ours: pep-logo.js goes right after the header script
m = re.search(BLOCK % re.escape('modules/05-header/pep-logo.js'), ours, re.S)
if m and 'data-pep-src="modules/05-header/pep-logo.js"' not in out:
    anchor = re.search(BLOCK % re.escape('modules/05-header/header.js'), out, re.S)
    out = out[:anchor.end()] + '\n' + m.group(0) + out[anchor.end():]
# hero: keep logo 21's light-below-the-word clearance on the store's hero word
out = out.replace('data-light="0.5"></span>\n      <span class="pep-hero-word-text">', 'data-light="0.5" data-accent-clear=".pep-hero-row"></span>\n      <span class="pep-hero-word-text">', 1)
assert '<<<<<<<' not in out and '>>>>>>>' not in out
open(sys.argv[1], 'w').write(out)
print('\n'.join(log))

#!/usr/bin/env python3
"""Adds PEPTICITY LOGO · BLUE (live 3D P + PEPTICITY word) to a built page. Small, additive patch: nothing is removed.

  python3 apply.py store <page-dir>       the store /new/: big lockup at the top of the hero (menu 58 untouched),
                                         a compact lockup that rides under the bar once the bar floats (scrolled)
  python3 apply.py dash  <page-dir> <css-selector-of-header> [before|after|prepend|append]
                                         a dashboard: a small lockup placed at the header element

Copies pep-logo-blue.js and the fallback pictures into <page-dir>/vendor/ (three.js must be at <page-dir>/vendor/three/,
copied there if missing). Idempotent: running twice changes nothing."""
import os, re, shutil, sys
HERE = os.path.dirname(os.path.abspath(__file__))
MARK = 'pep-logo-blue'


def files(page):
    v = os.path.join(page, 'vendor'); os.makedirs(os.path.join(v, 'three'), exist_ok=True)
    shutil.copy(os.path.join(HERE, 'pep-logo-blue.js'), v)
    for f in ('lockup.png', 'mark.png'):
        if os.path.exists(os.path.join(HERE, 'fallback', f)): shutil.copy(os.path.join(HERE, 'fallback', f), os.path.join(v, 'pep-logo-blue-' + f))
    src3 = os.path.join(HERE, 'three')
    for f in ('three.module.js', 'three.core.js'):
        if not os.path.exists(os.path.join(v, 'three', f)): shutil.copy(os.path.join(src3, f), os.path.join(v, 'three', f))


CSS = open(os.path.join(HERE, 'pep-logo-blue.css')).read()


def slot(kind, cls, label=True):
    alt = ' alt="PEPTICITY"' if label else ' alt=""'
    return (f'<div class="{cls}" data-pep-logo="{kind}" role="img" aria-label="PEPTICITY">'
            f'<img class="pep-logo-fallback" src="vendor/pep-logo-blue-{"mark" if kind == "mark" else "lockup"}.png"{alt} decoding="async"></div>')


def store(page):
    p = os.path.join(page, 'index.html'); h = open(p).read()
    if MARK in h: print('already applied'); return
    files(page)
    css = CSS + """
/* the store: the lockup leads the hero; the compact one rides under the floating bar */
.pep-logo-hero { width: min(560px, 74vw); aspect-ratio: 4 / 1; margin: -14px auto 18px; }
.pep-logo-compact { position: absolute; left: 50%; top: calc(100% + 6px); width: 220px; aspect-ratio: 4 / 1; transform: translateX(-50%);
  opacity: 0; pointer-events: none; transition: opacity .35s ease; }
[data-module="header"][data-float]:not([data-tuck]) .pep-logo-compact { opacity: 1; }
@media (max-width: 899px) { .pep-logo-hero { width: min(330px, 84vw); margin: -18px auto 10px; } .pep-logo-compact { width: 150px; } }
"""
    h = h.replace('</head>', f'<style data-pep-src="{MARK}.css">\n{css}</style>\n</head>', 1)
    h = h.replace('<section data-module="hero" id="top" aria-labelledby="pep-hero-title">',
                  '<section data-module="hero" id="top" aria-labelledby="pep-hero-title">\n  ' + slot('lockup', 'pep-logo-hero'), 1)
    i = h.index('<header data-module="header">'); j = h.index('</header>', i)
    h = h[:j] + '  ' + slot('lockup', 'pep-logo-compact', label=False).replace('role="img" aria-label="PEPTICITY"', 'aria-hidden="true"') + '\n' + h[j:]
    h = h.replace('</body>', f'<script type="module" src="vendor/{MARK}.js"></script>\n</body>', 1)
    open(p, 'w').write(h); print('store ok')


def dash(page, sel_re, where='prepend', cls='pep-logo-dash', file='index.html', extra_css=''):
    p = os.path.join(page, file); h = open(p).read()
    if MARK in h: print('already applied', p); return
    files(page)
    h = h.replace('</head>', f'<style data-pep-src="{MARK}.css">\n{CSS}{extra_css}</style>\n</head>', 1)
    m = re.search(sel_re, h)
    if not m: raise SystemExit('anchor not found: ' + sel_re)
    s = slot('lockup', cls)
    h = {'before': h[:m.start()] + s + h[m.start():], 'after': h[:m.end()] + s + h[m.end():],
         'prepend': h[:m.end()] + s + h[m.end():]}[where]
    h = h.replace('</body>', f'<script type="module" src="vendor/{MARK}.js"></script>\n</body>', 1)
    open(p, 'w').write(h); print('dash ok', p)


if __name__ == '__main__':
    if sys.argv[1] == 'store': store(sys.argv[2])
    else: dash(sys.argv[2], sys.argv[3], *(sys.argv[4:5] or ['prepend']))

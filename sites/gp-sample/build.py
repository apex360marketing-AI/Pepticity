#!/usr/bin/env python3
"""Assemble sites/gp-sample/index.html from the owner's real modules (never redrawn).

Sources (pulled verbatim):
  GLS-110, TXT-106       docs/s1-proof/vault/effect-picks__*.html  (Effects Vault, slug d201758f...)
  3D type engine         brand/font/type3d-engine.js + brand/font/glyphs.json
  P mark path            brand/logo/p-mark.svg
  Lenis                  vendor/lenis.min.js
Run:  python3 sites/gp-sample/build.py
"""
import base64, json, os, re

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
HERE = os.path.dirname(__file__)
rd = lambda *p: open(os.path.join(ROOT, *p), encoding='utf-8').read()

def vault(name, sid_css='apx-module-css', sid_js='apx-module-js'):
    s = rd('docs', 's1-proof', 'vault', name)
    css = re.search(r'<style id="%s">(.*?)</style>' % sid_css, s, re.S).group(1)
    js = re.search(r'<script id="%s">(.*?)</script>' % sid_js, s, re.S).group(1)
    return css, js

gcss, gjs = vault('effect-picks__gls-110-liquid-gold-pane.html')
tcss, tjs = vault('effect-picks__txt-106-raking-light-engrave.html')
LIB = os.path.join(HERE, 'lib-src')
def lib(code):
    d = os.path.join(LIB, code)
    return open(os.path.join(d, 'module.css'), encoding='utf-8').read(), open(os.path.join(d, 'module.js'), encoding='utf-8').read()
h101css, h101js = lib('HOV-101')
g105css, g105js = lib('GLS-105')

J = json.load(open(os.path.join(ROOT, 'brand', 'font', 'glyphs.json')))
glyphs = json.dumps({'kern': J['kern'], 'regular': J['regular']}, separators=(',', ':'))
font = base64.b64encode(open(os.path.join(ROOT, 'brand', 'font', 'PepticityBlack.woff2'), 'rb').read()).decode()
pmark = re.search(r' d="([^"]+)"', rd('brand', 'logo', 'p-mark.svg')).group(1)
lenis = rd('vendor', 'lenis.min.js')

engine = rd('brand', 'font', 'type3d-engine.js')
engine = re.sub(r'^export ', '', engine, flags=re.M)
engine = re.sub(r'^import .*$', '', engine, flags=re.M)
head = ("import * as THREE from 'three';\n"
        "import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';\n"
        "import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';\n")
scene = open(os.path.join(HERE, 'scene.js'), encoding='utf-8').read()
module = head + engine + '\n' + scene

t = open(os.path.join(HERE, 'template.html'), encoding='utf-8').read()
for k, v in {'FONT_B64': font, 'GLS110_CSS': gcss, 'TXT106_CSS': tcss, 'GLS110_JS': gjs, 'TXT106_JS': tjs,
             'HOV101_CSS': h101css, 'HOV101_JS': h101js, 'GLS105_CSS': g105css, 'GLS105_JS': g105js, 'GLYPHS_JSON': glyphs, 'PMARK_D': pmark, 'LENIS_JS': lenis, 'MODULE_JS': module}.items():
    t = t.replace('{{%s}}' % k, v)
open(os.path.join(HERE, 'index.html'), 'w', encoding='utf-8').write(t)
print('built', os.path.join(HERE, 'index.html'), len(t))

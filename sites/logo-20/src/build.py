#!/usr/bin/env python3
"""Builds sites/logo-20/index.html: inlines the font (base64), glyph data, the shared type3d engine and marks.js."""
import base64, json, os, re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.abspath(os.path.join(HERE, '..', '..', '..'))
FONT = os.path.join(ROOT, 'brand', 'font')

woff = base64.b64encode(open(os.path.join(FONT, 'PepticityBlack.woff2'), 'rb').read()).decode()
J = json.load(open(os.path.join(FONT, 'glyphs.json')))
glyphs = json.dumps({'kern': J['kern'], 'regular': {k: J['regular'][k] for k in 'PETICY'}}, separators=(',', ':'))
engine = open(os.path.join(FONT, 'type3d-engine.js')).read()
engine = re.sub(r'^export ', '', engine, flags=re.M)
engine = re.sub(r'^import .*$', '', engine, flags=re.M)
marks = open(os.path.join(HERE, 'marks.js')).read()
tpl = open(os.path.join(HERE, 'template.html')).read()

out = (tpl.replace('/*WOFF*/', woff).replace('/*GLYPHS*/', glyphs)
          .replace('/*ENGINE*/', engine).replace('/*MARKS*/', marks))
open(os.path.join(HERE, '..', 'index.html'), 'w').write(out)
print('ok', len(out))

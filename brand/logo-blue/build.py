#!/usr/bin/env python3
"""PEPTICITY LOGO · BLUE: writes pep-logo-blue.js (the renderer with marks.json inlined).
marks.json is copied unchanged from Apex_Agents_Bots design/logo/pepticity-flarecut (build.py there: the exact
PEPTICITY BLACK P with the FLARE CUT beam, and the PEPTICITY wordmark). Run: python3 build.py"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
marks = json.load(open(os.path.join(HERE, 'marks.json')))
keep = {'p': {k: marks['p'][k] for k in ('face', 'beam', 'rim', 'yb')}, 'word': marks['word'], 'wordRim': marks['wordRim']}
src = open(os.path.join(HERE, 'pep-logo-blue.src.js')).read()
out = src.replace('/*MARKS*/null', json.dumps(keep, separators=(',', ':')))
open(os.path.join(HERE, 'pep-logo-blue.js'), 'w').write(out)
print('ok', len(out))

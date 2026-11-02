#!/usr/bin/env python3
"""Builds docs/owner/confirm/index.html: ONE visual page of everything waiting on the owner (pictures, one-tap choices, talk/type notes).
Needs the shot files from the scratchpad (stage1 screenshots). Usage: python3 tools/build-confirm-page.py <stage1-shots-dir>"""
import sys, json, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from review_lib import uri, render
R = pathlib.Path(__file__).resolve().parent.parent; SH = pathlib.Path(sys.argv[1])
BASE = 'https://apex360marketing-ai.github.io/Pepticity/stage1/'
pcards = [('A','A: as it is','Width 0.91 x height',100,338),('A1','A1: a bit longer','1.05',350,588),('A2','A2: longer','1.12',601,838),('A3','A3: almost D','1.18',851,1089),('D','D: for comparison','1.26',1102,1340)]
logo = [dict(key=k, label=l, sub='width '+s if not s.startswith('Width') else s, img=uri(SH/'stage1/p.png', 640, (x0, 180, x1, 512))) for k, l, s, x0, x1 in pcards]
logo.append(dict(key='NONE', label='None of these', sub='say what you want', img=uri(SH/'stage1/p.png', 640, (100, 560, 1340, 900))))
fam = [('classic','CLASSIC, five ways','5 versions','classic.html'),('glass','GLASS MEDALLION','3 versions','glass.html'),('boss','THE BOSS','8 peptide marks','boss.html'),
       ('honeycomb','HONEYCOMB MEDALLION','8 colours','honeycomb.html'),('hive','EIGHT HONEYCOMBS','8 designs','hive.html'),('medallions','HEX MEDALLIONS','8 looks','medallions.html')]
coin = [dict(key=k, label=l, sub=s, img=uri(SH/f'stage1/{k}.png', 900, (0, 0, 1440, 900))) for k, l, s, _ in fam]
coin.append(dict(key='KEEP', label='Keep the current coin', sub='for now', img=uri(SH/'stage1/glass.png', 400, (0, 0, 1440, 900), 30)))
O = R / 'docs/owner'
items = [
 dict(id='logo', title='YOUR NEW P', ask='Which P is yours? (Live: ' + BASE + 'p.html)', thumbs=logo, link=BASE + 'p.html'),
 dict(id='coin', title='THE COIN / MEDALLION (replaces the spinning coin)', ask='Which family is yours? Say the number inside it in the note. All live: ' + BASE, thumbs=coin, link=BASE),
 dict(id='publish', title='PUBLISH PREVIEWS', ask='May I publish clickable previews (marked preview, never touching /site/) so you get links? Nothing goes live without this.',
      options=[dict(key='YES', label='YES PUBLISH PREVIEWS'), dict(key='NO', label='NO, PICTURES ONLY')]),
 dict(id='versions', title='THE 8 VERSIONS (live, working sites)', ask='Same site, 8 colours, 7 different effects each. Built and checked on desktop and phone.', images=[uri(O/'versions-sheets/00-overview.png', 1400)],
      options=[dict(key='ALL', label='PUBLISH ALL 8'), dict(key='SOME', label='PUBLISH SOME (say numbers)'), dict(key='HOLD', label='HOLD')]),
 dict(id='glass', title='GLASS SAMPLE: see-through, colour on edges only', ask='Hero and reading text, before and after (blue). Colour coverage 2.6% (limit 5%).', images=[uri(O/'site-one-sample/before-after-blue.png', 1100)],
      options=[dict(key='ROLL', label='ROLL OUT TO THE WHOLE SITE'), dict(key='STRONGER', label='STRONGER EDGES'), dict(key='SOFTER', label='SOFTER'), dict(key='HOLD', label='HOLD')]),
 dict(id='loader', title='LOADING FILM: 7.5 s, luster, smooth hand-off', ask='Before (top) and after (bottom). A completely new front video comes later; this is the interim.', images=[uri(O/'site-one-sample/loader-before-after.png', 1600)],
      options=[dict(key='KEEP', label='KEEP THIS FOR NOW'), dict(key='REDO', label='RE-RENDER ENDING (Higgsfield, ~17.5 credits)'), dict(key='HOLD', label='HOLD')]),
 dict(id='briefing', title='STARTUP BRIEFING (so no session builds blind)', ask='Every new session reads these 9 points first.',
      lines=['S1 your two top rules (locked means locked; Claude makes no decisions)','S2 files to read first','S3 the APEX arsenal check','S4 skills to load','S5 your notes and brain','S6 never without your OK','S7 how to talk to you','S8 browser proof before "done"','S9 first-message check-in'],
      options=[dict(key='APPROVE', label='APPROVE ALL AS IS'), dict(key='CHANGE', label='CHANGE (say what)'), dict(key='LATER', label='LATER')]),
 dict(id='skills', title='6 NEW SKILLS (already created, saved)', ask='So the build looks expensive, scrolls smoothly and collects leads.',
      lines=['premium-restraint: accent only on edges, with a colour-coverage checker','clear-glass-spec: completely see-through glass, with a pixel test','4d-direction: 3D that reacts to pointer, scroll and time','lead-hook-proof: every form and hook tested end to end','luxury-benchmark: compare against top award sites before you see it','smooth-scroll-audit: measured scroll speed and soft stops'],
      options=[dict(key='APPROVE', label='KEEP ALL 6'), dict(key='CHANGE', label='CHANGE (say what)')]),
]
spec = dict(id='confirm-1', title='PEPTICITY Review',
  intro='Everything waiting on you, in pictures. <b>Tap any picture</b> to approve it, change it, reject it, drop a pin on the exact spot and comment (type or TALK). Your answers save for Claude by themselves.',
  running='<b>Running now, nothing to confirm:</b> bot gallery (15 designs), business plan (3 stages, 3/6/12 months), vitamins and protein/creatine research (done).', items=items)
a, b = render(spec, R / 'docs/owner/confirm')
print(len(items), 'cards,', round(a.stat().st_size / 1e6, 2), 'MB ->', a)

#!/usr/bin/env python3
"""Click-to-approve review page for 9-gold and 10-platinum (standard: skill owner-review-page). Needs docs/owner/versions-sheets/raw/<n-slug>-{hero,read,choose,cards,phone}.png"""
import sys, json, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from review_lib import uri, render
R = pathlib.Path(__file__).resolve().parent.parent; RAW = R / 'docs/owner/versions-sheets/raw'
def card(slug, n, title, ask):
    meta = json.loads((R / f'sites/versions/{slug}/version.json').read_text())
    shots = [uri(RAW / f'{slug}-{k}.png', 1100 if k != 'phone' else 420) for k in ['hero', 'read', 'choose', 'cards', 'phone']]
    lines = [f"{e['code']} {e['name']}: {e['where']}" for e in meta['effects']]
    return dict(id=slug, title=title, ask=ask, images=shots, lines=lines,
                options=[dict(key='approve', label='APPROVE THIS ONE'), dict(key='change', label='CHANGE (comment on the pictures)'), dict(key='hold', label='HOLD')])
items = [
 card('9-gold', 9, 'VERSION 9 · CHROME GOLD', 'Hero, reading text, HOW WE CHOOSE, text-alerts card, phone. Pale chrome gold on edges and key words only. Glass fully see-through.'),
 card('10-platinum', 10, 'VERSION 10 · CHROME PLATINUM', 'Same five pictures. Mirror-bright platinum on edges, glints and key words only. Glass fully see-through.'),
 dict(id='gp-pick', title='WHICH DO YOU LIKE BETTER?', ask='Tap the one you prefer.', thumbs=[
   dict(key='gold', label='9 · CHROME GOLD', sub='hero', img=uri(RAW / '9-gold-hero.png', 700)),
   dict(key='platinum', label='10 · CHROME PLATINUM', sub='hero', img=uri(RAW / '10-platinum-hero.png', 700))],
   options=[dict(key='both', label='BOTH ARE GOOD'), dict(key='neither', label='NEITHER, REDO')]),
]
spec = dict(id='gold-platinum-1', title='PEPTICITY Gold and Platinum',
  intro='The two new versions. <b>Tap any picture</b> to approve, change or reject it, drop a pin on the exact spot and comment (type or TALK). Your answers save for Claude by themselves.',
  items=items)
a, b = render(spec, R / 'docs/owner/gold-platinum')
print(round(a.stat().st_size / 1e6, 2), 'MB ->', b)

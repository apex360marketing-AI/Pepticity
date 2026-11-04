#!/usr/bin/env python3
"""Fail if a CLIENT page carries any owner screen, data, code or route.
Skill: .claude/skills/client-view-isolation    usage: python3 tools/leak_scan.py <client.html> [...]
"""
import sys, re

MARKERS = {
    'owner DOM': ['id="view-owner"', 'id="vswitch"', 'id="p-money"', 'id="p-sales"', 'id="kMonth"', 'id="expForm"',
                  'id="custTbl"', 'id="moneyTbl"', 'id="ownerMsgs"', 'id="platGrid"', 'id="deskTbl"',
                  'id="dropForm"', 'id="labTbl"', 'class="qacts"', 'data-view="owner"'],
    'owner data': ['SEED_EXP', 'var CUST', 'unitCost', 'COGS', 'cost:', 'units:', 'var REFS', 'var PLAT',
                   'var DESK', 'var EMAIL', 'var SIGNUPS', 'var MREV', '2614.37', 'Card processing fees',
                   "'pepticity-studio-demo-v1'"],
    'owner code': ['RENDER.sales', 'RENDER.money', 'RENDER.customers', 'RENDER.omsg', 'RENDER.referrals',
                   'RENDER.marketing', 'RENDER.delight', 'RENDER.odrops', 'RENDER.olab', 'addProductForm',
                   'receiveForm', 'function csv('],
    'owner route': ["setView('owner'", "h==='owner'", '#owner'],
    'owner copy': ['MONEY + TAXES', 'GRACE (OWNER)', 'NET PROFIT', 'UNIT COST', 'YOUR STUDIO', 'GOOD AFTERNOON, GRACE',
                   'Email the waitlist on arrival', 'on the restock list', "' units'"],
    'other customers': ['Marcus T.', 'Sofia L.', 'Nadia F.', 'Aaron B.', 'Elena R.', 'Mississauga, ON'],
}

bad = 0
for path in sys.argv[1:]:
    s = open(path, encoding='utf-8').read()
    hits = [(k, m, s.count(m)) for k, ms in MARKERS.items() for m in ms if m in s]
    if hits:
        bad += 1
        print(f'LEAK  {path}')
        for k, m, n in hits:
            i = s.index(m)
            print(f'   [{k}] {m!r} x{n}  …{re.sub(chr(10), " ", s[max(0, i-50):i+60])}…')
    else:
        print(f'CLEAN {path}  ({sum(len(v) for v in MARKERS.values())} owner markers checked)')
sys.exit(1 if bad else 0)

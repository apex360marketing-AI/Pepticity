#!/usr/bin/env python3
"""Build Grace's CLIENT dashboard from the owner dashboard with the owner side removed.

Skill: .claude/skills/client-view-isolation
  source : sites/dashboard/index.html         (owner + client, Grace's page, keeps the switch)
  output : sites/dashboard-client/index.html  (client only; no owner DOM, data, code or route)

Every cut is anchored and asserted: if the owner page changes shape the build stops
instead of quietly shipping owner data. Re-run after every owner dashboard change, then
run tools/leak_scan.py on the output.
"""
import json, re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = pathlib.Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / 'sites/dashboard/index.html'
OUT = pathlib.Path(sys.argv[2]) if len(sys.argv) > 2 else ROOT / 'sites/dashboard-client/index.html'
s = SRC.read_text()


def cut(start, end, repl='', keep_end=True):
    """Replace text from `start` (inclusive) up to `end` (exclusive unless keep_end=False)."""
    global s
    i = s.index(start)
    j = s.index(end, i + len(start))
    if not keep_end:
        j += len(end)
    s = s[:i] + repl + s[j:]


def sub(old, new, count=1):
    global s
    assert s.count(old) >= 1, 'anchor missing: ' + old[:90]
    s = s.replace(old, new, count)


# ---------------- HTML ----------------
s, n = re.subn(r'<title>[^<]*</title>', '<title>MY ACCOUNT · PEPTICITY</title>', s, count=1)
assert n == 1, 'title missing'
# the owner/client switch: clients have one view only
sw = re.search(r'<div class="[^"]*vswitch" id="vswitch"', s)
assert sw, 'view switch missing'
i = sw.start(); depth = 0
for tag in re.finditer(r'<(/?)div\b', s[i:]):
    depth += -1 if tag.group(1) else 1
    if depth == 0:
        j = i + tag.end() + s[i + tag.end():].index('>') + 1
        break
s = s[:i] + s[j:]   # only the switch itself; neighbours (YOUR COLOUR dial, sound) stay
# the whole owner view
cut('<!-- ===================== OWNER ===================== -->', '</main>', keep_end=False)

# ---------------- DATA: client-safe product list (no cost, units sold, stock counts) ----------------
m = re.search(r"// \[name, size, sale, unitCost.*?\n(var P = \[\n.*?\]\.map\(.*?\);\n)", s, re.S)
assert m, 'product table missing'
rows = re.findall(r" \['([^']*)','([^']*)',(\d+),(\d+),(\d+),(\d+),(\d+),(\d+)\]", m.group(1))
assert len(rows) >= 20, 'product rows not parsed'
P = []
for name, size, price, _cost, _units, on, rop, _wl in rows:
    on, rop = int(on), int(rop)
    P.append({'name': name, 'size': size, 'price': int(price),
              'status': 'out' if on <= 0 else ('low' if on <= rop else 'ok')})
cut('// [name, size, sale, unitCost', '\nvar CUST = [',
    '/* client-safe shop list: name, size, price and in/low/out only */\nvar P = ' + json.dumps(P, ensure_ascii=False) + ';\n')

# other customers, email list, sign-ups, expenses: gone. Only this client's own thread stays.
jordan = re.search(r" jordan:\[\n(.*?)\n \],", s, re.S)
assert jordan, 'client thread missing'
cut('\nvar CUST = [', '/* ---------- STATE',
    '\nvar SEED_MSGS = {\n jordan:[\n' + jordan.group(1) + '\n ]\n};\n\n')

# state: own storage key (never reads the owner's saved expenses or receipts), no expenses
sub("var KEY='pepticity-studio-demo-v1';", "var KEY='pepticity-client-demo-v1';")
sub(" exp:SEED_EXP.slice(),", '')
sub("unread:{owner:{jordan:1,elena:1},client:0}, view:'owner', tab:{owner:'sales',client:'orders'},",
    "unread:{client:0}, view:'client', tab:{client:'orders'},")
sub("var SKEYS=['msgs','exp',", "var SKEYS=['msgs',")
sub("  o.exp=S.exp.map(function(x){var y=Object.assign({},x);if(y.file)y.file={name:y.file.name,type:y.file.type};return y});\n", '')

# ---------------- ROUTER: client only, the hash cannot open anything else ----------------
cut('function setView(v,fromHash){', '\nfunction setTab(group,id){',
    "function setView(){\n  S.view='client';\n  $('#view-client').classList.add('on');\n"
    "  if(location.hash){try{history.replaceState(null,'',location.pathname+location.search)}catch(e){}}\n"
    "  setTab('client',S.tab.client||'orders');\n}\n")
sub("  if(id==='omsg'){S.unread.owner[activeThread]=0;save();updateBadges();renderThreads()}\n", '')
sub("  if(id==='cmsg'){S.unread.client=0;save();updateBadges()}", "  if(id==='cmsg'){S.unread.client=0;save()}")
cut('function updateBadges(){', '/* ---------- RENDERERS', 'function updateBadges(){}\n\n')

# ---------------- OWNER CODE ----------------
cut('RENDER.sales=function(){', 'var stockF=')                         # sales + revenue chart
cut('RENDER.stock=function(){', '/* ---------- MESSAGES')                 # stock table, reorder, customers
cut('var activeThread=', 'function bubble(')                            # owner inbox
cut('function renderThreads(){', 'RENDER.cmsg=function(')
sub("S.msgs.jordan.push({f:'c',t:v,at:now()});S.unread.owner.jordan=(S.unread.owner.jordan||0)+1;",
    "S.msgs.jordan.push({f:'c',t:v,at:now()});")
sub("save();RENDER.cmsg(true);RENDER.omsg();updateBadges();", "save();RENDER.cmsg(true);")
cut('/* ---------- MONEY + TAXES', '/* ---------- CLIENT VIEW')              # money, expenses, tax, CSV
cut('function mailNote(p)', '/* ---------- QUICK ACTIONS')               # owner shelves + waitlist mail
cut('function showNew(name){', '/* ---------- COPY')                     # add product, receive stock
cut('/* ---------- OWNER: REFERRALS', '/* ---------- SHARED V3 HELPERS')   # referrals + marketing
cut('RENDER.olab=function(){', '/* ---------- TRUST')                     # lab uploads
cut('/* ---------- OWNER: SURPRISE', '/* ---------- SILHOUETTES')          # delight desk, drops admin
# the bottle drawer's owner-shelf extras (stock counts, waitlist size, waitlist email) never ship
sub("+(o.units?' · '+p.onHand+' units':'')", '')
s, n = re.subn(r"\n  if\(o\.coming\)\{var n=esc\(p\.name\).*?\n.*?'</span>'\}", '', s, count=1, flags=re.S)
assert n == 1, 'bottle owner extras not stripped'
# lot list keeps lot + date only (units received is stock data)
s, n = re.subn(r"(\['[A-Z]{2}-\d{4}-[A-Z]','[^']*'),\d+\]", r"\1]", s)
assert n >= 6, 'lot table not stripped'

# ---------------- INIT ----------------
sub("$('#todayStr').textContent=new Date().toLocaleDateString('en-CA',{weekday:'long',month:'long',day:'numeric',year:'numeric'});\n", '')
cut("setView(h==='client'?'client':'owner',true);", 'window.__pep=', 'setView();\n')
sub("window.__pep={S:S,P:P,setView:setView,setTab:setTab};", "window.__pep={setTab:setTab};")

# ---------------- ADD-ON MODULES (colour version: client comms) ----------------
# Grace's announcement composer lists every client; the client build only knows itself.
s, n = re.subn(r"var CLIENTS = \[\n\s*\{ k: 'jordan'[^\n]*\n.*?\n\s*\];",
               "var CLIENTS = [\n    { k: 'jordan', name: 'Jordan M.', tier: 'RESERVE' }\n  ];", s, flags=re.S)
# other clients' delivery ratings are Grace's to read, not another client's
s, n2 = re.subn(r"checkins: \[\n.*?\n\s*\]\n", "checkins: []\n", s, flags=re.S)
assert (n == 0) == (n2 == 0), 'comms module only half stripped'
if n:
    # there is no owner side to jump to
    sub("function goOwner(tab, then) {", "function goOwner(tab, then) { return;")

OUT.write_text(s)
print('client dashboard built:', OUT, f'{len(s):,} bytes')

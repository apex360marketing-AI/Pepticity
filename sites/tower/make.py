"""PEPTICITY TOWER samples, built from the owner's favourite APEX Descent (dark + light).
Black-and-white city; the only colour on the page is the peptide's own light: the lit window, the light that
leads the camera down, and the real photographed vial at the end of the dive.
Usage: python3 -I make.py  ->  dist/tower-dark.html, dist/tower-light.html (+ media copied)"""
import pathlib, re, shutil, json
HERE = pathlib.Path(__file__).resolve().parent
SRC = pathlib.Path('/home/user/Apex_Agents_Bots/design/landing-options')
PEP = HERE.parent.parent
INV = (PEP / 'shared/inventory.js').read_text()

VARIANTS = {
    'dark':  dict(src='apex-bp8.html',  title='PEPTICITY Tower', photo='t1.jpg', pep='#d4ff3a', rgb='212,255,58', hex='0xd4ff3a',
                  ui='#f2f1ee', uiglow='rgba(242,241,238,.32)', ink='#f2f1ee', pos='68% 50%', mpos='67% 50%'),
    'light': dict(src='apex-bp8l.html', title='PEPTICITY Tower Light', photo='t2.jpg', pep='#d8263c', rgb='216,38,60', hex='0xd8263c',
                  ui='#111215', uiglow='rgba(17,18,21,.18)', ink='#111215', pos='66% 50%', mpos='66% 50%'),
}

def sub(s, old, new, count=1):
    if old not in s: raise SystemExit('anchor not found: ' + old[:70])
    return s.replace(old, new, count)

def build(key, v):
    s = (SRC / v['src']).read_text()
    s = re.sub(r'<title>[^<]*</title>', '<title>%s</title>' % v['title'], s, 1)
    # ---------- header ----------
    s = sub(s, '<a class="wordmark" href="#top" data-link><i aria-hidden="true"></i>APEX</a>', '<a class="wordmark" href="#top" data-link><i aria-hidden="true"></i>PEPTICITY</a>')
    s = sub(s, '<nav class="navlinks" aria-label="Main"><a href="#skyline" data-link>Industries</a><a href="#journey" data-link>How it works</a><a href="#pricing" data-link>Pricing</a></nav>',
               '<nav class="navlinks" aria-label="Main"><a href="#journey" data-link>How it works</a><a href="#skyline" data-link>The list</a><a href="#promise" data-link>Lot testing</a><a href="#pricing" data-link>Membership</a></nav>')
    s = sub(s, '<a class="plate getleads" href="#area" data-link><span class="ring" aria-hidden="true"></span>Get leads</a>', '<a class="plate getleads" href="#area" data-link><span class="ring" aria-hidden="true"></span>Start</a>')
    # ---------- hero ----------
    s = sub(s, '<p class="kicker rv-hero">Verified &middot; exclusive &middot; <b>33 industries</b></p>', '<p class="kicker rv-hero">Clinician-led &middot; pharmacy-prepared &middot; <b>lot-tested</b></p>')
    s = sub(s, '<h1 id="heroTitle">Somewhere down there, a customer is asking for you.</h1>', '<h1 id="heroTitle">Follow one vial from the skyline to your door.</h1>')
    s = re.sub(r'<p class="sub rv-hero">APEX finds.*?</p>', '<p class="sub rv-hero"><strong>PEPTICITY is clinician-guided peptide care.</strong> A licensed clinician decides if a plan is right for you, a licensed partner pharmacy prepares it, and every vial carries a lot code you can look up. Scroll, and follow one vial down.</p>', s, 1, re.S)
    s = sub(s, '<a class="plate big" href="#area" data-link><span class="ring" aria-hidden="true"></span>Check my area</a><a class="textlink" href="#journey" data-link>Follow a lead &darr;</a>',
               '<a class="plate big" href="#area" data-link><span class="ring" aria-hidden="true"></span>Start my free assessment</a><a class="textlink" href="#journey" data-link>Follow the vial &darr;</a>')
    s = sub(s, '<section class="journey" id="journey" aria-label="How a lead reaches you">', '<section class="journey" id="journey" aria-label="How a vial reaches you">')
    # ---------- the six steps ----------
    steps = [
        ('Assess', 'You take the free assessment.', 'Your goals, your age range and the medicines you take. <b>No payment, no commitment.</b> One window in the skyline lights up.'),
        ('Review', 'A licensed clinician reads it.', 'A real clinician <b>reviews your answers</b>, may ask for labs, and decides if a plan is right for you.'),
        ('Decide', 'A clear yes or no.', 'You get the reasons either way. If peptides aren&rsquo;t right for you, <b>you pay nothing</b>. [Confirm policy with Grace]'),
        ('Prepare', 'A licensed pharmacy prepares it.', 'Filled to your prescription by a <b>licensed partner pharmacy</b>, never a research-chemical supplier.'),
        ('Test', 'Every lot is tested.', 'Each lot gets a certificate of analysis. <b>The lot code on your vial</b> opens it.'),
        ('Deliver', 'It arrives cold, at your door.', 'Sealed, insulated and shipped cold, with <b>a person to call</b> at [phone number].'),
    ]
    arts = ''.join('<article class="step"><p class="snum"><b>0%d</b> / 06 &middot; %s</p><h2>%s</h2><p class="sbody">%s</p></article>' % (i + 1, n, h, b) for i, (n, h, b) in enumerate(steps))
    s = re.sub(r'(<div class="stepcard" id="stepcard">).*?(</div>\s*<div class="rail")', lambda m: m.group(1) + '\n        ' + arts + '\n      ' + m.group(2), s, 1, re.S)
    s = sub(s, "['Capture', 'Consent', 'Verify', 'Qualify', 'Match', 'Deliver']", "['Assess', 'Review', 'Decide', 'Prepare', 'Test', 'Deliver']")
    s = re.sub(r"const FLOORS = \[.*?\];", """const FLOORS = [
    { k: '33', l: 'Rooftop', s: 'Start' },
    { k: '30', l: 'Your assessment', s: '01 · Assess', step: 0 }, { k: '25', l: 'The clinician', s: '02 · Review', step: 1 },
    { k: '19', l: 'Yes or no', s: '03 · Decide', step: 2 }, { k: '14', l: 'The pharmacy', s: '04 · Prepare', step: 3 },
    { k: '08', l: 'The lot test', s: '05 · Test', step: 4 }, { k: 'G', l: 'Your door', s: '06 · Deliver', step: 5 },
    { k: 'PL', l: 'The list', s: 'All peptides', sel: '#skyline' }, { k: 'LT', l: 'Lot testing', s: 'Check us', sel: '#promise' },
    { k: '$', l: 'Membership', s: 'One price', sel: '#pricing' }, { k: 'GO', l: 'Start', s: 'Free assessment', sel: '#area' },
  ];""", s, 1, re.S)
    # ---------- the list: every peptide is a lit window ----------
    s = re.sub(r'<section class="block" id="skyline">.*?</section>', '''<section class="block" id="skyline">
    <div class="wrap" style="position:relative">
      <div class="skyline-head">
        <div><p class="kicker rv">The list</p><h2 class="h2 rv">Every peptide is a lit window.</h2><p class="lede rv">Point at a window to see what each one is and the sizes on the list. What it does and whether it is right for you is a question for a licensed clinician.</p></div>
        <div class="filters rv" role="group" aria-label="Filter the list" id="filters"><button type="button" data-f="all" aria-pressed="true">All</button><button type="button" data-f="recovery" aria-pressed="false">Recovery</button><button type="button" data-f="longevity" aria-pressed="false">Longevity</button><button type="button" data-f="metabolic" aria-pressed="false">Metabolic</button></div>
      </div>
      <div class="facade" id="facade"></div>
      <div class="wtip" id="wtip" role="status" aria-live="polite"></div>
    </div>
  </section>''', s, 1, re.S)
    s = re.sub(r'<section class="block" id="promise">.*?</section>', '''<section class="block" id="promise">
    <div class="wrap promise-in">
      <div><p class="kicker rv">Lot testing</p><h2 class="h2 rv">Don&rsquo;t trust us. Check us.</h2><p class="lede rv">Every lot is tested before it is released. The code printed on your vial opens that lot&rsquo;s certificate.</p></div>
      <div class="plaque rv"><span class="screw" style="left:14px;top:14px"></span><span class="screw" style="right:14px;bottom:14px"></span>
        <ol><li><span><b>Find the lot code</b> printed on the back of your vial.</span></li><li><span><b>Enter it</b> in the lot lookup on our site.</span></li><li><span><b>Read the certificate:</b> identity, purity, sterility and endotoxin. [Sample data in this preview]</span></li></ol>
      </div>
    </div>
  </section>''', s, 1, re.S)
    s = re.sub(r'<section class="block" id="pricing">.*?</section>', '''<section class="block" id="pricing">
    <div class="wrap">
      <p class="kicker rv">Membership</p><h2 class="h2 rv">Start free. Pay only if a plan is right.</h2>
      <div class="prices rv">
        <div class="price"><h3>Free review</h3><p class="for">Every plan starts here</p><p class="amt">$0</p><ul><li>The free assessment</li><li>A licensed clinician reviews it</li><li>A clear yes or no, with reasons</li></ul></div>
        <div class="price"><h3>Membership</h3><p class="for">Only if a plan is prescribed</p><p class="amt">$[xx] / month</p><ul><li>Clinician care and follow-ups</li><li>Pharmacy-prepared, lot-tested, shipped cold</li><li>Cancel in two clicks</li></ul></div>
      </div>
    </div>
  </section>''', s, 1, re.S)
    s = re.sub(r'<section class="block" id="area">.*?</section>', '''<section class="block" id="area">
    <div class="wrap area-in">
      <div><p class="kicker rv">Start</p><h2 class="h2 rv">What are you looking into peptides for?</h2><p class="lede rv">Pick one and tell us where you live. You don&rsquo;t need a workout routine to start, and a licensed clinician decides if a plan is right for you.</p></div>
      <form class="check rv" id="check" novalidate>
        <div class="field"><label for="ind">I&rsquo;m looking into peptides for</label><select id="ind" required><option value="fitness">Fitness, training and recovery</option><option value="health">Overall health and wellbeing</option><option value="unsure">I&rsquo;m not sure yet</option></select></div>
        <div class="field"><label for="zip">Postal or ZIP code</label><input id="zip" autocomplete="postal-code" placeholder="e.g. V8W 1P6 or 90210" required></div>
        <button class="plate big" type="submit"><span class="ring" aria-hidden="true"></span>Start my free assessment</button>
        <p class="reply" id="reply" aria-live="polite"></p>
      </form>
    </div>
  </section>''', s, 1, re.S)
    s = re.sub(r'<div class="foot">.*?</div>', '<div class="foot"><span>PEPTICITY &middot; clinician-guided peptide care</span><span>Preview &middot; [Final legal copy to be approved by counsel.]</span></div><p class="disc">PEPTICITY is a care service. A licensed clinician decides if a plan is right for you, and plans are prepared by a licensed partner pharmacy. Compounded medicines are not FDA-approved. Nothing on this site is medical advice, and no result is promised. Lot data shown is sample data. [Final legal copy to be approved by counsel.]</p>', s, 1, re.S)
    # ---------- data: the list comes from the vetted inventory ----------
    s = re.sub(r'const IND = \[.*?(?=const MONTHS)', INV.replace('</script', '<\\/script') + '''
const GROUPN = Object.fromEntries(PEPINV.groups);
const IND = PEPINV.products.map(p => ({ name: p.name, cat: p.group, group: GROUPN[p.group] || '', range: p.sizes.join(' · '), what: p.what, peak: [] }));
function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }
const SAMPLE = [];
''', s, 1, re.S)
    s = sub(s, "fac.innerHTML = IND.map((it, i) => `<div class=\"wcell\"><button type=\"button\" class=\"win${it.cat === 'high' ? ' hi' : ''}\" data-i=\"${i}\" aria-label=\"${esc(it.name)}, lead value ${it.range}\">",
               "fac.innerHTML = IND.map((it, i) => `<div class=\"wcell\"><button type=\"button\" class=\"win\" data-i=\"${i}\" aria-label=\"${esc(it.name)}: ${esc(it.range)}\">")
    s = sub(s, "((a * 7919) % 33) - ((b * 7919) % 33)", "((a * 7919) % IND.length) - ((b * 7919) % IND.length)")
    s = re.sub(r"tip\.innerHTML = `<p class=\"t\">.*?`;", "tip.innerHTML = `<p class=\"t\">${esc(it.name)}</p><p class=\"c\">${esc(it.group)}</p><p class=\"v\">${esc(it.range)}</p><p class=\"w\">${esc(it.what)}</p>`;", s, 1, re.S)
    s = sub(s, "fac.addEventListener('click', e => { const w = e.target.closest('.win'); if (w) { showTip(w); $('ind').value = w.dataset.i; } });", "fac.addEventListener('click', e => { const w = e.target.closest('.win'); if (w) showTip(w); });")
    s = sub(s, "$('ind').innerHTML = IND.map((it, i) => `<option value=\"${i}\">${esc(it.name)}</option>`).join('');", "")
    s = re.sub(r"\$\('reply'\)\.innerHTML = `Thanks.*?`;", "$('reply').innerHTML = `Preview only: nothing was sent. On the live site this opens your free assessment, already set to <b>${esc($('ind').selectedOptions[0].textContent)}</b>, and checks that we ship to <b>${esc(code.toUpperCase())}</b>. [Availability check connects here]`;", s, 1, re.S)
    s = sub(s, "'Add your postal or ZIP code so we can check your area.'", "'Add your postal or ZIP code so we can check that we ship there.'")
    # ---------- the phone screen (seen for a moment before the photograph takes over) ----------
    for a, b in [("'APEX  ·  NOW'", "'PEPTICITY  ·  NOW'"), ("'New lead · Roofing'", "'Your plan has shipped'"), ("'Full tear-off, 2,400 sq ft'", "'Cold-packed and sealed'"),
                 ("'Consent recorded'", "'Lot PX-2611-A'"), ("'✓ VERIFIED'", "'LOT TESTED'"), ("'$500 – $5k'", "''"), ("'Exclusive to your business'", "'A person to call: [phone number]'"), ("'MATCHING TO YOUR AREA'", "'PREPARING YOUR PLAN'")]:
        s = sub(s, a, b)
    # ---------- the only colour: the peptide's light ----------
    s = s.replace('0xd4ff3a', v['hex']).replace('rgba(212,255,58,', 'rgba(%s,' % v['rgb']).replace("'#d4ff3a'", "'%s'" % v['pep'])
    # ---------- the photograph at the end of the dive ----------
    s = sub(s, '<div class="scrim" id="scrim" aria-hidden="true"></div>', '<div class="vialshot" id="vialshot" aria-hidden="true"><img src="media/%s" alt="" decoding="async"></div>\n<div class="scrim" id="scrim" aria-hidden="true"></div>' % v['photo'])
    s = sub(s, "    D.t = t;\n", "    D.t = t;\n    { const o = clamp((t - .43) / .07, 0, 1) * (1 - clamp((t - .78) / .07, 0, 1)); if (o !== vsLast) { vs.style.opacity = o.toFixed(3); vs.style.visibility = o > .001 ? 'visible' : 'hidden'; vsLast = o; } vsImg.style.transform = `scale(${(1.1 - .1 * clamp((t - .43) / .3, 0, 1)).toFixed(4)})`; }\n")
    s = sub(s, "  let lastScrim = -1;", "  let lastScrim = -1, vsLast = -1; const vs = $('vialshot'), vsImg = vs.querySelector('img');")
    s = sub(s, "<p class=\"sub rv-hero\">", "<p class=\"sub rv-hero\">", 1)
    css = '''
/* ===== PEPTICITY TOWER: monochrome chrome, the peptide is the only colour ===== */
:root{--lime:%(ui)s;--lime-glow:%(uiglow)s;--lime-ink:%(ink)s;--pep:%(pep)s;--pep-glow:rgba(%(rgb)s,.55)}
h1,h2,h3,.h2,.hero h1,.step h2,.price h3,.wtip .t,.wordmark{text-transform:uppercase}
.hero h1{letter-spacing:.02em;font-size:clamp(42px,7.4vw,112px);max-width:16ch}
.h2{letter-spacing:.02em;max-width:18ch}.step h2{letter-spacing:.03em;font-size:clamp(30px,3.2vw,44px)}
.wordmark{letter-spacing:.32em}
.vialshot{position:fixed;inset:0;z-index:1;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none}
.vialshot img{position:absolute;inset:0;width:100%%;height:100%%;object-fit:cover;object-position:%(pos)s;transform-origin:68%% 55%%;will-change:transform}
.vialshot::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,var(--ink) 0%%,transparent 46%%),linear-gradient(transparent 70%%,var(--ink));opacity:.55}
.facade{grid-template-columns:repeat(7,minmax(0,1fr))}
.facade .win:hover .pane,.facade .win:focus-visible .pane,.facade .win.sel .pane{background:radial-gradient(110%% 85%% at 50%% 72%%,rgba(%(rgb)s,.85),rgba(%(rgb)s,.35) 50%%,rgba(0,0,0,.35) 100%%);box-shadow:0 0 26px 0 var(--pep-glow)}
.wtip .v{color:var(--pearl);text-shadow:none;font-size:13px;letter-spacing:.06em}
.wtip .w{margin:0;font-size:14px;line-height:1.55;color:var(--silver)}
.wtip{width:300px}
.disc{margin:22px 0 0;max-width:90ch;font-size:12px;line-height:1.7;color:var(--muted)}
@media (max-width:980px){.facade{grid-template-columns:repeat(4,minmax(0,1fr))}}
@media (max-width:640px){.facade{grid-template-columns:repeat(3,minmax(0,1fr))}.vialshot{background:var(--ink)}.vialshot img{top:56px;bottom:auto;height:58vh;object-position:%(mpos)s}.vialshot::after{opacity:1;background:linear-gradient(var(--ink),transparent 14%%,transparent 52%%,var(--ink) 66%%)}}
''' % v
    s = sub(s, '</style>', css + '</style>')
    s = s.replace('tear-off', 'x')  # nothing of the old sample data should remain
    # keep the page pure ASCII so it never shows garbled characters, whatever the server's charset
    def esc(text, kind):
        def one(c):
            if ord(c) < 128: return c
            if kind == 'js': return ''.join('\\u%04x' % int.from_bytes(c.encode('utf-16-be')[i:i + 2], 'big') for i in range(0, len(c.encode('utf-16-be')), 2))
            if kind == 'css': return '\\%x ' % ord(c)
            return '&#%d;' % ord(c)
        return ''.join(one(c) for c in text)
    parts, pos = [], 0
    for m in re.finditer(r'(?is)(<script[^>]*>)(.*?)(</script>)|(<style[^>]*>)(.*?)(</style>)', s):
        parts.append(esc(s[pos:m.start()], 'html'))
        parts.append(m.group(1) + esc(m.group(2), 'js') + m.group(3) if m.group(1) else m.group(4) + esc(m.group(5), 'css') + m.group(6))
        pos = m.end()
    parts.append(esc(s[pos:], 'html')); s = ''.join(parts)
    out = HERE / 'dist'; out.mkdir(exist_ok=True)
    (out / ('tower-%s.html' % key)).write_text(s)
    return s

for k, v in VARIANTS.items():
    s = build(k, v)
    left = [w for w in ['APEX', 'lead', 'Roofing', 'industr'] if re.search(w, re.sub(r'<script type="importmap">.*?</script>', '', s), re.I)]
    print(k, len(s) // 1024, 'KB', 'leftover words:', left)
m = HERE / 'dist/media'; m.mkdir(exist_ok=True)
for f in ['t1.jpg', 't2.jpg', 't3.jpg', 't4.jpg']: shutil.copy(PEP / 'media/tower' / f, m / f)

"""PEPTICITY GLACIER sample, built from the APEX Descent Glacier (apex-n1).
Neutral frost and graphite; the only colour is the peptide's rose light (the lit window, the beacon, the
ticks in the window, the photographed vial at the end). The APEX chevron becomes a clear-glass PEPTICITY P."""
import pathlib, re, shutil, sys
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
HERE = pathlib.Path(__file__).resolve().parent
SRC = pathlib.Path('/home/user/Apex_Agents_Bots/design/landing-options/apex-n1.html')
PEP_RGB, PEP_HEX, PEP_CSS = '236,72,153', '0xec4899', '#ec4899'
NEUTRAL = '225,229,232'

def sub(s, old, new):
    if old not in s: raise SystemExit('anchor not found: ' + old[:80])
    return s.replace(old, new, 1)

s = SRC.read_text()
s = re.sub(r'<title>[^<]*</title>', '<title>PEPTICITY Glacier</title>', s, 1)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="PEPTICITY: clinician-guided peptide care, prepared by a licensed partner pharmacy, with a lot code you can look up on every vial.">', s, 1)
s = s.replace('%239fe7f5', '%23e3e7ea')
s = sub(s, '<circle class="cd" cx="12" cy="13.6" r="2"/></svg>APEX</a>', '<circle class="cd" cx="12" cy="13.6" r="2"/></svg>PEPTICITY</a>')
s = sub(s, '<nav class="sr" aria-label="Main"><a href="#industries" data-go>Industries</a><a href="#dive" data-go>How it works</a><a href="#pricing" data-go>Pricing</a><a href="#area" data-go>Get leads</a>',
           '<nav class="sr" aria-label="Main"><a href="#dive" data-go>How it works</a><a href="#returns" data-go>Lot testing</a><a href="#pricing" data-go>Membership</a><a href="#start" data-go>Start</a>')
# hero
s = sub(s, '<span class="pl pl3">One customer</span>', '<span class="pl pl3">One vial</span>')
s = sub(s, '<p class="kick rv-h">Verified &middot; Exclusive &middot; 33 industries</p>', '<p class="kick rv-h">Clinician-led &middot; Pharmacy-prepared &middot; Lot-tested</p>')
s = sub(s, '<h1 class="h1" id="h1" aria-label="Find the one customer asking for you.">Find the one customer <em>asking for you.</em></h1>', '<h1 class="h1" id="h1" aria-label="Peptide care you can see through.">Peptide care you can <em>see through.</em></h1>')
s = re.sub(r'<p class="sub rv-h">APEX sends.*?</p>', '<p class="sub rv-h"><b>PEPTICITY is clinician-guided peptide care.</b> A licensed clinician decides if a plan is right for you, a licensed partner pharmacy prepares it, and <b>every vial carries a lot code you can look up.</b></p>', s, 1, re.S)
s = sub(s, '<a class="drop fx" href="#area" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Check my area</span></a>\n        <a class="ghost" href="#dive" data-go><i class="ln" aria-hidden="true"></i><span>Watch one lead arrive</span></a>',
           '<a class="drop fx" href="#start" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Start my free assessment</span></a>\n        <a class="ghost" href="#dive" data-go><i class="ln" aria-hidden="true"></i><span>Follow one vial down</span></a>')
s = sub(s, '<path d="M-125 100L0-115 125 100H78L0-32-78 100z"/>', '<path d="M-62 112V-112H18A62 62 0 0 1 18 12H-18V112Z M-18-72V-28H18A22 22 0 0 0 18-72Z" fill-rule="evenodd"/>')
# steps
steps = [('Assess', 'You take the free assessment.', 'Your goals, your age range and the medicines you take. <b>No payment, no commitment.</b> One window in the city lights up.'),
         ('Review', 'A licensed clinician reads it.', 'A real clinician <b>reviews your answers</b>, may ask for labs, and decides if a plan is right for you.'),
         ('Decide', 'A clear yes or no.', 'You get the reasons either way. If peptides aren&rsquo;t right for you, <b>you pay nothing</b>. <span class="ph">[Confirm policy with Grace]</span>'),
         ('Prepare', 'A licensed pharmacy prepares it.', 'Filled to your prescription by a <b>licensed partner pharmacy</b>, never a research-chemical supplier.'),
         ('Test', 'Every lot is tested.', 'Each lot gets a certificate of analysis. <b>The lot code on your vial</b> opens it.'),
         ('Deliver', 'It arrives cold, at your door.', 'Sealed, insulated and shipped cold, with <b>a person to call</b> at [phone number].')]
arts = ''.join('<article class="st"><p class="st-n"><b>0%d</b> &middot; %s</p><h2>%s</h2><p>%s</p></article>' % (i + 1, n, h, b) for i, (n, h, b) in enumerate(steps))
s = re.sub(r'(<div class="visor">).*?(</div>\s*<ol class="segs")', lambda m: m.group(1) + '\n          ' + arts + '\n        ' + m.group(2), s, 1, re.S)
s = re.sub(r'<ol class="segs" aria-hidden="true">.*?</ol>', '<ol class="segs" aria-hidden="true">' + ''.join('<li><span>0%d</span><em>%s</em><i><b></b></i></li>' % (i + 1, n) for i, (n, _, _) in enumerate(steps)) + '</ol>', s, 1, re.S)
s = sub(s, 'aria-label="How it works: one lead, six steps"', 'aria-label="How it works: one vial, six steps"')
# sections
s = re.sub(r'<section class="sec" id="area">.*?</section>', '''<section class="sec" id="area">
      <div class="wrap center">
        <p class="kick rv">Where we ship</p>
        <h2 class="kh rv">Is PEPTICITY available where you live?</h2>
        <p class="lede rv">Tell us what you are looking into and where you live. A licensed clinician decides if a plan is right for you.</p>
        <div class="scope-stage">
          <div class="scopebig rv" id="scope" aria-hidden="true">
            <div class="sw"></div>
            <i class="blip" style="left:30%;top:30%;animation-delay:-3.3s"></i><i class="blip" style="left:70%;top:24%;animation-delay:-.7s"></i><i class="blip" style="left:78%;top:72%;animation-delay:-1.6s"></i><i class="blip" style="left:32%;top:76%;animation-delay:-2.4s"></i>
            <i class="you" id="you"></i>
            <span class="scope-l" id="scopeL">Checking where we ship</span>
          </div>
          <form class="check rv" id="check" novalidate>
            <div class="field"><label for="ind">I&rsquo;m looking into peptides for</label><select id="ind"><option value="fitness">Fitness, training and recovery</option><option value="health">Overall health and wellbeing</option><option value="unsure">I&rsquo;m not sure yet</option></select></div>
            <div class="field"><label for="zip">Postal or ZIP code</label><input id="zip" autocomplete="postal-code" placeholder="e.g. V8W 1P6 or 90210" required></div>
            <button class="drop fx" type="submit"><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Check</span></button>
          </form>
          <p class="reply" id="reply" aria-live="polite"></p>
        </div>
      </div>
    </section>''', s, 1, re.S)
s = re.sub(r'<section class="sec" id="pricing">.*?</section>', '''<section class="sec" id="pricing">
      <div class="wrap">
        <p class="kick rv">Membership</p>
        <h2 class="kh rv">Start free. Pay only if a plan is right.</h2>
        <p class="lede rv">You see the full price before you pay. Prices stay in brackets until Grace confirms them.</p>
        <div class="prices">
          <article class="pc fx rv" data-tilt><span class="fr"></span><h3>Free review</h3><p class="for">Every plan starts here</p><p class="amt">$0</p><p class="per">no payment to start</p><ul><li>The free assessment</li><li>A licensed clinician reviews it</li><li>A clear yes or no, with reasons</li></ul><a class="drop sm fx" href="#start" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Start free</span></a></article>
          <article class="pc fx rv" data-tilt style="--d:.12s"><span class="fr"></span><h3>Membership</h3><p class="for">Only if a plan is prescribed</p><p class="amt">$[xx]</p><p class="per">a month, all-in</p><ul><li>Clinician care and follow-ups</li><li>Pharmacy-prepared, lot-tested, shipped cold</li><li>Cancel in two clicks</li></ul><a class="drop sm fx" href="#start" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Start with the review</span></a></article>
          <article class="pc fx rv" data-tilt style="--d:.24s"><span class="fr"></span><h3>Annual</h3><p class="for">Everything in Membership</p><p class="amt">$[xx]</p><p class="per">a year</p><ul><li>Everything in Membership</li><li><span class="ph">[Annual saving: confirm with Grace]</span></li><li><span class="ph">[Family offer: confirm with Grace]</span></li></ul><a class="drop sm fx" href="#start" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Start with the review</span></a></article>
        </div>
      </div>
    </section>''', s, 1, re.S)
s = re.sub(r'<section class="sec" id="returns">.*?</section>', '''<section class="sec" id="returns">
      <div class="wrap center">
        <svg class="loop rv" viewBox="0 0 84 84" aria-hidden="true"><circle cx="42" cy="42" r="34"/><circle class="arc" cx="42" cy="42" r="34"/></svg>
        <p class="kick rv">Lot testing</p>
        <h2 class="kh rv">Don&rsquo;t trust us. Check us.</h2>
        <p class="lede rv">Every lot is tested before it is released. The code printed on your vial opens that lot&rsquo;s certificate.</p>
        <ul class="rlist">
          <li class="rv fx"><span class="rnum">01</span><b>Find the lot code on the back of your vial</b><span class="chip">PX-2611-A</span></li>
          <li class="rv fx" style="--d:.08s"><span class="rnum">02</span><b>Enter it in the lot lookup</b><span class="chip">Look up</span></li>
          <li class="rv fx" style="--d:.16s"><span class="rnum">03</span><b>Read identity, purity, sterility and endotoxin</b><span class="chip">Certificate</span></li>
        </ul>
        <p class="note rv">Lot data in this preview is sample data. [Independent lab: confirm with Grace]</p>
      </div>
    </section>''', s, 1, re.S)
s = re.sub(r'<section class="sec cta" id="start">.*?</section>', '''<section class="sec cta" id="start">
      <div class="rings" aria-hidden="true"><i></i><i></i><i></i></div>
      <div class="wrap" style="position:relative">
        <p class="kick rv" style="justify-content:center">Start</p>
        <h2 class="kh rv">What are you looking into peptides for?</h2>
        <p class="lede rv">Pick one. A few short questions follow, then a licensed clinician takes it from there. You don&rsquo;t need a workout routine to start.</p>
        <div class="ctas rv"><a class="drop fx" href="#area" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Fitness &amp; recovery</span></a><a class="drop fx" href="#area" data-go><span class="fr"></span><span class="dot" aria-hidden="true"></span><span class="lab">Overall health</span></a><a class="ghost" href="#top" data-go><i class="ln" aria-hidden="true"></i><span>Back to the surface</span></a></div>
      </div>
    </section>''', s, 1, re.S)
s = re.sub(r'<div class="foot">.*?</div>', '<div class="foot"><span>PEPTICITY &middot; clinician-guided peptide care</span><span>A licensed clinician decides if a plan is right for you</span><span>&copy; 2026 PEPTICITY &middot; [Legal links]</span></div><p class="disc">PEPTICITY is a care service. Plans are prepared by a licensed partner pharmacy. Compounded medicines are not FDA-approved. Nothing on this site is medical advice, and no result is promised. Lot data shown is sample data. [Final legal copy to be approved by counsel.]</p>', s, 1, re.S)
# menu: no industries
s = sub(s, "{ id: '#industries', l: 'Industries', s: 'All 33' },\n    { id: '#area', l: 'Area check', s: 'Is it open?' }, { id: '#pricing', l: 'Pricing', s: '[Your price]' }, { id: '#returns', l: 'Returns', s: 'Credit policy' }, { id: '#start', l: 'Get leads', s: 'Start here' }",
           "{ id: '#returns', l: 'Lot testing', s: 'Check us' },\n    { id: '#pricing', l: 'Membership', s: 'One price' }, { id: '#area', l: 'Where we ship', s: 'Check yours' }, { id: '#start', l: 'Start', s: 'Free assessment' }")
s = sub(s, "$('ind').innerHTML = IND.map((it, i) => `<option value=\"${i}\"${i === 12 ? ' selected' : ''}>${esc(it.name)}</option>`).join('');", "")
s = re.sub(r"\$\('reply'\)\.innerHTML = `Thanks\. We'll confirm whether.*?`;", "$('reply').innerHTML = `Preview only: nothing was sent. On the live site this opens your free assessment, set to <b>${esc($('ind').selectedOptions[0].textContent)}</b>, and checks that we ship to <b>${esc(code.toUpperCase().slice(0, 12))}</b>. <span class=\"ph\">[Availability check connects here]</span>`;", s, 1, re.S)
s = sub(s, "'Add your postal or ZIP code so we can check your area.'", "'Add your postal or ZIP code so we can check that we ship there.'")
s = sub(s, "$('spGo').addEventListener('click', () => { $('ind').value = S.sel; });", "")
s = sub(s, "rows.addEventListener('click', e => { const r = e.target.closest('.row'); if (!r) return; setSel(+r.dataset.i, true); $('ind').value = r.dataset.i; });", "rows.addEventListener('click', e => { const r = e.target.closest('.row'); if (!r) return; setSel(+r.dataset.i, true); });")
# the window: a PEPTICITY assessment instead of a lead
s = sub(s, "const ROWS = ['Consent recorded · [date, time]', 'Checked real · phone and email', 'Checked serious · job, timing, budget', 'Matched · one business in this area', 'Sent to your phone and CRM'];",
           "const ROWS = ['Reviewed by a licensed clinician', 'A clear yes or no, with reasons', 'Prepared by a licensed partner pharmacy', 'Lot tested · certificate on file', 'Shipped cold to your door'];")
s = sub(s, "ig.fillText('NEW REQUEST · ROOFING', 296, 115);", "ig.fillText('YOUR ASSESSMENT · FITNESS', 296, 115);")
s = sub(s, "ig.fillText('“Can someone fix a leak', 124, 190); ig.fillText('in my roof this week?”', 124, 240);", "ig.fillText('“I don’t work out right now.', 124, 190); ig.fillText('Where do I start?”', 124, 240);")
s = sub(s, "bg.addColorStop(0, '#1c3038');", "bg.addColorStop(0, '#2a2d31');")
# the P: a clear-glass PEPTICITY mark with chrome bevels
s = sub(s, "const cs = new THREE.Shape(); [[-1.25, -1], [0, 1.15], [1.25, -1], [.78, -1], [0, .3], [-.78, -1]].forEach(([x, y], i) => i ? cs.lineTo(x, y) : cs.moveTo(x, y)); cs.closePath();",
           "const cs = new THREE.Shape(); cs.moveTo(-.62, -1.12); cs.lineTo(-.62, 1.12); cs.lineTo(.18, 1.12); cs.absarc(.18, .5, .62, Math.PI / 2, -Math.PI / 2, true); cs.lineTo(-.18, -.12); cs.lineTo(-.18, -1.12); cs.closePath();\n  { const hp = new THREE.Path(); hp.moveTo(-.18, .72); hp.lineTo(.18, .72); hp.absarc(.18, .5, .22, Math.PI / 2, -Math.PI / 2, true); hp.lineTo(-.18, .28); hp.closePath(); cs.holes.push(hp); }")
s = sub(s, "color: 0xbfe9f2, metalness: 0, roughness: .06, transparent: true, opacity: .58, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.8, emissive: 0x9fe7f5, emissiveIntensity: .14",
           "color: 0xf1f3f4, metalness: 0, roughness: .06, transparent: true, opacity: .55, clearcoat: 1, clearcoatRoughness: .03, envMapIntensity: 1.8, emissive: 0xffffff, emissiveIntensity: .05")
s = sub(s, "vec3 ice=vec3(.6,.86,.93);", "vec3 ice=vec3(.84,.86,.88);")
s = sub(s, "vec3 col=mix(vec3(.92,.96,.98),vec3(.62,.9,.96),vT*.85);", "vec3 col=vec3(.93,.94,.95);")
s = sub(s, "g.fillStyle = r < density * .04 ? '#9fe7f5' : r < density * .7 ? '#dbe7ec' : '#7d8a93';", "g.fillStyle = r < density * .04 ? '#f2f4f5' : r < density * .7 ? '#dbe0e3' : '#7d848a';")
s = sub(s, "halo.material.opacity = .16 + .1 * (1 - hk);", "halo.material.opacity = 0;   // the P is the brand, not a peptide: no coloured halo")
# colour: UI chrome neutral, the peptide light rose
style_end = s.index('</style>')
head, rest = s[:style_end], s[style_end:]
head = head.replace('rgba(159,231,245,', 'rgba(%s,' % NEUTRAL).replace('#9fe7f5', '#e3e7ea').replace('#9fc9d4', '#c9ced2')
rest = rest.replace("'rgba(159,231,245,", "'rgba(%s," % PEP_RGB).replace('rgba(159,231,245,', 'rgba(%s,' % PEP_RGB).replace('0x9fe7f5', PEP_HEX).replace("'#9fe7f5'", "'%s'" % PEP_CSS)
s = head + rest
# the photograph at the bottom of the dive
s = sub(s, '<div class="depthline" aria-hidden="true"></div>', '<div class="vialshot" id="vialshot" aria-hidden="true"><img src="media/t3.jpg" alt="" decoding="async"></div>\n<div class="depthline" aria-hidden="true"></div>')
s = sub(s, "    S.p = p;\n", "    S.p = p;\n    { const o = clamp((S.t - .8) / .08, 0, 1) * (1 - clamp((y - dEnd) / (vh * .6), 0, 1)); if (o !== vsLast) { vs.style.opacity = o.toFixed(3); vs.style.visibility = o > .001 ? 'visible' : 'hidden'; vsLast = o; } vsImg.style.transform = `scale(${(1.08 - .08 * clamp((S.t - .8) / .2, 0, 1)).toFixed(4)})`; }\n")
s = sub(s, "  let lastY = -1, lastT = performance.now(), nativeV = 0;", "  let lastY = -1, lastT = performance.now(), nativeV = 0, vsLast = -1; const vs = $('vialshot'), vsImg = vs.querySelector('img');")
css = '''
/* ===== PEPTICITY GLACIER: neutral frost; the peptide is the only colour ===== */
h1,h2,h3,.h1,.kh,.st h2,.pc h3,.spec-n,.mark{text-transform:uppercase}
.h1{letter-spacing:.01em}.kh{letter-spacing:.01em}
.vialshot{position:fixed;inset:0;z-index:1;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;background:#0b0d10}
.vialshot img{position:absolute;left:0;top:-10%;width:100%;height:100%;object-fit:cover;object-position:50% 50%;transform-origin:50% 45%;will-change:transform}
.vialshot::after{content:"";position:absolute;inset:0;background:linear-gradient(transparent 60%,rgba(11,13,16,.85)),radial-gradient(120% 90% at 50% 45%,transparent 55%,rgba(0,0,0,.6))}
#industries{display:none}
.disc{margin:18px auto 0;max-width:90ch;font-size:12px;line-height:1.7;color:var(--mute);text-align:center}
@media (max-width:899px){.vialshot img{top:40px;bottom:auto;height:62vh;object-position:50% 50%}.vialshot::after{background:linear-gradient(#0b0d10,transparent 12%,transparent 55%,#0b0d10 68%)}}
'''
s = sub(s, '</style>', css + '</style>')
# ASCII-safe
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
(HERE / 'dist/tower-glacier.html').write_text(s)
vis = re.sub(r'(?is)<script.*?</script>|<style.*?</style>', '', s)
print('glacier', len(s) // 1024, 'KB; leftover:', [w for w in ['APEX', 'lead', 'Roofing', 'industr', 'customer'] if re.search(w, vis, re.I)])

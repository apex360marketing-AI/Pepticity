"""PEPTICITY YOUR AREA sample, built from APEX 'Your area. Your leads.' (apex-n3).
Smoke-and-bone chrome; the only colour is the peptide's ember light: your care area glowing on the map and the
photographed vial at the end of the descent."""
import pathlib, re
HERE = pathlib.Path(__file__).resolve().parent
SRC = pathlib.Path('/home/user/Apex_Agents_Bots/design/landing-options/apex-n3.html')
def sub(s, old, new):
    if old not in s: raise SystemExit('anchor not found: ' + old[:80])
    return s.replace(old, new, 1)
s = SRC.read_text()
s = re.sub(r'<title>[^<]*</title>', '<title>PEPTICITY Your Area</title>', s, 1)
s = re.sub(r'<meta name="description" content="[^"]*">', '<meta name="description" content="PEPTICITY: a licensed clinician near you, a licensed partner pharmacy, and a vial that arrives cold at your door with a lot code you can look up.">', s, 1)
s = s.replace('aria-label="APEX home"', 'aria-label="PEPTICITY home"').replace('<circle cx="14" cy="14" r="2.4"/></svg>APEX</a>', '<circle cx="14" cy="14" r="2.4"/></svg>PEPTICITY</a>')
s = sub(s, '<a class="fis sm" href="#area" data-mag><span class="lava"></span><span class="crack"></span>Check my area<svg', '<a class="fis sm" href="#claim" data-mag><span class="lava"></span><span class="crack"></span>Start<svg')
# hero
s = sub(s, '<section id="descent" aria-label="Your area, your leads">', '<section id="descent" aria-label="Your city, your clinician, your vial">')
s = sub(s, '''<h1 class="h1" id="h1" aria-label="Your area. Your leads. Nobody else's.">
        <span class="ln l1" aria-hidden="true">Your area.</span>
        <span class="ln l2" aria-hidden="true">Your leads.</span>
        <span class="ln o" aria-hidden="true">Nobody else's.</span>''', '''<h1 class="h1" id="h1" aria-label="Your city. Your clinician. Your vial.">
        <span class="ln l1" aria-hidden="true">Your city.</span>
        <span class="ln l2" aria-hidden="true">Your clinician.</span>
        <span class="ln o" aria-hidden="true">Your vial.</span>''')
s = sub(s, '<span class="kick hk">Exclusive local leads</span>', '<span class="kick hk">Clinician-guided peptide care</span>')
s = re.sub(r'<p class="sub">APEX sends.*?</p>', '<p class="sub"><b>PEPTICITY</b> connects you with <b>a licensed clinician</b>. A licensed partner pharmacy prepares your plan, every lot is tested, and it arrives <b>cold at your door</b>. <span class="ph">[Service areas: confirm with Grace]</span></p>', s, 1, re.S)
s = sub(s, '<a class="fis" href="#area" data-mag><span class="lava"></span><span class="crack"></span>Check my area<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></a>\n          <a class="fis ghost" href="#how" data-mag>',
           '<a class="fis" href="#claim" data-mag><span class="lava"></span><span class="crack"></span>Start my free assessment<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></a>\n          <a class="fis ghost" href="#how" data-mag>')
caps = [('01 · The map', 'Continent', 'People everywhere are looking into peptides.', 'Most of what is sold online is &ldquo;for research use only&rdquo;. PEPTICITY starts with a licensed clinician instead.'),
        ('02 · Care areas', 'Region', 'Care is organised region by region.', 'Each region is served by licensed clinicians and a licensed partner pharmacy. <span class="ph">[Service areas: confirm with Grace]</span>'),
        ('03 · Your clinician', 'City', 'A licensed clinician reviews your answers.', 'They may ask for labs, and they decide if a plan is right for you. A clear yes or no, with the reasons.'),
        ('04 · Street level', 'Street', 'Prepared, tested and sealed.', 'A licensed partner pharmacy prepares it. Every lot is tested, and the lot code goes on your vial.'),
        ('05 · Delivered', 'Your door', 'It arrives cold, at your door.', 'Packed in an insulated case, with a person to call at [phone number].')]
for (no, lvl, h, p), m in zip(caps, re.finditer(r'<article class="cap glass" data-p="[^"]*">.*?</article>', s, re.S)):
    pass
arts = list(re.finditer(r'(<article class="cap glass" data-p="[^"]*">).*?(</article>)', s, re.S))
for (no, lvl, h, p), m in reversed(list(zip(caps, arts))):
    extra = '\n        <img class="capvial" src="media/t4.jpg" alt="A PEPTICITY vial on a black-and-white city map, lit ember red" loading="lazy">\n        <div class="lead" data-leadcopy></div>' if lvl == 'Your door' else ''
    s = s[:m.start()] + m.group(1) + '\n        <div class="no"><span>%s</span><span>%s</span></div>\n        <h2>%s</h2>\n        <p>%s</p>%s\n      ' % (no, lvl, h, p, extra) + m.group(2) + s[m.end():]
s = sub(s, '<li>Continent</li><li>Region</li><li>City</li><li>Street</li><li>Lead</li>', '<li>Continent</li><li>Region</li><li>City</li><li>Street</li><li>Your door</li>')
s = sub(s, '<span class="plabel own" id="lblOwn" aria-hidden="true">Your territory</span>', '<span class="plabel own" id="lblOwn" aria-hidden="true">Your care area</span>')
s = s.replace('<span class="plabel oth" id="lblA" aria-hidden="true">Another business</span>', '<span class="plabel oth" id="lblA" aria-hidden="true">Another region</span>').replace('<span class="plabel oth" id="lblB" aria-hidden="true">Another business</span>', '<span class="plabel oth" id="lblB" aria-hidden="true">Another region</span>')
s = re.sub(r'const leadHTML = `.*?`;', '''const leadHTML = `<div class="lc-h"><span class="sample">Sample</span><time>just now</time></div>
    <div class="lc-t">Your PEPTICITY plan</div><div class="lc-s">Cold-packed and sealed</div>
    <div class="lc-a"><span class="ph">[Your street]</span>, <span class="ph">[Your city]</span></div>
    <ul class="lc-c"><li>Reviewed by a licensed clinician</li><li>Prepared by a licensed partner pharmacy</li><li>Lot PX-2611-A tested</li><li>A person to call: [phone number]</li></ul>
    <div class="lc-d"><span>Text</span><span>Email</span></div>`;''', s, 1, re.S)
# how it works: six layers
layers = [('Assess', 'You take the free assessment: your goals, your age range and the medicines you take.', '<span class="sample">Sample</span><q>I don&rsquo;t work out right now. Where do I start?</q>'),
          ('Review', 'A licensed clinician reads it, and may ask for labs.', 'Clinician network: <span class="ph">[confirm with Grace]</span>'),
          ('Decide', 'A clear yes or no, with the reasons. If it is a no, you pay nothing.', '<span class="ph">[Confirm policy with Grace]</span>'),
          ('Prepare', 'A licensed partner pharmacy prepares it, never a research-chemical supplier.', 'Pharmacy: <span class="ph">[name and licence: confirm with Grace]</span>'),
          ('Test', 'Every lot is tested, and the lot code on your vial opens its certificate.', 'Lab: <span class="ph">[independent lab: confirm with Grace]</span>'),
          ('Deliver', 'Shipped cold to your door, with follow-ups and a person to call.', 'Phone: [phone number]')]
lay = ''.join('<div class="layer" data-rv><span class="seam"></span><span class="n">0%d</span><h3>%s</h3><p>%s</p><div class="ex">%s</div></div>' % (i + 1, h, p, ex) for i, (h, p, ex) in enumerate(layers))
s = re.sub(r'(<div class="strata" id="strata">\s*<div class="vent" aria-hidden="true"><span class="flow"></span><span class="bead"></span></div>).*?(</div>\s*</div>\s*</section>)', lambda m: m.group(1) + '\n      ' + lay + '\n    ' + m.group(2), s, 1, re.S)
s = sub(s, '<h2 id="howH" data-split>From their request <em>to your phone.</em></h2></div>\n      <p>Six layers between a stranger\'s question and your next job. Every lead passes through all of them before it reaches you.</p>',
           '<h2 id="howH" data-split>From your answers <em>to your door.</em></h2></div>\n      <p>Six layers between your first question and a vial at your door. A licensed clinician decides if a plan is right for you.</p>')
# area
s = sub(s, '<div><span class="kick">Check your area</span><h2 id="areaH" data-split>Is your area <em>still open?</em></h2></div>\n      <p>Type your city or postcode and pick your industry. We will show you how a territory check looks.</p>',
           '<div><span class="kick">Where we ship</span><h2 id="areaH" data-split>Is PEPTICITY <em>in your area?</em></h2></div>\n      <p>Type your city or postcode and pick what you are looking into. We will show you how the check looks.</p>')
s = sub(s, '<label for="cInd">Your industry</label><select id="cInd" name="industry" aria-describedby="cPre"></select>', '<label for="cInd">I&rsquo;m looking into peptides for</label><select id="cInd" name="focus" aria-describedby="cPre"><option value="fitness">Fitness, training and recovery</option><option value="health">Overall health and wellbeing</option><option value="unsure">I&rsquo;m not sure yet</option></select>')
s = sub(s, 'Check my area<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></button>\n        <p class="fine">This page shows a <b>sample</b> result only. Real availability is confirmed by <span class="ph">[your team]</span>.</p>',
           'Check<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></button>\n        <p class="fine">Preview only: nothing is sent. Real availability is confirmed by <span class="ph">[the care team]</span>.</p>')
s = sub(s, "$('cInd').innerHTML = IND.map((d, i) => `<option value=\"${i}\">${esc(d.name)}</option>`).join('');\n  $('cInd').value = '12';", '')
s = sub(s, "const city = $('cCity').value.trim(), ind = IND[+$('cInd').value];", "const city = $('cCity').value.trim(), ind = { name: $('cInd').selectedOptions[0].textContent };")
s = re.sub(r"res\.innerHTML = `<span class=\"sample\">Sample result</span>.*?`;", "res.innerHTML = `<span class=\"sample\">Sample result</span><div class=\"rt\"></div><p>Preview only: nothing was sent. On the live site this opens your free assessment for <b>${esc(ind.name)}</b>. <span class=\"ph\">[Service areas: confirm with Grace]</span></p>`;", s, 1, re.S)
s = sub(s, "res.querySelector('.rt').innerHTML = `<span></span>: territory <b>available</b>`;", "res.querySelector('.rt').innerHTML = `<span></span>: <b>sample check</b>`;")
# pricing, lot testing, start
s = re.sub(r'<div class="plans">.*?</div>\s*<p class="pfoot">.*?</p>', '''<div class="plans">
      <article class="plan glass" data-i="0" data-rv><span class="k">Plan 01</span><h3>Free review</h3><p class="pr">$0 <small>/ to start</small></p><ul><li>The free assessment</li><li>A licensed clinician reviews it</li><li>A clear yes or no, with reasons</li></ul></article>
      <article class="plan glass" data-i="1" data-rv><span class="k">Plan 02</span><h3>Membership</h3><p class="pr">$[xx] <small>/ month</small></p><ul><li>Only if a plan is prescribed</li><li>Clinician care and follow-ups</li><li>Pharmacy-prepared, lot-tested, shipped cold</li></ul></article>
      <article class="plan glass" data-i="2" data-rv><span class="k">Plan 03</span><h3>Annual</h3><p class="pr">$[xx] <small>/ year</small></p><ul><li>Everything in Membership</li><li><span class="ph">[Annual saving: confirm with Grace]</span></li><li><span class="ph">[Family offer: confirm with Grace]</span></li></ul></article>
    </div>
    <p class="pfoot">You see the full price before you pay. Cancel in two clicks. <span class="ph">[Confirm pricing with Grace]</span></p>''', s, 1, re.S)
s = sub(s, '<div><span class="kick">Pricing</span><h2 id="priceH" data-split>Simple plans. <em>No shared leads.</em></h2></div>\n      <p>Prices are set per industry and area. The numbers below are placeholders until your plan is confirmed.</p>',
           '<div><span class="kick">Membership</span><h2 id="priceH" data-split>Start free. <em>Pay only if a plan is right.</em></h2></div>\n      <p>Every plan begins with a free review by a licensed clinician. Prices stay in brackets until Grace confirms them.</p>')
s = sub(s, '<div><span class="kick">Returns &amp; credit</span><h2 id="retH" data-split>If a lead isn\'t right, <em>tell us.</em></h2></div>\n      <p>Our returns policy goes here once it is final. Until then, every line below is a placeholder.</p>',
           '<div><span class="kick">Lot testing</span><h2 id="retH" data-split>Don&rsquo;t trust us. <em>Check us.</em></h2></div>\n      <p>Every lot is tested before it is released. The code printed on your vial opens that lot&rsquo;s certificate.</p>')
s = re.sub(r'<div class="side glass"><span class="kick">What counts as a bad lead</span>.*?</div>\s*<div class="side glass"><span class="kick">What you get</span>.*?</div>',
           '<div class="side glass"><span class="kick">On every vial</span><h3>Find your lot code</h3><ul><li>Printed on the back panel, under the peptide name</li><li>Example: PX-2611-A</li><li>One code per tested lot</li></ul></div>\n      <div class="side glass"><span class="kick">On every certificate</span><h3>What you can check</h3><ul><li>Identity and purity</li><li>Sterility and endotoxin</li><li>Sample data in this preview. <span class="ph">[Independent lab: confirm with Grace]</span></li></ul></div>', s, 1, re.S)
s = sub(s, '<span class="kick" data-rv>Get leads</span>\n    <h2 id="claimH" data-rv="clip"><span>Claim</span><span class="o">your area.</span></h2>\n    <p data-rv>When your area is yours, its leads are yours. Check if it is open, then talk to us about <span class="ph">[next step]</span>.</p>',
           '<span class="kick" data-rv>Start</span>\n    <h2 id="claimH" data-rv="clip"><span>Start</span><span class="o">your free review.</span></h2>\n    <p data-rv>What are you looking into peptides for? Fitness or overall health, a licensed clinician takes it from there. You don&rsquo;t need a workout routine to start.</p>')
s = sub(s, '<a class="fis" href="#area" data-mag><span class="lava"></span><span class="crack"></span>Check my area<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></a>\n      <a class="fis ghost" href="#claim" data-mag><span class="lava"></span><span class="crack"></span>Talk to us: <span class="ph">[phone or email]</span></a>',
           '<a class="fis" href="#area" data-mag><span class="lava"></span><span class="crack"></span>Fitness &amp; recovery<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></a>\n      <a class="fis" href="#area" data-mag><span class="lava"></span><span class="crack"></span>Overall health<svg class="arr" viewBox="0 0 18 10" aria-hidden="true"><path d="M0 5h16M12 1l4 4-4 4"/></svg></a>\n      <a class="fis ghost" href="#claim" data-mag><span class="lava"></span><span class="crack"></span>Talk to a person: [phone number]</a>')
s = sub(s, '<nav aria-label="Footer"><a href="#industries">Industries</a><a href="#how">How it works</a><a href="#pricing">Pricing</a><a href="#area">Get leads</a></nav>', '<nav aria-label="Footer"><a href="#how">How it works</a><a href="#returns">Lot testing</a><a href="#pricing">Membership</a><a href="#claim">Start</a></nav>')
s = sub(s, '<span>Map, leads and results shown are samples. <span class="ph">[Company legal name]</span> &middot; <span class="ph">[Privacy policy]</span></span>' if '<span>Map, leads and results shown are samples. <span class="ph">[Company legal name]</span> &middot;' in s else '<span>Map, leads and results shown are samples. <span class="ph">[Company legal name]</span> · <span class="ph">[Privacy policy]</span></span>',
           '<span>A licensed clinician decides if a plan is right for you. Plans are prepared by a licensed partner pharmacy. Compounded medicines are not FDA-approved. Nothing here is medical advice; the map and lot data are samples. [Final legal copy to be approved by counsel.]</span>')
s = sub(s, "const MENU = [['Surface', '#top'], ['How it works', '#how'], ['Industries', '#industries'], ['Check your area', '#area'], ['Pricing', '#pricing'], ['Returns', '#returns'], ['Get leads', '#claim']];",
           "const MENU = [['Surface', '#top'], ['How it works', '#how'], ['Where we ship', '#area'], ['Membership', '#pricing'], ['Lot testing', '#returns'], ['Start', '#claim']];")
# the photograph at the bottom of the descent
s = sub(s, '<canvas id="gl" aria-hidden="true"></canvas>', '<canvas id="gl" aria-hidden="true"></canvas>\n<div class="vialshot" id="vialshot" aria-hidden="true"><img src="media/t4.jpg" alt="" decoding="async"></div>')
s = sub(s, "    N3.pT = p;\n", "    N3.pT = p;\n    { const o = sstep(.86, .95, p) * (1 - sstep(N3.dH - vh * .2, N3.dH + vh * .3, sy - N3.dTop)); if (Math.abs(o - vsLast) > .002) { vs.style.opacity = o.toFixed(3); vs.style.visibility = o > .002 ? 'visible' : 'hidden'; document.documentElement.classList.toggle('vs', o > .35); vsLast = o; } vsImg.style.transform = `scale(${(1.08 - .08 * sstep(.86, 1, p)).toFixed(4)})`; }\n")
s = sub(s, "  let lastStage = -1, lastHero = -1;", "  let lastStage = -1, lastHero = -1, vsLast = -1; const vs = $('vialshot'), vsImg = vs.querySelector('img');")
# colour: chrome goes smoke and bone; the ember stays only in the GL map (your care area) and the photograph
NEU = {'#ff6a3d': '#e8e2da', '#e0462a': '#bdb6ae', '#7a2112': '#3a3633', '#6e1e12': '#2a2725', '#ffd2c2': '#f4efe9', '#ffd9cc': '#f4efe9',
       'rgba(255,106,61,': 'rgba(232,226,218,', 'rgba(224,70,42,': 'rgba(189,182,174,', 'rgba(110,30,18,': 'rgba(60,57,54,', 'rgba(60,18,12,': 'rgba(30,28,27,', '%23ff6a3d': '%23e8e2da', '%23e0462a': '%23bdb6ae'}
i = s.index('</style>'); head, rest = s[:i], s[i:]
for a, b in NEU.items(): head = head.replace(a, b)
s = head + rest
css = '''
/* ===== PEPTICITY YOUR AREA: smoke and bone; the peptide's ember is the only colour ===== */
h1,h2,h3,.h1,.cap h2,.layer h3,.plan h3,.logo,#topo b{text-transform:uppercase}
.vialshot{position:fixed;inset:0;z-index:2;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;background:#0b0a0a}
.vialshot img{position:absolute;left:-26%;top:-4%;width:100%;height:100%;object-fit:cover;object-position:64% 50%;transform-origin:40% 50%;will-change:transform}
.vialshot::after{content:"";position:absolute;inset:0;background:linear-gradient(270deg,#0b0a0a 26%,rgba(11,10,10,.6) 40%,transparent 58%),linear-gradient(transparent 72%,rgba(11,10,10,.8))}
html.vs .plabel,html.vs .leader{opacity:0!important;transition:opacity .4s}
#leadCard{display:none!important}
.capvial{display:block;width:calc(100% + 36px);max-width:none;margin:16px -18px 4px;aspect-ratio:4/3;object-fit:cover;object-position:68% 50%}
html.cine .capvial{display:none}
#industries{display:none}
@media (min-width:900px){.h1{font-size:clamp(40px,7vw,120px)}.hk{top:calc(104px + 7.4vw)}}
.shead h2{font-size:clamp(34px,4.2vw,64px)}
@media (max-width:899px){.vialshot img{left:0;top:40px;height:60vh;object-position:68% 50%}.vialshot::after{background:linear-gradient(#0b0a0a,transparent 12%,transparent 52%,#0b0a0a 64%)}}
'''
s = sub(s, '</style>', css + '</style>')
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
(HERE / 'dist/tower-area.html').write_text(s)
vis = re.sub(r'(?is)<script.*?</script>|<style.*?</style>|<section class="sec" id="industries".*?</section>|<div id="dx".*?(?=<script)', '', s)
print('area', len(s) // 1024, 'KB; leftover:', [w for w in ['APEX', 'lead', 'territor', 'industr', 'roof'] if re.search(w, vis, re.I)])

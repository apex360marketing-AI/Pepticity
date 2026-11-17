#!/usr/bin/env python3
"""Round 4 fixes (audit-and-harden x2, Nov 15). Runs after apply_r3.py and BEFORE apply_sec.py (which re-hashes scripts).
R4-SEC-2: the frame cover's 'open in its own tab' link was built from location.pathname; a '//host' path made it point
off-site and a malformed path threw before the cover opened. Build it from location.href (always this page, this
origin) without query and fragment, and never let it throw.
usage: apply_r4.py IN.html OUT.html"""
import sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
old = "      out.href = new URL(win.location.pathname, win.location.origin).href;\n"
new = ("      try { out.href = String(win.location.href).split('#')[0].split('?')[0]; }   // this page, this origin, no query\n"
       "      catch (err) { out.href = '/'; }\n")
assert s.count(old) == 1, 'R4-SEC-2 anchor not found exactly once'
s = s.replace(old, new)

def sub(old, new, why, count=1):
    global s
    assert s.count(old) == count, '%s: anchor found %d times, wanted %d' % (why, s.count(old), count)
    s = s.replace(old, new)

# R4-P1 (owner, Nov 15 23:40): "make the P below the hero section roughly 25% smaller": the crest P's share of its stage x 0.75.
sub('data-lens="44" data-fill="0.565" data-fill-w="0.64"', 'data-lens="44" data-fill="0.424" data-fill-w="0.48" data-snap="2"', 'R4-P1 size')

# R4-P2 (owner): "It's not supposed to spin nice and slow. It's supposed to spin quite fast and then stop flat."
# Opt-in for a P whose view says snap: N. Each ask (arriving by scroll, click, key, pointer) is N full turns in N x 0.65 s,
# fast from the first frame and braking to a dead stop facing front; at rest it stays flat (no sway, no slow turn every 8 s).
# The header P and every other P are unchanged (no snap in their view).
sub("fillW: num(view.fillW, 0.9, 0.2, 0.95),\n", "fillW: num(view.fillW, 0.9, 0.2, 0.95), snap: num(view.snap, 0, 0, 4),\n", 'R4-P2 view')
sub("light: seen('light'), hit: hit, track: place };", "light: seen('light'), snap: seen('snap'), hit: hit, track: place };", 'R4-P2 crest view')
sub("if (e.pointerType !== 'touch') { s.spinT += Math.PI * 2; }", "if (e.pointerType !== 'touch' && !(s.view && s.view.snap && s.spinT - s.spin > 0.01)) { s.spinT += TURNS(s); }", 'R4-P2 enter')
sub("stage.addEventListener('click', function () { s.spinT += Math.PI * 2; kick(); });", "stage.addEventListener('click', function () { s.spinT += TURNS(s); kick(); });", 'R4-P2 click')
sub("e.preventDefault(); s.spinT += Math.PI * 2; kick(); } });", "e.preventDefault(); s.spinT += TURNS(s); kick(); } });", 'R4-P2 key')
sub("if (a.go && a.ok) { if (s.spinT - s.spin < Math.PI) { s.spinT += Math.PI * 2; } s.turnTo = s.spinT; kick(); }",
    "if (a.go && a.ok) { if (s.spinT - s.spin < Math.PI) { s.spinT += TURNS(s); } s.turnTo = s.spinT; kick(); }", 'R4-P2 governor ask')
sub("          if (kind === 'mark' && req.interactive) {\n",
    "          var TURNS = function (sl) { return Math.PI * 2 * (sl.view && sl.view.snap ? Math.round(sl.view.snap) : 1); };\n          if (kind === 'mark' && req.interactive) {\n", 'R4-P2 helper')
sub("              if (REDUCED) { s.group.rotation.set(-0.06, -0.36, 0); }\n              else {\n",
    "              if (REDUCED) { if (mv && mv.snap) { s.group.rotation.set(0, 0, 0); } else { s.group.rotation.set(-0.06, -0.36, 0); } }\n"
    "              else if (mv && mv.snap) {\n"
    "                // SNAP: a fast spin that brakes to a dead stop, then flat to the front (the room's light still travels over it)\n"
    "                if (s.snapTo !== s.spinT) { s.snapFrom = s.spin; s.snapTo = s.spinT; s.snapT0 = t; s.snapDur = Math.max(0.3, 0.65 * (s.spinT - s.spin) / (Math.PI * 2)); }\n"
    "                var su = Math.min(1, (t - s.snapT0) / s.snapDur);\n"
    "                s.spin = su >= 1 ? s.snapTo : s.snapFrom + (s.snapTo - s.snapFrom) * (1 - (1 - su) * (1 - su));\n"
    "                if (su < 1) { snapping = true; }\n"
    "                s.ry = s.spin; s.rx = 0;\n"
    "                s.group.rotation.set(0, s.ry, 0); s.group.position.y = 0;\n"
    "              }\n"
    "              else {\n", 'R4-P2 motion')
sub("          if (MOBILE && !REDUCED && shown && now - lastDraw < 30) { raf = requestAnimationFrame(frame); return; }\n          lastDraw = now;\n",
    "          if (MOBILE && !REDUCED && shown && !wasSnapping && now - lastDraw < 30) { raf = requestAnimationFrame(frame); return; }\n          lastDraw = now; var snapping = false;\n", 'R4-P2 full frame rate while it spins')
sub("          var anyVisible = false;\n          for (var j = 0; j < slots.length; j++) { if (slots[j].visible) { anyVisible = true; } }\n",
    "          wasSnapping = snapping;\n          var anyVisible = false;\n          for (var j = 0; j < slots.length; j++) { if (slots[j].visible) { anyVisible = true; } }\n", 'R4-P2 flag')
sub("        var raf = 0, last = performance.now(), t = 0, rw = 0, rh = 0, shown = false, lastDraw = 0, fno = 0, EDGEVP = new THREE.Vector4();\n",
    "        var raf = 0, last = performance.now(), t = 0, rw = 0, rh = 0, shown = false, lastDraw = 0, fno = 0, EDGEVP = new THREE.Vector4(), wasSnapping = false;\n", 'R4-P2 var')


# ================= BATCH 1: FOUNDERS (owner's go, Nov 16) =================
# R4-F1: the club is FOUNDERS RESERVE (tier PLATINUM RESERVE), not FOUNDER CIRCLE. Every place it is written.
n_circle = s.count('FOUNDER CIRCLE'); assert n_circle >= 20, 'R4-F1: FOUNDER CIRCLE count %d' % n_circle
s = s.replace('FOUNDER CIRCLE', 'FOUNDERS RESERVE')

# R4-F2 (owner: "go with 10%, not 15"): the refer-a-friend numbers and their fallbacks. The cart's team offer follows its config.
sub("referral: { givePercent: 15, getPercent: 15 },", "referral: { givePercent: 10, getPercent: 10 },", 'R4-F2 referral config')
sub("<span data-give>15</span>", "<span data-give>10</span>", 'R4-F2 give', 2)
sub("<span data-get>15</span>", "<span data-get>10</span>", 'R4-F2 get', 2)
sub("<span data-pct>15</span>", "<span data-pct>10</span>", 'R4-F2 cart', 2)

# R4-F3: the Founders section shows the APPROVED card (V1) and the laser engraves the name on it. Half the words, in points.
a = s.index('        <div class="pep-hooks-copy">\n          <p class="pep-hooks-eyebrow">FOUNDERS RESERVE</p>\n          <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-card-title"')
b = s.index('        <form class="pep-hooks-form" method="post" action="" data-hook="H63"')
new_copy = """        <h2 class="pep-fr-title" id="pep-hooks-card-title"><img src="assets/founders/title.webp" width="1500" height="430" alt="PEPTICITY PLATINUM FOUNDERS RESERVE" decoding="async"></h2>
        <div class="pep-hooks-copy">
          <div class="pep-hooks-cardwrap pep-fr-wrap">
            <div class="pep-fr-engraver" id="engraver" data-state="idle" data-demo="GRACE TAYLOR">
              <div class="pep-fr-stage" id="stage" data-card="1" role="img" aria-label="PEPTICITY Platinum Founders Reserve card, number 08 of 25">
                <img class="card is-on" data-card="1" src="assets/founders/card-1600.jpg" width="1600" height="905" alt="" loading="lazy" decoding="async">
                <canvas class="name" id="nameCanvas" aria-hidden="true"></canvas>
                <canvas class="fx" id="fxCanvas" aria-hidden="true"></canvas>
              </div>
              <p class="pep-fr-status" id="status" role="status" aria-live="polite"></p>
              <p class="pep-hero-sr" id="engraved" data-state="empty"></p>
              <div id="form" hidden><input id="nameInput" type="text" tabindex="-1" aria-hidden="true"></div>
              <button type="button" class="key-card" hidden tabindex="-1" aria-hidden="true" data-card="1" data-pen-x="482.3" data-cap-top="844.0" data-baseline="917.0" data-font-size="104.29" data-track="1.06" data-space="-1.88" data-max-x="1373.3"></button>
              <p class="pep-hooks-card-name" data-card-name data-empty data-placeholder="YOUR NAME" data-member="MEMBER" hidden>YOUR NAME</p>
            </div>
          </div>
        </div>

"""
s = s[:a] + new_copy + s[b:]
sub('              <p class="pep-hooks-hint" id="pep-hooks-card-first-hint">Written on your card as you type. Nothing is kept in your browser.</p>\n', '', 'R4-F3 hint out')
sub(' data-field="name" aria-describedby="pep-hooks-card-first-hint">', ' data-field="name" placeholder="YOUR NAME">', 'R4-F3 hint ref')
sub("""          </div>
        </form>
      </div>
    </div>
  </div>
</section>
<!-- HOOKS:END card -->""", """          </div>
        </form>

        <!-- owner, Nov 16: no wording in the section; two drop-downs, never both open (founders.js). With scripts off both read open. -->
        <div class="pep-fr-drops" data-fr-drops>
          <button type="button" class="pep-fr-key" id="pep-fr-key-q" aria-expanded="true" aria-controls="pep-fr-q"><span>HOW DO I QUALIFY?</span></button>
          <button type="button" class="pep-fr-key" id="pep-fr-key-b" aria-expanded="true" aria-controls="pep-fr-b"><span>BENEFITS</span></button>
          <div class="pep-fr-panel" id="pep-fr-q" role="region" aria-labelledby="pep-fr-key-q">
            <ol class="pep-fr-steps">
              <li><b>01</b><span>JOIN AND ENGRAVE YOUR NAME</span></li>
              <li><b>02</b><span>REFER TWO FRIENDS</span></li>
              <li><b>03</b><span>BOTH SIGN UP AND YOUR CARD IS EARNED</span></li>
            </ol>
          </div>
          <div class="pep-fr-panel" id="pep-fr-b" role="region" aria-labelledby="pep-fr-key-b">
            <ul class="pep-fr-steps">
              <li><b>25</b><span>NUMBERED CARDS, YOUR NAME LASER ENGRAVED</span></li>
              <li><b>1ST</b><span>ACCESS TO EVERY NEW LOT</span></li>
              <li data-gate="offer" hidden><b>10%</b><span>OFF FOR LIFE</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
<!-- HOOKS:END card -->""", 'R4-F7 drop-downs')
sub('<span class="pep-hooks-btn-word">MAKE MY CARD</span>', '<span class="pep-hooks-btn-word">ENGRAVE MY CARD</span>', 'R4-F3 button')

sub('<label class="pep-hooks-label" for="pep-hooks-card-first">FIRST NAME</label>', '<label class="pep-hooks-label" for="pep-hooks-card-first">YOUR NAME</label>', 'R4-F6 name label')
sub('id="pep-hooks-card-first" name="first_name" type="text" autocomplete="given-name" maxlength="20"', 'id="pep-hooks-card-first" name="first_name" type="text" autocomplete="name" maxlength="20"', 'R4-F6 full name')

# R4-F4 (owner: "not just email but phone too always"; "experience level ... multiple choice 3 options"): the card's form
# also asks a phone number and the experience level, with the text-message consent as its own unticked box.
sub("""            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-card-consent-err"></span>""",
"""            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-card-phone">PHONE</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-card-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="24" data-field="phone"></span>
            </div>
            <fieldset class="pep-fr-level">
              <legend class="pep-hooks-label">YOUR EXPERIENCE</legend>
              <label class="pep-fr-choice"><input type="radio" name="experience" value="new" data-field="experience"><span>NEW</span></label>
              <label class="pep-fr-choice"><input type="radio" name="experience" value="some" data-field="experience"><span>SOME</span></label>
              <label class="pep-fr-choice"><input type="radio" name="experience" value="experienced" data-field="experience"><span>EXPERIENCED</span></label>
            </fieldset>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_sms" data-consent-sms></span>
              <span class="pep-hooks-consent-text" data-consent-sms-text>Yes, PEPTICITY may text me about my card and restocks. I can stop any time.</span>
            </label>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-card-consent-err"></span>""", 'R4-F4 fields')
sub("        extra: function () { var v = cleanName(nameIn.value); return v ? { first_name: v } : null; },",
    "        extra: function () {\n"
    "          var o = {}, v = cleanName(nameIn.value), ph = q(form, '[data-field=\"phone\"]'), lv = form.querySelector('[data-field=\"experience\"]:checked'), sms = q(form, '[data-consent-sms]');\n"
    "          var tel = ph ? String(ph.value || '').replace(/[^0-9+]/g, '').slice(0, 16) : '';\n"
    "          if (v) { o.first_name = v; }\n"
    "          if (tel.length >= 7) { o.phone = tel; if (sms && sms.checked) { o.consent_sms = { text: visibleText(form, '[data-consent-sms-text]'), at: new Date().toISOString() }; } }\n"
    "          if (lv) { o.experience = lv.value; }\n"
    "          return Object.keys(o).length ? o : null;\n"
    "        },", 'R4-F4 payload')
sub("        done: function () { nameIn.value = ''; show(form, 'done'); }\n      });\n      function member(src) {",
    "        done: function () { nameIn.value = ''; var ph = q(form, '[data-field=\"phone\"]'); if (ph) { ph.value = ''; } show(form, 'done'); }\n      });\n      function member(src) {", 'R4-F4 clear phone')

# R4-F5: styles for the card, the points and the choices; the blue light under this section turned down by half.
css = """
<style data-pep-src="r4/founders.css">
@font-face { font-family: "Pepticity Black"; src: url("assets/fonts/PepticityBlack.woff2") format("woff2"); font-display: swap; }
.pep-fr-wrap { display: block; margin: 0; }
.pep-fr-engraver { width: 100%; }
.pep-fr-stage { position: relative; width: 100%; aspect-ratio: 2688 / 1520; transform-origin: 50% 55%; }
.pep-fr-stage .card { position: absolute; inset: 0; width: 100%; height: 100%; display: block;
  /* only the card and the light under it: the photo's black cloth outside the card's cut-corner outline is cut away */
  clip-path: polygon(9.4% 9.3%, 90.6% 9.3%, 94.9% 16.6%, 94.9% 99%, 5.1% 99%, 5.1% 16.6%);
  -webkit-mask-image: linear-gradient(180deg, #000 0, #000 88.5%, transparent 98%);
  mask-image: linear-gradient(180deg, #000 0, #000 88.5%, transparent 98%); }
.pep-fr-stage canvas { position: absolute; display: block; pointer-events: none; }
.pep-fr-stage .fx { mix-blend-mode: screen; mix-blend-mode: plus-lighter; }
.pep-fr-status { min-height: 1.4em; margin: 2px 0 0; font-size: 13px; line-height: 1.4; letter-spacing: .08em; text-transform: uppercase; color: var(--pep-plat-3); text-align: center; overflow-wrap: anywhere; }
#engraver[data-sample] .pep-fr-status { visibility: hidden; }

/* layout: the title across the top, the card and the form level with each other, the two drop-downs under both */
#founder-card { --fr-cut: polygon(14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px); }
#founder-card .pep-hooks-in { grid-template-columns: minmax(0, 1fr); justify-items: center; gap: clamp(20px, 2.6vw, 40px); }
#founder-card .pep-hooks-copy { width: 100%; max-width: 640px; }
#founder-card .pep-hooks-form { width: 100%; max-width: 480px; }
@media (min-width: 900px) {
  #founder-card .pep-hooks-in { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; }
  #founder-card .pep-hooks-copy, #founder-card .pep-hooks-form { justify-self: center; }
}
#founder-card .pep-fr-title { grid-column: 1 / -1; margin: 0; display: flex; justify-content: center; }
#founder-card .pep-fr-title img { display: block; width: min(100%, 600px); height: auto; }

/* THE BIG GLASS CARD the section sits in (owner, Nov 16): the approved member card's look, large. Clear see-through glass,
   all four corners cut, a thin bright-chrome edge with a black-chrome line inside it, the light along the bottom. Nothing
   else round it: no ripples, no smoke, no extra trim. */
#founder-card .pep-hooks-frame { --a: clamp(20px, 2.4vw, 34px); --b: var(--a); --c: var(--a); --d: var(--a); --t1: 3px; --t2: 6px; max-width: 1180px; }
#founder-card .pep-hooks-glass { background: linear-gradient(160deg, rgba(207, 230, 255, .085), rgba(207, 230, 255, .018) 42%, rgba(207, 230, 255, .05));
  -webkit-backdrop-filter: blur(10px) saturate(150%); backdrop-filter: blur(10px) saturate(150%); }
#founder-card .pep-hooks-frame::after, #founder-card .pep-hooks-frame::before { content: ""; position: absolute; inset: 0; z-index: 4; pointer-events: none; }
#founder-card .pep-hooks-frame::after { background: linear-gradient(118deg, #f4f7fb 0%, #9aa3ae 13%, #eef2f7 27%, #6b7077 46%, #e3e8ee 60%, #8d96a1 79%, #f4f7fb 100%);
  clip-path: polygon(evenodd, var(--a) 0, calc(100% - var(--a)) 0, 100% var(--a), 100% calc(100% - var(--a)), calc(100% - var(--a)) 100%, var(--a) 100%, 0 calc(100% - var(--a)), 0 var(--a), var(--a) 0,
    calc(var(--a) + var(--t1) * .414) var(--t1), var(--t1) calc(var(--a) + var(--t1) * .414), var(--t1) calc(100% - var(--a) - var(--t1) * .414), calc(var(--a) + var(--t1) * .414) calc(100% - var(--t1)), calc(100% - var(--a) - var(--t1) * .414) calc(100% - var(--t1)), calc(100% - var(--t1)) calc(100% - var(--a) - var(--t1) * .414), calc(100% - var(--t1)) calc(var(--a) + var(--t1) * .414), calc(100% - var(--a) - var(--t1) * .414) var(--t1), calc(var(--a) + var(--t1) * .414) var(--t1)); }
#founder-card .pep-hooks-frame::before { background: linear-gradient(180deg, #23272e, #07080a 50%, #1b1e24);
  clip-path: polygon(evenodd, calc(var(--a) + var(--t1) * .414) var(--t1), calc(100% - var(--a) - var(--t1) * .414) var(--t1), calc(100% - var(--t1)) calc(var(--a) + var(--t1) * .414), calc(100% - var(--t1)) calc(100% - var(--a) - var(--t1) * .414), calc(100% - var(--a) - var(--t1) * .414) calc(100% - var(--t1)), calc(var(--a) + var(--t1) * .414) calc(100% - var(--t1)), var(--t1) calc(100% - var(--a) - var(--t1) * .414), var(--t1) calc(var(--a) + var(--t1) * .414), calc(var(--a) + var(--t1) * .414) var(--t1),
    calc(var(--a) + var(--t2) * .414) var(--t2), var(--t2) calc(var(--a) + var(--t2) * .414), var(--t2) calc(100% - var(--a) - var(--t2) * .414), calc(var(--a) + var(--t2) * .414) calc(100% - var(--t2)), calc(100% - var(--a) - var(--t2) * .414) calc(100% - var(--t2)), calc(100% - var(--t2)) calc(100% - var(--a) - var(--t2) * .414), calc(100% - var(--t2)) calc(var(--a) + var(--t2) * .414), calc(100% - var(--a) - var(--t2) * .414) var(--t2), calc(var(--a) + var(--t2) * .414) var(--t2)); }
#founder-card .pep-hooks-sill { bottom: 7px; opacity: .95; }
#founder-card .pep-hooks-in { padding: clamp(30px, 3.4vw, 54px) clamp(22px, 3.6vw, 60px) clamp(34px, 3.6vw, 56px); }
#founder-card .pep-hooks-prompt { text-align: center; outline: 0; }
#founder-card .pep-hooks-label { text-align: center; }
#founder-card .pep-hooks-label[for="pep-hooks-card-first"] { position: absolute; width: 1px; height: 1px; margin: -1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }   /* the question above it already asks */
#founder-card .pep-hooks-fine { text-align: center; }
#founder-card .pep-hooks-field + .pep-hooks-field { margin-top: 18px; }
#founder-card .pep-hooks-frame > .pep-hooks-glow,
[data-module="hooks"][data-hooks-js] #founder-card .pep-hooks-frame[data-revealed] > .pep-hooks-glow { opacity: .5; }

/* the fields: no box. The typed words sit on the brand's light line: thickest in the middle, nothing at the ends. */
#founder-card .pep-hooks-well { height: 52px; background: transparent; clip-path: none; }
#founder-card .pep-hooks-well:focus-within { background: transparent; }
#founder-card .pep-hooks-well::before { inset: auto 6% -5px 6%; height: 12px; opacity: .35; clip-path: none;
  background: radial-gradient(50% 100% at 50% 50%, rgba(42, 120, 255, .7), rgba(42, 120, 255, 0) 72%); transition: opacity .3s ease; }
#founder-card .pep-hooks-well:focus-within::before,
#founder-card .pep-hooks-well[data-bad]::before { opacity: .9; background: radial-gradient(50% 100% at 50% 50%, rgba(42, 120, 255, .7), rgba(42, 120, 255, 0) 72%); }
#founder-card .pep-hooks-well::after { height: 3px; transform: scaleX(.82); opacity: .7; clip-path: polygon(0 50%, 50% 0, 100% 50%, 50% 100%);
  background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%, var(--pep-light)); transition: transform .45s var(--pep-ease), opacity .3s ease; }
#founder-card .pep-hooks-well:focus-within::after { transform: scaleX(1); opacity: 1; }
#founder-card .pep-hooks-input { padding: 0 6px; text-align: center; font-family: var(--pep-font-display); font-size: 19px; letter-spacing: .1em; color: var(--pep-plat-5); }
#founder-card .pep-hooks-input[type="text"] { text-transform: uppercase; }

/* the keys: the card's own outline (all four corners cut), chrome for the main one, clear glass with a thin edge for the rest */
#founder-card .pep-hooks-btn { clip-path: var(--fr-cut); padding: 10px 30px; }
#founder-card .pep-hooks-alt { clip-path: var(--fr-cut); margin: 14px 0 0; padding: 10px 26px; background: linear-gradient(180deg, #14181f, #0b0d11); }
#founder-card .pep-hooks-alt::before { clip-path: polygon(evenodd, 14px 0, calc(100% - 14px) 0, 100% 14px, 100% calc(100% - 14px), calc(100% - 14px) 100%, 14px 100%, 0 calc(100% - 14px), 0 14px, 14px 0,
  14.62px 1.5px, 1.5px 14.62px, 1.5px calc(100% - 14.62px), 14.62px calc(100% - 1.5px), calc(100% - 14.62px) calc(100% - 1.5px), calc(100% - 1.5px) calc(100% - 14.62px), calc(100% - 1.5px) 14.62px, calc(100% - 14.62px) 1.5px, 14.62px 1.5px); }
#founder-card .pep-hooks-prompt:focus-visible, #founder-card .pep-hooks-input:focus-visible { box-shadow: none; }   /* the light line under the field shows focus; no hard bar */
#founder-card .pep-hooks-input::placeholder { color: rgba(185, 190, 197, .42); letter-spacing: .16em; }
#founder-card .pep-hooks-row { justify-content: center; }
#founder-card .pep-hooks-tick { clip-path: polygon(8px 0, calc(100% - 8px) 0, 100% 8px, 100% calc(100% - 8px), calc(100% - 8px) 100%, 8px 100%, 0 calc(100% - 8px), 0 8px); }
.pep-fr-level { border: 0; margin: 20px 0 0; padding: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1.55fr); gap: 8px; min-width: 0; }
.pep-fr-level legend { padding: 0; margin: 0 0 10px; width: 100%; grid-column: 1 / -1; }
.pep-fr-choice { position: relative; min-width: 0; }
.pep-fr-choice input { position: absolute; inset: 0; width: 100%; height: 100%; margin: 0; opacity: 0; cursor: pointer; }
.pep-fr-choice span, .pep-fr-key { position: relative; display: flex; align-items: center; justify-content: center; min-height: 48px; padding: 8px 6px; isolation: isolate;
  font-family: var(--pep-font-display); font-size: clamp(11px, 2.9vw, 13px); letter-spacing: .06em; white-space: nowrap; color: var(--pep-plat-3);
  background: linear-gradient(160deg, rgba(207, 230, 255, .5), rgba(207, 230, 255, .12) 40%, rgba(207, 230, 255, .3));   /* the thin chrome edge */
  clip-path: var(--fr-cut); transition: color .2s ease, filter .2s ease; }
.pep-fr-choice span::before, .pep-fr-key::before { content: ""; position: absolute; inset: 1px; z-index: -1; clip-path: var(--fr-cut);
  background: linear-gradient(180deg, #14181f, #0b0d11); transition: background .25s ease; }
.pep-fr-choice input:checked + span, .pep-fr-key[aria-expanded="true"] { color: var(--pep-plat-5); background: linear-gradient(160deg, var(--pep-beam), rgba(207, 230, 255, .3) 40%, var(--pep-beam)); }
.pep-fr-choice input:checked + span::before, .pep-fr-key[aria-expanded="true"]::before { background: radial-gradient(70% 90% at 50% 118%, rgba(42, 120, 255, .6), rgba(42, 120, 255, 0) 70%), linear-gradient(180deg, #14181f, #0b0d11); }
.pep-fr-choice input:focus-visible + span, .pep-fr-key:focus-visible { outline: 0; filter: drop-shadow(0 0 5px var(--pep-beam)); color: var(--pep-plat-5); }
@media (hover: hover) { .pep-fr-choice:hover span, .pep-fr-key:hover { color: var(--pep-plat-5); } }

/* the two drop-downs */
.pep-fr-drops { grid-column: 1 / -1; width: 100%; max-width: 980px; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 14px 16px; }
.pep-fr-key { width: 100%; min-height: 58px; margin: 0; padding: 10px 14px; border: 0; cursor: pointer; gap: 12px; font-size: clamp(12px, 1.15vw, 16px); letter-spacing: .14em; -webkit-appearance: none; appearance: none; }
.pep-fr-key::after { content: ""; flex: none; width: 8px; height: 8px; margin-top: -4px; border-right: 2px solid currentColor; border-bottom: 2px solid currentColor; transform: rotate(45deg); transition: transform .3s var(--pep-ease); }
.pep-fr-key[aria-expanded="true"]::after { transform: translateY(4px) rotate(225deg); }
.pep-fr-panel { grid-column: 1 / -1; }
.pep-fr-panel[hidden] { display: none; }
.pep-fr-steps { list-style: none; margin: 4px 0 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 18px 22px; }
.pep-fr-steps li { display: grid; justify-items: center; gap: 6px; text-align: center; }
.pep-fr-steps b { font-family: var(--pep-font-display); font-weight: 400; font-size: clamp(26px, 2.6vw, 38px); line-height: 1; letter-spacing: .04em;
  background: linear-gradient(180deg, #f6f9fc 0%, #b9c2cc 40%, #3d444d 52%, #a9b6c4 74%, #eaf1f8 100%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; color: transparent; }
.pep-fr-steps b::after { content: ""; display: block; width: 84px; height: 3px; margin: 8px auto 0; clip-path: polygon(0 50%, 50% 0, 100% 50%, 50% 100%); background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%, var(--pep-light)); }
.pep-fr-steps span { font-family: var(--pep-font-display); font-size: clamp(12px, 1vw, 14px); letter-spacing: .1em; line-height: 1.4; color: var(--pep-plat-4); text-wrap: balance; }
@media (max-width: 520px) { .pep-fr-drops { grid-template-columns: minmax(0, 1fr); } .pep-fr-drops .pep-fr-key { order: 0; } }
@media (prefers-reduced-motion: reduce) { .pep-fr-key::after, .pep-fr-choice span, #founder-card .pep-hooks-well::after { transition: none; } }
</style>
"""
sub('</head>', css + '</head>', 'R4-F5 css')

# ================= MENU + BUTTON HOVER (owner, Nov 16) =================
# "the menu ... 20% smaller. It's too bold." / "When you hover over the buttons, they need to come out more. Same with every
# single button on the site ... that little purple light should get a little more illuminative" / PEPTIDES: "It shouldn't be so
# lit up already. It should light up when you hover ... a nice blue like crystal ... it comes out towards me and it lights up".
# The bar is one picture (render 58). A key's own slice of that picture is laid exactly over it and lifts on hover; the
# crystal's slice sits over the crystal, dimmed at rest, and lights and comes forward on hover and press. Nothing is redrawn.
css2 = """
<style data-pep-src="r4/menu-hover.css">
@media (min-width: 1200px) {
  [data-module="header"] { width: min(1056px, calc(100% - 24px)); }
  [data-module="header"] .pep-header-label { -webkit-text-stroke: .3px currentColor; }
  [data-module="header"] .pep-header-kwrap::before { content: ""; position: absolute; inset: 0; pointer-events: none; opacity: 0; transform-origin: 50% 60%;
    background: url("assets/menu58/key-left.webp") left top / 3.258cqw 100% no-repeat, url("assets/menu58/key-right.webp") right top / 3.258cqw 100% no-repeat, url("assets/menu58/key-mid.webp") center top / calc(100% - 6.4cqw) 100% no-repeat;
    transition: opacity .18s ease, transform .35s var(--pep-ease), filter .35s ease; }
  [data-module="header"] .pep-header-kwrap--hero::before { left: -4.463%; top: -14.484%; right: auto; bottom: auto; width: 105.537%; height: 113.58%; opacity: 1;
    background: url("assets/menu58/gem.webp") center / 100% 100% no-repeat; filter: brightness(.8) saturate(.95); transform-origin: 50% 55%; }
  [data-module="header"] .pep-header-kwrap--hero .pep-header-glow { opacity: .45; transition: opacity .35s ease; }
  [data-module="header"] .pep-header-key { transition: transform .35s var(--pep-ease); }
}
@media (min-width: 1200px) and (hover: hover) {
  [data-module="header"] .pep-header-kwrap:not(.pep-header-kwrap--hero):hover::before,
  [data-module="header"] .pep-header-kwrap:not(.pep-header-kwrap--hero):focus-within::before { opacity: 1; transform: translateY(-5%) scale(1.1);
    filter: brightness(1.3) saturate(1.35) drop-shadow(0 7px 9px rgba(0, 0, 0, .6)) drop-shadow(0 0 9px rgba(132, 104, 255, .85)); }
  [data-module="header"] .pep-header-kwrap:hover .pep-header-key { transform: translateY(-5%); }
  [data-module="header"] .pep-header-kwrap:hover .pep-header-label { transform: scale(1.12); }
  [data-module="header"] .pep-header-kwrap--hero:hover::before,
  [data-module="header"] .pep-header-kwrap--hero:focus-within::before { transform: translateY(-4%) scale(1.1); filter: brightness(1.28) saturate(1.2) drop-shadow(0 8px 10px rgba(0, 0, 0, .55)) drop-shadow(0 0 16px rgba(42, 120, 255, .95)); }
  [data-module="header"] .pep-header-kwrap--hero:hover .pep-header-glow { opacity: 1; }
  [data-module="header"] .pep-header-kwrap--hero:active::before { transform: translateY(-5%) scale(1.16); filter: brightness(1.45) saturate(1.25) drop-shadow(0 10px 12px rgba(0, 0, 0, .55)) drop-shadow(0 0 22px rgba(42, 120, 255, 1)); }
}
@media (min-width: 1200px) { [data-module="header"][data-drop-open] .pep-header-kwrap--hero::before { filter: brightness(1.2) saturate(1.15) drop-shadow(0 0 14px rgba(42, 120, 255, .9)); } [data-module="header"][data-drop-open] .pep-header-glow { opacity: 1; } }
@media (max-width: 1199px) and (hover: hover) { [data-module="header"] .pep-header-key:hover { transform: translateY(-2px) scale(1.06); filter: brightness(1.25) saturate(1.2); } }

/* every call-to-action key on the page comes out further on hover and settles on press */
body :is(.pep-hooks-btn, .pep-hooks-alt, .pep-hooks-go, .pep-hero-btn, .pep-hero-skip, .pep-cart-btn, .pep-cart-btn2, .pep-doors-btn, .pep-doors-again, .pep-doors-go, .pep-footer-join, .pep-guide-send, .pep-guide-chip, .pep-lineup-add, .pep-shelf-add, .pep-shelf-restock, .pep-shelf-filter, .pep-fr-key) {
  transition: transform .32s var(--pep-ease), filter .32s ease, color .25s ease, background-color .25s ease, box-shadow .25s ease, opacity .25s ease; }
@media (hover: hover) {
  body :is(.pep-hooks-btn, .pep-hooks-alt, .pep-hooks-go, .pep-hero-btn, .pep-hero-skip, .pep-cart-btn, .pep-cart-btn2, .pep-doors-btn, .pep-doors-again, .pep-doors-go, .pep-footer-join, .pep-guide-send, .pep-guide-chip, .pep-lineup-add, .pep-shelf-add, .pep-shelf-restock, .pep-shelf-filter, .pep-fr-key):hover:not(:disabled) {
    transform: translateY(-4px) scale(1.055); filter: brightness(1.2) saturate(1.1); }
  .pep-fr-choice:hover span { transform: translateY(-3px) scale(1.05); filter: brightness(1.2); }
}
body :is(.pep-hooks-btn, .pep-hooks-alt, .pep-hooks-go, .pep-hero-btn, .pep-hero-skip, .pep-cart-btn, .pep-cart-btn2, .pep-doors-btn, .pep-doors-again, .pep-doors-go, .pep-footer-join, .pep-guide-send, .pep-guide-chip, .pep-lineup-add, .pep-shelf-add, .pep-shelf-restock, .pep-shelf-filter, .pep-fr-key):active:not(:disabled) { transform: translateY(-1px) scale(.99); filter: brightness(1.3); }
.pep-fr-choice span { transition: transform .32s var(--pep-ease), filter .32s ease, color .2s ease; }
/* R4-H1: on a narrow phone the hero button's longest label (CLAIM MY FOUNDER SPOT) spilled out of the button */
@media (max-width: 480px) { .pep-hero-btn { padding: 0 14px; font-size: 14px; letter-spacing: .06em; } }
@media (prefers-reduced-motion: reduce) {
  body :is(.pep-hooks-btn, .pep-hooks-alt, .pep-hooks-go, .pep-hero-btn, .pep-hero-skip, .pep-cart-btn, .pep-cart-btn2, .pep-doors-btn, .pep-doors-again, .pep-doors-go, .pep-footer-join, .pep-guide-send, .pep-guide-chip, .pep-lineup-add, .pep-shelf-add, .pep-shelf-restock, .pep-shelf-filter, .pep-fr-key):hover:not(:disabled),
  .pep-fr-choice:hover span, [data-module="header"] .pep-header-kwrap:hover::before, [data-module="header"] .pep-header-kwrap:hover .pep-header-key { transform: none; }
}
</style>
"""
sub('</head>', css2 + '</head>', 'R4-M1 menu + hover css')

sub('</body>', '<script src="assets/founders/founders.js" defer></script>\n</body>', 'R4-F3 script')

open(dst, 'w', encoding='utf-8').write(s)
# files that travel with the page
import os, shutil
out_dir = os.path.join(os.path.dirname(os.path.abspath(dst)), 'assets', 'founders'); os.makedirs(out_dir, exist_ok=True)
shutil.copyfile('/home/user/work/r4/fix/founders/founders.js', os.path.join(out_dir, 'founders.js'))
shutil.copyfile('/home/user/work/engraver/engrave.js', os.path.join(out_dir, 'engrave.js'))
shutil.copyfile('/home/user/work/engraver/assets/card1-1600.jpg', os.path.join(out_dir, 'card-1600.jpg'))
shutil.copyfile('/home/user/work/r4/fix/founders/title.webp', os.path.join(out_dir, 'title.webp'))
print('apply_r4: cover link; crest P size + snap spin; FOUNDERS RESERVE x%d; 10%%; approved card + engraver; phone + experience' % n_circle)

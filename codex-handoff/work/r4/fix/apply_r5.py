#!/usr/bin/env python3
"""Round 5 (owner, Nov 16 01:40): one look everywhere, built from the approved member card's own render.
- glass: a see-through frame cut from the card render (assets/glass/glass-frame.webp), used for the hero card, the
  Founders card, the menu bar and its drop-down sheet. The page ground and its effects are not touched.
- button 25 (hollow black chrome, 3D lettering, comes out on hover with a blue light running round it) on every call to action.
- menu: glass bar, PEPTICITY wordmark and keys in chrome lettering, drop-down 01 (the sheet).
- hero: GRAND OPENING card that sells; the Founders sign-up leaves the hero.
- Founders (second section): card on the left with the steps under it; how the card is earned beside it.
Runs after apply_r4.py and BEFORE apply_sec.py.  usage: apply_r5.py IN.html OUT.html"""
import os, re, shutil, sys
src, dst = sys.argv[1], sys.argv[2]
s = open(src, encoding='utf-8').read()
def sub(old, new, why, count=1):
    global s
    assert s.count(old) == count, '%s: anchor found %d times, wanted %d' % (why, s.count(old), count)
    s = s.replace(old, new)
def oct_(c): return 'polygon({c} 0, calc(100% - {c}) 0, 100% {c}, 100% calc(100% - {c}), calc(100% - {c}) 100%, {c} 100%, 0 calc(100% - {c}), 0 {c})'.format(c=c)
def ring(c, t):
    k = 'calc({c} + {t} * .414)'.format(c=c, t=t); e = 'calc(100% - {t})'.format(t=t); f = 'calc(100% - {c} - {t} * .414)'.format(c=c, t=t)
    return ('polygon(evenodd, {c} 0, calc(100% - {c}) 0, 100% {c}, 100% calc(100% - {c}), calc(100% - {c}) 100%, {c} 100%, 0 calc(100% - {c}), 0 {c}, {c} 0, '
            '{k} {t}, {t} {k}, {t} {f}, {k} {e}, {f} {e}, {e} {f}, {e} {k}, {f} {t}, {k} {t})').format(c=c, t=t, k=k, e=e, f=f)
FRAME = ('border: 0 solid transparent; border-image: url("assets/glass/glass-frame.webp") 75 75 130 75 / var(--gw) var(--gw) calc(var(--gw) * 1.733) var(--gw) / '
         'calc(var(--gw) * .08) calc(var(--gw) * .08) calc(var(--gw) * .727) calc(var(--gw) * .08) stretch;')
FRAMEBAR = ('border: 0 solid transparent; border-image: url("assets/glass/glass-frame-bar.webp") 75 75 81 75 / var(--gw) var(--gw) calc(var(--gw) * 1.08) var(--gw) / calc(var(--gw) * .08) stretch;')
GLASS = 'background: linear-gradient(160deg, rgba(207, 230, 255, .075), rgba(207, 230, 255, .014) 42%, rgba(207, 230, 255, .045)); -webkit-backdrop-filter: blur(9px) saturate(150%); backdrop-filter: blur(9px) saturate(150%);'
K25 = ('.pep-hooks-btn, .pep-hooks-alt, .pep-hooks-go, .pep-hero-btn, .pep-hero-skip, .pep-cart-btn, .pep-cart-btn2, .pep-doors-btn, .pep-doors-again, '
       '.pep-doors-go, .pep-footer-join, .pep-guide-send, .pep-lineup-add, .pep-shelf-add, .pep-shelf-restock, .pep-k25')

# ---------- 1. the round-4 menu overlay rules go (the bar picture they sat on is replaced) ----------
n = len(re.findall(r'<style data-pep-src="r4/menu-hover.css">.*?</style>\n', s, flags=re.S)); assert n == 1, 'r4 menu css block'
s = re.sub(r'<style data-pep-src="r4/menu-hover.css">.*?</style>\n', '', s, flags=re.S)

# ---------- 2. HERO: GRAND OPENING sells; the sign-up form leaves the hero (it stays in the page for its script, unseen) ----------
sub('''      <h1 class="pep-hero-kicker" id="pep-hero-title"><span class="pep-hero-sr">PEPTICITY </span><span class="pep-hero-kicker-face">GRAND OPENING</span></h1>
      <form class="pep-hero-form" method="post" action="" data-hook="H01" data-ghl-form="team-join" data-effect="frm-103" novalidate>''',
'''      <div class="pep-hx">
        <p class="pep-hx-eyebrow"><span>PEPTICITY</span></p>
        <h1 class="pep-hero-3d pep-hx-title" id="pep-hero-title" data-text="GRAND OPENING"><span class="pep-hero-sr">PEPTICITY </span><span class="pep-hero-3d-face">GRAND OPENING</span></h1>
        <i class="pep-hx-line" aria-hidden="true"></i>
        <p class="pep-hx-offer" data-gate="offer" hidden><span>25 PLATINUM CARDS.</span> <span>10% OFF FOR LIFE.</span></p>
        <p class="pep-hx-offer" data-gate-off="offer"><span>25 PLATINUM CARDS.</span> <span>YOUR NAME IN CHROME.</span></p>
        <ul class="pep-hx-hooks" role="list">
          <li>LASER ENGRAVED WITH YOUR NAME</li>
          <li>NUMBERED 01 TO 25</li>
          <li>FIRST ACCESS TO EVERY LOT</li>
        </ul>
        <div class="pep-hx-keys">
          <a class="pep-k25" href="#founder-card"><span>CLAIM MY CARD</span></a>
          <a class="pep-k25" href="#lineup" data-gate="names" hidden><span>SEE THE LINEUP</span></a>
          <a class="pep-k25" href="#shelf" data-gate-off="names"><span>SEE THE SHELF</span></a>
        </div>
      </div>
      <form class="pep-hero-form" method="post" action="" data-hook="H01" data-ghl-form="team-join" data-effect="frm-103" novalidate hidden aria-hidden="true">''', 'R5 hero')

# ---------- 3. FOUNDERS: card on the left with the steps under it; how it is earned on the right ----------
a = s.index('        <div class="pep-hooks-copy">\n          <div class="pep-hooks-cardwrap pep-fr-wrap">'); s = s[:a] + '        <div class="pep-fr-left">\n' + s[a:]
a = s.index('        <!-- owner, Nov 16: no wording in the section; two drop-downs'); b = s.index('      </div>\n    </div>\n  </div>\n</section>\n<!-- HOOKS:END card -->')
s = s[:a] + '''        </div>
        <div class="pep-fr-right">
          <p class="pep-fr-h">HOW YOU EARN IT</p>
          <ol class="pep-fr-path" role="list">
            <li><b>01</b><span>ENGRAVE YOUR NAME AND JOIN</span></li>
            <li><b>02</b><span>REFER 2 FRIENDS WHO SIGN UP</span></li>
            <li><b>03</b><span>SHARE PEPTICITY ON FACEBOOK OR INSTAGRAM</span></li>
          </ol>
          <div class="pep-fr-refer-row"><button class="pep-k25" type="button" data-refer-open><span>REFER A FRIEND</span></button></div>
          <p class="pep-fr-h">WHAT YOU GET</p>
          <ul class="pep-fr-get" role="list">
            <li data-gate="offer" hidden><b>10%</b><span>OFF FOR LIFE</span></li>
            <li><b>1ST</b><span>ACCESS TO EVERY NEW LOT</span></li>
            <li><b>25</b><span>NUMBERED CARDS, YOURS ENGRAVED</span></li>
          </ul>
        </div>
''' + s[b:]
# the "you're in" step: the share step of earning the card (the address shared is this page; nothing personal is sent)
sub('            <p class="pep-hooks-next">Your card comes with your welcome email.</p>',
    '''            <p class="pep-hooks-next">Your welcome email shows how to earn your card.</p>
            <div class="pep-fr-share"><button class="pep-k25" type="button" data-refer-open><span>REFER A FRIEND</span></button></div>''', 'R5 share step')
sub("""  </div>
</section>
<!-- HOOKS:END card -->""", """  </div>
  <dialog class="pep-fr-dialog" id="pep-fr-refer" aria-labelledby="pep-fr-refer-h">
    <div class="pep-fr-dialog-in">
      <button class="pep-fr-x" type="button" data-refer-close>CLOSE</button>
      <p class="pep-fr-h" id="pep-fr-refer-h">REFER A FRIEND</p>
      <p class="pep-fr-dialog-sub">2 FRIENDS SIGN UP AND YOU SHARE: YOUR PLATINUM CARD IS EARNED</p>
      <div class="pep-fr-ways">
        <a class="pep-k25" data-way="email" href="#founder-card"><span>EMAIL</span></a>
        <a class="pep-k25" data-way="text" href="#founder-card"><span>TEXT</span></a>
        <a class="pep-k25" data-way="facebook" href="#founder-card" target="_blank" rel="noopener noreferrer"><span>FACEBOOK</span></a>
        <button class="pep-k25" type="button" data-way="instagram"><span>INSTAGRAM</span></button>
        <button class="pep-k25" type="button" data-way="tiktok"><span>TIKTOK</span></button>
        <button class="pep-k25" type="button" data-way="copy"><span>COPY MY LINK</span></button>
      </div>
      <p class="pep-fr-link" data-refer-link></p>
      <p class="pep-fr-copied" role="status" aria-live="polite" data-refer-said></p>
    </div>
  </dialog>
</section>
<!-- HOOKS:END card -->""", 'R5 refer card')
# the referral code travels with the sign-up (theirs, and the friend's who sent them); founders.js holds both, in memory
sub("          if (lv) { o.experience = lv.value; }\n", "          if (lv) { o.experience = lv.value; }\n          if (win.PEPRef) { if (win.PEPRef.mine) { o.ref_code = win.PEPRef.mine; } if (win.PEPRef.from) { o.referred_by = win.PEPRef.from; } }\n", 'R5 referral payload')
sub('<p class="pep-hooks-prompt">WHAT NAME GOES ON YOUR CARD?</p>', '<p class="pep-hooks-prompt"><b class="pep-fr-n">STEP 1 OF 2</b>WHAT NAME WOULD YOU LIKE ON THE CARD?</p>', 'R5 step 1')
sub('<p class="pep-hooks-prompt" tabindex="-1" data-step-head>WHERE SHOULD WE SEND YOUR CARD?</p>', '<p class="pep-hooks-prompt" tabindex="-1" data-step-head><b class="pep-fr-n">STEP 2 OF 2</b>WHERE DO WE SEND YOUR CARD?</p>', 'R5 step 2')

# ---------- 4. styles ----------
css = '''
<style data-pep-src="r5/one-look.css">
@property --k25a { syntax: "<angle>"; inherits: false; initial-value: 0deg; }

/* ===== BUTTON 25 on every call to action: hollow black chrome, clear glass inside, 3D lettering. Calm at rest. ===== */
body :is(%(K25)s) { --kc: 13px; position: relative; isolation: isolate; display: inline-flex; align-items: center; justify-content: center; min-height: 56px; padding: 10px 30px; overflow: visible;
  border: 0; border-radius: 0; background: none; clip-path: none; box-shadow: none; text-decoration: none; cursor: pointer;
  font-family: var(--pep-font-display); font-weight: 400; font-size: clamp(14px, 1.15vw, 17px); line-height: 1.2; letter-spacing: .16em; text-transform: uppercase; text-wrap: balance; text-align: center; color: var(--pep-plat-4);
  filter: drop-shadow(0 0 .6px var(--pep-beam)) drop-shadow(0 8px 10px rgba(0, 0, 0, .55));
  transition: transform .36s var(--pep-ease), filter .36s ease; }
body :is(%(K25)s)::before { all: unset; content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; clip-path: %(RING)s;
  background: conic-gradient(from var(--k25a), #5a616c, #0a0c0f 12%%, #262b33 30%%, #6b7380 50%%, #0a0c0f 62%%, #262b33 80%%, #5a616c); }
body :is(%(K25)s)::after { all: unset; content: ""; position: absolute; inset: 4px; z-index: -2; pointer-events: none; clip-path: %(OCTIN)s;
  background: radial-gradient(60%% 90%% at 50%% 50%%, rgba(42, 120, 255, 0), transparent 72%%), linear-gradient(160deg, rgba(207, 230, 255, .07), rgba(207, 230, 255, .012));
  -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); box-shadow: inset 0 0 0 1px rgba(207, 230, 255, .5); transition: background .3s ease; }
/* the lettering: chrome with real depth (stacked edges under it) */
body :is(%(K25)s) > span:not([aria-hidden="true"]), body :is(%(K25)s) > b { position: relative; display: inline-block; color: transparent;
  background: linear-gradient(180deg, #ffffff 14%%, #d3dae2 44%%, #59616c 53%%, #aab7c5 72%%, #eef3f8 100%%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; -webkit-text-stroke: 0;
  filter: drop-shadow(0 1px 0 #0d1014) drop-shadow(0 2px 0 #000) drop-shadow(0 3px 3px rgba(0, 0, 0, .65)); text-shadow: none;
  transition: transform .36s var(--pep-ease), opacity .3s ease; }
@media (hover: hover) {
  /* it comes right out: lifts, grows, and the one blue runs all the way round its edge */
  body :is(%(K25)s):hover:not(:disabled) { transform: perspective(700px) translate3d(0, -6px, 34px) scale(1.07);
    filter: drop-shadow(0 0 .8px var(--pep-beam)) drop-shadow(0 0 7px rgba(42, 120, 255, .8)) drop-shadow(0 18px 18px rgba(0, 0, 0, .62)); }
  body :is(%(K25)s):hover:not(:disabled)::before { background: conic-gradient(from var(--k25a), #5a616c, #0a0c0f 10%%, var(--pep-light) 22%%, var(--pep-beam) 27%%, var(--pep-light) 32%%, #0a0c0f 44%%, #6b7380 56%%, #0a0c0f 66%%, var(--pep-light) 76%%, var(--pep-beam) 80%%, var(--pep-light) 84%%, #262b33 94%%, #5a616c);
    animation: pep-k25-run 2.6s linear infinite; }
  body :is(%(K25)s):hover:not(:disabled)::after { background: radial-gradient(60%% 90%% at 50%% 60%%, rgba(42, 120, 255, .34), transparent 72%%), linear-gradient(160deg, rgba(207, 230, 255, .1), rgba(207, 230, 255, .02)); }
  body :is(%(K25)s):hover:not(:disabled) > span:not([aria-hidden="true"]) { transform: scale(1.06); }
}
body :is(%(K25)s):active:not(:disabled) { transform: translateY(-1px) scale(.985); }
body :is(%(K25)s):focus-visible { outline: 0; filter: drop-shadow(0 0 .8px var(--pep-beam)) drop-shadow(0 0 8px var(--pep-beam)) drop-shadow(0 8px 10px rgba(0, 0, 0, .55)); }
body :is(%(K25)s):disabled { opacity: .5; cursor: default; }
@keyframes pep-k25-run { to { --k25a: 360deg; } }
@media (max-width: 480px) { .pep-hero-btn { padding: 0 14px; font-size: 14px; letter-spacing: .06em; } }

/* ===== THE GLASS FRAME (cut from the member card's render): hero card, Founders card, menu bar, menu sheet ===== */
#join.pep-hero-card, #founder-card .pep-hooks-frame, .pep-header-drop { isolation: isolate; }
#join.pep-hero-card::after, #founder-card .pep-hooks-frame::after { content: ""; position: absolute; inset: 0; pointer-events: none; clip-path: none; background: none; opacity: 1; filter: none; -webkit-mask: none; mask: none; %(FRAME)s }
#join.pep-hero-card::after { z-index: -1; } #founder-card .pep-hooks-frame::after { z-index: 4; }
[data-module="header"]::after, .pep-header-drop::after { content: ""; position: absolute; inset: 0; pointer-events: none; %(FRAMEBAR)s }
[data-module="header"]::after { z-index: -1; } .pep-header-drop::after { z-index: 2; }
#join.pep-hero-card { --gw: clamp(30px, 3.2vw, 46px); padding: clamp(40px, 4.6vw, 64px) clamp(26px, 3.4vw, 50px) clamp(46px, 5vw, 70px); text-align: center; }
#join.pep-hero-card::before { content: ""; position: absolute; inset: 0; z-index: -2; opacity: 1; filter: none; -webkit-mask: none; mask: none; clip-path: %(OCTGW)s; %(GLASS)s }

/* ===== HERO: GRAND OPENING ===== */
.pep-hx { position: relative; display: grid; justify-items: center; }
.pep-hx-eyebrow { margin: 0 0 10px; font-family: var(--pep-font-display); font-size: clamp(12px, 1.1vw, 15px); letter-spacing: .5em; padding-left: .5em; }
.pep-hx-eyebrow span, .pep-hx-offer span { background: linear-gradient(180deg, #ffffff 14%%, #d3dae2 44%%, #59616c 53%%, #aab7c5 72%%, #eef3f8 100%%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.pep-hx-title { position: relative; z-index: 0; margin: 0; font-family: var(--pep-font-display); font-weight: 400; font-size: clamp(38px, 5.4vw, 78px); line-height: 1.04; letter-spacing: .05em; text-transform: uppercase; text-wrap: balance; }
.pep-hx-line { display: block; width: min(76%%, 440px); height: 4px; margin: clamp(14px, 1.6vw, 22px) 0; clip-path: polygon(0 50%%, 50%% 0, 100%% 50%%, 50%% 100%%); background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%%, var(--pep-light)); }
.pep-hx-offer { margin: 0; display: grid; gap: 4px; font-family: var(--pep-font-display); font-size: clamp(17px, 2vw, 28px); letter-spacing: .12em; line-height: 1.2; filter: drop-shadow(0 1px 0 #0d1014) drop-shadow(0 2px 0 #000); }
.pep-hx-offer[hidden] { display: none; }
.pep-hx-hooks { list-style: none; margin: clamp(16px, 1.8vw, 24px) 0 0; padding: 0; display: grid; gap: 8px; }
.pep-hx-hooks li { display: flex; align-items: center; justify-content: center; gap: 12px; font-family: var(--pep-font-display); font-size: clamp(11px, 1vw, 14px); letter-spacing: .16em; color: var(--pep-plat-3); }
.pep-hx-hooks li::before, .pep-hx-hooks li::after { content: ""; flex: none; width: 26px; height: 3px; clip-path: polygon(0 50%%, 50%% 0, 100%% 50%%, 50%% 100%%); background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%%, var(--pep-light)); }
.pep-hx-keys { display: flex; flex-wrap: wrap; justify-content: center; gap: 14px 16px; margin-top: clamp(22px, 2.4vw, 32px); }
.pep-hx-keys .pep-k25[hidden] { display: none; }

/* ===== FOUNDERS: the big glass card, the card and its steps on the left, how it is earned on the right ===== */
#founder-card .pep-hooks-frame { --gw: clamp(30px, 3.2vw, 46px); max-width: 1180px; }
#founder-card .pep-hooks-frame::before { content: none; }
#founder-card .pep-hooks-frame > .pep-hooks-glow, #founder-card .pep-hooks-glass::before, #founder-card .pep-hooks-bevel, #founder-card .pep-hooks-sill { display: none; }
#founder-card .pep-hooks-glass { clip-path: %(OCTGW)s; %(GLASS)s }
#founder-card .pep-hooks-in { grid-template-columns: minmax(0, 1fr); gap: clamp(22px, 2.6vw, 40px); padding: clamp(40px, 4.4vw, 62px) clamp(24px, 3.6vw, 58px) clamp(48px, 5vw, 72px); }
@media (min-width: 900px) { #founder-card .pep-hooks-in { grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr); align-items: start; } }
#founder-card .pep-fr-left { display: grid; gap: clamp(14px, 1.6vw, 22px); justify-items: center; width: 100%%; }
#founder-card .pep-fr-left .pep-hooks-copy { width: 100%%; max-width: 620px; justify-self: center; }
#founder-card .pep-fr-left .pep-hooks-form { width: 100%%; max-width: 460px; justify-self: center; }
#founder-card .pep-fr-right { width: 100%%; max-width: 460px; justify-self: center; align-self: start; padding-top: clamp(4px, 1vw, 16px); }
#founder-card .pep-fr-n { display: block; margin: 0 0 8px; font-weight: 400; font-size: .62em; letter-spacing: .3em; color: var(--pep-beam); -webkit-text-fill-color: var(--pep-beam); background: none; text-shadow: 0 0 12px rgba(42, 120, 255, .8); }
#founder-card .pep-fr-h { margin: 0 0 14px; font-family: var(--pep-font-display); font-size: clamp(14px, 1.3vw, 18px); letter-spacing: .26em; color: var(--pep-beam); text-shadow: 0 0 12px rgba(42, 120, 255, .75); text-align: center; }
#founder-card .pep-fr-path + .pep-fr-h { margin-top: clamp(24px, 2.6vw, 36px); }
#founder-card .pep-fr-path, #founder-card .pep-fr-get { list-style: none; margin: 0; padding: 0; display: grid; gap: 0; }
#founder-card .pep-fr-path li, #founder-card .pep-fr-get li { position: relative; display: grid; grid-template-columns: 68px minmax(0, 1fr); align-items: center; gap: 16px; min-height: 64px; padding: 10px 0; }
#founder-card .pep-fr-get li[hidden] { display: none; }
#founder-card .pep-fr-path b, #founder-card .pep-fr-get b { font-family: var(--pep-font-display); font-weight: 400; font-size: clamp(24px, 2.3vw, 34px); line-height: 1; text-align: center; letter-spacing: .02em;
  background: linear-gradient(180deg, #ffffff 14%%, #d3dae2 44%%, #59616c 53%%, #aab7c5 72%%, #eef3f8 100%%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; filter: drop-shadow(0 1px 0 #0d1014) drop-shadow(0 2px 0 #000); }
#founder-card .pep-fr-path span, #founder-card .pep-fr-get span { font-family: var(--pep-font-display); font-size: clamp(12px, 1.05vw, 15px); letter-spacing: .12em; line-height: 1.4; color: var(--pep-plat-4); }
/* each step sits on a lit line: thickest in the middle, nothing at the ends */
#founder-card .pep-fr-path li::after, #founder-card .pep-fr-get li::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 3px; clip-path: polygon(0 50%%, 50%% 0, 100%% 50%%, 50%% 100%%);
  background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%%, var(--pep-light)); opacity: .75; }
#founder-card .pep-hooks-prompt { display: block; text-align: center; }
#founder-card .pep-hooks-consent { margin-top: 14px; }
#founder-card .pep-hooks-row { display: flex; justify-content: center; }
/* both steps stay on show, one under the other, until the sign-up is sent (founders.js keeps them open) */
#founder-card .pep-hooks-step[data-step="email"] { margin-top: clamp(22px, 2.4vw, 32px); }
#founder-card [data-edit] { display: none; }
#founder-card .pep-fr-refer-row { display: flex; justify-content: center; margin: clamp(20px, 2.2vw, 28px) 0 clamp(30px, 3.2vw, 44px); }
#founder-card .pep-fr-refer-row + .pep-fr-h { margin-top: 0; }
dialog.pep-fr-dialog { width: min(600px, 94vw); max-width: none; margin: auto; padding: 0; border: 0; background: transparent; color: var(--pep-plat-4); overflow: visible; }
dialog.pep-fr-dialog::backdrop { background: rgba(4, 5, 7, .74); -webkit-backdrop-filter: blur(6px); backdrop-filter: blur(6px); }
.pep-fr-dialog-in { --gw: 34px; position: relative; isolation: isolate; padding: 46px clamp(22px, 5vw, 44px) 54px; text-align: center; }
.pep-fr-dialog-in::before { content: ""; position: absolute; inset: 0; z-index: -2; clip-path: %(OCTGW)s; background: linear-gradient(160deg, rgba(207, 230, 255, .08), rgba(207, 230, 255, .015) 45%%, rgba(207, 230, 255, .05)), rgba(8, 10, 14, .78); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); }
.pep-fr-dialog-in::after { content: ""; position: absolute; inset: 0; z-index: -1; pointer-events: none; %(FRAME)s }
.pep-fr-dialog .pep-fr-h { margin: 0 0 8px; font-family: var(--pep-font-display); font-size: clamp(18px, 2.4vw, 26px); letter-spacing: .2em; color: var(--pep-beam); text-shadow: 0 0 12px rgba(42, 120, 255, .75); }
.pep-fr-dialog-sub { margin: 0 0 22px; font-family: var(--pep-font-display); font-size: 12px; letter-spacing: .14em; line-height: 1.5; color: var(--pep-plat-3); text-wrap: balance; }
.pep-fr-ways { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; } @media (max-width: 520px) { .pep-fr-ways { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
.pep-fr-ways .pep-k25 { min-height: 54px; padding: 8px 10px; font-size: 13px; letter-spacing: .12em; }
.pep-fr-x { position: absolute; right: 30px; top: 26px; min-height: 30px; padding: 0 6px; border: 0; background: none; cursor: pointer; font-family: var(--pep-font-display); font-size: 11px; letter-spacing: .2em; color: var(--pep-plat-3); }
.pep-fr-x:hover, .pep-fr-x:focus-visible { color: #fff; box-shadow: none; outline: 0; text-shadow: 0 0 10px var(--pep-beam); }
.pep-fr-link { margin: 18px 0 0; font-size: 13px; letter-spacing: .04em; color: var(--pep-plat-3); overflow-wrap: anywhere; }
.pep-fr-dialog .pep-fr-copied { min-height: 1.4em; margin: 8px 0 0; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--pep-beam); }
#founder-card .pep-fr-h--share { margin-top: 22px; }
#founder-card .pep-fr-share { display: flex; flex-wrap: wrap; justify-content: center; gap: 12px; }
#founder-card .pep-fr-share .pep-k25 { min-height: 50px; padding: 8px 20px; font-size: 13px; } #founder-card .pep-fr-share [hidden] { display: none; }
#founder-card .pep-fr-copied { min-height: 1.4em; margin: 10px 0 0; text-align: center; font-size: 13px; letter-spacing: .08em; text-transform: uppercase; color: var(--pep-plat-3); }
.pep-fr-choice span { clip-path: %(OCT13)s; transition: transform .32s var(--pep-ease), filter .32s ease, color .2s ease; }
@media (hover: hover) { .pep-fr-choice:hover span { transform: translateY(-3px) scale(1.05); filter: brightness(1.25); } }

/* ===== MENU: a slim glass bar from the card's render; PEPTICITY and the keys in chrome lettering; drop-down 01, the sheet ===== */
[data-module="header"] { --gw: 22px; isolation: isolate; top: 8px; }
[data-module="header"]::before { background: none; filter: none; inset: 0; z-index: -2; clip-path: %(OCTGW)s; %(GLASS)s background-color: rgba(8, 10, 14, .42); }
.pep-header-brand { background: url("assets/glass/wordmark.webp") left center / contain no-repeat; filter: brightness(1.3) drop-shadow(0 2px 3px rgba(0, 0, 0, .6)); }
.pep-header-glow { display: none; }
.pep-header-label { -webkit-text-stroke: 0; background: linear-gradient(180deg, #ffffff 14%%, #d3dae2 44%%, #59616c 53%%, #aab7c5 72%%, #eef3f8 100%%); -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 0 #0d1014) drop-shadow(0 2px 0 #000) drop-shadow(0 3px 3px rgba(0, 0, 0, .6)); }
.pep-header-key { transition: transform .35s var(--pep-ease); }
.pep-header-key::after { inset: auto 8%% 4px 8%%; height: 3px; opacity: 0; transform: scaleX(.4); clip-path: polygon(0 50%%, 50%% 0, 100%% 50%%, 50%% 100%%); background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%%, var(--pep-light)); transition: opacity .25s ease, transform .35s var(--pep-ease); }
.pep-header-key--hero::after { inset: auto 8%% 4px 8%%; background: linear-gradient(90deg, var(--pep-light), var(--pep-beam) 50%%, var(--pep-light)); }
.pep-header-key:hover::after, .pep-header-key:focus-visible::after, .pep-header-key[aria-expanded="true"]::after { opacity: 1; transform: scaleX(1); }
@media (hover: hover) { .pep-header-key:hover { transform: translateY(-3px); } .pep-header-key:hover .pep-header-label { transform: scale(1.1); filter: drop-shadow(0 1px 0 #0d1014) drop-shadow(0 2px 0 #000) drop-shadow(0 0 9px rgba(42, 120, 255, .85)); } }
@media (min-width: 1200px) {
  [data-module="header"] { width: min(1056px, calc(100%% - 24px)); aspect-ratio: auto; height: 64px; }
  [data-module="header"] .pep-header-row { display: flex; align-items: center; justify-content: space-between; padding: 0 30px 3px 30px; }
  [data-module="header"] .pep-header-brand { position: static; flex: none; width: 196px; height: 36px; }
  [data-module="header"] .pep-header-nav, [data-module="header"] .pep-header-keys { display: flex; align-items: center; gap: clamp(6px, 1.4vw, 22px); }
  [data-module="header"] .pep-header-kwrap { position: relative; left: auto; top: auto; width: auto; height: auto; display: flex; }
  [data-module="header"] .pep-header-kwrap--menu { display: none; }
  [data-module="header"] .pep-header-key { width: auto; height: 44px; padding: 0 8px; font-size: 14px; letter-spacing: .14em; }
  [data-module="header"] .pep-header-key--hero { padding: 0 8px; }
  .pep-header-drop { top: calc(100%% + 26px); z-index: 1; --gw: 30px; }
}
@media (max-width: 1199px) {
  [data-module="header"] { background: none; --gw: 17px; }
  [data-module="header"] .pep-header-brand { background-position: 14px center; background-size: auto 46%%; }
  [data-module="header"] .pep-header-key { background: none; }
  [data-module="header"] .pep-header-kwrap::before { content: ""; position: absolute; inset: 3px 0; pointer-events: none; background: linear-gradient(118deg, #f4f7fb, #9aa3ae 30%%, #eef2f7 55%%, #8d96a1 80%%, #f4f7fb); clip-path: %(RINGK)s; opacity: .8; }
  [data-module="header"] .pep-header-keys { clip-path: %(OCT16)s; background: rgba(8, 10, 14, .78); -webkit-backdrop-filter: blur(14px); backdrop-filter: blur(14px); box-shadow: inset 0 0 0 1.5px rgba(207, 230, 255, .45); }
  [data-module="header"] .pep-header-keys .pep-header-key--hero { background: none; }
  [data-module="header"] .pep-header-keys .pep-header-kwrap::before { inset: 0; }
}
/* the sheet: the same glass frame; dark enough to read the list, clear enough to see the ground */
.pep-header-drop-glow, .pep-header-drop-rim { display: none; }
.pep-header-drop-in { clip-path: %(OCTGW)s; background: linear-gradient(160deg, rgba(207, 230, 255, .06), rgba(207, 230, 255, .012) 45%%, rgba(207, 230, 255, .04)), rgba(8, 10, 14, .7); -webkit-backdrop-filter: blur(16px) saturate(150%%); backdrop-filter: blur(16px) saturate(150%%); padding: 46px 40px 44px; }
@media (max-width: 1199px) { .pep-header-drop { border-image: none; } .pep-header-drop-in { clip-path: %(OCT16)s; padding: 22px 18px; box-shadow: inset 0 0 0 1.5px rgba(207, 230, 255, .45); } }
@media (prefers-reduced-motion: reduce) {
  body :is(%(K25)s), body :is(%(K25)s) > span, .pep-header-key, .pep-header-label { transition: none; }
  body :is(%(K25)s):hover:not(:disabled) { transform: none; } body :is(%(K25)s):hover:not(:disabled)::before { animation: none; }
}
</style>
''' % dict(K25=K25, RING=ring('var(--kc)', '4px'), OCTIN=oct_('calc(var(--kc) - 1.7px)'), FRAME=FRAME, FRAMEBAR=FRAMEBAR, GLASS=GLASS, OCTGW=oct_('calc(var(--gw) * .667)'),
           OCT13=oct_('13px'), OCT16=oct_('16px'), RINGK=ring('9px', '1.3px'))
sub('</head>', css + '</head>', 'R5 css')
open(dst, 'w', encoding='utf-8').write(s)
out_dir = os.path.join(os.path.dirname(os.path.abspath(dst)), 'assets', 'glass'); os.makedirs(out_dir, exist_ok=True)
for f in ('glass-frame.webp', 'glass-frame-bar.webp', 'wordmark.webp'): shutil.copyfile('/home/user/work/r4/fix/glass/' + f, os.path.join(out_dir, f))
print('apply_r5: glass frame everywhere; button 25; menu in chrome lettering; GRAND OPENING hero; Founders with the steps under the card')

#!/usr/bin/env python3
"""HOOKS worker: apply module 45-hooks to the PEPTICITY store page.

Usage:  python3 -I apply.py IN.html OUT.html

What it adds (and nothing else):
  1. <style data-pep-src="modules/45-hooks/hooks.css"> at the end of <head>
  2. four hook rooms, each inserted just BEFORE a module comment:
       01 FOUNDER CARD   (H63)  before <!-- module:12-standard -->   (after THE CREST)
       02 FIND YOUR PICKS (H64) before <!-- module:14-story -->      (after THE STANDARD)
       03 FIRST ACCESS   (H65)  before <!-- module:16-lineup -->     (after FROM VIAL TO SHELF)
       04 SHARE          (H66)  before <!-- module:22-doors -->      (after THE LINEUP)
  3. the overlay root (EXIT H67, PHONE BAR H68) just before <script data-pep-src="config.js">
  4. a new `hooks:` key in PEP_CONFIG, just before its `flags:` key (nothing else in config.js is touched)
  5. <script data-pep-src="modules/45-hooks/hooks.js"> at the end of <body>

Every insertion is wrapped in HOOKS:BEGIN / HOOKS:END markers and removed again before inserting, so running it twice
gives the same file. Each anchor must be found exactly once or the script stops with an error and writes nothing.
"""
import re
import sys


def die(msg):
    sys.stderr.write('apply.py (HOOKS): ' + msg + '\n')
    sys.exit(1)


def one(html, pattern, what, flags=0):
    found = list(re.finditer(pattern, html, flags))
    if len(found) != 1:
        die('anchor %s found %d times (expected exactly 1)' % (what, len(found)))
    return found[0]


def block(name, content):
    if not content.endswith('\n'):
        content += '\n'
    return '<!-- HOOKS:BEGIN %s -->\n%s<!-- HOOKS:END %s -->\n' % (name, content, name)


def strip_previous(html):
    html = re.sub(r'<!-- HOOKS:BEGIN ([a-z0-9-]+) -->\n.*?<!-- HOOKS:END \1 -->\n', '', html, flags=re.S)
    html = re.sub(r'  /\* HOOKS:BEGIN config \*/\n.*?  /\* HOOKS:END config \*/\n\n', '', html, flags=re.S)
    return html


def insert_before(html, pattern, what, text, flags=0):
    m = one(html, pattern, what, flags)
    return html[:m.start()] + text + html[m.start():]


def apply(html):
    html = strip_previous(html)
    if 'data-pep-src="modules/45-hooks/' in html or 'data-module="hooks"' in html:
        die('the page already holds a 45-hooks part outside the HOOKS markers; refusing to add a second one')

    # 1. the stylesheet, at the end of <head>
    html = insert_before(html, r'</head>\s*<body\b', '</head><body>',
                         block('css', '<style data-pep-src="modules/45-hooks/hooks.css">\n' + CSS + '</style>\n'))
    # 2. the four rooms, each before the module that follows it
    html = insert_before(html, re.escape('<!-- module:12-standard -->'), '<!-- module:12-standard -->', block('card', SEC_CARD))
    html = insert_before(html, re.escape('<!-- module:14-story -->'), '<!-- module:14-story -->', block('finder', SEC_FINDER))
    html = insert_before(html, re.escape('<!-- module:16-lineup -->'), '<!-- module:16-lineup -->', block('lots', SEC_LOTS))
    html = insert_before(html, re.escape('<!-- module:22-doors -->'), '<!-- module:22-doors -->', block('share', SEC_SHARE))
    # 3. the overlay root, after the last module and before the config
    html = insert_before(html, re.escape('<script data-pep-src="config.js">'), 'config.js script tag', block('overlays', OVERLAYS))
    # 4. PEP_CONFIG.hooks, inside the config script only, just before `flags:`
    cfg = one(html, r'<script data-pep-src="config\.js">(.*?)</script>', 'config.js block', re.S)
    body = cfg.group(1)
    if re.search(r'^\s*hooks\s*:', body, re.M):
        die('PEP_CONFIG already has a hooks: key outside the HOOKS markers')
    flag = one(body, r'^  flags: \{', 'PEP_CONFIG flags: key', re.M)
    snippet = '  /* HOOKS:BEGIN config */\n' + CONFIG + '  /* HOOKS:END config */\n\n'
    body = body[:flag.start()] + snippet + body[flag.start():]
    html = html[:cfg.start(1)] + body + html[cfg.end(1):]
    # 5. the script, at the end of <body>
    html = insert_before(html, r'</body>\s*</html>\s*$', '</body></html> at the end',
                         block('js', '<script data-pep-src="modules/45-hooks/hooks.js">\n' + JS + '</script>\n'))
    return html


def main():
    if len(sys.argv) != 3:
        die('usage: python3 -I apply.py IN.html OUT.html')
    src, dst = sys.argv[1], sys.argv[2]
    with open(src, 'r', encoding='utf-8') as f:
        html = f.read()
    out = apply(html)
    with open(dst, 'w', encoding='utf-8') as f:
        f.write(out)
    sys.stdout.write('apply.py (HOOKS): wrote %s (%d -> %d bytes)\n' % (dst, len(html), len(out)))


# ======================= the module's files, embedded (source: hooks/src/) =======================
CSS = r'''/* 45-hooks. Every selector starts with [data-module="hooks"] or .pep-hooks-
   THE HOOKS (HOOKS worker, Nov 13 2026): four asks placed as you go down the page (after THE CREST, after THE STANDARD,
   after FROM VIAL TO SHELF, after THE LINEUP), one quiet exit slide-in and one slim bar on phones. Each gives a real
   reason, asks for ONE field and joins the visitor to the FOUNDER CIRCLE.
   THE GLASS is the house glass of 22-doors, value for value (the same fill, blur(4px) saturate(160%), the chrome hairline
   round a cut shape, the wet light across the top corner). SEE-THROUGH RULE: nothing above a pane carries clip-path,
   filter, mask or an opacity below 1, so the reveal moves the frame with transform only and fades the pane itself.
   THE ONE BLUE: the logo's light, var(--pep-light) #2a78ff, its hot core var(--pep-beam) #cfe6ff. Light only.
   THE ONE GOLD: the FOUNDER badge on the card, the house chrome-gold ramp, nowhere else.
   HEADINGS: the store's 3D chrome (black chrome sides from data-text, a platinum face with the blue light through its
   waist) and a slow sheen that glides across the face. They never move. No flat white anywhere. */
[data-module="hooks"] {
  --pep-hooks-blue: var(--pep-light, #2a78ff);
  --pep-hooks-rgb: var(--pep-light-rgb, 42, 120, 255);
  --pep-hooks-ice: var(--pep-beam, #cfe6ff);
  --pep-hooks-cut: clamp(34px, 4.4vw, 72px);
  --pep-hooks-nick: clamp(12px, 1.2vw, 18px);
  --pep-hooks-pad-x: clamp(16px, 4vw, 64px);
  --pep-hooks-heavy: 700;
  --pep-hooks-chrome: linear-gradient(180deg,
    var(--pep-plat-4) 0%,
    var(--pep-plat-3) 28%,
    var(--pep-plat-2) 45%,
    color-mix(in srgb, var(--pep-hooks-blue) 62%, var(--pep-plat-1)) 51%,
    var(--pep-hooks-ice) 55%,
    var(--pep-plat-4) 62%,
    var(--pep-plat-3) 82%,
    var(--pep-plat-2) 100%);
  --pep-hooks-sheen: linear-gradient(100deg,
    rgba(var(--pep-hooks-rgb), 0) 0 40%,
    rgba(var(--pep-hooks-rgb), .5) 46%,
    var(--pep-hooks-ice) 50%,
    rgba(var(--pep-hooks-rgb), .5) 54%,
    rgba(var(--pep-hooks-rgb), 0) 60% 100%);
  position: relative;
  z-index: 1;
  color-scheme: dark;
  font-synthesis: none;
  color: var(--pep-plat-3);
}

/* ---------- a room: one ask, with real space round it ---------- */
.pep-hooks-room {
  --pep-hooks-pad-top: clamp(72px, 11vh, 132px);
  --pep-hooks-pad-bottom: clamp(72px, 11vh, 132px);
  padding: calc(var(--pep-hooks-pad-top) + var(--pep-hooks-extra-top, 0px)) var(--pep-hooks-pad-x) calc(var(--pep-hooks-pad-bottom) + var(--pep-hooks-extra-bottom, 0px));
}
/* the room before the doors keeps a clear screen under its ask, so the doors' forms never share a screen with it */
.pep-hooks-room[data-hooks="share"] { --pep-hooks-pad-bottom: max(56px, calc(100svh - 420px)); }

/* ---------- the frame (moves) > the glow (light under the pane) + the pane (see-through) ---------- */
.pep-hooks-frame {
  --a: var(--pep-hooks-cut);
  --b: var(--pep-hooks-nick);
  --c: var(--pep-hooks-cut);
  --d: var(--pep-hooks-nick);
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  transform: translateY(0);
  transition: transform .8s var(--pep-ease);
}
.pep-hooks-room[data-hooks="finder"] .pep-hooks-frame,
.pep-hooks-room[data-hooks="share"] .pep-hooks-frame { --a: var(--pep-hooks-nick); --b: var(--pep-hooks-cut); --c: var(--pep-hooks-nick); --d: var(--pep-hooks-cut); }
.pep-hooks-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .7;
  background:
    radial-gradient(50% 100% at 50% 100%, rgba(var(--pep-hooks-rgb), .55), rgba(var(--pep-hooks-rgb), .16) 38%, rgba(var(--pep-hooks-rgb), 0) 100%) left var(--d) bottom 0 / calc(100% - var(--c) - var(--d)) 52px no-repeat,
    radial-gradient(60% 100% at 50% 100%, rgba(var(--pep-hooks-rgb), .12), rgba(var(--pep-hooks-rgb), 0) 100%) left 0 bottom 0 / 100% 26% no-repeat,
    radial-gradient(40% 60% at 12% 0%, rgba(var(--pep-hooks-rgb), .1), rgba(var(--pep-hooks-rgb), 0) 100%);
  clip-path: polygon(var(--a) 0, calc(100% - var(--b)) 0, 100% var(--b), 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, var(--d) 100%, 0 calc(100% - var(--d)), 0 var(--a));
  transition: opacity .8s var(--pep-ease);
}
.pep-hooks-glass {
  position: relative;
  overflow: hidden;
  overflow: clip;                         /* never a scroll container: the travelling light must not let the pane be scrolled sideways */
  background: linear-gradient(158deg, rgba(230, 233, 237, .05), rgba(230, 233, 237, .006) 44%, rgba(230, 233, 237, .024));
  -webkit-backdrop-filter: blur(4px) saturate(160%);
          backdrop-filter: blur(4px) saturate(160%);
  clip-path: polygon(var(--a) 0, calc(100% - var(--b)) 0, 100% var(--b), 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, var(--d) 100%, 0 calc(100% - var(--d)), 0 var(--a));
  transition: opacity .8s var(--pep-ease);
}
@supports not ((backdrop-filter: blur(4px)) or (-webkit-backdrop-filter: blur(4px))) {
  .pep-hooks-glass { background: rgba(26, 26, 29, .9); }
}
/* the chrome hairline round the cut shape */
.pep-hooks-glass::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  opacity: .9;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-3) 20%, color-mix(in srgb, var(--pep-plat-2) 50%, var(--pep-plat-1)) 52%, var(--pep-plat-3) 84%, var(--pep-plat-4));
  clip-path: polygon(evenodd, var(--a) 0, calc(100% - var(--b)) 0, 100% var(--b), 100% calc(100% - var(--c)), calc(100% - var(--c)) 100%, var(--d) 100%, 0 calc(100% - var(--d)), 0 var(--a), var(--a) 0,
    calc(var(--a) + .42px) 1px, 1px calc(var(--a) + .42px), 1px calc(100% - var(--d) - .42px), calc(var(--d) + .42px) calc(100% - 1px), calc(100% - var(--c) - .42px) calc(100% - 1px), calc(100% - 1px) calc(100% - var(--c) - .42px), calc(100% - 1px) calc(var(--b) + .42px), calc(100% - var(--b) - .42px) 1px, calc(var(--a) + .42px) 1px);
}
/* wet light across the top corner */
.pep-hooks-glass::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
  background:
    linear-gradient(118deg, rgba(230, 233, 237, .18) 0, rgba(230, 233, 237, .045) 13%, rgba(230, 233, 237, 0) 28%),
    linear-gradient(302deg, rgba(230, 233, 237, .08) 0, rgba(230, 233, 237, 0) 16%);
}
.pep-hooks-bevel {
  position: absolute;
  inset: 0;
  z-index: 3;
  pointer-events: none;
  background: var(--pep-black-0);
  opacity: .7;
  clip-path: polygon(evenodd,
    calc(var(--a) + .42px) 1px, calc(100% - var(--b) - .42px) 1px, calc(100% - 1px) calc(var(--b) + .42px), calc(100% - 1px) calc(100% - var(--c) - .42px), calc(100% - var(--c) - .42px) calc(100% - 1px), calc(var(--d) + .42px) calc(100% - 1px), 1px calc(100% - var(--d) - .42px), 1px calc(var(--a) + .42px), calc(var(--a) + .42px) 1px,
    calc(var(--a) + .84px) 2px, 2px calc(var(--a) + .84px), 2px calc(100% - var(--d) - .84px), calc(var(--d) + .84px) calc(100% - 2px), calc(100% - var(--c) - .84px) calc(100% - 2px), calc(100% - 2px) calc(100% - var(--c) - .84px), calc(100% - 2px) calc(var(--b) + .84px), calc(100% - var(--b) - .84px) 2px, calc(var(--a) + .84px) 2px);
}
/* the logo's blade of light along the foot of the pane: an ice core inside the blue; it breathes, never blinks */
.pep-hooks-sill {
  position: absolute;
  z-index: 3;
  left: var(--d);
  right: var(--c);
  bottom: 2px;
  height: 3px;
  pointer-events: none;
  opacity: .85;
  background:
    linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0) 10%, var(--pep-hooks-ice) 36%, var(--pep-hooks-ice) 64%, rgba(var(--pep-hooks-rgb), 0) 90%) 0 1px / 100% 1px no-repeat,
    linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0) 2%, var(--pep-hooks-blue) 26%, var(--pep-hooks-blue) 74%, rgba(var(--pep-hooks-rgb), 0) 98%);
  animation: pep-hooks-breath 7s ease-in-out infinite alternate;
}
@keyframes pep-hooks-breath { from { opacity: .6; } to { opacity: .95; } }
/* ONE slow light, left to right, across the pane when it arrives */
.pep-hooks-sweep {
  position: absolute;
  z-index: 1;
  top: -20%;
  bottom: -20%;
  left: -60%;
  width: 38%;
  pointer-events: none;
  opacity: 0;
  transform: skewX(-16deg);
  background: linear-gradient(100deg, rgba(var(--pep-hooks-rgb), 0), rgba(var(--pep-hooks-rgb), .06) 28%, rgba(var(--pep-hooks-rgb), .22) 45%, color-mix(in srgb, var(--pep-hooks-ice) 44%, transparent) 50%, rgba(var(--pep-hooks-rgb), .22) 55%, rgba(var(--pep-hooks-rgb), .06) 72%, rgba(var(--pep-hooks-rgb), 0));
}
@keyframes pep-hooks-sweep {
  0% { transform: translateX(0) skewX(-16deg); opacity: 0; }
  10% { opacity: .55; }
  82% { opacity: .55; }
  100% { transform: translateX(480%) skewX(-16deg); opacity: 0; }
}
.pep-hooks-in {
  position: relative;
  z-index: 2;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(26px, 3.4vw, 56px);
  padding: calc(var(--pep-hooks-cut) * .7) clamp(20px, 3.4vw, 60px) clamp(34px, 3.6vw, 56px);
}
@media (min-width: 900px) {
  .pep-hooks-in { grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); align-items: center; }
}

/* the reveal (only once the script runs): the pane glides up and its light comes on. It is never hidden, so the pane
   reads even if the page holds its frames back. */
[data-module="hooks"][data-hooks-js] .pep-hooks-frame { transform: translateY(26px); }
[data-module="hooks"][data-hooks-js] .pep-hooks-frame > .pep-hooks-glow { opacity: .3; }
[data-module="hooks"][data-hooks-js] .pep-hooks-frame[data-revealed] { transform: translateY(0); }
[data-module="hooks"][data-hooks-js] .pep-hooks-frame[data-revealed] > .pep-hooks-glow { opacity: .7; }
.pep-hooks-frame[data-revealed] .pep-hooks-sweep { animation: pep-hooks-sweep 1.5s ease-in-out .25s 1 both; }

/* ---------- 3D CHROME HEADINGS: black chrome sides from data-text, a platinum face, the blue light through its waist,
   and the slow sheen. Nothing here moves the heading: only the light travels. ---------- */
.pep-hooks-head,
.pep-hooks-done {
  --pep-hooks-lh: 1.08;
  --pep-hooks-step: .016em;
  position: relative;
  isolation: isolate;
  display: block;
  margin: 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  line-height: var(--pep-hooks-lh);
  letter-spacing: .05em;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--pep-plat-3);
}
.pep-hooks-head { font-size: clamp(32px, 4.3vw, 66px); }
.pep-hooks-done { font-size: clamp(24px, 2.6vw, 38px); outline: 0; }
.pep-hooks-head::before,
.pep-hooks-done::before {
  content: attr(data-text);
  content: attr(data-text) / "";
  position: absolute;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  color: var(--pep-black-0);
  text-shadow:
    calc(var(--pep-hooks-step) * 1) calc(var(--pep-hooks-step) * 1.2) 0 var(--pep-plat-1),
    calc(var(--pep-hooks-step) * 2) calc(var(--pep-hooks-step) * 2.4) 0 var(--pep-plat-2),
    calc(var(--pep-hooks-step) * 3) calc(var(--pep-hooks-step) * 3.6) 0 color-mix(in srgb, var(--pep-plat-1) 55%, var(--pep-black-0)),
    calc(var(--pep-hooks-step) * 4) calc(var(--pep-hooks-step) * 4.8) 0 color-mix(in srgb, var(--pep-black-0) 45%, black),
    calc(var(--pep-hooks-step) * 5) calc(var(--pep-hooks-step) * 6) 0 color-mix(in srgb, var(--pep-plat-1) 78%, var(--pep-plat-2)),
    calc(var(--pep-hooks-step) * 6) calc(var(--pep-hooks-step) * 7.2) 0 var(--pep-black-0),
    calc(var(--pep-hooks-step) * 7) calc(var(--pep-hooks-step) * 8.4) 0 color-mix(in srgb, var(--pep-black-0) 45%, black),
    .13em .19em .16em rgba(0, 0, 0, .88);
}
.pep-hooks-face {
  display: block;
  background-image: var(--pep-hooks-sheen), var(--pep-hooks-chrome);
  background-size: 300% 100%, 100% calc(var(--pep-hooks-lh) * 1em);
  background-position: 130% 0, 0 0;
  background-repeat: no-repeat, repeat-y;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pep-hooks-shine 8s ease-in-out infinite;
}
@keyframes pep-hooks-shine {
  0% { background-position: 130% 0, 0 0; }
  60%, 100% { background-position: -30% 0, 0 0; }
}
/* small chrome lettering: eyebrows, labels, notes on chrome (never flat white) */
.pep-hooks-eyebrow,
.pep-hooks-label,
.pep-hooks-q,
.pep-hooks-tag {
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  text-transform: uppercase;
  background-image: linear-gradient(180deg, var(--pep-plat-4), var(--pep-plat-3) 46%, color-mix(in srgb, var(--pep-hooks-blue) 40%, var(--pep-plat-3)) 54%, var(--pep-plat-4));
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pep-hooks-eyebrow {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 clamp(12px, 1.6vh, 20px);
  font-size: 14px;
  letter-spacing: .26em;
}
.pep-hooks-eyebrow::before {
  content: "";
  flex: 0 0 auto;
  width: 34px;
  height: 2px;
  background: linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0), var(--pep-hooks-blue) 40%, var(--pep-hooks-ice));
}
.pep-hooks-lede {
  margin: clamp(14px, 2vh, 22px) 0 0;
  max-width: 34em;
  font-size: clamp(16px, 1.25vw, 19px);
  line-height: 1.55;
  color: var(--pep-plat-3);
}
.pep-hooks-lede b, .pep-hooks-lede strong { font-weight: 600; color: var(--pep-plat-4); }

/* ---------- forms ---------- */
.pep-hooks-form { position: relative; min-width: 0; margin: 0; }
.pep-hooks-step { animation: pep-hooks-step-in .6s var(--pep-ease) both; }
@keyframes pep-hooks-step-in { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
.pep-hooks-prompt {
  margin: 0 0 16px;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(18px, 1.5vw, 23px);
  line-height: 1.25;
  letter-spacing: .08em;
  text-transform: uppercase;
  background-image: var(--pep-hooks-chrome);
  background-size: 100% 1.25em;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pep-hooks-prompt--gap { margin-top: 24px; }
.pep-hooks-field--gap { margin-top: 18px; }
.pep-hooks-field { display: flex; flex-direction: column; min-width: 0; }
.pep-hooks-label { display: block; margin: 0 0 8px; font-size: 14px; line-height: 1.2; letter-spacing: .2em; }
.pep-hooks-well {
  --k: 16px;
  --t: 1px;
  position: relative;
  display: block;
  height: 58px;
  background: rgba(0, 0, 0, .3);
  clip-path: polygon(var(--k) 0, 100% 0, 100% calc(100% - var(--k)), calc(100% - var(--k)) 100%, 0 100%, 0 var(--k));
  transition: background-color .3s ease;
}
.pep-hooks-well::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .62;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 34%, var(--pep-plat-1) 58%, var(--pep-plat-3));
  clip-path: polygon(evenodd, var(--k) 0, 100% 0, 100% calc(100% - var(--k)), calc(100% - var(--k)) 100%, 0 100%, 0 var(--k), var(--k) 0,
    calc(var(--k) + var(--t) * .42) var(--t), var(--t) calc(var(--k) + var(--t) * .42), var(--t) calc(100% - var(--t)), calc(100% - var(--k) - var(--t) * .42) calc(100% - var(--t)), calc(100% - var(--t)) calc(100% - var(--k) - var(--t) * .42), calc(100% - var(--t)) var(--t), calc(var(--k) + var(--t) * .42) var(--t));
}
.pep-hooks-well::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 3px;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0), var(--pep-hooks-blue) 24%, var(--pep-hooks-ice) 50%, var(--pep-hooks-blue) 76%, rgba(var(--pep-hooks-rgb), 0));
  transform: scaleX(0);
  transition: transform .45s var(--pep-ease);
}
.pep-hooks-input {
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0 18px;
  font-size: 18px;
  color: var(--pep-plat-4);
  background: transparent;
  border: 0;
  border-radius: 0;
  outline: 0;
  caret-color: var(--pep-hooks-blue);
}
.pep-hooks-input:focus-visible { box-shadow: none; }
.pep-hooks-input[readonly] { font-size: 15px; letter-spacing: .02em; color: var(--pep-plat-3); }
.pep-hooks-well:focus-within { --t: 2px; background: rgba(var(--pep-hooks-rgb), .1); }
.pep-hooks-well:focus-within::before { opacity: 1; background: linear-gradient(150deg, var(--pep-hooks-ice), var(--pep-hooks-blue) 34%, var(--pep-hooks-blue) 66%, var(--pep-hooks-ice)); }
.pep-hooks-well:focus-within::after { transform: scaleX(1); }
.pep-hooks-well[data-bad] { --t: 2px; }
.pep-hooks-well[data-bad]::before { opacity: 1; background: linear-gradient(150deg, var(--pep-hooks-ice), var(--pep-hooks-blue) 50%, var(--pep-hooks-ice)); }
.pep-hooks-hint { margin: 8px 0 0; font-size: 14px; line-height: 1.45; color: var(--pep-plat-3); }
.pep-hooks-err {
  position: relative;
  margin: 8px 0 0;
  padding-left: 22px;
  font-size: 15px;
  line-height: 1.4;
  color: var(--pep-hooks-ice);
}
.pep-hooks-err::before {
  content: "";
  position: absolute;
  left: 0;
  top: .22em;
  width: 13px;
  height: 13px;
  background: var(--pep-hooks-blue);
  clip-path: polygon(0 0, 100% 50%, 0 100%, 34% 50%);
}
/* consent: a cut tick box in a chrome rim; the whole row is the target */
.pep-hooks-consent {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  min-height: 44px;
  margin: 16px 0 0;
  font-size: 15px;
  line-height: 1.45;
  color: var(--pep-plat-3);
  cursor: pointer;
}
.pep-hooks-tick {
  flex: 0 0 auto;
  display: block;
  width: 30px;
  height: 30px;
  margin-top: 1px;
  padding: 1.5px;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 45%, var(--pep-plat-1) 60%, var(--pep-plat-3));
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
}
.pep-hooks-check {
  -webkit-appearance: none;
          appearance: none;
  display: block;
  width: 100%;
  height: 100%;
  margin: 0;
  border: 0;
  border-radius: 0;
  outline: 0;
  cursor: pointer;
  background: var(--pep-black-0) no-repeat 50% 50% / 20px 20px;
  clip-path: polygon(9.4px 0, 100% 0, 100% calc(100% - 9.4px), calc(100% - 9.4px) 100%, 0 100%, 0 9.4px);
  transition: background-color .25s ease;
}
.pep-hooks-check:focus-visible { box-shadow: none; }
.pep-hooks-check:checked {
  background-color: var(--pep-plat-4);
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 20 20'><path d='M3.5 10.5 8 15 16.5 5' fill='none' stroke='%230b0b0c' stroke-width='3' stroke-linecap='square' stroke-linejoin='miter'/></svg>");
}
.pep-hooks-tick:has(.pep-hooks-check:focus-visible) { background: var(--pep-hooks-blue); padding: 2.5px; }
.pep-hooks-tick:has(.pep-hooks-check[aria-invalid="true"]) { background: linear-gradient(150deg, var(--pep-hooks-ice), var(--pep-hooks-blue)); padding: 2.5px; }
.pep-hooks-consent:has(.pep-hooks-check:focus-visible) .pep-hooks-consent-text { color: var(--pep-plat-4); }
.pep-hooks-fine { margin: 14px 0 0; font-size: 14px; line-height: 1.45; color: var(--pep-plat-3); }
/* the preview line, as the hero's: shown after a success only while a preview build has no list connected */
.pep-hooks-preview { margin: 14px 0 0; padding-top: 12px; border-top: 1px solid var(--pep-plat-1); font: 400 14px/1.5 var(--pep-font-display); letter-spacing: .06em; text-transform: uppercase; color: var(--pep-plat-3); }
/* the line a friend sees when a member's share link brought them: chrome with the blue through it, like the eyebrows */
.pep-hooks-invited {
  margin: 0 0 clamp(10px, 1.4vh, 16px);
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(15px, 1.3vw, 19px);
  line-height: 1.25;
  letter-spacing: .14em;
  text-transform: uppercase;
  background-image: linear-gradient(180deg, var(--pep-hooks-ice), color-mix(in srgb, var(--pep-hooks-blue) 55%, var(--pep-plat-4)) 58%, var(--pep-hooks-ice));
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* the button: a chrome plate with a cut corner and an arrow end; it keeps its size while it sends.
   Hover and keyboard focus lift it and grow its words. */
.pep-hooks-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 62px;
  margin: 18px 0 0;
  padding: 10px 48px 10px 30px;
  overflow: hidden;
  cursor: pointer;
  border: 0;
  border-radius: 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(16px, 1.25vw, 20px);
  line-height: 1.2;
  letter-spacing: .15em;
  text-transform: uppercase;
  text-wrap: balance;
  color: var(--pep-black-0);
  background: linear-gradient(100deg, var(--pep-plat-3) 0%, var(--pep-plat-4) 16%, var(--pep-plat-3) 30%, var(--pep-plat-2) 50%, var(--pep-plat-3) 66%, var(--pep-plat-4) 82%, var(--pep-plat-3) 100%);
  clip-path: polygon(18px 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 0 18px);
  transform: translateY(0);
  transition: transform .45s var(--pep-ease), filter .45s ease;
}
.pep-hooks-btn::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -70%;
  width: 55%;
  pointer-events: none;
  background: linear-gradient(100deg, rgba(var(--pep-hooks-rgb), 0), color-mix(in srgb, var(--pep-hooks-ice) 82%, transparent), rgba(var(--pep-hooks-rgb), 0));
  transform: translateX(0);
}
.pep-hooks-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  opacity: 0;
  background: var(--pep-hooks-blue);
  clip-path: polygon(evenodd, 18px 0, calc(100% - 28px) 0, 100% 50%, calc(100% - 28px) 100%, 0 100%, 0 18px, 18px 0,
    19.2px 3px, 3px 19.2px, 3px calc(100% - 3px), calc(100% - 29.4px) calc(100% - 3px), calc(100% - 4px) 50%, calc(100% - 29.4px) 3px, 19.2px 3px);
}
.pep-hooks-btn:focus-visible { outline: 0; box-shadow: none; transform: translateY(-3px); filter: brightness(1.08); }
.pep-hooks-btn:focus-visible::before { opacity: 1; }
.pep-hooks-btn:active { transform: translateY(1px); filter: brightness(.96); }
.pep-hooks-btn-word { position: relative; z-index: 1; display: inline-block; transform: scale(1); transition: opacity .3s ease, transform .45s var(--pep-ease); }
.pep-hooks-btn:focus-visible .pep-hooks-btn-word { transform: scale(1.05); }
.pep-hooks-btn-ring,
.pep-hooks-btn-done { position: absolute; left: 50%; top: 50%; opacity: 0; }
.pep-hooks-btn-ring { width: 20px; height: 20px; margin: -10px 0 0 -10px; border: 2px solid rgba(11, 11, 12, .25); border-top-color: var(--pep-black-0); border-right-color: var(--pep-black-0); border-radius: 0; }
.pep-hooks-btn-done { width: 26px; height: 26px; margin: -13px 0 0 -13px; }
.pep-hooks-btn-done::before {
  content: "";
  position: absolute;
  left: 7px;
  top: 2px;
  width: 9px;
  height: 16px;
  border-right: 3px solid var(--pep-black-0);
  border-bottom: 3px solid var(--pep-black-0);
  transform: rotate(45deg) scale(.4);
  transition: transform .35s var(--pep-ease);
}
.pep-hooks-sending .pep-hooks-btn-word,
.pep-hooks-sent .pep-hooks-btn-word { opacity: 0; }
.pep-hooks-sending .pep-hooks-btn-ring { opacity: 1; animation: pep-hooks-turn .7s linear infinite; }
.pep-hooks-sent .pep-hooks-btn-done { opacity: 1; }
.pep-hooks-sent .pep-hooks-btn-done::before { transform: rotate(45deg) scale(1); }
@keyframes pep-hooks-turn { to { transform: rotate(360deg); } }

/* the quiet second action: a slashed blade with a chrome rim */
.pep-hooks-alt,
.pep-hooks-go {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  margin: 14px 12px 0 0;
  padding: 10px 30px 10px 24px;
  cursor: pointer;
  border: 0;
  border-radius: 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: 15px;
  line-height: 1.2;
  letter-spacing: .16em;
  text-transform: uppercase;
  text-decoration: none;
  color: var(--pep-plat-4);
  background: rgba(230, 233, 237, .06);
  clip-path: polygon(16px 0, 100% 0, calc(100% - 18px) 100%, 0 100%, 0 16px);
  transform: translateY(0);
  transition: transform .45s var(--pep-ease), background-color .3s ease;
}
.pep-hooks-alt::before,
.pep-hooks-go::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 40%, var(--pep-plat-1) 60%, var(--pep-plat-3));
  clip-path: polygon(evenodd, 16px 0, 100% 0, calc(100% - 18px) 100%, 0 100%, 0 16px, 16px 0,
    17.2px 1.5px, 1.5px 17.2px, 1.5px calc(100% - 1.5px), calc(100% - 19.6px) calc(100% - 1.5px), calc(100% - 2.2px) 1.5px, 17.2px 1.5px);
}
.pep-hooks-go { color: var(--pep-hooks-ice); background: rgba(var(--pep-hooks-rgb), .14); }
.pep-hooks-alt span,
.pep-hooks-go span { display: inline-block; transform: scale(1); transition: transform .45s var(--pep-ease); }
.pep-hooks-alt:focus-visible,
.pep-hooks-go:focus-visible { outline: 0; transform: translateY(-3px); background-color: rgba(var(--pep-hooks-rgb), .22); }
.pep-hooks-alt:focus-visible span,
.pep-hooks-go:focus-visible span { transform: scale(1.05); }

.pep-hooks-next { margin: 12px 0 0; font-size: clamp(16px, 1.2vw, 18px); line-height: 1.5; color: var(--pep-plat-3); }

/* NO FLAT WHITE (Jeff, Nov 13): words on tiles, quiet buttons, facts, ways and picks wear the chrome, never a flat fill */
.pep-hooks-tile-word,
.pep-hooks-alt span,
.pep-hooks-fact-line,
.pep-hooks-way-head,
.pep-hooks-pick-name {
  background-image: linear-gradient(180deg, var(--pep-plat-4), var(--pep-plat-3) 46%, color-mix(in srgb, var(--pep-hooks-blue) 40%, var(--pep-plat-3)) 54%, var(--pep-plat-4));
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pep-hooks-go span {
  background-image: linear-gradient(180deg, var(--pep-hooks-ice), color-mix(in srgb, var(--pep-hooks-blue) 55%, var(--pep-plat-4)) 58%, var(--pep-hooks-ice));
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* frosted numbers: a speckled near-opaque face with the blue under it */
.pep-hooks-num {
  display: inline-block;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  line-height: 1;
  letter-spacing: .04em;
  background-image:
    url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='s'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .9  0 0 0 0 .93  0 0 0 0 1  0 0 0 3 -1.45'/></filter><rect width='140' height='140' filter='url(%23s)'/></svg>"),
    linear-gradient(180deg, rgba(230, 233, 237, .94), rgba(185, 190, 197, .76) 55%, rgba(107, 112, 119, .84));
  background-size: 140px 140px, 100% 100%;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 10px rgba(var(--pep-hooks-rgb), .45));
}

/* ---------- 01 THE FOUNDER CARD (H63) ---------- */
.pep-hooks-cardwrap { display: flex; justify-content: center; min-width: 0; }
.pep-hooks-card {
  --ck: clamp(22px, 2.6vw, 38px);
  position: relative;
  width: min(100%, 470px);
  aspect-ratio: 1.586;
  padding: clamp(16px, 2vw, 28px) clamp(18px, 2.2vw, 30px);
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow: hidden;
  overflow: clip;
  background:
    radial-gradient(90% 70% at 18% 108%, rgba(var(--pep-hooks-rgb), .38), rgba(var(--pep-hooks-rgb), 0) 62%),
    linear-gradient(135deg, rgba(42, 45, 49, .92), rgba(11, 11, 12, .94) 46%, rgba(20, 20, 22, .96) 70%, rgba(42, 45, 49, .9));
  clip-path: polygon(var(--ck) 0, 100% 0, 100% calc(100% - var(--ck)), calc(100% - var(--ck)) 100%, 0 100%, 0 var(--ck));
  box-shadow: inset 0 0 0 1px rgba(185, 190, 197, .2);
}
.pep-hooks-card::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 30%, var(--pep-plat-1) 55%, var(--pep-plat-3) 80%, var(--pep-plat-4));
  clip-path: polygon(evenodd, var(--ck) 0, 100% 0, 100% calc(100% - var(--ck)), calc(100% - var(--ck)) 100%, 0 100%, 0 var(--ck), var(--ck) 0,
    calc(var(--ck) + .6px) 1.5px, 1.5px calc(var(--ck) + .6px), 1.5px calc(100% - 1.5px), calc(100% - var(--ck) - .6px) calc(100% - 1.5px), calc(100% - 1.5px) calc(100% - var(--ck) - .6px), calc(100% - 1.5px) 1.5px, calc(var(--ck) + .6px) 1.5px);
}
/* the card's own slow light, gliding across it */
.pep-hooks-card::after {
  content: "";
  position: absolute;
  top: -30%;
  bottom: -30%;
  left: -50%;
  width: 34%;
  pointer-events: none;
  background: linear-gradient(100deg, rgba(var(--pep-hooks-rgb), 0), rgba(var(--pep-hooks-rgb), .14) 40%, color-mix(in srgb, var(--pep-hooks-ice) 30%, transparent) 50%, rgba(var(--pep-hooks-rgb), .14) 60%, rgba(var(--pep-hooks-rgb), 0));
  transform: translateX(0) skewX(-16deg);
  animation: pep-hooks-cardlight 9s ease-in-out infinite;
}
@keyframes pep-hooks-cardlight {
  0%, 30% { transform: translateX(0) skewX(-16deg); opacity: 0; }
  36% { opacity: 1; }
  70% { opacity: 1; }
  76%, 100% { transform: translateX(520%) skewX(-16deg); opacity: 0; }
}
.pep-hooks-card-top { position: relative; z-index: 1; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
/* the brand on the card: the live P (02-logo3d draws it into the slot, logo 07) and PEPTICITY in the owner's type */
.pep-hooks-card-brand { display: inline-flex; align-items: center; gap: 6px; min-width: 0; }
.pep-hooks-card-mark { display: block; flex: none; width: clamp(48px, 4.6vw, 66px); aspect-ratio: 1 / .82; margin: -12px -6px -14px -10px; }
.pep-hooks-room[data-hooks-3d="off"] .pep-hooks-card-mark { display: none; }
.pep-hooks-card-word {
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(14px, 1.35vw, 19px);
  line-height: 1.1;
  letter-spacing: .14em;
  white-space: nowrap;
  background-image: var(--pep-hooks-chrome);
  background-size: 100% 1.1em;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
/* THE ONE GOLD: the founder badge, in the house chrome-gold ramp */
.pep-hooks-badge {
  position: relative;
  padding: 7px 16px 7px 14px;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: 13px;
  letter-spacing: .24em;
  color: var(--pep-gold-1);
  background: linear-gradient(100deg, var(--pep-gold-3) 0%, var(--pep-gold-4) 22%, var(--pep-gold-3) 46%, var(--pep-gold-2) 60%, var(--pep-gold-3) 78%, var(--pep-gold-4) 100%);
  clip-path: polygon(9px 0, 100% 0, calc(100% - 9px) 100%, 0 100%);
}
.pep-hooks-card-circle {
  position: relative;
  z-index: 1;
  align-self: end;
  margin: 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: 13px;
  letter-spacing: .3em;
  color: var(--pep-plat-3);
}
.pep-hooks-card-name {
  position: relative;
  z-index: 1;
  margin: 6px 0 0;
  min-height: 1.1em;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(26px, 3.1vw, 44px);
  line-height: 1.1;
  letter-spacing: .06em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: clip;
  background-image: var(--pep-hooks-sheen), var(--pep-hooks-chrome);
  background-size: 300% 100%, 100% 1.1em;
  background-position: 130% 0, 0 0;
  background-repeat: no-repeat, repeat-y;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: pep-hooks-shine 8s ease-in-out infinite;
}
.pep-hooks-card-name[data-empty] { opacity: .42; }
/* the logo's own accent: a short blade of the blue light under the name */
.pep-hooks-card-light {
  position: relative;
  z-index: 1;
  display: block;
  width: 46%;
  height: 3px;
  margin: 10px 0 0;
  background:
    linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0), var(--pep-hooks-ice) 30%, var(--pep-hooks-ice) 60%, rgba(var(--pep-hooks-rgb), 0)) 0 1px / 100% 1px no-repeat,
    linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0), var(--pep-hooks-blue) 20%, var(--pep-hooks-blue) 70%, rgba(var(--pep-hooks-rgb), 0));
  filter: drop-shadow(0 0 6px rgba(var(--pep-hooks-rgb), .9));
}
.pep-hooks-card-foot {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin: 12px 0 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: 13px;
  letter-spacing: .22em;
  color: var(--pep-plat-3);
}
.pep-hooks-card-foot .pep-hooks-num { font-size: 18px; letter-spacing: .14em; }

/* ---------- 02 FIND YOUR PICKS (H64) ---------- */
.pep-hooks-in--wide { grid-template-columns: minmax(0, 1fr) !important; }
.pep-hooks-finder { min-width: 0; }
.pep-hooks-notches { display: flex; gap: 10px; margin: 0 0 18px; padding: 0; list-style: none; }
.pep-hooks-notch {
  width: 44px;
  height: 6px;
  background: rgba(185, 190, 197, .22);
  clip-path: polygon(4px 0, 100% 0, calc(100% - 4px) 100%, 0 100%);
  transition: background-color .4s ease;
}
.pep-hooks-notch[data-lit] { background: linear-gradient(90deg, var(--pep-hooks-blue), var(--pep-hooks-ice)); }
.pep-hooks-q { margin: 0 0 16px; font-size: clamp(18px, 1.6vw, 24px); line-height: 1.25; letter-spacing: .1em; }
.pep-hooks-tiles { display: grid; grid-template-columns: minmax(0, 1fr); gap: clamp(10px, 1.2vw, 18px); margin: 0; padding: 0; list-style: none; }
@media (min-width: 640px) { .pep-hooks-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.pep-hooks-tile {
  --tk: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 4px;
  width: 100%;
  min-height: 84px;
  padding: 14px 22px;
  cursor: pointer;
  border: 0;
  border-radius: 0;
  text-align: left;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(16px, 1.3vw, 20px);
  line-height: 1.2;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--pep-plat-4);
  background: linear-gradient(158deg, rgba(230, 233, 237, .07), rgba(230, 233, 237, .015) 50%, rgba(var(--pep-hooks-rgb), .06));
  clip-path: polygon(var(--tk) 0, 100% 0, 100% calc(100% - var(--tk)), calc(100% - var(--tk)) 100%, 0 100%, 0 var(--tk));
  transform: translateY(0);
  transition: transform .45s var(--pep-ease), background-color .3s ease;
}
.pep-hooks-tile::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 36%, var(--pep-plat-1) 60%, var(--pep-plat-3));
  opacity: .75;
  clip-path: polygon(evenodd, var(--tk) 0, 100% 0, 100% calc(100% - var(--tk)), calc(100% - var(--tk)) 100%, 0 100%, 0 var(--tk), var(--tk) 0,
    calc(var(--tk) + .6px) 1.5px, 1.5px calc(var(--tk) + .6px), 1.5px calc(100% - 1.5px), calc(100% - var(--tk) - .6px) calc(100% - 1.5px), calc(100% - 1.5px) calc(100% - var(--tk) - .6px), calc(100% - 1.5px) 1.5px, calc(var(--tk) + .6px) 1.5px);
}
.pep-hooks-tile::after {
  content: "";
  position: absolute;
  left: var(--tk);
  right: var(--tk);
  bottom: 2px;
  height: 2px;
  pointer-events: none;
  background: linear-gradient(90deg, rgba(var(--pep-hooks-rgb), 0), var(--pep-hooks-blue) 30%, var(--pep-hooks-ice) 50%, var(--pep-hooks-blue) 70%, rgba(var(--pep-hooks-rgb), 0));
  transform: scaleX(0);
  transition: transform .45s var(--pep-ease);
}
.pep-hooks-tile-word { display: inline-block; transform: scale(1); transform-origin: 0 50%; transition: transform .45s var(--pep-ease); }
.pep-hooks-tile:focus-visible { outline: 0; box-shadow: none; transform: translateY(-4px); background-color: rgba(var(--pep-hooks-rgb), .12); }
.pep-hooks-tile:focus-visible::after { transform: scaleX(1); }
.pep-hooks-tile:focus-visible .pep-hooks-tile-word { transform: scale(1.06); }
.pep-hooks-picks { display: grid; gap: 12px; margin: 0; padding: 0; list-style: none; }
.pep-hooks-pick {
  --pk: 16px;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px 18px;
  padding: 14px 18px 14px 22px;
  background: linear-gradient(158deg, rgba(230, 233, 237, .06), rgba(230, 233, 237, .01) 60%);
  clip-path: polygon(var(--pk) 0, 100% 0, 100% calc(100% - var(--pk)), calc(100% - var(--pk)) 100%, 0 100%, 0 var(--pk));
}
.pep-hooks-pick::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .6;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 36%, var(--pep-plat-1) 60%, var(--pep-plat-3));
  clip-path: polygon(evenodd, var(--pk) 0, 100% 0, 100% calc(100% - var(--pk)), calc(100% - var(--pk)) 100%, 0 100%, 0 var(--pk), var(--pk) 0,
    calc(var(--pk) + .5px) 1px, 1px calc(var(--pk) + .5px), 1px calc(100% - 1px), calc(100% - var(--pk) - .5px) calc(100% - 1px), calc(100% - 1px) calc(100% - var(--pk) - .5px), calc(100% - 1px) 1px, calc(var(--pk) + .5px) 1px);
}
.pep-hooks-pick-name { min-width: 0; font-family: var(--pep-font-display); font-weight: var(--pep-hooks-heavy); font-size: clamp(16px, 1.4vw, 21px); letter-spacing: .08em; text-transform: uppercase; color: var(--pep-plat-4); overflow-wrap: anywhere; }
.pep-hooks-pick-size { display: block; margin-top: 3px; font-size: 14px; letter-spacing: .12em; text-transform: uppercase; color: var(--pep-plat-3); }
.pep-hooks-pick-price { font-size: clamp(22px, 1.9vw, 28px); }
.pep-hooks-pick-cad { margin-left: 6px; font-family: var(--pep-font-display); font-size: 13px; letter-spacing: .16em; color: var(--pep-plat-3); }
.pep-hooks-pick-deal { display: inline-flex; align-items: baseline; white-space: nowrap; }
.pep-hooks-add {
  position: relative;
  min-height: 44px;
  padding: 8px 18px;
  cursor: pointer;
  border: 0;
  border-radius: 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: 14px;
  letter-spacing: .14em;
  text-transform: uppercase;
  color: var(--pep-black-0);
  background: linear-gradient(100deg, var(--pep-plat-3), var(--pep-plat-4) 30%, var(--pep-plat-2) 60%, var(--pep-plat-3));
  clip-path: polygon(10px 0, 100% 0, calc(100% - 10px) 100%, 0 100%);
  transform: translateY(0);
  transition: transform .45s var(--pep-ease);
}
.pep-hooks-add:focus-visible { outline: 0; transform: translateY(-3px); box-shadow: inset 0 -3px 0 var(--pep-hooks-blue); }
.pep-hooks-add[data-added] { color: var(--pep-hooks-ice); background: rgba(var(--pep-hooks-rgb), .3); }
@media (max-width: 560px) {
  .pep-hooks-pick { grid-template-columns: minmax(0, 1fr) auto; }
  .pep-hooks-add { grid-column: 1 / -1; }
}
.pep-hooks-row { display: flex; flex-wrap: wrap; align-items: center; }

/* ---------- 03 FIRST ACCESS (H65): three frosted facts beside the form ---------- */
.pep-hooks-facts { display: grid; gap: 14px; margin: clamp(18px, 2.4vh, 28px) 0 0; padding: 0; list-style: none; }
.pep-hooks-fact { display: grid; grid-template-columns: auto minmax(0, 1fr); align-items: center; gap: 16px; }
.pep-hooks-fact .pep-hooks-num { min-width: 1.5em; font-size: clamp(30px, 2.8vw, 42px); }
.pep-hooks-fact-line { font-family: var(--pep-font-display); font-weight: var(--pep-hooks-heavy); font-size: clamp(14px, 1.1vw, 17px); line-height: 1.35; letter-spacing: .12em; text-transform: uppercase; color: var(--pep-plat-4); }

/* ---------- 04 SHARE (H66): the link, and the three ways under the pane ---------- */
.pep-hooks-reward {
  margin: clamp(14px, 2vh, 22px) 0 0;
  font-family: var(--pep-font-display);
  font-weight: var(--pep-hooks-heavy);
  font-size: clamp(22px, 2.2vw, 32px);
  line-height: 1.2;
  letter-spacing: .08em;
  background-image: var(--pep-hooks-chrome);
  background-size: 100% 1.2em;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 14px rgba(var(--pep-hooks-rgb), .35));
}
.pep-hooks-ways {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: clamp(12px, 1.6vw, 22px);
  max-width: 1200px;
  margin: clamp(22px, 3vh, 36px) auto 0;
  padding: 0;
  list-style: none;
}
@media (min-width: 760px) { .pep-hooks-ways { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
.pep-hooks-way {
  --wk: 20px;
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 4px 16px;
  padding: 18px 22px;
  background: linear-gradient(158deg, rgba(230, 233, 237, .05), rgba(230, 233, 237, .008) 55%, rgba(var(--pep-hooks-rgb), .05));
  -webkit-backdrop-filter: blur(4px) saturate(160%);
          backdrop-filter: blur(4px) saturate(160%);
  clip-path: polygon(var(--wk) 0, 100% 0, 100% calc(100% - var(--wk)), calc(100% - var(--wk)) 100%, 0 100%, 0 var(--wk));
}
.pep-hooks-way::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: .7;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 36%, var(--pep-plat-1) 60%, var(--pep-plat-3));
  clip-path: polygon(evenodd, var(--wk) 0, 100% 0, 100% calc(100% - var(--wk)), calc(100% - var(--wk)) 100%, 0 100%, 0 var(--wk), var(--wk) 0,
    calc(var(--wk) + .5px) 1px, 1px calc(var(--wk) + .5px), 1px calc(100% - 1px), calc(100% - var(--wk) - .5px) calc(100% - 1px), calc(100% - 1px) calc(100% - var(--wk) - .5px), calc(100% - 1px) 1px, calc(var(--wk) + .5px) 1px);
}
.pep-hooks-way .pep-hooks-num { grid-row: span 2; min-width: 1.5em; font-size: clamp(34px, 3vw, 46px); }
.pep-hooks-way-head { margin: 0; font-family: var(--pep-font-display); font-weight: var(--pep-hooks-heavy); font-size: clamp(15px, 1.15vw, 18px); letter-spacing: .12em; text-transform: uppercase; color: var(--pep-plat-4); }
.pep-hooks-way-line { margin: 0; font-size: 15px; line-height: 1.45; color: var(--pep-plat-3); }
.pep-hooks-linkrow { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; margin: 6px 0 0; }

/* ---------- OVERLAYS: the exit slide-in (H67) and the phone bar (H68). Below the guide (20) and the cart (30). ---------- */
.pep-hooks-overlays { position: static; z-index: auto; }
.pep-hooks-pop {
  --a: 30px; --b: 10px; --c: 30px; --d: 10px;
  position: fixed;
  z-index: 15;
  left: 24px;
  bottom: 24px;
  width: min(400px, calc(100vw - 48px));
  transform: translateY(18px);
  visibility: hidden;
  transition: transform .7s var(--pep-ease), visibility 0s linear .7s;
}
/* it appears at once and glides the last few pixels: never an opacity fade, so it can never be left half-seen */
.pep-hooks-pop[data-on] { transform: translateY(0); visibility: visible; transition: transform .7s var(--pep-ease), visibility 0s; }
.pep-hooks-pop .pep-hooks-glass { opacity: 1; background: linear-gradient(158deg, rgba(20, 20, 22, .62), rgba(11, 11, 12, .72)); }
.pep-hooks-pop .pep-hooks-in { display: block; padding: 26px 26px 26px; }
.pep-hooks-pop .pep-hooks-head { font-size: clamp(26px, 2.4vw, 34px); margin-right: 44px; }
.pep-hooks-pop .pep-hooks-eyebrow { margin-bottom: 10px; }
.pep-hooks-pop .pep-hooks-lede { margin-top: 10px; font-size: 15px; }
.pep-hooks-pop .pep-hooks-btn { min-height: 56px; margin-top: 14px; }
.pep-hooks-pop .pep-hooks-consent { margin-top: 12px; font-size: 14px; }
.pep-hooks-x {
  position: absolute;
  z-index: 4;
  top: 10px;
  right: 10px;
  width: 44px;
  height: 44px;
  padding: 0;
  cursor: pointer;
  border: 0;
  border-radius: 0;
  background: rgba(230, 233, 237, .06);
  clip-path: polygon(10px 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%, 0 10px);
  transition: background-color .3s ease, transform .45s var(--pep-ease);
}
.pep-hooks-x::before,
.pep-hooks-x::after {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 18px;
  height: 2px;
  margin: -1px 0 0 -9px;
  background: linear-gradient(90deg, var(--pep-plat-3), var(--pep-plat-4));
  transform: rotate(45deg);
}
.pep-hooks-x::after { transform: rotate(-45deg); }
.pep-hooks-x:focus-visible { outline: 0; transform: translateY(-2px); background-color: rgba(var(--pep-hooks-rgb), .25); }

/* the phone bar: phones only, slim, left of the guide's beacon */
.pep-hooks-bar {
  --a: 14px; --b: 6px; --c: 14px; --d: 6px;
  position: fixed;
  z-index: 15;
  left: 8px;
  right: 50px;
  bottom: max(10px, env(safe-area-inset-bottom));
  display: none;
  visibility: hidden;
  transform: translateY(14px);
  transition: transform .6s var(--pep-ease), visibility 0s linear .6s;
}
.pep-hooks-bar[data-on] { visibility: visible; transform: translateY(0); transition: transform .6s var(--pep-ease), visibility 0s; }
@media (max-width: 767px) { .pep-hooks-bar { display: block; } }
.pep-hooks-bar .pep-hooks-glass { opacity: 1; background: linear-gradient(158deg, rgba(20, 20, 22, .72), rgba(11, 11, 12, .8)); }
.pep-hooks-bar-row { position: relative; z-index: 2; display: flex; align-items: center; gap: 10px; min-height: 60px; padding: 8px 8px 8px 16px; }
.pep-hooks-bar-text { min-width: 0; flex: 1 1 auto; }
.pep-hooks-bar-name { display: block; font-family: var(--pep-font-display); font-weight: var(--pep-hooks-heavy); font-size: 15px; line-height: 1.2; letter-spacing: .14em; background-image: var(--pep-hooks-chrome); background-size: 100% 1.2em; -webkit-background-clip: text; background-clip: text; -webkit-text-fill-color: transparent; }
.pep-hooks-bar-line { display: block; font-size: 14px; line-height: 1.3; color: var(--pep-plat-3); }
.pep-hooks-bar .pep-hooks-btn { width: auto; flex: 0 0 auto; min-height: 44px; margin: 0; padding: 8px 30px 8px 18px; font-size: 15px; }
.pep-hooks-sheet { position: relative; z-index: 2; padding: 22px 18px 20px; }
.pep-hooks-sheet .pep-hooks-head { font-size: 26px; margin-right: 48px; }
.pep-hooks-sheet .pep-hooks-lede { font-size: 15px; margin-top: 10px; }
.pep-hooks-sheet .pep-hooks-consent { font-size: 14px; }
@media (max-width: 767px) {
  .pep-hooks-pop { left: 8px; right: 50px; bottom: max(10px, env(safe-area-inset-bottom)); width: auto; max-height: calc(100svh - 120px); overflow-y: auto; }
  .pep-hooks-pop .pep-hooks-in { padding: 18px 16px 18px; }
  .pep-hooks-pop .pep-hooks-head { font-size: 24px; }
  .pep-hooks-room { --pep-hooks-pad-top: 72px; --pep-hooks-pad-bottom: 72px; }
}

/* less motion asked for: no glide, no sweep, no sheen; a short fade only */
@media (prefers-reduced-motion: reduce) {
  [data-module="hooks"][data-hooks-js] .pep-hooks-frame,
  [data-module="hooks"][data-hooks-js] .pep-hooks-frame[data-revealed] { transform: none; transition: none; }
  .pep-hooks-glass, .pep-hooks-glow { transition: opacity .2s linear; }
  .pep-hooks-face, .pep-hooks-card-name { animation: none; background-position: 130% 0, 0 0; }
  .pep-hooks-sweep, .pep-hooks-card::after, .pep-hooks-sill { animation: none; }
  .pep-hooks-frame[data-revealed] .pep-hooks-sweep { animation: none; }
  .pep-hooks-pop, .pep-hooks-bar, .pep-hooks-pop[data-on], .pep-hooks-bar[data-on] { transition: visibility 0s; transform: none; }
  .pep-hooks-step { animation: none; }
}
/* hover (pointer devices only): lift and grow the words */
@media (hover: hover) and (pointer: fine) {
  .pep-hooks-btn:hover { transform: translateY(-3px); filter: brightness(1.06); }
  .pep-hooks-btn:hover .pep-hooks-btn-word { transform: scale(1.05); }
  .pep-hooks-btn:hover::after { transform: translateX(330%); transition: transform 1.3s ease-in-out; }
  .pep-hooks-alt:hover, .pep-hooks-go:hover { transform: translateY(-3px); background-color: rgba(var(--pep-hooks-rgb), .18); }
  .pep-hooks-alt:hover span, .pep-hooks-go:hover span { transform: scale(1.05); }
  .pep-hooks-tile:hover { transform: translateY(-4px); background-color: rgba(var(--pep-hooks-rgb), .1); }
  .pep-hooks-tile:hover::after { transform: scaleX(1); }
  .pep-hooks-tile:hover .pep-hooks-tile-word { transform: scale(1.06); }
  .pep-hooks-add:hover { transform: translateY(-3px); }
  .pep-hooks-x:hover { transform: translateY(-2px); background-color: rgba(var(--pep-hooks-rgb), .2); }
  .pep-hooks-frame:hover .pep-hooks-glow { opacity: 1; }
}
@media (hover: hover) and (pointer: fine) and (prefers-reduced-motion: reduce) {
  .pep-hooks-btn:hover, .pep-hooks-alt:hover, .pep-hooks-go:hover, .pep-hooks-tile:hover, .pep-hooks-add:hover, .pep-hooks-x:hover { transform: none; }
}
'''

JS = r'''/* 45-hooks: THE HOOKS (HOOKS worker, Nov 13 2026). Four asks as you go down the page, one quiet exit slide-in, one phone bar.
   Every word is in the page; this file only moves it. The lead engine is the one the page already has:
   - forms post to PEP_CONFIG.form.endpoint (EMPTY = nothing is sent and the success step shows), with the house payload
     { form, hook, slot, page, email, consent: { email, text, at } } and a hook id from data-hook;
   - joining writes the shared pep_flow_v1 ({ stage: 'TEAM', joinedAt, hooksDone }) exactly as the hero does, so the cart, the
     guide and the hero all know. Nothing personal is ever kept in the browser: no email, no name, no number;
   - PEP.track gets ids only (hook, slot, step, kind, state).
   THE SPACING RULE: no two asks ever share a screen. After every layout change the rooms are spaced so that each ask is at
   least a screen and a margin from the ask before and after it, including the hero's ask and the doors' forms.
   THE OVERLAY RULE: the exit slide-in and the phone bar never show over another ask, the scroll story, the showcase, the
   cart or the guide, and never to a member. */
(function () {
  'use strict';
  var C = null;

  PEP.register('hooks', {
    init: function (root, ctx) {
      if (!C) { C = makeController(ctx); }
      C.add(root);
    }
  });

  function makeController(ctx) {
    var win = window, doc = document;
    var cfg = ctx.config || {}, flags = cfg.flags || {}, cleared = flags.COUNSEL_CLEARED || {};
    var hk = cfg.hooks || {}, exitCfg = hk.exit || {}, refCfg = hk.referral || {};
    var FLOW = 'pep_flow_v1', OWN = 'pep_hooks_v1', SESSION_KEY = 'pep_hooks_exit';

    function num(x) { return typeof x === 'number' && isFinite(x) && x > 0; }
    function q(el, s) { return el ? el.querySelector(s) : null; }
    function qa(el, s) { return el ? Array.prototype.slice.call(el.querySelectorAll(s)) : []; }
    function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
    function motionMs(ms) { return ctx.motion.reduced ? 0 : ms; }
    function focusQuiet(el) { if (!el) { return; } try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function emailOk(v) { return EMAIL.test(String(v || '').trim()); }
    function phoneOk(v) { var t = String(v || '').trim(), d = t.replace(/\D/g, ''); return /^[+\d\s().-]+$/.test(t) && d.length >= 10 && d.length <= 15; }
    function cleanName(v) { return String(v || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20); }

    // ---- the counsel switches: preview shows gated wording for review; a live build shows it only once cleared
    var gates = {
      offer: !!((flags.PREVIEW || cleared.offer) && cfg.offer && cfg.offer.text),
      restock: !!(flags.PREVIEW || cleared.restock),
      names: !!(flags.PREVIEW || cleared.names),
      referral: !!((flags.PREVIEW || cleared.referral) && num(refCfg.givePercent) && num(refCfg.getPercent) && typeof refCfg.headline === 'string' && refCfg.headline),
      preview: !!flags.PREVIEW
    };
    function applyGates(root) {
      Object.keys(gates).forEach(function (k) {
        qa(root, '[data-gate="' + k + '"]').forEach(function (el) { if (!el.hasAttribute('data-preview-note')) { el.hidden = !gates[k]; } });
        qa(root, '[data-gate-off="' + k + '"]').forEach(function (el) { el.hidden = gates[k]; });
      });
    }

    // ---- joined: the shared yes/no (stage, time and hook ids only)
    function isJoined() { var f = ctx.state.get(FLOW, null); return !!(f && typeof f === 'object' && (f.stage === 'TEAM' || f.joinedAt)); }
    var source = null, members = [];
    function markJoined(hook) {
      var f = ctx.state.get(FLOW, null), was = isJoined();
      var done = f && Array.isArray(f.hooksDone) ? f.hooksDone.filter(function (h) { return typeof h === 'string'; }) : [];
      if (done.indexOf(hook) < 0) { done.push(hook); }
      source = hook;
      ctx.state.set(FLOW, { stage: 'TEAM', joinedAt: (f && typeof f.joinedAt === 'string' && f.joinedAt) || new Date().toISOString(), hooksDone: done });
      if (!was) { ctx.emit('flow:state', { from: 'NEW', to: 'TEAM' }); }
    }
    ctx.on('state:' + FLOW, function () {
      var src = source; source = null;
      if (isJoined()) { members.forEach(function (fn) { try { fn(src); } catch (e) { /* one room never stops the others */ } }); }
      schedule();
    });

    // ---- share codes. Eight characters from the alphabet the store issues (no I, O, 0, 1); anything else is not a code.
    var CODE = /^[A-HJ-NP-Z2-9]{8}$/;
    function own() { var o = ctx.state.get(OWN, null); return o && typeof o === 'object' ? o : {}; }
    function ownCode() { var c = own().ref; return typeof c === 'string' && CODE.test(c) ? c : ''; }
    function setOwn(key, value) {                       // the hooks' own key holds two things only: a count and a code
      var o = own(), out = {};
      if (typeof o.exitSeen === 'number' && isFinite(o.exitSeen)) { out.exitSeen = o.exitSeen; }
      if (typeof o.ref === 'string' && CODE.test(o.ref)) { out.ref = o.ref; }
      out[key] = value;
      ctx.state.set(OWN, out);
    }
    // a friend arrives with ?ref=CODE: exactly one ref, and a well-formed code, or it is ignored. Read from the address on
    // each page view, never stored, never shown; it rides only in that friend's own join.
    var invitedBy = '';
    try {
      var refs = new win.URLSearchParams(win.location.search).getAll('ref');
      if (refs.length === 1 && CODE.test(refs[0]) && refs[0] !== ownCode()) { invitedBy = refs[0]; }
    } catch (e) { invitedBy = ''; }
    function reallySends() { return !!(cfg.form && cfg.form.endpoint); }

    // ---- sending: the lead engine's own rule. Endpoint empty = nothing is sent. A refused, failed or hung (10 s) send rejects.
    function post(body) {
      var endpoint = cfg.form && cfg.form.endpoint;
      if (!endpoint) { return Promise.resolve(null); }
      try {
        var ac = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = setTimeout(function () { if (ac) { ac.abort(); } }, 10000);
        return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined })
          .then(function (r) { clearTimeout(timer); if (!r.ok) { throw new Error('send refused ' + r.status); } return r; },
                function (err) { clearTimeout(timer); throw err; });
      } catch (err) { return Promise.reject(err); }
    }

    // ---- steps inside a form
    function show(form, name, quiet) {
      qa(form, '[data-step]').forEach(function (s) { s.hidden = s.getAttribute('data-step') !== name; });
      var step = q(form, '[data-step="' + name + '"]'), head = q(step, '[data-step-head]');
      if (head && !quiet) { focusQuiet(head); }
      schedule();
    }
    function currentStep(form) {
      var s = qa(form, '[data-step]').filter(function (el) { return !el.hidden; })[0];
      return s ? s.getAttribute('data-step') : '';
    }
    function visibleText(scope, sel) {
      return qa(scope, sel).filter(function (el) { return !el.closest('[hidden]'); })
        .map(function (el) { return el.textContent.replace(/\s+/g, ' ').trim(); }).join(' ');
    }

    // ---- THE ASK: one email field and its own unticked box. Submit is refused until both are right.
    function ask(form, o) {
      var email = q(form, '[data-field="email"]'), consent = q(form, '[data-consent="email"]');
      var errE = q(form, '[data-err="email"]'), errC = q(form, '[data-err="consent"]'), errS = q(form, '[data-err="send"]');
      var btn = q(form, 'button[type="submit"]'), well = email && email.closest('.pep-hooks-well');
      if (!email || !consent || !btn) { return; }
      var busy = false;
      function checkEmail() {
        var ok = emailOk(email.value);
        errE.hidden = ok;
        email.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (well) { if (ok) { well.removeAttribute('data-bad'); } else { well.setAttribute('data-bad', ''); } }
        return ok;
      }
      email.addEventListener('blur', function () { if (email.value) { checkEmail(); } });
      email.addEventListener('input', function () { if (!errE.hidden && emailOk(email.value)) { checkEmail(); } });
      email.addEventListener('focus', function () { ctx.track('ask_start', { hook: o.hook, slot: o.slot }); }, { once: true });
      consent.addEventListener('change', function () { if (consent.checked) { errC.hidden = true; consent.setAttribute('aria-invalid', 'false'); } });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) { return; }
        var step = q(form, '[data-step="email"]');
        if (step && step.hidden) { return; }
        var ok = checkEmail();
        if (!consent.checked) { errC.hidden = false; consent.setAttribute('aria-invalid', 'true'); ok = false; }
        if (!ok) { (emailOk(email.value) ? consent : email).focus(); return; }
        busy = true;
        if (errS) { errS.hidden = true; }
        btn.classList.add('pep-hooks-sending');
        var addr = email.value.trim();                   // memory only, for this page view
        var body = { form: form.getAttribute('data-ghl-form'), hook: o.hook, slot: o.slot, page: win.location.pathname, email: addr,
          consent: { email: true, text: visibleText(form, '[data-consent-text]'), at: new Date().toISOString() } };
        if (invitedBy) { body.ref = invitedBy; }          // the member who invited this visitor (their code, nothing else)
        var extra = o.extra ? o.extra() : null;
        if (extra) { Object.keys(extra).forEach(function (k) { body[k] = extra[k]; }); }
        Promise.all([post(body), wait(motionMs(750))]).then(function () {
          btn.classList.remove('pep-hooks-sending'); btn.classList.add('pep-hooks-sent');
          email.value = '';
          // a preview with no list connected sent nothing: say so, as the hero does (gone once an endpoint is set)
          var note = q(form, '[data-preview-note]');
          if (note) { note.hidden = !(flags.PREVIEW && !reallySends()); }
          markJoined(o.hook);
          ctx.track('ask_done', { hook: o.hook, slot: o.slot });
          setTimeout(function () { busy = false; o.done(addr); }, motionMs(450));
        }, function () {
          busy = false; btn.classList.remove('pep-hooks-sending');
          if (errS) { errS.hidden = false; }
        });
      });
    }

    /* ================= 01 THE FOUNDER CARD (H63) ================= */
    function fit(el) {
      el.style.fontSize = '';
      for (var i = 0; i < 14 && el.scrollWidth > el.clientWidth + 1; i++) {
        el.style.fontSize = (parseFloat(win.getComputedStyle(el).fontSize) * 0.92).toFixed(1) + 'px';
      }
    }
    function wireCard(room) {
      var form = q(room, 'form'), nameIn = q(form, '[data-field="name"]'), out = q(room, '[data-card-name]');
      var year = q(room, '[data-card-year]');
      if (year) { year.textContent = String(new Date().getFullYear()); }
      // the live P on the card: the shared 3D engine (02-logo3d) draws it into the slot, exactly as the header asks for its own
      var mark = q(room, '[data-card-mark]');
      function announce() { if (mark) { ctx.emit('logo3d:slot', { el: mark, kind: 'mark', phase: 2.1, hold: true }); } }
      ctx.on('logo3d:ready', announce);
      announce();
      ctx.on('logo3d:off', function () { room.setAttribute('data-hooks-3d', 'off'); });
      var invited = q(room, '[data-invited]');
      if (invited) { invited.hidden = !(invitedBy && !isJoined()); }
      var EMPTY = out.getAttribute('data-placeholder') || out.textContent, MEMBER = out.getAttribute('data-member') || EMPTY;
      function paint() {
        var v = cleanName(nameIn.value).toUpperCase();
        out.textContent = v || EMPTY;
        if (v) { out.removeAttribute('data-empty'); } else { out.setAttribute('data-empty', ''); }
        fit(out);
      }
      nameIn.addEventListener('input', paint);
      nameIn.addEventListener('focus', function () { ctx.track('ask_start', { hook: 'H63', slot: 'card' }); }, { once: true });
      function toEmail() { paint(); show(form, 'email'); ctx.track('ask_step', { hook: 'H63', slot: 'card', step: 2 }); }
      q(form, '[data-make]').addEventListener('click', toEmail);
      nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); toEmail(); } });
      q(form, '[data-edit]').addEventListener('click', function () { show(form, 'name', true); nameIn.focus(); });
      ask(form, {
        hook: 'H63', slot: 'card',
        extra: function () { var v = cleanName(nameIn.value); return v ? { first_name: v } : null; },
        done: function () { nameIn.value = ''; show(form, 'done'); }
      });
      function member(src) {
        if (src === 'H63' || currentStep(form) === 'done') { return; }
        nameIn.value = '';
        out.textContent = MEMBER; out.removeAttribute('data-empty'); fit(out);
        show(form, 'done', true);
      }
      members.push(member);
      if (isJoined()) { member(null); }
      win.addEventListener('resize', function () { fit(out); }, { passive: true });
    }

    /* ================= 02 FIND YOUR PICKS (H64) ================= */
    function wireFinder(room) {
      room.setAttribute('aria-labelledby', gates.names ? 'pep-hooks-finder-title' : 'pep-hooks-twin-title');
      var twin = q(room, '[data-twin-form]');
      if (twin) {
        ask(twin, { hook: 'H64', slot: 'finder', done: function () { show(twin, 'done'); } });
        members.push(function (src) { if (src !== 'H64' && currentStep(twin) === 'email') { show(twin, 'member', true); } });
      }
      if (!gates.names) { if (isJoined() && twin) { show(twin, 'member', true); } return; }

      var box = q(room, '[data-finder]'), tpl = q(box, 'template[data-words]'), words = {};
      qa(tpl && tpl.content ? tpl.content : tpl, '[data-w]').forEach(function (el) { words[el.getAttribute('data-w')] = el.textContent.trim(); });
      function w(k) { return words[k] || ''; }
      var notches = qa(box, '[data-notch]'), stage = q(box, '[data-ask-stage]'), qEl = q(box, '[data-q]'), tiles = q(box, '[data-tiles]');
      var waitEl = q(box, '[data-finder-wait]'), failEl = q(box, '[data-finder-fail]'), back = q(box, '[data-back]');
      var result = q(box, '[data-result]'), picksEl = q(box, '[data-picks]'), again = q(box, '[data-again]');
      var form = q(box, '[data-finder-form]'), resultHead = q(box, '[data-result-head]');
      var held = {};
      [cfg.hidden, cfg.flagged, hk.finderSkip].forEach(function (list) { (Array.isArray(list) ? list : []).forEach(function (s) { held[String(s)] = 1; }); });
      var FAMS = ['PEPTIDE', 'BLEND', 'NON-PEPTIDE COMPOUND'];
      var items = null, step = 0, pick = { fam: '', band: 0, group: -1 }, groups = [], lastPicks = [];

      function bandOf(mg) { return !isFinite(mg) ? 0 : mg <= 10 ? 1 : mg <= 50 ? 2 : 3; }
      function money(p) { return '$' + (Math.round(p) === p ? String(p) : p.toFixed(2)); }
      function readCatalogue(d) {
        var out = [];
        (d && Array.isArray(d.products) ? d.products : []).forEach(function (p) {
          if (!p || held[p.sku] || p.comingSoon || p.soldOut || !Array.isArray(p.sizes)) { return; }
          p.sizes.forEach(function (s) {
            if (!s || s.comingSoon || s.soldOut || typeof s.priceCAD !== 'number' || !(s.priceCAD > 0)) { return; }
            var m = /([\d.]+)\s*mg/i.exec(String(s.label || ''));
            out.push({ sku: String(p.sku), name: String(p.name || ''), fam: String(p.family || ''), id: String(s.id), label: String(s.label || ''), mg: m ? parseFloat(m[1]) : NaN, price: s.priceCAD });
          });
        });
        return out;
      }
      function byPrice(a, b) { return a.price - b.price; }
      function inFam() { return items.filter(function (it) { return it.fam === pick.fam; }); }
      function inBand() { return inFam().filter(function (it) { return bandOf(it.mg) === pick.band; }); }
      function priceGroups(list) {
        var ps = [];
        list.forEach(function (it) { if (ps.indexOf(it.price) < 0) { ps.push(it.price); } });
        ps.sort(function (a, b) { return a - b; });
        var n = ps.length, out = [];
        if (n <= 3) { ps.forEach(function (p) { out.push([p, p]); }); return out; }
        var a = Math.ceil(n / 3), b = Math.ceil((n - a) / 2);
        out.push([ps[0], ps[a - 1]]); out.push([ps[a], ps[a + b - 1]]); out.push([ps[a + b], ps[n - 1]]);
        return out;
      }
      function tilesOf(list, onPick) {
        tiles.textContent = '';
        list.forEach(function (t) {
          var li = doc.createElement('li'), b = doc.createElement('button'), s = doc.createElement('span');
          b.type = 'button'; b.className = 'pep-hooks-tile';
          s.className = 'pep-hooks-tile-word'; s.textContent = t.label;
          b.appendChild(s); li.appendChild(b); tiles.appendChild(li);
          b.addEventListener('click', function () { onPick(t.value); focusQuiet(stage.hidden ? resultHead : qEl); });
        });
      }
      function lit(n) { notches.forEach(function (el, i) { if (i < n) { el.setAttribute('data-lit', ''); } else { el.removeAttribute('data-lit'); } }); }
      function render() {
        back.hidden = step === 0;
        if (step === 0) {
          lit(1); qEl.textContent = w('q-1');
          tilesOf(FAMS.filter(function (f) { return items.some(function (it) { return it.fam === f; }); })
            .map(function (f) { return { label: w('fam-' + f) || f, value: f }; }),
            function (v) { pick.fam = v; step = 1; render(); });
        } else if (step === 1) {
          lit(2); qEl.textContent = w('q-2');
          var bands = [1, 2, 3].filter(function (b) { return inFam().some(function (it) { return bandOf(it.mg) === b; }); });
          if (bands.length < 2) { pick.band = bands[0] || 0; step = 2; render(); return; }
          tilesOf(bands.map(function (b) { return { label: w('size-' + b), value: b }; }), function (v) { pick.band = v; step = 2; render(); });
        } else if (step === 2) {
          lit(3); qEl.textContent = w('q-3');
          groups = priceGroups(pick.band ? inBand() : inFam());
          if (groups.length < 2) { pick.group = 0; step = 3; render(); return; }
          tilesOf(groups.map(function (g, i) { return { label: g[0] === g[1] ? money(g[0]) : money(g[0]) + ' ' + w('to') + ' ' + money(g[1]), value: i }; }),
            function (v) { pick.group = v; step = 3; render(); });
        } else {
          showResult();
        }
        ctx.track('finder_step', { hook: 'H64', slot: 'finder', step: step + 1 });
      }
      function choose() {
        var fam = inFam(), band = pick.band ? inBand() : fam, g = groups[pick.group] || [0, Infinity];
        var exact = band.filter(function (it) { return it.price >= g[0] && it.price <= g[1]; });
        var seen = {}, out = [];
        [exact, band, fam].forEach(function (list) {
          list.slice().sort(byPrice).forEach(function (it) { if (!seen[it.sku] && out.length < 3) { seen[it.sku] = 1; out.push(it); } });
        });
        return out;
      }
      function showResult() {
        lit(3);
        stage.hidden = true; result.hidden = false;
        var list = choose();
        picksEl.textContent = '';
        list.forEach(function (it) {
          var li = doc.createElement('li'); li.className = 'pep-hooks-pick';
          var who = doc.createElement('div'), nm = doc.createElement('span'), sz = doc.createElement('span');
          nm.className = 'pep-hooks-pick-name'; nm.textContent = it.name;
          sz.className = 'pep-hooks-pick-size'; sz.textContent = it.label;
          who.appendChild(nm); who.appendChild(sz);
          var deal = doc.createElement('span'), price = doc.createElement('b'), cad = doc.createElement('span');
          deal.className = 'pep-hooks-pick-deal';
          price.className = 'pep-hooks-num pep-hooks-pick-price'; price.textContent = money(it.price);
          cad.className = 'pep-hooks-pick-cad'; cad.textContent = w('cad');
          deal.appendChild(price); deal.appendChild(cad);
          var add = doc.createElement('button');
          add.type = 'button'; add.className = 'pep-hooks-add'; add.textContent = w('add');
          add.addEventListener('click', function () {
            ctx.emit('cart:add', { sizeId: it.id, qty: 1 });
            add.textContent = w('added'); add.setAttribute('data-added', '');
            ctx.track('finder_add', { hook: 'H64', slot: 'finder', sizeId: it.id });
          });
          li.appendChild(who); li.appendChild(deal); li.appendChild(add);
          picksEl.appendChild(li);
        });
        lastPicks = list.map(function (it) { return it.id; });
        if (isJoined()) { show(form, currentStep(form) === 'done' ? 'done' : 'member', true); }
        else if (currentStep(form) !== 'done') { show(form, 'email', true); }
        schedule();
      }
      back.addEventListener('click', function () {
        step = Math.max(0, step - 1);
        if (step === 2 && groups.length < 2) { step = 1; }
        if (step === 1 && [1, 2, 3].filter(function (b) { return inFam().some(function (it) { return bandOf(it.mg) === b; }); }).length < 2) { step = 0; }
        render(); focusQuiet(qEl);
      });
      again.addEventListener('click', function () {
        step = 0; pick = { fam: '', band: 0, group: -1 };
        result.hidden = true; stage.hidden = false;
        render(); focusQuiet(qEl); schedule();
      });
      ask(form, {
        hook: 'H64', slot: 'finder',
        extra: function () { return { prefs: { family: pick.fam, size: 'band-' + pick.band, price: 'group-' + (pick.group + 1) }, picks: lastPicks.slice() }; },
        done: function () { show(form, 'done'); }
      });
      members.push(function (src) { if (src !== 'H64' && !result.hidden && currentStep(form) === 'email') { show(form, 'member', true); } });

      if (!win.fetch) { waitEl.hidden = true; failEl.hidden = false; return; }
      win.fetch('assets/catalogue.json')
        .then(function (r) { if (!r.ok) { throw new Error('catalogue ' + r.status); } return r.json(); })
        .then(function (d) {
          items = readCatalogue(d);
          waitEl.hidden = true;
          if (!items.length) { failEl.hidden = false; return; }
          render();
          schedule();
        })
        .catch(function () { waitEl.hidden = true; failEl.hidden = false; });
    }

    /* ================= 03 FIRST ACCESS (H65) ================= */
    function wireLots(room) {
      var form = q(room, 'form'), heldEmail = '';
      ask(form, { hook: 'H65', slot: 'lots', done: function (addr) { heldEmail = addr; show(form, 'sms'); } });
      var phone = q(form, '[data-field="phone"]'), sms = q(form, '[data-consent="sms"]');
      var errP = q(form, '[data-err="phone"]'), errM = q(form, '[data-err="sms"]'), errX = q(form, '[data-err="sms-send"]');
      var send = q(form, '[data-sms-send]'), skip = q(form, '[data-sms-skip]'), pwell = phone.closest('.pep-hooks-well');
      function checkPhone() {
        var ok = phoneOk(phone.value);
        errP.hidden = ok; phone.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (pwell) { if (ok) { pwell.removeAttribute('data-bad'); } else { pwell.setAttribute('data-bad', ''); } }
        return ok;
      }
      phone.addEventListener('blur', function () { if (phone.value) { checkPhone(); } });
      phone.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send.click(); } });
      sms.addEventListener('change', function () { if (sms.checked) { errM.hidden = true; sms.setAttribute('aria-invalid', 'false'); } });
      var busy = false;
      send.addEventListener('click', function () {
        if (busy) { return; }
        var ok = checkPhone();
        if (!sms.checked) { errM.hidden = false; sms.setAttribute('aria-invalid', 'true'); ok = false; }
        if (!ok) { (phoneOk(phone.value) ? sms : phone).focus(); return; }
        busy = true; if (errX) { errX.hidden = true; }
        send.classList.add('pep-hooks-sending');
        var body = { form: 'first-access-sms', hook: 'H65', slot: 'lots', page: win.location.pathname, email: heldEmail, phone: phone.value.trim(),
          consent_sms: { given: true, text: visibleText(form, '[data-sms-text]'), at: new Date().toISOString() } };
        Promise.all([post(body), wait(motionMs(750))]).then(function () {
          send.classList.remove('pep-hooks-sending'); send.classList.add('pep-hooks-sent');
          phone.value = ''; heldEmail = '';
          var line = q(form, '[data-sms-done]'); if (line) { line.hidden = false; }
          ctx.track('ask_done', { hook: 'H65', slot: 'lots', kind: 'sms' });
          setTimeout(function () { busy = false; show(form, 'done'); }, motionMs(450));
        }, function () { busy = false; send.classList.remove('pep-hooks-sending'); if (errX) { errX.hidden = false; } });
      });
      skip.addEventListener('click', function () { heldEmail = ''; phone.value = ''; show(form, 'done'); });
      function member(src) { if (src !== 'H65' && currentStep(form) === 'email') { show(form, 'member', true); } }
      members.push(member);
      if (isJoined()) { member(null); }
    }

    /* ================= 04 SHARE PEPTICITY (H66) ================= */
    function makeCode() {
      var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = new Uint8Array(8), i;
      if (win.crypto && win.crypto.getRandomValues) { win.crypto.getRandomValues(a); }
      else { var t = String(Date.now()) + String(win.performance ? win.performance.now() : 0); for (i = 0; i < 8; i++) { a[i] = t.charCodeAt(t.length - 1 - i) * (i + 7); } }
      for (i = 0; i < 8; i++) { out += abc.charAt(a[i] % abc.length); }
      return out;
    }
    function wireShare(room) {
      var form = q(room, 'form'), code = '';
      // the reward's words and numbers come from PEP_CONFIG.hooks.referral, and are written only while the switch is open
      if (gates.referral) {
        var fill = function (t) { return String(t || '').replace(/\{give\}/g, String(refCfg.givePercent)).replace(/\{get\}/g, String(refCfg.getPercent)); };
        var rh = q(room, '[data-reward-head]'), rl = q(room, '[data-reward-line]');
        if (rh) { rh.textContent = fill(refCfg.headline); }
        if (rl) { rl.textContent = fill(refCfg.line); rl.hidden = !refCfg.line; }
      }
      var linkIn = q(form, '[data-link]'), copyB = q(form, '[data-copy]'), shareB = q(form, '[data-share]'), live = q(form, '[data-copy-live]');
      var idle = q(form, '[data-copy-idle]'), copied = q(form, '[data-copy-done]');
      // THE LINK IS SHOWN ONLY FOR A CODE THIS FORM SENT. The code is made for the send, rides in it (ref), and is kept
      // (the code alone) once the send really reached the list, so a member has one link, the same on every visit.
      function showLink(quiet) { linkIn.value = win.location.origin + win.location.pathname + '?ref=' + code; show(form, 'link', quiet); }
      ask(form, { hook: 'H66', slot: 'share',
        extra: function () {
          if (!code) { code = makeCode(); }
          var x = { ref: code };                         // on this form `ref` is the visitor's OWN new code
          if (invitedBy) { x.invited_by = invitedBy; }   // and the member who invited them rides beside it
          return x;
        },
        done: function () { if (reallySends()) { setOwn('ref', code); } showLink(false); } });
      if (win.navigator && typeof win.navigator.share === 'function') { shareB.hidden = false; }
      var resetTimer = 0;
      function copiedState() {
        idle.hidden = true; copied.hidden = false; live.textContent = copied.textContent;
        ctx.track('share_copy', { hook: 'H66', slot: 'share', kind: 'copy' });
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () { idle.hidden = false; copied.hidden = true; live.textContent = ''; }, 2600);
      }
      function byHand() { linkIn.focus(); linkIn.select(); try { if (doc.execCommand && doc.execCommand('copy')) { copiedState(); } } catch (e) { /* the link stays selected for copying by hand */ } }
      copyB.addEventListener('click', function () {
        var text = linkIn.value;
        if (win.navigator.clipboard && win.navigator.clipboard.writeText) { win.navigator.clipboard.writeText(text).then(copiedState, byHand); } else { byHand(); }
      });
      shareB.addEventListener('click', function () {
        win.navigator.share({ title: 'PEPTICITY', url: linkIn.value }).then(function () { ctx.track('share_copy', { hook: 'H66', slot: 'share', kind: 'share' }); }, function () {});
      });
      // a returning member whose code was sent before sees that same link; any other member is asked for the one field,
      // because a link nobody sent could never be credited to them
      if (isJoined() && ownCode()) { code = ownCode(); showLink(true); }
    }

    /* ================= THE OVERLAYS: EXIT (H67) and the PHONE BAR (H68) ================= */
    var overlayRoot = null, exitEl = null, bar = null, barRow = null, sheet = null, openB = null;
    var exitOn = false, armed = false, barOn = false, barOpen = false, memSession = false, kb = false, barSeen = false;
    var cartRoot = doc.querySelector('[data-module="cart"]'), guideRoot = doc.querySelector('[data-module="guide"]');
    var mqPhone = win.matchMedia ? win.matchMedia('(max-width: 767px)') : null;
    var mqCoarse = win.matchMedia ? win.matchMedia('(pointer: coarse)') : null;
    function phone() { return !!(mqPhone && mqPhone.matches); }
    function cartOpen() { return !!((cartRoot && cartRoot.hasAttribute('data-open')) || (overlayRoot && overlayRoot.hasAttribute('inert'))); }
    function guideOpen() { return !!(guideRoot && guideRoot.hasAttribute('data-open')); }
    var entered = false;
    try { entered = !!ctx.motion.reduced || win.sessionStorage.getItem('pep_entrance_seen') === '1'; } catch (e) { entered = !!ctx.motion.reduced; }
    ctx.on('entrance:done', function () { entered = true; schedule(); });
    if (!entered) { setTimeout(function () { entered = true; schedule(); }, 5600); }

    // what counts as another ask: every lead form on the page outside this module, the cart and the guide, and each room's pane
    var rooms = [];
    function foreignAsks() {
      return qa(doc, 'form[data-hook]').filter(function (f) {
        return !f.closest('[data-module="hooks"]') && !f.closest('[data-module="cart"]') && !f.closest('[data-module="guide"]');
      });
    }
    function shown(el) { return !!(el && el.getClientRects().length); }
    function inView(el, ahead) {
      if (!shown(el)) { return false; }
      var r = el.getBoundingClientRect(), vh = win.innerHeight;
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh + (ahead || 0);
    }
    function anyAskInView(ahead) {
      return foreignAsks().some(function (f) { return inView(f, ahead); }) || rooms.some(function (r) { return inView(r.frame, ahead); });
    }
    function protectedInView() { return qa(doc, '[data-module="story"], [data-module="lineup"]').some(function (el) { return inView(el, 0); }); }

    function sessionSeen() { try { return win.sessionStorage.getItem(SESSION_KEY) === '1' || memSession; } catch (e) { return memSession; } }
    function markSession() { memSession = true; try { win.sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* memory only */ } }
    function everCount() { var o = ctx.state.get(OWN, null); return o && typeof o.exitSeen === 'number' ? o.exitSeen : 0; }
    function bumpEver() { setOwn('exitSeen', everCount() + 1); }
    function maxEver() { return num(exitCfg.maxEver) ? exitCfg.maxEver : 3; }

    function tryExit() {
      if (!exitEl || exitOn || !armed || isJoined() || !entered || cartOpen() || guideOpen() || barOpen) { return false; }
      if (sessionSeen() || everCount() >= maxEver()) { return false; }
      if (anyAskInView(0) || protectedInView()) { return false; }
      exitOn = true; markSession(); bumpEver();
      exitEl.setAttribute('data-on', '');
      ctx.track('ask_view', { hook: 'H67', slot: 'exit', state: 'NEW' });
      update();
      return true;
    }
    function closeExit() {
      if (!exitOn) { return; }
      exitOn = false;
      if (exitEl.contains(doc.activeElement)) { doc.activeElement.blur(); }
      exitEl.removeAttribute('data-on');
      update();
    }
    function setBar(on) {
      if (!bar || on === barOn) { return; }
      barOn = on;
      if (on) {
        bar.setAttribute('data-on', '');
        if (!barSeen) { barSeen = true; ctx.track('ask_view', { hook: 'H68', slot: 'bar', state: 'NEW' }); }
      } else { bar.removeAttribute('data-on'); }
    }
    function closeBar() {
      if (!barOpen) { return; }
      barOpen = false;
      if (bar.contains(doc.activeElement)) { doc.activeElement.blur(); }
      bar.removeAttribute('data-open'); sheet.hidden = true; barRow.hidden = false; openB.setAttribute('aria-expanded', 'false');
      update();
    }
    function kbOpen() { var vv = win.visualViewport; return kb || !!(vv && phone() && vv.height < win.innerHeight * 0.72); }
    function update() {
      revealCheck();
      if (!overlayRoot) { return; }
      if (exitOn && (anyAskInView(0) || protectedInView() || cartOpen() || guideOpen())) { closeExit(); return; }
      if (barOpen && (anyAskInView(0) || protectedInView() || cartOpen() || guideOpen())) { closeBar(); return; }
      // ANY ask counts: the hero's form, every room, the doors' forms (H61, H62) and any other lead form on the page; the bar
      // also steps aside a quarter screen BEFORE an ask comes up from below, so the two are never on one screen
      var ok = barOpen || (phone() && !isJoined() && entered && !cartOpen() && !guideOpen() && !exitOn && !kbOpen() && !anyAskInView(Math.round(win.innerHeight * 0.25)) && !protectedInView());
      setBar(ok);
    }
    // timers, not animation frames: the page's 3D can hold frames back (and with them the scroll events), and these rules
    // must never wait for a frame. The scroll position is read every 100 ms; any move re-runs the rules at once.
    var tick = 0, seenY = -1;
    function schedule() { if (tick) { return; } tick = setTimeout(function () { tick = 0; update(); }, 40); }
    setInterval(function () {
      if (doc.hidden) { return; }
      var y = win.scrollY || win.pageYOffset || 0;
      if (y !== seenY) { seenY = y; update(); }
    }, 100);
    setInterval(function () { if (!doc.hidden) { update(); } }, 600);

    function wireOverlays(root) {
      overlayRoot = root;
      exitEl = q(root, '[data-hooks-exit]'); bar = q(root, '[data-hooks-bar]');
      barRow = q(bar, '[data-hooks-bar-row]'); sheet = q(bar, '[data-hooks-bar-sheet]'); openB = q(bar, '[data-hooks-bar-open]');
      var exitForm = q(exitEl, 'form'), barForm = q(sheet, 'form'), barHead = q(bar, '[data-hooks-bar-head]');

      ask(exitForm, { hook: 'H67', slot: 'exit', done: function () { show(exitForm, 'done'); } });
      qa(exitEl, '[data-hooks-exit-close]').forEach(function (b) { b.addEventListener('click', closeExit); });
      ask(barForm, { hook: 'H68', slot: 'bar', done: function () { show(barForm, 'done'); } });
      openB.addEventListener('click', function () {
        barOpen = true;
        bar.setAttribute('data-open', ''); barRow.hidden = true; sheet.hidden = false; openB.setAttribute('aria-expanded', 'true');
        ctx.track('cta_click', { hook: 'H68', slot: 'bar' });
        focusQuiet(barHead);
        update();
      });
      qa(bar, '[data-hooks-bar-close]').forEach(function (b) { b.addEventListener('click', closeBar); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Esc') { if (exitOn) { closeExit(); } if (barOpen) { closeBar(); } } });

      // the exit trigger, desktop: the pointer leaves through the top edge (ouibounce's pattern), armed after a while on the page
      setTimeout(function () { armed = true; root.setAttribute('data-hooks-armed', ''); }, num(exitCfg.armAfterMs) ? exitCfg.armAfterMs : 8000);
      var exitTimer = 0;
      doc.documentElement.addEventListener('mouseleave', function (e) {
        if (typeof e.clientY !== 'number' || e.clientY > 20) { return; }
        clearTimeout(exitTimer);
        exitTimer = setTimeout(tryExit, 250);
      });
      doc.documentElement.addEventListener('mouseenter', function () { clearTimeout(exitTimer); });
      // phones: a fast flick back up (more than 30% of the screen within 300 ms) after the visitor has seen half the page
      // the position is read on every scroll event AND every 100 ms on touch screens, so a flick is seen even when the
      // page's 3D holds frames (and with them the scroll events) back
      var samples = [], depth = 0;
      function sample() {
        if (!(mqCoarse && mqCoarse.matches)) { return; }
        var y = win.scrollY || win.pageYOffset || 0, t = Date.now(), vh = win.innerHeight, H = doc.documentElement.scrollHeight || 1;
        depth = Math.max(depth, (y + vh) / H);
        samples.push([t, y]);
        while (samples.length && t - samples[0][0] > 300) { samples.shift(); }
        if (depth < 0.5) { return; }
        var peak = 0;
        samples.forEach(function (s) { if (s[1] > peak) { peak = s[1]; } });
        if (peak - y > vh * 0.3) { samples = []; tryExit(); }
      }
      win.addEventListener('scroll', function () { schedule(); sample(); }, { passive: true });
      setInterval(function () { if (!doc.hidden) { sample(); } }, 100);

      // keyboard open on a phone: a field outside the bar holds the focus
      doc.addEventListener('focusin', function (e) {
        var t = e.target;
        kb = !!(t && t.matches && t.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select') && !bar.contains(t));
        schedule();
      });
      doc.addEventListener('focusout', function () {
        setTimeout(function () {
          var a = doc.activeElement;
          kb = !!(a && a.matches && a.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select') && !bar.contains(a));
          schedule();
        }, 0);
      });
      if (win.visualViewport) { win.visualViewport.addEventListener('resize', schedule); }
      if (mqPhone && mqPhone.addEventListener) { mqPhone.addEventListener('change', schedule); }
      ['cart:open', 'cart:close', 'cart:changed', 'cart:add'].forEach(function (n) { ctx.on(n, function () { schedule(); setTimeout(schedule, 60); }); });
      if (win.MutationObserver) {
        var mo = new win.MutationObserver(schedule);
        [cartRoot, guideRoot, root].forEach(function (el) { if (el) { mo.observe(el, { attributes: true, attributeFilter: ['data-open', 'inert'] }); } });
      }
      win.addEventListener('resize', schedule, { passive: true });
      schedule();
    }

    /* ================= the reveal: a pane glides in once its room is in view ================= */
    var io = ('IntersectionObserver' in win) ? new win.IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        io.unobserve(en.target);
        reveal(en.target);
      });
    }, { threshold: 0.2 }) : null;
    // the same test without the observer, run by update(): a fifth of the pane (or of the screen) in view lights it
    function revealCheck() {
      var vh = win.innerHeight;
      rooms.forEach(function (r) {
        if (!r.frame || r.frame.hasAttribute('data-revealed') || !shown(r.frame)) { return; }
        var b = r.frame.getBoundingClientRect(), seen = Math.min(b.bottom, vh) - Math.max(b.top, 0);
        if (seen > Math.min(b.height, vh) * 0.2) { if (io) { io.unobserve(r.frame); } reveal(r.frame); }
      });
    }
    function reveal(frame) {
      if (frame.hasAttribute('data-revealed')) { return; }
      frame.setAttribute('data-revealed', '');
      var r = frame.closest('[data-hooks]'), f = q(r, 'form[data-hook]');
      ctx.track('ask_view', { hook: f ? f.getAttribute('data-hook') : '', slot: r.getAttribute('data-hooks'), state: isJoined() ? 'TEAM' : 'NEW' });
    }

    /* ================= the spacing rule: a screen and a margin between any two asks ================= */
    var spacing = false, spaceTimer = 0;
    function docTop(el) {
      // the frame moves with transform while it reveals, so read its layout position, not its painted one
      var room = el.closest('[data-hooks]');
      if (room && el.classList.contains('pep-hooks-frame')) { return room.getBoundingClientRect().top + (win.scrollY || 0) + el.offsetTop; }
      return el.getBoundingClientRect().top + (win.scrollY || 0);
    }
    function docBottom(el) { return docTop(el) + (el.classList.contains('pep-hooks-frame') ? el.offsetHeight : el.getBoundingClientRect().height); }
    function spaceAsks() {
      if (spacing || !rooms.length) { return; }
      spacing = true;
      try {
        rooms.forEach(function (r) { r.root.style.removeProperty('--pep-hooks-extra-top'); r.root.style.removeProperty('--pep-hooks-extra-bottom'); });
        var need = (win.innerHeight || 800) + 48;
        var list = foreignAsks().filter(shown).map(function (f) { return { el: f, room: null }; })
          .concat(rooms.filter(function (r) { return shown(r.frame); }).map(function (r) { return { el: r.frame, room: r }; }));
        list.sort(function (a, b) { return docTop(a.el) - docTop(b.el); });
        for (var i = 1; i < list.length; i++) {
          var a = list[i - 1], b = list[i];
          var gap = docTop(b.el) - docBottom(a.el);
          if (gap >= need) { continue; }
          var add = Math.ceil(need - gap);
          if (b.room) { b.room.root.style.setProperty('--pep-hooks-extra-top', add + 'px'); }
          else if (a.room) { a.room.root.style.setProperty('--pep-hooks-extra-bottom', add + 'px'); }
        }
      } finally { spacing = false; }
      schedule();
    }
    function spaceSoon() { clearTimeout(spaceTimer); spaceTimer = setTimeout(spaceAsks, 120); }
    win.addEventListener('load', spaceSoon);
    win.addEventListener('resize', spaceSoon, { passive: true });
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(spaceSoon, function () {}); }
    if (win.ResizeObserver) {
      var ro = new win.ResizeObserver(spaceSoon);
      qa(doc, 'body > [data-module]:not([data-module="hooks"])').forEach(function (el) { ro.observe(el); });
    }

    function add(root) {
      root.setAttribute('data-hooks-js', '');
      applyGates(root);
      // a pane is never scrolled inside itself (hooks.css clips it; this holds it on a browser without overflow: clip)
      qa(root, '.pep-hooks-glass').forEach(function (g) {
        g.addEventListener('scroll', function () { if (g.scrollLeft || g.scrollTop) { g.scrollLeft = 0; g.scrollTop = 0; } });
      });
      var kind = root.getAttribute('data-hooks');
      if (kind === 'overlays') { wireOverlays(root); spaceSoon(); return; }
      var frame = q(root, '[data-hooks-ask]');
      rooms.push({ root: root, frame: frame });
      if (kind === 'card') { wireCard(root); }
      else if (kind === 'finder') { wireFinder(root); }
      else if (kind === 'lots') { wireLots(root); }
      else if (kind === 'share') { wireShare(root); }
      if (frame) { if (io) { io.observe(frame); } else { reveal(frame); } }
      spaceSoon();
    }

    return { add: add };
  }
})();
'''

SEC_CARD = r'''<!-- 45-hooks / 01 THE FOUNDER CARD (hook H63). HOOKS worker, Nov 13 2026. After THE CREST, a screen or more below the hero's
     ask. Reward first: the visitor's first name writes onto a live FOUNDER CIRCLE card as it is typed (FRM-02), then ONE
     field (email) and its own unticked box. The name lives on this page only; it is sent with the email when a list is
     connected and is never kept in the browser. Only "joined" (yes or no) is kept, in the shared pep_flow_v1. -->
<section data-module="hooks" data-hooks="card" class="pep-hooks-room" id="founder-card" aria-labelledby="pep-hooks-card-title">
  <div class="pep-hooks-frame" data-hooks-ask data-effect="frm-02">
    <span class="pep-hooks-glow" aria-hidden="true"></span>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sweep" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>
      <div class="pep-hooks-in">
        <div class="pep-hooks-copy">
          <p class="pep-hooks-eyebrow">FOUNDER CIRCLE</p>
          <!-- shown only to a visitor who arrived by a member's share link (?ref= and a valid code). Nothing personal. -->
          <p class="pep-hooks-invited" data-invited hidden>A TEAM MEMBER INVITED YOU.</p>
          <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-card-title" data-text="YOUR FOUNDER CARD"><span class="pep-hooks-face">YOUR FOUNDER CARD</span></h2>
          <p class="pep-hooks-lede">Type your first name and watch your card being made. It is yours the moment you join the FOUNDER CIRCLE.</p>
          <div class="pep-hooks-cardwrap">
            <!-- the card is a picture of the form: screen readers get the same words from the form itself -->
            <div class="pep-hooks-card" aria-hidden="true">
              <div class="pep-hooks-card-top">
                <!-- the live P: an empty slot the shared 3D engine (02-logo3d, logo 07) draws into, as the header's. If 3D is
                     off, the slot folds away and PEPTICITY stands alone in the owner's type. -->
                <span class="pep-hooks-card-brand">
                  <span class="pep-hooks-card-mark" data-card-mark></span>
                  <span class="pep-hooks-card-word">PEPTICITY</span>
                </span>
                <span class="pep-hooks-badge">FOUNDER</span>
              </div>
              <p class="pep-hooks-card-circle">FOUNDER CIRCLE</p>
              <p class="pep-hooks-card-name" data-card-name data-empty data-placeholder="YOUR NAME" data-member="MEMBER">YOUR NAME</p>
              <i class="pep-hooks-card-light"></i>
              <p class="pep-hooks-card-foot"><span>MEMBER SINCE</span> <b class="pep-hooks-num" data-card-year>2026</b></p>
            </div>
          </div>
        </div>

        <form class="pep-hooks-form" method="post" action="" data-hook="H63" data-ghl-form="founder-card" data-effect="frm-103" novalidate>
          <div class="pep-hooks-step" data-step="name">
            <p class="pep-hooks-prompt">WHAT NAME GOES ON YOUR CARD?</p>
            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-card-first">FIRST NAME</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-card-first" name="first_name" type="text" autocomplete="given-name" maxlength="20" spellcheck="false" data-field="name" aria-describedby="pep-hooks-card-first-hint"></span>
              <p class="pep-hooks-hint" id="pep-hooks-card-first-hint">Written on your card as you type. Nothing is kept in your browser.</p>
            </div>
            <button class="pep-hooks-btn" type="button" data-make><span class="pep-hooks-btn-word">MAKE MY CARD</span></button>
          </div>

          <div class="pep-hooks-step" data-step="email" hidden>
            <p class="pep-hooks-prompt" tabindex="-1" data-step-head>WHERE SHOULD WE SEND YOUR CARD?</p>
            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-card-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-card-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-card-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-card-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-card-consent-err"></span>
              <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me my FOUNDER CIRCLE card and PEPTICITY news. I can unsubscribe any time.</span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-card-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email your card.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">SEND MY CARD</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
            <div class="pep-hooks-row">
              <button class="pep-hooks-alt" type="button" data-edit><span>CHANGE THE NAME</span></button>
            </div>
            <p class="pep-hooks-fine">For adults. Your details never go to ad platforms.</p>
          </div>

          <div class="pep-hooks-step" data-step="done" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'RE IN THE FOUNDER CIRCLE."><span class="pep-hooks-face">YOU'RE IN THE FOUNDER CIRCLE.</span></p>
            <p class="pep-hooks-next">Your card comes with your welcome email.</p>
            <div class="pep-hooks-row">
              <a class="pep-hooks-go" href="#lineup" data-gate="names" hidden><span>SEE THE LINEUP</span></a>
              <a class="pep-hooks-go" href="#shelf" data-gate-off="names"><span>SEE THE SHELF</span></a>
            </div>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </div>
</section>
'''

SEC_FINDER = r'''<!-- 45-hooks / 02 FIND YOUR PICKS (hook H64). HOOKS worker, Nov 13 2026. After THE STANDARD. A 3-tap catalogue finder: it sorts
     the SHELF, never the visitor. The questions use only catalogue facts (family, size, price); the picks show name, size
     and price only, read from assets/catalogue.json at run time, without the products held back in config (hidden and
     flagged). Then ONE field: "where should we send your picks?". With the names switch closed the finder cannot name a
     product, so the same slot shows its safe twin: THE SHELF OPENS SOON, with one field. Every word is in this file. -->
<section data-module="hooks" data-hooks="finder" class="pep-hooks-room" id="picks" aria-labelledby="pep-hooks-twin-title">
  <div class="pep-hooks-frame" data-hooks-ask data-effect="frm-102">
    <span class="pep-hooks-glow" aria-hidden="true"></span>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sweep" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>

      <!-- names open (preview, or once counsel clears names): the finder -->
      <div class="pep-hooks-in" data-gate="names" hidden>
        <div class="pep-hooks-copy">
          <p class="pep-hooks-eyebrow">THREE TAPS</p>
          <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-finder-title" data-text="FIND YOUR PICKS"><span class="pep-hooks-face">FIND YOUR PICKS</span></h2>
          <p class="pep-hooks-lede">Three taps through the shelf. You get a short list: the name, size and price of each pick.</p>
        </div>

        <div class="pep-hooks-finder" data-finder>
          <ol class="pep-hooks-notches" aria-hidden="true">
            <li class="pep-hooks-notch" data-notch data-lit></li>
            <li class="pep-hooks-notch" data-notch></li>
            <li class="pep-hooks-notch" data-notch></li>
          </ol>

          <!-- the three questions share one stage; the script swaps the question and its tiles -->
          <div data-ask-stage>
            <p class="pep-hooks-q" tabindex="-1" data-q aria-live="polite">WHAT ARE YOU BROWSING?</p>
            <ul class="pep-hooks-tiles" role="list" data-tiles></ul>
            <p class="pep-hooks-hint" data-finder-wait>Opening the shelf.</p>
            <p class="pep-hooks-err" role="alert" data-finder-fail hidden>The shelf could not load. Please refresh.</p>
            <div class="pep-hooks-row">
              <button class="pep-hooks-alt" type="button" data-back hidden><span>BACK</span></button>
              <a class="pep-hooks-alt" href="#lineup" data-skip><span>SEE THE WHOLE LINEUP</span></a>
            </div>
          </div>

          <div data-result hidden>
            <p class="pep-hooks-q" tabindex="-1" data-result-head>YOUR PICKS</p>
            <ol class="pep-hooks-picks" role="list" data-picks></ol>

            <form class="pep-hooks-form" method="post" action="" data-hook="H64" data-ghl-form="finder-picks" data-effect="frm-103" data-finder-form novalidate>
              <div class="pep-hooks-step" data-step="email">
                <p class="pep-hooks-prompt pep-hooks-prompt--gap">WHERE SHOULD WE SEND YOUR PICKS?</p>
                <div class="pep-hooks-field">
                  <label class="pep-hooks-label" for="pep-hooks-finder-email">EMAIL</label>
                  <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-finder-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-finder-email-err"></span>
                  <p class="pep-hooks-err" id="pep-hooks-finder-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
                </div>
                <label class="pep-hooks-consent">
                  <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-finder-consent-err"></span>
                  <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me my picks and PEPTICITY news. I can unsubscribe any time.</span>
                </label>
                <p class="pep-hooks-err" id="pep-hooks-finder-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email your picks.</p>
                <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
                <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">SEND MY PICKS</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
                <p class="pep-hooks-fine">For adults. Your details never go to ad platforms.</p>
              </div>
              <div class="pep-hooks-step" data-step="done" hidden>
                <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOUR PICKS ARE ON THEIR WAY."><span class="pep-hooks-face">YOUR PICKS ARE ON THEIR WAY.</span></p>
                <p class="pep-hooks-next">And you're in the FOUNDER CIRCLE.</p>
              </div>
              <div class="pep-hooks-step" data-step="member" hidden>
                <p class="pep-hooks-next" tabindex="-1" data-step-head>You're in the FOUNDER CIRCLE. Add a pick to your cart, or start again.</p>
              </div>
              <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
            </form>
            <div class="pep-hooks-row">
              <button class="pep-hooks-alt" type="button" data-again><span>START AGAIN</span></button>
            </div>
          </div>

          <!-- the words the script puts on tiles and picks -->
          <template data-words>
            <span data-w="fam-PEPTIDE">PEPTIDES</span>
            <span data-w="fam-BLEND">BLENDS</span>
            <span data-w="fam-NON-PEPTIDE COMPOUND">OTHER COMPOUNDS</span>
            <span data-w="q-1">WHAT ARE YOU BROWSING?</span>
            <span data-w="q-2">WHICH SIZE?</span>
            <span data-w="q-3">YOUR PRICE RANGE?</span>
            <span data-w="size-1">UP TO 10 MG</span>
            <span data-w="size-2">11 TO 50 MG</span>
            <span data-w="size-3">OVER 50 MG</span>
            <span data-w="to">TO</span>
            <span data-w="cad">CAD</span>
            <span data-w="add">ADD TO CART</span>
            <span data-w="added">ADDED</span>
          </template>
        </div>
      </div>

      <!-- names closed (a live build before counsel clears names): the safe twin, one field -->
      <div class="pep-hooks-in" data-gate-off="names">
        <div class="pep-hooks-copy">
          <p class="pep-hooks-eyebrow">THE SHELF</p>
          <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-twin-title" data-text="THE SHELF OPENS SOON"><span class="pep-hooks-face">THE SHELF OPENS SOON</span></h2>
          <p class="pep-hooks-lede">Be the first to hear when it opens. The FOUNDER CIRCLE hears first.</p>
        </div>
        <form class="pep-hooks-form" method="post" action="" data-hook="H64" data-ghl-form="shelf-opens" data-effect="frm-103" data-twin-form novalidate>
          <div class="pep-hooks-step" data-step="email">
            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-twin-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-twin-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-twin-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-twin-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-twin-consent-err"></span>
              <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me when the shelf opens, and PEPTICITY news. I can unsubscribe any time.</span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-twin-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email you.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">TELL ME WHEN IT OPENS</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
            <p class="pep-hooks-fine">For adults. Your details never go to ad platforms.</p>
          </div>
          <div class="pep-hooks-step" data-step="done" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'LL HEAR FIRST."><span class="pep-hooks-face">YOU'LL HEAR FIRST.</span></p>
            <p class="pep-hooks-next">And you're in the FOUNDER CIRCLE.</p>
          </div>
          <div class="pep-hooks-step" data-step="member" hidden>
            <p class="pep-hooks-next" tabindex="-1" data-step-head>You're in the FOUNDER CIRCLE: you'll hear first when the shelf opens.</p>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </div>
</section>
'''

SEC_LOTS = r'''<!-- 45-hooks / 03 FIRST ACCESS (hook H65). HOOKS worker, Nov 13 2026. After FROM VIAL TO SHELF. The lot wording reads from the
     restock switch (data-gate="restock"); while it is closed the same slot offers store news first (data-gate-off).
     ONE field (email) with its own unticked box; then an OPTIONAL second step for a text, with its own unticked text box.
     The email is held in memory for that second step only, never stored. No dates, no counts, no queue numbers. -->
<section data-module="hooks" data-hooks="lots" class="pep-hooks-room" id="first-access" aria-labelledby="pep-hooks-lots-title">
  <div class="pep-hooks-frame" data-hooks-ask>
    <span class="pep-hooks-glow" aria-hidden="true"></span>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sweep" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>
      <div class="pep-hooks-in">
        <div class="pep-hooks-copy">
          <p class="pep-hooks-eyebrow">FIRST ACCESS</p>
          <div id="pep-hooks-lots-title">
            <h2 class="pep-chrome-head pep-hooks-head" data-gate="restock" data-text="FIRST ACCESS TO NEW LOTS" hidden><span class="pep-hooks-face">FIRST ACCESS TO NEW LOTS</span></h2>
            <h2 class="pep-chrome-head pep-hooks-head" data-gate-off="restock" data-text="FIRST WORD FROM THE STORE"><span class="pep-hooks-face">FIRST WORD FROM THE STORE</span></h2>
          </div>
          <p class="pep-hooks-lede" data-gate="restock" hidden>When a new lot is posted, the FOUNDER CIRCLE hears first.</p>
          <p class="pep-hooks-lede" data-gate-off="restock">Opening dates and store news reach the FOUNDER CIRCLE first.</p>
          <ul class="pep-hooks-facts" role="list">
            <li class="pep-hooks-fact"><span class="pep-hooks-num" aria-hidden="true">01</span><span class="pep-hooks-fact-line">FIRST WORD, STRAIGHT TO YOUR INBOX</span></li>
            <li class="pep-hooks-fact"><span class="pep-hooks-num" aria-hidden="true">02</span><span class="pep-hooks-fact-line">A TEXT TOO, ONLY IF YOU ADD YOUR NUMBER</span></li>
            <li class="pep-hooks-fact"><span class="pep-hooks-num" aria-hidden="true">03</span><span class="pep-hooks-fact-line">UNSUBSCRIBE IN ONE CLICK</span></li>
          </ul>
        </div>

        <form class="pep-hooks-form" method="post" action="" data-hook="H65" data-ghl-form="first-access" data-effect="frm-103" novalidate>
          <div class="pep-hooks-step" data-step="email">
            <p class="pep-hooks-prompt">WHERE SHOULD WE SEND IT?</p>
            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-lots-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-lots-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-lots-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-lots-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-lots-consent-err"></span>
              <span class="pep-hooks-consent-text"><span data-consent-text data-gate="restock" hidden>Yes, PEPTICITY may email me when a new lot is posted, and PEPTICITY news. I can unsubscribe any time.</span><span data-consent-text data-gate-off="restock">Yes, PEPTICITY may email me store news first, and PEPTICITY news. I can unsubscribe any time.</span></span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-lots-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email you first.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word"><span data-gate="restock" hidden>GET FIRST ACCESS</span><span data-gate-off="restock">SEND ME STORE NEWS FIRST</span></span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
            <p class="pep-hooks-fine">For adults. Your details never go to ad platforms.</p>
          </div>

          <!-- OPTIONAL second step: a text as well. Its own field and its own unticked box. -->
          <div class="pep-hooks-step" data-step="sms" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'RE IN. WANT A TEXT TOO?"><span class="pep-hooks-face">YOU'RE IN. WANT A TEXT TOO?</span></p>
            <div class="pep-hooks-field pep-hooks-field--gap">
              <label class="pep-hooks-label" for="pep-hooks-lots-phone">MOBILE NUMBER (OPTIONAL)</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-lots-phone" name="phone" type="tel" autocomplete="tel" inputmode="tel" maxlength="24" data-field="phone" aria-describedby="pep-hooks-lots-phone-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-lots-phone-err" role="alert" data-err="phone" hidden>That number looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_sms" data-consent="sms" aria-describedby="pep-hooks-lots-sms-err"></span>
              <span class="pep-hooks-consent-text"><span data-sms-text data-gate="restock" hidden>Yes, PEPTICITY may text me when a new lot is posted at this number. Message and data rates may apply. Reply STOP to stop.</span><span data-sms-text data-gate-off="restock">Yes, PEPTICITY may text me store news at this number. Message and data rates may apply. Reply STOP to stop.</span></span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-lots-sms-err" role="alert" data-err="sms" hidden>Tick the box so we can text you.</p>
            <p class="pep-hooks-err" role="alert" data-err="sms-send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="button" data-sms-send><span class="pep-hooks-btn-word">TEXT ME TOO</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
            <div class="pep-hooks-row">
              <button class="pep-hooks-alt" type="button" data-sms-skip><span>EMAIL IS ENOUGH</span></button>
            </div>
          </div>

          <div class="pep-hooks-step" data-step="done" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'LL HEAR FIRST."><span class="pep-hooks-face">YOU'LL HEAR FIRST.</span></p>
            <p class="pep-hooks-next">You're in the FOUNDER CIRCLE.<span data-sms-done hidden> Texts too, at the number you gave.</span></p>
          </div>

          <div class="pep-hooks-step" data-step="member" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'RE IN THE FOUNDER CIRCLE."><span class="pep-hooks-face">YOU'RE IN THE FOUNDER CIRCLE.</span></p>
            <p class="pep-hooks-next" data-gate="restock" hidden>Members hear first when a new lot is posted.</p>
            <p class="pep-hooks-next" data-gate-off="restock">Members hear store news first.</p>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </div>
</section>
'''

SEC_SHARE = r'''<!-- 45-hooks / 04 SHARE PEPTICITY (hook H66). HOOKS worker, Nov 13 2026. After THE LINEUP, before the doors. The reward words read
     from the referral switch (data-gate="referral": preview, or once COUNSEL_CLEARED.referral); the words and the numbers come
     from PEP_CONFIG.hooks.referral, never from this file. While the switch is closed the same slot shows the safe wording.
     ONE field (email) and its own unticked box, then the visitor's share link: ?ref= and a random code only, never an
     email or a name. The link shows only after this form was sent with that code; once it really went to the list the code
     is kept (the code alone) so a member has ONE link. CASL: nobody types a friend's address here; the friend joins themselves.
     The three ways sit UNDER the pane with a clear screen below them, so the doors' forms never share a screen with it. -->
<section data-module="hooks" data-hooks="share" class="pep-hooks-room" id="share" aria-labelledby="pep-hooks-share-title">
  <div class="pep-hooks-frame" data-hooks-ask>
    <span class="pep-hooks-glow" aria-hidden="true"></span>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sweep" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>
      <div class="pep-hooks-in">
        <div class="pep-hooks-copy">
          <p class="pep-hooks-eyebrow">SHARE</p>
          <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-share-title" data-text="SHARE PEPTICITY"><span class="pep-hooks-face">SHARE PEPTICITY</span></h2>
          <!-- the reward words and numbers are NOT in this file: hooks.js writes them from PEP_CONFIG.hooks.referral, and only
               while the referral switch is open -->
          <div data-gate="referral" data-reward hidden>
            <p class="pep-hooks-reward" data-reward-head></p>
            <p class="pep-hooks-lede" data-reward-line></p>
          </div>
          <p class="pep-hooks-lede" data-gate-off="referral" data-reward-off>Send your link to a friend. They choose to join the FOUNDER CIRCLE themselves.</p>
          <p class="pep-hooks-lede">PEPTICITY never emails anyone you share with.</p>
        </div>

        <form class="pep-hooks-form" method="post" action="" data-hook="H66" data-ghl-form="share-link" data-effect="frm-103" novalidate>
          <div class="pep-hooks-step" data-step="email">
            <p class="pep-hooks-prompt">WHERE SHOULD WE SEND YOUR LINK?</p>
            <div class="pep-hooks-field">
              <label class="pep-hooks-label" for="pep-hooks-share-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-share-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-share-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-share-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-share-consent-err"></span>
              <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me my share link and PEPTICITY news. I can unsubscribe any time.</span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-share-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email your link.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">GET MY SHARE LINK</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
            <p class="pep-hooks-fine">For adults. Your details never go to ad platforms.</p>
          </div>

          <div class="pep-hooks-step" data-step="link" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOUR SHARE LINK"><span class="pep-hooks-face">YOUR SHARE LINK</span></p>
            <p class="pep-hooks-next" data-joined-line>You're in the FOUNDER CIRCLE. Send this link to a friend.</p>
            <div class="pep-hooks-linkrow">
              <label class="pep-hooks-label" for="pep-hooks-share-link">YOUR LINK</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-share-link" type="text" readonly spellcheck="false" autocomplete="off" data-link></span>
            </div>
            <div class="pep-hooks-row">
              <button class="pep-hooks-btn" type="button" data-copy><span class="pep-hooks-btn-word"><span data-copy-idle>COPY MY LINK</span><span data-copy-done hidden>LINK COPIED</span></span></button>
              <button class="pep-hooks-alt" type="button" data-share hidden><span>SHARE FROM MY PHONE</span></button>
            </div>
            <p class="pep-hooks-hint" role="status" aria-live="polite" data-copy-live></p>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </div>

  <!-- HOW SHARING WORKS: information, not an ask -->
  <ol class="pep-hooks-ways" role="list" aria-label="How sharing works">
    <li class="pep-hooks-way"><span class="pep-hooks-num" aria-hidden="true">01</span><p class="pep-hooks-way-head">GET YOUR LINK</p><p class="pep-hooks-way-line">One field: your email.</p></li>
    <li class="pep-hooks-way"><span class="pep-hooks-num" aria-hidden="true">02</span><p class="pep-hooks-way-head">SEND IT TO A FRIEND</p><p class="pep-hooks-way-line">Copy it, or share it from your phone.</p></li>
    <li class="pep-hooks-way"><span class="pep-hooks-num" aria-hidden="true">03</span><p class="pep-hooks-way-head">THEY JOIN THEMSELVES</p><p class="pep-hooks-way-line">We never email anyone you share with.</p></li>
  </ol>
</section>
'''

OVERLAYS = r'''<!-- module:45-hooks -->
<!-- 45-hooks: THE OVERLAYS (HOOKS worker, Nov 13 2026). A direct child of body, so the cart's inert mark covers it too.
     EXIT (hook H67): ONE quiet slide-in when a visitor leaves (desktop: the pointer leaves through the top edge, armed after
     PEP_CONFIG.hooks.exit.armAfterMs; phones: a fast flick back up after half the page). Once per session, at most
     PEP_CONFIG.hooks.exit.maxEver times ever, never to a member, never over another ask, the scroll story, the showcase, the
     cart or the guide. Its reason is GRACE'S LETTER.
     PHONE BAR (hook H68): phones only. The main ask, JOIN THE FOUNDER CIRCLE, in a slim bar left of the guide's beacon. It hides
     while any other ask, the scroll story, the showcase, the cart, the guide, the exit slide-in or the keyboard is on screen,
     and for members. Tapping JOIN opens it into one field and its own unticked box.
     Both use the lead engine's own sending (PEP_CONFIG.form.endpoint; empty = nothing is sent) and keep nothing personal. -->
<div data-module="hooks" data-hooks="overlays" class="pep-hooks-overlays">

  <aside class="pep-hooks-pop" role="dialog" aria-modal="false" aria-labelledby="pep-hooks-exit-title" data-hooks-exit data-hooks-pop>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>
      <button class="pep-hooks-x" type="button" data-hooks-exit-close aria-label="Close GRACE'S LETTER"></button>
      <div class="pep-hooks-in">
        <p class="pep-hooks-eyebrow">BEFORE YOU GO</p>
        <h2 class="pep-chrome-head pep-hooks-head" id="pep-hooks-exit-title" data-text="GRACE'S LETTER"><span class="pep-hooks-face">GRACE'S LETTER</span></h2>
        <form class="pep-hooks-form" method="post" action="" data-hook="H67" data-ghl-form="graces-letter" data-effect="frm-103" novalidate>
          <div class="pep-hooks-step" data-step="email">
            <p class="pep-hooks-lede">Once a month, Grace writes to the FOUNDER CIRCLE: what is new on the shelf and what is coming next.</p>
            <div class="pep-hooks-field pep-hooks-field--gap">
              <label class="pep-hooks-label" for="pep-hooks-exit-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-exit-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-exit-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-exit-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-exit-consent-err"></span>
              <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me GRACE'S LETTER each month and PEPTICITY news. I can unsubscribe any time.</span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-exit-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can send the letter.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">SEND ME THE LETTER</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
          </div>
          <div class="pep-hooks-step" data-step="done" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'RE IN THE FOUNDER CIRCLE."><span class="pep-hooks-face">YOU'RE IN THE FOUNDER CIRCLE.</span></p>
            <p class="pep-hooks-next">The next letter comes to your inbox.</p>
            <div class="pep-hooks-row"><button class="pep-hooks-alt" type="button" data-hooks-exit-close><span>CLOSE</span></button></div>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </aside>

  <div class="pep-hooks-bar" role="region" aria-label="JOIN THE FOUNDER CIRCLE" data-hooks-bar>
    <div class="pep-hooks-glass">
      <span class="pep-hooks-bevel" aria-hidden="true"></span>
      <span class="pep-hooks-sill" aria-hidden="true"></span>
      <div class="pep-hooks-bar-row" data-hooks-bar-row>
        <p class="pep-hooks-bar-text">
          <span class="pep-hooks-bar-name">FOUNDER CIRCLE</span>
          <span class="pep-hooks-bar-line" data-gate="restock" hidden>First access to every new lot.</span>
          <span class="pep-hooks-bar-line" data-gate-off="restock">Your founder card, and store news first.</span>
        </p>
        <button class="pep-hooks-btn" type="button" data-hooks-bar-open aria-expanded="false" aria-controls="pep-hooks-bar-sheet"><span class="pep-hooks-btn-word">JOIN</span></button>
      </div>
      <div class="pep-hooks-sheet" id="pep-hooks-bar-sheet" data-hooks-bar-sheet hidden>
        <button class="pep-hooks-x" type="button" data-hooks-bar-close aria-label="Close"></button>
        <p class="pep-hooks-eyebrow">FOUNDER CIRCLE</p>
        <h2 class="pep-chrome-head pep-hooks-head" tabindex="-1" data-hooks-bar-head data-text="JOIN THE FOUNDER CIRCLE"><span class="pep-hooks-face">JOIN THE FOUNDER CIRCLE</span></h2>
        <form class="pep-hooks-form" method="post" action="" data-hook="H68" data-ghl-form="team-join" data-effect="frm-103" novalidate>
          <div class="pep-hooks-step" data-step="email">
            <p class="pep-hooks-lede" data-gate="restock" hidden>First access to every new lot, and your founder card.</p>
            <p class="pep-hooks-lede" data-gate-off="restock">Your founder card, and store news first.</p>
            <div class="pep-hooks-field pep-hooks-field--gap">
              <label class="pep-hooks-label" for="pep-hooks-bar-email">EMAIL</label>
              <span class="pep-hooks-well"><input class="pep-hooks-input" id="pep-hooks-bar-email" name="email" type="email" autocomplete="email" inputmode="email" spellcheck="false" maxlength="160" required data-field="email" aria-describedby="pep-hooks-bar-email-err"></span>
              <p class="pep-hooks-err" id="pep-hooks-bar-email-err" role="alert" data-err="email" hidden>That email looks incomplete.</p>
            </div>
            <label class="pep-hooks-consent">
              <span class="pep-hooks-tick"><input class="pep-hooks-check" type="checkbox" name="consent_email" data-consent="email" aria-describedby="pep-hooks-bar-consent-err"></span>
              <span class="pep-hooks-consent-text" data-consent-text>Yes, PEPTICITY may email me my welcome and PEPTICITY news. I can unsubscribe any time.</span>
            </label>
            <p class="pep-hooks-err" id="pep-hooks-bar-consent-err" role="alert" data-err="consent" hidden>Tick the box so we can email your welcome.</p>
            <p class="pep-hooks-err" role="alert" data-err="send" hidden>That did not go through. Please try again.</p>
            <button class="pep-hooks-btn" type="submit"><span class="pep-hooks-btn-word">JOIN THE FOUNDER CIRCLE</span><span class="pep-hooks-btn-ring" aria-hidden="true"></span><span class="pep-hooks-btn-done" aria-hidden="true"></span></button>
          </div>
          <div class="pep-hooks-step" data-step="done" hidden>
            <p class="pep-hooks-done" tabindex="-1" data-step-head data-text="YOU'RE IN THE FOUNDER CIRCLE."><span class="pep-hooks-face">YOU'RE IN THE FOUNDER CIRCLE.</span></p>
            <p class="pep-hooks-next">Your welcome is on its way.</p>
            <div class="pep-hooks-row"><button class="pep-hooks-alt" type="button" data-hooks-bar-close><span>CLOSE</span></button></div>
          </div>
          <p class="pep-hooks-preview" data-gate="preview" data-preview-note role="status" hidden>Preview only: nothing was sent.</p>
        </form>
      </div>
    </div>
  </div>
</div>
'''

CONFIG = r'''  // HOOKS (module 45-hooks, HOOKS worker, Nov 13 2026). Numbers, switches and the gated reward wording: nothing gated is in the page.
  // exit: the one quiet slide-in. It arms after armAfterMs on the page, shows at most once per session and at most
  //       maxEver times in all (counted in this browser, no personal data). Members never see it.
  // referral: the share reward, numbers AND words, shown ONLY while flags.PREVIEW or flags.COUNSEL_CLEARED.referral is true.
  //       {give} and {get} are filled from the two numbers. A number that is null, or a missing headline, keeps the reward
  //       hidden (the safe wording shows instead).
  // finderSkip: skus the finder never offers as a pick, on top of hidden (and flagged). Jeff's skills: recommend delist.
  hooks: {
    exit: { armAfterMs: 8000, maxEver: 3 },
    referral: { givePercent: 15, getPercent: 15,
      headline: 'GIVE {give}% OFF. GET {get}% CREDIT.',
      line: 'Your friend gets {give}% off their first order, and you get {get}% credit when they order.' },
    finderSkip: ['melanotan-ii']
  },

'''

if __name__ == '__main__':
    main()

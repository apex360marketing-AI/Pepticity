#!/usr/bin/env python3
# FX worker (round 3, section C: Jeff, Nov 14 2026). usage: python3 -I apply.py IN.html OUT.html
# Runs after the hooks worker and before harden. (Written by build_apply.py from apply.head.py + parts/: edit those.)
#
# What it changes, and nothing else:
#   NEW module 04-fx     its style block (before 05-header's), its markup (before <!-- module:05-header -->) and its script
#                        (before 05-header's): a logo-blue glow that follows a mouse over the open ground, and the pointer
#                        itself as a logo-blue ring with a chrome bead. Off for touch and reduced motion.
#   06-bottle            template: one new element, .pep-bottle-floor (the floor under the base);
#                        bottle.css: one marked block at the end (the vial comes toward the viewer, never turning);
#                        bottle.js: one marked block in mount() that sets .pep-bottle-near (mouse, keyboard, tap)
#   11-crest             the P is 15% smaller, still centred: data-fill and data-fill-w on .pep-crest-slot x 0.85
#                        (marked data-fx-scale="0.85" so it is never shrunk twice), and the two first-paint sizes in crest.css
# Every place is found by an anchor (a module marker, a data-pep-src, a code string), never by a line number. A missing
# anchor stops the run with a message and exit code 1, and nothing is written. Running it twice gives the same file.
import re
import sys

FX_HTML = '<!-- module:04-fx -->\n<!-- 04-fx: THE POINTER\'S LIGHT (owner, Nov 14 2026: "when my mouse is over the background (not over a card), I want a nice\n     little illumination of that blue: it lights up with my mouse. Make my mouse a nice little circle in that blue, with the\n     centre dot in chrome").\n     .pep-fx-glow = one soft pool of the logo blue that follows the pointer over the page ground only. It sits just above the\n     ground (01-ground) and under every section, so it is light on the floor, never light on a card.\n     .pep-fx-ring + .pep-fx-dot = the pointer itself: a small ring in the logo blue and a chrome bead at its centre.\n     Nothing here takes a click (pointer-events: none) and nothing here is spoken. A mouse only: on a touch screen, with reduced\n     motion, or with no script, none of the three shows and the browser\'s own pointer is left alone. No wording here. -->\n<div data-module="fx" data-fx-ground="off" data-fx-cursor="off" aria-hidden="true">\n  <i class="pep-fx-glow"></i>\n  <i class="pep-fx-ring"></i>\n  <i class="pep-fx-dot"></i>\n</div>\n'
FX_CSS = '/* 04-fx. Every selector starts with [data-module="fx"], .pep-fx- or html.pep-fx-on (the one switch fx.js sets on <html>).\n   One blue only: the logo\'s (--pep-light). The bead is the platinum ramp. No corner radius anywhere: the ring and the bead\n   are round because their light is drawn round (a radial gradient), not because a box was rounded. */\n\n/* ---------- the light on the ground ---------- */\n/* One element, moved by transform only (fx.js). Fixed, at the same level as the ground and after it in the page, so it lies\n   on the quilt and under every section. It fades in over the open ground and out over a card, a form, the header or a vial. */\n.pep-fx-glow {\n  position: fixed;\n  left: 0;\n  top: 0;\n  z-index: 0;\n  width: 640px;\n  height: 640px;\n  margin: -320px 0 0 -320px;\n  pointer-events: none;\n  opacity: 0;\n  background: radial-gradient(closest-side,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .26) 0%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .15) 26%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .055) 58%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), 0) 100%);\n  transform: translate3d(-999px, -999px, 0);\n  transition: opacity .6s var(--pep-ease);\n  will-change: transform, opacity;\n}\n[data-module="fx"][data-fx-ground="on"] .pep-fx-glow { opacity: 1; }\n\n/* ---------- the pointer: a ring of the logo blue, a chrome bead at its centre ---------- */\n.pep-fx-ring,\n.pep-fx-dot {\n  position: fixed;\n  left: 0;\n  top: 0;\n  pointer-events: none;\n  opacity: 0;\n  transform: translate3d(-99px, -99px, 0);\n  transition: opacity .22s ease;\n  will-change: transform, opacity;\n}\n/* the ring is 28px across; the rest of the box is its own soft glow. `color` is the ring\'s colour (the gradient reads it). */\n.pep-fx-ring {\n  z-index: 2147483000;\n  width: 56px;\n  height: 56px;\n  margin: -28px 0 0 -28px;\n  color: var(--pep-light, #2a78ff);\n  background: radial-gradient(circle closest-side,\n    rgba(var(--pep-light-rgb, 42, 120, 255), 0) 0%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .05) 36%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .16) 44%,\n    currentColor 46.5%,\n    currentColor 53.5%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .34) 57%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), .1) 76%,\n    rgba(var(--pep-light-rgb, 42, 120, 255), 0) 100%);\n}\n/* the bead: platinum chrome lit from the upper left, shadow to hot, with a dark seat so it reads on bright metal too */\n.pep-fx-dot {\n  z-index: 2147483001;\n  width: 12px;\n  height: 12px;\n  margin: -6px 0 0 -6px;\n  background:\n    radial-gradient(circle 2.8px at 40% 36%, var(--pep-plat-5) 0%, var(--pep-plat-4) 30%, rgba(230, 233, 237, 0) 100%),\n    radial-gradient(circle 4px at 50% 50%, var(--pep-plat-3) 0%, var(--pep-plat-3) 30%, var(--pep-plat-2) 78%, var(--pep-plat-1) 94%, rgba(42, 45, 49, 0) 100%),\n    radial-gradient(circle closest-side, rgba(11, 11, 12, .6) 0%, rgba(11, 11, 12, .5) 66%, rgba(11, 11, 12, 0) 100%);\n}\n[data-module="fx"][data-fx-cursor="on"] .pep-fx-ring,\n[data-module="fx"][data-fx-cursor="on"] .pep-fx-dot,\n[data-module="fx"][data-fx-cursor="key"] .pep-fx-ring,\n[data-module="fx"][data-fx-cursor="key"] .pep-fx-dot { opacity: 1; }\n\n/* while the ring is the pointer, the browser\'s own arrow is put away. A box to type in keeps the browser\'s own pointer\n   (there the ring steps back: data-fx-cursor="field"). */\nhtml.pep-fx-on,\nhtml.pep-fx-on * { cursor: none !important; }\nhtml.pep-fx-on input,\nhtml.pep-fx-on textarea,\nhtml.pep-fx-on select,\nhtml.pep-fx-on [contenteditable]:not([contenteditable="false"]) { cursor: auto !important; }\nhtml.pep-fx-on input[type="checkbox"],\nhtml.pep-fx-on input[type="radio"],\nhtml.pep-fx-on input[type="button"],\nhtml.pep-fx-on input[type="submit"],\nhtml.pep-fx-on input[type="reset"],\nhtml.pep-fx-on input[type="range"],\nhtml.pep-fx-on input[type="image"] { cursor: none !important; }\n\n/* a touch screen, or a visitor who asked for less motion: none of it exists (fx.js does not start there either) */\n@media (hover: none), (pointer: coarse), (prefers-reduced-motion: reduce) {\n  .pep-fx-glow,\n  .pep-fx-ring,\n  .pep-fx-dot { display: none; }\n}\n'
FX_JS = '(function () {\n  \'use strict\';\n  /* 04-fx: the pointer\'s light. A mouse only. Three elements, each moved by transform and nothing else:\n     the bead sits on the pointer, the ring trails it by a breath, the glow follows more slowly over the open ground.\n     State is two attributes on the module root (fx.css reads them):\n       data-fx-cursor = off | on | key (over a link or a button: the ring grows) | field (a box to type in: the browser\'s own)\n       data-fx-ground = on | off (over a card, a form, the header, a vial, a picture, a button)\n     Nothing is stored, nothing is tracked, nothing is read from the page but the element under the pointer. */\n  PEP.register(\'fx\', {\n    init: function (root, ctx) {\n      var glow = root.querySelector(\'.pep-fx-glow\'), ring = root.querySelector(\'.pep-fx-ring\'), dot = root.querySelector(\'.pep-fx-dot\');\n      if (!glow || !ring || !dot || typeof window.matchMedia !== \'function\' || typeof window.WeakMap !== \'function\') { return; }\n      var html = document.documentElement;\n      var fine = window.matchMedia(\'(hover: hover) and (pointer: fine)\');\n      var calm = window.matchMedia(\'(prefers-reduced-motion: reduce)\');\n\n      // a box to type in keeps the browser\'s own pointer\n      var FIELD = \'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="range"]):not([type="image"]),textarea,select,[contenteditable]:not([contenteditable="false"])\';\n      // what can be pressed: the ring grows there\n      var KEY = \'a[href],button,summary,label,input,[role="button"],[role="link"],[role="tab"],[role="menuitem"],[role="option"],[role="switch"],[tabindex]:not([tabindex="-1"])\';\n      // never the open ground, whatever it is painted with\n      var SOLID = \'[data-module="header"],[data-pep-bottle],[role="dialog"],dialog,form,img,picture,video,canvas,svg\';\n\n      var px = 0, py = 0, rx = 0, ry = 0, gx = 0, gy = 0, rs = 1, rsT = 1;\n      var raf = 0, peek = 0, last = 0, live = false, down = false;\n      var memo = new WeakMap(), memoAt = 0;\n\n      function set(name, value) { if (root.getAttribute(name) !== value) { root.setAttribute(name, value); } }\n      function alpha(colour) {\n        var m = /^rgba?\\(([^)]+)\\)/.exec(colour || \'\');\n        if (!m) { return 0; }\n        var p = m[1].split(/[\\s,\\/]+/);\n        return p.length > 3 ? parseFloat(p[3]) || 0 : 1;\n      }\n      // does this element itself draw a surface: glass (a backdrop blur), a cut shape, a fill or a plate?\n      // Chrome lettering (a gradient clipped to the text) is not a surface. `room` = a section\'s own root: its washes of\n      // light are part of the ground, so only glass or a real fill counts there.\n      function paints(el, room) {\n        var known = memo.get(el);\n        if (known !== undefined) { return known; }\n        var cs = window.getComputedStyle(el), blur = cs.backdropFilter || cs.webkitBackdropFilter, yes = false;\n        if (blur && blur !== \'none\') { yes = true; }\n        else if (alpha(cs.backgroundColor) > 0.04) { yes = true; }\n        else if (!room && cs.clipPath && cs.clipPath !== \'none\') { yes = true; }\n        else if (!room && cs.backgroundImage !== \'none\' && String(cs.webkitBackgroundClip || cs.backgroundClip).indexOf(\'text\') < 0) { yes = true; }\n        memo.set(el, yes);\n        return yes;\n      }\n      function onGround(el) {\n        if (el === html || el === document.body) { return true; }\n        if (el.closest(SOLID)) { return false; }\n        var now = Date.now();\n        if (now - memoAt > 4000) { memo = new WeakMap(); memoAt = now; }       // states change what an element paints\n        for (; el && el !== document.body && el !== html; el = el.parentElement) {\n          if (el.hasAttribute(\'data-module\')) { return !paints(el, true); }\n          // a light or a line laid on the floor (spoken to nobody, holding nothing) is the ground, not a card\n          if (el.getAttribute(\'aria-hidden\') === \'true\' && !el.firstElementChild) { continue; }\n          if (paints(el, false)) { return false; }\n        }\n        return true;\n      }\n      // what is under the pointer decides the ring\'s size and whether the ground lights\n      function read(t) {\n        var el = t && t.nodeType === 1 ? t : null;\n        var field = el ? el.closest(FIELD) : null, key = el && !field ? el.closest(KEY) : null;\n        rsT = (key ? 1.5 : 1) * (down ? 0.82 : 1);\n        set(\'data-fx-cursor\', field ? \'field\' : key ? \'key\' : \'on\');\n        set(\'data-fx-ground\', el && !field && !key && onGround(el) ? \'on\' : \'off\');\n      }\n      function frame(now) {\n        raf = 0;\n        var dt = Math.min(64, Math.max(1, now - last)); last = now;\n        var kr = 1 - Math.exp(-dt / 60), kg = 1 - Math.exp(-dt / 170), ks = 1 - Math.exp(-dt / 90);\n        rx += (px - rx) * kr; ry += (py - ry) * kr;\n        gx += (px - gx) * kg; gy += (py - gy) * kg;\n        rs += (rsT - rs) * ks;\n        var rest = Math.abs(px - rx) < 0.1 && Math.abs(py - ry) < 0.1 && Math.abs(px - gx) < 0.4 && Math.abs(py - gy) < 0.4 && Math.abs(rsT - rs) < 0.004;\n        if (rest) { rx = gx = px; ry = gy = py; rs = rsT; }\n        ring.style.transform = \'translate3d(\' + rx.toFixed(2) + \'px,\' + ry.toFixed(2) + \'px,0) scale(\' + rs.toFixed(3) + \')\';\n        glow.style.transform = \'translate3d(\' + gx.toFixed(1) + \'px,\' + gy.toFixed(1) + \'px,0)\';\n        if (!rest && live) { raf = window.requestAnimationFrame(frame); }\n      }\n      function kick() { if (!raf) { last = window.performance.now(); raf = window.requestAnimationFrame(frame); } }\n\n      function hide() { set(\'data-fx-cursor\', \'off\'); set(\'data-fx-ground\', \'off\'); }\n      function stop() {                                   // back to the browser\'s own pointer\n        if (!live) { return; }\n        live = false; down = false;\n        html.classList.remove(\'pep-fx-on\');\n        hide();\n      }\n      function move(e) {\n        if (e.pointerType !== \'mouse\') { return; }        // a finger or a pen never gets the ring\n        if (!fine.matches || calm.matches) { stop(); return; }\n        px = e.clientX; py = e.clientY;\n        read(e.target);\n        if (!live) {                                      // first sight of a mouse: everything starts on the pointer, no fly-in\n          live = true; rx = gx = px; ry = gy = py; rs = rsT;\n          html.classList.add(\'pep-fx-on\');\n        }\n        dot.style.transform = \'translate3d(\' + px + \'px,\' + py + \'px,0)\';\n        kick();\n      }\n      window.addEventListener(\'pointermove\', move, { passive: true });\n      window.addEventListener(\'pointerdown\', function (e) {\n        if (e.pointerType !== \'mouse\') { stop(); return; }\n        if (live) { down = true; read(e.target); kick(); }\n      }, { passive: true });\n      window.addEventListener(\'pointerup\', function (e) {\n        if (live && e.pointerType === \'mouse\') { down = false; read(e.target); kick(); }\n      }, { passive: true });\n      // the page moved under a still pointer: look again at what is under it\n      window.addEventListener(\'scroll\', function () {\n        if (!live || peek) { return; }\n        peek = window.requestAnimationFrame(function () { peek = 0; if (live && root.getAttribute(\'data-fx-cursor\') !== \'off\') { read(document.elementFromPoint(px, py)); kick(); } });\n      }, { passive: true });\n      // the pointer left the window: put the light out (it comes back with the next move)\n      html.addEventListener(\'mouseleave\', hide);\n      window.addEventListener(\'blur\', hide);\n      function change() { if (!fine.matches || calm.matches) { stop(); } }\n      [fine, calm].forEach(function (q) {\n        if (q.addEventListener) { q.addEventListener(\'change\', change); } else if (q.addListener) { q.addListener(change); }\n      });\n    }\n  });\n})();\n'
BOTTLE_CSS = '/* FX:BEGIN near */\n/* THE VIAL COMES TOWARD YOU (owner, Nov 14 2026: "when my mouse is over the vial, the vial comes out towards me...\n   aggressively 3D but classy, not too big"). The host gets .pep-bottle-near (bottle.js: the pointer is on it, the keyboard\n   is on it, or a finger tapped it). The whole vial then travels straight down the lens toward the viewer: a perspective\n   and a translateZ, which on screen is a clean 1.10 (900 / (900 - 82)). It NEVER turns, tilts or skews: the label is\n   printed on it and must stay square (the 3D label logos read the slots\' place every frame, so they travel with it).\n   Under it the floor answers: the shadow it throws spreads and deepens, and the logo blue pooled under its base comes up. */\n.pep-bottle-crop {\n  transform: perspective(900px) translateZ(0);\n  transform-origin: 50% 58%;\n  transition: transform .75s var(--pep-ease);\n}\n.pep-bottle-near .pep-bottle-crop { transform: perspective(900px) translateZ(82px); }\n\n/* the floor under the base (percentages of the vial frame; the base stands at 84.6%). Cut soft by the crop\'s own mask. */\n.pep-bottle-floor { position: absolute; left: 50%; top: 86.4%; width: 44%; aspect-ratio: 1 / .2; transform: translate(-50%, -50%); pointer-events: none; }\n.pep-bottle-floor::before,\n.pep-bottle-floor::after { content: ""; position: absolute; }\n/* the shadow the vial throws on the floor */\n.pep-bottle-floor::before {\n  inset: 6% 4%;\n  opacity: .45;\n  transform: scale(.74);\n  background: radial-gradient(closest-side, rgba(0, 0, 0, .8) 0%, rgba(0, 0, 0, .5) 52%, rgba(0, 0, 0, 0) 100%);\n  transition: opacity .75s var(--pep-ease), transform .75s var(--pep-ease);\n}\n/* the under-light: the logo blue pooled on the floor at the foot of the glass */\n.pep-bottle-floor::after {\n  inset: -34% -10%;\n  opacity: .3;\n  transform: scale(.72);\n  background: radial-gradient(closest-side, rgba(42, 120, 255, .62) 0%, rgba(42, 120, 255, .3) 34%, rgba(42, 120, 255, .09) 66%, rgba(42, 120, 255, 0) 100%);\n  transition: opacity .75s var(--pep-ease), transform .75s var(--pep-ease);\n}\n.pep-bottle-near .pep-bottle-floor::before { opacity: 1; transform: scale(1.22); }\n.pep-bottle-near .pep-bottle-floor::after { opacity: 1; transform: scale(1.16); }\n/* and the light inside the glass, at the base, comes up with it */\n.pep-bottle-near .pep-bottle-core { opacity: 1; transform: translate(-50%, -50%) scale(1.24); }\n\n/* less motion: the vial stays where it stands; only the light answers */\n@media (prefers-reduced-motion: reduce) {\n  .pep-bottle-crop { transition: none; }\n  .pep-bottle-near .pep-bottle-crop { transform: perspective(900px) translateZ(0); }\n  .pep-bottle-floor::before, .pep-bottle-floor::after { transition: none; }\n  .pep-bottle-near .pep-bottle-floor::before { transform: scale(.74); }\n  .pep-bottle-near .pep-bottle-floor::after { transform: scale(.72); }\n}\n/* FX:END near */\n'
BOTTLE_JS = "        /* FX:BEGIN near */\n        // THE VIAL COMES TOWARD YOU (owner, Nov 14 2026). bottle.css does the travel on .pep-bottle-near; here is only WHEN:\n        // a mouse while it is on the vial, the keyboard while the vial has focus, a finger on a tap (it eases back after\n        // a moment, or on the next tap). It never turns: only a class is set.\n        (function () {\n          var over = false, timer = 0, touch = false;\n          function near(on) { clearTimeout(timer); host.classList.toggle('pep-bottle-near', !!on); }\n          host.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { over = true; near(true); } });\n          host.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { over = false; near(false); } });\n          host.addEventListener('pointerdown', function (e) { touch = e.pointerType !== 'mouse'; });\n          host.addEventListener('focus', function () { var kb = false; try { kb = host.matches(':focus-visible'); } catch (err) {} if (kb) { near(true); } });\n          host.addEventListener('blur', function () { if (!over) { near(false); } });\n          host.addEventListener('click', function () {\n            if (!touch) { return; }\n            touch = false;\n            if (host.classList.contains('pep-bottle-near')) { near(false); return; }\n            near(true);\n            timer = setTimeout(function () { near(false); }, 2600);\n          });\n        })();\n        /* FX:END near */\n"

SCALE = 0.85


def die(msg):
    sys.stderr.write('FX apply.py: STOPPED. ' + msg + '\n')
    sys.exit(1)


def one(h, pattern, what):
    """the one match of a regex in the page, or stop"""
    found = list(re.finditer(pattern, h))
    if len(found) != 1:
        die('anchor for %s found %d times (need 1): /%s/' % (what, len(found), pattern[:90]))
    return found[0]


def block(h, name, tag):
    """(start, end) of the text inside <tag data-pep-src="name">...</tag>"""
    m = one(h, r'<%s\b[^>]*data-pep-src="%s"[^>]*>' % (tag, re.escape(name)), '<%s data-pep-src="%s">' % (tag, name))
    end = h.find('</%s>' % tag, m.end())
    if end < 0:
        die('<%s data-pep-src="%s"> is never closed' % (tag, name))
    return m.end(), end


def region(h, marker):
    """(start, end) of a module's markup: from its marker comment to the next module marker, script or </body>"""
    m = one(h, re.escape('<!-- module:%s -->' % marker), 'the %s marker' % marker)
    nxt = re.compile(r'<!-- module:|<script\b|</body>').search(h, m.end())
    if not nxt:
        die('nothing ends the %s markup' % marker)
    return m.start(), nxt.start()


def marked(text, begin, end, new, where):
    """replace the BEGIN..END block in text with `new`; None if the block is not there"""
    a = text.find(begin)
    if a < 0:
        if end in text:
            die('%s: %s without %s' % (where, end, begin))
        return None
    b = text.find(end, a)
    if b < 0:
        die('%s: %s without %s' % (where, begin, end))
    if text.count(begin) != 1 or text.count(end) != 1:
        die('%s: the %s block is there more than once' % (where, begin))
    return text[:a] + new + text[b + len(end):]


def swap(body, old, new, where, what):
    """exact text swap, once. Already applied (new is there) = left as it is."""
    if new in body:
        return body
    n = body.count(old)
    if n != 1:
        die('%s: anchor for "%s" found %d times (need 1): %r' % (where, what, n, old[:90]))
    return body.replace(old, new)


def head_or_tail(h, begin, end, whole, before_pattern, what):
    """a marked block of our own that stands in the page between other blocks: replaced where it is, or put before an anchor"""
    out = marked(h, begin, end, whole, what)
    if out is not None:
        return out
    m = one(h, before_pattern, 'the place for ' + what)
    return h[:m.start()] + whole + '\n' + h[m.start():]


def main():
    if len(sys.argv) != 3:
        die('usage: python3 -I apply.py IN.html OUT.html')
    with open(sys.argv[1], encoding='utf-8', newline='') as f:
        h = f.read()

    # ---- 04-fx: the style block, the markup, the script
    css = '<!-- FX:BEGIN css -->\n<style data-pep-src="modules/04-fx/fx.css">\n' + FX_CSS + '</style>\n<!-- FX:END css -->'
    h = head_or_tail(h, '<!-- FX:BEGIN css -->', '<!-- FX:END css -->', css,
                     r'<style\b[^>]*data-pep-src="modules/05-header/header\.css"[^>]*>', 'the 04-fx style block')
    js = '<!-- FX:BEGIN js -->\n<script data-pep-src="modules/04-fx/fx.js">\n' + FX_JS + '</script>\n<!-- FX:END js -->'
    h = head_or_tail(h, '<!-- FX:BEGIN js -->', '<!-- FX:END js -->', js,
                     r'<script\b[^>]*data-pep-src="modules/05-header/header\.js"[^>]*>', 'the 04-fx script')
    here = one(h, re.escape('<!-- module:05-header -->'), 'the 05-header marker')
    if '<!-- module:04-fx -->' in h:
        a, b = region(h, '04-fx')
        if b != here.start():
            die('04-fx markup is in the page but not right before <!-- module:05-header -->')
        h = h[:a] + FX_HTML + h[b:]
    else:
        h = h[:here.start()] + FX_HTML + h[here.start():]

    # ---- 06-bottle: the floor element in the template
    a, b = region(h, '06-bottle')
    body = h[a:b]
    if 'pep-bottle-floor' not in body:
        m = one(body, r'[ \t]*<img class="pep-bottle-img"', 'the vial picture in the 06-bottle template')
        indent = re.match(r'[ \t]*', m.group(0)).group(0)
        body = body[:m.start()] + indent + '<i class="pep-bottle-floor" aria-hidden="true"></i>\n' + body[m.start():]
    elif body.count('pep-bottle-floor') != 1:
        die('06-bottle template: .pep-bottle-floor is there more than once')
    h = h[:a] + body + h[b:]

    # ---- 06-bottle: bottle.css, one marked block at the end
    a, b = block(h, 'modules/06-bottle/bottle.css', 'style')
    body = h[a:b]
    out = marked(body, '/* FX:BEGIN near */', '/* FX:END near */', BOTTLE_CSS.rstrip('\n'), 'bottle.css')
    if out is None:
        if '.pep-bottle-crop' not in body:
            die('bottle.css: no .pep-bottle-crop rule (the element the vial travels on)')
        out = body.rstrip('\n') + '\n' + BOTTLE_CSS
    h = h[:a] + out + h[b:]

    # ---- 06-bottle: bottle.js, one marked block in mount(), before the reduced-motion return
    a, b = block(h, 'modules/06-bottle/bottle.js', 'script')
    body = h[a:b]
    out = marked(body, '        /* FX:BEGIN near */', '/* FX:END near */', BOTTLE_JS.rstrip('\n'), 'bottle.js')
    if out is None:
        m = one(body, r"[ \t]*if \(ctx\.motion\.reduced\) \{ host\.classList\.add\('pep-bottle-lit'\); return; \}",
                'the reduced-motion line in bottle.js mount()')
        out = body[:m.start()] + BOTTLE_JS + body[m.start():]
    h = h[:a] + out + h[b:]

    # ---- 11-crest: the P 15% smaller (the two numbers that size it), still centred on the same line
    a, b = region(h, '11-crest')
    body = h[a:b]
    m = one(body, r'<div class="pep-crest-slot"[^>]*>', 'the crest slot')
    tag = m.group(0)
    if 'data-fx-scale="' not in tag:
        def shrink(name, tag):
            mm = re.search(r'\b%s="([0-9.]+)"' % re.escape(name), tag)
            if not mm:
                die('11-crest: .pep-crest-slot has no %s number' % name)
            new = ('%.4f' % (float(mm.group(1)) * SCALE)).rstrip('0').rstrip('.')
            return tag[:mm.start(1)] + new + tag[mm.end(1):]
        tag = shrink('data-fill', tag)
        tag = shrink('data-fill-w', tag)
        tag = tag[:-1] + ' data-fx-scale="%s">' % SCALE
    elif 'data-fx-scale="%s"' % SCALE not in tag:
        die('11-crest: .pep-crest-slot carries another data-fx-scale')
    body = body[:m.start()] + tag + body[m.end():]
    h = h[:a] + body + h[b:]

    a, b = block(h, 'modules/11-crest/crest.css', 'style')
    body = h[a:b]
    body = swap(body, '--pep-crest-hh: min(33vh, 35vw);', '--pep-crest-hh: min(28.05vh, 29.75vw);', 'crest.css', 'first-paint half height')
    body = swap(body, '--pep-crest-hw: min(30vh, 32vw);', '--pep-crest-hw: min(25.5vh, 27.2vw);', 'crest.css', 'first-paint half width')
    h = h[:a] + body + h[b:]

    with open(sys.argv[2], 'w', encoding='utf-8', newline='') as f:
        f.write(h)
    print('FX apply.py: 04-fx in place; 06-bottle vial travel; 11-crest P x %s' % SCALE)


main()

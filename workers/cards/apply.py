#!/usr/bin/env python3
"""CARDS worker, final round (Jeff, 13 Nov 2026).   usage: python3 -I apply.py IN.html OUT.html

What it does, in the CARDS region only (16-lineup, 20-shelf, 30-cart, and config.js's hidden: list):
  1 FASTER: THE LINEUP still stops on every case, but one push (trackpad, wheel, finger, key) moves to the next case at
    once, a push is never swallowed (one made while a case slides or rests is carried out right after), and the scroll
    and the time per case are about a third of before (30 -> 10 percent of a screen; 620 + 760 -> 280 + 180 ms).
  2 SKIP: a branded SKIP button on the stage while it holds you; it goes to THE WHOLE LINEUP, a list of every case at
    the end of the showcase. An item there opens that case's own description (the back of its glass case).
  3 UNHIDE: hidden: [] and a new flagged: list (the ten skus still with counsel). Flagged products show and sell
    everywhere, with an etched HIDE BEFORE LAUNCH band on their case, their description, their list item, their shelf
    slat and their cart line.
Every place is found by anchors (module comments, data-pep-src blocks, unique strings), never by line numbers. A missing
anchor stops the run with a message and nothing is written. Run it again on its own output and nothing changes.
14-story, 40-guide, the header and the hero are not touched. No product name is written in any comment.
"""
import re
import sys

FLAGGED = ['tirzepatide', 'tesamorelin', 'oxytocin', 'retatrutide', 'pt-141', 'thymosin-alpha-1', 'semax', 'selank',
           'igf-1-lr3', 'blend-contents-tbc']
CSS_START = '/* ==== CARDS-NOV13'
CSS_END = '/* ==== /CARDS-NOV13 ==== */'


class Stop(Exception):
    pass


def one(text, needle, what):
    n = text.count(needle)
    if n != 1:
        raise Stop('%s: the anchor should be there once, found %d times: %r' % (what, n, needle[:100]))
    return text.index(needle)


def sub(text, old, new, what):
    """Swap the one exact `old` for `new`. When `new` is already there the edit was made before: nothing changes."""
    if new in text:
        return text
    i = one(text, old, what)
    return text[:i] + new + text[i + len(old):]


def tag_block(text, tag, close, what):
    i = one(text, tag, what)
    j = text.find(close, i)
    if j < 0:
        raise Stop('%s: no %s after its opening tag' % (what, close))
    return i, j + len(close)


def css_span(text, src):
    return tag_block(text, '<style data-pep-src="%s">' % src, '</style>', src)


def js_span(text, src):
    return tag_block(text, '<script data-pep-src="%s">' % src, '</script>', src)


def html_span(text, module):
    i = one(text, '<!-- module:%s -->' % module, 'module ' + module)
    m = re.compile(r'<!-- module:|<script data-pep-src=').search(text, i + 12)
    if not m:
        raise Stop('module %s: no end found' % module)
    return i, m.start()


def in_block(text, span, edits, what):
    i, j = span
    block = text[i:j]
    for k, (old, new) in enumerate(edits):
        block = sub(block, old, new, '%s edit %d' % (what, k + 1))
    return text[:i] + block + text[j:]


def add_css(text, span, css, what):
    i, j = span
    block = text[i:j]
    if CSS_START in block:
        a = block.index(CSS_START)
        b = block.find(CSS_END, a)
        if b < 0:
            raise Stop('%s: the CARDS css block has no end mark' % what)
        block = block[:a] + css + block[b + len(CSS_END):]
    else:
        k = block.rindex('</style>')
        block = block[:k] + css + '\n' + block[k:]
    return text[:i] + block + text[j:]


# =====================================================================================================================
# config.js: hidden: []  and  flagged: [...]
# =====================================================================================================================
CONFIG_NEW = """  // HIDDEN PRODUCTS: none right now (Jeff, 13 Nov 2026: "I don't want any products hidden right now. I want them all
  // active"). A sku listed here is left out wherever a product can show: the shelf, THE LINEUP, the PEPTIDES drop-down,
  // the guide's answers and its counts, the cart (a restored saved cart and a shared #cart= link included) and the links
  // that open a product. The products stay in assets/catalogue.json.
  hidden: [],

  // FLAGGED PRODUCTS: still awaiting counsel review (the owner's decisions 2A and 3A). They show and sell everywhere like
  // every other product, but carry an etched HIDE BEFORE LAUNCH band on their case and their description in THE LINEUP,
  // on their item in its list, on their shelf slat and on their cart line. Before launch, move each line back up into
  // hidden (or delete it once counsel clears that product).
  flagged: [
%s
  ],
""" % ',\n'.join("    '%s'" % s for s in FLAGGED)


def edit_config(text):
    i, j = js_span(text, 'config.js')
    block = text[i:j]
    if '\n  flagged: [' in block:
        if '\n  hidden: [],' not in block:
            raise Stop('config.js: flagged: is there but hidden: is not empty')
        return text
    a = one(block, '  // HIDDEN PRODUCTS:', 'config.js hidden comment')
    b = one(block, '\n  hidden: [', 'config.js hidden list') + 1
    c = block.find('\n  ],\n', b)
    if c < 0 or b < a:
        raise Stop('config.js: the hidden: list has no end')
    listed = re.findall(r"'([a-z0-9][a-z0-9-]*)'", block[b:c])
    extra = [s for s in listed if s not in FLAGGED]
    if extra:
        raise Stop('config.js: hidden: holds skus that are not the ten to flag: %s' % ', '.join(extra))
    block = block[:a] + CONFIG_NEW + block[c + len('\n  ],\n'):]
    return text[:i] + block + text[j:]


# =====================================================================================================================
# 16-lineup: markup
# =====================================================================================================================
LINEUP_HTML = [
    # the run the stage holds in, and the SKIP button on the stage
    ("""  <div class="pep-lineup-stage" data-stage data-effect="x046-lineup" data-sheen="blue">
    <!-- the way past, for keyboard and screen-reader users only: it cannot be seen until it takes keyboard focus -->
    <a class="pep-lineup-skip" href="#lineup-end" data-skip>SKIP PAST THE LINEUP</a>
""",
     """  <!-- THE RUN: the tall stretch the stage holds in. THE WHOLE LINEUP follows it, inside this same section. -->
  <div class="pep-lineup-track" data-track>
  <div class="pep-lineup-stage" data-stage data-effect="x046-lineup" data-sheen="blue">
    <!-- SKIP (Jeff, Nov 13: "there has to be a skip, so you can go to the next section"): shown while the stage holds the
         visitor, and to the keyboard whenever it is reached. It goes past the run of cases to THE WHOLE LINEUP. -->
    <a class="pep-lineup-skip" href="#lineup-all" data-skip><span class="pep-lineup-skip-word">SKIP</span><span class="pep-lineup-sr"> TO THE LIST OF EVERY CASE</span><i class="pep-lineup-skip-chev" aria-hidden="true"></i></a>
"""),
    # the run closes after the stage; THE WHOLE LINEUP follows it
    ("""      <div class="pep-lineup-hair" aria-hidden="true"><i class="pep-lineup-hair-fill" data-hair></i></div>
    </div>
  </div>
  <!-- where the way past lands: the foot of the showcase -->
""",
     """      <div class="pep-lineup-hair" aria-hidden="true"><i class="pep-lineup-hair-fill" data-hair></i></div>
    </div>
  </div>
  </div>
  <!-- THE WHOLE LINEUP (Jeff, Nov 13: "after you skip it, it should have a nice list of them all right there"): every
       case in one list, where SKIP lands and where the run of cases ends. An item opens the case's own description (the
       back of its glass case), right under its row. Built by the script from the same cases; it names no product here. -->
  <section class="pep-lineup-all" id="lineup-all" data-all aria-labelledby="pep-lineup-all-title" hidden>
    <header class="pep-lineup-all-head">
      <h3 class="pep-lineup-all-title pep-chrome-head" id="pep-lineup-all-title" data-text="THE WHOLE LINEUP" tabindex="-1">THE WHOLE LINEUP</h3>
      <p class="pep-lineup-all-sub"><span class="pep-lineup-all-n" data-all-n></span> CASES · OPEN ONE FOR ITS DESCRIPTION</p>
    </header>
    <ol class="pep-lineup-all-grid" role="list" data-all-grid></ol>
  </section>
  <!-- where the way past lands: the foot of the showcase -->
"""),
    # the etched HIDE BEFORE LAUNCH band, across the vial on the front of a flagged case ...
    ("""            <div class="vc-stage"><img data-img alt="" data-alt="{name} vial" width="592" height="1120" decoding="async"></div>
""",
     """            <div class="vc-stage"><img data-img alt="" data-alt="{name} vial" width="592" height="1120" decoding="async"><span class="pep-lineup-wm pep-lineup-wm--front" data-wm aria-hidden="true" hidden><span class="pep-lineup-wm-t">HIDE BEFORE LAUNCH</span></span></div>
"""),
    # ... and across its description, under the name
    ("""            <h3 class="pep-lineup-d-name pep-lineup-t" data-d-name></h3>
""",
     """            <h3 class="pep-lineup-d-name pep-lineup-t" data-d-name></h3>
            <p class="pep-lineup-wm pep-lineup-wm--detail" data-wm hidden><span class="pep-lineup-wm-t">HIDE BEFORE LAUNCH</span></p>
"""),
    # the list's own pieces
    ("""  <!-- THE ONE PRICE BAR. More than one size: a button with a small arrow that opens the list of sizes. One size: the same bar, no arrow. -->
""",
     """  <!-- one item of THE WHOLE LINEUP: the case's number, its name, its size and its price (or its plate) -->
  <template data-tpl="item">
    <li class="pep-lineup-item">
      <button class="pep-lineup-item-btn" type="button" data-item aria-expanded="false">
        <span class="pep-lineup-item-top"><span class="pep-lineup-item-no vc-no pep-lineup-t" data-i-no></span><span class="pep-lineup-item-name" data-i-name></span></span>
        <span class="pep-lineup-item-meta">
          <span class="pep-lineup-item-size" data-i-size hidden></span>
          <span class="pep-lineup-item-size" data-i-sizes hidden><span class="pep-lineup-item-count pep-lineup-t" data-i-count></span> SIZES</span>
          <b class="pep-lineup-item-price" data-i-price hidden><span class="pep-lineup-price pep-lineup-t" data-i-lo></span><span class="pep-lineup-item-span" data-i-span hidden> &ndash; <span class="pep-lineup-price pep-lineup-t" data-i-hi></span></span></b>
          <span class="pep-lineup-item-plate" data-i-soon hidden>COMING SOON</span>
          <span class="pep-lineup-item-plate" data-i-out hidden>SOLD OUT</span>
        </span>
        <span class="pep-lineup-wm pep-lineup-wm--item" data-wm hidden><span class="pep-lineup-wm-t">HIDE BEFORE LAUNCH</span></span>
      </button>
    </li>
  </template>
  <!-- an item opened: the case's own glass and description, copied from the stage, and ADD TO CART for each priced size -->
  <template data-tpl="view">
    <li class="pep-lineup-view" data-view>
      <div class="pep-lineup-view-case" role="region" aria-labelledby="pep-lineup-view-name" data-v-case></div>
      <div class="pep-lineup-view-buy" data-v-buy></div>
    </li>
  </template>
  <template data-tpl="view-add">
    <button class="pep-lineup-add" type="button" data-v-add><span class="pep-lineup-add-label">ADD <span data-v-size></span></span><span class="pep-lineup-add-done" aria-hidden="true">ADDED</span></button>
  </template>
  <!-- THE ONE PRICE BAR. More than one size: a button with a small arrow that opens the list of sizes. One size: the same bar, no arrow. -->
"""),
]

# =====================================================================================================================
# 16-lineup: script
# =====================================================================================================================
WHEEL_OLD = """        /* ---------------- ONE WHEEL MOVE, ONE CASE ----------------
           A wheel "move" is everything that arrives without a pause of GAP: a mouse notch, a burst of small trackpad moves
           with their long tail, one hard fling. The first of it starts ONE step; the rest is swallowed. Someone who keeps a
           mouse wheel turning gets the next case when the rest is over (a strong new push, not a fading tail). */
        function innerScroller(t, d) {"""

WHEEL_NEW = """        /* ---------------- ONE PUSH, ONE CASE, AT ONCE (Jeff, Nov 13: "it takes me 2 or 3 tries on my trackpad to even get
           it to move") ----------------
           A push is everything a trackpad, a mouse wheel or a mouse sends for one move of the hand. Its first numbers
           bring the next case straight away; the rest of it (a trackpad's long coasting tail) is swallowed, so one push
           is one case. A NEW push is seen after a pause of GAP, on a turn of direction, or when the numbers climb again
           out of a fading tail (a second swipe made while the first is still coasting), and it is never swallowed: while
           a case is still sliding or resting it is remembered and carried out the moment the rest is over. A mouse wheel
           kept turning moves on case after case, each after its rest (that is not stored up: the stage stops when the
           wheel stops). */
        function innerScroller(t, d) {"""

ONWHEEL_OLD = """        function onWheel(e) {
          if (mode !== 'held' || !n || e.ctrlKey) { return; }
          if (entering || leaving) { e.preventDefault(); return; }
          var t = e.target, mine = !t || t === document.documentElement || t === document.body || root.contains(t);
          var unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? SH : 1, dy = e.deltaY * unit, dx = e.deltaX * unit;
          // the event's OWN time: a busy frame can hold events back, and that must not read as a pause between two moves
          var z = zone(), now = e.timeStamp > 0 ? e.timeStamp : clock();
          if (!inside(z)) {
            // the page is scrolling as it always does. Would this move carry it past the place where the stage holds?
            if (!mine && t.closest) { var box = t.closest('[data-module]'); if (box && window.getComputedStyle(box).position === 'fixed') { return; } }
            if (!dy) { return; }
            var from = now - est.at < 260 && (dy > 0) === (est.y > z.y) ? est.y : z.y;         // the browser eases a wheel move over a few frames
            est.y = from + dy; est.at = now;
            var door = z.y < z.T - 1 && est.y >= z.T ? first : z.y > z.E + 1 && est.y <= z.E ? n : -1;
            if (door > -1) { e.preventDefault(); gest.last = now; gest.peak = Math.abs(dy); enter(door); }
            return;
          }
          if (root.hasAttribute('inert')) { e.preventDefault(); return; }       // a drawer is open over the stage: the stage stays still
          if (!mine) { return; }                                               // the wheel is over something else (the guide's screen)
          if (innerScroller(t, dy)) { return; }                                // a description that can still scroll takes the wheel itself
          var d = Math.abs(dy) >= Math.abs(dx) ? dy : dx, a = Math.abs(d), dir = d > 0 ? 1 : -1;
          if (now - gest.last > GAP) { gest.ended = gest.last; gest.used = false; gest.acc = 0; gest.peak = 0; gest.free = 0; }      // a pause: a new move begins
          gest.last = now;
          if (!a) { e.preventDefault(); return; }
          if (gest.free === dir) { return; }                                   // this move was let go at an end: the page scrolls on by itself
          gest.free = 0;
          if (a > gest.peak) { gest.peak = a; }
          if ((gest.acc > 0) !== (d > 0)) { gest.acc = 0; }
          gest.acc += d;
          // the last crumbs of a long trackpad tail can arrive after a pause: a move that begins within a moment of the one before has to be a real push
          var may = !busy(clock()) && (!gest.used || (a >= 50 && a >= gest.peak * 0.8)) && Math.abs(gest.acc) >= (now - gest.ended < 900 ? 80 : 14);
          if (!may) { e.preventDefault(); return; }
          gest.used = true; gest.acc = 0;
          var to = step + dir;
          if (to < first || to > n) { gest.free = dir; est.y = z.y; est.at = -1e9; return; }      // past the last case (or the first): the page carries on
          e.preventDefault();
          setStep(to);
        }
"""

ONWHEEL_NEW = """        // which push this wheel event belongs to (a new one, or the rest of the one before), on the push's own axis
        function newPush(now, dx, dy) {
          var paused = now - gest.last > GAP;
          if (paused) { gest.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; }
          var d = gest.axis === 'x' ? dx : dy, a = Math.abs(d), dir = d > 0 ? 1 : -1;
          if (!a) { gest.last = now; return null; }
          var fresh = paused || dir !== gest.dir || (gest.used && gest.low < gest.peak * 0.6 && a >= 8 && a > gest.low * 2.2 + 4);
          if (fresh) { gest.prev = gest.last; gest.dir = dir; gest.peak = a; gest.low = a; gest.acc = 0; gest.used = false; gest.free = 0; }
          else if (a >= gest.peak) { gest.peak = a; gest.low = a; }
          else if (a < gest.low) { gest.low = a; }
          gest.last = now;
          return { fresh: fresh, a: a, dir: dir };
        }
        function onWheel(e) {
          if (mode !== 'held' || !n || e.ctrlKey) { return; }
          var t = e.target, mine = !t || t === document.documentElement || t === document.body || root.contains(t);
          var unit = e.deltaMode === 1 ? 40 : e.deltaMode === 2 ? SH : 1, dy = e.deltaY * unit, dx = e.deltaX * unit;
          // the event's OWN time: a busy frame can hold events back, and that must not read as a pause between two moves
          var now = e.timeStamp > 0 ? e.timeStamp : clock(), p;
          if (entering || leaving) {
            // the stage is being carried to its door (or SKIP is gliding): the push that did it is spent; a NEW push made
            // meanwhile is remembered for the moment the stage stands
            e.preventDefault();
            p = newPush(now, dx, dy);
            if (p && p.fresh && entering) { push(p.dir, true); }
            gest.used = true;
            return;
          }
          var z = zone();
          if (!inside(z)) {
            // the page is scrolling as it always does. Would this move carry it past the place where the stage holds?
            if (!mine && t.closest) { var box = t.closest('[data-module]'); if (box && window.getComputedStyle(box).position === 'fixed') { return; } }
            if (!dy) { return; }
            var from = now - est.at < 260 && (dy > 0) === (est.y > z.y) ? est.y : z.y;         // the browser eases a wheel move over a few frames
            est.y = from + dy; est.at = now;
            var door = z.y < z.T - 1 && est.y >= z.T ? first : z.y > z.E + 1 && est.y <= z.E ? n : -1;
            if (door > -1) { e.preventDefault(); newPush(now, 0, dy); enter(door); }
            return;
          }
          if (root.hasAttribute('inert')) { e.preventDefault(); return; }       // a drawer is open over the stage: the stage stays still
          if (!mine) { return; }                                               // the wheel is over something else (the guide's screen)
          if (innerScroller(t, dy)) { return; }                                // a description that can still scroll takes the wheel itself
          p = newPush(now, dx, dy);
          if (!p) { e.preventDefault(); return; }
          if (gest.free === p.dir) { return; }                                 // this push was let go at an end: the page scrolls on by itself
          gest.acc += p.a;
          var turning = gest.used && !p.fresh && p.a >= 50 && p.a >= gest.peak * 0.8;      // a mouse wheel kept turning: each strong notch is the next push
          if (gest.used && !turning) { e.preventDefault(); return; }                         // the coasting tail of a push that has had its case
          if (!gest.used && gest.acc < (now - gest.prev < 900 ? 24 : 4)) { e.preventDefault(); return; }   // crumbs, not a push yet (soon after a push: a real one)
          var ahead = queued * p.dir > 0 ? queued : 0, to = step + ahead + p.dir;
          gest.used = true;
          if (to < first || to > n) {
            if (ahead || tw) { e.preventDefault(); return; }                   // the cases still on their way come first
            gest.free = p.dir; est.y = z.y; est.at = -1e9; return;             // past the last case (or the first): the page carries on
          }
          e.preventDefault();
          if (turning && (busy(clock()) || queued)) { return; }                // a turning wheel is not stored up: it moves on after the rest
          push(p.dir, true);
        }
"""

LIST_FUNCS = """      /* ---------------- THE WHOLE LINEUP (Jeff, Nov 13: "it should have a nice list of them all right there, so you can
         still go through them: click on them and it gives you a description of what they are") ----------------
         One item per case, in the cases' own order: its number, its name, its size and price. An item opens, right under
         its row, the case's own description: the same glass and the same back of the case, copied from the stage. Every
         word is in lineup.html; this file names no product. */
      function buildAll() {
        var itemTpl = q('[data-tpl="item"]');
        if (!all || !allGrid || !itemTpl) { return; }
        wins.forEach(function (w) {
          var li = itemTpl.content.firstElementChild.cloneNode(true), btn = q('[data-item]', li), nm = q('[data-i-name]', li);
          if (!btn) { return; }
          li.setAttribute('data-sku', w.sku);
          put(q('[data-i-no]', li), pad2(w.i + 1));
          if (nm) { nm.textContent = w.title; }
          itemMeta(w, li);
          if (w.flag) { li.setAttribute('data-flagged', ''); qa('[data-wm]', li).forEach(function (el) { el.hidden = false; }); }
          btn.id = 'pep-lineup-item-' + w.i;
          btn.addEventListener('click', function () { if (viewW === w) { closeView(true); } else { openView(w); } });
          w.item = li; w.itemBtn = btn;
          allGrid.appendChild(li);
        });
        qa('[data-all-n]').forEach(function (el) { put(el, String(wins.length)); });
        all.hidden = false;
      }
      // the size and the price by the case's own rules: one size and its price; several sizes and the span of their
      // prices; no price yet, COMING SOON; SOLD OUT
      function itemMeta(w, li) {
        var show = function (sel) { var el = q(sel, li); if (el) { el.hidden = false; } return el; };
        var priced = w.sizes.filter(function (s) { return s.price !== null; }).map(function (s) { return s.price; });
        if (w.state === 'out') { show('[data-i-out]'); return; }
        if (!priced.length) { show('[data-i-soon]'); return; }
        if (w.sizes.length === 1) {
          var one = show('[data-i-size]');
          if (one) { one.textContent = w.sizes[0].note ? w.sizes[0].main + ' · ' + w.sizes[0].note : w.sizes[0].main; }
        } else {
          show('[data-i-sizes]'); put(q('[data-i-count]', li), String(w.sizes.length));
        }
        var lo = Math.min.apply(null, priced), hi = Math.max.apply(null, priced);
        show('[data-i-price]'); put(q('[data-i-lo]', li), w.money(lo));
        if (hi > lo) { show('[data-i-span]'); put(q('[data-i-hi]', li), w.money(hi)); }
      }
      function openView(w) {
        if (!w || !w.item || !w.itemBtn) { return; }
        closeView(false);
        var pane = q('.vc-pane', w.li), box = tpl('view');
        if (!pane || !box) { return; }
        var copy = pane.cloneNode(true);
        // the glass and the back of the case only: its front, the button over it, its light and its shade stay on the stage
        qa('.pep-lineup-more, .pep-lineup-front, .vc-sweep, .pep-lineup-shade', copy).forEach(function (el) { el.parentNode.removeChild(el); });
        qa('[id]', copy).forEach(function (el) { el.removeAttribute('id'); });
        var det = q('[data-detail]', copy), row = q('[data-v-buy]', box), sizesEl = det && q('[data-d-sizes]', det);
        if (!det) { return; }
        det.hidden = false;
        var nm = q('[data-d-name]', det); if (nm) { nm.id = 'pep-lineup-view-name'; }
        var x = q('[data-x]', det); if (x) { x.addEventListener('click', function (e) { e.stopPropagation(); closeView(true); }); }
        // ADD TO CART for each size that has a price (one size: the case's own button and words)
        var priced = w.state === 'buy' ? w.sizes.filter(function (s) { return s.price !== null; }) : [];
        priced.forEach(function (s) {
          var b = priced.length > 1 ? tpl('view-add') : tpl('add'), sz = b && q('[data-v-size]', b);
          if (!b || !row) { return; }
          if (sz) { sz.textContent = s.note ? s.main + ' · ' + s.note : s.main; }
          b.setAttribute('aria-describedby', 'pep-lineup-view-name');
          b.addEventListener('click', function () {
            if (b.pepTimer) { return; }
            ctx.emit('cart:add', { sizeId: s.id, qty: 1 });
            ctx.track('add_to_cart', { sizeId: s.id, qty: 1 });
            b.classList.add('pep-lineup-added');
            b.pepTimer = setTimeout(function () { b.pepTimer = 0; b.classList.remove('pep-lineup-added'); }, 1500);
          });
          row.appendChild(b);
        });
        if (row) { if (priced.length && sizesEl) { det.insertBefore(row, sizesEl.nextSibling); } else { row.parentNode.removeChild(row); } }
        q('[data-v-case]', box).appendChild(copy);
        box.setAttribute('data-sku', w.sku);
        if (w.flag) { box.setAttribute('data-flagged', ''); }
        box.id = 'pep-lineup-view';
        w.item.parentNode.insertBefore(box, w.item.nextSibling);
        viewW = w; viewBox = box;
        w.item.setAttribute('data-open', '');
        w.itemBtn.setAttribute('aria-expanded', 'true');
        w.itemBtn.setAttribute('aria-controls', box.id);
        ctx.track('lineup_detail', { sku: w.sku, state: 'list' });
        // the whole description comes into view (its top first, when it is taller than the window)
        var r = box.getBoundingClientRect(), by = r.bottom > window.innerHeight ? Math.min(r.bottom - window.innerHeight + 16, r.top - 16) : 0;
        if (by > 0) {
          var y = (window.pageYOffset || document.documentElement.scrollTop || 0) + by;
          try { window.scrollTo({ top: y, behavior: ctx.motion.reduced ? 'auto' : 'smooth' }); } catch (e2) { window.scrollTo(0, y); }
        }
      }
      function closeView(refocus) {
        var w = viewW, box = viewBox;
        if (!w) { return; }
        viewW = null; viewBox = null;
        if (box && box.parentNode) { box.parentNode.removeChild(box); }
        w.item.removeAttribute('data-open');
        w.itemBtn.setAttribute('aria-expanded', 'false');
        w.itemBtn.removeAttribute('aria-controls');
        if (refocus) { try { w.itemBtn.focus({ preventScroll: true }); } catch (e) { w.itemBtn.focus(); } }
      }

"""

SKIP_HOOK = """        hooks.held = function () { return mode === 'held'; };
        // SKIP: the page goes past the run of cases to THE WHOLE LINEUP in one short glide (at once, with less motion asked
        // for), and the keyboard lands on its heading. Coming back up, the stage stands on the last case.
        hooks.skip = function () {
          if (menuW) { closeMenu(false); }
          if (openW) { closeDetail(false); }
          queued = 0;
          var head = q('#pep-lineup-all-title') || all;
          var max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
          var to = clamp(Math.round(all.getBoundingClientRect().top + pageY() - 12), 0, max), from = pageY(), d = to - from;
          var land = function () {
            leaving = false; setPinned(false);
            if (mode === 'held') { setStep(n, { silent: true, keepScroll: true }); }
            if (head) { try { head.focus({ preventScroll: true }); } catch (e5) { head.focus(); } }
          };
          if (mode !== 'held' || calm || Math.abs(d) < 2) { writeY(to); land(); return; }
          var t0 = clock();
          leaving = true;
          (function run() {
            var k = clamp((clock() - t0) / 480, 0, 1), e6 = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
            writeY(from + d * e6);
            if (k < 1) { raf(run); } else { land(); }
          })();
        };
"""

LINEUP_JS = [
    ("""   HELD (every window from 360 wide and 480 tall up): a sticky stage inside a tall section, never position: fixed.
   The page scrolls down as usual. When the stage reaches the top it HOLDS, and from there ONE wheel move, ONE swipe or
   ONE key press brings exactly ONE case to the centre, where it rests before the next can start (a hard fling still
   moves one case). After the last case the page carries on; coming back up, the stage holds again on the last case.
""",
     """   HELD (every window from 360 wide and 480 tall up): a sticky stage inside a tall run, never position: fixed.
   The page scrolls down as usual. When the stage reaches the top it HOLDS, and from there ONE push (a trackpad swipe,
   a wheel move, a finger, a key) brings exactly ONE case to the centre AT ONCE, where it stops briefly (Jeff, Nov 13:
   "it has to stop on every single one, but it should be able to scroll right away afterwards"). A push made while a
   case is still sliding or resting is remembered and carried out the moment the rest is over: never lost. A hard
   fling is still one push and moves one case. After the last case the page carries on to THE WHOLE LINEUP, the list
   of every case (each opens its description); SKIP, shown while the stage holds, goes straight there. Coming back up,
   the stage holds again on the last case.
"""),
    ("""      var prevBtn = q('[data-prev]'), nextBtn = q('[data-next]'), skip = q('[data-skip]');
""",
     """      var prevBtn = q('[data-prev]'), nextBtn = q('[data-next]'), skip = q('[data-skip]');
      var track = q('[data-track]') || root, all = q('[data-all]'), allGrid = q('[data-all-grid]');      // the run the stage holds in, and the list after it
"""),
    ("""      var wins = [], n = 0, DETAILS = {}, AREAS = {}, KINDS = {}, openW = null, flipTimer = 0, menuW = null, menuAt = -1;
      var hooks = { flat: null, mark4d: null, held: function () { return false; } };       // filled by the stage once it is wired
""",
     """      var wins = [], n = 0, DETAILS = {}, AREAS = {}, KINDS = {}, openW = null, flipTimer = 0, menuW = null, menuAt = -1, viewW = null, viewBox = null;
      var hooks = { flat: null, mark4d: null, held: function () { return false; }, skip: null };       // filled by the stage once it is wired
"""),
    ("""      if (skip) { skip.addEventListener('click', function () { ctx.track('lineup_skip', { from: 'lineup', to: 'end' }); }); }
""",
     """      // SKIP: past the run of cases to THE WHOLE LINEUP. Without the list (or before the stage is wired) the link's own jump.
      if (skip) {
        skip.addEventListener('click', function (e) {
          ctx.track('lineup_skip', { from: 'lineup', to: 'list' });
          if (!all || all.hidden || !hooks.skip) { return; }
          e.preventDefault();
          hooks.skip();
        });
      }
"""),
    ("""        var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
        var products = data.products.filter(function (p) {
""",
     """        var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
        var flagged = Array.isArray(cfg.flagged) ? cfg.flagged.map(String) : [];      // config.js: on show, marked until counsel clears them
        var products = data.products.filter(function (p) {
"""),
    ("""          li.setAttribute('data-sku', w.sku);
          // the family word is shown without the word COMPOUND""",
     """          li.setAttribute('data-sku', w.sku);
          // still with counsel (config.js flagged): on show and on sale, with the etched HIDE BEFORE LAUNCH band on the case
          // and on its description
          w.title = name.toUpperCase();
          w.flag = flagged.indexOf(w.sku) >= 0;
          if (w.flag) { li.setAttribute('data-flagged', ''); qa('[data-wm]', li).forEach(function (el) { el.hidden = false; }); }
          // the family word is shown without the word COMPOUND"""),
    ("""        root.style.setProperty('--pep-lineup-steps', String(Math.max(1, n - 1)));
""",
     """        buildAll();
        root.style.setProperty('--pep-lineup-steps', String(Math.max(1, n - 1)));
"""),
    ("""      // the picture of a case is asked for only when the case is near the centre
""",
     LIST_FUNCS + """      // the picture of a case is asked for only when the case is near the centre
"""),
    ("""            if (openW) { e.preventDefault(); closeDetail(true); }
            return;
          }
""",
     """            if (openW) { e.preventDefault(); closeDetail(true); return; }
            if (viewW) { e.preventDefault(); closeView(true); }
            return;
          }
"""),
    ("""           ONE gesture moves ONE step. A step takes MOVE; the case then RESTS before the next step can start. */
        var step = 1, first = 1, tw = null, restUntil = 0, queued = 0, fading = false, fadeTimer = 0;
        var MOVE = 620, MOVE_OPEN = 980, REST = 760, GAP = 240;
        var ownY = -1e9, lastY = 0, hold = null, settleTimer = 0, pinned = false, entering = false, leaving = false;
        var gest = { last: -1e9, ended: -1e9, used: false, acc: 0, peak: 0, free: 0 }, est = { y: 0, at: -1e9 };
""",
     """           ONE push moves ONE step, at once. A step takes MOVE; the case then RESTS, briefly, and a push that came in the
           meantime (queued, up to QMAX) is carried out the moment the rest is over. Jeff, Nov 13: faster, about a third of
           the old 620 + 760 ms per case (now 280 + 180), and a third of the old scroll per case (lineup.css). */
        var step = 1, first = 1, tw = null, restUntil = 0, queued = 0, fading = false, fadeTimer = 0;
        var MOVE = 280, MOVE_OPEN = 400, REST = 180, GAP = 160, DOOR_GAP = 240, QMAX = 3;
        var ownY = -1e9, lastY = 0, hold = null, settleTimer = 0, pinned = false, entering = false, leaving = false;
        var gest = { last: -1e9, prev: -1e9, axis: 'y', dir: 0, used: false, acc: 0, peak: 0, low: 0, free: 0 }, est = { y: 0, at: -1e9 };
"""),
    ("""          var rect = root.getBoundingClientRect(), y = pageY();
""",
     """          var rect = track.getBoundingClientRect(), y = pageY();                 // the run, not the section: the list follows it
"""),
    ("""                fadeTimer = setTimeout(function () { fading = false; restUntil = clock() + REST; arrived(); wake(); }, 230);
              }, 220);
""",
     """                fadeTimer = setTimeout(function () { fading = false; restUntil = clock() + REST; arrived(); wake(); }, 120);
              }, 120);
"""),
    ("""dur: gg !== glide ? MOVE_OPEN : Math.min(1150, MOVE + Math.max(0, far - 1) * 120) };""",
     """dur: gg !== glide ? MOVE_OPEN : Math.min(520, MOVE + Math.max(0, far - 1) * 60) };"""),
    ("""        // one case on or back, asked for by a key, a button or a finger. While a case is still arriving or resting, a key
        // or a button press is remembered (one only) and carried out as soon as the rest is over.
        function nudge(dir, remember) {
          var to = step + dir;
          if (to < first || to > n) { return false; }
          if (busy(clock())) { if (remember) { queued = dir; wake(); } return true; }
          setStep(to, { bring: true });
          return true;
        }
""",
     """        // one case on or back, asked for by a push of the wheel, a key, a button or a finger. While a case is still
        // sliding or resting, the ask is remembered (up to QMAX; a turn the other way starts afresh) and carried out, one
        // by one, the moment each short rest is over.
        function queue(dir) {
          if (queued * dir < 0) { queued = dir; } else if (Math.abs(queued) < QMAX) { queued += dir; }
          wake();
        }
        function push(dir, remember) {
          var ahead = queued * dir > 0 ? queued : 0, to = step + ahead + dir;
          if (to < first || to > n) { return false; }
          if (busy(clock()) || ahead) { if (remember) { queue(dir); } return true; }
          queued = 0;
          setStep(step + dir, { bring: true });
          return true;
        }
"""),
    ("""          if (queued) {
            if (!busy(clock())) { var dir = queued; queued = 0; nudge(dir, false); }
            more = true;
          }
""",
     """          if (queued) {
            if (!busy(clock())) {
              var qd = queued > 0 ? 1 : -1;
              queued -= qd;
              if (step + qd >= first && step + qd <= n) { setStep(step + qd, { bring: true }); } else { queued = 0; }
            }
            more = true;
          }
"""),
    ("""            var k = clamp((clock() - t0) / 560, 0, 1), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
""",
     """            var k = clamp((clock() - t0) / 400, 0, 1), e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
"""),
    ("""          if (door > -1) { hold = { s: door, from: now, until: now + GAP }; }
          if (hold && now <= hold.until && now - hold.from < 2600) {
            hold.until = now + GAP;
""",
     """          if (door > -1) { hold = { s: door, from: now, until: now + DOOR_GAP }; }
          if (hold && now <= hold.until && now - hold.from < 2600) {
            hold.until = now + DOOR_GAP;
"""),
    (WHEEL_OLD, WHEEL_NEW),
    (ONWHEEL_OLD, ONWHEEL_NEW),
    ("""        if (prevBtn) { prevBtn.addEventListener('click', function () { if (mode !== 'held') { listGo(cur - 1); } else if (step > 1) { nudge(-1, true); } }); }
        if (nextBtn) { nextBtn.addEventListener('click', function () { if (mode !== 'held') { listGo(cur + 1); } else if (step < n) { nudge(1, true); } }); }
""",
     """        if (prevBtn) { prevBtn.addEventListener('click', function () { if (mode !== 'held') { listGo(cur - 1); } else { push(-1, true); } }); }
        if (nextBtn) { nextBtn.addEventListener('click', function () { if (mode !== 'held') { listGo(cur + 1); } else { push(1, true); } }); }
"""),
    ("""          if (mode === 'held' && k > -1 && k !== cur && Math.abs(k - cur) === 1) { nudge(k - cur, true); }
""",
     """          if (mode === 'held' && k > -1 && k !== cur && Math.abs(k - cur) === 1) { push(k - cur, true); }
"""),
    ("""          d.done = true;
          if (openW) { closeDetail(false); }
""",
     """          d.done = true;
          if (openW) { closeDetail(false); }
          if (viewW) { closeView(false); }
"""),
    ("""          var to = step + dir;
          if (to < first || to > n) { if (!side && busy(clock())) { e.preventDefault(); } return; }             // at an end: the key scrolls the page on, as it always does
          e.preventDefault();
          if (openW) { closeDetail(false); }
          nudge(dir, !e.repeat);                               // a key held down is not a queue of presses: it steps again when the rest is over
""",
     """          var ahead = queued * dir > 0 ? queued : 0, to = step + ahead + dir;
          if (to < first || to > n) { if (!side && (busy(clock()) || ahead)) { e.preventDefault(); } return; }             // at an end: the key scrolls the page on, as it always does
          e.preventDefault();
          if (openW) { closeDetail(false); }
          push(dir, !e.repeat);                                // a key held down is not a queue of presses: it steps again when the rest is over
"""),
    ("""          var to = step + dir;
          if (to < first || to > n) { if (!busy(clock())) { leave(dir); } return; }
          nudge(dir, false);
""",
     """          var ahead = queued * dir > 0 ? queued : 0, to = step + ahead + dir;
          if (to < first || to > n) { if (!tw && !ahead) { leave(dir); } return; }
          push(dir, true);                                     // a swipe made while a case is still on its way is carried out next, never lost
"""),
    ("""        hooks.held = function () { return mode === 'held'; };
""", SKIP_HOOK),
    ("""            OPEN = 0.96; first = 0;
""",
     """            OPEN = 0.32; first = 0;                              // a third of the old opening run (Jeff, Nov 13: faster)
"""),
    ("""          }).observe(root);
""",
     """          }).observe(track);
"""),
]

# =====================================================================================================================
# 16-lineup: style
# =====================================================================================================================
LINEUP_CSS_EDITS = [
    ("""   so the scroll bar, a jump link and the keyboard all agree on where the visitor is. Length: one screen, the opening
   picture when the logo layer is on, and 30 percent of a screen for each hand-over.
""",
     """   so the scroll bar, a jump link and the keyboard all agree on where the visitor is. Length (the run, inside the
   section): one screen, the opening picture when the logo layer is on, and 10 percent of a screen for each hand-over
   (30 until Nov 13). THE WHOLE LINEUP follows the run.
"""),
    ("""    --pep-lineup-case-h: min(calc(var(--pep-lineup-vh) * 100 - var(--pep-lineup-top) - var(--pep-lineup-bot)), 800px);
    height: calc(var(--pep-lineup-vh) * (100 + var(--pep-lineup-open) * 100 + var(--pep-lineup-steps) * 30));
    padding: 0;
  }
""",
     """    --pep-lineup-case-h: min(calc(var(--pep-lineup-vh) * 100 - var(--pep-lineup-top) - var(--pep-lineup-bot)), 800px);
    padding: 0;
  }
  [data-module="lineup"][data-held] .pep-lineup-track { height: calc(var(--pep-lineup-vh) * (100 + var(--pep-lineup-open) * 100 + var(--pep-lineup-steps) * 10)); }
"""),
]

LINEUP_CSS = r"""/* ==== CARDS-NOV13: faster stops, SKIP, THE WHOLE LINEUP, the HIDE BEFORE LAUNCH band (Jeff, Nov 13 2026) ====
   One blue only (#2a78ff, hot core #cfe6ff), platinum chrome for every word, cut and slashed shapes only, the keyboard
   ring a bar of light at the foot. Nothing here sits above a pane: the list's glass is its own. */
.pep-lineup-track { position: relative; }

/* ---------- SKIP: a slash of dark glass, a chrome rim along its cuts, the word in platinum chrome lit by the blue ---------- */
[data-module="lineup"] .pep-lineup-skip {
  --pep-lineup-k: 15px;
  position: relative;
  left: auto;
  top: auto;
  order: 0;
  align-self: flex-end;
  z-index: 8;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 96px;
  min-height: 48px;
  margin: 0 var(--pep-lineup-pad) 0 0;
  padding: 0 22px 0 28px;
  overflow: hidden;
  font: 400 15px/1 var(--pep-font-display);
  letter-spacing: .24em;
  white-space: nowrap;
  text-decoration: none;
  color: var(--pep-plat-3);
  border: 0;
  border-radius: 0;
  background: linear-gradient(180deg, rgba(20, 20, 22, .8), rgba(11, 11, 12, .92));
  -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
  clip-path: polygon(var(--pep-lineup-k) 0, 100% 0, calc(100% - var(--pep-lineup-k)) 100%, 0 100%);
  opacity: 1;
  pointer-events: auto;
  transition: opacity .3s ease, transform .4s var(--pep-ease);
}
[data-module="lineup"] .pep-lineup-skip::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 46%, var(--pep-plat-4));
  clip-path: polygon(evenodd, var(--pep-lineup-k) 0, 100% 0, calc(100% - var(--pep-lineup-k)) 100%, 0 100%, var(--pep-lineup-k) 0,
    calc(var(--pep-lineup-k) + 1.3px) 1.2px, 1.6px calc(100% - 1.2px), calc(100% - var(--pep-lineup-k) - 1.3px) calc(100% - 1.2px), calc(100% - 1.6px) 1.2px, calc(var(--pep-lineup-k) + 1.3px) 1.2px);
}
/* house hover: ONE slow light, left to right */
[data-module="lineup"] .pep-lineup-skip::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -60%;
  width: 46%;
  pointer-events: none;
  background: linear-gradient(100deg, rgba(42, 120, 255, 0), rgba(42, 120, 255, .32) 35%, rgba(207, 230, 255, .5) 50%, rgba(42, 120, 255, .32) 65%, rgba(42, 120, 255, 0));
  transform: translateX(0) skewX(-18deg);
  transition: transform 0s;
}
[data-module="lineup"] .pep-lineup-skip:hover::after,
[data-module="lineup"] .pep-lineup-skip:focus-visible::after { transform: translateX(420%) skewX(-18deg); transition: transform 1.3s ease-in-out; }
.pep-lineup-skip-word {
  position: relative;
  margin-right: -.24em;
  color: var(--pep-plat-3);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 44%, var(--pep-plat-2) 52%, var(--pep-plat-3) 70%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 5px rgba(42, 120, 255, .6));
  transform-origin: 50% 60%;
  transition: transform .4s var(--pep-ease);
}
/* two chevrons: down, past the cases */
.pep-lineup-skip-chev {
  position: relative;
  display: block;
  flex: 0 0 auto;
  width: 9px;
  height: 9px;
  margin: -9px 6px 0 2px;
  border-right: 2px solid var(--pep-plat-3);
  border-bottom: 2px solid var(--pep-plat-3);
  transform: rotate(45deg);
  filter: drop-shadow(0 0 3px rgba(42, 120, 255, .9));
}
.pep-lineup-skip-chev::after { content: ""; position: absolute; left: 3px; top: 3px; width: 9px; height: 9px; border-right: 2px solid #2a78ff; border-bottom: 2px solid #2a78ff; }
[data-module="lineup"] .pep-lineup-skip:hover,
[data-module="lineup"] .pep-lineup-skip:focus-visible { transform: translateY(-2px); }
[data-module="lineup"] .pep-lineup-skip:hover .pep-lineup-skip-word,
[data-module="lineup"] .pep-lineup-skip:focus-visible .pep-lineup-skip-word { transform: scale(1.1); }
[data-module="lineup"] .pep-lineup-skip:focus-visible { outline: 0; box-shadow: inset 0 -3px 0 #2a78ff; }
/* while the stage holds: at the foot of the stage, at the end of the hairline, left of the page's corner; and away
   (unless the keyboard has reached it) as soon as the stage no longer holds the visitor */
@media (min-width: 360px) and (min-height: 480px) {
  [data-module="lineup"][data-held] .pep-lineup-skip {
    position: absolute;
    margin: 0;
    right: calc(var(--pep-lineup-pad) + 62px);
    top: calc(var(--pep-lineup-vh) * 100 - var(--pep-lineup-bot) + (var(--pep-lineup-bot) - 48px) / 2 - 2px);
  }
  [data-module="lineup"][data-held]:not([data-pinned]) .pep-lineup-skip:not(:focus-visible) { opacity: 0; pointer-events: none; transform: translateY(8px); }
  [data-module="lineup"][data-held] .pep-lineup-way { padding-right: calc(var(--pep-lineup-pad) + 62px + 150px); }
}
@media (min-width: 360px) and (min-height: 480px) and (max-height: 640px) {
  [data-module="lineup"][data-held] .pep-lineup-skip { min-height: 44px; top: calc(var(--pep-lineup-vh) * 100 - var(--pep-lineup-bot) + 8px); }
}
/* a narrow window: SKIP takes the hairline's place; the counter keeps only its own width */
@media (min-width: 360px) and (min-height: 480px) and (max-width: 599px) {
  [data-module="lineup"][data-held] .pep-lineup-skip { right: 44px; min-width: 88px; padding: 0 16px 0 22px; gap: 8px; font-size: 14px; }
  [data-module="lineup"][data-held] .pep-lineup-way { gap: 10px; padding-right: 150px; }
  [data-module="lineup"][data-held] .pep-lineup-count { min-width: 0; }
  [data-module="lineup"][data-held] .pep-lineup-hair { display: none; }
}
/* the narrowest phones: SKIP closes up so it never touches the "on" control beside it */
@media (min-width: 360px) and (min-height: 480px) and (max-width: 380px) {
  [data-module="lineup"][data-held] .pep-lineup-skip { min-width: 80px; padding: 0 12px 0 18px; gap: 6px; font-size: 13px; letter-spacing: .2em; }
  [data-module="lineup"][data-held] .pep-lineup-skip .pep-lineup-skip-chev { margin-right: 3px; }
  [data-module="lineup"][data-held] .pep-lineup-way { gap: 8px; }
}
/* the hint needs the room SKIP now takes: only on a wide screen */
@media (max-width: 1139px) {
  [data-module="lineup"] .pep-lineup-hint { display: none; }
}
/* less motion asked for: the cases fade out and in a little quicker too */
[data-module="lineup"][data-held][data-calm] .vc-pane,
[data-module="lineup"][data-held][data-calm] .vc-glow { transition: opacity .12s linear !important; }

/* ---------- HIDE BEFORE LAUNCH (Jeff, Nov 13: a watermark "that looks kind of cool"): a thin band etched into the glass.
   Platinum letters cut into a dark strip, a platinum lip on top, the logo's blue as a faint edge light below. Legible,
   quiet, never a click target. ---------- */
.pep-lineup-wm {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 26px;
  margin: 0;
  overflow: hidden;
  pointer-events: none;
  font: 400 12px/1 var(--pep-font-display);
  letter-spacing: .34em;
  white-space: nowrap;
  text-transform: uppercase;
  background: linear-gradient(180deg, rgba(230, 233, 237, .12), rgba(11, 11, 12, .64) 32%, rgba(11, 11, 12, .64) 68%, rgba(230, 233, 237, .05));
  box-shadow: inset 0 1px 0 rgba(230, 233, 237, .4), inset 0 -1px 0 rgba(42, 120, 255, .85), inset 0 -8px 10px -8px rgba(42, 120, 255, .55);
  -webkit-backdrop-filter: blur(2px) saturate(120%);
          backdrop-filter: blur(2px) saturate(120%);
}
.pep-lineup-wm-t {
  margin-right: -.34em;
  color: var(--pep-plat-3);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 46%, var(--pep-plat-2) 54%, var(--pep-plat-3) 80%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 -1px 0 rgba(0, 0, 0, .9)) drop-shadow(0 0 3px rgba(42, 120, 255, .5));
}
/* on the front: a sash across the vial's shoulder, edge to edge (the glass's own cut trims its ends) */
[data-module="lineup"] .vc-stage .pep-lineup-wm--front {
  position: absolute;
  left: calc(-1 * var(--pep-lineup-px) - 12%);
  right: calc(-1 * var(--pep-lineup-px) - 12%);
  top: 24%;
  height: 30px;
  font-size: 12.5px;
  transform: rotate(-8deg);
}
/* on the description: a strip right under the name, edge to edge */
[data-module="lineup"] .pep-lineup-wm--detail { flex: 0 0 auto; margin: 0 calc(-1 * clamp(14px, 1.7vw, 30px)); }

/* ---------- THE WHOLE LINEUP ---------- */
.pep-lineup-all {
  position: relative;
  z-index: 3;
  /* the right edge keeps clear of the page's corner, where a fixed launcher from another section stands */
  padding: clamp(48px, 9vh, 104px) calc(var(--pep-lineup-pad) + 48px) clamp(36px, 6vh, 72px) var(--pep-lineup-pad);
  scroll-margin-top: 12px;
}
@media (max-width: 599px) {
  .pep-lineup-all { padding-right: 52px; }
}
.pep-lineup-all-head { display: flex; flex-wrap: wrap; align-items: baseline; justify-content: space-between; gap: 10px 28px; margin: 0 0 clamp(18px, 3vh, 30px); }
.pep-lineup-all-title { position: relative; margin: 0; font: 400 clamp(28px, 3.6vw, 52px)/1.06 var(--pep-font-display); letter-spacing: .06em; text-transform: uppercase; }
/* its chrome comes from the site's shared heading (.pep-chrome-head); this is only the stand-in, with no weight of its own */
:where(.pep-lineup-all-title) {
  color: var(--pep-plat-3);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 34%, var(--pep-plat-2) 48%, var(--pep-plat-1) 53%, var(--pep-plat-3) 64%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
}
.pep-lineup-all-title:focus { outline: 0; }
.pep-lineup-all-title:focus-visible { box-shadow: inset 0 -3px 0 #2a78ff; }
.pep-lineup-all-sub { margin: 0; font: 400 13px/1.35 var(--pep-font-display); letter-spacing: .2em; color: var(--pep-plat-3); }
.pep-lineup-all-n {
  font-size: 16px;
  color: var(--pep-plat-4);
  background-image: var(--pep-lineup-speck-dk), var(--pep-lineup-speck), var(--pep-lineup-face-frost);
  background-size: 70px 70px, 90px 90px, 100% 100%;
  background-repeat: repeat, repeat, no-repeat;
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 5px rgba(42, 120, 255, .55));
}
.pep-lineup-all-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 252px), 1fr));
  grid-auto-flow: row dense;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
}
/* a phone: one column, the name on the left and the size and price on the right, the band on its own line */
@media (max-width: 599px) {
  .pep-lineup-all-grid { grid-template-columns: minmax(0, 1fr); gap: 8px; }
}
.pep-lineup-item { position: relative; min-width: 0; }
.pep-lineup-item-btn {
  --pep-lineup-k: 18px;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  height: 100%;
  min-height: 96px;
  margin: 0;
  padding: 14px 16px 14px 18px;
  overflow: hidden;
  cursor: pointer;
  text-align: left;
  color: var(--pep-plat-3);
  border: 0;
  border-radius: 0;
  background: linear-gradient(158deg, rgba(230, 233, 237, .075), rgba(230, 233, 237, .012) 46%, rgba(230, 233, 237, .035));
  -webkit-backdrop-filter: blur(6px) saturate(150%);
          backdrop-filter: blur(6px) saturate(150%);
  clip-path: polygon(var(--pep-lineup-k) 0, 100% 0, 100% calc(100% - var(--pep-lineup-k)), calc(100% - var(--pep-lineup-k)) 100%, 0 100%, 0 var(--pep-lineup-k));
  transition: transform .4s var(--pep-ease), background-color .3s ease;
}
/* the chrome rim, drawn along the cuts */
.pep-lineup-item-btn::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: linear-gradient(150deg, var(--pep-plat-3), var(--pep-plat-1) 48%, var(--pep-plat-3));
  clip-path: polygon(evenodd, var(--pep-lineup-k) 0, 100% 0, 100% calc(100% - var(--pep-lineup-k)), calc(100% - var(--pep-lineup-k)) 100%, 0 100%, 0 var(--pep-lineup-k), var(--pep-lineup-k) 0, calc(var(--pep-lineup-k) + .41px) 1px, 1px calc(var(--pep-lineup-k) + .41px), 1px calc(100% - 1px), calc(100% - var(--pep-lineup-k) - .41px) calc(100% - 1px), calc(100% - 1px) calc(100% - var(--pep-lineup-k) - .41px), calc(100% - 1px) 1px, calc(var(--pep-lineup-k) + .41px) 1px);
  transition: background .4s ease;
}
/* house hover: ONE slow light, left to right */
.pep-lineup-item-btn::after {
  content: "";
  position: absolute;
  top: 0;
  bottom: 0;
  left: -70%;
  width: 50%;
  pointer-events: none;
  background: linear-gradient(100deg, rgba(42, 120, 255, 0), rgba(42, 120, 255, .14) 35%, rgba(207, 230, 255, .2) 50%, rgba(42, 120, 255, .14) 65%, rgba(42, 120, 255, 0));
  transform: translateX(0) skewX(-16deg);
  transition: transform 0s;
}
.pep-lineup-item-btn:hover::after,
.pep-lineup-item-btn:focus-visible::after { transform: translateX(380%) skewX(-16deg); transition: transform 1.4s ease-in-out; }
.pep-lineup-item-btn:hover,
.pep-lineup-item-btn:focus-visible { transform: translateY(-3px); }
.pep-lineup-item-btn:hover::before,
.pep-lineup-item-btn:focus-visible::before,
.pep-lineup-item[data-open] .pep-lineup-item-btn::before { background: linear-gradient(150deg, var(--pep-plat-4), var(--pep-plat-2) 48%, var(--pep-plat-4)); }
.pep-lineup-item-btn:focus-visible { outline: 0; box-shadow: inset 0 -3px 0 #2a78ff; }
.pep-lineup-item[data-open] .pep-lineup-item-btn { background-color: rgba(230, 233, 237, .06); box-shadow: inset 0 -2px 0 rgba(42, 120, 255, .8); }
.pep-lineup-item-top { display: flex; align-items: baseline; gap: 12px; min-width: 0; }
[data-module="lineup"] .pep-lineup-item-no { flex: 0 0 auto; font-size: 17px; }
.pep-lineup-item-name {
  min-width: 0;
  font: 400 clamp(15px, 1.12vw, 18px)/1.18 var(--pep-font-display);
  letter-spacing: .07em;
  overflow-wrap: break-word;
  color: var(--pep-plat-4);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 42%, var(--pep-plat-2) 50%, var(--pep-plat-3) 62%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 1px 0 rgba(0, 0, 0, .9)) drop-shadow(0 0 6px rgba(42, 120, 255, .28));
  transform-origin: 0 60%;
  transition: transform .4s var(--pep-ease);
}
.pep-lineup-item-btn:hover .pep-lineup-item-name,
.pep-lineup-item-btn:focus-visible .pep-lineup-item-name { transform: scale(1.05); }
.pep-lineup-item-meta { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 12px; font: 400 12.5px/1.25 var(--pep-font-display); letter-spacing: .16em; color: var(--pep-plat-3); }
.pep-lineup-item-price { font-weight: 400; white-space: nowrap; }
[data-module="lineup"] .pep-lineup-item .pep-lineup-price { font-size: 16px; }
.pep-lineup-item-count { color: transparent; }
.pep-lineup-item-plate { letter-spacing: .2em; }
/* the band on a list item: a strip along its foot, edge to edge (the item's own cut trims its end). On a wider screen
   every item keeps that room, so the size and price stand level along a row. */
.pep-lineup-wm--item { flex: 0 0 calc(100% + 34px); margin: 2px -16px -12px -18px; height: 24px; }
@media (min-width: 600px) {
  .pep-lineup-item-btn { padding-bottom: 40px; }
  .pep-lineup-wm--item { position: absolute; left: 0; right: 0; bottom: 0; margin: 0; }
}
@media (max-width: 599px) {
  .pep-lineup-item-btn { flex-direction: row; flex-wrap: wrap; align-items: center; min-height: 64px; gap: 8px 14px; padding: 12px 16px 12px 18px; }
  .pep-lineup-item-top { flex: 1 0 auto; max-width: 100%; }
  .pep-lineup-item-meta { flex: 0 1 auto; flex-direction: column; align-items: flex-end; gap: 3px; margin-left: auto; text-align: right; }
}
/* an item opened: the case's own glass and description, under its row */
[data-module="lineup"] .pep-lineup-view { grid-column: 1 / -1; --a: 34px; --b: 12px; --c: 26px; --d: 10px; }
[data-module="lineup"] .pep-lineup-view-case { max-width: 780px; margin: 0 auto; }
[data-module="lineup"] .pep-lineup-view .vc-pane { height: auto; padding: 0; animation: pep-lineup-view-in .34s var(--pep-ease) 1 both; }
@keyframes pep-lineup-view-in {
  from { opacity: 0; transform: translateY(-6px); }
  to { opacity: 1; transform: none; }
}
[data-module="lineup"] .pep-lineup-view .pep-lineup-detail { position: relative; inset: auto; overflow: visible; padding-bottom: 22px; }
.pep-lineup-view-buy { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 4px; }
.pep-lineup-view-buy > .pep-lineup-add { flex: 1 1 190px; width: auto; max-width: 360px; }
@media (prefers-reduced-motion: reduce) {
  [data-module="lineup"] .pep-lineup-view .vc-pane { animation: none; }
  .pep-lineup-skip::after,
  .pep-lineup-item-btn::after { display: none; }
}
/* ==== /CARDS-NOV13 ==== */"""

# =====================================================================================================================
# 30-cart: the HIDE BEFORE LAUNCH tag on a cart line and its checkout line
# =====================================================================================================================
CART_HTML = [
    ("""      <p class="pep-cart-line-size" data-line-size></p>
""",
     """      <p class="pep-cart-line-size" data-line-size></p>
      <p class="pep-cart-line-flag" data-line-flag hidden><span class="pep-cart-flag"><span class="pep-cart-flag-t">HIDE BEFORE LAUNCH</span></span></p>
"""),
    ("""<span class="pep-cart-sum-size"><span data-sum-size></span> × <span data-sum-qty></span></span></p>""",
     """<span class="pep-cart-sum-size"><span data-sum-size></span> × <span data-sum-qty></span></span><span class="pep-cart-flag pep-cart-flag--sum" data-sum-flag hidden><span class="pep-cart-flag-t">HIDE BEFORE LAUNCH</span></span></p>"""),
]
CART_JS = [
    ("""      var cad = function (cents) { return money.format(cents / 100); };
""",
     """      var cad = function (cents) { return money.format(cents / 100); };
      var flagged = Array.isArray(cfg.flagged) ? cfg.flagged.map(String) : [];    // config.js: still with counsel, tagged HIDE BEFORE LAUNCH on its line
"""),
    ("""            map[s.id] = { name: p.name, label: typeof s.label === 'string' ? s.label : '', cents: Math.round(s.priceCAD * 100) };""",
     """            map[s.id] = { name: p.name, label: typeof s.label === 'string' ? s.label : '', cents: Math.round(s.priceCAD * 100), flag: flagged.indexOf(String(p.sku)) >= 0 };"""),
    ("""          q('[data-line-size]', li).textContent = s.label;
""",
     """          q('[data-line-size]', li).textContent = s.label;
          var flag = q('[data-line-flag]', li);
          if (flag) { flag.hidden = !s.flag; }
          if (s.flag) { li.setAttribute('data-flagged', ''); }
"""),
    ("""          q('[data-sum-size]', li).textContent = s.label;
""",
     """          q('[data-sum-size]', li).textContent = s.label;
          var sflag = q('[data-sum-flag]', li);
          if (sflag) { sflag.hidden = !s.flag; }
"""),
]
CART_CSS = r"""/* ==== CARDS-NOV13: the HIDE BEFORE LAUNCH tag on the line of a product still with counsel (config.js flagged) ==== */
.pep-cart-line-flag { margin: 8px 0 0; }
.pep-cart-flag {
  display: inline-flex;
  align-items: center;
  min-height: 22px;
  padding: 0 16px 0 15px;
  font: 400 12px/1 var(--pep-font-display);
  letter-spacing: .22em;
  white-space: nowrap;
  text-transform: uppercase;
  background: linear-gradient(180deg, rgba(230, 233, 237, .12), rgba(11, 11, 12, .64) 32%, rgba(11, 11, 12, .64) 68%, rgba(230, 233, 237, .05));
  box-shadow: inset 0 1px 0 rgba(230, 233, 237, .4), inset 0 -1px 0 rgba(42, 120, 255, .85);
  clip-path: polygon(9px 0, 100% 0, calc(100% - 9px) 100%, 0 100%);
}
.pep-cart-flag-t {
  margin-right: -.22em;
  color: var(--pep-plat-3);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 46%, var(--pep-plat-2) 54%, var(--pep-plat-3) 80%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 3px rgba(42, 120, 255, .5));
}
.pep-cart-flag--sum { display: flex; width: max-content; margin-top: 6px; }
/* NO FLAT WHITE (Jeff's rules, Nov 13): the product names in the cart in platinum chrome lit by the blue; the other words
   that were plain white step down to the readable platinum. Nothing moves, nothing changes size. */
.pep-cart-line-name,
.pep-cart-sum-name {
  color: var(--pep-plat-4);
  background-image: linear-gradient(180deg, var(--pep-plat-4) 0%, var(--pep-plat-3) 44%, var(--pep-plat-2) 52%, var(--pep-plat-3) 70%, var(--pep-plat-4) 100%);
  -webkit-background-clip: text;
          background-clip: text;
  -webkit-text-fill-color: transparent;
  filter: drop-shadow(0 0 6px rgba(42, 120, 255, .3));
}
.pep-cart-btn2:focus-visible,
.pep-cart-back:hover,
.pep-cart-join:hover,
.pep-cart-select,
.pep-cart-select:focus-visible,
.pep-cart-err,
.pep-cart-h3,
.pep-cart-stop,
.pep-cart-pay,
.pep-cart-pay-to,
.pep-cart-shared-line,
.pep-cart-shared-btns button { color: var(--pep-plat-4); }
/* ==== /CARDS-NOV13 ==== */"""

# =====================================================================================================================
# 20-shelf: every product listed (when the list runs), the tag on a flagged slat
# =====================================================================================================================
SHELF_HTML = [
    ("""            <span class="pep-shelf-slat-family" data-slat-family></span>
""",
     """            <span class="pep-shelf-slat-family" data-slat-family></span>
            <span class="pep-shelf-slat-wm" data-slat-wm hidden>HIDE BEFORE LAUNCH</span>
"""),
]
SHELF_JS = [
    ("""          q('[data-slat-family]', li).textContent = p.family;
""",
     """          q('[data-slat-family]', li).textContent = p.family;
          if (flagged.indexOf(String(p.sku)) >= 0) { li.setAttribute('data-flagged', ''); var wm = q('[data-slat-wm]', li); if (wm) { wm.hidden = false; } }
"""),
    ("""        var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
        products = data.products.filter(function (p) {
""",
     """        var hidden = Array.isArray(cfg.hidden) ? cfg.hidden : [];    // config.js: products held back for counsel review
        var flagged = Array.isArray(cfg.flagged) ? cfg.flagged.map(String) : [];      // config.js: on show, tagged until counsel clears them
        products = data.products.filter(function (p) {
"""),
]
SHELF_CSS = r"""/* ==== CARDS-NOV13: the HIDE BEFORE LAUNCH tag on the slat of a product still with counsel (config.js flagged) ==== */
.pep-shelf-slat-wm {
  display: block;
  width: max-content;
  margin-top: 6px;
  padding: 5px 14px 5px 13px;
  font: 400 12px/1 var(--pep-font-display);
  letter-spacing: .2em;
  color: var(--pep-plat-3);
  background: linear-gradient(180deg, rgba(230, 233, 237, .12), rgba(11, 11, 12, .64) 32%, rgba(11, 11, 12, .64) 68%, rgba(230, 233, 237, .05));
  box-shadow: inset 0 1px 0 rgba(230, 233, 237, .4), inset 0 -1px 0 rgba(42, 120, 255, .85);
  clip-path: polygon(8px 0, 100% 0, calc(100% - 8px) 100%, 0 100%);
}
/* ==== /CARDS-NOV13 ==== */"""


def apply(text):
    text = edit_config(text)
    text = in_block(text, html_span(text, '16-lineup'), LINEUP_HTML, '16-lineup markup')
    text = in_block(text, js_span(text, 'modules/16-lineup/lineup.js'), LINEUP_JS, '16-lineup script')
    text = in_block(text, css_span(text, 'modules/16-lineup/lineup.css'), LINEUP_CSS_EDITS, '16-lineup style')
    text = add_css(text, css_span(text, 'modules/16-lineup/lineup.css'), LINEUP_CSS, '16-lineup style')
    text = in_block(text, html_span(text, '30-cart'), CART_HTML, '30-cart markup')
    text = in_block(text, js_span(text, 'modules/30-cart/cart.js'), CART_JS, '30-cart script')
    text = add_css(text, css_span(text, 'modules/30-cart/cart.css'), CART_CSS, '30-cart style')
    text = in_block(text, html_span(text, '20-shelf'), SHELF_HTML, '20-shelf markup')
    text = in_block(text, js_span(text, 'modules/20-shelf/shelf.js'), SHELF_JS, '20-shelf script')
    text = add_css(text, css_span(text, 'modules/20-shelf/shelf.css'), SHELF_CSS, '20-shelf style')
    # the old names must be gone from the lineup's script: every caller now asks push()
    i, j = js_span(text, 'modules/16-lineup/lineup.js')
    if 'nudge(' in text[i:j]:
        raise Stop('16-lineup script: a nudge( call is left over')
    return text


def main():
    if len(sys.argv) != 3:
        sys.stderr.write('usage: python3 -I apply.py IN.html OUT.html\n')
        sys.exit(2)
    with open(sys.argv[1], encoding='utf-8', newline='') as f:
        src = f.read()
    try:
        out = apply(src)
    except Stop as e:
        sys.stderr.write('apply.py STOPPED, nothing written: %s\n' % e)
        sys.exit(1)
    with open(sys.argv[2], 'w', encoding='utf-8', newline='') as f:
        f.write(out)
    print('apply.py: %s -> %s (%s, %+d bytes)' % (sys.argv[1], sys.argv[2], 'unchanged' if out == src else 'changed', len(out) - len(src)))


if __name__ == '__main__':
    main()

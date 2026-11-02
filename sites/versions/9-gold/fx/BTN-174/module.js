/* BTN-174 · Crown Set. window.APX.BTN174.mount(root) -> destroy()
   root: a single .apx-b174 element, or any container (every .apx-b174 inside is enhanced).
   Auto-mounts on [data-apx="BTN-174"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens (rebuilds on the 'apx:tokens' event). Reduced motion / --apx-motion:0 hold a still dial.
   Pure SVG + CSS. Press pulls the crown out one click; release snaps it home and fires the action. */
(function () {
  /* CHROME GOLD (9-gold): the metal ramps are re-cast in the owner's liquid chrome-gold (#332814 / #68513d / #A4845D / #F0E6C7 / #FEF9E8) when the page says data-colour="gold" */
  var GOLD = document.documentElement.getAttribute('data-colour') === 'gold';
  function goldOf(h) {
    var n = parseInt(h.slice(1), 16), k = ((n >> 16 & 255) * .2126 + (n >> 8 & 255) * .7152 + (n & 255) * .0722) / 255;
    var R = [[0, 51, 40, 20], [.3, 104, 81, 61], [.55, 164, 132, 93], [.85, 240, 230, 199], [1, 254, 249, 232]], i = 1;
    while (i < R.length - 1 && k > R[i][0]) i++;
    var a = R[i - 1], b = R[i], t = Math.max(0, Math.min(1, (k - a[0]) / (b[0] - a[0])));
    return '#' + [1, 2, 3].map(function (j) { return ('0' + Math.round(a[j] + (b[j] - a[j]) * t).toString(16)).slice(-2); }).join('');
  }
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN174 && APX.BTN174.mount) return;
  var CODE = 'BTN-174', NAME = 'Crown Set', CLS = 'apx-b174', KEY = '__apxBTN174';
  var mm = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false }; };
  var RM = mm('(prefers-reduced-motion: reduce)');
  var NS = 'http://www.w3.org/2000/svg', UID = 0, TAU = Math.PI * 2;
  var COLLAR = 5, CROWN = 14, PULL = 7, CZ = COLLAR + CROWN + PULL + 3, NR = 28;
  function svg(tag, a, parent) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); if (parent) parent.appendChild(n); return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function f2(v) { return (Math.round(v * 100) / 100).toString(); }

  /* ---- shared helper (same contract as the other APEX glass buttons) ---- */
  function Ctx(el) { this.el = el; this.offs = []; this.loops = []; this.tos = []; }
  Ctx.prototype = {
    c: function (n) { return CLS + '__' + n; },
    on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); this.offs.push(function () { t.removeEventListener(ev, fn, o); }); },
    motion: function () {
      if (RM.matches) return 0;
      var v = parseFloat(getComputedStyle(this.el).getPropertyValue('--apx-motion'));
      return isNaN(v) ? 1 : Math.max(0, v);
    },
    later: function (fn, ms) { var id = setTimeout(fn, ms); this.tos.push(id); return id; },
    loop: function (step) {
      var id = 0;
      function f(t) { id = 0; if (step(t) !== false) id = requestAnimationFrame(f); }
      var h = { kick: function () { if (!id) id = requestAnimationFrame(f); }, stop: function () { cancelAnimationFrame(id); id = 0; } };
      this.loops.push(h); return h;
    },
    size: function (cb) {
      var el = this.el, w = -1, h = -1;
      function run() { var nw = el.offsetWidth, nh = el.offsetHeight; if (nw !== w || nh !== h) { w = nw; h = nh; if (w && h) cb(w, h); } }
      if (window.ResizeObserver) { var ro = new ResizeObserver(run); ro.observe(el); this.offs.push(function () { ro.disconnect(); }); }
      else this.on(window, 'resize', run);
      run();
    },
    seen: function (cb) {
      var el = this.el, onScr = true;
      function upd() { cb(onScr && !document.hidden); }
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) { onScr = es[es.length - 1].isIntersecting; upd(); }, { rootMargin: '60px' });
        io.observe(el); this.offs.push(function () { io.disconnect(); });
      }
      this.on(document, 'visibilitychange', upd);
      return function () { return onScr && !document.hidden; };
    },
    dec: function (tag, name, parent, html) {
      var n = document.createElement(tag); n.className = name.split(' ').map(this.c, this).join(' ');
      n.setAttribute('aria-hidden', 'true'); if (html) n.innerHTML = html; (parent || this.el).appendChild(n); return n;
    },
    label: function (name) {
      var l = document.createElement('span'); l.className = this.c(name || 'l');
      (this.orig || []).forEach(function (n) { l.appendChild(n); });
      this.el.appendChild(l); return l;
    },
    kill: function () {
      this.loops.forEach(function (h) { h.stop(); }); this.tos.forEach(clearTimeout);
      this.offs.forEach(function (f) { f(); }); this.offs = []; this.loops = []; this.tos = [];
    }
  };

  function stadium(x, y, w, h) { var r = h / 2; return 'M' + f2(x + r) + ' ' + f2(y) + 'H' + f2(x + w - r) + 'A' + f2(r) + ' ' + f2(r) + ' 0 0 1 ' + f2(x + w - r) + ' ' + f2(y + h) + 'H' + f2(x + r) + 'A' + f2(r) + ' ' + f2(r) + ' 0 0 1 ' + f2(x + r) + ' ' + f2(y) + 'Z'; }

  function setup(el, ctx) {
    var id = 'apx132' + (++UID) + Math.random().toString(36).slice(2, 6);
    var cas = ctx.dec('span', 'case'); ctx.dec('span', 'g', cas); var sheen = ctx.dec('span', 'sheen', cas); ctx.dec('span', 'dome', cas);
    var snail = ctx.dec('span', 'snail');
    var s = svg('svg', { 'class': ctx.c('svg'), 'aria-hidden': 'true', focusable: 'false' });
    var defs = svg('defs', {}, s);
    var chr = svg('linearGradient', { id: id + 'c', gradientUnits: 'userSpaceOnUse' }, defs);
    [['0', '#4b525b'], ['.1', '#f6f8fa'], ['.2', '#a3abb5'], ['.33', '#262a30'], ['.46', '#e3e7ec'], ['.55', '#ffffff'], ['.66', '#5e656e'], ['.8', '#d5dae0'], ['.9', '#7e868f'], ['1', '#eef1f4']].forEach(function (a) { svg('stop', { offset: a[0], 'stop-color': GOLD ? goldOf(a[1]) : a[1] }, chr); });
    var cyl = svg('linearGradient', { id: id + 'y', x1: '0', y1: '0', x2: '0', y2: '1' }, defs);
    [['0', '#3a3f46'], ['.12', '#9aa2ab'], ['.28', '#ffffff'], ['.4', '#e1e5ea'], ['.62', '#6b727b'], ['.8', '#2a2e34'], ['.92', '#8a929b'], ['1', '#3a3f46']].forEach(function (a) { svg('stop', { offset: a[0], 'stop-color': GOLD ? goldOf(a[1]) : a[1] }, cyl); });
    var flt = svg('filter', { id: id + 'b', x: '-50%', y: '-50%', width: '200%', height: '200%' }, defs); svg('feGaussianBlur', { stdDeviation: '.7' }, flt);
    var ring = svg('path', { 'class': ctx.c('ring') }, s);
    var ticksD = svg('path', { 'class': ctx.c('tk') }, s), ticksL = svg('path', { 'class': ctx.c('tkl') }, s);
    var sub = svg('g', { 'class': ctx.c('sub') }, s);
    var subRingA = svg('circle', { 'class': ctx.c('rr') }, sub), subRingB = svg('circle', { 'class': ctx.c('rr') }, sub);
    var subTkD = svg('path', { 'class': ctx.c('tk') }, sub), subTkL = svg('path', { 'class': ctx.c('tkl') }, sub);
    var idx = svg('path', { 'class': ctx.c('idx') }, s);
    // seconds hand: shadow + steel needle + accent tip + pinion
    var handSh = svg('g', { 'class': ctx.c('hsh'), filter: 'url(#' + id + 'b)' }, s);
    var hand = svg('g', { 'class': ctx.c('hand') }, s);
    var needle = 'M-.75 6.5L.75 6.5L.42 -15.6L-.42 -15.6Z';
    svg('path', { d: needle, 'class': ctx.c('hsd') }, handSh); svg('circle', { cy: '5.2', r: '2', 'class': ctx.c('hsd') }, handSh);
    svg('path', { d: needle, 'class': ctx.c('nd') }, hand);
    svg('circle', { cy: '5.4', r: '1.35', 'class': ctx.c('cw') }, hand);
    svg('path', { d: 'M-.42 -15.6L.42 -15.6L.2 -21.6L-.2 -21.6Z', 'class': ctx.c('tip') }, hand);
    svg('circle', { r: '2.3', 'class': ctx.c('pin') }, hand); svg('circle', { r: '.75', 'class': ctx.c('pind') }, hand);
    // case band (polished chrome) drawn above the glass
    var band = svg('path', { 'class': ctx.c('band'), stroke: 'url(#' + id + 'c)' }, s), bandIn = svg('path', { 'class': ctx.c('bandin') }, s), bandHi = svg('path', { 'class': ctx.c('bandhi') }, s);
    // crown assembly
    var stem = svg('rect', { 'class': ctx.c('stem'), fill: 'url(#' + id + 'y)' }, s);
    var crown = svg('g', { 'class': ctx.c('crown') }, s);
    var collar = svg('rect', { fill: 'url(#' + id + 'y)', 'class': ctx.c('collar') }, crown);
    var body = svg('path', { fill: 'url(#' + id + 'y)', 'class': ctx.c('cbody') }, crown);
    var rg = svg('g', { 'class': ctx.c('ridges') }, crown), ridges = [];
    for (var i = 0; i < NR; i++) ridges.push([svg('line', { 'class': ctx.c('rd') }, rg), svg('line', { 'class': ctx.c('rl') }, rg)]);
    var cap = svg('rect', { 'class': ctx.c('cap') }, crown), flash = svg('rect', { 'class': ctx.c('flash') }, crown);
    el.appendChild(s);
    ctx.label();

    var W = 0, H = 0, Wc = 0, R = 0, cx = 0, cy = 0, M = 1, live = true, visible = true;
    var phi = 0, om = 0, windQ = 0, off = 0, pull = 0, pv = 0, pullT = 0, hov = false, foc = false, prs = false, tch = false, last = 0, gx = 0, gtx = 0, lastA = -999, lastPhi = -999, ticked = false;
    var STILL_A = 48;

    function layout(w, h) {
      W = w; H = h; Wc = w - CZ; R = h / 2; cx = R; cy = R;
      cas.style.right = CZ + 'px';
      var pad = 12;
      s.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + (w + 2 * pad) + ' ' + (h + 2 * pad));
      s.style.cssText = 'position:absolute;left:' + (-pad) + 'px;top:' + (-pad) + 'px;width:' + (w + 2 * pad) + 'px;height:' + (h + 2 * pad) + 'px;overflow:visible;pointer-events:none';
      band.setAttribute('d', stadium(1.6, 1.6, Wc - 3.2, h - 3.2));
      bandIn.setAttribute('d', stadium(3.6, 3.6, Wc - 7.2, h - 7.2));
      bandHi.setAttribute('d', stadium(.3, .3, Wc - .6, h - .6));
      chr.setAttribute('x1', '0'); chr.setAttribute('y1', '0'); chr.setAttribute('x2', String(Wc)); chr.setAttribute('y2', String(h));
      // focus ring around case + crown
      ring.setAttribute('d', stadium(-5, -5, Wc + COLLAR + CROWN + 8, h + 10));
      // sub-dial (small seconds) concentric with the left end
      var rO = R - 7.5, rI = rO - 4.2;
      subRingA.setAttribute('cx', cx); subRingA.setAttribute('cy', cy); subRingA.setAttribute('r', f2(rO));
      subRingB.setAttribute('cx', cx); subRingB.setAttribute('cy', cy); subRingB.setAttribute('r', f2(rI));
      var d = '';
      for (var i = 0; i < 60; i++) {
        var a = i / 60 * TAU, ma = i % 5 === 0, r1 = ma ? rI - 2.2 : rI, sn = Math.sin(a), cs = -Math.cos(a);
        d += 'M' + f2(cx + sn * rO) + ' ' + f2(cy + cs * rO) + 'L' + f2(cx + sn * r1) + ' ' + f2(cy + cs * r1);
      }
      subTkD.setAttribute('d', d); subTkL.setAttribute('d', d);
      snail.style.cssText = 'left:' + f2(cx - rI) + 'px;top:' + f2(cy - rI) + 'px;width:' + f2(rI * 2) + 'px;height:' + f2(rI * 2) + 'px';
      // minute track: top edge -> right end -> bottom edge, engraved
      var ins = 7, x0 = cx + rO + 7, x1 = Wc - R, rr = R - ins, td = '', step = 4.4, n = 0;
      var top = Math.max(0, x1 - x0), arc = Math.PI * rr, tot = top * 2 + arc, cnt = Math.floor(tot / step);
      for (var k = 0; k <= cnt; k++) {
        var L = k * step, big = k % 5 === 0, len = big ? 4.2 : 2.2, px, py, nx, ny;
        if (L <= top) { px = x0 + L; py = ins; nx = 0; ny = 1; }
        else if (L <= top + arc) { var t = (L - top) / rr - Math.PI / 2; px = x1 + Math.cos(t) * rr; py = cy + Math.sin(t) * rr; nx = -Math.cos(t); ny = -Math.sin(t); }
        else { px = x1 - (L - top - arc); py = h - ins; nx = 0; ny = -1; }
        if (px < x0 - .5) continue;
        td += 'M' + f2(px) + ' ' + f2(py) + 'L' + f2(px + nx * len) + ' ' + f2(py + ny * len); n++;
      }
      ticksD.setAttribute('d', td); ticksL.setAttribute('d', td);
      // 3 o'clock index pointing at the crown
      idx.setAttribute('d', 'M' + f2(Wc - ins) + ' ' + f2(cy - 1.3) + 'L' + f2(Wc - ins - 7) + ' ' + f2(cy - 1.3) + 'M' + f2(Wc - ins) + ' ' + f2(cy + 1.3) + 'L' + f2(Wc - ins - 7) + ' ' + f2(cy + 1.3));
      // crown parts (local to the case's right edge)
      var bx = Wc - 1.5;
      stem.setAttribute('x', f2(bx)); stem.setAttribute('y', f2(cy - 2.4)); stem.setAttribute('width', f2(COLLAR + PULL + 2)); stem.setAttribute('height', '4.8');
      collar.setAttribute('x', f2(bx)); collar.setAttribute('y', f2(cy - 8)); collar.setAttribute('width', f2(COLLAR + 1)); collar.setAttribute('height', '16'); collar.setAttribute('rx', '1');
      var c0 = bx + COLLAR + .5, c1 = c0 + CROWN, hh = Math.min(15, R - 13), ch = 2.2;
      body.setAttribute('d', 'M' + f2(c0) + ' ' + f2(cy - hh + ch) + 'L' + f2(c0 + ch) + ' ' + f2(cy - hh) + 'L' + f2(c1 - ch) + ' ' + f2(cy - hh) + 'L' + f2(c1) + ' ' + f2(cy - hh + ch) + 'L' + f2(c1) + ' ' + f2(cy + hh - ch) + 'L' + f2(c1 - ch) + ' ' + f2(cy + hh) + 'L' + f2(c0 + ch) + ' ' + f2(cy + hh) + 'L' + f2(c0) + ' ' + f2(cy + hh - ch) + 'Z');
      cap.setAttribute('x', f2(c1 - 1.6)); cap.setAttribute('y', f2(cy - hh + 2)); cap.setAttribute('width', '1.2'); cap.setAttribute('height', f2(hh * 2 - 4));
      flash.setAttribute('x', f2(c0)); flash.setAttribute('y', f2(cy - hh)); flash.setAttribute('width', f2(CROWN)); flash.setAttribute('height', f2(hh * 2)); flash.setAttribute('rx', '2');
      ridges.forEach(function (p) { [p[0], p[1]].forEach(function (ln) { ln.setAttribute('x1', f2(c0 + 1.2)); ln.setAttribute('x2', f2(c1 - 2)); }); });
      layout.hh = hh; lastA = lastPhi = -999; draw(performance.now());
    }

    function setRidges() {
      var hh = layout.hh || 14, Rc = hh - 1;
      for (var i = 0; i < NR; i++) {
        var th = phi + i / NR * TAU, c = Math.cos(th), p = ridges[i];
        if (c <= .08) { p[0].setAttribute('opacity', '0'); p[1].setAttribute('opacity', '0'); continue; }
        var y = cy + Math.sin(th) * Rc;
        p[0].setAttribute('y1', f2(y)); p[0].setAttribute('y2', f2(y)); p[0].setAttribute('opacity', f2(.25 + .6 * c));
        p[1].setAttribute('y1', f2(y + .7 * c)); p[1].setAttribute('y2', f2(y + .7 * c)); p[1].setAttribute('opacity', f2(.15 + .55 * c * c));
      }
    }

    function handAngle(now) {
      if (!M) return STILL_A;
      var secs = Date.now() / 1000 + off; secs = Math.floor(secs * 8) / 8; // 8 beats a second: a fine sweep
      return (secs % 60) * 6;
    }

    function draw(now) {
      var a = handAngle(now);
      if (Math.abs(a - lastA) > .01) {
        var tr = 'translate(' + f2(cx) + ' ' + f2(cy) + ') rotate(' + f2(a) + ')';
        hand.setAttribute('transform', tr); handSh.setAttribute('transform', 'translate(' + f2(cx + .9) + ' ' + f2(cy + 1.4) + ') rotate(' + f2(a) + ')'); lastA = a;
      }
      if (Math.abs(phi - lastPhi) > .001) { setRidges(); lastPhi = phi; }
      var px = pull * PULL;
      crown.setAttribute('transform', 'translate(' + f2(px) + ' 0)');
      chr.setAttribute('gradientTransform', 'translate(' + f2(gx) + ' 0)');
    }

    function step(now) {
      if (!live || !visible) return false;
      var dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
      M = ctx.motion();
      if (!M) { phi = 0; om = 0; windQ = 0; pull = prs ? 1 : 0; pv = 0; gx = 0; draw(now); return false; }
      var hot = hov || tch;
      var tOm = prs ? 0 : hot ? TAU * 1.15 : 0;
      if (windQ > 0 && !prs) { tOm = Math.max(tOm, Math.min(TAU * 1.6, windQ * 5 + 1)); }
      om += (tOm - om) * Math.min(1, dt * (tOm > om ? 5 : 3.2));
      var dphi = om * dt; phi += dphi; if (windQ > 0) windQ = Math.max(0, windQ - dphi);
      if (prs) off -= dt; // hacking: pulling the crown stops the seconds
      off += dphi / TAU * 42; // winding sets the seconds hand ahead
      // crown pull spring
      var tp = prs ? 1 : 0, K = prs ? 520 : 900, D = prs ? 26 : 19;
      pv += (tp - pull) * K * dt; pv *= Math.exp(-D * dt); pull += pv * dt;
      if (prs && !ticked && pull > .93) { ticked = true; el.classList.add('is-tick'); ctx.later(function () { el.classList.remove('is-tick'); }, 180); }
      if (!prs) ticked = false;
      gx += (gtx - gx) * Math.min(1, dt * 6);
      draw(now);
      return true;
    }
    var loopH = ctx.loop(step);
    function kick() { if (visible && live) { last = 0; loopH.kick(); } }
    var isSeen = ctx.seen(function (v) { visible = v; if (v) kick(); else loopH.stop(); });

    function sync() { el.classList.toggle('is-hot', hov || foc || tch); el.classList.toggle('is-press', prs); kick(); }
    function press() { if (prs) return; prs = true; sync(); }
    function release(fire) { if (!prs) return; prs = false; el.classList.remove('is-snap'); void el.offsetWidth; el.classList.add('is-snap'); ctx.later(function () { el.classList.remove('is-snap'); }, 700); sync(); if (fire) el.click(); }
    ctx.on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { hov = true; sync(); } });
    ctx.on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') { hov = false; gtx = 0; } if (prs) { prs = false; } sync(); });
    ctx.on(el, 'pointermove', function (e) { if (e.pointerType !== 'mouse') return; var r = el.getBoundingClientRect(); gtx = ((e.clientX - r.left) / r.width - .5) * 60; kick(); }, { passive: true });
    var tT = 0;
    ctx.on(el, 'pointerdown', function (e) { if (e.button > 0) return; if (e.pointerType !== 'mouse') { clearTimeout(tT); tch = true; } press(); });
    ctx.on(el, 'pointerup', function () { release(false); if (tch) { clearTimeout(tT); tT = ctx.later(function () { tch = false; sync(); }, 900); } });
    ctx.on(el, 'pointercancel', function () { prs = false; tch = false; sync(); });
    ctx.on(el, 'focus', function () { var fv; try { fv = el.matches(':focus-visible'); } catch (e) { fv = true; } foc = fv; if (fv) windQ = TAU; sync(); });
    ctx.on(el, 'blur', function () { foc = false; prs = false; sync(); });
    // keyboard: Enter / Space pull the crown; letting go snaps it home and fires the action once
    ctx.on(el, 'keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); if (!e.repeat) press();
    });
    ctx.on(el, 'keyup', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); release(true);
    });
    var onTok = function () { M = ctx.motion(); el.classList.toggle('is-still', !M); lastA = -999; if (W) layout(W, H); kick(); };
    ctx.on(el, 'apx:tokens', onTok); ctx.on(window, 'apx:tokens', onTok);
    if (RM.addEventListener) ctx.on(RM, 'change', onTok);
    M = ctx.motion(); el.classList.toggle('is-still', !M);
    ctx.size(layout);
    visible = isSeen(); kick();
    return function () { live = false; };
  }

  function enhance(el) {
    if (el[KEY]) return el[KEY];
    var orig = el.innerHTML, attrs = [].map.call(el.attributes, function (a) { return [a.name, a.value]; });
    var ctx = new Ctx(el), extra;
    ctx.orig = [].slice.call(el.childNodes);
    el.classList.add('is-apx');
    try { extra = setup(el, ctx); } catch (err) { ctx.kill(); el.innerHTML = orig; throw err; }
    function destroy() {
      ctx.kill(); if (typeof extra === 'function') extra();
      el.innerHTML = orig;
      [].slice.call(el.attributes).forEach(function (a) { el.removeAttribute(a.name); });
      attrs.forEach(function (a) { el.setAttribute(a[0], a[1]); });
      delete el[KEY];
    }
    el[KEY] = destroy; return destroy;
  }
  function mount(root) {
    if (!root || root.nodeType !== 1) return function () {};
    if (root[KEY + 'r']) return root[KEY + 'r'];
    var added = false;
    if (!root.classList.contains(CLS) && !root.querySelector('.' + CLS) && root.matches('button,a')) { root.classList.add(CLS); added = true; }
    var els = root.classList.contains(CLS) ? [root] : [].slice.call(root.querySelectorAll('.' + CLS));
    var ds = els.map(enhance);
    function destroy() { ds.forEach(function (d) { d(); }); if (added) root.classList.remove(CLS); delete root[KEY + 'r']; }
    root[KEY + 'r'] = destroy; return destroy;
  }
  APX.BTN174 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN174;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

/* BTN-124 · Magnet Pull. window.APX.BTN124.mount(root) -> destroy()
   root: a single .apx-b124 element, or any container (every .apx-b124 inside is enhanced).
   Auto-mounts on [data-apx="BTN-124"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0 keep the glass but stop the motion. */
(function () {
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN124 && APX.BTN124.mount) return;
  var CODE = 'BTN-124', NAME = 'Magnet Pull', CLS = 'apx-b124', KEY = '__apxBTN124';
  var mm = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false }; };
  var RM = mm('(prefers-reduced-motion: reduce)'), FINE = mm('(hover: hover) and (pointer: fine)');
  var NS = 'http://www.w3.org/2000/svg', UID = 0;
  function svg(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, k) { return a + (b - a) * k; }

  function Ctx(el) { this.el = el; this.offs = []; this.loops = []; this.tos = []; }
  Ctx.prototype = {
    c: function (n) { return CLS + '__' + n; },
    on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); this.offs.push(function () { t.removeEventListener(ev, fn, o); }); },
    motion: function () {
      if (RM.matches) return 0;
      var v = parseFloat(getComputedStyle(this.el).getPropertyValue('--apx-motion'));
      return isNaN(v) ? 1 : Math.max(0, v);
    },
    fine: function () { return FINE.matches; },
    later: function (fn, ms) { var id = setTimeout(fn, ms); this.tos.push(id); return id; },
    // a rAF loop that sleeps: step(t) returns false to stop; kick() wakes it
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
    // decorative node (aria-hidden), appended to parent (default el)
    dec: function (tag, name, parent, html) {
      var n = document.createElement(tag); n.className = name.split(' ').map(this.c, this).join(' ');
      n.setAttribute('aria-hidden', 'true'); if (html) n.innerHTML = html; (parent || this.el).appendChild(n); return n;
    },
    // wraps the original content in the readable label span
    label: function (name) {
      var l = document.createElement('span'); l.className = this.c(name || 'l');
      (this.orig || []).forEach(function (n) { l.appendChild(n); });
      this.el.appendChild(l); return l;
    },
    // SVG rim: edge line, specular top highlight, focus ring; set(d, w, h) in host px coords
    rim: function (host, pad) {
      var p = pad == null ? 6 : pad, id = 'apxg' + (++UID) + Math.random().toString(36).slice(2, 6);
      var s = svg('svg', { 'class': this.c('rim'), 'aria-hidden': 'true', focusable: 'false' });
      var lg = svg('linearGradient', { id: id, x1: '0', y1: '0', x2: '.35', y2: '1' });
      [['0', '.78'], ['.42', '.06'], ['1', '.3']].forEach(function (st) { lg.appendChild(svg('stop', { offset: st[0], 'stop-color': '#fff', 'stop-opacity': st[1] })); });
      var defs = svg('defs', {}); defs.appendChild(lg); s.appendChild(defs);
      var ring = svg('path', { 'class': this.c('ring') }), edge = svg('path', { 'class': this.c('edge') }), hi = svg('path', { 'class': this.c('hi'), stroke: 'url(#' + id + ')' });
      s.appendChild(ring); s.appendChild(edge); s.appendChild(hi); (host || this.el).appendChild(s);
      return {
        svg: s, paths: [ring, edge, hi], extra: function (tag, a) { var n = svg(tag, a); s.appendChild(n); return n; },
        set: function (d, w, h) {
          s.setAttribute('viewBox', (-p) + ' ' + (-p) + ' ' + (w + 2 * p) + ' ' + (h + 2 * p));
          s.style.cssText = 'position:absolute;left:' + (-p) + 'px;top:' + (-p) + 'px;width:' + (w + 2 * p) + 'px;height:' + (h + 2 * p) + 'px;overflow:visible;pointer-events:none';
          ring.setAttribute('d', d); edge.setAttribute('d', d); hi.setAttribute('d', d);
        }
      };
    },
    // shared state: .is-hot (hover / keyboard focus / touch press) and .is-press; cb(hot, press)
    states: function (cb) {
      var el = this.el, self = this, hov = false, foc = false, tch = false, prs = false, t = 0;
      function sync() { var hot = hov || foc || tch; el.classList.toggle('is-hot', hot); el.classList.toggle('is-press', prs); if (cb) cb(hot, prs); }
      this.on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { hov = true; sync(); } });
      this.on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') hov = false; prs = false; sync(); });
      this.on(el, 'pointerdown', function (e) {
        prs = true; if (e.pointerType !== 'mouse') { clearTimeout(t); tch = true; } sync();
      });
      function up() { if (!prs && !tch) return; prs = false; if (tch) { clearTimeout(t); t = self.later(function () { tch = false; sync(); }, 650); } sync(); }
      this.on(el, 'pointerup', up); this.on(el, 'pointercancel', up);
      this.on(el, 'focus', function () { try { foc = el.matches(':focus-visible'); } catch (e) { foc = true; } sync(); });
      this.on(el, 'blur', function () { foc = false; prs = false; sync(); });
      this.on(el, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { prs = true; sync(); } });
      this.on(el, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { prs = false; sync(); } });
      return { get hot() { return hov || foc || tch; }, get press() { return prs; } };
    },
    kill: function () {
      this.loops.forEach(function (h) { h.stop(); }); this.tos.forEach(clearTimeout);
      this.offs.forEach(function (f) { f(); }); this.offs = []; this.loops = []; this.tos = [];
    }
  };

  function setup(el, ctx) {
    var body = ctx.dec('span', 'body'); var halo = ctx.dec('span', 'halo', body); ctx.dec('span', 'g', body); ctx.dec('span', 'amb', body);
    var l = ctx.label(); var lw = document.createElement('span'); lw.className = ctx.c('lw'); el.insertBefore(lw, l); lw.appendChild(l);
    ctx.dec('span', 'tick', l);
    var bx = 0, by = 0, vx = 0, vy = 0, tx = 0, ty = 0, lx = 0, ly = 0, h = 0, th = 0, sc = 1, tsc = 1, R = 120, st, rect = null;
    var loop = ctx.loop(function () {
      var m = ctx.motion();
      if (!m) { bx = by = lx = ly = 0; h = th; sc = tsc; }
      else { vx += (tx - bx) * .14; vy += (ty - by) * .14; vx *= .74; vy *= .74; bx += vx; by += vy; lx = lerp(lx, tx * .55, .2); ly = lerp(ly, ty * .55, .2); h = lerp(h, th, .15); sc = lerp(sc, tsc, .3); }
      body.style.transform = 'translate(' + bx.toFixed(2) + 'px,' + by.toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')';
      lw.style.transform = 'translate(' + (bx + lx).toFixed(2) + 'px,' + (by + ly).toFixed(2) + 'px) scale(' + sc.toFixed(4) + ')';
      halo.style.opacity = h.toFixed(3); halo.style.transform = 'skewX(-12deg) scale(' + (.9 + h * .1).toFixed(4) + ')';
      return Math.abs(vx) + Math.abs(vy) + Math.abs(tx - bx) + Math.abs(ty - by) + Math.abs(h - th) + Math.abs(sc - tsc) > .01;
    });
    ctx.on(window, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      rect = el.getBoundingClientRect();
      var cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2, dx = e.clientX - cx, dy = e.clientY - cy;
      var ex = Math.max(0, Math.abs(dx) - rect.width / 2), ey = Math.max(0, Math.abs(dy) - rect.height / 2), d = Math.hypot(ex, ey);
      if (d < R) { var f = 1 - d / R; tx = dx * .22 * f; ty = dy * .32 * f; th = f; loop.kick(); }
      else if (tx || ty || th) { tx = ty = 0; th = 0; loop.kick(); }
    }, { passive: true });
    ctx.on(document, 'pointerleave', function () { tx = ty = th = 0; loop.kick(); });
    st = ctx.states(function (hot, press) { tsc = press ? .96 : 1; if (press) { tx *= .3; ty *= .3; } loop.kick(); });
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
  APX.BTN124 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN124;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

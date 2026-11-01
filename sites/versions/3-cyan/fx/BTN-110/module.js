/* BTN-110 · Liquid Stretch. window.APX.BTN110.mount(root) -> destroy()
   root: a single .apx-b110 element, or any container (every .apx-b110 inside is enhanced).
   Auto-mounts on [data-apx="BTN-110"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0 keep the glass but stop the motion. */
(function () {
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN110 && APX.BTN110.mount) return;
  var CODE = 'BTN-110', NAME = 'Liquid Stretch', CLS = 'apx-b110', KEY = '__apxBTN110';
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
    var O = 44, N = 84;
    var wrap = ctx.dec('span', 'wrap'), g = ctx.dec('span', 'g', wrap); ctx.dec('span', 'hl', g);
    ctx.label();
    var r = ctx.rim(wrap, 0);
    var W = 0, H = 0, base = [], perim = 0, amp = 0, vel = 0, tAmp = 0, P = { x: 0, y: 0 }, idx = 0, inside = false;
    var cx = -1e4, cy = -1e4, rect = null, st;
    function build() {
      base = []; var rr = H / 2, L = W - H; perim = 2 * L + 2 * Math.PI * rr;
      for (var i = 0; i < N; i++) {
        var s = i / N * perim, x, y, nx, ny, a;
        if (s < L) { x = rr + s; y = 0; nx = 0; ny = -1; }
        else if (s < L + Math.PI * rr) { a = -Math.PI / 2 + (s - L) / rr; x = W - rr + Math.cos(a) * rr; y = rr + Math.sin(a) * rr; nx = Math.cos(a); ny = Math.sin(a); }
        else if (s < 2 * L + Math.PI * rr) { x = W - rr - (s - L - Math.PI * rr); y = H; nx = 0; ny = 1; }
        else { a = Math.PI / 2 + (s - 2 * L - Math.PI * rr) / rr; x = rr + Math.cos(a) * rr; y = rr + Math.sin(a) * rr; nx = Math.cos(a); ny = Math.sin(a); }
        base.push({ x: x, y: y, nx: nx, ny: ny, s: s });
      }
    }
    function path() {
      var sig = 30, pts = [], c = base[idx];
      for (var i = 0; i < N; i++) {
        var b = base[i], ds = Math.abs(b.s - c.s); ds = Math.min(ds, perim - ds);
        var f = Math.exp(-(ds * ds) / (sig * sig)) * amp, mx = b.nx, my = b.ny;
        if (!inside) { var dx = P.x - b.x, dy = P.y - b.y, dl = Math.hypot(dx, dy) || 1; mx = b.nx * .55 + dx / dl * .45; my = b.ny * .55 + dy / dl * .45; }
        pts.push([O + b.x + mx * f, O + b.y + my * f]);
      }
      var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1);
      for (i = 0; i < N; i++) {
        var p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
        d += 'C' + (p1[0] + (p2[0] - p0[0]) / 6).toFixed(1) + ' ' + (p1[1] + (p2[1] - p0[1]) / 6).toFixed(1) + ' ' + (p2[0] - (p3[0] - p1[0]) / 6).toFixed(1) + ' ' +
          (p2[1] - (p3[1] - p1[1]) / 6).toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1);
      }
      return d + 'Z';
    }
    function draw() { if (!base.length || !base[idx]) return; var d = path(); g.style.clipPath = "path('" + d + "')"; r.set(d, W + 2 * O, H + 2 * O); }
    function aim() {
      if (!W) return;
      if (!ctx.motion()) { tAmp = 0; return; }
      if (st && st.press && !(cx > -1e3)) { return; }
      if (cx < -1e3) { if (st && st.hot) { P.x = W + 30; P.y = H / 2; inside = false; idx = Math.round(((W - H) + Math.PI * H / 4) / perim * N) % N; tAmp = 16; } else tAmp = 0; return; }
      var px = cx - rect.left, py = cy - rect.top, best = 0, bd = 1e9;
      for (var i = 0; i < N; i++) { var dx = px - base[i].x, dy = py - base[i].y, dd = dx * dx + dy * dy; if (dd < bd) { bd = dd; best = i; } }
      var d = Math.sqrt(bd), rr = H / 2, qx = clamp(px, rr, W - rr);
      inside = Math.hypot(px - qx, py - rr) <= rr;
      if (inside) { idx = best; P.x = px; P.y = py; tAmp = st && st.press ? 2 : 8; }
      else if (d < 84) { idx = best; P.x = px; P.y = py; tAmp = Math.min(8 + Math.min(d, 34) * (1 - d / 84) * 1.5, d + 6, 36); }
      else tAmp = 0;
    }
    var loop = ctx.loop(function () {
      rect = el.getBoundingClientRect(); aim();
      vel += (tAmp - amp) * .16; vel *= .74; amp += vel;
      if (!ctx.motion()) { amp = 0; vel = 0; }
      draw();
      return Math.abs(vel) > .02 || Math.abs(tAmp - amp) > .05 || tAmp > 0;
    });
    ctx.size(function (w, h) { W = w; H = h; el.style.setProperty('--w', w + 'px'); build(); draw(); });
    ctx.on(window, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      cx = e.clientX; cy = e.clientY; rect = rect || el.getBoundingClientRect();
      if (cx > rect.left - 90 && cx < rect.right + 90 && cy > rect.top - 90 && cy < rect.bottom + 90) loop.kick();
      else if (tAmp) { tAmp = 0; loop.kick(); }
    }, { passive: true });
    ctx.on(window, 'scroll', function () { rect = null; }, { passive: true, capture: true });
    ctx.on(el, 'pointerdown', function (e) { if (e.pointerType !== 'mouse') { cx = e.clientX; cy = e.clientY; } loop.kick(); });
    ctx.on(el, 'pointerup', function (e) { if (e.pointerType !== 'mouse') { cx = cy = -1e4; } loop.kick(); });
    ctx.on(document, 'pointerleave', function () { cx = cy = -1e4; loop.kick(); });
    st = ctx.states(function () { loop.kick(); });
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
  APX.BTN110 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN110;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

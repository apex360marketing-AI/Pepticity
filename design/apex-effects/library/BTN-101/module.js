/* BTN-101 · Torn Stub. window.APX.BTN101.mount(root) -> destroy()
   root: a single .apx-b101 element, or any container (every .apx-b101 inside is enhanced).
   Auto-mounts on [data-apx="BTN-101"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0 keep the glass but stop the motion. */
(function () {
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN101 && APX.BTN101.mount) return;
  var CODE = 'BTN-101', NAME = 'Torn Stub', CLS = 'apx-b101', KEY = '__apxBTN101';
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
    var main = ctx.dec('span', 'main'), mg = ctx.dec('span', 'g', main);
    var stub = ctx.dec('span', 'stub'), sg = ctx.dec('span', 'g', stub);
    ctx.dec('span', 'ic', stub, '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h13M13 6l6 6-6 6"/></svg>');
    ctx.label();
    var r1 = ctx.rim(main), r2 = ctx.rim(stub), perf = r1.extra('line', { 'class': ctx.c('perf') });
    var SW = 52, N = 7, R = 10;
    ctx.size(function (w, h) {
      var a = w - SW;
      main.style.width = a + 'px'; stub.style.left = a + 'px'; stub.style.width = SW + 'px';
      var dm = 'M' + R + ' 0H' + (a - N) + 'A' + N + ' ' + N + ' 0 0 0 ' + a + ' ' + N + 'V' + (h - N) + 'A' + N + ' ' + N + ' 0 0 0 ' + (a - N) + ' ' + h +
        'H' + R + 'A' + R + ' ' + R + ' 0 0 1 0 ' + (h - R) + 'V' + R + 'A' + R + ' ' + R + ' 0 0 1 ' + R + ' 0Z';
      var ds = 'M0 ' + N + 'A' + N + ' ' + N + ' 0 0 0 ' + N + ' 0H' + (SW - R) + 'A' + R + ' ' + R + ' 0 0 1 ' + SW + ' ' + R + 'V' + (h - R) +
        'A' + R + ' ' + R + ' 0 0 1 ' + (SW - R) + ' ' + h + 'H' + N + 'A' + N + ' ' + N + ' 0 0 0 0 ' + (h - N) + 'Z';
      mg.style.clipPath = "path('" + dm + "')"; sg.style.clipPath = "path('" + ds + "')";
      r1.set(dm, a, h); r2.set(ds, SW, h);
      perf.setAttribute('x1', a); perf.setAttribute('x2', a); perf.setAttribute('y1', N + 5); perf.setAttribute('y2', h - N - 5);
    });
    ctx.states();
    ctx.on(el, 'click', function () {
      if (!ctx.motion()) return;
      el.classList.remove('is-tear'); void el.offsetWidth; el.classList.add('is-tear');
      ctx.later(function () { el.classList.remove('is-tear'); }, 950);
    });
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
  APX.BTN101 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN101;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

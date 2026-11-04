/* BTN-118 · Thick Glass. window.APX.BTN118.mount(root) -> destroy()
   root: a single .apx-b118 element, or any container (every .apx-b118 inside is enhanced).
   Auto-mounts on [data-apx="BTN-118"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0 keep the glass but stop the motion. */
(function () {
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN118 && APX.BTN118.mount) return;
  var CODE = 'BTN-118', NAME = 'Thick Glass', CLS = 'apx-b118', KEY = '__apxBTN118';
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
    var g = ctx.dec('span', 'g'); ctx.dec('span', 'cau', g);
    ctx.label();
    var ok = window.CSS && CSS.supports && CSS.supports('backdrop-filter', 'url(#a)') && /Chrome\//.test(navigator.userAgent) && !/Edg\/|Firefox\//.test('');
    if (!ok) return;
    var id = 'apxrefr' + Math.random().toString(36).slice(2, 8);
    var host = svg('svg', { 'class': ctx.c('fx'), 'aria-hidden': 'true', focusable: 'false', width: '0', height: '0' });
    var f = svg('filter', { id: id, x: '0', y: '0', width: '100%', height: '100%', filterUnits: 'userSpaceOnUse', 'color-interpolation-filters': 'sRGB' });
    var img = svg('feImage', { result: 'map', x: '0', y: '0', preserveAspectRatio: 'none' });
    var dm = svg('feDisplacementMap', { 'in': 'SourceGraphic', in2: 'map', scale: '20', xChannelSelector: 'R', yChannelSelector: 'G' });
    f.appendChild(img); f.appendChild(dm); host.appendChild(f); el.appendChild(host);
    var W = 0, H = 0, sc = 20, tsc = 20, ox = 0, tox = 0, oy = 0, toy = 0;
    function map(w, h) {
      var c = document.createElement('canvas'); c.width = w; c.height = h; var x2 = c.getContext('2d'), im = x2.createImageData(w, h), d = im.data;
      var r = 14, e = 18, hw = w / 2, hh = h / 2;
      for (var y = 0; y < h; y++) for (var x = 0; x < w; x++) {
        var px = x + .5 - hw, py = y + .5 - hh, qx = Math.abs(px) - (hw - r), qy = Math.abs(py) - (hh - r);
        var mx = Math.max(qx, 0), my = Math.max(qy, 0), sd = Math.hypot(mx, my) + Math.min(Math.max(qx, qy), 0) - r, dist = -sd;
        var nx = 0, ny = 0;
        if (qx > 0 && qy > 0) { var L = Math.hypot(mx, my) || 1; nx = mx / L; ny = my / L; } else if (qx > qy) nx = 1; else ny = 1;
        nx *= px < 0 ? -1 : 1; ny *= py < 0 ? -1 : 1;
        var s = dist < e ? Math.pow(1 - Math.max(dist, 0) / e, 2) : 0, i = (y * w + x) * 4;
        d[i] = 128 + nx * 127 * s; d[i + 1] = 128 + ny * 127 * s; d[i + 2] = 128; d[i + 3] = 255;
      }
      x2.putImageData(im, 0, 0); return c.toDataURL();
    }
    function apply() {
      dm.setAttribute('scale', sc.toFixed(1));
      img.setAttribute('x', ox.toFixed(1)); img.setAttribute('y', oy.toFixed(1));
    }
    ctx.size(function (w, h) {
      W = w; H = h; img.setAttribute('href', map(w, h)); img.setAttribute('width', w); img.setAttribute('height', h);
      f.setAttribute('width', w); f.setAttribute('height', h);
      g.style.backdropFilter = 'url(#' + id + ') blur(2px) saturate(170%) brightness(1.04)';
      if (g.style.backdropFilter) el.classList.add('is-refract'); apply();
    });
    var loop = ctx.loop(function () {
      var k = ctx.motion() ? .12 : 1; sc = lerp(sc, tsc, k); ox = lerp(ox, tox, k); oy = lerp(oy, toy, k); apply();
      return Math.abs(sc - tsc) + Math.abs(ox - tox) + Math.abs(oy - toy) > .05;
    });
    ctx.on(el, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !ctx.motion()) return;
      var b = el.getBoundingClientRect(); tox = ((e.clientX - b.left) / b.width - .5) * 14; toy = ((e.clientY - b.top) / b.height - .5) * 8; loop.kick();
    }, { passive: true });
    ctx.states(function (hot, press) { tsc = press ? 70 : hot ? 46 : 20; if (!hot) { tox = toy = 0; } loop.kick(); });
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
  APX.BTN118 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN118;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

/*! APEX library SCR-105 · Grid Bloom — self-contained, token-driven. window.APX['SCR-105'].mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX core (inlined per module; no globals besides window.APX) ---- */
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease3(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeIO(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function tok(el, n, fb) { var v = getComputedStyle(el).getPropertyValue(n).trim(); return v || fb; }
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(tok(el, '--apx-motion', '1'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
  function isCompact() { return W.matchMedia('(max-width: 899px)').matches; }
  function isTouch() { return W.matchMedia('(hover: none)').matches; }
  var _cx;
  /* any CSS colour -> [r,g,b,a] in 0..1 */
  function rgba(str, fb) {
    if (!_cx) { var c = D.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = fb || '#000'; _cx.fillStyle = str || fb || '#000';
    _cx.fillRect(0, 0, 1, 1); var d = _cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function register(code, name, mountFn) {
    var key = code.replace('-', '');
    function mount(root, opts) {
      if (!root || root.nodeType !== 1) return function () {};
      root.__apx = root.__apx || {};
      if (root.__apx[key]) return root.__apx[key];
      var cleanups = [];
      var api = {
        on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); cleanups.push(function () { t.removeEventListener(ev, fn, o); }); },
        add: function (fn) { cleanups.push(fn); }
      };
      var destroy = function () {
        cleanups.splice(0).reverse().forEach(function (f) { try { f(); } catch (e) {} });
        delete root.__apx[key]; root.removeAttribute('data-apx-mounted');
      };
      root.__apx[key] = destroy;
      var inner = mountFn(root, opts || {}, api);
      if (typeof inner === 'function') cleanups.push(inner);
      root.setAttribute('data-apx-mounted', '');
      /* re-read tokens / motion on demand */
      api.on(root, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      api.on(W, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      return destroy;
    }
    APX[key] = APX[code] = { code: code, name: name, mount: mount };
    function auto() { D.querySelectorAll('[data-apx="' + code + '"]:not([data-apx-manual])').forEach(function (el) { mount(el); }); }
    if (!W.APX_NO_AUTOMOUNT) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto); else auto(); }
  }
  /* Scroll driver: smoothed progress of `root` through the viewport.
     mode 'pin'  = progress across a tall section's sticky run (0 at top hits top, 1 at bottom hits bottom)
     mode 'view' = progress while the element crosses the viewport (0 entering bottom, 1 leaving top)
     cb(progress, scrollVelocityPxPerSec, rawTarget) */
  function scrollDriver(root, api, cb, o) {
    o = o || {};
    var target = 0, cur = -1, raf = 0, active = false, last = 0, lastY = W.scrollY, sv = 0;
    function measure() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight;
      var mode = typeof o.mode === 'function' ? o.mode() : (o.mode || 'pin');
      if (mode === 'pin') {
        var len = r.height - vh;
        target = len > 1 ? clamp(-r.top / len, 0, 1) : clamp((vh - r.top) / (vh + r.height), 0, 1);
      } else if (mode === 'enter') {
        /* 0 when top enters bottom edge, 1 when top reaches `o.at` of viewport */
        target = clamp((vh - r.top) / (vh * (1 - (o.at || .45))), 0, 1);
      } else target = clamp((vh - r.top) / (vh + r.height), 0, 1);
    }
    function tick(now) {
      raf = 0; measure();
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      var y = W.scrollY, inst = (y - lastY) / Math.max(dt, .001); lastY = y;
      sv += (inst - sv) * .25; if (Math.abs(sv) < 2) sv = 0;
      var k = o.smooth === 0 ? 1 : 1 - Math.exp(-dt * (o.smooth || 9));
      if (cur < 0) cur = target; else cur += (target - cur) * k;
      if (Math.abs(target - cur) < .0003) cur = target;
      cb(cur, sv, target);
      if (cur !== target || sv !== 0 || o.loop) { if (active && !D.hidden) raf = requestAnimationFrame(tick); }
      else last = 0;
    }
    function kick() { if (!raf && active && !D.hidden) raf = requestAnimationFrame(tick); }
    var io = new IntersectionObserver(function (es) { active = es[es.length - 1].isIntersecting; if (active) { lastY = W.scrollY; kick(); } }, { rootMargin: '25% 0px 25% 0px' });
    io.observe(root);
    api.on(W, 'scroll', kick, { passive: true }); api.on(W, 'resize', kick); api.on(D, 'visibilitychange', kick);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { kick: kick, reset: function () { cur = -1; kick(); }, progress: function () { return cur; } };
  }
  /* Ambient loop that only runs while `el` is on screen and the tab is visible. frame(timeSec, dt) */
  function ambient(el, api, frame) {
    var raf = 0, vis = false, run = false, last = 0;
    function step(now) {
      raf = 0; if (!vis || D.hidden || !run) return;
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      frame(now / 1000, dt);
      raf = requestAnimationFrame(step);
    }
    function upd() {
      if (vis && !D.hidden && run) { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; upd(); }, { rootMargin: '10% 0px' });
    io.observe(el);
    api.on(D, 'visibilitychange', upd);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); }, visible: function () { return vis; } };
  }
  /* watch reduced-motion + breakpoint changes and re-run a setup fn */
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)');
    var h = function () { fn(); };
    if (RM.addEventListener) { RM.addEventListener('change', h); mq.addEventListener('change', h); api.add(function () { RM.removeEventListener('change', h); mq.removeEventListener('change', h); }); }
  }
  /* SCR-105 · Grid Bloom — the middle tile grows to fill the screen while the rest drift away. */
  register('SCR-105', 'Grid Bloom', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr105__stage');
    var grid = root.querySelector('.apx-scr105__grid');
    var tiles = [].slice.call(root.querySelectorAll('.apx-scr105__tile'));
    var reveal = root.querySelector('.apx-scr105__reveal');
    if (!stage || !grid || !tiles.length) return;
    var hero = root.querySelector('.apx-scr105__tile[data-hero]') || tiles[Math.floor(tiles.length / 2)];
    hero.setAttribute('data-hero', '');
    var label = hero.querySelector('.apx-scr105__label');
    var mode = 'pin', geo = null, lastP = 0;
    function measure() {
      tiles.forEach(function (t) { t.style.transform = ''; });
      var s = stage.getBoundingClientRect(), h = hero.getBoundingClientRect();
      var hcx = h.left + h.width / 2, hcy = h.top + h.height / 2;
      geo = {
        S: Math.max(s.width / h.width, s.height / h.height) * 1.04,
        dx: s.left + s.width / 2 - hcx, dy: s.top + s.height / 2 - hcy,
        v: tiles.map(function (t) { var b = t.getBoundingClientRect(); return [b.left + b.width / 2 - hcx, b.top + b.height / 2 - hcy]; })
      };
    }
    function apply(p) {
      lastP = p; if (!geo) measure();
      var e = easeIO(clamp((p - .06) / .58, 0, 1));
      tiles.forEach(function (t, i) {
        if (t === hero) {
          t.style.transform = 'translate3d(' + (geo.dx * e).toFixed(1) + 'px,' + (geo.dy * e).toFixed(1) + 'px,0) scale(' + (1 + (geo.S - 1) * e).toFixed(4) + ')';
          return;
        }
        var v = geo.v[i];
        t.style.transform = 'translate3d(' + (v[0] * e * 1.1).toFixed(1) + 'px,' + (v[1] * e * 1.1).toFixed(1) + 'px,0) scale(' + (1 - .18 * e).toFixed(4) + ')';
        t.style.opacity = (1 - clamp(e * 1.4, 0, 1)).toFixed(3);
      });
      if (label) label.style.opacity = (1 - clamp(e * 3, 0, 1)).toFixed(3);
      if (reveal) {
        var r = ease3(clamp((p - .58) / .26, 0, 1));
        reveal.style.opacity = r.toFixed(3);
        reveal.style.transform = 'translate3d(0,' + ((1 - r) * 36).toFixed(1) + 'px,0)';
        reveal.style.visibility = r > .01 ? 'visible' : 'hidden';
        reveal.classList.toggle('is-live', r > .5);
      }
    }
    var drv = scrollDriver(root, api, function (p) { if (mode === 'pin') apply(p); }, { mode: 'pin', smooth: 8 });
    var ro = new ResizeObserver(function () { if (mode === 'pin') { geo = null; apply(lastP); } }); ro.observe(stage); api.add(function () { ro.disconnect(); });
    function setup() {
      var m = motionOf(root);
      mode = m === 0 ? 'static' : isCompact() ? 'list' : 'pin';
      root.setAttribute('data-mode', mode);
      tiles.forEach(function (t) { t.style.transform = t.style.opacity = ''; });
      if (label) label.style.opacity = '';
      if (reveal) reveal.style.opacity = reveal.style.transform = reveal.style.visibility = '';
      geo = null; if (mode === 'pin') drv.reset();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
    return function () { root.removeAttribute('data-mode'); };
  });
})();

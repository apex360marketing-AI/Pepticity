/*! APEX library SCR-103 · Frame Tunnel — self-contained, token-driven. window.APX['SCR-103'].mount(root) -> destroy() */
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
  /* SCR-103 · Frame Tunnel — scroll carries the camera forward through a corridor of frames. */
  register('SCR-103', 'Frame Tunnel', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr103__stage');
    var world = root.querySelector('.apx-scr103__world');
    var frames = [].slice.call(root.querySelectorAll('.apx-scr103__frame'));
    var meter = root.querySelector('.apx-scr103__meter b');
    if (!stage || !world || !frames.length) return;
    var N = frames.length, mode = 'pin', motion = 1, P = 900, DZ = 1100;
    var bodies = frames.map(function (f) { return f.querySelector('.apx-scr103__body'); });
    function applyPin(p) {
      var q = clamp(p / .9, 0, 1);
      var cam = q * (N - 1) * DZ;
      for (var i = 0; i < N; i++) {
        var z = -i * DZ + cam, f = frames[i], op, cop;
        if (z > 0) { op = 1 - z / (P * .5); cop = 1 - z / (P * .25); }
        else { op = 1 - clamp((-z - 2.6 * DZ) / DZ, 0, 1); cop = 1 - clamp(-z / (DZ * .55), 0, 1); }
        op = clamp(op, 0, 1); cop = clamp(cop, 0, 1);
        if (op <= .001) { f.style.visibility = 'hidden'; continue; }
        f.style.visibility = '';
        f.style.transform = 'translate3d(-50%,-50%,' + z.toFixed(1) + 'px)';
        f.style.opacity = op.toFixed(3);
        if (bodies[i]) { bodies[i].style.opacity = cop.toFixed(3); bodies[i].style.transform = 'translate3d(0,' + ((1 - cop) * 24).toFixed(1) + 'px,0)'; }
        f.classList.toggle('is-near', cop > .6);
      }
      if (meter) meter.style.transform = 'scaleY(' + q.toFixed(4) + ')';
    }
    /* pointer: gentle camera sway on desktop */
    var tx = 0, ty = 0, cx = 0, cy = 0, praf = 0;
    function sway() {
      praf = 0; cx += (tx - cx) * .08; cy += (ty - cy) * .08;
      world.style.transform = 'rotateY(' + (cx * 3.5 * motion).toFixed(3) + 'deg) rotateX(' + (-cy * 2.5 * motion).toFixed(3) + 'deg)';
      if (Math.abs(tx - cx) + Math.abs(ty - cy) > .002) praf = requestAnimationFrame(sway);
    }
    api.on(stage, 'pointermove', function (e) {
      if (mode !== 'pin' || e.pointerType !== 'mouse') return;
      var r = stage.getBoundingClientRect(); tx = (e.clientX - r.left) / r.width * 2 - 1; ty = (e.clientY - r.top) / r.height * 2 - 1;
      if (!praf) praf = requestAnimationFrame(sway);
    });
    api.add(function () { if (praf) cancelAnimationFrame(praf); });
    /* keyboard: focusing the final call to action jumps to the end of the tunnel */
    api.on(root, 'focusin', function (e) {
      if (mode !== 'pin') return;
      var f = e.target.closest('.apx-scr103__frame'); if (!f) return;
      var i = frames.indexOf(f), r = root.getBoundingClientRect(), len = r.height - innerHeight;
      W.scrollTo(0, W.scrollY + r.top + len * (i / Math.max(1, N - 1)) * .9 + (i === N - 1 ? len * .1 : 0));
    });
    /* phones / static: list with simple reveal */
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) e.target.classList.add('is-in'); }); }, { threshold: .2 });
    frames.forEach(function (f) { io.observe(f); }); api.add(function () { io.disconnect(); });
    var drv = scrollDriver(root, api, function (p) { if (mode === 'pin') applyPin(p); }, { mode: 'pin', smooth: 7 });
    function setup() {
      motion = motionOf(root);
      mode = motion === 0 ? 'static' : isCompact() ? 'list' : 'pin';
      root.setAttribute('data-mode', mode);
      frames.forEach(function (f, i) { f.style.transform = f.style.opacity = f.style.visibility = ''; if (bodies[i]) bodies[i].style.opacity = bodies[i].style.transform = ''; });
      world.style.transform = '';
      if (mode === 'pin') drv.reset();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
    return function () { root.removeAttribute('data-mode'); };
  });
})();

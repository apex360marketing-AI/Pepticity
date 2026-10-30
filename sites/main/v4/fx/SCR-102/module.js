/*! APEX library SCR-102 · Fan Deck — self-contained, token-driven. window.APX['SCR-102'].mount(root) -> destroy() */
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
  /* SCR-102 · Fan Deck — a stack fans into a hand on scroll, then each card rises out in turn. */
  register('SCR-102', 'Fan Deck', function (root, opts, api) {
    var deck = root.querySelector('.apx-scr102__deck');
    var cards = [].slice.call(root.querySelectorAll('.apx-scr102__card'));
    var counter = root.querySelector('.apx-scr102__count');
    var ring = root.querySelector('.apx-scr102__ring circle:last-child');
    if (!deck || !cards.length) return;
    var n = cards.length, mode = 'pin', motion = 1;
    var jitter = cards.map(function (_, i) { return ((i * 7919) % 11 - 5) * .45; });
    var spread = parseFloat(root.getAttribute('data-spread') || '0') || Math.min(11, 56 / Math.max(1, n - 1));
    var last = -2;
    function smooth(e0, e1, x) { var t = clamp((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t); }
    function applyPin(p) {
      var open = ease3(p / .3), gate = smooth(.27, .36, p);
      var pos = clamp((p - .32) / .62, 0, 1) * (n - 1);
      var top = Math.round(pos);
      for (var i = 0; i < n; i++) {
        var lift = gate * smooth(0, 1, 1 - Math.abs(pos - i));
        var ang = (i - (n - 1) / 2) * spread * open * motion + (1 - open) * jitter[i];
        ang *= 1 - lift * .8;
        var ty = -lift * 22 - (1 - open) * i * 1.5;
        var s = 1 + lift * .07;
        var c = cards[i];
        c.style.transform = 'rotate(' + ang.toFixed(3) + 'deg) translate3d(0,' + ty.toFixed(2) + '%,0) scale(' + s.toFixed(4) + ')';
        c.style.setProperty('--apx-scr102-dim', (gate * .6 * (1 - lift)).toFixed(3));
        c.style.zIndex = i === top && gate > .5 ? n + 1 : i + 1;
        c.style.setProperty('--apx-scr102-txt', Math.min(1, smooth(.55, .95, lift) + (1 - open)).toFixed(3));
      }
      var idx = gate > .5 ? top : -1;
      if (idx !== last) {
        last = idx;
        cards.forEach(function (c, i) { c.classList.toggle('is-up', i === idx); });
        if (counter) { var a = String(Math.max(idx, 0) + 1), b = String(n); counter.textContent = (a.length < 2 ? '0' + a : a) + ' / ' + (b.length < 2 ? '0' + b : b); }
      }
      if (ring) ring.style.strokeDashoffset = (100 - p * 100).toFixed(2);
    }
    /* phones: horizontal rail, cards tilt by distance from centre */
    var rail = deck, rraf = 0;
    function railTilt() {
      rraf = 0; if (mode !== 'rail') return;
      var rr = rail.getBoundingClientRect(), cx = rr.left + rr.width / 2;
      cards.forEach(function (c) {
        var b = c.getBoundingClientRect(), d = clamp(((b.left + b.width / 2) - cx) / rr.width, -1, 1);
        c.style.transform = 'rotate(' + (d * 7 * motion).toFixed(2) + 'deg) translate3d(0,' + (Math.abs(d) * 18 * motion).toFixed(1) + 'px,0)';
        c.style.opacity = (1 - Math.abs(d) * .35).toFixed(3);
      });
    }
    api.on(rail, 'scroll', function () { if (!rraf) rraf = requestAnimationFrame(railTilt); }, { passive: true });
    api.add(function () { if (rraf) cancelAnimationFrame(rraf); });
    var drv = scrollDriver(root, api, function (p) { if (mode === 'pin') applyPin(p); }, { mode: 'pin', smooth: 8 });
    function setup() {
      motion = motionOf(root);
      mode = motion === 0 ? 'static' : isCompact() ? 'rail' : 'pin';
      root.setAttribute('data-mode', mode);
      cards.forEach(function (c) { c.style.transform = c.style.opacity = c.style.zIndex = ''; c.style.removeProperty('--apx-scr102-txt'); c.style.removeProperty('--apx-scr102-dim'); c.classList.remove('is-up'); });
      last = -2;
      if (mode === 'pin') drv.reset(); else if (mode === 'rail') railTilt();
    }
    api.retoken = setup; onEnvChange(api, setup); api.on(W, 'resize', function () { if (mode === 'rail') railTilt(); }); setup();
    return function () { root.removeAttribute('data-mode'); cards.forEach(function (c) { c.style.transform = c.style.opacity = c.style.zIndex = ''; }); };
  });
})();

/*! APEX library SCR-101 · Flipbook Scrub — self-contained, token-driven. window.APX['SCR-101'].mount(root) -> destroy() */
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
  /* SCR-101 · Flipbook Scrub — a held frame plays an image sequence forward and back with the scroll. */
  register('SCR-101', 'Flipbook Scrub', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr101__stage');
    var cv = root.querySelector('.apx-scr101__canvas');
    if (!stage || !cv) return;
    var ctx = cv.getContext('2d');
    var beats = [].slice.call(root.querySelectorAll('.apx-scr101__beats > li'));
    var countEl = root.querySelector('.apx-scr101__count');
    var bar = root.querySelector('.apx-scr101__bar');
    /* frame list: opts.frames (array of URLs or Image/canvas objects) or data-frames pattern */
    var list = opts.frames;
    if (!list) {
      var pat = root.getAttribute('data-frames') || '', n = parseInt(root.getAttribute('data-count') || '0', 10),
        st = parseInt(root.getAttribute('data-start') || '1', 10), pad = parseInt(root.getAttribute('data-pad') || '0', 10);
      list = [];
      for (var i = 0; i < n; i++) { var s = String(st + i); while (s.length < pad) s = '0' + s; list.push(pat.replace('{i}', s)); }
    }
    var N = list.length; if (!N) return;
    var imgs = new Array(N), ready = new Array(N), disposed = false;
    function load(i) {
      if (imgs[i]) return;
      var src = list[i];
      if (typeof src !== 'string') { imgs[i] = src; ready[i] = true; return; }
      var im = new Image(); im.decoding = 'async'; imgs[i] = im;
      im.onload = function () { if (disposed) return; ready[i] = true; if (Math.abs(i - want) < 3 || !drawn) draw(); };
      im.src = src;
    }
    /* progressive: every 8th frame first so scrubbing works immediately, then fill the gaps */
    var order = []; [8, 4, 2, 1].forEach(function (step) { for (var i = 0; i < N; i += step) if (order.indexOf(i) < 0) order.push(i); });
    if (order.indexOf(N - 1) < 0) order.splice(1, 0, N - 1);
    var oi = 0, lt = 0;
    function pump() { if (disposed) return; var k = 0; while (oi < order.length && k++ < 6) load(order[oi++]); if (oi < order.length) lt = setTimeout(pump, 60); }
    var lio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { pump(); lio.disconnect(); } }, { rootMargin: '150% 0px' });
    lio.observe(root);
    api.add(function () { disposed = true; clearTimeout(lt); lio.disconnect(); });

    var fit = root.getAttribute('data-fit') || 'contain', want = 0, shown = -1, drawn = false;
    function nearest(i) { for (var d = 0; d < N; d++) { if (ready[i - d]) return i - d; if (ready[i + d]) return i + d; } return -1; }
    function draw() {
      var j = nearest(want); if (j < 0) return;
      var im = imgs[j], iw = im.naturalWidth || im.width, ih = im.naturalHeight || im.height; if (!iw) return;
      var w = cv.width, h = cv.height, s = fit === 'cover' ? Math.max(w / iw, h / ih) : Math.min(w / iw, h / ih);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(im, (w - iw * s) / 2, (h - ih * s) / 2, iw * s, ih * s);
      shown = j; drawn = true;
    }
    function size() {
      var r = cv.getBoundingClientRect(), d = Math.min(W.devicePixelRatio || 1, 2);
      cv.width = Math.max(2, Math.round(r.width * d)); cv.height = Math.max(2, Math.round(r.height * d)); drawn = false; draw();
    }
    var ro = new ResizeObserver(size); ro.observe(cv); api.add(function () { ro.disconnect(); });

    var ranges = beats.map(function (li, i) {
      var a = (li.getAttribute('data-at') || '').split('-').map(parseFloat);
      return a.length === 2 && isFinite(a[0]) ? a : [i / beats.length, (i + 1) / beats.length];
    });
    var still = parseFloat(root.getAttribute('data-still') || '1');
    var mode = 'pin', active = -1;
    function apply(p) {
      want = clamp(Math.round(p * (N - 1)), 0, N - 1);
      if (want !== shown) draw();
      if (countEl) { var s = String(want + 1), t = String(N); while (s.length < t.length) s = '0' + s; countEl.textContent = s + ' / ' + t; }
      if (bar) bar.style.transform = 'scaleX(' + p.toFixed(4) + ')';
      if (mode !== 'pin') return;
      var a = -1; ranges.forEach(function (r, i) { if (p >= r[0] && p < r[1] + (i === ranges.length - 1 ? .01 : 0)) a = i; });
      if (a !== active) { beats.forEach(function (li, i) { li.classList.toggle('is-on', i === a); }); active = a; }
    }
    var drv = scrollDriver(root, api, function (p) { if (root.classList.contains('is-static')) return; apply(p); }, { mode: function () { return mode; }, smooth: 10 });
    function setup() {
      var m = motionOf(root);
      root.classList.toggle('is-static', m === 0);
      mode = isCompact() ? 'view' : 'pin';
      root.classList.toggle('is-compact', mode === 'view');
      beats.forEach(function (li) { li.classList.remove('is-on'); }); active = -1;
      if (m === 0) { want = Math.round(clamp(still, 0, 1) * (N - 1)); draw(); if (countEl) countEl.textContent = ''; }
      else drv.reset();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
    return function () { root.classList.remove('is-static', 'is-compact'); };
  });
})();

/*! APEX library BGD-102 · Plexus Field — self-contained, token-driven. window.APX['BGD-102'].mount(root) -> destroy() */
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
  /* BGD-102 · Plexus Field — drifting points link up with fine lines; they gather and light up near the pointer,
     and a tap or click sends a ripple through them. */
  register('BGD-102', 'Plexus Field', function (root, opts, api) {
    var cv = D.createElement('canvas'); cv.setAttribute('aria-hidden', 'true'); root.appendChild(cv);
    api.add(function () { cv.remove(); });
    var ctx = cv.getContext('2d'); if (!ctx) return;
    var w = 0, h = 0, dpr = 1, pts = [], motion = 1, ink = [1, 1, 1], acc = [1, 1, 1], light = false;
    var mx = -1e4, my = -1e4, mOn = 0, mOnT = 0, waves = [], lastY = W.scrollY, svel = 0;
    var LINK = 118;
    function rgb(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + a.toFixed(3) + ')'; }
    function tokens() { ink = rgba(tok(root, '--apx-ink', '#ecebe8')); acc = rgba(tok(root, '--apx-accent', '#cfd3da')); light = lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5; }
    function seed() {
      var area = w * h, n = Math.round(clamp(area / 13000, 28, isCompact() ? 60 : 150));
      pts = [];
      for (var i = 0; i < n; i++) pts.push({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * 12, vy: (Math.random() - .5) * 12, z: .4 + Math.random() * .6, hot: Math.random() < .1, ph: Math.random() * 6.28, ox: 0, oy: 0 });
    }
    function size() {
      var r = root.getBoundingClientRect(); dpr = Math.min(W.devicePixelRatio || 1, 2);
      var nw = Math.max(1, Math.round(r.width)), nh = Math.max(1, Math.round(r.height));
      var changed = Math.abs(nw - w) > 40 || Math.abs(nh - h) > 40 || !pts.length;
      w = nw; h = nh; cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
      if (changed) seed();
    }
    function frame(t, dt) {
      mOn += (mOnT - mOn) * (1 - Math.exp(-dt * 4));
      svel *= Math.exp(-dt * 3);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      var i, j, p, q, n = pts.length;
      for (i = 0; i < n; i++) {
        p = pts[i];
        p.x += p.vx * dt * motion; p.y += (p.vy - svel * .06 * p.z) * dt * motion;
        if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20; else if (p.y > h + 20) p.y = -20;
        /* pointer gathering */
        var tx = 0, ty = 0, dx = mx - p.x, dy = my - p.y, d2 = dx * dx + dy * dy;
        if (mOn > .01 && d2 < 200 * 200) { var d = Math.sqrt(d2) || 1, f = (1 - d / 200) * 26 * mOn * motion; tx = dx / d * f; ty = dy / d * f; }
        for (var k = 0; k < waves.length; k++) {
          var wv = waves[k], ex = p.x - wv.x, ey = p.y - wv.y, ed = Math.sqrt(ex * ex + ey * ey) || 1, band = Math.exp(-Math.pow((ed - wv.r) / 40, 2)) * wv.a;
          tx += ex / ed * band * 26; ty += ey / ed * band * 26;
        }
        p.ox += (tx - p.ox) * .12; p.oy += (ty - p.oy) * .12;
        p.px = p.x + p.ox; p.py = p.y + p.oy;
      }
      /* links: bucket grid keeps this close to O(n) */
      var cell = LINK, cols = Math.ceil(w / cell) + 2, grid = {};
      for (i = 0; i < n; i++) { p = pts[i]; var key = (Math.floor(p.py / cell) + 1) * cols + Math.floor(p.px / cell) + 1; (grid[key] || (grid[key] = [])).push(i); }
      ctx.lineWidth = 1;
      var baseA = light ? .16 : .13;
      for (i = 0; i < n; i++) {
        p = pts[i];
        var gx = Math.floor(p.px / cell) + 1, gy = Math.floor(p.py / cell) + 1;
        for (var oy = -1; oy <= 1; oy++) for (var ox = -1; ox <= 1; ox++) {
          var b = grid[(gy + oy) * cols + gx + ox]; if (!b) continue;
          for (j = 0; j < b.length; j++) {
            if (b[j] <= i) continue; q = pts[b[j]];
            var lx = p.px - q.px, ly = p.py - q.py, l2 = lx * lx + ly * ly; if (l2 > LINK * LINK) continue;
            var a = (1 - Math.sqrt(l2) / LINK) * baseA * Math.min(p.z, q.z);
            var near = 0; if (mOn > .01) { var cx = (p.px + q.px) / 2 - mx, cy = (p.py + q.py) / 2 - my; near = Math.exp(-(cx * cx + cy * cy) / (2 * 110 * 110)) * mOn; }
            ctx.strokeStyle = near > .05 ? rgb(acc, Math.min(.9, a + near * .55)) : rgb(ink, a);
            ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(q.px, q.py); ctx.stroke();
          }
        }
      }
      for (i = 0; i < n; i++) {
        p = pts[i];
        var r = p.z * 1.6, al = (light ? .45 : .5) * p.z;
        if (p.hot) { al = .55 + .4 * Math.sin(t * 1.6 + p.ph) * motion; ctx.fillStyle = rgb(acc, Math.max(.2, al)); r += .6; }
        else ctx.fillStyle = rgb(ink, al);
        ctx.beginPath(); ctx.arc(p.px, p.py, r, 0, 6.2832); ctx.fill();
      }
      for (i = waves.length - 1; i >= 0; i--) { waves[i].r += 420 * dt; waves[i].a *= Math.exp(-dt * 1.6); if (waves[i].a < .02) waves.splice(i, 1); }
    }
    var loop = ambient(root, api, frame);
    var host = root.parentElement || root;
    api.on(W, 'pointermove', function (e) { var r = root.getBoundingClientRect(); mx = e.clientX - r.left; my = e.clientY - r.top; mOnT = (mx >= 0 && my >= 0 && mx <= r.width && my <= r.height && e.pointerType === 'mouse') ? 1 : 0; }, { passive: true });
    api.on(host, 'pointerdown', function (e) { if (!motion) return; var r = root.getBoundingClientRect(); waves.push({ x: e.clientX - r.left, y: e.clientY - r.top, r: 0, a: 1 }); if (waves.length > 4) waves.shift(); });
    api.on(W, 'scroll', function () { var y = W.scrollY; svel = clamp(svel + (y - lastY) * 4, -900, 900); lastY = y; }, { passive: true });
    var ro = new ResizeObserver(function () { size(); if (!motion) frame(0, 0); }); ro.observe(root); api.add(function () { ro.disconnect(); });
    function setup() { motion = motionOf(root); tokens(); size(); frame(0, .016); if (motion > 0) loop.start(); else loop.stop(); }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

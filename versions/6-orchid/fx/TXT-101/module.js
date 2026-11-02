/*! APEX library TXT-101 · Orbit Caption — self-contained, token-driven. window.APX['TXT-101'].mount(root) -> destroy() */
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
  /* TXT-101 · Orbit Caption — text circles a round button; scroll speeds it up and reverses it, pointing slows it. */
  var uid = 0;
  register('TXT-101', 'Orbit Caption', function (root, opts, api) {
    var text = (opts.text || root.getAttribute('data-text') || 'Verified leads · Sent to your phone · ').trim();
    if (!/[·•|]\s*$/.test(text)) text += ' · ';
    text = text.replace(/\s+$/, '') + ' ';
    var id = 'apx-txt101-p' + (++uid);
    var R = 80, C = 2 * Math.PI * R;
    var ring = D.createElement('span'); ring.className = 'apx-txt101__ring'; ring.setAttribute('aria-hidden', 'true');
    ring.innerHTML = '<svg viewBox="0 0 200 200" focusable="false"><defs><path id="' + id + '" d="M100,100 m-' + R + ',0 a' + R + ',' + R + ' 0 1,1 ' + 2 * R + ',0 a' + R + ',' + R + ' 0 1,1 -' + 2 * R + ',0"/></defs>' +
      '<text><textPath href="#' + id + '" textLength="' + (C - 6).toFixed(1) + '" lengthAdjust="spacing"></textPath></text></svg>';
    ring.querySelector('textPath').textContent = text.toUpperCase();
    var core = root.querySelector('.apx-txt101__core');
    if (!core) {
      core = D.createElement('span'); core.className = 'apx-txt101__core';
      while (root.firstChild) core.appendChild(root.firstChild);
      root.appendChild(core); api.add(function () { while (core.firstChild) root.insertBefore(core.firstChild, core); core.remove(); });
    }
    var arrow = D.createElement('span'); arrow.className = 'apx-txt101__arrow'; arrow.setAttribute('aria-hidden', 'true');
    arrow.innerHTML = '<svg viewBox="0 0 24 24" focusable="false"><path d="M12 4v15M5.5 12.5 12 19l6.5-6.5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    core.insertBefore(arrow, core.firstChild);
    root.insertBefore(ring, root.firstChild);
    api.add(function () { ring.remove(); arrow.remove(); });

    var angle = 0, dir = 1, slow = 1, slowT = 1, arrowA = 0, motion = 1, lastY = W.scrollY, vel = 0;
    api.on(W, 'scroll', function () { var y = W.scrollY, d = y - lastY; if (d) { dir = d > 0 ? 1 : -1; vel = Math.min(2400, vel + Math.abs(d) * 6); } lastY = y; }, { passive: true });
    api.on(root, 'pointerenter', function () { slowT = .12; });
    api.on(root, 'pointerleave', function () { slowT = 1; });
    api.on(root, 'focusin', function () { slowT = .12; });
    api.on(root, 'focusout', function () { slowT = 1; });
    var loop = ambient(root, api, function (t, dt) {
      vel *= Math.exp(-dt * 3.2);
      slow += (slowT - slow) * (1 - Math.exp(-dt * 6));
      var speed = (14 + Math.min(vel * .14, 260)) * slow * motion;
      angle = (angle + speed * dir * dt) % 360;
      ring.style.transform = 'rotate(' + angle.toFixed(2) + 'deg)';
      var at = dir > 0 ? 0 : 180; arrowA += (at - arrowA) * (1 - Math.exp(-dt * 7));
      arrow.style.transform = 'rotate(' + arrowA.toFixed(2) + 'deg)';
    });
    function setup() { motion = motionOf(root); if (motion > 0) loop.start(); else { loop.stop(); ring.style.transform = arrow.style.transform = ''; } }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

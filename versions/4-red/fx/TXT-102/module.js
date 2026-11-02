/*! APEX library TXT-102 · Throttle Marquee — self-contained, token-driven. window.APX['TXT-102'].mount(root) -> destroy() */
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
  /* TXT-102 · Throttle Marquee — giant rows glide; scroll speed throttles them up and flips direction,
     outlined rows fill in as they race. */
  register('TXT-102', 'Throttle Marquee', function (root, opts, api) {
    var rowsEl = [].slice.call(root.querySelectorAll('.apx-txt102__row'));
    if (!rowsEl.length) return;
    var rows = rowsEl.map(function (row, ri) {
      var original = row.innerHTML, label = row.textContent.replace(/\s+/g, ' ').trim();
      var items = label.split(/\s*[·|•]\s*/).filter(Boolean);
      var seqHTML = items.map(function (t) { return '<span class="apx-txt102__item">' + t.replace(/[&<>]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]; }) + '</span><i class="apx-txt102__sep"></i>'; }).join('');
      var outline = row.getAttribute('data-style') === 'outline';
      row.innerHTML = '<span class="sr-only">' + items.join(', ') + '</span>';
      function track(extra) {
        var t = D.createElement('span'); t.className = 'apx-txt102__track' + (extra || ''); t.setAttribute('aria-hidden', 'true');
        t.innerHTML = '<span class="apx-txt102__seq">' + seqHTML + '</span>'; row.appendChild(t); return t;
      }
      var tracks = [track(outline ? ' is-outline' : '')];
      if (outline) tracks.push(track(' is-fill'));
      return {
        el: row, original: original, tracks: tracks, outline: outline, w: 0, x: Math.random() * 400,
        dir: parseFloat(row.getAttribute('data-dir') || (ri % 2 ? '-1' : '1')) || 1, slow: 1, slowT: 1, heat: 0
      };
    });
    api.add(function () { rows.forEach(function (r) { r.el.innerHTML = r.original; }); });
    function measure() {
      rows.forEach(function (r) {
        r.tracks.forEach(function (t) { while (t.children.length > 1) t.lastChild.remove(); });
        var seq = r.tracks[0].firstChild; r.w = seq.getBoundingClientRect().width || 1;
        var copies = Math.ceil((r.el.getBoundingClientRect().width || W.innerWidth) / r.w) + 1;
        r.tracks.forEach(function (t) { for (var i = 1; i < copies; i++) t.appendChild(t.firstChild.cloneNode(true)); });
      });
    }
    rows.forEach(function (r) {
      api.on(r.el, 'pointerenter', function () { r.slowT = .22; });
      api.on(r.el, 'pointerleave', function () { r.slowT = 1; });
    });
    var sdir = 1, vel = 0, lastY = W.scrollY, motion = 1;
    api.on(W, 'scroll', function () { var y = W.scrollY, d = y - lastY; if (d) { sdir = d > 0 ? 1 : -1; vel = Math.min(5000, vel + Math.abs(d) * 9); } lastY = y; }, { passive: true });
    function render() {
      rows.forEach(function (r) {
        var x = -(((r.x % r.w) + r.w) % r.w);
        r.tracks.forEach(function (t) { t.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; });
        if (r.outline) r.tracks[1].style.opacity = r.heat.toFixed(3);
      });
    }
    var loop = ambient(root, api, function (t, dt) {
      vel *= Math.exp(-dt * 2.6);
      var base = (isCompact() ? 34 : 56) * motion;
      var boost = Math.min(vel / 90, 16);
      rows.forEach(function (r) {
        r.slow += (r.slowT - r.slow) * (1 - Math.exp(-dt * 5));
        r.x += base * (1 + boost) * r.dir * sdir * r.slow * dt;
        var heatT = clamp((vel - 250) / 1800, 0, 1);
        r.heat += (heatT - r.heat) * (1 - Math.exp(-dt * (heatT > r.heat ? 8 : 2.5)));
      });
      render();
    });
    var fontsReady = D.fonts && D.fonts.ready ? D.fonts.ready : Promise.resolve();
    var ro = new ResizeObserver(function () { measure(); render(); }); ro.observe(root); api.add(function () { ro.disconnect(); });
    fontsReady.then(function () { if (root.__apx && root.__apx.TXT102) { measure(); render(); } });
    function setup() {
      motion = motionOf(root); root.classList.toggle('is-static', motion === 0);
      measure(); render();
      if (motion > 0) loop.start(); else { loop.stop(); rows.forEach(function (r) { r.tracks.forEach(function (t) { t.style.transform = ''; }); }); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
    return function () { root.classList.remove('is-static'); };
  });
})();

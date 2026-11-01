/*! APEX library TXT-104 · Scatter Assemble — self-contained, token-driven. window.APX['TXT-104'].mount(root) -> destroy() */
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
  /* TXT-104 · Scatter Assemble — letters start scattered and tumbling, fly together as the headline
     scrolls up, and shy away from the pointer once assembled. */
  register('TXT-104', 'Scatter Assemble', function (root, opts, api) {
    var html = root.innerHTML, label = root.textContent.replace(/\s+/g, ' ').trim();
    var chars = [], seed = 7;
    function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
    function build(node, out) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (part) {
            if (!part) return;
            if (/^\s+$/.test(part)) { out.appendChild(D.createTextNode(' ')); return; }
            var w = D.createElement('span'); w.className = 'apx-txt104__word';
            Array.from(part).forEach(function (ch) {
              var c = D.createElement('span'); c.className = 'apx-txt104__ch'; c.textContent = ch; w.appendChild(c);
              chars.push({ el: c, dx: (rnd() * 2 - 1), dy: (rnd() * 2 - 1), rot: (rnd() * 2 - 1) * 160, d: rnd() * .35, px: 0, py: 0, ox: 0, oy: 0 });
            });
            out.appendChild(w);
          });
        } else if (n.nodeType === 1) {
          var copy = n.cloneNode(false); out.appendChild(copy); build(n, copy);
        }
      });
    }
    var vis = D.createElement('span'); vis.className = 'apx-txt104__vis'; vis.setAttribute('aria-hidden', 'true');
    build(root, vis);
    root.innerHTML = '<span class="sr-only apx-txt104__sr"></span>';
    root.firstChild.textContent = label; root.appendChild(vis);
    api.add(function () { root.innerHTML = html; });
    var prog = 0, motion = 1, spreadX = 1, spreadY = 1;
    function sizes() { var r = root.getBoundingClientRect(); spreadX = Math.min(W.innerWidth * .45, r.width * .6); spreadY = Math.min(W.innerHeight * .35, 260); if (isCompact()) { spreadX *= .55; spreadY *= .6; } }
    function centres() {
      var vw = D.documentElement.clientWidth;
      chars.forEach(function (c) {
        c.el.style.transform = ''; var b = c.el.getBoundingClientRect();
        c.cx = b.left + b.width / 2 + W.scrollX; c.cy = b.top + b.height / 2 + W.scrollY;
        /* keep scattered letters inside the viewport so they never widen the page */
        c.minX = 8 - b.left; c.maxX = vw - 8 - b.right;
      });
    }
    function apply() {
      for (var i = 0; i < chars.length; i++) {
        var c = chars[i];
        var e = ease3(clamp((prog - c.d) / (1 - .35), 0, 1)), k = 1 - e;
        var x = clamp(c.dx * spreadX * k * motion, Math.min(0, c.minX), Math.max(0, c.maxX)) + c.ox, y = c.dy * spreadY * k * motion + c.oy;
        c.el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + (c.rot * k * motion).toFixed(1) + 'deg)';
        c.el.style.opacity = (.12 + .88 * e).toFixed(3);
      }
    }
    /* pointer repel, only once assembled */
    var mx = -1e4, my = -1e4, praf = 0;
    function repel() {
      praf = 0; var moving = false;
      chars.forEach(function (c) {
        var tx = 0, ty = 0;
        if (prog > .98) {
          var dx = c.cx - (mx + W.scrollX), dy = c.cy - (my + W.scrollY), d2 = dx * dx + dy * dy, R = 120;
          if (d2 < R * R) { var d = Math.sqrt(d2) || 1, f = (1 - d / R) * 22 * motion; tx = dx / d * f; ty = dy / d * f; }
        }
        c.ox += (tx - c.ox) * .2; c.oy += (ty - c.oy) * .2;
        if (Math.abs(tx - c.ox) + Math.abs(ty - c.oy) > .1) moving = true;
      });
      apply(); if (moving) praf = requestAnimationFrame(repel);
    }
    api.on(root, 'pointermove', function (e) { if (e.pointerType !== 'mouse') return; mx = e.clientX; my = e.clientY; if (!praf) praf = requestAnimationFrame(repel); });
    api.on(root, 'pointerleave', function () { mx = my = -1e4; if (!praf) praf = requestAnimationFrame(repel); });
    api.add(function () { if (praf) cancelAnimationFrame(praf); });
    var drv = scrollDriver(root, api, function (p) { prog = p; apply(); }, { mode: 'enter', at: .5, smooth: 7 });
    function setup() {
      motion = motionOf(root); sizes();
      chars.forEach(function (c) { c.ox = c.oy = 0; });
      centres();
      if (motion === 0) { prog = 1; chars.forEach(function (c) { c.el.style.transform = c.el.style.opacity = ''; }); }
      else drv.reset();
    }
    api.on(W, 'resize', function () { sizes(); centres(); apply(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (root.__apx && root.__apx.TXT104) { centres(); apply(); } });
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

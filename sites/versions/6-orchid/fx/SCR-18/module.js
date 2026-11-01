/*! APEX library SCR-18 · Card Stack — self-contained, token-driven. window.APX['SCR-18'].mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX core (inlined per module; no globals besides window.APX) ---- */
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function tok(el, n, fb) { var v = getComputedStyle(el).getPropertyValue(n).trim(); return v || fb; }
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(tok(el, '--apx-motion', '1'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
  function isCompact() { return W.matchMedia('(max-width: 899px)').matches; }
  var _cx;
  /* any CSS colour -> [r,g,b,a] in 0..1 */
  function rgba(str, fb) {
    if (!_cx) { var c = D.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = fb || '#000'; _cx.fillStyle = str || fb || '#000';
    _cx.fillRect(0, 0, 1, 1); var d = _cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function css(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
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
      api.on(root, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      api.on(W, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      return destroy;
    }
    APX[key] = APX[code] = { code: code, name: name, mount: mount };
    function auto() { D.querySelectorAll('[data-apx="' + code + '"]:not([data-apx-manual])').forEach(function (el) { mount(el); }); }
    if (!W.APX_NO_AUTOMOUNT) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto); else auto(); }
  }
  /* Ambient loop that only runs while `el` is on screen and the tab is visible. frame(timeSec, dt) */
  function ambient(el, api, frame, onVis) {
    var raf = 0, vis = false, run = false, last = 0;
    function step(now) {
      raf = 0; if (!vis || D.hidden || !run) return;
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      frame(now / 1000, dt);
      raf = requestAnimationFrame(step);
    }
    function upd() {
      if (onVis) onVis(vis && !D.hidden && run);
      if (vis && !D.hidden && run) { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; upd(); }, { rootMargin: '10% 0px' });
    io.observe(el);
    api.on(D, 'visibilitychange', upd);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); }, visible: function () { return vis; } };
  }
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)');
    var h = function () { fn(); };
    if (RM.addEventListener) { RM.addEventListener('change', h); mq.addEventListener('change', h); api.add(function () { RM.removeEventListener('change', h); mq.removeEventListener('change', h); }); }
  }
  function e2(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  /* SCR-18 · Card Stack — each step card slides up over the last, which sinks back, shrinks and dims into a neat stack. */
  register('SCR-18', 'Card Stack', function (root, opts, api) {
    var list = root.querySelector('.apx-scr18__stack');
    if (!list) return;
    var cards = [].slice.call(list.querySelectorAll(':scope > .apx-scr18__card'));
    if (!cards.length) return;
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var depth = clamp(parseFloat(opt('depth', 'data-depth', '.1')) || .1, 0, .3);
    var dim = clamp(parseFloat(opt('dim', 'data-dim', '.55')), 0, .9);
    var showIdx = opt('index', 'data-index', 'on') !== 'off';

    /* ---- DOM: wrap each card's content in a clipped glass panel with sheen, shade and a big outline number ---- */
    var parts = cards.map(function (li, i) {
      var inn = D.createElement('div'); inn.className = 'apx-scr18__in';
      while (li.firstChild) inn.appendChild(li.firstChild);
      var sheen = D.createElement('i'); sheen.className = 'apx-scr18__sheen'; sheen.setAttribute('aria-hidden', 'true');
      var shade = D.createElement('i'); shade.className = 'apx-scr18__shade'; shade.setAttribute('aria-hidden', 'true');
      inn.appendChild(sheen); inn.appendChild(shade); li.appendChild(inn);
      li.style.setProperty('--i', i);
      var vis = inn.querySelector('.apx-scr18__vis'), idx = null;
      if (vis && showIdx) { idx = D.createElement('span'); idx.className = 'apx-scr18__idx'; idx.setAttribute('aria-hidden', 'true'); idx.textContent = (i < 9 ? '0' : '') + (i + 1); vis.appendChild(idx); }
      return { li: li, inn: inn, sheen: sheen, shade: shade, idx: idx, vis: vis, s: -1, o: -1, inState: null };
    });
    api.add(function () {
      parts.forEach(function (p) {
        p.sheen.remove(); p.shade.remove(); if (p.idx) p.idx.remove();
        while (p.inn.firstChild) p.li.insertBefore(p.inn.firstChild, p.inn);
        p.shade.remove(); p.inn.remove();
        p.li.classList.remove('is-in', 'is-hover'); p.li.style.removeProperty('--i'); p.li.style.transform = '';
      });
      root.classList.remove('is-static', 'is-compact', 'is-light', 'is-live');
    });

    function readTokens() { root.classList.toggle('is-light', lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5); }

    /* ---- scroll choreography ---- */
    var state = { motion: 1, stat: false, sm: [] };
    function frame(now, dt) {
      var vh = W.innerHeight, k = dt ? 1 - Math.exp(-dt * 12) : 1;
      var rects = parts.map(function (p) { return p.li.getBoundingClientRect(); });
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], q = 0;
        if (i < parts.length - 1) {
          /* the next card travels from the bottom of the screen up to 20% from the top */
          var nt = rects[i + 1].top; q = e2((vh - nt) / (vh * .8));
        }
        var cur = state.sm[i] === undefined ? q : state.sm[i] + (q - state.sm[i]) * k;
        if (Math.abs(cur - q) < .0005) cur = q; state.sm[i] = cur;
        var target = 1 - depth + i * .012 * (depth / .1), s = 1 - cur * (1 - Math.min(1, target)), o = cur * dim;
        if (Math.abs(s - p.s) > .0003) { p.s = s; p.li.style.transform = s > .9999 ? '' : 'scale(' + s.toFixed(4) + ')'; }
        if (Math.abs(o - p.o) > .002) { p.o = o; p.shade.style.opacity = o.toFixed(3); }
        var isIn = rects[i].top < vh * .75;
        if (isIn !== p.inState) { p.inState = isIn; p.li.classList.toggle('is-in', isIn); }
      }
    }
    var loop = ambient(root, api, frame, function (on) { root.classList.toggle('is-live', on && !state.stat); });

    /* ---- hover: a soft light follows the pointer and the picture leans toward it ---- */
    var hoverOK = W.matchMedia('(hover: hover)');
    parts.forEach(function (p) {
      api.on(p.inn, 'pointermove', function (e) {
        if (e.pointerType === 'touch' || !hoverOK.matches) return;
        var r = p.inn.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        p.inn.style.setProperty('--mx', (x * 100).toFixed(1) + '%'); p.inn.style.setProperty('--my', (y * 100).toFixed(1) + '%');
        if (!state.stat && p.vis) { p.inn.style.setProperty('--px', ((x - .5) * 14).toFixed(1) + 'px'); p.inn.style.setProperty('--py', ((y - .5) * 10).toFixed(1) + 'px'); }
        p.li.classList.add('is-hover');
      });
      api.on(p.inn, 'pointerleave', function () { p.li.classList.remove('is-hover'); });
    });

    function setup() {
      var m = motionOf(root);
      state.motion = m; state.stat = m === 0; state.sm = [];
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-compact', isCompact());
      readTokens();
      parts.forEach(function (p) { p.s = -1; p.o = -1; p.inState = null; });
      if (state.stat) {
        loop.stop(); root.classList.remove('is-live');
        parts.forEach(function (p) { p.li.style.transform = ''; p.shade.style.opacity = ''; p.li.classList.add('is-in'); });
      } else { frame(0, 0); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

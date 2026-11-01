/*! APEX library SCR-17 · Word Portal — self-contained, token-driven. window.APX['SCR-17'].mount(root) -> destroy() */
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
  function e3in(x) { x = clamp(x, 0, 1); return x * x * x; }

  /* SCR-17 · Word Portal — scrolling flies the camera into one huge word and straight through a letter into the scene behind it. */
  register('SCR-17', 'Word Portal', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr17__stage');
    if (!stage) return;
    var scene = root.querySelector('.apx-scr17__scene'), inner = root.querySelector('.apx-scr17__inner'), cue = root.querySelector('.apx-scr17__cue');
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var WORD = String(opt('word', 'data-word', 'EXCLUSIVE')).toUpperCase().trim() || 'EXCLUSIVE';
    var throughAttr = opt('through', 'data-through', '');
    var weight = opt('weight', 'data-weight', '800');

    /* screen-reader copy of the word; canvas is decorative */
    var sr = D.createElement('span'); sr.className = 'apx-scr17__sr'; sr.textContent = WORD;
    stage.insertBefore(sr, stage.firstChild);
    var cv = D.createElement('canvas'); cv.className = 'apx-scr17__mask'; cv.setAttribute('aria-hidden', 'true');
    stage.insertBefore(cv, cue || null);
    var g = cv.getContext('2d');
    api.add(function () {
      cv.remove(); sr.remove();
      if (inner) inner.style.cssText = ''; if (cue) cue.style.cssText = '';
      root.classList.remove('is-static', 'is-compact', 'is-light', 'is-live');
    });

    var C = {}, geo = null, view = { w: 2, h: 2, dpr: 1 };
    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), ink = rgba(tok(root, '--apx-ink', '#ecebe8')), mu = rgba(tok(root, '--apx-muted', '#9d9ca3')), acc = rgba(tok(root, '--apx-accent', '#cfd3da'));
      var light = lum(bg) > .5;
      C = { bg: bg, ink: ink, mu: mu, acc: acc, light: light,
        mask: light ? mix3(bg, [1, 1, 1], .18) : mix3(bg, [0, 0, 0], .55),
        font: tok(root, '--apx-font-display', 'system-ui, sans-serif') };
      root.classList.toggle('is-light', light);
    }
    function setFont(ctx, px) { ctx.font = weight + ' ' + px + 'px ' + C.font; if ('letterSpacing' in ctx) ctx.letterSpacing = (-0.035 * px).toFixed(2) + 'px'; }

    /* find the thickest point of one letter: that is where the camera passes through */
    function measure() {
      var F0 = 220, oc = D.createElement('canvas'), o = oc.getContext('2d', { willReadFrequently: true });
      setFont(o, F0);
      var full = o.measureText(WORD), wW = full.width;
      var idx = parseInt(throughAttr, 10);
      if (!isFinite(idx)) {
        /* default: the letter nearest the middle that has a closed or thick stroke */
        var mid = Math.floor(WORD.length / 2), best = -1, bs = -1;
        for (var i = 0; i < WORD.length; i++) { if (WORD[i] === ' ') continue; var s = 1 - Math.abs(i - mid) / WORD.length + ('OUDQBGMNHW'.indexOf(WORD[i]) >= 0 ? .25 : 0); if (s > bs) { bs = s; best = i; } }
        idx = best < 0 ? 0 : best;
      }
      idx = clamp(idx, 0, WORD.length - 1);
      var x0 = o.measureText(WORD.slice(0, idx)).width, lw = o.measureText(WORD[idx]).width;
      var pad = 8, cw = Math.ceil(lw + pad * 2), ch = Math.ceil(F0 * 1.3);
      oc.width = cw; oc.height = ch; setFont(o, F0); o.fillStyle = '#000'; o.textBaseline = 'alphabetic'; o.fillText(WORD[idx], pad, F0);
      var data = o.getImageData(0, 0, cw, ch).data, n = cw * ch, dist = new Float32Array(n), BIG = 1e6;
      for (var p = 0; p < n; p++) dist[p] = data[p * 4 + 3] > 127 ? BIG : 0;
      /* chamfer distance transform (two passes) */
      var a = 1, b = 1.4142;
      for (var y = 0; y < ch; y++) for (var x = 0; x < cw; x++) {
        var k = y * cw + x; if (!dist[k]) continue;
        var m = dist[k];
        if (x > 0) m = Math.min(m, dist[k - 1] + a); else m = Math.min(m, a);
        if (y > 0) { m = Math.min(m, dist[k - cw] + a); if (x > 0) m = Math.min(m, dist[k - cw - 1] + b); if (x < cw - 1) m = Math.min(m, dist[k - cw + 1] + b); } else m = Math.min(m, a);
        dist[k] = m;
      }
      var bx = 0, by = 0, bd = 0;
      for (var y2 = ch - 1; y2 >= 0; y2--) for (var x2 = cw - 1; x2 >= 0; x2--) {
        var k2 = y2 * cw + x2; if (!dist[k2]) continue;
        var m2 = dist[k2];
        if (x2 < cw - 1) m2 = Math.min(m2, dist[k2 + 1] + a); else m2 = Math.min(m2, a);
        if (y2 < ch - 1) { m2 = Math.min(m2, dist[k2 + cw] + a); if (x2 < cw - 1) m2 = Math.min(m2, dist[k2 + cw + 1] + b); if (x2 > 0) m2 = Math.min(m2, dist[k2 + cw - 1] + b); } else m2 = Math.min(m2, a);
        dist[k2] = m2;
        if (m2 > bd) { bd = m2; bx = x2; by = y2; }
      }
      var asc = full.actualBoundingBoxAscent || F0 * .72, desc = full.actualBoundingBoxDescent || 0;
      setFont(o, F0);
      var lx = [], lws = [];
      for (var li = 0; li < WORD.length; li++) { lx.push(o.measureText(WORD.slice(0, li)).width); lws.push(o.measureText(WORD[li]).width); }
      geo = { F0: F0, w: wW, asc: asc, desc: desc, tx: x0 + bx - pad, ty: by - F0, r: Math.max(2, bd), idx: idx, lx: lx, lw: lws };
    }

    function size() {
      var r = stage.getBoundingClientRect();
      var dpr = Math.min(W.devicePixelRatio || 1, isCompact() ? 1.5 : 2);
      var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      view.w = w; view.h = h; view.dpr = dpr; view.cssW = r.width; view.cssH = r.height;
    }

    /* ---- draw the mask at journey p (0..1) ---- */
    var ptr = { x: 0, y: 0, sx: 0, sy: 0 };
    function draw(p, now, motion) {
      if (!geo) return;
      var w = view.w, h = view.h, dpr = view.dpr;
      var Fs = Math.min(w * (w < h ? .93 : .86) / geo.w * geo.F0, h * .36 / geo.asc * geo.F0), k = Fs / geo.F0;
      var x0 = (w - geo.w * k) / 2, y0 = h / 2 + (geo.asc - geo.desc) * k / 2;
      var Tx = x0 + geo.tx * k, Ty = y0 + geo.ty * k, rr = geo.r * k;
      /* phases: word settles (0-.14), zoom through (.16-.86), mask clears (.8-.9) */
      var settle = e2(p / .14), zp = clamp((p - .16) / .7, 0, 1), ze = e3in(zp) * .82 + zp * .18;
      var sEnd = Math.hypot(w, h) / 2 / Math.max(1, rr) * 1.25;
      var s = lerp(.9, 1, settle) * Math.exp(Math.log(sEnd) * ze);
      var drift = e2(zp / .7);
      var px = (ptr.sx * 14 * dpr) * (1 - zp), py = (ptr.sy * 8 * dpr) * (1 - zp);
      var Cy = h / 2;
      /* at s=1 the word sits centred; as we zoom the target letter drifts to the middle of the screen */
      var ox = lerp(Tx, w / 2, drift) + px, oy = lerp(Ty, Cy, drift) + py;
      g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
      g.clearRect(0, 0, w, h);
      g.fillStyle = css(C.mask); g.fillRect(0, 0, w, h);
      g.setTransform(s, 0, 0, s, ox - Tx * s, oy - Ty * s);
      setFont(g, Fs); g.textBaseline = 'alphabetic';
      /* once the word is much bigger than the screen, only the letters still on screen are drawn (giant glyphs are expensive) */
      var vis = null;
      if (s > 1.6) {
        vis = [];
        var gy0 = s * (y0 - geo.asc * k * 1.15) + oy - Ty * s, gy1 = s * (y0 + geo.desc * k + Fs * .1) + oy - Ty * s;
        if (gy1 >= 0 && gy0 <= h) for (var vi = 0; vi < WORD.length; vi++) {
          var X0 = x0 + geo.lx[vi] * k - Fs * .08, X1 = x0 + (geo.lx[vi] + geo.lw[vi]) * k + Fs * .08;
          var sx0 = s * X0 + ox - Tx * s, sx1 = s * X1 + ox - Tx * s;
          if (sx1 >= 0 && sx0 <= w && WORD[vi] !== ' ') vis.push(vi);
        }
      }
      function txt(dx, dy) {
        if (!vis) { g.fillText(WORD, x0 + dx, y0 + dy); return; }
        for (var q = 0; q < vis.length; q++) g.fillText(WORD[vis[q]], x0 + geo.lx[vis[q]] * k + dx, y0 + dy);
      }
      var settleA = lerp(.5, 1, settle);
      /* chrome rim: the word drawn a hair larger in eight directions, then the letters are cut out of it.
         (no strokeText: variable fonts have overlapping contours that a stroke would reveal) */
      var rimA = lerp(C.light ? .45 : .3, C.light ? .85 : .62, settle) * (1 - e2((zp - .55) / .35));
      if (rimA > .003) {
        var t = (now * .12 * motion) % 1.4 - .2, gx2 = x0 + t * geo.w * k;
        var rg = g.createLinearGradient(gx2 - Fs * .6, 0, gx2 + Fs * .6, 0);
        rg.addColorStop(0, css(C.ink, rimA * .65)); rg.addColorStop(.46, css(C.ink, rimA)); rg.addColorStop(.5, css(C.acc, Math.min(1, rimA * 1.7))); rg.addColorStop(.54, css(C.ink, rimA)); rg.addColorStop(1, css(C.ink, rimA * .65));
        g.fillStyle = rg; var o1 = 1.25 * dpr / s;
        for (var a = 0; a < 8; a++) txt(Math.cos(a * Math.PI / 4) * o1, Math.sin(a * Math.PI / 4) * o1);
      }
      g.globalCompositeOperation = 'destination-out';
      g.globalAlpha = 1; g.fillStyle = '#000'; txt(0, 0);
      g.globalCompositeOperation = 'source-over';
      /* until the word has settled the letters are a smoked window: part of the mask stays inside them */
      if (settleA < .999) { g.globalAlpha = 1 - settleA; g.fillStyle = css(C.mask); txt(0, 0); g.globalAlpha = 1; }
      /* faint glass sheen inside the letters while the word is readable */
      var sheenA = (1 - e2(zp / .35)) * (C.light ? .08 : .12);
      if (sheenA > .002) {
        var gx = x0 + ((now * .08 * motion) % 1.6 - .3) * geo.w * k;
        var gr = g.createLinearGradient(gx - Fs, y0 - Fs, gx + Fs, y0);
        gr.addColorStop(0, css(C.ink, 0)); gr.addColorStop(.5, css(C.light ? [1, 1, 1] : C.ink, sheenA * 2)); gr.addColorStop(1, css(C.ink, 0));
        g.fillStyle = gr; txt(0, 0);
        var vg = g.createLinearGradient(0, y0 - geo.asc * k, 0, y0);
        if (C.light) { vg.addColorStop(0, css(C.ink, sheenA * .7)); vg.addColorStop(1, css(C.ink, sheenA * 2.4)); }
        else { vg.addColorStop(0, css(C.ink, sheenA * .9)); vg.addColorStop(1, css(C.ink, 0)); }
        g.fillStyle = vg; txt(0, 0);
      }
      g.setTransform(1, 0, 0, 1, 0, 0);
      var fade = 1 - e2((p - .8) / .1);
      cv.style.opacity = fade.toFixed(3); cv.style.visibility = fade < .003 ? 'hidden' : 'visible';
      if (inner) { var ia = e2((p - .7) / .2); inner.style.opacity = ia.toFixed(3); inner.style.transform = 'scale(' + lerp(.86, 1, ia).toFixed(4) + ')'; }
      if (cue) { var ca = 1 - e2((p - .04) / .14); cue.style.opacity = ca.toFixed(3); }
    }

    /* ---- scroll ---- */
    var state = { ps: -1, motion: 1, stat: false };
    function rawProgress() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight, len = r.height - vh;
      return len > 1 ? clamp(-r.top / len, 0, 1) : 0;
    }
    var loop = ambient(root, api, function (now, dt) {
      var rp = rawProgress();
      if (state.ps < 0) state.ps = rp; else state.ps += (rp - state.ps) * (1 - Math.exp(-dt * 9));
      if (Math.abs(rp - state.ps) < .0002) state.ps = rp;
      ptr.sx += (ptr.x - ptr.sx) * (1 - Math.exp(-dt * 3)); ptr.sy += (ptr.y - ptr.sy) * (1 - Math.exp(-dt * 3));
      draw(state.ps, now, state.motion);
    }, function (on) { root.classList.toggle('is-live', on && !state.stat); });
    api.on(W, 'pointermove', function (e) { if (e.pointerType === 'touch') return; ptr.x = e.clientX / W.innerWidth - .5; ptr.y = e.clientY / W.innerHeight - .5; }, { passive: true });

    var ro = new ResizeObserver(function () { size(); if (!state.stat) draw(state.ps < 0 ? rawProgress() : state.ps, performance.now() / 1000, state.motion); });
    ro.observe(stage); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.SCR17) return; measure(); if (!state.stat) draw(rawProgress(), performance.now() / 1000, state.motion); });

    function setup() {
      var m = motionOf(root);
      state.motion = m; state.stat = m === 0; state.ps = -1;
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-compact', isCompact());
      readTokens(); measure(); size();
      if (state.stat) { loop.stop(); if (inner) inner.style.cssText = ''; if (cue) cue.style.cssText = ''; root.classList.remove('is-live'); }
      else { draw(rawProgress(), performance.now() / 1000, m); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

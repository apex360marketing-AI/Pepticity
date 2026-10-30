/*! APEX library TXT-04 · Scroll Highlight — self-contained, token-driven. window.APX['TXT-04'].mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX core (inlined per module; no globals besides window.APX) ---- */
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function tok(el, n, fb) { var v = getComputedStyle(el).getPropertyValue(n).trim(); return v || fb; }
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(tok(el, '--apx-motion', '1'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
  function isCompact() { return W.matchMedia('(max-width: 899px)').matches; }
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
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)');
    var h = function () { fn(); };
    if (RM.addEventListener) { RM.addEventListener('change', h); mq.addEventListener('change', h); api.add(function () { RM.removeEventListener('change', h); mq.removeEventListener('change', h); }); }
  }
  var _cx;
  function rgba(str, fb) {
    if (!_cx) { var c = D.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = fb || '#000'; _cx.fillStyle = str || fb || '#000';
    _cx.fillRect(0, 0, 1, 1); var d = _cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function e2(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  /* TXT-04 · Scroll Highlight — text starts dim and lights up word by word with the scroll; a soft reading light travels with it. */
  register('TXT-04', 'Scroll Highlight', function (root, opts, api) {
    var stage = root.querySelector('.apx-txt04__stage');
    var texts = [].slice.call(root.querySelectorAll('.apx-txt04__text'));
    if (!texts.length) texts = [root];
    var meter = root.querySelector('.apx-txt04__meter');
    var notes = [].slice.call(root.querySelectorAll('.apx-txt04__notes > *'));
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var pinWanted = String(opt('pin', 'data-pin', stage ? 'true' : 'false')) !== 'false';
    var still = clamp(parseFloat(opt('still', 'data-still', '1')), 0, 1);

    /* ---- split every text block into word spans, keeping inner markup (mark, b, em, links) ---- */
    var restore = [], words = [], marks = [];
    texts.forEach(function (el) {
      var html = el.innerHTML; restore.push(function () { el.innerHTML = html; });
      var walker = D.createTreeWalker(el, NodeFilter.SHOW_TEXT, null), nodes = [], n;
      while ((n = walker.nextNode())) nodes.push(n);
      nodes.forEach(function (tn) {
        var parts = tn.nodeValue.split(/(\s+)/);
        if (parts.length === 1 && !parts[0].trim()) return;
        var frag = D.createDocumentFragment();
        var hl = tn.parentNode.closest && tn.parentNode.closest('mark, [data-hl], .apx-txt04__hl');
        if (hl && !el.contains(hl)) hl = null;
        parts.forEach(function (p) {
          if (!p) return;
          if (!p.trim()) { frag.appendChild(D.createTextNode(p)); return; }
          var s = D.createElement('span'); s.className = 'apx-txt04__w' + (hl ? ' is-hl' : ''); s.textContent = p;
          frag.appendChild(s); words.push({ el: s, v: -1, hl: hl });
        });
        tn.parentNode.replaceChild(frag, tn);
      });
      [].slice.call(el.querySelectorAll('mark, [data-hl], .apx-txt04__hl')).forEach(function (m) {
        m.classList.add('apx-txt04__mark');
        var ws = m.querySelectorAll('.apx-txt04__w'); if (ws.length) ws[ws.length - 1].classList.add('is-end');
        if (marks.indexOf(m) < 0) marks.push(m);
      });
    });
    var NW = Math.max(1, words.length);

    /* reading light: one soft glow that travels to the word being lit */
    var host = texts[0].parentNode && texts[0] !== root ? texts[0].parentNode : root;
    var lamp = D.createElement('i'); lamp.className = 'apx-txt04__lamp'; lamp.setAttribute('aria-hidden', 'true');
    host.insertBefore(lamp, host.firstChild);
    var hostPos = getComputedStyle(host).position === 'static';
    if (hostPos) host.style.position = 'relative';
    var fill = null;
    if (meter) { var mh = meter.innerHTML; restore.push(function () { meter.innerHTML = mh; }); meter.innerHTML = '<i class="apx-txt04__fill"></i>'; fill = meter.firstChild; }
    api.add(function () {
      lamp.remove(); if (hostPos) host.style.position = '';
      restore.forEach(function (f) { f(); });
      marks.forEach(function (m) { m.classList.remove('apx-txt04__mark', 'is-on'); });
      notes.forEach(function (x) { x.classList.remove('is-in'); });
      root.classList.remove('is-pin', 'is-static', 'is-compact', 'is-done', 'is-light');
    });

    /* cached word centres (relative to the lamp host), measured on layout only */
    var pos = [];
    function measure() {
      var hr = host.getBoundingClientRect();
      pos = words.map(function (w) { var r = w.el.getBoundingClientRect(); return [r.left - hr.left + r.width / 2, r.top - hr.top + r.height / 2, r.height]; });
      /* a highlight underline must not run past the last word on a line */
      words.forEach(function (w, i) { if (w.hl) w.el.classList.toggle('is-eol', !!pos[i + 1] && Math.abs(pos[i + 1][1] - pos[i][1]) > pos[i][2] * .5); });
    }

    var state = { ps: -1, target: 0, motion: 1, stat: false, pin: false, lamp: '', fill: -1, notes: false, done: false };
    function progress() {
      var vh = W.innerHeight;
      if (state.pin) {
        var r = root.getBoundingClientRect(), len = r.height - vh;
        /* light the words over 8%..80% of the hold, then rest fully lit */
        return clamp((len > 1 ? -r.top / len : 0) / .8 - .1, 0, 1);
      }
      var t = (stage || texts[0]).getBoundingClientRect();
      var a = vh * .86, b = vh * .38;
      return clamp((a - t.top) / Math.max(1, (a - b) + t.height * .55), 0, 1);
    }
    function paint(p) {
      var lit = p * (NW + 2) - 1, cur = -1;
      for (var i = 0; i < words.length; i++) {
        var w = words[i], v = e2(lit - i);
        var q = Math.round(v * 100);
        if (q !== w.v) {
          w.v = q;
          w.el.style.opacity = q >= 100 ? '' : (state.dim + (1 - state.dim) * v).toFixed(3);
          w.el.style.transform = q >= 100 ? '' : 'translate3d(0,' + ((1 - v) * .14 * state.motion).toFixed(3) + 'em,0)';
          w.el.classList.toggle('is-lit', q >= 100);
        }
        if (v > 0 && v < 1) cur = i;
      }
      marks.forEach(function (m) { var ws = m.querySelectorAll('.apx-txt04__w'), last = ws[ws.length - 1]; m.classList.toggle('is-on', !!last && last.classList.contains('is-lit')); });
      /* lamp follows the lit edge */
      var li = cur >= 0 ? cur : clamp(Math.floor(lit), 0, words.length - 1), pp = pos[li];
      var on = p > .001 && p < .999 && pp ? 1 : 0;
      if (pp) {
        var key = Math.round(pp[0]) + ',' + Math.round(pp[1]) + ',' + on;
        if (key !== state.lamp) { state.lamp = key; lamp.style.transform = 'translate3d(' + pp[0].toFixed(1) + 'px,' + pp[1].toFixed(1) + 'px,0) translate(-50%,-50%)'; lamp.style.opacity = on ? '' : '0'; }
      }
      if (fill) { var f = Math.round(p * 1000); if (f !== state.fill) { state.fill = f; fill.style.transform = 'scaleX(' + (f / 1000) + ')'; } }
      var nIn = p > .9; if (nIn !== state.notes) { state.notes = nIn; notes.forEach(function (x) { x.classList.toggle('is-in', nIn); }); }
      var dn = p >= .999; if (dn !== state.done) { state.done = dn; root.classList.toggle('is-done', dn); }
    }
    var loop = ambient(root, api, function (now, dt) {
      var p = progress();
      if (state.ps < 0) state.ps = p; else state.ps += (p - state.ps) * (1 - Math.exp(-dt * 9));
      if (Math.abs(p - state.ps) < .0005) state.ps = p;
      paint(state.ps);
    });
    var ro = new ResizeObserver(function () { measure(); state.lamp = ''; if (state.stat) paint(still); });
    ro.observe(host); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.TXT04) return; measure(); state.lamp = ''; });

    function setup() {
      var m = motionOf(root), compact = isCompact();
      state.motion = Math.min(1, m); state.stat = m === 0;
      state.pin = !state.stat && pinWanted && !!stage;
      state.dim = clamp(parseFloat(tok(root, '--apx-txt04-dim', '.16')), 0, 1);
      if (!isFinite(state.dim)) state.dim = .16;
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-pin', state.pin);
      root.classList.toggle('is-compact', compact);
      root.classList.toggle('is-light', lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5);
      words.forEach(function (w) { w.v = -1; });
      state.ps = -1; state.lamp = ''; state.fill = -1; state.notes = null; state.done = null;
      measure();
      if (state.stat) { loop.stop(); paint(still); }
      else { paint(progress()); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

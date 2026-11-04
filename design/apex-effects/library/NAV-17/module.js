/*! APEX library NAV-17 · Timeline Scrubber — self-contained, token-driven. window.APX['NAV-17'].mount(root) -> destroy() */
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
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function pad2(n) { return (n < 10 ? '0' : '') + n; }
  /* fallback chapter pictures (24px line icons) */
  var ICONS = ['M4 6h16v12H4z M8 10h8 M8 14h5', 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z', 'M5 12l4 4 10-10', 'M4 4h7v7H4z M13 4h7v7h-7z M4 13h7v7H4z M13 13h7v7h-7z', 'M4 6h16 M4 12h10 M4 18h13', 'M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z M12 10h.01', 'M3 12h4l3-8 4 16 3-8h4', 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 7v5l3 2'];
  var CHEV = function (d) { return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="' + (d < 0 ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7') + '"/></svg>'; };

  /* NAV-17 · Timeline Scrubber — a video-editor timeline along the bottom: chapter marks, a playhead you drag, and a preview frame of where you will land. */
  register('NAV-17', 'Timeline Scrubber', function (root, opts, api) {
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var scopeSel = opt('scope', 'data-scope', ''), scope = null;
    if (scopeSel && typeof scopeSel === 'object' && scopeSel.nodeType === 1) scope = scopeSel;
    else if (scopeSel) { try { scope = D.querySelector(scopeSel); } catch (e) { scope = null; } }
    var doc = !scope, host = scope || D;
    var DUR = Math.max(1, parseFloat(opt('duration', 'data-duration', '120')) || 120), FPS = 24;
    var chEls = [].slice.call(host.querySelectorAll('[data-chapter]'));
    if (!chEls.length) return;
    var CH = chEls.map(function (el, i) { return { el: el, title: el.getAttribute('data-chapter') || ('Chapter ' + (i + 1)), icon: el.getAttribute('data-chapter-icon') || ICONS[i % ICONS.length], y: 0 }; });
    var N = CH.length;

    /* ---- DOM ---- */
    var orig = root.innerHTML, label = root.getAttribute('aria-label');
    if (!label) root.setAttribute('aria-label', 'Page timeline');
    root.innerHTML =
      '<div class="apx-nav17__in">' +
        '<span class="apx-nav17__tc" aria-hidden="true"><i></i><b>TC</b><span>00:00:00</span></span>' +
        '<button type="button" class="apx-nav17__btn" data-dir="-1" aria-label="Previous chapter">' + CHEV(-1) + '</button>' +
        '<div class="apx-nav17__track" role="slider" tabindex="0" aria-label="Page position. Arrow keys jump between chapters" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0">' +
          '<div class="apx-nav17__bed"><div class="apx-nav17__fill"></div></div>' +
          CH.map(function (c, i) { return '<div class="apx-nav17__mark" title="' + esc(c.title) + '"><span>' + pad2(i + 1) + '</span></div>'; }).join('') +
          '<div class="apx-nav17__head"></div>' +
          '<div class="apx-nav17__thumb" aria-hidden="true"><div class="apx-nav17__frame"><b>01</b><em></em><svg viewBox="0 0 24 24"><path d=""/></svg></div><div class="apx-nav17__cap">00:00:00</div></div>' +
        '</div>' +
        '<button type="button" class="apx-nav17__btn" data-dir="1" aria-label="Next chapter">' + CHEV(1) + '</button>' +
        '<span class="apx-nav17__ch" aria-live="polite"><span></span></span>' +
      '</div>';
    var $ = function (s) { return root.querySelector(s); };
    var track = $('.apx-nav17__track'), head = $('.apx-nav17__head'), fill = $('.apx-nav17__fill'), tcEl = $('.apx-nav17__tc span'),
      thumb = $('.apx-nav17__thumb'), thN = $('.apx-nav17__frame b'), thT = $('.apx-nav17__frame em'), thP = $('.apx-nav17__frame path'), thC = $('.apx-nav17__cap'),
      chEl = $('.apx-nav17__ch span'), marks = [].slice.call(root.querySelectorAll('.apx-nav17__mark'));
    api.add(function () {
      root.innerHTML = orig; if (!label) root.removeAttribute('aria-label');
      root.classList.remove('is-static', 'is-compact', 'is-light', 'is-drag', 'is-away');
    });

    /* ---- metrics ---- */
    var M = { start: 0, end: 1, tw: 1 }, cur = -1, motion = 1;
    function measure() {
      var sy = W.scrollY, vh = W.innerHeight;
      if (doc) { M.start = 0; M.end = Math.max(1, D.documentElement.scrollHeight - vh); }
      else { var r = scope.getBoundingClientRect(); M.start = r.top + sy; M.end = Math.max(M.start + 1, r.top + sy + scope.offsetHeight - vh); }
      CH.forEach(function (c, i) { c.y = i === 0 ? M.start : c.el.getBoundingClientRect().top + sy; });
      M.tw = track.clientWidth || 1;
      marks.forEach(function (m, i) { m.style.left = (clamp((CH[i].y - M.start) / (M.end - M.start), 0, 1) * 100).toFixed(3) + '%'; });
      paint();
    }
    function tc(r) { var s = r * DUR, f = Math.floor((s % 1) * FPS); return pad2(Math.floor(s / 60)) + ':' + pad2(Math.floor(s % 60)) + ':' + pad2(f); }
    /* a chapter counts as current once its top passes 40% of the screen height */
    function chAt(y) { var k = 0, lead = Math.min(W.innerHeight * .4, 400); for (var i = 0; i < N; i++) if (y >= CH[i].y - (i ? lead : 2)) k = i; return k; }
    function ratio() { return clamp((W.scrollY - M.start) / (M.end - M.start), 0, 1); }
    function paint() {
      var y = W.scrollY, r = ratio(), vh = W.innerHeight;
      head.style.transform = 'translate3d(' + (r * M.tw).toFixed(1) + 'px,0,0)';
      fill.style.transform = 'scaleX(' + r.toFixed(4) + ')';
      tcEl.textContent = tc(r);
      var k = chAt(y);
      if (k !== cur) {
        var first = cur < 0; cur = k;
        marks.forEach(function (m, i) { m.classList.toggle('is-on', i === k); });
        chEl.textContent = pad2(k + 1) + ' · ' + CH[k].title;
        if (!first && motion) { chEl.classList.remove('is-swap'); void chEl.offsetWidth; chEl.classList.add('is-swap'); }
      }
      track.setAttribute('aria-valuenow', String(Math.round(r * 100)));
      track.setAttribute('aria-valuetext', 'Chapter ' + (k + 1) + ' of ' + N + ', ' + CH[k].title);
      if (!doc) root.classList.toggle('is-away', y < M.start - vh * .35 || y > M.end + vh * .35);
    }
    var praf = 0;
    function reqPaint() { if (!praf) praf = requestAnimationFrame(function () { praf = 0; paint(); }); }
    api.on(W, 'scroll', reqPaint, { passive: true });
    api.add(function () { if (praf) cancelAnimationFrame(praf); });

    /* ---- seeking: our own eased scroll (no library); any wheel or touch takes control back ---- */
    var tw = 0;
    function stopTween() { if (tw) { cancelAnimationFrame(tw); tw = 0; } }
    function seekTo(y, immediate) {
      y = clamp(y, M.start, M.end); stopTween();
      if (immediate || !motion) { W.scrollTo(0, y); return; }
      var y0 = W.scrollY, dy = y - y0, dur = clamp(500 + Math.sqrt(Math.abs(dy)) * 14, 600, 1500), t0 = 0;
      function step(now) {
        if (!t0) t0 = now; var t = clamp((now - t0) / dur, 0, 1), e = t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
        W.scrollTo(0, y0 + dy * e); tw = t < 1 ? requestAnimationFrame(step) : 0;
      }
      tw = requestAnimationFrame(step);
    }
    api.on(W, 'wheel', stopTween, { passive: true }); api.on(W, 'touchstart', stopTween, { passive: true });
    api.add(stopTween);

    function rFromX(x) { var b = track.getBoundingClientRect(); return clamp((x - b.left) / b.width, 0, 1); }
    function showThumb(r, x) {
      var y = M.start + r * (M.end - M.start), k = chAt(y), b = track.getBoundingClientRect();
      var half = (thumb.offsetWidth || 184) / 2, cx = b.left + r * b.width, lo = 8 + half, hi = W.innerWidth - 8 - half;
      thumb.style.left = (r * 100).toFixed(3) + '%';
      thumb.style.setProperty('--tx', (clamp(cx, lo, hi) - cx).toFixed(1) + 'px');
      thN.textContent = pad2(k + 1); thT.textContent = CH[k].title; thP.setAttribute('d', CH[k].icon); thC.textContent = tc(r);
      marks.forEach(function (m, i) { var mx = b.left + clamp((CH[i].y - M.start) / (M.end - M.start), 0, 1) * b.width; m.classList.toggle('is-near', x !== undefined && Math.abs(mx - x) < 22); });
    }
    var drag = false, moved = false, downX = 0;
    api.on(track, 'pointermove', function (e) {
      var r = rFromX(e.clientX); showThumb(r, e.clientX);
      if (drag) { if (Math.abs(e.clientX - downX) > 3) moved = true; if (moved) seekTo(M.start + r * (M.end - M.start), true); }
    });
    api.on(track, 'pointerdown', function (e) {
      if (e.button > 0) return;
      drag = true; moved = false; downX = e.clientX; stopTween();
      try { track.setPointerCapture(e.pointerId); } catch (er) {}
      root.classList.add('is-drag'); showThumb(rFromX(e.clientX), e.clientX);
    });
    function endDrag(e) {
      if (!drag) return; drag = false; root.classList.remove('is-drag');
      if (!moved) seekTo(M.start + rFromX(e.clientX) * (M.end - M.start), false);
    }
    api.on(track, 'pointerup', endDrag);
    api.on(track, 'pointercancel', function () { drag = false; root.classList.remove('is-drag'); });
    api.on(track, 'pointerleave', function () { if (!drag) marks.forEach(function (m) { m.classList.remove('is-near'); }); });
    function go(d) { var k = clamp(cur + d, 0, N - 1); seekTo(CH[k].y + (k ? 1 : 0), false); }
    api.on(track, 'keydown', function (e) {
      var k = e.key, span = M.end - M.start;
      if (k === 'ArrowRight' || k === 'ArrowDown') { e.preventDefault(); go(1); }
      else if (k === 'ArrowLeft' || k === 'ArrowUp') { e.preventDefault(); go(-1); }
      else if (k === 'PageDown') { e.preventDefault(); seekTo(W.scrollY + span * .05, false); }
      else if (k === 'PageUp') { e.preventDefault(); seekTo(W.scrollY - span * .05, false); }
      else if (k === 'Home') { e.preventDefault(); seekTo(M.start, false); }
      else if (k === 'End') { e.preventDefault(); seekTo(M.end, false); }
    });
    [].forEach.call(root.querySelectorAll('.apx-nav17__btn'), function (b) { api.on(b, 'click', function () { go(+b.getAttribute('data-dir')); }); });

    /* re-measure when the page or the scope changes size */
    var ro = new ResizeObserver(function () { measure(); });
    ro.observe(doc ? D.body : scope); ro.observe(track);
    api.add(function () { ro.disconnect(); });
    api.on(W, 'load', measure);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (root.__apx && root.__apx.NAV17) measure(); });

    function setup() {
      motion = motionOf(root);
      root.classList.toggle('is-static', motion === 0);
      root.classList.toggle('is-compact', isCompact());
      root.classList.toggle('is-light', lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5);
      cur = -1; measure();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

/* =====================================================================
   SELECTION STUDIO · LIVE MODULE KIT (manifest-a) · the module contract in one place.
   window.FX:
     accent    ?acc=<slug|hex>  and  postMessage({acc:'<slug>'})  ->  CSS vars --acc/--acc-rgb/--acc-text + event 'fx:acc'
     play      postMessage({cmd:'play'}) / ({cmd:'pause'}); standalone pages play at once, embedded pages wait to be told
               (or ?play=1). Ambient CSS uses var(--play). Interaction always answers, even while paused.
     other     postMessage({cmd:'replay'}) replays an entrance / resets a scene; ({cmd:'tour', on:true|false}) auto-scrubs scroll scenes.
     reply     the module posts {pep:'ready', code, interact} and {pep:'interact', code} to its parent.
     loop      FX.loop(fn(dt, t, now) -> needsMoreFrames): one rAF for the whole module; sleeps when paused, hidden or off screen.
     scroller  FX.scroller(el) -> { raw, p (eased), v, to(p) }: the module's own internal scroll (works inside an iframe).
     hint      FX.hint('scroll'|'drag'|'hover'|'tap', label?) -> the tiny corner hint.
     rm        reduced motion (prefers-reduced-motion or ?rm=1): t stops, eased values snap, each module shows a still state.
   ===================================================================== */
(function () {
  'use strict';
  var ACC = { chartreuse: '#D4FF3A', blue: '#0066FF', cyan: '#0FFFFF', red: '#FF004F', violet: '#6F00FF', orchid: '#8D029B', copper: '#C46210', salmon: '#FA8072', platinum: '#E6E8EC' };
  var DARK = { blue: 60, red: 65, violet: 50, orchid: 50, copper: 65 };   /* text tint % of the accent mixed with white (4.5:1 on black) */
  var D = document.documentElement, q = new URLSearchParams(location.search);
  var embedded = (function () { try { return window.self !== window.top; } catch (e) { return true; } })();
  var rm = matchMedia('(prefers-reduced-motion: reduce)').matches || q.get('rm') === '1';
  var snap = q.get('snap') === '1';   /* test hook: eased values land at once (screenshots at exact scroll positions) */
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var FX = window.FX = {
    embedded: embedded, rm: rm, playing: false, visible: true, t: 0, q: q,
    code: (document.querySelector('meta[name="fx-code"]') || {}).content || '',
    interact: (document.querySelector('meta[name="fx-interact"]') || {}).content || '',
    mobile: innerWidth < 900, coarse: matchMedia('(pointer: coarse)').matches,
    clamp: clamp,
    lerp: function (a, b, t) { return a + (b - a) * t; },
    damp: function (c, t, l, dt) { return rm || snap ? t : c + (t - c) * (1 - Math.exp(-l * dt)); },
    ss: function (a, b, v) { v = clamp((v - a) / (b - a), 0, 1); return v * v * (3 - 2 * v); },
    ease: function (v) { v = clamp(v, 0, 1); return v * v * v * (v * (v * 6 - 15) + 10); },
    acc: { slug: 'chartreuse', hex: ACC.chartreuse, rgb: [212, 255, 58] }
  };
  if (rm) D.classList.add('rm');
  if (q.get('chrome') === '0') D.classList.add('fx-bare');
  if (q.get('hint') === '0') D.classList.add('fx-nohint');

  function post(msg) { if (embedded) try { parent.postMessage(msg, '*'); } catch (e) { } }
  function emit(n, d) { dispatchEvent(new CustomEvent(n, { detail: d })); }

  /* ---------------- accent ---------------- */
  function rgbOf(hex) { var h = hex.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); var n = parseInt(h, 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
  FX.setAcc = function (v) {
    if (!v) return;
    v = String(v).trim().toLowerCase();
    var slug = ACC[v] ? v : null, hex = slug ? ACC[slug] : (/^#?[0-9a-f]{3}([0-9a-f]{3})?$/.test(v) ? (v[0] === '#' ? v : '#' + v) : null);
    if (!hex) return;
    var rgb = rgbOf(hex), lum = (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
    D.dataset.acc = slug || 'custom';
    D.style.setProperty('--acc', hex);
    D.style.setProperty('--acc-rgb', rgb.join(','));
    D.style.setProperty('--acc-text', slug && DARK[slug] ? 'color-mix(in srgb,' + hex + ' ' + DARK[slug] + '%,#fff)' : (lum < 0.4 ? 'color-mix(in srgb,' + hex + ' 55%,#fff)' : hex));
    D.style.setProperty('--acc-ink', lum > 0.55 ? '#0b0b0c' : '#ffffff');
    FX.acc = { slug: slug || 'custom', hex: hex, rgb: rgb };
    emit('fx:acc', FX.acc); FX.wake();
  };
  FX.onAcc = function (fn) { addEventListener('fx:acc', function (e) { fn(e.detail); }); fn(FX.acc); };

  /* ---------------- loop ---------------- */
  var subs = [], raf = 0, last = 0, woke = false;
  FX.loop = function (fn) { subs.push(fn); FX.wake(); return fn; };
  function frame(now) {
    raf = 0;
    var dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 20); last = now;
    var live = FX.playing && FX.visible && !document.hidden && !rm;
    if (live) FX.t += dt;
    var busy = false;
    for (var i = 0; i < subs.length; i++) { try { if (subs[i](dt, FX.t, now, live)) busy = true; } catch (e) { console.error(e); } }
    if (live || busy || woke) { woke = false; raf = requestAnimationFrame(frame); }
  }
  FX.wake = function () { woke = true; if (!raf) { last = performance.now(); raf = requestAnimationFrame(frame); } };

  /* ---------------- play / pause ---------------- */
  FX.play = function () { if (FX.playing) return; FX.playing = true; D.classList.remove('paused'); emit('fx:play'); FX.wake(); };
  FX.pause = function () { if (!FX.playing && D.classList.contains('paused')) return; FX.playing = false; D.classList.add('paused'); emit('fx:pause'); };
  addEventListener('message', function (e) {
    var d = e.data; if (d == null) return;
    if (typeof d === 'string') d = /^(play|pause|replay|reset)$/.test(d) ? { cmd: d } : { acc: d };
    if (typeof d !== 'object') return;
    if (d.acc) FX.setAcc(d.acc);
    if (d.cmd === 'play') FX.play();
    else if (d.cmd === 'pause') FX.pause();
    else if (d.cmd === 'replay' || d.cmd === 'reset') { emit('fx:replay'); FX.wake(); }
    else if (d.cmd === 'tour') { tourForced = d.on === false ? -1 : 1; FX.wake(); }
  });
  document.addEventListener('visibilitychange', function () { FX.wake(); });

  /* off screen inside the host page: sleep (the implicit root of an iframe's observer is the top-level viewport) */
  if ('IntersectionObserver' in window) {
    var probe = document.createElement('div');
    probe.style.cssText = 'position:fixed;inset:0;pointer-events:none;visibility:hidden';
    var io = new IntersectionObserver(function (es) { FX.visible = es[es.length - 1].isIntersecting; FX.wake(); }, { threshold: 0 });
    var mountProbe = function () { document.body.appendChild(probe); io.observe(probe); };
    if (document.body) mountProbe(); else document.addEventListener('DOMContentLoaded', mountProbe);
  }

  /* ---------------- pointer ---------------- */
  var P = FX.pointer = { x: innerWidth / 2, y: innerHeight / 2, nx: 0, ny: 0, inside: false, type: 'mouse', down: false };
  var told = false;
  function touched() { idleAt = performance.now(); if (!told) { told = true; post({ pep: 'interact', code: FX.code }); } if (hintEl) hintEl.classList.add('dim'); }
  addEventListener('pointermove', function (e) {
    P.x = e.clientX; P.y = e.clientY; P.nx = e.clientX / innerWidth * 2 - 1; P.ny = e.clientY / innerHeight * 2 - 1; P.inside = true; P.type = e.pointerType || 'mouse';
    FX.wake();
  }, { passive: true });
  addEventListener('pointerdown', function (e) { P.down = true; P.type = e.pointerType || 'mouse'; touched(); FX.wake(); }, { passive: true });
  addEventListener('pointerup', function () { P.down = false; FX.wake(); }, { passive: true });
  document.addEventListener('pointerleave', function () { P.inside = false; FX.wake(); });
  document.documentElement.addEventListener('mouseleave', function () { P.inside = false; FX.wake(); });
  addEventListener('resize', function () { FX.mobile = innerWidth < 900; FX.wake(); });

  /* ---------------- internal scroller + auto tour ---------------- */
  var idleAt = performance.now(), tourForced = q.get('tour') === '1' ? 1 : q.get('tour') === '0' ? -1 : 0;
  ['wheel', 'touchstart', 'keydown'].forEach(function (n) { addEventListener(n, touched, { passive: true }); });
  FX.scroller = function (el, opt) {
    opt = opt || {};
    var S = { el: el, raw: 0, p: 0, v: 0, lp: 0, touring: false };
    function read() { var m = el.scrollHeight - el.clientHeight; S.raw = m > 0 ? clamp(el.scrollTop / m, 0, 1) : 0; }
    el.addEventListener('scroll', function () { read(); FX.wake(); }, { passive: true });
    addEventListener('resize', read);
    S.to = function (p) { var m = el.scrollHeight - el.clientHeight; el.scrollTop = p * m; read(); };
    var phase = 0, period = opt.tourPeriod || 16;
    FX.loop(function (dt, t, now, live) {
      var tourOn = tourForced === 1 || (tourForced === 0 && embedded && opt.tour !== false);
      var want = live && tourOn && now - idleAt > 2600;
      if (want && !S.touring) { S.touring = true; phase = Math.acos(clamp(1 - 2 * S.raw, -1, 1)); }
      if (!want) S.touring = false;
      if (S.touring) { phase += dt * Math.PI * 2 / period; S.to(0.5 - 0.5 * Math.cos(phase)); }
      var pp = S.p;
      S.p = FX.damp(S.p, S.raw, opt.ease || 5, dt);
      if (Math.abs(S.p - S.raw) < 1e-5) S.p = S.raw;
      S.v = dt > 0 ? (S.p - pp) / dt : 0;
      if (railEl && railEl.__s === S) railEl.style.setProperty('--p', S.p.toFixed(4));
      return Math.abs(S.p - S.raw) > 1e-5 || S.touring;
    });
    read(); S.p = S.raw;
    return S;
  };
  var railEl = null;
  FX.rail = function (S) { railEl = document.createElement('div'); railEl.className = 'fx-rail'; railEl.setAttribute('aria-hidden', 'true'); railEl.innerHTML = '<i></i><b></b>'; railEl.__s = S; document.body.appendChild(railEl); return railEl; };

  /* ---------------- corner hint ---------------- */
  var ICON = {
    scroll: '<svg viewBox="0 0 16 16"><rect x="4.5" y="1.5" width="7" height="13" rx="3.5"/><path class="wheel ac" d="M8 4.6v2.2"/></svg>',
    drag: '<svg viewBox="0 0 16 16"><g class="sway"><path d="M3 8h10M3 8l2-2M3 8l2 2M13 8l-2-2M13 8l-2 2"/></g><circle class="pulse ac" cx="8" cy="8" r="2.2"/></svg>',
    hover: '<svg viewBox="0 0 16 16"><path d="M4 2.5l7.5 5-3.4.8 2 3.9-1.6.8-2-3.9L4 11.6z"/><circle class="pulse ac" cx="11.5" cy="11.5" r="2.6"/></svg>',
    tap: '<svg viewBox="0 0 16 16"><circle cx="8" cy="8" r="2.2"/><circle class="pulse ac" cx="8" cy="8" r="5.5"/></svg>'
  };
  var hintEl = null;
  FX.hint = function (kind, label) {
    hintEl = document.createElement('div'); hintEl.className = 'fx-hint'; hintEl.setAttribute('aria-hidden', 'true');
    hintEl.innerHTML = (ICON[kind] || ICON.tap) + '<span>' + (label || kind).toUpperCase() + '</span>';
    document.body.appendChild(hintEl);
    setInterval(function () { if (performance.now() - idleAt > 7000) hintEl.classList.remove('dim'); }, 1500);
    return hintEl;
  };

  /* ---------------- boot ---------------- */
  FX.setAcc(q.get('acc') || 'chartreuse');
  var autoplay = q.get('play') === '1' || q.get('autoplay') === '1' || (!embedded && q.get('play') !== '0');
  if (autoplay) FX.play(); else { FX.playing = false; D.classList.add('paused'); }
  addEventListener('load', function () { post({ pep: 'ready', code: FX.code, interact: FX.interact, playing: FX.playing }); });
})();

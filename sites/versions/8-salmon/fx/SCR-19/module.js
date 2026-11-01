/*! APEX library SCR-19 · Skew Gallery — self-contained, token-driven. window.APX['SCR-19'].mount(root) -> destroy() */
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
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }

  /* ---- the 33 APEX industry icons (24px line drawings, turned into chrome tubes) ---- */
  var ICONS = {
    'executive-recruitment': 'M3 8h18v12H3z M8 8V5h8v3 M3 13h18 M10 13v2h4v-2',
    'industrial-water-treatment': 'M12 3c3 4 6 7 6 11a6 6 0 0 1-12 0c0-4 3-7 6-11z M9 15c1 1 2 1 3 0s2-1 3 0',
    'commercial-security': 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z M9 12l2 2 4-4',
    'industrial-automation': 'M12 9a3 3 0 1 0 0 6a3 3 0 1 0 0-6z M12 2v3 M12 19v3 M2 12h3 M19 12h3 M4.9 4.9l2.1 2.1 M17 17l2.1 2.1 M4.9 19.1L7 17 M17 7l2.1-2.1',
    'commercial-kitchen': 'M6 14a4 4 0 0 1 1-7.9A5 5 0 0 1 17 6.1 4 4 0 0 1 18 14v6H6z M6 17h12',
    'medical-staffing': 'M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18z M12 8v8 M8 12h8',
    'commercial-hvac': 'M12 2v20 M3.3 7l17.4 10 M3.3 17L20.7 7 M9 3.5l3 2 3-2 M9 20.5l3-2 3 2',
    'contract-manufacturing': 'M3 21V10l6 4V10l6 4V6h6v15z M7 18h2 M12 18h2 M17 18h2',
    'commercial-real-estate': 'M3 21h18 M5 21V7l7-4v18 M12 21V9l7 3v9 M8 9h1 M8 13h1 M8 17h1 M15 14h1 M15 18h1',
    'specialty-medical': 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z',
    'commercial-printing': 'M7 9V3h10v6 M5 17H3v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6h-2 M7 14h10v7H7z',
    'cyber-insurance': 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4 M12 15v2',
    'roofing': 'M2 12L12 3l10 9 M5 10v11h14V10 M10 21v-6h4v6',
    'landscaping': 'M5 21c0-9 5-15 15-16-1 10-7 15-15 16z M5 21l8-8',
    'cleaning-interior': 'M9 9h6v12H9z M10 9V6h4v3 M14 6h3l2 2 M7 3h6',
    'cleaning-exterior': 'M4 4h16v16H4z M12 4v16 M4 12h16 M15 7l2 2',
    'plumbing': 'M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.8-3.8a6 6 0 0 1-7.9 7.9l-6.9 6.9a2.1 2.1 0 0 1-3-3l6.9-6.9a6 6 0 0 1 7.9-7.9z',
    'electrical': 'M13 2L4 14h7l-1 8 9-12h-7z',
    'hvac': 'M12 12c-3-4-1-9 2-9 2 0 3 3 0 6 M12 12c4-3 9-1 9 2 0 2-3 3-6 0 M12 12c3 4 1 9-2 9-2 0-3-3 0-6 M12 12c-4 3-9 1-9-2 0-2 3-3 6 0',
    'dental': 'M7 3C4.5 3 3 5 3 7.5c0 3 1.5 4.5 2 7.5.5 3 1 6 2.5 6s1.5-3 2.5-5c.5-1 1.5-1 2 0 1 2 1 5 2.5 5s2-3 2.5-6c.5-3 2-4.5 2-7.5C21 5 19.5 3 17 3c-2 0-3 1-5 1S9 3 7 3z',
    'legal': 'M12 3v18 M7 21h10 M5 7h14 M5 7l-3 7a3 3 0 0 0 6 0z M19 7l-3 7a3 3 0 0 0 6 0z',
    'real-estate': 'M15 3a6 6 0 1 1-5.2 9L3 18.8V21h3v-2h2v-2h2l1.2-1.2 M16 7.5h.01',
    'fitness': 'M6 6v12 M18 6v12 M3 9v6 M21 9v6 M6 12h12',
    'auto-repair': 'M5 17H3v-5l2-5h14l2 5v5h-2 M3 12h18 M7 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M13 17a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    'pest-control': 'M8 9a4 4 0 0 1 8 0v6a4 4 0 0 1-8 0z M12 9v10 M8 12H4 M20 12h-4 M8 16l-3 2 M16 16l3 2 M8 8L5 6 M16 8l3-2',
    'salon': 'M3 6a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M3 18a3 3 0 1 0 6 0a3 3 0 1 0-6 0 M8.1 8.1L20 20 M8.1 15.9L20 4',
    'insurance': 'M3 12a9 9 0 0 1 18 0z M12 12v7a2 2 0 0 1-4 0 M12 3v-1',
    'healthcare': 'M20.8 5.6a5 5 0 0 0-7.8-.6L12 6l-1-1a5 5 0 0 0-7.8 6.4L12 21l8.8-9.6a5 5 0 0 0 0-5.8z M8 12h2l1.5-2 2 4 1.5-2h2',
    'moving': 'M2 6h12v10H2z M14 9h4l4 4v3h-8 M4 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M16 18a2 2 0 1 0 4 0a2 2 0 1 0-4 0',
    'personal-training': 'M12 8a7 7 0 1 0 0 14a7 7 0 1 0 0-14z M12 12v3 M10 2h4 M12 2v3 M19 6l-1.5 1.5',
    'photography': 'M3 8h4l2-3h6l2 3h4v12H3z M12 10a4 4 0 1 0 0 8a4 4 0 1 0 0-8z',
    'wedding-venues': 'M3 15a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M11 15a5 5 0 1 0 10 0a5 5 0 1 0-10 0 M12 3l2 2-2 2-2-2z',
    'restaurants': 'M7 2v20 M4 2v5a3 3 0 0 0 6 0V2 M17 2c-2 2-3 5-3 8h3v12'
  };

  /* ---- SVG path -> polylines (M L H V C S Q T A Z, absolute and relative) ---- */
  function parsePath(d) {
    var tk = String(d).match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) || [], i = 0, cmd = '', subs = [], cur = null;
    var x = 0, y = 0, sx = 0, sy = 0, cx = 0, cy = 0, qx = 0, qy = 0, prev = '';
    function num() { return parseFloat(tk[i++]); }
    function start(px, py) { cur = { pts: [[px, py]], closed: false }; subs.push(cur); }
    function add(px, py) { if (!cur) start(x, y); cur.pts.push([px, py]); }
    function cubic(x1, y1, x2, y2, x3, y3) {
      for (var s = 1; s <= 12; s++) { var t = s / 12, u = 1 - t; add(u * u * u * x + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3); }
    }
    function quad(x1, y1, x2, y2) { for (var s = 1; s <= 10; s++) { var t = s / 10, u = 1 - t; add(u * u * x + 2 * u * t * x1 + t * t * x2, u * u * y + 2 * u * t * y1 + t * t * y2); } }
    function arc(rx, ry, rot, la, sw, x2, y2) {
      if (!rx || !ry) { add(x2, y2); return; }
      var ph = rot * Math.PI / 180, cs = Math.cos(ph), sn = Math.sin(ph);
      var dx = (x - x2) / 2, dy = (y - y2) / 2, x1p = cs * dx + sn * dy, y1p = -sn * dx + cs * dy;
      rx = Math.abs(rx); ry = Math.abs(ry);
      var lam = x1p * x1p / (rx * rx) + y1p * y1p / (ry * ry); if (lam > 1) { var sl = Math.sqrt(lam); rx *= sl; ry *= sl; }
      var num_ = rx * rx * ry * ry - rx * rx * y1p * y1p - ry * ry * x1p * x1p, den = rx * rx * y1p * y1p + ry * ry * x1p * x1p;
      var co = (la === sw ? -1 : 1) * Math.sqrt(Math.max(0, num_ / den));
      var cxp = co * rx * y1p / ry, cyp = -co * ry * x1p / rx;
      var ccx = cs * cxp - sn * cyp + (x + x2) / 2, ccy = sn * cxp + cs * cyp + (y + y2) / 2;
      function ang(ux, uy, vx, vy) { var a = Math.atan2(ux * vy - uy * vx, ux * vx + uy * vy); return a; }
      var t1 = ang(1, 0, (x1p - cxp) / rx, (y1p - cyp) / ry), dt = ang((x1p - cxp) / rx, (y1p - cyp) / ry, (-x1p - cxp) / rx, (-y1p - cyp) / ry);
      if (!sw && dt > 0) dt -= 2 * Math.PI; else if (sw && dt < 0) dt += 2 * Math.PI;
      var n = Math.max(4, Math.ceil(Math.abs(dt) / (Math.PI / 12)));
      for (var s = 1; s <= n; s++) { var a = t1 + dt * s / n, ex = rx * Math.cos(a), ey = ry * Math.sin(a); add(cs * ex - sn * ey + ccx, sn * ex + cs * ey + ccy); }
    }
    while (i < tk.length) {
      if (/[a-zA-Z]/.test(tk[i])) cmd = tk[i++];
      else if (!cmd) { i++; continue; }
      var rel = cmd === cmd.toLowerCase(), C = cmd.toUpperCase(), ox = rel ? x : 0, oy = rel ? y : 0, a, b, c, e, f, g;
      if (C === 'Z') { if (cur) { cur.closed = true; x = sx; y = sy; } cur = null; prev = 'Z'; continue; }
      if (C === 'M') { a = num() + ox; b = num() + oy; x = sx = a; y = sy = b; start(x, y); cmd = rel ? 'l' : 'L'; prev = 'M'; continue; }
      if (C === 'L') { a = num() + ox; b = num() + oy; add(a, b); x = a; y = b; }
      else if (C === 'H') { a = num() + ox; add(a, y); x = a; }
      else if (C === 'V') { b = num() + (rel ? y : 0); add(x, b); y = b; }
      else if (C === 'C') { a = num() + ox; b = num() + oy; c = num() + ox; e = num() + oy; f = num() + ox; g = num() + oy; cubic(a, b, c, e, f, g); cx = c; cy = e; x = f; y = g; }
      else if (C === 'S') { var rx1 = /[CS]/.test(prev) ? 2 * x - cx : x, ry1 = /[CS]/.test(prev) ? 2 * y - cy : y; c = num() + ox; e = num() + oy; f = num() + ox; g = num() + oy; cubic(rx1, ry1, c, e, f, g); cx = c; cy = e; x = f; y = g; }
      else if (C === 'Q') { a = num() + ox; b = num() + oy; f = num() + ox; g = num() + oy; quad(a, b, f, g); qx = a; qy = b; x = f; y = g; }
      else if (C === 'T') { var tx1 = /[QT]/.test(prev) ? 2 * x - qx : x, ty1 = /[QT]/.test(prev) ? 2 * y - qy : y; f = num() + ox; g = num() + oy; quad(tx1, ty1, f, g); qx = tx1; qy = ty1; x = f; y = g; }
      else if (C === 'A') { var r1 = num(), r2 = num(), ro = num(), la = num(), sw = num(); f = num() + ox; g = num() + oy; arc(r1, r2, ro, !!la, !!sw, f, g); x = f; y = g; }
      else { i++; }
      prev = C;
    }
    return subs;
  }

  /* ---- geometry: interleaved pos3 nrm3 rough1 ---- */
  function Mesh() { this.v = []; this.i = []; this.n = 0; }
  Mesh.prototype.vert = function (p, nr, r) { this.v.push(p[0], p[1], p[2], nr[0], nr[1], nr[2], r); return this.n++; };
  function norm2(x, y) { var l = Math.hypot(x, y) || 1; return [x / l, y / l]; }
  /* rounded slab: rounded-rect outline swept around a half-round edge, flat faces front and back */
  function slab(m, w, h, d, rc) {
    var ring = [], cs = 9, hw = w / 2 - rc, hh = h / 2 - rc, rb = d / 2;
    [[hw, hh, 0], [-hw, hh, .5], [-hw, -hh, 1], [hw, -hh, 1.5]].forEach(function (k) {
      for (var s = 0; s <= cs; s++) { var a = (k[2] + s / cs * .5) * Math.PI; ring.push([k[0] + Math.cos(a) * rc, k[1] + Math.sin(a) * rc, Math.cos(a), Math.sin(a)]); }
    });
    var L = ring.length, prof = [], ps = 12;
    for (var j = 0; j <= ps; j++) { var ph = -Math.PI / 2 + j / ps * Math.PI; prof.push([rb * (1 - Math.cos(ph)), rb * Math.sin(ph), Math.cos(ph), Math.sin(ph)]); }
    var base = m.n;
    for (var pj = 0; pj <= ps; pj++) for (var k = 0; k < L; k++) {
      var R = ring[k], P = prof[pj];
      m.vert([R[0] - R[2] * P[0], R[1] - R[3] * P[0], P[1]], [R[2] * P[2], R[3] * P[2], P[3]], .18);
    }
    for (var pj2 = 0; pj2 < ps; pj2++) for (var k2 = 0; k2 < L; k2++) {
      var a0 = base + pj2 * L + k2, a1 = base + pj2 * L + (k2 + 1) % L, b0 = a0 + L, b1 = a1 + L;
      m.i.push(a0, a1, b1, a0, b1, b0);
    }
    [1, -1].forEach(function (sg) {
      var c = m.vert([0, 0, sg * rb], [0, 0, sg], .5), f = m.n;
      for (var k3 = 0; k3 < L; k3++) { var R3 = ring[k3]; m.vert([R3[0] - R3[2] * rb, R3[1] - R3[3] * rb, sg * rb], [0, 0, sg], .5); }
      for (var q = 0; q < L; q++) { if (sg > 0) m.i.push(c, f + q, f + (q + 1) % L); else m.i.push(c, f + (q + 1) % L, f + q); }
    });
  }
  function sphere(m, c, r, rough) {
    var la = 7, lo = 12, b = m.n;
    for (var a = 0; a <= la; a++) { var th = a / la * Math.PI, st = Math.sin(th), ct = Math.cos(th);
      for (var o = 0; o <= lo; o++) { var ph = o / lo * Math.PI * 2, n = [st * Math.cos(ph), ct, st * Math.sin(ph)]; m.vert([c[0] + n[0] * r, c[1] + n[1] * r, c[2] + n[2] * r], n, rough); } }
    for (var a2 = 0; a2 < la; a2++) for (var o2 = 0; o2 < lo; o2++) { var p = b + a2 * (lo + 1) + o2, q = p + lo + 1; m.i.push(p, q, p + 1, p + 1, q, q + 1); }
  }
  /* a planar polyline run as a round tube (mitred rings, so no twisting) */
  function tube(m, pts, closed, r, rough) {
    var n = pts.length, seg = 10, b = m.n, rings = closed ? n : n;
    for (var k = 0; k < n; k++) {
      var p = pts[k], pa = pts[closed ? (k - 1 + n) % n : Math.max(0, k - 1)], pb = pts[closed ? (k + 1) % n : Math.min(n - 1, k + 1)];
      var d0 = norm2(p[0] - pa[0], p[1] - pa[1]), d1 = norm2(pb[0] - p[0], pb[1] - p[1]);
      if (!closed && k === 0) d0 = d1; if (!closed && k === n - 1) d1 = d0;
      var t = norm2(d0[0] + d1[0], d0[1] + d1[1]), side = [-t[1], t[0]], mit = 1 / Math.max(.6, d0[0] * t[0] + d0[1] * t[1]);
      for (var s = 0; s <= seg; s++) {
        var a = s / seg * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
        m.vert([p[0] + side[0] * ca * r * mit, p[1] + side[1] * ca * r * mit, sa * r], [side[0] * ca, side[1] * ca, sa], rough);
      }
    }
    var last = closed ? n : n - 1;
    for (var k2 = 0; k2 < last; k2++) {
      var r0 = b + k2 * (seg + 1), r1 = b + ((k2 + 1) % n) * (seg + 1);
      for (var s2 = 0; s2 < seg; s2++) m.i.push(r0 + s2, r1 + s2, r0 + s2 + 1, r0 + s2 + 1, r1 + s2, r1 + s2 + 1);
    }
  }
  function iconMesh(d) {
    var m = new Mesh(), S = .072, r = .056, rough = .1;
    parsePath(d).forEach(function (sp) {
      var raw = sp.pts.map(function (p) { return [(p[0] - 12) * S, (12 - p[1]) * S]; }), pts = [];
      raw.forEach(function (p) { var q = pts[pts.length - 1]; if (!q || Math.hypot(p[0] - q[0], p[1] - q[1]) > .05 * S) pts.push(p); });
      var closed = sp.closed;
      if (pts.length > 2 && Math.hypot(pts[0][0] - pts[pts.length - 1][0], pts[0][1] - pts[pts.length - 1][1]) < .2 * S) { pts.pop(); closed = true; }
      if (pts.length === 1 || (pts.length === 2 && Math.hypot(pts[0][0] - pts[1][0], pts[0][1] - pts[1][1]) < .3 * S)) { sphere(m, [pts[0][0], pts[0][1], 0], r * 1.15, rough); return; }
      if (pts.length < 2) return;
      if (pts.length < 3) closed = false;
      /* split at sharp corners; round joints there */
      var n = pts.length, sharp = [];
      for (var k = 0; k < n; k++) {
        if (!closed && (k === 0 || k === n - 1)) { sharp.push(true); continue; }
        var pa = pts[(k - 1 + n) % n], p = pts[k], pb = pts[(k + 1) % n], d0 = norm2(p[0] - pa[0], p[1] - pa[1]), d1 = norm2(pb[0] - p[0], pb[1] - p[1]);
        sharp.push(d0[0] * d1[0] + d0[1] * d1[1] < .82);
      }
      var corners = []; sharp.forEach(function (s, k) { if (s) corners.push(k); });
      if (!corners.length) { tube(m, pts, true, r, rough); return; }
      corners.forEach(function (k) { sphere(m, [pts[k][0], pts[k][1], 0], r, rough); });
      var cc = closed ? corners.length : corners.length - 1;
      for (var c = 0; c < cc; c++) {
        var a = corners[c], b = corners[(c + 1) % corners.length], run = [];
        for (var j = a, steps = 0; ; j = (j + 1) % n, steps++) { run.push(pts[j]); if (j === b && steps > 0) break; if (steps > n) break; }
        if (run.length >= 2) tube(m, run, false, r, rough);
      }
    });
    return m;
  }

  /* ---- matrices (column-major) ---- */
  function mul(a, b) { var o = new Array(16); for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3]; return o; }
  function persp(fovy, n, f) { var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f); return [t, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function rotX(a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  function trs(x, y, z, sx, sy, sz) { return [sx, 0, 0, 0, 0, sy, 0, 0, 0, 0, sz, 0, x, y, z, 1]; }

  var VS = 'attribute vec3 aP;attribute vec3 aN;attribute float aR;uniform mat4 uVP;uniform mat4 uM;uniform float uInfl;' +
    'varying vec3 vW;varying vec3 vN;varying float vR;' +
    'void main(){vec3 p=aP+aN*uInfl;vec4 w=uM*vec4(p,1.);vW=w.xyz;vN=mat3(uM)*aN;vR=aR;gl_Position=uVP*w;}';
  var FS = [
    'precision highp float;',
    'uniform float uMat,uAlpha,uGlint,uExpo;uniform vec3 uCam,uAcc,uMetal,uFloor,uSky;',
    'varying vec3 vW;varying vec3 vN;varying float vR;',
    'vec3 rrt(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}',
    'vec3 aces(vec3 c){c/=.6;c=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777)*c;c=rrt(c);',
    'c=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602)*c;return clamp(c,0.,1.);}',
    'vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,step(c,vec3(.0031308)));}',
    /* a photo studio around the object: soft key box, two tall strip lights, a horizon line and one small accent light low-left */
    'vec3 env(vec3 d,float r){',
    ' float w=mix(.015,.3,r);',
    ' vec3 c=mix(uFloor,uSky,smoothstep(-.5,.9,d.y));',
    ' float k=dot(d,normalize(vec3(.35,.78,.52)));c+=vec3(3.2)*smoothstep(1.-.09-w,1.-.015,k);',
    ' float az=atan(d.x,d.z);',
    ' float st=smoothstep(.75,.2,abs(d.y-.15));',
    ' c+=vec3(1.6)*exp(-pow((az+1.25)/(.07+w),2.))*st;',
    ' c+=vec3(.9)*exp(-pow((az-1.5)/(.06+w),2.))*st;',
    ' c+=vec3(1.2)*exp(-pow((abs(az)-2.8)/(.1+w),2.))*smoothstep(.1,.6,d.y);',
    ' c+=vec3(.28)*exp(-pow(d.y/(.035+w),2.));',
    ' c+=uAcc*(1.4+uGlint*2.4)*mix(1.,.18,r)*smoothstep(1.-.05-w*.25,1.,dot(d,normalize(vec3(-.78,-.42,.46))));',
    ' return c;}',
    'void main(){',
    ' if(uMat>1.5){gl_FragColor=vec4(0.,0.,0.,uAlpha);return;}',
    ' vec3 n=normalize(vN);if(!gl_FrontFacing)n=-n;vec3 V=normalize(uCam-vW);vec3 R=reflect(-V,n);float ndv=clamp(dot(n,V),0.,1.);',
    ' vec3 L=normalize(vec3(.35,.78,.52));float ndl=max(dot(n,L),0.);',
    ' vec3 col;',
    ' if(uMat>.5){',
    '  vec3 F=uMetal+(1.-uMetal)*pow(1.-ndv,5.);',
    '  col=env(R,vR)*F;',
    ' }else{',
    '  float F=.045+.955*pow(1.-ndv,5.);',
    '  vec3 base=vec3(.011,.011,.012)*(.35+ndl*1.6);',
    '  col=base+env(R,vR)*F*.95+vec3(1.)*pow(max(dot(R,L),0.),mix(900.,60.,vR))*F*3.;',
    ' }',
    ' gl_FragColor=vec4(srgb(aces(col*uExpo*(1.+uGlint*.12))),1.);',
    '}'].join('\n');

  /* SCR-19 · Skew Gallery — scrolling drives a row of polished 3D industry icons sideways; speed leans the row and twists the icons, which spring back to face you. */
  register('SCR-19', 'Skew Gallery', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr19__stage'), track = root.querySelector('.apx-scr19__track');
    if (!stage || !track) return;
    var tiles = [].slice.call(track.querySelectorAll('.apx-scr19__tile'));
    if (!tiles.length) return;
    var countEl = root.querySelector('.apx-scr19__count'), rail = root.querySelector('.apx-scr19__rail');
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var maxSkew = clamp(parseFloat(opt('skew', 'data-skew', '7')), 0, 14);
    var N = tiles.length, keys = Object.keys(ICONS);

    /* ---- DOM: meta row, 3D slot (with a flat fallback drawing) and the tile's own copy ---- */
    var restore = [];
    var T = tiles.map(function (b, i) {
      var html = b.innerHTML; restore.push(function () { b.innerHTML = html; b.classList.remove('is-hover'); });
      var ic = b.getAttribute('data-icon') || keys[i % keys.length];
      var d = /^[mM]\s*[-+.\d]/.test(ic.trim()) ? ic : (ICONS[ic] || ICONS[keys[i % keys.length]]);
      var tag = b.getAttribute('data-tag') || '', hi = b.hasAttribute('data-hi');
      var inner = D.createElement('span'); inner.className = 'apx-scr19__in';
      inner.innerHTML = '<span class="apx-scr19__meta"><span>' + (i < 9 ? '0' : '') + (i + 1) + '</span><span class="' + (hi ? 'is-hi' : '') + '">' + esc(tag) + '</span></span>' +
        '<span class="apx-scr19__slot"><span class="apx-scr19__fb" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="' + esc(d) + '"/></svg></span></span>';
      var copy = D.createElement('span'); copy.className = 'apx-scr19__copy';
      while (b.firstChild) copy.appendChild(b.firstChild);
      inner.appendChild(copy); b.appendChild(inner);
      return { b: b, li: b.closest('li') || b, slot: inner.querySelector('.apx-scr19__slot'), d: d, ox: 0, hov: 0, hx: 0, hy: 0, thx: 0, thy: 0, on: false, fl: -1, ry: 0, rx: 0 };
    });
    var railFill = null;
    if (rail) { railFill = D.createElement('b'); rail.appendChild(railFill); restore.push(function () { railFill.remove(); }); }
    var countHTML = countEl ? countEl.innerHTML : '';
    restore.push(function () { if (countEl) countEl.innerHTML = countHTML; track.style.transform = ''; root.style.height = ''; });

    /* ---- WebGL: one renderer for every icon ---- */
    var cv = D.createElement('canvas'); cv.className = 'apx-scr19__gl'; cv.setAttribute('aria-hidden', 'true');
    stage.appendChild(cv);
    api.add(function () { cv.remove(); restore.forEach(function (f) { f(); }); root.classList.remove('is-static', 'is-compact', 'is-fallback', 'is-light'); });
    var gl = null, prog = null, U = {}, A = {}, lost = false, u32 = null;
    try { gl = cv.getContext('webgl', { antialias: true, alpha: true, premultipliedAlpha: true, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    function fail() { gl = null; cv.remove(); root.classList.add('is-fallback'); }
    function compile() {
      function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('APX SCR-19 shader: ' + gl.getShaderInfoLog(x)); return x; }
      prog = gl.createProgram(); gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error('APX SCR-19 link');
      U = {}; ['uVP', 'uM', 'uInfl', 'uMat', 'uAlpha', 'uGlint', 'uExpo', 'uCam', 'uAcc', 'uMetal', 'uFloor', 'uSky'].forEach(function (n) { U[n] = gl.getUniformLocation(prog, n); });
      A = { p: gl.getAttribLocation(prog, 'aP'), n: gl.getAttribLocation(prog, 'aN'), r: gl.getAttribLocation(prog, 'aR') };
      u32 = gl.getExtension('OES_element_index_uint');
    }
    if (!gl) fail(); else { try { compile(); } catch (e) { fail(); } }

    var G = { slab: null, icons: [] };
    function upload(m) {
      var big = m.n > 65535; if (big && !u32) return null;
      var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(m.v), gl.STATIC_DRAW);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, big ? new Uint32Array(m.i) : new Uint16Array(m.i), gl.STATIC_DRAW);
      return { vb: vb, ib: ib, n: m.i.length, type: big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT };
    }
    function free() {
      if (!gl) return;
      [G.slab].concat(G.icons).forEach(function (b) { if (b) { gl.deleteBuffer(b.vb); gl.deleteBuffer(b.ib); } });
      G = { slab: null, icons: [] };
    }
    function build() {
      if (!gl) return; free();
      var sm = new Mesh(); slab(sm, 2.3, 2.3, .34, .42); G.slab = upload(sm);
      var cache = {};
      G.icons = T.map(function (t) { if (!cache[t.d]) cache[t.d] = upload(iconMesh(t.d)); return cache[t.d]; });
    }
    function bind(b) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b.vb); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.ib);
      gl.enableVertexAttribArray(A.p); gl.vertexAttribPointer(A.p, 3, gl.FLOAT, false, 28, 0);
      if (A.n >= 0) { gl.enableVertexAttribArray(A.n); gl.vertexAttribPointer(A.n, 3, gl.FLOAT, false, 28, 12); }
      if (A.r >= 0) { gl.enableVertexAttribArray(A.r); gl.vertexAttribPointer(A.r, 1, gl.FLOAT, false, 28, 24); }
    }

    /* ---- tokens ---- */
    var C = {};
    function lin(c) { return c.slice(0, 3).map(function (v) { return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); }
    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), acc = rgba(tok(root, '--apx-accent', '#cfd3da')), metal = rgba(tok(root, '--apx-scr19-metal', '#c4c7cc'));
      var light = lum(bg) > .5;
      C = { light: light, acc: lin(acc).map(function (v) { return v * .9; }), metal: lin(metal),
        floor: light ? [.03, .03, .032] : [.006, .006, .007], sky: light ? [.2, .2, .21] : [.1, .102, .108] };
      root.classList.toggle('is-light', light);
    }

    /* ---- layout ---- */
    var L = { sw: 1, sh: 1, dist: 0, dpr: 1, stageTop: 0 };
    function layout() {
      var sr = stage.getBoundingClientRect();
      L.sw = sr.width; L.sh = sr.height;
      T.forEach(function (t) { t.ox = t.li.offsetLeft; t.w = t.li.offsetWidth; });
      var lastT = T[N - 1], padL = T[0].ox;
      L.dist = Math.max(0, lastT.ox + lastT.w + padL - L.sw);
      if (!state.stat) root.style.height = Math.round(stage.offsetHeight + L.dist) + 'px'; else root.style.height = '';
      if (gl) {
        L.dpr = Math.min(W.devicePixelRatio || 1, isCompact() ? 1.5 : 1.75);
        var w = Math.max(2, Math.round(sr.width * L.dpr)), h = Math.max(2, Math.round(sr.height * L.dpr));
        if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      }
    }

    /* ---- render every visible icon into its own square of the one canvas ---- */
    var VIEW = trs(0, 0, -6.2, 1, 1, 1), CAM = [0, 0, 6.2], EXP = 1.4, FOV = 30 * Math.PI / 180;
    function render(now, skewDeg, spin, motion) {
      if (!gl || lost || !G.slab) return;
      var sr = stage.getBoundingClientRect(), dpr = L.dpr, H = cv.height;
      gl.viewport(0, 0, cv.width, H); gl.disable(gl.SCISSOR_TEST);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.SCISSOR_TEST); gl.enable(gl.DEPTH_TEST);
      gl.useProgram(prog);
      gl.uniform3fv(U.uCam, CAM); gl.uniform3fv(U.uAcc, C.acc); gl.uniform3fv(U.uMetal, C.metal); gl.uniform3fv(U.uFloor, C.floor); gl.uniform3fv(U.uSky, C.sky);
      gl.uniform1f(U.uExpo, C.light ? 1.08 : 1);
      var sk = -Math.tan(skewDeg * Math.PI / 180), fov = 2 * Math.atan(Math.tan(FOV / 2) * EXP), PR = persp(fov, .1, 50);
      var SH = [1, 0, 0, 0, sk, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1], VP = mul(mul(SH, PR), VIEW);
      gl.uniformMatrix4fv(U.uVP, false, VP);
      for (var i = 0; i < N; i++) {
        var t = T[i];
        var r = t.slot.getBoundingClientRect();
        if (r.right < sr.left - 40 || r.left > sr.right + 40 || r.width < 8) continue;
        var sz = Math.min(t.slot.offsetWidth, t.slot.offsetHeight) * EXP;
        var cx = (r.left + r.width / 2 - sr.left), cy = (r.top + r.height / 2 - sr.top);
        var vx = Math.round((cx - sz / 2) * dpr), vy = Math.round(H - (cy + sz / 2) * dpr), vs = Math.round(sz * dpr);
        gl.viewport(vx, vy, vs, vs);
        var sx0 = Math.max(0, vx), sy0 = Math.max(0, vy), sx1 = Math.min(cv.width, vx + vs), sy1 = Math.min(H, vy + vs);
        if (sx1 <= sx0 || sy1 <= sy0) continue;
        gl.scissor(sx0, sy0, sx1 - sx0, sy1 - sy0); gl.clear(gl.DEPTH_BUFFER_BIT);
        var center = (cx / L.sw) - .5;
        var fl = 0;
        if (t.fl >= 0) { var ft = clamp((now - t.fl) / 1.1, 0, 1); fl = (1 - Math.pow(1 - ft, 3)) * Math.PI * 2; if (ft >= 1) t.fl = -1; }
        var ry = -center * 1.1 + Math.sin(now * .7 + i) * .12 * motion + spin + t.hx * .55 * t.hov + fl;
        var rx = Math.sin(now * .5 + i * .6) * .1 * motion - .08 + t.hy * .35 * t.hov;
        var sc = 1 + .06 * t.hov;
        var M = mul(mul(rotY(ry), rotX(rx)), trs(0, 0, 0, sc, sc, sc));
        gl.uniform1f(U.uGlint, t.hov);
        /* matte black slab with a gloss edge */
        bind(G.slab); gl.uniformMatrix4fv(U.uM, false, M); gl.uniform1f(U.uInfl, 0); gl.uniform1f(U.uMat, 0);
        gl.drawElements(gl.TRIANGLES, G.slab.n, G.slab.type, 0);
        var ib = G.icons[i]; if (!ib) continue;
        bind(ib);
        /* soft contact shadow of the icon on the face (two flattened passes), then the chrome icon floating above */
        gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
        var lift = .24 + .05 * t.hov;
        var MS = mul(M, trs(.035 + .02 * t.hov, -.05 - .03 * t.hov, .176, 1, 1, .001));
        gl.uniformMatrix4fv(U.uM, false, MS); gl.uniform1f(U.uMat, 2);
        gl.uniform1f(U.uInfl, .05); gl.uniform1f(U.uAlpha, .22); gl.drawElements(gl.TRIANGLES, ib.n, ib.type, 0);
        gl.uniform1f(U.uInfl, .015); gl.uniform1f(U.uAlpha, .38); gl.drawElements(gl.TRIANGLES, ib.n, ib.type, 0);
        gl.disable(gl.BLEND); gl.depthMask(true);
        gl.uniformMatrix4fv(U.uM, false, mul(M, trs(0, 0, lift, 1, 1, 1))); gl.uniform1f(U.uInfl, 0); gl.uniform1f(U.uMat, 1);
        gl.drawElements(gl.TRIANGLES, ib.n, ib.type, 0);
      }
      gl.disable(gl.SCISSOR_TEST);
    }

    /* ---- scroll: progress drives the row, speed leans it and twists the icons ---- */
    var state = { ps: -1, x: 0, lastPx: null, v: 0, skew: 0, spin: 0, motion: 1, stat: false, count: -1, railS: -1 };
    function rawProgress() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight, len = r.height - vh;
      return len > 1 ? clamp(-r.top / len, 0, 1) : 0;
    }
    function paintDom(p) {
      var x = -p * L.dist;
      track.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0) skewX(' + state.skew.toFixed(3) + 'deg)';
      var c = Math.min(N, 1 + Math.round(p * (N - 1)));
      if (c !== state.count && countEl) { state.count = c; countEl.innerHTML = '<b>' + (c < 10 ? '0' : '') + c + '</b> / ' + (N < 10 ? '0' : '') + N; }
      if (railFill && Math.abs(p - state.railS) > .0005) { state.railS = p; railFill.style.transform = 'scaleX(' + p.toFixed(4) + ')'; }
    }
    var loop = ambient(root, api, function (now, dt) {
      var rp = rawProgress();
      if (state.ps < 0) state.ps = rp; else state.ps += (rp - state.ps) * (1 - Math.exp(-dt * 8));
      if (Math.abs(rp - state.ps) < .00005) state.ps = rp;
      var px = state.ps * L.dist, inst = state.lastPx === null ? 0 : (px - state.lastPx) / Math.max(dt, .001); state.lastPx = px;
      state.v += (inst - state.v) * (1 - Math.exp(-dt * 10));
      var m = state.motion;
      state.skew += (clamp(-state.v / 260, -maxSkew, maxSkew) * m - state.skew) * (1 - Math.exp(-dt * 7));
      state.spin += (clamp(state.v * -.00012, -.6, .6) * m - state.spin) * (1 - Math.exp(-dt * 6));
      if (Math.abs(state.skew) < .002) state.skew = 0;
      T.forEach(function (t) {
        var k = 1 - Math.exp(-dt * 7);
        t.hov += ((t.on ? 1 : 0) - t.hov) * k; t.hx += (t.thx - t.hx) * k; t.hy += (t.thy - t.hy) * k;
      });
      paintDom(state.ps);
      render(now, state.skew, state.spin, m);
    });

    /* ---- hover, focus and tap ---- */
    var hoverOK = W.matchMedia('(hover: hover)');
    T.forEach(function (t, i) {
      api.on(t.b, 'pointerenter', function (e) { if (e.pointerType !== 'touch' && hoverOK.matches) { t.on = true; t.b.classList.add('is-hover'); } });
      api.on(t.b, 'pointermove', function (e) {
        if (e.pointerType === 'touch') return;
        var r = t.slot.getBoundingClientRect(); t.thx = clamp((e.clientX - r.left) / r.width - .5, -.6, .6); t.thy = clamp((e.clientY - r.top) / r.height - .5, -.6, .6);
      });
      api.on(t.b, 'pointerleave', function () { t.on = false; t.thx = t.thy = 0; t.b.classList.remove('is-hover'); });
      api.on(t.b, 'focus', function () { t.on = true; if (state.stat) redraw(); });
      api.on(t.b, 'blur', function () { t.on = false; if (state.stat) redraw(); });
      api.on(t.b, 'click', function () {
        if (state.motion) t.fl = performance.now() / 1000;
        var copy = t.b.querySelector('.apx-scr19__copy b');
        root.dispatchEvent(new CustomEvent('apx:select', { bubbles: true, detail: { code: 'SCR-19', index: i, name: copy ? copy.textContent.trim() : '', icon: t.b.getAttribute('data-icon') || '' } }));
      });
    });

    /* ---- still mode: redraw only when the row is moved by hand ---- */
    var rraf = 0;
    function redraw() {
      if (rraf) return;
      rraf = requestAnimationFrame(function () { rraf = 0; T.forEach(function (t) { t.hov = t.on ? 1 : 0; t.hx = t.hy = 0; }); render(0, 0, 0, 0); });
    }
    api.on(track, 'scroll', function () { if (state.stat) { redraw(); var mx = track.scrollWidth - track.clientWidth; if (railFill) railFill.style.transform = 'scaleX(' + (mx > 0 ? track.scrollLeft / mx : 0).toFixed(4) + ')'; } }, { passive: true });
    api.add(function () { if (rraf) cancelAnimationFrame(rraf); });

    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      api.on(cv, 'webglcontextrestored', function () { lost = false; try { compile(); build(); } catch (er) { fail(); } setup(); });
      api.add(function () { free(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    var ro = new ResizeObserver(function () { layout(); state.lastPx = null; if (state.stat) redraw(); });
    ro.observe(stage); ro.observe(track); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.SCR19) return; layout(); if (state.stat) redraw(); });

    var built = false;
    function setup() {
      var m = motionOf(root);
      state.motion = m; state.stat = m === 0; state.ps = -1; state.lastPx = null; state.v = state.skew = state.spin = 0; state.count = -1; state.railS = -1;
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-compact', isCompact());
      readTokens();
      if (gl && !built) { build(); built = true; }
      layout();
      if (state.stat) {
        loop.stop(); track.style.transform = '';
        if (countEl) countEl.innerHTML = '<b>' + (N < 10 ? '0' : '') + N + '</b> ' + (countEl.getAttribute('data-static-label') || 'industries');
        if (railFill) railFill.style.transform = 'scaleX(0)';
        redraw();
      } else { paintDom(rawProgress()); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

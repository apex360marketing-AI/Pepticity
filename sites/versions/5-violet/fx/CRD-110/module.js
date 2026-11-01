/*! APEX library CRD-110 · Prism Facets — self-contained glass card, token-driven. window.APX.CRD110.mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX card kit (inlined per module; the only global is window.APX) ---- */
  var W = window, D = document, NS = 'http://www.w3.org/2000/svg';
  var APX = W.APX = W.APX || {};
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  var FINE = W.matchMedia('(hover: hover) and (pointer: fine)');
  var UID = 0;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function f2(n) { return Math.round(n * 100) / 100; }
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(getComputedStyle(el).getPropertyValue('--apx-motion'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
  /* rounded polygon -> SVG path string (also valid for CSS clip-path: path()) */
  function rpoly(pts, r) {
    var n = pts.length, d = '';
    for (var i = 0; i < n; i++) {
      var p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n];
      var rr = Array.isArray(r) ? r[i] : r;
      var v1x = p0[0] - p1[0], v1y = p0[1] - p1[1], v2x = p2[0] - p1[0], v2y = p2[1] - p1[1];
      var l1 = Math.hypot(v1x, v1y) || 1, l2 = Math.hypot(v2x, v2y) || 1;
      var t = Math.min(rr, l1 / 2, l2 / 2);
      var ax = p1[0] + v1x / l1 * t, ay = p1[1] + v1y / l1 * t, bx = p1[0] + v2x / l2 * t, by = p1[1] + v2y / l2 * t;
      d += (i ? 'L' : 'M') + f2(ax) + ' ' + f2(ay) + (t > 0 ? 'Q' + f2(p1[0]) + ' ' + f2(p1[1]) + ' ' + f2(bx) + ' ' + f2(by) : '');
    }
    return d + 'Z';
  }
  function kit(root) {
    var c = [], styled = [];
    var k = {
      root: root, uid: 'apx' + (++UID), rpoly: rpoly, clamp: clamp, f2: f2,
      motion: function () { return motionOf(root); },
      fine: function () { return FINE.matches; },
      on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); c.push(function () { t.removeEventListener(ev, fn, o); }); },
      add: function (fn) { c.push(fn); },
      /* decorative layer, removed on destroy; first=true inserts before existing children */
      el: function (tag, cls, parent, first, html) {
        var p = parent || root, n = D.createElement(tag);
        if (cls) n.className = cls;
        n.setAttribute('aria-hidden', 'true'); n.setAttribute('data-apx-fx', '');
        if (html) n.innerHTML = html;
        p.insertBefore(n, first ? p.firstChild : null);
        c.push(function () { n.remove(); });
        return n;
      },
      svg: function (cls, parent, first, vb) {
        var p = parent || root, s = D.createElementNS(NS, 'svg');
        s.setAttribute('class', cls); s.setAttribute('aria-hidden', 'true'); s.setAttribute('focusable', 'false'); s.setAttribute('data-apx-fx', '');
        if (vb) s.setAttribute('viewBox', vb);
        p.insertBefore(s, first ? p.firstChild : null);
        c.push(function () { s.remove(); });
        return s;
      },
      node: function (tag, attrs, parent) {
        var n = D.createElementNS(NS, tag);
        for (var a in attrs) n.setAttribute(a, attrs[a]);
        if (parent) parent.appendChild(n);
        return n;
      },
      cls: function (el, name) { if (el.classList.contains(name)) return; el.classList.add(name); c.push(function () { el.classList.remove(name); }); },
      css: function (el, prop, val) {
        if (styled.indexOf(el) < 0) { styled.push(el); var orig = el.getAttribute('style'); c.push(function () { if (orig === null) el.removeAttribute('style'); else el.setAttribute('style', orig); }); }
        el.style.setProperty(prop, val);
      },
      /* shape an element with an SVG mask (a clip-path would let some browsers' frosted blur leak outside the shape) */
      clip: function (el, d, evenodd, w, h) {
        w = w || el.offsetWidth || 1; h = h || el.offsetHeight || 1;
        var url = 'url("data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '"><path fill="#000"' + (evenodd ? ' fill-rule="evenodd"' : '') + ' d="' + d + '"/></svg>') + '")';
        k.css(el, '-webkit-mask', url + ' 0 0/100% 100% no-repeat'); k.css(el, 'mask', url + ' 0 0/100% 100% no-repeat');
      },
      /* call fn(w,h) now and whenever the box changes size */
      size: function (box, fn) {
        var raf = 0, lw = -1, lh = -1;
        function run() { raf = 0; var w = box.offsetWidth, h = box.offsetHeight; if (!w || !h || (w === lw && h === lh)) return; lw = w; lh = h; fn(w, h); }
        run();
        if (W.ResizeObserver) { var ro = new ResizeObserver(function () { if (!raf) raf = requestAnimationFrame(run); }); ro.observe(box); c.push(function () { ro.disconnect(); cancelAnimationFrame(raf); }); }
      },
      /* rAF-coalesced pointer reads relative to target */
      pointer: function (target, cb) {
        var raf = 0, last = null;
        function flush() { raf = 0; if (last) cb(last); }
        function ev(e, inside) {
          var r = target.getBoundingClientRect();
          last = { u: clamp((e.clientX - r.left) / r.width, 0, 1), v: clamp((e.clientY - r.top) / r.height, 0, 1), x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height, inside: inside, type: e.pointerType || 'mouse' };
          if (!raf) raf = requestAnimationFrame(flush);
        }
        k.on(target, 'pointermove', function (e) { ev(e, true); }, { passive: true });
        k.on(target, 'pointerenter', function (e) { ev(e, true); }, { passive: true });
        k.on(target, 'pointerleave', function (e) { ev(e, false); }, { passive: true });
        k.add(function () { cancelAnimationFrame(raf); });
      },
      /* smoothed tilt + sheen variables (--_u, --_v 0..1, --_h hover 0..1, --_x/--_y -1..1) */
      tilt: function (target, opt) {
        opt = opt || {};
        var max = opt.max == null ? 8 : opt.max, mover = opt.el || root, lerp = opt.lerp || 0.14;
        var cur = { x: 0, y: 0, u: .5, v: .5, h: 0 }, tgt = { x: 0, y: 0, u: .5, v: .5, h: 0 }, raf = 0;
        function step() {
          raf = 0; var m = k.motion(), live = false;
          for (var key in tgt) { var dlt = tgt[key] - cur[key]; cur[key] = Math.abs(dlt) < 0.0015 ? tgt[key] : cur[key] + dlt * (m ? lerp : 1); if (cur[key] !== tgt[key]) live = true; }
          if (max) mover.style.transform = m ? 'perspective(' + (opt.persp || 1000) + 'px) rotateX(' + f2(-cur.y * max * m) + 'deg) rotateY(' + f2(cur.x * max * m) + 'deg)' : '';
          var s = root.style; s.setProperty('--_u', cur.u.toFixed(3)); s.setProperty('--_v', cur.v.toFixed(3)); s.setProperty('--_h', cur.h.toFixed(3)); s.setProperty('--_x', cur.x.toFixed(3)); s.setProperty('--_y', cur.y.toFixed(3));
          if (opt.frame) opt.frame(cur, m);
          if (live) raf = requestAnimationFrame(step);
        }
        function kick() { if (!raf) raf = requestAnimationFrame(step); }
        k.pointer(target, function (p) {
          if (p.type === 'touch') return;
          tgt.u = p.inside ? p.u : .5; tgt.v = p.inside ? p.v : .5;
          tgt.x = p.inside ? (p.u - .5) * 2 : 0; tgt.y = p.inside ? (p.v - .5) * 2 : 0; tgt.h = p.inside ? 1 : 0; kick();
        });
        k.on(target, 'focusin', function () { tgt.h = 1; kick(); });
        k.on(target, 'focusout', function () { if (!target.matches(':hover')) { tgt.h = 0; kick(); } });
        k.add(function () { cancelAnimationFrame(raf); mover.style.removeProperty('transform'); ['--_u', '--_v', '--_h', '--_x', '--_y'].forEach(function (p) { root.style.removeProperty(p); }); });
        return { set: function (o) { for (var key in o) tgt[key] = o[key]; kick(); }, cur: cur };
      },
      /* two-phase flip (no preserve-3d, so the glass keeps blurring the page behind it) */
      flip: function (el, axis, mid) {
        var m = k.motion(); axis = axis || 'Y';
        if (!m || !el.animate) { mid(); return; }
        var d = 260 / Math.max(m, .35), p = 'perspective(1100px) rotate' + axis;
        var a = el.animate([{ transform: p + '(0deg)' }, { transform: p + '(90deg)' }], { duration: d, easing: 'cubic-bezier(.7,0,.84,0)' });
        a.onfinish = function () { mid(); el.animate([{ transform: p + '(-90deg)' }, { transform: p + '(0deg)' }], { duration: d * 1.35, easing: 'cubic-bezier(.16,1,.3,1)' }); };
      },
      /* tap (touch/pen) toggles a hover-like class, since there is no hover */
      tapHover: function (target, name) {
        k.on(target, 'pointerup', function (e) { if (e.pointerType !== 'mouse' && !e.target.closest('button,a,input,select,textarea')) target.classList.toggle(name); });
        k.add(function () { target.classList.remove(name); });
      },
      cleanup: function () { c.splice(0).reverse().forEach(function (f) { try { f(); } catch (e) {} }); }
    };
    return k;
  }
  function register(code, name, sel, setup) {
    var key = code.replace('-', '');
    function mountOne(el, opts) {
      el.__apx = el.__apx || {};
      if (el.__apx[key]) return el.__apx[key];
      var k = kit(el);
      var destroy = function () { k.cleanup(); delete el.__apx[key]; el.removeAttribute('data-apx-mounted'); };
      el.__apx[key] = destroy;
      try { var r = setup(el, opts || {}, k); if (typeof r === 'function') k.add(r); } catch (e) { if (W.console) console.error(code, e); }
      el.setAttribute('data-apx-mounted', '');
      k.on(el, 'apx:tokens', function () { if (k.retoken) k.retoken(); });
      k.on(W, 'apx:tokens', function () { if (k.retoken) k.retoken(); });
      return destroy;
    }
    function mount(root, opts) {
      if (!root || root.nodeType !== 1) return function () {};
      if (root.matches(sel)) return mountOne(root, opts);
      root.__apx = root.__apx || {};
      if (root.__apx[key + '*']) return root.__apx[key + '*'];
      var ds = [].map.call(root.querySelectorAll(sel), function (n) { return mountOne(n, opts); });
      var d = function () { ds.forEach(function (f) { f(); }); delete root.__apx[key + '*']; };
      root.__apx[key + '*'] = d;
      return d;
    }
    APX[key] = APX[code] = { code: code, name: name, mount: mount };
    function auto() { D.querySelectorAll('[data-apx="' + code + '"]:not([data-apx-manual])').forEach(function (n) { mount(n); }); }
    if (!W.APX_NO_AUTOMOUNT) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto); else auto(); }
  }

  register('CRD-110', 'Prism Facets', '.apx-c110', function (root, o, k) {
    var glass = k.el('span', 'apx-c110__glass', root, true);
    var fx = k.svg('apx-c110__fx', glass), edge = k.svg('apx-c110__edge', root), beam = k.el('span', 'apx-c110__beam', root, true);
    void beam;
    var facets = [], W = 0, H = 0, la = -2.2;
    function paint() {
      facets.forEach(function (f) { var c = Math.cos(f.a - la); f.el.style.opacity = (0.015 + Math.pow(Math.max(0, c), 3) * 0.2).toFixed(3); });
    }
    k.size(root, function (w, h) {
      W = w; H = h;
      var P = [[w * .2, 0], [w * .8, 0], [w, h * .17], [w * .9, h], [w * .1, h], [0, h * .17]];
      var g1 = [w * .33, h * .17], g2 = [w * .67, h * .17], tm = [w * .5, 0], B = [w * .5, h * 1.06];
      var d = k.rpoly(P, 4); k.clip(glass, d, false, w, h);
      [fx, edge].forEach(function (s) { s.setAttribute('viewBox', '0 0 ' + w + ' ' + h); });
      var tris = [[P[0], tm, g1], [tm, P[1], g2], [tm, g2, g1], [P[5], P[0], g1], [P[1], P[2], g2], [P[5], g1, B], [g1, g2, B], [g2, P[2], B], [P[2], P[3], B], [P[4], P[5], B]];
      fx.innerHTML = ''; facets = [];
      tris.forEach(function (t, i) {
        var poly = k.node('polygon', { 'class': 'ft', points: t.map(function (p) { return k.f2(p[0]) + ',' + k.f2(Math.min(p[1], h)) ; }).join(' ') }, fx);
        var cx = (t[0][0] + t[1][0] + t[2][0]) / 3 - w / 2, cy = (t[0][1] + t[1][1] + t[2][1]) / 3 - h * .3;
        facets.push({ el: poly, a: Math.atan2(cy, cx) + i * .35 });
      });
      var f = function (p) { return k.f2(p[0]) + ' ' + k.f2(p[1]); };
      var lines = 'M' + f(P[5]) + 'L' + f(P[2]) + 'M' + f(P[0]) + 'L' + f(g1) + 'L' + f(tm) + 'L' + f(g2) + 'L' + f(P[1]);
      k.node('path', { 'class': 'ln', d: lines, 'stroke-width': '.8' }, fx);
      k.node('path', { 'class': 'ln', d: 'M' + f(g1) + 'L' + f([w * .5, h]) + 'L' + f(g2) + 'M' + f(P[5]) + 'L' + f([w * .5, h]) + 'L' + f(P[2]), 'stroke-width': '.6', style: 'stroke-opacity:.09' }, fx);
      edge.innerHTML = '<path d="' + d + '" fill="none" stroke="rgb(255 140 165)" stroke-opacity=".5" stroke-width="1" transform="translate(-1 0)"/><path d="' + d + '" fill="none" stroke="rgb(150 205 255)" stroke-opacity=".55" stroke-width="1" transform="translate(1 0)"/><path d="' + d + '" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1"/>';
      paint();
    });
    var t0 = performance.now(), raf = 0, idle = true;
    function amb(now) { raf = 0; if (!idle || document.hidden) return; var m = k.motion(); if (!m) return; la = -2.2 + Math.sin((now - t0) / 1000 * .5 * m) * 1.6; paint(); raf = requestAnimationFrame(amb); }
    function startAmb() { if (!raf) raf = requestAnimationFrame(amb); }
    k.add(function () { cancelAnimationFrame(raf); });
    k.on(document, 'visibilitychange', startAmb);
    k.retoken = startAmb;
    k.tilt(root, { max: 7, frame: function (c) { if (c.h > .02) { idle = false; la = Math.atan2(c.y, c.x || .001); paint(); } else if (!idle) { idle = true; startAmb(); } } });
    startAmb();
  });
})();

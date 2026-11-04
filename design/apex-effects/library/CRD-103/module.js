/*! APEX library CRD-103 · Dog-Ear Chrome — self-contained glass card, token-driven. window.APX.CRD103.mount(root) -> destroy() */
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

  register('CRD-103', 'Dog-Ear Chrome', '.apx-c103', function (root, o, k) {
    var glass = k.el('span', 'apx-c103__glass', root, true);
    k.el('span', 'apx-c103__sheen', glass);
    var id = k.uid, rim = k.svg('apx-c103__rim', root), flap = k.el('span', 'apx-c103__flap', root);
    rim.innerHTML = '<defs><linearGradient id="' + id + 'g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".85"/><stop offset=".55" stop-color="currentColor" stop-opacity=".18"/><stop offset="1" stop-color="#fff" stop-opacity=".4"/></linearGradient></defs><path fill="none" stroke="url(#' + id + 'g)" stroke-width="1.2"/>';
    var rp = rim.querySelector('path'), W0 = 0, H0 = 0, F = 46, FT = 46, fr = 0;
    function shape() {
      var w = W0, h = H0, R = 18;
      var d = 'M' + R + ' 0L' + k.f2(w - F) + ' 0L' + w + ' ' + k.f2(F) + 'L' + w + ' ' + (h - R) + 'Q' + w + ' ' + h + ' ' + (w - R) + ' ' + h + 'L' + R + ' ' + h + 'Q0 ' + h + ' 0 ' + (h - R) + 'L0 ' + R + 'Q0 0 ' + R + ' 0Z';
      k.clip(glass, d); rp.setAttribute('d', d + 'M' + k.f2(w - F) + ' 0L' + k.f2(w - F) + ' ' + k.f2(F) + 'L' + w + ' ' + k.f2(F));
      root.style.setProperty('--_f', (F / 70).toFixed(3));
    }
    function foldLoop() { fr = 0; var m = k.motion(); F += (FT - F) * (m ? .16 : 1); if (Math.abs(FT - F) < .2) F = FT; shape(); if (F !== FT) fr = requestAnimationFrame(foldLoop); }
    function fold(t) { FT = t; if (!fr) fr = requestAnimationFrame(foldLoop); }
    k.add(function () { cancelAnimationFrame(fr); root.style.removeProperty('--_f'); });
    k.size(root, function (w, h) { W0 = w; H0 = h; rim.setAttribute('viewBox', '0 0 ' + w + ' ' + h); shape(); });
    k.on(root, 'pointerenter', function (e) { if (e.pointerType === 'mouse') fold(66); });
    k.on(root, 'pointerleave', function () { fold(46); });
    k.on(root, 'focusin', function () { fold(66); });
    k.on(root, 'focusout', function () { fold(46); });
    var hov = 0;
    var tl = k.tilt(root, { max: 4, frame: function (c) { hov = c.h; } });

    /* ---------- real 3D chrome icon: one shared WebGL renderer per page draws every card's icon ---------- */
    var cv = root.querySelector('.apx-c103__icon');
    if (!cv) return;
    var ICONS = {
      roof: [[2, 11.4], [12, 3], [16, 6.3], [16, 3.6], [19, 3.6], [19, 8.8], [22, 11.4], [20, 11.4], [20, 21], [14, 21], [14, 15], [10, 15], [10, 21], [4, 21], [4, 11.4]],
      bolt: [[13.6, 1.8], [4.4, 13.6], [11, 13.6], [9.4, 22.2], [19.6, 9.6], [13, 9.6], [15.2, 1.8]],
      drop: (function () { var p = [[12, 1.6]]; for (var a = -30; a <= 210; a += 10) { var r = a * Math.PI / 180; p.push([12 + 6.6 * Math.cos(r), 15.2 + 6.6 * Math.sin(r)]); } return p; })()
    };
    var key = (root.getAttribute('data-icon') || 'roof').toLowerCase(); if (!ICONS[key]) key = 'roof';
    function rgb(str) { var c = document.createElement('canvas').getContext('2d'); c.fillStyle = '#9fcbe8'; c.fillStyle = str; var v = c.fillStyle, m = /^#([0-9a-f]{6})$/i.exec(v); if (m) { var n = parseInt(m[1], 16); return [(n >> 16) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; } var q = v.match(/[\d.]+/g) || [160, 200, 230]; return [q[0] / 255, q[1] / 255, q[2] / 255]; }
    var accent = rgb(getComputedStyle(root).getPropertyValue('--apx-accent').trim() || '#a3cdea');
    k.retoken = function () { accent = rgb(getComputedStyle(root).getPropertyValue('--apx-accent').trim() || '#a3cdea'); draw(); };
    function fallback() {
      var pts = ICONS[key].map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
      var holder = k.el('span', 'apx-c103__icon', cv.parentNode, false, '<svg viewBox="0 0 24 24"><defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset=".45" stop-color="#8d96a3"/><stop offset=".52" stop-color="#2a2f37"/><stop offset="1" stop-color="#cfd6df"/></linearGradient></defs><polygon points="' + pts + '" fill="url(#' + id + 'c)" stroke="#fff" stroke-opacity=".6" stroke-width=".3"/></svg>');
      k.css(cv, 'display', 'none'); return holder;
    }
    var R = APX.__crd103gl;
    if (!R) {
      R = APX.__crd103gl = (function () {
        var c = document.createElement('canvas'), gl = null;
        try { gl = c.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, preserveDrawingBuffer: true }); } catch (e) { gl = null; }
        if (!gl) return { ok: false };
        function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); return x; }
        var pr = gl.createProgram();
        gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec3 p;attribute vec3 n;uniform mat4 uM;uniform mat3 uR;uniform mat4 uP;varying vec3 vN;varying vec3 vV;void main(){vec4 w=uM*vec4(p,1.);vN=uR*n;vV=w.xyz;gl_Position=uP*w;}'));
        gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, 'precision mediump float;varying vec3 vN;varying vec3 vV;uniform vec3 uA;uniform float uHi;' +
          'vec3 env(vec3 r){float y=r.y;vec3 c=mix(vec3(.03,.034,.042),vec3(.5,.53,.57),smoothstep(-.1,.5,y));c+=vec3(1.)*smoothstep(.5,.92,y)*.95;' +
          'c+=vec3(1.)*smoothstep(.035,.0,abs(y-.16))*.6;c+=vec3(.95)*smoothstep(.7,.98,r.x)*smoothstep(-.4,.5,y)*.85;c+=vec3(.6)*smoothstep(.75,.98,-r.x)*smoothstep(.1,.6,y)*.5;' +
          'c+=vec3(.62)*smoothstep(.15,1.,r.z)*(.55+.45*smoothstep(-.4,.7,r.y+r.x*.6));c=mix(c,uA*.9,smoothstep(-.12,-.7,y));return c;}' +
          'void main(){vec3 N=normalize(vN);vec3 V=normalize(-vV);vec3 R=reflect(-V,N);vec3 col=env(R)*vec3(.93,.95,.98);float fr=pow(1.-clamp(dot(N,V),0.,1.),3.);col+=uA*fr*(.35+.55*uHi);gl_FragColor=vec4(col,1.);}'));
        gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) return { ok: false };
        var L = { p: gl.getAttribLocation(pr, 'p'), n: gl.getAttribLocation(pr, 'n'), M: gl.getUniformLocation(pr, 'uM'), Rm: gl.getUniformLocation(pr, 'uR'), P: gl.getUniformLocation(pr, 'uP'), A: gl.getUniformLocation(pr, 'uA'), Hi: gl.getUniformLocation(pr, 'uHi') };
        var meshes = {};
        function earcut(P) {
          var idx = P.map(function (_, i) { return i; }), out = [], guard = 0;
          function cr(o, a, b) { return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]); }
          while (idx.length > 3 && guard++ < 2000) {
            var found = false;
            for (var i = 0; i < idx.length; i++) {
              var i0 = idx[(i - 1 + idx.length) % idx.length], i1 = idx[i], i2 = idx[(i + 1) % idx.length], a = P[i0], b = P[i1], cc = P[i2];
              if (cr(a, b, cc) <= 1e-9) continue;
              var ok = true;
              for (var j = 0; j < idx.length; j++) { var q = idx[j]; if (q === i0 || q === i1 || q === i2) continue; var pt = P[q]; if (cr(a, b, pt) > 1e-9 && cr(b, cc, pt) > 1e-9 && cr(cc, a, pt) > 1e-9) { ok = false; break; } }
              if (ok) { out.push([i0, i1, i2]); idx.splice(i, 1); found = true; break; }
            }
            if (!found) break;
          }
          if (idx.length === 3) out.push(idx.slice());
          return out;
        }
        function offset(P, d) {
          var n = P.length;
          return P.map(function (p, i) {
            var a = P[(i - 1 + n) % n], b = P[(i + 1) % n], e1 = [p[0] - a[0], p[1] - a[1]], e2 = [b[0] - p[0], b[1] - p[1]], l1 = Math.hypot(e1[0], e1[1]) || 1, l2 = Math.hypot(e2[0], e2[1]) || 1;
            var n1 = [-e1[1] / l1, e1[0] / l1], n2 = [-e2[1] / l2, e2[0] / l2], m = [n1[0] + n2[0], n1[1] + n2[1]], ml = Math.hypot(m[0], m[1]) || 1; m = [m[0] / ml, m[1] / ml];
            var s = d / Math.max(m[0] * n1[0] + m[1] * n1[1], .4); return [p[0] + m[0] * s, p[1] + m[1] * s];
          });
        }
        function mesh(name, pts) {
          if (meshes[name]) return meshes[name];
          var P = pts.map(function (p) { return [(p[0] - 12) / 10, -(p[1] - 12) / 10]; }), A = 0;
          for (var i = 0; i < P.length; i++) { var a = P[i], b = P[(i + 1) % P.length]; A += a[0] * b[1] - b[0] * a[1]; }
          if (A < 0) P.reverse();
          var tris = earcut(P), ins = offset(P, .075), D1 = .2, B = .075, pos = [], nor = [];
          function tri(a, b, c) {
            var ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
            var nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, l = Math.hypot(nx, ny, nz) || 1;
            [a, b, c].forEach(function (p) { pos.push(p[0], p[1], p[2]); nor.push(nx / l, ny / l, nz / l); });
          }
          tris.forEach(function (t) { var a = ins[t[0]], b = ins[t[1]], c = ins[t[2]]; tri([a[0], a[1], D1], [b[0], b[1], D1], [c[0], c[1], D1]); tri([a[0], a[1], -D1], [c[0], c[1], -D1], [b[0], b[1], -D1]); });
          var rings = [[ins, D1], [P, D1 - B], [P, -(D1 - B)], [ins, -D1]];
          for (var r = 0; r < 3; r++) for (var i2 = 0; i2 < P.length; i2++) {
            var j2 = (i2 + 1) % P.length, R0 = rings[r], R1 = rings[r + 1];
            var qa = [R0[0][i2][0], R0[0][i2][1], R0[1]], qb = [R0[0][j2][0], R0[0][j2][1], R0[1]], qc = [R1[0][j2][0], R1[0][j2][1], R1[1]], qd = [R1[0][i2][0], R1[0][i2][1], R1[1]];
            tri(qa, qd, qc); tri(qa, qc, qb);
          }
          var bp = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bp); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(pos), gl.STATIC_DRAW);
          var bn = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bn); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(nor), gl.STATIC_DRAW);
          return (meshes[name] = { bp: bp, bn: bn, n: pos.length / 3 });
        }
        function draw(ctx, name, pts, rx, ry, hi, acc, w, h) {
          if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
          var me = mesh(name, pts);
          gl.viewport(0, 0, w, h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.enable(gl.DEPTH_TEST);
          gl.useProgram(pr);
          var cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry);
          var r3 = [cy, sx * sy, -cx * sy, 0, cx, sx, sy, -sx * cy, cx * cy];
          var M = [r3[0], r3[1], r3[2], 0, r3[3], r3[4], r3[5], 0, r3[6], r3[7], r3[8], 0, 0, 0, -3.1, 1];
          var f = 1 / Math.tan(0.36), nr = .1, fa = 20, Pm = [f, 0, 0, 0, 0, f, 0, 0, 0, 0, (fa + nr) / (nr - fa), -1, 0, 0, 2 * fa * nr / (nr - fa), 0];
          gl.uniformMatrix4fv(L.M, false, new Float32Array(M)); gl.uniformMatrix3fv(L.Rm, false, new Float32Array(r3)); gl.uniformMatrix4fv(L.P, false, new Float32Array(Pm));
          gl.uniform3f(L.A, acc[0], acc[1], acc[2]); gl.uniform1f(L.Hi, hi);
          gl.bindBuffer(gl.ARRAY_BUFFER, me.bp); gl.enableVertexAttribArray(L.p); gl.vertexAttribPointer(L.p, 3, gl.FLOAT, false, 0, 0);
          gl.bindBuffer(gl.ARRAY_BUFFER, me.bn); gl.enableVertexAttribArray(L.n); gl.vertexAttribPointer(L.n, 3, gl.FLOAT, false, 0, 0);
          gl.drawArrays(gl.TRIANGLES, 0, me.n);
          ctx.clearRect(0, 0, w, h); ctx.drawImage(c, 0, 0);
        }
        return { ok: true, draw: draw, gl: gl };
      })();
    }
    if (!R.ok) { fallback(); return; }
    var ctx = cv.getContext('2d'), t0 = performance.now(), raf = 0, vis = true, sc = 0;
    function draw(now) {
      var r = cv.getBoundingClientRect(), dpr = Math.min(window.devicePixelRatio || 1, 2);
      var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      var m = k.motion(), t = ((now || performance.now()) - t0) / 1000, cur = tl.cur;
      var vh = window.innerHeight || 800; sc = k.clamp(((r.top + r.height / 2) / vh - .5) * 2, -1, 1);
      var ry = -.42 + (m ? Math.sin(t * .7) * .28 * m : 0) + cur.x * .5 * m;
      var rx = .22 + cur.y * .35 * m + sc * .25 * m + (m ? Math.sin(t * 1.1) * .04 : 0);
      R.draw(ctx, key, ICONS[key], rx, ry, hov, accent, w, h);
    }
    function loop(now) { raf = 0; if (!vis || document.hidden) return; draw(now); if (k.motion()) raf = requestAnimationFrame(loop); }
    function start() { if (!raf) raf = requestAnimationFrame(loop); }
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) start(); }, { rootMargin: '80px' });
      io.observe(cv); k.add(function () { io.disconnect(); });
    }
    k.on(document, 'visibilitychange', function () { if (!document.hidden) start(); });
    k.on(root, 'pointermove', start, { passive: true });
    k.retoken = function () { accent = rgb(getComputedStyle(root).getPropertyValue('--apx-accent').trim() || '#a3cdea'); start(); };
    k.add(function () { cancelAnimationFrame(raf); ctx.clearRect(0, 0, cv.width, cv.height); });
    draw(); start();
  });
})();

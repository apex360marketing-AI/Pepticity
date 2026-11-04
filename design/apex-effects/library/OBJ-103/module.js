/*! APEX library OBJ-103 · Link Swarm — self-contained, token-driven. window.APX['OBJ-103'].mount(root) -> destroy() */
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
  var _cx;
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
      api.on(root, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      api.on(W, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      return destroy;
    }
    APX[key] = APX[code] = { code: code, name: name, mount: mount };
    function auto() { D.querySelectorAll('[data-apx="' + code + '"]:not([data-apx-manual])').forEach(function (el) { mount(el); }); }
    if (!W.APX_NO_AUTOMOUNT) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto); else auto(); }
  }
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
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* ---- shape library: simple 24x24 SVG paths (even-odd fill), sampled to points ---- */
  var SHAPES = {
    apex: 'M12 1.6 L22.6 22.4 H17.9 L12 10.2 L6.1 22.4 H1.4 Z M8.6 17.2 H15.4 L16.5 19.5 H7.5 Z',
    house: 'M12 2.2 L22.4 11.2 L20.9 12.9 L19.6 11.8 V21.8 H14.4 V15.2 H9.6 V21.8 H4.4 V11.8 L3.1 12.9 L1.6 11.2 Z M16.4 3.6 H18.9 V7.6 L16.4 5.5 Z',
    phone: 'M8.2 1.4 H15.8 A2.6 2.6 0 0 1 18.4 4 V20 A2.6 2.6 0 0 1 15.8 22.6 H8.2 A2.6 2.6 0 0 1 5.6 20 V4 A2.6 2.6 0 0 1 8.2 1.4 Z M7.3 4.4 V18.6 H16.7 V4.4 Z M10.4 2.6 H13.6 V3.3 H10.4 Z M11 19.6 H13 V21.4 H11 Z M8.4 7.4 H15.6 V11.4 H8.4 Z M8.4 12.6 H13.8 V13.6 H8.4 Z M8.4 14.8 H12.2 V15.8 H8.4 Z',
    shield: 'M12 1.4 L20.6 4.6 V11 C20.6 16.6 17 20.8 12 22.6 C7 20.8 3.4 16.6 3.4 11 V4.6 Z M10.6 15.8 L7.1 12.3 L8.7 10.7 L10.6 12.6 L15.3 7.9 L16.9 9.5 Z',
    pin: 'M12 22.8 C12 22.8 4.6 15.2 4.6 9.2 A7.4 7.4 0 0 1 19.4 9.2 C19.4 15.2 12 22.8 12 22.8 Z M12 5.9 A3.2 3.2 0 1 0 12 12.3 A3.2 3.2 0 1 0 12 5.9 Z',
    tag: 'M2 3.6 A1.6 1.6 0 0 1 3.6 2 H11.4 L22 12.6 L12.6 22 L2 11.4 Z M7.4 5.2 A2.2 2.2 0 1 0 7.4 9.6 A2.2 2.2 0 1 0 7.4 5.2 Z',
    chat: 'M3.6 3 H20.4 A1.6 1.6 0 0 1 22 4.6 V15.4 A1.6 1.6 0 0 1 20.4 17 H10 L5 21.6 V17 H3.6 A1.6 1.6 0 0 1 2 15.4 V4.6 A1.6 1.6 0 0 1 3.6 3 Z M6.6 7.6 H17.4 V8.8 H6.6 Z M6.6 11 H14.2 V12.2 H6.6 Z',
    star: 'M12 1.6 L14.9 8.6 L22.4 9.2 L16.7 14.1 L18.4 21.5 L12 17.6 L5.6 21.5 L7.3 14.1 L1.6 9.2 L9.1 8.6 Z',
    mail: 'M2 5 H22 V19 H2 Z M3.8 6.8 V17.2 H20.2 V6.8 L12 13 Z M5 6.8 L12 11.6 L19 6.8 Z',
    bolt: 'M13.6 1.6 L4.4 13.4 H11 L9.8 22.4 L19.6 10.2 H12.8 Z'
  };
  /* sample a shape into N points in [-1,1] (y down), z gives volume; outline-heavy so the silhouette reads crisply */
  function sampleShape(path, N, seed) {
    var R = 220, c = D.createElement('canvas'); c.width = c.height = R;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.setTransform(R / 24, 0, 0, R / 24, 0, 0);
    x.fillStyle = '#fff';
    try { x.fill(new Path2D(path), 'evenodd'); } catch (e) { x.fill(new Path2D(SHAPES.apex), 'evenodd'); }
    var d = x.getImageData(0, 0, R, R).data, inside = [], edge = [], i, j;
    function on(ix, iy) { return ix >= 0 && iy >= 0 && ix < R && iy < R && d[(iy * R + ix) * 4 + 3] > 127; }
    for (j = 0; j < R; j++) for (i = 0; i < R; i++) {
      if (!on(i, j)) continue;
      if (!on(i - 1, j) || !on(i + 1, j) || !on(i, j - 1) || !on(i, j + 1)) edge.push(i, j); else inside.push(i, j);
    }
    if (!edge.length) { edge.push(R / 2, R / 2); }
    if (!inside.length) inside = edge.slice();
    var rnd = rng(seed), out = new Float32Array(N * 3), k = 0, nE = Math.round(N * .42);
    for (var n = 0; n < N; n++) {
      var useE = n < nE, src = useE ? edge : inside, p = Math.floor(rnd() * (src.length / 2)) * 2;
      var px = (src[p] + rnd()) / R * 2 - 1, py = (src[p + 1] + rnd()) / R * 2 - 1;
      out[k++] = px * .92; out[k++] = py * .92;
      out[k++] = useE ? (rnd() - .5) * .05 : (rnd() - .5) * .34;
    }
    /* order by angle so particle i travels to a similar bearing in every shape: the swarm swirls instead of scrambling */
    var idx = []; for (n = 0; n < N; n++) idx.push(n);
    var ang = new Float32Array(N); for (n = 0; n < N; n++) ang[n] = Math.atan2(out[n * 3 + 1], out[n * 3]) + rnd() * .35;
    idx.sort(function (a, b) { return ang[a] - ang[b]; });
    var sorted = new Float32Array(N * 3);
    for (n = 0; n < N; n++) { sorted[n * 3] = out[idx[n] * 3]; sorted[n * 3 + 1] = out[idx[n] * 3 + 1]; sorted[n * 3 + 2] = out[idx[n] * 3 + 2]; }
    return sorted;
  }

  var VS = [
    'attribute vec4 aP;', /* xyz, speed */
    'attribute float aS;', /* seed */
    'uniform vec2 uScale;uniform float uRy,uRx,uPt,uDpr,uGlow;',
    'varying float vG;varying float vA;varying float vD;',
    'void main(){',
    '  vec3 p=aP.xyz;',
    '  float c=cos(uRy),s=sin(uRy);p=vec3(c*p.x+s*p.z,p.y,-s*p.x+c*p.z);',
    '  float c2=cos(uRx),s2=sin(uRx);p=vec3(p.x,c2*p.y-s2*p.z,s2*p.y+c2*p.z);',
    '  float pr=3./(3.-p.z);',
    '  gl_Position=vec4(p.x*uScale.x*pr,-p.y*uScale.y*pr,0.,1.);',
    '  float g=smoothstep(.04,1.5,aP.w);',
    '  vG=g;vD=clamp(.8+p.z*1.2,.5,1.);',
    '  vA=smoothstep(1.25,2.3,aP.w)*step(.8,aS);',
    '  gl_PointSize=uPt*uGlow*uDpr*pr*(.75+.6*g+.4*fract(aS*7.13))*(1.+vA*.9);',
    '}'
  ].join('\n');
  var FS = [
    'precision mediump float;',
    'uniform vec3 uInk,uAcc;uniform float uLight,uBase,uHalo;',
    'varying float vG;varying float vA;varying float vD;',
    'void main(){vec2 d=gl_PointCoord*2.-1.;float r=dot(d,d);if(r>1.)discard;',
    '  float soft=uHalo>0.?exp(-r*4.)*uHalo:smoothstep(1.,.05,r);',
    '  vec3 col=mix(uInk,uAcc,vA);',
    '  float a=soft*(uBase+(1.-uBase)*vG)*vD;',
    '  a=max(a,soft*vA*(uHalo>0.?1.:1.));',
    '  gl_FragColor=vec4(col*a,a);',
    '}'
  ].join('\n');
  function compile(gl, vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { var e = gl.getShaderInfoLog(o); gl.deleteShader(o); throw new Error(e); } return o; }
    var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); gl.deleteShader(a); gl.deleteShader(b);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var cache = {};
    return { p: p, u: function (n) { if (!(n in cache)) cache[n] = gl.getUniformLocation(p, n); return cache[n]; }, a: function (n) { return gl.getAttribLocation(p, n); } };
  }

  register('OBJ-103', 'Link Swarm', function (root, opts, api) {
    var list = root.querySelector('ul,ol');
    var links = [].slice.call(root.querySelectorAll('a[href]'));
    if (!list || !links.length) return;
    var idleName = opts.idle || root.getAttribute('data-idle') || 'apex';
    var cur = root.querySelector('a[aria-current]');
    var createdAttrs = [], wrapped = [];
    root.classList.add('apx-obj103');

    /* stage */
    var stage = root.querySelector('.apx-obj103__stage'), madeStage = false;
    if (!stage) { stage = D.createElement('div'); stage.className = 'apx-obj103__stage'; root.insertBefore(stage, root.firstChild); madeStage = true; }
    stage.setAttribute('aria-hidden', 'true');
    var cv = D.createElement('canvas'); cv.className = 'apx-obj103__gl';
    var cap = D.createElement('div'); cap.className = 'apx-obj103__cap';
    cap.innerHTML = '<b></b><span></span>';
    var ticks = D.createElement('div'); ticks.className = 'apx-obj103__ticks'; ticks.innerHTML = '<i></i><i></i><i></i><i></i>';
    stage.appendChild(cv); stage.appendChild(ticks); stage.appendChild(cap);
    var capB = cap.firstChild, capS = cap.lastChild;
    links.forEach(function (a, i) {
      a.classList.add('apx-obj103__link');
      if (!a.querySelector('.apx-obj103__label')) {
        var lab = D.createElement('span'); lab.className = 'apx-obj103__label';
        while (a.firstChild) lab.appendChild(a.firstChild);
        a.appendChild(lab); wrapped.push([a, lab]);
      }
      if (!a.querySelector('.apx-obj103__idx')) { var s = D.createElement('span'); s.className = 'apx-obj103__idx'; s.setAttribute('aria-hidden', 'true'); s.textContent = ('0' + (i + 1)).slice(-2); a.insertBefore(s, a.firstChild); createdAttrs.push(s); }
      if (!a.querySelector('.apx-obj103__spark')) { var sp = D.createElement('span'); sp.className = 'apx-obj103__spark'; sp.setAttribute('aria-hidden', 'true'); a.appendChild(sp); createdAttrs.push(sp); }
    });
    api.add(function () {
      createdAttrs.forEach(function (n) { if (n.parentNode) n.parentNode.removeChild(n); });
      wrapped.forEach(function (w) { var a = w[0], lab = w[1]; while (lab.firstChild) a.insertBefore(lab.firstChild, lab); a.removeChild(lab); });
      links.forEach(function (a) { a.classList.remove('apx-obj103__link', 'is-on', 'is-armed'); });
      if (madeStage) stage.parentNode && stage.parentNode.removeChild(stage); else { stage.removeChild(cv); stage.removeChild(ticks); stage.removeChild(cap); }
      root.classList.remove('apx-obj103', 'is-fallback', 'is-static', 'is-light', 'is-touch');
    });

    /* ---- particles ---- */
    var gl = null, ctx2 = null, P = null, buf = null, sbuf = null, lost = false;
    var N = 0, pos, vel, tgt, seed, stiff, gpu;
    var shapes = {}, curShape = '', C = {};
    var view = { w: 1, h: 1, css: 1, dpr: 1, sx: 1, sy: 1 };
    var st = { motion: 1, stat: false, t: 0, ry: 0, rx: 0, ptr: { x: 9, y: 9, on: false, k: 0 }, ptrT: { x: 0, y: 0 }, kick: 0, light: false, active: null };

    function shapeFor(name) {
      var path = SHAPES[name] || (name && name.charAt(0) === 'M' ? name : SHAPES.apex);
      var key = name + '|' + N;
      if (!shapes[key]) shapes[key] = sampleShape(path, N, 7 + name.length * 131);
      return shapes[key];
    }
    function linkShape(a) { return a ? (a.getAttribute('data-path') || a.getAttribute('data-shape') || 'apex') : idleName; }

    function alloc(n) {
      N = n; pos = new Float32Array(N * 3); vel = new Float32Array(N * 3); tgt = new Float32Array(N * 3);
      seed = new Float32Array(N); stiff = new Float32Array(N); gpu = new Float32Array(N * 4);
      var rnd = rng(42);
      for (var i = 0; i < N; i++) {
        seed[i] = rnd(); stiff[i] = .55 + rnd() * .9;
        var a = rnd() * 6.283, r = 1.4 + rnd() * .8;
        pos[i * 3] = Math.cos(a) * r; pos[i * 3 + 1] = Math.sin(a) * r * .8; pos[i * 3 + 2] = (rnd() - .5) * .6;
      }
      shapes = {};
    }
    function morphTo(name, instant) {
      if (name === curShape && !instant) return;
      curShape = name;
      var s = shapeFor(name);
      tgt.set(s);
      if (instant) { pos.set(s); vel.fill(0); }
      else st.kick = 1;
    }

    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), ink = rgba(tok(root, '--apx-ink', '#ecebe8')), acc = rgba(tok(root, '--apx-accent', '#d4ff3a'));
      st.light = lum(bg) > .5; root.classList.toggle('is-light', st.light);
      /* platinum dust: the ink, cooled and lifted on dark grounds */
      var l = lum(ink);
      C.ink = st.light ? ink.slice(0, 3) : [l * .35 + ink[0] * .65 + .02, l * .35 + ink[1] * .65 + .03, l * .35 + ink[2] * .65 + .05];
      C.acc = acc.slice(0, 3);
      C.inkCss = 'rgb(' + C.ink.map(function (v) { return Math.round(clamp(v, 0, 1) * 255); }).join(',') + ')';
      C.accCss = 'rgb(' + C.acc.map(function (v) { return Math.round(v * 255); }).join(',') + ')';
    }

    function initGL() {
      try { gl = cv.getContext('webgl', { antialias: false, alpha: true, premultipliedAlpha: true }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
      if (gl) {
        try { P = compile(gl, VS, FS); buf = gl.createBuffer(); sbuf = gl.createBuffer(); }
        catch (e) { gl = null; }
      }
      if (!gl) { ctx2 = cv.getContext('2d'); root.classList.add('is-fallback'); }
    }
    initGL();
    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; });
      api.on(cv, 'webglcontextrestored', function () { try { P = compile(gl, VS, FS); buf = gl.createBuffer(); sbuf = gl.createBuffer(); lost = false; uploadSeeds(); draw(); } catch (e) {} });
      api.add(function () { if (!lost) { gl.deleteProgram(P.p); gl.deleteBuffer(buf); gl.deleteBuffer(sbuf); var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } gl = null; });
    }
    function uploadSeeds() { if (!gl || lost) return; gl.bindBuffer(gl.ARRAY_BUFFER, sbuf); gl.bufferData(gl.ARRAY_BUFFER, seed, gl.STATIC_DRAW); }

    function size() {
      var r = stage.getBoundingClientRect();
      var dpr = Math.min(W.devicePixelRatio || 1, isCompact() ? 1.5 : 2);
      var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      view.w = w; view.h = h; view.dpr = dpr; view.cw = r.width; view.ch = r.height;
      var m = Math.min(r.width, r.height) * (isCompact() ? .37 : .42);
      view.sx = m / (r.width / 2); view.sy = m / (r.height / 2);
      view.half = m; /* css px per unit */
    }

    /* ---- simulation ---- */
    function simulate(dt, t) {
      var m = st.motion, kick = st.kick, breathe = 1 + Math.sin(t * .9) * .018;
      var K = 15 + 19 * (1 - kick), damp = 5.4 + 2 * (1 - kick), swirl = 3.2 * kick, pr = st.ptr, R = .34, R2 = R * R, pk = pr.k;
      var cr = Math.cos(st.ry), sr = Math.sin(st.ry);
      for (var i = 0; i < N; i++) {
        var j = i * 3, s = seed[i];
        var ox = Math.sin(t * .7 + s * 41) * .012, oy = Math.cos(t * .83 + s * 29) * .012;
        var tx = tgt[j] * breathe + ox, ty = tgt[j + 1] * breathe + oy, tz = tgt[j + 2];
        var dx = tx - pos[j], dy = ty - pos[j + 1], dz = tz - pos[j + 2];
        var k = K * stiff[i];
        var ax = dx * k - vel[j] * damp, ay = dy * k - vel[j + 1] * damp, az = dz * k - vel[j + 2] * damp;
        /* swirl while travelling: a tangential push around the centre, stronger the further from home */
        if (swirl > .01) {
          var dist = Math.min(Math.sqrt(dx * dx + dy * dy), 1.5);
          var px = pos[j], py = pos[j + 1];
          ax += -py * swirl * dist * (1.2 + s); ay += px * swirl * dist * (1.2 + s);
          az += Math.sin(s * 90 + t * 3) * dist * 3 * kick;
        }
        /* curl-ish flutter */
        ax += Math.sin(pos[j + 1] * 5.1 + t * 1.3 + s * 6) * .35; ay += Math.cos(pos[j] * 4.7 + t * 1.1 + s * 5) * .35;
        /* pointer repulsion (pointer is in the swarm's rotated frame) */
        if (pk > .01) {
          var qx = pos[j] * cr + pos[j + 2] * sr;
          var rx = qx - pr.x, ry = pos[j + 1] - pr.y, d2 = rx * rx + ry * ry;
          if (d2 < R2 && d2 > 1e-6) { var d = Math.sqrt(d2), f = (1 - d / R); f = f * f * 38 * pk / d; ax += rx * f; ay += ry * f; }
        }
        vel[j] += ax * dt * m; vel[j + 1] += ay * dt * m; vel[j + 2] += az * dt * m;
        pos[j] += vel[j] * dt * m; pos[j + 1] += vel[j + 1] * dt * m; pos[j + 2] += vel[j + 2] * dt * m;
        var g = i * 4;
        gpu[g] = pos[j]; gpu[g + 1] = pos[j + 1]; gpu[g + 2] = pos[j + 2];
        gpu[g + 3] = Math.sqrt(vel[j] * vel[j] + vel[j + 1] * vel[j + 1] + vel[j + 2] * vel[j + 2]);
      }
      st.kick = Math.max(0, kick - dt * .62);
    }
    function settleGPU() { for (var i = 0; i < N; i++) { gpu[i * 4] = pos[i * 3]; gpu[i * 4 + 1] = pos[i * 3 + 1]; gpu[i * 4 + 2] = pos[i * 3 + 2]; gpu[i * 4 + 3] = 0; } }

    function draw() {
      if (gl && !lost) {
        gl.viewport(0, 0, view.w, view.h);
        gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        gl.useProgram(P.p);
        gl.uniform2f(P.u('uScale'), view.sx, view.sy);
        gl.uniform1f(P.u('uRy'), st.ry); gl.uniform1f(P.u('uRx'), st.rx);
        var pt = clamp(view.half / 140, 1.2, 2.3) * (N > 6000 ? 1 : 1.2) * (st.light ? 1.1 : 1);
        gl.uniform1f(P.u('uPt'), pt); gl.uniform1f(P.u('uDpr'), view.dpr);
        gl.uniform3fv(P.u('uInk'), C.ink); gl.uniform3fv(P.u('uAcc'), C.acc);
        gl.uniform1f(P.u('uLight'), st.light ? 1 : 0); gl.uniform1f(P.u('uBase'), st.light ? .8 : .62);
        gl.enable(gl.BLEND);
        if (st.light) gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); else gl.blendFunc(gl.ONE, gl.ONE);
        gl.bindBuffer(gl.ARRAY_BUFFER, buf); gl.bufferData(gl.ARRAY_BUFFER, gpu, gl.DYNAMIC_DRAW);
        var a = P.a('aP'); gl.enableVertexAttribArray(a); gl.vertexAttribPointer(a, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, sbuf);
        var b = P.a('aS'); gl.enableVertexAttribArray(b); gl.vertexAttribPointer(b, 1, gl.FLOAT, false, 0, 0);
        gl.uniform1f(P.u('uGlow'), 1); gl.uniform1f(P.u('uHalo'), 0);
        gl.drawArrays(gl.POINTS, 0, N);
        /* soft halo pass: the same points, wide and faint, so the shape glows like dust in a light beam */
        if (!st.light) { gl.uniform1f(P.u('uGlow'), 4.2); gl.uniform1f(P.u('uHalo'), .1); gl.drawArrays(gl.POINTS, 0, N); }
        gl.disable(gl.BLEND);
      } else if (ctx2) {
        var c = ctx2, w = view.w, h = view.h, u = view.half * view.dpr, cx = w / 2, cy = h / 2;
        c.clearRect(0, 0, w, h);
        c.globalCompositeOperation = st.light ? 'source-over' : 'lighter';
        var cry = Math.cos(st.ry), sry = Math.sin(st.ry), sz = Math.max(1, view.dpr * 1.4);
        for (var i = 0; i < N; i++) {
          var x = gpu[i * 4], y = gpu[i * 4 + 1], z = gpu[i * 4 + 2], sp = gpu[i * 4 + 3];
          var X = cry * x + sry * z, Z = -sry * x + cry * z, pr = 3 / (3 - Z);
          var g = clamp((sp - .04) / 1.46, 0, 1), hot = sp > 1.6 && seed[i] > .8;
          c.globalAlpha = hot ? 1 : clamp((st.light ? .5 : .32) + g * .68, 0, 1) * clamp(.55 + Z * 1.6, .25, 1);
          c.fillStyle = hot ? C.accCss : C.inkCss;
          c.fillRect(cx + X * u * pr, cy + y * u * pr, sz, sz);
        }
        c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
      }
    }

    var loop = ambient(root, api, function (now, dt) {
      st.t += dt;
      var tgtRy = Math.sin(st.t * .23) * .34 + st.ptrT.x * .45, tgtRx = st.ptrT.y * .18;
      st.ry += (tgtRy - st.ry) * (1 - Math.exp(-dt * 2.4)); st.rx += (tgtRx - st.rx) * (1 - Math.exp(-dt * 2.4));
      st.ptr.k += ((st.ptr.on ? 1 : 0) - st.ptr.k) * (1 - Math.exp(-dt * 6));
      var sub = dt > .03 ? 2 : 1;
      for (var k = 0; k < sub; k++) simulate(dt / sub, st.t);
      draw();
    });

    /* ---- caption ---- */
    function caption(a) {
      var i = a ? links.indexOf(a) : -1;
      capB.textContent = a ? ('0' + (i + 1)).slice(-2) + ' / ' + ('0' + links.length).slice(-2) : (root.getAttribute('data-idle-label') || 'APEX');
      capS.textContent = a ? (a.getAttribute('data-hint') || ((a.querySelector('.apx-obj103__label') || a).textContent || '').trim()) : (root.getAttribute('data-idle-hint') || '');
    }
    function select(a, instant) {
      st.active = a;
      links.forEach(function (l) { l.classList.toggle('is-on', l === a); });
      root.classList.toggle('has-on', !!a);
      caption(a);
      var name = linkShape(a || cur);
      if (st.stat) { morphTo(name, true); settleGPU(); draw(); }
      else { morphTo(name, !!instant); loop.start(); }
    }

    /* ---- interaction: hover, focus, touch (tap to choose, tap again to go) ---- */
    var leaveT = 0, touchMode = false;
    function backToIdle() { clearTimeout(leaveT); leaveT = setTimeout(function () { if (!root.contains(D.activeElement) || !links.includes(D.activeElement)) select(null); }, 650); }
    links.forEach(function (a) {
      api.on(a, 'pointerenter', function (e) { if (e.pointerType === 'touch') return; clearTimeout(leaveT); select(a); });
      api.on(a, 'focus', function () { clearTimeout(leaveT); select(a); });
      api.on(a, 'blur', function () { a.classList.remove('is-armed'); backToIdle(); });
      api.on(a, 'pointerdown', function (e) { touchMode = e.pointerType === 'touch' || e.pointerType === 'pen'; if (touchMode) root.classList.add('is-touch'); });
      api.on(a, 'click', function (e) {
        if (!touchMode) return;
        touchMode = false;
        if (!a.classList.contains('is-armed')) {
          e.preventDefault();
          links.forEach(function (l) { l.classList.remove('is-armed'); });
          a.classList.add('is-armed'); clearTimeout(leaveT); select(a);
        }
      });
    });
    api.on(list, 'pointerleave', function (e) { if (e.pointerType !== 'touch') backToIdle(); });
    api.add(function () { clearTimeout(leaveT); });

    function toStage(e) {
      var r = stage.getBoundingClientRect();
      return { x: (e.clientX - r.left - r.width / 2) / view.half, y: (e.clientY - r.top - r.height / 2) / view.half, inside: e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom };
    }
    api.on(W, 'pointermove', function (e) {
      var p = toStage(e);
      if (e.pointerType !== 'touch') { st.ptrT.x = clamp(p.x / 3, -1, 1); st.ptrT.y = clamp(p.y / 3, -1, 1); }
      st.ptr.x = p.x; st.ptr.y = p.y; st.ptr.on = p.inside && (e.pointerType !== 'touch' || e.buttons > 0 || e.pressure > 0);
    }, { passive: true });
    api.on(stage, 'pointerleave', function () { st.ptr.on = false; });
    api.on(W, 'pointerup', function (e) { if (e.pointerType === 'touch') st.ptr.on = false; }, { passive: true });
    api.on(W, 'pointercancel', function () { st.ptr.on = false; }, { passive: true });

    /* ---- setup ---- */
    var ro = new ResizeObserver(function () { size(); if (st.stat) draw(); });
    ro.observe(stage); api.add(function () { ro.disconnect(); });

    function setup() {
      var m = motionOf(root); st.motion = m; st.stat = m === 0;
      root.classList.toggle('is-static', st.stat);
      readTokens();
      var compact = isCompact();
      var want = gl ? (compact ? 4200 : 9000) : (compact ? 1200 : 2000);
      if (want !== N) { alloc(want); uploadSeeds(); curShape = ''; }
      size();
      var name = linkShape(st.active || cur);
      caption(st.active);
      if (st.stat) { loop.stop(); morphTo(name, true); settleGPU(); st.ry = 0; st.rx = 0; draw(); }
      else { if (curShape !== name) morphTo(name, false); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
    if (cur) cur.classList.add('is-current');
    api.add(function () { if (cur) cur.classList.remove('is-current'); });
    root.__apxOBJ103 = { select: function (i) { select(typeof i === 'number' ? links[i] || null : i); }, shapes: Object.keys(SHAPES), speed: function () { var mx = 0, hot = 0; for (var i = 0; i < N; i++) { var v = gpu[i * 4 + 3]; if (v > mx) mx = v; if (v > 1.25 && seed[i] > .8) hot++; } return { max: mx, hot: hot, n: N }; } };
    api.add(function () { delete root.__apxOBJ103; });
  });
})();

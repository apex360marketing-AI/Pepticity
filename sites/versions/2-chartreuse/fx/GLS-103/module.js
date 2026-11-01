/*! APEX library GLS-103 · Molten Numerals — self-contained, token-driven. window.APX['GLS-103'].mount(root) -> destroy() */
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

  /* ---- exact Euclidean distance transform (Felzenszwalb & Huttenlocher) ---- */
  var INF = 1e20;
  function edt1d(f, n, d, v, z) {
    var k = 0; v[0] = 0; z[0] = -INF; z[1] = INF;
    for (var q = 1; q < n; q++) {
      var s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
      while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
      k++; v[k] = q; z[k] = s; z[k + 1] = INF;
    }
    k = 0;
    for (var q2 = 0; q2 < n; q2++) { while (z[k + 1] < q2) k++; var dq = q2 - v[k]; d[q2] = dq * dq + f[v[k]]; }
  }
  /* separable running-sum box blur, in place */
  function boxBlur(a, w, h, r) {
    var tmp = new Float32Array(Math.max(w, h)), x, y, acc, k, inv = 1 / (2 * r + 1);
    for (y = 0; y < h; y++) {
      var o = y * w; acc = 0;
      for (k = -r; k <= r; k++) acc += a[o + clamp(k, 0, w - 1)];
      for (x = 0; x < w; x++) { tmp[x] = acc * inv; acc += a[o + Math.min(x + r + 1, w - 1)] - a[o + Math.max(x - r, 0)]; }
      for (x = 0; x < w; x++) a[o + x] = tmp[x];
    }
    for (x = 0; x < w; x++) {
      acc = 0;
      for (k = -r; k <= r; k++) acc += a[clamp(k, 0, h - 1) * w + x];
      for (y = 0; y < h; y++) { tmp[y] = acc * inv; acc += a[Math.min(y + r + 1, h - 1) * w + x] - a[Math.max(y - r, 0) * w + x]; }
      for (y = 0; y < h; y++) a[y * w + x] = tmp[y];
    }
  }
  function edt(grid, w, h) {
    var n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n), v = new Int32Array(n), z = new Float64Array(n + 1), x, y;
    for (x = 0; x < w; x++) { for (y = 0; y < h; y++) f[y] = grid[y * w + x]; edt1d(f, h, d, v, z); for (y = 0; y < h; y++) grid[y * w + x] = d[y]; }
    for (y = 0; y < h; y++) { for (x = 0; x < w; x++) f[x] = grid[y * w + x]; edt1d(f, w, d, v, z); for (x = 0; x < w; x++) grid[y * w + x] = d[x]; }
  }

  /* ---- shaders ---- */
  var VS_FULL = 'attribute vec2 aP;void main(){gl_Position=vec4(aP,0.,1.);}';
  var VS_BLOB = [
    'attribute vec3 aP;uniform vec2 uRes;uniform float uS;',
    'void main(){vec2 c=aP.xy/uRes*2.-1.;c.y=-c.y;gl_Position=vec4(c,0.,1.);gl_PointSize=max(aP.z*uS*4.4,0.);}'
  ].join('\n');
  var FS_BLOB = [
    'precision mediump float;',
    'void main(){vec2 d=gl_PointCoord*2.-1.;float r2=dot(d,d);if(r2>1.)discard;float g=(exp(-r2*3.35)-.035)*.2;gl_FragColor=vec4(max(g,0.),0.,0.,1.);}'
  ].join('\n');
  var FS_MAIN = [
    'precision highp float;',
    'uniform sampler2D uG;uniform sampler2D uB;uniform vec2 uRes;uniform vec4 uBox;uniform float uP,uT,uLight,uMorph,uHasB;',
    'uniform vec2 uTilt;uniform vec3 uDark,uMid,uHi,uShadow;',
    'float h1(float x){return fract(sin(x*127.1)*43758.5453);}',
    'float n1(float x){float i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(h1(i),h1(i+1.),f);}',
    /* local progress: the melt sweeps left to right across the number */
    'float lp(float x){float sx=clamp((x-uBox.x)/max(uBox.z-uBox.x,1e-3),0.,1.);return clamp((uP-sx*.3)/.7,0.,1.);}',
    'float field(vec2 uv){',
    '  float l=lp(uv.x);',
    '  float m=smoothstep(0.,.5,l);',
    '  float bh=uBox.w-uBox.y;',
    '  float drip=m*m*(.05+.22*n1(uv.x*uRes.x/9.)+.1*n1(uv.x*uRes.x/31.+3.))*bh;',
    '  float wob=uMorph*.004*sin(uv.y*40.+uT*6.)*m;',
    '  float f=texture2D(uG,vec2(uv.x+wob,uv.y-drip)).r*(1.-m*.98);',
    '  float wt=smoothstep(.42,1.,l);',
    '  float t=texture2D(uG,uv).g*wt;',
    '  float b=uHasB*texture2D(uB,uv).r*5.;',
    '  return f+t+b;',
    '}',
    'float hgt(float r){float x=max(r-.5,0.)*2.;return sqrt(min(x,1.))+max(x-1.,0.)*.35;}',
    'vec3 env(vec3 r){',
    '  float y=r.y+uTilt.y*.35,x=r.x+uTilt.x*.4+sin(uT*.17)*.12;',
    '  vec3 c=mix(uDark,uMid,smoothstep(-.35,.3,y));',
    '  c=mix(c,uDark*.6,smoothstep(.05,-.5,y));',
    '  c+=uHi*1.15*exp(-pow((y-.08)*9.,2.));',                                  /* horizon line */
    '  c+=uHi*.9*smoothstep(.45,.62,y)*smoothstep(.95,.7,y)*(.55+.45*sin(x*2.2+uT*.21));', /* top softbox */
    '  c+=uHi*.75*exp(-pow((x-.52+.06*sin(uT*.13))*5.,2.))*smoothstep(-.1,.35,y);', /* side strip */
    '  c+=uHi*.35*exp(-pow((x+.6)*7.,2.))*smoothstep(.0,.5,y);',
    '  return c;',
    '}',
    'void main(){',
    '  vec2 px=1./uRes;vec2 uv=vec2(gl_FragCoord.x,uRes.y-gl_FragCoord.y)*px;',
    '  float r=field(uv);',
    '  float rl=field(uv-vec2(px.x,0.)),rr=field(uv+vec2(px.x,0.)),ru=field(uv-vec2(0.,px.y)),rd=field(uv+vec2(0.,px.y));',
    '  vec2 g=vec2(rr-rl,rd-ru)*.5;float gl=max(length(g),1e-4);',
    '  float a=clamp((r-.5)/gl+.5,0.,1.);',
    /* contact shadow beneath the liquid */
    '  vec2 so=vec2(.012*(uBox.w-uBox.y),.045*(uBox.w-uBox.y));',
    '  float sh=smoothstep(.12,.62,field(uv-so))*(uLight>.5?.26:.5);',
    '  vec4 under=vec4(uShadow*sh,sh);',
    '  if(a<=0.){gl_FragColor=under;return;}',
    '  float s=2.6*min(uRes.x,uRes.y)/300.;',
    '  float hl=hgt(rl),hr=hgt(rr),hu=hgt(ru),hd=hgt(rd);',
    '  vec3 n=normalize(vec3(-(hr-hl)*s,(hd-hu)*s,1.));',
    '  vec2 vo=(uv-.5)*vec2(uRes.x/uRes.y,1.)*.42;',
    '  vec3 rf=reflect(normalize(vec3(vo.x,-vo.y,-1.)),n);',
    '  vec3 col=env(rf);',
    '  float fr=pow(1.-n.z,3.);',
    '  col=mix(col,uHi*1.1,fr*.45);',
    '  col*=.82+.18*n.z;',
    '  col=col/(1.+col*.18);',
    '  gl_FragColor=vec4(col*a,a)+under*(1.-a);',
    '}'
  ].join('\n');

  function compile(gl, vs, fs) {
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { var e = gl.getShaderInfoLog(o); gl.deleteShader(o); throw new Error(e); } return o; }
    var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
    gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p);
    gl.deleteShader(a); gl.deleteShader(b);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    var cache = {};
    return { p: p, u: function (n) { if (!(n in cache)) cache[n] = gl.getUniformLocation(p, n); return cache[n]; }, a: function (n) { return gl.getAttribLocation(p, n); } };
  }

  var SVGNS = 'http://www.w3.org/2000/svg';

  register('GLS-103', 'Molten Numerals', function (root, opts, api) {
    var original = root.innerHTML;
    var origAttrs = ['aria-label', 'role'].map(function (n) { return [n, root.getAttribute(n)]; });
    function readValue() {
      if (opts.value != null) return String(opts.value);
      var v = root.getAttribute('data-value');
      return v != null ? v : (root.textContent || '').replace(/\s+/g, ' ').trim();
    }
    var value = readValue();
    var revealOnView = (opts.reveal != null ? opts.reveal : root.getAttribute('data-reveal')) !== 'none';

    /* ---- DOM: real text (screen readers, copy, layout) + arcs + canvas ---- */
    root.textContent = '';
    root.classList.add('apx-gls103');
    var num = D.createElement('span'); num.className = 'apx-gls103__num';
    num.setAttribute('aria-live', 'polite'); num.setAttribute('aria-atomic', 'true');
    num.textContent = value;
    var arcs = D.createElementNS(SVGNS, 'svg'); arcs.setAttribute('class', 'apx-gls103__arcs'); arcs.setAttribute('aria-hidden', 'true');
    
    var gid = 'apxg103' + Math.random().toString(36).slice(2, 8);
    arcs.innerHTML =
      '<defs><linearGradient id="' + gid + 'a" x1="0" x2="1"><stop offset="0" stop-color="currentColor" stop-opacity="0"/><stop offset=".5" stop-color="currentColor" stop-opacity="1"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>' +
      '<g class="apx-gls103__arc" data-s=".9" data-t="-7"><ellipse data-k="1" fill="none" stroke="url(#' + gid + 'a)" stroke-width=".8" pathLength="1000" stroke-dasharray="250 750"/></g>' +
      '<g class="apx-gls103__arc" data-s="-.6" data-t="5"><ellipse data-k=".86 1.25" fill="none" stroke="url(#' + gid + 'a)" stroke-width=".8" pathLength="1000" stroke-dasharray="170 830" opacity=".7"/></g>' +
      '<g class="apx-gls103__arc" data-s=".4" data-t="-2"><ellipse data-k=".72 .7" fill="none" stroke="url(#' + gid + 'a)" stroke-width=".8" pathLength="1000" stroke-dasharray="120 880" opacity=".55"/></g>' +
      '<g class="apx-gls103__arc apx-gls103__arc--spark" data-s="-1.3" data-t="-7"><ellipse data-k=".94 1.08" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" pathLength="1000" stroke-dasharray="7 993"/></g>';
    var cv = D.createElement('canvas'); cv.className = 'apx-gls103__gl'; cv.setAttribute('aria-hidden', 'true');
    root.appendChild(arcs); root.appendChild(num); root.appendChild(cv);
    var arcGs = [].slice.call(arcs.querySelectorAll('.apx-gls103__arc')).map(function (g) { var t = parseFloat(g.getAttribute('data-t')) || 0; g.setAttribute('transform', 'rotate(' + t + ')'); return { g: g, e: g.firstChild, s: parseFloat(g.getAttribute('data-s')), a: Math.random() * 1000 }; });

    api.add(function () {
      root.innerHTML = original; root.classList.remove('apx-gls103', 'is-live', 'is-fallback', 'is-static', 'is-light', 'is-morph');
      origAttrs.forEach(function (p) { if (p[1] == null) root.removeAttribute(p[0]); else root.setAttribute(p[0], p[1]); });
      delete root.__apxGLS103;
    });

    /* ---- state ---- */
    var gl = null, P = null, B = null, T = null, lost = false, triedGL = false, ext = {};
    var C = {}, view = { w: 0, h: 0, cw: 0, ch: 0, dpr: 1, box: [0, 0, 1, 1] };
    var S = { motion: 1, stat: false, shown: '', target: value, p: 1, from: '', to: '', morphing: false, queued: null, seen: !revealOnView, drops: [], dur: 1.7, t0: 0, light: false, tilt: [0, 0], tiltT: [0, 0], sv: 0 };
    var glyphCv = D.createElement('canvas'), gctx = glyphCv.getContext('2d', { willReadFrequently: true });
    var masks = {}; /* text -> {dens:Uint8Array, pts:[...]} per layout key */
    var layoutKey = '';

    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), ink = rgba(tok(root, '--apx-ink', '#ecebe8')), mu = rgba(tok(root, '--apx-muted', '#9d9ca3'));
      S.light = lum(bg) > .5; root.classList.toggle('is-light', S.light);
      var grey = function (c, k) { var l = lum(c); return [l * k + c[0] * (1 - k), l * k + c[1] * (1 - k), l * k + c[2] * (1 - k)]; };
      if (S.light) {
        var ik = grey(ink, .6);
        C.dark = ik.map(function (v) { return v * .9 + .01; });
        C.mid = ik.map(function (v, i) { return v * .55 + mu[i] * .3 + .03; });
        C.hi = [1.1, 1.1, 1.12];
        C.shadow = ink.slice(0, 3).map(function (v) { return v * .6; });
      } else {
        var bgk = grey(bg, .5), ig = grey(ink, .35);
        C.dark = bgk.map(function (v) { return v * .5 + .015; });
        C.mid = mu.slice(0, 3).map(function (v, i) { return v * .45 + bgk[i] * .3; });
        C.hi = ig.map(function (v) { return v * .85 + .2; });
        C.shadow = [0, 0, 0];
      }
    }

    /* ---- WebGL lifecycle (created lazily, the first time the number is near the screen) ---- */
    function initGL() {
      if (triedGL) return !!gl; triedGL = true;
      try { gl = cv.getContext('webgl', { premultipliedAlpha: true, antialias: false, alpha: true }) || cv.getContext('experimental-webgl'); } catch (e) { gl = null; }
      if (!gl) { root.classList.add('is-fallback'); return false; }
      try { buildGL(); } catch (e) { gl = null; root.classList.add('is-fallback'); return false; }
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.add('is-fallback'); root.classList.remove('is-live'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; try { buildGL(); root.classList.remove('is-fallback'); masks = {}; layoutKey = ''; setup(); } catch (e) {} });
      api.add(function () { if (gl && !lost) { freeGL(); var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); } gl = null; });
      root.classList.add('is-live');
      return true;
    }
    function buildGL() {
      P = { main: compile(gl, VS_FULL, FS_MAIN), blob: compile(gl, VS_BLOB, FS_BLOB) };
      B = { tri: gl.createBuffer(), drops: gl.createBuffer() };
      gl.bindBuffer(gl.ARRAY_BUFFER, B.tri); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      function tex() { var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(4)); return t; }
      T = { glyph: tex(), blob: tex(), fb: gl.createFramebuffer(), bw: 0, bh: 0 };
      lost = false;
    }
    function freeGL() {
      if (!P) return;
      gl.deleteProgram(P.main.p); gl.deleteProgram(P.blob.p);
      gl.deleteBuffer(B.tri); gl.deleteBuffer(B.drops);
      gl.deleteTexture(T.glyph); gl.deleteTexture(T.blob); gl.deleteFramebuffer(T.fb);
      P = B = T = null;
    }

    /* ---- layout + glyph fields ---- */
    function measure() {
      var rc = cv.getBoundingClientRect(), nr = num.getBoundingClientRect();
      var compact = isCompact();
      var dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.5 : 2);
      var cw = Math.max(2, Math.round(rc.width)), ch = Math.max(2, Math.round(rc.height));
      var sc = Math.min(dpr, 2400 / cw, 1400 / ch);
      view.cw = cw; view.ch = ch; view.dpr = sc;
      view.w = Math.max(2, Math.round(cw * sc)); view.h = Math.max(2, Math.round(ch * sc));
      view.box = [(nr.left - rc.left) / cw, (nr.top - rc.top) / ch, (nr.right - rc.left) / cw, (nr.bottom - rc.top) / ch];
      view.nr = { x: nr.left - rc.left, y: nr.top - rc.top, w: nr.width, h: nr.height };
      var cs = getComputedStyle(num);
      view.font = { style: cs.fontStyle, weight: cs.fontWeight, size: parseFloat(cs.fontSize), family: cs.fontFamily, ls: cs.letterSpacing, align: getComputedStyle(root).textAlign };
      var k = [cw, ch, Math.round(view.nr.x), Math.round(view.nr.y), view.font.size, view.font.family, view.font.weight, view.font.ls].join('|');
      if (k !== layoutKey) { layoutKey = k; masks = {}; }
      if (cv.width !== view.w || cv.height !== view.h) { cv.width = view.w; cv.height = view.h; }
    }
    /* density field of a string: r = .5 at the glyph edge, rising to 1 at the deepest point of each stroke, falling to 0 outside */
    function maskOf(text) {
      if (masks[text]) return masks[text];
      var q = clamp(Math.min(1400 / view.cw, Math.sqrt(900000 / (view.cw * view.ch))), .5, 2), mw = Math.max(2, Math.round(view.cw * q)), mh = Math.max(2, Math.round(view.ch * q));
      var dens = new Uint8Array(mw * mh), pts = [];
      if (text) {
        glyphCv.width = mw; glyphCv.height = mh;
        var f = view.font, fs = f.size * q;
        gctx.clearRect(0, 0, mw, mh);
        gctx.font = f.style + ' ' + f.weight + ' ' + fs + 'px ' + f.family;
        try { gctx.letterSpacing = (parseFloat(f.ls) || 0) * q + 'px'; } catch (e) {}
        gctx.textBaseline = 'alphabetic'; gctx.textAlign = 'left'; gctx.fillStyle = '#fff';
        var m = gctx.measureText(text);
        var asc = m.fontBoundingBoxAscent != null ? m.fontBoundingBoxAscent : fs * .8, des = m.fontBoundingBoxDescent != null ? m.fontBoundingBoxDescent : fs * .2;
        /* text width can differ from the span while the span still shows the old value: align like the span does */
        var tw = m.width, bx = view.nr.x * q, bw = view.nr.w * q;
        var x = f.align === 'center' ? bx + (bw - tw) / 2 : (f.align === 'right' || f.align === 'end') ? bx + bw - tw : bx;
        var y = view.nr.y * q + (view.nr.h * q - (asc + des)) / 2 + asc;
        gctx.fillText(text, x, y);
        var img = gctx.getImageData(0, 0, mw, mh).data, n = mw * mh;
        var gin = new Float64Array(n), gout = new Float64Array(n), i;
        for (i = 0; i < n; i++) { var a = img[i * 4 + 3]; if (a > 127) { gin[i] = INF; gout[i] = 0; } else { gin[i] = 0; gout[i] = INF; } }
        edt(gin, mw, mh); edt(gout, mw, mh);
        var maxIn = 1, sd = new Float32Array(n);
        for (i = 0; i < n; i++) {
          var a2 = img[i * 4 + 3] / 255;
          var s = gin[i] > 0 ? -(Math.sqrt(gin[i]) - .5) : Math.sqrt(gout[i]) - .5;
          s += .5 - a2; /* sub-pixel edge from the antialiased raster */
          sd[i] = s; if (-s > maxIn) maxIn = -s;
        }
        /* round the inside into a liquid tube: blur the inner depth so stroke centres dome instead of ridging */
        var inner = new Float32Array(n);
        for (i = 0; i < n; i++) inner[i] = sd[i] < 0 ? -sd[i] : 0;
        var rb = Math.max(1, Math.round(maxIn * .4));
        boxBlur(inner, mw, mh, rb); boxBlur(inner, mw, mh, rb);
        var maxB = 1e-3;
        for (i = 0; i < n; i++) if (sd[i] < 0 && inner[i] > maxB) maxB = inner[i];
        var so = Math.max(3, fs * .1), si = Math.max(2, maxB * .9);
        var rnd = rng(text.length * 977 + 13);
        for (i = 0; i < n; i++) {
          var dIn = sd[i] < 0 ? Math.max(inner[i], -sd[i] * .35) : 0;
          var v = sd[i] > 0 ? .5 - sd[i] / (2 * so) : .5 + dIn / (2 * si);
          dens[i] = Math.round(clamp(v, 0, 1) * 255);
          if (-sd[i] > si * .45 && rnd() < .2) pts.push([(i % mw) / q, Math.floor(i / mw) / q]);
        }
      }
      return (masks[text] = { dens: dens, pts: pts, w: mw, h: mh });
    }
    function uploadPair(a, b) {
      var A = maskOf(a), Bm = maskOf(b), n = A.w * A.h, buf = new Uint8Array(n * 4);
      for (var i = 0; i < n; i++) { buf[i * 4] = A.dens[i]; buf[i * 4 + 1] = Bm.dens[i]; buf[i * 4 + 3] = 255; }
      gl.bindTexture(gl.TEXTURE_2D, T.glyph);
      gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, A.w, A.h, 0, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    }
    function ensureBlobTarget() {
      var bw = Math.max(2, Math.round(view.w / 2)), bh = Math.max(2, Math.round(view.h / 2));
      if (T.bw === bw && T.bh === bh) return;
      T.bw = bw; T.bh = bh;
      gl.bindTexture(gl.TEXTURE_2D, T.blob);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bw, bh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.blob, 0);
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    /* ---- droplets: old digits drain into a stream below, which climbs into the new digits ---- */
    function planDrops(a, b) {
      var A = maskOf(a).pts, Bp = maskOf(b).pts, nr = view.nr, fs = view.font.size;
      var compact = isCompact(), N = compact ? 46 : 84;
      var rnd = rng((a + '>' + b).length * 31 + Date.now() % 997);
      function pick(list, fromMist) {
        var out = [];
        for (var i = 0; i < N; i++) {
          if (list.length) { var p = list[Math.floor(rnd() * list.length)]; out.push([p[0], p[1]]); }
          else out.push([nr.x + rnd() * nr.w, fromMist ? nr.y + nr.h * (1.05 + rnd() * .25) : nr.y + nr.h * (1.05 + rnd() * .25)]);
        }
        out.sort(function (p, q) { return p[0] - q[0]; });
        return out;
      }
      var p0 = pick(A, true), p1 = pick(Bp, false), drops = [];
      var pool = nr.y + nr.h * .98;
      for (var i = 0; i < N; i++) {
        var x0 = p0[i][0], x1 = p1[i][0];
        var sx = clamp(((x0 + x1) / 2 - nr.x) / Math.max(nr.w, 1), 0, 1);
        drops.push({
          a: p0[i], b: p1[i],
          c1: [x0 + (rnd() - .5) * fs * .08, pool + rnd() * fs * .14],
          c2: [x1 + (rnd() - .5) * fs * .08, pool + rnd() * fs * .14],
          d: sx * .3 * .85 + rnd() * .06, len: .55 + rnd() * .2,
          r: fs * (.045 + rnd() * .04)
        });
      }
      return drops;
    }
    function bez(a, b, c, d, t) { var u = 1 - t; return u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d; }
    var dropBuf = null;
    function drawDrops(p) {
      var ds = S.drops, n = ds.length;
      if (!dropBuf || dropBuf.length < n * 3) dropBuf = new Float32Array(Math.max(n, 1) * 3);
      var live = 0;
      for (var i = 0; i < n; i++) {
        var o = ds[i], u = clamp((p - o.d) / o.len, 0, 1);
        if (u <= 0 || u >= 1) continue;
        var e = u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2;
        var rr = o.r * Math.pow(Math.sin(Math.PI * u), .55);
        dropBuf[live * 3] = bez(o.a[0], o.c1[0], o.c2[0], o.b[0], e);
        dropBuf[live * 3 + 1] = bez(o.a[1], o.c1[1], o.c2[1], o.b[1], e);
        dropBuf[live * 3 + 2] = rr; live++;
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, T.fb);
      gl.viewport(0, 0, T.bw, T.bh);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      if (live) {
        var b = P.blob; gl.useProgram(b.p);
        gl.uniform2f(b.u('uRes'), view.cw, view.ch); gl.uniform1f(b.u('uS'), T.bw / view.cw);
        gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
        gl.bindBuffer(gl.ARRAY_BUFFER, B.drops); gl.bufferData(gl.ARRAY_BUFFER, dropBuf.subarray(0, live * 3), gl.DYNAMIC_DRAW);
        var loc = b.a('aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 3, gl.FLOAT, false, 0, 0);
        gl.drawArrays(gl.POINTS, 0, live);
        gl.disable(gl.BLEND);
      }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
      return live;
    }

    function render(now) {
      if (!gl || lost || !P) return;
      var p = S.morphing ? S.p : 1;
      var live = S.morphing ? drawDrops(p) : 0;
      gl.viewport(0, 0, view.w, view.h);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      var m = P.main; gl.useProgram(m.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.glyph); gl.uniform1i(m.u('uG'), 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, T.blob); gl.uniform1i(m.u('uB'), 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(m.u('uRes'), view.w, view.h);
      gl.uniform4fv(m.u('uBox'), view.box);
      gl.uniform1f(m.u('uP'), p); gl.uniform1f(m.u('uT'), now); gl.uniform1f(m.u('uHasB'), live ? 1 : 0);
      gl.uniform1f(m.u('uMorph'), S.morphing ? Math.sin(Math.PI * p) * S.motion : 0);
      gl.uniform1f(m.u('uLight'), S.light ? 1 : 0);
      gl.uniform2f(m.u('uTilt'), S.tilt[0], S.tilt[1]);
      gl.uniform3fv(m.u('uDark'), C.dark); gl.uniform3fv(m.u('uMid'), C.mid); gl.uniform3fv(m.u('uHi'), C.hi); gl.uniform3fv(m.u('uShadow'), C.shadow);
      gl.bindBuffer(gl.ARRAY_BUFFER, B.tri);
      var loc = m.a('aP'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function spinArcs(dt, boost) {
      for (var i = 0; i < arcGs.length; i++) {
        var o = arcGs[i]; o.a = (o.a + dt * o.s * (40 + boost * 420)) % 1000;
        o.e.setAttribute('stroke-dashoffset', o.a.toFixed(1));
      }
    }

    /* ---- value changes ---- */
    function announce(v) { num.textContent = v; }
    function begin(from, to) {
      S.from = from; S.to = to; S.p = 0; S.morphing = true; S.lastNow = 0;
      S.dur = 1.75 / Math.max(S.motion, .35);
      measure(); ensureBlobTarget(); uploadPair(from, to);
      S.drops = planDrops(from, to);
      root.classList.add('is-morph');
    }
    function finish() {
      S.morphing = false; S.p = 1; S.shown = S.to; root.classList.remove('is-morph');
      if (gl && !lost) uploadPair('', S.shown);
      if (S.queued != null) { var q = S.queued; S.queued = null; if (q !== S.shown) begin(S.shown, q); }
    }
    function setValue(v) {
      v = v == null ? '' : String(v);
      S.target = v;
      if (root.getAttribute('data-value') !== v && root.hasAttribute('data-value')) { muteAttr = true; root.setAttribute('data-value', v); }
      announce(v);
      if (!gl || lost) { fallbackSwap(); return; }
      if (!S.seen) return; /* first reveal happens when it scrolls into view */
      if (S.stat) { measure(); ensureBlobTarget(); S.shown = v; S.morphing = false; uploadPair('', v); render(0); return; }
      if (S.morphing) { S.queued = v; return; }
      if (v === S.shown) return;
      begin(S.shown, v); loop.start();
    }
    var fbT = 0;
    function fallbackSwap() {
      root.classList.add('is-swap'); clearTimeout(fbT);
      fbT = setTimeout(function () { root.classList.remove('is-swap'); }, S.stat ? 0 : 420);
    }
    api.add(function () { clearTimeout(fbT); });

    /* public API: el.__apxGLS103.set('$249'), .get(); data-value changes; 'apx:value' events */
    root.__apxGLS103 = { set: setValue, get: function () { return S.target; }, replay: function () { if (!gl || S.stat) return; S.queued = null; begin('', S.target); loop.start(); } };
    var muteAttr = false;
    var mo = new MutationObserver(function () { if (muteAttr) { muteAttr = false; return; } var v = root.getAttribute('data-value'); if (v != null && v !== S.target) setValue(v); });
    mo.observe(root, { attributes: true, attributeFilter: ['data-value'] });
    api.add(function () { mo.disconnect(); });
    api.on(root, 'apx:value', function (e) { var d = e.detail; setValue(d && typeof d === 'object' ? d.value : d); });

    /* ---- loop ---- */
    var loop = ambient(root, api, function (now, dt) {
      if (!gl || lost) return;
      /* morph time uses the real clock (capped) so slow devices still finish on time */
      var rdt = S.lastNow ? clamp(now - S.lastNow, 0, .2) : dt; S.lastNow = now;
      if (S.morphing) {
        S.p += rdt / S.dur;
        if (S.p >= 1) finish();
      }
      var boost = S.morphing ? Math.sin(Math.PI * clamp(S.p, 0, 1)) : 0;
      S.tilt[0] += (S.tiltT[0] - S.tilt[0]) * (1 - Math.exp(-dt * 4));
      S.tilt[1] += (S.tiltT[1] - S.tilt[1]) * (1 - Math.exp(-dt * 4));
      spinArcs(dt * S.motion, boost);
      render(now);
    });
    /* pointer rolls the reflections (mouse); scroll rolls them on touch */
    api.on(W, 'pointermove', function (e) {
      if (e.pointerType === 'touch') return;
      S.tiltT[0] = (e.clientX / W.innerWidth - .5) * 1.2; S.tiltT[1] = (e.clientY / W.innerHeight - .5) * -1;
    }, { passive: true });
    api.on(W, 'scroll', function () {
      var r = root.getBoundingClientRect(); var c = (r.top + r.height / 2) / Math.max(W.innerHeight, 1) - .5;
      S.tiltT[1] = clamp(-c * 1.1, -.8, .8);
    }, { passive: true });

    /* first reveal on scroll-into-view: droplets condense into the number */
    var seenIO = new IntersectionObserver(function (es) {
      var e = es[es.length - 1];
      if (!e.isIntersecting) return;
      if (!triedGL) { initGL(); if (gl) setup(); }
      if (!S.seen && e.intersectionRatio >= .35) {
        S.seen = true;
        if (gl && !lost && !S.stat) { begin('', S.target); loop.start(); }
        else if (gl && !lost) { measure(); ensureBlobTarget(); S.shown = S.target; uploadPair('', S.shown); render(0); }
      }
    }, { threshold: [0, .35] });
    seenIO.observe(root);
    api.add(function () { seenIO.disconnect(); });

    function sizeArcs() {
      var w = arcs.clientWidth || 1, h = arcs.clientHeight || 1;
      arcs.setAttribute('viewBox', (-w / 2) + ' ' + (-h / 2) + ' ' + w + ' ' + h);
      arcGs.forEach(function (o) { var k = (o.e.getAttribute('data-k') || '1').split(' ').map(parseFloat); o.e.setAttribute('rx', (w * .47 * k[0]).toFixed(1)); o.e.setAttribute('ry', (h * .36 * (k[1] || k[0])).toFixed(1)); });
    }
    sizeArcs();
    var ro = new ResizeObserver(function () { sizeArcs(); if (!gl || lost) return; measure(); ensureBlobTarget(); if (!S.morphing) uploadPair('', S.seen ? S.shown : ''); render(performance.now() / 1000); });
    ro.observe(root); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.GLS103 || !gl) return; layoutKey = ''; measure(); if (!S.morphing) { uploadPair('', S.seen ? S.shown : ''); render(performance.now() / 1000); } });

    function setup() {
      var m = motionOf(root);
      S.motion = m; S.stat = m === 0;
      root.classList.toggle('is-static', S.stat);
      readTokens();
      if (!gl || lost) { spinArcs(0, 0); return; }
      layoutKey = ''; measure(); ensureBlobTarget();
      if (S.stat) {
        S.seen = true; S.morphing = false; S.queued = null; S.shown = S.target;
        uploadPair('', S.shown); loop.stop();
        S.tilt = [0, 0]; spinArcs(0, 0); render(0);
      } else {
        if (!S.morphing) uploadPair('', S.seen ? S.shown : '');
        loop.start();
      }
    }
    api.retoken = setup; onEnvChange(api, setup);
    readTokens(); spinArcs(0, 0);
    if (motionOf(root) === 0) root.classList.add('is-static');
  });
})();

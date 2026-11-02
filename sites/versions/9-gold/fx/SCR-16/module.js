/*! APEX library SCR-16 · Exploded Layers — self-contained, token-driven. window.APX['SCR-16'].mount(root) -> destroy() */
(function () {
  /* CLEAR GLASS (9-gold): on data-colour="gold" every slab is see-through glass (no fill, edge light only) and the caption plates carry no fill */
  var GOLD = document.documentElement.getAttribute('data-colour') === 'gold';
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

  function lerp(a, b, t) { return a + (b - a) * t; }
  function band(a, b, x) { return e2((x - a) / (b - a)); }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function lin(c) { return c.slice(0, 3).map(function (v) { return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); }
  function css(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
  function v3sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function v3norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function v3cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function v3dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function perspective(fovy, asp, n, f) { var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0]; }
  function lookAt(e, c) {
    var z = v3norm(v3sub(e, c)), x = v3norm(v3cross([0, 1, 0], z)), y = v3cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -v3dot(x, e), -v3dot(y, e), -v3dot(z, e), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function mT(x, y, z) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]; }
  function mS(s) { return [s, 0, 0, 0, 0, s, 0, 0, 0, 0, s, 0, 0, 0, 0, 1]; }
  function mRx(a) { var c = Math.cos(a), s = Math.sin(a); return [1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]; }
  function mRy(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]; }
  function mRz(a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]; }
  function xform(m, p) { return [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]]; }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

  /* rounded slab (a card of glass or metal) in the XY plane, thickness along z, with a soft bevel */
  function slabGeo(w, h, d, r) {
    var v = [], ix = [], n = 0, ring = [], seg = 7;
    [[w / 2 - r, h / 2 - r, 0], [-(w / 2 - r), h / 2 - r, Math.PI / 2], [-(w / 2 - r), -(h / 2 - r), Math.PI], [w / 2 - r, -(h / 2 - r), Math.PI * 1.5]].forEach(function (k) {
      for (var s = 0; s <= seg; s++) { var a = k[2] + s / seg * Math.PI / 2; ring.push([k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
    });
    var L = ring.length, inset = Math.min(.026, r * .4), e = d * .3;
    var lv = [[d / 2, inset, 1], [d / 2 - e, 0, .35], [-d / 2 + e, 0, -.35], [-d / 2, inset, -1]];
    function vert(p, nr) { v.push(p[0], p[1], p[2], nr[0], nr[1], nr[2]); return n++; }
    for (var li = 0; li < 3; li++) {
      var A = lv[li], B = lv[li + 1];
      for (var k = 0; k < L; k++) {
        var p = ring[k], q = ring[(k + 1) % L], b = n;
        [[p, A], [q, A], [q, B], [p, B]].forEach(function (pv) { var pt = pv[0], l = pv[1]; vert([pt[0] - pt[2] * l[1], pt[1] - pt[3] * l[1], l[0]], v3norm([pt[2], pt[3], l[2]])); });
        ix.push(b, b + 2, b + 1, b, b + 3, b + 2); /* counter-clockwise seen from outside */
      }
    }
    [lv[0], lv[3]].forEach(function (l) {
      var c = vert([0, 0, l[0]], [0, 0, l[2]]), first = n;
      for (var k = 0; k < L; k++) { var pt = ring[k]; vert([pt[0] - pt[2] * l[1], pt[1] - pt[3] * l[1], l[0]], [0, 0, l[2]]); }
      for (var j = 0; j < L; j++) { if (l[2] > 0) ix.push(c, first + j, first + (j + 1) % L); else ix.push(c, first + (j + 1) % L, first + j); }
    });
    return { v: v, i: ix };
  }

  var GLSL_OUT = [
    'vec3 rrt(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}',
    'vec3 aces(vec3 c){c/=.6;c=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777)*c;c=rrt(c);',
    'c=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602)*c;return clamp(c,0.,1.);}',
    'vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,step(c,vec3(.0031308)));}'
  ].join('\n');
  var VS_SLAB = 'attribute vec3 aP;attribute vec3 aN;uniform mat4 uM;uniform mat4 uVP;varying vec3 vP;varying vec3 vN;' +
    'void main(){vec4 w=uM*vec4(aP,1.);vP=w.xyz;vN=(uM*vec4(aN,0.)).xyz;gl_Position=uVP*w;}';
  /* metal / glass with a procedural studio environment (soft box + two strip lights), key light and an accent edge glint */
  var FS_SLAB = [
    'precision highp float;',
    'uniform vec3 uCam,uAlb,uKeyD,uKeyC,uRimP,uRimC,uEnvT,uEnvB,uSoft;uniform float uMet,uRough,uAlpha,uExpo,uGlass,uHz;',
    'varying vec3 vP;varying vec3 vN;',
    GLSL_OUT,
    'vec3 env(vec3 r,float ro){',
    ' vec3 c=mix(uEnvB,uEnvT,smoothstep(-.5,.9,r.y));',
    /* studio horizon: a dark floor and a hard dark band at eye level give metal its chrome contrast (light mode) */
    ' c=mix(c,uEnvB*.22,uHz*smoothstep(.06,-.3,r.y));c*=1.-uHz*.82*exp(-pow((r.y-.02)/.09,2.));',
    ' c+=uSoft*1.7*smoothstep(.84-ro*.5,.985,dot(r,normalize(vec3(.25,.85,.5))));',
    ' vec3 h=normalize(vec3(r.x,0.,r.z)+1e-4);',
    ' c+=uSoft*.95*smoothstep(.9-ro*.4,.996,dot(h,normalize(vec3(.92,0.,.38))))*smoothstep(-.35,.15,r.y)*smoothstep(.85,.3,r.y);',
    ' c+=uSoft*.4*smoothstep(.93-ro*.4,.996,dot(h,normalize(vec3(-.95,0.,.3))))*smoothstep(-.3,.2,r.y);',
    ' return c;}',
    'void main(){',
    ' vec3 n=normalize(vN);vec3 V=normalize(uCam-vP);if(dot(n,V)<0.&&uGlass>.5)n=-n;',
    ' float nv=clamp(dot(n,V),0.,1.);vec3 R=normalize(reflect(-V,n)+vec3(vP.x*.045,vP.y*.07,0.));',
    ' vec3 F0=mix(vec3(.04),uAlb,uMet);float fr=pow(1.-nv,5.);vec3 F=F0+(1.-F0)*fr*(1.-uRough*.7);',
    ' vec3 L=normalize(uKeyD);float nl=max(dot(n,L),0.);vec3 H=normalize(L+V);',
    ' float sp=pow(max(dot(n,H),0.),mix(500.,24.,uRough))*mix(4.,.7,uRough);',
    ' vec3 amb=mix(uEnvB,uEnvT,n.y*.5+.5);',
    ' vec3 col=uAlb*(1.-uMet)*(uKeyC*nl+amb)*.85*(1.-uGlass*.8)+env(R,uRough)*F+uKeyC*sp*F*nl;',
    ' vec3 lr=normalize(uRimP-vP);col+=uRimC*pow(1.-nv,3.)*max(dot(n,lr),0.);',
    ' col=srgb(aces(col*uExpo));',
    ' vec3 er=env(R,.1);float a=uGlass>.5?clamp(uAlpha+fr*.5+max(dot(er,vec3(.33))-.6,0.)*.12,0.,.9):1.;',
    ' gl_FragColor=vec4(col*a,a);',
    '}'].join('\n');
  var VS_TEX = 'attribute vec3 aP;attribute vec2 aU;uniform mat4 uM;uniform mat4 uVP;varying vec2 vU;void main(){vU=aU;gl_Position=uVP*uM*vec4(aP,1.);}';
  var FS_TEX = 'precision mediump float;uniform sampler2D uT;uniform float uOp;varying vec2 vU;void main(){gl_FragColor=texture2D(uT,vU)*uOp;}';
  var VS_FLAT = 'attribute vec3 aP;uniform mat4 uM;uniform mat4 uVP;uniform float uPs;varying vec2 vQ;void main(){vQ=aP.xz;gl_Position=uVP*uM*vec4(aP,1.);gl_PointSize=uPs;}';
  /* uMode 0 = solid line/point, 1 = radial pool on the floor (glow or shadow), 2 = round point */
  var FS_FLAT = 'precision mediump float;uniform vec3 uCol;uniform float uOp,uMode,uAdd;varying vec2 vQ;' +
    'void main(){float a=uOp;if(uMode>.5&&uMode<1.5){float r=length(vQ);a*=pow(max(0.,1.-r),1.8);}' +
    'if(uMode>1.5){float r=length(gl_PointCoord-.5)*2.;if(r>1.)discard;a*=1.-smoothstep(.2,1.,r);}' +
    'gl_FragColor=vec4(uCol*a,a*(1.-uAdd));}';

  /* SCR-16 · Exploded Layers — a layered device holds, then pulls apart into labelled slices as you scroll, each step easing forward, then snaps back together. */
  register('SCR-16', 'Exploded Layers', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr16__stage');
    if (!stage) return;
    var listEl = root.querySelector('.apx-scr16__layers');
    var lis = listEl ? [].slice.call(listEl.querySelectorAll(':scope > li')) : [];
    var N = clamp(lis.length || 6, 2, 8);
    var copy = root.querySelector('.apx-scr16__copy'), cue = root.querySelector('.apx-scr16__cue'), note = root.querySelector('.apx-scr16__note');
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var still = clamp(parseFloat(opt('still', 'data-still', '.5')), 0, 1);
    var sampleTag = opt('sampleTag', 'data-sample-tag', 'SAMPLE');
    var LAYERS = [];
    for (var li0 = 0; li0 < N; li0++) {
      var el = lis[li0], b = el && el.querySelector('b'), s = el && el.querySelector('span');
      LAYERS.push({
        label: (el && el.getAttribute('data-label')) || (b ? b.textContent.trim() : 'LAYER ' + (li0 + 1)),
        sub: (el && el.getAttribute('data-sub')) || '',
        title: b ? b.textContent.trim() : '', text: s ? s.textContent.trim() : ''
      });
    }

    /* ---- DOM: numbered steps, note ---- */
    var restore = [];
    lis.forEach(function (el, i) {
      var html = el.innerHTML; restore.push(function () { el.innerHTML = html; el.classList.remove('is-on', 'is-now'); el.removeAttribute('tabindex'); el.removeAttribute('role'); });
      el.insertAdjacentHTML('afterbegin', '<em class="apx-scr16__n" aria-hidden="true">' + (i < 9 ? '0' : '') + (i + 1) + '</em>');
      el.insertAdjacentHTML('beforeend', '<i class="apx-scr16__tick" aria-hidden="true"></i>');
    });
    var noteB = null, noteS = null;
    if (note) { var nh = note.innerHTML; restore.push(function () { note.innerHTML = nh; note.style.cssText = ''; }); note.innerHTML = '<b></b><span></span>'; noteB = note.firstChild; noteS = note.lastChild; }
    restore.push(function () { if (copy) copy.style.cssText = ''; if (cue) cue.style.cssText = ''; });

    /* ---- WebGL ---- */
    var cv = D.createElement('canvas'); cv.className = 'apx-scr16__gl'; cv.setAttribute('aria-hidden', 'true');
    stage.insertBefore(cv, stage.firstChild);
    api.add(function () { cv.remove(); restore.forEach(function (f) { f(); }); root.classList.remove('is-static', 'is-compact', 'is-fallback', 'is-light'); });
    var compact = isCompact(), gl = null;
    try { gl = cv.getContext('webgl', { antialias: !compact, alpha: true, premultipliedAlpha: true, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    if (!gl) { cv.remove(); root.classList.add('is-fallback'); }
    var P = {}, B = {}, TX = [], C = {}, lost = false;
    function prog(vs, fs) {
      function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('APX SCR-16 shader: ' + gl.getShaderInfoLog(x)); return x; }
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      var U = {}, A = {};
      return { p: p, u: function (n) { return U[n] !== undefined ? U[n] : (U[n] = gl.getUniformLocation(p, n)); }, a: function (n) { return A[n] !== undefined ? A[n] : (A[n] = gl.getAttribLocation(p, n)); } };
    }
    var maxAttr = 0;
    function attribs(pr, buf, layout, stride) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      for (var k = 0; k < maxAttr; k++) gl.disableVertexAttribArray(k);
      var off = 0;
      layout.forEach(function (l) { var loc = pr.a(l[0]); if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, l[1], gl.FLOAT, false, stride * 4, off * 4); maxAttr = Math.max(maxAttr, loc + 1); } off += l[1]; });
    }
    function buf(data) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW); return b; }
    function freeScene() {
      if (!gl) return;
      Object.keys(B).forEach(function (k) { if (B[k].vb) gl.deleteBuffer(B[k].vb); if (B[k].ib) gl.deleteBuffer(B[k].ib); });
      TX.forEach(function (t) { gl.deleteTexture(t); }); B = {}; TX = [];
    }
    if (gl) {
      try { P.slab = prog(VS_SLAB, FS_SLAB); P.tex = prog(VS_TEX, FS_TEX); P.flat = prog(VS_FLAT, FS_FLAT); }
      catch (e) { gl = null; cv.remove(); root.classList.add('is-fallback'); }
    }
    var aniso = gl && (gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));

    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), ink = rgba(tok(root, '--apx-ink', '#ecebe8')), mu = rgba(tok(root, '--apx-muted', '#9d9ca3')), acc = rgba(tok(root, '--apx-accent', '#cfd3da'));
      C = { bg: bg, ink: ink, mu: mu, acc: acc, light: lum(bg) > .5, font: tok(root, '--apx-font-text', 'system-ui, sans-serif'), mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
      root.classList.toggle('is-light', C.light);
    }

    /* label printed on each slice: a dark (or pale) plate so it reads on bright metal */
    function labelCanvas(i) {
      /* drawn in a 1024x640 design space, stored as a power-of-two 1024x1024 texture (WebGL 1 mipmaps) */
      var c = D.createElement('canvas'); c.width = 1024; c.height = 1024; var g = c.getContext('2d'), L = C.light, ink = C.ink, acc = C.acc;
      g.clearRect(0, 0, 1024, 1024); g.scale(1, 1024 / 640);
      if (GOLD) { g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 16; } else { g.fillStyle = L ? css(mix3(C.bg, [1, 1, 1], .4), .8) : css(mix3(C.bg, [0, 0, 0], .3), .66); g.fillRect(46, 46, 932, 548); }
      g.strokeStyle = GOLD ? 'rgba(222,205,165,.8)' : css(ink, L ? .2 : .22); g.lineWidth = 2; g.strokeRect(46, 46, 932, 548);
      var title = LAYERS[i].label.toUpperCase(), sz = 74;
      g.font = '600 ' + sz + 'px ' + C.font; while (g.measureText(title).width > 760 && sz > 40) { sz -= 2; g.font = '600 ' + sz + 'px ' + C.font; }
      var last = i === N - 1, bright = lum(acc) > .45;
      g.fillStyle = last ? (L && bright ? css(mix3(acc, ink, .55)) : css(acc)) : css(ink, .94); g.fillText(title, 92, 200);
      g.fillStyle = css(ink, .58); g.font = '400 40px ' + C.font;
      var sub = LAYERS[i].sub; while (sub && g.measureText(sub).width > 830) sub = sub.slice(0, -2);
      if (sub) g.fillText(sub, 92, 274);
      g.fillStyle = L && bright ? css(mix3(acc, ink, .55)) : css(acc); g.font = '500 32px ' + C.mono; g.fillText((i < 9 ? '0' : '') + (i + 1) + ' / ' + (N < 10 ? '0' : '') + N, 92, 540);
      for (var k = 0; k < 5; k++) { g.fillStyle = css(ink, .08 + k * .03); g.fillRect(92, 340 + k * 34, 420 + ((i * 97 + k * 61) % 340), 12); }
      if (sampleTag) {
        g.font = '500 24px ' + C.mono; var tw = g.measureText(sampleTag).width;
        g.strokeStyle = css(ink, .35); g.lineWidth = 2; g.strokeRect(930 - tw - 36, 88, tw + 36, 46);
        g.fillStyle = css(ink, .7); g.fillText(sampleTag, 930 - tw - 18, 120);
      }
      return c;
    }
    function texFrom(canvas) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(4, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      return t;
    }
    function buildScene() {
      freeScene();
      var g = slabGeo(3.2, 2.0, .07, .12);
      B.slab = { vb: buf(g.v), ib: gl.createBuffer(), n: g.i.length };
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B.slab.ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(g.i), gl.STATIC_DRAW);
      B.label = { vb: buf([-1.5, .9375, .04, 0, 0, 1.5, .9375, .04, 1, 0, 1.5, -.9375, .04, 1, 1, -1.5, -.9375, .04, 0, 1]) };
      var ring = []; for (var k = 0; k < 160; k++) { var a = k / 160 * Math.PI * 2; ring.push(Math.cos(a) * 2.25, 0, Math.sin(a) * 2.25); }
      B.ring = { vb: buf(ring), n: 160 };
      B.pool = { vb: buf([-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, -1, 1, 0, 1, -1, 0, 1]) };
      var r = rng(5), nd = compact ? 160 : 360, dp = [];
      for (var i = 0; i < nd; i++) dp.push((r() - .5) * 14, (r() - .5) * 8, (r() - .5) * 8 - 2);
      B.dust = { vb: buf(dp), n: nd };
      B.dot = { vb: buf([0, 0, 0]) };
      for (var j = 0; j < N; j++) TX.push(texFrom(labelCanvas(j)));
    }
    function redrawLabels() {
      if (!gl || !TX.length) return;
      for (var j = 0; j < N; j++) {
        gl.bindTexture(gl.TEXTURE_2D, TX[j]); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, labelCanvas(j)); gl.generateMipmap(gl.TEXTURE_2D);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
      }
    }

    var view = { w: 2, h: 2, asp: 1 };
    function size() {
      if (!gl) return;
      var r = cv.getBoundingClientRect(), dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.25 : 1.75);
      var w = Math.max(2, Math.round(r.width * dpr)), h = Math.max(2, Math.round(r.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      view.w = w; view.h = h; view.asp = r.width / Math.max(1, r.height); view.dpr = dpr;
    }

    /* ---- one frame: p = scroll progress 0..1, k = active slice (-1 none) ---- */
    var L8 = []; for (var q = 0; q < N; q++) L8.push({ lift: 0 });
    var st8 = { tx: 0, ty: 0, hover: -1 };
    function render(p, k, now, dt, motion, liftNow) {
      if (!gl || lost || !B.slab) return;
      var L = C.light, e = band(.04, .26, p) * (1 - band(.8, .96, p)), c = (N - 1) / 2, wob = motion ? 1 : 0;
      var sideRest = !compact && view.asp > 1.15;
      /* wide: the closed device rests beside the copy; narrow: the whole picture is lifted above the copy (lens shift) */
      var restX = sideRest ? 1.45 : 0, restY = 0, scale = sideRest ? 1 : (compact ? .72 : .8), vshift = sideRest ? 0 : (compact ? .44 : .32) * (1 - e), spr = sideRest ? .62 : .42;
      var ringS = sideRest ? 1 : clamp(view.asp * 1.25, .5, .8); /* the floor ring always fits a narrow screen */
      var orbit = (-.55 + p * 1.1) * (sideRest ? 1 : .6) + st8.tx * .15, dist = 8.3 + e * .6 + (sideRest ? 0 : 2.6 + e * 1.3);
      var eye = [Math.sin(orbit) * dist, 1.2 + e * .6 - st8.ty * .35, Math.cos(orbit) * dist];
      var pr = perspective(32 * Math.PI / 180, view.asp, .1, 100); pr[9] = -vshift; var V = lookAt(eye, [0, -.05 + e * .1, -.6 * e]), VP = mul(pr, V);
      var devX = sideRest ? lerp(restX, -.4, e) : 0; /* apart, the device sits a little left so the step list stays clear */
      var dev = mul(mul(mT(devX, restY * (1 - e), 0), mRz(Math.sin(now * .4) * .02 * wob)), mS(scale));
      gl.viewport(0, 0, view.w, view.h); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
      var focus = st8.hover >= 0 && e > .5 ? st8.hover : k;
      var Ms = [], ease = liftNow ? 1 : 1 - Math.exp(-dt * 5);
      for (var i = 0; i < N; i++) {
        var Ld = L8[i], want = focus === i ? 1 : 0;
        Ld.lift += (want - Ld.lift) * ease;
        /* a slice changing place slides out past the deck edge on its way (never through the other slices) */
        Ld.dir = Ld.dir === undefined ? 1 : Ld.dir + ((want ? 1 : -1) - Ld.dir) * Math.min(1, ease * 2.5);
        var lift = Ld.lift * e, arc = liftNow ? 0 : Math.sin(Math.PI * clamp(Ld.lift, 0, 1)) * e;
        var z = i * .085 + e * ((i - c) * spr) + lift * ((N - 1 - i) * spr + .75), y = e * ((i - c) * .22) + lift * .22 - arc * (sideRest ? .55 : .9), x = e * (i % 2 ? .22 : -.22) + arc * Ld.dir * (sideRest ? 2.6 : 1.3);
        var M = mul(dev, mul(mT(x, y, z), mul(mRx(-e * .35 + Math.sin(now * .6 + i) * .015 * wob), mRy(e * (i - c) * .08))));
        Ms.push(M);
      }
      var ink = lin(C.ink), bg = lin(C.bg), acc = lin(C.acc);
      var envT = L ? mix3(bg, [1, 1, 1], .5).map(function (v) { return v * 1.15; }) : mix3(bg, ink, .3), envB = L ? mix3(bg, ink, .62) : bg.map(function (v) { return v * .5; });
      var soft = (L ? [1, 1, 1] : ink).map(function (v) { return v * (L ? 2.6 : 2.1); });
      var rimI = (3.2 + Math.sin(now * 1.4) * 1.1 * wob) * (L ? .5 : 1);
      var s = P.slab; gl.useProgram(s.p);
      gl.uniformMatrix4fv(s.u('uVP'), false, VP); gl.uniform3fv(s.u('uCam'), eye);
      gl.uniform3fv(s.u('uKeyD'), v3norm([3, 5, 4])); gl.uniform3fv(s.u('uKeyC'), (L ? [1, 1, 1] : ink).map(function (v) { return v * 1.4; }));
      gl.uniform3fv(s.u('uRimP'), xform(dev, [-2.2, -1, 1.8])); gl.uniform3fv(s.u('uRimC'), acc.map(function (v) { return v * rimI * .35; }));
      gl.uniform3fv(s.u('uEnvT'), envT); gl.uniform3fv(s.u('uEnvB'), envB); gl.uniform3fv(s.u('uSoft'), soft); gl.uniform1f(s.u('uExpo'), L ? .9 : 1); gl.uniform1f(s.u('uHz'), L ? 1 : 0);
      var dark = mix3(bg, ink, L ? .2 : .13), lite = mix3(bg, ink, L ? .5 : .42);
      function mat(i) {
        if (i === N - 1) return { alb: L ? [.87, .88, .89] : mix3(ink, bg, .1), met: .1, ro: .08, glass: 1 };
        /* light mode: real polished metals (silver and gunmetal), low roughness, so they mirror the studio instead of reading as matte plastic */
        if (L) return i % 2 ? { alb: [.93, .94, .96], met: 1, ro: .14 } : { alb: [.46, .48, .52], met: 1, ro: .22 };
        return i % 2 ? { alb: lite, met: .95, ro: .36 } : { alb: dark, met: .95, ro: .5 };
      }
      function drawSlab(i) {
        var m = GOLD ? { alb: mix3(ink, bg, .1), met: .1, ro: .08, glass: 1 } : mat(i);
        gl.uniformMatrix4fv(s.u('uM'), false, Ms[i]); gl.uniform3fv(s.u('uAlb'), m.alb); gl.uniform1f(s.u('uMet'), m.met); gl.uniform1f(s.u('uRough'), m.ro);
        gl.uniform1f(s.u('uGlass'), m.glass ? 1 : 0); gl.uniform1f(s.u('uAlpha'), GOLD ? .02 : L ? .26 : .2);
        attribs(s, B.slab.vb, [['aP', 3], ['aN', 3]], 6); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B.slab.ib); gl.drawElements(gl.TRIANGLES, B.slab.n, gl.UNSIGNED_SHORT, 0);
      }
      if (!GOLD) for (var i2 = 0; i2 < N - 1; i2++) drawSlab(i2);
      /* floor pool: accent glow at night, soft shadow by day */
      gl.disable(gl.CULL_FACE); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.depthMask(false);
      var f = P.flat; gl.useProgram(f.p); gl.uniformMatrix4fv(f.u('uVP'), false, VP); gl.uniform1f(f.u('uPs'), 1);
      var floorY = -1.45 * scale;
      gl.uniformMatrix4fv(f.u('uM'), false, mul(mT(devX * .6, floorY, 0), [3.4 * ringS, 0, 0, 0, 0, 1, 0, 0, 0, 0, 2.2 * ringS, 0, 0, 0, 0, 1]));
      gl.uniform1f(f.u('uMode'), 1);
      if (L) { gl.uniform3fv(f.u('uCol'), mix3(C.ink, C.bg, .2)); gl.uniform1f(f.u('uOp'), .2 + e * .04); gl.uniform1f(f.u('uAdd'), 0); }
      else { gl.uniform3fv(f.u('uCol'), C.acc.slice(0, 3)); gl.uniform1f(f.u('uOp'), (.2 + Math.sin(now * 1.2) * .06 * wob)); gl.uniform1f(f.u('uAdd'), 1); }
      attribs(f, B.pool.vb, [['aP', 3]], 3); gl.drawArrays(gl.TRIANGLES, 0, 6);
      /* transparent pass, back to front: glass slab + every label */
      var order = Ms.map(function (M, i) { var pc = xform(M, [0, 0, 0]); return { i: i, d: Math.hypot(pc[0] - eye[0], pc[1] - eye[1], pc[2] - eye[2]) }; }).sort(function (a, b2) { return b2.d - a.d; });
      var t = P.tex;
      order.forEach(function (o) {
        var i = o.i;
        if (i === N - 1 || GOLD) {
          gl.useProgram(s.p); gl.enable(gl.CULL_FACE);
          gl.cullFace(gl.FRONT); drawSlab(i); gl.cullFace(gl.BACK); drawSlab(i);
          gl.disable(gl.CULL_FACE);
        }
        var Ld = L8[i], op = (i === N - 1 ? 1 - e : 0) * .95 + e * (k < 0 && focus < 0 ? .55 : .07 + Ld.lift * .93);
        if (op < .01) return;
        gl.useProgram(t.p); gl.uniformMatrix4fv(t.u('uVP'), false, VP); gl.uniformMatrix4fv(t.u('uM'), false, Ms[i]); gl.uniform1f(t.u('uOp'), op);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, TX[i]); gl.uniform1i(t.u('uT'), 0);
        attribs(t, B.label.vb, [['aP', 3], ['aU', 2]], 5); gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      });
      /* ring, travelling glint, dust */
      gl.useProgram(f.p); gl.uniformMatrix4fv(f.u('uVP'), false, VP);
      var RM_ = mul(mul(mT(0, floorY, 0), mRx(Math.PI / 2.2 - Math.PI / 2)), mS(ringS));
      gl.uniformMatrix4fv(f.u('uM'), false, RM_); gl.uniform1f(f.u('uMode'), 0); gl.uniform1f(f.u('uAdd'), 0);
      gl.uniform3fv(f.u('uCol'), L ? mix3(C.acc, C.ink, .2) : C.acc.slice(0, 3)); gl.uniform1f(f.u('uOp'), L ? .5 : .5);
      attribs(f, B.ring.vb, [['aP', 3]], 3); gl.drawArrays(gl.LINE_LOOP, 0, B.ring.n);
      var ga = now * .5;
      gl.uniformMatrix4fv(f.u('uM'), false, mul(RM_, mT(Math.cos(ga) * 2.25, 0, Math.sin(ga) * 2.25)));
      gl.uniform1f(f.u('uMode'), 2); gl.uniform1f(f.u('uPs'), 9 * view.dpr); gl.uniform1f(f.u('uOp'), L ? .85 : 1); gl.uniform1f(f.u('uAdd'), L ? 0 : .6);
      attribs(f, B.dot.vb, [['aP', 3]], 3); gl.drawArrays(gl.POINTS, 0, 1);
      gl.uniformMatrix4fv(f.u('uM'), false, mul(mT(0, Math.sin(now * .2) * .1 * wob, 0), mRy(now * .015 * wob)));
      gl.uniform1f(f.u('uPs'), Math.max(1.5, 2.2 * view.dpr)); gl.uniform3fv(f.u('uCol'), mix3(C.ink, C.mu, .3)); gl.uniform1f(f.u('uOp'), L ? .35 : .45); gl.uniform1f(f.u('uAdd'), 0);
      attribs(f, B.dust.vb, [['aP', 3]], 3); gl.drawArrays(gl.POINTS, 0, B.dust.n);
      gl.depthMask(true); gl.disable(gl.BLEND);
      if (W.APX_TEST) root.__scr16 = { eye: eye, e: e, k: k, focus: focus, pos: Ms.map(function (M) { return xform(M, [0, 0, 0]).map(function (v) { return +v.toFixed(2); }); }), lift: L8.map(function (l) { return +l.lift.toFixed(2); }), order: order.map(function (o) { return o.i; }) };
    }

    /* ---- scroll + DOM choreography ---- */
    var state = { p: -1, k: -2, motion: 1, stat: false, note: -2, lastDom: -9 };
    function rawP() { var r = root.getBoundingClientRect(), len = r.height - W.innerHeight; return len > 1 ? clamp(-r.top / len, 0, 1) : 0; }
    function kOf(p) { return p < .22 || p > .8 ? -1 : Math.min(N - 1, Math.floor((p - .22) / (.58 / N))); }
    function dom(p, k) {
      var key = Math.round(p * 2000) + st8.hover * 1e5; if (key === state.lastDom && k === state.k) return; state.lastDom = key;
      if (copy) { var co = 1 - band(.06, .2, p) + band(.9, 1, p); copy.style.opacity = co.toFixed(3); copy.style.transform = 'translate3d(0,' + (-(1 - co) * 40).toFixed(1) + 'px,0)'; copy.style.visibility = co < .01 ? 'hidden' : ''; }
      if (cue) cue.style.opacity = (1 - band(.01, .08, p)).toFixed(3);
      if (note) { var no = band(.2, .26, p) * (1 - band(.78, .84, p)); note.style.opacity = no.toFixed(3); note.style.visibility = no < .01 ? 'hidden' : 'visible'; }
      if (k !== state.k) {
        state.k = k;
        lis.forEach(function (el, i) { el.classList.toggle('is-on', i <= k); el.classList.toggle('is-now', i === k); });
      }
      var nk = st8.hover >= 0 && k >= 0 ? st8.hover : k;
      if (nk >= 0 && note && nk !== state.note) {
        state.note = nk; noteB.textContent = (nk < 9 ? '0' : '') + (nk + 1) + ' · ' + (LAYERS[nk].title || LAYERS[nk].label); noteS.textContent = LAYERS[nk].text;
        note.classList.remove('is-swap'); void note.offsetWidth; note.classList.add('is-swap');
      }
    }
    var loop = ambient(root, api, function (now, dt) {
      var raw = rawP();
      if (state.p < 0) state.p = raw; else state.p += (raw - state.p) * (1 - Math.exp(-dt * 6));
      if (Math.abs(raw - state.p) < .0002) state.p = raw;
      st8.tx += (ptr.x - st8.tx) * (1 - Math.exp(-dt * 3)); st8.ty += (ptr.y - st8.ty) * (1 - Math.exp(-dt * 3));
      var k = kOf(state.p);
      dom(state.p, k);
      render(state.p, k, now, dt, state.motion, false);
    });
    var ptr = { x: 0, y: 0 };
    api.on(W, 'pointermove', function (e) { if (e.pointerType === 'touch') return; ptr.x = e.clientX / W.innerWidth - .5; ptr.y = e.clientY / W.innerHeight - .5; }, { passive: true });
    /* the step list: hover pulls that slice forward, click scrolls to it */
    lis.forEach(function (el, i) {
      el.setAttribute('tabindex', '0'); el.setAttribute('role', 'button');
      api.on(el, 'pointerenter', function (e) { if (e.pointerType !== 'touch') st8.hover = i; });
      api.on(el, 'pointerleave', function () { st8.hover = -1; });
      function go() {
        if (state.stat) return;
        var r = root.getBoundingClientRect(), len = r.height - W.innerHeight, p = .22 + (i + .5) * (.58 / N);
        W.scrollTo({ top: W.scrollY + r.top + p * len, behavior: 'smooth' });
      }
      api.on(el, 'click', go);
      api.on(el, 'keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
      api.on(el, 'focus', function () { st8.hover = i; }); api.on(el, 'blur', function () { st8.hover = -1; });
    });

    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.add('is-fallback'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; root.classList.remove('is-fallback'); setup(); });
      api.add(function () { freeScene(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    function paintStill() { st8.tx = st8.ty = 0; st8.hover = -1; var k = kOf(still); render(still, k, 0, 1, 0, true); }
    var ro = new ResizeObserver(function () { size(); if (state.stat) paintStill(); });
    ro.observe(cv.parentNode); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.SCR16 || !gl) return; redrawLabels(); if (state.stat) paintStill(); });

    function setup() {
      var m = motionOf(root); compact = isCompact();
      state.motion = m; state.stat = m === 0;
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-compact', compact);
      readTokens();
      if (gl) buildScene();
      size();
      state.p = -1; state.k = -2; state.note = -2; state.lastDom = -9;
      if (state.stat) {
        loop.stop();
        lis.forEach(function (el) { el.classList.remove('is-on', 'is-now'); });
        if (copy) copy.style.cssText = ''; if (cue) cue.style.cssText = ''; if (note) note.style.cssText = '';
        paintStill();
      } else { var p = rawP(); dom(p, kOf(p)); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

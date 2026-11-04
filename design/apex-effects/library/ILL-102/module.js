/*! APEX library ILL-102 · Caustic Glass — self-contained, token-driven. window.APX['ILL-102'].mount(root) -> destroy() */
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
  function isTouch() { return W.matchMedia('(hover: none)').matches; }
  var _cx;
  function rgba(str, fb) {
    if (!_cx) { var c = D.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = fb || '#000'; _cx.fillStyle = str || fb || '#000';
    _cx.fillRect(0, 0, 1, 1); var d = _cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
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
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); } };
  }
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)'), hv = W.matchMedia('(hover: none)');
    var h = function () { fn(); };
    [RM, mq, hv].forEach(function (q) { if (q.addEventListener) { q.addEventListener('change', h); api.add(function () { q.removeEventListener('change', h); }); } });
  }

  /* ---- maths ---- */
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function perspective(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function mul4(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function mul3(a, b) {
    var o = new Array(9);
    for (var c = 0; c < 3; c++) for (var r = 0; r < 3; r++) o[c * 3 + r] = a[r] * b[c * 3] + a[3 + r] * b[c * 3 + 1] + a[6 + r] * b[c * 3 + 2];
    return o;
  }
  function rotX(b) { var c = Math.cos(b), s = Math.sin(b); return [1, 0, 0, 0, c, s, 0, -s, c]; }
  function rotY(a) { var c = Math.cos(a), s = Math.sin(a); return [c, 0, -s, 0, 1, 0, s, 0, c]; }
  function rotZ(a) { var c = Math.cos(a), s = Math.sin(a); return [c, s, 0, -s, c, 0, 0, 0, 1]; }

  /* ---- shaders ---- */
  var NOISE = [
    'vec2 hh2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));return -1.+2.*fract(sin(p)*43758.5453);}',
    'vec3 nzd(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*f*(f*(f*6.-15.)+10.);vec2 du=30.*f*f*(f*(f-2.)+1.);',
    ' vec2 ga=hh2(i),gb=hh2(i+vec2(1.,0.)),gc=hh2(i+vec2(0.,1.)),gd=hh2(i+vec2(1.,1.));',
    ' float va=dot(ga,f),vb=dot(gb,f-vec2(1.,0.)),vc=dot(gc,f-vec2(0.,1.)),vd=dot(gd,f-vec2(1.,1.));',
    ' return vec3(va+u.x*(vb-va)+u.y*(vc-va)+u.x*u.y*(va-vb-vc+vd),ga+u.x*(gb-ga)+u.y*(gc-ga)+u.x*u.y*(ga-gb-gc+gd)+du*(u.yx*(va-vb-vc+vd)+vec2(vb,vc)-va));}',
    'uniform float uTime;uniform vec4 uRip;',
    /* glass surface: slow drifting gradient-noise swell + a tap ripple. returns slope (d/dx, d/dz) */
    'vec2 slope(vec2 lp,vec2 wp){vec2 g=vec2(0.);float t=uTime;',
    ' vec3 n=nzd(lp*3.2+vec2(t*.09,-t*.06));g+=n.yz*3.2;',
    ' n=nzd(lp*5.9*mat2(.8,.6,-.6,.8)+vec2(-t*.13,t*.1)+7.3);g+=n.yz*5.9*.3*mat2(.8,.6,-.6,.8);',
    ' n=nzd(lp*10.7*mat2(.6,-.8,.8,.6)+vec2(t*.17,t*.14)+3.1);g+=n.yz*10.7*.06*mat2(.6,-.8,.8,.6);',
    ' if(uRip.w>0.){float age=t-uRip.z;vec2 d=wp-uRip.xy;float r=length(d)+1e-4;float fr=age*.9;',
    '  float env=exp(-age*1.1)*exp(-pow((r-fr)*3.,2.));g+=uRip.w*env*cos(r*16.-age*10.)*16.*.13*(d/r);}',
    ' return g;}'
  ].join('\n');
  var VS_CAU = [
    'attribute vec2 aU;',
    'uniform mat3 uR;uniform vec3 uC;uniform vec2 uSize;uniform float uSeed,uAmp,uIor,uMode;uniform vec3 uL;uniform vec4 uMap;',
    'varying vec3 vOld;varying vec3 vNew;varying vec2 vUV;',
    NOISE,
    'void main(){vec2 lp=aU*uSize;vec3 S=uC+uR*vec3(lp.x,0.,lp.y);',
    ' vec2 g=slope(lp+uSeed,S.xz)*uAmp;',
    ' vec3 Tx=uR*vec3(1.,0.,0.),Tz=uR*vec3(0.,0.,1.),n0=uR*vec3(0.,1.,0.);',
    ' vec3 n=normalize(n0-g.x*Tx-g.y*Tz);vec3 I=normalize(S-uL);',
    ' vec3 r1=refract(I,n,1./uIor);vec3 r2=refract(r1,n0,uIor);if(dot(r2,r2)<.01)r2=r1;if(r2.y>-.05)r2.y=-.05;',
    ' vOld=S+I*(-S.y/min(I.y,-.05));vNew=S+r2*(-S.y/r2.y);vUV=aU;',
    ' vec3 Q=uMode>.5?vOld:vNew;vec2 m=(Q.xz-uMap.xy)*uMap.zw*2.-1.;gl_Position=vec4(m,0.,1.);}'
  ].join('\n');
  var FS_CAU = [
    '#extension GL_OES_standard_derivatives : enable',
    'precision highp float;varying vec3 vOld;varying vec3 vNew;varying vec2 vUV;uniform vec2 uSize;uniform float uCut,uMode,uTrans;',
    'void main(){vec2 a=(.5-abs(vUV))*uSize;if(vUV.x*vUV.y>0.&&a.x+a.y<uCut)discard;',
    ' if(uMode>.5){gl_FragColor=vec4(0.,.5,0.,1.);return;}',
    ' float oA=length(dFdx(vOld))*length(dFdy(vOld));float nA=length(dFdx(vNew))*length(dFdy(vNew));',
    ' float r=oA/max(nA,1e-9);float ef=smoothstep(0.,.14,min(a.x,a.y));gl_FragColor=vec4(min(r,14.)*uTrans*.16*mix(.55,1.,ef),0.,0.,1.);}'
  ].join('\n');
  var VS_FS = 'attribute vec2 aQ;varying vec2 vQ;void main(){vQ=aQ;gl_Position=vec4(aQ,0.,1.);}';
  var FS_FLOOR = [
    'precision highp float;varying vec2 vQ;',
    'uniform sampler2D uTex;uniform vec3 uCam,uF,uRt,uUp,uL,uBg,uLc,uAcc,uInk;uniform vec2 uTan,uTx;uniform vec4 uMap;uniform float uLight,uLI,uGr,uT2;',
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1.,0.)),f.x),mix(h21(i+vec2(0.,1.)),h21(i+vec2(1.,1.)),f.x),f.y);}',
    'void main(){',
    ' vec3 rd=normalize(uF+vQ.x*uTan.x*uRt+vQ.y*uTan.y*uUp);float t=-uCam.y/min(rd.y,-.001);vec3 P=uCam+rd*t;',
    ' vec2 cu=(P.xz-uMap.xy)*uMap.zw;vec4 c=texture2D(uTex,cu);',
    ' float cov=c.g*.4;cov+=texture2D(uTex,cu+vec2(uTx.x,0.)).g*.15;cov+=texture2D(uTex,cu-vec2(uTx.x,0.)).g*.15;cov+=texture2D(uTex,cu+vec2(0.,uTx.y)).g*.15;cov+=texture2D(uTex,cu-vec2(0.,uTx.y)).g*.15;',
    ' cov=clamp(cov*2.,0.,1.);',
    ' float glow=(texture2D(uTex,cu+vec2(uTx.x,uTx.y)*.7).r+texture2D(uTex,cu-vec2(uTx.x,uTx.y)*.7).r+texture2D(uTex,cu+vec2(uTx.x,-uTx.y)*.7).r+texture2D(uTex,cu-vec2(uTx.x,-uTx.y)*.7).r)*.25/.16;',
    ' float caus=c.r/.16;',
    ' vec3 l=uL-P;float dl=length(l);float fall=uLI*pow(l.y/dl,8.)/(1.+dl*dl*.004);',
    ' float stone=vn(P.xz*3.)*.6+vn(P.xz*11.)*.4;',
    ' float vig=smoothstep(1.6,.2,length(vQ*vec2(.85,1.)));',
    ' float gr=h21(gl_FragCoord.xy+uT2)-.5;',
    ' vec3 col;',
    ' if(uLight<.5){',
    '  float lit=(1.-cov)*.06+cov*.01+pow(caus,1.25)*.17+glow*.08;',
    '  col=uBg*(.7+.4*vig)+uLc*lit*fall*(.92+.16*stone);',
    '  col+=uAcc*smoothstep(4.2,7.,caus)*fall*.05;',
    '  col+=gr*.01;',
    ' }else{',
    '  col=uBg*(.8+.2*fall*vig+.02*stone);',
    '  col=mix(col,col*mix(vec3(.8,.82,.86),vec3(1.),clamp(caus*.6,0.,1.)),cov*.75);',
    '  col+=vec3(1.)*smoothstep(1.,4.5,caus)*fall*.28;',
    '  col+=uAcc*smoothstep(5.,8.,caus)*fall*.03;',
    '  col+=gr*.014;',
    ' }',
    ' gl_FragColor=vec4(col,1.);}'
  ].join('\n');
  var VS_PANE = [
    'attribute vec2 aU;uniform mat4 uVP;uniform mat3 uR;uniform vec3 uC;uniform vec2 uSize;',
    'varying vec2 vUV;varying vec3 vW;void main(){vUV=aU;vec2 lp=aU*uSize;vec3 w=uC+uR*vec3(lp.x,0.,lp.y);vW=w;gl_Position=uVP*vec4(w,1.);}'
  ].join('\n');
  var FS_PANE = [
    'precision highp float;varying vec2 vUV;varying vec3 vW;',
    'uniform mat3 uR;uniform vec2 uSize;uniform float uSeed,uAmp,uCut,uLight;uniform vec3 uCam,uL,uBg,uLc,uAcc;',
    NOISE,
    'void main(){vec2 a=(.5-abs(vUV))*uSize;float ed=min(a.x,a.y);if(vUV.x*vUV.y>0.)ed=min(ed,(a.x+a.y-uCut)*.7071);if(ed<0.)discard;',
    ' vec2 lp=vUV*uSize;vec2 g=slope(lp+uSeed,vW.xz)*uAmp;',
    ' vec3 Tx=uR*vec3(1.,0.,0.),Tz=uR*vec3(0.,0.,1.),n0=uR*vec3(0.,1.,0.);vec3 n=normalize(n0-g.x*Tx-g.y*Tz);',
    ' vec3 v=normalize(uCam-vW);vec3 l=normalize(uL-vW);vec3 h=normalize(v+l);',
    ' float sp=min(pow(max(dot(n,h),0.),1400.)*.85,1.);',
    ' float fr=.04+.96*pow(1.-max(dot(n,v),0.),5.);',
    ' float rim=smoothstep(.014,.0,ed);float band=smoothstep(.06,.016,ed)*(1.-rim);',
    ' float sheen=smoothstep(.0,1.,(vUV.x-vUV.y)*.5+.5);',
    ' vec3 col;float al;',
    ' if(uLight<.5){',
    '  col=mix(uBg*.6,uLc,clamp(sp+rim*.75+fr*.3+band*.08,0.,1.));col+=uLc*sheen*.02;',
    '  al=.30+band*.22+rim*.55+sp*.8+fr*.2;',
    ' }else{',
    '  col=mix(mix(uBg,vec3(.55,.58,.64),.5),vec3(1.),clamp(sp+rim*.9+band*.3,0.,1.));',
    '  al=.16+band*.16+rim*.5+sp*.7+fr*.1;',
    ' }',
    ' col+=uAcc*sp*smoothstep(.6,1.,sp)*.15;',
    ' gl_FragColor=vec4(col,clamp(al,0.,.95));}'
  ].join('\n');

  register('ILL-102', 'Caustic Glass', function (root, opts, api) {
    var cv = D.createElement('canvas');
    cv.className = 'apx-ill102__gl'; cv.setAttribute('aria-hidden', 'true');
    root.insertBefore(cv, root.firstChild);
    api.add(function () { cv.remove(); root.classList.remove('is-static', 'is-compact', 'is-fallback', 'is-light'); });
    var PANES = clamp(parseInt(opts.panes != null ? opts.panes : root.getAttribute('data-panes') || '3', 10) || 3, 2, 4);

    var gl = null, lost = false;
    try { gl = cv.getContext('webgl', { antialias: true, alpha: false, depth: false, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    if (gl && !gl.getExtension('OES_standard_derivatives')) gl = null;
    if (!gl) root.classList.add('is-fallback');

    var P = {}, B = {}, T = {}, C = {}, view = {}, fbo = null, fboN = 0;
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function prog(vs, fs) {
      var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
      gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); gl.deleteShader(a); gl.deleteShader(b);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(p));
      var cache = {};
      return { p: p, u: function (n) { if (!(n in cache)) cache[n] = gl.getUniformLocation(p, n); return cache[n]; }, a: function (n) { return gl.getAttribLocation(p, n); } };
    }
    function attrib(p, b, name, n) {
      for (var i = 0; i < 4; i++) gl.disableVertexAttribArray(i);
      gl.bindBuffer(gl.ARRAY_BUFFER, b); var loc = p.a(name); if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, n, gl.FLOAT, false, 0, 0); }
    }
    function freeScene() {
      if (!gl) return;
      Object.keys(P).forEach(function (k) { gl.deleteProgram(P[k].p); delete P[k]; });
      Object.keys(B).forEach(function (k) { if (typeof B[k] === 'object') gl.deleteBuffer(B[k]); delete B[k]; });
      Object.keys(T).forEach(function (k) { gl.deleteTexture(T[k]); delete T[k]; });
      if (fbo) { gl.deleteFramebuffer(fbo); fbo = null; fboN = 0; }
    }
    function buildGL() {
      freeScene();
      try { P.cau = prog(VS_CAU, FS_CAU); P.floor = prog(VS_FS, FS_FLOOR); P.pane = prog(VS_PANE, FS_PANE); }
      catch (e) { freeScene(); gl = null; root.classList.add('is-fallback'); return; }
      var G = isCompact() ? 120 : 210, v = [], idx = [], i, j;
      for (j = 0; j <= G; j++) for (i = 0; i <= G; i++) v.push(i / G - .5, j / G - .5);
      for (j = 0; j < G; j++) for (i = 0; i < G; i++) { var a = j * (G + 1) + i, b = a + 1, c = a + G + 1, d = c + 1; idx.push(a, b, d, a, d, c); }
      B.grid = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, B.grid); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(v), gl.STATIC_DRAW);
      B.gridI = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B.gridI); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(idx), gl.STATIC_DRAW);
      B.gridN = idx.length;
      B.quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, B.quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      B.pane = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, B.pane); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-.5, -.5, .5, -.5, .5, .5, -.5, -.5, .5, .5, -.5, .5]), gl.STATIC_DRAW);
      var N = isCompact() ? 512 : 1024; fboN = N;
      T.cau = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, T.cau);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, N, N, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      fbo = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, T.cau, 0);
      if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) { gl.bindFramebuffer(gl.FRAMEBUFFER, null); freeScene(); gl = null; root.classList.add('is-fallback'); return; }
      gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    function readTokens() {
      C.bg = rgba(tok(root, '--apx-bg', '#08090b'), '#08090b').slice(0, 3);
      C.ink = rgba(tok(root, '--apx-ink', '#e9edf2'), '#e9edf2').slice(0, 3);
      C.acc = rgba(tok(root, '--apx-accent', '#d4ff3a'), '#d4ff3a').slice(0, 3);
      C.light = lum(C.bg) > .5;
      root.classList.toggle('is-light', C.light);
      /* platinum: the ink pushed toward a cool white */
      C.lc = C.light ? [1, 1, 1] : mix3(mix3(C.ink, [1, 1, 1], .5), [.86, .92, 1], .35);
      C.accG = C.light ? mix3(C.acc, [1, 1, 1], .3) : C.acc;
    }

    /* camera looks down at the floor with a slight tilt; panes float between */
    function size() {
      var r = root.getBoundingClientRect(), compact = isCompact();
      var dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.5 : 1.75);
      view.cssW = Math.max(1, r.width); view.cssH = Math.max(1, r.height);
      view.w = Math.max(1, Math.round(r.width * dpr)); view.h = Math.max(1, Math.round(r.height * dpr));
      cv.width = view.w; cv.height = view.h;
      view.asp = view.cssW / view.cssH; view.fov = 38 * Math.PI / 180; view.tanY = Math.tan(view.fov / 2);
      view.compact = compact;
      layout();
    }
    function camera(px, py) {
      var H = 8.4, eye = [px * .45, H, 2.1 + py * .35], look = [0, 0, -.15];
      var f = norm(sub(look, eye)), rt = norm(cross(f, [0, 1, 0])), up = cross(rt, f);
      view.eye = eye; view.f = f; view.rt = rt; view.up = up;
      var V = [rt[0], up[0], -f[0], 0, rt[1], up[1], -f[1], 0, rt[2], up[2], -f[2], 0, -dot(rt, eye), -dot(up, eye), dot(f, eye), 1];
      view.VP = mul4(perspective(view.fov, view.asp, .1, 40), V);
    }
    function floorAt(nx, ny) {
      var d = norm([view.f[0] + nx * view.tanY * view.asp * view.rt[0] + ny * view.tanY * view.up[0], view.f[1] + nx * view.tanY * view.asp * view.rt[1] + ny * view.tanY * view.up[1], view.f[2] + nx * view.tanY * view.asp * view.rt[2] + ny * view.tanY * view.up[2]]);
      var t = -view.eye[1] / Math.min(d[1], -.001);
      return [view.eye[0] + d[0] * t, 0, view.eye[2] + d[2] * t];
    }
    var panes = [];
    function layout() {
      camera(0, 0);
      var c = [floorAt(-1, -1), floorAt(1, -1), floorAt(1, 1), floorAt(-1, 1)];
      var x0 = Math.min(c[0][0], c[3][0]), x1 = Math.max(c[1][0], c[2][0]), z0 = Math.min(c[2][2], c[3][2]), z1 = Math.max(c[0][2], c[1][2]);
      var mx = (x1 - x0) * .12 + .8, mz = (z1 - z0) * .12 + .8;
      view.map = [x0 - mx, z0 - mz, 1 / (x1 - x0 + 2 * mx), 1 / (z1 - z0 + 2 * mz)];
      view.ext = [x0, x1, z0, z1];
      var Wd = x1 - x0, Dp = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
      /* fractions of the visible floor: x, z, width, depth, height, turn */
      var L = view.compact
        ? [[.36, .27, .42, .17, 1.2, -.22], [.68, .45, .4, .15, .8, .3], [.34, .62, .42, .13, 1.35, -.1], [.74, .12, .3, .1, .6, .5]]
        : [[.66, .36, .22, .3, 1.25, -.26], [.86, .68, .16, .26, .8, .34], [.42, .74, .2, .24, 1.5, .12], [.48, .14, .14, .16, .6, -.5]];
      panes = [];
      for (var i = 0; i < PANES; i++) {
        var q = L[i];
        panes.push({ x: x0 + q[0] * Wd, z: z0 + q[1] * Dp, w: q[2] * Wd, d: q[3] * Dp, h: q[4], turn: q[5], seed: i * 17.3 + 3.1, ph: i * 2.1 });
      }
      view.cx = cx; view.cz = cz; view.W = Wd; view.D = Dp;
    }

    var st = { motion: 1, stat: false, px: 0, py: 0, tx: 0, ty: 0, L: null, aim: null, lastInput: -99, now: 0, prog: .5, rip: [0, 0, -99, 0] };
    function lightIdle(t) { return [view.cx + Math.cos(t * .16) * view.W * .3, 0, view.cz + Math.sin(t * .23 + .7) * view.D * .26]; }
    function lightStill() { return [view.cx + view.W * .16, 0, view.cz - view.D * .12]; }

    function paneMat(p, t, m) {
      var sp = (st.prog - .5);
      var yaw = p.turn + Math.sin(t * .09 + p.ph) * .1 * m + sp * .35 * (p.ph % 2 ? 1 : -1);
      var tx = Math.sin(t * .23 + p.ph) * .07 * m + sp * .12, tz = Math.cos(t * .19 + p.ph * 1.3) * .07 * m;
      return mul3(rotY(yaw), mul3(rotX(tx), rotZ(tz)));
    }
    function paneC(p, t, m) {
      return [p.x + Math.sin(t * .11 + p.ph) * .18 * m, p.h + Math.sin(t * .37 + p.ph) * .09 * m - (st.prog - .5) * .3, p.z + Math.cos(t * .13 + p.ph) * .14 * m];
    }

    function render(t) {
      if (!gl || lost || !P.cau) return;
      var m = st.stat ? 0 : st.motion, tt = st.stat ? 6 : t;
      camera(st.px, st.py);
      var Lp = st.L || lightStill(), LH = 6.2, Lw = [Lp[0], LH, Lp[2]];
      var amp = view.compact ? .02 : .022;
      var Ms = panes.map(function (p) { return { R: paneMat(p, tt, m), C: paneC(p, tt, m) }; });
      /* 1. caustics + pane shadows into the floor texture */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, fboN, fboN);
      gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      var p = P.cau; gl.useProgram(p.p);
      attrib(p, B.grid, 'aU', 2); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, B.gridI);
      gl.uniform4fv(p.u('uMap'), view.map); gl.uniform3fv(p.u('uL'), Lw); gl.uniform1f(p.u('uTime'), tt); gl.uniform1f(p.u('uIor'), 1.5);
      gl.uniform1f(p.u('uAmp'), amp); gl.uniform4fv(p.u('uRip'), st.rip.slice(0, 2).concat([st.rip[2], st.rip[3] * (st.stat ? 0 : 1)]));
      gl.uniform1f(p.u('uTrans'), C.light ? .7 : .62);
      panes.forEach(function (pn, i) {
        gl.uniformMatrix3fv(p.u('uR'), false, Ms[i].R); gl.uniform3fv(p.u('uC'), Ms[i].C); gl.uniform2f(p.u('uSize'), pn.w, pn.d);
        gl.uniform1f(p.u('uSeed'), pn.seed); gl.uniform1f(p.u('uCut'), Math.min(pn.w, pn.d) * .16);
        gl.uniform1f(p.u('uMode'), 1); gl.drawElements(gl.TRIANGLES, B.gridN, gl.UNSIGNED_SHORT, 0);
        gl.uniform1f(p.u('uMode'), 0); gl.drawElements(gl.TRIANGLES, B.gridN, gl.UNSIGNED_SHORT, 0);
      });
      gl.disable(gl.BLEND);
      /* 2. the floor */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, view.w, view.h);
      p = P.floor; gl.useProgram(p.p);
      attrib(p, B.quad, 'aQ', 2);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.cau); gl.uniform1i(p.u('uTex'), 0);
      gl.uniform3fv(p.u('uCam'), view.eye); gl.uniform3fv(p.u('uF'), view.f); gl.uniform3fv(p.u('uRt'), view.rt); gl.uniform3fv(p.u('uUp'), view.up);
      gl.uniform2f(p.u('uTan'), view.tanY * view.asp, view.tanY); gl.uniform4fv(p.u('uMap'), view.map); gl.uniform2f(p.u('uTx'), 5.5 / fboN, 5.5 / fboN);
      gl.uniform3fv(p.u('uL'), Lw); gl.uniform3fv(p.u('uBg'), C.bg); gl.uniform3fv(p.u('uLc'), C.lc); gl.uniform3fv(p.u('uAcc'), C.accG); gl.uniform3fv(p.u('uInk'), C.ink);
      gl.uniform1f(p.u('uLight'), C.light ? 1 : 0); gl.uniform1f(p.u('uLI'), C.light ? 1.1 : 1.45); gl.uniform1f(p.u('uT2'), st.stat ? 0 : Math.floor(t * 24) % 97);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      /* 3. the smoked panes */
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      p = P.pane; gl.useProgram(p.p);
      attrib(p, B.pane, 'aU', 2);
      gl.uniformMatrix4fv(p.u('uVP'), false, view.VP); gl.uniform3fv(p.u('uCam'), view.eye); gl.uniform3fv(p.u('uL'), Lw);
      gl.uniform3fv(p.u('uBg'), C.bg); gl.uniform3fv(p.u('uLc'), C.lc); gl.uniform3fv(p.u('uAcc'), C.accG); gl.uniform1f(p.u('uLight'), C.light ? 1 : 0);
      gl.uniform1f(p.u('uTime'), tt); gl.uniform1f(p.u('uAmp'), amp); gl.uniform4fv(p.u('uRip'), st.rip.slice(0, 2).concat([st.rip[2], st.rip[3] * (st.stat ? 0 : 1)]));
      var order = panes.map(function (pn, i) { return i; }).sort(function (a, b) { return Ms[a].C[1] - Ms[b].C[1]; });
      order.forEach(function (i) {
        var pn = panes[i];
        gl.uniformMatrix3fv(p.u('uR'), false, Ms[i].R); gl.uniform3fv(p.u('uC'), Ms[i].C); gl.uniform2f(p.u('uSize'), pn.w, pn.d);
        gl.uniform1f(p.u('uSeed'), pn.seed); gl.uniform1f(p.u('uCut'), Math.min(pn.w, pn.d) * .16);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
      });
      gl.disable(gl.BLEND);
    }

    function sectionProgress() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight;
      st.prog = clamp((vh - r.top) / (vh + r.height), 0, 1);
    }
    var loop = ambient(root, api, function (now, dt) {
      var m = st.motion; st.now = now;
      sectionProgress();
      var idle = now - st.lastInput > (isTouch() ? 4 : 3) || !st.aim;
      var target = idle ? lightIdle(now * m) : st.aim;
      if (!st.L) st.L = target.slice();
      var k = 1 - Math.exp(-dt * (idle ? 1.2 : 4.5));
      st.L = [lerp(st.L[0], target[0], k), 0, lerp(st.L[2], target[2], k)];
      var kp = 1 - Math.exp(-dt * 2.5);
      st.px += (st.tx - st.px) * kp; st.py += (st.ty - st.py) * kp;
      if (st.rip[3] > 0 && now - st.rip[2] > 6) st.rip[3] = 0;
      render(now);
    });

    function aim(e) {
      var r = root.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (x < 0 || y < 0 || x > r.width || y > r.height) return null;
      var nx = x / r.width * 2 - 1, ny = 1 - y / r.height * 2;
      camera(st.px, st.py);
      var f = floorAt(nx, ny);
      st.aim = f; st.lastInput = st.now; st.tx = nx * .5; st.ty = -ny * .5;
      return f;
    }
    api.on(root, 'pointermove', function (e) { if (st.stat || (e.pointerType === 'touch' && !st.drag)) return; aim(e); }, { passive: true });
    api.on(root, 'pointerdown', function (e) {
      if (st.stat) return;
      if (e.target.closest && e.target.closest('a,button,input,select,textarea,label')) return;
      st.drag = true; var f = aim(e); if (!f) return;
      /* a tap sends a ripple through the glass above that point */
      var t = st.now, dx = f[0] - view.eye[0], dz = f[2] - view.eye[2], s = (view.eye[1] - 1.5) / view.eye[1];
      st.rip = [view.eye[0] + dx * s, view.eye[2] + dz * s, t, 1];
    }, { passive: true });
    function up() { st.drag = false; }
    api.on(W, 'pointerup', up, { passive: true }); api.on(W, 'pointercancel', up, { passive: true });
    api.on(root, 'pointerleave', function (e) { if (e.pointerType !== 'touch') { st.lastInput = -99; st.tx = st.ty = 0; } }, { passive: true });

    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.add('is-fallback'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; root.classList.remove('is-fallback'); setup(); });
      api.add(function () { freeScene(); var ext = gl && gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    var ro = new ResizeObserver(function () { size(); if (st.stat) paintStill(); });
    ro.observe(root); api.add(function () { ro.disconnect(); });
    function paintStill() { st.px = st.py = 0; st.prog = .5; st.L = lightStill(); render(0); }

    function setup() {
      var m = motionOf(root);
      st.motion = m; st.stat = m === 0;
      root.classList.toggle('is-static', st.stat);
      root.classList.toggle('is-compact', isCompact());
      readTokens();
      if (gl && !gl.isContextLost()) buildGL();
      size(); st.L = null;
      if (st.stat) { loop.stop(); paintStill(); } else loop.start();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

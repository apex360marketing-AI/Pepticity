/*! APEX library OBJ-101 · Blacklight Relic — self-contained, token-driven. window.APX['OBJ-101'].mount(root) -> destroy() */
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
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); }, running: function () { return !!raf; } };
  }
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)'), hv = W.matchMedia('(hover: none)');
    var h = function () { fn(); };
    [RM, mq, hv].forEach(function (q) { if (q.addEventListener) { q.addEventListener('change', h); api.add(function () { q.removeEventListener('change', h); }); } });
  }

  /* ---- maths ---- */
  function perspective(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function viewZ(dist) { return [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, -dist, 1]; }
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
  function tr3(m) { return [m[0], m[3], m[6], m[1], m[4], m[7], m[2], m[5], m[8]]; }
  function sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }

  /* ---- the relic: a 12-sided machined medallion, lathed and flat-faceted ---- */
  var SEG = 12, HALF = .215;
  var PROF = [[0, .30], [.13, .272], [.25, .205], [.30, .16], [.52, .16], [.745, .16], [.79, .215], [.875, .215], [.965, .15], [1, .085],
    [1, -.085], [.965, -.15], [.875, -.215], [.79, -.215], [.745, -.16], [.30, -.16], [0, -.16]];
  function buildRelic() {
    var J = PROF.length - 1, i, j, s;
    function P(jj, ss) { var a = (ss % SEG) / SEG * Math.PI * 2 + Math.PI / SEG, r = PROF[jj][0]; return [r * Math.cos(a), r * Math.sin(a), PROF[jj][1]]; }
    var N = [];
    for (j = 0; j < J; j++) {
      N[j] = [];
      for (s = 0; s < SEG; s++) {
        var A = P(j, s), B = P(j, s + 1), C = P(j + 1, s + 1), Dd = P(j + 1, s);
        var n = PROF[j][0] < 1e-6 ? cross(sub(C, A), sub(Dd, A)) : cross(sub(B, A), sub(Dd, A));
        if (Math.hypot(n[0], n[1], n[2]) < 1e-9) n = cross(sub(B, A), sub(C, A));
        n = norm(n);
        var ac = (s + .5) / SEG * Math.PI * 2 + Math.PI / SEG, tr = PROF[j + 1][0] - PROF[j][0], tz = PROF[j + 1][1] - PROF[j][1];
        var out = [-tz * Math.cos(ac), -tz * Math.sin(ac), tr];
        if (dot(n, out) < 0) n = [-n[0], -n[1], -n[2]];
        N[j][s] = n;
      }
    }
    var TH = Math.cos(6 * Math.PI / 180);
    function on(a, b) { return dot(a, b) < TH ? 1 : 0; }
    var v = [];
    function side(n) { return n[2] > .25 ? 1 : n[2] < -.25 ? -1 : 0; }
    function tri(p0, p1, p2, n, m) {
      var sd = side(n), bs = [[1, 0, 0], [0, 1, 0], [0, 0, 1]], ps = [p0, p1, p2];
      for (var k = 0; k < 3; k++) v.push(ps[k][0], ps[k][1], ps[k][2], n[0], n[1], n[2], bs[k][0], bs[k][1], bs[k][2], m[0], m[1], m[2], sd);
    }
    for (j = 0; j < J; j++) for (s = 0; s < SEG; s++) {
      var n0 = N[j][s], A2 = P(j, s), B2 = P(j, s + 1), C2 = P(j + 1, s + 1), D2 = P(j + 1, s);
      var radS = on(n0, N[j][(s + SEG - 1) % SEG]), radS1 = on(n0, N[j][(s + 1) % SEG]);
      var ringJ = j > 0 ? on(n0, N[j - 1][s]) : 0, ringJ1 = j < J - 1 ? on(n0, N[j + 1][s]) : 0;
      if (PROF[j][0] < 1e-6) { tri(A2, C2, D2, n0, [ringJ1, radS, radS1]); continue; }       /* apex fan: edges CD | DA | AC */
      if (PROF[j + 1][0] < 1e-6) { tri(A2, B2, C2, n0, [radS1, radS, ringJ]); continue; }      /* back centre fan: BC | CA | AB */
      tri(A2, B2, C2, n0, [radS1, 0, ringJ]);   /* opposite A = BC (radial s+1), opposite B = CA (diagonal), opposite C = AB (ring j) */
      tri(A2, C2, D2, n0, [ringJ1, radS, 0]);   /* opposite A = CD (ring j+1), opposite C = DA (radial s), opposite D = AC (diagonal) */
    }
    return new Float32Array(v);
  }
  /* inner structure for the x-ray: honeycomb core, truss rings, spokes, a crystal heart */
  function buildLattice() {
    var v = [];
    function seg(a, b, w) { v.push(a[0], a[1], a[2], w, b[0], b[1], b[2], w); }
    var i, k, z, hx = .085;
    /* honeycomb in the mid plane */
    for (var q = -12; q <= 12; q++) for (var r = -12; r <= 12; r++) {
      var cx = hx * 1.5 * q, cy = hx * Math.sqrt(3) * (r + q / 2);
      if (Math.hypot(cx, cy) > .7) continue;
      for (k = 0; k < 6; k++) {
        if (k > 2) continue;
        var a0 = k / 6 * Math.PI * 2, a1 = (k + 1) / 6 * Math.PI * 2;
        seg([cx + Math.cos(a0) * hx, cy + Math.sin(a0) * hx, 0], [cx + Math.cos(a1) * hx, cy + Math.sin(a1) * hx, 0], .42);
      }
    }
    /* truss rings top and bottom, joined by struts */
    [.32, .73, .93].forEach(function (rr, ri) {
      [-.1, .1].forEach(function (zz) {
        for (i = 0; i < 96; i++) { var a = i / 96 * Math.PI * 2, b = (i + 1) / 96 * Math.PI * 2; seg([rr * Math.cos(a), rr * Math.sin(a), zz], [rr * Math.cos(b), rr * Math.sin(b), zz], ri === 2 ? .8 : 1); }
      });
      for (i = 0; i < 24; i++) { var a2 = i / 24 * Math.PI * 2, a3 = (i + .5) / 24 * Math.PI * 2; seg([rr * Math.cos(a2), rr * Math.sin(a2), -.1], [rr * Math.cos(a3), rr * Math.sin(a3), .1], .55); }
    });
    for (i = 0; i < 12; i++) {
      var aa = (i + .5) / 12 * Math.PI * 2, c = Math.cos(aa), s = Math.sin(aa);
      for (z = -1; z <= 1; z += 2) seg([.32 * c, .32 * s, .1 * z], [.93 * c, .93 * s, .1 * z], .9);
    }
    /* crystal heart: an octahedron inside a cube frame */
    var o = [[.17, 0, .06], [-.17, 0, .06], [0, .17, .06], [0, -.17, .06], [0, 0, .24], [0, 0, -.12]];
    [[0, 2], [2, 1], [1, 3], [3, 0], [0, 4], [1, 4], [2, 4], [3, 4], [0, 5], [1, 5], [2, 5], [3, 5]].forEach(function (e) { seg(o[e[0]], o[e[1]], 1.2); });
    var h = .11;
    var cb = []; for (i = 0; i < 8; i++) cb.push([(i & 1 ? h : -h), (i & 2 ? h : -h), .06 + (i & 4 ? h : -h) * .9]);
    [[0, 1], [2, 3], [4, 5], [6, 7], [0, 2], [1, 3], [4, 6], [5, 7], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(function (e) { seg(cb[e[0]], cb[e[1]], .6); });
    return new Float32Array(v);
  }

  /* ---- shaders ---- */
  var BEAM = [
    'uniform vec3 uT;uniform vec3 uDir;uniform float uRad;',
    'float beamAt(vec3 p){vec3 d=p-uT;float l=length(d);float c=dot(d,uDir)/l;if(c<=.01)return 0.;',
    ' float q=sqrt(max(1.-c*c,0.))/c/uRad;',
    ' float b=(1.-smoothstep(.5,1.,q))*(.72+.28*(1.-q*q));',
    ' b+=.08*exp(-pow((q-.9)/.06,2.));',
    ' return max(b,0.);}'
  ].join('\n');
  var VS_FS = 'attribute vec2 aQ;varying vec2 vQ;void main(){vQ=aQ;gl_Position=vec4(aQ,0.,1.);}';
  var FS_WALL = [
    'precision highp float;varying vec2 vQ;',
    BEAM,
    'uniform vec3 uCam;uniform vec2 uTan;uniform float uWallZ,uLight,uTime,uHaze,uSc,uStr;',
    'uniform vec3 uBg,uUv,uInk,uO;uniform mat3 uRi;',
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}',
    'float shadowAt(vec3 pw){vec3 o=uRi*((pw-uO)/uSc);vec3 e=uRi*((uT-uO)/uSc);vec3 d=e-o;float s0=0.,s1=1.;',
    ' if(abs(d.z)>1e-5){float a=(-' + HALF.toFixed(3) + '-o.z)/d.z,b=(' + HALF.toFixed(3) + '-o.z)/d.z;s0=min(a,b);s1=max(a,b);}else if(abs(o.z)>' + HALF.toFixed(3) + ')return 0.;',
    ' float A=dot(d.xy,d.xy),B=2.*dot(o.xy,d.xy),C=dot(o.xy,o.xy)-.97;float ds=B*B-4.*A*C;if(ds<0.||A<1e-8)return 0.;',
    ' float sq=sqrt(ds);float c0=(-B-sq)/(2.*A),c1=(-B+sq)/(2.*A);float lo=max(max(s0,c0),0.),hi=min(min(s1,c1),1.);',
    ' return smoothstep(0.,.012,hi-lo);}',
    'void main(){',
    ' vec3 rd=normalize(vec3(vQ.x*uTan.x,vQ.y*uTan.y,-1.));float t=(uCam.z-uWallZ)/(-rd.z);vec3 P=uCam+rd*t;',
    ' float vig=smoothstep(1.55,.25,length(vQ*vec2(.82,1.)));',
    ' float near=exp(-dot((P.xy-uO.xy)*.28,(P.xy-uO.xy)*.28));',
    ' float lref=length(uO-uT),l=length(P-uT);float fall=pow(lref/l,1.1);',
    ' float b=beamAt(P)*fall*uStr;float sh=shadowAt(P);',
    /* soft contact shadow from the overhead key light */
    ' vec2 so=(P.xy-(uO.xy+vec2(.42,-.62)*uSc))/(uSc*vec2(1.2,.95));float blob=exp(-dot(so,so)*1.25);',
    ' float gr=h21(gl_FragCoord.xy+fract(uTime*7.)*91.)-.5;',
    ' vec3 col;',
    ' if(uLight<.5){',
    '  col=uBg*(.55+.6*vig)+uInk*.016*near*vig;',
    '  col*=1.-blob*.35;',
    '  float pool=b*(1.-sh*.94);',
    '  col+=uUv*pool*pool*.5;',
    '  float sp=step(.9965,h21(floor(P.xy*90.)))*pool;col+=uUv*sp*.18;',
    '  float hz=0.;float dz=h21(gl_FragCoord.xy*.37)*1.;',
    '  for(int i=0;i<7;i++){float s=(float(i)+dz)/7.;vec3 Q=uCam+rd*mix(t*.42,t*.98,s);hz+=beamAt(Q);}',
    '  col+=uUv*hz*uHaze*uStr;',
    ' }else{',
    '  col=uBg*(.9+.12*vig);col=mix(col,col*vec3(.74,.74,.77),blob*.7);',
    '  float pool=b*(1.-sh*.9);',
    '  col=mix(col,uInk,clamp(pool*.2,0.,.3));',
    '  col+=vec3(1.)*pool*.035*(1.-sh);',
    ' }',
    ' col+=gr*(uLight<.5?.012:.018);',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');
  var VS_SHELL = [
    'attribute vec3 aP;attribute vec3 aN;attribute vec3 aB;attribute vec3 aM;attribute float aS;',
    'uniform mat4 uVP;uniform mat3 uR;uniform vec3 uO;uniform float uSc;',
    'varying vec3 vW;varying vec3 vN;varying vec3 vB;varying vec3 vM;varying vec3 vL;varying float vS;',
    'void main(){vec3 w=uR*(aP*uSc)+uO;vW=w;vN=uR*aN;vB=aB;vM=aM;vS=aS;vL=aP;gl_Position=uVP*vec4(w,1.);}'
  ].join('\n');
  function fsShell(deriv) {
    return [
      deriv ? '#extension GL_OES_standard_derivatives : enable' : '',
      'precision highp float;',
      'varying vec3 vW;varying vec3 vN;varying vec3 vB;varying vec3 vM;varying vec3 vL;varying float vS;',
      BEAM,
      'uniform sampler2D uTex;uniform vec3 uCam,uUv,uAcc,uKey,uBg;uniform float uLight,uPress,uStr,uTime;',
      'float env(vec3 r){',
      ' float a=smoothstep(.62,.97,dot(r,normalize(vec3(-.55,.66,.52))));',
      ' float b=smoothstep(.8,.985,dot(r,normalize(vec3(.78,.1,.62))))*.55;',
      ' float c=smoothstep(.1,.95,r.y)*.10;',
      ' float s=exp(-pow((r.y+.08)/.05,2.))*smoothstep(-.1,.7,r.z)*.28;',
      ' return a*1.25+b+c+s;}',
      'float edge(){vec3 b=vB+(1.-vM)*4.;',
      deriv ? ' vec3 fw=max(fwidth(vB),vec3(1e-5));vec3 px=b/fw;float d=min(min(px.x,px.y),px.z);return exp(-d*d/2.2)+exp(-d/5.)*.32;'
        : ' float d=min(min(b.x,b.y),b.z);return smoothstep(.035,0.,d)+smoothstep(.12,0.,d)*.3;',
      '}',
      'void main(){',
      ' vec3 n=normalize(vN);vec3 v=normalize(uCam-vW);float nv=clamp(dot(n,v),0.,1.);vec3 r=reflect(-v,n);',
      ' float F=.006+.7*pow(1.-nv,5.);',
      ' vec4 tx=vec4(0.);',
      ' if(vS>.5)tx=texture2D(uTex,vec2((vL.x*.5+.5)*.5,.5-vL.y*.5));',
      ' else if(vS<-.5)tx=texture2D(uTex,vec2(.5+(.5-vL.x*.5)*.5,.5-vL.y*.5));',
      ' float knurl=0.;if(abs(vS)<.5&&abs(vL.z)<.08){knurl=.5+.5*sin(atan(vL.y,vL.x)*240.);}',
      ' float e=edge();',
      ' float kd=max(dot(n,uKey),0.);',
      ' vec3 col=vec3(.0016+uLight*.004)*(.3+.7*kd);',
      ' float sp=env(r)*(F*(1.+uLight*.8)+uLight*.004)*(1.-knurl*.35);',
      ' sp+=tx.b*env(r)*.05;',
      ' col+=vec3(sp)*mix(vec3(.86,.88,.93),vec3(.92,.93,.95),uLight);',
      ' col+=vec3(.9,.92,.96)*e*(.0022+uLight*.012)*(.4+.6*kd);',
      /* the UV torch */
      ' float b=beamAt(vW)*uStr*(1.+uPress*.45);',
      ' vec3 L=normalize(uT-vW);float nl=max(dot(n,L),0.);',
      ' col+=uUv*b*(.0015+.006*nl);',
      ' float ink=tx.r*1.7+tx.g*.38;',
      ' col+=uUv*b*ink*(.55+.45*nl);',
      ' col+=uUv*b*e*1.15*(.5+.5*nl);',
      ' float core=smoothstep(.75,1.,b/(uStr+1e-4));',
      ' float gl=pow(max(dot(r,L),0.),900.)*core;',
      ' col+=uAcc*gl*1.6;',
      ' col=col/(1.+col*.85);',
      ' gl_FragColor=vec4(pow(col,vec3(1./2.2)),1.);',
      '}'
    ].join('\n');
  }
  var VS_LINE = [
    'attribute vec3 aP;attribute float aW;uniform mat4 uVP;uniform mat3 uR;uniform vec3 uO;uniform float uSc;',
    'varying vec3 vW;varying float vWt;void main(){vec3 w=uR*(aP*uSc)+uO;vW=w;vWt=aW;gl_Position=uVP*vec4(w,1.);}'
  ].join('\n');
  var FS_LINE = [
    'precision highp float;varying vec3 vW;varying float vWt;',
    BEAM,
    'uniform vec3 uUv;uniform float uStr,uPress,uK;',
    'void main(){float b=beamAt(vW)*uStr;b=smoothstep(.05,.9,b);gl_FragColor=vec4(uUv*b*vWt*uK*(1.+uPress*.6),1.);}'
  ].join('\n');

  register('OBJ-101', 'Blacklight Relic', function (root, opts, api) {
    var stage = root.querySelector('.apx-obj101__stage') || root;
    var card = root.querySelector('.apx-obj101__card');
    var hint = root.querySelector('.apx-obj101__hint');
    var hintOrig = hint ? hint.textContent : '';
    function opt(k, attr, fb) { return opts[k] != null ? String(opts[k]) : (root.getAttribute(attr) || fb); }
    var MARK = opt('mark', 'data-mark', 'APEX').toUpperCase();
    var SERIAL = opt('serial', 'data-serial', 'N° [SERIAL]').toUpperCase();
    var SIGN = opt('sign', 'data-sign', '[YOUR MARK]').toUpperCase();
    var RING = opt('ring', 'data-ring', 'VERIFIED ORIGIN · CONSENT RECORDED · EXCLUSIVE TO ONE BUSINESS').toUpperCase();
    var HINT_T = opt('hintTouch', 'data-hint-touch', (hint && hint.getAttribute('data-hint-touch')) || 'Drag to move the light');
    var HINT_P = opt('hint', 'data-hint', hintOrig || 'MOVE THE LIGHT ACROSS IT');
    var STILL_TURN = parseFloat(opt('stillTurn', 'data-still-turn', '-35'));
    if (!isFinite(STILL_TURN)) STILL_TURN = -35;

    var cv = D.createElement('canvas');
    cv.className = 'apx-obj101__gl'; cv.setAttribute('aria-hidden', 'true');
    stage.insertBefore(cv, stage.firstChild);
    var ret = D.createElement('div'); ret.className = 'apx-obj101__reticle'; ret.setAttribute('aria-hidden', 'true');
    stage.appendChild(ret);
    var cardStyle = card ? card.getAttribute('style') : null;
    api.add(function () {
      cv.remove(); ret.remove();
      if (card) { if (cardStyle == null) card.removeAttribute('style'); else card.setAttribute('style', cardStyle); }
      if (hint) hint.textContent = hintOrig;
      root.classList.remove('is-static', 'is-compact', 'is-fallback', 'is-light', 'is-touch', 'is-aiming', 'is-pressed');
      stage.style.removeProperty('--_fx'); stage.style.removeProperty('--_fy');
    });

    var gl = null, deriv = false, lost = false;
    try { gl = cv.getContext('webgl', { antialias: true, alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    if (!gl) root.classList.add('is-fallback');

    var P = {}, B = {}, T = {}, C = {}, view = { w: 1, h: 1, dpr: 1, D: 7, tanY: .25, asp: 1, O: [0, 0, 0], sc: 1 };
    function sh(type, src) { var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(s)); return s; }
    function prog(vs, fs) {
      var p = gl.createProgram(), a = sh(gl.VERTEX_SHADER, vs), b = sh(gl.FRAGMENT_SHADER, fs);
      gl.attachShader(p, a); gl.attachShader(p, b); gl.linkProgram(p); gl.deleteShader(a); gl.deleteShader(b);
      if (!gl.getProgramParameter(p, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error(gl.getProgramInfoLog(p));
      var cache = {};
      return { p: p, u: function (n) { if (!(n in cache)) cache[n] = gl.getUniformLocation(p, n); return cache[n]; }, a: function (n) { return gl.getAttribLocation(p, n); } };
    }
    function buf(data) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; }
    function attribs(p, b, list, stride) {
      gl.bindBuffer(gl.ARRAY_BUFFER, b); var off = 0;
      for (var i = 0; i < 8; i++) gl.disableVertexAttribArray(i);
      list.forEach(function (l) { var loc = p.a(l[0]); if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, l[1], gl.FLOAT, false, stride * 4, off * 4); } off += l[1]; });
    }
    function freeScene() {
      if (!gl) return;
      Object.keys(P).forEach(function (k) { gl.deleteProgram(P[k].p); delete P[k]; });
      Object.keys(B).forEach(function (k) { if (B[k] && B[k].b) gl.deleteBuffer(B[k].b); delete B[k]; });
      Object.keys(T).forEach(function (k) { gl.deleteTexture(T[k]); delete T[k]; });
    }
    function buildGL() {
      freeScene();
      try {
        deriv = !!gl.getExtension('OES_standard_derivatives');
        P.wall = prog(VS_FS, FS_WALL); P.shell = prog(VS_SHELL, fsShell(deriv)); P.line = prog(VS_LINE, FS_LINE);
      } catch (e) { freeScene(); gl = null; root.classList.add('is-fallback'); return; }
      B.quad = { b: buf(new Float32Array([-1, -1, 3, -1, -1, 3])), n: 3 };
      var rel = buildRelic(); B.relic = { b: buf(rel), n: rel.length / 13 };
      var lat = buildLattice(); B.lat = { b: buf(lat), n: lat.length / 4 };
      T.ink = gl.createTexture();
      paintInk();
    }

    /* ---- the hidden ink, drawn once into a texture (front | back) ---- */
    function paintInk() {
      if (!gl || !T.ink) return;
      var S = isCompact() ? 512 : 1024, Wc = S * 2;
      var fam = tok(root, '--apx-font-display', 'system-ui, sans-serif'), mono = 'ui-monospace, SFMono-Regular, Menlo, monospace';
      var ink = D.createElement('canvas'), eng = D.createElement('canvas');
      ink.width = eng.width = Wc; ink.height = eng.height = S;
      var a = ink.getContext('2d'), e = eng.getContext('2d');
      a.fillStyle = '#000'; a.fillRect(0, 0, Wc, S); e.fillStyle = '#000'; e.fillRect(0, 0, Wc, S);
      var u = S / 2;
      function circle(g, cx, r, lw, al) { g.globalAlpha = al; g.lineWidth = lw; g.beginPath(); g.arc(cx, u, r * u, 0, Math.PI * 2); g.stroke(); g.globalAlpha = 1; }
      function arcText(g, cx, txt, r, size, font, startDeg, al, flip) {
        g.save(); g.globalAlpha = al; g.font = font.replace('%s', Math.round(size * u) + 'px'); g.textAlign = 'center'; g.textBaseline = 'middle';
        var chars = txt.split(''), total = 0, sp = size * u * .18, ws = chars.map(function (c) { var w = g.measureText(c).width + sp; total += w; return w; });
        var circ = Math.PI * 2 * r * u, scale = total > circ * .98 ? circ * .98 / total : 1;
        var ang = startDeg * Math.PI / 180 - (flip ? -1 : 1) * total * scale / (r * u) / 2;
        for (var i = 0; i < chars.length; i++) {
          var wi = ws[i] * scale / (r * u), mid = ang + (flip ? -1 : 1) * wi / 2;
          g.save(); g.translate(cx + Math.cos(mid) * r * u, u + Math.sin(mid) * r * u); g.rotate(mid + (flip ? -Math.PI / 2 : Math.PI / 2));
          g.fillText(chars[i], 0, 0); g.restore(); ang += (flip ? -1 : 1) * wi;
        }
        g.restore();
      }
      function knock(g, cx, cy, w, h) { g.fillStyle = '#000'; g.fillRect(cx - w / 2, cy - h / 2, w, h); g.fillStyle = '#fff'; }
      [0, 1].forEach(function (side) {
        var cx = side * S + u;
        a.strokeStyle = a.fillStyle = '#fff'; e.strokeStyle = e.fillStyle = '#fff';
        /* physical engraving (always there, only catches the light) */
        circle(e, cx, .70, S * .0018, .9); circle(e, cx, .40, S * .0012, .6);
        for (var t = 0; t < 120; t++) {
          var ta = t / 120 * Math.PI * 2, r0 = t % 10 === 0 ? .635 : .67;
          e.lineWidth = S * (t % 10 === 0 ? .0024 : .0012); e.beginPath(); e.moveTo(cx + Math.cos(ta) * r0 * u, u + Math.sin(ta) * r0 * u); e.lineTo(cx + Math.cos(ta) * .705 * u, u + Math.sin(ta) * .705 * u); e.stroke();
        }
        a.save(); a.beginPath(); a.arc(cx, u, .735 * u, 0, Math.PI * 2); a.arc(cx, u, side ? 0 : .31 * u, 0, Math.PI * 2, true); a.clip();
        if (!side) {
          /* guilloche rosette: phase-shifted sine rings woven through each other */
          a.lineWidth = Math.max(1.2, S * .0016);
          for (var k = 0; k < 16; k++) {
            var ph = k / 16 * Math.PI * 2; a.globalAlpha = .62; a.beginPath();
            for (var i = 0; i <= 900; i++) { var th = i / 900 * Math.PI * 2, rr = .53 + .17 * Math.sin(9 * th + ph) * (.8 + .2 * Math.cos(3 * th)); var px = cx + Math.cos(th) * rr * u, py = u + Math.sin(th) * rr * u; if (i) a.lineTo(px, py); else a.moveTo(px, py); }
            a.stroke();
          }
          a.globalAlpha = .3;
          for (k = 0; k < 8; k++) {
            ph = k / 8 * Math.PI * 2; a.beginPath();
            for (i = 0; i <= 900; i++) { th = i / 900 * Math.PI * 2; rr = .53 + .1 * Math.sin(-14 * th + ph); px = cx + Math.cos(th) * rr * u; py = u + Math.sin(th) * rr * u; if (i) a.lineTo(px, py); else a.moveTo(px, py); }
            a.stroke();
          }
          a.globalAlpha = 1;
        } else {
          /* back: diagonal security hatch */
          a.globalAlpha = .22; a.lineWidth = Math.max(1, S * .0009);
          for (var x = -1; x <= 1; x += .028) { a.beginPath(); a.moveTo(cx + (x - 1) * u, 0); a.lineTo(cx + (x + 1) * u, S); a.stroke(); a.beginPath(); a.moveTo(cx + (x + 1) * u, 0); a.lineTo(cx + (x - 1) * u, S); a.stroke(); }
          a.globalAlpha = 1;
        }
        a.restore();
        circle(a, cx, .31, S * .002, 1); circle(a, cx, .745, S * .0024, 1); circle(a, cx, .80, S * .0012, .7); circle(a, cx, .89, S * .0012, .7);
        if (!side) {
          /* engine-turned sunburst on the crystal boss */
          a.lineWidth = Math.max(1, S * .001); a.globalAlpha = .55;
          for (var s2 = 0; s2 < 96; s2++) { var sa = s2 / 96 * Math.PI * 2; a.beginPath(); a.moveTo(cx + Math.cos(sa) * .07 * u, u + Math.sin(sa) * .07 * u); a.lineTo(cx + Math.cos(sa) * .27 * u, u + Math.sin(sa) * .27 * u); a.stroke(); }
          a.globalAlpha = 1;
          /* brand plate and the client's mark, knocked out of the rosette */
          a.font = '700 ' + Math.round(.085 * u) + 'px ' + fam; a.textAlign = 'center'; a.textBaseline = 'middle';
          var mw = a.measureText(MARK).width;
          knock(a, cx, u - .53 * u, mw + .1 * u, .13 * u); a.fillText(MARK, cx, u - .53 * u);
          a.lineWidth = S * .0016; a.strokeRect(cx - (mw + .1 * u) / 2 + .012 * u, u - .53 * u - .052 * u, mw + .076 * u, .104 * u);
          a.font = '500 ' + Math.round(.052 * u) + 'px ' + mono; var sw = a.measureText(SIGN).width;
          knock(a, cx, u + .53 * u, sw + .09 * u, .1 * u); a.fillText(SIGN, cx, u + .53 * u);
          a.setLineDash([S * .006, S * .004]); a.strokeRect(cx - (sw + .07 * u) / 2, u + .53 * u - .04 * u, sw + .07 * u, .08 * u); a.setLineDash([]);
          arcText(a, cx, MARK + ' · ' + RING + ' · ' + SERIAL + ' · ', .832, .046, '600 %s ' + mono, -90, 1, false);
        } else {
          a.font = '700 ' + Math.round(.2 * u) + 'px ' + fam; a.textAlign = 'center'; a.textBaseline = 'middle';
          var bw = Math.min(a.measureText(MARK).width, 1.05 * u);
          knock(a, cx, u - .02 * u, bw + .12 * u, .26 * u);
          a.save(); a.translate(cx, u - .02 * u); var k2 = Math.min(1, 1.05 * u / a.measureText(MARK).width); a.scale(k2, 1); a.fillText(MARK, 0, 0); a.restore();
          a.font = '500 ' + Math.round(.062 * u) + 'px ' + mono; var srw = a.measureText(SERIAL).width;
          knock(a, cx, u + .25 * u, srw + .08 * u, .1 * u); a.fillText(SERIAL, cx, u + .25 * u);
          a.font = '600 ' + Math.round(.046 * u) + 'px ' + mono; var sgw = a.measureText(SIGN).width;
          knock(a, cx, u - .26 * u, sgw + .1 * u, .09 * u); a.fillText(SIGN, cx, u - .26 * u);
          a.lineWidth = S * .0016; a.strokeRect(cx - (sgw + .07 * u) / 2, u - .26 * u - .036 * u, sgw + .07 * u, .072 * u);
          a.lineWidth = S * .0012; a.beginPath(); a.moveTo(cx - .5 * u, u + .14 * u); a.lineTo(cx + .5 * u, u + .14 * u); a.stroke();
          arcText(a, cx, RING + ' · ' + SERIAL + ' · ', .832, .044, '600 %s ' + mono, -90, 1, false);
        }
      });
      /* halo = the ink, blurred by down/up scaling */
      var hb2 = D.createElement('canvas'); hb2.width = Wc / 8; hb2.height = S / 8; var h2 = hb2.getContext('2d'); h2.imageSmoothingEnabled = true; h2.drawImage(ink, 0, 0, hb2.width, hb2.height);
      var halo = D.createElement('canvas'); halo.width = Wc; halo.height = S; var hh = halo.getContext('2d'); hh.imageSmoothingEnabled = true; hh.drawImage(hb2, 0, 0, Wc, S);
      var A = a.getImageData(0, 0, Wc, S), E = e.getImageData(0, 0, Wc, S).data, Hh = hh.getImageData(0, 0, Wc, S).data, out = A.data;
      for (var p = 0; p < out.length; p += 4) { out[p + 1] = Math.min(255, Hh[p] * 2.2); out[p + 2] = E[p]; out[p + 3] = 255; }
      gl.bindTexture(gl.TEXTURE_2D, T.ink);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, A);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      var an = gl.getExtension('EXT_texture_filter_anisotropic'); if (an) gl.texParameterf(gl.TEXTURE_2D, an.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(an.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    }

    function readTokens() {
      C.bg = rgba(tok(root, '--apx-bg', '#0a0a0c'), '#0a0a0c');
      C.ink = rgba(tok(root, '--apx-ink', '#ecebe8'), '#ecebe8');
      C.acc = rgba(tok(root, '--apx-accent', '#d4ff3a'), '#d4ff3a');
      C.light = lum(C.bg) > .5;
      root.classList.toggle('is-light', C.light);
      /* the UV: a cold white-violet kept close to the ink, never a neon purple */
      var cold = [.66, .6, 1];
      C.uv = C.light ? mix3([.78, .78, .86], cold, .55) : mix3(mix3(C.ink, [1, 1, 1], .4), cold, .55);
      C.inkTint = C.light ? mix3(C.ink, [.24, .2, .52], .55) : C.ink;
      C.accG = C.light ? mix3(C.acc, [1, 1, 1], .45) : C.acc;
    }

    function size() {
      var r = stage.getBoundingClientRect(), compact = isCompact();
      var dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.5 : 1.75);
      view.w = Math.max(1, Math.round(r.width * dpr)); view.h = Math.max(1, Math.round(r.height * dpr)); view.dpr = dpr;
      view.cssW = r.width; view.cssH = r.height;
      cv.width = view.w; cv.height = view.h;
      view.asp = r.width / Math.max(1, r.height);
      var fov = 28 * Math.PI / 180; view.tanY = Math.tan(fov / 2);
      /* frame the relic: right of the card on wide screens, above it on phones */
      var wide = r.width >= 900, fit;
      if (wide) fit = Math.max(1.12 / (.64 * view.tanY), 1.12 / (.5 * view.tanY * view.asp));
      else { fit = Math.max(1.1 / (.9 * view.tanY * view.asp), 1.1 / (.44 * view.tanY)); }
      view.D = fit; view.sc = 1;
      var hw = view.D * view.tanY * view.asp, hh = view.D * view.tanY;
      if (wide) view.O = [card ? hw * .36 : 0, -hh * .02, 0];
      else view.O = [0, card ? hh * .27 : 0, 0];
      view.cam = [0, 0, view.D];
      view.VP = mul4(perspective(fov, view.asp, .1, view.D + 20), viewZ(view.D));
      view.torch0 = [view.O[0] * .5 + .55 * view.D / 7, view.O[1] * .5 + .75 * view.D / 7, view.D * .8];
      view.torch = view.torch0.slice();
      view.wallZ = -2.1;
    }

    /* screen px -> point on the relic plane */
    function pick(px, py) {
      var nx = px / view.cssW * 2 - 1, ny = 1 - py / view.cssH * 2;
      var d = [nx * view.tanY * view.asp, ny * view.tanY, -1], t = view.D / 1;
      return [d[0] * t, d[1] * t, 0];
    }

    /* ---- state ---- */
    var st = { motion: 1, stat: false, yaw: -.55, yawV: 0, px: 0, py: 0, aim: null, beam: null, lastInput: -99, press: 0, pressT: 0, now: 0, enter: 0, prog: .5, str: 0 };
    function autoAim(t) { var R = isCompact() ? .62 : .78; return [view.O[0] + Math.cos(t * .29) * R * .95, view.O[1] + Math.sin(t * .41 + 1.1) * R * .62, 0]; }
    function stillAim() { return [view.O[0] + .22, view.O[1] + .2, 0]; }

    function render(now) {
      if (!gl || lost || !P.wall) return;
      var yaw = st.yaw + st.px * .45, pitch = -.16 + st.py * .32 + (st.prog - .5) * .35;
      var R = mul3(rotX(pitch), mul3(rotY(yaw), rotZ(Math.sin(now * .21) * .05 * st.motion)));
      var Ri = tr3(R);
      var tgt = st.beam || stillAim();
      view.torch = [view.torch0[0] + (tgt[0] - view.O[0]) * .22, view.torch0[1] + (tgt[1] - view.O[1]) * .22, view.torch0[2]];
      var dir = norm(sub(tgt, view.torch));
      var tanR = (isCompact() ? .5 : .56) / Math.hypot(tgt[0] - view.torch[0], tgt[1] - view.torch[1], tgt[2] - view.torch[2]) * (1 - st.press * .18);
      gl.viewport(0, 0, view.w, view.h);
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.disable(gl.BLEND);
      function common(p) {
        gl.uniform3fv(p.u('uT'), view.torch); gl.uniform3fv(p.u('uDir'), dir); gl.uniform1f(p.u('uRad'), tanR);
        gl.uniform3fv(p.u('uO'), view.O); gl.uniform1f(p.u('uSc'), view.sc); gl.uniform1f(p.u('uStr'), st.str);
      }
      var p = P.wall; gl.useProgram(p.p); common(p);
      gl.uniform3fv(p.u('uCam'), view.cam); gl.uniform2f(p.u('uTan'), view.tanY * view.asp, view.tanY); gl.uniform1f(p.u('uWallZ'), view.wallZ);
      gl.uniform1f(p.u('uLight'), C.light ? 1 : 0); gl.uniform1f(p.u('uTime'), st.stat ? 0 : now); gl.uniform1f(p.u('uHaze'), .011);
      gl.uniform3fv(p.u('uBg'), C.bg.slice(0, 3)); gl.uniform3fv(p.u('uUv'), C.uv); gl.uniform3fv(p.u('uInk'), C.inkTint);
      gl.uniformMatrix3fv(p.u('uRi'), false, Ri);
      attribs(p, B.quad.b, [['aQ', 2]], 2); gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.clear(gl.DEPTH_BUFFER_BIT);
      p = P.shell; gl.useProgram(p.p); common(p);
      gl.uniformMatrix4fv(p.u('uVP'), false, view.VP); gl.uniformMatrix3fv(p.u('uR'), false, R);
      gl.uniform3fv(p.u('uCam'), view.cam); gl.uniform3fv(p.u('uUv'), C.uv); gl.uniform3fv(p.u('uAcc'), C.accG.slice(0, 3));
      gl.uniform3fv(p.u('uKey'), norm([-.5, .7, .55])); gl.uniform1f(p.u('uLight'), C.light ? 1 : 0); gl.uniform1f(p.u('uPress'), st.press);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.ink); gl.uniform1i(p.u('uTex'), 0);
      attribs(p, B.relic.b, [['aP', 3], ['aN', 3], ['aB', 3], ['aM', 3], ['aS', 1]], 13); gl.drawArrays(gl.TRIANGLES, 0, B.relic.n);
      /* x-ray: the inner lattice, only inside the beam */
      gl.disable(gl.DEPTH_TEST); gl.depthMask(false); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);
      p = P.line; gl.useProgram(p.p); common(p);
      gl.uniformMatrix4fv(p.u('uVP'), false, view.VP); gl.uniformMatrix3fv(p.u('uR'), false, R);
      gl.uniform3fv(p.u('uUv'), C.uv.map(function (c) { return c * (C.light ? .8 : 1); })); gl.uniform1f(p.u('uPress'), st.press); gl.uniform1f(p.u('uK'), C.light ? .26 : .19);
      attribs(p, B.lat.b, [['aP', 3], ['aW', 1]], 4); gl.drawArrays(gl.LINES, 0, B.lat.n);
      gl.disable(gl.BLEND); gl.depthMask(true);
    }

    function project(w) {
      var v = view.VP, x = v[0] * w[0] + v[4] * w[1] + v[8] * w[2] + v[12], y = v[1] * w[0] + v[5] * w[1] + v[9] * w[2] + v[13], ww = v[3] * w[0] + v[7] * w[1] + v[11] * w[2] + v[15];
      return [(x / ww * .5 + .5) * view.cssW, (.5 - y / ww * .5) * view.cssH];
    }
    var lastDom = '';
    function dom() {
      if (card) {
        var e = st.stat ? 1 : clamp((st.enter - .25) / .5, 0, 1); e = e * e * (3 - 2 * e);
        var k = Math.round(e * 1000) + '';
        if (k !== lastDom) { lastDom = k; card.style.opacity = e.toFixed(3); card.style.transform = e >= 1 ? '' : 'translate3d(0,' + ((1 - e) * 26).toFixed(1) + 'px,0)'; card.style.filter = e >= 1 ? '' : 'blur(' + ((1 - e) * 6).toFixed(2) + 'px)'; }
      }
      if (st.beam && !isTouch()) {
        var s = project(st.beam);
        ret.style.transform = 'translate3d(' + s[0].toFixed(1) + 'px,' + s[1].toFixed(1) + 'px,0)';
      }
    }
    function sectionProgress() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight;
      st.enter = clamp((vh - r.top) / vh, 0, 1);
      st.prog = clamp((vh - r.top) / (vh + r.height), 0, 1);
    }

    var loop = ambient(root, api, function (now, dt) {
      var m = st.motion; st.now = now;
      sectionProgress();
      /* slow turntable that dwells face-on */
      var sa = Math.sin(st.yaw); st.yaw += dt * m * (.07 + .26 * sa * sa);
      if (st.yaw > Math.PI * 2) st.yaw -= Math.PI * 2;
      var k = 1 - Math.exp(-dt * 3.2);
      st.px += ((st.ptrX || 0) - st.px) * k; st.py += ((st.ptrY || 0) - st.py) * k;
      var idle = now - st.lastInput > (isTouch() ? 4 : 2.6) || !st.aim;
      var target = idle ? autoAim(now * m) : st.aim;
      if (!st.beam) st.beam = target.slice();
      var kb = 1 - Math.exp(-dt * (idle ? 1.6 : 7.5));
      st.beam = [lerp(st.beam[0], target[0], kb), lerp(st.beam[1], target[1], kb), 0];
      st.press += ((st.pressT || 0) - st.press) * (1 - Math.exp(-dt * 8));
      st.str += (1 - st.str) * (1 - Math.exp(-dt * 1.4));
      root.classList.toggle('is-aiming', !idle);
      dom();
      render(now);
    });

    function local(e) { var r = stage.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top, r]; }
    function aimAt(e) {
      var l = local(e); if (l[0] < 0 || l[1] < 0 || l[0] > l[2].width || l[1] > l[2].height) return false;
      st.aim = pick(l[0], l[1]); st.lastInput = st.now || performance.now() / 1000;
      st.ptrX = clamp(l[0] / l[2].width * 2 - 1, -1, 1) * .9; st.ptrY = clamp(1 - l[1] / l[2].height * 2, -1, 1) * -.6;
      if (st.stat) { st.beam = st.aim.slice(); st.px = st.ptrX * 0; st.py = 0; render(0); dom(); }
      return true;
    }
    api.on(stage, 'pointermove', function (e) { if (e.pointerType === 'touch' && !st.drag) return; aimAt(e); }, { passive: true });
    api.on(stage, 'pointerdown', function (e) { st.drag = true; aimAt(e); st.pressT = 1; root.classList.add('is-pressed'); }, { passive: true });
    function up() { st.drag = false; st.pressT = 0; root.classList.remove('is-pressed'); }
    api.on(W, 'pointerup', up, { passive: true }); api.on(W, 'pointercancel', up, { passive: true });
    api.on(stage, 'pointerleave', function (e) { if (e.pointerType !== 'touch') { st.lastInput = -99; st.ptrX = st.ptrY = 0; root.classList.remove('is-aiming'); } }, { passive: true });

    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.add('is-fallback'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; root.classList.remove('is-fallback'); setup(); });
      api.add(function () { freeScene(); var ext = gl && gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    var ro = new ResizeObserver(function () { size(); if (st.stat) paintStill(); });
    ro.observe(stage); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.OBJ101 || !gl) return; paintInk(); if (st.stat) paintStill(); });

    function paintStill() { st.yaw = STILL_TURN * Math.PI / 180; st.px = st.py = 0; st.prog = .5; st.press = 0; st.str = 1; if (!st.beam) st.beam = stillAim(); render(0); dom(); }

    function setup() {
      var m = motionOf(root);
      st.motion = m; st.stat = m === 0;
      root.classList.toggle('is-static', st.stat);
      root.classList.toggle('is-compact', isCompact());
      root.classList.toggle('is-touch', isTouch());
      if (hint) hint.textContent = isTouch() ? HINT_T : HINT_P;
      readTokens();
      if (gl && !gl.isContextLost()) buildGL();
      size();
      st.beam = null; lastDom = '';
      if (st.stat) { loop.stop(); paintStill(); }
      else { st.str = .0; loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

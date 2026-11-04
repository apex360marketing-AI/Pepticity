/*! APEX library SCR-07 · Skyline Dive — self-contained, token-driven. window.APX['SCR-07'].mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX core (inlined per module; no globals besides window.APX) ---- */
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, t) { return a + (b - a) * t; }
  function ease3(t) { t = clamp(t, 0, 1); return 1 - Math.pow(1 - t, 3); }
  function easeIO(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
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
  /* any CSS colour -> [r,g,b,a] in 0..1 */
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
      /* re-read tokens / motion on demand */
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
  /* watch reduced-motion + breakpoint changes and re-run a setup fn */
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)');
    var h = function () { fn(); };
    if (RM.addEventListener) { RM.addEventListener('change', h); mq.addEventListener('change', h); api.add(function () { RM.removeEventListener('change', h); mq.removeEventListener('change', h); }); }
  }

  /* ---- small 3D toolkit (vanilla WebGL 1, no libraries) ---- */
  function smooth(a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); }
  function mix3(a, b, t) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]; }
  function lin(c) { return c.slice(0, 3).map(function (v) { return v <= .04045 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); }
  function css(c, a) { return 'rgba(' + Math.round(c[0] * 255) + ',' + Math.round(c[1] * 255) + ',' + Math.round(c[2] * 255) + ',' + (a === undefined ? 1 : a) + ')'; }
  function v3sub(a, b) { return [a[0] - b[0], a[1] - b[1], a[2] - b[2]]; }
  function v3norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function v3cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function v3dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function perspective(fovy, asp, n, f) {
    var t = 1 / Math.tan(fovy / 2), nf = 1 / (n - f);
    return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * nf, -1, 0, 0, 2 * f * n * nf, 0];
  }
  function lookAt(e, c) {
    var z = v3norm(v3sub(e, c)), x = v3norm(v3cross([0, 1, 0], z)), y = v3cross(z, x);
    return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -v3dot(x, e), -v3dot(y, e), -v3dot(z, e), 1];
  }
  function mul(a, b) {
    var o = new Array(16);
    for (var c = 0; c < 4; c++) for (var r = 0; r < 4; r++) o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    return o;
  }
  function rng(seed) { return function () { seed |= 0; seed = seed + 0x6D2B79F5 | 0; var t = Math.imul(seed ^ seed >>> 15, 1 | seed); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  /* centripetal Catmull-Rom through points (same maths as the original camera rail) */
  function CRCurve(pts) {
    var n = pts.length;
    function seg(x0, x1, x2, x3, d0, d1, d2, w) {
      var t1 = ((x1 - x0) / d0 - (x2 - x0) / (d0 + d1) + (x2 - x1) / d1) * d1;
      var t2 = ((x2 - x1) / d1 - (x3 - x1) / (d1 + d2) + (x3 - x2) / d2) * d1;
      var c2 = -3 * x1 + 3 * x2 - 2 * t1 - t2, c3 = 2 * x1 - 2 * x2 + t1 + t2;
      return x1 + t1 * w + c2 * w * w + c3 * w * w * w;
    }
    return function (u) {
      var p = (n - 1) * clamp(u, 0, 1), i = Math.floor(p), w = p - i;
      if (i >= n - 1) { i = n - 2; w = 1; }
      var p1 = pts[i], p2 = pts[i + 1];
      var p0 = i > 0 ? pts[i - 1] : [2 * p1[0] - p2[0], 2 * p1[1] - p2[1], 2 * p1[2] - p2[2]];
      var p3 = i + 2 < n ? pts[i + 2] : [2 * p2[0] - p1[0], 2 * p2[1] - p1[1], 2 * p2[2] - p1[2]];
      function dd(a, b) { return Math.pow((a[0] - b[0]) * (a[0] - b[0]) + (a[1] - b[1]) * (a[1] - b[1]) + (a[2] - b[2]) * (a[2] - b[2]), .25); }
      var d0 = dd(p0, p1), d1 = dd(p1, p2), d2 = dd(p2, p3);
      if (d1 < 1e-4) d1 = 1; if (d0 < 1e-4) d0 = d1; if (d2 < 1e-4) d2 = d1;
      return [0, 1, 2].map(function (k) { return seg(p0[k], p1[k], p2[k], p3[k], d0, d1, d2, w); });
    };
  }
  /* geometry batch: pos3 nrm3 uv2 col3 mat4 (x window glow, y accent glow, z self-lit, w shininess) */
  function Geo() { this.v = []; this.i = []; this.n = 0; }
  Geo.prototype.vert = function (p, nr, uv, col, m) { this.v.push(p[0], p[1], p[2], nr[0], nr[1], nr[2], uv[0], uv[1], col[0], col[1], col[2], m[0], m[1], m[2], m[3]); return this.n++; };
  Geo.prototype.quad = function (ps, nr, uvs, col, m) {
    var b = this.n; for (var k = 0; k < 4; k++) this.vert(ps[k], nr, uvs ? uvs[k] : [0, 0], col, m);
    this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
  };
  /* axis box; face(fi) -> {c:col, m:mat, uv:bool} or null. faces: +x -x +y -y +z -z */
  Geo.prototype.box = function (cx, cy, cz, w, h, d, face, uvo, cell) {
    var x0 = cx - w / 2, x1 = cx + w / 2, y0 = cy - h / 2, y1 = cy + h / 2, z0 = cz - d / 2, z1 = cz + d / 2;
    var F = [
      [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], d],
      [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], d],
      [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0], [0, 1, 0], 0],
      [[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], 0],
      [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], w],
      [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], w]
    ];
    for (var fi = 0; fi < 6; fi++) {
      var f = face(fi); if (!f) continue;
      var uvs = null;
      if (f.uv && F[fi][5]) {
        /* world-scaled window grid (12 columns x 64 rows per texture); v grows downwards so the grid stays upright */
        var u0 = (uvo[0] + fi * 3) / 12, u1 = u0 + F[fi][5] / cell[0] / 12, v0 = (uvo[1] + y0 / cell[1]) / 64, v1 = (uvo[1] + y1 / cell[1]) / 64;
        uvs = [[u0, -v0], [u1, -v0], [u1, -v1], [u0, -v1]];
      }
      this.quad(F[fi].slice(0, 4), F[fi][4], uvs, f.c, f.m);
    }
  };
  Geo.prototype.cyl = function (cx, cy, cz, rt, rb, h, seg, col, m, caps) {
    var y0 = cy - h / 2, y1 = cy + h / 2, slope = (rb - rt) / h;
    for (var s = 0; s < seg; s++) {
      var a0 = s / seg * Math.PI * 2, a1 = (s + 1) / seg * Math.PI * 2;
      var c0 = Math.cos(a0), s0 = Math.sin(a0), c1 = Math.cos(a1), s1 = Math.sin(a1);
      var b = this.n, n0 = v3norm([c0, slope, s0]), n1 = v3norm([c1, slope, s1]);
      this.vert([cx + c0 * rb, y0, cz + s0 * rb], n0, [0, 0], col, m); this.vert([cx + c1 * rb, y0, cz + s1 * rb], n1, [0, 0], col, m);
      this.vert([cx + c1 * rt, y1, cz + s1 * rt], n1, [0, 0], col, m); this.vert([cx + c0 * rt, y1, cz + s0 * rt], n0, [0, 0], col, m);
      this.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
      if (caps) {
        var t = this.n; this.vert([cx, y1, cz], [0, 1, 0], [0, 0], col, m); this.vert([cx + c0 * rt, y1, cz + s0 * rt], [0, 1, 0], [0, 0], col, m); this.vert([cx + c1 * rt, y1, cz + s1 * rt], [0, 1, 0], [0, 0], col, m);
        this.i.push(t, t + 1, t + 2);
      }
    }
  };
  /* phone body: rounded slab with a soft edge, rotated about y, centred at c */
  Geo.prototype.slab = function (c, rotY, w, d, h, r, col, m) {
    var ring = [], seg = 6, cs = Math.cos(rotY), sn = Math.sin(rotY);
    [[w / 2 - r, d / 2 - r, 0], [-(w / 2 - r), d / 2 - r, Math.PI / 2], [-(w / 2 - r), -(d / 2 - r), Math.PI], [w / 2 - r, -(d / 2 - r), Math.PI * 1.5]].forEach(function (k) {
      for (var s = 0; s <= seg; s++) { var a = k[2] + s / seg * Math.PI / 2; ring.push([k[0] + Math.cos(a) * r, k[1] + Math.sin(a) * r, Math.cos(a), Math.sin(a)]); }
    });
    function P(x, y, z) { return [c[0] + x * cs + z * sn, c[1] + y, c[2] - x * sn + z * cs]; }
    function N(x, y, z) { return v3norm([x * cs + z * sn, y, -x * sn + z * cs]); }
    var inset = Math.min(.024, r * .4), e = h * .3, self = this, L = ring.length;
    var levels = [[h / 2, inset, 1], [h / 2 - e, 0, .35], [-h / 2 + e, 0, -.35], [-h / 2, inset, -1]];
    for (var li = 0; li < 3; li++) {
      var A = levels[li], B = levels[li + 1];
      for (var k = 0; k < L; k++) {
        var p = ring[k], q = ring[(k + 1) % L], b = self.n;
        [[p, A], [q, A], [q, B], [p, B]].forEach(function (pv) {
          var pt = pv[0], lv = pv[1];
          self.vert(P(pt[0] - pt[2] * lv[1], lv[0], pt[1] - pt[3] * lv[1]), N(pt[2], lv[2], pt[3]), [0, 0], col, m);
        });
        self.i.push(b, b + 1, b + 2, b, b + 2, b + 3);
      }
    }
    [levels[0], levels[3]].forEach(function (lv) {
      var cIdx = self.vert(P(0, lv[0], 0), [0, lv[2], 0], [0, 0], col, m), first = self.n;
      for (var k = 0; k < L; k++) { var pt = ring[k]; self.vert(P(pt[0] - pt[2] * lv[1], lv[0], pt[1] - pt[3] * lv[1]), [0, lv[2], 0], [0, 0], col, m); }
      for (var j = 0; j < L; j++) self.i.push(cIdx, first + j, first + (j + 1) % L);
    });
  };

  var GLSL_OUT = [
    'vec3 rrt(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}',
    'vec3 aces(vec3 c){c/=.6;c=mat3(.59719,.07600,.02840,.35458,.90834,.13383,.04823,.01566,.83777)*c;c=rrt(c);',
    'c=mat3(1.60475,-.10208,-.00327,-.53108,1.10813,-.07276,-.07367,-.00605,1.07602)*c;return clamp(c,0.,1.);}',
    'vec3 srgb(vec3 c){return mix(pow(c,vec3(.41666))*1.055-.055,c*12.92,step(c,vec3(.0031308)));}'
  ].join('\n');
  var VS_LIT = 'attribute vec3 aP;attribute vec3 aN;attribute vec2 aU;attribute vec3 aC;attribute vec4 aM;uniform mat4 uVP;' +
    'varying vec3 vP;varying vec3 vN;varying vec2 vU;varying vec3 vC;varying vec4 vM;' +
    'void main(){vP=aP;vN=aN;vU=aU;vC=aC;vM=aM;gl_Position=uVP*vec4(aP,1.);}';
  var FS_LIT = [
    'precision highp float;',
    'uniform sampler2D uWin;uniform float uLight,uWinI,uRim,uExpo,uFogD,uRoom;',
    'uniform vec3 uSky,uGnd,uDirC,uDirD,uCam,uAcc,uFog,uL1P,uL1C,uL2P,uL2C;',
    'varying vec3 vP;varying vec3 vN;varying vec2 vU;varying vec3 vC;varying vec4 vM;',
    GLSL_OUT,
    'float fall(float d,float r,float k){float x=d/r;x=clamp(1.-x*x*x*x,0.,1.);return x*x/max(pow(d,k),.01);}',
    'void main(){',
    ' vec3 n=normalize(vN);vec3 V=normalize(uCam-vP);float sh=vM.w;',
    ' vec3 win=vec3(0.);if(vM.x>0.){win=texture2D(uWin,vU).rgb;win=pow(win,vec3(2.2));}',
    ' vec3 alb=mix(vC,win,vM.x*uLight);',
    ' float nd=max(dot(n,uDirD),0.);vec3 irr=mix(uGnd,uSky,n.y*.5+.5)+uDirC*nd;vec3 sp=vec3(0.);',
    ' if(sh>0.){sp+=uDirC*nd*pow(max(dot(n,normalize(uDirD+V)),0.),sh);}',
    ' if(uRoom>0.){',
    '  vec3 l=uL1P-vP;float d=length(l);l/=d;vec3 li=uL1C*fall(d,9.,1.6)*max(dot(n,l),0.);irr+=li;',
    '  if(sh>0.)sp+=li*pow(max(dot(n,normalize(l+V)),0.),sh);',
    '  l=uL2P-vP;d=length(l);l/=d;li=uL2C*fall(d,3.,2.)*max(dot(n,l),0.);irr+=li;',
    '  if(sh>0.)sp+=li*.25*pow(max(dot(n,normalize(l+V)),0.),sh);',
    ' }',
    ' vec3 col=alb*irr*.31831+sp*(sh+8.)*.012*(alb*.9+.06);',
    ' if(sh>0.)col+=alb*(uSky+uGnd)*.12;',
    ' col+=win*vM.x*uWinI+uAcc*vM.y*uRim+vC*vM.z;',
    ' vec3 o=srgb(aces(col*uExpo));',
    ' float fd=uFogD*length(uCam-vP);',
    ' gl_FragColor=vec4(mix(o,uFog,1.-exp(-fd*fd)),1.);',
    '}'].join('\n');
  var VS_SPR = 'attribute vec3 aC;attribute vec2 aQ;uniform mat4 uV;uniform mat4 uPr;uniform vec3 uOff;uniform vec2 uSc;uniform float uFogD;' +
    'varying vec2 vQ;varying float vF;void main(){vec4 p=uV*vec4(aC+uOff,1.);p.xy+=aQ*uSc*.5;float fd=uFogD*-p.z;vF=1.-exp(-fd*fd);vQ=aQ;gl_Position=uPr*p;}';
  var FS_SPR = [
    'precision mediump float;uniform vec3 uCol;uniform vec3 uRing;uniform float uOp,uMode;varying vec2 vQ;varying float vF;',
    'void main(){float r=length(vQ);if(r>1.)discard;',
    ' if(uMode<.5){float a=r<.25?mix(1.,.45,r/.25):.45*(1.-smoothstep(.25,1.,r));gl_FragColor=vec4(uCol,a*uOp*(1.-vF));return;}',
    ' vec3 c=uCol;float a;',
    ' if(r<.2){c=mix(mix(uCol,vec3(1.),.55),uCol,r/.2);a=1.;}',
    ' else if(r<.29){c=uRing;a=.85;}',
    ' else{a=.42*pow(1.-smoothstep(.29,1.,r),1.6);}',
    ' gl_FragColor=vec4(c,a*uOp*(1.-vF));}'].join('\n');
  var VS_SCR = 'attribute vec3 aP;attribute vec2 aU;uniform mat4 uVP;varying vec2 vU;void main(){vU=aU;gl_Position=uVP*vec4(aP,1.);}';
  var FS_SCR = 'precision mediump float;uniform sampler2D uT;varying vec2 vU;void main(){vec4 t=texture2D(uT,vU);if(t.a<.02)discard;gl_FragColor=t;}';
  var VS_PT = 'attribute vec3 aP;uniform mat4 uVP;uniform float uPs;void main(){gl_Position=uVP*vec4(aP,1.);gl_PointSize=uPs;}';
  var FS_PT = 'precision mediump float;uniform vec3 uCol;uniform float uOp;void main(){gl_FragColor=vec4(uCol,uOp);}';

  /* camera rail: [time, eye, look] — the city part follows the original descent; the last two keys are framed live */
  var K0 = [
    [0.000, [0, 82, 136], [0, 6, -22]],
    [0.040, [0, 76, 126], [0, 6, -18]],
    [0.098, [10, 44, 80], [0, 9, 2]],
    [0.215, [0, 14.5, 42], [0, 8, 2]],
    [0.332, [0, 7.6, 18.5], [0, 6.6, 4.5]],
    [0.448, [0, 6.65, 7.2], [0, 6.4, 0]],
    [0.565, [.25, 7.05, 2.4], [0, 5.72, -1.45]]
  ];
  var PHONE = [0, 5.69, -1.5], PROT = .18, T_END = .74;

  /* SCR-07 · Skyline Dive — the camera falls through a night city to one lit window, into the room where the lead lands on a phone. */
  register('SCR-07', 'Skyline Dive', function (root, opts, api) {
    var stage = root.querySelector('.apx-scr07__stage');
    if (!stage) return;
    var card = root.querySelector('.apx-scr07__steps');
    var steps = card ? [].slice.call(card.querySelectorAll(':scope > li')) : [];
    var N = Math.max(1, steps.length);
    var railEl = root.querySelector('.apx-scr07__rail'), depthEl = root.querySelector('.apx-scr07__depth');
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var LEAD = {
      tag: opt('leadTag', 'data-lead-tag', 'SAMPLE'), title: opt('leadTitle', 'data-lead-title', 'New lead · [Service]'),
      detail: opt('leadDetail', 'data-lead-detail', '[Job description]'), note: opt('leadNote', 'data-lead-note', 'Consent recorded'),
      value: opt('leadValue', 'data-lead-value', '[Lead value]'), chip: opt('leadChip', 'data-lead-chip', 'VERIFIED'),
      foot: opt('leadFoot', 'data-lead-foot', 'Exclusive to your business'), time: opt('time', 'data-time', '9:41'), day: opt('day', 'data-day', 'Tuesday')
    };
    var depthFrom = parseFloat(opt('depthFrom', 'data-depth-from', '280')) || 280, depthUnit = opt('depthUnit', 'data-depth-unit', 'M');
    var still = clamp(parseFloat(opt('still', 'data-still', '1')), 0, 1);

    /* ---- DOM: split step headings into words, build the rail and depth readout ---- */
    var restore = [];
    var words = steps.map(function (li) {
      var h = li.querySelector('h3'); if (!h) return [];
      var html = h.innerHTML; restore.push(function () { h.innerHTML = html; h.removeAttribute('aria-label'); });
      var txt = h.textContent.trim().split(/\s+/);
      h.setAttribute('aria-label', h.textContent.trim());
      h.innerHTML = txt.map(function (w) { return '<span class="apx-scr07__w" aria-hidden="true">' + w.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>'; }).join(' ');
      return [].slice.call(h.querySelectorAll('.apx-scr07__w'));
    });
    var railFill = null, railLabels = [];
    if (railEl) {
      var rh = railEl.innerHTML; restore.push(function () { railEl.innerHTML = rh; });
      railEl.innerHTML = '<i class="apx-scr07__fill"></i>' + steps.map(function (li, i) {
        var l = li.getAttribute('data-label') || ('0' + (i + 1));
        return '<span style="top:' + ((i + .5) / N * 100).toFixed(2) + '%">' + (i < 9 ? '0' : '') + (i + 1) + ' ' + l.replace(/</g, '&lt;') + '</span>';
      }).join('');
      railFill = railEl.querySelector('.apx-scr07__fill'); railLabels = [].slice.call(railEl.querySelectorAll('span'));
    }
    var depthNum = depthEl ? depthEl.querySelector('b') : null;
    restore.push(function () {
      steps.forEach(function (li) { li.style.cssText = ''; li.classList.remove('is-on'); });
      if (card) card.style.cssText = '';
      if (depthNum) depthNum.textContent = '';
    });

    /* ---- WebGL ---- */
    var cv = D.createElement('canvas');
    cv.className = 'apx-scr07__gl'; cv.setAttribute('aria-hidden', 'true');
    stage.insertBefore(cv, stage.firstChild);
    api.add(function () { cv.remove(); restore.forEach(function (f) { f(); }); root.classList.remove('is-static', 'is-compact', 'is-fallback', 'is-light'); });
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: !isCompact(), alpha: false, depth: true, stencil: false, powerPreference: 'high-performance', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    if (!gl) { cv.remove(); root.classList.add('is-fallback'); }

    var P = {}, B = {}, T = {}, C = {}, lost = false, compact = isCompact();
    function prog(vs, fs) {
      function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('APX SCR-07 shader: ' + gl.getShaderInfoLog(x)); return x; }
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
      var U = {}, A = {};
      return { p: p, u: function (n) { return U[n] !== undefined ? U[n] : (U[n] = gl.getUniformLocation(p, n)); }, a: function (n) { return A[n] !== undefined ? A[n] : (A[n] = gl.getAttribLocation(p, n)); } };
    }
    var maxAttr = 0;
    function attribs(pr, buf, layout, stride) {
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      for (var k = 0; k < maxAttr; k++) gl.disableVertexAttribArray(k);
      var off = 0;
      layout.forEach(function (l) {
        var loc = pr.a(l[0]);
        if (loc >= 0) { gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, l[1], gl.FLOAT, false, stride * 4, off * 4); maxAttr = Math.max(maxAttr, loc + 1); }
        off += l[1];
      });
    }
    var LIT = [['aP', 3], ['aN', 3], ['aU', 2], ['aC', 3], ['aM', 4]];
    function upload(g) {
      var vb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.v), gl.STATIC_DRAW);
      var ib = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(g.i), gl.STATIC_DRAW);
      return { vb: vb, ib: ib, n: g.i.length };
    }
    function freeScene() {
      if (!gl) return;
      Object.keys(B).forEach(function (k) { var b = B[k]; if (b.vb) gl.deleteBuffer(b.vb); if (b.ib) gl.deleteBuffer(b.ib); });
      Object.keys(T).forEach(function (k) { gl.deleteTexture(T[k]); });
      B = {}; T = {};
    }
    if (gl) {
      try {
        P.lit = prog(VS_LIT, FS_LIT); P.spr = prog(VS_SPR, FS_SPR); P.scr = prog(VS_SCR, FS_SCR); P.pt = prog(VS_PT, FS_PT);
      } catch (e) { gl = null; cv.remove(); root.classList.add('is-fallback'); }
    }
    var aniso = gl && (gl.getExtension('EXT_texture_filter_anisotropic') || gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic'));

    /* ---- colours from tokens ---- */
    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d')), ink = rgba(tok(root, '--apx-ink', '#ecebe8')), mu = rgba(tok(root, '--apx-muted', '#9d9ca3')),
        acc = rgba(tok(root, '--apx-accent', '#cfd3da')), ai = rgba(tok(root, '--apx-accent-ink', '#1f2124'));
      var light = lum(bg) > .5;
      C = { bg: bg, ink: ink, mu: mu, acc: acc, ai: ai, light: light,
        font: tok(root, '--apx-font-text', 'system-ui, sans-serif'), mono: 'ui-monospace, SFMono-Regular, Menlo, monospace' };
      root.classList.toggle('is-light', light);
    }

    /* city windows: a repeating facade texture painted from the tokens */
    function windowCanvas() {
      var k = compact ? 1 : 2, c = D.createElement('canvas'); c.width = 256 * k; c.height = 1024 * k;
      var g = c.getContext('2d'), r = rng(7), bg = C.bg, ink = C.ink, mu = C.mu, cw = 21.333 * k, ch = 16 * k, ww = 13 * k, wh = 10 * k, ox = 4 * k, oy = 3 * k;
      if (!C.light) {
        g.fillStyle = css(mix3(bg, [0, 0, 0], .45)); g.fillRect(0, 0, c.width, c.height);
        var warm = ink, cool = mix3(ink, mu, .3), dim = mix3(mu, bg, .3);
        for (var y = 0; y < 64; y++) for (var x = 0; x < 12; x++) {
          var q = r();
          if (q < .34) { g.fillStyle = css(q < .06 ? cool : q < .25 ? warm : dim, .55 + r() * .45); g.fillRect(ox + x * cw, oy + y * ch, ww, wh); }
          else r();
        }
      } else {
        g.fillStyle = css(mix3(ink, bg, .28)); g.fillRect(0, 0, c.width, c.height);
        var pale = mix3(ink, bg, .88), mid = mix3(ink, bg, .66), dk = mix3(ink, bg, .54), vdk = mix3(ink, bg, .14);
        for (var y2 = 0; y2 < 64; y2++) for (var x2 = 0; x2 < 12; x2++) {
          var q2 = r();
          g.fillStyle = css(q2 < .14 ? pale : q2 < .7 ? mid : q2 < .9 ? dk : vdk, .82 + r() * .18); g.fillRect(ox + x2 * cw, oy + y2 * ch, ww, wh);
        }
      }
      return c;
    }
    function texFrom(canvas, repeat, mips) {
      var t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
      var wrap = repeat ? gl.REPEAT : gl.CLAMP_TO_EDGE;
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrap); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrap);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      if (mips) { gl.generateMipmap(gl.TEXTURE_2D); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR); if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(8, gl.getParameter(aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT))); }
      else gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      return t;
    }

    /* ---- build the scene ---- */
    var lamps = [], spr = {};
    function buildScene() {
      freeScene();
      var L = C.light, bg = lin(C.bg), ink = lin(C.ink), mu = lin(C.mu), black = [0, 0, 0];
      var M0 = [0, 0, 0, 0], MW = [1, 0, 0, 0];
      var towerAlb = L ? [1, 1, 1] : mix3(bg, ink, .012), roofAlb = L ? mix3(lin(mix3(C.ink, C.bg, .4)), [1, 1, 1], 0) : mix3(bg, ink, .02);
      var r = rng(11), city = new Geo(), step = compact ? 9 : 6.5, cell = [.95, 1.15];
      for (var x = -78; x <= 78; x += step) for (var z = -90; z <= 70; z += step) {
        var px = x + (r() - .5) * 1.2, pz = z + (r() - .5) * 1.2, a = r(), b = r(), c = r();
        if (Math.abs(x) < 6.5 && z > -8) continue;
        if (Math.abs(x) < 8 && Math.abs(z) < 8) continue;
        var far = clamp((40 - z) / 130, 0, 1), h = 6 + Math.pow(a, 1.6) * (18 + far * 42), w = step * (.55 + b * .25), d = w * (.8 + c * .4);
        var uvo = [Math.floor(r() * 12), Math.floor(r() * 64)];
        city.box(px, h / 2, pz, w, h, d, function (fi) { return fi === 3 ? null : fi === 2 ? { c: roofAlb, m: M0 } : { c: towerAlb, m: MW, uv: true }; }, uvo, cell);
      }
      /* ground and the two lane lines of the street we fall into */
      var gAlb = L ? lin(mix3(C.bg, C.ink, .14)) : mix3(bg, black, .1);
      city.quad([[-250, 0, 250], [250, 0, 250], [250, 0, -250], [-250, 0, -250]], [0, 1, 0], null, gAlb, M0);
      var laneC = L ? lin(mix3(C.bg, C.ink, .42)) : mix3(gAlb, mu, .3);
      [-3.6, 3.6].forEach(function (lx) { city.quad([[lx - .04, .02, 74], [lx + .04, .02, 74], [lx + .04, .02, -6], [lx - .04, .02, -6]], [0, 1, 0], null, laneC, [0, 0, L ? 0 : .6, 0]); });
      /* the focus building's shell (windows outside), plain walls around the open room */
      var wallIn = L ? lin(mix3(C.bg, C.ink, .12)) : mix3(bg, ink, .045), facade = L ? lin(mix3(C.ink, C.bg, .3)) : mix3(bg, ink, .02);
      var shell = function (fi) { return fi === 3 ? { c: wallIn, m: M0 } : fi === 2 ? { c: roofAlb, m: M0 } : { c: towerAlb, m: MW, uv: true }; };
      city.box(0, 2.3, 0, 9, 4.6, 9, shell, [5, 7], cell);
      city.box(0, 17.2, 0, 9, 17.6, 9, shell, [5, 7], cell);
      var room = new Geo();
      function wall(ext) { return function (fi) { return { c: fi === ext ? facade : wallIn, m: M0 }; }; }
      room.box(0, 6.5, -4.35, 9, 3.8, .3, wall(5));
      room.box(-4.35, 6.5, 0, .3, 3.8, 9, wall(1)); room.box(4.35, 6.5, 0, .3, 3.8, 9, wall(0));
      room.box(-3.25, 6.5, 4.35, 2.5, 3.8, .3, wall(4)); room.box(3.25, 6.5, 4.35, 2.5, 3.8, .3, wall(4));
      room.box(0, 4.9, 4.35, 4, .6, .3, wall(4)); room.box(0, 8.2, 4.35, 4, .4, .3, wall(4));
      /* the lit window frame, in the accent colour */
      var rimC = [.02, .02, .02], RM_ = [0, 1, 0, 30];
      [[4.1, .06, 0, 5.2], [4.1, .06, 0, 8.0], [.06, 2.86, -2.02, 6.6], [.06, 2.86, 2.02, 6.6]].forEach(function (q) { room.box(q[2], q[3], 4.52, q[0], q[1], .06, function () { return { c: rimC, m: RM_ }; }); });
      /* room: floor, desk, steel legs, desk lamp, phone */
      room.quad([[-4.2, 4.61, 4.2], [4.2, 4.61, 4.2], [4.2, 4.61, -4.2], [-4.2, 4.61, -4.2]], [0, 1, 0], null, L ? lin(mix3(C.bg, C.ink, .36)) : mix3(bg, ink, .035), M0);
      var desk = L ? lin(mix3(C.ink, C.bg, .1)) : mix3(bg, ink, .1), steel = lin([.36, .37, .39]), MS = [0, 0, 0, 90];
      room.box(0, 5.62, -1.5, 3.4, .12, 1.7, function () { return { c: desk, m: M0 }; });
      [[-1.55, -.75], [1.55, -.75], [-1.55, -2.25], [1.55, -2.25]].forEach(function (q) { room.box(q[0], 5.1, q[1], .08, .98, .08, function () { return { c: steel, m: MS }; }); });
      room.cyl(-1.42, 5.705, -2.1, .2, .24, .05, 28, steel, MS, true);
      room.cyl(-1.42, 6.2, -2.1, .016, .016, .95, 10, steel, MS, false);
      room.cyl(-1.42, 6.8, -2.1, .02, .28, .3, 32, lin([.05, .05, .055]), [0, 0, 0, 20], false);
      room.slab(PHONE, PROT, .92, 1.86, .07, .09, lin([.11, .115, .125]), [0, 0, 0, 120]);
      B.city = upload(city); B.room = upload(room);
      /* phone screen quad (canvas top = far end of the phone) */
      var cs = Math.cos(PROT), sn = Math.sin(PROT), y = PHONE[1] + .037;
      function sp(x, z) { return [PHONE[0] + x * cs + z * sn, y, PHONE[2] - x * sn + z * cs]; }
      var sv = [].concat(sp(-.42, -.88), [0, 0], sp(.42, -.88), [1, 0], sp(.42, .88), [1, 1], sp(-.42, .88), [0, 1]);
      var sb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, sb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(sv), gl.STATIC_DRAW);
      B.screen = { vb: sb };
      /* sprites: street lamps (batched) + one reusable quad for the moving glows */
      var lv = [];
      for (var lz = 8; lz < 74; lz += 5) [-4.4, 4.4].forEach(function (lx) { [[-1, -1], [1, -1], [1, 1], [-1, -1], [1, 1], [-1, 1]].forEach(function (q) { lv.push(lx, 2.2, lz, q[0], q[1]); }); });
      var lb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, lb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(lv), gl.STATIC_DRAW);
      B.lamps = { vb: lb, n: lv.length / 5 };
      var qb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, qb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, -1, -1, 0, 0, 0, 1, -1, 0, 0, 0, 1, 1, 0, 0, 0, -1, -1, 0, 0, 0, 1, 1, 0, 0, 0, -1, 1]), gl.STATIC_DRAW);
      B.quad = { vb: qb, n: 6 };
      /* stars (night only) */
      var sr = rng(3), ns = compact ? 300 : 900, st = [];
      for (var i = 0; i < ns; i++) { var th = sr() * Math.PI * 2, ph = sr() * .45, R = 380; st.push(Math.cos(th) * Math.sin(ph + .9) * R, 60 + Math.cos(ph) * 180, Math.sin(th) * Math.sin(ph + .9) * R - 60); }
      var stb = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, stb); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(st), gl.STATIC_DRAW);
      B.stars = { vb: stb, n: ns };
      T.win = texFrom(windowCanvas(), true, true);
      scr.key = ''; T.scr = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, T.scr);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      drawScreen(0, 0, true);
    }

    /* ---- the phone's live screen ---- */
    var scr = { c: D.createElement('canvas'), key: '' };
    scr.c.width = 512; scr.c.height = 1024; scr.g = scr.c.getContext('2d');
    function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
    function fit(g, text, weight, size, family, maxW) { var s = size; do { g.font = weight + ' ' + s + 'px ' + family; s -= 1; } while (g.measureText(text).width > maxW && s > 14); }
    function drawScreen(stg, pulse, force) {
      var key = stg + ':' + (stg === 4 ? Math.round(pulse * 10) : 0);
      if (!force && key === scr.key) return; scr.key = key;
      var g = scr.g, L = C.light, ink = C.ink, mu = C.mu, acc = C.acc, F = C.font, MO = C.mono;
      g.clearRect(0, 0, 512, 1024); g.save(); rr(g, 0, 0, 512, 1024, 58); g.clip();
      var gr = g.createLinearGradient(0, 0, 0, 1024);
      if (L) { gr.addColorStop(0, css(mix3(C.bg, [1, 1, 1], .6))); gr.addColorStop(1, css(mix3(C.bg, ink, .07))); }
      else { gr.addColorStop(0, css(mix3(C.bg, ink, .07))); gr.addColorStop(1, css(mix3(C.bg, [0, 0, 0], .25))); }
      g.fillStyle = gr; g.fillRect(0, 0, 512, 1024);
      g.textAlign = 'center'; g.textBaseline = 'alphabetic';
      g.fillStyle = css(ink); g.font = '300 128px ' + F; g.fillText(LEAD.time, 256, 250);
      g.fillStyle = css(mu); g.font = '400 26px ' + F; g.fillText(LEAD.day, 256, 300);
      if (stg < 4) { g.fillStyle = css(mu, .75); g.font = '400 24px ' + F; g.fillText('No new notifications', 256, 560); }
      else if (stg === 4) {
        g.fillStyle = css(mu); g.font = '500 22px ' + MO; g.fillText('MATCHING TO YOUR AREA', 256, 560);
        g.strokeStyle = css(acc, .9); g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.arc(256, 640, 34, pulse * Math.PI * 2, pulse * Math.PI * 2 + 4.2); g.stroke();
      } else {
        rr(g, 36, 456, 440, 360, 34); g.fillStyle = L ? 'rgba(255,255,255,.97)' : css(mix3(C.bg, ink, .13), .97); g.fill();
        g.strokeStyle = L ? css(ink, .16) : css(acc, .55); g.lineWidth = 2; g.stroke();
        g.textAlign = 'left'; g.fillStyle = css(mu); g.font = '500 22px ' + MO; g.fillText((LEAD.tag + '  ·  NOW').toUpperCase(), 72, 512);
        g.fillStyle = css(ink); fit(g, LEAD.title, 600, 38, F, 368); g.fillText(LEAD.title, 72, 576);
        g.fillStyle = css(mix3(ink, mu, .45)); fit(g, LEAD.detail, 400, 28, F, 368); g.fillText(LEAD.detail, 72, 628);
        g.font = '400 28px ' + F; g.fillText(LEAD.note, 72, 668);
        /* verified chip: bright accents sit on charcoal, deep accents fill the chip */
        var bright = lum(acc) > .45, chipFill = bright ? '#1f2124' : css(acc), chipInk = bright ? css(acc) : css(C.ai);
        g.font = '500 22px ' + MO; var cw = g.measureText(LEAD.chip).width + 74;
        rr(g, 72, 708, cw, 54, 27); g.fillStyle = chipFill; g.fill(); if (bright) { g.strokeStyle = css(acc); g.lineWidth = 2; g.stroke(); }
        g.strokeStyle = chipInk; g.lineWidth = 3.5; g.lineCap = 'round'; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(94, 735); g.lineTo(102, 743); g.lineTo(117, 726); g.stroke();
        g.fillStyle = chipInk; g.fillText(LEAD.chip, 130, 743);
        g.textAlign = 'right'; g.fillStyle = L ? css(bright ? mix3(acc, ink, .55) : acc) : css(acc); fit(g, LEAD.value, 500, 24, MO, 436 - (72 + cw + 16)); g.fillText(LEAD.value, 440, 743);
        g.textAlign = 'center'; g.fillStyle = css(mu, .85); g.font = '400 22px ' + F; g.fillText(LEAD.foot, 256, 880);
      }
      g.restore();
      if (gl && T.scr) {
        gl.bindTexture(gl.TEXTURE_2D, T.scr); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scr.c);
      }
    }

    /* ---- layout-aware framing: the phone ends up in the free part of the stage ---- */
    var view = { w: 2, h: 2, asp: 1, fov: 42, sx: 0, sy: 0, cam: null, look: null, kt: [] };
    function fovBase(asp) { return asp >= 1 ? 42 : 42 + 20 * clamp((1 - asp) / .55, 0, 1); }
    function layout(sr) {
      if (!sr.width || !sr.height) return;
      var fx0 = .06, fx1 = .94, fy0 = .08, fy1 = .92;
      if (card && !root.classList.contains('is-static')) {
        var cr = card.getBoundingClientRect();
        if (cr.width / sr.width < .6) { fx0 = (cr.right - sr.left) / sr.width + .03; fx1 = railEl && railEl.offsetParent ? 1 - 190 / sr.width : .96; }
        else { fy1 = (cr.top - sr.top) / sr.height - .03; fy0 = depthEl && depthEl.offsetParent ? (depthEl.getBoundingClientRect().bottom - sr.top) / sr.height + .02 : .08; }
      }
      var asp = sr.width / sr.height, fb = fovBase(asp), fe = fb - 4, vh = 2 * Math.tan(fe * Math.PI / 360);
      var hF = Math.max(.25, (fy1 - fy0)) * .86, wF = Math.max(.25, (fx1 - fx0)) * .86;
      var a, dd, ey, ez;
      for (a = asp >= 1 ? 26 : 34; a <= 72; a += 2) {
        var ar = a * Math.PI / 180, len = 1.86 * Math.cos(ar) + .12, wid = 1.25;
        dd = Math.max(len / (vh * hF), wid / (vh * asp * wF), 1.6);
        ey = PHONE[1] + dd * Math.cos(ar); ez = PHONE[2] + dd * Math.sin(ar);
        if (ey <= 7.8 && ez <= 3.4) break;
      }
      var F = [.03, Math.min(ey, 7.8), Math.min(ez, 3.4)], LK = [PHONE[0], PHONE[1] + .02, PHONE[2]];
      var K = K0.concat([[.665, [F[0] + .12, F[1] + .12, F[2] + .3], LK], [T_END, F, LK]]);
      view.kt = K.map(function (k) { return k[0]; });
      view.cam = CRCurve(K.map(function (k) { return k[1]; })); view.look = CRCurve(K.map(function (k) { return k[2]; }));
      view.fb = fb; view.fe = fe;
      view.sx = (fx0 + fx1) - 1; view.sy = 1 - (fy0 + fy1);
    }
    function uAt(t) { var k = view.kt; for (var i = 0; i < k.length - 1; i++) if (t <= k[i + 1]) return (i + (t - k[i]) / (k[i + 1] - k[i])) / (k.length - 1); return 1; }
    function size() {
      if (!gl) return;
      var r = stage.getBoundingClientRect(), st = root.classList.contains('is-static');
      var cr = st ? cv.getBoundingClientRect() : r;
      var dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.25 : 1.75);
      var w = Math.max(2, Math.round(cr.width * dpr)), h = Math.max(2, Math.round(cr.height * dpr));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
      view.w = w; view.h = h; view.asp = cr.width / Math.max(1, cr.height);
      layout(cr);
    }

    /* ---- render one frame at journey time t (0..T_END) ---- */
    var st8 = { t: 0, px: 0, py: 0, fov: 42, v: 0 };
    function render(t, now, motion) {
      if (!gl || lost || !view.cam) return;
      var L = C.light, u = uAt(t), eye = view.cam(u), look = view.look(u);
      var near = smooth(.52, .7, t), amp = (1 - near) * (t < .2 ? 3.2 : 1.2);
      eye = [eye[0] + st8.px * amp, eye[1] - st8.py * amp * .6, eye[2]];
      var fovT = lerp(view.fb, view.fe, near) + Math.min(7, Math.abs(st8.v) / 60 * .18) * motion;
      st8.fov = motion ? st8.fov + (fovT - st8.fov) * .08 : fovT;
      var pr = perspective(st8.fov * Math.PI / 180, view.asp, .1, 600), sh = lerp(.45, 1, near);
      pr[8] = -view.sx * sh; pr[9] = -view.sy * sh;
      var V = lookAt(eye, look), VP = mul(pr, V);
      var fogD = (L ? (compact ? .0095 : .0075) : (compact ? .0082 : .0074));
      gl.viewport(0, 0, view.w, view.h);
      gl.clearColor(C.bg[0], C.bg[1], C.bg[2], 1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
      var lit = smooth(.06, .11, t), pulse = Math.sin(now * 3) * .25 * motion;
      var stg = t < .53 ? 0 : t < .655 ? 4 : 5;
      drawScreen(stg, (now / 1.2) % 1);
      /* lit meshes */
      var p = P.lit; gl.useProgram(p.p);
      gl.uniformMatrix4fv(p.u('uVP'), false, VP);
      var ink = lin(C.ink), mu = lin(C.mu), bg = lin(C.bg), acc = lin(C.acc);
      var sky = L ? mix3(bg, [1, 1, 1], .5).map(function (v) { return v * 1.25; }) : mix3(mu, ink, .5).map(function (v) { return v * .32; });
      var gnd = L ? mix3(bg, ink, .2).map(function (v) { return v * 1.25; }) : bg.map(function (v) { return v * .32; });
      var dir = L ? [1.5, 1.5, 1.5] : ink.map(function (v) { return v * .55; });
      gl.uniform3fv(p.u('uSky'), sky); gl.uniform3fv(p.u('uGnd'), gnd); gl.uniform3fv(p.u('uDirC'), dir);
      gl.uniform3fv(p.u('uDirD'), v3norm([-40, 80, 50])); gl.uniform3fv(p.u('uCam'), eye); gl.uniform3fv(p.u('uAcc'), acc);
      gl.uniform3fv(p.u('uFog'), C.bg.slice(0, 3)); gl.uniform1f(p.u('uFogD'), fogD);
      gl.uniform1f(p.u('uLight'), L ? 1 : 0); gl.uniform1f(p.u('uWinI'), (L ? .1 : 1.3) + Math.sin(now * 1.1) * (L ? .02 : .04) * motion);
      gl.uniform1f(p.u('uRim'), L ? .3 + lit * (.9 + pulse) : .1 + lit * (.42 + pulse * .3)); gl.uniform1f(p.u('uExpo'), L ? 1 : 1.05);
      gl.uniform3fv(p.u('uL1P'), [-1.42, 6.64, -2.1]); gl.uniform3fv(p.u('uL1C'), (L ? [1, 1, 1] : ink).map(function (v) { return v * (L ? 4.6 : 5.6); }));
      var pg = stg === 5 ? 1.4 + Math.sin(now * 4) * .4 * motion : 0;
      gl.uniform3fv(p.u('uL2P'), [PHONE[0], PHONE[1] + .6, PHONE[2]]); gl.uniform3fv(p.u('uL2C'), acc.map(function (v) { return v * pg; }));
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T.win); gl.uniform1i(p.u('uWin'), 0);
      [['city', 0], ['room', 1]].forEach(function (b) {
        var bb = B[b[0]]; gl.uniform1f(p.u('uRoom'), b[1]);
        attribs(p, bb.vb, LIT, 15); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, bb.ib); gl.drawElements(gl.TRIANGLES, bb.n, gl.UNSIGNED_SHORT, 0);
      });
      /* phone screen */
      gl.enable(gl.BLEND); gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
      var q = P.scr; gl.useProgram(q.p); gl.uniformMatrix4fv(q.u('uVP'), false, VP);
      gl.bindTexture(gl.TEXTURE_2D, T.scr); gl.uniform1i(q.u('uT'), 0);
      attribs(q, B.screen.vb, [['aP', 3], ['aU', 2]], 5); gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      /* stars */
      gl.depthMask(false);
      if (!L) {
        var s = P.pt; gl.useProgram(s.p); gl.uniformMatrix4fv(s.u('uVP'), false, VP);
        gl.uniform1f(s.u('uPs'), 1.1 * Math.min(W.devicePixelRatio || 1, 2)); gl.uniform3fv(s.u('uCol'), mix3(C.ink, C.mu, .2)); gl.uniform1f(s.u('uOp'), .55);
        attribs(s, B.stars.vb, [['aP', 3]], 3); gl.drawArrays(gl.POINTS, 0, B.stars.n);
      }
      /* glows */
      var g = P.spr; gl.useProgram(g.p);
      gl.uniformMatrix4fv(g.u('uV'), false, V); gl.uniformMatrix4fv(g.u('uPr'), false, pr); gl.uniform1f(g.u('uFogD'), fogD);
      function sprite(buf, n, off, sc, col, op, mode) {
        if (op <= .003) return;
        gl.blendFunc(gl.SRC_ALPHA, mode === 0 && !L ? gl.ONE : gl.ONE_MINUS_SRC_ALPHA);
        gl.uniform3fv(g.u('uOff'), off); gl.uniform2fv(g.u('uSc'), sc); gl.uniform3fv(g.u('uCol'), col); gl.uniform1f(g.u('uOp'), op); gl.uniform1f(g.u('uMode'), mode);
        attribs(g, buf, [['aC', 3], ['aQ', 2]], 5); gl.drawArrays(gl.TRIANGLES, 0, n);
      }
      gl.uniform3fv(g.u('uRing'), mix3(C.ink, C.acc, .25));
      var warm = L ? [1, 1, 1] : C.ink.slice(0, 3);
      sprite(B.lamps.vb, B.lamps.n, [0, 0, 0], [1.6, 1.6], warm, L ? .22 : 1, 0);
      sprite(B.quad.vb, 6, [-1.42, 6.6, -2.1], [.9, .9], warm, .55, 0);
      sprite(B.quad.vb, 6, [0, 6.6, 4.7], [7.5, 5], C.acc.slice(0, 3), lit * (1 - smooth(.36, .45, t)) * (L ? .24 : .3), 0);
      /* the lead: a small light that travels just ahead of the camera, then sinks into the phone */
      var lead = clamp(t + .035, 0, T_END), lp = view.look(uAt(lead));
      lp = [lerp(lp[0], eye[0], .12), lerp(lp[1], eye[1], .12), lerp(lp[2], eye[2], .12)];
      var oo = smooth(.07, .12, t) * (1 - smooth(.47, .55, t)) * (.78 + Math.sin(now * 6) * .18 * motion), os = lerp(2.2, .25, smooth(.3, .52, t));
      sprite(B.quad.vb, 6, lp, [os, os], C.acc.slice(0, 3), oo, L && near < .25 ? 1 : 0);
      gl.depthMask(true); gl.disable(gl.BLEND);
    }

    /* ---- scroll + DOM choreography ---- */
    var state = { ps: -1, t: -1, lastY: W.scrollY, sv: 0, motion: 1, stat: false, lastDom: -9, active: -2, depth: '' };
    function rawProgress() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight, len = r.height - vh;
      return { p: len > 1 ? clamp(-r.top / len, 0, 1) : 0, enter: clamp((vh - r.top) / vh, 0, 1) };
    }
    function e2(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }
    function dom(ps, enter) {
      var key = Math.round(ps * 4000) + Math.round(enter * 400) * 10000;
      if (key === state.lastDom) return; state.lastDom = key;
      if (card) {
        var ca = e2((enter - .3) / .45);
        card.style.opacity = ca.toFixed(3); card.style.transform = 'translate3d(0,' + ((1 - ca) * 30).toFixed(1) + 'px,0)';
      }
      for (var i = 0; i < steps.length; i++) {
        var local = ps * N - i;
        /* sequential hand-over: the old step leaves (local .84-.96) before the new one rises (-.04-.1) — never two texts at once */
        var vin = i === 0 ? 1 : e2((local + .04) / .14), vout = i === steps.length - 1 ? 0 : e2((local - .84) / .12);
        var show = vin * (1 - vout), li = steps[i];
        li.style.visibility = show > .002 ? 'visible' : 'hidden';
        li.style.opacity = show.toFixed(3);
        li.style.transform = 'translate3d(0,' + ((1 - vin) * 24 - vout * 18).toFixed(1) + 'px,0)';
        li.style.filter = vout > .001 && show > .002 ? 'blur(' + (vout * 4).toFixed(2) + 'px)' : '';
        var ws = words[i], Lw = i === 0 ? local + .5 * enter : local + .04;
        for (var k = 0; k < ws.length; k++) {
          var wk = e2((Lw - k * .02) / .14);
          ws[k].style.transform = 'translate3d(0,' + ((1 - wk) * .6).toFixed(3) + 'em,0)';
          ws[k].style.opacity = wk.toFixed(3);
        }
      }
      var act = Math.min(N - 1, Math.floor(ps * N));
      if (act !== state.active) { state.active = act; railLabels.forEach(function (l, i) { l.classList.toggle('is-on', i === act); }); steps.forEach(function (l, i) { l.classList.toggle('is-on', i === act); }); }
      if (railFill) railFill.style.transform = 'scaleY(' + ps.toFixed(4) + ')';
      if (depthNum) { var dv = Math.round(depthFrom * Math.pow(1 - ps, 1.6) + 1) + ' ' + depthUnit; if (dv !== state.depth) { depthNum.textContent = dv; state.depth = dv; } }
    }
    function tOf(ps) { return .04 + (T_END - .04) * clamp(ps / .94, 0, 1); }
    var loop = ambient(root, api, function (now, dt) {
      var m = state.motion, rp = rawProgress();
      var y = W.scrollY, inst = (y - state.lastY) / Math.max(dt, .001); state.lastY = y;
      state.sv += (inst - state.sv) * .25; if (Math.abs(state.sv) < 2) state.sv = 0; st8.v = state.sv;
      if (state.ps < 0) state.ps = rp.p; else state.ps += (rp.p - state.ps) * (1 - Math.exp(-dt * 10));
      if (Math.abs(rp.p - state.ps) < .0002) state.ps = rp.p;
      var tt = tOf(state.ps);
      if (state.t < 0) state.t = tt; else state.t += (tt - state.t) * (1 - Math.exp(-dt * 7));
      st8.px += (ptr.x - st8.px) * (1 - Math.exp(-dt * 3)); st8.py += (ptr.y - st8.py) * (1 - Math.exp(-dt * 3));
      dom(state.ps, rp.enter);
      render(state.t, now, m);
    });
    var ptr = { x: 0, y: 0 };
    api.on(W, 'pointermove', function (e) { if (e.pointerType === 'touch') return; ptr.x = e.clientX / W.innerWidth - .5; ptr.y = e.clientY / W.innerHeight - .5; }, { passive: true });

    if (gl) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.add('is-fallback'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; root.classList.remove('is-fallback'); setup(); });
      api.add(function () { freeScene(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    var ro = new ResizeObserver(function () { size(); if (state.stat) paintStill(); state.lastDom = -9; });
    ro.observe(stage); api.add(function () { ro.disconnect(); });
    function paintStill() { st8.px = st8.py = 0; st8.v = 0; render(T_END * still + .04 * (1 - still), performance.now() / 1000, 0); }
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.SCR07 || !gl) return; scr.key = ''; if (state.stat) paintStill(); });

    function setup() {
      var m = motionOf(root); compact = isCompact();
      state.motion = m; state.stat = m === 0;
      root.classList.toggle('is-static', state.stat);
      root.classList.toggle('is-compact', compact);
      readTokens();
      if (gl) buildScene();
      size();
      state.lastDom = -9; state.active = -2; state.ps = -1; state.t = -1;
      if (state.stat) {
        loop.stop();
        steps.forEach(function (li) { li.style.cssText = ''; li.classList.remove('is-on'); });
        words.forEach(function (ws) { ws.forEach(function (w) { w.style.cssText = ''; }); });
        if (card) card.style.cssText = '';
        if (depthNum) depthNum.textContent = '';
        paintStill();
      } else { var rp = rawProgress(); dom(rp.p, rp.enter); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

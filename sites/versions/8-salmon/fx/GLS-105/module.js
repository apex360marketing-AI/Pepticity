/*! APEX library GLS-105 · Living Condensation — self-contained, token-driven. window.APX['GLS-105'].mount(root) -> destroy()
   The section sits behind fogged, beaded glass. Every bead is a tiny lens that flips the picture behind it. A pointer or a
   finger wipes the glass clear along its path; water gathers at the edges of the wipe, heavy drops run down and leave
   clear channels, and the fog slowly breathes back. On first view a short word (data-word) is written into the fog.
   Markup: .apx-g105 > .apx-g105__behind (text that sits behind the glass) + optional .apx-g105__front (stays on the near side).
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0: a still, mostly clear pane with fog and beads round the edges. */
(function () {
  'use strict';
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  if (APX.GLS105 && APX.GLS105.mount) return;
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function tok(el, n, fb) { var v = getComputedStyle(el).getPropertyValue(n).trim(); return v || fb; }
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(tok(el, '--apx-motion', '1'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
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
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; upd(); if (vis && api.onVisible) api.onVisible(); }, { rootMargin: '5% 0px' });
    io.observe(el);
    api.on(D, 'visibilitychange', upd);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); } };
  }

  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 R;uniform float dpr;uniform float t;uniform float breath;uniform float dark;uniform float still;',
    'uniform vec3 bgc;uniform vec3 ink;uniform vec3 cold;',
    'uniform sampler2D TX;uniform sampler2D TB;uniform sampler2D FG;uniform sampler2D DM;',
    'vec3 hiT;vec3 loT;',
    'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'vec2 h2(vec2 p){return fract(sin(vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3))))*43758.5453);}',
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}',
    /* the room behind the glass: cold silver light pools and out-of-focus points of light */
    'vec3 scene(vec2 uv,float soft){',
    ' float asp=R.x/R.y;vec2 p=vec2(uv.x*asp,uv.y);',
    ' vec3 c=bgc*(dark>.5?.78:.74);',
    ' c+=cold*(dark>.5?.16:.10)*smoothstep(1.25,0.,length(p-vec2(asp*.78,.12)));',
    ' for(int i=0;i<3;i++){float fi=float(i);vec2 ci=vec2((.18+.34*fi+.05*sin(t*.05+fi*1.7))*asp,.35+.3*sin(t*.06+fi*2.3));',
    '  vec2 d=p-ci;c+=cold*(dark>.5?.07:.05)*exp(-dot(d,d)/.07);}',
    ' vec2 g=p/.085;vec2 id=floor(g);float hh=h1(id);',
    ' if(hh>.78){vec2 c0=(id+.5+(h2(id)-.5)*.55)*.085;float r=.008+.012*h1(id+3.1)+soft*.012;float d=length(p-c0);',
    '  float tw=.75+.25*sin(t*(.6+h1(id+9.)*.8)+hh*40.);',
    '  float w=smoothstep(.15,.95,uv.y)*.85+.15;',
    '  c+=(dark>.5?cold:mix(cold,ink,.25))*(.10+.28*h1(id+7.))*w*tw*(1.-smoothstep(r*(.55-soft*.4),r,d))*(dark>.5?1.:.6);}',
    ' return c;}',
    'vec3 content(vec2 uv){vec4 tx=texture2D(TX,uv);return mix(scene(uv,0.),tx.rgb,tx.a);}',
    'vec3 contentB(vec2 uv){vec4 tx=texture2D(TB,uv);return mix(scene(uv,1.),tx.rgb,tx.a*.5);}',
    'vec3 lens(vec2 P,vec2 q,float r,vec3 under,float zoom){',
    ' float d=length(q);float z=sqrt(max(1.-d*d,0.));',
    ' vec3 b=content(clamp((P-q*r*zoom)/R,0.,1.));',
    ' b=b*(.7+.42*z)+cold*.035;',
    ' b=mix(b,loT,smoothstep(.7,1.,d)*(dark>.5?.42:.24));',
    ' vec2 hv=q-vec2(-.32,-.4);b+=hiT*exp(-dot(hv,hv)*34.)*.85;',
    ' b+=hiT*smoothstep(.6,.95,d)*smoothstep(.2,.9,q.y)*.22;',
    ' return mix(under,b,1.-smoothstep(.84,1.,d));}',
    'void main(){',
    ' vec2 P=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y);vec2 uv=P/R;',
    ' hiT=dark>.5?mix(cold,vec3(1.),.6):vec3(1.);loT=dark>.5?vec3(0.):ink*.55;',
    ' vec3 clear=content(uv);',
    ' float f=texture2D(FG,uv).r;',
    ' float nz=vn(P/(46.*dpr))*.6+vn(P/(13.*dpr))*.4;',
    ' float fe=smoothstep(.2,.8,f*1.06+(nz-.5)*.45);',
    ' vec3 col=clear;',
    ' if(fe>.003){',
    '  float glow=smoothstep(1.4,0.,length((uv-vec2(.82,.08))*vec2(R.x/R.y,1.)));',
    '  vec3 haze=dark>.5?mix(bgc,cold,.30+.05*breath+.16*glow):mix(bgc,vec3(1.),.62+.05*breath+.16*glow);',
    '  vec3 fc=mix(contentB(uv),haze,dark>.5?.66:.6);',
    '  fc+=(h1(floor(P/(1.4*dpr)))-.5)*.035+(vn(P/(3.*dpr))-.5)*.03;',
    '  col=mix(clear,fc,fe*.97);',
    '  col+=hiT*fe*(1.-fe)*.22;',
    /* beads live in the fog, three sizes: big and medium ones are lenses that flip the room behind, the finest are mist */
    '  for(int k=0;k<3;k++){float fk=float(k);float s=(k==0?42.:k==1?17.:6.5)*dpr;vec2 P2=P+vec2(fk*13.7,fk*29.3)*dpr;vec2 cell=floor(P2/s);',
    '   vec2 hh=h2(cell+fk*31.);float pr=h1(cell+fk*7.+.5);float dens=k==0?.13:k==1?.28:.42;',
    '   if(pr<dens*smoothstep(.15,.7,fe)){float r=s*(k==0?(.10+.30*hh.y*hh.y):k==1?(.12+.27*hh.y):(.12+.2*hh.y));',
    '    vec2 c=(cell+.5+(hh-.5)*(1.-2.*r/s))*s;vec2 q=(P2-c)/r;float dq=dot(q,q);',
    '    if(dq<1.){if(k<2)col=lens(P,q,r,col,1.7);',
    '     else{float d=sqrt(dq);vec3 b=col*1.12+hiT*.05;b=mix(b,loT,smoothstep(.55,1.,d)*.22);vec2 hv=q-vec2(-.3,-.4);b+=hiT*exp(-dot(hv,hv)*20.)*.35;col=mix(col,b,(1.-smoothstep(.8,1.,d))*.85);}}}}',
    ' }',
    /* big drops and runs (drawn by the physics into the drop map) */
    ' vec4 dm=texture2D(DM,uv);',
    ' if(dm.a>.04){vec2 n=dm.rg*2.-1.;col=lens(P,n,14.*dpr,col,1.5);',
    ' }',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  register('GLS-105', 'Living Condensation', function (root, opts, api) {
    root.classList.add('apx-g105');
    var behind = root.querySelector('.apx-g105__behind');
    if (!behind) return;
    var cv = D.createElement('canvas'); cv.className = 'apx-g105__cv'; cv.setAttribute('aria-hidden', 'true');
    root.insertBefore(cv, behind.nextSibling);
    api.add(function () { cv.remove(); root.classList.remove('is-gl', 'is-static'); });

    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false }); } catch (e) { gl = null; }
    var PR = null, buf = null, TEX = {}, lost = false;
    var S = { motion: 1, stat: false, t: 0, breath: 0, w: 2, h: 2, dpr: 1, cell: 6, gw: 1, gh: 1, F: null, H: null, RR: null, U8: null,
      drops: [], acc: 0, wrote: false, writing: null, auto: null, spawnAt: 3, compact: false };
    var T = { bg: [0, 0, 0], ink: [1, 1, 1], cold: [.8, .85, .9], dark: 1 };
    var txC = D.createElement('canvas'), tbC = D.createElement('canvas'), dmC = D.createElement('canvas'), sprite = null;
    var DM_S = .5;

    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    function texInit(t) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); }
    function initGL() {
      try {
        var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS));
        gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
        var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
        for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
        PR = { p: p, u: u };
        buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        ['TX', 'TB', 'FG', 'DM'].forEach(function (k) { TEX[k] = gl.createTexture(); texInit(TEX[k]); });
        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        return true;
      } catch (e) { return false; }
    }
    function freeGL() {
      if (!gl || gl.isContextLost()) return;
      if (PR) gl.deleteProgram(PR.p); if (buf) gl.deleteBuffer(buf);
      for (var k in TEX) gl.deleteTexture(TEX[k]);
    }
    var ok = !!gl && initGL();
    root.classList.toggle('is-gl', ok);
    if (!ok) return;

    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d'), '#0b0b0d'), ink = rgba(tok(root, '--apx-ink', '#ecebe8'), '#ecebe8');
      T.bg = bg.slice(0, 3); T.ink = ink.slice(0, 3); T.dark = lum(bg) < .45 ? 1 : 0;
      /* cold silver light: a cool white, never warm */
      T.cold = T.dark ? [.80, .86, .93] : [.97, .985, 1];
    }

    /* ---- picture of the text behind the glass (word by word, fitted to the real layout) ---- */
    function snapshot() {
      var rr = root.getBoundingClientRect(), dpr = S.dpr, w = S.w, h = S.h;
      txC.width = Math.max(2, Math.round(w * dpr)); txC.height = Math.max(2, Math.round(h * dpr));
      var x = txC.getContext('2d'); x.setTransform(dpr, 0, 0, dpr, 0, 0); x.clearRect(0, 0, w, h);
      var tw = D.createTreeWalker(behind, NodeFilter.SHOW_TEXT, null), node, rng = D.createRange(), re = /\S+/g, m;
      S.lines = [];
      while ((node = tw.nextNode())) {
        if (!/\S/.test(node.data)) continue;
        var el = node.parentElement, cs = getComputedStyle(el);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        var col = rgba(cs.color, '#fff'); if (col[3] === 0) continue;
        x.font = cs.fontStyle + ' ' + cs.fontWeight + ' ' + cs.fontSize + ' ' + cs.fontFamily;
        try { x.letterSpacing = cs.letterSpacing === 'normal' ? '0px' : cs.letterSpacing; } catch (e) {}
        x.fillStyle = 'rgba(' + Math.round(col[0] * 255) + ',' + Math.round(col[1] * 255) + ',' + Math.round(col[2] * 255) + ',' + col[3] + ')';
        var up = cs.textTransform === 'uppercase';
        re.lastIndex = 0;
        while ((m = re.exec(node.data))) {
          rng.setStart(node, m.index); rng.setEnd(node, m.index + m[0].length);
          var rs = rng.getClientRects(); if (!rs.length) continue;
          var r = rs[0], txt = up ? m[0].toUpperCase() : m[0];
          var mt = x.measureText(txt), asc = mt.fontBoundingBoxAscent || parseFloat(cs.fontSize) * .8, des = mt.fontBoundingBoxDescent || parseFloat(cs.fontSize) * .2;
          var bx = r.left - rr.left, by = r.top - rr.top + (r.height - (asc + des)) / 2 + asc;
          var sx = mt.width > 0 ? clamp(r.width / mt.width, .85, 1.18) : 1;
          x.save(); x.translate(bx, by); x.scale(sx, 1); x.fillText(txt, 0, 0); x.restore();
          S.lines.push([bx, r.top - rr.top, r.width, r.height]);
        }
      }
      rng.detach && rng.detach();
      /* a soft copy for what is seen through fog */
      tbC.width = Math.max(2, Math.round(w / 4)); tbC.height = Math.max(2, Math.round(h / 4));
      var b = tbC.getContext('2d'); b.clearRect(0, 0, tbC.width, tbC.height);
      try { b.filter = 'blur(' + Math.max(1.5, Math.min(w, h) / 260).toFixed(1) + 'px)'; } catch (e) {}
      b.drawImage(txC, 0, 0, tbC.width, tbC.height); b.filter = 'none';
      gl.bindTexture(gl.TEXTURE_2D, TEX.TX); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, txC);
      gl.bindTexture(gl.TEXTURE_2D, TEX.TB); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, tbC);
    }

    /* ---- the fog field: one value per cell, 1 = fogged, 0 = wiped ---- */
    function buildGrid() {
      var cell = S.compact ? 6 : 4, gw = Math.ceil(S.w / cell) + 1, gh = Math.ceil(S.h / cell) + 1;
      if (S.F && gw === S.gw && gh === S.gh) return;
      var F = new Float32Array(gw * gh), H = new Float32Array(gw * gh), RRr = new Float32Array(gw * gh);
      for (var i = 0; i < gw * gh; i++) { F[i] = 1; RRr[i] = .7 + Math.random() * .6; }
      if (S.F) { /* keep what was wiped when the size changes */
        for (var y = 0; y < gh; y++) for (var x = 0; x < gw; x++) {
          var ox = Math.min(S.gw - 1, Math.round(x * S.gw / gw)), oy = Math.min(S.gh - 1, Math.round(y * S.gh / gh));
          F[y * gw + x] = S.F[oy * S.gw + ox]; H[y * gw + x] = S.H[oy * S.gw + ox];
        }
      }
      S.cell = cell; S.gw = gw; S.gh = gh; S.F = F; S.H = H; S.RR = RRr; S.U8 = new Uint8Array(gw * gh);
    }
    function uploadFog() {
      var F = S.F, U = S.U8;
      for (var i = 0; i < F.length; i++) U[i] = F[i] * 255;
      gl.bindTexture(gl.TEXTURE_2D, TEX.FG); gl.texImage2D(gl.TEXTURE_2D, 0, gl.LUMINANCE, S.gw, S.gh, 0, gl.LUMINANCE, gl.UNSIGNED_BYTE, U);
    }
    function clearDisc(cx, cy, r, hold, soft) {
      var c = S.cell, gw = S.gw, gh = S.gh, F = S.F, H = S.H;
      var x0 = Math.max(0, Math.floor((cx - r) / c)), x1 = Math.min(gw - 1, Math.ceil((cx + r) / c));
      var y0 = Math.max(0, Math.floor((cy - r) / c)), y1 = Math.min(gh - 1, Math.ceil((cy + r) / c)), got = 0;
      for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) {
        var dx = x * c - cx, dy = y * c - cy, d = Math.sqrt(dx * dx + dy * dy); if (d > r) continue;
        var a = soft ? clamp((r - d) / (r * .45), 0, 1) : 1, i = y * gw + x, nf = F[i] * (1 - a);
        got += F[i] - nf; F[i] = nf; H[i] = Math.max(H[i], hold * (.8 + Math.random() * .4));
      }
      return got;
    }
    function wipe(x0, y0, x1, y1, R) {
      var dx = x1 - x0, dy = y1 - y0, L = Math.sqrt(dx * dx + dy * dy), n = Math.max(1, Math.ceil(L / (R * .35))), got = 0;
      for (var k = 1; k <= n; k++) got += clearDisc(x0 + dx * k / n, y0 + dy * k / n, R, 1.8, true);
      /* a wipe pushes standing water aside: it gathers again at the edges of the path */
      for (var j = S.drops.length - 1; j >= 0; j--) {
        var d = S.drops[j]; if (d.run) continue;
        var t = L > 0 ? clamp(((d.x - x0) * dx + (d.y - y0) * dy) / (L * L), 0, 1) : 0, px = x0 + dx * t - d.x, py = y0 + dy * t - d.y;
        if (px * px + py * py < R * R) { S.acc += d.r * d.r * .9; S.drops.splice(j, 1); }
      }
      S.acc += got * S.cell * S.cell * .007;
      var nx = L > 0 ? -dy / L : 0, ny = L > 0 ? dx / L : 1;
      var guard = 0;
      while (S.acc > 8 && guard++ < 6) {
        S.acc -= 8; var side = Math.random() < .5 ? -1 : 1, off = R * (.88 + Math.random() * .25);
        drop(x1 + nx * off * side - dx * Math.random() * .6, y1 + ny * off * side - dy * Math.random() * .6, 1.6 + Math.random() * 2.6, false);
      }
    }
    function drop(x, y, r, run, evap) {
      if (S.drops.length > (S.compact ? 110 : 190)) { if (evap) return; S.drops.shift(); }
      var d = { x: x, y: y, r: r, vx: 0, vy: 0, run: !!run, stick: 0, trail: 0, evap: !!evap };
      /* merge into a standing drop it lands on: drops gather */
      for (var i = 0; i < S.drops.length; i++) {
        var o = S.drops[i], ddx = o.x - x, ddy = o.y - y, rr = (o.r + r) * .8;
        if (!o.run && !evap && !o.evap && ddx * ddx + ddy * ddy < rr * rr) { o.r = Math.sqrt(o.r * o.r + r * r); return o; }
      }
      S.drops.push(d); return d;
    }
    function stepDrops(dt) {
      var ds = S.drops, m = S.motion;
      for (var i = ds.length - 1; i >= 0; i--) {
        var d = ds[i];
        if (!d.run && !d.evap && d.r > 6.2) d.run = true;
        if (d.run) {
          if (d.stick > 0) { d.stick -= dt; d.vy *= .82; }
          else { d.vy = Math.min(d.vy + 420 * dt * (d.r / 6), 40 + d.r * 26); if (Math.random() < dt * .9) d.stick = .08 + Math.random() * .4; }
          d.vx += (Math.random() - .5) * dt * 70; d.vx *= .9;
          d.x += d.vx * dt * m; d.y += d.vy * dt * m;
          clearDisc(d.x, d.y, d.r * .85, 3.2, true);
          d.trail += d.vy * dt * m;
          if (d.trail > 15) { d.trail = 0; drop(d.x + (Math.random() - .5) * d.r * .5, d.y - d.r * 1.3, .8 + Math.random() * 1.1, false, true); d.r = Math.sqrt(Math.max(d.r * d.r - .55, 1)); }
          if (d.r < 3.6) { d.run = false; d.vy = 0; }
          for (var j = ds.length - 1; j >= 0; j--) {
            var o = ds[j]; if (o === d) continue;
            var dx = o.x - d.x, dy = o.y - d.y, rr = (o.r + d.r) * .78;
            if (dx * dx + dy * dy < rr * rr && o.r <= d.r * 1.05) { d.r = Math.min(9, Math.sqrt(d.r * d.r + o.r * o.r * .9)); ds.splice(j, 1); if (j < i) i--; }
          }
          if (d.y > S.h + 30) { ds.splice(i, 1); }
        } else if (d.evap) { d.r -= dt * .055 * m; if (d.r < .45) ds.splice(i, 1); }
        else { d.r -= dt * .012 * m; if (d.r < .8) ds.splice(i, 1); }
      }
    }
    function drawDrops() {
      var x = dmC.getContext('2d'), s = DM_S;
      x.clearRect(0, 0, dmC.width, dmC.height);
      for (var i = 0; i < S.drops.length; i++) {
        var d = S.drops[i], k = d.run ? 1 + Math.min(d.vy / 260, .45) : 1, r = d.r;
        if (d.run) x.drawImage(sprite, (d.x - r * .62) * s, (d.y - r * 1.55 - r * .62) * s, r * 1.24 * s, r * 1.24 * k * s);
        x.drawImage(sprite, (d.x - r) * s, (d.y - r * k) * s, 2 * r * s, 2 * r * k * s);
      }
      gl.bindTexture(gl.TEXTURE_2D, TEX.DM); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, dmC);
    }
    function makeSprite() {
      var n = 64, c = D.createElement('canvas'); c.width = c.height = n;
      var x = c.getContext('2d'), im = x.createImageData(n, n), a = im.data;
      for (var j = 0; j < n; j++) for (var i = 0; i < n; i++) {
        var px = (i + .5) / n * 2 - 1, py = (j + .5) / n * 2 - 1, d = Math.sqrt(px * px + py * py), o = (j * n + i) * 4;
        if (d >= 1) { a[o + 3] = 0; continue; }
        a[o] = (px * .5 + .5) * 255; a[o + 1] = (py * .5 + .5) * 255; a[o + 2] = Math.sqrt(1 - d * d) * 255;
        a[o + 3] = clamp((1 - d) / .06, 0, 1) * 255;
      }
      x.putImageData(im, 0, 0); return c;
    }
    sprite = makeSprite();

    /* ---- the word written into the fog by a finger ---- */
    function startWriting() {
      var txt = (root.getAttribute('data-word') || '').trim(); if (!txt) return;
      var fam = tok(root, '--apx-font-text', 'system-ui'), c = S.cell, gw = S.gw, gh = S.gh;
      var mc = D.createElement('canvas'); mc.width = gw; mc.height = gh;
      var x = mc.getContext('2d'); x.font = '500 100px ' + fam;
      try { x.letterSpacing = '6px'; } catch (e) {}
      var tw = x.measureText(txt).width / 100, spot = freeSpot(tw);
      var fs = spot.fs, fsc = fs / c;
      x.font = '500 ' + fsc.toFixed(2) + 'px ' + fam;
      try { x.letterSpacing = (fsc * .08).toFixed(2) + 'px'; } catch (e) {}
      var wpx = x.measureText(txt).width, cx = spot.cx / c, cy = spot.cy / c;
      x.textBaseline = 'middle'; x.fillStyle = '#fff'; x.fillText(txt, cx - wpx / 2, cy);
      var data = x.getImageData(0, 0, gw, gh).data, mask = new Uint8Array(gw * gh);
      for (var i = 0; i < gw * gh; i++) mask[i] = data[i * 4 + 3];
      S.writing = { mask: mask, x0: Math.max(0, Math.floor(cx - wpx / 2) - 1), x1: Math.min(gw - 1, Math.ceil(cx + wpx / 2) + 1),
        y0: Math.max(0, Math.floor(cy - fsc * .75)), y1: Math.min(gh - 1, Math.ceil(cy + fsc * .75)), p: 0, col: -1, runs: 0, dur: 1.2 + txt.length * .32 };
    }
    /* write where nothing else is: the largest empty patch of glass, preferring the right and the lower half */
    function freeSpot(tw) {
      var rr = root.getBoundingClientRect(), boxes = (S.lines || []).map(function (l) { return [l[0] - 16, l[1] - 16, l[0] + l[2] + 16, l[1] + l[3] + 16]; });
      root.querySelectorAll('.apx-g105__front > *').forEach(function (el) { var b = el.getBoundingClientRect(); if (b.width) boxes.push([b.left - rr.left - 20, b.top - rr.top - 20, b.right - rr.left + 20, b.bottom - rr.top + 20]); });
      var pad = Math.max(16, S.w * .04), best = null;
      for (var fs = Math.min(S.h * .3, 280, (S.w - pad * 2) / tw); fs >= 44; fs *= .9) {
        var ww = fs * tw, hh = fs * .9;
        for (var gy = 0; gy <= 12; gy++) for (var gx = 0; gx <= 12; gx++) {
          var x0 = pad + (S.w - pad * 2 - ww) * gx / 12, y0 = pad + (S.h - pad * 2 - hh) * gy / 12, x1 = x0 + ww, y1 = y0 + hh, hit = false;
          for (var i = 0; i < boxes.length && !hit; i++) { var b = boxes[i]; hit = x0 < b[2] && x1 > b[0] && y0 < b[3] && y1 > b[1]; }
          if (hit) continue;
          var score = gx * .6 + gy * .4 - Math.abs(gy - 8) * .3;
          if (!best || score > best.score) best = { score: score, fs: fs, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
        }
        if (best) return best;
      }
      return { fs: Math.min(S.h * .22, (S.w - pad * 2) / tw), cx: S.w / 2, cy: S.h * .82 };
    }
    function stepWriting(dt) {
      var wr = S.writing; if (!wr) return;
      wr.p = Math.min(1, wr.p + dt / wr.dur);
      var e = wr.p < .5 ? 2 * wr.p * wr.p : 1 - Math.pow(-2 * wr.p + 2, 2) / 2;
      var head = Math.floor(wr.x0 + (wr.x1 - wr.x0) * e), gw = S.gw, c = S.cell, F = S.F, H = S.H, M = wr.mask;
      for (var x = wr.col + 1; x <= head; x++) {
        for (var y = wr.y0; y <= wr.y1; y++) {
          var i = y * gw + x; if (M[i] < 40) continue;
          F[i] = Math.min(F[i], 1 - M[i] / 255); H[i] = 7 + Math.random() * 2.5;
          if (x > 0) { F[i - 1] *= .4; H[i - 1] = Math.max(H[i - 1], 6); }
          if (x < gw - 1) { F[i + 1] *= .4; H[i + 1] = Math.max(H[i + 1], 6); }
          /* water collects at the foot of each stroke; some of it runs */
          if (y < S.gh - 1 && M[i] > 200 && M[i + gw] < 40 && Math.random() < .07) { var run = wr.runs < 3 && Math.random() < .12; if (run) wr.runs++; drop(x * c + (Math.random() - .5) * c, (y + 1) * c, run ? 6.4 : 1.4 + Math.random() * 2.2, run); }
          else if (Math.random() < .015) drop(x * c, y * c, 1 + Math.random() * 1.4, false);
        }
      }
      wr.col = Math.max(wr.col, head);
      if (wr.p >= 1) S.writing = null;
    }
    /* keyboard users cannot wipe: when focus arrives the glass clears over the text by itself */
    function stepAuto(dt) {
      var a = S.auto; if (!a) return;
      var R = 48, rows = Math.max(1, Math.ceil((a.y1 - a.y0) / (R * 1.5))), p0 = a.p;
      a.p = Math.min(1, a.p + dt / (0.42 * rows));
      /* a hand clearing the pane in wide back-and-forth strokes, top to bottom */
      function at(p) {
        var f = p * rows, row = Math.min(rows - 1, Math.floor(f)), u = f - row; u = u * u * (3 - 2 * u);
        var x = row % 2 ? a.x1 - (a.x1 - a.x0) * u : a.x0 + (a.x1 - a.x0) * u;
        return [x, a.y0 + R * .7 + (a.y1 - a.y0 - R * 1.4) * (rows > 1 ? (row + u * .25) / (rows - .75) : .5) + Math.sin(u * 6.3) * 8];
      }
      var A = at(p0), B = at(a.p); wipe(A[0], A[1], B[0], B[1], R);
      for (var i = 0; i < S.F.length; i++) if (S.F[i] < .2) S.H[i] = Math.max(S.H[i], 6);
      if (a.p >= 1) S.auto = null;
    }
    function measure() {
      var rr = root.getBoundingClientRect();
      S.compact = W.matchMedia('(max-width: 899px)').matches;
      S.dpr = Math.min(W.devicePixelRatio || 1, S.compact ? 1.6 : 1.5);
      S.w = Math.max(2, rr.width); S.h = Math.max(2, rr.height);
      var cw = Math.round(S.w * S.dpr), ch = Math.round(S.h * S.dpr);
      if (cv.width !== cw || cv.height !== ch) { cv.width = cw; cv.height = ch; }
      dmC.width = Math.max(2, Math.round(S.w * DM_S)); dmC.height = Math.max(2, Math.round(S.h * DM_S));
      buildGrid();
    }

    function render() {
      if (lost) return;
      var u = PR.u; gl.useProgram(PR.p);
      gl.viewport(0, 0, cv.width, cv.height);
      gl.uniform2f(u.R, cv.width, cv.height); gl.uniform1f(u.dpr, S.dpr); gl.uniform1f(u.t, S.t); gl.uniform1f(u.breath, S.breath);
      gl.uniform1f(u.dark, T.dark); gl.uniform1f(u.still, S.stat ? 1 : 0);
      gl.uniform3fv(u.bgc, T.bg); gl.uniform3fv(u.ink, T.ink); gl.uniform3fv(u.cold, T.cold);
      var names = ['TX', 'TB', 'FG', 'DM'];
      for (var i = 0; i < 4; i++) { gl.activeTexture(gl.TEXTURE0 + i); gl.bindTexture(gl.TEXTURE_2D, TEX[names[i]]); gl.uniform1i(u[names[i]], i); }
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    var loop = ambient(root, api, function (now, dt) {
      var m = S.motion; S.t += dt * m;
      S.breath = Math.sin(S.t * .45);
      /* fog breathes back: each cell waits, then returns at its own pace */
      var F = S.F, H = S.H, RRr = S.RR, k = dt * m * (.2 + .05 * S.breath);
      for (var i = 0; i < F.length; i++) {
        if (H[i] > 0) { H[i] -= dt * m; continue; }
        if (F[i] < 1) F[i] = Math.min(1, F[i] + k * RRr[i] * (1.06 - F[i]));
      }
      stepWriting(dt * m); stepAuto(dt * m);
      /* now and then a heavy drop lets go on its own */
      if (S.t > S.spawnAt) {
        S.spawnAt = S.t + 2.4 + Math.random() * 3.2;
        var x = Math.random() * S.w, y = S.h * (.05 + Math.random() * .4);
        var ci = Math.floor(y / S.cell) * S.gw + Math.floor(x / S.cell);
        if (F[ci] > .7) drop(x, y, 6.3 + Math.random() * 1.6, true);
      }
      stepDrops(dt);
      uploadFog(); drawDrops(); render();
    });
    api.onVisible = function () {
      if (S.wrote || S.stat) return; S.wrote = true;
      setTimeout(function () { if (root.__apx && root.__apx.GLS105 && !S.stat) startWriting(); }, 450);
    };

    /* ---- input: mouse and pen wipe as they move; fingers wipe as they drag (the page still scrolls) ---- */
    var last = {};
    function local(cx, cy) { var r = root.getBoundingClientRect(); return [cx - r.left, cy - r.top]; }
    function stroke(id, cx, cy, R) {
      if (S.stat) return;
      var p = local(cx, cy), l = last[id];
      if (l && Math.abs(l[0] - p[0]) + Math.abs(l[1] - p[1]) < 220) wipe(l[0], l[1], p[0], p[1], R); else clearDisc(p[0], p[1], R, 1.8, true);
      last[id] = p;
    }
    api.on(root, 'pointermove', function (e) { if (e.pointerType === 'touch') return; stroke('m', e.clientX, e.clientY, e.buttons ? 46 : 34); }, { passive: true });
    api.on(root, 'pointerleave', function (e) { if (e.pointerType !== 'touch') delete last.m; });
    function tmove(e) { for (var i = 0; i < e.changedTouches.length; i++) { var t = e.changedTouches[i]; stroke('t' + t.identifier, t.clientX, t.clientY, 40); } }
    api.on(root, 'touchstart', function (e) { for (var i = 0; i < e.changedTouches.length; i++) delete last['t' + e.changedTouches[i].identifier]; tmove(e); }, { passive: true });
    api.on(root, 'touchmove', tmove, { passive: true });
    api.on(root, 'touchend', function (e) { for (var i = 0; i < e.changedTouches.length; i++) delete last['t' + e.changedTouches[i].identifier]; }, { passive: true });
    api.on(root, 'focusin', function () {
      if (S.stat || S.auto) return;
      var br = behind.getBoundingClientRect(), rr = root.getBoundingClientRect();
      S.auto = { p: 0, x0: br.left - rr.left - 20, x1: br.right - rr.left + 20, y0: br.top - rr.top - 10, y1: br.bottom - rr.top + 10 };
    });

    /* ---- still frame: the middle is wiped clear, fog and beads stay round the edges, a few runs frozen mid-way ---- */
    function paintStill() {
      var gw = S.gw, gh = S.gh, F = S.F, c = S.cell;
      var br = behind.getBoundingClientRect(), rr = root.getBoundingClientRect();
      var bx0 = br.left - rr.left - 40, bx1 = br.right - rr.left + 40, by0 = br.top - rr.top - 30, by1 = br.bottom - rr.top + 30;
      for (var y = 0; y < gh; y++) for (var x = 0; x < gw; x++) {
        var px = x * c, py = y * c;
        var ex = (px - (bx0 + bx1) / 2) / ((bx1 - bx0) / 2 + 70), ey = (py - (by0 + by1) / 2) / ((by1 - by0) / 2 + 60), d = Math.max(0, Math.pow(ex * ex * ex * ex + ey * ey * ey * ey, .25) - .9) * 300;
        var edge = Math.min(px, py, S.w - px, S.h - py);
        F[y * gw + x] = clamp(d / 90, 0, 1) * clamp(1.35 - edge / Math.max(160, Math.min(S.w, S.h) * .45), 0, 1) + (d > 0 ? .25 * clamp(d / 60, 0, 1) : 0);
        F[y * gw + x] = clamp(F[y * gw + x], 0, 1);
      }
      var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return s / 2147483647; }; })(7);
      S.drops = [];
      for (var i = 0; i < 60; i++) {
        var x0 = rnd() * S.w, y0 = rnd() * S.h, ci = Math.floor(y0 / c) * gw + Math.floor(x0 / c);
        if (F[ci] > .45) S.drops.push({ x: x0, y: y0, r: 1.4 + rnd() * 3.6, vx: 0, vy: 0, run: false, stick: 0, trail: 0 });
      }
      for (var j = 0; j < 3; j++) {
        var rx = S.w * (j === 0 ? .035 : j === 1 ? .955 : .985), ry0 = S.h * (.04 + rnd() * .12), len = S.h * (.22 + rnd() * .3), yy = ry0;
        for (; yy < ry0 + len; yy += 6) { var xx = rx; clearDisc(xx, yy, 4.5, 0, false); if (rnd() < .2) S.drops.push({ x: xx + (rnd() - .5) * 3, y: yy, r: .7 + rnd() * .9, vx: 0, vy: 0, run: false, stick: 0, trail: 0 }); }
        S.drops.push({ x: rx, y: yy, r: 5.4, vx: 0, vy: 0, run: true, stick: 0, trail: 0 });
      }
      uploadFog(); drawDrops(); render();
    }

    api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.remove('is-gl'); loop.stop(); });
    api.on(cv, 'webglcontextrestored', function () { lost = false; if (initGL()) { root.classList.add('is-gl'); setup(); } });
    api.add(function () { freeGL(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    var rzT = 0;
    var ro = new ResizeObserver(function () { clearTimeout(rzT); rzT = setTimeout(function () { measure(); snapshot(); if (S.stat) paintStill(); }, 60); });
    ro.observe(root); api.add(function () { ro.disconnect(); clearTimeout(rzT); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.GLS105 || lost) return; snapshot(); if (S.stat) paintStill(); });

    function setup() {
      var m = motionOf(root); S.motion = m; S.stat = m === 0;
      root.classList.toggle('is-static', S.stat);
      readTokens(); measure(); snapshot();
      if (S.stat) { loop.stop(); S.t = 20; S.breath = 0; S.writing = null; S.auto = null; paintStill(); }
      else {
        if (S.wasStat) { S.F.fill(1); S.H.fill(0); S.drops = []; }
        loop.start();
      }
      S.wasStat = S.stat;
    }
    api.retoken = setup;
    if (RM.addEventListener) { RM.addEventListener('change', setup); api.add(function () { RM.removeEventListener('change', setup); }); }
    setup();
  });
})();

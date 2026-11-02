/*! APEX library GLS-101 · Two-Piece Glass — self-contained, token-driven. window.APX['GLS-101'].mount(root) -> destroy()
   A thick smoked-glass card with a button-shaped hole cut through it. The button is its own slab of glass sitting flush
   in that hole: hover or keyboard focus lifts it toward you (real edge thickness, its own shadow on the card, the hole's
   bevelled walls bending the moving light behind); pressing seats it back with a small spring and a click.
   Markup: .apx-g101 > .apx-g101__card > (... .apx-g101__key) — the key must be a real <button> or <a href>.
   Options (attributes on root): data-shape="cut" (default, cut-corner slab) | "round" (circular slab); data-word="APEX"
   (the word drifting in the light behind the glass). Reads only --apx-* tokens. */
(function () {
  'use strict';
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  if (APX.GLS101 && APX.GLS101.mount) return;
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
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; upd(); if (vis && api.onVisible) api.onVisible(); }, { rootMargin: '10% 0px' });
    io.observe(el);
    api.on(D, 'visibilitychange', upd);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); } };
  }

  /* ---------------- shaders ---------------- */
  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  /* pass 1: the moving light behind the glass (liquid chrome, a word drifting through it) at half resolution */
  var FS_BG = [
    'precision highp float;',
    'uniform vec2 r;uniform float t;uniform vec2 m;uniform float rip;uniform float s;uniform vec3 lo;uniform vec3 hi;uniform float dark;',
    'uniform sampler2D W;uniform vec2 wsz;uniform float wOn;',
    'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
    'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}',
    'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n2(p);p=R*p*2.03;a*=.5;}return v;}',
    'float H(vec2 p){vec2 q=p*.95;vec2 w=vec2(fbm(q+vec2(0.,t*.045)),fbm(q+vec2(5.2,-t*.038)));',
    ' float h=fbm(q*1.3+w*1.9+vec2(t*.025,s*.35));float d=length(p-m);',
    ' h+=.055*sin(d*30.-t*3.2)*exp(-d*3.4)*rip;h+=.2*exp(-d*d*7.)*rip;return h;}',
    'float env(vec3 R){float sky=.10*smoothstep(-.4,1.,R.y);',
    ' float band=1.0*exp(-pow((R.y-(.30-s*.55))*7.,2.));float band2=.55*exp(-pow((R.y+(.12+s*.25))*10.,2.));',
    ' float v1=.62*exp(-pow((R.x+.62-s*.12)*10.,2.));float v2=.45*exp(-pow((R.x-.55)*13.,2.));',
    ' return .012+sky+band+band2+v1+v2;}',
    'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;',
    ' float e=1.6/r.y;float h=H(p);',
    ' vec3 n=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*.11,-(H(p+vec2(0.,e))-h)/e*.11,1.));',
    ' vec3 Rr=reflect(vec3(0.,0.,-1.),n);float E=env(Rr);float fres=pow(1.-max(n.z,0.),3.);',
    ' float L=E+fres*.35+pow(max(dot(n,normalize(vec3(.35,.55,1.))),0.),220.)*.6;',
    ' float bandH=.34*min(1.,r.x/r.y*1.25);vec2 wp=p+n.xy*.05;float wv=.5-(wp.y-.03)/bandH;',
    ' float wu=fract(wp.x/(bandH*wsz.x/wsz.y)+t*.011);',
    ' float wm=(wv>0.&&wv<1.)?texture2D(W,vec2(wu,wv)).a*wOn:0.;',
    ' L*=mix(.5,1.,smoothstep(1.3,0.,length(uv-vec2(.6,.45))));',
    ' if(dark>.5){L+=wm*(.16+.75*E);L=1.-exp(-L*1.3);L=pow(L,1.75)*1.02;}',
    ' else{L=1.-exp(-L*1.1);L=pow(L,1.2);L=L*.85-wm*.30;}',
    ' gl_FragColor=vec4(mix(lo,hi,clamp(L,0.,1.)),1.);}'
  ].join('\n');
  /* pass 2: the two pieces of glass, composited over the light at full resolution */
  var FS_GL = [
    'precision highp float;',
    'uniform vec2 R;uniform sampler2D B;uniform float dpr;uniform vec4 card;uniform vec4 key;',
    'uniform float cCut;uniform float kCut;uniform float rnd;uniform float lift;uniform float seat;uniform float focus;uniform float tilt;uniform float dark;',
    'uniform vec2 ptr;uniform vec3 ink;uniform vec3 bgc;uniform vec3 acc;uniform float time;',
    'vec3 hiT;vec3 loT;vec3 smk;',
    'vec3 bg(vec2 P){return texture2D(B,vec2(P.x,R.y-P.y)/R).rgb;}',
    'float sdCut(vec2 p,vec2 b,float c,float rr){vec2 q=abs(p)-b+rr;float d=length(max(q,0.))+min(max(q.x,q.y),0.)-rr;',
    ' float dc=(abs(p.x)+abs(p.y)-(b.x+b.y)+c)*.70710678;return p.x*p.y>0.?max(d,dc):d;}',
    'float dCard(vec2 P){return sdCut(P-card.xy,card.zw,cCut,2.*dpr);}',
    'float dKey(vec2 p){return rnd>.5?length(p)-key.z:sdCut(p,key.zw,kCut,2.*dpr);}',
    'float GAP;const float THK=13.;',
    'float dG(vec2 P){return max(dCard(P),-(dKey(P-key.xy)-GAP));}',
    'vec2 gG(vec2 P){vec2 e=vec2(1.,0.);return normalize(vec2(dG(P+e)-dG(P-e),dG(P+e.yx)-dG(P-e.yx))+1e-5);}',
    'vec2 gK(vec2 p){vec2 e=vec2(1.,0.);return normalize(vec2(dKey(p+e)-dKey(p-e),dKey(p+e.yx)-dKey(p-e.yx))+1e-5);}',
    'float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
    /* thick glass: frosted face, clear magnifying lip, split colour at the lip, chrome rim, pointer specular */
    'vec3 glass(vec2 P,float d,vec2 g,float bw,float thick,float smoke,float frost,float rim){',
    ' float inD=-d;float tb=clamp(inD/bw,0.,1.);float sl=(1.-tb)*(1.-tb);',
    ' vec3 n=normalize(vec3(g*sl*2.4,1.));vec2 off=-g*sl*thick*dpr;vec2 o1=P+off;',
    ' vec3 c=vec3(bg(o1+off*.14).r,bg(o1).g,bg(o1-off*.14).b);',
    ' float fr=frost*dpr;',
    ' vec3 bl=(bg(o1+vec2(fr,0.))+bg(o1-vec2(fr,0.))+bg(o1+vec2(0.,fr))+bg(o1-vec2(0.,fr))+bg(o1+vec2(fr,fr)*.7)+bg(o1-vec2(fr,fr)*.7)+bg(o1+vec2(fr,-fr)*.7)+bg(o1-vec2(fr,-fr)*.7))*.125;',
    ' c=mix(bl,c,.2+.8*sl);c=mix(c,smk,smoke*(1.-.55*sl));',
    ' vec3 Rv=reflect(vec3(0.,0.,-1.),n);vec2 lp=(ptr-P)/R.y;',
    ' float strip=exp(-pow((Rv.y+.32+lp.y*.5)*4.5,2.))+.75*exp(-pow((Rv.x-.42+lp.x*.5)*5.5,2.))+.55*exp(-pow((Rv.x+Rv.y+.6)*6.5,2.));',
    ' float fres=1.-n.z;',
    ' c+=hiT*strip*sl*rim;c=mix(c,loT,smoothstep(0.,.45,fres)*.22*(1.-min(strip,1.)));',
    ' vec3 L=normalize(vec3(lp*1.6,.5));float sp=pow(max(dot(n,normalize(L+vec3(0.,0.,1.))),0.),70.);',
    ' c+=hiT*sp*.5*sl*rim;',
    ' c+=hiT*(1.-smoothstep(0.,1.5*dpr,inD))*.6*rim;',
    ' c=mix(c,loT,(1.-smoothstep(0.,1.3*dpr,abs(inD-bw)))*.12);',
    ' return c;}',
    'void main(){',
    ' vec2 P=vec2(gl_FragCoord.x,R.y-gl_FragCoord.y);',
    ' GAP=2.2*dpr;',
    ' hiT=dark>.5?mix(ink,vec3(1.),.55):vec3(1.);loT=dark>.5?vec3(0.):ink*.6;smk=dark>.5?bgc*.42:mix(bgc,vec3(1.),.6);',
    ' vec3 col=bg(P);',
    ' float Lp=max(lift,0.);float sc=lift>=0.?1.+.07*Lp:1.+.10*lift;',
    ' vec2 o=vec2((tilt*9.-7.)*dpr*Lp,-24.*dpr*Lp);',
    ' float dc=dCard(P);',
    ' float dcs=dCard(P-vec2(0.,22.*dpr));',
    ' if(dc>0.)col*=1.-(dark>.5?.55:.22)*(1.-smoothstep(-24.*dpr,60.*dpr,dcs));',
    ' vec2 kp=P-key.xy;float dk=dKey(kp);float dh=dk-GAP;float g=max(dc,-dh);',
    ' vec2 so=vec2((5.-tilt*7.)*dpr*Lp,(3.+22.*Lp)*dpr);float sb=(3.+20.*Lp)*dpr;',
    ' float sh=(1.-smoothstep(-sb,sb,dKey(kp-so)))*((dark>.5?.30:.16)+(dark>.5?.42:.22)*Lp);',
    ' if(g<0.){',
    '  col=glass(P,g,gG(P),17.*dpr,26.,dark>.5?.5:.42,5.,1.);',
    '  vec2 cu=(P-(card.xy-card.zw))/(card.zw*2.);',
    '  col+=hiT*.06*smoothstep(.55,0.,length(cu*vec2(1.,.8)));',
    '  col*=1.-sh;',
    ' }else if(dc<0.){',
    '  float inH=-dh;float ww=(7.+4.*Lp)*dpr;vec2 gh=-gK(kp);',
    '  if(inH<ww){float k=1.-inH/ww;vec2 off=-gh*k*k*30.*dpr;vec3 w=vec3(bg(P+off*1.1).r,bg(P+off).g,bg(P+off*.9).b);',
    '   float face=.5+.5*dot(-gh,normalize(vec2(-.35,1.)));',
    '   w=mix(w,smk,.45)*(.45+.75*face);w+=hiT*pow(k,7.)*.5;w=mix(w,loT,pow(1.-k,4.)*.35);col=w;}',
    '  else col*=.9;',
    '  col*=1.-sh*.45;',
    ' }',
    /* the separate slab: its side wall first, then the top face */
    ' vec2 tq=(kp-o)/sc;float dt=dKey(tq)*sc;',
    ' if(dt<0.){',
    '  col=glass(P,dt,gK(tq),11.*dpr,34.,(dark>.5?.36:.30)-.08*Lp,3.5-1.5*Lp,1.3);',
    '  if(lift<0.)col*=1.+lift*1.6;',
    '  col+=hiT*.05*Lp;',
    ' }else if(Lp>.002&&dk<44.*dpr){',
    '  float st=-1.;',
    '  float k0=1.-min(1.,THK*dpr/max(length(o),1e-3));',
    '  for(int i=0;i<12;i++){float k=mix(k0,1.,float(i)/12.);float s2=mix(1.,sc,k);float di=dKey((kp-o*k)/s2)*s2;if(di<0.)st=(k-k0)/max(1.-k0,1e-3);}',
    '  if(st>=0.){',
    '   float kk=mix(k0,1.,st);float s2=mix(1.,sc,kk);vec2 ge=gK((kp-o*kk)/s2);',
    '   vec3 e=bg(P+vec2(ge.x*18.,-22.)*dpr*(1.-st*.6));',
    '   e=mix(e,smk*.8,.55);',
    '   float band=st+1./12.;',
    '   e*=.6+.5*smoothstep(0.,1.,band);',
    '   e+=hiT*(.10+.5*pow(band,6.));',
    '   e+=hiT*.4*(1.-smoothstep(0.,.18,band));',
    '   e+=hiT*.25*exp(-pow((ge.x+.2)*4.,2.))*band;',
    '   col=e;',
    '  }',
    ' }',
    ' float rd=abs(dt-6.*dpr);',
    ' col=mix(col,acc,focus*(1.-smoothstep(.5*dpr,1.6*dpr,rd))*.95);',
    ' if(dc<0.){col+=hiT*seat*exp(-abs(dh)/(2.5*dpr))*.9;',
    '  float wave=(1.-seat)*46.*dpr;col+=acc*seat*seat*.32*exp(-abs(dk-wave)/(1.1*dpr))*step(0.,dh);}',
    ' col+=(hash(P+fract(time))-.5)*.014;',
    ' gl_FragColor=vec4(col,1.);',
    '}'
  ].join('\n');

  register('GLS-101', 'Two-Piece Glass', function (root, opts, api) {
    root.classList.add('apx-g101');
    var card = root.querySelector('.apx-g101__card') || root;
    var keyEl = card.querySelector('.apx-g101__key') || card.querySelector('button, a[href]');
    if (!keyEl) return;
    var hadKeyClass = keyEl.classList.contains('apx-g101__key');
    keyEl.classList.add('apx-g101__key');
    /* the socket is the hole: it never moves, the key rides above it */
    var socket = D.createElement('span'); socket.className = 'apx-g101__socket';
    keyEl.parentNode.insertBefore(socket, keyEl); socket.appendChild(keyEl);
    var cv = D.createElement('canvas'); cv.className = 'apx-g101__cv'; cv.setAttribute('aria-hidden', 'true');
    root.insertBefore(cv, root.firstChild);
    api.add(function () {
      cv.remove();
      if (socket.parentNode) { socket.parentNode.insertBefore(keyEl, socket); socket.remove(); }
      keyEl.style.transform = ''; if (!hadKeyClass) keyEl.classList.remove('apx-g101__key');
      root.classList.remove('is-gl', 'is-static', 'is-lifted', 'is-pressed');
    });

    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, premultipliedAlpha: false, preserveDrawingBuffer: false }); } catch (e) { gl = null; }
    var P1 = null, P2 = null, buf = null, fbo = null, ftex = null, wtex = null, lost = false, fw = 2, fh = 2;
    var S = { lift: 0, v: 0, target: 0, k: 170, c: 15, seat: 0, focus: 0, focusT: 0, hover: false, foc: false, press: false,
      motion: 1, stat: false, t: 0, px: 0, py: 0, tpx: 0, tpy: 0, scroll: 0, scrollT: 0, rip: 0, lastMove: -9, introDone: false, idleAt: 0 };
    var G = { w: 2, h: 2, dpr: 1, card: [0, 0, 1, 1], key: [0, 0, 1, 1], cut: 28, kcut: 12, round: 0 };
    var T = { bg: [0, 0, 0], ink: [1, 1, 1], acc: [.8, 1, .2], dark: 1 };
    var word = { cv: null, w: 1, h: 1 };

    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    function prog(fs) {
      var p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fs));
      gl.bindAttribLocation(p, 0, 'a'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('link');
      var u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (var i = 0; i < n; i++) { var info = gl.getActiveUniform(p, i); u[info.name] = gl.getUniformLocation(p, info.name); }
      return { p: p, u: u };
    }
    function texInit(t) { gl.bindTexture(gl.TEXTURE_2D, t); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); }
    function initGL() {
      try {
        P1 = prog(FS_BG); P2 = prog(FS_GL);
        buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
        ftex = gl.createTexture(); texInit(ftex); fbo = gl.createFramebuffer();
        wtex = gl.createTexture(); texInit(wtex);
        return true;
      } catch (e) { return false; }
    }
    function freeGL() {
      if (!gl || gl.isContextLost()) return;
      [P1, P2].forEach(function (p) { if (p) gl.deleteProgram(p.p); });
      if (buf) gl.deleteBuffer(buf); if (ftex) gl.deleteTexture(ftex); if (wtex) gl.deleteTexture(wtex); if (fbo) gl.deleteFramebuffer(fbo);
    }
    var ok = !!gl && initGL();
    if (ok) root.classList.add('is-gl');

    function readTokens() {
      var bg = rgba(tok(root, '--apx-bg', '#0b0b0d'), '#0b0b0d'), ink = rgba(tok(root, '--apx-ink', '#ecebe8'), '#ecebe8');
      var acc = rgba(tok(root, '--apx-accent', '#d4ff3a'), '#d4ff3a');
      T.bg = bg.slice(0, 3); T.ink = ink.slice(0, 3); T.acc = acc.slice(0, 3); T.dark = lum(bg) < .45 ? 1 : 0;
      G.round = root.getAttribute('data-shape') === 'round' ? 1 : 0;
      buildWord();
    }
    function buildWord() {
      if (!ok) return;
      var txt = (root.getAttribute('data-word') || 'APEX').toUpperCase();
      var fam = tok(root, '--apx-font-display', '') || tok(root, '--apx-font-text', 'system-ui');
      var c = word.cv || (word.cv = D.createElement('canvas')), x = c.getContext('2d');
      var fs = 200, font = '700 ' + fs + 'px ' + fam;
      x.font = font; var tw = Math.ceil(x.measureText(txt).width + fs * .18 * txt.length * .5);
      c.width = Math.max(8, Math.min(4096, tw + Math.round(fs * 1.1))); c.height = 256;
      x = c.getContext('2d'); x.clearRect(0, 0, c.width, c.height);
      x.font = font; x.textBaseline = 'middle'; x.fillStyle = '#fff';
      try { x.letterSpacing = Math.round(fs * .09) + 'px'; } catch (e) {}
      x.fillText(txt, fs * .55, 132);
      word.w = c.width; word.h = c.height;
      gl.bindTexture(gl.TEXTURE_2D, wtex);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
    }

    function measure() {
      var rr = root.getBoundingClientRect(), cr = card.getBoundingClientRect(), kr = socket.getBoundingClientRect();
      var compact = W.matchMedia('(max-width: 899px)').matches;
      var dpr = Math.min(W.devicePixelRatio || 1, compact ? 1.5 : 1.75);
      G.dpr = dpr;
      G.w = Math.max(2, Math.round(rr.width * dpr)); G.h = Math.max(2, Math.round(rr.height * dpr));
      G.card = [(cr.left - rr.left + cr.width / 2) * dpr, (cr.top - rr.top + cr.height / 2) * dpr, cr.width / 2 * dpr, cr.height / 2 * dpr];
      G.key = [(kr.left - rr.left + kr.width / 2) * dpr, (kr.top - rr.top + kr.height / 2) * dpr, kr.width / 2 * dpr, kr.height / 2 * dpr];
      G.cut = (compact ? 22 : 30) * dpr; G.kcut = Math.min(14, kr.height * .24) * dpr;
      if (!ok) return;
      if (cv.width !== G.w || cv.height !== G.h) { cv.width = G.w; cv.height = G.h; }
      var nfw = Math.max(2, Math.round(G.w * .5)), nfh = Math.max(2, Math.round(G.h * .5));
      if (nfw !== fw || nfh !== fh || !S.fboReady) {
        fw = nfw; fh = nfh;
        gl.bindTexture(gl.TEXTURE_2D, ftex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, fw, fh, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, ftex, 0);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null); S.fboReady = true;
      }
      if (!S.ptrSet) { S.px = S.tpx = G.card[0] - G.card[2] * .6; S.py = S.tpy = G.card[1] - G.card[3] * 1.4; }
    }

    function render() {
      if (!ok || lost) return;
      var dark = T.dark, bg = T.bg, ink = T.ink, lo, hi;
      if (dark) { lo = [bg[0] * .55, bg[1] * .55, bg[2] * .6]; hi = [ink[0] * .55 + .45, ink[1] * .55 + .45, ink[2] * .55 + .47]; }
      else { lo = [bg[0] * .72 + ink[0] * .05, bg[1] * .72 + ink[1] * .05, bg[2] * .74 + ink[2] * .05]; hi = [Math.min(1, bg[0] * .2 + .82), Math.min(1, bg[1] * .2 + .82), Math.min(1, bg[2] * .2 + .84)]; }
      var a = Math.max(.5, G.h) ? G.h : 1;
      /* pass 1 */
      gl.bindFramebuffer(gl.FRAMEBUFFER, fbo); gl.viewport(0, 0, fw, fh);
      var u = P1.u; gl.useProgram(P1.p);
      gl.uniform2f(u.r, fw, fh); gl.uniform1f(u.t, S.t);
      gl.uniform2f(u.m, (S.px / G.w - .5) * (G.w / G.h), .5 - S.py / G.h); gl.uniform1f(u.rip, .35 + S.rip * .65); gl.uniform1f(u.s, S.scroll);
      gl.uniform3fv(u.lo, lo); gl.uniform3fv(u.hi, hi); gl.uniform1f(u.dark, dark);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, wtex); gl.uniform1i(u.W, 0);
      gl.uniform2f(u.wsz, word.w, word.h); gl.uniform1f(u.wOn, 1);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      /* pass 2 */
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, G.w, G.h);
      u = P2.u; gl.useProgram(P2.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, ftex); gl.uniform1i(u.B, 0);
      gl.uniform2f(u.R, G.w, G.h); gl.uniform1f(u.dpr, G.dpr);
      gl.uniform4fv(u.card, G.card); gl.uniform4fv(u.key, G.key);
      gl.uniform1f(u.cCut, G.cut); gl.uniform1f(u.kCut, G.kcut); gl.uniform1f(u.rnd, G.round);
      gl.uniform1f(u.lift, S.lift); gl.uniform1f(u.seat, S.seat); gl.uniform1f(u.focus, S.focus);
      gl.uniform1f(u.tilt, clamp((S.px - G.key[0]) / Math.max(1, G.w * .35), -1, 1));
      gl.uniform1f(u.dark, dark); gl.uniform2f(u.ptr, S.px, S.py);
      gl.uniform3fv(u.ink, ink); gl.uniform3fv(u.bgc, bg); gl.uniform3fv(u.acc, T.acc); gl.uniform1f(u.time, S.stat ? 0 : S.t);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }

    function poseKey() {
      var Lp = Math.max(S.lift, 0), sc = S.lift >= 0 ? 1 + .07 * Lp : 1 + .10 * S.lift;
      var tilt = clamp((S.px - G.key[0]) / Math.max(1, G.w * .35), -1, 1);
      keyEl.style.transform = 'translate3d(' + ((tilt * 9 - 7) * Lp).toFixed(2) + 'px,' + (-24 * Lp).toFixed(2) + 'px,0) scale(' + sc.toFixed(4) + ')';
      root.classList.toggle('is-lifted', S.lift > .5);
    }
    function aim(target, k, c) { S.target = target; S.k = k; S.c = c; kick(); }
    function wantLift() { return S.hover || S.foc; }
    /* seat: the slab drops below flush, springs back with a small overshoot, a light flash runs round the hole */
    var reliftTo = 0;
    function seatClick() {
      S.seat = 1; aim(0, 620, 15);
      clearTimeout(reliftTo);
      reliftTo = setTimeout(function () { if (wantLift() && !S.press) aim(1, 170, 15); }, S.stat ? 0 : 420);
      if (S.stat) { S.lift = 0; S.seat = 0; still(); }
    }
    function press() { S.press = true; clearTimeout(reliftTo); aim(-.12, 900, 38); if (S.stat) { S.lift = -.12; still(); } }
    function release() { if (!S.press) return; S.press = false; seatClick(); }

    api.on(keyEl, 'pointerenter', function (e) { if (e.pointerType === 'mouse' || e.pointerType === 'pen') { S.hover = true; if (!S.press) aim(1, 170, 15); if (S.stat) { S.lift = 1; still(); } } });
    api.on(keyEl, 'pointerleave', function (e) { S.hover = false; if (S.press) { S.press = false; } if (!S.foc) { aim(0, 150, 16); if (S.stat) { S.lift = 0; still(); } } });
    api.on(keyEl, 'pointerdown', function (e) { if (e.button && e.button !== 0) return; press(); });
    api.on(keyEl, 'pointerup', release);
    api.on(keyEl, 'pointercancel', function () { S.press = false; aim(wantLift() ? 1 : 0, 170, 15); if (S.stat) { S.lift = wantLift() ? 1 : 0; still(); } });
    api.on(keyEl, 'focus', function () {
      var fv = true; try { fv = keyEl.matches(':focus-visible'); } catch (e) {}
      S.foc = true; S.focusT = fv ? 1 : 0; if (!S.press) aim(1, 170, 15); if (S.stat) { S.lift = 1; S.focus = S.focusT; still(); }
    });
    api.on(keyEl, 'blur', function () { S.foc = false; S.focusT = 0; if (!S.hover) aim(0, 150, 16); if (S.stat) { S.lift = 0; S.focus = 0; still(); } kick(); });
    api.on(keyEl, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { press(); if (e.key === 'Enter') setTimeout(release, 90); } });
    api.on(keyEl, 'keyup', function (e) { if (e.key === ' ') release(); });
    api.on(root, 'pointermove', function (e) {
      var rr = root.getBoundingClientRect();
      S.tpx = (e.clientX - rr.left) * G.dpr; S.tpy = (e.clientY - rr.top) * G.dpr; S.ptrSet = true; S.lastMove = S.t;
      if (S.stat) { S.px = S.tpx; S.py = S.tpy; still(); } else kick();
    }, { passive: true });
    api.on(W, 'scroll', function () {
      var rr = root.getBoundingClientRect();
      S.scrollT = clamp(-rr.top / Math.max(1, rr.height + W.innerHeight) + .5, 0, 1) - .5;
    }, { passive: true });

    function kick() { if (!S.stat) loop.start(); }
    var loop = ambient(root, api, function (now, dt) {
      var m = S.motion; S.t += dt * m;
      /* spring */
      var steps = 3, h = dt / steps;
      for (var i = 0; i < steps; i++) { var acc = S.k * (S.target - S.lift) - S.c * S.v; S.v += acc * h; S.lift += S.v * h; }
      S.seat *= Math.exp(-dt * 3.2); if (S.seat < .002) S.seat = 0;
      S.focus += (S.focusT - S.focus) * (1 - Math.exp(-dt * 12));
      S.px += (S.tpx - S.px) * (1 - Math.exp(-dt * 6)); S.py += (S.tpy - S.py) * (1 - Math.exp(-dt * 6));
      var ripT = S.t - S.lastMove < .9 ? 1 : 0; S.rip += (ripT - S.rip) * (1 - Math.exp(-dt * 2.4));
      S.scroll += (S.scrollT - S.scroll) * (1 - Math.exp(-dt * 3));
      /* touch screens: every few seconds the slab rises a little and seats again, so the two pieces read without hover */
      if (S.introDone && !wantLift() && !S.press && W.matchMedia('(hover: none)').matches && S.t > S.idleAt) {
        S.idleAt = S.t + 7; aim(.62, 120, 13); setTimeout(function () { if (!wantLift() && !S.press) seatClick(); }, 1300);
      }
      poseKey(); render();
    });
    api.onVisible = function () {
      if (S.introDone || S.stat) return; S.introDone = true; S.idleAt = S.t + 9;
      setTimeout(function () { if (!wantLift() && !S.press) aim(1, 120, 12); }, 650);
      setTimeout(function () { if (!wantLift() && !S.press) { S.press = false; aim(-.1, 900, 38); setTimeout(function () { if (!wantLift()) seatClick(); }, 110); } }, 2100);
    };
    api.add(function () { clearTimeout(reliftTo); });

    function still() { if (!ok) { poseKey(); return; } S.seat = 0; poseKey(); render(); }

    if (ok) {
      api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; root.classList.remove('is-gl'); });
      api.on(cv, 'webglcontextrestored', function () { lost = false; S.fboReady = false; if (initGL()) { root.classList.add('is-gl'); setup(); } });
      api.add(function () { freeGL(); var ext = gl.getExtension('WEBGL_lose_context'); if (ext) ext.loseContext(); });
    }
    var ro = new ResizeObserver(function () { measure(); if (S.stat) still(); else kick(); });
    ro.observe(root); ro.observe(card); api.add(function () { ro.disconnect(); });
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (!root.__apx || !root.__apx.GLS101) return; readTokens(); measure(); if (S.stat) still(); });

    function setup() {
      var m = motionOf(root); S.motion = m; S.stat = m === 0;
      root.classList.toggle('is-static', S.stat);
      readTokens(); measure();
      if (S.stat) { loop.stop(); S.t = 14; S.lift = wantLift() ? 1 : 0; S.v = 0; S.seat = 0; S.rip = 0; S.scroll = 0; still(); }
      else loop.start();
    }
    api.retoken = setup;
    if (RM.addEventListener) { RM.addEventListener('change', setup); api.add(function () { RM.removeEventListener('change', setup); }); }
    setup();
  });
})();

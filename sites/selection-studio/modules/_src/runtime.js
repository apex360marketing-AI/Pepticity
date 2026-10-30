/* =====================================================================
   SELECTION STUDIO · MODULE RUNTIME (inlined into every module by modules/_build.py)
   window.PM:
     PM.acc            current accent {k,n,hex,rgb}; PM.setAcc(slug|hex|{acc}) re-tints live
     PM.playing        ambient motion state. Standalone = plays. In an iframe it waits for the shell:
                       postMessage({cmd:'play'}) / ({cmd:'pause'}); ?autoplay=1 forces play.
     PM.on(ev, fn)     'acc' | 'play' | 'pause'
     PM.ambient(fn)    fn(dt, t) every frame while playing (and visible, and motion allowed)
     PM.loop(step)     an interactive rAF loop that sleeps when step() returns false; .kick() wakes it
     PM.smoke(canvas)  the BG-P01 silver smoke ground, tied to play/pause
     PM.RM / PM.FINE   reduced motion / fine pointer
   Messages in:  {acc:'blue'} · {cmd:'play'|'pause'} · {cmd:'acc',acc:'red'} · 'play' · 'pause'
   Messages out: {type:'pep-module', event:'ready'|'acc'|'state', code, ...}
   ===================================================================== */
(function () {
  'use strict';
  var D = document, H = D.documentElement, W = window;
  var ACC = [
    { k: 'chartreuse', n: 'CHARTREUSE', hex: '#D4FF3A' }, { k: 'blue', n: 'BLUE', hex: '#0066FF' },
    { k: 'cyan', n: 'CYAN', hex: '#0FFFFF' }, { k: 'red', n: 'RED', hex: '#FF004F' },
    { k: 'violet', n: 'VIOLET', hex: '#6F00FF' }, { k: 'orchid', n: 'ORCHID', hex: '#8D029B' },
    { k: 'copper', n: 'COPPER', hex: '#C46210' }, { k: 'salmon', n: 'SALMON', hex: '#FA8072' },
    { k: 'platinum', n: 'PLATINUM', hex: '#E6E8EC' }];
  var rgbOf = function (h) { h = h.replace('#', ''); if (h.length === 3) h = h.replace(/./g, '$&$&'); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; };
  ACC.forEach(function (a) { a.rgb = rgbOf(a.hex); });
  var Q = new URLSearchParams(location.search);
  var inFrame = true; try { inFrame = W.self !== W.top; } catch (e) { }
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches || Q.get('rm') === '1';
  var FINE = matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (RM) H.classList.add('rm');
  if (!FINE) H.classList.add('touch');
  if (Q.get('bare') === '1') H.classList.add('pm-bare');
  if (Q.get('hint') === '0') H.classList.add('pm-nohint');

  function find(a) {
    if (!a) return null;
    if (typeof a === 'object') a = a.acc || a.slug || a.hex || a.k;
    a = String(a).trim().toLowerCase();
    for (var i = 0; i < ACC.length; i++) if (ACC[i].k === a || ACC[i].hex.toLowerCase() === a || ACC[i].n.toLowerCase() === a) return ACC[i];
    if (/^#?[0-9a-f]{6}$/.test(a)) { var hx = a[0] === '#' ? a : '#' + a; return { k: 'custom', n: 'CUSTOM', hex: hx.toUpperCase(), rgb: rgbOf(hx) }; }
    return null;
  }
  var cur = find(Q.get('acc')) || ACC[0];
  var subs = { acc: [], play: [], pause: [] };
  var PM = W.PM = {
    ACC: ACC, RM: RM, FINE: FINE, inFrame: inFrame, acc: cur, playing: false, code: '', t: 0,
    on: function (ev, fn) { (subs[ev] = subs[ev] || []).push(fn); return fn; },
    emit: function (ev, d) { (subs[ev] || []).forEach(function (f) { try { f(d); } catch (e) { console.error(e); } }); },
    post: function (msg) { if (!inFrame) return; msg.type = 'pep-module'; msg.code = PM.code; try { W.parent.postMessage(msg, '*'); } catch (e) { } },
    accVar: function (name) { return getComputedStyle(H).getPropertyValue(name).trim(); }
  };
  function applyAcc(a) {
    if (a.k === 'custom') {
      H.setAttribute('data-acc', 'custom');
      H.style.setProperty('--acc', a.hex); H.style.setProperty('--acc-text', 'color-mix(in srgb,' + a.hex + ' 70%,#fff)');
      var L = (a.rgb[0] * .299 + a.rgb[1] * .587 + a.rgb[2] * .114) / 255; H.style.setProperty('--acc-ink', L > .6 ? '#0b0b0c' : '#fff');
    } else { H.style.removeProperty('--acc'); H.style.removeProperty('--acc-text'); H.style.removeProperty('--acc-ink'); H.setAttribute('data-acc', a.k); }
    H.style.setProperty('--acc-rgb', a.rgb.join(','));
  }
  applyAcc(cur);
  PM.setAcc = function (a, quiet) {
    var x = find(a); if (!x) return false;
    var same = x.hex === PM.acc.hex; PM.acc = x; applyAcc(x);
    if (!same) { PM.emit('acc', x); if (!quiet) PM.post({ event: 'acc', acc: x.k, hex: x.hex }); }
    return true;
  };
  /* hex of the accent mixed toward white by k (for canvas / three.js consumers) */
  PM.accMix = function (k, base) { var b = base || [255, 255, 255], r = PM.acc.rgb; return r.map(function (v, i) { return Math.round(v + (b[i] - v) * k); }); };

  /* ---------- play / pause ---------- */
  var amb = [], raf = 0, last = 0;
  function frame(now) {
    raf = 0; var dt = Math.min(Math.max((now - last) / 1000, 0), 1 / 15); last = now; PM.t += dt;
    for (var i = 0; i < amb.length; i++) amb[i](dt, PM.t, now);
    if (PM.playing && !D.hidden && !RM) raf = requestAnimationFrame(frame);
  }
  function startAmb() { if (!raf && PM.playing && !D.hidden && !RM) { last = performance.now(); raf = requestAnimationFrame(frame); } }
  PM.ambient = function (fn) { amb.push(fn); startAmb(); return fn; };
  PM.play = function () { if (PM.playing) return; PM.playing = true; H.classList.remove('is-paused'); H.classList.add('is-playing'); startAmb(); PM.emit('play'); PM.post({ event: 'state', playing: true }); };
  PM.pause = function () { if (!PM.playing && H.classList.contains('is-paused')) return; PM.playing = false; H.classList.add('is-paused'); H.classList.remove('is-playing'); cancelAnimationFrame(raf); raf = 0; PM.emit('pause'); PM.post({ event: 'state', playing: false }); };
  D.addEventListener('visibilitychange', function () { if (!D.hidden) startAmb(); });
  H.classList.add('is-paused');

  /* a rAF loop that sleeps: step(now, dt) returns false to stop; kick() wakes it (interaction loops run even when paused) */
  PM.loop = function (step) {
    var id = 0, lt = 0;
    function f(now) { id = 0; var dt = Math.min(Math.max((now - (lt || now)) / 1000, 0), 1 / 15); lt = now; if (step(now, dt) !== false) id = requestAnimationFrame(f); else lt = 0; }
    return { kick: function () { if (!id) id = requestAnimationFrame(f); }, stop: function () { cancelAnimationFrame(id); id = 0; lt = 0; } };
  };
  PM.lerp = function (a, b, k) { return a + (b - a) * k; };
  PM.damp = function (c, t, l, dt) { return c + (t - c) * (1 - Math.exp(-l * dt)); };
  PM.clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };

  /* ---------- messages from the shell ---------- */
  W.addEventListener('message', function (e) {
    var d = e.data; if (d == null) return;
    if (typeof d === 'string') { if (d === 'play') return PM.play(); if (d === 'pause') return PM.pause(); try { d = JSON.parse(d); } catch (_) { return PM.setAcc(d); } }
    if (typeof d !== 'object') return;
    if (d.acc || d.cmd === 'acc') PM.setAcc(d.acc || d.hex, true);
    var c = d.cmd || d.action;
    if (c === 'play' || d.play === true) PM.play();
    else if (c === 'pause' || d.play === false) PM.pause();
  });

  /* ---------- corner hint + code tag ---------- */
  var ICON = {
    HOVER: '<path d="M5 3l10 4.6-4.3 1.3L9 13.4z"/><circle class="pulse" cx="9" cy="9" r="6.4"/>',
    TAP: '<circle cx="8" cy="8" r="2.2"/><circle class="pulse" cx="8" cy="8" r="6"/>',
    PRESS: '<rect x="2.5" y="5.5" width="11" height="6" rx=".6"/><path d="M8 1.5v2.6"/><circle class="pulse" cx="8" cy="8.5" r="6.2"/>',
    HOLD: '<rect x="2.5" y="5.5" width="11" height="6" rx=".6"/><path d="M5 8.5h6"/><circle class="pulse" cx="8" cy="8.5" r="6.2"/>',
    DRAG: '<path d="M2 8h12M2 8l2.6-2.6M2 8l2.6 2.6M14 8l-2.6-2.6M14 8l-2.6 2.6"/><circle class="pulse" cx="8" cy="8" r="2.4"/>',
    SCROLL: '<rect x="4.5" y="1.5" width="7" height="12" rx="3.5"/><path class="pulse" d="M8 4.5v2.4"/>',
    WIPE: '<path d="M2 11c2-4 4 2 6-2s4 2 6-2"/><circle class="pulse" cx="8" cy="9" r="2.4"/>'
  };
  function chrome() {
    var b = D.body; PM.code = b.dataset.code || '';
    var hint = (b.dataset.hint || 'HOVER').toUpperCase();
    if (!FINE && hint === 'HOVER') hint = 'TAP';
    var label = (!FINE && b.dataset.hintTouch) ? b.dataset.hintTouch.toUpperCase() : hint;
    var tag = D.createElement('div'); tag.className = 'pm-tag'; tag.setAttribute('aria-hidden', 'true');
    tag.innerHTML = '<i></i><b>' + PM.code + '</b><span>·</span>' + (b.dataset.name || '');
    var h = D.createElement('div'); h.className = 'pm-hint'; h.setAttribute('aria-hidden', 'true');
    h.innerHTML = '<svg viewBox="0 0 16 16">' + (ICON[hint] || ICON.HOVER) + '</svg>' + label;
    b.appendChild(tag); b.appendChild(h);
  }
  function boot() {
    chrome();
    var auto = !inFrame || Q.get('autoplay') === '1' || Q.get('play') === '1';
    if (Q.get('autoplay') === '0') auto = false;
    if (auto) PM.play();
    PM.post({ event: 'ready', acc: PM.acc.k, interact: D.body.dataset.hint || '' });
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* =====================================================================
   BG-P01 · SILVER SMOKE (brand/ui/smoke-bg.js, black mode), driven by the module's play state.
   Paused or reduced motion = one still frame. Pointer ripples it.
   ===================================================================== */
(function () {
  'use strict';
  var VS = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
  var FS = 'precision highp float;\n' +
  'uniform vec2 r;uniform float t;uniform vec2 m;uniform float rip;\n' +
  'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}\n' +
  'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}\n' +
  'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<4;i++){v+=a*n2(p);p=R*p*2.03;a*=.5;}return v;}\n' +
  'float H(vec2 p){vec2 q=p*.9;vec2 w=vec2(fbm(q+vec2(0.,t*.040)),fbm(q+vec2(5.2,-t*.034)));float h=fbm(q*1.3+w*1.9+vec2(t*.022,0.));\n' +
  ' float d=length(p-m);h+=.05*sin(d*30.-t*3.)*exp(-d*3.4)*rip;h+=.18*exp(-d*d*7.)*rip;return h;}\n' +
  'float env(vec3 R){float sky=.10*smoothstep(-.4,1.,R.y);float band=1.0*exp(-pow((R.y-.30)*7.,2.));float band2=.55*exp(-pow((R.y+.12)*10.,2.));\n' +
  ' float v1=.62*exp(-pow((R.x+.62)*10.,2.));float v2=.45*exp(-pow((R.x-.55)*13.,2.));return .012+sky+band+band2+v1+v2;}\n' +
  'void main(){vec2 uv=gl_FragCoord.xy/r;vec2 p=(gl_FragCoord.xy-.5*r)/r.y;float e=1.6/r.y;float h=H(p);\n' +
  ' vec3 n=normalize(vec3(-(H(p+vec2(e,0.))-h)/e*.11,-(H(p+vec2(0.,e))-h)/e*.11,1.));vec3 R=reflect(vec3(0.,0.,-1.),n);\n' +
  ' float fres=pow(1.-max(n.z,0.),3.);float E=env(R);float L=E+fres*.35;float d=length(p-m);L+=.28*exp(-d*d*9.)*(.4+.6*smoothstep(.2,1.,E));\n' +
  ' float spec=pow(max(dot(n,normalize(vec3(.35,.55,1.))),0.),220.);vec2 sp=p*1.2+vec2(t*.016,-t*.011);float sm=fbm(sp+fbm(sp*1.7+vec2(t*.02))*1.4);\n' +
  ' float wisp=smoothstep(.42,.86,sm);float vig=mix(.40,.80,smoothstep(1.3,0.,length(uv-vec2(.5,.46))));\n' +
  ' vec3 tint=vec3(.86,.885,.92);vec3 col=L*tint+vec3(.9)*spec*.45+tint*wisp*.10;col*=vig;col=1.-exp(-col*1.2);col=pow(col,vec3(1.55))*.66;\n' +
  ' float lum=dot(col,vec3(.3333));vec3 base=vec3(.043,.043,.047);vec3 uvb=vec3(.070,.058,.100);float uvm=(1.-smoothstep(0.,.16,lum))*smoothstep(.25,.85,sm);\n' +
  ' col=max(col,mix(base,uvb,uvm*.85));gl_FragColor=vec4(col,1.);}';
  window.PM.smoke = function (cv, opt) {
    opt = opt || {};
    var api = { frames: 0, ok: false };
    var gl = null; try { gl = cv.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power', preserveDrawingBuffer: false }); } catch (e) { }
    if (!gl) { cv.classList.add('pc-nogl'); return api; }
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr; try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, opt.fs || FS)); gl.linkProgram(pr); gl.useProgram(pr); }
    catch (err) { console.warn(err); cv.classList.add('pc-nogl'); return api; }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['r', 't', 'm', 'rip'].concat(opt.uniforms || []).forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    api.gl = gl; api.U = U; api.ok = true;
    var mobile = matchMedia('(max-width: 900px)').matches;
    var scale = Math.min(devicePixelRatio || 1, 1.5) * (opt.scale || (mobile ? .45 : .6));
    function size() { var b = cv.getBoundingClientRect(); cv.width = Math.max(2, b.width * scale | 0); cv.height = Math.max(2, b.height * scale | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U.r, cv.width, cv.height); api.scale = cv.width / Math.max(1, b.width); }
    var tx = .25, ty = .1, mx = .25, my = .1, rip = 0, lastMove = 0, T = opt.offset || 14;
    function draw(dt) {
      mx += (tx - mx) * .07; my += (ty - my) * .07;
      var ripT = performance.now() - lastMove < 900 ? 1 : 0; rip += (ripT - rip) * .04; api.frames++;
      if (dt) T += dt;
      gl.uniform1f(U.t, T); gl.uniform2f(U.m, mx, my); gl.uniform1f(U.rip, .3 + rip * .6);
      if (opt.before) opt.before(gl, U, api);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    api.draw = draw;
    size(); draw(0);
    addEventListener('resize', function () { size(); draw(0); });
    addEventListener('pointermove', function (e) {
      var b = cv.getBoundingClientRect(), a = b.width / Math.max(1, b.height);
      tx = ((e.clientX - b.left) / b.width - .5) * a; ty = .5 - (e.clientY - b.top) / b.height; lastMove = performance.now();
      if (!PM.playing || PM.RM) still.kick();
    }, { passive: true });
    /* when paused, pointer ripples still settle with a short burst so the ground answers the hand */
    var still = PM.loop(function (now) { if (PM.RM || PM.playing) return false; draw(0); return now - lastMove < 1200; });
    cv.addEventListener('webglcontextlost', function (e) { e.preventDefault(); cv.classList.add('pc-nogl'); });
    PM.ambient(function (dt) { draw(dt); });
    PM.on('acc', function () { if (!PM.playing || PM.RM) draw(0); });
    return api;
  };
  /* auto-mount the stage smoke */
  function mount() { var c = document.querySelector('.pm-bg canvas[data-smoke]'); if (c) PM.stageSmoke = PM.smoke(c); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount); else mount();
})();

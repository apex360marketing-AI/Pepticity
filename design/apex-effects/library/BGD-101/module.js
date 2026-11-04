/*! APEX library BGD-101 · Satin Folds — self-contained, token-driven. window.APX['BGD-101'].mount(root) -> destroy() */
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
  /* Scroll driver: smoothed progress of `root` through the viewport.
     mode 'pin'  = progress across a tall section's sticky run (0 at top hits top, 1 at bottom hits bottom)
     mode 'view' = progress while the element crosses the viewport (0 entering bottom, 1 leaving top)
     cb(progress, scrollVelocityPxPerSec, rawTarget) */
  function scrollDriver(root, api, cb, o) {
    o = o || {};
    var target = 0, cur = -1, raf = 0, active = false, last = 0, lastY = W.scrollY, sv = 0;
    function measure() {
      var r = root.getBoundingClientRect(), vh = W.innerHeight;
      var mode = typeof o.mode === 'function' ? o.mode() : (o.mode || 'pin');
      if (mode === 'pin') {
        var len = r.height - vh;
        target = len > 1 ? clamp(-r.top / len, 0, 1) : clamp((vh - r.top) / (vh + r.height), 0, 1);
      } else if (mode === 'enter') {
        /* 0 when top enters bottom edge, 1 when top reaches `o.at` of viewport */
        target = clamp((vh - r.top) / (vh * (1 - (o.at || .45))), 0, 1);
      } else target = clamp((vh - r.top) / (vh + r.height), 0, 1);
    }
    function tick(now) {
      raf = 0; measure();
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      var y = W.scrollY, inst = (y - lastY) / Math.max(dt, .001); lastY = y;
      sv += (inst - sv) * .25; if (Math.abs(sv) < 2) sv = 0;
      var k = o.smooth === 0 ? 1 : 1 - Math.exp(-dt * (o.smooth || 9));
      if (cur < 0) cur = target; else cur += (target - cur) * k;
      if (Math.abs(target - cur) < .0003) cur = target;
      cb(cur, sv, target);
      if (cur !== target || sv !== 0 || o.loop) { if (active && !D.hidden) raf = requestAnimationFrame(tick); }
      else last = 0;
    }
    function kick() { if (!raf && active && !D.hidden) raf = requestAnimationFrame(tick); }
    var io = new IntersectionObserver(function (es) { active = es[es.length - 1].isIntersecting; if (active) { lastY = W.scrollY; kick(); } }, { rootMargin: '25% 0px 25% 0px' });
    io.observe(root);
    api.on(W, 'scroll', kick, { passive: true }); api.on(W, 'resize', kick); api.on(D, 'visibilitychange', kick);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { kick: kick, reset: function () { cur = -1; kick(); }, progress: function () { return cur; } };
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
  /* ---- tiny full-screen WebGL plane (inlined for WebGL modules) ---- */
  var GL_HEAD = 'precision mediump float;\nuniform vec2 uRes;uniform float uT;uniform vec2 uM;uniform float uScroll;uniform float uMotion;uniform float uLight;\nuniform vec3 uBg;uniform vec3 uInk;uniform vec3 uAcc;uniform vec3 uMuted;\n' +
    'float h21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}\n' +
    'float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}\n';
  function glPlane(host, api, fragBody, o) {
    o = o || {};
    var cv = D.createElement('canvas');
    cv.className = o.cls || 'apx-gl'; cv.setAttribute('aria-hidden', 'true');
    host.appendChild(cv); api.add(function () { cv.remove(); });
    var gl = null;
    try { gl = cv.getContext('webgl', { antialias: false, alpha: false, depth: false, stencil: false, powerPreference: 'low-power', preserveDrawingBuffer: !!W.APX_TEST }); } catch (e) {}
    if (!gl) { cv.remove(); host.classList.add('is-fallback'); return null; }
    function sh(t, s) { var x = gl.createShader(t); gl.shaderSource(x, s); gl.compileShader(x); if (!gl.getShaderParameter(x, gl.COMPILE_STATUS)) throw new Error('APX shader: ' + gl.getShaderInfoLog(x)); return x; }
    var pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}'));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, GL_HEAD + fragBody));
    gl.linkProgram(pr); gl.useProgram(pr);
    var buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = {}; function u(n) { return U[n] !== undefined ? U[n] : (U[n] = gl.getUniformLocation(pr, n)); }
    var lost = false;
    api.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; host.classList.add('is-fallback'); cv.style.display = 'none'; });
    var scale = 1;
    function size() {
      var r = host.getBoundingClientRect();
      var s = Math.min(W.devicePixelRatio || 1, 2) * (isCompact() ? (o.mobileScale || .5) : (o.scale || .7));
      scale = s;
      var w = Math.max(2, Math.round(r.width * s)), h = Math.max(2, Math.round(r.height * s));
      if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; gl.viewport(0, 0, w, h); }
      gl.uniform2f(u('uRes'), w, h);
    }
    function tokens() {
      var bg = rgba(tok(host, '--apx-bg', '#0b0b0d')), ink = rgba(tok(host, '--apx-ink', '#ecebe8')),
        acc = rgba(tok(host, '--apx-accent', '#cfd3da')), mu = rgba(tok(host, '--apx-muted', '#8a8a90'));
      gl.uniform3f(u('uBg'), bg[0], bg[1], bg[2]); gl.uniform3f(u('uInk'), ink[0], ink[1], ink[2]);
      gl.uniform3f(u('uAcc'), acc[0], acc[1], acc[2]); gl.uniform3f(u('uMuted'), mu[0], mu[1], mu[2]);
      gl.uniform1f(u('uLight'), lum(bg) > .5 ? 1 : 0);
    }
    return {
      gl: gl, canvas: cv, u: u, size: size, tokens: tokens, scale: function () { return scale; },
      draw: function () { if (!lost) gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); },
      ok: function () { return !lost; }
    };
  }
  /* shared WebGL background lifecycle: tokens, resize, pointer, scroll, pause, reduced motion */
  function glBackground(root, api, frag, o) {
    o = o || {};
    var P = glPlane(root, api, frag, o);
    if (!P) return null;
    var gl = P.gl, mx = .5, my = .5, tx = .5, ty = .5, t = Math.random() * 40, sc = 0, motion = motionOf(root);
    P.tokens(); P.size();
    var ro = new ResizeObserver(function () { P.size(); if (!motion) render(); }); ro.observe(root); api.add(function () { ro.disconnect(); });
    function render() {
      gl.uniform1f(P.u('uT'), t); gl.uniform2f(P.u('uM'), mx, my); gl.uniform1f(P.u('uMotion'), motion);
      gl.uniform1f(P.u('uScroll'), sc); if (o.beforeDraw) o.beforeDraw(P, t); P.draw();
    }
    var target = (o.pointerTarget || root.parentElement || root);
    api.on(W, 'pointermove', function (e) {
      var r = root.getBoundingClientRect();
      tx = clamp((e.clientX - r.left) / Math.max(1, r.width), -.2, 1.2); ty = clamp(1 - (e.clientY - r.top) / Math.max(1, r.height), -.2, 1.2);
      if (o.onPointer) o.onPointer(e, r);
    }, { passive: true });
    var loop = ambient(root, api, function (now, dt) {
      t += dt * motion;
      var k = 1 - Math.exp(-dt * 4); mx += (tx - mx) * k; my += (ty - my) * k;
      var r = root.getBoundingClientRect(); sc = (W.innerHeight - r.top) / (W.innerHeight + r.height);
      if (o.onFrame) o.onFrame(dt, motion);
      render();
    });
    function setup() { motion = motionOf(root); P.tokens(); P.size(); render(); if (motion > 0) loop.start(); else loop.stop(); }
    api.retoken = setup;
    onEnvChange(api, setup);
    setup();
    return { P: P, render: render, motion: function () { return motion; } };
  }
  /* BGD-101 · Satin Folds — dark satin folds ripple slowly; the sheen follows the pointer and shifts with scroll. */
  var FRAG_SATIN = [
    'float fbm(vec2 p){return vnoise(p)*.65+vnoise(p*2.1+3.7)*.35;}',
    'float H(vec2 p,float t){float w=fbm(p*.55+vec2(t*.03,-t*.025));',
    '  return sin(p.x*1.25+p.y*.55+w*2.6+t*.22)*.62+sin(-p.x*.45+p.y*1.15+w*1.7-t*.16)*.38;}',
    'void main(){',
    '  vec2 uv=gl_FragCoord.xy/uRes; float asp=uRes.x/uRes.y;',
    '  vec2 p=vec2(uv.x*asp,uv.y)*2.2+vec2(0.,uScroll*1.6);',
    '  float t=uT, e=.02;',
    '  float h=H(p,t), hx=H(p+vec2(e,0.),t), hy=H(p+vec2(0.,e),t);',
    '  vec3 n=normalize(vec3((h-hx)/e*.85,(h-hy)/e*.85,1.));',
    '  vec3 L=normalize(vec3((uM.x-.5)*1.6,(uM.y-.5)*1.6,.75));',
    '  float diff=clamp(dot(n,L),0.,1.);',
    '  float spec=pow(clamp(dot(n,normalize(L+vec3(0.,0.,1.))),0.,1.),48.);',
    '  float rim=pow(1.-clamp(n.z,0.,1.),2.);',
    '  vec3 hi=mix(uInk,uAcc,.1);',
    '  vec3 dark=uBg*(.62+.45*diff)+uInk*(pow(diff,6.)*.06+rim*.035)+hi*spec*.24;',
    '  vec3 light=mix(mix(uBg,uInk,(1.-diff)*.11+rim*.04),vec3(1.),spec*.55);',
    '  vec3 col=mix(dark,light,uLight);',
    '  float v=smoothstep(.35,1.2,length((uv-.5)*vec2(asp*.7,1.)));',
    '  col=mix(col,uBg*.85,v*.6);',
    '  gl_FragColor=vec4(col,1.);',
    '}'].join('\n');
  register('BGD-101', 'Satin Folds', function (root, opts, api) {
    var bg = glBackground(root, api, FRAG_SATIN, { scale: .6, mobileScale: .45 });
    if (!bg) return;
  });
})();

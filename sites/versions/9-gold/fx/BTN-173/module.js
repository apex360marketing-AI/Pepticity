/* BTN-173 · Mercury Bead. window.APX.BTN173.mount(root) -> destroy()
   root: a single .apx-b173 element, or any container (every .apx-b173 inside is enhanced).
   Auto-mounts on [data-apx="BTN-173"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens (rebuilds on the 'apx:tokens' event). Reduced motion / --apx-motion:0 give a still bead.
   One small WebGL1 canvas per button for the liquid metal; without WebGL a drawn chrome bead stands in. */
(function () {
  /* CHROME GOLD (9-gold): the metal ramps are re-cast in the owner's liquid chrome-gold (#332814 / #68513d / #A4845D / #F0E6C7 / #FEF9E8) when the page says data-colour="gold" */
  var GOLD = document.documentElement.getAttribute('data-colour') === 'gold';
  function goldOf(h) {
    var n = parseInt(h.slice(1), 16), k = ((n >> 16 & 255) * .2126 + (n >> 8 & 255) * .7152 + (n & 255) * .0722) / 255;
    var R = [[0, 51, 40, 20], [.3, 104, 81, 61], [.55, 164, 132, 93], [.85, 240, 230, 199], [1, 254, 249, 232]], i = 1;
    while (i < R.length - 1 && k > R[i][0]) i++;
    var a = R[i - 1], b = R[i], t = Math.max(0, Math.min(1, (k - a[0]) / (b[0] - a[0])));
    return '#' + [1, 2, 3].map(function (j) { return ('0' + Math.round(a[j] + (b[j] - a[j]) * t).toString(16)).slice(-2); }).join('');
  }
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN173 && APX.BTN173.mount) return;
  var CODE = 'BTN-173', NAME = 'Mercury Bead', CLS = 'apx-b173', KEY = '__apxBTN173';
  var mm = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false, addEventListener: function () {} }; };
  var RM = mm('(prefers-reduced-motion: reduce)');
  var NS = 'http://www.w3.org/2000/svg', UID = 0, NB = 14;
  function svg(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, k) { return a + (b - a) * k; }
  function ease(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function easeIn(t) { t = clamp(t, 0, 1); return t * t * t; }

  /* ---- shared helper (same contract as the other APEX glass buttons) ---- */
  function Ctx(el) { this.el = el; this.offs = []; this.loops = []; this.tos = []; }
  Ctx.prototype = {
    c: function (n) { return CLS + '__' + n; },
    on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); this.offs.push(function () { t.removeEventListener(ev, fn, o); }); },
    motion: function () {
      if (RM.matches) return 0;
      var v = parseFloat(getComputedStyle(this.el).getPropertyValue('--apx-motion'));
      return isNaN(v) ? 1 : Math.max(0, v);
    },
    later: function (fn, ms) { var id = setTimeout(fn, ms); this.tos.push(id); return id; },
    loop: function (step) {
      var id = 0;
      function f(t) { id = 0; if (step(t) !== false) id = requestAnimationFrame(f); }
      var h = { kick: function () { if (!id) id = requestAnimationFrame(f); }, stop: function () { cancelAnimationFrame(id); id = 0; } };
      this.loops.push(h); return h;
    },
    size: function (cb) {
      var el = this.el, w = -1, h = -1;
      function run() { var nw = el.offsetWidth, nh = el.offsetHeight; if (nw !== w || nh !== h) { w = nw; h = nh; if (w && h) cb(w, h); } }
      if (window.ResizeObserver) { var ro = new ResizeObserver(run); ro.observe(el); this.offs.push(function () { ro.disconnect(); }); }
      else this.on(window, 'resize', run);
      run();
    },
    // visible = on screen and tab shown; cb(visible)
    seen: function (cb) {
      var el = this.el, onScr = true, self = this;
      function upd() { cb(onScr && !document.hidden); }
      if (window.IntersectionObserver) {
        var io = new IntersectionObserver(function (es) { onScr = es[es.length - 1].isIntersecting; upd(); }, { rootMargin: '60px' });
        io.observe(el); this.offs.push(function () { io.disconnect(); });
      }
      this.on(document, 'visibilitychange', upd);
      return function () { return onScr && !document.hidden; };
    },
    dec: function (tag, name, parent, html) {
      var n = document.createElement(tag); n.className = name.split(' ').map(this.c, this).join(' ');
      n.setAttribute('aria-hidden', 'true'); if (html) n.innerHTML = html; (parent || this.el).appendChild(n); return n;
    },
    label: function (name) {
      var l = document.createElement('span'); l.className = this.c(name || 'l');
      (this.orig || []).forEach(function (n) { l.appendChild(n); });
      this.el.appendChild(l); return l;
    },
    // shared state: .is-hot (hover / keyboard focus / touch press) and .is-press; cb(hot, press, why)
    states: function (cb) {
      var el = this.el, self = this, hov = false, foc = false, tch = false, prs = false, t = 0;
      function sync(why) { var hot = hov || foc || tch; el.classList.toggle('is-hot', hot); el.classList.toggle('is-press', prs); if (cb) cb(hot, prs, why); }
      this.on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { hov = true; sync('enter'); } });
      this.on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') hov = false; prs = false; sync('leave'); });
      this.on(el, 'pointerdown', function (e) {
        if (e.button > 0) return;
        prs = true; if (e.pointerType !== 'mouse') { clearTimeout(t); tch = true; } sync('down');
      });
      function up() { if (!prs && !tch) return; prs = false; if (tch) { clearTimeout(t); t = self.later(function () { tch = false; sync('touchend'); }, 900); } sync('up'); }
      this.on(el, 'pointerup', up); this.on(el, 'pointercancel', up);
      this.on(el, 'focus', function () { try { foc = el.matches(':focus-visible'); } catch (e) { foc = true; } sync(foc ? 'focus' : ''); });
      this.on(el, 'blur', function () { foc = false; prs = false; sync('blur'); });
      this.on(el, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { prs = true; sync('keydown'); } });
      this.on(el, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { prs = false; sync('keyup'); } });
      return { get hot() { return hov || foc || tch; }, get focus() { return foc; }, get hover() { return hov; }, get press() { return prs; } };
    },
    kill: function () {
      this.loops.forEach(function (h) { h.stop(); }); this.tos.forEach(clearTimeout);
      this.offs.forEach(function (f) { f(); }); this.offs = []; this.loops = []; this.tos = [];
    }
  };

  // any CSS colour (hex, rgb, oklch...) -> [r,g,b] 0..1, resolved inside el so var() fallbacks apply
  var probeCv = null;
  function rgbOf(el, cssVar, fb) {
    var p = document.createElement('i'); p.style.cssText = 'position:absolute;width:0;height:0;color:var(' + cssVar + ',' + fb + ')';
    el.appendChild(p); var s = getComputedStyle(p).color; el.removeChild(p);
    try {
      probeCv = probeCv || document.createElement('canvas'); probeCv.width = probeCv.height = 1;
      var g = probeCv.getContext('2d', { willReadFrequently: true }); g.clearRect(0, 0, 1, 1); g.fillStyle = '#000'; g.fillStyle = s; g.fillRect(0, 0, 1, 1);
      var d = g.getImageData(0, 0, 1, 1).data; return [d[0] / 255, d[1] / 255, d[2] / 255];
    } catch (e) { return [.83, 1, .23]; }
  }

  /* ---- liquid metal renderer: metaball field -> sphere-true dome normals -> studio chrome reflection ---- */
  var VS = 'attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}';
  var FS = [
    'precision highp float;',
    'uniform vec2 uRes;uniform float uDpr;uniform vec3 uB[' + NB + '];uniform float uR;uniform vec3 uSp;uniform vec3 uAcc;uniform float uLight;uniform vec2 uTilt;uniform float uT;',
    'float box(vec2 q,vec2 h,float s){vec2 d=abs(q)-h;return 1.-smoothstep(0.,s,max(d.x,d.y));}',
    'vec3 env(vec3 r,float px){',
    ' vec2 q=r.xy+vec2(px*.5+uTilt.x*.32+sin(uT*.13)*.05,uTilt.y*.2);float z=r.z;',
    ' vec3 ce=mix(vec3(.075,.08,.09),vec3(.1,.102,.108),uLight);',
    ' vec3 wall=mix(vec3(.97,.98,1.),vec3(.96,.97,.98),uLight);',
    ' vec3 fl=mix(vec3(.02,.022,.026),vec3(.22,.23,.25),uLight);',
    ' vec3 tray=mix(vec3(.38,.40,.44),vec3(.6,.61,.64),uLight);',
    ' vec3 c=mix(ce*8.,ce*2.6,smoothstep(-.7,.5,q.y));',
    ' c+=vec3(1.3)*box(q-vec2(-.18,-.46),vec2(.36,.09),.025);',
    ' c+=vec3(1.1)*box(q-vec2(.26,-.46),vec2(.05,.09),.02);',
    ' c+=vec3(.8)*box(q-vec2(.5,-.05),vec2(.05,.34),.05);',
    ' float ring=smoothstep(.3,.22,z)*smoothstep(-.72,-.62,z);',
    ' vec3 rc=mix(wall,tray,smoothstep(-.3,.7,q.y));',
    ' rc*=.84+.16*sin(atan(q.y,q.x)*3.+1.3);',
    ' c=mix(c,rc,ring);',
    ' c=mix(c,fl*2.,smoothstep(.05,.0,abs(z+.2))*smoothstep(-.1,.3,q.y));',
    ' c=mix(c,fl,smoothstep(-.7,-.8,z));',
    ' return c;}',
    'void main(){',
    ' vec2 p=vec2(gl_FragCoord.x,uRes.y*uDpr-gl_FragCoord.y)/uDpr;',
    ' float f=0.;vec2 g=vec2(0.);float sh=0.;',
    ' for(int i=0;i<' + NB + ';i++){vec3 b=uB[i];if(b.z>.01){vec2 d=p-b.xy;float r2=b.z*b.z;float dd=dot(d,d)+.0001;float k=r2/dd;f+=k;g+=-2.*k*d/dd;',
    '  vec2 ds=p-b.xy-vec2(b.z*.12,b.z*.62);float rs=b.z*1.25;sh+=rs*rs/(dot(ds,ds)+rs*rs*.6);}}',
    ' float gl=length(g)+.0001;float dist=(f-1.)/gl;float a=clamp(dist*uDpr+.5,0.,1.);',
    ' float inv=1./max(f,1.0002);float h=sqrt(max(1.-inv,.0004));vec2 dh=(g*inv*inv)/(2.*h);',
    ' vec3 n=normalize(vec3(-dh*uR,1.));',
    ' vec3 r=vec3(2.*n.z*n.x,2.*n.z*n.y,2.*n.z*n.z-1.);',
    ' float px=p.x/uRes.x-.5;',
    ' vec3 col=env(r,px);',
    GOLD ? ' col*=vec3(1.,.925,.76);' : '',
    ' vec3 L=normalize(vec3(-.42-uTilt.x*.3,-.7,.58));',
    ' col+=vec3(1.)*pow(max(dot(reflect(vec3(0.,0.,-1.),n),L),0.),90.)*1.6;',
    ' float fr=pow(1.-n.z,3.);col=mix(col,col*.5,fr*.4);',
    ' col+=vec3(.65,.67,.7)*smoothstep(.35,.95,n.y)*fr*.55;',
    ' float sa=smoothstep(.55,2.2,sh)*(.42+uLight*.08)*(1.-a);',
    ' vec2 sd=p-uSp.xy;float ray=exp(-abs(sd.x)*.42)*exp(-sd.y*sd.y*1.6)+exp(-abs(sd.y)*.5)*exp(-sd.x*sd.x*1.6);',
    ' float core=exp(-dot(sd,sd)*.16);float sp=uSp.z*(ray*.85+core*1.3);',
    ' vec3 o=col*a+uAcc*sp;float al=clamp(a+sa+sp*.9,0.,1.);',
    ' gl_FragColor=vec4(min(o,vec3(al)),al);}'
  ].join('\n');

  function GL(cv) {
    var gl = null;
    try { gl = cv.getContext('webgl', { premultipliedAlpha: true, alpha: true, antialias: false, depth: false, stencil: false, preserveDrawingBuffer: false, powerPreference: 'low-power' }); } catch (e) { gl = null; }
    if (!gl) return null;
    function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS) && !gl.isContextLost()) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pr);
    if (!gl.getProgramParameter(pr, gl.LINK_STATUS) && !gl.isContextLost()) throw new Error('link');
    gl.useProgram(pr);
    var bf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, bf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    var al = gl.getAttribLocation(pr, 'a'); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    var U = {}; ['uRes', 'uDpr', 'uB', 'uR', 'uSp', 'uAcc', 'uLight', 'uTilt', 'uT'].forEach(function (n) { U[n] = gl.getUniformLocation(pr, n); });
    var buf = new Float32Array(NB * 3);
    return {
      gl: gl,
      draw: function (s) {
        if (gl.isContextLost()) return;
        gl.viewport(0, 0, cv.width, cv.height); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
        for (var i = 0; i < NB; i++) { var b = s.balls[i]; buf[i * 3] = b ? b[0] : 0; buf[i * 3 + 1] = b ? b[1] : 0; buf[i * 3 + 2] = b ? b[2] : 0; }
        gl.uniform2f(U.uRes, s.w, s.h); gl.uniform1f(U.uDpr, s.dpr); gl.uniform3fv(U.uB, buf); gl.uniform1f(U.uR, s.R);
        gl.uniform3f(U.uSp, s.sp[0], s.sp[1], s.sp[2]); gl.uniform3f(U.uAcc, s.acc[0], s.acc[1], s.acc[2]);
        gl.uniform1f(U.uLight, s.light); gl.uniform2f(U.uTilt, s.tilt[0], s.tilt[1]); gl.uniform1f(U.uT, s.t);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      },
      free: function () { var x = gl.getExtension('WEBGL_lose_context'); if (x) x.loseContext(); }
    };
  }

  function octa(w, h, c, d) { // cut-corner outline, inset d (negative = outset)
    var k = Math.max(1.5, c - d * .4142);
    return [[d + k, d], [w - d - k, d], [w - d, d + k], [w - d, h - d - k], [w - d - k, h - d], [d + k, h - d], [d, h - d - k], [d, d + k]];
  }
  function pathOf(pts) { return 'M' + pts.map(function (p) { return p[0].toFixed(2) + ' ' + p[1].toFixed(2); }).join('L') + 'Z'; }

  function setup(el, ctx) {
    var sh = ctx.dec('span', 'sh'); ctx.dec('span', 'shi', sh);
    var g = ctx.dec('span', 'g'); ctx.dec('span', 'tray', g);
    var cv = document.createElement('canvas'); cv.className = ctx.c('cv'); cv.setAttribute('aria-hidden', 'true'); el.appendChild(cv);
    var fb = ctx.dec('span', 'fb');
    var gid = 'apx131c' + (++UID) + Math.random().toString(36).slice(2, 6);
    var s = svg('svg', { 'class': ctx.c('rim'), 'aria-hidden': 'true', focusable: 'false' });
    var lg = svg('linearGradient', { id: gid, gradientUnits: 'userSpaceOnUse' });
    [['0', '#5d646d'], ['.14', '#f4f7fa'], ['.26', '#8d959f'], ['.4', '#22262c'], ['.52', '#dfe4ea'], ['.63', '#ffffff'], ['.76', '#3a3f47'], ['.88', '#c9d0d8'], ['1', '#6f7781']].forEach(function (st) { lg.appendChild(svg('stop', { offset: st[0], 'stop-color': GOLD ? goldOf(st[1]) : st[1] })); });
    var defs = svg('defs', {}); defs.appendChild(lg); s.appendChild(defs);
    var ring = svg('path', { 'class': ctx.c('ring') }), track = svg('path', { 'class': ctx.c('track') }), inner = svg('path', { 'class': ctx.c('inner') }),
      bez = svg('path', { 'class': ctx.c('bez'), stroke: 'url(#' + gid + ')' }), hi = svg('path', { 'class': ctx.c('hi') });
    [ring, track, inner, bez, hi].forEach(function (n) { s.appendChild(n); }); el.appendChild(s);
    ctx.label();

    var W = 0, H = 0, C = 14, R = 8, dpr = 1, trk = null, trkLen = [], trkTot = 1, rgl = null, lost = false, live = true;
    var acc = [.83, 1, .23], light = 0, M = 1;
    // bead state (px, y down)
    var bx = 0, by = 0, vx = 0, vy = 0, tx = 0, ty = 0, px = -1, py = -1, tilt = [0, 0], tilt0 = [0, 0];
    var mode = 'idle', t0 = 0, drops = [], sp = 0, spX = 0, spY = 0, spT = -1, pulse = 0, mainK = 1, bounce = 0, last = 0, clock = 0;
    var st;

    function restY() { return H * .745; }
    function trackAt(u) {
      u = ((u % 1) + 1) % 1; var L = u * trkTot, i = 0;
      while (i < trkLen.length - 1 && trkLen[i + 1] < L) i++;
      var a = trk[i], b = trk[(i + 1) % trk.length], seg = trkLen[i + 1] - trkLen[i], k = seg ? (L - trkLen[i]) / seg : 0;
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];
    }
    function nearestU(x, y) { var best = 0, bd = 1e9; for (var i = 0; i < 64; i++) { var q = trackAt(i / 64), d = (q[0] - x) * (q[0] - x) + (q[1] - y) * (q[1] - y); if (d < bd) { bd = d; best = i / 64; } } return best; }

    function layout(w, h) {
      W = w; H = h; R = clamp(h * .135, 6.5, 11); C = clamp(parseFloat(getComputedStyle(el).getPropertyValue('--apx-radius')) || 14, 8, 18);
      C = Math.min(C, h * .3);
      var pts = octa(w, h, C, 0), clip = 'polygon(' + pts.map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')';
      g.style.clipPath = clip; sh.firstChild.style.clipPath = clip; cv.style.clipPath = 'polygon(' + octa(w, h, C, 2).map(function (p) { return p[0].toFixed(1) + 'px ' + p[1].toFixed(1) + 'px'; }).join(',') + ')';
      var pad = 8;
      s.setAttribute('viewBox', (-pad) + ' ' + (-pad) + ' ' + (w + 2 * pad) + ' ' + (h + 2 * pad));
      s.style.cssText = 'position:absolute;left:' + (-pad) + 'px;top:' + (-pad) + 'px;width:' + (w + 2 * pad) + 'px;height:' + (h + 2 * pad) + 'px;overflow:visible;pointer-events:none';
      ring.setAttribute('d', pathOf(octa(w, h, C, -5)));
      bez.setAttribute('d', pathOf(octa(w, h, C, 1.4)));
      hi.setAttribute('d', pathOf(octa(w, h, C, .2)));
      inner.setAttribute('d', pathOf(octa(w, h, C, 3.2)));
      var d = R * .62 + 5.5; trk = octa(w, h, C, d); track.setAttribute('d', pathOf(octa(w, h, C, 5.5)));
      trkLen = [0]; for (var i = 0; i < trk.length; i++) { var a = trk[i], b = trk[(i + 1) % trk.length]; trkLen.push(trkLen[i] + Math.hypot(b[0] - a[0], b[1] - a[1])); }
      trkTot = trkLen[trkLen.length - 1];
      lg.setAttribute('x1', '0'); lg.setAttribute('y1', '0'); lg.setAttribute('x2', String(w)); lg.setAttribute('y2', String(h * .9));
      fb.style.width = fb.style.height = (R * 2).toFixed(1) + 'px';
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(w * dpr)); cv.height = Math.max(1, Math.round(h * dpr));
      if (!bx) { bx = w * .5; by = restY(); }
      bx = clamp(bx, R * 2, w - R * 2); by = clamp(by, h * .55, h * .82);
      draw(); kick();
    }

    function retoken() {
      acc = rgbOf(el, '--apx-accent', '#d4ff3a');
      var bg = rgbOf(el, '--apx-bg', '#0b0b0d'); light = (bg[0] * .2126 + bg[1] * .7152 + bg[2] * .0722) > .5 ? 1 : 0;
      M = ctx.motion(); el.classList.toggle('is-still', !M);
      if (W) layout(W, H);
    }

    function balls() {
      var out = [], spd = Math.hypot(vx, vy), k = clamp(spd / 420, 0, 1), r = R * mainK * (1 + pulse * .13) * (1 + bounce * .18);
      if (r > .3) {
        var ux = spd > 1 ? vx / spd : 1, uy = spd > 1 ? vy / spd : 0, sq = 1 - bounce * .25;
        // flattened bead: two lobes side by side (mercury sags on the tray), plus lead and tail lobes when it rolls
        out.push([bx - r * .3, by + r * .06, r * .9 * sq]); out.push([bx + r * .3, by + r * .06, r * .9 * sq]);
        var lx = clamp(vx * .02, -R * 1.4, R * 1.4), ly = clamp(vy * .02, -R, R);
        if (k > .02) {
          out.push([bx + lx, by + ly, r * .55 * k]);
          out.push([bx - clamp(vx * .042, -R * 2.8, R * 2.8), by - clamp(vy * .034, -R * 1.6, R * 1.6), r * .66 * k]);
          out.push([bx - clamp(vx * .085, -R * 5.2, R * 5.2), by - clamp(vy * .066, -R * 2.6, R * 2.6), r * .42 * k]);
        }
        void ux; void uy;
      }
      drops.forEach(function (d) { if (d.r > .2) out.push([d.x, d.y, d.r]); });
      return out.slice(0, NB);
    }

    function draw() {
      if (!W) return;
      if (rgl && !lost) {
        rgl.draw({ balls: balls(), w: W, h: H, dpr: dpr, R: R, sp: [spX, spY, sp], acc: acc, light: light, tilt: tilt, t: clock });
      } else {
        var r = R * mainK * (1 + pulse * .13);
        fb.style.transform = 'translate(' + (bx - R).toFixed(2) + 'px,' + (by - R).toFixed(2) + 'px) scale(' + (r / R).toFixed(3) + ',' + (r / R * .86).toFixed(3) + ')';
        fb.style.opacity = r > .3 ? '1' : '0';
      }
      var a = (tilt[0] * 18 + Math.sin(clock * .2) * 6).toFixed(2);
      lg.setAttribute('gradientTransform', 'rotate(' + a + ' ' + (W / 2).toFixed(1) + ' ' + (H / 2).toFixed(1) + ')');
    }

    function burst() {
      if (!M) return;
      if (mode === 'burst' && (performance.now() - t0) < 900) return;
      mode = 'burst'; t0 = performance.now(); drops = [];
      var n = 8, u0 = nearestU(bx, by);
      for (var i = 0; i < n; i++) {
        var ang = (i / n) * Math.PI * 2;
        drops.push({ x: bx + Math.cos(ang) * 2, y: by + Math.sin(ang) * 2, vx: Math.cos(ang) * 260 + vx * .4, vy: Math.sin(ang) * 200 + vy * .4, r: 0, u: u0 + i / n, sp: .92 + ((i * 37) % 11) / 60 });
      }
      kick();
    }

    function step(now) {
      if (!live) return false;
      var dt = last ? Math.min(.05, (now - last) / 1000) : 1 / 60; last = now;
      M = ctx.motion();
      if (!M) { // still: bead resting under the label, finished
        mode = 'idle'; drops = []; sp = 0; pulse = 0; bounce = 0; mainK = 1; vx = vy = 0;
        bx = W * .5; by = restY(); tilt = [0, 0]; clock = 0; draw(); return false;
      }
      clock += dt * M;
      var tnow = clock;
      // targets
      if (st && st.hover && px >= 0) {
        tx = clamp(px, R * 2.2, W - R * 2.2); ty = clamp(lerp(restY(), py, .42), H * .6, H * .8);
      } else if (st && st.focus) { tx = W * .5; ty = restY(); }
      else { tx = W * .5 + Math.sin(tnow * .42) * W * .2 + Math.sin(tnow * 1.13 + 1) * W * .035; ty = restY() + Math.sin(tnow * .9) * H * .015; }
      pulse = st && st.focus && mode !== 'burst' ? Math.pow(Math.sin(tnow * 3.2), 2) : lerp(pulse, 0, .15);
      var tt0 = (st && st.hover && px >= 0) ? [(px / W - .5) * 1.2, (py / H - .5) * .8] : [Math.sin(tnow * .31) * .25, 0];
      tilt0 = tt0; tilt[0] = lerp(tilt[0], tilt0[0], .06); tilt[1] = lerp(tilt[1], tilt0[1], .06);
      // physics, fixed sub-steps
      var sub = Math.max(1, Math.ceil(dt / (1 / 120))), h = dt / sub, el2 = (performance.now() - t0) / 1000 / Math.max(M, .2);
      for (var k = 0; k < sub; k++) {
        if (mode !== 'burst' || el2 > 1.3) {
          var K = st && st.hover ? 70 : 38, D = st && st.hover ? 7.5 : 6;
          vx += (tx - bx) * K * h; vy += (ty - by) * K * h; var e = Math.exp(-D * h); vx *= e; vy *= e; bx += vx * h; by += vy * h;
        }
        drops.forEach(function (d) {
          var tgx, tgy;
          if (el2 < .2) { var q = trackAt(d.u - .02); tgx = lerp(d.x, q[0], ease(el2 / .2) * .6 + .1); tgy = lerp(d.y, q[1], ease(el2 / .2) * .6 + .1); }
          else if (el2 < .95) { var qq = trackAt(d.u + ease((el2 - .2) / .75) * .62 * d.sp); tgx = qq[0]; tgy = qq[1]; }
          else { var q3 = trackAt(d.u + .62 * d.sp), kk = easeIn((el2 - .95) / .38); tgx = lerp(q3[0], W * .5, kk); tgy = lerp(q3[1], restY(), kk); }
          var KK = el2 < .2 ? 160 : 300, DD = el2 < .2 ? 9 : 15;
          d.vx += (tgx - d.x) * KK * h; d.vy += (tgy - d.y) * KK * h; var ee = Math.exp(-DD * h); d.vx *= ee; d.vy *= ee; d.x += d.vx * h; d.y += d.vy * h;
        });
      }
      if (mode === 'burst') {
        mainK = el2 < .14 ? 1 - el2 / .14 : el2 < 1.2 ? 0 : clamp((el2 - 1.2) / .16, 0, 1);
        var dr = R * .5;
        drops.forEach(function (d, i) {
          var spd = Math.hypot(d.vx, d.vy);
          d.r = el2 < .12 ? dr * (el2 / .12) : el2 < 1.18 ? dr * (1 + clamp(spd / 1800, 0, .25)) : dr * clamp(1 - (el2 - 1.18) / .2, 0, 1);
        });
        if (el2 >= 1.18 && spT < 0) { bx = W * .5; by = restY(); vx = vy = 0; }
        if (el2 >= 1.3 && spT < 0) { spT = 0; spX = W * .5; spY = restY() - R * .55; bounce = 1; }
        if (el2 >= 1.45) { mode = 'idle'; drops = []; mainK = 1; }
      }
      if (spT >= 0) { spT += dt; sp = Math.sin(clamp(spT / .5, 0, 1) * Math.PI) * (1 - spT / .9); if (spT > .55) { sp = 0; spT = -1; } }
      bounce = lerp(bounce, 0, .08); if (bounce < .01) bounce = 0;
      draw();
      return true; // ambient: the bead always drifts while it is on screen
    }
    var loopH = ctx.loop(step), visible = true;
    function kick() { if (visible && live) { last = 0; loopH.kick(); } }
    var isSeen = ctx.seen(function (v) { visible = v; if (v) kick(); else loopH.stop(); });

    // renderer
    function initGL() {
      try { rgl = GL(cv); } catch (e) { rgl = null; }
      el.classList.toggle('is-fallback', !rgl);
    }
    initGL();
    ctx.on(cv, 'webglcontextlost', function (e) { e.preventDefault(); lost = true; el.classList.add('is-fallback'); draw(); });
    ctx.on(cv, 'webglcontextrestored', function () { lost = false; initGL(); draw(); });

    ctx.on(el, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = el.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; kick();
    }, { passive: true });
    ctx.on(el, 'pointerleave', function () { px = py = -1; });
    st = ctx.states(function (hot, press, why) {
      if (why === 'down' || why === 'keydown') burst();
      kick();
    });
    var onTok = function () { retoken(); kick(); };
    ctx.on(el, 'apx:tokens', onTok); ctx.on(window, 'apx:tokens', onTok);
    if (RM.addEventListener) ctx.on(RM, 'change', onTok);
    retoken();
    ctx.size(layout);
    visible = isSeen(); kick();
    return function () { live = false; if (rgl) rgl.free(); rgl = null; };
  }

  function enhance(el) {
    if (el[KEY]) return el[KEY];
    var orig = el.innerHTML, attrs = [].map.call(el.attributes, function (a) { return [a.name, a.value]; });
    var ctx = new Ctx(el), extra;
    ctx.orig = [].slice.call(el.childNodes);
    el.classList.add('is-apx');
    try { extra = setup(el, ctx); } catch (err) { ctx.kill(); el.innerHTML = orig; throw err; }
    function destroy() {
      ctx.kill(); if (typeof extra === 'function') extra();
      el.innerHTML = orig;
      [].slice.call(el.attributes).forEach(function (a) { el.removeAttribute(a.name); });
      attrs.forEach(function (a) { el.setAttribute(a[0], a[1]); });
      delete el[KEY];
    }
    el[KEY] = destroy; return destroy;
  }
  function mount(root) {
    if (!root || root.nodeType !== 1) return function () {};
    if (root[KEY + 'r']) return root[KEY + 'r'];
    var added = false;
    if (!root.classList.contains(CLS) && !root.querySelector('.' + CLS) && root.matches('button,a')) { root.classList.add(CLS); added = true; }
    var els = root.classList.contains(CLS) ? [root] : [].slice.call(root.querySelectorAll('.' + CLS));
    var ds = els.map(enhance);
    function destroy() { ds.forEach(function (d) { d(); }); if (added) root.classList.remove(CLS); delete root[KEY + 'r']; }
    root[KEY + 'r'] = destroy; return destroy;
  }
  APX.BTN173 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN173;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

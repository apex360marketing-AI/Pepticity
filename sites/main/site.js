/* PEPTICITY main site, sample 1.
   Chest film + light-cut engraving -> hero -> city weave scrubbed by scroll -> doors + card scanner
   -> lab scrubbed by scroll -> guided store (stop 1 shelf, stop 2 restock alerts).
   GSAP ScrollTrigger (scrub:1) + Lenis drive one ticker; frames are WebP atlases drawn to canvas. */
(function () {
  'use strict';
  var D = document.documentElement;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = D.classList.contains('rm');
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var LS = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var SS = {
    set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };
  if (typeof gsap === 'undefined') { D.classList.remove('intro-on', 'gated'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ---------- frame atlases (built by build-media.py) ---------- */
  var MAN = {
    'white-weave': { d: { n: 195, tw: 1024, th: 576, cols: 3, rows: 2, files: 33 }, m: { n: 195, tw: 432, th: 768, cols: 4, rows: 2, files: 25 } },
    'black-weave': { d: { n: 226, tw: 1024, th: 576, cols: 3, rows: 2, files: 38 }, m: { n: 226, tw: 432, th: 768, cols: 4, rows: 2, files: 29 } },
    'white-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } },
    'black-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } }
  };
  /* the portrait set is a centre crop of the 1912-wide film: x 652..1260 */
  var CROP = { d: { x: 0, w: 1 }, m: { x: 652 / 1912, w: 608 / 1912 } };

  var version = D.getAttribute('data-version') === 'black' ? 'black' : 'white';
  var kind = innerWidth / innerHeight < 0.95 ? 'm' : 'd';
  var seqs = {};
  var dirty = true;

  function Seq(name, k) {
    this.name = name; this.k = k; this.m = MAN[name][k];
    this.per = this.m.cols * this.m.rows;
    this.imgs = []; this.ok = new Uint8Array(this.m.files); this.req = new Uint8Array(this.m.files);
  }
  Seq.prototype.url = function (i) { return 'media/frames/' + this.name + '-' + this.k + '-' + ('00' + i).slice(-3) + '.webp'; };
  Seq.prototype.frame = function (f) {
    var a = Math.floor(f / this.per);
    if (!this.ok[a]) return null;
    var j = f % this.per, m = this.m;
    return { img: this.imgs[a], sx: (j % m.cols) * m.tw, sy: Math.floor(j / m.cols) * m.th };
  };
  Seq.prototype.nearest = function (f) {
    for (var d = 0; d < this.m.n; d++) {
      var a = this.frame(Math.max(0, f - d)); if (a) return a;
      if (f + d < this.m.n) { a = this.frame(f + d); if (a) return a; }
    }
    return null;
  };
  Seq.prototype.loaded = function () { var c = 0; for (var i = 0; i < this.ok.length; i++) c += this.ok[i]; return c; };
  function seq(part) {
    var key = version + '-' + part + '-' + kind;
    if (!seqs[key]) seqs[key] = new Seq(version + '-' + part, kind);
    return seqs[key];
  }

  /* a small loading queue: 4 at a time, first-come first-served, priority jobs jump the line */
  var queue = [], active = 0;
  function want(s, list, front) {
    var jobs = [];
    list.forEach(function (i) { if (i >= 0 && i < s.m.files && !s.req[i]) { s.req[i] = 1; jobs.push([s, i]); } });
    queue = front ? jobs.concat(queue) : queue.concat(jobs);
    pump();
  }
  function pump() {
    while (active < 4 && queue.length) {
      (function (job) {
        var s = job[0], i = job[1], img = new Image();
        active++;
        img.decoding = 'async';
        var done = function () { active--; pump(); };
        img.onload = function () {
          var fin = function () { s.imgs[i] = img; s.ok[i] = 1; dirty = true; done(); };
          if (img.decode) img.decode().then(fin, fin); else fin();
        };
        img.onerror = function () { s.req[i] = 0; done(); };
        img.src = s.url(i);
      })(queue.shift());
    }
  }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function loadAll() {
    var w = seq('weave'), l = seq('lab');
    want(w, range(w.m.files));
    want(l, range(l.m.files));
  }

  /* ---------- canvas painter: cover-fit, neighbouring frames cross-faded ---------- */
  function Painter(canvas, part) {
    this.c = canvas; this.ctx = canvas.getContext('2d'); this.part = part;
    this.rect = { x: 0, y: 0, w: 0, h: 0 }; this.last = -1; this.resize();
  }
  Painter.prototype.resize = function () {
    var r = Math.min(window.devicePixelRatio || 1, 1.5);
    this.W = this.c.clientWidth || innerWidth; this.H = this.c.clientHeight || innerHeight;
    this.c.width = Math.round(this.W * r); this.c.height = Math.round(this.H * r);
    this.ctx.setTransform(r, 0, 0, r, 0, 0);
    this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high';
    this.last = -1;
  };
  Painter.prototype.draw = function (f) {
    var s = seq(this.part), m = s.m;
    f = clamp(f, 0, m.n - 1);
    if (!dirty && Math.abs(f - this.last) < 0.004) return;
    var i = Math.floor(f), fr = f - i;
    var A = s.frame(i) || s.nearest(i);
    if (!A) return;
    var sc = Math.max(this.W / m.tw, this.H / m.th), dw = m.tw * sc, dh = m.th * sc;
    var dx = (this.W - dw) / 2, dy = (this.H - dh) / 2;
    var ctx = this.ctx;
    ctx.globalAlpha = 1;
    ctx.drawImage(A.img, A.sx, A.sy, m.tw, m.th, dx, dy, dw, dh);
    if (fr > 0.02 && i + 1 < m.n) {
      var B = s.frame(i + 1);
      if (B) { ctx.globalAlpha = fr; ctx.drawImage(B.img, B.sx, B.sy, m.tw, m.th, dx, dy, dw, dh); ctx.globalAlpha = 1; }
    }
    this.rect = { x: dx, y: dy, w: dw, h: dh };
    this.last = f;
  };

  var pW = new Painter($('#cvWeave'), 'weave');
  var pL = new Painter($('#cvLab'), 'lab');
  want(seq('weave'), [0], true);
  if (RM) want(seq('weave'), [seq('weave').m.files - 1], true);

  /* the doors overlay sits exactly on the full film frame the canvas shows */
  var doorbox = $('#doorbox');
  function layoutDoors() {
    var r = pW.rect, c = CROP[kind];
    if (!r.w) return;
    var fw = r.w / c.w, fx = r.x - c.x * fw;
    doorbox.style.left = fx + 'px'; doorbox.style.top = r.y + 'px';
    doorbox.style.width = fw + 'px'; doorbox.style.height = r.h + 'px';
  }

  /* ---------- smooth scroll + scroll progress ---------- */
  var lenis = null;
  if (!RM && typeof Lenis !== 'undefined' && matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ lerp: 0.085, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
    gsap.ticker.lagSmoothing(0);
  }
  function stopScroll() { if (lenis) lenis.stop(); document.body.style.overflow = 'hidden'; }
  function startScroll() { if (lenis) lenis.start(); document.body.style.overflow = ''; }
  function jump(y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }

  var J = { p: 0 }, L = { p: 0 };
  gsap.to(J, { p: 1, ease: 'none', scrollTrigger: { trigger: '.journey', start: 'top top', end: 'bottom bottom', scrub: RM ? true : 1 } });
  gsap.to(L, { p: 1, ease: 'none', scrollTrigger: { trigger: '#lab', start: 'top top', end: 'bottom bottom', scrub: RM ? true : 1 } });

  var W_IN = 0.05, W_OUT = 0.86;
  function weaveFrame(p) {
    var n = seq('weave').m.n - 1;
    if (RM) return p < 0.5 ? 0 : n;
    return ss(0, 1, clamp((p - W_IN) / (W_OUT - W_IN), 0, 1)) * 0.25 * n + clamp((p - W_IN) / (W_OUT - W_IN), 0, 1) * 0.75 * n;
  }
  function labFrame(p) { return clamp(p / 0.86, 0, 1) * (seq('lab').m.n - 1); }

  /* ---------- per-frame UI ---------- */
  var hero = $('#hero'), hooks = $$('.hook'), caps = $$('.cap'), scanner = $('#scanner');
  var labFade = $('.lab-fade'), nav = $('#nav'), store = $('#store');
  var marks = $$('.bg-mark .pm, .stage-mark .pm'), walks = $$('.walk');
  var busy = false, opened = false, introLive = D.classList.contains('intro-on');
  var lastScan = -1;

  function frameUI() {
    var p = J.p;
    pW.draw(weaveFrame(p));
    if (!D.classList.contains('gated')) pL.draw(labFrame(L.p));
    if (dirty) layoutDoors();
    dirty = false;

    doorbox.style.visibility = (busy || p >= W_OUT - 0.004 || (RM && p >= 0.5)) ? 'visible' : 'hidden';
    var ho = RM ? (p < 0.5 ? 1 : 0) : 1 - ss(0.012, 0.065, p);
    hero.style.opacity = ho;
    hero.style.visibility = ho < 0.01 ? 'hidden' : 'visible';
    if (!RM) hero.style.transform = 'translate3d(0,' + (-p * 900) + 'px,0)';

    hooks.forEach(function (h) {
      var a = +h.dataset.at, d = Math.abs(p - a), o = RM ? 0 : 1 - ss(0.03, 0.07, d);
      h.style.opacity = o;
      h.style.transform = 'translate3d(0,' + ((a - p) * 520) + 'px,0)';
    });

    if (!busy) {
      var so = RM ? (p >= 0.5 ? 1 : 0) : ss(0.885, 0.935, p);
      if (so !== lastScan) {
        scanner.style.opacity = so;
        scanner.classList.toggle('show', so > 0.01);
        if (!RM) scanner.style.transform = window.innerWidth > 760 && innerWidth / innerHeight >= 0.95 ? 'translate3d(0,calc(-50% + ' + ((1 - so) * 40) + 'px),0)' : 'translate3d(0,' + ((1 - so) * 40) + 'px,0)';
        lastScan = so;
      }
    }

    if (!D.classList.contains('gated')) {
      caps.forEach(function (c) {
        var a = +c.dataset.at, d = L.p - a, o = RM ? 1 : ss(-0.06, 0, d) * (1 - ss(0.16, 0.22, d));
        c.style.opacity = o;
        if (!RM) c.style.transform = 'translate3d(0,' + (-d * 160) + 'px,0)';
      });
      labFade.style.opacity = RM ? 0 : ss(0.82, 1, L.p);
      var sr = store.getBoundingClientRect();
      nav.classList.toggle('on-light', version === 'white' && sr.top < 70);
      walks.forEach(function (w) {
        var r = w.getBoundingClientRect(), c = (r.top + r.height / 2) / innerHeight;
        w.style.opacity = RM ? 1 : 1 - ss(0.12, 0.42, Math.abs(c - 0.5));
        if (!RM) w.style.transform = 'translate3d(0,' + ((c - 0.5) * -40) + 'px,0)';
      });
    } else nav.classList.remove('on-light');

    if (!RM) {
      var docH = Math.max(1, D.scrollHeight - innerHeight), s = (window.scrollY || 0) / docH;
      var ry = s * 540, rx = 12 + Math.sin(s * Math.PI * 2) * 6;
      marks.forEach(function (m, i) {
        var z = m.classList.contains('l3') ? -26 : m.classList.contains('l2') ? -13 : 0;
        m.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg) translateZ(' + z + 'px)';
      });
    }
  }
  gsap.ticker.add(frameUI);

  function onResize() {
    var k = innerWidth / innerHeight < 0.95 ? 'm' : 'd';
    if (k !== kind) { kind = k; want(seq('weave'), [Math.floor(weaveFrame(J.p) / seq('weave').per)], true); if (!introLive) loadAll(); }
    pW.resize(); pL.resize(); dirty = true; lastScan = -1;
  }
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(onResize, 120); });

  /* hero headline lifts off the screen toward the pointer */
  var h1 = $('.tilt3d');
  if (!RM && h1 && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', function (e) {
      var x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
      gsap.to(h1, { rotationY: x * 10, rotationX: -y * 8, z: 30, transformPerspective: 900, duration: 0.8, ease: 'power3.out', overwrite: 'auto' });
    }, { passive: true });
  }

  /* ---------- version: WHITE <-> BLACK ---------- */
  function setVersion(v, quiet) {
    version = v === 'black' ? 'black' : 'white';
    D.setAttribute('data-version', version);
    if (!quiet) LS.set('pc-version', version);
    $$('.vtoggle button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === version)); });
    $$('.leaf img').forEach(function (i) { i.src = 'media/' + version + '-doors.jpg'; });
    $('.doorway .peek').src = 'media/' + version + '-lab.jpg';
    $('.lab .still').src = 'media/' + version + '-lab.jpg';
    var w = seq('weave');
    want(w, [Math.floor(weaveFrame(J.p) / w.per), 0, w.m.files - 1], true);
    var l = seq('lab'); want(l, [Math.floor(labFrame(L.p) / l.per)], true);
    if (!introLive) loadAll();
    if (smoke) smoke.tint();
    dirty = true; pW.last = pL.last = -1;
  }
  $$('.vtoggle button').forEach(function (b) { b.addEventListener('click', function () { setVersion(b.dataset.v); }); });
  setVersion(version, true);

  /* ---------- background smoke (the Master Archive surface, made subtler and see-through) ---------- */
  var smoke = (function () {
    var cv = $('#smoke');
    var gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false });
    if (!gl) return null;
    var vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    var fs = 'precision mediump float;uniform vec2 r;uniform float t;uniform vec2 m;uniform float s;uniform vec3 tint;uniform float amt;' +
      'float h1(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}' +
      'float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h1(i),h1(i+vec2(1,0)),f.x),mix(h1(i+vec2(0,1)),h1(i+vec2(1,1)),f.x),f.y);}' +
      'float fbm(vec2 p){float v=0.,a=.5;mat2 R=mat2(.8,.6,-.6,.8);for(int i=0;i<5;i++){v+=a*n2(p);p=R*p*2.03;a*=.5;}return v;}' +
      'void main(){vec2 p=(gl_FragCoord.xy-.5*r)/r.y;vec2 q=p*1.35;' +
      'vec2 w=vec2(fbm(q+vec2(0.,t*.028)),fbm(q+vec2(5.2,-t*.022)));' +
      'float d=fbm(q*1.15+w*2.3+vec2(t*.018,s*.9));float d2=fbm(q*2.4-w+vec2(-t*.012,0.));' +
      'float k=smoothstep(.5,.92,d)*(.55+.45*d2);vec2 dm=p-m;k*=1.+.6*exp(-dot(dm,dm)*7.);' +
      'float vig=smoothstep(1.3,.15,length(p*vec2(.75,1.)));float a=clamp(k*amt*(.5+.5*vig),0.,1.);gl_FragColor=vec4(tint*a,a);}';
    function sh(type, src) { var o = gl.createShader(type); gl.shaderSource(o, src); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(o)); return o; }
    var pr;
    try { pr = gl.createProgram(); gl.attachShader(pr, sh(gl.VERTEX_SHADER, vs)); gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(pr); gl.useProgram(pr); }
    catch (e) { cv.remove(); return null; }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(pr, 'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    var U = function (n) { return gl.getUniformLocation(pr, n); };
    var scale = 0.38, mx = 0.3, my = 0.1, tx = 0.3, ty = 0.1, t0 = performance.now();
    function size() { cv.width = Math.max(2, innerWidth * scale | 0); cv.height = Math.max(2, innerHeight * scale | 0); gl.viewport(0, 0, cv.width, cv.height); gl.uniform2f(U('r'), cv.width, cv.height); }
    function tint() {
      var cs = getComputedStyle(D), c = (cs.getPropertyValue('--smoke') || '.7,.7,.7').split(',').map(parseFloat);
      gl.uniform3f(U('tint'), c[0], c[1], c[2]);
      gl.uniform1f(U('amt'), (parseFloat(cs.getPropertyValue('--smoke-a')) || 0.1) * 4.2);
    }
    function draw(now) {
      mx += (tx - mx) * 0.05; my += (ty - my) * 0.05;
      gl.uniform1f(U('t'), RM ? 14 : (now - t0) / 1000); gl.uniform2f(U('m'), mx, my);
      gl.uniform1f(U('s'), (window.scrollY || 0) / Math.max(1, D.scrollHeight - innerHeight));
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    size(); tint();
    addEventListener('resize', function () { size(); if (RM) draw(0); });
    addEventListener('pointermove', function (e) { var a = innerWidth / innerHeight; tx = (e.clientX / innerWidth - 0.5) * a; ty = 0.5 - e.clientY / innerHeight; }, { passive: true });
    var acc = 0;
    if (RM) draw(0); else gsap.ticker.add(function () { if (++acc % 2 === 0) draw(performance.now()); });
    return { tint: tint };
  })();

  /* ---------- the entrance ---------- */
  var intro = $('#intro'), vid = $('#chest'), film = $('#film');
  var introDone = false, engraved = false, introTimers = [];
  function setFilm() {
    vid.innerHTML = '';
    vid.poster = 'media/chest-' + version + '-poster.jpg';
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (s) {
      var el = document.createElement('source'); el.src = 'media/chest-' + version + '.' + s[0]; el.type = s[1]; vid.appendChild(el);
    });
    vid.load();
  }
  function engrave() {
    if (engraved) return; engraved = true;
    var rect = $('#engRect'), cutter = $('#cutter'), embers = $('#embers');
    var o = { w: 470 }, lastE = 0, glowHi = version === 'white' ? 0.55 : 0.95, glowLo = version === 'white' ? 0.18 : 0.35;
    var tl = gsap.timeline();
    tl.to(film, { scale: 1.1, duration: 3.2, ease: 'power2.inOut' }, 0)
      .set(cutter, { opacity: 1 }, 0.15)
      .to('.eng-glow', { opacity: glowHi, duration: 0.3 }, 0.15)
      .to(o, {
        w: 1440, duration: 1.7, ease: 'power1.inOut', onUpdate: function () {
          rect.setAttribute('width', o.w);
          cutter.style.left = (o.w / 1912 * 100) + '%';
          var now = performance.now();
          if (now - lastE > 45 && o.w > 560 && o.w < 1350) {
            lastE = now;
            var e = document.createElement('i'); e.className = 'ember';
            e.style.left = (o.w / 1912 * 100) + '%'; e.style.top = (76 + Math.random() * 5) + '%';
            embers.appendChild(e);
            gsap.to(e, { x: (Math.random() - 0.5) * 50, y: -40 - Math.random() * 70, opacity: 0, scale: 0.3, duration: 1.2 + Math.random(), ease: 'power1.out', onComplete: function () { e.remove(); } });
          }
        }
      }, 0.15)
      .to(cutter, { opacity: 0, duration: 0.25 }, 1.85)
      .to('.eng-glow', { opacity: glowLo, duration: 0.8 }, 1.9)
      .set('#engShine', { opacity: 1 }, 1.95)
      .fromTo('#g-shine', { attr: { x1: 300, x2: 460 } }, { attr: { x1: 1500, x2: 1660 }, duration: 1.1, ease: 'power2.inOut', immediateRender: false }, 1.95)
      .set('#engShine', { opacity: 0 }, 3.05)
      .add(function () { introTimers.push(setTimeout(liftIntro, 650)); }, 3.05);
  }
  function liftIntro() {
    if (introDone) return; introDone = true;
    introTimers.forEach(clearTimeout); introTimers = [];
    SS.set('pc-intro', '1');
    intro.classList.add('lift');
    setTimeout(function () {
      D.classList.remove('intro-on'); introLive = false;
      intro.classList.remove('lift'); vid.pause();
      startScroll(); ScrollTrigger.refresh(); dirty = true;
      var mn = $('#main'); if (mn && mn.focus) mn.focus({ preventScroll: true });
    }, 1050);
    loadAll();
  }
  function runIntro() {
    introDone = false; engraved = false; introLive = true;
    D.classList.add('intro-on'); intro.classList.remove('lift'); intro.style.cssText = '';
    gsap.set(film, { scale: 1 }); $('#engRect').setAttribute('width', 0); gsap.set('.eng-glow', { opacity: 0 }); gsap.set('#engShine', { opacity: 0 });
    stopScroll(); jump(0);
    setFilm();
    var started = false;
    vid.onplaying = function () { started = true; };
    vid.ontimeupdate = function () { if (vid.currentTime >= 8.35) engrave(); };
    vid.onended = function () { engrave(); };
    var p = vid.play(); if (p && p.catch) p.catch(function () { if (!started) introTimers.push(setTimeout(engrave, 600)); });
    introTimers.push(setTimeout(function () { if (!started) engrave(); }, 3500));   /* film never started: engrave over the poster */
    introTimers.push(setTimeout(liftIntro, 16000));                                 /* hard ceiling */
    setTimeout(loadAll, 2500);
  }
  $('#skipIntro').addEventListener('click', liftIntro);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && D.classList.contains('intro-on')) liftIntro(); });
  $('#replay').addEventListener('click', function () { runIntro(); });
  if (introLive) runIntro(); else { loadAll(); }

  /* ---------- forms (preview only: nothing is sent) ---------- */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function wire(form, opts) {
    var msg = $('.msg', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = form.email.value.trim(), c = form.consent;
      msg.classList.remove('err', 'ok');
      if (!EMAIL.test(email)) { msg.textContent = 'Please check your email address.'; msg.classList.add('err'); form.email.focus(); return; }
      if (opts.consent && !c.checked) { msg.textContent = 'Tick the box so we can email you.'; msg.classList.add('err'); c.focus(); return; }
      var payload = {
        hook: form.dataset.hook, page: 'home', email: email, product: form.product ? form.product.value : undefined,
        consent_email: { given: !!c.checked, text: $('.consent span', form).textContent, at: new Date().toISOString() },
        version: version, created_at: new Date().toISOString()
      };
      if (location.hash === '#debug') console.log('[preview payload]', payload);
      form.classList.add('done');
      msg.textContent = opts.ok(email, form) + ' Preview only: nothing was sent.'; msg.classList.add('ok');
      if (opts.after) opts.after(email);
    });
  }
  wire($('#joinForm'), { consent: true, ok: function () { return 'Welcome to the PEPTICITY Team. Your founding offer is on its way.'; } });
  wire($('#restockForm'), { consent: true, ok: function (e, f) { return 'Done. You will hear first when ' + f.product.value + ' is back.'; } });

  /* ---------- the member card + scanner ---------- */
  var cardBtn = $('#card'), cardName = $('#cardName'), cardTier = $('#cardTier'), statusEl = $('#scanStatus');
  var hint = $('#cardHint'), getCard = $('#getCard');
  var card = null;
  try { card = JSON.parse(LS.get('pc-card') || 'null'); } catch (e) { card = null; }
  function renderCard(anim) {
    cardBtn.classList.toggle('none', !card);
    cardBtn.classList.toggle('ready', !!card);
    if (card) {
      cardTier.textContent = card.tier; cardName.textContent = card.name;
      cardBtn.setAttribute('aria-label', 'Your PEPTICITY card, ' + card.tier + '. Tap to scan and open the doors.');
      hint.textContent = 'Your card is ready. Tap it to scan and open the doors.';
      if (anim) { cardBtn.classList.remove('issued'); void cardBtn.offsetWidth; cardBtn.classList.add('issued'); }
    } else {
      cardTier.textContent = 'YOUR CARD'; cardName.textContent = 'NOT ISSUED YET';
      cardBtn.setAttribute('aria-label', 'Your PEPTICITY card, not issued yet. Get your card to open the doors.');
    }
  }
  renderCard(false);
  wire($('#cardForm'), {
    consent: false,
    ok: function () { return 'Card issued. Tap it on the scanner.'; },
    after: function (email) {
      var nm = email.split('@')[0].replace(/[^a-z0-9]+/gi, ' ').trim().toUpperCase().slice(0, 22) || 'MEMBER';
      card = { tier: 'FOUNDING MEMBER', name: nm };
      LS.set('pc-card', JSON.stringify(card));
      renderCard(true); statusEl.textContent = 'CARD ISSUED';
      setTimeout(function () { getCard.open = false; cardBtn.focus({ preventScroll: true }); }, 1400);
    }
  });
  $('#guest').addEventListener('click', function () {
    if (busy) return;
    card = card || { tier: 'GUEST PASS', name: 'GUEST' };
    renderCard(true); setTimeout(scan, 450);
  });
  cardBtn.addEventListener('click', function () {
    if (busy) return;
    if (!card) {
      getCard.open = true; statusEl.textContent = 'NO CARD FOUND';
      hint.textContent = 'No card yet. Enter your email below and we will issue one on the spot.';
      setTimeout(function () { var i = $('#cardForm input[type=email]'); if (i) i.focus({ preventScroll: true }); }, 60);
      return;
    }
    scan();
  });
  cardBtn.addEventListener('pointermove', function (e) {
    var r = cardBtn.getBoundingClientRect(); cardBtn.style.setProperty('--hx', (100 - (e.clientX - r.left) / r.width * 100) + '%');
  });

  var cam = $('#cam'), flood = $('#flood'), leaves = $$('.leaf'), dials = $$('.dial'), seam = $('.seam'), spill = $('.spill');
  var doorway = $('.doorway'), locks = $$('.locks li');

  function absTop(el) { return el.getBoundingClientRect().top + (window.scrollY || 0); }
  function ungate() {
    if (!D.classList.contains('gated')) return;
    D.classList.remove('gated');
    ScrollTrigger.refresh(); dirty = true;
    pL.resize();
  }
  function openState() {
    opened = true;
    doorbox.classList.add('opened');
    gsap.set(leaves[0], { rotationY: -84, opacity: 1 }); gsap.set(leaves[1], { rotationY: 84, opacity: 1 }); gsap.set('.leaf .shade', { opacity: 0.6 });
    gsap.set(doorway, { opacity: 1 }); gsap.set(spill, { opacity: 0.7, scaleY: 1 });
    locks.forEach(function (l) { l.classList.add('off'); });
    scanner.dataset.state = 'granted'; statusEl.textContent = 'WELCOME IN';
    $('h2', scanner).textContent = 'THE DOORS ARE OPEN';
    hint.textContent = 'Scroll down to step inside.';
  }

  function scan() {
    if (busy || opened) return;
    busy = true; stopScroll();
    scanner.dataset.state = 'scanning'; statusEl.textContent = 'READING CARD';
    if (RM) {
      statusEl.textContent = 'ACCESS GRANTED';
      openState(); ungate(); busy = false; startScroll();
      jump(absTop($('#lab')));
      return;
    }
    var pad = $('#pad').getBoundingClientRect(), cr = cardBtn.getBoundingClientRect();
    var dx = pad.left + pad.width / 2 - (cr.left + cr.width / 2), dy = pad.top + pad.height / 2 - (cr.top + cr.height / 2);
    var sc = Math.min(1, pad.width * 0.95 / cr.width);
    var w = doorbox.offsetWidth, h = doorbox.offsetHeight;
    var ox = doorbox.offsetLeft + w * 0.5, oy = doorbox.offsetTop + h * 0.53;
    var tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    tl.to(cardBtn, { x: dx, y: dy, scale: sc, rotation: -6, duration: 0.75 }, 0)
      .fromTo('.c-scan', { opacity: 0.95, yPercent: -100 }, { yPercent: 620, duration: 0.7, repeat: 1, ease: 'none' }, 0.75)
      .call(function () { statusEl.textContent = 'VERIFYING MEMBER'; }, null, 1.25)
      .set('.c-scan', { opacity: 0 }, 2.15)
      .call(function () { scanner.dataset.state = 'granted'; statusEl.textContent = 'ACCESS GRANTED'; }, null, 2.2)
      .to(cardBtn, { x: 0, y: 0, scale: 1, rotation: 0, duration: 0.7 }, 2.3)
      .call(function () { locks[0].classList.add('off'); }, null, 2.5)
      .fromTo(dials[0], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: 180, duration: 1.3 }, 2.5)
      .call(function () { locks[1].classList.add('off'); }, null, 3.0)
      .fromTo(dials[1], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: -180, duration: 1.3 }, 3.0)
      .call(function () { locks[2].classList.add('off'); statusEl.textContent = 'LOCKS RELEASED'; }, null, 3.5)
      .to(seam, { opacity: 1, duration: 0.6, ease: 'power2.out' }, 3.5)
      .to(scanner, { opacity: 0, y: 30, duration: 0.6, ease: 'power2.in' }, 4.2)
      .set(leaves, { opacity: 1 }, 4.35).set(doorway, { opacity: 1 }, 4.35)
      .to(dials, { opacity: 0, duration: 0.4 }, 4.35)
      .to(leaves[0], { rotationY: -84, duration: 2.6, ease: 'power2.inOut' }, 4.4)
      .to(leaves[1], { rotationY: 84, duration: 2.6, ease: 'power2.inOut' }, 4.4)
      .to('.leaf .shade', { opacity: 0.6, duration: 2.6, ease: 'power2.inOut' }, 4.4)
      .to(seam, { opacity: 0, duration: 0.8 }, 4.8)
      .fromTo(spill, { opacity: 0, scaleY: 0.2 }, { opacity: 0.85, scaleY: 1, duration: 2, ease: 'power2.out' }, 4.6)
      .set(cam, { transformOrigin: ox + 'px ' + oy + 'px' }, 5.6)
      .to(cam, { scale: 2.9, duration: 2.2, ease: 'power2.in' }, 5.6)
      .to(flood, { opacity: 1, duration: 1.1, ease: 'power1.in' }, 6.7)
      .call(enterLab, null, 7.85);
  }
  function enterLab() {
    openState(); ungate();
    gsap.set(cam, { scale: 1 }); gsap.set(scanner, { y: 0 });
    jump(absTop($('#lab')));
    L.p = 0; dirty = true;
    busy = false; lastScan = -1;
    setTimeout(function () { ScrollTrigger.refresh(); startScroll(); gsap.to(flood, { opacity: 0, duration: 1.3, ease: 'power2.out' }); }, 60);
  }
  $('#toStore').addEventListener('click', function () {
    if (busy) return;
    if (!opened) openState();
    ungate();
    setTimeout(function () { jump(absTop($('#store')) - 40); }, 30);
  });
  if (RM) D.classList.remove('gated');

  /* ---------- guided store ---------- */
  var BOTTLES = [
    ['bpc-157', 'BPC-157', '10 MG'], ['tb-500', 'TB-500', '10 MG'], ['ghk-cu', 'GHK-CU', '50 MG'], ['nad', 'NAD+', '1000 MG'],
    ['glutathione', 'GLUTATHIONE', '1500 MG'], ['mots-c', 'MOTS-C', '10 MG'], ['epitalon', 'EPITALON', '10 MG'], ['klow-blend', 'KLOW BLEND', '80 MG']
  ];
  var shelf = $('#shelf'), sel = $('#rsProduct');
  BOTTLES.forEach(function (b, i) {
    var li = document.createElement('li');
    li.className = 'bottle glass chip';
    li.style.transitionDelay = (i % 4) * 90 + 'ms';
    li.innerHTML = '<span class="cut" aria-hidden="true"></span><span class="sw" aria-hidden="true"></span>' +
      '<div class="vial"><img src="media/bottles/' + b[0] + '.webp" alt="PEPTICITY ' + b[1] + ' ' + b[2] + ' bottle" loading="lazy" width="175" height="380"></div>' +
      '<h3 class="metal">' + b[1] + '</h3><p class="str">' + b[2] + '</p>' +
      '<button class="notify" type="button" data-p="' + b[1] + ' ' + b[2] + '">RESTOCK ALERT</button>';
    shelf.appendChild(li);
    var o = document.createElement('option'); o.textContent = b[1] + ' ' + b[2]; sel.appendChild(o);
  });
  shelf.addEventListener('click', function (e) {
    var b = e.target.closest('.notify'); if (!b) return;
    sel.value = b.dataset.p;
    var t = absTop($('#stop2')) - 80;
    if (lenis) lenis.scrollTo(t, { duration: 1.4 }); else window.scrollTo({ top: t, behavior: RM ? 'auto' : 'smooth' });
    setTimeout(function () { var i = $('#restockForm input[type=email]'); if (i) i.focus({ preventScroll: true }); }, RM ? 50 : 1300);
  });
  if ('IntersectionObserver' in window && !RM) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { rootMargin: '0px 0px -10% 0px' });
    $$('[data-reveal], .bottle').forEach(function (el) { io.observe(el); });
  } else $$('[data-reveal], .bottle').forEach(function (el) { el.classList.add('in'); });

  document.fonts && document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  window.__pc = {
    J: J, L: L, get lenis() { return lenis; }, setVersion: setVersion, scan: scan, liftIntro: liftIntro,
    loaded: function () { return { weave: seq('weave').loaded() + '/' + seq('weave').m.files, lab: seq('lab').loaded() + '/' + seq('lab').m.files, kind: kind }; }
  };
})();

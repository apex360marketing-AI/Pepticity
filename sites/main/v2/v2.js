/* PEPTICITY main site v2.
   Chest film + engraving -> HERO CARD -> SCR-17 word portal -> SCR-07 city weave (eased, cross-faded, glides to a stop)
   -> member card + doors (JOIN or GUEST) -> lab (5 stations that hold, hooks inside) -> promise (TXT-04)
   -> interests -> SCR-16 vial -> lot passport -> store (every listing, exact prices) + cart -> SCR-18/LAY-23 tiers
   -> sealed envelope (CRD-124) + sentence sign-up (FRM-104) -> catalogue finder (FRM-102) -> HOV-17 network -> refer -> letter + TXT-13.
   GSAP ScrollTrigger + Lenis on one ticker. Every form is preview only: nothing is sent. */
(function () {
  'use strict';
  var D = document.documentElement, CFG = window.PC_CONFIG || {};
  CFG.shipping = CFG.shipping || { flat: 15, freeOver: 200, placeholder: true };
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var RM = D.classList.contains('rm');
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var ss = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var LS = { get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }, del: function (k) { try { localStorage.removeItem(k); } catch (e) {} } };
  var SS = { get: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } }, set: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} } };
  var J_ = function (k, d) { try { return JSON.parse(LS.get(k)) || d; } catch (e) { return d; } };
  var money = function (n) { return '$' + n.toFixed(2); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var OFFER = !!(CFG.counselCleared && CFG.counselCleared.offer);
  var events = [];
  function track(name) { events.push(name); }   /* privacy-safe: event names only, never field values */

  /* every 3D-look heading gets its extrusion layer */
  $$('.x3d').forEach(function (el) { if (!el.dataset.text) el.dataset.text = el.textContent; });

  var toastT;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2200); }

  if (typeof gsap === 'undefined') { D.classList.remove('intro-on', 'gated'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ================= member state ================= */
  var member = J_('pc-member', null);   /* {email,name,joinedAt,notches} */
  function joined() { return !!(member && member.email); }
  function saveMember() { LS.set('pc-member', JSON.stringify(member)); renderMemberBits(); }
  function join(email, name) {
    member = member || {};
    member.email = email || member.email; if (name) member.name = name;
    member.joinedAt = member.joinedAt || new Date().toISOString();
    member.notches = Math.max(member.notches || 0, 2);   /* endowed progress: joining lights 2 of 10 */
    saveMember(); renderCart();
  }

  /* ================= frames (v1 atlases) ================= */
  var MAN = {
    'white-weave': { d: { n: 195, tw: 1024, th: 576, cols: 3, rows: 2, files: 33 }, m: { n: 195, tw: 432, th: 768, cols: 4, rows: 2, files: 25 } },
    'black-weave': { d: { n: 226, tw: 1024, th: 576, cols: 3, rows: 2, files: 38 }, m: { n: 226, tw: 432, th: 768, cols: 4, rows: 2, files: 29 } },
    'white-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } },
    'black-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } }
  };
  var CROP = { d: { x: 0, w: 1 }, m: { x: 652 / 1912, w: 608 / 1912 } };
  var version = D.getAttribute('data-version') === 'black' ? 'black' : 'white';
  var kind = innerWidth / innerHeight < 0.95 ? 'm' : 'd';
  var seqs = {}, dirty = true;
  function Seq(name, k) { this.name = name; this.k = k; this.m = MAN[name][k]; this.per = this.m.cols * this.m.rows; this.imgs = []; this.ok = new Uint8Array(this.m.files); this.req = new Uint8Array(this.m.files); }
  Seq.prototype.url = function (i) { return (CFG.frames && CFG.frames.dir || 'media/frames/') + this.name + '-' + this.k + '-' + ('00' + i).slice(-3) + '.webp'; };
  Seq.prototype.frame = function (f) { var a = Math.floor(f / this.per); if (!this.ok[a]) return null; var j = f % this.per, m = this.m; return { img: this.imgs[a], sx: (j % m.cols) * m.tw, sy: Math.floor(j / m.cols) * m.th }; };
  Seq.prototype.nearest = function (f) { for (var d = 0; d < this.m.n; d++) { var a = this.frame(Math.max(0, f - d)); if (a) return a; if (f + d < this.m.n) { a = this.frame(f + d); if (a) return a; } } return null; };
  Seq.prototype.loaded = function () { var c = 0; for (var i = 0; i < this.ok.length; i++) c += this.ok[i]; return c; };
  function seq(part) { var key = version + '-' + part + '-' + kind; if (!seqs[key]) seqs[key] = new Seq(version + '-' + part, kind); return seqs[key]; }
  var queue = [], active = 0;
  function want(s, list, front) { var jobs = []; list.forEach(function (i) { if (i >= 0 && i < s.m.files && !s.req[i]) { s.req[i] = 1; jobs.push([s, i]); } }); queue = front ? jobs.concat(queue) : queue.concat(jobs); pump(); }
  function pump() {
    while (active < 4 && queue.length) (function (job) {
      var s = job[0], i = job[1], img = new Image(); active++; img.decoding = 'async';
      var done = function () { active--; pump(); };
      img.onload = function () { var fin = function () { s.imgs[i] = img; s.ok[i] = 1; dirty = true; done(); }; if (img.decode) img.decode().then(fin, fin); else fin(); };
      img.onerror = function () { s.req[i] = 0; done(); };
      img.src = s.url(i);
    })(queue.shift());
  }
  function range(n) { var a = []; for (var i = 0; i < n; i++) a.push(i); return a; }
  function loadAll() { var w = seq('weave'), l = seq('lab'); want(w, range(w.m.files)); want(l, range(l.m.files)); }
  function Painter(canvas, part) { this.c = canvas; this.ctx = canvas.getContext('2d'); this.part = part; this.rect = { x: 0, y: 0, w: 0, h: 0 }; this.last = -1; this.resize(); }
  Painter.prototype.resize = function () {
    var r = Math.min(window.devicePixelRatio || 1, 1.5);
    this.W = this.c.clientWidth || innerWidth; this.H = this.c.clientHeight || innerHeight;
    this.c.width = Math.round(this.W * r); this.c.height = Math.round(this.H * r);
    this.ctx.setTransform(r, 0, 0, r, 0, 0); this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high'; this.last = -1;
  };
  Painter.prototype.draw = function (f) {
    var s = seq(this.part), m = s.m; f = clamp(f, 0, m.n - 1);
    if (!dirty && Math.abs(f - this.last) < 0.004) return;
    var i = Math.floor(f), fr = f - i, A = s.frame(i) || s.nearest(i); if (!A) return;
    var sc = Math.max(this.W / m.tw, this.H / m.th), dw = m.tw * sc, dh = m.th * sc, dx = (this.W - dw) / 2, dy = (this.H - dh) / 2, ctx = this.ctx;
    ctx.globalAlpha = 1; ctx.drawImage(A.img, A.sx, A.sy, m.tw, m.th, dx, dy, dw, dh);
    if (fr > 0.02 && i + 1 < m.n) { var B = s.frame(i + 1); if (B) { ctx.globalAlpha = fr; ctx.drawImage(B.img, B.sx, B.sy, m.tw, m.th, dx, dy, dw, dh); ctx.globalAlpha = 1; } }
    this.rect = { x: dx, y: dy, w: dw, h: dh }; this.last = f;
  };
  var pW = new Painter($('#cvWeave'), 'weave'), pL = new Painter($('#cvLab'), 'lab');
  var doorSign = $('#doorSign');
  /* [u = frame/(n-1), x, y, width] of the film's door sign, in full-frame fractions */
  var SIGN = {
    black: [[0.6, 0.49, 0.615, 0.12], [0.649, 0.494, 0.514, 0.137], [0.702, 0.496, 0.42, 0.16], [0.751, 0.498, 0.337, 0.19], [0.8, 0.5, 0.27, 0.21], [0.853, 0.502, 0.2, 0.238], [0.902, 0.502, 0.15, 0.27], [0.951, 0.5, 0.12, 0.283], [1, 0.502, 0.108, 0.29]],
    white: [[0.745, 0.504, 0.434, 0.105], [0.8, 0.5, 0.337, 0.19], [0.846, 0.502, 0.264, 0.215], [0.897, 0.502, 0.194, 0.254], [0.949, 0.5, 0.135, 0.281], [1, 0.502, 0.108, 0.293]]
  };
  want(seq('weave'), [0, 1], true);
  var doorbox = $('#doorbox');
  function layoutDoors() { var r = pW.rect, c = CROP[kind]; if (!r.w) return; var fw = r.w / c.w, fx = r.x - c.x * fw; doorbox.style.left = fx + 'px'; doorbox.style.top = r.y + 'px'; doorbox.style.width = fw + 'px'; doorbox.style.height = r.h + 'px'; }

  /* ================= smooth scroll ================= */
  var lenis = null;
  if (!RM && typeof Lenis !== 'undefined' && matchMedia('(pointer: fine)').matches) {
    lenis = new Lenis({ lerp: 0.075, smoothWheel: true, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(function (t) { lenis.raf(t * 1000); }); gsap.ticker.lagSmoothing(0);
  }
  function stopScroll() { if (lenis) lenis.stop(); D.classList.add('lock'); }
  function startScroll() { if (lenis) lenis.start(); D.classList.remove('lock'); }
  function jump(y) { if (lenis) lenis.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }
  function glide(y, dur) { if (lenis) lenis.scrollTo(y, { duration: dur || 1.6 }); else window.scrollTo({ top: y, behavior: RM ? 'auto' : 'smooth' }); }
  function absTop(el) { return el.getBoundingClientRect().top + (window.scrollY || 0); }

  var J = { p: 0 }, L = { p: 0 }, X = { p: 0 };
  gsap.to(J, { p: 1, ease: 'none', scrollTrigger: { trigger: '#journey', start: 'top top', end: 'bottom bottom', scrub: RM ? true : 1.4 } });
  gsap.to(L, { p: 1, ease: 'none', scrollTrigger: { trigger: '#lab', start: 'top top', end: 'bottom bottom', scrub: RM ? true : 1.2 } });
  gsap.to(X, { p: 1, ease: 'none', scrollTrigger: { trigger: '#explode', start: 'top top', end: 'bottom bottom', scrub: RM ? true : 1 } });

  /* portal 0 -> .075, weave .06 -> .86 (glides to a stop), gate from .88 */
  var P_END = 0.075, W_IN = 0.055, W_OUT = 0.86;
  function weaveFrame(p) {
    var n = seq('weave').m.n - 1; if (RM) return p < 0.5 ? 0 : n;
    var q = clamp((p - W_IN) / (W_OUT - W_IN), 0, 1);
    var e = 1 - Math.pow(1 - q, 1.6);            /* ease-out: the last stretch to the doors slows down and glides to a stop */
    return (0.55 * ss(0, 1, q) + 0.45 * e) * n;
  }
  /* lab: 5 stations, each = short move + long hold */
  var ST = [
    { f: 4, s: 1.55, x: 0.52, y: 0.16 },   /* the chain (glass-bead chain overhead) */
    { f: 40, s: 1.6, x: 0.14, y: 0.48 },   /* purification (glass columns, left) */
    { f: 78, s: 1.7, x: 0.42, y: 0.64 },   /* the dropper fills the vial */
    { f: 112, s: 1.55, x: 0.86, y: 0.46 }, /* freeze-drying (cabinets, right) */
    { f: 146, s: 1.75, x: 0.62, y: 0.8 }   /* sealing + crimping (vial rack) */
  ];
  function labState(p) {
    var n = ST.length, seg = clamp(p, 0, 0.9999) * n, i = Math.floor(seg), t = seg - i;
    var a = ST[Math.max(0, i - 1)], b = ST[i];
    var move = i === 0 ? 1 : ss(0, 0.28, t);            /* first 28% of a station moves, the rest holds */
    var hold = ss(0.28, 1, t);
    var f = a.f + (b.f - a.f) * move + hold * 3;          /* a near-still drift while holding */
    var lerp = function (k) { return a[k] + (b[k] - a[k]) * move; };
    return { i: i, t: t, f: f, s: lerp('s') + hold * 0.04, x: lerp('x'), y: lerp('y'), holding: t > 0.3 };
  }

  /* ================= per-frame UI ================= */
  var hooks = $$('.sr'), gate = $('#gate'), portal = $('#portal'), portalG = $('#portalG'), nav = $('#nav');
  var stations = $$('.st'), labCam = $('#labCam'), plaque = $('#labPlaque'), labFade = $('.lab-fade');
  var exLayers = { cap: $('.ex-cap'), neck: $('.ex-neck'), label: $('.ex-label'), body: $('.ex-body') }, exCalls = $$('.ex-calls li');
  var busy = false, opened = false, introLive = D.classList.contains('intro-on'), lastGate = -1, curSt = -1;
  var emb = $('#emblemFlat');

  function frameUI() {
    var p = J.p;
    pW.draw(weaveFrame(p));
    var gated = D.classList.contains('gated');
    var ls = labState(L.p);
    if (!gated) pL.draw(ls.f);
    if (dirty) layoutDoors();
    dirty = false;

    /* SCR-17 portal */
    if (!RM) {
      var pp = clamp(p / P_END, 0, 1), sc = 1 + Math.pow(pp, 2.4) * 46;
      portalG.setAttribute('transform', 'translate(800 400) scale(' + sc.toFixed(3) + ') translate(-800 -400)');
      portal.style.opacity = 1 - ss(0.82, 1, pp);
      portal.style.visibility = pp >= 1 ? 'hidden' : 'visible';
    }
    doorbox.style.visibility = (busy || opened || p >= W_OUT - 0.004 || (RM && p >= 0.5)) ? 'visible' : 'hidden';
    /* the door sign in the film is in an old serif: our illuminated plaque tracks it frame by frame (measured on both films) */
    var u = (busy || opened) ? 1 : weaveFrame(p) / (seq('weave').m.n - 1), T = SIGN[version], ds = doorSign;
    if (u >= T[0][0] && pW.rect.w) {
      var k = 1; while (k < T.length - 1 && T[k][0] < u) k++;
      var A = T[k - 1], B = T[k], t = clamp((u - A[0]) / (B[0] - A[0]), 0, 1), L2 = function (i) { return A[i] + (B[i] - A[i]) * t; };
      var c = CROP[kind], fw = pW.rect.w / c.w, fx = pW.rect.x - c.x * fw, w = L2(3) * fw * 1.08;
      ds.style.left = (fx + L2(1) * fw) + 'px'; ds.style.top = (pW.rect.y + L2(2) * pW.rect.h) + 'px';
      ds.style.width = w + 'px'; ds.style.height = (w * 0.27) + 'px'; ds.style.fontSize = (w * 0.068) + 'px'; ds.style.opacity = 1;
    } else ds.style.opacity = 0;

    hooks.forEach(function (h) {
      var a = +h.dataset.at, d = Math.abs(p - a), o = RM ? 0 : 1 - ss(0.035, 0.06, d);
      h.style.opacity = o; h.style.visibility = o < 0.02 ? 'hidden' : 'visible';
      h.style.transform = 'translate3d(0,' + ((a - p) * 700) + 'px,0)';
    });

    if (!busy) {
      var go = RM ? (p >= 0.5 ? 1 : 0) : ss(0.875, 0.93, p);
      if (Math.abs(go - lastGate) > 0.001) {
        gate.style.opacity = go; gate.style.visibility = go < 0.01 ? 'hidden' : 'visible';
        var mob = innerWidth <= 760 || innerWidth / innerHeight < 1;
        gate.style.transform = mob ? 'translate3d(-50%,' + ((1 - go) * 40) + 'px,0)' : 'translate3d(0,calc(-50% + ' + ((1 - go) * 40) + 'px),0)';
        lastGate = go;
      }
    }

    /* lab stations */
    if (!gated && !RM) {
      var cw = labCam.clientWidth, ch = labCam.clientHeight, m = (ls.s - 1) / (2 * ls.s);
      var tx = clamp(0.5 - ls.x, -m, m) * 100, ty = clamp(0.5 - ls.y, -m, m) * 100;
      labCam.style.transform = 'scale(' + ls.s.toFixed(4) + ') translate(' + tx.toFixed(3) + '%,' + ty.toFixed(3) + '%)';
      var r = pL.rect;
      if (r.w) {   /* the illuminated plaque covers the back-wall sign, in frame space inside the lab camera */
        var fw = r.w / CROP[kind].w, fx = r.x - CROP[kind].x * fw;
        plaque.style.left = (fx + fw * (0.494 + ls.f * 0.00012)) + 'px'; plaque.style.top = (r.y + r.h * 0.372) + 'px';
        plaque.style.fontSize = (fw * 0.0168) + 'px';
      }
      plaque.style.opacity = 1;
      stations.forEach(function (s, k) {
        var on = k === ls.i, o = on ? ss(0.12, 0.32, ls.t) * (k === ST.length - 1 ? 1 : 1 - ss(0.94, 1, ls.t)) : 0;
        s.style.opacity = o; s.style.visibility = o < 0.02 ? 'hidden' : 'visible'; s.classList.toggle('on', o > 0.5);
      });
      if (ls.i !== curSt) { curSt = ls.i; track('stop_view:lab-' + curSt); }
      labFade.style.opacity = 0;
    }

    /* SCR-16 exploded vial */
    if (!RM) {
      var e = ss(0.08, 0.7, X.p);
      exLayers.cap.style.transform = 'translate3d(0,' + (-e * 24) + '%,0) rotateY(' + (e * 18) + 'deg)';
      exLayers.neck.style.transform = 'translate3d(0,' + (-e * 18) + '%,0)';
      exLayers.label.style.transform = 'translate3d(' + (e * 46) + '%,' + (-e * 2) + '%,' + (e * 80) + 'px) rotateY(' + (-e * 28) + 'deg)';
      exLayers.body.style.transform = 'translate3d(0,' + (e * 12) + '%,0) rotateY(' + (-e * 8) + 'deg)';
      exCalls.forEach(function (c, k) { c.classList.toggle('on', X.p > 0.12 + k * 0.15); });
    }

    /* OBJ-08 flat fallback rotation (the 3D emblem in gl3d.js reads the same scroll) */
    if (!RM && emb) {
      var docH = Math.max(1, D.scrollHeight - innerHeight), s2 = (window.scrollY || 0) / docH;
      emb.style.transform = 'rotateY(' + (s2 * 540) + 'deg) rotateX(' + (10 + Math.sin(s2 * 6.28) * 6) + 'deg)';
    }
  }
  gsap.ticker.add(frameUI);

  function onResize() {
    var k = innerWidth / innerHeight < 0.95 ? 'm' : 'd';
    if (k !== kind) { kind = k; want(seq('weave'), [Math.floor(weaveFrame(J.p) / seq('weave').per)], true); if (!introLive) loadAll(); }
    pW.resize(); pL.resize(); dirty = true; lastGate = -1;
  }
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(onResize, 120); });

  /* ================= version toggle (BTN-P01 segmented) ================= */
  var smoke = window.PCSmoke ? PCSmoke($('#smoke'), { mode: version === 'black' ? 'black' : 'white', offset: 8 }) : null;
  var vSeg = $('#vSeg');
  function setVersion(v, quiet) {
    version = v === 'black' ? 'black' : 'white';
    D.setAttribute('data-version', version);
    if (!quiet) LS.set('pc-version', version);
    if (vSeg.pcSelect) { var idx = version === 'black' ? 1 : 0; $$('.pc-seg__opt', vSeg).forEach(function (o, k) { o.setAttribute('aria-checked', String(k === idx)); }); vSeg.style.setProperty('--i', idx); }
    $$('.leaf img').forEach(function (i) { i.src = 'media/' + version + '-doors.jpg'; });
    $('.doorway .peek').src = 'media/' + version + '-lab.jpg';
    var w = seq('weave'); want(w, [Math.floor(weaveFrame(J.p) / w.per), 0, w.m.files - 1], true);
    var l = seq('lab'); want(l, [Math.floor(labState(L.p).f / l.per)], true);
    if (!introLive) loadAll();
    if (smoke) smoke.setMode(version);
    dirty = true; pW.last = pL.last = -1;
    document.dispatchEvent(new CustomEvent('pc-version', { detail: version }));
  }
  if (window.PCButtons) PCButtons.init();
  vSeg.addEventListener('pc-change', function (e) { if (e.detail.value !== version) setVersion(e.detail.value); });
  setVersion(version, true);
  if (/[?&]sheen=([1-5])/.test(location.search)) D.setAttribute('data-sheen', RegExp.$1);

  /* ================= the entrance ================= */
  var intro = $('#intro'), vid = $('#chest'), film = $('#film');
  var introDone = false, engraved = false, introTimers = [];
  function setFilm() {
    var base = (CFG.chest && CFG.chest.base) || 'media/chest-';
    vid.innerHTML = ''; vid.poster = base + version + '-poster.jpg';
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (s) { var el = document.createElement('source'); el.src = base + version + '.' + s[0]; el.type = s[1]; vid.appendChild(el); });
    vid.load();
  }
  function engrave() {
    if (engraved) return; engraved = true;
    var rect = $('#engRect'), cutter = $('#cutter'), embers = $('#embers'), o = { w: 470 }, lastE = 0;
    var glowHi = version === 'white' ? 0.55 : 0.95, glowLo = version === 'white' ? 0.18 : 0.35;
    gsap.timeline()
      .to(film, { scale: 1.1, duration: 3.2, ease: 'power2.inOut' }, 0)
      .set(cutter, { opacity: 1 }, 0.15)
      .to('.eng-glow', { opacity: glowHi, duration: 0.3 }, 0.15)
      .to(o, { w: 1440, duration: 1.7, ease: 'power1.inOut', onUpdate: function () {
        rect.setAttribute('width', o.w); cutter.style.left = (o.w / 1912 * 100) + '%';
        var now = performance.now();
        if (now - lastE > 45 && o.w > 560 && o.w < 1350) {
          lastE = now; var e = document.createElement('i'); e.className = 'ember';
          e.style.left = (o.w / 1912 * 100) + '%'; e.style.top = (76 + Math.random() * 5) + '%'; embers.appendChild(e);
          gsap.to(e, { x: (Math.random() - 0.5) * 50, y: -40 - Math.random() * 70, opacity: 0, scale: 0.3, duration: 1.2 + Math.random(), ease: 'power1.out', onComplete: function () { e.remove(); } });
        } } }, 0.15)
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
    SS.set('pc-intro', '1'); intro.classList.add('lift');
    setTimeout(function () {
      D.classList.remove('intro-on'); introLive = false; intro.classList.remove('lift'); vid.pause();
      startScroll(); jump(0); ScrollTrigger.refresh(); dirty = true;
      heroIn();
    }, 1050);
    loadAll();
  }
  function runLoader() {
    introDone = false; introLive = true;
    intro.classList.add('mode-loader'); D.classList.add('intro-on'); intro.classList.remove('lift');
    stopScroll(); jump(0);
    var t0 = performance.now();
    (function wait() {   /* hold the words ~3.4 s once the 3D is up (or the flat fallback after 2.5 s) */
      var g = window.__gl, ready = g && (g.ok === false || (window.__type3d && window.__type3d.frames > 3));
      if (/[?&]holdintro/.test(location.search)) return;   /* review aid: keep the loader on screen */
      if (ready || performance.now() - t0 > 7000) introTimers.push(setTimeout(liftIntro, 3400));
      else introTimers.push(setTimeout(wait, 120));
    })();
    if (!/[?&]holdintro/.test(location.search)) introTimers.push(setTimeout(liftIntro, 14000));
    setTimeout(loadAll, 1500);
  }
  function runIntro() {
    if ((CFG.intro || 'loader') === 'loader') return runLoader();
    intro.classList.remove('mode-loader');
    introDone = false; engraved = false; introLive = true;
    D.classList.add('intro-on'); intro.classList.remove('lift');
    gsap.set(film, { scale: 1 }); $('#engRect').setAttribute('width', 0); gsap.set('.eng-glow', { opacity: 0 }); gsap.set('#engShine', { opacity: 0 });
    stopScroll(); jump(0); setFilm();
    var started = false, at = (CFG.chest && CFG.chest.engraveAt) || 8.35;
    vid.onplaying = function () { started = true; };
    vid.ontimeupdate = function () { if (vid.currentTime >= at) engrave(); };
    vid.onended = function () { engrave(); };
    var pr = vid.play(); if (pr && pr.catch) pr.catch(function () { if (!started) introTimers.push(setTimeout(engrave, 600)); });
    introTimers.push(setTimeout(function () { if (!started) engrave(); }, 3500));
    introTimers.push(setTimeout(liftIntro, 16000));
    setTimeout(loadAll, 2500);
  }
  $('#skipIntro').addEventListener('click', liftIntro);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && D.classList.contains('intro-on')) liftIntro(); });
  $('#replay').addEventListener('click', function () { closeMenu(); runIntro(); });
  function heroIn() { if (RM) return; gsap.fromTo('.hero-card', { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out' }); }
  if (introLive) runIntro(); else { loadAll(); heroIn(); }

  /* ================= forms (capture-forms; preview only) ================= */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var SUCCESS = {
    H01: function () { return 'Welcome to the PEPTICITY Team. ' + (OFFER ? 'Your 15% is saved to this device and applies in the cart.' : 'We\'ll email your welcome.') + ' Next: your card is waiting at the doors.'; },
    H44: function () { return 'You\'re in. 15% applies in your cart. Next: SEE EVERY PRODUCT below.'; },
    H45: function () { return 'Sealed. You\'re on the network. Next: the store is just above.'; },
    H48: function () { return 'Your gift is saved. 15% applies in your cart. Next: open the store.'; },
    'H48b': function () { return 'Your cart link is on its way.'; },
    H36: function (f) { return 'Thanks' + (f.name && f.name.value ? ', ' + f.name.value.trim() : '') + '. ' + (f.want ? 'You picked ' + f.want.value + '.' : ''); },
    H18: function () { return 'You\'re on Grace\'s list. The next letter comes to your inbox.'; },
    H47: function () { return '15% applied to this order.'; },
    H07: function () { return 'Saved. Your 15% is waiting in the cart.'; }
  };
  function validate(form) {
    var err = $('.err', form), em = form.email, c = form.consent_email;
    err.textContent = '';
    if (em) em.removeAttribute('aria-invalid');
    if (em && !EMAIL.test(em.value.trim())) { err.textContent = 'That email looks incomplete.'; em.setAttribute('aria-invalid', 'true'); em.focus(); return false; }
    if (c && !c.checked && !form.hasAttribute('data-transactional')) { err.textContent = 'Tick the box so we\'re allowed to email you.'; c.focus(); return false; }
    if (form.consent_sms && form.consent_sms.checked && form.phone && !form.phone.value.trim()) { err.textContent = 'Add your mobile number for text alerts, or untick that box.'; form.phone.focus(); return false; }
    return true;
  }
  function payload(form) {
    var g = function (n) { return form[n] && form[n].value ? form[n].value.trim() : ''; };
    var ce = form.consent_email, cs = form.consent_sms;
    return { hook: form.dataset.hook, page: 'home', name: g('name'), email: g('email'), phone: g('phone'), province: '', goal: '',
      consent_email: ce ? { given: ce.checked, text: ce.nextElementSibling.textContent, at: new Date().toISOString() } : { given: false },
      consent_sms: cs ? { given: cs.checked, text: cs.nextElementSibling.textContent, at: new Date().toISOString() } : { given: false },
      utm: {}, created_at: new Date().toISOString(), version: version };
  }
  function morph(btn, label, cb) {   /* FRM-103 submit morph: same size, progress, then the success state */
    if (!btn) { cb && cb(); return; }
    var lab = $('.pc-btn__label', btn), w = btn.offsetWidth;
    btn.style.width = w + 'px'; btn.classList.add('busy'); btn.disabled = true; lab.textContent = 'SENDING';
    setTimeout(function () { btn.classList.remove('busy'); btn.classList.add('done'); lab.textContent = label || 'DONE ✓'; cb && cb(); }, RM ? 10 : 650);
  }
  function wireForm(form, after) {
    form.addEventListener('focusin', function () { if (!form.__started) { form.__started = true; track('form_start'); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (form.classList.contains('sent-done')) return;
      if (!validate(form)) return;
      var data = payload(form);
      if (location.hash === '#debug') console.log('[preview payload]', data);
      track('form_submit');
      morph($('button[type=submit]', form), 'DONE ✓', function () {
        form.classList.add('sent-done');
        var ok = $('.ok', form), fn = SUCCESS[form.dataset.hook];
        if (ok) ok.textContent = (fn ? fn(form) + ' ' : '') + 'Preview only: nothing was sent.';
        if (form.hasAttribute('data-offer') || form.dataset.hook === 'H36' || form.dataset.hook === 'H18') join(data.email, data.name);
        after && after(data, form);
      });
    });
  }
  $$('.cap-form').forEach(function (f) {
    if (f.dataset.step || f.classList.contains('ref-form') || f.id === 'passport') return;
    wireForm(f, f.dataset.hook === 'H45' ? function () { f.classList.add('sealed'); } : f.dataset.hook === 'H48b' ? function () { setTimeout(closeExit, 2200); } : null);
  });

  /* ================= the member card + doors (FRM-02, H34) ================= */
  var mcard = $('#mcard'), mcName = $('#mcName'), mcTier = $('#mcTier'), gateStatus = $('#gateStatus');
  function setGate(s) { gate.dataset.state = s; }
  function renderMemberBits() {
    var n = joined() ? (member.notches || 2) : 0;
    $$('#mcNotch i').forEach(function (i, k) { i.classList.toggle('on', k < n); });
    if (joined()) { mcName.textContent = (member.name || 'FOUNDING MEMBER').toUpperCase(); mcTier.textContent = 'FOUNDING MEMBER · ' + n + ' OF 10'; }
    var prog = $('#cardProg'); if (prog) prog.textContent = joined() ? 'YOUR CARD: ' + n + ' OF 10 NOTCHES LIT' : '';
    var lb = $('#labBuyJoin'); if (lb) lb.hidden = joined();
  }
  $('#choJoin').addEventListener('click', function () {
    if (joined()) { setGate('tap'); gateStatus.textContent = 'CARD READY'; return; }
    setGate('email'); gateStatus.textContent = 'ISSUING YOUR CARD'; setTimeout(function () { $('[data-step=email] input[type=email]').focus({ preventScroll: true }); }, 60);
  });
  $('#choGuest').addEventListener('click', function () { guestEnter(); });
  var fEmail = $('[data-step=email]'), fName = $('[data-step=name]');
  fEmail.addEventListener('submit', function (e) {
    e.preventDefault(); if (!validate(fEmail)) return;
    var data = payload(fEmail); if (location.hash === '#debug') console.log('[preview payload]', data);
    morph($('button[type=submit]', fEmail), 'CARD ISSUED ✓', function () {
      join(data.email); setTimeout(function () { setGate('name'); gateStatus.textContent = 'NAME YOUR CARD'; $('input', fName).focus({ preventScroll: true }); }, 450);
    });
  });
  var nameIn = $('input', fName);
  nameIn.addEventListener('input', function () { mcName.classList.add('typing'); mcName.textContent = (nameIn.value || 'YOUR NAME HERE').toUpperCase(); });
  nameIn.addEventListener('blur', function () { mcName.classList.remove('typing'); });
  function toTap() {
    mcName.classList.remove('typing');
    if (nameIn.value.trim()) { member.name = nameIn.value.trim().slice(0, 22); member.notches = Math.max(member.notches || 2, 3); saveMember(); }
    renderMemberBits(); setGate('tap'); gateStatus.textContent = 'AWAITING CARD';
    gsap.fromTo(mcard, { rotationY: -25 }, { rotationY: 0, duration: 1, ease: 'expo.out' });
    mcard.focus({ preventScroll: true });
  }
  fName.addEventListener('submit', function (e) { e.preventDefault(); toTap(); });
  $('[data-skip]', fName).addEventListener('click', toTap);
  mcard.addEventListener('click', function () {
    if (busy || opened) return;
    if (gate.dataset.state === 'tap') return scan();
    if (gate.dataset.state === 'choose') $('#choJoin').click();
  });
  mcard.addEventListener('pointermove', function (e) {
    if (busy) return; var r = mcard.getBoundingClientRect();
    mcard.classList.add('tilt'); mcard.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 18 + 'deg'); mcard.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 14 + 'deg');
  });
  mcard.addEventListener('pointerleave', function () { mcard.classList.remove('tilt'); });

  var cam = $('#cam'), flood = $('#flood'), leaves = $$('.leaf'), dials = $$('.dial'), seam = $('.seam'), spill = $('.spill'), doorway = $('.doorway'), locks = $$('.locks li');
  function ungate() { if (!D.classList.contains('gated')) return; D.classList.remove('gated'); ScrollTrigger.refresh(); dirty = true; pL.resize(); revealSetup(); }
  function openState() {
    opened = true; doorbox.classList.add('opened');
    gsap.set(leaves[0], { rotationY: -84, opacity: 1 }); gsap.set(leaves[1], { rotationY: 84, opacity: 1 }); gsap.set('.leaf .shade', { opacity: 0.6 });
    gsap.set(doorway, { opacity: 1 }); gsap.set(spill, { opacity: 0.7, scaleY: 1 });
    locks.forEach(function (l) { l.classList.add('off'); });
    setGate('granted'); gateStatus.textContent = 'WELCOME IN'; $('#tapHint').textContent = 'The doors are open. Scroll down to step inside.';
  }
  function openDoors(tl, t0) {
    tl.call(function () { locks[0].classList.add('off'); }, null, t0)
      .fromTo(dials[0], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: 180, duration: 1.3 }, t0)
      .call(function () { locks[1].classList.add('off'); }, null, t0 + 0.5)
      .fromTo(dials[1], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: -180, duration: 1.3 }, t0 + 0.5)
      .call(function () { locks[2].classList.add('off'); gateStatus.textContent = 'LOCKS RELEASED'; }, null, t0 + 1)
      .to(seam, { opacity: 1, duration: 0.6, ease: 'power2.out' }, t0 + 1)
      .to(gate, { opacity: 0, duration: 0.6, ease: 'power2.in' }, t0 + 1.6)
      .set(leaves, { opacity: 1 }, t0 + 1.85).set(doorway, { opacity: 1 }, t0 + 1.85)
      .to(dials, { opacity: 0, duration: 0.4 }, t0 + 1.85)
      .to(leaves[0], { rotationY: -84, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to(leaves[1], { rotationY: 84, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to('.leaf .shade', { opacity: 0.6, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to(seam, { opacity: 0, duration: 0.8 }, t0 + 2.3)
      .fromTo(spill, { opacity: 0, scaleY: 0.2 }, { opacity: 0.85, scaleY: 1, duration: 2, ease: 'power2.out' }, t0 + 2.1)
      .add(function () { var w = doorbox.offsetWidth, h = doorbox.offsetHeight; gsap.set(cam, { transformOrigin: (doorbox.offsetLeft + w * 0.5) + 'px ' + (doorbox.offsetTop + h * 0.53) + 'px' }); }, t0 + 3.1)
      .to(cam, { scale: 2.9, duration: 2.2, ease: 'power2.in' }, t0 + 3.1)
      .to(flood, { opacity: 1, duration: 1.1, ease: 'power1.in' }, t0 + 4.2)
      .call(enterLab, null, t0 + 5.35);
  }
  function scan() {
    if (busy || opened) return;
    busy = true; stopScroll(); setGate('scanning'); gateStatus.textContent = 'READING CARD'; track('reveal_done:scanner');
    if (RM) { openState(); ungate(); busy = false; startScroll(); jump(absTop($('#lab'))); return; }
    var pad = $('#pad').getBoundingClientRect(), cr = mcard.getBoundingClientRect();
    var dx = pad.left + pad.width / 2 - (cr.left + cr.width / 2), dy = pad.top + pad.height / 2 - (cr.top + cr.height / 2);
    var sc = Math.min(1, pad.width * 1.05 / cr.width);
    var tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
    mcard.classList.remove('tilt');
    tl.to(mcard, { x: dx, y: dy, scale: sc, duration: 0.8 }, 0)
      .to('.mc-flip', { rotationY: 540, duration: 1.4, ease: 'power2.inOut' }, 0)      /* it spins onto the scanner */
      .fromTo('.mc-scan', { opacity: 0.95, top: '-22%' }, { top: '100%', duration: 0.6, repeat: 1, ease: 'none' }, 1.3)
      .call(function () { gateStatus.textContent = 'VERIFYING MEMBER'; }, null, 1.6)
      .set('.mc-scan', { opacity: 0 }, 2.5)
      .call(function () { setGate('granted'); gateStatus.textContent = 'ACCESS GRANTED'; }, null, 2.5)
      .to(mcard, { x: 0, y: 0, scale: 1, duration: 0.7 }, 2.6)
      .set('.mc-flip', { rotationY: 0 }, 3.3);
    openDoors(tl, 2.8);
  }
  function guestEnter() {
    if (busy || opened) return;
    busy = true; stopScroll(); SS.set('pc-guest', '1');
    mcTier.textContent = 'GUEST PASS'; mcName.textContent = 'GUEST';
    setGate('granted'); gateStatus.textContent = 'GUEST ENTRY';
    if (RM) { openState(); ungate(); busy = false; startScroll(); jump(absTop($('#lab'))); return; }
    openDoors(gsap.timeline({ defaults: { ease: 'power3.inOut' } }), 0.2);
  }
  function enterLab() {
    openState(); ungate(); gsap.set(cam, { scale: 1 }); gsap.set(gate, { opacity: 0 });
    jump(absTop($('#lab'))); L.p = 0; dirty = true; busy = false; lastGate = -1;
    setTimeout(function () { ScrollTrigger.refresh(); startScroll(); gsap.to(flood, { opacity: 0, duration: 1.3, ease: 'power2.out' }); }, 60);
  }
  $('#guestHero').addEventListener('click', function () { glide(absTop($('#journey')) + innerHeight * 0.8, 2.2); });

  /* ================= navigation helpers ================= */
  function goTo(id) {
    if (id === 'hero') return glide(0);
    if (id === 'city') return glide(absTop($('#journey')) + innerHeight * 0.6);
    if (D.classList.contains('gated')) { if (!opened) openState(); ungate(); }
    var el = document.getElementById(id) || $('[data-stop-id="' + id + '"]');
    setTimeout(function () { if (el) glide(absTop(el) - (id === 'lab' ? 0 : 60), 1.6); }, 40);
  }
  $('#toStore').addEventListener('click', function () { goTo('store'); });
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); closeMenu(); goTo(g.dataset.go); return; }
    var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openModal(o.dataset.open); }
  });

  /* ================= LAB station nav + settle-on-hold ================= */
  $('#stNext').addEventListener('click', function () {
    var ls = labState(L.p), lab = $('#lab'), span = lab.offsetHeight - innerHeight;
    var next = Math.min(ST.length - 1, ls.i + (ls.holding ? 1 : 0));
    if (ls.i === ST.length - 1 && ls.holding) return goTo('interests');
    glide(absTop(lab) + span * ((next + 0.55) / ST.length), 2.4);
  });
  var settleT;
  addEventListener('scroll', function () {
    clearTimeout(settleT);
    if (D.classList.contains('gated') || RM || busy) return;
    settleT = setTimeout(function () {
      var lab = $('#lab'), r = lab.getBoundingClientRect(); if (r.top > 0 || r.bottom < innerHeight) return;
      var ls = labState(L.p); if (ls.t > 0.05 && ls.t < 0.3) { var span = lab.offsetHeight - innerHeight; glide(absTop(lab) + span * ((ls.i + 0.42) / ST.length), 1.4); }
    }, 260);
  }, { passive: true });

  /* ================= store ================= */
  var PRODUCTS = [], BY = {};
  /* interest entry cards (interest-entry-hooks + docs/owner/SALES-PLAYBOOK.md section 3): the visitor's interest + a research area, never a result */
  var INTERESTS = [
    { k: 'gym', t: 'GYM AND PERFORMANCE', area: 'growth-hormone biology', keys: ['cjc_dac', 'cjc_nodac', 'ipamorelin', 'tesamorelin', 'igf1lr3', 'hgh'], icon: 'dumbbell' },
    { k: 'age', t: '55+ AND LONGEVITY', area: 'ageing biology', keys: ['epitalon', 'motsc', 'ss31', 'nad', 'glutathione', 'thymosina1'], icon: 'hourglass' },
    { k: 'energy', t: 'ENERGY', area: 'cellular energy (mitochondria)', keys: ['nad', 'motsc', 'ss31', '5amino1mq'], icon: 'bolt' },
    { k: 'weight', t: 'WEIGHT GOALS', area: 'metabolism', keys: ['tirzepatide', 'retatrutide', 'aod9604', '5amino1mq', 'klow'], icon: 'gauge', counsel: true },
    { k: 'recovery', t: 'RECOVERY', area: 'connective-tissue biology', keys: ['bpc157', 'tb500', 'wolverine', 'kpv', 'klow'], icon: 'ring' },
    { k: 'skin', t: 'SKIN AND HAIR', area: 'skin and hair biology', keys: ['ghkcu', 'glow', 'glutathione'], icon: 'drop' },
    { k: 'sleep', t: 'SLEEP', area: 'the body clock (circadian rhythm)', keys: ['epitalon'], icon: 'moon' }
  ];
  INTERESTS.forEach(function (i) { i.d = 'Compounds researched in the context of ' + i.area + '.'; i.shelf = i.t + ' SHELF'; });
  function inInterest(I, p) { return I.keys.indexOf(p.key) > -1 && (!I.counsel || OFFER); }
  var CLS = [
    { k: 'incretin', t: 'INCRETIN CLASS', d: 'GLP-1 / GIP family', keys: ['tirzepatide', 'retatrutide'] },
    { k: 'gh', t: 'GH-AXIS CLASS', d: 'GHRH analogues, secretagogues, HGH', keys: ['tesamorelin', 'cjc_dac', 'cjc_nodac', 'ipamorelin', 'hgh', 'igf1lr3', 'aod9604'] },
    { k: 'short', t: 'SHORT-CHAIN PEPTIDES', d: 'Two to fifteen amino acids', keys: ['bpc157', 'tb500', 'epitalon', 'semax', 'selank', 'oxytocin', 'thymosina1', 'glutathione'] },
    { k: 'melano', t: 'MELANOCORTIN AND COPPER', d: 'Alpha-MSH family, GHK-Cu', keys: ['ghkcu', 'pt141', 'melanotan2', 'kpv'] },
    { k: 'mito', t: 'MITOCHONDRIAL PEPTIDES', d: 'MOTS-c, SS-31', keys: ['motsc', 'ss31'] },
    { k: 'blend', t: 'BLENDS', d: 'Two or more in one vial', keys: ['klow', 'wolverine', 'glow'] },
    { k: 'nonpep', t: 'NON-PEPTIDES', d: 'NAD+, 5-Amino-1MQ', keys: ['nad', '5amino1mq'] }
  ];
  var filter = 'all';
  function bottle(p, cls) {
    return '<div class="vial ' + (cls || '') + '"><span class="pool" aria-hidden="true"></span><img src="' + CFG.bottle + '" alt="" width="175" height="380" loading="lazy">' +
      '<span class="vl" aria-hidden="true"><b>' + esc(p.name) + '</b><i>' + esc(p.strength) + '</i></span></div>';
  }
  function prodCard(p) {
    var more = p.more.map(function (m) { return '<div><h4>' + m[0] + '</h4><p>' + esc(m[1]) + '</p></div>'; }).join('');
    var act = p.inStock
      ? '<button class="pc-btn pc-btn--sm" type="button" data-add="' + p.id + '"><span class="pc-btn__face"><span class="pc-btn__label">ADD TO CART</span></span></button>'
      : '<span class="soldout">SOLD OUT</span><button class="pc-btn pc-btn--sm" type="button" data-rs="' + p.id + '"><span class="pc-btn__face"><span class="pc-btn__label">TELL ME WHEN IT\'S BACK</span></span></button>';
    var rs = '';
    return '<li class="prod glass" data-id="' + p.id + '">' + bottle(p) +
      '<div><h3 class="h3">' + esc(p.name) + '</h3><p class="strength">' + esc(p.strength) + (p.demoStock ? ' · SAMPLE STOCK STATE' : '') + '</p></div>' +
      '<p class="note">' + esc(p.note) + '</p>' +
      '<div class="acts"><p class="price">' + money(p.price) + ' <small style="font-size:10px;letter-spacing:.2em">CAD</small></p>' + act +
      '<button class="linkish" type="button" data-more aria-expanded="false">READ MORE</button></div>' +
      '<div class="more">' + more + '</div>' + rs + '</li>';
  }
  function renderStore() {
    var sh = $('#shelf'), anc = $('#shelfAnc');
    var vis = PRODUCTS.filter(function (p) { return !p.hidden; });
    sh.innerHTML = vis.filter(function (p) { return !p.ancillary; }).map(prodCard).join('');
    var a = vis.filter(function (p) { return p.ancillary; });
    anc.innerHTML = a.map(prodCard).join(''); $('#ancLane').hidden = !a.length;
    $('#storeCount').textContent = 'EVERY PRODUCT · ' + vis.length + ' LISTINGS';
    var fl = $('#filters');
    fl.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">ALL</button>' + INTERESTS.map(function (i) { return '<button class="chip" type="button" data-f="' + i.k + '" aria-pressed="false">' + i.t + '</button>'; }).join('');
    observeProds();
    fillMini();
  }
  function applyFilter(k) {
    filter = k;
    $$('#filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.f === k)); });
    var I = INTERESTS.find(function (i) { return i.k === k; });
    $$('#shelf .prod').forEach(function (li) {
      var p = BY[li.dataset.id], show = !I || inInterest(I, p);
      li.classList.toggle('hide', !show); if (show) li.classList.add('in');
    });
    $('#ancLane').style.display = I ? 'none' : '';
    ScrollTrigger.refresh();
  }
  $('#filters').addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (c) applyFilter(c.dataset.f); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (a) { addToCart(+a.dataset.add, a); return; }
    var m = e.target.closest('[data-more]'); if (m) { var li = m.closest('.prod'); var o = li.classList.toggle('open'); m.setAttribute('aria-expanded', String(o)); m.textContent = o ? 'SHOW LESS' : 'READ MORE'; return; }
    var r = e.target.closest('[data-rs]'); if (r) openModal('restock', BY[+r.dataset.rs]);
  });
  var pio = null;
  function observeProds() {
    if (!('IntersectionObserver' in window) || RM) { $$('.prod').forEach(function (el) { el.classList.add('in'); }); return; }
    pio = pio || new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); pio.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    $$('.prod:not(.in)').forEach(function (el, k) { el.style.transitionDelay = (k % 4) * 70 + 'ms'; pio.observe(el); });
  }
  function miniCard(p) {
    return '<div class="mini-prod">' + '<div class="mp-v"><img src="' + CFG.bottle + '" alt=""></div><div><b>' + esc(p.name) + ' · ' + esc(p.strength) + '</b><span>' + money(p.price) + ' CAD</span><em>' + esc(p.note) + '</em></div>' +
      '<button class="pc-btn pc-btn--sm" type="button" data-add="' + p.id + '"><span class="pc-btn__face"><span class="pc-btn__label">ADD</span></span></button></div>';
  }
  function byKey(k, strength) { return PRODUCTS.find(function (p) { return p.key === k && p.inStock && (!strength || p.strength === strength); }); }
  function fillMini() {
    $$('.sr[data-buy]').forEach(function (h) { var p = byKey(h.dataset.buy); if (p) $('.sr-prod', h).innerHTML = miniCard(p); });
    var lb = $('#labBuy'), p = byKey('bpc157');
    if (lb && p) lb.innerHTML = '<p class="mini-t" style="margin-bottom:8px">THE VIAL ON THIS BENCH</p>' + miniCard(p);
    var st5 = $('.st[data-st="4"] .cap-form'); if (st5 && joined()) st5.outerHTML = '<p class="mini-t">YOU\'RE ON THE TEAM · 15% APPLIES IN YOUR CART</p>';
  }

  /* ================= cart (offer-to-checkout) ================= */
  var cart = J_('pc-cart', []);   /* [{id,q}] */
  function saveCart() { LS.set('pc-cart', JSON.stringify(cart)); renderCart(); }
  function addToCart(id, btn) {
    var l = cart.find(function (x) { return x.id === id; }); if (l) l.q++; else cart.push({ id: id, q: 1 });
    saveCart(); track('cta_click:add');
    if (btn) { var lab = $('.pc-btn__label', btn), t = lab.textContent; btn.style.width = btn.offsetWidth + 'px'; lab.textContent = 'ADDED ✓'; btn.classList.add('done'); setTimeout(function () { lab.textContent = t; btn.classList.remove('done'); btn.style.width = ''; }, 1500); }
    var p = BY[id]; toast((p ? p.name + ' ' + p.strength : 'ITEM') + ' ADDED');
  }
  function totals() {
    var sub = 0, items = 0;
    cart.forEach(function (l) { var p = BY[l.id]; if (p) { sub += p.price * l.q; items += l.q; } });
    var disc = joined() && OFFER ? Math.round(sub * (CFG.foundingRate || 0.15) * 100) / 100 : 0;
    var after = sub - disc, sh = CFG.shipping, ship = !items ? 0 : (after >= sh.freeOver ? 0 : sh.flat);
    return { sub: sub, disc: disc, ship: ship, total: after + ship, items: items, toFree: Math.max(0, sh.freeOver - after), after: after };
  }
  function renderCart() {
    if (!PRODUCTS.length) return;
    cart = cart.filter(function (l) { return BY[l.id]; });
    var T = totals(), lines = $('#lines');
    $('#cartN').textContent = T.items;
    lines.innerHTML = cart.map(function (l) {
      var p = BY[l.id];
      return '<li class="line"><img src="' + CFG.bottle + '" alt=""><div><b>' + esc(p.name) + '</b><small>' + esc(p.strength) + ' · ' + money(p.price) + '</small>' +
        '<div class="qty"><button type="button" data-q="-1" data-id="' + p.id + '" aria-label="One fewer">−</button><span>' + l.q + '</span><button type="button" data-q="1" data-id="' + p.id + '" aria-label="One more">+</button></div></div>' +
        '<div class="lp">' + money(p.price * l.q) + '<button class="rm" type="button" data-rm="' + p.id + '">Remove</button></div></li>';
    }).join('');
    $('#cartEmpty').hidden = !!cart.length;
    var sh = CFG.shipping, ph = sh.placeholder ? ' <small>[PLACEHOLDER RATE]</small>' : '';
    $('#totals').innerHTML = !cart.length ? '' :
      '<div class="almost" data-hook="H55"><span>' + (T.toFree > 0 ? money(T.toFree) + ' TO FREE SHIPPING' : 'FREE SHIPPING UNLOCKED') + (sh.placeholder ? ' [PLACEHOLDER THRESHOLD]' : '') + '</span><i><b style="width:' + Math.min(100, T.after / sh.freeOver * 100) + '%"></b></i></div>' +
      '<div class="tr"><span>Subtotal</span><span>' + money(T.sub) + '</span></div>' +
      (T.disc ? '<div class="tr code"><span>PEPTICITY TEAM · 15% OFF FIRST ORDER</span><span>−' + money(T.disc) + '</span></div>' : '') +
      '<div class="tr" data-hook="H54"><span>Shipping' + ph + '</span><span>' + (T.ship ? money(T.ship) : 'FREE') + '</span></div>' +
      '<div class="tr total"><span>TOTAL</span><span>' + money(T.total) + ' CAD</span></div>' +
      '<div class="tr"><span>Taxes calculated at checkout. No other fees.</span><span></span></div>';
    $('#cartJoin').hidden = joined() || !OFFER || !cart.length;
    $('#checkout').disabled = !cart.length;
  }
  $('#lines').addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), r = e.target.closest('[data-rm]');
    if (q) { var l = cart.find(function (x) { return x.id === +q.dataset.id; }); if (l) { l.q += +q.dataset.q; if (l.q < 1) cart.splice(cart.indexOf(l), 1); } saveCart(); }
    if (r) { cart = cart.filter(function (x) { return x.id !== +r.dataset.rm; }); saveCart(); }
  });
  var lastFocus = null;
  function trap(el, e) {
    if (e.key !== 'Tab') return; var f = $$('a,button:not([disabled]),input,select,[tabindex="0"]', el).filter(function (x) { return x.offsetParent !== null; }); if (!f.length) return;
    if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); } else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
  }
  function openCart() { lastFocus = document.activeElement; renderCart(); $('#scrimx').hidden = false; $('#cart').hidden = false; stopScroll(); setTimeout(function () { $('#cart .x').focus(); }, 30); track('cart_open'); }
  function closeCart() { $('#cart').hidden = true; $('#scrimx').hidden = true; startScroll(); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  $('#cartBtn').addEventListener('click', openCart);
  $('#cart').addEventListener('click', function (e) { if (e.target.closest('[data-close]')) closeCart(); });
  $('#cart').addEventListener('keydown', function (e) { trap($('#cart'), e); });
  $('#scrimx').addEventListener('click', closeCart);
  wireForm($('#cartJoin'), function () { renderCart(); });
  $('#checkout').addEventListener('click', function () { closeCart(); openModal('checkout'); });

  /* ================= modal ================= */
  function capForm(hook, btn, consentWhat, extra) {
    return '<form class="cap-form" data-hook="' + hook + '" data-offer novalidate>' + (extra || '') +
      '<div class="row"><label class="field"><span class="lbl">EMAIL</span><input type="email" name="email" autocomplete="email" inputmode="email" required></label>' +
      '<button class="pc-btn morph" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">' + btn + '</span></span></button></div>' +
      '<label class="consent"><input type="checkbox" name="consent_email"><span>Yes, PEPTICITY may email me ' + consentWhat + ' and occasional news. I can unsubscribe any time.</span></label>' +
      '<p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p></form>';
  }
  function openModal(kind, arg) {
    var b = $('#modalBody'), html = '';
    if (kind === 'join') html = '<p class="eyebrow"><span>GRAND OPENING</span></p><h2 class="h2s x3d" id="modalT">JOIN THE PEPTICITY TEAM</h2><p>15% off your first order, Grace\'s monthly letter and first word on restocks.</p>' + capForm('H01b', 'CLAIM MY 15% OFF', 'the founding offer, the monthly letter, restock alerts');
    if (kind === 'letter') html = '<p class="eyebrow"><span>GRACE\'S LETTER</span></p><h2 class="h2s x3d" id="modalT">ONE LETTER A MONTH</h2><p>What\'s new, what\'s back, and a note from Grace.</p>' + capForm('H18', 'GET THE LETTER', 'Grace\'s monthly letter');
    if (kind === 'quiz') { closeModal(); return goTo('quiz'); }
    if (kind === 'interest') {
      var I = arg, list = PRODUCTS.filter(function (p) { return !p.hidden && !p.ancillary && inInterest(I, p); });
      html = '<p class="eyebrow"><span>' + I.shelf + '</span></p><h2 class="h2s x3d" id="modalT">' + I.t + '</h2>' +
        '<p>' + esc(I.d) + ' Name, size and price only. No product here is presented as treating, preventing or improving anything.</p>' +
        (list.length ? '<ul class="int-list">' + list.map(function (p) { return '<li><b>' + esc(p.name) + ' ' + esc(p.strength) + '</b><span>' + money(p.price) + '</span></li>'; }).join('') + '</ul>' : '<p class="mini-t">THIS SHELF OPENS SOON</p>') +
        (list.length < 2 ? '<p class="fine">More compounds for this area are coming. We\'ll tell you first.</p>' : '') +
        '<p class="mini-t">SEND ME THE ' + esc(I.t) + ' SHELF · PLUS 15% OFF</p>' + capForm('H42', 'SEND ME THE SHELF', 'the ' + I.t.toLowerCase() + ' shelf, the founding offer') +
        (list.length ? '<button class="pc-btn pc-btn--sm" type="button" data-go="store"><span class="pc-btn__face"><span class="pc-btn__label">OPEN THE SHELF IN THE STORE</span></span></button>' : '');
    }
    if (kind === 'restock') {
      var P = arg;
      html = '<p class="eyebrow"><span>SOLD OUT · RESTOCK QUEUE</span></p><h2 class="h2s x3d" id="modalT">' + esc(P.name + ' ' + P.strength) + '</h2><p>Join the queue and we\'ll email you the moment the next lot lands, before the shelf goes public.</p>' +
        capForm('H50', 'JOIN THE QUEUE', 'when ' + P.name + ' ' + P.strength + ' is back');
    }
    if (kind === 'checkout') {
      var T = totals();
      html = '<p class="eyebrow"><span>CHECKOUT · GUEST</span></p><h2 class="h2s x3d" id="modalT">NO ACCOUNT NEEDED</h2>' +
        '<div class="sum"><div class="tr" style="display:flex;justify-content:space-between"><span>' + T.items + ' items</span><span>' + money(T.sub) + '</span></div>' +
        (T.disc ? '<div style="display:flex;justify-content:space-between"><span>PEPTICITY TEAM · 15%</span><span>−' + money(T.disc) + '</span></div>' : '') +
        '<div style="display:flex;justify-content:space-between"><span>Shipping' + (CFG.shipping.placeholder ? ' [placeholder]' : '') + '</span><span>' + (T.ship ? money(T.ship) : 'FREE') + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-family:var(--display)"><span>TOTAL</span><span>' + money(T.total) + ' CAD</span></div></div>' +
        '<p>[Age and province check, payment and the real store backend connect here.]</p>' +
        '<button class="pc-btn pc-btn--block" type="button" id="placeOrder"><span class="pc-btn__face"><span class="pc-btn__label">PLACE ORDER (PREVIEW)</span></span></button>';
    }
    if (kind === 'thanks') {
      html = '<p class="eyebrow"><span>THANK YOU</span></p><h2 class="h2s x3d" id="modalT">ORDER RECEIVED</h2><p>Preview only: no order was placed.</p>' +
        '<form class="cap-form" data-hook="H53" id="acctForm" novalidate><p class="mini-t">SAVE YOUR DETAILS FOR NEXT TIME</p><label class="field"><span class="lbl">CHOOSE A PASSWORD</span><input type="password" name="pw" autocomplete="new-password" minlength="8"></label>' +
        '<label class="field"><span class="lbl">MOBILE FOR SHIPPING UPDATES (OPTIONAL)</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel"></label>' +
        '<label class="consent"><input type="checkbox" name="consent_sms"><span>Also text me about new lots. Message and data rates may apply. Reply STOP to stop.</span></label>' +
        '<p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p><button class="pc-btn" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">SAVE MY DETAILS</span></span></button></form>';
    }
    if (!html) return;
    lastFocus = document.activeElement;
    b.innerHTML = html; $$('.x3d', b).forEach(function (el) { el.dataset.text = el.textContent; });
    $$('.cap-form', b).forEach(function (f) { if (f.id === 'acctForm') return;
      wireForm(f, f.dataset.hook === 'H50' ? function () { var ok = $('.ok', f); ok.textContent = 'You\'re in the queue: #[REAL POSITION] in line for the next lot. ' + ok.textContent; } : null); });
    var po = $('#placeOrder', b); if (po) po.addEventListener('click', function () { cart = []; saveCart(); openModal('thanks'); });
    var af = $('#acctForm', b); if (af) af.addEventListener('submit', function (e) { e.preventDefault(); $('.ok', af).textContent = 'Saved. Preview only: nothing was sent.'; });
    $('#modal').hidden = false; stopScroll(); track('form_view');
    setTimeout(function () { var i = $('input', b) || $('.x', $('#modal')); i.focus({ preventScroll: true }); }, 40);
  }
  function closeModal() { $('#modal').hidden = true; startScroll(); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  $('#modal').addEventListener('click', function (e) { if (e.target.closest('[data-close]') || e.target === $('#modal') || e.target.closest('[data-go]')) closeModal(); });
  $('#modal').addEventListener('keydown', function (e) { trap($('.modal'), e); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) closeModal(); else if (!$('#cart').hidden) closeCart(); else if (!menu.hidden) closeMenu(); else if (!exitEl.hidden) closeExit();
  });

  /* ================= menu ================= */
  var menu = $('#menu');
  function openMenu() { lastFocus = document.activeElement; menu.hidden = false; requestAnimationFrame(function () { menu.classList.add('open'); }); $('#menuBtn').setAttribute('aria-expanded', 'true'); stopScroll(); $('.x', menu).focus(); }
  function closeMenu() { if (menu.hidden) return; menu.classList.remove('open'); menu.hidden = true; $('#menuBtn').setAttribute('aria-expanded', 'false'); startScroll(); }
  $('#menuBtn').addEventListener('click', openMenu);
  menu.addEventListener('click', function (e) { if (e.target.closest('[data-close]')) { closeMenu(); if (lastFocus) lastFocus.focus(); } });
  menu.addEventListener('keydown', function (e) { trap(menu, e); });
  $$('.menu-list a').forEach(function (a, k) { a.style.transitionDelay = k * 60 + 'ms'; });

  /* ================= interests (cards + 3D icon slots) ================= */
  function renderInterests() {
    $('#intGrid').innerHTML = INTERESTS.map(function (i) {
      return '<li><button class="int-card glass" type="button" data-int="' + i.k + '">' +
        '<span class="int-ico" data-slot3d="icon-' + i.icon + '" aria-hidden="true"><span class="fb">' + '◆' + '</span></span>' +
        '<span><span class="h3 x3d" data-text="' + i.t + '">' + i.t + '</span><p>' + i.d + '</p><span class="go">OPEN THE SHELF · SEND ME THE SHELF + 15%</span></span></button></li>';
    }).join('');
    document.dispatchEvent(new Event('pc-slots'));
  }
  renderInterests();
  $('#intGrid').addEventListener('click', function (e) {
    var c = e.target.closest('[data-int]'); if (!c) return;
    var I = INTERESTS.find(function (i) { return i.k === c.dataset.int; });
    $$('.int-card').forEach(function (x) { x.classList.toggle('on', x === c); });
    applyFilter(I.k); track('cta_click:interest'); openModal('interest', I);
  });

  /* ================= TXT-04 scroll highlight + the little bottom progress ================= */
  var HL = $$('[data-hl]');
  HL.forEach(function (p) { p.innerHTML = p.textContent.trim().split(/\s+/).map(function (w) { return '<span class="w">' + esc(w) + '</span>'; }).join(' '); });
  var hlProg = $('#hlProg'), hlBar = $('b', hlProg);
  function hlUpdate() {
    var best = null;
    HL.forEach(function (p) {
      var r = p.getBoundingClientRect(), ws = $$('.w', p);
      if (r.bottom < 0 || r.top > innerHeight) { if (r.top > innerHeight) ws.forEach(function (w) { w.classList.remove('lit'); }); else ws.forEach(function (w) { w.classList.add('lit'); }); return; }
      var t = RM ? 1 : clamp((innerHeight * 0.82 - r.top) / (r.height + innerHeight * 0.38), 0, 1), n = Math.round(t * ws.length);
      ws.forEach(function (w, k) { w.classList.toggle('lit', k < n); });
      if (p.id === 'promiseP' || !best) best = t;
    });
    if (best !== null && best > 0 && best < 1) { hlProg.classList.add('show'); hlBar.style.width = (best * 100) + '%'; } else hlProg.classList.remove('show');
  }
  gsap.ticker.add(hlUpdate);

  /* ================= reveals: tiers (SCR-18/LAY-23), footer (TXT-13) ================= */
  var rio = null;
  function revealSetup() {
    if (!('IntersectionObserver' in window)) { $$('.tier,.foot-mark').forEach(function (t) { t.classList.add('in'); }); return; }
    rio = rio || new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); rio.unobserve(en.target); } }); }, { threshold: 0.35 });
    $$('.tier:not(.in),.foot-mark:not(.in)').forEach(function (t) { rio.observe(t); });
  }
  revealSetup();
  /* SCR-18: earlier cards recede as the next one stacks on top */
  gsap.ticker.add(function () {
    if (D.classList.contains('gated') || RM) return;
    var ts = $$('.tier');
    ts.forEach(function (t, k) {
      var nx = ts[k + 1]; if (!nx) { t.style.transform = ''; return; }
      var r = nx.getBoundingClientRect(), top = parseFloat(getComputedStyle(nx).top) || 110;
      var c = clamp(1 - (r.top - top) / (innerHeight * 0.6), 0, 1);
      t.style.transform = 'scale(' + (1 - c * 0.05) + ')'; t.style.filter = 'brightness(' + (1 - c * 0.12) + ')';
    });
  });
  var tierT = $('.tier[style*="--i:1"] .tier-t'); if (tierT) { var cp = document.createElement('p'); cp.className = 'card-progress'; cp.id = 'cardProg'; cp.dataset.hook = 'H51'; tierT.insertBefore(cp, tierT.querySelector('ul')); }

  /* ================= SEALED ENVELOPE (CRD-124 fog wipe; gamified-reveal-hooks) ================= */
  (function () {
    var cv = $('#fog'), gift = $('#gift'), form = $('.gift-form'), done = false;
    if (!cv) return;
    var ctx = cv.getContext('2d'), W = 0, H = 0, drawing = false, lastCheck = 0;
    function paint() {
      var r = cv.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2); W = r.width; H = r.height;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var dark = version === 'black';
      var g = ctx.createLinearGradient(0, 0, W, H);
      g.addColorStop(0, dark ? '#2a2c31' : '#e8eaee'); g.addColorStop(0.5, dark ? '#16171a' : '#f7f8fa'); g.addColorStop(1, dark ? '#2a2c31' : '#dfe2e6');
      ctx.globalCompositeOperation = 'source-over'; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (var i = 0; i < 1400; i++) { ctx.fillStyle = 'rgba(' + (dark ? '255,255,255,' : '0,0,0,') + (Math.random() * 0.05) + ')'; ctx.fillRect(Math.random() * W, Math.random() * H, 2, 2); }
      ctx.strokeStyle = dark ? 'rgba(255,255,255,.25)' : 'rgba(42,45,49,.25)'; ctx.lineWidth = 1;   /* envelope flap */
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(W / 2, H * 0.55); ctx.lineTo(W, 0); ctx.stroke();
      var cx = W / 2, cy = H * 0.55, rad = 34, sg = ctx.createRadialGradient(cx - 10, cy - 10, 4, cx, cy, rad);   /* the chrome seal */
      sg.addColorStop(0, '#ffffff'); sg.addColorStop(0.5, '#b9bec5'); sg.addColorStop(1, '#4a4f57');
      ctx.fillStyle = sg; ctx.beginPath();
      for (var k = 0; k < 24; k++) { var a = k / 24 * Math.PI * 2, rr = k % 2 ? rad : rad * 0.86; ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); }
      ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#2a2d31'; ctx.font = '400 20px "PEPTICITY BLACK"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('P', cx, cy + 1);
      ctx.fillStyle = dark ? 'rgba(255,255,255,.7)' : 'rgba(17,18,20,.6)'; ctx.font = '400 10px "PEPTICITY BLACK"'; ctx.fillText('DRAG ACROSS THE SEAL', cx, H - 22);
    }
    function reveal() {
      if (done) return; done = true; cv.classList.add('gone'); form.hidden = false; track('hook_reveal');
      if (member && member.notches < 4) { member.notches++; saveMember(); }
      setTimeout(function () { var i = $('input[type=email]', form); if (i && !RM) i.focus({ preventScroll: true }); }, 420);
    }
    function wipe(e) {
      if (!drawing || done) return; var r = cv.getBoundingClientRect();
      ctx.globalCompositeOperation = 'destination-out'; ctx.beginPath(); ctx.arc(e.clientX - r.left, e.clientY - r.top, e.pointerType === 'touch' ? 36 : 28, 0, Math.PI * 2); ctx.fill();
      var now = performance.now(); if (now - lastCheck > 120) { lastCheck = now; check(); }
    }
    function check() {
      var d = ctx.getImageData(0, 0, cv.width, cv.height).data, clear = 0, tot = 0;
      for (var i = 3; i < d.length; i += 16) { tot++; if (d[i] === 0) clear++; }
      if (clear / tot > 0.35) reveal();
    }
    cv.addEventListener('pointerdown', function (e) { drawing = true; cv.setPointerCapture(e.pointerId); track('hook_interact'); wipe(e); });
    cv.addEventListener('pointermove', wipe);
    cv.addEventListener('pointerup', function () { drawing = false; });
    $('#fogKey').addEventListener('click', reveal);
    var fio = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { paint(); fio.disconnect(); } }); fio.observe(cv);
    document.addEventListener('pc-version', function () { if (!done) paint(); });
    if (RM) { $('#fogKey').textContent = 'SHOW MY GIFT'; }
  })();

  /* ================= CATALOGUE FINDER (FRM-102 stepper; product-finder-quiz) ================= */
  var Q = { step: 0, cls: null, size: null, band: null };
  try { var qs = JSON.parse(LS.get('pc-finder') || 'null'); if (qs) { Q.cls = qs.cls; Q.size = qs.size; Q.band = qs.band; } } catch (e) {}
  function inCls() { var c = CLS.find(function (x) { return x.k === Q.cls; }); return PRODUCTS.filter(function (p) { return !p.hidden && !p.ancillary && c && c.keys.indexOf(p.key) > -1; }); }
  function mg(p) { return parseFloat(p.strength) || 0; }
  function bands(list) { var ps = list.map(function (p) { return p.price; }).sort(function (a, b) { return a - b; }); var lo = ps[0], hi = ps[ps.length - 1], m = Math.round((lo + hi) / 2); return lo === hi ? [{ k: 'all', t: money(lo), a: lo, b: hi }] : [{ k: 'lo', t: money(lo) + ' – ' + money(m), a: lo, b: m }, { k: 'hi', t: money(m) + ' – ' + money(hi), a: m, b: hi }, { k: 'all', t: 'ANY PRICE', a: lo, b: hi }]; }
  function renderFinder() {
    var box = $('#qsteps'), html = '', n = Q.step;
    $('#qbar').style.width = (25 + n * 25) + '%'; $('#qStepNo').textContent = 'STEP ' + (n + 1) + ' OF 4';
    if (n === 0) html = '<div class="qstep"><h3 class="h3">WHAT ARE YOU BROWSING?</h3><div class="qopts">' + CLS.map(function (c) { return '<button class="qopt" type="button" data-cls="' + c.k + '" aria-pressed="' + (Q.cls === c.k) + '">' + c.t + '<small>' + c.d + '</small></button>'; }).join('') + '</div></div>';
    if (n === 1) html = '<div class="qstep"><h3 class="h3">WHICH SIZE SUITS YOU?</h3><div class="qopts">' + [['small', 'SMALLER VIALS', 'Up to 10 mg'], ['large', 'LARGER VIALS', 'Over 10 mg'], ['any', 'ANY SIZE', 'Show them all']].map(function (s) { return '<button class="qopt" type="button" data-size="' + s[0] + '" aria-pressed="' + (Q.size === s[0]) + '">' + s[1] + '<small>' + s[2] + '</small></button>'; }).join('') + '</div></div>';
    if (n === 2) html = '<div class="qstep"><h3 class="h3">YOUR PRICE RANGE?</h3><div class="qopts">' + bands(inCls()).map(function (b) { return '<button class="qopt" type="button" data-band="' + b.k + '" aria-pressed="' + (Q.band === b.k) + '">' + b.t + '<small>CAD, from the real prices</small></button>'; }).join('') + '</div></div>';
    if (n === 3) {
      var list = inCls(), B = bands(list).find(function (b) { return b.k === Q.band; }) || bands(list).pop();
      var pick = list.filter(function (p) { return (Q.size === 'any' || (Q.size === 'small' ? mg(p) <= 10 : mg(p) > 10)) && p.price >= B.a && p.price <= B.b; });
      if (!pick.length) pick = list.filter(function (p) { return p.price >= B.a && p.price <= B.b; });
      if (!pick.length) pick = list;
      pick = pick.sort(function (x, y) { return (y.inStock - x.inStock) || x.price - y.price; }).slice(0, 3);
      Q.pick = pick.map(function (p) { return p.id; });
      html = '<div class="qstep"><h3 class="h3">YOUR SHORTLIST</h3><ul class="shelf qres">' + pick.map(prodCard).join('') + '</ul>' +
        '<div class="btn-row" style="justify-content:center"><button class="pc-btn" type="button" id="addAll"><span class="pc-btn__face"><span class="pc-btn__label">ADD ALL TO CART</span></span></button></div>' +
        '<form class="cap-form" data-hook="H49" novalidate data-offer><p class="mini-t">SAVE THIS SHORTLIST</p><div class="row"><label class="field"><span class="lbl">EMAIL</span><input type="email" name="email" autocomplete="email" inputmode="email" required></label>' +
        '<button class="pc-btn morph" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">EMAIL MY SHORTLIST</span></span></button></div>' +
        '<label class="consent"><input type="checkbox" name="consent_email"><span>Yes, PEPTICITY may email me this shortlist, the founding offer and occasional news. I can unsubscribe any time.</span></label><p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p></form></div>';
    }
    html += '<div class="qnav">' + (n > 0 ? '<button class="linkish" type="button" id="qBack">BACK</button>' : '<span></span>') + '<button class="linkish" type="button" data-go="store">SKIP TO THE STORE</button></div>';
    box.innerHTML = html;
    $$('.prod', box).forEach(function (el) { el.classList.add('in'); });
    $$('form', box).forEach(function (f) { if (f.classList.contains('rs')) wireForm(f); else wireForm(f); });
    var aa = $('#addAll', box); if (aa) aa.addEventListener('click', function () { Q.pick.forEach(function (id) { if (BY[id].inStock) addToCart(id); }); openCart(); });
    var bk = $('#qBack', box); if (bk) bk.addEventListener('click', function () { Q.step--; renderFinder(); });
    track('finder_step:' + (n + 1));
  }
  $('#qsteps').addEventListener('click', function (e) {
    var o = e.target.closest('.qopt'); if (!o) return;
    if (o.dataset.cls) Q.cls = o.dataset.cls; if (o.dataset.size) Q.size = o.dataset.size; if (o.dataset.band) Q.band = o.dataset.band;
    LS.set('pc-finder', JSON.stringify({ cls: Q.cls, size: Q.size, band: Q.band }));
    $$('.qopt', o.parentNode).forEach(function (x) { x.setAttribute('aria-pressed', String(x === o)); });
    setTimeout(function () { Q.step = Math.min(3, Q.step + 1); renderFinder(); }, RM ? 0 : 260);
  });

  /* ================= LOT PASSPORT (sample only until Grace confirms) ================= */
  $('#passport').addEventListener('submit', function (e) {
    e.preventDefault(); var v = (this.lot.value || '').trim().toUpperCase(), out = $('#ppOut');
    out.innerHTML = '<dl><dt>LOT</dt><dd>' + esc(v || 'SAMPLE-001') + ' [sample]</dd><dt>MADE</dt><dd>[Date from the real lot record]</dd><dt>CERTIFICATE</dt><dd>[Certificate appears only when Grace confirms it is real]</dd><dt>STORAGE</dt><dd>[Storage note from the supplier]</dd></dl>';
    track('hook_interact:passport');
  });

  /* ================= refer ================= */
  $('#copyLink').addEventListener('click', function () {
    var inp = $('.ref-form input'), ok = $('.ref-form .ok'), code = (member && member.email) ? 'team-' + btoa(member.email).replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase() : 'team';
    inp.value = 'pepticity.ca/invite/' + code;
    var done = function () { ok.textContent = 'Link copied. Preview only: nothing was sent.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(inp.value).then(done, done); else done();
  });

  /* ================= sticky bar, rail, nav over photos ================= */
  var sticky = $('#sticky'), rail = $$('#rail li'), stops = ['hero', 'city', 'doors', 'lab', 'interests', 'store', 'team', 'network'];
  gsap.ticker.add(function () {
    var y = window.scrollY || 0, vh = innerHeight;
    var jr = $('#journey').getBoundingClientRect(), lr = $('#lab').getBoundingClientRect();
    var overPhoto = (jr.top <= 40 && jr.bottom > 60) || (!D.classList.contains('gated') && lr.top <= 40 && lr.bottom > 60);
    nav.classList.toggle('over-photo', overPhoto); D.classList.toggle('over-photo', overPhoto);
    var formFocus = document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    var footR = $('#foot').getBoundingClientRect();
    sticky.classList.toggle('show', y > vh * 0.9 && !formFocus && !joined() && !(jr.top < 0 && jr.bottom > vh && J.p > 0.85) && footR.top > vh && $('#modal').hidden);
    /* rail: real position */
    var cur = 'hero';
    if (jr.top <= vh * 0.3) cur = J.p > 0.86 ? 'doors' : 'city';
    if (!D.classList.contains('gated')) {
      [['lab', '#lab'], ['interests', '#interests'], ['store', '#store'], ['team', '#tiers'], ['network', '#network']].forEach(function (s) { var el = $(s[1]); if (el && el.getBoundingClientRect().top <= vh * 0.4) cur = s[0]; });
    }
    var ci = stops.indexOf(cur);
    rail.forEach(function (li, k) { li.classList.toggle('now', k === ci); li.classList.toggle('seen', k < ci); });
  });

  /* ================= SAVE MY CART (exit card, only with a cart) + tab-title cue ================= */
  var exitEl = $('#exit'), exitArmed = false, exitTimer;
  setTimeout(function () { exitArmed = true; }, 8000);
  function exitAllowed() {
    if (!cart.length || joined() || SS.get('pc-exit')) return false;
    var n = +(LS.get('pc-exit-n') || 0); return n < 3 && $('#modal').hidden && $('#cart').hidden && !busy;
  }
  function fireExit() { if (!exitArmed || !exitAllowed()) return; SS.set('pc-exit', '1'); LS.set('pc-exit-n', String(+(LS.get('pc-exit-n') || 0) + 1)); exitEl.hidden = false; requestAnimationFrame(function () { exitEl.classList.add('show'); }); track('form_view'); }
  function closeExit() { exitEl.classList.remove('show'); setTimeout(function () { exitEl.hidden = true; }, 500); }
  $('.x', exitEl).addEventListener('click', closeExit);
  D.addEventListener('mouseleave', function (e) { if (e.clientY > 20) return; exitTimer = setTimeout(fireExit, 250); });
  D.addEventListener('mouseenter', function () { clearTimeout(exitTimer); });
  var lastY = 0, lastT = 0;
  addEventListener('scroll', function () {   /* phones: fast upward flick after half the page */
    if (matchMedia('(pointer: fine)').matches) return;
    var y = scrollY, t = performance.now(), docH = D.scrollHeight - innerHeight;
    if (lastY - y > innerHeight * 0.3 && t - lastT < 300 && lastY > docH * 0.5) fireExit();
    if (t - lastT > 300) { lastY = y; lastT = t; }
  }, { passive: true });
  var realTitle = document.title;
  document.addEventListener('visibilitychange', function () { document.title = document.hidden && cart.length ? 'YOUR CART IS SAVED · PEPTICITY' : realTitle; });

  /* ================= WELCOME BACK ================= */
  (function () {
    var last = +(LS.get('pc-last') || 0), now = Date.now();
    LS.set('pc-last', String(now));
    if (last && now - last < 30 * 864e5 && (cart.length || joined())) {
      var wb = $('#wback'); wb.hidden = false;
      $('#wbackT').textContent = 'WELCOME BACK' + (member && member.name ? ', ' + member.name.toUpperCase() : '') + '.' + (cart.length ? ' YOUR CART IS WHERE YOU LEFT IT.' : '');
      $('#wbackCart').hidden = !cart.length;
      $('#wbackCart').addEventListener('click', openCart);
      $('#wbackClear').addEventListener('click', function () { ['pc-member', 'pc-cart', 'pc-finder', 'pc-last'].forEach(LS.del); location.reload(); });
    }
  })();

  /* the concierge bot hands its cart adds to this cart */
  window.PEPCART = { add: function (item) { var p = PRODUCTS.find(function (x) { return x.slug === item.slug; }); if (!p || !p.inStock) return; for (var i = 0; i < (item.qty || 1); i++) addToCart(p.id); } };
  window.addEventListener('pep:checkout', function () { openModal('checkout'); });

  /* ================= load the catalogue ================= */
  function boot(data) {
    PRODUCTS = data.products; PRODUCTS.forEach(function (p) { BY[p.id] = p; });
    renderStore(); renderCart(); renderMemberBits(); renderFinder();
    ScrollTrigger.refresh();
  }
  fetch(CFG.products).then(function (r) { return r.json(); }).then(boot).catch(function (e) { console.warn('catalogue', e); });

  if (RM) D.classList.remove('gated');
  document.fonts && document.fonts.ready.then(function () { $$('.x3d').forEach(function (el) { el.dataset.text = el.textContent; }); ScrollTrigger.refresh(); });
  window.__pc = { J: J, L: L, X: X, get lenis() { return lenis; }, setVersion: setVersion, scan: scan, guest: guestEnter, liftIntro: liftIntro, goTo: goTo, openCart: openCart, addToCart: addToCart, events: events,
    get cart() { return cart; }, get products() { return PRODUCTS; }, totals: totals, labState: labState, openModal: openModal, fireExit: function () { exitArmed = true; fireExit(); },
    loaded: function () { return { weave: seq('weave').loaded() + '/' + seq('weave').m.files, lab: seq('lab').loaded() + '/' + seq('lab').m.files, kind: kind }; } };
})();

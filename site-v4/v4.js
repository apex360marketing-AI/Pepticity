/* PEPTICITY main site v4 = v2's look with a guided tour that sells (owner R173 + R174).
   Chest film -> 01 WELCOME (founding ticket, BTN-101) -> TXT-04 -> 02 WHAT BRINGS YOU (LAY-102) -> 03 FOUR QUESTIONS (FRM-102 on BGD-102)
   -> 04 THE THRESHOLD (19+ gate; the catalogue loads only after a pass) -> 05 CITY (SCR-17 + SCR-07, cards picked from the answers)
   -> 06 DOORS (FRM-02) -> 07 LAB -> SCR-102 HOW WE CHOOSE -> TXT-04 promise -> SCR-16 vial -> 08 COLLECTION + cart -> LAY-101 WHAT YOU GET
   -> SCR-18 tiers -> CRD-124 perks + FRM-104 -> CRD-118 text alerts -> HOV-17 network -> refer -> letter + TXT-13. Menu = NAV-102.
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
  var HIGH = !!CFG.showHighRisk;   /* highRisk listings stay hidden unless PC_CONFIG.showHighRisk is true */
  var events = [];
  /* ================= the 19+ pass (this device only, PC_CONFIG.agePassDays) ================= */
  var PROV = { AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon' };
  function readPass() {   /* stored data is untrusted: exact shape, known province, not expired */
    try { var q = JSON.parse(LS.get('pc-age-pass') || 'null'); if (q && q.ok === true && PROV[q.prov] && +q.exp > Date.now()) return { ok: true, prov: q.prov, at: +q.at || 0, exp: +q.exp }; } catch (e) {}
    return null;
  }
  var pass = readPass();
  if (!pass) D.classList.add('age-gated');
  /* ================= the guided tour answers (preferences only, never health) ================= */
  var MK = {
    gym: { t: 'GYM + PERFORMANCE', shelf: 'gym', icon: 'dumbbell' }, age: { t: '55+ + LONGEVITY', shelf: 'age', icon: 'hourglass' },
    women: { t: 'WOMEN', shelf: null }, men: { t: 'MEN', shelf: null }, energy: { t: 'ENERGY', shelf: 'energy', icon: 'bolt' },
    weight: { t: 'WEIGHT GOALS', shelf: null, closed: true }, recovery: { t: 'RECOVERY', shelf: 'recovery', icon: 'ring' },
    skin: { t: 'SKIN + HAIR', shelf: 'skin', icon: 'drop' }, sleep: { t: 'SLEEP', shelf: 'sleep', icon: 'moon' }
  };
  var EXP = { 'new': 'BRAND NEW', some: 'READ A LITTLE', pro: 'KNOWS WHAT THEY WANT' };
  var PRI = { quality: 'QUALITY + PAPERWORK', price: 'A FAIR, PLAIN PRICE', speed: 'QUICK, DISCREET SHIPPING', support: 'A REAL PERSON TO ASK' };
  var UPD = { email: 'BY EMAIL', text: 'BY TEXT', both: 'EMAIL + TEXT', none: 'JUST BROWSING' };
  var TOUR = J_('pc-tour', null);
  if (!TOUR || typeof TOUR !== 'object' || !MK[TOUR.market] || !EXP[TOUR.experience] || !PRI[TOUR.priority] || !UPD[TOUR.updates]) TOUR = null;
  function track(name) { events.push(name); }   /* privacy-safe: event names only, never field values */

  /* every 3D-look heading gets its extrusion layer */
  $$('.x3d').forEach(function (el) { if (!el.dataset.text) el.dataset.text = el.textContent; });

  var toastT;
  function toast(t) { var el = $('#toast'); el.textContent = t; el.classList.add('show'); clearTimeout(toastT); toastT = setTimeout(function () { el.classList.remove('show'); }, 2200); }

  if (typeof gsap === 'undefined') { D.classList.remove('intro-on', 'gated'); return; }
  gsap.registerPlugin(ScrollTrigger);

  /* ================= member state ================= */
  var member = J_('pc-member', null);   /* {email,name,joinedAt,notches} */
  if (!member || typeof member !== 'object' || Array.isArray(member)) member = null;   /* stored data is untrusted: keep only well-typed fields */
  else { member.email = typeof member.email === 'string' ? member.email : ''; member.name = typeof member.name === 'string' ? member.name.slice(0, 22) : ''; if (member.notches != null) member.notches = Math.max(0, Math.min(10, +member.notches || 0)); }
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
  /* CFG.frames.man = the manifest.json of CFG.frames.dir (HD: media/frames-hd/, 1920x1080 desktop tiles 2x2, 608x1080 phone tiles 4x2).
     MAN_SD is the old v1 atlas table, used only when no manifest is configured. */
  var MAN_SD = {
    'white-weave': { d: { n: 195, tw: 1024, th: 576, cols: 3, rows: 2, files: 33 }, m: { n: 195, tw: 432, th: 768, cols: 4, rows: 2, files: 25 } },
    'black-weave': { d: { n: 226, tw: 1024, th: 576, cols: 3, rows: 2, files: 38 }, m: { n: 226, tw: 432, th: 768, cols: 4, rows: 2, files: 29 } },
    'white-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } },
    'black-lab': { d: { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, m: { n: 151, tw: 432, th: 768, cols: 4, rows: 2, files: 19 } }
  };
  var MAN = (CFG.frames && CFG.frames.man) || MAN_SD;
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
  function loadAll() {   /* HD sheets are heavy: the city's opening sheets, then the lab's first two (so the room behind the doors is never black), then the rest.
       Before the 19+ pass only the first sheet loads (it sits behind the gate), so a first visit stays light. */
    var w = seq('weave'), l = seq('lab');
    if (D.classList.contains('age-gated')) { want(w, [0]); return; }
    want(w, range(Math.min(8, w.m.files))); want(l, [0, 1]); want(w, range(w.m.files)); want(l, range(l.m.files)); }
  function Painter(canvas, part) { this.c = canvas; this.ctx = canvas.getContext('2d'); this.part = part; this.rect = { x: 0, y: 0, w: 0, h: 0 }; this.last = -1; this.resize(); }
  Painter.prototype.resize = function () {
    /* device resolution, no upscaling blur: backing store = CSS size x devicePixelRatio (capped at 2) */
    var r = Math.min(window.devicePixelRatio || 1, 2);
    this.W = this.c.clientWidth || innerWidth; this.H = this.c.clientHeight || innerHeight;
    this.c.width = Math.round(this.W * r); this.c.height = Math.round(this.H * r);
    this.ctx.setTransform(r, 0, 0, r, 0, 0); this.ctx.imageSmoothingEnabled = true; this.ctx.imageSmoothingQuality = 'high'; this.last = -1;
  };
  Painter.prototype.draw = function (f) {
    var s = seq(this.part), m = s.m, now = performance.now(); f = clamp(f, 0, m.n - 1);
    /* cross-fade only while moving; once the scroll settles, draw one whole frame so nothing is double-exposed */
    if (Math.abs(f - (this.lf == null ? -9 : this.lf)) > 0.0005) { this.moveT = now; this.lf = f; }
    var still = now - (this.moveT || 0) > 200;
    if (!dirty && Math.abs(f - this.last) < 0.004 && still === this.still) return;
    this.still = still;
    var i = still ? Math.round(f) : Math.floor(f), fr = still ? 0 : f - i, A = s.frame(i) || s.nearest(i); if (!A) return;
    var sc = Math.max(this.W / m.tw, this.H / m.th), dw = m.tw * sc, dh = m.th * sc, dx = (this.W - dw) / 2, dy = (this.H - dh) / 2, ctx = this.ctx;
    ctx.globalAlpha = 1; ctx.drawImage(A.img, A.sx, A.sy, m.tw, m.th, dx, dy, dw, dh);
    if (fr > 0.02 && i + 1 < m.n) { var B = s.frame(i + 1); if (B) { ctx.globalAlpha = fr; ctx.drawImage(B.img, B.sx, B.sy, m.tw, m.th, dx, dy, dw, dh); ctx.globalAlpha = 1; } }
    this.rect = { x: dx, y: dy, w: dw, h: dh }; this.last = f;
  };
  var pW = new Painter($('#cvWeave'), 'weave'), pL = new Painter($('#cvLab'), 'lab'), pA = new Painter($('#cvAge'), 'weave');   /* pA: the first city frame behind the 19+ gate */
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
  var emb = $('#emblemFlat'), ageSec = $('#age');

  function frameUI() {
    var p = J.p, ageGated = D.classList.contains('age-gated');
    var ar = ageSec.getBoundingClientRect(); if (ar.bottom > 0 && ar.top < innerHeight) pA.draw(0);
    if (!ageGated) pW.draw(weaveFrame(p));
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
    pW.resize(); pL.resize(); pA.resize(); dirty = true; lastGate = -1;
  }
  var rT; addEventListener('resize', function () { clearTimeout(rT); rT = setTimeout(onResize, 120); });

  /* ================= version toggle (BTN-P01 segmented) ================= */
  var smoke = window.PCSmoke ? PCSmoke($('#smoke'), { mode: version === 'black' ? 'black' : 'white', offset: 8 }) : null;
  var vSeg = $('#vSeg');
  function setVersion(v, quiet) {
    version = v === 'black' ? 'black' : 'white';
    D.setAttribute('data-version', version);
    if (!quiet) LS.set('pc-version', version);
    if (vSeg.pcSelect) vSeg.pcSelect(version === 'black' ? 1 : 0);   /* QA 30 Oct: let the switch keep its own record, so the first arrow key works */
    $$('.leaf img').forEach(function (i) { i.src = 'media/' + version + '-doors.jpg'; });
    $('.doorway .peek').src = 'media/' + version + '-lab.jpg';
    var w = seq('weave'); want(w, [Math.floor(weaveFrame(J.p) / w.per), 0, w.m.files - 1], true);
    var l = seq('lab'); want(l, [Math.floor(labState(L.p).f / l.per)], true);
    if (!introLive) loadAll();
    if (smoke) smoke.setMode(version);
    dirty = true; pW.last = pL.last = pA.last = -1;
    document.dispatchEvent(new CustomEvent('pc-version', { detail: version }));
  }
  if (window.PCButtons) PCButtons.init();
  vSeg.addEventListener('pc-change', function (e) { if (e.detail.value !== version) setVersion(e.detail.value); });
  setVersion(version, true);
  if (/[?&]sheen=([1-5])/.test(location.search)) D.setAttribute('data-sheen', RegExp.$1);

  /* ================= the entrance ================= */
  var intro = $('#intro'), vid = $('#chest'), film = $('#film');
  var introDone = false, introTimers = [], introTl = null;
  function setFilm() {
    var base = (CFG.chest && CFG.chest.base) || 'media/chest-';
    vid.innerHTML = ''; vid.poster = base + version + '-poster.jpg';
    [['mp4', 'video/mp4'], ['webm', 'video/webm']].forEach(function (s) { var el = document.createElement('source'); el.src = base + version + '.' + s[0]; el.type = s[1]; vid.appendChild(el); });
    vid.load();
  }
  /* R-ENTRANCE: the WHITE or BLACK chest film exactly as it is (the chest opens, the bottle rises with its peptide swirl),
     then the camera pushes into the bottle's light and through it into the HERO CARD. */
  function dive() {
    if (introDone) return; introDone = true;
    introTimers.forEach(clearTimeout); introTimers = [];
    SS.set('pc-intro', '1');
    var org = (CFG.chest && CFG.chest.focus) || [50, 57];
    gsap.set(film, { transformOrigin: org[0] + '% ' + org[1] + '%' });
    var tl = introTl = gsap.timeline();
    tl.to(film, { scale: 2.6, duration: 2.1, ease: 'power3.in' }, 0)
      .to('#introBloom', { opacity: 1, scale: 1.35, duration: 1.0, ease: 'power2.in' }, 1.0)
      .add(function () {                                   /* we pass through the light: the hero is already there behind it */
        intro.classList.add('dive'); D.classList.remove('intro-on'); introLive = false; mountFx();
        startScroll(); jump(0); ScrollTrigger.refresh(); dirty = true;
        if (!RM) gsap.fromTo('.hero-card', { opacity: 0, scale: 0.74, y: 24 },
          { opacity: 1, scale: 1, y: 0, duration: 1.9, ease: 'expo.out', clearProps: 'transform' });
      }, 1.85)
      .to(intro, { opacity: 0, duration: 1.1, ease: 'power2.out' }, 1.95)
      .add(function () { intro.classList.remove('dive'); gsap.set(intro, { clearProps: 'opacity' }); gsap.set(film, { clearProps: 'transform' }); gsap.set('#introBloom', { opacity: 0, scale: 1 }); vid.pause(); }, 3.15);
    loadAll();
  }
  function liftIntro() {
    if (introDone) return; introDone = true;
    introTimers.forEach(clearTimeout); introTimers = [];
    SS.set('pc-intro', '1'); intro.classList.add('lift');
    setTimeout(function () {
      D.classList.remove('intro-on'); introLive = false; intro.classList.remove('lift'); vid.pause(); mountFx();
      startScroll(); jump(0); ScrollTrigger.refresh(); dirty = true;
      heroIn();
    }, 1050);
    loadAll();
  }
  function runIntro() {
    introDone = false; introLive = true;
    D.classList.add('intro-on'); intro.classList.remove('lift', 'dive');
    gsap.set(film, { scale: 1 }); gsap.set('#introBloom', { opacity: 0, scale: 1 });
    stopScroll(); jump(0); setFilm();
    var started = false, at = (CFG.chest && CFG.chest.diveAt) || 9.1;
    vid.onplaying = function () { started = true; };
    vid.ontimeupdate = function () { if (vid.currentTime >= at) dive(); };
    vid.onended = function () { dive(); };
    if (/[?&]holdintro/.test(location.search)) { vid.ontimeupdate = vid.onended = null; }   /* review aid: keep the film on screen */
    /* never skip the film because it loads slowly: the closed-chest poster holds until it can play.
       If the browser blocks autoplay (e.g. iPhone low-power mode), show TAP TO OPEN instead of skipping. */
    var tap = $('#introTap');
    function tryPlay() { var pr = vid.play(); if (pr && pr.catch) pr.catch(function () { if (!started && tap) tap.hidden = false; }); }
    if (tap) tap.onclick = function () { tap.hidden = true; tryPlay(); };
    /* call play() straight away: iPhones only start loading a video once play() is asked for */
    tryPlay();
    intro.addEventListener('click', function (e) { if (!started && !e.target.closest('#skipIntro')) { if (tap) tap.hidden = true; tryPlay(); } });
    if (!/[?&]holdintro/.test(location.search)) introTimers.push(setTimeout(function () { if (!started) dive(); }, 30000));
    setTimeout(loadAll, 2500);
  }
  $('#skipIntro').addEventListener('click', liftIntro);
  addEventListener('keydown', function (e) { if (e.key === 'Escape' && D.classList.contains('intro-on')) liftIntro(); });
  $('#replay').addEventListener('click', function () { closeMenu(); runIntro(); });
  function heroIn() { if (RM) return; gsap.fromTo('.hero-card', { opacity: 0, y: 40, scale: 0.97 }, { opacity: 1, y: 0, scale: 1, duration: 1.4, ease: 'expo.out' }); }
  if (introLive) runIntro(); else { loadAll(); heroIn(); }

  /* ================= forms (capture-forms; preview only) ================= */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/, PHONE = /^[+()\d\s.-]{10,}$/;
  /* success states: each says what happened and the next step (capture-forms) */
  var SUCCESS = {
    H01: function () { return 'Your founding ticket is saved. ' + (OFFER ? 'Your 15% is saved to this device and applies in the cart. ' : '') + 'Next: four quick questions so we show you the right shelf.'; },
    H01b: function () { return 'Your founding ticket is saved. ' + (OFFER ? 'Your 15% applies in the cart.' : 'Your card is waiting at the doors.'); },
    H44j: function () { return 'You\'re on the team. ' + (OFFER ? '15% applies in your cart. ' : '') + 'Next: how we choose what goes on the shelf.'; },
    H43: function () { return 'Saved. We\'ll text you when a new lot lands. Reply STOP any time.'; },
    H43t: function () { return 'Saved. We\'ll text you when a new lot lands. Reply STOP any time.'; },
    H45: function () { return 'Sealed. Grace will write when PEPTICITY has news for your province.'; },
    H48: function () { return 'The glass is unlocked. Wipe it to see your founding perks.'; },
    'H48b': function () { return 'Your cart link is on its way.'; },
    H36: function (f) { return 'Thanks' + (f.name && f.name.value ? ', ' + f.name.value.trim() : '') + '. ' + (f.want ? 'You picked ' + f.want.value + '.' : ''); },
    H18: function () { return 'You\'re on Grace\'s list. The next letter comes to your inbox.'; },
    H47: function () { return '15% applied to this order.'; },
    H50: function () { return 'You\'re on the list for this lot.'; },
    H60: function (f) { var em = f.email.value.trim(), ph = f.phone.value.trim(); return 'Your shortlist is on its way' + (em && ph ? ' by email and text' : ph ? ' by text' : '') + '. Next: ' + (pass ? 'enter the city.' : 'the threshold, then the city.'); },
    H61: function () { return 'Grace will reply by email. [Reply time: Grace to confirm] Please keep health details out of messages.'; },
    H42w: function () { return 'Noted. Grace will write the moment this shelf opens.'; }
  };
  /* consent (CASL): data-consent="required" = the email IS the purpose (letter); "sms" = texts are the purpose; data-tour = email or
     mobile, whichever the visitor chose. Ticket and card forms never require the marketing box (audit A15): the ticket is saved either way. */
  function validate(form) {
    var err = $('.err', form), em = form.email, ph = form.phone, c = form.consent_email, cs = form.consent_sms, need = form.dataset.consent || '';
    err.textContent = '';
    [em, ph].forEach(function (x) { if (x && x.removeAttribute) x.removeAttribute('aria-invalid'); });
    var bad = function (el, t) { err.textContent = t; if (el) { if (el.type !== 'checkbox') el.setAttribute('aria-invalid', 'true'); el.focus(); } return false; };
    if (form.hasAttribute('data-tour')) {
      var u = TOUR ? TOUR.updates : 'email', wantPh = u === 'text' || u === 'both', wantEm = u !== 'text';
      if (wantEm && !EMAIL.test(em.value.trim())) return bad(em, 'That email looks incomplete.');
      if (!wantEm && em.value.trim() && !EMAIL.test(em.value.trim())) return bad(em, 'That email looks incomplete.');
      if (wantPh && !PHONE.test(ph.value.trim())) return bad(ph, 'That mobile number looks incomplete.');
    } else if (em && em.type === 'email' && (em.required || em.value.trim()) && !EMAIL.test(em.value.trim())) return bad(em, 'That email looks incomplete.');
    if (need === 'sms') {
      if (!ph || !PHONE.test(ph.value.trim())) return bad(ph, 'That mobile number looks incomplete.');
      if (!cs || !cs.checked) return bad(cs, 'Tick the box so we\'re allowed to text you.');
    }
    if (need === 'required' && c && !c.checked) return bad(c, 'Tick the box so we\'re allowed to email you.');
    if (cs && cs.checked && ph && !ph.value.trim()) return bad(ph, 'Add your mobile number for texts, or untick that box.');
    if (ph && ph.value.trim() && !PHONE.test(ph.value.trim())) return bad(ph, 'That mobile number looks incomplete.');
    return true;
  }
  function payload(form) {
    var g = function (n) { return form[n] && form[n].value ? form[n].value.trim() : ''; };
    var ce = form.consent_email, cs = form.consent_sms, ct = form.consent_tags;
    var d = { hook: form.dataset.hook, page: 'site-v4', name: g('name'), email: g('email'), phone: g('phone'), province: pass ? pass.prov : '', question: g('question'),
      consent_email: ce ? { given: ce.checked, text: ce.nextElementSibling.textContent, at: new Date().toISOString() } : { given: false },
      consent_sms: cs ? { given: cs.checked, text: cs.nextElementSibling.textContent, at: new Date().toISOString() } : { given: false },
      utm: {}, created_at: new Date().toISOString(), version: version };
    /* answer quality: every form carries the tour answers. The market (it can read as health-adjacent) rides along only when the visitor ticks the box. */
    if (TOUR) { d.tour = { experience: TOUR.experience, priority: TOUR.priority, updates: TOUR.updates }; if (ct && ct.checked) d.tour.market = TOUR.market; }
    if (form.dataset.interest && ct && ct.checked) d.interest = form.dataset.interest;
    return d;
  }
  function morph(btn, label, cb) {   /* FRM-103 submit morph: same size, progress, then the success state (also works on the BTN-101 stub) */
    if (!btn) { cb && cb(); return; }
    var lab = $('.pc-btn__label', btn) || $('.apx-b101__l', btn) || btn, w = btn.offsetWidth;
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
      track('form_submit'); track('cta_click:' + form.dataset.hook);
      morph($('button[type=submit]', form), 'DONE ✓', function () {
        form.classList.add('sent-done');
        var ok = $('.ok', form), fn = SUCCESS[form.dataset.hook];
        if (ok) ok.textContent = (fn ? fn(form) + ' ' : '') + 'Preview only: nothing was sent.';
        if (data.email && (form.hasAttribute('data-offer') || /^(H36|H18|H60|H45)$/.test(form.dataset.hook))) join(data.email, data.name);
        if (data.phone && data.consent_sms.given) LS.set('pc-sms', '1');
        after && after(data, form);
      });
    });
  }
  $$('.cap-form').forEach(function (f) {
    if (f.dataset.step || f.classList.contains('ref-form')) return;
    wireForm(f, f.dataset.hook === 'H45' ? function () { f.classList.add('sealed'); } : f.dataset.hook === 'H48b' ? function () { setTimeout(closeExit, 2200); }
      : f.dataset.hook === 'H48' ? function () { unlockFog(true); } : f.id === 'toCap' ? function () { toCapDone(); } : null);
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
    if (window.PCCard3D) { PCCard3D.face(); PCCard3D.spin(1); PCCard3D.flare(); }   /* the freshly printed card spins once to face you */
    else gsap.fromTo(mcard, { rotationY: -25 }, { rotationY: 0, duration: 1, ease: 'expo.out' });
    mcard.focus({ preventScroll: true });
  }
  fName.addEventListener('submit', function (e) { e.preventDefault(); toTap(); });
  $('[data-skip]', fName).addEventListener('click', toTap);
  mcard.addEventListener('click', function () {
    if (mcard.dataset.dragged) return;                    /* the click that ends a drag-to-turn is not a tap */
    if (busy || opened) return;
    if (gate.dataset.state === 'tap') return scan();
    if (window.PCCard3D) { PCCard3D.flip(); tone('tap'); return; }   /* tap: spring flip, the chip flares */
    if (gate.dataset.state === 'choose') $('#choJoin').click();
  });
  /* sound: off by default; the confirm tone plays only when the visitor turns sound on */
  var sndOn = LS.get('pc-sound') === '1', actx = null, sndBtn = $('#sndBtn');
  function paintSnd() { if (sndBtn) { sndBtn.setAttribute('aria-pressed', String(sndOn)); sndBtn.textContent = sndOn ? 'SOUND ON' : 'SOUND OFF'; } }
  if (sndBtn) sndBtn.addEventListener('click', function () { sndOn = !sndOn; LS.set('pc-sound', sndOn ? '1' : '0'); paintSnd(); if (sndOn) tone('tap'); });
  paintSnd();
  function tone(kind) {
    if (!sndOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)(); if (actx.state === 'suspended') actx.resume();
      var now = actx.currentTime, out = actx.createGain(); out.gain.value = 0.9; out.connect(actx.destination);
      var notes = kind === 'ok' ? [[659.25, 0, 0.9], [987.77, 0.14, 1.3]] : [[880, 0, 0.25]];
      notes.forEach(function (n) {
        var o = actx.createOscillator(), g = actx.createGain(); o.type = 'sine'; o.frequency.value = n[0];
        g.gain.setValueAtTime(0.0001, now + n[1]); g.gain.exponentialRampToValueAtTime(kind === 'ok' ? 0.07 : 0.03, now + n[1] + 0.03);
        g.gain.exponentialRampToValueAtTime(0.0001, now + n[1] + n[2]); o.connect(g); g.connect(out); o.start(now + n[1]); o.stop(now + n[1] + n[2] + 0.05);
      });
    } catch (e) {}
  }
  mcard.addEventListener('pointermove', function (e) {
    if (busy || window.PCCard3D) return; var r = mcard.getBoundingClientRect();
    mcard.classList.add('tilt'); mcard.style.setProperty('--ry', ((e.clientX - r.left) / r.width - 0.5) * 18 + 'deg'); mcard.style.setProperty('--rx', -((e.clientY - r.top) / r.height - 0.5) * 14 + 'deg');
  });
  mcard.addEventListener('pointerleave', function () { mcard.classList.remove('tilt'); });

  var cam = $('#cam'), flood = $('#flood'), beams = $('.beams'), leaves = $$('.leaf'), dials = $$('.dial'), seam = $('.seam'), spill = $('.spill'), doorway = $('.doorway'), locks = $$('.locks li');
  function ungate() { if (!D.classList.contains('gated')) return; D.classList.remove('gated'); mountFx(); ScrollTrigger.refresh(); dirty = true; pL.resize(); revealSetup(); }
  function openState() {
    opened = true; doorbox.classList.add('opened');
    gsap.set(leaves[0], { rotationY: -84, opacity: 1 }); gsap.set(leaves[1], { rotationY: 84, opacity: 1 }); gsap.set('.leaf .shade', { opacity: 0.6 });
    gsap.set(doorway, { opacity: 1 }); gsap.set(spill, { opacity: 0.7, scaleY: 1 }); gsap.set(beams, { opacity: 0.6, scale: 1 });
    locks.forEach(function (l) { l.classList.add('off'); });
    setGate('granted'); gateStatus.textContent = 'WELCOME IN'; $('#tapHint').textContent = 'The doors are open. Scroll down to step inside.';
  }
  function openDoors(tl, t0) {
    tl.call(function () { locks[0].classList.add('off'); }, null, t0)
      .fromTo(dials[0], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: 180, duration: 1.3 }, t0)
      .call(function () { locks[1].classList.add('off'); }, null, t0 + 0.5)
      .fromTo(dials[1], { opacity: 0, rotation: 0, transformOrigin: '50% 50%' }, { opacity: 1, rotation: -180, duration: 1.3 }, t0 + 0.5)
      .call(function () { locks[2].classList.add('off'); gateStatus.textContent = 'LOCKS RELEASED'; }, null, t0 + 1)
      .fromTo(seam, { opacity: 0, scaleY: 0.12 }, { opacity: 1, scaleY: 1, duration: 0.8, ease: 'expo.out' }, t0 + 1)   /* light cracks through the seam */
      .to(gate, { opacity: 0, duration: 0.6, ease: 'power2.in' }, t0 + 1.6)
      .set(leaves, { opacity: 1 }, t0 + 1.85).set(doorway, { opacity: 1 }, t0 + 1.85)
      .to(dials, { opacity: 0, duration: 0.4 }, t0 + 1.85)
      .to(leaves[0], { rotationY: -84, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to(leaves[1], { rotationY: 84, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to('.leaf .shade', { opacity: 0.6, duration: 2.6, ease: 'power2.inOut' }, t0 + 1.9)
      .to(seam, { opacity: 0, duration: 0.8 }, t0 + 2.3)
      .fromTo(spill, { opacity: 0, scaleY: 0.2 }, { opacity: 0.85, scaleY: 1, duration: 2, ease: 'power2.out' }, t0 + 2.1)
      .fromTo(beams, { opacity: 0, scale: 0.55 }, { opacity: 0.85, scale: 1.08, duration: 2.6, ease: 'power2.out' }, t0 + 1.95)
      .add(function () { var w = doorbox.offsetWidth, h = doorbox.offsetHeight; gsap.set(cam, { transformOrigin: (doorbox.offsetLeft + w * 0.5) + 'px ' + (doorbox.offsetTop + h * 0.53) + 'px' }); }, t0 + 3.1)
      .to(cam, { scale: 2.9, duration: 2.2, ease: 'power2.in' }, t0 + 3.1)
      .to(flood, { opacity: 1, duration: 1.1, ease: 'power1.in' }, t0 + 4.2)
      .call(enterLab, null, t0 + 5.35);
  }
  function scan() {
    if (busy || opened) return;
    busy = true; stopScroll(); setGate('scanning'); gateStatus.textContent = 'READING CARD'; track('reveal_done:scanner');
    if (RM) { openState(); ungate(); busy = false; startScroll(); jump(absTop($('#lab'))); return; }
    var C = window.PCCard3D, padEl = $('#pad');
    if (C) {   /* R-SCAN: glide onto the glass plate, lie down, a light line reads the card, the chip lights the plate, confirm, the doors part */
      var plate = $('.pl-tilt', padEl).getBoundingClientRect(), r0 = mcard.getBoundingClientRect();
      var px = plate.left + plate.width / 2 - (r0.left + r0.width / 2), py = plate.top + plate.height * 0.42 - (r0.top + r0.height / 2);
      var ps = Math.min(1, plate.width * 0.86 / r0.width);
      mcard.dataset.lock = '1';
      var tl3 = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
      tl3.call(function () { C.face(); }, null, 0)
        .to(mcard, { x: px, y: py, scale: ps, duration: 1.15 }, 0)
        .call(function () { C.lay(1); }, null, 0.2)
        .call(function () { C.sweep(0.95); gateStatus.textContent = 'VERIFYING MEMBER'; }, null, 1.25)
        .call(function () { padEl.classList.add('lit'); C.flare(); tone('ok'); }, null, 1.85)
        .call(function () { setGate('granted'); gateStatus.textContent = 'ACCESS GRANTED'; }, null, 2.35)
        .call(function () { C.lay(0); }, null, 2.6)
        .to(mcard, { x: 0, y: 0, scale: 1, duration: 0.95 }, 2.6)
        .call(function () { padEl.classList.remove('lit'); delete mcard.dataset.lock; }, null, 3.7);
      openDoors(tl3, 2.8);
      return;
    }
    var pad = padEl.getBoundingClientRect(), cr = mcard.getBoundingClientRect();
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

  /* ================= navigation helpers ================= */
  var PUBLIC = { hero: 1, markets: 1, tour: 1, age: 1, say1: 1 };
  function goTo(id) {
    if (id === 'hero') return glide(0);
    if (PUBLIC[id]) { var pe = document.getElementById(id); return glide(absTop(pe) - (id === 'age' ? 0 : 40), 1.8); }
    /* every stop past the threshold needs the 19+ pass first */
    if (D.classList.contains('age-gated')) { glide(absTop($('#age')), 1.8); setTimeout(function () { var s0 = $('#ageProv'); if (s0 && !RM) s0.focus({ preventScroll: true }); }, 1900); return; }
    if (id === 'city') return glide(absTop($('#journey')) + innerHeight * 0.6);
    if (id === 'doors') return glide(absTop($('#journey')) + $('#journey').offsetHeight - innerHeight - 4, 2);
    if (D.classList.contains('gated')) { if (!opened) openState(); ungate(); }
    var el = document.getElementById(id) || $('[data-stop-id="' + id + '"]');
    setTimeout(function () { if (el) glide(absTop(el) - (id === 'lab' ? 0 : 60), 1.6); }, 40);
  }
  $('#toStore').addEventListener('click', function () { goTo('store'); });
  document.addEventListener('click', function (e) {
    var g = e.target.closest('[data-go]'); if (g) { e.preventDefault(); closeMenu(false); goTo(g.dataset.go); return; }
    var o = e.target.closest('[data-open]'); if (o) { e.preventDefault(); openModal(o.dataset.open); }
  });

  /* ================= LAB station nav + settle-on-hold ================= */
  $('#stNext').addEventListener('click', function () {
    var ls = labState(L.p), lab = $('#lab'), span = lab.offsetHeight - innerHeight;
    var next = Math.min(ST.length - 1, ls.i + (ls.holding ? 1 : 0));
    if (ls.i === ST.length - 1 && ls.holding) return goTo('choose');
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
  var PRODUCTS = [], BY = {}, DATA = null;
  /* shelves come from data/products.json (p.shelves), so no product name is in this file or the page.
     WOMEN and MEN open the whole collection; WEIGHT GOALS has no shelf until counsel rules (card + capture only). */
  var SHELVES = ['gym', 'age', 'energy', 'recovery', 'skin', 'sleep'];
  function listed(p) { return !!p && !p.hidden && (HIGH || !p.highRisk); }
  function inShelf(k, p) { return listed(p) && (p.shelves || []).indexOf(k) > -1; }
  var filter = 'all';
  /* the bottle lights up from the bottom as its card reaches the screen (owner, 30 Oct) */
  var vialIO = ('IntersectionObserver' in window) ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.classList.toggle('lit', e.isIntersecting); }); }, { threshold: 0.55 }) : null;
  function watchVials(root) { if (!vialIO) return; (root || D).querySelectorAll('.prod').forEach(function (el) { vialIO.observe(el); }); }
  function bottle(p, cls) {
    return '<div class="vial ' + (cls || '') + '"><span class="pool" aria-hidden="true"></span><img src="' + CFG.bottle + '" alt="" width="305" height="760" loading="lazy">' +
      '<span class="shine" aria-hidden="true" style="-webkit-mask-image:url(' + CFG.bottle + ');mask-image:url(' + CFG.bottle + ')"></span></div>';
  }
  function prodCard(p) {
    var more = p.more.map(function (m) { return '<div><h4>' + esc(m[0]) + '</h4><p>' + esc(m[1]) + '</p></div>'; }).join('');
    var act = p.inStock
      ? '<button class="pc-btn pc-btn--sm" type="button" data-add="' + p.id + '"><span class="pc-btn__face"><span class="pc-btn__label">ADD TO CART</span></span></button>'
      : '<span class="soldout">SOLD OUT</span><button class="pc-btn pc-btn--sm" type="button" data-rs="' + p.id + '"><span class="pc-btn__face"><span class="pc-btn__label">' + (OFFER ? 'TELL ME WHEN IT\'S BACK' : 'KEEP ME POSTED') + '</span></span></button>';
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
    var vis = PRODUCTS.filter(listed);
    sh.innerHTML = vis.filter(function (p) { return !p.ancillary; }).map(prodCard).join('');
    var a = vis.filter(function (p) { return p.ancillary; });
    anc.innerHTML = a.map(prodCard).join(''); $('#ancLane').hidden = !a.length;
    $('#storeCount').textContent = 'THE PEPTICITY COLLECTION · ' + vis.length + ' LISTINGS';
    var fl = $('#filters');
    fl.innerHTML = '<button class="chip" type="button" data-f="all" aria-pressed="true">ALL</button>' + SHELVES.map(function (k) { return '<button class="chip" type="button" data-f="' + k + '" aria-pressed="false">' + MK[k].t + '</button>'; }).join('');
    observeProds(); watchVials();
    fillMini(); markPicks();
    if (TOUR && MK[TOUR.market].shelf) applyFilter(MK[TOUR.market].shelf);
  }
  function applyFilter(k) {
    filter = k;
    $$('#filters .chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.f === k)); });
    var I = SHELVES.indexOf(k) > -1;
    $$('#shelf .prod').forEach(function (li) {
      var p = BY[li.dataset.id], show = !I || inShelf(k, p);
      li.classList.toggle('hide', !show); if (show) li.classList.add('in');
    });
    $('#ancLane').style.display = I ? 'none' : '';
    ScrollTrigger.refresh();
  }
  $('#filters').addEventListener('click', function (e) { var c = e.target.closest('.chip'); if (c) applyFilter(c.dataset.f); });
  document.addEventListener('click', function (e) {
    var a = e.target.closest('[data-add]'); if (a) { addToCart(+a.dataset.add, a); return; }
    var m = e.target.closest('[data-more]'); if (m) { var li = m.closest('.prod'); var o = li.classList.toggle('open'); m.setAttribute('aria-expanded', String(o)); m.textContent = o ? 'SHOW LESS' : 'READ MORE'; return; }
    var r = e.target.closest('[data-rs]'); if (r) openModal(OFFER ? 'restock' : 'letter', BY[+r.dataset.rs]);
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
  function bySlug(sl) { return PRODUCTS.find(function (p) { return p.slug === sl && listed(p) && p.inStock; }); }
  function fillMini() {
    var picks = tourPicks(), feat = (DATA && DATA.featured && DATA.featured.city) || [];
    $$('.sr[data-feature]').forEach(function (h) {
      var i = +h.dataset.feature, p = picks[i] || bySlug(feat[i]); if (!p) { h.classList.add('sr-empty'); return; }
      h.classList.remove('sr-empty');
      $('.sr-k', h).textContent = picks[i] ? 'PICKED FROM YOUR ANSWERS' : (i ? 'FROM THE COLLECTION' : 'ON THE SHELF');
      $('.sr-prod', h).innerHTML = miniCard(p);
    });
    var lb = $('#labBuy'), bp = DATA && DATA.featured && bySlug(DATA.featured.bench);
    if (lb && bp) lb.innerHTML = '<p class="mini-t" style="margin-bottom:8px">THE VIAL ON THIS BENCH</p>' + miniCard(bp);
    var st5 = $('.st[data-st="4"] .cap-form'); if (st5 && joined()) st5.outerHTML = '<p class="mini-t">YOU\'RE ON THE TEAM' + (OFFER ? ' · 15% APPLIES IN YOUR CART' : ' · YOUR FOUNDING TICKET IS SAVED') + '</p>';
  }
  /* the visitor's shortlist from the four questions: their shelf, sorted by what matters to them, one size per name */
  function tourPicks() {
    if (!TOUR || !PRODUCTS.length) return [];
    var M = MK[TOUR.market]; if (M.closed) return [];
    var list = PRODUCTS.filter(function (p) { return listed(p) && !p.ancillary && (!M.shelf || inShelf(M.shelf, p)); });
    var pr = TOUR.priority;
    list = list.slice().sort(function (a, b) { return pr === 'price' ? a.price - b.price : (b.inStock - a.inStock) || (pr === 'speed' ? a.price - b.price : 0); });
    var seen = {}, out = [];
    list.forEach(function (p) { if (!seen[p.name] && out.length < 3) { seen[p.name] = 1; out.push(p); } });
    return out;
  }
  function markPicks() {
    var ids = tourPicks().map(function (p) { return p.id; });
    $$('#shelf .prod').forEach(function (li) {
      var on = ids.indexOf(+li.dataset.id) > -1, tg = $('.pick-tag', li); li.classList.toggle('pick', on);
      if (on && !tg) li.insertAdjacentHTML('afterbegin', '<span class="pick-tag">YOUR SHORTLIST</span>'); else if (!on && tg) tg.remove();
    });
  }

  /* ================= cart (offer-to-checkout) ================= */
  var cart = J_('pc-cart', []);   /* [{id,q}] */
  cart = (Array.isArray(cart) ? cart : []).filter(function (l) { return l && isFinite(l.id); }).map(function (l) { return { id: +l.id, q: Math.max(1, Math.min(999, parseInt(l.q, 10) || 1)) }; });   /* numbers only */
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
  var C_EMAIL = 'Optional: yes, PEPTICITY may email me its monthly letter from Grace, including founding-list news. I can unsubscribe at any time. PEPTICITY · [legal name] · [mailing address] · [contact email] · Read our <a href="#privacy" class="ph-link">[privacy promise]</a>.';
  var C_SMS = 'Yes, PEPTICITY may text me news and new arrivals at this number. Up to [2] texts a month. Message and data rates may apply. Reply STOP to stop, HELP for help. Consent is not a condition of any purchase. <a href="#privacy" class="ph-link">[Privacy promise]</a>';
  var TERMS = '<p class="fine">[Offer terms: what it applies to, minimum, one per person, end date. Counsel to approve.]</p>';
  function capForm(hook, btn, opts) {
    opts = opts || {};
    var em = opts.consentRequired ? C_EMAIL.replace('Optional: yes', 'Yes') : C_EMAIL;
    return '<form class="cap-form" data-hook="' + hook + '"' + (opts.offer ? ' data-offer' : '') + (opts.consentRequired ? ' data-consent="required"' : '') + (opts.interest ? ' data-interest="' + opts.interest + '"' : '') + ' novalidate>' + (opts.extra || '') +
      '<div class="row"><label class="field"><span class="lbl">EMAIL</span><input type="email" name="email" autocomplete="email" inputmode="email" required></label>' +
      '<button class="pc-btn morph" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">' + btn + '</span></span></button></div>' +
      '<label class="consent"><input type="checkbox" name="consent_email"><span>' + em + '</span></label>' +
      (opts.interest ? '<label class="consent"><input type="checkbox" name="consent_tags"><span>Optional: PEPTICITY may remember the interest I picked, to choose what Grace writes to me about.</span></label>' : '') +
      '<p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p>' + (opts.offer && OFFER ? TERMS : '') + '</form>';
  }
  function smsForm(hook) {
    return '<form class="cap-form" data-hook="' + hook + '" data-consent="sms" novalidate><label class="field"><span class="lbl">MOBILE NUMBER</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel" required></label>' +
      '<label class="consent"><input type="checkbox" name="consent_sms"><span>' + C_SMS + '</span></label><p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p>' +
      '<button class="pc-btn morph" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">TEXT ME</span></span></button></form>';
  }
  function openModal(kind, arg) {
    var b = $('#modalBody'), html = '';
    if (kind === 'join' && D.classList.contains('age-gated') && OFFER) kind = 'ticket';   /* the offer never shows before the 19+ gate */
    if (kind === 'join' && !OFFER) kind = 'ticket';
    if (kind === 'join') html = '<p class="eyebrow"><span>GRAND OPENING</span></p><h2 class="h2s x3d" id="modalT">JOIN THE PEPTICITY TEAM</h2><p>15% off your first order, Grace\'s monthly letter if you want it, and first word when new lots land.</p>' + capForm('H01b', 'CLAIM MY 15% OFF', { offer: true });
    if (kind === 'ticket') html = '<p class="eyebrow"><span>FOUNDING MEMBERS</span></p><h2 class="h2s x3d" id="modalT">CLAIM YOUR FOUNDING TICKET</h2><p>Your founding ticket, first word when new lots land, and Grace\'s monthly letter if you tick the box.</p>' + capForm('H01b', 'CLAIM MY TICKET', { offer: true });
    if (kind === 'letter') html = '<p class="eyebrow"><span>GRACE\'S LETTER</span></p><h2 class="h2s x3d" id="modalT">ONE LETTER A MONTH</h2><p>What\'s new, what\'s back, and a note from Grace.</p>' + capForm('H18', 'GET THE LETTER', { consentRequired: true });
    if (kind === 'sms') html = '<p class="eyebrow"><span>FIRST WORD BY TEXT</span></p><h2 class="h2s x3d" id="modalT">NEW LOTS, BY TEXT</h2><p>One short text when something new lands. Up to [2] a month. Reply STOP any time.</p>' + smsForm('H43t');
    if (kind === 'ask') html = '<p class="eyebrow"><span>A REAL PERSON</span></p><h2 class="h2s x3d" id="modalT">ASK GRACE</h2><p>About PEPTICITY, an order or a label. Please keep health details out of your message: Grace can\'t give medical advice.</p>' +
      capForm('H61', 'SEND MY QUESTION', { extra: '<label class="field"><span class="lbl">YOUR QUESTION</span><input type="text" name="question" maxlength="300" autocomplete="off" required></label>' });
    if (kind === 'weight') html = '<p class="eyebrow"><span>WEIGHT GOALS</span></p><h2 class="h2s x3d" id="modalT">THIS SHELF ISN\'T OPEN YET</h2><p>Tell us it matters to you and Grace will write the moment it is. No products, prices or promises until then.</p>' +
      capForm('H42w', 'KEEP ME POSTED', { interest: 'weight' });
    if (kind === 'restock') {
      var P = arg;
      html = '<p class="eyebrow"><span>SOLD OUT · RESTOCK QUEUE</span></p><h2 class="h2s x3d" id="modalT">' + esc(P.name + ' ' + P.strength) + '</h2><p>Join the queue and we\'ll email you the moment the next lot lands, before the shelf goes public.</p>' +
        capForm('H50', 'JOIN THE QUEUE', { consentRequired: true });
    }
    if (kind === 'checkout') {
      var T = totals();
      html = '<p class="eyebrow"><span>CHECKOUT · GUEST</span></p><h2 class="h2s x3d" id="modalT">NO ACCOUNT NEEDED</h2>' +
        '<div class="sum"><div class="tr" style="display:flex;justify-content:space-between"><span>' + T.items + ' items</span><span>' + money(T.sub) + '</span></div>' +
        (T.disc ? '<div style="display:flex;justify-content:space-between"><span>PEPTICITY TEAM · 15%</span><span>−' + money(T.disc) + '</span></div>' : '') +
        '<div style="display:flex;justify-content:space-between"><span>Shipping' + (CFG.shipping.placeholder ? ' [placeholder]' : '') + '</span><span>' + (T.ship ? money(T.ship) : 'FREE') + '</span></div>' +
        '<div style="display:flex;justify-content:space-between;font-family:var(--display)"><span>TOTAL</span><span>' + money(T.total) + ' CAD</span></div></div>' +
        '<p>19+ pass: ' + (pass ? PROV[pass.prov] : '[not yet]') + '. [Payment and the real store backend connect here.]</p>' +
        '<button class="pc-btn pc-btn--block" type="button" id="placeOrder"><span class="pc-btn__face"><span class="pc-btn__label">PLACE ORDER (PREVIEW)</span></span></button>';
    }
    if (kind === 'thanks') {
      html = '<p class="eyebrow"><span>THANK YOU</span></p><h2 class="h2s x3d" id="modalT">ORDER RECEIVED</h2><p>Preview only: no order was placed.</p>' +
        '<form class="cap-form" data-hook="H53" id="acctForm" novalidate><p class="mini-t">SAVE YOUR DETAILS FOR NEXT TIME</p><label class="field"><span class="lbl">CHOOSE A PASSWORD</span><input type="password" name="pw" autocomplete="new-password" minlength="8"></label>' +
        '<label class="field"><span class="lbl">MOBILE FOR SHIPPING UPDATES (OPTIONAL)</span><input type="tel" name="phone" autocomplete="tel" inputmode="tel"></label>' +
        '<label class="consent"><input type="checkbox" name="consent_sms"><span>' + C_SMS + '</span></label>' +
        '<p class="err" role="alert"></p><p class="ok" role="status" aria-live="polite"></p><button class="pc-btn" type="submit"><span class="pc-btn__face"><span class="pc-btn__label">SAVE MY DETAILS</span></span></button></form>';
    }
    if (!html) return;
    lastFocus = document.activeElement;
    b.innerHTML = html; $$('.x3d', b).forEach(function (el) { el.dataset.text = el.textContent; });
    $$('.cap-form', b).forEach(function (f) { if (f.id === 'acctForm') return;
      wireForm(f, f.dataset.hook === 'H50' ? function () { var ok = $('.ok', f); ok.textContent = 'You\'re in the queue: #[REAL POSITION] in line for the next lot. ' + ok.textContent; } : null); });
    closeMenu(false);
    var po = $('#placeOrder', b); if (po) po.addEventListener('click', function () { cart = []; saveCart(); openModal('thanks'); });
    var af = $('#acctForm', b); if (af) af.addEventListener('submit', function (e) { e.preventDefault(); $('.ok', af).textContent = 'Saved. Preview only: nothing was sent.'; });
    $('#modal').hidden = false; stopScroll(); track('form_view');
    setTimeout(function () { var i = $('input', b) || $('.x', $('#modal')); i.focus({ preventScroll: true }); }, 40);
    track('cta_click:open-' + kind);
  }
  function closeModal() { $('#modal').hidden = true; startScroll(); if (lastFocus) lastFocus.focus({ preventScroll: true }); }
  $('#modal').addEventListener('click', function (e) { if (e.target.closest('[data-close]') || e.target === $('#modal') || e.target.closest('[data-go]')) closeModal(); });
  $('#modal').addEventListener('keydown', function (e) { trap($('.modal'), e); });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    if (!$('#modal').hidden) closeModal(); else if (!$('#cart').hidden) closeCart(); else if (!exitEl.hidden) closeExit();   /* the NAV-102 menu handles its own Esc and hands focus back */
  });

  /* ================= THE TOUR menu (NAV-102 Split Preview) ================= */
  var tm = $('#tourMenu'), tmToggle = $('.apx-n102__toggle', tm), menuOpen = false;
  if (window.APX && APX.NAV102) APX.NAV102.mount(tm, { lockScroll: true });
  function syncMenu() {
    var o = tm.classList.contains('is-open'); if (o === menuOpen) return; menuOpen = o;
    $('#menuBtn').setAttribute('aria-expanded', String(o));
    if (o) { stopScroll(); track('menu_open'); } else startScroll();
  }
  new MutationObserver(syncMenu).observe(tm, { attributes: true, attributeFilter: ['class'] });
  function openMenu() { if (!tm.classList.contains('is-open')) tmToggle.click(); }
  function closeMenu(returnFocus) { if (!tm.classList.contains('is-open')) return; tmToggle.click(); if (returnFocus === false) $('#menuBtn').blur(); else $('#menuBtn').focus({ preventScroll: true }); }
  $('#menuBtn').addEventListener('click', openMenu);
  tm.addEventListener('keydown', function (e) { if (e.key === 'Escape') setTimeout(function () { $('#menuBtn').focus({ preventScroll: true }); }, 0); });

  /* ================= 02 · WHAT BRINGS YOU HERE (LAY-102) -> into the four questions ================= */
  function startTour(k) {
    if (!MK[k]) return;
    track('cta_click:market'); if (k === 'weight') track('market_weight');
    var r = $('#tourForm input[name="market"][value="' + k + '"]');
    if (TOUR) { TOUR.market = k; LS.set('pc-tour', JSON.stringify(TOUR)); renderOut(); }
    else if (r) { r.checked = true; var tf = $('#tourForm'); if (tf.requestSubmit && !tf.querySelector('.apx-f102__step.is-current input[name="experience"]')) tf.requestSubmit($('.apx-f102__next', tf)); }
    glide(absTop($('#tour')) - 40, 1.6);
  }
  $('#mkPanels').addEventListener('click', function (e) { var b = e.target.closest('[data-start]'); if (b) startTour(b.dataset.start); });

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
      if (!best) best = t;
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

  /* ================= FOUNDING PERKS (CRD-124 Fog Wipe): email first, then the glass can be wiped ================= */
  var fogCard = $('.fogcard');
  function unlockFog(go) {
    if (!fogCard || !fogCard.classList.contains('is-locked')) return;
    fogCard.classList.remove('is-locked'); track('hook_reveal:perks');
    if (go) { toast('THE GLASS IS UNLOCKED · WIPE IT'); if (!RM) fogCard.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  }
  if (joined()) unlockFog(false);

  /* ================= 03 · FOUR QUESTIONS (FRM-102 Quote Stepper) -> playback -> 19+ -> shortlist -> email + phone ================= */
  var tourForm = $('#tourForm'), tourOut = $('#tourOut'), fDestroy = null;
  function mountTour() { if (window.APX && APX.FRM102) fDestroy = APX.FRM102.mount(tourForm); }
  mountTour();
  tourForm.addEventListener('apx:submit', function (e) {
    e.preventDefault();
    var d = e.detail.data, t = { market: d.get('market'), experience: d.get('experience'), priority: d.get('priority'), updates: d.get('updates') };
    if (!MK[t.market] || !EXP[t.experience] || !PRI[t.priority] || !UPD[t.updates]) return;
    TOUR = t; LS.set('pc-tour', JSON.stringify(TOUR)); track('tour_done');
    showOut(true);
  });
  tourForm.addEventListener('change', function (e) { if (e.target.name) track('tour_step:' + e.target.name); });
  function learnLine() {
    var x = { 'new': 'Start at the basics: THE LAB, station 01, shows how a peptide chain is built. ',
      some: 'Next for you: THE VIAL, TAKEN APART, and how we choose what goes on the shelf. ',
      pro: 'You know what you want: your shortlist is right below, then the full collection. ' }[TOUR.experience];
    var y = { quality: 'You care about paperwork, so watch for THE PAPERWORK card. [Lot records: shown only once they are real.]',
      price: 'You care about price, so your shortlist is sorted lowest first, in CAD.',
      speed: 'You care about shipping, so in-stock listings come first. [Shipping times: Grace to confirm.]',
      support: 'You want a real person: ASK GRACE is on every stop past the doors.' }[TOUR.priority];
    return x + y;
  }
  function renderOut() {
    if (!TOUR) return;
    var M = MK[TOUR.market];
    $('#toDl').innerHTML = [['WHAT BRINGS YOU', M.t], ['EXPERIENCE', EXP[TOUR.experience]], ['WHAT MATTERS MOST', PRI[TOUR.priority]], ['KEEP IN TOUCH', UPD[TOUR.updates]]]
      .map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + esc(r[1]) + '</dd></div>'; }).join('');
    $('#toLearn').textContent = learnLine();
    var u = TOUR.updates, f = $('#toCap');
    $('#toCapT').textContent = u === 'text' ? 'TEXT ME MY SHORTLIST' : u === 'both' ? 'SEND MY SHORTLIST BY EMAIL + TEXT' : u === 'none' ? 'SAVE MY SHORTLIST FOR LATER (OPTIONAL)' : 'EMAIL ME MY SHORTLIST';
    $('#toPhOpt').textContent = (u === 'text' || u === 'both') ? '' : '(OPTIONAL)';
    f.email.required = u !== 'text';
    $('.lbl', f.email.parentNode).textContent = u === 'text' ? 'EMAIL (OPTIONAL)' : 'EMAIL';
    var cs = f.consent_sms.nextElementSibling; cs.innerHTML = ((u === 'text' || u === 'both') ? '' : 'Optional: ') + C_SMS;
    renderPicks();
  }
  function renderPicks() {
    if (!TOUR) return;
    var gateBox = $('#toGate'), box = $('#toPicks'), M = MK[TOUR.market];
    gateBox.hidden = !!pass; box.hidden = !pass;
    if (!pass) return;
    if (M.closed) { box.innerHTML = '<p class="mini-t">THE WEIGHT GOALS SHELF ISN\'T OPEN YET</p><p class="to-gate-t">Leave your email below and Grace will write the moment it is. Meanwhile, the whole collection is past the doors.</p>'; return; }
    if (catState !== 2) { box.innerHTML = '<p class="mini-t">OPENING YOUR SHORTLIST…</p>'; return; }
    var picks = tourPicks();
    box.innerHTML = '<p class="mini-t">YOUR SHORTLIST · ' + esc(M.t) + '</p><div class="to-list">' + picks.map(miniCard).join('') + '</div>' +
      '<p class="fine">Name, strength and price only. No product here is presented as treating, preventing or curing anything.</p>' +
      '<button class="linkish" type="button" data-go="store">SEE THE WHOLE ' + (M.shelf ? esc(M.t) + ' SHELF' : 'COLLECTION') + '</button>';
  }
  function showOut(focus) {
    renderOut(); tourForm.hidden = true; tourOut.hidden = false;
    if (focus) setTimeout(function () { var h = $('.to-play .eyebrow', tourOut); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); glide(absTop($('.tour-card')) - 60, 1.2); }, 60);
    ScrollTrigger.refresh();
  }
  $('#toRedo').addEventListener('click', function () {
    tourOut.hidden = true; tourForm.hidden = false; if (fDestroy) fDestroy(); mountTour();
    setTimeout(function () { var l = $('legend', tourForm); if (l) l.focus({ preventScroll: true }); }, 60); ScrollTrigger.refresh();
  });
  $('#toGateF').addEventListener('submit', function (e) {
    e.preventDefault(); var f = this, v = f.prov.value, err = $('.err', f); err.textContent = '';
    if (!v) { err.textContent = 'Choose your province or territory first.'; f.prov.focus(); return; }
    if (v === 'XX') { err.textContent = 'The PEPTICITY collection serves Canada only. You can still get Grace\'s letter below.'; track('age_outside'); return; }
    if (!PROV[v]) return;
    grantPass(v, false);
  });
  function toCapDone() { var p0 = $('#toCap'); track('tour_capture'); setTimeout(function () { $('.to-play', tourOut).classList.add('saved'); }, 200); return p0; }
  if (TOUR) showOut(false);

  /* ================= refer ================= */
  $('#copyLink').addEventListener('click', function () {
    var inp = $('.ref-form input'), ok = $('.ref-form .ok'), code = 'team'; try { if (member && member.email) code = 'team-' + btoa(member.email).replace(/[^a-z0-9]/gi, '').slice(0, 6).toLowerCase(); } catch (e) {}
    inp.value = 'pepticity.ca/invite/' + code;
    var done = function () { ok.textContent = 'Link copied. Preview only: nothing was sent.'; };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(inp.value).then(done, done); else done();
  });

  /* ================= sticky bar, rail, nav over photos, concierge mode ================= */
  var sticky = $('#sticky'), rail = $$('#rail li'), stops = ['hero', 'markets', 'tour', 'age', 'city', 'doors', 'lab', 'store'], tick = 0;
  if (OFFER) $('#stickyT').textContent = 'JOIN · 15% OFF';
  gsap.ticker.add(function () {
    var y = window.scrollY || 0, vh = innerHeight, ag = D.classList.contains('age-gated');
    var jr = $('#journey').getBoundingClientRect(), lr = $('#lab').getBoundingClientRect(), agr = ageSec.getBoundingClientRect();
    var overPhoto = (!ag && jr.top <= 40 && jr.bottom > 60) || (!D.classList.contains('gated') && lr.top <= 40 && lr.bottom > 60) || (agr.top <= 40 && agr.bottom > 60 && agr.height > vh * 0.8);
    nav.classList.toggle('over-photo', overPhoto); D.classList.toggle('over-photo', overPhoto);
    var formFocus = document.activeElement && /INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName);
    var footR = $('#foot').getBoundingClientRect(), tr = $('#tour').getBoundingClientRect();
    var formOnScreen = (tr.top < vh * 0.7 && tr.bottom > vh * 0.3) || (agr.top < vh * 0.6 && agr.bottom > vh * 0.4);
    var showMain = !joined(), showSms = !LS.get('pc-sms');
    sticky.classList.toggle('show', y > vh * 0.9 && (showMain || showSms) && !formFocus && !formOnScreen && !(!ag && jr.top < 0 && jr.bottom > vh && J.p > 0.85) && (ag || footR.top > vh) && $('#modal').hidden && !menuOpen);
    sticky.classList.toggle('no-main', !showMain); sticky.classList.toggle('no-sms', !showSms);
    /* rail: real position */
    var cur = 'hero';
    [['markets', '#markets'], ['tour', '#tour'], ['age', '#age']].forEach(function (s) { if ($(s[1]).getBoundingClientRect().top <= vh * 0.4) cur = s[0]; });
    if (!ag && jr.top <= vh * 0.3) cur = J.p > 0.86 ? 'doors' : 'city';
    if (!ag && !D.classList.contains('gated')) {
      [['lab', '#lab'], ['store', '#store']].forEach(function (s) { var el = $(s[1]); if (el && el.getBoundingClientRect().top <= vh * 0.4) cur = s[0]; });
    }
    var ci = stops.indexOf(cur);
    rail.forEach(function (li, k) { li.classList.toggle('now', k === ci); li.classList.toggle('seen', k < ci); li.classList.toggle('locked', ag && k > 3); });
    if (cur !== LS.get('pc-stop') && ++tick % 20 === 0) LS.set('pc-stop', cur);
    if (tick % 30 === 0) syncBot();
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
    if (last && now - last < 30 * 864e5 && (cart.length || joined() || TOUR)) {
      var wb = $('#wback'); wb.hidden = false;
      var stop = LS.get('pc-stop'); if (stops.indexOf(stop) < 1) stop = TOUR ? 'tour' : 'markets';
      $('#wbackGo').addEventListener('click', function () { goTo(stop); });
      $('#wbackT').textContent = 'WELCOME BACK' + (member && member.name ? ', ' + member.name.toUpperCase() : '') + '.' + (cart.length ? ' YOUR CART IS WHERE YOU LEFT IT.' : '');
      $('#wbackCart').hidden = !cart.length;
      $('#wbackCart').addEventListener('click', openCart);
      $('#wbackClear').addEventListener('click', function () { ['pc-member', 'pc-cart', 'pc-tour', 'pc-last', 'pc-stop', 'pc-age-pass', 'pc-sms'].forEach(LS.del); location.reload(); });
    }
  })();

  /* the concierge bot hands its cart adds to this cart */
  window.PEPCART = { add: function (item) { var p = PRODUCTS.find(function (x) { return x.slug === item.slug; }); if (!p || !p.inStock || !listed(p) || !pass) return; for (var i = 0; i < (item.qty || 1); i++) addToCart(p.id); } };
  window.addEventListener('pep:checkout', function () { openModal('checkout'); });

  /* ================= load the catalogue: ONLY after the 19+ pass (nothing from it is in the page before that) ================= */
  var catState = 0;   /* 0 not asked, 1 loading, 2 ready */
  function boot(data) {
    if (!data || !Array.isArray(data.products)) return;
    DATA = data; PRODUCTS = data.products; PRODUCTS.forEach(function (p) { BY[p.id] = p; });
    catState = 2;
    renderStore(); renderCart(); renderMemberBits(); renderPicks();
    var sold = PRODUCTS.filter(function (p) { return listed(p) && !p.inStock; }).map(function (p) { return p.slug; });
    window.PEPBOT_CONFIG = window.PEPBOT_CONFIG || {}; window.PEPBOT_CONFIG.soldOut = sold;
    if (window.PEPBOT && PEPBOT.configure) PEPBOT.configure({ soldOut: sold });
    ScrollTrigger.refresh(); dirty = true;
  }
  function loadCatalogue() {
    if (!pass || catState) return; catState = 1;
    fetch(CFG.products).then(function (r) { return r.json(); }).then(boot).catch(function (e) { catState = 0; console.warn('catalogue', e); });
  }

  /* ================= 04 · THE THRESHOLD (19+ gate, from v3) ================= */
  var agePanel = $('#agePanel'), ageStatus = $('#ageStatus'), ageForm = $('#ageForm'), ageProv = $('#ageProv');
  function ageDate(t) { try { return new Date(t).toLocaleDateString('en-CA', { day: 'numeric', month: 'long', year: 'numeric' }); } catch (e) { return ''; } }
  function renderAge() {
    if (pass) { agePanel.dataset.state = 'ok'; ageStatus.textContent = 'PASS SAVED · ' + pass.prov;
      $('#ageOkT').textContent = 'Welcome in. Your 19+ pass for ' + PROV[pass.prov] + ' is saved on this device until ' + ageDate(pass.exp) + '.'; }
    else if (agePanel.dataset.state === 'ok') agePanel.dataset.state = 'ask';
  }
  function openSales(go) {
    D.classList.remove('age-gated'); dirty = true;
    requestAnimationFrame(function () { pW.resize(); mountFx(); ScrollTrigger.refresh(); dirty = true; layoutDoors(); });
    loadCatalogue(); loadAll(); syncBot();
    if (go) setTimeout(function () { glide(absTop($('#journey')) + 2, RM ? 0.01 : 2.4); }, RM ? 0 : 900);
  }
  function grantPass(prov, go) {
    var now = Date.now(); pass = { ok: true, prov: prov, at: now, exp: now + (CFG.agePassDays || 30) * 864e5 };
    LS.set('pc-age-pass', JSON.stringify(pass)); track('age_pass');
    agePanel.classList.add('passing'); setTimeout(function () { agePanel.classList.remove('passing'); }, 1100);
    renderAge(); ageStatus.textContent = 'VERIFIED · ' + prov; openSales(go); renderPicks();
  }
  ageForm.addEventListener('submit', function (e) {
    e.preventDefault(); var v = ageProv.value, err = $('.err', ageForm); err.textContent = ''; ageProv.removeAttribute('aria-invalid');
    if (!v) { err.textContent = 'Choose your province or territory first.'; ageProv.setAttribute('aria-invalid', 'true'); ageProv.focus(); return; }
    if (v === 'XX') { agePanel.dataset.state = 'no'; ageStatus.textContent = 'CANADA ONLY'; $('#ageNoT').textContent = 'The PEPTICITY collection serves Canada only. Grace\'s letter is still open to you.'; track('age_outside'); return; }
    if (!PROV[v]) return;
    grantPass(v, true);
  });
  $('#ageLeave').addEventListener('click', function () {   /* LEAVE keeps the visitor on the public tour */
    agePanel.dataset.state = 'no'; ageStatus.textContent = 'COLLECTION CLOSED'; track('age_leave');
    $('#ageNoT').textContent = 'Understood. The collection stays closed, and the rest of PEPTICITY is here for you.';
  });
  $('#ageBack').addEventListener('click', function () { goTo('tour'); });
  $('#ageRetry').addEventListener('click', function () { agePanel.dataset.state = 'ask'; ageStatus.textContent = 'AGE CHECK · CANADA'; ageProv.focus({ preventScroll: true }); });
  $('#ageEnter').addEventListener('click', function () { glide(absTop($('#journey')) + 2, 2.2); });
  $('#ageForget').addEventListener('click', function () { LS.del('pc-age-pass'); location.href = location.pathname + '?nointro#age'; });
  renderAge();
  if (pass) openSales(false);
  window.addEventListener('pep:guide-enter', function () { goTo('age'); });

  /* ================= the concierge: GUIDE before the gate, SELL past it (needs a valid 19+ pass) ================= */
  var botMode = 'guide';
  function syncBot() {
    if (!window.PEPBOT || !PEPBOT.setMode) return;
    var m = (!pass || D.classList.contains('age-gated')) ? 'guide' : ($('#journey').getBoundingClientRect().top < innerHeight * 0.5 ? 'sell' : 'guide');
    if (m !== botMode || (PEPBOT.mode && PEPBOT.mode() !== m)) { botMode = m; PEPBOT.setMode(m); track('bot_mode:' + m); }
  }
  document.addEventListener('pc-bot-ready', syncBot);

  /* ================= the offer's end date: a FIXED stored date only (honest-urgency) ================= */
  function renderOfferEnd() {
    var el = $('#offerEnd'); if (!el) return;
    var end = CFG.offerEndsAt ? Date.parse(CFG.offerEndsAt) : NaN;
    if (!isFinite(end)) { el.textContent = '[End date: Grace and counsel to set]'; return; }
    var left = end - Date.now();
    if (left <= 0) { el.textContent = 'THIS OFFER HAS ENDED'; return; }
    var d = Math.floor(left / 864e5), h = Math.floor(left % 864e5 / 36e5);
    el.textContent = 'ENDS ' + new Date(end).toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase() + ' · ' + d + (d === 1 ? ' DAY ' : ' DAYS ') + h + ' HRS LEFT';
  }
  if (OFFER) { renderOfferEnd(); setInterval(renderOfferEnd, 60000); }

  /* ================= the 10 effect picks: mount each module once its section is on the page (some sit past the gates) ================= */
  var FX = [['NAV102', null], ['LAY102', '#mkPanels'], ['BGD102', '.tour-plex'], ['TXT04', '.apx-txt04'], ['BTN101', '[data-apx="BTN-101"]'],
    ['SCR102', '#choose'], ['LAY101', '.apx-lay101'], ['CRD124', '.apx-c124'], ['CRD118', '.apx-c118']];
  function mountFx() {
    if (!window.APX) return;
    FX.forEach(function (f) {
      if (!f[1] || !APX[f[0]]) return;
      $$(f[1]).forEach(function (el) { if (el.__fx || !el.getClientRects().length) return; el.__fx = 1; try { APX[f[0]].mount(el); } catch (e) { console.warn(f[0], e); } });
    });
    ScrollTrigger.refresh();
  }
  mountFx();
  document.addEventListener('pc-version', function () { window.dispatchEvent(new Event('apx:tokens')); });

  if (RM) D.classList.remove('gated');
  document.fonts && document.fonts.ready.then(function () { $$('.x3d').forEach(function (el) { el.dataset.text = el.textContent; }); ScrollTrigger.refresh(); });
  window.__pc = { J: J, L: L, X: X, get lenis() { return lenis; }, dive: function () { dive(); return introTl; }, setVersion: setVersion, scan: scan, guest: guestEnter, liftIntro: liftIntro, goTo: goTo, openCart: openCart, addToCart: addToCart, events: events,
    get cart() { return cart; }, get products() { return PRODUCTS; }, get tour() { return TOUR; }, get pass() { return pass; }, grantPass: grantPass, totals: totals, labState: labState, openModal: openModal, fireExit: function () { exitArmed = true; fireExit(); },
    loaded: function () { return { weave: seq('weave').loaded() + '/' + seq('weave').m.files, lab: seq('lab').loaded() + '/' + seq('lab').m.files, kind: kind }; } };
})();

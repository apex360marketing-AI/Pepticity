/* Pepticity V6 · Garnet: page behaviour. 3D lives in scene.js. */
(function () {
  'use strict';
  var P = window.PEP, C = P.C, $ = P.$, $$ = P.$$, el = P.el, W = window, D = document;
  var S = W.PEPSTATE = W.PEPSTATE || { intro: 1, lift: 1, peel: 0, view: 'home', px: 0, py: 0, scroll: 0, hero: 1 };
  var G = W.gsap, ST = W.ScrollTrigger;

  /* ---------- fill content ---------- */
  var steps = $('[data-fill-steps]');
  C.steps.forEach(function (s) {
    var li = el('li', 'step');
    li.appendChild(el('span', 'step-n', s.n.replace(/^0/, '')));
    var c = el('div', 'step-c'); c.appendChild(el('h3', '', s.t)); c.appendChild(el('p', '', s.b)); li.appendChild(c);
    steps.appendChild(li);
  });
  var ppl = $('[data-fill-clin]');
  C.clinicians.forEach(function (c) {
    var li = el('li'); var f = el('div', 'ppl-frame'); f.appendChild(el('span', 'ppl-ph', 'Photo to come')); li.appendChild(f);
    li.appendChild(el('h3', '', c.n)); li.appendChild(el('p', '', c.r)); var l = el('span', 'lic', 'Verify licence: ' + c.l); li.appendChild(l);
    ppl.appendChild(li);
  });
  var plans = $('[data-fill-plans]');
  C.plans.forEach(function (p) {
    var a = el('article', 'plan' + (p.star ? ' is-star' : ''));
    a.appendChild(el('h2', '', p.name));
    var pr = el('p', 'plan-p', p.price); if (p.per) pr.appendChild(el('small', '', p.per)); a.appendChild(pr);
    var ul = el('ul'); p.pts.forEach(function (t) { ul.appendChild(el('li', '', t)); }); a.appendChild(ul);
    var b = el('button', 'btn-br' + (p.star ? ' btn-solid' : '')); b.type = 'button'; b.setAttribute('data-quiz', ''); b.appendChild(el('span', '', p.cta)); a.appendChild(b);
    plans.appendChild(a);
  });
  var paths = $('[data-fill-paths]');
  ['longevity', 'energy', 'women', 'men', 'training'].forEach(function (k) {
    var a = C.aud[k], li = el('li');
    li.appendChild(el('h3', '', a.label)); li.appendChild(el('p', '', a.hero));
    var b = el('button', 'btn-br btn-sm'); b.type = 'button'; b.setAttribute('data-quiz', ''); b.setAttribute('data-set-aud', k); b.appendChild(el('span', '', 'Start this path')); li.appendChild(b);
    paths.appendChild(li);
  });
  D.addEventListener('click', function (e) { var b = e.target.closest('[data-set-aud]'); if (b) P.setAud(b.getAttribute('data-set-aud'), true); }, true);
  P.fill();

  /* ---------- core modules ---------- */
  P.smooth();
  P.audience();
  P.quiz();
  P.flags($('#rf'));
  P.lots($('#lot'), function (code) { S.lot = code; });
  P.receipt($('#receipt')); P.receipt($('#receipt2'));
  P.textSize();
  P.forms();
  var css = getComputedStyle(D.documentElement);
  var chOpts = { line: '#ee8b9b', glow: 'rgba(200,52,77,.8)', dot: '#efebe7', scrub: 'rgba(239,235,231,.4)', grid: 'rgba(239,235,231,.07)', text: 'rgba(239,235,231,.7)', font: '"Spline Sans Mono", monospace' };
  var ch1 = P.chroma($('#chroma'), chOpts), ch2 = P.chroma($('#chroma2'), chOpts);

  /* ---------- curtain menu ---------- */
  var mb = $('.menu-btn'), cur = $('#curtain');
  function menu(open) {
    mb.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { cur.hidden = false; requestAnimationFrame(function () { cur.classList.add('is-open'); }); if (P.lenis) P.lenis.stop(); var f = $('a', cur); setTimeout(function () { f && f.focus(); }, 300); }
    else { cur.classList.remove('is-open'); if (P.lenis) P.lenis.start(); setTimeout(function () { if (mb.getAttribute('aria-expanded') === 'false') cur.hidden = true; }, 800); }
  }
  mb.addEventListener('click', function () { menu(mb.getAttribute('aria-expanded') !== 'true'); });
  cur.addEventListener('click', function (e) { if (e.target.closest('a')) menu(false); });
  D.addEventListener('keydown', function (e) { if (e.key === 'Escape' && mb.getAttribute('aria-expanded') === 'true') { menu(false); mb.focus(); } });

  /* ---------- header + sticky CTA ---------- */
  var top = $('.top'), sticky = $('.sticky-cta');
  function onScroll() {
    var y = W.scrollY; S.scroll = y;
    top.classList.toggle('is-solid', y > 40);
    var fr = $('.foot').getBoundingClientRect().top;
    sticky.classList.toggle('is-hide', fr < innerHeight || D.documentElement.classList.contains('intro-on'));
    sticky.classList.toggle('is-hero', S.view === 'home' && y < innerHeight * 0.6);
  }
  W.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  W.addEventListener('pointermove', function (e) { S.px = e.clientX / innerWidth * 2 - 1; S.py = e.clientY / innerHeight * 2 - 1; }, { passive: true });

  /* ---------- scroll choreography ---------- */
  var SRC = { base: 'media/vial.jpg', nocap: 'media/vial-nocap.jpg', cap: 'media/cap.png', front: 'media/label-front.png', back: 'media/label-back.png' };
  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(x) { return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; }
  function shape(p, a, b, c, d) { return p < a ? 0 : p < b ? (p - a) / (b - a) : p < c ? 1 : p < d ? 1 - (p - c) / (d - c) : 0; }
  function homeScroll() {
    if (!G || !ST) return;
    var mob = W.matchMedia('(max-width: 900px)');
    // hero: a slow push into the photograph
    if (!P.reduce) G.to('.hero-ph img', { scale: 1.08, yPercent: 4, ease: 'none', scrollTrigger: { trigger: '.v-home .hero', start: 'top top', end: 'bottom top', scrub: true } });

    // VIA-01 · Label Turn: scroll turns the printed label from the front mark to the back panel
    var turnSec = $('.turn'), items = $$('.turn-list li'), drift = 0, tv = 0;
    var turn = W.PEPRIG ? W.PEPRIG.create($('#rig-turn'), SRC) : null;
    ST.create({ trigger: '.turn', start: 'top top', end: 'bottom bottom', onUpdate: function (s) {
      var e = ease(clamp((s.progress - 0.06) / 0.82)); tv = e * Math.PI;
      if (turn) turn.set({ turn: tv, drift: drift });
      turnSec.style.setProperty('--turn', e.toFixed(3));
      var i = s.progress < 0.36 ? 0 : s.progress < 0.7 ? 1 : 2;
      items.forEach(function (li, k) { li.classList.toggle('is-on', k === i); });
    } });
    var stage = $('.turn-stage');
    if (!P.reduce && stage) stage.addEventListener('pointermove', function (e) { var r = stage.getBoundingClientRect(); drift = ((e.clientX - r.left) / r.width - 0.5) * 0.4; if (turn) turn.set({ turn: tv, drift: drift }); });
    if (stage) stage.addEventListener('pointerleave', function () { drift = 0; if (turn) turn.set({ turn: tv, drift: 0 }); });

    // ANA-02 · Photo Anatomy: the cap lifts off, the print peels away flat, tags name each layer
    var anat = W.PEPRIG ? W.PEPRIG.create($('#rig-anat'), SRC) : null, RG = W.PEPRIG ? W.PEPRIG.G : null;
    var tags = {}; $$('.anat-tag').forEach(function (t) { tags[t.getAttribute('data-part')] = t; });
    var hint = $('.anat-hint');
    function place(e, lift, peel) {
      if (!anat || !RG || mob.matches) return;
      var body = RG.bot - RG.top, fw = Math.min(RG.r * 0.95 / 137, body * 0.86 / 1065) * 137 * 0.5;
      var pts = {
        seal: [RG.cap.x + RG.cap.w + 6, RG.cap.y + RG.cap.h * 0.42 - lift * 230, clamp((lift - 0.35) / 0.3)],
        glass: [RG.cx + RG.r * 0.98, RG.top - 30, clamp((e - 0.45) / 0.3)],
        contents: [RG.cx + RG.r * 0.55, RG.top + body * 0.72, clamp((e - 0.55) / 0.3)],
        print: [RG.cx - RG.r * 0.1 + (-RG.r * 1.55 - fw - 6 + RG.r * 0.1) * peel, RG.top + body * 0.5, clamp((peel - 0.55) / 0.3)]
      };
      Object.keys(pts).forEach(function (k) { var t = tags[k]; if (!t) return; var q = anat.at(pts[k][0], pts[k][1]); t.style.transform = 'translate3d(' + q.x.toFixed(1) + 'px,' + q.y.toFixed(1) + 'px,0)'; t.style.opacity = pts[k][2].toFixed(3); });
    }
    function anatSet(e) { var lift = ease(clamp(e * 1.6)), peel = ease(clamp(e * 1.6 - 0.45)); if (anat) anat.set({ lift: lift, peel: peel, turn: 0 }); place(e, lift, peel); }
    ST.create({ trigger: '.anat', start: 'top top', end: 'bottom bottom', onUpdate: function (s) {
      if (mob.matches) return;
      anatSet(shape(s.progress, 0.06, 0.5, 0.84, 1)); if (hint) hint.style.opacity = Math.max(0, 1 - s.progress * 6).toFixed(2);
    } });
    // phones: no pin; it comes apart once as you reach it
    var phoneDone = false;
    ST.create({ trigger: '.anat-stage', start: 'top 70%', onEnter: function () {
      if (!mob.matches || phoneDone) return; phoneDone = true;
      var o = { e: 0 }; G.to(o, { e: 0.85, duration: P.reduce ? 0 : 2.2, ease: 'power2.inOut', onUpdate: function () { anatSet(o.e); } });
    } });
    if (anat) anat.ready.then(function () { anatSet(0); });

    // proof band: photographs drift slower than the page
    if (!P.reduce) $$('.pf-ph img').forEach(function (img) { G.fromTo(img, { yPercent: -10 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentNode, start: 'top bottom', end: 'bottom top', scrub: true } }); });

    ST.create({ trigger: '.thread', start: 'top 70%', end: 'bottom 60%', scrub: 1, onUpdate: function (s) { $('.thread').style.setProperty('--thread', (1 - s.progress).toFixed(4)); } });
    $$('.step').forEach(function (li) { ST.create({ trigger: li, start: 'top 62%', end: 'bottom 30%', toggleClass: { targets: li, className: 'is-on' } }); });
    if (!P.reduce) {
      $$('.v-home .h2').forEach(function (h) { G.from(h, { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' }, immediateRender: false }); });
      G.from('.pf', { opacity: 0, y: 60, stagger: .14, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: '.proof-grid', start: 'top 82%' }, immediateRender: false });
      G.from('.ppl li', { opacity: 0, y: 50, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ppl', start: 'top 85%' }, immediateRender: false });
      G.from('.cmp-t tbody tr', { opacity: 0, x: -24, stagger: .08, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: '.cmp-t', start: 'top 85%' }, immediateRender: false });
    }
  }
  homeScroll();

  /* ---------- router with a garnet curtain ---------- */
  var vt = el('div', 'vt'); var vtb = el('b'); vt.appendChild(vtb); vt.setAttribute('aria-hidden', 'true'); D.body.appendChild(vt);
  var names = { home: 'PEPTICITY', shop: 'Membership', science: 'The science', faq: 'Questions' };
  P.router({
    onView: function (name) {
      S.view = name; D.documentElement.setAttribute('data-page', name);
      if (ST) ST.refresh();
      if (name === 'science' && ch2) ch2.resize();
      if (name === 'home' && ch1) ch1.resize();
      onScroll();
    },
    transition: function (go, name) {
      if (!G) { go(); return; }
      vtb.textContent = names[name] || '';
      G.timeline()
        .set(vt, { clipPath: 'inset(100% 0 0 0)' })
        .to(vt, { clipPath: 'inset(0% 0 0 0)', duration: .55, ease: 'power4.inOut' })
        .to(vtb, { opacity: 1, y: 0, duration: .3 }, '-=.15')
        .add(go)
        .to(vtb, { opacity: 0, duration: .25 }, '+=.15')
        .to(vt, { clipPath: 'inset(0 0 100% 0)', duration: .6, ease: 'power4.inOut' }, '-=.1')
        .set(vt, { clipPath: 'inset(100% 0 0 0)' });
    }
  });

  /* ---------- intro: the Descent (a film dives onto the vial), then the label prints on ---------- */
  var intro = $('#intro'), film = $('.in-film', intro), H = D.documentElement;
  function printLabel(animate) {
    H.classList.remove('hp-printing');
    if (animate && !P.reduce) { void H.offsetWidth; H.classList.add('hp-printing'); requestAnimationFrame(function () { requestAnimationFrame(function () { H.classList.remove('hp-printing'); H.classList.add('hp-print'); }); }); }
  }
  P.intro({
    id: 'v6', root: intro,
    play: function (done) {
      H.classList.add('hp-printing');
      if (!G) { setTimeout(done, 300); return function () {}; }
      var tl = null, started = false;
      function go(withFilm) {
        if (started) return; started = true;
        film.classList.add('is-on');
        if (!withFilm) G.fromTo(film, { scale: 1.35, yPercent: -6 }, { scale: 1, yPercent: 0, duration: 8.4, ease: 'power2.inOut' });
        tl = G.timeline({ onComplete: done });
        tl.to('.in-line', { scaleY: 1, duration: 1.3, ease: 'power3.inOut' }, .2)
          .to('.in-kicker', { opacity: 1, duration: .8 }, 1.0)
          .to('.in-line', { opacity: 0, duration: 1 }, 3.2)
          .to('.in-word span', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: .07, ease: 'power3.out' }, 4.6)
          .to('.in-tag', { opacity: 1, duration: .9 }, 6.0)
          .to({}, { duration: 1.4 });
      }
      // film: chosen after first paint, never blocks; the still poster carries the dive if it can't play
      var conn = navigator.connection || {}, skipFilm = P.reduce || conn.saveData || /(^|-)2g$/.test(conn.effectiveType || '');
      if (!skipFilm && film) {
        var webm = film.canPlayType('video/webm; codecs="vp9"'), mp4 = film.canPlayType('video/mp4; codecs="avc1.640028"');
        film.muted = true; film.src = mp4 ? 'media/intro.mp4' : webm ? 'media/intro.webm' : '';
        if (film.src) {
          film.addEventListener('playing', function () { go(true); }, { once: true });
          film.addEventListener('error', function () { go(false); }, { once: true });
          var pr = film.play(); if (pr && pr.catch) pr.catch(function () { go(false); });
        }
      }
      setTimeout(function () { go(false); }, 1600);
      return function () { started = true; if (tl) tl.kill(); };
    },
    handoff: function (end) {
      G.to(intro, { opacity: 0, duration: .9, ease: 'power2.inOut', onComplete: function () { intro.style.opacity = ''; end(); printLabel(true); } });
    },
    onDone: function (skipped) {
      if (film) { try { film.pause(); film.removeAttribute('src'); film.load(); } catch (e) {} }
      if (skipped) printLabel(false);
      onScroll(); if (ST) ST.refresh();
    }
  });
})();

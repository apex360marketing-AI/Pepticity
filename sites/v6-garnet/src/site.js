/* Pepticity V6 · Garnet: page behaviour. 3D lives in scene.js. */
(function () {
  'use strict';
  var P = window.PEP, C = P.C, $ = P.$, $$ = P.$$, el = P.el, W = window, D = document;
  var S = W.PEPSTATE = W.PEPSTATE || { intro: 1, peel: 0, view: 'home', px: 0, py: 0, scroll: 0, hero: 1 };
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
  var mm = G && ST ? G.matchMedia() : null;
  function homeScroll() {
    if (!G || !ST) return;
    ST.create({ trigger: '.v-home .hero', start: 'top top', end: 'bottom top', onUpdate: function (s) { S.hero = 1 - s.progress; } });
    var mob = W.matchMedia('(max-width: 900px)');
    ST.create({ trigger: '.v-home .hero', start: 'top top', end: 'bottom 30%', onUpdate: function (s) { if (mob.matches) S.peel = s.progress; } });
    ST.create({ trigger: '.peel', start: 'top 85%', end: 'bottom 40%', scrub: 1, onUpdate: function (s) { if (!mob.matches) S.peel = s.progress; } });
    ST.create({ trigger: '.how', start: 'top 55%', endTrigger: '.foot', end: 'bottom bottom', toggleClass: { targets: D.documentElement, className: 'gl-dim' } });
    ST.create({ trigger: '.thread', start: 'top 70%', end: 'bottom 60%', scrub: 1, onUpdate: function (s) { $('.thread').style.setProperty('--thread', (1 - s.progress).toFixed(4)); } });
    $$('.step').forEach(function (li) { ST.create({ trigger: li, start: 'top 62%', end: 'bottom 30%', toggleClass: { targets: li, className: 'is-on' } }); });
    if (!P.reduce) {
      G.from('.peel-list li', { opacity: 0, y: 30, stagger: .14, duration: .9, ease: 'power3.out', scrollTrigger: { trigger: '.peel-list', start: 'top 80%' }, immediateRender: false });
      $$('.v-home .h2').forEach(function (h) { G.from(h, { opacity: 0, y: 40, duration: 1.1, ease: 'power3.out', scrollTrigger: { trigger: h, start: 'top 88%' }, immediateRender: false }); });
      G.from('.ppl li', { opacity: 0, y: 50, stagger: .12, duration: 1, ease: 'power3.out', scrollTrigger: { trigger: '.ppl', start: 'top 85%' }, immediateRender: false });
      G.from('.cmp-t tbody tr', { opacity: 0, x: -24, stagger: .08, duration: .7, ease: 'power2.out', scrollTrigger: { trigger: '.cmp-t', start: 'top 85%' }, immediateRender: false });
    }
  }
  homeScroll();

  /* ---------- router with a garnet curtain ---------- */
  var vt = el('div', 'vt'); var vtb = el('b'); vt.appendChild(vtb); vt.setAttribute('aria-hidden', 'true'); D.body.appendChild(vt);
  var names = { home: 'Pepticity', shop: 'Membership', science: 'The science', faq: 'Questions' };
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

  /* ---------- intro: hairline, vial, lot, wordmark, curtain lift ---------- */
  var intro = $('#intro');
  P.intro({
    id: 'v6', root: intro,
    play: function (done) {
      S.intro = 0;
      if (!G) { S.intro = 1; setTimeout(done, 300); return function () {}; }
      var o = { t: 0 };
      var tl = G.timeline({ onComplete: done });
      tl.to('.in-line', { scaleY: 1, duration: 1.3, ease: 'power3.inOut' }, .2)
        .to('.in-kicker', { opacity: 1, duration: .8 }, 1.0)
        .to(o, { t: 1, duration: 4.4, ease: 'power2.inOut', onUpdate: function () { S.intro = o.t; } }, .9)
        .to('.in-line', { opacity: 0, duration: 1 }, 2.6)
        .to('.in-word span', { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, stagger: .07, ease: 'power3.out' }, 3.3)
        .to('.in-tag', { opacity: 1, duration: .9 }, 4.8)
        .to({}, { duration: .9 });
      return function () { tl.kill(); S.intro = 1; };
    },
    handoff: function (end) {
      intro.classList.add('is-lift');
      setTimeout(function () { intro.classList.remove('is-lift'); end(); }, 1150);
    },
    onDone: function () { S.intro = 1; onScroll(); if (ST) ST.refresh(); }
  });
})();

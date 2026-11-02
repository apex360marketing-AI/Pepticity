/* PEPTICITY shared core (V6–V8).
   Copy, routing, audience switcher, assessment, lot lookup, red-flag checker,
   receipt, text size and smooth scroll. Each site styles the markup its own way.
   Compliance: no dosing, no outcome claims, no reviews or invented numbers.
   Anything Grace has not decided yet stays in [brackets]. */
(function () {
  'use strict';
  var W = window, D = document;
  var reduce = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var store = {
    get: function (k) { try { return W.localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { W.localStorage.setItem(k, v); } catch (e) {} },
    sget: function (k) { try { return W.sessionStorage.getItem(k); } catch (e) { return null; } },
    sset: function (k, v) { try { W.sessionStorage.setItem(k, v); } catch (e) {} }
  };
  function $(s, r) { return (r || D).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
  function el(tag, cls, txt) { var n = D.createElement(tag); if (cls) n.className = cls; if (txt != null) n.textContent = txt; return n; }

  /* ---------------- content ---------------- */
  var C = {
    phone: '[phone number]',
    aud: {
      all: { label: 'Show me everything', short: 'Everyone',
        hero: 'Peptide care you can verify.',
        sub: 'A licensed clinician decides if a plan is right for you. A licensed partner pharmacy prepares it. Every vial carries a lot code you can look up.',
        cta: 'Start the 60-second assessment' },
      longevity: { label: 'Healthy aging', short: '55+',
        hero: 'Clinician-guided peptide care, built around the life you want to keep living.',
        sub: 'Plain answers, a medication review with a licensed clinician, and a real person on the phone at [phone number].',
        cta: 'Start my free healthy-aging review' },
      energy: { label: 'Not feeling like myself', short: 'Energy',
        hero: 'Tell a licensed clinician what feels off. Start with a free review.',
        sub: 'No pressure and no payment to start. A clinician listens, may ask for labs, and decides what fits.',
        cta: 'Talk it through: free review' },
      women: { label: 'Women 40+', short: 'Women 40+',
        hero: "Peptide care with clinicians who know midlife women's health.",
        sub: 'Be heard first. One all-in price, shown before you pay, and clinicians you can look up.',
        cta: 'Start my free review' },
      men: { label: 'Men 35+', short: 'Men 35+',
        hero: 'Know your numbers first. A licensed clinician decides what fits.',
        sub: 'Labs before anything is prescribed, named pharmacy sourcing, and a lot certificate for every vial.',
        cta: 'Start with a free review' },
      training: { label: 'Training & recovery', short: 'Training',
        hero: 'Pharmacy-prepared, lot-tested, and reviewed by a clinician.',
        sub: 'Real pharmacy. Real prescription. Real people. Nothing sold "for research use only".',
        cta: 'Get my free review' }
    },
    audOrder: ['all', 'longevity', 'energy', 'women', 'men', 'training'],
    steps: [
      { n: '01', t: 'Take the 60-second assessment', b: 'Your goals, your age range and the medicines you take. No payment and no commitment.' },
      { n: '02', t: 'A licensed clinician reviews it', b: 'A licensed clinician reads your answers, may ask for labs, and decides if a plan is right for you.' },
      { n: '03', t: 'A plan is written, or it isn\'t', b: 'If peptides aren\'t right for you, the clinician tells you, and you pay nothing. [Confirm policy with Grace]' },
      { n: '04', t: 'A licensed partner pharmacy prepares it', b: 'Prescriptions are filled by a licensed partner pharmacy, never a research-chemical supplier.' },
      { n: '05', t: 'Every lot is tested', b: 'Each lot gets a certificate of analysis. Look it up with the lot code printed on your vial.' },
      { n: '06', t: 'Cold-chain delivery, then ongoing care', b: 'Shipped cold to your door, with follow-ups and a person to call at [phone number].' }
    ],
    compare: [
      ['Who decides', 'A licensed clinician', 'Nobody. You choose.'],
      ['Where it is made', 'A licensed partner pharmacy', 'Unknown source, sold "not for human use"'],
      ['Proof', 'A lot code you can look up', 'A generic certificate, if any'],
      ['Price', 'The full price before you pay', 'Add-ons at checkout'],
      ['Help', 'A person at [phone number]', 'An email form'],
      ['Status', 'A prescription service', 'Sold as a research chemical']
    ],
    flags: [
      'Is it sold "for research use only" or "not for human use"?',
      'Can you buy it without anyone reviewing your health?',
      'Does the site give dosing advice, cycles or "stacks"?',
      'Is there no named pharmacy or licence you can check?',
      'Is there no lot number you can look up?',
      'Does it promise health results?',
      'Is the full price unclear until checkout?',
      'Is there no phone number with a real person behind it?'
    ],
    faq: [
      ['What is PEPTICITY?', 'A clinician-guided peptide care service. You take a short assessment, a licensed clinician reviews it, and if a plan is right for you, a licensed partner pharmacy prepares it.'],
      ['Do I need a prescription?', 'Yes. Every plan is prescribed by a licensed clinician after a review. Nothing here is sold "for research use".'],
      ['Who are the clinicians?', '[Clinician network: confirm with Grace]. Each clinician\'s licence can be checked with their state or provincial board.'],
      ['Who prepares it?', 'A licensed partner pharmacy: [pharmacy name: confirm with Grace].'],
      ['How do I know what is in my vial?', 'Every vial has a lot code. Enter it in the lot lookup to see that lot\'s certificate of analysis.'],
      ['What does it cost?', 'Membership is $[xx] a month, all-in. You see the full price before you pay. [Confirm pricing with Grace]'],
      ['What if peptides aren\'t right for me?', 'Then the clinician tells you so, and you pay nothing. [Confirm policy with Grace]'],
      ['Where do you ship?', '[States and provinces at launch: confirm with Grace]. If you are outside them, you can join the waitlist.'],
      ['Can I cancel?', 'Yes, in two clicks from your account. No phone call needed.'],
      ['Will this site tell me how to use anything?', 'No. Your plan, and every instruction that goes with it, comes from your clinician.']
    ],
    plans: [
      { id: 'review', name: 'Free review', price: '$0', per: '', pts: ['The 60-second assessment', 'A licensed clinician reviews it', 'A clear yes or no, with reasons'], cta: 'Start my free review' },
      { id: 'member', name: 'Membership', price: '$[xx]', per: '/ month', pts: ['Clinician care and follow-ups', 'Pharmacy-prepared plan, if prescribed', 'Cold-chain shipping', 'A lot certificate for every vial', 'Cancel in two clicks'], cta: 'Start with the review', star: true },
      { id: 'annual', name: 'Annual', price: '$[xx]', per: '/ year', pts: ['Everything in Membership', '[Annual saving: confirm with Grace]', 'Bring a family member: [offer: confirm with Grace]'], cta: 'Start with the review' }
    ],
    receipt: [
      ['Assessment', '$0.00'], ['Clinician review', '$0.00'], ['Lab coordination', '$[0.00]'],
      ['Pharmacy preparation', 'Included'], ['Cold-chain shipping', '$[0.00]'], ['Lot certificate', 'Included']
    ],
    clinicians: [
      { n: '[Clinician name], [credential]', r: '[Focus: midlife women\'s health]', l: '[State] licence [number]' },
      { n: '[Clinician name], [credential]', r: '[Focus: healthy aging]', l: '[State] licence [number]' },
      { n: '[Clinician name], [credential]', r: '[Focus: men\'s health and labs]', l: '[State] licence [number]' },
      { n: '[Clinician name], [credential]', r: '[Focus: sports medicine]', l: '[State] licence [number]' }
    ],
    lots: {
      'PX-2611-A': { date: '[release date]', pharmacy: '[Partner pharmacy]', lab: '[Independent lab]', identity: 'Pass', purity: '[xx.x]%', sterility: '[result]', endotoxin: '[result]' },
      'PX-2610-C': { date: '[release date]', pharmacy: '[Partner pharmacy]', lab: '[Independent lab]', identity: 'Pass', purity: '[xx.x]%', sterility: '[result]', endotoxin: '[result]' },
      'PX-2609-B': { date: '[release date]', pharmacy: '[Partner pharmacy]', lab: '[Independent lab]', identity: 'Pass', purity: '[xx.x]%', sterility: '[result]', endotoxin: '[result]' }
    }
  };

  /* ---------------- quiz schema: fork first (fitness or overall health), then about you ---------------- */
  var STAGES = ['GOAL', 'ABOUT YOU', 'HEALTH', 'YOUR CARE'];
  var Q = {
    questions: [
      { id: 'focus', stage: 0, title: 'What are you looking into peptides for?', help: 'Pick the closest one. It only decides which questions come next.', options: [
        ['fitness', 'Fitness, training and recovery'], ['health', 'Overall health and wellbeing'], ['unsure', "I'm not sure yet. Show me how it works"]],
        next: function (a) { return a.focus === 'fitness' ? 'activity' : a.focus === 'health' ? 'health_goal' : 'age'; } },
      { id: 'activity', stage: 0, title: 'How active are you right now?', help: 'There is no wrong answer. You do not need a routine to start.', options: [
        ['0', "I don't work out right now"], ['1', '1 to 2 days a week'], ['3', '3 to 4 days a week'], ['5', '5 or more days a week']],
        next: function () { return 'fit_goal'; } },
      { id: 'fit_goal', stage: 0, title: 'What would you most like to talk to a clinician about?', options: [
        ['recover', 'Recovering well between sessions'], ['start', 'Getting started, or getting back into it'], ['aging', 'Staying active as I get older'], ['other', 'Something else']],
        next: function () { return 'age'; } },
      { id: 'health_goal', stage: 0, title: 'What would you most like to talk to a clinician about?', options: [
        ['longevity', 'Healthy aging and staying independent'], ['energy', 'Energy, or not feeling like myself'], ['women', "Women's health in midlife"], ['men', "Men's health and knowing my numbers"], ['all', 'Something else']],
        next: function () { return 'age'; } },
      { id: 'age', stage: 1, title: 'Which age range are you in?', options: [['18', '18 to 34'], ['35', '35 to 44'], ['45', '45 to 54'], ['55', '55 to 64'], ['65', '65 to 74'], ['75', '75 or over'], ['minor', 'Under 18']],
        next: function (a) { return a.age === 'minor' ? '@stop' : 'meds'; } },
      { id: 'meds', stage: 2, title: 'Do you take any prescription medicines?', help: 'A clinician will review this with you. It does not rule you out.', options: [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']], next: function () { return 'talk'; } },
      { id: 'talk', stage: 3, title: 'How would you like to talk with a clinician?', options: [['phone', 'A phone call'], ['video', 'A video visit'], ['message', 'Secure messages']], next: function () { return '@result'; } }
    ],
    // a short bridge line above the next question, so it feels like being walked through, not filling in a form
    lead: {
      activity: function () { return 'Fitness it is. A few quick questions about where you are starting from.'; },
      health_goal: function () { return 'Overall health it is. Tell us what is on your mind.'; },
      age: function (a) { return a.activity === '0' ? 'Starting from zero is completely fine. Now a little about you.' : a.focus === 'unsure' ? "No problem. We'll keep it simple." : 'Thanks. Now a little about you.'; },
      meds: function () { return 'Almost there. Two questions about your health and how you like to talk.'; },
      talk: function () { return 'Last one.'; }
    },
    results: {
      longevity: ['Your path: a healthy-aging review', 'A licensed clinician reviews your goals with your current medicines in mind, and decides if a plan is right for you.'],
      energy: ['Your path: a talk-it-through review', 'Tell a licensed clinician what feels off. They may ask for labs first, then decide if a plan is right for you.'],
      women: ["Your path: a midlife women's health review", 'A licensed clinician who works with midlife women reviews your answers and decides if a plan is right for you.'],
      men: ['Your path: a labs-first review', 'A licensed clinician reviews your answers and may order labs before deciding if a plan is right for you.'],
      training: ['Your path: a training and recovery review', 'A licensed clinician reviews your training and medicines, and decides if a plan is right for you.'],
      start: ['Your path: a getting-started review', 'A licensed clinician looks at where you are starting from and the medicines you take, and decides if a plan is right for you.'],
      all: ['Your path: a clinician review', 'A licensed clinician reviews your answers, explains your options in plain English, and decides if a plan is right for you.']
    }
  };
  function pathOf(a) {
    if (a.focus === 'fitness') return a.fit_goal === 'aging' ? 'longevity' : a.fit_goal === 'start' ? 'start' : 'training';
    if (a.focus === 'health') return a.health_goal || 'all';
    return 'all';
  }

  /* ---------------- smooth scroll ---------------- */
  var lenis = null;
  function smooth() {
    var hasG = W.gsap && W.ScrollTrigger;
    if (hasG) W.gsap.registerPlugin(W.ScrollTrigger);
    if (!reduce && W.Lenis) {
      lenis = new W.Lenis({ lerp: 0.09, smoothWheel: true });
      if (hasG) {
        lenis.on('scroll', W.ScrollTrigger.update);
        W.gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
        W.gsap.ticker.lagSmoothing(0);
      } else {
        var loop = function (t) { lenis.raf(t); requestAnimationFrame(loop); }; requestAnimationFrame(loop);
      }
    }
    if (hasG && D.fonts && D.fonts.ready) D.fonts.ready.then(function () { W.ScrollTrigger.refresh(); });
    return lenis;
  }
  function scrollToEl(t, off) {
    if (!t) return;
    off = off || 0;
    if (lenis) lenis.scrollTo(t, { offset: off, duration: 1.2 });
    else W.scrollTo({ top: t.getBoundingClientRect().top + W.scrollY + off, behavior: reduce ? 'auto' : 'smooth' });
  }

  /* ---------------- router: one hash per page (#home #how #science #shop #faq), deep links to sections ---------------- */
  var VIEWS = ['home', 'shop', 'science', 'faq'];   // a site can pass its own list to router({ views })
  var cur = null, onView = null, transition = null, pend = null;
  function viewOf(id) { var t = id && D.getElementById(id), v = t && t.closest('[data-view]'); return v ? { el: t, view: v.getAttribute('data-view') } : null; }
  function flushPend() { var t = pend; pend = null; if (t) setTimeout(function () { scrollToEl(t, -90); }, 80); }
  function show(name, first) {
    if (VIEWS.indexOf(name) < 0) name = 'home';
    if (name === cur) { flushPend(); return; }
    var prev = cur; cur = name;
    var go = function () {
      $$('[data-view]:not(html)').forEach(function (v) { v.hidden = v.getAttribute('data-view') !== name; });
      $$('[data-nav]').forEach(function (a) { var on = a.getAttribute('data-nav') === name; a.classList.toggle('is-on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true }); else W.scrollTo(0, 0);
      if (W.ScrollTrigger) W.ScrollTrigger.refresh();
      if (onView) onView(name, prev, !!first);
      var h = $('[data-view="' + name + '"] h1, [data-view="' + name + '"] h2');
      if (h && !first && !pend) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      flushPend();
    };
    if (first || !transition || reduce) go(); else transition(go, name, prev);
  }
  function route(h) {
    if (h === 'intro') { introReplay(); return; }
    if (VIEWS.indexOf(h) >= 0) { show(h); return; }
    var t = viewOf(h); if (t) { pend = t.el; show(t.view); }
  }
  function router(opts) {
    onView = opts && opts.onView; transition = opts && opts.transition;
    if (opts && opts.views) VIEWS = opts.views;
    W.addEventListener('hashchange', function () { route(location.hash.slice(1)); });
    D.addEventListener('click', function (e) {
      var s = e.target.closest('[data-scroll]');
      if (s) {
        e.preventDefault();
        var t = $(s.getAttribute('data-scroll')), go = s.getAttribute('data-view-go') || (t && t.closest('[data-view]') ? t.closest('[data-view]').getAttribute('data-view') : cur);
        pend = t; if (go !== cur) location.hash = go; else flushPend();
        return;
      }
      // a link to the page you are already on, or to #intro: act on it instead of doing nothing
      var a = e.target.closest('a[href^="#"]'), h = a && a.getAttribute('href').slice(1);
      if (h === 'intro') { e.preventDefault(); introReplay(); }
      else if (h && h === cur) { e.preventDefault(); if (lenis) lenis.scrollTo(0, { duration: 1.1 }); else W.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); }
    });
    var h = location.hash.slice(1), t = VIEWS.indexOf(h) < 0 && viewOf(h);
    if (t) pend = t.el;
    show(VIEWS.indexOf(h) >= 0 ? h : t ? t.view : 'home', true);
  }

  /* ---------------- audience switcher ---------------- */
  var aud = 'all', audListeners = [];
  function setAud(key, user) {
    if (!C.aud[key]) key = 'all';
    aud = key;
    D.documentElement.setAttribute('data-aud', key);
    var a = C.aud[key];
    $$('[data-aud-text]').forEach(function (n) { var f = n.getAttribute('data-aud-text'); if (a[f] != null) n.textContent = a[f]; });
    $$('[data-aud-option]').forEach(function (b) { var on = b.getAttribute('data-aud-option') === key; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.tabIndex = on ? 0 : -1; });
    if (user) store.set('pep-aud', key);
    audListeners.forEach(function (f) { f(key, a); });
  }
  function audience(onChange) {
    if (onChange) audListeners.push(onChange);
    $$('[data-aud-group]').forEach(function (g) {
      if (g.childElementCount) return;
      g.setAttribute('role', 'radiogroup');
      if (!g.getAttribute('aria-label')) g.setAttribute('aria-label', "I'm here for");
      C.audOrder.forEach(function (k) {
        var b = el('button', 'aud-opt'); b.type = 'button'; b.setAttribute('role', 'radio'); b.setAttribute('data-aud-option', k);
        var s1 = el('span', 'aud-l', C.aud[k].label); b.appendChild(s1); g.appendChild(b);
      });
      g.addEventListener('click', function (e) { var b = e.target.closest('[data-aud-option]'); if (b) setAud(b.getAttribute('data-aud-option'), true); });
      g.addEventListener('keydown', function (e) {
        if (['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'].indexOf(e.key) < 0) return;
        e.preventDefault();
        var i = C.audOrder.indexOf(aud) + (e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : -1);
        i = (i + C.audOrder.length) % C.audOrder.length; setAud(C.audOrder[i], true);
        var b = g.querySelector('[data-aud-option="' + C.audOrder[i] + '"]'); if (b) b.focus();
      });
    });
    var q = null; try { q = new URLSearchParams(location.search).get('for'); } catch (e) {}
    setAud(q && C.aud[q] ? q : (store.get('pep-aud') || 'all'));
  }

  /* ---------------- assessment (dialog): guided, branching, resumable ---------------- */
  var dlg = null, openQuiz = function () {};
  function nextDays(n) {
    var out = [], d = new Date(); d.setHours(12, 0, 0, 0);
    while (out.length < n) { d.setDate(d.getDate() + 1); var w = d.getDay(); if (w !== 0 && w !== 6) out.push(new Date(d)); }
    return out;
  }
  function quiz() {
    dlg = $('#pep-quiz');
    if (!dlg) return;
    var body = $('.pq-body', dlg), bar = $('.pq-bar i', dlg), step = $('.pq-step', dlg);
    var KEY = 'pep-quiz-v2', answers = {}, hist = [], byId = {};
    Q.questions.forEach(function (q) { byId[q.id] = q; });
    function save() { store.set(KEY, JSON.stringify({ a: answers, h: hist, t: Date.now() })); }
    function load() { try { var s = JSON.parse(store.get(KEY) || 'null'); return s && s.h && s.h.length && Date.now() - s.t < 7 * 864e5 ? s : null; } catch (e) { return null; } }
    function clearSaved() { store.set(KEY, ''); }
    function label(qid, v) { var q = byId[qid], o = q && q.options.filter(function (x) { return x[0] === v; })[0]; return o ? o[1] : String(v); }
    function total() { var n = 0, id = 'focus', g = 0, a = Object.assign({ focus: 'health' }, answers); while (id && id.charAt(0) !== '@' && g++ < 12) { n++; id = byId[id].next(a); } return n; }
    function close() { if (dlg.open) dlg.close(); if (lenis) lenis.start(); }
    function enter() { body.classList.remove('is-in'); void body.offsetWidth; body.classList.add('is-in'); }
    function header(stage) {
      var st = el('ol', 'pq-stages'); st.setAttribute('aria-label', 'Steps');
      STAGES.forEach(function (s, i) { var li = el('li', i < stage ? 'is-done' : i === stage ? 'is-on' : '', s); if (i === stage) li.setAttribute('aria-current', 'step'); st.appendChild(li); });
      body.appendChild(st);
      if (hist.length) {
        var tr = el('div', 'pq-trail'); tr.setAttribute('role', 'group'); tr.setAttribute('aria-label', 'Your answers so far. Select one to change it.');
        hist.forEach(function (qid) { var b = el('button', 'pq-crumb', label(qid, answers[qid])); b.type = 'button'; b.title = 'Change this answer'; b.onclick = function () { hist = hist.slice(0, hist.indexOf(qid)); save(); render(qid); }; tr.appendChild(b); });
        body.appendChild(tr);
      }
    }
    function render(id) {
      body.textContent = ''; enter();
      if (id === '@stop') {
        step.textContent = ''; bar.style.transform = 'scaleX(1)';
        var hs = el('h3', 'pq-q', 'This service is for adults 18 and over.'); hs.tabIndex = -1; body.appendChild(hs);
        body.appendChild(el('p', 'pq-help', 'If you have questions, call ' + C.phone + '.'));
        var b = el('button', 'pq-btn', 'Close'); b.type = 'button'; b.onclick = function () { clearSaved(); close(); }; body.appendChild(b);
        setTimeout(function () { hs.focus(); }, 30); return;
      }
      if (id === '@result') return result();
      var q = byId[id], idx = hist.length + 1, tot = Math.max(idx, total());
      step.textContent = 'Question ' + idx + ' of ' + tot;
      bar.style.transform = 'scaleX(' + ((idx - 1) / tot).toFixed(3) + ')';
      header(q.stage);
      var ld = hist.length && Q.lead[id] ? Q.lead[id](answers) : ''; if (ld) body.appendChild(el('p', 'pq-lead', ld));
      var h = el('h3', 'pq-q', q.title); h.id = 'pq-q-' + q.id; h.tabIndex = -1; body.appendChild(h);
      if (q.help) body.appendChild(el('p', 'pq-help', q.help));
      var list = el('div', 'pq-opts'); list.setAttribute('role', 'group'); list.setAttribute('aria-labelledby', h.id);
      var busy = false;
      q.options.forEach(function (o) {
        var b = el('button', 'pq-opt'); b.type = 'button'; b.appendChild(el('span', 'pq-opt-t', o[1]));
        if (answers[q.id] === o[0]) b.classList.add('is-on');
        b.onclick = function () {
          if (busy) return; busy = true;
          $$('.pq-opt', list).forEach(function (x) { x.classList.toggle('is-on', x === b); });
          answers[q.id] = o[0]; hist.push(q.id); save();
          setTimeout(function () { render(q.next(answers)); }, reduce ? 0 : 260);   // see the tick, then move on
        };
        list.appendChild(b);
      });
      body.appendChild(list);
      if (hist.length) { var back = el('button', 'pq-back', 'Back'); back.type = 'button'; back.onclick = function () { var last = hist.pop(); save(); render(last); }; body.appendChild(back); }
      setTimeout(function () { h.focus(); }, 30);
    }
    function result() {
      var path = pathOf(answers), r = Q.results[path] || Q.results.all;
      setAud(path === 'start' ? 'training' : path, true);
      bar.style.transform = 'scaleX(1)'; step.textContent = 'Your result';
      header(4);
      body.appendChild(el('p', 'pq-lead', 'Thanks. Here is where we would take you.'));
      var h = el('h3', 'pq-q', r[0]); h.tabIndex = -1; body.appendChild(h);
      body.appendChild(el('p', 'pq-help', r[1]));
      var how = { phone: 'by phone', video: 'by video', message: 'by secure message' }[answers.talk] || 'in the way you prefer';
      var nx = el('ol', 'pq-next');
      [['A free review with a licensed clinician, ' + how + '.'], ['Labs, only if your clinician asks for them.'], ['A clear yes or no, with the reasons. If it is a no, you pay nothing. [Confirm policy with Grace]']].forEach(function (t) { nx.appendChild(el('li', '', t[0])); });
      var nh = el('p', 'pq-sub', 'What happens next'); body.appendChild(nh); body.appendChild(nx);
      var f = el('form', 'pq-form'); f.noValidate = true;
      var lab = el('label', 'pq-label'); lab.appendChild(el('span', '', 'Email me my path'));
      var inp = el('input', 'pq-input'); inp.type = 'email'; inp.name = 'email'; inp.autocomplete = 'email'; inp.required = true; inp.placeholder = 'you@example.com';
      lab.appendChild(inp); f.appendChild(lab);
      var err = el('p', 'pq-err'); err.setAttribute('role', 'alert'); f.appendChild(err);
      var pick = { d: null, t: null };
      if (answers.talk !== 'message') {
        f.appendChild(el('p', 'pq-sub', 'Pick a time for your free call (optional)'));
        var days = el('div', 'pq-days'), times = el('div', 'pq-times');
        nextDays(5).forEach(function (d) {
          var b = el('button', 'pq-chip'); b.type = 'button'; b.textContent = d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); b.setAttribute('aria-pressed', 'false');
          b.onclick = function () { pick.d = b.textContent; $$('.pq-days .pq-chip', f).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); };
          days.appendChild(b);
        });
        ['9:30 am', '11:00 am', '1:30 pm', '3:00 pm', '4:30 pm'].forEach(function (t) {
          var b = el('button', 'pq-chip', t); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
          b.onclick = function () { pick.t = t; $$('.pq-times .pq-chip', f).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); };
          times.appendChild(b);
        });
        f.appendChild(days); f.appendChild(times);
      }
      var cl = el('label', 'pq-consent'); var cb = el('input'); cb.type = 'checkbox'; cb.name = 'updates'; cl.appendChild(cb); cl.appendChild(el('span', '', 'Also send me occasional updates from PEPTICITY (optional)')); f.appendChild(cl);
      var sb = el('button', 'pq-btn', 'Email me my path'); sb.type = 'submit'; f.appendChild(sb);
      f.appendChild(el('p', 'pq-fine', 'A licensed clinician decides if a plan is right for you. This is not medical advice. Prefer to talk? Call ' + C.phone + '.'));
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim())) { err.textContent = 'Please enter an email address like name@example.com.'; inp.setAttribute('aria-invalid', 'true'); inp.focus(); return; }
        inp.removeAttribute('aria-invalid'); clearSaved();
        body.textContent = ''; enter();
        var ok = el('h3', 'pq-q', 'Preview only: nothing was sent.'); ok.tabIndex = -1; body.appendChild(ok);
        body.appendChild(el('p', 'pq-help', 'On the live site, your path goes to ' + inp.value.trim() + (pick.d && pick.t ? ', and the care team calls you ' + pick.d + ' at ' + pick.t + '.' : '.')));
        var c = el('button', 'pq-btn', 'Close'); c.type = 'button'; c.onclick = close; body.appendChild(c);
        setTimeout(function () { ok.focus(); }, 30);
      });
      body.appendChild(f);
      setTimeout(function () { h.focus(); }, 30);
    }
    function resume(s) {
      body.textContent = ''; enter(); step.textContent = ''; bar.style.transform = 'scaleX(0)';
      var h = el('h3', 'pq-q', 'Pick up where you left off?'); h.tabIndex = -1; body.appendChild(h);
      body.appendChild(el('p', 'pq-help', 'Your answers are saved on this device only.'));
      var row = el('div', 'pq-opts');
      var r = el('button', 'pq-opt is-on'); r.type = 'button'; r.appendChild(el('span', 'pq-opt-t', 'Resume'));
      r.onclick = function () { answers = s.a || {}; hist = s.h || []; var last = byId[hist[hist.length - 1]]; render(last ? last.next(answers) : 'focus'); };
      var n = el('button', 'pq-opt'); n.type = 'button'; n.appendChild(el('span', 'pq-opt-t', 'Start over'));
      n.onclick = function () { clearSaved(); answers = {}; hist = []; render('focus'); };
      row.appendChild(r); row.appendChild(n); body.appendChild(row);
      setTimeout(function () { h.focus(); }, 30);
    }
    openQuiz = function (start) {
      answers = {}; hist = [];
      if (typeof dlg.showModal === 'function') { if (!dlg.open) dlg.showModal(); } else dlg.setAttribute('open', '');
      if (lenis) lenis.stop();
      if (start === 'fitness' || start === 'health' || start === 'unsure') { answers.focus = start; hist = ['focus']; save(); return render(byId.focus.next(answers)); }
      var saved = load(); if (saved) return resume(saved);
      if (aud === 'training') { answers.focus = 'fitness'; hist = ['focus']; return render('activity'); }
      if (aud !== 'all' && C.aud[aud]) { answers.focus = 'health'; answers.health_goal = aud; hist = ['focus', 'health_goal']; return render('age'); }
      render('focus');
    };
    D.addEventListener('click', function (e) { var t = e.target.closest('[data-quiz]'); if (t) { e.preventDefault(); openQuiz(t.getAttribute('data-quiz') || null); } });
    $$('.pq-close', dlg).forEach(function (b) { b.addEventListener('click', close); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) close(); });
    dlg.addEventListener('close', function () { if (lenis) lenis.start(); });
  }

  /* ---------------- red-flag checker ---------------- */
  function flags(root) {
    if (!root) return;
    var list = $('.rf-list', root), out = $('.rf-out', root), ans = {};
    C.flags.forEach(function (q, i) {
      var row = el('div', 'rf-row'); row.setAttribute('role', 'group');
      var t = el('p', 'rf-q', q); t.id = 'rf-' + i; row.setAttribute('aria-labelledby', t.id); row.appendChild(t);
      var g = el('div', 'rf-yn');
      ['Yes', 'No'].forEach(function (lbl) {
        var b = el('button', 'rf-b', lbl); b.type = 'button'; b.setAttribute('aria-pressed', 'false');
        b.onclick = function () { ans[i] = lbl === 'Yes'; $$('.rf-b', g).forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); }); row.classList.toggle('is-flag', ans[i]); score(); };
        g.appendChild(b);
      });
      row.appendChild(g); list.appendChild(row);
    });
    function score() {
      var n = 0, a = 0; for (var k in ans) { a++; if (ans[k]) n++; }
      root.style.setProperty('--rf', n / C.flags.length);
      var msg = a < C.flags.length ? ('Answered ' + a + ' of ' + C.flags.length + '. Red flags so far: ' + n + '.')
        : n === 0 ? 'No red flags from your answers. Still ask for the pharmacy licence and a lot certificate before you buy.'
          : n <= 2 ? n + ' red flag' + (n > 1 ? 's' : '') + '. Ask the seller to answer them in writing before you buy.'
            : n + ' red flags. We would walk away from this seller.';
      out.textContent = msg; root.setAttribute('data-rf', n);
    }
    score();
  }

  /* ---------------- lot lookup ---------------- */
  function lots(root, onShow) {
    if (!root) return;
    var f = $('form', root), inp = $('input', root), out = $('.lot-out', root);
    $$('[data-lot]', root).forEach(function (b) { b.addEventListener('click', function () { inp.value = b.getAttribute('data-lot'); look(); }); });
    function look() {
      var code = inp.value.trim().toUpperCase(), L = C.lots[code];
      out.textContent = '';
      if (!L) {
        out.appendChild(el('p', 'lot-miss', code ? 'No lot "' + code + '" in the sample data. Try ' + Object.keys(C.lots).join(', ') + '.' : 'Type the lot code printed on your vial.'));
        if (onShow) onShow(null); return;
      }
      var h = el('p', 'lot-h'); h.appendChild(el('span', 'lot-code', code)); h.appendChild(el('span', 'lot-tag', 'SAMPLE')); out.appendChild(h);
      var dl = el('dl', 'lot-dl');
      [['Released', L.date], ['Prepared by', L.pharmacy], ['Tested by', L.lab], ['Identity', L.identity], ['Purity', L.purity], ['Sterility', L.sterility], ['Endotoxin', L.endotoxin]].forEach(function (r) {
        var d = el('div'); d.appendChild(el('dt', '', r[0])); d.appendChild(el('dd', '', r[1])); dl.appendChild(d);
      });
      out.appendChild(dl);
      out.appendChild(el('p', 'lot-fine', 'Sample data for the preview. The live site shows each lot\'s real certificate of analysis.'));
      if (onShow) onShow(code);
    }
    f.addEventListener('submit', function (e) { e.preventDefault(); look(); });
  }

  /* ---------------- chromatogram (canvas, illustrative) ---------------- */
  function chroma(canvas, opts) {
    if (!canvas) return null;
    opts = opts || {};
    var ctx = canvas.getContext('2d'), w, h, dpr, seed = 1, scrub = 0.62, vis = true, raf = 0, t0 = performance.now();
    var peaks = [[0.18, 0.08, 0.012], [0.33, 0.12, 0.016], [0.52, 1, 0.014], [0.71, 0.1, 0.02], [0.84, 0.05, 0.015]];
    function size() { dpr = Math.min(W.devicePixelRatio || 1, 2); var r = canvas.getBoundingClientRect(); w = r.width; h = r.height; canvas.width = w * dpr; canvas.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0); }
    function y(x) { var v = 0.02; for (var i = 0; i < peaks.length; i++) { var p = peaks[i]; v += p[1] * Math.exp(-Math.pow(x - p[0], 2) / (2 * p[2] * p[2])); } return v; }
    function draw(now) {
      raf = 0; if (!vis || !w) return;
      ctx.clearRect(0, 0, w, h);
      var pad = 28, gw = w - pad * 2, gh = h - pad * 2;
      ctx.strokeStyle = opts.grid || 'rgba(255,255,255,.08)'; ctx.lineWidth = 1;
      for (var g = 0; g <= 4; g++) { var gy = pad + gh * g / 4; ctx.beginPath(); ctx.moveTo(pad, gy); ctx.lineTo(pad + gw, gy); ctx.stroke(); }
      var reveal = reduce ? 1 : Math.min(1, (now - t0) / 1600);
      ctx.beginPath();
      for (var i = 0; i <= 400 * reveal; i++) { var x = i / 400, yy = pad + gh - y(x) * gh * 0.92; if (i) ctx.lineTo(pad + x * gw, yy); else ctx.moveTo(pad, yy); }
      ctx.strokeStyle = opts.line || '#fff'; ctx.lineWidth = 2; ctx.shadowColor = opts.glow || 'transparent'; ctx.shadowBlur = 12; ctx.stroke(); ctx.shadowBlur = 0;
      var sx = pad + scrub * gw, sv = y(scrub);
      ctx.strokeStyle = opts.scrub || 'rgba(255,255,255,.5)'; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(sx, pad); ctx.lineTo(sx, pad + gh); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = opts.dot || '#fff'; ctx.beginPath(); ctx.arc(sx, pad + gh - sv * gh * 0.92, 5, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = opts.text || 'rgba(255,255,255,.7)'; ctx.font = '12px ' + (opts.font || 'monospace');
      ctx.fillText('t = ' + (scrub * 20).toFixed(1) + ' min', Math.min(sx + 8, w - 110), pad + 14);
      ctx.fillText('SAMPLE · illustrative', pad, h - 8);
      if (reveal < 1) raf = requestAnimationFrame(draw);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(draw); }
    function setScrub(clientX) { var r = canvas.getBoundingClientRect(); scrub = Math.max(0, Math.min(1, (clientX - r.left - 28) / (r.width - 56))); kick(); }
    canvas.addEventListener('pointermove', function (e) { setScrub(e.clientX); }, { passive: true });
    canvas.addEventListener('pointerdown', function (e) { setScrub(e.clientX); }, { passive: true });
    canvas.tabIndex = 0; canvas.setAttribute('role', 'img'); canvas.setAttribute('aria-label', 'Illustrative chromatogram with one main peak. Sample data. Use the left and right arrow keys to move the marker.');
    canvas.addEventListener('keydown', function (e) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); scrub = Math.max(0, Math.min(1, scrub + (e.key === 'ArrowRight' ? 0.02 : -0.02))); kick(); } });
    if (W.IntersectionObserver) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }).observe(canvas);
    W.addEventListener('resize', function () { size(); kick(); });
    size(); kick();
    return { replay: function () { t0 = performance.now(); kick(); }, resize: function () { size(); kick(); } };
  }

  /* ---------------- receipt (prints line by line) ---------------- */
  function receipt(root) {
    if (!root) return;
    var list = $('.rc-lines', root); if (!list || list.childElementCount) return;
    C.receipt.forEach(function (r, i) { var li = el('li', 'rc-line'); li.style.setProperty('--i', i); li.appendChild(el('span', '', r[0])); li.appendChild(el('span', 'rc-dots')); li.appendChild(el('b', '', r[1])); list.appendChild(li); });
    if (W.IntersectionObserver && !reduce) new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { root.classList.add('is-printing'); o.disconnect(); } }, { threshold: 0.35 }).observe(root);
    else root.classList.add('is-printing');
  }

  /* ---------------- text size ---------------- */
  function textSize() {
    var on = store.get('pep-text') === 'large';
    function apply() { if (on) D.documentElement.setAttribute('data-text', 'large'); else D.documentElement.removeAttribute('data-text'); $$('[data-textsize]').forEach(function (b) { b.setAttribute('aria-pressed', on ? 'true' : 'false'); }); if (W.ScrollTrigger) W.ScrollTrigger.refresh(); }
    D.addEventListener('click', function (e) { if (e.target.closest('[data-textsize]')) { on = !on; store.set('pep-text', on ? 'large' : ''); apply(); } });
    apply();
  }

  /* ---------------- preview forms ---------------- */
  function forms() {
    $$('form[data-preview]').forEach(function (f) {
      f.addEventListener('submit', function (e) {
        e.preventDefault();
        var msg = $('.form-msg', f) || f.appendChild(el('p', 'form-msg'));
        var bad = $$('[required]', f).filter(function (i) { return !i.value.trim() || (i.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.value.trim())); });
        if (bad.length) { msg.textContent = 'Please fill in: ' + bad.map(function (i) { return (i.labels && i.labels[0] ? i.labels[0].textContent : i.name).trim(); }).join(', ') + '.'; bad[0].focus(); return; }
        msg.textContent = 'Preview only: nothing was sent.';
      });
    });
  }

  /* ---------------- fill lists from content ---------------- */
  function fill() {
    $$('[data-fill="faq"]').forEach(function (r) { if (r.childElementCount) return; C.faq.forEach(function (q) { var d = el('details', 'faq-i'); var s = el('summary', 'faq-q', q[0]); d.appendChild(s); d.appendChild(el('p', 'faq-a', q[1])); r.appendChild(d); }); });
    $$('[data-fill="compare"]').forEach(function (r) { if (r.childElementCount) return; C.compare.forEach(function (c) { var tr = el('tr'); tr.appendChild(el('th', '', c[0])).setAttribute('scope', 'row'); tr.appendChild(el('td', 'cmp-us', c[1])); tr.appendChild(el('td', 'cmp-them', c[2])); r.appendChild(tr); }); });
  }

  /* ---------------- intro controller ---------------- */
  var introCfg = null;
  function intro(cfg) {
    introCfg = cfg;
    var root = cfg.root; if (!root) return;
    try { if ('scrollRestoration' in history) history.scrollRestoration = 'manual'; } catch (e) {}
    var seen = store.sget('pep-intro-' + cfg.id) === '1';
    var replay = location.hash === '#intro';
    if (reduce || (seen && !replay && !cfg.always)) { root.hidden = true; D.documentElement.classList.add('intro-done'); if (cfg.onDone) cfg.onDone(true); return; }
    run();
  }
  function run() {
    var cfg = introCfg, root = cfg.root, done = false, stop = null;
    root.hidden = false; D.documentElement.classList.remove('intro-done'); D.documentElement.classList.add('intro-on');
    if (lenis) { lenis.scrollTo(0, { immediate: true, force: true }); lenis.stop(); } else W.scrollTo(0, 0);
    function finish(skipped) {
      if (done) return; done = true;
      store.sset('pep-intro-' + cfg.id, '1');
      if (stop) stop();
      var end = function () { root.hidden = true; D.documentElement.classList.remove('intro-on'); D.documentElement.classList.add('intro-done'); if (lenis) lenis.start(); if (location.hash === '#intro') { try { history.replaceState(null, '', location.pathname + location.search + '#' + (cur || 'home')); } catch (e) {} } if (cfg.onDone) cfg.onDone(!!skipped); };
      if (cfg.handoff && !skipped) cfg.handoff(end); else end();
    }
    var sk = $('.intro-skip', root); if (sk) { sk.onclick = function () { finish(true); }; setTimeout(function () { try { sk.focus({ preventScroll: true }); } catch (e) {} }, 60); }
    var esc = function (e) { if (e.key === 'Escape') { D.removeEventListener('keydown', esc); finish(true); } };
    D.addEventListener('keydown', esc);
    stop = cfg.play(function () { finish(false); });
  }
  function introReplay() { if (introCfg && !D.documentElement.classList.contains('intro-on')) run(); }

  /* ---------------- misc ---------------- */
  function onScreen(node, cb, opts) {
    if (!node) return;
    if (!W.IntersectionObserver) { cb(true); return; }
    new IntersectionObserver(function (es) { cb(es[0].isIntersecting); }, opts || { rootMargin: '100px' }).observe(node);
  }

  W.PEP = {
    C: C, Q: Q, reduce: reduce, store: store, $: $, $$: $$, el: el,
    smooth: smooth, scrollToEl: scrollToEl, router: router, show: show, view: function () { return cur; },
    audience: audience, setAud: setAud, aud: function () { return aud; },
    quiz: quiz, flags: flags, lots: lots, chroma: chroma, receipt: receipt, textSize: textSize, forms: forms, fill: fill,
    intro: intro, introReplay: introReplay, openQuiz: function (s) { openQuiz(s); }, onScreen: onScreen,
    get lenis() { return lenis; }
  };
})();

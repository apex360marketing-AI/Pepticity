/* PEPTICITY BOT GALLERY · shared UI helpers (GUI): page frame, pointer light, result cards, lead capture (CASL, preview-only). */
(function (W, D) {
  'use strict';
  var GUI = W.GUI = {};
  GUI.reduced = W.matchMedia && W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  GUI.touch = W.matchMedia && W.matchMedia('(hover: none)').matches;
  GUI.$ = function (s, r) { return (r || D).querySelector(s); };
  GUI.$$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  GUI.el = function (tag, attrs, kids) {
    var e = D.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (k === 'class') e.className = attrs[k]; else if (k === 'text') e.textContent = attrs[k];
      else if (k === 'html') e.innerHTML = attrs[k]; else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), attrs[k]);
      else e.setAttribute(k, attrs[k]);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? D.createTextNode(c) : c); });
    return e;
  };
  GUI.meta = (W.BOT_REGISTRY || []).filter(function (m) { return m.slug === D.body.getAttribute('data-slug'); })[0];

  /* ---- shared pointer: eased --px/--py plus per-glass --mx/--my (the light follows the cursor) ---- */
  var ptr = { x: innerWidth / 2, y: innerHeight / 3, tx: innerWidth / 2, ty: innerHeight / 3, nx: 0, ny: 0 };
  GUI.pointer = ptr;
  addEventListener('pointermove', function (e) { ptr.tx = e.clientX; ptr.ty = e.clientY; }, { passive: true });
  var seen = new Set();
  var io = 'IntersectionObserver' in W ? new IntersectionObserver(function (es) { es.forEach(function (e) { e.isIntersecting ? seen.add(e.target) : seen.delete(e.target); }); }) : null;
  GUI.watchGlass = function (root) { GUI.$$('.glass', root || D).forEach(function (g) { if (!g.__w) { g.__w = 1; io ? io.observe(g) : seen.add(g); } }); };
  var listeners = [];
  GUI.onFrame = function (fn) { listeners.push(fn); };
  var last = performance.now();
  (function tick(t) {
    var dt = Math.min(0.1, (t - last) / 1000); last = t;
    var k = 1 - Math.exp(-9 * dt);
    ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
    ptr.nx = (ptr.x / innerWidth) * 2 - 1; ptr.ny = (ptr.y / innerHeight) * 2 - 1;
    if (!GUI.reduced && !GUI.touch) seen.forEach(function (g) { var r = g.getBoundingClientRect(); g.style.setProperty('--mx', (ptr.x - r.left).toFixed(0) + 'px'); g.style.setProperty('--my', (ptr.y - r.top).toFixed(0) + 'px'); });
    for (var i = 0; i < listeners.length; i++) listeners[i](dt, t);
    requestAnimationFrame(tick);
  })(last);

  /* ---- page frame: ground, header, description block, live area, footer ---- */
  GUI.frame = function (mount) {
    var m = GUI.meta; if (!m) return null;
    var idx = m.n, all = W.BOT_REGISTRY, prev = all[(idx + 13) % 15], next = all[idx % 15];
    D.title = 'PEPTICITY · ' + m.name + ' · bot ' + ('0' + m.n).slice(-2) + ' of 15';
    var body = D.body;
    body.insertBefore(GUI.el('div', { class: 'ground', 'aria-hidden': 'true' }, [GUI.el('i'), GUI.el('i')]), body.firstChild);
    var top = GUI.el('header', { class: 'top' }, [
      GUI.el('a', { href: '../', 'aria-label': 'PEPTICITY bot gallery', style: 'display:flex;align-items:center;gap:12px;text-decoration:none' }, [GUI.el('span', { class: 'pmark', role: 'img', 'aria-label': 'PEPTICITY P' }), GUI.el('span', { class: 'word', text: 'PEPTICITY' })]),
      GUI.el('nav', { 'aria-label': 'Gallery' }, [GUI.el('a', { href: '../', text: 'All 15 bots' }), GUI.el('a', { class: 'hide-s', href: '../' + next.slug + '/', text: 'Next: ' + next.name })])
    ]);
    var about = GUI.el('section', { class: 'about glass', 'aria-label': 'About this bot' }, [
      GUI.el('div', { class: 'eyebrow' }, [GUI.el('b', { text: m.family }), GUI.el('i'), 'BOT ' + ('0' + m.n).slice(-2) + ' / 15']),
      GUI.el('h1', { class: 'display', text: m.name }),
      GUI.el('div', {}, [GUI.el('h2', { text: 'What it is' }), GUI.el('p', { class: 'lead', text: m.what })]),
      GUI.el('div', {}, [GUI.el('h2', { text: 'Why it converts' }), GUI.el('p', { text: m.why })]),
      GUI.el('div', {}, [GUI.el('h2', { text: 'Best for' }), GUI.el('p', { text: m.best })])
    ]);
    var live = GUI.el('section', { class: 'live', id: 'live', 'aria-label': 'Live demo' });
    var foot = GUI.el('footer', { class: 'bot-foot' }, [
      GUI.el('a', { href: '../' + prev.slug + '/', text: '← ' + prev.name }), GUI.el('a', { href: '../', text: 'Gallery' }), GUI.el('a', { href: '../' + next.slug + '/', text: next.name + ' →' })]);
    var SF = GBrain.safe(); var disc = GUI.el('p', { class: 'disc', text: SF ? 'PEPTICITY GUIDE is an automated guide. This is general reading, not medical advice and not advice for you. In an emergency call 911. In a mental-health crisis in Canada call or text 9-8-8. Preview build: entries stay in this browser only. [Final legal copy to be approved by counsel.]' : 'PEPTICITY GUIDE is an automated guide, not a clinician, and this is not medical advice. Anything about your own health goes to a licensed clinician. In an emergency call 911. In a mental-health crisis in Canada call or text 9-8-8. Preview build: entries stay in this browser only. [Final legal copy to be approved by counsel.]' });
    var wrap = GUI.el('main', { class: 'wrap' }, [about, GUI.el('p', { class: 'live-label' }, [GUI.el('i'), 'Live demo · try it']), live, foot, disc]);
    body.insertBefore(top, body.children[1]); body.insertBefore(wrap, body.children[2]);
    GUI.watchGlass(); return live;
  };

  /* ---- typewriter that respects reduced motion ---- */
  GUI.type = function (node, text, speed, done) {
    if (GUI.reduced) { node.textContent = text; done && done(); return; }
    var i = 0, id = setInterval(function () { i += 2; node.textContent = text.slice(0, i); if (i >= text.length) { clearInterval(id); done && done(); } }, speed || 16);
    return id;
  };

  /* ---- reading-list result (shared structure) ---- */
  GUI.result = function (r, opts) {
    opts = opts || {};
    var li = function (x) { return GUI.el('li', {}, [GUI.el('b', { text: x.name }), ' — ' + x.plain]); };
    var wrap = GUI.el('div', { class: 'res', 'data-result': '1' }, [
      GUI.el('h3', {}, [GUI.el('span', { class: 'kw', text: r.goalLabel })]),
      r.families.length ? GUI.el('div', { class: 'blk glass' }, [GUI.el('h4', { text: 'Peptide families to read about' }), GUI.el('ul', {}, r.families.map(li))]) : null,
      r.nutrients.length ? GUI.el('div', { class: 'blk glass' }, [GUI.el('h4', { text: 'Vitamins and minerals to ask about' }), GUI.el('ul', {}, r.nutrients.slice(0, 4).map(li))]) : null,
      GUI.el('div', { class: 'blk glass' }, [GUI.el('h4', { text: r.foodsTitle || 'Foods to look at' }), GUI.el('div', { class: 'foods' }, r.foods.map(function (f) { return GUI.el('span', { text: f }); }))]),
      r.pair ? GUI.el('div', { class: 'pair glass' }, [GUI.el('h4', { text: 'Often read together' }), GUI.el('b', {}, [r.pair.family + '  +  ' + r.pair.nutrient]), GUI.el('p', { text: r.pair.why })]) : null,
      GUI.el('ul', {}, r.notes.map(function (n) { return GUI.el('li', { text: n }); })),
      GUI.el('p', { class: 'clin', text: r.clinician + ' ' + r.disclaimer })
    ]);
    if (opts.compact) { GUI.$$('.blk ul li', wrap).forEach(function (n, i) { if (i > 5) n.style.display = 'none'; }); }
    GUI.watchGlass(wrap); return wrap;
  };

  /* ---- lead capture: CASL, unticked single-purpose boxes, preview-only ---- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var TXT_EMAIL = GBrain.safe() ? 'Yes, PEPTICITY [legal name and mailing address: to be added] may email me updates about the founding list and nutrition reading. I can withdraw any time with the unsubscribe link in every email.' : 'Yes, PEPTICITY [legal name and mailing address: to be added] may also email me occasional news about peptide and nutrition reading. I can unsubscribe any time.';
  var TXT_SMS = 'Yes, PEPTICITY [legal name: to be added] may send me one text with a link to my reading list. The text will not mention my goals. Message and data rates may apply. Reply STOP to stop.';
  GUI.capture = function (mount, o) {
    o = o || {}; var slug = (GUI.meta && GUI.meta.slug) || 'gallery', hook = 'gal-' + slug;
    var uid = 'c' + Math.random().toString(36).slice(2, 7);
    var email = GUI.el('input', { type: 'email', id: uid + 'e', name: 'email', autocomplete: 'email', inputmode: 'email', required: 'required', placeholder: 'you@example.com', 'aria-describedby': uid + 'x' });
    var tel = GUI.el('input', { type: 'tel', id: uid + 't', name: 'phone', autocomplete: 'tel', inputmode: 'tel', placeholder: '(555) 555-0100' });
    var cE = GUI.el('input', { type: 'checkbox', id: uid + 'ce', name: 'consent_email' });
    var cS = GUI.el('input', { type: 'checkbox', id: uid + 'cs', name: 'consent_sms' });
    var hp = GUI.el('input', { type: 'text', name: 'website', tabindex: '-1', autocomplete: 'off', 'aria-hidden': 'true', class: 'hp' });
    var err = GUI.el('div', { class: 'err', id: uid + 'x', role: 'alert' });
    var smsBox = GUI.el('div', { style: 'display:none;gap:10px' , class: 'smsbox'}, [
      GUI.el('label', { class: 'f', 'for': uid + 't' }, ['Mobile number (optional)', tel]),
      GUI.el('label', { class: 'chk', 'for': uid + 'cs' }, [cS, GUI.el('span', { text: TXT_SMS })])]);
    var optBtn = GUI.el('button', { type: 'button', class: 'opt', 'aria-expanded': 'false', text: '+ Also text me the link (optional)', onclick: function () { var show = smsBox.style.display === 'none'; smsBox.style.display = show ? 'grid' : 'none'; optBtn.setAttribute('aria-expanded', show); if (!show) { tel.value = ''; cS.checked = false; } } });
    var submit = GUI.el('button', { type: 'submit', class: 'btn main', text: 'Send me my reading list' });
    var form = GUI.el('form', { class: 'cap glass', novalidate: 'novalidate', 'data-hook': hook, 'data-capture': '1', 'aria-label': 'Email my reading list' }, [
      GUI.el('h3', { text: 'Send it to me' }),
      GUI.el('p', { text: o.lead || (GBrain.safe() ? 'We will email your reading list once. Nothing else unless you tick the box below.' : 'We will email your reading list and the link to the free 2-minute assessment. Nothing else unless you tick the box below.') }),
      GUI.el('label', { class: 'f', 'for': uid + 'e' }, ['Email', email]),
      GUI.el('label', { class: 'chk', 'for': uid + 'ce' }, [cE, GUI.el('span', { text: TXT_EMAIL })]),
      optBtn, smsBox, hp, err, submit,
      GUI.el('p', { class: 'priv', text: 'Why we ask: your four answers build the list you asked for. They are not sent to advertising or analytics tools. [Privacy promise link and contact: to be added]' })
    ]);
    form.addEventListener('submit', function (ev) {
      ev.preventDefault(); err.textContent = ''; email.removeAttribute('aria-invalid'); tel.removeAttribute('aria-invalid');
      if (hp.value) return;
      if (!EMAIL_RE.test(email.value.trim())) { email.setAttribute('aria-invalid', 'true'); err.textContent = 'Please enter a valid email address.'; email.focus(); return; }
      if (tel.value.trim() && !cS.checked) { tel.setAttribute('aria-invalid', 'true'); err.textContent = 'Tick the text box so we can text you, or clear the number.'; return; }
      if (tel.value.trim() && tel.value.replace(/\D/g, '').length < 10) { tel.setAttribute('aria-invalid', 'true'); err.textContent = 'Please enter a 10-digit mobile number.'; tel.focus(); return; }
      var ts = new Date().toISOString(), ans = (o.getAnswers && o.getAnswers()) || {};
      var payload = { hook: hook, page: location.pathname, ts: ts, source: 'bot-gallery-preview', email: email.value.trim(), phone: tel.value.trim() || null, answers: ans,
        consent: { transactional_list: { given: true, text: 'Send me my reading list', ts: ts }, marketing_email: { given: cE.checked, text: TXT_EMAIL, ts: ts }, sms: { given: !!(tel.value.trim() && cS.checked), text: TXT_SMS, ts: ts } } };
      (W.__PEP_LEADS = W.__PEP_LEADS || []).push(payload);
      try { var arr = JSON.parse(localStorage.getItem('pep_gallery_leads') || '[]'); arr.push(payload); localStorage.setItem('pep_gallery_leads', JSON.stringify(arr.slice(-20))); } catch (e) {}
      D.dispatchEvent(new CustomEvent('pep:lead', { detail: payload }));
      submit.disabled = true; submit.textContent = 'Sending…';
      setTimeout(function () {
        var ok = GUI.el('div', { class: 'cap-success glass', 'data-success': '1', role: 'status', tabindex: '-1' }, [
          GUI.el('h3', {}, [GUI.el('span', { class: 'kw', text: 'Saved' }), ' — check your inbox']),
          GUI.el('p', { text: (o.nextText || (GBrain.safe() ? 'Your reading list is on its way.' : 'Your reading list is on its way. Next step: the free 2-minute assessment, where a licensed clinician reviews your answers.')) }),
          GUI.el('div', { class: 'row' }, [GBrain.safe() ? null : GUI.el('a', { class: 'btn main', href: '#assessment', 'data-next': '1', text: 'Take the free assessment', style: 'text-decoration:none;display:inline-flex;align-items:center' }), GUI.el('button', { class: 'btn', type: 'button', text: 'Start over', 'data-restart': '1', onclick: function () { o.onRestart ? o.onRestart() : location.reload(); } })]),
          GUI.el('p', { class: 'preview', text: 'Preview build · hook ' + hook + ' · stored in this browser only, nothing was sent.' })]);
        form.replaceWith(ok); GUI.watchGlass(ok); try { ok.focus({ preventScroll: true }); } catch (e) {}
        o.onDone && o.onDone(payload);
      }, GUI.reduced ? 0 : 650);
    });
    mount.appendChild(form); GUI.watchGlass(form); return form;
  };

  GUI.human = GBrain.human();
  GUI.shuffle = function (a) { return a.map(function (x) { return [Math.random(), x]; }).sort(function (p, q) { return p[0] - q[0]; }).map(function (p) { return p[1]; }); };
  GUI.clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };
  GUI.lerp = function (a, b, t) { return a + (b - a) * t; };
})(window, document);

/* ---- shared chat panel (used by bots that need a plain guided chat next to a custom stage) ---- */
(function (W, D) {
  var GUI = W.GUI, el = GUI.el;
  GUI.chatPanel = function (flow, o) {
    o = o || {};
    var log = el('div', { class: 'cp-log', 'aria-live': 'polite' }), box = el('div'), capMount = el('div');
    var ask = el('input', { type: 'text', 'data-ask': '1', 'aria-label': 'Ask the PEPTICITY guide a question', placeholder: 'Ask me anything, or pick below…', autocomplete: 'off' });
    var form = el('form', { class: 'askrow', onsubmit: function (e) { e.preventDefault(); var v = ask.value.trim(); if (!v) return; ask.value = ''; o.onTyping && o.onTyping(0); me(v); think(800, function () { var a = GBrain.ask(v); a.lines.forEach(function (l) { say(l); }); o.onReply && o.onReply(a); }); } }, [ask, el('button', { class: 'btn', type: 'submit', text: 'Ask' })]);
    ask.addEventListener('input', function () { o.onTyping && o.onTyping(Math.min(1, ask.value.length / 18)); });
    var root = el('div', { class: 'cp glass' }, [log, box, form, capMount]);
    function scroll() { setTimeout(function () { log.scrollTop = log.scrollHeight; }, 40); }
    function say(t) { var b = el('div', { class: 'msg bot' }); log.appendChild(b); GUI.type(b, t, 12); scroll(); o.onSay && o.onSay(t); return b; }
    function me(t) { log.appendChild(el('div', { class: 'msg me', text: t })); scroll(); }
    function think(ms, cb) { o.onThink && o.onThink(true); setTimeout(function () { o.onThink && o.onThink(false); cb(); }, GUI.reduced ? 0 : ms); }
    function q() {
      box.innerHTML = ''; var s = flow.current(); o.onStep && o.onStep(flow.idx, flow.total); if (!s) return done();
      var opts = el('div', { class: 'cp-opts', role: 'group', 'aria-label': s.q });
      box.append(el('p', { class: 'cp-q', text: s.q }), el('div', { class: 'live-note', text: s.hint, style: 'margin:4px 0 10px' }), opts);
      s.opts.forEach(function (op) { opts.appendChild(el('button', { class: 'chip', type: 'button', 'data-opt': op.id, onclick: function () { pick(op); } }, [op.label, op.sub ? el('small', { text: op.sub }) : null])); });
    }
    function pick(op) { me(op.label); flow.answer(op.id); box.innerHTML = ''; o.onAnswer && o.onAnswer(op); think(750, q); }
    function done() {
      var r = flow.result(); o.onDone && o.onDone(r); say('Your reading list is ready. ' + r.clinician);
      setTimeout(function () { log.appendChild(GUI.result(r)); GUI.capture(capMount, { getAnswers: function () { return flow.answers; }, onRestart: function () { flow.reset(); log.innerHTML = ''; capMount.innerHTML = ''; o.onRestart && o.onRestart(); start(); } }); scroll(); }, GUI.reduced ? 0 : 700);
    }
    function start() { say(o.intro || GBrain.intro()); setTimeout(q, GUI.reduced ? 0 : 350); }
    return { root: root, say: say, me: me, think: think, start: start, pick: pick, q: q, log: log };
  };
})(window, document);

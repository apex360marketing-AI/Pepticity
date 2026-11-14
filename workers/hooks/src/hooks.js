/* 45-hooks: THE HOOKS (HOOKS worker, Nov 13 2026). Four asks as you go down the page, one quiet exit slide-in, one phone bar.
   Every word is in the page; this file only moves it. The lead engine is the one the page already has:
   - forms post to PEP_CONFIG.form.endpoint (EMPTY = nothing is sent and the success step shows), with the house payload
     { form, hook, slot, page, email, consent: { email, text, at } } and a hook id from data-hook;
   - joining writes the shared pep_flow_v1 ({ stage: 'TEAM', joinedAt, hooksDone }) exactly as the hero does, so the cart, the
     guide and the hero all know. Nothing personal is ever kept in the browser: no email, no name, no number;
   - PEP.track gets ids only (hook, slot, step, kind, state).
   THE SPACING RULE: no two asks ever share a screen. After every layout change the rooms are spaced so that each ask is at
   least a screen and a margin from the ask before and after it, including the hero's ask and the doors' forms.
   THE OVERLAY RULE: the exit slide-in and the phone bar never show over another ask, the scroll story, the showcase, the
   cart or the guide, and never to a member. */
(function () {
  'use strict';
  var C = null;

  PEP.register('hooks', {
    init: function (root, ctx) {
      if (!C) { C = makeController(ctx); }
      C.add(root);
    }
  });

  function makeController(ctx) {
    var win = window, doc = document;
    var cfg = ctx.config || {}, flags = cfg.flags || {}, cleared = flags.COUNSEL_CLEARED || {};
    var hk = cfg.hooks || {}, exitCfg = hk.exit || {}, refCfg = hk.referral || {};
    var FLOW = 'pep_flow_v1', OWN = 'pep_hooks_v1', SESSION_KEY = 'pep_hooks_exit';

    function num(x) { return typeof x === 'number' && isFinite(x) && x > 0; }
    function q(el, s) { return el ? el.querySelector(s) : null; }
    function qa(el, s) { return el ? Array.prototype.slice.call(el.querySelectorAll(s)) : []; }
    function wait(ms) { return new Promise(function (res) { setTimeout(res, ms); }); }
    function motionMs(ms) { return ctx.motion.reduced ? 0 : ms; }
    function focusQuiet(el) { if (!el) { return; } try { el.focus({ preventScroll: true }); } catch (e) { el.focus(); } }
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    function emailOk(v) { return EMAIL.test(String(v || '').trim()); }
    function phoneOk(v) { var t = String(v || '').trim(), d = t.replace(/\D/g, ''); return /^[+\d\s().-]+$/.test(t) && d.length >= 10 && d.length <= 15; }
    function cleanName(v) { return String(v || '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20); }

    // ---- the counsel switches: preview shows gated wording for review; a live build shows it only once cleared
    var gates = {
      offer: !!((flags.PREVIEW || cleared.offer) && cfg.offer && cfg.offer.text),
      restock: !!(flags.PREVIEW || cleared.restock),
      names: !!(flags.PREVIEW || cleared.names),
      referral: !!((flags.PREVIEW || cleared.referral) && num(refCfg.givePercent) && num(refCfg.getPercent) && typeof refCfg.headline === 'string' && refCfg.headline),
      preview: !!flags.PREVIEW
    };
    function applyGates(root) {
      Object.keys(gates).forEach(function (k) {
        qa(root, '[data-gate="' + k + '"]').forEach(function (el) { if (!el.hasAttribute('data-preview-note')) { el.hidden = !gates[k]; } });
        qa(root, '[data-gate-off="' + k + '"]').forEach(function (el) { el.hidden = gates[k]; });
      });
    }

    // ---- joined: the shared yes/no (stage, time and hook ids only)
    function isJoined() { var f = ctx.state.get(FLOW, null); return !!(f && typeof f === 'object' && (f.stage === 'TEAM' || f.joinedAt)); }
    var source = null, members = [];
    function markJoined(hook) {
      var f = ctx.state.get(FLOW, null), was = isJoined();
      var done = f && Array.isArray(f.hooksDone) ? f.hooksDone.filter(function (h) { return typeof h === 'string'; }) : [];
      if (done.indexOf(hook) < 0) { done.push(hook); }
      source = hook;
      ctx.state.set(FLOW, { stage: 'TEAM', joinedAt: (f && typeof f.joinedAt === 'string' && f.joinedAt) || new Date().toISOString(), hooksDone: done });
      if (!was) { ctx.emit('flow:state', { from: 'NEW', to: 'TEAM' }); }
    }
    ctx.on('state:' + FLOW, function () {
      var src = source; source = null;
      if (isJoined()) { members.forEach(function (fn) { try { fn(src); } catch (e) { /* one room never stops the others */ } }); }
      schedule();
    });

    // ---- share codes. Eight characters from the alphabet the store issues (no I, O, 0, 1); anything else is not a code.
    var CODE = /^[A-HJ-NP-Z2-9]{8}$/;
    function own() { var o = ctx.state.get(OWN, null); return o && typeof o === 'object' ? o : {}; }
    function ownCode() { var c = own().ref; return typeof c === 'string' && CODE.test(c) ? c : ''; }
    function setOwn(key, value) {                       // the hooks' own key holds two things only: a count and a code
      var o = own(), out = {};
      if (typeof o.exitSeen === 'number' && isFinite(o.exitSeen)) { out.exitSeen = o.exitSeen; }
      if (typeof o.ref === 'string' && CODE.test(o.ref)) { out.ref = o.ref; }
      out[key] = value;
      ctx.state.set(OWN, out);
    }
    // a friend arrives with ?ref=CODE: exactly one ref, and a well-formed code, or it is ignored. Read from the address on
    // each page view, never stored, never shown; it rides only in that friend's own join.
    var invitedBy = '';
    try {
      var refs = new win.URLSearchParams(win.location.search).getAll('ref');
      if (refs.length === 1 && CODE.test(refs[0]) && refs[0] !== ownCode()) { invitedBy = refs[0]; }
    } catch (e) { invitedBy = ''; }
    function reallySends() { return !!(cfg.form && cfg.form.endpoint); }

    // ---- sending: the lead engine's own rule. Endpoint empty = nothing is sent. A refused, failed or hung (10 s) send rejects.
    function post(body) {
      var endpoint = cfg.form && cfg.form.endpoint;
      if (!endpoint) { return Promise.resolve(null); }
      try {
        var ac = typeof AbortController === 'function' ? new AbortController() : null;
        var timer = setTimeout(function () { if (ac) { ac.abort(); } }, 10000);
        return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined })
          .then(function (r) { clearTimeout(timer); if (!r.ok) { throw new Error('send refused ' + r.status); } return r; },
                function (err) { clearTimeout(timer); throw err; });
      } catch (err) { return Promise.reject(err); }
    }

    // ---- steps inside a form
    function show(form, name, quiet) {
      qa(form, '[data-step]').forEach(function (s) { s.hidden = s.getAttribute('data-step') !== name; });
      var step = q(form, '[data-step="' + name + '"]'), head = q(step, '[data-step-head]');
      if (head && !quiet) { focusQuiet(head); }
      schedule();
    }
    function currentStep(form) {
      var s = qa(form, '[data-step]').filter(function (el) { return !el.hidden; })[0];
      return s ? s.getAttribute('data-step') : '';
    }
    function visibleText(scope, sel) {
      return qa(scope, sel).filter(function (el) { return !el.closest('[hidden]'); })
        .map(function (el) { return el.textContent.replace(/\s+/g, ' ').trim(); }).join(' ');
    }

    // ---- THE ASK: one email field and its own unticked box. Submit is refused until both are right.
    function ask(form, o) {
      var email = q(form, '[data-field="email"]'), consent = q(form, '[data-consent="email"]');
      var errE = q(form, '[data-err="email"]'), errC = q(form, '[data-err="consent"]'), errS = q(form, '[data-err="send"]');
      var btn = q(form, 'button[type="submit"]'), well = email && email.closest('.pep-hooks-well');
      if (!email || !consent || !btn) { return; }
      var busy = false;
      function checkEmail() {
        var ok = emailOk(email.value);
        errE.hidden = ok;
        email.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (well) { if (ok) { well.removeAttribute('data-bad'); } else { well.setAttribute('data-bad', ''); } }
        return ok;
      }
      email.addEventListener('blur', function () { if (email.value) { checkEmail(); } });
      email.addEventListener('input', function () { if (!errE.hidden && emailOk(email.value)) { checkEmail(); } });
      email.addEventListener('focus', function () { ctx.track('ask_start', { hook: o.hook, slot: o.slot }); }, { once: true });
      consent.addEventListener('change', function () { if (consent.checked) { errC.hidden = true; consent.setAttribute('aria-invalid', 'false'); } });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) { return; }
        var step = q(form, '[data-step="email"]');
        if (step && step.hidden) { return; }
        var ok = checkEmail();
        if (!consent.checked) { errC.hidden = false; consent.setAttribute('aria-invalid', 'true'); ok = false; }
        if (!ok) { (emailOk(email.value) ? consent : email).focus(); return; }
        busy = true;
        if (errS) { errS.hidden = true; }
        btn.classList.add('pep-hooks-sending');
        var addr = email.value.trim();                   // memory only, for this page view
        var body = { form: form.getAttribute('data-ghl-form'), hook: o.hook, slot: o.slot, page: win.location.pathname, email: addr,
          consent: { email: true, text: visibleText(form, '[data-consent-text]'), at: new Date().toISOString() } };
        if (invitedBy) { body.ref = invitedBy; }          // the member who invited this visitor (their code, nothing else)
        var extra = o.extra ? o.extra() : null;
        if (extra) { Object.keys(extra).forEach(function (k) { body[k] = extra[k]; }); }
        Promise.all([post(body), wait(motionMs(750))]).then(function () {
          btn.classList.remove('pep-hooks-sending'); btn.classList.add('pep-hooks-sent');
          email.value = '';
          // a preview with no list connected sent nothing: say so, as the hero does (gone once an endpoint is set)
          var note = q(form, '[data-preview-note]');
          if (note) { note.hidden = !(flags.PREVIEW && !reallySends()); }
          markJoined(o.hook);
          ctx.track('ask_done', { hook: o.hook, slot: o.slot });
          setTimeout(function () { busy = false; o.done(addr); }, motionMs(450));
        }, function () {
          busy = false; btn.classList.remove('pep-hooks-sending');
          if (errS) { errS.hidden = false; }
        });
      });
    }

    /* ================= 01 THE FOUNDER CARD (H63) ================= */
    function fit(el) {
      el.style.fontSize = '';
      for (var i = 0; i < 14 && el.scrollWidth > el.clientWidth + 1; i++) {
        el.style.fontSize = (parseFloat(win.getComputedStyle(el).fontSize) * 0.92).toFixed(1) + 'px';
      }
    }
    function wireCard(room) {
      var form = q(room, 'form'), nameIn = q(form, '[data-field="name"]'), out = q(room, '[data-card-name]');
      var year = q(room, '[data-card-year]');
      if (year) { year.textContent = String(new Date().getFullYear()); }
      // the live P on the card: the shared 3D engine (02-logo3d) draws it into the slot, exactly as the header asks for its own
      var mark = q(room, '[data-card-mark]');
      function announce() { if (mark) { ctx.emit('logo3d:slot', { el: mark, kind: 'mark', phase: 2.1, hold: true }); } }
      ctx.on('logo3d:ready', announce);
      announce();
      ctx.on('logo3d:off', function () { room.setAttribute('data-hooks-3d', 'off'); });
      var invited = q(room, '[data-invited]');
      if (invited) { invited.hidden = !(invitedBy && !isJoined()); }
      var EMPTY = out.getAttribute('data-placeholder') || out.textContent, MEMBER = out.getAttribute('data-member') || EMPTY;
      function paint() {
        var v = cleanName(nameIn.value).toUpperCase();
        out.textContent = v || EMPTY;
        if (v) { out.removeAttribute('data-empty'); } else { out.setAttribute('data-empty', ''); }
        fit(out);
      }
      nameIn.addEventListener('input', paint);
      nameIn.addEventListener('focus', function () { ctx.track('ask_start', { hook: 'H63', slot: 'card' }); }, { once: true });
      function toEmail() { paint(); show(form, 'email'); ctx.track('ask_step', { hook: 'H63', slot: 'card', step: 2 }); }
      q(form, '[data-make]').addEventListener('click', toEmail);
      nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); toEmail(); } });
      q(form, '[data-edit]').addEventListener('click', function () { show(form, 'name', true); nameIn.focus(); });
      ask(form, {
        hook: 'H63', slot: 'card',
        extra: function () { var v = cleanName(nameIn.value); return v ? { first_name: v } : null; },
        done: function () { nameIn.value = ''; show(form, 'done'); }
      });
      function member(src) {
        if (src === 'H63' || currentStep(form) === 'done') { return; }
        nameIn.value = '';
        out.textContent = MEMBER; out.removeAttribute('data-empty'); fit(out);
        show(form, 'done', true);
      }
      members.push(member);
      if (isJoined()) { member(null); }
      win.addEventListener('resize', function () { fit(out); }, { passive: true });
    }

    /* ================= 02 FIND YOUR PICKS (H64) ================= */
    function wireFinder(room) {
      room.setAttribute('aria-labelledby', gates.names ? 'pep-hooks-finder-title' : 'pep-hooks-twin-title');
      var twin = q(room, '[data-twin-form]');
      if (twin) {
        ask(twin, { hook: 'H64', slot: 'finder', done: function () { show(twin, 'done'); } });
        members.push(function (src) { if (src !== 'H64' && currentStep(twin) === 'email') { show(twin, 'member', true); } });
      }
      if (!gates.names) { if (isJoined() && twin) { show(twin, 'member', true); } return; }

      var box = q(room, '[data-finder]'), tpl = q(box, 'template[data-words]'), words = {};
      qa(tpl && tpl.content ? tpl.content : tpl, '[data-w]').forEach(function (el) { words[el.getAttribute('data-w')] = el.textContent.trim(); });
      function w(k) { return words[k] || ''; }
      var notches = qa(box, '[data-notch]'), stage = q(box, '[data-ask-stage]'), qEl = q(box, '[data-q]'), tiles = q(box, '[data-tiles]');
      var waitEl = q(box, '[data-finder-wait]'), failEl = q(box, '[data-finder-fail]'), back = q(box, '[data-back]');
      var result = q(box, '[data-result]'), picksEl = q(box, '[data-picks]'), again = q(box, '[data-again]');
      var form = q(box, '[data-finder-form]'), resultHead = q(box, '[data-result-head]');
      var held = {};
      [cfg.hidden, cfg.flagged, hk.finderSkip].forEach(function (list) { (Array.isArray(list) ? list : []).forEach(function (s) { held[String(s)] = 1; }); });
      var FAMS = ['PEPTIDE', 'BLEND', 'NON-PEPTIDE COMPOUND'];
      var items = null, step = 0, pick = { fam: '', band: 0, group: -1 }, groups = [], lastPicks = [];

      function bandOf(mg) { return !isFinite(mg) ? 0 : mg <= 10 ? 1 : mg <= 50 ? 2 : 3; }
      function money(p) { return '$' + (Math.round(p) === p ? String(p) : p.toFixed(2)); }
      function readCatalogue(d) {
        var out = [];
        (d && Array.isArray(d.products) ? d.products : []).forEach(function (p) {
          if (!p || held[p.sku] || p.comingSoon || p.soldOut || !Array.isArray(p.sizes)) { return; }
          p.sizes.forEach(function (s) {
            if (!s || s.comingSoon || s.soldOut || typeof s.priceCAD !== 'number' || !(s.priceCAD > 0)) { return; }
            var m = /([\d.]+)\s*mg/i.exec(String(s.label || ''));
            out.push({ sku: String(p.sku), name: String(p.name || ''), fam: String(p.family || ''), id: String(s.id), label: String(s.label || ''), mg: m ? parseFloat(m[1]) : NaN, price: s.priceCAD });
          });
        });
        return out;
      }
      function byPrice(a, b) { return a.price - b.price; }
      function inFam() { return items.filter(function (it) { return it.fam === pick.fam; }); }
      function inBand() { return inFam().filter(function (it) { return bandOf(it.mg) === pick.band; }); }
      function priceGroups(list) {
        var ps = [];
        list.forEach(function (it) { if (ps.indexOf(it.price) < 0) { ps.push(it.price); } });
        ps.sort(function (a, b) { return a - b; });
        var n = ps.length, out = [];
        if (n <= 3) { ps.forEach(function (p) { out.push([p, p]); }); return out; }
        var a = Math.ceil(n / 3), b = Math.ceil((n - a) / 2);
        out.push([ps[0], ps[a - 1]]); out.push([ps[a], ps[a + b - 1]]); out.push([ps[a + b], ps[n - 1]]);
        return out;
      }
      function tilesOf(list, onPick) {
        tiles.textContent = '';
        list.forEach(function (t) {
          var li = doc.createElement('li'), b = doc.createElement('button'), s = doc.createElement('span');
          b.type = 'button'; b.className = 'pep-hooks-tile';
          s.className = 'pep-hooks-tile-word'; s.textContent = t.label;
          b.appendChild(s); li.appendChild(b); tiles.appendChild(li);
          b.addEventListener('click', function () { onPick(t.value); focusQuiet(stage.hidden ? resultHead : qEl); });
        });
      }
      function lit(n) { notches.forEach(function (el, i) { if (i < n) { el.setAttribute('data-lit', ''); } else { el.removeAttribute('data-lit'); } }); }
      function render() {
        back.hidden = step === 0;
        if (step === 0) {
          lit(1); qEl.textContent = w('q-1');
          tilesOf(FAMS.filter(function (f) { return items.some(function (it) { return it.fam === f; }); })
            .map(function (f) { return { label: w('fam-' + f) || f, value: f }; }),
            function (v) { pick.fam = v; step = 1; render(); });
        } else if (step === 1) {
          lit(2); qEl.textContent = w('q-2');
          var bands = [1, 2, 3].filter(function (b) { return inFam().some(function (it) { return bandOf(it.mg) === b; }); });
          if (bands.length < 2) { pick.band = bands[0] || 0; step = 2; render(); return; }
          tilesOf(bands.map(function (b) { return { label: w('size-' + b), value: b }; }), function (v) { pick.band = v; step = 2; render(); });
        } else if (step === 2) {
          lit(3); qEl.textContent = w('q-3');
          groups = priceGroups(pick.band ? inBand() : inFam());
          if (groups.length < 2) { pick.group = 0; step = 3; render(); return; }
          tilesOf(groups.map(function (g, i) { return { label: g[0] === g[1] ? money(g[0]) : money(g[0]) + ' ' + w('to') + ' ' + money(g[1]), value: i }; }),
            function (v) { pick.group = v; step = 3; render(); });
        } else {
          showResult();
        }
        ctx.track('finder_step', { hook: 'H64', slot: 'finder', step: step + 1 });
      }
      function choose() {
        var fam = inFam(), band = pick.band ? inBand() : fam, g = groups[pick.group] || [0, Infinity];
        var exact = band.filter(function (it) { return it.price >= g[0] && it.price <= g[1]; });
        var seen = {}, out = [];
        [exact, band, fam].forEach(function (list) {
          list.slice().sort(byPrice).forEach(function (it) { if (!seen[it.sku] && out.length < 3) { seen[it.sku] = 1; out.push(it); } });
        });
        return out;
      }
      function showResult() {
        lit(3);
        stage.hidden = true; result.hidden = false;
        var list = choose();
        picksEl.textContent = '';
        list.forEach(function (it) {
          var li = doc.createElement('li'); li.className = 'pep-hooks-pick';
          var who = doc.createElement('div'), nm = doc.createElement('span'), sz = doc.createElement('span');
          nm.className = 'pep-hooks-pick-name'; nm.textContent = it.name;
          sz.className = 'pep-hooks-pick-size'; sz.textContent = it.label;
          who.appendChild(nm); who.appendChild(sz);
          var deal = doc.createElement('span'), price = doc.createElement('b'), cad = doc.createElement('span');
          deal.className = 'pep-hooks-pick-deal';
          price.className = 'pep-hooks-num pep-hooks-pick-price'; price.textContent = money(it.price);
          cad.className = 'pep-hooks-pick-cad'; cad.textContent = w('cad');
          deal.appendChild(price); deal.appendChild(cad);
          var add = doc.createElement('button');
          add.type = 'button'; add.className = 'pep-hooks-add'; add.textContent = w('add');
          add.addEventListener('click', function () {
            ctx.emit('cart:add', { sizeId: it.id, qty: 1 });
            add.textContent = w('added'); add.setAttribute('data-added', '');
            ctx.track('finder_add', { hook: 'H64', slot: 'finder', sizeId: it.id });
          });
          li.appendChild(who); li.appendChild(deal); li.appendChild(add);
          picksEl.appendChild(li);
        });
        lastPicks = list.map(function (it) { return it.id; });
        if (isJoined()) { show(form, currentStep(form) === 'done' ? 'done' : 'member', true); }
        else if (currentStep(form) !== 'done') { show(form, 'email', true); }
        schedule();
      }
      back.addEventListener('click', function () {
        step = Math.max(0, step - 1);
        if (step === 2 && groups.length < 2) { step = 1; }
        if (step === 1 && [1, 2, 3].filter(function (b) { return inFam().some(function (it) { return bandOf(it.mg) === b; }); }).length < 2) { step = 0; }
        render(); focusQuiet(qEl);
      });
      again.addEventListener('click', function () {
        step = 0; pick = { fam: '', band: 0, group: -1 };
        result.hidden = true; stage.hidden = false;
        render(); focusQuiet(qEl); schedule();
      });
      ask(form, {
        hook: 'H64', slot: 'finder',
        extra: function () { return { prefs: { family: pick.fam, size: 'band-' + pick.band, price: 'group-' + (pick.group + 1) }, picks: lastPicks.slice() }; },
        done: function () { show(form, 'done'); }
      });
      members.push(function (src) { if (src !== 'H64' && !result.hidden && currentStep(form) === 'email') { show(form, 'member', true); } });

      if (!win.fetch) { waitEl.hidden = true; failEl.hidden = false; return; }
      win.fetch('assets/catalogue.json')
        .then(function (r) { if (!r.ok) { throw new Error('catalogue ' + r.status); } return r.json(); })
        .then(function (d) {
          items = readCatalogue(d);
          waitEl.hidden = true;
          if (!items.length) { failEl.hidden = false; return; }
          render();
          schedule();
        })
        .catch(function () { waitEl.hidden = true; failEl.hidden = false; });
    }

    /* ================= 03 FIRST ACCESS (H65) ================= */
    function wireLots(room) {
      var form = q(room, 'form'), heldEmail = '';
      ask(form, { hook: 'H65', slot: 'lots', done: function (addr) { heldEmail = addr; show(form, 'sms'); } });
      var phone = q(form, '[data-field="phone"]'), sms = q(form, '[data-consent="sms"]');
      var errP = q(form, '[data-err="phone"]'), errM = q(form, '[data-err="sms"]'), errX = q(form, '[data-err="sms-send"]');
      var send = q(form, '[data-sms-send]'), skip = q(form, '[data-sms-skip]'), pwell = phone.closest('.pep-hooks-well');
      function checkPhone() {
        var ok = phoneOk(phone.value);
        errP.hidden = ok; phone.setAttribute('aria-invalid', ok ? 'false' : 'true');
        if (pwell) { if (ok) { pwell.removeAttribute('data-bad'); } else { pwell.setAttribute('data-bad', ''); } }
        return ok;
      }
      phone.addEventListener('blur', function () { if (phone.value) { checkPhone(); } });
      phone.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); send.click(); } });
      sms.addEventListener('change', function () { if (sms.checked) { errM.hidden = true; sms.setAttribute('aria-invalid', 'false'); } });
      var busy = false;
      send.addEventListener('click', function () {
        if (busy) { return; }
        var ok = checkPhone();
        if (!sms.checked) { errM.hidden = false; sms.setAttribute('aria-invalid', 'true'); ok = false; }
        if (!ok) { (phoneOk(phone.value) ? sms : phone).focus(); return; }
        busy = true; if (errX) { errX.hidden = true; }
        send.classList.add('pep-hooks-sending');
        var body = { form: 'first-access-sms', hook: 'H65', slot: 'lots', page: win.location.pathname, email: heldEmail, phone: phone.value.trim(),
          consent_sms: { given: true, text: visibleText(form, '[data-sms-text]'), at: new Date().toISOString() } };
        Promise.all([post(body), wait(motionMs(750))]).then(function () {
          send.classList.remove('pep-hooks-sending'); send.classList.add('pep-hooks-sent');
          phone.value = ''; heldEmail = '';
          var line = q(form, '[data-sms-done]'); if (line) { line.hidden = false; }
          ctx.track('ask_done', { hook: 'H65', slot: 'lots', kind: 'sms' });
          setTimeout(function () { busy = false; show(form, 'done'); }, motionMs(450));
        }, function () { busy = false; send.classList.remove('pep-hooks-sending'); if (errX) { errX.hidden = false; } });
      });
      skip.addEventListener('click', function () { heldEmail = ''; phone.value = ''; show(form, 'done'); });
      function member(src) { if (src !== 'H65' && currentStep(form) === 'email') { show(form, 'member', true); } }
      members.push(member);
      if (isJoined()) { member(null); }
    }

    /* ================= 04 SHARE PEPTICITY (H66) ================= */
    function makeCode() {
      var abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', a = new Uint8Array(8), i;
      if (win.crypto && win.crypto.getRandomValues) { win.crypto.getRandomValues(a); }
      else { var t = String(Date.now()) + String(win.performance ? win.performance.now() : 0); for (i = 0; i < 8; i++) { a[i] = t.charCodeAt(t.length - 1 - i) * (i + 7); } }
      for (i = 0; i < 8; i++) { out += abc.charAt(a[i] % abc.length); }
      return out;
    }
    function wireShare(room) {
      var form = q(room, 'form'), code = '';
      // the reward's words and numbers come from PEP_CONFIG.hooks.referral, and are written only while the switch is open
      if (gates.referral) {
        var fill = function (t) { return String(t || '').replace(/\{give\}/g, String(refCfg.givePercent)).replace(/\{get\}/g, String(refCfg.getPercent)); };
        var rh = q(room, '[data-reward-head]'), rl = q(room, '[data-reward-line]');
        if (rh) { rh.textContent = fill(refCfg.headline); }
        if (rl) { rl.textContent = fill(refCfg.line); rl.hidden = !refCfg.line; }
      }
      var linkIn = q(form, '[data-link]'), copyB = q(form, '[data-copy]'), shareB = q(form, '[data-share]'), live = q(form, '[data-copy-live]');
      var idle = q(form, '[data-copy-idle]'), copied = q(form, '[data-copy-done]');
      // THE LINK IS SHOWN ONLY FOR A CODE THIS FORM SENT. The code is made for the send, rides in it (ref), and is kept
      // (the code alone) once the send really reached the list, so a member has one link, the same on every visit.
      function showLink(quiet) { linkIn.value = win.location.origin + win.location.pathname + '?ref=' + code; show(form, 'link', quiet); }
      ask(form, { hook: 'H66', slot: 'share',
        extra: function () {
          if (!code) { code = makeCode(); }
          var x = { ref: code };                         // on this form `ref` is the visitor's OWN new code
          if (invitedBy) { x.invited_by = invitedBy; }   // and the member who invited them rides beside it
          return x;
        },
        done: function () { if (reallySends()) { setOwn('ref', code); } showLink(false); } });
      if (win.navigator && typeof win.navigator.share === 'function') { shareB.hidden = false; }
      var resetTimer = 0;
      function copiedState() {
        idle.hidden = true; copied.hidden = false; live.textContent = copied.textContent;
        ctx.track('share_copy', { hook: 'H66', slot: 'share', kind: 'copy' });
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () { idle.hidden = false; copied.hidden = true; live.textContent = ''; }, 2600);
      }
      function byHand() { linkIn.focus(); linkIn.select(); try { if (doc.execCommand && doc.execCommand('copy')) { copiedState(); } } catch (e) { /* the link stays selected for copying by hand */ } }
      copyB.addEventListener('click', function () {
        var text = linkIn.value;
        if (win.navigator.clipboard && win.navigator.clipboard.writeText) { win.navigator.clipboard.writeText(text).then(copiedState, byHand); } else { byHand(); }
      });
      shareB.addEventListener('click', function () {
        win.navigator.share({ title: 'PEPTICITY', url: linkIn.value }).then(function () { ctx.track('share_copy', { hook: 'H66', slot: 'share', kind: 'share' }); }, function () {});
      });
      // a returning member whose code was sent before sees that same link; any other member is asked for the one field,
      // because a link nobody sent could never be credited to them
      if (isJoined() && ownCode()) { code = ownCode(); showLink(true); }
    }

    /* ================= THE OVERLAYS: EXIT (H67) and the PHONE BAR (H68) ================= */
    var overlayRoot = null, exitEl = null, bar = null, barRow = null, sheet = null, openB = null;
    var exitOn = false, armed = false, barOn = false, barOpen = false, memSession = false, kb = false, barSeen = false;
    var cartRoot = doc.querySelector('[data-module="cart"]'), guideRoot = doc.querySelector('[data-module="guide"]');
    var mqPhone = win.matchMedia ? win.matchMedia('(max-width: 767px)') : null;
    var mqCoarse = win.matchMedia ? win.matchMedia('(pointer: coarse)') : null;
    function phone() { return !!(mqPhone && mqPhone.matches); }
    function cartOpen() { return !!((cartRoot && cartRoot.hasAttribute('data-open')) || (overlayRoot && overlayRoot.hasAttribute('inert'))); }
    function guideOpen() { return !!(guideRoot && guideRoot.hasAttribute('data-open')); }
    var entered = false;
    try { entered = !!ctx.motion.reduced || win.sessionStorage.getItem('pep_entrance_seen') === '1'; } catch (e) { entered = !!ctx.motion.reduced; }
    ctx.on('entrance:done', function () { entered = true; schedule(); });
    if (!entered) { setTimeout(function () { entered = true; schedule(); }, 5600); }

    // what counts as another ask: every lead form on the page outside this module, the cart and the guide, and each room's pane
    var rooms = [];
    function foreignAsks() {
      return qa(doc, 'form[data-hook]').filter(function (f) {
        return !f.closest('[data-module="hooks"]') && !f.closest('[data-module="cart"]') && !f.closest('[data-module="guide"]');
      });
    }
    function shown(el) { return !!(el && el.getClientRects().length); }
    function inView(el, ahead) {
      if (!shown(el)) { return false; }
      var r = el.getBoundingClientRect(), vh = win.innerHeight;
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < vh + (ahead || 0);
    }
    function anyAskInView(ahead) {
      return foreignAsks().some(function (f) { return inView(f, ahead); }) || rooms.some(function (r) { return inView(r.frame, ahead); });
    }
    function protectedInView() { return qa(doc, '[data-module="story"], [data-module="lineup"]').some(function (el) { return inView(el, 0); }); }

    function sessionSeen() { try { return win.sessionStorage.getItem(SESSION_KEY) === '1' || memSession; } catch (e) { return memSession; } }
    function markSession() { memSession = true; try { win.sessionStorage.setItem(SESSION_KEY, '1'); } catch (e) { /* memory only */ } }
    function everCount() { var o = ctx.state.get(OWN, null); return o && typeof o.exitSeen === 'number' ? o.exitSeen : 0; }
    function bumpEver() { setOwn('exitSeen', everCount() + 1); }
    function maxEver() { return num(exitCfg.maxEver) ? exitCfg.maxEver : 3; }

    function tryExit() {
      if (!exitEl || exitOn || !armed || isJoined() || !entered || cartOpen() || guideOpen() || barOpen) { return false; }
      if (sessionSeen() || everCount() >= maxEver()) { return false; }
      if (anyAskInView(0) || protectedInView()) { return false; }
      exitOn = true; markSession(); bumpEver();
      exitEl.setAttribute('data-on', '');
      ctx.track('ask_view', { hook: 'H67', slot: 'exit', state: 'NEW' });
      update();
      return true;
    }
    function closeExit() {
      if (!exitOn) { return; }
      exitOn = false;
      if (exitEl.contains(doc.activeElement)) { doc.activeElement.blur(); }
      exitEl.removeAttribute('data-on');
      update();
    }
    function setBar(on) {
      if (!bar || on === barOn) { return; }
      barOn = on;
      if (on) {
        bar.setAttribute('data-on', '');
        if (!barSeen) { barSeen = true; ctx.track('ask_view', { hook: 'H68', slot: 'bar', state: 'NEW' }); }
      } else { bar.removeAttribute('data-on'); }
    }
    function closeBar() {
      if (!barOpen) { return; }
      barOpen = false;
      if (bar.contains(doc.activeElement)) { doc.activeElement.blur(); }
      bar.removeAttribute('data-open'); sheet.hidden = true; barRow.hidden = false; openB.setAttribute('aria-expanded', 'false');
      update();
    }
    function kbOpen() { var vv = win.visualViewport; return kb || !!(vv && phone() && vv.height < win.innerHeight * 0.72); }
    function update() {
      revealCheck();
      if (!overlayRoot) { return; }
      if (exitOn && (anyAskInView(0) || protectedInView() || cartOpen() || guideOpen())) { closeExit(); return; }
      if (barOpen && (anyAskInView(0) || protectedInView() || cartOpen() || guideOpen())) { closeBar(); return; }
      // ANY ask counts: the hero's form, every room, the doors' forms (H61, H62) and any other lead form on the page; the bar
      // also steps aside a quarter screen BEFORE an ask comes up from below, so the two are never on one screen
      var ok = barOpen || (phone() && !isJoined() && entered && !cartOpen() && !guideOpen() && !exitOn && !kbOpen() && !anyAskInView(Math.round(win.innerHeight * 0.25)) && !protectedInView());
      setBar(ok);
    }
    // timers, not animation frames: the page's 3D can hold frames back (and with them the scroll events), and these rules
    // must never wait for a frame. The scroll position is read every 100 ms; any move re-runs the rules at once.
    var tick = 0, seenY = -1;
    function schedule() { if (tick) { return; } tick = setTimeout(function () { tick = 0; update(); }, 40); }
    setInterval(function () {
      if (doc.hidden) { return; }
      var y = win.scrollY || win.pageYOffset || 0;
      if (y !== seenY) { seenY = y; update(); }
    }, 100);
    setInterval(function () { if (!doc.hidden) { update(); } }, 600);

    function wireOverlays(root) {
      overlayRoot = root;
      exitEl = q(root, '[data-hooks-exit]'); bar = q(root, '[data-hooks-bar]');
      barRow = q(bar, '[data-hooks-bar-row]'); sheet = q(bar, '[data-hooks-bar-sheet]'); openB = q(bar, '[data-hooks-bar-open]');
      var exitForm = q(exitEl, 'form'), barForm = q(sheet, 'form'), barHead = q(bar, '[data-hooks-bar-head]');

      ask(exitForm, { hook: 'H67', slot: 'exit', done: function () { show(exitForm, 'done'); } });
      qa(exitEl, '[data-hooks-exit-close]').forEach(function (b) { b.addEventListener('click', closeExit); });
      ask(barForm, { hook: 'H68', slot: 'bar', done: function () { show(barForm, 'done'); } });
      openB.addEventListener('click', function () {
        barOpen = true;
        bar.setAttribute('data-open', ''); barRow.hidden = true; sheet.hidden = false; openB.setAttribute('aria-expanded', 'true');
        ctx.track('cta_click', { hook: 'H68', slot: 'bar' });
        focusQuiet(barHead);
        update();
      });
      qa(bar, '[data-hooks-bar-close]').forEach(function (b) { b.addEventListener('click', closeBar); });
      doc.addEventListener('keydown', function (e) { if (e.key === 'Escape' || e.key === 'Esc') { if (exitOn) { closeExit(); } if (barOpen) { closeBar(); } } });

      // the exit trigger, desktop: the pointer leaves through the top edge (ouibounce's pattern), armed after a while on the page
      setTimeout(function () { armed = true; root.setAttribute('data-hooks-armed', ''); }, num(exitCfg.armAfterMs) ? exitCfg.armAfterMs : 8000);
      var exitTimer = 0;
      doc.documentElement.addEventListener('mouseleave', function (e) {
        if (typeof e.clientY !== 'number' || e.clientY > 20) { return; }
        clearTimeout(exitTimer);
        exitTimer = setTimeout(tryExit, 250);
      });
      doc.documentElement.addEventListener('mouseenter', function () { clearTimeout(exitTimer); });
      // phones: a fast flick back up (more than 30% of the screen within 300 ms) after the visitor has seen half the page
      // the position is read on every scroll event AND every 100 ms on touch screens, so a flick is seen even when the
      // page's 3D holds frames (and with them the scroll events) back
      var samples = [], depth = 0;
      function sample() {
        if (!(mqCoarse && mqCoarse.matches)) { return; }
        var y = win.scrollY || win.pageYOffset || 0, t = Date.now(), vh = win.innerHeight, H = doc.documentElement.scrollHeight || 1;
        depth = Math.max(depth, (y + vh) / H);
        samples.push([t, y]);
        while (samples.length && t - samples[0][0] > 300) { samples.shift(); }
        if (depth < 0.5) { return; }
        var peak = 0;
        samples.forEach(function (s) { if (s[1] > peak) { peak = s[1]; } });
        if (peak - y > vh * 0.3) { samples = []; tryExit(); }
      }
      win.addEventListener('scroll', function () { schedule(); sample(); }, { passive: true });
      setInterval(function () { if (!doc.hidden) { sample(); } }, 100);

      // keyboard open on a phone: a field outside the bar holds the focus
      doc.addEventListener('focusin', function (e) {
        var t = e.target;
        kb = !!(t && t.matches && t.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select') && !bar.contains(t));
        schedule();
      });
      doc.addEventListener('focusout', function () {
        setTimeout(function () {
          var a = doc.activeElement;
          kb = !!(a && a.matches && a.matches('input:not([type="checkbox"]):not([type="radio"]), textarea, select') && !bar.contains(a));
          schedule();
        }, 0);
      });
      if (win.visualViewport) { win.visualViewport.addEventListener('resize', schedule); }
      if (mqPhone && mqPhone.addEventListener) { mqPhone.addEventListener('change', schedule); }
      ['cart:open', 'cart:close', 'cart:changed', 'cart:add'].forEach(function (n) { ctx.on(n, function () { schedule(); setTimeout(schedule, 60); }); });
      if (win.MutationObserver) {
        var mo = new win.MutationObserver(schedule);
        [cartRoot, guideRoot, root].forEach(function (el) { if (el) { mo.observe(el, { attributes: true, attributeFilter: ['data-open', 'inert'] }); } });
      }
      win.addEventListener('resize', schedule, { passive: true });
      schedule();
    }

    /* ================= the reveal: a pane glides in once its room is in view ================= */
    var io = ('IntersectionObserver' in win) ? new win.IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) { return; }
        io.unobserve(en.target);
        reveal(en.target);
      });
    }, { threshold: 0.2 }) : null;
    // the same test without the observer, run by update(): a fifth of the pane (or of the screen) in view lights it
    function revealCheck() {
      var vh = win.innerHeight;
      rooms.forEach(function (r) {
        if (!r.frame || r.frame.hasAttribute('data-revealed') || !shown(r.frame)) { return; }
        var b = r.frame.getBoundingClientRect(), seen = Math.min(b.bottom, vh) - Math.max(b.top, 0);
        if (seen > Math.min(b.height, vh) * 0.2) { if (io) { io.unobserve(r.frame); } reveal(r.frame); }
      });
    }
    function reveal(frame) {
      if (frame.hasAttribute('data-revealed')) { return; }
      frame.setAttribute('data-revealed', '');
      var r = frame.closest('[data-hooks]'), f = q(r, 'form[data-hook]');
      ctx.track('ask_view', { hook: f ? f.getAttribute('data-hook') : '', slot: r.getAttribute('data-hooks'), state: isJoined() ? 'TEAM' : 'NEW' });
    }

    /* ================= the spacing rule: a screen and a margin between any two asks ================= */
    var spacing = false, spaceTimer = 0;
    function docTop(el) {
      // the frame moves with transform while it reveals, so read its layout position, not its painted one
      var room = el.closest('[data-hooks]');
      if (room && el.classList.contains('pep-hooks-frame')) { return room.getBoundingClientRect().top + (win.scrollY || 0) + el.offsetTop; }
      return el.getBoundingClientRect().top + (win.scrollY || 0);
    }
    function docBottom(el) { return docTop(el) + (el.classList.contains('pep-hooks-frame') ? el.offsetHeight : el.getBoundingClientRect().height); }
    function spaceAsks() {
      if (spacing || !rooms.length) { return; }
      spacing = true;
      try {
        rooms.forEach(function (r) { r.root.style.removeProperty('--pep-hooks-extra-top'); r.root.style.removeProperty('--pep-hooks-extra-bottom'); });
        var need = (win.innerHeight || 800) + 48;
        var list = foreignAsks().filter(shown).map(function (f) { return { el: f, room: null }; })
          .concat(rooms.filter(function (r) { return shown(r.frame); }).map(function (r) { return { el: r.frame, room: r }; }));
        list.sort(function (a, b) { return docTop(a.el) - docTop(b.el); });
        for (var i = 1; i < list.length; i++) {
          var a = list[i - 1], b = list[i];
          var gap = docTop(b.el) - docBottom(a.el);
          if (gap >= need) { continue; }
          var add = Math.ceil(need - gap);
          if (b.room) { b.room.root.style.setProperty('--pep-hooks-extra-top', add + 'px'); }
          else if (a.room) { a.room.root.style.setProperty('--pep-hooks-extra-bottom', add + 'px'); }
        }
      } finally { spacing = false; }
      schedule();
    }
    function spaceSoon() { clearTimeout(spaceTimer); spaceTimer = setTimeout(spaceAsks, 120); }
    win.addEventListener('load', spaceSoon);
    win.addEventListener('resize', spaceSoon, { passive: true });
    if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(spaceSoon, function () {}); }
    if (win.ResizeObserver) {
      var ro = new win.ResizeObserver(spaceSoon);
      qa(doc, 'body > [data-module]:not([data-module="hooks"])').forEach(function (el) { ro.observe(el); });
    }

    function add(root) {
      root.setAttribute('data-hooks-js', '');
      applyGates(root);
      // a pane is never scrolled inside itself (hooks.css clips it; this holds it on a browser without overflow: clip)
      qa(root, '.pep-hooks-glass').forEach(function (g) {
        g.addEventListener('scroll', function () { if (g.scrollLeft || g.scrollTop) { g.scrollLeft = 0; g.scrollTop = 0; } });
      });
      var kind = root.getAttribute('data-hooks');
      if (kind === 'overlays') { wireOverlays(root); spaceSoon(); return; }
      var frame = q(root, '[data-hooks-ask]');
      rooms.push({ root: root, frame: frame });
      if (kind === 'card') { wireCard(root); }
      else if (kind === 'finder') { wireFinder(root); }
      else if (kind === 'lots') { wireLots(root); }
      else if (kind === 'share') { wireShare(root); }
      if (frame) { if (io) { io.observe(frame); } else { reveal(frame); } }
      spaceSoon();
    }

    return { add: add };
  }
})();

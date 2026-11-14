<script data-pep-src="modules/10-hero/hero.js">
(function () {
  'use strict';
  PEP.register('hero', {
    init: function (root, ctx) {
      var cfg = ctx.config, flags = cfg.flags || {};
      var q = function (s) { return root.querySelector(s); };
      var qa = function (s) { return Array.prototype.slice.call(root.querySelectorAll(s)); };

      // ---- counsel switch: preview shows the offer for review; live shows it only once cleared
      var cleared = flags.COUNSEL_CLEARED || {};
      var offerOn = !!((flags.PREVIEW || cleared.offer) && cfg.offer && cfg.offer.text);
      var gates = { offer: offerOn, restock: !!(flags.PREVIEW || cleared.restock), names: !!(flags.PREVIEW || cleared.names) };
      Object.keys(gates).forEach(function (k) {
        qa('[data-gate="' + k + '"]').forEach(function (el) { el.hidden = !gates[k]; });
        qa('[data-gate-off="' + k + '"]').forEach(function (el) { el.hidden = gates[k]; });
      });
      var offerText = q('[data-offer-text]');
      if (offerText && offerOn) { offerText.textContent = cfg.offer.text; }
      var previewNote = q('[data-preview-note]');

      // ---- 3D: the word and the bottle (the P stands in the next section, 11-crest)
      var word = q('.pep-hero-word'), bottle = q('.pep-hero-bottle');
      // how the word is seen: the numbers live on the element in hero.html (camera and light only; the engine clamps them)
      var seen = function (key) { var n = parseFloat(word.getAttribute('data-' + key)); return isFinite(n) ? n : undefined; };
      var view = word ? { dist: seen('dist'), span: seen('span'), low: seen('low'), square: seen('square') === 1, pointer: seen('lean'), look: [seen('look-x'), seen('look-y')], light: seen('light') } : null;
      function announce() {
        // phase only times the light that crosses the word: -0.5 has the whole word lit while the page opens
        if (word) { ctx.emit('logo3d:slot', { el: word, kind: 'word', phase: -0.5, view: view }); }
      }
      root.setAttribute('data-3d', 'pending');     // script is running: the flat word steps aside for the 3D one
      ctx.on('logo3d:ready', announce); announce();
      ctx.on('logo3d:on', function () { root.setAttribute('data-3d', 'on'); });
      ctx.on('logo3d:off', function () { root.setAttribute('data-3d', 'off'); });
      // the product name goes on the label only in preview or once names are cleared; otherwise the label carries the brand alone
      var lineSource = q('[data-bottle-line-source]');
      if (lineSource) { lineSource.hidden = true; }      // a holder for the text, never shown itself
      if (bottle && gates.names && lineSource) { bottle.setAttribute('data-bottle-line', lineSource.textContent.trim()); }
      function mountBottle() { if (bottle) { ctx.emit('bottle:mount', { el: bottle }); } }
      ctx.on('bottle:ready', mountBottle); mountBottle();

      // ---- HOV-02: the card leans a breath toward the pointer (the bottle never tilts: its label must stay square)
      var card = q('.pep-hero-card');
      if (!ctx.motion.reduced && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
        var raf = 0, px = 0, py = 0;
        root.addEventListener('pointermove', function (e) {
          var r = root.getBoundingClientRect();
          px = (e.clientX - r.left) / r.width - 0.5; py = (e.clientY - r.top) / r.height - 0.5;
          if (raf) { return; }
          raf = requestAnimationFrame(function () {
            raf = 0;
            if (card) { card.style.setProperty('--pep-hero-rx', (-py * 3).toFixed(2) + 'deg'); card.style.setProperty('--pep-hero-ry', (px * 4).toFixed(2) + 'deg'); }
          });
        }, { passive: true });
        root.addEventListener('pointerleave', function () {
          if (card) { card.style.setProperty('--pep-hero-rx', '0deg'); card.style.setProperty('--pep-hero-ry', '0deg'); }
        });
      }

      // ---- the ask (hook H01): one field, consent, submit morph, then the next step
      var form = q('.pep-hero-form');
      if (!form) { return; }
      var steps = { email: q('[data-step="email"]'), name: q('[data-step="name"]'), done: q('[data-step="done"]') };
      var email = q('#pep-hero-email'), consent = q('[data-consent]'), btn = form.querySelector('button[type="submit"]');
      var emailErr = q('#pep-hero-email-err'), consentErr = q('#pep-hero-consent-err');
      var first = q('#pep-hero-first'), firstOut = q('[data-first-name]');
      var FLOW = 'pep_flow_v1';

      function show(name, quiet) {
        Object.keys(steps).forEach(function (k) { if (steps[k]) { steps[k].hidden = k !== name; } });
        form.classList.toggle('pep-hero-joined', name !== 'email');
        var head = steps[name] && steps[name].querySelector('[data-step-head]');
        if (head && name !== 'email' && !quiet) { try { head.focus({ preventScroll: true }); } catch (e) { head.focus(); } }
      }
      function setName(v) {
        if (!firstOut) { return; }
        v = typeof v === 'string' ? v : '';
        firstOut.textContent = v ? ', ' + v.toUpperCase() : '';
      }
      function emailOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test((email.value || '').trim()); }
      function checkEmail() {
        var ok = emailOk();
        emailErr.hidden = ok; email.setAttribute('aria-invalid', ok ? 'false' : 'true');
        return ok;
      }

      // a member is never asked for an email twice
      var flow = ctx.state.get(FLOW, null);
      if (flow && flow.stage && flow.stage !== 'NEW') { show('done', true); }       // no focus jump on a plain page load

      email.addEventListener('blur', function () { if (email.value) { checkEmail(); } });
      email.addEventListener('input', function () { if (!emailErr.hidden && emailOk()) { checkEmail(); } });
      email.addEventListener('focus', function () { ctx.track('ask_start', { hook: 'H01', slot: 'hero' }); }, { once: true });
      consent.addEventListener('change', function () { if (consent.checked) { consentErr.hidden = true; } });

      var busy = false, joinedEmail = '';
      // endpoint empty = nothing is sent. A refused (4xx/5xx), failed or hung (10 s) request rejects.
      function post(endpoint, body) {
        if (!endpoint) { return Promise.resolve(null); }
        try {
          var ac = typeof AbortController === 'function' ? new AbortController() : null;
          var timer = setTimeout(function () { if (ac) { ac.abort(); } }, 10000);
          return fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ac ? ac.signal : undefined })
            .then(function (r) { clearTimeout(timer); if (!r.ok) { throw new Error('send refused ' + r.status); } return r; },
                  function (err) { clearTimeout(timer); throw err; });
        } catch (err) { return Promise.reject(err); }
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (busy) { return; }
        var ok = checkEmail();
        if (!consent.checked) { consentErr.hidden = false; ok = false; }
        if (!ok) { (emailOk() ? consent : email).focus(); return; }

        busy = true;
        btn.classList.add('pep-hero-sending');
        var endpoint = cfg.form && cfg.form.endpoint;
        var consentText = (q('[data-consent-text]') || {}).textContent || '';
        joinedEmail = email.value.trim();                // kept in memory for this page view only
        var send = post(endpoint, { form: 'team-join', hook: 'H01', slot: 'hero', page: location.pathname,
          email: joinedEmail, consent: { email: true, text: consentText.trim(), at: new Date().toISOString() } });
        var wait = new Promise(function (res) { setTimeout(res, ctx.motion.reduced ? 0 : 750); });

        Promise.all([send, wait]).then(function () {
          btn.classList.remove('pep-hero-sending'); btn.classList.add('pep-hero-sent');
          // only the stage and the time are kept in this browser: never the email
          ctx.state.set(FLOW, { stage: 'TEAM', joinedAt: new Date().toISOString(), hooksDone: ['H01'] });
          ctx.track('ask_done', { hook: 'H01', slot: 'hero' });
          ctx.emit('flow:state', { from: 'NEW', to: 'TEAM' });
          if (previewNote && flags.PREVIEW && !endpoint) { previewNote.hidden = false; }
          setTimeout(function () { busy = false; show('name'); }, ctx.motion.reduced ? 0 : 520);
        }).catch(function () {
          busy = false; btn.classList.remove('pep-hero-sending');
          var sendErr = q('[data-send-err]'); if (sendErr) { sendErr.hidden = false; }
        });
      });

      function finishName(v) {
        // the name is personal: it goes to the list with the email (when a list is connected) and is never kept in this browser
        if (v && joinedEmail) { post(cfg.form && cfg.form.endpoint, { form: 'team-join-name', hook: 'H01', email: joinedEmail, first_name: v }).catch(function () {}); }
        setName(v); show('done');
      }
      var save = q('[data-save-name]'), skip = q('[data-skip-name]');
      if (save) { save.addEventListener('click', function () { finishName((first.value || '').replace(/[<>]/g, '').trim().slice(0, 40)); }); }
      if (skip) { skip.addEventListener('click', function () { finishName(''); }); }
      if (first) { first.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); save.click(); } }); }

      ctx.track('ask_view', { hook: 'H01', slot: 'hero', state: (flow && flow.stage) || 'NEW' });
    }
  });
})();
</script>
/* PEPTICITY SALES SITE · shared core (both colourways)
   Cart, product cards, capture forms (CASL, honeypot, single send), finder, set builder,
   age/province gate, checkout preview, exit + return hooks, smooth scroll, reveals, tilt.
   PREVIEW BUILD: FORM_ENDPOINT is empty, so nothing leaves the browser. Leads are kept in
   localStorage only so the flows can be tested. Events go to window.dataLayer, never field values. */
(function (W, D) {
  'use strict';
  var CFG = W.PEP_CFG = Object.assign({
    FORM_ENDPOINT: '',              // live: one endpoint (GHL / store) - empty = preview, nothing sent
    COUNSEL: { names: true, offer: true, restock: true }, // [COUNSEL TO CLEAR] switches (peptide-regulatory)
    OFFER_PCT: 15,                  // grand-opening first order (owner R105) [counsel + Grace to confirm]
    SET_PCT: '[X]',                 // quantity break for any three [Grace to confirm]
    FREE_SHIP: '[X]'                // free shipping threshold CAD [Grace to confirm]
  }, W.PEP_CFG || {});

  /* ---------------- products (names + sizes only, from shared/inventory.js) ---------------- */
  var IMG = 'core/img/vial-front.webp';
  var P = [
    { k: 'bpc-157', name: 'BPC-157', sizes: ['10 mg'], shelf: 1 },
    { k: 'tb-500', name: 'TB-500', sizes: ['10 mg'], shelf: 1 },
    { k: 'kpv', name: 'KPV', sizes: ['10 mg'], shelf: 1 },
    { k: 'epitalon', name: 'EPITALON', sizes: ['10 mg', '50 mg'], shelf: 2 },
    { k: 'mots-c', name: 'MOTS-C', sizes: ['10 mg', '40 mg'], shelf: 2 },
    { k: 'ghk-cu', name: 'GHK-CU', sizes: ['50 mg', '100 mg'], shelf: 2 },
    { k: 'nad', name: 'NAD+', sizes: ['1000 mg'], shelf: 3 },
    { k: 'glutathione', name: 'GLUTATHIONE', sizes: ['1500 mg'], shelf: 3 },
    { k: 'igf-1-lr3', name: 'IGF-1 LR3', sizes: ['[size: Grace to confirm]'], shelf: 3, soon: true }
  ];
  var SHELVES = {
    1: { title: 'SHELF 01 · THE 10 MG VIALS', note: 'One size, one vial, one lot number.' },
    2: { title: 'SHELF 02 · TWO SIZES', note: 'Each comes in a smaller and a larger vial.' },
    3: { title: 'SHELF 03 · THE LARGE FORMATS', note: 'The biggest vials on the shelf.' }
  };
  var byK = {}; P.forEach(function (p) { byK[p.k] = p; });
  var PRICE = '$[PRICE]';
  W.PEP = { products: P, shelves: SHELVES, byK: byK, img: IMG };

  /* ---------------- utils ---------------- */
  var $ = function (s, r) { return (r || D).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); };
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem('pep_' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem('pep_' + k, JSON.stringify(v)); } catch (e) {} }
  };
  var ss = {
    get: function (k) { try { return sessionStorage.getItem('pep_' + k); } catch (e) { return null; } },
    set: function (k, v) { try { sessionStorage.setItem('pep_' + k, v); } catch (e) {} }
  };
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function track(ev, data) { (W.dataLayer = W.dataLayer || []).push(Object.assign({ event: ev, way: D.documentElement.dataset.way }, data || {})); }
  W.PEP.track = track; W.PEP.$ = $; W.PEP.$$ = $$; W.PEP.store = store; W.PEP.esc = esc;
  var reduce = W.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = W.matchMedia('(hover: hover) and (pointer: fine)').matches;
  W.PEP.reduce = reduce; W.PEP.fine = fine;

  /* ---------------- toast ---------------- */
  var toastEl, toastT;
  function toast(msg) {
    if (!toastEl) { toastEl = D.createElement('div'); toastEl.className = 'toast glass'; toastEl.setAttribute('role', 'status'); toastEl.setAttribute('aria-live', 'polite'); D.body.appendChild(toastEl); }
    toastEl.textContent = msg; toastEl.classList.add('on'); clearTimeout(toastT);
    toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 2600);
  }
  W.PEP.toast = toast;

  /* ---------------- product card markup ---------------- */
  function cardHTML(p, opts) {
    opts = opts || {};
    var sizes = p.sizes.length > 1 ? '<div class="sizes" role="group" aria-label="Vial size for ' + esc(p.name) + '">' + p.sizes.map(function (s, i) {
      return '<button type="button" class="size" data-size="' + esc(s) + '" aria-pressed="' + (i === 0) + '">' + esc(s) + '</button>'; }).join('') + '</div>'
      : '<div class="meta">' + esc(p.sizes[0]) + ' · one vial</div>';
    var act = p.soon
      ? '<button type="button" class="btn ghost" data-notify="' + p.k + '">TELL ME WHEN IT LANDS</button>'
      : '<button type="button" class="btn ghost" data-add="' + p.k + '" data-cta="add-' + p.k + '"><span class="lbl">ADD TO CART</span></button>';
    return '<article class="card glass ' + (opts.cls || '') + '" data-k="' + p.k + '"' + (opts.attrs || '') + '>' +
      (p.soon ? '<span class="chip">COMING SOON</span>' : '') +
      '<div class="vial"><img src="' + IMG + '" alt="PEPTICITY vial, ' + esc(p.name) + '" loading="lazy" width="525" height="876"></div>' +
      '<h3>' + esc(p.name) + '</h3>' + sizes +
      '<div class="price">' + (p.soon ? '<span class="small">Price when it lands</span>' : PRICE + ' <span class="small">CAD</span>') + '</div>' + act + '</article>';
  }
  W.PEP.cardHTML = cardHTML;

  /* ---------------- cart ---------------- */
  var cart = store.get('cart', []);
  function joined() { return !!store.get('joined', false); }
  function saveCart() { store.set('cart', cart); renderCart(); }
  function addToCart(k, size, n, silent) {
    var p = byK[k]; if (!p || p.soon) return;
    size = size || p.sizes[0];
    var line = cart.find(function (l) { return l.k === k && l.size === size; });
    if (line) line.q += (n || 1); else cart.push({ k: k, size: size, q: n || 1 });
    saveCart(); track('add_to_cart', { item: k });
    if (!silent) toast(p.name + ' · ' + size + ' added');
  }
  W.PEP.add = addToCart;
  W.PEP.addSet = function (keys) { keys.forEach(function (k) { cart.push({ k: k, size: byK[k].sizes[0], q: 1, set: true }); }); saveCart(); track('set_add'); toast('Set of three added'); openCart(); };
  function count() { return cart.reduce(function (a, l) { return a + l.q; }, 0); }

  function buildDrawer() {
    var d = D.createElement('div'); d.className = 'drawer'; d.id = 'cart';
    d.innerHTML = '<div class="scrim" data-close></div><aside class="panel glass" role="dialog" aria-modal="true" aria-labelledby="cart-h">' +
      '<button class="hexbtn x" data-close aria-label="Close cart">&#x2715;</button>' +
      '<h2 id="cart-h">YOUR CART</h2>' +
      '<div class="lines" id="cart-lines"></div>' +
      '<div class="totals" id="cart-totals"></div>' +
      '<form class="join-line" data-capture="cart-join" novalidate style="margin-top:14px">' +
        '<div class="todo"><p class="small" style="margin:0 0 8px;text-align:center">JOIN THE PEPTICITY TEAM FOR ' + CFG.OFFER_PCT + '% OFF THIS ORDER</p>' +
        '<div class="form-row"><div class="field"><label for="cj-e" class="sr">Email</label><input class="input" id="cj-e" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required data-hint="Add your email, e.g. name@example.com"><span class="msg" aria-live="polite"></span></div>' +
        '<button class="btn ghost" style="--h:52px">JOIN</button></div>' +
        '<label class="consent" style="margin-top:10px"><input type="checkbox" name="consent_email"><span>Yes, PEPTICITY may email me news and offers. I can unsubscribe at any time. [legal name] · [mailing address] · <a href="#privacy">privacy</a></span></label>' +
        '<input class="hp" tabindex="-1" autocomplete="off" name="company" aria-hidden="true"></div>' +
        '<div class="done"><p class="small">You are on the team. ' + CFG.OFFER_PCT + '% is on this order.</p></div></form>' +
      '<button class="btn" id="checkout" style="margin-top:16px">CHECKOUT <span class="arw">&#x2192;</span></button>' +
      '<button class="btn ghost" data-close style="margin-top:10px">CONTINUE SHOPPING</button></aside>';
    D.body.appendChild(d);
    $$('[data-close]', d).forEach(function (b) { b.addEventListener('click', closeCart); });
    $('#checkout', d).addEventListener('click', function () { if (!count()) { toast('Your cart is empty'); return; } closeCart(); openGate(); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeCart(); trap(e, $('.panel', d)); });
    return d;
  }
  var drawer, lastFocus;
  function openCart() {
    drawer = drawer || buildDrawer(); renderCart(); lastFocus = D.activeElement;
    drawer.classList.add('open'); lock(true); setTimeout(function () { $('.x', drawer).focus(); }, 60); track('cart_open');
  }
  function closeCart() { if (!drawer) return; drawer.classList.remove('open'); lock(false); if (lastFocus) lastFocus.focus(); }
  W.PEP.openCart = openCart;
  function renderCart() {
    $$('[data-count]').forEach(function (el) { el.textContent = count(); });
    $$('.bar .count').forEach(function (el) { el.textContent = count() ? count() + (count() === 1 ? ' ITEM' : ' ITEMS') + ' IN CART' : 'FIRST ORDER ' + CFG.OFFER_PCT + '% OFF'; });
    var bar = $('.bar'); if (bar) bar.classList.toggle('has', count() > 0);
    if (!drawer) return;
    var L = $('#cart-lines', drawer), T = $('#cart-totals', drawer);
    if (!cart.length) { L.innerHTML = '<div class="empty">Nothing here yet.<br>The collection is one scroll away.</div>'; }
    else L.innerHTML = cart.map(function (l, i) {
      var p = byK[l.k];
      return '<div class="line"><img src="' + IMG + '" alt=""><div><b>' + esc(p.name) + '</b><span class="small">' + esc(l.size) + ' · ' + PRICE + '</span>' + (l.set ? '<span class="small" style="display:block">SET OF THREE</span>' : '') + '</div>' +
        '<div class="qty"><button type="button" aria-label="One less ' + esc(p.name) + '" data-q="' + i + '" data-d="-1">&minus;</button><span aria-live="polite">' + l.q + '</span><button type="button" aria-label="One more ' + esc(p.name) + '" data-q="' + i + '" data-d="1">+</button></div></div>';
    }).join('');
    var sets = cart.some(function (l) { return l.set; });
    T.innerHTML = '<div><span>Subtotal (' + count() + ')</span><span>$[SUBTOTAL]</span></div>' +
      (sets ? '<div><span>Set of three · ' + CFG.SET_PCT + '% off</span><span>&minus;$[X]</span></div>' : '') +
      (CFG.COUNSEL.offer && joined() ? '<div><span>PEPTICITY TEAM · ' + CFG.OFFER_PCT + '% OFF FIRST ORDER</span><span>&minus;$[X]</span></div>' : '') +
      '<div><span>Shipping</span><span>$[SHIPPING]</span></div><div class="ship" aria-hidden="true"><i style="width:' + Math.min(100, count() * 22) + '%"></i></div>' +
      '<div class="small">Free shipping over $' + CFG.FREE_SHIP + ' CAD [Grace to confirm]. Taxes shown at checkout.</div>' +
      '<div class="big"><span>Total before tax</span><span>$[TOTAL]</span></div>';
    var jl = $('.join-line', drawer); if (jl) jl.style.display = (CFG.COUNSEL.offer && !joined()) ? '' : 'none';
    $$('[data-q]', L).forEach(function (b) { b.addEventListener('click', function () {
      var i = +b.dataset.q, d = b.dataset.d, l = cart[i]; l.q += +d; if (l.q < 1) cart.splice(i, 1); saveCart(); var nb = $('[data-q="' + i + '"][data-d="' + d + '"]', drawer) || $('.x', drawer); nb.focus(); }); });
  }

  /* ---------------- focus trap + scroll lock ---------------- */
  function trap(e, box) {
    if (e.key !== 'Tab' || !box) return;
    var f = $$('a[href],button:not([disabled]),input:not(.hp),select,[tabindex="0"]', box).filter(function (x) { return x.offsetParent !== null; });
    if (!f.length) return; var a = f[0], z = f[f.length - 1];
    if (e.shiftKey && D.activeElement === a) { e.preventDefault(); z.focus(); } else if (!e.shiftKey && D.activeElement === z) { e.preventDefault(); a.focus(); }
  }
  var lenis;
  function lock(on) { D.documentElement.style.overflow = on ? 'hidden' : ''; if (lenis) { if (on) lenis.stop(); else lenis.start(); } }

  /* ---------------- modals ---------------- */
  function modal(id, html) {
    var m = D.getElementById(id);
    if (!m) { m = D.createElement('div'); m.className = 'modal'; m.id = id; D.body.appendChild(m);
      m.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(m); trap(e, $('.box', m)); }); }
    m.innerHTML = '<div class="scrim" data-mclose></div><div class="box glass" role="dialog" aria-modal="true" aria-labelledby="' + id + '-h"><button class="hexbtn x" data-mclose aria-label="Close">&#x2715;</button>' + html + '</div>';
    $$('[data-mclose]', m).forEach(function (b) { b.addEventListener('click', function () { closeModal(m); }); });
    lastFocus = D.activeElement; m.classList.add('open'); lock(true);
    setTimeout(function () { var f = $('.box input:not(.hp),.box select,.box .btn', m); if (f) f.focus(); }, 80);
    bindForms(m);
    return m;
  }
  function closeModal(m) { m.classList.remove('open'); lock(false); if (lastFocus && lastFocus.focus) lastFocus.focus(); }
  W.PEP.modal = modal;

  /* age + province gate (before checkout) */
  var AGE = { AB: 18, MB: 18, QC: 18, BC: 19, NB: 19, NL: 19, NS: 19, NT: 19, NU: 19, ON: 19, PE: 19, SK: 19, YT: 19 };
  var PROV = { AB: 'Alberta', BC: 'British Columbia', MB: 'Manitoba', NB: 'New Brunswick', NL: 'Newfoundland and Labrador', NS: 'Nova Scotia', NT: 'Northwest Territories', NU: 'Nunavut', ON: 'Ontario', PE: 'Prince Edward Island', QC: 'Quebec', SK: 'Saskatchewan', YT: 'Yukon' };
  function openGate() {
    track('checkout_start');
    var m = modal('gate', '<span class="eyebrow">BEFORE CHECKOUT</span><h2 id="gate-h" style="margin-top:14px">ADULTS ONLY, IN CANADA</h2>' +
      '<p>Tell us your province so we can check the age of majority where you live.</p>' +
      '<div class="stack"><div class="field"><label for="g-p">Province or territory</label><select class="input select" id="g-p"><option value="">Choose…</option>' +
      Object.keys(PROV).map(function (k) { return '<option value="' + k + '">' + PROV[k] + '</option>'; }).join('') + '</select><span class="msg" aria-live="polite"></span></div>' +
      '<button class="btn" id="g-yes">I AM OF AGE <span class="arw">&#x2192;</span></button><button class="btn ghost" id="g-no">I AM NOT</button></div>');
    $('#g-yes', m).addEventListener('click', function () {
      var v = $('#g-p', m).value, f = $('#g-p', m).closest('.field');
      if (!v) { f.classList.add('err'); $('.msg', f).textContent = 'Choose your province or territory to continue.'; return; }
      ss.set('age', v); closeModal(m); openPreview(v);
    });
    $('#g-no', m).addEventListener('click', function () {
      $('.box', m).innerHTML = '<h2 id="gate-h">THANK YOU FOR BEING HONEST</h2><p>PEPTICITY sells to adults only. Your cart stays saved on this device.</p><button class="btn ghost" data-mclose>CLOSE</button>';
      $$('[data-mclose]', m).forEach(function (b) { b.addEventListener('click', function () { closeModal(m); }); });
    });
  }
  function openPreview(prov) {
    track('checkout_preview');
    modal('preview', '<span class="eyebrow">CHECKOUT</span><h2 id="preview-h" style="margin-top:14px">PREVIEW ONLY</h2>' +
      '<p>No order was placed and nothing was charged. The live checkout opens here once the store platform is chosen.</p>' +
      '<p class="small">' + count() + ' item(s) · ' + esc(PROV[prov]) + ' (' + AGE[prov] + '+) · total $[TOTAL] CAD</p>' +
      '<button class="btn" data-mclose>BACK TO THE SITE</button>');
  }

  /* notify-me (coming soon) */
  function openNotify(k) {
    var p = byK[k];
    modal('notify', '<span class="eyebrow">COMING SOON</span><h2 id="notify-h" style="margin-top:14px">' + esc(p.name) + '</h2>' +
      '<p>We will email you once, the day it lands. No other mail unless you tick the box.</p>' +
      captureForm('notify-' + k, 'TELL ME WHEN IT LANDS', { transactional: true }));
  }

  /* ---------------- capture forms ---------------- */
  function captureForm(hook, label, o) {
    o = o || {};
    return '<form data-capture="' + esc(hook) + '" novalidate><div class="todo stack">' +
      (o.name ? '<div class="field"><label for="' + hook + '-n">First name (optional)</label><input class="input" id="' + hook + '-n" name="name" autocomplete="given-name"></div>' : '') +
      '<div class="field"><label for="' + hook + '-e">Email</label><input class="input" id="' + hook + '-e" name="email" type="email" inputmode="email" autocomplete="email" placeholder="you@example.com" required data-hint="Add your email, e.g. name@example.com"><span class="msg" aria-live="polite"></span></div>' +
      (o.sms ? '<div class="field"><label for="' + hook + '-t">Mobile (optional, for texts)</label><input class="input" id="' + hook + '-t" name="tel" type="tel" inputmode="tel" autocomplete="tel" pattern="[0-9 ()+.-]{10,}" data-hint="Add your area code, e.g. 604 555 0123"><span class="msg" aria-live="polite"></span></div>' : '') +
      (o.transactional ? '' : '<label class="consent"><input type="checkbox" name="consent_email"><span>Yes, PEPTICITY may email me news and offers. I can unsubscribe at any time. [legal name] · [mailing address] · [contact email]</span></label>') +
      (o.sms ? '<label class="consent"><input type="checkbox" name="consent_sms"><span>Yes, PEPTICITY may text me. Message rates may apply. Reply STOP to stop. [Consent wording: counsel to review]</span></label>' : '') +
      '<input class="hp" tabindex="-1" autocomplete="off" name="company" aria-hidden="true">' +
      '<button class="btn">' + esc(label) + ' <span class="arw">&#x2192;</span></button></div>' +
      '<div class="done"><div class="tick">&#x2713;</div><h3 class="h-s">' + esc(o.doneTitle || 'DONE') + '</h3><p class="small">' + (o.done || 'Preview build: nothing was sent. On the live site this goes to [Grace’s inbox / CRM].') + '</p></div></form>';
  }
  W.PEP.captureForm = captureForm;

  function validate(i) {
    var f = i.closest('.field'); if (!f) return true;
    var ok = i.checkValidity() && !(i.type === 'email' && i.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(i.value));
    f.classList.toggle('err', !ok); f.classList.toggle('ok', ok && !!i.value);
    var m = $('.msg', f); if (m) m.textContent = ok ? '' : (i.dataset.hint || i.validationMessage);
    i.setAttribute('aria-invalid', String(!ok)); return ok;
  }
  function bindForms(root) {
    $$('form[data-capture]', root).forEach(function (form) {
      if (form.dataset.bound) return; form.dataset.bound = '1';
      var started = false;
      $$('input:not([type=checkbox]):not(.hp)', form).forEach(function (i) {
        i.addEventListener('blur', function () { if (i.value) validate(i); });
        i.addEventListener('input', function () { if (!started) { started = true; track('form_start', { hook: form.dataset.capture }); } if (i.closest('.field.err')) validate(i); });
      });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.dataset.sent) return;                       // no double send
        var inputs = $$('input:not([type=checkbox]):not(.hp)', form), ok = true;
        inputs.forEach(function (i) { if (!validate(i)) ok = false; });
        if (!ok) { track('form_error', { hook: form.dataset.capture }); var bad = $('.err input', form); if (bad) bad.focus(); return; }
        var hp = $('.hp', form); if (hp && hp.value) { form.classList.add('is-done'); return; } // bot: quietly "succeed", store nothing
        form.dataset.sent = '1';
        var btn = $('button.btn', form); if (btn) { btn.disabled = true; btn.dataset.l = btn.innerHTML; btn.textContent = 'SENDING…'; }
        var data = { hook: form.dataset.capture, at: new Date().toISOString(), way: D.documentElement.dataset.way };
        inputs.forEach(function (i) { data[i.name] = i.value.trim(); });
        $$('input[type=checkbox]', form).forEach(function (c) { data[c.name] = c.checked; });
        if (form.dataset.extra) data.extra = form.dataset.extra;
        var leads = store.get('leads', []); leads.push(data); store.set('leads', leads);
        W.PEP.sent = (W.PEP.sent || 0) + 1;
        store.set('joined', true);
        track('form_submit', { hook: data.hook, consent_email: !!data.consent_email, consent_sms: !!data.consent_sms });
        setTimeout(function () { form.classList.add('is-done'); renderCart(); var d = $('.done', form); if (d) { d.setAttribute('tabindex', '-1'); d.focus({ preventScroll: true }); } D.dispatchEvent(new CustomEvent('pep:lead', { detail: data })); }, 900);
      });
    });
  }
  W.PEP.bindForms = bindForms;

  /* ---------------- exit + return hooks (one per session, never over a dialog) ---------------- */
  function exitCard() {
    if (ss.get('exit') || $('.modal.open,.drawer.open')) return;
    ss.set('exit', '1'); track('exit_card');
    if (count()) {
      modal('exit', '<span class="eyebrow">BEFORE YOU GO</span><h2 id="exit-h" style="margin-top:14px">SAVE MY CART</h2><p>We will email you a link back to this exact cart. One email, nothing else unless you tick the box.</p>' +
        captureForm('exit-save-cart', 'EMAIL MY CART', { doneTitle: 'CART SAVED' }));
    } else if (!joined() && CFG.COUNSEL.offer) {
      modal('exit', '<span class="eyebrow">BEFORE YOU GO</span><h2 id="exit-h" style="margin-top:14px">' + CFG.OFFER_PCT + '% OFF YOUR FIRST ORDER</h2><p>Join the PEPTICITY team and the code waits in your inbox for when you are ready.</p>' +
        captureForm('exit-offer', 'SEND MY CODE', { doneTitle: 'CHECK YOUR INBOX' }));
    }
  }
  function exitHooks() {
    var t0 = Date.now();
    if (fine) D.addEventListener('mouseout', function (e) { if (!e.relatedTarget && e.clientY <= 4 && Date.now() - t0 > 12000) exitCard(); });
    else { var lastY = 0, lastT = 0; W.addEventListener('scroll', function () { var y = W.scrollY, t = Date.now(); if (Date.now() - t0 > 40000 && lastY - y > 900 && t - lastT < 400 && y > 1200) exitCard(); if (t - lastT > 400) { lastY = y; lastT = t; } }, { passive: true }); }
    var title = D.title;
    D.addEventListener('visibilitychange', function () { D.title = (D.hidden && count()) ? 'Your cart is waiting · PEPTICITY' : title; });
    if (count() && !ss.get('back')) { ss.set('back', '1'); setTimeout(function () { toast('WELCOME BACK · your cart is saved'); }, 2600); }
  }

  /* Esc always closes the top layer, even after focus was lost to a re-render */
  D.addEventListener('keydown', function (e) {
    if (e.key !== 'Escape') return;
    var m = $$('.modal.open').pop(); if (m) { closeModal(m); return; }
    if (drawer && drawer.classList.contains('open')) closeCart();
  });
  /* ---------------- clicks ---------------- */
  D.addEventListener('click', function (e) {
    var t = e.target.closest('[data-add],[data-notify],[data-open-cart],.size,[data-cta],[data-offer]');
    if (!t) return;
    if (t.matches('[data-cta]')) track('cta_click', { id: t.dataset.cta });
    if (t.classList.contains('size')) { $$('.size', t.parentNode).forEach(function (b) { b.setAttribute('aria-pressed', String(b === t)); }); return; }
    if (t.dataset.add) {
      var card = t.closest('.card'), sel = card && $('.size[aria-pressed="true"]', card);
      addToCart(t.dataset.add, sel ? sel.dataset.size : null);
      var l = $('.lbl', t); if (l) { l.textContent = 'ADDED ✓'; setTimeout(function () { l.textContent = 'ADD TO CART'; }, 1500); }
    }
    if (t.dataset.notify) openNotify(t.dataset.notify);
    if (t.matches('[data-open-cart]')) { e.preventDefault(); openCart(); }
    if (t.matches('[data-offer]')) { e.preventDefault(); W.PEP.offer(); }
  });
  W.PEP.offer = function () {
    modal('offer', '<span class="eyebrow">GRAND OPENING</span><h2 id="offer-h" style="margin-top:14px">' + CFG.OFFER_PCT + '% OFF YOUR FIRST ORDER</h2><p>Join the PEPTICITY team. Your code comes by email and applies to your first order. [Offer: counsel and Grace to confirm]</p>' +
      captureForm('offer-modal', 'SEND MY CODE', { sms: true, doneTitle: 'YOU ARE ON THE TEAM', done: 'Your ' + CFG.OFFER_PCT + '% is now applied in your cart. Preview build: no email was sent.' }));
  };

  /* ---------------- finder (catalogue only: never health, goals or symptoms) ---------------- */
  W.PEP.shortlist = function (a) {
    var list = P.filter(function (p) { return !p.soon; });
    if (a.format === '10') list = list.filter(function (p) { return p.shelf === 1; });
    else if (a.format === 'two') list = list.filter(function (p) { return p.shelf === 2; });
    else if (a.format === 'large') list = list.filter(function (p) { return p.shelf === 3; });
    return list.slice(0, 3);
  };

  /* ---------------- smooth scroll (slow, weighted) + reveals + tilt ---------------- */
  var frames = [];
  W.PEP.onFrame = function (fn) { frames.push(fn); };
  W.PEP.progress = function (el) { var r = el.getBoundingClientRect(), h = el.offsetHeight - W.innerHeight; return h <= 0 ? (r.top < 0 ? 1 : 0) : Math.min(1, Math.max(0, -r.top / h)); };
  function loop(t) { if (lenis) lenis.raf(t); for (var i = 0; i < frames.length; i++) frames[i](t); requestAnimationFrame(loop); }
  W.PEP.scrollTo = function (target) { var el = typeof target === 'string' ? $(target) : target; if (!el) return; if (lenis) lenis.scrollTo(el, { offset: -70, duration: 2.2 }); else el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' }); };
  D.addEventListener('click', function (e) { var a = e.target.closest('a[href^="#"]'); if (!a || a.getAttribute('href').length < 2) return; var el = $(a.getAttribute('href')); if (!el) return; e.preventDefault(); W.PEP.scrollTo(el); });

  function reveals() {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -6% 0px' });
    $$('[data-rv]').forEach(function (el) { if (el.closest('[data-hero]')) { setTimeout(function () { el.classList.add('in'); }, 120); } else io.observe(el); });
  }
  function tilt() {
    if (!fine || reduce) return;
    $$('[data-tilt]').forEach(function (el) {
      var max = +el.dataset.tilt || 6, tx = 0, ty = 0, cx = 0, cy = 0, on = false;
      el.addEventListener('pointermove', function (e) { var r = el.getBoundingClientRect(); tx = ((e.clientY - r.top) / r.height - .5) * -max; ty = ((e.clientX - r.left) / r.width - .5) * max; on = true; });
      el.addEventListener('pointerleave', function () { tx = ty = 0; });
      W.PEP.onFrame(function () { if (!on) return; cx += (tx - cx) * .06; cy += (ty - cy) * .06; el.style.transform = 'perspective(1100px) rotateX(' + cx.toFixed(2) + 'deg) rotateY(' + cy.toFixed(2) + 'deg)'; if (Math.abs(cx) + Math.abs(cy) < .01 && !tx && !ty) on = false; });
    });
  }

  /* ---------------- boot ---------------- */
  function boot() {
    if (W.Lenis && !reduce) { lenis = new W.Lenis({ lerp: 0.06, wheelMultiplier: 0.75, touchMultiplier: 1.1, smoothWheel: true }); W.PEP.lenis = lenis; }
    requestAnimationFrame(loop);
    reveals(); tilt(); bindForms(D); renderCart(); exitHooks();
    var bar = $('.bar'), hero = $('[data-hero]');
    if (bar && hero) new IntersectionObserver(function (es) { bar.classList.toggle('on', !es[0].isIntersecting); }).observe(hero);
    if (bar) { var tick = 0; W.PEP.onFrame(function () { if (++tick % 8) return; var bh = bar.offsetHeight, bw = bar.offsetWidth, br = { top: W.innerHeight - 14 - bh, bottom: W.innerHeight - 14, left: (W.innerWidth - bw) / 2, right: (W.innerWidth + bw) / 2 }, hit = false;
        $$('form[data-capture] button.btn, form[data-capture] input').forEach(function (b) { if (hit || !b.offsetParent) return; var r = b.getBoundingClientRect(); if (r.bottom > br.top - 8 && r.top < br.bottom && r.right > br.left && r.left < br.right) hit = true; });
        bar.classList.toggle('typing', hit || bar.dataset.f === '1'); });
      D.addEventListener('focusin', function (e) { if (e.target.matches('input,select')) bar.dataset.f = '1'; }); D.addEventListener('focusout', function () { bar.dataset.f = ''; }); }
    D.dispatchEvent(new Event('pep:ready'));
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', boot); else boot();
})(window, document);

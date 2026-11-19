/* PEPTICITY Founders Reserve: the approved member card, engraved by the laser.
   The card displays a rendered sample. The engraver loads when the visitor asks to engrave their own name. The name stays on this page: nothing is stored or sent here. */
(function () {
  'use strict';
  var room = document.getElementById('founder-card'), root = document.getElementById('engraver');
  var eform = document.getElementById('form'), ein = document.getElementById('nameInput');
  if (!room) { return; }
  // BOTH STEPS ON SHOW: the name step and the "where do we send it" step stay open together until the sign-up is sent,
  // so nobody has to guess there is a second step. (The page's own script opens one step at a time.)
  (function () {
    var form = room.querySelector('form.pep-hooks-form'); if (!form || !('MutationObserver' in window)) { return; }
    var done = form.querySelector('[data-step="done"]');
    function sync() { if (done && !done.hidden) { return; } ['name', 'email'].forEach(function (k) { var el = form.querySelector('[data-step="' + k + '"]'); if (el && el.hidden) { el.hidden = false; } }); }
    new MutationObserver(sync).observe(form, { attributes: true, attributeFilter: ['hidden'], subtree: true });
    sync();
  })();
  // REFER A FRIEND. Each browser gets a random referral code (a token, nothing about the person). It rides on the share
  // link as ?ref=CODE and is sent with the sign-up, so the back end can count a friend's sign-up for the right member.
  (function () {
    var KEY = 'pep_ref_v1', mine = '', from = '';
    function fresh() { var a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789', out = '', buf = new Uint8Array(8); (window.crypto || window.msCrypto).getRandomValues(buf); for (var i = 0; i < 8; i++) { out += a[buf[i] % a.length]; } return out; }
    try { mine = window.localStorage.getItem(KEY) || ''; if (!/^[A-Z2-9]{8}$/.test(mine)) { mine = fresh(); window.localStorage.setItem(KEY, mine); } } catch (e) { mine = fresh(); }
    var m = /[?&]ref=([A-Za-z0-9]{6,12})(?:&|$)/.exec(window.location.search); if (m && m[1].toUpperCase() !== mine) { from = m[1].toUpperCase(); }
    window.PEPRef = { mine: mine, from: from };
    var dlg = document.getElementById('pep-fr-refer'); if (!dlg || typeof dlg.showModal !== 'function') { return; }
    var url = String(window.location.href).split('#')[0].split('?')[0] + '?ref=' + mine;
    var msg = 'PEPTICITY is open. Join the Founders Reserve with my link: ' + url;
    var said = dlg.querySelector('[data-refer-said]'), linkEl = dlg.querySelector('[data-refer-link]');
    if (linkEl) { linkEl.textContent = url; }
    function say(t) { if (said) { said.textContent = t; } }
    function copy(then) { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(url).then(function () { then(true); }, function () { then(false); }); } else { then(false); } }
    function hand(where) { copy(function (ok) { say(ok ? 'Link copied. Paste it on ' + where + '.' : 'Copy the link above and paste it on ' + where + '.'); if (navigator.share) { navigator.share({ title: 'PEPTICITY', text: 'PEPTICITY is open. Join the Founders Reserve with my link.', url: url }).catch(function () {}); } }); }
    var ways = { email: 'mailto:?subject=' + encodeURIComponent('PEPTICITY GRAND OPENING') + '&body=' + encodeURIComponent(msg), text: 'sms:?&body=' + encodeURIComponent(msg), facebook: 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url) };
    Array.prototype.forEach.call(dlg.querySelectorAll('[data-way]'), function (k) {
      var w = k.getAttribute('data-way');
      if (ways[w]) { k.setAttribute('href', ways[w]); return; }
      k.addEventListener('click', function () { if (w === 'copy') { copy(function (ok) { say(ok ? 'Link copied.' : 'Copy the link above.'); }); } else { hand(w === 'tiktok' ? 'TikTok' : 'Instagram'); } });
    });
    Array.prototype.forEach.call(room.querySelectorAll('[data-refer-open]'), function (o) { o.addEventListener('click', function () { say(''); dlg.showModal(); }); });
    Array.prototype.forEach.call(dlg.querySelectorAll('[data-refer-close]'), function (c) { c.addEventListener('click', function () { dlg.close(); }); });
    dlg.addEventListener('click', function (e) { if (e.target === dlg) { dlg.close(); } });   // a press on the dimmed page closes it
  })();
  if (!root || !eform || !ein) { return; }
  var nameIn = room.querySelector('[data-field="name"]'), make = room.querySelector('[data-make]');
  var sample = root.querySelector('.pep-fr-sample');
  var state = 0, waiting = [];                            // 0 not asked, 1 loading, 2 ready, 3 failed
  function load(cb) {
    if (state === 2) { if (cb) { cb(); } return; }
    if (cb) { waiting.push(cb); }
    if (state === 1 || state === 3) { return; }
    state = 1;
    var s = document.createElement('script');
    s.src = 'assets/founders/engrave.js';
    s.onload = function () { state = 2; waiting.splice(0).forEach(function (f) { f(); }); };
    s.onerror = function () { state = 3; waiting.length = 0; };   // the card still shows; only the laser is missing
    document.head.appendChild(s);
  }
  function engrave(name) {
    showCard();
    load(function () {
      if (sample) { sample.hidden = true; }
      root.removeAttribute('data-sample');
      ein.value = name;
      eform.dispatchEvent(new Event('submit', { cancelable: true }));
    });
  }
  var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches, moved = false;
  function onScreen(el) { var r = el.getBoundingClientRect(), h = window.innerHeight || document.documentElement.clientHeight; return r.top >= 56 && r.bottom <= h; }
  function showCard() {
    var st = document.getElementById('stage');
    if (!st || onScreen(st)) { return; }
    moved = true; st.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' });
  }
  // when the laser has finished and the page was moved up to the card, come back down to the next step of the form
  if ('MutationObserver' in window) {
    new MutationObserver(function () {
      if (!moved || root.getAttribute('data-state') !== 'done') { return; }
      moved = false;
      var next = room.querySelector('form.pep-hooks-form [data-step]:not([hidden])');
      if (next && !onScreen(next)) { setTimeout(function () { next.scrollIntoView({ block: 'center', behavior: calm ? 'auto' : 'smooth' }); }, 900); }
    }).observe(root, { attributes: true, attributeFilter: ['data-state'] });
  }
  function typed() { return nameIn ? String(nameIn.value || '').trim() : ''; }
  if (make) { make.addEventListener('click', function () { var v = typed(); if (v) { engrave(v); } }); }
  if (nameIn) { nameIn.addEventListener('keydown', function (e) { if (e.key === 'Enter') { var v = typed(); if (v) { engrave(v); } } }); }
})();

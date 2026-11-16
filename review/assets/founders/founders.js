/* PEPTICITY Founders Reserve: the approved member card, engraved by the laser.
   The engraver (assets/founders/engrave.js) is only fetched when the card comes on screen. It shows the laser once with
   the sample name (data-demo), then engraves the visitor's own name when they ask. The name stays on this page: nothing is stored or sent here. */
(function () {
  'use strict';
  var room = document.getElementById('founder-card'), root = document.getElementById('engraver');
  var eform = document.getElementById('form'), ein = document.getElementById('nameInput');
  if (!room) { return; }
  // the two drop-downs: closed until asked for, and never both open
  (function () {
    var box = room.querySelector('[data-fr-drops]'); if (!box) { return; }
    var keys = Array.prototype.slice.call(box.querySelectorAll('.pep-fr-key'));
    function set(open) {
      keys.forEach(function (k) {
        var on = k === open, panel = document.getElementById(k.getAttribute('aria-controls'));
        k.setAttribute('aria-expanded', on ? 'true' : 'false');
        if (panel) { panel.hidden = !on; }
      });
    }
    set(null);
    keys.forEach(function (k) { k.addEventListener('click', function () { set(k.getAttribute('aria-expanded') === 'true' ? null : k); }); });
  })();
  if (!root || !eform || !ein) { return; }
  var nameIn = room.querySelector('[data-field="name"]'), make = room.querySelector('[data-make]');
  var DEMO = root.getAttribute('data-demo') || 'YOUR NAME';   // the name the laser shows before the visitor types their own
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
  function engrave(name, sample) {
    if (sample) { root.setAttribute('data-sample', ''); } else { root.removeAttribute('data-sample'); }   // the sample shows no 'your name has been engraved' line
    if (!sample) { showCard(); }
    load(function () { ein.value = name; eform.dispatchEvent(new Event('submit', { cancelable: true })); });
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
  function first() { if (typed()) { load(); } else { engrave(DEMO, true); } }
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) { if (es[0].isIntersecting) { io.disconnect(); first(); } }, { threshold: 0.35 });
    io.observe(root);
  } else { first(); }
})();

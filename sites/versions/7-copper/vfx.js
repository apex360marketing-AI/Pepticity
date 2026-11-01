/* PEPTICITY · VERSION 07 · COPPER "CRAFTED" — page wiring for the slots v4.js does not mount itself:
   1 · NAV-17 Timeline Scrubber: one chapter per tour stop that is on the page (stops past the gates join once they open)
   2 · SCR-101 Flipbook Scrub: frames cut from the site's own lab film atlases (WHITE or BLACK), rebuilt when the look changes
   3 · CRD-130 Hinged Doors: the TEXT ME form stays out of the Tab order until the doors open, then takes focus
   4 · HOV-102 Letter Roll on every button label and text link (also ones the page adds later) */
(function () {
  'use strict';
  var D = document, H = D.documentElement, A = window.APX || {};

  /* ---------- 1 · NAV-17 ---------- */
  var tl = D.getElementById('tourMenu'), tlKill = null, tlSig = '';
  function tlMount() {
    if (!tl || !A.NAV17) return;
    var els = [].slice.call(D.querySelectorAll('[data-tl]')), sig = '';
    els.forEach(function (el) {
      var on = !!el.getClientRects().length;   /* stops behind a gate are display:none until it opens */
      if (on) { el.setAttribute('data-chapter', el.getAttribute('data-tl')); sig += '1'; } else { el.removeAttribute('data-chapter'); sig += '0'; }
    });
    if (sig === tlSig && tlKill) return;
    tlSig = sig;
    if (tlKill) { tlKill(); tlKill = null; }
    tlKill = A.NAV17.mount(tl);
  }
  tlMount();
  new MutationObserver(function () { setTimeout(tlMount, 60); }).observe(H, { attributes: true, attributeFilter: ['class'] });

  /* ---------- 2 · SCR-101 flipbook from the lab atlases ---------- */
  var flip = D.getElementById('choose'), flipKill = null, flipVer = '', flipBusy = false, flipNear = false;
  var CFG = window.PC_CONFIG || {}, SD_DIR = '../_common/media/frames/';
  var MAN = { 'black-lab': { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 }, 'white-lab': { n: 151, tw: 1024, th: 576, cols: 3, rows: 2, files: 26 } };
  function loadImg(src) { return new Promise(function (ok, no) { var im = new Image(); im.decoding = 'async'; im.onload = function () { ok(im); }; im.onerror = no; im.src = src; }); }
  function buildFrames(ver) {
    var m = MAN[ver + '-lab'], per = m.cols * m.rows, step = 4, idx = [];
    for (var f = 0; f < m.n; f += step) idx.push(f);
    if (idx[idx.length - 1] !== m.n - 1) idx.push(m.n - 1);
    var small = innerWidth < 900, ow = small ? 640 : 896, oh = Math.round(ow * m.th / m.tw);
    var files = {}; idx.forEach(function (f) { files[Math.floor(f / per)] = 1; });
    var sheets = {};
    return Promise.all(Object.keys(files).map(function (a) {
      return loadImg(SD_DIR + ver + '-lab-d-' + ('00' + a).slice(-3) + '.webp').then(function (im) { sheets[a] = im; });
    })).then(function () {
      return Promise.all(idx.map(function (f) {
        var a = Math.floor(f / per), j = f % per, sx = (j % m.cols) * m.tw, sy = Math.floor(j / m.cols) * m.th;
        if (window.createImageBitmap) return createImageBitmap(sheets[a], sx, sy, m.tw, m.th, { resizeWidth: ow, resizeHeight: oh, resizeQuality: 'high' });
        var c = D.createElement('canvas'); c.width = ow; c.height = oh; c.getContext('2d').drawImage(sheets[a], sx, sy, m.tw, m.th, 0, 0, ow, oh); return c;
      }));
    });
  }
  function flipMount() {
    if (!flip || !A.SCR101 || flipBusy || !flipNear || !flip.getClientRects().length) return;
    var ver = H.getAttribute('data-version') === 'white' ? 'white' : 'black';
    if (ver === flipVer && flipKill) return;
    flipBusy = true;
    buildFrames(ver).then(function (frames) {
      flipBusy = false;
      if (flipKill) { flipKill(); flipKill = null; }
      flipVer = ver; flipKill = A.SCR101.mount(flip, { frames: frames });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    }, function () { flipBusy = false; });
  }
  if (flip && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (es) { if (es[0].isIntersecting) { flipNear = true; flipMount(); } }, { rootMargin: '150% 0px' }).observe(flip);
  }
  D.addEventListener('pc-version', function () { setTimeout(flipMount, 30); });
  new MutationObserver(function () { setTimeout(flipMount, 80); }).observe(H, { attributes: true, attributeFilter: ['class'] });

  /* ---------- 3 · CRD-130 doors ---------- */
  [].forEach.call(D.querySelectorAll('.doors'), function (card) {
    var form = card.querySelector('.doors-form');
    function sync() {
      var open = card.classList.contains('is-open');
      if (form) { form.inert = !open; if (open && !form.__opened) { form.__opened = 1; var i = form.querySelector('input'); if (i) setTimeout(function () { i.focus({ preventScroll: true }); }, 120); } if (!open) form.__opened = 0; }
    }
    new MutationObserver(sync).observe(card, { attributes: true, attributeFilter: ['class'] });
    function label() { [].forEach.call(card.querySelectorAll('.apx-c130__label small'), function (s) { if (s.textContent !== 'PEPTICITY') s.textContent = 'PEPTICITY'; }); }
    new MutationObserver(label).observe(card, { childList: true }); label(); sync();
  });

  /* ---------- 4 · HOV-102 Letter Roll ---------- */
  function roll(el) {
    if (!A.HOV102 || el.__apxHOV102) return;
    var text = el.textContent.replace(/\s+/g, ' ').trim(); if (!text) return;
    delete el.__apxHOV102root;
    el.classList.add('apx-h102');
    A.HOV102.mount(el);
    var host = el.closest('button,a');
    if (host && host !== el) {
      /* the letters are hidden from screen readers: keep the button's name as real text */
      el.removeAttribute('aria-label'); delete el.dataset.apxLabel;
      var sr = D.createElement('span'); sr.className = 'sr-only'; sr.textContent = text; el.appendChild(sr);
      if (!host.__rollHost) {
        host.__rollHost = 1;
        host.addEventListener('focus', function () { if (host.matches(':focus-visible')) [].forEach.call(host.querySelectorAll('.apx-h102'), function (x) { x.style.setProperty('--dir', 0); x.classList.add('is-roll'); }); });
        host.addEventListener('blur', function () { [].forEach.call(host.querySelectorAll('.apx-h102'), function (x) { x.classList.remove('is-roll'); }); });
      }
    }
  }
  var SEL = '.pc-btn__label, .linkish, .apx-b125__l';
  function rollAll() {
    [].forEach.call(D.querySelectorAll(SEL), function (el) {
      /* a label whose text the page rewrote (SENDING, ADDED ✓) lost its letters: roll the new text */
      if (el.__apxHOV102 && !el.querySelector('.apx-h102__w')) { delete el.__apxHOV102; el.classList.remove('is-roll'); }
      roll(el);
    });
  }
  var rr = 0;
  new MutationObserver(function (ms) {
    for (var i = 0; i < ms.length; i++) { var t = ms[i].target; if (!(t.closest && t.closest('.apx-nav17, .apx-scr101__count'))) { if (!rr) rr = requestAnimationFrame(function () { rr = 0; rollAll(); }); return; } }
  }).observe(D.body, { childList: true, subtree: true });
  rollAll();
})();

/* PEPTICITY · VERSION 04 · RED "BOLD" — page wiring for the slots v4.js does not mount itself:
   1 · the reading statements lit word by word (white, key phrases in the accent) beside the TXT-102 marquee bands
   2 · HOV-105 Plucked String on the ticker links, text links and every button label (also ones the page adds later)
   3 · NAV-103 ticker copies stay clickable and pluckable (not inert; still hidden from screen readers and the Tab key) */
(function () {
  'use strict';
  var D = document, H = D.documentElement;
  var RM = matchMedia('(prefers-reduced-motion: reduce)').matches || H.classList.contains('rm');
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

  /* ---------- 1 · reading statements ---------- */
  var reads = [].slice.call(D.querySelectorAll('[data-read]')).map(function (p) {
    function wrap(node, into) {
      [].slice.call(node.childNodes).forEach(function (n) {
        if (n.nodeType === 3) {
          var frag = D.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (!t) return;
            if (/^\s+$/.test(t)) { frag.appendChild(D.createTextNode(t)); return; }
            var s = D.createElement('span'); s.className = 'rw'; s.textContent = t; frag.appendChild(s); into.push(s);
          });
          n.parentNode.replaceChild(frag, n);
        } else if (n.nodeType === 1) wrap(n, into);
      });
    }
    var words = []; wrap(p, words);
    var sec = p.closest('.say'), meter = sec && sec.querySelector('.say__meter');
    return { p: p, words: words, marks: [].slice.call(p.querySelectorAll('mark')), meter: meter, n: -1 };
  });
  function light() {
    var vh = innerHeight;
    reads.forEach(function (R) {
      var r = R.p.getBoundingClientRect();
      var t = RM ? 1 : clamp((vh * 0.86 - r.top) / (r.height + vh * 0.34), 0, 1), n = Math.round(t * R.words.length);
      if (n === R.n) return; R.n = n;
      R.words.forEach(function (w, k) { w.classList.toggle('lit', k < n); });
      R.marks.forEach(function (m) { var ws = m.querySelectorAll('.rw'); m.classList.toggle('lit', ws.length && ws[ws.length - 1].classList.contains('lit')); });
      if (R.meter) R.meter.style.setProperty('--p', t.toFixed(3));
    });
  }
  var lr = 0; function reqLight() { if (!lr) lr = requestAnimationFrame(function () { lr = 0; light(); }); }
  addEventListener('scroll', reqLight, { passive: true }); addEventListener('resize', reqLight); light();

  /* ---------- 2 · HOV-105 on everything you can point at ---------- */
  function pluck(el) {
    if (!window.APX || !APX.HOV105 || el.__apxHOV105) return;
    if (!el.textContent.trim()) return;
    [].slice.call(el.children).forEach(function (c) { if (c.classList.contains('apx-h105__str')) c.remove(); });   /* a copied (cloned) string has no life of its own */
    delete el.__apxHOV105root;
    el.classList.add('apx-h105');
    APX.HOV105.mount(el);
  }
  var SEL = '.tick .apx-n103__list a, .linkish, .pc-btn__label';
  function pluckAll() {
    [].forEach.call(D.querySelectorAll('.apx-n103__list[inert]'), function (l) { l.removeAttribute('inert'); });
    [].forEach.call(D.querySelectorAll(SEL), function (el) {
      /* a label whose text the page rewrote (e.g. ADDED ✓) lost its string: give it a new one */
      if (el.__apxHOV105 && !el.querySelector('.apx-h105__str')) { try { el.__apxHOV105(); } catch (e) {} delete el.__apxHOV105; }
      pluck(el);
    });
  }
  var pr = 0;
  new MutationObserver(function () { if (!pr) pr = requestAnimationFrame(function () { pr = 0; pluckAll(); }); }).observe(D.body, { childList: true, subtree: true });
  pluckAll();
})();

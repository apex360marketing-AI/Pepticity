/* PEPTICITY · VERSION 02 · CHARTREUSE "CHROME" · glue for the slot effects that need the page:
   HOV-102 Letter Roll on every main hover target (delegated, so cards drawn later by the store get it too),
   GLS-103 Molten Numerals synced to the SCR-16 step and the lab station, and the TXT-104 key-phrase underline sweep. */
(function () {
  'use strict';
  var D = document, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- HOV-102: host -> the plain-text element whose letters roll ---------- */
  var MAP = [
    ['.pc-btn', '.pc-btn__label'], ['.apx-b109', '.apx-b109__l'], ['.apx-lay102__tab', '.apx-lay102__name'],
    ['.apx-lay101__tile', 'h3'], ['.prod', 'h3'], ['.apx-scr16__layers > li', 'b'], ['.apx-c108', '.apx-c108__eyebrow'],
    ['.apx-c124', '.apx-c124__k'], ['.apx-f102__opt', 'span'], ['.tier', '.eyebrow span'], ['.sr', '.eyebrow span'],
    ['.st', '.eyebrow span'], ['.chip', null], ['.linkish', null], ['.apx-f102__back', null], ['.apx-f102__next', null], ['.apx-c124__clear', null]
  ];
  var HOSTS = MAP.map(function (m) { return m[0]; }).join(',');
  function pick(host) {
    for (var i = 0; i < MAP.length; i++) if (host.matches(MAP[i][0])) return MAP[i][1] ? host.querySelector(MAP[i][1]) : host;
    return null;
  }
  function ensure(t) {
    if (!t || !window.APX || !APX.HOV102) return null;
    var s = t.querySelector(':scope > .hv-roll');
    if (s) return s;
    if (t.children.length) return null;                     /* mixed content (e.g. CART 0): leave it alone */
    var text = t.textContent.replace(/\s+/g, ' ').trim();
    if (!text || text.length > 48) return null;
    var lh = parseFloat(getComputedStyle(t).lineHeight) || parseFloat(getComputedStyle(t).fontSize) * 1.3;
    if (t.getBoundingClientRect().height > lh * 1.6) return null;   /* a wrapped label keeps its own line breaks */
    t.textContent = '';
    s = D.createElement('span'); s.className = 'hv-roll apx-h102'; s.textContent = text; t.appendChild(s);
    APX.HOV102.mount(s);
    /* the readable text stays in the accessibility tree (the rolled letters are aria-hidden) */
    s.removeAttribute('aria-label'); delete s.dataset.apxLabel;
    var sr = D.createElement('span'); sr.className = 'sr-only'; sr.textContent = text; s.insertBefore(sr, s.firstChild);
    void s.offsetWidth;
    return s;
  }
  function roll(host, on, fromRight) {
    var s = ensure(pick(host)); if (!s) return;
    s.style.setProperty('--dir', fromRight ? 1 : 0);
    s.classList.toggle('is-roll', on);
  }
  function side(host, e) { var r = host.getBoundingClientRect(); return e && e.clientX > r.left + r.width / 2; }
  D.addEventListener('pointerover', function (e) {
    if (e.pointerType !== 'mouse') return;
    var h = e.target.closest && e.target.closest(HOSTS); if (!h || h.contains(e.relatedTarget)) return;
    roll(h, true, side(h, e));
  }, { passive: true });
  D.addEventListener('pointerout', function (e) {
    if (e.pointerType !== 'mouse') return;
    var h = e.target.closest && e.target.closest(HOSTS); if (!h || h.contains(e.relatedTarget)) return;
    roll(h, false, side(h, e));
  }, { passive: true });
  D.addEventListener('focusin', function (e) {
    var h = e.target.closest && e.target.closest(HOSTS); if (!h) return;
    var fv = true; try { fv = e.target.matches(':focus-visible'); } catch (x) {}
    if (fv) roll(h, true, false);
  });
  D.addEventListener('focusout', function (e) {
    var h = e.target.closest && e.target.closest(HOSTS); if (!h || h.contains(e.relatedTarget)) return;
    if (!h.matches(':hover')) roll(h, false, false);
  });
  D.addEventListener('pointerdown', function (e) {
    if (e.pointerType === 'mouse') return;
    var h = e.target.closest && e.target.closest(HOSTS); if (!h) return;
    roll(h, true, false); clearTimeout(h.__hvT); h.__hvT = setTimeout(function () { roll(h, false, true); }, 900);
  }, { passive: true });

  /* ---------- GLS-103: the molten step numbers ---------- */
  function two(n) { return (n < 9 ? '0' : '') + (n + 1); }
  function syncNum(listSel, itemSel, onCls, wrapSel, numSel) {
    var list = D.querySelector(listSel), wrap = D.querySelector(wrapSel), num = D.querySelector(numSel);
    if (!list || !wrap || !num) return;
    var last = num.getAttribute('data-value');
    function upd() {
      var items = [].slice.call(list.querySelectorAll(itemSel)), k = -1;
      items.forEach(function (el, i) { if (el.classList.contains(onCls)) k = i; });
      wrap.classList.toggle('on', k >= 0);
      if (k >= 0) { var v = two(k); if (v !== last) { last = v; num.setAttribute('data-value', v); } }
    }
    new MutationObserver(upd).observe(list, { subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
  }
  syncNum('#choose .apx-scr16__layers', ':scope > li', 'is-now', '#choose .ch-step', '#choose .ch-num');
  /* the lab: the number follows the station on screen and stays up while the lab holds the screen */
  (function () {
    var lab = D.getElementById('lab'), list = D.getElementById('stations'), wrap = D.querySelector('#lab .lab-step'), num = D.querySelector('#lab .lab-num');
    if (!lab || !list || !wrap || !num || RM) return;
    var sts = [].slice.call(list.querySelectorAll(':scope > .st')), last = num.getAttribute('data-value'), inView = false;
    function upd() {
      var k = -1, best = 0.02;
      sts.forEach(function (el, i) { var o = parseFloat(el.style.opacity) || 0; if (o > best) { best = o; k = i; } });
      wrap.classList.toggle('on', inView);
      if (k >= 0) { var v = two(k); if (v !== last) { last = v; num.setAttribute('data-value', v); } }
    }
    new MutationObserver(upd).observe(list, { subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
    new IntersectionObserver(function (es) { inView = es[es.length - 1].intersectionRatio > 0.5; upd(); }, { threshold: [0, 0.5, 1] }).observe(lab.querySelector('.stage') || lab);
  })();

  /* ---------- TXT-104: the key phrases' underline sweeps in once the letters have landed (mid-screen) ---------- */
  var says = [].slice.call(D.querySelectorAll('.say104'));
  if (RM || !('IntersectionObserver' in window)) says.forEach(function (s) { s.classList.add('is-lit'); });
  else {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) {
        var sec = en.target.closest('.say104');
        if (en.isIntersecting) sec.classList.add('is-lit');
        else if (en.boundingClientRect.top > 0) sec.classList.remove('is-lit');
      });
    }, { rootMargin: '0px 0px -50% 0px' });
    says.forEach(function (s) { var t = s.querySelector('.say-t'); if (t) io.observe(t); });
  }
})();

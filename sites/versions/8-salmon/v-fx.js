/* PEPTICITY · VERSION 08 · SALMON "SOFT" · glue for the slot effects that need the page:
   HOV-105 Plucked String on every main hover target (re-armed when the store draws new cards),
   and the TXT-104 key-phrase underline sweep. */
(function () {
  'use strict';
  var D = document, RM = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- HOV-105: a string under every button, card, choice and text button; plucked on the way in ---------- */
  var HOSTS = ['.pc-btn', '.apx-lay102__tab', '.apx-lay101__tile', '.prod', '.tier', '.apx-f102__opt', '.apx-f102__back', '.apx-f102__next',
    '.sr', '.chip', '.linkish', '.mini-prod', '.apx-c124__clear'].join(',');
  function arm() {
    if (!window.APX || !APX.HOV105) return;
    [].forEach.call(D.querySelectorAll(HOSTS), function (el) {
      if (el.__hvStr || el.closest('.tourmenu .apx-n101__list')) return;
      el.__hvStr = 1; el.classList.add('apx-h105', 'hv-str');
      APX.HOV105.mount(el, { segments: 28, pluckOnEnter: true });
    });
  }
  arm();
  var t = 0;
  new MutationObserver(function (ms) {
    if (!ms.some(function (m) { return m.addedNodes.length; })) return;
    clearTimeout(t); t = setTimeout(arm, 160);
  }).observe(D.body, { childList: true, subtree: true });

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
    says.forEach(function (s) { var x = s.querySelector('.say-t'); if (x) io.observe(x); });
  }
})();

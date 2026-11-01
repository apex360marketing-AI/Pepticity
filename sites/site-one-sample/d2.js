/* PEPTICITY · SECOND DOORS (one version). The Higgsfield film (media/doors2-<white|black>.mp4) is scrubbed by scroll:
   the lab wall glides into the product hall, then a soft fade hands over to the collection. Reduced motion: one still frame. */
(function () {
  var sec = document.getElementById('doors2'), v = document.getElementById('d2Film'), cap = document.getElementById('d2Cap'), flood = document.getElementById('d2Flood');
  if (!sec || !v) return;
  var D = document.documentElement, RM = matchMedia('(prefers-reduced-motion: reduce)').matches, cur = '', want = 0, raf = 0;
  var ss = function (a, b, x) { var t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  function load() {
    var ver = D.getAttribute('data-version') === 'white' ? 'white' : 'black'; if (ver === cur) return; cur = ver;
    v.src = 'media/doors2-' + ver + '.mp4'; v.load();
  }
  function tick() {
    raf = 0;
    var r = sec.getBoundingClientRect(), H = innerHeight; if (r.bottom < 0 || r.top > H) return;
    var p = RM ? 0.6 : Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - H)));
    if (v.duration && isFinite(v.duration)) { var t = ss(0.02, 0.88, p) * (v.duration - 0.05); if (Math.abs(v.currentTime - t) > 1 / 30) v.currentTime = t; }
    cap.style.opacity = (ss(0.6, 0.72, p) * (1 - ss(0.86, 0.95, p))).toFixed(3);
    flood.style.opacity = ss(0.9, 1, p).toFixed(3);
  }
  function req() { if (!raf) raf = requestAnimationFrame(tick); }
  new IntersectionObserver(function (e) { if (e[0].isIntersecting) load(); }, { rootMargin: '150% 0px' }).observe(sec);
  new MutationObserver(function () { if (cur) { cur = ''; load(); } req(); }).observe(D, { attributes: true, attributeFilter: ['data-version'] });
  v.addEventListener('loadedmetadata', req);
  addEventListener('scroll', req, { passive: true }); addEventListener('resize', req);
})();

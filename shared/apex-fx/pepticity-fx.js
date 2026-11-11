/* PEPTICITY FX KIT v1: behaviour for the parts in pepticity-fx.css.
   Every part is tagged data-fx="<ARSENAL CODE>". Press T (or click a [data-tune] button) to show the codes;
   click a code to copy it and open the APEX ARSENAL, where the effect can be swapped by name.
   To change an effect: swap the code in the HTML and the matching block in pepticity-fx.css. */
(function () {
  'use strict';
  var D = document, W = window;
  var ARSENAL = 'https://claude.ai/artifact/5nXkVwrwb4gGPVWWYjJDbB';
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* CRD-132 + HOV-41 + HOV-103: bezel tilt, glare and edge light follow the pointer */
  function tilt(tile) {
    tile.addEventListener('pointermove', function (e) {
      var r = tile.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tile.style.setProperty('--mx', (x * 100) + '%'); tile.style.setProperty('--my', (y * 100) + '%');
      if (RM) return;
      tile.style.setProperty('--ry', ((x - .5) * 14).toFixed(2) + 'deg');
      tile.style.setProperty('--rx', ((.5 - y) * 10).toFixed(2) + 'deg');
      tile.style.setProperty('--gx', (x * 100) + '%'); tile.style.setProperty('--gy', (y * 100) + '%');
    });
    tile.addEventListener('pointerleave', function () { tile.style.setProperty('--rx', '0deg'); tile.style.setProperty('--ry', '0deg'); });
  }

  /* OBJ-09 Revolving Icon Ring: drag / wheel / arrows spin it; it snaps so one icon faces you */
  function ring(el) {
    var track = el.querySelector('.track'), icons = [].slice.call(el.querySelectorAll('.ico')), n = icons.length;
    var lbl = el.querySelector('.face .lbl b'), sub = el.querySelector('.face .lbl span');
    var step = 360 / n, spin = 0, target = 0, drag = null, auto = !RM;
    var rad = Math.max(170, Math.min(300, el.clientWidth * .3));
    icons.forEach(function (ic, i) { ic.style.setProperty('--ang', (i * step) + 'deg'); ic.style.setProperty('--r', rad + 'px');
      ic.addEventListener('click', function () { if (drag && drag.moved) return; var f = front(); if (f === i) { var h = ic.getAttribute('data-href'); if (h) location.hash = h; } else { target = -i * step; auto = false; } }); });
    function front() { var k = Math.round(-target / step) % n; return (k + n) % n; }
    function paint() {
      var f = front();
      icons.forEach(function (ic, i) { ic.classList.toggle('front', i === f); ic.setAttribute('aria-current', i === f ? 'true' : 'false'); });
      if (lbl) lbl.textContent = icons[f].getAttribute('data-name') || '';
      if (sub) sub.textContent = icons[f].getAttribute('data-sub') || '';
    }
    function loop() {
      if (auto && !drag) target -= .06;
      spin += (target - spin) * .12;
      track.style.setProperty('--spin', spin.toFixed(2) + 'deg');
      if (!drag && !auto) target = Math.round(target / step) * step;
      paint(); requestAnimationFrame(loop);
    }
    el.addEventListener('pointerdown', function (e) { if (e.pointerType === 'touch') return; drag = { x: e.clientX, t: target, moved: false }; auto = false; });
    W.addEventListener('pointermove', function (e) { if (!drag || drag.touch) return; var dx = e.clientX - drag.x; if (Math.abs(dx) > 4) drag.moved = true; target = drag.t + dx * .35; });
    W.addEventListener('pointerup', function () { if (!drag || drag.touch) return; var d = drag; setTimeout(function () { if (drag === d) drag = null; }, 0); target = Math.round(target / step) * step; });
    /* touch: drive the spin straight from touch events (pointer events can be cancelled by the browser on phones) */
    el.addEventListener('touchstart', function (e) { var t = e.touches[0]; drag = { x: t.clientX, y: t.clientY, t: target, moved: false, touch: true }; auto = false; }, { passive: true });
    el.addEventListener('touchmove', function (e) { if (!drag) return; var t = e.touches[0], dx = t.clientX - drag.x; if (Math.abs(dx) > Math.abs(t.clientY - drag.y) && Math.abs(dx) > 4) { drag.moved = true; target = drag.t + dx * .35; if (e.cancelable) e.preventDefault(); } }, { passive: false });
    el.addEventListener('touchend', function () { if (!drag) return; var d = drag; setTimeout(function () { if (drag === d) drag = null; }, 0); target = Math.round(target / step) * step; });
    el.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') { target += step; auto = false; } if (e.key === 'ArrowRight') { target -= step; auto = false; } });
    paint(); loop();
  }

  /* TRN-04 Liquid Reveal */
  function reveals() {
    var els = D.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in W) || RM) { els.forEach(function (e) { e.classList.add('in'); }); return; }
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  }

  /* NAV-26 Mercury Gauge */
  function gauge() {
    var g = D.querySelector('.gauge i'); if (!g) return;
    function u() { var h = D.documentElement.scrollHeight - innerHeight; g.style.height = (h > 0 ? scrollY / h * 100 : 0) + '%'; }
    addEventListener('scroll', u, { passive: true }); u();
  }

  /* TUNE MODE: shows the Arsenal code on every part */
  var toast;
  function say(t) { if (!toast) { toast = D.createElement('div'); toast.className = 'fx-toast lg oct'; D.body.appendChild(toast); } toast.textContent = t; toast.classList.add('on'); clearTimeout(say.t); say.t = setTimeout(function () { toast.classList.remove('on'); }, 2600); }
  function tags() {
    D.querySelectorAll('.fx-tag').forEach(function (t) { t.remove(); });
    D.querySelectorAll('[data-fx]').forEach(function (el) {
      var r = el.getBoundingClientRect(); if (!r.width) return;
      var b = D.createElement('button'); b.type = 'button'; b.className = 'fx-tag'; b.textContent = el.getAttribute('data-fx');
      b.style.left = (r.left + scrollX) + 'px'; b.style.top = Math.max(0, r.top + scrollY - 10) + 'px';
      b.addEventListener('click', function () { var c = b.textContent; if (navigator.clipboard) navigator.clipboard.writeText(c).catch(function () {}); say(c + ' copied: find it in the APEX ARSENAL to swap it'); W.open(ARSENAL, '_blank', 'noopener'); });
      D.body.appendChild(b);
    });
  }
  function tune(on) { D.body.classList.toggle('tune', on); if (on) { tags(); say('TUNE MODE: every part shows its APEX ARSENAL code. Press T to close.'); } }
  addEventListener('keydown', function (e) { if ((e.key === 't' || e.key === 'T') && !/INPUT|TEXTAREA|SELECT/.test(D.activeElement.tagName)) tune(!D.body.classList.contains('tune')); });
  addEventListener('resize', function () { if (D.body.classList.contains('tune')) tags(); });

  function init() {
    D.querySelectorAll('.tile').forEach(tilt);
    D.querySelectorAll('.ring').forEach(ring);
    D.querySelectorAll('[data-tune]').forEach(function (b) { b.addEventListener('click', function () { tune(!D.body.classList.contains('tune')); }); });
    reveals(); gauge();
  }
  if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', init); else init();
  W.PEPTICITY_FX = { tune: tune, arsenal: ARSENAL };
})();

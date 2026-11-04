/* NAV-103 · Ticker Nav. window.APX.NAV103.mount(root, {speed:1, scroller:Element|null}) -> destroy() */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxNAV103';

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var track = root.querySelector('.apx-n103__track');
    var list = track && track.querySelector('.apx-n103__list');
    if (!list) return function () {};
    var off = [], clones = [], raf = 0, io, ro, secIO;
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    function motion() { var v = parseFloat(getComputedStyle(root).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }

    var belt = document.createElement('div'); belt.className = 'apx-n103__belt';
    list.parentNode.insertBefore(belt, list); belt.appendChild(list);
    var pill = document.createElement('span'); pill.className = 'apx-n103__state'; pill.setAttribute('aria-hidden', 'true'); pill.innerHTML = '<i></i><i></i>';
    track.appendChild(pill);
    var links = [].slice.call(list.querySelectorAll('a'));

    var w = 1, offsets = [], x = 0, v = 0, fling = 0, hover = false, focusIdx = -1, drag = null, moved = 0, visible = true, last = 0, isStatic = false;

    function measure() {
      clones.forEach(function (c) { c.remove(); }); clones = [];
      w = list.offsetWidth || 1;
      offsets = links.map(function (a) { return a.parentNode.offsetLeft; });
      isStatic = motion() === 0;
      root.classList.toggle('is-static', isStatic);
      if (isStatic) { belt.style.transform = ''; x = 0; return; }
      var need = Math.ceil(track.offsetWidth / w) + 1;
      for (var i = 0; i < need; i++) {
        var c = list.cloneNode(true);
        c.setAttribute('aria-hidden', 'true'); c.setAttribute('inert', '');
        c.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });
        belt.appendChild(c); clones.push(c);
      }
    }
    function wrap(val) { return ((val % w) - w) % w; }
    function frame(t) {
      raf = 0;
      if (!visible || isStatic) return;
      var dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
      var m = motion();
      var paused = hover || focusIdx > -1 || drag;
      root.classList.toggle('is-paused', !!(hover && !drag));
      v += ((paused ? 0 : 38 * m * (opts.speed || 1)) - v) * 0.06;
      if (focusIdx > -1 && !drag) {
        var target = -Math.max(0, offsets[focusIdx] - 32);
        x += (target - x) * 0.18;
      } else if (!drag) {
        x -= v * dt + fling; fling *= 0.93;
        if (Math.abs(fling) < 0.01) fling = 0;
        x = wrap(x);
      }
      belt.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!raf && !isStatic && visible) { last = 0; raf = requestAnimationFrame(frame); } }

    on(track, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { hover = true; start(); } });
    on(track, 'pointerleave', function () { hover = false; });
    on(track, 'focusin', function (e) { var i = links.indexOf(e.target); if (i > -1) { focusIdx = i; x = wrap(x); start(); } });
    on(track, 'focusout', function () { focusIdx = -1; });
    on(track, 'pointerdown', function (e) {
      if (isStatic || e.button > 0) return;
      drag = { x0: e.clientX, last: e.clientX, id: e.pointerId, vel: 0, captured: false }; moved = 0;
    });
    on(window, 'pointermove', function (e) {
      if (!drag || e.pointerId !== drag.id) return;
      var dx = e.clientX - drag.last; drag.last = e.clientX; moved += Math.abs(dx);
      if (moved > 6 && !drag.captured) { drag.captured = true; track.classList.add('is-drag'); try { track.setPointerCapture(e.pointerId); } catch (_) {} }
      if (drag.captured) { x = wrap(x + dx); drag.vel = dx; belt.style.transform = 'translate3d(' + x.toFixed(2) + 'px,0,0)'; }
    }, { passive: true });
    function endDrag() { if (!drag) return; fling = -drag.vel * 0.9; drag = null; track.classList.remove('is-drag'); start(); }
    on(window, 'pointerup', endDrag); on(window, 'pointercancel', endDrag);
    on(track, 'click', function (e) { if (moved > 6) { e.preventDefault(); e.stopPropagation(); } moved = 0; }, true);
    on(document, 'visibilitychange', function () { visible = !document.hidden; start(); });

    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting && !document.hidden; start(); });
      io.observe(root);
      // current section highlight
      var scroller = opts.scroller !== undefined ? opts.scroller : root.closest('[data-apx-scroller]');
      var map = {};
      links.forEach(function (a) { var id = (a.getAttribute('href') || '').replace(/^#/, ''); var el = id && document.getElementById(id); if (el) map[id] = el; });
      var ids = Object.keys(map);
      if (ids.length) {
        secIO = new IntersectionObserver(function (en) {
          en.forEach(function (e) {
            if (!e.isIntersecting) return;
            var href = '#' + e.target.id;
            belt.querySelectorAll('a').forEach(function (a) {
              var cur = a.getAttribute('href') === href;
              a.classList.toggle('is-current', cur);
              if (!a.closest('[aria-hidden]')) cur ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
            });
          });
        }, { root: scroller || null, rootMargin: '-40% 0px -55% 0px' });
        ids.forEach(function (id) { secIO.observe(map[id]); });
      }
    }
    if ('ResizeObserver' in window) {
      var rw = 0;
      ro = new ResizeObserver(function () { if (track.offsetWidth !== rw) { rw = track.offsetWidth; measure(); start(); } });
      ro.observe(track);
    }
    measure(); start();
    // re-check motion token when the page toggles it
    var mo = new MutationObserver(function () { var s = motion() === 0; if (s !== isStatic) { measure(); start(); } });
    mo.observe(document.body, { attributes: true, attributeFilter: ['class', 'style'] });

    function destroy() {
      cancelAnimationFrame(raf); raf = 0;
      off.forEach(function (f) { f(); });
      io && io.disconnect(); ro && ro.disconnect(); secIO && secIO.disconnect(); mo.disconnect();
      clones.forEach(function (c) { c.remove(); });
      belt.parentNode.insertBefore(list, belt); belt.remove(); pill.remove();
      links.forEach(function (a) { a.classList.remove('is-current'); a.removeAttribute('aria-current'); });
      root.classList.remove('is-static', 'is-paused');
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.NAV103 = { code: 'NAV-103', name: 'Ticker Nav', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="NAV-103"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

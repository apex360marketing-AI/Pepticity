/* HOV-103 · Edge Light. window.APX.HOV103.mount(root, {reach:200}) -> destroy()
   root: .apx-h103 grid; children .apx-h103__card */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxHOV103';

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var reach = opts.reach || 200;
    var off = [], raf = 0, ro;
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    function motion() { var v = parseFloat(getComputedStyle(root).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    var cards = [].slice.call(root.querySelectorAll('.apx-h103__card')).map(function (el) {
      var ring = document.createElement('span'), wash = document.createElement('span');
      ring.className = 'apx-h103__ring'; wash.className = 'apx-h103__wash';
      ring.setAttribute('aria-hidden', 'true'); wash.setAttribute('aria-hidden', 'true');
      ring.innerHTML = '<i class="apx-h103__orb"></i>'; wash.innerHTML = '<i class="apx-h103__orb"></i>';
      el.appendChild(ring); el.appendChild(wash);
      return { el: el, ring: ring, wash: wash, o1: ring.firstChild, o2: wash.firstChild, x: 0, y: 0, w: 0, h: 0, op: 0 };
    });
    var fine = matchMedia('(hover:hover) and (pointer:fine)');
    var px = -9999, py = -9999, lx = -9999, ly = -9999, inside = false, stale = true;
    function measure() {
      var g = root.getBoundingClientRect();
      cards.forEach(function (c) { var r = c.el.getBoundingClientRect(); c.x = r.left - g.left; c.y = r.top - g.top; c.w = r.width; c.h = r.height; });
      stale = false;
    }
    function frame() {
      raf = 0;
      if (stale) measure();
      var k = lx < -9000 ? 1 : 0.2;
      lx += (px - lx) * k; ly += (py - ly) * k;
      var m = motion(), moving = Math.abs(px - lx) + Math.abs(py - ly) > 0.3, fading = false;
      cards.forEach(function (c) {
        var ox = lx - c.x, oy = ly - c.y;
        var dx = Math.max(-ox, 0, ox - c.w), dy = Math.max(-oy, 0, oy - c.h), d = Math.sqrt(dx * dx + dy * dy);
        var target = inside && m > 0 ? Math.max(0, 1 - d / reach) : 0;
        c.op += (target - c.op) * 0.18;
        if (Math.abs(target - c.op) > 0.005) fading = true;
        var t = 'translate3d(' + ox.toFixed(1) + 'px,' + oy.toFixed(1) + 'px,0)';
        c.o1.style.transform = t; c.o2.style.transform = t;
        c.o1.style.opacity = c.op.toFixed(3); c.o2.style.opacity = c.op.toFixed(3);
      });
      if (moving || fading) raf = requestAnimationFrame(frame);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(frame); }
    on(root, 'pointerenter', function (e) { if (e.pointerType !== 'mouse' || !fine.matches) return; inside = true; stale = true; kick(); });
    on(root, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      var g = root.getBoundingClientRect(); px = e.clientX - g.left; py = e.clientY - g.top; inside = true; kick();
    }, { passive: true });
    on(root, 'pointerleave', function () { inside = false; kick(); });
    on(window, 'scroll', function () { stale = true; }, { passive: true });
    if ('ResizeObserver' in window) { ro = new ResizeObserver(function () { stale = true; }); ro.observe(root); }
    // keyboard + touch parity: light the whole edge
    cards.forEach(function (c) {
      on(c.el, 'focusin', function (e) { if (e.target.matches(':focus-visible')) c.el.classList.add('is-lit'); });
      on(c.el, 'focusout', function () { c.el.classList.remove('is-lit'); });
      on(c.el, 'pointerdown', function (e) {
        if (e.pointerType === 'mouse') return;
        c.el.classList.add('is-lit'); clearTimeout(c.t); c.t = setTimeout(function () { c.el.classList.remove('is-lit'); }, 700);
      });
    });

    function destroy() {
      cancelAnimationFrame(raf); off.forEach(function (f) { f(); }); ro && ro.disconnect();
      cards.forEach(function (c) { clearTimeout(c.t); c.ring.remove(); c.wash.remove(); c.el.classList.remove('is-lit'); });
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.HOV103 = { code: 'HOV-103', name: 'Edge Light', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="HOV-103"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

/* HOV-105 · Plucked String. window.APX.HOV105.mount(root, {segments:28}) -> destroy()
   root: one a.apx-h105 or a container of them. Single-line links. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxHOV105';
  var active = new Set(), raf = 0, last = 0;

  function tick(t) {
    raf = 0;
    var dt = Math.min(0.033, last ? (t - last) / 1000 : 0.016); last = t;
    active.forEach(function (s) { if (!s.step(dt)) active.delete(s); });
    if (active.size) raf = requestAnimationFrame(tick); else last = 0;
  }
  function wake(s) { active.add(s); if (!raf) raf = requestAnimationFrame(tick); }

  function enhance(a, opts) {
    if (a[KEY]) return a[KEY];
    var N = opts.segments || 28, off = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    var str = document.createElement('span'); str.className = 'apx-h105__str'; str.setAttribute('aria-hidden', 'true');
    for (var i = 0; i < N; i++) str.appendChild(document.createElement('i'));
    a.appendChild(str);
    var segs = [].slice.call(str.children);
    str.classList.add('is-idle'); str._idle = true;
    var A = 0, V = 0, p = 0.5, held = false, target = 0, W = 1, base = 0, rect = null, liveT = 0;
    function motion() { var v = parseFloat(getComputedStyle(a).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    function render() {
      var sl = A / Math.max(1, p * W), sr = -A / Math.max(1, (1 - p) * W);
      var al = Math.atan(sl) * 57.2958, ar = Math.atan(sr) * 57.2958;
      var idle = Math.abs(A) < 0.02;
      if (idle !== str._idle) { str._idle = idle; str.classList.toggle('is-idle', idle); }
      for (var k = 0; k < N; k++) {
        var x = (k + 0.5) / N, y = x < p ? A * x / p : A * (1 - x) / (1 - p);
        segs[k].style.transform = Math.abs(A) < 0.02 ? '' : 'translateY(' + y.toFixed(2) + 'px) rotate(' + (x < p ? al : ar).toFixed(2) + 'deg)';
      }
    }
    var s = {
      step: function (dt) {
        if (held) { A += (target - A) * Math.min(1, dt * 22); V = 0; }
        else { var acc = -520 * A - 7 * V; V += acc * dt; A += V * dt; } // damped spring: quick quiver, settles in ~0.8s
        var alive = held || Math.abs(A) > 0.03 || Math.abs(V) > 0.3;
        if (!alive) { A = 0; V = 0; }
        render();
        return alive;
      }
    };
    function pluck(amount, at) { W = a.offsetWidth || W; p = at; held = false; A = amount; V = 0; wake(s); }
    on(a, 'pointerenter', function (e) {
      if (e.pointerType !== 'mouse') return;
      rect = a.getBoundingClientRect(); W = rect.width; base = rect.bottom - 4;
      /* PEPTICITY v08: buttons and cards are plucked as the pointer comes in, so every hover moves the string */
      if (opts.pluckOnEnter && motion()) pluck(5 * motion(), Math.max(0.1, Math.min(0.9, (e.clientX - rect.left) / W)));
    });
    on(a, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var m = motion(); if (!m) return;
      if (!rect) { rect = a.getBoundingClientRect(); W = rect.width; base = rect.bottom - 4; }
      p = Math.max(0.08, Math.min(0.92, (e.clientX - rect.left) / W));
      // the string grabs when the pointer drifts near the line and bends toward it
      var dy = e.clientY - base;
      held = dy > -14; target = Math.max(-9, Math.min(9, dy)) * m;
      if (dy <= -14 && Math.abs(A) > 0.5) held = false;
      wake(s);
    }, { passive: true });
    on(a, 'pointerleave', function (e) {
      rect = null;
      if (held) { held = false; wake(s); }
    });
    on(a, 'focus', function () { if (a.matches(':focus-visible') && motion()) pluck(6 * motion(), 0.35); });
    on(a, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse' || !motion()) return;
      var r = a.getBoundingClientRect(); W = r.width;
      a.classList.add('is-live'); clearTimeout(liveT); liveT = setTimeout(function () { a.classList.remove('is-live'); }, 900);
      pluck(7 * motion(), Math.max(0.1, Math.min(0.9, (e.clientX - r.left) / r.width)));
    });
    function destroy() {
      off.forEach(function (f) { f(); }); active.delete(s); clearTimeout(liveT);
      str.remove(); a.classList.remove('is-live'); delete a[KEY];
    }
    a[KEY] = destroy;
    return destroy;
  }
  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY + 'root']) return root[KEY + 'root'];
    opts = opts || {};
    var els = root.classList.contains('apx-h105') ? [root] : [].slice.call(root.querySelectorAll('.apx-h105'));
    var ds = els.map(function (el) { return enhance(el, opts); });
    function destroy() { ds.forEach(function (d) { d(); }); delete root[KEY + 'root']; }
    root[KEY + 'root'] = destroy;
    return destroy;
  }
  APX.HOV105 = { code: 'HOV-105', name: 'Plucked String', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="HOV-105"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

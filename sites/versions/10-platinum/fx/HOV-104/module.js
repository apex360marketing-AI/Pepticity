/* HOV-104 · Lead Trail. window.APX.HOV104.mount(root, {gap:90, pool:10, life:1200}) -> destroy()
   root: .apx-h104 section. Trail content comes from ul.apx-h104__items > li (text or an <img>). Decorative: hidden from AT. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxHOV104';

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var gap = opts.gap || 90, size = opts.pool || 10, life = opts.life || 1200;
    var off = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    function motion() { var v = parseFloat(getComputedStyle(root).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    var src = root.querySelector('.apx-h104__items');
    var items = src ? [].slice.call(src.children).map(function (li) { return li.innerHTML; }) : [];
    if (!items.length) items = ['<span class="apx-h104__tag">Sample</span><b>[First name]</b><span>[Suburb] · [Job type]</span>'];
    var pool = document.createElement('div'); pool.className = 'apx-h104__pool'; pool.setAttribute('aria-hidden', 'true');
    var nodes = [];
    for (var i = 0; i < size; i++) { var n = document.createElement('div'); n.className = 'apx-h104__card'; pool.appendChild(n); nodes.push({ el: n, anim: null }); }
    root.insertBefore(pool, root.firstChild);
    var fine = matchMedia('(hover:hover) and (pointer:fine)');
    var next = 0, itemIdx = 0, lastX = null, lastY = null, acc = 0, rect = null;

    function spawn(x, y, dx, dy) {
      var m = motion(); if (m === 0) return;
      var slot = nodes[next]; next = (next + 1) % nodes.length;
      if (slot.anim) slot.anim.cancel();
      slot.el.innerHTML = items[itemIdx]; itemIdx = (itemIdx + 1) % items.length;
      var len = Math.sqrt(dx * dx + dy * dy) || 1, ux = dx / len, uy = dy / len;
      var rot = Math.max(-9, Math.min(9, dx * 0.08)) * m;
      var base = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0) rotate(' + rot.toFixed(2) + 'deg)';
      var end = 'translate3d(' + (x + ux * 40 * m).toFixed(1) + 'px,' + (y + uy * 40 * m + 26 * m).toFixed(1) + 'px,0) rotate(' + (rot * 1.6).toFixed(2) + 'deg)';
      slot.anim = slot.el.animate([
        { transform: base + ' scale(.55)', opacity: 0 },
        { transform: base + ' scale(1.02)', opacity: 1, offset: 0.14 },
        { transform: base + ' scale(1)', opacity: 1, offset: 0.45 },
        { transform: end + ' scale(.86)', opacity: 0 }
      ], { duration: life * (0.6 + 0.4 * m), easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'forwards' });
    }
    on(root, 'pointerenter', function (e) { rect = root.getBoundingClientRect(); lastX = lastY = null; acc = 0; });
    on(root, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse' || !fine.matches) return;
      if (!rect) rect = root.getBoundingClientRect();
      var x = e.clientX - rect.left, y = e.clientY - rect.top;
      if (lastX === null) { lastX = x; lastY = y; return; }
      var dx = x - lastX, dy = y - lastY; acc += Math.sqrt(dx * dx + dy * dy);
      if (acc >= gap) { acc = 0; spawn(x, y, dx, dy); }
      lastX = x; lastY = y;
    }, { passive: true });
    on(root, 'pointerleave', function () { rect = null; });
    on(window, 'scroll', function () { rect = null; }, { passive: true });
    on(root, 'pointerdown', function (e) {
      if (e.pointerType === 'mouse') return;
      var r = root.getBoundingClientRect(); spawn(e.clientX - r.left, e.clientY - r.top, 0, -1);
    });

    function destroy() {
      off.forEach(function (f) { f(); });
      nodes.forEach(function (n) { if (n.anim) n.anim.cancel(); });
      pool.remove();
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.HOV104 = { code: 'HOV-104', name: 'Lead Trail', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="HOV-104"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

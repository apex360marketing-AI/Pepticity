/* HOV-101 · Rising Tide. window.APX.HOV101.mount(root) -> destroy()
   root can be a single .apx-h101 button/link, or any container (every .apx-h101 inside is enhanced). */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxHOV101';
  var WAVE = '<svg viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M0 7Q12.5 0 25 7T50 7T75 7T100 7T125 7T150 7T175 7T200 7V14H0Z"/></svg>';

  function enhance(btn) {
    if (btn[KEY]) return btn[KEY];
    var off = [], raf = 0, tilt = 0, target = 0;
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    var orig = btn.innerHTML;
    var label = '<span class="apx-h101__label">' + orig + '</span>';
    btn.innerHTML = label + '<span class="apx-h101__clip" aria-hidden="true"><span class="apx-h101__tide"><span class="apx-h101__surf">' + WAVE + WAVE +
      '</span><span class="apx-h101__body"></span><span class="apx-h101__inner">' + label + '</span></span></span>';
    // the copy is decorative: keep ids unique and out of the tab order
    btn.querySelectorAll('.apx-h101__inner [id]').forEach(function (n) { n.removeAttribute('id'); });
    var surf = btn.querySelector('.apx-h101__surf');
    function motion() { var v = parseFloat(getComputedStyle(btn).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    function loop() {
      tilt += (target - tilt) * 0.12;
      surf.style.transform = 'rotate(' + tilt.toFixed(3) + 'deg)';
      raf = Math.abs(target - tilt) > 0.01 ? requestAnimationFrame(loop) : 0;
    }
    function kick() { if (!raf) raf = requestAnimationFrame(loop); }
    function wet(v) { btn.classList.toggle('is-wet', v); if (!v) { target = 0; kick(); } }
    var dryTimer = 0;
    on(btn, 'pointerenter', function (e) { if (e.pointerType === 'mouse') wet(true); });
    on(btn, 'pointerleave', function (e) { if (e.pointerType === 'mouse') wet(false); });
    on(btn, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var r = btn.getBoundingClientRect(); // one read per event, no writes until rAF
      target = ((e.clientX - r.left) / r.width - 0.5) * 9 * motion();
      kick();
    }, { passive: true });
    // touch: a quick fill and drain on tap
    on(btn, 'pointerdown', function (e) { if (e.pointerType !== 'mouse') { clearTimeout(dryTimer); wet(true); } });
    on(btn, 'pointerup', function (e) { if (e.pointerType !== 'mouse') dryTimer = setTimeout(function () { wet(false); }, 520); });
    on(btn, 'pointercancel', function () { wet(false); });
    on(btn, 'focus', function () { if (btn.matches(':focus-visible')) wet(true); });
    on(btn, 'blur', function () { wet(false); });
    function destroy() {
      cancelAnimationFrame(raf); clearTimeout(dryTimer);
      off.forEach(function (f) { f(); });
      btn.classList.remove('is-wet'); btn.innerHTML = orig;
      delete btn[KEY];
    }
    btn[KEY] = destroy;
    return destroy;
  }

  function mount(root) {
    if (!root) return function () {};
    if (root[KEY + 'root']) return root[KEY + 'root'];
    var els = root.classList.contains('apx-h101') ? [root] : [].slice.call(root.querySelectorAll('.apx-h101'));
    var ds = els.map(enhance);
    function destroy() { ds.forEach(function (d) { d(); }); delete root[KEY + 'root']; }
    root[KEY + 'root'] = destroy;
    return destroy;
  }
  APX.HOV101 = { code: 'HOV-101', name: 'Rising Tide', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="HOV-101"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

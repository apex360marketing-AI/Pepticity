/* NAV-102 · Split Preview. window.APX.NAV102.mount(root, {lockScroll:true}) -> destroy() */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxNAV102', uid = 0;
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var toggle = root.querySelector('.apx-n102__toggle');
    var panel = root.querySelector('.apx-n102__panel');
    var left = root.querySelector('.apx-n102__left');
    if (!toggle || !panel || !left) return function () {};
    var off = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }

    if (!panel.id) panel.id = 'apx-n102-panel-' + (++uid);
    var origToggle = toggle.innerHTML, label = toggle.textContent.trim() || 'Menu';
    toggle.innerHTML = '<i aria-hidden="true"></i><i aria-hidden="true"></i>';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('inert', '');

    // right half: stage + counter. Previews are visual echoes of the links, so hidden from assistive tech.
    var right = document.createElement('div'); right.className = 'apx-n102__right'; right.setAttribute('aria-hidden', 'true');
    var stage = document.createElement('div'); stage.className = 'apx-n102__stage';
    var count = document.createElement('div'); count.className = 'apx-n102__count';
    right.appendChild(stage); right.appendChild(count); panel.appendChild(right);

    var items = [].slice.call(left.querySelectorAll('.apx-n102__list > li'));
    var links = [], pvs = [], moved = [];
    items.forEach(function (li, i) {
      li.style.setProperty('--i', i);
      var a = li.querySelector('a'); if (!a) return;
      var pv = li.querySelector('.apx-n102__pv');
      if (!pv) { pv = document.createElement('div'); pv.className = 'apx-n102__pv'; pv.textContent = a.textContent; }
      else moved.push({ pv: pv, li: li });
      stage.appendChild(pv);
      if (!a.querySelector(':scope > span')) { a.innerHTML = '<span>' + a.innerHTML + '</span>'; a.dataset.apxWrapped = '1'; }
      links.push(a); pvs.push(pv);
    });
    var total = String(links.length).padStart(2, '0');
    count.innerHTML = '<span class="apx-n102__roll">' + links.map(function (_, i) { return '<span>' + String(i + 1).padStart(2, '0') + '</span>'; }).join('') + '</span><span>/ ' + total + '</span>';
    var rolls = [].slice.call(count.querySelectorAll('.apx-n102__roll > span'));

    var active = -1, isOpen = false, focusTimer = 0;
    function motion() { var v = parseFloat(getComputedStyle(root).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    function show(i) {
      if (i === active || i < 0 || i >= links.length) return;
      var prev = active; active = i;
      pvs.forEach(function (p, k) {
        p.classList.toggle('is-active', k === i);
        p.classList.toggle('is-leaving', k === prev);
      });
      links.forEach(function (a, k) { a.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      rolls.forEach(function (r, k) { r.style.transform = 'translateY(' + ((k - i) * 110) + '%)'; });
    }
    function open() {
      if (isOpen) return; isOpen = true;
      root.classList.add('is-open'); panel.removeAttribute('inert');
      toggle.setAttribute('aria-expanded', 'true'); toggle.setAttribute('aria-label', toggle.dataset.closeLabel || 'Close menu');
      if (opts.lockScroll !== false) document.documentElement.classList.add('apx-n102-lock');
      active = -1; show(0);
      clearTimeout(focusTimer);
      focusTimer = setTimeout(function () { links[0] && links[0].focus({ preventScroll: true }); }, 420 * motion());
    }
    function close(returnFocus) {
      if (!isOpen) return; isOpen = false; clearTimeout(focusTimer);
      root.classList.remove('is-open'); panel.setAttribute('inert', '');
      toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', label);
      document.documentElement.classList.remove('apx-n102-lock');
      if (returnFocus !== false) toggle.focus({ preventScroll: true });
    }
    on(toggle, 'click', function () { isOpen ? close() : open(); });
    links.forEach(function (a, i) {
      on(a, 'pointerenter', function () { show(i); });
      on(a, 'focus', function () { show(i); });
      on(a, 'click', function () { close(false); });
    });
    on(document, 'keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      var idx = links.indexOf(document.activeElement);
      if (idx > -1 && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
        e.preventDefault(); links[(idx + (e.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length].focus(); return;
      }
      if (e.key !== 'Tab') return;
      var f = [toggle].concat([].slice.call(left.querySelectorAll(FOCUSABLE)));
      if (e.shiftKey && document.activeElement === f[0]) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && document.activeElement === f[f.length - 1]) { e.preventDefault(); f[0].focus(); }
    });

    function destroy() {
      close(false);
      off.forEach(function (f) { f(); });
      moved.forEach(function (m) { m.li.appendChild(m.pv); m.pv.classList.remove('is-active', 'is-leaving'); });
      links.forEach(function (a) { a.removeAttribute('aria-current'); if (a.dataset.apxWrapped) { a.innerHTML = a.firstChild.innerHTML; delete a.dataset.apxWrapped; } });
      right.remove(); toggle.innerHTML = origToggle;
      ['aria-label', 'aria-controls', 'aria-expanded'].forEach(function (k) { toggle.removeAttribute(k); });
      panel.removeAttribute('inert');
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.NAV102 = { code: 'NAV-102', name: 'Split Preview', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="NAV-102"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

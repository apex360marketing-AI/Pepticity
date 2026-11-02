/* NAV-101 · Curtain Letters. window.APX.NAV101.mount(root, {lockScroll:true}) -> destroy() */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxNAV101', uid = 0;
  var ARROW = '<svg class="apx-n101__arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  var FOCUSABLE = 'a[href],button:not([disabled]),input,select,textarea,[tabindex]:not([tabindex="-1"])';

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var toggle = root.querySelector('.apx-n101__toggle');
    var panel = root.querySelector('.apx-n101__panel');
    if (!toggle || !panel) return function () {};
    var off = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }

    // build: veil, ghost, split letters
    var veil = document.createElement('div'); veil.className = 'apx-n101__veil'; veil.setAttribute('aria-hidden', 'true');
    root.insertBefore(veil, panel);
    var ghost = document.createElement('div'); ghost.className = 'apx-n101__ghost'; ghost.setAttribute('aria-hidden', 'true');
    panel.insertBefore(ghost, panel.firstChild);
    if (!panel.id) panel.id = 'apx-n101-panel-' + (++uid);
    var origToggle = toggle.innerHTML;
    var label = toggle.textContent.trim() || 'Menu';
    toggle.innerHTML = '<span class="apx-n101__burger" aria-hidden="true"></span><span class="apx-n101__lab" aria-hidden="true"><span>' + label + '</span><span>' + (toggle.dataset.closeLabel || 'Close') + '</span></span>';
    toggle.setAttribute('aria-label', label);
    toggle.setAttribute('aria-controls', panel.id);
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('inert', '');
    if (!panel.getAttribute('aria-label')) panel.setAttribute('aria-label', 'Site menu');

    var links = [].slice.call(panel.querySelectorAll('.apx-n101__list a'));
    var originals = links.map(function (a, li) {
      var html = a.innerHTML, text = a.textContent.trim();
      a.setAttribute('aria-label', text);
      a.style.setProperty('--li', li);
      var word = '<span class="apx-n101__word" aria-hidden="true">' + Array.from(text).map(function (c, i) {
        return '<span class="apx-n101__ch" style="--i:' + i + '"><i>' + (c === ' ' ? '&nbsp;' : c.replace(/&/g, '&amp;').replace(/</g, '&lt;')) + '</i></span>';
      }).join('') + '</span>';
      a.innerHTML = '<span class="apx-n101__num" aria-hidden="true">' + String(li + 1).padStart(2, '0') + '</span>' + word + ARROW;
      return html;
    });
    var aside = panel.querySelector('.apx-n101__aside');
    if (aside) aside.style.setProperty('--li', links.length);

    var isOpen = false, focusTimer = 0;
    function motion() {
      var v = parseFloat(getComputedStyle(root).getPropertyValue('--_m'));
      return isNaN(v) ? 1 : v;
    }
    function setGhost(a) {
      if (!a) { ghost.classList.remove('is-on'); return; }
      ghost.classList.remove('is-on');
      void ghost.offsetWidth; // restart the drift; runs once per pointer change, not per frame
      ghost.textContent = a.getAttribute('aria-label');
      ghost.classList.add('is-on');
    }
    function open() {
      if (isOpen) return; isOpen = true;
      root.classList.add('is-open');
      panel.removeAttribute('inert');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', toggle.dataset.closeLabel || 'Close menu');
      if (opts.lockScroll !== false) document.documentElement.classList.add('apx-n101-lock');
      clearTimeout(focusTimer);
      focusTimer = setTimeout(function () { if (links[0]) links[0].focus({ preventScroll: true }); }, 380 * motion());
      root.dispatchEvent(new CustomEvent('apx:menu', { detail: { open: true } }));
    }
    function close(returnFocus) {
      if (!isOpen) return; isOpen = false;
      clearTimeout(focusTimer);
      root.classList.remove('is-open');
      panel.setAttribute('inert', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', label);
      document.documentElement.classList.remove('apx-n101-lock');
      setGhost(null);
      if (returnFocus !== false) toggle.focus({ preventScroll: true });
      root.dispatchEvent(new CustomEvent('apx:menu', { detail: { open: false } }));
    }
    on(toggle, 'click', function () { isOpen ? close() : open(); });
    links.forEach(function (a) {
      on(a, 'pointerenter', function () { setGhost(a); });
      on(a, 'focus', function () { setGhost(a); });
      on(a, 'click', function () { close(false); });
    });
    on(document, 'keydown', function (e) {
      if (!isOpen) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var items = [toggle].concat([].slice.call(panel.querySelectorAll(FOCUSABLE)));
      var first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    function destroy() {
      close(false);
      off.forEach(function (f) { f(); });
      veil.remove(); ghost.remove();
      links.forEach(function (a, i) { a.innerHTML = originals[i]; a.removeAttribute('aria-label'); a.style.removeProperty('--li'); });
      toggle.innerHTML = origToggle;
      ['aria-label', 'aria-controls', 'aria-expanded'].forEach(function (k) { toggle.removeAttribute(k); });
      panel.removeAttribute('inert');
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.NAV101 = { code: 'NAV-101', name: 'Curtain Letters', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="NAV-101"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

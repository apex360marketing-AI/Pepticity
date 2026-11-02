/* NAV-104 · Thumb Arc. window.APX.NAV104.mount(root) -> destroy()
   Markup: .apx-n104 > button.apx-n104__trigger + ul.apx-n104__actions > li > a[data-icon] */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxNAV104', uid = 0;
  var ICONS = {
    phone: '<path d="M6.6 3.5h2.6l1.4 4-2 1.3a11 11 0 0 0 6.6 6.6l1.3-2 4 1.4v2.6a2 2 0 0 1-2.2 2A17 17 0 0 1 4.6 5.7a2 2 0 0 1 2-2.2Z"/>',
    message: '<path d="M4 5.5h16v10H9.5L5 19.5v-4H4z"/><path d="M8 9.5h8M8 12.5h5"/>',
    quote: '<path d="M7 3.5h7.5L19 8v12.5H7z"/><path d="M14 3.5V8h5M10 12.5h6M10 16h6"/>',
    pin: '<path d="M12 21s-6.5-5.8-6.5-11a6.5 6.5 0 0 1 13 0c0 5.2-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    calendar: '<rect x="4" y="5.5" width="16" height="14.5" rx="2"/><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>'
  };
  function icon(name, cls) {
    return '<svg ' + (cls ? 'class="' + cls + '" ' : '') + 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + (ICONS[name] || ICONS.plus) + '</svg>';
  }

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var trigger = root.querySelector('.apx-n104__trigger');
    var list = root.querySelector('.apx-n104__actions');
    if (!trigger || !list) return function () {};
    var off = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    var left = root.getAttribute('data-corner') === 'left', dir = left ? 1 : -1;

    if (!list.id) list.id = 'apx-n104-list-' + (++uid);
    var origTrigger = trigger.innerHTML;
    var label = trigger.getAttribute('aria-label') || trigger.textContent.trim() || 'Quick actions';
    trigger.innerHTML = icon('plus');
    trigger.setAttribute('aria-label', label);
    trigger.setAttribute('aria-expanded', 'false');
    trigger.setAttribute('aria-controls', list.id);
    list.setAttribute('inert', '');
    var scrim = document.createElement('div'); scrim.className = 'apx-n104__scrim'; scrim.setAttribute('aria-hidden', 'true');
    var arc = document.createElement('div'); arc.className = 'apx-n104__arc'; arc.setAttribute('aria-hidden', 'true');
    root.insertBefore(scrim, root.firstChild); root.insertBefore(arc, trigger);

    // positions: a gentle sweep that curves inward as it rises, like a thumb's reach
    var links = [].slice.call(list.querySelectorAll('a'));
    var n = links.length, step = opts.step || 64, R = opts.radius || 430, pts = [];
    var originals = links.map(function (a, i) {
      var html = a.innerHTML, text = a.textContent.trim();
      var y = -(i + 1) * step, x = dir * (R - Math.sqrt(Math.max(0, R * R - y * y)));
      pts.push([x, y]);
      a.style.setProperty('--x', x.toFixed(1) + 'px'); a.style.setProperty('--y', y.toFixed(1) + 'px');
      a.style.setProperty('--i', i); a.style.setProperty('--n', n);
      a.setAttribute('aria-label', text);
      a.innerHTML = icon(a.getAttribute('data-icon')) + '<span class="apx-n104__lab" aria-hidden="true">' + text.replace(/&/g, '&amp;').replace(/</g, '&lt;') + '</span>';
      return html;
    });
    var d = 'M0 0 ' + pts.map(function (p) { return 'L' + p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' ');
    var top = pts[pts.length - 1] || [0, 0];
    d = 'M0 0 A' + R + ' ' + R + ' 0 0 ' + (left ? 1 : 0) + ' ' + top[0].toFixed(1) + ' ' + (top[1] - 22).toFixed(1);
    arc.innerHTML = '<svg aria-hidden="true"><path d="' + d + '"/></svg>';

    var isOpen = false, press = null, hot = null, consumed = false;
    function setHot(a) { if (hot === a) return; if (hot) hot.classList.remove('is-hot'); hot = a; if (a) a.classList.add('is-hot'); }
    function open(focusFirst) {
      if (isOpen) return; isOpen = true;
      root.classList.add('is-open'); list.removeAttribute('inert');
      trigger.setAttribute('aria-expanded', 'true');
      if (focusFirst && links[0]) setTimeout(function () { links[0].focus({ preventScroll: true }); }, 60);
    }
    function close(returnFocus) {
      if (!isOpen) return; isOpen = false; setHot(null);
      root.classList.remove('is-open'); list.setAttribute('inert', '');
      trigger.setAttribute('aria-expanded', 'false');
      if (returnFocus) trigger.focus({ preventScroll: true });
    }

    // press-and-slide: press opens, slide onto an action, release to choose it
    on(trigger, 'pointerdown', function (e) {
      if (e.button > 0) return;
      press = { x: e.clientX, y: e.clientY, id: e.pointerId, wasOpen: isOpen };
      if (!isOpen) { open(false); consumed = true; }
      try { trigger.setPointerCapture(e.pointerId); } catch (_) {}
    });
    on(trigger, 'pointermove', function (e) {
      if (!press || e.pointerId !== press.id) return;
      var best = null, bd = 44;
      links.forEach(function (a) {
        var r = a.getBoundingClientRect(), dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), dd = Math.sqrt(dx * dx + dy * dy);
        if (dd < bd) { bd = dd; best = a; }
      });
      setHot(best);
    });
    function release(e) {
      if (!press || e.pointerId !== press.id) return;
      var moved = Math.abs(e.clientX - press.x) + Math.abs(e.clientY - press.y), chosen = hot;
      press = null;
      if (chosen && moved > 16) { setHot(null); close(false); consumed = true; chosen.click(); }
    }
    on(trigger, 'pointerup', release); on(trigger, 'pointercancel', function () { press = null; setHot(null); });
    on(trigger, 'click', function (e) {
      if (consumed) { consumed = false; return; }
      if (e.detail === 0) { isOpen ? close(true) : open(true); return; } // keyboard
      isOpen ? close(false) : open(false);
    });
    on(scrim, 'click', function () { close(false); });
    links.forEach(function (a) { on(a, 'click', function () { close(false); }); });
    on(root, 'keydown', function (e) {
      if (!isOpen) return;
      var i = links.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); links[(i + 1 + n) % n].focus(); }
      else if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); i <= 0 ? trigger.focus() : links[i - 1].focus(); }
    });
    on(root, 'focusout', function (e) { if (isOpen && e.relatedTarget && !root.contains(e.relatedTarget)) close(false); });

    function destroy() {
      close(false);
      off.forEach(function (f) { f(); });
      scrim.remove(); arc.remove();
      links.forEach(function (a, i) { a.innerHTML = originals[i]; a.removeAttribute('aria-label'); ['--x', '--y', '--i', '--n'].forEach(function (k) { a.style.removeProperty(k); }); });
      trigger.innerHTML = origTrigger; ['aria-expanded', 'aria-controls'].forEach(function (k) { trigger.removeAttribute(k); });
      list.removeAttribute('inert');
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.NAV104 = { code: 'NAV-104', name: 'Thumb Arc', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="NAV-104"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

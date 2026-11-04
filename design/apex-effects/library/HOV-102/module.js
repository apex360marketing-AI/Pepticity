/* HOV-102 · Letter Roll. window.APX.HOV102.mount(root) -> destroy()
   root: one .apx-h102 element or a container of them. Optional data-icon="arrow" adds a sliding arrow. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxHOV102';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function esc(c) { return c.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function enhance(el) {
    if (el[KEY]) return el[KEY];
    var off = [], timer = 0;
    function on(t, ev, fn, o) { t.addEventListener(ev, fn, o); off.push(function () { t.removeEventListener(ev, fn, o); }); }
    var orig = el.innerHTML, text = el.textContent.replace(/\s+/g, ' ').trim();
    var chars = Array.from(text), n = chars.length;
    if (!el.getAttribute('aria-label')) { el.setAttribute('aria-label', text); el.dataset.apxLabel = '1'; }
    el.innerHTML = '<span class="apx-h102__w" aria-hidden="true">' + chars.map(function (c, i) {
      var sp = c === ' ';
      return '<span class="apx-h102__c' + (sp ? ' is-sp' : '') + '" style="--i:' + i + ';--j:' + (n - 1 - i) + '"><span>' + (sp ? ' ' : esc(c)) + '</span><span>' + (sp ? ' ' : esc(c)) + '</span></span>';
    }).join('') + '</span>' + (el.getAttribute('data-icon') === 'arrow' ? '<span class="apx-h102__ico" aria-hidden="true">' + ARROW + ARROW + '</span>' : '');
    function roll(fromRight) { el.style.setProperty('--dir', fromRight ? 1 : 0); el.classList.add('is-roll'); }
    function unroll(toRight) { el.style.setProperty('--dir', toRight ? 1 : 0); el.classList.remove('is-roll'); }
    function side(e) { var r = el.getBoundingClientRect(); return e.clientX > r.left + r.width / 2; }
    on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') roll(side(e)); });
    on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') unroll(side(e)); });
    on(el, 'focus', function () { if (el.matches(':focus-visible')) roll(false); });
    on(el, 'blur', function () { unroll(false); });
    on(el, 'pointerdown', function (e) { if (e.pointerType !== 'mouse') { clearTimeout(timer); roll(false); timer = setTimeout(function () { unroll(true); }, 900); } });
    function destroy() {
      clearTimeout(timer); off.forEach(function (f) { f(); });
      el.innerHTML = orig; el.classList.remove('is-roll'); el.style.removeProperty('--dir');
      if (el.dataset.apxLabel) { el.removeAttribute('aria-label'); delete el.dataset.apxLabel; }
      delete el[KEY];
    }
    el[KEY] = destroy;
    return destroy;
  }
  function mount(root) {
    if (!root) return function () {};
    if (root[KEY + 'root']) return root[KEY + 'root'];
    var els = root.classList.contains('apx-h102') ? [root] : [].slice.call(root.querySelectorAll('.apx-h102'));
    var ds = els.map(enhance);
    function destroy() { ds.forEach(function (d) { d(); }); delete root[KEY + 'root']; }
    root[KEY + 'root'] = destroy;
    return destroy;
  }
  APX.HOV102 = { code: 'HOV-102', name: 'Letter Roll', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="HOV-102"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

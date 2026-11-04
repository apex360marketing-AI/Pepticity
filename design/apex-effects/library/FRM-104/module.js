/* FRM-104 · Sentence Check. window.APX.FRM104.mount(form, {check: ({industry, area}) => Promise<{title, text}>}) -> destroy()
   form.apx-f104 > p.apx-f104__sentence with span.apx-f104__blank > input.apx-f104__in (first one may have data-options="A|B|C" for suggestions)
   and button.apx-f104__go. Without opts.check it shows a clearly labelled SAMPLE answer built from data-result-* attributes. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxFRM104', uid = 0;
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function fill(tpl, v) { return tpl.replace(/\{(\w+)\}/g, function (_, k) { return v[k] || ''; }); }

  function mount(form, opts) {
    if (!form) return function () {};
    if (form[KEY]) return form[KEY];
    opts = opts || {};
    var off = [], made = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    form.setAttribute('novalidate', '');
    var go = form.querySelector('.apx-f104__go');
    var goOrig = go ? go.innerHTML : '';
    if (go && !go.querySelector('svg')) { if (!go.getAttribute('aria-label')) go.setAttribute('aria-label', go.textContent.trim() || 'Check'); go.innerHTML = ARROW; }
    var hint = form.querySelector('.apx-f104__hint');
    if (!hint) { hint = document.createElement('p'); hint.className = 'apx-f104__hint'; form.appendChild(hint); made.push(hint); }
    hint.id = hint.id || 'apx-f104-hint-' + (++uid);
    hint.setAttribute('aria-live', 'polite');
    var result = form.querySelector('.apx-f104__result');
    if (!result) { result = document.createElement('div'); result.className = 'apx-f104__result'; form.appendChild(result); made.push(result); }
    result.setAttribute('aria-live', 'polite');

    var blanks = [].slice.call(form.querySelectorAll('.apx-f104__blank')).map(function (b) {
      var input = b.querySelector('.apx-f104__in');
      var shim = document.createElement('span'); shim.className = 'apx-f104__shim'; shim.setAttribute('aria-hidden', 'true'); b.appendChild(shim);
      input.setAttribute('aria-describedby', hint.id);
      var rec = { b: b, input: input, shim: shim, list: null, opts: null, active: -1 };
      function sync() { b.classList.toggle('is-filled', !!input.value.trim()); }
      on(input, 'input', function () { sync(); b.removeAttribute('data-invalid'); if (rec.opts) suggest(rec); });
      sync();
      if (input.getAttribute('data-options')) setupCombo(rec);
      return rec;
    });

    function setupCombo(rec) {
      var input = rec.input;
      rec.opts = input.getAttribute('data-options').split('|').map(function (s) { return s.trim(); }).filter(Boolean);
      var list = document.createElement('ul'); list.className = 'apx-f104__list'; list.id = 'apx-f104-list-' + (++uid);
      list.setAttribute('role', 'listbox'); list.setAttribute('aria-label', input.getAttribute('aria-label') || 'Suggestions');
      rec.b.appendChild(list); rec.list = list;
      input.setAttribute('role', 'combobox'); input.setAttribute('aria-autocomplete', 'list');
      input.setAttribute('aria-expanded', 'false'); input.setAttribute('aria-controls', list.id); input.setAttribute('autocomplete', 'off');
      on(input, 'focus', function () { suggest(rec); });
      on(input, 'blur', function () { setTimeout(function () { close(rec); }, 120); });
      on(input, 'keydown', function (e) {
        var items = rec.list.children, n = items.length;
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          e.preventDefault(); if (!list.classList.contains('is-open')) suggest(rec);
          if (!n) return; rec.active = (rec.active + (e.key === 'ArrowDown' ? 1 : -1) + n) % n; mark(rec);
        } else if (e.key === 'Enter' && list.classList.contains('is-open') && rec.active > -1) {
          e.preventDefault(); pick(rec, items[rec.active].dataset.v);
        } else if (e.key === 'Escape' && list.classList.contains('is-open')) { e.preventDefault(); close(rec); }
      });
      on(list, 'pointerdown', function (e) { var li = e.target.closest('li'); if (li) { e.preventDefault(); pick(rec, li.dataset.v); } });
    }
    function suggest(rec) {
      var q = rec.input.value.trim().toLowerCase();
      var hits = rec.opts.filter(function (o) { return !q || o.toLowerCase().indexOf(q) > -1; }).slice(0, 7);
      if (hits.length === 1 && hits[0].toLowerCase() === q) hits = [];
      rec.active = -1;
      rec.list.innerHTML = hits.map(function (h, i) {
        var at = h.toLowerCase().indexOf(q), label = q && at > -1 ? esc(h.slice(0, at)) + '<mark>' + esc(h.slice(at, at + q.length)) + '</mark>' + esc(h.slice(at + q.length)) : esc(h);
        return '<li role="option" id="' + rec.list.id + '-' + i + '" data-v="' + esc(h) + '" aria-selected="false">' + label + '</li>';
      }).join('');
      var open = hits.length > 0 && document.activeElement === rec.input;
      rec.list.classList.toggle('is-open', open);
      rec.input.setAttribute('aria-expanded', open ? 'true' : 'false');
      rec.input.removeAttribute('aria-activedescendant');
    }
    function mark(rec) {
      [].forEach.call(rec.list.children, function (li, i) { li.setAttribute('aria-selected', i === rec.active ? 'true' : 'false'); });
      rec.input.setAttribute('aria-activedescendant', rec.list.children[rec.active].id);
    }
    function pick(rec, v) {
      rec.input.value = v; rec.b.classList.add('is-filled'); rec.b.removeAttribute('data-invalid'); close(rec);
      var i = blanks.indexOf(rec), nx = blanks[i + 1];
      (nx ? nx.input : go).focus();
    }
    function close(rec) {
      if (!rec.list) return;
      rec.list.classList.remove('is-open'); rec.input.setAttribute('aria-expanded', 'false'); rec.input.removeAttribute('aria-activedescendant'); rec.active = -1;
    }

    var seq = 0;
    on(form, 'submit', function (e) {
      e.preventDefault();
      blanks.forEach(close);
      var bad = blanks.filter(function (r) { return !r.input.checkValidity() || (r.input.required && !r.input.value.trim()); });
      blanks.forEach(function (r) { r.input.setAttribute('aria-invalid', bad.indexOf(r) > -1 ? 'true' : 'false'); r.b.removeAttribute('data-invalid'); });
      if (bad.length) {
        bad.forEach(function (r) { void r.b.offsetWidth; r.b.setAttribute('data-invalid', ''); });
        hint.className = 'apx-f104__hint is-err';
        hint.textContent = bad[0].input.getAttribute('data-error') || 'Please fill in the blank.';
        bad[0].input.focus();
        return;
      }
      hint.className = 'apx-f104__hint'; hint.textContent = '';
      var v = {}; blanks.forEach(function (r) { v[r.input.name || 'value'] = r.input.value.trim(); });
      var my = ++seq;
      var p = typeof opts.check === 'function' ? Promise.resolve(opts.check(v)) : Promise.resolve({
        tag: 'Sample', title: fill(form.getAttribute('data-result-title') || 'Leads for {industry} in {area}', v),
        text: fill(form.getAttribute('data-result-text') || '[Your live availability answer goes here]', v)
      });
      p.then(function (r) {
        if (my !== seq) return;
        var link = form.getAttribute('data-result-link'), linkText = fill(form.getAttribute('data-result-link-text') || 'Talk to us about it', v);
        result.innerHTML = '<div class="apx-f104__card"><span class="apx-f104__tag">' + esc(r.tag || 'Sample') + '</span><b>' + esc(r.title || '') + '</b><p>' + esc(r.text || '') + '</p>' +
          (link ? '<a href="' + esc(link) + '">' + esc(linkText) + '</a>' : '') + '</div>';
      });
    });

    function destroy() {
      off.forEach(function (f) { f(); });
      blanks.forEach(function (r) {
        r.shim.remove(); if (r.list) r.list.remove();
        ['role', 'aria-autocomplete', 'aria-expanded', 'aria-controls', 'aria-activedescendant', 'aria-invalid', 'aria-describedby'].forEach(function (k) { r.input.removeAttribute(k); });
        r.b.classList.remove('is-filled'); r.b.removeAttribute('data-invalid');
      });
      if (go) go.innerHTML = goOrig;
      made.forEach(function (m) { m.remove(); });
      delete form[KEY];
    }
    form[KEY] = destroy;
    return destroy;
  }
  APX.FRM104 = { code: 'FRM-104', name: 'Sentence Check', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="FRM-104"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

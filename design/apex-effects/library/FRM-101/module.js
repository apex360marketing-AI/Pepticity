/* FRM-101 · Morph Field. window.APX.FRM101.mount(form) -> destroy()
   form.apx-f101 > .apx-f101__field > input|textarea.apx-f101__in[placeholder=" "] + label + p.apx-f101__hint[data-error]
   On a valid submit it fires a cancelable 'apx:submit' event (detail: {form, data}) and shows data-success text. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxFRM101', uid = 0;
  var OK = '<svg class="ok" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m4.5 10.5 3.6 3.5 7.4-8"/></svg>';
  var NO = '<svg class="no" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><circle cx="10" cy="10" r="7.2"/><path d="M10 6.2v4.6M10 13.6v.1"/></svg>';

  function mount(form) {
    if (!form) return function () {};
    if (form[KEY]) return form[KEY];
    var off = [], made = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    form.setAttribute('novalidate', '');
    var status = form.querySelector('.apx-f101__status');
    if (!status) { status = document.createElement('p'); status.className = 'apx-f101__status'; form.appendChild(status); made.push(status); }
    status.setAttribute('role', 'status'); status.setAttribute('aria-live', 'polite');

    var fields = [].slice.call(form.querySelectorAll('.apx-f101__field')).map(function (f) {
      var input = f.querySelector('.apx-f101__in'), hint = f.querySelector('.apx-f101__hint');
      if (!input) return null;
      if (!input.id) input.id = 'apx-f101-in-' + (++uid);
      if (!input.getAttribute('placeholder')) input.setAttribute('placeholder', ' ');
      var line = document.createElement('span'); line.className = 'apx-f101__line'; line.setAttribute('aria-hidden', 'true');
      var frame = document.createElement('span'); frame.className = 'apx-f101__frame'; frame.setAttribute('aria-hidden', 'true');
      var mark = document.createElement('span'); mark.className = 'apx-f101__mark'; mark.setAttribute('aria-hidden', 'true'); mark.innerHTML = OK + NO;
      var box = document.createElement('div'); box.className = 'apx-f101__box';
      var label = f.querySelector('label');
      f.insertBefore(box, input); box.appendChild(input); if (label) box.appendChild(label);
      box.appendChild(line); box.appendChild(frame); box.appendChild(mark);
      var hintOrig = null;
      if (hint) {
        hintOrig = hint.innerHTML;
        if (!hint.id) hint.id = input.id + '-hint';
        hint.innerHTML = '<span>' + hintOrig + '</span><span>' + (hint.getAttribute('data-error') || 'Please check this') + '</span>';
        var desc = (input.getAttribute('aria-describedby') || '').split(' ').filter(Boolean);
        if (desc.indexOf(hint.id) < 0) { desc.push(hint.id); input.setAttribute('aria-describedby', desc.join(' ')); }
      }
      var rec = { f: f, input: input, label: label, box: box, hint: hint, hintOrig: hintOrig, nodes: [line, frame, mark], touched: false };
      // the underline grows from where you clicked
      on(input, 'pointerdown', function (e) {
        var r = input.getBoundingClientRect(); f.style.setProperty('--ox', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      });
      on(input, 'focus', function () { if (!input.matches(':hover')) f.style.setProperty('--ox', '0%'); });
      on(input, 'blur', function () { rec.touched = true; check(rec, true); });
      on(input, 'input', function () { if (rec.touched || f.dataset.state) check(rec, false); });
      return rec;
    }).filter(Boolean);

    function setError(rec, bad) {
      var hintEl = rec.hint;
      rec.input.setAttribute('aria-invalid', bad ? 'true' : 'false');
      if (hintEl) { // swap what assistive tech hears: the hint or the error
        var spans = hintEl.children; if (spans.length === 2) { spans[0].setAttribute('aria-hidden', bad ? 'true' : 'false'); spans[1].setAttribute('aria-hidden', bad ? 'false' : 'true'); }
      }
    }
    function check(rec, shake) {
      var v = rec.input.value.trim();
      if (!v && !rec.input.required) { delete rec.f.dataset.state; setError(rec, false); return true; }
      var good = rec.input.checkValidity() && (!!v || !rec.input.required);
      var was = rec.f.dataset.state;
      rec.f.dataset.state = good ? 'valid' : 'invalid';
      setError(rec, !good);
      if (!good && shake && was !== 'invalid') {
        rec.f.classList.remove('is-shake'); void rec.f.offsetWidth; rec.f.classList.add('is-shake');
      }
      return good;
    }
    fields.forEach(function (rec) { var sp = rec.hint && rec.hint.children; if (sp && sp.length === 2) sp[1].setAttribute('aria-hidden', 'true'); on(rec.f, 'animationend', function () { rec.f.classList.remove('is-shake'); }); });
    on(form, 'submit', function (e) {
      e.preventDefault();
      var firstBad = null;
      fields.forEach(function (rec) { rec.touched = true; if (!check(rec, true) && !firstBad) firstBad = rec; });
      if (firstBad) { firstBad.input.focus(); status.textContent = form.getAttribute('data-invalid') || 'Please check the highlighted fields.'; return; }
      var ev = new CustomEvent('apx:submit', { cancelable: true, bubbles: true, detail: { form: form, data: new FormData(form) } });
      form.dispatchEvent(ev);
      if (!ev.defaultPrevented) status.textContent = form.getAttribute('data-success') || 'Thanks, we have your details.';
    });

    function destroy() {
      off.forEach(function (f) { f(); });
      fields.forEach(function (rec) {
        rec.nodes.forEach(function (n) { n.remove(); });
        rec.f.insertBefore(rec.input, rec.box); if (rec.label) rec.f.insertBefore(rec.label, rec.box); rec.box.remove();
        if (rec.hint) rec.hint.innerHTML = rec.hintOrig;
        delete rec.f.dataset.state; rec.f.classList.remove('is-shake'); rec.f.style.removeProperty('--ox');
        rec.input.removeAttribute('aria-invalid');
      });
      made.forEach(function (n) { n.remove(); });
      delete form[KEY];
    }
    form[KEY] = destroy;
    return destroy;
  }
  APX.FRM101 = { code: 'FRM-101', name: 'Morph Field', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="FRM-101"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

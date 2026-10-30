/* FRM-102 · Quote Stepper. window.APX.FRM102.mount(form) -> destroy()
   form.apx-f102 > .apx-f102__steps > fieldset.apx-f102__step (legend + inputs) ; buttons .apx-f102__back / .apx-f102__next
   Fires cancelable 'apx:submit' (detail {form, data}) on the last step; shows .apx-f102__done with a summary unless prevented. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxFRM102';
  var ARROW = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mount(form) {
    if (!form) return function () {};
    if (form[KEY]) return form[KEY];
    var off = [], made = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    form.setAttribute('novalidate', '');
    var wrap = form.querySelector('.apx-f102__steps');
    var steps = [].slice.call(form.querySelectorAll('.apx-f102__step'));
    var back = form.querySelector('.apx-f102__back'), next = form.querySelector('.apx-f102__next');
    if (!wrap || !steps.length || !next) return function () {};
    var n = steps.length, cur = 0, lastPointer = 0, autoT = 0;
    var nextOrig = next.innerHTML, nextLabel = next.textContent.trim() || 'Next', submitLabel = form.getAttribute('data-submit-label') || 'Send';

    // progress
    var prog = document.createElement('div'); prog.className = 'apx-f102__prog';
    prog.innerHTML = '<div class="apx-f102__meta"><span class="apx-f102__count"></span><b class="apx-f102__name"></b></div>' +
      '<div class="apx-f102__track" aria-hidden="true"><i class="apx-f102__fill"></i>' +
      steps.map(function (_, i) { return '<i class="apx-f102__dot" style="left:' + (n > 1 ? i / (n - 1) * 100 : 0) + '%"></i>'; }).join('') + '</div>';
    form.insertBefore(prog, form.firstChild); made.push(prog);
    var live = document.createElement('p'); live.setAttribute('aria-live', 'polite');
    live.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;margin:0';
    form.appendChild(live); made.push(live);
    var countEl = prog.querySelector('.apx-f102__count'), nameEl = prog.querySelector('.apx-f102__name'), fill = prog.querySelector('.apx-f102__fill');
    var dots = [].slice.call(prog.querySelectorAll('.apx-f102__dot'));
    var errs = steps.map(function (s) {
      var e = s.querySelector('.apx-f102__err');
      if (!e) { e = document.createElement('p'); e.className = 'apx-f102__err'; s.appendChild(e); made.push(e); }
      e.id = e.id || ('apx-f102-err-' + Math.random().toString(36).slice(2, 8));
      s.setAttribute('aria-describedby', e.id);
      return e;
    });
    steps.forEach(function (s) { var l = s.querySelector('legend'); if (l && !l.hasAttribute('tabindex')) l.setAttribute('tabindex', '-1'); });
    var done = form.querySelector('.apx-f102__done');
    if (!done) { done = document.createElement('div'); done.className = 'apx-f102__done'; wrap.appendChild(done); made.push(done); }
    done.setAttribute('tabindex', '-1');

    function legend(i) { var l = steps[i].querySelector('legend'); return l ? l.textContent.trim() : ''; }
    function render(focus) {
      steps.forEach(function (s, i) {
        s.classList.toggle('is-current', i === cur); s.classList.toggle('is-past', i < cur);
        if (i === cur) s.removeAttribute('inert'); else s.setAttribute('inert', '');
      });
      dots.forEach(function (d, i) { d.classList.toggle('is-past', i < cur); d.classList.toggle('is-current', i === cur); });
      fill.style.transform = 'scaleX(' + (n > 1 ? cur / (n - 1) : 1) + ')';
      countEl.textContent = 'Step ' + (cur + 1) + ' of ' + n;
      nameEl.textContent = steps[cur].getAttribute('data-name') || '';
      if (back) back.hidden = cur === 0;
      var last = cur === n - 1;
      next.innerHTML = '<span>' + esc(last ? submitLabel : nextLabel) + '</span>' + ARROW;
      live.textContent = 'Step ' + (cur + 1) + ' of ' + n + ': ' + legend(cur);
      if (focus) {
        var lg = steps[cur].querySelector('legend');
        var first = steps[cur].querySelector('input:checked') || steps[cur].querySelector('input,select,textarea');
        setTimeout(function () { (first || lg).focus({ preventScroll: true }); }, 40);
      }
    }
    function valid(i) {
      var s = steps[i], bad = null;
      s.querySelectorAll('input,select,textarea').forEach(function (el) { if (!bad && !el.checkValidity()) bad = el; });
      var e = errs[i];
      if (bad) {
        e.textContent = s.getAttribute('data-error') || bad.getAttribute('data-error') || 'Please answer this to carry on.';
        e.classList.add('is-on');
        s.classList.remove('is-shake'); void s.offsetWidth; s.classList.add('is-shake');
        if (bad.type !== 'radio') bad.setAttribute('aria-invalid', 'true');
        bad.focus({ preventScroll: true });
        return false;
      }
      e.classList.remove('is-on'); e.textContent = '';
      s.querySelectorAll('[aria-invalid]').forEach(function (el) { el.removeAttribute('aria-invalid'); });
      return true;
    }
    function go(i) { cur = Math.max(0, Math.min(n - 1, i)); render(true); }
    function finish() {
      var data = new FormData(form);
      var ev = new CustomEvent('apx:submit', { cancelable: true, bubbles: true, detail: { form: form, data: data } });
      form.dispatchEvent(ev);
      if (ev.defaultPrevented) return;
      dots.forEach(function (d) { d.classList.add('is-past'); d.classList.remove('is-current'); });
      fill.style.transform = 'scaleX(1)';
      countEl.textContent = 'Done';
      nameEl.textContent = '';
      var rows = steps.map(function (s) {
        var vals = [].slice.call(s.querySelectorAll('input,select,textarea')).filter(function (el) { return (el.type !== 'radio' && el.type !== 'checkbox') || el.checked; })
          .map(function (el) { return el.value.trim(); }).filter(Boolean);
        return vals.length ? '<dt>' + esc(s.getAttribute('data-name') || legend(steps.indexOf(s))) + '</dt><dd>' + esc(vals.join(', ')) + '</dd>' : '';
      }).join('');
      done.innerHTML = '<h3 tabindex="-1">' + esc(form.getAttribute('data-done-title') || 'Thanks, that is everything.') + '</h3><p>' + esc(form.getAttribute('data-success') || '') + '</p><dl>' + rows + '</dl>';
      steps.forEach(function (s) { s.setAttribute('inert', ''); });
      form.classList.add('is-done');
      live.textContent = (form.getAttribute('data-done-title') || 'Thanks, that is everything.') + ' ' + (form.getAttribute('data-success') || '');
      setTimeout(function () { done.querySelector('h3').focus({ preventScroll: true }); }, 60);
    }
    on(form, 'submit', function (e) {
      e.preventDefault();
      if (!valid(cur)) return;
      if (cur < n - 1) go(cur + 1); else finish();
    });
    if (back) on(back, 'click', function () { go(cur - 1); });
    on(form, 'pointerdown', function () { lastPointer = Date.now(); });
    // choosing an option with the pointer moves on by itself (keyboard users stay in control)
    on(form, 'change', function (e) {
      var t = e.target;
      if (t.type !== 'radio' || Date.now() - lastPointer > 800) return;
      var i = steps.indexOf(t.closest('.apx-f102__step'));
      if (i !== cur || cur === n - 1) return;
      errs[i].classList.remove('is-on');
      clearTimeout(autoT); autoT = setTimeout(function () { if (valid(cur)) go(cur + 1); }, 380);
    });
    steps.forEach(function (s) { on(s, 'animationend', function () { s.classList.remove('is-shake'); }); });
    render(false);

    function destroy() {
      clearTimeout(autoT);
      off.forEach(function (f) { f(); });
      made.forEach(function (m) { m.remove(); });
      steps.forEach(function (s) { s.classList.remove('is-current', 'is-past', 'is-shake'); s.removeAttribute('inert'); s.removeAttribute('aria-describedby'); });
      form.classList.remove('is-done'); next.innerHTML = nextOrig; if (back) back.hidden = false;
      delete form[KEY];
    }
    form[KEY] = destroy;
    return destroy;
  }
  APX.FRM102 = { code: 'FRM-102', name: 'Quote Stepper', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="FRM-102"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

/* FRM-103 · Submit Morph. window.APX.FRM103.mount(form, {onSubmit: (FormData, form) => Promise}) -> destroy()
   Without onSubmit: POSTs to form[action] if set, otherwise (demo) resolves after a short pause.
   form.apx-f103 contains inputs .apx-f103__in, button.apx-f103__btn[type=submit] and optional .apx-f103__success. */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxFRM103';
  var SPIN = '<svg viewBox="0 0 26 26" aria-hidden="true"><circle cx="13" cy="13" r="10"/></svg>';
  var TICK = '<svg viewBox="0 0 26 26" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6.5 13.5 4.3 4.2 8.7-9.4"/></svg>';

  function mount(form, opts) {
    if (!form) return function () {};
    if (form[KEY]) return form[KEY];
    opts = opts || {};
    var btn = form.querySelector('.apx-f103__btn');
    if (!btn) return function () {};
    var off = [], made = [], timers = [];
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
    function motion() { var v = parseFloat(getComputedStyle(form).getPropertyValue('--_m')); return isNaN(v) ? 1 : v; }
    form.setAttribute('novalidate', '');
    var origBtn = btn.innerHTML, label = btn.textContent.trim();
    btn.innerHTML = '<span class="apx-f103__halo" aria-hidden="true"></span><span class="apx-f103__bg" aria-hidden="true"></span><span class="apx-f103__lab">' + origBtn + '</span>' +
      '<span class="apx-f103__spin" aria-hidden="true">' + SPIN + '</span><span class="apx-f103__tick" aria-hidden="true">' + TICK + '</span>';
    var msg = form.querySelector('.apx-f103__msg');
    if (!msg) { msg = document.createElement('p'); msg.className = 'apx-f103__msg'; form.appendChild(msg); made.push(msg); }
    msg.setAttribute('role', 'status'); msg.setAttribute('aria-live', 'polite');
    var success = form.querySelector('.apx-f103__success');
    if (!success) {
      success = document.createElement('div'); success.className = 'apx-f103__success';
      success.innerHTML = '<h3>' + (form.getAttribute('data-success-title') || 'Thank you') + '</h3><p>' + (form.getAttribute('data-success') || '') + '</p><button type="button" class="apx-f103__again">Send another</button>';
      form.appendChild(success); made.push(success);
    }
    success.setAttribute('inert', '');
    var heading = success.querySelector('h3,h2'); if (heading) heading.setAttribute('tabindex', '-1');
    var again = success.querySelector('.apx-f103__again');
    var inputs = [].slice.call(form.querySelectorAll('.apx-f103__in'));

    function setState(s) { if (s) form.dataset.state = s; else delete form.dataset.state; }
    function send(data) {
      if (typeof opts.onSubmit === 'function') return Promise.resolve(opts.onSubmit(data, form));
      var action = form.getAttribute('action');
      if (action && action !== '#') return fetch(action, { method: (form.getAttribute('method') || 'POST').toUpperCase(), body: data }).then(function (r) { if (!r.ok) throw new Error(r.status); });
      return new Promise(function (res) { later(res, 1300); });
    }
    on(form, 'submit', function (e) {
      e.preventDefault();
      if (form.dataset.state === 'loading' || form.dataset.state === 'done') return;
      var bad = inputs.filter(function (i) { var ok = i.checkValidity(); i.setAttribute('aria-invalid', ok ? 'false' : 'true'); return !ok; });
      if (bad.length) {
        msg.className = 'apx-f103__msg is-err';
        msg.textContent = bad[0].getAttribute('data-error') || 'Please check this and try again.';
        bad[0].focus(); setState('error'); later(function () { if (form.dataset.state === 'error') setState(''); }, 450);
        return;
      }
      msg.className = 'apx-f103__msg'; msg.textContent = form.getAttribute('data-sending') || 'Sending…';
      // the bloom starts from the button's centre (one read, at submit time)
      var fr = form.getBoundingClientRect(), br = btn.getBoundingClientRect();
      form.style.setProperty('--cx', (br.left + br.width / 2 - fr.left) + 'px');
      form.style.setProperty('--cy', (br.top + br.height / 2 - fr.top) + 'px');
      setState('loading'); btn.setAttribute('aria-busy', 'true'); btn.setAttribute('aria-disabled', 'true');
      var m = motion();
      send(new FormData(form)).then(function () {
        setState('done'); msg.textContent = '';
        later(function () {
          setState('success'); success.removeAttribute('inert');
          btn.removeAttribute('aria-busy');
          later(function () { heading && heading.focus({ preventScroll: true }); }, 120 * m);
        }, 900 * m + 40);
      }, function () {
        btn.removeAttribute('aria-busy'); btn.removeAttribute('aria-disabled');
        setState('error'); msg.className = 'apx-f103__msg is-err';
        msg.textContent = form.getAttribute('data-failed') || 'That did not go through. Please try again.';
        later(function () { if (form.dataset.state === 'error') setState(''); }, 450);
      });
    });
    inputs.forEach(function (i) { on(i, 'input', function () { if (i.getAttribute('aria-invalid') === 'true' && i.checkValidity()) { i.setAttribute('aria-invalid', 'false'); msg.textContent = ''; msg.className = 'apx-f103__msg'; } }); });
    if (again) on(again, 'click', function () {
      success.setAttribute('inert', ''); setState(''); btn.removeAttribute('aria-disabled');
      form.reset(); (inputs[0] || btn).focus();
    });

    function destroy() {
      timers.forEach(clearTimeout); off.forEach(function (f) { f(); });
      made.forEach(function (m) { m.remove(); }); setState('');
      btn.innerHTML = origBtn; btn.removeAttribute('aria-busy'); btn.removeAttribute('aria-disabled');
      success.removeAttribute('inert');
      delete form[KEY];
    }
    form[KEY] = destroy;
    return destroy;
  }
  APX.FRM103 = { code: 'FRM-103', name: 'Submit Morph', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="FRM-103"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

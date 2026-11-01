/* NAV-105 · Chapter Roll. window.APX.NAV105.mount(root, {scroller:Element|null}) -> destroy()
   Chapters are read from the dropdown links (href="#section-id"). */
(function () {
  var APX = (window.APX = window.APX || {});
  var KEY = '__apxNAV105', uid = 0;
  var CHEV = '<svg class="apx-n105__chev" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m4 6 4 4 4-4"/></svg>';
  function esc(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function mount(root, opts) {
    if (!root) return function () {};
    if (root[KEY]) return root[KEY];
    opts = opts || {};
    var bar = root.querySelector('.apx-n105__bar'), btn = root.querySelector('.apx-n105__now'), list = root.querySelector('.apx-n105__list');
    if (!bar || !btn || !list) return function () {};
    var off = [], raf = 0, ro;
    function on(el, ev, fn, o) { el.addEventListener(ev, fn, o); off.push(function () { el.removeEventListener(ev, fn, o); }); }
    var scroller = opts.scroller !== undefined ? opts.scroller : root.closest('[data-apx-scroller]');
    var scrollTarget = scroller || window;

    var links = [].slice.call(list.querySelectorAll('a'));
    var chapters = links.map(function (a, i) {
      a.parentNode.style.setProperty('--i', i);
      var id = (a.getAttribute('href') || '').replace(/^#/, '');
      return { a: a, name: a.textContent.trim(), el: id ? document.getElementById(id) : null, top: 0 };
    }).filter(function (c) { return c.el; });
    if (!chapters.length) return function () {};
    var n = chapters.length;

    if (!list.id) list.id = 'apx-n105-list-' + (++uid);
    var origBtn = btn.innerHTML, btnLabel = btn.textContent.trim() || 'Chapters';
    btn.innerHTML = '<span class="apx-n105__k" aria-hidden="true">' + esc(btn.dataset.kicker || 'Now reading') + '</span>' +
      '<span class="apx-n105__win" aria-hidden="true"><span class="apx-n105__reel">' + chapters.map(function (c) { return '<span>' + esc(c.name) + '</span>'; }).join('') + '</span></span>' + CHEV;
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', list.id);
    var count = document.createElement('span'); count.className = 'apx-n105__count'; count.setAttribute('aria-hidden', 'true');
    count.innerHTML = '<span class="apx-n105__win"><span class="apx-n105__reel">' + chapters.map(function (_, i) { return '<span>' + String(i + 1).padStart(2, '0') + '</span>'; }).join('') + '</span></span><span>/ ' + String(n).padStart(2, '0') + '</span>';
    var prog = document.createElement('i'); prog.className = 'apx-n105__prog'; prog.setAttribute('aria-hidden', 'true');
    bar.appendChild(count); bar.appendChild(prog);
    var reels = [btn.querySelector('.apx-n105__reel'), count.querySelector('.apx-n105__reel')];

    var cur = -1, isOpen = false, viewH = 0, endY = 0, headH = 0;
    function measure() {
      var base = scroller ? scroller.getBoundingClientRect().top - scroller.scrollTop : -window.scrollY;
      chapters.forEach(function (c) { c.top = c.el.getBoundingClientRect().top - base; });
      viewH = scroller ? scroller.clientHeight : window.innerHeight;
      endY = scroller ? scroller.scrollHeight : document.documentElement.scrollHeight;
      headH = root.offsetHeight;
      update();
    }
    function setChapter(i) {
      if (i === cur) return;
      var dist = cur < 0 ? 0 : Math.abs(i - cur); cur = i;
      reels.forEach(function (r) { r.style.setProperty('--_d', (0.45 + dist * 0.12) + 's'); r.style.transform = 'translateY(' + (-i * 100 / n) + '%)'; });
      chapters.forEach(function (c, k) { c.a.setAttribute('aria-current', k === i ? 'true' : 'false'); });
      btn.setAttribute('aria-label', btnLabel + ': now reading ' + chapters[i].name + ', chapter ' + (i + 1) + ' of ' + n);
    }
    function update() {
      raf = 0;
      var y = (scroller ? scroller.scrollTop : window.scrollY) + headH + viewH * 0.22;
      var i = 0;
      for (var k = 0; k < n; k++) if (chapters[k].top <= y) i = k;
      setChapter(i);
      var a = chapters[i].top, b = i < n - 1 ? chapters[i + 1].top : endY;
      var p = i < n - 1 ? (y - a) / Math.max(1, b - a) : (y - a) / Math.max(1, endY - a - viewH * 0.7);
      prog.style.transform = 'scaleX(' + Math.max(0, Math.min(1, p)).toFixed(4) + ')';
    }
    function onScroll() { if (!raf) raf = requestAnimationFrame(update); }
    on(scrollTarget, 'scroll', onScroll, { passive: true });
    on(window, 'resize', measure);
    if ('ResizeObserver' in window) { ro = new ResizeObserver(function () { measure(); }); ro.observe(scroller || document.body); }

    function open() {
      isOpen = true; root.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true');
      var a = chapters[Math.max(0, cur)].a; setTimeout(function () { a.focus({ preventScroll: true }); }, 30);
    }
    function close(focusBtn) {
      if (!isOpen) return; isOpen = false; root.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      if (focusBtn) btn.focus({ preventScroll: true });
    }
    on(btn, 'click', function () { isOpen ? close(false) : open(); });
    links.forEach(function (a) {
      on(a, 'click', function (e) {
        var c = chapters.filter(function (c) { return c.a === a; })[0]; if (!c) return;
        e.preventDefault(); close(false);
        var top = c.top - headH + 1, smooth = parseFloat(getComputedStyle(root).getPropertyValue('--_m')) > 0;
        scrollTarget.scrollTo({ top: top, behavior: smooth ? 'smooth' : 'auto' });
        if (history.replaceState) history.replaceState(null, '', a.getAttribute('href'));
        c.el.setAttribute('tabindex', '-1'); c.el.focus({ preventScroll: true });
      });
    });
    on(root, 'keydown', function (e) {
      if (!isOpen) return;
      var i = links.indexOf(document.activeElement);
      if (e.key === 'Escape') { e.preventDefault(); close(true); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); links[(i + 1) % links.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); links[(i - 1 + links.length) % links.length].focus(); }
    });
    on(document, 'pointerdown', function (e) { if (isOpen && !root.contains(e.target)) close(false); });
    on(root, 'focusout', function (e) { if (isOpen && e.relatedTarget && !root.contains(e.relatedTarget)) close(false); });
    measure();

    function destroy() {
      close(false); cancelAnimationFrame(raf);
      off.forEach(function (f) { f(); }); ro && ro.disconnect();
      count.remove(); prog.remove();
      btn.innerHTML = origBtn; ['aria-expanded', 'aria-controls', 'aria-label'].forEach(function (k) { btn.removeAttribute(k); });
      chapters.forEach(function (c) { c.a.removeAttribute('aria-current'); });
      delete root[KEY];
    }
    root[KEY] = destroy;
    return destroy;
  }
  APX.NAV105 = { code: 'NAV-105', name: 'Chapter Roll', mount: mount };
  function auto() { document.querySelectorAll('[data-apx-mount~="NAV-105"]').forEach(function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

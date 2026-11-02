/*! APEX library NAV-04 · Elevator Floors — self-contained, token-driven. window.APX['NAV-04'].mount(root) -> destroy() */
(function () {
  'use strict';
  /* ---- APX core (inlined per module; no globals besides window.APX) ---- */
  var W = window, D = document;
  var APX = W.APX = W.APX || {};
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function tok(el, n, fb) { var v = getComputedStyle(el).getPropertyValue(n).trim(); return v || fb; }
  var RM = W.matchMedia('(prefers-reduced-motion: reduce)');
  function motionOf(el) {
    if (RM.matches) return 0;
    var m = parseFloat(tok(el, '--apx-motion', '1'));
    return isFinite(m) ? clamp(m, 0, 2) : 1;
  }
  function isCompact() { return W.matchMedia('(max-width: 899px)').matches; }
  function register(code, name, mountFn) {
    var key = code.replace('-', '');
    function mount(root, opts) {
      if (!root || root.nodeType !== 1) return function () {};
      root.__apx = root.__apx || {};
      if (root.__apx[key]) return root.__apx[key];
      var cleanups = [];
      var api = {
        on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); cleanups.push(function () { t.removeEventListener(ev, fn, o); }); },
        add: function (fn) { cleanups.push(fn); }
      };
      var destroy = function () {
        cleanups.splice(0).reverse().forEach(function (f) { try { f(); } catch (e) {} });
        delete root.__apx[key]; root.removeAttribute('data-apx-mounted');
      };
      root.__apx[key] = destroy;
      var inner = mountFn(root, opts || {}, api);
      if (typeof inner === 'function') cleanups.push(inner);
      root.setAttribute('data-apx-mounted', '');
      api.on(root, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      api.on(W, 'apx:tokens', function () { if (api.retoken) api.retoken(); });
      return destroy;
    }
    APX[key] = APX[code] = { code: code, name: name, mount: mount };
    function auto() { D.querySelectorAll('[data-apx="' + code + '"]:not([data-apx-manual])').forEach(function (el) { mount(el); }); }
    if (!W.APX_NO_AUTOMOUNT) { if (D.readyState === 'loading') D.addEventListener('DOMContentLoaded', auto); else auto(); }
  }
  /* Ambient loop that only runs while `el` is on screen and the tab is visible. frame(timeSec, dt) */
  function ambient(el, api, frame) {
    var raf = 0, vis = false, run = false, last = 0;
    function step(now) {
      raf = 0; if (!vis || D.hidden || !run) return;
      var dt = last ? Math.min(.05, (now - last) / 1000) : .016; last = now;
      frame(now / 1000, dt);
      raf = requestAnimationFrame(step);
    }
    function upd() {
      if (vis && !D.hidden && run) { if (!raf) { last = 0; raf = requestAnimationFrame(step); } }
      else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }
    var io = new IntersectionObserver(function (es) { vis = es[es.length - 1].isIntersecting; upd(); }, { rootMargin: '10% 0px' });
    io.observe(el);
    api.on(D, 'visibilitychange', upd);
    api.add(function () { io.disconnect(); if (raf) cancelAnimationFrame(raf); raf = 0; });
    return { start: function () { run = true; upd(); }, stop: function () { run = false; upd(); }, visible: function () { return vis; } };
  }
  function onEnvChange(api, fn) {
    var mq = W.matchMedia('(max-width: 899px)');
    var h = function () { fn(); };
    if (RM.addEventListener) { RM.addEventListener('change', h); mq.addEventListener('change', h); api.add(function () { RM.removeEventListener('change', h); mq.removeEventListener('change', h); }); }
  }
  var _cx;
  function rgba(str, fb) {
    if (!_cx) { var c = D.createElement('canvas'); c.width = c.height = 1; _cx = c.getContext('2d', { willReadFrequently: true }); }
    _cx.clearRect(0, 0, 1, 1); _cx.fillStyle = '#000'; _cx.fillStyle = fb || '#000'; _cx.fillStyle = str || fb || '#000';
    _cx.fillRect(0, 0, 1, 1); var d = _cx.getImageData(0, 0, 1, 1).data;
    return [d[0] / 255, d[1] / 255, d[2] / 255, d[3] / 255];
  }
  function lum(c) { return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; }
  function e2(x) { x = clamp(x, 0, 1); return x * x * (3 - 2 * x); }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }
  function easeIO(t) { t = clamp(t, 0, 1); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  var uid = 0;

  /* NAV-04 · Elevator Floors — a floor readout that counts down as you descend; the menu opens as a brushed-metal button panel and each button flies you to its floor. */
  register('NAV-04', 'Elevator Floors', function (root, opts, api) {
    var panel = root.querySelector('.apx-nav04__panel'), btn = root.querySelector('.apx-nav04__btn');
    if (!panel || !btn) return;
    var list = panel.querySelector('ol, ul');
    var links = list ? [].slice.call(list.querySelectorAll('a[href^="#"]')) : [];
    var floorEl = root.querySelector('.apx-nav04__floor');
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var FROM = Math.max(1, parseInt(opt('floorsFrom', 'data-floors-from', '33'), 10) || 33);
    var GROUND = opt('ground', 'data-ground', 'G');
    var T = {
      label: opt('floorLabel', 'data-floor-label', 'Floor'), head: opt('panelHead', 'data-panel-head', 'Select a floor'),
      esc: opt('escHint', 'data-esc-hint', 'Esc to close'), close: opt('closeLabel', 'data-close-label', 'Close')
    };

    /* ---- remember the original markup, then build ---- */
    var keep = { panel: panel.innerHTML, btn: btn.innerHTML, floor: floorEl ? floorEl.innerHTML : '', hidden: panel.hidden, id: panel.id };
    if (!panel.id) panel.id = 'apx-nav04-panel-' + (++uid);
    var targets = links.map(function (a) { var id = decodeURIComponent(a.getAttribute('href').slice(1)); return id ? D.getElementById(id) : null; });
    var marks = targets.map(function (t) { return t ? [].slice.call(t.querySelectorAll('.apx-nav04-mark')) : []; });
    var markKeep = marks.map(function (ms) { return ms.map(function (m) { return m.textContent; }); });
    var items = links.map(function (a, i) {
      var name = a.textContent.trim(), sub = a.getAttribute('data-sub') || '';
      return { a: a, name: name, sub: sub, key: a.getAttribute('data-key') || '', t: targets[i], top: 0 };
    });
    var DOWN = '<svg viewBox="0 0 10 10" aria-hidden="true"><path d="M1.5 3.2 5 6.8l3.5-3.6" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    if (floorEl) floorEl.innerHTML = '<span class="apx-nav04__flabel">' + esc(T.label) + '</span><b class="apx-nav04__num"><span></span></b><em class="apx-nav04__dir">' + DOWN + '</em><i class="apx-nav04__shaft"><i></i></i>';
    btn.innerHTML = '<span class="apx-nav04__dots" aria-hidden="true"><i></i><i></i><i></i><i></i></span><span>' + btn.innerHTML + '</span>';
    btn.setAttribute('aria-expanded', 'false'); btn.setAttribute('aria-controls', panel.id);
    links.forEach(function (a, i) {
      a.classList.add('apx-nav04__fbtn');
      a.innerHTML = '<span class="apx-nav04__key" aria-hidden="true"></span><span class="apx-nav04__name">' + esc(items[i].name) + (items[i].sub ? '<small>' + esc(items[i].sub) + '</small>' : '') + '</span>';
      a.style.setProperty('--i', i);
    });
    var headEl = D.createElement('div'); headEl.className = 'apx-nav04__head';
    headEl.innerHTML = '<p>' + esc(T.head) + '</p><div class="apx-nav04__disp" aria-hidden="true"><b class="apx-nav04__num"><span></span></b><em class="apx-nav04__dir">' + DOWN + '</em></div>';
    var footEl = D.createElement('div'); footEl.className = 'apx-nav04__foot';
    footEl.innerHTML = '<span aria-hidden="true">' + esc(T.esc) + '</span><button type="button" class="apx-nav04__close">' + esc(T.close) + '</button>';
    var doors = D.createElement('div'); doors.className = 'apx-nav04__doors'; doors.setAttribute('aria-hidden', 'true'); doors.innerHTML = '<i></i><i></i>';
    var innerWrap = D.createElement('div'); innerWrap.className = 'apx-nav04__pin';
    while (panel.firstChild) innerWrap.appendChild(panel.firstChild);
    innerWrap.insertBefore(headEl, innerWrap.firstChild); innerWrap.appendChild(footEl);
    panel.appendChild(innerWrap); panel.appendChild(doors);
    panel.hidden = true;
    var closeBtn = footEl.querySelector('button');
    var nums = [].slice.call(root.querySelectorAll('.apx-nav04__num span')), dirs = [].slice.call(root.querySelectorAll('.apx-nav04__dir'));
    var car = floorEl ? floorEl.querySelector('.apx-nav04__shaft i') : null;
    api.add(function () {
      panel.innerHTML = keep.panel; panel.hidden = keep.hidden; if (!keep.id) panel.removeAttribute('id');
      btn.innerHTML = keep.btn; btn.removeAttribute('aria-expanded'); btn.removeAttribute('aria-controls');
      if (floorEl) floorEl.innerHTML = keep.floor;
      marks.forEach(function (ms, i) { ms.forEach(function (m, k) { m.textContent = markKeep[i][k]; }); });
      targets.forEach(function (t) { if (t) t.classList.remove('apx-nav04-here'); });
      root.classList.remove('is-open', 'is-static', 'is-light', 'is-compact');
    });

    /* ---- measure: where every floor starts, and which key it wears ---- */
    var geo = { first: 0, last: 1 };
    function floorAt(y) { var q = clamp((y - geo.first) / Math.max(1, geo.last - geo.first), 0, 1), f = Math.round(FROM * (1 - q)); return f <= 0 ? GROUND : (f < 10 ? '0' : '') + f; }
    function measure() {
      var sy = W.scrollY;
      /* PEPTICITY version: a stop that is not on the page yet (behind the 19+ gate) has no floor position */
      items.forEach(function (it) { it.top = it.t && it.t.getClientRects().length ? Math.round(it.t.getBoundingClientRect().top + sy) : Infinity; });
      /* two stops in one pinned section (THE CITY, THE DOORS): the second one starts where the pin ends */
      items.forEach(function (it, i) { var pv = items[i - 1]; if (pv && it.t && pv.t === it.t && isFinite(it.top)) it.top = pv.top + Math.max(0, it.t.offsetHeight - W.innerHeight); });
      var tops = items.filter(function (it) { return it.t && isFinite(it.top); }).map(function (it) { return it.top; });
      geo.first = tops.length ? Math.min.apply(null, tops) : 0; geo.last = tops.length ? Math.max.apply(null, tops) : 1;
      items.forEach(function (it, i) {
        var k = it.key || (it.t && isFinite(it.top) ? floorAt(it.top) : '–');
        it.a.querySelector('.apx-nav04__key').textContent = k;
        marks[i].forEach(function (m) { m.textContent = k; });
      });
      st.floor = ''; update(true);
    }

    /* ---- live readout ---- */
    var st = { floor: '', here: -2, dir: 1, lastY: W.scrollY, car: -1, raf: 0, motion: 1, stat: false, open: false };
    function update(force) {
      var y = W.scrollY, vh = W.innerHeight;
      if (Math.abs(y - st.lastY) > 2) { var d = y > st.lastY ? 1 : -1; if (d !== st.dir) { st.dir = d; dirs.forEach(function (e) { e.classList.toggle('is-up', d < 0); }); } }
      st.lastY = y;
      var here = -1;
      items.forEach(function (it, i) { if (it.t && it.top <= y + vh * .45) here = i; });
      /* PEPTICITY version: the readout shows the floor of the stop you are on, so it always matches its button */
      var f = here >= 0 && items[here].key ? items[here].key : floorAt(y);
      if (f !== st.floor || force) {
        var roll = !force && st.floor && st.motion;
        st.floor = f;
        nums.forEach(function (n) {
          n.textContent = f;
          if (roll) { n.classList.remove('is-roll-d', 'is-roll-u'); void n.offsetWidth; n.classList.add(st.dir > 0 ? 'is-roll-d' : 'is-roll-u'); }
        });
      }
      if (car) { var q = Math.round(clamp((y - geo.first) / Math.max(1, geo.last - geo.first), 0, 1) * 200) / 200; if (q !== st.car) { st.car = q; car.style.transform = 'translate3d(0,' + (q * 100).toFixed(1) + '%,0)'; } }
      if (here !== st.here) {
        st.here = here;
        items.forEach(function (it, i) {
          it.a.classList.toggle('is-here', i === here);
          if (i === here) it.a.setAttribute('aria-current', 'location'); else it.a.removeAttribute('aria-current');
          if (it.t) it.t.classList.toggle('apx-nav04-here', i === here);
        });
      }
    }
    function onScroll() { if (!st.raf) st.raf = requestAnimationFrame(function () { st.raf = 0; update(false); }); }
    api.on(W, 'scroll', onScroll, { passive: true });
    api.add(function () { if (st.raf) cancelAnimationFrame(st.raf); });
    var ro = new ResizeObserver(function () { measure(); });
    ro.observe(D.documentElement); api.add(function () { ro.disconnect(); });
    api.on(W, 'load', measure);
    if (D.fonts && D.fonts.ready) D.fonts.ready.then(function () { if (root.__apx && root.__apx.NAV04) measure(); });

    /* ---- fly to a floor: eased scroll the visitor can interrupt ---- */
    var fly = { raf: 0 };
    function stopFly() { if (fly.raf) cancelAnimationFrame(fly.raf); fly.raf = 0; }
    function flyTo(y) {
      stopFly();
      var y0 = W.scrollY, max = D.documentElement.scrollHeight - W.innerHeight; y = clamp(Math.round(y), 0, max);
      var dist = Math.abs(y - y0);
      if (!st.motion || dist < 2) { W.scrollTo({ top: y, behavior: 'instant' }); return; }
      var dur = Math.min(3.2, 1.1 + dist / 4200) / Math.max(.5, st.motion) * 1000, t0 = performance.now();
      function step(now) {
        var k = easeIO((now - t0) / dur);
        W.scrollTo({ top: y0 + (y - y0) * k, behavior: 'instant' });
        fly.raf = k < 1 ? requestAnimationFrame(step) : 0;
      }
      fly.raf = requestAnimationFrame(step);
    }
    ['wheel', 'touchstart'].forEach(function (ev) { api.on(W, ev, stopFly, { passive: true }); });
    api.add(stopFly);

    /* ---- the panel ---- */
    var closeT = 0;
    function openPanel() {
      if (st.open) return; st.open = true; clearTimeout(closeT);
      panel.hidden = false; btn.setAttribute('aria-expanded', 'true');
      void panel.offsetWidth; root.classList.add('is-open');
      var f = list.querySelector('.is-here') || links[0]; if (f) f.focus({ preventScroll: true });
    }
    function closePanel(returnFocus) {
      if (!st.open) return; st.open = false; root.classList.remove('is-open'); btn.setAttribute('aria-expanded', 'false');
      closeT = setTimeout(function () { if (!st.open) panel.hidden = true; }, st.motion ? 460 : 0);
      if (returnFocus) btn.focus({ preventScroll: true });
    }
    api.add(function () { clearTimeout(closeT); });
    api.on(btn, 'click', function () { if (st.open) closePanel(false); else openPanel(); });
    api.on(closeBtn, 'click', function () { closePanel(true); });
    links.forEach(function (a, i) {
      api.on(a, 'click', function (e) {
        e.preventDefault();
        a.classList.remove('is-pressed'); void a.offsetWidth; a.classList.add('is-pressed');
        setTimeout(function () { a.classList.remove('is-pressed'); }, 450);
        var it = items[i]; if (it.t) { measure(); flyTo(it.top); }
        setTimeout(function () { closePanel(false); }, st.motion ? 320 : 0);
        root.dispatchEvent(new CustomEvent('apx:navigate', { bubbles: true, detail: { index: i, id: it.t ? it.t.id : '', floor: a.querySelector('.apx-nav04__key').textContent } }));
      });
    });
    api.on(D, 'keydown', function (e) {
      if (!st.open) return;
      if (e.key === 'Escape') { e.preventDefault(); closePanel(true); return; }
      var i = links.indexOf(D.activeElement);
      var d = { ArrowDown: 2, ArrowUp: -2, ArrowRight: 1, ArrowLeft: -1 }[e.key];
      if (d && i >= 0) { e.preventDefault(); links[(i + d + links.length) % links.length].focus(); return; }
      if (e.key === 'Tab') {
        var f = links.concat([closeBtn]), j = f.indexOf(D.activeElement);
        if (e.shiftKey && j <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && j === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    });
    api.on(D, 'pointerdown', function (e) { if (st.open && !panel.contains(e.target) && !btn.contains(e.target)) closePanel(false); });
    /* brand / any in-page link inside the bar also flies */
    [].slice.call(root.querySelectorAll('.apx-nav04__bar a[href^="#"]')).forEach(function (a) {
      api.on(a, 'click', function (e) { var t = D.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); if (!t) return; e.preventDefault(); flyTo(t.getBoundingClientRect().top + W.scrollY); });
    });

    function setup() {
      var m = motionOf(root);
      st.motion = Math.min(1.5, m); st.stat = m === 0;
      root.classList.toggle('is-static', st.stat);
      root.classList.toggle('is-compact', isCompact());
      root.classList.toggle('is-light', lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5);
      st.here = -2; measure();
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

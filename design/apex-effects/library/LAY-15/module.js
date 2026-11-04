/*! APEX library LAY-15 · Lit Window Facade — self-contained, token-driven. window.APX['LAY-15'].mount(root) -> destroy() */
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

  /* LAY-15 · Lit Window Facade — every item is a window in one building; they light up one by one, flicker now and then, and open their details on hover or tap. */
  register('LAY-15', 'Lit Window Facade', function (root, opts, api) {
    var list = root.querySelector('.apx-lay15__windows');
    if (!list) return;
    var building = list.closest('.apx-lay15__building') || list.parentNode;
    function opt(k, attr, fb) { return opts[k] !== undefined ? opts[k] : (root.getAttribute(attr) || fb); }
    var MONTHS = String(opt('months', 'data-months', 'J,F,M,A,M,J,J,A,S,O,N,D')).split(',');
    var catNames = {};
    String(opt('catLabels', 'data-cat-labels', 'high:High-ticket,std:Local trade')).split(',').forEach(function (p) { var kv = p.split(':'); if (kv[1]) catNames[kv[0].trim()] = kv[1].trim(); });
    var valueSuffix = opt('valueSuffix', 'data-value-suffix', 'per lead');
    var countLabel = opt('countLabel', 'data-count-label', 'Lit');

    /* ---- DOM: windows from the list items ---- */
    var listHTML = list.innerHTML;
    var items = [].slice.call(list.children).filter(function (li) { return li.tagName === 'LI'; });
    var N = items.length;
    var data = items.map(function (li, i) {
      var name = li.textContent.trim(), cat = li.getAttribute('data-cat') || '';
      var peak = (li.getAttribute('data-peak') || '').split(',').map(function (x) { return parseInt(x, 10); }).filter(function (x) { return x >= 1 && x <= 12; });
      var d = { name: name, cat: cat, catName: catNames[cat] || cat, value: li.getAttribute('data-value') || '', peak: peak, icon: li.getAttribute('data-icon') || '' };
      var label = name + (d.catName ? ', ' + d.catName : '') + (d.value ? ', lead value ' + d.value : '');
      li.className = 'apx-lay15__cell';
      li.innerHTML = '<button type="button" class="apx-lay15__win' + (cat === 'high' ? ' is-hi' : '') + '" data-i="' + i + '" aria-label="' + esc(label) + '">' +
        '<span class="apx-lay15__pane"><i class="apx-lay15__lit"></i><i class="apx-lay15__sel"></i>' +
        (d.icon ? '<svg class="apx-lay15__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="' + esc(d.icon) + '"/></svg>' : '') +
        '<i class="apx-lay15__mull"></i></span></button><span class="apx-lay15__label" aria-hidden="true">' + esc(name) + '</span>';
      return d;
    });
    var wins = items.map(function (li) { return li.firstChild; });
    var roof = D.createElement('div'); roof.className = 'apx-lay15__roof'; roof.setAttribute('aria-hidden', 'true');
    roof.innerHTML = '<span class="apx-lay15__count">' + esc(countLabel) + ' <b>00</b> / ' + (N < 10 ? '0' : '') + N + '</span><i class="apx-lay15__mast"></i>';
    building.insertBefore(roof, building.firstChild);
    var sheen = D.createElement('div'); sheen.className = 'apx-lay15__sheen'; sheen.setAttribute('aria-hidden', 'true'); sheen.innerHTML = '<i></i>';
    building.appendChild(sheen);
    var countB = roof.querySelector('b');
    var tip = D.createElement('div'); tip.className = 'apx-lay15__tip'; tip.setAttribute('role', 'status'); tip.setAttribute('aria-live', 'polite');
    building.appendChild(tip);
    var filters = [].slice.call(root.querySelectorAll('.apx-lay15__filters [data-f]'));
    var filterState = filters.map(function (b) { return b.getAttribute('aria-pressed'); });
    api.add(function () {
      roof.remove(); sheen.remove(); tip.remove(); list.innerHTML = listHTML;
      filters.forEach(function (b, i) { if (filterState[i] === null) b.removeAttribute('aria-pressed'); else b.setAttribute('aria-pressed', filterState[i]); });
      root.classList.remove('is-static', 'is-light', 'is-vis', 'has-sel', 'is-compact');
    });

    /* ---- tooltip ---- */
    var sel = -1;
    function showTip(i) {
      var d = data[i], w = wins[i]; if (!d || !w) return;
      sel = i;
      tip.innerHTML = '<p class="apx-lay15__tt">' + esc(d.name) + '</p>' + (d.catName ? '<p class="apx-lay15__tc">' + esc(d.catName) + '</p>' : '') +
        (d.value ? '<p class="apx-lay15__tv">' + esc(d.value) + ' <span>' + esc(valueSuffix) + '</span></p>' : '') +
        (d.peak.length ? '<div class="apx-lay15__tm" aria-label="Busiest months">' + MONTHS.map(function (m, k) { return '<span' + (d.peak.indexOf(k + 1) >= 0 ? ' class="is-pk"' : '') + '>' + esc(m) + '</span>'; }).join('') + '</div>' : '');
      var br = building.getBoundingClientRect(), wr = w.getBoundingClientRect();
      var tw = tip.offsetWidth, th = tip.offsetHeight;
      var x = clamp(wr.left - br.left + wr.width / 2 - tw / 2, 8, br.width - tw - 8);
      var y = wr.bottom - br.top + 12;
      if (y + th > br.height - 8 && wr.top - br.top - th - 12 > 0) y = wr.top - br.top - th - 12;
      tip.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      tip.classList.add('is-on');
      wins.forEach(function (x2, k) { x2.classList.toggle('is-sel', k === i); });
      root.classList.add('has-sel');
    }
    function hideTip() {
      sel = -1; tip.classList.remove('is-on'); root.classList.remove('has-sel');
      wins.forEach(function (x2) { x2.classList.remove('is-sel'); });
    }
    function winOf(e) { var w = e.target.closest && e.target.closest('.apx-lay15__win'); return w && list.contains(w) ? w : null; }
    api.on(list, 'pointerover', function (e) { if (e.pointerType === 'touch') return; var w = winOf(e); if (w) showTip(+w.getAttribute('data-i')); });
    api.on(building, 'pointerleave', function (e) { if (e.pointerType === 'touch') return; if (!building.contains(D.activeElement)) hideTip(); });
    api.on(list, 'focusin', function (e) { var w = winOf(e); if (w) showTip(+w.getAttribute('data-i')); });
    api.on(list, 'focusout', function (e) { if (!list.contains(e.relatedTarget)) hideTip(); });
    var downSel = false;
    api.on(list, 'pointerdown', function (e) { var w = winOf(e); downSel = !!w && sel === +w.getAttribute('data-i'); });
    api.on(list, 'click', function (e) {
      var w = winOf(e); if (!w) return; var i = +w.getAttribute('data-i');
      if (downSel && e.pointerType === 'touch') { downSel = false; hideTip(); return; }
      showTip(i);
      root.dispatchEvent(new CustomEvent('apx:select', { bubbles: true, detail: { index: i, name: data[i].name, cat: data[i].cat } }));
    });
    api.on(D, 'pointerdown', function (e) { if (sel >= 0 && !building.contains(e.target)) hideTip(); });
    api.on(root, 'keydown', function (e) {
      if (e.key === 'Escape' && sel >= 0) { var w = wins[sel]; hideTip(); if (w) w.blur(); return; }
      var w2 = winOf(e); if (!w2) return;
      var k = { ArrowRight: 1, ArrowLeft: -1, ArrowDown: cols(), ArrowUp: -cols() }[e.key]; if (!k) return;
      e.preventDefault();
      var i = +w2.getAttribute('data-i'), j = i;
      do { j += k; } while (j >= 0 && j < N && wins[j].classList.contains('is-dim'));
      if (j >= 0 && j < N) wins[j].focus();
    });
    function cols() { var t0 = items[0] ? items[0].offsetTop : 0, c = 0; for (var i = 0; i < N && items[i].offsetTop === t0; i++) c++; return Math.max(1, c); }

    /* ---- filters ---- */
    filters.forEach(function (b) {
      api.on(b, 'click', function () {
        var f = b.getAttribute('data-f');
        filters.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        wins.forEach(function (w, i) {
          var off = f !== 'all' && data[i].cat !== f;
          w.classList.toggle('is-dim', off); w.tabIndex = off ? -1 : 0; w.parentNode.classList.toggle('is-dim', off);
        });
        if (sel >= 0 && wins[sel].classList.contains('is-dim')) hideTip();
      });
    });

    /* ---- lights: one by one in a scattered order, then the odd flicker ---- */
    var order = data.map(function (d, i) { return i; }).sort(function (a, b) { return ((a * 7919) % N) - ((b * 7919) % N) || a - b; });
    var st = { started: false, t: 0, lit: -1, flick: 0, motion: 1, stat: false };
    function setLit(n) {
      n = clamp(n, 0, N); if (n === st.lit) return;
      for (var k = 0; k < N; k++) wins[order[k]].classList.toggle('is-on', k < n);
      st.lit = n; countB.textContent = (n < 10 ? '0' : '') + n;
    }
    var loop = ambient(root, api, function (now, dt) {
      if (!st.started) return;
      if (st.lit < N) { st.t += dt * st.motion; setLit(Math.floor(st.t / .055) + 1); }
      st.flick -= dt;
      if (st.flick <= 0 && st.lit >= N) {
        st.flick = (1.4 + Math.random() * 1.2) / Math.max(.25, st.motion);
        var w = wins[(Math.random() * N) | 0];
        if (w && !w.classList.contains('is-sel')) { w.classList.remove('is-flick'); void w.offsetWidth; w.classList.add('is-flick'); }
      }
    });
    api.on(list, 'animationend', function (e) { var w = e.target.closest && e.target.closest('.apx-lay15__win'); if (w) w.classList.remove('is-flick'); });
    var io = new IntersectionObserver(function (es) {
      var e = es[es.length - 1]; root.classList.toggle('is-vis', e.isIntersecting);
      if (e.isIntersecting && e.intersectionRatio > .12 && !st.started) { st.started = true; st.t = 0; }
    }, { threshold: [0, .12, .3] });
    io.observe(building); api.add(function () { io.disconnect(); });
    api.on(W, 'resize', function () { if (sel >= 0) showTip(sel); }, { passive: true });

    function setup() {
      var m = motionOf(root);
      st.motion = Math.min(1.5, m); st.stat = m === 0;
      root.classList.toggle('is-static', st.stat);
      root.classList.toggle('is-compact', isCompact());
      root.classList.toggle('is-light', lum(rgba(tok(root, '--apx-bg', '#0b0b0d'))) > .5);
      if (st.stat) { loop.stop(); st.started = true; setLit(N); wins.forEach(function (w) { w.classList.remove('is-flick'); }); }
      else { if (st.lit >= N) setLit(N); else setLit(Math.max(0, st.lit)); loop.start(); }
    }
    api.retoken = setup; onEnvChange(api, setup); setup();
  });
})();

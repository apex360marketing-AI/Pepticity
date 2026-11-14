/* Founder cards runtime (shared by the 8 versions; small, no dependencies).
   1. RIM: for every [data-fc-rim] element it reads the element's own clip-path polygon and draws the rim light along it.
   2. SEAT: a few degrees of pointer tilt and a light that follows the pointer (off for touch and reduced motion).
   3. FORM: checks the email and the consent tick, then shows the preview-only success state. Nothing is sent anywhere. */
(function (win, doc) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var reduce = win.matchMedia('(prefers-reduced-motion: reduce)');
  var noHover = win.matchMedia('(hover: none)');
  var uid = 0;
  var probeBox = null, probe = null;

  function px(expr, ref) {
    if (!probeBox) {
      probeBox = doc.createElement('div');
      probeBox.setAttribute('aria-hidden', 'true');
      probeBox.style.cssText = 'position:absolute;left:-99999px;top:0;height:0;overflow:hidden;visibility:hidden;contain:strict';
      probe = doc.createElement('div');
      probe.style.height = '0';
      probeBox.appendChild(probe);
      doc.body.appendChild(probeBox);
    }
    probeBox.style.width = ref + 'px';
    probe.style.width = '0px';
    probe.style.width = expr;
    return probe.getBoundingClientRect().width;
  }
  function splitTop(s, sep) {
    var out = [], depth = 0, cur = '', i, c;
    for (i = 0; i < s.length; i++) {
      c = s.charAt(i);
      if (c === '(') { depth++; }
      if (c === ')') { depth--; }
      if (c === sep && depth === 0) { if (cur.trim()) { out.push(cur.trim()); } cur = ''; } else { cur += c; }
    }
    if (cur.trim()) { out.push(cur.trim()); }
    return out;
  }
  /* the element's clip-path polygon as pixel points, or null */
  function points(el) {
    var cp = win.getComputedStyle(el).clipPath || '';
    var m = /^polygon\((.*)\)$/.exec(cp.trim());
    if (!m) { return null; }
    var w = el.offsetWidth, h = el.offsetHeight;
    if (!w || !h) { return null; }
    var parts = splitTop(m[1], ',');
    if (/^(evenodd|nonzero)$/.test(parts[0])) { parts.shift(); }
    return parts.map(function (p) {
      var xy = splitTop(p, ' ');
      return [px(xy[0], w), px(xy[1], h)];
    });
  }
  function drawRim(el) {
    var pts = points(el);
    if (!pts) { return; }
    var svg = el.querySelector(':scope > svg.fc-rim');
    if (!svg) {
      var id = 'fc-rim-g' + (++uid);
      svg = doc.createElementNS(NS, 'svg');
      svg.setAttribute('class', 'fc-rim');
      svg.setAttribute('aria-hidden', 'true');
      svg.setAttribute('focusable', 'false');
      svg.innerHTML = '<defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1">' +
        '<stop class="fc-rs1" offset="0"/><stop class="fc-rs2" offset=".26"/><stop class="fc-rs3" offset=".52"/>' +
        '<stop class="fc-rs4" offset=".8"/><stop class="fc-rs5" offset="1"/></linearGradient></defs>' +
        '<polygon class="fc-rim-band"/><polygon class="fc-rim-line" stroke="url(#' + id + ')"/>';
      el.appendChild(svg);
    }
    var str = pts.map(function (p) { return p[0].toFixed(2) + ',' + p[1].toFixed(2); }).join(' ');
    svg.setAttribute('viewBox', '0 0 ' + el.offsetWidth + ' ' + el.offsetHeight);
    svg.querySelector('.fc-rim-band').setAttribute('points', str);
    svg.querySelector('.fc-rim-line').setAttribute('points', str);
  }

  function seat(root) {
    var s = root.querySelector('[data-fc-seat]');
    if (!s) { return; }
    var maxX = 2.5, maxY = 3.5;
    root.addEventListener('pointermove', function (e) {
      if (reduce.matches || noHover.matches || e.pointerType === 'touch') { return; }
      var r = root.getBoundingClientRect();
      var x = Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
      var y = Math.max(0, Math.min(1, (e.clientY - r.top) / r.height));
      root.style.setProperty('--fc-ry', ((x - .5) * 2 * maxY).toFixed(2) + 'deg');
      root.style.setProperty('--fc-rx', ((.5 - y) * 2 * maxX).toFixed(2) + 'deg');
      root.style.setProperty('--fc-mx', (x * 100).toFixed(1) + '%');
      root.style.setProperty('--fc-my', (y * 100).toFixed(1) + '%');
    });
    root.addEventListener('pointerleave', function () {
      root.style.setProperty('--fc-ry', '0deg');
      root.style.setProperty('--fc-rx', '0deg');
    });
  }

  function form(root) {
    var f = root.querySelector('form');
    if (!f) { return; }
    var input = f.querySelector('input[type="email"]');
    var consent = f.querySelector('[data-fc-consent]');
    var err = f.querySelector('[data-fc-err]');
    var done = f.querySelector('[data-fc-done]');
    var btn = f.querySelector('[data-fc-btn]');
    var label = btn.querySelector('[data-fc-btn-label]');
    function say(text) { err.textContent = text; err.hidden = !text; input.setAttribute('aria-invalid', text ? 'true' : 'false'); }
    function emailOk() { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.value.trim()); }
    input.addEventListener('blur', function () { if (input.value && !emailOk()) { say('That email looks incomplete.'); } });
    input.addEventListener('input', function () { if (!err.hidden && emailOk()) { say(''); } });
    consent.addEventListener('change', function () { if (consent.checked && emailOk()) { say(''); } });
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      if (btn.getAttribute('data-fc-state') === 'done') { return; }
      if (!emailOk()) { say('That email looks incomplete.'); input.focus(); return; }
      if (!consent.checked) { say('Tick the box so we can email your welcome.'); consent.focus(); return; }
      say('');
      btn.setAttribute('data-fc-state', 'done');
      label.textContent = 'YOU ARE IN';
      done.hidden = false;
    });
  }

  function init(root) {
    var rims = root.querySelectorAll('[data-fc-rim]');
    Array.prototype.forEach.call(rims, function (el) {
      drawRim(el);
      if (win.ResizeObserver) { new win.ResizeObserver(function () { drawRim(el); }).observe(el); }
    });
    seat(root);
    form(root);
    root.setAttribute('data-fc-ready', '1');
  }
  function boot() { Array.prototype.forEach.call(doc.querySelectorAll('[data-fc]'), init); }
  win.FCARD = { init: init, points: points };
  if (doc.readyState === 'loading') { doc.addEventListener('DOMContentLoaded', boot); } else { boot(); }
  if (doc.fonts && doc.fonts.ready) { doc.fonts.ready.then(function () { Array.prototype.forEach.call(doc.querySelectorAll('[data-fc-rim]'), drawRim); }); }
})(window, document);

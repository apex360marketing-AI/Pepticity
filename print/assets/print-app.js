/* PEPTICITY PRINT ROOM: the page. The fields, the gallery of 25, stars, crop marks, the big view, the three label slots
   and the turning P. Everything typed stays in memory in this tab: no storage of any kind, no network. */
(function () {
  'use strict';
  var P = window.PEPPRINT, E = P.engine, CARDS = P.cards, LABELS = P.labels;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function btn(cls, label, attrs) {
    var b = el('button', 'pp-btn ' + (cls || ''));
    b.type = 'button';
    var l = el('span', 'pp-btn-l');
    if (typeof label === 'string') { l.textContent = label; } else { l.appendChild(label); }
    b.appendChild(l);
    Object.keys(attrs || {}).forEach(function (k) { b.setAttribute(k, attrs[k]); });
    return b;
  }
  function frost(text) { return el('span', 'pp-num', text); }
  function DPR() { return Math.min(2, window.devicePixelRatio || 1); }
  var reduced = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ================= the fields (memory only) ================= */
  var KEYS = ['name', 'title', 'phone', 'email', 'web'];
  var F = {};
  function readFields() { KEYS.forEach(function (k) { F[k] = $('#f-' + k).value; }); }

  /* ================= the gallery ================= */
  var tiles = [], gen = 0, dirty = new Set(), near = new Set(), rafId = 0, starred = new Set(), filter = 'all';

  function sizeCanvas(cv) {
    var w = cv.getBoundingClientRect().width;
    if (!w) { return; }
    var bw = Math.max(64, Math.round(w * DPR())), bh = Math.round(bw * CARDS.H / CARDS.W);
    if (cv.width !== bw) { cv.width = bw; }
    if (cv.height !== bh) { cv.height = bh; }
  }
  function mirrorText(t, side, g) {
    var words = g.items.filter(function (it) { return it.kind === 'text' && it.text; }).map(function (it) { return it.text; });
    return (side === 'front' ? 'FRONT' : 'BACK') + ' OF CARD ' + t.d.code + ', ' + t.d.name + ': ' + t.d.say[side === 'front' ? 0 : 1] +
      (words.length ? '. IT READS ' + words.join(' · ') : '') + '.';
  }
  function drawTile(t) {
    ['front', 'back'].forEach(function (side) {
      var cv = t[side];
      sizeCanvas(cv);
      var g = CARDS.render(cv, t.i, side, F);
      cv.setAttribute('data-gen', String(gen));
      t.mirror[side].textContent = mirrorText(t, side, g);
    });
  }
  function schedule() { if (!rafId && E.isReady) { rafId = requestAnimationFrame(pump); } }
  function pump() {
    rafId = 0;
    var t0 = performance.now();
    var list = Array.from(dirty).sort(function (a, b) { return ((near.has(b) ? 1 : 0) - (near.has(a) ? 1 : 0)) || a.i - b.i; });
    for (var k = 0; k < list.length; k++) {
      drawTile(list[k]);
      dirty.delete(list[k]);
      if (performance.now() - t0 > 28) { break; }               // keep typing smooth: the rest in the next frame
    }
    if (dirty.size) { schedule(); } else { drawShows(); document.documentElement.setAttribute('data-cards-gen', String(gen)); }
    if (zoom) { zoom.show(zoom.side); }
  }
  // the two live cards in the intro
  function drawShows() {
    $$('.pp-show-cv').forEach(function (cv) {
      var i = +cv.getAttribute('data-card') - 1, side = cv.getAttribute('data-side');
      if (!CARDS.list[i]) { return; }
      sizeCanvas(cv);
      CARDS.render(cv, i, side, F);
    });
  }
  function markAll() {
    gen++;
    document.documentElement.removeAttribute('data-cards-gen');
    tiles.forEach(function (t) { dirty.add(t); });
    schedule();
  }

  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      var t = tiles[+e.target.getAttribute('data-i')];
      if (!t) { return; }
      if (e.isIntersecting) { near.add(t); if (dirty.has(t)) { schedule(); } } else { near.delete(t); }
    });
  }, { rootMargin: '600px 0px' }) : null;

  function buildGallery() {
    var ol = $('#pp-gallery');
    CARDS.list.forEach(function (d, i) {
      var li = el('li', 'pp-card');
      li.id = 'card-' + d.code;
      li.setAttribute('data-tone', d.tone);
      li.setAttribute('data-i', String(i));
      var t = { i: i, d: d, li: li, mirror: {} };

      var head = el('div', 'pp-card-head');
      var no = frost(d.code);
      no.classList.add('pp-card-no');
      no.setAttribute('aria-hidden', 'true');
      var ttl = el('div', 'pp-card-ttl');
      var h3 = el('h3', 'pp-card-name pp-chrome', d.name);
      var tag = el('p', 'pp-card-tag');
      tag.appendChild(el('span', 'pp-chrome-sm', (d.tone === 'light' ? 'LIGHT' : 'DARK') + ' · ' + d.stock));
      if (d.gold) { tag.appendChild(el('span', 'pp-chrome-sm', ' · ')); tag.appendChild(el('span', 'pp-gold-text', 'CHROME-GOLD ACCENT')); }
      ttl.appendChild(h3);
      ttl.appendChild(tag);
      var starWord = el('span', '', 'STAR');
      var starLabel = document.createDocumentFragment();
      var mark = el('span', 'pp-star-mark', '★ ');
      mark.setAttribute('aria-hidden', 'true');
      starLabel.appendChild(mark);
      starLabel.appendChild(starWord);
      var star = btn('pp-btn--sm pp-star', starLabel, { 'aria-pressed': 'false', 'aria-label': 'STAR CARD ' + d.code + ', ' + d.name });
      head.appendChild(no);
      head.appendChild(ttl);
      head.appendChild(star);

      var sides = el('div', 'pp-sides');
      ['front', 'back'].forEach(function (side) {
        var fig = el('figure', 'pp-side');
        var b = el('button', 'pp-side-btn');
        b.type = 'button';
        b.setAttribute('aria-label', 'SEE THE ' + side.toUpperCase() + ' OF CARD ' + d.code + ' BIG');
        var cv = el('canvas', 'pp-cv');
        cv.width = 640; cv.height = Math.round(640 * CARDS.H / CARDS.W);
        cv.setAttribute('data-side', side);
        cv.setAttribute('aria-hidden', 'true');
        b.appendChild(cv);
        b.addEventListener('click', function () { openZoom(t, side, b); });
        var mirror = el('p', 'pp-vh pp-mirror');
        mirror.setAttribute('data-side', side);
        fig.appendChild(b);
        fig.appendChild(el('figcaption', 'pp-cap pp-chrome-sm', side === 'front' ? 'FRONT' : 'BACK'));
        fig.appendChild(mirror);
        sides.appendChild(fig);
        t[side] = cv;
        t.mirror[side] = mirror;
      });

      var foot = el('div', 'pp-card-foot');
      var save = btn('pp-btn--primary pp-save', 'SAVE FOR PRINT', { 'aria-label': 'SAVE FOR PRINT: CARD ' + d.code + ', ' + d.name + ', FRONT AND BACK' });
      var status = el('p', 'pp-status');
      status.setAttribute('role', 'status');
      foot.appendChild(save);
      foot.appendChild(status);

      li.appendChild(head);
      li.appendChild(sides);
      li.appendChild(foot);
      ol.appendChild(li);

      t.star = star; t.starWord = starWord; t.save = save; t.status = status;
      star.addEventListener('click', function () { toggleStar(t); });
      save.addEventListener('click', function () { saveCard(t); });
      tiles.push(t);
      if (io) { io.observe(li); } else { near.add(t); }
    });
    var nl = 0, nd = 0;
    CARDS.list.forEach(function (d) { if (d.tone === 'light') { nl++; } else { nd++; } });
    $('[data-count="light"]').textContent = String(nl);
    $('[data-count="dark"]').textContent = String(nd);
    $('#pp-n-light').textContent = String(nl);
    $('#pp-n-dark').textContent = String(nd);
    $('[data-count="all"]').textContent = String(CARDS.list.length);
  }

  function applyFilter() {
    var shown = 0;
    tiles.forEach(function (t) {
      var ok = filter === 'all' || (filter === 'starred' ? starred.has(t.i) : t.d.tone === filter);
      t.li.hidden = !ok;
      if (ok) { shown++; }
    });
    $('#pp-empty').hidden = !(filter === 'starred' && shown === 0);
    $$('[data-filter]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-filter') === filter)); });
    markAll();
  }
  function toggleStar(t) {
    if (starred.has(t.i)) { starred.delete(t.i); } else { starred.add(t.i); }
    var on = starred.has(t.i);
    t.star.setAttribute('aria-pressed', String(on));
    t.starWord.textContent = on ? 'STARRED' : 'STAR';
    if (on) { t.li.setAttribute('data-starred', ''); } else { t.li.removeAttribute('data-starred'); }
    $('[data-count="starred"]').textContent = String(starred.size);
    if (filter === 'starred') { applyFilter(); }
  }

  /* ---------------- print files for a card ---------------- */
  function marksOn() { return $('#pp-marks').getAttribute('aria-pressed') === 'true'; }
  function cardFile(i, side, marks) {
    var cv = document.createElement('canvas');
    CARDS.render(cv, i, side, F, { dpi: E.DPI, marks: !!marks });
    return E.pngBlob(cv, E.DPI).then(function (blob) { return { blob: blob, w: cv.width, h: cv.height, side: side }; });
  }
  function problem(e) {
    var s = String(e && (e.name + ' ' + e.message));
    if (/secur|taint/i.test(s)) { return 'THE BROWSER BLOCKED THE FILE. OPEN THIS PAGE FROM ITS WEB ADDRESS (NOT AS A FILE ON YOUR COMPUTER) AND SAVE AGAIN.'; }
    return 'COULD NOT MAKE THE FILE: ' + String(e && e.message ? e.message : 'UNKNOWN PROBLEM').toUpperCase() + '.';
  }
  function saveCard(t) {
    if (!E.isReady) { return; }
    var marks = marksOn(), files = [];
    t.save.disabled = true;
    t.status.removeAttribute('data-bad');
    t.status.textContent = 'MAKING THE PRINT FILES…';
    cardFile(t.i, 'front', marks).then(function (a) {
      files.push(a);
      return cardFile(t.i, 'back', marks);
    }).then(function (b) {
      files.push(b);
      files.forEach(function (f, k) {
        setTimeout(function () { E.download(f.blob, 'pepticity-card-' + t.d.code + '-' + f.side + (marks ? '-crop-marks' : '') + '.png'); }, k * 450);
      });
      t.status.textContent = 'SAVED TO YOUR DOWNLOADS: FRONT AND BACK, ' + files[0].w + ' × ' + files[0].h + ' PX AT 300 DPI' + (marks ? ', WITH CROP MARKS' : '') + '. NOTHING WAS SENT.';
    }).catch(function (e) {
      t.status.setAttribute('data-bad', '');
      t.status.textContent = problem(e);
    }).then(function () { t.save.disabled = false; });
  }

  /* ---------------- the big view ---------------- */
  var zoom = null;
  function openZoom(t, side, opener) {
    closeZoom(false);
    var wrap = el('div', 'pp-zoom');
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.setAttribute('aria-label', 'CARD ' + t.d.code + ', ' + t.d.name + ', BIG VIEW');
    var inner = el('div', 'pp-zoom-in');
    var bar = el('div', 'pp-zoom-bar');
    var ttl = el('p', 'pp-zoom-ttl pp-chrome');
    var keys = el('div', 'pp-zoom-keys');
    var bF = btn('pp-btn--sm', 'FRONT', { 'aria-pressed': 'false' });
    var bB = btn('pp-btn--sm', 'BACK', { 'aria-pressed': 'false' });
    var bX = btn('pp-btn--sm', 'CLOSE THE BIG VIEW');
    keys.appendChild(bF); keys.appendChild(bB); keys.appendChild(bX);
    bar.appendChild(ttl); bar.appendChild(keys);
    var cv = el('canvas', 'pp-zoom-cv');
    cv.setAttribute('role', 'img');
    inner.appendChild(bar); inner.appendChild(cv);
    wrap.appendChild(inner);
    document.body.appendChild(wrap);
    zoom = {
      wrap: wrap, opener: opener, side: side,
      show: function (s) {
        zoom.side = s;
        ttl.textContent = t.d.code + ' · ' + t.d.name + ' · ' + (s === 'front' ? 'FRONT' : 'BACK');
        bF.setAttribute('aria-pressed', String(s === 'front'));
        bB.setAttribute('aria-pressed', String(s === 'back'));
        var w = cv.getBoundingClientRect().width || 900;
        cv.width = Math.round(w * DPR());
        cv.height = Math.round(cv.width * CARDS.H / CARDS.W);
        var g = CARDS.render(cv, t.i, s, F);
        cv.setAttribute('aria-label', mirrorText(t, s, g));
      }
    };
    bF.addEventListener('click', function () { zoom.show('front'); });
    bB.addEventListener('click', function () { zoom.show('back'); });
    bX.addEventListener('click', function () { closeZoom(true); });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) { closeZoom(true); } });
    wrap.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); closeZoom(true); return; }
      if (e.key === 'Tab') {
        var f = [bF, bB, bX], k = f.indexOf(document.activeElement);
        e.preventDefault();
        f[(k + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
      }
    });
    zoom.show(side);
    bX.focus();
  }
  function closeZoom(refocus) {
    if (!zoom) { return; }
    var z = zoom;
    zoom = null;
    z.wrap.remove();
    if (refocus && z.opener && z.opener.focus) { z.opener.focus(); }
  }

  /* ================= the label maker ================= */
  var FLAGGED = ['tirzepatide', 'tesamorelin', 'oxytocin', 'retatrutide', 'pt-141', 'thymosin-alpha-1', 'semax', 'selank', 'igf-1-lr3', 'blend-contents-tbc'];
  var SIZES = {};                      // size id -> { name, size, sku, flagged }
  var slots = [];
  var START = [
    { w: 2, h: 1, unit: 'in', id: 'bpc-157-10mg' },
    { w: 30, h: 60, unit: 'mm', id: 'ghk-cu-50mg' },
    { w: 4, h: 1.5, unit: 'in', id: 'nad-1000mg' }
  ];
  var LIMIT = { min: 0.25, max: 12 };   // inches

  function loadCatalogue() {
    var inline = null;
    try { inline = JSON.parse($('#pp-catalogue').textContent); } catch (e) { inline = null; }
    var pick = function (c) { return c && Array.isArray(c.products) ? c : inline; };
    if (!window.fetch) { return Promise.resolve(inline); }
    return fetch('assets/catalogue.json', { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) { throw new Error('catalogue ' + r.status); }
      return r.json();
    }).then(pick, function () { return inline; });
  }
  function fmt(v, unit) {
    var d = unit === 'mm' ? 1 : 3;
    return String(Math.round(v * Math.pow(10, d)) / Math.pow(10, d));
  }
  function product(s) {
    var p = SIZES[s.id];
    return p ? { name: p.name, size: p.size } : { name: '', size: '' };
  }

  function numField(label, unit) {
    var lab = el('label', 'pp-field');
    var l = el('span', 'pp-field-l pp-chrome-sm');
    l.appendChild(document.createTextNode(label + ' · '));
    var u = el('span', '', unit.toUpperCase());
    u.setAttribute('data-unit-label', '');
    l.appendChild(u);
    var box = el('span', 'pp-box');
    var inp = el('input', 'pp-input');
    inp.type = 'number';
    inp.inputMode = 'decimal';
    inp.step = 'any';
    inp.autocomplete = 'off';
    box.appendChild(inp);
    lab.appendChild(l);
    lab.appendChild(box);
    return { label: lab, input: inp, unit: u };
  }
  function readRow(dl, name) {
    var dt = el('dt', 'pp-chrome-sm', name), dd = el('dd');
    dl.appendChild(dt);
    dl.appendChild(dd);
    return dd;
  }
  function setParts(dd, parts) {
    dd.textContent = '';
    parts.forEach(function (p) { dd.appendChild(typeof p === 'string' ? document.createTextNode(p) : p); });
  }

  function buildSlot(n, cat, start) {
    var s = { n: n, unit: start.unit, w: start.w, h: start.h, id: start.id, tone: 'dark', bleed: false };
    var art = el('article', 'pp-slot');
    art.id = 'label-' + n;
    art.setAttribute('data-slot', String(n));
    var h = el('h3', 'pp-h3d pp-slot-h');
    h.setAttribute('data-text', 'LABEL ' + n);
    h.appendChild(el('span', 'pp-face', 'LABEL ' + n));

    var size = el('div', 'pp-size');
    var fw = numField('WIDTH', s.unit), fh = numField('HEIGHT', s.unit);
    fw.input.id = 'l' + n + '-w';
    fh.input.id = 'l' + n + '-h';
    fw.input.value = fmt(s.w, s.unit);
    fh.input.value = fmt(s.h, s.unit);
    size.appendChild(fw.label);
    var x = el('span', 'pp-x', '×');
    x.setAttribute('aria-hidden', 'true');
    size.appendChild(x);
    size.appendChild(fh.label);

    var units = el('div', 'pp-row');
    units.setAttribute('role', 'group');
    units.setAttribute('aria-label', 'UNITS FOR LABEL ' + n);
    var uIn = btn('pp-btn--sm', 'INCHES', { 'aria-pressed': String(s.unit === 'in'), 'data-unit': 'in' });
    var uMm = btn('pp-btn--sm', 'MILLIMETRES', { 'aria-pressed': String(s.unit === 'mm'), 'data-unit': 'mm' });
    units.appendChild(uIn);
    units.appendChild(uMm);

    var pf = el('label', 'pp-field');
    pf.appendChild(el('span', 'pp-field-l pp-chrome-sm', 'PRODUCT'));
    var pbox = el('span', 'pp-box pp-box--select');
    var sel = el('select', 'pp-input');
    sel.id = 'l' + n + '-p';
    cat.products.forEach(function (p) {
      var og = el('optgroup');
      og.label = String(p.name).toUpperCase();
      var flagged = FLAGGED.indexOf(p.sku) !== -1;
      if (!p.sizes || !p.sizes.length) {
        var o0 = el('option', '', String(p.name).toUpperCase() + ' · COMING SOON, NO SIZE YET');
        o0.disabled = true;
        og.appendChild(o0);
      }
      (p.sizes || []).forEach(function (z) {
        SIZES[z.id] = { name: p.name, size: z.label, sku: p.sku, flagged: flagged };
        var o = el('option', '', String(p.name).toUpperCase() + ' · ' + String(z.label).toUpperCase() + (flagged ? ' · HIDE BEFORE LAUNCH' : ''));
        o.value = z.id;
        og.appendChild(o);
      });
      sel.appendChild(og);
    });
    if (!SIZES[s.id]) { s.id = sel.querySelector('option:not([disabled])') ? sel.querySelector('option:not([disabled])').value : ''; }
    sel.value = s.id;
    pbox.appendChild(sel);
    pf.appendChild(pbox);

    var opts = el('div', 'pp-row');
    var stock = el('div', 'pp-row');
    stock.setAttribute('role', 'group');
    stock.setAttribute('aria-label', 'LABEL STOCK FOR LABEL ' + n);
    var sDark = btn('pp-btn--sm', 'BLACK STOCK', { 'aria-pressed': 'true' });
    var sLight = btn('pp-btn--sm', 'PEARL STOCK', { 'aria-pressed': 'false' });
    stock.appendChild(sDark);
    stock.appendChild(sLight);
    var bleedWord = el('span', '', 'OFF');
    var bl = document.createDocumentFragment();
    bl.appendChild(document.createTextNode('BLEED 1/16 IN: '));
    bl.appendChild(bleedWord);
    var bleed = btn('pp-btn--sm', bl, { 'aria-pressed': 'false' });
    opts.appendChild(stock);
    opts.appendChild(bleed);

    var stage = el('div', 'pp-stage');
    var cv = el('canvas', 'pp-lcv');
    cv.setAttribute('role', 'img');
    stage.appendChild(cv);

    var dl = el('dl', 'pp-readout');
    var rSize = readRow(dl, 'SIZE'), rFile = readRow(dl, 'PRINT FILE'), rLay = readRow(dl, 'LAYOUT'), rSmall = readRow(dl, 'SMALLEST TEXT');
    var msg = el('p', 'pp-status pp-msg');
    msg.setAttribute('role', 'status');
    var flag = el('p', 'pp-flag', 'HIDE BEFORE LAUNCH: THIS PRODUCT IS WAITING FOR COUNSEL. CHECK WITH COUNSEL BEFORE ORDERING ITS LABELS. THIS NOTE IS NOT PRINTED.');
    flag.hidden = true;

    var foot = el('div', 'pp-card-foot');
    var save = btn('pp-btn--primary pp-save', 'SAVE FOR PRINT', { 'aria-label': 'SAVE FOR PRINT: LABEL ' + n });
    var status = el('p', 'pp-status');
    status.setAttribute('role', 'status');
    foot.appendChild(save);
    foot.appendChild(status);
    var note = el('p', 'pp-note');
    note.appendChild(el('span', 'pp-tagline pp-chrome-sm', 'PREVIEW ONLY'));
    note.appendChild(document.createTextNode('The file is made in your browser and saved to your downloads. Nothing is sent.'));

    [h, stage, size, units, msg, pf, flag, opts, dl, foot, note].forEach(function (c) { art.appendChild(c); });

    s.el = art; s.cv = cv; s.stage = stage; s.fw = fw; s.fh = fh; s.sel = sel; s.uIn = uIn; s.uMm = uMm;
    s.sDark = sDark; s.sLight = sLight; s.bleedBtn = bleed; s.bleedWord = bleedWord;
    s.rSize = rSize; s.rFile = rFile; s.rLay = rLay; s.rSmall = rSmall; s.msg = msg; s.flag = flag; s.save = save; s.status = status;

    function onSize() { readSize(s); drawSlot(s); }
    fw.input.addEventListener('input', onSize);
    fh.input.addEventListener('input', onSize);
    sel.addEventListener('change', function () { s.id = sel.value; drawSlot(s); });
    uIn.addEventListener('click', function () { setUnit(s, 'in'); });
    uMm.addEventListener('click', function () { setUnit(s, 'mm'); });
    sDark.addEventListener('click', function () { setTone(s, 'dark'); });
    sLight.addEventListener('click', function () { setTone(s, 'light'); });
    bleed.addEventListener('click', function () {
      s.bleed = !s.bleed;
      bleed.setAttribute('aria-pressed', String(s.bleed));
      bleedWord.textContent = s.bleed ? 'ON' : 'OFF';
      drawSlot(s);
    });
    save.addEventListener('click', function () { saveLabel(s); });
    readSize(s);
    return s;
  }

  // the typed size, in inches, kept within what can be printed; a note says so when it had to be held in
  function readSize(s) {
    var k = s.unit === 'mm' ? 1 / 25.4 : 1;
    var w = parseFloat(s.fw.input.value), h = parseFloat(s.fh.input.value), note = '';
    if (!(w > 0) || !(h > 0)) {
      note = 'TYPE A WIDTH AND A HEIGHT ABOVE ZERO. SHOWING THE LAST SIZE THAT WORKED.';
      if (!s.wIn) { s.wIn = 2; s.hIn = 1; }
    } else {
      var wi = w * k, hi = h * k;
      var cw = Math.max(LIMIT.min, Math.min(LIMIT.max, wi)), ch = Math.max(LIMIT.min, Math.min(LIMIT.max, hi));
      if (cw !== wi || ch !== hi) { note = 'LABELS RUN FROM 0.25 TO 12 IN (6.4 TO 304.8 MM). SHOWING THE NEAREST SIZE.'; }
      s.wIn = cw; s.hIn = ch;
      s.w = w; s.h = h;
    }
    s.msg.textContent = note;
  }
  function setUnit(s, unit) {
    if (unit === s.unit) { return; }
    var w = parseFloat(s.fw.input.value), h = parseFloat(s.fh.input.value);
    var k = unit === 'mm' ? 25.4 : 1 / 25.4;
    if (w > 0) { s.fw.input.value = fmt(w * k, unit); }
    if (h > 0) { s.fh.input.value = fmt(h * k, unit); }
    s.unit = unit;
    s.uIn.setAttribute('aria-pressed', String(unit === 'in'));
    s.uMm.setAttribute('aria-pressed', String(unit === 'mm'));
    s.fw.unit.textContent = s.fh.unit.textContent = unit.toUpperCase();
    readSize(s);
    drawSlot(s);
  }
  function setTone(s, tone) {
    s.tone = tone;
    s.sDark.setAttribute('aria-pressed', String(tone === 'dark'));
    s.sLight.setAttribute('aria-pressed', String(tone === 'light'));
    drawSlot(s);
  }
  function filePx(s) {
    var bp = s.bleed ? Math.round(LABELS.BLEED * E.DPI) : 0;
    return { w: Math.round(s.wIn * E.DPI) + 2 * bp, h: Math.round(s.hIn * E.DPI) + 2 * bp };
  }
  function drawSlot(s) {
    if (!E.isReady) { return; }
    var st = s.stage, cs = getComputedStyle(st);
    var sw = st.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    var sh = st.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
    var r = s.wIn / s.hIn, cw = Math.max(8, Math.min(sw, sh * r)), chh = cw / r;
    s.cv.style.width = cw + 'px';
    s.cv.style.height = chh + 'px';
    var bw = Math.max(8, Math.round(cw * DPR())), bh = Math.max(8, Math.round(chh * DPR()));
    s.cv.width = bw;
    s.cv.height = bh;
    var pr = product(s);
    var lay = LABELS.draw(s.cv, s.wIn, s.hIn, pr, { scale: bw / s.wIn, full: [0, 0, bw, bh], tone: s.tone });
    s.layout = lay;
    var mm = function (v) { return fmt(v * 25.4, 'mm'); }, inch = function (v) { return fmt(v, 'in'); };
    setParts(s.rSize, [frost(inch(s.wIn) + ' × ' + inch(s.hIn)), ' IN · ', frost(mm(s.wIn) + ' × ' + mm(s.hIn)), ' MM']);
    var fp = filePx(s);
    setParts(s.rFile, [frost(fp.w + ' × ' + fp.h), ' PX AT 300 DPI' + (s.bleed ? ', 1/16 IN BLEED INCLUDED' : '')]);
    setParts(s.rLay, [lay.mode === 'tall' ? 'TALL: PEPTICITY RUNS UP THE SIDE, LIKE THE VIAL' : lay.mode === 'wide' ? 'WIDE: LAID OUT SIDEWAYS FOR A WRAP-AROUND' : 'NEAR SQUARE: STACKED']);
    var sp = Math.round(lay.smallestPt * 10) / 10;
    setParts(s.rSmall, [frost(sp.toFixed(1)), ' PT' + (sp < 5 ? ' · SMALL: CHECK IT READS AT THIS SIZE' : '')]);
    if (sp < 5) { s.rSmall.classList.add('pp-warn'); } else { s.rSmall.classList.remove('pp-warn'); }
    var flagged = SIZES[s.id] && SIZES[s.id].flagged;
    s.flag.hidden = !flagged;
    s.cv.setAttribute('aria-label', 'LABEL ' + s.n + ' PREVIEW, ' + inch(s.wIn) + ' BY ' + inch(s.hIn) + ' IN, ' + lay.mode.toUpperCase() + ': THE P, PEPTICITY, ' +
      E.clean(pr.name) + ', ' + E.clean(pr.size) + ', LOT AND EXP BLANKS, ' + LABELS.COUNSEL);
    s.el.setAttribute('data-mode', lay.mode);
  }
  function labelFile(s) {
    var ex = LABELS.exportCanvas(s.wIn, s.hIn, product(s), { bleed: s.bleed, tone: s.tone });
    return E.pngBlob(ex.canvas, E.DPI).then(function (blob) { return { blob: blob, w: ex.canvas.width, h: ex.canvas.height }; });
  }
  function saveLabel(s) {
    if (!E.isReady) { return; }
    s.save.disabled = true;
    s.status.removeAttribute('data-bad');
    s.status.textContent = 'MAKING THE PRINT FILE…';
    labelFile(s).then(function (f) {
      var name = 'pepticity-label-' + s.n + '-' + fmt(s.w, s.unit) + 'x' + fmt(s.h, s.unit) + s.unit + (s.bleed ? '-bleed' : '') + '.png';
      E.download(f.blob, name);
      s.status.textContent = 'SAVED TO YOUR DOWNLOADS: ' + f.w + ' × ' + f.h + ' PX AT 300 DPI. NOTHING WAS SENT.';
    }).catch(function (e) {
      s.status.setAttribute('data-bad', '');
      s.status.textContent = problem(e);
    }).then(function () { s.save.disabled = false; });
  }

  /* ================= the turning P (the real render, frame by frame) ================= */
  function spinLogo() {
    var logo = $('.pp-logo');
    if (!logo) { return; }
    var cols = 6, rows = 5, frames = 30, hold = 5000, turn = 3000, k = 0;
    function show(f) { logo.style.backgroundPosition = ((f % cols) * 100 / (cols - 1)) + '% ' + (Math.floor(f / cols) * 100 / (rows - 1)) + '%'; }
    show(0);
    if (reduced) { return; }
    function next() {
      if (document.hidden) { setTimeout(next, 800); return; }
      k++;
      if (k >= frames) { k = 0; show(0); setTimeout(next, hold); return; }
      show(k);
      setTimeout(next, turn / frames);
    }
    setTimeout(next, hold);
  }

  /* ================= start ================= */
  readFields();
  buildGallery();
  spinLogo();
  KEYS.forEach(function (k) {
    $('#f-' + k).addEventListener('input', function () { readFields(); markAll(); });
  });
  $('#pp-fields').addEventListener('submit', function (e) { e.preventDefault(); });
  $$('[data-filter]').forEach(function (b) { b.addEventListener('click', function () { filter = b.getAttribute('data-filter'); applyFilter(); }); });
  $('#pp-marks').addEventListener('click', function () {
    var on = !marksOn();
    this.setAttribute('aria-pressed', String(on));
    $('[data-state]', this).textContent = on ? 'ON' : 'OFF';
  });
  var resizeTimer = 0, lastW = window.innerWidth;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (window.innerWidth === lastW && slots.length) { slots.forEach(drawSlot); return; }
      lastW = window.innerWidth;
      markAll();
      slots.forEach(drawSlot);
    }, 160);
  });

  E.ready.then(function () {
    markAll();
    return loadCatalogue();
  }).then(function (cat) {
    var box = $('#pp-slots');
    if (!cat || !Array.isArray(cat.products)) { box.appendChild(el('p', 'pp-note', 'THE PRODUCT LIST COULD NOT BE READ.')); return; }
    START.forEach(function (st, k) { var s = buildSlot(k + 1, cat, st); slots.push(s); box.appendChild(s.el); });
    slots.forEach(drawSlot);
    document.documentElement.setAttribute('data-labels-ready', '');
  }).catch(function (e) {
    var p = el('p', 'pp-note', 'THE PRINT ROOM COULD NOT START: ' + String(e && e.message ? e.message : e).toUpperCase());
    $('#cards').appendChild(p);
    if (window.console) { console.error(e); }
  });

  // for the proof scripts: the same functions the buttons use
  P.app = {
    F: F, tiles: tiles, slots: slots, gen: function () { return gen; },
    cardFile: cardFile, labelFile: labelFile, drawSlot: drawSlot, readSize: readSize, sizes: SIZES
  };
})();

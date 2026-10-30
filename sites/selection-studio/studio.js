/* =====================================================================
   SELECTION STUDIO · shell (PEPTICITY first; the APEX template for every client)
   Reads config.json + the module manifests, builds the chapters, runs the live tiles (lazy iframes,
   at most N playing), keeps LOVE / MAYBE / NO + one FINAL PICK per chapter in localStorage, composes
   YOUR PEPTICITY, embeds the review questions, and sends the brand sheet to FormSubmit.
   Module contract (other agents build these): modules/<cat>/<CODE>.html, ?acc=<slug>, postMessage
   {acc,hex,rgb,name} to re-tint and {cmd:'play'|'pause'} to run. Manifest entry:
   {code, cat, name, desc, file, interact: scroll|hover|drag|tap, source}.
   ===================================================================== */
(function () {
'use strict';
var D = document, HTML = D.documentElement;
var RM = matchMedia('(prefers-reduced-motion: reduce)').matches;
var PHONE = matchMedia('(max-width: 899px)');
var FINE = matchMedia('(hover: hover) and (pointer: fine)');
var OWNER = HTML.classList.contains('owner');
var NOGL = /[?&]nogl\b/.test(location.search);
function $(s, r) { return (r || D).querySelector(s); }
function $$(s, r) { return Array.prototype.slice.call((r || D).querySelectorAll(s)); }
function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function pad(n) { return (n < 10 ? '0' : '') + n; }
function hexRgb(h) { h = String(h).replace('#', ''); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function ico(id, cls) { return '<svg class="' + (cls || '') + '" aria-hidden="true"><use href="#' + id + '"/></svg>'; }
var NUM = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty'];
function numWord(n) { return NUM[n] || String(n); }
function plural(n, w) { return n + ' ' + w + (n === 1 ? '' : 'S'); }
function cap1(s) { s = String(s || ''); return s.charAt(0) + s.slice(1).toLowerCase(); }
function ease(v) { return 1 - Math.pow(1 - Math.min(1, Math.max(0, v)), 3); }
function damp(c, t, l, dt) { return c + (t - c) * (1 - Math.exp(-l * dt)); }
var EASE_OUT = 'cubic-bezier(.16,1,.3,1)', EASE_IN = 'cubic-bezier(.7,0,.84,0)', EASE_IO = 'cubic-bezier(.65,0,.35,1)';

var C, GL = null, CHS = [], CH = {}, OPTS = {}, BY = {}, SETS = {}, SETBASE = '', S;
var V = { love: 'LOVE', maybe: 'MAYBE', no: 'NO' };
var HINT = {
  scroll: { i: 'i-scroll', t: 'SCROLL INSIDE' }, hover: { i: 'i-hover', t: 'MOVE OVER IT' },
  drag: { i: 'i-drag', t: 'DRAG IT' }, tap: { i: 'i-tap', t: 'TAP IT' }, look: { i: 'i-look', t: 'WATCH IT' }
};

/* ---------------------------------------------------------------- loading */
function getJSON(u) {
  return fetch(u, { cache: 'no-cache' }).then(function (r) { if (!r.ok) throw new Error(u + ' ' + r.status); return r.json(); });
}
function exists(u) {
  var ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 5000);
  return fetch(u, { method: 'HEAD', cache: 'no-cache', signal: ctl ? ctl.signal : undefined })
    .then(function (r) { clearTimeout(to); return r.ok; }, function () { clearTimeout(to); return false; });
}
function firstExisting(list, probe) {
  list = [].concat(list || []);
  var i = 0;
  return new Promise(function (res) {
    (function next() {
      if (i >= list.length) return res(list[0] || null);
      var b = list[i++];
      exists(probe ? b + probe : b).then(function (ok) { ok ? res(b) : next(); });
    })();
  });
}
function entriesOf(j) {
  if (Array.isArray(j)) return j;
  if (!j || typeof j !== 'object') return [];
  var k = ['modules', 'items', 'entries', 'options'].filter(function (x) { return Array.isArray(j[x]); })[0];
  if (k) return j[k];
  var out = [];                                  // {effects:[...], entrances:[...]}
  Object.keys(j).forEach(function (cat) { if (Array.isArray(j[cat])) j[cat].forEach(function (e) { out.push(Object.assign({ cat: cat }, e)); }); });
  return out;
}
function loadManifests() {
  return Promise.all((C.manifests || []).map(function (path) {
    var base = path.replace(/[^/]*$/, '');
    return getJSON(path).then(function (j) {
      return entriesOf(j).filter(function (e) { return e && e.code && e.file; }).map(function (e) {
        var f = String(e.file);
        if (!/^(https?:)?\/\//.test(f) && f.indexOf(base) !== 0 && f.charAt(0) !== '/') f = base + f.replace(/^\.\//, '');
        var cat = String(e.cat || e.category || (f.match(/modules\/([^/]+)\//) || [])[1] || '').toLowerCase();
        return { code: String(e.code).toUpperCase(), cat: cat, name: String(e.name || e.code).toUpperCase(), desc: e.desc || e.description || '',
          file: f, interact: String(e.interact || 'look').toLowerCase(), source: e.source || '', manifest: path, ar: e.ar || e.aspect || null,
          poster: e.poster || e.thumb ? (/^(https?:)?\/\//.test(e.poster || e.thumb) ? (e.poster || e.thumb) : base + String(e.poster || e.thumb).replace(/^\.\//, '')) : '' };
      });
    }).catch(function () { return []; });
  })).then(function (lists) {
    var all = [].concat.apply([], lists);
    return Promise.all(all.map(function (e) { return exists(e.file).then(function (ok) { e.ok = ok; return e; }); }));
  });
}
function loadSets() {
  if (!C.sets || !C.sets.src) return Promise.resolve([]);
  return getJSON(C.sets.src).then(function (sets) {
    var probe = sets[0] && sets[0].items[0] ? sets[0].items[0].thumb : '';
    return firstExisting(C.sets.base, probe).then(function (b) { SETBASE = b || ''; return sets; });
  }).catch(function () { return []; });
}

/* ---------------------------------------------------------------- state */
function freshState() {
  return { v: 1, p: {}, crowns: {}, acc: C.defaultAccent, accRgb: '', ch: 'start', last: null, scroll: {}, seen: {},
    email: C.client.email || '', extra: '', done: null, imported: false, reviewText: '', started: null, updated: null };
}
function loadState() {
  var s = freshState();
  try {
    var sv = JSON.parse(localStorage.getItem(C.storageKey) || 'null');
    if (sv && typeof sv === 'object' && sv.v === 1) Object.keys(s).forEach(function (k) { if (sv[k] !== undefined && sv[k] !== null) s[k] = sv[k]; });
  } catch (e) {}
  var q = ''; try { q = (new URLSearchParams(location.search).get('email') || '').trim(); } catch (e) {}
  if (q) s.email = q;
  return s;
}
var saveT = 0;
function save(now) {
  S.updated = new Date().toISOString();
  clearTimeout(saveT);
  var w = function () { try { localStorage.setItem(C.storageKey, JSON.stringify(S)); } catch (e) {} };
  if (now) w(); else saveT = setTimeout(w, 150);
}
function P(code) { return S.p[code] || (S.p[code] = { v: '', n: '' }); }
function hasProgress() { return Object.keys(S.p).some(function (k) { return S.p[k].v || S.p[k].n; }) || Object.keys(S.crowns).length > 0; }
function importOldPicks() {
  if (S.imported) return 0;
  S.imported = true; var n = 0;
  try {
    var old = JSON.parse(localStorage.getItem(C.importPicksKey) || 'null');
    if (old && old.p) Object.keys(old.p).forEach(function (k) {
      var m = k.split(':'), ch = CHS.filter(function (c) { return c.kind === 'set' && c.set === m[0]; })[0];
      if (!ch) return; var code = ch.code + '-' + m[1];
      if (!OPTS[code] || (S.p[code] && S.p[code].v)) return;
      if (V[old.p[k]]) { P(code).v = old.p[k]; n++; }
      if (old.n && old.n[k]) P(code).n = String(old.n[k]).slice(0, 200);
    });
  } catch (e) {}
  save(true); return n;
}

/* ---------------------------------------------------------------- options */
function pickable(o) { return o && (o.kind === 'module' || o.kind === 'image' || o.kind === 'accent'); }
function crownable(c) { return c.kind === 'accents' || c.kind === 'modules' || c.kind === 'set'; }
function liveOpts(c) { return (BY[c.id] || []).filter(pickable); }
function crowned(c) { var code = S.crowns[c.id]; return code && OPTS[code] && OPTS[code].ch === c.id ? OPTS[code] : null; }
function buildOptions(mods, sets) {
  sets.forEach(function (s) { SETS[s.id] = s; });
  CHS.forEach(function (c) {
    var list = [];
    if (c.kind === 'accents') {
      list = C.accents.map(function (a, k) {
        return { code: (c.code || 'COL') + '-' + pad(k + 1), ch: c.id, kind: 'accent', name: a.name, desc: a.note || '', hex: a.hex, rgb: hexRgb(a.hex).join(' '), slug: a.slug };
      });
    } else if (c.kind === 'modules') {
      var cats = (c.cats || []).map(function (x) { return String(x).toLowerCase(); });
      var mine = mods.filter(function (e) { return cats.indexOf(e.cat) > -1; });
      mine.sort(function (a, b) { return a.code.localeCompare(b.code, 'en', { numeric: true }); });
      var seen = {};
      list = mine.filter(function (e) { if (seen[e.code]) return false; seen[e.code] = 1; return true; }).map(function (e) {
        return Object.assign({}, e, { ch: c.id, kind: e.ok ? 'module' : 'soon' });
      });
      if (!list.length) for (var k = 0; k < (c.expect || 6); k++) list.push({ code: '', ch: c.id, kind: 'soon', name: '', desc: '', k: k });
    } else if (c.kind === 'set' && SETS[c.set]) {
      var st = SETS[c.set];
      list = st.items.map(function (it) {
        return { code: c.code + '-' + it.n, ch: c.id, kind: 'image', name: String(it.name).toUpperCase(), desc: it.desc || '', tag: it.tag || '', current: !!it.current,
          src: SETBASE + it.src, thumb: SETBASE + (it.thumb || it.src), w: it.w, h: it.h, wide: !!it.wide, ratio: st.ratio, orient: st.orient };
      });
    }
    BY[c.id] = list;
    list.forEach(function (o) { if (o.code) OPTS[o.code] = o; });
  });
  Object.keys(S.crowns).forEach(function (ch) { if (!OPTS[S.crowns[ch]]) delete S.crowns[ch]; });
}

/* ---------------------------------------------------------------- accent (her colour, everywhere) */
function accent(slug) { return C.accents.filter(function (a) { return a.slug === slug; })[0] || C.accents.filter(function (a) { return a.slug === C.defaultAccent; })[0] || C.accents[0]; }
function accMsg() { var a = accent(S.acc); return { acc: a.slug, hex: a.hex, rgb: hexRgb(a.hex).join(','), name: a.name }; }
function post(frame, msg) { try { frame && frame.contentWindow && frame.contentWindow.postMessage(msg, '*'); } catch (e) {} }
function allFrames() {
  var f = LV.tiles.map(function (t) { return t.__frame; }).filter(Boolean);
  if (ST.frame) f.push(ST.frame);
  $$('#boardBody iframe').forEach(function (x) { f.push(x); });
  return f;
}
function buildAccentPicker() {
  $('#accSw').innerHTML = C.accents.map(function (a) {
    return '<button class="sw" type="button" role="radio" aria-checked="false" data-acc="' + esc(a.slug) + '" aria-label="' + esc(a.name) + '" style="--sw:' + esc(a.hex) + '"><i></i><span class="tip" aria-hidden="true">' + esc(a.name) + '</span></button>';
  }).join('');
}
function setAccent(slug, quiet) {
  var a = accent(slug);
  S.acc = a.slug; S.accRgb = hexRgb(a.hex).join(' ');
  HTML.style.setProperty('--acc', S.accRgb); HTML.setAttribute('data-tint', a.slug);
  $('#accName').textContent = a.name;
  $$('#accSw .sw').forEach(function (b) { b.setAttribute('aria-checked', b.dataset.acc === a.slug); });
  try { if (C.accentStorageKey) localStorage.setItem(C.accentStorageKey, a.slug); } catch (e) {}
  var m = accMsg(); allFrames().forEach(function (f) { post(f, m); });
  if (REV.frame) try { REV.frame.contentDocument.documentElement.style.setProperty('--acc', S.accRgb); } catch (e) {}
  $$('.tl--acc').forEach(function (t) { t.classList.toggle('is-using', OPTS[t.dataset.code] && OPTS[t.dataset.code].slug === a.slug); });
  save();
  if (!quiet) toast('<b>' + esc(a.name) + '</b> is on. Every live design in the studio now shows in it.');
  if (BOARD.open) renderBoard();
}

/* ---------------------------------------------------------------- rail + progress */
function chapterStatus(c) {
  if (c.kind === 'start') return 'HOW IT WORKS';
  if (c.kind === 'review') { var r = reviewInfo(); return r.done ? 'SENT' : r.answered + ' OF ' + r.total + ' ANSWERED'; }
  if (c.kind === 'finish') return S.done ? 'SENT' : 'BRAND SHEET + SEND';
  var live = liveOpts(c), cr = crowned(c);
  if (!live.length) return 'LOADING SOON';
  if (cr) return 'FINAL: ' + cr.code;
  var lv = live.filter(function (o) { return P(o.code).v === 'love'; }).length;
  return (lv ? lv + ' LOVED · ' : '') + plural(live.length, 'OPTION');
}
function buildRail() {
  var html = '', g = null;
  CHS.forEach(function (c) {
    if (c.group && c.group !== g) { g = c.group; html += '<li class="rail__g" aria-hidden="true">' + esc(g) + '</li>'; }
    html += '<li><a class="ri" href="#' + c.id + '" data-ch="' + c.id + '"><span class="ri__n">' + pad(c.i) + '</span>' +
      '<span class="ri__m" style="min-width:0"><span class="ri__t">' + esc(c.title) + '</span><span class="ri__s" data-rs></span></span>' +
      (crownable(c) ? ico('i-crown', 'crw') : '<span></span>') + '</a></li>';
  });
  $('#railList').innerHTML = html;
  var crownN = CHS.filter(crownable).length;
  $('#progSegs').innerHTML = CHS.filter(crownable).map(function (c) { return '<i data-seg="' + c.id + '" title="' + esc(c.title) + '"></i>'; }).join('');
  $('#progT').innerHTML = '<b>0</b> OF ' + crownN + ' <span class="w">FINAL PICKS</span>';
}
function paintRail() {
  $$('#railList .ri').forEach(function (a) {
    var c = CH[a.dataset.ch], on = cur && cur.id === c.id;
    if (on) a.setAttribute('aria-current', 'step'); else a.removeAttribute('aria-current');
    a.classList.toggle('crowned', !!(crownable(c) && crowned(c)));
    a.classList.toggle('soon', crownable(c) && !liveOpts(c).length);
    var s = $('[data-rs]', a), t = chapterStatus(c); if (s.textContent !== t) s.textContent = t;
  });
  moveRailThumb();
  var cc = CHS.filter(crownable), n = cc.filter(function (c) { return crowned(c); }).length;
  $('#progT').innerHTML = '<b>' + n + '</b> OF ' + cc.length + ' <span class="w">FINAL PICKS</span>';
  $$('#progSegs i').forEach(function (i) { var c = CH[i.dataset.seg]; i.classList.toggle('on', !!crowned(c)); i.classList.toggle('seen', !!S.seen[c.id]); i.classList.toggle('here', !!(cur && cur.id === c.id)); });
  var bc = $('#boardCnt'); bc.textContent = n; $('#boardBtn').classList.toggle('has', n > 0);
  $$('.dk[data-go]').forEach(function (b) { var c = CH[b.dataset.go]; if (!c) return; b.classList.toggle('crowned', !!(crownable(c) && crowned(c))); var s = $('.dk__s', b); if (s) s.textContent = chapterStatus(c); });
}
function moveRailThumb() {
  var a = cur && $('#railList .ri[data-ch="' + cur.id + '"]'), th = $('#railThumb');
  if (!a || PHONE.matches) {
    if (a && PHONE.matches) { var inr = $('#railIn'); var x = a.offsetLeft - (inr.clientWidth - a.offsetWidth) / 2; inr.scrollTo({ left: x, behavior: RM ? 'auto' : 'smooth' }); }
    return;
  }
  th.style.setProperty('--ty', a.offsetTop + 'px'); th.style.height = a.offsetHeight + 'px';
  var inr2 = $('#railIn'); if (a.offsetTop < inr2.scrollTop || a.offsetTop + a.offsetHeight > inr2.scrollTop + inr2.clientHeight) inr2.scrollTo({ top: a.offsetTop - 40, behavior: RM ? 'auto' : 'smooth' });
}

/* ---------------------------------------------------------------- 3D headings (assets/type3d-engine.js) */
var T3 = { els: [], ready: false, layer: 'page' };
function emWidth(t, ls) { var w = 0, g = GL && GL.regular; for (var i = 0; i < t.length; i++) { var x = g && g[t[i]]; w += (x ? x.adv / 1000 : 0.72) + ls; } return w + 0.95; }
function t3reg(el, layer, ls) { el.__layer = layer || el.dataset.layer || 'page'; el.__ls = ls; if (T3.els.indexOf(el) < 0) T3.els.push(el); if (T3.ready) t3add(el); }
function t3layer() {
  T3.layer = TY.open ? 'ty' : ST.open ? 'stage' : BOARD.open ? 'board' : ACCPOP ? 'pop' : 'page';
  T3.stage && T3.stage.kick();
}
function t3replay(el, delay) { el.__t3reset = 1; el.__t3delay = delay || 0; T3.stage && T3.stage.kick(); }
var ACCPOP = false;
function layerOK(el) { return el.__layer === T3.layer || (el.__layer === 'chrome' && (T3.layer === 'page' || T3.layer === 'pop')); }
function inBand(r) {
  var topB = PHONE.matches ? 60 : 72, botB = innerHeight - (PHONE.matches ? 70 : 0), mid = (r.top + r.bottom) / 2;
  return mid > topB + 2 && mid < botB;
}
function startType() {
  if (RM || NOGL || !C.brand.type3d || !GL) return;
  window.type3dFallback = function (why) { HTML.classList.remove('t3d'); window.__type3dWhy = why; };
  var gd = D.createElement('script'); gd.type = 'application/json'; gd.id = 'glyph-data'; gd.textContent = JSON.stringify(GL); D.body.appendChild(gd);
  var engUrl = new URL(C.brand.type3dEngine, location.href).href;
  Promise.all([import('three'), import(engUrl)]).then(function (m) {
    var THREE = m[0], ENG = m[1], cv = $('#type3d');
    var stage = ENG.createStage(cv); if (!stage) return;
    cv.addEventListener('webglcontextlost', function () { window.type3dFallback('context-lost'); });
    T3.stage = stage; T3.ENG = ENG; T3.THREE = THREE; T3.ready = true;
    window.__t3kick = function () { stage.kick(); };
    T3.els.forEach(t3add);
    HTML.classList.add('t3d');
  }).catch(function (e) { console.warn('[studio] 3D type off:', e && e.message); HTML.classList.remove('t3d'); });
}
function t3add(el) {
  if (el.__t3) return; el.__t3 = 1;
  var ENG = T3.ENG, stage = T3.stage, THREE = T3.THREE;
  if (el.dataset.type3d === 'P') {
    var wsP = ENG.wallScene(stage, { keyPos: [2.0, 2.4, 3.4], wallZ: -0.32 }); wsP.scene.remove(wsP.wall); wsP.key.castShadow = false;
    var depth = 0.16, geo = ENG.glyphGeometries('regular', 'LOGO_P', { depth: depth, bevel: 0.016 }), g = new THREE.Group(), inner = new THREE.Group(); g.add(inner);
    geo.parts.forEach(function (p) { inner.add(new THREE.Mesh(p.g, [stage.MAT.gunmetal, stage.MAT.uv])); inner.add(new THREE.LineSegments(p.lg, stage.MAT.edge)); });
    inner.position.set(-(45 + 924.5) / 2000, -0.35, -depth / 2); g.scale.setScalar(1 / 0.7); wsP.scene.add(g);
    var sp = { ry: 0, rx: 0 };
    stage.addSlot(el, { scene: wsP.scene, camera: wsP.camera, fit: function (a) { ENG.fitCamera(wsP.camera, 1.4, 1.0, a, 0.86); },
      update: function (dt, t, prog, p) {
        g.visible = layerOK(el);
        sp.ry = damp(sp.ry, Math.sin(t * 0.45) * 0.32 + p.x * 0.35, 3, dt); sp.rx = damp(sp.rx, p.y * 0.2 + Math.sin(t * 0.33) * 0.05, 3, dt);
        g.rotation.set(sp.rx, sp.ry, 0);
      } });
    return;
  }
  var text = (el.dataset.t || el.textContent).trim().toUpperCase();
  var ls = el.__ls; if (ls == null) { var cs = getComputedStyle(el); ls = (parseFloat(cs.letterSpacing) || 0) / (parseFloat(cs.fontSize) || 1); }
  if (!isFinite(ls)) ls = 0.05;
  var slot = D.createElement('span'); slot.className = 't3slot'; slot.setAttribute('aria-hidden', 'true'); el.appendChild(slot);
  var ws = ENG.wallScene(stage, {}); ws.scene.remove(ws.wall); ws.key.castShadow = false;
  var w = ENG.makeWord(stage, text, { track: ls, shadows: false }); ws.scene.add(w.group);
  var PAD = 0.45, st = { ry: 0, rx: 0, tt: 0 };
  var n = w.letters.length, TOTAL = 0.95, EACH = 0.55, OFF = n > 1 ? (TOTAL - EACH) / (n - 1) : 0;
  var TILT = Math.min(1, 5 / Math.max(w.width, 0.1));
  stage.addSlot(slot, { scene: ws.scene, camera: ws.camera,
    fit: function (a) { ENG.fitCamera(ws.camera, w.width + PAD * 2, 1.02 + PAD * 2, a, 1, -0.05); },
    update: function (dt, t, prog, p, r) {
      if (el.__t3reset) { st.tt = -(el.__t3delay || 0); el.__t3reset = 0; }
      var show = el.__t3show !== 0 && layerOK(el) && (el.__layer !== 'page' || inBand(r));
      st.tt = show ? Math.min(TOTAL, st.tt + dt) : Math.max(0, st.tt - dt * 2.8);
      w.letters.forEach(function (L, i) {
        var k = ease((st.tt - i * OFF) / EACH);
        L.visible = k > 0.002; L.rotation.x = (1 - k) * -1.45; L.position.z = (1 - k) * -0.35; L.position.y = (1 - k) * -0.12;
      });
      st.ry = damp(st.ry, p.x * 0.16 * TILT, 3, dt); st.rx = damp(st.rx, p.y * 0.1 * TILT, 3, dt); w.group.rotation.set(st.rx, st.ry, 0);
    } });
}
var HEADS = {};
function headEl(c) {
  if (HEADS[c.id]) return HEADS[c.id];
  var h = D.createElement('h1'); h.className = 'h3d ch-h'; h.tabIndex = -1; h.setAttribute('data-type3d', ''); h.setAttribute('data-t', c.title); h.textContent = c.title;
  h.style.setProperty('--w', emWidth(c.title, 0.05).toFixed(2));
  HEADS[c.id] = h; t3reg(h, 'page', 0.05);
  return h;
}
var HERO = null;
function heroLines() {
  if (HERO) return HERO;
  HERO = ['YOUR FINAL', 'SELECTION'].map(function (t) { var s = D.createElement('span'); s.className = 'h3d'; s.setAttribute('data-type3d', ''); s.setAttribute('data-t', t); s.textContent = t; t3reg(s, 'page', 0.05); return s; });
  return HERO;
}

/* ---------------------------------------------------------------- router + the chapter change */
var cur = null, busy = false, pending = null, restoreNext = false;
function chFromHash() { var h = decodeURIComponent((location.hash || '').slice(1)); return CH[h] ? h : null; }
function go(id, restore) {
  if (!CH[id]) return;
  restoreNext = !!restore;
  if ((location.hash || '').slice(1) === id) show(id); else location.hash = id;
}
addEventListener('hashchange', function () { if (C) show(chFromHash() || 'start'); });
var PANES = [   // glass windows: [from x vw, y vh, rot] → [to …]; every chapter gets its own angle
  [[-115, 12, -11], [115, -12, -11]], [[10, 125, 9], [-10, -125, 9]], [[115, -10, 13], [-115, 10, 13]],
  [[-95, -95, -30], [95, 95, -30]], [[95, 95, 26], [-95, -95, 26]], [[-8, -125, -7], [8, 125, -7]]
];
var ENTER = [   // tiles slide in like windows from four different angles
  { t: 'perspective(1200px) translate3d(-56px,22px,0) rotateY(17deg) rotateZ(-1.5deg)', c: 'inset(0 100% 0 0)' },
  { t: 'perspective(1200px) translate3d(0,60px,0) rotateX(-15deg)', c: 'inset(100% 0 0 0)' },
  { t: 'perspective(1200px) translate3d(56px,22px,0) rotateY(-17deg) rotateZ(1.5deg)', c: 'inset(0 0 0 100%)' },
  { t: 'perspective(1200px) translate3d(0,-44px,0) rotateX(13deg)', c: 'inset(0 0 100% 0)' }
];
function runPanes(i, dir) {
  if (RM) return;
  var box = $('#panes'), set = PANES[i % PANES.length];
  box.classList.add('run');
  $$('i', box).forEach(function (p, k) {
    var j = [0, 16, -12][k], f = set[0], t = set[1];
    p.animate([
      { transform: 'translate(' + (f[0] * dir + j) + 'vw,' + (f[1] * dir) + 'vh) rotate(' + (f[2] + k * 5) + 'deg)', opacity: 0 },
      { opacity: 1, offset: 0.22 }, { opacity: 0.9, offset: 0.72 },
      { transform: 'translate(' + (t[0] * dir - j) + 'vw,' + (t[1] * dir) + 'vh) rotate(' + (t[2] + k * 5) + 'deg)', opacity: 0 }
    ], { duration: 780 + k * 70, delay: k * 60, easing: EASE_IO, fill: 'both' });
  });
  clearTimeout(runPanes.t); runPanes.t = setTimeout(function () { box.classList.remove('run'); }, 1150);
}
function show(id, first) {
  var c = CH[id]; if (!c) return;
  if (cur && cur.id === id && !first) return;
  if (busy) { pending = id; return; }
  var prev = cur, dir = prev ? (c.i >= prev.i ? 1 : -1) : 1;
  if (prev) { S.scroll[prev.id] = scrollY; if (prev.kind === 'review') harvestReview(); }
  closeStage(true); if (BOARD.open) closeBoard(); accPop(false);
  cur = c; S.ch = id; S.seen[id] = 1; if (id !== 'start') S.last = id; if (!S.started) S.started = new Date().toISOString(); save();
  var restore = restoreNext; restoreNext = false;
  var el = render(c), old = $('#stage .ch');
  D.title = c.title + ' · ' + C.client.studioName + ' · ' + C.client.name;
  var swap = function () {
    lvClear(); REV.stop();
    if (old) old.remove();
    $('#stage').appendChild(el);
    scrollTo(0, restore ? (S.scroll[id] || 0) : 0);
    mount(c, el);
    paintRail();
    var h = $('h1', el); if (h) h.focus({ preventScroll: true });
  };
  if (first || RM || !old) {
    swap();
    if (!RM) enter(el, c, first ? 0.25 : 0.1); else el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 200 });
    return;
  }
  busy = true;
  runPanes(c.i, dir);
  old.animate([{ opacity: 1, transform: 'none', filter: 'blur(0px)' },
    { opacity: 0, transform: 'translateX(' + (-dir * 36) + 'px) scale(.985)', filter: PHONE.matches ? 'blur(0px)' : 'blur(6px)' }],
    { duration: 260, easing: EASE_IN, fill: 'forwards' });
  setTimeout(function () {
    swap(); enter(el, c, 0.3); busy = false;
    if (pending) { var p = pending; pending = null; if (p !== cur.id) show(p); }
  }, 290);
}
function enter(el, c, headDelay) {
  $$('[data-type3d]', el).forEach(function (h) { t3replay(h, headDelay); });
  if (RM) return;
  var seq = $$('.ch-head .eyebrow, .ch-head .lead, .ch-head .fine, .ch-head .cbar, .hero .eyebrow, .hero .lead, .how li, .start-cta, .resume, .colour-hint, .deck h2, .rv-stat', el);
  seq.forEach(function (n, k) {
    n.animate([{ opacity: 0, transform: 'translate3d(' + (k % 2 ? 26 : -26) + 'px,10px,0)' }, { opacity: 1, transform: 'none' }],
      { duration: 620, delay: 90 + k * 55, easing: EASE_OUT, fill: 'backwards' });
  });
  var tiles = $$('.tl, .dk, .rv-frame, .sheet, .sendf', el), vh = innerHeight * 1.15, shown = tiles.filter(function (t) { return t.getBoundingClientRect().top < vh; });
  var each = Math.min(60, 640 / Math.max(1, shown.length));
  shown.forEach(function (t, k) {
    var e = ENTER[(k + c.i) % ENTER.length];
    t.animate([{ opacity: 0, transform: e.t, clipPath: e.c }, { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }],
      { duration: 680, delay: 180 + k * each, easing: EASE_OUT, fill: 'backwards' });
  });
}

/* ---------------------------------------------------------------- chapter rendering */
function leadText(c, n) {
  var s = esc(String(c.lead || '').replace(/^\{n\}/, numWord(n)).replace(/\{n\}/g, n));
  return s.replace(/\b(LOVE|MAYBE|NO|FINAL PICK|CURRENT PICK|TRY IT|USE THIS COLOUR|YOUR COLOUR)\b/g, '<b>$1</b>');
}
function cbarHTML(c) {
  return '<div class="cbar gx" data-cbar="' + c.id + '"><span class="cbar__counts" data-counts></span>' +
    '<span class="cbar__final">' + ico('i-crown', 'crw') + '<span data-final></span></span><span class="meter" aria-hidden="true"><i></i></span></div>';
}
function headHTML(c, extra) {
  var live = liveOpts(c);
  return '<header class="ch-head"><span class="ghost" aria-hidden="true">' + pad(c.i) + '</span>' +
    '<p class="eyebrow">CHAPTER ' + pad(c.i) + ' OF ' + pad(CHS.length - 1) + (c.group ? '<span class="sep"></span>' + esc(c.group) : '') + (extra ? '<span class="sep"></span>' + extra : '') +
    (OWNER && c.cats ? '<span class="sep"></span><span class="own">CATS: ' + esc(c.cats.join(', ')) + '</span>' : '') + '</p>' +
    '<div data-head></div><p class="lead">' + leadText(c, live.length || (BY[c.id] || []).length) + '</p>' +
    (c.fine ? '<p class="fine">' + esc(c.fine) + '</p>' : '') + (crownable(c) ? cbarHTML(c) : '') + '</header>';
}
function nextHTML(c) {
  var n = CHS[c.i + 1]; if (!n) return '';
  return '<button class="next gx" type="button" data-go="' + n.id + '"><span><span class="next__l">NEXT CHAPTER · ' + pad(n.i) + '</span><span class="next__t">' + esc(n.title) + '</span></span>' +
    '<span class="next__arrow gx" aria-hidden="true">' + ico('i-r') + '</span></button>';
}
function render(c) {
  var el = D.createElement('section'); el.className = 'ch ch--' + c.kind + (c.id === 'site' ? ' ch--site' : ''); el.setAttribute('aria-label', c.title);
  var live = liveOpts(c), all = BY[c.id] || [];
  if (c.kind === 'start') el.innerHTML = startHTML(c);
  else if (c.kind === 'accents' || c.kind === 'modules' || c.kind === 'set') {
    var cnt = live.length ? plural(live.length, 'OPTION') : 'LOADING SOON';
    var gcls = c.kind === 'set' ? (SETS[c.set] && SETS[c.set].orient === 'land' ? 'grid--land' : 'grid--port') : 'grid--m';
    el.innerHTML = headHTML(c, cnt + '<span class="sep"></span>LOVE ANY · CROWN ONE') +
      '<div class="grid ' + gcls + '">' + all.map(function (o, k) { return tileHTML(o, k, c); }).join('') + '</div>' + nextHTML(c);
  } else if (c.kind === 'review') el.innerHTML = headHTML(c, (C.review.questions || 12) + ' QUESTIONS') + reviewHTML() + nextHTML(c);
  else if (c.kind === 'finish') el.innerHTML = headHTML(c, 'BRAND SHEET') + finishHTML();
  var slot = $('[data-head]', el); if (slot) slot.replaceWith(headEl(c));
  var hs = $('[data-hero]', el); if (hs) { heroLines().forEach(function (s) { hs.appendChild(s); }); hs.style.setProperty('--w', Math.max(emWidth('YOUR FINAL', 0.05), emWidth('SELECTION', 0.05)).toFixed(2)); }
  return el;
}
function mount(c, el) {
  if (crownable(c)) { paintCbar(c); liveOpts(c).forEach(function (o) { paintOpt(o.code, true); }); }
  if (c.kind === 'modules') lvScan(el);
  if (c.kind === 'set') $$('.tl__img img', el).forEach(function (im) { if (im.complete && im.naturalWidth) im.classList.add('ok'); else { im.addEventListener('load', function () { im.classList.add('ok'); }, { once: true }); im.addEventListener('error', function () { im.classList.add('ok'); }, { once: true }); } });
  if (c.kind === 'accents') setAccent(S.acc, true);
  if (c.kind === 'review') REV.start(el);
  if (c.kind === 'finish') paintFinish();
  if (c.kind === 'start') startState(el);
}

/* START */
function startHTML(c) {
  var who = esc(C.client.person), brand = esc(C.client.name);
  var deck = CHS.filter(function (x) { return x.id !== 'start'; }).map(function (x, k, arr) {
    return '<button class="dk gx' + (k === arr.length - 1 && arr.length % 2 ? ' dk--wide' : '') + '" type="button" data-go="' + x.id + '"><span class="dk__n">' + pad(x.i) + '</span>' +
      '<span style="min-width:0"><span class="dk__t">' + esc(x.title) + '</span><span class="dk__s">' + esc(chapterStatus(x)) + '</span></span>' + (crownable(x) ? ico('i-crown', 'crw') : '<span></span>') + '</button>';
  }).join('');
  return '<div class="hero"><div class="hero__copy">' +
    '<p class="eyebrow">FOR ' + who + '<span class="sep"></span>' + esc(C.client.studioName) + '<span class="sep"></span>' + (CHS.length - 1) + ' CHAPTERS</p>' +
    '<h1 class="hero__h" tabindex="-1" aria-label="YOUR FINAL SELECTION" data-hero></h1>' +
    '<p class="lead">Every design we’ve made for ' + brand + ' is here, and all of it is live. Try each one, tap <b>LOVE</b>, <b>MAYBE</b> or <b>NO</b>, then crown one <b>FINAL PICK</b> in every chapter. Your picks save as you go.</p>' +
    '<ol class="how"><li class="gx"><span class="k">01</span><span class="t">TRY IT</span><span class="s">Hover, scroll, drag or tap. TRY IT opens it full screen.</span></li>' +
    '<li class="gx"><span class="k">02</span><span class="t">LOVE, MAYBE OR NO</span><span class="s">Love as many as you like. Add a note if you want.</span></li>' +
    '<li class="gx"><span class="k">03</span><span class="t">CROWN ONE</span><span class="s">One FINAL PICK per chapter builds YOUR ' + brand + '.</span></li></ol>' +
    '<div class="resume gx" data-resume hidden><i></i><span data-resume-t></span></div>' +
    '<div class="start-cta" data-cta></div><div class="confirm" data-confirm hidden></div>' +
    '<p class="colour-hint"><span class="rows">' + C.accents.map(function (a) { return '<i style="--sw:' + esc(a.hex) + '"></i>'; }).join('') + '</span><span>Pick <b>YOUR COLOUR</b> at the top first. Every live design changes to it.</span></p>' +
    '</div><div class="deck"><h2>THE CHAPTERS</h2><div class="deck__grid">' + deck + '</div></div></div>';
}
function startState(el) {
  var last = S.last && CH[S.last] ? CH[S.last] : null, prog = hasProgress() || !!last;
  var cta = $('[data-cta]', el), rs = $('[data-resume]', el);
  var firstCh = CHS[1];
  if (prog && last) {
    var n = CHS.filter(crownable).filter(function (c) { return crowned(c); }).length;
    rs.hidden = false;
    $('[data-resume-t]', rs).innerHTML = 'Welcome back. Your picks are saved: <b>' + n + ' final pick' + (n === 1 ? '' : 's') + '</b> so far. You were last in <b>' + esc(last.title) + '</b>.';
    cta.innerHTML = btn('CONTINUE WHERE I LEFT OFF', 'lg', 'data-resume-go', true) + btn('START FRESH', 'sm', 'data-fresh');
  } else cta.innerHTML = btn('START', 'lg', 'data-go="' + firstCh.id + '"', true);
}
function btn(label, size, attr, icon) {
  return '<button class="pc-btn' + (size ? ' pc-btn--' + size : '') + '" type="button" ' + (attr || '') + '><span class="pc-btn__face"><span class="pc-btn__label">' + label + '</span>' + (icon ? '<i class="pc-btn__icon" aria-hidden="true"></i>' : '') + '</span></button>';
}

/* TILES */
function tileHTML(o, k, c) {
  if (o.kind === 'soon') {
    return '<article class="tl tl--soon" style="--k:' + k + '"' + (o.code ? ' data-soon="' + esc(o.code) + '"' : '') + '><div class="tl__face gx"><div class="tl__live"><div class="tl__poster"><b>' + esc(o.code || pad((o.k || 0) + 1)) + '</b></div></div>' +
      '<div class="tl__meta"><h3 class="tl__t">' + esc(o.name || 'LIVE OPTION ' + pad((o.k || 0) + 1)) + '</h3><p class="tl__d">' + esc(o.desc || 'Being finished right now. It appears here on its own, live and in your colour.') + '</p>' +
      (o.file ? '<p class="tl__src own">' + esc(o.file) + ' · file not found yet</p>' : '') + '</div><p class="soon-tag"><i></i>LOADING SOON</p></div></article>';
  }
  var nm = esc(o.code + ' ' + o.name), live = '', hint = HINT[o.interact] || HINT.look, topR = '';
  if (o.kind === 'module') {
    var shield = (!FINE.matches || o.interact === 'scroll') ? '<button class="tl__shield" type="button" data-shield aria-label="' + (FINE.matches ? 'Use ' : 'Open ') + nm + '"><span class="chip gx">' + (FINE.matches ? 'CLICK, THEN SCROLL INSIDE' : 'TAP TO OPEN') + '</span></button>' : '';
    live = '<div class="tl__live" data-vw="' + (c.vw || C.live.virtualWidth || 760) + '" style="--vwp:' + (c.vw || C.live.virtualWidth || 760) + 'px"><div class="tl__poster">' + (o.poster ? '<img src="' + esc(o.poster) + '" alt="" loading="lazy" decoding="async">' : '<b>' + esc(o.code) + '</b>') + '</div>' + shield + over(o, hint, true) + '</div>';
    topR = btn(ico('i-expand') + 'TRY IT', '', 'data-try aria-label="Try ' + nm + ' full screen"').replace('class="pc-btn', 'class="pc-btn try');
  } else if (o.kind === 'image') {
    var ar = o.ratio || (o.w / o.h);
    live = '<div class="tl__live" style="--ar:' + ar + '"><button class="tl__img" type="button" data-try aria-label="See ' + nm + ' full screen"><img loading="lazy" decoding="async" src="' + esc(o.thumb) + '" alt=""' + (o.wide ? ' style="object-fit:contain"' : '') + '></button>' + over(o, { i: 'i-expand', t: 'TAP TO SEE IT CLOSE' }, false) + '</div>';
  } else if (o.kind === 'accent') {
    live = '<div class="tl__live"><div class="ad' + (o.slug === 'platinum' ? ' ad--plat' : '') + '" style="--a:' + o.rgb + '"><div class="ad__card gx">' +
      '<span class="ad__top">LIVE<i></i></span><span class="ad__name">' + esc(o.name) + '</span>' +
      '<svg class="ad__line" viewBox="0 0 200 30" preserveAspectRatio="none" aria-hidden="true"><path d="M0 24 L28 20 L52 22 L80 12 L104 16 L132 6 L160 10 L200 3"/></svg>' +
      '<span class="ad__bar"><i></i></span><span class="ad__btn gx">EXPLORE</span></div></div>' + over(o, null, false) + '</div>';
    topR = '';
  }
  var pickRow = '<div class="tl__pick"><div class="pc-seg pk-seg" role="radiogroup" aria-label="Your pick for ' + nm + '"><span class="pc-seg__thumb" aria-hidden="true"></span>' +
    ['love', 'maybe', 'no'].map(function (v) { return '<button class="pc-seg__opt" type="button" role="radio" aria-checked="false" data-v="' + v + '">' + V[v] + '</button>'; }).join('') + '</div>' +
    '<button class="crown gx" type="button" data-crown aria-pressed="false" aria-label="Make ' + nm + ' your final pick for ' + esc(c.title) + '">' + ico('i-crown') + '<span class="cl">FINAL PICK</span></button></div>';
  var id = 'n-' + o.code.replace(/[^A-Za-z0-9-]/g, '');
  var note = '<div class="tl__note"><button class="note-tg" type="button" aria-expanded="false" aria-controls="' + id + '"><span class="pl" aria-hidden="true"></span>ADD A NOTE</button>' +
    '<span class="fld-box gx" id="' + id + '" hidden><label class="sr" for="' + id + '-i">Your note about ' + nm + '</label><input class="fi" id="' + id + '-i" data-note type="text" maxlength="200" placeholder="One line, if you like" autocomplete="off" enterkeyhint="done"></span></div>';
  var meta = '<div class="tl__meta"><h3 class="tl__t">' + esc(o.name) + '</h3>' + (o.desc ? '<p class="tl__d">' + esc(o.desc) + '</p>' : '') +
    (o.kind === 'module' ? '<p class="tl__src own">' + esc(o.file) + (o.source ? ' · ' + esc(o.source) : '') + '</p>' : '') +
    (o.kind === 'accent' ? '<div style="margin-top:8px">' + btn('USE THIS COLOUR', '', 'data-use').replace('class="pc-btn', 'class="pc-btn use') + '</div>' : '') + '</div>';
  return '<article class="tl tl--' + o.kind + '" data-code="' + esc(o.code) + '" style="--k:' + k + '" data-live="off">' +
    '<div class="tl__face gx">' + live.replace('@TRY@', topR) + meta + pickRow + note + '</div></article>';
}
function over(o, hint, isMod) {
  var tryB = '';
  if (isMod) tryB = '@TRY@';
  else if (o.kind === 'image') tryB = '<button class="pc-btn try" type="button" data-try aria-label="See ' + esc(o.code + ' ' + o.name) + ' full screen"><span class="pc-btn__face"><span class="pc-btn__label">' + ico('i-expand') + 'TRY IT</span></span></button>';
  return '<div class="tl__over"><div class="tl__row"><span style="display:flex;gap:6px;flex-wrap:wrap"><span class="chip gx chip--code">' + esc(o.code) + '</span>' +
    (o.current ? '<span class="chip gx chip--cur">CURRENT PICK</span>' : '') + '<span class="chip gx chip--final">' + ico('i-crown') + 'FINAL PICK</span></span>' + tryB + '</div>' +
    '<div class="tl__row">' + (hint ? '<span class="chip gx">' + ico(hint.i) + hint.t + '</span>' : '<span></span>') +
    (isMod ? '<span style="display:flex;gap:6px">' + (CH[o.ch] && CH[o.ch].replay ? '<button class="chip gx chip--btn" type="button" data-replay aria-label="Replay ' + esc(o.code) + '">' + ico('i-replay') + 'REPLAY</button>' : '') +
      '<span class="chip gx chip--live"><i></i><span data-livet>PAUSED</span></span></span>' : '') + '</div></div>';
}

/* ---------------------------------------------------------------- picking */
function paintOpt(code, quiet) {
  var o = OPTS[code]; if (!o) return; var p = S.p[code] || { v: '', n: '' }, isC = S.crowns[o.ch] === code;
  $$('[data-code="' + code + '"]').forEach(function (root) {
    $$('.pk-seg [data-v]', root).forEach(function (b) { b.setAttribute('aria-checked', p.v === b.dataset.v); });
    var cr = root.id === 'stg' ? $('#stgCrown') : $('[data-crown]', root);
    if (cr) { cr.setAttribute('aria-pressed', isC); var cl = $('.cl', cr); if (cl) cl.textContent = isC ? 'YOUR FINAL PICK' : 'FINAL PICK'; }
    root.classList.toggle('is-crowned', isC); root.classList.toggle('is-love', p.v === 'love'); root.classList.toggle('is-no', p.v === 'no');
    var nt = $('[data-note]', root) || (root.id === 'stg' ? $('#stgNote') : null);
    if (nt && D.activeElement !== nt && nt.value !== (p.n || '')) nt.value = p.n || '';
    var tg = $('.note-tg', root);
    if (tg) { tg.classList.toggle('has', !!p.n); if (p.n && tg.getAttribute('aria-expanded') !== 'true') { tg.setAttribute('aria-expanded', 'true'); $('#' + tg.getAttribute('aria-controls')).hidden = false; } }
  });
  if (!quiet) { paintCbar(CH[o.ch]); paintRail(); if (BOARD.open) renderBoard(); if (cur && cur.kind === 'finish') paintFinish(); }
}
function paintCbar(c) {
  var bar = $('[data-cbar="' + c.id + '"]'); if (!bar) return;
  var live = liveOpts(c), cnt = { love: 0, maybe: 0, no: 0 };
  live.forEach(function (o) { var v = P(o.code).v; if (cnt[v] != null) cnt[v]++; });
  var done = cnt.love + cnt.maybe + cnt.no, cr = crowned(c);
  $('[data-counts]', bar).innerHTML = live.length ? '<b>' + cnt.love + '</b> LOVED · <b>' + cnt.maybe + '</b> MAYBE · <b>' + cnt.no + '</b> NO · <b>' + (live.length - done) + '</b> TO GO' : 'LIVE OPTIONS ARE ON THEIR WAY';
  $('[data-final]', bar).innerHTML = cr ? 'FINAL PICK <b>' + esc(cr.code + ' · ' + cr.name) + '</b>' : (live.length ? 'NO FINAL PICK YET · CROWN ONE' : 'CROWN ONE WHEN THEY LAND');
  bar.classList.toggle('crowned', !!cr);
  $('.meter i', bar).style.setProperty('--p', live.length ? done / live.length : 0);
}
function pick(code, v) {
  var o = OPTS[code]; if (!pickable(o)) return;
  var p = P(code); p.v = p.v === v ? '' : v;
  if (S.crowns[o.ch] === code && p.v !== 'love') { delete S.crowns[o.ch]; toast('Final pick for <b>' + esc(CH[o.ch].title) + '</b> cleared.'); }
  save(); paintOpt(code);
}
function crown(code) {
  var o = OPTS[code]; if (!pickable(o)) return; var c = CH[o.ch], prevCode = S.crowns[c.id];
  if (prevCode === code) { delete S.crowns[c.id]; save(); paintOpt(code); toast('Final pick for <b>' + esc(c.title) + '</b> cleared.'); return; }
  S.crowns[c.id] = code; P(code).v = 'love'; save(true);
  if (prevCode) paintOpt(prevCode, true);
  paintOpt(code);
  $$('[data-code="' + code + '"] [data-crown], #stg[data-code="' + code + '"] #stgCrown').forEach(function (b) { b.classList.remove('pop'); void b.offsetWidth; if (!RM) b.classList.add('pop'); });
  var bb = $('#boardBtn'); bb.classList.remove('pulse'); void bb.offsetWidth; if (!RM) bb.classList.add('pulse');
  if (o.kind === 'accent') setAccent(o.slug, true);
  toast('<b>' + esc(o.code + ' ' + o.name) + '</b> is your final pick for ' + esc(c.title) + (prevCode ? ' (it replaces ' + esc(prevCode) + ')' : '') + '.', 'SEE YOUR ' + esc(C.client.name), openBoard);
}
function setNote(code, val) { var p = P(code); p.n = String(val || '').slice(0, 200); save(); var tg = $('[data-code="' + code + '"] .note-tg'); if (tg) tg.classList.toggle('has', !!p.n); }

/* ---------------------------------------------------------------- live tiles: lazy, capped, paused off-screen */
var LV = { tiles: [], hover: null, suspended: false, raf: 0, ioNear: null, ioVis: null, ro: null, engagedAt: 0 };
function lvInit() {
  LV.ioNear = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.__near = e.isIntersecting; }); lvSchedule(); }, { rootMargin: C.live.loadMargin || '600px 0px' });
  LV.ioVis = new IntersectionObserver(function (es) { es.forEach(function (e) { e.target.__vis = e.isIntersecting ? e.intersectionRatio : 0; if (!e.isIntersecting) e.target.classList.remove('engaged'); }); lvSchedule(); }, { threshold: [0, 0.12, 0.3, 0.5, 0.75, 1] });
  LV.ro = new ResizeObserver(function (es) { es.forEach(function (e) { fitLive(e.target); }); });
  addEventListener('scroll', function () {
    lvSchedule();
    if (LV.engagedAt && Math.abs(scrollY - LV.engagedAt) > 40) { $$('.tl.engaged').forEach(function (t) { t.classList.remove('engaged'); }); LV.engagedAt = 0; }
  }, { passive: true });
  D.addEventListener('visibilitychange', lvSchedule);
  addEventListener('message', function (e) {
    var d = e.data; if (!d || typeof d !== 'object') return;
    if (d.ready || d.type === 'ready' || d.cmd === 'ready' || d.status === 'ready' || d.pep === 'ready' || d.event === 'ready') {
      var t = LV.tiles.filter(function (x) { return x.__frame && x.__frame.contentWindow === e.source; })[0];
      if (t) { t.__ready = true; post(t.__frame, accMsg()); t.__playing = null; lvSchedule(); }
      else if (ST.frame && ST.frame.contentWindow === e.source) { post(ST.frame, accMsg()); post(ST.frame, { cmd: 'play' }); }
      else $$('#boardBody iframe').forEach(function (f) { if (f.contentWindow === e.source) { post(f, accMsg()); post(f, { cmd: 'play' }); } });
    }
  });
}
function fitLive(live) {
  var vw = +live.dataset.vw || 760, w = live.clientWidth, h = live.clientHeight; if (!w || !h) return;
  live.style.setProperty('--s', (w / vw).toFixed(4)); live.style.setProperty('--arn', (w / h).toFixed(4));
}
function lvScan(root) {
  $$('.tl--module', root).forEach(function (t) {
    t.__o = OPTS[t.dataset.code]; t.__near = false; t.__vis = 0; LV.tiles.push(t);
    LV.ioNear.observe(t); LV.ioVis.observe(t); var lv = $('.tl__live', t); LV.ro.observe(lv); fitLive(lv);
    t.addEventListener('pointerenter', function () { LV.hover = t; lvSchedule(); });
    t.addEventListener('pointerleave', function () { if (LV.hover === t) LV.hover = null; lvSchedule(); });
  });
}
function lvClear() {
  LV.tiles.forEach(function (t) { unload(t); LV.ioNear.unobserve(t); LV.ioVis.unobserve(t); var lv = $('.tl__live', t); if (lv) LV.ro.unobserve(lv); });
  LV.tiles = []; LV.hover = null;
}
function lvSchedule() { if (!LV.raf) LV.raf = requestAnimationFrame(lvEval); }
function lvCaps() {
  return { play: PHONE.matches ? C.live.maxPlayingPhone : C.live.maxPlaying, load: PHONE.matches ? C.live.maxLoadedPhone : C.live.maxLoaded };
}
function lvEval() {
  LV.raf = 0;
  var caps = lvCaps(), mid = innerHeight / 2;
  var dist = function (t) { var r = t.getBoundingClientRect(); return Math.abs((r.top + r.bottom) / 2 - mid); };
  // 1. what should be loaded: visible first, then nearest
  LV.tiles.forEach(function (t) { if (t.__frame && !t.__near) unload(t); });
  if (!LV.suspended) {
    var want = LV.tiles.filter(function (t) { return t.__near; }).sort(function (a, b) { return ((b.__vis > 0) - (a.__vis > 0)) || (dist(a) - dist(b)); }).slice(0, caps.load);
    LV.tiles.forEach(function (t) { if (t.__frame && want.indexOf(t) < 0 && LV.tiles.filter(function (x) { return x.__frame; }).length > caps.load) unload(t); });
    want.forEach(function (t) { if (!t.__frame && LV.tiles.filter(function (x) { return x.__frame; }).length < caps.load) load(t); });
  }
  // 2. what should play: the hovered tile, then the ones nearest the middle of the screen
  var vis = LV.tiles.filter(function (t) { return t.__frame && t.__ready && t.__vis >= 0.12; });
  vis.sort(function (a, b) { return ((b === LV.hover) - (a === LV.hover)) || (dist(a) - dist(b)); });
  var play = (LV.suspended || D.hidden) ? [] : vis.slice(0, caps.play);
  LV.tiles.forEach(function (t) { if (!t.__frame || !t.__ready) return; var on = play.indexOf(t) > -1; if (t.__playing !== on) cmd(t, on); });
}
function cmd(t, on) {
  t.__playing = on; post(t.__frame, { cmd: on ? 'play' : 'pause' });
  t.dataset.live = on ? 'on' : 'off'; var l = $('[data-livet]', t); if (l) l.textContent = on ? 'LIVE' : 'PAUSED';
}
function modSrc(o, where) {
  var a = accent(S.acc);
  return o.file + (o.file.indexOf('?') > -1 ? '&' : '?') + 'acc=' + encodeURIComponent(a.slug) + '&hex=' + encodeURIComponent(a.hex.slice(1)) + '&in=' + where + '&hint=0&chrome=0&bare=1';
}
function makeFrame(o, where) {
  var f = D.createElement('iframe');
  f.title = o.code + ' ' + o.name + ' · live preview';
  f.setAttribute('sandbox', 'allow-scripts allow-same-origin allow-pointer-lock allow-popups');
  f.setAttribute('allow', 'autoplay; fullscreen; accelerometer; gyroscope');
  f.setAttribute('loading', 'eager');
  f.src = modSrc(o, where);
  return f;
}
function load(t) {
  var o = t.__o, live = $('.tl__live', t), f = makeFrame(o, 'tile');
  f.className = 'fade'; f.tabIndex = -1;
  f.addEventListener('load', function () {
    if (t.__frame !== f) return;
    t.__ready = true; t.classList.add('is-loaded'); f.classList.add('in');
    post(f, accMsg()); t.__playing = null; lvSchedule();
  });
  live.insertBefore(f, live.firstChild); t.__frame = f; t.__ready = false; t.__playing = null;
}
function unload(t) {
  var f = t.__frame; if (!f) return;
  try { post(f, { cmd: 'pause' }); f.src = 'about:blank'; } catch (e) {}
  f.remove(); t.__frame = null; t.__ready = false; t.__playing = null;
  t.classList.remove('is-loaded'); t.dataset.live = 'off'; var l = $('[data-livet]', t); if (l) l.textContent = 'PAUSED';
}

/* ---------------------------------------------------------------- TRY IT: the cinematic stage */
var ST = { open: false, list: [], idx: 0, frame: null, back: null };
function stageList(o) { return (BY[o.ch] || []).filter(function (x) { return x.kind === 'module' || x.kind === 'image'; }); }
function openStage(code) {
  var o = OPTS[code]; if (!o || (o.kind !== 'module' && o.kind !== 'image')) return;
  var from = $('[data-code="' + code + '"] .tl__live');
  ST.back = D.activeElement; ST.list = stageList(o); ST.idx = ST.list.indexOf(o); ST.open = true;
  LV.suspended = true; lvSchedule();
  var stg = $('#stg'); stg.inert = false; stg.classList.add('open'); D.body.style.overflow = 'hidden';
  t3layer();
  fillStage(o, 0);
  if (!RM) {
    $('#stgBg').animate([{ opacity: 0 }, { opacity: 1 }], { duration: 360, easing: EASE_OUT, fill: 'forwards' });
    $$('.stg__top, .stg__bot', stg).forEach(function (n, k) { n.animate([{ opacity: 0, transform: 'translateY(' + (k ? 16 : -16) + 'px)' }, { opacity: 1, transform: 'none' }], { duration: 560, delay: 160, easing: EASE_OUT, fill: 'backwards' }); });
    if (from) {
      var a = from.getBoundingClientRect(), fr = $('#stgFrame'), b = fr.getBoundingClientRect();
      if (a.width && b.width) fr.animate([{ transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + (a.width / b.width) + ',' + (a.height / b.height) + ')', transformOrigin: '0 0', opacity: 0.6 },
        { transform: 'none', transformOrigin: '0 0', opacity: 1 }], { duration: 640, easing: EASE_OUT });
    }
  } else $('#stgBg').style.opacity = 1;
  $('#stgX').focus({ preventScroll: true });
}
function fillStage(o, dir) {
  var stg = $('#stg'), c = CH[o.ch], fr = $('#stgFrame'), hint = o.kind === 'image' ? { i: 'i-look', t: 'MOVE TO TILT · SCROLL TO ZOOM' } : (HINT[o.interact] || HINT.look);
  stg.setAttribute('data-code', o.code);
  $('#stgReplay').hidden = !(o.kind === 'module' && c.replay);
  $('#stgEye').innerHTML = esc(c.title) + ' · <b>' + pad(ST.idx + 1) + '</b> / ' + pad(ST.list.length);
  $('#stgT').innerHTML = '<span>' + esc(o.code) + '</span><span style="color:var(--mute)">·</span><span>' + esc(o.name) + '</span><span class="chip gx stg__hint">' + ico(hint.i) + hint.t + '</span>' + (o.current ? '<span class="chip gx chip--cur">CURRENT PICK</span>' : '');
  $('#stgD').textContent = o.desc || '';
  $('#stgSrc').textContent = o.kind === 'module' ? (o.file + (o.source ? ' · ' + o.source : '')) : o.src;
  var old = $('.stg__m', fr), m = D.createElement('div'); m.className = 'stg__m'; m.style.cssText = 'position:absolute;inset:0';
  if (ST.frame) { post(ST.frame, { cmd: 'pause' }); ST.frame = null; }
  if (o.kind === 'module') {
    m.innerHTML = '<div class="tl__poster"><b>' + esc(o.code) + '</b></div>';
    var f = makeFrame(o, 'stage'); ST.frame = f;
    f.addEventListener('load', function () {
      if (ST.frame !== f) return; post(f, accMsg()); post(f, { cmd: 'play' });
      try { f.contentWindow.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeStage(); }); } catch (e) {}
    });
    m.appendChild(f);
  } else {
    m.innerHTML = '<div class="stg__img"><img src="' + esc(o.src) + '" alt="' + esc(o.code + ' ' + o.name) + '" decoding="async"' + (RM ? '' : ' class="drift"') + '></div>';
  }
  fr.appendChild(m);
  if (old) {
    if (RM || !dir) old.remove();
    else {
      old.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'perspective(1400px) translateX(' + (-dir * 9) + '%) rotateY(' + (dir * 14) + 'deg)' }], { duration: 340, easing: EASE_IN, fill: 'forwards' })
        .finished.then(function () { var f2 = $('iframe', old); if (f2) f2.src = 'about:blank'; old.remove(); }, function () { old.remove(); });
      m.animate([{ opacity: 0, transform: 'perspective(1400px) translateX(' + (dir * 10) + '%) rotateY(' + (-dir * 16) + 'deg)', clipPath: dir > 0 ? 'inset(0 0 0 100%)' : 'inset(0 100% 0 0)' },
        { opacity: 1, transform: 'none', clipPath: 'inset(0 0 0 0)' }], { duration: 640, delay: 120, easing: EASE_OUT, fill: 'backwards' });
    }
  }
  paintOpt(o.code, true);
}
function stageNav(d) { if (!ST.open || ST.list.length < 2) return; ST.idx = (ST.idx + d + ST.list.length) % ST.list.length; fillStage(ST.list[ST.idx], d); }
function closeStage(instant) {
  if (!ST.open) return;
  ST.open = false; var stg = $('#stg'), fr = $('#stgFrame');
  if (ST.frame) { post(ST.frame, { cmd: 'pause' }); }
  var done = function () { $$('.stg__m', fr).forEach(function (m) { var f = $('iframe', m); if (f) f.src = 'about:blank'; m.remove(); }); stg.classList.remove('open'); stg.inert = true; stg.removeAttribute('data-code'); };
  ST.frame = null; D.body.style.overflow = '';
  if (instant || RM) done();
  else { $('#stgBg').animate([{ opacity: 1 }, { opacity: 0 }], { duration: 240, easing: EASE_IN, fill: 'forwards' }); fr.animate([{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.96)' }], { duration: 240, easing: EASE_IN, fill: 'forwards' }); setTimeout(function () { if (ST.open) return; done(); fr.getAnimations().forEach(function (an) { an.cancel(); }); }, 250); }
  LV.suspended = BOARD.open; lvSchedule(); t3layer();
  if (ST.back && ST.back.focus && !instant) try { ST.back.focus({ preventScroll: true }); } catch (e) {}
}
/* picture zoom + tilt inside the stage */
(function () {
  var fr = null, raf = 0, ev = null, zs = 1;
  D.addEventListener('pointermove', function (e) {
    if (!ST.open || RM) return; ev = e; if (raf) return;
    raf = requestAnimationFrame(function () { raf = 0; fr = fr || $('#stgFrame'); var im = $('.stg__img img', fr); if (!im) return;
      var r = fr.getBoundingClientRect(), x = (ev.clientX - r.left) / r.width - 0.5, y = (ev.clientY - r.top) / r.height - 0.5;
      im.style.setProperty('--ry', (x * 8).toFixed(2) + 'deg'); im.style.setProperty('--rx', (-y * 6).toFixed(2) + 'deg'); });
  }, { passive: true });
  D.addEventListener('wheel', function (e) {
    if (!ST.open) return; var im = $('#stgFrame .stg__img img'); if (!im || !e.target.closest('#stgFrame')) return;
    e.preventDefault(); zs = Math.max(1, Math.min(2.2, zs - e.deltaY * 0.0012)); im.style.setProperty('--zs', zs.toFixed(3));
  }, { passive: false });
})();

/* ---------------------------------------------------------------- YOUR PEPTICITY: the live brand board */
var BOARD = { open: false, cells: {} };
function openBoard() {
  if (TY.open) closeThanks();
  BOARD.open = true; var b = $('#board'); b.inert = false; b.classList.add('open'); $('#scrim').classList.add('on'); $('#boardBtn').setAttribute('aria-expanded', 'true');
  LV.suspended = true; lvSchedule(); BOARD.cells = {}; renderBoard(); t3layer(); t3replay($('#boardH'), 0.35);
  setTimeout(function () { $('#boardX').focus({ preventScroll: true }); }, 50);
}
function closeBoard() {
  if (!BOARD.open) return;
  BOARD.open = false; var b = $('#board'); b.classList.remove('open'); b.inert = true; $('#scrim').classList.remove('on'); $('#boardBtn').setAttribute('aria-expanded', 'false');
  setTimeout(function () { if (!BOARD.open) { $$('#boardBody iframe').forEach(function (f) { f.src = 'about:blank'; }); $('#boardBody').innerHTML = ''; BOARD.cells = {}; } }, 650);
  LV.suspended = ST.open; lvSchedule(); t3layer();
}
function boardCell(slot) {
  var c = CH[slot.ch]; if (!c) return '';
  var o = crowned(c), area = esc(slot.area || slot.ch), head = '<p class="bs__l"><span>' + esc(c.title) + '</span>' + (o ? '<b>' + esc(o.code) + '</b>' : '') + '</p>';
  if (c.kind === 'accents') {
    var a = o ? accent(o.slug) : accent(S.acc);
    return '<div class="bs gx" data-area="' + area + '" style="grid-area:' + area + '">' + head +
      '<div class="bs__colour" style="--sw:' + esc(a.hex) + ';margin-top:12px"><i></i><span style="display:grid;gap:6px"><b>' + esc(a.name) + '</b><span>' + esc(a.hex) + (o ? ' · your final colour' : ' · trying it, not crowned yet') + '</span></span><span class="bs__ramp"></span></div></div>';
  }
  if (!o) {
    var live = liveOpts(c).length;
    return '<div class="bs gx" data-area="' + area + '" style="grid-area:' + area + '">' + head + '<div class="bs__empty"><span>' + (live ? 'Crown one in ' + esc(c.title) + ' to see it here.' : esc(c.title) + ' is on its way.') + '</span>' +
      (live ? btn('GO TO ' + esc(c.title), '', 'data-go="' + c.id + '"') : '') + '</div></div>';
  }
  var v = o.kind === 'image' ? '<img src="' + esc(o.thumb) + '" alt="' + esc(o.code + ' ' + o.name) + '" decoding="async">' : '<span data-bframe="' + esc(o.code) + '"></span>';
  return '<div class="bs gx" data-area="' + area + '" style="grid-area:' + area + '"' + (o.kind === 'module' ? ' data-vw="' + (c.vw || C.live.virtualWidth) + '"' : '') + '>' + head +
    '<div class="bs__v">' + v + '</div><p class="bs__n">' + esc(o.name) + '</p></div>';
}
function renderBoard() {
  var body = $('#boardBody'); if (!BOARD.open) return;
  var slots = (C.board && C.board.slots) || [], grid = $('.bgrid', body);
  if (!grid) { body.innerHTML = '<div class="bgrid"></div><div class="bchips"></div>'; grid = $('.bgrid', body); }
  slots.forEach(function (slot) {
    var c = CH[slot.ch]; if (!c) return;
    var key = (crowned(c) || {}).code || '-'; if (c.kind === 'accents') key += S.acc;
    if (BOARD.cells[slot.ch] === key) return;
    var wasSet = BOARD.cells[slot.ch] !== undefined; BOARD.cells[slot.ch] = key;
    var html = boardCell(slot), old = $('.bs[data-area="' + (slot.area || slot.ch) + '"]', grid), tmp = D.createElement('div'); tmp.innerHTML = html;
    var cell = tmp.firstChild; if (!cell) return;
    if (old) { $$('iframe', old).forEach(function (f) { f.src = 'about:blank'; }); old.replaceWith(cell); } else grid.appendChild(cell);
    if (wasSet && !RM) cell.classList.add('new');
    var ph = $('[data-bframe]', cell);
    if (ph) {
      var o = OPTS[ph.dataset.bframe], f = makeFrame(o, 'board'); f.tabIndex = -1; f.setAttribute('aria-hidden', 'true');
      var vw = +cell.dataset.vw || 760; f.parentNode; ph.replaceWith(f); var box = f.parentNode;
      var fit = function () { var w = box.clientWidth, h = box.clientHeight; if (!w || !h) return; f.style.setProperty('--vwp', vw + 'px'); f.style.setProperty('--s', (w / vw).toFixed(4)); f.style.setProperty('--arn', (w / h).toFixed(4)); };
      fit(); new ResizeObserver(fit).observe(box);
      f.addEventListener('load', function () { post(f, accMsg()); post(f, { cmd: 'play' }); });
    }
  });
  var chips = ((C.board && C.board.chips) || []).map(function (id) {
    var c = CH[id]; if (!c) return ''; var o = crowned(c);
    return '<span class="bchip gx">' + esc(c.title) + ' · ' + (o ? '<b>' + esc(o.code + ' ' + o.name) + '</b>' : (liveOpts(c).length ? 'NOT CROWNED YET' : 'ON ITS WAY')) + '</span>';
  }).join('');
  var ch = $('.bchips', body); if (ch.innerHTML !== chips) ch.innerHTML = chips;
  var cc = CHS.filter(crownable), n = cc.filter(function (c) { return crowned(c); }).length;
  $('#boardFoot').innerHTML = '<b>' + n + '</b> OF ' + cc.length + ' FINAL PICKS';
}

/* ---------------------------------------------------------------- YOUR SITE: the review, embedded and kept */
var REV = { frame: null, timer: 0, src: null,
  start: function (el) {
    var box = $('.rv-frame', el); paintReview();
    clearInterval(REV.timer); REV.timer = setInterval(paintReview, 2500);
    (REV.src ? Promise.resolve(REV.src) : firstExisting(C.review.src)).then(function (src) {
      REV.src = src; if (!cur || cur.kind !== 'review' || !box.isConnected) return;
      var f = D.createElement('iframe'); f.title = 'YOUR SITE · the review questions'; f.setAttribute('allow', 'autoplay; fullscreen; clipboard-write'); f.src = src;
      f.addEventListener('load', function () { box.classList.add('ok'); adaptReview(f); });
      box.appendChild(f); REV.frame = f;
    });
  },
  stop: function () { clearInterval(REV.timer); if (REV.frame) { harvestReview(); try { REV.frame.src = 'about:blank'; } catch (e) {} REV.frame.remove(); REV.frame = null; } }
};
function reviewHTML() {
  return '<div class="rv-wrap"><div class="rv-stat"><span>YOUR ANSWERS <b data-rv-count>0 OF ' + (C.review.questions || 12) + '</b></span><span class="sp"></span><span data-rv-status>SAVED AS YOU GO</span>' +
    (OWNER ? '<span class="own">' + esc([].concat(C.review.src).join(' | ')) + '</span>' : '') + '</div>' +
    '<div class="rv-frame frame"><div class="rv-load">LOADING YOUR SITE</div></div></div>';
}
function reviewInfo() {
  var total = C.review ? (C.review.questions || 12) : 12, st = null;
  try { st = JSON.parse(localStorage.getItem(C.review.storageKey) || 'null'); } catch (e) {}
  if (!st || !st.a) return { answered: 0, total: total, done: null, raw: null };
  var n = Object.keys(st.a).filter(function (k) { var a = st.a[k]; return a && ((a.picks && a.picks.length) || (a.dots && a.dots.length) || (a.note && a.note.trim())); }).length + (st.text && st.text.trim() ? 1 : 0);
  return { answered: Math.min(n, total), total: total, done: st.done || null, raw: st };
}
function paintReview() {
  var r = reviewInfo(), c = $('[data-rv-count]'), s = $('[data-rv-status]');
  if (c) c.textContent = r.answered + ' OF ' + r.total;
  if (s) s.textContent = r.done ? (r.done.status === 'failed' ? 'SAVED ON THIS DEVICE · SEND AGAIN FROM THE LAST QUESTION' : 'SENT · THANK YOU') : 'SAVED AS YOU GO';
}
function adaptReview(f) {
  try {
    var d = f.contentDocument; if (!d) return;
    var st = d.createElement('style');
    // inside the studio its own top bar (brand, REVIEW | PICKS switch) doubles the studio's, so the questions move up into its place
    st.textContent = '.top{display:none!important}:root{--top:12px!important}';
    d.head.appendChild(st);
    $$('a[href="picks.html"]', d).forEach(function (a) {
      var l = a.querySelector('.pc-btn__label'); if (l && l.firstChild) l.firstChild.nodeValue = 'BACK TO THE STUDIO';
      a.addEventListener('click', function (e) { e.preventDefault(); go('finish'); });
    });
    d.documentElement.style.setProperty('--acc', S.accRgb);
  } catch (e) {}
}
function harvestReview() {
  try { var w = REV.frame && REV.frame.contentWindow; if (w && w.PEP_FEEDBACK && w.PEP_FEEDBACK.buildPayload) { S.reviewText = w.PEP_FEEDBACK.buildPayload().text; save(); } } catch (e) {}
}
addEventListener('storage', function (e) { if (C && C.review && e.key === C.review.storageKey) { paintReview(); paintRail(); } });

/* ---------------------------------------------------------------- FINISH: brand sheet, PDF, send */
function finishHTML() {
  return '<div class="fin"><div data-sheet></div>' +
    '<form class="sendf gx" id="sendf" novalidate><h2>SEND IT TO US</h2><p class="sendf__tot" id="sendTot"></p>' +
    '<div class="fld" id="emFld"><label class="fl" for="em">YOUR EMAIL</label><span class="fld-box gx"><input class="fi" id="em" type="email" inputmode="email" autocomplete="email" autocapitalize="off" spellcheck="false" required aria-describedby="emErr"></span><p class="err" id="emErr" hidden></p></div>' +
    '<div class="fld"><label class="fl" for="extra">ANYTHING ELSE? <span>OPTIONAL</span></label><span class="fld-box gx"><textarea class="ta" id="extra" rows="3" maxlength="1500" placeholder="A mix of two designs, a feeling, a change. Anything goes."></textarea></span></div>' +
    '<div class="warn gx" id="warn" hidden></div>' +
    '<div class="btnrow"><button class="pc-btn pc-btn--lg pc-btn--block" type="submit" id="sendBtn"><span class="pc-btn__face"><span class="pc-btn__label">SEND MY SELECTION</span><i class="pc-btn__icon" aria-hidden="true"></i></span></button>' +
    '<button class="pc-btn pc-btn--block" type="button" id="pdfBtn"><span class="pc-btn__face"><span class="pc-btn__label">SAVE AS PDF</span></span></button>' +
    (OWNER ? '<button class="pc-btn pc-btn--block" type="button" data-copyjson><span class="pc-btn__face"><span class="pc-btn__label">COPY PICKS AS JSON</span></span></button>' : '') + '</div>' +
    '<p class="fine2">Your selection goes straight to ' + esc(cap1(C.client.signedBy)) + ' at ' + esc(C.client.agency) + ' by email. It also stays saved on this device, so you can change it and send again.</p></form></div>';
}
function listLine(arr) { return arr.map(function (o) { return o.code + ' ' + o.name; }).join(' · '); }
function chapterPicks(c) {
  var live = liveOpts(c), out = { love: [], maybe: [], no: [], notes: [] };
  live.forEach(function (o) { var p = S.p[o.code]; if (!p) return; if (out[p.v]) out[p.v].push(o); if (p.n && p.n.trim()) out.notes.push({ o: o, n: p.n.trim() }); });
  return out;
}
function sheetHTML() {
  var a = accent((crowned(CH.colour || {}) || {}).slug || S.acc), date = new Date().toLocaleDateString('en-CA', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase();
  var rows = CHS.filter(crownable).map(function (c) {
    var o = crowned(c), pk = chapterPicks(c), live = liveOpts(c), fin;
    if (o) {
      var vis = o.kind === 'image' ? '<img class="shr__thumb' + (o.orient === 'land' ? '' : ' shr__thumb--port') + '" src="' + esc(o.thumb) + '" alt="">' :
        o.kind === 'accent' ? '<span class="shr__sw" style="--sw:' + esc(o.hex) + '"><i></i></span>' : '<span class="shr__code">' + esc(o.code) + '</span>';
      fin = '<div class="shr__final">' + vis + '<span class="shr__name"><b>' + esc(o.code + ' · ' + o.name) + '</b><span>' + esc(o.kind === 'accent' ? o.hex : (o.desc || '')) + '</span></span></div>';
    } else fin = '<div class="shr__miss">' + (live.length ? 'No final pick yet.' : 'Options on their way.') + (live.length ? ' ' + btn('CROWN ONE', '', 'data-go="' + c.id + '"') : '') + '</div>';
    var others = pk.love.filter(function (x) { return !o || x.code !== o.code; });
    return '<section class="shr"><h3 class="shr__h"><b>' + pad(c.i) + '</b>' + esc(c.title) + '</h3>' + fin +
      (others.length ? '<p class="shr__l"><b>ALSO LOVED</b>' + esc(listLine(others)) + '</p>' : '') +
      (pk.maybe.length ? '<p class="shr__l"><b>MAYBE</b>' + esc(listLine(pk.maybe)) + '</p>' : '') +
      (pk.notes.length ? '<ul class="shr__notes">' + pk.notes.map(function (x) { return '<li><b>' + esc(x.o.code) + '</b>' + esc(x.n) + '</li>'; }).join('') + '</ul>' : '') + '</section>';
  }).join('');
  var r = reviewInfo();
  rows += '<section class="shr shr--wide"><h3 class="shr__h"><b>' + pad(CH.site ? CH.site.i : 12) + '</b>YOUR SITE</h3><p class="shr__l">' +
    (r.done ? 'Your answers to the ' + r.total + ' questions were sent.' : r.answered + ' of ' + r.total + ' questions answered so far. ' + (r.answered < r.total ? 'They send on their own from the last question.' : '')) + '</p>' +
    (!r.done && CH.site ? '<div>' + btn('GO TO YOUR SITE', 'sm', 'data-go="site"') + '</div>' : '') + '</section>';
  return '<article class="sheet gx"><header class="sheet__head"><img class="sheet__logo" src="' + esc(C.brand.logo) + '" alt="">' +
    '<div><h2 class="sheet__t">' + esc(C.client.name) + '</h2><p class="sheet__sub">' + esc(C.client.person) + '’S FINAL SELECTION · ' + date + '</p></div>' +
    '<div class="sheet__acc" style="--sw:' + esc(a.hex) + '"><i></i>' + esc(a.name) + '</div></header><div class="sheet__grid">' + rows + '</div></article>';
}
function missingCrowns() { return CHS.filter(function (c) { return crownable(c) && liveOpts(c).length && !crowned(c); }); }
function paintFinish() {
  var box = $('[data-sheet]'); if (box) box.innerHTML = sheetHTML();
  $('#printSheet').innerHTML = sheetHTML();
  var cc = CHS.filter(crownable), n = cc.filter(function (c) { return crowned(c); }).length, loves = Object.keys(S.p).filter(function (k) { return S.p[k].v === 'love' && OPTS[k]; }).length;
  var tot = $('#sendTot'); if (tot) tot.innerHTML = '<b>' + n + ' of ' + cc.length + '</b> final picks · <b>' + loves + '</b> loved.' + (S.done && S.done.status === 'sent' ? ' Sent before: you can send again any time.' : '');
  var em = $('#em'), ex = $('#extra'); if (em && D.activeElement !== em) em.value = S.email || ''; if (ex && D.activeElement !== ex) ex.value = S.extra || '';
}
function checkEmail(focus) {
  var em = $('#em'), v = em.value.trim(), fld = $('#emFld'), err = $('#emErr'), msg = '';
  if (!v) msg = 'Add your email so we can reply to you.';
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = 'Please check your email address. It should look like name@example.com.';
  fld.classList.toggle('bad', !!msg); em.setAttribute('aria-invalid', msg ? 'true' : 'false'); err.hidden = !msg; err.textContent = msg;
  if (msg && focus) em.focus();
  return !msg;
}
var confirmMissing = false;
function onSend(e) {
  e.preventDefault();
  S.email = $('#em').value.trim(); S.extra = $('#extra').value; save(true);
  if (!checkEmail(true)) return;
  var miss = missingCrowns(), w = $('#warn');
  if (miss.length && !confirmMissing) {
    w.hidden = false;
    w.innerHTML = '<span><b>' + miss.length + ' chapter' + (miss.length === 1 ? ' has' : 's have') + ' no final pick yet:</b> ' + esc(miss.map(function (c) { return c.title; }).join(', ')) + '. Send now, or crown them first?</span>' +
      '<span class="warn__acts">' + btn('SEND ANYWAY', 'sm', 'data-send-anyway') + btn('GO TO ' + esc(miss[0].title), 'sm', 'data-go="' + miss[0].id + '"') + '</span>';
    if (!RM) w.animate([{ opacity: 0, transform: 'translateY(-6px)' }, { opacity: 1, transform: 'none' }], { duration: 420, easing: EASE_OUT });
    return;
  }
  w.hidden = true; confirmMissing = false;
  harvestReview();
  LAST = buildPayload(); openThanks(); submit();
}
function buildPayload() {
  var when = new Date(), email = (S.email || C.client.email || '').trim(), who = C.client.person, brand = C.client.name;
  var form = brand + ' · ' + who + "'S FINAL SELECTION";
  var shown = accent(S.acc), finalC = crowned(CH.colour || {});
  var lines = [form, 'Sent: ' + when.toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' }), who.charAt(0) + who.slice(1).toLowerCase() + ': ' + email,
    'Colour on screen while choosing: ' + shown.name + ' ' + shown.hex, ''];
  var fields = { _subject: C.submit.subject, _template: C.submit.template || 'table', _captcha: 'false', _replyto: email, client: brand, email: email };
  var json = { form: form, client: brand, person: who, email: email, submitted_at: when.toISOString(), studio: C.client.studioName,
    accent_on_screen: { slug: shown.slug, name: shown.name, hex: shown.hex }, chapters: [], review: null, anything_else: (S.extra || '').trim() };
  CHS.filter(crownable).forEach(function (c) {
    var o = crowned(c), pk = chapterPicks(c), key = pad(c.i) + ' · ' + c.title, live = liveOpts(c);
    var row = { n: c.i, id: c.id, title: c.title, options: live.length,
      final: o ? { code: o.code, name: o.name, file: o.file || o.src || null, hex: o.hex || null } : null,
      loved: pk.love.map(function (x) { return { code: x.code, name: x.name }; }), maybe: pk.maybe.map(function (x) { return { code: x.code, name: x.name }; }),
      no: pk.no.map(function (x) { return { code: x.code, name: x.name }; }), notes: pk.notes.map(function (x) { return { code: x.o.code, name: x.o.name, note: x.n }; }) };
    json.chapters.push(row);
    var parts = ['FINAL PICK: ' + (o ? o.code + ' ' + o.name + (o.hex ? ' ' + o.hex : '') : (live.length ? '(none crowned)' : '(options not ready yet)'))];
    if (pk.love.length) parts.push('LOVED (' + pk.love.length + '): ' + listLine(pk.love));
    if (pk.maybe.length) parts.push('MAYBE (' + pk.maybe.length + '): ' + listLine(pk.maybe));
    if (pk.no.length) parts.push('NO (' + pk.no.length + '): ' + listLine(pk.no));
    if (pk.notes.length) parts.push('NOTES: ' + pk.notes.map(function (x) { return x.o.code + ' "' + x.n + '"'; }).join(' · '));
    fields[key] = parts.join(' | ');
    lines.push(key); parts.forEach(function (p) { lines.push('   ' + p); }); lines.push('');
  });
  var r = reviewInfo(), rKey = pad(CH.site ? CH.site.i : 12) + ' · YOUR SITE';
  var rTxt = r.done ? 'Answered and sent separately (' + (r.done.status || 'sent') + ', ' + (r.done.at || '') + ')' : r.answered + ' of ' + r.total + ' questions answered, not sent yet';
  fields[rKey] = rTxt; lines.push(rKey, '   ' + rTxt);
  if (S.reviewText) { lines.push('   Answers so far:'); S.reviewText.split('\n').slice(4).forEach(function (l) { lines.push('   ' + l); }); }
  lines.push('');
  json.review = { answered: r.answered, total: r.total, done: r.done, text: S.reviewText || '', answers: r.raw ? r.raw.a : null };
  if (json.anything_else) { fields['ANYTHING ELSE'] = json.anything_else; lines.push('ANYTHING ELSE', '   ' + json.anything_else, ''); }
  if (finalC) fields['FINAL COLOUR'] = finalC.name + ' ' + finalC.hex;
  json.picks = S.p; json.crowns = S.crowns;
  var text = lines.join('\n').trim(), js = JSON.stringify(json);
  fields.summary = text; fields.selection_json = js;
  return { subject: C.submit.subject, email: email, submitted_at: json.submitted_at, text: text, json: js, data: json, fields: fields };
}
var LAST = null, SENT_KEY = function () { return C.storageKey + '-sent'; };
function keep(p, status) {
  try { var l = JSON.parse(localStorage.getItem(SENT_KEY()) || '[]'), i = -1; l.forEach(function (r, k) { if (r.submitted_at === p.submitted_at) i = k; });
    var rec = { submitted_at: p.submitted_at, status: status, email: p.email, text: p.text, json: p.json, fields: p.fields };
    if (i > -1) l[i] = rec; else l.push(rec); localStorage.setItem(SENT_KEY(), JSON.stringify(l.slice(-10))); } catch (e) {}
}
function postForm(fields) {
  var ctl = 'AbortController' in window ? new AbortController() : null, to = setTimeout(function () { ctl && ctl.abort(); }, 15000);
  return fetch(C.submit.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(fields), signal: ctl ? ctl.signal : undefined })
    .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { clearTimeout(to); if (r.ok && (j.success === true || j.success === 'true')) return 'sent'; throw new Error(j.message || ('HTTP ' + r.status)); }); },
      function (e) { clearTimeout(to); throw e; });
}
function send(p) {
  if (typeof window.STUDIO_SUBMIT === 'function') return Promise.resolve().then(function () { return window.STUDIO_SUBMIT(p); }).then(function () { return 'sent'; });
  if (C.submit.mode !== 'formsubmit') return Promise.resolve('local');
  return postForm(p.fields);
}
function setStatus(kind) {
  var chip = $('#chip'), t = $('#chipT'), s = $('#statusT'), acts = $('#statusActs'), em = LAST && LAST.email;
  chip.classList.toggle('busy', kind === 'busy'); acts.hidden = kind !== 'failed';
  var who = em ? ' We’ll reply to <b>' + esc(em) + '</b>.' : '';
  if (kind === 'busy') { t.textContent = 'SENDING'; s.textContent = 'One moment while we send your selection.'; }
  else if (kind === 'sent') { t.textContent = 'SENT'; s.innerHTML = 'Your selection is with us.' + who; }
  else if (kind === 'local') { t.textContent = 'SAVED'; s.innerHTML = 'Your selection is saved.' + who; }
  else { t.textContent = 'SAVED'; s.innerHTML = 'We couldn’t reach our inbox just now, so your selection is saved on this device. Try again, or copy it and send it by email.'; }
}
function submit() {
  var p = LAST; if (!p) return; setStatus('busy'); keep(p, 'sending'); window.__studioLastPayload = p;
  return send(p).then(function (r) { keep(p, r === 'sent' ? 'sent' : 'saved'); setStatus(r === 'sent' ? 'sent' : 'local'); S.done = { at: p.submitted_at, status: r }; save(true); paintRail(); },
    function (err) { console.warn('[studio] send failed, kept on this device:', err && err.message); keep(p, 'failed'); setStatus('failed'); S.done = { at: p.submitted_at, status: 'failed' }; save(true); paintRail(); });
}
var TY = { open: false };
function openThanks() {
  closeStage(true); if (BOARD.open) closeBoard();
  TY.open = true; var ov = $('#tyOv'); ov.classList.add('is-on'); D.body.style.overflow = 'hidden';
  var hot = $('#sig .hot'); if (!hot.getAttribute('src')) hot.src = $('#sig img.base').src;
  var ty = $('#ty'); ty.classList.remove('lit'); void ty.offsetWidth; ty.classList.add('lit');
  LV.suspended = true; lvSchedule(); t3layer(); t3replay($('#tyH'), 0.4);
  setTimeout(function () { $('#tyH').focus({ preventScroll: true }); }, 60);
}
function closeThanks() { TY.open = false; $('#tyOv').classList.remove('is-on'); D.body.style.overflow = ''; LV.suspended = ST.open || BOARD.open; lvSchedule(); t3layer(); }

/* ---------------------------------------------------------------- owner tools */
function copyText(t, label, idle) {
  var done = function (ok) { if (label) { label.textContent = ok ? 'COPIED' : 'COPY FAILED'; setTimeout(function () { label.textContent = idle; }, 2200); } };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(function () { done(true); }, function () { done(fallbackCopy(t)); });
  else done(fallbackCopy(t));
}
function fallbackCopy(t) { try { var ta = D.createElement('textarea'); ta.value = t; ta.style.cssText = 'position:fixed;opacity:0'; D.body.appendChild(ta); ta.select(); var ok = D.execCommand('copy'); ta.remove(); return ok; } catch (e) { return false; } }
function picksJSON() {
  var p = buildPayload().data;
  CHS.filter(crownable).forEach(function (c, k) { liveOpts(c).forEach(function (o) { if (o.file) { var row = p.chapters[k]; row.files = row.files || {}; row.files[o.code] = o.file; } }); });
  return JSON.stringify(p, null, 2);
}

/* ---------------------------------------------------------------- toast */
var toastT = 0, toastFn = null;
function toast(html, action, fn) {
  var t = $('#toast'); toastFn = fn || null;
  t.innerHTML = '<i></i><span>' + html + '</span>' + (action ? btn(action, '', 'data-toast-act') : '');
  t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('on'); }, action ? 5200 : 3200);
}

/* ---------------------------------------------------------------- events */
function accPop(open) {
  var a = $('#accPick'), b = $('#accMini'); if (open == null) open = !a.classList.contains('pop');
  open = !!(open && PHONE.matches);
  // the top bar clips its children to its cut corners, so on phones the swatches open as their own panel
  if (open && a.parentNode !== D.body) D.body.appendChild(a);
  if (!open && a.parentNode === D.body) b.parentNode.insertBefore(a, b);
  a.classList.toggle('pop', open); b.setAttribute('aria-expanded', open);
  if (ACCPOP !== open) { ACCPOP = open; t3layer(); }
}
function bind() {
  D.addEventListener('click', function (e) {
    var t = e.target, el;
    if ((el = t.closest('.sw[data-acc]'))) { setAccent(el.dataset.acc); if (PHONE.matches) accPop(false); return; }
    if (t.closest('#accMini')) { accPop(); return; }
    if ((el = t.closest('[data-toast-act]'))) { $('#toast').classList.remove('on'); if (toastFn) toastFn(); return; }
    if ((el = t.closest('.pk-seg [data-v]'))) { var r = el.closest('[data-code]'); if (r) pick(r.dataset.code, el.dataset.v); return; }
    if ((el = t.closest('[data-crown], #stgCrown'))) { var r2 = el.closest('[data-code]'); if (r2) crown(r2.dataset.code); return; }
    if ((el = t.closest('[data-shield]'))) { var tl = el.closest('.tl'); if (!FINE.matches) openStage(tl.dataset.code); else { tl.classList.add('engaged'); LV.engagedAt = scrollY || 1; LV.hover = tl; lvSchedule(); } return; }
    if ((el = t.closest('[data-replay]'))) { var rt = el.closest('.tl'); if (rt && rt.__frame) { post(rt.__frame, { cmd: 'replay' }); LV.hover = rt; lvSchedule(); } return; }
    if (t.closest('#stgReplay')) { if (ST.frame) { post(ST.frame, { cmd: 'replay' }); post(ST.frame, { cmd: 'play' }); } return; }
    if ((el = t.closest('[data-try]'))) { var r3 = el.closest('[data-code]'); if (r3) openStage(r3.dataset.code); return; }
    if ((el = t.closest('[data-use]'))) { var o = OPTS[el.closest('[data-code]').dataset.code]; if (o) setAccent(o.slug); return; }
    if ((el = t.closest('.note-tg'))) { var box = D.getElementById(el.getAttribute('aria-controls')), open = el.getAttribute('aria-expanded') !== 'true'; el.setAttribute('aria-expanded', open); box.hidden = !open; if (open) $('input', box).focus(); return; }
    if ((el = t.closest('[data-go]'))) { e.preventDefault(); if (TY.open) closeThanks(); if (BOARD.open) closeBoard(); go(el.dataset.go); return; }
    if (t.closest('[data-resume-go]')) { go(S.last || CHS[1].id, true); return; }
    if (t.closest('[data-fresh]')) {
      var cf = $('[data-confirm]'); cf.hidden = false;
      cf.innerHTML = '<span>This clears every pick and note. Are you sure?</span>' + btn('YES, START FRESH', 'sm', 'data-fresh-yes') + btn('KEEP MY PICKS', 'sm', 'data-fresh-no'); return;
    }
    if (t.closest('[data-fresh-yes]')) { var acc = S.acc; S = freshState(); S.imported = true; S.acc = acc; save(true); setAccent(acc, true); paintRail(); cur = null; show('start', true); toast('Fresh start. Every pick is cleared.'); return; }
    if (t.closest('[data-fresh-no]')) { $('[data-confirm]').hidden = true; return; }
    if (t.closest('[data-send-anyway]')) { confirmMissing = true; $('#sendf').requestSubmit ? $('#sendf').requestSubmit() : onSend({ preventDefault: function () {} }); return; }
    if (t.closest('[data-copyjson]') || t.closest('#copyJson')) { copyText(picksJSON(), $('#copyJsonL'), 'COPY PICKS AS JSON'); toast('Picks copied as JSON.'); return; }
    if (t.closest('#pdfBtn')) { paintFinish(); window.print(); return; }
    if (t.closest('#boardBtn')) { BOARD.open ? closeBoard() : openBoard(); return; }
    if (t.closest('#boardX') || t.closest('#scrim')) { closeBoard(); return; }
    if (t.closest('#boardFinish')) { closeBoard(); go('finish'); return; }
    if (t.closest('#stgX')) { closeStage(); return; }
    if (t.closest('#stgPrev')) { stageNav(-1); return; }
    if (t.closest('#stgNext')) { stageNav(1); return; }
    if (t === $('#stgBg')) { closeStage(); return; }
    if (t.closest('#retryBtn')) { submit(); return; }
    if (t.closest('#copyBtn')) { if (LAST) copyText(LAST.text + '\n\n' + LAST.json, $('#copyLab'), 'COPY MY SELECTION'); return; }
    if (t.closest('#tyBack')) { closeThanks(); go('finish'); return; }
    if (t.closest('#tyBoard')) { closeThanks(); openBoard(); return; }
    if (PHONE.matches && $('#accPick').classList.contains('pop') && !t.closest('#accPick')) accPop(false);
  });
  D.addEventListener('submit', function (e) { if (e.target.id === 'sendf') onSend(e); });
  D.addEventListener('input', function (e) {
    var t = e.target;
    if (t.matches('[data-note]')) { var r = t.closest('[data-code]'); if (r) setNote(r.dataset.code, t.value); }
    else if (t.id === 'stgNote') { var c = $('#stg').getAttribute('data-code'); if (c) setNote(c, t.value); }
    else if (t.id === 'em') { S.email = t.value.trim(); save(); if ($('#emFld').classList.contains('bad')) checkEmail(false); }
    else if (t.id === 'extra') { S.extra = t.value; save(); }
  });
  D.addEventListener('change', function (e) { if (e.target.matches('[data-note], #stgNote') && cur && cur.kind === 'finish') paintFinish(); });
  D.addEventListener('keydown', function (e) {
    var typing = /INPUT|TEXTAREA/.test((D.activeElement || {}).tagName);
    if (e.key === 'Escape') { if (ST.open) { closeStage(); e.preventDefault(); } else if (BOARD.open) closeBoard(); else if (TY.open) { closeThanks(); go('finish'); } else accPop(false); return; }
    if (ST.open && !typing) {
      if (e.key === 'ArrowRight') { stageNav(1); e.preventDefault(); }
      else if (e.key === 'ArrowLeft') { stageNav(-1); e.preventDefault(); }
      else if (/^[lmn]$/i.test(e.key)) { var c = $('#stg').getAttribute('data-code'); if (c) pick(c, { l: 'love', m: 'maybe', n: 'no' }[e.key.toLowerCase()]); }
      else if (e.key === 'Tab') trap(e, $('#stg'));
    } else if (BOARD.open && e.key === 'Tab') trap(e, $('#board'));
  });
  addEventListener('beforeprint', function () { $('#printSheet').innerHTML = sheetHTML(); });
  addEventListener('resize', function () { moveRailThumb(); if (!PHONE.matches) accPop(false); }, { passive: true });
  // pointer: tiles lean toward the cursor, the big chapter number drifts (fine pointers only)
  if (!RM && FINE.matches) {
    var raf = 0, last = null, leaned = null;
    D.addEventListener('pointermove', function (e) { last = e; if (raf) return; raf = requestAnimationFrame(function () { raf = 0; if (ST.open || BOARD.open) return;
      var f = last.target.closest && last.target.closest('.tl__face');
      if (leaned && leaned !== f) { leaned.style.removeProperty('--rx'); leaned.style.removeProperty('--ry'); var im0 = $('.tl__img img', leaned); if (im0) { im0.style.removeProperty('--px'); im0.style.removeProperty('--py'); } }
      leaned = f;
      if (f) { var r = f.getBoundingClientRect(), x = (last.clientX - r.left) / r.width - 0.5, y = (last.clientY - r.top) / r.height - 0.5;
        f.style.setProperty('--rx', (-y * 4).toFixed(2) + 'deg'); f.style.setProperty('--ry', (x * 4).toFixed(2) + 'deg');
        var im = $('.tl__img img', f); if (im) { im.style.setProperty('--px', (-x * 10).toFixed(1) + 'px'); im.style.setProperty('--py', (-y * 8).toFixed(1) + 'px'); } }
      var g = $('#stage .ghost'); if (g) { g.style.setProperty('--gx', ((last.clientX / innerWidth - 0.5) * -18).toFixed(1) + 'px'); g.style.setProperty('--gy', ((last.clientY / innerHeight - 0.5) * -12).toFixed(1) + 'px'); }
    }); }, { passive: true });
  }
}
function trap(e, root) {
  var f = $$('button:not([disabled]), input, textarea, a[href], iframe', root).filter(function (x) { return x.offsetParent !== null; });
  if (!f.length) return; var a = f[0], z = f[f.length - 1];
  if (e.shiftKey && D.activeElement === a) { z.focus(); e.preventDefault(); } else if (!e.shiftKey && D.activeElement === z) { a.focus(); e.preventDefault(); }
}

/* ---------------------------------------------------------------- boot */
function applyClient() {
  $('#wmName').textContent = C.client.name; $('#wmName').setAttribute('data-t', C.client.name);
  $('#wmSub').textContent = C.client.studioName;
  $('#logoImg').src = C.brand.logo;
  $('#tyEye').textContent = 'FOR ' + C.client.person;
  $('#tyWho').innerHTML = esc(C.client.signedBy) + ' <span>·</span> ' + esc(C.client.agency);
  $('#tyLead').textContent = 'Your final selection is in. We’ll build your ' + C.client.name + ' from these picks and come back to you with it.';
  $('#boardH').textContent = 'YOUR ' + C.client.name; $('#boardH').setAttribute('data-t', 'YOUR ' + C.client.name);
  $('#boardBtnL').textContent = 'YOUR ' + C.client.name;
  $('#boardH').style.setProperty('--w', '1');
  $('#railFoot').innerHTML = 'Your picks save as you go. <b>Leave any time</b> and pick up where you left off.';
}
function boot() {
  getJSON('config.json').then(function (cfg) {
    C = cfg; C.live = C.live || {}; C.client = C.client || {}; C.review = C.review || {}; C.brand = C.brand || {};
    applyClient();
    return Promise.all([C.brand.glyphs ? getJSON(C.brand.glyphs).catch(function () { return null; }) : null, loadManifests(), loadSets()]);
  }).then(function (r) {
    GL = r[0];
    CHS = C.chapters.map(function (c, i) { return Object.assign({ i: i }, c); }); CHS.forEach(function (c) { CH[c.id] = c; });
    S = loadState();
    buildOptions(r[1], r[2]);
    var imported = importOldPicks();
    buildAccentPicker(); setAccent(S.acc, true);
    buildRail(); lvInit(); bind();
    // the brand pieces that are always there
    t3reg($('.lg[data-type3d]'), 'chrome'); t3reg($('#wmName'), 'chrome', 0.12); t3reg($('#boardH'), 'board', 0.05); t3reg($('#tyH'), 'ty', 0.05);
    $('#boardH').style.setProperty('--w', emWidth($('#boardH').getAttribute('data-t'), 0.05).toFixed(2));
    var boot = $('#boot'); if (boot) boot.remove();
    show(chFromHash() || 'start', true);
    if (imported) setTimeout(function () { toast('We brought over <b>' + imported + ' pick' + (imported === 1 ? '' : 's') + '</b> from your earlier picks page.'); }, 1400);
    try { window.__pepSmoke = C.brand.smoke && window.PCSmoke ? window.PCSmoke($('#smoke'), { mode: 'black', offset: 8 }) : null; } catch (e) { console.warn(e); }
    startType();
    window.STUDIO = { get state() { return S; }, config: C, options: OPTS, byChapter: BY, go: go, pick: pick, crown: crown, setAccent: setAccent,
      openStage: openStage, closeStage: closeStage, openBoard: openBoard, closeBoard: closeBoard, buildPayload: buildPayload, picksJSON: picksJSON,
      live: function () { return { tiles: LV.tiles.length, loaded: LV.tiles.filter(function (t) { return t.__frame; }).length, playing: LV.tiles.filter(function (t) { return t.__playing; }).length, caps: lvCaps(), suspended: LV.suspended }; },
      current: function () { return cur && cur.id; } };
    HTML.classList.add('studio-ready');
  }).catch(function (e) {
    console.error('[studio] could not start:', e);
    var b = $('#boot .lead'); if (b) b.textContent = 'The studio could not load its settings (config.json). Please refresh the page.';
  });
}
boot();
})();

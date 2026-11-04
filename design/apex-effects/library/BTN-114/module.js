/* BTN-114 · Chrome Float. window.APX.BTN114.mount(root) -> destroy()
   root: a single .apx-b114 element, or any container (every .apx-b114 inside is enhanced).
   Auto-mounts on [data-apx="BTN-114"]. Idempotent; destroy() restores the original markup and attributes.
   Reads only --apx-* tokens. Reduced motion / --apx-motion:0 keep the glass but stop the motion. */
(function () {
  'use strict';
  var APX = (window.APX = window.APX || {});
  if (APX.BTN114 && APX.BTN114.mount) return;
  var CODE = 'BTN-114', NAME = 'Chrome Float', CLS = 'apx-b114', KEY = '__apxBTN114';
  var mm = function (q) { return window.matchMedia ? matchMedia(q) : { matches: false }; };
  var RM = mm('(prefers-reduced-motion: reduce)'), FINE = mm('(hover: hover) and (pointer: fine)');
  var NS = 'http://www.w3.org/2000/svg', UID = 0;
  function svg(tag, a) { var n = document.createElementNS(NS, tag); for (var k in a) n.setAttribute(k, a[k]); return n; }
  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function lerp(a, b, k) { return a + (b - a) * k; }

  function Ctx(el) { this.el = el; this.offs = []; this.loops = []; this.tos = []; }
  Ctx.prototype = {
    c: function (n) { return CLS + '__' + n; },
    on: function (t, ev, fn, o) { t.addEventListener(ev, fn, o); this.offs.push(function () { t.removeEventListener(ev, fn, o); }); },
    motion: function () {
      if (RM.matches) return 0;
      var v = parseFloat(getComputedStyle(this.el).getPropertyValue('--apx-motion'));
      return isNaN(v) ? 1 : Math.max(0, v);
    },
    fine: function () { return FINE.matches; },
    later: function (fn, ms) { var id = setTimeout(fn, ms); this.tos.push(id); return id; },
    // a rAF loop that sleeps: step(t) returns false to stop; kick() wakes it
    loop: function (step) {
      var id = 0;
      function f(t) { id = 0; if (step(t) !== false) id = requestAnimationFrame(f); }
      var h = { kick: function () { if (!id) id = requestAnimationFrame(f); }, stop: function () { cancelAnimationFrame(id); id = 0; } };
      this.loops.push(h); return h;
    },
    size: function (cb) {
      var el = this.el, w = -1, h = -1;
      function run() { var nw = el.offsetWidth, nh = el.offsetHeight; if (nw !== w || nh !== h) { w = nw; h = nh; if (w && h) cb(w, h); } }
      if (window.ResizeObserver) { var ro = new ResizeObserver(run); ro.observe(el); this.offs.push(function () { ro.disconnect(); }); }
      else this.on(window, 'resize', run);
      run();
    },
    // decorative node (aria-hidden), appended to parent (default el)
    dec: function (tag, name, parent, html) {
      var n = document.createElement(tag); n.className = name.split(' ').map(this.c, this).join(' ');
      n.setAttribute('aria-hidden', 'true'); if (html) n.innerHTML = html; (parent || this.el).appendChild(n); return n;
    },
    // wraps the original content in the readable label span
    label: function (name) {
      var l = document.createElement('span'); l.className = this.c(name || 'l');
      (this.orig || []).forEach(function (n) { l.appendChild(n); });
      this.el.appendChild(l); return l;
    },
    // SVG rim: edge line, specular top highlight, focus ring; set(d, w, h) in host px coords
    rim: function (host, pad) {
      var p = pad == null ? 6 : pad, id = 'apxg' + (++UID) + Math.random().toString(36).slice(2, 6);
      var s = svg('svg', { 'class': this.c('rim'), 'aria-hidden': 'true', focusable: 'false' });
      var lg = svg('linearGradient', { id: id, x1: '0', y1: '0', x2: '.35', y2: '1' });
      [['0', '.78'], ['.42', '.06'], ['1', '.3']].forEach(function (st) { lg.appendChild(svg('stop', { offset: st[0], 'stop-color': '#fff', 'stop-opacity': st[1] })); });
      var defs = svg('defs', {}); defs.appendChild(lg); s.appendChild(defs);
      var ring = svg('path', { 'class': this.c('ring') }), edge = svg('path', { 'class': this.c('edge') }), hi = svg('path', { 'class': this.c('hi'), stroke: 'url(#' + id + ')' });
      s.appendChild(ring); s.appendChild(edge); s.appendChild(hi); (host || this.el).appendChild(s);
      return {
        svg: s, paths: [ring, edge, hi], extra: function (tag, a) { var n = svg(tag, a); s.appendChild(n); return n; },
        set: function (d, w, h) {
          s.setAttribute('viewBox', (-p) + ' ' + (-p) + ' ' + (w + 2 * p) + ' ' + (h + 2 * p));
          s.style.cssText = 'position:absolute;left:' + (-p) + 'px;top:' + (-p) + 'px;width:' + (w + 2 * p) + 'px;height:' + (h + 2 * p) + 'px;overflow:visible;pointer-events:none';
          ring.setAttribute('d', d); edge.setAttribute('d', d); hi.setAttribute('d', d);
        }
      };
    },
    // shared state: .is-hot (hover / keyboard focus / touch press) and .is-press; cb(hot, press)
    states: function (cb) {
      var el = this.el, self = this, hov = false, foc = false, tch = false, prs = false, t = 0;
      function sync() { var hot = hov || foc || tch; el.classList.toggle('is-hot', hot); el.classList.toggle('is-press', prs); if (cb) cb(hot, prs); }
      this.on(el, 'pointerenter', function (e) { if (e.pointerType === 'mouse') { hov = true; sync(); } });
      this.on(el, 'pointerleave', function (e) { if (e.pointerType === 'mouse') hov = false; prs = false; sync(); });
      this.on(el, 'pointerdown', function (e) {
        prs = true; if (e.pointerType !== 'mouse') { clearTimeout(t); tch = true; } sync();
      });
      function up() { if (!prs && !tch) return; prs = false; if (tch) { clearTimeout(t); t = self.later(function () { tch = false; sync(); }, 650); } sync(); }
      this.on(el, 'pointerup', up); this.on(el, 'pointercancel', up);
      this.on(el, 'focus', function () { try { foc = el.matches(':focus-visible'); } catch (e) { foc = true; } sync(); });
      this.on(el, 'blur', function () { foc = false; prs = false; sync(); });
      this.on(el, 'keydown', function (e) { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) { prs = true; sync(); } });
      this.on(el, 'keyup', function (e) { if (e.key === ' ' || e.key === 'Enter') { prs = false; sync(); } });
      return { get hot() { return hov || foc || tch; }, get press() { return prs; } };
    },
    kill: function () {
      this.loops.forEach(function (h) { h.stop(); }); this.tos.forEach(clearTimeout);
      this.offs.forEach(function (f) { f(); }); this.offs = []; this.loops = []; this.tos = [];
    }
  };

  var T3 = APX.__chromeLift3D || (APX.__chromeLift3D = { p: null, slots: [], raf: 0 });
  var THREE_URL = window.APX_THREE_URL || 'https://cdn.jsdelivr.net/npm/three@0.185.1/build/three.module.min.js';
  function load3D() {
    if (T3.p) return T3.p;
    T3.p = import(THREE_URL).then(function (THREE) {
      var probe = document.createElement('canvas');
      if (!(probe.getContext('webgl2') || probe.getContext('webgl'))) throw new Error('no webgl');
      var dpr = Math.min(window.devicePixelRatio || 1, matchMedia('(max-width: 900px)').matches ? 1.5 : 2), S = Math.round(62 * dpr);
      var renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
      renderer.setPixelRatio(1); renderer.setSize(S, S, false); renderer.setClearColor(0x000000, 0);
      renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.15;
      // studio room for reflections: dark walls, bright strip lights, one tinted panel
      var env = new THREE.Scene(), room = new THREE.Mesh(new THREE.BoxGeometry(12, 8, 12), new THREE.MeshBasicMaterial({ color: 0x15161a, side: THREE.BackSide }));
      env.add(room);
      function panel(w, h, c, x, y, z, ry, rx) { var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.rotation.set(rx || 0, ry || 0, 0); env.add(m); }
      panel(7, 1.1, 0xffffff, 0, 3.6, -1, 0, Math.PI / 2);
      panel(1, 5, 0xf2f4f7, -5.5, 0.5, 0, Math.PI / 2);
      panel(1.4, 4, 0xe9ecf0, 5.5, 0, 1.5, -Math.PI / 2);
      var accent = new THREE.Color(T3.accent || '#e0a3ab');
      panel(5, 1.6, accent, 0, -2.6, 4, 0, -Math.PI / 3);
      var pm = new THREE.PMREMGenerator(renderer), envMap = pm.fromScene(env, .035).texture;
      var shape = new THREE.Shape(), cy = .32, R = .92, a0 = -0.62, a1 = Math.PI + 0.62;
      shape.moveTo(0, -1.32);
      shape.lineTo(Math.cos(a0) * R, cy + Math.sin(a0) * R);
      shape.absarc(0, cy, R, a0, a1, false);
      shape.lineTo(0, -1.32);
      var hole = new THREE.Path(); hole.absarc(0, cy, .36, 0, Math.PI * 2, true); shape.holes.push(hole);
      var geo = new THREE.ExtrudeGeometry(shape, { depth: .34, bevelEnabled: true, bevelThickness: .12, bevelSize: .08, bevelSegments: 6, curveSegments: 48 });
      geo.center();
      var mat = new THREE.MeshPhysicalMaterial({ color: 0xeef1f4, metalness: 1, roughness: .16, envMap: envMap, envMapIntensity: 1.2, clearcoat: .5, clearcoatRoughness: .1 });
      var mesh = new THREE.Mesh(geo, mat), scene = new THREE.Scene(); scene.add(mesh);
      var cam = new THREE.PerspectiveCamera(32, 1, .1, 50); cam.position.set(0, 0, 6.4);
      T3.draw = function (s, t) {
        mesh.rotation.set(s.rx + .12, s.ry + Math.sin(t * .0007) * .35 * s.m, 0);
        mesh.position.y = Math.sin(t * .0016) * .06 * s.m + s.lift * .5;
        var k = 1 + s.lift * .12; mesh.scale.set(k, k, k);
        renderer.render(scene, cam);
        s.c2.clearRect(0, 0, S, S); s.c2.drawImage(renderer.domElement, 0, 0);
      };
      T3.S = S;
      return T3;
    });
    return T3.p;
  }
  function tick(t) {
    T3.raf = 0; var any = false;
    if (!document.hidden && T3.draw) T3.slots.forEach(function (s) {
      if (!s.vis) return;
      s.rx = lerp(s.rx, s.trx, .1); s.ry = lerp(s.ry, s.try_, .1); s.lift = lerp(s.lift, s.tlift, .12);
      if (s.m || s.dirty) { T3.draw(s, t); s.dirty = false; }
      if (s.m) any = true;
    });
    if (any) T3.raf = requestAnimationFrame(tick);
  }
  function wake() { if (!T3.raf) T3.raf = requestAnimationFrame(tick); }
  function cssToHex(c) {
    try { var cv = document.createElement('canvas'); cv.width = cv.height = 1; var x = cv.getContext('2d'); x.fillStyle = '#e0a3ab'; x.fillStyle = c; x.fillRect(0, 0, 1, 1);
      var d = x.getImageData(0, 0, 1, 1).data; return '#' + [d[0], d[1], d[2]].map(function (v) { return ('0' + v.toString(16)).slice(-2); }).join(''); } catch (e) { return '#e0a3ab'; }
  }
  function setup(el, ctx) {
    ctx.dec('span', 'g');
    var slot = ctx.dec('span', 'slot'); ctx.dec('span', 'glow', slot); ctx.dec('span', 'shadow', slot);
    var fbid = 'apxpin' + Math.random().toString(36).slice(2, 7);
    ctx.dec('span', 'fb', slot, '<svg viewBox="0 0 24 24" width="100%" height="100%"><defs><linearGradient id="' + fbid + '" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#fbfcfd"/><stop offset=".35" stop-color="#8d939b"/><stop offset=".55" stop-color="#eef1f4"/><stop offset=".8" stop-color="#4c5159"/><stop offset="1" stop-color="#c9ced4"/></linearGradient></defs><path fill="url(#' + fbid + ')" fill-rule="evenodd" d="M12 22.5s7.2-6.4 7.2-12.3a7.2 7.2 0 1 0-14.4 0c0 5.9 7.2 12.3 7.2 12.3zm0-9.4a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z"/></svg>');
    var cv = document.createElement('canvas'); cv.className = ctx.c('cv'); cv.setAttribute('aria-hidden', 'true'); slot.appendChild(cv);
    ctx.label();
    var s = { el: el, c2: null, rx: 0, ry: 0, trx: 0, try_: 0, lift: 0, tlift: 0, m: ctx.motion(), vis: true, dirty: true };
    if (!T3.accent) T3.accent = cssToHex(getComputedStyle(el).getPropertyValue('--_acc').trim());
    var dead = false;
    load3D().then(function (T) {
      if (dead) return;
      cv.width = cv.height = T.S; s.c2 = cv.getContext('2d');
      T3.slots.push(s); el.classList.add('is-3d'); s.dirty = true; tick(performance.now()); wake();
    }).catch(function () { /* the pre-lit chrome fallback stays */ });
    if (window.IntersectionObserver) {
      var io = new IntersectionObserver(function (en) { s.vis = en[0].isIntersecting; if (s.vis) { s.dirty = true; wake(); } });
      io.observe(el); ctx.offs.push(function () { io.disconnect(); });
    }
    ctx.on(document, 'visibilitychange', function () { if (!document.hidden) { s.dirty = true; wake(); } });
    ctx.on(el, 'pointermove', function (e) {
      if (e.pointerType !== 'mouse') return;
      var b = el.getBoundingClientRect();
      s.try_ = ((e.clientX - b.left) / b.width - .5) * 1.2 * (s.m ? 1 : 0); s.trx = ((e.clientY - b.top) / b.height - .5) * .7 * (s.m ? 1 : 0); s.dirty = true; wake();
    }, { passive: true });
    ctx.states(function (hot) {
      s.m = ctx.motion(); s.tlift = hot && s.m ? 1 : 0;
      if (!hot) { s.trx = 0; s.try_ = 0; } else if (!el.matches(':hover') && s.m) { s.try_ = .5; }
      s.dirty = true; wake();
    });
    return function () { dead = true; var i = T3.slots.indexOf(s); if (i > -1) T3.slots.splice(i, 1); };
  }


  function enhance(el) {
    if (el[KEY]) return el[KEY];
    var orig = el.innerHTML, attrs = [].map.call(el.attributes, function (a) { return [a.name, a.value]; });
    var ctx = new Ctx(el), extra;
    ctx.orig = [].slice.call(el.childNodes);
    el.classList.add('is-apx');
    try { extra = setup(el, ctx); } catch (err) { ctx.kill(); el.innerHTML = orig; throw err; }
    function destroy() {
      ctx.kill(); if (typeof extra === 'function') extra();
      el.innerHTML = orig;
      [].slice.call(el.attributes).forEach(function (a) { el.removeAttribute(a.name); });
      attrs.forEach(function (a) { el.setAttribute(a[0], a[1]); });
      delete el[KEY];
    }
    el[KEY] = destroy; return destroy;
  }
  function mount(root) {
    if (!root || root.nodeType !== 1) return function () {};
    if (root[KEY + 'r']) return root[KEY + 'r'];
    var added = false;
    if (!root.classList.contains(CLS) && !root.querySelector('.' + CLS) && root.matches('button,a')) { root.classList.add(CLS); added = true; }
    var els = root.classList.contains(CLS) ? [root] : [].slice.call(root.querySelectorAll('.' + CLS));
    var ds = els.map(enhance);
    function destroy() { ds.forEach(function (d) { d(); }); if (added) root.classList.remove(CLS); delete root[KEY + 'r']; }
    root[KEY + 'r'] = destroy; return destroy;
  }
  APX.BTN114 = { code: CODE, name: NAME, mount: mount };
  APX[CODE] = APX.BTN114;
  function auto() { if (window.APX_NO_AUTOMOUNT) return; [].forEach.call(document.querySelectorAll('[data-apx~="' + CODE + '"]:not([data-apx-manual])'), function (r) { mount(r); }); }
  document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', auto) : auto();
})();

/* PEPTICITY PRINT ROOM: the drawing engine.
   ONE drawing serves the screen and the print file. Every card side and every label is drawn by the same code into a
   canvas: small for the screen, 300 dpi for the file, so what Grace sees is what the printer gets.
   Units are inches, type sizes are points. Nothing here touches the network except loading this page's own assets. */
(function () {
  'use strict';
  var P = window.PEPPRINT = window.PEPPRINT || {};
  var E = P.engine = {};

  E.DPI = 300;
  E.CARD = { w: 3.5, h: 2, bleed: 0.125, slug: 0.25 };   // trim, bleed, and the crop-mark margin outside the bleed

  /* the brand colours (owner rules): matte black, UV black, the platinum ramp, the chrome-gold ramp (accents only),
     and ONE blue: the logo's light #2a78ff with its hot core #cfe6ff */
  var C = E.C = {
    black0: '#0b0b0c', black1: '#141416', uv: '#120f1a',
    plat1: '#2a2d31', plat2: '#6b7077', plat3: '#b9bec5', plat4: '#e6e9ed', plat5: '#ffffff',
    gold1: '#332814', gold2: '#68513d', gold3: '#a4845d', gold4: '#f0e6c7', gold5: '#fef9e8',
    blue: '#2a78ff', core: '#cfe6ff',
    deep1: '#1d1f22', deep2: '#0f1011', steel: '#4a4e54', pearl: '#eceef0', mist: '#d9dde2', silver: '#e1e5e9', smoke: '#1c1e22'
  };
  E.blue = function (a) { return 'rgba(42, 120, 255, ' + a + ')'; };
  E.core = function (a) { return 'rgba(207, 230, 255, ' + a + ')'; };
  E.plat = function (a) { return 'rgba(230, 233, 237, ' + a + ')'; };
  E.ink = function (a) { return 'rgba(11, 11, 12, ' + a + ')'; };

  /* faces for lettering: platinum chrome with the logo's blue light through its waist (as the store's wordmark),
     gunmetal chrome for light card stock, chrome gold (a ramp, never one flat fill) for the few gold accents */
  var FILLS = E.FILLS = {
    chrome: [[0, C.plat5], [0.24, C.plat4], [0.40, C.plat3], [0.46, C.plat2], [0.49, C.blue], [0.51, C.core], [0.53, C.blue], [0.57, C.plat2], [0.66, C.plat3], [0.82, C.plat4], [1, C.plat3]],
    gunmetal: [[0, C.plat2], [0.22, C.plat1], [0.44, C.black1], [0.48, C.black0], [0.495, C.blue], [0.51, C.core], [0.525, C.blue], [0.55, C.black0], [0.70, C.plat1], [0.88, C.plat2], [1, C.plat1]],
    gold: [[0, C.gold5], [0.25, C.gold4], [0.46, C.gold3], [0.52, C.gold2], [0.58, C.gold3], [0.78, C.gold4], [1, C.gold3]],
    darkgold: [[0, C.gold3], [0.30, C.gold2], [0.50, C.gold1], [0.58, C.gold2], [0.80, C.gold3], [1, C.gold2]],
    platinum: [[0, C.plat4], [0.5, C.plat3], [1, C.plat4]],
    ink: [[0, C.plat1], [0.5, C.black1], [1, C.plat1]]
  };
  /* the 3D depth under a face: the same letters stepped back (as the store's .pep-header-3d), back to front */
  var DEPTH = {
    chrome: { steps: [C.plat1, C.plat2, C.deep1, C.deep2, C.black0], shadow: 'rgba(0, 0, 0, 0.85)' },
    gunmetal: { steps: [C.plat3, C.plat2, C.steel, C.plat1, C.plat1], shadow: 'rgba(11, 11, 12, 0.32)' },
    gold: { steps: [C.gold2, C.gold3, C.gold1, C.gold1, C.black0], shadow: 'rgba(0, 0, 0, 0.8)' },
    darkgold: { steps: [C.gold4, C.gold3, C.gold2, C.gold2, C.gold1], shadow: 'rgba(11, 11, 12, 0.28)' }
  };

  /* ---------------- assets: the real logo-07 renders, the textures, the fonts ---------------- */
  var A = E.assets = { p: null, word: [], tex: {} };
  E.P_META = { w: 521, h: 381, beamY: 191 };                      // assets/logo/p-front.json: frame 4 of the turn, trimmed
  E.WORD = [[259, 274], [224, 274], [246, 274], [245, 274], [60, 274], [243, 274], [69, 275], [257, 275], [276, 274]];
  function img(src) {
    return new Promise(function (res, rej) {
      var i = new Image();
      i.decoding = 'async';
      i.onload = function () { res(i); };
      i.onerror = function () { rej(new Error('could not load ' + src)); };
      i.src = src;
    });
  }
  E.isReady = false;
  E.ready = Promise.all([
    img('assets/logo/p-front.webp').then(function (i) { A.p = i; }),
    Promise.all(E.WORD.map(function (w, k) { return img('assets/logo/word-' + k + '.webp'); })).then(function (a) { A.word = a; }),
    Promise.all(['pearl', 'brushed', 'smoked', 'matte'].map(function (n) {
      return img('assets/tex/' + n + '.webp').then(function (i) { A.tex[n] = i; });
    })),
    document.fonts.load('400 40px "PepticityBlack"', 'PEPTICITY 0123456789'),
    document.fonts.load('900 40px "PepUIBlack"', 'B@'),
    document.fonts.load('500 40px "PepUI"', 'abc@.+()'),
    document.fonts.load('600 40px "PepUI"', 'abc@.+()')
  ]).then(function () { E.isReady = true; capCache = {}; });

  /* ---------------- the graphics frame: inches in, device pixels out ---------------- */
  // s = device pixels per inch; (ox, oy) = where the trim's top-left corner sits on the canvas, in pixels
  function G(ctx, s, ox, oy, w, h, bleed, opt) {
    opt = opt || {};
    this.ctx = ctx; this.s = s; this.ox = ox; this.oy = oy; this.w = w; this.h = h; this.b = bleed || 0;
    this.textOnly = !!opt.textOnly;     // proof mode: lettering only, no ground, light or pictures
    this.only = opt.only || null;       // proof mode: one item only
    this.full = opt.full || null;       // fill this canvas rect with the ground (labels: no slug to keep clear)
    this.items = [];
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
  }
  G.prototype.X = function (x) { return this.ox + x * this.s; };
  G.prototype.Y = function (y) { return this.oy + y * this.s; };
  G.prototype.L = function (v) { return v * this.s; };
  G.prototype.pt = function (p) { return p / 72 * this.s; };
  G.prototype.want = function (id, kind) {
    if (this.only) { return this.only === id; }
    if (this.textOnly) { return kind === 'text'; }
    return true;
  };
  E.G = G;

  /* draw inside a turned frame: (px, py) in inches is the pivot, deg the turn (-90 = runs up the page, as on the vial) */
  E.rotated = function (g, px, py, deg, fn) {
    var c = g.ctx;
    c.save();
    c.translate(g.X(px), g.Y(py));
    c.rotate(deg * Math.PI / 180);
    var r = Object.create(g);
    r.ox = 0; r.oy = 0; r.rot = (g.rot || 0) + deg;
    var out = fn(r);
    c.restore();
    return out;
  };

  E.lin = function (g, x0, y0, x1, y1, stops) {
    var gr = g.ctx.createLinearGradient(g.X(x0), g.Y(y0), g.X(x1), g.Y(y1));
    for (var i = 0; i < stops.length; i++) { gr.addColorStop(stops[i][0], stops[i][1]); }
    return gr;
  };
  E.rad = function (g, x, y, r, stops) {
    var gr = g.ctx.createRadialGradient(g.X(x), g.Y(y), 0, g.X(x), g.Y(y), Math.max(0.0001, g.L(r)));
    for (var i = 0; i < stops.length; i++) { gr.addColorStop(stops[i][0], stops[i][1]); }
    return gr;
  };

  // the whole sheet out to the bleed (or the whole canvas, for labels)
  E.ground = function (g, style) {
    if (!g.want('ground', 'deco')) { return; }
    var c = g.ctx;
    c.fillStyle = style;
    if (g.full) { c.fillRect(g.full[0], g.full[1], g.full[2], g.full[3]); return; }
    c.fillRect(g.X(-g.b), g.Y(-g.b), g.L(g.w + 2 * g.b), g.L(g.h + 2 * g.b));
  };
  // a Higgsfield texture laid over the ground as a neutral detail layer (soft light keeps the ground's colour)
  E.tex = function (g, name, alpha, mode) {
    if (!g.want('tex', 'deco')) { return; }
    var im = A.tex[name];
    if (!im) { return; }
    var c = g.ctx;
    var bx = g.X(-g.b), by = g.Y(-g.b), bw = g.L(g.w + 2 * g.b), bh = g.L(g.h + 2 * g.b);
    if (g.full) { bx = g.full[0]; by = g.full[1]; bw = g.full[2]; bh = g.full[3]; }
    var k = Math.max(bw / im.naturalWidth, bh / im.naturalHeight), dw = im.naturalWidth * k, dh = im.naturalHeight * k;
    c.save();
    c.beginPath(); c.rect(bx, by, bw, bh); c.clip();
    c.globalAlpha = alpha;
    c.globalCompositeOperation = mode || 'soft-light';
    c.drawImage(im, bx + (bw - dw) / 2, by + (bh - dh) / 2, dw, dh);
    c.restore();
  };

  /* ---------------- shapes ---------------- */
  E.path = function (g, pts) {
    var c = g.ctx;
    c.beginPath();
    for (var i = 0; i < pts.length; i++) {
      if (i) { c.lineTo(g.X(pts[i][0]), g.Y(pts[i][1])); } else { c.moveTo(g.X(pts[i][0]), g.Y(pts[i][1])); }
    }
    c.closePath();
  };
  // a cut-corner outline: cuts = [top-left, top-right, bottom-right, bottom-left] in inches
  E.cut = function (x, y, w, h, cuts) {
    var a = cuts[0], b = cuts[1], d = cuts[2], e = cuts[3];
    var pts = [[x + a, y], [x + w - b, y], [x + w, y + b], [x + w, y + h - d], [x + w - d, y + h], [x + e, y + h], [x, y + h - e], [x, y + a]];
    // a corner with no cut gives the same point twice: drop it, so no join is drawn on a zero-length edge
    return pts.filter(function (p, i) {
      var q = pts[(i + pts.length - 1) % pts.length];
      return Math.abs(p[0] - q[0]) > 1e-9 || Math.abs(p[1] - q[1]) > 1e-9;
    });
  };
  E.fill = function (g, pts, style, id) {
    if (!g.want(id || 'deco', 'deco')) { return; }
    E.path(g, pts);
    g.ctx.fillStyle = style;
    g.ctx.fill();
  };
  E.stroke = function (g, pts, style, lw, id) {
    if (!g.want(id || 'deco', 'deco')) { return; }
    E.path(g, pts);
    g.ctx.lineWidth = Math.max(0.6, g.L(lw));
    g.ctx.lineJoin = 'miter';
    g.ctx.strokeStyle = style;
    g.ctx.stroke();
  };
  E.line = function (g, x0, y0, x1, y1, style, lw, id) {
    if (!g.want(id || 'deco', 'deco')) { return; }
    var c = g.ctx;
    c.beginPath();
    c.moveTo(g.X(x0), g.Y(y0));
    c.lineTo(g.X(x1), g.Y(y1));
    c.lineWidth = Math.max(0.6, g.L(lw));
    c.strokeStyle = style;
    c.lineCap = 'butt';
    c.stroke();
  };
  // a chrome rule: a thin bar with a chrome (or gold) ramp along it
  E.rule = function (g, x0, x1, y, th, kind, id) {
    if (!g.want(id || 'deco', 'deco')) { return; }
    var stops = kind === 'gold' ? [[0, 'rgba(164, 132, 93, 0)'], [0.15, C.gold3], [0.5, C.gold5], [0.85, C.gold3], [1, 'rgba(164, 132, 93, 0)']]
      : kind === 'darkgold' ? [[0, 'rgba(104, 81, 61, 0)'], [0.12, C.gold2], [0.5, C.gold3], [0.88, C.gold2], [1, 'rgba(104, 81, 61, 0)']]
      : kind === 'ink' ? [[0, 'rgba(42, 45, 49, 0)'], [0.15, C.plat2], [0.5, C.plat1], [0.85, C.plat2], [1, 'rgba(42, 45, 49, 0)']]
      : [[0, 'rgba(185, 190, 197, 0)'], [0.15, C.plat3], [0.5, C.plat4], [0.85, C.plat3], [1, 'rgba(185, 190, 197, 0)']];
    g.ctx.fillStyle = E.lin(g, x0, y, x1, y, stops);
    g.ctx.fillRect(g.X(x0), g.Y(y - th / 2), g.L(x1 - x0), Math.max(0.8, g.L(th)));
  };

  /* the logo's light: a lens of blue fattest in the middle and tapering to points, its hot core in the centre and a
     soft glow round it (the light through the P's waist, and its accent under the word) */
  E.beam = function (g, x0, x1, y, th, o) {
    o = o || {};
    if (!g.want(o.id || 'beam', 'deco')) { return; }
    var c = g.ctx, cx = (x0 + x1) / 2, a = o.alpha == null ? 1 : o.alpha;
    var rx = Math.max(1, g.L((x1 - x0) / 2)), ry = Math.max(1, g.L(th * (o.spread || 7)));
    c.save();
    c.translate(g.X(cx), g.Y(y));
    c.scale(1, ry / rx);
    var gr = c.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, E.blue(0.32 * a));
    gr.addColorStop(0.45, E.blue(0.12 * a));
    gr.addColorStop(1, E.blue(0));
    c.fillStyle = gr;
    c.fillRect(-rx, -rx, 2 * rx, 2 * rx);
    c.restore();
    c.save();
    c.shadowColor = E.blue(0.9 * a);
    c.shadowBlur = Math.max(2, g.L(th * 3));
    E.path(g, [[x0, y], [cx, y - th / 2], [x1, y], [cx, y + th / 2]]);
    c.fillStyle = E.lin(g, x0, y, x1, y, [[0, E.blue(0)], [0.18, E.blue(0.85 * a)], [0.5, E.core(a)], [0.82, E.blue(0.85 * a)], [1, E.blue(0)]]);
    c.fill();
    c.restore();
  };
  // a soft pool of the logo's light (rx, ry: an ellipse)
  E.glow = function (g, x, y, rx, ry, a, id) {
    if (!g.want(id || 'glow', 'deco')) { return; }
    var c = g.ctx, R = Math.max(1, g.L(rx));
    c.save();
    c.translate(g.X(x), g.Y(y));
    c.scale(1, Math.max(0.01, ry / rx));
    var gr = c.createRadialGradient(0, 0, 0, 0, 0, R);
    gr.addColorStop(0, E.blue(a));
    gr.addColorStop(0.4, E.blue(a * 0.45));
    gr.addColorStop(1, E.blue(0));
    c.fillStyle = gr;
    c.fillRect(-R, -R, 2 * R, 2 * R);
    c.restore();
  };

  /* ---------------- the logo: real renders only, never redrawn ---------------- */
  E.P_AR = E.P_META.w / E.P_META.h;
  // the front P fitted into a box; returns where it landed, and where its waist light runs (beamY)
  E.placeP = function (x, y, w, h, o) {
    o = o || {};
    var dw = w, dh = w / E.P_AR;
    if (dh > h) { dh = h; dw = h * E.P_AR; }
    var dx = x + (w - dw) * (o.ax == null ? 0.5 : o.ax), dy = y + (h - dh) * (o.ay == null ? 0.5 : o.ay);
    return { id: o.id || 'p', kind: 'img', box: { x: dx, y: dy, w: dw, h: dh }, beamY: dy + dh * E.P_META.beamY / E.P_META.h };
  };
  E.drawP = function (g, x, y, w, h, o) {
    o = o || {};
    var r = E.placeP(x, y, w, h, o);
    if (g.want(r.id, 'img') && A.p) {
      var c = g.ctx;
      if (o.alpha != null && o.alpha < 1) { c.save(); c.globalAlpha = o.alpha; }
      c.drawImage(A.p, g.X(r.box.x), g.Y(r.box.y), g.L(r.box.w), g.L(r.box.h));
      if (o.alpha != null && o.alpha < 1) { c.restore(); }
    }
    g.items.push(r);
    return r;
  };
  // the nine letters of the word, as rendered by the logo engine; h = letter height in inches
  E.WORD_GAP = 0.1;
  E.wordWidth = function (h, gap) {
    var sum = 0;
    for (var i = 0; i < 9; i++) { sum += E.WORD[i][0] / 274; }
    return sum * h + (gap == null ? E.WORD_GAP : gap) * h * 8;
  };
  E.drawWord = function (g, x, y, h, o) {
    o = o || {};
    var gap = o.gap == null ? E.WORD_GAP : o.gap, tw = E.wordWidth(h, gap), sx = x;
    if (o.align === 'center') { sx = x - tw / 2; } else if (o.align === 'right') { sx = x - tw; }
    var r = { id: o.id || 'word', kind: 'img', box: { x: sx, y: y, w: tw, h: h * 275 / 274 } };
    if (g.want(r.id, 'img') && A.word.length === 9) {
      var px = sx;
      for (var i = 0; i < 9; i++) {
        var lw = E.WORD[i][0] / 274 * h, lh = E.WORD[i][1] / 274 * h;
        g.ctx.drawImage(A.word[i], g.X(px), g.Y(y), g.L(lw), g.L(lh));
        px += lw + gap * h;
      }
    }
    g.items.push(r);
    return r;
  };

  /* ---------------- lettering ---------------- */
  var FONTS = {
    display: function (px) { return '400 ' + px + 'px "PepticityBlack", "PepUIBlack"'; },
    ui: function (px) { return '500 ' + px + 'px "PepUI"'; },
    ui6: function (px) { return '600 ' + px + 'px "PepUI"'; },
    black: function (px) { return '900 ' + px + 'px "PepUIBlack"'; }
  };
  function setFont(c, kind, px) { c.font = FONTS[kind] ? FONTS[kind](px) : FONTS.display(px); }
  var capCache = {};
  function capRatio(c, kind) {
    if (capCache[kind]) { return capCache[kind]; }
    setFont(c, kind, 100);
    var v = c.measureText('H').actualBoundingBoxAscent / 100;
    if (E.isReady && v > 0.3) { capCache[kind] = v; }
    return v > 0.3 ? v : 0.72;
  }
  E.capRatio = function (kind) { return capRatio(E.scratch(), kind || 'display'); };
  var scratchCanvas = null;
  E.scratch = function () {
    if (!scratchCanvas) { scratchCanvas = document.createElement('canvas'); scratchCanvas.width = scratchCanvas.height = 8; }
    return scratchCanvas.getContext('2d');
  };

  // one line at px: pen positions per glyph when tracked (kerning kept when not tracked)
  function runOf(c, str, kind, px, track) {
    setFont(c, kind, px);
    var tr = (track || 0) * px;
    if (!str) { return { px: px, adv: 0, l: 0, r: 0, asc: 0, desc: 0, xs: null, ch: null }; }
    if (!tr) {
      var m = c.measureText(str);
      return { px: px, adv: m.width, l: m.actualBoundingBoxLeft, r: m.actualBoundingBoxRight, asc: m.actualBoundingBoxAscent, desc: m.actualBoundingBoxDescent, xs: null, ch: null };
    }
    var ch = Array.from(str), xs = [], x = 0, l = 0, r = -Infinity, asc = 0, desc = 0;
    for (var i = 0; i < ch.length; i++) {
      var mm = c.measureText(ch[i]);
      xs.push(x);
      if (i === 0) { l = mm.actualBoundingBoxLeft; }
      if (ch[i] !== ' ') { r = Math.max(r, x + mm.actualBoundingBoxRight); }
      asc = Math.max(asc, mm.actualBoundingBoxAscent);
      desc = Math.max(desc, mm.actualBoundingBoxDescent);
      x += mm.width + tr;
    }
    if (r === -Infinity) { r = 0; }
    return { px: px, adv: x - tr, l: l, r: r, asc: asc, desc: desc, xs: xs, ch: ch };
  }
  E.measure = function (str, o) {
    o = o || {};
    var R = runOf(E.scratch(), str, o.font || 'display', o.px || 100, o.track || 0);
    return R;
  };

  function faceStyle(c, fill, y0, y1) {
    var stops = FILLS[fill];
    if (!stops) { return fill; }
    var gr = c.createLinearGradient(0, y0, 0, y1);
    for (var i = 0; i < stops.length; i++) { gr.addColorStop(stops[i][0], stops[i][1]); }
    return gr;
  }

  E.clean = function (str, upper) {
    str = String(str == null ? '' : str).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').trim();
    return upper === false ? str : str.toUpperCase();
  };

  /* E.text(g, str, x, y, o): one line of lettering.
     x, y: the anchor in inches. o.align left | center | right puts the INK's edge or middle on x.
     o.v: 'center' (y = middle of the capitals, the default) | 'base' (y = baseline) | 'top' (y = top of the capitals).
     o.pt: size in points; o.maxW / o.maxH: the most room the ink may take, in inches (the size shrinks to fit, never
     overflows). o.track: letter spacing in em. o.font: display | ui | ui6 | black.
     o.fill: chrome | gunmetal | gold | darkgold | platinum | ink | a colour. o.depth: steps of 3D depth (0-5).
     o.glow: alpha of the logo-blue glow behind. o.rot: turn in degrees (-90 runs up the page).
     Returns { box (inches, in the frame drawn in), pt (the size used) }. */
  E.text = function (g, str, x, y, o) {
    o = o || {};
    str = E.clean(str, o.upper);
    var id = o.id || 'text';
    var res = { id: id, kind: 'text', text: str, box: null, pt: 0 };
    if (!str) { return res; }
    var c = g.ctx, kind = o.font || 'display', track = o.track || 0;
    var depth = Math.max(0, Math.min(5, o.depth || 0)), step = 0.02;
    var rot = o.rot || 0, rad = rot * Math.PI / 180;
    // the depth's reach in the lettering's own frame: down and right ON THE PAGE, whatever way the lettering turns
    var tot = (g.rot || 0) * Math.PI / 180 + rad, cs = Math.cos(-tot), sn = Math.sin(-tot);
    var reachAt = function (pxs) { var a = depth * step * pxs, b = a * 1.2; return [a * cs - b * sn, a * sn + b * cs]; };
    var R = runOf(c, str, kind, g.pt(o.pt || 10), track);
    var limW = o.maxW ? g.L(o.maxW) : Infinity, limH = o.maxH ? g.L(o.maxH) : Infinity;
    for (var guard = 0; guard < 10; guard++) {
      var rr = reachAt(R.px);
      var inkW = R.l + R.r + Math.abs(rr[0]);
      var inkH = R.asc + R.desc + Math.abs(rr[1]);
      var k = Math.min(limW / Math.max(inkW, 0.001), limH / Math.max(inkH, 0.001));
      if (k >= 1) { break; }
      R = runOf(c, str, kind, R.px * k * 0.992, track);
    }
    var px = R.px, dR = reachAt(px), dX = dR[0], dY = dR[1];
    var cap = capRatio(c, kind) * px;
    // vertical: base is the baseline's offset from y
    var base = o.v === 'base' ? 0 : o.v === 'top' ? cap : cap / 2;
    if (o.v === 'ink') { base = (R.asc - R.desc) / 2 - dY / 2; }      // the ink and its depth centred on y
    // horizontal: org is the pen's start; the ink and its depth together sit on x
    var org = o.align === 'center' ? -(R.r - R.l) / 2 - dX / 2
      : o.align === 'right' ? -R.r - Math.max(0, dX)
      : R.l - Math.min(0, dX);
    var st = px * step;
    if (g.want(id, 'text')) {
      var proof = g.textOnly || !!g.only;
      var fill = o.fill || 'chrome', D = DEPTH[fill];
      c.save();
      c.translate(g.X(x), g.Y(y));
      if (rot) { c.rotate(rad); }
      c.textAlign = 'left';
      c.textBaseline = 'alphabetic';
      setFont(c, kind, px);
      var paint = function (dx, dy) {
        if (!R.xs) { c.fillText(str, org + dx, base + dy); return; }
        for (var i = 0; i < R.ch.length; i++) {
          if (R.ch[i] !== ' ') { c.fillText(R.ch[i], org + R.xs[i] + dx, base + dy); }
        }
      };
      // each step of the depth, down and right on the page (one light for the whole card)
      var off = function (k2) { var sx = k2 * st, sy = k2 * st * 1.2; return [sx * cs - sy * sn, sx * sn + sy * cs]; };
      if (o.glow && !proof) {
        c.save();
        c.shadowColor = E.blue(o.glow);
        c.shadowBlur = px * 0.55;
        c.fillStyle = E.blue(Math.min(1, o.glow * 1.3));
        paint(0, 0);
        c.restore();
      }
      if (depth && D) {
        if (!proof) {
          c.save();
          var od = off(depth);
          c.shadowColor = D.shadow;
          c.shadowOffsetX = 0.1 * px;
          c.shadowOffsetY = 0.15 * px;
          c.shadowBlur = 0.14 * px;
          c.fillStyle = D.steps[D.steps.length - 1];
          paint(od[0], od[1]);
          c.restore();
        }
        for (var k3 = depth; k3 >= 1; k3--) {
          var o3 = off(k3);
          c.fillStyle = D.steps[Math.min(k3 - 1, D.steps.length - 1)];
          paint(o3[0], o3[1]);
        }
      }
      c.fillStyle = faceStyle(c, fill, base - cap, base);
      paint(0, 0);
      c.restore();
    }
    // the ink box, depth included, back in inches
    var bx0 = org - R.l, bx1 = org + R.r, by0 = base - R.asc, by1 = base + R.desc;
    var corners = [[bx0, by0], [bx1, by0], [bx1, by1], [bx0, by1]];
    if (depth) {
      corners = corners.concat(corners.map(function (p) { return [p[0] + dX, p[1] + dY]; }));
    }
    var cr = Math.cos(rad), sr = Math.sin(rad), minx = Infinity, miny = Infinity, maxx = -Infinity, maxy = -Infinity;
    corners.forEach(function (p) {
      var X = p[0] * cr - p[1] * sr, Y = p[0] * sr + p[1] * cr;
      minx = Math.min(minx, X); maxx = Math.max(maxx, X); miny = Math.min(miny, Y); maxy = Math.max(maxy, Y);
    });
    res.box = { x: x + minx / g.s, y: y + miny / g.s, w: (maxx - minx) / g.s, h: (maxy - miny) / g.s };
    res.pt = px / g.s * 72;
    g.items.push(res);
    return res;
  };

  /* the largest size (in points) at which a line fits a box, checked against the real ink */
  // measured at 100 px: ink in inches at P points = ink100 / 100 * P / 72
  E.fitPt = function (str, kind, track, w, h, depth) {
    var R = runOf(E.scratch(), str, kind, 100, track);
    var dd = (depth || 0) * 0.02 * 1.2;          // the larger of the depth's two reaches, so a turned line fits too
    var inkW = R.l + R.r + dd * 100, inkH = R.asc + R.desc + dd * 100;
    if (inkW <= 0 || inkH <= 0) { return 0; }
    return Math.min(w * 72 * 100 / inkW, h * 72 * 100 / inkH);
  };

  /* ---------------- print files ---------------- */
  var CRC = null;
  function crc32(bytes) {
    if (!CRC) {
      CRC = new Uint32Array(256);
      for (var n = 0; n < 256; n++) {
        var cc = n;
        for (var k = 0; k < 8; k++) { cc = cc & 1 ? 0xedb88320 ^ (cc >>> 1) : cc >>> 1; }
        CRC[n] = cc >>> 0;
      }
    }
    var crc = 0xffffffff;
    for (var i = 0; i < bytes.length; i++) { crc = CRC[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8); }
    return (crc ^ 0xffffffff) >>> 0;
  }
  E.crc32 = crc32;
  // a PNG that says 300 dpi inside it (a pHYs chunk after IHDR), so print software opens it at the true size
  E.pngBlob = function (canvas, dpi) {
    return new Promise(function (res, rej) {
      canvas.toBlob(function (blob) {
        if (!blob) { rej(new Error('the browser could not make the PNG')); return; }
        blob.arrayBuffer().then(function (ab) {
          var src = new Uint8Array(ab);
          var ppm = Math.round(dpi / 0.0254);
          var ch = new Uint8Array(21), dv = new DataView(ch.buffer);
          dv.setUint32(0, 9);
          ch.set([0x70, 0x48, 0x59, 0x73], 4);
          dv.setUint32(8, ppm);
          dv.setUint32(12, ppm);
          ch[16] = 1;
          dv.setUint32(17, crc32(ch.subarray(4, 17)));
          var out = new Uint8Array(src.length + 21);
          out.set(src.subarray(0, 33), 0);
          out.set(ch, 33);
          out.set(src.subarray(33), 54);
          res(new Blob([out], { type: 'image/png' }));
        }, rej);
      }, 'image/png');
    });
  };
  E.download = function (blob, name) {
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 8000);
  };
  // crop marks: hairlines on the trim lines, outside the bleed, in the slug
  E.cropMarks = function (g) {
    var c = g.ctx, b = g.b, gap = 0.0625, end = b + E.CARD.slug, w = g.w, h = g.h;
    c.save();
    c.strokeStyle = '#000000';
    c.lineWidth = Math.max(1, g.L(0.0035));
    c.beginPath();
    [[0, 0, -1, -1], [w, 0, 1, -1], [w, h, 1, 1], [0, h, -1, 1]].forEach(function (k) {
      var x = k[0], y = k[1], sx = k[2], sy = k[3];
      c.moveTo(g.X(x), g.Y(y + sy * (b + gap))); c.lineTo(g.X(x), g.Y(y + sy * end));
      c.moveTo(g.X(x + sx * (b + gap)), g.Y(y)); c.lineTo(g.X(x + sx * end), g.Y(y));
    });
    c.stroke();
    c.restore();
  };
})();

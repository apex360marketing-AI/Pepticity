/* PEPTICITY PRINT ROOM: the label maker.
   A label re-fits to whatever size is typed. TALL labels run PEPTICITY up the side like the vial (the P stays upright),
   WIDE wrap-around labels lay everything out sideways, near-square labels stack. Every line is fitted to its own box
   against its real ink, so nothing overflows or gets cut at any size.
   Content, and nothing else: the P, PEPTICITY, the product NAME and SIZE, LOT [ ] and EXP [ ] blanks, and one line
   reading [COUNSEL TO CONFIRM REQUIRED LABEL TEXT]. */
(function () {
  'use strict';
  var P = window.PEPPRINT, E = P.engine, C = E.C;
  var COUNSEL = '[COUNSEL TO CONFIRM REQUIRED LABEL TEXT]';
  var BLEED = 0.0625;
  var WORD_AR = E.wordWidth(1);          // the nine letters: inches of width per inch of letter height
  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  /* ---------------- layout: boxes in inches ---------------- */
  function layout(w, h) {
    var r = w / h, mode = r >= 1.6 ? 'wide' : r <= 0.625 ? 'tall' : 'square';
    var fw = mode === 'tall' ? h : w, fh = mode === 'tall' ? w : h;      // the frame the lines are laid in
    var m = clamp(Math.min(w, h) * 0.075, 0.03, 0.14);                   // safe margin inside the trim
    var x0 = m, y0 = m, iw = fw - 2 * m, ih = fh - 2 * m;
    var items = [];
    function put(id, kind, x, y, bw, bh, extra) {
      var it = { id: id, kind: kind, box: { x: x, y: y, w: bw, h: bh } };
      for (var k in extra) { if (Object.prototype.hasOwnProperty.call(extra, k)) { it[k] = extra[k]; } }
      items.push(it);
      return it;
    }
    if (mode === 'square') {
      var gap = ih * 0.035;
      var rows = [['p', 0.30], ['word', 0.12], ['name', 0.17], ['size', 0.09], ['blanks', 0.16], ['counsel', 0.06]];
      var sum = 0;
      rows.forEach(function (rw) { sum += rw[1]; });
      var avail = ih - gap * (rows.length - 1), y = y0;
      rows.forEach(function (rw) {
        var rh = avail * rw[1] / sum;
        if (rw[0] === 'blanks') {
          var half = (iw - gap) / 2;
          put('lot', 'blank', x0, y, half, rh, { label: 'LOT' });
          put('exp', 'blank', x0 + half + gap, y, half, rh, { label: 'EXP' });
        } else if (rw[0] === 'counsel') {
          put('counsel', 'line', x0, y, iw, rh, { text: COUNSEL });
        } else {
          put(rw[0], rw[0], x0, y, iw, rh, { align: 'center' });
        }
        y += rh + gap;
      });
    } else {
      var g2 = Math.min(iw, ih) * 0.06;
      var colGap = Math.min(iw, ih) * 0.12;                 // clear air between the lettering and the blanks
      var ch = ih * 0.13;                                   // the counsel line runs along the foot
      var mh = ih - ch - g2;                                // the main band
      var pW = Math.min(mh * 1.05, iw * 0.24);
      var bW = Math.min(iw * 0.24, Math.max(mh * 0.9, iw * 0.16));
      var tW = iw - pW - bW - g2 - colGap;
      put('p', 'p', x0, y0, pW, mh, {});
      var tx = x0 + pW + g2, rg = mh * 0.06, rest = mh - 2 * rg;
      var wordH = rest * 0.32, nameH = rest * 0.44, sizeH = rest * 0.24;
      put('word', 'word', tx, y0, tW, wordH, { align: 'left' });
      put('name', 'name', tx, y0 + wordH + rg, tW, nameH, { align: 'left' });
      put('size', 'size', tx, y0 + wordH + nameH + 2 * rg, tW, sizeH, { align: 'left' });
      var bx = tx + tW + colGap, bh = (mh - g2) / 2;
      put('lot', 'blank', bx, y0, bW, bh, { label: 'LOT' });
      put('exp', 'blank', bx, y0 + bh + g2, bW, bh, { label: 'EXP' });
      put('counsel', 'line', x0, y0 + mh + g2, iw, ch, { text: COUNSEL, align: 'left' });
    }
    // every box also in label space (the frame is turned a quarter for tall labels: frame (u, v) -> label (v, h - u))
    items.forEach(function (it) {
      var b = it.box;
      it.lbox = mode === 'tall' ? { x: b.y, y: h - (b.x + b.w), w: b.h, h: b.w } : { x: b.x, y: b.y, w: b.w, h: b.h };
    });
    return { mode: mode, w: w, h: h, fw: fw, fh: fh, m: m, items: items };
  }

  /* ---------------- fitting the lines ---------------- */
  // the product name on one line, or on two if that lets it be bigger
  function fitName(text, bw, bh, depth) {
    var one = E.fitPt(text, 'display', 0.04, bw, bh * 0.94, depth);
    var best = { lines: [text], pt: one };
    var words = text.split(' ');
    if (words.length > 1) {
      var lg = bh * 0.12;
      for (var k = 1; k < words.length; k++) {
        var a = words.slice(0, k).join(' '), b = words.slice(k).join(' ');
        var lh = (bh - lg) / 2;
        var pt = Math.min(E.fitPt(a, 'display', 0.04, bw, lh * 0.94, depth), E.fitPt(b, 'display', 0.04, bw, lh * 0.94, depth));
        if (pt > best.pt * 1.12) { best = { lines: [a, b], pt: pt, lh: lh, lg: lg }; }
      }
    }
    return best;
  }

  /* ---------------- drawing ---------------- */
  function drawItems(g, lay, tone, product) {
    var light = tone === 'light';
    var face = light ? 'gunmetal' : 'chrome';
    var quiet = light ? 'ink' : 'platinum';
    var smallFill = light ? C.plat1 : C.plat3;
    var sizes = [], namePt = 0;
    // the most a supporting line may grow: a share of the name's size (so the name leads), never held under a floor
    function under(share, floor) { return namePt ? Math.max(namePt * share, floor) : Infinity; }
    function textIn(it, str, kind, track, fill, depth, alignOverride, capPt) {
      var b = it.box;
      var pt = E.fitPt(str, kind, track, b.w, b.h, depth) * 0.97;
      if (capPt) { pt = Math.min(pt, capPt); }
      if (!(pt > 0)) { return null; }
      var al = alignOverride || it.align || 'center';
      var x = al === 'left' ? b.x : al === 'right' ? b.x + b.w : b.x + b.w / 2;
      var r = E.text(g, str, x, b.y + b.h / 2, { id: it.id, font: kind, pt: pt, track: track, fill: fill, depth: depth, align: al, v: 'ink', maxW: b.w, maxH: b.h, upper: true });
      sizes.push(r.pt);
      return r;
    }
    lay.items.forEach(function (it) {
      var b = it.box;
      if (it.kind === 'p') { return; }                      // the P is drawn upright, after the turn
      if (it.kind === 'word') {
        var wh = Math.min(b.h, b.w / WORD_AR);
        var wx = it.align === 'left' ? b.x : b.x + (b.w - wh * WORD_AR) / 2;
        E.drawWord(g, wx, b.y + (b.h - wh * 275 / 274) / 2, wh, { id: 'word' });
        return;
      }
      if (it.kind === 'name') {
        var text = E.clean(product.name);
        if (!text) { return; }
        var dep = 2, fit = fitName(text, b.w, b.h, dep);
        if (fit.lines.length === 1) {
          var r1 = textIn(it, text, 'display', 0.04, face, dep);
          namePt = r1 ? r1.pt : 0;
        } else {
          var y1 = b.y, sub = function (str, yy, cap) {
            return textIn({ id: it.id, box: { x: b.x, y: yy, w: b.w, h: fit.lh }, align: it.align }, str, 'display', 0.04, face, dep, null, cap);
          };
          var ra = sub(fit.lines[0], y1);
          var rb = sub(fit.lines[1], y1 + fit.lh + fit.lg, ra ? ra.pt : null);     // both lines the same size
          namePt = Math.min(ra ? ra.pt : Infinity, rb ? rb.pt : Infinity);
          if (!isFinite(namePt)) { namePt = 0; }
        }
        return;
      }
      if (it.kind === 'size') {
        var sz = E.clean(product.size);
        if (sz) { textIn(it, sz, 'display', 0.12, quiet, 0, null, under(0.62, 7)); }
        return;
      }
      if (it.kind === 'line') {
        textIn(it, it.text, 'ui6', 0.04, smallFill, 0, null, under(0.32, 6));
        return;
      }
      if (it.kind === 'blank') {
        // the word (LOT or EXP) and an empty field to write or stamp in
        var side = b.w / b.h >= 2.2, lb, fb;
        if (side) {
          lb = { x: b.x, y: b.y, w: b.w * 0.3, h: b.h };
          fb = { x: b.x + b.w * 0.34, y: b.y, w: b.w * 0.66, h: b.h };
        } else {
          lb = { x: b.x, y: b.y, w: b.w, h: b.h * 0.34 };
          fb = { x: b.x, y: b.y + b.h * 0.42, w: b.w, h: b.h * 0.58 };
        }
        textIn({ id: it.id, box: lb, align: 'left' }, it.label, 'display', 0.14, quiet, 0, null, under(0.4, 6));
        if (g.want(it.id, 'text')) {
          // the rim is stroked inside the field's own box (inset by the line width), so it never reaches past it
          var c = g.ctx, lw = Math.max(0.75, g.L(0.006)), ins = lw / g.s;
          var fx = fb.x + ins, fy = fb.y + ins, fw2 = Math.max(0.001, fb.w - 2 * ins), fh2 = Math.max(0.001, fb.h - 2 * ins);
          var k = Math.min(fh2, fw2) * 0.22, pts = E.cut(fx, fy, fw2, fh2, [k, 0, k, 0]);
          E.path(g, pts);
          c.fillStyle = light ? 'rgba(255, 255, 255, 0.55)' : C.plat4;
          c.fill();
          c.lineWidth = lw;
          c.lineJoin = 'miter';
          c.miterLimit = 2;
          c.strokeStyle = light ? C.plat2 : C.plat3;
          c.stroke();
        }
      }
    });
    return sizes;
  }

  /* draw a label. opt: { scale (px per inch), ox, oy, full: [x, y, w, h] the canvas rect to fill with the ground,
     tone: 'dark' | 'light', only: an item id (proof), bleed: inches drawn past the trim } */
  function draw(canvas, w, h, product, opt) {
    opt = opt || {};
    var c = canvas.getContext('2d');
    var lay = layout(w, h);
    var g = new E.G(c, opt.scale, opt.ox || 0, opt.oy || 0, w, h, opt.bleed || 0, { only: opt.only, full: opt.full });
    var light = opt.tone === 'light';
    c.setTransform(1, 0, 0, 1, 0, 0);
    c.clearRect(0, 0, canvas.width, canvas.height);
    // the stock
    if (light) {
      E.ground(g, E.lin(g, 0, 0, w, h, [[0, '#e6e9ed'], [1, '#d9dde2']]));
      E.tex(g, 'pearl', 0.8);
    } else {
      E.ground(g, E.lin(g, 0, 0, 0, h, [[0, C.black1], [0.6, C.black0], [1, C.black0]]));
      E.tex(g, 'matte', 0.7);
    }
    var pItem = null;
    lay.items.forEach(function (it) { if (it.kind === 'p') { pItem = it; } });
    if (pItem && !opt.only) {
      var lb0 = pItem.lbox;
      E.glow(g, lb0.x + lb0.w / 2, lb0.y + lb0.h / 2, Math.max(lb0.w, lb0.h) * 0.75, Math.max(lb0.w, lb0.h) * 0.6, light ? 0.12 : 0.16);
    }
    var sizes;
    if (lay.mode === 'tall') {
      sizes = E.rotated(g, 0, h, -90, function (r) { return drawItems(r, lay, opt.tone, product); });
    } else {
      sizes = drawItems(g, lay, opt.tone, product);
    }
    if (pItem) {
      var lb = pItem.lbox;
      E.drawP(g, lb.x, lb.y, lb.w, lb.h, { id: 'p' });
    }
    lay.smallestPt = sizes.length ? Math.min.apply(null, sizes) : 0;
    lay.g = g;
    return lay;
  }

  // the print file: the exact size typed at 300 dpi, plus the bleed if asked
  function exportCanvas(w, h, product, opt) {
    opt = opt || {};
    var s = E.DPI, bp = opt.bleed ? Math.round(BLEED * s) : 0;
    var cv = document.createElement('canvas');
    cv.width = Math.round(w * s) + 2 * bp;
    cv.height = Math.round(h * s) + 2 * bp;
    var lay = draw(cv, w, h, product, { scale: s, ox: bp, oy: bp, full: [0, 0, cv.width, cv.height], tone: opt.tone, bleed: bp / s });
    return { canvas: cv, layout: lay, bleedPx: bp };
  }

  P.labels = { layout: layout, draw: draw, exportCanvas: exportCanvas, COUNSEL: COUNSEL, BLEED: BLEED };
})();

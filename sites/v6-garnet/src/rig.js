/* PEPTICITY vial rig (VIA-01 · Label Turn, ANA-02 · Photo Anatomy).
   Draws the real photographed vial and wraps the flat label artwork around its glass
   with cylinder maths, lighting from the photo, the far-side print seen through the glass,
   a slab reflection, a lift-off cap and a print that can peel away flat. */
(function (W) {
  'use strict';
  // geometry in the cropped photo (880 x 1400)
  var G = { w: 880, h: 1640, cx: 440.5, r: 223.5, top: 780, bot: 1350, contact: 1375, cap: { x: 255, y: 358, w: 368, h: 274 } };
  function load(src) { return new Promise(function (res, rej) { var i = new Image(); i.decoding = 'async'; i.onload = function () { res(i); }; i.onerror = rej; i.src = src; }); }
  function cv(w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

  function create(canvas, src) {
    var ctx = canvas.getContext('2d'), imgs = null, hl = null, ink = null, far = null, ready = false, raf = 0, want = null;
    var st = { turn: 0, lift: 0, peel: 0, drift: 0 };
    var body = G.bot - G.top;

    function prep() {
      // highlight map: where the photo is brighter than its row median (softbox streaks on the glass)
      var c = cv(G.w, G.h), x = c.getContext('2d'); x.drawImage(imgs.base, 0, 0);
      var x0 = Math.floor(G.cx - G.r), ww = Math.ceil(G.r * 2), d;
      try { d = x.getImageData(x0, G.top - 120, ww, body + 160); } catch (e) { d = null; }
      hl = cv(G.w, G.h);
      if (d) {
        var hx = hl.getContext('2d'), out = hx.createImageData(ww, d.height), p = d.data, o = out.data;
        for (var y = 0; y < d.height; y++) {
          var row = [], i;
          for (i = 0; i < ww; i++) { var k = (y * ww + i) * 4; row.push((p[k] + p[k + 1] + p[k + 2]) / 3); }
          var med = row.slice().sort(function (a, b) { return a - b; })[ww >> 1];
          for (i = 0; i < ww; i++) { var a = Math.max(0, Math.min(0.6, (row[i] - med) / 255 * 2.2)); var q = (y * ww + i) * 4; o[q] = o[q + 1] = o[q + 2] = 255; o[q + 3] = a * 255 * 0.55; }
        }
        hx.putImageData(out, x0, G.top - 120);
      }
      ink = cv(G.w, G.h); far = cv(G.w, G.h);
      // scales so the print matches the stills (front: 0.95r x 0.86 body, back: 1.3r x 0.62 body)
      var f = imgs.front, b = imgs.back;
      imgs.fs = Math.min(G.r * 0.95 / f.width, body * 0.86 / f.height);
      imgs.bs = Math.min(G.r * 1.3 / b.width, body * 0.62 / b.height);
    }

    // draw one label wrapped at angle phi (0 = facing camera). near side to ctxN, far side (mirrored) to ctxF
    function wrapLabel(ctxN, ctxF, img, s, phi, ymid, peel, peelDx) {
      var aw = img.width * s, ah = img.height * s, y0 = G.top + body * ymid - ah / 2, step = 1.25;
      for (var a = -aw / 2; a < aw / 2; a += step) {
        var th = a / G.r + phi, c = Math.cos(th), sx = (a + aw / 2) / s;
        var xw = G.cx + G.r * Math.sin(th), ww = Math.max(0.4, step * Math.abs(c));
        if (peel > 0) {           // print lifts off the glass and lies flat beside it
          var xf = G.cx + peelDx + a; xw += (xf - xw) * peel; ww += (step - ww) * peel; c = c + (1 - c) * peel;
        }
        var edge = Math.min(1, Math.max(0, (c - 0.08) / 0.35));
        if (c > 0 || peel > 0.5) {
          ctxN.globalAlpha = Math.pow(edge, 0.8) * (0.62 + 0.38 * Math.pow(Math.max(c, 0), 0.7)) * 0.96;
          ctxN.drawImage(img, sx, 0, step / s + 0.5, img.height, xw - ww / 2, y0, ww + 0.6, ah);
        } else if (ctxF) {
          var cf = -c, ef = Math.min(1, Math.max(0, (cf - 0.08) / 0.35));
          ctxF.globalAlpha = Math.pow(ef, 0.8) * 0.8;
          ctxF.drawImage(img, sx, 0, step / s + 0.5, img.height, xw - ww / 2, y0, ww + 0.6, ah);
        }
      }
      ctxN.globalAlpha = 1; if (ctxF) ctxF.globalAlpha = 1;
    }

    function draw() {
      raf = 0; if (!ready) return;
      var s = want || st; st = s;
      var lift = s.lift || 0, peel = s.peel || 0;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
      var k = canvas.width / G.w; ctx.setTransform(k, 0, 0, k, 0, 0);
      // base: capped photo, or the capless one while the cap is lifted
      ctx.drawImage(imgs.base, 0, 0, G.w, G.h);
      if (lift > 0.001) { ctx.globalAlpha = Math.min(1, lift * 6); ctx.drawImage(imgs.nocap, 0, 0, G.w, G.h); ctx.globalAlpha = 1; }
      var n = ink.getContext('2d'), f = far.getContext('2d');
      n.setTransform(1, 0, 0, 1, 0, 0); f.setTransform(1, 0, 0, 1, 0, 0);
      n.clearRect(0, 0, G.w, G.h); f.clearRect(0, 0, G.w, G.h);
      var phi = s.turn + (s.drift || 0);
      wrapLabel(n, f, imgs.front, imgs.fs, phi, 0.5, peel, -G.r * 1.55);
      wrapLabel(n, f, imgs.back, imgs.bs, phi + Math.PI, 0.47, 0, 0);
      // far side: soft and dim through glass and liquid
      ctx.save(); ctx.filter = 'blur(1.4px)'; ctx.globalAlpha = 0.3; ctx.drawImage(far, 0, 0); ctx.restore();
      // near side: add the photo's highlights onto the ink only, then lay it down
      n.globalCompositeOperation = 'source-atop'; if (hl) n.drawImage(hl, 0, 0); n.globalCompositeOperation = 'source-over';
      ctx.drawImage(ink, 0, 0);
      // reflection of the print in the obsidian slab
      ctx.save(); ctx.beginPath(); ctx.rect(G.cx - G.r * 2.4, G.contact, G.r * 4.8, body * 0.6); ctx.clip();
      ctx.translate(0, 2 * G.contact - (G.contact - G.bot) * 2); ctx.scale(1, -1); ctx.globalAlpha = 0.16 * (1 - peel); ctx.drawImage(ink, 0, 0); ctx.restore();
      // cap rises off the neck
      if (lift > 0.001) {
        var dy = -lift * 230, sc = 1 + lift * 0.04, c = G.cap;
        ctx.save(); ctx.translate(c.x + c.w / 2, c.y + c.h / 2 + dy); ctx.scale(sc, sc);
        ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 40 * lift; ctx.shadowOffsetY = 20 * lift;
        ctx.drawImage(imgs.cap, -c.w / 2, -c.h / 2, c.w, c.h); ctx.restore();
      } else {
        // cap from the capped photo already sits on top (base image); nothing to draw
      }
    }

    function set(next) { want = Object.assign({}, st, next); if (!raf) raf = requestAnimationFrame(draw); }
    function size() {
      var r = canvas.getBoundingClientRect(), dpr = Math.min(W.devicePixelRatio || 1, 2);
      canvas.width = Math.max(2, Math.round(r.width * dpr)); canvas.height = Math.round(canvas.width * G.h / G.w);
      if (ready) { raf = 0; draw(); }
    }
    // screen position (CSS px, relative to the canvas) of a point in photo space
    function at(x, y) { var r = canvas.getBoundingClientRect(); return { x: x / G.w * r.width, y: y / G.h * r.height }; }

    var p = Promise.all([load(src.base), load(src.nocap), load(src.cap), load(src.front), load(src.back)]).then(function (a) {
      imgs = { base: a[0], nocap: a[1], cap: a[2], front: a[3], back: a[4] };
      prep(); ready = true; size(); canvas.classList.add('is-ready');
    }).catch(function (e) { console.warn('vial rig unavailable', e); canvas.classList.add('is-failed'); });
    W.addEventListener('resize', function () { size(); });
    return { set: set, size: size, at: at, ready: p, G: G };
  }
  W.PEPRIG = { create: create, G: G };
})(window);

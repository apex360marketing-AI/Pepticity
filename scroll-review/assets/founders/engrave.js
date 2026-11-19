/* PEPTICITY laser engraver.
   One engine for the live engraver (engraver.html) and the recorded video (video/).
   A laser head writes a name stroke by stroke; the finished lettering is revealed exactly where the beam has
   passed (a per-pixel reveal-time map), freshly cut edges glow white -> ice -> chrome, sparks and a faint smoke
   wisp come off the head, then a slow light sweep. Canvas only, no libraries, no network, no storage. */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ small helpers */
  var clamp = function (v, a, b) { return v < a ? a : v > b ? b : v; };
  var smooth = function (a, b, x) { var t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  var mix = function (a, b, t) { return a + (b - a) * t; };
  function rng(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s + 0x6D2B79F5) >>> 0; var t = s;
      t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  var BLUE = [42, 120, 255], ICE = [207, 230, 255], WHITE = [255, 255, 255];
  // heavy steps are generators: run them at once (video) or a few milliseconds at a time (live page, no long tasks)
  function runSync(gen) { var r; do { r = gen.next(); } while (!r.done); return r.value; }
  var mc = typeof MessageChannel !== 'undefined' ? new MessageChannel() : null, mq = [];
  if (mc) mc.port1.onmessage = function () { var f = mq.shift(); if (f) f(); };
  function soon(f) { if (mc) { mq.push(f); mc.port2.postMessage(0); } else setTimeout(f, 0); }
  function runAsync(gen, budget, done, alive) {
    function step() {
      if (alive && !alive()) return;
      var t0 = performance.now(), r;
      do { r = gen.next(); } while (!r.done && performance.now() - t0 < budget);
      if (r.done) soon(function () { if (!alive || alive()) done(r.value); }); else soon(step);
    }
    soon(step);   // never inside the event that started it: the click stays light
  }

  /* ------------------------------------------------------------------ letter templates
     Each letter: strokes in pen order. Normalised to the glyph's ink box (x 0..1 left->right, y 0..1 top->bottom).
     ['M',x,y] start, ['L',x,y] line (a corner), ['A',cx,cy,rx,ry,a0,a1] arc in degrees (0 = right, 90 = down). */
  // drawn for the house font Pepticity Black (Λ-style A with an inner stripe, three-bar E, open-left B and P,
  // rounded C/D/G/J/L/O/U, squared S); the snapping step centres every stroke on the actual glyph
  var T = {
    A: [[['M', 0, 1], ['L', 0.5, 0], ['L', 1, 1]], [['M', 0.46, 0.40], ['L', 0.71, 1]]],
    B: [[['M', 0.1, 0], ['L', 0.7, 0], ['A', 0.7, 0.25, 0.3, 0.25, -90, 90], ['L', 0.3, 0.5], ['L', 0.72, 0.5], ['A', 0.72, 0.75, 0.28, 0.25, -90, 90], ['L', 0.1, 1]]],
    C: [[['M', 1, 0], ['L', 0.3, 0], ['A', 0.3, 0.3, 0.3, 0.3, -90, -180], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 1, 1]]],
    D: [[['M', 0, 1], ['L', 0, 0], ['L', 0.7, 0], ['A', 0.7, 0.3, 0.3, 0.3, -90, 0], ['L', 1, 0.7], ['A', 0.7, 0.7, 0.3, 0.3, 0, 90], ['L', 0, 1]]],
    E: [[['M', 0, 0], ['L', 1, 0]], [['M', 0.92, 0.5], ['L', 0.08, 0.5]], [['M', 0, 1], ['L', 1, 1]]],
    F: [[['M', 0, 1], ['L', 0, 0.3], ['A', 0.3, 0.3, 0.3, 0.3, 180, 270], ['L', 1, 0]], [['M', 0, 0.5], ['L', 0.88, 0.5]]],
    G: [[['M', 1, 0], ['L', 0.3, 0], ['A', 0.3, 0.3, 0.3, 0.3, -90, -180], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 0.78, 1], ['A', 0.78, 0.78, 0.22, 0.22, 90, 0], ['L', 1, 0.45], ['L', 0.55, 0.45]]],
    H: [[['M', 0, 0], ['L', 0, 1]], [['M', 0, 0.5], ['L', 1, 0.5]], [['M', 1, 0], ['L', 1, 1]]],
    I: [[['M', 0.5, 0], ['L', 0.5, 1]]],
    J: [[['M', 1, 0], ['L', 1, 0.7], ['A', 0.7, 0.7, 0.3, 0.3, 0, 90], ['L', 0, 1]]],
    K: [[['M', 0, 0], ['L', 0, 1]], [['M', 1, 0], ['L', 0.3, 0.43], ['L', 1, 1]]],
    L: [[['M', 0, 0], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 1, 1]]],
    M: [[['M', 0, 1], ['L', 0, 0], ['L', 0.42, 0.75], ['L', 0.58, 0.75], ['L', 1, 0], ['L', 1, 1]]],
    N: [[['M', 0, 1], ['L', 0, 0], ['L', 1, 1], ['L', 1, 0]]],
    O: [[['M', 0.5, 0], ['L', 0.3, 0], ['A', 0.3, 0.3, 0.3, 0.3, -90, -180], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 0.7, 1], ['A', 0.7, 0.7, 0.3, 0.3, 90, 0], ['L', 1, 0.3], ['A', 0.7, 0.3, 0.3, 0.3, 0, -90], ['L', 0.5, 0]]],
    P: [[['M', 0, 0], ['L', 0.7, 0], ['A', 0.7, 0.27, 0.3, 0.27, -90, 90], ['L', 0.06, 0.54], ['L', 0.06, 1]]],
    Q: [[['M', 0.5, 0], ['L', 0.3, 0], ['A', 0.3, 0.3, 0.3, 0.3, -90, -180], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 0.7, 1], ['A', 0.7, 0.7, 0.3, 0.3, 90, 0], ['L', 1, 0.3], ['A', 0.7, 0.3, 0.3, 0.3, 0, -90], ['L', 0.5, 0]], [['M', 0.58, 0.6], ['L', 0.95, 1]]],
    R: [[['M', 0, 1], ['L', 0, 0.3], ['A', 0.3, 0.3, 0.3, 0.3, 180, 270], ['L', 0.72, 0], ['A', 0.72, 0.27, 0.28, 0.27, -90, 90], ['L', 0.25, 0.54]], [['M', 0.45, 0.54], ['L', 1, 1]]],
    S: [[['M', 1, 0], ['L', 0.25, 0], ['A', 0.25, 0.25, 0.25, 0.25, -90, -270], ['L', 0.75, 0.5], ['A', 0.75, 0.75, 0.25, 0.25, -90, 90], ['L', 0, 1]]],
    T: [[['M', 0, 0], ['L', 1, 0]], [['M', 0.5, 0], ['L', 0.5, 1]]],
    U: [[['M', 0, 0], ['L', 0, 0.7], ['A', 0.3, 0.7, 0.3, 0.3, 180, 90], ['L', 0.7, 1], ['A', 0.7, 0.7, 0.3, 0.3, 90, 0], ['L', 1, 0]]],
    V: [[['M', 0, 0], ['L', 0.5, 1], ['L', 1, 0]]],
    W: [[['M', 0, 0], ['L', 0.27, 1], ['L', 0.5, 0.03], ['L', 0.73, 1], ['L', 1, 0]]],
    X: [[['M', 0, 0], ['L', 1, 1]], [['M', 1, 0], ['L', 0, 1]]],
    Y: [[['M', 0, 0], ['L', 0.47, 0.5]], [['M', 1, 0], ['L', 0.5, 0.52], ['L', 0.5, 1]]],
    Z: [[['M', 0, 0], ['L', 1, 0], ['L', 0, 1], ['L', 1, 1]]],
    '-': [[['M', 0, 0.5], ['L', 1, 0.5]]],
    "'": [[['M', 0.5, 0], ['L', 0.5, 1]]]
  };
  // any other glyph: a calm three-pass hatch across its box
  var HATCH = [[['M', 0, 0.2], ['L', 1, 0.2]], [['M', 1, 0.5], ['L', 0, 0.5]], [['M', 0, 0.8], ['L', 1, 0.8]]];

  function templatePoints(stroke) {
    var pts = [], i, s, n, k, a;
    for (i = 0; i < stroke.length; i++) {
      s = stroke[i];
      if (s[0] === 'M' || s[0] === 'L') pts.push([s[1], s[2], 1, s[0] === 'L' ? 1 : 0]);
      else {
        n = Math.max(8, Math.ceil(Math.abs(s[6] - s[5]) / 6));
        for (k = 0; k <= n; k++) {
          if (k === 0 && pts.length) continue;
          a = (s[5] + (s[6] - s[5]) * k / n) * Math.PI / 180;
          pts.push([s[1] + s[3] * Math.cos(a), s[2] + s[4] * Math.sin(a), 0, 0]);
        }
      }
    }
    if (pts.length) { pts[0][2] = 1; pts[pts.length - 1][2] = 1; }
    return pts;
  }

  /* ------------------------------------------------------------------ raster helpers */
  function boxBlur(src, w, h, r) {
    var tmp = new Float32Array(w * h), out = new Float32Array(w * h), x, y, acc, i, d = 2 * r + 1;
    for (y = 0; y < h; y++) {
      acc = 0; var row = y * w;
      for (x = -r; x <= r; x++) acc += src[row + clamp(x, 0, w - 1)];
      for (x = 0; x < w; x++) {
        tmp[row + x] = acc / d;
        acc += src[row + Math.min(x + r + 1, w - 1)] - src[row + Math.max(x - r, 0)];
      }
    }
    for (x = 0; x < w; x++) {
      acc = 0;
      for (y = -r; y <= r; y++) acc += tmp[clamp(y, 0, h - 1) * w + x];
      for (y = 0; y < h; y++) {
        out[y * w + x] = acc / d;
        acc += tmp[Math.min(y + r + 1, h - 1) * w + x] - tmp[Math.max(y - r, 0) * w + x];
      }
    }
    return out;
  }

  // exact Euclidean distance from each inside pixel (mask > 0.5) to the nearest outside pixel (Felzenszwalb)
  function edt(mask, w, h) { return runSync(edtG(mask, w, h)); }
  function* edtG(mask, w, h) {
    var INF = 1e20, n = Math.max(w, h), f = new Float64Array(n), d = new Float64Array(n),
      v = new Int32Array(n), z = new Float64Array(n + 1), g = new Float64Array(w * h), out = new Float32Array(w * h), x, y;
    function pass(len) {
      var k = 0, q, s; v[0] = 0; z[0] = -INF; z[1] = INF;
      for (q = 1; q < len; q++) {
        s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]);
        while (s <= z[k]) { k--; s = ((f[q] + q * q) - (f[v[k]] + v[k] * v[k])) / (2 * q - 2 * v[k]); }
        k++; v[k] = q; z[k] = s; z[k + 1] = INF;
      }
      k = 0;
      for (q = 0; q < len; q++) { while (z[k + 1] < q) k++; d[q] = (q - v[k]) * (q - v[k]) + f[v[k]]; }
    }
    for (x = 0; x < w; x++) {
      for (y = 0; y < h; y++) f[y] = mask[y * w + x] > 0.5 ? INF : 0;
      pass(h);
      for (y = 0; y < h; y++) g[y * w + x] = d[y];
      if ((x & 31) === 31) yield;
    }
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) f[x] = g[y * w + x];
      pass(w);
      for (x = 0; x < w; x++) out[y * w + x] = Math.sqrt(d[x]);
      if ((y & 7) === 7) yield;
    }
    return out;
  }

  /* ------------------------------------------------------------------ path: fit each letter template, snap to the stroke centre */
  function sampleMask(m, w, h, x, y) {
    var x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    if (x0 < 0 || y0 < 0 || x0 >= w - 1 || y0 >= h - 1) return 0;
    var i = y0 * w + x0;
    return (m[i] * (1 - fx) + m[i + 1] * fx) * (1 - fy) + (m[i + w] * (1 - fx) + m[i + w + 1] * fx) * fy;
  }

  // densified points: [x, y, corner, segment id] (segment id >= 0 for straight template lines, -1 on arcs)
  function densify(pts, step) {
    var out = [[pts[0][0], pts[0][1], pts[0][2], -1]], i, k, n, ax, ay, bx, by, seg;
    for (i = 1; i < pts.length; i++) {
      ax = pts[i - 1][0]; ay = pts[i - 1][1]; bx = pts[i][0]; by = pts[i][1];
      seg = pts[i][3] ? i : -1;
      n = Math.max(1, Math.round(Math.hypot(bx - ax, by - ay) / step));
      for (k = 1; k <= n; k++) out.push([ax + (bx - ax) * k / n, ay + (by - ay) * k / n, k === n ? pts[i][2] : 0, seg]);
    }
    return out;
  }

  function resample(pts, step) {
    if (pts.length < 2) return pts.map(function (p) { return [p[0], p[1]]; });
    var cum = [0], i;
    for (i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    var L = cum[cum.length - 1], n = Math.max(1, Math.round(L / step)), out = [], j = 0, s, t;
    for (i = 0; i <= n; i++) {
      s = L * i / n;
      while (j < cum.length - 2 && cum[j + 1] < s) j++;
      t = cum[j + 1] > cum[j] ? (s - cum[j]) / (cum[j + 1] - cum[j]) : 0;
      out.push([mix(pts[j][0], pts[j + 1][0], t), mix(pts[j][1], pts[j + 1][1], t)]);
    }
    return out;
  }

  // one stroke: template (normalised) -> pixels in the glyph box, centred on the actual stroke
  function fitStroke(tpl, box, hw, M, w, h) {
    var bx0 = box.x0 + hw, by0 = box.y0 + hw, bw = Math.max(1, box.x1 - box.x0 - 2 * hw), bh = Math.max(1, box.y1 - box.y0 - 2 * hw);
    var tp = templatePoints(tpl), pts = tp.map(function (p) { return [bx0 + p[0] * bw, by0 + p[1] * bh, p[2], p[3]]; });
    var P = densify(pts, 1.5), n = P.length, R = Math.max(4, 1.7 * hw), off = new Float32Array(n), ok = new Uint8Array(n), i, k;
    for (i = 0; i < n; i++) {
      if (P[i][2] && i > 0 && i < n - 1) continue;
      var a = P[Math.max(0, i - 3)], b = P[Math.min(n - 1, i + 3)], tx = b[0] - a[0], ty = b[1] - a[1], tl = Math.hypot(tx, ty) || 1;
      var nx = -ty / tl, ny = tx / tl, best = null, run0 = null, kk;
      // nearest inside run along the normal
      for (k = 0; k <= R; k += 0.5) {
        for (kk = 0; kk < 2; kk++) {
          var o = kk ? -k : k;
          if (sampleMask(M, w, h, P[i][0] + nx * o, P[i][1] + ny * o) > 0.5) { run0 = o; break; }
        }
        if (run0 !== null) break;
      }
      if (run0 === null) continue;
      var lo = run0, hi = run0;
      while (lo - 0.5 > -R * 1.6 && sampleMask(M, w, h, P[i][0] + nx * (lo - 0.5), P[i][1] + ny * (lo - 0.5)) > 0.5) lo -= 0.5;
      while (hi + 0.5 < R * 1.6 && sampleMask(M, w, h, P[i][0] + nx * (hi + 0.5), P[i][1] + ny * (hi + 0.5)) > 0.5) hi += 0.5;
      best = (lo + hi) / 2;
      // a run much wider than the stroke means we are along a stroke, not across it: trust the template
      if (hi - lo > 4.2 * hw) continue;
      off[i] = clamp(best, -1.6 * hw, 1.6 * hw); ok[i] = 1;
      P[i][4] = nx; P[i][5] = ny;
    }
    // smooth offsets inside each run between corners
    var seg = [], out = P.map(function (p) { return [p[0], p[1], p[2]]; });
    function flush() {
      if (!seg.length) return;
      var m = seg.length, j, q, acc, cnt, sm = new Float32Array(m);
      for (j = 0; j < m; j++) {
        acc = 0; cnt = 0;
        for (q = Math.max(0, j - 12); q <= Math.min(m - 1, j + 12); q++) if (ok[seg[q]]) { acc += off[seg[q]]; cnt++; }
        sm[j] = cnt ? acc / cnt : 0;
      }
      for (j = 0; j < m; j++) {
        var p = P[seg[j]];
        if (p.length > 4) { out[seg[j]][0] = p[0] + p[4] * sm[j]; out[seg[j]][1] = p[1] + p[5] * sm[j]; }
        else if (j > 0) {   // no normal sampled: carry the neighbour's shift
          var pr = seg[j - 1]; out[seg[j]][0] = p[0] + (out[pr][0] - P[pr][0]); out[seg[j]][1] = p[1] + (out[pr][1] - P[pr][1]);
        }
      }
      seg = [];
    }
    for (i = 0; i < n; i++) {
      if (P[i][2] && i > 0 && i < n - 1) { flush(); continue; }
      seg.push(i);
    }
    flush();
    // straight template lines stay straight: least-squares line through the snapped points, then project
    var ids = {}, id;
    for (i = 0; i < n; i++) if (P[i][3] >= 0 && !(P[i][2] && i > 0 && i < n - 1)) (ids[P[i][3]] = ids[P[i][3]] || []).push(i);
    for (id in ids) {
      var li = ids[id]; if (li.length < 6) continue;
      var a0i = Math.floor(li.length * 0.12), a1i = Math.ceil(li.length * 0.88), sx = 0, sy = 0, cnt2 = 0, j2;
      for (j2 = a0i; j2 < a1i; j2++) { sx += out[li[j2]][0]; sy += out[li[j2]][1]; cnt2++; }
      if (cnt2 < 3) continue;
      var mxp = sx / cnt2, myp = sy / cnt2, sxx = 0, sxy = 0, syy = 0;
      for (j2 = a0i; j2 < a1i; j2++) { var ddx = out[li[j2]][0] - mxp, ddy = out[li[j2]][1] - myp; sxx += ddx * ddx; sxy += ddx * ddy; syy += ddy * ddy; }
      var th = 0.5 * Math.atan2(2 * sxy, sxx - syy), ux = Math.cos(th), uy = Math.sin(th);
      for (j2 = 0; j2 < li.length; j2++) {
        var pp = out[li[j2]], pr = (pp[0] - mxp) * ux + (pp[1] - myp) * uy; pp[0] = mxp + ux * pr; pp[1] = myp + uy * pr;
      }
    }
    // corners: intersection of the snapped lines on either side
    for (i = 1; i < n - 1; i++) {
      if (!P[i][2]) continue;
      var a0 = out[Math.max(0, i - 9)], a1 = out[Math.max(0, i - 2)], b0 = out[Math.min(n - 1, i + 2)], b1 = out[Math.min(n - 1, i + 9)];
      var d1x = a1[0] - a0[0], d1y = a1[1] - a0[1], d2x = b1[0] - b0[0], d2y = b1[1] - b0[1], den = d1x * d2y - d1y * d2x, done = false;
      if (Math.abs(den) > 1e-6) {
        var t1 = ((b0[0] - a0[0]) * d2y - (b0[1] - a0[1]) * d2x) / den, ix = a0[0] + d1x * t1, iy = a0[1] + d1y * t1;
        if (Math.hypot(ix - P[i][0], iy - P[i][1]) < 2.2 * hw) { out[i][0] = ix; out[i][1] = iy; done = true; }
      }
      if (!done) { out[i][0] = (a1[0] + b0[0]) / 2; out[i][1] = (a1[1] + b0[1]) / 2; }
    }
    // free ends: run on to just inside the tip of the stroke
    [0, n - 1].forEach(function (e) {
      var q = out[e], r = out[e === 0 ? Math.min(n - 1, 6) : Math.max(0, n - 7)], vx = q[0] - r[0], vy = q[1] - r[1], vl = Math.hypot(vx, vy);
      if (vl < 1e-6) return;
      vx /= vl; vy /= vl;
      var x = q[0], y = q[1], steps = 0;
      if (sampleMask(M, w, h, x, y) <= 0.5) {   // overshoot: come back inside
        while (steps++ < 3 * hw && sampleMask(M, w, h, x, y) <= 0.5) { x -= vx; y -= vy; }
      } else {
        while (steps++ < 3 * hw && sampleMask(M, w, h, x + vx, y + vy) > 0.5) { x += vx; y += vy; }
        x -= vx * hw * 0.55; y -= vy * hw * 0.55;
      }
      q[0] = x; q[1] = y;
    });
    return resample(out, 2);
  }

  // glyph boxes from a letter mask, split into columns (used for the real name layer)
  function columnBoxes(M, w, h, count) {
    var col = new Float32Array(w), x, y, runs = [], inRun = false, s = 0;
    for (x = 0; x < w; x++) { var c = 0; for (y = 0; y < h; y++) if (M[y * w + x] > 0.5) c++; col[x] = c; }
    for (x = 0; x <= w; x++) {
      var on = x < w && col[x] > 0;
      if (on && !inRun) { s = x; inRun = true; }
      if (!on && inRun) { runs.push([s, x - 1]); inRun = false; }
    }
    // merge slivers into their nearest neighbour
    runs = runs.filter(function (r) { return r[1] - r[0] >= 2; });
    while (runs.length > count) {
      var bi = 0, bg = 1e9, i;
      for (i = 0; i < runs.length - 1; i++) {
        var g = runs[i + 1][0] - runs[i][1], small = Math.min(runs[i][1] - runs[i][0], runs[i + 1][1] - runs[i + 1][0]);
        var score = g + small * 0.25;
        if (score < bg) { bg = score; bi = i; }
      }
      runs.splice(bi, 2, [runs[bi][0], runs[bi + 1][1]]);
    }
    return runs.map(function (r) {
      var y0 = h, y1 = -1;
      for (y = 0; y < h; y++) for (x = r[0]; x <= r[1]; x++) if (M[y * w + x] > 0.5) { if (y < y0) y0 = y; if (y > y1) y1 = y; break; }
      return { x0: r[0], x1: r[1] + 1, y0: y0, y1: y1 + 1 };
    });
  }

  // full pen path for the given glyph boxes
  function* buildPathG(glyphs, M0, w, h) {
    var M = boxBlur(M0, w, h, 2), i0;
    for (i0 = 0; i0 < w * h; i0++) M[i0] = M[i0] > 0.38 ? 1 : 0;
    yield;
    var D = yield* edtG(M, w, h), strokes = [], gi;
    for (gi = 0; gi < glyphs.length; gi++) { fitGlyph(glyphs[gi], gi); yield; }
    function fitGlyph(g, gi) {
      var hw = 0, x, y;
      for (y = Math.max(0, g.y0); y < Math.min(h, g.y1); y++) for (x = Math.max(0, g.x0); x < Math.min(w, g.x1); x++) if (D[y * w + x] > hw) hw = D[y * w + x];
      hw = Math.max(1.5, hw * 0.92);
      var base = g.ch, tpl = T[base] || HATCH;
      tpl.forEach(function (st) {
        var pts = fitStroke(st, g, hw, M, w, h);
        if (pts.length > 1) strokes.push({ pts: pts, glyph: gi, hw: hw });
      });
    }
    return { strokes: strokes, dist: D };
  }

  /* ------------------------------------------------------------------ timeline of the head along the path */
  function Timeline(strokes, writeTime) {
    var segs = [], i, onLen = 0, offLen = 0, travels = 0;
    function len(p) { var L = 0; for (var k = 1; k < p.length; k++) L += Math.hypot(p[k][0] - p[k - 1][0], p[k][1] - p[k - 1][1]); return L; }
    for (i = 0; i < strokes.length; i++) {
      if (i > 0) {
        var a = strokes[i - 1].pts[strokes[i - 1].pts.length - 1], b = strokes[i].pts[0], d = Math.hypot(b[0] - a[0], b[1] - a[1]);
        segs.push({ on: false, pts: [a, b], len: d }); offLen += d; travels++;
      }
      var L = len(strokes[i].pts); segs.push({ on: true, pts: strokes[i].pts, len: L }); onLen += L;
    }
    var TRAVEL_MIN = 0.05, TRAVEL_K = 2.6;
    var v = (onLen + offLen / TRAVEL_K) / Math.max(0.5, writeTime - TRAVEL_MIN * travels);
    var t = 0;
    segs.forEach(function (s) {
      s.t0 = t;
      s.dur = s.on ? s.len / v : TRAVEL_MIN + s.len / (v * TRAVEL_K);
      t += s.dur; s.t1 = t;
      if (s.on) { // cumulative arc length per point
        s.cum = [0];
        for (var k = 1; k < s.pts.length; k++) s.cum.push(s.cum[k - 1] + Math.hypot(s.pts[k][0] - s.pts[k - 1][0], s.pts[k][1] - s.pts[k - 1][1]));
      }
    });
    this.segs = segs; this.duration = t; this.speed = v;
  }
  // eased arc position inside an "on" stroke: gentle acceleration at both ends (like a galvo)
  function strokeEase(u, L, v, dur) {
    var e = Math.min(0.18, 22 / Math.max(L, 1)); // fraction of the stroke used to accelerate
    if (e <= 0) return u;
    // piecewise: quadratic in, linear, quadratic out; normalised so the curve ends at 1
    var vmax = 1 / (1 - e);
    if (u < e) return 0.5 * vmax * u * u / e;
    if (u > 1 - e) { var w = 1 - u; return 1 - 0.5 * vmax * w * w / e; }
    return 0.5 * vmax * e + vmax * (u - e);
  }
  Timeline.prototype.state = function (t) {
    var segs = this.segs, lo = 0, hi = segs.length - 1;
    if (!segs.length) return { x: 0, y: 0, on: false, seg: -1 };
    if (t <= 0) { var p0 = segs[0].pts[0]; return { x: p0[0], y: p0[1], on: false, seg: 0, u: 0 }; }
    if (t >= this.duration) { var s1 = segs[segs.length - 1], pe = s1.pts[s1.pts.length - 1]; return { x: pe[0], y: pe[1], on: false, seg: segs.length, u: 1 }; }
    while (lo < hi) { var mid = (lo + hi) >> 1; if (segs[mid].t1 < t) lo = mid + 1; else hi = mid; }
    var s = segs[lo], u = (t - s.t0) / s.dur;
    if (!s.on) {
      var e = u * u * (3 - 2 * u), a = s.pts[0], b = s.pts[1];
      return { x: mix(a[0], b[0], e), y: mix(a[1], b[1], e), on: false, seg: lo, u: u };
    }
    var target = strokeEase(u, s.len) * s.len, c = s.cum, j = 0, l2 = c.length - 1;
    while (j < l2) { var m2 = (j + l2) >> 1; if (c[m2 + 1] < target) j = m2 + 1; else l2 = m2; }
    j = Math.min(j, c.length - 2);
    var f = c[j + 1] > c[j] ? (target - c[j]) / (c[j + 1] - c[j]) : 0;
    return { x: mix(s.pts[j][0], s.pts[j + 1][0], f), y: mix(s.pts[j][1], s.pts[j + 1][1], f), on: true, seg: lo, u: u };
  };
  // samples of the lit path with the time the head passes them
  Timeline.prototype.samples = function (step) {
    var out = [], self = this;
    this.segs.forEach(function (s) {
      if (!s.on) return;
      var n = Math.max(1, Math.ceil(s.len / step));
      for (var k = 0; k <= n; k++) {
        var tt = s.t0 + s.dur * k / n, st = self.state(Math.min(tt, s.t1 - 1e-6));
        out.push(st.x, st.y, tt);
      }
    });
    return out;
  };

  /* ------------------------------------------------------------------ reveal-time map */
  function* revealTimesG(alpha, w, h, samples, R, spread, tol) {
    var N = w * h, D = new Float32Array(N).fill(1e9), Tm = new Float32Array(N).fill(-1), i, x, y, cx, cy, ts, R2 = R * R;
    var ns = samples.length / 3;
    for (i = 0; i < ns; i++) {   // pass 1: distance to the nearest lit point
      cx = samples[3 * i]; cy = samples[3 * i + 1];
      var xa = Math.max(0, Math.floor(cx - R)), xb = Math.min(w - 1, Math.ceil(cx + R)), ya = Math.max(0, Math.floor(cy - R)), yb = Math.min(h - 1, Math.ceil(cy + R));
      for (y = ya; y <= yb; y++) {
        var dy = y - cy, row = y * w;
        for (x = xa; x <= xb; x++) {
          var p = row + x; if (alpha[p] === 0) continue;
          var dx = x - cx, d2 = dx * dx + dy * dy;
          if (d2 < D[p] && d2 <= R2) D[p] = d2;
        }
      }
      if ((i & 15) === 15) yield;
    }
    for (i = 0; i < N; i++) D[i] = D[i] < 1e9 ? Math.sqrt(D[i]) : 1e9;
    for (i = 0; i < ns; i++) {   // pass 2: the earliest pass that comes (almost) as close as the nearest
      cx = samples[3 * i]; cy = samples[3 * i + 1]; ts = samples[3 * i + 2];
      var xa2 = Math.max(0, Math.floor(cx - R)), xb2 = Math.min(w - 1, Math.ceil(cx + R)), ya2 = Math.max(0, Math.floor(cy - R)), yb2 = Math.min(h - 1, Math.ceil(cy + R));
      for (y = ya2; y <= yb2; y++) {
        var dy2 = y - cy, row2 = y * w;
        for (x = xa2; x <= xb2; x++) {
          var q = row2 + x; if (Tm[q] >= 0 || alpha[q] === 0 || D[q] >= 1e9) continue;
          var dx2 = x - cx, d = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          if (d <= D[q] + tol) Tm[q] = ts + spread * D[q];
        }
      }
      if ((i & 15) === 15) yield;
    }
    // pixels the beam never came near (halo tips): inherit from the nearest assigned neighbour
    var queue = new Int32Array(N), qh = 0, qt = 0;
    for (i = 0; i < N; i++) if (Tm[i] >= 0) queue[qt++] = i;
    while (qh < qt) {
      var c = queue[qh++], cxx = c % w, cyy = (c / w) | 0, k;
      for (k = 0; k < 4; k++) {
        var nx = cxx + (k === 0 ? 1 : k === 1 ? -1 : 0), ny = cyy + (k === 2 ? 1 : k === 3 ? -1 : 0);
        if (nx < 0 || ny < 0 || nx >= w || ny >= h) continue;
        var nb = ny * w + nx;
        if (alpha[nb] === 0 || Tm[nb] >= 0) continue;
        Tm[nb] = Tm[c] + 0.004; queue[qt++] = nb;
      }
      if ((qh & 8191) === 8191) yield;
    }
    return { T: Tm, D: D };
  }

  /* ------------------------------------------------------------------ chrome lettering for typed names */
  // Bevelled chrome like the card's own lettering: bright upper bevels, darker lower ones lit by the blue light underneath,
  // a fine crease where bevel meets face, mid-grey faces with soft diagonal reflections.
  // mask: Float32 alpha 0..1 (w*h); capTop/capH in canvas px; out: RGBA (straight alpha)
  function chromeFill(mask, w, h, capTop, capH, out) { return runSync(chromeFillG(mask, w, h, capTop, capH, out)); }
  function* chromeFillG(mask, w, h, capTop, capH, out) {
    var N = w * h, bin = new Float32Array(N), i;
    for (i = 0; i < N; i++) bin[i] = mask[i] > 0.5 ? 1 : 0;
    yield;
    var D = yield* edtG(bin, w, h), hw = 0;
    for (i = 0; i < N; i++) if (D[i] > hw) hw = D[i];
    yield;
    var bev = Math.max(1.4, 0.40 * hw), H = new Float32Array(N), dd = new Float32Array(N);
    for (i = 0; i < N; i++) { var d0 = D[i] + (mask[i] - 0.5); dd[i] = d0; H[i] = d0 <= 0 ? 0 : Math.min(d0, bev); }
    yield;
    H = boxBlur(H, w, h, 1);
    yield;
    dd = boxBlur(dd, w, h, 1);
    var lx = -0.42, ly = -0.78, lz = 0.46, ll = Math.hypot(lx, ly, lz); lx /= ll; ly /= ll; lz /= ll;
    var x, y, TAU = Math.PI * 2;
    yield;
    for (y = 0; y < h; y++) for (x = 0; x < w; x++) {
      if (x === 0 && (y & 1) === 1) yield;
      i = y * w + x;
      var a = mask[i];
      if (a <= 0.002) { out[4 * i + 3] = 0; continue; }
      var gx = (H[y * w + Math.min(w - 1, x + 1)] - H[y * w + Math.max(0, x - 1)]) * 0.5,
        gy = (H[Math.min(h - 1, y + 1) * w + x] - H[Math.max(0, y - 1) * w + x]) * 0.5;
      var nx = -gx, ny = -gy, nz = 1, nl = Math.hypot(nx, ny, nz); nx /= nl; ny /= nl; nz /= nl;
      var d = dd[i], onBev = smooth(bev + 0.7, bev - 0.7, d);
      // face: mid-grey chrome with soft diagonal reflections and a quieter band low in the letter
      var u = ((y - capTop) + 0.34 * x) / capH, vy = (y - capTop) / capH;
      var wave = 0.5 + 0.5 * Math.sin(TAU * (u * 1.05 + 0.13 * Math.sin(TAU * x / (capH * 1.9))));
      var wave2 = 0.5 + 0.5 * Math.sin(TAU * (u * 2.3 + 0.4));
      var face = (92 + 122 * wave * wave * wave + 26 * wave2 * wave2) * (1 - 0.26 * Math.exp(-Math.pow((vy - 0.66) / 0.12, 2)));
      // bevel: by the facet's direction
      var pl = Math.hypot(nx, ny) || 1, px = nx / pl, py = ny / pl;
      var up = -py, side = Math.abs(px);
      var bevC = up > 0 ? 196 + 56 * up : 196 - 120 * (-up);
      bevC += 18 * side * (px < 0 ? 1 : -0.4);
      var spec = Math.pow(Math.max(0, nx * lx + ny * ly + nz * lz), 26) * 60 * onBev;
      var c = mix(face, bevC, onBev) + spec;
      c *= 1 - 0.42 * Math.exp(-Math.pow((d - bev) / 0.75, 2));   // the crease
      c *= 1 - 0.35 * smooth(0.9, 0, d);                        // a dark hairline at the very edge
      // the blue light underneath: only along the feet, at the baseline
      var low = smooth(0.84, 0.99, vy), blue = low * (onBev * Math.max(0, py) + 0.6 * smooth(2.0, 0.3, d));
      blue = Math.min(1, blue * 1.25);
      out[4 * i] = clamp(c - 4 + 30 * blue, 0, 255);
      out[4 * i + 1] = clamp(c + 95 * blue, 0, 255);
      out[4 * i + 2] = clamp(c + 7 + 200 * blue, 0, 255);
      out[4 * i + 3] = clamp(a * 255, 0, 255);
    }
    return out;
  }

  /* ------------------------------------------------------------------ the engraving (one name on one surface) */
  /* opts: { layer: Uint8ClampedArray RGBA w*h (the finished lettering, straight alpha), letter: Float32Array 0..1 (letters only),
             w, h (px of the name canvas), glyphs: [{ch, x0,y0,x1,y1}], writeTime, seed } */
  function Engraving(o) { for (var k in o) this[k] = o[k]; this.reset(); }
  Engraving.create = function (opts) { return runSync(Engraving.build(opts)); };
  Engraving.build = function* (opts) {
    var w = opts.w, h = opts.h, N = w * h, i;
    var built = yield* buildPathG(opts.glyphs, opts.letter, w, h);
    var line = new Timeline(built.strokes, opts.writeTime || 3.1);
    var hwAvg = 0; built.strokes.forEach(function (s) { hwAvg += s.hw; }); hwAvg = built.strokes.length ? hwAvg / built.strokes.length : 6;
    yield;
    var alphaU8 = new Uint8Array(N); for (i = 0; i < N; i++) alphaU8[i] = opts.layer[4 * i + 3];
    var reach = opts.reach > 0 ? opts.reach : (opts.halo === false ? 1.6 * hwAvg + 6 : 2.2 * hwAvg + 14);
    yield;
    var rt = yield* revealTimesG(alphaU8, w, h, line.samples(1.5), reach, 0.0011, 0.4 * hwAvg);
    // lit pixels sorted by reveal time: pack (time, index) into one float and use the native numeric sort
    var Tm = rt.T, count = 0;
    for (i = 0; i < N; i++) if (alphaU8[i] && Tm[i] >= 0) count++;
    var keys = new Float64Array(count), k = 0, SH = 4194304;   // 2^22 pixels max
    for (i = 0; i < N; i++) if (alphaU8[i] && Tm[i] >= 0) keys[k++] = Math.round(Tm[i] * 100000) * SH + i;
    yield;
    keys.sort();
    yield;
    var order = new Uint32Array(count), times = new Float32Array(count);
    for (i = 0; i < count; i++) { var idx = keys[i] % SH; order[i] = idx; times[i] = Tm[idx]; }
    yield;
    // heat: letters glow, the very edge of the cut glows longest
    var D = built.dist, heatW = new Float32Array(N), tau = new Float32Array(N);
    for (i = 0; i < N; i++) {
      heatW[i] = opts.letter[i];
      tau[i] = mix(0.06, 0.30, 1 - smooth(0.6, 3.2, D[i]));
    }
    return new Engraving({ w: w, h: h, layer: opts.layer, strokes: built.strokes, line: line, hw: hwAvg, order: order, times: times,
      heatW: heatW, tau: tau, lastT: count ? times[count - 1] : 0, out: new Uint8ClampedArray(N * 4) });
  };
  Engraving.prototype.reset = function () {
    this.out.fill(0); this.coolPtr = 0; this.revPtr = 0; this.t = -1;
    this.dirty = { x0: 0, y0: 0, x1: this.w, y1: this.h };   // first upload: everything
  };
  Engraving.prototype.COOL = 1.15;
  // write the name canvas pixels for time t (seconds since the beam started writing); returns the heat cells for the bloom
  Engraving.prototype.update = function (t, cell, cw, ch) {
    if (t < this.t) this.reset();
    this.t = t;
    var order = this.order, times = this.times, L = this.layer, out = this.out, n = order.length, k, p, age;
    var COOL = this.COOL, SOFT = 0.035, heatW = this.heatW, tau = this.tau;
    while (this.revPtr < n && times[this.revPtr] <= t) this.revPtr++;
    // finished pixels: exact final colour, written once
    var w = this.w, dx0 = w, dy0 = this.h, dx1 = -1, dy1 = -1, px, py;
    while (this.coolPtr < this.revPtr && t - times[this.coolPtr] >= COOL) {
      p = order[this.coolPtr] * 4;
      px = order[this.coolPtr] % w; py = (order[this.coolPtr] / w) | 0;
      if (px < dx0) dx0 = px; if (px > dx1) dx1 = px; if (py < dy0) dy0 = py; if (py > dy1) dy1 = py;
      out[p] = L[p]; out[p + 1] = L[p + 1]; out[p + 2] = L[p + 2]; out[p + 3] = L[p + 3];
      this.coolPtr++;
    }
    var heat = cell ? cell.fill(0) : null;
    for (k = this.coolPtr; k < this.revPtr; k++) {
      var pi = order[k]; p = pi * 4; age = t - times[k];
      px = pi % w; py = (pi / w) | 0;
      if (px < dx0) dx0 = px; if (px > dx1) dx1 = px; if (py < dy0) dy0 = py; if (py > dy1) dy1 = py;
      var rev = age >= SOFT ? 1 : age / SOFT;
      var hv = Math.exp(-age / tau[pi]) * (1 - smooth(0.75, COOL, age));
      var amt = smooth(0, 0.5, hv) * heatW[pi] * 0.78, r, g, b;
      if (hv > 0.5) { var f = (hv - 0.5) / 0.5; r = mix(ICE[0], 255, f); g = mix(ICE[1], 255, f); b = 255; }
      else { var f2 = hv / 0.5; r = mix(BLUE[0], ICE[0], f2); g = mix(BLUE[1], ICE[1], f2); b = 255; }
      out[p] = mix(L[p], r, amt); out[p + 1] = mix(L[p + 1], g, amt); out[p + 2] = mix(L[p + 2], b, amt);
      out[p + 3] = Math.max(L[p + 3] * rev, 255 * amt * rev * 0.9);
      if (heat) {
        var hx = (px / cell.scale) | 0, hy = (py / cell.scale) | 0;
        if (hx < cw && hy < ch) heat[hy * cw + hx] += hv * heatW[pi];
      }
    }
    var d = this.dirty;   // merge with anything not yet uploaded (the first frame uploads everything)
    if (dx1 >= 0) { d.x0 = Math.min(d.x0, dx0); d.y0 = Math.min(d.y0, dy0); d.x1 = Math.max(d.x1, dx1 + 1); d.y1 = Math.max(d.y1, dy1 + 1); }
    return heat;
  };
  Engraving.prototype.finish = function () {
    this.out.set(this.layer); this.coolPtr = this.revPtr = this.order.length; this.t = 1e9;
    this.dirty = { x0: 0, y0: 0, x1: this.w, y1: this.h };
  };
  Engraving.prototype.takeDirty = function () {
    var d = this.dirty; this.dirty = { x0: this.w, y0: this.h, x1: 0, y1: 0 };
    return d.x1 > d.x0 && d.y1 > d.y0 ? d : null;
  };

  /* ------------------------------------------------------------------ the player: canvases, head, sparks, smoke, light */
  /* stage: element positioned relative; region: {x,y,w,h} of the name canvas in stage px; scale: canvas px per stage px.
     fxRegion: {x,y,w,h} for the light canvas (stage px). */
  function Player(o) {
    this.o = o;
    this.nameCanvas = o.nameCanvas; this.fxCanvas = o.fxCanvas;
    this.nctx = this.nameCanvas.getContext('2d');
    this.fctx = this.fxCanvas.getContext('2d');
    this.eng = o.engraving;
    this.img = new ImageData(this.eng.out, this.eng.w, this.eng.h);   // shares the engraving's pixel buffer
    // bloom buffer at 1/4
    var cs = 4; this.cell = new Float32Array(Math.ceil(this.eng.w / cs) * Math.ceil(this.eng.h / cs)); this.cell.scale = cs;
    this.cw = Math.ceil(this.eng.w / cs); this.ch = Math.ceil(this.eng.h / cs);
    this.bloomC = document.createElement('canvas'); this.bloomC.width = this.cw; this.bloomC.height = this.ch;
    this.bctx = this.bloomC.getContext('2d'); this.bimg = this.bctx.createImageData(this.cw, this.ch);
    this.sweepC = document.createElement('canvas'); this.sweepC.width = this.eng.w; this.sweepC.height = this.eng.h;
    this.sctx = this.sweepC.getContext('2d');
    this.layerC = document.createElement('canvas'); this.layerC.width = this.eng.w; this.layerC.height = this.eng.h;
    var lctx = this.layerC.getContext('2d'), li = lctx.createImageData(this.eng.w, this.eng.h); li.data.set(this.eng.layer); lctx.putImageData(li, 0, 0);
    this.reset();
  }
  // phases (seconds): start (head appears) -> ignite -> write -> fade -> cool -> sweep -> end
  Player.prototype.plan = function () {
    var o = this.o, P = {};
    P.appear = o.appear != null ? o.appear : 0;
    P.write0 = P.appear + (o.ignite != null ? o.ignite : 0.32);
    P.write1 = P.write0 + this.eng.line.duration;
    P.fade1 = P.write1 + 0.26;
    P.sweep0 = P.write1 + (o.sweepDelay != null ? o.sweepDelay : 0.9);
    P.sweep1 = P.sweep0 + (o.sweepTime != null ? o.sweepTime : 1.6);
    P.end = Math.max(P.sweep1, P.write1 + this.eng.COOL, P.write1 + 2.35) + 0.05;   // last spark, heat and smoke gone
    return P;
  };
  Player.prototype.reset = function () {
    this.P = this.plan(); this.simT = 0; this.sparks = []; this.smoke = []; this.rand = rng(this.o.seed || 7);
    this.sparkAcc = 0; this.smokeAcc = 0; this.prevHead = null; this.eng.reset();
  };
  Player.prototype.headAt = function (t) {
    var P = this.P, line = this.eng.line, s = line.state(clamp(t - P.write0, 0, line.duration));
    var I = 0;
    if (t >= P.appear && t < P.write0) I = smooth(P.appear, P.write0, t);
    else if (t >= P.write0 && t < P.write1) I = s.on ? 1 : 0.32;
    else if (t >= P.write1 && t < P.fade1) I = 1 - smooth(P.write1, P.fade1, t);
    if (t >= P.write0 && t < P.write1 && !s.on) {   // ease the dip at each pen lift
      var seg = line.segs[s.seg], tl = t - P.write0, k = Math.min(tl - seg.t0, seg.t1 - tl);
      I = mix(1, 0.32, smooth(0, 0.025, k));
    }
    s.I = I; return s;
  };
  // head position in stage px
  Player.prototype.headStage = function (t) {
    var h = this.headAt(t), rg = this.o.region, S = this.o.scale;
    h.X = rg.x + h.x / S; h.Y = rg.y + h.y / S; return h;
  };
  Player.prototype.simulate = function (t) {
    if (t < this.simT - 1e-9) this.reset();
    var dt = 1 / 240, R = this.rand;
    while (this.simT + dt <= t + 1e-9) {
      var tt = this.simT + dt, hd = this.headStage(tt), prev = this.prevHead || hd;
      var vx = (hd.X - prev.X) / dt, vy = (hd.Y - prev.Y) / dt; this.prevHead = hd;
      var lit = hd.on && tt >= this.P.write0 && tt < this.P.write1;
      if (lit) {
        this.sparkAcc += (this.o.sparkRate || 430) * dt;
        while (this.sparkAcc >= 1) {
          this.sparkAcc -= 1;
          var ang = R() * Math.PI * 2, sp = 60 + 430 * Math.pow(R(), 2.7);
          this.sparks.push({ x: hd.X + (R() - 0.5) * 2, y: hd.Y + (R() - 0.5) * 2,
            vx: Math.cos(ang) * sp - vx * 0.18, vy: Math.sin(ang) * sp - vy * 0.18 - 90 * R(),
            age: 0, life: 0.26 + 0.18 * R(), w: 1.7 + 1.5 * R(), b: 0.75 + 0.25 * R() });
        }
        this.smokeAcc += 26 * dt;
        while (this.smokeAcc >= 1) {
          this.smokeAcc -= 1;
          this.smoke.push({ x: hd.X + (R() - 0.5) * 6, y: hd.Y - 3, vy: -(28 + 26 * R()), ph: R() * 6.28,
            amp: 6 + 9 * R(), age: 0, life: 1.4 + 0.8 * R(), r0: 5 + 3 * R(), r1: 30 + 22 * R(), a: 0.075 + 0.04 * R() });
        }
      }
      var g = 1300, drag = Math.exp(-2.4 * dt), i, p;
      for (i = this.sparks.length - 1; i >= 0; i--) {
        p = this.sparks[i]; p.age += dt;
        if (p.age >= p.life) { this.sparks.splice(i, 1); continue; }
        p.vx *= drag; p.vy = p.vy * drag + g * dt; p.x += p.vx * dt; p.y += p.vy * dt;
      }
      for (i = this.smoke.length - 1; i >= 0; i--) {
        p = this.smoke[i]; p.age += dt;
        if (p.age >= p.life) { this.smoke.splice(i, 1); continue; }
        p.y += p.vy * dt; p.vy *= Math.exp(-0.35 * dt);
      }
      this.simT = tt;
    }
  };
  // draw everything for time t (seconds on the player's clock); returns true when the engraving has settled
  Player.prototype.render = function (t) {
    var P = this.P, o = this.o, eng = this.eng, f = this.fctx, fx = o.fxRegion, rg = o.region, S = o.scale;
    this.simulate(t);
    // 1. the lettering
    var heat = eng.update(t - P.write0, this.cell, this.cw, this.ch);
    var inSweep = t > P.sweep0 && t < P.sweep1, dr = eng.takeDirty(), band = null;
    if (inSweep) band = this.sweepBand(t);
    if (this.prevBand || band) {   // restore the strip the light just left, and the one it is on
      var u0 = Math.min(band ? band[0] : 1e9, this.prevBand ? this.prevBand[0] : 1e9), u1 = Math.max(band ? band[1] : -1, this.prevBand ? this.prevBand[1] : -1);
      dr = dr ? { x0: Math.min(dr.x0, u0), y0: 0, x1: Math.max(dr.x1, u1), y1: eng.h } : { x0: u0, y0: 0, x1: u1, y1: eng.h };
      this.prevBand = band;
    }
    if (dr && dr.x1 > dr.x0) this.nctx.putImageData(this.img, 0, 0, dr.x0, dr.y0, dr.x1 - dr.x0, dr.y1 - dr.y0);
    // 2. light layer: additive on black; the canvas is screen-blended over the card
    var k = this.fxCanvas.width / fx.w; // fx canvas px per stage px
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'source-over'; f.globalAlpha = 1; f.filter = 'none';
    f.fillStyle = '#000'; f.fillRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
    f.globalCompositeOperation = 'lighter';
    var dx = (rg.x - fx.x) * k, dy = (rg.y - fx.y) * k, dw = rg.w * k, dh = rg.h * k;
    // bloom of the hot cut: a low-resolution heat map, softened here (no canvas filters), drawn up smoothly
    if (heat) {
      var cw = this.cw, ch = this.ch, cc = this.cell.scale * this.cell.scale, mx = 0, i, b1 = this.blur1 || (this.blur1 = new Float32Array(heat.length));
      for (i = 0; i < heat.length; i++) { heat[i] = Math.min(1, heat[i] / cc * 1.15); if (heat[i] > mx) mx = heat[i]; }
      if (mx > 0.002) {
        var near = boxBlur(heat, cw, ch, 1), far = boxBlur(heat, cw, ch, 3), bd = this.bimg.data;
        for (i = 0; i < heat.length; i++) {
          var hv = Math.min(1, 0.55 * near[i] + 0.9 * far[i]);
          bd[4 * i] = 120 * hv + 60 * hv * hv; bd[4 * i + 1] = 175 * hv + 50 * hv * hv; bd[4 * i + 2] = 255 * hv; bd[4 * i + 3] = 255;
        }
        this.bctx.putImageData(this.bimg, 0, 0);
        f.imageSmoothingEnabled = true; f.imageSmoothingQuality = 'high';
        f.globalAlpha = 0.5; f.drawImage(this.bloomC, dx, dy, dw, dh); f.globalAlpha = 1;
      }
    }
    f.setTransform(k, 0, 0, k, -fx.x * k, -fx.y * k);   // from here on: stage px
    // smoke: faint cool wisps lit by the beam
    var p, a, j;
    for (j = 0; j < this.smoke.length; j++) {
      p = this.smoke[j]; var u = p.age / p.life, r = mix(p.r0, p.r1, Math.sqrt(u));
      a = p.a * smooth(0, 0.15, u) * (1 - smooth(0.45, 1, u));
      var sx = p.x + Math.sin(p.ph + p.age * 2.1) * p.amp * u, sy = p.y;
      var gr = f.createRadialGradient(sx, sy, 0, sx, sy, r);
      gr.addColorStop(0, 'rgba(170,190,220,' + a.toFixed(4) + ')'); gr.addColorStop(1, 'rgba(170,190,220,0)');
      f.fillStyle = gr; f.beginPath(); f.ellipse(sx, sy, r * 0.8, r, 0, 0, Math.PI * 2); f.fill();
    }
    // sparks: short streaks cooling white -> ice -> nothing
    f.lineCap = 'round';
    for (j = 0; j < this.sparks.length; j++) {
      p = this.sparks[j]; var q = p.age / p.life, cr, cg, cb = 255;
      if (q < 0.35) { var e1 = q / 0.35; cr = mix(255, ICE[0], e1); cg = mix(255, ICE[1], e1); }
      else { var e2 = (q - 0.35) / 0.65; cr = mix(ICE[0], BLUE[0], e2); cg = mix(ICE[1], BLUE[1], e2); }
      a = p.b * (1 - smooth(0.35, 1, q));
      f.strokeStyle = 'rgba(' + (cr | 0) + ',' + (cg | 0) + ',' + cb + ',' + a.toFixed(3) + ')';
      f.lineWidth = p.w * (1 - 0.5 * q);
      f.beginPath(); f.moveTo(p.x, p.y); f.lineTo(p.x - p.vx * 0.014, p.y - p.vy * 0.014); f.stroke();
    }
    // the head
    var hd = this.headStage(t);
    if (hd.I > 0.002) {
      var X = hd.X, Y = hd.Y, I = hd.I * (0.94 + 0.06 * Math.sin(t * 61.0) * Math.sin(t * 23.7)), m;
      var tr = [];   // the streak: where the head was a few ms ago
      for (m = 0; m <= 8; m++) { var hs = this.headStage(t - m * 0.006); tr.push([hs.X, hs.Y, hs.on]); }
      for (m = 1; m < tr.length; m++) {
        if (!tr[m][2] || !tr[m - 1][2]) break;
        var fa = 1 - m / tr.length;
        f.strokeStyle = 'rgba(225,238,255,' + (0.55 * I * fa).toFixed(3) + ')';
        f.lineWidth = 5.2 * fa + 0.8;
        f.beginPath(); f.moveTo(tr[m - 1][0], tr[m - 1][1]); f.lineTo(tr[m][0], tr[m][1]); f.stroke();
      }
      var g1 = f.createRadialGradient(X, Y, 0, X, Y, 78);   // wide, faint illumination of the glass
      g1.addColorStop(0, 'rgba(42,120,255,' + (0.20 * I).toFixed(3) + ')'); g1.addColorStop(1, 'rgba(42,120,255,0)');
      f.fillStyle = g1; f.fillRect(X - 80, Y - 80, 160, 160);
      var g2 = f.createRadialGradient(X, Y, 0, X, Y, 24);   // tight logo-blue bloom with an ice core
      g2.addColorStop(0, 'rgba(207,230,255,' + (0.95 * I).toFixed(3) + ')');
      g2.addColorStop(0.28, 'rgba(120,175,255,' + (0.60 * I).toFixed(3) + ')');
      g2.addColorStop(0.62, 'rgba(42,120,255,' + (0.20 * I).toFixed(3) + ')');
      g2.addColorStop(1, 'rgba(42,120,255,0)');
      f.fillStyle = g2; f.fillRect(X - 25, Y - 25, 50, 50);
      var lw = 120 * I, g3 = f.createLinearGradient(X - lw, Y, X + lw, Y);   // thin lens line, like the light through the P
      g3.addColorStop(0, 'rgba(42,120,255,0)'); g3.addColorStop(0.5, 'rgba(150,195,255,' + (0.42 * I).toFixed(3) + ')'); g3.addColorStop(1, 'rgba(42,120,255,0)');
      f.fillStyle = g3; f.fillRect(X - lw, Y - 0.9, 2 * lw, 1.8);
      var g4 = f.createRadialGradient(X, Y, 0, X, Y, 5);    // white-hot core
      g4.addColorStop(0, 'rgba(255,255,255,' + I.toFixed(3) + ')'); g4.addColorStop(0.55, 'rgba(255,255,255,' + (0.85 * I).toFixed(3) + ')');
      g4.addColorStop(1, 'rgba(255,255,255,0)');
      f.fillStyle = g4; f.beginPath(); f.arc(X, Y, 5, 0, Math.PI * 2); f.fill();
    }
    // 3. light sweep across the new name: a slanted band of light passes over the chrome (added inside the letters only)
    if (band) {
      var sc = this.sctx, W = eng.w, Hh = eng.h, bx0 = band[0], bwid = band[1] - band[0], tg = Math.tan(0.36);
      sc.setTransform(1, 0, 0, 1, 0, 0); sc.globalCompositeOperation = 'source-over'; sc.clearRect(bx0, 0, bwid, Hh);
      sc.save(); sc.beginPath(); sc.rect(bx0, 0, bwid, Hh); sc.clip();
      sc.setTransform(1, 0, -tg, 1, tg * Hh * 0.5, 0);
      var bw = band[3], cx = band[2], lg = sc.createLinearGradient(cx - bw, 0, cx + bw, 0);
      lg.addColorStop(0, 'rgba(207,230,255,0)'); lg.addColorStop(0.28, 'rgba(207,230,255,0.10)'); lg.addColorStop(0.44, 'rgba(225,240,255,0.42)');
      lg.addColorStop(0.5, 'rgba(255,255,255,0.80)'); lg.addColorStop(0.56, 'rgba(225,240,255,0.42)'); lg.addColorStop(0.72, 'rgba(207,230,255,0.10)');
      lg.addColorStop(1, 'rgba(207,230,255,0)');
      sc.fillStyle = lg; sc.fillRect(cx - bw - tg * Hh, 0, 2 * bw + 2 * tg * Hh, Hh);
      sc.restore();
      sc.globalCompositeOperation = 'destination-in'; sc.drawImage(this.layerC, bx0, 0, bwid, Hh, bx0, 0, bwid, Hh);
      sc.globalCompositeOperation = 'source-over';
      var n2 = this.nctx; n2.globalCompositeOperation = 'lighter'; n2.globalAlpha = band[4];
      n2.drawImage(this.sweepC, bx0, 0, bwid, Hh, bx0, 0, bwid, Hh); n2.globalAlpha = 1; n2.globalCompositeOperation = 'source-over';
    }
    f.setTransform(1, 0, 0, 1, 0, 0); f.globalCompositeOperation = 'source-over';
    return t >= P.end;
  };
  // [x0, x1, centre, half width, strength] of the light band at time t (name-canvas px)
  Player.prototype.sweepBand = function (t) {
    var P = this.P, eng = this.eng, W = eng.w, Hh = eng.h, tg = Math.tan(0.36);
    var su = smooth(P.sweep0, P.sweep1, t), span = W + Hh * 1.4, cx = -Hh * 0.7 + su * span;
    var env = Math.min(1, 1.35 * Math.sin(Math.PI * clamp((t - P.sweep0) / (P.sweep1 - P.sweep0), 0, 1)));
    var bw = Math.max(60, 0.075 * W) * (this.o.sweepWidth || 1), reach = bw + tg * Hh * 0.5 + 2;
    var x0 = Math.max(0, Math.floor(cx - reach)), x1 = Math.min(W, Math.ceil(cx + reach));
    return x1 > x0 ? [x0, x1, cx, bw, env] : null;
  };
  Player.prototype.finish = function () {
    this.eng.finish(); this.eng.takeDirty(); this.nctx.putImageData(this.img, 0, 0);
    var f = this.fctx; f.setTransform(1, 0, 0, 1, 0, 0); f.fillStyle = '#000'; f.fillRect(0, 0, this.fxCanvas.width, this.fxCanvas.height);
  };

  /* ------------------------------------------------------------------ helpers used by the pages */
  // letter mask from a real chrome name layer: its alpha is a soft silhouette, the letters are the bright chrome
  function letterMaskFromLayer(rgba, w, h) {
    var m = new Float32Array(w * h), i;
    for (i = 0; i < w * h; i++) {
      var a = rgba[4 * i + 3] / 255, l = 0.2126 * rgba[4 * i] + 0.7152 * rgba[4 * i + 1] + 0.0722 * rgba[4 * i + 2];
      m[i] = a > 0.5 ? smooth(52, 92, l) : 0;
    }
    var b = boxBlur(m, w, h, 2);
    for (i = 0; i < w * h; i++) b[i] = b[i] > 0.42 ? Math.min(1, b[i] * 1.6) : b[i] * 0.5;
    return b;
  }

  /* ------------------------------------------------------------------ the page: type a name, press ENGRAVE */
  var FONT = '"Pepticity Black"';
  var TRANSLIT = { 'Æ': 'AE', 'Œ': 'OE', 'Ø': 'O', 'Ð': 'D', 'Þ': 'TH', 'ẞ': 'SS', 'Ł': 'L', 'Đ': 'D', 'Ħ': 'H', 'Ŋ': 'N', 'Ŧ': 'T', 'Ĳ': 'IJ', 'Ŀ': 'L', 'ı': 'I' };
  // returns { name } (A-Z, space, hyphen, apostrophe; capitals) or { error }
  function cleanName(raw) {
    var s = String(raw == null ? '' : raw);
    try { s = s.normalize('NFC'); } catch (e) { /* old engines */ }
    s = s.replace(/[‘’ʼ`´]/g, "'").replace(/[‐‑‒–]/g, '-').replace(/\s+/g, ' ').trim();
    var letters;
    try { letters = /^[\p{L}' -]+$/u.test(s); } catch (e) { letters = /^[A-Za-zÀ-ɏ' -]+$/.test(s); }
    if (!s.length) return { error: 'Type your name first.' };
    if (!letters) return { error: 'Letters, spaces, hyphens and apostrophes only.', bad: true };
    if (s.length < 2) return { error: 'Type at least 2 letters.' };
    if (s.length > 24) return { error: 'Up to 24 characters.' };
    var up = s.toUpperCase(), out = '';
    try { up = up.normalize('NFD').replace(/[̀-ͯ]/g, ''); } catch (e) { /* keep */ }
    for (var i = 0; i < up.length; i++) out += TRANSLIT[up[i]] || up[i];
    if (!/^[A-Z' -]+$/.test(out)) return { error: 'Use the Latin letters A to Z.', bad: true };
    if (!/[A-Z]/.test(out)) return { error: 'Type at least 2 letters.' };
    return { name: out.replace(/ {2,}/g, ' ') };
  }

  function metricsFor(btn) {
    var d = btn.dataset;
    return { card: d.card, penX: +d.penX, capTop: +d.capTop, baseline: +d.baseline, fontSize: +d.fontSize, track: +d.track || 0,
      space: +d.space || 0, maxX: +d.maxX };
  }

  // lay the name out exactly like the card's own name (same font, size, spacing, baseline); shrink to fit when long
  function layoutName(name, m, S, ctx) {
    var fs = m.fontSize, track = m.track, space = m.space;
    function run(fs) {
      ctx.font = (fs * S).toFixed(3) + 'px ' + FONT;
      var x = 0, items = [];
      for (var i = 0; i < name.length; i++) {
        var ch = name[i], w = ch === "'" ? 0.30 * fs * S : ctx.measureText(ch).width;
        items.push({ ch: ch, x: x, w: w });
        x += w + (i < name.length - 1 ? (track + (ch === ' ' ? space : 0)) * S : 0);
      }
      return { items: items, width: x, fs: fs };
    }
    var avail = (m.maxX - m.penX) * S, lay = run(fs);
    if (lay.width > avail) { var k = Math.max(0.5, avail / lay.width); track *= k; space *= k; lay = run(fs * k); }
    return lay;
  }

  function apostrophe(ctx, x, base, em) {   // Pepticity Black has none: a short bar with the font's 45-degree cut
    ctx.beginPath();
    ctx.moveTo(x + 0.07 * em, base - 0.70 * em); ctx.lineTo(x + 0.19 * em, base - 0.70 * em);
    ctx.lineTo(x + 0.19 * em, base - 0.56 * em); ctx.lineTo(x + 0.11 * em, base - 0.46 * em); ctx.lineTo(x + 0.07 * em, base - 0.46 * em);
    ctx.closePath(); ctx.fill();
  }

  // render the finished chrome lettering for a name; returns everything the engraving needs
  function* buildSurfaceG(name, m, stageW) {
    var dpr = Math.min(2, window.devicePixelRatio || 1);
    var S = dpr * stageW / 2688;
    var mctx = document.createElement('canvas').getContext('2d');
    var lay = layoutName(name, m, S, mctx), fs = lay.fs;
    yield;
    var pad = 0.32 * m.fontSize;
    var rg = { x: Math.max(0, m.penX - pad), y: Math.max(0, m.baseline - 0.7 * m.fontSize - pad) };
    rg.w = Math.min(2688 - rg.x, lay.width / S + 2 * pad); rg.h = Math.min(1520 - rg.y, 0.7 * m.fontSize + 2 * pad);
    if (rg.w * S > 2600) S = 2600 / rg.w;                     // cap the canvas on huge screens
    lay = layoutName(name, m, S, mctx); fs = lay.fs;
    yield;
    var w = Math.ceil(rg.w * S), h = Math.ceil(rg.h * S);
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    var x = c.getContext('2d', { willReadFrequently: true });
    x.fillStyle = '#fff'; x.textBaseline = 'alphabetic'; x.textAlign = 'left';
    x.font = (fs * S).toFixed(3) + 'px ' + FONT;
    var ox = (m.penX - rg.x) * S, base = (m.baseline - rg.y) * S, glyphs = [];
    lay.items.forEach(function (it) {
      if (it.ch === ' ') return;
      var gx = ox + it.x;
      if (it.ch === "'") {
        apostrophe(x, gx, base, fs * S);
        glyphs.push({ ch: "'", x0: gx + 0.07 * fs * S, x1: gx + 0.19 * fs * S, y0: base - 0.70 * fs * S, y1: base - 0.46 * fs * S });
        return;
      }
      x.fillText(it.ch, gx, base);
      var mt = x.measureText(it.ch);
      glyphs.push({ ch: it.ch, x0: gx - mt.actualBoundingBoxLeft, x1: gx + mt.actualBoundingBoxRight, y0: base - mt.actualBoundingBoxAscent, y1: base + mt.actualBoundingBoxDescent });
    });
    yield;
    var id = x.getImageData(0, 0, w, h).data, mask = new Float32Array(w * h), i;
    yield;
    for (i = 0; i < w * h; i++) mask[i] = id[4 * i + 3] / 255;
    yield;
    var layer = new Uint8ClampedArray(w * h * 4);
    yield* chromeFillG(mask, w, h, base - 0.7 * fs * S, 0.7 * fs * S, layer);
    return { region: rg, scale: S, w: w, h: h, mask: mask, layer: layer, glyphs: glyphs, fs: fs };
  }

  function initPage() {
    var root = document.getElementById('engraver');
    if (!root) return;
    var stage = document.getElementById('stage'), form = document.getElementById('form'), input = document.getElementById('nameInput');
    var status = document.getElementById('status'), engraved = document.getElementById('engraved');
    var nameC = document.getElementById('nameCanvas'), fxC = document.getElementById('fxCanvas');
    var keys = Array.prototype.slice.call(document.querySelectorAll('.key-card'));
    var imgs = Array.prototype.slice.call(stage.querySelectorAll('img.card'));
    var reduce = window.matchMedia ? window.matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
    var state = { card: '1', name: '', player: null, raf: 0, clock: 0, last: 0, inView: true, job: 0, surfaceW: 0 };

    function setStatus(msg, kind) { status.textContent = msg; if (kind) status.setAttribute('data-kind', kind); else status.removeAttribute('data-kind'); }
    function activeKey() { return keys.filter(function (k) { return k.dataset.card === state.card; })[0] || keys[0]; }
    // put a canvas over its region on whole device pixels (no resampling: the lettering stays crisp)
    function place(el, r) {
      var sr = stage.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1), k = sr.width / 2688;
      var gx = Math.round((sr.left + r.x * k) * dpr) / dpr - sr.left, gy = Math.round((sr.top + r.y * k) * dpr) / dpr - sr.top;
      el.style.left = gx + 'px'; el.style.top = gy + 'px';
      var exact = Math.abs(el.width / dpr - r.w * k) < 2;   // backing store at device resolution: show it 1:1
      el.style.width = (exact ? el.width / dpr : r.w * k) + 'px'; el.style.height = (exact ? el.height / dpr : r.h * k) + 'px';
    }
    function stop() { if (state.raf) cancelAnimationFrame(state.raf); state.raf = 0; }
    function clearFx() { var f = fxC.getContext('2d'); f.setTransform(1, 0, 0, 1, 0, 0); f.clearRect(0, 0, fxC.width, fxC.height); }
    function tilt(t) {
      var P = state.player && state.player.P;
      if (!P || reduce.matches) { stage.style.transform = ''; return; }
      var a = P.sweep0 - 0.35, b = P.sweep1 + 0.45, u = clamp((t - a) / (b - a), 0, 1), e = Math.sin(Math.PI * u);
      e = e * e * (3 - 2 * e);
      stage.style.transform = e > 0 ? 'perspective(1800px) rotateX(' + (1.6 * e).toFixed(3) + 'deg) rotateY(' + (-2.4 * e * Math.cos(Math.PI * u * 0.5)).toFixed(3) + 'deg)' : '';
    }
    function done(name) {
      stop(); stage.style.transform = ''; clearFx();
      root.setAttribute('data-state', 'done');
      engraved.textContent = name; engraved.setAttribute('data-state', 'done');
      stage.setAttribute('aria-label', 'PEPTICITY Platinum Founders Reserve card engraved with the name ' + name);
      setStatus('Your name has been engraved.');
    }
    function frame(now) {
      state.raf = 0;
      var p = state.player; if (!p) return;
      var dt = clamp((now - state.last) / 1000, 0, 0.05); state.last = now; state.clock += dt;
      var finished = p.render(state.clock);
      tilt(state.clock);
      if (finished) { p.finish(); done(state.name); return; }
      if (!document.hidden && state.inView) state.raf = requestAnimationFrame(frame);
    }
    function resume() {
      if (state.player && !state.raf && root.getAttribute('data-state') === 'engraving' && !document.hidden && state.inView) {
        state.last = performance.now(); state.raf = requestAnimationFrame(frame);
      }
    }
    // draw the name: animated (laser) or finished at once
    function engrave(name, animate) {
      var job = ++state.job;
      stop(); state.player = null; stage.style.transform = ''; clearFx();
      var m = metricsFor(activeKey()), stageW = stage.getBoundingClientRect().width || 1200;
      var alive = function () { return job === state.job; };
      var go = function () {
        if (!alive()) return;
        runAsync(buildSurfaceG(name, m, stageW), 6, function (sf) {
          state.surfaceW = stageW;
          nameC.width = sf.w; nameC.height = sf.h; place(nameC, sf.region);
          var nctx = nameC.getContext('2d');
          if (!animate) {
            var img = nctx.createImageData(sf.w, sf.h); img.data.set(sf.layer); nctx.putImageData(img, 0, 0);
            done(name); return;
          }
          var letters = name.replace(/[^A-Z]/g, '').length;
          runAsync(Engraving.build({ layer: sf.layer, letter: sf.mask, w: sf.w, h: sf.h, glyphs: sf.glyphs,
            writeTime: clamp(0.7 + 0.22 * letters, 1.9, 3.4), halo: false }), 6, function (eng) {
            var fr = { x: Math.max(0, sf.region.x - 240), y: Math.max(0, sf.region.y - 280) };
            fr.w = Math.min(2688, sf.region.x + sf.region.w + 240) - fr.x; fr.h = Math.min(1520, sf.region.y + sf.region.h + 260) - fr.y;
            var fs = Math.min(sf.scale, Math.sqrt(1.1e6 / (fr.w * fr.h)));   // the light layer needs less resolution
            fxC.width = Math.ceil(fr.w * fs); fxC.height = Math.ceil(fr.h * fs); place(fxC, fr);
            nctx.clearRect(0, 0, sf.w, sf.h);
            state.player = new Player({ nameCanvas: nameC, fxCanvas: fxC, engraving: eng, region: sf.region, scale: sf.scale, fxRegion: fr,
              appear: 0, ignite: 0.3, sweepDelay: 0.75, sweepTime: 1.5, seed: 5 + name.length });
            state.clock = 0; state.last = performance.now();
            if (!document.hidden && state.inView) state.raf = requestAnimationFrame(frame);
          }, alive);
        }, alive);
        root.setAttribute('data-state', animate ? 'engraving' : 'finishing');
        if (animate) setStatus('Engraving ' + name.toLowerCase().replace(/(^|[ '-])([a-z])/g, function (a, b, c) { return b + c.toUpperCase(); }) + '…');
      };
      var ready = document.fonts && document.fonts.check && document.fonts.check('100px ' + FONT);
      if (ready || !document.fonts || !document.fonts.load) go();
      else document.fonts.load('100px ' + FONT).then(go, go);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = cleanName(input.value);
      if (r.error) {
        var shown = String(input.value).slice(0, 32) + (String(input.value).length > 32 ? '…' : '');
        setStatus(r.bad ? r.error + ' “' + shown + '” can’t be engraved.' : r.error, 'error');
        input.setAttribute('aria-invalid', 'true');
        return;
      }
      input.removeAttribute('aria-invalid');
      state.name = r.name;
      engraved.textContent = ''; engraved.setAttribute('data-state', 'empty');
      engrave(r.name, !reduce.matches);
    });
    input.addEventListener('input', function () { if (input.getAttribute('aria-invalid')) { input.removeAttribute('aria-invalid'); setStatus(''); } });

    keys.forEach(function (k) {
      k.addEventListener('click', function () {
        if (state.card === k.dataset.card) return;
        state.card = k.dataset.card;
        keys.forEach(function (o) { o.setAttribute('aria-pressed', o === k ? 'true' : 'false'); });
        imgs.forEach(function (im) { im.classList.toggle('is-on', im.dataset.card === state.card); });
        stage.setAttribute('data-card', state.card);
        if (state.name && root.getAttribute('data-state') !== 'idle') engrave(state.name, false);  // already seen the laser: show it finished
      });
    });

    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else resume(); });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { state.inView = es[0].isIntersecting; if (!state.inView) stop(); else resume(); }).observe(stage);
    }
    if ('ResizeObserver' in window) {
      new ResizeObserver(function () {
        var w = stage.getBoundingClientRect().width;
        if (root.getAttribute('data-state') === 'done' && state.name && state.surfaceW && Math.abs(w - state.surfaceW) > 0.5) engrave(state.name, false);
      }).observe(stage);
    }
    root.setAttribute('data-ready', 'true');
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initPage); else initPage();

  window.PepEngrave = Object.freeze({
    Engraving: Engraving, Player: Player, chromeFill: chromeFill, letterMaskFromLayer: letterMaskFromLayer, runAsync: runAsync,
    columnBoxes: columnBoxes, cleanName: cleanName, smooth: smooth, clamp: clamp
  });
})();

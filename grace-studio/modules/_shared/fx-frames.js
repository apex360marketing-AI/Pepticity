/* SELECTION STUDIO · frame-sequence painter for scroll-scrubbed Higgsfield films (manifest-a).
   FX.frames({ url: i => '...', n, canvas, focus:[x,y] }) -> { draw(f), loaded(), rect }
   - loads progressively (every 8th frame first, then 4th, 2nd, all) so a scrub works within a second
   - draws the nearest loaded frame, cover-fit, device resolution; cross-fades to the next frame only while moving,
     and settles on one whole frame when the scroll stops (nothing double-exposed) */
(function () {
  'use strict';
  window.FX = window.FX || {};
  FX.frames = function (o) {
    var n = o.n, imgs = new Array(n), ok = new Uint8Array(n), req = new Uint8Array(n), queue = [], active = 0, dirty = true;
    var c = o.canvas, ctx = c.getContext('2d'), W = 0, H = 0, focus = o.focus || [0.5, 0.5];
    var order = [];
    [8, 4, 2, 1].forEach(function (s) { for (var i = 0; i < n; i += s) if (order.indexOf(i) < 0) order.push(i); });
    if (order.indexOf(n - 1) < 0) order.splice(1, 0, n - 1);
    function want(list, front) { var jobs = list.filter(function (i) { return i >= 0 && i < n && !req[i]; }); jobs.forEach(function (i) { req[i] = 1; }); queue = front ? jobs.concat(queue) : queue.concat(jobs); pump(); }
    function pump() {
      while (active < (o.parallel || 6) && queue.length) (function (i) {
        var img = new Image(); active++; img.decoding = 'async';
        var done = function () { active--; pump(); };
        img.onload = function () { var fin = function () { imgs[i] = img; ok[i] = 1; dirty = true; if (FX.wake) FX.wake(); done(); }; if (img.decode) img.decode().then(fin, fin); else fin(); };
        img.onerror = function () { req[i] = 0; done(); };
        img.src = o.url(i);
      })(queue.shift());
    }
    function nearest(f) { for (var d = 0; d < n; d++) { if (f - d >= 0 && ok[f - d]) return f - d; if (f + d < n && ok[f + d]) return f + d; } return -1; }
    var P = { rect: { x: 0, y: 0, w: 0, h: 0 }, last: -1, lf: null, moveT: 0, still: true };
    P.resize = function () {
      var r = Math.min(window.devicePixelRatio || 1, o.maxDpr || 2);
      W = c.clientWidth || innerWidth; H = c.clientHeight || innerHeight;
      c.width = Math.round(W * r); c.height = Math.round(H * r);
      ctx.setTransform(r, 0, 0, r, 0, 0); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; dirty = true;
    };
    P.loaded = function () { var k = 0; for (var i = 0; i < n; i++) k += ok[i]; return k; };
    P.draw = function (f, zoom, ox) {
      zoom = zoom || 1; ox = ox || 0;
      f = Math.min(Math.max(f, 0), n - 1);
      var now = performance.now();
      if (P.lf === null || Math.abs(f - P.lf) > 0.0005) { P.moveT = now; P.lf = f; }
      var still = now - P.moveT > 180;
      if (!dirty && Math.abs(f - P.last) < 0.003 && still === P.still && zoom === P.zoom && ox === P.ox) return false;
      P.still = still; P.zoom = zoom; P.ox = ox;
      var i = still ? Math.round(f) : Math.floor(f), fr = still ? 0 : f - i, a = ok[i] ? i : nearest(i);
      if (a < 0) return false;
      var A = imgs[a], iw = A.naturalWidth, ih = A.naturalHeight;
      var sc = Math.max(W / iw, H / ih) * zoom, dw = iw * sc, dh = ih * sc;
      var dx = (W - dw) * focus[0] + ox * W, dy = (H - dh) * focus[1];
      if (dx > 0 || dy > 0 || dx + dw < W || dy + dh < H) { ctx.fillStyle = o.fill || '#030304'; ctx.fillRect(0, 0, W, H); }
      ctx.globalAlpha = 1; ctx.drawImage(A, dx, dy, dw, dh);
      if (fr > 0.02 && a === i && i + 1 < n && ok[i + 1]) { ctx.globalAlpha = fr; ctx.drawImage(imgs[i + 1], dx, dy, dw, dh); ctx.globalAlpha = 1; }
      P.rect = { x: dx, y: dy, w: dw, h: dh }; P.last = f; dirty = false;
      return !still;
    };
    P.want = want;
    P.resize(); addEventListener('resize', P.resize);
    want(order.slice(0, 2), true); want(order);
    return P;
  };
})();

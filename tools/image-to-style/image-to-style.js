/* image-to-style.js  (no dependencies, browser)
 * Measure a dropped image from its PIXELS and turn it into CSS tokens.
 * Same maths as tools/image-to-style/extract.py (OKLab k-means, frame-median bg,
 * accent only when a real chroma outlier exists, offset-blend seamless tile).
 *
 *   const style = await ImageToStyle.extract(fileOrImageOrUrl, { k: 8, tile: 512 });
 *   // style = { palette:[{hex,oklch,share}], tokens:{bg,surface,ink,muted,accent}, tileDataURL, grain }
 *   ImageToStyle.applyTokens(document.documentElement, style);
 *   // sets --bg --surface --ink --muted --accent --texture (accent removed when none measured)
 *
 * Works as a classic <script> (window.ImageToStyle) or an ES/CommonJS import.
 */
(function (root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.ImageToStyle = api;
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // ---------- colour maths (Ottosson OKLab, https://bottosson.github.io/posts/oklab/)
  const toLin = c => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const toSrgb = c => { c = Math.min(1, Math.max(0, c)); return Math.round((c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055) * 255); };
  function rgbToOklab(r, g, b) {
    r = toLin(r); g = toLin(g); b = toLin(b);
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806675834 * g + 0.1073304186 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    return [0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
            1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
            0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s];
  }
  function oklabToRgb(L, a, b) {
    const l = Math.pow(L + 0.3963377774 * a + 0.2158037573 * b, 3);
    const m = Math.pow(L - 0.1055613458 * a - 0.0638541728 * b, 3);
    const s = Math.pow(L - 0.0894841775 * a - 1.2914855480 * b, 3);
    return [toSrgb(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
            toSrgb(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
            toSrgb(-0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s)];
  }
  const hex = ([r, g, b]) => '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  function entry(lab, share) {
    const C = Math.hypot(lab[1], lab[2]);
    const h = C > 0.002 ? ((Math.atan2(lab[2], lab[1]) * 180 / Math.PI) + 360) % 360 : 0;
    const e = { hex: hex(oklabToRgb(lab[0], lab[1], lab[2])), oklch: `oklch(${lab[0].toFixed(3)} ${C.toFixed(4)} ${h.toFixed(1)})`, L: lab[0], C, h };
    if (share != null) e.share = +share.toFixed(4);
    return e;
  }
  const dist = (p, q) => Math.hypot(p[0] - q[0], p[1] - q[1], p[2] - q[2]);
  const median = arr => { const s = Float64Array.from(arr).sort(); return s.length ? s[s.length >> 1] : 0; };
  const median3 = pts => [0, 1, 2].map(i => median(pts.map(p => p[i])));

  // ---------- load anything into an <img>/bitmap
  async function toBitmap(src) {
    if (src instanceof HTMLCanvasElement || (typeof ImageBitmap !== 'undefined' && src instanceof ImageBitmap)) return src;
    if (src instanceof HTMLImageElement) { if (!src.complete) await src.decode(); return src; }
    const url = (typeof src === 'string') ? src : URL.createObjectURL(src);
    const img = new Image(); img.crossOrigin = 'anonymous'; img.src = url; await img.decode();
    return img;
  }
  function pixels(bmp, maxSide, allowUp) {
    const w0 = bmp.naturalWidth || bmp.width, h0 = bmp.naturalHeight || bmp.height;
    const s = allowUp ? maxSide / Math.max(w0, h0) : Math.min(1, maxSide / Math.max(w0, h0));
    const w = Math.max(1, Math.ceil(w0 * s)), h = Math.max(1, Math.ceil(h0 * s));
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high'; ctx.drawImage(bmp, 0, 0, w, h);
    return { w, h, data: ctx.getImageData(0, 0, w, h).data, canvas: c };
  }

  // ---------- k-means in OKLab (k-means++ init, seeded, deterministic)
  function kmeans(X, k, iters = 30, seed = 7) {
    let st = seed; const rnd = () => ((st = (st * 1664525 + 1013904223) >>> 0) / 4294967296);
    const C = [X[Math.floor(rnd() * X.length)].slice()];
    const d2 = X.map(x => dist(x, C[0]) ** 2);
    while (C.length < k) {
      const tot = d2.reduce((a, b) => a + b, 0); let r = rnd() * tot, i = 0;
      while (i < X.length - 1 && (r -= d2[i]) > 0) i++;
      C.push(X[i].slice()); for (let j = 0; j < X.length; j++) d2[j] = Math.min(d2[j], dist(X[j], C[C.length - 1]) ** 2);
    }
    const lab = new Int32Array(X.length);
    for (let it = 0; it < iters; it++) {
      const sum = C.map(() => [0, 0, 0, 0]);
      for (let j = 0; j < X.length; j++) {
        let b = 0, bd = Infinity;
        for (let c = 0; c < k; c++) { const d = dist(X[j], C[c]); if (d < bd) { bd = d; b = c; } }
        lab[j] = b; const s = sum[b]; s[0] += X[j][0]; s[1] += X[j][1]; s[2] += X[j][2]; s[3]++;
      }
      let moved = 0;
      for (let c = 0; c < k; c++) if (sum[c][3]) { const n = [sum[c][0] / sum[c][3], sum[c][1] / sum[c][3], sum[c][2] / sum[c][3]]; moved += dist(n, C[c]); C[c] = n; }
      if (moved < 1e-6) break;
    }
    const counts = C.map((_, c) => lab.reduce((a, l) => a + (l === c), 0));
    // merge near-duplicates (dE_ok < 2)
    let cl = C.map((c, i) => ({ c, n: counts[i] })).filter(o => o.n > 0);
    for (let merged = true; merged;) {
      merged = false;
      outer: for (let i = 0; i < cl.length; i++) for (let j = i + 1; j < cl.length; j++) if (dist(cl[i].c, cl[j].c) < 0.02) {
        const n = cl[i].n + cl[j].n; cl[i] = { c: cl[i].c.map((v, t) => (v * cl[i].n + cl[j].c[t] * cl[j].n) / n), n };
        cl.splice(j, 1); merged = true; break outer;
      }
    }
    const tot = cl.reduce((a, o) => a + o.n, 0);
    return cl.map(o => ({ lab: o.c, share: o.n / tot })).sort((a, b) => b.share - a.share);
  }

  // ---------- seamless tile: most representative low-structure window, offset + variance-preserving blend
  function makeTile(bmp, bgLab, size) {
    const w0 = bmp.naturalWidth || bmp.width, h0 = bmp.naturalHeight || bmp.height;
    const up = Math.max(1, size / Math.min(w0, h0));
    const big = pixels(bmp, Math.max(w0, h0) * up, up > 1);
    const { w, h, data } = big;
    const L = new Float32Array(w * h), A = new Float32Array(w * h), B = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) { const o = rgbToOklab(data[i * 4], data[i * 4 + 1], data[i * 4 + 2]); L[i] = o[0]; A[i] = o[1]; B[i] = o[2]; }
    let mean = 0; for (const v of L) mean += v; mean /= L.length;
    let sd = 0; for (const v of L) sd += (v - mean) ** 2; sd = Math.sqrt(sd / L.length) + 1e-6;
    const hi = Float32Array.from(L).sort()[Math.floor(L.length * 0.98)];
    const step = Math.max(16, size >> 3), q = size >> 2;
    let best = null;
    for (let y = 0; y + size <= h; y += step) for (let x = 0; x + size <= w; x += step) {
      const cm = [], bs = []; let lsum = 0, asum = 0, bsum = 0, hot = 0, n = 0;
      for (let by = 0; by < 4; by++) for (let bx = 0; bx < 4; bx++) {
        let s = 0, s2 = 0, c = 0;
        for (let yy = y + by * q; yy < y + (by + 1) * q; yy += 4) for (let xx = x + bx * q; xx < x + (bx + 1) * q; xx += 4) {
          const i = yy * w + xx; s += L[i]; s2 += L[i] * L[i]; asum += A[i]; bsum += B[i]; hot += L[i] > hi; c++;
        }
        cm.push(s / c); bs.push(Math.sqrt(Math.max(0, s2 / c - (s / c) ** 2))); lsum += s; n += c;
      }
      const cmu = cm.reduce((a, b) => a + b, 0) / 16;
      const structure = Math.sqrt(cm.reduce((a, b) => a + (b - cmu) ** 2, 0) / 16) / sd;
      const off = Math.abs(lsum / n - bgLab[0]) / sd + Math.hypot(asum / n - bgLab[1], bsum / n - bgLab[2]) * 50;
      const bmu = bs.reduce((a, b) => a + b, 0) / 16;
      const uneven = Math.sqrt(bs.reduce((a, b) => a + (b - bmu) ** 2, 0) / 16) / (bmu + 1e-6);
      const score = structure * 3 + (hot / n) * 20 + off + uneven * 2;
      if (!best || score < best.score) best = { score, x, y, structure: structure * sd, highlights: hot / n, uneven };
    }
    const c = document.createElement('canvas'); c.width = c.height = size;
    const ctx = c.getContext('2d');
    const src = big.canvas.getContext('2d').getImageData(best.x, best.y, size, size).data;
    const out = ctx.createImageData(size, size);
    const mu = [0, 0, 0]; for (let i = 0; i < size * size; i++) for (let k = 0; k < 3; k++) mu[k] += src[i * 4 + k] / (size * size);
    const ramp = new Float32Array(size); for (let i = 0; i < size; i++) ramp[i] = Math.sin(Math.PI * i / (size - 1)) ** 2;
    const half = size >> 1;
    // 4 copies (as-is, half-shift x, y, both); each copy's seam sits where its weight is 0
    for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
      const wx = ramp[x], wy = ramp[y], ys = (y + half) % size, xs = (x + half) % size;
      const W = [wx * wy, (1 - wx) * wy, wx * (1 - wy), (1 - wx) * (1 - wy)];
      const P = [(y * size + x) * 4, (y * size + xs) * 4, (ys * size + x) * 4, (ys * size + xs) * 4];
      const norm = Math.sqrt(W[0] ** 2 + W[1] ** 2 + W[2] ** 2 + W[3] ** 2), i = P[0];
      for (let k = 0; k < 3; k++) out.data[i + k] = mu[k] + (W[0] * (src[P[0] + k] - mu[k]) + W[1] * (src[P[1] + k] - mu[k]) + W[2] * (src[P[2] + k] - mu[k]) + W[3] * (src[P[3] + k] - mu[k])) / norm;
      out.data[i + 3] = 255;
    }
    ctx.putImageData(out, 0, 0);
    return { dataURL: c.toDataURL('image/png'), crop: [best.x / up, best.y / up, size / up, size / up],
             isTexture: best.structure < 0.02 && best.highlights < 0.04 && best.uneven < 0.4 };
  }

  // ---------- main
  async function extract(src, opts = {}) {
    const k = opts.k || 8, tileSize = opts.tile || 512;
    const bmp = await toBitmap(src);
    const t = pixels(bmp, 200);
    const X = []; for (let i = 0; i < t.w * t.h; i++) X.push(rgbToOklab(t.data[i * 4], t.data[i * 4 + 1], t.data[i * 4 + 2]));
    const clusters = kmeans(X, k);
    const palette = clusters.map(c => entry(c.lab, c.share));

    const f = pixels(bmp, 800), FL = [];
    for (let i = 0; i < f.w * f.h; i++) FL.push(rgbToOklab(f.data[i * 4], f.data[i * 4 + 1], f.data[i * 4 + 2]));
    const b = Math.max(2, Math.round(Math.min(f.w, f.h) * 0.06)), frame = [];
    for (let y = 0; y < f.h; y++) for (let x = 0; x < f.w; x++) if (y < b || y >= f.h - b || x < b || x >= f.w - b) frame.push(FL[y * f.w + x]);
    const bg = median3(frame), dark = bg[0] < 0.6, dir = dark ? 1 : -1;

    const Ls = FL.map(p => p[0]).sort((p, q) => p - q);
    const cut = dark ? Ls[Math.floor(Ls.length * 0.99)] : Ls[Math.floor(Ls.length * 0.01)];
    const ink = median3(FL.filter(p => dark ? p[0] >= cut : p[0] <= cut));
    const surfC = clusters.filter(c => (c.lab[0] - bg[0]) * dir >= 0.015 && (c.lab[0] - bg[0]) * dir <= 0.12 && c.share >= 0.02);
    const surface = surfC.length ? surfC.sort((p, q) => q.share - p.share)[0].lab : [bg[0] + 0.04 * dir, bg[1], bg[2]];
    const mid = (bg[0] + ink[0]) / 2;
    let muted = clusters.slice().sort((p, q) => (Math.abs(p.lab[0] - mid) + 0.5 * Math.hypot(p.lab[1], p.lab[2])) - (Math.abs(q.lab[0] - mid) + 0.5 * Math.hypot(q.lab[1], q.lab[2])))[0].lab;
    if (Math.abs(muted[0] - mid) > 0.2) muted = [mid, (bg[1] + ink[1]) / 2, (bg[2] + ink[2]) / 2];

    // accent only from real chroma outliers (never invented)
    const Cs = FL.map(p => Math.hypot(p[1], p[2]));
    const medC = median(Cs), mad = median(Cs.map(c => Math.abs(c - medC))) + 1e-4;
    const thr = Math.max(0.05, medC + 6 * mad);
    const hot = FL.filter((p, i) => Cs[i] > thr);
    let accent = null;
    if (hot.length / FL.length >= 0.001) {
      const bins = new Array(36).fill(0), hues = hot.map(p => ((Math.atan2(p[2], p[1]) * 180 / Math.PI) + 360) % 360);
      hues.forEach(hh => bins[Math.floor(hh / 10) % 36]++);
      const centre = bins.indexOf(Math.max(...bins)) * 10 + 5;
      const sel = hot.filter((p, i) => Math.abs(((hues[i] - centre) + 540) % 360 - 180) < 20);
      accent = entry(median3(sel), sel.length / FL.length);
    }
    // grain: fine high-pass std (3x3 box) on L
    let gs = 0, gn = 0;
    for (let y = 1; y < f.h - 1; y++) for (let x = 1; x < f.w - 1; x++) {
      let s = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) s += FL[(y + dy) * f.w + x + dx][0];
      const d = FL[y * f.w + x][0] - s / 9; gs += d * d; gn++;
    }
    const tile = opts.tile === 0 ? null : makeTile(bmp, bg, tileSize);
    return {
      palette,
      tokens: { mode: dark ? 'dark' : 'light', bg: entry(bg), surface: entry(surface), ink: entry(ink), muted: entry(muted), accent },
      grain: { fineStdL: Math.sqrt(gs / Math.max(gn, 1)) },
      tileDataURL: tile && tile.dataURL,
      tile: tile && { crop: tile.crop, isTexture: tile.isTexture },
    };
  }

  function applyTokens(root, style) {
    root = root || document.documentElement;
    const t = style.tokens, set = (k, v) => root.style.setProperty(k, v);
    ['bg', 'surface', 'ink', 'muted'].forEach(k => set('--' + k, t[k].hex));
    if (t.accent) set('--accent', t.accent.hex); else root.style.removeProperty('--accent');
    if (style.tileDataURL) set('--texture', `url("${style.tileDataURL}")`);
    root.dispatchEvent(new CustomEvent('image-to-style:applied', { detail: style, bubbles: true }));
    return style;
  }

  return { extract, applyTokens, rgbToOklab, oklabToRgb };
});

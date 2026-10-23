#!/usr/bin/env node
// extract.mjs - dependency-free palette extraction from a PNG (Node 18+).
// Decodes non-interlaced 8-bit PNG (grey, grey+alpha, RGB, RGBA, indexed), samples pixels,
// runs seeded k-means++ in OKLab, and proposes roles. JPEG/WebP: convert first, e.g.
//   magick hero.jpg -resize 256x256 hero.png   |   sips -s format png hero.jpg --out hero.png
//   ffmpeg -i hero.jpg -vf scale=256:-1 hero.png
// Usage: node extract.mjs <file.png> [k=6] [--json]
import { readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';

export function decodePNG(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let p = 8, w, h, depth, type, interlace, plte, trns, idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p), t = buf.toString('ascii', p + 4, p + 8), d = buf.subarray(p + 8, p + 8 + len);
    if (t === 'IHDR') { w = d.readUInt32BE(0); h = d.readUInt32BE(4); depth = d[8]; type = d[9]; interlace = d[12]; }
    else if (t === 'PLTE') plte = d; else if (t === 'tRNS') trns = d; else if (t === 'IDAT') idat.push(d); else if (t === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8 || interlace) throw new Error('only 8-bit non-interlaced PNG; re-export (magick in.png -depth 8 -interlace none out.png)');
  const ch = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[type], stride = w * ch, raw = inflateSync(Buffer.concat(idat));
  const px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], src = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= ch ? px[y * stride + x - ch] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= ch && y ? px[(y - 1) * stride + x - ch] : 0;
      let v = src[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const q = a + b - c, pa = Math.abs(q - a), pb = Math.abs(q - b), pc = Math.abs(q - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  const rgba = i => { const o = i * ch;
    if (type === 2) return [px[o], px[o + 1], px[o + 2], 255];
    if (type === 6) return [px[o], px[o + 1], px[o + 2], px[o + 3]];
    if (type === 0) return [px[o], px[o], px[o], 255];
    if (type === 4) return [px[o], px[o], px[o], px[o + 1]];
    const k = px[o]; return [plte[k * 3], plte[k * 3 + 1], plte[k * 3 + 2], trns && k < trns.length ? trns[k] : 255]; };
  return { w, h, rgba };
}

const lin = c => (c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
const gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function toLab([r, g, b]) { [r, g, b] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b), m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b), s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s, 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s, 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s]; }
function toHex([L, a, b]) { const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3, m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3, s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return '#' + [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s]
    .map(v => Math.round(Math.min(1, Math.max(0, gam(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join(''); }
const lch = ([L, a, b]) => ({ L, C: Math.hypot(a, b), H: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 });
const banned = (hex, { C, H }) => hex === '#d4ff3a' ? null : C >= 0.04 && H >= 65 && H < 105 ? 'gold/amber zone' : C >= 0.04 && H >= 105 && H <= 175 ? 'green zone' : null;

export function extract({ w, h, rgba }, k = 6, maxSamples = 20000) {
  const step = Math.max(1, Math.floor(Math.sqrt((w * h) / maxSamples))), pts = [];
  for (let y = 0; y < h; y += step) for (let x = 0; x < w; x += step) { const c = rgba(y * w + x); if (c[3] >= 128) pts.push(toLab(c)); }
  if (!pts.length) throw new Error('image is fully transparent');
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const d2 = (p, q) => (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2 + (p[2] - q[2]) ** 2;
  const cent = [pts[Math.floor(rnd() * pts.length)]];               // k-means++ seeding
  while (cent.length < Math.min(k, pts.length)) { const ds = pts.map(p => Math.min(...cent.map(c => d2(p, c)))), tot = ds.reduce((a, b) => a + b, 0);
    let r = rnd() * tot, i = 0; while ((r -= ds[i]) > 0 && i < ds.length - 1) i++; cent.push(pts[i]); }
  let assign = new Array(pts.length).fill(0);
  for (let it = 0; it < 15; it++) {
    assign = pts.map(p => { let best = 0, bd = Infinity; cent.forEach((c, j) => { const d = d2(p, c); if (d < bd) { bd = d; best = j; } }); return best; });
    cent.forEach((_, j) => { const mem = pts.filter((_, i) => assign[i] === j); if (mem.length) cent[j] = [0, 1, 2].map(n => mem.reduce((s, p) => s + p[n], 0) / mem.length); });
  }
  const clusters = cent.map((c, j) => { const n = assign.filter(a => a === j).length, hex = toHex(c), o = lch(c);
    return { hex, share: n / pts.length, L: o.L, C: o.C, H: o.H, banned: banned(hex, o) }; }).filter(c => c.share > 0).sort((a, b) => b.share - a.share);
  // roles: ground = largest low-chroma cluster; accent = best share*chroma that is allowed; ink = extreme lightness opposite the ground
  const ground = clusters.find(c => c.C < 0.06) ?? clusters[0];
  const accent = clusters.filter(c => c !== ground && !c.banned && c.C >= 0.06).sort((a, b) => b.share * b.C - a.share * a.C)[0] ?? null;
  const ink = clusters.filter(c => c !== ground).sort((a, b) => Math.abs(b.L - ground.L) - Math.abs(a.L - ground.L))[0] ?? null;
  const rejected = clusters.filter(c => c.banned && c.C >= 0.06);
  return { clusters, roles: { ground: ground.hex, ink: ink?.hex ?? null, accent: accent?.hex ?? null, mode: ground.L < 0.5 ? 'dark' : 'light' }, rejected };
}

if (process.argv[1]?.endsWith('extract.mjs')) {
  const file = process.argv[2]; if (!file) { console.log('usage: node extract.mjs <file.png> [k=6] [--json]'); process.exit(1); }
  const res = extract(decodePNG(readFileSync(file)), +(process.argv[3] && !process.argv[3].startsWith('--') ? process.argv[3] : 6));
  if (process.argv.includes('--json')) console.log(JSON.stringify(res, null, 1));
  else { for (const c of res.clusters) console.log(`${c.hex}  ${(c.share * 100).toFixed(1).padStart(5)}%  oklch(${(c.L * 100).toFixed(1)}% ${c.C.toFixed(3)} ${c.H.toFixed(0)})${c.banned ? '  BANNED: ' + c.banned : ''}`);
    console.log('roles:', JSON.stringify(res.roles)); if (res.rejected.length) console.log('rejected (taste rules):', res.rejected.map(c => c.hex).join(' ')); }
}

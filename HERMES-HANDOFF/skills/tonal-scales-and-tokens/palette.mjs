#!/usr/bin/env node
// palette.mjs - dependency-free colour kit (Node 18+). OKLab/OKLCH maths, gamut fitting,
// 12-step tonal ramps, perceptual mixing, WCAG 2.2 ratio, APCA Lc (0.0.98G-4g, advisory),
// colour-vision-deficiency simulation, banned-hue checks and CSS/DTCG token output.
// Usage: node palette.mjs <command> [args]   (run with no args for help)

// ---------- conversions ----------
const lin = c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const gam = c => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const clamp01 = x => Math.min(1, Math.max(0, x));

export function parseHex(h) {
  h = String(h).trim().replace(/^#/, '');
  if (h.length === 3) h = [...h].map(x => x + x).join('');
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`bad hex: ${h}`);
  return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255);
}
export function rgbToOklab([r, g, b]) {
  [r, g, b] = [r, g, b].map(lin);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return { L: 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
           a: 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
           b: 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s };
}
export function oklabToLinear({ L, a, b }) {
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
          -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
          -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
export const labToLch = ({ L, a, b }) => ({ L, C: Math.hypot(a, b), H: (Math.atan2(b, a) * 180 / Math.PI + 360) % 360 });
export const lchToLab = ({ L, C, H }) => ({ L, a: C * Math.cos(H * Math.PI / 180), b: C * Math.sin(H * Math.PI / 180) });
export const hexToOklch = h => labToLch(rgbToOklab(parseHex(h)));
export const hexToOklab = h => rgbToOklab(parseHex(h));
const inGamut = v => v.every(x => x >= -1e-5 && x <= 1 + 1e-5);

// Gamut map: keep L and H, binary-search the largest in-sRGB chroma (CSS Color 4 style, simplified).
export function fit(c) {
  c = { ...c, L: clamp01(c.L) };
  if (inGamut(oklabToLinear(lchToLab(c)))) return c;
  let lo = 0, hi = c.C;
  for (let i = 0; i < 24; i++) { const mid = (lo + hi) / 2; inGamut(oklabToLinear(lchToLab({ ...c, C: mid }))) ? (lo = mid) : (hi = mid); }
  return { ...c, C: lo };
}
export const maxChroma = (L, H) => fit({ L, C: 0.4, H }).C;
export function lchToHex(c) {
  const v = oklabToLinear(lchToLab(fit(c)));
  return '#' + v.map(x => Math.round(clamp01(gam(clamp01(x))) * 255).toString(16).padStart(2, '0')).join('');
}
export const labToHex = lab => lchToHex(labToLch(lab));
export const css = c => `oklch(${(c.L * 100).toFixed(1)}% ${c.C.toFixed(3)} ${c.H.toFixed(1)})`;
export const deltaE = (h1, h2) => { const a = hexToOklab(h1), b = hexToOklab(h2); return Math.hypot(a.L - b.L, a.a - b.a, a.b - b.b); };

// ---------- contrast ----------
const relLum = hex => { const [r, g, b] = parseHex(hex).map(lin); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
export function wcag(fg, bg) { const [x, y] = [relLum(fg), relLum(bg)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); }
// APCA-W3 0.0.98G-4g constants. Signed: + = dark text on light, - = light text on dark.
export function apca(txt, bg) {
  const Y = hex => { const [r, g, b] = parseHex(hex); let y = 0.2126729 * r ** 2.4 + 0.7151522 * g ** 2.4 + 0.072175 * b ** 2.4;
    return y < 0.022 ? y + (0.022 - y) ** 1.414 : y; };
  const yt = Y(txt), yb = Y(bg);
  if (Math.abs(yb - yt) < 0.0005) return 0;
  let out;
  if (yb > yt) { const s = (yb ** 0.56 - yt ** 0.57) * 1.14; out = s < 0.1 ? 0 : s - 0.027; }
  else { const s = (yb ** 0.65 - yt ** 0.62) * 1.14; out = s > -0.1 ? 0 : s + 0.027; }
  return out * 100;
}
export function grade(fg, bg) {
  const r = wcag(fg, bg), lc = apca(fg, bg), a = Math.abs(lc);
  const w = r >= 7 ? 'AAA' : r >= 4.5 ? 'AA' : r >= 3 ? 'AA-large/UI' : 'FAIL';
  const p = a >= 90 ? 'body-pref' : a >= 75 ? 'body-min' : a >= 60 ? 'content' : a >= 45 ? 'large/heading' : a >= 30 ? 'spot/non-text' : 'invisible';
  return { ratio: +r.toFixed(2), wcag: w, Lc: +lc.toFixed(1), apca: p };
}

// ---------- colour vision deficiency (Machado 2009, severity 1, linear RGB) ----------
const CVD = {
  protan: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
  deutan: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.01182, 0.04294, 0.968881]],
  tritan: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.3039]],
};
export function simulate(hex, type) {
  const v = parseHex(hex).map(lin), M = CVD[type];
  return '#' + M.map(r => Math.round(clamp01(gam(clamp01(r[0] * v[0] + r[1] * v[1] + r[2] * v[2]))) * 255).toString(16).padStart(2, '0')).join('');
}

// ---------- taste rules (owner) ----------
export function banned(hex) {
  if (hex.toLowerCase() === '#d4ff3a') return null; // the one allowed chartreuse spark
  const { C, H } = hexToOklch(hex);
  if (C >= 0.04 && H >= 65 && H < 105) return 'gold/amber/mustard/champagne zone';
  if (C >= 0.04 && H >= 105 && H <= 175) return 'green/mint/lime zone';
  return null;
}
export const blueLed = hex => { const { C, H } = hexToOklch(hex); return C >= 0.08 && H >= 230 && H <= 320; };

// ---------- mixing ----------
export function mix(h1, h2, t = 0.5, space = 'oklab') {
  if (space === 'srgb') { const a = parseHex(h1), b = parseHex(h2); return '#' + a.map((x, i) => Math.round((x + (b[i] - x) * t) * 255).toString(16).padStart(2, '0')).join(''); }
  if (space === 'oklch') { const a = hexToOklch(h1), b = hexToOklch(h2);
    if (a.C < 0.01) a.H = b.H; if (b.C < 0.01) b.H = a.H; // powerless hue: borrow the other
    let dh = ((b.H - a.H + 540) % 360) - 180; return lchToHex({ L: a.L + (b.L - a.L) * t, C: a.C + (b.C - a.C) * t, H: (a.H + dh * t + 360) % 360 }); }
  const a = hexToOklab(h1), b = hexToOklab(h2);
  return labToHex({ L: a.L + (b.L - a.L) * t, a: a.a + (b.a - a.a) * t, b: a.b + (b.b - a.b) * t });
}

// ---------- 12-step ramp (Radix-style roles) ----------
// 1 app bg | 2 subtle bg | 3-5 component bg (rest/hover/active) | 6-8 borders (subtle/default/strong+focus)
// 9 solid (brand) | 10 solid hover | 11 low-contrast text | 12 high-contrast text
const LIGHT_L = [0.993, 0.982, 0.958, 0.93, 0.9, 0.865, 0.815, 0.745, null, null, 0.52, 0.26];
const DARK_L  = [0.165, 0.195, 0.235, 0.265, 0.3, 0.345, 0.405, 0.49, null, null, 0.8, 0.94];
const C_K     = [0.06, 0.12, 0.25, 0.35, 0.45, 0.55, 0.66, 0.8, 1, 1, 0.8, 0.35];
export function ramp(hex, mode = 'light', { neutral = false } = {}) {
  const b = hexToOklch(hex), cMax = neutral ? Math.min(0.018, b.C) : b.C;
  const Ls = mode === 'light' ? LIGHT_L : DARK_L;
  const steps = Ls.map((L, i) => {
    if (i === 8) L = neutral ? (mode === 'light' ? 0.58 : 0.6) : mode === 'dark' ? Math.max(b.L, 0.52) : b.L; // dark: lift deep brands off the ground
    if (i === 9) L = neutral ? (mode === 'light' ? 0.54 : 0.65) : mode === 'dark' ? Math.max(b.L, 0.52) + 0.04 : b.L + (b.L > 0.6 ? -0.03 : -0.045);
    const darkBoost = mode === 'dark' && i < 8 ? 0.85 : 1;
    return fit({ L, C: cMax * C_K[i] * darkBoost, H: b.H });
  });
  const hexes = steps.map(lchToHex);
  // enforce text contrast against step 2: 11 >= 4.5:1, 12 >= 7:1 (move L away from the ground)
  for (const [i, target] of [[10, 4.5], [11, 7]]) {
    let s = steps[i], k = 0;
    while (wcag(lchToHex(s), hexes[1]) < target && k++ < 80) s = fit({ ...s, L: s.L + (mode === 'light' ? -0.005 : 0.005), C: s.C });
    steps[i] = s; hexes[i] = lchToHex(s);
  }
  return steps.map((s, i) => ({ step: i + 1, hex: hexes[i], oklch: css(fit(s)) }));
}
// readable ink for a solid step-9 fill
export const onSolid = (hex, dark = '#111111', light = '#ffffff') => (Math.abs(apca(dark, hex)) >= Math.abs(apca(light, hex)) ? dark : light);

// ---------- tokens ----------
export function tokens(accent, { name = 'accent', neutralHue } = {}) {
  const nh = neutralHue ?? hexToOklch(accent).H;
  const nSeed = lchToHex({ L: 0.5, C: 0.018, H: nh });
  const set = mode => ({ a: ramp(accent, mode), n: ramp(nSeed, mode, { neutral: true }) });
  const block = ({ a, n }) => [...n.map(s => `  --gray-${s.step}: ${s.oklch}; /* ${s.hex} */`), ...a.map(s => `  --${name}-${s.step}: ${s.oklch}; /* ${s.hex} */`),
    `  --${name}-contrast: ${onSolid(a[8].hex)};`, `  --bg: var(--gray-1); --surface: var(--gray-2); --line: var(--gray-6);`,
    `  --ink: var(--gray-12); --muted: var(--gray-11); --accent: var(--${name}-9); --focus: var(--${name}-8);`].join('\n');
  const L = set('light'), D = set('dark');
  return { css: `:root{\n${block(L)}\n}\n@media (prefers-color-scheme: dark){:root:not([data-theme="light"]){\n${block(D)}\n}}\n:root[data-theme="dark"]{\n${block(D)}\n}\nbody{background:var(--bg);color:var(--ink)}`, light: L, dark: D };
}
export function dtcg(accent, name = 'accent') {
  const t = tokens(accent, { name }), out = {};
  for (const mode of ['light', 'dark']) { out[mode] = { gray: {}, [name]: {} };
    for (const [k, arr] of [['gray', t[mode].n], [name, t[mode].a]]) for (const s of arr) {
      const c = hexToOklch(s.hex);
      out[mode][k][s.step] = { $type: 'color', $value: { colorSpace: 'oklch', components: [+c.L.toFixed(4), +c.C.toFixed(4), +c.H.toFixed(2)], hex: s.hex } };
    } }
  return out;
}

// ---------- gradient ----------
export function gradient(h1, h2, n = 7) {
  const row = space => Array.from({ length: n }, (_, i) => mix(h1, h2, i / (n - 1), space));
  const minC = arr => Math.min(...arr.map(h => hexToOklch(h).C));
  const res = {}; for (const s of ['srgb', 'oklab', 'oklch']) res[s] = { stops: row(s), minChroma: +minC(row(s)).toFixed(3) };
  return res;
}

// ---------- CLI ----------
const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('palette.mjs');
if (isMain) {
  const [cmd, ...args] = process.argv.slice(2);
  const flag = (f, d) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : d; };
  const pos = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
  const pad = (s, n) => String(s).padEnd(n);
  const info = h => { const c = hexToOklch(h), w = grade(h, '#ffffff'), k = grade(h, '#000000'), bn = banned(h);
    return `${pad(h, 8)} ${pad(css(c), 26)} vs white ${pad(w.ratio + ':1', 8)} Lc ${pad(w.Lc, 6)} | vs black ${pad(k.ratio + ':1', 8)} Lc ${pad(k.Lc, 6)}${bn ? '  BANNED: ' + bn : ''}${blueLed(h) ? '  (blue/purple: do not lead with it)' : ''}`; };
  switch (cmd) {
    case 'info': pos.forEach(h => console.log(info(h))); break;
    case 'banned': pos.forEach(h => console.log(`${h}  ${banned(h) ?? 'ok'}`)); break;
    case 'contrast': { const g = grade(pos[0], pos[1]); console.log(`${pos[0]} on ${pos[1]}: WCAG ${g.ratio}:1 (${g.wcag})  APCA Lc ${g.Lc} (${g.apca})`); break; }
    case 'ramp': for (const mode of ['light', 'dark']) { console.log(`-- ${mode}${flag('--neutral') ? ' neutral' : ''}`);
      const r = ramp(pos[0], mode, { neutral: !!flag('--neutral') });
      r.forEach(s => console.log(`${pad(s.step, 3)} ${pad(s.hex, 8)} ${pad(s.oklch, 26)} vs step2 ${wcag(s.hex, r[1].hex).toFixed(2)}:1`));
      console.log(`    text on step 9: ${onSolid(r[8].hex)}`); } break;
    case 'mix': { const t = +(pos[2] ?? 0.5); for (const s of ['srgb', 'oklab', 'oklch']) { const m = mix(pos[0], pos[1], t, s); console.log(`${pad(s, 6)} ${info(m)}`); } break; }
    case 'gradient': { const g = gradient(pos[0], pos[1], +(pos[2] ?? 7)); for (const [s, v] of Object.entries(g)) console.log(`${pad(s, 6)} minC ${v.minChroma}  ${v.stops.join(' ')}`);
      console.log(`css: linear-gradient(in oklch, ${pos[0]}, ${pos[1]})  /* fallback: list the oklab stops above */`); break; }
    case 'cvd': { console.log(pad('', 9) + ['normal', 'protan', 'deutan', 'tritan'].map(x => pad(x, 9)).join(''));
      pos.forEach(h => console.log(pad(h, 9) + [h, ...['protan', 'deutan', 'tritan'].map(t => simulate(h, t))].map(x => pad(x, 9)).join('')));
      for (const t of ['normal', 'protan', 'deutan', 'tritan']) { let worst = [9, '', ''];
        for (let i = 0; i < pos.length; i++) for (let j = i + 1; j < pos.length; j++) { const a = t === 'normal' ? pos[i] : simulate(pos[i], t), b = t === 'normal' ? pos[j] : simulate(pos[j], t), d = deltaE(a, b); if (d < worst[0]) worst = [d, pos[i], pos[j]]; }
        if (pos.length > 1) console.log(`${pad(t, 7)} closest pair ${worst[1]} / ${worst[2]}  dEok ${worst[0].toFixed(3)}${worst[0] < 0.06 ? '  <- too close: add a label, pattern or lightness gap' : ''}`); } break; }
    case 'tokens': if (flag('--dtcg')) console.log(JSON.stringify(dtcg(pos[0], flag('--name', 'accent')), null, 1));
      else console.log(tokens(pos[0], { name: flag('--name', 'accent'), neutralHue: flag('--neutral-hue') ? +flag('--neutral-hue') : undefined }).css); break;
    default: console.log(`commands:
  info <hex...>                 OKLCH, WCAG + APCA vs white/black, banned-zone flag
  banned <hex...>               owner taste check
  contrast <fg> <bg>            WCAG 2.2 ratio + APCA Lc (advisory)
  ramp <hex> [--neutral 1]      12-step light + dark scales
  mix <a> <b> [t]               compare sRGB / OKLab / OKLCH mixes
  gradient <a> <b> [n]          stops + min chroma per space (grey dead-zone check)
  cvd <hex...>                  protan/deutan/tritan simulation + closest pair
  tokens <accent> [--name x] [--neutral-hue H] [--dtcg 1]   CSS (or DTCG JSON) for light + dark`);
  }
}

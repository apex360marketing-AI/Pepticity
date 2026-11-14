// FX worker check (round 3, section C: module 04-fx, and the edits in 06-bottle and 11-crest).
// Usage: node check.js BASE_URL [REF_URL]
//   BASE_URL  the folder that holds index.html (e.g. http://localhost:8822/site/new/) or the page itself.
//   REF_URL   optional: the store BEFORE the FX worker (e.g. http://localhost:8822/base/new/). With it the crest P is measured
//             against the live reference; without it, against the widths recorded from that reference (CREST_BEFORE below).
// Runs at 1440x900 (mouse), 390x844 (touch) and 1440x900 with reduced motion, and asserts:
//   VIAL    on hover / keyboard focus / tap the vial comes toward the viewer: on screen 1.10 of its size (perspective +
//           translateZ), never rotated or skewed at rest, on the way or at the end; the floor shadow grows and the blue
//           under-light strengthens (styles AND pixels); it eases back on leave; reduced motion = the light only
//   GLOW    one fixed element that follows the mouse over the open ground, shows there (pixels too) and hides over a card,
//           a form, the header and the vial; never on a touch screen or with reduced motion
//   CURSOR  a ring of rgb(42, 120, 255) with a chrome centre bead on the pointer (pixels too), grows over links and buttons,
//           steps back over a text field (the browser's own pointer stays there), never takes a click, hidden on touch
//   CREST   the P is 0.85 of its size before, within 2%, and still centred
//   0 page errors in every view.
const { chromium } = require('playwright');

const arg = process.argv[2] || 'http://localhost:8822/site/new/';
const page_url = a => (/\.html?(\?|#|$)/.test(a) ? a : a.replace(/\/?$/, '/') + 'index.html');
const URL = page_url(arg), REF = process.argv[3] ? page_url(process.argv[3]) : null;
const GL = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
// .pep-crest-mark width (px) on the store before the FX worker (assemble-tmp/4-hooks.html), measured with this file's own
// crestMeasure(): the engine sizes it from the slot's numbers and the window, so it is the same on every run.
const CREST_BEFORE = { desktop: 558.2, phone: 249.6 };
const BLUE = [42, 120, 255];
const TRAVEL = 900 / (900 - 82);                 // perspective(900px) translateZ(82px) = 1.1002 on screen

let pass = 0, fail = 0;
const fails = [];
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); } else { fail++; fails.push(label); console.log('  FAIL ' + label); }
  return !!cond;
}
const near = (a, b, tol) => typeof a === 'number' && isFinite(a) && Math.abs(a - b) <= tol;
const f = (n, d) => (typeof n === 'number' && isFinite(n) ? n.toFixed(d === undefined ? 2 : d) : String(n));
// a part of the check that cannot run (for example on a page without the module) is one FAIL, and the check carries on
async function section(name, fn) {
  try { await fn(); } catch (e) { ok(false, name + ' could not run: ' + String(e.message || e).split('\n')[0].slice(0, 170)); }
}

async function settle(page) {
  await page.waitForFunction(() => window.PEP && PEP.status && PEP.status.bottle && PEP.status.crest, null, { timeout: 60000 }).catch(() => {});
  // the hero's 3D word changes the page height when it starts or gives up: wait for it (it decides within 9 s)
  await page.waitForFunction(() => { const h = document.querySelector('[data-module="hero"]'); return !h || h.getAttribute('data-3d') !== 'pending'; }, null, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(1200);
}
async function open(page, url) { await page.goto(url || URL, { waitUntil: 'load', timeout: 120000 }); await settle(page); }
async function newPage(browser, opts) {
  const ctx = await browser.newContext(Object.assign({ deviceScaleFactor: 1 }, opts));
  // the entrance plays once per visit and covers the page: this visit has seen it
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e.message || e).slice(0, 200)));
  return { ctx, page, errors };
}

// ---- pixels: a screenshot clip, read in a blank helper page. Returns { w, h, at(x, y) -> [r, g, b], mean() -> [r, g, b] }
let reader = null;
async function pixels(page, clip) {
  const png = await page.screenshot({ clip, type: 'png' });
  const data = await reader.evaluate(async b64 => {
    const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const g = c.getContext('2d'); g.drawImage(img, 0, 0);
    return { w: c.width, h: c.height, d: Array.from(g.getImageData(0, 0, c.width, c.height).data) };
  }, png.toString('base64'));
  return {
    w: data.w, h: data.h,
    at: (x, y) => { const i = (Math.round(y) * data.w + Math.round(x)) * 4; return [data.d[i], data.d[i + 1], data.d[i + 2]]; },
    mean: () => { let r = 0, g = 0, b = 0; const n = data.w * data.h; for (let i = 0; i < n * 4; i += 4) { r += data.d[i]; g += data.d[i + 1]; b += data.d[i + 2]; } return [r / n, g / n, b / n]; }
  };
}

// ---- in-page readers
const fxState = page => page.evaluate(() => {
  const root = document.querySelector('[data-module="fx"]');
  if (!root) { return null; }
  const box = s => { const e = root.querySelector(s); if (!e) { return null; } const r = e.getBoundingClientRect(), cs = getComputedStyle(e);
    return { cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height, opacity: parseFloat(cs.opacity), display: cs.display, position: cs.position,
      pe: cs.pointerEvents, color: cs.color, z: cs.zIndex, radius: cs.borderTopLeftRadius, bg: cs.backgroundImage, left: cs.left, top: cs.top }; };
  return { ground: root.getAttribute('data-fx-ground'), cursor: root.getAttribute('data-fx-cursor'), hidden: root.getAttribute('aria-hidden'),
    on: document.documentElement.classList.contains('pep-fx-on'), glow: box('.pep-fx-glow'), ring: box('.pep-fx-ring'), dot: box('.pep-fx-dot'),
    bodyCursor: getComputedStyle(document.body).cursor };
});
// the vial: the hero's mounted bottle (or the first one on the page that is shown)
const VIAL = () => {
  const all = Array.from(document.querySelectorAll('[data-pep-bottle="on"]')).filter(e => e.getClientRects().length);
  return all.find(e => e.closest('[data-module="hero"]')) || all[0] || null;
};
const vialState = page => page.evaluate(src => {
  const host = (new Function('return (' + src + ')()'))();
  if (!host) { return null; }
  const crop = host.querySelector('.pep-bottle-crop'), floor = host.querySelector('.pep-bottle-floor'), core = host.querySelector('.pep-bottle-core');
  if (!crop) { return { crop: null }; }
  const mat = el => { const t = getComputedStyle(el).transform; if (!t || t === 'none') { return null; } const m = /^matrix(3d)?\(([^)]+)\)/.exec(t); if (!m) { return null; }
    const v = m[2].split(',').map(Number); return m[1] ? v : [v[0], v[1], 0, 0, v[2], v[3], 0, 0, 0, 0, 1, 0, v[4], v[5], 0, 1]; };
  // on-screen scale of a perspective + translateZ matrix, and everything in it that would be a turn, a tilt or a skew
  const read = m => m ? { scale: m[0] / m[15], uniform: Math.abs(m[0] - m[5]) < 1e-6, turn: Math.max(Math.abs(m[1]), Math.abs(m[4]), Math.abs(m[2]), Math.abs(m[8]), Math.abs(m[6]), Math.abs(m[9]), Math.abs(m[3]), Math.abs(m[7])), z: m[14] } : { scale: 1, uniform: true, turn: 0, z: 0 };
  const pseudo = (el, which) => { if (!el) { return null; } const cs = getComputedStyle(el, which), t = cs.transform; let s = 1;
    if (t && t !== 'none') { const mm = /^matrix\(([^)]+)\)/.exec(t); if (mm) { s = Number(mm[1].split(',')[0]); } } return { opacity: parseFloat(cs.opacity), scale: s, content: cs.content, bg: cs.backgroundImage }; };
  const r = crop.getBoundingClientRect(), hr = host.getBoundingClientRect(), fr = floor ? floor.getBoundingClientRect() : null;
  const up = []; for (let e = crop.parentElement; e && e !== document.body; e = e.parentElement) { const t = getComputedStyle(e).transform; if (t && t !== 'none') { up.push(e.className || e.tagName); } }
  return { near: host.classList.contains('pep-bottle-near'), crop: { x: r.left, y: r.top, w: r.width, h: r.height }, host: { x: hr.left, y: hr.top, w: hr.width, h: hr.height },
    m: read(mat(crop)), inner: ['.pep-bottle-vial', '.pep-bottle-img'].map(s => { const e = host.querySelector(s); return e ? getComputedStyle(e).transform : 'missing'; }),
    floors: host.querySelectorAll('.pep-bottle-floor').length, floor: fr ? { x: fr.left, y: fr.top, w: fr.width, h: fr.height } : null,
    shadow: pseudo(floor, '::before'), light: pseudo(floor, '::after'), core: core ? { opacity: parseFloat(getComputedStyle(core).opacity) } : null, turnedAbove: up, focused: document.activeElement === host };
}, VIAL.toString());
// open ground: points whose own element, and the elements a little way round them, are a section root or the body itself
const groundPoints = page => page.evaluate(() => {
  const isRoot = (x, y) => { const e = document.elementFromPoint(x, y); return !!e && (e === document.body || e === document.documentElement || (e.hasAttribute('data-module') && e.getAttribute('data-module') !== 'header')); };
  const out = [], W = innerWidth, H = innerHeight;
  for (let y = 140; y < H - 60; y += 40) { for (let x = 60; x < W - 120; x += 40) {
    if (isRoot(x, y) && isRoot(x - 70, y) && isRoot(x + 70, y) && isRoot(x, y - 70) && isRoot(x, y + 70)) { out.push([x, y]); } } }
  return out;
});
// a point inside an element that is not on anything that can be pressed or typed in (so it tests the card, not the button)
const plainPointIn = (page, sel) => page.evaluate(s => {
  const box = document.querySelector(s); if (!box) { return null; }
  const r = box.getBoundingClientRect();
  for (let fy = 0.12; fy < 0.95; fy += 0.07) { for (let fx = 0.5; fx < 0.95; fx += 0.09) {
    const x = Math.round(r.left + r.width * fx), y = Math.round(r.top + r.height * fy);
    if (y < 4 || y > innerHeight - 4 || x < 4 || x > innerWidth - 4) { continue; }
    const e = document.elementFromPoint(x, y);
    if (e && box.contains(e) && !e.closest('a[href],button,summary,label,input,textarea,select,[role="button"],[tabindex]')) { return [x, y]; } } }
  return null;
}, sel);
const centreOf = (page, sel) => page.evaluate(s => { const e = document.querySelector(s); if (!e || !e.getClientRects().length) { return null; } const r = e.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; }, sel);

// ---- the crest P: its width on screen (the engine's own number, laid on .pep-crest-mark), with the 3D engine on.
// The engine gives up if it has not started in 9 s (a busy machine): then the page is opened again, up to 4 times.
async function crestMeasure(browser, opts, url) {
  for (let attempt = 1; attempt <= 4; attempt++) {
    const { ctx, page } = await newPage(browser, opts);
    try {
      await open(page, url);
      await page.waitForFunction(() => { const c = document.querySelector('[data-module="crest"]'); return c && c.getAttribute('data-3d') !== 'pending'; }, null, { timeout: 25000 }).catch(() => {});
      await page.evaluate(() => { const c = document.querySelector('[data-module="crest"]'); if (c) { window.scrollTo(0, c.getBoundingClientRect().top + scrollY); } });
      await page.waitForTimeout(2500);
      const m = await page.evaluate(() => {
        const c = document.querySelector('[data-module="crest"]'); if (!c) { return null; }
        const mark = c.querySelector('.pep-crest-mark'), stage = c.querySelector('.pep-crest-stage'), slot = c.querySelector('.pep-crest-slot');
        const r = mark.getBoundingClientRect(), s = stage.getBoundingClientRect();
        return { d3: c.getAttribute('data-3d'), w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2, vw: document.documentElement.clientWidth,
          lineY: s.top + s.height * 0.46, fill: slot.getAttribute('data-fill'), fillW: slot.getAttribute('data-fill-w'), hw: getComputedStyle(c).getPropertyValue('--pep-crest-hw').trim() };
      });
      if (m && m.d3 === 'on' && /px$/.test(m.hw)) { m.attempt = attempt; return m; }
      if (attempt === 4) { return m; }
    } finally { await ctx.close(); }
  }
  return null;
}

async function vialChecks(page, how, tag, reduced) {
  // how: 'hover' (mouse), 'tap' (finger)
  await page.evaluate(src => { const h = (new Function('return (' + src + ')()'))(); if (h) { const r = h.getBoundingClientRect(); window.scrollTo(0, Math.max(0, r.top + scrollY - (innerHeight - r.height) / 2)); } }, VIAL.toString());
  await page.waitForTimeout(900);
  if (how === 'hover') { await page.mouse.move(6, 300); await page.waitForTimeout(900); }
  const rest = await vialState(page);
  if (!ok(rest && rest.crop, tag + 'a mounted vial is on the page')) { return; }
  ok(rest.floors === 1, tag + 'the vial has ONE floor element (.pep-bottle-floor): ' + rest.floors);
  ok(rest.near === false && near(rest.m.scale, 1, 0.0005) && rest.m.turn === 0, tag + 'at rest: not near, scale 1, no turn (scale ' + f(rest.m.scale, 4) + ')');
  ok(rest.shadow && rest.shadow.content !== 'none' && near(rest.shadow.opacity, 0.45, 0.01) && near(rest.shadow.scale, 0.74, 0.005), tag + 'at rest: floor shadow opacity .45, scale .74 (' + (rest.shadow ? f(rest.shadow.opacity) + ', ' + f(rest.shadow.scale) : 'missing') + ')');
  ok(rest.light && rest.light.content !== 'none' && near(rest.light.opacity, 0.3, 0.01) && near(rest.light.scale, 0.72, 0.005), tag + 'at rest: under-light opacity .3, scale .72 (' + (rest.light ? f(rest.light.opacity) + ', ' + f(rest.light.scale) : 'missing') + ')');
  ok(rest.light && /rgba?\(42, 120, 255/.test(rest.light.bg) && !/rgba?\((?!42, 120, 255|0, 0, 0)/.test(rest.light.bg), tag + 'the under-light is the logo blue and nothing else');
  const clip = rest.floor ? { x: Math.max(0, Math.floor(rest.floor.x - rest.floor.w * 0.15)), y: Math.max(0, Math.floor(rest.floor.y - rest.floor.h * 0.6)), width: Math.ceil(rest.floor.w * 1.3), height: Math.ceil(rest.floor.h * 2.2) } : null;
  const before = clip ? (await pixels(page, clip)).mean() : null;

  const cx = rest.host.x + rest.host.w / 2, cy = rest.host.y + rest.host.h * 0.5;
  const onTheWay = [];
  if (how === 'hover') {
    await page.mouse.move(cx, cy, { steps: 6 });
    for (let i = 0; i < 6; i++) { await page.waitForTimeout(70); const s = await vialState(page); if (s && s.m) { onTheWay.push(s.m); } }
    await page.waitForTimeout(1100);
  } else {
    await page.touchscreen.tap(cx, cy);
    for (let i = 0; i < 4; i++) { await page.waitForTimeout(70); const s = await vialState(page); if (s && s.m) { onTheWay.push(s.m); } }
    await page.waitForTimeout(900);
  }
  const out = await vialState(page);
  ok(out.near === true, tag + how + ': the vial is marked near (.pep-bottle-near)');
  const ratio = out.crop.w / rest.crop.w, ratioH = out.crop.h / rest.crop.h;
  if (reduced) {
    ok(near(ratio, 1, 0.002) && near(out.m.scale, 1, 0.0005), tag + how + ' with reduced motion: the vial does NOT travel (on-screen ' + f(ratio, 4) + ')');
  } else {
    ok(near(ratio, TRAVEL, 0.004) && near(ratioH, TRAVEL, 0.004), tag + how + ': the vial is ' + f(TRAVEL, 4) + ' of its size on screen, both ways (w ' + f(ratio, 4) + ', h ' + f(ratioH, 4) + ')');
    ok(ratio >= 1.08 && ratio <= 1.12, tag + how + ': that is inside the asked 1.08 to 1.12');
    ok(near(out.m.scale, TRAVEL, 0.002) && out.m.z > 0, tag + how + ': it is a travel toward the viewer (perspective + translateZ ' + f(out.m.z, 1) + 'px, scale ' + f(out.m.scale, 4) + ')');
    ok(onTheWay.length >= 3 && onTheWay.some(m => m.scale > 1.001 && m.scale < TRAVEL - 0.001), tag + how + ': it eases there (caught on the way at ' + onTheWay.map(m => f(m.scale, 3)).join(' ') + ')');
  }
  ok(out.m.turn === 0 && out.m.uniform && onTheWay.every(m => m.turn === 0 && m.uniform), tag + how + ': no rotation, tilt or skew at the end or on the way (largest off-axis term ' + Math.max(out.m.turn, ...onTheWay.map(m => m.turn)) + ')');
  ok(out.inner.every(t => t === 'none'), tag + how + ': the vial frame and its picture carry no transform of their own (' + out.inner.join(' / ') + ')');
  ok(near((out.crop.x + out.crop.w / 2) - (rest.crop.x + rest.crop.w / 2), 0, 0.6), tag + how + ': it stays on its own centre line (moved ' + f((out.crop.x + out.crop.w / 2) - (rest.crop.x + rest.crop.w / 2)) + 'px sideways)');
  if (reduced) {
    ok(near(out.shadow.opacity, 1, 0.01) && near(out.shadow.scale, 0.74, 0.005) && near(out.light.opacity, 1, 0.01) && near(out.light.scale, 0.72, 0.005), tag + how + ' with reduced motion: the light changes, nothing grows (shadow ' + f(out.shadow.opacity) + ' x' + f(out.shadow.scale) + ', light ' + f(out.light.opacity) + ' x' + f(out.light.scale) + ')');
  } else {
    ok(near(out.shadow.opacity, 1, 0.01) && near(out.shadow.scale, 1.22, 0.005), tag + how + ': the floor shadow grows: opacity .45 to 1, scale .74 to 1.22 (' + f(out.shadow.opacity) + ', ' + f(out.shadow.scale) + ')');
    ok(near(out.light.opacity, 1, 0.01) && near(out.light.scale, 1.16, 0.005), tag + how + ': the blue under-light strengthens: opacity .3 to 1, scale .72 to 1.16 (' + f(out.light.opacity) + ', ' + f(out.light.scale) + ')');
  }
  if (clip) {
    const after = (await pixels(page, clip)).mean();
    ok(after[2] - before[2] >= 6 && (after[2] - before[2]) > (after[0] - before[0]) + 3, tag + how + ': on screen the floor under the base is bluer (mean blue ' + f(before[2], 1) + ' to ' + f(after[2], 1) + ', red ' + f(before[0], 1) + ' to ' + f(after[0], 1) + ')');
  }
  if (how === 'hover') {
    await page.mouse.move(6, 300, { steps: 4 }); await page.waitForTimeout(1300);
    const back = await vialState(page);
    ok(back.near === false && near(back.crop.w, rest.crop.w, 0.5), tag + 'leave: it eases back to its own size (' + f(back.crop.w, 1) + ' / ' + f(rest.crop.w, 1) + 'px)');
  } else {
    await page.waitForTimeout(3100);
    const back = await vialState(page);
    ok(back.near === false && near(back.crop.w, rest.crop.w, 0.5), tag + 'after the tap it eases back by itself (' + f(back.crop.w, 1) + ' / ' + f(rest.crop.w, 1) + 'px)');
  }
}

(async () => {
  const browser = await chromium.launch({ args: GL });
  reader = await (await browser.newContext()).newPage();
  await reader.goto('about:blank');
  console.log('FX check on ' + URL + (REF ? '   (reference: ' + REF + ')' : ''));

  // =========================================================== DESKTOP 1440x900, a mouse
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 } });
    console.log('\nDESKTOP 1440x900');
    await open(page);

    await section('04-fx module', async () => {
      const s = await page.evaluate(() => ({ roots: document.querySelectorAll('[data-module="fx"]').length, status: window.PEP && PEP.status ? PEP.status.fx : null,
        css: document.querySelectorAll('style[data-pep-src="modules/04-fx/fx.css"]').length, js: document.querySelectorAll('script[data-pep-src="modules/04-fx/fx.js"]').length,
        order: (() => { const a = document.querySelector('[data-module="fx"]'), g = document.querySelector('[data-module="ground"]'), h = document.querySelector('[data-module="header"]');
          return !!(a && g && h && (g.compareDocumentPosition(a) & 4) && (a.compareDocumentPosition(h) & 4)); })() }));
      ok(s.roots === 1 && s.css === 1 && s.js === 1, 'module 04-fx is in the page once: markup ' + s.roots + ', fx.css ' + s.css + ', fx.js ' + s.js);
      ok(s.status === 'ready', 'PEP started it: PEP.status.fx = ' + s.status);
      ok(s.order, 'its markup stands after the ground and before the header');
      const st = await fxState(page);
      ok(st && st.hidden === 'true' && [st.glow, st.ring, st.dot].every(b => b && b.pe === 'none' && b.position === 'fixed'), 'glow, ring and bead are fixed, take no pointer events and are hidden from screen readers');
      ok(st && [st.glow, st.ring, st.dot].every(b => b && b.radius === '0px'), 'no corner radius on any of them (the round shapes are drawn light)');
    });

    await section('VIAL', async () => {
      await vialChecks(page, 'hover', 'VIAL ', false);
      // keyboard: the vial comes near while it has focus
      const host = await page.evaluateHandle(src => (new Function('return (' + src + ')()'))(), VIAL.toString());
      const focusable = await page.evaluate(h => !!h && h.tabIndex >= 0, host);
      if (focusable) {
        await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); } });
        let on = false;
        for (let i = 0; i < 60 && !on; i++) { await page.keyboard.press('Tab'); on = await page.evaluate(h => document.activeElement === h, host); }
        await page.waitForTimeout(1200);
        const kb = await vialState(page);
        ok(on && kb.near === true && near(kb.m.scale, TRAVEL, 0.002) && kb.m.turn === 0, 'VIAL keyboard: with focus on it the vial comes near, without turning (focused ' + on + ', scale ' + f(kb.m.scale, 4) + ')');
        await page.keyboard.press('Tab'); await page.waitForTimeout(1200);
        const off = await vialState(page);
        ok(off.near === false && near(off.m.scale, 1, 0.002), 'VIAL keyboard: it eases back when focus leaves');
        await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); } window.scrollTo(0, 0); });
        await page.waitForTimeout(500);
      } else { ok(false, 'VIAL keyboard: the vial can take focus'); }
    });

    await section('GLOW and CURSOR', async () => {
      await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(600);
      await page.mouse.move(6, 300);
      const pts = await groundPoints(page);
      if (!ok(pts.length >= 2, 'open ground is on the first screen to test on (' + pts.length + ' points)')) { return; }
      const A = pts[0], B = pts.find(p => Math.hypot(p[0] - A[0], p[1] - A[1]) >= 240) || pts[pts.length - 1];
      await page.mouse.move(A[0], A[1], { steps: 8 }); await page.waitForTimeout(1500);
      let s = await fxState(page);
      ok(s.ground === 'on' && near(s.glow.opacity, 1, 0.02), 'GLOW over the open ground at ' + A + ': on, opacity ' + f(s.glow.opacity));
      ok(near(s.glow.cx, A[0], 2) && near(s.glow.cy, A[1], 2), 'GLOW sits on the pointer (centre ' + f(s.glow.cx, 1) + ',' + f(s.glow.cy, 1) + ' / pointer ' + A + ')');
      ok(s.glow.z === '0' && s.glow.left === '0px' && s.glow.top === '0px' && /rgba\(42, 120, 255/.test(s.glow.bg) && !/rgba?\((?!42, 120, 255)/.test(s.glow.bg), 'GLOW is one fixed element at the ground level, moved by transform only, in the logo blue only');
      // on screen: the same place with the glow and without it (only the glow is switched)
      const clip = { x: A[0] - 110, y: A[1] - 110, width: 220, height: 220 };
      const lit = (await pixels(page, clip)).mean();
      await page.evaluate(() => { document.querySelector('.pep-fx-glow').style.visibility = 'hidden'; });
      const dark = (await pixels(page, clip)).mean();
      await page.evaluate(() => { document.querySelector('.pep-fx-glow').style.visibility = ''; });
      ok(lit[2] - dark[2] >= 8 && (lit[2] - dark[2]) > (lit[0] - dark[0]) * 2, 'GLOW shows on screen: the ground round the pointer is bluer with it (mean blue ' + f(dark[2], 1) + ' to ' + f(lit[2], 1) + ', red ' + f(dark[0], 1) + ' to ' + f(lit[0], 1) + ')');

      // ---- the cursor, on the same open ground
      ok(s.on && s.bodyCursor === 'none', 'CURSOR is the pointer: html.pep-fx-on, the browser arrow is put away (body cursor ' + s.bodyCursor + ')');
      ok(s.cursor === 'on' && near(s.ring.opacity, 1, 0.02) && near(s.dot.opacity, 1, 0.02), 'CURSOR ring and bead show (state ' + s.cursor + ')');
      ok(s.ring.color === 'rgb(42, 120, 255)', 'CURSOR ring colour is ' + s.ring.color + ' (asked rgb(42, 120, 255))');
      ok(near(s.ring.cx, A[0], 1.5) && near(s.ring.cy, A[1], 1.5) && near(s.dot.cx, A[0], 0.6) && near(s.dot.cy, A[1], 0.6), 'CURSOR ring and bead sit on the pointer (ring ' + f(s.ring.cx, 1) + ',' + f(s.ring.cy, 1) + ' bead ' + f(s.dot.cx, 1) + ',' + f(s.dot.cy, 1) + ')');
      ok(near(s.ring.w, 56, 0.6) && near(s.dot.w, 12, 0.2), 'CURSOR is small: ring box 56px (a 28px ring and its glow), bead box 12px (' + f(s.ring.w, 1) + ', ' + f(s.dot.w, 1) + ')');
      ok(/rgb\(185, 190, 197\)/.test(s.dot.bg) && /rgb\(107, 112, 119\)/.test(s.dot.bg) && /rgb\(230, 233, 237\)/.test(s.dot.bg), 'CURSOR bead is drawn from the platinum chrome ramp');
      const px = await pixels(page, { x: A[0] - 30, y: A[1] - 30, width: 60, height: 60 });
      const ringPx = [px.at(30 + 13, 30), px.at(30 - 14, 30), px.at(30, 30 + 13), px.at(30, 30 - 14)];
      ok(ringPx.every(c => Math.abs(c[0] - BLUE[0]) <= 10 && Math.abs(c[1] - BLUE[1]) <= 10 && Math.abs(c[2] - BLUE[2]) <= 10), 'CURSOR on screen: the ring, 14px from the pointer on all four sides, is rgb(42, 120, 255) (' + ringPx.map(c => c.join(',')).join(' | ') + ')');
      const mid = px.at(30, 30), gap = px.at(30 + 8, 30);
      ok(mid[0] >= 150 && mid[1] >= 150 && mid[2] >= 150 && Math.abs(mid[0] - mid[2]) <= 30, 'CURSOR on screen: the centre is a chrome bead, bright and neutral (' + mid.join(',') + ')');
      ok(gap[2] < 140 && gap[0] < 80, 'CURSOR on screen: it is a ring, open between the bead and the ring (' + gap.join(',') + ')');

      // ---- follows, with a little easing
      await page.mouse.move(B[0], B[1]);
      const early = await fxState(page);
      await page.waitForTimeout(1500);
      s = await fxState(page);
      ok(near(s.glow.cx, B[0], 2) && near(s.glow.cy, B[1], 2) && near(s.ring.cx, B[0], 1.5) && near(s.ring.cy, B[1], 1.5), 'GLOW and CURSOR follow the mouse to ' + B + ' (glow ' + f(s.glow.cx, 1) + ',' + f(s.glow.cy, 1) + ' ring ' + f(s.ring.cx, 1) + ',' + f(s.ring.cy, 1) + ')');
      ok(near(early.dot.cx, B[0], 0.6) && Math.hypot(early.glow.cx - B[0], early.glow.cy - B[1]) > 3, 'the bead is on the pointer at once; the glow is eased (still ' + f(Math.hypot(early.glow.cx - B[0], early.glow.cy - B[1]), 0) + 'px behind just after the move)');
      ok(s.ground === 'on', 'GLOW is still on over the ground at ' + B);

      // ---- hides over a card, a form field, the header and the vial
      const card = await plainPointIn(page, 'form[data-hook="H01"]');
      if (ok(!!card, 'the hero card has a plain place to point at')) {
        await page.mouse.move(card[0], card[1], { steps: 6 }); await page.waitForTimeout(1100);
        s = await fxState(page);
        ok(s.ground === 'off' && s.glow.opacity <= 0.02, 'GLOW hides over the hero card at ' + card + ' (state ' + s.ground + ', opacity ' + f(s.glow.opacity) + ')');
        ok(s.cursor === 'on' && near(s.ring.opacity, 1, 0.02), 'CURSOR stays over the card');
      }
      await page.mouse.move(A[0], A[1], { steps: 6 }); await page.waitForTimeout(900);
      s = await fxState(page);
      ok(s.ground === 'on' && near(s.glow.opacity, 1, 0.05), 'GLOW comes back on the open ground');
      const head = await centreOf(page, '[data-module="header"]');
      if (head) { await page.mouse.move(head[0], head[1], { steps: 6 }); await page.waitForTimeout(1000); s = await fxState(page);
        ok(s.ground === 'off' && s.glow.opacity <= 0.02, 'GLOW hides over the header (state ' + s.ground + ', opacity ' + f(s.glow.opacity) + ')'); } else { ok(false, 'the header is on screen'); }
      const vial = await page.evaluate(src => { const h = (new Function('return (' + src + ')()'))(); if (!h) { return null; } const r = h.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; }, VIAL.toString());
      if (vial && vial[1] < 880) { await page.mouse.move(vial[0], vial[1], { steps: 6 }); await page.waitForTimeout(1000); s = await fxState(page);
        ok(s.ground === 'off' && s.glow.opacity <= 0.02, 'GLOW hides over the vial (state ' + s.ground + ', opacity ' + f(s.glow.opacity) + ')'); } else { ok(false, 'the vial is on the first screen'); }

      // ---- the ring grows over a button, steps back over a text field, and never takes a click
      const btn = await centreOf(page, 'form[data-hook="H01"] button[type="submit"]');
      if (ok(!!btn, 'the hero button is on screen')) {
        await page.mouse.move(btn[0], btn[1], { steps: 6 }); await page.waitForTimeout(1000);
        s = await fxState(page);
        ok(s.cursor === 'key' && near(s.ring.w, 84, 1), 'CURSOR grows a little over a button: ring box 56 to 84px (state ' + s.cursor + ', ' + f(s.ring.w, 1) + 'px)');
        ok(s.ground === 'off', 'GLOW is off over a button');
      }
      const link = await page.evaluate(() => { const a = Array.from(document.querySelectorAll('[data-module="header"] a[href], [data-module="header"] button')).find(e => { const r = e.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.top >= 0 && r.bottom <= innerHeight; });
        if (!a) { return null; } const r = a.getBoundingClientRect(); return [Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2)]; });
      if (ok(!!link, 'a header key is on screen')) {
        await page.mouse.move(link[0], link[1], { steps: 6 }); await page.waitForTimeout(1000);
        s = await fxState(page);
        ok(s.cursor === 'key' && near(s.ring.w, 84, 1), 'CURSOR grows over a header key (state ' + s.cursor + ', ' + f(s.ring.w, 1) + 'px)');
      }
      const field = await centreOf(page, 'form[data-hook="H01"] input[type="email"]');
      if (ok(!!field, 'the hero email field is on screen')) {
        await page.mouse.move(field[0], field[1], { steps: 6 }); await page.waitForTimeout(900);
        s = await fxState(page);
        const cur = await page.evaluate(() => getComputedStyle(document.querySelector('form[data-hook="H01"] input[type="email"]')).cursor);
        ok(s.cursor === 'field' && s.ring.opacity <= 0.02 && s.dot.opacity <= 0.02, 'CURSOR steps back over a text field (state ' + s.cursor + ', ring opacity ' + f(s.ring.opacity) + ')');
        ok(cur !== 'none' && (cur === 'auto' || cur === 'text'), 'the browser\'s own pointer stays over a text field (cursor: ' + cur + ')');
        ok(s.ground === 'off', 'GLOW is off over a form field');
      }
      const tick = await centreOf(page, 'form[data-hook="H01"] input[type="checkbox"]');
      if (ok(!!tick, 'the hero consent box is on screen')) {
        const was = await page.evaluate(() => document.querySelector('form[data-hook="H01"] input[type="checkbox"]').checked);
        await page.mouse.move(tick[0], tick[1], { steps: 4 }); await page.waitForTimeout(700);
        const top = await page.evaluate(([x, y]) => { const e = document.elementFromPoint(x, y); return e ? (e.closest('[data-module="fx"]') ? 'FX' : e.tagName) : 'none'; }, tick);
        await page.mouse.click(tick[0], tick[1]); await page.waitForTimeout(300);
        const now = await page.evaluate(() => document.querySelector('form[data-hook="H01"] input[type="checkbox"]').checked);
        ok(was === false && now === true && top !== 'FX', 'CURSOR never takes a click: with the ring on the consent box, a click ticks it (was ' + was + ', now ' + now + ', element under the pointer: ' + top + ')');
        await page.mouse.click(tick[0], tick[1]); await page.waitForTimeout(200);
        const again = await page.evaluate(() => document.querySelector('form[data-hook="H01"] input[type="checkbox"]').checked);
        ok(again === false, 'the consent box is left unticked, as it was found');
      }

      // ---- a second kind of card, further down: a hook's glass pane
      const pane = await page.evaluate(() => { const g = document.querySelector('[data-hooks-ask]'); if (!g) { return false; } const r = g.getBoundingClientRect(); window.scrollTo(0, r.top + scrollY - 120); return true; });
      if (pane) {
        await page.waitForTimeout(2600);
        await page.mouse.move(8, 500); await page.mouse.move(12, 504);
        const p2 = await plainPointIn(page, '[data-hooks-ask] .pep-hooks-in, [data-hooks-ask]');
        if (ok(!!p2, 'the founder card pane has a plain place to point at')) {
          await page.mouse.move(p2[0], p2[1], { steps: 6 }); await page.waitForTimeout(1100);
          s = await fxState(page);
          ok(s.ground === 'off' && s.glow.opacity <= 0.02, 'GLOW hides over a hook\'s glass pane at ' + p2 + ' (state ' + s.ground + ')');
        }
      }
      await page.evaluate(() => window.scrollTo(0, 0));
    });
    ok(errors.length === 0, 'DESKTOP 0 page errors (' + errors.length + (errors.length ? ': ' + errors[0] : '') + ')');
    await ctx.close();
  }

  // =========================================================== PHONE 390x844, a finger
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
    console.log('\nPHONE 390x844 (touch)');
    await open(page);
    await section('touch', async () => {
      await page.touchscreen.tap(195, 420); await page.waitForTimeout(500);
      await page.mouse.move(120, 300); await page.mouse.move(180, 380, { steps: 4 }); await page.waitForTimeout(700);
      const s = await fxState(page);
      if (!ok(!!s, 'module 04-fx is in the page')) { return; }
      ok(s.ring.display === 'none' && s.dot.display === 'none', 'CURSOR is hidden on a touch device (ring display ' + s.ring.display + ', bead ' + s.dot.display + ')');
      ok(s.glow.display === 'none', 'GLOW is off on a touch device (display ' + s.glow.display + ')');
      ok(s.on === false && s.cursor === 'off' && s.ground === 'off' && s.bodyCursor !== 'none', 'nothing is switched on by a tap or a move: no html.pep-fx-on, states off, the browser pointer untouched (' + s.cursor + ', ' + s.ground + ', ' + s.bodyCursor + ')');
    });
    await section('VIAL touch', async () => { await vialChecks(page, 'tap', 'VIAL ', false); });
    ok(errors.length === 0, 'PHONE 0 page errors (' + errors.length + (errors.length ? ': ' + errors[0] : '') + ')');
    await ctx.close();
  }

  // =========================================================== DESKTOP with reduced motion
  {
    const { ctx, page, errors } = await newPage(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    console.log('\nDESKTOP 1440x900, reduced motion');
    await open(page);
    await section('reduced motion', async () => {
      await page.mouse.move(100, 500); await page.mouse.move(140, 620, { steps: 5 }); await page.waitForTimeout(700);
      const s = await fxState(page);
      if (!ok(!!s, 'module 04-fx is in the page')) { return; }
      ok(s.ring.display === 'none' && s.dot.display === 'none' && s.glow.display === 'none' && s.on === false && s.bodyCursor !== 'none', 'GLOW and CURSOR are off with reduced motion; the browser pointer stays (' + s.ring.display + ', ' + s.glow.display + ', ' + s.bodyCursor + ')');
      await vialChecks(page, 'hover', 'VIAL ', true);
    });
    ok(errors.length === 0, 'REDUCED MOTION 0 page errors (' + errors.length + (errors.length ? ': ' + errors[0] : '') + ')');
    await ctx.close();
  }

  // =========================================================== THE CREST P, both sizes
  console.log('\nCREST');
  for (const v of [{ n: 'desktop', label: '1440x900', opts: { viewport: { width: 1440, height: 900 } } }, { n: 'phone', label: '390x844', opts: { viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true } }]) {
    await section('CREST ' + v.label, async () => {
      const m = await crestMeasure(browser, v.opts, URL);
      if (!ok(m && m.d3 === 'on', 'CREST ' + v.label + ': the 3D P is drawn (data-3d ' + (m ? m.d3 : 'no crest') + (m && m.attempt ? ', try ' + m.attempt : '') + ')')) { return; }
      let before = CREST_BEFORE[v.n], from = 'recorded';
      if (REF) { const r = await crestMeasure(browser, v.opts, REF); if (r && r.d3 === 'on') { before = r.w; from = 'measured live'; } else { ok(false, 'CREST ' + v.label + ': the reference page drew its 3D P'); } }
      const ratio = m.w / before;
      ok(near(ratio, 0.85, 0.017), 'CREST ' + v.label + ': the P is 0.85 of its width before, within 2% (' + f(m.w, 1) + ' / ' + f(before, 1) + 'px ' + from + ' = ' + f(ratio, 4) + ')');
      ok(near(m.cx, m.vw / 2, 1), 'CREST ' + v.label + ': still centred across (P centre ' + f(m.cx, 1) + ', window centre ' + f(m.vw / 2, 1) + ')');
      ok(near(m.cy, m.lineY, 1.5), 'CREST ' + v.label + ': still centred on its line, 46% down the stage (P centre ' + f(m.cy, 1) + ', line ' + f(m.lineY, 1) + ')');
      ok(m.fill === '0.4802' && m.fillW === '0.544', 'CREST ' + v.label + ': the slot asks for 0.85 of the old numbers (data-fill ' + m.fill + ', data-fill-w ' + m.fillW + '; were 0.565, 0.64)');
    });
  }

  await browser.close();
  console.log('\n' + (fail ? 'FAILED' : 'ALL PASS') + ': ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log(fails.map(x => '  - ' + x).join('\n')); }
  process.exit(fail ? 1 : 0);
})().catch(e => { console.error('check.js crashed:', e); process.exit(2); });

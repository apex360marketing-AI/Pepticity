// Founder cards check.  node check.js            -> the review page (8 cards)
//                        node check.js --legacy   -> the base store's present hero card, same assertions (fail-first run)
// Exit code 0 only when every assertion passes.
const { chromium } = require('playwright');
const { PNG } = require('/home/user/work/fcards/png.js');
const LEGACY = process.argv.includes('--legacy');
const URL = LEGACY ? 'http://localhost:8821/base/new/index.html' : 'http://localhost:8821/site/founder-cards/index.html';
const SEL = LEGACY
  ? { card: '.pep-hero-card', glass: '.pep-hero-card', light: '.pep-hero-light', btn: '.pep-hero-btn', bloom: null, consent: '.pep-hero-check', mark: null, seat: null }
  : { card: '[data-fc]', glass: '[data-fc-glass]', light: '[data-fc-light]', btn: '[data-fc-btn]', bloom: '[data-fc-bloom]', consent: '[data-fc-consent]', mark: '[data-fc-mark]', seat: '[data-fc-seat]' };
const TEXT = {
  kicker: 'GRAND OPENING', ask: 'JOIN THE FOUNDER CIRCLE', offer: 'THE FIRST 25 MEMBERS GET 10% OFF FOR LIFE.', label: 'EMAIL', btn: 'CLAIM MY FOUNDER SPOT',
  consent: 'Yes, PEPTICITY may email me my welcome and PEPTICITY news. I can unsubscribe any time.', fine: 'For adults. Your details never go to ad platforms.',
};
let pass = 0, fail = 0; const fails = [];
function ok(cond, name, detail) { if (cond) { pass++; } else { fail++; fails.push(name + (detail ? '  [' + detail + ']' : '')); console.log('  FAIL ' + name + (detail ? '  [' + detail + ']' : '')); } }

// runs in the page: everything that can be read from styles and geometry
function collect(SEL) {
  const out = { cards: [], whiteText: [], thinLines: [] };
  const probeBox = document.createElement('div'); probeBox.style.cssText = 'position:absolute;left:-99999px;top:0;height:0;visibility:hidden';
  const probe = document.createElement('div'); probeBox.appendChild(probe); document.body.appendChild(probeBox);
  const px = (expr, ref) => { probeBox.style.width = ref + 'px'; probe.style.width = '0px'; probe.style.width = expr; return probe.getBoundingClientRect().width; };
  const splitTop = (s, sep) => { const o = []; let d = 0, c = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === sep && d === 0) { if (c.trim()) o.push(c.trim()); c = ''; } else c += ch; } if (c.trim()) o.push(c.trim()); return o; };
  const poly = el => { const cp = getComputedStyle(el).clipPath || ''; const m = /^polygon\((.*)\)$/.exec(cp.trim()); if (!m) return null; const w = el.offsetWidth, h = el.offsetHeight; const parts = splitTop(m[1], ','); if (/^(evenodd|nonzero)$/.test(parts[0])) parts.shift(); return { w, h, pts: parts.map(p => { const xy = splitTop(p, ' '); return [px(xy[0], w), px(xy[1], h)]; }) }; };
  const alphas = str => { const a = []; const re = /rgba?\(([^)]+)\)/g; let m; while ((m = re.exec(str))) { const p = m[1].split(/[,\/\s]+/).filter(Boolean).map(parseFloat); a.push(p.length > 3 ? p[3] : 1); } return a; };
  const rect = el => { const r = el.getBoundingClientRect(); return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height }; };
  const vis = el => { const r = el.getBoundingClientRect(); const cs = getComputedStyle(el); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none'; };
  const painted = cs => (cs.backgroundImage && cs.backgroundImage !== 'none') || (alphas(cs.backgroundColor)[0] || 0) > 0.02 || (cs.boxShadow && cs.boxShadow !== 'none');
  document.querySelectorAll(SEL.card).forEach((card, i) => {
    const cr = rect(card);
    const c = { n: card.getAttribute('data-fc') || String(i + 1), rect: cr, glass: [], lights: [], btn: null, consent: null, mark: null, seat: null, text: {} };
    const glassEls = SEL.glass === SEL.card ? [card] : Array.from(card.querySelectorAll(SEL.glass));
    glassEls.forEach(g => {
      const cs = getComputedStyle(g);
      const blurM = /blur\(([\d.]+)px\)/.exec(cs.backdropFilter || cs.webkitBackdropFilter || '');
      const roots = []; let a = g.parentElement;
      while (a && a !== document.documentElement) { const s = getComputedStyle(a); if (s.filter !== 'none' || parseFloat(s.opacity) < 1 || s.clipPath !== 'none' || (s.maskImage && s.maskImage !== 'none')) roots.push(a.className || a.tagName); a = a.parentElement; }
      c.glass.push({ cls: g.className, colorAlpha: alphas(cs.backgroundColor)[0], imageAlphaMax: Math.max(0, ...alphas(cs.backgroundImage === 'none' ? '' : cs.backgroundImage)), blur: blurM ? parseFloat(blurM[1]) : 0, poly: poly(g), radius: parseFloat(cs.borderTopLeftRadius) || 0, backdropRootsAbove: roots });
    });
    card.querySelectorAll(SEL.light).forEach(l => { if (vis(l)) c.lights.push({ cls: l.className, rect: rect(l) }); });
    const btn = Array.from(card.querySelectorAll(SEL.btn)).find(vis);
    if (btn) { const cs = getComputedStyle(btn); c.btn = { rect: rect(btn), poly: poly(btn), radius: parseFloat(cs.borderTopLeftRadius) || 0, transform: cs.transform, text: btn.textContent.replace(/\s+/g, ' ').trim(), minH: btn.getBoundingClientRect().height }; }
    const con = card.querySelector(SEL.consent);
    if (con) c.consent = { checked: con.checked, type: con.type };
    if (SEL.mark) { const m = card.querySelector(SEL.mark); if (m) { const cs = getComputedStyle(m); c.mark = { opacity: parseFloat(cs.opacity), image: cs.backgroundImage }; } }
    if (SEL.seat) { const s = card.querySelector(SEL.seat); if (s) c.seat = { style: getComputedStyle(s).transformStyle, perspective: getComputedStyle(card).perspective, under: !!card.querySelector('[data-fc-under]') }; }
    const t = s => { const e = card.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    const p = 'fc' + c.n;
    c.text = { kicker: t('.' + p + '-kicker'), ask: t('.' + p + '-ask'), offer: t('.' + p + '-offer'), label: t('.' + p + '-label'), consent: t('.' + p + '-consent-text'), fine: t('.' + p + '-fine') };
    // any thin painted element running more than 80% of the card (the edge-to-edge light Jeff rejected)
    card.querySelectorAll('*').forEach(el => {
      if (el.closest('svg') || !vis(el)) return;
      const test = (cs, w, h, tag) => { if (!painted(cs)) return; const shortS = Math.min(w, h), longS = Math.max(w, h); const ref = w >= h ? card.offsetWidth : card.offsetHeight; if (shortS > 0 && shortS <= 8 && longS > 0.8 * ref) out.thinLines.push({ card: c.n, el: tag, w: Math.round(w), h: Math.round(h) }); };
      test(getComputedStyle(el), el.offsetWidth, el.offsetHeight, el.className || el.tagName);
      ['::before', '::after'].forEach(ps => { const cs = getComputedStyle(el, ps); if (cs.content === 'none' || cs.content === 'normal') return; test(cs, parseFloat(cs.width) || 0, parseFloat(cs.height) || 0, (el.className || el.tagName) + ps); });
    });
    out.cards.push(c);
  });
  // flat white text anywhere on the page
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seen = new Set(); let node;
  while ((node = walker.nextNode())) {
    if (!node.nodeValue.trim()) continue; const el = node.parentElement; if (!el || seen.has(el) || /^(SCRIPT|STYLE|NOSCRIPT)$/.test(el.tagName) || !vis(el)) continue; seen.add(el);
    const cs = getComputedStyle(el); let fill = cs.webkitTextFillColor; if (!fill || fill === 'currentcolor') fill = cs.color;
    const m = /rgba?\(([^)]+)\)/.exec(fill); if (!m) continue; const p = m[1].split(/[,\/\s]+/).filter(Boolean).map(parseFloat);
    if (p[0] === 255 && p[1] === 255 && p[2] === 255 && (p.length < 4 || p[3] > 0)) out.whiteText.push((el.className || el.tagName) + ': ' + node.nodeValue.trim().slice(0, 30));
  }
  document.querySelectorAll('input:not([type=checkbox]):not([type=hidden])').forEach(el => { if (vis(el) && getComputedStyle(el).color === 'rgb(255, 255, 255)') out.whiteText.push('input ' + (el.className || el.id)); });
  probeBox.remove();
  return out;
}
function shape(poly) {
  // returns { n, minAngle, apex } for a pixel polygon
  const P = poly.pts, n = P.length; let minAngle = 180; let apex = false;
  for (let i = 0; i < n; i++) {
    const a = P[(i + n - 1) % n], b = P[i], c = P[(i + 1) % n];
    const v1 = [a[0] - b[0], a[1] - b[1]], v2 = [c[0] - b[0], c[1] - b[1]];
    const d = Math.hypot(...v1) * Math.hypot(...v2); if (!d) continue;
    const ang = Math.acos(Math.max(-1, Math.min(1, (v1[0] * v2[0] + v1[1] * v2[1]) / d))) * 180 / Math.PI;
    if (ang < minAngle) minAngle = ang;
  }
  const xs = P.map(p => p[0]), ys = P.map(p => p[1]);
  const lone = (vals, other, lo, hi) => [Math.min(...vals), Math.max(...vals)].some(ext => { const at = P.filter((p, i) => Math.abs(vals[i] - ext) < 0.75); return at.length === 1 && other(at[0]) > lo + 1 && other(at[0]) < hi - 1; });
  if (lone(xs, p => p[1], Math.min(...ys), Math.max(...ys))) apex = true;   // one vertex alone at the far left or right, part-way up: an arrow end
  if (lone(ys, p => p[0], Math.min(...xs), Math.max(...xs))) apex = true;
  return { n, minAngle, apex };
}
async function lightFade(page, light, cardN) {
  // pixel proof: the light is bright in the middle and gone at both ends. Compares the light shown against the light hidden.
  const r = light.rect; const horiz = r.w >= r.h; const pad = 8;
  const clip = { x: Math.max(0, Math.floor(r.x - (horiz ? 0 : pad))), y: Math.max(0, Math.floor(r.y - (horiz ? pad : 0))), width: Math.ceil(r.w + (horiz ? 0 : 2 * pad)), height: Math.ceil(r.h + (horiz ? 2 * pad : 0)) };
  await page.evaluate(y => window.scrollTo(0, Math.max(0, y - 200)), clip.y);
  await page.waitForTimeout(250);
  const sy = await page.evaluate(() => scrollY);
  const vclip = { x: clip.x, y: clip.y - sy, width: clip.width, height: clip.height };
  const on = PNG.decode(await page.screenshot({ clip: vclip, timeout: 240000 }));
  await page.addStyleTag({ content: '[data-fc-light],.pep-hero-light{visibility:hidden!important}' }).then(h => h.evaluate(e => e.setAttribute('data-off', '1')));
  await page.waitForTimeout(150);
  const off = PNG.decode(await page.screenshot({ clip: vclip, timeout: 240000 }));
  await page.evaluate(() => document.querySelectorAll('style[data-off]').forEach(s => s.remove()));
  const L = horiz ? on.width : on.height; const prof = new Array(L).fill(0);
  for (let y = 0; y < on.height; y++) for (let x = 0; x < on.width; x++) { const i = (y * on.width + x) * 4; const d = Math.max(Math.abs(on.data[i] - off.data[i]), Math.abs(on.data[i + 1] - off.data[i + 1]), Math.abs(on.data[i + 2] - off.data[i + 2])); const k = horiz ? x : y; if (d > prof[k]) prof[k] = d; }
  const zone = (a, b) => Math.max(...prof.slice(Math.floor(a * L), Math.max(Math.floor(a * L) + 1, Math.ceil(b * L))));
  return { endA: zone(0, 0.05), endB: zone(0.95, 1), mid: zone(0.42, 0.58) };
}
async function run(browser, w, h, touch) {
  console.log(`\n== ${w}x${h}${touch ? ' (touch)' : ''} ${LEGACY ? 'LEGACY base hero' : 'founder cards'} ==`);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage(); page.setDefaultTimeout(240000);
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + String(e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.goto(URL, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  await page.waitForTimeout(LEGACY ? 4000 : 1500);
  await page.evaluate(() => { if (window.__fcQuilt) window.__fcQuilt.freeze(1.5); });
  const T = `${w}: `;
  const d = await page.evaluate(collect, SEL);
  ok(d.cards.length === 8, T + 'exactly 8 cards', 'found ' + d.cards.length);
  if (!LEGACY) ok(d.cards.map(c => c.n).join('') === '12345678', T + 'cards numbered 1 to 8', d.cards.map(c => c.n).join(','));
  ok(d.whiteText.length === 0, T + 'no flat white (#fff) text on the page', d.whiteText.slice(0, 4).join(' | '));
  ok(d.thinLines.length === 0, T + 'no thin painted line running more than 80% of a card', JSON.stringify(d.thinLines.slice(0, 3)));
  for (const c of d.cards) {
    const C = `${T}card ${c.n}: `;
    ok(c.glass.length >= 1, C + 'has a glass pane');
    for (const g of c.glass) {
      ok(g.colorAlpha !== undefined && g.colorAlpha <= 0.10, C + 'glass fill alpha at most 0.10', `${g.cls} alpha ${g.colorAlpha}`);
      ok(g.imageAlphaMax <= 0.10, C + 'glass background image alpha at most 0.10', `${g.cls} max ${g.imageAlphaMax}`);
      ok(g.blur > 0, C + 'glass has a backdrop blur', `${g.cls} blur ${g.blur}`);
      ok(g.backdropRootsAbove.length === 0, C + 'nothing above the glass breaks the see-through', g.backdropRootsAbove.join(','));
      const s = g.poly ? shape(g.poly) : null;
      ok(!!s && s.n >= 5 && g.radius <= 3, C + 'glass is a cut shape (not a rectangle, no pill)', s ? `${s.n} corners, radius ${g.radius}` : 'no clip-path polygon');
      if (s) ok(s.minAngle >= 70, C + 'glass shape has no points (every corner at least 70 degrees)', `sharpest ${s.minAngle.toFixed(1)}`);
    }
    ok(c.lights.length >= 1, C + 'has a lens light');
    for (const l of c.lights) {
      const horiz = l.rect.w >= l.rect.h; const ratio = horiz ? l.rect.w / c.rect.w : l.rect.h / c.rect.h;
      ok(ratio <= 0.80, C + 'light is at most 80% of the card', `${(ratio * 100).toFixed(1)}% ${horiz ? 'wide' : 'tall'}`);
      const f = await lightFade(page, l, c.n);
      ok(f.endA <= 10 && f.endB <= 10, C + 'light fades to nothing at both ends', `ends ${f.endA}/${f.endB} of 255`);
      ok(f.mid >= 40, C + 'light is bright in the middle', `middle ${f.mid} of 255`);
    }
    ok(!!c.btn, C + 'has a visible button');
    if (c.btn) {
      const s = c.btn.poly ? shape(c.btn.poly) : null;
      ok(!!s && s.n >= 5 && c.btn.radius <= 3, C + 'button is a cut shape (not a rectangle, no pill)', s ? `${s.n} corners` : 'no clip-path polygon');
      if (s) { ok(!s.apex, C + 'button has no arrow or chevron end'); ok(s.minAngle >= 70, C + 'button has no points (every corner at least 70 degrees)', `sharpest ${s.minAngle.toFixed(1)}`); }
      if (!LEGACY) ok(c.btn.text === TEXT.btn, C + 'button says CLAIM MY FOUNDER SPOT', c.btn.text);
      ok(c.btn.minH >= 44, C + 'button at least 44px tall', String(c.btn.minH));
    }
    ok(!!c.consent && c.consent.type === 'checkbox' && c.consent.checked === false, C + 'consent box present and unticked');
    if (!LEGACY) {
      ok(!!c.mark && c.mark.opacity >= 0.02 && c.mark.opacity <= 0.04 && /p-turn\.webp/.test(c.mark.image), C + 'P watermark from the real render at 2 to 4 percent', c.mark ? String(c.mark.opacity) : 'missing');
      ok(!!c.seat && c.seat.style === 'preserve-3d' && c.seat.perspective !== 'none' && c.seat.under, C + 'sits in 3D (perspective, preserve-3d, under-glow)');
      for (const k of ['kicker', 'ask', 'offer', 'label', 'consent', 'fine']) ok(c.text[k] === TEXT[k], C + 'text: ' + k, String(c.text[k]));
    }
  }
  if (!touch) {
    // hover: the key comes toward you and light blooms below it
    for (const c of d.cards) {
      const C = `${T}card ${c.n}: `;
      const card = page.locator(SEL.card).nth(d.cards.indexOf(c)); const btn = card.locator(SEL.btn).first();
      try {
        await page.mouse.move(2, 2);
        await btn.scrollIntoViewIfNeeded({ timeout: 8000 });
        await page.waitForTimeout(700);
        const read = () => btn.evaluate((b, bloomSel) => { const m = new DOMMatrix(getComputedStyle(b).transform); const bl = bloomSel ? b.parentElement.querySelector(bloomSel) : null; const bs = bl ? getComputedStyle(bl) : null; return { scale: Math.hypot(m.m11, m.m12), tz: m.m43, ty: m.m42, bloom: bs ? parseFloat(bs.opacity) : null, bloomBg: bs ? bs.backgroundImage : '', shadow: getComputedStyle(b).boxShadow }; }, SEL.bloom);
        const before = await read();
        await btn.hover({ timeout: 8000 });
        await page.waitForTimeout(900);
        const after = await read();
        ok(after.scale >= before.scale * 1.03 && after.tz > before.tz, C + 'hover raises the button toward the viewer', `scale ${before.scale.toFixed(3)} to ${after.scale.toFixed(3)}, z ${before.tz} to ${after.tz}`);
        ok(after.bloom !== null && after.bloom - before.bloom >= 0.3 && /42, 120, 255/.test(after.bloomBg), C + 'hover adds a logo-blue glow below the button', `glow ${before.bloom} to ${after.bloom}`);
        await page.mouse.down(); await page.waitForTimeout(350);
        const pressed = await read();
        ok(pressed.scale < after.scale && pressed.tz < after.tz, C + 'press seats the button back down', `scale ${pressed.scale.toFixed(3)}, z ${pressed.tz}`);
        await page.mouse.move(2, 2); await page.mouse.up();
      } catch (e) { ok(false, C + 'hover raises the button toward the viewer', 'could not hover: ' + String(e).split('\n')[0].slice(0, 90)); }
    }
    if (!LEGACY) {
      // typing and the preview-only ending, on every card
      for (const c of d.cards) {
        const C = `${T}card ${c.n}: `; const card = page.locator(SEL.card).nth(d.cards.indexOf(c));
        const input = card.locator('input[type=email]'); const p = 'fc' + c.n;
        await input.click(); await page.keyboard.type('jeff@example.com');
        ok(await input.inputValue() === 'jeff@example.com', C + 'typing lands in the email field');
        const foot = await card.locator('.' + p + '-well').evaluate(e => getComputedStyle(e).boxShadow);
        ok(/42, 120, 255/.test(foot), C + 'focus shows the bar of light at the foot of the field', foot.slice(0, 60));
        await page.keyboard.press('Enter'); await page.waitForTimeout(150);
        ok((await card.locator('[data-fc-err]').textContent()) === 'Tick the box so we can email your welcome.', C + 'unticked consent is asked for, nothing proceeds');
        await card.locator(SEL.consent).check({ force: true });
        await input.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150);
        const done = card.locator('[data-fc-done]');
        ok(await done.isVisible() && /PREVIEW ONLY: NOTHING WAS SENT\./.test(await done.textContent()), C + 'ends in PREVIEW ONLY: NOTHING WAS SENT.');
        await page.mouse.move(2, 2);
      }
    }
  }
  if (!LEGACY) {
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, T + 'no sideways scroll', over + 'px');
  }
  ok(errs.length === 0, T + '0 page errors', errs.slice(0, 3).join(' | '));
  await ctx.close();
}
(async () => {
  const browser = await chromium.launch();
  await run(browser, 1440, 900, false);
  await run(browser, 390, 844, true);
  if (!LEGACY) {
    // reduced motion: no travel, the light change only; the heading sheen stops
    console.log('\n== 1440x900 reduced motion ==');
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
    const page = await ctx.newPage(); page.setDefaultTimeout(240000);
    await page.goto(URL, { waitUntil: 'load' }); await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' }); await page.waitForTimeout(1200);
    for (let n = 1; n <= 8; n++) {
      const btn = page.locator(`.fc${n} [data-fc-btn]`); await page.mouse.move(2, 2); await btn.scrollIntoViewIfNeeded(); await btn.hover(); await page.waitForTimeout(250);
      const r = await btn.evaluate(b => ({ t: getComputedStyle(b).transform, bloom: parseFloat(getComputedStyle(b.parentElement.querySelector('[data-fc-bloom]')).opacity), anim: getComputedStyle(b.closest('[data-fc]').querySelector('[class$="-face"]')).animationName }));
      ok(r.t === 'none' || r.t === 'matrix(1, 0, 0, 1, 0, 0)', `rm: card ${n}: no travel on hover`, r.t);
      ok(r.bloom >= 0.9, `rm: card ${n}: the light still comes on`, String(r.bloom));
      ok(r.anim === 'none', `rm: card ${n}: heading sheen is still`, r.anim);
    }
    await ctx.close();
    // colours: only the palette, the one blue, pale chrome gold
    const fs = require('fs'); const html = fs.readFileSync('/home/user/work/fcards/site/founder-cards/index.html', 'utf8');
    const css = (html.match(/<style data-fc-src="[^"]*">[\s\S]*?<\/style>/g) || []).join('\n');
    const HEX = ['#0b0b0c', '#141416', '#1c1e21', '#2a2d31', '#6b7077', '#b9bec5', '#cdd1d7', '#e6e9ed', '#ffffff', '#2a78ff', '#cfe6ff', '#332814', '#68513d', '#a4845d', '#f0e6c7', '#fef9e8', '#000'];
    const RGB = ['42,120,255', '207,230,255', '255,255,255', '0,0,0', '11,11,12', '185,190,197', '230,233,237', '240,230,199'];
    const badHex = [...new Set((css.match(/#[0-9a-fA-F]{3,8}\b/g) || []).map(s => s.toLowerCase()))].filter(x => !HEX.includes(x));
    const badRgb = [...new Set((css.match(/rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+/g) || []).map(s => s.replace(/rgba?\(|\s/g, '')))].filter(x => !RGB.includes(x));
    ok(badHex.length === 0, 'colours: every hex is on the palette (one blue, no violet)', badHex.join(' '));
    ok(badRgb.length === 0, 'colours: every rgb triple is on the palette (one blue, no violet)', badRgb.join(' '));
    ok(!/border-radius\s*:\s*(?!0|[123]px)[^;]+/.test(css), 'no corner radius above 3px in the styles');
  }
  await browser.close();
  console.log(`\n${fail === 0 ? 'ALL PASS' : 'FAILED'}: ${pass} passed, ${fail} failed`);
  process.exit(fail === 0 ? 0 : 1);
})().catch(e => { console.error('CHECK CRASHED', e); process.exit(2); });

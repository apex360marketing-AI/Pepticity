// SCROLL THE WHOLE PAGE: top to bottom and back, desktop 1440x900, iPhone 13, iPhone 13 with CPU 4x slower.
// usage: node scroll.js <url> [desktop|phone|phone4x|all]
// Prints: longest rAF gap, gaps > 250 ms, sections that stay invisible in view, things left stuck, fixed bars covering focused controls.
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const WHICH = process.argv[3] || 'all';
const o = L.out();

async function sampler(page) {
  await page.evaluate(() => {
    window.__gaps = []; window.__frames = 0; window.__run = true; let last = performance.now();
    (function f(t) { const g = t - last; last = t; window.__frames++; if (g > 50) window.__gaps.push([Math.round(g), Math.round(scrollY)]); if (window.__run) requestAnimationFrame(f); })(last);
  });
}
async function invisibleInView(page) {
  // text-bearing elements inside the viewport whose effective opacity is ~0 or visibility hidden, grouped by section
  return page.evaluate(() => {
    const vh = innerHeight, out = {}; let seen = 0;
    const els = document.querySelectorAll('main h1, main h2, main h3, main p, main button, main a, section h1, section h2, section h3, section p, section button, section a, footer p, footer a');
    for (const e of els) {
      if (e.closest('[hidden],[aria-hidden="true"],dialog:not([open]),template')) continue;
      const r = e.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue;
      if (r.bottom < vh * 0.15 || r.top > vh * 0.85) continue;
      if (!(e.textContent || '').trim()) continue;
      const cs = getComputedStyle(e); if (cs.display === 'none') continue;
      seen++;
      let op = 1, n = e, vis = cs.visibility !== 'hidden';
      while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      if (op < 0.05 || !vis) { const s = e.closest('section,footer,header'); const k = s ? (s.id || s.getAttribute('data-module') || s.tagName) : '?'; (out[k] = out[k] || []).push((e.tagName + ' ' + e.textContent.trim().slice(0, 30)).replace(/\s+/g, ' ')); }
    }
    return { seen, out };
  });
}
async function fixedOnScreen(page) {
  return page.evaluate(() => [...document.querySelectorAll('body *')].filter((e) => {
    const cs = getComputedStyle(e); if (cs.position !== 'fixed' && cs.position !== 'sticky') return false;
    if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    if (e.closest('[hidden]')) return false;
    const r = e.getBoundingClientRect(); if (r.width < 8 || r.height < 8) return false;
    if (r.bottom <= 0 || r.top >= innerHeight || r.right <= 0 || r.left >= innerWidth) return false;
    if (r.width >= innerWidth - 2 && r.height >= innerHeight - 2) return false; // full-screen layers (ground, empty containers)
    return true;
  }).map((e) => { const r = e.getBoundingClientRect(); return (e.id ? '#' + e.id : '') + '.' + String(e.className).split(' ')[0] + '[' + [r.left, r.top, r.width, r.height].map(Math.round).join(',') + ']'; }));
}

async function run(b, label, kind, cpu) {
  const { ctx, page, rec } = await L.open(b, kind, URL_, { cpu });
  await L.frames(page, 30);
  const vh = await page.evaluate(() => innerHeight);
  const fixedTop = await fixedOnScreen(page);
  await sampler(page);
  const t0 = Date.now();
  let H = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.round(vh * 0.6);
  const notShown = {}; let checked = 0, stops = 0;
  // DOWN, by wheel (real input path)
  for (let guard = 0; guard < 400; guard++) {
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.move(Math.round((await page.evaluate(() => innerWidth)) / 2), Math.round(vh / 2));
    await page.mouse.wheel(0, step);
    await L.settleScroll(page);
    stops++;
    if (stops % 2 === 0) { await L.frames(page, 45); const r = await invisibleInView(page); checked += r.seen; for (const k in r.out) (notShown[k] = notShown[k] || new Set()).add(...r.out[k].slice(0, 3)); }
    const y1 = await page.evaluate(() => scrollY); H = await page.evaluate(() => document.documentElement.scrollHeight);
    if (y1 + vh >= H - 2 || y1 === y0) break;
  }
  const atBottom = await page.evaluate(() => ({ y: Math.round(scrollY), H: document.documentElement.scrollHeight, vh: innerHeight }));
  await L.frames(page, 30);
  const fixedBottom = await fixedOnScreen(page);
  // UP
  for (let guard = 0; guard < 400; guard++) {
    await page.mouse.wheel(0, -step); await L.settleScroll(page);
    const y1 = await page.evaluate(() => scrollY); if (y1 <= 0) break;
  }
  await L.frames(page, 30);
  const back = await page.evaluate(() => Math.round(scrollY));
  await page.evaluate(() => { window.__run = false; });
  const g = await page.evaluate(() => ({ gaps: window.__gaps, frames: window.__frames }));
  const secs = ((Date.now() - t0) / 1000).toFixed(1);
  const longest = g.gaps.reduce((m, x) => (x[0] > m[0] ? x : m), [0, 0]);
  const over250 = g.gaps.filter((x) => x[0] > 250);
  o.note(`${label}: ${stops} wheel stops down, ${g.frames} frames sampled in ${secs}s, bottom y=${atBottom.y} H=${atBottom.H}, back at y=${back}`);
  o.claim(atBottom.y + atBottom.vh >= atBottom.H - 4 && back === 0, `${label} reaches the bottom and back to the top`, `bottom ${atBottom.y}+${atBottom.vh}/${atBottom.H}, top ${back}`);
  o.claim(over250.length === 0, `${label} no frozen stretch (rAF gap > 250 ms)`, `longest gap ${longest[0]} ms at y=${longest[1]}; ${over250.length} gaps > 250 ms: ${over250.slice(0, 8).map((x) => x[0] + 'ms@' + x[1]).join(' ')}; gaps>50ms ${g.gaps.length}`);
  const top = g.gaps.slice().sort((a, b) => b[0] - a[0]).slice(0, 12); o.note(`${label} worst gaps: ${top.map((x) => x[0] + 'ms@' + x[1]).join(' ')}`);
  const buckets = {}; for (const x of over250) { const k = Math.floor(x[1] / 2000) * 2000; buckets[k] = (buckets[k] || 0) + 1; } o.note(`${label} gaps>250 by y/2000: ${JSON.stringify(buckets)}`);
  const ns = Object.keys(notShown).map((k) => k + ': ' + [...notShown[k]].join(' / '));
  o.claim(ns.length === 0, `${label} every section appears when in view`, `${checked} element-in-view checks; still invisible after 45 frames: ${ns.join(' | ') || 'none'}`);
  o.note(`${label} fixed/sticky at top: ${fixedTop.join(' ')}`);
  o.note(`${label} fixed/sticky at bottom: ${fixedBottom.join(' ')}`);
  const errs = rec.pageerror.length + rec.console.length;
  o.claim(errs === 0, `${label} no page/console errors while scrolling`, `${rec.pageerror.length} pageerror ${rec.console.length} console ${(rec.pageerror[0] || rec.console[0] || '').slice(0, 160)}`);
  await ctx.close();
}

// focus every visible control (as Tab would) and check that no fixed/sticky layer sits on it
async function covered(b, label, kind) {
  const { ctx, page } = await L.open(b, kind, URL_);
  await L.frames(page, 30);
  const n = await page.evaluate(() => {
    const sel = 'main input:not([type=hidden]), main select, main textarea, main button, main a[href], section input:not([type=hidden]), section select, section textarea, section button, section a[href], section h2, footer a[href], footer button';
    window.__ctl = [...new Set(document.querySelectorAll(sel))].filter((e) => { if (e.closest('[hidden],dialog,template,[inert]')) return false; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 4 && r.height > 4 && cs.visibility !== 'hidden' && cs.display !== 'none'; });
    return window.__ctl.length;
  });
  const bad = []; let tested = 0;
  for (let i = 0; i < n; i++) {
    const r = await page.evaluate(async (i) => {
      const e = window.__ctl[i]; if (!e.isConnected) return null;
      if (e.tagName === 'H2') e.scrollIntoView({ block: 'start' }); else { if (!e.hasAttribute('tabindex') && e.tabIndex < 0) return null; e.focus({ preventScroll: false }); if (document.activeElement !== e) e.scrollIntoView({ block: 'nearest' }); }
      await new Promise((res) => requestAnimationFrame(() => requestAnimationFrame(res)));
      const b = e.getBoundingClientRect(); if (b.width < 4 || b.height < 4) return null;
      // check 3 points across the middle line
      const pts = [[b.left + b.width / 2, b.top + Math.min(b.height / 2, 12)], [b.left + 6, b.top + b.height / 2], [b.right - 6, b.top + b.height / 2]];
      const hits = [];
      for (const [x, y] of pts) {
        if (y < 0 || y > innerHeight || x < 0 || x > innerWidth) { hits.push('offscreen'); continue; }
        const t = document.elementFromPoint(x, y); if (!t || t === e || e.contains(t) || t.contains(e)) { hits.push('ok'); continue; }
        let n = t, fx = null; while (n && n.nodeType === 1) { const p = getComputedStyle(n).position; if (p === 'fixed' || p === 'sticky') { fx = n; break; } n = n.parentElement; }
        hits.push(fx ? ('FIXED ' + (fx.id ? '#' + fx.id : '') + '.' + String(fx.className).split(' ')[0] + '>' + t.tagName.toLowerCase() + '.' + String(t.className).split(' ')[0]) : 'other');
      }
      return { what: (e.tagName + (e.id ? '#' + e.id : '') + ' ' + (e.getAttribute('aria-label') || e.textContent || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 30)), hits, y: Math.round(b.top) };
    }, i);
    if (!r) continue; tested++;
    if (r.hits.some((h) => h.startsWith('FIXED'))) bad.push(r.what + ' @top=' + r.y + ' ' + r.hits.filter((h) => h.startsWith('FIXED'))[0]);
  }
  o.claim(bad.length === 0, `${label} fixed header / guide bar never cover a focused control or a heading`, `${tested} controls+headings tested; covered ${bad.length}: ${bad.slice(0, 12).join(' || ')}`);
  await ctx.close();
}

async function wide(b) {
  const widths = [390, 768, 1024, 1440, 1920, 2560]; const res = [];
  for (const w of widths) {
    const { ctx, page } = await L.open(b, { viewport: { width: w, height: 900 }, deviceScaleFactor: 1, isMobile: w === 390, hasTouch: w === 390 }, URL_);
    await L.frames(page, 20);
    // scroll through so lazy parts are built, then measure
    const H = await page.evaluate(() => document.documentElement.scrollHeight); let worst = 0, culprit = '';
    for (let y = 0; y <= H; y += 1800) {
      await page.evaluate((y) => scrollTo(0, y), y); await L.frames(page, 4);
      const m = await page.evaluate(() => { const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth); let c = ''; if (sw > innerWidth) { for (const e of document.querySelectorAll('body *')) { const r = e.getBoundingClientRect(); if (r.right > innerWidth + 1 && r.width > 0 && getComputedStyle(e).position !== 'fixed') { c = e.tagName + '.' + String(e.className).split(' ')[0] + ' right=' + Math.round(r.right); break; } } } return { over: sw - innerWidth, c }; });
      if (m.over > worst) { worst = m.over; culprit = m.c; }
    }
    // can the visitor actually move sideways?
    const moved = await page.evaluate(() => { scrollTo(500, scrollY); const x = scrollX; scrollTo(0, scrollY); return x; });
    res.push([w, worst, moved, culprit]);
    await ctx.close();
  }
  for (const [w, worst, moved, c] of res) o.claim(worst <= 0 && moved === 0, `no sideways scroll at ${w}`, `overflow ${worst}px, scrollX after scrollTo(500) = ${moved}${c ? ' first wide element ' + c : ''}`);
}

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  if (WHICH === 'all' || WHICH === 'desktop') await run(b, 'desktop 1440x900', 'desktop');
  if (WHICH === 'all' || WHICH === 'phone') await run(b, 'iPhone 13', 'phone');
  if (WHICH === 'all' || WHICH === 'phone4x') await run(b, 'iPhone 13 CPU 4x', 'phone', 4);
  if (WHICH === 'all' || WHICH === 'cover') { await covered(b, 'desktop', 'desktop'); await covered(b, 'iPhone 13', 'phone'); }
  if (WHICH === 'all' || WHICH === 'wide') await wide(b);
  await b.close();
  process.exit(o.done('scroll') ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

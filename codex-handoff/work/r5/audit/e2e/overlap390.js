// OVERLAPS AT 390 WIDE: is anything fixed (guide launcher, phone bar, a pop-up card) sitting on the hero card, a button or a
// form field at rest? Walks the page in screen-sized stops on iPhone 13, waits at each stop for the overlays' timers
// (they re-check every 100/600 ms) and tests every control and the hero card against the fixed layers.
// usage: node overlap390.js <url>
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const o = L.out();
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const { ctx, page } = await L.open(b, 'phone', URL_);
  // let the entrance finish and the exit/bar timers arm (armAfterMs 8000) without a fixed sleep: wait for the armed flag
  await page.waitForFunction(() => document.querySelector('.pep-hooks-overlays [data-hooks-armed]') || document.querySelector('[data-hooks-armed]'), null, { timeout: 60000 }).catch(() => o.note('overlays never armed'));
  const H = await page.evaluate(() => document.documentElement.scrollHeight), vh = await page.evaluate(() => innerHeight);
  const hits = new Map(); let tests = 0, stops = 0; const shotsAt = [];
  for (let y = 0; y < H; y += Math.round(vh * 0.5)) {
    await page.evaluate((y) => scrollTo(0, y), y); await L.settleScroll(page);
    // the overlays decide on timers: wait for 2 of their 600 ms ticks measured in frames+time, by polling until stable
    await page.waitForFunction(() => new Promise((r) => setTimeout(() => r(true), 700)), null, { timeout: 5000 });
    stops++;
    const r = await page.evaluate(() => {
      const fx = [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); if (cs.position !== 'fixed') return false; if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.1 || cs.pointerEvents === 'none' && !e.querySelector('*')) return false; if (e.closest('[hidden]')) return false; const r = e.getBoundingClientRect(); return r.width > 8 && r.height > 8 && r.width < innerWidth * 0.98 + 1000 && !(r.width >= innerWidth - 2 && r.height >= innerHeight - 2) && r.bottom > 0 && r.top < innerHeight; });
      const ctl = [...document.querySelectorAll('section button, section a[href], section input:not([type=hidden]), section select, section textarea, section label, main button, main input, footer a[href], footer button, .pep-hero-card, [class*="hero-card"]')].filter((e) => { if (e.closest('[hidden],template,dialog:not([open])')) return false; const cs = getComputedStyle(e); if (cs.visibility === 'hidden' || cs.display === 'none') return false; let n = e; while (n) { if (getComputedStyle(n).position === 'fixed') return false; n = n.parentElement; } const r = e.getBoundingClientRect(); return r.width > 4 && r.height > 4 && r.bottom > 0 && r.top < innerHeight; });
      const out = []; let n = 0;
      for (const c of ctl) {
        const r = c.getBoundingClientRect(); n++;
        const pts = [[r.left + r.width / 2, r.top + r.height / 2], [r.left + 5, r.top + 5], [r.right - 5, r.top + 5], [r.left + 5, r.bottom - 5], [r.right - 5, r.bottom - 5]];
        for (const [px, py] of pts) {
          if (px < 0 || py < 0 || px > innerWidth || py > innerHeight) continue;
          const at = document.elementFromPoint(px, py); if (!at || c.contains(at)) continue;
          let f = at; while (f && getComputedStyle(f).position !== 'fixed') f = f.parentElement;
          if (!f) continue;
          out.push({ fixed: at.tagName + '.' + String(at.className).split(' ')[0] + ' (in fixed ' + (f.id ? '#' + f.id : '') + '.' + String(f.className).split(' ')[0] + ')', ctl: c.tagName + '.' + String(c.className).split(' ')[0] + ' "' + (c.getAttribute('aria-label') || c.textContent || c.name || c.placeholder || '').trim().replace(/\s+/g, ' ').slice(0, 28) + '"', area: 'pt ' + Math.round(px) + ',' + Math.round(py), y: Math.round(scrollY) });
          break;
        }
      }
      return { out, n, fx: fx.map((f) => (f.id ? '#' + f.id : '') + '.' + String(f.className).split(' ')[0]) };
    });
    tests += r.n;
    for (const h of r.out) { const k = h.fixed + ' over ' + h.ctl; if (!hits.has(k)) { hits.set(k, h); if (shotsAt.length < 4) { const p = await L.shot(page, `${tag}-overlap390-${shotsAt.length}.png`); shotsAt.push(p + ' (y=' + h.y + ')'); } } }
  }
  const list = [...hits.values()].map((h) => `${h.fixed} over ${h.ctl} ${h.area}px @y=${h.y}`);
  o.claim(list.length === 0, 'iPhone 13: no fixed layer sits on a control or the hero card at rest', `${stops} stops, ${tests} control checks; ${list.length} overlaps: ${list.slice(0, 12).join(' || ')}`);
  for (const s of shotsAt) o.note('screenshot ' + s);
  await ctx.close(); await b.close();
  process.exit(o.done('overlap390 ' + tag) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

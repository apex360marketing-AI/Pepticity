// Re-check after the overlays' timers ran: focus a control (as Tab/tap would), wait 1.5 s, hit-test, screenshot.
// usage: node confirm_cover.js <url>
const L = require('./lib'); const o = L.out(); const tag = /8964/.test(process.argv[2]) ? 'rc4' : 'rc5';
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'phone', process.argv[2]);
  await page.waitForFunction(() => document.querySelector('[data-hooks-armed]'), null, { timeout: 60000 }).catch(() => {});
  const sels = ['#pep-hooks-card-email', '#founder-card form.pep-hooks-form button[type=submit]', '#pep-hooks-card-phone', '.pep-hooks-tile'];
  let i = 0;
  for (const s of sels) {
    await page.evaluate((s) => { const e = document.querySelector(s); e.scrollIntoView({ block: 'end' }); e.focus(); }, s);
    await page.waitForFunction(() => new Promise((r) => setTimeout(() => r(true), 1500)), null, { timeout: 5000 });
    const r = await page.evaluate((s) => { const e = document.querySelector(s); const b = e.getBoundingClientRect(); const pts = [[b.left + b.width / 2, b.top + b.height / 2], [b.right - 6, b.top + b.height / 2], [b.left + 6, b.bottom - 4]]; return { box: [b.left, b.top, b.width, b.height].map(Math.round), hits: pts.map(([x, y]) => { const t = document.elementFromPoint(x, y); if (!t || e.contains(t)) return 'self'; let f = t; while (f && getComputedStyle(f).position !== 'fixed') f = f.parentElement; return f ? 'FIXED ' + t.tagName + '.' + String(t.className).split(' ')[0] : 'other ' + t.tagName; }) }; }, s);
    const bad = r.hits.filter((h) => h.startsWith('FIXED'));
    o.claim(bad.length === 0, `phone ${s} not covered after 1.5 s (block:end, focused)`, `box ${r.box}; hits ${r.hits.join(', ')}`);
    if (bad.length) await L.shot(page, `${tag}-cover-${i++}.png`);
  }
  await ctx.close(); await b.close(); process.exit(o.done('confirm_cover ' + tag) ? 1 : 0); })();

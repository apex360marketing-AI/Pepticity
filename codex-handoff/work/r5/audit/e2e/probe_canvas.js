// list canvases in the Founders engraver with backing size vs on-screen size. usage: node probe_canvas.js <url> [desktop|phone]
const L = require('./lib');
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, process.argv[3] || 'desktop', process.argv[2]);
  await page.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'start' }));
  await page.waitForFunction(() => { const r = document.getElementById('engraver'); return r && r.getAttribute('data-state') === 'done'; }, null, { timeout: 120000 });
  const c = await page.evaluate(() => [...document.querySelectorAll('#founder-card canvas, #engraver canvas')].map((c) => { const r = c.getBoundingClientRect(); return `${c.width}x${c.height} backing (${(c.width * c.height / 1e6).toFixed(1)} MP) shown ${Math.round(r.width)}x${Math.round(r.height)} display=${getComputedStyle(c).display}`; }));
  let mp = 0; c.forEach((x) => { console.log('note   ' + x); mp += parseFloat(x.split('(')[1]); });
  console.log((mp > 12 ? 'BROKEN' : 'safe  ') + ` founders canvases total ${mp.toFixed(1)} MP backing (${c.length} canvases)`);
  await ctx.close(); await b.close(); })().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

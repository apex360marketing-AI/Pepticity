// trace the Founders-card freeze: top long events on the renderer main thread. usage: node probe_trace.js <url>
const L = require('./lib'); const fs = require('fs');
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'desktop', process.argv[2]);
  await L.frames(page, 30);
  await b.startTracing(page, { path: L.HERE + '/shots/trace.json', categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc', 'gpu'] });
  await page.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'start' }));
  await page.waitForFunction(() => { const r = document.getElementById('engraver'); return r && r.getAttribute('data-state') === 'done'; }, null, { timeout: 120000 });
  await b.stopTracing();
  const t = JSON.parse(fs.readFileSync(L.HERE + '/shots/trace.json')); const ev = (t.traceEvents || t).filter((e) => e.ph === 'X' && e.dur > 1000000);
  const names = {}; (t.traceEvents || t).filter((e) => e.ph === 'M' && e.name === 'thread_name').forEach((e) => { names[e.pid + ':' + e.tid] = e.args.name; });
  ev.sort((a, c) => c.dur - a.dur).slice(0, 15).forEach((e) => console.log('note   ' + Math.round(e.dur / 1000) + 'ms ' + e.name + ' [' + (names[e.pid + ':' + e.tid] || e.tid) + '] ' + JSON.stringify(e.args || {}).slice(0, 200)));
  await ctx.close(); await b.close(); })().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

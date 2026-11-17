// What blocks the main thread when the Founders card comes into view? Long-animation-frame attribution.
// usage: node probe_freeze.js <url> [desktop|phone] [cpu]
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const kind = process.argv[3] || 'desktop', cpu = +(process.argv[4] || 0) || undefined;
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const { ctx, page } = await L.open(b, kind, null, { cpu }); if (process.env.BLOCK) await page.route(new RegExp(process.env.BLOCK), (r) => r.abort()); await page.goto(URL_, { waitUntil: 'load', timeout: 180000 }); await page.waitForFunction(() => window.PEP && window.PEP.status && Object.keys(window.PEP.status).length > 5, null, { timeout: 180000 });
  await L.frames(page, 60);
  await page.evaluate(() => {
    window.__loaf = []; window.__gaps = []; let last = performance.now(); window.__run = true;
    (function f(t) { const g = t - last; last = t; if (g > 250) window.__gaps.push([Math.round(g), Math.round(scrollY), Math.round(performance.now())]); if (window.__run) requestAnimationFrame(f); })(last);
    try { new PerformanceObserver((l) => { for (const e of l.getEntries()) { if (e.duration > 250) window.__loaf.push({ d: Math.round(e.duration), at: Math.round(e.startTime), block: Math.round(e.blockingDuration || 0), render: Math.round(e.renderStart ? e.startTime + e.duration - e.renderStart : 0), scripts: (e.scripts || []).map((s) => Math.round(s.duration) + 'ms ' + (s.sourceURL || '').split('/').pop() + ':' + (s.sourceFunctionName || '') + ' ' + s.invoker).slice(0, 4) }); } }).observe({ type: 'long-animation-frame', buffered: false }); } catch (e) { window.__loaf.push({ err: String(e) }); }
  });
  const pre = await page.evaluate(() => ({ eng: !!document.querySelector('script[src*="engrave.js"]') }));
  const t0 = await page.evaluate(() => Math.round(performance.now()));
  await page.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'start' }));
  // wait until the laser reports done (data-state) or 120 s
  await page.waitForFunction(() => { const r = document.getElementById('engraver'); return r && r.getAttribute('data-state') === 'done'; }, null, { timeout: 120000 }).catch(() => console.log('note   engraver never reached data-state=done'));
  await L.frames(page, 60);
  const r = await page.evaluate(() => { window.__run = false; return { loaf: window.__loaf, gaps: window.__gaps, eng: !!document.querySelector('script[src*="engrave.js"]'), state: (document.getElementById('engraver') || {}).getAttribute && document.getElementById('engraver').getAttribute('data-state') }; });
  console.log(`note   ${kind}${cpu ? ' cpu' + cpu : ''}: engrave.js before=${pre.eng} after=${r.eng}, state=${r.state}, scrolled at t=${t0}`);
  console.log('note   gaps>250ms: ' + r.gaps.map((g) => g[0] + 'ms@t' + g[2]).join(' '));
  for (const l of r.loaf.slice(0, 15)) console.log('note   LoAF ' + JSON.stringify(l));
  const worst = r.gaps.reduce((m, g) => Math.max(m, g[0]), 0);
  console.log((worst > 1000 ? 'BROKEN' : 'safe  ') + ` founders card in view: longest frame ${worst} ms`);
  await ctx.close(); await b.close();
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

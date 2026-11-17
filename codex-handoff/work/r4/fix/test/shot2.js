const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const [tag, w, h] of [['desktop', 1440, 1500], ['phone', 390, 1700]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
    const p = await ctx.newPage(); await p.goto('http://127.0.0.1:8964/new/', { waitUntil: 'load' }); await p.waitForTimeout(1500);
    const centre = async () => { await p.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1500); };
    const snap = async (name) => { await centre(); const r = await p.locator('#founder-card .pep-hooks-frame').boundingBox(); await p.screenshot({ path: `/home/user/work/r4/fix/test/${name}.png`, clip: { x: Math.max(0, r.x - 24), y: Math.max(0, r.y - 24), width: Math.min(w, r.width + 48), height: Math.min(h - Math.max(0, r.y - 24), r.height + 60) }, timeout: 120000 }); };
    await centre(); await p.waitForFunction(() => document.getElementById('engraver').getAttribute('data-state') === 'done', null, { timeout: 240000, polling: 500 });
    await snap(`s-${tag}-1`);
    await p.fill('#pep-hooks-card-first', 'Alex Sample'); await p.evaluate(() => document.querySelector('#founder-card [data-make]').click());
    await p.waitForFunction(() => document.getElementById('engraved').textContent === 'ALEX SAMPLE', null, { timeout: 240000, polling: 500 }); await p.waitForTimeout(3000);
    await snap(`s-${tag}-2`);
    await ctx.close(); }
  await b.close(); })().catch((e) => { console.log('ERR', e.message); process.exit(1); });

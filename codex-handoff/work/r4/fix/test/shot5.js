const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const [tag, w, h] of [['d', 1440, 900], ['p', 390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
    const p = await ctx.newPage(); const errs = [], bad = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    await p.goto('http://127.0.0.1:8965/new/', { waitUntil: 'load' }); await p.waitForTimeout(5000);
    await p.screenshot({ path: `r5-${tag}-hero.png`, timeout: 120000 });
    if (tag === 'd') { await p.hover('.pep-hx-keys .pep-k25'); await p.waitForTimeout(1500); await p.screenshot({ path: 'r5-d-hero-hover.png', clip: { x: 0, y: 0, width: 1440, height: 900 }, timeout: 120000 });
      await p.mouse.move(5, 5); await p.click('.pep-header-key--hero'); await p.waitForTimeout(1500); await p.screenshot({ path: 'r5-d-menu-open.png', timeout: 120000 }); await p.keyboard.press('Escape'); await p.waitForTimeout(500); }
    await p.setViewportSize({ width: w, height: tag === 'd' ? 1500 : 2300 });
    await p.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'center' })); 
    await p.waitForFunction(() => document.getElementById('engraver').getAttribute('data-state') === 'done', null, { timeout: 240000, polling: 500 }).catch(() => {});
    await p.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'center' })); await p.waitForTimeout(1500);
    const r = await p.locator('#founder-card .pep-hooks-frame').boundingBox();
    await p.screenshot({ path: `r5-${tag}-founders.png`, clip: { x: Math.max(0, r.x - 20), y: Math.max(0, r.y - 20), width: Math.min(w, r.width + 40), height: r.height + 70 }, timeout: 120000 });
    await p.evaluate(() => document.querySelector('#founder-card [data-refer-open]').click()); await p.waitForTimeout(1200); await p.screenshot({ path: `r5-${tag}-refer.png`, clip: { x: 0, y: Math.max(0, r.y - 20), width: w, height: Math.min(1100, r.height + 70) }, timeout: 120000 }).catch((e) => console.log('refer shot', e.message.split('\n')[0])); await p.evaluate(() => document.getElementById('pep-fr-refer').close());
    await p.setViewportSize({ width: w, height: h }); await p.waitForTimeout(800); const info = await p.evaluate(() => ({ csp: window.__csp, over: document.documentElement.scrollWidth - innerWidth }));
    console.log(tag, 'errors', errs.length, errs[0] || '', 'failed', bad.length, bad[0] || '', 'csp', info.csp.length, info.csp[0] || '', 'overflow', info.over);
    await ctx.close(); }
  await b.close(); })().catch((e) => { console.log('ERR', e.message); process.exit(1); });

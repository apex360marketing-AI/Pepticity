// Screenshot + audit for sites/dashboard (PEPTICITY STUDIO), both sides, every tab, 1440x900 and 390x844.
// node brand/tools/shoot-dash.js [prefix]    (three.js CDN requests are served from a local copy, THREE_DIR)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const THREE_DIR = process.env.THREE_DIR || '/tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/npm/node_modules/three';
const PFX = process.argv[2] || 'v4';
const OUT = path.join(ROOT, 'sites/dashboard/shots'); fs.mkdirSync(OUT, { recursive: true });
const ONLY = process.env.ONLY || '';   // e.g. "desk" or "phone"

(async () => {
  const browser = await chromium.launch({ 
    args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { errors: [], overflow: [], small: [], tabs: {} };
  for (const vp of [{ w: 1440, h: 900, n: 'desk', dpr: 1 }, { w: 390, h: 844, n: 'phone', dpr: 2 }]) {
    if (ONLY && ONLY !== vp.n) continue;
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dpr, hasTouch: vp.n === 'phone' });
    const page = await ctx.newPage();
    page.on('pageerror', e => report.errors.push(vp.n + ' pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') report.errors.push(vp.n + ' console.' + m.type() + ': ' + m.text()); });
    await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => {
      const rel = r.request().url().split('three@0.160.0/')[1];
      r.fulfill({ path: path.join(THREE_DIR, rel), contentType: 'application/javascript' });
    });
    await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
    await page.route('https://fonts.gstatic.com/**', r => r.fulfill({ status: 204, body: '' }));
    await page.goto('file://' + path.join(ROOT, 'sites/dashboard/index.html') + '#owner');
    await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} });
    await page.reload();
    await page.waitForFunction(() => window.__type3d && window.__type3d.frames > 3, null, { timeout: 120000 }).catch(() => report.errors.push(vp.n + ' type3d never started'));
    await page.waitForTimeout(1500);
    for (const side of ['owner', 'client']) {
      await page.evaluate(v => window.__pep.setView(v), side); await page.waitForTimeout(400);
      const tabs = await page.$$eval(`.tabs[data-group="${side}"] .tab`, ts => ts.map(t => t.dataset.tab));
      report.tabs[side] = tabs;
      for (const id of tabs) {
        await page.click(`.tabs[data-group="${side}"] .tab[data-tab="${id}"]`);
        await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(1700);
        const ov = await page.evaluate(() => document.documentElement.scrollWidth - innerWidth);
        if (ov > 0) report.overflow.push(`${vp.n}/${side}/${id}: +${ov}px`);
        const wide = await page.evaluate(() => { const out = []; document.querySelectorAll('.view.on *').forEach(el => { const r = el.getBoundingClientRect();
          if (r.width && r.right > innerWidth + 1 && !el.closest('.shelf,.tabs,.threads,.basket,.msgs')) out.push((el.className && el.className.baseVal === undefined ? el.className : el.tagName) + ' ' + Math.round(r.right)); }); return out.slice(0, 6); });
        if (wide.length) report.overflow.push(`${vp.n}/${side}/${id} wide: ${wide.join(' | ')}`);
        if (vp.n === 'phone') {
          const sm = await page.evaluate(() => { const out = []; document.querySelectorAll('.view.on button, .view.on label.sw, .view.on input, .view.on select, .top button').forEach(el => { const r = el.getBoundingClientRect();
            if (r.width && r.height && (r.height < 44 && r.width < 44 || r.height < 24)) out.push((el.textContent || el.getAttribute('aria-label') || el.className).trim().slice(0, 24) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height)); }); return out; });
          if (sm.length) report.small.push(`${side}/${id}: ${[...new Set(sm)].slice(0, 12).join(' | ')}`);
        }
        await page.screenshot({ path: path.join(OUT, `${PFX}-${vp.n}-${side}-${id}.png`), fullPage: vp.n === 'phone' ? false : false });
      }
    }
    await ctx.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, `${PFX}-report.json`), JSON.stringify(report, null, 1));
  console.log(JSON.stringify(report, null, 1));
})();

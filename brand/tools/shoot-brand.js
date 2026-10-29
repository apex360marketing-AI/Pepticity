// Screenshot + error check for sites/brand-font and sites/brand-logo.
// node brand/tools/shoot-brand.js [font|logo]   (three.js CDN requests are served from a local copy)
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const THREE_DIR = process.env.THREE_DIR || '/tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/npm/node_modules/three';
const which = process.argv[2] || 'font';
const PAGE = { font: 'sites/brand-font', logo: 'sites/brand-logo' }[which];
const SECTIONS = { font: ['#match', '#words', '[data-slot="studio"]', '#sheet', '#sisters'],
  logo: ['section:nth-of-type(1)', 'section:nth-of-type(2)', '[data-slot="emb-dark"]', '.mini'] }[which];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const outDir = path.join(ROOT, PAGE, 'shots'); fs.mkdirSync(outDir, { recursive: true });
  const report = [];
  for (const vp of [{ w: 1440, h: 900, n: 'desktop', dpr: 1 }, { w: 390, h: 844, n: 'phone', dpr: 2 }]) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: vp.dpr, hasTouch: vp.n === 'phone' });
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => {
      const rel = r.request().url().split('three@0.160.0/')[1];
      r.fulfill({ path: path.join(THREE_DIR, rel), contentType: 'application/javascript' });
    });
    await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
    await page.route('https://fonts.gstatic.com/**', r => r.fulfill({ status: 204, body: '' }));
    await page.goto('file://' + path.join(ROOT, PAGE, 'index.html'));
    await page.waitForFunction(() => window.__type3d && window.__type3d.frames > 2, null, { timeout: 60000 }).catch(() => errors.push('3D never started'));
    const waitFrames = async n => { const f0 = await page.evaluate(() => window.__type3d ? __type3d.frames : 0); const t0 = Date.now();
      while ((await page.evaluate(() => window.__type3d ? __type3d.frames : 0)) < f0 + n && Date.now() - t0 < 30000) await page.waitForTimeout(200); };
    await waitFrames(4);
    await page.screenshot({ path: path.join(outDir, `${vp.n}-00-top.png`) });
    let i = 1;
    for (const sel of SECTIONS) {
      await page.evaluate(s => { const el = document.querySelector(s); const r = el.getBoundingClientRect();
        scrollTo(0, scrollY + r.top + r.height / 2 - innerHeight / 2); }, sel);
      await waitFrames(14);
      await page.screenshot({ path: path.join(outDir, `${vp.n}-0${i}.png`) });
      i++;
    }
    if (which === 'font') {
      const el = await page.$('#match .pair');
      await page.evaluate(() => { const r = document.querySelector('#match .pair').getBoundingClientRect(); scrollTo(0, scrollY + r.top - 40); });
      await waitFrames(10);
      await el.screenshot({ path: path.join(outDir, `${vp.n}-match-pair.png`) });
    }
    const sw = await page.evaluate(() => document.documentElement.scrollWidth);
    report.push({ vp: vp.n, errors, scrollWidth: sw, fb: await page.evaluate(() => window.__fb || null) });
    await ctx.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 1));
})();

// node tools/shots-live.js <outdir> <w> <h> <clicks> slug...   → one viewport shot per slug with #live scrolled to the top
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const [out, w, h, clicks, ...slugs] = process.argv.slice(2); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  for (const slug of slugs) {
    const mobile = +w < 600; const c = await b.newContext({ viewport: { width: +w, height: +h }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 }); const p = await c.newPage();
    p.on('pageerror', e => console.log(slug, 'PAGEERR', e.message)); p.on('console', m => m.type() === 'error' && console.log(slug, 'ERR', m.text()));
    await p.goto('http://127.0.0.1:8765/' + slug + '/'); await p.waitForTimeout(2200);
    for (let i = 0; i < +clicks; i++) { if (await p.locator('[data-opt]:visible').count() === 0) { const s = p.locator('[data-start]:visible').first(); if (await s.count()) { await s.evaluate(e => e.click()); await p.waitForTimeout(900); } } await p.locator('[data-opt]:visible').first().evaluate(e => e.click()).catch(() => {}); await p.waitForTimeout(1500); }
    await p.evaluate(() => { const l = document.getElementById('live'); window.scrollTo(0, l.getBoundingClientRect().top + scrollY - 70); }); await p.mouse.move(+w * 0.55, +h * 0.5); await p.waitForTimeout(1200);
    await p.screenshot({ path: `${out}/${slug}-${w}.png` }); await c.close();
  }
  await b.close();
})();

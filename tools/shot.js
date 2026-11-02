// quick full-page shot: node tools/shot.js <slug> [w] [h] [out] [clickN options before shot]
const { chromium } = require('playwright');
(async () => {
  const [slug, w = 1440, h = 900, out = '/tmp/claude-0/shot.png', clicks = 0] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  const c = await b.newContext({ viewport: { width: +w, height: +h } }); const p = await c.newPage();
  p.on('console', m => m.type() === 'error' && console.log('ERR', m.text())); p.on('pageerror', e => console.log('PAGEERR', e.message));
  await p.goto('http://127.0.0.1:8765/' + slug + '/'); await p.waitForTimeout(2000);
  for (let i = 0; i < +clicks; i++) { await p.locator('[data-opt]:visible').first().click({ force: true }); await p.waitForTimeout(1200); }
  await p.locator('#live').scrollIntoViewIfNeeded(); await p.mouse.move(+w * 0.75, +h * 0.45); await p.waitForTimeout(1200);
  await p.screenshot({ path: out }); await b.close();
})();

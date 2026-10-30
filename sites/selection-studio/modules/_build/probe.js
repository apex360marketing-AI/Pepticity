// Quick look at one module while building: node probe.js <module path> [w] [h] [scroll positions 0..1, comma] [query] [wait ms]
// Screens to modules/_shots/_probe/, prints console errors. (The full contract check is verify.js.)
const { chromium } = require('playwright');
const fs = require('fs');
const [, , mod, W = '1440', H = '900', pos = '0', query = '', waitMs = '2500'] = process.argv;
const OUT = __dirname + '/../_shots/_probe/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--proxy-bypass-list=127.0.0.1;localhost'] });
  const mob = +W < 600;
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true, deviceScaleFactor: 1 });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type().slice(0, 2).toUpperCase() + ' ' + m.text().slice(0, 300)); });
  p.on('response', r => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url().slice(0, 160)); });
  p.on('requestfailed', r => errs.push('RF ' + r.url().slice(0, 160) + ' ' + (r.failure() || {}).errorText));
  const url = 'http://127.0.0.1:8811/modules/' + mod + (query ? '?' + query : '');
  await p.goto(url, { waitUntil: 'load', timeout: 90000 });
  await p.waitForTimeout(+waitMs);
  const name = mod.replace(/[\/.]/g, '_') + '-' + W;
  for (const v of pos.split(',')) {
    const y = +v;
    await p.evaluate(y => { const s = document.querySelector('.fx-scroller'); if (s) s.scrollTop = y * (s.scrollHeight - s.clientHeight); }, y);
    await p.waitForTimeout(1800);
    await p.screenshot({ path: OUT + name + '-' + v + '.png' });
  }
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify({ url, scrollWidth: sw, errs }, null, 1));
  await b.close();
})();

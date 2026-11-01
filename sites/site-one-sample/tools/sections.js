// spot check after the doors: node tools/sections.js <black|white> <d|m>
const { chromium } = require('playwright');
const V = process.argv[2] || 'black', M = process.argv[3] || 'd';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy, args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--proxy-bypass-list=127.0.0.1;localhost'] });
  const mob = M === 'm'; const ctx = await b.newContext({ viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('http://127.0.0.1:8799/index.html?nointro&nobot&v=' + V); await p.waitForTimeout(5000);
  await p.evaluate(() => window.__pc.guest()); await p.waitForTimeout(9000);
  const tag = (mob ? 'mob' : 'desk') + '-' + V;
  for (const [sel, off, n] of [['#interests', 0, 'S1-interests'], ['#store', 0, 'S2-store'], ['#tiers', 0, 'S3-tiers'], ['.twoway', 0, 'S4-twoway'], ['#quiz', 0, 'S5-finder'], ['#network', 0.5, 'S6-network'], ['#foot', 0.9, 'S7-footer']]) {
    await p.evaluate(([s, o]) => { const e = document.querySelector(s); const y = e.getBoundingClientRect().top + scrollY + innerHeight * o; const l = window.__pc.lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, [sel, off]);
    await p.waitForTimeout(2600);
    await p.screenshot({ path: __dirname + '/../shots/' + tag + '-' + n + '.png', timeout: 120000 });
  }
  console.log(tag, 'sw', await p.evaluate(() => document.documentElement.scrollWidth), 'errors', errs.join(' | ') || 'none');
  await b.close();
})();

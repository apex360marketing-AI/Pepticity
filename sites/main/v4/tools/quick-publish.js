// quick smoke: node tools/quick.js <w|b> <d|m> [scrollY...]
const { chromium } = require('playwright');
const V = process.argv[2] || 'w', M = process.argv[3] || 'd', ys = process.argv.slice(4).map(Number);
const OUT = '/tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/q/';
require('fs').mkdirSync(OUT, { recursive: true });
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy, args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--proxy-bypass-list=127.0.0.1;localhost'] });
  const mob = M === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errs.push(m.type() + ' ' + m.text().slice(0, 300)); });
  p.on('requestfailed', r => errs.push('RF ' + r.url().slice(0, 140) + ' ' + (r.failure() && r.failure().errorText)));
  await p.goto('http://127.0.0.1:8811/index.html?nointro&nobot&v=' + (V === 'b' ? 'black' : 'white'));
  await p.waitForTimeout(6000);
  console.log(await p.evaluate(() => ({ gl: window.__gl, cls: document.documentElement.className, sw: document.documentElement.scrollWidth, h: document.documentElement.scrollHeight, prods: window.__pc && window.__pc.products.length })));
  await p.screenshot({ path: OUT + V + M + '-0.png' });
  for (const y of ys) {
    await p.evaluate(y => { const l = window.__pc.lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y);
    await p.waitForTimeout(2500);
    await p.screenshot({ path: OUT + V + M + '-' + y + '.png' });
  }
  console.log(errs.join('\n'));
  await b.close();
})();

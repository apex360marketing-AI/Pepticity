// front page check: loader then hero, at 1440 and 390, black and white. node tools/front.js
const { chromium } = require('playwright');
const OUT = __dirname + '/../shots/';
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--proxy-bypass-list=127.0.0.1;localhost'] });
  for (const [V, M] of [['black', 'd'], ['black', 'm'], ['white', 'd'], ['white', 'm']]) {
    const mob = M === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
    const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
    const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CE ' + m.text().slice(0, 160)); });
    const tag = (mob ? 'mob' : 'desk') + '-' + V;
    await p.goto('http://127.0.0.1:8799/index.html?v=' + V);
    await p.waitForFunction(() => window.__type3d && window.__type3d.frames > 3, null, { timeout: 30000 }).catch(() => {}); await p.waitForTimeout(1500); await p.screenshot({ path: OUT + tag + '-00-loader.png', timeout: 120000 });
    await p.waitForFunction(() => !document.documentElement.classList.contains('intro-on'), null, { timeout: 30000 });
    await p.waitForTimeout(2600); await p.screenshot({ path: OUT + tag + '-01-hero.png', timeout: 120000 });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(tag, 'scrollWidth', sw, 'errors:', errs.join(' | ') || 'none');
    await ctx.close();
  }
  await b.close();
})();

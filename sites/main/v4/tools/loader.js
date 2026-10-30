const { chromium } = require('playwright');
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--proxy-bypass-list=127.0.0.1;localhost'] });
  for (const [V, M] of [['black', 'd'], ['black', 'm'], ['white', 'd']]) {
    const mob = M === 'm'; const ctx = await b.newContext({ viewport: mob ? { width: 390, height: 844 } : { width: 1440, height: 900 }, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
    const p = await ctx.newPage();
    await p.goto('http://127.0.0.1:8799/index.html?holdintro&nobot&v=' + V);
    await p.waitForFunction(() => window.__type3d && window.__type3d.frames > 3, null, { timeout: 60000 }).catch(() => {});
    await p.waitForTimeout(3500);
    await p.screenshot({ path: __dirname + '/../shots/' + (mob ? 'mob' : 'desk') + '-' + V + '-00-loader.png', timeout: 120000 });
    await ctx.close();
  }
  await b.close();
})();

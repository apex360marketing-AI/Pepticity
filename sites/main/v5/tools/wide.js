const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const p = await ctx.newPage();
  await p.goto('http://127.0.0.1:8799/index.html?nointro&nobot&v=white'); await p.waitForTimeout(5000);
  await p.evaluate(() => { window.__pc.guest(); }); await p.waitForTimeout(9000);
  await p.evaluate(() => document.getElementById('interests').scrollIntoView()); await p.waitForTimeout(2500);
  console.log(await p.evaluate(() => { const out = []; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.right > 392 && r.width > 0) out.push(e.tagName + '.' + e.className + ' ' + Math.round(r.left) + '-' + Math.round(r.right)); }); return [document.documentElement.scrollWidth, out.slice(0, 15)]; }));
  await b.close();
})();

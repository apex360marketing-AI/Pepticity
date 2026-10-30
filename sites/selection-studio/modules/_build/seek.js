// Screens an entrance module at fixed moments of its GSAP timeline: node seek.js <module> <w> <h> <t1,t2,...>
const { chromium } = require('playwright');
const fs = require('fs');
const [, , mod, W = '1440', H = '900', times = '0'] = process.argv;
const OUT = __dirname + '/../_shots/_probe/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--proxy-bypass-list=127.0.0.1;localhost'] });
  const mob = +W < 600;
  const ctx = await b.newContext({ viewport: { width: +W, height: +H }, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message)); p.on('console', m => { if (m.type() === 'error') errs.push('CE ' + m.text()); });
  await p.goto('http://127.0.0.1:8811/modules/' + mod, { waitUntil: 'load' });
  await p.waitForTimeout(1500);
  for (const t of times.split(',')) {
    await p.evaluate(t => { const e = window.__ent; if (e && e.tl) { e.tl.pause(); e.tl.seek(+t); } if (e && e.seek) e.seek(+t); }, t);
    await p.waitForTimeout(700);
    await p.screenshot({ path: OUT + mod.replace(/[\/.]/g, '_') + '-' + W + '-t' + t + '.png' });
  }
  console.log(JSON.stringify({ errs }));
  await b.close();
})();

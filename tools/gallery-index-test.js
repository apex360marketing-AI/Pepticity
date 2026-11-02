const { chromium } = require('playwright');
(async () => {
  const SH = process.argv[2] || '/tmp/claude-0/idx'; require('fs').mkdirSync(SH, { recursive: true });
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  for (const v of [{ n: 'd', w: 1440, h: 900 }, { n: 'm', w: 390, h: 844, mobile: true }]) {
    const c = await b.newContext({ viewport: { width: v.w, height: v.h }, isMobile: v.mobile, hasTouch: v.mobile, deviceScaleFactor: v.mobile ? 2 : 1 }); const p = await c.newPage(); const errs = [];
    p.on('console', m => m.type() === 'error' && errs.push(m.text())); p.on('pageerror', e => errs.push(e.message));
    await p.goto('http://127.0.0.1:8765/'); await p.waitForTimeout(2500);
    const info = await p.evaluate(() => ({ cards: document.querySelectorAll('a.card').length, over: document.documentElement.scrollWidth - document.documentElement.clientWidth, links: [...document.querySelectorAll('a.card')].map(a => a.getAttribute('href')) }));
    console.log(v.n, JSON.stringify({ cards: info.cards, over: info.over, errs }));
    await p.screenshot({ path: `${SH}/gallery-${v.n}-top.png` }); await p.screenshot({ path: `${SH}/gallery-${v.n}-full.png`, fullPage: true });
    if (v.n === 'd') { await p.evaluate(() => scrollTo(0, 900)); await p.waitForTimeout(800); await p.screenshot({ path: `${SH}/gallery-d-mid.png` }); }
    await c.close();
  }
  await b.close();
})();

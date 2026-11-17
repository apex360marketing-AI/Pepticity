const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] }); const U = 'https://apex360marketing-ai.github.io/Pepticity/review/';
  for (const [tag, w, h] of [['desktop', 1440, 900], ['phone', 390, 844]]) {
    const ctx = await b.newContext({ viewport: { width: w, height: h } });
    await ctx.addInitScript(() => { window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
    const p = await ctx.newPage(); const errs = [], bad = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    await p.goto(U, { waitUntil: 'load', timeout: 120000 }); await p.waitForTimeout(4000);
    const r = await p.evaluate(() => ({ title: !!document.querySelector('#founder-card .pep-fr-title img'), circle: (document.body.innerHTML.match(/FOUNDER CIRCLE/g) || []).length, csp: window.__csp, over: document.documentElement.scrollWidth - innerWidth, bar: Math.round(document.querySelector('[data-module="header"]').getBoundingClientRect().width) }));
    console.log(tag, 'page errors', errs.length, 'failed requests', bad.length, bad[0] || '', 'policy violations', r.csp.length, r.csp[0] || '', 'founders title', r.title, 'FOUNDER CIRCLE', r.circle, 'sideways overflow', r.over, 'menu width', r.bar);
    await ctx.close(); }
  await b.close(); })().catch((e) => { console.log('ERR', e.message); process.exit(1); });

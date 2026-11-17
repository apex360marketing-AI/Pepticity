const { chromium } = require('playwright');
(async () => { const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } }); await p.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(2500); await p.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'center' })); await p.waitForTimeout(2500);
  console.log(JSON.stringify(await p.evaluate(() => { const W = innerWidth; const out = []; document.querySelectorAll('body *').forEach((e) => { const r = e.getBoundingClientRect(); if (r.width > 0 && r.right > W + 2) out.push([Math.round(r.right), Math.round(r.width), (e.className && e.className.baseVal === undefined ? String(e.className) : e.tagName).slice(0, 50), getComputedStyle(e).position]); });
    out.sort((a, b) => b[0] - a[0]); return { sw: document.documentElement.scrollWidth, n: out.length, top: out.slice(0, 10) }; }), null, 0));
  await b.close(); })();

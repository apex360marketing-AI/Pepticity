const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  const p = await ctx.newPage(); await p.goto('http://127.0.0.1:8965/new/', { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const r = await p.evaluate(() => ['.pep-hx-keys .pep-k25', '#founder-card .pep-hooks-btn', '#founder-card [data-refer-open]'].map((s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(), cs = getComputedStyle(e); return { s, t: e.textContent.trim().slice(0, 30), w: Math.round(r.width), h: Math.round(r.height), disp: cs.display, vis: cs.visibility, hiddenAnc: !!e.closest('[hidden]'), cls: e.className }; })));
  console.log(JSON.stringify(r, null, 1));
  const keys = await p.evaluate(() => [...document.querySelectorAll('[data-module="header"] .pep-header-key')].map((k) => ({ t: k.textContent.trim(), html: k.innerHTML.slice(0, 160), w: Math.round(k.getBoundingClientRect().width) })));
  console.log(JSON.stringify(keys, null, 1));
  await b.close();
})();

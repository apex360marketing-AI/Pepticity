const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process'); const cache = {}; function get(u) { if (!cache[u]) cache[u] = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/141.0', u], { maxBuffer: 1e8 }); return cache[u]; }
const OUT = '/home/user/pepticity/sites/v6-garnet/shots63/q-'; const URL = 'http://127.0.0.1:8765/home/user/pepticity/sites/v6-garnet/dist/preview.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  for (const [m, vp] of [['d', { width: 1440, height: 900 }], ['m', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, isMobile: m === 'm', hasTouch: m === 'm' }); const p = await ctx.newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message));
    await p.route('**/*', r => { const u = r.request().url(); if (/^(http:\/\/127|data:|blob:)/.test(u)) return r.continue(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return r.fulfill({ body: get(u), contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' }); return r.abort(); });
    for (const h of process.argv.slice(2)) {
      const [hash, sel, act] = h.split('|');
      await p.goto(URL + '#' + hash); await p.waitForTimeout(500); await p.keyboard.press('Escape'); await p.waitForTimeout(1400);
      if (sel) { await p.evaluate(s => document.querySelector(s).scrollIntoView(), sel); await p.waitForTimeout(1200); }
      if (act === 'menu') { await p.click('.menu-btn'); await p.waitForTimeout(1400); }
      if (act === 'hover' && m === 'd') { const r = await p.locator(sel + ' a, ' + sel + ' button').nth(1).boundingBox(); await p.mouse.move(r.x + r.width * .4, r.y + r.height * .5, { steps: 6 }); await p.waitForTimeout(900); }
      await p.screenshot({ path: OUT + m + '-' + (hash + (sel || '') + (act || '')).replace(/[^a-z0-9]/gi, '') + '.png' });
    }
    console.log(m, 'errs', errs); await ctx.close();
  }
  await b.close();
})();

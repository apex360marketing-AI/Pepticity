// Browser test for the bot gallery. Usage: node tools/bot-gallery-test.js [slugPrefix ...]   (needs: python3 -m http.server 8765 in sites/bot-gallery)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const BASE = process.env.BASE || 'http://127.0.0.1:8765/';
const OUT = process.env.OUT || '/tmp/claude-0/-home-user-Pepticity/4cebda2b-96f0-5b2d-adbf-4dd38c67ea69/scratchpad/shots';
fs.mkdirSync(OUT, { recursive: true });
const reg = fs.readFileSync(path.join(__dirname, '..', 'sites/bot-gallery/shared/registry.js'), 'utf8');
let slugs = [...reg.matchAll(/slug: '([^']+)'/g)].map(m => m[1]);
const want = process.argv.slice(2); if (want.length) slugs = slugs.filter(s => want.some(w => s.startsWith(w)));
const REDUCED = !!process.env.REDUCED;
const VIEWS = REDUCED ? [{ name: 'dr', width: 1440, height: 900 }] : [{ name: 'd', width: 1440, height: 900 }, { name: 'm', width: 390, height: 844, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }];
(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--no-sandbox'] });
  let fail = 0;
  for (const slug of slugs) for (const v of VIEWS) {
    const ctx = await browser.newContext({ reducedMotion: REDUCED ? 'reduce' : 'no-preference', viewport: { width: v.width, height: v.height }, isMobile: v.isMobile, hasTouch: v.hasTouch, deviceScaleFactor: v.deviceScaleFactor || 1 });
    const page = await ctx.newPage(); const errs = [];
    page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); }); page.on('pageerror', e => errs.push('PAGEERR ' + e.message));
    const tag = slug + '-' + v.name; const notes = [];
    try {
      await page.goto(BASE + slug + '/' + (process.env.QS || ''), { waitUntil: 'load' }); await page.waitForTimeout(1800);
      await page.screenshot({ path: `${OUT}/${tag}-0-start.png` });
      await page.screenshot({ path: `${OUT}/${tag}-0-demo.png`, clip: await (async () => { const b = await page.locator('#live').boundingBox(); return b ? { x: 0, y: Math.max(0, b.y), width: v.width, height: Math.min(v.height, 900) } : undefined; })() }).catch(() => {});
      let steps = 0, shot1 = false;
      if (await page.locator('[data-opt]:visible').count() === 0) { const st = page.locator('[data-start]:visible').first(); if (await st.count()) { await st.evaluate(e => e.click()); await page.waitForTimeout(900); } }
      for (; steps < 12; steps++) {
        if (await page.locator('[data-capture] input[type=email]').first().isVisible().catch(() => false)) break;
        const opts = page.locator('[data-opt]:visible'); const n = await opts.count();
        if (!n) { let ok = false; for (let k = 0; k < 14 && !ok; k++) { await page.waitForTimeout(400); ok = (await page.locator('[data-capture] input[type=email]').first().isVisible().catch(() => false)) || (await page.locator('[data-opt]:visible').count()) > 0; } if (!ok) { notes.push('no visible option at step ' + steps); break; } continue; }
        await opts.nth(Math.floor(Math.random() * 0) ).scrollIntoViewIfNeeded().catch(() => {});
        await opts.first().click({ timeout: 5000 }).catch(async e => { notes.push('click fail ' + e.message.split('\n')[0]); await opts.first().click({ force: true }).catch(() => {}); });
        await page.waitForTimeout(GUI_WAIT(slug)); 
        if (steps === 1 && !shot1) { shot1 = true; await page.screenshot({ path: `${OUT}/${tag}-1-mid.png` }); }
      }
      const email = page.locator('[data-capture] input[type=email]').first();
      if (!(await email.isVisible().catch(() => false))) { notes.push('NO CAPTURE FORM'); fail++; }
      else {
        await email.scrollIntoViewIfNeeded(); await page.waitForTimeout(400);
        await page.screenshot({ path: `${OUT}/${tag}-2-result.png` });
        // bad email first, then valid; consent boxes must start unticked
        const ticked = await page.locator('[data-capture] input[type=checkbox]:checked').count(); if (ticked) { notes.push('CONSENT PRE-TICKED'); fail++; }
        await email.fill('nope'); await page.locator('[data-capture] button[type=submit]').click(); await page.waitForTimeout(200);
        if (!(await page.locator('[data-capture] .err').first().innerText()).length) { notes.push('no validation error'); fail++; }
        await email.fill('test@example.com'); await page.locator('[data-capture] button[type=submit]').click();
        await page.locator('[data-success]').first().waitFor({ timeout: 4000 }).catch(() => { notes.push('NO SUCCESS STATE'); fail++; });
        const leads = await page.evaluate(() => (window.__PEP_LEADS || []).length); if (leads !== 1) { notes.push('leads=' + leads); fail++; }
        const hook = await page.evaluate(() => (window.__PEP_LEADS || [{}])[0].hook); if (!hook || hook.indexOf('gal-' + slug) !== 0) { notes.push('hook=' + hook); fail++; }
        await page.waitForTimeout(500); await page.screenshot({ path: `${OUT}/${tag}-3-success.png` });
      }
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth); if (over > 1) { notes.push('SIDEWAYS SCROLL ' + over + 'px'); fail++; }
    } catch (e) { notes.push('EXC ' + e.message.split('\n')[0]); fail++; }
    if (errs.length) { notes.push('CONSOLE: ' + errs.slice(0, 3).join(' | ')); fail++; }
    console.log((notes.length ? 'FAIL ' : 'ok   ') + tag + (notes.length ? '  ' + notes.join('; ') : ''));
    await ctx.close();
  }
  await browser.close(); console.log(fail ? 'TOTAL FAIL ' + fail : 'ALL PASS'); process.exit(fail ? 1 : 0);
})();
function GUI_WAIT(slug) { return /^(0[1-6]|1[3-5])/.test(slug) ? 1300 : 900; }

#!/usr/bin/env node
/* Owner, Nov 16: menu = slim glass bar from the card's render, chrome lettering, drop-down 01; button 25 everywhere, comes out on hover.
   usage: node menu.test.js <url> */
'use strict';
const { chromium } = require('playwright');
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
let fails = 0; const check = (ok, n, d) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + n + ' · ' + d); };
(async () => {
  const b = await chromium.launch(LAUNCH);
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); await p.goto(process.argv[2], { waitUntil: 'load' }); await p.waitForTimeout(2500);
  const bar = await p.evaluate(() => { const h = document.querySelector('[data-module="header"]'), r = h.getBoundingClientRect(), bg = getComputedStyle(h, '::before').backgroundImage, fr = getComputedStyle(h, '::after').borderImageSource;
    const brand = h.querySelector('.pep-header-brand'), keys = [...h.querySelectorAll('.pep-header-keys .pep-header-key, .pep-header-nav .pep-header-key')].filter((k) => k.getBoundingClientRect().width > 0);
    return { w: Math.round(r.width), h: Math.round(r.height), oldPicture: /bar\.webp/.test(bg), frame: /glass-frame-bar\.webp/.test(fr), wordmark: /wordmark\.webp/.test(getComputedStyle(brand).backgroundImage), keys: keys.map((k) => (k.querySelector('.pep-header-label') || k).textContent.trim()), label: getComputedStyle(h.querySelector('.pep-header-label')).webkitTextFillColor }; });
  check(bar.w === 1056 && bar.h === 64 && !bar.oldPicture && bar.frame && bar.wordmark, 'menu bar', `${bar.w}x${bar.h} px (was 1320x141); old bar picture ${bar.oldPicture}; card glass frame ${bar.frame}; PEPTICITY wordmark ${bar.wordmark}`);
  check(bar.keys.join(',') === 'SHOP,PEPTIDES,RESEARCH,ABOUT,CART' && /rgba\(0, 0, 0, 0\)/.test(bar.label), 'menu keys in chrome lettering', `keys ${bar.keys.join(',')}; letter fill ${bar.label} (chrome gradient shows through)`);
  await p.click('.pep-header-key--hero'); await p.waitForTimeout(900);
  const drop = await p.evaluate(() => { const d = document.querySelector('.pep-header-drop'), r = d.getBoundingClientRect(), hb = document.querySelector('[data-module="header"]').getBoundingClientRect(); return { open: getComputedStyle(d).visibility === 'visible', under: Math.round(r.top - hb.bottom), frame: /glass-frame-bar\.webp/.test(getComputedStyle(d, '::after').borderImageSource), items: d.querySelectorAll('.pep-header-item').length }; });
  check(drop.open && drop.under >= 10 && drop.frame && drop.items >= 10, 'drop-down 01 (the sheet)', `opens ${drop.open}, ${drop.under} px under the bar, glass frame ${drop.frame}, ${drop.items} products listed`);
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  const pops = [];
  for (const sel of ['.pep-hx-keys .pep-k25', '#founder-card .pep-hooks-btn', '#founder-card .pep-fr-right [data-refer-open]']) {
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(600);
    const rest = await el.evaluate((e) => { const s = getComputedStyle(e); return { t: s.transform, bg: s.backgroundImage, hollow: getComputedStyle(e, '::after').backgroundImage.includes('rgba(207, 230, 255') }; });
    await el.hover({ force: true });
    const hov = await p.waitForFunction((s) => { const e = document.querySelector(s), t = getComputedStyle(e).transform; return /^matrix3d\(1\.0[5-9]/.test(t) && /running/.test(getComputedStyle(e, '::before').animationPlayState) && getComputedStyle(e, '::before').animationName === 'pep-k25-run' ? t.slice(0, 30) : null; }, sel, { timeout: 60000, polling: 300 }).then((h) => h.jsonValue()).catch(() => 'never came out');
    pops.push(`${sel}: at rest ${rest.t === 'none' || /matrix\(1, 0, 0, 1, 0, 0\)/.test(rest.t) ? 'flat' : rest.t}, face ${rest.bg === 'none' ? 'hollow' : 'FILLED'}; hover ${hov}`); await p.mouse.move(5, 500);
  }
  check(pops.every((x) => /face hollow; hover matrix3d/.test(x)), 'button 25: hollow at rest, comes out with the light running round it', pops.join(' | '));
  check(errs.length === 0, 'no errors', `${errs.length} page errors ${errs[0] || ''}`);
  await b.close(); console.log(fails ? `-- ${fails} FAIL --` : '-- all PASS --'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

// PEPTICITY v2 full walk: node tools/shoot.js <white|black> <d|m> <join|guest>
// Screens every section, runs the join or guest path, adds to cart, opens the cart, submits forms, checks sideways scroll and errors.
const { chromium } = require('playwright');
const fs = require('fs');
const V = process.argv[2] || 'white', M = process.argv[3] || 'd', PATH = process.argv[4] || 'join';
const OUT = __dirname + '/../shots/'; fs.mkdirSync(OUT, { recursive: true });
const tag = (M === 'd' ? 'desk' : 'mob') + '-' + V;
(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy,
    args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--proxy-bypass-list=127.0.0.1;localhost'] });
  const mob = M === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob, ignoreHTTPSErrors: true });
  const p = await ctx.newPage(); const errs = [], log = [];
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error') errs.push('CE ' + m.text().slice(0, 300)); });
  p.on('requestfailed', r => { if (!/\.mp4|\.webm/.test(r.url())) errs.push('RF ' + r.url().slice(0, 140)); });
  const shot = async n => { await p.screenshot({ path: OUT + tag + '-' + n + '.png' }); };
  const sw = async n => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > vp.width) errs.push('SIDEWAYS ' + n + ' ' + w); };
  const to = async (y, wait = 2200) => { await p.evaluate(y => { const l = window.__pc.lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y); await p.waitForTimeout(wait); };
  const top = sel => p.evaluate(s => { const e = document.querySelector(s); return e.getBoundingClientRect().top + scrollY; }, sel);
  const toEl = async (sel, off = 0, wait) => to((await top(sel)) + off, wait);
  const H = vp.height;

  await p.goto('http://127.0.0.1:8799/index.html?nointro&v=' + V);
  await p.waitForTimeout(6500);
  await shot('01-hero'); await sw('hero');
  const J = await top('#journey'), JH = await p.evaluate(() => document.getElementById('journey').offsetHeight - innerHeight);
  await to(J + JH * 0.02); await shot('02-portal');
  await to(J + JH * 0.14); await shot('03-weave-hook'); await sw('weave');
  await to(J + JH * 0.25); await shot('04-weave-shelf');
  await to(J + JH * 0.62); await shot('05-weave-finder');
  await to(J + JH * 0.97, 3000); await shot('06-gate'); await sw('gate');

  if (PATH === 'join') {
    await p.click('#choJoin'); await p.waitForTimeout(400);
    await p.fill('[data-step=email] input[type=email]', 'test@example.com');
    await p.click('[data-step=email] button[type=submit]'); await p.waitForTimeout(300);
    log.push('consent-required: ' + await p.textContent('[data-step=email] .err'));
    await p.check('[data-step=email] input[name=consent_email]');
    await p.click('[data-step=email] button[type=submit]'); await p.waitForTimeout(1500);
    await p.fill('[data-step=name] input', 'Jordan'); await p.waitForTimeout(300);
    await shot('07-card-name');
    await p.click('[data-step=name] button[type=submit]'); await p.waitForTimeout(1200);
    await shot('08-tap');
    await p.click('#mcard'); await p.waitForTimeout(1700); await shot('09-scan');
    await p.waitForTimeout(3000); await shot('10-doors');
  } else {
    await p.click('#choGuest'); await p.waitForTimeout(3800); await shot('09-guest-doors');
  }
  await p.waitForTimeout(6000);
  log.push('gated after door: ' + await p.evaluate(() => document.documentElement.classList.contains('gated')));
  const L = await top('#lab'), LH = await p.evaluate(() => document.getElementById('lab').offsetHeight - innerHeight);
  for (let i = 0; i < 5; i++) { await to(L + LH * ((i + 0.6) / 5), 2600); await shot('11-lab-st' + (i + 1)); }
  await sw('lab');
  await toEl('#promiseP', -H * 0.45); await shot('12-promise');
  await toEl('#interests', 0, 3000); await shot('13-interests'); await sw('interests');
  if (!mob) { const r = await p.locator('.int-card').nth(2).boundingBox(); await p.mouse.move(r.x + 40, r.y + 40, { steps: 6 }); await p.waitForTimeout(900); await shot('13b-interest-hover'); }
  await p.locator('.int-card').nth(2).click(); await p.waitForTimeout(900); await shot('14-interest-modal');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  const X = await top('#explode'), XH = await p.evaluate(() => document.getElementById('explode').offsetHeight - innerHeight);
  await to(X + XH * 0.1); await shot('15-explode-closed'); await to(X + XH * 0.85); await shot('16-explode-open');
  await toEl('#passport', -H * 0.3); await p.fill('#passport input', 'LOT-0001'); await p.click('#passport button'); await p.waitForTimeout(400); await shot('17-passport');
  await p.click('#filters [data-f=all]').catch(() => {});
  await toEl('#store', 0, 2500); await shot('18-store-top'); await sw('store');
  await toEl('#shelf', -60, 2500); await shot('19-store-shelf');
  const adds = p.locator('#shelf [data-add]');
  for (let i = 0; i < 3; i++) { await adds.nth(i * 2).scrollIntoViewIfNeeded(); await adds.nth(i * 2).click(); await p.waitForTimeout(300); }
  await p.locator('#shelf .prod').first().locator('[data-more]').click(); await p.waitForTimeout(300);
  await p.locator('#shelf .prod').first().scrollIntoViewIfNeeded(); await p.waitForTimeout(800); await shot('20-readmore');
  const so = p.locator('#shelf [data-rs]').first(); await so.scrollIntoViewIfNeeded(); await so.click(); await p.waitForTimeout(400);
  const rsf = p.locator('#modal form.cap-form').first(); await rsf.locator('input[type=email]').fill('q@example.com'); await rsf.locator('input[name=consent_email]').check(); await rsf.locator('button[type=submit]').click(); await p.waitForTimeout(1200);
  await shot('21-restock-queue');
  log.push('restock ok: ' + await rsf.locator('.ok').textContent()); await p.keyboard.press('Escape'); await p.waitForTimeout(300);
  await p.click('#cartBtn'); await p.waitForTimeout(900); await shot('22-cart');
  log.push('cart: ' + JSON.stringify(await p.evaluate(() => window.__pc.totals())));
  await p.click('#lines [data-q="1"]'); await p.waitForTimeout(300);
  log.push('cart after +1: ' + JSON.stringify(await p.evaluate(() => window.__pc.totals())));
  await p.click('#checkout'); await p.waitForTimeout(800); await shot('23-checkout');
  await p.click('#placeOrder'); await p.waitForTimeout(800); await shot('24-thanks');
  await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await toEl('#tiers', 0, 2000); await shot('25-tiers'); await toEl('#tiers', H * 1.2, 2000); await shot('26-tiers-stack');
  await toEl('.twoway', 0, 2200); await shot('27-twoway');
  if (!mob) { const r = await p.locator('#fog').boundingBox(); await p.mouse.move(r.x + 10, r.y + 20); await p.mouse.down(); for (let y = 20; y < r.height; y += 26) { await p.mouse.move(r.x + r.width - 10, r.y + y, { steps: 6 }); await p.mouse.move(r.x + 10, r.y + y + 13, { steps: 6 }); } await p.mouse.up(); }
  else await p.click('#fogKey');
  await p.waitForTimeout(900); await shot('28-gift-revealed');
  log.push('gift form visible: ' + await p.isVisible('.gift-form'));
  const sf = p.locator('.sent-form'); await sf.locator('input[name=name]').fill('Jordan'); await sf.locator('input[name=email]').fill('j@example.com'); await sf.locator('input[name=consent_email]').check(); await sf.locator('button[type=submit]').click(); await p.waitForTimeout(1200);
  await sf.scrollIntoViewIfNeeded(); await shot('29-sentence-done');
  await toEl('#quiz', 0, 1800); await shot('30-finder-1');
  await p.locator('.qopt').nth(1).click(); await p.waitForTimeout(700); await p.locator('.qopt').nth(2).click(); await p.waitForTimeout(700); await p.locator('.qopt').last().click(); await p.waitForTimeout(900);
  await toEl('#quiz', 0, 1200); await shot('31-finder-result');
  const N = await top('#network'); await to(N + H * 0.4, 3000);
  if (!mob) { const r = await p.locator('#earth').boundingBox(); for (let k = 0; k < 14; k++) { await p.mouse.move(r.x + r.width * (0.2 + k * 0.045), r.y + r.height * (0.3 + (k % 5) * 0.08), { steps: 4 }); await p.waitForTimeout(120); } }
  await shot('32-network');
  const nf = p.locator('.net-form'); await nf.locator('input[name=email]').fill('n@example.com'); await nf.locator('input[name=consent_email]').check(); await nf.locator('button[type=submit]').click(); await p.waitForTimeout(1500); await shot('33-network-sealed');
  await toEl('.refer', 0, 1500); await p.click('#copyLink').catch(() => {}); await p.waitForTimeout(400); await shot('34-refer');
  await to(await p.evaluate(() => document.documentElement.scrollHeight), 2800); await shot('35-footer'); await sw('footer');
  /* menu + exit card (only with a cart) */
  await p.click('#menuBtn'); await p.waitForTimeout(900); await shot('36-menu'); await p.keyboard.press('Escape');
  await p.evaluate(() => window.__pc.addToCart(window.__pc.products[0].id)); await p.waitForTimeout(400);
  await p.evaluate(() => { localStorage.removeItem('pc-member'); sessionStorage.removeItem('pc-exit'); localStorage.removeItem('pc-exit-n'); });
  log.push('exit eligible after member reset needs reload; skipped live trigger');
  log.push('events: ' + (await p.evaluate(() => window.__pc.events.length)));
  console.log(tag, PATH, '\n' + log.join('\n') + '\nERRORS:\n' + (errs.join('\n') || 'none'));
  await b.close();
})();

// phone menu: (a) does tapping the PEPTICITY logo with the menu open close it? (b) is the PEPTIDES list scrollable to its last item?
// usage: node probe_phone_menu.js <url>
const L = require('./lib'); const o = L.out(); const tag = /8964/.test(process.argv[2]) ? 'rc4' : 'rc5';
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'phone', process.argv[2]);
  await page.evaluate(() => scrollTo(0, 1500)); await L.settleScroll(page);
  await page.click('[data-menu-key]'); await page.waitForFunction(() => document.querySelector('[data-menu-key]').getAttribute('aria-expanded') === 'true');
  await L.frames(page, 20);
  await page.tap('.pep-header-brand'); await L.settleScroll(page); await L.frames(page, 40);
  const st = await page.evaluate(() => { const k = document.getElementById('pep-header-keys'); const r = k.getBoundingClientRect(); const cs = getComputedStyle(k); return { exp: document.querySelector('[data-menu-key]').getAttribute('aria-expanded'), keysVisible: cs.visibility !== 'hidden' && cs.display !== 'none' && r.height > 0 && parseFloat(cs.opacity) > 0.1, y: Math.round(scrollY), box: [r.top, r.height].map(Math.round) }; });
  o.claim(st.exp !== 'true' && !st.keysVisible, 'phone: tapping the PEPTICITY logo with the menu open closes the menu', JSON.stringify(st));
  await L.shot(page, `${tag}-phone-logo-menu.png`);
  // (b)
  if (st.exp !== 'true') { await page.click('[data-menu-key]'); }
  await page.click('.pep-header-key--hero'); await page.waitForSelector('.pep-header-item', { state: 'visible' }); await L.frames(page, 30);
  const d = await page.evaluate(() => { const last = [...document.querySelectorAll('.pep-header-item')].pop(); let n = last.parentElement, sc = null; while (n && n !== document.body) { const cs = getComputedStyle(n); if (/(auto|scroll)/.test(cs.overflowY) && n.scrollHeight > n.clientHeight + 2) { sc = n; break; } n = n.parentElement; } const r = last.getBoundingClientRect(); return { last: last.textContent, top: Math.round(r.top), bottom: Math.round(r.bottom), vh: innerHeight, scroller: sc ? sc.className + ' ' + sc.scrollHeight + '/' + sc.clientHeight : 'none', docScroll: getComputedStyle(document.documentElement).overflow + '/' + getComputedStyle(document.body).overflow }; });
  await L.shot(page, `${tag}-phone-drop.png`);
  // try to reach the last item with a finger swipe (wheel) over the list
  await page.mouse.move(195, 500); await page.mouse.wheel(0, 600); await L.frames(page, 30);
  const after = await page.evaluate(() => { const last = [...document.querySelectorAll('.pep-header-item')].pop(); const r = last.getBoundingClientRect(); return { top: Math.round(r.top), bottom: Math.round(r.bottom), open: document.querySelector('.pep-header-key--hero').getAttribute('aria-expanded') }; });
  o.claim(d.bottom <= d.vh || (after.bottom <= d.vh && after.open === 'true'), 'phone: the last PEPTIDES item can be brought on screen', `before ${JSON.stringify(d)}; after a swipe ${JSON.stringify(after)}`);
  await L.shot(page, `${tag}-phone-drop-after.png`);
  await ctx.close(); await b.close(); process.exit(o.done('phone menu ' + tag) ? 1 : 0); })().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

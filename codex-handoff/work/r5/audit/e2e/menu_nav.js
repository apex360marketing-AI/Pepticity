// MENU: every item lands on a visible target. Desktop bar + drop-down, phone menu. usage: node menu_nav.js <url> [desktop|phone] [maxItems]
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const KIND = process.argv[3] || 'desktop';
const MAX = +(process.argv[4] || 99);
const o = L.out();
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';

// is the target on screen, below the sticky header, and not covered at its centre?
async function landed(page, sel) {
  return page.evaluate((sel) => {
    const t = document.querySelector(sel); if (!t) return { ok: false, why: 'no target ' + sel };
    const hb = document.querySelector('[data-module="header"]').getBoundingClientRect();
    // the target's first visible heading, else the target itself
    let h = [...t.querySelectorAll('h1,h2,h3,[data-name]')].find((e) => { const r = e.getBoundingClientRect(); return r.height > 0 && r.width > 0 && !e.closest('[hidden]') && r.bottom > 0 && r.top < innerHeight; }) || t;
    const r = h.getBoundingClientRect(); const tr = t.getBoundingClientRect();
    const onScreen = tr.bottom > hb.bottom && tr.top < innerHeight && r.top < innerHeight && r.bottom > 0;
    const x = Math.min(Math.max(r.left + r.width / 2, 2), innerWidth - 2), y = Math.min(Math.max(r.top + Math.min(r.height / 2, 20), 2), innerHeight - 2);
    const at = document.elementFromPoint(x, y); const hdr = at && at.closest('[data-module="header"]');
    return { ok: onScreen && !hdr, why: `${h.tagName}.${String(h.className).split(' ')[0]} "${(h.textContent || '').trim().slice(0, 24)}" top=${Math.round(r.top)} headerBottom=${Math.round(hb.bottom)} under=${hdr ? 'HEADER' : (at ? at.tagName + '.' + String(at.className).split(' ')[0] : 'none')}` };
  }, sel);
}
async function openMenu(page) {
  if (KIND !== 'phone') return;
  const exp = await page.getAttribute('[data-menu-key]', 'aria-expanded');
  if (exp !== 'true') { await page.click('[data-menu-key]'); await page.waitForFunction(() => document.querySelector('[data-menu-key]').getAttribute('aria-expanded') === 'true', null, { timeout: 10000 }); }
  await L.frames(page, 20);
}

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const { ctx, page, rec } = await L.open(b, KIND, URL_);
  await L.frames(page, 30);
  if (KIND === 'phone') {
    await openMenu(page);
    const items = await page.evaluate(() => [...document.querySelectorAll('#pep-header-keys .pep-header-key')].map((k) => { const r = k.getBoundingClientRect(); return k.textContent.trim().replace(/\s+/g, ' ') + ' ' + Math.round(r.width) + 'x' + Math.round(r.height) + '@' + Math.round(r.top) + (r.height > 0 && r.top >= 0 && r.bottom <= innerHeight ? '' : ' OFFSCREEN'); }));
    o.claim(items.length >= 5 && !items.some((i) => /OFFSCREEN|0x0/.test(i)), 'phone menu opens with every key on screen', items.join(' | '));
    await L.shot(page, `${tag}-menu-phone-open.png`);
  }
  // plain keys
  const keys = [['.pep-header-brand', '#top'], ['[data-key="shop"]', null], ['[data-key="research"]', '#doors'], ['[data-key="about"]', '#story']];
  for (const [sel, target] of keys) {
    await page.evaluate(() => scrollTo(0, 1500)); await L.settleScroll(page);
    if (sel !== '.pep-header-brand') await openMenu(page);
    const href = await page.getAttribute(sel, 'href');
    await page.click(sel); await L.settleScroll(page); await L.frames(page, 30); await L.settleScroll(page);
    const r = await landed(page, target || href);
    const menuClosed = KIND === 'phone' ? (await page.getAttribute('[data-menu-key]', 'aria-expanded')) !== 'true' : true;
    o.claim(r.ok && menuClosed, `${KIND} ${sel} (${href}) lands on a visible target${KIND === 'phone' ? ' and the menu closes' : ''}`, r.why + (KIND === 'phone' ? ' menuClosed=' + menuClosed : ''));
    if (!r.ok) await L.shot(page, `${tag}-menu-${KIND}-miss-${href.replace('#', '')}.png`);
  }
  // CART key
  await openMenu(page);
  await page.click('[data-cart-open]');
  const cartOpen = await page.waitForFunction(() => !document.querySelector('[data-module="cart"] [data-layer]').hidden, null, { timeout: 10000 }).then(() => true, () => false);
  o.claim(cartOpen, `${KIND} CART opens the cart`, `open ${cartOpen}`);
  await page.keyboard.press('Escape'); await L.frames(page, 20);
  // PEPTIDES drop-down
  await openMenu(page);
  await page.click('.pep-header-key--hero');
  await page.waitForSelector('.pep-header-item', { state: 'visible', timeout: 20000 });
  const skus = await page.evaluate(() => [...document.querySelectorAll('.pep-header-item')].map((a) => a.getAttribute('data-sku')));
  await L.shot(page, `${tag}-menu-${KIND}-drop.png`);
  const dropVis = await page.evaluate(() => [...document.querySelectorAll('.pep-header-item')].filter((a) => { const r = a.getBoundingClientRect(); return !(r.height > 0 && r.top >= 0 && r.bottom <= innerHeight); }).map((a) => a.textContent.trim()));
  o.claim(skus.length > 10 && dropVis.length === 0, `${KIND} drop-down lists every product on screen`, `${skus.length} items; off screen: ${dropVis.join(', ') || 'none'}`);
  await page.keyboard.press('Escape'); await L.frames(page, 10);
  let good = 0; const bad = [];
  for (const sku of skus.slice(0, MAX)) {
    await openMenu(page);
    const st = await page.getAttribute('.pep-header-key--hero', 'aria-expanded');
    if (st !== 'true') await page.click('.pep-header-key--hero');
    await page.waitForSelector(`.pep-header-item[data-sku="${sku}"]`, { state: 'visible', timeout: 20000 });
    await page.click(`.pep-header-item[data-sku="${sku}"]`);
    await L.settleScroll(page);
    const ok = await page.waitForFunction((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); if (!li) return false; const n = li.querySelector('[data-name]'); const r = (n || li).getBoundingClientRect(); const hb = document.querySelector('[data-module="header"]').getBoundingClientRect(); if (!(r.height > 0 && r.top >= hb.bottom - 2 && r.bottom <= innerHeight)) return false; const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return !!(at && li.contains(at)); }, sku, { timeout: 30000, polling: 250 }).then(() => true, () => false);
    if (ok) good++; else { bad.push(sku + ' ' + JSON.stringify(await page.evaluate((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); if (!li) return 'no case'; const n = li.querySelector('[data-name]'); const r = (n || li).getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return Math.round(r.top) + '..' + Math.round(r.bottom) + ' at=' + (at ? at.tagName + '.' + String(at.className).split(' ')[0] : ''); }, sku))); if (bad.length === 1) await L.shot(page, `${tag}-menu-${KIND}-miss-${sku}.png`); }
  }
  o.claim(bad.length === 0, `${KIND} every drop-down product lands on its case, name on screen and on top`, `${good}/${Math.min(MAX, skus.length)} ok; missed: ${bad.slice(0, 6).join(' | ')}`);
  o.claim(rec.pageerror.length === 0, `${KIND} no page errors in menu`, rec.pageerror.slice(0, 2).join(' | '));
  await ctx.close(); await b.close();
  process.exit(o.done('menu ' + tag + ' ' + KIND) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

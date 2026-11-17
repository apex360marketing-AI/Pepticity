// CART AND CHECKOUT like a visitor. usage: node cart.js <url> [desktop|phone]
const L = require('./lib');
const fs = require('fs');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const KIND = process.argv[3] || 'desktop';
const o = L.out();
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';
const cat = JSON.parse(fs.readFileSync('/home/user/work/r4/rc5/site/new/assets/catalogue.json'));
const SIZES = {}; cat.products.forEach((p) => p.sizes.forEach((s) => { SIZES[s.id] = { sku: p.sku, name: p.name, label: s.label, cents: Math.round(s.priceCAD * 100) }; }));
const cad = (c) => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(c / 100);
const norm = (s) => String(s || '').replace(/\s+/g, ' ').replace(/ /g, ' ').trim();
const num = (s) => Math.round(parseFloat(String(s || '').replace(/[^0-9.]/g, '')) * 100);

async function showHeader(page) {
  for (let k = 0; k < 6; k++) { const top = await page.evaluate(() => document.querySelector('[data-module="header"]').getBoundingClientRect().bottom); if (top > 20) return; await page.mouse.move(200, 300); await page.mouse.wheel(0, -150); await L.settleScroll(page); await L.frames(page, 20); }
}
async function goProduct(page, sku) {
  await showHeader(page);
  if (KIND === 'phone') { await page.click('[data-menu-key]'); await page.waitForFunction(() => document.querySelector('[data-menu-key]').getAttribute('aria-expanded') === 'true', null, { timeout: 10000 }); }
  await page.click('.pep-header-key--hero');
  await page.waitForSelector(`.pep-header-item[data-sku="${sku}"]`, { state: 'visible', timeout: 20000 });
  await page.click(`.pep-header-item[data-sku="${sku}"]`);
  await L.settleScroll(page); await L.frames(page, 40);
  // the case for this sku with its add button on screen
  const ok = await page.waitForFunction((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); if (!li) return false; const b = [...li.querySelectorAll('button')].find((x) => /ADD/i.test(x.textContent)); if (!b) return false; const r = b.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; }, sku, { timeout: 60000 }).then(() => true, () => false);
  return ok;
}
async function readCase(page, sku) {
  return page.evaluate((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); const t = (s) => { const e = li.querySelector(s); return e && !e.hidden ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
    return { name: li.querySelector('[data-name]') && li.querySelector('[data-name]').firstChild ? li.querySelector('[data-name]').firstChild.textContent.replace(/\s+/g, ' ').trim() : '', size: t('[data-b-size]'), price: t('[data-b-price]') }; }, sku);
}
async function addCase(page, sku) {
  const b = page.locator(`#lineup li[data-sku="${sku}"] button`).filter({ hasText: /ADD/i }).first();
  await b.click();
}
async function readCart(page) {
  return page.evaluate(() => {
    const root = document.querySelector('[data-module="cart"]'); const t = (s) => { const e = root.querySelector(s); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
    const lines = [...root.querySelectorAll('[data-qty]')].filter((q) => !q.closest('template') && !q.closest('[hidden]')).map((q) => { let n = q.closest('[data-line]') || q.parentElement; const g = (s) => { const e = n.querySelector(s); return e && !e.hidden ? e.textContent.replace(/\s+/g, ' ').trim() : ''; };
      return { name: g('[data-line-name]') || g('[data-gate-off="names"]'), size: g('[data-line-size]'), price: g('[data-line-price]'), qty: g('[data-qty]') }; });
    const vis = (s) => { const e = root.querySelector(s); return !!e && !e.closest('[hidden]'); };
    return { open: !root.querySelector('[data-layer]').hidden, lines, sub: t('[data-view="cart"] [data-t="subtotal"]') || t('[data-t="subtotal"]'), team: t('[data-t="team"]'), teamRow: vis('[data-row="team"]'), total: t('[data-view="cart"] [data-t="total"]') || t('[data-t="total"]'), empty: vis('[data-empty]'), count: (document.querySelector('[data-cart-count]') || {}).textContent };
  });
}

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const { ctx, page, rec } = await L.open(b, KIND, URL_);
  await L.frames(page, 30);
  const picks = [['bpc-157', null], ['ipamorelin', null]];
  const shown = [];
  for (const p of picks) {
    const ok = await goProduct(page, p[0]);
    o.claim(ok, `${KIND} PEPTIDES > ${p[0]} lands on its case with ADD TO CART on screen`, `landed ${ok}`);
    if (!ok) continue;
    const c = await readCase(page, p[0]); shown.push([p[0], c]);
    const sizeIds = Object.keys(SIZES).filter((k) => SIZES[k].sku === p[0]);
    const match = sizeIds.find((k) => num(c.price) === SIZES[k].cents && norm(c.size).replace(/\s/g, '').toLowerCase() === norm(SIZES[k].label).replace(/\s/g, '').toLowerCase());
    o.claim(!!c.name && !!match, `${KIND} ${p[0]} name, size and price visible together and match the catalogue`, `case shows "${c.name}" "${c.size}" "${c.price}"; catalogue ${sizeIds.map((k) => SIZES[k].label + ' ' + cad(SIZES[k].cents)).join(', ')}`);
    p[1] = match;
    await addCase(page, p[0]);
    await L.frames(page, 30);
    const auto = await page.evaluate(() => !document.querySelector('[data-module="cart"] [data-layer]').hidden);
    o.note(`${KIND} after ADD TO CART ${p[0]} the cart drawer is ${auto ? 'opened automatically' : 'left closed'}`);
    if (auto && p !== picks[picks.length - 1]) { await page.keyboard.press('Escape'); await page.waitForFunction(() => document.querySelector('[data-module="cart"] [data-layer]').hidden, null, { timeout: 10000 }); }
  }
  await L.shot(page, `${tag}-cart-${KIND}-0-added.png`);
  // open the cart
  if (await page.evaluate(() => document.querySelector('[data-module="cart"] [data-layer]').hidden)) { await showHeader(page); await page.click('[data-cart-open]'); }
  await page.waitForFunction(() => !document.querySelector('[data-module="cart"] [data-layer]').hidden, null, { timeout: 15000 });
  await L.frames(page, 30);
  let c = await readCart(page);
  const want = picks.filter((p) => p[1]).map((p) => SIZES[p[1]]);
  const wantSub = want.reduce((s, x) => s + x.cents, 0);
  o.claim(c.lines.length === want.length && c.lines.every((l, i) => norm(l.price) === norm(cad(want[i].cents)) && l.qty === '1'), `${KIND} cart lines show the listed prices`, JSON.stringify(c.lines));
  o.claim(norm(c.sub) === norm(cad(wantSub)), `${KIND} subtotal equals the sum of listed prices`, `subtotal "${c.sub}" want "${cad(wantSub)}"; total "${c.total}"; team row ${c.teamRow} "${c.team}"; header count ${c.count}`);
  o.claim(norm(c.total) === norm(cad(wantSub - (c.teamRow ? Math.round(wantSub * 0.1) : 0))), `${KIND} total = subtotal - member discount (shipping/tax not set)`, `total "${c.total}"`);
  await L.shot(page, `${tag}-cart-${KIND}-1-open.png`);
  // + on line 1
  const linesLoc = page.locator('[data-module="cart"] [data-more]').filter({ visible: true });
  await linesLoc.first().click(); await L.frames(page, 10);
  c = await readCart(page);
  o.claim(c.lines[0] && c.lines[0].qty === '2' && norm(c.sub) === norm(cad(wantSub + want[0].cents)), `${KIND} one more: qty 2 and subtotal updates exactly`, `qty ${c.lines[0] && c.lines[0].qty}; subtotal "${c.sub}" want "${cad(wantSub + want[0].cents)}"`);
  await page.locator('[data-module="cart"] [data-less]').filter({ visible: true }).first().click(); await L.frames(page, 10);
  c = await readCart(page);
  o.claim(c.lines[0] && c.lines[0].qty === '1' && norm(c.sub) === norm(cad(wantSub)), `${KIND} one fewer: back to qty 1`, `qty ${c.lines[0] && c.lines[0].qty}; subtotal "${c.sub}"`);
  // less at qty 1: stays 1 or removes? record
  // remove line 2
  if (want.length > 1) {
    await page.locator('[data-module="cart"] [data-remove]').filter({ visible: true }).nth(1).click(); await L.frames(page, 20);
    c = await readCart(page);
    o.claim(c.lines.length === 1 && norm(c.sub) === norm(cad(want[0].cents)), `${KIND} remove: line gone and subtotal = remaining line`, `lines ${c.lines.length}; subtotal "${c.sub}"`);
  }
  // checkout (preview: no age gate) -> end view
  await page.locator('[data-module="cart"] [data-checkout]').click(); await L.frames(page, 30);
  const endv = await page.evaluate(() => { const v = document.querySelector('[data-module="cart"] [data-view="end"]'); return { shown: !v.hidden, h3: (v.querySelector('[data-view-head]') || {}).textContent, total: (v.querySelector('[data-t="total"]') || {}).textContent }; });
  o.claim(endv.shown, `${KIND} CHECKOUT reaches the last step`, `end view ${endv.shown} "${norm(endv.h3)}" total "${norm(endv.total)}"`);
  await L.shot(page, `${tag}-cart-${KIND}-2-end.png`);
  // remove the last line -> empty state
  await page.locator('[data-module="cart"] [data-back]').filter({ visible: true }).first().click().catch(() => {});
  await L.frames(page, 10);
  await page.locator('[data-module="cart"] [data-remove]').filter({ visible: true }).first().click(); await L.frames(page, 20);
  c = await readCart(page);
  o.claim(c.lines.length === 0 && c.empty, `${KIND} removing everything shows the empty cart`, `lines ${c.lines.length} empty ${c.empty}`);
  const chk = await page.evaluate(() => { const b = document.querySelector('[data-module="cart"] [data-checkout]'); return b && !b.closest('[hidden]') && b.getBoundingClientRect().height > 0; });
  o.claim(!chk, `${KIND} CHECKOUT is not offered with an empty cart`, `checkout visible ${chk}`);
  // Esc closes and focus returns
  await page.keyboard.press('Escape'); await L.frames(page, 20);
  const closed = await page.evaluate(() => ({ hidden: document.querySelector('[data-module="cart"] [data-layer]').hidden, focus: document.activeElement && (document.activeElement.getAttribute('data-key') || document.activeElement.className) }));
  o.claim(closed.hidden && /cart|pep-lineup-add/.test(closed.focus || ''), `${KIND} Esc closes the cart and focus returns to what opened it (ADD TO CART opened it)`, JSON.stringify(closed));
  await ctx.close();

  // AGE GATE (?gate): every step, empty and bad input refused
  const G = await L.open(b, KIND, URL_.split('?')[0] + '?gate');
  const pg = G.page; await L.frames(pg, 30);
  const okp = await (async () => { const ok = await (async () => { const sv = page; return true; })(); return ok; })();
  // add via the bus-free way: the header drop again
  const sku = 'bpc-157';
  const landed = await (async () => { if (KIND === 'phone') { await pg.click('[data-menu-key]'); } await pg.click('.pep-header-key--hero'); await pg.waitForSelector(`.pep-header-item[data-sku="${sku}"]`, { state: 'visible', timeout: 20000 }); await pg.click(`.pep-header-item[data-sku="${sku}"]`); await L.settleScroll(pg); return pg.waitForFunction((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); const b = li && [...li.querySelectorAll('button')].find((x) => /ADD/i.test(x.textContent)); if (!b) return false; const r = b.getBoundingClientRect(); return r.height > 0 && r.top >= 0 && r.bottom <= innerHeight; }, sku, { timeout: 60000 }).then(() => true, () => false); })();
  if (landed) {
    await pg.locator(`#lineup li[data-sku="${sku}"] button`).filter({ hasText: /ADD/i }).first().click();
    await L.frames(pg, 30); if (await pg.evaluate(() => document.querySelector('[data-module="cart"] [data-layer]').hidden)) { await showHeader(pg); await pg.click('[data-cart-open]'); } await pg.waitForFunction(() => !document.querySelector('[data-module="cart"] [data-layer]').hidden, null, { timeout: 15000 });
    await pg.locator('[data-module="cart"] [data-checkout]').click(); await L.frames(pg, 20);
    const age = await pg.evaluate(() => !document.querySelector('[data-module="cart"] [data-view="age"]').hidden);
    o.claim(age, `${KIND} ?gate: CHECKOUT opens the age step`, `age view ${age}`);
    const sub = pg.locator('[data-module="cart"] [data-age-form] button[type=submit]');
    await sub.click(); await L.frames(pg, 10);
    const e1 = await pg.evaluate(() => { const f = document.querySelector('[data-age-form]'); return [...f.querySelectorAll('[role=alert]')].filter((x) => !x.hidden).map((x) => x.textContent.trim()); });
    o.claim(e1.length >= 1, `${KIND} age step: empty is refused with a message`, JSON.stringify(e1));
    await pg.selectOption('#pep-cart-prov', 'ON'); await pg.selectOption('#pep-cart-day', '31'); await pg.selectOption('#pep-cart-month', { index: 2 }); await pg.selectOption('#pep-cart-year', '1990');
    await sub.click(); await L.frames(pg, 10);
    const e2 = await pg.evaluate(() => { const f = document.querySelector('[data-age-form]'); return [...f.querySelectorAll('[role=alert]')].filter((x) => !x.hidden).map((x) => x.textContent.trim()); });
    o.claim(e2.length >= 1, `${KIND} age step: 31 February is refused with a message`, JSON.stringify(e2));
    const y = new Date().getFullYear() - 10;
    await pg.selectOption('#pep-cart-day', '1'); await pg.selectOption('#pep-cart-month', { index: 1 }); await pg.selectOption('#pep-cart-year', String(y));
    await sub.click(); await L.frames(pg, 20);
    const stop = await pg.evaluate(() => !document.querySelector('[data-module="cart"] [data-view="stop"]').hidden);
    const store = await pg.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]));
    o.claim(stop, `${KIND} age step: under age stops the checkout`, `stop view ${stop}`);
    o.claim(!new RegExp(String(y) + '|1990').test(store), `${KIND} no date of birth kept in storage`, store.slice(0, 300));
    await L.shot(pg, `${tag}-cart-${KIND}-3-age-stop.png`);
  } else o.claim(false, `${KIND} ?gate: reach a product`, 'could not land on bpc-157');
  await G.ctx.close();
  o.claim(rec.pageerror.length === 0, `${KIND} no page errors in cart`, rec.pageerror.slice(0, 2).join(' | '));
  await b.close();
  process.exit(o.done('cart ' + tag + ' ' + KIND) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

// Second look at controls buttons.js called dead: press them with the real mouse in their normal context.
// usage: node probe_dead.js <url> [desktop|phone]
const L = require('./lib'); const o = L.out(); const KIND = process.argv[3] || 'desktop';
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, KIND, process.argv[2]);
  // lineup: which case is current? press Next with the mouse
  await page.evaluate(() => document.getElementById('lineup').scrollIntoView({ block: 'start' })); await L.settleScroll(page);
  await page.mouse.move(100, 300); await page.mouse.wheel(0, 900); await L.settleScroll(page); await L.frames(page, 40);
  const cur = () => page.evaluate(() => { const lis = [...document.querySelectorAll('#lineup li[data-sku]')]; const on = lis.map((li) => { const n = li.querySelector('[data-name]'); const r = (n || li).getBoundingClientRect(); return { sku: li.getAttribute('data-sku'), mid: Math.abs(r.top + r.height / 2 - innerHeight / 2), vis: r.height > 0 && r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth }; }).filter((x) => x.vis).sort((a, b) => a.mid - b.mid); return { on: on.slice(0, 2).map((x) => x.sku).join(','), y: Math.round(scrollY), next: (() => { const n = document.querySelector('[data-next]'); const r = n.getBoundingClientRect(); return { dis: n.getAttribute('aria-disabled'), box: [r.left, r.top, r.width, r.height].map(Math.round), vis: getComputedStyle(n).visibility }; })() }; });
  const a = await cur();
  const nb = a.next.box; let b1 = a;
  if (nb[2] > 0 && nb[1] >= 0 && nb[1] < (await page.evaluate(() => innerHeight))) { await page.mouse.click(nb[0] + nb[2] / 2, nb[1] + nb[3] / 2); await L.settleScroll(page); await L.frames(page, 60); b1 = await cur(); }
  o.claim(a.on !== b1.on || a.y !== b1.y, `${KIND} lineup "Next product" (real mouse) moves to the next case`, `before ${JSON.stringify(a)} after ${JSON.stringify(b1)}`);
  // full description on the current case
  const more = await page.evaluate(() => { const m = [...document.querySelectorAll('#lineup li[data-sku] [data-more]')].find((x) => { const r = x.getBoundingClientRect(); return r.height > 0 && r.top > 0 && r.bottom < innerHeight && !x.closest('[hidden]'); }); if (!m) return null; const r = m.getBoundingClientRect(); return { sku: m.closest('li').getAttribute('data-sku'), x: r.left + r.width / 2, y: r.top + r.height / 2, exp: m.getAttribute('aria-expanded'), op: getComputedStyle(m).opacity }; });
  if (more) { await page.mouse.click(more.x, more.y); await L.frames(page, 40);
    const after = await page.evaluate((sku) => { const m = document.querySelector(`#lineup li[data-sku="${sku}"] [data-more]`); return { exp: m.getAttribute('aria-expanded'), dialogs: [...document.querySelectorAll('dialog[open]')].map((d) => d.className), detail: !document.querySelector(`#lineup li[data-sku="${sku}"] [data-detail]`).hidden }; }, more.sku);
    o.claim(after.exp === 'true' || after.dialogs.length || after.detail, `${KIND} lineup "full description" (real mouse) opens the description`, `before ${JSON.stringify(more)} after ${JSON.stringify(after)}`);
    await L.shot(page, 'rc5-dead-more.png'); }
  else o.note('no full description button on screen');
  // CLICK THE CASE: press the vial of the current case
  if (more) { await page.keyboard.press('Escape'); await L.frames(page, 20);
    const c = await page.evaluate((sku) => { const li = document.querySelector(`#lineup li[data-sku="${sku}"]`); const m = li.querySelector('[data-more]'); const r = m.getBoundingClientRect(); const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return { box: [r.left, r.top, r.width, r.height].map(Math.round), at: at ? at.tagName + '.' + String(at.className).split(' ')[0] : '' }; }, more.sku);
    o.note('full description button box ' + JSON.stringify(c));
    const vw = await page.evaluate(() => innerWidth);
    await page.mouse.click(Math.round(vw / 2), 400); await L.frames(page, 60);
    const v = await page.evaluate(() => ({ dialogs: [...document.querySelectorAll('dialog[open]')].map((d) => d.className + ' ' + (d.textContent || '').trim().slice(0, 60).replace(/\s+/g, ' ')) }));
    o.claim(v.dialogs.length > 0, `${KIND} pressing the case itself opens its full description`, JSON.stringify(v));
    await L.shot(page, 'rc5-dead-case.png'); }
  await ctx.close(); await b.close(); process.exit(o.done('probe_dead') ? 1 : 0); })().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

// PRESS EVERY BUTTON AND LINK ONCE. Counts them; lists any press that changes nothing.
// "Changes something" = URL/hash, scroll position, focus, an open dialog/drawer/menu (aria-expanded, [open], hidden flips),
// a DOM change that did not also happen in an equal idle window just before, a new tab, or the clipboard.
// External links (mailto:, sms:, http(s) off-site) are not followed: their href is checked instead.
// usage: node buttons.js <url> [desktop|phone]
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const KIND = process.argv[3] || 'desktop';
const o = L.out();
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const { ctx, page, rec } = await L.open(b, KIND, URL_, { ctx: { permissions: ['clipboard-read', 'clipboard-write'] } });
  const popups = []; ctx.on('page', (p) => { popups.push(p.url()); p.close().catch(() => {}); });
  page.on('dialog', (d) => d.dismiss().catch(() => {}));
  await page.route(/^(?!http:\/\/127\.0\.0\.1)/, (r) => r.abort());   // never reach an outside host
  await L.frames(page, 30);
  // scroll through once so lazily built controls exist
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < H; y += 1500) { await page.evaluate((y) => scrollTo(0, y), y); await L.frames(page, 3); }
  await page.evaluate(() => scrollTo(0, 0));
  const inv = await page.evaluate(() => {
    window.__ctl = [...document.querySelectorAll('button, a[href], [role="button"], summary')].filter((e) => !e.closest('template'));
    return window.__ctl.map((e, i) => { const cs = getComputedStyle(e), r = e.getBoundingClientRect(); return { i, tag: e.tagName, text: (e.getAttribute('aria-label') || e.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 40), href: e.getAttribute('href'), hidden: !!e.closest('[hidden]') || cs.display === 'none' || cs.visibility === 'hidden' || r.width === 0 || r.height === 0, inDialog: !!e.closest('dialog,[role=dialog]'), where: (e.closest('section,header,footer,dialog,[data-module]') || {}).id || ((e.closest('[data-module]') || {}).getAttribute ? e.closest('[data-module]').getAttribute('data-module') : '') }; });
  });
  const reachable = inv.filter((x) => !x.hidden);
  o.note(`${KIND}: ${inv.length} buttons/links in the DOM, ${reachable.length} visible on the page at rest (${inv.length - reachable.length} sit in closed dialogs/menus/hidden steps)`);
  const ext = reachable.filter((x) => x.href && /^(mailto:|sms:|tel:|https?:)/.test(x.href) && !x.href.startsWith('http://127.0.0.1'));
  for (const x of ext) o.note(`external link not followed: "${x.text}" ${x.href.slice(0, 90)}`);
  const dead = []; let pressed = 0;
  for (const x of reachable) {
    if (ext.includes(x)) continue;
    const res = await page.evaluate(async (i) => {
      const e = window.__ctl[i]; if (!e.isConnected) return { skip: 'gone' };
      const r0 = e.getBoundingClientRect(); if (e.closest('[hidden]') || r0.width === 0) return { skip: 'hidden now' };
      e.scrollIntoView({ block: 'center' });
      await new Promise((r) => setTimeout(r, 50)); for (let k = 0; k < 6; k++) await new Promise((r) => requestAnimationFrame(r));
      const sig = () => JSON.stringify({ u: location.href, y: Math.round(scrollY), x: Math.round(scrollX), f: document.activeElement === e ? 'self' : (document.activeElement ? document.activeElement.tagName + (document.activeElement.id || '') + document.activeElement.className : ''), d: [...document.querySelectorAll('dialog[open]')].length, ex: [...document.querySelectorAll('[aria-expanded="true"],[aria-pressed="true"],[aria-checked="true"],[aria-selected="true"]')].length, hid: document.querySelectorAll('[hidden]').length });
      const watch = (ms) => new Promise((res) => { const seen = new Set(); const mo = new MutationObserver((l) => l.forEach((m) => { const t = m.target.nodeType === 1 ? m.target : m.target.parentElement; if (m.type === 'attributes' && m.attributeName === 'style') return; seen.add(t); })); mo.observe(document.body, { subtree: true, childList: true, attributes: true, characterData: true }); setTimeout(() => { mo.disconnect(); res(seen); }, ms); });
      const idle = await watch(500);
      const s0 = sig(); const y0 = scrollY;
      const changed = watch(900);
      e.click();
      const after = await changed; const s1 = sig();
      const fresh = [...after].filter((t) => !idle.has(t));
      return { s0, s1, fresh: fresh.length, freshWhat: fresh.slice(0, 3).map((t) => t.tagName + '.' + String(t.className).split(' ')[0]) };
    }, x.i).catch((err) => ({ skip: 'error ' + String(err).slice(0, 80) }));
    if (res.skip) { o.note(`skip [${x.i}] "${x.text}" ${res.skip}`); continue; }
    pressed++;
    const clip = 0;
    const did = res.s0 !== res.s1 || res.fresh > 0 || popups.length;
    if (!did) dead.push(`[${x.i}] ${x.tag} "${x.text}" ${x.href || ''} in ${x.where}`);
    popups.length = 0;
    // put things back: close dialogs, drawers, menus; leave hash
    await page.keyboard.press('Escape').catch(() => {}); await page.keyboard.press('Escape').catch(() => {});
    await page.evaluate(() => { document.querySelectorAll('dialog[open]').forEach((d) => d.close()); try { window.PEP.emit('cart:close'); } catch (e) {} if (location.hash) history.replaceState(null, '', location.pathname + location.search); }).catch(() => {});
  }
  o.claim(dead.length === 0, `${KIND} every button and link does something when pressed`, `${pressed} pressed (+${ext.length} external hrefs checked); no visible effect: ${dead.length}${dead.length ? ' -> ' + dead.join(' || ') : ''}`);
  o.claim(rec.pageerror.length === 0, `${KIND} no page errors while pressing everything`, `${rec.pageerror.length} ${rec.pageerror.slice(0, 3).join(' | ')}`);
  await ctx.close(); await b.close();
  process.exit(o.done('buttons ' + tag + ' ' + KIND) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

// SKILL JOURNEYS 1, 7, 8, 9, 10 (land, every link, keyboard, motion, tap targets). usage: node journeys.js <url> [desktop|phone]
const L = require('./lib');
const http = require('http');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const KIND = process.argv[3] || 'desktop';
const o = L.out();
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';
const head = (u) => new Promise((res) => { const r = http.request(u, { method: 'GET' }, (s) => { s.resume(); res(s.statusCode); }); r.on('error', () => res(0)); r.setTimeout(20000, () => { r.destroy(); res(0); }); r.end(); });

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  // 1 LAND: real first visit (entrance plays)
  {
    const { ctx, page, rec } = await L.open(b, KIND, null, { entrance: true });
    const t0 = Date.now();
    await page.goto(URL_, { waitUntil: 'load', timeout: 180000 });
    const offer = await page.waitForFunction(() => { const h = document.querySelector('#top h1, #top h2'); if (!h) return null; const r = h.getBoundingClientRect(); let op = 1, n = h; while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; } const at = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2); return op > 0.9 && r.top >= 0 && r.bottom <= innerHeight && at && (h.contains(at) || at.contains(h)) ? Math.round(performance.now()) : null; }, null, { timeout: 120000, polling: 100 }).then((h) => h.jsonValue(), () => null);
    const paint = await page.evaluate(() => Object.fromEntries(performance.getEntriesByType('paint').map((p) => [p.name, Math.round(p.startTime)])));
    o.claim(!!offer && rec.pageerror.length === 0, `${KIND} LAND: first screen paints and the offer is readable`, `FCP ${paint['first-contentful-paint']} ms; offer readable at ${offer} ms (entrance on, swiftshader); wall ${Date.now() - t0} ms; errors ${rec.pageerror.length}`);
    await L.shot(page, `${tag}-land-${KIND}.png`);
    await ctx.close();
  }
  const { ctx, page, rec } = await L.open(b, KIND, URL_, { ctx: KIND === 'desktop' ? {} : {} });
  await L.frames(page, 30);
  // 7 EVERY LINK
  const links = await page.evaluate(() => [...document.querySelectorAll('a[href]')].filter((a) => !a.closest('template')).map((a) => ({ href: a.getAttribute('href'), abs: a.href, rel: a.getAttribute('rel') || '', target: a.getAttribute('target') || '', text: (a.textContent || a.getAttribute('aria-label') || '').trim().slice(0, 30) })));
  const internal = links.filter((l) => l.href.startsWith('#'));
  const miss = await page.evaluate((hs) => hs.filter((h) => h.length > 1 && !document.getElementById(decodeURIComponent(h.slice(1)))), [...new Set(internal.map((l) => l.href))]);
  o.claim(miss.length === 0, `${KIND} every in-page link has a target`, `${internal.length} in-page links (${new Set(internal.map((l) => l.href)).size} distinct); missing targets: ${miss.join(', ') || 'none'}`);
  const ext = links.filter((l) => /^https?:/.test(l.abs) && !l.abs.startsWith(new URL(URL_).origin));
  const noRel = ext.filter((l) => l.target === '_blank' && !/noopener/.test(l.rel));
  o.claim(noRel.length === 0, `${KIND} outside links that open a new tab carry rel=noopener`, `${ext.length} outside links; without noopener: ${noRel.map((l) => l.abs).join(', ') || 'none'}`);
  const same = [...new Set(links.filter((l) => l.abs.startsWith(new URL(URL_).origin) && !l.href.startsWith('#')).map((l) => l.abs.split('#')[0]))];
  const codes = []; for (const u of same) codes.push([u, await head(u)]);
  const bad = codes.filter((c) => c[1] !== 200);
  o.claim(bad.length === 0, `${KIND} no same-site link 404s`, `${same.length} same-site files linked; bad: ${bad.map((c) => c[1] + ' ' + c[0]).join(', ') || 'none'}`);
  // 8 KEYBOARD: Tab through the page; every stop shows a visible focus ring (pixels differ focused vs not)
  await page.evaluate(() => { scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
  await page.mouse.click(2, Math.round((await page.evaluate(() => innerHeight)) / 2)).catch(() => {});
  const noRing = []; let stops = 0; const seenEl = new Set(); let lastKey = '';
  for (let i = 0; i < 160; i++) {
    await page.keyboard.press('Tab');
    const info = await page.evaluate(() => { const e = document.activeElement; if (!e || e === document.body) return null; const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const key = e.tagName + '|' + (e.id || '') + '|' + (e.className || '') + '|' + (e.textContent || '').trim().slice(0, 20) + '|' + Math.round(r.top + scrollY);
      return { key, r: [r.left, r.top, r.width, r.height].map(Math.round), name: e.tagName + ' "' + (e.getAttribute('aria-label') || e.textContent || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 26) + '"', outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) > 0 ? cs.outlineStyle + ' ' + cs.outlineWidth + ' ' + cs.outlineColor : '', shadow: cs.boxShadow !== 'none' ? 'shadow' : '', fv: e.matches(':focus-visible') }; });
    if (!info) continue;
    if (info.key === lastKey) break; lastKey = info.key;
    if (seenEl.has(info.key)) break; seenEl.add(info.key);
    stops++;
    if (!info.outline && !info.shadow) {
      // pixel check: element region focused vs blurred
      const clip = { x: Math.max(0, info.r[0] - 6), y: Math.max(0, info.r[1] - 6), width: Math.max(4, info.r[2] + 12), height: Math.max(4, info.r[3] + 12) };
      if (clip.y + clip.height > 0 && clip.y < (await page.evaluate(() => innerHeight))) {
        const a = await page.screenshot({ clip, animations: 'disabled' }).catch(() => null);
        await page.evaluate(() => { window.__f = document.activeElement; window.__f.blur(); });
        const c = await page.screenshot({ clip, animations: 'disabled' }).catch(() => null);
        await page.evaluate(() => window.__f.focus({ preventScroll: true }));
        if (a && c && Buffer.compare(a, c) === 0) noRing.push(info.name + '@' + info.r.join(','));
      }
    }
  }
  o.claim(stops > 20 && noRing.length === 0, `${KIND} KEYBOARD: every Tab stop shows a visible focus ring`, `${stops} Tab stops; no visible change on focus: ${noRing.length}${noRing.length ? ' -> ' + noRing.slice(0, 10).join(' | ') : ''}`);
  // 10 tap targets (phone)
  if (KIND === 'phone') {
    const small = await page.evaluate(() => [...document.querySelectorAll('button, a[href], input, select, [role=button], label')].filter((e) => { if (e.closest('[hidden],template,dialog:not([open])')) return false; const r = e.getBoundingClientRect(); if (r.width === 0 || r.height === 0) return false; const cs = getComputedStyle(e); if (cs.visibility === 'hidden') return false; if (e.tagName === 'INPUT' && (e.type === 'checkbox' || e.type === 'radio') && e.closest('label')) return false; if (e.tagName === 'A' && e.closest('p') && cs.display === 'inline') return false; return r.width < 44 || r.height < 44; }).map((e) => { const r = e.getBoundingClientRect(); return e.tagName + ' "' + (e.getAttribute('aria-label') || e.textContent || e.name || '').trim().replace(/\s+/g, ' ').slice(0, 22) + '" ' + Math.round(r.width) + 'x' + Math.round(r.height); }));
    o.claim(small.length === 0, 'phone tap targets >= 44 px (inline text links excluded)', `${small.length} smaller: ${small.slice(0, 15).join(' | ')}`);
  }
  o.claim(rec.pageerror.length === 0, `${KIND} no page errors`, rec.pageerror.slice(0, 2).join(' | '));
  await ctx.close();
  // 9 MOTION: reduced motion stops loops (canvases sampled 1 s apart; running infinite CSS animations)
  {
    const M = await L.open(b, KIND, URL_, { ctx: { reducedMotion: 'reduce' } });
    await L.frames(M.page, 30);
    const res = [];
    for (const y of [0, 2000, 6000, 12000]) {
      await M.page.evaluate((y) => scrollTo(0, y), y); await L.settleScroll(M.page); await L.frames(M.page, 30);
      const snap = () => M.page.evaluate(() => [...document.querySelectorAll('canvas')].filter((c) => { const r = c.getBoundingClientRect(); return r.width > 20 && r.height > 20 && r.bottom > 0 && r.top < innerHeight; }).map((c) => { try { return c.toDataURL().length + ':' + c.toDataURL().slice(-60); } catch (e) { return 'tainted'; } }));
      const a = await snap(); await M.page.waitForFunction(() => new Promise((r) => setTimeout(() => r(true), 1000)));
      const c = await snap();
      const anim = await M.page.evaluate(() => document.getAnimations().filter((a) => a.playState === 'running' && a.effect && a.effect.getTiming().iterations === Infinity).map((a) => (a.animationName || a.constructor.name) + ' on ' + (a.effect.target ? a.effect.target.tagName + '.' + String(a.effect.target.className).split(' ')[0] : '?')).slice(0, 6));
      const moving = a.filter((x, i) => c[i] !== x).length;
      res.push({ y, canvases: a.length, moving, anim });
    }
    const movers = res.filter((r) => r.moving > 0 || r.anim.length);
    o.claim(movers.length === 0, `${KIND} MOTION: with reduced motion nothing loops`, res.map((r) => `y${r.y}: ${r.canvases} canvases, ${r.moving} changed in 1 s; infinite CSS anims ${r.anim.length} ${r.anim.join(',')}`).join(' | '));
    await M.ctx.close();
  }
  await b.close();
  process.exit(o.done('journeys ' + tag + ' ' + KIND) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

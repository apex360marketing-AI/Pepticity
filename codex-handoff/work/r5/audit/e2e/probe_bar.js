// Is the phone JOIN bar invisible but still catching taps over the Founders email field? usage: node probe_bar.js <url>
const L = require('./lib'); const o = L.out();
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'phone', process.argv[2]);
  await page.waitForFunction(() => document.querySelector('[data-hooks-armed]'), null, { timeout: 60000 }).catch(() => {});
  await page.evaluate(() => { const e = document.querySelector('#pep-hooks-card-email'); e.scrollIntoView({ block: 'end' }); });
  for (let k = 0; k < 4; k++) {
    await page.waitForFunction(() => new Promise((r) => setTimeout(() => r(true), 1000)), null, { timeout: 5000 });
    const r = await page.evaluate(() => { const bar = document.querySelector('.pep-hooks-bar'); const cs = getComputedStyle(bar); const e = document.querySelector('#pep-hooks-card-email'); const bb = e.getBoundingClientRect(); const t = document.elementFromPoint(bb.left + 20, bb.top + bb.height / 2); let op = 1, n = t; while (n && n.nodeType === 1) { op *= parseFloat(getComputedStyle(n).opacity); n = n.parentElement; }
      return { on: bar.hasAttribute('data-on'), opacity: cs.opacity, vis: cs.visibility, pe: cs.pointerEvents, tf: cs.transform, br: [bar.getBoundingClientRect().top, bar.getBoundingClientRect().bottom].map(Math.round), field: Math.round(bb.top) + '..' + Math.round(bb.bottom), hit: t.tagName + '.' + String(t.className).split(' ')[0], hitOpacity: op.toFixed(2), hitPE: getComputedStyle(t).pointerEvents }; });
    console.log('note   t+' + (k + 1) + 's ' + JSON.stringify(r));
    if (k === 3) {
      // real tap at that point: does the email field get focus?
      const bb = await page.evaluate(() => { const b = document.querySelector('#pep-hooks-card-email').getBoundingClientRect(); return [b.left + 20, b.top + b.height / 2]; });
      await page.evaluate(() => document.activeElement && document.activeElement.blur());
      await page.touchscreen.tap(bb[0], bb[1]); await L.frames(page, 10);
      const f = await page.evaluate(() => document.activeElement ? document.activeElement.tagName + '#' + document.activeElement.id + '.' + String(document.activeElement.className).split(' ')[0] : 'none');
      o.claim(/pep-hooks-card-email/.test(f), 'phone: a tap on the Founders email field focuses it', `tap at ${bb.map(Math.round)} focused ${f}; hit before tap ${r.hit} opacity ${r.hitOpacity} pointer-events ${r.hitPE}`);
      await L.shot(page, 'rc5-bar-tap.png');
    }
  }
  await ctx.close(); await b.close(); process.exit(o.done('probe_bar') ? 1 : 0); })();

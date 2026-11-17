// what is drawn at given points on iPhone 13 at y=0? usage: node probe_at.js <url> x,y [x,y...]
const L = require('./lib');
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'phone', process.argv[2]);
  await page.waitForFunction(() => document.querySelector('[data-hooks-armed]'), null, { timeout: 60000 }).catch(() => {});
  for (const p of process.argv.slice(3)) { const [x, y] = p.split(',').map(Number);
    const r = await page.evaluate(([x, y]) => document.elementsFromPoint(x, y).slice(0, 5).map((e) => { let n = e, fx = ''; while (n) { const ps = getComputedStyle(n).position; if (ps === 'fixed') { fx = ' [in fixed ' + n.tagName + '.' + String(n.className).split(' ')[0] + ']'; break; } n = n.parentElement; } return e.tagName + '.' + String(e.className).split(' ')[0] + fx; }), [x, y]);
    console.log('note   ' + p + ': ' + r.join(' > ')); }
  await ctx.close(); await b.close(); })();

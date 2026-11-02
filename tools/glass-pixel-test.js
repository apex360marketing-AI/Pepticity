// clear-glass-spec pixel test (glass layer only: card children hidden vs card hidden): screenshot with the glass element, again with it hidden; sample 20 points inside it; report mean difference and colour shift.
const { chromium } = require('playwright'); const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
const zlib = require('zlib');
function decode(buf) { // minimal PNG decoder via playwright page? use canvas in browser instead
  return null; }
(async () => {
  const targets = [['10-command', '.cmd.glass'], ['07-desk', '.dk-p.glass'], ['12-one-line', '.ol-strip.glass'], ['13-p-looks', '.pl-chat.glass'], ['index', 'a.card.glass']];
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const c = await b.newContext({ viewport: { width: 1440, height: 900 } }); const p = await c.newPage();
  for (const [slug, sel] of targets) {
    await p.goto('http://127.0.0.1:8765/' + (slug === 'index' ? '' : slug + '/')); await p.waitForTimeout(1800);
    const el = p.locator(sel).first(); await el.scrollIntoViewIfNeeded(); await p.waitForTimeout(500); const box = await el.boundingBox();
    const clip = { x: Math.max(0, box.x), y: Math.max(0, box.y), width: Math.min(box.width, 1440 - box.x), height: Math.min(box.height, 900 - box.y) };
    await el.evaluate(e => { [...e.children].forEach(c => { c.dataset.v = c.style.visibility; c.style.visibility = 'hidden'; }); }); await p.waitForTimeout(250); const a = await p.screenshot({ clip }); await el.evaluate(e => { e.style.visibility = 'hidden'; }); await p.waitForTimeout(300); const h = await p.screenshot({ clip }); await el.evaluate(e => { e.style.visibility = ''; [...e.children].forEach(c => { c.style.visibility = c.dataset.v || ''; }); });
    const res = await p.evaluate(async ([A, H]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => { const c = document.createElement('canvas'); c.width = i.width; c.height = i.height; const x = c.getContext('2d'); x.drawImage(i, 0, 0); r(x.getImageData(0, 0, i.width, i.height)); }; i.src = 'data:image/png;base64,' + s; });
      const ia = await ld(A), ih = await ld(H); let n = 0, d = 0, dr = 0, db = 0; for (let k = 0; k < 20; k++) { const x = Math.floor(ia.width * (0.1 + 0.8 * ((k * 0.381) % 1))), y = Math.floor(ia.height * (0.1 + 0.8 * ((k * 0.618) % 1))), o = (y * ia.width + x) * 4; d += (Math.abs(ia.data[o] - ih.data[o]) + Math.abs(ia.data[o + 1] - ih.data[o + 1]) + Math.abs(ia.data[o + 2] - ih.data[o + 2])) / 3; dr += ia.data[o] - ih.data[o]; db += ia.data[o + 2] - ih.data[o + 2]; n++; }
      return { meanAbsDiff: +(d / n).toFixed(2), redShift: +(dr / n).toFixed(2), blueShift: +(db / n).toFixed(2) }; }, [a.toString('base64'), h.toString('base64')]);
    const ok = res.meanAbsDiff < 14 && Math.abs(res.blueShift - res.redShift) < 5;
    console.log((ok ? 'PASS ' : 'FAIL ') + slug.padEnd(12) + sel.padEnd(18) + JSON.stringify(res));
  }
  await b.close();
})();

/* SELECTION STUDIO · library B · interaction proof.
   The smoke ground ripples under the pointer, so a plain before/after screenshot would always differ.
   Here the module is paused AND the smoke canvas is hidden, so only the module's own hover / press / drag can change pixels.
   A negative control (pointer over a non-interactive label) must show NO change, proving the check can fail.
   Results: modules/_shots/b/verify-interact.json   Run: node _verify-interact.js [buttons|cards|type|CODE,CODE] */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.join(HERE, '_shots', 'b');
const BASE = process.env.BASE || 'http://127.0.0.1:8791/modules/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const man = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest-b.json'), 'utf8')).modules;
const TARGET = {
  'PEP-CRD-01': '#mcard', 'PEP-CRD-02': '.lw:nth-child(3) .card', 'PEP-CRD-03': '#dial', 'PEP-CRD-04': '#ch', 'PEP-CRD-05': '#pc', 'PEP-CRD-06': '#dwNext',
  'PEP-CRD-07': '.cw', 'PEP-CRD-08': '#lg', 'PEP-CRD-09': '#scene', 'CRD-127': '#deck', 'CRD-124': '#pane', 'CRD-130': '.door.l',
  'PEP-TYP-01': '#sheet', 'PEP-TYP-02': '#wm', 'PEP-TYP-03': '#hl', 'PEP-TYP-04': '#wm', 'PEP-TYP-05': '.slot.hl'
};
const CONTROL = { buttons: '.pm-cap', cards: '.pm-tag', type: '.pm-tag' };
const CLICKY = new Set(['PEP-BTN-04', 'BTN-101', 'PEP-BTN-10', 'PEP-CRD-03', 'PEP-CRD-06', 'CRD-127', 'CRD-130', 'PEP-CRD-05']);
const arg = process.argv[2] || '';
const list = man.filter(e => !arg || e.cat === arg || arg.split(',').includes(e.code));
const sleep = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const RF = path.join(OUT, 'verify-interact.json');
  const res = fs.existsSync(RF) ? JSON.parse(fs.readFileSync(RF, 'utf8')) : {};
  for (const e of list) {
    const heavy = e.weight === 'Heavy' || e.code === 'PEP-CRD-02', sel = TARGET[e.code] || '.pri', r = { errors: [] };
    const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } }); const page = await ctx.newPage();
    page.on('pageerror', x => r.errors.push(x.message));
    try {
      await page.goto(BASE + e.file, { waitUntil: 'networkidle' }); await sleep(heavy ? 4200 : 1500);
      await page.evaluate(() => PM.pause());
      await page.addStyleTag({ content: '.pm-bg canvas[data-smoke],.pm-bg canvas{visibility:hidden!important}' });
      await page.mouse.move(3, 3); await sleep(heavy ? 2500 : 1400);
      const clipOf = bb => ({ x: Math.max(0, bb.x - 30), y: Math.max(0, bb.y - 30), width: Math.min(1440 - Math.max(0, bb.x - 30), bb.width + 60), height: Math.min(900 - Math.max(0, bb.y - 30), bb.height + 60) });
      // negative control: a label that does nothing
      const cel = await page.$(CONTROL[e.cat]); const cbb = cel && await cel.boundingBox();
      if (cbb) { const c0 = await page.screenshot({ clip: clipOf(cbb) }); await page.mouse.move(cbb.x + cbb.width / 2, cbb.y + cbb.height / 2, { steps: 4 }); await sleep(800); const c1 = await page.screenshot({ clip: clipOf(cbb) }); r.controlStill = c0.equals(c1); await page.mouse.move(3, 3); await sleep(900); }
      const el = await page.$(sel); const bb = await el.boundingBox(); const clip = clipOf(bb);
      const cx = bb.x + bb.width * .62, cy = bb.y + bb.height * .5;
      const s0 = await page.screenshot({ clip });
      await page.mouse.move(cx - 120, cy, { steps: 2 }); await page.mouse.move(cx, cy, { steps: 6 }); await sleep(950);
      const s1 = await page.screenshot({ clip }); r.hover = !s0.equals(s1);
      if (e.interact === 'drag') {
        await page.mouse.down(); for (let i = 1; i <= 12; i++) { await page.mouse.move(cx - i * 22, cy + Math.sin(i / 2) * 18); await sleep(30); }
        await sleep(300); const s2 = await page.screenshot({ clip }); await page.mouse.up(); r.drag = !s1.equals(s2);
      } else if (e.interact === 'scroll') {
        await page.evaluate(() => { document.getElementById('sc').scrollTop = 0; }); await sleep(600); const a = await page.screenshot();
        await page.mouse.wheel(0, 700); await sleep(2600); const b = await page.screenshot(); r.scroll = !a.equals(b);
      } else {
        await page.mouse.down(); await sleep(CLICKY.has(e.code) ? 120 : 320); let s2 = await page.screenshot({ clip });
        if (CLICKY.has(e.code)) { await page.mouse.up(); await sleep(650); const s3 = await page.screenshot({ clip }); r.press = !s1.equals(s2) || !s1.equals(s3); }
        else { r.press = !s1.equals(s2); await page.mouse.up(); }
      }
    } catch (err) { r.errors.push('verifier: ' + err.message.split('\n')[0]); }
    await ctx.close();
    res[e.code] = r; fs.writeFileSync(RF, JSON.stringify(res, null, 1));
    console.log(e.code.padEnd(11), JSON.stringify(r));
  }
  await browser.close();
})();

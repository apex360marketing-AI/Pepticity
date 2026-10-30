/* SELECTION STUDIO · library B verifier (buttons, glass cards, type).
   For every module in manifest-b.json:
     A. standalone 1440x900: no errors, runtime up, ambient clock runs, picture changes over time,
        hover and press states change the picture (checked with the module paused so only the interaction moves),
        scroll / drag / wipe modules are driven for real
     B. ?acc=red re-tint (computed accent + hover screenshot)
     C. phone 390x844 with touch: no sideways scroll, touch hint, a tap works
     D. iframe at the studio tile size: ready message, waits for play, play/pause, live re-tint by postMessage
     E. reduced motion: fallback active, no errors
   Screenshots: modules/_shots/b/<CODE>-*.png ; results: modules/_shots/b/verify.json
   Run: node sites/selection-studio/modules/_verify.js [buttons|cards|type|CODE,CODE] (needs a static server on BASE) */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const HERE = __dirname, OUT = path.join(HERE, '_shots', 'b');
const BASE = process.env.BASE || 'http://127.0.0.1:8791/modules/';
const EXE = process.env.CHROME || '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome';
const man = JSON.parse(fs.readFileSync(path.join(HERE, 'manifest-b.json'), 'utf8')).modules;
const VW = { buttons: 520, cards: 640, type: 760 };
const TARGET = {
  'PEP-CRD-01': '#mcard', 'PEP-CRD-02': '.lw:nth-child(3) .card', 'PEP-CRD-03': '#dial', 'PEP-CRD-04': '#ch', 'PEP-CRD-05': '#pc', 'PEP-CRD-06': '#dwNext',
  'PEP-CRD-07': '.cw', 'PEP-CRD-08': '#lg', 'PEP-CRD-09': '#scene', 'CRD-127': '#deck', 'CRD-124': '#pane', 'CRD-130': '.door.l',
  'PEP-TYP-01': '#sheet', 'PEP-TYP-02': '#wm', 'PEP-TYP-03': '#hl', 'PEP-TYP-04': '#wm', 'PEP-TYP-05': '.slot.hl'
};
const PRESS_IS_CLICK = new Set(['PEP-BTN-04', 'BTN-101', 'PEP-BTN-10', 'PEP-CRD-03', 'PEP-CRD-06', 'CRD-127', 'CRD-130', 'PEP-CRD-05']);
const arg = process.argv[2] || '';
const list = man.filter(e => !arg || e.cat === arg || arg.split(',').includes(e.code));
fs.mkdirSync(OUT, { recursive: true });
const ARGS = ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const sleep = ms => new Promise(r => setTimeout(r, ms));
const same = (a, b) => a.length === b.length && a.equals(b);

async function errsOf(page, bag) {
  page.on('pageerror', e => bag.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource/.test(m.text())) bag.push('console: ' + m.text()); });
  page.on('response', res => { if (res.status() >= 400) bag.push('http ' + res.status() + ': ' + res.url()); });
  page.on('requestfailed', rq => { const t = (rq.failure() || {}).errorText || ''; if (!/ERR_ABORTED/.test(t)) bag.push('failed: ' + rq.url() + ' ' + t); });
}
async function box(page, sel) { const el = await page.$(sel); if (!el) return null; return await el.boundingBox(); }
async function crop(page, bb) {
  const pad = 30, vp = page.viewportSize();
  const x = Math.max(0, bb.x - pad), y = Math.max(0, bb.y - pad);
  return await page.screenshot({ clip: { x, y, width: Math.min(vp.width - x, bb.width + pad * 2), height: Math.min(vp.height - y, bb.height + pad * 2) } });
}

(async () => {
  const browser = await chromium.launch({ executablePath: EXE, args: ARGS });
  const RF = path.join(OUT, 'verify' + (arg && !arg.includes(',') ? '-' + arg : '') + '.json');
  const results = fs.existsSync(RF) ? JSON.parse(fs.readFileSync(RF, 'utf8')) : {};
  for (const e of list) {
    const heavy = e.weight === 'Heavy' || e.code === 'PEP-CRD-02', W8 = heavy ? 4200 : 1400, sel = TARGET[e.code] || '.pri';
    const r = { code: e.code, cat: e.cat, interact: e.interact, errors: [], checks: {} };
    const shot = n => path.join(OUT, `${e.code}-${n}.png`);
    try {
      /* ---------- A. desktop ---------- */
      let ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      let page = await ctx.newPage(); await errsOf(page, r.errors);
      await page.goto(BASE + e.file, { waitUntil: 'networkidle' }); await sleep(W8);
      const st = await page.evaluate(() => ({ pm: !!window.PM, playing: window.PM && PM.playing, code: window.PM && PM.code, t: window.PM ? PM.t : -1 }));
      await sleep(heavy ? 5000 : 2000);
      const t2 = await page.evaluate(() => window.PM ? PM.t : -1);
      r.checks.runtime = st.pm && st.playing && st.code === e.code;
      r.checks.ambientClock = t2 > st.t;
      const a1 = await page.screenshot(); await page.screenshot({ path: shot('d-rest') });
      await sleep(1100); const a2 = await page.screenshot();
      r.checks.changesOverTime = !same(a1, a2);
      r.checks.scrollWidth1440 = await page.evaluate(() => document.documentElement.scrollWidth === innerWidth);
      // interaction with the module paused, so only the interaction can change pixels
      await page.evaluate(() => PM.pause()); await sleep(400);
      const bb = await box(page, sel);
      if (bb) {
        const cx = bb.x + bb.width * 0.62, cy = bb.y + bb.height * 0.5;
        if (e.code === 'PEP-CRD-02') {
          await page.evaluate(() => { document.getElementById('sc').scrollTop = 0; }); await sleep(500);
          const s0 = await page.evaluate(() => [document.getElementById('sc').scrollTop, [...document.querySelectorAll('.halo .ht,.halo .hb')].map(x => x.style.opacity).join()]);
          await page.mouse.move(720, 450); await page.mouse.wheel(0, 700); await sleep(2600);
          const s1 = await page.evaluate(() => [document.getElementById('sc').scrollTop, [...document.querySelectorAll('.halo .ht,.halo .hb')].map(x => x.style.opacity).join()]);
          r.checks.scrollAdvances = s1[0] > s0[0]; r.checks.scrollLightsCards = s1[1] !== s0[1];
          await page.screenshot({ path: shot('d-scroll') });
        }
        const before = await crop(page, bb);
        await page.mouse.move(cx - 120, cy, { steps: 2 }); await page.mouse.move(cx, cy, { steps: 6 }); await sleep(950);
        const hov = await crop(page, bb); r.checks.hoverResponds = !same(before, hov);
        await page.screenshot({ path: shot('d-hover') });
        if (e.interact === 'drag' || e.code === 'CRD-124') {
          const sig0 = await crop(page, bb);
          await page.mouse.down(); for (let i = 1; i <= 12; i++) { await page.mouse.move(cx - i * 22, cy + Math.sin(i / 2) * 18); await sleep(30); }
          await sleep(250); const sig1 = await crop(page, bb); await page.screenshot({ path: shot('d-drag') }); await page.mouse.up(); await sleep(400);
          r.checks.dragResponds = !same(sig0, sig1);
        } else {
          await page.mouse.down(); await sleep(PRESS_IS_CLICK.has(e.code) ? 120 : 320);
          const pr = await crop(page, bb);
          if (PRESS_IS_CLICK.has(e.code)) { await page.mouse.up(); await sleep(650); }
          const pr2 = await crop(page, bb);
          const pressMatters = e.cat === 'buttons' || PRESS_IS_CLICK.has(e.code) || e.interact === 'tap';
          if (pressMatters) r.checks.pressResponds = !same(hov, pr) || !same(hov, pr2); else r.pressChanged = !same(hov, pr) || !same(hov, pr2);
          await page.screenshot({ path: shot('d-press') });
          if (!PRESS_IS_CLICK.has(e.code)) await page.mouse.up();
          if (e.code === 'PEP-BTN-14') { await page.mouse.down(); await sleep(1500); r.checks.holdCompletes = await page.evaluate(() => document.querySelector('.hold.pri').classList.contains('ok')); await page.screenshot({ path: shot('d-hold') }); await page.mouse.up(); }
        }
        // keyboard focus is visible
        await page.mouse.move(5, 5); await page.evaluate(() => { const b = document.body; if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); b.setAttribute('tabindex', '-1'); b.focus(); b.removeAttribute('tabindex'); }); await page.keyboard.press('Tab'); await sleep(450);
        await page.screenshot({ path: shot('d-focus') });
        r.checks.focusVisible = await page.evaluate(() => { const a = document.activeElement; return !!a && a !== document.body; });
      } else r.errors.push('no target ' + sel);
      await ctx.close();

      /* ---------- B. ?acc=red ---------- */
      ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      page = await ctx.newPage(); await errsOf(page, r.errors);
      await page.goto(BASE + e.file + '?acc=red', { waitUntil: 'networkidle' }); await sleep(W8);
      r.checks.queryAccent = await page.evaluate(() => document.documentElement.dataset.acc === 'red' && /255,\s*0,\s*79/.test(getComputedStyle(document.documentElement).getPropertyValue('--acc') || '') || getComputedStyle(document.documentElement).getPropertyValue('--acc').trim().toUpperCase() === '#FF004F');
      const bb2 = await box(page, sel); if (bb2) { await page.mouse.move(bb2.x + bb2.width * .3, bb2.y + bb2.height * .5); await page.mouse.move(bb2.x + bb2.width * .6, bb2.y + bb2.height * .5, { steps: 5 }); await sleep(900); }
      await page.screenshot({ path: shot('acc-red') });
      await ctx.close();

      /* ---------- C. phone + touch ---------- */
      ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
      page = await ctx.newPage(); await errsOf(page, r.errors);
      await page.goto(BASE + e.file, { waitUntil: 'networkidle' }); await sleep(W8);
      r.checks.scrollWidth390 = await page.evaluate(() => document.documentElement.scrollWidth === 390);
      r.checks.touchHint = await page.evaluate(() => { const h = document.querySelector('.pm-hint'); return !!h && !/HOVER/.test(h.textContent); });
      await page.screenshot({ path: shot('m') });
      const bb3 = await box(page, sel); if (bb3) { await page.touchscreen.tap(bb3.x + bb3.width / 2, bb3.y + bb3.height / 2); await sleep(700); await page.screenshot({ path: shot('m-tap') }); }
      await ctx.close();

      /* ---------- D. iframe at studio tile size ---------- */
      const vw = VW[e.cat], vh = Math.round(vw / 1.6);
      ctx = await browser.newContext({ viewport: { width: vw + 40, height: vh + 40 } });
      page = await ctx.newPage(); await errsOf(page, r.errors);
      await page.goto(BASE + '_verify-frame.html?src=' + encodeURIComponent(e.file) + '&w=' + vw + '&h=' + vh, { waitUntil: 'networkidle' }); await sleep(W8);
      const fr = page.frames().find(f => f.url().includes(e.file));
      r.checks.iframeReady = await page.evaluate(() => window.__msgs.some(m => m && m.event === 'ready'));
      r.checks.iframeWaitsForPlay = await fr.evaluate(() => PM.inFrame && !PM.playing);
      await page.evaluate(() => document.querySelector('iframe').contentWindow.postMessage({ cmd: 'play' }, '*')); await sleep(900);
      const p1 = await fr.evaluate(() => [PM.playing, PM.t]); await sleep(heavy ? 4000 : 1500); const p2 = await fr.evaluate(() => PM.t);
      r.checks.iframePlay = p1[0] && p2 > p1[1];
      await page.evaluate(() => document.querySelector('iframe').contentWindow.postMessage({ acc: 'blue', hex: '#0066FF', name: 'BLUE' }, '*')); await sleep(900);
      r.checks.iframeRetint = await fr.evaluate(() => document.documentElement.dataset.acc === 'blue');
      await page.screenshot({ path: shot('iframe-blue') });
      await page.evaluate(() => document.querySelector('iframe').contentWindow.postMessage({ acc: 'platinum' }, '*')); await sleep(500);
      r.checks.iframeRetintPlatinum = await fr.evaluate(() => document.documentElement.dataset.acc === 'platinum');
      await page.evaluate(() => document.querySelector('iframe').contentWindow.postMessage({ cmd: 'pause' }, '*')); await sleep(300);
      r.checks.iframePause = await fr.evaluate(() => !PM.playing && document.documentElement.classList.contains('is-paused'));
      await ctx.close();

      /* ---------- E. reduced motion ---------- */
      ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
      page = await ctx.newPage(); await errsOf(page, r.errors);
      await page.goto(BASE + e.file, { waitUntil: 'networkidle' }); await sleep(W8);
      r.checks.reducedMotion = await page.evaluate(() => PM.RM && document.documentElement.classList.contains('rm'));
      const bb4 = await box(page, sel); if (bb4) { await page.mouse.move(bb4.x + bb4.width * .6, bb4.y + bb4.height * .5, { steps: 4 }); await sleep(600); }
      await page.screenshot({ path: shot('rm') });
      await ctx.close();
    } catch (err) { r.errors.push('verifier: ' + err.message.split('\n')[0]); }
    r.errors = [...new Set(r.errors)];
    r.pass = !r.errors.length && Object.values(r.checks).every(Boolean);
    results[e.code] = r;
    fs.writeFileSync(RF, JSON.stringify(results, null, 1));
    const bad = Object.entries(r.checks).filter(([, v]) => !v).map(([k]) => k);
    console.log(`${r.pass ? 'PASS' : 'FAIL'} ${e.code.padEnd(11)} ${bad.length ? 'failed: ' + bad.join(',') : ''} ${r.errors.length ? 'errors: ' + r.errors.join(' | ') : ''}`);
  }
  await browser.close();
})();

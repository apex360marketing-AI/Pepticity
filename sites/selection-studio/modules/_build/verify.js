// SELECTION STUDIO · manifest-a contract check (Playwright). node verify.js [CODE,CODE,...]
// For every module: standalone 1440x900 + 390x844, inside an iframe (studio-style query), reduced motion.
// Checks: no page/console errors or failed requests, no sideways scroll, it changes over time while playing, the
// interaction answers (scroll / hover / drag / tap), postMessage {acc} re-tints, {cmd:'pause'} freezes, {cmd:'play'} resumes,
// embedded starts paused and posts {pep:'ready'}. Screens to modules/_shots/. Results to _shots/verify-<batch>.json.
const { chromium } = require('playwright');
const fs = require('fs');
const BASE = 'http://127.0.0.1:8811/modules/';
const SHOTS = __dirname + '/../_shots/';
const man = JSON.parse(fs.readFileSync(__dirname + '/../manifest-a.json', 'utf8')).modules;
const only = (process.argv[2] || '').split(',').filter(Boolean);
const list = only.length ? man.filter(m => only.includes(m.code)) : man;
const tag = process.argv[3] || 'all';
const sleep = ms => new Promise(r => setTimeout(r, ms));

(async () => {
  const proxy = process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined;
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', proxy,
    args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--proxy-bypass-list=127.0.0.1;localhost'] });
  const results = [];
  for (const m of list) {
    const R = { code: m.code, file: m.file, interact: m.interact, errs: [], checks: {} };
    const ok = (k, v, note) => { R.checks[k] = note !== undefined ? { ok: !!v, note } : !!v; };
    const watch = (p, where) => {
      p.on('pageerror', e => R.errs.push(where + ' PE ' + e.message.slice(0, 200)));
      p.on('console', c => { if (c.type() === 'error') R.errs.push(where + ' CE ' + c.text().slice(0, 200)); });
      p.on('response', r => { if (r.status() >= 400) R.errs.push(where + ' HTTP ' + r.status() + ' ' + r.url().slice(0, 120)); });
      p.on('requestfailed', r => R.errs.push(where + ' RF ' + r.url().slice(0, 120)));
    };
    const scrollTo = (p, y) => p.evaluate(y => { const s = document.querySelector('.fx-scroller'); if (s) s.scrollTop = y * (s.scrollHeight - s.clientHeight); return !!s; }, y);
    const shot = (p, n) => p.screenshot({ path: SHOTS + m.code + '-' + n + '.png' });
    try {
      /* ---------- 1. standalone desktop ---------- */
      {
        const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, ignoreHTTPSErrors: true });
        const p = await ctx.newPage(); watch(p, 'D');
        await p.goto(BASE + m.file, { waitUntil: 'load', timeout: 90000 });
        await sleep(m.code.startsWith('PEP-ENT') || m.code === 'TRN-03' ? 2500 : 4500);
        const sw = await p.evaluate(() => document.documentElement.scrollWidth);
        ok('desktop-scrollWidth-1440', sw === 1440, sw);
        const st = await p.evaluate(() => ({ playing: FX.playing, code: FX.code, embedded: FX.embedded }));
        ok('standalone-autoplays', st.playing && !st.embedded);
        await shot(p, 'd-top');
        /* changes over time while playing */
        const a1 = await p.screenshot(); await sleep(1300); const a2 = await p.screenshot();
        ok('animates-over-time', !a1.equals(a2));
        /* interaction */
        const before = await p.screenshot();
        if (m.interact === 'scroll') {
          await scrollTo(p, 0.5); await sleep(2600); await shot(p, 'd-mid');
          const mid = await p.screenshot();
          await scrollTo(p, 1); await sleep(2600); await shot(p, 'd-end');
          ok('scroll-advances-scene', !before.equals(mid));
          await scrollTo(p, 0.5); await sleep(1500);
        } else if (m.code === 'HOV-17') {
          await p.mouse.move(700, 450); await sleep(800);
          const xy = await p.evaluate(() => window.__fx3d && window.__fx3d.cityXY(8));
          if (xy) { await p.mouse.move(xy[0], xy[1], { steps: 6 }); await sleep(1600); }
          const hov = await p.evaluate(() => window.__fx3d ? window.__fx3d.hover : -2);
          await shot(p, 'd-hover'); ok('hover-lights-a-city', hov >= 0, 'hover=' + hov);
          await p.mouse.move(xy[0] - 300, xy[1] + 100); await p.mouse.down(); await p.mouse.move(xy[0] - 50, xy[1] + 100, { steps: 8 }); await p.mouse.up(); await sleep(800);
        } else if (m.code === 'LAY-23') {
          const box = await p.locator('.tier').nth(0).boundingBox();
          await p.mouse.move(box.x + box.width / 2, box.y + box.height / 3, { steps: 4 }); await sleep(1400);
          const on = await p.evaluate(() => document.querySelectorAll('.tier')[0].classList.contains('on'));
          await shot(p, 'd-hover'); ok('hover-raises-silver', on);
        } else if (m.cat === 'backgrounds') {
          await p.mouse.move(300, 300); await sleep(300); await p.mouse.move(1000, 600, { steps: 12 }); await sleep(900);
          const after = await p.screenshot(); await shot(p, 'd-hover'); ok('hover-answers', !before.equals(after));
        } else if (m.code === 'FRM-02') {
          const box = await p.locator('#mcard').boundingBox(); const cx = box.x + box.width / 2, cy = box.y + box.height / 2;
          await p.mouse.move(cx + 60, cy - 30, { steps: 5 }); await sleep(900);
          const tilt = await p.evaluate(() => window.__fx3d.st.tx);
          await p.mouse.move(cx, cy); await p.mouse.down(); await p.mouse.move(cx + 160, cy, { steps: 10 }); await p.mouse.up(); await sleep(1500);
          const flip = await p.evaluate(() => window.__fx3d.st.flipT);
          await p.fill('#nm', 'GRACE'); await sleep(900); await shot(p, 'd-drag');
          ok('tilts-toward-pointer', Math.abs(tilt) > 0.01, 'tx=' + tilt.toFixed(3)); ok('drag-turns-card', Math.abs(flip) > 0.1, 'flipT=' + flip.toFixed(2));
        } else if (m.code === 'PEP-EMB-01') {
          const y0 = await p.evaluate(() => window.__fx3d.yaw);
          await p.mouse.move(600, 420); await p.mouse.down(); await p.mouse.move(900, 420, { steps: 10 }); await p.mouse.up(); await sleep(600);
          const y1 = await p.evaluate(() => window.__fx3d.yaw);
          await shot(p, 'd-drag'); ok('drag-spins-coin', Math.abs(y1 - y0) > 0.8, 'dyaw=' + (y1 - y0).toFixed(2));
        } else if (m.code === 'PEP-ENT-01' || m.code === 'PEP-ENT-02') {
          await p.click('#replay'); await sleep(m.code === 'PEP-ENT-01' ? 700 : 3600);
          const act = await p.evaluate(() => window.__ent.tl && window.__ent.tl.isActive());
          await shot(p, 'd-replay'); ok('replay-runs-timeline', act);
          await sleep(4500); await shot(p, 'd-end');
        } else if (m.code === 'TRN-03') {
          await p.click('#nav button[data-i="1"]'); await sleep(480); await shot(p, 'd-wipe');
          await sleep(1600); const cur = await p.evaluate(() => document.querySelector('#cur h2').textContent);
          await shot(p, 'd-end'); ok('tap-changes-page', cur === 'THE LAB', cur);
        } else if (m.code === 'PEP-ENT-03') {
          await p.click('.tile >> nth=0'); await sleep(350); await shot(p, 'd-morph');
          await sleep(1200); const open = await p.evaluate(() => window.__ent.open);
          await shot(p, 'd-open'); ok('tap-opens-page', open, 'viewTransitions=' + (await p.evaluate(() => window.__ent.vt)));
          await p.click('#back'); await sleep(1300); ok('back-closes', !(await p.evaluate(() => window.__ent.open)));
        }
        /* accent re-tint by message */
        await p.evaluate(() => window.postMessage({ acc: 'red' }, '*')); await sleep(900);
        const acc = await p.evaluate(() => ({ v: getComputedStyle(document.documentElement).getPropertyValue('--acc').trim(), s: FX.acc.slug }));
        ok('postMessage-acc', acc.s === 'red' && (/ff004f/i.test(acc.v) || /255,\s*0,\s*79/.test(acc.v)), acc.v);
        await shot(p, 'd-acc-red');
        await p.evaluate(() => window.postMessage({ acc: 'cyan' }, '*')); await sleep(500);
        /* pause freezes, play resumes */
        await p.evaluate(() => window.postMessage({ cmd: 'pause' }, '*')); await p.mouse.move(5, 895); await sleep(2200);
        const pz = await p.evaluate(() => FX.playing);
        const f1 = await p.screenshot(); await sleep(1200); const f2 = await p.screenshot();
        ok('postMessage-pause', pz === false && f1.equals(f2), 'frozen=' + f1.equals(f2));
        await p.evaluate(() => window.postMessage({ cmd: 'play' }, '*')); await sleep(300);
        ok('postMessage-play', await p.evaluate(() => FX.playing));
        await ctx.close();
      }
      /* ---------- 2. phone ---------- */
      {
        const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2, ignoreHTTPSErrors: true });
        const p = await ctx.newPage(); watch(p, 'M');
        await p.goto(BASE + m.file, { waitUntil: 'load', timeout: 90000 }); await sleep(4000);
        const sw = await p.evaluate(() => document.documentElement.scrollWidth);
        ok('phone-scrollWidth-390', sw === 390, sw);
        if (m.interact === 'scroll') { await scrollTo(p, 0.55); await sleep(2600); }
        if (m.code === 'PEP-ENT-02') await sleep(3500);
        await shot(p, 'm');
        await ctx.close();
      }
      /* ---------- 3. inside an iframe, the way the studio embeds it ---------- */
      {
        const ctx = await b.newContext({ viewport: { width: 920, height: 600 }, ignoreHTTPSErrors: true });
        const p = await ctx.newPage(); watch(p, 'I');
        await p.goto(BASE + '_build/harness.html?m=' + encodeURIComponent(m.file), { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
        const fr = p.frames().find(f => f.url().includes(m.file));
        const s0 = await fr.evaluate(() => ({ playing: FX.playing, embedded: FX.embedded, bare: document.documentElement.classList.contains('fx-bare') }));
        const msgs = await p.evaluate(() => window.__msgs);
        ok('iframe-waits-for-play', s0.embedded && s0.playing === false);
        ok('iframe-posts-ready', msgs.some(x => x && x.pep === 'ready' && x.code === m.code));
        await p.evaluate(() => { send({ cmd: 'play' }); send({ acc: 'violet', hex: '#6F00FF', rgb: '111,0,255', name: 'VIOLET' }); });
        await sleep(m.interact === 'scroll' ? 5200 : 2500);
        const s1 = await fr.evaluate(() => ({ playing: FX.playing, acc: FX.acc.slug }));
        ok('iframe-play-and-acc', s1.playing && s1.acc === 'violet');
        if (m.interact === 'scroll') { const tp = await fr.evaluate(() => document.querySelector('.fx-scroller').scrollTop); ok('iframe-tile-tours-itself', tp > 0, 'scrollTop=' + tp); }
        await p.screenshot({ path: SHOTS + m.code + '-iframe.png', clip: { x: 0, y: 0, width: 920, height: 600 } });
        await ctx.close();
      }
      /* ---------- 4. reduced motion ---------- */
      {
        const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', ignoreHTTPSErrors: true });
        const p = await ctx.newPage(); watch(p, 'R');
        await p.goto(BASE + m.file, { waitUntil: 'load', timeout: 90000 }); await sleep(3500);
        const rm = await p.evaluate(() => FX.rm);
        if (m.interact === 'scroll') { await scrollTo(p, 0.6); await sleep(1500); }
        const r1 = await p.screenshot(); await sleep(1200); const r2 = await p.screenshot();
        ok('reduced-motion-still', rm && r1.equals(r2), 'still=' + r1.equals(r2));
        await shot(p, 'rm');
        await ctx.close();
      }
    } catch (e) { R.errs.push('VERIFY ' + String(e.message || e).slice(0, 300)); }
    R.pass = R.errs.length === 0 && Object.values(R.checks).every(v => v === true || (v && v.ok));
    results.push(R);
    console.log((R.pass ? 'PASS ' : 'FAIL ') + m.code + ' ' + JSON.stringify(R.checks) + (R.errs.length ? ' ERRS ' + JSON.stringify(R.errs.slice(0, 4)) : ''));
  }
  fs.writeFileSync(SHOTS + 'verify-' + tag + '.json', JSON.stringify(results, null, 1));
  await b.close();
})();

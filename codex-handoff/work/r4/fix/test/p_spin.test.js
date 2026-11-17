#!/usr/bin/env node
/* Owner, Nov 15: the P below the hero is 25% smaller, spins FAST when you arrive at it and stops dead, flat to the front.
   usage: node p_spin.test.js <new-build-url> <old-build-url>   -> prints PASS/FAIL lines, exit 1 on any FAIL */
'use strict';
const { chromium } = require('playwright');
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const NEW = process.argv[2], OLD = process.argv[3];
let fails = 0;
const check = (ok, name, detail) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' · ' + detail); };

async function measure(browser, url, vp, maxSettle) {
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  const page = await ctx.newPage(); const errs = [];
  page.on('pageerror', (e) => errs.push(String(e.message)));
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(2500);
  // record the P's angle on EVERY animation frame, in the page (frame counts do not depend on how busy this machine is)
  await page.evaluate(() => { const el = document.querySelector('.pep-crest-slot'); window.__rec = [];
    (function loop() { const a = { el: el }; window.PEP.emit('logo3d:turn', a); window.__rec.push([a.ry, a.ok ? 1 : 0]); requestAnimationFrame(loop); })(); });
  const STILL = 60;                                             // frames without any movement = at rest (old build never has that: it sways)
  const state = () => page.evaluate((STILL) => { const root = document.querySelector('[data-module="crest"]'), el = document.querySelector('.pep-crest-slot'), r = el.getBoundingClientRect();
    const rec = window.__rec, n = rec.length, tail = rec.slice(-STILL).map((x) => x[0]);
    return { n: n, ok: n ? rec[n - 1][1] : 0, top: Math.round(r.top), hh: parseFloat(getComputedStyle(root).getPropertyValue('--pep-crest-hh')), still: tail.length === STILL && typeof tail[0] === 'number' && Math.max.apply(null, tail) - Math.min.apply(null, tail) < 0.0005 }; }, STILL);
  // every wait below is counted in ANIMATION FRAMES, never in seconds, so a busy machine cannot change the result
  const frames = async (k) => { const n0 = (await state()).n; await page.waitForFunction((n) => window.__rec.length >= n, n0 + k, { timeout: 0, polling: 250 }); };
  const settle = async (maxFrames) => { const n0 = (await state()).n; let st = await state(); while (!st.still && st.n - n0 < maxFrames) { await frames(10); st = await state(); } return st; };
  let s = await state();
  for (let i = 0; i < 14 && !(s.top > -200 && s.top < vp.height * 0.5); i++) { await page.mouse.move(vp.width / 2, vp.height * 0.85); await page.mouse.wheel(0, 400); await frames(40); s = await state(); }
  // the 3D engine must be live (its shaders take a while on a busy machine)
  for (let i = 0; i < 600 && !(s.ok && s.hh > 0); i++) { await page.waitForTimeout(1000); s = await state(); }
  await settle(maxSettle);
  // leave and come back, so the arrival is a real one (pointer parked low, away from the P)
  await page.mouse.wheel(0, -400); await frames(60); await settle(maxSettle);
  const start = (await state()).n;
  await page.mouse.wheel(0, 400); await frames(30);
  const st1 = await settle(maxSettle); const cut = st1.n;
  await page.evaluate(() => document.querySelector('.pep-crest-mark').click());
  await frames(12);
  const st2 = await settle(maxSettle);
  const rec = await page.evaluate(() => window.__rec.map((x) => x[0]));
  await ctx.close();
  return { size: s.hh, arrival: rec.slice(start, cut), click: rec.slice(cut - 1), settled1: st1.still, settled2: st2.still, errs };
}
const TAU = Math.PI * 2;
function analyse(ry) {
  ry = ry.filter((v) => typeof v === 'number');
  let first = -1, lastMove = -1, maxStep = 0;
  for (let i = 1; i < ry.length; i++) { const d = Math.abs(ry[i] - ry[i - 1]); if (d > 0.0005) { if (first < 0) first = i; lastMove = i; if (d > maxStep) maxStep = d; } }
  const end = ry[ry.length - 1];
  return { turned: first < 0 ? 0 : Math.abs(end - ry[first - 1]) / TAU, frames: first < 0 ? 0 : lastMove - first + 1, maxStep, off: Math.abs(end - Math.round(end / TAU) * TAU), restFrames: ry.length - 1 - lastMove };
}
(async () => {
  const b = await chromium.launch(LAUNCH);
  for (const [name, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const n = await measure(b, NEW, vp, 400);
    const o = await measure(b, OLD, vp, 200);
    const ratio = n.size / o.size;
    check(Math.abs(ratio - 0.75) <= 0.02, `${name} size`, `P half-height ${o.size.toFixed(1)} px -> ${n.size.toFixed(1)} px = ${(ratio * 100).toFixed(1)}% (want 75%)`);
    const a = analyse(n.arrival), c = analyse(n.click), oa = analyse(o.arrival);
    // 2 turns in 1.3 s of animation time = 78 frames at 60 a second (fewer when frames are dropped: each frame then covers more)
    check(n.settled1 && Math.abs(a.turned - 2) <= 0.01, `${name} arrival: two full turns`, `turned ${a.turned.toFixed(3)} turns, came to rest: ${n.settled1} (old build came to rest: ${o.settled1}, turned ${oa.turned.toFixed(2)})`);
    check(a.frames >= 15 && a.frames <= 90, `${name} fast`, `the whole spin took ${a.frames} frames (1.3 s is 78 frames at 60 a second); fastest frame ${(a.maxStep * 180 / Math.PI).toFixed(0)} deg`);
    check(a.off <= 0.0005 && a.restFrames >= 60, `${name} stops flat`, `rests ${a.off.toFixed(5)} rad off dead front and did not move for the next ${a.restFrames} frames`);
    check(n.settled2 && Math.abs(c.turned - 2) <= 0.01 && c.off <= 0.0005 && c.frames <= 90, `${name} click`, `click: ${c.turned.toFixed(3)} turns in ${c.frames} frames, rests ${c.off.toFixed(5)} rad off front`);
    check(n.errs.length === 0, `${name} no errors`, n.errs.length ? n.errs.join(' | ') : '0 page errors');
  }
  await b.close(); console.log(fails ? `-- ${fails} FAIL --` : '-- all PASS --'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

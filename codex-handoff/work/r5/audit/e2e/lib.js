'use strict';
/* shared helpers for the e2e audit. Nothing here writes outside this folder. */
const { chromium, devices } = require('playwright');
const path = require('path');
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const HERE = __dirname;
const SHOTS = path.join(HERE, 'shots');
const CTX = {
  desktop: () => ({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 }),
  phone: () => Object.assign({}, devices['iPhone 13'], { deviceScaleFactor: 1 }),
};
function out() { let broken = 0, safe = 0; return {
  claim(ok, name, detail) { if (ok) safe++; else broken++; console.log((ok ? 'safe   ' : 'BROKEN ') + name + ' | ' + detail); return ok; },
  note(t) { console.log('note   ' + t); },
  done(tag) { console.log(`-- ${tag || ''} ${broken} BROKEN, ${safe} safe --`); return broken; } }; }
async function open(browser, kind, url, opt) {
  opt = opt || {};
  const base = typeof kind === 'string' ? CTX[kind]() : kind;
  const ctx = await browser.newContext(Object.assign({}, base, opt.ctx || {}));
  await ctx.addInitScript((skip) => {
    if (skip) { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} }
    window.__csp = [];
    document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI + ' @' + (e.sourceFile || '') + ':' + (e.lineNumber || '')));
  }, opt.entrance ? false : true);
  if (opt.init) { await ctx.addInitScript(opt.init, opt.initArg); }
  const page = await ctx.newPage();
  const rec = { console: [], pageerror: [], failed: [], bad: [], requests: [] };
  page.on('console', (m) => { if (m.type() === 'error') rec.console.push(m.text().slice(0, 300)); });
  page.on('pageerror', (e) => rec.pageerror.push(String(e.message).slice(0, 300)));
  page.on('requestfailed', (r) => rec.failed.push(r.method() + ' ' + r.url() + ' ' + (r.failure() ? r.failure().errorText : '')));
  page.on('response', (r) => { if (r.status() >= 400) rec.bad.push(r.status() + ' ' + r.url()); });
  page.on('request', (r) => rec.requests.push(r.method() + ' ' + r.url()));
  if (opt.cpu) { const cdp = await ctx.newCDPSession(page); await cdp.send('Emulation.setCPUThrottlingRate', { rate: opt.cpu }); rec.cdp = cdp; }
  if (url) {
    await page.goto(url, { waitUntil: 'load', timeout: 180000 });
    await page.waitForFunction(() => window.PEP && window.PEP.status && Object.keys(window.PEP.status).length > 5, null, { timeout: 180000 });
  }
  rec.csp = () => page.evaluate(() => window.__csp || []);
  return { ctx, page, rec };
}
/* wait for N animation frames in the page (never a fixed sleep) */
async function frames(page, n, timeout) {
  await page.evaluate((n) => new Promise((res) => { let k = 0; (function f() { if (++k >= n) res(); else requestAnimationFrame(f); })(); }), n).catch(() => {});
}
async function settleScroll(page) {
  // scroll position unchanged for 12 frames
  await page.evaluate(() => new Promise((res) => { let last = -1, same = 0, n = 0; (function f() { const y = Math.round(scrollY); if (y === last) same++; else { same = 0; last = y; } if (same >= 12 || ++n > 900) res(); else requestAnimationFrame(f); })(); }));
}
async function shot(page, name, opt) {
  const p = path.join(SHOTS, name);
  try { await page.screenshot(Object.assign({ path: p, timeout: 120000, animations: 'disabled' }, opt || {})); } catch (e) { console.log('note   screenshot ' + name + ' failed: ' + e.message.split('\n')[0]); }
  return p;
}
module.exports = { chromium, devices, LAUNCH, HERE, SHOTS, CTX, out, open, frames, settleScroll, shot };

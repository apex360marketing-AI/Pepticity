'use strict';
// shared helpers for the round-4 red-team repro scripts. Edits no file; nothing leaves 127.0.0.1 (the attacker parent is a Playwright route).
const { chromium } = require('playwright');
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] };
const STORE = new URL(process.argv[2] || 'http://127.0.0.1:8951/new/').href;
const ORIGIN = new URL(STORE).origin;
let broken = 0, total = 0;
function claim(ok, id, text) { total++; if (!ok) { broken++; } console.log((ok ? 'safe   ' : 'BROKEN ') + id + ' · ' + text); }
function done() { console.log(`-- ${total} claims, ${broken} BROKEN --`); process.exit(0); }
// frame `src` inside a page on http://attacker.test; returns fn(page, frame)
async function framed(browser, src, sandbox, fn) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await ctx.newPage();
  await ctx.route('http://attacker.test/**', (r) => r.fulfill({ status: 200, contentType: 'text/html',
    body: `<!doctype html><meta charset="utf-8"><body style="margin:0"><iframe ${sandbox === null ? '' : 'sandbox="' + sandbox + '"'} src="${src}" style="width:1200px;height:900px;border:0"></iframe>` }));
  try {
    await page.goto('http://attacker.test/p', { waitUntil: 'domcontentloaded' });
    let fr = null;
    for (let i = 0; i < 80 && !fr; i++) { fr = page.frames().find((f) => f !== page.mainFrame() && f.url().startsWith(ORIGIN)); if (!fr) await page.waitForTimeout(150); }
    if (!fr) throw new Error('store never loaded in the frame');
    await fr.waitForLoadState('load').catch(() => {});
    await page.waitForTimeout(2500);
    return await fn(page, fr);
  } finally { await ctx.close(); }
}
module.exports = { chromium, LAUNCH, STORE, ORIGIN, claim, done, framed };

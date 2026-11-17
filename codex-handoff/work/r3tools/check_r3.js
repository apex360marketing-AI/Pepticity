#!/usr/bin/env node
/* check_r3.js <store-url> [shots-dir]
   Round 3 security checks for the PEPTICITY store page. One test per defect, named after the defect in plain words.
   Black box: framing parents are simulated with Playwright routes (a page on "attacker.test", and a page on the store's
   OWN origin standing in for any other repository on the shared apex360marketing-ai.github.io origin). Edits no file;
   nothing leaves the store's own server. Prints "PASS <test>" or "FAIL <test> · why"; exit code = number of failures.
   Expected on the round 2 build: tests 1-5 and 8 FAIL (the defects), 6 and 7 PASS (no change for visitors; round 2 guard). */
'use strict';
const path = require('path');
const { chromium } = require('playwright');
const ARG = process.argv[2];
const SHOTS = process.argv[3] || '';
if (!ARG) { console.error('usage: node check_r3.js <store-url> [shots-dir]'); process.exit(2); }
const STORE = new URL(ARG).href.replace(/index\.html$/, '').replace(/([^/])$/, '$1/');
const ORIGIN = new URL(STORE).origin;
const HOME = new URL(new URL(STORE).pathname, ORIGIN).href;        // what the way-out link must point to, exactly
const TEXT = 'Open PEPTICITY in its own tab';
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist',
  '--disable-features=LocalNetworkAccessChecks,PrivateNetworkAccessRespectPreflightResults,BlockInsecurePrivateNetworkRequests'] };
let failures = 0;
function report(ok, name, why) { if (!ok) { failures++; } console.log(ok ? `PASS ${name}` : `FAIL ${name} · ${why}`); }

// a parent page that frames the store; `where` is 'cross' (attacker.test) or 'same' (the store's own origin)
async function framed(browser, where, suffix, fn, sandbox) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 960 } });
  const page = await ctx.newPage();
  page.on('pageerror', () => {});
  const parentUrl = where === 'cross' ? 'http://attacker.test/r3' : ORIGIN + '/__r3same';
  await ctx.route(parentUrl + '**', (route) => route.fulfill({ status: 200, contentType: 'text/html',
    body: `<!doctype html><meta charset="utf-8"><title>parent</title><body style="margin:0"><iframe id="f"${sandbox ? ' sandbox="' + sandbox + '"' : ''} src="${STORE}${suffix}" style="width:1200px;height:900px;border:0"></iframe></body>` }));
  try {
    await page.goto(parentUrl, { waitUntil: 'domcontentloaded' });
    let fr = null;
    for (let i = 0; i < 80 && !fr; i++) { fr = page.frames().find((f) => f !== page.mainFrame() && f.url().indexOf(STORE) === 0); if (!fr) { await page.waitForTimeout(150); } }
    if (!fr) { throw new Error('the store never loaded in the frame'); }
    await fr.waitForLoadState('load').catch(() => {});
    await page.waitForTimeout(1500);
    return await fn(page, fr, ctx);
  } finally { await ctx.close(); }
}

// what the framed document shows: the open modal dialogs, the cover candidate, sampled hit-tests over the viewport
const SURVEY = (TEXTARG) => {
  const modals = [].slice.call(document.querySelectorAll('dialog')).filter((d) => d.open && d.matches(':modal'));
  const cover = modals.find((d) => d.textContent.trim() === TEXTARG) || null;
  const links = cover ? cover.querySelectorAll('a') : [];
  const a = links.length === 1 ? links[0] : null;
  let r = null, bg = '', hits = 0, onCover = 0;
  if (cover) {
    const b = cover.getBoundingClientRect(); r = { x: b.x, y: b.y, w: b.width, h: b.height };
    bg = getComputedStyle(cover).backgroundColor;
  }
  for (let i = 1; i <= 7; i++) {
    for (let j = 1; j <= 7; j++) {
      const el = document.elementFromPoint(innerWidth * i / 8, innerHeight * j / 8);
      hits++; if (cover && el && cover.contains(el)) { onCover++; }
    }
  }
  return { modals: modals.length, cover: !!cover, coverRect: r, vw: innerWidth, vh: innerHeight, bg, hits, onCover,
    link: a ? { href: a.href, target: a.target, rel: a.rel, text: a.textContent } : null,
    sheetOpen: !!(document.querySelector('.pep-footer-sheet') || {}).open,
    htmlInert: document.documentElement.hasAttribute('inert') };
};

(async () => {
  const browser = await chromium.launch(LAUNCH);
  try {
    // 1 ------------------------------------------------------------------------------------------------------------
    const t1 = 'a page on the same shared origin can frame the store and use it (clickjacking, state tampering)';
    await framed(browser, 'same', '', async (page, fr) => {
      const r = await fr.evaluate(() => {
        const input = document.querySelector('[data-module="hero"] input[data-consent]');
        if (input) { input.focus(); }
        return { inert: document.documentElement.hasAttribute('inert'), consentFocusable: !!input && document.activeElement === input };
      });
      report(r.inert === true && r.consentFocusable === false, t1, `html inert=${r.inert}, consent box focusable=${r.consentFocusable}`);
    }).catch((e) => report(false, t1, 'error: ' + e.message));

    // 2 ------------------------------------------------------------------------------------------------------------
    const t2 = 'another site can show the store inside its own page (scam bait)';
    await framed(browser, 'cross', '', async (page, fr) => {
      const s = await fr.evaluate(SURVEY, TEXT);
      if (SHOTS) { await page.screenshot({ path: path.join(SHOTS, 'framed-cross-origin.png') }); }
      const full = s.coverRect && Math.abs(s.coverRect.x) < 1 && Math.abs(s.coverRect.y) < 1 && s.coverRect.w >= s.vw - 1 && s.coverRect.h >= s.vh - 1;
      const ok = s.cover && full && s.bg === 'rgb(11, 11, 12)' && s.modals === 1 && s.onCover === s.hits;
      report(ok, t2, `cover=${s.cover} fullViewport=${!!full} background=${s.bg || '-'} openModals=${s.modals} pointsOnCover=${s.onCover}/${s.hits}`);
    }).catch((e) => report(false, t2, 'error: ' + e.message));

    // 3 ------------------------------------------------------------------------------------------------------------
    const t3 = 'framed, there is no safe way out to the real store (link missing, unsafe, or not keyboard-reachable)';
    await framed(browser, 'cross', '?r3=attacker-chosen#privacy', async (page, fr) => {
      const s = await fr.evaluate(SURVEY, TEXT);
      const l = s.link;
      const rel = l ? l.rel.split(/\s+/) : [];
      let keyboard = false, ring = '';
      if (l) {
        await page.evaluate(() => { document.activeElement && document.activeElement.blur(); document.body.focus(); });
        for (let i = 0; i < 4 && !keyboard; i++) {
          await page.keyboard.press('Tab');
          const st = await fr.evaluate((T) => { const a = document.activeElement; const on = !!a && a.tagName === 'A' && a.textContent === T;
            return { on, ring: on ? getComputedStyle(a).outlineStyle + ' ' + getComputedStyle(a).outlineWidth : '' }; }, TEXT);
          keyboard = st.on; ring = st.ring;
        }
      }
      const ok = !!l && l.text === TEXT && l.href === HOME && l.target === '_blank' && rel.includes('noopener') && rel.includes('noreferrer')
        && /^https?:$/.test(new URL(l.href).protocol) && keyboard && /^(solid|auto|dashed|dotted|double) /.test(ring) && parseFloat(ring.split(' ')[1]) >= 2;
      report(ok, t3, l ? `href=${l.href === HOME ? 'store home (no query/hash)' : l.href} target=${l.target} rel=${l.rel} keyboard=${keyboard} focusRing=${ring || '-'}` : 'no single link in a cover');
    }).catch((e) => report(false, t3, 'error: ' + e.message));

    // 4 ------------------------------------------------------------------------------------------------------------
    const t4 = 'a sheet opened from the address (#privacy) escapes the frame guard (visible and clickable)';
    await framed(browser, 'cross', '#privacy', async (page, fr) => {
      const a = await fr.evaluate(SURVEY, TEXT);
      const clickable = await fr.evaluate(() => {
        const x = document.querySelector('.pep-footer-sheet [data-sheet-close]');
        if (!x || !x.getClientRects().length) { return false; }
        const b = x.getBoundingClientRect(); const el = document.elementFromPoint(b.x + b.width / 2, b.y + b.height / 2);
        return el === x || (!!el && x.contains(el));
      });
      // the parent re-targets the frame to another sheet (hashchange inside the store)
      await page.evaluate((u) => { document.getElementById('f').src = u; }, STORE + '#terms');
      await page.waitForTimeout(800);
      const b = await fr.evaluate(SURVEY, TEXT);
      report(!a.sheetOpen && !clickable && !b.sheetOpen && a.cover && b.cover, t4, `sheet open=${a.sheetOpen} closeButtonClickable=${clickable} afterHashChange sheet open=${b.sheetOpen} cover=${a.cover}/${b.cover}`);
    }).catch((e) => report(false, t4, 'error: ' + e.message));

    // 5 ------------------------------------------------------------------------------------------------------------
    const t5 = 'pressing Escape in the frame takes the cover away and shows the store';
    await framed(browser, 'cross', '', async (page, fr) => {
      const before = await fr.evaluate(SURVEY, TEXT);
      await fr.evaluate((T) => { const a = [].slice.call(document.querySelectorAll('dialog a')).find((x) => x.textContent === T); if (a) { a.focus(); } }, TEXT);
      for (let i = 0; i < 3; i++) { await page.keyboard.press('Escape'); await page.waitForTimeout(200); }
      const after = await fr.evaluate(SURVEY, TEXT);
      report(before.cover && after.cover && after.modals === 1, t5, `cover before=${before.cover} after 3x Escape=${after.cover} openModals=${after.modals}`);
    }).catch((e) => report(false, t5, 'error: ' + e.message));

    // 6 ------------------------------------------------------------------------------------------------------------
    const t6 = 'a real visitor (not framed) sees a change: cover, inert page, or blocked dialogs';
    {
      const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await ctx.newPage();
      page.on('pageerror', () => {});
      try {
        await page.goto(STORE + '#privacy', { waitUntil: 'load' });
        await page.waitForTimeout(1500);
        const r = await page.evaluate((T) => ({
          cover: [].slice.call(document.querySelectorAll('dialog')).some((d) => d.textContent.trim() === T),
          inert: document.documentElement.hasAttribute('inert') || document.body.hasAttribute('inert'),
          nativeShowModal: /\[native code\]/.test(HTMLDialogElement.prototype.showModal.toString()) && /\[native code\]/.test(HTMLDialogElement.prototype.show.toString()),
          sheetOpen: !!(document.querySelector('.pep-footer-sheet') || {}).open,
          extraHtmlChildren: [].slice.call(document.documentElement.children).filter((c) => !/^(HEAD|BODY)$/.test(c.tagName)).length,
        }), TEXT);
        report(!r.cover && !r.inert && r.nativeShowModal && r.sheetOpen && r.extraHtmlChildren === 0, t6,
          `cover=${r.cover} inert=${r.inert} nativeDialogs=${r.nativeShowModal} #privacy sheet opens=${r.sheetOpen} extra <html> children=${r.extraHtmlChildren}`);
      } catch (e) { report(false, t6, 'error: ' + e.message); } finally { await ctx.close(); }
    }

    // 7 ------------------------------------------------------------------------------------------------------------
    const t7 = 'another site can frame the store and press its controls (round 2 guard, kept)';
    await framed(browser, 'cross', '', async (page, fr) => {
      const r = await fr.evaluate(() => {
        const input = document.querySelector('[data-module="hero"] input[data-consent]');
        if (input) { input.focus(); }
        return { inert: document.documentElement.hasAttribute('inert'), consentFocusable: !!input && document.activeElement === input };
      });
      report(r.inert === true && r.consentFocusable === false, t7, `html inert=${r.inert}, consent box focusable=${r.consentFocusable}`);
    }).catch((e) => report(false, t7, 'error: ' + e.message));
    // 8 ------------------------------------------------------------------------------------------------------------
    const t8 = 'a SANDBOXED frame on another site still shows the store (scam bait)';
    await framed(browser, 'cross', '', async (page, fr) => {
      const s = await fr.evaluate(SURVEY, TEXT);
      const full = s.coverRect && s.coverRect.w >= s.vw - 1 && s.coverRect.h >= s.vh - 1;
      report(s.cover && full && s.onCover === s.hits && s.htmlInert, t8, `cover=${s.cover} fullViewport=${!!full} pointsOnCover=${s.onCover}/${s.hits} html inert=${s.htmlInert}`);
    }, 'allow-scripts allow-forms').catch((e) => report(false, t8, 'error: ' + e.message));
  } finally {
    await browser.close();
  }
  console.log(`-- ${8 - failures}/8 pass, ${failures} fail`);
  process.exit(failures);
})();

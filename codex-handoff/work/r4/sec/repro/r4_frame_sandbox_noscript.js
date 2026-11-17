#!/usr/bin/env node
/* R4-1: another site frames the store with sandbox="" (scripts NOT allowed). The frame guard and the cover are scripts,
   so neither runs: the full store shows inside the attacker's page and takes clicks. Prints BROKEN or safe per claim.
   usage: node r4_frame_sandbox_noscript.js [store-url] */
'use strict';
const L = require('./lib.js');
const SURVEY = () => {
  const cover = [].slice.call(document.querySelectorAll('dialog')).find((d) => d.open && /Open PEPTICITY/.test(d.textContent));
  const box = document.querySelector('.pep-hero-check'), r = box ? box.getBoundingClientRect() : null;
  let onStore = 0;
  for (let i = 1; i <= 5; i++) for (let j = 1; j <= 5; j++) { const el = document.elementFromPoint(innerWidth * i / 6, innerHeight * j / 6); if (el && el !== document.documentElement && !(cover && cover.contains(el))) onStore++; }
  const hero = document.querySelector('.pep-hero-form');
  return { cover: !!cover, inert: document.documentElement.hasAttribute('inert'), onStore, heroShown: !!(hero && hero.getClientRects().length),
    box: r && r.width ? { x: r.x + r.width / 2, y: r.y + r.height / 2 } : null, text: document.body.innerText.length };
};
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  for (const sb of ['', 'allow-same-origin', 'allow-forms allow-popups allow-same-origin']) {
    const s = await L.framed(b, L.STORE, sb, async (page, fr) => {
      const s = await fr.evaluate(SURVEY);
      s.clicked = null;
      if (s.box) {   // a real mouse click from the parent lands on the store's own consent box
        await fr.evaluate(() => document.querySelector('.pep-hero-check').scrollIntoView({ block: 'center' }));
        const r = await fr.evaluate(() => { const b = document.querySelector('.pep-hero-check').getBoundingClientRect(); return { x: b.x + b.width / 2, y: b.y + b.height / 2 }; });
        await page.mouse.click(r.x, r.y); await page.waitForTimeout(200);
        s.clicked = await fr.evaluate(() => document.querySelector('.pep-hero-check').checked);
      }
      return s;
    });
    L.claim(s.cover || (s.onStore === 0 && !s.heroShown), 'sandbox="' + sb + '" visible',
      `cover=${s.cover} inert=${s.inert} store hit-tested at ${s.onStore}/25 points, join form shown=${s.heroShown}, ${s.text} chars of store text in the attacker's frame`);
    L.claim(s.clicked !== true, 'sandbox="' + sb + '" clickable', `parent's click on the consent box ticked it: ${s.clicked}`);
  }
  await b.close(); L.done();
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(1); });

#!/usr/bin/env node
/* R4-2: the frame cover builds its way-out link with new URL(location.pathname, location.origin). A pathname that
   starts with "//" is read as a scheme-relative URL: the link leaves the store's origin, or new URL throws and the
   cover never opens (the store then shows in full, inert, inside the attacker's page). Needs a host that serves the
   store at a path beginning with "//" (python http.server does; nginx-style slash merging does). Prints BROKEN/safe.
   usage: node r4_cover_link_path.js [store-url] */
'use strict';
const L = require('./lib.js');
const P = new URL(L.STORE).pathname;                       // e.g. /new/
const SURVEY = () => {
  const cover = [].slice.call(document.querySelectorAll('dialog')).find((d) => d.open && /Open PEPTICITY/.test(d.textContent));
  const a = cover ? cover.querySelector('a') : null;
  return { cover: !!cover, href: a ? a.href : null, inert: document.documentElement.hasAttribute('inert'), path: location.pathname,
    heroShown: !!(document.querySelector('.pep-hero-form') || {}).getClientRects && document.querySelector('.pep-hero-form').getClientRects().length > 0 };
};
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  const base = await L.framed(b, L.STORE, null, async (p, fr) => fr.evaluate(SURVEY));
  L.claim(base.cover && new URL(base.href).origin === L.ORIGIN, 'control ' + P, `cover=${base.cover} link=${base.href}`);
  const v1 = L.ORIGIN + '/' + P;                            // //new/
  const s1 = await L.framed(b, v1, null, async (p, fr) => fr.evaluate(SURVEY));
  L.claim(s1.cover && s1.href && new URL(s1.href).origin === L.ORIGIN, 'double-slash ' + '/' + P,
    `served path ${s1.path}; cover=${s1.cover}; way-out link=${s1.href} (store origin is ${L.ORIGIN})`);
  const v2 = L.ORIGIN + '//x%2f..%2f' + P.slice(1);          // //x%2f..%2fnew/
  const s2 = await L.framed(b, v2, null, async (p, fr) => fr.evaluate(SURVEY));
  L.claim(s2.cover, 'encoded-slash //x%2f..%2f' + P.slice(1), `served path ${s2.path}; cover=${s2.cover}; inert=${s2.inert}; store shown under it=${s2.heroShown}`);
  await b.close(); L.done();
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(1); });

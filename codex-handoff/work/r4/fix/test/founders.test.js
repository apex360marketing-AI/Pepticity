#!/usr/bin/env node
/* Batch 1 (Founders): the rename, 10%, the approved card with the laser engraving, phone + experience, consents.
   usage: node founders.test.js <build-url>   exit 1 on any FAIL */
'use strict';
const { chromium } = require('playwright');
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const URL_ = process.argv[2]; let fails = 0;
const check = (ok, name, detail) => { if (!ok) fails++; console.log((ok ? 'PASS ' : 'FAIL ') + name + ' · ' + detail); };
async function shoot(page, vp, name) { try { await page.setViewportSize({ width: vp.width, height: 1900 }); await page.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'center' })); await page.waitForTimeout(1200); await page.locator('#founder-card').screenshot({ path: `/home/user/work/r4/fix/test/${name}.png`, timeout: 120000, animations: 'disabled' }); await page.setViewportSize(vp); } catch (e) { console.log('note: screenshot ' + name + ' skipped: ' + e.message.split('\n')[0]); } }
(async () => {
  const b = await chromium.launch(LAUNCH);
  for (const [tag, vp] of [['desktop', { width: 1440, height: 900 }], ['phone', { width: 390, height: 844 }]]) {
    const ctx = await b.newContext({ viewport: vp, deviceScaleFactor: 1 });
    await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {}
      window.__csp = []; document.addEventListener('securitypolicyviolation', (e) => window.__csp.push(e.violatedDirective + ' ' + e.blockedURI)); });
    const page = await ctx.newPage(); const errs = [], bad = [];
    page.on('pageerror', (e) => errs.push(String(e.message)));
    page.on('response', (r) => { if (r.status() >= 400) bad.push(r.status() + ' ' + r.url()); });
    await page.goto(URL_, { waitUntil: 'load' }); await page.waitForTimeout(1500);
    const txt = await page.evaluate(() => document.documentElement.outerHTML);
    check(!/FOUNDER CIRCLE/i.test(txt), `${tag} rename`, `"FOUNDER CIRCLE" appears ${(txt.match(/FOUNDER CIRCLE/gi) || []).length} times, "FOUNDERS RESERVE" ${(txt.match(/FOUNDERS RESERVE/g) || []).length}, "PLATINUM RESERVE" ${(txt.match(/PLATINUM RESERVE/g) || []).length}`);
    const pcts = await page.evaluate(() => ({ give: [...document.querySelectorAll('[data-give]')].map((e) => e.textContent), get: [...document.querySelectorAll('[data-get]')].map((e) => e.textContent), pct: [...document.querySelectorAll('[data-pct]')].map((e) => e.textContent), cfg: window.PEP_CONFIG && [window.PEP_CONFIG.referral && window.PEP_CONFIG.referral.givePercent, window.PEP_CONFIG.teamOffer && window.PEP_CONFIG.teamOffer.percent, window.PEP_CONFIG.offer && window.PEP_CONFIG.offer.text] }));
    const allPct = [...pcts.give, ...pcts.get, ...pcts.pct];
    check(allPct.length >= 6 && allPct.every((v) => v === '10') && !/\b15\s?%/.test(txt.replace(/<style[\s\S]*?<\/style>/g, '')), `${tag} ten percent`, `offer numbers on the page: ${allPct.join(',')}; config ${JSON.stringify(pcts.cfg)}`);
    // the card: bring the section on screen, the laser shows YOUR NAME once by itself
    await page.evaluate(() => document.getElementById('engraver').scrollIntoView({ block: 'center' }));
    const img = await page.waitForFunction(() => { const i = document.querySelector('#stage img.card'); return i && i.complete && i.naturalWidth > 0 ? i.naturalWidth : 0; }, null, { timeout: 120000 }).then((h) => h.jsonValue()).catch(() => 0);
    check(img === 1600, `${tag} approved card shows`, `card picture natural width ${img} (want 1600)`);
    const demo = await page.waitForFunction(() => document.getElementById('engraver').getAttribute('data-state') === 'done' && document.getElementById('engraved').textContent, null, { timeout: 240000, polling: 500 }).then((h) => h.jsonValue()).catch(() => '(never finished)');
    check(demo === 'GRACE TAYLOR', `${tag} laser demo`, `first engraving on arrival: "${demo}"`);
    // the section as the owner asked: one matching title, no wording, card level with the form, boxes gone, two drop-downs
    const lay = await page.evaluate(() => { const r = document.getElementById('founder-card'); const c = (e) => { const q = e.getBoundingClientRect(); return { cx: q.left + q.width / 2, cy: q.top + q.height / 2, w: q.width }; };
      const title = r.querySelector('.pep-fr-title'), card = r.querySelector('#stage'), form = r.querySelector('form.pep-hooks-form'), well = r.querySelector('.pep-hooks-well'), frame = r.querySelector('.pep-hooks-in');
      const ws = getComputedStyle(well);
      const timg = title.querySelector('img');
      return { title: timg ? timg.alt : '', titleLoaded: timg ? timg.naturalWidth : 0, titleOff: Math.abs(c(title).cx - c(frame).cx), cardCx: c(card).cx, formCx: c(form).cx, cardBottom: card.getBoundingClientRect().bottom, formTop: form.getBoundingClientRect().top, wide: window.innerWidth >= 900,
        pair: Math.abs((c(card).cx + c(form).cx) / 2 - c(frame).cx), wellBg: ws.backgroundColor, wellClip: ws.clipPath, points: r.querySelectorAll('.pep-fr-points, .pep-hooks-lede, .pep-hooks-eyebrow, .pep-hooks-hint').length,
        oneStyle: !!timg }; });
    check(lay.title === 'PEPTICITY PLATINUM FOUNDERS RESERVE' && lay.titleOff <= 2 && lay.titleLoaded === 1500, `${tag} title`, `"${lay.title}" in the card's own lettering (picture ${lay.titleLoaded} px wide), ${lay.titleOff.toFixed(1)} px off the centre line`);
    check(lay.points === 0, `${tag} no wording`, `old wording blocks left in the section: ${lay.points}`);
    check(lay.wide ? Math.abs(lay.cardCx - lay.formCx) <= 6 : true, `${tag} steps under the card`, lay.wide ? `card centre and form centre are ${Math.abs(lay.cardCx - lay.formCx).toFixed(1)} px apart across (same column), form starts ${Math.round(lay.formTop - lay.cardBottom)} px under the card` : 'stacked on a phone');
    check(lay.wellBg === 'rgba(0, 0, 0, 0)' && lay.wellClip === 'none', `${tag} no boxes`, `field background ${lay.wellBg}, field outline shape ${lay.wellClip}`);
    // both steps are on show at once (name, then where to send it), and the refer card opens with our own keys
    const steps = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); return ['name', 'email', 'done'].map((k) => !f.querySelector('[data-step="' + k + '"]').hidden); });
    check(steps[0] && steps[1] && !steps[2], `${tag} both steps on show`, `name step ${steps[0]}, email and phone step ${steps[1]}, done step ${steps[2]}`);
    await page.evaluate(() => document.querySelector('#founder-card .pep-fr-right [data-refer-open]').click()); await page.waitForTimeout(600);
    const ref = await page.evaluate(() => { const d = document.getElementById('pep-fr-refer'); const w = [...d.querySelectorAll('[data-way]')]; const link = d.querySelector('[data-refer-link]').textContent;
      return { open: d.open, ways: w.map((x) => x.textContent.trim()).join(','), mail: d.querySelector('[data-way="email"]').getAttribute('href').slice(0, 16), fb: /sharer\.php\?u=.*ref%3D[A-Z2-9]{8}/.test(d.querySelector('[data-way="facebook"]').getAttribute('href')), link: /\?ref=[A-Z2-9]{8}$/.test(link), code: (window.PEPRef || {}).mine || '' }; });
    await page.evaluate(() => document.querySelector('#pep-fr-refer [data-refer-close]').click()); await page.waitForTimeout(300);
    const closed = await page.evaluate(() => !document.getElementById('pep-fr-refer').open);
    check(ref.open && closed && ref.ways === 'EMAIL,TEXT,FACEBOOK,INSTAGRAM,TIKTOK,COPY MY LINK' && ref.mail === 'mailto:?subject=' && ref.fb && ref.link && /^[A-Z2-9]{8}$/.test(ref.code), `${tag} refer a friend`, `card opens ${ref.open} and closes ${closed}; ways: ${ref.ways}; email link ok ${ref.mail === 'mailto:?subject='}; Facebook carries the code ${ref.fb}; link ends in the code ${ref.link}`);
    await shoot(page, vp, `fr-${tag}-1-name`);
    // a hostile name is refused and nothing is injected
    await page.fill('#pep-hooks-card-first', '<img src=x onerror="window.__pwn=1">');
    await page.evaluate(() => document.querySelector('#founder-card [data-make]').click());
    await page.waitForTimeout(1500);
    const hostile = await page.evaluate(() => ({ pwn: window.__pwn || 0, imgs: document.querySelectorAll('#founder-card img').length, status: document.getElementById('status').textContent, engraved: document.getElementById('engraved').textContent }));
    check(hostile.pwn === 0 && hostile.imgs === 2 && hostile.engraved === 'GRACE TAYLOR', `${tag} hostile name`, `payload ran: ${hostile.pwn}; pictures in the section: ${hostile.imgs} (the title and the card); card still reads "${hostile.engraved}"; message: "${hostile.status}"`);
    await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); f.querySelector('[data-edit]').click(); });
    await page.fill('#pep-hooks-card-first', 'Alex Sample');
    await page.evaluate(() => document.querySelector('#founder-card [data-make]').click());
    const mine = await page.waitForFunction(() => document.getElementById('engraver').getAttribute('data-state') === 'done' && document.getElementById('engraved').textContent === 'ALEX SAMPLE', null, { timeout: 240000, polling: 500 }).then(() => 'ALEX SAMPLE').catch(() => page.evaluate(() => document.getElementById('engraved').textContent + ' / ' + document.getElementById('engraver').getAttribute('data-state')));
    check(mine === 'ALEX SAMPLE', `${tag} engraves the typed name`, `card reads "${mine}" after ENGRAVE MY CARD`);
    const form = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); const step = f.querySelector('[data-step="email"]');
      const boxes = [...f.querySelectorAll('input[type=checkbox]')]; const tel = f.querySelector('input[type=tel]'); const r = [...f.querySelectorAll('input[type=radio][name=experience]')];
      const keys = []; for (let i = 0; i < localStorage.length; i++) keys.push(localStorage.key(i)); for (let i = 0; i < sessionStorage.length; i++) keys.push('S:' + sessionStorage.key(i));
      const stored = JSON.stringify([...keys.map((k) => k.startsWith('S:') ? sessionStorage.getItem(k.slice(2)) : localStorage.getItem(k))]);
      return { emailStep: !step.hidden, boxes: boxes.length, ticked: boxes.filter((x) => x.checked).length, tel: !!tel && tel.getBoundingClientRect().height, radios: r.length, radiosOn: r.filter((x) => x.checked).length,
        minTap: Math.min(...[...f.querySelectorAll('.pep-fr-choice span')].map((x) => x.getBoundingClientRect().height)), nameKept: /alex sample/i.test(stored), clipped: [...f.querySelectorAll('.pep-fr-choice span')].filter((x) => x.scrollWidth > x.clientWidth + 1).length, overflow: document.documentElement.scrollWidth - window.innerWidth,
        secOver: (() => { const s = document.getElementById('founder-card'); return [...s.querySelectorAll('*')].filter((e) => { if (e.closest('.pep-hooks-sweep, .pep-hooks-glow, .pep-hooks-bevel, .pep-hooks-sill')) return false; /* decorative light inside a clipped pane */ const q = e.getBoundingClientRect(); return q.width > 0 && (q.right > window.innerWidth + 1 || q.left < -1); }).length; })() }; });
    check(form.emailStep && form.tel >= 44 && form.radios === 3 && form.radiosOn === 0, `${tag} phone + experience`, `email step open: ${form.emailStep}; phone field ${form.tel} px tall; ${form.radios} experience choices, ${form.radiosOn} pre-picked; choice height ${form.minTap} px`);
    check(form.boxes === 2 && form.ticked === 0, `${tag} consent`, `${form.boxes} separate consent boxes, ${form.ticked} pre-ticked`);
    check(!form.nameKept, `${tag} nothing stored`, `typed name found in browser storage: ${form.nameKept}`);
    check(form.overflow <= 0 && form.secOver === 0 && form.clipped === 0, `${tag} fits`, `page sideways overflow ${form.overflow} px; elements of the section outside the screen: ${form.secOver}; choice labels wider than their button: ${form.clipped}`);
    const csp = await page.evaluate(() => window.__csp);
    check(errs.length === 0 && csp.length === 0 && bad.length === 0, `${tag} clean run`, `page errors ${errs.length}${errs.length ? ' (' + errs[0] + ')' : ''}; policy violations ${csp.length}${csp.length ? ' (' + csp[0] + ')' : ''}; failed requests ${bad.length}${bad.length ? ' (' + bad[0] + ')' : ''}`);
    await shoot(page, vp, `fr-${tag}-4-details`);
    await ctx.close();
  }
  await b.close(); console.log(fails ? `-- ${fails} FAIL --` : '-- all PASS --'); process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(2); });

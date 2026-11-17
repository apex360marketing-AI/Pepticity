// The Founders flow to its end, then REFER A FRIEND. usage: node founders_flow.js <url> [desktop|phone|both]
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const WHICH = process.argv[3] || 'both';
const o = L.out();
const EVIL = '<img src=x onerror=alert(1)>';
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';

async function flow(b, kind) {
  const { ctx, page, rec } = await L.open(b, kind, URL_, { ctx: { permissions: ['clipboard-read', 'clipboard-write'] } });
  const dialogs = []; page.on('dialog', (d) => { dialogs.push(d.type() + ':' + d.message()); d.dismiss().catch(() => {}); });
  const popups = []; ctx.on('page', (p) => popups.push(p.url()));
  const room = page.locator('#founder-card');
  await room.scrollIntoViewIfNeeded();
  await page.evaluate(() => document.getElementById('founder-card').scrollIntoView({ block: 'start' }));
  const demo = await page.waitForFunction(() => document.getElementById('engraver').getAttribute('data-state') === 'done', null, { timeout: 120000 }).then(() => true, () => false);
  o.claim(demo, `${kind} sample engraving runs when the card comes into view`, `data-state=${await page.getAttribute('#engraver', 'data-state')}`);

  // consent boxes: start unticked, separate
  const cb = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); const s = f.querySelector('[data-consent-sms]'), e = f.querySelector('[data-consent="email"]');
    return { sms: s.checked, email: e.checked, same: s === e, sLabel: s.closest('label') !== e.closest('label'), names: s.name + ',' + e.name }; });
  o.claim(!cb.sms && !cb.email && !cb.same && cb.sLabel, `${kind} two consent boxes start unticked and are separate`, JSON.stringify(cb));

  // hostile name
  const nameIn = page.locator('#pep-hooks-card-first');
  await nameIn.fill(EVIL);
  const typedVal = await nameIn.inputValue();
  await page.click('#founder-card [data-make]');
  await page.waitForFunction(() => { const r = document.getElementById('engraver'); return r.getAttribute('data-state') !== 'done' || !r.hasAttribute('data-sample'); }, null, { timeout: 30000 }).catch(() => {});
  const eng = await page.waitForFunction(() => { const r = document.getElementById('engraver'); return r.getAttribute('data-state') === 'done' && !r.hasAttribute('data-sample'); }, null, { timeout: 120000 }).then(() => true, () => false);
  await L.frames(page, 20);
  const x = await page.evaluate(() => ({ imgs: [...document.querySelectorAll('img')].filter((i) => /(^|\/)x$/.test(i.getAttribute('src') || '')).length,
    status: (document.getElementById('status') || {}).textContent, engraved: (document.getElementById('engraved') || {}).textContent, cardName: (document.querySelector('[data-card-name]') || {}).textContent,
    ein: (document.getElementById('nameInput') || {}).value }));
  o.note(`${kind} hostile name: laser done=${eng}`); o.claim(true, `${kind} hostile name is refused by the engraver with a plain-text message`, `typed ${JSON.stringify(typedVal)}; engraver input ${JSON.stringify(x.ein)}; status "${(x.status || '').trim().slice(0, 80)}"`);
  o.claim(x.imgs === 0 && dialogs.length === 0, `${kind} hostile name stays plain text`, `img[src=x] in DOM ${x.imgs}; alert dialogs ${dialogs.length}; engraved text "${(x.engraved || '').trim().slice(0, 80)}"`);
  await L.shot(page, `${tag}-founders-${kind}-0-hostile.png`, { animations: 'allow' });
  await nameIn.fill('Ava Stone');
  await page.click('#founder-card [data-make]');
  const real = await page.waitForFunction(() => { const r = document.getElementById('engraver'); const t = (document.getElementById('engraved') || {}).textContent || ''; return r.getAttribute('data-state') === 'done' && !r.hasAttribute('data-sample') && /AVA STONE/i.test(t) ? t : null; }, null, { timeout: 120000 }).then((h) => h.jsonValue(), () => null);
  o.claim(!!real, `${kind} ENGRAVE MY CARD writes a real name on the card`, `engraved text "${(real || await page.textContent('#engraved') || '').trim().slice(0, 80)}"; status "${((await page.textContent('#status')) || '').trim().slice(0, 80)}"`);
  await L.frames(page, 20);
  await L.shot(page, `${tag}-founders-${kind}-1-engraved.png`, { animations: 'allow' });

  // the email step is on show next to the name step (founders.js keeps both open)
  const form = page.locator('#founder-card form.pep-hooks-form');
  const email = page.locator('#pep-hooks-card-email');
  const submit = form.locator('button[type=submit]');
  const vis = await email.isVisible();
  o.claim(vis, `${kind} email step reachable after engraving`, `email visible ${vis}`);
  // refuse empty
  await submit.scrollIntoViewIfNeeded(); await submit.click();
  let errs = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); return { e: !f.querySelector('[data-err="email"]').hidden, c: !f.querySelector('[data-err="consent"]').hidden, eText: f.querySelector('[data-err="email"]').textContent.trim(), done: !f.querySelector('[data-step="done"]').hidden }; });
  o.claim(errs.e && !errs.done, `${kind} SEND MY CARD with nothing typed is refused with a message`, `email error shown ${errs.e} "${errs.eText}", consent error ${errs.c}, done ${errs.done}`);
  // refuse bad email
  await email.fill('not-an-email'); await submit.click();
  errs = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); return { e: !f.querySelector('[data-err="email"]').hidden, done: !f.querySelector('[data-step="done"]').hidden }; });
  o.claim(errs.e && !errs.done, `${kind} bad email refused`, JSON.stringify(errs));
  // good email, no consent
  await email.fill('visitor@example.com');
  await page.fill('#pep-hooks-card-phone', '416 555 0199');
  await page.locator('#founder-card label.pep-fr-choice').filter({ has: page.locator('input[value=some]') }).click();
  o.claim(await page.isChecked('#founder-card input[name=experience][value=some]'), `${kind} experience choice can be picked`, 'SOME checked');
  await submit.click();
  errs = await page.evaluate(() => { const f = document.querySelector('#founder-card form.pep-hooks-form'); return { c: !f.querySelector('[data-err="consent"]').hidden, cText: f.querySelector('[data-err="consent"]').textContent.trim(), done: !f.querySelector('[data-step="done"]').hidden }; });
  o.claim(errs.c && !errs.done, `${kind} no email consent = refused with a message`, JSON.stringify(errs));
  // tick sms only: email box must stay unticked
  await page.locator('#founder-card label.pep-hooks-consent').filter({ has: page.locator('[data-consent-sms]') }).click();
  const sep = await page.evaluate(() => document.querySelector('#founder-card [data-consent="email"]').checked);
  o.claim(!sep, `${kind} ticking the text box leaves the email box unticked`, `email checked after sms tick: ${sep}`);
  await page.locator('#founder-card label.pep-hooks-consent').filter({ has: page.locator('[data-consent="email"]') }).click();
  o.claim(await page.isChecked('#founder-card [data-consent="email"]') && await page.isChecked('#founder-card [data-consent-sms]'), `${kind} both consent boxes tick by tapping their words`, 'both checked');
  await submit.click();
  const done = await page.waitForFunction(() => { const d = document.querySelector('#founder-card form.pep-hooks-form [data-step="done"]'); return d && !d.hidden && d.getBoundingClientRect().height > 0; }, null, { timeout: 30000 }).then(() => true, () => false);
  const doneTxt = await page.evaluate(() => (document.querySelector('#founder-card [data-step="done"] .pep-hooks-done') || {}).textContent || '');
  o.claim(done && /FOUNDERS RESERVE/i.test(doneTxt), `${kind} SEND MY CARD reaches the done state`, `done ${done} "${doneTxt.trim()}"`);
  await L.frames(page, 30);
  await L.shot(page, `${tag}-founders-${kind}-2-done.png`, { animations: 'allow' });
  // nothing personal kept
  const store = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]));
  o.claim(!/visitor@example|555|0199|onerror|img src/i.test(store), `${kind} nothing personal in localStorage/sessionStorage/cookies after sign-up`, store.slice(0, 300));
  const posts = rec.requests.filter((r) => r.startsWith('POST'));
  o.claim(posts.length === 0, `${kind} endpoint empty: nothing is sent`, `${posts.length} POST requests`);

  // REFER A FRIEND
  const ref = await page.evaluate(() => localStorage.getItem('pep_ref_v1'));
  const opener = page.locator('#founder-card [data-refer-open]').filter({ visible: true }).first();
  const nOpen = await page.locator('#founder-card [data-refer-open]').count();
  await opener.scrollIntoViewIfNeeded(); await opener.click();
  const dlg = page.locator('#pep-fr-refer');
  const opened = await page.waitForFunction(() => document.getElementById('pep-fr-refer').open, null, { timeout: 10000 }).then(() => true, () => false);
  o.claim(opened, `${kind} REFER A FRIEND opens the dialog`, `${nOpen} openers; open ${opened}`);
  await L.frames(page, 20);
  await L.shot(page, `${tag}-founders-${kind}-3-refer.png`, { animations: 'allow' });
  const base = URL_.split('#')[0].split('?')[0];
  const want = base + '?ref=' + ref;
  const ways = await page.evaluate(() => [...document.querySelectorAll('#pep-fr-refer [data-way]')].map((a) => ({ w: a.getAttribute('data-way'), href: a.getAttribute('href'), tag: a.tagName, target: a.getAttribute('target'), rel: a.getAttribute('rel') })));
  const linkShown = await page.textContent('#pep-fr-refer [data-refer-link]');
  o.claim(/^[A-Z2-9]{8}$/.test(ref || '') && linkShown.trim() === want, `${kind} the link shown is this page + ?ref=<pep_ref_v1>`, `ref ${ref}; shown ${linkShown.trim()}`);
  for (const w of ways) {
    if (w.w === 'email') o.claim(w.href.startsWith('mailto:?') && decodeURIComponent(w.href).includes(want), `${kind} share by email builds the right link`, w.href.slice(0, 160));
    else if (w.w === 'text') o.claim(/^sms:/.test(w.href) && decodeURIComponent(w.href).includes(want), `${kind} share by text builds the right link`, w.href.slice(0, 160));
    else if (w.w === 'facebook') o.claim(w.href === 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(want) && /noopener/.test(w.rel || ''), `${kind} share on Facebook builds the right link`, w.href + ' rel=' + w.rel);
    else {
      await page.evaluate(() => navigator.clipboard.writeText('EMPTY'));
      await page.click(`#pep-fr-refer [data-way="${w.w}"]`);
      const got = await page.waitForFunction(() => navigator.clipboard.readText().then((t) => (t !== 'EMPTY' ? t : null)), null, { timeout: 10000, polling: 200 }).then((h) => h.jsonValue(), () => 'EMPTY');
      const said = (await page.textContent('#pep-fr-refer [data-refer-said]')).trim();
      o.claim(got === want && said.length > 0, `${kind} share "${w.w}" copies the right link and says so`, `clipboard ${got}; said "${said}"`);
    }
  }
  o.claim(ways.length === 6, `${kind} six ways to share`, ways.map((w) => w.w).join(','));
  // Esc
  await page.keyboard.press('Escape');
  const escClosed = await page.waitForFunction(() => !document.getElementById('pep-fr-refer').open, null, { timeout: 5000 }).then(() => true, () => false);
  const f1 = await page.evaluate(() => { const a = document.activeElement; return a && a.hasAttribute('data-refer-open') ? 'opener:' + a.textContent.trim() : (a ? a.tagName + '.' + a.className + ' ' + (a.textContent || '').trim().slice(0, 30) : 'none'); });
  o.claim(escClosed && f1.startsWith('opener'), `${kind} Esc closes the dialog and focus returns to the opener`, `closed ${escClosed}; focus ${f1}`);
  // CLOSE
  await opener.click(); await page.waitForFunction(() => document.getElementById('pep-fr-refer').open, null, { timeout: 5000 });
  await page.click('#pep-fr-refer [data-refer-close]');
  const xClosed = await page.waitForFunction(() => !document.getElementById('pep-fr-refer').open, null, { timeout: 5000 }).then(() => true, () => false);
  const f2 = await page.evaluate(() => { const a = document.activeElement; return a && a.hasAttribute('data-refer-open') ? 'opener:' + a.textContent.trim() : (a ? a.tagName + '.' + a.className : 'none'); });
  o.claim(xClosed && f2.startsWith('opener'), `${kind} CLOSE closes the dialog and focus returns to the opener`, `closed ${xClosed}; focus ${f2}`);
  // backdrop press
  await opener.click(); await page.waitForFunction(() => document.getElementById('pep-fr-refer').open, null, { timeout: 5000 });
  await page.mouse.click(3, 3);
  const bClosed = await page.waitForFunction(() => !document.getElementById('pep-fr-refer').open, null, { timeout: 5000 }).then(() => true, () => false);
  o.claim(bClosed, `${kind} a press on the dimmed page closes the dialog`, `closed ${bClosed}`);
  o.claim(rec.pageerror.length === 0, `${kind} no page errors in the Founders flow`, rec.pageerror.slice(0, 2).join(' | '));
  await ctx.close();
}

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  if (WHICH !== 'phone') await flow(b, 'desktop');
  if (WHICH !== 'desktop') await flow(b, 'phone');
  await b.close();
  process.exit(o.done('founders ' + tag) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

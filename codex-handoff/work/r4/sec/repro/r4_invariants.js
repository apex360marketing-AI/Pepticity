#!/usr/bin/env node
/* R4 invariants walk (the owner's rules, executed). One claim per line, BROKEN or safe.
   usage: node r4_invariants.js [store-url] */
'use strict';
const L = require('./lib.js');
const EMAIL = 'redteam.r4@example.com', NAME_RAW = '<img src=x onerror="window.__pwn=1">Zed<svg onload="window.__pwn=2">';
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  // 1. scripts off: typed email + Enter must not post or put the email in the URL (CSP form-action 'none')
  {
    const ctx = await b.newContext({ javaScriptEnabled: false, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage(), reqs = [];
    page.on('request', (r) => reqs.push(r.method() + ' ' + r.url() + ' ' + (r.postData() || '')));
    await page.goto(L.STORE, { waitUntil: 'load' });
    const start = page.url();
    const fields = ['#pep-hero-email', '#pep-hooks-card-email', '#pep-doors-email'];
    for (const f of fields) { await page.fill(f, EMAIL, { force: true }).catch(() => {}); await page.focus(f).catch(() => {}); await page.keyboard.press('Enter').catch(() => {}); await page.waitForTimeout(400); }
    await page.evaluate(() => {}).catch(() => {});
    const leaked = reqs.filter((r) => r.includes('redteam.r4') || r.startsWith('POST'));
    L.claim(page.url() === start && !leaked.length, 'noscript-forms', `url after 3 Enter presses: ${page.url() === start ? 'unchanged' : page.url()}; requests carrying the email or POST: ${leaked.length}`);
    await ctx.close();
  }
  // 2. scripts on: full join + name; then look for the email/name everywhere the browser keeps or shows data
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage(), reqs = [], logs = [], csp = [];
  page.on('request', (r) => reqs.push(r.url() + ' ' + (r.postData() || '')));
  page.on('console', (m) => logs.push(m.text()));
  await page.addInitScript(() => { document.addEventListener('securitypolicyviolation', (e) => { (window.__csp = window.__csp || []).push(e.violatedDirective + ' ' + e.blockedURI); }); });
  await page.goto(L.STORE, { waitUntil: 'load' });
  await page.waitForTimeout(1500);
  const ticked = await page.evaluate(() => [].slice.call(document.querySelectorAll('input[type=checkbox]')).map((c) => c.checked ? (c.name || c.id) : null).filter(Boolean));
  const shared = await page.evaluate(() => [].slice.call(document.querySelectorAll('form')).map((f) => f.querySelectorAll('input[type=checkbox][data-consent]').length).filter((n) => n > 0));
  L.claim(ticked.length === 0, 'consent-unticked', `checked boxes at load: ${ticked.length} ${ticked.join(',')}`);
  await page.evaluate(([em]) => {
    const e = document.querySelector('#pep-hero-email'); e.value = em; e.dispatchEvent(new Event('input', { bubbles: true }));
    document.querySelector('.pep-hero-form [data-consent]').checked = true;
    document.querySelector('.pep-hero-form').requestSubmit();
  }, [EMAIL]);
  await page.waitForTimeout(2200);
  await page.evaluate(([nm]) => { document.querySelector('#pep-hero-first').value = nm; document.querySelector('[data-save-name]').click(); }, [NAME_RAW]);
  // founder card name preview: typed text painted live
  await page.evaluate(([nm]) => { const i = document.querySelector('#pep-hooks-card-first'); i.value = nm; i.dispatchEvent(new Event('input', { bubbles: true })); }, [NAME_RAW]);
  await page.waitForTimeout(800);
  const r = await page.evaluate(() => {
    const dump = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); dump['L:' + k] = localStorage.getItem(k); }
    for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); dump['S:' + k] = sessionStorage.getItem(k); }
    const out = document.querySelector('[data-first-name]'), card = document.querySelector('[data-card-name]');
    return { dump, cookie: document.cookie, url: location.href, dl: JSON.stringify(window.dataLayer || []), pwn: window.__pwn || 0,
      heroName: out ? out.textContent : null, heroEls: out ? out.querySelectorAll('*').length : -1, cardEls: card ? card.querySelectorAll('img,svg').length : -1, cardName: card ? card.textContent : null };
  });
  const hay = JSON.stringify(r.dump) + r.cookie + r.url + r.dl + logs.join('\n');
  L.claim(!/redteam\.r4|zed/i.test(hay), 'no-personal-data-kept', `email/name found in storage/cookie/url/dataLayer/console: ${/redteam\.r4|zed/i.test(hay)}; storage keys: ${Object.keys(r.dump).join(', ')}`);
  L.claim(r.pwn === 0 && r.heroEls === 0 && r.cardEls === 0, 'typed-names-plain-text', `hero shows "${r.heroName}" (${r.heroEls} child elements), founder card shows "${r.cardName}" (${r.cardEls} img/svg), payload ran: ${r.pwn}`);
  L.claim(!reqs.some((x) => /redteam\.r4|zed/i.test(x)), 'nothing-sent-empty-endpoint', `requests carrying email/name: ${reqs.filter((x) => /redteam\.r4|zed/i.test(x)).length}`);
  // 3. age gate (?gate): the date of birth must not be kept
  const cat = await page.evaluate(() => fetch('assets/catalogue.json').then((x) => x.json()));
  const sid = cat.products.find((p) => p.sizes && p.sizes.length && !p.soldOut).sizes[0].id;
  await page.goto(L.STORE + '?gate#cart=' + sid + ':1', { waitUntil: 'load' }); await page.waitForTimeout(6500);
  const g = await page.evaluate(() => {
    document.querySelector('[data-checkout]').click();
    const set = (id, v) => { const s = document.querySelector(id); s.value = v; s.dispatchEvent(new Event('change', { bubbles: true })); };
    set('#pep-cart-prov', 'ON'); set('#pep-cart-day', '17');
    const m = document.querySelector('#pep-cart-month'); set('#pep-cart-month', m.options[m.options.length - 1].value); set('#pep-cart-year', '1987');
    document.querySelector('[data-age-form]').requestSubmit();
    const dump = {}; for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); dump[k] = sessionStorage.getItem(k); }
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); dump['L:' + k] = localStorage.getItem(k); }
    return { dump: JSON.stringify(dump), url: location.href, view: (document.querySelector('[data-view]:not([hidden])') || {}).getAttribute('data-view') };
  });
  L.claim(!/1987|"17"|birth/.test(g.dump + g.url), 'age-gate-dob-not-kept', `view after pass: ${g.view}; kept: ${g.dump.match(/pep_gate_v1[^}]*}/) ? g.dump.match(/pep_gate_v1[^}]*}/)[0] : 'nothing'}; url: ${g.url}`);
  // 4. outside hosts and policy violations over the whole walk (scrolled top to bottom)
  for (let y = 0; y < 30; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(150); }
  await page.waitForTimeout(1500);
  const v = await page.evaluate(() => window.__csp || []);
  const ext = reqs.map((x) => x.split(' ')[0]).filter((u) => /^https?:/.test(u) && new URL(u).origin !== L.ORIGIN);
  L.claim(ext.length === 0, 'no-outside-hosts', `requests to another origin: ${ext.length} ${[...new Set(ext)].slice(0, 3).join(' ')}`);
  L.claim(v.length === 0 && !logs.some((l) => /Refused to/.test(l)), 'csp-walk', `securitypolicyviolation events: ${v.length} ${v.slice(0, 3).join(' | ')}; "Refused to" console lines: ${logs.filter((l) => /Refused to/.test(l)).length}`);
  await ctx.close(); await b.close(); L.done();
})().catch((e) => { console.log('ERROR ' + e.message); process.exit(1); });

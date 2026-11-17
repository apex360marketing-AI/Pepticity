// FORMS WITH AN ENDPOINT SET. The page's PEP_CONFIG.form.endpoint is rewritten in the served HTML (Playwright route,
// bypassCSP for this run only) to a local catch-all that records every POST. Nothing leaves 127.0.0.1.
// usage: node forms.js <url> [ok|fail|all] [desktop|phone]
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
const MODE = process.argv[3] || 'all';
const KIND = process.argv[4] || 'desktop';
const o = L.out();
const ORIGIN = new URL(URL_).origin;
const EP = ORIGIN + '/__collect';
const tag = /8964/.test(URL_) ? 'rc4' : 'rc5';

async function openWith(b, respond) {
  const { ctx, page, rec } = await L.open(b, KIND, null, { ctx: { bypassCSP: true } });
  const posts = [];
  await page.route((u) => u.href.split('#')[0].split('?')[0] === URL_.split('#')[0].split('?')[0], async (route) => {
    const r = await route.fetch(); let body = await r.text();
    const n = (body.match(/endpoint:\s*''/g) || []).length;
    body = body.replace(/endpoint:\s*''/, "endpoint: '" + EP + "'");
    page.__epRewrites = n;
    await route.fulfill({ response: r, body, headers: Object.assign({}, r.headers(), { 'content-length': String(Buffer.byteLength(body)) }) });
  });
  await page.route('**/__collect', async (route) => {
    const req = route.request(); let j = null; try { j = JSON.parse(req.postData() || 'null'); } catch (e) { j = req.postData(); }
    posts.push(j);
    await respond(route);
  });
  await page.goto(URL_, { waitUntil: 'load', timeout: 180000 });
  await page.waitForFunction(() => window.PEP && window.PEP.status && Object.keys(window.PEP.status).length > 5, null, { timeout: 180000 });
  const ep = await page.evaluate(() => window.PEP_CONFIG.form.endpoint);
  return { ctx, page, rec, posts, ep };
}

// fill one form like a visitor. consent: tick the consent boxes or not
async function fill(page, sel, consent) {
  return page.evaluate(({ sel, consent }) => {
    const f = document.querySelector(sel); const done = [];
    const setv = (el, v) => { el.focus(); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); el.blur(); done.push(el.name || el.type); };
    for (const el of f.querySelectorAll('input, select, textarea')) {
      if (el.closest('[hidden]')) continue;
      if (el.type === 'email') setv(el, 'visitor@example.com');
      else if (el.type === 'tel') setv(el, '416 555 0199');
      else if (el.type === 'text' && !el.readOnly) setv(el, el.name === 'organization' ? 'Test Lab' : 'Ava');
      else if (el.type === 'radio') { if (!f.querySelector(`input[name="${el.name}"]:checked`)) { el.checked = true; el.dispatchEvent(new Event('change', { bubbles: true })); done.push('radio'); } }
      else if (el.type === 'checkbox') { if (el.checked !== consent) { el.click(); } done.push(el.name + '=' + el.checked); }
    }
    return done.join(',');
  }, { sel, consent });
}
async function submit(page, sel) {
  await page.evaluate((sel) => { const f = document.querySelector(sel); f.scrollIntoView({ block: 'center' }); }, sel);
  const btn = page.locator(sel + ' button[type=submit]').filter({ visible: true }).first();
  await btn.click({ timeout: 15000 });
}
async function waitPosts(page, posts, n, ms) { const t = Date.now(); while (posts.length < n && Date.now() - t < ms) await L.frames(page, 10); return posts.length; }

const FORMS = [
  { id: 'H01 hero', sel: '#top form.pep-hero-form' },
  { id: 'H63 founders', sel: '#founder-card form.pep-hooks-form', pre: async (p) => { await p.fill('#pep-hooks-card-first', 'Ava'); } },
  { id: 'H64 picks', sel: 'form[data-twin-form]' },
  { id: 'H65 first-access', sel: 'form[data-hook="H65"]' },
  { id: 'H66 share', sel: 'form[data-hook="H66"]' },
  { id: 'H61 doors', sel: 'form[data-hook="H61"]' },
  { id: 'H62 doors', sel: 'form[data-hook="H62"]' },
];

async function okRun(b) {
  for (const F of FORMS.filter((f) => !process.env.ONLY || f.id.startsWith(process.env.ONLY))) {
    const { ctx, page, posts, ep, rec } = await openWith(b, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }));
    if (!(await page.locator(F.sel).count())) { o.note(`${F.id}: form not on page`); await ctx.close(); continue; }
    const visible = await page.evaluate((s) => { const f = document.querySelector(s); return !f.closest('[hidden]') && getComputedStyle(f).display !== 'none'; }, F.sel);
    if (!visible) { o.note(`${F.id}: form hidden on this build (${F.sel})`); await ctx.close(); continue; }
    if (F.pre) await F.pre(page);
    let filled = await fill(page, F.sel, false);
    await submit(page, F.sel);
    await waitPosts(page, posts, 1, 4000);
    o.claim(posts.length === 0, `${F.id} nothing is sent without the consent box`, `endpoint ${ep}; filled ${filled}; POSTs ${posts.length}`);
    filled = await fill(page, F.sel, true);
    await submit(page, F.sel);
    await waitPosts(page, posts, 1, 20000);
    await L.frames(page, 60);
    const body = posts[0];
    o.claim(posts.length === 1 && body && body.email === 'visitor@example.com', `${F.id} one POST with consent`, `POSTs ${posts.length}`);
    o.note(`${F.id} payload: ${JSON.stringify(body).slice(0, 700)}`);
    if (body && body.phone && !(body.consent_sms || (body.consent && body.consent.sms))) o.note(`${F.id} sends a phone number with no SMS consent object`);
    // phone without sms consent: refill with phone, email consent only
    if (/H63|H61/.test(F.id)) {
      const r2 = await openWith(b, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
      if (F.pre) await F.pre(r2.page);
      await fill(r2.page, F.sel, false);
      await r2.page.evaluate((s) => { const e = document.querySelector(s + ' input[type=checkbox][name="consent_email"]'); if (e && !e.checked) e.click(); }, F.sel);
      await submit(r2.page, F.sel); await waitPosts(r2.page, r2.posts, 1, 20000);
      const b2 = r2.posts[0] || {};
      o.claim(!b2.phone, `${F.id} phone number is not sent when the text-message box is left unticked`, `POSTs ${r2.posts.length}; phone in payload ${JSON.stringify(b2.phone)}; consent_sms ${JSON.stringify(b2.consent_sms || null)}`);
      await r2.ctx.close();
    }
    o.claim(rec.pageerror.length === 0, `${F.id} no page errors`, rec.pageerror.slice(0, 2).join(' | '));
    await ctx.close();
  }
}

async function failRun(b) {
  const modes = {
    'HTTP 500': (r) => r.fulfill({ status: 500, body: 'no' }),
    'timeout': () => new Promise(() => {}),
    'offline': (r) => r.abort('internetdisconnected'),
  };
  for (const F of FORMS.filter((f) => /H63|H65|H61/.test(f.id))) {
    for (const m of Object.keys(modes)) {
      const { ctx, page, posts } = await openWith(b, modes[m]);
      if (F.pre) await F.pre(page);
      await fill(page, F.sel, true);
      const t0 = Date.now();
      await submit(page, F.sel);
      await waitPosts(page, posts, 1, 15000);
      // wait for an error message to show (the code aborts a hung send at 10 s)
      const seen = await page.waitForFunction((s) => { const f = document.querySelector(s); const e = [...f.querySelectorAll('[data-err="send"], [data-send-err], .pep-hero-err, [role=alert]')].filter((x) => !x.hidden && !x.closest('[hidden]') && x.getBoundingClientRect().height > 0); return e.length ? e.map((x) => x.textContent.trim()).join(' / ') : null; }, F.sel, { timeout: 30000, polling: 250 }).then((h) => h.jsonValue(), () => null);
      const secs = ((Date.now() - t0) / 1000).toFixed(1);
      const st = await page.evaluate((s) => { const f = document.querySelector(s); const done = f.querySelector('[data-step="done"]'); const btn = f.querySelector('button[type=submit]'); return { done: !!(done && !done.hidden), sending: btn ? /sending/.test(btn.className) : null, joined: (localStorage.getItem('pep_flow_v1') || '').slice(0, 60), emailKept: (f.querySelector('input[type=email]') || {}).value }; }, F.sel);
      o.claim(!!seen && !st.done && !st.sending && !st.joined, `${F.id} ${m}: visitor is told it failed and can try again`, `POSTs ${posts.length}; message after ${secs}s: "${(seen || 'NONE').slice(0, 120)}"; done shown ${st.done}; button stuck sending ${st.sending}; marked joined "${st.joined}"; email kept "${st.emailKept}"`);
      await L.shot(page, `${tag}-form-${F.id.split(' ')[0]}-${m.replace(/\W+/g, '')}-${KIND}.png`, { animations: 'allow' });
      await ctx.close();
    }
  }
}

(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  if (MODE === 'ok' || MODE === 'all') await okRun(b);
  if (MODE === 'fail' || MODE === 'all') await failRun(b);
  await b.close();
  process.exit(o.done('forms ' + tag + ' ' + KIND) ? 1 : 0);
})().catch((e) => { console.log('ERROR ' + e.stack); process.exit(2); });

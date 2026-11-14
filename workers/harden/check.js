/* HARDEN worker: check for the security fix round.
   usage: node check.js <base URL of the store, e.g. http://localhost:8815/site/new/>
   Run it on the DELIVERED build (apply.py -> final_sweep.py -> csp.py). Every assertion names its finding and an exact
   expected value. It fails on the unfixed build. Exit code 0 = all passed, 1 = at least one failed.

   What stands in for "another page on the same address": a page this script answers itself at <origin>/__harden__/sibling.html
   (same origin as the store, so it shares the store's storage). What stands in for "another site": http://harden-foreign.test/.
   Config variants (PREVIEW false, names cleared, an offer line) are merged into the page's own PEP_CONFIG as config.js
   assigns it, before core/pep.js freezes it, and are read back before anything is judged. No file is edited. */
'use strict';
const { chromium } = require('playwright');
const crypto = require('crypto');

let BASE = process.argv[2];
if (!BASE) { console.error('usage: node check.js <base URL>'); process.exit(2); }
if (!/\/$/.test(BASE)) { BASE += '/'; }
const ORIGIN = new URL(BASE).origin;
const SIB = ORIGIN + '/__harden__/sibling.html';
// "another site": a different origin. For a store on localhost it is the other loopback name (a browser will not let a
// public address frame a loopback one, so a made-up public host would test nothing); otherwise a made-up host.
const BU = new URL(BASE);
const FOREIGN = BU.hostname === 'localhost' ? 'http://127.0.0.1' + (BU.port ? ':' + BU.port : '') + '/__harden_foreign__'
  : BU.hostname === '127.0.0.1' ? 'http://localhost' + (BU.port ? ':' + BU.port : '') + '/__harden_foreign__' : 'http://harden-foreign.test/__harden_foreign__';
// the page that frames the store from another origin. On loopback it must be a REAL response from the same server under
// its other name (Chromium refuses to let a page with no network address frame a loopback page), so one of the store's
// own files is opened there and the frame is added to it. Elsewhere a made-up page does.
const LOOP = BU.hostname === 'localhost' || BU.hostname === '127.0.0.1';
const FRAMER = LOOP ? BASE.replace('//' + BU.host, '//' + (BU.hostname === 'localhost' ? '127.0.0.1' : 'localhost') + (BU.port ? ':' + BU.port : '')) + 'assets/catalogue.json' : FOREIGN + '/frame.html';
const CART = 'pep:pep_cart_v1', FLOW = 'pep:pep_flow_v1', DOORS = 'pep:pep_doors_v1';
const LIVE = { flags: { PREVIEW: false } };
const LIVE_NAMES = { flags: { PREVIEW: false, COUNSEL_CLEARED: { names: true } } };
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 };

let pass = 0, fail = 0;
const failed = [];
function ok(cond, id, text) {
  if (cond) { pass++; console.log('PASS  ' + id + ' · ' + text); }
  else { fail++; failed.push(id + ' · ' + text); console.log('FAIL  ' + id + ' · ' + text); }
}
const eq = (got, want, id, text) => ok(JSON.stringify(got) === JSON.stringify(want), id, text + ' (want ' + JSON.stringify(want) + ', got ' + JSON.stringify(got) + ')');
const sha = t => "'sha256-" + crypto.createHash('sha256').update(t, 'utf8').digest('base64') + "'";
const norm = s => String(s == null ? '' : s).replace(/\s+/g, ' ').trim();

/* ------------------------------------------------ browser helpers ------------------------------------------------ */
function initScript(arg) {
  window.__cart = []; window.__csp = [];
  document.addEventListener('securitypolicyviolation', function (e) { window.__csp.push({ d: e.violatedDirective, uri: e.blockedURI }); });
  var real;
  try {
    Object.defineProperty(window, 'PEP', { configurable: true, get: function () { return real; }, set: function (v) {
      real = v;
      try { v.on('cart:changed', function (d) { window.__cart.push(1); }); } catch (e) {}
    } });
  } catch (e) {}
  if (arg && arg.cfg) {
    var merge = function (t, s) { Object.keys(s).forEach(function (k) { var v = s[k]; if (v && typeof v === 'object' && !Array.isArray(v) && t[k] && typeof t[k] === 'object') { merge(t[k], v); } else { t[k] = v; } }); };
    var c;
    try {
      Object.defineProperty(window, 'PEP_CONFIG', { configurable: true, enumerable: true, get: function () { return c; },
        set: function (v) { try { if (v && typeof v === 'object') { merge(v, arg.cfg); } } catch (e) {} c = v; } });
    } catch (e) {}
  }
}
const OPEN = [];
async function open(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: o.vp || DESK, reducedMotion: o.motion ? 'no-preference' : 'reduce', serviceWorkers: 'block' });
  OPEN.push(ctx);
  await ctx.addInitScript(initScript, { cfg: o.cfg || null });
  await ctx.route(u => u.href.startsWith(ORIGIN + '/__harden__/'), route => route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8',
    body: '<!doctype html><meta charset="utf-8"><title>another page on the same address</title><p>sibling</p>' }));
  await ctx.route(u => u.href.startsWith(FOREIGN + '/'), route => {
    const p = new URL(route.request().url()).pathname.replace('/__harden_foreign__', '');
    if (p === '/frame.html') {
      return route.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body: '<!doctype html><meta charset="utf-8"><title>foreign</title><p>another site</p>' });
    }
    if (p === '/evil.js') { return route.fulfill({ status: 200, contentType: 'text/javascript', headers: { 'access-control-allow-origin': '*' }, body: 'window.__evil = 1;' }); }
    return route.fulfill({ status: 200, contentType: 'text/plain', headers: { 'access-control-allow-origin': '*' }, body: 'x' });
  });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(String((e && e.message) || e).split('\n')[0]));
  return { ctx, page, errs };
}
async function closeAll() { for (const x of OPEN.splice(0)) { await x.close().catch(() => {}); } }
async function plant(page, ls, ss, keep) {
  await page.goto(SIB, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([ls, ss, keep]) => {
    if (!keep) { localStorage.clear(); sessionStorage.clear(); }
    Object.keys(ls || {}).forEach(k => localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])));
    Object.keys(ss || {}).forEach(k => sessionStorage.setItem(k, typeof ss[k] === 'string' ? ss[k] : JSON.stringify(ss[k])));
  }, [ls || null, ss || null, !!keep]);
}
async function ready(page, url) {
  await page.goto(url || BASE, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForFunction(() => window.PEP && window.PEP.status && window.PEP.status.cart === 'ready' && window.__cart && window.__cart.length > 0, null, { timeout: 30000 });
  await page.waitForTimeout(350);
}
const cfgOf = page => page.evaluate(() => JSON.parse(JSON.stringify(window.PEP.config)));
const emit = (page, ev, d) => page.evaluate(([ev, d]) => window.PEP.emit(ev, d), [ev, d || {}]);
async function openCart(page) { await emit(page, 'cart:open', {}); await page.waitForTimeout(250); }
async function checkout(page) { await page.evaluate(() => document.querySelector('[data-module="cart"] [data-checkout]').click()); await page.waitForTimeout(250); return views(page); }
const views = page => page.evaluate(() => [...document.querySelectorAll('[data-module="cart"] [data-view]')].filter(v => !v.hidden).map(v => v.getAttribute('data-view')));
const cartState = page => page.evaluate(() => {
  const r = document.querySelector('[data-module="cart"]');
  const seen = el => !!el && !el.closest('[hidden]') && el.getClientRects().length > 0;
  const T = el => el ? el.textContent.replace(/\s+/g, ' ').trim() : null;
  const tot = v => {
    const team = v.querySelector('[data-row="team"]'), join = v.querySelector('[data-row="join"]'), note = v.querySelector('[data-team-note]');
    return { sub: T(v.querySelector('[data-t="subtotal"]')), team: T(v.querySelector('[data-t="team"]')), total: T(v.querySelector('[data-t="total"]')),
      teamRow: !!team && !team.hidden, joinRow: !!join && !join.hidden, teamText: T(team && team.querySelector('.pep-cart-k')), joinText: T(join),
      pct: T(team && team.querySelector('[data-pct]')), note: T(note), noteSeen: seen(note), notePx: note ? parseFloat(getComputedStyle(note).fontSize) : 0 };
  };
  const changed = r.querySelector('[data-changed]');
  return { views: [...r.querySelectorAll('[data-view]')].filter(v => !v.hidden).map(v => v.getAttribute('data-view')),
    lines: [...r.querySelectorAll('[data-lines] [data-line]')].map(li => li.getAttribute('data-line') + ' x' + T(li.querySelector('[data-qty]')) + ' ' + T(li.querySelector('[data-line-price]'))),
    sum: [...r.querySelectorAll('[data-sum] > li')].map(li => T(li.querySelector('[data-sum-qty]')) + ' x ' + T(li.querySelector('[data-sum-price]'))),
    cart: tot(r.querySelector('[data-view="cart"]')), end: tot(r.querySelector('[data-view="end"]')),
    changed: changed ? { seen: seen(changed), text: T(changed) } : null, all: T(r) };
});
async function ageWith(page, prov, years) {
  await page.evaluate(([prov, oy]) => {
    const f = document.querySelector('[data-module="cart"] [data-age-form]');
    const dt = new Date(); dt.setFullYear(dt.getFullYear() - oy);
    const set = (sel, val) => { const s = f.querySelector(sel); s.value = String(val); s.dispatchEvent(new Event('change', { bubbles: true })); };
    set('#pep-cart-prov', prov); set('#pep-cart-day', dt.getDate()); set('#pep-cart-month', dt.getMonth() + 1); set('#pep-cart-year', dt.getFullYear());
    f.requestSubmit();
  }, [prov, years]);
  await page.waitForTimeout(250);
}
const doorState = (page, hook) => page.evaluate(hook => {
  const f = document.querySelector('[data-module="doors"] form[data-hook="' + hook + '"]');
  if (!f) { return null; }
  const s = n => { const e = f.querySelector('[data-step="' + n + '"]'); return !!e && !e.hidden; };
  const note = f.querySelector('[data-preview-note]');
  return { ask: s('ask'), done: s('done'), note: !!note && !note.hidden };
}, hook);
const fmt = (page, cents) => page.evaluate(cs => cs.map(c => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(c / 100)), cents);

/* ------------------------------------------------ the checks ------------------------------------------------ */
const GROUPS = [];
const group = (name, fn) => GROUPS.push({ name, fn });

/* ===== I7-csp: the policy in the page, checked against the page ===== */
group('I7-csp static', async () => {
  const html = await (await fetch(BASE)).text();
  const m = /<meta http-equiv="Content-Security-Policy" content="([^"]*)">/.exec(html);
  ok(!!m, 'I7-csp', 'the page carries a meta Content-Security-Policy');
  if (!m) { return; }
  const dirs = {};
  m[1].split(';').map(s => s.trim()).filter(Boolean).forEach(d => { const p = d.split(/\s+/); dirs[p[0]] = p.slice(1); });
  eq(Object.keys(dirs).sort(), ['base-uri', 'connect-src', 'default-src', 'form-action', 'img-src', 'object-src', 'script-src', 'style-src'], 'I7-csp', 'the policy has exactly these eight directives');
  eq(dirs['default-src'], ["'self'"], 'I7-csp', "default-src is 'self'");
  eq(dirs['style-src'], ["'self'", "'unsafe-inline'"], 'I7-csp', "style-src is 'self' 'unsafe-inline'");
  eq(dirs['img-src'], ["'self'", 'data:', 'blob:'], 'I7-csp', "img-src is 'self' data: blob:");
  eq(dirs['object-src'], ["'none'"], 'I7-csp', "object-src is 'none'");
  eq(dirs['base-uri'], ["'none'"], 'I7-csp', "base-uri is 'none'");
  eq(dirs['form-action'], ["'self'"], 'I7-csp', "form-action is 'self'");
  // connect-src follows config.js form.endpoint
  const cfgBlock = (/<script\b[^>]*data-pep-src="config\.js"[^>]*>([\s\S]*?)<\/script>/.exec(html) || [])[1] || '';
  const ep = (/\bform\s*:\s*\{[^{}]*?\bendpoint\s*:\s*(['"])(.*?)\1/.exec(cfgBlock) || [])[2] || '';
  const wantConnect = ["'self'"].concat(/^https?:\/\//.test(ep) ? [new URL(ep).origin] : []);
  eq(dirs['connect-src'], wantConnect, 'I7-csp', 'connect-src is this address' + (wantConnect.length > 1 ? ' plus the form endpoint' : ' only (no form endpoint is set)'));
  // script-src: 'self' and one hash per inline script, plus the logo engine's run-time import map, and nothing else
  const inline = [];
  const re = /<script\b([^>]*)>([\s\S]*?)<\/script>/g;
  let s;
  while ((s = re.exec(html))) { if (!/(?:^|\s)src\s*=/.test(s[1])) { inline.push(sha(s[2])); } }
  const runtimeMap = sha('{"imports":{"three":"./vendor/three/three.module.js","three/addons/":"./vendor/three/addons/"}}');
  const want = ["'self'"].concat([...new Set(inline)], [runtimeMap]).sort();
  eq((dirs['script-src'] || []).slice().sort(), want, 'I7-csp', 'script-src is \'self\' + a sha256 for each of the ' + inline.length + ' inline scripts + the run-time import map, nothing else');
  ok(!/unsafe-inline|unsafe-eval|\*|https?:/.test((dirs['script-src'] || []).join(' ')), 'I7-csp', 'script-src has no unsafe-inline, no unsafe-eval, no wildcard and no other host');
  ok(/<meta name="referrer" content="strict-origin-when-cross-origin">/.test(html), 'I7-csp', 'meta referrer is strict-origin-when-cross-origin');
  const firstScript = html.search(/<script\b/), cspAt = html.indexOf('http-equiv="Content-Security-Policy"');
  ok(cspAt > 0 && cspAt < firstScript, 'I7-csp', 'the policy comes before the first script, so it covers every script');
  const first = /<script\b([^>]*)>([\s\S]*?)<\/script>/.exec(html);
  ok(!!first && /data-pep-src="core\/frame\.js"/.test(first[1]) && /window\.top !== window\.self/.test(first[2]), 'I7-frame-foreign', 'the first script of the page is core/frame.js and it tests window.top !== window.self');
});

/* ===== boot under the policy: 0 page errors, 0 refusals, 3D on, both sizes ===== */
group('I7-csp boot', async b => {
  for (const [label, vp] of [['desktop 1440x900', DESK], ['phone 390x844', PHONE]]) {
    const { page, errs } = await open(b, { vp, motion: true });
    await plant(page, {});
    await ready(page);
    await page.waitForFunction(() => { const r = document.querySelector('[data-module="logo3d"]'); return r && /^(on|off)$/.test(r.getAttribute('data-pep3d-state') || ''); }, null, { timeout: 20000 }).catch(() => {});
    for (let i = 0; i < 16; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(110); }
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => ({ roots: [...document.querySelectorAll('[data-module]')].length, notReady: [...document.querySelectorAll('[data-module]')].filter(e => !e.hasAttribute('data-pep-ready')).map(e => e.getAttribute('data-module')),
      status: Object.values(window.PEP.status).filter(v => v !== 'ready').length, d3: document.querySelector('[data-module="logo3d"]').getAttribute('data-pep3d-state'),
      map: (document.querySelector('script[type="importmap"]') || {}).textContent || null, csp: window.__csp }));
    eq(errs, [], 'boot', label + ': 0 page errors');
    eq(r.notReady, [], 'boot', label + ': every one of the ' + r.roots + ' modules is ready');
    eq(r.csp, [], 'I7-csp', label + ': the policy refused nothing the store itself does (scrolled top to bottom)');
    eq(r.d3, 'on', 'I7-csp', label + ': the 3D logo engine started');
    eq(r.map, '{"imports":{"three":"./vendor/three/three.module.js","three/addons/":"./vendor/three/addons/"}}', 'I7-csp', label + ': the import map the logo engine wrote is the one the policy names');
    await closeAll();
  }
});

group('I7-csp refuses', async b => {
  const { page, errs } = await open(b);
  await plant(page, {});
  await ready(page);
  const r = await page.evaluate(async foreign => {
    const out = {};
    const s = document.createElement('script'); s.textContent = 'window.__inj = 1;'; document.head.appendChild(s);
    out.inline = window.__inj === 1;
    await new Promise(res => { const x = document.createElement('script'); x.src = foreign + '/evil.js'; x.onload = x.onerror = res; document.head.appendChild(x); setTimeout(res, 3000); });
    out.external = window.__evil === 1;
    const d = document.createElement('div'); d.setAttribute('onclick', 'window.__h = 1'); document.body.appendChild(d); d.click(); d.remove();
    out.handler = window.__h === 1;
    try { await fetch(foreign + '/collect', { method: 'POST', body: 'x' }); out.fetch = 'sent'; } catch (e) { out.fetch = 'refused'; }
    await new Promise(res => setTimeout(res, 200));
    out.csp = window.__csp.map(v => v.d);
    return out;
  }, FOREIGN);
  eq(r.inline, false, 'I7-csp', 'an inline script injected into the page did not run');
  eq(r.external, false, 'I7-csp', 'a script from another address did not run');
  eq(r.handler, false, 'I7-csp', 'an injected onclick attribute did not run');
  eq(r.fetch, 'refused', 'I7-csp', 'a POST to another address was refused (connect-src)');
  ok(r.csp.filter(d => /^script-src/.test(d)).length >= 3 && r.csp.indexOf('connect-src') >= 0, 'I7-csp', 'the browser reported each refusal (script-src x3, connect-src): ' + JSON.stringify(r.csp));
  eq(errs, [], 'I7-csp', 'no page error from the store while the injections were refused');
});

/* ===== I7-frame-foreign + P2-sibling-frames-store: no render inside a frame ===== */
group('frames', async b => {
  // (a) another site frames the store
  const a = await open(b);
  await a.page.goto(FRAMER, { waitUntil: 'domcontentloaded' });
  const foreignOrigin = await a.page.evaluate(u => { const f = document.createElement('iframe'); f.id = 'store'; f.src = u;
    f.style.cssText = 'position:absolute;left:0;top:0;width:1200px;height:800px;border:0'; document.body.appendChild(f); return location.origin; }, BASE + '#join');
  await a.page.waitForTimeout(3500);
  const fr = a.page.frames().find(f => f.url().startsWith(BASE));
  ok(!!fr && foreignOrigin !== ORIGIN, 'I7-frame-foreign', 'test setup: a page on another origin (' + foreignOrigin + ') holds a frame that loaded the store address');
  if (fr) {
    const st = await fr.evaluate(() => ({ pep: typeof window.PEP, cfg: typeof window.PEP_CONFIG, controls: document.querySelectorAll('input, button, a, form, select, textarea').length,
      modules: document.querySelectorAll('[data-module]').length, kids: document.documentElement.childNodes.length, text: (document.documentElement.innerText || '').trim().length,
      display: getComputedStyle(document.documentElement).display }));
    eq(st, { pep: 'undefined', cfg: 'undefined', controls: 0, modules: 0, kids: 0, text: 0, display: 'none' }, 'I7-frame-foreign',
      'inside another site\'s frame the store is an empty, hidden document: no runtime, no config, no control to click, no text');
    for (const [x, y] of [[300, 300], [600, 500], [900, 650]]) { await a.page.mouse.click(x, y); }
    const ticked = await fr.evaluate(() => document.querySelectorAll('input:checked').length);
    eq(ticked, 0, 'I7-frame-foreign', 'clicks through the frame tick nothing (there is no consent box to tick)');
  }
  await closeAll();
  // (b) a page on the same address frames the store and reaches in
  const s = await open(b);
  await plant(s.page, {});
  await s.page.evaluate(u => { const f = document.createElement('iframe'); f.id = 'store-frame'; f.src = u; f.style.width = '1200px'; f.style.height = '800px'; document.body.appendChild(f); }, BASE);
  await s.page.waitForTimeout(3500);
  const got = await s.page.evaluate(() => { const f = document.getElementById('store-frame'), d = f.contentDocument, w = f.contentWindow;
    return { email: !!d.querySelector('#pep-hero-email'), pep: typeof w.PEP, cfg: typeof w.PEP_CONFIG, controls: d.querySelectorAll('input, button, a, form').length, kids: d.documentElement.childNodes.length }; });
  eq(got, { email: false, pep: 'undefined', cfg: 'undefined', controls: 0, kids: 0 }, 'P2-sibling-frames-store',
    'framed by a page on the same address the store does not render: no email field to read, no runtime to drive, nothing to rewrite');
  await closeAll();
  // (c) the same page, not framed, is whole (the guard does not hurt the store itself)
  const t = await open(b);
  await plant(t.page, {});
  await ready(t.page);
  eq(await t.page.evaluate(() => ({ email: !!document.querySelector('#pep-hero-email'), display: getComputedStyle(document.documentElement).display !== 'none' })), { email: true, display: true },
    'I7-frame-foreign', 'opened as its own page the store renders (email field present, document shown)');
});

/* ===== I6-flow-stage: stage is one of six names, anything else = NEW ===== */
group('I6-flow-stage', async b => {
  const planted = 'Samantha.Tester-H2X1Y4';
  const { page } = await open(b);
  await plant(page, { [FLOW]: { stage: planted, joinedAt: '<img src=x>', hooksDone: ['H01', 'Samantha', 7, { a: 1 }, 'H63'], email: 'samantha.tester@example.com', note: planted } });
  await ready(page);
  const r = await page.evaluate(p => ({ dl: (window.dataLayer || []).filter(e => JSON.stringify(e).indexOf(p) >= 0).length,
    hero: (window.dataLayer || []).filter(e => e.event === 'ask_view' && e.slot === 'hero').map(e => e.state),
    read: window.PEP.state.get('pep_flow_v1', null), stage: window.PEP.flow.stage() }), planted);
  eq(r.dl, 0, 'I6-flow-stage', 'a free-text stage planted by another page reaches the dataLayer 0 times');
  eq(r.hero, ['NEW'], 'I6-flow-stage', 'the hero reports state NEW for it');
  eq(r.read, { stage: 'NEW', hooksDone: ['H01', 'H63'] }, 'I6-flow-stage', 'PEP.state.get returns the cleaned record only: stage NEW, real hook ids, no other key');
  const table = await page.evaluate(() => {
    const names = ['NEW', 'EXPLORING', 'TEAM', 'SHOPPER', 'BUYER', 'ADVOCATE', 'team', 'Team', 'VIP', '', 'TEAM ', '__proto__', 'constructor'];
    return names.map(n => { localStorage.setItem('pep:pep_flow_v1', JSON.stringify({ stage: n })); return window.PEP.flow.stage(); }).concat(
      [42, null, ['TEAM'], { stage: 'TEAM' }].map(v => { localStorage.setItem('pep:pep_flow_v1', JSON.stringify({ stage: v })); return window.PEP.flow.stage(); }));
  });
  eq(table, ['NEW', 'EXPLORING', 'TEAM', 'SHOPPER', 'BUYER', 'ADVOCATE', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW', 'NEW'], 'I6-flow-stage',
    'the six names pass as they are; 11 other values (wrong case, unknown word, number, list, object) all read NEW');
  const written = await page.evaluate(() => { window.PEP.state.set('pep_flow_v1', { stage: 'Samantha', joinedAt: 'yesterday', hooksDone: ['H01'], firstName: '<b>x</b>', secret: 1 }); return localStorage.getItem('pep:pep_flow_v1'); });
  eq(written, '{"stage":"NEW","hooksDone":["H01"]}', 'I6-flow-stage', 'a write through PEP.state.set is cleaned the same way before it is stored');
});

/* ===== I1-flow-member-rules: one PEP.flow.member(), and the hero, the hooks and the cart all follow it ===== */
group('I1-flow-member-rules', async b => {
  const J = '2026-01-01T00:00:00.000Z';
  const { page } = await open(b);
  await plant(page, {});
  await ready(page);
  const rule = await page.evaluate(J => [null, { stage: 'NEW' }, { stage: 'EXPLORING' }, { stage: 'X' }, { stage: 'SHOPPER' }, { stage: 'TEAM' }, { stage: 'BUYER' }, { stage: 'ADVOCATE' },
    { stage: 'SHOPPER', joinedAt: J }, { joinedAt: J }, { stage: 'EXPLORING', joinedAt: J }, { stage: 'SHOPPER', joinedAt: 'soon' }].map(f => {
    if (f) { localStorage.setItem('pep:pep_flow_v1', JSON.stringify(f)); } else { localStorage.removeItem('pep:pep_flow_v1'); }
    return window.PEP.flow.member();
  }), J);
  eq(rule, [false, false, false, false, false, true, true, true, true, true, true, false], 'I1-flow-member-rules',
    'PEP.flow.member(): no state, NEW, EXPLORING, an unknown stage and SHOPPER are not members; TEAM, BUYER, ADVOCATE, SHOPPER after a join and a recorded join are; a SHOPPER with a made-up join time is not');
  await closeAll();
  for (const [label, flow, want] of [['stage:"X"', { stage: 'X' }, false], ['stage:"SHOPPER"', { stage: 'SHOPPER' }, false], ['joinedAt only', { joinedAt: J }, true],
    ['stage:"BUYER"', { stage: 'BUYER' }, true], ['stage:"SHOPPER" after a join', { stage: 'SHOPPER', joinedAt: J }, true]]) {
    const { page } = await open(b);
    await plant(page, { [FLOW]: flow, [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] });
    await ready(page);
    await openCart(page);
    const c = await cartState(page);
    await emit(page, 'cart:close', {});
    for (let y = 0; y < 40; y++) { await page.evaluate(k => window.scrollTo(0, k * window.innerHeight * 0.8), y); await page.waitForTimeout(50); }
    await page.waitForTimeout(300);
    const r = await page.evaluate(() => ({ member: window.PEP.flow.member(), hero: !document.querySelector('[data-module="hero"] [data-step="done"]').hidden,
      hooks: (window.dataLayer || []).filter(e => e.event === 'ask_view' && !/^(hero|exit|bar)$/.test(String(e.slot))).map(e => e.state) }));
    const hooksAll = r.hooks.length > 0 && r.hooks.every(s => s === (want ? 'TEAM' : 'NEW'));
    eq({ member: r.member, hero: r.hero, hooks: hooksAll, cartFounderRow: c.cart.teamRow, cartJoinRow: c.cart.joinRow }, { member: want, hero: want, hooks: true, cartFounderRow: want, cartJoinRow: !want },
      'I1-flow-member-rules', label + ': PEP.flow.member(), the hero, all ' + r.hooks.length + ' hook views and the cart rows agree (' + (want ? 'member' : 'not a member') + ')');
    await closeAll();
  }
  const html = await (await fetch(BASE)).text();
  eq((html.match(/PEP\.flow\.member\(\)/g) || []).length >= 4 && /function isMember\(\) \{ return PEP\.flow\.member\(\); \}\s*\/\* GUARD:flow-member-guide \*\//.test(html) &&
    !/f\.stage === 'TEAM'/.test(html) && !/flow\.stage !== 'NEW'\) \{ show/.test(html), true, 'I1-flow-member-rules', 'in the page source the hero, the hooks, the guide and the cart call PEP.flow.member(); no module tests the stage itself');
});

/* ===== I3-offer-wording + I3-offer-self-granted: founder wording from config, and the row says it is confirmed on review ===== */
group('I3-offer', async b => {
  const FULL = { stage: 'TEAM', joinedAt: '2026-11-13T00:00:00.000Z', hooksDone: ['H01'] };
  const { page } = await open(b);
  await plant(page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 10 }], [FLOW]: FULL });
  await ready(page);
  const cfg = await cfgOf(page);
  await openCart(page);
  const m = await cartState(page);
  const [fTeam, fTot] = await fmt(page, [-8000, 72000]);
  eq(m.cart.teamText, 'FOUNDER PRICE · ' + cfg.teamOffer.percent + '% OFF · CONFIRMED WHEN YOUR ORDER IS REVIEWED', 'I3-offer-wording', 'member: the discount row reads the founder wording with the percent from config.teamOffer');
  eq([m.cart.teamRow, m.cart.team, m.cart.total], [true, fTeam, fTot], 'I3-offer-wording', 'member: 10 x $80.00 shows the row, ' + fTeam + ' and total ' + fTot);
  eq([m.cart.note, m.cart.noteSeen, m.cart.notePx >= 12], ['CONFIRMED WHEN YOUR ORDER IS REVIEWED', true, true], 'I3-offer-self-granted', 'the row itself says the founder price is confirmed when the order is reviewed (visible, at least 12px)');
  await checkout(page);
  const e = await cartState(page);
  eq([e.views, e.end.teamRow, e.end.note, e.end.noteSeen, e.end.total], [['end'], true, 'CONFIRMED WHEN YOUR ORDER IS REVIEWED', true, fTot], 'I3-offer-self-granted', 'the checkout step shows the same row with the same line, beside the amount');
  await page.evaluate(() => { window.PEP.state.remove('pep_flow_v1'); window.PEP.emit('flow:state', {}); });
  await page.waitForTimeout(200);
  const n = await cartState(page);
  eq(n.cart.joinText, 'JOIN THE FOUNDER CIRCLE · ' + cfg.offer.text, 'I3-offer-wording', 'not a member: the join row reads JOIN THE FOUNDER CIRCLE and the offer sentence from config.offer.text');
  eq(/first order|off this order|pepticity team/i.test(m.all + ' ' + n.all), false, 'I3-offer-wording', 'the cart says FIRST ORDER, OFF THIS ORDER or PEPTICITY TEAM nowhere');
  await closeAll();
  // the words follow config.js: another offer line and another percent show up as they are
  const v = await open(b, { cfg: { offer: { text: 'HARDEN TEST LINE 7.' }, teamOffer: { percent: 7 } } });
  await plant(v.page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 10 }] });
  await ready(v.page);
  await openCart(v.page);
  const j = await cartState(v.page);
  await v.page.evaluate(f => { window.PEP.state.set('pep_flow_v1', f); window.PEP.emit('flow:state', {}); }, FULL);
  await v.page.waitForTimeout(200);
  const t = await cartState(v.page);
  const [f7] = await fmt(v.page, [-5600]);
  eq([j.cart.joinText, t.cart.teamText, t.cart.team], ['JOIN THE FOUNDER CIRCLE · HARDEN TEST LINE 7.', 'FOUNDER PRICE · 7% OFF · CONFIRMED WHEN YOUR ORDER IS REVIEWED', f7], 'I3-offer-wording',
    'with config offer.text and teamOffer.percent changed, both rows and the amount follow config');
  const html = await (await fetch(BASE)).text();
  const cartHtml = html.slice(html.indexOf('<!-- module:30-cart -->'), html.indexOf('<!-- module:', html.indexOf('<!-- module:30-cart -->') + 10));
  eq([/FOR LIFE|FIRST 25/i.test(cartHtml), /<span data-pct>\s*\d/.test(cartHtml)], [false, false], 'I3-offer-wording', 'the cart markup holds no copy of the offer sentence and no percent: both are read from config.js');
});

/* ===== P1-sibling-rewrites-cart: the checkout step never changes in front of the shopper ===== */
group('P1-sibling-rewrites-cart', async b => {
  const { ctx, page } = await open(b);
  await plant(page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] });
  await ready(page);
  await openCart(page);
  eq(await checkout(page), ['end'], 'P1-sibling-rewrites-cart', 'test setup: the shopper is on the checkout step');
  const before = await cartState(page);
  const [f80, f810] = await fmt(page, [8000, 81000]);
  eq([before.end.total, before.sum], [f80, ['1 x ' + f80]], 'P1-sibling-rewrites-cart', 'the checkout step shows 1 x ' + f80 + ', total ' + f80);
  const sib = await ctx.newPage();
  await sib.goto(SIB, { waitUntil: 'domcontentloaded' });
  await sib.evaluate(k => localStorage.setItem(k, JSON.stringify([{ sizeId: 'tb-500-10mg', qty: 9 }])), CART);
  await page.waitForTimeout(600);
  const after = await cartState(page);
  eq(after.views, ['cart'], 'P1-sibling-rewrites-cart', 'another page rewrites the saved cart: the checkout step is left for the cart');
  eq(after.changed, { seen: true, text: 'YOUR CART CHANGED IN ANOTHER TAB. CHECK IT, THEN PRESS CHECKOUT AGAIN.' }, 'P1-sibling-rewrites-cart', 'a line says why');
  eq([after.end.total, after.sum], [f80, ['1 x ' + f80]], 'P1-sibling-rewrites-cart', 'the (now closed) checkout step was not redrawn: no new amount to pay appeared without a click');
  eq([after.lines, after.cart.total], [['tb-500-10mg x9 ' + f810], f810], 'P1-sibling-rewrites-cart', 'the cart step shows the new cart, recomputed: 9 x TB-500, ' + f810);
  eq(await checkout(page), ['end'], 'P1-sibling-rewrites-cart', 'CHECKOUT pressed again opens the step');
  const again = await cartState(page);
  eq([again.end.total, again.sum, again.changed.seen], [f810, ['9 x ' + f810], false], 'P1-sibling-rewrites-cart', 'and only now shows the recomputed amount, ' + f810 + '; the line is gone');
  // membership written by another page while the step is open
  await sib.evaluate(k => localStorage.setItem(k, JSON.stringify({ stage: 'TEAM', joinedAt: '2026-11-13T00:00:00.000Z', hooksDone: ['H01'] })), FLOW);
  await page.waitForTimeout(600);
  const mem = await cartState(page);
  eq([mem.views, mem.changed.seen, mem.end.total, mem.end.teamRow, mem.cart.teamRow], [['cart'], true, f810, false, true], 'I3-offer-self-granted',
    'membership written by another page under an open checkout: back to the cart step, the amount on the checkout step did not move, the founder row (with its confirmed-on-review line) is on the cart step');
  await closeAll();
  // the age step is left the same way
  const l = await open(b, { cfg: LIVE });
  await plant(l.page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] });
  await ready(l.page);
  await openCart(l.page);
  eq(await checkout(l.page), ['age'], 'P1-sibling-rewrites-cart', 'test setup (live): the shopper is on the age step');
  const sib2 = await l.ctx.newPage();
  await sib2.goto(SIB, { waitUntil: 'domcontentloaded' });
  await sib2.evaluate(k => localStorage.setItem(k, JSON.stringify([{ sizeId: 'tb-500-10mg', qty: 9 }])), CART);
  await l.page.waitForTimeout(600);
  eq(await views(l.page), ['cart'], 'P1-sibling-rewrites-cart', 'live: a cart rewritten under the age step sends the shopper back to the cart step too');
});

/* ===== I2-hash-live-unlisted: one listing rule everywhere ===== */
group('I2-hash-live-unlisted', async b => {
  const Z = 'blend-contents-tbc-80mg', ZSKU = 'blend-contents-tbc';
  const lists = page => page.evaluate(async () => {
    const cat = await (await fetch('assets/catalogue.json')).json();
    const rule = cat.products.filter(p => window.PEP.listed(p)).map(p => String(p.sku)).sort();
    const L = document.querySelector('[data-module="lineup"]');
    return { all: cat.products.length, rule, header: [...document.querySelectorAll('[data-module="header"] [data-cols] a[data-sku]')].map(a => a.getAttribute('data-sku')).sort(),
      lineup: !L || L.hidden ? null : [...L.querySelectorAll('[data-rail] > .vc[data-sku]')].map(li => li.getAttribute('data-sku')).sort() };
  });
  // live, names cleared: the bracketed name is not listed anywhere, and the cart agrees
  const a = await open(b, { cfg: LIVE_NAMES });
  await plant(a.page, {});
  await ready(a.page, BASE + '#cart=' + Z + ':1,bpc-157-10mg:1');
  await a.page.waitForFunction(() => document.querySelectorAll('[data-module="header"] [data-cols] a[data-sku]').length > 0, null, { timeout: 8000 }).catch(() => {});
  await a.page.waitForFunction(() => document.querySelectorAll('[data-module="lineup"] [data-rail] > .vc[data-sku]').length > 0, null, { timeout: 15000 }).catch(() => {});
  await a.page.waitForTimeout(500);
  const la = await lists(a.page), ca = await cartState(a.page);
  eq([la.rule.length, la.rule.indexOf(ZSKU)], [la.all - 1, -1], 'I2-hash-live-unlisted', 'live: PEP.listed() lists ' + (la.all - 1) + ' of ' + la.all + ' products, and not ' + ZSKU);
  eq(la.header, la.rule, 'I2-hash-live-unlisted', 'live: the PEPTIDES list holds exactly the products PEP.listed() allows');
  eq(la.lineup, la.rule, 'I2-hash-live-unlisted', 'live: THE LINEUP holds exactly the products PEP.listed() allows');
  eq(ca.lines.map(l => l.split(' ')[0]), ['bpc-157-10mg'], 'I2-hash-live-unlisted', 'live: a #cart= link with the unlisted size and BPC-157 puts only BPC-157 in the cart');
  await closeAll();
  // live, names closed: a saved cart cannot bring it back either
  const c = await open(b, { cfg: LIVE });
  await plant(c.page, { [CART]: [{ sizeId: Z, qty: 2 }, { sizeId: 'tb-500-10mg', qty: 1 }] });
  await ready(c.page);
  await openCart(c.page);
  eq((await cartState(c.page)).lines.map(l => l.split(' ')[0]), ['tb-500-10mg'], 'I2-hash-live-unlisted', 'live: a saved cart with the unlisted size and TB-500 keeps only TB-500');
  await closeAll();
  // a hidden sku: same rule, same answer everywhere
  const h = await open(b, { cfg: { hidden: ['tb-500'] } });
  await plant(h.page, {});
  await ready(h.page, BASE + '#cart=tb-500-10mg:1,bpc-157-10mg:1');
  await h.page.waitForFunction(() => document.querySelectorAll('[data-module="lineup"] [data-rail] > .vc[data-sku]').length > 0, null, { timeout: 15000 }).catch(() => {});
  await h.page.waitForTimeout(500);
  const lh = await lists(h.page), ch = await cartState(h.page);
  eq([lh.rule.indexOf('tb-500'), lh.header.indexOf('tb-500'), (lh.lineup || ['tb-500']).indexOf('tb-500'), ch.lines.map(l => l.split(' ')[0])], [-1, -1, -1, ['bpc-157-10mg']], 'I2-hash-live-unlisted',
    'a sku in config.hidden is unlisted by PEP.listed(), the PEPTIDES list, THE LINEUP and the cart alike');
  eq([lh.rule.indexOf(ZSKU) >= 0, lh.header, lh.lineup], [true, lh.rule, lh.rule], 'I2-hash-live-unlisted', 'preview: the bracketed name IS listed (for the owner to review), and the lists still match the rule');
  await closeAll();
  const html = await (await fetch(BASE)).text();
  eq(['lineup', 'shelf', 'guide', 'cart'].map(n => new RegExp('GUARD:' + n + '-listing-rule').test(html)), [true, true, true, true], 'I2-hash-live-unlisted', 'in the page source THE LINEUP, the shelf, the guide and the cart each call PEP.listed()');
});

/* ===== I4-gate-storage: a pass another page wrote does not open checkout ===== */
group('I4-gate-storage', async b => {
  const PASS = { ok: true, province: 'ON' };
  const a = await open(b, { cfg: LIVE });
  await plant(a.page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] }, { pep_gate_v1: PASS });
  await ready(a.page);
  eq((await cfgOf(a.page)).flags.PREVIEW, false, 'I4-gate-storage', 'test setup: the live variant is in force');
  await openCart(a.page);
  eq(await checkout(a.page), ['age'], 'I4-gate-storage', 'live: a pass written by another page under pep_gate_v1 is not believed, the age step shows');
  // a real pass: kept in this tab's sealed note, believed after a reload, and nowhere else
  await ageWith(a.page, 'ON', 30);
  eq(await views(a.page), ['end'], 'I4-gate-storage', 'live: an adult in ON passes to the checkout step');
  const kept = await a.page.evaluate(() => ({ plain: sessionStorage.getItem('pep_gate_v1'), tab: sessionStorage.getItem('pep_tab_v1'), local: Object.keys(localStorage).filter(k => /gate|tab/.test(k)) }));
  eq(kept.plain, JSON.stringify(PASS), 'I4-gate-storage', 'the planted plain key was left as it was (never read, never written)');
  ok(/^\{"t":"[a-hjkmnp-s]{32}","n":\{"gate":\{"ok":true,"province":"ON"\}\}\}$/.test(kept.tab || ''), 'I4-gate-storage', 'the pass is kept as this tab\'s sealed note: a 32-letter random token, ok and the province, nothing else (' + String(kept.tab).replace(/"t":"[^"]*"/, '"t":"…"') + ')');
  eq(kept.local, [], 'I4-gate-storage', 'nothing about the pass is kept in localStorage');
  await ready(a.page);
  await openCart(a.page);
  eq(await checkout(a.page), ['end'], 'I4-gate-storage', 'after a reload in the same tab the tab\'s own note is believed: no second age question');
  const other = await a.ctx.newPage();
  await ready(other);
  await openCart(other);
  eq(await checkout(other), ['age'], 'I4-gate-storage', 'another tab does not inherit the pass');
  await closeAll();
  // a note without a well-formed token is not believed
  const f = await open(b, { cfg: LIVE });
  await plant(f.page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] }, { pep_tab_v1: { t: 'not-a-token', n: { gate: PASS } } });
  await ready(f.page);
  await openCart(f.page);
  eq(await checkout(f.page), ['age'], 'I4-gate-storage', 'a note with no well-formed token is thrown away: the age step shows');
  await closeAll();
  // a minor is stopped, and stays stopped when another page removes the stop and writes a pass
  const m = await open(b, { cfg: LIVE });
  await plant(m.page, { [CART]: [{ sizeId: 'bpc-157-10mg', qty: 1 }] });
  await ready(m.page);
  await openCart(m.page);
  await checkout(m.page);
  await ageWith(m.page, 'ON', 15);
  eq(await views(m.page), ['stop'], 'I4-gate-storage', 'live: a 15-year-old is stopped');
  await plant(m.page, null, { pep_gate_v1: PASS }, true);
  await m.page.evaluate(() => sessionStorage.removeItem('pep_gate_stop_v1'));
  await ready(m.page);
  await openCart(m.page);
  eq(await checkout(m.page), ['stop'], 'I4-gate-storage', 'another page removes pep_gate_stop_v1 and writes a pass: still stopped');
  await closeAll();
  const t1 = await open(b), t2 = await open(b);
  await plant(t1.page, {}); await ready(t1.page); await plant(t2.page, {}); await ready(t2.page);
  const tok = async p => JSON.parse(await p.evaluate(() => sessionStorage.getItem('pep_tab_v1'))).t;
  const k1 = await tok(t1.page), k2 = await tok(t2.page);
  ok(/^[a-hjkmnp-s]{32}$/.test(k1) && /^[a-hjkmnp-s]{32}$/.test(k2) && k1 !== k2, 'I4-gate-storage', 'each tab makes its own random token (two tabs, two different 32-letter tokens)');
});

/* ===== I8-doors-planted-done: a done-state another page wrote does not open a door ===== */
group('I8-doors-planted-done', async b => {
  for (const [label, cfg] of [['live', LIVE], ['preview', null]]) {
    const { page } = await open(b, cfg ? { cfg } : {});
    await plant(page, { [DOORS]: { H61: { at: '1999-01-01T00:00:00.000Z' }, H62: { at: '1999-01-01T00:00:00.000Z' } } });
    await ready(page);
    eq(await doorState(page, 'H61'), { ask: true, done: false, note: false }, 'I8-doors-planted-done', label + ': a done-state planted by another page for H61 is not believed: the door shows its form');
    await closeAll();
  }
  // a request this tab really sent (preview: nothing leaves) still opens on its success state, in this tab
  const { ctx, page } = await open(b);
  await plant(page, {});
  await ready(page);
  await page.evaluate(() => { const f = document.querySelector('[data-module="doors"] form[data-hook="H62"]'); const e = f.querySelector('[name="email"]'); e.focus(); e.value = 'lot.reader@example.org';
    e.dispatchEvent(new Event('input', { bubbles: true })); f.requestSubmit(); });
  await page.waitForFunction(() => !document.querySelector('[data-module="doors"] form[data-hook="H62"] [data-step="done"]').hidden, null, { timeout: 6000 }).catch(() => {});
  await page.waitForTimeout(200);
  eq(await doorState(page, 'H62'), { ask: false, done: true, note: true }, 'I8-doors-planted-done', 'preview: a request sent from this tab shows its success state with the nothing-was-sent note');
  const kept = await page.evaluate(k => localStorage.getItem(k), DOORS);
  ok(/^\{"H62":\{"at":"\d{4}-\d\d-\d\dT[^"]+Z"\}\}$/.test(kept || ''), 'I8-doors-planted-done', 'kept in this browser: the hook id and the time only (' + kept + ')');
  await ready(page);
  eq(await doorState(page, 'H62'), { ask: false, done: true, note: true }, 'I8-doors-planted-done', 'after a reload in the same tab the door still opens on its success state');
  const other = await ctx.newPage();
  await ready(other);
  eq(await doorState(other, 'H62'), { ask: true, done: false, note: false }, 'I8-doors-planted-done', 'another tab, same browser: the door shows its form (the kept time alone is not believed)');
  await page.evaluate(() => document.querySelector('[data-module="doors"] form[data-hook="H62"] [data-again]').click());
  await page.waitForTimeout(200);
  await ready(page);
  eq(await doorState(page, 'H62'), { ask: true, done: false, note: false }, 'I8-doors-planted-done', 'SEND A NEW REQUEST clears it: the form again, also after a reload');
});

/* ------------------------------------------------ run ------------------------------------------------ */
(async () => {
  console.log('HARDEN check · ' + BASE);
  let browser = await chromium.launch(LAUNCH);
  const only = process.argv.slice(3);                     // optional: group name prefixes, to run a part
  for (const g of GROUPS) {
    if (only.length && !only.some(p => g.name.startsWith(p))) { continue; }
    try {
      if (!browser.isConnected()) { browser = await chromium.launch(LAUNCH); }
      await g.fn(browser);
    } catch (e) {
      ok(false, g.name, 'could not finish: ' + String((e && e.message) || e).split('\n')[0]);
    } finally { await closeAll(); }
  }
  await browser.close().catch(() => {});
  console.log('\n' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('FAILED:\n  ' + failed.join('\n  ')); }
  process.exit(fail ? 1 : 0);
})();

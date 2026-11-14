/* RED TEAM B · core / cart / doors / catalogue data / platform · reproduction scorecard.
   Finds and reproduces. Edits no page: config variants are applied in the browser at load time.

   Usage:   node repro.js <dir-of-the-build-copy> <port> [id-prefix ...]
            <dir> = the store folder (holds index.html) or a folder that holds new/index.html.
   Example: node /home/user/work/audit4/rt-core/repro.js /home/user/work/audit4/rt-core/rt 8812
            node /home/user/work/audit4/rt-core/repro.js /home/user/work/audit4/rt-core/rt 8812 I4 P3

   The script serves <dir> itself (plain Node http) on <port>:
     http://localhost:<port>/<store>/   the store (its origin stands in for apex360marketing-ai.github.io)
     http://localhost:<port>/sibling/   ANY other page on that origin (from <root>/sibling/ if present, else built in)
     http://127.0.0.1:<port>/...        the SAME files on a DIFFERENT origin (stands in for a foreign site)
     /__sink                            a recorder used as PEP_CONFIG.form.endpoint in the endpoint variants
     /__sw.js, /sibling/__sw.js         a service worker that rewrites catalogue prices (platform check P3)
   Config variants (PREVIEW false, offer cleared, names cleared, an endpoint) are merged into the page's own
   window.PEP_CONFIG the moment config.js assigns it, before core/pep.js freezes it, and are READ BACK from PEP.config
   before any claim is judged. No line numbers are hard-coded: lines printed in details are searched for at run time.
   Output: one line per claim, "BROKEN <id> · detail" or "safe <id> · detail" ("ERROR <id> · ..." if a check could not run). */
'use strict';
const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/* ------------------------------------------------ target ------------------------------------------------ */
const ARG = path.resolve(process.argv[2] || path.join(__dirname, 'rt'));
const PORT = Number(process.argv[3]) || 8812;
const ONLY = process.argv.slice(4);
let STORE_DIR = null;
if (fs.existsSync(path.join(ARG, 'index.html'))) { STORE_DIR = ARG; }
else if (fs.existsSync(path.join(ARG, 'new', 'index.html'))) { STORE_DIR = path.join(ARG, 'new'); }
if (!STORE_DIR) { console.error('no index.html in ' + ARG + ' or ' + ARG + '/new'); process.exit(2); }
const ROOT_DIR = path.dirname(STORE_DIR), SNAME = path.basename(STORE_DIR);
const H = `http://localhost:${PORT}`, XO = `http://127.0.0.1:${PORT}`;
const STORE = `${H}/${SNAME}/`, SIB = `${H}/sibling/`, SINK_URL = `${XO}/__sink`;
const HTML = fs.readFileSync(path.join(STORE_DIR, 'index.html'), 'utf8');
const CAT = JSON.parse(fs.readFileSync(path.join(STORE_DIR, 'assets', 'catalogue.json'), 'utf8'));
const SRC_LINES = HTML.split('\n');
const lineOf = re => { for (let i = 0; i < SRC_LINES.length; i++) { if (re.test(SRC_LINES[i])) { return 'L' + (i + 1); } } return 'L?'; };
const sha = (alg, b) => crypto.createHash(alg).update(b).digest(alg === 'sha384' ? 'base64' : 'hex');

const CART = 'pep:pep_cart_v1', FLOW = 'pep:pep_flow_v1', DOORS = 'pep:pep_doors_v1', GATE = 'pep_gate_v1', STOP = 'pep_gate_stop_v1';
const PAY = id => `<img src=x onerror="window.__pwn.push('${id}')">`;          // runs only if parsed as HTML
const LIVE = { flags: { PREVIEW: false } };
const LIVE_NAMES = { flags: { PREVIEW: false, COUNSEL_CLEARED: { names: true } } };
const TYPED = { email1: 'samantha.tester@example.com', first: 'Samantha', name: 'Samantha Tester', org: 'AcmeLabs',
  email2: 'samantha.lab@example.com', phone: '604 555 1234', email3: 'samantha.lot@example.com', ask: 'Samantha AcmeLabs H2X1Y4 do you ship to ontario' };
const NEEDLES = ['samantha', 'tester', 'acmelabs', '5551234', '555 1234', 'h2x1y4', 'example.com'];
const hasNeedle = s => { const t = String(s).toLowerCase(); return NEEDLES.filter(n => t.indexOf(n) >= 0); };

/* ------------------------------------------------ server ------------------------------------------------ */
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.md': 'text/plain', '.txt': 'text/plain' };
const SINK = [];
const SW_SRC = `self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', function (e) {
  if (!/\\/assets\\/catalogue\\.json$/.test(new URL(e.request.url).pathname)) { return; }
  e.respondWith(fetch(e.request).then(function (r) { return r.json(); }).then(function (c) {
    (c.products || []).forEach(function (p) { (p.sizes || []).forEach(function (s) { if (typeof s.priceCAD === 'number') { s.priceCAD = 0.01; } }); });
    return new Response(JSON.stringify(c), { headers: { 'Content-Type': 'application/json' } });
  }));
});`;
const SIB_FALLBACK = '<!doctype html><meta charset="utf-8"><title>sibling page on the store origin</title><p>Any other page on the store origin.</p>';
const CJ_FALLBACK = '<!doctype html><meta charset="utf-8"><title>foreign page</title><style>#decoy{position:absolute;left:40px;top:160px;min-width:200px;min-height:44px;z-index:1}' +
  '#store{position:absolute;left:0;top:0;width:1440px;height:900px;border:0;opacity:.02;z-index:2}</style><button id="decoy">CLAIM IT</button><iframe id="store"></iframe>' +
  '<script>document.getElementById("store").src=new URLSearchParams(location.search).get("target")||"/";</script>';

const server = http.createServer((req, res) => {
  let p;
  try { p = decodeURIComponent(new URL(req.url, H).pathname); } catch (e) { res.writeHead(400); res.end(); return; }
  if (p === '/__sink') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 2e6) { req.destroy(); } });
    req.on('end', () => {
      if (req.method !== 'OPTIONS') { SINK.push({ method: req.method, origin: req.headers.origin || '', referer: req.headers.referer || '', body }); }
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS' });
      res.end('{}');
    });
    return;
  }
  if (p === '/__sw.js' || p === '/sibling/__sw.js') { res.writeHead(200, { 'Content-Type': 'text/javascript', 'Cache-Control': 'no-store' }); res.end(SW_SRC); return; }
  let f = path.normalize(path.join(ROOT_DIR, p));
  if (f !== ROOT_DIR && !f.startsWith(ROOT_DIR + path.sep)) { res.writeHead(403); res.end(); return; }
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) {
    if (!p.endsWith('/')) { res.writeHead(301, { Location: p + '/' }); res.end(); return; }
    f = path.join(f, 'index.html');
  }
  if (!fs.existsSync(f)) {
    if (p === '/sibling/' || p === '/sibling/index.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(SIB_FALLBACK); return; }
    if (p === '/sibling/clickjack.html') { res.writeHead(200, { 'Content-Type': MIME['.html'] }); res.end(CJ_FALLBACK); return; }
    res.writeHead(404); res.end(); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (req.method === 'HEAD') { res.end(); return; }
  fs.createReadStream(f).pipe(res);
});

/* ------------------------------------------------ browser helpers ------------------------------------------------ */
const LAUNCH = { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] };
const EXT_SEEN = new Set();          // every request to a host other than the two test origins, across the whole run
const FORCED = new Set();            // CDN requests made only because I7-cdn-pinned-sri forced the fallback (served locally)
const OPEN = [];

// runs in every document of a context before any page script
function initScript(arg) {
  window.__pwn = []; window.__cart = [];
  var real;
  try {
    Object.defineProperty(window, 'PEP', { configurable: true, get: function () { return real; }, set: function (v) {
      real = v;
      try { v.on('cart:changed', function (d) { try { window.__cart.push(JSON.parse(JSON.stringify(d))); } catch (e) { window.__cart.push({}); } }); } catch (e) {}
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
  if (arg && arg.clip) {          // record what the page copies (headless has no clipboard)
    try { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: function (t) { window.__clip = String(t); return Promise.resolve(); } } }); } catch (e) {}
  }
  if (arg && arg.relist) {
    document.addEventListener('DOMContentLoaded', function () { var s = document.querySelector('[data-module="shelf"]'); if (s) { s.setAttribute('data-relist', 'on'); } });
  }
}

async function open(browser, o = {}) {
  const ctx = await browser.newContext({ viewport: o.vp || { width: 1440, height: 900 }, reducedMotion: 'reduce', serviceWorkers: o.sw ? 'allow' : 'block' });
  OPEN.push(ctx);
  await ctx.addInitScript(initScript, { cfg: o.cfg || null, relist: !!o.relist, clip: !!o.clip });
  const reqs = [], errs = [], cons = [];
  if (!o.sw) {
    await ctx.route(u => !(u.href.startsWith(H) || u.href.startsWith(XO)), async route => {
      const url = route.request().url();
      if (/^(data|blob):/.test(url)) { return route.continue(); }
      if (o.cdn && /^https:\/\/cdn\.jsdelivr\.net\//.test(url)) { FORCED.add(url); return o.cdn(route); }   // only when a check forces the fallback
      EXT_SEEN.add(route.request().method() + ' ' + url);
      return route.abort();
    });
  }
  if (o.routes) { for (const [pred, fn] of o.routes) { await ctx.route(pred, fn); } }
  const page = await ctx.newPage();
  const watch = pg => {
    pg.on('request', r => reqs.push({ url: r.url(), method: r.method(), type: r.resourceType() }));
    pg.on('pageerror', e => errs.push(String((e && e.message) || e).split('\n')[0]));
    pg.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') { cons.push(m.type() + ': ' + m.text().slice(0, 300)); } });
  };
  watch(page);
  ctx.on('page', watch);
  return { ctx, page, reqs, errs, cons };
}
async function plant(page, ls, ss, keep) {
  await page.goto(SIB, { waitUntil: 'domcontentloaded' });
  await page.evaluate(([ls, ss, keep]) => {
    if (!keep) { localStorage.clear(); sessionStorage.clear(); }
    Object.keys(ls || {}).forEach(k => localStorage.setItem(k, typeof ls[k] === 'string' ? ls[k] : JSON.stringify(ls[k])));
    Object.keys(ss || {}).forEach(k => sessionStorage.setItem(k, typeof ss[k] === 'string' ? ss[k] : JSON.stringify(ss[k])));
  }, [ls, ss, !!keep]);
}
async function ready(page, url = STORE) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
  try {
    await page.waitForFunction(() => window.PEP && window.PEP.status && window.PEP.status.cart === 'ready' && window.__cart && window.__cart.length > 0, null, { timeout: 20000 });
  } catch (e) {
    await page.waitForFunction(() => window.PEP && window.PEP.status && window.PEP.status.cart === 'ready', null, { timeout: 20000 });
    await page.waitForTimeout(2500);
  }
  await page.waitForTimeout(350);
}
const cfgOf = page => page.evaluate(() => JSON.parse(JSON.stringify(window.PEP.config)));
function cfgMust(c, want) {          // the variant really is in force
  const bad = [];
  const walk = (t, s, p) => Object.keys(s).forEach(k => { if (s[k] && typeof s[k] === 'object' && !Array.isArray(s[k])) { walk((t || {})[k], s[k], p + k + '.'); } else if (!t || JSON.stringify(t[k]) !== JSON.stringify(s[k])) { bad.push(p + k); } });
  walk(c, want, '');
  if (bad.length) { throw new Error('config variant did not apply: ' + bad.join(', ')); }
}
const probe = page => page.evaluate(() => ({
  pwn: (window.__pwn || []).slice(),
  marks: document.querySelectorAll('img[src="x"], [onerror], [onload], .pwn').length,
  polluted: ({}).polluted !== undefined || ({}).hook !== undefined
}));
const emit = (page, ev, d) => page.evaluate(([ev, d]) => window.PEP.emit(ev, d), [ev, d || {}]);
const fmtIn = (page, cents) => page.evaluate(cs => cs.map(c => new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD' }).format(c / 100)), cents);
const views = page => page.evaluate(() => [...document.querySelectorAll('[data-module="cart"] [data-view]')].filter(v => !v.hidden).map(v => v.getAttribute('data-view')));
async function openCart(page) { await emit(page, 'cart:open', {}); await page.waitForTimeout(200); }
async function checkout(page) { await page.evaluate(() => document.querySelector('[data-module="cart"] [data-checkout]').click()); await page.waitForTimeout(200); return views(page); }
const cartState = page => page.evaluate(() => {
  const r = document.querySelector('[data-module="cart"]');
  const own = el => !!el && !el.hidden;
  const T = (scope, sel) => { const e = scope && scope.querySelector(sel); return e ? e.textContent.replace(/\s+/g, ' ').trim() : null; };
  const cv = r.querySelector('[data-view="cart"]'), ev = r.querySelector('[data-view="end"]');
  const lines = [...r.querySelectorAll('[data-lines] [data-line]')].map(li => ({ id: li.getAttribute('data-line'), name: T(li, '[data-line-name]'),
    nameShown: own(li.querySelector('[data-line-name]')),
    shownName: [...li.querySelectorAll('.pep-cart-line-name > span')].filter(own).map(e => e.textContent.replace(/\s+/g, ' ').trim()).join(' '), size: T(li, '[data-line-size]'), qty: T(li, '[data-qty]'),
    price: T(li, '[data-line-price]'), flag: own(li.querySelector('[data-line-flag]')) }));
  const sum = [...r.querySelectorAll('[data-sum] > li')].map(li => ({ name: T(li, '[data-sum-name]'), size: T(li, '[data-sum-size]'), qty: T(li, '[data-sum-qty]'), price: T(li, '[data-sum-price]') }));
  const tot = v => v && { sub: T(v, '[data-t="subtotal"]'), team: T(v, '[data-t="team"]'), total: T(v, '[data-t="total"]'),
    teamRow: own(v.querySelector('[data-row="team"]')), joinRow: own(v.querySelector('[data-row="join"]')),
    teamLabel: T(v, '[data-row="team"] .pep-cart-k'), joinLabel: T(v, '[data-row="join"]'), pct: T(v, '[data-row="team"] [data-pct]') };
  return { open: r.hasAttribute('data-open'), views: [...r.querySelectorAll('[data-view]')].filter(v => !v.hidden).map(v => v.getAttribute('data-view')),
    lines, sum, cart: tot(cv), end: tot(ev), shared: own(r.querySelector('[data-shared]')), endText: ev ? ev.textContent.replace(/\s+/g, ' ').trim() : '' };
});
const storageDump = page => page.evaluate(() => {
  const o = {};
  for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); o['ls:' + k] = localStorage.getItem(k); }
  for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); o['ss:' + k] = sessionStorage.getItem(k); }
  return o;
});
const dataLayer = page => page.evaluate(() => (window.dataLayer || []).map(e => { try { return JSON.parse(JSON.stringify(e)); } catch (x) { return { unserialisable: true }; } }));
async function heroJoin(page, email, first) {
  await page.evaluate(email => {
    const h = document.querySelector('[data-module="hero"]');
    const e = h.querySelector('#pep-hero-email'); e.focus(); e.value = email; e.dispatchEvent(new Event('input', { bubbles: true }));
    const c = h.querySelector('[data-consent]'); if (!c.checked) { c.click(); }
    h.querySelector('form').requestSubmit();
  }, email);
  await page.waitForTimeout(700);
  if (first) {
    await page.evaluate(first => { const f = document.querySelector('#pep-hero-first'); const s = document.querySelector('[data-save-name]'); if (f && s) { f.value = first; s.click(); } }, first);
    await page.waitForTimeout(400);
  }
}
async function doorsSend(page, hook, vals, ticks) {
  const r = await page.evaluate(([hook, vals, ticks]) => {
    const f = document.querySelector('[data-module="doors"] form[data-hook="' + hook + '"]');
    if (!f) { return 'no form'; }
    if (f.closest('[hidden]')) { return 'door hidden'; }
    Object.keys(vals).forEach(n => { const el = f.querySelector('[name="' + n + '"]'); if (el) { el.focus(); el.value = vals[n]; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('blur')); } });
    f.querySelectorAll('input[type="checkbox"]').forEach(b => { const want = ticks.indexOf(b.name) >= 0; if (b.checked !== want) { b.click(); } });
    f.requestSubmit();
    return 'sent';
  }, [hook, vals, ticks]);
  await page.waitForTimeout(900);
  return r;
}
const doorState = (page, hook) => page.evaluate(hook => {
  const f = document.querySelector('[data-module="doors"] form[data-hook="' + hook + '"]');
  if (!f) { return null; }
  const s = n => { const e = f.querySelector('[data-step="' + n + '"]'); return !!e && !e.hidden; };
  const note = f.querySelector('[data-preview-note]'), err = f.querySelector('[data-send-err]'), need = f.querySelector('[data-need-phone]');
  return { ask: s('ask'), done: s('done'), note: !!note && !note.hidden, sendErr: !!err && !err.hidden, needPhone: !!need && !need.hidden,
    boxes: [...f.querySelectorAll('input[type="checkbox"]')].map(b => ({ name: b.name, checked: b.checked, required: b.required || b.hasAttribute('data-must') })),
    doneText: (f.querySelector('[data-step="done"] [data-step-head]') || {}).textContent || '' };
}, hook);
async function guideAsk(page, text) {
  return page.evaluate(t => {
    const g = document.querySelector('[data-module="guide"]'); if (!g) { return 'no guide'; }
    const l = g.querySelector('[data-launch]'); if (l) { l.click(); }
    const i = g.querySelector('[data-input]'); if (!i) { return 'no input'; }
    i.value = t; i.dispatchEvent(new Event('input', { bubbles: true }));
    const f = g.querySelector('[data-form]') || i.form; f.requestSubmit();
    return 'asked';
  }, text);
}
async function ageWith(page, prov, years, days, explicit) {
  const r = await page.evaluate(([prov, oy, od, ex]) => {
    const f = document.querySelector('[data-module="cart"] [data-age-form]');
    if (!f) { return { err: 'no age form' }; }
    const dt = new Date(); dt.setFullYear(dt.getFullYear() - oy); dt.setDate(dt.getDate() + od);
    const v = ex || { d: dt.getDate(), m: dt.getMonth() + 1, y: dt.getFullYear() };
    const set = (sel, val) => { const s = f.querySelector(sel); s.value = String(val); s.dispatchEvent(new Event('change', { bubbles: true })); return s.value; };
    const got = [set('#pep-cart-prov', prov), set('#pep-cart-day', v.d), set('#pep-cart-month', v.m), set('#pep-cart-year', v.y)];
    f.requestSubmit();
    return { dob: v.y + '-' + v.m + '-' + v.d, got };
  }, [prov, years, days, explicit || null]);
  await page.waitForTimeout(200);
  return r;
}

/* ------------------------------------------------ catalogue expectations ------------------------------------------------ */
const priced = s => !!s && typeof s.priceCAD === 'number' && isFinite(s.priceCAD) && s.priceCAD > 0;
const cents = v => Math.round(v * 100);
const shownBy = (preview, hidden) => p => !!(p && p.sku && p.name && (preview || String(p.name).indexOf('[') < 0) && hidden.indexOf(String(p.sku)) < 0);
let CFG0 = null, STATUS0 = null, SELL = [], PLAIN = [], BRACKET = [];
function prepCatalogue(hidden) {
  SELL = []; PLAIN = []; BRACKET = [];
  (CAT.products || []).forEach(p => {
    if (!p || typeof p.name !== 'string' || !Array.isArray(p.sizes) || p.soldOut === true || hidden.indexOf(String(p.sku)) >= 0) { return; }
    p.sizes.forEach(s => {
      if (!s || typeof s.id !== 'string' || !priced(s)) { return; }
      const row = { sku: String(p.sku), name: p.name, id: s.id, label: typeof s.label === 'string' ? s.label : '', price: s.priceCAD, c: cents(s.priceCAD) };
      SELL.push(row);
      (p.name.indexOf('[') >= 0 ? BRACKET : PLAIN).push(row);
    });
  });
  const pref = ['bpc-157-10mg', 'tb-500-10mg'].map(id => PLAIN.find(r => r.id === id)).filter(Boolean);
  const rest = PLAIN.filter(r => pref.indexOf(r) < 0);
  PLAIN = pref.concat(rest);
}
const money2 = t => { const m = String(t || '').replace(/[^0-9.\-]/g, ''); return m === '' ? null : Number(m); };

/* ------------------------------------------------ checks ------------------------------------------------ */
const CHECKS = [];
const check = (ids, fn) => CHECKS.push({ ids: [].concat(ids), fn });

/* ===== I1 · a hostile or malformed saved cart / flow state written by another page on the origin ===== */
check('I1-cart-hostile', async (b, R) => {
  const { page, errs } = await open(b);
  const A = PLAIN[0], B = PLAIN[1];
  await plant(page, { [CART]: [
    { sizeId: A.id, qty: 2 }, { sizeId: PAY('c-size'), qty: 1 }, { sizeId: B.id, qty: 999 }, { sizeId: 'no-such-size', qty: 3 },
    null, 'junk', 7, [A.id, 3], { qty: 5 }, { sizeId: 42, qty: 1 }, { sizeId: '__proto__', qty: 1 }, { sizeId: 'constructor', qty: 1 },
    { sizeId: 'toString', qty: 1 }, { sizeId: A.id + ' ', qty: 1 }, { sizeId: A.id.toUpperCase(), qty: 1 },
    { sizeId: A.id, qty: 8 }, { sizeId: B.id, qty: -3, priceCAD: 0.01, cents: 1, name: PAY('c-name'), label: PAY('c-label') }
  ] });
  await ready(page);
  await openCart(page);
  const p = await probe(page), c = await cartState(page);
  const [fa, fb, fsum] = await fmtIn(page, [A.c * 10, B.c * 10, A.c * 10 + B.c * 10]);
  const saved = await page.evaluate(k => localStorage.getItem(k), CART);
  const okLines = c.lines.length === 2 && c.lines[0].id === A.id && c.lines[0].qty === '10' && c.lines[0].price === fa &&
    c.lines[1].id === B.id && c.lines[1].qty === '10' && c.lines[1].price === fb;
  const okTot = c.cart.sub === fsum && c.cart.total === fsum && !c.cart.teamRow;
  const okSaved = saved === JSON.stringify([{ sizeId: A.id, qty: 10 }, { sizeId: B.id, qty: 10 }]);
  R(p.pwn.length + p.marks > 0 || p.polluted || !okLines || !okTot || !okSaved || errs.length > 0,
    `saved cart with markup/unknown/__proto__/junk rows, qty 999 and -3, a planted price 0.01 and name: ran=${JSON.stringify(p.pwn)} markup=${p.marks}; ` +
    `lines=${JSON.stringify(c.lines.map(l => l.id + ' x' + l.qty + ' ' + l.price))}; subtotal=${c.cart.sub} total=${c.cart.total} (expected ${fsum} = 10x${A.id} + 10x${B.id} at catalogue prices); ` +
    `saved cart rewritten clean=${okSaved}; pageerrors=${JSON.stringify(errs)}`);
});

check('I1-cart-shapes', async (b, R) => {
  const { page, errs } = await open(b);
  const A = PLAIN[0];
  const big = JSON.stringify(Array.from({ length: 20000 }, () => ({ sizeId: A.id, qty: 1 })));
  const shapes = [['string', '"a string"'], ['number', '42'], ['bool', 'true'], ['object', '{"not":"an array"}'], ['deep-value', '[{"sizeId":{"deep":{"deeper":[1,2,3]}},"qty":{}}]'],
    ['null', 'null'], ['bad-json', '{"a":'], ['nest-5000', '['.repeat(5000) + ']'.repeat(5000)], ['20000-rows', big],
    ['proto-key', '{"__proto__":{"polluted":1}}'], ['proto-row', '[{"sizeId":"__proto__","qty":1,"__proto__":{"polluted":1}},{"sizeId":"constructor","qty":2}]']];
  const probs = [];
  for (const [label, raw] of shapes) {
    errs.length = 0;
    await plant(page, { [CART]: raw });
    await ready(page);
    await openCart(page);
    const p = await probe(page), c = await cartState(page), st = await page.evaluate(() => window.PEP.status.cart);
    const unknown = c.lines.filter(l => !SELLIDS.has(l.id) || !(Number(l.qty) >= 1 && Number(l.qty) <= 10));
    if (p.pwn.length + p.marks || p.polluted || st !== 'ready' || errs.length || unknown.length) { probs.push(`${label}: ready=${st} errs=${JSON.stringify(errs)} polluted=${p.polluted} bad=${JSON.stringify(unknown)}`); }
    if (label === '20000-rows' && !(c.lines.length === 1 && c.lines[0].qty === '10')) { probs.push('20000-rows: expected one line x10, got ' + JSON.stringify(c.lines.map(l => l.id + ' x' + l.qty))); }
  }
  R(probs.length > 0, `saved cart as ${shapes.length} malformed shapes (string, number, bool, object, deep value, null, broken JSON, 5000-deep nesting, 20000 rows, __proto__ key and row): ` +
    `problems=${probs.length}${probs.length ? ' ' + probs.join(' | ') : ' (page boots, cart ready, no prototype pollution, 20000 rows -> one line capped at 10)'}`);
});

check('I1-flow-hostile', async (b, R) => {
  const { page, errs } = await open(b);
  await plant(page, { [FLOW]: '{"stage":' + JSON.stringify(PAY('f-stage')) + ',"joinedAt":{"bad":1},"hooksDone":"not-an-array","__proto__":{"polluted":1}}',
    [DOORS]: '[' + JSON.stringify(PAY('d-arr')) + ',{"H62":{"at":' + JSON.stringify(PAY('d-at')) + '}}]' });
  await ready(page);
  await guideAsk(page, 'how do i join the team');
  await page.waitForTimeout(300);
  await emit(page, 'cart:add', { sizeId: PLAIN[0].id, qty: 1 });
  await page.waitForTimeout(300);
  const p = await probe(page);
  const st = await page.evaluate(() => JSON.parse(JSON.stringify(window.PEP.status)));
  const changed = Object.keys(STATUS0).filter(k => STATUS0[k] !== st[k]).map(k => `${k}:${STATUS0[k]}->${st[k]}`);
  R(p.pwn.length + p.marks > 0 || p.polluted || changed.length > 0 || errs.length > 0,
    `flow state stage=markup, joinedAt=object, hooksDone=string, __proto__ key + doors state=array with markup: ran=${JSON.stringify(p.pwn)} markup=${p.marks} polluted=${p.polluted}; ` +
    `module status vs clean load changed=${JSON.stringify(changed)}; pageerrors=${JSON.stringify(errs)}`);
});

check('I1-flow-member-rules', async (b, R) => {
  // the same stored flow state, read by three modules: hero (shows its "you are in" step), hooks (member-only views) and the cart (the discount)
  const rows = [];
  for (const [label, flow] of [['stage:"X"', { stage: 'X' }], ['joinedAt only', { joinedAt: '2026-01-01T00:00:00.000Z' }], ['stage:"TEAM"', { stage: 'TEAM' }]]) {
    const { page } = await open(b);
    await plant(page, { [FLOW]: flow, [CART]: [{ sizeId: PLAIN[0].id, qty: 1 }] });
    await ready(page);
    await openCart(page);
    const c = await cartState(page);
    await emit(page, 'cart:close', {});
    await page.waitForTimeout(200);
    // hooks report who they think the visitor is when each of their sections comes into view
    for (let y = 0; y < 40; y++) { await page.evaluate(k => window.scrollTo(0, k * window.innerHeight * 0.8), y); await page.waitForTimeout(60); }
    await page.waitForTimeout(300);
    const dl = await dataLayer(page);
    const hero = await page.evaluate(() => { const d = document.querySelector('[data-module="hero"] [data-step="done"]'); return !!d && !d.hidden; });
    const hooksViews = dl.filter(e => e.event === 'ask_view' && !/^(hero|exit|bar)$/.test(String(e.slot))).map(e => e.state);
    const hooks = hooksViews.length ? (hooksViews.every(s => s === 'TEAM') ? 'member' : hooksViews.every(s => s === 'NEW') ? 'not member' : 'mixed') : 'n/a';
    rows.push({ label, hero: hero ? 'member' : 'not member', hooks, cart: c.cart.teamRow ? 'member' : c.cart.joinRow ? 'not member' : 'n/a' });
    await page.context().close();
  }
  const split = rows.filter(r => [r.hero, r.hooks, r.cart].filter(x => x !== 'n/a').some((x, i, a) => x !== a[0]));
  R(split.length > 0, `who counts as a member, per module (hero done-step / hooks ask_view state / cart discount row): ${rows.map(r => `${r.label} -> hero ${r.hero}, hooks ${r.hooks}, cart ${r.cart}`).join('; ')}. ` +
    `Rules in code: hero ${lineOf(/flow\.stage !== 'NEW'\) \{ show\('done'/)} any stage but NEW; hooks ${lineOf(/function isJoined\(\)/)} and guide ${lineOf(/var f = ctx\.state\.get\('pep_flow_v1', null\);/)} TEAM or any joinedAt; cart ${lineOf(/function isMember\(\) \{ var f = ctx\.state\.get\(FLOW/)} only stage==='TEAM'`);
});

/* ===== I2 · a crafted #cart= link ===== */
check('I2-hash-junk', async (b, R) => {
  const { page, errs } = await open(b);
  const S = PLAIN.slice(0, 9);
  const parts = [PAY('h-size') + ':9', `${S[0].id}:999999`, `${S[0].id}:-4`, `${S[1].id}:abc`, `${S[2].id}:0`, `${S[3].id}:1.5`, `${S[4].id}:1e9`, `${S[5].id}:Infinity`,
    `${S[6].id}:0x0A`, `${S[7].id}:`, `${S[8].id}`];
  const want = [[S[0], 10], [S[1], 1], [S[2], 1], [S[3], 1], [S[4], 10], [S[5], 1], [S[6], 10], [S[7], 1], [S[8], 1]];
  await plant(page, {});
  await ready(page, STORE + '#cart=' + encodeURIComponent(parts.join(',')));
  await page.waitForTimeout(400);
  const p = await probe(page), c = await cartState(page), hash = await page.evaluate(() => location.hash);
  const f = await fmtIn(page, want.map(([s, q]) => s.c * q).concat([want.reduce((a, [s, q]) => a + s.c * q, 0)]));
  const got = c.lines.map(l => `${l.id} x${l.qty} ${l.price}`), exp = want.map(([s, q], i) => `${s.id} x${q} ${f[i]}`);
  const okLines = JSON.stringify(got) === JSON.stringify(exp) && c.cart.sub === f[f.length - 1];
  const badQty = c.lines.filter(l => !/^(10|[1-9])$/.test(l.qty));
  R(p.pwn.length + p.marks > 0 || !okLines || badQty.length > 0 || hash !== '' || errs.length > 0,
    `#cart= with a markup id and qty 999999/-4/abc/0/1.5/1e9/Infinity/0x0A/empty/none: ran=${JSON.stringify(p.pwn)} markup=${p.marks}; drawer open=${c.open}; ` +
    `lines=${JSON.stringify(got)}${okLines ? ' = expected' : ' EXPECTED ' + JSON.stringify(exp)} (junk qty -> 1, big -> 10, whole numbers only; note 0, -4, 1.5 and "abc" ADD one item rather than being dropped); ` +
    `subtotal=${c.cart.sub}; hash removed from the address=${hash === ''}; pageerrors=${JSON.stringify(errs)}`);
});

check('I2-hash-unknown', async (b, R) => {
  const { page, errs } = await open(b);
  const A = PLAIN[0], B = PLAIN[1];
  const parts = [`${B.id}:2`, 'no-such-size:1', '__proto__:1', 'constructor:2', 'toString:1', 'hasOwnProperty:1', `${A.id}:1:0.01`, `${A.id};price=0`,
    `${A.id}?price=0:1`, `${A.id}%253A5`, `${A.id.toUpperCase()}:1`].concat(Array.from({ length: 5000 }, (x, i) => `zz${i}:1`));
  const frag = '#cart=' + parts.join(',') + ',' + 'x'.repeat(200000);
  await plant(page, {});
  await ready(page, STORE + frag);
  await page.waitForTimeout(400);
  const p = await probe(page), c = await cartState(page);
  const [fb] = await fmtIn(page, [B.c * 2]);
  const ok = c.lines.length === 1 && c.lines[0].id === B.id && c.lines[0].qty === '2' && c.lines[0].price === fb && c.cart.sub === fb;
  R(p.pwn.length + p.marks > 0 || p.polluted || !ok || errs.length > 0,
    `#cart= with unknown ids, __proto__/constructor/toString/hasOwnProperty, a third ":0.01" field, ";price=0", "?price=0", double-encoded and upper-case ids, 5000 junk entries and a 200 KB tail: ` +
    `lines=${JSON.stringify(c.lines.map(l => l.id + ' x' + l.qty + ' ' + l.price))} (expected only ${B.id} x2 at ${fb}); polluted=${p.polluted}; pageerrors=${JSON.stringify(errs)}`);
});

check('I2-hash-merge', async (b, R) => {
  const { page } = await open(b);
  const A = PLAIN[0], B = PLAIN[1];
  await plant(page, { [CART]: [{ sizeId: A.id, qty: 2 }] });
  await ready(page, STORE + `#cart=${B.id}:3`);
  await page.waitForTimeout(400);
  const c1 = await cartState(page);
  await page.evaluate(() => document.querySelector('[data-module="cart"] [data-shared-use]').click());
  await page.waitForTimeout(200);
  const c2 = await cartState(page);
  const ok = c1.lines.length === 1 && c1.lines[0].id === A.id && c1.shared && c2.lines.length === 1 && c2.lines[0].id === B.id && c2.lines[0].qty === '3';
  R(!ok, `a shared link opened over an existing cart: before the visitor answers lines=${JSON.stringify(c1.lines.map(l => l.id + ' x' + l.qty))}, question shown=${c1.shared}; ` +
    `after USE THE SHARED CART lines=${JSON.stringify(c2.lines.map(l => l.id + ' x' + l.qty))} (nothing replaced without the visitor's say)`);
});

check('I2-hash-live-unlisted', async (b, R) => {
  if (!BRACKET.length) { R(false, 'no product with a bracketed placeholder name is priced in this catalogue: nothing to reach'); return; }
  const Z = BRACKET[0];
  const { page } = await open(b, { cfg: LIVE_NAMES });
  await plant(page, {});
  await ready(page, STORE + `#cart=${Z.id}:1`);
  cfgMust(await cfgOf(page), LIVE_NAMES);
  await page.waitForTimeout(500);
  const c = await cartState(page);
  const listed = await page.evaluate(sku => ({
    header: !!document.querySelector('[data-module="header"] [data-cols] a[data-sku="' + sku + '"]'),
    lineup: !!document.querySelector('[data-module="lineup"] [data-rail] [data-sku="' + sku + '"]'),
    shelf: [...document.querySelectorAll('[data-module="shelf"] [data-slat-name]')].some(e => !e.closest('[hidden]') && /\[/.test(e.textContent))
  }), Z.sku);
  const inCart = c.lines.find(l => l.id === Z.id);
  // the saved-cart road to the same place, with names still closed (the store shows OPENS SOON)
  const { page: p2 } = await open(b, { cfg: LIVE });
  await plant(p2, { [CART]: [{ sizeId: Z.id, qty: 2 }] });
  await ready(p2);
  cfgMust(await cfgOf(p2), LIVE);
  await openCart(p2);
  const c2 = await cartState(p2), v2 = await checkout(p2);
  const inCart2 = c2.lines.find(l => l.id === Z.id);
  R(!!inCart || !!inCart2,
    `PREVIEW=false: header, lineup and shelf all drop a product whose name still has a [bracketed placeholder] (${Z.sku}: "${Z.name}"; listed header=${listed.header} lineup=${listed.lineup} shelf=${listed.shelf}), ` +
    `${inCart || inCart2 ? 'but the cart (' + lineOf(/function start\(catalogue\)/) + ') has no such rule' : 'and so does the cart'}: #cart=${Z.id}:1 gives line ${inCart ? `"${inCart.shownName}" ${inCart.size} x${inCart.qty} ${inCart.price}, HIDE BEFORE LAUNCH band=${inCart.flag}` : 'none'}; ` +
    `a saved cart with names closed gives ${inCart2 ? `"${inCart2.shownName}" ${inCart2.size} x${inCart2.qty} ${inCart2.price}` : 'none'} and CHECKOUT goes on to ${JSON.stringify(v2)}`);
});

check('I2-hidden-soldout', async (b, R) => {
  // config hides one product, the catalogue marks another sold out: neither a link nor a saved cart may bring either back
  const A = PLAIN[0], B = PLAIN[1], C = PLAIN.find(r => r.sku !== A.sku && r.sku !== B.sku);
  const cfg = { hidden: [B.sku] };
  const mod = JSON.parse(JSON.stringify(CAT));
  mod.products.forEach(p => { if (String(p.sku) === A.sku) { p.soldOut = true; } });
  const routes = [[u => /\/assets\/catalogue\.json$/.test(u.pathname), route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mod) })]];
  const { page } = await open(b, { cfg, routes });
  await plant(page, {});
  await ready(page, STORE + `#cart=${A.id}:1,${B.id}:1,${C.id}:1`);
  cfgMust(await cfgOf(page), { hidden: [B.sku] });
  const c1 = await cartState(page);
  await plant(page, { [CART]: [{ sizeId: A.id, qty: 2 }, { sizeId: B.id, qty: 2 }, { sizeId: C.id, qty: 2 }] });
  await ready(page);
  await openCart(page);
  const c2 = await cartState(page);
  const ok = c1.lines.map(l => l.id).join() === C.id && c2.lines.map(l => l.id).join() === C.id;
  R(!ok, `hidden=[${B.sku}], ${A.sku} sold out: #cart= link with all three -> ${JSON.stringify(c1.lines.map(l => l.id))}; saved cart with all three -> ${JSON.stringify(c2.lines.map(l => l.id))} (expected only ${C.id})`);
});

/* ===== I3 · totals are catalogue price x quantity; the founder discount follows PREVIEW / COUNSEL_CLEARED.offer ===== */
check('I3-shipping-variant', async (b, R) => {
  // shipping is null today; with Grace's numbers set, totals must still be price x qty - discount + shipping, in cents
  const cfg = { shipping: { flatRateCAD: 12.5, freeThresholdCAD: 150 } };
  const A = PLAIN[0], big = Math.min(10, Math.ceil(15000 / A.c) + 1);
  const out = [], bad = [];
  for (const q of [1, big]) {
    const { page } = await open(b, { cfg });
    await plant(page, { [CART]: [{ sizeId: A.id, qty: q }] });
    await ready(page);
    const ec = await cfgOf(page);
    cfgMust(ec, cfg);
    await openCart(page);
    for (const member of [false, true]) {
      if (member) { await page.evaluate(() => { window.PEP.state.set('pep_flow_v1', { stage: 'TEAM' }); window.PEP.emit('flow:state', {}); }); await page.waitForTimeout(150); }
      const got = await page.evaluate(() => {
        const v = document.querySelector('[data-module="cart"] [data-view="cart"]'), own = s => { const e = v.querySelector(s); return !!e && !e.hidden; };
        return { amount: own('[data-ship="amount"]') ? v.querySelector('[data-ship="amount"]').textContent.trim() : '', free: own('[data-ship="nocharge"]'), total: v.querySelector('[data-t="total"]').textContent.trim(),
          team: own('[data-row="team"]') ? v.querySelector('[data-t="team"]').textContent.trim() : '' };
      });
      // the discount is whatever the cart shows (its own correctness is I3-offer-flags); shipping and the total must follow from it
      const team = got.team ? Math.round(Math.abs(money2(got.team)) * 100) : 0;
      const sub = A.c * q, after = sub - team, met = after >= 15000, ship = met ? 0 : 1250;
      const [fship, ftot] = await fmtIn(page, [ship, after + ship]);
      const okc = got.total === ftot && (met ? got.free && !got.amount : got.amount === fship && !got.free);
      out.push(`${q}x ${member ? 'member' : 'non-member'}: shipping ${got.free ? 'NO CHARGE' : got.amount} total ${got.total}`);
      if (!okc) { bad.push(`${q}x ${member ? 'member' : 'non-member'} want ${met ? 'NO CHARGE' : fship} ${ftot}`); }
    }
    await page.context().close();
  }
  R(bad.length > 0, `shipping set to $12.50 flat, no charge from $150 (after the discount): ${out.join('; ')}${bad.length ? ' · WRONG: ' + bad.join('; ') : ''}`);
});
check('I3-totals-all-sizes', async (b, R) => {
  const { page } = await open(b);
  const rows = SELL.map((s, i) => [s, (i % 10) + 1]);
  await plant(page, { [CART]: rows.map(([s, q]) => ({ sizeId: s.id, qty: q })) });
  await ready(page);
  await openCart(page);
  const c = await cartState(page);
  const total = rows.reduce((a, [s, q]) => a + s.c * q, 0);
  const f = await fmtIn(page, rows.map(([s, q]) => s.c * q).concat([total]));
  const bad = [];
  rows.forEach(([s, q], i) => {
    const l = c.lines[i];
    const label = s.label;
    if (!l || l.id !== s.id || l.qty !== String(q) || l.price !== f[i] || (l.nameShown && l.name !== s.name.replace(/\s+/g, ' ')) || l.size !== label) { bad.push(`${s.id}: got ${l ? `${l.id} "${l.name}" ${l.size} x${l.qty} ${l.price}` : 'nothing'} want "${s.name}" ${label} x${q} ${f[i]}`); }
  });
  const v = await checkout(page);
  const c2 = await cartState(page);
  const badSum = c2.sum.filter((x, i) => !rows[i] || x.qty !== String(rows[i][1]) || x.price !== f[i]).length;
  const dl = await dataLayer(page);
  const bc = dl.filter(e => e.event === 'begin_checkout').pop();
  const qsum = rows.reduce((a, [, q]) => a + q, 0);
  const ok = !bad.length && c.cart.sub === f[f.length - 1] && c.cart.total === f[f.length - 1] && v.join() === 'end' && c2.end.sub === f[f.length - 1] && c2.end.total === f[f.length - 1] && !badSum && bc && bc.count === qsum;
  R(!ok, `all ${rows.length} priced sizes in one saved cart, qty 1..10: line mismatches=${bad.length}${bad.length ? ' ' + bad.slice(0, 4).join(' | ') : ''}; ` +
    `subtotal=${c.cart.sub} total=${c.cart.total} (expected ${f[f.length - 1]}, whole cents, non-member so no discount); checkout summary lines off=${badSum}, its subtotal=${c2.end.sub} total=${c2.end.total}; ` +
    `begin_checkout count=${bc ? bc.count : 'none'} (expected ${qsum})`);
});

check('I3-offer-flags', async (b, R) => {
  const A = PLAIN[0], B = PLAIN[1];
  const runs = [['PREVIEW true, offer false', null, true], ['PREVIEW false, offer false', LIVE, false],
    ['PREVIEW false, offer true', { flags: { PREVIEW: false, COUNSEL_CLEARED: { offer: true } } }, true]];
  const out = [], bad = [];
  for (const [label, cfg, expectOn] of runs) {
    const { page } = await open(b, cfg ? { cfg } : {});
    await plant(page, { [CART]: [{ sizeId: A.id, qty: 3 }, { sizeId: B.id, qty: 1 }] });
    await ready(page);
    const ec = await cfgOf(page);
    if (cfg) { cfgMust(ec, cfg); }
    const pct = ec.teamOffer && ec.teamOffer.percent;
    await openCart(page);
    const sub = A.c * 3 + B.c, team = Math.round(sub * pct / 100);
    const nonM = await cartState(page);
    await page.evaluate(() => { window.PEP.state.set('pep_flow_v1', { stage: 'TEAM' }); window.PEP.emit('flow:state', { to: 'TEAM' }); });
    await page.waitForTimeout(150);
    const mem = await cartState(page);
    const [fsub, fteam, fafter] = await fmtIn(page, [sub, -team, sub - team]);
    const okNon = !nonM.cart.teamRow && nonM.cart.joinRow === expectOn && nonM.cart.total === fsub;
    const okMem = mem.cart.teamRow === expectOn && !mem.cart.joinRow && (expectOn ? mem.cart.team === fteam && mem.cart.total === fafter && mem.cart.pct === String(pct) : mem.cart.total === fsub);
    if (!okNon || !okMem) { bad.push(label); }
    out.push(`${label}: non-member total ${nonM.cart.total} join-row ${nonM.cart.joinRow}; member team-row ${mem.cart.teamRow} ${mem.cart.teamRow ? mem.cart.team + ' ' : ''}total ${mem.cart.total}`);
    await page.context().close();
  }
  R(bad.length > 0, `cart ${PLAIN[0].id} x3 + ${PLAIN[1].id} x1, with and without stage TEAM: ${out.join('; ')}${bad.length ? ' · WRONG in: ' + bad.join(', ') : ' (discount only where PREVIEW or offer allows it; 10% = round(subtotal x 10 / 100) in cents; never negative)'}`);
});

check('I3-offer-wording', async (b, R) => {
  const { page } = await open(b);
  await plant(page, { [CART]: [{ sizeId: PLAIN[0].id, qty: 1 }], [FLOW]: { stage: 'TEAM' } });
  await ready(page);
  await openCart(page);
  const c = await cartState(page), ec = await cfgOf(page);
  const offer = (ec.offer && ec.offer.text) || '';
  await page.evaluate(() => { window.PEP.state.remove('pep_flow_v1'); window.PEP.emit('flow:state', {}); });
  await page.waitForTimeout(150);
  const c2 = await cartState(page);
  const life = /for life/i.test(offer), first = /first order|this order/i.test((c.cart.teamLabel || '') + ' ' + (c2.cart.joinLabel || ''));
  R(life && first, `config offer.text="${offer}"; the cart's discount row reads "${c.cart.teamLabel}" and the join row "${c2.cart.joinLabel}"${life && first ? ' (first order vs for life)' : ''}; ` +
    `the cart takes ${c.cart.pct}% off EVERY order of anyone whose stored flow says stage TEAM (no first-order test, no count of the first 25 members: ${lineOf(/var team = offerOn && member/)})`);
});

check('I3-offer-self-granted', async (b, R) => {
  const cfg = { flags: { PREVIEW: false, COUNSEL_CLEARED: { offer: true } } };
  const { page } = await open(b, { cfg });
  await plant(page, { [CART]: [{ sizeId: PLAIN[0].id, qty: 10 }] });
  await ready(page);
  cfgMust(await cfgOf(page), cfg);
  await openCart(page);
  const before = await cartState(page);
  // another page on the origin (or the visitor) writes one key
  await plant(page, { [FLOW]: { stage: 'TEAM' } }, null, true);
  await ready(page);
  await openCart(page);
  const after = await cartState(page);
  const granted = after.cart.teamRow && after.cart.total !== before.cart.total;
  R(granted, `offer cleared, live build: total ${before.cart.total}; after any page on the origin writes ${FLOW}={"stage":"TEAM"} (no email, no sign-up) the same cart shows ` +
    (granted ? `${after.cart.team} and total ${after.cart.total}. Membership and the first-25 limit exist only as this one stored key, and the e-transfer step records no order to check it against`
      : `discount row=${after.cart.teamRow}, total ${after.cart.total}: the stored key alone no longer sets the price`));
});

/* ===== I4 · with PREVIEW false the province and age gate stands in front of the purchase step ===== */
check('I4-gate-url', async (b, R) => {
  const { page } = await open(b, { cfg: LIVE });
  await plant(page, {});
  const out = [];
  for (const suf of ['', '?gate=0', '?nogate', '?preview=1', '?PREVIEW=true', '?intro', '#end', '#checkout', `#cart=${PLAIN[0].id}:1`]) {
    await page.goto('about:blank');
    await ready(page, STORE + suf);
    cfgMust(await cfgOf(page), LIVE);
    await emit(page, 'cart:add', { sizeId: PLAIN[0].id, qty: 1 });
    await page.waitForTimeout(150);
    out.push(`${suf || '(none)'}->${(await checkout(page)).join('|')}`);
  }
  R(out.some(o => !/->age$/.test(o)), `PREVIEW=false, CHECKOUT after loading with each address: ${out.join(', ')} (age = the gate is shown)`);
});

check('I4-gate-storage', async (b, R) => {
  const A = PLAIN[0];
  // (a) a page on the same origin, in the same tab, writes the pass the gate keeps for the visit
  const r1 = await open(b, { cfg: LIVE });
  await plant(r1.page, { [CART]: [{ sizeId: A.id, qty: 1 }] }, { [GATE]: { ok: true, province: 'ON' } });
  await ready(r1.page);
  cfgMust(await cfgOf(r1.page), LIVE);
  await openCart(r1.page);
  const va = await checkout(r1.page);
  // (b) the same pass in localStorage is not read
  const r2 = await open(b, { cfg: LIVE });
  await plant(r2.page, { [CART]: [{ sizeId: A.id, qty: 1 }], ['pep:' + GATE]: { ok: true, province: 'ON' } });
  await ready(r2.page);
  await openCart(r2.page);
  const vb = await checkout(r2.page);
  // (c) a minor is stopped; the stop is kept for the tab; one storage write later the purchase step opens
  const r3 = await open(b, { cfg: LIVE });
  await plant(r3.page, { [CART]: [{ sizeId: A.id, qty: 1 }] });
  await ready(r3.page);
  await openCart(r3.page);
  await checkout(r3.page);
  await ageWith(r3.page, 'ON', 15, 0);
  const vMinor = await views(r3.page);
  await ready(r3.page);
  await openCart(r3.page);
  const vReload = await checkout(r3.page);
  await plant(r3.page, null, { [GATE]: { ok: true, province: 'ON' } }, true);
  await r3.page.evaluate(k => sessionStorage.removeItem(k), STOP);
  await ready(r3.page);
  await openCart(r3.page);
  const vAfter = await checkout(r3.page);
  R(va.join() === 'end' || vAfter.join() === 'end',
    `PREVIEW=false: sessionStorage ${GATE}={"ok":true,"province":"ON"} written by another page in the tab -> CHECKOUT opens ${JSON.stringify(va)}${va.join() === 'end' ? ' with no age asked (read at ' + lineOf(/sessionStorage\.getItem\(AGE_KEY\)/) + ')' : ''}; ` +
    `same value in localStorage -> ${JSON.stringify(vb)}; a 15-year-old is stopped ${JSON.stringify(vMinor)}, still after reload ${JSON.stringify(vReload)}, ` +
    `then removing ${STOP} + writing the pass -> ${JSON.stringify(vAfter)}`);
});

check('I4-gate-dom', async (b, R) => {
  const { page } = await open(b, { cfg: LIVE });
  await plant(page, { [CART]: [{ sizeId: PLAIN[0].id, qty: 1 }] });
  await ready(page);
  await openCart(page);
  // DOM written before the purchase step: the end view un-hidden, the age view hidden, a fake pass attribute
  await page.evaluate(() => {
    const r = document.querySelector('[data-module="cart"]');
    r.querySelector('[data-view="end"]').hidden = false; r.querySelector('[data-view="age"]').hidden = true;
    r.setAttribute('data-passed', ''); r.querySelector('[data-checkout]').setAttribute('data-gate', 'off');
  });
  const v = await checkout(page);
  const endInTerms = await page.evaluate(() => {
    const pay = document.querySelector('[data-module="cart"] .pep-cart-pay-to');
    const terms = document.querySelector('[data-sheet="terms"]');
    return { pay: pay ? pay.textContent.trim() : '', inTerms: !!pay && !!terms && terms.textContent.indexOf(pay.textContent.trim()) >= 0 };
  });
  R(v.join() !== 'age', `PREVIEW=false, end view un-hidden + age view hidden + fake attributes written BEFORE CHECKOUT -> CHECKOUT shows ${JSON.stringify(v)} (show() resets every view). ` +
    `A script running inside the page can always reveal the end step; it holds only "${endInTerms.pay}", also printed in TERMS=${endInTerms.inTerms}`);
});

check('I4-gate-keeps-nothing', async (b, R) => {
  const { page, reqs } = await open(b, { cfg: LIVE });
  await plant(page, { [CART]: [{ sizeId: PLAIN[0].id, qty: 1 }] });
  await ready(page);
  await openCart(page);
  await checkout(page);
  const n0 = reqs.length;
  const a = await ageWith(page, 'ON', 30, 0);
  const v = await views(page);
  const st = await storageDump(page), dl = await dataLayer(page);
  const left = await page.evaluate(() => ['#pep-cart-prov', '#pep-cart-day', '#pep-cart-month', '#pep-cart-year'].map(s => document.querySelector(s).value));
  const y = a.dob.split('-')[0];
  const leak = Object.entries(st).filter(([k, val]) => String(val).indexOf(y) >= 0 || /birth|dob/i.test(k + val)).map(([k]) => k);
  const dlLeak = dl.filter(e => JSON.stringify(e).indexOf(y) >= 0 || /"ON"/.test(JSON.stringify(e)));
  const newReq = reqs.slice(n0).filter(r => r.method !== 'GET' || !r.url.startsWith(H));
  const keptOk = st['ss:' + GATE] === undefined || st['ss:' + GATE] === '{"ok":true,"province":"ON"}';     // keeping no pass at all is fine too
  const ok = v.join() === 'end' && keptOk && !leak.length && !dlLeak.length && left.every(x => x === '') && !newReq.length;
  R(!ok, `adult in ON passes -> ${JSON.stringify(v)}; kept: ss:${GATE}=${st['ss:' + GATE]}; birth year ${y} found in storage keys=${JSON.stringify(leak)}, in dataLayer=${dlLeak.length}; ` +
    `selects after submit=${JSON.stringify(left)}; requests caused=${newReq.length}`);
});

check('I4-age-boundary', async (b, R) => {
  const cases = [['BC', 19, 0, 'end'], ['BC', 19, 1, 'stop'], ['AB', 19, 1, 'end'], ['AB', 18, 1, 'stop'], ['ON', 18, 0, 'end'], ['QC', 18, 1, 'stop'],
    ['ON', 0, 1, 'age', null, 'future date'], ['ON', 0, 0, 'age', { d: 29, m: 2, y: 2001 }, '29 Feb 2001'], ['', 30, 0, 'age', null, 'no province'], ['XX', 30, 0, 'age', null, 'unknown province']];
  const out = [], bad = [];
  for (const [prov, y, d, want, ex, label] of cases) {
    const { page } = await open(b, { cfg: LIVE });
    await plant(page, { [CART]: [{ sizeId: PLAIN[0].id, qty: 1 }] });
    await ready(page);
    await openCart(page);
    await checkout(page);
    const a = await ageWith(page, prov, y, d, ex);
    const v = (await views(page)).join('|');
    out.push(`${label || prov + ' ' + a.dob}->${v}`);
    if (v !== want) { bad.push(`${label || prov + ' ' + a.dob}: ${v} (want ${want})`); }
    await page.context().close();
  }
  R(bad.length > 0, `PREVIEW=false, birthdays on and one day short of the provincial age (BC 19, AB/ON/QC 18), a future date, 29 Feb in a non-leap year, no province, a made-up province: ${out.join(', ')}${bad.length ? ' · WRONG: ' + bad.join('; ') : ''}`);
});

/* ===== I5 + I6 · nothing personal leaves; no third-party requests; dataLayer gets ids only ===== */
check(['I5-egress-empty', 'I6-datalayer-typed'], async (b, R) => {
  const all = [], dls = [], stores = [];
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { page, reqs } = await open(b, { vp });
    await plant(page, {});
    await ready(page, STORE + '?gate');
    await heroJoin(page, TYPED.email1, TYPED.first);
    await doorsSend(page, 'H61', { full_name: TYPED.name, organization: TYPED.org, email: TYPED.email2, phone: TYPED.phone }, ['consent_email', 'consent_sms']);
    await doorsSend(page, 'H62', { email: TYPED.email3 }, ['consent_email']);
    await guideAsk(page, TYPED.ask);
    await page.waitForTimeout(300);
    await page.evaluate(() => { const g = document.querySelector('[data-module="guide"] [data-close]'); if (g) { g.click(); } });
    await emit(page, 'cart:add', { sizeId: PLAIN[0].id, qty: 2 });
    await page.waitForTimeout(200);
    await page.evaluate(() => { const c = document.querySelector('[data-module="cart"] [data-copy]'); if (c) { c.click(); } });
    await checkout(page);
    await ageWith(page, 'ON', 30, 0);
    await page.mouse.wheel(0, 20000);
    await page.waitForTimeout(800);
    all.push(...reqs.map(r => Object.assign({ vp: vp.width }, r)));
    dls.push(...(await dataLayer(page)));
    stores.push(await storageDump(page));
    await page.context().close();
  }
  const ext = [...new Set(all.filter(r => !r.url.startsWith(H) && !r.url.startsWith(XO) && !/^(data|blob):/.test(r.url)).map(r => r.method + ' ' + r.url))];
  const nonGet = all.filter(r => r.method !== 'GET' && r.method !== 'HEAD').map(r => r.method + ' ' + r.url);
  const inUrls = all.filter(r => hasNeedle(decodeURIComponent(r.url)).length).map(r => r.url);
  const inStore = stores.flatMap(s => Object.entries(s).filter(([k, v]) => hasNeedle(k + ' ' + v).length).map(([k]) => k));
  R(ext.length + nonGet.length + inUrls.length + inStore.length > 0, 'I5-egress-empty',
    `endpoint empty, 1440 and 390: hero join + name, door H61 (name, business, email, phone, both boxes), door H62, a guide question, cart add + copy link + checkout + age: ` +
    `${all.length} requests, external=${ext.length}${ext.length ? ' ' + ext.join(' ') : ''}, non-GET=${nonGet.length}${nonGet.length ? ' ' + nonGet.join(' ') : ''}, typed values in any URL=${inUrls.length}, typed values in storage=${JSON.stringify(inStore)}`);
  const ALLOW = new Set(['event', 'hook', 'slot', 'state', 'sizeId', 'sku', 'qty', 'count', 'from', 'to', 'step', 'kind']);
  const ID = /^[A-Za-z0-9][A-Za-z0-9_.:\-]{0,63}$/;
  const badKey = dls.filter(e => Object.keys(e).some(k => !ALLOW.has(k)));
  const badVal = dls.filter(e => Object.keys(e).some(k => k !== 'event' && !(typeof e[k] === 'boolean' || (typeof e[k] === 'number' && isFinite(e[k])) || (typeof e[k] === 'string' && ID.test(e[k])))));
  const typed = dls.filter(e => hasNeedle(JSON.stringify(e)).length);
  const evs = [...new Set(dls.map(e => e.event))];
  R(badKey.length + badVal.length + typed.length > 0, 'I6-datalayer-typed',
    `same run: ${dls.length} dataLayer entries, events=${evs.join(',')}; entries with a key off the allow-list=${badKey.length}, with a non-id value=${badVal.length}, carrying a typed value=${typed.length}${typed.length ? ' ' + JSON.stringify(typed.slice(0, 3)) : ''}`);
});

check('I5-egress-endpoint', async (b, R) => {
  const cfg = { form: { endpoint: SINK_URL } };
  const { page, reqs } = await open(b, { cfg });
  SINK.length = 0;
  await plant(page, {});
  await ready(page, STORE + '?utm_source=mail&email=' + encodeURIComponent(TYPED.email1) + '#doors');
  cfgMust(await cfgOf(page), cfg);
  await heroJoin(page, TYPED.email1, TYPED.first);
  await doorsSend(page, 'H61', { full_name: TYPED.name, organization: TYPED.org, email: TYPED.email2, phone: '' }, []);
  await doorsSend(page, 'H62', { email: TYPED.email3 }, []);
  await page.waitForTimeout(600);
  const posts = reqs.filter(r => r.method !== 'GET' && r.method !== 'HEAD');
  const elsewhere = posts.filter(r => r.url !== SINK_URL).map(r => r.method + ' ' + r.url);
  const refs = [...new Set(SINK.map(s => s.referer))];
  const forms = SINK.map(s => { try { return JSON.parse(s.body).form; } catch (e) { return '?'; } });
  const refLeak = refs.filter(r => r !== H + '/');
  R(elsewhere.length > 0 || refLeak.length > 0,
    `endpoint set to a cross-origin recorder; store opened with ?utm_source=mail&email=<address>#doors; hero join + name, door H61, door H62 (no box ticked): ` +
    `non-GET requests=${posts.length}, to anywhere but the endpoint=${elsewhere.length}${elsewhere.length ? ' ' + elsewhere.join(' ') : ''}; ` +
    `bodies received=${SINK.length} forms=${JSON.stringify(forms)}${SINK.length ? '' : ' (none arrived: a CSP connect-src may block this test endpoint)'}; Referer seen by the endpoint=${JSON.stringify(refs)} (origin only: no path, query or fragment leaves)`);
});

check('I5-copy-link', async (b, R) => {
  const { page } = await open(b, { clip: true });
  await plant(page, {});
  await ready(page, STORE + '?utm_source=mail&email=' + encodeURIComponent(TYPED.email1) + '&gate');
  await emit(page, 'cart:add', { sizeId: PLAIN[0].id, qty: 2 });
  await emit(page, 'cart:add', { sizeId: PLAIN[1].id, qty: 1 });
  await page.waitForTimeout(250);
  await page.evaluate(() => document.querySelector('[data-module="cart"] [data-copy]').click());
  await page.waitForTimeout(250);
  const clip = await page.evaluate(() => window.__clip || (document.querySelector('[data-module="cart"] [data-link]') || {}).value || '');
  const want = STORE + '#cart=' + `${PLAIN[0].id}:2,${PLAIN[1].id}:1`;
  R(clip !== want, `store opened with ?utm_source=mail&email=<address>&gate, two lines in the cart, COPY CART LINK -> "${clip}" (expected exactly ${want}: origin, path, ids and quantities, never the query string)`);
});

check('I6-flow-stage', async (b, R) => {
  const { page } = await open(b);
  const planted = 'Samantha.Tester-H2X1Y4';
  await plant(page, { [FLOW]: { stage: planted } });
  await ready(page);
  const dl = await dataLayer(page);
  const hit = dl.filter(e => Object.keys(e).some(k => e[k] === planted));
  R(hit.length > 0, `another page writes ${FLOW}={"stage":"${planted}"} (any token of up to 64 letters, digits, dot, dash, colon passes the scrubber); on load the store pushes ` +
    `${hit.length ? JSON.stringify(hit[0]) + ' (' + lineOf(/state: \(flow && flow\.stage\) \|\| 'NEW'/) + ' sends flow.stage as-is)' : 'nothing carrying it'}`);
});

check('I6-scrubber', async (b, R) => {
  const { page } = await open(b);
  await ready(page);
  const out = await page.evaluate(() => {
    const before = window.dataLayer.length;
    window.PEP.track('t1', { hook: 'H01', slot: '<b>x</b>', state: 'a b', sizeId: 'x'.repeat(65), sku: 'Samantha', qty: 3, count: NaN, from: Infinity, to: { nested: 1 },
      step: [1, 2], kind: true, email: 'a@b.co', name: 'Samantha', constructor: 'x', toString: 'y' });
    window.PEP.track('t2', JSON.parse('{"__proto__":{"hook":"polluted"},"hook":"H02"}'));
    window.PEP.track('t3', 'free text'); window.PEP.track('t4', ['a', 'b']); window.PEP.track('t5', null);
    return { pushed: window.dataLayer.slice(before).map(e => JSON.parse(JSON.stringify(e))), polluted: ({}).hook !== undefined };
  });
  const allowed = { t1: '{"hook":"H01","sku":"Samantha","qty":3,"kind":true,"event":"t1"}', t2: '{"hook":"H02","event":"t2"}', t3: '{"event":"t3"}', t4: '{"event":"t4"}', t5: '{"event":"t5"}' };
  const wrong = out.pushed.filter(e => JSON.stringify(e) !== allowed[e.event]);
  R(wrong.length > 0 || out.polluted, `PEP.track with markup, spaces, 65 chars, NaN, Infinity, objects, arrays, off-list keys, an own __proto__ key, a string, an array, null: pushed=${JSON.stringify(out.pushed)}; ` +
    `polluted=${out.polluted}. As designed, a one-word value ("Samantha") passes as an id: the guarantee rests on every call site (see I6-flow-stage)`);
});

/* ===== I7 · third-party code, CSP, framing ===== */
check('I7-cdn-pinned-sri', async (b, R) => {
  const cdnBase = (/CDN = '([^']+)'/.exec(HTML) || [])[1] || '';
  const urls = [...new Set([...HTML.matchAll(/https:\/\/cdn\.jsdelivr\.net\/[^\s'"<>)]+/g)].map(m => m[0]))];
  const unpinned = urls.filter(u => !/@\d+\.\d+\.\d+\//.test(u));
  const ent = Object.fromEntries([...HTML.matchAll(/integrity\[CDN \+ '([^']+)'\] = '([^']+)'/g)].map(m => [m[1], m[2]]));
  const localOf = p => path.join(STORE_DIR, p.replace(/^build\//, 'vendor/three/').replace(/^examples\/jsm\//, 'vendor/three/addons/'));
  // the module graph: three, its core, every addon the page imports, and their relative imports
  const graph = new Set(['build/three.module.js']);
  [...HTML.matchAll(/import\('three\/addons\/([^']+)'\)/g)].forEach(m => graph.add('examples/jsm/' + m[1]));
  for (const g of [...graph]) {
    const f = localOf(g);
    if (!fs.existsSync(f)) { continue; }
    [...fs.readFileSync(f, 'utf8').matchAll(/from '(\.[^']+)'/g)].forEach(m => graph.add(path.posix.normalize(path.posix.join(path.posix.dirname(g), m[1]))));
  }
  const notes = [];
  for (const g of graph) {
    const f = localOf(g), have = fs.existsSync(f) ? 'sha384-' + sha('sha384', fs.readFileSync(f)) : null;
    if (!ent[g]) { notes.push(g + ': NO integrity'); } else if (have && have !== ent[g]) { notes.push(g + ': integrity differs from local bytes'); } else if (!have) { notes.push(g + ': no local copy to compare'); }
  }
  // runtime: force the fallback (local three answers 404), serve the CDN from the local bytes, then from tampered bytes
  const serve = tamper => route => {
    const u = new URL(route.request().url());
    const rel = u.pathname.replace(/^\/npm\/three@[^/]+\//, '');
    const f = localOf(rel);
    if (!fs.existsSync(f)) { return route.fulfill({ status: 404, body: '' }); }
    let body = fs.readFileSync(f);
    if (tamper && /three\.core\.js$/.test(rel)) { body = Buffer.concat([Buffer.from('window.__cdnPwn = (window.__cdnPwn || 0) + 1;\n'), body]); }
    return route.fulfill({ status: 200, headers: { 'content-type': 'text/javascript', 'access-control-allow-origin': '*' }, body });
  };
  const no404 = [[u => /\/vendor\/three\/three\.module\.js$/.test(u.pathname), route => route.request().method() === 'HEAD' ? route.fulfill({ status: 404, body: '' }) : route.continue()]];
  const res = {};
  for (const tamper of [false, true]) {
    const { page, cons } = await open(b, { cdn: serve(tamper), routes: no404 });
    await plant(page, {});
    await ready(page);
    await page.waitForFunction(() => { const r = document.querySelector('[data-module="logo3d"]'); return r && /^(on|off)$/.test(r.getAttribute('data-pep3d-state') || ''); }, null, { timeout: 15000 }).catch(() => {});
    res[tamper ? 'tampered' : 'genuine'] = await page.evaluate(() => ({ state: (document.querySelector('[data-module="logo3d"]') || {}).getAttribute ? document.querySelector('[data-module="logo3d"]').getAttribute('data-pep3d-state') : null,
      ran: window.__cdnPwn || 0, map: (document.querySelector('script[type="importmap"]') || {}).textContent ? JSON.parse(document.querySelector('script[type="importmap"]').textContent).imports.three : null }));
    res[tamper ? 'tampered' : 'genuine'].sri = cons.filter(c => /integrity|digest/i.test(c)).length;
    await page.context().close();
  }
  const broke = unpinned.length > 0 || notes.length > 0 || res.tampered.ran > 0;
  R(broke, `jsdelivr URLs=${urls.length} (${urls.join(' ')}) unpinned=${unpinned.length}; module graph ${graph.size} files, integrity problems=${notes.length}${notes.length ? ' ' + notes.join('; ') : ' (all hashes = local vendor bytes)'}; ` +
    `forced fallback, genuine CDN bytes -> 3D ${res.genuine.state} (three from ${res.genuine.map}); tampered three.core.js -> ran=${res.tampered.ran}, 3D ${res.tampered.state}, integrity errors logged=${res.tampered.sri}. ` +
    `The fallback exists only while PREVIEW is true (${lineOf(/no import map on a live build/)})`);
});

check('I7-cdn-unused', async (b, R) => {
  const out = [];
  let hits = 0;
  for (const [label, cfg] of [['PREVIEW true', null], ['PREVIEW false', LIVE]]) {
    const { page, reqs, cons } = await open(b, cfg ? { cfg } : {});
    await plant(page, {});
    await ready(page);
    await page.waitForFunction(() => { const r = document.querySelector('[data-module="logo3d"]'); return r && /^(on|off)$/.test(r.getAttribute('data-pep3d-state') || ''); }, null, { timeout: 15000 }).catch(() => {});
    const st = await page.evaluate(() => ({ state: document.querySelector('[data-module="logo3d"]').getAttribute('data-pep3d-state'),
      map: (document.querySelector('script[type="importmap"]') || {}).textContent || null }));
    const cdn = reqs.filter(r => /cdn\.jsdelivr\.net/.test(r.url));
    hits += cdn.length;
    const why = cons.filter(c => /3d off/i.test(c)).map(c => c.replace(/^warning: /, ''));
    out.push(`${label}: requests to cdn.jsdelivr.net=${cdn.length}, import map three=${st.map ? JSON.parse(st.map).imports.three : 'none'}, 3D ${st.state}${why.length ? ' (' + why[0] + ')' : ''}`);
    await page.context().close();
  }
  R(hits > 0, out.join('; '));
});

check('I7-csp', async (b, R) => {
  const meta = /http-equiv\s*=\s*["']?content-security-policy/i.test(HTML);
  const ref = /<meta[^>]+name\s*=\s*["']?referrer/i.test(HTML);
  const bust = /\btop\s*!==?\s*(window\.)?self\b|\bself\s*!==?\s*(window\.)?top\b|frameElement|top\.location/.test(HTML);
  const res = await fetch(STORE);
  R(!meta, `Content-Security-Policy: meta=${meta}, header from this test server=${res.headers.get('content-security-policy') || 'none'} (GitHub Pages sends none and cannot be told to); ` +
    `meta referrer=${ref} (browser default strict-origin-when-cross-origin applies); frame-busting script=${bust}.` +
    (meta ? ' (frame-ancestors cannot be set from a meta tag)' : ' No CSP means nothing in the browser enforces "connect only to the form endpoint" or "scripts only from this page"; a meta CSP could (frame-ancestors cannot be set from a meta tag)'));
});

check('I7-frame-foreign', async (b, R) => {
  const { page } = await open(b);
  await plant(page, {});
  await page.goto(`${XO}/sibling/clickjack.html?target=${encodeURIComponent(STORE + '#join')}`, { waitUntil: 'domcontentloaded' });
  let fr = null;
  for (let i = 0; i < 60 && !fr; i++) { fr = page.frames().find(f => f.url().startsWith(STORE)); if (!fr) { await page.waitForTimeout(250); } }
  if (!fr) { throw new Error('store frame never appeared'); }
  await fr.waitForFunction(() => window.PEP && window.PEP.status && window.PEP.status.hero === 'ready', null, { timeout: 30000 });
  await page.waitForTimeout(600);
  const target = fr.locator('[data-module="hero"] [data-consent-text]').first();
  await target.scrollIntoViewIfNeeded({ timeout: 3000 }).catch(() => {});
  const box = await target.boundingBox().catch(() => null);
  const shown = await fr.evaluate(() => getComputedStyle(document.documentElement).display !== 'none' && getComputedStyle(document.documentElement).visibility !== 'hidden').catch(() => false);
  if (!box || !shown || box.width < 2) { R(false, `a page on another origin frames the store: the store does not render a clickable consent line inside the frame (rendered=${shown}, box=${JSON.stringify(box)}): frame-busting in effect`); return; }
  const cx = box.x + Math.min(box.width / 2, 60), cy = box.y + box.height / 2;
  // the attacker has calibrated the decoy onto the store's consent line (we place it at the measured point)
  await page.evaluate(([x, y]) => { const d = document.getElementById('decoy'); d.style.left = (x - 40) + 'px'; d.style.top = (y - 22) + 'px'; }, [cx, cy]);
  const before = await fr.evaluate(() => document.querySelector('[data-module="hero"] [data-consent]').checked);
  await page.mouse.click(cx, cy);
  await page.waitForTimeout(250);
  const after = await fr.evaluate(() => document.querySelector('[data-module="hero"] [data-consent]').checked);
  const op = await page.evaluate(() => getComputedStyle(document.getElementById('store')).opacity);
  R(after && !before, `a page on ANOTHER origin (${XO}) frames the store at opacity ${op} over its own "CLAIM IT" button: the store loads (no frame-ancestors, no X-Frame-Options, no frame-busting) ` +
    `and the visitor's click on the decoy ${after && !before ? 'ticks' : 'does not tick'} the store's CASL email-consent box: checked ${before} -> ${after}. Repro page: sibling/clickjack.html?target=<store>#join`);
});

/* ===== I8 · the FOR THE LAB doors: unticked boxes, nothing joins without them, nothing personal kept ===== */
check('I8-doors-consent', async (b, R) => {
  const cfg = { form: { endpoint: H + '/__sink' } };          // same-origin recorder, so a connect-src 'self' policy would still let it through
  const { page } = await open(b, { cfg });
  SINK.length = 0;
  await plant(page, {});
  await ready(page);
  cfgMust(await cfgOf(page), cfg);
  const d61 = await doorState(page, 'H61'), d62 = await doorState(page, 'H62');
  const unt = [].concat(d61 ? d61.boxes : [], d62 ? d62.boxes : []);
  // SMS ticked with no number: refused, nothing sent
  await doorsSend(page, 'H61', { full_name: TYPED.name, organization: TYPED.org, email: TYPED.email2, phone: '' }, ['consent_sms']);
  const smsBlock = await doorState(page, 'H61');
  const sentAfterSms = SINK.length;
  // no box ticked: the request is sent (they asked for a reply) with both consents recorded as not given
  await page.evaluate(() => { const b = document.querySelector('[data-module="doors"] form[data-hook="H61"] [name="consent_sms"]'); if (b.checked) { b.click(); } });
  await doorsSend(page, 'H61', { full_name: TYPED.name, organization: TYPED.org, email: TYPED.email2, phone: '' }, []);
  await doorsSend(page, 'H62', { email: TYPED.email3 }, ['consent_email']);
  const bodies = SINK.map(s => { try { return JSON.parse(s.body); } catch (e) { return {}; } });
  const b61 = bodies.find(x => x.hook === 'H61') || {}, b62 = bodies.find(x => x.hook === 'H62') || {};
  const st = await storageDump(page);
  const flow = st['ls:' + FLOW] || null;
  const kept = st['ls:' + DOORS] || null;
  const personal = Object.entries(st).filter(([k, v]) => hasNeedle(k + ' ' + v).length).map(([k]) => k);
  const consentText = await page.evaluate(() => (document.querySelector('[data-module="doors"] form[data-hook="H62"] [data-consent-text]') || {}).textContent.trim());
  // live build, no endpoint: refused, nothing kept
  const { page: p2 } = await open(b, { cfg: LIVE });
  await plant(p2, {});
  await ready(p2);
  await doorsSend(p2, 'H61', { full_name: TYPED.name, organization: TYPED.org, email: TYPED.email2, phone: '' }, []);
  const live = await doorState(p2, 'H61'), liveKept = await p2.evaluate(k => localStorage.getItem(k), DOORS);
  const ok = unt.length >= 3 && unt.every(x => !x.checked && !x.required) && smsBlock.needPhone && sentAfterSms === 0 &&
    b61.consent_email && b61.consent_email.given === false && b61.consent_sms && b61.consent_sms.given === false &&
    b62.consent_email && b62.consent_email.given === true && b62.consent_email.text === consentText && flow === null && !personal.length &&
    kept && /^\{"H61":\{"at":"[^"]+"\},"H62":\{"at":"[^"]+"\}\}$/.test(kept) && live && live.sendErr && !live.done && liveKept === null;
  R(!ok, `boxes on load=${JSON.stringify(unt.map(x => x.name + (x.checked ? ':ticked' : ':unticked') + (x.required ? ':required' : '')))}; text box ticked with no number -> refused=${smsBlock.needPhone}, sent=${sentAfterSms}; ` +
    `H61 sent with no box: consent_email=${JSON.stringify(b61.consent_email)} consent_sms=${JSON.stringify(b61.consent_sms)}; H62 with its box: given=${b62.consent_email && b62.consent_email.given} with the exact words shown=${b62.consent_email && b62.consent_email.text === consentText}; ` +
    `flow (team membership) after both=${flow}; kept in this browser ${DOORS}=${kept}; typed values in storage=${JSON.stringify(personal)}; live build with no endpoint -> error shown=${live && live.sendErr}, done=${live && live.done}, kept=${liveKept}`);
});

check('I8-doors-planted-done', async (b, R) => {
  const { page } = await open(b, { cfg: LIVE });
  await plant(page, { [DOORS]: { H61: { at: '1999-01-01T00:00:00.000Z' } } });
  await ready(page);
  cfgMust(await cfgOf(page), LIVE);
  const d = await doorState(page, 'H61');
  const falseDone = !!d && d.done && !d.note;
  R(falseDone, `PREVIEW=false, no endpoint (so nothing CAN be sent), and another page writes ${DOORS}={"H61":{"at":...}}: ` +
    (falseDone ? `the lab-account door opens on "${d.doneText.trim()}" with no preview note and no form to fill until the visitor finds SEND A NEW REQUEST (${lineOf(/if \(saved\(\)\[hook\]\) \{ show\('done', true\); \}/)})`
      : `the door opens on its form (done=${d && d.done}, note=${d && d.note})`));
});

/* ===== D · names, sizes and prices on the page are the catalogue's ===== */
async function catalogueView(b, cfg, relist) {
  const { page } = await open(b, Object.assign({ relist }, cfg ? { cfg } : {}));
  await plant(page, {});
  await ready(page);
  const ec = await cfgOf(page);
  if (cfg) { cfgMust(ec, cfg); }
  await page.waitForFunction(() => { const r = document.querySelector('[data-module="lineup"]'); return !r || r.hidden || /ready|failed/.test(r.getAttribute('data-state') || ''); }, null, { timeout: 15000 }).catch(() => {});
  await page.waitForFunction(() => document.querySelectorAll('[data-module="header"] [data-cols] a[data-sku]').length > 0, null, { timeout: 5000 }).catch(() => {});
  const v = await page.evaluate(() => {
    const H = document.querySelector('[data-module="header"]'), L = document.querySelector('[data-module="lineup"]'), S = document.querySelector('[data-module="shelf"]');
    const T = e => e ? e.textContent.replace(/\s+/g, ' ').trim() : '';
    const header = { names: [...H.querySelectorAll('[data-cols] a[data-sku]')].map(a => a.getAttribute('data-sku') + '|' + T(a)), count: T(H.querySelector('[data-count]')) };
    const lineup = !L || L.hidden ? null : { total: T(L.querySelector('[data-total]')), cases: [...L.querySelectorAll('[data-rail] > .vc[data-sku]')].map(li => ({ sku: li.getAttribute('data-sku'),
      name: T(li.querySelector('[data-name] .pep-lineup-sr')), bar: T(li.querySelector('[data-b-price]')),
      sizes: [...li.querySelectorAll('[data-d-sizes] > li:not(.vc-soon)')].map(x => ({ label: T(x.querySelector('[data-size-label]')), price: x.querySelector('[data-size-price]') ? T(x.querySelector('[data-size-price]')) : null })) })) };
    let shelf = null;
    if (S && !S.hidden && S.querySelector('.pep-shelf-open') && !S.querySelector('.pep-shelf-open').hidden) {
      const fams = [...S.querySelectorAll('[data-family]')].map(x => x.getAttribute('data-family') + '=' + T(x.querySelector('[data-count]')));
      shelf = { fams, slats: [...S.querySelectorAll('.pep-shelf-slat')].map(btn => {
        btn.click();
        return { name: T(btn.querySelector('[data-slat-name]')), fam: T(btn.querySelector('[data-slat-family]')), lo: T(btn.querySelector('[data-slat-lo]')),
          hi: btn.querySelector('[data-slat-span]') && !btn.querySelector('[data-slat-span]').hidden ? T(btn.querySelector('[data-slat-hi]')) : '',
          sizes: [...S.querySelectorAll('[data-sizes] > button')].map(x => ({ label: T(x.querySelector('[data-size-label]')), note: x.querySelector('[data-size-note]').hidden ? '' : T(x.querySelector('[data-size-note]')),
            price: x.querySelector('[data-size-price]').hidden ? null : T(x.querySelector('[data-size-price]')) })) };
      }) };
    }
    const soon = S ? T(S.querySelector('.pep-shelf-soon')) : '';
    return { header, lineup, shelf, shelfShown: !!S && !S.hidden, soonShown: !!S && !!S.querySelector('.pep-shelf-soon') && !S.querySelector('.pep-shelf-soon').hidden, soon };
  });
  await page.context().close();
  return { v, ec };
}
function compareCatalogue(v, ec) {
  const prev = !!(ec.flags && ec.flags.PREVIEW), namesOn = prev || !!(ec.flags && ec.flags.COUNSEL_CLEARED && ec.flags.COUNSEL_CLEARED.names);
  const hidden = Array.isArray(ec.hidden) ? ec.hidden.map(String) : [];
  const shown = (CAT.products || []).filter(shownBy(prev, hidden));
  const bad = [];
  const sizesOf = p => (p.sizes || []).filter(s => s && s.id && s.label).map(s => { const m = /^(.*?)\s*\(([^)]*)\)\s*$/.exec(String(s.label)); return { main: (m ? m[1] : String(s.label)).toUpperCase(), note: m ? m[2].toUpperCase() : '', price: priced(s) ? s.priceCAD : null }; });
  // header PEPTIDES drop-down
  const wantH = namesOn ? shown.map(p => String(p.sku) + '|' + String(p.name)).sort() : [];
  const gotH = v.header.names.slice().sort();
  if (JSON.stringify(wantH) !== JSON.stringify(gotH)) { bad.push(`header list: ${gotH.length} names, want ${wantH.length}; extra=${JSON.stringify(gotH.filter(x => wantH.indexOf(x) < 0))} missing=${JSON.stringify(wantH.filter(x => gotH.indexOf(x) < 0))}`); }
  if (namesOn && v.header.count.indexOf(String(shown.length)) !== 0) { bad.push(`header count "${v.header.count}" for ${shown.length} products`); }
  // the lineup (the one place products are shown while names are open)
  if (namesOn) {
    if (!v.lineup) { bad.push('lineup hidden while names are open'); }
    else {
      if (v.lineup.cases.length !== shown.length) { bad.push(`lineup cases ${v.lineup.cases.length}, want ${shown.length}`); }
      if (Number(v.lineup.total) !== shown.length) { bad.push(`lineup counter "${v.lineup.total}" for ${shown.length}`); }
      shown.forEach((p, i) => {
        const c = v.lineup.cases[i];
        if (!c || c.sku !== String(p.sku) || c.name !== String(p.name)) { bad.push(`lineup case ${i + 1}: ${c ? c.sku + ' "' + c.name + '"' : 'missing'} want ${p.sku} "${p.name}"`); return; }
        const want = sizesOf(p);
        if (c.sizes.length !== want.length) { bad.push(`${p.sku}: ${c.sizes.length} sizes on the back, want ${want.length}`); return; }
        want.forEach((s, k) => {
          const g = c.sizes[k], wl = s.note ? s.main + ' · ' + s.note : s.main;
          if (g.label !== wl || (s.price === null ? g.price !== null : money2(g.price) !== s.price)) { bad.push(`${p.sku} size ${k + 1}: "${g.label}" ${g.price} want "${wl}" ${s.price}`); }
        });
        const first = want.find(s => s.price !== null);
        if (first && money2(c.bar) !== first.price) { bad.push(`${p.sku} price bar ${c.bar} want ${first.price}`); }
      });
    }
  } else if (v.lineup) { bad.push('lineup shown while names are closed'); }
  // the shelf (only with data-relist="on", as the capture tool runs it)
  if (v.shelf) {
    const fam = p => String(p.family || '').toUpperCase();
    if (v.shelf.slats.length !== shown.length) { bad.push(`shelf slats ${v.shelf.slats.length}, want ${shown.length}`); }
    shown.forEach((p, i) => {
      const s = v.shelf.slats[i]; if (!s) { return; }
      const pr = sizesOf(p).filter(x => x.price !== null).map(x => x.price), lo = pr.length ? Math.min(...pr) : null, hi = pr.length ? Math.max(...pr) : null;
      if (s.name.replace(/\s+/g, '') !== String(p.name).toUpperCase().replace(/\s+/g, '') || s.fam !== fam(p)) { bad.push(`shelf slat ${i + 1}: "${s.name}" ${s.fam} want "${String(p.name).toUpperCase()}" ${fam(p)}`); }
      if (lo !== null && (money2(s.lo) !== lo || (hi > lo ? money2(s.hi) !== hi : s.hi !== ''))) { bad.push(`shelf ${p.sku}: ${s.lo}..${s.hi} want ${lo}..${hi}`); }
      sizesOf(p).forEach((z, k) => { const g = s.sizes[k]; if (!g || g.label !== z.main || g.note !== z.note || (z.price === null ? g.price !== null : money2(g.price) !== z.price)) { bad.push(`shelf ${p.sku} size ${k + 1}: ${JSON.stringify(g)} want ${z.main} ${z.note} ${z.price}`); } });
    });
    v.shelf.fams.forEach(fc => { const [f, n] = fc.split('='); const want = shown.filter(p => f === 'ALL' || fam(p) === f).length; if (n !== '' && Number(n) !== want) { bad.push(`shelf filter ${f} says ${n}, data has ${want}`); } });
  }
  return { bad, shown: shown.length, namesOn, prev };
}
check('D1-catalogue-preview', async (b, R) => {
  const { v, ec } = await catalogueView(b, null, true);
  const r = compareCatalogue(v, ec);
  R(r.bad.length > 0, `PREVIEW: ${r.shown} products expected (bracketed names included in a preview); header list ${v.header.names.length} "${v.header.count}", lineup ${v.lineup ? v.lineup.cases.length + ' cases, counter ' + v.lineup.total : 'hidden'}, ` +
    `shelf (data-relist on, as the capture tool runs it) ${v.shelf ? v.shelf.slats.length + ' slats' : 'not shown'}; every name, size label, price, range and family count checked against assets/catalogue.json: mismatches=${r.bad.length}${r.bad.length ? ' ' + r.bad.slice(0, 6).join(' | ') : ''}`);
});
check('D1-catalogue-live', async (b, R) => {
  const a = await catalogueView(b, LIVE_NAMES, false), ra = compareCatalogue(a.v, a.ec);
  const c = await catalogueView(b, LIVE, false), rc = compareCatalogue(c.v, c.ec);
  const closedLeak = c.v.header.names.length || c.v.lineup || c.v.shelf ? 'products visible' : '';
  R(ra.bad.length + rc.bad.length > 0 || !!closedLeak, `PREVIEW=false + names cleared: ${ra.shown} products expected (bracketed names dropped), header ${a.v.header.names.length}, lineup ${a.v.lineup ? a.v.lineup.cases.length : 'hidden'}, mismatches=${ra.bad.length}${ra.bad.length ? ' ' + ra.bad.slice(0, 4).join(' | ') : ''}; ` +
    `PREVIEW=false + names closed: header list ${c.v.header.names.length}, lineup ${c.v.lineup ? 'shown' : 'hidden'}, shelf plate "${c.v.soon.slice(0, 60)}" shown=${c.v.soonShown}, mismatches=${rc.bad.length}${closedLeak ? ' ' + closedLeak : ''}`);
});

/* ===== P · the shared origin apex360marketing-ai.github.io ===== */
check('P1-sibling-rewrites-cart', async (b, R) => {
  const { ctx, page } = await open(b);
  const A = PLAIN[0], B = PLAIN[1];
  await plant(page, {});
  await ready(page);
  await heroJoin(page, TYPED.email1, '');
  await emit(page, 'cart:add', { sizeId: A.id, qty: 1 });
  await page.waitForTimeout(200);
  await checkout(page);
  const before = await cartState(page);
  const sib = await ctx.newPage();
  await sib.goto(SIB, { waitUntil: 'domcontentloaded' });
  const read = await sib.evaluate(k => ({ cart: localStorage.getItem(k[0]), flow: localStorage.getItem(k[1]), keys: Object.keys(localStorage).concat(Object.keys(sessionStorage).map(x => 'session:' + x)) }), [CART, FLOW]);
  await sib.evaluate(([k, id]) => localStorage.setItem(k, JSON.stringify([{ sizeId: id, qty: 9 }])), [CART, B.id]);
  await page.waitForTimeout(500);
  const after = await cartState(page);
  R(after.end.total !== before.end.total, `the shopper is on the CHECKOUT step (pay ${before.end.total}); a page elsewhere on the origin, in another tab, reads cart=${read.cart} flow=${read.flow} ` +
    `(all keys it sees: ${read.keys.join(', ')}) and writes a new cart: with no click from the shopper the same step now lists ${JSON.stringify(after.sum.map(s => s.qty + ' x ' + s.price))} and says pay ${after.end.total} (view ${after.views.join('|')})`);
});

check('P2-sibling-frames-store', async (b, R) => {
  const { page } = await open(b);
  await plant(page, {});
  await page.evaluate(u => { const f = document.createElement('iframe'); f.id = 'store-frame'; f.src = u; f.style.width = '1200px'; f.style.height = '800px'; document.body.appendChild(f); }, STORE);
  let fr = null;
  for (let i = 0; i < 60 && !fr; i++) { fr = page.frames().find(f => f.url().startsWith(STORE)); if (!fr) { await page.waitForTimeout(250); } }
  if (!fr) { throw new Error('store frame never appeared'); }
  await fr.waitForFunction(() => window.PEP && window.PEP.status && window.PEP.status.cart === 'ready' && window.__cart && window.__cart.length > 0, null, { timeout: 30000 });
  await fr.evaluate(v => { const e = document.querySelector('#pep-hero-email'); e.focus(); e.value = v; e.dispatchEvent(new Event('input', { bubbles: true })); }, TYPED.email1);   // the visitor types in the framed store
  const got = await page.evaluate(([id]) => {
    const f = document.getElementById('store-frame'), d = f.contentDocument, w = f.contentWindow;
    const typed = d.querySelector('#pep-hero-email').value;
    w.PEP.emit('cart:add', { sizeId: id, qty: 1 });
    const price = d.querySelector('[data-module="cart"] [data-line-price]');
    if (price) { price.textContent = '$0.01'; }
    return { typed, price: price ? price.textContent : null, peek: !!w.PEP };
  }, [PLAIN[0].id]);
  R(got.typed === TYPED.email1, `a page on the same origin frames the store and reaches straight in: it reads the email the visitor is typing ("${got.typed}"), drives the store's runtime (PEP reachable=${got.peek}, adds to the cart) ` +
    `and rewrites what the cart shows (a line price now reads ${got.price}). Same origin = one trust zone: every page there is as trusted as the store itself`);
});

check('P3-sibling-service-worker', async (b, R) => {
  const { page } = await open(b, { sw: true });
  await page.goto(SIB, { waitUntil: 'domcontentloaded' });
  const narrow = await page.evaluate(() => navigator.serviceWorker.register('/sibling/__sw.js', { scope: '/' }).then(() => 'registered', e => 'refused: ' + e.name));
  const root = await page.evaluate(() => navigator.serviceWorker.register('/__sw.js', { scope: '/' }).then(() => navigator.serviceWorker.ready).then(() => 'registered', e => 'refused: ' + e.name));
  await ready(page);
  await emit(page, 'cart:add', { sizeId: PLAIN[0].id, qty: 1 });
  await page.waitForTimeout(300);
  const c = await cartState(page);
  const ctl = await page.evaluate(() => !!navigator.serviceWorker.controller);
  const bar = await page.evaluate(() => { const e = document.querySelector('[data-module="lineup"] [data-b-price]'); return e ? e.textContent.trim() : null; });
  const line = c.lines.find(l => l.id === PLAIN[0].id);
  R(!!line && money2(line.price) !== PLAIN[0].price, `a service worker from a page in a sub-folder cannot claim the origin root (${narrow}); one served from the ROOT of the origin (on GitHub Pages: the apex360marketing-ai.github.io repository) can (${root}) ` +
    `and then controls the store (controller=${ctl}): ${PLAIN[0].id} shows ${bar} in the lineup and ${line ? line.price : 'n/a'} in the cart instead of ${PLAIN[0].price}. It stays installed for later visits and could rewrite the page itself`);
});

check('I5-third-party', async (b, R) => {
  for (const vp of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
    const { page } = await open(b, { vp });
    await plant(page, {});
    await ready(page);
    for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(120); }
    await page.waitForTimeout(800);
    await page.context().close();
  }
  const ext = [...EXT_SEEN];
  R(ext.length > 0, `every request to a host other than the store's own, across this whole run (all checks run, both viewports, scrolled top to bottom, WebGL on): ${ext.length}${ext.length ? ' ' + ext.slice(0, 10).join(' ') : ' (no fonts, analytics, CDN, beacons)'}` +
    `${FORCED.size ? `; not counted: ${FORCED.size} jsdelivr files requested only when I7-cdn-pinned-sri forces the fallback` : ''}`);
});

/* ------------------------------------------------ run ------------------------------------------------ */
let SELLIDS = new Set(), FORCED_CDN = false;
(async () => {
  await new Promise((res, rej) => { server.once('error', rej); server.listen(PORT, res); }).catch(e => { console.error(`cannot serve on port ${PORT}: ${e.code || e.message}`); process.exit(2); });
  console.log(`target: ${path.relative(process.cwd(), STORE_DIR) || STORE_DIR}/index.html sha256 ${sha('sha256', HTML).slice(0, 12)} · catalogue.json sha256 ${sha('sha256', fs.readFileSync(path.join(STORE_DIR, 'assets', 'catalogue.json'))).slice(0, 12)} · served at ${STORE}`);
  let browser = await chromium.launch(LAUNCH);
  // preflight: the effective config and a clean load's module status
  {
    const { ctx, page } = await open(browser);
    await plant(page, {});
    await ready(page);
    CFG0 = await cfgOf(page);
    STATUS0 = await page.evaluate(() => JSON.parse(JSON.stringify(window.PEP.status)));
    await ctx.close();
  }
  prepCatalogue(Array.isArray(CFG0.hidden) ? CFG0.hidden.map(String) : []);
  SELLIDS = new Set(SELL.map(s => s.id));
  if (PLAIN.length < 9) { console.log('ERROR  preflight · fewer than 9 priced sizes in the catalogue; some checks need 9'); }
  console.log(`config: PREVIEW=${CFG0.flags && CFG0.flags.PREVIEW} offer=${CFG0.flags && CFG0.flags.COUNSEL_CLEARED && CFG0.flags.COUNSEL_CLEARED.offer} endpoint="${CFG0.form && CFG0.form.endpoint}" · ` +
    `${SELL.length} priced sizes (${BRACKET.length} under a bracketed name) · modules: ${Object.entries(STATUS0).map(([k, v]) => k + '=' + v).join(' ')}`);
  const OUT = [];
  for (const c of CHECKS) {
    if (ONLY.length && !c.ids.some(id => ONLY.some(p => id.startsWith(p)))) { continue; }
    if (c.ids[0] === 'I7-cdn-pinned-sri') { FORCED_CDN = true; }
    const said = new Set();
    const R = (broken, a, b2) => {
      const id = b2 === undefined ? c.ids[0] : a, detail = b2 === undefined ? a : b2;
      said.add(id); OUT.push({ id, broken });
      console.log(`${broken ? 'BROKEN' : 'safe'} ${id} · ${detail}`);
    };
    try {
      if (!browser.isConnected()) { browser = await chromium.launch(LAUNCH); }
      await c.fn(browser, R);
    } catch (e) {
      c.ids.filter(id => !said.has(id)).forEach(id => { OUT.push({ id, broken: null }); console.log(`ERROR ${id} · ${String(e && e.message || e).split('\n')[0]}`); });
    } finally {
      for (const x of OPEN.splice(0)) { await x.close().catch(() => {}); }
    }
  }
  await browser.close().catch(() => {});
  server.close();
  const nb = OUT.filter(o => o.broken === true).length, ns = OUT.filter(o => o.broken === false).length, ne = OUT.filter(o => o.broken === null).length;
  console.log(`\nSCORE: ${nb} BROKEN · ${ns} safe · ${ne} error (of ${OUT.length})`);
  process.exit(0);
})();

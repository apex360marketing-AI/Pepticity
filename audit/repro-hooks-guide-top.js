#!/usr/bin/env node
/* RED TEAM A: the code new since the last audit (45-hooks H63-H68, 40-guide, 10-hero, 05-header, the lineup/shelf card changes).
   node repro.js <dir-of-the-build-copy> <port> [group-regex]
   Prints one line per claim: "BROKEN <id> · detail" or "safe <id> · detail". No line numbers: every check finds its target
   by selector or behaviour, so it can be pointed at a newer build. Self-contained: it serves <dir> on <port> itself, edits
   PEP_CONFIG in flight (never on disk), and records every request the page makes. Set RT_3D=1 to keep the WebGL logo on. */
'use strict';
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const DIR = process.argv[2], PORT = Number(process.argv[3]), ONLY = process.argv[4] ? new RegExp(process.argv[4]) : null;
if (!DIR || !PORT) { console.error('usage: node repro.js <dir-of-the-build-copy> <port> [group-regex]'); process.exit(2); }

/* ------------------------------------------------ server ------------------------------------------------ */
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.webp': 'image/webp', '.png': 'image/png', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.jpg': 'image/jpeg' };
const SIBLING = '<!DOCTYPE html><html><head><meta charset="utf-8"><title>sibling</title></head><body><p>same-origin sibling</p></body></html>';
function resolveRoot(dir) {
  dir = path.resolve(dir);
  if (fs.existsSync(path.join(dir, 'new', 'index.html'))) { return { root: dir, page: '/new/index.html' }; }
  if (fs.existsSync(path.join(dir, 'index.html'))) { return { root: path.dirname(dir), page: '/' + path.basename(dir) + '/index.html' }; }
  throw new Error('no index.html under ' + dir);
}
const { root: ROOT, page: PAGE } = resolveRoot(DIR);
const HTML = fs.readFileSync(path.join(ROOT, PAGE), 'utf8');
const CATALOGUE = JSON.parse(fs.readFileSync(path.join(ROOT, path.dirname(PAGE), 'assets', 'catalogue.json'), 'utf8'));
const BASE = 'http://127.0.0.1:' + PORT;
const POSTS = [];
const server = http.createServer((req, res) => {
  const u = new URL(req.url, BASE);
  if (u.pathname.startsWith('/__collect')) {
    let body = '';
    req.on('data', (c) => { body += c; });
    req.on('end', () => {
      POSTS.push({ method: req.method, path: u.pathname + u.search, body });
      const fail = Number(u.searchParams.get('fail') || 0);
      res.writeHead(fail || 200, { 'Content-Type': 'application/json' });
      res.end('{}');
    });
    return;
  }
  let p = decodeURIComponent(u.pathname);
  if (p.endsWith('/')) { p += 'index.html'; }
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); res.end(); return; }
  fs.readFile(file, (err, data) => {
    if (err) {
      if (p === '/sibling/index.html') { res.writeHead(200, { 'Content-Type': TYPES['.html'] }); res.end(SIBLING); return; }
      res.writeHead(404); res.end('not found'); return;
    }
    res.writeHead(200, { 'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(data);
  });
});

// edits = JS run with C = window.PEP_CONFIG, injected just before core/pep.js freezes it (the file on disk is never touched)
function injectConfig(html, edits) {
  if (!edits) { return html; }
  const tag = '<script data-rt-config>(function(){var C=window.PEP_CONFIG;if(!C){return;}' + edits + '})();</script>\n';
  let at = html.indexOf('data-pep-src="core/pep.js"');
  if (at >= 0) { at = html.lastIndexOf('<script', at); }
  if (at < 0) { const c = html.indexOf('window.PEP_CONFIG'); if (c >= 0) { at = html.indexOf('</script>', c); if (at >= 0) { at += 9; } } }
  if (at < 0) { throw new Error('could not find where to edit PEP_CONFIG'); }
  return html.slice(0, at) + tag + html.slice(at);
}
const ENDPOINT = (q) => 'C.form=C.form||{};C.form.endpoint=' + JSON.stringify(BASE + '/__collect' + (q || '')) + ';';
const ARM = 'if(C.hooks&&C.hooks.exit){C.hooks.exit.armAfterMs=300;}';      // the exit arms after 0.3 s instead of 8 s (timing only)
const NOPREVIEW = 'C.flags.PREVIEW=false;';
const FLAGGED = (() => { const m = /flagged\s*:\s*\[([^\]]*)\]/.exec(HTML); return m ? (m[1].match(/'[^']+'|"[^"]+"/g) || []).map((s) => s.slice(1, -1)) : []; })();

/* ------------------------------------------------ page-side helpers ------------------------------------------------ */
function pageHelpers() {
  if (window.__rt) { return; }
  var rt = {};
  function shown(el) { return !!(el && el.getClientRects().length); }
  function visible(el) { if (!shown(el)) { return false; } var cs = getComputedStyle(el); return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity || '1') > 0.05; }
  function label(el) {
    if (el.matches('form[data-hook]')) { return 'form ' + el.getAttribute('data-hook'); }
    var h = el.closest('[data-hooks]'); if (h) { return 'hooks ' + h.getAttribute('data-hooks'); }
    return el.getAttribute('data-module') || el.tagName;
  }
  rt.visible = visible;
  rt.asks = function () {
    var forms = [].slice.call(document.querySelectorAll('form[data-hook]')).filter(function (f) {
      return !f.closest('[data-module="hooks"]') && !f.closest('[data-module="cart"]') && !f.closest('[data-module="guide"]');
    });
    return forms.concat([].slice.call(document.querySelectorAll('[data-module="hooks"] [data-hooks-ask]'))).filter(shown);
  };
  rt.prot = function () { return [].slice.call(document.querySelectorAll('[data-module="story"], [data-module="lineup"]')).filter(shown); };
  rt.freeY = function (ahead, from) {
    ahead = ahead || 0; var vh = innerHeight, H = document.documentElement.scrollHeight;
    var bs = rt.asks().concat(rt.prot()).map(function (el) { var r = el.getBoundingClientRect(); return { t: r.top + scrollY, b: r.bottom + scrollY }; });
    for (var y = from || 0; y <= H - vh; y += 20) { if (!bs.some(function (b) { return b.b > y && b.t < y + vh + ahead; })) { return y; } }
    return -1;
  };
  rt.inView = function (ahead) {
    var vh = innerHeight;
    return rt.asks().concat(rt.prot()).filter(function (el) { var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < vh + (ahead || 0); }).map(label);
  };
  rt.overlaps = function (el, forms) {
    var a = el.getBoundingClientRect(), hits = [];
    (forms ? rt.asks() : rt.asks().concat(rt.prot())).forEach(function (o) {
      var b = o.getBoundingClientRect(), w = Math.min(a.right, b.right) - Math.max(a.left, b.left), h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
      if (w > 1 && h > 1) { hits.push(label(o) + ' (' + Math.round(h) + 'px)'); }
    });
    return hits;
  };
  rt.onTop = function (el) {           // is el the thing painted at its own centre (not covered by a drawer or a window)?
    var r = el.getBoundingClientRect(); if (!r.width) { return false; }
    var hit = document.elementFromPoint(r.left + r.width / 2, r.top + Math.min(r.height / 2, 30));
    return !!(hit && el.contains(hit));
  };
  rt.fireExit = function () { document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: 400, clientY: 0 })); };
  rt.exitOn = function () { var e = document.querySelector('[data-hooks-exit]'); return !!(e && e.hasAttribute('data-on') && visible(e)); };
  rt.barOn = function () { var b = document.querySelector('[data-hooks-bar]'); return !!(b && b.hasAttribute('data-on') && visible(b)); };
  rt.injected = function () {
    var bad = [];
    if (window.__rtx !== undefined) { bad.push('script ran (__rtx=' + window.__rtx + ')'); }
    if (document.querySelector('rtxss-el')) { bad.push('an <rtxss-el> element was made'); }
    [].slice.call(document.querySelectorAll('*')).forEach(function (el) {
      for (var i = 0; i < el.attributes.length; i++) { var at = el.attributes[i]; if (/rtxss/i.test(at.value) || /rtxss/i.test(at.name)) { bad.push(el.tagName.toLowerCase() + '[' + at.name + ']'); } }
    });
    return bad;
  };
  rt.textOf = function (root) {
    if (!root || !shown(root)) { return ''; }
    var out = [root.innerText || ''];
    [].slice.call(root.querySelectorAll('*')).forEach(function (el) {
      if (!shown(el) || getComputedStyle(el).visibility === 'hidden') { return; }
      ['::before', '::after'].forEach(function (p) { var c = getComputedStyle(el, p).content; if (c && c !== 'none' && c !== 'normal' && c !== '""') { out.push(c); } });
      ['aria-label', 'title', 'alt', 'placeholder', 'data-text'].forEach(function (a) { var v = el.getAttribute(a); if (v) { out.push(v); } });
      if (el.matches('input, textarea') && el.value) { out.push(el.value); }
    });
    return out.join('\n');
  };
  rt.moduleTexts = function () {
    var o = { title: document.title };
    [].slice.call(document.querySelectorAll('[data-module]')).forEach(function (m) {
      if (m.parentElement && m.parentElement.closest('[data-module]')) { return; }
      var k = m.getAttribute('data-module') + (m.getAttribute('data-hooks') ? ':' + m.getAttribute('data-hooks') : '');
      o[k] = (o[k] || '') + '\n' + rt.textOf(m);
    });
    return o;
  };
  rt.pii = function (needles) {
    var hay = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); hay.push('localStorage ' + k + '=' + localStorage.getItem(k)); } } catch (e) { /* blocked */ }
    try { for (var j = 0; j < sessionStorage.length; j++) { var s = sessionStorage.key(j); hay.push('sessionStorage ' + s + '=' + sessionStorage.getItem(s)); } } catch (e) { /* blocked */ }
    hay.push('cookie ' + document.cookie); hay.push('url ' + location.href); hay.push('window.name ' + window.name);
    hay.push('dataLayer ' + JSON.stringify(window.dataLayer || []));
    var hits = [];
    needles.forEach(function (n) { var low = String(n).toLowerCase(); hay.forEach(function (h) { if (h.toLowerCase().indexOf(low) >= 0) { hits.push(n + ' in ' + h.split(' ')[0]); } }); });
    return hits;
  };
  rt.dlBad = function () {
    var ok = { hook: 1, slot: 1, state: 1, sizeId: 1, sku: 1, qty: 1, count: 1, from: 1, to: 1, step: 1, kind: 1, event: 1 };
    return (window.dataLayer || []).filter(function (e) {
      return !e || typeof e !== 'object' || Object.keys(e).some(function (k) { return !ok[k] || (typeof e[k] === 'string' && /@|[0-9]{7,}/.test(e[k])); });
    }).map(function (e) { return JSON.stringify(e); });
  };
  rt.storage = function () {
    var o = [];
    try { for (var i = 0; i < localStorage.length; i++) { var k = localStorage.key(i); o.push('L ' + k + '=' + localStorage.getItem(k)); } } catch (e) { /* blocked */ }
    try { for (var j = 0; j < sessionStorage.length; j++) { var s = sessionStorage.key(j); o.push('S ' + s + '=' + sessionStorage.getItem(s)); } } catch (e) { /* blocked */ }
    return o.sort();
  };
  window.__rt = rt;
}
const HELPERS = '(' + pageHelpers.toString() + ')();';

/* ------------------------------------------------ runner ------------------------------------------------ */
const DESK = { width: 1440, height: 900 }, PHONE = { width: 390, height: 844 };
let browser;
const live = [];
async function open(vp, o) {
  o = o || {};
  const touch = vp.width < 768;
  const ctx = await browser.newContext({ viewport: vp, reducedMotion: o.motion ? 'no-preference' : 'reduce', isMobile: touch, hasTouch: touch, storageState: o.storageState });
  live.push(ctx);
  const rec = { reqs: [], errors: [], external: [] };
  await ctx.addInitScript({ content: HELPERS + (o.init || '') });
  await ctx.route((u) => u.origin !== BASE && /^https?:$/.test(u.protocol), (r) => { rec.external.push(r.request().url()); r.abort(); });
  // 3D off for speed: the local three.js answers the page's HEAD probe (so it never falls back to the CDN) and then 404s
  if (!process.env.RT_3D) { await ctx.route((u) => u.origin === BASE && /\/vendor\/three\/|pep-quilt\.js$/.test(u.pathname), (r) => r.fulfill(r.request().method() === 'HEAD' ? { status: 200, body: '' } : { status: 404, body: '' })); }
  const body = (o.html || ((h) => h))(injectConfig(HTML, (o.edits || '') + ARM));
  await ctx.route((u) => u.origin === BASE && u.pathname === PAGE, (r) => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }));
  const page = await ctx.newPage();
  page.setDefaultTimeout(8000);
  page.on('request', (r) => rec.reqs.push({ url: r.url(), method: r.method(), post: r.postData() || '' }));
  page.on('pageerror', (e) => rec.errors.push(e.message));
  if (o.sibling) { await page.goto(BASE + '/sibling/index.html'); await page.evaluate(o.sibling); }
  await page.goto(BASE + PAGE + (o.query || ''));
  await ready(page);
  return { ctx, page, rec };
}
async function ready(page) {
  await page.waitForFunction(() => window.PEP && PEP.status && ['header', 'hero', 'guide', 'hooks'].every((k) => PEP.status[k] === 'ready' || PEP.status[k] === 'failed'), null, { timeout: 20000 });
  await page.waitForLoadState('load');
  await page.waitForFunction(() => {
    const g = document.querySelector('[data-module="guide"]');
    if (g && !g.hasAttribute('data-catalogue')) { return false; }
    const w = document.querySelector('[data-hooks="finder"] [data-finder-wait]');
    return !(w && w.getClientRects().length && !w.hidden);
  }, null, { timeout: 20000 });
  await page.waitForTimeout(600);
}
async function closeAll() { while (live.length) { try { await live.pop().close(); } catch (e) { /* gone */ } } }
const lines = [];
function say(broken, id, detail) { const l = (broken ? 'BROKEN ' : 'safe ') + id + ' · ' + detail; lines.push(l); console.log(l); }
const ONLY_CLAIMS = process.env.RT_CLAIMS ? new RegExp(process.env.RT_CLAIMS) : null;     // optional: run only matching claim ids
async function claim(id, fn) {
  if (ONLY_CLAIMS && !ONLY_CLAIMS.test(id)) { return; }
  try { const r = await fn(); say(!!r.broken, id, r.detail); }
  catch (e) { say(true, id, 'TEST ERROR, not checked: ' + String((e && e.message) || e).split('\n')[0]); }
  finally { await closeAll(); }
}
async function vis(page, sel) { try { return await page.locator(sel).first().isVisible(); } catch (e) { return false; } }
async function waitVis(page, sel, ms) { try { await page.locator(sel).first().waitFor({ state: 'visible', timeout: ms || 3000 }); return true; } catch (e) { return false; } }
async function tick(page, sel) { await page.locator(sel).first().evaluate((el) => { if (!el.checked) { el.click(); } }); }
async function blur(page) { await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) { document.activeElement.blur(); } }); }
async function scrollTo(page, y) { await page.evaluate((v) => window.scrollTo(0, v), y); await page.waitForTimeout(260); }
async function flow(page) { return page.evaluate(() => localStorage.getItem('pep:pep_flow_v1')); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const T = (s) => String(s || '').replace(/\s+/g, ' ').trim();

/* ------------------------------------------------ drivers ------------------------------------------------ */
async function showExit(page) {
  // a clear spot can move while the page settles (fonts, the spacing rule): look again until nothing is in view, then leave
  for (let i = 0; i < 4; i++) {
    const y = await page.evaluate(() => __rt.freeY(0, 0));
    if (y < 0) { throw new Error('no spot on the page clear of every ask'); }
    await scrollTo(page, y);
    if ((await page.evaluate(() => __rt.inView(0))).length === 0) { break; }
  }
  await page.evaluate(() => __rt.fireExit());
  if (!(await waitVis(page, '[data-hooks-exit][data-on]', 1500))) { return false; }
  await waitVis(page, '[data-hooks-exit] input[type="email"]', 1000);        // its children finish their own (tiny) visibility transition
  return true;
}
async function openBar(page) {
  await blur(page);
  // a clear spot (no ask within the window plus 30%): the bar should come up there. The page can still settle (the
  // spacing rule, a late image), so a spot that does not bring it up is followed by the next clear spot, three tries.
  let y = -1, from = 0, up = false, why = null;
  for (let i = 0; i < 3 && !up; i++) {
    y = await page.evaluate((f) => __rt.freeY(Math.max(140, Math.round(innerHeight * 0.3)), f), from);
    if (y < 0) { break; }
    await scrollTo(page, y);
    up = await waitVis(page, '[data-hooks-bar][data-on]', 2500);
    if (!up) { why = await page.evaluate(() => ({ y: Math.round(scrollY), inView: __rt.inView(Math.round(innerHeight * 0.3)) })); from = y + 200; }
  }
  if (!up) { throw new Error('the phone bar did not come up at a clear spot ' + JSON.stringify(why || { y })); }
  await page.locator('[data-hooks-bar-open]').click();
  if (!(await waitVis(page, '#pep-hooks-bar-email', 1500))) { throw new Error('the bar did not open'); }
}
async function finderToResult(page) {
  for (let i = 0; i < 5; i++) {
    if (await vis(page, '[data-hooks="finder"] [data-result]')) { return; }
    await page.locator('[data-hooks="finder"] [data-tiles] button').first().click();
    await page.waitForTimeout(80);
  }
  throw new Error('the finder did not reach a result');
}
async function openGuide(page) {
  await blur(page);
  const L = page.locator('[data-module="guide"] [data-launch]');
  await L.waitFor({ state: 'visible', timeout: 7000 });
  await L.click();
  await page.waitForFunction(() => document.querySelector('[data-module="guide"]').hasAttribute('data-open'), null, { timeout: 3000 });
  await page.waitForTimeout(150);
}
async function ask(page, text) {
  await page.locator('[data-module="guide"] [data-input]').fill(text);
  await page.locator('[data-module="guide"] [data-input]').press('Enter');
  await page.waitForTimeout(90);
}
async function lastGuide(page) {
  return page.evaluate(() => { const g = document.querySelectorAll('[data-module="guide"] [data-log] .pep-guide-msg--guide'); return g.length ? g[g.length - 1].innerText : ''; });
}
async function cartOpen(page) { return page.evaluate(() => { const c = document.querySelector('[data-module="cart"]'); return !!(c && c.hasAttribute('data-open')); }); }

const SENT = (id) => 'rt-' + id.toLowerCase() + '-sentinel@example.com';
const SEEDS = { hero: 'rt-seedhero-sentinel@example.com', lots: 'rt-seedlots-sentinel@example.com', card: 'Seedqname' };
const NAME63 = 'Qzxname', NAMEHERO = 'Vwyname', PHONE_NO = '+1 (604) 555-0199';
const BASEK = ['form', 'hook', 'slot', 'page', 'email', 'consent'];
const F = {
  H01: { email: '#pep-hero-email', box: '.pep-hero-form [data-consent]', go: '.pep-hero-form button[type="submit"]', done: '.pep-hero-form [data-step="name"]', err: '#pep-hero-consent-err', keys: BASEK },
  H63: { pre: async (p) => { await p.locator('#pep-hooks-card-first').fill(NAME63); await p.locator('form[data-hook="H63"] [data-make]').click(); },
    email: '#pep-hooks-card-email', box: 'form[data-hook="H63"] [data-consent="email"]', go: 'form[data-hook="H63"] button[type="submit"]', done: 'form[data-hook="H63"] [data-step="done"]', err: 'form[data-hook="H63"] [data-err="consent"]', keys: BASEK.concat('first_name') },
  H64: { pre: finderToResult, email: '#pep-hooks-finder-email', box: '[data-finder-form] [data-consent="email"]', go: '[data-finder-form] button[type="submit"]', done: '[data-finder-form] [data-step="done"]', err: '[data-finder-form] [data-err="consent"]', keys: BASEK.concat('prefs', 'picks') },
  H64T: { edits: NOPREVIEW, hook: 'H64', email: '#pep-hooks-twin-email', box: '[data-twin-form] [data-consent="email"]', go: '[data-twin-form] button[type="submit"]', done: '[data-twin-form] [data-step="done"]', err: '[data-twin-form] [data-err="consent"]', keys: BASEK },
  H65: { email: '#pep-hooks-lots-email', box: 'form[data-hook="H65"] [data-consent="email"]', go: 'form[data-hook="H65"] button[type="submit"]', done: 'form[data-hook="H65"] [data-step="sms"]', err: 'form[data-hook="H65"] [data-err="consent"]', keys: BASEK },
  H66: { email: '#pep-hooks-share-email', box: 'form[data-hook="H66"] [data-consent="email"]', go: 'form[data-hook="H66"] button[type="submit"]', done: 'form[data-hook="H66"] [data-step="link"]', err: 'form[data-hook="H66"] [data-err="consent"]', keys: BASEK.concat('ref') },
  H67: { pre: showExit, email: '#pep-hooks-exit-email', box: 'form[data-hook="H67"] [data-consent="email"]', go: 'form[data-hook="H67"] button[type="submit"]', done: 'form[data-hook="H67"] [data-step="done"]', err: 'form[data-hook="H67"] [data-err="consent"]', keys: BASEK },
  H68: { vp: PHONE, pre: openBar, email: '#pep-hooks-bar-email', box: 'form[data-hook="H68"] [data-consent="email"]', go: 'form[data-hook="H68"] button[type="submit"]', done: 'form[data-hook="H68"] [data-step="done"]', err: 'form[data-hook="H68"] [data-err="consent"]', keys: BASEK }
};
async function seed(page, id) {
  if (id !== 'H01' && await vis(page, '#pep-hero-email')) { await page.locator('#pep-hero-email').fill(SEEDS.hero); }
  if (id !== 'H63' && await vis(page, '#pep-hooks-card-first')) { await page.locator('#pep-hooks-card-first').fill(SEEDS.card); }
  if (id !== 'H65' && await vis(page, '#pep-hooks-lots-email')) { await page.locator('#pep-hooks-lots-email').fill(SEEDS.lots); }
  await blur(page);
}
function checkBody(raw, allowed, wants, foreign) {
  let b; try { b = JSON.parse(raw); } catch (e) { return { b: null, issues: ['body is not JSON'] }; }
  const issues = [];
  const extra = Object.keys(b).filter((k) => allowed.indexOf(k) < 0);
  if (extra.length) { issues.push('fields beyond its own: ' + extra.join(',')); }
  Object.keys(wants).forEach((k) => { if (b[k] !== wants[k]) { issues.push(k + '=' + JSON.stringify(b[k]) + ' (want ' + JSON.stringify(wants[k]) + ')'); } });
  foreign.forEach((s) => { if (raw.toLowerCase().indexOf(s.toLowerCase()) >= 0) { issues.push('carries another field\'s value ' + s); } });
  return { b, issues };
}
const PII_FOUND = [];

// one form, both endpoint modes. A: endpoint = test URL (unticked first, then ticked). B: endpoint empty (ticked).
async function consentRun(id) {
  const f = F[id], vp = f.vp || DESK, hook = f.hook || id, own = SENT(id), bad = [], ok = [];
  const foreign = [SEEDS.hero, SEEDS.lots, SEEDS.card].filter((s) => !(id === 'H01' && s === SEEDS.hero) && !(id === 'H63' && s === SEEDS.card) && !(id === 'H65' && s === SEEDS.lots));
  const needles = [own, 'sentinel', NAME63, NAMEHERO, SEEDS.card, '555-0199', '5550199', '604) 555'];
  for (const mode of ['endpoint', 'empty']) {
    const { page, rec } = await open(vp, { edits: (f.edits || '') + (mode === 'endpoint' ? ENDPOINT() : '') });
    await seed(page, id);
    if (f.pre) { const r = await f.pre(page); if (r === false) { throw new Error(id + ': could not open its ask'); } }
    if (!(await vis(page, f.email))) {
      const why = await page.evaluate((s) => { const e = document.querySelector(s); const r = e && e.getBoundingClientRect(); return { y: scrollY, inView: __rt.inView(0), exit: __rt.exitOn(), box: r ? [r.top, r.height, getComputedStyle(e).visibility] : null }; }, f.email);
      throw new Error(id + ': its email field is not on screen ' + JSON.stringify(why));
    }
    await page.locator(f.email).fill(own);
    if (mode === 'endpoint') {
      const p0 = POSTS.length, r0 = rec.reqs.length;
      await page.locator(f.go).click();
      await page.waitForTimeout(900);
      const done = await vis(page, f.done), err = await vis(page, f.err), fl = await flow(page);
      const nonGet = rec.reqs.slice(r0).filter((r) => r.method !== 'GET').length;
      if (done || POSTS.length > p0 || nonGet || fl) {
        bad.push('UNTICKED box still joined: ' + [done && 'success shown', POSTS.length > p0 && (POSTS.length - p0) + ' POST', fl && 'joined flag written'].filter(Boolean).join(', '));
        if (done) { await closeAll(); continue; }                 // the form has moved on: its ticked run happens in the next mode
      } else { ok.push('unticked: refused' + (err ? ' with its error' : '') + ', nothing sent'); }
    }
    await tick(page, f.box);
    const p1 = POSTS.length, r1 = rec.reqs.length;
    await page.locator(f.go).click();
    const done = await waitVis(page, f.done, 4000);
    await page.waitForTimeout(300);
    if (!done) { bad.push(mode + ': ticked submit never reached its success step'); }
    const sent = POSTS.slice(p1);
    const wants = { email: own, hook: hook };
    if (id === 'H63') { wants.first_name = NAME63; }
    if (mode === 'endpoint') {
      if (sent.length !== 1) { bad.push('endpoint: ' + sent.length + ' POSTs (want 1)'); }
      sent.forEach((s) => { const c = checkBody(s.body, f.keys, wants, foreign); if (c.issues.length) { bad.push('endpoint body: ' + c.issues.join('; ')); } else { ok.push('1 POST {' + Object.keys(c.b).join(',') + '}'); } });
    } else if (sent.length) { bad.push('endpoint EMPTY but ' + sent.length + ' POST reached the server'); }
    // H01: the optional first-name step. H65: the optional text step with its own box.
    if (id === 'H01' && done) {
      const q0 = POSTS.length;
      await page.locator('#pep-hero-first').fill(NAMEHERO);
      await page.locator('[data-save-name]').click();
      await waitVis(page, '.pep-hero-form [data-step="done"]', 2000);
      await page.waitForTimeout(300);
      const s2 = POSTS.slice(q0);
      if (mode === 'endpoint') {
        if (s2.length !== 1) { bad.push('name step: ' + s2.length + ' POSTs (want 1)'); }
        s2.forEach((s) => { const c = checkBody(s.body, ['form', 'hook', 'email', 'first_name'], { email: own, first_name: NAMEHERO }, foreign); if (c.issues.length) { bad.push('name body: ' + c.issues.join('; ')); } });
      } else if (s2.length) { bad.push('name step sent ' + s2.length + ' POST with the endpoint empty'); }
    }
    if (id === 'H65' && done) {
      const sms = 'form[data-hook="H65"] [data-consent="sms"]';
      const pre = await page.locator(sms).evaluate((el) => ({ checked: el.checked, attr: el.hasAttribute('checked') }));
      if (pre.checked || pre.attr) { bad.push('the text box arrived ticked'); }
      await page.locator('#pep-hooks-lots-phone').fill(PHONE_NO);
      const q0 = POSTS.length;
      if (mode === 'endpoint') {
        await page.locator('[data-sms-send]').click();
        await page.waitForTimeout(800);
        const leaked = POSTS.length > q0, moved = await vis(page, 'form[data-hook="H65"] [data-step="done"]');
        if (leaked || moved) { bad.push('UNTICKED text box still sent/finished (' + (POSTS.length - q0) + ' POST)'); } else { ok.push('text step: unticked refused'); }
      }
      await tick(page, sms);
      const q1 = POSTS.length;
      await page.locator('[data-sms-send]').click();
      const fin = await waitVis(page, 'form[data-hook="H65"] [data-step="done"]', 3000);
      await page.waitForTimeout(300);
      const s3 = POSTS.slice(q1);
      if (!fin) { bad.push(mode + ': ticked text step never finished'); }
      if (mode === 'endpoint') {
        if (s3.length !== 1) { bad.push('text step: ' + s3.length + ' POSTs (want 1)'); }
        s3.forEach((s) => { const c = checkBody(s.body, ['form', 'hook', 'slot', 'page', 'email', 'phone', 'consent_sms'], { email: own, phone: PHONE_NO }, foreign); if (c.issues.length) { bad.push('text body: ' + c.issues.join('; ')); } else { ok.push('text step: 1 POST {' + Object.keys(c.b).join(',') + '}'); } });
      } else if (s3.length) { bad.push('text step sent with the endpoint empty'); }
    }
    // nothing else leaves: every non-GET request goes to the endpoint, no URL carries a typed value
    const after = rec.reqs.slice(r1);
    const stray = after.filter((r) => r.method !== 'GET' && !(mode === 'endpoint' && r.url.indexOf(BASE + '/__collect') === 0));
    const inUrl = rec.reqs.filter((r) => needles.some((n) => r.url.toLowerCase().indexOf(n.toLowerCase()) >= 0));
    if (stray.length) { bad.push(mode + ': other requests ' + stray.map((r) => r.method + ' ' + r.url).join(', ')); }
    if (inUrl.length) { bad.push('typed value in a request URL ' + inUrl[0].url); }
    const ext = after.filter((r) => /^https?:/.test(r.url) && r.url.indexOf(BASE) !== 0);
    if (ext.length) { bad.push('requests to other hosts after the submit: ' + ext.slice(0, 3).map((r) => r.method + ' ' + r.url).join(', ')); }
    if (mode === 'empty' && !stray.length) { ok.push('empty endpoint: 0 requests sent'); }
    // invariant 2, gathered here for the pii-forms line
    const hits = await page.evaluate((n) => __rt.pii(n), needles);
    const dl = await page.evaluate(() => __rt.dlBad());
    const fl = await flow(page);
    let flKeys = [];
    try { flKeys = Object.keys(JSON.parse(fl || '{}')).filter((k) => ['stage', 'joinedAt', 'hooksDone'].indexOf(k) < 0); } catch (e) { flKeys = ['unparseable']; }
    PII_FOUND.push({ id: id + '/' + mode, hits, dl, flKeys });
    // owner rule: in a preview with nothing sent, a new form ends in "Preview only" (the hero, doors, cart and lineup do)
    if (mode === 'empty' && done && !f.edits) {
      const said = await page.evaluate((sel) => { const el = document.querySelector(sel); const room = el.closest('form') || el; return { all: __rt.textOf(room.closest('[data-hooks], [data-module]') || room), step: [].slice.call(room.querySelectorAll('[data-step]')).filter((s) => !s.hidden).map((s) => s.innerText).join(' ') }; }, f.done);
      PREVIEW_NOTE.push({ id, has: /preview only/i.test(said.all), step: T(said.step).slice(0, 70) });
    }
  }
  return { broken: bad.length > 0, detail: bad.length ? bad.join(' | ') : ok.join('; ') };
}
const PREVIEW_NOTE = [];

/* ------------------------------------------------ claims ------------------------------------------------ */
const PAYLOAD = '<img src=x onerror="window.__rtx=1" data-rtxss><rtxss-el></rtxss-el><svg onload="window.__rtx=2">"\'&rtxss';

async function groupInjection() {
  await claim('inj-card-name', async () => {
    const { page } = await open(DESK);
    await page.locator('#pep-hooks-card-first').fill(PAYLOAD);
    await page.waitForTimeout(150);
    const card = await page.locator('[data-card-name]').innerText();
    const typed = await page.locator('#pep-hooks-card-first').inputValue();          // the field's own maxlength applies first
    await page.locator('form[data-hook="H63"] [data-make]').click();
    const bad = await page.evaluate(() => __rt.injected());
    const want = typed.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 20).toUpperCase();
    return { broken: bad.length > 0 || T(card) !== want, detail: bad.length ? 'markup/script from the first name: ' + bad.join(', ') : 'card shows text only "' + T(card) + '" (no markup, no script)' };
  });
  await claim('inj-hero-name', async () => {
    const { page } = await open(DESK);
    await page.locator('#pep-hero-email').fill('rt-inj-sentinel@example.com');
    await tick(page, '.pep-hero-form [data-consent]');
    await page.locator('.pep-hero-form button[type="submit"]').click();
    if (!(await waitVis(page, '#pep-hero-first', 3000))) { throw new Error('hero name step did not open'); }
    await page.locator('#pep-hero-first').fill(PAYLOAD);
    await page.locator('[data-save-name]').click();
    await page.waitForTimeout(300);
    const out = await page.locator('[data-first-name]').evaluate((el) => el.textContent);
    const bad = await page.evaluate(() => __rt.injected());
    return { broken: bad.length > 0, detail: bad.length ? bad.join(', ') : 'name echo is text only: "' + T(out).slice(0, 60) + '"' };
  });
  await claim('inj-guide', async () => {
    const { page } = await open(DESK);
    await openGuide(page);
    await ask(page, PAYLOAD);
    const you = await page.evaluate(() => { const y = document.querySelectorAll('[data-module="guide"] .pep-guide-msg--you p:not(.pep-guide-who)'); return y.length ? y[y.length - 1].textContent : ''; });
    const bad = await page.evaluate(() => __rt.injected());
    // worst-case questions (300 characters each) for the matcher's patterns: how long does one answer hold the page?
    const ADV = ['how does '.repeat(34), 'do '.repeat(100), 'a '.repeat(150), 'for my '.repeat(43), 'what is '.repeat(37) + 'for', 'x'.repeat(300), 'tirzepatide '.repeat(25)];
    let worst = 0;
    for (const a of ADV) {
      const ms = await page.evaluate((txt) => { const i = document.querySelector('[data-module="guide"] [data-input]'); i.value = txt; const t0 = performance.now(); i.form.requestSubmit(); return performance.now() - t0; }, a);
      worst = Math.max(worst, ms);
    }
    const slow = worst > 1000;
    return { broken: bad.length > 0 || slow || you !== PAYLOAD.replace(/\s+/g, ' ').trim(), detail: bad.length ? bad.join(', ') : 'typed question shown as text only; worst of 7 hostile 300-character questions answered in ' + Math.round(worst) + ' ms' + (slow ? ' (TOO SLOW: the tab hangs)' : '') };
  });
  await claim('inj-url', async () => {
    const q = '?ref=' + encodeURIComponent(PAYLOAD) + '&intro&guides&cart=' + encodeURIComponent('<rtxss-el>') + '#' + encodeURIComponent('<svg onload=window.__rtx=3 data-rtxss>') + '&cart=x';
    const { page, rec } = await open(DESK, { query: q });
    await page.waitForTimeout(800);
    const bad = await page.evaluate(() => __rt.injected());
    const shown = await page.evaluate(() => /rtxss|onerror/i.test(document.body.innerText));
    return { broken: bad.length > 0 || shown || rec.errors.length > 0, detail: bad.length || shown ? 'URL text reached the page: ' + bad.join(', ') : 'hostile ?ref / query / hash: no markup, no script, nothing echoed' + (rec.errors.length ? ', page errors: ' + rec.errors[0] : '') };
  });
  await claim('inj-storage', async () => {
    const hostile = JSON.stringify({ stage: '<rtxss-el></rtxss-el>', joinedAt: '<img src=x onerror="window.__rtx=4" data-rtxss>', hooksDone: ['<rtxss-el>', { a: 1 }, 7] });
    const { page, rec } = await open(DESK, { sibling: `(() => { localStorage.setItem('pep:pep_flow_v1', ${JSON.stringify(hostile)}); localStorage.setItem('pep:pep_hooks_v1', '{"exitSeen":"<rtxss-el>"}'); sessionStorage.setItem('pep_hooks_exit', '<rtxss-el>'); sessionStorage.setItem('pep_entrance_seen', '<rtxss-el>'); })()` });
    await page.waitForTimeout(500);
    const bad = await page.evaluate(() => __rt.injected());
    const failed = await page.evaluate(() => Object.keys(PEP.status).filter((k) => PEP.status[k] === 'failed'));
    const shown = await page.evaluate(() => /rtxss/i.test(document.body.innerText));
    return { broken: bad.length > 0 || shown || failed.length > 0, detail: bad.length || shown ? 'stored text reached the page: ' + bad.join(', ') : 'hostile pep_flow_v1 / pep_hooks_v1 / session keys from a sibling page: no markup, no script, modules failed: ' + (failed.join(',') || 'none') + (rec.errors.length ? ', page errors: ' + rec.errors[0] : '') };
  });
}

async function groupConsent() {
  await claim('consent-boxes-unticked', async () => {
    const res = [];
    for (const vp of [DESK, PHONE]) {
      const { page } = await open(vp);
      res.push(...await page.evaluate(() => [].slice.call(document.querySelectorAll('[data-module="hero"] input[type="checkbox"], [data-module="hooks"] input[type="checkbox"]'))
        .filter((b) => b.checked || b.defaultChecked || b.hasAttribute('checked')).map((b) => (b.closest('form') ? b.closest('form').getAttribute('data-hook') : '?') + ':' + b.name)));
    }
    return { broken: res.length > 0, detail: res.length ? 'pre-ticked: ' + res.join(', ') : 'every hero/hooks consent box (email and text) starts unticked, no checked attribute' };
  });
  for (const id of (process.env.RT_FORMS ? process.env.RT_FORMS.split(',') : ['H01', 'H63', 'H64', 'H64T', 'H65', 'H66', 'H67', 'H68'])) {
    await claim('consent-' + id, () => consentRun(id));
  }
  await claim('consent-send-fail', async () => {
    const bad = [], ok = [];
    for (const id of ['H01', 'H63']) {
      const f = F[id];
      const { page } = await open(DESK, { edits: ENDPOINT('?fail=500') });
      if (f.pre) { await f.pre(page); }
      await page.locator(f.email).fill(SENT(id)); await tick(page, f.box); await page.locator(f.go).click();
      await page.waitForTimeout(1200);
      const done = await vis(page, f.done), fl = await flow(page);
      const err = await vis(page, id === 'H01' ? '[data-send-err]' : 'form[data-hook="H63"] [data-err="send"]');
      if (done || fl) { bad.push(id + ' joined although the endpoint refused (500)'); } else { ok.push(id + ' refused send: no success, no joined flag' + (err ? ', error shown' : '')); }
    }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join('; ') };
  });
  await claim('pii-forms', async () => {
    const hits = PII_FOUND.filter((p) => p.hits.length || p.dl.length || p.flKeys.length);
    if (!PII_FOUND.length) { throw new Error('no form run recorded'); }
    return { broken: hits.length > 0, detail: hits.length ? hits.map((p) => p.id + ': ' + p.hits.concat(p.dl, p.flKeys).slice(0, 3).join(', ')).join(' | ')
      : 'after ' + PII_FOUND.length + ' page views of submits (' + Array.from(new Set(PII_FOUND.map((p) => p.id.split('/')[0]))).join(', ') + '; H01 with its name step, H63 with a first name, H65 with a phone; other fields seeded but not sent): no email, name or phone in localStorage, sessionStorage, cookies, URL, window.name or dataLayer; pep_flow_v1 holds stage/joinedAt/hooksDone only' };
  });
  await claim('preview-only-note', async () => {
    if (!PREVIEW_NOTE.length) { throw new Error('no preview run recorded'); }
    const miss = PREVIEW_NOTE.filter((p) => !p.has);
    return { broken: miss.length > 0, detail: miss.length ? '(low, owner rule) with PREVIEW on and nothing sent, ' + miss.map((p) => p.id).join(', ') + ' end on a promise with no "Preview only" line, e.g. ' + miss.slice(0, 2).map((p) => p.id + ': "' + p.step + '"').join('; ') + (PREVIEW_NOTE.some((p) => p.has) ? ' (' + PREVIEW_NOTE.filter((p) => p.has).map((p) => p.id).join(', ') + ' do say it)' : '')
      : 'every preview form ends with its "Preview only" line' };
  });
  await claim('pii-guide', async () => {
    const { page, rec } = await open(DESK, { edits: ENDPOINT() });
    await openGuide(page);
    const r0 = rec.reqs.length, p0 = POSTS.length;
    await ask(page, 'my email is rt-guide-sentinel@example.com and my phone is 604 555 0177, my name is Zqguidename');
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
    const hits = await page.evaluate(() => __rt.pii(['rt-guide-sentinel', '555 0177', '5550177', 'zqguidename']));
    const sent = rec.reqs.slice(r0).filter((r) => r.method !== 'GET' || /sentinel|zqguide|0177/i.test(r.url)).length + (POSTS.length - p0);
    const dl = await page.evaluate(() => (window.dataLayer || []).filter((e) => /^guide/.test(e.event)).map((e) => JSON.stringify(e)));
    return { broken: hits.length > 0 || sent > 0, detail: hits.length || sent ? hits.concat(sent ? [sent + ' request(s) after asking'] : []).join(', ') : 'a typed question with an email, phone and name (endpoint set) sends nothing and leaves no trace in storage, URL or dataLayer (dataLayer: ' + dl.join(' ') + ')' };
  });
}

const PAT = {
  offer: /FOR LIFE|FIRST 25 MEMBERS|CLAIM MY FOUNDER SPOT|FOUNDER OFFER|%\s*OFF\s*(FIRST|THIS)\s*ORDER|FIRST-ORDER OFFER|saving (then )?shows/i,
  offer10: /\b10\s*%/,
  referral: /GIVE\s*\d+\s*%|\d+\s*%\s*CREDIT|REFER A FRIEND|referral programme|credit when they order|% off their first order/i,
  restock: /\bNEW LOTS?\b|EVERY NEW LOT|GET FIRST ACCESS|TELL ME WHEN IT.S BACK|first word on every new lot/i,
  pct: /\d\s*%|\bpercent\b/i
};
const QUESTIONS = ['do you have a discount code?', 'any promo or coupon?', 'what is the first order offer?', 'is there a referral program?',
  'can I refer a friend for credit?', 'do you have rewards or points?', 'is it 15% off?', 'ten percent off?', 'when is the next lot?',
  'restock alerts please', 'is it back in stock?', 'how do I join the team?', 'what do members get?', 'what is the founder circle?'];
async function gateTexts(vp, edits, member) {
  const sib = member ? `(() => localStorage.setItem('pep:pep_flow_v1', JSON.stringify({ stage: 'TEAM', joinedAt: '2026-11-13T00:00:00.000Z', hooksDone: ['H01'] })))()` : null;
  const { page } = await open(vp, { edits, sibling: sib });
  const t = await page.evaluate(() => __rt.moduleTexts());
  t.aria = await page.locator('body').ariaSnapshot().catch(() => '');
  if (!member) {
    if (vp === DESK) { if (await showExit(page).catch(() => false)) { t['hooks:exit-open'] = await page.evaluate(() => __rt.textOf(document.querySelector('[data-hooks-exit]'))); await page.keyboard.press('Escape'); } }
    else { try { await openBar(page); t['hooks:bar-open'] = await page.evaluate(() => __rt.textOf(document.querySelector('[data-hooks-bar]'))); await page.keyboard.press('Escape'); } catch (e) { /* no free spot: covered by bar claims */ } }
  }
  await scrollTo(page, 0);
  await openGuide(page);
  for (const c of await page.locator('[data-module="guide"] [data-chips] button').all()) { if (await c.isVisible()) { await c.click(); await page.waitForTimeout(60); } }
  for (const q of QUESTIONS) { await ask(page, q); }
  t['guide:answers'] = await page.evaluate(() => [].slice.call(document.querySelectorAll('[data-module="guide"] [data-log] .pep-guide-msg--guide, [data-module="guide"] [data-chips]')).map((e) => __rt.textOf(e)).join('\n'));
  await page.keyboard.press('Escape');
  await page.evaluate(() => PEP.emit('cart:add', { sizeId: 'bpc-157-10mg', qty: 1 }));
  await page.waitForTimeout(200);
  if (!(await cartOpen(page))) { await page.evaluate(() => PEP.emit('cart:open', {})); await page.waitForTimeout(300); }
  t['cart:open'] = await page.evaluate(() => __rt.textOf(document.querySelector('[data-module="cart"]')));
  return t;
}
function scan(texts, forbid) {
  const hits = [];
  Object.keys(texts).forEach((k) => {
    forbid.forEach((p) => { const m = PAT[p].exec(texts[k] || ''); if (m) { const i = Math.max(0, m.index - 30); hits.push(p + ' in ' + k + ': "' + T(texts[k].slice(i, m.index + 40)) + '"'); } });
  });
  return hits;
}
async function groupGates() {
  const VARIANTS = [
    { id: 'gate-preview-off', edits: NOPREVIEW, forbid: ['offer', 'referral', 'restock', 'pct'] },
    { id: 'gate-names-cleared-only', edits: NOPREVIEW + 'C.flags.COUNSEL_CLEARED.names=true;', forbid: ['offer', 'referral', 'restock', 'pct'] },
    { id: 'gate-offer-cleared-only', edits: NOPREVIEW + 'C.flags.COUNSEL_CLEARED.offer=true;', forbid: ['referral', 'restock'] },
    { id: 'gate-referral-cleared-only', edits: NOPREVIEW + 'C.flags.COUNSEL_CLEARED.referral=true;', forbid: ['offer', 'offer10', 'restock'] },
    { id: 'gate-restock-cleared-only', edits: NOPREVIEW + 'C.flags.COUNSEL_CLEARED.restock=true;', forbid: ['offer', 'referral', 'pct'] }
  ];
  // control: with PREVIEW true the same scan must SEE the gated wording, or the scan proves nothing
  await claim('gate-scanner-control', async () => {
    const t = await gateTexts(DESK, '', false);
    const seen = ['offer', 'referral', 'restock'].filter((p) => scan(t, [p]).length > 0);
    if (seen.length < 3) { throw new Error('with PREVIEW true the scan only saw ' + (seen.join('/') || 'nothing') + ': the gate claims below cannot be trusted'); }
    return { broken: false, detail: 'control: with PREVIEW true the scan sees offer, referral and restock wording (' + scan(t, ['offer', 'referral', 'restock']).length + ' places), so a clean scan below means the wording is really gone' };
  });
  for (const v of VARIANTS) {
    await claim(v.id, async () => {
      const hits = [];
      for (const [vp, member] of [[DESK, false], [PHONE, false], [DESK, true]]) {
        const t = await gateTexts(vp, v.edits, member);
        scan(t, v.forbid).forEach((h) => { const tag = (vp === PHONE ? 'phone ' : '') + (member ? 'member ' : '') + h; if (hits.indexOf(tag) < 0) { hits.push(tag); } });
        await closeAll();
      }
      return { broken: hits.length > 0, detail: hits.length ? hits.slice(0, 4).join(' | ') + (hits.length > 4 ? ' (+' + (hits.length - 4) + ' more)' : '')
        : 'no ' + v.forbid.join('/') + ' wording on screen, in the accessibility tree, the exit, the phone bar, 14 guide questions + chips, or the cart (desktop, phone, member)' };
    });
  }
  await claim('gate-page-source', async () => {
    const src = injectConfig(HTML, NOPREVIEW);
    const offerText = (/offer\s*:\s*\{\s*(?:\/\/[^\n]*\n\s*)*text\s*:\s*'([^']*)'/.exec(src) || [])[1] || '';
    const ref = /referral\s*:\s*\{\s*givePercent\s*:\s*(\d+)\s*,\s*getPercent\s*:\s*(\d+)/.exec(src);
    const leaks = [];
    if (offerText) { leaks.push('PEP_CONFIG.offer.text "' + offerText + '"'); }
    if (ref) { leaks.push('hooks.referral ' + ref[1] + '/' + ref[2]); }
    const hiddenDom = (src.match(/GIVE <span data-give>/g) || []).length;
    if (hiddenDom) { leaks.push('hidden H66 reward markup "GIVE n% OFF. GET n% CREDIT."'); }
    return { broken: leaks.length > 0, detail: leaks.length ? '(low: not on screen) with PREVIEW false the delivered page still carries ' + leaks.join(', ') + ' in view-source / window.PEP_CONFIG unless the build strips them (build.mjs not available to test)' : 'no gated wording in the page source' };
  });
}

async function groupShare() {
  await claim('share-code', async () => {
    const SPY = '(function(){var g=crypto.getRandomValues.bind(crypto);window.__rtSpy=0;crypto.getRandomValues=function(a){if(a&&a.length===8&&a instanceof Uint8Array){window.__rtSpy++;}return g(a);};})();';
    const got = [], bad = [];
    for (let i = 0; i < 4; i++) {
      const { page } = await open(DESK, { edits: ENDPOINT(), init: SPY });
      const p0 = POSTS.length;
      await page.locator('#pep-hooks-share-email').fill(SENT('H66'));
      await tick(page, F.H66.box);
      await page.locator(F.H66.go).click();
      if (!(await waitVis(page, '#pep-hooks-share-link', 3000))) { throw new Error('no share link step'); }
      const link = await page.locator('#pep-hooks-share-link').inputValue();
      const spy = await page.evaluate(() => window.__rtSpy);
      let ref = null; const s = POSTS.slice(p0)[0]; try { ref = JSON.parse(s.body).ref; } catch (e) { ref = null; }
      got.push({ link, ref, spy });
    }
    const rx = new RegExp('^' + (BASE + PAGE).replace(/[.?*+^$()|[\]\\/]/g, '\\$&') + '\\?ref=([A-HJ-NP-Z2-9]{8})$');
    got.forEach((g) => {
      const m = rx.exec(g.link);
      if (!m) { bad.push('link not origin+path+?ref=8 chars: ' + g.link); }
      else if (g.ref !== m[1]) { bad.push('code sent (' + g.ref + ') differs from the link'); }
      if (!g.spy) { bad.push('code not drawn from crypto.getRandomValues'); }
    });
    const codes = got.map((g) => g.link.split('ref=')[1]);
    if (new Set(codes).size !== codes.length) { bad.push('codes repeat: ' + codes.join(',')); }
    return { broken: bad.length > 0, detail: bad.length ? bad.join('; ') : 'link = page URL + ?ref=<8 of 32 chars from crypto.getRandomValues> (' + codes.join(', ') + '), no email/name, same code in the POST' };
  });
  await claim('share-crafted-link', async () => {
    const snap = async (q) => {
      const { page } = await open(DESK, { query: q || '' });
      await page.waitForTimeout(300);
      const s = { text: T(await page.evaluate(() => document.body.innerText)), store: await page.evaluate(() => __rt.storage()), bad: await page.evaluate(() => __rt.injected()),
        events: await page.evaluate(() => (window.dataLayer || []).map((e) => e.event + ':' + (e.hook || '')).sort().join(' ')) };
      await closeAll();
      return s;
    };
    const base0 = await snap('');
    const CRAFT = ['?ref=' + encodeURIComponent('<img src=x onerror="window.__rtx=1" data-rtxss>'), '?ref=REWARD15&reward=15&discount=15&percent=15&joined=1&stage=TEAM',
      '?ref=AAAAAAAA&ref=BBBBBBBB#ref=CCCCCCCC', '?ref=' + 'A'.repeat(4000), '?ref=%22%3E%3Csvg%2Fonload%3Dwindow.__rtx%3D2%3E#%3Crtxss-el%3E'];
    const diffs = [];
    for (const q of CRAFT) {
      const s = await snap(q);
      if (s.bad.length) { diffs.push(q.slice(0, 30) + ': injected ' + s.bad.join(',')); }
      if (s.text !== base0.text) { let i = 0; while (i < s.text.length && s.text[i] === base0.text[i]) { i++; } diffs.push(q.slice(0, 30) + ': page text differs near "' + s.text.slice(Math.max(0, i - 20), i + 40) + '"'); }
      if (s.store.join('|') !== base0.store.join('|')) { diffs.push(q.slice(0, 30) + ': storage differs ' + s.store.filter((x) => base0.store.indexOf(x) < 0).join(',')); }
      if (s.events !== base0.events) { diffs.push(q.slice(0, 30) + ': dataLayer differs'); }
    }
    // the crafted code never rides along: the visitor's own link is fresh and no form payload carries it
    const { page } = await open(DESK, { query: '?ref=ZZZZZZZZ&reward=15', edits: ENDPOINT() });
    const p0 = POSTS.length;
    await page.locator('#pep-hooks-share-email').fill(SENT('H66')); await tick(page, F.H66.box); await page.locator(F.H66.go).click();
    await waitVis(page, '#pep-hooks-share-link', 3000);
    const link = await page.locator('#pep-hooks-share-link').inputValue();
    if (/ZZZZZZZZ|reward/i.test(link)) { diffs.push('the crafted ref is copied into the visitor\'s own link'); }
    if (POSTS.slice(p0).some((s) => /ZZZZZZZZ|reward/i.test(s.body))) { diffs.push('the crafted ref rides in a form payload'); }
    return { broken: diffs.length > 0, detail: diffs.length ? diffs.slice(0, 3).join(' | ') : '5 crafted links (markup, fake reward params, repeated ref, 4 kB ref, hash): page text, storage and dataLayer identical to a plain visit; own link fresh; nothing reads ?ref' };
  });
  await claim('share-attribution', async () => {
    const sib = `(() => localStorage.setItem('pep:pep_flow_v1', JSON.stringify({ stage: 'TEAM', joinedAt: '2026-11-13T00:00:00.000Z', hooksDone: ['H01'] })))()`;
    const links = [];
    let p0 = POSTS.length;
    for (let i = 0; i < 2; i++) {
      const { page } = await open(DESK, { edits: ENDPOINT(), sibling: sib });
      if (await vis(page, '#pep-hooks-share-link')) { links.push(await page.locator('#pep-hooks-share-link').inputValue()); }
      await closeAll();
    }
    const memberPosts = POSTS.length - p0;
    p0 = POSTS.length;
    const { page } = await open(DESK, { edits: ENDPOINT(), query: '?ref=ABCDEFGH' });
    await F.H63.pre(page); await page.locator(F.H63.email).fill(SENT('H63')); await tick(page, F.H63.box); await page.locator(F.H63.go).click();
    await page.waitForTimeout(800);
    const carried = POSTS.slice(p0).some((s) => s.body.indexOf('ABCDEFGH') >= 0);
    const broken = links.length === 2 && memberPosts === 0 && !carried;
    return { broken, detail: broken ? '(low, functional) a member is shown a share link whose code was never sent with their email (' + links.map((l) => l.split('ref=')[1]).join(' then ') + ' on two visits, 0 POSTs), and a friend landing on ?ref=ABCDEFGH joins without the code: no reward can ever be credited'
      : 'member links: ' + links.length + ', POSTs: ' + memberPosts + ', ref carried on join: ' + carried };
  });
}

async function groupExit() {
  await claim('exit-once-per-session', async () => {
    const { page } = await open(DESK);
    const s1 = await showExit(page);
    await page.locator('[data-hooks-exit] [data-hooks-exit-close]').first().click();
    await page.waitForTimeout(200);
    const closed = !(await page.evaluate(() => __rt.exitOn()));
    await page.evaluate(() => __rt.fireExit()); await page.waitForTimeout(600);
    const s2 = await page.evaluate(() => __rt.exitOn());
    await page.reload(); await ready(page);
    const s3 = await showExit(page);
    return { broken: !s1 || s2 || s3 || !closed, detail: 'first leave: ' + (s1 ? 'shown' : 'NOT shown') + ', close button: ' + (closed ? 'closes' : 'does NOT close') + ', second leave: ' + (s2 ? 'SHOWN AGAIN' : 'not shown') + ', after reload (same session): ' + (s3 ? 'SHOWN AGAIN' : 'not shown') };
  });
  await claim('exit-max-3-ever', async () => {
    let state; const shows = [];
    for (let i = 0; i < 4; i++) {
      const { ctx, page } = await open(DESK, { storageState: state });
      const s = await showExit(page); shows.push(s);
      if (s) { await page.keyboard.press('Escape'); }
      state = await ctx.storageState();
      await closeAll();
    }
    const want = [true, true, true, false];
    return { broken: shows.join() !== want.join(), detail: 'four sessions sharing localStorage: ' + shows.map((s) => (s ? 'shown' : 'not shown')).join(', ') };
  });
  await claim('exit-never-member', async () => {
    const res = [];
    for (const fl of [{ stage: 'TEAM' }, { joinedAt: '2026-11-13T00:00:00.000Z' }]) {
      const { page } = await open(DESK, { sibling: `(() => localStorage.setItem('pep:pep_flow_v1', ${JSON.stringify(JSON.stringify(fl))}))()` });
      res.push(await showExit(page));
      await closeAll();
    }
    // joining in this page view stops it too
    const { page } = await open(DESK);
    await page.locator('#pep-hero-email').fill(SENT('H01')); await tick(page, F.H01.box); await page.locator(F.H01.go).click();
    await waitVis(page, F.H01.done, 3000);
    res.push(await showExit(page));
    return { broken: res.some(Boolean), detail: 'member (stage TEAM): ' + (res[0] ? 'SHOWN' : 'not shown') + ', member (joinedAt): ' + (res[1] ? 'SHOWN' : 'not shown') + ', joined this visit: ' + (res[2] ? 'SHOWN' : 'not shown') };
  });
  await claim('exit-never-over-cart-guide-form', async () => {
    const bad = [], ok = [];
    { // cart
      const { page } = await open(DESK);
      await scrollTo(page, await page.evaluate(() => __rt.freeY(0, 0)));
      await page.evaluate(() => PEP.emit('cart:open', {})); await page.waitForTimeout(300);
      if (!(await cartOpen(page))) { throw new Error('cart did not open'); }
      await page.evaluate(() => __rt.fireExit()); await page.waitForTimeout(600);
      if (await page.evaluate(() => __rt.exitOn())) { bad.push('shown over the open cart'); } else { ok.push('not over the cart'); }
      await page.keyboard.press('Escape'); await page.waitForTimeout(400);
      if (await cartOpen(page)) { await page.locator('[data-module="cart"] [data-close]').first().click().catch(() => {}); await page.waitForTimeout(300); }
      if (await showExit(page)) {
        await page.evaluate(() => PEP.emit('cart:open', {})); await page.waitForTimeout(400);
        if (await page.evaluate(() => __rt.exitOn())) { bad.push('stays on when the cart opens'); } else { ok.push('closes when the cart opens'); }
      } else { bad.push('did not show after the cart closed (control)'); }
      await closeAll();
    }
    { // guide
      const { page } = await open(DESK);
      await scrollTo(page, await page.evaluate(() => __rt.freeY(0, 0)));
      await openGuide(page);
      await page.evaluate(() => __rt.fireExit()); await page.waitForTimeout(600);
      if (await page.evaluate(() => __rt.exitOn())) { bad.push('shown over the open guide'); } else { ok.push('not over the guide'); }
      await closeAll();
    }
    { // forms
      const { page } = await open(DESK);
      await scrollTo(page, 0);
      const inView = await page.evaluate(() => __rt.inView(0));
      await page.evaluate(() => __rt.fireExit()); await page.waitForTimeout(600);
      if (await page.evaluate(() => __rt.exitOn())) { bad.push('shown with ' + inView.join('/') + ' in view'); } else { ok.push('not with ' + inView.join('/') + ' in view'); }
      if (await showExit(page)) {
        await page.locator('form[data-hook="H63"]').evaluate((el) => el.scrollIntoView({ block: 'center' }));
        await page.waitForTimeout(400);
        if (await page.evaluate(() => __rt.exitOn())) { bad.push('stays on over the H63 form'); } else { ok.push('closes when a form scrolls in'); }
      } else { bad.push('did not show at a clear spot (control)'); }
    }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(', ') };
  });
  await claim('exit-focus-escape-close', async () => {
    const { page } = await open(DESK);
    await blur(page);
    const shownIt = await showExit(page);
    if (!shownIt) { throw new Error('exit did not show'); }
    const inExit = () => page.evaluate(() => document.querySelector('[data-hooks-exit]').contains(document.activeElement));
    const where = () => page.evaluate(() => { const a = document.activeElement; return !a ? 'none' : a === document.body ? 'body' : a.tagName.toLowerCase() + (a.id ? '#' + a.id : ''); });
    const moved = await inExit();
    // real keyboard paths only: into the slide-in from its close button, out of it both ways
    await page.locator('#pep-hooks-exit-email').focus();
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(120); await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(120);
    const back = !(await inExit());
    await page.locator('#pep-hooks-exit-email').focus();
    for (let i = 0; i < 3; i++) { await page.keyboard.press('Tab'); await page.waitForTimeout(120); }
    const fwd = !(await inExit());
    await page.locator('#pep-hooks-exit-email').focus();
    await page.keyboard.press('Escape'); await page.waitForTimeout(300);
    const esc = !(await page.evaluate(() => __rt.exitOn()));
    const ae = await where();
    const left = !(await inExit());
    const broken = moved || !back || !fwd || !esc || !left;
    return { broken, detail: 'showing it ' + (moved ? 'STEALS' : 'leaves') + ' focus; Shift+Tab ' + (back ? 'leaves' : 'is TRAPPED in') + ' it; Tab ' + (fwd ? 'leaves' : 'is TRAPPED in') + ' it; Escape ' + (esc ? 'closes' : 'does NOT close') + ' it, focus then on ' + ae };
  });
  await claim('exit-closing-focus', async () => {
    // normal motion: the slide-in stays visible for its 0.7 s glide out after it closes itself. Can the keyboard land in it
    // during the glide and be left on an invisible field?
    const { page } = await open(DESK, { motion: true });
    await page.waitForTimeout(5200);                                    // the entrance and its 5.6 s fallback
    await blur(page);
    if (!(await showExit(page))) { throw new Error('exit did not show'); }
    await page.waitForTimeout(800);
    await page.locator('[data-hooks-exit] [data-hooks-exit-close]').first().focus();
    // Shift+Tab twice: the guide's light, then the footer's last link: the page jumps to the foot, a form comes into view,
    // and the slide-in closes itself (its own rule). The visitor tabs straight back.
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(150);
    await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(150);
    const closed = !(await page.evaluate(() => document.querySelector('[data-hooks-exit]').hasAttribute('data-on')));
    await page.keyboard.press('Tab'); await page.waitForTimeout(150);
    await page.keyboard.press('Tab'); await page.waitForTimeout(150);
    await page.waitForTimeout(1200);
    const r = await page.evaluate(() => { const a = document.activeElement, e = document.querySelector('[data-hooks-exit]'); return { inside: e.contains(a), vis: getComputedStyle(e).visibility, on: e.hasAttribute('data-on'), at: a === document.body ? 'body' : a.tagName.toLowerCase() + (a.id ? '#' + a.id : '') + '.' + String(a.className).split(' ')[0] }; });
    const broken = closed && r.inside && r.vis === 'hidden';
    return { broken, detail: broken ? '(low) after the slide-in closed itself, Tab landed on ' + r.at + ' inside it during its glide out; it is now hidden (visibility ' + r.vis + ') with the keyboard still on it, and Escape no longer reaches it'
      : 'closed itself: ' + closed + '; focus after tabbing back: ' + r.at + ' (inside: ' + r.inside + ', slide-in ' + r.vis + ')' };
  });
  await claim('exit-phone-flick', async () => {
    const { page } = await open(PHONE);
    const H = await page.evaluate(() => document.documentElement.scrollHeight), vh = PHONE.height;
    await scrollTo(page, H - vh); await page.waitForTimeout(250);
    // flick that ends with the hero form in view
    await page.evaluate((v) => window.scrollTo(0, v), Math.round(vh * 0.45)); await page.waitForTimeout(120);
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(700);
    const onForm = await page.evaluate(() => __rt.exitOn());
    const F0 = await page.evaluate(() => __rt.freeY(0, 0));
    await page.evaluate((v) => window.scrollTo(0, v), F0 + Math.round(vh * 0.45)); await page.waitForTimeout(120);
    await page.evaluate((v) => window.scrollTo(0, v), F0); await page.waitForTimeout(800);
    const s1 = await page.evaluate(() => __rt.exitOn());
    if (s1) { await page.locator('[data-hooks-exit] [data-hooks-exit-close]').first().click(); }
    await page.evaluate((v) => window.scrollTo(0, v), F0 + Math.round(vh * 0.45)); await page.waitForTimeout(120);
    await page.evaluate((v) => window.scrollTo(0, v), F0); await page.waitForTimeout(800);
    const s2 = await page.evaluate(() => __rt.exitOn());
    return { broken: onForm || !s1 || s2, detail: 'flick ending on the hero form: ' + (onForm ? 'SHOWN' : 'not shown') + '; flick at a clear spot: ' + (s1 ? 'shown' : 'NOT shown') + '; second flick: ' + (s2 ? 'SHOWN AGAIN' : 'not shown') };
  });
  await claim('exit-cap-hostile', async () => {
    const { page } = await open(DESK, { sibling: `(() => localStorage.setItem('pep:pep_hooks_v1', '{"exitSeen":-100}'))()` });
    const s = await showExit(page);
    const n = await page.evaluate(() => localStorage.getItem('pep:pep_hooks_v1'));
    return { broken: false, detail: 'a sibling page writing {"exitSeen":-100} gets ' + (s ? '103 more shows (stored now ' + n + ')' : 'no show') + '; a sibling can clear the key anyway, so the cap is advisory (note only)' };
  });
}

async function groupBar() {
  await claim('bar-never-covers-an-ask', async () => {
    const { page } = await open(PHONE);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    const on = [], over = [];
    for (let y = 0; y < H; y += 173) {
      await page.evaluate((v) => window.scrollTo(0, v), y);
      await page.waitForTimeout(110);
      const r = await page.evaluate(() => { const b = document.querySelector('[data-hooks-bar]'); return { y: Math.round(scrollY), on: __rt.barOn(), over: __rt.barOn() ? __rt.overlaps(b) : [] }; });
      if (r.on) { on.push(r.y); }
      if (r.over.length) { over.push(r.y + ':' + r.over.join('/')); }
    }
    return { broken: over.length > 0 || !on.length, detail: over.length ? 'closed bar over ' + over.slice(0, 4).join(', ') : on.length ? 'swept ' + Math.ceil(H / 173) + ' scroll spots: the bar showed at ' + on.length + ', never over a form, a hooks pane, the story or THE LINEUP' : 'the bar never showed (nothing to test)' };
  });
  await claim('bar-hides', async () => {
    const bad = [], ok = [];
    {
      const { page } = await open(PHONE, { sibling: `(() => localStorage.setItem('pep:pep_flow_v1', '{"stage":"TEAM"}'))()` });
      await scrollTo(page, await page.evaluate(() => __rt.freeY(Math.max(140, Math.round(innerHeight * 0.3)), 0)));
      await page.waitForTimeout(700);
      if (await page.evaluate(() => __rt.barOn())) { bad.push('shown to a member'); } else { ok.push('member: hidden'); }
      await closeAll();
    }
    const { page } = await open(PHONE);
    const y = await page.evaluate(() => __rt.freeY(Math.max(140, Math.round(innerHeight * 0.3)), 0));
    await scrollTo(page, y); await page.waitForTimeout(700);
    if (!(await page.evaluate(() => __rt.barOn()))) { throw new Error('bar did not show at a clear spot (control)'); }
    const check = async (what, act, undo) => {
      await act(); await page.waitForTimeout(700);
      if (await page.evaluate(() => __rt.barOn())) { bad.push('shown with ' + what); } else { ok.push(what + ': hidden'); }
      await undo(); await page.waitForTimeout(800);
    };
    await check('the cart open', () => page.evaluate(() => PEP.emit('cart:open', {})), async () => { await page.keyboard.press('Escape'); });
    await scrollTo(page, y);
    await check('the guide open', () => openGuide(page), async () => { await page.keyboard.press('Escape'); });
    await scrollTo(page, y);
    await check('a field focused (keyboard up)', () => page.evaluate(() => document.querySelector('#pep-hero-email').focus({ preventScroll: true })), () => blur(page));
    await scrollTo(page, y);
    await check('the exit slide-in on', () => page.evaluate(() => __rt.fireExit()), async () => { await page.keyboard.press('Escape'); });
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(', ') };
  });
  await claim('bar-open-sheet', async () => {
    const bad = [], ok = [];
    const { page } = await open(PHONE);
    await openBar(page);
    // the visitor opened the sheet, then scrolls on (down or back up): does the open sheet now sit over another ask?
    // the nearest ask, above or below, is brought to where the sheet stands (its top 300 px above the foot of the window)
    const target = await page.evaluate(() => {
      const y0 = scrollY, a = __rt.asks().map((el) => ({ t: el.getBoundingClientRect().top + scrollY, h: el.getBoundingClientRect().height }))
        .sort((p, q) => Math.abs(p.t - y0) - Math.abs(q.t - y0))[0];
      return a ? Math.round(a.t) : -1;
    });
    if (target < 0) { throw new Error('no other ask on the page to scroll under the open sheet'); }
    await scrollTo(page, Math.max(0, target - PHONE.height + 300));
    await page.waitForTimeout(700);
    const r = await page.evaluate(() => ({ on: __rt.barOn(), over: __rt.overlaps(document.querySelector('[data-hooks-bar]'), true), open: !document.querySelector('[data-hooks-bar-sheet]').hidden }));
    if (r.on && r.open && r.over.length) { bad.push('(low) the open JOIN sheet stays fixed over ' + r.over.join(', ') + ' as the page scrolls'); }
    else { ok.push('scrolled an ask under it: sheet ' + (r.on ? (r.open ? 'open but clear of it' : 'collapsed') : 'hidden')); }
    await page.evaluate(() => PEP.emit('cart:open', {})); await page.waitForTimeout(500);
    const overCart = await page.evaluate(() => __rt.barOn() && __rt.onTop(document.querySelector('[data-hooks-bar]')));
    if (overCart) { bad.push('open sheet painted over the cart'); } else { ok.push('cart covers the open sheet'); }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(', ') };
  });
  await claim('bar-escape-close-focus', async () => {
    const { page } = await open(PHONE);
    await openBar(page);
    await page.keyboard.press('Escape'); await page.waitForTimeout(200);
    const esc = await page.evaluate(() => document.querySelector('[data-hooks-bar-sheet]').hidden && document.querySelector('[data-hooks-bar-open]').getAttribute('aria-expanded') === 'false');
    await page.locator('[data-hooks-bar-open]').click(); await page.waitForTimeout(200);
    await page.locator('[data-hooks-bar] [data-hooks-bar-close]').first().click(); await page.waitForTimeout(200);
    const x = await page.evaluate(() => document.querySelector('[data-hooks-bar-sheet]').hidden);
    await page.locator('[data-hooks-bar-open]').click(); await page.waitForTimeout(200);
    for (let i = 0; i < 4; i++) { await page.keyboard.press('Shift+Tab'); }
    const out = await page.evaluate(() => !document.querySelector('[data-hooks-bar]').contains(document.activeElement));
    return { broken: !esc || !x || !out, detail: 'Escape ' + (esc ? 'closes' : 'does NOT close') + ' the sheet; its close button ' + (x ? 'closes' : 'does NOT close') + ' it; Shift+Tab ' + (out ? 'leaves' : 'is TRAPPED in') + ' it' };
  });
}

async function groupStates() {
  await claim('hdr-dropdown', async () => {
    const { page } = await open(DESK);
    const open1 = async () => { await page.locator('[data-key="peptides"]').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(150); return page.evaluate(() => document.querySelector('[data-module="header"]').hasAttribute('data-drop-open')); };
    const isOpen = () => page.evaluate(() => document.querySelector('[data-module="header"]').hasAttribute('data-drop-open'));
    const bad = [], ok = [];
    if (!(await open1())) { throw new Error('Enter did not open PEPTIDES'); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    const focusBack = await page.evaluate(() => document.activeElement === document.querySelector('[data-key="peptides"]'));
    if (await isOpen() || !focusBack) { bad.push('Escape: ' + ((await isOpen()) ? 'stays open' : 'focus lost')); } else { ok.push('Escape closes, focus back on PEPTIDES'); }
    await open1();
    let left = false;
    for (let i = 0; i < 45 && !left; i++) { await page.keyboard.press('Tab'); left = await page.evaluate(() => !document.querySelector('.pep-header-li--drop').contains(document.activeElement)); }
    if (await isOpen()) { bad.push('stays open after Tab leaves it'); } else { ok.push('Tab out closes'); }
    await open1();
    const pt = await page.evaluate(() => { const d = document.querySelector('[data-module="header"] [data-drop]').getBoundingClientRect(); return d.bottom < innerHeight - 20 ? [Math.round(innerWidth / 2), Math.round(d.bottom + 10)] : [Math.max(5, Math.round(d.left - 10)), Math.round(innerHeight - 10)]; });
    await page.mouse.click(pt[0], pt[1]); await page.waitForTimeout(250);
    if (await isOpen()) { bad.push('stays open after a click outside it at ' + pt.join(',')); } else { ok.push('click outside closes'); }
    await open1();
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.move(720, 700); await page.mouse.wheel(0, 700); await page.waitForTimeout(500);
    const y1 = await page.evaluate(() => scrollY);
    if (y1 <= y0) { bad.push('page does not scroll while it is open'); } else { ok.push('page still scrolls'); }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(', ') };
  });
  await claim('hdr-keyboard-tucked', async () => {
    const { page } = await open(DESK);
    await page.mouse.move(700, 450);
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); }     // reading down: the bar tucks away
    await page.waitForTimeout(600);
    const before = await page.evaluate(() => ({ y: Math.round(scrollY), tuck: document.querySelector('[data-module="header"]').hasAttribute('data-tuck') }));
    if (!before.tuck) { return { broken: false, detail: 'the bar did not tuck while reading down: nothing to test' }; }
    await blur(page);
    await page.keyboard.press('Tab'); await page.waitForTimeout(400);
    const after = await page.evaluate(() => { const h = document.querySelector('[data-module="header"]'); return { y: Math.round(scrollY), tuck: h.hasAttribute('data-tuck'), inHeader: h.contains(document.activeElement), top: Math.round(h.getBoundingClientRect().top) }; });
    const jump = before.y - after.y, broken = after.inHeader && jump > 40;
    return { broken, detail: broken ? '(low) the keyboard reaching the tucked bar scrolls the page up ' + jump + 'px (' + before.y + ' to ' + after.y + '): the browser scrolls to the bar before it untucks, so what the visitor was reading moves away'
      : 'Tab into the tucked bar: page moved ' + jump + 'px, bar ' + (after.tuck ? 'still tucked' : 'back') + ', focus in it ' + after.inHeader };
  });
  await claim('hdr-no3d-phone', async () => {
    // the 3D P slot's fallback: with no WebGL the flat name stands in for the P at every width
    const { page } = await open(PHONE);
    const r = await page.evaluate(() => {
      const h = document.querySelector('[data-module="header"]'), n = h.querySelector('.pep-header-name'), m = h.querySelector('[data-menu-key]');
      if (!n || !m) { return null; }
      const a = n.getBoundingClientRect(), b = m.getBoundingClientRect();
      return { off: h.getAttribute('data-3d') === 'off', shown: !!n.getClientRects().length && getComputedStyle(n).display !== 'none', overlap: Math.round(Math.min(a.right, b.right) - Math.max(a.left, b.left)), nameRight: Math.round(a.right), menuLeft: Math.round(b.left) };
    });
    if (!r) { throw new Error('no header name or MENU key'); }
    if (!r.off) { return { broken: false, detail: '3D is on in this run (RT_3D): the no-WebGL fallback was not exercised' }; }
    const broken = r.shown && r.overlap > 2;
    return { broken, detail: broken ? '(low) no WebGL at 390 px: the flat PEPTICITY name that stands in for the 3D P runs ' + r.overlap + 'px under the MENU key (name ends at ' + r.nameRight + 'px, MENU starts at ' + r.menuLeft + 'px)' : 'no-WebGL name fits beside MENU (overlap ' + r.overlap + 'px)' };
  });
  await claim('hdr-menu-phone', async () => {
    const { page } = await open(PHONE);
    const isOpen = () => page.evaluate(() => document.querySelector('[data-module="header"]').hasAttribute('data-menu-open'));
    const bad = [], ok = [];
    await page.locator('[data-menu-key]').click(); await page.waitForTimeout(150);
    if (!(await isOpen())) { throw new Error('MENU did not open'); }
    await page.keyboard.press('Escape'); await page.waitForTimeout(150);
    const fb = await page.evaluate(() => document.activeElement === document.querySelector('[data-menu-key]'));
    if (await isOpen() || !fb) { bad.push('Escape: ' + ((await isOpen()) ? 'stays open' : 'focus not back on MENU')); } else { ok.push('Escape closes, focus on MENU'); }
    await page.locator('[data-menu-key]').click(); await page.waitForTimeout(150);
    let out = false;
    for (let i = 0; i < 20 && !out; i++) { await page.keyboard.press('Tab'); out = await page.evaluate(() => { const a = document.activeElement; return !document.querySelector('#pep-header-keys').contains(a) && a !== document.querySelector('[data-menu-key]'); }); }
    if (await isOpen()) { bad.push('stays open after Tab leaves the panel'); } else { ok.push('Tab out closes'); }
    await page.locator('[data-menu-key]').click(); await page.waitForTimeout(150);
    await page.keyboard.press('Shift+Tab'); await page.keyboard.press('Shift+Tab'); await page.waitForTimeout(100);
    const stillOpen = await isOpen();
    const where = await page.evaluate(() => { const a = document.activeElement; return a && a !== document.body ? (a.closest('[data-module]') || a).getAttribute('data-module') || a.tagName : 'body'; });
    ok.push('Shift+Tab out: ' + (stillOpen ? 'panel stays open, focus in ' + where : 'closes'));
    await page.mouse.click(195, 760); await page.waitForTimeout(250);
    if (await isOpen()) { bad.push('stays open after a tap outside'); } else { ok.push('tap outside closes'); }
    await page.locator('[data-menu-key]').click(); await page.waitForTimeout(150);
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.move(195, 700); await page.mouse.wheel(0, 600); await page.waitForTimeout(500);
    const y1 = await page.evaluate(() => scrollY);
    if (y1 <= y0) { bad.push('page cannot scroll while the panel is open'); } else { ok.push('page scrolls while open'); }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(', ') };
  });
  await claim('guide-window', async () => {
    const bad = [], ok = [];
    for (const vp of [DESK, PHONE]) {
      const { page } = await open(vp);
      const tag = vp === PHONE ? 'phone ' : '';
      await openGuide(page);
      const inside = await page.evaluate(() => document.querySelector('[data-module="guide"] [data-panel]').contains(document.activeElement));
      let leaks = 0;
      for (let i = 0; i < 14; i++) { await page.keyboard.press('Tab'); if (!(await page.evaluate(() => document.querySelector('[data-module="guide"] [data-panel]').contains(document.activeElement)))) { leaks++; } }
      await page.keyboard.press('Escape'); await page.waitForTimeout(300);
      const closed = await page.evaluate(() => !document.querySelector('[data-module="guide"]').hasAttribute('data-open'));
      const onLaunch = await page.evaluate(() => document.activeElement === document.querySelector('[data-module="guide"] [data-launch]'));
      if (!inside || !closed || !onLaunch) { bad.push(tag + 'open/Escape: focus inside ' + inside + ', closed ' + closed + ', focus back ' + onLaunch); } else { ok.push(tag + 'opens with focus inside, Tab stays in the modal window (' + leaks + ' leaks), Escape closes to the launcher'); }
      await openGuide(page);
      await page.locator('[data-module="guide"] [data-close]').first().click(); await page.waitForTimeout(300);
      if (await page.evaluate(() => document.querySelector('[data-module="guide"]').hasAttribute('data-open'))) { bad.push(tag + 'CLOSE button does not close'); }
      await openGuide(page);
      await page.evaluate(() => PEP.emit('cart:open', {})); await page.waitForTimeout(500);
      const gone = await page.evaluate(() => !document.querySelector('[data-module="guide"]').hasAttribute('data-open'));
      await page.keyboard.press('Escape'); await page.waitForTimeout(800);
      const launcher = await vis(page, '[data-module="guide"] [data-launch]');
      if (!gone || !launcher) { bad.push(tag + 'cart over guide: guide closed ' + gone + ', launcher back ' + launcher); }
      const y0 = await page.evaluate(() => scrollY);
      await page.mouse.move(vp.width / 2, vp.height / 2); await page.mouse.wheel(0, 500); await page.waitForTimeout(500);
      if ((await page.evaluate(() => scrollY)) <= y0) { bad.push(tag + 'page does not scroll after the guide closed'); }
      await closeAll();
    }
    return { broken: bad.length > 0, detail: (bad.length ? bad : ok).join(' | ') };
  });
  await claim('lineup-skip', async () => {
    const { page } = await open(DESK);
    const top = await page.evaluate(() => { const l = document.querySelector('[data-module="lineup"]'); return l && !l.hidden ? l.getBoundingClientRect().top + scrollY : -1; });
    if (top < 0) { return { broken: false, detail: 'THE LINEUP is not on this build (names closed): nothing to skip' }; }
    await scrollTo(page, top + 4); await page.waitForTimeout(700);
    const skip = page.locator('[data-module="lineup"] [data-skip]').first();
    await skip.focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(1300);
    const r = await page.evaluate(() => { const a = document.querySelector('#lineup-all'); const h = a.getBoundingClientRect(); return { top: Math.round(h.top), focus: !!(document.activeElement && a.contains(document.activeElement)), items: a.querySelectorAll('[data-all-grid] > li').length }; });
    const y0 = await page.evaluate(() => scrollY);
    await page.mouse.move(720, 600); await page.mouse.wheel(0, 900); await page.waitForTimeout(600);
    const y1 = await page.evaluate(() => scrollY);
    const okLand = Math.abs(r.top) < 200 && r.focus, moves = y1 > y0;
    return { broken: !okLand || !moves, detail: 'SKIP by keyboard lands on THE WHOLE LINEUP (' + r.items + ' items, top ' + r.top + 'px, focus there ' + r.focus + '); page then ' + (moves ? 'scrolls on' : 'is STUCK') };
  });
}

async function groupFlags() {
  const named = CATALOGUE.products.filter((p) => FLAGGED.indexOf(p.sku) >= 0);
  await claim('flag-header-dropdown', async () => {
    const res = { listed: [], untagged: [] };
    for (const vp of [DESK, PHONE]) {
      const { page } = await open(vp);
      if (vp === PHONE) { await page.locator('[data-menu-key]').click(); await page.waitForTimeout(150); }
      await page.locator('[data-key="peptides"]').click(); await page.waitForTimeout(250);
      const r = await page.evaluate((fl) => fl.map((s) => {
        const a = document.querySelector('[data-module="header"] a[data-sku="' + s + '"]');
        if (!a) { return { s, listed: false }; }
        const li = a.closest('li'), txt = (li.innerText || '') + ' ' + (a.getAttribute('aria-label') || '');
        return { s, listed: true, name: a.textContent, tagged: /HIDE BEFORE LAUNCH/i.test(txt) };
      }), FLAGGED);
      r.forEach((x) => { if (x.listed) { res.listed.push(x.s); if (!x.tagged) { res.untagged.push((vp === PHONE ? 'phone:' : '') + x.name); } } });
      await closeAll();
    }
    return { broken: res.untagged.length > 0, detail: res.untagged.length ? 'flagged products listed in the PEPTIDES drop-down with no HIDE BEFORE LAUNCH tag: ' + res.untagged.filter((n) => n.indexOf('phone:') < 0).join(', ') + ' (same in the phone MENU)' : 'every flagged product in the drop-down carries the tag (' + res.listed.length + ')' };
  });
  await claim('flag-guide', async () => {
    const { page } = await open(DESK);
    await openGuide(page);
    const bad = [], seen = [];
    for (const p of named) {
      if (p.name.indexOf('[') >= 0) { continue; }            // a bracketed placeholder name cannot be named in the guide
      await ask(page, p.name + ' price');
      const a = await lastGuide(page);
      if (a.toUpperCase().indexOf(p.name.toUpperCase()) < 0) { bad.push(p.name + ': not answered by name'); continue; }
      seen.push(p.name);
      if (!/HIDE BEFORE LAUNCH/.test(a)) { bad.push(p.name + ': no HIDE BEFORE LAUNCH'); }
      (p.sizes || []).forEach((s) => { if (typeof s.priceCAD === 'number' && s.priceCAD > 0 && a.indexOf('$' + s.priceCAD.toFixed(2)) < 0) { bad.push(p.name + ' ' + s.label + ': price ' + s.priceCAD + ' not shown'); } });
    }
    await ask(page, 'BPC-157 price');
    const ctl = await lastGuide(page);
    if (/HIDE BEFORE LAUNCH/.test(ctl)) { bad.push('an unflagged product (BPC-157) is tagged'); }
    return { broken: bad.length > 0, detail: bad.length ? bad.slice(0, 4).join('; ') : seen.length + ' flagged products asked by name: each answer tagged HIDE BEFORE LAUNCH with catalogue prices; BPC-157 untagged' };
  });
  await claim('flag-lineup', async () => {
    const { page } = await open(DESK);
    const r = await page.evaluate((fl) => {
      const on = (el) => !el.hidden && getComputedStyle(el).display !== 'none';
      const rows = [];
      document.querySelectorAll('[data-module="lineup"] [data-rail] > li[data-sku], [data-module="lineup"] [data-all-grid] > li[data-sku]').forEach((li) => {
        const sku = li.getAttribute('data-sku'), wm = [].slice.call(li.querySelectorAll('[data-wm]'));
        const casePrice = li.querySelector('[data-b-price]');
        rows.push({ sku, where: li.closest('[data-all-grid]') ? 'list' : 'case', f: fl.indexOf(sku) >= 0, on: wm.filter(on).length, n: wm.length,
          price: (li.querySelector('[data-i-lo]') || {}).textContent || (casePrice && !casePrice.hidden ? casePrice.textContent : '') });
      });
      return rows;
    }, FLAGGED);
    if (!r.length) { return { broken: false, detail: 'THE LINEUP is not on this build' }; }
    const bad = [];
    r.forEach((x) => { if (x.f && x.on < x.n) { bad.push(x.sku + ' ' + x.where + ': band hidden'); } if (!x.f && x.on) { bad.push(x.sku + ' ' + x.where + ': tagged but not flagged'); } });
    r.filter((x) => x.price).forEach((x) => {
      // the list shows the lowest price; the case shows its first priced size (the catalogue order): both from the catalogue
      const p = CATALOGUE.products.find((c) => c.sku === x.sku), priced = (p.sizes || []).map((s) => s.priceCAD).filter((v) => typeof v === 'number' && v > 0);
      const want = x.where === 'list' ? Math.min.apply(null, priced) : priced[0];
      if (Number(x.price.replace(/[^0-9.]/g, '')) !== want) { bad.push(x.sku + ' ' + x.where + ' price ' + x.price + ' (catalogue ' + want + ')'); }
    });
    const nf = r.filter((x) => x.f).length;
    return { broken: bad.length > 0, detail: bad.length ? bad.slice(0, 4).join('; ') : nf + ' flagged rows (cases and THE WHOLE LINEUP list) show the band, unflagged rows do not, case and list prices = catalogue' };
  });
  await claim('flag-finder', async () => {
    const { page } = await open(DESK);
    if (!(await vis(page, '[data-hooks="finder"] [data-finder]'))) { return { broken: false, detail: 'the finder is closed on this build (names closed)' }; }
    const picks = [];
    const tiles = () => page.locator('[data-hooks="finder"] [data-tiles] button').count();
    const result = () => vis(page, '[data-hooks="finder"] [data-result]');
    const reset = async () => { if (await result()) { await page.locator('[data-hooks="finder"] [data-again]').click(); } while (await vis(page, '[data-hooks="finder"] [data-back]')) { await page.locator('[data-hooks="finder"] [data-back]').click(); } await page.waitForTimeout(40); };
    const tap = async (i) => { await page.locator('[data-hooks="finder"] [data-tiles] button').nth(i).click(); await page.waitForTimeout(40); };
    const read = async () => page.evaluate(() => [].slice.call(document.querySelectorAll('[data-hooks="finder"] [data-picks] li')).map((li) => ({ name: li.querySelector('.pep-hooks-pick-name').textContent, size: li.querySelector('.pep-hooks-pick-size').textContent, price: li.querySelector('.pep-hooks-pick-price').textContent })));
    const walk = async (path) => {
      await reset();
      for (const i of path) { await tap(i); }
      if (await result()) { picks.push(...await read()); return; }
      const n = await tiles();
      for (let i = 0; i < n; i++) { await walk(path.concat(i)); }
    };
    await walk([]);
    const skip = (/finderSkip\s*:\s*\[([^\]]*)\]/.exec(HTML) || [])[1] || '';
    const bad = [];
    picks.forEach((k) => {
      const p = CATALOGUE.products.find((c) => c.name === k.name);
      if (!p) { bad.push('unknown pick ' + k.name); return; }
      if (FLAGGED.indexOf(p.sku) >= 0) { bad.push('flagged ' + p.name + ' offered with no tag'); }
      if (skip.indexOf("'" + p.sku + "'") >= 0) { bad.push('finderSkip ' + p.name + ' offered'); }
      const s = (p.sizes || []).find((z) => z.label === k.size);
      if (!s || Number(k.price.replace(/[^0-9.]/g, '')) !== s.priceCAD) { bad.push(p.name + ' ' + k.size + ' at ' + k.price + ' (catalogue ' + (s && s.priceCAD) + ')'); }
    });
    const names = Array.from(new Set(picks.map((k) => k.name)));
    return { broken: bad.length > 0, detail: bad.length ? bad.slice(0, 4).join('; ') : 'every 3-tap path walked: ' + names.length + ' distinct picks, none flagged or skipped, every price = catalogue' };
  });
  await claim('flag-shelf-relist', async () => {
    const { page } = await open(DESK, { html: (h) => h.replace('data-module="shelf" id="shelf" aria-label="THE SHELF" data-relist="off"', 'data-module="shelf" id="shelf" aria-label="THE SHELF" data-relist="on"') });
    const rows = await page.evaluate(() => [].slice.call(document.querySelectorAll('[data-module="shelf"] [data-list] > li')).map((li) => ({ name: li.querySelector('[data-slat-name]').textContent.replace(/\s+/g, ' ').trim(), wm: !!(li.querySelector('[data-slat-wm]') && !li.querySelector('[data-slat-wm]').hidden) })));
    if (!rows.length) { return { broken: false, detail: 'the shelf list is not built on this build (it only runs for the capture tool)' }; }
    const bad = [];
    CATALOGUE.products.forEach((p) => { const r = rows.find((x) => x.name === p.name.toUpperCase()); if (!r) { return; } const f = FLAGGED.indexOf(p.sku) >= 0; if (f !== r.wm) { bad.push(p.name + (f ? ' untagged' : ' tagged')); } });
    return { broken: bad.length > 0, detail: bad.length ? bad.join(', ') : 'relist mode (capture tool only): every flagged slat tagged, others not' };
  });
}

/* ------------------------------------------------ main ------------------------------------------------ */
(async () => {
  await new Promise((res, rej) => { server.on('error', rej); server.listen(PORT, '127.0.0.1', res); });
  browser = await chromium.launch(process.env.RT_3D ? { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] } : {});
  const groups = { injection: groupInjection, consent: groupConsent, gates: groupGates, share: groupShare, exit: groupExit, bar: groupBar, states: groupStates, flags: groupFlags };
  for (const g of Object.keys(groups)) { if (!ONLY || ONLY.test(g)) { await groups[g](); } }
  await browser.close();
  server.close();
  const broken = lines.filter((l) => l.indexOf('BROKEN') === 0).length;
  console.log('-- ' + lines.length + ' claims, ' + broken + ' BROKEN');
})().catch((e) => { console.error(e); process.exit(1); });

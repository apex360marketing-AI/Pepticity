const { chromium, devices } = require('playwright');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
(async () => {
  const b = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) {} });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
  await p.goto(URL_, { waitUntil: 'load' });
  await p.waitForFunction(() => window.PEP && document.readyState === 'complete', null, { timeout: 120000 });
  const info = await p.evaluate(() => {
    const out = {};
    out.config = JSON.parse(JSON.stringify(window.PEP_CONFIG || {}));
    out.pepKeys = Object.keys(window.PEP || {});
    out.modules = [...document.querySelectorAll('[data-module]')].map((e) => { const r = e.getBoundingClientRect(); return e.getAttribute('data-module') + ' #' + (e.id || '') + ' <' + e.tagName.toLowerCase() + '> top=' + Math.round(r.top + scrollY) + ' h=' + Math.round(r.height) + ' pos=' + getComputedStyle(e).position; });
    out.docH = document.documentElement.scrollHeight;
    out.sections = [...document.querySelectorAll('main > *, body > section, body > main, body > header, body > footer, body > div, body > dialog, body > aside, body > nav')].map((e) => { const r = e.getBoundingClientRect(); return '<' + e.tagName.toLowerCase() + '> #' + (e.id || '') + ' .' + String(e.className).slice(0, 60) + ' top=' + Math.round(r.top + scrollY) + ' h=' + Math.round(r.height) + ' pos=' + getComputedStyle(e).position + ' disp=' + getComputedStyle(e).display; });
    out.forms = [...document.querySelectorAll('form')].map((f) => (f.id || '') + ' .' + String(f.className).slice(0, 50) + ' hook=' + (f.closest('[data-hook]') ? f.closest('[data-hook]').getAttribute('data-hook') : '') + ' action=' + f.getAttribute('action') + ' inputs=' + [...f.querySelectorAll('input,select,textarea')].map((i) => i.type + ':' + i.name).join(','));
    out.dialogs = [...document.querySelectorAll('dialog,[role=dialog]')].map((d) => d.tagName + '#' + d.id + '.' + String(d.className).slice(0, 40));
    out.ids = [...document.querySelectorAll('[id]')].length;
    out.counts = { a: document.querySelectorAll('a[href]').length, button: document.querySelectorAll('button').length, roleButton: document.querySelectorAll('[role=button]').length, input: document.querySelectorAll('input,select,textarea').length, k25: document.querySelectorAll('.pep-k25').length };
    return out;
  });
  console.log(JSON.stringify(info, null, 1));
  console.log('errs', errs);
  await b.close();
})().catch((e) => { console.log('ERR', e.message); process.exit(1); });

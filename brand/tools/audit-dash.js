// Interactive audit for sites/dashboard: clicks every button on every tab (both sides), opens and closes every sheet,
// tries bad and good form input, an HTML-injection message, keyboard focus and reduced motion.
// node brand/tools/audit-dash.js   -> sites/dashboard/shots/audit-*.png + audit-report.json
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..', '..');
const THREE_DIR = process.env.THREE_DIR || '/tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/npm/node_modules/three';
const OUT = path.join(ROOT, 'sites/dashboard/shots');
const R = { errors: [], dead: [], clicked: 0, sheets: [], forms: [], xss: null, focus: [], reduced: null };

async function open(browser, opts) {
  const ctx = await browser.newContext(opts); const page = await ctx.newPage();
  page.on('pageerror', e => R.errors.push((opts.tag || '') + ' pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') R.errors.push((opts.tag || '') + ' console: ' + m.text()); });
  page.on('dialog', d => d.dismiss());
  await page.route('https://cdn.jsdelivr.net/npm/three@0.160.0/**', r => r.fulfill({ path: path.join(THREE_DIR, r.request().url().split('three@0.160.0/')[1]), contentType: 'application/javascript' }));
  await page.route('https://fonts.googleapis.com/**', r => r.fulfill({ body: '', contentType: 'text/css' }));
  await page.route('https://fonts.gstatic.com/**', r => r.fulfill({ status: 204, body: '' }));
  await page.goto('file://' + path.join(ROOT, 'sites/dashboard/index.html') + '#owner');
  await page.evaluate(() => { try { localStorage.clear(); } catch (e) {} }); await page.reload();
  await page.waitForTimeout(2500);
  return { ctx, page };
}
const sig = page => page.evaluate(() => {
  const v = document.querySelector('.view.on'), sh = document.getElementById('sheet'), t = document.getElementById('toast');
  let h = 0; const str = v.innerHTML + '|' + (sh.hidden ? '' : sh.innerHTML) + '|' + t.className + t.textContent + '|' + location.hash + document.activeElement.outerHTML.slice(0, 80) + (document.querySelector('.pc-btn[data-s]') ? 'morph' : '') + JSON.stringify(window.__pep.S);
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0; return h;
});

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  for (const vp of [{ w: 1440, h: 900, n: 'desk' }, { w: 390, h: 844, n: 'phone' }]) {
    const { ctx, page } = await open(browser, { viewport: { width: vp.w, height: vp.h }, deviceScaleFactor: 1, hasTouch: vp.n === 'phone', tag: vp.n });
    for (const side of ['owner', 'client']) {
      await page.evaluate(v => window.__pep.setView(v), side); await page.waitForTimeout(300);
      const tabs = await page.$$eval(`.tabs[data-group="${side}"] .tab`, ts => ts.map(t => t.dataset.tab));
      for (const id of tabs) {
        await page.evaluate(([g, t]) => window.__pep.setTab(g, t), [side, id]); await page.waitForTimeout(500);
        const n = await page.$$eval(`#p-${id} button`, bs => bs.length);
        for (let i = 0; i < n; i++) {
          const b = (await page.$$(`#p-${id} button`))[i]; if (!b) continue;
          if (!(await b.isVisible())) continue;
          const label = ((await b.textContent()) || (await b.getAttribute('aria-label')) || '').trim().slice(0, 40);
          if (/DELETE|REQUEST DELETION/.test(label)) { /* opens a confirm sheet; still clicked below */ }
          const before = await sig(page);
          try { await b.scrollIntoViewIfNeeded(); await b.click({ timeout: 3000 }); } catch (e) { R.dead.push(`${vp.n}/${side}/${id}: "${label}" not clickable (${e.message.split('\n')[0]})`); continue; }
          R.clicked++;
          await page.waitForTimeout(450);
          const opened = await page.evaluate(() => !document.getElementById('sheet').hidden);
          if (opened) {
            const t = await page.textContent('#sheetT');
            if (!R.sheets.includes(t)) { R.sheets.push(t); await page.screenshot({ path: path.join(OUT, `audit-${vp.n}-sheet-${R.sheets.length}.png`) }); }
            await page.keyboard.press('Escape'); await page.waitForTimeout(200);
            if (await page.evaluate(() => !document.getElementById('sheet').hidden)) R.dead.push(`${vp.n}: sheet "${t}" did not close on Escape`);
            continue;
          }
          const after = await sig(page);
          if (after === before) R.dead.push(`${vp.n}/${side}/${id}: "${label}" changed nothing`);
          await page.waitForTimeout(150);
        }
      }
    }
    if (vp.n === 'desk') {
      // forms: bad input first, then good input
      await page.evaluate(() => { window.__pep.setView('owner'); window.__pep.setTab('owner', 'money'); }); await page.waitForTimeout(400);
      await page.fill('#eVendor', 'Canada Post'); await page.fill('#eAmt', '12abc'); await page.click('#expBtn');
      R.forms.push('expense bad amount -> ' + await page.textContent('#expErr'));
      await page.fill('#eAmt', '42.50'); await page.fill('#eTax', '99'); await page.click('#expBtn');
      R.forms.push('expense tax > amount -> ' + await page.textContent('#expErr'));
      await page.fill('#eTax', '5.53'); await page.fill('#eVendor', '<img src=x onerror="window.__xss=1">'); await page.click('#expBtn'); await page.waitForTimeout(2200);
      R.forms.push('expense good -> toast: ' + await page.textContent('#toast span'));
      await page.click('.qa[data-act="product"]'); await page.waitForTimeout(300);
      await page.click('#apForm button[type="submit"]'); R.forms.push('add product empty -> ' + await page.textContent('#apErr'));
      await page.fill('#apName', 'Test peptide'); await page.fill('#apPrice', '95'); await page.fill('#apOn', '2.5'); await page.click('#apForm button[type="submit"]');
      R.forms.push('add product 2.5 units -> ' + await page.textContent('#apErr'));
      await page.keyboard.press('Escape');
      await page.click('.qa[data-act="receive"]'); await page.waitForTimeout(300);
      await page.fill('#rsU', '-3'); await page.click('#rsForm button[type="submit"]'); R.forms.push('receive -3 -> ' + await page.textContent('#rsErr'));
      await page.keyboard.press('Escape');
      // injection through a message
      await page.evaluate(() => window.__pep.setTab('owner', 'omsg')); await page.waitForTimeout(300);
      await page.fill('#ownerInput', '<img src=x onerror="window.__xss=2"><b>bold?</b>'); await page.press('#ownerInput', 'Enter'); await page.waitForTimeout(600);
      R.xss = await page.evaluate(() => ({ fired: window.__xss || 0, imgs: document.querySelectorAll('#ownerMsgs img').length, shownAsText: /&lt;img|<img/.test(document.querySelector('#ownerMsgs').textContent) }));
      await page.screenshot({ path: path.join(OUT, 'audit-desk-xss-message.png') });
      // keyboard: tab through the top of the page
      await page.evaluate(() => { scrollTo(0, 0); document.activeElement && document.activeElement.blur(); });
      for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); R.focus.push(await page.evaluate(() => { const a = document.activeElement; const cs = getComputedStyle(a); const af = getComputedStyle(a, '::after');
        return (a.textContent || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 22) + ' ring:' + (cs.outlineStyle !== 'none' || af.opacity === '1'); })); }
      await page.screenshot({ path: path.join(OUT, 'audit-desk-keyboard-focus.png') });
    }
    await ctx.close();
  }
  // reduced motion
  const { ctx, page } = await open(browser, { viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce', tag: 'reduced' });
  R.reduced = await page.evaluate(() => ({ t3d: document.documentElement.classList.contains('t3d'), p3d: document.documentElement.classList.contains('p3d'), smokeFrames: window.__pepSmoke ? window.__pepSmoke.frames : null }));
  await page.screenshot({ path: path.join(OUT, 'audit-desk-reduced-motion.png') });
  await ctx.close(); await browser.close();
  fs.writeFileSync(path.join(OUT, 'audit-report.json'), JSON.stringify(R, null, 1));
  console.log(JSON.stringify(R, null, 1));
})();

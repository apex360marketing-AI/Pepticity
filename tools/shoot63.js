// V6.3 test: intro on every load, five pages, menu, quiz branches, every link. node tools/shoot63.js d|m
const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process'); const fs = require('fs');
const cache = {}; function get(u) { if (!cache[u]) cache[u] = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/141.0', u], { maxBuffer: 1e8 }); return cache[u]; }
const OUT = '/home/user/pepticity/sites/v6-garnet/shots63/'; const mode = process.argv[2] || 'd';
const URL = 'http://127.0.0.1:8765/home/user/pepticity/sites/v6-garnet/dist/preview.html';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--autoplay-policy=no-user-gesture-required'] });
  const mob = mode === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 200))); p.on('console', m => { if (m.type() === 'error') errs.push('CE ' + m.text().slice(0, 200)); });
  await p.route('**/*', r => { const u = r.request().url(); if (/^(http:\/\/127|data:|blob:)/.test(u)) return r.continue(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return r.fulfill({ body: get(u), contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' }); return r.abort(); });
  const shot = n => p.screenshot({ path: OUT + mode + '-' + n + '.png' });
  const log = (...a) => console.log(mode, ...a);
  await p.goto(URL); await p.waitForTimeout(3000); await shot('intro1');
  log('intro first load', await p.evaluate(() => document.documentElement.className));
  await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await p.reload(); await p.waitForTimeout(2500); await shot('intro-reload');
  log('intro after reload', await p.evaluate(() => ({ cls: document.documentElement.className, hidden: document.getElementById('intro').hidden })));
  await p.click('.intro-skip'); await p.waitForTimeout(1200); await shot('home');
  // fork section
  await p.evaluate(() => document.querySelector('#path').scrollIntoView()); await p.waitForTimeout(1400);
  if (!mob) { await p.mouse.move(500, 500); await p.waitForTimeout(500); } await shot('fork');
  await p.evaluate(() => document.querySelector('.index').scrollIntoView()); await p.waitForTimeout(1200);
  if (!mob) { const r = await p.locator('.idx a').nth(1).boundingBox(); await p.mouse.move(r.x + r.width * .5, r.y + r.height / 2, { steps: 8 }); await p.waitForTimeout(900); } await shot('index');
  // menu
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.click('.menu-btn'); await p.waitForTimeout(1300);
  if (!mob) await p.hover('#curtain [data-nav="science"]'); await p.waitForTimeout(800); await shot('menu');
  log('menu focus', await p.evaluate(() => document.activeElement.textContent.trim().slice(0, 30)), 'inert main', await p.evaluate(() => document.querySelector('main').inert));
  await p.keyboard.press('Escape'); await p.waitForTimeout(900);
  log('menu closed', await p.evaluate(() => ({ exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'), inert: document.querySelector('main').inert })));
  // each page via its link
  for (const v of ['how', 'science', 'shop', 'faq']) {
    if (mob) { await p.click('.menu-btn'); await p.waitForTimeout(1000); await p.click('#curtain [data-nav="' + v + '"]'); }
    else await p.click('.top-nav [data-nav="' + v + '"]');
    await p.waitForTimeout(1800);
    const st = await p.evaluate(() => ({ view: document.documentElement.getAttribute('data-page'), hash: location.hash, y: scrollY, title: document.title, vis: [...document.querySelectorAll('[data-view]')].filter(v => !v.hidden).map(v => v.dataset.view) }));
    log('page', v, JSON.stringify(st)); await shot('page-' + v);
    if (v === 'how') { const A = await p.evaluate(() => { const a = document.querySelector('.anat'); return { top: a.getBoundingClientRect().top + scrollY, h: a.offsetHeight }; }); await p.evaluate(y => scrollTo(0, y), Math.round(A.top + (mob ? 0 : .5 * (A.h - vp.height)))); await p.waitForTimeout(mob ? 3000 : 1500); await shot('how-anat'); }
    if (v === 'science') { await p.fill('#lot-in', 'PX-2611-A'); await p.click('.lot-form button[type=submit]'); await p.waitForTimeout(500); await p.evaluate(() => document.querySelector('#ledger').scrollIntoView()); await p.waitForTimeout(900); await shot('sci-lot'); log('lot', await p.evaluate(() => document.querySelector('.lot-out').innerText.slice(0, 40))); }
    const np = await p.evaluate(() => { const a = document.querySelector('[data-view]:not([hidden]) .next-pg'); a.scrollIntoView(); return a.getAttribute('href'); }); await p.waitForTimeout(900);
    if (v === 'faq') await shot('next-pg');
  }
  // next page link + same-page link
  await p.click('[data-view="faq"] .next-pg'); await p.waitForTimeout(1800); log('next from faq ->', await p.evaluate(() => location.hash + ' ' + document.documentElement.getAttribute('data-page')));
  // hero lot link crosses to science and scrolls to the ledger
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(400);
  await p.click('.hero [data-scroll="#ledger"]'); await p.waitForTimeout(2800);
  log('lot link', await p.evaluate(() => ({ page: document.documentElement.getAttribute('data-page'), ledgerTop: Math.round(document.querySelector('#ledger').getBoundingClientRect().top) })));
  // deep link direct load
  await p.goto(URL + '#flags'); await p.keyboard.press('Escape'); await p.waitForTimeout(2200);
  log('deep #flags', await p.evaluate(() => ({ page: document.documentElement.getAttribute('data-page'), top: Math.round(document.querySelector('#flags').getBoundingClientRect().top) })));
  // back button
  await p.goto(URL + '#shop'); await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await p.evaluate(() => { location.hash = 'faq'; }); await p.waitForTimeout(1800); await p.goBack(); await p.waitForTimeout(1800);
  log('back ->', await p.evaluate(() => document.documentElement.getAttribute('data-page')));
  // QUIZ: fitness path with zero workouts
  await p.goto(URL); await p.keyboard.press('Escape'); await p.waitForTimeout(800);
  await p.evaluate(() => { try { localStorage.removeItem('pep-quiz-v2'); } catch (e) {} });
  await p.evaluate(() => document.querySelector('#path').scrollIntoView()); await p.waitForTimeout(600);
  await p.click('.fork-c[data-quiz="fitness"]'); await p.waitForTimeout(700); await shot('q1-activity');
  const qstate = () => p.evaluate(() => ({ step: document.querySelector('.pq-step').textContent, q: (document.querySelector('.pq-q') || {}).textContent, lead: (document.querySelector('.pq-lead') || {}).textContent, focus: document.activeElement.className, trail: [...document.querySelectorAll('.pq-crumb')].map(c => c.textContent) }));
  log('Q', JSON.stringify(await qstate()));
  const pick = async t => { await p.click('.pq-opt:has-text("' + t + '")'); await p.waitForTimeout(800); log('Q', JSON.stringify(await qstate())); };
  await pick("I don't work out right now"); await shot('q2');
  await pick('Getting started'); await shot('q3-age');
  await pick('75 or over'); await pick('Yes'); await shot('q5');
  // change an earlier answer via the trail
  await p.click('.pq-crumb >> nth=1'); await p.waitForTimeout(700); log('trail edit', JSON.stringify(await qstate()));
  await pick('3 to 4 days'); await pick('Recovering well'); await pick('75 or over'); await pick('No'); await pick('A video visit'); await shot('q-result');
  await p.evaluate(() => document.querySelector('.pq-btn[type=submit]').scrollIntoView()); await shot('q-result2');
  await p.click('.pq-btn[type=submit]'); await p.waitForTimeout(300); log('empty email', await p.evaluate(() => document.querySelector('.pq-err').textContent));
  await p.fill('.pq-input', 'test@example.com'); await p.click('.pq-btn[type=submit]'); await p.waitForTimeout(700); await shot('q-done'); log('done', await p.evaluate(() => document.querySelector('.pq-body').innerText.slice(0, 160)));
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  // health path + resume
  await p.click('.fork-c[data-quiz="health"]'); await p.waitForTimeout(700); log('health Q', JSON.stringify(await qstate()));
  await pick("Women's health"); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('.hero [data-quiz]'); await p.waitForTimeout(700); log('resume', JSON.stringify(await qstate())); await shot('q-resume');
  await pick('Resume'); await pick('Under 18'); await shot('q-stop'); await p.keyboard.press('Escape');
  // banned words in quiz copy
  const banned = await p.evaluate(() => { const t = JSON.stringify(window.PEP.Q); return ['diagnos', 'deficien', 'symptom', 'suggests', 'candidate', 'dose', ' mg', 'risk score', 'heal', 'boost', 'cure'].filter(w => t.toLowerCase().includes(w)); });
  log('banned words', banned);
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  log('errs', errs, 'overflow', ov);
  await ctx.close(); await b.close();
})();

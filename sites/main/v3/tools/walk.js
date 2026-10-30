// PEPTICITY v3 full walk: node tools/walk.js <white|black> <d|m> [base-url]
// Landing (guide bot, no catalogue in the DOM) -> age gate (block, leave, pass) -> city cards -> doors (guest) -> lab + holograms
// -> second doors -> collection (cart, restock, checkout) -> bot SELL greeting -> rest of the product line -> reload (pass remembered).
const { chromium } = require('playwright');
const fs = require('fs');
const V = process.argv[2] || 'black', M = process.argv[3] || 'd', BASE = process.argv[4] || 'http://127.0.0.1:8811/';
const OUT = __dirname + '/../shots/'; fs.mkdirSync(OUT, { recursive: true });
const tag = (M === 'd' ? 'desk' : 'mob') + '-' + V;
const T0 = Date.now(), el = () => ((Date.now() - T0) / 1000).toFixed(0) + 's';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome',
    args: ['--autoplay-policy=no-user-gesture-required', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const mob = M === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob });
  const p = await ctx.newPage(); const errs = [], log = []; global.__log = log; global.__errs = errs;
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 300)));
  p.on('console', m => { if (m.type() === 'error') errs.push('CE ' + m.text().slice(0, 300)); });
  p.on('requestfailed', r => { const f = r.failure(); if (!/\.mp4|\.webm/.test(r.url()) && !(f && /ERR_ABORTED/.test(f.errorText))) errs.push('RF ' + r.url().slice(0, 140) + ' ' + (f && f.errorText)); });
  const reqs = []; p.on('request', r => reqs.push(r.url()));
  const shot = async n => { await p.screenshot({ path: OUT + tag + '-' + n + '.png', timeout: 180000 }); log.push('shot ' + n + ' @' + el()); };
  const sw = async n => { const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > vp.width) errs.push('SIDEWAYS ' + n + ' ' + w); };
  const to = async (y, wait = 1800) => { await p.evaluate(y => { const l = window.__pc.lenis; if (l) l.scrollTo(y, { immediate: true, force: true }); window.scrollTo(0, y); }, y); await p.waitForTimeout(wait); };
  const top = sel => p.evaluate(s => { const e = document.querySelector(s); return e.getBoundingClientRect().top + scrollY; }, sel);
  const span = sel => p.evaluate(s => document.querySelector(s).offsetHeight - innerHeight, sel);
  const H = vp.height;
  const cat = JSON.parse(fs.readFileSync(__dirname + '/../data/products.json', 'utf8'));
  const names = [...new Set(cat.products.map(x => x.name))];
  const scan = async label => { const html = (await p.content()).toUpperCase(); const hits = names.filter(n => html.includes(n.toUpperCase())); const pr = html.match(/\$\s?\d+(\.\d\d)?/g) || []; log.push(label + ': names=' + (hits.length ? hits.join('|') : 'none') + ' prices=' + (pr.length ? pr.slice(0, 4).join('|') : 'none')); return hits.length + pr.length; };

  await p.goto(BASE + 'index.html?nointro&resetage&v=' + V);
  await p.waitForTimeout(6000);
  await scan('PRE-GATE content()');
  log.push('catalogue requested pre-gate: ' + reqs.some(u => /products\.json/.test(u)));
  log.push('age-gated: ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')) + ' · cart/store buttons visible: ' + await p.isVisible('#cartBtn') + '/' + await p.isVisible('#toStore'));
  await shot('01-hero'); await sw('hero');
  /* hero letter form: consent required */
  await p.fill('.hero-form input[type=email]', 'grace-letter@example.com'); await p.click('.hero-form button[type=submit]'); await p.waitForTimeout(300);
  log.push('hero letter without box: ' + await p.textContent('.hero-form .err'));
  /* bot in GUIDE mode */
  await p.waitForFunction(() => window.PEPBOT && PEPBOT.mode, null, { timeout: 15000 }).catch(() => errs.push('bot not loaded'));
  log.push('bot mode on landing: ' + await p.evaluate(() => window.PEPBOT && PEPBOT.mode()));
  await p.evaluate(() => { PEPBOT.open(); PEPBOT.ask('how much is bpc 157'); }); await p.waitForTimeout(1800);
  log.push('guide answer: ' + (await p.evaluate(() => { const m = [...document.querySelectorAll('.pb-msg--bot')].pop(); return m ? m.textContent.slice(0, 120) : ''; })));
  log.push('guide cards/prices in bot: ' + await p.evaluate(() => document.querySelectorAll('.pb-card,.pb-list,.pb-cart').length));
  await p.evaluate(() => PEPBOT.ask('I feel like hurting myself')); await p.waitForTimeout(1500);
  log.push('emergency: ' + (await p.evaluate(() => { const m = [...document.querySelectorAll('.pb-msg--bot')].pop(); return m ? m.textContent.slice(0, 110) : ''; })));
  await shot('02-bot-guide');
  await scan('PRE-GATE content() with bot open');
  await p.evaluate(() => PEPBOT.close()); await p.waitForTimeout(500);

  await to((await top('#mission')) - 20, 2200); await shot('03-mission');
  const ST = await top('#story'), SH = await span('#story');
  if (!mob) { await to(ST + SH * 0.06, 1800); await shot('04-story-1'); await to(ST + SH * 0.52, 2000); await shot('05-story-2'); await to(ST + SH * 0.93, 2000); await shot('06-story-3'); }
  else { await to(ST + 40, 1800); await shot('04-story'); await to(ST + H * 0.9, 1800); await shot('05-story-b'); }
  /* the age gate: blocks, LEAVE keeps the visitor on the landing, then passes */
  const AT = await top('#age'); await to(AT, 2000); await shot('07-age'); await sw('age');
  await p.click('#ageYes'); await p.waitForTimeout(300); log.push('gate, no province: ' + await p.textContent('#ageForm .err'));
  log.push('still gated: ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')));
  await p.click('#ageLeave'); await p.waitForTimeout(2800);
  log.push('LEAVE -> state ' + await p.getAttribute('#agePanel', 'data-state') + ', mission top ' + Math.round(await p.evaluate(() => document.getElementById('mission').getBoundingClientRect().top)) + ', gated ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')));
  await to(AT, 1500); await p.click('#ageRetry'); await p.waitForTimeout(300);
  await p.selectOption('#ageProv', 'XX'); await p.click('#ageYes'); await p.waitForTimeout(400);
  log.push('outside Canada -> ' + await p.textContent('#ageNoT') + ' gated ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')));
  await p.click('#ageRetry'); await p.waitForTimeout(300);
  await p.selectOption('#ageProv', 'BC'); await p.click('#ageYes'); await p.waitForTimeout(5200);
  log.push('PASSED: gated ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')) + ' · pass ' + JSON.stringify(await p.evaluate(() => JSON.parse(localStorage.getItem('pc-age-pass')))) + ' · catalogue ' + await p.evaluate(() => window.__pc.catState) + ' · listed shelf ' + await p.evaluate(() => document.querySelectorAll('#shelf .prod').length));
  log.push('high-risk on shelf: ' + await p.evaluate(() => [...document.querySelectorAll('#shelf .prod h3')].map(h => h.textContent).filter(t => /HGH|MELANOTAN|BACTERIO/.test(t)).join('|') || 'none'));

  const J = await top('#journey'), JH = await span('#journey');
  await to(J + JH * 0.03, 2200); await shot('08-portal');
  log.push('bot mode in the city: ' + await p.evaluate(() => { window.__pc.syncBot(); return PEPBOT.mode(); }));
  const cards = [0.18, 0.36, 0.54, 0.70];
  for (let i = 0; i < cards.length; i++) { await to(J + JH * cards[i], 2600); await shot('09-city-card' + (i + 1)); }
  await sw('city');
  const onScreen = await p.evaluate(() => [...document.querySelectorAll('.sr')].filter(s => +s.style.opacity > 0.5).length);
  log.push('city cards on screen at once (last stop): ' + onScreen);
  if (!mob) { const r = await p.locator('.sr').nth(3).boundingBox(); if (r) { await p.mouse.move(r.x + 30, r.y + 30, { steps: 5 }); await p.waitForTimeout(700); } }
  await to(J + JH * 0.97, 3200); await shot('10-doors-gate'); await sw('gate');
  await p.click('#choGuest'); await p.waitForTimeout(4200); await shot('11-doors-open');
  await p.waitForTimeout(5500);
  log.push('doors gate open: ' + !(await p.evaluate(() => document.documentElement.classList.contains('gated'))));
  const L = await top('#lab'), LH = await span('#lab');
  for (let i = 0; i < 5; i++) { await to(L + LH * ((i + 0.62) / 5), 2800); await shot('12-lab-st' + (i + 1));
    const ho = await p.evaluate(() => window.__pc.HOLO.map(h => h.el.id + ':' + (h.on ? 'on' : 'off')).join(' ')); log.push('lab st' + (i + 1) + ' holograms ' + ho); }
  await sw('lab');
  /* hologram B form works (offer email, consent optional) */
  await to(L + LH * (4.62 / 5), 2800);
  const hb = p.locator('#holoB form:not([hidden])');
  if (await hb.count()) { await hb.locator('input').first().fill(await hb.locator('input[type=tel]').count() ? '6045551234' : 'holo@example.com'); await hb.locator('button[type=submit]').click({ force: true }); await p.waitForTimeout(1300); log.push('hologram B submit: ' + (await hb.locator('.ok,.err').allTextContents()).join(' ').slice(0, 140)); await shot('13-holo-saved'); }
  const D2 = await top('#doors2'), D2H = await span('#doors2');
  for (const [k, f] of [['a', 0.18], ['b', 0.4], ['c', 0.62], ['d', 0.86]]) { await to(D2 + D2H * f, 2200); await shot('14-doors2-' + k); }
  await sw('doors2');
  await to(await top('#store'), 2600); await shot('15-store-top');
  await to((await top('#offerBand')) - 120, 2400); await shot('16-offer-interests');
  log.push('bot mode in the collection: ' + await p.evaluate(() => PEPBOT.mode()));
  await p.waitForTimeout(1500);
  log.push('bot proactive greeting: ' + await p.evaluate(() => { const r = document.querySelector('.pb-root'); return r ? r.getAttribute('data-state') + ' · ' + (document.querySelector('.pb-peek__text') || {}).textContent : 'none'; }));
  await shot('17-bot-sell-greeting');
  await p.locator('.int-card').nth(3).click(); await p.waitForTimeout(1800);
  log.push('interest filter RECOVERY: shown ' + await p.evaluate(() => document.querySelectorAll('#shelf .prod:not(.hide)').length));
  await shot('18-shelf-filtered');
  await p.click('#filters [data-f=all]'); await p.waitForTimeout(600);
  await to((await top('#shelf')) - 80, 2400); await shot('19-shelf'); await sw('store');
  const adds = p.locator('#shelf [data-add]');
  for (let i = 0; i < 2; i++) { await adds.nth(i * 3).scrollIntoViewIfNeeded(); await adds.nth(i * 3).click(); await p.waitForTimeout(400); }
  const so = p.locator('#shelf [data-rs]').first(); await so.scrollIntoViewIfNeeded(); await so.click(); await p.waitForTimeout(500);
  const rsf = p.locator('#modal form.cap-form').first(); await rsf.locator('input[type=email]').fill('q@example.com');
  await rsf.locator('button[type=submit]').click(); await p.waitForTimeout(300); log.push('restock without box: ' + await rsf.locator('.err').textContent());
  await rsf.locator('input[name=consent_email]').check(); await rsf.locator('button[type=submit]').click(); await p.waitForTimeout(1200);
  log.push('restock ok: ' + (await rsf.locator('.ok').textContent()).slice(0, 120)); await shot('20-restock'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  await p.click('#cartBtn'); await p.waitForTimeout(1000); await shot('21-cart');
  log.push('cart totals: ' + JSON.stringify(await p.evaluate(() => window.__pc.totals())));
  await p.click('#checkout'); await p.waitForTimeout(900); await shot('22-checkout'); await p.keyboard.press('Escape'); await p.waitForTimeout(400);
  /* the bot sells: product answer + add to cart */
  await p.evaluate(() => { PEPBOT.open(); PEPBOT.ask('price of ghk-cu'); }); await p.waitForTimeout(1800);
  log.push('sell answer: ' + (await p.evaluate(() => { const m = [...document.querySelectorAll('.pb-msg--bot')].pop(); return m ? m.textContent.slice(0, 110) : ''; })) + ' · cards ' + await p.evaluate(() => document.querySelectorAll('.pb-card').length));
  const before = await p.evaluate(() => window.__pc.cart.reduce((a, l) => a + l.q, 0));
  await p.locator('.pb-card [data-add]').first().click(); await p.waitForTimeout(1200);
  log.push('bot add-to-cart -> site cart ' + before + ' -> ' + await p.evaluate(() => window.__pc.cart.reduce((a, l) => a + l.q, 0)));
  await shot('23-bot-sell'); await p.evaluate(() => PEPBOT.close()); await p.waitForTimeout(400);
  const X = await top('#explode'), XH = await span('#explode'); await to(X + XH * 0.8, 2000); await shot('24-explode');
  await to((await top('#tiers')) + H * 0.2, 2000); await shot('25-tiers');
  await to(await top('.twoway'), 2000); await p.click('#fogKey'); await p.waitForTimeout(800); await shot('26-twoway');
  await to(await top('#quiz'), 1800); await shot('27-finder');
  await to((await top('#passport')) - H * 0.3, 1500); await p.click('#passport button'); await p.waitForTimeout(400); await shot('28-passport');
  await to((await top('#network')) + H * 0.3, 2600); await shot('29-network');
  await to(await p.evaluate(() => document.documentElement.scrollHeight), 2800); await shot('30-footer'); await sw('footer');
  log.push('footer last line: ' + await p.evaluate(() => { const ps = document.querySelectorAll('.foot-legal p'); return ps[ps.length - 1].textContent; }));
  await p.click('#menuBtn'); await p.waitForTimeout(900); await shot('31-menu'); await p.keyboard.press('Escape');
  /* back up to the landing: the bot returns to guide mode */
  await to(0, 1500); await p.evaluate(() => window.__pc.syncBot());
  log.push('bot mode back on the landing: ' + await p.evaluate(() => PEPBOT.mode()));
  /* reload: the pass is remembered (30 days) */
  await p.goto(BASE + 'index.html?nointro&v=' + V); await p.waitForTimeout(5000);
  log.push('RELOAD: gated ' + await p.evaluate(() => document.documentElement.classList.contains('age-gated')) + ' · panel ' + await p.getAttribute('#agePanel', 'data-state') + ' · ' + (await p.textContent('#ageOkT')).slice(0, 90) + ' · catalogue ' + await p.evaluate(() => window.__pc.catState));
  log.push('events: ' + (await p.evaluate(() => window.__pc.events.slice(0, 40).join(','))));
  console.log(tag, 'done @' + el(), '\n' + log.join('\n') + '\nERRORS:\n' + (errs.join('\n') || 'none'));
  await b.close();
})().catch(e => { console.log(tag, 'FAILED', e.message.slice(0, 400), '\n' + (global.__log || []).join('\n') + '\nERRORS:\n' + (global.__errs || []).join('\n')); process.exit(1); });

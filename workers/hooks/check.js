// HOOKS worker check (module 45-hooks). Usage: node check.js BASE_URL
//   BASE_URL is the folder that holds index.html (e.g. http://localhost:8801/site/new/) or the page itself.
// Runs at 1440x900 and 390x844 and asserts, for every hook: it sits at its mapped place in the page and is on screen there;
// its consent boxes start unticked; submit is refused without consent; the success state shows with consent; nothing
// personal lands in localStorage or sessionStorage; no two asks ever share a screen; the exit slide-in shows at most once
// per session and never past its cap; the phone bar follows its rules; 0 page errors.
const { chromium } = require('playwright');

const arg = process.argv[2] || 'http://localhost:8801/site/new/';
const URL = /\.html?(\?|#|$)/.test(arg) ? arg : arg.replace(/\/?$/, '/') + 'index.html';
const EMAIL = 'zelda.tester@example.com', NAME = 'Zelda', PHONE = '416 555 0123';
const ROOMS = [
  { id: 'founder-card', hook: 'H63', after: 'crest', before: 'standard', label: '01 FOUNDER CARD' },
  { id: 'picks', hook: 'H64', after: 'standard', before: 'story', label: '02 FIND YOUR PICKS' },
  { id: 'first-access', hook: 'H65', after: 'story', before: 'lineup', label: '03 FIRST ACCESS' },
  { id: 'share', hook: 'H66', after: 'lineup', before: 'doors', label: '04 SHARE PEPTICITY' }
];
let pass = 0, fail = 0;
const fails = [];
function ok(cond, label) {
  if (cond) { pass++; console.log('  PASS ' + label); } else { fail++; fails.push(label); console.log('  FAIL ' + label); }
  return !!cond;
}
// the exit slide-in arms after its time on the page; the overlay root says so (a "does not show" test is only fair once armed)
async function armedWait(page) {
  await page.waitForFunction(() => !!document.querySelector('[data-module="hooks"][data-hooks-armed]'), null, { timeout: 30000 }).catch(() => {});
  return page.evaluate(() => !!document.querySelector('[data-module="hooks"][data-hooks-armed]'));
}
// a part of the check that cannot run (for example on a page without the hooks) is one FAIL, and the check carries on
async function section(name, fn) {
  try { await fn(); } catch (e) { ok(false, name + ' could not run: ' + String(e.message || e).split('\n')[0].slice(0, 160)); }
}

async function settle(page) {
  await page.waitForFunction(() => window.PEP && PEP.status && PEP.status.hooks, null, { timeout: 60000 }).catch(() => {});
  // the hero's 3D word changes the page height when it starts or gives up: wait for it (it decides within 9 s)
  await page.waitForFunction(() => { const h = document.querySelector('[data-module="hero"]'); return !h || h.getAttribute('data-3d') !== 'pending'; }, null, { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(900);
}
async function open(page) { await page.goto(URL, { waitUntil: 'load', timeout: 120000 }); await settle(page); }
async function fresh(page) {
  // a new visitor: nothing in localStorage, no exit seen this session (the entrance flag is kept so it does not replay)
  await page.evaluate(() => { localStorage.clear(); sessionStorage.removeItem('pep_hooks_exit'); });
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  await settle(page);
}
async function storageDump(page) {
  return page.evaluate(() => {
    const out = {};
    for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); out['local:' + k] = localStorage.getItem(k); }
    for (let i = 0; i < sessionStorage.length; i++) { const k = sessionStorage.key(i); out['session:' + k] = sessionStorage.getItem(k); }
    return JSON.stringify(out);
  });
}
function personal(dump) { return /@|zelda|tester|example\.com|416[\s.-]?555|5550123|555[\s.-]?0123/i.test(dump); }
async function shown(page, sel) { return page.evaluate(s => { const el = document.querySelector(s); return !!(el && el.getClientRects().length && !el.closest('[hidden]')); }, sel); }
async function scrollToFrame(page, id) {
  await page.evaluate(i => { const r = document.getElementById(i), f = r.querySelector('[data-hooks-ask]'); window.scrollTo(0, Math.max(0, r.getBoundingClientRect().top + scrollY + f.offsetTop - innerHeight * 0.08)); }, id);
  await page.waitForTimeout(2400);                                 // the reveal starts within 0.6 s and takes 0.8 s
}

// every ask on screen right now: lead forms outside the hooks (the doors' two forms count as ONE ask, the doors), each room's
// pane, and the exit slide-in and the phone bar while they show
async function asksOnScreen(page) {
  return page.evaluate(() => {
    const vh = innerHeight, seen = new Set();
    const vis = el => { if (!el || !el.getClientRects().length) return false; const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && r.bottom > 1 && r.top < vh - 1; };
    document.querySelectorAll('form[data-hook]').forEach(f => {
      if (f.closest('[data-module="hooks"]') || f.closest('[data-module="cart"]') || f.closest('[data-module="guide"]')) return;
      if (vis(f)) seen.add(f.closest('[data-module="doors"]') ? 'doors' : f.getAttribute('data-hook'));
    });
    document.querySelectorAll('[data-module="hooks"] [data-hooks-ask]').forEach(fr => { if (vis(fr)) seen.add(fr.closest('[data-hooks]').getAttribute('data-hooks')); });
    const exit = document.querySelector('[data-hooks-exit]'), bar = document.querySelector('[data-hooks-bar]');
    if (exit && exit.hasAttribute('data-on')) seen.add('exit');
    if (bar && bar.hasAttribute('data-on') && getComputedStyle(bar).display !== 'none') seen.add('bar');
    return { y: Math.round(scrollY), asks: [...seen] };
  });
}
// a scroll position with no ask and no held stage (story, showcase) on screen, below the given element
async function freeY(page, belowSel) {
  return page.evaluate(sel => {
    const vh = innerHeight, H = document.documentElement.scrollHeight;
    const start = sel ? Math.round(document.querySelector(sel).getBoundingClientRect().bottom + scrollY) : 0;
    const asks = [...document.querySelectorAll('form[data-hook]')].filter(f => !f.closest('[data-module="hooks"]') && !f.closest('[data-module="cart"]') && !f.closest('[data-module="guide"]') && f.getClientRects().length)
      .concat([...document.querySelectorAll('[data-module="hooks"] [data-hooks-ask]')], [...document.querySelectorAll('[data-module="story"], [data-module="lineup"]')].filter(e => e.getClientRects().length));
    const boxes = asks.map(el => { const r = el.getBoundingClientRect(); return [r.top + scrollY, r.bottom + scrollY]; });
    for (let y = start; y < H - vh; y += 20) { if (boxes.every(b => b[1] <= y + 2 || b[0] >= y + vh + 150)) return y; }
    return -1;
  }, belowSel);
}

async function run(browser, vp) {
  const phone = vp.tag === 'phone';
  console.log('\n=== ' + vp.tag.toUpperCase() + ' ' + vp.w + 'x' + vp.h + ' ===');
  const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: phone, hasTouch: phone, permissions: ['clipboard-read', 'clipboard-write'] });
  const page = await ctx.newPage();
  page.setDefaultTimeout(30000);
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await open(page);
  await page.evaluate(() => { localStorage.clear(); sessionStorage.removeItem('pep_hooks_exit'); });
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  await settle(page);

  // ---------- 1. the hooks are there, at their mapped places ----------
  const present = await page.evaluate(rooms => rooms.map(r => {
    const el = document.getElementById(r.id);
    const order = (a, b) => !!(a && b && (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING));
    const after = document.getElementById(r.after), before = document.getElementById(r.before);
    return { id: r.id, exists: !!el, module: el && el.getAttribute('data-module'), hook: el && el.querySelector('form[data-hook="' + r.hook + '"]') ? r.hook : null,
      ordered: order(after, el) && order(el, before) };
  }), ROOMS);
  present.forEach((p, i) => {
    ok(p.exists && p.module === 'hooks', ROOMS[i].label + ': room #' + p.id + ' exists in module 45-hooks');
    ok(p.hook === ROOMS[i].hook, ROOMS[i].label + ': form carries data-hook="' + ROOMS[i].hook + '"');
    ok(p.ordered, ROOMS[i].label + ': mapped place, after #' + ROOMS[i].after + ' and before #' + ROOMS[i].before);
  });
  ok(await page.evaluate(() => !!document.querySelector('[data-module="hooks"] form[data-hook="H67"]') && !!document.querySelector('[data-module="hooks"] form[data-hook="H68"]')), 'overlays: exit (H67) and phone bar (H68) forms exist');
  ok(await page.evaluate(() => PEP.status.hooks === 'ready' && document.querySelectorAll('[data-module="hooks"][data-pep-failed]').length === 0), 'module hooks booted (PEP.status.hooks is ready, no failed root)');
  ok(await page.evaluate(() => !!(PEP.config.hooks && PEP.config.hooks.exit && PEP.config.hooks.exit.maxEver === 3)), 'PEP_CONFIG.hooks.exit.maxEver is 3');
  // the card's logo is the house logo-07 engine (02-logo3d), never the old logo-21 lockup
  const logo = await page.evaluate(async () => {
    const room = document.getElementById('founder-card'), mark = room && room.querySelector('[data-card-mark]');
    const engine = document.querySelector('[data-module="logo3d"]');
    for (let i = 0; i < 40 && engine && !engine.getAttribute('data-pep3d-state'); i++) { await new Promise(r => setTimeout(r, 250)); }
    const state = engine ? engine.getAttribute('data-pep3d-state') : null;
    const word = room && room.querySelector('.pep-hooks-card-word');
    return { old: document.querySelectorAll('[data-module="hooks"] [data-pep-logo]').length, mark: !!mark, state,
      adopted: !!(mark && mark.classList.contains('pep-logo3d-back-mark')), folded: !!(room && room.getAttribute('data-hooks-3d') === 'off'),
      word: !!(word && word.getClientRects().length && word.textContent.trim() === 'PEPTICITY') };
  });
  ok(logo.old === 0 && logo.mark, '01 FOUNDER CARD: logo is a logo-07 slot for the 3D engine; no data-pep-logo anywhere in the hooks');
  ok(logo.word && (logo.state === 'on' ? logo.adopted : logo.state === 'off' ? logo.folded : logo.adopted || logo.folded),
    '01 FOUNDER CARD: the engine draws the P in the slot when 3D is on, and PEPTICITY stands alone when it is off (3D ' + logo.state + ', slot adopted ' + logo.adopted + ')');

  // ---------- 2. every consent box starts unticked ----------
  const boxes = await page.evaluate(() => [...document.querySelectorAll('[data-module="hooks"] input[type="checkbox"]')].map(c => ({ n: c.name, on: c.checked || c.hasAttribute('checked') })));
  ok(boxes.length >= 8, 'hooks hold ' + boxes.length + ' consent boxes (8 expected: 7 email, 1 text)');
  ok(boxes.every(b => !b.on), 'every consent box in the hooks starts unticked');

  // ---------- FIX ROUND (audit, 14 Nov): preview line, page source ----------
  // found while proving the fixes: a pane must never be a scroll container, or the travelling light lets it be scrolled sideways
  const panes = await page.evaluate(() => [...document.querySelectorAll('[data-module="hooks"] .pep-hooks-glass')].map(g => getComputedStyle(g).overflowX));
  ok(panes.length >= 6 && panes.every(o => o === 'clip'), 'no hook pane can be scrolled inside itself (overflow clip on all ' + panes.length + ' panes)');
  const notes = await page.evaluate(() => [...document.querySelectorAll('[data-module="hooks"] form[data-hook] [data-preview-note]')].map(n => ({ hidden: n.hidden, text: n.textContent.trim() })));
  ok(notes.length === 7 && notes.every(n => n.hidden && n.text === 'Preview only: nothing was sent.'), 'preview-only-note: all 7 hook forms carry the preview line, hidden until a success (' + notes.length + ' found)');
  const shareSrc = await page.evaluate(async () => {
    const src = await (await fetch(location.href.split('#')[0])).text();
    const m = /<section data-module="hooks" data-hooks="share"[\s\S]*?<\/section>/.exec(src);
    return m ? m[0].replace(/<!--[\s\S]*?-->/g, '') : null;
  });
  ok(shareSrc !== null && !/\d\s*%/.test(shareSrc) && !/\bGIVE\b|\bCREDIT\b|first order/i.test(shareSrc), 'gate-page-source: the SHARE room in the page source holds no reward number and no reward wording');
  ok(await page.evaluate(() => { const r = PEP.config.hooks && PEP.config.hooks.referral; return !!(r && typeof r.headline === 'string' && /\{give\}/.test(r.headline) && /\{get\}/.test(r.headline)); }), 'gate-page-source: the reward wording lives in PEP_CONFIG.hooks.referral (headline with {give} and {get})');

  // ---------- 3. each room is on screen and lit at its mapped scroll position; screens are logged for MAP.md ----------
  for (const r of ROOMS) await section(r.label + ': scroll position', async () => {
    if (r.id === 'picks') { await page.waitForSelector('#picks .pep-hooks-tile', { timeout: 15000 }).catch(() => {}); }
    await scrollToFrame(page, r.id);
    const st = await page.evaluate(i => {
      const room = document.getElementById(i), fr = room.querySelector('[data-hooks-ask]'), gl = fr.querySelector('.pep-hooks-glass');
      const b = fr.getBoundingClientRect();
      return { top: Math.round(b.top), bottom: Math.round(b.bottom), vh: innerHeight, lit: fr.hasAttribute('data-revealed'), op: +getComputedStyle(gl).opacity,
        screen: +((room.getBoundingClientRect().top + scrollY + fr.offsetTop) / innerHeight).toFixed(2) };
    }, r.id);
    ok(st.lit && st.op > 0.98 && st.top >= 0 && st.top < st.vh * 0.5, r.label + ': on screen and lit at its scroll position (screen ' + st.screen + ', pane top ' + st.top + 'px, opacity ' + st.op + ')');
  });

  // ---------- 4. no two asks ever share one screen (a new visitor scrolls the whole page) ----------
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  const H = await page.evaluate(() => document.documentElement.scrollHeight);
  let worst = { n: 0 }, samples = 0, barSeen = false;
  for (let y = 0; y <= H; y += Math.round(vp.h / 3)) {
    await page.evaluate(yy => window.scrollTo(0, yy), y);
    await page.waitForTimeout(phone ? 400 : 150);
    const s = await asksOnScreen(page);
    samples++;
    if (s.asks.includes('bar')) barSeen = true;
    if (s.asks.length > worst.n) worst = { n: s.asks.length, y: s.y, asks: s.asks };
  }
  ok(worst.n <= 1, 'no two asks share one screen (' + samples + ' scroll samples; most at once: ' + worst.n + (worst.n > 1 ? ' at y ' + worst.y + ': ' + worst.asks.join(' + ') : '') + ')');

  // ---------- 5. the phone bar ----------
  await section('phone bar placement', async () => { if (phone) {
    ok(barSeen, 'phone bar (H68) shows in the gaps between asks on a phone');
    await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(500);
    let s = await asksOnScreen(page);
    ok(!s.asks.includes('bar'), 'phone bar hidden while the hero ask is on screen');
    await page.evaluate(() => { const st = document.getElementById('story'); window.scrollTo(0, st.getBoundingClientRect().top + scrollY + innerHeight * 0.5); });
    await page.waitForTimeout(600);
    s = await asksOnScreen(page);
    ok(!s.asks.includes('bar'), 'phone bar hidden over FROM VIAL TO SHELF (the scroll story)');
    await page.evaluate(() => { const l = document.getElementById('lineup'); window.scrollTo(0, l.getBoundingClientRect().top + scrollY + innerHeight * 1.5); });
    await page.waitForTimeout(900);
    s = await asksOnScreen(page);
    ok(!s.asks.includes('bar'), 'phone bar hidden over THE LINEUP (the showcase)');
  } else {
    ok(!barSeen, 'phone bar never shows on desktop');
  } });

  // ---------- 6. the exit slide-in: at most once per session ----------
  let fy = -1;
  // the visitor leaves up to three times (a "does not show" test must survive all three; a "shows" test may need a second
  // try when the busy page delivers its timers late)
  async function fireExit() {
    for (let k = 0; k < 3; k++) {
      if (await fireExitOnce()) { return true; }
    }
    return false;
  }
  async function fireExitOnce() {
    fy = await freeY(page, '#founder-card');                    // the layout can differ after a reload (3D on or off)
    if (!phone) {
      await page.evaluate(yy => window.scrollTo(0, yy), fy); await page.waitForTimeout(500);
      await page.evaluate(() => document.documentElement.dispatchEvent(new MouseEvent('mouseleave', { clientX: 600, clientY: 0, bubbles: false })));
      await page.waitForTimeout(700);
    } else {
      const H2 = await page.evaluate(() => document.documentElement.scrollHeight);
      await page.evaluate(yy => window.scrollTo(0, yy), Math.round(H2 * 0.62)); await page.waitForTimeout(500);
      await page.evaluate(yy => window.scrollTo(0, yy), fy + Math.round(vp.h * 0.45)); await page.waitForTimeout(450);
      await page.evaluate(async (args) => { for (let i = 1; i <= 6; i++) { window.scrollTo(0, args.from - Math.round(args.step * i)); await new Promise(r => setTimeout(r, 30)); } }, { from: fy + Math.round(vp.h * 0.45), step: vp.h * 0.075 });
      await page.waitForTimeout(800);
    }
    return page.evaluate(() => document.querySelector('[data-hooks-exit]').hasAttribute('data-on'));
  }
  await section('exit once per session', async () => {
  fy = await freeY(page, '#founder-card');
  ok(fy > 0, 'a free scroll position exists for the exit test (y ' + fy + ')');
  const isArmed = await armedWait(page);      // armed after PEP_CONFIG.hooks.exit.armAfterMs on the page
  ok(isArmed, 'exit slide-in arms after its time on the page (data-hooks-armed)');
  ok(await fireExit(), 'exit slide-in (H67) shows when the visitor leaves (' + (phone ? 'fast flick back up' : 'pointer out through the top') + ')');
  let s2 = await asksOnScreen(page);
  ok(s2.asks.length === 1 && s2.asks[0] === 'exit', 'exit slide-in is the only ask on screen while it shows (' + s2.asks.join(', ') + ')');
  await page.click('[data-hooks-exit] .pep-hooks-x');
  await page.waitForTimeout(500);
  ok(await page.evaluate(() => !document.querySelector('[data-hooks-exit]').hasAttribute('data-on')), 'exit slide-in closes from its close button');
  ok(!(await fireExit()), 'exit slide-in does NOT show a second time in the same session');
  ok(await page.evaluate(() => sessionStorage.getItem('pep_hooks_exit') === '1' && JSON.parse(localStorage.getItem('pep:pep_hooks_v1')).exitSeen === 1), 'exit counted once: session flag set, count 1 (no personal data)');
  });

  // ---------- 7. each hook: blocked without consent, success with it, nothing personal kept ----------
  async function blockedThenDone(o) {
    // o: { label, root, prep(), email, consent, submit, done }
    if (o.prep) await o.prep();
    await page.fill(o.email, EMAIL);
    await page.click(o.submit);
    await page.waitForTimeout(1200);
    const blocked = await page.evaluate(a => {
      const err = document.querySelector(a.root + ' [data-err="consent"]');
      const done = document.querySelector(a.done);
      return !!(err && !err.hidden && done && done.closest('[hidden]') && !localStorage.getItem('pep:pep_flow_v1'));
    }, o);
    ok(blocked, o.label + ': submit is refused without consent (error shown, no success, not joined)');
    ok(await page.evaluate(sel => !document.querySelector(sel).checked, o.consent), o.label + ': consent box still unticked after the refused submit');
    await page.check(o.consent);
    await page.click(o.submit);
    // the success step follows the send and a 1.2 s morph; under a busy 3D page timers run late, so wait up to 10 s
    await page.waitForFunction(sel => { const el = document.querySelector(sel); return !!(el && el.getClientRects().length && !el.closest('[hidden]')); }, o.done, { timeout: 10000 }).catch(() => {});
    ok(await shown(page, o.done), o.label + ': success state shows once consent is ticked');
    const dump = await storageDump(page);
    const flow = await page.evaluate(() => { try { return JSON.parse(localStorage.getItem('pep:pep_flow_v1')); } catch (e) { return null; } });
    ok(!!(flow && flow.stage === 'TEAM' && Array.isArray(flow.hooksDone) && flow.hooksDone.indexOf(o.hook) > -1), o.label + ': only the plain joined state is kept (pep_flow_v1 stage TEAM, hook ' + o.hook + ')');
    ok(!personal(dump), o.label + ': nothing personal in localStorage or sessionStorage');
    const pn = await page.evaluate(root => {
      const n = document.querySelector(root + ' [data-preview-note]'), c = PEP.config;
      return { expect: !!(c.flags && c.flags.PREVIEW) && !(c.form && c.form.endpoint), shown: !!(n && !n.hidden && n.getClientRects().length), text: n ? n.textContent.trim() : '' };
    }, o.root);
    ok(pn.expect ? (pn.shown && pn.text === 'Preview only: nothing was sent.') : !pn.shown, o.label + ': preview-only-note: after the success it reads "Preview only: nothing was sent." (preview, nothing sent: ' + pn.expect + ')');
  }

  // 01 FOUNDER CARD: the name writes onto the card, then the email
  await section('01 FOUNDER CARD flow', async () => {
  await fresh(page);
  await scrollToFrame(page, 'founder-card');
  await page.fill('#founder-card [data-field="name"]', NAME);
  ok(await page.evaluate(() => document.querySelector('#founder-card [data-card-name]').textContent.trim() === 'ZELDA'), '01 FOUNDER CARD: the first name writes onto the live card as it is typed (ZELDA)');
  await page.click('#founder-card [data-make]');
  await page.waitForTimeout(500);
  await blockedThenDone({ label: '01 FOUNDER CARD (H63)', hook: 'H63', root: '#founder-card', email: '#founder-card [data-field="email"]', consent: '#founder-card [data-consent="email"]', submit: '#founder-card button[type="submit"]', done: '#founder-card [data-step="done"]' });

  });

  // 02 FIND YOUR PICKS: three taps, real picks, then the email
  await section('02 FIND YOUR PICKS flow', async () => {
  await fresh(page);
  await page.waitForSelector('#picks .pep-hooks-tile', { timeout: 15000 });
  await scrollToFrame(page, 'picks');
  const cat = await page.evaluate(async () => (await (await fetch('assets/catalogue.json')).json()).products);
  const heldSkus = await page.evaluate(() => [].concat(PEP.config.hidden || [], PEP.config.flagged || [], (PEP.config.hooks && PEP.config.hooks.finderSkip) || []));
  let taps = 0;
  for (let i = 0; i < 3; i++) {
    if (await shown(page, '#picks [data-result]')) break;
    await page.click('#picks .pep-hooks-tile >> nth=0');
    taps++;
    await page.waitForTimeout(400);
  }
  ok(await shown(page, '#picks [data-result]'), '02 FIND YOUR PICKS: the result shows after ' + taps + ' taps');
  const picks = await page.evaluate(() => [...document.querySelectorAll('#picks .pep-hooks-pick')].map(li => ({ name: li.querySelector('.pep-hooks-pick-name').textContent, size: li.querySelector('.pep-hooks-pick-size').textContent, price: li.querySelector('.pep-hooks-pick-price').textContent })));
  const real = picks.every(p => cat.some(c => c.name === p.name && c.sizes.some(s => s.label === p.size && '$' + s.priceCAD === p.price)));
  ok(picks.length >= 2 && picks.length <= 3 && real, '02 FIND YOUR PICKS: ' + picks.length + ' picks, each name, size and price exactly as in catalogue.json (' + picks.map(p => p.name + ' ' + p.size + ' ' + p.price).join('; ') + ')');
  ok(picks.every(p => { const c = cat.find(x => x.name === p.name); return c && heldSkus.indexOf(c.sku) < 0; }), '02 FIND YOUR PICKS: no product held back in config (hidden, flagged or hooks.finderSkip) is offered');
  await blockedThenDone({ label: '02 FIND YOUR PICKS (H64)', hook: 'H64', root: '#picks [data-finder]', email: '#picks [data-finder-form] [data-field="email"]', consent: '#picks [data-finder-form] [data-consent="email"]', submit: '#picks [data-finder-form] button[type="submit"]', done: '#picks [data-finder-form] [data-step="done"]' });

  });

  // 03 FIRST ACCESS: email, then the optional text step with its own box
  await section('03 FIRST ACCESS flow', async () => {
  await fresh(page);
  await scrollToFrame(page, 'first-access');
  await blockedThenDone({ label: '03 FIRST ACCESS (H65)', hook: 'H65', root: '#first-access', email: '#first-access [data-field="email"]', consent: '#first-access [data-consent="email"]', submit: '#first-access button[type="submit"]', done: '#first-access [data-step="sms"]' });
  ok(await page.evaluate(() => !document.querySelector('#first-access [data-consent="sms"]').checked), '03 FIRST ACCESS: the optional text box starts unticked');
  await page.fill('#first-access [data-field="phone"]', PHONE);
  await page.click('#first-access [data-sms-send]');
  await page.waitForTimeout(900);
  ok(await page.evaluate(() => !document.querySelector('#first-access [data-err="sms"]').hidden && !!document.querySelector('#first-access [data-step="done"]').hidden), '03 FIRST ACCESS: the text step is refused without its own consent');
  await page.check('#first-access [data-consent="sms"]');
  await page.click('#first-access [data-sms-send]');
  await page.waitForFunction(() => { const el = document.querySelector('#first-access [data-step="done"]'); return !!(el && !el.hidden); }, null, { timeout: 10000 }).catch(() => {});
  ok(await shown(page, '#first-access [data-step="done"]') && await shown(page, '#first-access [data-sms-done]'), '03 FIRST ACCESS: with its consent the text step succeeds');
  ok(!personal(await storageDump(page)), '03 FIRST ACCESS: no email or phone number in the browser storage');

  });

  // 04 SHARE: email, then a share link that holds a random code only
  await section('04 SHARE flow', async () => {
  await fresh(page);
  await scrollToFrame(page, 'share');
    ok(await page.evaluate(() => {
    const r = document.querySelector('#share [data-reward]'), c = PEP.config.hooks.referral, f = t => String(t || '').replace(/\{give\}/g, c.givePercent).replace(/\{get\}/g, c.getPercent);
    const head = r && r.querySelector('[data-reward-head]'), line = r && r.querySelector('[data-reward-line]');
    return !!r && !r.hidden && !!head && head.textContent === f(c.headline) && head.textContent === 'GIVE 15% OFF. GET 15% CREDIT.' && !!line && line.textContent === f(c.line);
  }), '04 SHARE: reward wording shows in preview (referral switch), written from PEP_CONFIG.hooks.referral: GIVE 15% OFF. GET 15% CREDIT.');
  await blockedThenDone({ label: '04 SHARE PEPTICITY (H66)', hook: 'H66', root: '#share', email: '#share [data-field="email"]', consent: '#share [data-consent="email"]', submit: '#share button[type="submit"]', done: '#share [data-step="link"]' });
  const link = await page.evaluate(() => document.querySelector('#share [data-link]').value);
  ok(/^https?:\/\/[^@\s]+\?ref=[A-Z2-9]{8}$/.test(link) && !/zelda|example/i.test(link), '04 SHARE: the share link is ?ref= and a random code only (' + link.replace(/^.*\?/, '?') + ')');

  });

  // EXIT (H67): a new session, then the form
  await section('EXIT form flow', async () => {
  await fresh(page);
  const isArmed = await armedWait(page);
  ok(await fireExit(), 'EXIT (H67): shows for a new visitor in a new session');
  await blockedThenDone({ label: 'EXIT: GRACE\'S LETTER (H67)', hook: 'H67', root: '[data-hooks-exit]', email: '[data-hooks-exit] [data-field="email"]', consent: '[data-hooks-exit] [data-consent="email"]', submit: '[data-hooks-exit] button[type="submit"]', done: '[data-hooks-exit] [data-step="done"]' });

  });

  // cap: shown 3 times ever already -> never again, even in a new session
  await section('EXIT cap', async () => {
  await page.evaluate(() => { localStorage.clear(); localStorage.setItem('pep:pep_hooks_v1', JSON.stringify({ exitSeen: 3 })); sessionStorage.removeItem('pep_hooks_exit'); });
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  await settle(page);
  const isArmed = await armedWait(page);
  ok(isArmed && !(await fireExit()), 'EXIT: never shows again once it has shown 3 times (armed, new session, count 3)');

  });

  // members never see the exit or the bar
  await section('members', async () => {
  await page.evaluate(() => { localStorage.setItem('pep:pep_flow_v1', JSON.stringify({ stage: 'TEAM', joinedAt: new Date().toISOString(), hooksDone: ['H01'] })); localStorage.setItem('pep:pep_hooks_v1', JSON.stringify({ exitSeen: 0 })); sessionStorage.removeItem('pep_hooks_exit'); });
  await page.reload({ waitUntil: 'load', timeout: 120000 });
  await settle(page);
  const isArmed = await armedWait(page);
  ok(isArmed && !(await fireExit()), 'EXIT: never shows to a member (armed, joined)');
  ok(await page.evaluate(() => !document.querySelector('[data-hooks-bar]').hasAttribute('data-on')), 'PHONE BAR: never shows to a member');
    ok(await shown(page, '#founder-card [data-step="done"]'), 'members see the next step instead of the ask (founder card claimed)');
  ok(await shown(page, '#share [data-step="email"]') && !(await shown(page, '#share [data-step="link"]')), 'share-attribution: a member whose share form was never sent is shown the one field, not a link');

  });

  // FIX ROUND: share-attribution. A list is connected in flight (PEP_CONFIG.form.endpoint set before the runtime reads it;
  // a Content-Security-Policy tag, if the build has one, is dropped for this test page only so that edit can run).
  await section('share attribution', async () => {
    const collect = new (require('url').URL)('/__hooks_collect', URL).href, bare = URL.split(/[?#]/)[0];
    async function connected() {
      const c = await browser.newContext({ viewport: { width: vp.w, height: vp.h }, isMobile: phone, hasTouch: phone });
      const p = await c.newPage(), posts = [];
      p.setDefaultTimeout(30000);
      await p.route('**/__hooks_collect', r => { posts.push(r.request().postData() || ''); r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }); });
      await p.route(u => u.href.split(/[?#]/)[0] === bare, async r => {
        if (r.request().resourceType() !== 'document') { return r.continue(); }
        const res = await r.fetch();
        let html = await res.text();
        const at = html.indexOf('<script data-pep-src="core/pep.js"');
        if (at > -1) { html = html.slice(0, at) + '<script>window.PEP_CONFIG.form.endpoint=' + JSON.stringify(collect) + ';</script>\n' + html.slice(at); }
        html = html.replace(/<meta[^>]+http-equiv=["']?Content-Security-Policy["']?[^>]*>/i, '');
        return r.fulfill({ response: res, body: html });
      });
      return { c, p, posts };
    }
    const body = (posts, form) => { for (const b of posts) { try { const j = JSON.parse(b); if (j.form === form) { return j; } } catch (e) { /* not ours */ } } return null; };

    // a member: the link appears only after the send, carries the code that was sent, and is the same on the next visit
    const a = await connected();
    await a.p.goto(URL, { waitUntil: 'load', timeout: 120000 }); await settle(a.p);
    ok(await a.p.evaluate(u => PEP.config.form.endpoint === u, collect), 'share-attribution: test setup, the list endpoint is connected');
    await scrollToFrame(a.p, 'share');
    await a.p.fill('#share [data-field="email"]', EMAIL);
    await a.p.check('#share [data-consent="email"]');
    await a.p.click('#share button[type="submit"]');
    await a.p.waitForFunction(() => { const el = document.querySelector('#share [data-step="link"]'); return !!(el && !el.hidden); }, null, { timeout: 10000 }).catch(() => {});
    const link1 = await a.p.evaluate(() => document.querySelector('#share [data-link]').value);
    const sent = body(a.posts, 'share-link'), code1 = (/\?ref=([A-HJ-NP-Z2-9]{8})$/.exec(link1) || [])[1] || '';
    ok(!!code1 && !!sent && sent.ref === code1 && sent.hook === 'H66', 'share-attribution: the link shown is the code that was sent with the form (' + code1 + ')');
    ok(await a.p.evaluate(() => { const n = document.querySelector('#share [data-preview-note]'); return !!n && n.hidden; }), 'preview-only-note: no preview line once a list is connected and the form was sent');
    await a.p.reload({ waitUntil: 'load', timeout: 120000 }); await settle(a.p);
    const link2 = await a.p.evaluate(() => { const el = document.querySelector('#share [data-step="link"]'); return el && !el.hidden ? document.querySelector('#share [data-link]').value : ''; });
    ok(!!link1 && link2 === link1, 'share-attribution: one code per member, the same link on the next visit (' + (link2.split('ref=')[1] || 'none') + ')');
    ok(!personal(await storageDump(a.p)), 'share-attribution: the kept code is the only new thing in storage (no email, name or number)');
    await a.c.close();

    // a friend arrives by that link: one quiet line, and the code rides in the friend's own join
    const f = await connected();
    await f.p.goto(URL + '?ref=ABCDEFGH', { waitUntil: 'load', timeout: 120000 }); await settle(f.p);
    ok(await f.p.evaluate(() => { const n = document.querySelector('#founder-card [data-invited]'); return !!n && !n.hidden && n.textContent.trim() === 'A TEAM MEMBER INVITED YOU.'; }), 'share-attribution: a friend landing on ?ref=ABCDEFGH sees A TEAM MEMBER INVITED YOU.');
    await scrollToFrame(f.p, 'founder-card');
    await f.p.click('#founder-card [data-make]');
    await f.p.fill('#founder-card [data-field="email"]', EMAIL);
    await f.p.check('#founder-card [data-consent="email"]');
    await f.p.click('#founder-card button[type="submit"]');
    await f.p.waitForFunction(() => { const el = document.querySelector('#founder-card [data-step="done"]'); return !!(el && !el.hidden); }, null, { timeout: 10000 }).catch(() => {});
    const join = body(f.posts, 'founder-card');
    ok(!!join && join.ref === 'ABCDEFGH', 'share-attribution: the friend\'s join carries ref ABCDEFGH (' + (join ? join.ref : 'no POST') + ')');
    ok(!/ABCDEFGH/.test(await storageDump(f.p)), 'share-attribution: the inviter\'s code is not kept in the friend\'s browser');
    for (const bad of ['?ref=REWARD15', '?ref=abcdefgh', '?ref=AAAAAAAA&ref=BBBBBBBB', '?ref=%3Cb%3Ex%3C%2Fb%3E']) {
      await f.p.evaluate(() => { localStorage.clear(); });
      await f.p.goto(URL + bad, { waitUntil: 'load', timeout: 120000 });
      await f.p.waitForFunction(() => window.PEP && PEP.status && PEP.status.hooks, null, { timeout: 60000 }).catch(() => {});
      ok(await f.p.evaluate(() => { const n = document.querySelector('#founder-card [data-invited]'); return !!n && n.hidden; }), 'share-attribution: ' + bad + ' is not a code: no invited line');
    }
    await f.c.close();
  });

  // FIX ROUND: bar-open-sheet. The open JOIN sheet folds away when another ask comes on screen.
  await section('PHONE BAR sheet folds', async () => { if (phone) {
    await fresh(page);
    const by = await freeY(page, '#founder-card');
    await page.evaluate(yy => window.scrollTo(0, yy), by);
    await page.waitForFunction(() => document.querySelector('[data-hooks-bar]').hasAttribute('data-on'), null, { timeout: 12000 }).catch(() => {});
    await page.click('[data-hooks-bar-open]');
    await page.waitForTimeout(500);
    const opened = await page.evaluate(() => !document.querySelector('[data-hooks-bar-sheet]').hidden);
    const target = await page.evaluate(() => {
      const y0 = scrollY, els = [...document.querySelectorAll('form[data-hook]')].filter(f => !f.closest('[data-module="hooks"]') && !f.closest('[data-module="cart"]') && !f.closest('[data-module="guide"]') && f.getClientRects().length)
        .concat([...document.querySelectorAll('[data-module="hooks"] [data-hooks-ask]')]);
      const tops = els.map(e => e.getBoundingClientRect().top + scrollY).filter(t => t > y0).sort((p, q) => p - q);
      return tops.length ? Math.round(tops[0]) : -1;
    });
    await page.evaluate(yy => window.scrollTo(0, yy), Math.max(0, target - vp.h + 300));
    await page.waitForTimeout(1200);
    const st = await page.evaluate(() => ({ sheet: !document.querySelector('[data-hooks-bar-sheet]').hidden, on: document.querySelector('[data-hooks-bar]').hasAttribute('data-on') }));
    ok(opened && target > 0 && !st.sheet && !st.on, 'bar-open-sheet: the open JOIN sheet folds away when the next ask comes on screen (opened ' + opened + ', sheet open after ' + st.sheet + ', bar on ' + st.on + ')');
  } });

  // PHONE BAR (H68): phones only
  await section('PHONE BAR flow', async () => {
  if (phone) {
    await fresh(page);
    const by = await freeY(page, '#founder-card');
    await page.evaluate(yy => window.scrollTo(0, yy), by);
    await page.waitForFunction(() => document.querySelector('[data-hooks-bar]').hasAttribute('data-on'), null, { timeout: 12000 }).catch(() => {});
    ok(await page.evaluate(() => document.querySelector('[data-hooks-bar]').hasAttribute('data-on')), 'PHONE BAR (H68): shows at a free scroll position on a phone');
    const bb = await page.evaluate(() => { const b = document.querySelector('[data-hooks-bar]').getBoundingClientRect(), g = document.querySelector('.pep-guide-launch'); const r = g && !g.hidden ? g.getBoundingClientRect() : null; return { overlap: !!(r && b.right > r.left && b.left < r.right && b.bottom > r.top && b.top < r.bottom), h: Math.round(b.height) }; });
    ok(!bb.overlap && bb.h <= 90, 'PHONE BAR: slim (' + bb.h + 'px) and clear of the guide\'s beacon');
    await page.click('[data-hooks-bar-open]');
    await page.waitForTimeout(500);
    await blockedThenDone({ label: 'PHONE BAR: JOIN THE FOUNDER CIRCLE (H68)', hook: 'H68', root: '[data-hooks-bar]', email: '[data-hooks-bar] [data-field="email"]', consent: '[data-hooks-bar] [data-consent="email"]', submit: '[data-hooks-bar] button[type="submit"]', done: '[data-hooks-bar] [data-step="done"]' });
    await page.click('[data-hooks-bar] [data-step="done"] [data-hooks-bar-close]');
    await page.waitForTimeout(800);
    ok(await page.evaluate(() => !document.querySelector('[data-hooks-bar]').hasAttribute('data-on')), 'PHONE BAR: gone for good once joined');
  }

  });

  // analytics carry ids only
  const dl = await page.evaluate(() => JSON.stringify(window.dataLayer || []));
  ok(!personal(dl), 'analytics (dataLayer) hold no email, name or number');
  ok(errors.length === 0, '0 page errors on ' + vp.tag + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  console.log('HOOKS check on ' + URL);
  const only = process.argv[3];                                   // optional: 'desktop' or 'phone'; default runs both
  for (const vp of [{ w: 1440, h: 900, tag: 'desktop' }, { w: 390, h: 844, tag: 'phone' }]) {
    if (only && only !== vp.tag) { continue; }
    try { await run(browser, vp); } catch (e) {
      fail++; fails.push(vp.tag + ' run stopped: ' + e.message.split('\n')[0]);
      console.log('  FAIL ' + vp.tag + ' run stopped: ' + e.message.split('\n')[0]);
    }
  }
  await browser.close();
  console.log('\nRESULT: ' + pass + ' passed, ' + fail + ' failed');
  if (fail) { console.log('FAILED: ' + fails.join(' || ')); }
  process.exit(fail ? 1 : 0);
})();

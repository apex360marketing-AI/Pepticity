// CARDS check (Jeff, Nov 13 2026). usage: node check.js <baseURL>
//   <baseURL>: the folder that holds new/ (e.g. http://localhost:8803/site/), the new/ folder itself, or new/index.html.
// Exact assertions for the CARDS work, at 1440x900 and 390x844:
//   THE LINEUP faster (per-case scroll and hold at most 40% of the measured original), one push = one case at once and
//   never swallowed, SKIP shown inside the showcase and absent outside it, SKIP lands on THE WHOLE LINEUP with one item
//   per case, an item opens that case's description, every product in the lineup and the shelf, the HIDE BEFORE LAUNCH
//   band on each flagged sku and on no other, a flagged product added to the cart shows its tag, 0 page errors.
// Timing is measured on Playwright's fake clock (performance.now and requestAnimationFrame), so a slow machine reads the
// same numbers as a fast one. Exit code 1 if any assertion fails.
const { chromium } = require('playwright');

const BASE = process.argv[2] || '';
const PAGE = /\.html?$/.test(BASE) ? BASE : BASE.replace(/\/?$/, '/') + (/\/new\/?$/.test(BASE) ? '' : 'new/') + 'index.html';
// measured on the untouched base (tools/measure.js, same method): scroll px per case, ms from one push to the next
const ORIGINAL = { desktop: { perCase: 270, hold: 1400 }, phone: { perCase: 253, hold: 1410 } };
const FLAGGED = ['tirzepatide', 'tesamorelin', 'oxytocin', 'retatrutide', 'pt-141', 'thymosin-alpha-1', 'semax', 'selank', 'igf-1-lr3', 'blend-contents-tbc'];
const BAND = 'HIDE BEFORE LAUNCH';
const VIEWS = {
  desktop: { viewport: { width: 1440, height: 900 } },
  phone: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
};

const results = [];
function rec(view, name, pass, detail) {
  results.push({ view, name, pass: !!pass, detail });
  console.log(`${pass ? 'PASS' : 'FAIL'}  [${view}] ${name}${detail !== undefined ? '  -> ' + detail : ''}`);
}
async function test(view, name, fn) {
  try { const r = await fn(); rec(view, name, r.pass, r.detail); } catch (e) { rec(view, name, false, 'error: ' + String(e.message || e).split('\n')[0].slice(0, 160)); }
}
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function openPage(browser, view, errors, extra) {
  const ctx = await browser.newContext(Object.assign({}, VIEWS[view], extra && extra.ctx));
  await ctx.addInitScript(() => { try { sessionStorage.setItem('pep_entrance_seen', '1'); localStorage.clear(); } catch (e) {} });
  if (extra && extra.route) { await ctx.route(extra.route.match, extra.route.handler); }
  const page = await ctx.newPage();
  page.on('pageerror', e => errors.push(String(e.message || e).slice(0, 200)));
  if (extra && extra.clock) { await page.clock.install(); }
  await page.goto(PAGE, { waitUntil: 'load', timeout: 90000 });
  return { ctx, page };
}
async function pause(page) {
  for (let k = 0; k < 5; k++) {
    try { await page.clock.pauseAt(await page.evaluate(() => Date.now() + 1500)); return; } catch (e) { if (k === 4) { throw e; } }
  }
}
const stepAt = page => page.evaluate(() => Number(document.getElementById('lineup').getAttribute('data-step')));
const press = page => page.evaluate(() => document.querySelector('#lineup [data-next]').click());
const trackTop = page => page.evaluate(() => { const r = document.getElementById('lineup'); const t = r.querySelector('[data-track]') || r; return Math.round(t.getBoundingClientRect().top + scrollY); });

// one trackpad-like wheel event at the page's own (fake) time, on the stage
async function wheelBurst(page, deltas) {
  for (const dy of deltas) {
    await page.evaluate((d) => {
      const st = document.querySelector('#lineup [data-stage]');
      const ev = new WheelEvent('wheel', { deltaY: d, deltaMode: 0, bubbles: true, cancelable: true, clientX: innerWidth / 2, clientY: innerHeight / 2 });
      Object.defineProperty(ev, 'timeStamp', { value: performance.now() });
      st.dispatchEvent(ev);
    }, dy);
    await page.clock.runFor(16);
  }
}
const coast = (from, n) => { const out = []; let v = from; while (v >= 1 && out.length < (n || 1e9)) { v *= 0.94; out.push(Math.round(v * 10) / 10); } return out; };

async function timingChecks(browser, view, errors) {
  const { ctx, page } = await openPage(browser, view, errors, { clock: true });
  try {
    await page.waitForSelector('#lineup[data-state="ready"][data-logo-on]', { state: 'attached', timeout: 30000 });
    await pause(page);
    const info = await page.evaluate(async () => {
      const cat = await (await fetch('assets/catalogue.json')).json();
      const q = s => document.querySelector(s);
      return {
        skus: cat.products.filter(p => p && p.sku && p.name).map(p => String(p.sku)),
        cases: [...document.querySelectorAll('#lineup .vc')].map(li => li.getAttribute('data-sku')),
        items: [...document.querySelectorAll('#lineup-all [data-item]')].map(b => b.closest('li').getAttribute('data-sku')),
        hidden: window.PEP_CONFIG.hidden, flagged: window.PEP_CONFIG.flagged,
        total: q('#lineup [data-total]') && q('#lineup [data-total]').textContent.trim(),
        allN: q('#lineup-all [data-all-n]') && q('#lineup-all [data-all-n]').textContent.trim()
      };
    });
    await test(view, 'config: hidden is an empty list', () => ({ pass: same(info.hidden, []), detail: JSON.stringify(info.hidden) }));
    await test(view, 'config: flagged holds the ten skus, in order', () => ({ pass: same(info.flagged, FLAGGED), detail: JSON.stringify(info.flagged) }));
    await test(view, 'lineup: one case per catalogue product (28), in catalogue order', () => ({ pass: info.cases.length === 28 && same(info.cases, info.skus), detail: `${info.cases.length} cases, catalogue ${info.skus.length}` }));
    await test(view, 'lineup counter reads 28', () => ({ pass: info.total === '28', detail: info.total }));
    await test(view, 'THE WHOLE LINEUP: one item per case, same order, count line 28', () => ({ pass: info.items.length === info.cases.length && same(info.items, info.cases) && info.allN === '28', detail: `${info.items.length} items, count "${info.allN}"` }));

    // ---- per-case scroll distance and hold, through the stage's own "next" control
    await page.evaluate(y => scrollTo(0, y), await trackTop(page));
    await page.clock.runFor(1500);
    await press(page); await page.clock.runFor(3000);                     // opening picture -> case 1
    const y1 = await page.evaluate(() => scrollY), s1 = await stepAt(page);
    await press(page); await page.clock.runFor(3000);                     // case 1 -> case 2
    const y2 = await page.evaluate(() => scrollY), s2 = await stepAt(page);
    const per = y2 - y1, lim = ORIGINAL[view].perCase * 0.4;
    await test(view, `per-case scroll distance <= 40% of the original ${ORIGINAL[view].perCase}px (<= ${lim.toFixed(1)}px)`, () => ({ pass: s2 === s1 + 1 && per > 0 && per <= lim, detail: `${per}px (steps ${s1}->${s2})` }));
    await page.evaluate(() => { const b = document.querySelector('#lineup [data-next]'); b.click(); b.click(); });
    let hold = null;
    for (let t = 10; t <= 4000; t += 10) { await page.clock.runFor(10); if ((await stepAt(page)) === s2 + 2) { hold = t; break; } }
    const hlim = ORIGINAL[view].hold * 0.4;
    await test(view, `hold per case <= 40% of the original ${ORIGINAL[view].hold}ms (<= ${hlim}ms), the stop still there`, () => ({ pass: hold !== null && hold <= hlim && hold >= 150, detail: hold === null ? 'second press never ran' : `${hold}ms` }));
    await page.clock.runFor(1500);

    // ---- one push, one case, at once, never swallowed (trackpad-like bursts: a swipe, then its coasting tail)
    const s0 = await stepAt(page);
    const A = [3, 8, 16, 28, 40, 46, 44].concat(coast(44));
    await wheelBurst(page, A.slice(0, 3));
    const sA0 = await stepAt(page);
    await wheelBurst(page, A.slice(3));
    await page.clock.runFor(400);
    const sA = await stepAt(page);
    await test(view, 'one wheel burst (a swipe and its whole coasting tail) advances exactly one case', () => ({ pass: sA === s0 + 1, detail: `${s0} -> ${sA} (${A.length} events)` }));
    await test(view, 'the burst moves the case at once (within its first 3 events, 48 ms)', () => ({ pass: sA0 === s0 + 1, detail: `step after 3 events: ${sA0}` }));
    const B = [2, 5, 12, 24, 38, 50, 48].concat(coast(48, 30));
    const C = [3, 7, 15, 30, 48, 60, 55];
    await wheelBurst(page, B);
    const sB = await stepAt(page);
    await wheelBurst(page, C.slice(0, 5));
    const sC0 = await stepAt(page);
    await test(view, 'a second swipe made while the first still coasts is not swallowed: it moves one case at once', () => ({ pass: sB === s0 + 2 && sC0 === s0 + 3, detail: `after swipe 2: ${sB}, swipe 3 (begun in its tail) after 5 events: ${sC0}` }));
    const E = [3, 7, 15, 30, 45, 52].concat(coast(52));
    await wheelBurst(page, C.slice(5).concat(coast(55, 7)));
    await wheelBurst(page, E);                                            // begins while that case is still sliding
    await page.clock.runFor(700);
    const sE = await stepAt(page);
    await test(view, 'a swipe made while a case is still sliding is remembered and carried out after the short stop', () => ({ pass: sE === s0 + 4, detail: `${sE} (expected ${s0 + 4})` }));
    await page.clock.runFor(700);
    const sM = await stepAt(page);
    await wheelBurst(page, [100]);                                        // one mouse-wheel notch after a pause
    await page.clock.runFor(700);
    const sN = await stepAt(page);
    await page.clock.runFor(1500);
    const sEnd = await stepAt(page);
    await test(view, 'one mouse-wheel notch advances exactly one case, and nothing moves on afterwards', () => ({ pass: sN === sM + 1 && sEnd === sN, detail: `${sM} -> ${sN}, then ${sEnd}` }));
  } finally { await ctx.close(); }
}

async function calmCheck(browser, view, errors) {
  const { ctx, page } = await openPage(browser, view, errors, { clock: true, ctx: { reducedMotion: 'reduce' } });
  try {
    await page.waitForSelector('#lineup[data-state="ready"]', { state: 'attached', timeout: 30000 });
    await pause(page);
    await page.evaluate(y => scrollTo(0, y), await trackTop(page));
    await page.clock.runFor(1500);
    const a = await stepAt(page);
    await press(page); await page.clock.runFor(1200);
    const b = await stepAt(page);
    const calm = await page.evaluate(() => document.getElementById('lineup').hasAttribute('data-calm'));
    await test(view, 'less motion asked for: the calm stage (fades, no slide) still moves one case per push', () => ({ pass: calm && b === a + 1, detail: `data-calm=${calm}, ${a} -> ${b}` }));
  } finally { await ctx.close(); }
}

async function uiChecks(browser, view, errors) {
  const { ctx, page } = await openPage(browser, view, errors);
  const wait = ms => page.waitForTimeout(ms);
  try {
    await page.waitForSelector('#lineup[data-state="ready"][data-logo-on]', { state: 'attached', timeout: 30000 });
    await wait(1500);
    const T = await trackTop(page);
    const skipState = () => page.evaluate(() => {
      const s = document.querySelector('#lineup [data-skip]'), root = document.getElementById('lineup');
      if (!s) { return { exists: false }; }
      const cs = getComputedStyle(s), r = s.getBoundingClientRect();
      const hit = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
      return { exists: true, op: cs.opacity, pe: cs.pointerEvents, vis: cs.visibility, h: Math.round(r.height), w: Math.round(r.width),
        inView: r.top >= 0 && r.bottom <= innerHeight && r.left >= 0 && r.right <= innerWidth, hit: !!hit && s.contains(hit), pinned: root.hasAttribute('data-pinned'),
        text: s.textContent.replace(/\s+/g, ' ').trim() };
    });
    const shown = s => s.exists && s.op === '1' && s.pe !== 'none' && s.vis === 'visible' && s.inView && s.hit && s.h >= 44 && s.w >= 44;
    const gone = s => !s.exists || s.op === '0' || s.vis === 'hidden' || s.pe === 'none';
    // walk the stage to step k with its own back / on controls, waiting on the stage itself (this machine paints slowly)
    const stepTo = async (k) => {
      for (let guard = 0; guard < 40; guard++) {
        const s = await stepAt(page);
        if (s === k) { break; }
        await page.evaluate(d => document.querySelector(d > 0 ? '#lineup [data-next]' : '#lineup [data-prev]').click(), k - s);
        await page.waitForFunction(prev => Number(document.getElementById('lineup').getAttribute('data-step')) !== prev, s, { timeout: 8000 }).catch(() => {});
      }
      await page.waitForFunction(k2 => { const li = document.querySelectorAll('#lineup .vc')[k2 - 1]; return k2 < 1 || (!!li && li.hasAttribute('data-face')); }, k, { timeout: 8000 }).catch(() => {});
      await wait(900);
    };
    const enterStage = async () => { await page.evaluate(y => scrollTo(0, y), T); await wait(1200); await stepTo(1); };

    await page.evaluate(y => scrollTo(0, Math.max(0, y - innerHeight)), T); await wait(900);
    const above = await skipState();
    await test(view, 'SKIP absent before the showcase', () => ({ pass: above.exists && gone(above) && !above.pinned, detail: JSON.stringify({ op: above.op, pe: above.pe, pinned: above.pinned }) }));
    await enterStage();
    const inside = await skipState();
    await test(view, 'SKIP visible inside the showcase: shown, on screen, not covered, at least 44px, says SKIP', () => ({ pass: shown(inside) && inside.pinned && /^SKIP\b/.test(inside.text), detail: JSON.stringify(inside) }));
    await test(view, 'SKIP is keyboard reachable', () => page.evaluate(() => { const s = document.querySelector('#lineup [data-skip]'); if (!s) { return { pass: false, detail: 'no SKIP' }; } s.focus(); return { pass: document.activeElement === s && s.tabIndex >= 0, detail: `tabIndex ${s.tabIndex}` }; }));
    await page.evaluate(() => document.activeElement && document.activeElement.blur());

    // the watermark on the stage: a flagged case facing (case 1) shows it, an unflagged one (case 4) does not
    const face = () => page.evaluate((band) => {
      const li = document.querySelector('#lineup .vc[data-face]');
      if (!li) { return { sku: null }; }
      const wm = li.querySelector('.pep-lineup-front [data-wm]'), r = wm && wm.getBoundingClientRect();
      return { sku: li.getAttribute('data-sku'), flag: li.hasAttribute('data-flagged'), band: !!wm && !wm.hidden && r.width > 60 && r.height >= 20 && wm.textContent.trim() === band };
    }, BAND);
    const f1 = await face();
    await test(view, 'a flagged case facing you carries the band (case 1)', () => ({ pass: f1.sku === 'tirzepatide' && f1.flag && f1.band, detail: JSON.stringify(f1) }));
    await stepTo(4);
    const f4 = await face();
    await test(view, 'an unflagged case facing you has no band (case 4)', () => ({ pass: f4.sku === 'aod-9604' && !f4.flag && !f4.band, detail: JSON.stringify(f4) }));
    const marks = await page.evaluate((list) => {
      const bad = [];
      document.querySelectorAll('#lineup .vc').forEach(li => {
        const sku = li.getAttribute('data-sku'), want = list.indexOf(sku) >= 0;
        const wms = li.querySelectorAll('[data-wm]'), on = [...wms].filter(w => !w.hidden).length;
        if (want !== li.hasAttribute('data-flagged') || (want ? on !== 2 : on !== 0) || wms.length !== 2) { bad.push(sku); }
      });
      return { bad, n: document.querySelectorAll('#lineup .vc[data-flagged]').length };
    }, FLAGGED);
    await test(view, 'every flagged case has the band on its front and its description, no other case has it', () => ({ pass: marks.n === 10 && !marks.bad.length, detail: `${marks.n} flagged cases; wrong: ${JSON.stringify(marks.bad)}` }));

    // the description view on the stage: a flagged case shows the band on its back
    await stepTo(1);
    await page.evaluate(() => document.querySelector('#lineup .vc[data-face] [data-more]').click());
    await page.waitForSelector('#lineup .vc[data-open]', { state: 'attached', timeout: 8000 }).catch(() => {});
    await wait(800);
    const back = await page.evaluate((band) => {
      const li = document.querySelector('#lineup .vc[data-open]'), wm = li && li.querySelector('[data-detail] [data-wm]'), r = wm && wm.getBoundingClientRect();
      return { open: !!li, sku: li && li.getAttribute('data-sku'), band: !!wm && !wm.hidden && r.width > 60 && r.height >= 20 && wm.textContent.trim() === band };
    }, BAND);
    await test(view, 'the description of a flagged case carries the band', () => ({ pass: back.open && back.sku === 'tirzepatide' && back.band, detail: JSON.stringify(back) }));
    await page.keyboard.press('Escape'); await wait(800);

    // a flagged product into the cart: the line carries the tag
    await page.evaluate(() => document.querySelector('#lineup .vc[data-face] [data-add]').click());
    await page.waitForSelector('[data-module="cart"] [data-line="tirzepatide-15mg"]', { state: 'attached', timeout: 8000 }).catch(() => {});
    await wait(900);
    const line = await page.evaluate((band) => {
      const li = document.querySelector('[data-module="cart"] [data-line="tirzepatide-15mg"]');
      const tag = li && li.querySelector('[data-line-flag]'), r = tag && tag.getBoundingClientRect();
      return { line: !!li, flagged: !!li && li.hasAttribute('data-flagged'), tag: !!tag && !tag.hidden && r.height > 0 && tag.textContent.trim() === band,
        open: document.querySelector('[data-module="cart"]').hasAttribute('data-open') };
    }, BAND);
    await test(view, 'a flagged product can be added to the cart and its line shows the HIDE BEFORE LAUNCH tag', () => ({ pass: line.open && line.line && line.flagged && line.tag, detail: JSON.stringify(line) }));
    await page.keyboard.press('Escape'); await wait(900);

    // SKIP: to THE WHOLE LINEUP, the keyboard on its heading
    await enterStage();
    let clicked = true;
    try { await page.click('#lineup [data-skip]', { timeout: 6000 }); } catch (e) { clicked = false; }
    if (clicked) { await page.waitForFunction(() => document.activeElement && document.activeElement.id === 'pep-lineup-all-title', null, { timeout: 8000 }).catch(() => {}); }
    await wait(900);
    const land = await page.evaluate(() => {
      const head = document.getElementById('pep-lineup-all-title'), r = head && head.getBoundingClientRect();
      const n = document.querySelectorAll('#lineup .vc').length, items = document.querySelectorAll('#lineup-all [data-item]').length;
      return { head: !!head, top: r && Math.round(r.top), inView: !!r && r.top >= 0 && r.top < innerHeight * 0.5, focus: document.activeElement === head, n, items,
        pinned: document.getElementById('lineup').hasAttribute('data-pinned') };
    });
    await test(view, 'after SKIP the list is in view, has one item per case, and the keyboard is on its heading', () => ({ pass: clicked && land.head && land.inView && land.focus && land.items === land.n && land.n === 28 && !land.pinned, detail: (clicked ? '' : 'SKIP could not be clicked; ') + JSON.stringify(land) }));
    if (!clicked) { await page.evaluate(() => { const a = document.getElementById('lineup-all'); scrollTo(0, a ? a.getBoundingClientRect().top + scrollY : document.documentElement.scrollHeight); }); await wait(900); }
    const after = await skipState();
    await test(view, 'SKIP absent outside the showcase (at the list)', () => ({ pass: gone(after) && !after.pinned, detail: JSON.stringify({ op: after.op, pe: after.pe, pinned: after.pinned }) }));
    const itemMarks = await page.evaluate((list) => {
      const bad = [];
      document.querySelectorAll('#lineup-all .pep-lineup-item').forEach(li => {
        const sku = li.getAttribute('data-sku'), want = list.indexOf(sku) >= 0, wm = li.querySelector('[data-wm]');
        if (want !== li.hasAttribute('data-flagged') || !wm || wm.hidden === want) { bad.push(sku); }
      });
      return bad;
    }, FLAGGED);
    await test(view, 'the list: each flagged item shows the band, no other item does', () => ({ pass: !itemMarks.length, detail: JSON.stringify(itemMarks) }));

    // an item opens that case's description (the back of its glass case), right under it; a second item takes its place
    const openItem = async (sku) => {
      try { await page.click(`#lineup-all .pep-lineup-item[data-sku="${sku}"] [data-item]`, { timeout: 6000 }); } catch (e) { return { view: false, detail: 'no item for ' + sku }; }
      await wait(900);
      return page.evaluate((args) => {
        const [s, band] = args;
        const li = document.querySelector(`#lineup-all .pep-lineup-item[data-sku="${s}"]`), view = li && li.nextElementSibling;
        const det = view && view.querySelector('[data-detail]'), name = det && det.querySelector('[data-d-name]'), wm = det && det.querySelector('[data-wm]');
        const r = det && det.getBoundingClientRect();
        return { view: !!view && view.matches('.pep-lineup-view') && view.getAttribute('data-sku') === s, shown: !!det && !det.hidden && r.height > 80,
          name: name && name.textContent.trim(), item: li && li.querySelector('[data-i-name]').textContent.trim(),
          expanded: li && li.querySelector('[data-item]').getAttribute('aria-expanded'), band: !!wm && !wm.hidden && wm.textContent.trim() === band,
          views: document.querySelectorAll('#lineup-all .pep-lineup-view').length, adds: view ? view.querySelectorAll('.pep-lineup-add').length : 0 };
      }, [sku, BAND]);
    };
    const v1 = await openItem('retatrutide');
    await test(view, 'clicking an item opens that case\'s description under it (flagged: with the band)', () => ({ pass: v1.view && v1.shown && v1.name === v1.item && v1.name === 'RETATRUTIDE' && v1.expanded === 'true' && v1.band && v1.views === 1 && v1.adds === 3, detail: JSON.stringify(v1) }));
    const v2 = await openItem('aod-9604');
    await test(view, 'another item opens its own description in its place (unflagged: no band)', () => ({ pass: v2.view && v2.shown && v2.name === 'AOD-9604' && !v2.band && v2.views === 1 && v2.adds === 1, detail: JSON.stringify(v2) }));
    // its own ADD TO CART works; an unflagged line has no tag
    let added = true;
    try { await page.click('#lineup-all .pep-lineup-view .pep-lineup-add', { timeout: 6000 }); } catch (e) { added = false; }
    await wait(1500);
    const plain = await page.evaluate(() => { const li = document.querySelector('[data-module="cart"] [data-line="aod-9604-5mg"]'), t = li && li.querySelector('[data-line-flag]'); return { line: !!li, tag: !!t && !t.hidden, flagged: !!li && li.hasAttribute('data-flagged') }; });
    await test(view, 'ADD TO CART from the list works; an unflagged cart line has no tag', () => ({ pass: added && plain.line && !plain.tag && !plain.flagged, detail: JSON.stringify(plain) }));
    await page.keyboard.press('Escape'); await wait(900);
    try { await page.click('#lineup-all .pep-lineup-view [data-x]', { timeout: 6000 }); } catch (e) { /* no description open: the next assertion says so */ }
    await wait(500);
    const closed = await page.evaluate(() => ({ views: document.querySelectorAll('#lineup-all .pep-lineup-view').length, focus: document.activeElement && document.activeElement.closest('.pep-lineup-item') ? document.activeElement.closest('.pep-lineup-item').getAttribute('data-sku') : null }));
    await test(view, 'the description closes with its X and the keyboard returns to its item', () => ({ pass: closed.views === 0 && closed.focus === 'aod-9604', detail: JSON.stringify(closed) }));
  } finally { await ctx.close(); }
}

async function shelfCheck(browser, view, errors) {
  // the shelf list runs only when its root says data-relist="on" (the vial capture tool's switch): turned on here
  const route = { match: /\/index\.html(\?.*)?$/, handler: async (r) => { const res = await r.fetch(); const body = (await res.text()).replace('data-module="shelf" id="shelf" aria-label="THE SHELF" data-relist="off"', 'data-module="shelf" id="shelf" aria-label="THE SHELF" data-relist="on"'); await r.fulfill({ response: res, body }); } };
  const { ctx, page } = await openPage(browser, view, errors, { route });
  try {
    await page.waitForSelector('#shelf[data-state="ready"]', { state: 'attached', timeout: 30000 });
    const s = await page.evaluate((list) => {
      const items = [...document.querySelectorAll('#shelf .pep-shelf-item')];
      const all = document.querySelector('#shelf [data-family="ALL"] [data-count]');
      const wrong = items.filter(li => { const sku = li.hasAttribute('data-flagged'), wm = li.querySelector('[data-slat-wm]'); return !wm || wm.hidden === sku; }).length;
      return { n: items.length, all: all && all.textContent.trim(), flagged: items.filter(li => li.hasAttribute('data-flagged')).length, wrong };
    }, FLAGGED);
    await test(view, 'the shelf lists every product (28, ALL 28) and tags the ten flagged ones', () => ({ pass: s.n === 28 && s.all === '28' && s.flagged === 10 && s.wrong === 0, detail: JSON.stringify(s) }));
  } finally { await ctx.close(); }
}

(async () => {
  if (!BASE) { console.error('usage: node check.js <baseURL>'); process.exit(2); }
  console.log('CARDS check on ' + PAGE);
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const view of Object.keys(VIEWS)) {
    const errors = [];
    for (const step of [timingChecks, calmCheck, uiChecks, shelfCheck]) {
      try { await step(browser, view, errors); } catch (e) { rec(view, step.name + ' could not run', false, String(e.message || e).split('\n')[0].slice(0, 160)); }
    }
    rec(view, `0 page errors (${view === 'desktop' ? '1440x900' : '390x844'})`, errors.length === 0, errors.length ? errors.slice(0, 3).join(' | ') : '0');
  }
  await browser.close();
  const failed = results.filter(r => !r.pass);
  console.log(`\n${results.length - failed.length} passed, ${failed.length} failed`);
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });

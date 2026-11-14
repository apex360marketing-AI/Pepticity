// GUIDE check (module 40-guide). Usage: node check.js BASE_URL
//   BASE_URL is the page (…/index.html) or its folder (…/new/ -> index.html is added).
// The config is patched the way the CARDS change does it (hidden emptied, the same skus moved to flagged), or with no
// flagged list at all, so the HIDE BEFORE LAUNCH tag is tested both ways on any build.
const { chromium } = require('playwright');

let url = process.argv[2] || 'http://localhost:8804/new/index.html';
if (url.endsWith('/')) url += 'index.html';
const LAUNCH_ARGS = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'];
const BLUE = [42, 120, 255];
const CORE = [207, 230, 255];
const results = [];

function check(name, ok, detail) {
  results.push({ name, ok: !!ok });
  console.log((ok ? 'PASS ' : 'FAIL ') + name + (detail !== undefined ? '   [' + detail + ']' : ''));
}
const r1 = v => Math.round(v * 10) / 10;

async function newPage(browser, viewport, mode, reduced) {
  const ctx = await browser.newContext({ viewport, reducedMotion: reduced ? 'reduce' : 'no-preference' });
  await ctx.addInitScript(m => {
    try { sessionStorage.setItem('pep_entrance_seen', '1'); } catch (e) { /* private mode */ }
    let v;
    Object.defineProperty(window, 'PEP_CONFIG', {
      configurable: true,
      enumerable: true,
      get() { return v; },
      set(nv) {
        if (nv && typeof nv === 'object') {
          const was = Array.isArray(nv.hidden) ? nv.hidden.slice() : [];
          if (m === 'flagged') { if (!Array.isArray(nv.flagged) || !nv.flagged.length) { nv.flagged = was; } nv.hidden = []; }
          if (m === 'none') { delete nv.flagged; nv.hidden = []; }
        }
        v = nv;
      }
    });
  }, mode);
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  await page.goto(url, { waitUntil: 'load', timeout: 90000 });
  await page.waitForSelector('[data-module="guide"] [data-launch]:not([hidden])', { timeout: 30000 });
  await page.waitForTimeout(4000);
  await page.mouse.move(3, 3);
  return { ctx, page, errors };
}

const geo = page => page.evaluate(() => {
  const root = document.querySelector('[data-module="guide"]');
  const box = el => { const r = el.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height, r: r.right, b: r.bottom }; };
  return {
    open: root.hasAttribute('data-open'),
    bar: box(root.querySelector('[data-launch]')),
    icon: box(root.querySelector('[data-guide-icon]')),
    panel: box(root.querySelector('[data-panel]')),
    panelHidden: root.querySelector('[data-panel]').hidden,
    vw: innerWidth,
    vh: innerHeight
  };
});

async function openGuide(page) {
  await page.click('[data-module="guide"] [data-launch]');
  await page.mouse.move(3, 3);
  await page.waitForTimeout(1100);
}

// pixels of a screenshot region, read back through a canvas in a blank page
async function pixels(browser, png) {
  const p = await browser.newPage();
  const data = await p.evaluate(async b64 => {
    const img = new Image();
    img.src = 'data:image/png;base64,' + b64;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.width; c.height = img.height;
    const g = c.getContext('2d');
    g.drawImage(img, 0, 0);
    return { w: img.width, h: img.height, d: Array.from(g.getImageData(0, 0, img.width, img.height).data) };
  }, png.toString('base64'));
  await p.close();
  return data;
}
function classify(px) {
  let lit = 0, warm = 0, offBlue = 0, total = 0;
  for (let i = 0; i < px.d.length; i += 4) {
    const r = px.d[i], g = px.d[i + 1], b = px.d[i + 2];
    total++;
    if (r - b >= 18 && r >= 70) { warm++; }
    if (b - r >= 40) {
      const k = (g - r) / (b - r);            // the logo blue and its blends with neutrals sit near .37, its hot core near .48
      if (k < 0.2 || k > 0.7) { offBlue++; } else if (b >= 180) { lit++; }
    }
  }
  return { lit, warm, offBlue, total };
}

// colours used by the guide's own elements (and their ::before / ::after): only neutrals, the logo blue and its hot core
const colourAudit = page => page.evaluate(({ BLUE, CORE }) => {
  const root = document.querySelector('[data-module="guide"]');
  const props = ['color', 'backgroundColor', 'backgroundImage', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor',
    'boxShadow', 'textShadow', 'filter', 'outlineColor', 'webkitTextFillColor', 'textDecorationColor'];
  const near = (c, t) => Math.abs(c[0] - t[0]) <= 3 && Math.abs(c[1] - t[1]) <= 3 && Math.abs(c[2] - t[2]) <= 3;
  const bad = [];
  let seen = 0;
  const scan = (s, where) => {
    props.forEach(p => {
      const v = s[p];
      if (!v || v === 'none') { return; }
      const found = [];
      v.replace(/rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:[,\s/]+([\d.]+))?\s*\)/g, (m, r, g, b, a) => { found.push([+r, +g, +b, a === undefined ? 1 : +a]); return m; });
      v.replace(/color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.]+))?\)/g, (m, r, g, b, a) => { found.push([r * 255, g * 255, b * 255, a === undefined ? 1 : +a]); return m; });
      if (/\b(ok)?(lab|lch)\(|hsla?\(|hwb\(/.test(v)) { bad.push(where + ' ' + p + ' unparsed ' + v.slice(0, 60)); }
      found.forEach(c => {
        if (c[3] === 0) { return; }
        seen++;
        const span = Math.max(c[0], c[1], c[2]) - Math.min(c[0], c[1], c[2]);
        if (span <= 14 || near(c, BLUE) || near(c, CORE)) { return; }
        bad.push(where + ' ' + p + ' rgb(' + c.slice(0, 3).map(Math.round).join(',') + ')');
      });
    });
  };
  [root].concat(Array.from(root.querySelectorAll('*'))).forEach(el => {
    if (el.closest('template')) { return; }
    const tag = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.split(' ')[0] : '');
    scan(getComputedStyle(el), tag);
    scan(getComputedStyle(el, '::before'), tag + '::before');
    scan(getComputedStyle(el, '::after'), tag + '::after');
  });
  return { bad, seen };
}, { BLUE, CORE });

// with the window out, the window itself takes every click on its controls and along its edge beside the bar
const hits = page => page.evaluate(() => {
  const P = document.querySelector('[data-module="guide"] [data-panel]');
  const r = P.getBoundingClientRect(), pts = [];
  ['[data-close]', '.pep-guide-send', '[data-input]'].forEach(s => {
    const e = P.querySelector(s).getBoundingClientRect();
    pts.push([e.left + e.width / 2, e.top + e.height / 2, s], [e.right - 2, e.top + e.height / 2, s + ' right end']);
  });
  for (let y = r.top + 40; y < r.bottom - 30; y += 20) { pts.push([r.right - 3, y, 'edge']); }
  return pts.filter(p => { const el = document.elementFromPoint(p[0], p[1]); return !(el && P.contains(el)); }).map(p => p[2] + ' @' + Math.round(p[1]));
});

// words on show inside the guide: none in flat white; sizes and tap targets
const textAudit = page => page.evaluate(() => {
  const root = document.querySelector('[data-module="guide"]');
  const white = [], small = [], smallBody = [], shortTap = [];
  root.querySelectorAll('*').forEach(el => {
    if (el.closest('template') || !el.getClientRects().length) { return; }
    const own = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
    const s = getComputedStyle(el);
    if (own && s.visibility !== 'hidden' && el.className !== 'pep-guide-live') {
      const fill = s.webkitTextFillColor;
      const painted = fill && fill !== 'rgba(0, 0, 0, 0)' ? fill : null;
      if (painted === 'rgb(255, 255, 255)' || (!painted && fill !== 'rgba(0, 0, 0, 0)' && s.color === 'rgb(255, 255, 255)')) { white.push(el.className || el.tagName); }
      if (parseFloat(s.fontSize) < 12) { small.push((el.className || el.tagName) + ' ' + s.fontSize); }
      if (el.matches('.pep-guide-msg p:not(.pep-guide-who)') && parseFloat(s.fontSize) < 14) { smallBody.push(s.fontSize); }
    }
    if (el.matches('button, a[href], input') && el.closest('[data-panel]')) {
      const r = el.getBoundingClientRect();
      if (r.height < 44 - 0.01) { shortTap.push((el.className || el.tagName) + ' ' + Math.round(r.height)); }
    }
  });
  return { white, small, smallBody, shortTap };
});

async function ask(page, text) {
  await page.fill('[data-module="guide"] [data-input]', text);
  await page.press('[data-module="guide"] [data-input]', 'Enter');
  return page.evaluate(() => {
    const msgs = document.querySelectorAll('[data-module="guide"] .pep-guide-msg--guide');
    const last = msgs[msgs.length - 1];
    return {
      topic: last.getAttribute('data-topic'),
      blocks: Array.from(last.querySelectorAll('.pep-guide-product')).map(b => {
        const t = b.querySelector('.pep-guide-tag');
        return { name: (b.querySelector('.pep-guide-h') || {}).textContent || '', tag: t ? t.textContent : null, tagShown: !!(t && t.getClientRects().length) };
      })
    };
  });
}
const candidates = page => page.evaluate(async () => {
  const cfg = window.PEP_CONFIG || {};
  const flagged = (cfg.flagged || []).map(String);
  const d = await (await fetch('assets/catalogue.json')).json();
  const ok = p => p && typeof p.name === 'string' && p.name.indexOf('[') < 0 && String(p.family).toUpperCase() !== 'BLEND' &&
    Array.isArray(p.sizes) && p.sizes.some(s => s && s.priceCAD > 0);
  return {
    hasFlaggedList: Array.isArray(cfg.flagged),
    flagged: d.products.filter(p => ok(p) && flagged.indexOf(String(p.sku)) >= 0).map(p => p.name),
    plain: d.products.filter(p => ok(p) && flagged.indexOf(String(p.sku)) < 0).map(p => p.name)
  };
});
async function findProductAnswer(page, names) {
  for (const n of names.slice(0, 6)) {
    const a = await ask(page, n);
    const blk = a.blocks.find(b => b.name === n.toUpperCase());
    if (a.topic === 'product' && blk) { return { name: n, blk, all: a.blocks }; }
  }
  return null;
}

(async () => {
  const browser = await chromium.launch({ args: LAUNCH_ARGS });

  // ================= DESKTOP 1440 x 900 =================
  {
    const { ctx, page, errors } = await newPage(browser, { width: 1440, height: 900 }, 'flagged', false);
    await page.waitForSelector('[data-module="guide"][data-catalogue]', { timeout: 20000 });
    const rest = await geo(page);
    check('desktop: bar at rest is at least 69 x 258 px', rest.bar.w >= 69 && rest.bar.h >= 258, r1(rest.bar.w) + ' x ' + r1(rest.bar.h));
    check('desktop: beacon icon is at least 40 px wide', rest.icon.w >= 40, r1(rest.icon.w));

    const gap = await page.evaluate(() => {
      const root = document.querySelector('[data-module="guide"]');
      const g = root.querySelector('[data-guide-gap]');
      if (!g) { return null; }
      const s = getComputedStyle(g), a = getComputedStyle(g, '::after'), b = getComputedStyle(g, '::before');
      const ri = root.querySelector('[data-guide-icon]').getBoundingClientRect(), rg = g.getBoundingClientRect();
      return { after: a.backgroundImage, before: b.backgroundImage, anim: s.animationName, dur: parseFloat(s.animationDuration), iter: s.animationIterationCount,
        centre: Math.abs((rg.left + rg.right) / 2 - (ri.left + ri.right) / 2), inside: rg.top >= ri.top && rg.bottom <= ri.bottom && rg.width > 0 && rg.height > ri.height * .6 };
    });
    check('desktop: gap light exists in the beacon', !!gap);
    check('desktop: gap light core uses rgb(42, 120, 255) with the hot core rgb(207, 230, 255)', !!gap && gap.after.includes('rgb(42, 120, 255)') && gap.after.includes('rgb(207, 230, 255)'), gap && gap.after.slice(0, 90));
    check('desktop: gap light slot fill uses rgba(42, 120, 255, a)', !!gap && /rgba?\(42, 120, 255/.test(gap.before), gap && gap.before.slice(0, 60));
    check('desktop: gap light sits on the beacon centre line and runs most of its height', !!gap && gap.centre <= 1 && gap.inside, gap && ('off ' + r1(gap.centre) + 'px'));
    check('desktop: gap light breathes slowly (named animation, >= 3 s, infinite)', !!gap && gap.anim === 'pep-guide-gap' && gap.dur >= 3 && gap.iter === 'infinite', gap && (gap.anim + ' ' + gap.dur + 's ' + gap.iter));

    // the rendered beacon: the slot lit in the logo blue, no gold and no violet or second blue anywhere on it
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(800);
    const ic = (await geo(page)).icon;
    const slot = { x: ic.x + ic.w * .5 - ic.w * .12, y: ic.y + ic.w * .9, width: ic.w * .24, height: ic.h - ic.w * 1.9 };
    const pxSlot = classify(await pixels(browser, await page.screenshot({ clip: slot, timeout: 90000 })));
    const pxIcon = classify(await pixels(browser, await page.screenshot({ clip: { x: ic.x, y: ic.y, width: ic.w, height: ic.h }, timeout: 90000 })));
    check('desktop: at least 60% of the centrepiece slot glows logo blue', pxSlot.lit / pxSlot.total >= 0.6, Math.round(100 * pxSlot.lit / pxSlot.total) + '% of ' + pxSlot.total);
    check('desktop: no gold or warm pixels on the beacon', pxIcon.warm === 0, pxIcon.warm + ' warm px');
    check('desktop: no violet, periwinkle or second-blue pixels on the beacon', pxIcon.offBlue <= 2, pxIcon.offBlue + ' off-blue px');

    const label = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('[data-module="guide"] .pep-guide-launch-label'));
      return { clip: s.webkitBackgroundClip || s.backgroundClip, img: s.backgroundImage, anim: s.animationName, size: parseFloat(s.fontSize) };
    });
    check('desktop: ASK THE GUIDE is chrome text with the blue light and a sheen', /^text(, text)*$/.test(label.clip) && label.img.includes('rgb(42, 120, 255)') && label.anim !== 'none', label.clip + ' / ' + label.anim);

    // opening: the bar never changes size while the window comes out, and the window only moves sideways
    const closedClip = await page.evaluate(() => getComputedStyle(document.querySelector('[data-module="guide"] [data-panel]')).clipPath);
    await page.click('[data-module="guide"] [data-launch]');
    const during = await page.evaluate(() => new Promise(res => {
      const L = document.querySelector('[data-module="guide"] [data-launch]');
      const hs = [], t0 = performance.now();
      const step = () => { hs.push(L.getBoundingClientRect().height); if (performance.now() - t0 < 800) { requestAnimationFrame(step); } else { res(hs); } };
      step();
    }));
    await page.mouse.move(3, 3);
    await page.waitForTimeout(900);
    const open = await geo(page);
    const openClip = await page.evaluate(() => getComputedStyle(document.querySelector('[data-module="guide"] [data-panel]')).clipPath);
    check('desktop: the bar keeps its height during the whole opening', Math.max(...during) - Math.min(...during) <= 1, during.length + ' frames, ' + r1(Math.min(...during)) + '-' + r1(Math.max(...during)));
    check('desktop: after opening the bar height is unchanged', open.open && Math.abs(open.bar.h - rest.bar.h) <= 1 && Math.abs(open.bar.w - rest.bar.w) <= 1, r1(rest.bar.h) + ' -> ' + r1(open.bar.h));
    check('desktop: window height equals the bar height (within 2 px)', Math.abs(open.panel.h - open.bar.h) <= 2, r1(open.panel.h) + ' vs ' + r1(open.bar.h));
    check('desktop: window top equals the bar top (within 2 px)', Math.abs(open.panel.y - open.bar.y) <= 2, r1(open.panel.y) + ' vs ' + r1(open.bar.y));
    check('desktop: window right edge is at or left of the bar left edge', open.panel.r <= open.bar.x + 0.01, r1(open.panel.r) + ' <= ' + r1(open.bar.x));
    const ys = c => { const m = /polygon\((.*)\)$/.exec(c); if (!m) { return null; } const pts = []; let depth = 0, cur = ''; for (const ch of m[1]) { if (ch === '(') { depth++; } if (ch === ')') { depth--; } if (ch === ',' && !depth) { pts.push(cur.trim()); cur = ''; } else { cur += ch; } } pts.push(cur.trim()); return pts.map(p => { let d = 0; for (let i = 0; i < p.length; i++) { if (p[i] === '(') { d++; } if (p[i] === ')') { d--; } if (p[i] === ' ' && !d) { return p.slice(i + 1); } } return ''; }); };
    const yc = ys(closedClip), yo = ys(openClip);
    check('desktop: the window opens sideways only (closed and open shapes share every y)', !!yc && !!yo && yc.length === yo.length && yc.every((y, i) => y === yo[i]) && closedClip !== openClip, yc && yc.join(' | '));
    const glass = await page.evaluate(() => {
      const s = getComputedStyle(document.querySelector('[data-module="guide"] [data-panel]'));
      return { bg: s.backgroundColor, img: s.backgroundImage, bf: s.backdropFilter || s.webkitBackdropFilter };
    });
    const alpha = (/rgba?\([^)]*?,\s*([\d.]+)\)$/.exec(glass.bg) || [0, glass.bg.startsWith('rgb(') ? 1 : NaN])[1];
    check('desktop: window background alpha is 0 and no fill image', Number(alpha) === 0 && glass.img === 'none', glass.bg + ' / ' + glass.img.slice(0, 40));
    check('desktop: window backdrop-filter has a blur', /blur\(\s*([1-9]\d*(\.\d+)?)px\)/.test(glass.bf), glass.bf);
    check('desktop: window inside the viewport', open.panel.x >= 0 && open.panel.y >= 0 && open.panel.r <= open.vw && open.panel.b <= open.vh);
    const hd = await hits(page);
    check('desktop: nothing of the bar lies over the open window (CLOSE, ASK, field and right edge take the clicks)', hd.length === 0, hd.slice(0, 4).join(', '));

    const heads = await page.evaluate(() => {
      const f = document.querySelector('[data-module="guide"] .pep-guide-face');
      const s = f ? getComputedStyle(f) : null;
      return s ? { clip: s.webkitBackgroundClip || s.backgroundClip, img: s.backgroundImage, anim: s.animationName, tr: s.transform } : null;
    });
    check('desktop: window title is chrome with the blue light and a sheen, and does not move', !!heads && /^text(, text)*$/.test(heads.clip) && heads.img.includes('rgb(42, 120, 255)') && heads.anim === 'pep-guide-shine' && heads.tr === 'none', heads && (heads.clip + ' / ' + heads.anim));

    // answers: a heading, a flagged product and a plain one
    await page.click('[data-module="guide"] [data-ask="shipping"]');
    const h3 = await page.evaluate(() => {
      const msgs = document.querySelectorAll('[data-module="guide"] .pep-guide-msg--guide');
      const h = msgs[msgs.length - 1].querySelector('.pep-guide-h');
      const s = h ? getComputedStyle(h) : null;
      return s ? { clip: s.webkitBackgroundClip || s.backgroundClip, img: s.backgroundImage, anim: s.animationName } : null;
    });
    check('desktop: answer headings are chrome with the blue light and a sheen', !!h3 && /^text(, text)*$/.test(h3.clip) && h3.img.includes('rgb(42, 120, 255)') && h3.anim === 'pep-guide-shine', h3 && h3.anim);
    const c = await candidates(page);
    const fl = await findProductAnswer(page, c.flagged);
    check('desktop: a flagged product answer shows HIDE BEFORE LAUNCH beside its name', !!fl && fl.blk.tag === 'HIDE BEFORE LAUNCH' && fl.blk.tagShown, fl ? fl.name.length + '-letter name, tag ' + fl.blk.tag : 'no flagged product answered (' + c.flagged.length + ' candidates)');
    // the guide glides the conversation to the answer: give it up to 6 s to arrive, then look
    await page.waitForFunction(() => {
      const S = document.querySelector('[data-module="guide"] [data-scroll]');
      const msgs = S.querySelectorAll('.pep-guide-msg--guide'), last = msgs[msgs.length - 1];
      const h = last.querySelector('.pep-guide-product .pep-guide-h') || last;
      const sr = S.getBoundingClientRect(), hr = h.getBoundingClientRect();
      return hr.top >= sr.top - 1 && hr.bottom <= sr.bottom + 1;
    }, null, { timeout: 6000, polling: 150 }).catch(() => null);
    const seen = await page.evaluate(() => {
      const S = document.querySelector('[data-module="guide"] [data-scroll]');
      const msgs = S.querySelectorAll('.pep-guide-msg--guide'), last = msgs[msgs.length - 1];
      const h = last.querySelector('.pep-guide-product .pep-guide-h') || last;
      const sr = S.getBoundingClientRect(), hr = h.getBoundingClientRect();
      return { ok: hr.top >= sr.top - 1 && hr.bottom <= sr.bottom + 1, at: Math.round(hr.top - sr.top), of: Math.round(sr.height) };
    });
    check('desktop: the latest answer is brought into view in the window (its product heading is visible)', seen.ok, 'heading at ' + seen.at + ' px of ' + seen.of);
    const pl = await findProductAnswer(page, c.plain);
    check('desktop: an unflagged product answer has no tag', !!pl && pl.blk.tag === null, pl ? 'tag ' + pl.blk.tag : 'no plain product answered');

    const txt = await textAudit(page);
    check('desktop: no flat white words in the guide', txt.white.length === 0, txt.white.slice(0, 4).join(', '));
    check('desktop: guide text is 12 px or larger, answers 14 px or larger', txt.small.length === 0 && txt.smallBody.length === 0, txt.small.concat(txt.smallBody).slice(0, 4).join(', '));
    check('desktop: every control in the window is at least 44 px tall', txt.shortTap.length === 0, txt.shortTap.slice(0, 4).join(', '));
    const col = await colourAudit(page);
    check('desktop: guide colours are neutrals, the logo blue and its hot core only (no violet, gold or second blue)', col.bad.length === 0 && col.seen > 50, col.bad.length ? col.bad.slice(0, 4).join(' ; ') : col.seen + ' colours checked');

    await page.keyboard.press('Escape');
    await page.waitForTimeout(900);
    const esc = await page.evaluate(() => {
      const root = document.querySelector('[data-module="guide"]'), L = root.querySelector('[data-launch]');
      return { open: root.hasAttribute('data-open'), hidden: root.querySelector('[data-panel]').hidden, exp: L.getAttribute('aria-expanded'), focus: document.activeElement === L, ring: getComputedStyle(L).boxShadow };
    });
    check('desktop: Escape closes the window', !esc.open && esc.hidden && esc.exp === 'false');
    check('desktop: keyboard focus back on the bar shows a bar of blue light at its foot', esc.focus && /rgb\(42, 120, 255\) 0px -3px 0px 0px inset/.test(esc.ring), esc.ring);
    await openGuide(page);
    await page.click('[data-module="guide"] [data-close]');
    await page.waitForTimeout(900);
    const cl = await geo(page);
    check('desktop: the CLOSE button closes the window', !cl.open && cl.panelHidden);
    check('desktop: 0 page errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ================= DESKTOP, no flagged list: no tag =================
  {
    const { ctx, page, errors } = await newPage(browser, { width: 1440, height: 900 }, 'none', false);
    await page.waitForSelector('[data-module="guide"][data-catalogue]', { timeout: 20000 });
    await openGuide(page);
    const c = await candidates(page);
    const names = (await page.evaluate(async () => (await (await fetch('assets/catalogue.json')).json()).products.filter(p => p.name.indexOf('[') < 0 && p.sizes && p.sizes.length).map(p => p.name)));
    let tags = 0, answered = 0;
    for (const n of names.slice(0, 8)) { const a = await ask(page, n); if (a.topic === 'product') { answered++; } tags += a.blocks.filter(b => b.tag !== null).length; }
    check('desktop: with no flagged list, product answers carry no tag', !c.hasFlaggedList && answered >= 3 && tags === 0, answered + ' answers, ' + tags + ' tags');
    check('desktop (no flagged list): 0 page errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ================= DESKTOP, reduced motion: the light holds still, nothing sweeps =================
  {
    const { ctx, page, errors } = await newPage(browser, { width: 1440, height: 900 }, 'flagged', true);
    await openGuide(page);
    const rm = await page.evaluate(() => {
      const root = document.querySelector('[data-module="guide"]');
      const a = el => el ? getComputedStyle(el).animationName : 'missing';
      const gapEl = root.querySelector('[data-guide-gap]');
      return { gap: a(gapEl), pool: getComputedStyle(root.querySelector('[data-launch]'), '::after').animationName,
        face: a(root.querySelector('.pep-guide-face')), label: a(root.querySelector('.pep-guide-launch-label')),
        gapOpacity: gapEl ? getComputedStyle(gapEl).opacity : 'missing' };
    });
    check('reduced motion: no breathing and no sheen', rm.gap === 'none' && rm.pool === 'none' && rm.face === 'none' && rm.label === 'none' && rm.gapOpacity === '1', JSON.stringify(rm));
    check('reduced motion: 0 page errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  // ================= PHONE 390 x 844 =================
  {
    const { ctx, page, errors } = await newPage(browser, { width: 390, height: 844 }, 'flagged', false);
    const rest = await geo(page);
    check('phone: bar at rest is at least 1.5x the old 30 x 138 and a 44 px target', rest.bar.w >= 45 && rest.bar.w >= 44 && rest.bar.h >= 207, r1(rest.bar.w) + ' x ' + r1(rest.bar.h));
    check('phone: beacon icon is at least 1.5x the old 27 px (40.5)', rest.icon.w >= 40.5, r1(rest.icon.w));
    await openGuide(page);
    const open = await geo(page);
    check('phone: window stays inside the viewport', open.open && open.panel.x >= 0 && open.panel.y >= 0 && open.panel.r <= open.vw && open.panel.b <= open.vh,
      r1(open.panel.x) + ',' + r1(open.panel.y) + ' to ' + r1(open.panel.r) + ',' + r1(open.panel.b));
    check('phone: bar height unchanged, window = bar height and top (2 px), left of the bar',
      Math.abs(open.bar.h - rest.bar.h) <= 1 && Math.abs(open.panel.h - open.bar.h) <= 2 && Math.abs(open.panel.y - open.bar.y) <= 2 && open.panel.r <= open.bar.x + 0.01,
      'bar ' + r1(open.bar.h) + ' window ' + r1(open.panel.h) + ' top ' + r1(open.panel.y) + '/' + r1(open.bar.y));
    const hp = await hits(page);
    check('phone: nothing of the bar lies over the open window', hp.length === 0, hp.slice(0, 4).join(', '));
    const txt = await textAudit(page);
    check('phone: no flat white, text 12 px+, controls 44 px+', txt.white.length === 0 && txt.small.length === 0 && txt.smallBody.length === 0 && txt.shortTap.length === 0,
      txt.white.concat(txt.small, txt.smallBody, txt.shortTap).slice(0, 4).join(', '));
    await page.keyboard.press('Escape');
    await page.waitForTimeout(900);
    const esc = await geo(page);
    check('phone: Escape closes the window', !esc.open && esc.panelHidden);
    await openGuide(page);
    await page.click('[data-module="guide"] [data-close]');
    await page.waitForTimeout(900);
    const cl = await geo(page);
    check('phone: the CLOSE button closes the window', !cl.open && cl.panelHidden);
    check('phone: 0 page errors', errors.length === 0, errors.join(' | '));
    await ctx.close();
  }

  await browser.close();
  const failed = results.filter(r => !r.ok);
  console.log('\n' + (results.length - failed.length) + ' passed, ' + failed.length + ' failed, ' + results.length + ' checks');
  process.exit(failed.length ? 1 : 0);
})().catch(e => { console.error('check.js crashed:', e); process.exit(2); });

#!/usr/bin/env node
/* PEPTICITY BRAND AUDIT (Tyson, Nov 14 2026: "I need something that holds the brand together").
   Opens a built page in real Chromium and checks that the brand is HELD, the same everywhere:
     ONE BLUE      every coloured light is the logo blue #2a78ff (its hue), nothing else
     ONE METAL     chrome / gunmetal; a second metal (pale gold) is reported
     CLEAR CARDS   every card is 0% fill and no blur: the background shows through it
     TYPE          only the PEPTICITY lettering and the plain text face; headings in the lettering
     NAME          the name is always PEPTICITY, in capitals
     SHAPES        chamfered corners, no pills (radius 3 px at most)
     GROUND        matte black quilt, no blue at rest, lights ONLY in a small circle at the pointer
     MENU          the header is the owner's pick, menu 58 (its real picture)
     PIXELS        no warm (yellow / orange) cast and no violet outside the menu, on the rendered page

   usage:  node tools/brand-audit.js [url]            default: the public store preview
           node tools/brand-audit.js http://127.0.0.1:8766/new/ --json
   exit:   0 = HELD, 1 = BROKEN (one or more FAIL), 2 = the audit could not run.
   The rules live in BRAND below. Change the brand there ONLY when the owner says so in so many words. */
'use strict';
const { chromium } = require('playwright');

const BRAND = {
  blue: [42, 120, 255],               // #2a78ff, the logo light. The only blue.
  blueHue: [204, 230],                // degrees: every coloured light sits on this hue (the logo blue is 218)
  vividTolerance: 8,                  // a full-strength blue must be the logo blue itself, per channel
  goldHue: [22, 62],                  // the approved pale chrome gold ramp sits here; reported as a second metal
  fonts: ['PepticityBlack', 'system-ui'],
  // the lettering has A-Z, 0-9, dash and full stop only. Two places are set whole in its fall-through face on purpose:
  // the small print on the bottle's own label (bottle approved 30 Oct, locked) and a price (the lettering has no $ sign).
  fontExempt: '.pep-bottle-line, .pep-lineup-price',
  headingSelectors: 'h1, h2, h3, .pep-header-label, .pep-header-col-h',
  maxRadius: 3,
  // every card. Each must be CLEAR. A new card goes in this list AND in brand/brand-lock.css.
  cards: ['.pep-hero-card::before', '[data-module="lineup"] .vc-pane', '.pep-lineup-step', '.pep-lineup-item-btn',
    '.pep-story-skip', '.pep-story-steps', '.pep-doors-glass', '.pep-shelf-slat', '.pep-shelf-pane', '.pep-shelf-soon',
    '.pep-shelf-plate', '.pep-shelf-filter', '.pep-footer-pane', '.pep-footer-link', '.pep-hooks-glass', '.pep-hooks-way',
    '.pep-hooks-tile', '.pep-hooks-card'],
  // not cards: sheets that open OVER the page keep smoked glass so their words stay readable; and real objects.
  notCards: '[data-module="ground"], [data-module="header"], [data-module="cart"], [data-module="guide"], ' +
    '[data-module="entrance"], [data-module="logo3d"], .pep-hooks-pop, .pep-hooks-bar, .pep-story-cell, dialog, [role="dialog"], ' +
    '.pep-lineup-plate, .pep-lineup-veil, .pep-lineup-shade',
  ground: { variant: 'none', maxSurface: 0.12, maxReach: 120 },
  menuArt: 'assets/menu58/',
};

const url = process.argv.slice(2).find(a => !a.startsWith('--')) || 'https://apex360marketing-ai.github.io/Pepticity/new/';
const asJson = process.argv.includes('--json');
const lines = [];
const add = (level, name, text, items) => lines.push({ level, name, text, items: (items || []).slice(0, 8) });

function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h = (h * 60 + 360) % 360;
  return [h, s, l];
}
const hex = c => '#' + c.slice(0, 3).map(v => Math.round(v).toString(16).padStart(2, '0')).join('');

/* ---- runs in the page: everything the styles say ---- */
function collect(B) {
  const name = (e, ps) => {
    let s = e.tagName.toLowerCase();
    if (e.id) s += '#' + e.id;
    if (typeof e.className === 'string' && e.className.trim()) s += '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.');
    return s + (ps || '');
  };
  const parse = str => {
    const out = [];
    String(str || '').replace(/rgba?\(([^)]+)\)|color\(srgb ([^)]+)\)/g, (m, a, b) => {
      if (a) { const q = a.split(/[,\s/]+/).filter(Boolean).map(Number); out.push([q[0], q[1], q[2], q.length > 3 ? q[3] : 1]); }
      else { const q = b.split(/[\s/]+/).filter(Boolean).map(Number); out.push([q[0] * 255, q[1] * 255, q[2] * 255, q.length > 3 ? q[3] : 1]); }
    });
    return out;
  };
  const colours = {}, fonts = {}, radii = [], names = [], fills = [];
  const note = (c, who, prop) => {
    if (!(c[3] > 0.04)) return;
    const k = c.slice(0, 3).map(v => Math.round(v)).join(',');
    const o = colours[k] || (colours[k] = { n: 0, who: [] });
    o.n++; if (o.who.length < 4 && !o.who.includes(who + ' ' + prop)) o.who.push(who + ' ' + prop);
  };
  const seen = (cs, r) => cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.02 && r.width > 0 && r.height > 0;
  const not = B.notCards;
  document.querySelectorAll('body *').forEach(e => {
    if (/^(SCRIPT|STYLE|TEMPLATE|NOSCRIPT)$/.test(e.tagName) || e.closest('[hidden], template')) return;
    const r = e.getBoundingClientRect();
    ['', '::before', '::after'].forEach(ps => {
      const cs = getComputedStyle(e, ps || null);
      if (ps && (cs.content === 'none' || cs.content === 'normal')) return;
      if (!seen(cs, r)) return;
      const who = name(e, ps);
      const ownText = !ps && [...e.childNodes].some(n => n.nodeType === 3 && n.nodeValue.trim());
      if (ownText || ps) parse(cs.color).forEach(c => note(c, who, 'text'));
      parse(cs.backgroundColor).forEach(c => note(c, who, 'fill'));
      if (cs.backgroundImage !== 'none') parse(cs.backgroundImage).forEach(c => note(c, who, 'gradient'));
      if (cs.boxShadow !== 'none') parse(cs.boxShadow).forEach(c => note(c, who, 'shadow'));
      if (cs.textShadow !== 'none') parse(cs.textShadow).forEach(c => note(c, who, 'text-shadow'));
      ['Top', 'Right', 'Bottom', 'Left'].forEach(s => { if (parseFloat(cs['border' + s + 'Width']) > 0) parse(cs['border' + s + 'Color']).forEach(c => note(c, who, 'border')); });
      if (e instanceof SVGElement && !ps) { parse(cs.fill).forEach(c => note(c, who, 'fill')); parse(cs.stroke).forEach(c => note(c, who, 'stroke')); }
      if (!ps) {
        if (ownText) {
          if (!e.closest(B.fontExempt)) {
            const f = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
            const o = fonts[f] || (fonts[f] = { n: 0, who: [] }); o.n++; if (o.who.length < 4) o.who.push(who);
          }
          [...e.childNodes].forEach(n => {
            if (n.nodeType !== 3) return;
            (n.nodeValue.match(/[@./\w-]*pepticity[\w./-]*/gi) || []).forEach(w => {
              if (/[@/]|\.(com|ca|io)\b/i.test(w)) return;                       // an address, not the name
              if (!/PEPTICITY/.test(w)) names.push(who + ' "' + w + '"');
            });
          });
        }
        const rad = Math.max(...['TopLeft', 'TopRight', 'BottomRight', 'BottomLeft'].map(k => parseFloat(cs['border' + k + 'Radius']) || 0));
        if (rad > B.maxRadius && r.width >= 20 && r.height >= 20 && (parse(cs.backgroundColor).some(c => c[3] > .04) || cs.backgroundImage !== 'none' || parseFloat(cs.borderTopWidth) > 0 || cs.boxShadow !== 'none'))
          radii.push(who + ' ' + Math.round(rad) + 'px');
        // a panel with its own tint that nobody listed
        const a = (parse(cs.backgroundColor)[0] || [0, 0, 0, 0])[3];
        const ring = /evenodd/.test(cs.clipPath) || (cs.maskImage && cs.maskImage !== 'none') || (cs.webkitMaskImage && cs.webkitMaskImage !== 'none');
        if (a > 0.03 && r.width >= 220 && r.height >= 110 && !ring && !e.closest(not)) fills.push(who + ' ' + cs.backgroundColor + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
      }
    });
  });
  // the listed cards
  const cards = [];
  B.cards.forEach(sel => {
    const m = sel.match(/^(.*?)(::before|::after)?$/), ps = m[2] || null;
    let found = 0, bad = null;
    document.querySelectorAll(m[1]).forEach(e => {
      const cs = getComputedStyle(e, ps);
      if (getComputedStyle(e).display === 'none' || e.closest(not)) return;    // a sheet over the page is not a card
      found++;
      const a = (parse(cs.backgroundColor)[0] || [0, 0, 0, 0])[3];
      const blur = cs.backdropFilter && cs.backdropFilter !== 'none' ? cs.backdropFilter : (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none' ? cs.webkitBackdropFilter : '');
      // a card may carry a thin line of light (an edge), never a tint over its face
      const img = cs.backgroundImage === 'none' ? '' : cs.backgroundImage;
      const tint = img && !/^linear-gradient\(rgb\(230, 233, 237\), rgb\(230, 233, 237\)\)/.test(img) ? img.slice(0, 70) : '';
      if (a > 0 || blur || tint) bad = sel + (a > 0 ? ' fill ' + cs.backgroundColor : '') + (blur ? ' blur ' + blur : '') + (tint ? ' tint ' + tint : '');
    });
    cards.push({ sel, found, bad });
  });
  const heads = [];
  document.querySelectorAll(B.headingSelectors).forEach(e => {
    const cs = getComputedStyle(e), r = e.getBoundingClientRect();
    if (!seen(cs, r) || !e.textContent.trim()) return;
    const f = cs.fontFamily.split(',')[0].trim().replace(/^["']|["']$/g, '');
    if (f !== B.fonts[0]) heads.push(name(e) + ' is in ' + f);
  });
  const hdr = document.querySelector('[data-module="header"]');
  return {
    colours, fonts, radii: [...new Set(radii)], names: [...new Set(names)], fills: [...new Set(fills)], cards, heads: [...new Set(heads)],
    menu: hdr ? getComputedStyle(hdr, '::before').backgroundImage : '',
    token: getComputedStyle(document.documentElement).getPropertyValue('--pep-light').trim(),
  };
}

/* ---- pixels: counted in a blank page so no image library is needed ---- */
async function count(helper, png, box) {
  return helper.evaluate(async ({ src, box }) => {
    const im = new Image(); im.src = src; await im.decode();
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let warm = 0, violet = 0, blue = 0, far = 0, n = 0;
    for (let i = 0, p = 0; i < d.length; i += 4, p++) {
      const px = p % c.width, py = (p / c.width) | 0;
      if (box.skip && px >= box.skip[0] && px < box.skip[0] + box.skip[2] && py >= box.skip[1] && py < box.skip[1] + box.skip[3]) continue;
      n++;
      const r = d[i], g = d[i + 1], b = d[i + 2], mx = Math.max(r, g, b), mn = Math.min(r, g, b), dl = mx - mn;
      if (mx < 70 || dl < 34 || dl / mx < 0.3) continue;
      let h = mx === r ? ((g - b) / dl) % 6 : mx === g ? (b - r) / dl + 2 : (r - g) / dl + 4; h = (h * 60 + 360) % 360;
      if (h >= 18 && h <= 70) warm++;
      else if (h >= 250 && h <= 305) violet++;
      else if (h >= 200 && h <= 235) { blue++; if (box.at && Math.hypot(px - box.at[0], py - box.at[1]) > box.at[2]) far++; }
    }
    return { warm, violet, blue, far, n };
  }, { src: 'data:image/png;base64,' + png.toString('base64'), box: box || {} });
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const helper = await browser.newPage();
  const pct = (a, n) => (100 * a / Math.max(1, n));

  for (const [w, h, label] of [[1440, 900, 'desktop'], [390, 844, 'phone']]) {
    const page = await browser.newPage({ viewport: { width: w, height: h }, isMobile: w < 500, hasTouch: w < 500 });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    const res = await page.goto(url + (url.includes('?') ? '&' : '?') + 'audit=' + Date.now(), { waitUntil: 'load' });
    if (!res || res.status() >= 400) { console.error('Could not open', url, res && res.status()); process.exit(2); }
    await page.waitForTimeout(6500);
    const H = await page.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < H; y += 700) { await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(140); }
    await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
    const d = await page.evaluate(collect, BRAND);
    const tag = ' (' + label + ')';

    // ONE BLUE and ONE METAL
    const off = [], otherBlue = [], gold = []; let blues = 0;
    for (const [k, o] of Object.entries(d.colours)) {
      const c = k.split(',').map(Number), [hh, s, l] = hsl(c), spread = Math.max(...c) - Math.min(...c);
      if (spread < 26 || s < 0.18) continue;                                    // a grey: chrome, gunmetal, black, white
      if (hh >= BRAND.blueHue[0] && hh <= BRAND.blueHue[1]) {
        blues += o.n;
        const vivid = s >= 0.85 && l >= 0.5 && l <= 0.68;
        if (vivid && c.some((v, i) => Math.abs(v - BRAND.blue[i]) > BRAND.vividTolerance)) otherBlue.push(hex(c) + ' ' + o.who[0]);
      } else if (hh >= BRAND.goldHue[0] && hh <= BRAND.goldHue[1] && s < 0.62) gold.push(hex(c) + ' ' + o.who[0]);
      else off.push(hex(c) + ' (hue ' + Math.round(hh) + ') ' + o.who[0]);
    }
    if (d.token.toLowerCase() !== hex(BRAND.blue)) add('FAIL', 'ONE BLUE', 'the light token is ' + d.token + ', not ' + hex(BRAND.blue) + tag);
    if (otherBlue.length) add('FAIL', 'ONE BLUE', otherBlue.length + ' full-strength blues that are not the logo blue' + tag, otherBlue);
    if (off.length) add('FAIL', 'ONE BLUE', off.length + ' colours off the brand (not the blue, not a grey)' + tag, off);
    if (!otherBlue.length && !off.length) add('PASS', 'ONE BLUE', blues + ' uses of colour, every one on the logo blue ' + hex(BRAND.blue) + tag);
    if (gold.length) add('NOTE', 'ONE METAL', 'a second metal, pale chrome gold, in ' + new Set(gold.map(g => g.split(' ')[1])).size + ' places' + tag, [...new Set(gold.map(g => g.split(' ').slice(1).join(' ')))]);
    else add('PASS', 'ONE METAL', 'chrome and gunmetal only' + tag);

    // CLEAR CARDS
    const badCards = d.cards.filter(c => c.bad).map(c => c.bad), live = d.cards.filter(c => c.found).length;
    if (badCards.length) add('FAIL', 'CLEAR CARDS', badCards.length + ' cards are not clear' + tag, badCards);
    if (d.fills.length) add('FAIL', 'CLEAR CARDS', d.fills.length + ' panels carry their own tint and are not in the card list' + tag, d.fills);
    if (!badCards.length && !d.fills.length) add('PASS', 'CLEAR CARDS', live + ' kinds of card on the page, all 0% fill, no blur' + tag);

    // TYPE, NAME, SHAPES, MENU
    const strange = Object.entries(d.fonts).filter(([f]) => !BRAND.fonts.includes(f)).map(([f, o]) => f + ': ' + o.who[0]);
    if (strange.length) add('FAIL', 'TYPE', 'a face that is not the brand\'s' + tag, strange);
    if (d.heads.length) add('FAIL', 'TYPE', d.heads.length + ' headings are not in the PEPTICITY lettering' + tag, d.heads);
    if (!strange.length && !d.heads.length) add('PASS', 'TYPE', 'PEPTICITY lettering for every heading and key, one plain text face' + tag);
    add(d.names.length ? 'FAIL' : 'PASS', 'NAME', d.names.length ? 'the name is not written PEPTICITY' + tag : 'PEPTICITY in capitals everywhere' + tag, d.names);
    add(d.radii.length ? 'FAIL' : 'PASS', 'SHAPES', d.radii.length ? d.radii.length + ' rounded shapes (over ' + BRAND.maxRadius + ' px)' + tag : 'chamfered, no pills' + tag, d.radii);
    add(d.menu.includes(BRAND.menuArt) ? 'PASS' : 'FAIL', 'MENU', d.menu.includes(BRAND.menuArt) ? 'the header is menu 58, the real picture' + tag : 'the header is not built from the menu 58 picture' + tag);
    if (errors.length) add('FAIL', 'PAGE', errors.length + ' script errors' + tag, errors);
    if (await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1)) add('FAIL', 'PAGE', 'the page scrolls sideways' + tag);

    if (label === 'desktop') {
      // PIXELS: the whole page as it renders
      let warm = 0, violet = 0, n = 0;
      for (let y = 0; y < H; y += h) {
        await page.evaluate(v => scrollTo(0, v), y); await page.waitForTimeout(500);
        const hr = await page.evaluate(() => { const r = document.querySelector('[data-module="header"]').getBoundingClientRect(); return [r.left - 20, r.top - 20, r.width + 40, r.height + 40]; });
        const c = await count(helper, await page.screenshot(), { skip: hr });
        warm += c.warm; violet += c.violet; n += c.n;
      }
      const pw = pct(warm, n), pv = pct(violet, n);
      add(pw > 0.5 ? 'FAIL' : pw > 0.03 ? 'NOTE' : 'PASS', 'PIXELS', 'warm (yellow / orange / gold) pixels: ' + pw.toFixed(3) + '% of the page');
      add(pv > 0.05 ? 'FAIL' : 'PASS', 'PIXELS', 'violet pixels outside the menu: ' + pv.toFixed(3) + '% of the page');

      // GROUND
      const src = await page.content();
      const mount = (src.match(/PEPQuilt\.mount\([^)]*\)/) || [''])[0];
      const surface = +(src.match(/var SURFACE\s*=\s*([\d.]+)/) || [])[1], reach = +(src.match(/var REACH\s*=\s*([\d.]+)/) || [])[1];
      const okMount = /variant:\s*'none'/.test(mount) && surface > 0 && surface <= BRAND.ground.maxSurface && reach > 0 && reach <= BRAND.ground.maxReach;
      add(okMount ? 'PASS' : 'FAIL', 'GROUND', okMount ? 'still quilt (no breathing blue), surface ' + surface + ', pointer circle ' + reach + ' px' : 'the quilt is not set to the still, pointer-only ground: ' + mount + ' surface ' + surface + ' reach ' + reach);
      await page.close();
      const g = await browser.newPage({ viewport: { width: w, height: h } });
      await g.goto(url, { waitUntil: 'load' }); await g.waitForTimeout(7000);
      await g.addStyleTag({ content: '[data-module]:not([data-module="ground"]), main, body > header, body > footer { visibility: hidden !important; }' });
      await g.waitForTimeout(300);
      const rest = await count(helper, await g.screenshot());
      await g.mouse.move(700, 450); await g.mouse.move(720, 460); await g.waitForTimeout(1200);
      const lit = await count(helper, await g.screenshot(), { at: [720, 460, (reach || 75) * 2.4 + 40] });
      add(pct(rest.blue, rest.n) > 0.01 ? 'FAIL' : 'PASS', 'GROUND', 'blue in the ground at rest: ' + pct(rest.blue, rest.n).toFixed(3) + '% (must be none)');
      add(lit.blue === 0 ? 'NOTE' : lit.far > lit.blue * 0.02 ? 'FAIL' : 'PASS', 'GROUND', lit.blue === 0 ? 'no light seen at the pointer (no WebGL in this browser?)' : 'lights only at the pointer: ' + lit.blue + ' lit pixels, ' + lit.far + ' outside the circle');
      await g.close();
    } else await page.close();
  }
  await browser.close();

  const fails = lines.filter(l => l.level === 'FAIL').length, notes = lines.filter(l => l.level === 'NOTE').length;
  if (asJson) console.log(JSON.stringify({ url, held: !fails, fails, notes, lines }, null, 1));
  else {
    console.log('PEPTICITY BRAND AUDIT  ' + url);
    lines.forEach(l => { console.log(l.level.padEnd(5) + l.name.padEnd(13) + l.text); l.items.forEach(i => console.log('                    - ' + i)); });
    console.log(fails ? 'RESULT: BROKEN, ' + fails + ' to fix before anyone sees it' : 'RESULT: HELD' + (notes ? ' (' + notes + ' to note)' : ''));
  }
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error('The audit could not run:', e.message); process.exit(2); });

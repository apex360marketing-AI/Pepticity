// TOP worker check (05-header + 10-hero).   usage: node /home/user/work/top/check.js <pageUrl>
// e.g. node check.js http://localhost:8802/new/   (a page URL or a folder URL that serves index.html)
// Exit code 1 if any assertion fails. Every assertion prints PASS or FAIL with the measured value.
const { chromium } = require('playwright');
const url = process.argv[2] || 'http://localhost:8802/new/';
const SIZES = [[1440, 900], [1366, 768], [390, 844]];
const LOGO_BLUE = [42, 120, 255], LOGO_CORE = [207, 230, 255];
const OFFER = 'THE FIRST 25 MEMBERS GET 10% OFF FOR LIFE.';
const SAFE = 'FIRST ACCESS TO EVERY NEW LOT, AND YOUR FOUNDER CARD.';
const TWIN = 'YOUR FOUNDER CARD AND PEPTICITY NEWS.';
let fails = 0, passes = 0;
const PART = process.env.CHECK_PART || 'all';   // CHECK_PART=fix runs only the source scan and the fix-round assertions (for quick re-runs)
const ok = (cond, msg) => { if (cond) { passes++; console.log('PASS ' + msg); } else { fails++; console.log('FAIL ' + msg); } };

// ---------- colour scan of the TOP regions (source text) ----------
function hsl([r, g, b]) {
  r /= 255; g /= 255; b /= 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, d = mx - mn;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  h *= 60; if (h < 0) h += 360;
  return [h, s, l];
}
function region(html, open, close) {
  const i = html.indexOf(open); if (i < 0) return '';
  const j = html.indexOf(close, i + open.length); return j < 0 ? '' : html.slice(i, j);
}
function colourScan(html) {
  const parts = {
    'header.css': region(html, '<style data-pep-src="modules/05-header/header.css">', '</style>'),
    'hero.css': region(html, '<style data-pep-src="modules/10-hero/hero.css">', '</style>'),
    'header.js': region(html, '<script data-pep-src="modules/05-header/header.js">', '</script>'),
    'pep-logo.js': region(html, '<script data-pep-src="modules/05-header/pep-logo.js"', '</script>'),
    'header markup': region(html, '<header data-module="header"', '</header>'),
    'hero markup': region(html, '<section data-module="hero"', '</section>')
  };
  const bad = [];
  for (const [name, raw] of Object.entries(parts)) {
    // comments are words, not colours: strip CSS, JS line and HTML comments; data URIs are pictures, not colour values
    const src = raw.replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"])\/\/[^\n]*/g, '$1').replace(/<!--[\s\S]*?-->/g, '').replace(/data:[a-z/+;,0-9]+[^"')\s]*/gi, '');
    const found = [];
    for (const m of src.matchAll(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b/g)) { let x = m[1]; if (x.length === 3) x = x.replace(/./g, c => c + c); found.push([parseInt(x.slice(0, 2), 16), parseInt(x.slice(2, 4), 16), parseInt(x.slice(4, 6), 16), m[0]]); }
    for (const m of src.matchAll(/0x([0-9a-fA-F]{6})\b/g)) found.push([parseInt(m[1].slice(0, 2), 16), parseInt(m[1].slice(2, 4), 16), parseInt(m[1].slice(4, 6), 16), m[0]]);
    for (const m of src.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) found.push([+m[1], +m[2], +m[3], m[0]]);
    for (const m of src.matchAll(/--[\w-]+:\s*(\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\s*;/g)) found.push([+m[1], +m[2], +m[3], m[0]]);
    for (const [r, g, b, txt] of found) {
      const same = c => c[0] === r && c[1] === g && c[2] === b;
      if (same(LOGO_BLUE) || same(LOGO_CORE)) continue;
      const [h, s, l] = hsl([r, g, b]);
      const chroma = (Math.max(r, g, b) - Math.min(r, g, b)) / 255;
      if (chroma < 0.09 || s < 0.2 || l < 0.05) continue;       // neutral greys (low chroma), near black
      const kind = h >= 245 && h < 330 ? 'violet/purple' : h >= 165 && h < 245 ? 'second blue/cyan' : h >= 30 && h < 75 ? 'raw gold/yellow' : 'other hue';
      bad.push(`${name}: ${txt} (${kind}, hue ${h.toFixed(0)})`);
    }
    const cssOnly = /css/.test(name) ? src : (src.match(/style="[^"]*"/g) || []).join(' ');
    // named colours as values (a custom property's name such as --pep-hero-gold is a name, not a colour)
    for (const m of cssOnly.matchAll(/:\s*[^;{}]*?(?<![-\w])(violet|purple|magenta|indigo|lavender|orchid|plum|cyan|aqua|turquoise|gold|yellow|orange)(?![-\w])/gi)) bad.push(`${name}: named colour "${m[1]}"`);
  }
  return { bad, parts };
}

// Desktop sizes share one browser context (a warm cache, as a returning visitor has); the phone gets its own (touch).
// Software rendering in a busy headless browser can take longer than the 3D engine's own 9 s start limit: that one case
// (and only that one) is loaded again, at most twice, and every retry is printed.
const shared = {};
async function load(browser, w, h, tries) {
  const phone = w < 600, key = phone ? 'phone' : 'desk';
  if (!shared[key]) shared[key] = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: phone ? 2 : 1, isMobile: phone, hasTouch: phone });
  const ctx = shared[key];
  const page = await ctx.newPage();
  await page.setViewportSize({ width: w, height: h });
  await page.addInitScript(() => { try { localStorage.clear(); sessionStorage.clear(); } catch (e) {} });
  const errors = [], warns = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
  page.on('console', m => { if (/3d off/i.test(m.text())) warns.push(m.text().slice(0, 120)); });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  // the 3D engine settles (on, or off with a reason) before anything is measured
  await page.waitForFunction(() => { const r = document.querySelector('[data-module="logo3d"]'); return !r || r.hasAttribute('data-pep3d-state'); }, null, { timeout: 30000 }).catch(() => {});
  await page.waitForTimeout(1500);
  tries = tries || 0;
  if (tries < 2 && warns.some(t => /did not start/.test(t))) {
    console.log(`note ${w}x${h}: the 3D engine was slow to start in software rendering (${warns.join(' ')}); loading again`);
    await page.close();
    return load(browser, w, h, tries + 1);
  }
  return { ctx, page, errors, warns, close: () => page.close() };
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });

  // ---------- source (read, not rendered) ----------
  {
    const ctx = await browser.newContext();
    const html = await (await ctx.request.get(url)).text();
    const { bad, parts } = colourScan(html);
    ok(parts['header.css'].length > 0 && parts['hero.css'].length > 0, 'the 05-header and 10-hero blocks are present');
    ok(bad.length === 0, 'no violet/purple, second-blue, cyan or raw gold/yellow colour values in 05-header and 10-hero' + (bad.length ? ': ' + bad.slice(0, 8).join(' | ') + (bad.length > 8 ? ` (+${bad.length - 8} more)` : '') : ''));
    ok(!parts['pep-logo.js'] && !/data-pep-logo=/.test(html), 'the unused logo-21 lockup (pep-logo.js) is gone and nothing asks for it');
    await ctx.close();
  }

  // ---------- each size ----------
  for (const [w, h] of PART === 'fix' ? [] : SIZES) {
    const tag = `${w}x${h}`;
    const { page, errors, warns, close } = await load(browser, w, h);
    const m = await page.evaluate(() => {
      const rect = s => { const e = document.querySelector(s); if (!e) return null; const b = e.getBoundingClientRect(); return { l: b.left, t: b.top, r: b.right, b: b.bottom }; };
      const hd = document.querySelector('[data-module="header"]');
      const labels = Array.from(document.querySelectorAll('[data-module="header"] .pep-header-key')).map(k => k.querySelector('.pep-header-label') || k);
      const word = document.querySelector('[data-module="header"] .pep-header-3d-face, [data-module="header"] .pep-header-name');
      const cs = e => getComputedStyle(e);
      const fam = f => f.split(',')[0].trim().replace(/^["']|["']$/g, '');
      // no flat white: every visible piece of text in the header and the hero card is chrome (clipped gradient) or not pure white
      const white = [];
      const roots = [hd, document.querySelector('.pep-hero-card')].filter(Boolean);
      for (const root of roots) {
        for (const el of [root, ...root.querySelectorAll('*')]) {
          const own = Array.from(el.childNodes).some(n => n.nodeType === 3 && n.textContent.trim());
          if (!own || !el.getClientRects().length) continue;
          const c = cs(el); if (c.visibility === 'hidden' || c.clip === 'rect(0px, 0px, 0px, 0px)') continue;
          if (el.closest('[hidden]')) continue;
          const fill = c.webkitTextFillColor;
          if (/rgba\(0, 0, 0, 0\)|transparent/.test(fill)) continue;
          if (fill === 'rgb(255, 255, 255)') white.push((el.className || el.tagName) + ' "' + el.textContent.trim().slice(0, 20) + '"');
        }
      }
      const heads = ['.pep-hero-ask', '.pep-hero-kicker', '[data-module="header"] .pep-header-name'].map(s => document.querySelector(s)).filter(Boolean);
      const moves = [];
      for (const hEl of heads) {
        for (const el of [hEl, ...hEl.querySelectorAll('*')]) {
          if (cs(el).transform !== 'none') moves.push(hEl.className + ' transform');
          for (const a of el.getAnimations()) {
            const props = new Set(); a.effect.getKeyframes().forEach(k => Object.keys(k).forEach(p => props.add(p)));
            ['offset', 'easing', 'composite', 'computedOffset', 'backgroundPosition', 'backgroundPositionX', 'backgroundPositionY'].forEach(p => props.delete(p));
            if (props.size) moves.push(hEl.className + ' animates ' + Array.from(props).join(','));
          }
        }
      }
      const face = document.querySelector('.pep-hero-ask .pep-hero-3d-face');
      const askText = (document.querySelector('.pep-hero-ask') || {}).textContent || '';
      const vis = e => !!e && !e.closest('[hidden]') && e.getClientRects().length > 0;
      const offerEl = document.querySelector('.pep-hero-form > .pep-hero-offer[data-gate="offer"] [data-offer-text]');
      const safeEl = document.querySelector('.pep-hero-form > .pep-hero-offer[data-gate-off="offer"]');
      const btnLabel = Array.from(document.querySelectorAll('.pep-hero-form button[type="submit"] .pep-hero-btn-label')).find(vis);
      const h1 = document.getElementById('pep-hero-title');
      const heroText = Array.from(document.querySelectorAll('[data-module="hero"] *')).filter(vis).map(e => Array.from(e.childNodes).filter(n => n.nodeType === 3).map(n => n.textContent).join('')).join(' ');
      return {
        email: rect('#pep-hero-email'), btn: rect('.pep-hero-form button[type="submit"]'), vw: innerWidth, vh: innerHeight, sy: scrollY,
        labels: labels.map(l => ({ t: l.textContent.trim(), fam: cs(l).fontFamily, size: parseFloat(cs(l).fontSize), weight: parseInt(cs(l).fontWeight, 10) })),
        wordFam: word ? cs(word).fontFamily : null, wordText: word ? word.textContent.trim() : null, famOf: fam(word ? cs(word).fontFamily : ''),
        fontReady: document.fonts.check('700 16px PepticityBlack'),
        white, moves,
        shine: face ? { clip: cs(face).webkitBackgroundClip || cs(face).backgroundClip, img: cs(face).backgroundImage, anims: face.getAnimations().length } : null,
        askText: askText.trim(), offer: offerEl && vis(offerEl) ? offerEl.textContent.trim() : null, safe: safeEl ? Array.from(safeEl.querySelectorAll('[data-gate="restock"], [data-gate-off="restock"]')).map(e => e.textContent.trim()).join(' | ') : null, safeHidden: safeEl ? !vis(safeEl) : null,
        btnLabel: btnLabel ? btnLabel.textContent.trim() : null, h1: h1 ? h1.textContent.replace(/\s+/g, ' ').trim() : null,
        has15: /15%/.test(heroText),
        consentChecked: (document.querySelector('[data-consent]') || {}).checked,
        headerBox: { clip: cs(hd).clipPath, filter: cs(hd).filter, backdrop: cs(hd).backdropFilter || cs(hd).webkitBackdropFilter },
        zHome: cs(hd).zIndex,
        mirror: (() => { const c = document.querySelector('.pep-header-mirror'); if (!c || !c.width || c.style.visibility !== 'visible') return 0; const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 60) n++; return n; })(),
        mark: !!document.querySelector('[data-module="header"] .pep-header-mark.pep-logo3d-back-mark'),
        engine: (document.querySelector('[data-module="logo3d"]') || { getAttribute: () => null }).getAttribute('data-pep3d-state')
      };
    });
    const inside = r => r && r.l >= 0 && r.t >= 0 && r.r <= m.vw && r.b <= m.vh;
    const fmt = r => r ? `[${Math.round(r.l)},${Math.round(r.t)} - ${Math.round(r.r)},${Math.round(r.b)}]` : 'missing';
    ok(m.sy === 0 && inside(m.email), `${tag}: the hero email field is fully inside the first screen ${fmt(m.email)} of ${m.vw}x${m.vh}`);
    ok(inside(m.btn), `${tag}: the hero button is fully inside the first screen ${fmt(m.btn)}`);
    ok(!!m.wordFam && m.famOf === 'PepticityBlack' && m.wordText === 'PEPTICITY', `${tag}: the header wordmark is text "PEPTICITY" in PepticityBlack (got ${m.wordText === null ? 'no wordmark text' : '"' + m.wordText + '" in ' + m.famOf})`);
    const badLab = m.labels.filter(l => l.fam !== m.wordFam || l.size < 14 || l.weight < 700);
    ok(m.labels.length >= 6 && badLab.length === 0 && m.fontReady, `${tag}: all ${m.labels.length} header labels share the wordmark's font family, at least 14px and bold, font loaded=${m.fontReady}` + (badLab.length ? ': ' + badLab.map(l => `${l.t} ${l.size}px w${l.weight} ${l.fam === m.wordFam ? 'same family' : 'other family'}`).join(', ') : ''));
    ok(m.white.length === 0, `${tag}: no flat white text in the header or the hero card` + (m.white.length ? ': ' + m.white.slice(0, 6).join(', ') : ''));
    ok(m.moves.length === 0, `${tag}: the headings never move (no transform, only the sheen animates)` + (m.moves.length ? ': ' + m.moves.slice(0, 4).join(', ') : ''));
    ok(!!m.shine && m.shine.clip.split(',').every(v => v.trim() === 'text') && m.shine.img.includes('rgb(42, 120, 255)') && m.shine.anims >= 1, `${tag}: the ask heading is chrome with the logo blue through it and a running sheen` + (m.shine ? ` (clip ${m.shine.clip}, anims ${m.shine.anims})` : ' (no chrome face)'));
    ok(m.askText === 'JOIN THE FOUNDER CIRCLE', `${tag}: the card's ask reads JOIN THE FOUNDER CIRCLE (got "${m.askText}")`);
    ok(m.offer === OFFER, `${tag}: preview shows the gated founder line "${OFFER}" (got ${m.offer === null ? 'none' : '"' + m.offer + '"'})`);
    ok(m.safe === SAFE + ' | ' + TWIN && m.safeHidden === true, `${tag}: the safe line waits behind the offer gate with its own restock pair "${SAFE}" / "${TWIN}" (got ${m.safe === null ? 'none' : '"' + m.safe + '"'}, hidden ${m.safeHidden})`);
    ok(m.btnLabel === 'CLAIM MY FOUNDER SPOT', `${tag}: the one button reads CLAIM MY FOUNDER SPOT (got "${m.btnLabel}")`);
    ok(m.h1 === 'PEPTICITY GRAND OPENING', `${tag}: GRAND OPENING is folded into the ask as the page heading (got "${m.h1}")`);
    ok(!m.has15, `${tag}: no old 15% wording left in the hero`);
    ok(m.consentChecked === false, `${tag}: the email consent box starts unticked`);
    ok(m.headerBox.clip === 'none' && m.headerBox.filter === 'none' && (!m.headerBox.backdrop || m.headerBox.backdrop === 'none'), `${tag}: the header element itself has no clip-path, filter or backdrop-filter`);
    ok(m.mark && m.engine === 'on', `${tag}: the header P is a live 3D slot of the logo engine (slot taken ${m.mark}, engine ${m.engine}${warns.length ? ", " + warns.join(" ") : ""})`);
    ok(m.zHome === '10' && m.mirror > 300, `${tag}: the bar stands over the 3D canvas (z ${m.zHome}) and the live P is drawn in front of the chrome (${m.mirror} lit pixels on its canvas in the bar)`);
    ok(errors.length === 0, `${tag}: 0 page errors` + (errors.length ? ': ' + errors.join(' | ') : ''));

    if (w >= 1200) {
      // the P hangs into its tab and is drawn on its edge canvas
      const p = await page.evaluate(() => {
        const e = document.querySelector('.pep-logo3d-edge'), hd = document.querySelector('[data-module="header"]');
        if (!e || e.style.visibility !== 'visible' || !e.width) return null;
        const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data, eb = e.getBoundingClientRect(), s = e.width / eb.width;
        let y0 = 1e9, y1 = -1;
        for (let y = 0; y < e.height; y++) for (let x = 0; x < e.width; x++) if (d[(y * e.width + x) * 4 + 3] > 60) { if (y < y0) y0 = y; if (y > y1) y1 = y; }
        const hb = hd.getBoundingClientRect(), cs = getComputedStyle(hd), tab = parseFloat(cs.getPropertyValue('--pep-hd-tab-d'));
        return { top: eb.top + y0 / s - hb.top, bottom: eb.top + y1 / s - hb.top, barH: hb.height, tab };
      });
      ok(!!p && p.top > 1.2 && p.bottom > p.barH && p.bottom < p.barH + p.tab - 1.2, `${tag}: the P is drawn inside the bar's glass and hangs into its tab` + (p ? ` (P ${p.top.toFixed(0)} to ${p.bottom.toFixed(0)} px, bar ${p.barH.toFixed(0)}, tab floor ${(p.barH + p.tab).toFixed(0)})` : ' (no P drawn)'));
      {
        const r3 = await page.evaluate(() => {
          const hd = document.querySelector('[data-module="header"]'), row = hd.querySelector('.pep-header-row'), cr = hd.querySelector('.pep-header-crystal');
          const card = document.querySelector('.pep-hero-card').getBoundingClientRect(), b4 = getComputedStyle(row, '::before');
          const key = hd.querySelector('[data-key="shop"]'), face = getComputedStyle(key, '::before'), lit = hd.querySelector('.pep-header-crystal-lit');
          return { plate: b4.borderImageSource, bar: row.getBoundingClientRect().height, crystal: cr ? cr.getBoundingClientRect().height : 0, crystalImg: lit ? getComputedStyle(lit).backgroundImage : '',
            crTop: cr ? cr.getBoundingClientRect().top : -1, lit: lit ? parseFloat(getComputedStyle(lit).opacity) : -1, rim: getComputedStyle(key).backgroundImage, face: face.backgroundImage,
            cardLeft: card.left / innerWidth, cardW: card.width / innerWidth, dropFill: getComputedStyle(hd.querySelector('.pep-header-drop-in')).backgroundImage,
            head: getComputedStyle(document.createElement('p')).fontFamily };
        });
        ok(/menu58\/bar\.webp/.test(r3.plate), `${tag}: the bar is the liquid chrome plate (${r3.plate.slice(-40)})`);
        ok(/menu58\/crystal\.webp/.test(r3.crystalImg) && r3.crystal > r3.bar + 20 && r3.crTop >= 0, `${tag}: the PEPTIDES crystal is the crystal plate and rises above and below the bar (${r3.crystal.toFixed(0)}px tall against the ${r3.bar.toFixed(0)}px bar, top at ${r3.crTop.toFixed(0)}px)`);
        ok(Math.abs(r3.lit - 0.25) < 0.02, `${tag}: at rest the crystal is lit to about 25 percent (${r3.lit})`);
        ok(r3.rim.includes('rgb(42, 120, 255)') && !/255, 255, 255\)/.test(r3.face), `${tag}: the other keys are dark glass with a rim in the logo blue`);
        ok(r3.cardLeft <= 0.06 && r3.cardW >= 0.52, `${tag}: the hero card stands at the far left and wide (left edge at ${(r3.cardLeft * 100).toFixed(1)}% of the window, ${(r3.cardW * 100).toFixed(1)}% wide)`);
        const al = parseFloat((/rgba\(\d+, \d+, \d+, ([\d.]+)\)\s*,\s*rgba\(\d+, \d+, \d+, ([\d.]+)\)\)$/.exec(r3.dropFill) || [0, 1, 1])[2]);
        ok(al <= 0.7, `${tag}: the drop-down is clear dark glass (fill alpha ${al})`);
      }
      if (w === 1440) {
        // the chrome-gold accent stays inside the brand-lock gold limits on rendered pixels (LAB b* <= 20, a* <= 6)
        const goldEl = await page.$('.pep-hero-form > .pep-hero-offer:not([hidden]) .pep-hero-offer-big');
        if (goldEl) {
          const png = await goldEl.screenshot();
          const g = await page.evaluate(async (b64) => {
            const img = new Image(); img.src = 'data:image/png;base64,' + b64; await img.decode();
            const c = document.createElement('canvas'); c.width = img.width; c.height = img.height; const x = c.getContext('2d'); x.drawImage(img, 0, 0);
            const d = x.getImageData(0, 0, c.width, c.height).data;
            const lin = v => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
            const f = t => t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116;
            let n = 0, bad = 0;
            for (let i = 0; i < d.length; i += 4) {
              const r = d[i], gg = d[i + 1], b = d[i + 2];
              if (!(r > 110 && r > b + 12)) continue;          // the lit warm pixels of the letters
              const R = lin(r), G = lin(gg), B = lin(b);
              const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
              const A = 500 * (f(X) - f(Y)), Bs = 200 * (f(Y) - f(Z));
              n++; if (Bs > 20 || A > 6) bad++;
            }
            return { n, bad };
          }, png.toString('base64'));
          ok(g.n > 200 && g.bad / g.n <= 0.03, `${tag}: the chrome-gold founder line stays inside the gold limits on screen (${g.bad} of ${g.n} lit pixels past b* 20 or a* 6)`);
        } else {
          ok(false, `${tag}: the chrome-gold founder line stays inside the gold limits on screen (no founder line shown)`);
        }
        const cfg = await page.evaluate(() => ({ text: PEP.config.offer && PEP.config.offer.text, pct: PEP.config.teamOffer && PEP.config.teamOffer.percent }));
        ok(cfg.text === OFFER, `config offer.text is "${OFFER}" (got "${cfg.text}")`);
        ok(cfg.pct === 10, `config teamOffer.percent is 10 (got ${cfg.pct})`);
      }
      // a panel open, or the bar floating: it stands over the 3D canvas
      await page.click('[data-key="peptides"]');
      await page.waitForFunction(() => document.querySelector('[data-module="header"]').hasAttribute('data-drop-open'), null, { timeout: 5000 }).catch(() => {});
      const zOpen = await page.evaluate(() => getComputedStyle(document.querySelector('[data-module="header"]')).zIndex);
      ok(zOpen === '10', `${tag}: with PEPTIDES open the bar stands over the 3D canvas (z ${zOpen})`);
      await page.waitForTimeout(900);
      const open3 = await page.evaluate(() => { const hd = document.querySelector('[data-module="header"]'), d = hd.querySelector('.pep-header-drop-in').getBoundingClientRect();
        return { lit: (l => l ? parseFloat(getComputedStyle(l).opacity) : -1)(hd.querySelector('.pep-header-crystal-lit')), bottom: d.bottom, vh: innerHeight, heads: Array.from(hd.querySelectorAll('.pep-header-col-h')).map(h => h.textContent.trim() + '|' + getComputedStyle(h).fontFamily.split(',')[0].replace(/"/g, '') + '|' + parseInt(getComputedStyle(h).fontWeight, 10)),
          items: Array.from(hd.querySelectorAll('.pep-header-item')).slice(0, 3).map(a => parseInt(getComputedStyle(a).fontWeight, 10) + '/' + parseFloat(getComputedStyle(a).fontSize)) }; });
      ok(open3.lit >= 0.8 && open3.lit <= 0.9, `${tag}: with the drop-down open the crystal is lit to about 85 percent, never 100 (${open3.lit})`);
      ok(open3.bottom <= open3.vh, `${tag}: the whole drop-down is on the screen (ends at ${open3.bottom.toFixed(0)} of ${open3.vh})`);
      ok(open3.heads.length >= 1 && open3.heads.every(h => /\|PepticityBlack\|700$/.test(h)) && !open3.heads.some(h => /RECOVERY|PERFORMANCE|LONGEVITY|SKIN/i.test(h)), `${tag}: the drop-down headings are the site's own, in the brand lettering (${open3.heads.map(h => h.split('|')[0]).join(', ')})`);
      ok(open3.items.every(i => { const [wt, sz] = i.split('/').map(Number); return wt >= 600 && sz >= 16; }), `${tag}: the product names are bold and at least 16px (${open3.items.join(', ')})`);
      await page.keyboard.press('Escape');
      await page.mouse.move(w / 2, h - 10);
      await page.evaluate(() => window.scrollTo(0, 700));
      // the scroll event arrives on a later frame (slow in software rendering): wait for the state, not a fixed time
      await page.waitForFunction(() => scrollY >= 600 && document.querySelector('[data-module="header"]').hasAttribute('data-float'), null, { timeout: 8000 }).catch(() => {});
      const zFloat = await page.evaluate(() => [getComputedStyle(document.querySelector('[data-module="header"]')).zIndex, document.querySelector('[data-module="header"]').hasAttribute('data-float')]);
      ok(zFloat[0] === '10' && zFloat[1], `${tag}: floating over the page the bar stands over the 3D canvas (z ${zFloat[0]}, float ${zFloat[1]})`);
      // the card itself never tilts to the pointer (headings never move)
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForFunction(() => scrollY === 0, null, { timeout: 5000 }).catch(() => {});
      await page.waitForTimeout(400);
      const card = await page.$('.pep-hero-card');
      const cb = await card.boundingBox();
      const tr0 = await page.evaluate(() => getComputedStyle(document.querySelector('.pep-hero-card')).transform);
      await page.mouse.move(cb.x + cb.width * .9, cb.y + cb.height * .1, { steps: 4 });
      await page.waitForTimeout(800);
      const tr = await page.evaluate(() => getComputedStyle(document.querySelector('.pep-hero-card')).transform);
      ok(tr === tr0, `${tag}: the card does not tilt to the pointer (its seat is the same before and after: ${tr === tr0})`);
    }
    await close();
  }

  // ---------- the form: blocks without consent, shows its next step with consent ----------
  if (PART !== "fix") {
    const { page, errors, close } = await load(browser, 1440, 900);
    await page.fill('#pep-hero-email', 'founder@example.com');
    await page.click('.pep-hero-form button[type="submit"]');
    await page.waitForTimeout(500);
    let s = await page.evaluate(() => ({ err: !document.getElementById('pep-hero-consent-err').hidden, email: !document.querySelector('[data-step="email"]').hidden, name: !document.querySelector('[data-step="name"]').hidden, flow: localStorage.getItem('pep:pep_flow_v1') }));
    ok(s.err && s.email && !s.name && !s.flow, `form without consent is blocked (consent error shown ${s.err}, still on the email step ${s.email}, next step shown ${s.name}, saved ${!!s.flow})`);
    await page.click('.pep-hero-consent');
    await page.click('.pep-hero-form button[type="submit"]');
    await page.waitForSelector('[data-step="name"]:not([hidden])', { timeout: 6000 }).catch(() => {});
    s = await page.evaluate(() => ({ name: !document.querySelector('[data-step="name"]').hidden, email: !document.querySelector('[data-step="email"]').hidden, note: !document.querySelector('[data-preview-note]').hidden, flow: JSON.parse(localStorage.getItem('pep:pep_flow_v1') || 'null'), head: (document.querySelector('[data-step="name"] [data-step-head]') || {}).textContent }));
    ok(s.name && !s.email && s.note && s.flow && s.flow.stage === 'TEAM', `form with consent shows its success step "${s.head}" with the preview note (stage ${s.flow && s.flow.stage})`);
    await page.click('[data-skip-name]');
    await page.waitForTimeout(400);
    const done = await page.evaluate(() => { const d = document.querySelector('[data-step="done"]'); return d.hidden ? null : d.querySelector('[data-step-head]').textContent.trim(); });
    ok(done === 'WELCOME TO THE FOUNDER CIRCLE.', `skipping the name ends on "WELCOME TO THE FOUNDER CIRCLE." (got "${done}")`);
    ok(errors.length === 0, 'form run: 0 page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));
    await close();
  }

  // ---------- FIX ROUND (security audit): flags in the menu, the restock pair, the tucked bar, the no-WebGL name ----------
  // Each page here is loaded with PEP_CONFIG edited in flight (never on disk), in a fresh context. 3D is off for these
  // (the local three.js is refused), which is also the no-WebGL case the header must survive.
  async function loadEdit(w, h, edits, o) {
    o = o || {};
    const phone = w < 600;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: phone, hasTouch: phone, reducedMotion: o.reduce ? 'reduce' : 'no-preference' });
    const src = await (await ctx.request.get(url)).text();
    const at = src.lastIndexOf('<script', src.indexOf('data-pep-src="core/pep.js"'));
    if (at < 0) throw new Error('core/pep.js not found');
    const body = src.slice(0, at) + '<script>(function(){var C=window.PEP_CONFIG;' + (edits || '') + '})();</script>\n' + src.slice(at);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e).slice(0, 200)));
    const target = new URL(url).href;
    await page.route(u => u.href === target, r => r.fulfill({ status: 200, contentType: 'text/html; charset=utf-8', body }));
    await page.route(u => /\/vendor\/three\/|pep-quilt\.js$/.test(u.pathname), r => r.fulfill(r.request().method() === 'HEAD' ? { status: 200, body: '' } : { status: 404, body: '' }));
    await page.goto(url, { waitUntil: 'load', timeout: 90000 });
    await page.waitForFunction(() => window.PEP && PEP.status && ['header', 'hero'].every(k => PEP.status[k] === 'ready' || PEP.status[k] === 'failed'), null, { timeout: 30000 });
    await page.waitForFunction(() => document.querySelector('[data-module="header"]').getAttribute('data-3d') === 'off', null, { timeout: 30000 }).catch(() => {});
    await page.waitForTimeout(700);
    return { ctx, page, errors };
  }
  const heroSeen = page => page.evaluate(() => {
    const vis = e => !!e && !e.closest('[hidden]') && e.getClientRects().length > 0;
    const line = Array.from(document.querySelectorAll('.pep-hero-form > .pep-hero-offer .pep-hero-offer-big')).filter(vis).map(e => e.textContent.trim());
    const btn = Array.from(document.querySelectorAll('.pep-hero-form button[type="submit"] .pep-hero-btn-label')).filter(vis).map(e => e.textContent.trim());
    return { line, btn, text: document.querySelector('.pep-hero-card').innerText.replace(/\s+/g, ' ') };
  });

  // flag-header-dropdown: every listed product whose sku is in PEP_CONFIG.flagged carries HIDE BEFORE LAUNCH; no other does
  for (const [w, h] of [[1440, 900], [390, 844]]) {
    const { ctx, page } = await loadEdit(w, h, "C.flags.PREVIEW=true;C.hidden=[];C.flagged=['bpc-157','kpv'];");
    if (w < 1200) await page.click('[data-menu-key]');
    await page.click('[data-key="peptides"]');
    await page.waitForSelector('[data-module="header"] a[data-sku]', { state: 'attached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(500);
    const f = await page.evaluate(() => Array.from(document.querySelectorAll('[data-module="header"] a[data-sku]')).map(a => {
      const li = a.closest('li');
      return { sku: a.getAttribute('data-sku'), name: a.textContent, tagged: /HIDE BEFORE LAUNCH/.test(li.innerText), shown: a.getClientRects().length > 0 };
    }));
    const want = f.filter(x => x.sku === 'bpc-157' || x.sku === 'kpv'), wrong = f.filter(x => (x.sku === 'bpc-157' || x.sku === 'kpv') !== x.tagged);
    ok(f.length >= 10 && want.length === 2 && wrong.length === 0 && want.every(x => x.shown && x.name.indexOf('HIDE') < 0),
      `${w}x${h}: in the ${w < 1200 ? 'MENU list' : 'PEPTIDES drop-down'} the 2 flagged products of ${f.length} carry HIDE BEFORE LAUNCH and no other does` + (wrong.length ? ' (wrong: ' + wrong.map(x => x.sku + (x.tagged ? ' tagged' : ' untagged')).join(', ') + ')' : ''));
    await ctx.close();
  }

  // gates: with PREVIEW off the hero never says "new lot" unless restock is cleared; the offer line is read from config only
  {
    let r = await loadEdit(1440, 900, 'C.flags.PREVIEW=false;');
    let s = await heroSeen(r.page);
    ok(s.line.length === 1 && s.line[0] === TWIN && !/NEW LOT|FOR LIFE|FOUNDER SPOT|\d\s*%/i.test(s.text) && s.btn.join() === 'GET MY FOUNDER CARD',
      `PREVIEW off, nothing cleared: the hero line is "${TWIN}" with no new-lot or offer wording (got "${s.line.join(' | ')}", button "${s.btn.join()}")`);
    await r.ctx.close();
    r = await loadEdit(1440, 900, 'C.flags.PREVIEW=false;C.flags.COUNSEL_CLEARED.restock=true;');
    s = await heroSeen(r.page);
    ok(s.line.length === 1 && s.line[0] === SAFE, `PREVIEW off, restock cleared: the hero line is "${SAFE}" (got "${s.line.join(' | ')}")`);
    await r.ctx.close();
    r = await loadEdit(1440, 900, "C.flags.PREVIEW=false;C.flags.COUNSEL_CLEARED.offer=true;C.offer.text='TEST LINE FROM CONFIG.';");
    s = await heroSeen(r.page);
    const html = await (await r.ctx.request.get(url)).text();
    const real = (/\n  offer: \{[^}]*?\n    text: '([^'\n]*)'/.exec(html) || [])[1] || '';
    const mine = ['<style data-pep-src="modules/05-header/header.css">|</style>', '<style data-pep-src="modules/10-hero/hero.css">|</style>', '<header data-module="header"|</header>', '<section data-module="hero"|</section>', '<script data-pep-src="modules/05-header/header.js">|</script>']
      .map(p => region(html, p.split('|')[0], p.split('|')[1])).join('\n');
    ok(s.line.length === 1 && s.line[0] === 'TEST LINE FROM CONFIG.' && real.length > 8 && mine.indexOf(real) < 0 && mine.indexOf(real.replace(/\.$/, '')) < 0,
      `the hero's offer line comes only from PEP_CONFIG.offer.text (an edited config shows "${s.line.join(' | ')}"; copies of "${real}" in 05-header and 10-hero source: ${mine.split(real.replace(/\.$/, '')).length - 1})`);
    await r.ctx.close();
  }

  // hdr-keyboard-tucked: the keyboard reaching the tucked bar must not move the page
  for (const reduce of [false, true]) {
    const { ctx, page } = await loadEdit(1440, 900, '', { reduce });
    await page.mouse.move(700, 450);
    for (let i = 0; i < 8; i++) { await page.mouse.wheel(0, 400); await page.waitForTimeout(150); }
    await page.waitForFunction(() => document.querySelector('[data-module="header"]').hasAttribute('data-tuck'), null, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(600);
    const before = await page.evaluate(() => { if (document.activeElement && document.activeElement.blur) document.activeElement.blur(); window.__lowY = scrollY; addEventListener("scroll", () => { window.__lowY = Math.min(window.__lowY, scrollY); }); return { y: Math.round(scrollY), tuck: document.querySelector('[data-module="header"]').hasAttribute('data-tuck') }; });
    await page.keyboard.press('Tab');
    await page.waitForTimeout(700);
    const after = await page.evaluate(() => { const hd = document.querySelector('[data-module="header"]'); return { y: Math.round(scrollY), low: Math.round(window.__lowY), tuck: hd.hasAttribute('data-tuck'), inHeader: hd.contains(document.activeElement), top: Math.round(hd.getBoundingClientRect().top) }; });
    ok(before.tuck && after.inHeader && Math.abs(before.y - after.y) <= 4 && before.y - after.low <= 4 && !after.tuck && after.top >= 0,
      `Tab into the tucked bar${reduce ? ' (reduced motion)' : ''}: the page stays put and the bar is back (was tucked ${before.tuck}, focus in bar ${after.inHeader}, page moved ${before.y - after.y}px from ${before.y}, furthest it went on the way ${before.y - after.low}px, bar top ${after.top}px)`);
    await ctx.close();
  }

  // hdr-no3d-phone: with no WebGL the flat name stands in for the P and must stay clear of MENU on phones
  for (const w of [390, 360, 320]) {
    const { ctx, page } = await loadEdit(w, 844, '');
    const n = await page.evaluate(() => {
      const hd = document.querySelector('[data-module="header"]'), nm = hd.querySelector('.pep-header-name'), mk = hd.querySelector('[data-menu-key]');
      const a = nm.getBoundingClientRect(), b = mk.getBoundingClientRect();
      return { off: hd.getAttribute('data-3d') === 'off', shown: nm.getClientRects().length > 0, right: Math.round(a.right), left: Math.round(a.left), menu: Math.round(b.left), size: parseFloat(getComputedStyle(nm).fontSize), hdLeft: Math.round(hd.getBoundingClientRect().left),
        cartRight: Math.round(hd.querySelector('[data-cart-open]').getBoundingClientRect().right), hdRight: Math.round(hd.getBoundingClientRect().right) };
    });
    ok(n.off && n.shown && n.right <= n.menu - 2 && n.size >= 12 && n.left >= n.hdLeft && n.cartRight <= n.hdRight,
      `${w}px, no WebGL: the flat PEPTICITY name (${n.size.toFixed(1)}px, ends at ${n.right}px) stays clear of MENU (starts at ${n.menu}px); 3D off ${n.off}`);
    await ctx.close();
  }

  await browser.close();
  console.log(`\n${passes} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch(e => { console.error(e); process.exit(2); });

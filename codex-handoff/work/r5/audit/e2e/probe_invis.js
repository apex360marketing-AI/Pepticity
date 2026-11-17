// which ancestor makes these text elements invisible while on screen? usage: node probe_invis.js <url>
const L = require('./lib');
(async () => { const b = await L.chromium.launch(L.LAUNCH); const { ctx, page } = await L.open(b, 'desktop', process.argv[2]);
  for (const [sel, name] of [['.pep-standard-label', 'standard'], ['.pep-story-name', 'story']]) {
    await page.evaluate((s) => document.querySelector(s).scrollIntoView({ block: 'center' }), sel); await L.settleScroll(page); await L.frames(page, 90);
    const r = await page.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const chain = []; let n = e; while (n && n.nodeType === 1) { const cs = getComputedStyle(n); if (parseFloat(cs.opacity) < 0.99 || cs.visibility === 'hidden') chain.push(n.tagName + '.' + String(n.className).split(' ')[0] + ' op=' + cs.opacity + ' vis=' + cs.visibility); n = n.parentElement; } const b = e.getBoundingClientRect(); return e.textContent.trim() + ' top=' + Math.round(b.top) + ' ' + chain.join(' < '); }), sel);
    console.log('note   ' + name + ': ' + r.join(' | '));
    await L.shot(page, `rc5-invis-${name}.png`);
  }
  await ctx.close(); await b.close(); })();

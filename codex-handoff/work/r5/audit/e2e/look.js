// first look: viewport screenshots down the page, desktop + phone
const L = require('./lib');
const URL_ = process.argv[2] || 'http://127.0.0.1:8965/new/';
(async () => {
  const b = await L.chromium.launch(L.LAUNCH);
  for (const kind of ['desktop', 'phone']) {
    const { ctx, page, rec } = await L.open(b, kind, URL_);
    await L.frames(page, 60);
    const H = await page.evaluate(() => document.documentElement.scrollHeight), vh = await page.evaluate(() => innerHeight);
    console.log(kind, 'docH', H, 'vh', vh);
    let i = 0;
    for (let y = 0; y < H; y += vh * (kind === 'desktop' ? 1 : 1)) {
      await page.evaluate((y) => window.scrollTo(0, y), y); await L.settleScroll(page); await L.frames(page, 20);
      if (i < 40) await L.shot(page, `look-${kind}-${String(i).padStart(2, '0')}.png`, { animations: 'allow' });
      i++;
    }
    console.log(kind, 'shots', i, 'errs', rec.pageerror.length, rec.console.length, rec.bad.length, rec.failed.length, (await rec.csp()).length);
    await ctx.close();
  }
  await b.close();
})().catch((e) => { console.log('ERR', e.message); process.exit(1); });

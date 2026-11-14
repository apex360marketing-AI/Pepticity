// Working-order test for the store. usage: node /home/user/work/works.js <url-of-new/> <outDir>
// Prints PASS/FAIL per check at desktop and phone, page errors, failed requests and broken images.
const { chromium, devices } = require('playwright');
const [url, out] = process.argv.slice(2);
const visible = (page, sel) => page.locator(sel).first().isVisible().catch(() => false);

async function run(browser, tag, opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  const errors = [], failed = [];
  page.on('pageerror', e => errors.push(String(e).slice(0, 160)));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text().slice(0, 160)); });
  page.on('response', r => { if (r.status() >= 400) failed.push(r.status() + ' ' + r.url().slice(-80)); });
  const res = [];
  const check = async (name, fn) => {
    try { const v = await fn(); res.push(`${v === true ? 'PASS' : 'FAIL'} ${name}${typeof v === 'string' ? ' (' + v + ')' : ''}`); }
    catch (e) { res.push(`FAIL ${name} (${String(e).split('\n')[0].slice(0, 120)})`); }
  };
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(9000);
  await page.screenshot({ path: `${out}/${tag}-top.png` });

  await check('hero join form visible on first screen', async () => {
    const b = await page.locator('#pep-hero-email').boundingBox();
    const vh = page.viewportSize().height;
    return b ? (b.y >= 0 && b.y + b.height <= vh ? true : `field at y=${Math.round(b.y)} of ${vh}`) : 'no field box';
  });
  await check('peptides menu opens', async () => {
    const key = tag === 'phone' ? '.pep-header-menu' : '[data-key="peptides"]';
    await page.locator(key).first().click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const open = await page.evaluate(() => !!document.querySelector('[aria-expanded="true"]'));
    await page.screenshot({ path: `${out}/${tag}-menu.png` });
    await page.keyboard.press('Escape');
    await page.waitForTimeout(400);
    return open;
  });
  await check('add to cart from shelf', async () => {
    // walk down the page so lazily built sections exist, then take the first add button that is really shown
    for (let y = 0; y < 30; y++) { await page.mouse.wheel(0, 900); await page.waitForTimeout(120); }
    const add = page.locator('.pep-shelf-add:visible').first();
    await add.scrollIntoViewIfNeeded({ timeout: 8000 });
    await page.waitForTimeout(600);
    await add.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const n = await page.evaluate(() => document.querySelector('[data-key="cart"]')?.textContent.replace(/\s+/g, ' ').trim());
    return /[1-9]/.test(n || '') ? true : `cart key reads "${n}"`;
  });
  await check('cart opens', async () => {
    await page.locator('[data-key="cart"]').first().click({ timeout: 5000 });
    await page.waitForTimeout(900);
    const ok = await visible(page, '.pep-cart-x');
    await page.screenshot({ path: `${out}/${tag}-cart.png` });
    if (ok) await page.locator('.pep-cart-x').first().click().catch(() => {});
    await page.waitForTimeout(500);
    return ok;
  });
  await check('guide opens', async () => {
    await page.locator('.pep-guide-launch').first().click({ timeout: 5000 });
    await page.waitForTimeout(900);
    const ok = await visible(page, '.pep-guide-x');
    if (ok) await page.locator('.pep-guide-x').first().click().catch(() => {});
    await page.waitForTimeout(500);
    return ok;
  });
  await check('terms sheet opens', async () => {
    const t = page.locator('[data-sheet-open="terms"]').first();
    await t.scrollIntoViewIfNeeded({ timeout: 8000 });
    await t.click({ timeout: 5000 });
    await page.waitForTimeout(800);
    const ok = await visible(page, '.pep-footer-close');
    if (ok) await page.locator('.pep-footer-close').first().click().catch(() => {});
    return ok;
  });
  await check('no broken images', async () => {
    const bad = await page.evaluate(() => [...document.images].filter(i => i.complete && i.naturalWidth === 0 && i.getAttribute('src')).map(i => i.getAttribute('src').slice(-50)));
    return bad.length ? `broken: ${bad.slice(0, 5).join(', ')}` : true;
  });
  res.push(`page errors: ${errors.length}${errors.length ? ' | ' + [...new Set(errors)].slice(0, 6).join(' | ') : ''}`);
  res.push(`failed requests: ${failed.length}${failed.length ? ' | ' + [...new Set(failed)].slice(0, 6).join(' | ') : ''}`);
  console.log(`--- ${tag}\n` + res.join('\n'));
  await ctx.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  await run(browser, 'desk', { viewport: { width: 1440, height: 900 } });
  await run(browser, 'phone', devices['iPhone 13']);
  await browser.close();
})().catch(e => { console.error(String(e)); process.exit(1); });

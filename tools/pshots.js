// Close-up pictures of the live 3D P and wordmark on a build. usage: node pshots.js <url> <outPrefix>
const { chromium } = require('playwright');
const [url, out] = process.argv.slice(2);
(async () => {
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(12000);
  await page.screenshot({ path: `${out}-top.png`, clip: { x: 0, y: 0, width: 1440, height: 420 } });
  const crest = page.locator('[data-module="crest"]').first();
  if (await crest.count()) {
    await crest.scrollIntoViewIfNeeded().catch(() => {});
    await page.waitForTimeout(6000);
    await page.screenshot({ path: `${out}-crest.png` });
  }
  console.log('saved', out);
  await browser.close();
})().catch(e => { console.error(String(e)); process.exit(1); });

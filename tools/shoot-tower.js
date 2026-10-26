// node tools/shoot-tower.js <file.html> <tag> [m]
const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process'); const fs = require('fs'); const cache = {};
function get(u) { if (!cache[u]) cache[u] = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/141.0', u], { maxBuffer: 1e8 }); return cache[u]; }
const NM = '/home/user/Apex_Agents_Bots/node_modules/';
function localFor(u) { const m = /cdn\.jsdelivr\.net\/npm\/(@?[a-z0-9.-]+)@[\d.]+\/(.+)$/.exec(u); if (!m) return null; const p = NM + m[1] + '/' + m[2].split('?')[0]; return fs.existsSync(p) ? p : null; }
const [file, tag, m] = process.argv.slice(2); const mob = m === 'm';
const OUT = '/home/user/pepticity/sites/tower/shots/'; fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push('PE ' + e.message.slice(0, 160))); p.on('console', c => { if (c.type() === 'error') errs.push('CE ' + c.text().slice(0, 160)); });
  await p.route('**/*', r => { const u = r.request().url(); if (/^(http:\/\/127|data:|blob:)/.test(u)) return r.continue(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) { try { return r.fulfill({ body: get(u), contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' }); } catch (e) { return r.abort(); } } const lp = localFor(u); if (lp) return r.fulfill({ path: lp, contentType: 'application/javascript' }); try { return r.fulfill({ body: get(u), contentType: 'application/javascript' }); } catch (e) { return r.abort(); } });
  const url = 'http://127.0.0.1:8765' + file + (mob ? '' : '');
  if (mob) { const html = fs.readFileSync(file, 'utf8'); fs.writeFileSync(file.replace('.html', '.m.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"></head><body>' + html + '</body></html>'); }
  await p.goto('http://127.0.0.1:8765' + (mob ? file.replace('.html', '.m.html') : file), { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(5000);
  const tag2 = tag + (mob ? '-m' : '');
  await p.screenshot({ path: OUT + tag2 + '-0hero.png' });
  const J = await p.evaluate(() => { const j = document.getElementById('journey'); return { top: j.getBoundingClientRect().top + scrollY, h: j.offsetHeight }; });
  for (const f of [0.08, 0.3, 0.55, 0.7, 0.86, 0.97]) {
    await p.evaluate(y => { const L = window.__descent && window.__descent.lenis; if (L) L.scrollTo(y, { immediate: true }); else scrollTo(0, y); }, Math.round(J.top + f * (J.h - vp.height)));
    await p.waitForTimeout(1800); await p.screenshot({ path: OUT + tag2 + '-j' + Math.round(f * 100) + '.png' });
  }
  for (const s of ['#skyline', '#pricing', '#area']) {
    await p.evaluate(sel => { const L = window.__descent && window.__descent.lenis, el = document.querySelector(sel); const y = el.getBoundingClientRect().top + scrollY; if (L) L.scrollTo(y, { immediate: true }); else scrollTo(0, y); }, s);
    await p.waitForTimeout(1800);
    if (s === '#skyline' && !mob) { const w = await p.locator('.win').nth(9).boundingBox(); if (w) { await p.mouse.move(w.x + w.width / 2, w.y + w.height / 2); await p.waitForTimeout(700); } }
    await p.screenshot({ path: OUT + tag2 + '-' + s.slice(1) + '.png' });
  }
  const st = await p.evaluate(() => ({ ov: document.documentElement.scrollWidth - innerWidth, wins: document.querySelectorAll('.win').length, gl: !document.documentElement.classList.contains('nogl') }));
  console.log(tag2, JSON.stringify(st), 'errs', errs.slice(0, 5));
  await b.close();
})();

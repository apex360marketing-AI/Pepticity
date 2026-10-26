const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process'); const fs = require('fs'); const cache = {}; function get(u) { if (!cache[u]) cache[u] = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/141.0', u], { maxBuffer: 1e8 }); return cache[u]; }
const NM = '/home/user/Apex_Agents_Bots/node_modules/';
function localFor(u) { const m = /(?:cdn\.jsdelivr\.net\/npm|unpkg\.com)\/(@?[a-z0-9.-]+(?:\/[a-z0-9.-]+)?)@[\d.]+\/(.+)$/.exec(u); if (!m) return null; const p = NM + m[1] + '/' + m[2].split('?')[0]; return fs.existsSync(p) ? p : null; }
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--use-gl=swiftshader', '--enable-webgl', '--ignore-gpu-blocklist'] });
  for (const f of process.argv.slice(2)) {
    const p = await (await b.newContext({ viewport: { width: 1440, height: 900 } })).newPage(); const errs = [];
    p.on('pageerror', e => errs.push(e.message.slice(0, 120)));
    await p.route('**/*', r => { const u = r.request().url(); if (/^(http:\/\/127|data:|blob:)/.test(u)) return r.continue(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return r.fulfill({ body: get(u), contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' }); const lp = localFor(u); if (lp) return r.fulfill({ path: lp, contentType: 'application/javascript' }); try { return r.fulfill({ body: get(u), contentType: /\.css/.test(u) ? 'text/css' : 'application/javascript' }); } catch (e) { return r.abort(); } });
    await p.goto('http://127.0.0.1:8765/home/user/Apex_Agents_Bots/design/landing-options/' + f, { waitUntil: 'commit', timeout: 90000 }); await p.waitForTimeout(6000);
    const n = f.replace('.html', '');
    await p.screenshot({ path: '/home/user/pepticity/sites/compare/' + n + '-a.png' });
    const H = await p.evaluate(() => document.documentElement.scrollHeight);
    for (const k of [0.12, 0.3]) { await p.mouse.wheel(0, 0); await p.evaluate(y => scrollTo(0, y), Math.round(H * k)); await p.waitForTimeout(2200); await p.screenshot({ path: '/home/user/pepticity/sites/compare/' + n + '-' + k + '.png' }); }
    console.log(f, 'h', H, 'errs', errs.slice(0, 2));
  }
  await b.close();
})();

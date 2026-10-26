// Red-team the vetted help bot. node tools/bot63.js d|m
const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process'); const cache = {}; function get(u) { if (!cache[u]) cache[u] = execFileSync('curl', ['-sS', '-A', 'Mozilla/5.0 Chrome/141.0', u], { maxBuffer: 1e8 }); return cache[u]; }
const mode = process.argv[2] || 'd', OUT = '/home/user/pepticity/sites/v6-garnet/shots63/bot-' + mode + '-';
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const mob = mode === 'm', vp = mob ? { width: 390, height: 844 } : { width: 1440, height: 900 };
  const ctx = await b.newContext({ viewport: vp, isMobile: mob, hasTouch: mob }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(e.message));
  await p.route('**/*', r => { const u = r.request().url(); if (/^(http:\/\/127|data:|blob:)/.test(u)) return r.continue(); if (/fonts\.(googleapis|gstatic)\.com/.test(u)) return r.fulfill({ body: get(u), contentType: u.includes('googleapis') ? 'text/css' : 'font/woff2' }); return r.abort(); });
  await p.goto('http://127.0.0.1:8765/home/user/pepticity/sites/v6-garnet/dist/preview.html'); await p.waitForTimeout(400); await p.keyboard.press('Escape'); await p.waitForTimeout(1500);
  await p.screenshot({ path: OUT + 'launcher.png' });
  await p.click('.cc-launch'); await p.waitForTimeout(700); await p.screenshot({ path: OUT + 'open.png' });
  console.log('focus', await p.evaluate(() => document.activeElement.id));
  const last = () => p.evaluate(() => { const m = [...document.querySelectorAll('.cc-bot')].pop(); return m.innerText.replace(/\s+/g, ' ').slice(0, 260); });
  const Qs = ['What dose of BPC-157 should I take?', 'which peptide is best for me', 'what peptides do you have', 'do I need blood work', 'my order arrived warm', 'do you take insurance', 'is my information private', 'how long until I hear back', 'can my wife join too', 'how do I store it', 'is this legal', 'how much does it cost', 'can I get a refund', 'do I have to go in person', 'is tirzepatide approved', 'I have chest pain'];
  for (const q of Qs) { await p.fill('#cc-q', q); await p.keyboard.press('Enter'); await p.waitForTimeout(250); console.log('Q:', q, '\n  A:', await last()); }
  await p.screenshot({ path: OUT + 'convo.png' });
  await p.click('.cc-chip:has-text("Browse the peptides")'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + 'browse.png' });
  await p.click('.cc-pbtn:has-text("Tesamorelin") >> nth=-1'); await p.waitForTimeout(500); await p.screenshot({ path: OUT + 'prod.png' });
  await p.keyboard.press('Escape'); await p.waitForTimeout(500);
  console.log('closed', await p.evaluate(() => ({ hidden: document.getElementById('concierge').hidden, focus: document.activeElement.className, inert: document.querySelector('main').inert })));
  const banned = await p.evaluate(() => { const t = document.getElementById('concierge').innerText.toLowerCase(); return ['boosts', 'heals', 'burns', 'promotes', 'enhances', 'research purposes only', 'dosage:', 'cycle length', 'lorem'].filter(w => t.includes(w)); });
  console.log('banned in bot text', banned, 'errs', errs, 'overflow', await p.evaluate(() => document.documentElement.scrollWidth - innerWidth));
  await b.close();
})();

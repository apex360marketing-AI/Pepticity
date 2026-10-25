const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process');
const S='/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/';
const cache={};function get(u){ if(!cache[u]) cache[u]=execFileSync('curl',['-sS','-A','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',u],{maxBuffer:1e8}); return cache[u]; }
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});const p=await b.newPage({viewport:{width:1440,height:900}});
await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>{const u=r.request().url();r.fulfill({body:get(u),contentType:u.includes('googleapis')?'text/css':'font/woff2'})});
await p.goto('http://127.0.0.1:8765'+S+'fontlab/preview.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>[...document.fonts].filter(f=>/Dela/.test(f.family)).map(f=>f.status+' '+f.unicodeRange.slice(0,30)).slice(0,6)));
await p.locator('.card').nth(6).screenshot({path:S+'f07.png'});
await p.locator('.card').nth(0).screenshot({path:S+'f01.png'});await b.close()})();

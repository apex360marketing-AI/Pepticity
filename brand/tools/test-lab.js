const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process');
const S='/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/';
const cache={};
function get(u){ if(!cache[u]) cache[u]=execFileSync('curl',['-sS','-A','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',u],{maxBuffer:1e8}); return cache[u]; }
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [n,vp,mob] of [['d',{width:1440,height:900},false],['m',{width:390,height:844},true]]){
 const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob});await ctx.grantPermissions(['clipboard-read','clipboard-write']).catch(()=>{});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>{const u=r.request().url();const body=get(u);r.fulfill({body,contentType:u.includes('googleapis')?'text/css':'font/woff2'})});
 await p.goto('http://127.0.0.1:8765/home/user/pepticity/brand/dist/preview.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1200);
 await p.screenshot({path:S+`lab-${n}-top.png`});
 await p.evaluate(()=>document.querySelector('#g-d').scrollIntoView());await p.waitForTimeout(800);
 await p.screenshot({path:S+`lab-${n}-grid.png`});
 await p.locator('#g-d .card .pick').nth(2).click();await p.locator('#g-h .card .pick').first().click();await p.waitForTimeout(400);
 await p.locator('#g-d .card .ph').nth(5).click();await p.waitForTimeout(900);
 await p.screenshot({path:S+`lab-${n}-lb.png`});
 await p.keyboard.press('ArrowRight');await p.waitForTimeout(500);
 const t=await p.textContent('#lb-t');
 await p.click('#lb-x');await p.click('#copy');await p.waitForTimeout(300);
 const bar=await p.textContent('#bar');const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 const imgs=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length);
 console.log(n,'errs',errs,'lb',t,'bar',bar.replace(/\s+/g,' '),'overflow',ov,'brokenImgs',imgs);
 await ctx.close();}
await b.close()})();

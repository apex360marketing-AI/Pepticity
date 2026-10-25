const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process');
const S='/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/';
const cache={};function get(u){ if(!cache[u]) cache[u]=execFileSync('curl',['-sS','-A','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',u],{maxBuffer:1e8}); return cache[u]; }
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
for(const [n,vp,mob] of [['d',{width:1440,height:900},false],['m',{width:390,height:844},true]]){
 const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.route(/fonts\.(googleapis|gstatic)\.com/,r=>{const u=r.request().url();r.fulfill({body:get(u),contentType:u.includes('googleapis')?'text/css':'font/woff2'})});
 await p.goto('http://127.0.0.1:8765'+S+'fontlab/preview.html');await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(1500);
 const missing=await p.evaluate(()=>PEPFONTS.F.filter(f=>!document.fonts.check(f.w+' 40px '+f.fam,'PEPTICITY')).map(f=>f.id));
 const clipped=await p.evaluate(()=>[...document.querySelectorAll('.big')].filter(n=>n.scrollWidth>n.parentNode.clientWidth-20).length);
 await p.screenshot({path:S+`fl-${n}-top.png`});
 await p.evaluate(()=>document.querySelector('#grid').scrollIntoView());await p.waitForTimeout(600);await p.screenshot({path:S+`fl-${n}-grid.png`});
 await p.evaluate(()=>document.querySelectorAll('.card')[13].scrollIntoView());await p.waitForTimeout(800);await p.screenshot({path:S+`fl-${n}-grid2.png`});
 await p.fill('#try','AOD-9604');await p.locator('.card .pick').nth(1).click();await p.locator('.card figure').nth(4).click();await p.waitForTimeout(800);
 await p.screenshot({path:S+`fl-${n}-lb.png`});await p.click('#lb-x');await p.click('[data-bg=light]');await p.waitForTimeout(300);
 await p.evaluate(()=>document.querySelector('#grid').scrollIntoView());await p.waitForTimeout(400);await p.screenshot({path:S+`fl-${n}-light.png`});
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).length);
 console.log(n,'errs',errs,'fontsNotLoaded',missing,'clipped',clipped,'overflow',ov,'broken',broken,'bar',(await p.textContent('#bar')).replace(/\s+/g,' '));await ctx.close();}
await b.close()})();

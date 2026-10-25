const { chromium } = require('playwright-core');const fs=require('fs');
const NM='/home/user/Apex_Agents_Bots/node_modules/';
function localFor(u){const m=/cdn\.jsdelivr\.net\/npm\/([a-z]+)@[\d.]+\/(.+)$/.exec(u);if(!m)return null;const p=NM+m[1]+'/'+m[2].split('?')[0];return fs.existsSync(p)?p:null}
const [slug,mode]=process.argv.slice(2);const OUT=`/home/user/pepticity/sites/${slug}/shots/`;
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
for(const [n,vp,mob] of (mode==='m'?[['m',{width:390,height:844},true]]:mode==='d'?[['d',{width:1440,height:900},false]]:[['d',{width:1440,height:900},false],['m',{width:390,height:844},true]])){
 const ctx=await b.newContext({viewport:vp,hasTouch:mob,isMobile:mob});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PAGEERR '+e.message.slice(0,160)));p.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource/.test(m.text()))errs.push('CON '+m.text().slice(0,160))});
 await p.route('**/*',r=>{const u=r.request().url();if(/^(http:\/\/127|data:|blob:)/.test(u))return r.continue();const lp=localFor(u);if(lp)return r.fulfill({path:lp,contentType:'application/javascript'});return r.abort()});
 await p.goto('http://127.0.0.1:8765/home/user/pepticity/sites/'+slug+'/dist/preview.html');
 for(const t of [1500,4000,6500,8500]){await p.waitForTimeout(t===1500?1500:t-(t===4000?1500:t===6500?4000:6500));await p.screenshot({path:OUT+`${n}-intro-${t}.png`})}
 await p.waitForTimeout(2500);
 const introHidden=await p.evaluate(()=>{const i=document.getElementById('intro');return !i||i.hidden});
 await p.screenshot({path:OUT+`${n}-home-0.png`});
 const H=await p.evaluate(()=>document.documentElement.scrollHeight);
 const shots=[0.08,0.16,0.3,0.45,0.6,0.75,0.9];
 for(const f of shots){await p.evaluate(y=>window.scrollTo(0,y),Math.round(H*f));await p.waitForTimeout(1200);await p.screenshot({path:OUT+`${n}-home-${Math.round(f*100)}.png`})}
 const ov={};
 for(const v of ['shop','science','faq','home']){await p.evaluate(v=>{location.hash=v},v);await p.waitForTimeout(1800);ov[v]=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);await p.screenshot({path:OUT+`${n}-view-${v}.png`});
   if(v==='science'){const H2=await p.evaluate(()=>document.documentElement.scrollHeight);await p.evaluate(y=>window.scrollTo(0,y),Math.round(H2*0.55));await p.waitForTimeout(900);await p.screenshot({path:OUT+`${n}-view-science-2.png`})}}
 // quiz
 await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(500);
 await p.locator('[data-quiz]:visible').first().click();await p.waitForTimeout(700);
 for(let i=0;i<5;i++){const o=p.locator('#pep-quiz .pq-opt').first();if(!(await o.count()))break;await o.click();await p.waitForTimeout(300)}
 await p.screenshot({path:OUT+`${n}-quiz-result.png`});
 await p.fill('#pep-quiz .pq-input','sam@example.com').catch(()=>{});await p.locator('#pep-quiz .pq-chip').first().click().catch(()=>{});
 await p.locator('#pep-quiz button[type=submit]').click().catch(()=>{});await p.waitForTimeout(400);
 const quizMsg=await p.evaluate(()=>document.querySelector('#pep-quiz .pq-q')&&document.querySelector('#pep-quiz .pq-q').textContent);
 await p.screenshot({path:OUT+`${n}-quiz-done.png`});
 console.log(slug,n,'errors',errs.length,errs.slice(0,6),'introHidden',introHidden,'overflow',JSON.stringify(ov),'quiz:',quizMsg);
 await ctx.close();}
await b.close()})();

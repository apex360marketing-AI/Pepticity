const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const { execFileSync } = require('child_process');const fs=require('fs');
const NM='/home/user/Apex_Agents_Bots/node_modules/';
function localFor(u){const m=/cdn\.jsdelivr\.net\/npm\/([a-z]+)@[\d.]+\/(.+)$/.exec(u);if(!m)return null;const p=NM+m[1]+'/'+m[2].split('?')[0];return fs.existsSync(p)?p:null}
const cache={};function get(u){ if(!cache[u]) cache[u]=execFileSync('curl',['-sS','-A','Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36',u],{maxBuffer:1e8}); return cache[u]; }
const OUT='/home/user/pepticity/sites/v6-garnet/shots/';fs.mkdirSync(OUT,{recursive:true});
const mode=process.argv[2]||'d';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--autoplay-policy=no-user-gesture-required']});
for(const [n,vp,mob] of (mode==='m'?[['m',{width:390,height:844},true]]:[['d',{width:1440,height:900},false]])){
 const ctx=await b.newContext({viewport:vp,isMobile:mob,hasTouch:mob});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push('PE '+e.message.slice(0,200)));p.on('console',m=>{if(m.type()==='error')errs.push('CE '+m.text().slice(0,200))});
 await p.route('**/*',r=>{const u=r.request().url();if(/^(http:\/\/127|data:|blob:)/.test(u))return r.continue();if(/fonts\.(googleapis|gstatic)\.com/.test(u))return r.fulfill({body:get(u),contentType:u.includes('googleapis')?'text/css':'font/woff2'});const lp=localFor(u);if(lp)return r.fulfill({path:lp,contentType:'application/javascript'});return r.abort()});
 await p.goto('http://127.0.0.1:8765/home/user/pepticity/sites/v6-garnet/dist/preview.html');
 let last=0;for(const t of [600,2600,5200,7600]){await p.waitForTimeout(t-last);last=t;await p.screenshot({path:OUT+`${n}-in-${t}.png`})}
 const vid=await p.evaluate(()=>{const v=document.querySelector('.in-film');return v?{src:v.currentSrc,t:v.currentTime.toFixed(2),paused:v.paused,on:v.classList.contains('is-on')}:null});
 await p.waitForTimeout(2200);await p.screenshot({path:OUT+`${n}-hero-a.png`});await p.waitForTimeout(1600);await p.screenshot({path:OUT+`${n}-hero-b.png`});
 const sec=async(sel)=>p.evaluate(s=>{const a=document.querySelector(s);return {top:a.getBoundingClientRect().top+scrollY,h:a.offsetHeight}},sel);
 const T=await sec('.turn');for(const f of [0.05,0.4,0.75,0.97]){await p.evaluate(y=>scrollTo(0,y),Math.round(T.top+f*(T.h-vp.height)));await p.waitForTimeout(1300);await p.screenshot({path:OUT+`${n}-turn-${Math.round(f*100)}.png`})}
 const A=await sec('.anat');for(const f of (mob?[-0.4,0,0.3]:[0.08,0.28,0.5,0.7])){await p.evaluate(y=>scrollTo(0,y),Math.round(A.top+(mob?f*vp.height:f*(A.h-vp.height))));await p.waitForTimeout(mob?2600:1300);await p.screenshot({path:OUT+`${n}-anat-${Math.round(f*100)}.png`})}
 for(const s of ['.proof','.ledger','.closer']){await p.evaluate(s=>document.querySelector(s).scrollIntoView(),s);await p.waitForTimeout(1200);await p.screenshot({path:OUT+`${n}-${s.slice(1)}.png`})}
 const ov=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src));
 const rig=await p.evaluate(()=>[...document.querySelectorAll('canvas.rig')].map(c=>c.className));
 console.log(n,'errs',errs,'video',JSON.stringify(vid),'overflow',ov,'broken',broken,'rig',rig);
 await ctx.close();}
await b.close()})();

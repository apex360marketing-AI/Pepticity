const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const NM='/home/user/Apex_Agents_Bots/node_modules';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for (const [w,h,n] of (process.env.ONLY==='m'?[[390,844,'m']]:[[1440,900,'d'],[390,844,'m']])){
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*)$/,r=>{const f=path.join(NM,'three',r.request().url().match(/three@0\.160\.0\/(.*)$/)[1]);r.fulfill({status:200,body:fs.readFileSync(f),headers:{'content-type':'text/javascript','access-control-allow-origin':'*'}})});
 const t0=Date.now();await p.goto('http://127.0.0.1:8767'+__dirname+'/index.html');
 for (const ms of [700,2000,3300,4600,5900,6600,8200]){const d=ms-(Date.now()-t0);if(d>0)await p.waitForTimeout(d);await p.screenshot({path:`shots/L${n}-${ms}.png`});}
 const st1=await p.evaluate(()=>({hidden:document.getElementById('boot').hidden,ss:sessionStorage.getItem('pep-loader')}));
 await p.reload();await p.waitForTimeout(1500);
 const st2=await p.evaluate(()=>({hidden:document.getElementById('boot').hidden}));
 await p.click('#replayIntro');await p.waitForTimeout(2500);await p.screenshot({path:`shots/L${n}-replay.png`});
 await p.keyboard.press('Escape');await p.waitForTimeout(2200);
 const st3=await p.evaluate(()=>({hidden:document.getElementById('boot').hidden,y:scrollY}));
 await p.screenshot({path:`shots/L${n}-after.png`});
 console.log(n,JSON.stringify({st1,st2,st3}),errs.slice(0,5));await ctx.close();}
await b.close()})();

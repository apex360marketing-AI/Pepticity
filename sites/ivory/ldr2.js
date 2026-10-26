const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const NM='/home/user/Apex_Agents_Bots/node_modules';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for (const [w,h,n] of [[1440,900,'d'],[390,844,'m']]){
 const ctx=await b.newContext({viewport:{width:w,height:h}});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*)$/,r=>{const f=path.join(NM,'three',r.request().url().match(/three@0\.160\.0\/(.*)$/)[1]);r.fulfill({status:200,body:fs.readFileSync(f),headers:{'content-type':'text/javascript','access-control-allow-origin':'*'}})});
 await p.goto('http://127.0.0.1:8767'+__dirname+'/index.html');await p.waitForTimeout(9000);
 const t0=Date.now();await p.click('#replayIntro');
 for (const ms of [1200,2600,4000,5300,5700,6100,6600,7400]){const d=ms-(Date.now()-t0);if(d>0)await p.waitForTimeout(d);await p.screenshot({path:`shots/R${n}-${ms}.png`});}
 console.log(n,errs.slice(0,5));await ctx.close();}
await b.close()})();

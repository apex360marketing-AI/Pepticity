const {chromium}=require('playwright');const fs=require('fs'),path=require('path');
const NM='/home/user/Apex_Agents_Bots/node_modules';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome',args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
for (const [w,h,n,mob] of [[1440,900,'d',false],[390,844,'m',false]]){
 const ctx=await b.newContext({viewport:{width:w,height:h},isMobile:mob,hasTouch:mob});await ctx.addInitScript(()=>{try{sessionStorage.setItem('pep-loader','1')}catch(e){}});const p=await ctx.newPage();const errs=[];
 p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.route(/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.*)$/,r=>{const f=path.join(NM,'three',r.request().url().match(/three@0\.160\.0\/(.*)$/)[1]);r.fulfill({status:200,body:fs.readFileSync(f),headers:{'content-type':'text/javascript','access-control-allow-origin':'*'}})});
 await p.goto('http://127.0.0.1:8767'+__dirname+'/index.html');await p.waitForTimeout(3600);
 await p.screenshot({path:`shots/${n}-00.png`});
 for (const f of [.14,.3,.46,.58,.66,.76,.84,.96]){
   await p.evaluate(f=>{const m=document.documentElement.scrollHeight-innerHeight;scrollTo(0,m*f)},f);await p.waitForTimeout(2400);
   await p.screenshot({path:`shots/${n}-${String(Math.round(f*100)).padStart(2,'0')}.png`});
 }
 const st=await p.evaluate(()=>({gl:!!window.__ivGL,nogl:document.documentElement.classList.contains('nogl'),ov:document.documentElement.scrollWidth-innerWidth,t:window.__iv.t}));
 console.log(n,JSON.stringify(st),errs.slice(0,5));await ctx.close();}
await b.close()})();

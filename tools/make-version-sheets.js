// node tools/make-version-sheets.js [n-slug ...]
// Per version: desktop hero, reading statement mid-scroll, cards section (hover on first card), phone hero
// -> docs/owner/versions-sheets/<n-slug>.png (one sheet) + raw shots; thumbs via python afterwards.
const {chromium}=require('playwright'); const fs=require('fs'); const path=require('path');
const R='/home/user/Pepticity', OUT=R+'/docs/owner/versions-sheets', RAW=OUT+'/raw';
fs.mkdirSync(RAW,{recursive:true});
const all=fs.readdirSync(R+'/sites/versions').filter(d=>/^\d-/.test(d)).sort();
const list=process.argv.slice(2).length?process.argv.slice(2):all;
const URL=s=>`http://127.0.0.1:8765/sites/versions/${s}/?nointro`;
(async()=>{
 const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 for(const s of list){
  const meta=JSON.parse(fs.readFileSync(`${R}/sites/versions/${s}/version.json`));
  const shot=async(w,h,name,fn)=>{const ctx=await b.newContext({viewport:{width:w,height:h},deviceScaleFactor:1});
    await ctx.addInitScript(()=>{try{localStorage.setItem('pc-age-pass',JSON.stringify({ok:true,prov:'ON',exp:Date.now()+864e5}));localStorage.removeItem('pc-version')}catch(e){}});
    await ctx.route(/fonts\.(googleapis|gstatic)\.com/,r=>r.abort()); const p=await ctx.newPage(); await p.goto(URL(s),{waitUntil:'load',timeout:90000}); await p.waitForTimeout(3500);
    if(fn) await fn(p); await p.screenshot({path:`${RAW}/${s}-${name}.png`,timeout:120000}); await ctx.close();};
  const openGate=async p=>{await p.evaluate(()=>{const b=document.getElementById('toStore');if(b&&document.documentElement.classList.contains('gated'))b.click();});await p.waitForTimeout(4500);};
  const scrollTo=async(p,sel,frac)=>{if(sel!=='#say1')await openGate(p);await p.evaluate(([sel,frac])=>{const el=document.querySelector(sel);if(!el)return;
      const r=el.getBoundingClientRect();const top=r.top+scrollY;const span=Math.max(el.offsetHeight-innerHeight,0);
      window.scrollTo(0,top+span*frac-(span?0:innerHeight*.15));},[sel,frac]);await p.waitForTimeout(1500);
      await p.evaluate(([sel,frac])=>{const el=document.querySelector(sel);if(!el)return;const top=el.getBoundingClientRect().top+scrollY;const span=Math.max(el.offsetHeight-innerHeight,0);
      window.scrollTo(0,top+span*frac-(span?0:innerHeight*.15));},[sel,frac]);await p.waitForTimeout(2200);
      console.log('  ',sel,'y=',await p.evaluate(()=>scrollY));};
  await shot(1440,900,'hero');
  await shot(1440,900,'read',async p=>{await scrollTo(p,'#say1',.55);});
  await shot(1440,900,'choose',async p=>{await scrollTo(p,'#choose',.12);});
  await shot(1440,900,'cards',async p=>{await scrollTo(p,'#texts',0);await p.evaluate(()=>{const el=document.querySelector('#texts');if(el)window.scrollBy(0,el.getBoundingClientRect().top-90)});await p.waitForTimeout(1500);
     const c=await p.$('#texts [class*=card], #texts article, #texts button'); if(c){await c.hover().catch(()=>{});await p.waitForTimeout(900);} });
  await shot(390,844,'phone');
  const img=n=>'data:image/png;base64,'+fs.readFileSync(`${RAW}/${s}-${n}.png`).toString('base64');
  const fx=meta.effects.map(e=>`<li><b>${e.code}</b> ${e.name} <i>· ${e.where}</i></li>`).join('');
  const html=`<html><head><style>@font-face{font-family:P;src:url(file://${R}/brand/font/PepticityBlack.woff2)}
   body{margin:0;width:2000px;background:#1b1c1f;color:#eceff3;font:15px/1.5 system-ui,sans-serif;padding:36px;box-sizing:border-box}
   h1{font:400 34px P,sans-serif;letter-spacing:.08em;margin:0 0 4px;display:flex;align-items:center;gap:16px}
   .d{width:16px;height:16px;transform:rotate(45deg);background:${meta.hex};box-shadow:0 0 18px ${meta.hex}}
   .sub{color:#9aa1aa;letter-spacing:.12em;text-transform:uppercase;font-size:13px;margin-bottom:22px}
   .g{display:grid;grid-template-columns:1fr 1fr 300px;grid-template-rows:auto auto;gap:18px}
   figure{margin:0}figure img{width:100%;display:block;border:1px solid rgba(255,255,255,.14)}
   figcaption{font:400 12px P,sans-serif;letter-spacing:.14em;color:#9aa1aa;margin-top:8px}
   .ph{grid-row:span 2}.ph img{width:100%}
   ul{list-style:none;padding:0;margin:22px 0 0;columns:2;font-size:15px}li{margin:0 0 6px}li b{color:${meta.hex};font-family:ui-monospace,monospace;margin-right:6px}li i{color:#8f97a1;font-style:normal}</style></head><body>
   <h1><i class="d"></i>VERSION ${meta.n} · ${meta.name}</h1><div class="sub">${meta.hex} · same shape, logo, coin, films and tour · 7 effects below</div>
   <div class="g"><figure><img src="${img('hero')}"><figcaption>DESKTOP HERO</figcaption></figure>
   <figure><img src="${img('read')}"><figcaption>MID-SCROLL · READING STATEMENT</figcaption></figure>
   <figure class="ph"><img src="${img('phone')}"><figcaption>PHONE HERO</figcaption></figure>
   <figure><img src="${img('choose')}"><figcaption>SCROLL SECTION · HOW WE CHOOSE</figcaption></figure>
   <figure><img src="${img('cards')}"><figcaption>CARD + HOVER · TEXT ALERTS</figcaption></figure></div>
   <ul>${fx}</ul></body></html>`;
  const ctx=await b.newContext({viewport:{width:2000,height:1200}}); const p=await ctx.newPage();
  await p.setContent(html,{waitUntil:'load',timeout:90000}); await p.waitForTimeout(400);
  await p.screenshot({path:`${OUT}/${s}.png`,fullPage:true}); await ctx.close(); console.log('sheet',s);
 }
 await b.close();
})();

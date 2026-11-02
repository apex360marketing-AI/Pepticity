// Usage: node tools/measure-scroll.js <url> [label]   (smooth-scroll audit: flick, 10 s scripted scroll, keyboard, touch, RM)
// Heavy WebGL scripts (gl3d/hero-p/card3d) are aborted so timing is real; software GL here is ~2 fps.
const {chromium}=require('playwright');
const url=process.argv[2]||'http://127.0.0.1:8765/sites/site-one-sample/?nointro', label=process.argv[3]||'run';
const mk=async(b,o={})=>{const ctx=await b.newContext(Object.assign({viewport:{width:1440,height:900}},o));
 await ctx.addInitScript(()=>{try{localStorage.setItem('pc-age-pass',JSON.stringify({ok:true,prov:'ON',exp:Date.now()+864e5}))}catch(e){}});
 await ctx.route(/fonts\.g(oogleapis|static)/,r=>r.abort());
 await ctx.route(/(gl3d|hero-p|card3d)\.js|smoke-bg\.js/,r=>r.abort());
 const p=await ctx.newPage(); await p.goto(url,{waitUntil:'load',timeout:90000}); await p.waitForTimeout(2500); return {ctx,p};};
const sample=(p,ms)=>p.evaluate(ms=>new Promise(res=>{const t0=performance.now(),out=[];(function f(){const t=performance.now()-t0;out.push([Math.round(t),Math.round(scrollY)]);t<ms?requestAnimationFrame(f):res(out)})()}),ms);
const at=(s,t)=>{let v=s[0][1];for(const [a,y] of s){if(a<=t)v=y}return v};
(async()=>{
 const b=await chromium.launch({args:['--ignore-gpu-blocklist']});
 const R={label};
 // 1 hard flick from a mid-page spot
 {const {ctx,p}=await mk(b); await p.evaluate(()=>{window.__pc&&window.__pc.lenis&&window.__pc.lenis.scrollTo(2500,{immediate:true,force:true});scrollTo(0,2500)}); await p.waitForTimeout(1200);
  await p.mouse.move(700,450); const y0=await p.evaluate(()=>scrollY);
  const sp=sample(p,3500); await p.mouse.wheel(0,3000); const s=await sp;
  R.flick={y0, lenis:await p.evaluate(()=>!!(window.__pc&&window.__pc.lenis))}; for(const t of [250,500,1000,2000,3000])R.flick['d@'+t]=at(s,t)-s[0][1];
  let mx=0;for(let i=0;i<s.length;i++){for(let j=i;j<s.length&&s[j][0]-s[i][0]<=250;j++)mx=Math.max(mx,Math.abs(s[j][1]-s[i][1]))} R.flick.max250=mx; R.flick.vh=900; await ctx.close();}
 // 3 hard flicks quickly (stacking)
 {const {ctx,p}=await mk(b); await p.mouse.move(700,450); const sp=sample(p,3000); for(let i=0;i<3;i++){await p.mouse.wheel(0,3000);await p.waitForTimeout(60)} const s=await sp; R.triple={'d@500':at(s,500)-s[0][1],'d@1500':at(s,1500)-s[0][1],'d@3000':at(s,3000)-s[0][1]}; await ctx.close();}
 // keyboard
 {const {ctx,p}=await mk(b); await p.evaluate(()=>document.body.focus()); const sp=sample(p,2500); await p.keyboard.press('PageDown'); const s=await sp; R.pagedown={'d@100':at(s,100)-s[0][1],'d@400':at(s,400)-s[0][1],'d@1000':at(s,1000)-s[0][1],'d@2000':at(s,2000)-s[0][1]}; await ctx.close();}
 // 10 s scripted scroll: wheel 120px every 50ms, frame times + long tasks
 {const {ctx,p}=await mk(b); await p.evaluate(()=>{window.__lt=[];try{new PerformanceObserver(l=>l.getEntries().forEach(e=>__lt.push(Math.round(e.duration)))).observe({type:'longtask',buffered:true})}catch(e){} window.__ft=[];let l=performance.now();(function f(t){__ft.push(t-l);l=t;requestAnimationFrame(f)})(l)});
  await p.mouse.move(700,450); const y0=await p.evaluate(()=>scrollY); const t0=Date.now(); while(Date.now()-t0<10000){await p.mouse.wheel(0,120);await p.waitForTimeout(50)}
  const r=await p.evaluate(()=>({ft:__ft.slice(5),lt:__lt,y:scrollY})); const ft=r.ft; R.scripted10s={px:r.y-y0,frames:ft.length,maxFrame:Math.round(Math.max(...ft)),over50:ft.filter(x=>x>50).length,over100:ft.filter(x=>x>100).length,longtasks:r.lt.slice(0,12),nLong:r.lt.length}; await ctx.close();}
 // phone touch flick (CDP)
 {const {ctx,p}=await mk(b,{viewport:{width:390,height:844},hasTouch:true,isMobile:true}); const c=await ctx.newCDPSession(p); await p.evaluate(()=>scrollTo(0,2500)); await p.waitForTimeout(800); const y0=await p.evaluate(()=>scrollY);
  const sp=sample(p,3500); await c.send('Input.synthesizeScrollGesture',{x:195,y:700,yDistance:-1400,speed:6000,gestureSourceType:'touch'}); const s=await sp; R.touch={vh:844,lenis:await p.evaluate(()=>!!(window.__pc&&window.__pc.lenis)),'d@250':at(s,250)-s[0][1],'d@1000':at(s,1000)-s[0][1],'d@3000':at(s,3000)-s[0][1]}; await ctx.close();}
 // reduced motion
 {const {ctx,p}=await mk(b,{reducedMotion:'reduce'}); await p.mouse.move(700,450); const sp=sample(p,1500); await p.mouse.wheel(0,3000); const s=await sp; R.reduced={lenis:await p.evaluate(()=>!!(window.__pc&&window.__pc.lenis)),'d@250':at(s,250)-s[0][1],'d@1500':at(s,1500)-s[0][1]}; await ctx.close();}
 console.log(JSON.stringify(R,null,1)); await b.close();
})();

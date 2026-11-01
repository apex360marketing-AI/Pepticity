// Usage: node tools/shoot-versions.js <n-slug> [outdir]
// Loads http://127.0.0.1:8765/sites/versions/<slug>/?nointro at 1440x900 and 390x844 (age gate passed),
// prints console/page errors and sideways scroll, and saves hero / mid / cards / phone screenshots.
const {chromium}=require('playwright');
const slug=process.argv[2], out=process.argv[3]||'/tmp/vshots';
require('fs').mkdirSync(out,{recursive:true});
(async()=>{
  const b=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
  const errs=[];
  for(const [w,h,tag] of [[1440,900,'d'],[390,844,'m']]){
    const ctx=await b.newContext({viewport:{width:w,height:h}});
    await ctx.addInitScript(()=>{try{localStorage.setItem('pc-age-pass',JSON.stringify({ok:true,prov:'ON',exp:Date.now()+864e5}))}catch(e){}});
    const p=await ctx.newPage();
    p.on('pageerror',e=>errs.push(`[${tag}] pageerror ${e.message}`));
    p.on('console',m=>{if(m.type()==='error')errs.push(`[${tag}] console ${m.text()}`)});
    p.on('requestfailed',r=>errs.push(`[${tag}] reqfail ${r.url()}`));
    p.on('response',r=>{if(r.status()>=400)errs.push(`[${tag}] ${r.status()} ${r.url()}`)});
    await p.goto(`http://127.0.0.1:8765/sites/versions/${slug}/?nointro`,{waitUntil:'load'});
    await p.waitForTimeout(3500);
    await p.screenshot({path:`${out}/${slug}-${tag}-hero.png`});
    const H=await p.evaluate(()=>document.documentElement.scrollHeight);
    const sw=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    for(const f of (tag==='d'?[.18,.35,.55,.75]:[.3,.6])){
      await p.evaluate(y=>window.scrollTo(0,y),Math.round(H*f)); await p.waitForTimeout(1600);
      await p.screenshot({path:`${out}/${slug}-${tag}-${Math.round(f*100)}.png`});
    }
    const sw2=await p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
    console.log(`${slug} ${tag} height=${H} sideways=${Math.max(sw,sw2)}`);
    await ctx.close();
  }
  const uniq=[...new Set(errs)].filter(e=>!/fonts\.g(oogleapis|static)|cdn\.jsdelivr/.test(e)||/pageerror/.test(e));
  console.log('ERRORS',uniq.length); uniq.slice(0,30).forEach(e=>console.log(' ',e));
  await b.close();
})();

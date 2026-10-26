// Click every link and button on every view; report anything that does nothing, errors, or goes nowhere.
const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const fs=require('fs');const NM='/home/user/Apex_Agents_Bots/node_modules/';
function localFor(u){const m=/cdn\.jsdelivr\.net\/npm\/([a-z]+)@[\d.]+\/(.+)$/.exec(u);if(!m)return null;const p=NM+m[1]+'/'+m[2].split('?')[0];return fs.existsSync(p)?p:null}
const URL='http://127.0.0.1:8765/home/user/pepticity/sites/'+(process.argv[2]||'v6-garnet')+'/dist/preview.html';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
 const ctx=await b.newContext({viewport:{width:1440,height:900}});
 await ctx.addInitScript(()=>{try{sessionStorage.setItem('pep-intro-v6','1')}catch(e){}});
 const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));
 await p.route('**/*',r=>{const u=r.request().url();if(/^(http:\/\/127|data:|blob:)/.test(u))return r.continue();const lp=localFor(u);if(lp)return r.fulfill({path:lp,contentType:'application/javascript'});return r.abort()});
 await p.goto(URL);await p.waitForTimeout(1500);
 const views=['home','shop','science','faq'];const report=[];
 for(const v of views){
  await p.evaluate(v=>{location.hash=v},v);await p.waitForTimeout(1600);
  const items=await p.evaluate(()=>{const vis=e=>{const r=e.getBoundingClientRect();const s=getComputedStyle(e);return r.width>0&&r.height>0&&s.visibility!=='hidden'&&s.display!=='none'&&!e.closest('[hidden]')};
    return [...document.querySelectorAll('a[href],button')].filter(vis).map((e,i)=>{e.setAttribute('data-audit',i);return {i,tag:e.tagName,txt:(e.innerText||e.getAttribute('aria-label')||'').trim().replace(/\s+/g,' ').slice(0,40),href:e.getAttribute('href'),cls:e.className.toString().slice(0,40),attrs:[...e.attributes].map(a=>a.name).filter(n=>n.startsWith('data-')&&n!=='data-audit').join(',')}})});
  for(const it of items){
    const before=await p.evaluate(()=>({h:location.hash,y:scrollY,dlg:document.querySelector('dialog[open]')?1:0,cur:document.querySelector('#curtain.is-open')?1:0,html:document.body.innerHTML.length,cls:document.documentElement.className}));
    const el=p.locator(`[data-audit="${it.i}"]`);
    try{await el.scrollIntoViewIfNeeded({timeout:1500});await el.click({timeout:1500});}catch(e){report.push({v,...it,res:'NOT CLICKABLE '+e.message.split('\n')[0].slice(0,80)});continue}
    await p.waitForTimeout(700);
    const after=await p.evaluate(()=>({h:location.hash,y:scrollY,dlg:document.querySelector('dialog[open]')?1:0,cur:document.querySelector('#curtain.is-open')?1:0,html:document.body.innerHTML.length,cls:document.documentElement.className}));
    const changed=JSON.stringify(before)!==JSON.stringify(after);
    report.push({v,...it,res:changed?'ok':'NO VISIBLE EFFECT',after:after.h});
    // reset: close dialog/menu, return to view
    await p.keyboard.press('Escape').catch(()=>{});await p.evaluate(()=>{const d=document.querySelector('dialog[open]');if(d)d.close()});
    if(await p.evaluate(()=>document.querySelector('#curtain.is-open')?1:0)) await p.click('.menu-btn').catch(()=>{});
    if(await p.evaluate(v=>location.hash.slice(1)!==v,v)){await p.evaluate(v=>{location.hash=v},v);await p.waitForTimeout(1500);}
  }
 }
 const bad=report.filter(r=>r.res!=='ok');
 console.log('TOTAL',report.length,'BAD',bad.length,'pageErrors',errs);
 bad.forEach(r=>console.log(r.v,'|',r.tag,'|',r.txt,'|',r.href||'','|',r.attrs,'|',r.res));
 await b.close()})();

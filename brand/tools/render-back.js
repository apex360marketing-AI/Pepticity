const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const items=[['AOD','AOD-9604|5 MG'],['NAD','NAD+|1000 MG'],['EPI','EPITALON|50 MG'],['GHK','GHK-Cu|100 MG']];
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1400,height:1400},deviceScaleFactor:2});
for(const [k,v] of items){await p.goto('http://127.0.0.1:8765/home/user/pepticity/brand/src/proof.html?back='+encodeURIComponent(v));
await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
await p.locator('#art').screenshot({path:'/home/user/pepticity/brand/art/back-'+k+'.png',omitBackground:true});}
await b.close();console.log('ok')})();

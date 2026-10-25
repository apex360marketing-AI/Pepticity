const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1600,height:1600},deviceScaleFactor:2});
for(let i=1;i<=20;i++){const id='F'+String(i).padStart(2,'0');
 for(const side of ['front','back']){await p.goto(`http://127.0.0.1:8765/home/user/pepticity/brand/src/fontart.html?f=${id}&side=${side}`);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(200);
  const ok=await p.evaluate(id=>{const f=PEPFONTS.F.find(x=>x.id===id);return document.fonts.check('40px '+f.fam)},id);
  if(!ok) console.log('FONT MISSING',id);
  await p.locator('#art').screenshot({path:`/home/user/pepticity/brand/art/f-${id}-${side}.png`,omitBackground:true});}}
await b.close();console.log('ok')})();

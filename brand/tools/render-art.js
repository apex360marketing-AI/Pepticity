const { chromium } = require('/tmp/claude-0/-home-user-Apex-Agents-Bots/f5f77d16-71d5-5266-8292-e551fb9458e6/scratchpad/pw/node_modules/playwright-core');
const ids = process.argv.slice(2).length ? process.argv.slice(2) : Array.from({length:20},(_,i)=>'D'+String(i+1).padStart(2,'0'));
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const p=await b.newPage({viewport:{width:1400,height:1400},deviceScaleFactor:2});
for(const id of ids){
  await p.goto('http://127.0.0.1:8765/home/user/pepticity/brand/src/proof.html?art='+id+'&c='+encodeURIComponent(await (async()=>'')()));
  await p.evaluate(id=>{const d=PEPLOGOS.D.concat(PEPLOGOS.X||[]).find(x=>x.id===id);const a=document.getElementById('art');a.style.color=d.ink==='silver'?'#ffffff':d.ink;},id);
  await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(250);
  await p.locator('#art .lk, #art').first().screenshot({path:'/home/user/pepticity/brand/art/'+id+'.png',omitBackground:true});
}
await b.close();console.log('ok')})();

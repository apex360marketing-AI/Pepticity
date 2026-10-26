const {chromium}=require('playwright');
const U='http://127.0.0.1:8767'+__dirname+'/index.html';
(async()=>{const b=await chromium.launch({executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome'});
const out=[];
for (const [w,h,n] of [[1280,860,'d'],[390,844,'m']]){
 const p=await b.newPage({viewport:{width:w,height:h}});const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
 await p.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p.goto(U);await p.evaluate(()=>{try{localStorage.clear()}catch(e){}});await p.reload();await p.waitForTimeout(400);
 const ov=async()=>p.evaluate(()=>document.documentElement.scrollWidth-innerWidth);
 await p.screenshot({path:`shots/${n}-01-intro.png`});
 await p.click('#go');await p.waitForTimeout(300);
 if(n==='d'){await p.hover('.opt[data-v=weight]');await p.waitForTimeout(1100);await p.screenshot({path:`shots/${n}-02-goal-hover.png`});}
 const pick=async(v)=>{await p.click(`.opt[data-v="${v}"]`);await p.waitForTimeout(450);};
 await pick('weight');await p.screenshot({path:`shots/${n}-03-follow.png`});
 await pick('w2');await pick('3');
 await p.screenshot({path:`shots/${n}-04-prov.png`});
 await pick('BC');await pick('35');await pick('new');
 await p.screenshot({path:`shots/${n}-05-preg.png`});
 await pick('no');await pick('none');await p.click('#cont');await p.waitForTimeout(450);
 await pick('none');await pick('video');await pick('now');
 await p.waitForTimeout(400);await p.screenshot({path:`shots/${n}-06-building.png`});
 await p.waitForTimeout(2600);await p.screenshot({path:`shots/${n}-07-result.png`,fullPage:true});
 const res=await p.evaluate(()=>({h:document.querySelector('#q').textContent,main:document.querySelector('#main').textContent,decide:!!document.querySelector('.decide'),progs:document.querySelector('.progs').textContent.slice(0,60)}));
 // booking validation
 await p.click('#main');await p.waitForTimeout(200);await p.fill('#bName','Test');await p.fill('#bMail','a@b.co');await p.click('#bookF [type=submit]');
 const e1=await p.textContent('#bErr');await p.check('#bOk');await p.click('#bookF [type=submit]');const s1=await p.textContent('#bSent');
 await p.screenshot({path:`shots/${n}-08-book.png`});await p.keyboard.press('Escape');
 // lawyer switch
 await p.click('#ctlBtn');await p.waitForTimeout(300);const progOn=await p.evaluate(()=>document.querySelector('.progs').textContent.slice(0,80));
 await p.click('#ctlBtn');
 // guide
 await p.click('#gOpen');await p.waitForTimeout(200);
 for (const q of ['how much bpc 157 should i take','I have chest pain','will i lose 20 lb']){await p.fill('#gIn',q);await p.press('#gIn','Enter');await p.waitForTimeout(150);}
 await p.screenshot({path:`shots/${n}-09-guide.png`});
 const log=await p.evaluate(()=>[...document.querySelectorAll('#gLog .msg')].map(m=>m.className.replace('msg ','')+': '+m.textContent.slice(0,70)));
 out.push({n,errs,ov:await ov(),res,e1,s1,progOn,log});
 // stops
 const p2=await b.newPage({viewport:{width:w,height:h}});p2.on('pageerror',e=>errs.push('p2 '+e.message));await p2.route(/fonts\.(googleapis|gstatic)/,r=>r.abort());
 await p2.goto(U+'#skin');await p2.waitForTimeout(400);await p2.click('.opt[data-v=shop]');await p2.waitForTimeout(500);
 const shopH=await p2.textContent('#q');await p2.screenshot({path:`shots/${n}-10-shop.png`});
 await p2.click('#shopBack');await p2.waitForTimeout(300);await p2.click('.opt[data-v=tone]');await p2.waitForTimeout(450);await p2.click('.opt[data-v="0"]');await p2.waitForTimeout(450);
 await p2.click('.opt[data-v=BC]');await p2.waitForTimeout(450);await p2.click('.opt[data-v="18"]');await p2.waitForTimeout(500);const ageStop=await p2.textContent('#q');
 await p2.click('#chg');await p2.waitForTimeout(300);await p2.click('.opt[data-v="55"]');await p2.waitForTimeout(450);await p2.click('.opt[data-v=self]');await p2.waitForTimeout(450);
 await p2.click('.opt[data-v=no]');await p2.waitForTimeout(450);await p2.click('.opt[data-v=gall]');await p2.click('#cont');await p2.waitForTimeout(450);await p2.click('.opt[data-v=some]');await p2.waitForTimeout(450);
 await p2.click('.opt[data-v=phone]');await p2.waitForTimeout(450);await p2.click('.opt[data-v=explore]');await p2.waitForTimeout(3600);
 const r2=await p2.evaluate(()=>({h:document.querySelector('#q').textContent,main:document.querySelector('#main').textContent,flag:!!document.querySelector('.flag')}));
 await p2.screenshot({path:`shots/${n}-11-clinfirst.png`,fullPage:true});
 // back + resume
 await p2.goto(U);await p2.waitForTimeout(300);const resumeTxt=await p2.textContent('#go');
 out.push({n:n+'-paths',shopH,ageStop,r2,resumeTxt});
}
console.log(JSON.stringify(out,null,1));await b.close()})();

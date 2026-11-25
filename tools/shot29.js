const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1500);
await p.evaluate(()=>{document.getElementById('dvbub')&&(document.getElementById('dvbub').style.display='none');const D=S.caps.filter(k=>k.demo);view.lon=D.reduce((a,k)=>a+k.lon,0)/D.length;view.lat=D.reduce((a,k)=>a+k.lat,0)/D.length;view.z=14.2;reqDraw();__sheet('min')});await p.waitForTimeout(900);
const n1=await p.evaluate(()=>gHits.length);await p.click('#gbtn');await p.waitForTimeout(400);const n2=await p.evaluate(()=>gHits.length);await p.screenshot({path:'../out/v29_off.png',scale:'css'});
await p.reload();await p.waitForTimeout(1300);const n3=await p.evaluate(()=>S.prefs.gOff);await p.click('#gbtn');await p.waitForTimeout(400);
console.log('on',n1,'off',n2,'persist',n3,'reon',await p.evaluate(()=>!S.prefs.gOff));
const m=await b.newContext({...devices['iPad Pro 11 landscape'],offline:true});await m.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});const q=await m.newPage();await q.goto(U);await q.waitForTimeout(1200);await q.evaluate(()=>{S.prefs.gOff=1;save();openMaestra()});await q.waitForTimeout(1000);console.log('maestra con gOff',await q.evaluate(()=>gHits.length));
console.log('errs',errs);await b.close()})();

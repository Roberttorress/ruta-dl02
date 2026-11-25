const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
let ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
let p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1500);
console.log('demo',await p.evaluate(()=>S.caps.filter(k=>k.demo).length));
await p.evaluate(()=>{document.getElementById('dvbub')&&(document.getElementById('dvbub').style.display='none');const D=S.caps.filter(k=>k.demo);view.lon=D.reduce((a,k)=>a+k.lon,0)/D.length;view.lat=D.reduce((a,k)=>a+k.lat,0)/D.length;view.z=14.2;reqDraw();__sheet('min')});await p.waitForTimeout(900);await p.screenshot({path:'../out/v28_mapa.png',scale:'css'});
await p.reload();await p.waitForTimeout(1200);console.log('demo tras recargar',await p.evaluate(()=>S.caps.filter(k=>k.demo).length));
ctx=await b.newContext({...devices['iPad Pro 11 landscape'],offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U+'?maestra');await p.waitForTimeout(1500);await p.screenshot({path:'../out/v28_mae.png'});
console.log('errs',errs);await b.close()})();

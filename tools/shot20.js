const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
await p.click('#fab');await p.waitForTimeout(90);await p.screenshot({path:'../out/v20_open90.png'});await p.waitForTimeout(400);
await p.click('#mclose');await p.waitForTimeout(100);await p.screenshot({path:'../out/v20_close100.png'});await p.waitForTimeout(300);
console.log('cerrada:',await p.evaluate(()=>document.getElementById('modal').style.display));
await p.click('#tabs button[data-t=dd]');await p.waitForTimeout(90);await p.screenshot({path:'../out/v20_tab90.png'});await p.waitForTimeout(400);
// close then reopen fast
await p.click('#dvbot');await p.waitForTimeout(350);await p.click('#mclose');await p.waitForTimeout(60);await p.evaluate(()=>openCap());await p.waitForTimeout(400);
console.log('reabierta rápido sigue visible:',await p.evaluate(()=>getComputedStyle(document.getElementById('modal')).display==='flex'&&!!document.getElementById('c_x')));
await p.click('#mclose');await p.waitForTimeout(300);
// briefing push
await p.click('#tabs button[data-t=hoy]');await p.waitForTimeout(300);await p.click('.btn.go >> nth=0');await p.waitForTimeout(90);await p.screenshot({path:'../out/v20_push90.png'});
console.log('errs',errs);await b.close()})();

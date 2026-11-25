const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,colorScheme:'dark',offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
// scroll the panel then switch tabs mid-animation; check nothing of panel is painted above sheet
await p.evaluate(()=>{panel.scrollTop=60});await p.click('#tabs button[data-t=cal]');await p.waitForTimeout(80);await p.screenshot({path:'../out/v21_a.png'});
await p.click('#tabs button[data-t=hoy]');await p.waitForTimeout(80);await p.screenshot({path:'../out/v21_b.png'});await p.waitForTimeout(400);await p.screenshot({path:'../out/v21_c.png'});
console.log(await p.evaluate(()=>{const s=document.getElementById('side').getBoundingClientRect(),h=panel.querySelector('.hstat').getBoundingClientRect();return {sheetTop:Math.round(s.top),pillsTop:Math.round(h.top),scroll:panel.scrollTop}}));
console.log('errs',errs);await b.close()})();

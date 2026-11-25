const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1');Object.defineProperty(navigator,'webdriver',{get:()=>false})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1800);await p.screenshot({path:'../out/v36_login.png',scale:'css'});
await p.click('.swu >> text=Roberto Torres');await p.waitForTimeout(500);console.log('me',await p.evaluate(()=>curUser()&&curUser().n));
await p.reload();await p.waitForTimeout(1800);console.log('no vuelve a pedir',await p.evaluate(()=>getComputedStyle(document.getElementById('modal')).display));
await p.evaluate(()=>{const u=document.getElementById('dvbub');if(u)u.style.display='none'});await p.click('#fab');await p.waitForTimeout(800);await p.screenshot({path:'../out/v36_cap.png',scale:'css'});
console.log('errs',errs);await b.close()})();

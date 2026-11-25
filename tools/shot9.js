const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1,offline:true});const p=await ctx.newPage();await p.clock.setFixedTime(new Date('2027-04-06T09:00:00'));p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(500);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(400);
await p.locator('.go').first().click();await p.waitForTimeout(300);const a=await p.locator('#bk').count();await p.click('#tabs button[data-t=cal]');await p.waitForTimeout(200);await p.click('#tabs button[data-t=hoy]');await p.waitForTimeout(300);const b2=await p.locator('#bk').count();const h=await p.locator('#panel h1').first().textContent();
console.log('briefing back btn:',a,'after Hoy tab:',b2,'h1:',h,'errors',errs);await b.close()})();

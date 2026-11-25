const {chromium,devices}=require('playwright');
(async()=>{const b=await chromium.launch();const errs=[];
const V=[['ipad_v',{viewport:{width:820,height:1180},deviceScaleFactor:1,isMobile:true,hasTouch:true}],['ipad_h',{viewport:{width:1180,height:820},deviceScaleFactor:1,isMobile:true,hasTouch:true}],['ipadpro_v',{viewport:{width:834,height:1194},deviceScaleFactor:1,isMobile:true,hasTouch:true}],['iphone',{...devices['iPhone 13'],deviceScaleFactor:1}],['iphone_h',{viewport:{width:844,height:390},deviceScaleFactor:1,isMobile:true,hasTouch:true}]];
for(const [n,o] of V){const ctx=await b.newContext({...o,offline:true});const p=await ctx.newPage();await p.clock.setFixedTime(new Date('2027-04-06T09:00:00'));p.on('pageerror',e=>errs.push(n+': '+e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(500);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(500);
await p.screenshot({path:'../out/l_'+n+'_hoy.png'});await p.locator('.go').first().click();await p.waitForTimeout(400);await p.screenshot({path:'../out/l_'+n+'_brief.png'});await ctx.close()}
console.log('errors',errs);await b.close()})();

const {chromium,devices}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const errs=[];const P=JSON.parse(fs.readFileSync('../out/calles_days40.json'));const d=P.days[10];const C=d.coords;
const ctx=await b.newContext({...devices['iPhone 13'],offline:true,geolocation:{latitude:C[0][1],longitude:C[0][0],accuracy:8},permissions:['geolocation']});
const p=await ctx.newPage();await p.clock.setFixedTime(new Date(d.fecha+'T09:00:00'));p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(600);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(500);
await p.screenshot({path:'../out/v7_phone_hoy.png'});await p.locator('.go').first().click();await p.waitForTimeout(400);await p.click('#stb');await p.waitForTimeout(600);
for(let k=1;k<=12;k++){const q=C[Math.min(k*4,C.length-1)];await ctx.setGeolocation({latitude:q[1],longitude:q[0],accuracy:6});await p.waitForTimeout(120);if(k%3===0)await p.click('.tb[data-r=fav]')}
await p.waitForTimeout(300);await p.screenshot({path:'../out/v7_phone_street.png'});console.log('errors:',errs);await b.close()})();

const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,colorScheme:'dark',offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1200);
const H=()=>p.evaluate(()=>({side:document.getElementById('side').offsetHeight,map:document.getElementById('mapwrap').offsetHeight,cv:document.getElementById('cv').clientHeight,tabsBottom:Math.round(document.getElementById('tabs').getBoundingClientRect().bottom),vh:innerHeight}));
console.log('mid',JSON.stringify(await H()));await p.screenshot({path:'../out/v17_mid.png'});
const g=await p.$('#grab');const bb=await g.boundingBox();
// drag down
await p.touchscreen.tap(bb.x+bb.width/2,bb.y+10);await p.waitForTimeout(400);console.log('after tap',JSON.stringify(await H()));await p.screenshot({path:'../out/v17_min.png'});
// drag up via touch events
const b2=await (await p.$('#grab')).boundingBox();await p.mouse.move(b2.x+200,b2.y+10);await p.mouse.down();for(let i=1;i<=20;i++){await p.mouse.move(b2.x+200,b2.y+10-i*35);await p.waitForTimeout(30)}await p.mouse.up();
await p.waitForTimeout(400);console.log('after drag up',JSON.stringify(await H()));await p.screenshot({path:'../out/v17_max.png'});
await p.touchscreen.tap(200,(await (await p.$('#grab')).boundingBox()).y+10);await p.waitForTimeout(400);console.log('tap from max',JSON.stringify(await H()));
await p.touchscreen.tap(200,(await (await p.$('#grab')).boundingBox()).y+10);await p.waitForTimeout(400);console.log('tap again',JSON.stringify(await H()));await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(400);console.log('tab tap',JSON.stringify(await H()));
console.log('errs',errs);await b.close()})();

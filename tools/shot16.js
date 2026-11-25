const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const [n,scheme] of [['dark','dark'],['light','light']]){
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,colorScheme:scheme,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1200);
await p.click('#tabs button[data-t=mas]');await p.waitForTimeout(200);await p.screenshot({path:'../out/v16_'+n+'_mas.png'});
await p.click('#tabs button[data-t=hoy]');await p.waitForTimeout(200);await p.screenshot({path:'../out/v16_'+n+'_hoy.png'});
// standalone simulation: viewport 59px shorter than screen
await p.evaluate(()=>{Object.defineProperty(navigator,'standalone',{value:true,configurable:true})});
await ctx.close()}
// simulate iOS standalone bug: screen 932 but innerHeight 873
const ctx=await b.newContext({viewport:{width:430,height:873},screen:{width:430,height:932},deviceScaleFactor:1,isMobile:true,hasTouch:true,colorScheme:'dark',offline:true});
await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1');Object.defineProperty(navigator,'standalone',{get:()=>true})});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1200);
console.log('app height in standalone sim:',await p.evaluate(()=>document.getElementById('app').getBoundingClientRect().height));
console.log('errs',errs);await b.close()})();

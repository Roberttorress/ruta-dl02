const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const sc of ['light','dark']){const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,colorScheme:sc,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{const x=SB[1595];sel=x;fitBounds(x.rings[0],.4);showPop(x);reqDraw()});await p.waitForTimeout(600);await p.screenshot({path:'../out/v22_'+sc+'.png',scale:'css'});
console.log(await p.evaluate(()=>{const x=SB[1595];return [x.fyc,x.mc,x.mo,x.pt,x.vi,x.pv,x.ot,x.nu].reduce((a,b)=>a+b,0)+' vs total '+x.tot}));await ctx.close()}
console.log('errs',errs);await b.close()})();

const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const [name,dev] of [['ph',devices['iPhone 13']],['ipad',devices['iPad Pro 11']]]){
const ctx=await b.newContext({...dev,deviceScaleFactor:1,offline:true});
await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(2000);
await p.screenshot({path:`../out/v11_${name}_home.png`});
await p.click('#dvbot');await p.waitForTimeout(400);await p.screenshot({path:`../out/v11_${name}_est.png`});
if(name==='ph'){
await p.click('.oslot[data-k=cg]');await p.fill('#on','Juan Pérez');await p.fill('#ot','8112345678');await p.click('#osave');
await p.click('.ozona[data-z="2"]');await p.waitForTimeout(200);await p.screenshot({path:`../out/v11_${name}_zona.png`});
await p.click('.osec >> nth=0');await p.fill('#on','María López');await p.click('[data-c^=pr][data-d="1"]');await p.click('[data-c^=pr][data-d="1"]');await p.screenshot({path:`../out/v11_${name}_sec.png`});await p.click('#osave');
await p.click('#oback');await p.waitForTimeout(200);await p.screenshot({path:`../out/v11_${name}_est2.png`,fullPage:false});
for(const c of ['hoy','metas','pet','bus']){await p.click(`.chips button[data-v=${c}]`);if(c==='bus')await p.fill('#oq','mitras');await p.waitForTimeout(150);await p.screenshot({path:`../out/v11_${name}_${c}.png`})}
console.log(await p.evaluate(()=>JSON.stringify(JSON.parse(localStorage.getItem('dl02v3')).org)));}
await ctx.close()}
console.log('errs',errs);await b.close()})();

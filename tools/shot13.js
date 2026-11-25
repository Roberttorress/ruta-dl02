const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const dev of ['iPhone SE','iPhone 13','iPhone 15 Pro Max']){
const ctx=await b.newContext({...devices[dev],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1200);
// simulate Safari: visible area shorter than vh (toolbar 90px)
await p.addStyleTag({content:'#modal{bottom:90px!important}'});
await p.click('#dvbot');await p.waitForTimeout(300);
const r=await p.evaluate(()=>{const c=document.getElementById('mclose').getBoundingClientRect(),m=document.getElementById('mbox').getBoundingClientRect();return {closeTop:Math.round(c.top),boxTop:Math.round(m.top),boxBottom:Math.round(m.bottom),vh:innerHeight}});
await p.screenshot({path:`../out/v14_${dev.replace(/ /g,'')}.png`});
await p.click('#mclose');const closed=await p.evaluate(()=>document.getElementById('modal').style.display!=='flex');
await p.click('#dvbot');await p.click('#obotclose');const closed2=await p.evaluate(()=>document.getElementById('modal').style.display!=='flex');
console.log(dev,JSON.stringify(r),'✕ cierra:',closed,'Cerrar abajo:',closed2);await ctx.close()}
console.log('errs',errs);await b.close()})();

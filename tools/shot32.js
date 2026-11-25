const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1500);
console.log(await p.evaluate(()=>S.caps.filter(k=>k.demo).map(k=>k.dep||'-').join(' | ')));
await p.evaluate(()=>openPet(S.caps.find(k=>k.demo&&k.dep==='Equipo del candidato'&&k.et==='pro')||S.caps.find(k=>k.demo&&k.dep==='Equipo del candidato')));await p.waitForTimeout(400);await p.screenshot({path:'../out/v32_equipo.png',scale:'css'});
await p.evaluate(()=>{closeModal();openPet(S.caps.find(k=>k.demo&&k.et==='rec'))});await p.waitForTimeout(400);await p.click('#sgnext');await p.waitForTimeout(700);await p.screenshot({path:'../out/v32_asignar.png',scale:'css'});
console.log('errs',errs);await b.close()})();

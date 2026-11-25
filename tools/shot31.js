const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();await p.goto(U);await p.waitForTimeout(1500);await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(400);await p.evaluate(()=>{__sheet('max')});await p.waitForTimeout(500);
await p.evaluate(()=>{const e=document.querySelector('.sgcard');e.scrollIntoView()});await p.waitForTimeout(300);await p.screenshot({path:'../out/v31_cards.png',scale:'css'});await b.close()})();

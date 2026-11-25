const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
await p.click('#casbtn');await p.evaluate(()=>{fitBounds(SB[975].rings[0],.6);reqDraw()});await p.waitForTimeout(500);
const h=await p.evaluate(()=>{const h=casHits.find(a=>a[3].s===975)||casHits[0];const r=cv.getBoundingClientRect();return [h[0]+r.left,h[1]+r.top,document.elementFromPoint(h[0]+r.left,h[1]+r.top).id]});console.log(h);
console.log(await p.evaluate(()=>{try{const h=casHits[0];casPop(h[3]);return document.getElementById('pop').innerHTML.slice(0,300)}catch(e){return 'ERR '+e.message}}));
console.log(errs);await b.close()})();

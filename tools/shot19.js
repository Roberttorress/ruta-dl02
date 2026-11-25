const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
await p.evaluate(()=>{window.__pe=[];['pointerdown','pointermove','pointerup'].forEach(t=>cv.addEventListener(t,e=>__pe.push(t[7]+e.pointerId)))});
console.log(await p.evaluate(()=>document.elementFromPoint(200,150).id));
const cdp=await ctx.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map(q=>({x:q[0],y:q[1],id:q[2]}))});
async function run(label,fn){const a=await p.evaluate(()=>[view.lon,view.lat,view.z]);await fn();const z=await p.evaluate(()=>[view.lon,view.lat,view.z]);return [a,z]}
await T('touchStart',[[150,150,1]]);await T('touchStart',[[150,150,1],[250,150,2]]);
const z0=await p.evaluate(()=>view.z);for(let k=1;k<=10;k++){await T('touchMove',[[150-k*6,150,1],[250+k*6,150,2]]);await p.waitForTimeout(16)}
const z1=await p.evaluate(()=>view.z);
await T('touchEnd',[[90,150,1]]);const pre=await p.evaluate(()=>[view.lon,view.lat]);
await T('touchMove',[[92,151,1]]);await p.waitForTimeout(30);const post=await p.evaluate(()=>[view.lon,view.lat]);await T('touchEnd',[]);
console.log('zoom',z0.toFixed(2),'→',z1.toFixed(2),'brinco (m):',(Math.hypot(post[0]-pre[0],post[1]-pre[1])*111000).toFixed(1));
console.log((await p.evaluate(()=>__pe.join(' '))).slice(0,300));console.log('errs',errs);await b.close()})();

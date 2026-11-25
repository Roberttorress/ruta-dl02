const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
for(const scheme of ['light','dark']){
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,colorScheme:scheme,offline:false});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(2500);
await p.screenshot({path:`../out/v18_${scheme}_hoy.png`,scale:'css'});
if(scheme==='light'){
 const pt=()=>p.evaluate(()=>{const q=proj(-100.345,25.735);const r=cv.getBoundingClientRect();return [Math.round(q[0]+r.left),Math.round(q[1]+r.top),H]});
 const a=await pt();await p.evaluate(()=>__sheet('min'));await p.waitForTimeout(120);const m=await pt();await p.waitForTimeout(400);const c=await p.evaluate(()=>{const q=proj(-100.345,25.735);return [Math.round(q[0]),Math.round(q[1]),H]});
 console.log('punto en pantalla antes / durante / después:',a,m,c);
 await p.screenshot({path:'../out/v18_light_min.png',scale:'css'});await p.evaluate(()=>__sheet('mid'));await p.waitForTimeout(400);
 // pinch then lift one finger then move: check no jump
 const cdp=await ctx.newCDPSession(p);const T=(type,pts)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:pts.map((q,i)=>({x:q[0],y:q[1],id:q[2]??i}))});
 const before=await p.evaluate(()=>[view.lon,view.lat,view.z]);
 await T('touchStart',[[150,200,0]]);await T('touchStart',[[150,200,0],[250,200,1]]);for(let k=1;k<=10;k++){await T('touchMove',[[150-k*5,200,0],[250+k*5,200,1]]);await p.waitForTimeout(16)}
 const mid=await p.evaluate(()=>[view.lon,view.lat,view.z]);
 await T('touchEnd',[[100,200,0]]); // lifts finger 1 (remaining finger 0)
 const pre=await p.evaluate(()=>[view.lon,view.lat]);await T('touchMove',[[102,201,0]]);await p.waitForTimeout(30);const post=await p.evaluate(()=>[view.lon,view.lat]);await T('touchEnd',[]);
 const jump=Math.hypot(post[0]-pre[0],post[1]-pre[1])*111000;console.log('zoom',before[2].toFixed(2),'→',mid[2].toFixed(2),' brinco al soltar un dedo (m):',jump.toFixed(1));
 await p.evaluate(()=>{view.z=15.3;reqDraw()});await p.waitForTimeout(1500);await p.screenshot({path:'../out/v18_light_zoom.png',scale:'css'});
}
await ctx.close()}
console.log('errs',errs);await b.close()})();

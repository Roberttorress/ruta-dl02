const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];const U='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';const R=[];const ok=(n,v)=>R.push((v?'✅ ':'❌ ')+n);
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,geolocation:{latitude:25.7105,longitude:-100.3395,accuracy:12},permissions:['geolocation']});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
let posts=[];await ctx.route('https://script.google.com/**',async r=>{posts.push(JSON.parse(r.request().postData()));await r.fulfill({status:200,contentType:'application/json',headers:{'Access-Control-Allow-Origin':'*'},body:JSON.stringify({ok:true,n:1})})});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(U);await p.waitForTimeout(1500);await p.evaluate(()=>{const u=document.getElementById('dvbub');if(u)u.style.display='none'});
await p.evaluate(()=>{S.me=S.users.find(u=>u.n==='Héctor Del Real').id;save(true)});await p.click('#fab');await p.waitForTimeout(1200);ok('muestra quién recibe',await p.evaluate(()=>/La recibe Héctor/.test(document.getElementById('cby2').textContent)));ok('ubicada con GPS',await p.evaluate(()=>/Ubicada con GPS/.test(document.getElementById('cloc').textContent)));await p.screenshot({path:'../out/v33_gps.png',scale:'css'});
await p.click('#cl_map');await p.waitForTimeout(600);await p.screenshot({path:'../out/v33_pick.png',scale:'css'});
await p.evaluate(()=>{view.lat+=0.002;reqDraw()});await p.click('#pk_ok');await p.waitForTimeout(400);ok('ubicada en el mapa',await p.evaluate(()=>/Ubicada en el mapa/.test(document.getElementById('cloc').textContent)));
const blocked=0;await p.click('#mbox [data-cat]');await p.fill('#c_txt','Prueba de ubicación');await p.click('#c_s');await p.waitForTimeout(500);
const last=await p.evaluate(()=>{const r=S.caps[S.caps.length-1];return {lon:r.lon,lat:r.lat,gsrc:r.gsrc,by:r.by}});ok('guardada con punto del mapa '+JSON.stringify(last),last.gsrc==='mapa'&&last.lat>25.711&&last.by==='Héctor Del Real');
// sync
await p.evaluate(()=>{S.prefs.gs={url:'https://script.google.com/macros/s/TEST/exec',tok:'DL02-x'};save(true)});await p.waitForTimeout(2500);
ok('envió a la hoja '+posts.length+' lote(s), filas '+(posts[0]?posts[0].rows.length:0),posts.length&&posts[0].rows.length===1&&posts[0].tok==='DL02-x');
const r0=posts[0].rows[0];ok('fila 23 cols',r0.length===23);
await p.evaluate(()=>{const c=S.caps[S.caps.length-1];setEt(c,'can','x')});await p.waitForTimeout(2500);ok('reenvía al cambiar etapa',posts.length===2&&posts[1].rows[0][5]==='Asignada');
await p.evaluate(()=>{S.caps.pop();save(true)});await p.waitForTimeout(2500);ok('avisa borrado',posts.length===3&&posts[2].del.length===1);
await p.click('#tabs button[data-t=mas]');await p.waitForTimeout(400);await p.evaluate(()=>document.getElementById('gscard').scrollIntoView());await p.screenshot({path:'../out/v33_mas.png',scale:'css'});
// sin gps
const c2=await b.newContext({...devices['iPhone 15 Pro Max'],permissions:[]});await c2.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});const q=await c2.newPage();await q.goto(U);await q.waitForTimeout(1200);await q.click('#fab');await q.waitForTimeout(1500);console.log('sin permiso:',await q.evaluate(()=>document.getElementById('cloc').textContent));
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],R=[];const ok=(n,c)=>R.push((c?'✅ ':'❌ ')+n);
const URL='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
let ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
let p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto(URL);await p.waitForTimeout(1600);
const sh=n=>p.screenshot({path:'../out/v25_'+n+'.png',scale:'css'});
ok('mapa por ganador: categorías',await p.evaluate(()=>SECS.every(x=>CAT[x.cat])));console.log(await p.evaluate(()=>{const c={};SECS.forEach(x=>c[x.cat]=(c[x.cat]||0)+1);return JSON.stringify(c)}));
ok('sin emojis en Hoy',await p.evaluate(()=>!/[\u{1F300}-\u{1FAFF}]/u.test(panel.textContent)));await sh('hoy');
await p.evaluate(()=>{const x=SB[1595];sel=x;fitBounds(x.rings[0],.4);showPop(x);reqDraw()});await p.waitForTimeout(400);await sh('pop');ok('tarjeta dice Ganó',(await p.textContent('#pop')).includes('Ganó'));
await p.evaluate(()=>{showPop(null);const now=Date.now();[[1492,'Alumbrado','pend'],[979,'Agua','gest'],[1520,'Pavimento','res']].forEach((a,i)=>{const x=SB[a[0]],c=x.rings[0][3];S.caps.push({id:'t'+i,k:'Petición',cat:a[1],st:a[2],urg:'normal',ts:now-i*864e5,sec:a[0],col:'X',lon:c[0],lat:c[1],t:'Detalle '+i,nom:'Vecino',tel:'8111111111',ok:true})});save(true)});
await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(400);ok('gestorías sin emojis',await p.evaluate(()=>!/[\u{1F300}-\u{1FAFF}]/u.test(panel.textContent)));ok('íconos presentes',await p.evaluate(()=>panel.querySelectorAll('svg.ic').length>3));await sh('gest');
await p.click('#tabs button[data-t=cal]');await p.waitForTimeout(300);ok('sin fases en agenda',await p.evaluate(()=>!/Fase \d/.test(panel.textContent)));await sh('agenda');
// casillas
await p.click('#tabs button[data-t=hoy]');await p.evaluate(()=>{const u=document.getElementById('dvbub');if(u)u.style.display='none'});await p.click('#casbtn');await p.evaluate(()=>{fitBounds(SB[975].rings[0],.6);reqDraw()});await p.waitForTimeout(500);ok('casillas dibujadas',await p.evaluate(()=>casHits.length>0));await sh('cas');
const hit=await p.evaluate(()=>{const h=casHits.find(a=>a[3].s===975)||casHits[0];const r=cv.getBoundingClientRect();return [h[0]+r.left,h[1]+r.top]});await p.mouse.click(hit[0],hit[1]);await p.waitForTimeout(300);
ok('tarjeta de casilla',(await p.textContent('#pop')).includes('Casilla'));await sh('caspop');await p.click('#pop [data-cas]');await p.waitForTimeout(300);ok('abre ficha Día D con domicilio',(await p.textContent('#mbox')).includes('Cómo llegar'));await sh('casdd');await p.click('#mclose');await p.waitForTimeout(300);
ok('341→340 casillas desde INE',await p.evaluate(()=>CASL.length===340));
// Día D list
await p.click('#tabs button[data-t=dd]');await p.click('[data-ddv=cas]');await p.waitForTimeout(300);await sh('ddcas');
// Davidsito toggle
await p.click('#tabs button[data-t=mas]');await p.waitForTimeout(300);await sh('mas');await p.uncheck('#pnodv');ok('ocultar Davidsito',await p.evaluate(()=>getComputedStyle(document.getElementById('dvbot')).display==='none'));await p.check('#pnodv');
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.waitForTimeout(300);await sh('bot');await p.click('#mclose');await ctx.close();
// maestra
ctx=await b.newContext({...devices['iPad Pro 11 landscape'],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(URL+'?maestra');await p.waitForTimeout(600);
await p.evaluate(()=>{const now=Date.now();const cats=['Agua','Alumbrado','Pavimento','Seguridad','Basura'],sts=['pend','gest','res'];SECS.forEach((x,j)=>{if(j%2)return;const c=x.rings[0][Math.floor(x.rings[0].length/2)];S.caps.push({id:'m'+j,k:'Petición',cat:cats[j%5],st:sts[(j/2)%3],ts:now-j*3600000,sec:x.s,lon:c[0],lat:c[1],t:'Reporte de vecinos'})});save(true)});await p.waitForTimeout(1200);
await p.screenshot({path:'../out/v25_mae.png'});const ph=await p.evaluate(()=>{const h=gHits[5];const r=cv.getBoundingClientRect();return [(h[0]+h[2])/2+r.left,(h[1]+h[3])/2+r.top]});await p.mouse.click(ph[0],ph[1]);await p.waitForTimeout(300);ok('nota de gestoría al tocar',await p.evaluate(()=>!!document.getElementById('mvpop')));await p.screenshot({path:'../out/v25_maepop.png'});
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

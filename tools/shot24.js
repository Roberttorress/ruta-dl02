const {chromium,devices}=require('playwright');const fs=require('fs');(async()=>{const b=await chromium.launch();const errs=[],R=[];const ok=(n,c)=>R.push((c?'✅ ':'❌ ')+n);
const URL='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
let ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true,acceptDownloads:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
let p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto(URL);await p.waitForTimeout(1500);
const vis=s=>p.evaluate(s=>{const e=document.querySelector(s);return !!e&&e.getClientRects().length>0&&getComputedStyle(e).display!=='none'},s);
// --- gestorías con colonia
await p.evaluate(()=>{const x=SB[1595];const c=x.rings[0].reduce((a,q)=>[a[0]+q[0],a[1]+q[1]],[0,0]).map(v=>v/x.rings[0].length);me={lon:c[0],lat:c[1],acc:10}});
await p.click('#fab');await p.click('[data-cat="Agua"]');ok('selector de colonia con colonias de la sección',await p.evaluate(()=>document.querySelectorAll('#c_col option').length>2));
await p.selectOption('#c_col',{index:1});const colSel=await p.inputValue('#c_col');await p.fill('#c_nom','Ana Pérez');await p.fill('#c_txt','Sin agua desde el lunes');await p.click('#c_s');await p.waitForTimeout(300);
ok('gestoría guarda colonia elegida',await p.evaluate(c=>S.caps.some(k=>k.col===c),colSel));
await p.evaluate(()=>{const now=Date.now();[[1492,'Alumbrado','pend'],[1492,'Seguridad','res'],[979,'Agua','gest'],[1520,'Baches','res'],[1595,'Alumbrado','pend']].forEach((a,i)=>{const x=SB[a[0]],c=x.rings[0][0];S.caps.push({id:'t'+i,k:'Petición',cat:a[1],st:a[2],urg:i===0?'urgente':'normal',ts:now-i*86400000*2,sec:a[0],col:x.col.split(',')[0].trim(),lon:c[0]+.002,lat:c[1]-.002,nom:'Vecino '+i,tel:'811000000'+i,ok:true,t:'Detalle '+i,hist:a[2]==='res'?[{st:'res',ts:now}]:[]})});save(true)});
await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(300);await p.selectOption('#cfs','1492');await p.waitForTimeout(200);
ok('filtro por sección (2)',await p.evaluate(()=>panel.querySelectorAll('.sgcard').length===2));await p.selectOption('#cfs','all');await p.selectOption('#cfc',{index:1});ok('filtro por colonia',await p.evaluate(()=>panel.querySelectorAll('.sgcard').length>=1));
await p.click('#cfclr');await p.screenshot({path:'../out/v24_gest.png',scale:'css'});
const [dl]=await Promise.all([p.waitForEvent('download'),p.click('#gxls')]);const xp='../out/v24_test.xlsx';await dl.saveAs(xp);ok('descarga Excel .xlsx',fs.existsSync(xp)&&dl.suggestedFilename().endsWith('.xlsx'));
// --- buscador
await p.click('#tabs button[data-t=hoy]');await p.fill('#msqi','1595');await p.waitForTimeout(200);ok('buscador muestra resultado',await p.evaluate(()=>document.querySelectorAll('#msqr [data-s]').length>=1));await p.click('#msqr [data-s]');await p.waitForTimeout(400);ok('buscador abre la sección',await p.evaluate(()=>document.getElementById('pop').style.display==='block'&&sel&&sel.s===1595));
await p.fill('#msqi','mitras');await p.waitForTimeout(200);ok('buscador por colonia',await p.evaluate(()=>document.querySelectorAll('#msqr [data-s]').length>=1));await p.screenshot({path:'../out/v24_search.png',scale:'css'});await p.fill('#msqi','');
// --- secciones recorridas en gris
await p.evaluate(()=>{showPop(null);DAYS.filter(d=>d.cal<=12).forEach(d=>{S.days[dk(d)]={...dd(d),done:true}});save(true)});await p.waitForTimeout(200);
ok('secciones recorridas se marcan',await p.evaluate(()=>DONESEC.size>0));console.log('secciones en gris:',await p.evaluate(()=>DONESEC.size));
await p.evaluate(()=>{fitBounds(OUTER,.05);reqDraw()});await p.waitForTimeout(500);await p.screenshot({path:'../out/v24_gris.png',scale:'css'});
// --- usuarios y permisos
await p.click('#tabs button[data-t=mas]');await p.click('#musers');await p.click('#uadd');await p.fill('#un','Laura Gestoría');await p.selectOption('#ur','c31');await p.fill('#up','1234');await p.click('#usave');
ok('usuario agregado',await p.evaluate(()=>S.users.length===2));await p.screenshot({path:'../out/v24_users.png',scale:'css'});
await p.click('.uitem >> text=Laura Gestoría');await p.click('#uthis');await p.waitForTimeout(400);
ok('C3 gestoría: oculta Agenda, Día D y Avance',!(await vis('#tabs button[data-t=cal]'))&&!(await vis('#tabs button[data-t=dd]'))&&!(await vis('#tabs button[data-t=av]')));
ok('C3 gestoría: ve Gestorías y ＋ Gestoría',(await vis('#tabs button[data-t=cap]'))&&(await vis('#fab')));
await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(300);ok('C3 gestoría: sin botón Excel ni Borrar',!(await vis('#gxls'))&&!(await vis('.pet [data-del]')));
ok('C3 gestoría: ve nombre del ciudadano',await p.evaluate(()=>panel.textContent.includes('Vecino')));
await p.click('#tabs button[data-t=mas]');ok('C3 gestoría: sin Usuarios ni Vista maestra',!(await vis('#musers'))&&!(await vis('#mmae')));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');ok('Davidsito C3: sin Estructura, con Propuestas',!(await vis('.chips [data-v=est]'))&&(await vis('.chips [data-v=prop]')));await p.click('#mclose');await p.waitForTimeout(300);
// chofer
await p.evaluate(()=>{S.users.push({id:'u9',n:'Pedro Chofer',rol:'c32',tel:'',pin:'',on:true});S.me='u9';save(true);applyPerms();render()});await p.waitForTimeout(300);
ok('C3 chofer: ve Agenda, no Gestorías',(await vis('#tabs button[data-t=cal]'))&&!(await vis('#tabs button[data-t=cap]'))&&!(await vis('#fab')));
await p.click('#tabs button[data-t=cal]');await p.waitForTimeout(300);ok('C3 chofer: sin Gastos en Agenda',!(await vis('[data-ag=g]'))&&(await vis('[data-ag=ev]')));
await p.click('#tabs button[data-t=mas]');await p.click('#mswu');await p.click('.swu >> text=Laura Gestoría');await p.fill('#swp','0000');await p.click('#swok');ok('PIN incorrecto no cambia',await p.evaluate(()=>S.me==='u9'));
await p.click('.swu >> text=David de la Peña');await p.waitForTimeout(300);ok('regresar a David (C1) muestra todo',(await vis('#tabs button[data-t=dd]'))&&(await vis('#tabs button[data-t=cal]')));
await p.click('#tabs button[data-t=mas]');await p.click('#musers');await p.click('#uperm');await p.screenshot({path:'../out/v24_perm.png',scale:'css'});await p.check('[data-pr=c31][data-pp=exportar]');await p.click('#psave2');ok('matriz de permisos guarda',await p.evaluate(()=>S.perm.c31.exportar===true));await p.click('#mclose');await p.waitForTimeout(300);
await ctx.close();
// --- vista maestra en iPad horizontal y iPhone
for(const [nm,dev] of [['ipad',{...devices['iPad Pro 11 landscape']}],['iphone',devices['iPhone 15 Pro Max']]]){ctx=await b.newContext({...dev,deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));await p.goto(URL+'?maestra');await p.waitForTimeout(600);
 await p.evaluate(()=>{const now=Date.now();let i=0;SECS.slice(0,60).forEach((x,j)=>{if(j%3)return;const c=x.rings[0][Math.floor(x.rings[0].length/2)];S.caps.push({id:'m'+j,k:'Petición',cat:['Agua','Alumbrado','Baches','Seguridad'][j%4],st:j%2?'res':'pend',ts:now-j*3600000,sec:x.s,lon:c[0],lat:c[1],t:'x'})});DAYS.filter(d=>d.cal<=15).forEach(d=>{S.days[dk(d)]={...dd(d),done:true}});save(true)});
 await p.waitForTimeout(1500);ok('vista maestra abre con ?maestra ('+nm+')',await p.evaluate(()=>window.MAE&&!!document.getElementById('mv')));await p.screenshot({path:'../out/v24_mae_'+nm+'.png'});
 if(nm==='ipad'){await p.click('#mvx');await p.waitForTimeout(300);ok('salir de vista maestra',await p.evaluate(()=>!window.MAE&&!document.getElementById('mv')))}await ctx.close()}
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

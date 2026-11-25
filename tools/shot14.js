const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],R=[];
const ok=(n,c)=>R.push((c?'✅ ':'❌ ')+n);
const URL='file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html';
async function mk(time,q){const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());if(time)await p.clock.install({time:new Date(time)});await p.goto(URL+(q||''));await p.waitForTimeout(1200);return {ctx,p}}
const sh=(p,n)=>p.screenshot({path:'../out/v15_'+n+'.png'});
// ===== Día D on election day =====
let {ctx,p}=await mk('2027-06-06T09:30:00-06:00');
ok('6 pestañas',await p.evaluate(()=>document.querySelectorAll('#tabs button').length===6));
await p.click('#tabs button[data-t=dd]');await sh(p,'dd_tab');
ok('tablero muestra 340 casillas',await p.evaluate(()=>panel.textContent.includes('/340')));
await p.click('[data-ddv=cas]');await p.fill('#dq','1504');await p.waitForTimeout(500);await sh(p,'dd_cas');
await p.click('.dcas >> nth=0');ok('editor casilla abre',await p.evaluate(()=>document.getElementById('modal').style.display==='flex'));
await p.click('#e_inow');await p.fill('#e_np','Ana Ruiz');await p.check('#e_rp');await p.fill('#e_c10','40');await p.fill('#e_c12','110');
await p.click('summary');await p.selectOption('#e_xt','prop');await p.click('[data-g=g]');await p.fill('#e_xx','Lona a 20 m | con ~tilde~ y _guion_');await p.click('#e_xadd');
const vals={PAN:60,PRI:50,PRD:5,CF:10,MOR:70,PVEM:8,PT:6,CO:4,MC:30,NR:0,NU:7};for(const k in vals)await p.fill(`[data-av="${k}"]`,String(vals[k]));await p.fill('#e_tv','260');await p.fill('#e_cl','18:05');
await p.click('#e_save');await p.waitForTimeout(200);await sh(p,'dd_editor');
ok('alerta de acta que no cuadra (250 vs 260)',await p.evaluate(()=>document.getElementById('mbox').textContent.includes('no coincide')));
const href=await p.getAttribute('#mbox a[href^="https://wa.me"]','href');const msg=decodeURIComponent(href.split('text=')[1]);console.log(msg);
const st=await p.evaluate(()=>JSON.stringify(S.dd.c['1504-B']));
await p.click('#mclose');await p.waitForTimeout(300);ok('✕ cierra editor de casilla',await p.evaluate(()=>document.getElementById('modal').style.display!=='flex'));
// simulate 60 actas
await p.evaluate(()=>{CASL.slice(0,60).forEach((c,i)=>{if(c.id==='1504-B')return;const x=cset(c.id);x.i='07:4'+(i%10);x.rp=true;x.a={};S.dd.cfg.p.forEach(pp=>x.a[pp.k]=Math.round(Math.random()*60));x.tv=actaSum(x);x.t=Date.now()});save(true)});
await p.click('[data-ddv=tab]');await sh(p,'dd_tab2');ok('estimación aparece con ≥10% actas',await p.evaluate(()=>panel.textContent.includes('Estimación simple')));
await p.click('[data-ddv=res]');await sh(p,'dd_res');
await p.click('[data-ddv=prep]');await p.click('.dck >> nth=0');ok('checklist marca',await p.evaluate(()=>S.dd.ck.rg===true));await sh(p,'dd_prep');
await p.click('[data-ddv=cfg]');await p.fill('#cwa','8110000000');await p.click('#padd');await p.click('#csave');ok('ajustes: WhatsApp y partido nuevo',await p.evaluate(()=>S.dd.cfg.wa==='8110000000'&&S.dd.cfg.p.length===12));
await ctx.close();
// ===== war room imports the message =====
({ctx,p}=await mk('2027-06-06T19:00:00-06:00'));
await p.click('#tabs button[data-t=dd]');await p.click('[data-ddv=imp]');await p.fill('#itx','Juan: ok\n'+msg+'\notro texto');await p.click('#igo');
const st2=await p.evaluate(()=>JSON.stringify(S.dd.c['1504-B']));const A=JSON.parse(st),B=JSON.parse(st2);
ok('importación: instalación, rep, cortes, acta y total',A.i===B.i&&B.rp===true&&JSON.stringify(A.co)===JSON.stringify(B.co)&&JSON.stringify(A.a)===JSON.stringify(B.a)&&A.tv===B.tv&&A.cl===B.cl);
ok('importación: incidencia con texto especial intacto',B.inc&&B.inc[0].tx===A.inc[0].tx&&B.inc[0].g==='g');
await p.fill('#itx',msg);await p.click('#igo');ok('reporte repetido se ignora',await p.evaluate(()=>document.getElementById('ires').textContent.includes('ya estaban')));
await sh(p,'dd_imp');await ctx.close();
// ===== rep mode link =====
({ctx,p}=await mk('2027-06-06T08:00:00-06:00','?rep'));
ok('link ?rep abre modo representante',await p.evaluate(()=>tab==='dd'&&ddv==='rep'));await p.fill('#rq','1504');await p.click('.rpick >> nth=0');ok('representante elige casilla',await p.evaluate(()=>!!document.getElementById('e_save')));await sh(p,'dd_rep');await ctx.close();
// ===== Agenda during campaign =====
({ctx,p}=await mk('2027-04-20T10:00:00-06:00'));
await sh(p,'hoy_campana');ok('Hoy muestra pendiente de fiscalización',await p.evaluate(()=>!!document.querySelector('.fzhoy')));
await p.click('#tabs button[data-t=cal]');ok('Agenda → recorridos',await p.evaluate(()=>panel.textContent.includes('Semana del')));
await p.click('[data-ag=ev]');await sh(p,'ag_ev');ok('alerta registro vencido (eventos dentro de 7 días)',await p.evaluate(()=>panel.textContent.includes('registro de agenda vencido')));
await p.click('#fzmark');ok('marcar carga semanal',await p.evaluate(()=>fzEvents().filter(e=>e.sif).length>0));
await p.click('#evadd');await p.fill('#v_n','Reunión con vecinos Mitras');await p.fill('#v_f','2027-05-10');await p.check('#v_on');await p.click('#v_save');ok('evento nuevo guardado',await p.evaluate(()=>Object.keys(S.fz.ev).length===1));
await p.click('[data-ag=g]');await p.click('#gadd');await p.fill('#g_m','15000');await p.fill('#g_con','Lonas');await p.selectOption('#g_pago','ef');ok('aviso efectivo >90 UMA en el formulario',await p.evaluate(()=>document.getElementById('g_efw').textContent.includes('90 UMA')));await p.fill('#g_f','2027-04-15');await p.click('#g_save');
await p.click('#gadd');await p.fill('#g_m','1200000');await p.fill('#g_con','Espectaculares');await p.selectOption('#g_cat','esp');await p.check('#g_fac');await p.fill('#g_uuid','abc');await p.click('#g_save');
await sh(p,'ag_g');const al=await p.evaluate(()=>fzAlerts().map(a=>a.t));console.log(al);
ok('alerta efectivo',al.some(t=>t.includes('efectivo')));ok('alerta SIF >3 días',al.some(t=>t.includes('3 días')));ok('alerta tope ≥80%',al.some(t=>t.includes('tope')));ok('UUID inválido detectado',await p.evaluate(()=>gReq(S.fz.g[1]).some(r=>r[1].includes('UUID'))));
await p.click('.fzg >> nth=0');await sh(p,'ag_gedit');await p.click('#mclose');await p.waitForTimeout(300);ok('✕ cierra gasto',await p.evaluate(()=>document.getElementById('modal').style.display!=='flex'));
await p.click('[data-ag=ev]');await p.click('.fzev >> nth=0');await sh(p,'ag_evedit');await p.click('#mclose');await p.waitForTimeout(300);ok('✕ cierra evento',await p.evaluate(()=>document.getElementById('modal').style.display!=='flex'));
await p.click('[data-ag=cfg]');await sh(p,'ag_cfg');
// Davidsito chips + suplente
await p.evaluate(()=>showPop(null));await p.click('#dvbot');ok('suplente en estructura',await p.evaluate(()=>!!document.querySelector('.oslot[data-k=sup]')));await p.click('.chips button[data-v=dd]');ok('chip Día D navega',await p.evaluate(()=>tab==='dd'));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.click('.chips button[data-v=ag]');ok('chip Agenda navega',await p.evaluate(()=>tab==='cal'&&agSeg==='ev'));
await p.click('#tabs button[data-t=hoy]');await p.click('#hdd');ok('botón Día D abre tablero',await p.evaluate(()=>tab==='dd'));
await ctx.close();
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

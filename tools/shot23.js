const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],R=[];const ok=(n,c)=>R.push((c?'✅ ':'❌ ')+n);
const ctx=await b.newContext({...devices['iPhone 15 Pro Max'],deviceScaleFactor:2,offline:true});await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
ok('botón ＋ Gestoría',(await p.textContent('#fab')).includes('Gestoría'));ok('pestaña Gestorías',(await p.textContent('#tabs button[data-t=cap]')).includes('Gestorías'));
await p.click('#tabs button[data-t=cap]');ok('título Gestorías',(await p.textContent('#panel h1')).includes('Gestorías'));
await p.click('#fab');ok('tipo Gestoría en formulario',(await p.textContent('#mbox')).includes('Gestoría'));await p.click('[data-cat="Agua"]').catch(()=>{});
await p.click('#mclose');await p.waitForTimeout(300);
// add 2 water gestorías for stats
await p.evaluate(()=>{S.caps.push({id:'a1',k:'Petición',cat:'Agua',ts:Date.now(),st:'pend',sec:1595},{id:'a2',k:'Petición',cat:'Agua',ts:Date.now(),st:'pend',sec:1595});save(true)});
await p.click('#dvbot');await p.click('.chips button[data-v=prop]');await p.waitForTimeout(300);await p.screenshot({path:'../out/v23_list.png',scale:'css'});
ok('3 propuestas',await p.evaluate(()=>document.querySelectorAll('.oprop').length===3));ok('conteo gestorías de agua',(await p.textContent('.oprop >> nth=0')).includes('2 gestorías'));
await p.click('.oprop >> nth=0');await p.waitForTimeout(300);await p.screenshot({path:'../out/v23_det.png',scale:'css'});ok('detalle con frase',(await p.textContent('#mbox')).includes('FRASE PARA LA PUERTA'));
await p.evaluate(()=>document.getElementById('mbox').scrollTop=600);await p.waitForTimeout(200);await p.screenshot({path:'../out/v23_det2.png',scale:'css'});
await p.click('#opedit');await p.fill('#pt','Agua sin sorpresas (editada)');await p.click('#psave');ok('editar y guardar',await p.evaluate(()=>S.props[0].t.includes('editada')));
await p.click('#oback');await p.click('#opadd');await p.fill('#pt','Becas');await p.click('#psave');ok('agregar propuesta',await p.evaluate(()=>S.props.length===4));
await p.click('#opedit');await p.click('#preset');ok('restaurar originales',await p.evaluate(()=>S.props.length===3&&S.props[0].t==='Agua sin sorpresas'));
await p.click('#mclose');await p.waitForTimeout(300);ok('cerrar',await p.evaluate(()=>document.getElementById('modal').style.display!=='flex'));
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

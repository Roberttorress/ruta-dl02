const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[],R=[];
const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1,offline:true,geolocation:{latitude:25.70,longitude:-100.36,accuracy:8},permissions:['geolocation']});
await ctx.addInitScript(()=>{localStorage.setItem('dl02_ok','1')});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));p.on('dialog',d=>d.accept());
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);
const vis=sel=>p.evaluate(s=>{const e=document.querySelector(s);if(!e)return false;const c=getComputedStyle(e);return c.display!=='none'&&c.visibility!=='hidden'&&e.getClientRects().length>0},sel);
const ok=async(name,cond)=>{R.push((cond?'✅ ':'❌ ')+name)};
const modalOpen=()=>p.waitForTimeout(300).then(()=>p.evaluate(()=>document.getElementById('modal').style.display==='flex'));
// 1 popup sección
await p.evaluate("showPop(SB[979])");await ok('popup sección abre',await vis('#pop'));await p.click('#pop .x');await ok('popup sección ✕ cierra',!(await vis('#pop')));
// 2 nueva petición
await p.click('#fab');await ok('petición: ✕ visible',await vis('#mclose'));await p.screenshot({path:'../out/v12_cap.png'});await p.click('#mclose');await ok('petición: ✕ cierra',!(await modalOpen()));
await p.click('#fab');await p.click('#c_x');await ok('petición: Cancelar cierra',!(await modalOpen()));
await p.click('#fab');await p.mouse.click(200,5);await ok('petición: tocar fuera cierra',!(await modalOpen()));
await p.click('#fab');await p.keyboard.press('Escape');await ok('petición: Esc cierra',!(await modalOpen()));
// 3 ficha de petición
await p.evaluate("S.caps.push({id:'t1',k:'Petición',cat:'Agua',t:'Fuga en la esquina',ts:Date.now(),st:'pend',sec:979});save(true);openPet(S.caps[S.caps.length-1])");
await ok('ficha petición: ✕ visible',await vis('#mclose'));await p.screenshot({path:'../out/v12_pet.png'});await p.click('#mclose');await ok('ficha petición: ✕ cierra',!(await modalOpen()));
await p.evaluate("openPet(S.caps[S.caps.length-1])");await p.click('#mbox >> text=Cerrar');await ok('ficha petición: Cerrar cierra',!(await modalOpen()));
// 4 foto
await p.evaluate("document.getElementById('photo').style.display='flex'");await ok('foto: ✕ visible',await vis('#pclose'));await p.click('#pclose');await ok('foto: ✕ cierra',!(await vis('#photo')));
await p.evaluate("document.getElementById('photo').style.display='flex'");await p.mouse.click(30,400);await ok('foto: tocar cierra',!(await vis('#photo')));
// 5 detalle de recorrido
await p.evaluate("openDay(DAYS[0])");await ok('recorrido: botón ‹ Inicio visible',await vis('#bk'));await p.click('#bk');await ok('recorrido: ‹ Inicio regresa',await p.evaluate("cur===null"));
// 6 pestañas
for(const t of ['cal','av','cap','mas']){await p.click(`#tabs button[data-t=${t}]`);await p.click('#tabs button[data-t=hoy]');await ok('pestaña '+t+' → Hoy regresa',await p.evaluate("tab==='hoy'"))}
// 7 modo práctica
await p.click('text=Probar un recorrido aquí');await p.waitForTimeout(400);await ok('práctica: entra a modo calle',await p.evaluate("document.body.classList.contains('street')"));
await p.click('#sexit');await p.waitForTimeout(200);await ok('práctica: ✕ sale del modo calle',!(await p.evaluate("document.body.classList.contains('street')")));
await p.click('text=Probar un recorrido aquí');await p.waitForTimeout(400);await p.click('#send');await ok('fin de prueba: ✕ visible',await vis('#mclose'));await p.screenshot({path:'../out/v12_end.png'});
await p.click('#mclose');await ok('fin de prueba: ✕ vuelve a la calle',!(await modalOpen())&&await p.evaluate("document.body.classList.contains('street')"));
await p.click('#send');await p.click('#mok');await ok('fin de prueba: Terminar regresa a inicio',!(await p.evaluate("document.body.classList.contains('street')")));
// 8 Davidsito
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await ok('Davidsito: ✕ visible',await vis('#mclose'));await p.click('#mclose');await ok('Davidsito: ✕ cierra',!(await modalOpen()));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.click('.ozona[data-z="0"]');await p.click('.osec >> nth=0');await p.click('#oback');await ok('Davidsito: sección ‹ vuelve a zona',await p.evaluate("ov.v==='zona'"));
await p.click('#oback');await ok('Davidsito: zona ‹ vuelve a estructura',await p.evaluate("ov.v==='est'"));
await p.click('.oslot[data-k=a_com]');await p.click('#oback');await ok('Davidsito: puesto ‹ vuelve',await p.evaluate("ov.v==='est'"));
await p.click('.chips button[data-v=bus]');await p.fill('#oq','1504');await p.click('#oqr .osec');await p.click('#oback');await ok('Davidsito: búsqueda ‹ vuelve a búsqueda',await p.evaluate("ov.v==='bus'"));
await p.click('.chips button[data-v=metas]');await p.click('.osec >> nth=0');await p.click('#omap');await ok('Davidsito: Ver en mapa cierra y muestra sección',!(await modalOpen())&&await vis('#pop'));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.mouse.click(200,5);await ok('Davidsito: tocar fuera cierra',!(await modalOpen()));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.keyboard.press('Escape');await ok('Davidsito: Esc cierra',!(await modalOpen()));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.evaluate("document.getElementById('mbox').scrollTop=2000");await p.waitForTimeout(200);await ok('Davidsito: ✕ visible tras bajar',await vis('#mclose'));await p.screenshot({path:'../out/v13_scrolled.png'});await p.click('#mclose');await ok('Davidsito: ✕ cierra tras bajar',!(await modalOpen()));
await p.evaluate(()=>showPop(null));await p.click('#dvbot');await p.click('.ozona[data-z="1"]');await p.click('#mclose');await ok('Davidsito: ✕ cierra desde zona',!(await modalOpen()));
await p.click('#fab');await ok('después de Davidsito, ✕ de petición visible',await vis('#mclose'));await p.click('#mclose');
console.log(R.join('\n'));console.log('errs',errs);await b.close()})();

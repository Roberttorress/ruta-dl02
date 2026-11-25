const {chromium,devices}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
const ctx=await b.newContext({...devices['iPhone 13'],deviceScaleFactor:1,offline:true,geolocation:{latitude:25.4250,longitude:-100.1520,accuracy:8},permissions:['geolocation']});
await ctx.addInitScript(()=>{if(!localStorage.getItem('seeded')){localStorage.setItem('seeded','1');localStorage.setItem('dl02_ok','1');localStorage.setItem('dl02v3',JSON.stringify({v:3,days:{d3:{done:true,prog:50}},caps:[{id:'c1',k:'Petición',cat:'Agua',t:'viejo',ts:1,st:'pend'}],tally:[{r:'fav',ts:1,sec:1492}],prefs:{voice:false}}))}});
const p=await ctx.newPage();p.on('pageerror',e=>errs.push(e.message));
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(800);
const st=await p.evaluate(()=>{const S=JSON.parse(localStorage.getItem('dl02v3'));return {days:Object.keys(S.days).length,caps:S.caps.length,tally:S.tally.length,bk:!!localStorage.getItem('dl02v3_bk_r20261118')}});console.log('after reset:',JSON.stringify(st));
await p.screenshot({path:'../out/v10_hoy.png'});await p.click('text=🧪 Recorrido de prueba aquí');await p.waitForTimeout(800);
for(let k=1;k<=8;k++){await ctx.setGeolocation({latitude:25.4250+k*0.0002,longitude:-100.1520,accuracy:6});await p.waitForTimeout(150);if(k%2===0)await p.click('.tb[data-r=fav]')}
await p.click('.tb[data-r=ind]');await p.screenshot({path:'../out/v10_street.png'});
await p.click('#sfab');await p.waitForTimeout(200);await p.click('[data-cat=Alumbrado]');await p.fill('#c_txt','Prueba de lámpara');await p.click('#c_s');await p.waitForTimeout(300);
await p.click('#send');await p.waitForTimeout(300);await p.screenshot({path:'../out/v10_end.png'});await p.click('#mok');await p.waitForTimeout(400);
await p.click('#tabs button[data-t=av]');await p.waitForTimeout(200);const doors=await p.locator('.kpi .card .big').nth(2).textContent();
await p.click('#tabs button[data-t=cap]');await p.waitForTimeout(200);const tag=await p.locator('text=🧪 prueba').count();
await p.click('#tabs button[data-t=mas]');await p.waitForTimeout(200);const btn=await p.locator('text=Borrar datos de prueba').textContent();
p.once('dialog',d=>d.accept());await p.click('text=Borrar datos de prueba');await p.waitForTimeout(300);
const after=await p.evaluate(()=>{const S=JSON.parse(localStorage.getItem('dl02v3'));return S.tally.length+'/'+S.caps.length});
console.log('Avance puertas reales:',doors,'| tags prueba:',tag,'|',btn,'| tras borrar (puertas/caps):',after,'| errors',errs);await b.close()})();

const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const errs=[];const P=JSON.parse(fs.readFileSync('../out/calles_days40.json'));const d=P.days[2];const C=d.coords;
const ctx=await b.newContext({viewport:{width:1180,height:820},offline:true,geolocation:{latitude:C[0][1],longitude:C[0][0],accuracy:8},permissions:['geolocation']});
const p=await ctx.newPage();await p.clock.setFixedTime(new Date(d.fecha+'T09:00:00'));p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(600);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(500);
await p.screenshot({path:'../out/v6_hoy.png'});
await p.locator('.go').first().click();await p.waitForTimeout(500);await p.screenshot({path:'../out/v6_brief.png'});
await p.click('#stb');await p.waitForTimeout(800);
for(let k=1;k<=40;k++){const q=C[Math.min(k*3,C.length-1)];await ctx.setGeolocation({latitude:q[1],longitude:q[0],accuracy:8});await p.waitForTimeout(120);if(k%4===0)await p.click('.tb[data-r=fav]');if(k%7===0)await p.click('.tb[data-r=ind]');if(k===10)await p.click('.tb[data-r=na]')}
await p.waitForTimeout(400);await p.screenshot({path:'../out/v6_street.png'});
await p.click('#sfab');await p.waitForTimeout(300);await p.click('[data-cat=Agua]');await p.fill('#c_nom','Juan Pérez');await p.fill('#c_tel','8112345678');await p.check('#c_ok');await p.fill('#c_txt','Sin agua desde hace 2 semanas');await p.click('#c_s');await p.waitForTimeout(400);
await p.click('#send');await p.waitForTimeout(400);await p.screenshot({path:'../out/v6_end.png'});await p.click('#mok');await p.waitForTimeout(400);
await p.click('#tabs button[data-t=av]');await p.waitForTimeout(300);await p.screenshot({path:'../out/v6_av.png'});
await p.click('#tabs button[data-t=mas]');await p.waitForTimeout(200);await p.fill('#q','topo chico');await p.waitForTimeout(500);await p.screenshot({path:'../out/v6_mas.png'});
console.log('errors:',errs);await b.close()})();

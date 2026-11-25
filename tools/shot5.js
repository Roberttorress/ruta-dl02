const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const errs=[];
async function run(date,name,steps){const ctx=await b.newContext({viewport:{width:1180,height:820},offline:true});const p=await ctx.newPage();if(date)await p.clock.setFixedTime(new Date(date));p.on('pageerror',e=>errs.push(name+': '+e.message));await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/RutaDL02_app_v2.html');await p.waitForTimeout(700);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(500);if(steps)await steps(p);await p.screenshot({path:'../out/'+name+'.png'});await ctx.close()}
await run(null,'v5_pre');
await run('2027-04-20T10:00:00','v5_dia');
await run('2027-04-25T10:00:00','v5_merc');
await run('2027-04-20T10:00:00','v5_cal',async p=>{await p.click('#tabs button[data-t=cal]');await p.waitForTimeout(300)});
console.log('errors:',errs);await b.close()})();

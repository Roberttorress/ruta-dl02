const pw=require('playwright');(async()=>{let b;try{b=await pw.webkit.launch()}catch(e){console.log('NO WEBKIT:',e.message.split('\n')[0]);return}
const ctx=await b.newContext({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const p=await ctx.newPage();const errs=[];p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push('console: '+m.text())});
await p.goto('file:///tmp/claude-0/-home-claude/9419e443-1d93-5159-8cb6-fedbd7344de5/scratchpad/out/site/index.html');await p.waitForTimeout(1500);await p.fill('#pin','2027');await p.click('#pinb');await p.waitForTimeout(1000);
await p.screenshot({path:'../out/wk.png'});console.log('errors:',errs);await b.close()})();

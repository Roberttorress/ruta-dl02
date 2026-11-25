const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:900,height:320}});
const svg=require('fs').readFileSync('mascot.svg','utf8');const css=require('fs').readFileSync('../out/site/index.html','utf8').match(/\.dv-b\{[^]*?prefers-reduced/)[0].replace('@media (prefers-reduced','');
await p.setContent('<style>'+css+'svg{width:280px;height:280px;background:#f3efe6;margin:4px}</style>'+svg+svg+svg);
const els=await p.$$('svg');await p.evaluate(()=>{const a=document.getAnimations();a.forEach(x=>x.pause());const ss=[...document.querySelectorAll('svg')];ss.forEach((s,i)=>s.getAnimations({subtree:true}).forEach(x=>x.currentTime=[0,1950,4020][i]))});
await p.screenshot({path:'../out/dv_frames.png'});await b.close()})();

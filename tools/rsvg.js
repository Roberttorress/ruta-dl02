const {chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:480,height:600}});
await p.setContent('<body style="margin:0;background:#f3efe6">'+require('fs').readFileSync('mascot.svg','utf8')+'</body><style>svg{width:480px;height:600px}</style>');
await p.screenshot({path:'../out/mascot.png'});await b.close()})();

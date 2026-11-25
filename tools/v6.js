/* ===== Leyenda por partido ganador ===== */
(function(){const L=$('leg');if(!L)return;const cnt={};SECS.forEach(x=>cnt[x.cat]=(cnt[x.cat]||0)+1);L.innerHTML='<b>Ganador 2024 por sección</b><br>'+Object.keys(CAT).filter(k=>cnt[k]).map(k=>'<span class="sem" style="background:'+CAT[k].c+'"></span>'+CAT[k].s+' ('+cnt[k]+')').join('<br>')+'<br><span class="mut" style="font-size:11px">Más intenso = ganó por más</span>'})();
/* ===== Vista maestra: notas por estatus con ícono ===== */
const STC={pend:'#d93025',gest:'#f29900',res:'#1a9d2b'},STN={pend:'Pendiente',gest:'En gestión',res:'Resuelta'};
const CATI={Alumbrado:'bulb',Agua:'drop',Drenaje:'drain',Pavimento:'road',Basura:'trash',Seguridad:'shield',Salud:'health',Empleo:'brief',Apoyo:'gift',Regularización:'file',Parques:'tree',Otro:'pin'};
const P2={};const icP=n=>P2[n]||(P2[n]=ICN[n].split('|').map(d=>new Path2D(d)));
let mvSel=null,mvHits=[];
drawPins=function(){const z=view.z,r=z<13.5?9:z<15?10.5:12;mvHits=[];
 S.caps.forEach(k=>{if(k.k!=='Petición'||!k.lon||k.test)return;const q=proj(k.lon,k.lat);if(q[0]<-30||q[0]>W+30||q[1]<-40||q[1]>H+20)return;const col=stcK(k),cy=q[1]-r*2.1,big=mvSel===k;const R=big?r*1.25:r;
  ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.bezierCurveTo(q[0]-R*.45,q[1]-R*.9,q[0]-R,cy+R*.75,q[0]-R,cy);ctx.arc(q[0],cy,R,Math.PI,0);ctx.bezierCurveTo(q[0]+R,cy+R*.75,q[0]+R*.45,q[1]-R*.9,q[0],q[1]);ctx.closePath();
  ctx.fillStyle=col;ctx.shadowColor='#0005';ctx.shadowBlur=5;ctx.shadowOffsetY=1;ctx.fill();ctx.shadowBlur=0;ctx.shadowOffsetY=0;ctx.lineWidth=big?2.5:1.6;ctx.strokeStyle='#fff';ctx.stroke();
  const sc=R*1.15/24;ctx.save();ctx.translate(q[0]-12*sc,cy-12*sc);ctx.scale(sc,sc);ctx.strokeStyle='#fff';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';icP(CATI[k.cat]||'pin').forEach(p=>ctx.stroke(p));ctx.restore();
  mvHits.push([q[0],cy,R,k])})}
function mvTap(x,y){const h=mvHits.slice().reverse().find(a=>Math.hypot(a[0]-x,a[1]-y)<a[2]+6);let c=$('mvpop');
 if(!h){mvSel=null;if(c)c.remove();reqDraw();return true}mvSel=h[3];const k=mvSel;if(!c){c=document.createElement('div');c.id='mvpop';document.body.appendChild(c)}
 const age=Math.floor((Date.now()-k.ts)/864e5);c.innerHTML='<div class="row" style="justify-content:space-between"><b>'+svgIc(CATI[k.cat]||'pin')+' '+esc(k.cat||'Gestoría')+'</b><span class="stpill" style="background:'+(stcK(k))+'">'+(typeof ETN!=='undefined'?ETN[etOf(k)]:STN[k.st])+'</span></div>'+
  '<div class="mut">'+(k.sec?'Sección '+pad(k.sec):'')+(typeof gCol==='function'&&gCol(k)?' · '+esc(gCol(k)):'')+'</div>'+(k.t?'<div style="margin-top:4px">'+esc(k.t)+'</div>':'')+'<div class="mut" style="margin-top:4px">'+new Date(k.ts).toLocaleDateString('es-MX',{day:'numeric',month:'short'})+(k.st!=='res'&&age>=1?' · '+age+' día'+(age>1?'s':'')+' abierta':'')+(k.urg==='urgente'?' · <b style="color:#d93025">Urgente</b>':'')+'</div>';
 const r=cv.getBoundingClientRect();let L=r.left+h[0]-130,T=r.top+h[1]-h[2]-12;c.style.left=Math.max(8,Math.min(innerWidth-268,L))+'px';c.style.top=Math.max(8,T)+'px';c.style.transform='translateY(-100%)';reqDraw();return true}
/* ===== Casillas georreferenciadas ===== */
S.casfix=S.casfix||{};const casKey=g=>g.s+'|'+g.cs[0];const casPos=g=>S.casfix[casKey(g)]||{lon:g.lon,lat:g.lat};
let casHits=[];const casVisible=()=>!window.MAE&&(S.prefs.casL||(tab==='dd'&&view.z>=13)||view.z>=15.5);
function casState(g){const X=g.cs.map(c=>cg(g.s+'-'+c));if(X.some(x=>(x.inc||[]).some(i=>!i.r)))return '#d93025';const n=X.filter(x=>x.i).length;return n===X.length&&n?'#1a9d2b':n?'#f29900':null}
function drawCasillas(){casHits=[];if(!casVisible())return;const r=view.z<14?8:10;
 CASI.forEach(g=>{const p=casPos(g),q=proj(p.lon,p.lat);if(q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;const st=casState(g),conf=g.ok||S.casfix[casKey(g)];
  ctx.beginPath();if(ctx.roundRect)ctx.roundRect(q[0]-r,q[1]-r,2*r,2*r,4);else ctx.rect(q[0]-r,q[1]-r,2*r,2*r);ctx.fillStyle=st||(conf?'#1d4f9c':'#fff');ctx.shadowColor='#0004';ctx.shadowBlur=3;ctx.fill();ctx.shadowBlur=0;
  ctx.lineWidth=1.5;ctx.strokeStyle=conf||st?'#fff':'#1d4f9c';if(!conf&&!st)ctx.setLineDash([3,2]);ctx.stroke();ctx.setLineDash([]);
  const sc=r*1.5/24;ctx.save();ctx.translate(q[0]-12*sc,q[1]-12*sc);ctx.scale(sc,sc);ctx.strokeStyle=conf||st?'#fff':'#1d4f9c';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';icP('ballot').forEach(pp=>ctx.stroke(pp));ctx.restore();
  if(g.cs.length>1){ctx.beginPath();ctx.arc(q[0]+r,q[1]-r,7,0,7);ctx.fillStyle='#111';ctx.fill();ctx.fillStyle='#fff';ctx.font='bold 10px system-ui';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(g.cs.length,q[0]+r,q[1]-r+.5);ctx.textBaseline='alphabetic'}
  casHits.push([q[0],q[1],r,g])})}
function casTap(x,y){if(!casHits.length)return false;const h=casHits.slice().reverse().find(a=>Math.abs(a[0]-x)<a[2]+6&&Math.abs(a[1]-y)<a[2]+6);if(!h)return false;casPop(h[3]);return true}
function casPop(g){const p=$('pop'),pos=casPos(g),conf=g.ok||S.casfix[casKey(g)];sel=null;p.style.display='block';
 p.innerHTML='<div class="row" style="justify-content:space-between"><b>'+svgIc('ballot')+' Casilla'+(g.cs.length>1?'s':'')+' · Sección '+pad(g.s)+'</b><button class="x" id="cpx">✕</button></div><div style="font-weight:600;margin-top:2px">'+esc(g.lg)+'</div><div class="mut" style="font-size:12.5px">'+esc(g.d.replace(/\s+/g,' '))+'</div>'+
 (conf?'':'<div class="stpill" style="background:#f29900;display:inline-block;margin-top:6px">Ubicación por confirmar</div>')+
 '<div style="margin-top:8px">'+g.cs.map(c=>{const id=g.s+'-'+c,x=cg(id),io=(x.inc||[]).filter(i=>!i.r).length;return '<div class="casrow"><b>'+casName(c)+'</b><span class="mut">'+(x.i?'instalada '+x.i:'sin instalar')+((x.rp||x.rs)?' · con representante':'')+(io?' · <b style="color:#d93025">'+io+' incidencia'+(io>1?'s':'')+'</b>':'')+'</span>'+(can('diad')?'<button class="btn sec sm" data-cas="'+id+'">Abrir</button>':'')+'</div>'}).join('')+'</div>'+
 '<div class="row" style="gap:6px;margin-top:8px"><a class="btn sec sm" target="_blank" rel="noopener" href="https://www.google.com/maps/dir/?api=1&destination='+pos.lat+','+pos.lon+'">'+svgIc('map')+' Cómo llegar</a>'+(can('diad')?'<button class="btn sec sm" id="cpfix">'+svgIc('mappin')+' Corregir: estoy aquí</button>':'')+'</div>';
 $('cpx').onclick=()=>{p.style.display='none'};p.querySelectorAll('[data-cas]').forEach(b=>b.onclick=()=>ddOpen(b.dataset.cas));
 const fx=$('cpfix');if(fx)fx.onclick=()=>{if(!me){toast('Activa el GPS con ◎ y vuelve a intentar');return}if(!confirm('¿Mover esta casilla a tu ubicación actual?'))return;S.casfix[casKey(g)]={lon:+me.lon.toFixed(6),lat:+me.lat.toFixed(6),ts:Date.now()};save(true);toast('Ubicación de la casilla corregida');casPop(g);reqDraw()};reqDraw()}
(function(){const gp=$('gps');if(!gp)return;const b=document.createElement('button');b.id='casbtn';b.setAttribute('aria-label','Mostrar casillas');b.innerHTML=svgIc('ballot');const up=()=>b.classList.toggle('on',!!S.prefs.casL);up();
 b.onclick=()=>{S.prefs.casL=!S.prefs.casL;save();up();toast(S.prefs.casL?'Casillas visibles en el mapa':'Casillas ocultas');reqDraw()};gp.insertBefore(b,gp.firstChild)})();
/* ===== Davidsito opcional ===== */
const dvApply=()=>document.body.classList.toggle('nodv',!!S.prefs.nodv);dvApply();
const _rMas1=rMas;rMas=function(){_rMas1();const box=document.createElement('div');box.className='card';box.innerHTML='<label class="sw"><input type="checkbox" id="pnodv" '+(S.prefs.nodv?'':'checked')+'> Mostrar a Davidsito en el mapa</label><button class="btn sec sm" id="pbot" style="margin-top:6px">'+svgIc('building')+' Estructura y propuestas</button>';
 const ref=$('musers');if(ref)ref.insertAdjacentElement('afterend',box);else panel.appendChild(box);$('pnodv').onchange=e=>{S.prefs.nodv=!e.target.checked;save();dvApply()};$('pbot').onclick=()=>openBot()};
/* ===== Gestorías como tarjetas flotantes ===== */
let gHits=[];
function rrect(x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
function fitTxt(t,maxW){if(ctx.measureText(t).width<=maxW)return t;while(t.length>1&&ctx.measureText(t+'…').width>maxW)t=t.slice(0,-1);return t.trim()+'…'}
function drawCallouts(){gHits=[];const mae=!!window.MAE;if(!mae&&view.z<13.5)return;const dk=dark(),big=mae?1.12:1;
 const L=S.caps.filter(k=>k.k==='Petición'&&k.lon&&!k.test).map(k=>{const q=proj(k.lon,k.lat);return {k,q}}).filter(o=>o.q[0]>-120&&o.q[0]<W+120&&o.q[1]>-20&&o.q[1]<H+90);
 const pr=o=>(o.k===mvSel?-9:0)+(o.k.urg==='urgente'&&o.k.st!=='res'?0:1)+({pend:0,gest:1,res:2}[o.k.st]||0)*2;L.sort((a,b)=>pr(a)-pr(b)||b.k.ts-a.k.ts);
 const boxes=[],labeled=[],dots=[];let xmax=W-4;if(mae){const m=document.getElementById('mv');if(m){const mr=m.getBoundingClientRect(),cr=cv.getBoundingClientRect();if(mr.left>cr.left+100)xmax=mr.left-cr.left-8}}const H1=Math.round(46*big),R=Math.round(15*big);
 ctx.font='700 '+Math.round(13*big)+'px system-ui';
 L.forEach(o=>{const k=o.k,t1=(k.cat||'Gestoría')+(k.urg==='urgente'&&k.st!=='res'?' · Urgente':'');ctx.font='700 '+Math.round(13*big)+'px system-ui';const w1=ctx.measureText(t1).width;ctx.font=Math.round(12*big)+'px system-ui';
  const t2raw=(k.t||'').replace(/\s+/g,' ').trim()||(typeof gCol==='function'?gCol(k):'')||STN[k.st]||'';const w=Math.min(Math.round(230*big),Math.max(w1,Math.min(ctx.measureText(t2raw).width,Math.round(170*big)))+R*2+30);
  const x=o.q[0]-w/2,y=o.q[1]-12-H1;const bx=[x-4,y-4,x+w+4,o.q[1]+4];if((!mae&&y<58)||x<4||x+w>xmax||boxes.some(b=>!(bx[2]<b[0]||bx[0]>b[2]||bx[3]<b[1]||bx[1]>b[3]))){dots.push(o);return}boxes.push(bx);labeled.push({o,x,y,w,t1,t2raw})});
 dots.forEach(o=>{const c=stcK(o.k);ctx.beginPath();ctx.arc(o.q[0],o.q[1],7*big,0,7);ctx.fillStyle=c;ctx.shadowColor='#0005';ctx.shadowBlur=4;ctx.fill();ctx.shadowBlur=0;ctx.lineWidth=2;ctx.strokeStyle='#fff';ctx.stroke();gHits.push([o.q[0]-10,o.q[1]-10,o.q[0]+10,o.q[1]+10,o.k])});
 labeled.reverse().forEach(({o,x,y,w,t1,t2raw})=>{const k=o.k,c=stcK(k),sel=k===mvSel;
  ctx.save();ctx.shadowColor='rgba(0,0,0,.28)';ctx.shadowBlur=14;ctx.shadowOffsetY=4;rrect(x,y,w,H1,12);ctx.fillStyle=dk?'#2c2c2e':'#fff';ctx.fill();ctx.restore();
  ctx.beginPath();ctx.moveTo(o.q[0]-7,y+H1-.5);ctx.lineTo(o.q[0],o.q[1]-3);ctx.lineTo(o.q[0]+7,y+H1-.5);ctx.closePath();ctx.fillStyle=dk?'#2c2c2e':'#fff';ctx.fill();
  if(sel){rrect(x,y,w,H1,12);ctx.lineWidth=2.5;ctx.strokeStyle=c;ctx.stroke()}
  ctx.beginPath();ctx.arc(o.q[0],o.q[1],4,0,7);ctx.fillStyle=c;ctx.fill();ctx.lineWidth=1.5;ctx.strokeStyle='#fff';ctx.stroke();
  const cx=x+8+R,cy=y+H1/2;ctx.beginPath();ctx.arc(cx,cy,R,0,7);ctx.fillStyle=c;ctx.fill();
  const sc=R*1.15/24;ctx.save();ctx.translate(cx-12*sc,cy-12*sc);ctx.scale(sc,sc);ctx.strokeStyle='#fff';ctx.lineWidth=2.4;ctx.lineCap='round';ctx.lineJoin='round';icP(CATI[k.cat]||'pin').forEach(pp=>ctx.stroke(pp));ctx.restore();
  const tx=x+R*2+16,tw=w-(R*2+24);ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.font='700 '+Math.round(13*big)+'px system-ui';ctx.fillStyle=dk?'#f2f2f2':'#111';
  const u=k.urg==='urgente'&&k.st!=='res';if(u){const base=k.cat||'Gestoría';ctx.fillText(fitTxt(base,tw),tx,y+H1/2-3);const bw=ctx.measureText(base).width;if(bw<tw-10){ctx.fillStyle='#d93025';ctx.fillText(fitTxt(' · Urgente',tw-bw),tx+bw,y+H1/2-3)}}else ctx.fillText(fitTxt(t1,tw),tx,y+H1/2-3);
  ctx.font=Math.round(12*big)+'px system-ui';ctx.fillStyle=dk?'#b0b0b5':'#5f6368';ctx.fillText(fitTxt(t2raw,tw),tx,y+H1/2+13);
  gHits.push([x,y,x+w,o.q[1]+4,k])})}
drawPins=function(){};
function gTap(x,y){const h=gHits.slice().reverse().find(a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3]);if(!h)return false;openPet(h[4]);return true}
mvTap=function(x,y){const h=gHits.slice().reverse().find(a=>x>=a[0]&&x<=a[2]&&y>=a[1]&&y<=a[3]);let c=$('mvpop');
 if(!h){mvSel=null;if(c)c.remove();reqDraw();return true}mvSel=h[4];const k=mvSel;if(!c){c=document.createElement('div');c.id='mvpop';document.body.appendChild(c)}
 const age=Math.floor((Date.now()-k.ts)/864e5);c.innerHTML='<div class="row" style="justify-content:space-between"><b>'+svgIc(CATI[k.cat]||'pin')+' '+esc(k.cat||'Gestoría')+'</b><span class="stpill" style="background:'+(stcK(k))+'">'+(typeof ETN!=='undefined'?ETN[etOf(k)]:STN[k.st])+'</span></div><div class="mut">'+(k.sec?'Sección '+pad(k.sec):'')+(typeof gCol==='function'&&gCol(k)?' · '+esc(gCol(k)):'')+'</div>'+(k.t?'<div style="margin-top:4px">'+esc(k.t)+'</div>':'')+'<div class="mut" style="margin-top:4px">'+new Date(k.ts).toLocaleDateString('es-MX',{day:'numeric',month:'short'})+(k.st!=='res'&&age>=1?' · '+age+' día'+(age>1?'s':'')+' abierta':'')+(k.urg==='urgente'?' · <b style="color:#d93025">Urgente</b>':'')+'</div>';
 const r=cv.getBoundingClientRect();c.style.left=Math.max(8,Math.min(innerWidth-268,r.left+(h[0]+h[2])/2-130))+'px';c.style.top=Math.max(8,r.top+h[1]-8)+'px';c.style.transform='translateY(-100%)';reqDraw();return true};
/* ===== 30 gestorías de ejemplo (demo:1, se borran con "Borrar datos de prueba") ===== */
const DEMO_G=[['Agua','Sin agua desde el lunes en toda la cuadra'],['Alumbrado','Tres lámparas apagadas frente a la primaria'],['Pavimento','Bache grande en la esquina, ya poncharon llantas'],['Seguridad','Piden patrullaje por las tardes'],['Basura','El camión no pasa desde hace dos semanas'],['Drenaje','Coladera tapada, se inunda cuando llueve'],['Parques','Juegos de la plaza rotos y sin pintura'],['Salud','Adulta mayor necesita silla de ruedas'],['Empleo','Joven busca trabajo, terminó prepa'],['Regularización','Escrituras de la casa sin regularizar'],['Apoyo','Familia pide apoyo con útiles escolares'],['Alumbrado','Poste con cables colgando'],['Agua','Fuga de agua en la banqueta hace días'],['Pavimento','Calle sin pavimentar, mucho polvo'],['Seguridad','Falta señalamiento en cruce escolar']];
function demoSeed(){let r=7;const rnd=()=>(r=(r*16807)%2147483647)/2147483647;const pip=(x,y,R)=>{let c=false;for(let i=0,j=R.length-1;i<R.length;j=i++){const a=R[i],b=R[j];if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])c=!c}return c};
 const now=Date.now(),sts=['pend','pend','gest','res','pend','gest','res','pend','res','gest'],step=SECS.length/30;
 for(let i=0;i<30;i++){const x=SECS[Math.floor(i*step+rnd()*step)%SECS.length],R=x.rings[0];let mn=[1e9,1e9],mx=[-1e9,-1e9];R.forEach(q=>{mn=[Math.min(mn[0],q[0]),Math.min(mn[1],q[1])];mx=[Math.max(mx[0],q[0]),Math.max(mx[1],q[1])]});
  let p=null;for(let t=0;t<60&&!p;t++){const a=[mn[0]+rnd()*(mx[0]-mn[0]),mn[1]+rnd()*(mx[1]-mn[1])];if(pip(a[0],a[1],R))p=a}if(!p)p=R.reduce((a,q)=>[a[0]+q[0]/R.length,a[1]+q[1]/R.length],[0,0]);
  const g=DEMO_G[i%DEMO_G.length],st=sts[i%10];S.caps.push({id:'demo'+i,demo:1,k:'Petición',cat:g[0],t:g[1],st,urg:(i%7===0&&st!=='res')?'urgente':'normal',nom:'Vecino de prueba '+(i+1),tel:'',ok:true,dir:'',ts:now-Math.floor(rnd()*20*864e5),sec:x.s,lon:+p[0].toFixed(5),lat:+p[1].toFixed(5),hist:st==='res'?[{st:'res',ts:now}]:[]})}}
if(!S.prefs.demo30){S.prefs.demo30=1;if(!S.caps.some(k=>k.demo))demoSeed();save(true);setTimeout(()=>{try{reqDraw()}catch(e){}},50)}
const _clearTest0=clearTest;clearTest=function(){const n=S.caps.filter(k=>k.demo).length;if(n&&confirm('¿Quitar las '+n+' gestorías de ejemplo?')){S.caps=S.caps.filter(k=>!k.demo);save(true);reqDraw();toast('Gestorías de ejemplo quitadas');try{render()}catch(e){}return}_clearTest0()};
/* ===== Botón para mostrar/ocultar gestorías en el mapa normal ===== */
(function(){const gp=$('gps');if(!gp)return;const b=document.createElement('button');b.id='gbtn';b.setAttribute('aria-label','Mostrar gestorías');b.innerHTML=svgIc('msg');const up=()=>b.classList.toggle('on',!S.prefs.gOff);up();
 b.onclick=()=>{S.prefs.gOff=!S.prefs.gOff;save();up();toast(S.prefs.gOff?'Gestorías ocultas en el mapa':'Gestorías visibles en el mapa');reqDraw()};gp.insertBefore(b,gp.firstChild)})();
const _drawCallouts0=drawCallouts;drawCallouts=function(){if(!window.MAE&&S.prefs.gOff){gHits=[];return}_drawCallouts0()};

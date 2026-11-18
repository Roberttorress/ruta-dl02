'use strict';
/* ===== data (injected) ===== */
const BUILD='8f776339',_D=window.__D;function dec(a){const o=[];let x=0,y=0;for(let k=0;k<a.length;k+=2){x+=a[k];y+=a[k+1];o.push([x/1e5,y/1e5])}return o}const DAYS=_D.days.map(d=>{d.coords=dec(d.c);delete d.c;return d}),MERC=_D.merc,NT=_D.NT,OUTER=dec(_D.outer);const SECS=_D.secs.map(x=>{x.rings=x.r.map(dec);delete x.r;return x});const SEG=(()=>{const a=_D.seg,o=[];let x=0,y=0;for(let k=0;k<a.length;k+=4){x+=a[k];y+=a[k+1];o.push([x/1e5,y/1e5,(x+a[k+2])/1e5,(y+a[k+3])/1e5])}return o})();delete window.__D;
const DIAD='2027-06-06';
const FN={1:'Fase 1 · Zona a favor',2:'Fase 2 · Zonas en empate',3:'Fase 3 · Zonas por recuperar'},CM={1:'#0d3b8c',2:'#b58900',3:'#e0761a'};
const CAT={'Bastión':{c:'#0d3b8c',n:'Zona fuerte a favor'},'Defender':{c:'#4f86d6',n:'Zona a favor'},'Empate':{c:'#f2c200',n:'Zona en empate'},'Recuperable':{c:'#f08a1d',n:'Zona por recuperar'},'Adverso':{c:'#9e9e9e',n:'Zona no prioritaria'}};
const PCAT={Alumbrado:'💡',Agua:'🚰',Drenaje:'🕳️',Pavimento:'🛣️',Basura:'🗑️',Seguridad:'🚔',Salud:'🏥',Empleo:'💼',Apoyo:'🤲',Regularización:'📄',Parques:'🌳',Otro:'📌'};
const KIND={Petición:'🙋',Contacto:'🤝',Incidencia:'⚠️',Nota:'💬'};
const STAT={pend:['Pendiente','#b58900'],gest:['En gestión','#1a73e8'],res:['Resuelta','#1a9d2b']};
const TALLY={fav:{e:'👍',n:'A favor',c:'#1a9d2b'},ind:{e:'🤔',n:'Indeciso',c:'#d9a400'},con:{e:'👎',n:'En contra',c:'#b3261e'},na:{e:'🚪',n:'No abrió',c:'#777'}};
const SB={};SECS.forEach(x=>SB[x.s]=x);DAYS.forEach(d=>{d.secs=d.secs.filter(s=>SB[s])});
const pad=s=>String(s).padStart(4,'0'),fmt=n=>Number(n).toLocaleString('es-MX'),$=id=>document.getElementById(id);
const esc=t=>String(t==null?'':t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/"/g,'&quot;');
const fdate=(iso,o)=>new Date(iso+'T12:00:00').toLocaleDateString('es-MX',o||{weekday:'short',day:'numeric',month:'short'});
const todayIso=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};
const daysTo=iso=>Math.round((new Date(iso+'T12:00:00')-new Date(todayIso()+'T12:00:00'))/864e5);
const NCAL=Math.max(...DAYS.map(d=>d.cal));
/* ===== storage ===== */
let S={};try{S=JSON.parse(localStorage.getItem('dl02v3')||'null')||{}}catch(e){}
if(!S.v){let old={};try{old=JSON.parse(localStorage.getItem('dl02v2')||'{}')}catch(e){}S={v:3,days:{},caps:old.caps||[],tally:[],prefs:{voice:true,hc:false}}}
S.days=S.days||{};S.caps=S.caps||[];S.tally=S.tally||[];S.prefs=S.prefs||{voice:true,hc:false};
let saveT=null;function save(now){clearTimeout(saveT);const w=()=>{try{localStorage.setItem('dl02v3',JSON.stringify(S))}catch(e){toast('⚠️ Memoria llena: exporta un respaldo en Más')}};now?w():saveT=setTimeout(w,400)}
const dk=d=>'d'+d.dia,dd=d=>S.days[dk(d)]||{};
/* ===== gate ===== */
(function(){let ok=false;try{ok=localStorage.getItem('dl02_ok')==='1'}catch(e){}const g=$('gate');if(ok){g.remove();return}
 const go=()=>{if($('pin').value==='2027'){try{localStorage.setItem('dl02_ok','1')}catch(e){}g.remove();setTimeout(()=>{resize();fitBounds(OUTER,.05)},50)}else{$('pinerr').textContent='Clave incorrecta';$('pin').value=''}};
 $('pinb').onclick=go;$('pin').onkeydown=e=>{if(e.key==='Enter')go()}})();
/* ===== geo ===== */
const KX=111320*Math.cos(25.74*Math.PI/180),KY=110574;
const dm=(a,b)=>Math.hypot((a[0]-b[0])*KX,(a[1]-b[1])*KY);
function segDist(p,a,b){const ax=a[0]*KX,ay=a[1]*KY,bx=b[0]*KX,by=b[1]*KY,px=p[0]*KX,py=p[1]*KY,l2=(bx-ax)**2+(by-ay)**2;let t=l2?((px-ax)*(bx-ax)+(py-ay)*(by-ay))/l2:0;t=Math.max(0,Math.min(1,t));return [Math.hypot(px-(ax+t*(bx-ax)),py-(ay+t*(by-ay))),t]}
function inside(x,y,r){let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const xi=r[i][0],yi=r[i][1],xj=r[j][0],yj=r[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)ins=!ins}return ins}
SECS.forEach(x=>{let a=180,b=-180,c=90,d=-90;x.rings.forEach(r=>r.forEach(p=>{a=Math.min(a,p[0]);b=Math.max(b,p[0]);c=Math.min(c,p[1]);d=Math.max(d,p[1])}));x.bb=[a,c,b,d]});
const secAt=(lo,la)=>SECS.find(x=>lo>=x.bb[0]&&lo<=x.bb[2]&&la>=x.bb[1]&&la<=x.bb[3]&&x.rings.some(r=>inside(lo,la,r)));
DAYS.forEach(d=>{let L=0;d.cum=[0];for(let i=0;i<d.coords.length-1;i++){L+=dm(d.coords[i],d.coords[i+1]);d.cum.push(L)}d.len=L});
/* ===== map engine (Path2D in world coords, z16 base) ===== */
const cv=$('cv'),ctx=cv.getContext('2d');let W=0,H=0,DPR=1;const TS=256,Z0=16;
const lx=(lon,z)=>(lon+180)/360*TS*2**z,ly=(lat,z)=>{const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*TS*2**z};
const ilx=(x,z)=>x/(TS*2**z)*360-180,ily=(y,z)=>{const n=Math.PI-2*Math.PI*y/(TS*2**z);return 180/Math.PI*Math.atan(.5*(Math.exp(n)-Math.exp(-n)))};
const X0=lx(-100.35,Z0),Y0=ly(25.74,Z0);const wx=lon=>lx(lon,Z0)-X0,wy=lat=>ly(lat,Z0)-Y0;
let view={lon:-100.35,lat:25.74,z:13};
function mkPath(rings,close){const p=new Path2D();rings.forEach(r=>{r.forEach((q,i)=>i?p.lineTo(wx(q[0]),wy(q[1])):p.moveTo(wx(q[0]),wy(q[1])));if(close)p.closePath()});return p}
const P_STREETS=new Path2D();SEG.forEach(s=>{P_STREETS.moveTo(wx(s[0]),wy(s[1]));P_STREETS.lineTo(wx(s[2]),wy(s[3]))});
const P_OUTER=mkPath([OUTER],true);const P_CAT={};Object.keys(CAT).forEach(k=>P_CAT[k]=new Path2D());const P_BORD=new Path2D();
SECS.forEach(x=>{x.path=mkPath(x.rings,true);P_CAT[x.cat].addPath(x.path);P_BORD.addPath(x.path);const r=x.rings.reduce((a,b)=>b.length>a.length?b:a);let sx=0,sy=0;r.forEach(p=>{sx+=p[0];sy+=p[1]});x.c=[sx/r.length,sy/r.length]});
DAYS.forEach(d=>{d.path=null});const routePath=d=>d.path||(d.path=mkPath([d.coords],false));
let tiles={},useTiles=navigator.onLine,tileFail=0,drawQ=false;
function tile(z,x,y){const k=z+'/'+x+'/'+y;let t=tiles[k];if(t)return t;const im=new Image();t=tiles[k]={im,ok:false};im.onload=()=>{t.ok=true;reqDraw()};im.onerror=()=>{t.err=true;if(++tileFail>6&&useTiles){useTiles=false;stat('Sin internet: se ven las calles guardadas');reqDraw()}};im.src='https://tile.openstreetmap.org/'+k+'.png';return t}
function resize(){DPR=Math.min(2,window.devicePixelRatio||1);W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;reqDraw()}
window.addEventListener('resize',resize);window.addEventListener('orientationchange',()=>setTimeout(resize,300));if(window.visualViewport)visualViewport.addEventListener('resize',()=>{if(!document.activeElement||!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){window.scrollTo(0,0);resize()}});
document.addEventListener('focusout',()=>setTimeout(()=>{window.scrollTo(0,0);resize()},120));
const sc=()=>2**(view.z-Z0),cw=()=>[wx(view.lon),wy(view.lat)];
function proj(lon,lat){const s=sc(),c=cw();return [(wx(lon)-c[0])*s+W/2,(wy(lat)-c[1])*s+H/2]}
function unproj(px,py){const s=sc(),c=cw();const X=(px-W/2)/s+c[0]+X0,Y=(py-H/2)/s+c[1]+Y0;return [ilx(X,Z0),ily(Y,Z0)]}
const mPerPx=()=>40075016*Math.cos(view.lat*Math.PI/180)/(TS*2**view.z);
function reqDraw(){if(drawQ)return;drawQ=true;requestAnimationFrame(()=>{drawQ=false;draw()})}
let cur=null,me=null,sel=null,hl=null,follow=false;const dark=()=>matchMedia('(prefers-color-scheme:dark)').matches&&!S.prefs.hc;
function draw(){if(!W)return;const s=sc(),c=cw();ctx.setTransform(DPR,0,0,DPR,0,0);ctx.fillStyle=getComputedStyle(document.body).getPropertyValue('--mapbg')||'#f3efe6';ctx.fillRect(0,0,W,H);
 if(useTiles){const zi=Math.max(11,Math.min(19,Math.round(view.z))),k=2**(view.z-zi),cx=lx(view.lon,zi),cy=ly(view.lat,zi);const x0=Math.floor((cx-W/2/k)/TS),x1=Math.floor((cx+W/2/k)/TS),y0=Math.floor((cy-H/2/k)/TS),y1=Math.floor((cy+H/2/k)/TS);
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const t=tile(zi,x,y);if(t.ok)ctx.drawImage(t.im,(x*TS-cx)*k+W/2,(y*TS-cy)*k+H/2,TS*k+.6,TS*k+.6)}
  ctx.fillStyle=dark()?'#0009':'#fff5';ctx.fillRect(0,0,W,H)}
 ctx.setTransform(DPR*s,0,0,DPR*s,DPR*(W/2-c[0]*s),DPR*(H/2-c[1]*s));
 if(!useTiles){ctx.strokeStyle=dark()?'#4a4a4a':'#b9b4a8';ctx.lineWidth=(view.z>=16?1.6:1)/s;ctx.stroke(P_STREETS)}
 const cs=cur?new Set(cur.secs):null;
 for(const k in P_CAT){ctx.fillStyle=CAT[k].c;ctx.globalAlpha=cur?.07:.13;ctx.fill(P_CAT[k])}ctx.globalAlpha=1;
 if(cs)SECS.forEach(x=>{if(cs.has(x.s)){ctx.fillStyle=CAT[x.cat].c;ctx.globalAlpha=.26;ctx.fill(x.path);ctx.globalAlpha=1}});
 if(sel){ctx.fillStyle=CAT[sel.cat].c;ctx.globalAlpha=.4;ctx.fill(sel.path);ctx.globalAlpha=1}
 if(hl)hl.forEach(x=>{ctx.strokeStyle='#e0119d';ctx.lineWidth=4/s;ctx.stroke(x.path)});
 ctx.strokeStyle=dark()?'#777':'#666';ctx.lineWidth=.8/s;ctx.stroke(P_BORD);
 if(cs){ctx.strokeStyle=CM[cur.f];ctx.lineWidth=2.5/s;SECS.forEach(x=>{if(cs.has(x.s))ctx.stroke(x.path)})}
 ctx.strokeStyle='#000';ctx.lineWidth=3/s;ctx.stroke(P_OUTER);
 if(cur){const p=routePath(cur);ctx.lineJoin='round';ctx.lineCap='round';ctx.strokeStyle='#fff';ctx.lineWidth=10/s;ctx.stroke(p);ctx.strokeStyle=CM[cur.f];ctx.lineWidth=6/s;ctx.stroke(p);
  const pr=dd(cur).prog||0;if(pr>0){ctx.beginPath();for(let i=0;i<=Math.min(pr,cur.coords.length-1);i++){const q=cur.coords[i];i?ctx.lineTo(wx(q[0]),wy(q[1])):ctx.moveTo(wx(q[0]),wy(q[1]))}ctx.strokeStyle='#1a9d2b';ctx.lineWidth=6/s;ctx.stroke()}
  if(view.z>=15.5)arrows(cur,s)}
 ctx.setTransform(DPR,0,0,DPR,0,0);
 if(view.z>=13.5){const fs=Math.round(Math.min(14,8+(view.z-13.5)*2.5));ctx.font='bold '+fs+'px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.fillStyle='#111';
  SECS.forEach(x=>{const q=proj(x.c[0],x.c[1]);if(q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;ctx.strokeText(pad(x.s),q[0],q[1]);ctx.fillText(pad(x.s),q[0],q[1])})}
 if(cur){dot(proj(...cur.coords[0]),'#1a9d2b','Inicio');dot(proj(...cur.coords.at(-1)),'#000','Fin');if(street.on&&street.next){const q=proj(...cur.coords[street.next.i]);ctx.beginPath();ctx.arc(q[0],q[1],8,0,7);ctx.strokeStyle='#e0119d';ctx.lineWidth=3;ctx.stroke()}}
 if(view.z>=16.5)S.tally.forEach(t=>{if(!t.lon)return;const q=proj(t.lon,t.lat);if(q[0]<0||q[0]>W||q[1]<0||q[1]>H)return;ctx.beginPath();ctx.arc(q[0],q[1],4,0,7);ctx.fillStyle=TALLY[t.r].c;ctx.fill()});
 if(view.z>=14)S.caps.forEach(k=>{if(!k.lon)return;const q=proj(k.lon,k.lat);if(q[0]<-20||q[0]>W+20||q[1]<-20||q[1]>H+20)return;ctx.beginPath();ctx.arc(q[0],q[1],13,0,7);ctx.fillStyle=k.st?(k.st==='res'?'#1a9d2b':k.urg==='urgente'?'#b3261e':k.st==='gest'?'#1a73e8':'#b58900'):'#555';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText(k.cat?PCAT[k.cat]:KIND[k.k],q[0],q[1]+5)});
 if(me){const q=proj(me.lon,me.lat);ctx.beginPath();ctx.arc(q[0],q[1],Math.min(me.acc/mPerPx(),300),0,7);ctx.fillStyle='#1a73e822';ctx.fill();if(me.hd!=null){ctx.save();ctx.translate(q[0],q[1]);ctx.rotate(me.hd*Math.PI/180);ctx.beginPath();ctx.moveTo(0,-22);ctx.lineTo(8,-8);ctx.lineTo(-8,-8);ctx.closePath();ctx.fillStyle='#1a73e8';ctx.fill();ctx.restore()}dot(q,'#1a73e8',null)}
 ctx.font='10px system-ui';ctx.textAlign='right';ctx.fillStyle='#555';ctx.fillText(useTiles?'© OpenStreetMap':'calles OSM guardadas',W-6,H-6)}
function arrows(d,s){const step=120;let next=step;ctx.fillStyle='#fff';for(let i=0;i<d.coords.length-1;i++){if(d.cum[i+1]<next)continue;const a=d.coords[i],b=d.coords[i+1];const ang=Math.atan2(wy(b[1])-wy(a[1]),wx(b[0])-wx(a[0]));const t=(next-d.cum[i])/((d.cum[i+1]-d.cum[i])||1);const x=wx(a[0])+(wx(b[0])-wx(a[0]))*t,y=wy(a[1])+(wy(b[1])-wy(a[1]))*t;ctx.save();ctx.translate(x,y);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(4/s,0);ctx.lineTo(-3/s,3/s);ctx.lineTo(-3/s,-3/s);ctx.closePath();ctx.fill();ctx.restore();next+=step}}
function dot(p,c,label){ctx.beginPath();ctx.arc(p[0],p[1],10,0,7);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();if(label){ctx.font='bold 13px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.fillStyle='#111';ctx.strokeText(label,p[0],p[1]-15);ctx.fillText(label,p[0],p[1]-15)}}
/* gestures */
let ptrs=new Map(),last=null,pinch=null,moved=false;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=false;if(ptrs.size===1)last=[e.clientX,e.clientY];if(ptrs.size===2){const a=[...ptrs.values()];pinch={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),z:view.z,c:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]}}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);const r=cv.getBoundingClientRect();
 if(ptrs.size===2&&pinch){const a=[...ptrs.values()];const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);zoomAt(Math.max(11,Math.min(19.5,pinch.z+Math.log2(d/pinch.d))),[pinch.c[0]-r.left,pinch.c[1]-r.top]);const c=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];panPx(c[0]-pinch.c[0],c[1]-pinch.c[1]);pinch.c=c;moved=true;setFollow(false)}
 else if(ptrs.size===1&&last){const dx=e.clientX-last[0],dy=e.clientY-last[1];if(Math.hypot(dx,dy)>3){moved=true;setFollow(false)}if(moved){panPx(dx,dy);last=[e.clientX,e.clientY]}}});
function up(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(ptrs.size===0){if(!moved)tap(e.clientX,e.clientY);last=null}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.max(11,Math.min(19.5,view.z-e.deltaY*.002)),[e.offsetX,e.offsetY])},{passive:false});
function panPx(dx,dy){const c=unproj(W/2-dx,H/2-dy);view.lon=c[0];view.lat=c[1];reqDraw()}
function zoomAt(nz,c){const b=unproj(c[0],c[1]);view.z=nz;const a=unproj(c[0],c[1]);view.lon+=b[0]-a[0];view.lat+=b[1]-a[1];reqDraw()}
function fitBounds(coords,p){let a=180,b=-180,c=90,d=-90;coords.forEach(q=>{a=Math.min(a,q[0]);b=Math.max(b,q[0]);c=Math.min(c,q[1]);d=Math.max(d,q[1])});view.lon=(a+b)/2;view.lat=(c+d)/2;for(let z=19;z>=11;z-=.25){view.z=z;const A=proj(a,d),B=proj(b,c);if(B[0]-A[0]<W*(1-p)&&B[1]-A[1]<H*(1-p))break}reqDraw()}
function tap(px,py){const r=cv.getBoundingClientRect(),x=px-r.left,y=py-r.top;
 if(view.z>=14){const hit=S.caps.find(k=>k.lon&&Math.hypot(proj(k.lon,k.lat)[0]-x,proj(k.lon,k.lat)[1]-y)<16);if(hit){openPet(hit);return}}
 const [lo,la]=unproj(x,y);sel=secAt(lo,la)||null;showPop(sel);reqDraw()}
function showPop(x){const p=$('pop');if(!x){p.style.display='none';return}const st=secStats(x.s);p.style.display='block';
 p.innerHTML='<div class="row" style="justify-content:space-between"><b>Sección '+pad(x.s)+'</b><button class="x" onclick="$(\'pop\').style.display=\'none\'">✕</button></div><span class="sem" style="background:'+CAT[x.cat].c+'"></span>'+CAT[x.cat].n+'<br>'+fmt(x.ln)+' personas con credencial<br>Meta 2027: <b>'+fmt(x.meta)+'</b> votos ('+fmt(x.fyc)+' en 2024, <b>faltan '+fmt(x.delta)+'</b>)'+(st.fav?'<br>👍 '+st.fav+' a favor identificados':'')+(st.pets?'<br>🙋 '+st.pets+' peticiones':'')+'<br><small class="mut">'+esc(x.col)+'</small>'}
/* ===== stats ===== */
function secStats(s){const t=S.tally.filter(x=>x.sec===s);const c={fav:0,ind:0,con:0,na:0};t.forEach(x=>c[x.r]++);c.doors=t.length;c.pets=S.caps.filter(k=>k.k==='Petición'&&k.sec===s).length;return c}
function topCats(secs){const m={};S.caps.forEach(k=>{if(k.k==='Petición'&&secs.includes(k.sec))m[k.cat]=(m[k.cat]||0)+1});return Object.entries(m).sort((a,b)=>b[1]-a[1])}
/* ===== UI shell ===== */
const panel=$('panel');let tab='hoy';
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{if(street.on)return;if(b.dataset.t==='hoy')goHome();else{tab=b.dataset.t;render()}});
function goHome(){cur=null;sel=null;hl=null;$('pop').style.display='none';setFollow(false);tab='hoy';render();fitBounds(OUTER,.05)}
function stat(t,keep){const g=$('gst');g.textContent=t;g.classList.remove('hide');clearTimeout(g._t);if(!keep)g._t=setTimeout(()=>g.classList.add('hide'),4000)}
function toast(t,ms,onclick){const el=$('toast');el.innerHTML=t;el.style.display='block';el.onclick=onclick||null;clearTimeout(el._t);el._t=setTimeout(()=>el.style.display='none',ms||3500)}
function render(){document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===tab));({hoy:rHoy,cal:rCal,av:rAv,cap:rCap,mas:rMas})[tab]();panel.scrollTop=0}
function diaD(){const n=daysTo(DIAD);if(n<0)return '';return '<div class="diad"><div class="k">DÍA D · JORNADA ELECTORAL</div><div class="v">'+(n===0?'¡Hoy se vota!':'Faltan '+n+' día'+(n===1?'':'s'))+'</div><div>Domingo 6 de junio de 2027</div></div>'}
function vot(d){return d.secs.reduce((a,s)=>a+SB[s].delta,0)}
function dayCard(d){const o=dd(d),pr=o.prog?Math.round(100*d.cum[Math.min(o.prog,d.cum.length-1)]/d.len):0;
 return '<div class="card"><div class="row" style="justify-content:space-between"><b style="font-size:18px">'+(d.turno==='Mañana'?'☀️ ':'🌇 ')+d.turno+'</b><span class="mut">'+(d.len/1000).toFixed(1)+' km · '+d.secs.length+' secc.</span></div>'+
 '<div style="margin:6px 0">'+d.secs.map(s=>'<div><span class="sem" style="background:'+CAT[SB[s].cat].c+'"></span><b>'+pad(s)+'</b> '+esc(SB[s].col.split(',')[0])+'</div>').join('')+'</div>'+
 (o.done?'<div class="okline">✓ Hecho'+(o.sum?' · 🚪 '+o.sum.doors+' · 👍 '+o.sum.fav:'')+'</div>':(pr?'<div class="bar"><i style="width:'+pr+'%;background:var(--ok)"></i></div><div class="mut">'+pr+'% avanzado</div>':'')+'<button class="btn go" data-d="'+d.dia+'">'+(pr?'▶ Continuar':'Ver recorrido')+'</button>')+'</div>'}
function mercCard(m){return '<div class="card" style="border:2px solid var(--org)"><div style="font-size:20px;font-weight:800">🛒 Domingo de mercadito</div><div class="mut">'+fdate(m.fecha,{weekday:'long',day:'numeric',month:'long'})+'</div><p>Sin recorrido casa por casa. Presencia en el mercado rodante de la zona de esta semana:</p>'+m.secs.filter(x=>SB[x]).map((x,i)=>'<div><span class="sem" style="background:'+CAT[SB[x].cat].c+'"></span><b>'+pad(x)+'</b> '+esc(m.cols[i])+'</div>').join('')+'<p class="mut">Anuncia los recorridos de la semana y levanta peticiones con el botón ＋.</p><button class="btn sec" onclick="openCap()">＋ Registrar petición</button></div>'}
function listHtml(list){return list.map(d=>{const o=dd(d);return '<div class="item'+(o.done?' done':'')+(cur===d?' sel':'')+'" data-d="'+d.dia+'"><div class="chk">✓</div><div style="flex:1"><div class="t"><span class="sem" style="background:'+CM[d.f]+'"></span>'+fdate(d.fecha)+' · '+d.turno+'</div><div class="m">'+d.secs.map(pad).join(', ')+' · '+(d.len/1000).toFixed(1)+' km'+(o.sum?' · 👍 '+o.sum.fav:'')+'</div></div></div>'}).join('')}
function bindList(){panel.querySelectorAll('.item[data-d],.go').forEach(e=>e.onclick=()=>openDay(DAYS.find(x=>x.dia==e.dataset.d)))}
function rHoy(){const t=todayIso();let h=diaD();const done=DAYS.filter(d=>dd(d).done).length;const first=DAYS[0].fecha,lastD=DAYS.at(-1).fecha;
 if(cur){panel.innerHTML=briefing(cur);bindBrief();return}
 h+='<div class="mut">'+done+' de '+DAYS.length+' recorridos hechos</div>';const mt=MERC.find(m=>m.fecha===t),td=DAYS.filter(d=>d.fecha===t);
 if(t<first){h+='<h1>Arranque: '+fdate(first,{weekday:'long',day:'numeric',month:'long'})+'</h1><p class="mut">5 abr – 2 jun · 2 recorridos diarios de lunes a sábado · domingos de mercadito.</p>';DAYS.filter(d=>d.cal===1).forEach(d=>h+=dayCard(d))}
 else if(mt){h+='<h1>Hoy</h1>'+mercCard(mt);const nx=DAYS.find(d=>d.fecha>t);if(nx){h+='<h2>Siguiente: '+fdate(nx.fecha,{weekday:'long',day:'numeric',month:'long'})+'</h2>';DAYS.filter(d=>d.cal===nx.cal).forEach(d=>h+=dayCard(d))}}
 else if(td.length){h+='<h1>Hoy · Día '+td[0].cal+' de '+NCAL+'</h1><div class="mut">'+fdate(t,{weekday:'long',day:'numeric',month:'long'})+'</div>';td.forEach(d=>h+=dayCard(d))}
 else if(t>lastD)h+='<h1>'+(t===DIAD?'Día D':'Cierre de campaña')+'</h1><p class="mut">'+(t===DIAD?'Jornada electoral: defensa del voto y representantes en las 343 casillas.':'Recorridos terminados el 2 de junio. Veda del 3 al 5 de junio; la elección es el domingo 6.')+'</p>';
 const late=DAYS.filter(d=>d.fecha<t&&!dd(d).done);if(late.length&&t>=first)h+='<h2 class="warn">Atrasados ('+late.length+')</h2>'+listHtml(late.slice(0,5));
 const urg=S.caps.filter(k=>k.urg==='urgente'&&k.st&&k.st!=='res').length;if(urg)h+='<div class="card warnc" onclick="tab=\'cap\';capFilter=\'urg\';render()">🔥 '+urg+' petición'+(urg>1?'es urgentes':' urgente')+' sin resolver ›</div>';
 panel.innerHTML=h;bindList()}
function briefing(d){const o=dd(d),c=CM[d.f],tc=topCats(d.secs),pr=o.prog?Math.round(100*d.cum[Math.min(o.prog,d.cum.length-1)]/d.len):0;
 const ln=d.secs.reduce((a,s)=>a+SB[s].ln,0),tal={fav:0,ind:0,con:0,na:0};S.tally.filter(t=>d.secs.includes(t.sec)).forEach(t=>tal[t.r]++);
 const leaders=S.caps.filter(k=>k.k==='Contacto'&&d.secs.includes(k.sec));
 return '<button class="back" id="bk">‹ Inicio</button><div class="mut">'+FN[d.f]+'</div><h1>'+fdate(d.fecha,{weekday:'long',day:'numeric',month:'short'})+' · '+d.turno+'</h1>'+
 '<div class="kpi"><div class="card"><div class="big">'+(d.len/1000).toFixed(1)+'</div><div class="mut">km</div></div><div class="card"><div class="big">'+fmt(ln)+'</div><div class="mut">credenciales</div></div><div class="card"><div class="big">'+fmt(vot(d))+'</div><div class="mut">votos por sumar</div></div></div>'+
 (pr?'<div class="bar"><i style="width:'+pr+'%;background:var(--ok)"></i></div><div class="mut">'+pr+'% recorrido</div>':'')+
 '<button class="btn" id="stb">'+(o.done?'↻ Recorrer de nuevo':pr?'▶ Continuar recorrido':'▶ Iniciar recorrido')+'</button>'+
 '<h2>Ficha de las secciones</h2>'+d.secs.map(s=>{const x=SB[s];const t=x.tot||1;return '<div class="card"><div class="row" style="justify-content:space-between"><b>'+pad(s)+' · '+esc(x.col.split(',')[0])+'</b><span class="pill" style="background:'+CAT[x.cat].c+'">'+CAT[x.cat].n+'</span></div><div class="mut">'+esc(x.col)+'</div>'+
  '<div style="margin-top:6px">'+fmt(x.ln)+' credenciales · meta <b>'+fmt(x.meta)+'</b> (faltan '+fmt(x.delta)+')</div><div class="res"><span style="width:'+(100*x.fyc/t)+'%;background:#1f5fbf"></span><span style="width:'+(100*x.mc/t)+'%;background:#f08a1d"></span><span style="width:'+(100*x.mo/t)+'%;background:#8b1a3a"></span><span style="width:'+(100*x.pt/t)+'%;background:#c62828"></span></div><div class="mut" style="font-size:12px">2024: FyC '+Math.round(100*x.fyc/t)+'% · MC '+Math.round(100*x.mc/t)+'% · Morena '+Math.round(100*x.mo/t)+'% · PT '+Math.round(100*x.pt/t)+'%</div></div>'}).join('')+
 (tc.length?'<h3>Lo que más piden aquí</h3>'+tc.slice(0,4).map(([k,n])=>PCAT[k]+' '+k+' <b>'+n+'</b>').join(' · '):'')+
 (leaders.length?'<h3>Contactos en la zona</h3>'+leaders.map(k=>'<div>🤝 <b>'+esc(k.nom||k.t.split(',')[0])+'</b>'+(k.tel?' · <a href="tel:'+k.tel+'">'+k.tel+'</a>':'')+'</div>').join(''):'')+
 ((tal.fav+tal.ind+tal.con+tal.na)?'<h3>Ya registrado aquí</h3>👍 '+tal.fav+' · 🤔 '+tal.ind+' · 👎 '+tal.con+' · 🚪 '+tal.na:'')+
 '<details><summary class="mut">Calles del recorrido ('+d.calles.length+')</summary><div class="mut" style="margin-top:6px">'+esc(d.calles.join(', '))+'</div></details>'+
 '<div class="row" style="margin-top:10px"><a class="btn sec" target="_blank" rel="noopener" href="'+gmUrl(d)+'">Google Maps</a><button class="btn sec" id="dn">'+(o.done?'✓ Hecho':'Marcar hecho')+'</button></div>'}
function bindBrief(){$('bk').onclick=goHome;$('stb').onclick=()=>startStreet(cur);$('dn').onclick=()=>{const o=dd(cur);S.days[dk(cur)]={...o,done:!o.done,at:Date.now()};save();render()}}
function gmUrl(d){const n=d.coords.length,pts=[];for(let k=0;k<10;k++)pts.push(d.coords[Math.round(k*(n-1)/9)]);return 'https://www.google.com/maps/dir/?api=1&travelmode=walking&origin='+pts[0][1]+','+pts[0][0]+'&destination='+pts[9][1]+','+pts[9][0]+'&waypoints='+encodeURIComponent(pts.slice(1,9).map(p=>p[1]+','+p[0]).join('|'))}
function openDay(d){cur=d;sel=null;hl=null;$('pop').style.display='none';setFollow(false);fitBounds(d.coords,.12);tab='hoy';render()}
function rCal(){let h=diaD()+'<h1>Calendario</h1><div class="mut">5 abr – 2 jun 2027 · '+NCAL+' días · 2 recorridos diarios · '+MERC.length+' domingos de mercadito</div>';const done=DAYS.filter(d=>dd(d).done).length;
 h+='<div class="bar"><i style="width:'+Math.round(100*done/DAYS.length)+'%"></i></div><div class="mut">'+done+' de '+DAYS.length+' hechos</div>';
 [1,2,3].forEach(f=>{const l=DAYS.filter(d=>d.f===f);if(l.length)h+='<div><span class="sem" style="background:'+CM[f]+'"></span>'+FN[f]+': '+fdate(l[0].fecha,{day:'numeric',month:'short'})+' – '+fdate(l.at(-1).fecha,{day:'numeric',month:'short'})+'</div>'});
 const pre=DAYS.filter(d=>d.fecha<MERC[0].fecha);if(pre.length)h+='<h2>Primera semana</h2>'+listHtml(pre);
 MERC.forEach((m,i)=>{const nx=MERC[i+1]?MERC[i+1].fecha:'9999';h+='<h2>Semana del '+fdate(m.fecha,{day:'numeric',month:'long'})+'</h2><div class="item"><div class="chk" style="border-color:var(--org)">🛒</div><div><div class="t">'+fdate(m.fecha)+' · Mercadito</div><div class="m">'+esc(m.cols.slice(0,3).join(', '))+'</div></div></div>'+listHtml(DAYS.filter(d=>d.fecha>m.fecha&&d.fecha<nx))});
 h+='<h2>Cierre</h2><div class="item"><div class="chk">⏸</div><div><div class="t">3 – 5 jun · Veda electoral</div><div class="m">Sin actos de campaña</div></div></div><div class="item" style="background:#b3261e14"><div class="chk" style="background:#b3261e;border-color:#b3261e;color:#fff">🗳</div><div><div class="t" style="color:#b3261e">Dom 6 jun · DÍA D</div><div class="m">Jornada electoral · defensa del voto en 343 casillas</div></div></div>';
 panel.innerHTML=h;bindList()}
function rAv(){const done=DAYS.filter(d=>dd(d).done).length,c={fav:0,ind:0,con:0,na:0};S.tally.forEach(t=>c[t.r]++);const doors=S.tally.length;
 const secs=[...new Set(DAYS.flatMap(d=>d.secs))],meta=secs.reduce((a,s)=>a+SB[s].delta,0);const km=DAYS.reduce((a,d)=>{const p=dd(d).prog||0;return a+(p?d.cum[Math.min(p,d.cum.length-1)]:0)},0)/1000;
 let h='<h1>Avance</h1><div class="kpi"><div class="card"><div class="big">'+done+'<small>/'+DAYS.length+'</small></div><div class="mut">recorridos</div></div><div class="card"><div class="big">'+km.toFixed(0)+'</div><div class="mut">km</div></div><div class="card"><div class="big">'+fmt(doors)+'</div><div class="mut">puertas</div></div></div>';
 h+='<h2>Votos identificados vs meta</h2><div class="mut">👍 '+fmt(c.fav)+' a favor identificados de '+fmt(meta)+' votos por sumar</div><div class="bar big2"><i style="width:'+Math.min(100,Math.round(100*c.fav/meta))+'%;background:var(--ok)"></i></div>';
 if(doors)h+='<div class="tallyrow">'+Object.keys(TALLY).map(k=>'<div><b style="color:'+TALLY[k].c+'">'+TALLY[k].e+' '+fmt(c[k])+'</b><div class="mut">'+TALLY[k].n+' · '+Math.round(100*c[k]/doors)+'%</div></div>').join('')+'</div>';
 [1,2,3].forEach(f=>{const l=DAYS.filter(d=>d.f===f),n=l.filter(d=>dd(d).done).length;h+='<div style="margin-top:8px"><span class="sem" style="background:'+CM[f]+'"></span>'+FN[f]+': '+n+'/'+l.length+'</div><div class="bar"><i style="width:'+Math.round(100*n/l.length)+'%;background:'+CM[f]+'"></i></div>'});
 const rows=secs.map(s=>({s,st:secStats(s)})).filter(r=>r.st.doors).sort((a,b)=>b.st.fav/SB[b.s].delta-a.st.fav/SB[a.s].delta);
 if(rows.length)h+='<h2>Por sección</h2><div class="mut">a favor identificados / votos por sumar</div>'+rows.slice(0,25).map(r=>{const p=Math.min(100,Math.round(100*r.st.fav/SB[r.s].delta));return '<div class="srow" data-s="'+r.s+'"><span><span class="sem" style="background:'+CAT[SB[r.s].cat].c+'"></span><b>'+pad(r.s)+'</b> '+esc(SB[r.s].col.split(',')[0])+'</span><span>'+r.st.fav+'/'+SB[r.s].delta+'</span></div><div class="bar"><i style="width:'+p+'%;background:var(--ok)"></i></div>'}).join('');
 const pets=S.caps.filter(k=>k.k==='Petición');if(pets.length){const m={};pets.forEach(k=>m[k.cat]=(m[k.cat]||0)+1);const mx=Math.max(...Object.values(m));h+='<h2>Qué pide la gente</h2>'+Object.entries(m).sort((a,b)=>b[1]-a[1]).map(([k,n])=>'<div>'+PCAT[k]+' '+k+' <b>'+n+'</b></div><div class="bar"><i style="width:'+Math.round(100*n/mx)+'%;background:var(--org)"></i></div>').join('');const r=pets.filter(k=>k.st==='res').length;h+='<div class="mut">Resueltas '+r+' de '+pets.length+' ('+Math.round(100*r/pets.length)+'%)</div>'}
 const late=DAYS.filter(d=>d.fecha<todayIso()&&!dd(d).done);if(late.length)h+='<h2 class="warn">Atrasados</h2>'+listHtml(late.slice(0,8));
 panel.innerHTML=h;bindList();panel.querySelectorAll('.srow').forEach(e=>e.onclick=()=>{const x=SB[e.dataset.s];sel=x;fitBounds(x.rings[0],.3);showPop(x)})}
/* ===== Más ===== */
function rMas(){const contacts=S.caps.filter(k=>k.k==='Contacto');
 panel.innerHTML='<h1>Más</h1><input id="q" placeholder="🔎 Buscar sección, colonia o calle" autocomplete="off"><div id="qr"></div>'+
 '<h2>Contactos y líderes ('+contacts.length+')</h2>'+(contacts.length?contacts.slice().reverse().map(k=>'<div class="cap"><b>🤝 '+esc(k.nom||'(sin nombre)')+'</b>'+esc(k.t)+'<div class="mut">'+(k.sec?'Sección '+pad(k.sec)+' · ':'')+new Date(k.ts).toLocaleDateString('es-MX')+'</div>'+(k.tel?'<div class="acts"><a href="tel:'+k.tel+'">📞 Llamar</a><a target="_blank" rel="noopener" href="https://wa.me/'+(k.tel.length===10?'52'+k.tel:k.tel)+'">💬 WhatsApp</a></div>':'')+'</div>').join(''):'<p class="mut">Registra líderes vecinales con ＋ → Contacto.</p>')+
 '<h2>Ajustes</h2><label class="sw"><input type="checkbox" id="pv" '+(S.prefs.voice?'checked':'')+'> 🔊 Indicaciones por voz en el recorrido</label><label class="sw"><input type="checkbox" id="ph" '+(S.prefs.hc?'checked':'')+'> ☀️ Alto contraste (para sol directo)</label>'+
 '<h2>Respaldo de datos</h2><p class="mut">Todo lo capturado vive en este dispositivo. Exporta un respaldo seguido y guárdalo (WhatsApp, correo, Drive).</p><div class="row"><button class="btn sec" id="bx">📤 Exportar respaldo</button><label class="btn sec" style="margin:0">📥 Restaurar<input type="file" id="bi" accept=".json,application/json" style="display:none"></label></div><button class="btn sec" id="bcsv">📊 Exportar peticiones y registros a Excel</button>'+
 '<h2>Ayuda</h2><div class="card"><b>1. Hoy</b> muestra los 2 recorridos del día (o el mercadito si es domingo). Toca uno para ver su ficha.</div><div class="card"><b>2. Iniciar recorrido</b> activa el modo calle: el mapa te sigue, te dice por qué calle vas y dónde girar, y pinta de verde lo caminado.</div><div class="card"><b>3. En cada puerta</b> toca 👍 🤔 👎 o 🚪. Es anónimo: solo cuenta y ubica, sin nombres. Si te equivocas, ↶ deshace.</div><div class="card"><b>4. Peticiones</b> con ＋: categoría, nombre, WhatsApp, foto y voz. Después avísale al vecino por WhatsApp cuando avance.</div><div class="card"><b>5. Al terminar</b> manda el reporte del turno al coordinador con un toque.</div><div class="card"><b>Privacidad</b>: no registres nombre ni teléfono sin el permiso de la persona. La preferencia política siempre es anónima.</div><p class="mut">Ruta DL02 · versión '+BUILD+'</p>';
 $('q').oninput=e=>search(e.target.value);$('pv').onchange=e=>{S.prefs.voice=e.target.checked;save()};$('ph').onchange=e=>{S.prefs.hc=e.target.checked;applyHC();save();reqDraw()};
 $('bx').onclick=()=>shareFile('respaldo_DL02_'+todayIso()+'.json',JSON.stringify(S),'application/json');$('bcsv').onclick=()=>shareFile('registros_DL02_'+todayIso()+'.csv','﻿'+csvAll(),'text/csv');
 $('bi').onchange=async e=>{const f=e.target.files[0];if(!f)return;try{const o=JSON.parse(await f.text());if(!o.days||!o.caps)throw 0;if(!confirm('¿Reemplazar los datos de este dispositivo con el respaldo? ('+o.caps.length+' capturas, '+(o.tally||[]).length+' puertas)'))return;S=o;S.prefs=S.prefs||{};S.tally=S.tally||[];save(true);toast('Respaldo restaurado');render();reqDraw()}catch(err){toast('Archivo de respaldo no válido')}}}
function search(q){q=q.trim().toUpperCase();const out=$('qr');if(q.length<2){out.innerHTML='';hl=null;reqDraw();return}
 const n=q.replace(/\D/g,'');let res=[];if(n.length>=3)res=SECS.filter(x=>pad(x.s).includes(n)).map(x=>({x,why:'Sección'}));
 const nq=q.normalize('NFD').replace(/[̀-ͯ]/g,'');if(!res.length){SECS.forEach(x=>{if(x.col.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().includes(nq))res.push({x,why:x.col.split(',').find(c=>c.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().includes(nq))})})}
 if(!res.length){const ds=DAYS.filter(d=>d.calles.some(c=>c.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().includes(nq)));const ss=new Set(ds.flatMap(d=>d.secs));res=[...ss].map(s=>({x:SB[s],why:'Calle en recorrido'}));out.innerHTML=ds.slice(0,6).map(d=>'<div class="item" data-d="'+d.dia+'"><div class="chk">🚶</div><div><div class="t">'+fdate(d.fecha)+' · '+d.turno+'</div><div class="m">'+esc(d.calles.filter(c=>c.normalize('NFD').replace(/[̀-ͯ]/g,'').toUpperCase().includes(nq)).join(', '))+'</div></div></div>').join('')}
 else out.innerHTML='';
 out.innerHTML=res.slice(0,8).map(r=>'<div class="srow" data-s="'+r.x.s+'"><span><span class="sem" style="background:'+CAT[r.x.cat].c+'"></span><b>'+pad(r.x.s)+'</b> '+esc(String(r.why||'').trim())+'</span><span class="mut">'+recDate(r.x.s)+'</span></div>').join('')+out.innerHTML;
 hl=res.map(r=>r.x);if(hl.length){fitBounds(hl.flatMap(x=>x.rings[0]),.2)}else{out.innerHTML='<p class="mut">Sin resultados</p>'}
 out.querySelectorAll('.srow').forEach(e=>e.onclick=()=>{const x=SB[e.dataset.s];sel=x;fitBounds(x.rings[0],.3);showPop(x)});out.querySelectorAll('.item[data-d]').forEach(e=>e.onclick=()=>openDay(DAYS.find(x=>x.dia==e.dataset.d)))}
function recDate(s){const d=DAYS.find(d=>d.secs.includes(s));return d?'recorrido '+fdate(d.fecha,{day:'numeric',month:'short'}):'fuera del plan'}
function applyHC(){document.documentElement.classList.toggle('hc',!!S.prefs.hc)}
async function shareFile(name,text,type){const file=new File([text],name,{type});if(navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:name});return}catch(e){if(e.name==='AbortError')return}}const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=name;document.body.appendChild(a);a.click();a.remove()}
function csvAll(){const R=[['fecha','tipo','categoria/resultado','urgencia','estatus','nombre','telefono','direccion','seccion','lat','lon','texto']];
 S.caps.forEach(c=>R.push([new Date(c.ts).toLocaleString('es-MX'),c.k,c.cat||'',c.urg||'',c.st?STAT[c.st][0]:'',c.nom||'',c.tel||'',c.dir||'',c.sec?pad(c.sec):'',c.lat||'',c.lon||'',(c.t||'').replace(/\s+/g,' ')]));
 S.tally.forEach(t=>R.push([new Date(t.ts).toLocaleString('es-MX'),'Puerta',TALLY[t.r].n,'','','','','',t.sec?pad(t.sec):'',t.lat||'',t.lon||'','']));
 return R.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')}
/* ===== GPS ===== */
let watch=null,lastFix=null;
function gpsOn(cb){if(!navigator.geolocation){toast('Este dispositivo no tiene GPS disponible');return}if(watch){cb&&cb();return}let first=true;
 watch=navigator.geolocation.watchPosition(p=>{const n={lon:p.coords.longitude,lat:p.coords.latitude,acc:p.coords.accuracy,hd:null};
  if(me&&dm([me.lon,me.lat],[n.lon,n.lat])>3){n.hd=Math.atan2((n.lon-me.lon)*KX,(n.lat-me.lat)*KY)*180/Math.PI}else if(me)n.hd=me.hd;me=n;lastFix=Date.now();
  if(first){first=false;cb&&cb()}if(follow){view.lon=me.lon;view.lat=me.lat}if(street.on)onFix();else{const s=secAt(me.lon,me.lat);$('gst').textContent='GPS ±'+Math.round(me.acc)+' m'+(s?' · sección '+pad(s.s):' · fuera del distrito')}reqDraw()},
  e=>{if(e.code===1)toast('Permiso de ubicación negado. Ajustes › Privacidad › Localización › Safari',7000);else stat('Buscando señal GPS…',true)},{enableHighAccuracy:true,maximumAge:2000,timeout:20000});$('loc').classList.add('on')}
function gpsOff(){if(watch)navigator.geolocation.clearWatch(watch);watch=null;me=null;$('loc').classList.remove('on');$('gst').textContent='GPS apagado';reqDraw()}
function setFollow(v){follow=v;$('loc').classList.toggle('follow',v)}
$('loc').onclick=()=>{if(watch&&follow&&!street.on){gpsOff();setFollow(false);return}setFollow(true);gpsOn(()=>{view.lon=me.lon;view.lat=me.lat;view.z=Math.max(view.z,16.5);reqDraw()});if(me){view.lon=me.lon;view.lat=me.lat;reqDraw()}};
$('fit').onclick=()=>{setFollow(false);cur?fitBounds(cur.coords,.12):fitBounds(OUTER,.05)};$('zi').onclick=()=>zoomAt(Math.min(19.5,view.z+1),[W/2,H/2]);$('zo').onclick=()=>zoomAt(Math.max(11,view.z-1),[W/2,H/2]);
/* ===== STREET MODE ===== */
const street={on:false,d:null,i:0,man:[],next:null,said:-1,t0:0,sec:null,near:new Set(),off:false};
function maneuvers(d){const C=d.coords,N=d.nm,out=[];const brg=i=>Math.atan2((C[i+1][0]-C[i][0])*KX,(C[i+1][1]-C[i][1])*KY)*180/Math.PI;
 for(let j=1;j<C.length-1;j++){if(d.cum[j+1]-d.cum[j]<4)continue;let i=j-1;while(i>0&&d.cum[i+1]-d.cum[i]<4)i--;let a=brg(j)-brg(i);a=(a+540)%360-180;const nc=N[j]!==N[i]&&NT[N[j]];
  let t=null;if(Math.abs(a)>150)t='u';else if(a>35)t='r';else if(a<-35)t='l';else if(nc)t='s';if(t)out.push({i:j,t,name:NT[N[j]]||''})}
 return out.filter((m,k)=>k===0||d.cum[m.i]-d.cum[out[k-1].i]>8||m.t!==out[k-1].t)}
const TXT={r:'Gira a la derecha',l:'Gira a la izquierda',u:'Da vuelta en U',s:'Sigue derecho'},ICO={r:'↱',l:'↰',u:'⤸',s:'↑'};
function startStreet(d){cur=d;Object.assign(street,{on:true,d,i:dd(d).prog||0,man:maneuvers(d),next:null,said:-1,t0:Date.now(),sec:null,near:new Set(),off:false,tal:{fav:0,ind:0,con:0,na:0},caps:0,urg:0,start:S.tally.length});
 document.body.classList.add('street');setFollow(true);resize();view.z=17.5;if(d.coords[street.i]){view.lon=d.coords[street.i][0];view.lat=d.coords[street.i][1]}
 gpsOn(()=>{view.lon=me.lon;view.lat=me.lat;reqDraw()});wake(true);updStreet();renderTallyBar();reqDraw()}
function onFix(){const d=street.d,C=d.coords,p=[me.lon,me.lat];let best=1e9,bi=street.i;const lo=Math.max(0,street.i-25),hi=Math.min(C.length-2,street.i+250);
 for(let k=lo;k<=hi;k++){const r=segDist(p,C[k],C[k+1]);if(r[0]<best){best=r[0];bi=k}}
 if(best>70){let gb=1e9,gi=bi;for(let k=0;k<C.length-1;k++){const r=segDist(p,C[k],C[k+1]);if(r[0]<gb){gb=r[0];gi=k}}if(gb<40){best=gb;bi=gi}}
 street.off=best>45&&me.acc<40;if(!street.off){street.i=bi;const o=dd(d);if(bi>(o.prog||0)){S.days[dk(d)]={...o,prog:bi};save()}}
 const s=secAt(me.lon,me.lat);if(s&&s!==street.sec){if(street.sec)toast('📍 Entraste a la <b>sección '+pad(s.s)+'</b> · '+CAT[s.cat].n+' · faltan '+fmt(s.delta)+' votos',5000);street.sec=s}
 S.caps.forEach(k=>{if(k.k==='Petición'&&k.st!=='res'&&k.lon&&!street.near.has(k.id)&&dm(p,[k.lon,k.lat])<40){street.near.add(k.id);toast('🙋 Petición '+(k.st==='gest'?'en gestión':'pendiente')+' aquí: '+PCAT[k.cat]+' '+k.cat+(k.nom?' · '+esc(k.nom):'')+' ›',7000,()=>openPet(k))}});
 stat('GPS ±'+Math.round(me.acc)+' m'+(s?' · secc. '+pad(s.s):''),true);
 updStreet()}
function updStreet(){const d=street.d;if(!d)return;const i=street.i;street.next=street.man.find(m=>m.i>i)||null;const nx=street.next;
 const done=d.cum[Math.min(i,d.cum.length-1)],left=(d.len-done)/1000,pct=Math.round(100*done/d.len);const nm=NT[d.nm[Math.min(i,d.nm.length-1)]]||'(calle sin nombre)';
 let dist=null;if(nx){dist=d.cum[nx.i]-done;if(me){const p=[me.lon,me.lat];dist=Math.max(0,dist-segDist(p,d.coords[i],d.coords[i+1])[1]*(d.cum[i+1]-d.cum[i]))}}
 $('nav').innerHTML=street.off?'<div class="navoff">⚠️ Fuera de ruta · regresa a la línea de color</div>':
  '<div class="navrow"><div class="navico">'+(nx?ICO[nx.t]:'🏁')+'</div><div style="flex:1;min-width:0"><div class="navmain">'+(nx?(dist!=null?Math.round(dist/5)*5+' m · ':'')+TXT[nx.t]+(nx.name&&nx.t!=='u'?' en <b>'+esc(nx.name)+'</b>':''):'Llegando al final del recorrido')+'</div><div class="navsub">Vas en: '+esc(nm)+'</div></div></div>';
 $('navp').innerHTML='<div class="bar"><i style="width:'+pct+'%;background:var(--ok)"></i></div><div class="row" style="justify-content:space-between;font-size:13px"><span>'+pct+'% · faltan '+left.toFixed(1)+' km</span><span>⏱ '+mins(Date.now()-street.t0)+'</span></div>';
 if(S.prefs.voice&&nx&&dist!=null&&dist<35&&street.said!==nx.i){street.said=nx.i;speak(TXT[nx.t]+(nx.name&&nx.t!=='u'?' en '+nx.name:''))}
 if(nx===null&&pct>=97&&!street.endAsk){street.endAsk=true;toast('🏁 Recorrido completo. Toca Terminar para enviar el reporte',8000)}}
const mins=ms=>{const m=Math.round(ms/6e4);return m<60?m+' min':Math.floor(m/60)+' h '+String(m%60).padStart(2,'0')};
function speak(t){try{const u=new SpeechSynthesisUtterance(t);u.lang='es-MX';u.rate=1.05;speechSynthesis.cancel();speechSynthesis.speak(u)}catch(e){}}
function renderTallyBar(){const t=street.tal;$('tbar').innerHTML=Object.keys(TALLY).map(k=>'<button class="tb" data-r="'+k+'" style="--c:'+TALLY[k].c+'"><span class="e">'+TALLY[k].e+'</span><span class="n">'+t[k]+'</span><span class="l">'+TALLY[k].n+'</span></button>').join('')+'<button class="tb und" id="und"><span class="e">↶</span><span class="l">Deshacer</span></button>';
 $('tbar').querySelectorAll('.tb[data-r]').forEach(b=>b.onclick=()=>tally(b.dataset.r));$('und').onclick=undo}
function tally(r){const s=me?secAt(me.lon,me.lat):null;S.tally.push({r,ts:Date.now(),lon:me?+me.lon.toFixed(5):null,lat:me?+me.lat.toFixed(5):null,sec:s?s.s:(street.d?street.d.secs[0]:null),d:street.d?street.d.dia:null});street.tal[r]++;save();renderTallyBar();flash(TALLY[r].c);if(navigator.vibrate)navigator.vibrate(30)}
function undo(){if(S.tally.length<=street.start){toast('Nada que deshacer');return}const t=S.tally.pop();street.tal[t.r]--;save();renderTallyBar();toast('Deshecho: '+TALLY[t.r].e+' '+TALLY[t.r].n)}
function flash(c){const f=$('flash');f.style.background=c;f.style.opacity=.35;setTimeout(()=>f.style.opacity=0,180)}
$('send').onclick=()=>endStreet();$('sexit').onclick=()=>{if(confirm('¿Salir del modo calle? El avance queda guardado.'))leaveStreet()};
$('sfab').onclick=()=>openCap();$('scon').onclick=()=>openCap('Contacto');$('svoice').onclick=()=>{S.prefs.voice=!S.prefs.voice;save();$('svoice').textContent=S.prefs.voice?'🔊':'🔇';toast(S.prefs.voice?'Voz activada':'Voz desactivada')};
function leaveStreet(){street.on=false;gpsOff();document.body.classList.remove('street');wake(false);setFollow(false);resize();render()}
function endStreet(){const d=street.d,o=dd(d),t=street.tal,doors=t.fav+t.ind+t.con+t.na,pct=Math.round(100*d.cum[Math.min(street.i,d.cum.length-1)]/d.len);
 const caps=S.caps.filter(k=>k.ts>=street.t0),pets=caps.filter(k=>k.k==='Petición'),cats={};pets.forEach(k=>cats[k.cat]=(cats[k.cat]||0)+1);
 const sum={doors,fav:t.fav,ind:t.ind,con:t.con,na:t.na,pets:pets.length,cons:caps.filter(k=>k.k==='Contacto').length,km:+(d.cum[Math.min(street.i,d.cum.length-1)]/1000).toFixed(1),pct,min:Math.round((Date.now()-street.t0)/6e4)};
 const rep='📍 Recorrido '+fdate(d.fecha,{weekday:'short',day:'numeric',month:'short'})+' · '+d.turno+'\n'+FN[d.f]+'\nSecciones: '+d.secs.map(pad).join(', ')+'\n⏱ '+mins(Date.now()-street.t0)+' · 🚶 '+sum.km+' km ('+pct+'% de la ruta)\n🚪 Puertas: '+doors+' · 👍 '+t.fav+' · 🤔 '+t.ind+' · 👎 '+t.con+' · 🚫 '+t.na+'\n🙋 Peticiones: '+pets.length+(pets.length?' ('+Object.entries(cats).map(([k,n])=>k+' '+n).join(', ')+')':'')+'\n🤝 Contactos: '+sum.cons;
 $('mbox').innerHTML='<h2 style="margin-top:0">🏁 Fin del recorrido</h2><div class="kpi"><div class="card"><div class="big">'+doors+'</div><div class="mut">puertas</div></div><div class="card"><div class="big" style="color:var(--ok)">'+t.fav+'</div><div class="mut">a favor</div></div><div class="card"><div class="big">'+pct+'%</div><div class="mut">ruta</div></div></div><pre class="rep">'+esc(rep)+'</pre>'+
  '<a class="btn" style="background:#25d366" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(rep)+'">💬 Enviar reporte por WhatsApp</a><label class="sw"><input type="checkbox" id="mdone" '+(pct>=85?'checked':'')+'> Marcar recorrido como hecho</label><div class="row"><button class="btn sec" id="mback">Seguir caminando</button><button class="btn" id="mok">Terminar</button></div>';
 $('modal').style.display='flex';$('mback').onclick=()=>$('modal').style.display='none';
 $('mok').onclick=()=>{S.days[dk(d)]={...dd(d),done:$('mdone').checked||o.done,at:Date.now(),sum};save(true);$('modal').style.display='none';leaveStreet()}}
let wl=null;async function wake(on){try{if(on&&'wakeLock' in navigator){wl=await navigator.wakeLock.request('screen')}else if(wl){wl.release();wl=null}}catch(e){}}
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible'&&street.on)wake(true)});
/* ===== Peticiones ===== */
let idb=null;try{const rq=indexedDB.open('dl02photos',1);rq.onupgradeneeded=e=>e.target.result.createObjectStore('p');rq.onsuccess=e=>{idb=e.target.result}}catch(e){}
const putPhoto=(id,b)=>new Promise(r=>{if(!idb)return r();const t=idb.transaction('p','readwrite');t.objectStore('p').put(b,id);t.oncomplete=t.onerror=()=>r()});
const getPhoto=id=>new Promise(r=>{if(!idb)return r(null);const g=idb.transaction('p').objectStore('p').get(id);g.onsuccess=()=>r(g.result||null);g.onerror=()=>r(null)});
const shrink=f=>new Promise(r=>{const im=new Image();im.onload=()=>{const k=Math.min(1,1000/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>r(b),'image/jpeg',.78)};im.src=URL.createObjectURL(f)});
let cap=null,capPh=[];
function openCap(kind){cap={k:kind||'Petición',cat:'',urg:'normal',t:'',nom:'',tel:'',dir:'',ok:false};capPh=[];renderCap();$('modal').style.display='flex'}
function renderCap(){const s=me?secAt(me.lon,me.lat):null;const where=(me?'📍 GPS'+(s?' · secc. '+pad(s.s):''):'Sin GPS')+(street.on?' · en recorrido':'');
 let h='<div class="row" style="justify-content:space-between"><h2 style="margin:0">Nuevo registro</h2><span class="mut">'+where+'</span></div><div class="type two">'+Object.keys(KIND).map(k=>'<button data-kind="'+k+'" class="'+(cap.k===k?'on':'')+'">'+KIND[k]+' '+k+'</button>').join('')+'</div>';
 if(cap.k==='Petición')h+='<div class="mut">¿Qué piden?</div><div class="type">'+Object.keys(PCAT).map(c=>'<button data-cat="'+c+'" class="'+(cap.cat===c?'on':'')+'">'+PCAT[c]+' '+c+'</button>').join('')+'</div>';
 if(cap.k==='Petición'||cap.k==='Contacto')h+='<input id="c_nom" placeholder="'+(cap.k==='Contacto'?'Nombre y rol (líder, comerciante…)':'Nombre de quien pide')+'" value="'+esc(cap.nom)+'"><div class="row" style="margin-top:8px"><input id="c_tel" inputmode="tel" placeholder="WhatsApp (10 dígitos)" value="'+esc(cap.tel)+'" style="flex:1;width:auto"><input id="c_dir" placeholder="Calle y número" value="'+esc(cap.dir)+'" style="flex:1;width:auto"></div><label class="sw"><input type="checkbox" id="c_ok" '+(cap.ok?'checked':'')+'> La persona acepta que la contactemos</label>';
 if(cap.k==='Petición')h+='<div class="type two"><button data-urg="normal" class="'+(cap.urg==='normal'?'on':'')+'">Normal</button><button data-urg="urgente" class="'+(cap.urg==='urgente'?'on':'')+'" style="color:#b3261e">🔥 Urgente</button></div>';
 h+='<textarea id="c_txt" rows="3" placeholder="'+(cap.k==='Petición'?'Detalle: qué, dónde, desde cuándo…':cap.k==='Contacto'?'Qué ofrece, cuántas familias mueve, cómo apoya…':'¿Qué pasó?')+'">'+esc(cap.t)+'</textarea>';
 h+='<div class="row" style="margin-top:6px"><button class="btn sec sm" id="c_mic">🎤 Dictar</button><label class="btn sec sm">📷 Foto<input id="c_photo" type="file" accept="image/*" capture="environment" style="display:none"></label><div id="c_th" style="flex:1"></div></div><div class="row" style="margin-top:10px"><button class="btn sec" id="c_x">Cancelar</button><button class="btn" id="c_s">Guardar</button></div>';
 $('mbox').innerHTML=h;const g=()=>grab();
 $('mbox').querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{g();cap.k=b.dataset.kind;renderCap()});$('mbox').querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{g();cap.cat=b.dataset.cat;renderCap()});$('mbox').querySelectorAll('[data-urg]').forEach(b=>b.onclick=()=>{g();cap.urg=b.dataset.urg;renderCap()});
 $('c_x').onclick=()=>$('modal').style.display='none';$('c_s').onclick=saveCap;$('c_mic').onclick=dictate;$('c_photo').onchange=async e=>{const f=e.target.files[0];if(f){capPh.push(await shrink(f));th()}};th()}
function grab(){const q=$;if(q('c_txt'))cap.t=q('c_txt').value;if(q('c_nom'))cap.nom=q('c_nom').value;if(q('c_tel'))cap.tel=q('c_tel').value;if(q('c_dir'))cap.dir=q('c_dir').value;if(q('c_ok'))cap.ok=q('c_ok').checked}
function th(){const t=$('c_th');if(!t)return;t.innerHTML='';capPh.forEach(b=>{const im=document.createElement('img');im.className='thumb';im.src=URL.createObjectURL(b);t.appendChild(im)})}
function dictate(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){toast('Usa el micrófono 🎤 del teclado para dictar');$('c_txt').focus();return}const r=new SR();r.lang='es-MX';const b=$('c_mic');b.textContent='🎤 Escuchando…';r.onresult=e=>{const t=$('c_txt');t.value=(t.value?t.value+' ':'')+e.results[0][0].transcript};r.onend=r.onerror=()=>{b.textContent='🎤 Dictar'};try{r.start()}catch(e){}}
async function saveCap(){grab();if(cap.k==='Petición'&&!cap.cat){toast('Elige qué piden');return}if(!cap.t&&!cap.nom){$('c_txt').focus();return}
 if(cap.tel&&!cap.ok&&!confirm('No marcaste el permiso de contacto. ¿Guardar sin teléfono?'))return;if(cap.tel&&!cap.ok)cap.tel='';
 const s=me?secAt(me.lon,me.lat):null,id='c'+Date.now();const rec={id,k:cap.k,t:cap.t,ts:Date.now(),lon:me?+me.lon.toFixed(5):null,lat:me?+me.lat.toFixed(5):null,sec:s?s.s:(street.d?street.d.secs[0]:null),d:street.on?street.d.dia:null,photos:capPh.length,nom:cap.nom,tel:cap.tel.replace(/\D/g,''),dir:cap.dir,ok:cap.ok};
 if(cap.k==='Petición')Object.assign(rec,{cat:cap.cat,urg:cap.urg,st:'pend',hist:[{st:'pend',ts:Date.now()}]});
 for(let i=0;i<capPh.length;i++)await putPhoto(id+'_'+i,capPh[i]);S.caps.push(rec);save(true);$('modal').style.display='none';toast('✓ Guardado');reqDraw();if(!street.on&&(tab==='cap'||tab==='mas'))render()}
$('fab').onclick=()=>openCap();
function waLink(c){if(!c.tel)return null;const tel=c.tel.length===10?'52'+c.tel:c.tel,f=(c.nom||'').split(' ')[0],w=c.cat.toLowerCase()+(c.dir?' en '+c.dir:'');
 return 'https://wa.me/'+tel+'?text='+encodeURIComponent({pend:'Hola '+f+', soy David de la Peña. Tomé nota de tu petición de '+w+'. Ya quedó registrada y te aviso en cuanto tenga avance. Gracias por recibirme.',gest:'Hola '+f+', tu petición de '+w+' ya está en gestión. Te mantengo al tanto.',res:'Hola '+f+', tu petición de '+w+' quedó resuelta. Cualquier cosa, aquí estoy.'}[c.st])}
function petHtml(c){const st=c.st?STAT[c.st]:null,age=Math.floor((Date.now()-c.ts)/864e5);
 return '<div class="pet" data-id="'+c.id+'"><div class="h"><b>'+KIND[c.k]+' '+(c.cat?PCAT[c.cat]+' '+c.cat:c.k)+(c.urg==='urgente'?' <span class="pill" style="background:#b3261e">URGENTE</span>':'')+'</b>'+(st?'<span class="pill" style="background:'+st[1]+'">'+st[0]+'</span>':'')+'</div>'+
 ((c.nom||c.dir)?'<div>'+(c.nom?'<b>'+esc(c.nom)+'</b>'+(c.tel?' · '+c.tel:''):'')+(c.dir?'<br>'+esc(c.dir):'')+'</div>':'')+'<div>'+esc(c.t)+'</div><div class="mut">'+new Date(c.ts).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+(c.st&&c.st!=='res'&&age>=3?' · <b class="warn">'+age+' días sin resolver</b>':'')+(c.sec&&SB[c.sec]?' · secc. '+pad(c.sec)+' '+esc(SB[c.sec].col.split(',')[0]):'')+'</div><div id="ph_'+c.id+'"></div><div class="acts">'+
 (c.st?((waLink(c)?'<a target="_blank" rel="noopener" href="'+waLink(c)+'">💬 Avisar</a>':'')+(c.st==='pend'?'<button data-st="gest">▶ En gestión</button>':'')+(c.st!=='res'?'<button data-st="res">✓ Resuelta</button>':'<button data-st="pend">↩ Reabrir</button>')):'')+
 (c.lat?'<button data-go="1">🗺 Mapa</button>':'')+'<button data-sh="1">📤</button><button data-del="1" class="warn">Borrar</button></div></div>'}
function bindPets(root){root.querySelectorAll('.pet').forEach(el=>{const c=S.caps.find(x=>x.id===el.dataset.id);if(!c)return;
 el.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>{c.st=b.dataset.st;(c.hist=c.hist||[]).push({st:c.st,ts:Date.now()});save();street.on?openPet(c):render()});
 const go=el.querySelector('[data-go]');if(go)go.onclick=()=>{$('modal').style.display='none';view.lon=c.lon;view.lat=c.lat;view.z=17.5;setFollow(false);reqDraw()};
 el.querySelector('[data-sh]').onclick=()=>sharePet(c);el.querySelector('[data-del]').onclick=()=>{if(confirm('¿Borrar este registro?')){S.caps=S.caps.filter(x=>x!==c);save();$('modal').style.display='none';street.on?reqDraw():render()}};
 for(let i=0;i<(c.photos||0);i++)getPhoto(c.id+'_'+i).then(b=>{if(!b)return;const im=document.createElement('img');im.className='thumb';im.src=URL.createObjectURL(b);im.onclick=()=>{$('photoimg').src=im.src;$('photo').style.display='flex'};const ph=document.getElementById('ph_'+c.id);if(ph)ph.appendChild(im)})})}
function openPet(c){$('mbox').innerHTML=petHtml(c)+'<button class="btn sec" onclick="$(\'modal\').style.display=\'none\'">Cerrar</button>';$('modal').style.display='flex';bindPets($('mbox'))}
async function sharePet(c){const t=KIND[c.k]+' '+c.k+(c.cat?' · '+c.cat:'')+(c.urg==='urgente'?' 🔥URGENTE':'')+'\n'+(c.nom?'Solicita: '+c.nom+(c.tel?' ('+c.tel+')':'')+'\n':'')+(c.dir?'Dirección: '+c.dir+'\n':'')+(c.sec?'Sección '+pad(c.sec)+'\n':'')+(c.t||'')+(c.lat?'\nhttps://maps.google.com/?q='+c.lat+','+c.lon:'')+'\n'+new Date(c.ts).toLocaleString('es-MX');
 if(navigator.share){try{await navigator.share({text:t})}catch(e){}return}location.href='https://wa.me/?text='+encodeURIComponent(t)}
$('photo').onclick=()=>$('photo').style.display='none';
let capFilter='all';
function rCap(){const p=S.caps.filter(c=>c.k==='Petición'),n=st=>p.filter(c=>c.st===st).length,urg=p.filter(c=>c.urg==='urgente'&&c.st!=='res').length,old=p.filter(c=>c.st!=='res'&&Date.now()-c.ts>3*864e5).length;
 let h='<div class="row" style="justify-content:space-between"><h1 style="margin:0">Peticiones</h1><button class="btn sm" id="add">＋ Nueva</button></div><div class="kpi" style="margin:10px 0"><div class="card"><div class="big" style="color:#b58900">'+n('pend')+'</div><div class="mut">pendientes</div></div><div class="card"><div class="big" style="color:#1a73e8">'+n('gest')+'</div><div class="mut">en gestión</div></div><div class="card"><div class="big" style="color:#1a9d2b">'+n('res')+'</div><div class="mut">resueltas</div></div></div>';
 if(urg)h+='<div class="card warnc">🔥 '+urg+' urgente'+(urg>1?'s':'')+' sin resolver</div>';if(old)h+='<div class="card">⏰ '+old+' con más de 3 días sin resolver</div>';
 h+='<select id="cf"><option value="all">Todo ('+S.caps.length+')</option><option value="pend">Pendientes</option><option value="gest">En gestión</option><option value="res">Resueltas</option><option value="urg">Urgentes</option><option value="Contacto">Contactos</option><option value="Incidencia">Incidencias</option><option value="Nota">Notas</option></select>';
 const l=S.caps.slice().reverse().filter(c=>capFilter==='all'||c.st===capFilter||c.k===capFilter||(capFilter==='urg'&&c.urg==='urgente'&&c.st!=='res'));h+=l.length?l.map(petHtml).join(''):'<p class="mut">Sin registros. Toca ＋ en el mapa o en un recorrido.</p>';
 panel.innerHTML=h;$('add').onclick=()=>openCap();const cf=$('cf');cf.value=capFilter;cf.onchange=()=>{capFilter=cf.value;render()};bindPets(panel)}
/* ===== boot ===== */
window.addEventListener('online',()=>{useTiles=true;tileFail=0;reqDraw()});window.addEventListener('offline',()=>{useTiles=false;reqDraw()});
document.getElementById('modal').addEventListener('click',e=>{if(e.target.id==='modal')$('modal').style.display='none'});
applyHC();resize();fitBounds(OUTER,.05);render();requestAnimationFrame(()=>{resize();if(!cur)fitBounds(OUTER,.05)});setTimeout(()=>{resize();if(!cur&&!follow)fitBounds(OUTER,.05)},400);$('gst').textContent=useTiles?'Toca ◎ para ver dónde estás':'Sin internet: calles guardadas';
if('serviceWorker' in navigator&&location.protocol==='https:')navigator.serviceWorker.register('sw.js').then(r=>{r.addEventListener('updatefound',()=>{const w=r.installing;w&&w.addEventListener('statechange',()=>{if(w.state==='installed'&&navigator.serviceWorker.controller)toast('🔄 Nueva versión lista · toca para actualizar',15000,()=>location.reload())})})}).catch(()=>{});

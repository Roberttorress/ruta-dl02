import json
OUT = '../out/'
days = json.load(open(OUT + 'calles_days2.json'))['days']; segs = json.load(open(OUT + 'calles_segs.json'))
D = json.load(open(OUT + 'dl02_data.json')); rings = D['sec_rings_wgs']; outer = D['dl_rings_wgs'][D['outer']]; cbs = D['col_by_sec']
tab = {t['seccion']: t for t in json.load(open(OUT + 'dl02_ruta.json'))}
def cols(s, n=4): d = cbs.get(str(s), {}); return ', '.join(sorted(d, key=lambda z: -d[z])[:n])
secs = [{'s': s, 'cat': t['cat'], 'ln': t['ln'], 'delta': t['delta'], 'fyc': t['FyC'], 'mc': t['MC'], 'mo': t['Morena'], 'pt': t['PT'], 'col': cols(s),
         'rings': [[[round(a, 5), round(b, 5)] for a, b in rg] for rg in rings[str(s)]]} for s, t in tab.items()]
segs_c = [[round(a[0], 5), round(a[1], 5), round(b[0], 5), round(b[1], 5)] for a, b in segs]
for d in days: d['coords'] = [[round(a, 5), round(b, 5)] for a, b in d['coords']]
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))

html = r'''<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><meta name="apple-mobile-web-app-title" content="Ruta DL02">
<meta name="mobile-web-app-capable" content="yes"><meta name="theme-color" content="#0d3b8c">
<link rel="apple-touch-icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 180 180'%3E%3Crect width='180' height='180' rx='36' fill='%230d3b8c'/%3E%3Ctext x='90' y='112' font-family='system-ui' font-size='64' font-weight='700' fill='white' text-anchor='middle'%3EDL02%3C/text%3E%3C/svg%3E">
<title>Ruta DL02</title>
<style>
:root{--bg:#fff;--fg:#111;--mut:#666;--card:#fff;--line:#e3e3e3;--b:#0d3b8c;--mapbg:#f3efe6}
@media (prefers-color-scheme:dark){:root:not([data-theme="light"]){--bg:#111;--fg:#eee;--mut:#aaa;--card:#1c1c1c;--line:#333;--mapbg:#1a1a1a}}:root[data-theme="dark"]{--bg:#111;--fg:#eee;--mut:#aaa;--card:#1c1c1c;--line:#333;--mapbg:#1a1a1a}
*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font-family:-apple-system,system-ui,sans-serif;-webkit-text-size-adjust:100%;overscroll-behavior:none;overflow:hidden}
#app{display:flex;height:100%;height:100dvh}#side{width:360px;flex:none;display:flex;flex-direction:column;border-right:1px solid var(--line);background:var(--card)}#mapwrap{flex:1;position:relative;background:var(--mapbg)}canvas{position:absolute;inset:0;width:100%;height:100%;touch-action:none}
#hd{padding:calc(env(safe-area-inset-top,0px) + 12px) 14px 10px;border-bottom:1px solid var(--line)}#hd h1{font-size:17px;margin:0 0 8px}
.row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}select,button{font:inherit;font-size:15px;padding:9px 11px;border-radius:9px;border:1px solid var(--line);background:var(--card);color:var(--fg)}button.p{background:var(--b);color:#fff;border-color:var(--b)}button:active{opacity:.7}
#list{flex:1;overflow:auto;-webkit-overflow-scrolling:touch}.d{padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer}.d.sel{background:#0d3b8c14;border-left:4px solid var(--b)}.d .t{font-weight:700}.d .m{font-size:13px;color:var(--mut)}.d.done .t::after{content:" ✓";color:#1a9d2b}
#det{padding:12px 14px;border-top:1px solid var(--line);font-size:14px;line-height:1.45;max-height:45%;overflow:auto}#det h2{font-size:16px;margin:0 0 6px}
.tag{display:inline-block;padding:2px 7px;border-radius:6px;font-size:12px;color:#fff;margin-right:4px}textarea{width:100%;font:inherit;font-size:14px;padding:6px;border-radius:8px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-top:6px}
#gps{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;flex-direction:column;gap:8px}#gps button{width:52px;height:52px;border-radius:26px;font-size:22px;box-shadow:0 2px 8px #0004;padding:0}
#st{position:absolute;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);background:#fffd;color:#111;padding:5px 9px;border-radius:6px;font-size:12px;max-width:70%}
#pop{position:absolute;left:12px;top:12px;background:#fffe;color:#111;padding:8px 10px;border-radius:8px;font-size:13px;max-width:320px;box-shadow:0 2px 8px #0003;display:none}
@media (max-width:800px){#app{flex-direction:column}#side{width:100%;height:46%;border-right:0;border-top:1px solid var(--line);order:2}#mapwrap{height:54%}#det{max-height:62%}}
</style></head><body><div id="app">
<div id="side"><div id="hd"><h1>Ruta DL 02 · Recorridos</h1><div class="row"><select id="fase"><option value="">Todas las fases</option><option value="Fase 1">Fase 1 · Mitras</option><option value="Fase 2">Fase 2 · Empates</option><option value="Fase 3">Fase 3 · Recuperables</option></select><button id="prev">◀</button><button id="next">▶</button></div></div>
<div id="list"></div><div id="det">Elige un recorrido en la lista. Con ◎ se activa el GPS y el punto azul muestra dónde estás; toca una sección en el mapa para ver sus datos.</div></div>
<div id="mapwrap"><canvas id="cv"></canvas><div id="pop"></div>
<div id="gps"><button id="loc" title="Mi ubicación">◎</button><button id="fit" title="Ver recorrido">⤢</button><button id="zi">+</button><button id="zo">−</button><button id="tiles" title="Mapa base">🗺</button></div><div id="st">Cargando…</div></div>
</div>
<script>
const DAYS=__DAYS__;const SECS=__SECS__;const SEG=__SEG__;const OUTER=__OUTER__;
const CM={'Fase 1':'#0d3b8c','Fase 2':'#b58900','Fase 3':'#e0761a'};const CC={'Bastión':'#0d3b8c','Defender':'#4f86d6','Empate':'#f2c200','Recuperable':'#f08a1d','Adverso':'#9e9e9e'};
let store={};try{store=JSON.parse(localStorage.getItem('dl02')||'{}')}catch(e){}
function save(){try{localStorage.setItem('dl02',JSON.stringify(store))}catch(e){}}
const st=document.getElementById('st'),pop=document.getElementById('pop');
// ---------- minimal slippy map (web mercator) ----------
const cv=document.getElementById('cv'),ctx=cv.getContext('2d');let W=0,H=0,DPR=1;
const TS=256;function lon2x(lon,z){return (lon+180)/360*TS*Math.pow(2,z)}function lat2y(lat,z){const r=lat*Math.PI/180;return (1-Math.log(Math.tan(r)+1/Math.cos(r))/Math.PI)/2*TS*Math.pow(2,z)}
function x2lon(x,z){return x/(TS*Math.pow(2,z))*360-180}function y2lat(y,z){const n=Math.PI-2*Math.PI*y/(TS*Math.pow(2,z));return 180/Math.PI*Math.atan(0.5*(Math.exp(n)-Math.exp(-n)))}
let view={lon:-100.35,lat:25.74,z:13};let useTiles=navigator.onLine;const tiles={};let pending=0;
function tileImg(z,x,y){const k=z+'/'+x+'/'+y;if(tiles[k])return tiles[k];const im=new Image();im.crossOrigin='anonymous';tiles[k]={im,ok:false};im.onload=()=>{tiles[k].ok=true;draw()};im.onerror=()=>{tiles[k].err=true;if(useTiles&&!tileWarned){tileWarned=true;st.textContent='Sin internet: se muestran las calles guardadas';}};im.src='https://tile.openstreetmap.org/'+z+'/'+x+'/'+y+'.png';return tiles[k]}
let tileWarned=false;
function resize(){DPR=window.devicePixelRatio||1;W=cv.clientWidth;H=cv.clientHeight;cv.width=W*DPR;cv.height=H*DPR;draw()}window.addEventListener('resize',resize);
function proj(lon,lat){const s=Math.pow(2,view.z-Math.floor(view.z));const zi=Math.floor(view.z);const cx=lon2x(view.lon,zi),cy=lat2y(view.lat,zi);return [(lon2x(lon,zi)-cx)*s+W/2,(lat2y(lat,zi)-cy)*s+H/2]}
function unproj(px,py){const zi=Math.floor(view.z),s=Math.pow(2,view.z-zi);const cx=lon2x(view.lon,zi),cy=lat2y(view.lat,zi);return [x2lon((px-W/2)/s+cx,zi),y2lat((py-H/2)/s+cy,zi)]}
let cur=null,me=null,sel=null;
function path(ring){ctx.beginPath();ring.forEach((p,i)=>{const q=proj(p[0],p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])});ctx.closePath()}
function line(coords){ctx.beginPath();coords.forEach((p,i)=>{const q=proj(p[0],p[1]);i?ctx.lineTo(q[0],q[1]):ctx.moveTo(q[0],q[1])})}
function draw(){if(!W)return;ctx.setTransform(DPR,0,0,DPR,0,0);ctx.clearRect(0,0,W,H);const dark=matchMedia('(prefers-color-scheme:dark)').matches;
 if(useTiles){const zi=Math.round(view.z),s=Math.pow(2,view.z-zi);const cx=lon2x(view.lon,zi),cy=lat2y(view.lat,zi);const x0=Math.floor((cx-W/2/s)/TS),x1=Math.floor((cx+W/2/s)/TS),y0=Math.floor((cy-H/2/s)/TS),y1=Math.floor((cy+H/2/s)/TS);
  for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++){const t=tileImg(zi,x,y);if(t.ok){ctx.drawImage(t.im,(x*TS-cx)*s+W/2,(y*TS-cy)*s+H/2,TS*s+0.5,TS*s+0.5)}}
  ctx.fillStyle=dark?'#0008':'#fff3';ctx.fillRect(0,0,W,H)}
 const cur_z=view.z;
 if(!useTiles||cur_z>=14){ctx.strokeStyle=useTiles?'#0000':(dark?'#555':'#b9b4a8');ctx.lineWidth=cur_z>=16?1.6:1;if(!useTiles){ctx.beginPath();const [lo0,la1]=unproj(0,0),[lo1,la0]=unproj(W,H);SEG.forEach(s=>{if(s[0]<lo0-.002||s[0]>lo1+.002||s[1]<la0-.002||s[1]>la1+.002)return;const a=proj(s[0],s[1]),b=proj(s[2],s[3]);ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1])});ctx.stroke()}}
 SECS.forEach(x=>{const inCur=cur&&cur.secs.includes(x.s);x.rings.forEach(r=>{path(r);ctx.fillStyle=CC[x.cat];ctx.globalAlpha=inCur?.28:(sel===x?.35:.09);ctx.fill();ctx.globalAlpha=1;ctx.strokeStyle=inCur?CM[cur.fase.slice(0,6)]:(dark?'#888':'#666');ctx.lineWidth=inCur?2.5:.8;ctx.stroke()});
  if(cur_z>=15){const r=x.rings[0];let sx=0,sy=0;r.forEach(p=>{const q=proj(p[0],p[1]);sx+=q[0];sy+=q[1]});sx/=r.length;sy/=r.length;ctx.font='bold 11px system-ui';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#fff';ctx.fillStyle='#111';ctx.strokeText(String(x.s).padStart(4,'0'),sx,sy);ctx.fillText(String(x.s).padStart(4,'0'),sx,sy)}});
 path(OUTER);ctx.strokeStyle='#000';ctx.lineWidth=3;ctx.stroke();
 if(cur){const c=CM[cur.fase.slice(0,6)];line(cur.coords);ctx.strokeStyle='#fff';ctx.lineWidth=9;ctx.lineJoin='round';ctx.lineCap='round';ctx.stroke();ctx.strokeStyle=c;ctx.lineWidth=5;ctx.stroke();ctx.setLineDash([6,10]);ctx.strokeStyle='#fff';ctx.lineWidth=1.5;ctx.stroke();ctx.setLineDash([]);
  const a=proj(cur.coords[0][0],cur.coords[0][1]),b=proj(cur.coords.at(-1)[0],cur.coords.at(-1)[1]);dot(a,'#1a9d2b','Inicio');dot(b,'#000','Fin')}
 if(me){const p=proj(me.lon,me.lat);const rpx=me.acc/(40075016*Math.cos(me.lat*Math.PI/180)/(TS*Math.pow(2,view.z)));ctx.beginPath();ctx.arc(p[0],p[1],Math.min(rpx,400),0,7);ctx.fillStyle='#1a73e822';ctx.fill();ctx.strokeStyle='#1a73e8';ctx.lineWidth=1;ctx.stroke();dot(p,'#1a73e8',null)}
 ctx.font='10px system-ui';ctx.textAlign='right';ctx.fillStyle=dark?'#aaa':'#555';ctx.fillText(useTiles?'© OpenStreetMap':'calles OSM (guardadas)',W-6,H-6)}
function dot(p,c,label){ctx.beginPath();ctx.arc(p[0],p[1],9,0,7);ctx.fillStyle=c;ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();if(label){ctx.font='bold 12px system-ui';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#fff';ctx.fillStyle='#111';ctx.strokeText(label,p[0],p[1]-14);ctx.fillText(label,p[0],p[1]-14)}}
// gestures
let ptrs=new Map(),last=null,pinch=null,moved=false;
cv.addEventListener('pointerdown',e=>{cv.setPointerCapture(e.pointerId);ptrs.set(e.pointerId,[e.clientX,e.clientY]);moved=false;if(ptrs.size===1)last=[e.clientX,e.clientY];if(ptrs.size===2){const a=[...ptrs.values()];pinch={d:Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]),z:view.z,c:[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2]}}});
cv.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,[e.clientX,e.clientY]);
 if(ptrs.size===2&&pinch){const a=[...ptrs.values()];const d=Math.hypot(a[0][0]-a[1][0],a[0][1]-a[1][1]);const nz=Math.max(11,Math.min(19,pinch.z+Math.log2(d/pinch.d)));zoomAt(nz,pinch.c);const c=[(a[0][0]+a[1][0])/2,(a[0][1]+a[1][1])/2];panPx(c[0]-pinch.c[0],c[1]-pinch.c[1]);pinch.c=c;moved=true}
 else if(ptrs.size===1&&last){const dx=e.clientX-last[0],dy=e.clientY-last[1];if(Math.hypot(dx,dy)>2)moved=true;panPx(dx,dy);last=[e.clientX,e.clientY]}});
function up(e){ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(ptrs.size===0){if(!moved)tap(e.clientX,e.clientY);last=null}}
cv.addEventListener('pointerup',up);cv.addEventListener('pointercancel',up);
cv.addEventListener('wheel',e=>{e.preventDefault();zoomAt(Math.max(11,Math.min(19,view.z-e.deltaY*0.002)),[e.offsetX,e.offsetY])},{passive:false});
function panPx(dx,dy){const c=unproj(W/2-dx,H/2-dy);view.lon=c[0];view.lat=c[1];draw()}
function zoomAt(nz,c){const before=unproj(c[0],c[1]);view.z=nz;const after=unproj(c[0],c[1]);view.lon+=before[0]-after[0];view.lat+=before[1]-after[1];draw()}
function inside(x,y,r){let ins=false;for(let i=0,j=r.length-1;i<r.length;j=i++){const xi=r[i][0],yi=r[i][1],xj=r[j][0],yj=r[j][1];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)ins=!ins}return ins}
function tap(px,py){const r=cv.getBoundingClientRect();const [lo,la]=unproj(px-r.left,py-r.top);const x=SECS.find(s=>s.rings.some(rg=>inside(lo,la,rg)));sel=x||null;if(x){pop.style.display='block';pop.innerHTML='<b>Sección '+String(x.s).padStart(4,'0')+'</b> · '+x.cat+'<br>LN '+x.ln+' · meta '+(x.delta>=0?'+':'')+x.delta+'<br>2024: FyC '+x.fyc+' · MC '+x.mc+' · Morena '+x.mo+' · PT '+x.pt+'<br><small>'+x.col+'</small>'}else pop.style.display='none';draw()}
function fitBounds(coords,pad){let lo0=180,lo1=-180,la0=90,la1=-90;coords.forEach(p=>{lo0=Math.min(lo0,p[0]);lo1=Math.max(lo1,p[0]);la0=Math.min(la0,p[1]);la1=Math.max(la1,p[1])});view.lon=(lo0+lo1)/2;view.lat=(la0+la1)/2;for(let z=19;z>=11;z-=0.25){view.z=z;const a=proj(lo0,la1),b=proj(lo1,la0);if(b[0]-a[0]<W*(1-pad)&&b[1]-a[1]<H*(1-pad))break}draw()}
// ---------- UI ----------
const list=document.getElementById('list'),det=document.getElementById('det'),fase=document.getElementById('fase');
function key(d){return 'd'+d.dia}
function render(){list.innerHTML='';DAYS.filter(d=>!fase.value||d.fase.startsWith(fase.value)).forEach(d=>{const e=document.createElement('div');e.className='d'+(store[key(d)]?.done?' done':'')+(cur&&cur.dia===d.dia?' sel':'');e.innerHTML='<div class="t"><span class="tag" style="background:'+CM[d.fase.slice(0,6)]+'">'+d.fase.slice(0,6)+'</span>Día '+d.cal+' · '+d.turno+'</div><div class="m">Secciones '+d.secs.map(s=>String(s).padStart(4,'0')).join(', ')+' · '+d.km+' km · '+d.pct+'% calles</div>';e.onclick=()=>show(d);list.appendChild(e)})}
function show(d){cur=d;sel=null;pop.style.display='none';fitBounds(d.coords,.15);const c=CM[d.fase.slice(0,6)];const k=key(d);const sdata=store[k]||{};
 const secInfo=d.secs.map(s=>{const x=SECS.find(y=>y.s===s);return '<b>'+String(s).padStart(4,'0')+'</b> '+x.cat+' · LN '+x.ln+' · meta '+(x.delta>=0?'+':'')+x.delta+'<br><small>'+x.col+'</small>'}).join('<br>');
 const gm='https://www.google.com/maps/dir/'+d.coords.filter((p,i)=>i%Math.ceil(d.coords.length/9)===0||i===d.coords.length-1).map(p=>p[1]+','+p[0]).join('/')+'/?travelmode=walking';
 det.innerHTML='<h2>Día '+d.cal+' · '+d.turno+' <span class="tag" style="background:'+c+'">'+d.fase.slice(0,6)+'</span></h2>'+d.km+' km a pie · cubre '+d.pct+'% de las calles residenciales<br><b>Calles:</b> '+d.calles.join(', ')+'<br><br>'+secInfo+'<div class="row" style="margin-top:8px"><button class="p" id="done">'+(sdata.done?'✓ Recorrido hecho':'Marcar como hecho')+'</button><button id="gmb">Abrir en Google Maps</button></div><textarea id="note" rows="3" placeholder="Notas del recorrido (peticiones, incidencias, líderes vecinales)…">'+(sdata.note||'')+'</textarea>';
 document.getElementById('done').onclick=()=>{store[k]={...(store[k]||{}),done:!sdata.done};save();show(d)};document.getElementById('gmb').onclick=()=>window.open(gm,'_blank');document.getElementById('note').oninput=e=>{store[k]={...(store[k]||{}),note:e.target.value};save()};render();
 const el=list.querySelector('.sel');if(el)el.scrollIntoView({block:'nearest'})}
fase.onchange=render;document.getElementById('prev').onclick=()=>{const i=cur?DAYS.indexOf(cur):0;show(DAYS[(i-1+DAYS.length)%DAYS.length])};document.getElementById('next').onclick=()=>{const i=cur?DAYS.indexOf(cur):-1;show(DAYS[(i+1)%DAYS.length])};
document.getElementById('fit').onclick=()=>{cur?fitBounds(cur.coords,.15):fitBounds(OUTER,.05)};document.getElementById('zi').onclick=()=>zoomAt(Math.min(19,view.z+1),[W/2,H/2]);document.getElementById('zo').onclick=()=>zoomAt(Math.max(11,view.z-1),[W/2,H/2]);
document.getElementById('tiles').onclick=()=>{useTiles=!useTiles;tileWarned=false;st.textContent=useTiles?'Mapa base OpenStreetMap (requiere internet)':'Modo sin conexión: calles guardadas';draw()};
let watch=null;document.getElementById('loc').onclick=()=>{if(!navigator.geolocation){st.textContent='GPS no disponible';return}if(watch){navigator.geolocation.clearWatch(watch);watch=null;me=null;st.textContent='GPS apagado';draw();return}
 st.textContent='Buscando GPS…';let first=true;watch=navigator.geolocation.watchPosition(p=>{me={lon:p.coords.longitude,lat:p.coords.latitude,acc:p.coords.accuracy};if(first){first=false;view.lon=me.lon;view.lat=me.lat;view.z=Math.max(view.z,16)}
  const s=SECS.find(x=>x.rings.some(r=>inside(me.lon,me.lat,r)));st.textContent='GPS ±'+Math.round(me.acc)+' m'+(s?' · estás en la sección '+String(s.s).padStart(4,'0')+' ('+s.cat+')':' · fuera del distrito');draw()},e=>{st.textContent='GPS: '+(e.code===1?'permiso denegado (Ajustes › Privacidad › Localización › Safari)':e.message)},{enableHighAccuracy:true,maximumAge:3000,timeout:20000})};
window.addEventListener('online',()=>{useTiles=true;tileWarned=false;draw()});window.addEventListener('offline',()=>{useTiles=false;st.textContent='Sin conexión: calles guardadas';draw()});
resize();fitBounds(OUTER,.05);render();st.textContent=useTiles?'Mapa base OpenStreetMap':'Sin conexión: calles guardadas';
</script></body></html>'''
html = html.replace('__DAYS__', J(days)).replace('__SECS__', J(secs)).replace('__SEG__', J(segs_c)).replace('__OUTER__', J([[round(a, 5), round(b, 5)] for a, b in outer]))
open(OUT + 'RutaDL02_app.html', 'w').write(html); print(len(html) // 1024, 'KB')

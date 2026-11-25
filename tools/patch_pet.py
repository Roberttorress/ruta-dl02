p = 'build_app2.py'; s = open(p).read()
def rep(old, new):
    global s
    assert old in s, old[:90]
    s = s.replace(old, new, 1)

# ---- 1. Google Maps as a real link (iPad home-screen apps block window.open)
rep("""<button class="btn sec" id="gm">Google Maps</button>""",
    """<a class="btn sec" id="gm" style="text-align:center;text-decoration:none" target="_blank" rel="noopener" href="'+gmUrl(d)+'">Google Maps</a>""")
rep("""if(q('gm'))q('gm').onclick=()=>window.open('https://www.google.com/maps/dir/'+d.coords.filter((p,i)=>i%Math.ceil(d.coords.length/9)===0||i===d.coords.length-1).map(p=>p[1]+','+p[0]).join('/')+'/?travelmode=walking','_blank');""", "")
rep("function dkey(d){return 'd'+d.dia}",
    "function gmUrl(d){const pts=d.coords.filter((p,i)=>i%Math.ceil(d.coords.length/9)===0||i===d.coords.length-1).slice(0,10);return 'https://www.google.com/maps/dir/?api=1&travelmode=walking&origin='+pts[0][1]+','+pts[0][0]+'&destination='+pts.at(-1)[1]+','+pts.at(-1)[0]+'&waypoints='+pts.slice(1,-1).map(p=>p[1]+','+p[0]).join('|')}\nfunction dkey(d){return 'd'+d.dia}")

# ---- 2. modal markup
i0 = s.index('<div id="modal">'); i1 = s.index('</div></div>', i0) + len('</div></div>')
s = s[:i0] + '''<div id="modal"><div class="box" id="mbox"></div></div>
<div id="photo" style="position:fixed;inset:0;background:#000e;display:none;align-items:center;justify-content:center;z-index:60"><img id="photoimg" style="max-width:96%;max-height:90%;border-radius:10px"></div>''' + s[i1:]
rep(".type{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:10px 0}",
    ".type{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:10px 0}.type.two{grid-template-columns:1fr 1fr}#modal .box{max-height:92vh;overflow:auto}.pill{display:inline-block;padding:3px 9px;border-radius:12px;font-size:12px;color:#fff}.thumb{width:64px;height:64px;object-fit:cover;border-radius:8px;margin:4px 4px 0 0}.pet{padding:12px 0;border-bottom:1px solid var(--line)}.pet .h{display:flex;justify-content:space-between;align-items:center;gap:8px}.pet .acts{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.pet .acts button,.pet .acts a{font:inherit;font-size:14px;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);text-decoration:none}")

# ---- 3. petitions module replaces old captures block + old rCap
start = s.index('// ---------- captures ----------'); end = s.index("window.addEventListener('online'")
new_caps = r'''// ---------- peticiones ----------
const PCAT={Alumbrado:'💡',Agua:'🚰',Drenaje:'🕳️',Pavimento:'🛣️',Basura:'🗑️',Seguridad:'🚔',Salud:'🏥',Empleo:'💼',Apoyo:'🤲',Regularización:'📄',Parques:'🌳',Otro:'📌'};
const KIND={Petición:'🙋',Contacto:'🤝',Incidencia:'⚠️',Nota:'💬'};const STAT={pend:['Pendiente','#b58900'],gest:['En gestión','#1a73e8'],res:['Resuelta','#1a9d2b']};
const modal=document.getElementById('modal'),mbox=document.getElementById('mbox');
let idb=null;try{const rq=indexedDB.open('dl02photos',1);rq.onupgradeneeded=e=>e.target.result.createObjectStore('p');rq.onsuccess=e=>{idb=e.target.result}}catch(e){}
function putPhoto(id,blob){return new Promise(r=>{if(!idb)return r();const t=idb.transaction('p','readwrite');t.objectStore('p').put(blob,id);t.oncomplete=()=>r();t.onerror=()=>r()})}
function getPhoto(id){return new Promise(r=>{if(!idb)return r(null);const g=idb.transaction('p').objectStore('p').get(id);g.onsuccess=()=>r(g.result||null);g.onerror=()=>r(null)})}
function shrink(file){return new Promise(r=>{const im=new Image();im.onload=()=>{const k=Math.min(1,900/Math.max(im.width,im.height));const c=document.createElement('canvas');c.width=im.width*k;c.height=im.height*k;c.getContext('2d').drawImage(im,0,0,c.width,c.height);c.toBlob(b=>r(b),'image/jpeg',.8)};im.src=URL.createObjectURL(file)})}
function esc(t){return (t||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
let cap=null,capPhotos=[];
function openCap(kind){cap={k:kind||'Petición',cat:'Alumbrado',urg:'normal',t:'',nom:'',tel:'',dir:''};capPhotos=[];renderCap();modal.style.display='flex'}
function renderCap(){const s=me?secAt(me.lon,me.lat):null;const where=(me?'📍 GPS'+(s?' · sección '+pad(s.s):''):'Sin GPS')+(cur?' · Día '+cur.cal+' '+cur.turno:'');
 let h='<div class="row" style="justify-content:space-between"><h2 style="margin:0">Nueva captura</h2><span class="mut">'+where+'</span></div><div class="type two">'+Object.keys(KIND).map(k=>'<button data-kind="'+k+'" class="'+(cap.k===k?'on':'')+'">'+KIND[k]+' '+k+'</button>').join('')+'</div>';
 if(cap.k==='Petición'){h+='<div class="mut">¿Qué piden?</div><div class="type">'+Object.keys(PCAT).map(c=>'<button data-cat="'+c+'" class="'+(cap.cat===c?'on':'')+'">'+PCAT[c]+' '+c+'</button>').join('')+'</div>';
  h+='<div class="row"><input id="c_nom" placeholder="Nombre de quien pide" value="'+esc(cap.nom)+'" style="flex:1;width:auto"><input id="c_tel" inputmode="tel" placeholder="WhatsApp" value="'+esc(cap.tel)+'" style="flex:1;width:auto"></div><input id="c_dir" placeholder="Calle y número" style="margin-top:8px" value="'+esc(cap.dir)+'">';
  h+='<div class="type two" style="margin-top:8px"><button data-urg="normal" class="'+(cap.urg==='normal'?'on':'')+'">Normal</button><button data-urg="urgente" class="'+(cap.urg==='urgente'?'on':'')+'" style="color:#b3261e">🔥 Urgente</button></div>'}
 h+='<textarea id="c_txt" rows="3" style="margin-top:8px" placeholder="'+(cap.k==='Petición'?'Detalle: qué, dónde, desde cuándo…':cap.k==='Contacto'?'Nombre, rol (líder, comerciante, pastor…), teléfono, qué ofrece':'¿Qué pasó?')+'">'+esc(cap.t)+'</textarea>';
 h+='<div class="row" style="margin-top:6px"><button class="btn sec" id="c_mic" style="flex:0 0 auto;width:auto;padding:12px 16px;margin:0">🎤 Dictar</button><label class="btn sec" style="flex:0 0 auto;width:auto;padding:12px 16px;margin:0">📷 Foto<input id="c_photo" type="file" accept="image/*" capture="environment" style="display:none"></label><div id="c_thumbs" style="flex:1"></div></div>';
 h+='<div class="row" style="margin-top:12px"><button class="btn sec" id="c_cancel">Cancelar</button><button class="btn" id="c_save">Guardar</button></div>';
 mbox.innerHTML=h;mbox.querySelectorAll('[data-kind]').forEach(b=>b.onclick=()=>{grab();cap.k=b.dataset.kind;renderCap()});mbox.querySelectorAll('[data-cat]').forEach(b=>b.onclick=()=>{grab();cap.cat=b.dataset.cat;renderCap()});mbox.querySelectorAll('[data-urg]').forEach(b=>b.onclick=()=>{grab();cap.urg=b.dataset.urg;renderCap()});
 document.getElementById('c_cancel').onclick=()=>modal.style.display='none';document.getElementById('c_save').onclick=saveCap;document.getElementById('c_mic').onclick=dictate;
 document.getElementById('c_photo').onchange=async e=>{const f=e.target.files[0];if(!f)return;capPhotos.push(await shrink(f));showThumbs()};showThumbs()}
function grab(){const q=id=>document.getElementById(id);if(q('c_txt'))cap.t=q('c_txt').value;if(q('c_nom'))cap.nom=q('c_nom').value;if(q('c_tel'))cap.tel=q('c_tel').value;if(q('c_dir'))cap.dir=q('c_dir').value}
function showThumbs(){const t=document.getElementById('c_thumbs');if(!t)return;t.innerHTML='';capPhotos.forEach(b=>{const im=document.createElement('img');im.className='thumb';im.src=URL.createObjectURL(b);t.appendChild(im)})}
function dictate(){const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){setSt('Usa el micrófono del teclado del iPad para dictar');document.getElementById('c_txt').focus();return}const r=new SR();r.lang='es-MX';const b=document.getElementById('c_mic');b.textContent='🎤 Escuchando…';r.onresult=e=>{const t=document.getElementById('c_txt');t.value=(t.value?t.value+' ':'')+e.results[0][0].transcript};r.onend=r.onerror=()=>{b.textContent='🎤 Dictar'};r.start()}
async function saveCap(){grab();if(!cap.t&&!cap.nom){document.getElementById('c_txt').focus();return}const s=me?secAt(me.lon,me.lat):null;const id='c'+Date.now();
 const rec={id,k:cap.k,t:cap.t,ts:Date.now(),lon:me?+me.lon.toFixed(5):null,lat:me?+me.lat.toFixed(5):null,sec:s?s.s:null,dia:cur?cur.dia:null,cal:cur?cur.cal:null,turno:cur?cur.turno:null,photos:capPhotos.length};
 if(cap.k==='Petición')Object.assign(rec,{cat:cap.cat,urg:cap.urg,nom:cap.nom,tel:cap.tel.replace(/\D/g,''),dir:cap.dir,st:'pend',hist:[{st:'pend',ts:Date.now()}]});
 for(let i=0;i<capPhotos.length;i++)await putPhoto(id+'_'+i,capPhotos[i]);
 S.caps.push(rec);save();modal.style.display='none';setSt('Guardado');draw();if(tab==='cap'||tab==='av')render()}
document.getElementById('fab').onclick=()=>openCap();
function setStatus(c,st){c.st=st;(c.hist=c.hist||[]).push({st,ts:Date.now()});save();render()}
function waLink(c){if(!c.tel)return null;const tel=c.tel.length===10?'52'+c.tel:c.tel;const first=(c.nom||'').split(' ')[0];const what=c.cat.toLowerCase()+(c.dir?' en '+c.dir:'');const msg={pend:'Hola '+first+', soy David de la Peña. Hoy tomé nota de tu petición de '+what+'. Ya quedó registrada y te aviso en cuanto tenga avance. Gracias por recibirme.',gest:'Hola '+first+', te informo que tu petición de '+what+' ya está en gestión. Te mantengo al tanto.',res:'Hola '+first+', te comparto que tu petición de '+what+' quedó resuelta. Cualquier cosa, aquí estoy.'}[c.st];return 'https://wa.me/'+tel+'?text='+encodeURIComponent(msg)}
function csv(){const rows=[['fecha','tipo','categoria','urgencia','estatus','nombre','telefono','direccion','seccion','lat','lon','texto','fotos']];S.caps.forEach(c=>rows.push([new Date(c.ts).toLocaleString('es-MX'),c.k,c.cat||'',c.urg||'',c.st?STAT[c.st][0]:'',c.nom||'',c.tel||'',c.dir||'',c.sec?pad(c.sec):'',c.lat||'',c.lon||'',(c.t||'').replace(/\s+/g,' '),c.photos||0]));return rows.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n')}
async function exportCsv(){const file=new File(['﻿'+csv()],'peticiones_DL02.csv',{type:'text/csv'});if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){try{await navigator.share({files:[file],title:'Peticiones DL02'});return}catch(e){}}const a=document.createElement('a');a.href=URL.createObjectURL(file);a.download=file.name;document.body.appendChild(a);a.click();a.remove()}
function shareText(c){return KIND[c.k]+' '+c.k+(c.cat?' · '+c.cat:'')+(c.urg==='urgente'?' 🔥URGENTE':'')+'\n'+(c.nom?'Solicita: '+c.nom+(c.tel?' ('+c.tel+')':'')+'\n':'')+(c.dir?'Dirección: '+c.dir+'\n':'')+(c.sec?'Sección '+pad(c.sec)+'\n':'')+(c.t||'')+(c.lat?'\nhttps://maps.google.com/?q='+c.lat+','+c.lon:'')+'\n'+new Date(c.ts).toLocaleString('es-MX')}
async function sharePet(c){const t=shareText(c);if(navigator.share){try{await navigator.share({text:t});return}catch(e){return}}location.href='https://wa.me/?text='+encodeURIComponent(t)}
function petHtml(c){const st=c.st?STAT[c.st]:null;const sec=c.sec?SB[c.sec]:null;let h='<div class="pet" data-id="'+c.id+'"><div class="h"><b>'+KIND[c.k]+' '+(c.cat?PCAT[c.cat]+' '+c.cat:c.k)+(c.urg==='urgente'?' <span class="pill" style="background:#b3261e">URGENTE</span>':'')+'</b>'+(st?'<span class="pill" style="background:'+st[1]+'">'+st[0]+'</span>':'')+'</div>';
 if(c.nom||c.dir)h+='<div>'+(c.nom?'<b>'+esc(c.nom)+'</b>'+(c.tel?' · '+c.tel:''):'')+(c.dir?'<br>'+esc(c.dir):'')+'</div>';
 const age=Math.floor((Date.now()-c.ts)/86400000);h+='<div>'+esc(c.t)+'</div><div class="mut">'+new Date(c.ts).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+(c.st&&c.st!=='res'&&age>=3?' · <b style="color:#b3261e">'+age+' días sin resolver</b>':'')+(sec?' · sección '+pad(c.sec)+' · '+sec.col.split(',')[0]:'')+(c.cal?' · día '+c.cal:'')+'</div><div id="ph_'+c.id+'"></div><div class="acts">';
 if(c.st){const wa=waLink(c);if(wa)h+='<a href="'+wa+'" target="_blank" rel="noopener">💬 Avisar por WhatsApp</a>';if(c.st==='pend')h+='<button data-st="gest">▶ En gestión</button>';if(c.st!=='res')h+='<button data-st="res">✓ Resuelta</button>';else h+='<button data-st="pend">↩ Reabrir</button>'}
 if(c.lat)h+='<button data-go="1">🗺 Mapa</button>';h+='<button data-sh="1">📤 Compartir</button><button data-del="1" style="color:#b3261e">Borrar</button></div></div>';return h}
function bindPets(){panel.querySelectorAll('.pet').forEach(el=>{const c=S.caps.find(x=>x.id===el.dataset.id);if(!c)return;el.querySelectorAll('[data-st]').forEach(b=>b.onclick=()=>setStatus(c,b.dataset.st));const go=el.querySelector('[data-go]');if(go)go.onclick=()=>{view.lon=c.lon;view.lat=c.lat;view.z=17;follow=false;draw()};el.querySelector('[data-sh]').onclick=()=>sharePet(c);el.querySelector('[data-del]').onclick=()=>{if(confirm('¿Borrar este registro?')){S.caps=S.caps.filter(x=>x!==c);save();render()}};
  for(let i=0;i<(c.photos||0);i++)getPhoto(c.id+'_'+i).then(b=>{if(!b)return;const im=document.createElement('img');im.className='thumb';im.src=URL.createObjectURL(b);im.onclick=()=>{document.getElementById('photoimg').src=im.src;document.getElementById('photo').style.display='flex'};document.getElementById('ph_'+c.id)?.appendChild(im)})})}
document.getElementById('photo').onclick=()=>document.getElementById('photo').style.display='none';
let capFilter='all';
function rCap(){const pets=S.caps.filter(c=>c.k==='Petición');const n=st=>pets.filter(c=>c.st===st).length;const urg=pets.filter(c=>c.urg==='urgente'&&c.st!=='res').length;const old=pets.filter(c=>c.st!=='res'&&Date.now()-c.ts>3*86400000).length;
 let h='<div class="row" style="justify-content:space-between"><h1 style="margin:0">Peticiones</h1><button class="btn" id="add" style="width:auto;margin:0;padding:10px 16px">+ Nueva</button></div>';
 h+='<div class="kpi" style="margin:10px 0"><div class="card" style="padding:10px"><div class="big" style="font-size:26px;color:#b58900">'+n('pend')+'</div><div class="mut">pendientes</div></div><div class="card" style="padding:10px"><div class="big" style="font-size:26px;color:#1a73e8">'+n('gest')+'</div><div class="mut">en gestión</div></div><div class="card" style="padding:10px"><div class="big" style="font-size:26px;color:#1a9d2b">'+n('res')+'</div><div class="mut">resueltas</div></div></div>';
 if(urg)h+='<div class="card" style="border-color:#b3261e;color:#b3261e;font-weight:700">🔥 '+urg+' urgente'+(urg>1?'s':'')+' sin resolver</div>';if(old)h+='<div class="card" style="font-weight:600">⏰ '+old+' con más de 3 días sin resolver</div>';
 h+='<div class="row" style="margin:6px 0"><select id="cf" style="flex:1;width:auto"><option value="all">Todo ('+S.caps.length+')</option><option value="pend">Pendientes</option><option value="gest">En gestión</option><option value="res">Resueltas</option><option value="urg">Urgentes</option><option value="Contacto">Contactos</option><option value="Incidencia">Incidencias</option><option value="Nota">Notas</option></select><button class="btn sec" id="exp" style="width:auto;margin:0;padding:12px 14px">📤 Excel</button></div>';
 const list=[...S.caps].reverse().filter(c=>capFilter==='all'||c.st===capFilter||c.k===capFilter||(capFilter==='urg'&&c.urg==='urgente'));if(!list.length)h+='<p class="mut">Sin registros. Toca <b>+ Nueva</b> o el botón naranja del mapa durante un recorrido.</p>';list.forEach(c=>h+=petHtml(c));
 panel.innerHTML=h;document.getElementById('add').onclick=()=>openCap();document.getElementById('exp').onclick=exportCsv;const cf=document.getElementById('cf');cf.value=capFilter;cf.onchange=()=>{capFilter=cf.value;render()};bindPets()}
'''
s = s[:start] + new_caps + s[end:]
# remove old rCap (defined before the captures block)
a = s.index("function rCap(){let h='<h1>Capturas</h1>"); b = s.index("function rAy()")
s = s[:a] + s[b:]
# map pins
rep("""S.caps.forEach(k=>{if(!k.lon)return;const p=proj(k.lon,k.lat);ctx.font='16px system-ui';ctx.textAlign='center';ctx.fillText({Petición:'🙋',Contacto:'🤝',Incidencia:'⚠️',Nota:'💬'}[k.k]||'📝',p[0],p[1]+6)});""",
    """if(view.z>=14)S.caps.forEach(k=>{if(!k.lon)return;const p=proj(k.lon,k.lat);ctx.beginPath();ctx.arc(p[0],p[1],13,0,7);ctx.fillStyle=k.st?(k.st==='res'?'#1a9d2b':k.urg==='urgente'?'#b3261e':k.st==='gest'?'#1a73e8':'#b58900'):'#555';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=2;ctx.stroke();ctx.font='14px system-ui';ctx.textAlign='center';ctx.fillText(k.cat?PCAT[k.cat]:KIND[k.k],p[0],p[1]+5)});""")
rep("function tap(px,py){const r=cv.getBoundingClientRect();const [lo,la]=unproj(px-r.left,py-r.top);",
    "function tap(px,py){const r=cv.getBoundingClientRect();const hit=view.z>=14&&S.caps.find(k=>k.lon&&Math.hypot(proj(k.lon,k.lat)[0]-(px-r.left),proj(k.lon,k.lat)[1]-(py-r.top))<16);if(hit){tab='cap';capFilter='all';render();const el=panel.querySelector('.pet[data-id=\"'+hit.id+'\"]');if(el){el.scrollIntoView({block:'center'});el.style.background='#0d3b8c14'}return}const [lo,la]=unproj(px-r.left,py-r.top);")
# Avance: what people ask for
rep("const low=DAYS.filter(d=>dd(d).done&&d.pct<60);",
    "const pets=S.caps.filter(c=>c.k==='Petición');if(pets.length){const byc={},bys={};pets.forEach(c=>{byc[c.cat]=(byc[c.cat]||0)+1;if(c.sec)bys[c.sec]=(bys[c.sec]||0)+1});const mx=Math.max(...Object.values(byc));h+='<h2>Qué pide la gente</h2>'+Object.entries(byc).sort((a,b)=>b[1]-a[1]).map(([c,n])=>'<div>'+PCAT[c]+' '+c+' <b>'+n+'</b></div><div class=\"bar\"><i style=\"width:'+Math.round(100*n/mx)+'%;background:var(--org)\"></i></div>').join('');const ts=Object.entries(bys).sort((a,b)=>b[1]-a[1]).slice(0,5);if(ts.length)h+='<h3>Secciones con más peticiones</h3>'+ts.map(([sc,n])=>'<div><b>'+pad(sc)+'</b> '+SB[sc].col.split(',')[0]+' · '+n+' · '+CAT[SB[sc].cat].n+'</div>').join('');const res=pets.filter(c=>c.st==='res').length;h+='<div class=\"mut\" style=\"margin-top:6px\">Resueltas: '+res+' de '+pets.length+' ('+Math.round(100*res/pets.length)+'%)</div>'}\n const low=DAYS.filter(d=>dd(d).done&&d.pct<60);")
rep('<button data-t="cap"><span>📝</span>Capturas</button>', '<button data-t="cap"><span>🙋</span>Peticiones</button>')
rep("<b>3. Captura lo que te digan</b><br>Con el botón <b>+</b> registras en dos toques una petición vecinal, un contacto o una incidencia; se guarda con el lugar y la sección.",
    "<b>3. Peticiones</b><br>Con el botón naranja <b>+</b> registras una petición con categoría, nombre, WhatsApp, dirección, foto y dictado por voz; se guarda con el GPS y la sección. Luego la pasas a <b>En gestión</b> o <b>Resuelta</b> y con un toque le avisas al vecino por WhatsApp. En Avance ves qué pide cada zona.")
open(p, 'w').write(s); print('patched')

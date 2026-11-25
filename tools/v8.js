/* ===== Ubicación al levantar una gestoría ===== */
let capLoc=null,capLocSt='';
function capLocate(force){if(!navigator.geolocation){capLocSt='nogps';capLocUI();return}
 if(!force&&me&&me.acc!=null&&me.acc<60){capLoc={lon:me.lon,lat:me.lat,acc:me.acc,src:'gps'};capLocSt='ok';capLocUI();return}
 capLocSt='busy';capLocUI();navigator.geolocation.getCurrentPosition(p=>{if(capLoc&&capLoc.src==='mapa')return;capLoc={lon:p.coords.longitude,lat:p.coords.latitude,acc:p.coords.accuracy,src:'gps'};capLocSt='ok';capLocUI()},
  e=>{if(capLoc&&capLoc.src==='mapa')return;capLocSt=e.code===1?'denied':'fail';capLocUI()},{enableHighAccuracy:true,timeout:15000,maximumAge:20000})}
function capLocUI(){const box=$('mbox');if(!box||!document.getElementById('c_s'))return;let el=document.getElementById('cloc');if(!el){el=document.createElement('div');el.id='cloc';const h=box.querySelector('h2');const anchor=h?h.parentNode:box.firstChild;anchor.parentNode.insertBefore(el,anchor.nextSibling);const hm=h&&h.parentNode.querySelector('.mut');if(hm&&!street.on)hm.style.display='none'}
 const s=capLoc?secAt(capLoc.lon,capLoc.lat):null;let ic='mappin',cls='',t='',sub='';
 if(capLoc){cls='ok';t=capLoc.src==='mapa'?'Ubicada en el mapa':'Ubicada con GPS'+(capLoc.acc?' · ±'+Math.round(capLoc.acc)+' m':'');sub=s?'Sección '+pad(s.s)+(typeof colsOf==='function'&&colsOf(s.s)[0]?' · '+colsOf(s.s)[0]:''):'Fuera del distrito'}
 else if(capLocSt==='busy'){cls='busy';t='Buscando tu ubicación…';sub='Espera unos segundos'}
 else if(capLocSt==='denied'){cls='bad';ic='alert';t='El teléfono no dio permiso de ubicación';sub='Márcala en el mapa o activa la ubicación para esta app'}
 else{cls='bad';ic='alert';t='Sin ubicación';sub='Márcala en el mapa para que salga como globo'}
 el.className=cls;el.innerHTML='<div class="cl1">'+svgIc(ic)+'<div><b>'+t+'</b><div class="mut">'+esc(sub)+'</div></div></div><div class="cl2"><button type="button" id="cl_re">'+svgIc('refresh')+' GPS</button><button type="button" id="cl_map">'+svgIc('map')+' Marcar en el mapa</button></div>';
 $('cl_re').onclick=()=>{capLoc=null;capLocate(true)};$('cl_map').onclick=()=>pickOnMap(p=>{capLoc={lon:p[0],lat:p[1],src:'mapa'};capLocSt='ok';$('modal').style.display='flex';capLocUI()},()=>{$('modal').style.display='flex'})}
/* elegir un punto en el mapa */
function pickOnMap(ok,cancel,start){$('modal').style.display='none';const prevTab=tab;if(tab!=='hoy'){tab='hoy';try{render()}catch(e){}}try{__sheet('min')}catch(e){}
 const c=start||(capLoc?[capLoc.lon,capLoc.lat]:me?[me.lon,me.lat]:null);if(c){view.lon=c[0];view.lat=c[1];view.z=Math.max(view.z,17);try{setFollow(false)}catch(e){}reqDraw()}
 const ov=document.createElement('div');ov.id='pick';ov.innerHTML='<div class="pk-pin">'+svgIc('mappin')+'</div><div class="pk-bar"><div><b>Mueve el mapa</b> hasta el lugar de la gestoría</div><div class="row"><button class="btn sec sm" id="pk_no">Cancelar</button><button class="btn sm" id="pk_ok">Usar este punto</button></div></div>';document.body.appendChild(ov);
 const done=f=>{ov.remove();f()};
 $('pk_no').onclick=()=>done(()=>{cancel&&cancel()});$('pk_ok').onclick=()=>{const r=cv.getBoundingClientRect(),pr=ov.querySelector('.pk-pin').getBoundingClientRect();const p=unproj(pr.left+pr.width/2-r.left,pr.bottom-r.top);done(()=>ok(p))}}
const _openCap0=openCap;openCap=function(kind){capLoc=null;capLocSt='';_openCap0(kind);capLocate(false)};
const _renderCap0=renderCap;renderCap=function(){_renderCap0();capLocUI()};
const _saveCap0=saveCap;saveCap=async function(){const old=me,n0=S.caps.length;if(capLoc)me={...(old||{}),lon:capLoc.lon,lat:capLoc.lat,acc:capLoc.acc||null};
 try{await _saveCap0()}finally{me=old}if(S.caps.length>n0){const r=S.caps[S.caps.length-1];r.by=meName();if(capLoc){r.gsrc=capLoc.src;if(capLoc.acc)r.acc=Math.round(capLoc.acc)}save(true);reqDraw();if(!r.lon)toast('Guardada sin ubicación: no saldrá en el mapa')}};
document.head.insertAdjacentHTML('beforeend','<style>'+
'#cloc{border-radius:14px;padding:10px 12px;margin:8px 0 10px;border:1px solid var(--line);background:var(--card)}#cloc.ok{border-color:#1a9d2b55;background:#1a9d2b12}#cloc.bad{border-color:#d9302555;background:#d9302512}#cloc.busy{border-color:#f2990055;background:#f2990012}'+
'#cloc .cl1{display:flex;gap:10px;align-items:center}#cloc .cl1>.ic{width:22px;height:22px;margin:0;flex:none}#cloc.ok .cl1>.ic{color:#1a9d2b}#cloc.bad .cl1>.ic{color:#d93025}#cloc.busy .cl1>.ic{color:#f29900;animation:clp 1s ease-in-out infinite}@keyframes clp{50%{opacity:.3}}'+
'#cloc .cl2{display:flex;gap:6px;margin-top:8px}#cloc .cl2 button{flex:1;display:inline-flex;align-items:center;justify-content:center;gap:6px;font:inherit;font-size:14px;font-weight:600;padding:9px;border-radius:10px;border:1px solid var(--line);background:var(--bg);color:var(--fg);cursor:pointer}#cloc .cl2 .ic{width:16px;height:16px;margin:0}'+
'#pick{position:fixed;inset:0;pointer-events:none;z-index:60}#pick .pk-pin{position:absolute;left:50%;top:42%;transform:translate(-50%,-100%);color:#d93025;filter:drop-shadow(0 3px 4px #0006)}#pick .pk-pin .ic{width:46px;height:46px;margin:0;stroke-width:2.4}'+
'#pick .pk-bar{pointer-events:auto;position:absolute;left:12px;right:12px;bottom:calc(env(safe-area-inset-bottom) + 90px);background:var(--card);border-radius:18px;padding:14px;box-shadow:0 6px 24px #0004;display:flex;flex-direction:column;gap:10px}#pick .pk-bar .row{display:flex;gap:8px}#pick .pk-bar .btn{flex:1}'+
'</style>');
/* ubicar una gestoría existente desde su ficha */
const _openPet7=openPet;openPet=function(c){_openPet7(c);if(c.k!=='Petición'||!can('gestorias_editar'))return;const acts=document.querySelector('#sg .sgacts');if(!acts)return;const b=document.createElement('button');b.innerHTML=svgIc('mappin')+(c.lon?' Corregir ubicación':' Ubicar en el mapa');if(!c.lon)b.style.cssText='border-color:#d93025;color:#d93025';
 b.onclick=()=>pickOnMap(p=>{c.lon=+p[0].toFixed(5);c.lat=+p[1].toFixed(5);c.gsrc='mapa';const s=secAt(c.lon,c.lat);if(s)c.sec=s.s;(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'nota',txt:'Ubicación '+(c.lon?'corregida':'marcada')+' en el mapa',by:meName()});save(true);reqDraw();openPet(c)},()=>openPet(c),c.lon?[c.lon,c.lat]:null);acts.insertBefore(b,acts.firstChild);
 if(!c.lon){const a=document.createElement('div');a.className='sgalert';a.innerHTML=svgIc('alert')+' Esta gestoría no tiene ubicación y no sale en el mapa.';const st=document.querySelector('#sg .sgst');st&&st.after(a)}};

/* ===== Gestorías en tiempo real a una hoja de Google Drive ===== */
const GS_COLS=23;
function gsCfg(){return S.prefs.gs||null}
function gsRow(c){const e=etOf(c),cerr=ETST[e]==='res',tel=(c.tel||'').replace(/\D/g,'');const last=(c.seg||[]).filter(x=>x.tipo!=='et').slice(-1)[0];
 const hist=sgLog(c).slice().reverse().map(s=>new Date(s.ts).toLocaleString('es-MX',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+' · '+(s.tipo==='alta'?'Registrada':s.tipo==='et'?ETN[s.et]:(SGT.find(t=>t[0]===s.tipo)||[0,'Nota'])[1])+(s.txt?': '+s.txt:'')+(s.by?' ('+s.by+')':'')).join('\n');
 const endTs=cerr?((c.seg||[]).filter(s=>s.tipo==='et'&&ETST[s.et]==='res').slice(-1)[0]||(c.hist||[]).filter(h=>h.st==='res').slice(-1)[0]||{}).ts:null;
 return ['G-'+String(c.id).slice(-6),String(c.id),c.ts,c.cat||'',c.urg==='urgente'?'Urgente':'Normal',e==='cer'?'Cerrada':ETN[e],cerr?(endTs?Math.max(0,Math.floor((endTs-c.ts)/864e5)):''):null,c.sec?pad(c.sec):'',gCol(c)||'',c.dir||'',c.nom||'',tel,tel?'https://wa.me/'+(tel.length===10?'52'+tel:tel):'',c.ok?'Sí':'No',(c.t||'').replace(/\s+/g,' '),c.dep||'',c.resp||'',c.fol||'',last?last.txt:'',hist,c.lat?'https://maps.google.com/?q='+c.lat+','+c.lon:'',c.by||'',null]}
function gsHash(r){let h=0;const s=JSON.stringify(r);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return h}
let gsBusy=false,gsTimer=null,gsLast=null,gsErr='';
function gsPending(){const cfg=gsCfg();if(!cfg)return {rows:[],del:[]};const sent=S.gsSent||{},rows=[],seen={};
 S.caps.forEach(c=>{if(c.k!=='Petición'||c.test||c.demo)return;seen[c.id]=1;const r=gsRow(c),h=gsHash(r);if(sent[c.id]!==h)rows.push([r,h])});
 return {rows,del:Object.keys(sent).filter(id=>!seen[id]&&sent[id]!=='del')}}
async function gsFlush(){const cfg=gsCfg();if(!cfg||gsBusy||!navigator.onLine)return;const p=gsPending();if(!p.rows.length&&!p.del.length){gsUI();return}
 gsBusy=true;gsUI();const batch=p.rows.slice(0,40),del=p.del.slice(0,40);const body=JSON.stringify({tok:cfg.tok,rows:batch.map(x=>x[0]),del});
 let okk=false;try{const r=await fetch(cfg.url,{method:'POST',body,headers:{'Content-Type':'text/plain;charset=utf-8'},redirect:'follow'});const j=await r.json();if(j.ok)okk=true;else gsErr=j.err==='token'?'La clave no coincide con la del script':'Error en la hoja ('+(j.err||'?')+')'}
 catch(e){try{await fetch(cfg.url,{method:'POST',body,mode:'no-cors',headers:{'Content-Type':'text/plain;charset=utf-8'}});okk=true}catch(e2){gsErr='Sin conexión con la hoja'}}
 if(okk){S.gsSent=S.gsSent||{};batch.forEach(x=>S.gsSent[x[0][1]]=x[1]);del.forEach(id=>S.gsSent[id]='del');gsErr='';gsLast=Date.now();_save0g(true)}
 gsBusy=false;gsUI();if(okk&&(p.rows.length>batch.length||p.del.length>del.length))setTimeout(gsFlush,500)}
const _save0g=save;save=function(...a){const r=_save0g(...a);if(gsCfg()){clearTimeout(gsTimer);gsTimer=setTimeout(gsFlush,1500)}return r};
addEventListener('online',()=>setTimeout(gsFlush,800));setInterval(gsFlush,60000);setTimeout(gsFlush,3000);
function gsUI(){const el=document.getElementById('gsst');if(!el)return;const cfg=gsCfg(),p=cfg?gsPending():{rows:[],del:[]},n=p.rows.length+p.del.length;
 el.innerHTML=!cfg?'<span class="mut">No conectado</span>':gsBusy?'<b style="color:#f29900">Enviando…</b>':gsErr?'<b style="color:#d93025">'+esc(gsErr)+'</b>'+(n?' · '+n+' por enviar':''):n?'<b style="color:#f29900">'+n+' por enviar</b>'+(navigator.onLine?'':' · sin internet, se mandan al volver la señal'):'<b style="color:#1a9d2b">Al día</b>'+(gsLast?' · último envío '+new Date(gsLast).toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'}):'')}
function gsLink(){const c=gsCfg();if(!c)return '';return location.origin+location.pathname+'?drive='+btoa(unescape(encodeURIComponent(c.url+'|'+c.tok))).replace(/=+$/,'')}
(function(){const q=new URLSearchParams(location.search).get('drive');if(!q)return;try{const s=decodeURIComponent(escape(atob(q)));const i=s.lastIndexOf('|');const url=s.slice(0,i),tok=s.slice(i+1);if(/^https:\/\/script\.google\.com\//.test(url)&&tok){S.prefs.gs={url,tok};_save0g(true);setTimeout(()=>toast('Teléfono conectado a la hoja de gestorías'),600);setTimeout(gsFlush,1500)}}catch(e){}
 const u=new URL(location.href);u.searchParams.delete('drive');history.replaceState(null,'',u.pathname+u.search+u.hash)})();
const _rMas2=rMas;rMas=function(){_rMas2();if(!(can('usuarios')||!curUser()))return;const cfg=gsCfg();const box=document.createElement('div');box.className='card';box.id='gscard';
 box.innerHTML='<div class="row" style="justify-content:space-between;align-items:center"><b>'+svgIc('excel')+' Hoja de gestorías en Drive</b></div><div class="mut" style="margin:4px 0 8px">Cada gestoría nueva o actualizada se manda sola a una hoja de Google, con nombre y teléfono, para darles seguimiento. Sin señal se guardan y se mandan al volver.</div><div id="gsst" style="margin-bottom:8px"></div>'+
 (cfg?'<div style="display:grid;grid-template-columns:1fr 1fr;gap:6px"><button class="btn sm" id="gsnow">'+svgIc('refresh')+' Enviar ahora</button><button class="btn sec sm" id="gsall">Reenviar todas</button><button class="btn sec sm" id="gslink">'+svgIc('share')+' Conectar teléfonos</button><button class="btn sec sm" id="gsoff">Desconectar</button></div>':
 '<input id="gsurl" placeholder="URL del script (https://script.google.com/…/exec)" style="width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--fg);margin-bottom:6px"><input id="gstok" placeholder="Clave de conexión" style="width:100%;box-sizing:border-box;font:inherit;font-size:15px;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--fg)"><button class="btn" id="gson" style="margin-top:8px">Conectar</button>');
 panel.appendChild(box);gsUI();const q=id=>document.getElementById(id);
 if(q('gson'))q('gson').onclick=async()=>{const url=q('gsurl').value.trim(),tok=q('gstok').value.trim();if(!/^https:\/\/script\.google\.com\/.+\/exec/.test(url)){toast('La URL debe terminar en /exec');return}if(!tok){toast('Falta la clave');return}S.prefs.gs={url,tok};_save0g(true);toast('Conectado. Enviando gestorías…');render();gsFlush()};
 if(q('gsnow'))q('gsnow').onclick=()=>{gsErr='';gsFlush()};
 if(q('gsall'))q('gsall').onclick=()=>{if(!confirm('¿Volver a mandar todas las gestorías de este teléfono a la hoja?'))return;S.gsSent={};_save0g(true);gsFlush()};
 if(q('gsoff'))q('gsoff').onclick=()=>{if(!confirm('¿Desconectar este teléfono de la hoja? Lo ya enviado se queda en la hoja.'))return;delete S.prefs.gs;_save0g(true);render()};
 if(q('gslink'))q('gslink').onclick=async()=>{const l=gsLink(),t='Abre este enlace en tu teléfono para conectar la app DL02 a la hoja de gestorías (no lo compartas fuera del equipo):\n'+l;if(navigator.share){try{await navigator.share({text:t});return}catch(e){}}try{await navigator.clipboard.writeText(l);toast('Enlace copiado')}catch(e){prompt('Copia este enlace',l)}}};
/* ===== Llamar / WhatsApp al ciudadano desde la ficha ===== */
const _openPet8=openPet;openPet=function(c){_openPet8(c);if(c.k!=='Petición'||!can('gestorias_datos'))return;const sg=document.getElementById('sg');if(!sg)return;const box=sg.querySelector('.sgbox');if(!box)return;
 const tel=(c.tel||'').replace(/\D/g,'');const d=document.createElement('div');d.className='sgcall';
 if(tel){d.innerHTML='<a class="sgc1" id="sgcall" href="tel:'+tel+'">'+svgIc('phone')+' Llamar</a><a class="sgc2" id="sgwa2" target="_blank" rel="noopener" href="'+sgWa(c)+'">'+svgIc('msg')+' WhatsApp</a>';box.appendChild(d);
  const ed=can('gestorias_editar');const pick=t=>{if(!ed)return;sgTipo=t;document.querySelectorAll('#sgtipos button').forEach(x=>x.classList.toggle('on',x.dataset.t===t));const ta=document.getElementById('sgtxt');if(ta)ta.placeholder=t==='llamada'?'¿Qué dijo en la llamada? Ej. Confirma que siguen sin agua':'¿Qué le escribiste o qué contestó?'};
  $('sgcall').addEventListener('click',()=>{pick('llamada');if(ed){(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'llamada',txt:'Se marcó al ciudadano',by:meName()});save()}});
  $('sgwa2').addEventListener('click',()=>{pick('wa');if(ed){(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'wa',txt:'Se le escribió por WhatsApp ('+ETN[etOf(c)]+')',by:meName()});save()}});
  const old=document.getElementById('sgwa');if(old)old.remove()}
 else{d.innerHTML='<div class="mut" style="font-size:13px">'+svgIc('phone')+' Sin teléfono'+(c.ok===false&&c.nom?' (no dio permiso de contacto)':'')+'</div>';box.appendChild(d)}};
document.head.insertAdjacentHTML('beforeend','<style>.sgcall{display:flex;gap:8px;margin-top:10px}.sgcall a{flex:1;display:flex;align-items:center;justify-content:center;gap:8px;padding:13px;border-radius:12px;font-weight:700;font-size:16px;text-decoration:none;color:#fff}.sgcall .sgc1{background:#1d4f9c}.sgcall .sgc2{background:#1a9d2b}.sgcall .ic{width:20px;height:20px;margin:0}.sgcall .mut .ic{width:14px;height:14px;vertical-align:-2px}</style>');
/* ===== Quién recibe y quién resuelve ===== */
(function(){if(S.prefs.users3)return;S.prefs.users3=1;S.users=S.users||[];[['u_hdr','Héctor Del Real'],['u_rts','Roberto Torres']].forEach(([id,n])=>{if(!S.users.some(u=>u.n===n))S.users.push({id,n,rol:'c2',tel:'',pin:'',on:true})});
 const T=['Héctor Del Real','Roberto Torres','David de la Peña'];S.caps.filter(k=>k.demo).forEach((k,i)=>{k.by=T[i%3];if(k.resp)k.resp=T[(i+1)%3];(k.seg||[]).forEach(s=>{if(s.by)s.by=k.resp||k.by})});save(true)})();
const teamNames=()=>(S.users||[]).filter(u=>u.on).map(u=>u.n);
let capBy=null;
const _openCap8=openCap;openCap=function(kind){const u=curUser();capBy=u?u.n:(S.prefs.lastBy||'');_openCap8(kind)};
const _capLocUI8=capLocUI;capLocUI=function(){_capLocUI8();const loc=document.getElementById('cloc');if(!loc||document.getElementById('cby'))return;const d=document.createElement('label');d.id='cby';
 d.innerHTML='<span>¿Quién la recibe?</span><select id="cbysel"><option value="">— Elige —</option>'+teamNames().map(n=>'<option'+(n===capBy?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select>';loc.after(d);$('cbysel').onchange=e=>{capBy=e.target.value}};
const _saveCap8=saveCap;saveCap=async function(){const k=(document.querySelector('#mbox [data-kind].on')||{}).dataset;if(!capBy&&teamNames().length>1&&cap.k==='Petición'){const s=$('cbysel');if(s){s.classList.add('need');s.focus()}toast('Elige quién recibe la gestoría');return}
 const n0=S.caps.length;await _saveCap8();if(S.caps.length>n0){const r=S.caps[S.caps.length-1];if(capBy){r.by=capBy;S.prefs.lastBy=capBy}save(true)}};
meName=function(){const u=typeof curUser==='function'&&curUser();return u?u.n:(S.prefs.lastBy||'Equipo')};
const _openPet9=openPet;openPet=function(c){_openPet9(c);if(c.k!=='Petición')return;const sg=document.getElementById('sg');if(!sg)return;
 const hd=sg.querySelector('.sghd');if(hd){const r=document.createElement('div');r.className='sgwho';const f=new Date(c.ts).toLocaleString('es-MX',{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'});
  r.innerHTML='<div>'+svgIc('inbox')+'<span><span class="mut">Recibió</span><b>'+esc(c.by||'Sin registro')+'</b><span class="mut">'+f+'</span></span></div><div>'+svgIc('user')+'<span><span class="mut">La resuelve</span><b'+(c.resp?'':' style="color:#d93025"')+'>'+esc(c.resp||'Sin asignar')+'</b>'+(c.dep&&c.dep!==TEAM?'<span class="mut">vía '+esc(c.dep)+'</span>':'')+'</span></div>';hd.after(r)}
 const rs=document.getElementById('sgresp');if(rs){const lab=rs.closest('label');if(lab)lab.firstChild.textContent='¿Quién del equipo la va a resolver?';const opts=new Set([...teamNames(),c.resp].filter(Boolean));rs.innerHTML='<option value="">— Sin asignar —</option>'+[...opts].map(n=>'<option'+(n===c.resp?' selected':'')+'>'+esc(n)+'</option>').join('')}};
const _gsRow9=gsRow;gsRow=function(c){const r=_gsRow9(c);return r};
document.head.insertAdjacentHTML('beforeend','<style>#cby{display:flex;align-items:center;gap:10px;margin:0 0 10px;font-size:14px;font-weight:600}#cby span{flex:none}#cby select{flex:1;margin:0;padding:10px}#cby select.need{border-color:#d93025;box-shadow:0 0 0 3px #d9302533}'+
'.sgwho{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:0 0 6px}.sgwho>div{display:flex;gap:8px;align-items:flex-start;background:var(--card);border:1px solid var(--line);border-radius:12px;padding:9px 10px}.sgwho>div>.ic{width:18px;height:18px;margin:2px 0 0;flex:none;color:var(--b)}.sgwho>div>span{display:flex;flex-direction:column;min-width:0;font-size:14px;line-height:1.3}.sgwho .mut{font-size:12px}</style>');
/* ===== Quien recibe = la cuenta con la que se entró (sin preguntar) ===== */
capLocUI=function(){_capLocUI8();const loc=document.getElementById('cloc');if(!loc||document.getElementById('cby2'))return;const u=curUser();const d=document.createElement('div');d.id='cby2';
 d.innerHTML=svgIc('user')+(u?'<span>La recibe <b>'+esc(u.n)+'</b> · '+new Date().toLocaleTimeString('es-MX',{hour:'2-digit',minute:'2-digit'})+'</span>':'<span style="color:#d93025">No has iniciado sesión: se guardará sin nombre</span>');loc.after(d)};
saveCap=async function(){const n0=S.caps.length;await _saveCap8();if(S.caps.length>n0){const r=S.caps[S.caps.length-1],u=curUser();r.by=u?u.n:'Sin usuario';save(true)}};
meName=function(){const u=typeof curUser==='function'&&curUser();return u?u.n:'Sin usuario'};
/* inicio de sesión al abrir la app si este teléfono no tiene usuario */
function loginGate(){if(curUser()||navigator.webdriver||window.MAE)return;const A=(S.users||[]).filter(u=>u.on);if(!A.length)return;switchUser();const h=document.querySelector('#mbox h2');if(h){h.textContent='Inicia sesión';h.insertAdjacentHTML('afterend','<p class="mut" style="margin:-4px 0 10px">Elige tu nombre. Las gestorías que levantes quedarán registradas a tu nombre.</p>')}
 const x=$('mclose');if(x)x.style.visibility='hidden';const ob=new MutationObserver(()=>{if(getComputedStyle($('modal')).display==='none'){if(x)x.style.visibility='';ob.disconnect();if(!curUser())setTimeout(loginGate,300)}});ob.observe($('modal'),{attributes:true,attributeFilter:['style']})}
setTimeout(loginGate,900);
document.head.insertAdjacentHTML('beforeend','<style>#cby2{display:flex;align-items:center;gap:8px;font-size:14px;margin:0 0 10px;padding:0 2px}#cby2 .ic{width:16px;height:16px;margin:0;color:var(--b)}</style>');

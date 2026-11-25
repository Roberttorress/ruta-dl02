/* ===== Seguimiento de gestorías: etapas, responsable, dependencia, bitácora ===== */
const _petHtml0=petHtml,_openPet0=openPet;
const ETS=[['rec','Recibida','pend'],['can','Asignada','gest'],['pro','En proceso','gest'],['res','Resuelta','res'],['cer','Cerrada','res']];
const ETN={rec:'Recibida',can:'Asignada',pro:'En proceso',res:'Resuelta',cer:'Cerrada · ciudadano avisado',np:'No procede'};
const ETST={rec:'pend',can:'gest',pro:'gest',res:'res',cer:'res',np:'res'};
const ETC={rec:'#d93025',can:'#f29900',pro:'#e37400',res:'#1a9d2b',cer:'#137333',np:'#80868b'};
const ETNEXT={rec:'can',can:'pro',pro:'res',res:'cer'};
const ETBTN={can:'Asignar quién la atiende',pro:'Marcar en proceso',res:'Marcar resuelta',cer:'Cerrar: ciudadano avisado'};
const TEAM='Equipo del candidato';const isTeam=c=>c.dep===TEAM;const DEPS=[TEAM,'Servicios Públicos (Monterrey)','Agua y Drenaje de Monterrey','Desarrollo Urbano','Obras Públicas','Seguridad y Protección Ciudadana','Tránsito','Protección Civil','Ecología / Parques','DIF','Salud','Desarrollo Social','CFE','Gobierno del Estado','Otra dependencia'];
const SGT=[['nota','Nota','pencil'],['llamada','Llamada','phone'],['visita','Visita','walk'],['oficio','Oficio','file'],['wa','WhatsApp','msg']];
function etOf(c){if(c.et&&ETN[c.et])return c.et;return c.st==='res'?'res':c.st==='gest'?(c.dep?'can':'pro'):'rec'}
function stcK(k){return ETC[etOf(k)]||STC[k.st]||STC.pend}
function meName(){const u=typeof curUser==='function'&&curUser();return u?u.n:'Equipo'}
function dayN(t){return Math.floor(t/864e5)}
function sgLog(c){const L=(c.seg||[]).slice();if(!c.seg&&c.hist)c.hist.forEach((h,i)=>{if(i)L.push({ts:h.ts,tipo:'et',et:h.st==='pend'?'rec':h.st==='gest'?'pro':'res'})});
 L.push({ts:c.ts,tipo:'alta'});return L.sort((a,b)=>b.ts-a.ts)}
function vencida(c){return false&&c.fc&&ETST[etOf(c)]!=='res'&&new Date(c.fc+'T23:59:59')<new Date()}
function setEt(c,et,txt){c.et=et;c.st=ETST[et];(c.hist=c.hist||[]).push({st:c.st,ts:Date.now()});(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'et',et,txt:txt||'',by:meName()});save()}
function stepper(c){const e=etOf(c);if(e==='np')return '<div class="sgst np">'+svgIc('ban')+' No procede</div>';const i=ETS.findIndex(x=>x[0]===e);
 return '<div class="sgst">'+ETS.map((x,j)=>'<div class="sgs'+(j<i?' done':j===i?' cur':'')+'" style="--c:'+ETC[x[0]]+'"><i></i><span>'+x[1]+'</span></div>').join('')+'</div>'}
function sgWa(c){if(!c.tel)return null;const tel=c.tel.length===10?'52'+c.tel:c.tel,f=(c.nom||'').split(' ')[0],w=(c.cat||'').toLowerCase()+(c.dir?' en '+c.dir:''),e=etOf(c);
 const m={rec:'Hola '+f+', soy del equipo de David de la Peña. Tu gestoría de '+w+' quedó registrada y te avisamos en cuanto haya avance.',can:isTeam(c)?'Hola '+f+', tu gestoría de '+w+' ya la tiene asignada nuestro equipo'+(c.resp?' ('+c.resp+')':'')+'. Te avisamos en cuanto avance.':'Hola '+f+', tu gestoría de '+w+' ya se canalizó a '+(c.dep||'la dependencia')+(c.fol?' con el folio '+c.fol:'')+'. Nosotros le damos seguimiento.',pro:'Hola '+f+', tu gestoría de '+w+' ya está en atención'+(c.dep&&!isTeam(c)?' por '+c.dep:'')+'. Te mantenemos al tanto.',res:'Hola '+f+', tu gestoría de '+w+' quedó resuelta. ¿Nos confirmas que todo quedó bien?',cer:'Hola '+f+', gracias por confirmarnos. Aquí seguimos para lo que necesites.',np:'Hola '+f+', revisamos tu gestoría de '+w+' y por ahora no fue posible atenderla por esta vía. Te explicamos los detalles por aquí.'};
 return 'https://wa.me/'+tel+'?text='+encodeURIComponent(m[e])}
/* tarjeta compacta para la lista */
petHtml=function(c){if(c.k!=='Petición')return _petHtml0(c);const e=etOf(c),age=dayN(Date.now()-c.ts),cerr=ETST[e]==='res',last=(c.seg||[]).filter(s=>s.tipo!=='et').slice(-1)[0];
 return '<div class="sgcard" data-id="'+c.id+'" data-open="1"><div class="h"><b>'+svgIc(CATI[c.cat]||'pin')+' '+esc(c.cat||'Gestoría')+(c.urg==='urgente'&&!cerr?' <span class="pill" style="background:#b3261e">URGENTE</span>':'')+(c.demo?' <span style="background:#80868b22;color:#5f6368;font-size:11px;font-weight:700;padding:2px 7px;border-radius:6px;vertical-align:2px">PRUEBA</span>':'')+'</b><span class="stpill" style="background:'+ETC[e]+'">'+(e==='cer'?'Cerrada':ETN[e])+'</span></div>'+
 '<div class="sgdesc">'+esc(c.t||'')+'</div>'+(c.nom&&can('gestorias_datos')?'<div class="mut" style="font-size:13px">'+svgIc('user')+' '+esc(c.nom)+(c.tel?' · '+c.tel:'')+'</div>':'')+stepper(c)+
 '<div class="mut sgmeta">'+(c.sec?'Secc. '+pad(c.sec)+(gCol(c)?' · '+esc(gCol(c)):''):'')+(c.dep?' · '+esc(isTeam(c)?'Equipo':c.dep):'')+(c.by?' · Recibió '+esc(c.by.split(' ')[0]):'')+(c.resp?' · Resuelve '+esc(c.resp.split(' ')[0]):'')+'</div>'+
 '<div class="sgfoot">'+''+(!cerr?'<span class="'+(age>=7?'warn':'')+'">'+age+' día'+(age===1?'':'s')+' abierta</span>':'<span>'+svgIc('check')+' '+((c.seg||[]).length)+' seguimientos</span>')+'</div>'+
 (last?'<div class="sglast">'+svgIc((SGT.find(t=>t[0]===last.tipo)||['','','pencil'])[2])+' '+esc(last.txt).slice(0,90)+'</div>':'')+'</div>'};
const _bindPets0=bindPets;bindPets=function(root){root.querySelectorAll('.sgcard').forEach(el=>{const c=S.caps.find(x=>x.id===el.dataset.id);if(c)el.onclick=()=>openPet(c)});_bindPets0(root)};
/* ficha completa de seguimiento */
let sgTipo='nota';
openPet=function(c){if(c.k!=='Petición'){_openPet0(c);return}const e=etOf(c),ed=can('gestorias_editar'),datos=can('gestorias_datos'),cerr=ETST[e]==='res',nx=ETNEXT[e],age=dayN(Date.now()-c.ts);
 const users=(S.users||[]).filter(u=>u.on).map(u=>u.n);if(c.resp&&!users.includes(c.resp))users.push(c.resp);
 const dis=ed?'':' disabled';
 let h='<div id="sg" data-id="'+c.id+'"><div class="sghd"><div class="sgic" style="background:'+ETC[e]+'">'+svgIc(CATI[c.cat]||'pin')+'</div><div style="flex:1;min-width:0"><div class="sgt">'+esc(c.cat||'Gestoría')+(c.urg==='urgente'&&!cerr?' <span class="pill" style="background:#b3261e">URGENTE</span>':'')+'</div><div class="mut">G-'+String(c.id).slice(-6)+' · '+new Date(c.ts).toLocaleDateString('es-MX',{day:'numeric',month:'short',year:'numeric'})+(cerr?'':' · '+age+' día'+(age===1?'':'s')+' abierta')+'</div></div><span class="stpill" style="background:'+ETC[e]+'">'+(e==='cer'?'Cerrada':ETN[e])+'</span></div>'+
 stepper(c)+
 (vencida(c)?'<div class="sgalert">'+svgIc('alert')+' La fecha compromiso ya pasó. Actualiza el seguimiento o ajusta la fecha.</div>':'')+
 '<div class="sgbox"><div class="sgdesc big">'+esc(c.t||'Sin descripción')+'</div>'+((c.nom||c.dir)&&datos?'<div class="sgrow">'+svgIc('user')+'<div>'+(c.nom?'<b>'+esc(c.nom)+'</b>'+(c.tel?' · <a href="tel:'+c.tel+'">'+c.tel+'</a>':''):'')+(c.dir?'<div class="mut">'+esc(c.dir)+'</div>':'')+'</div></div>':'')+
 '<div class="sgrow">'+svgIc('mappin')+'<div>'+(c.sec?'Sección '+pad(c.sec):'Sin sección')+(gCol(c)?' · '+esc(gCol(c)):'')+'</div></div><div id="ph_'+c.id+'"></div></div>'+
 (nx&&ed?'<button class="btn" id="sgnext" style="background:'+ETC[nx]+'">'+svgIc(nx==='res'||nx==='cer'?'check':nx==='can'?'users':'walk')+' '+ETBTN[nx]+'</button>':'')+
 '<div class="sgh">Datos del seguimiento</div><div class="sgbox sgform">'+
 '<label>¿Quién la atiende?<select id="sgdep"'+dis+'><option value="">— Sin asignar —</option><option'+(isTeam(c)?' selected':'')+'>'+TEAM+'</option><optgroup label="Canalizar a dependencia">'+DEPS.slice(1).map(n=>'<option'+(n===c.dep?' selected':'')+'>'+esc(n)+'</option>').join('')+'</optgroup></select></label>'+
 '<label>Responsable del equipo<select id="sgresp"'+dis+'><option value="">— Sin asignar —</option>'+users.map(n=>'<option'+(n===c.resp?' selected':'')+'>'+esc(n)+'</option>').join('')+'</select></label>'+
 '<div>'+(c.dep&&!isTeam(c)?'<label>Folio de la dependencia<input id="sgfol" placeholder="Ej. 072-12345" value="'+esc(c.fol||'')+'"'+dis+'></label>':'')+'</div></div>'+
 (ed?'<div class="sgh">Agregar seguimiento</div><div class="sgbox"><div class="chips" id="sgtipos">'+SGT.map(t=>'<button data-t="'+t[0]+'" class="'+(t[0]===sgTipo?'on':'')+'">'+svgIc(t[2])+' '+t[1]+'</button>').join('')+'</div><textarea id="sgtxt" rows="2" placeholder="¿Qué se hizo? Ej. Se llamó a Servicios Públicos, quedan de venir el jueves"></textarea><button class="btn sec" id="sgadd">'+svgIc('plus')+' Guardar seguimiento</button></div>':'')+
 '<div class="sgh">Historial</div><div class="sgtl">'+sgLog(c).map(s=>{const t=SGT.find(x=>x[0]===s.tipo);const col=s.tipo==='et'?ETC[s.et]:s.tipo==='alta'?'#1d4f9c':'#5f6368';
  const ttl=s.tipo==='alta'?'Gestoría registrada':s.tipo==='et'?ETN[s.et]:t?t[1]:'Nota';return '<div class="sgi" style="--c:'+col+'"><i>'+svgIc(s.tipo==='alta'?'plus':s.tipo==='et'?'flag':t?t[2]:'pencil')+'</i><div><b>'+ttl+'</b>'+(s.txt?'<div>'+esc(s.txt)+'</div>':'')+'<div class="mut">'+new Date(s.ts).toLocaleString('es-MX',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})+(s.by?' · '+esc(s.by):'')+'</div></div></div>'}).join('')+'</div>'+
 '<div class="acts sgacts">'+(datos&&sgWa(c)?'<a target="_blank" rel="noopener" id="sgwa" href="'+sgWa(c)+'">'+svgIc('msg')+' Avisar al ciudadano</a>':'')+(c.lat?'<button id="sggo">'+svgIc('map')+' Ver en mapa</button>':'')+'<button id="sgsh">'+svgIc('share')+' Compartir</button>'+
 (ed&&e!=='np'&&!cerr?'<button id="sgnp">'+svgIc('ban')+' No procede</button>':'')+(ed&&cerr?'<button id="sgre">'+svgIc('refresh')+' Reabrir</button>':'')+(can('borrar')?'<button id="sgdel" class="warn">'+svgIc('trash')+' Borrar</button>':'')+'</div>'+
 '<button class="btn sec" id="sgclose">Cerrar</button></div>';
 $('mbox').innerHTML=h;$('modal').style.display='flex';$('mbox').scrollTop=0;
 for(let i=0;i<(c.photos||0);i++)getPhoto(c.id+'_'+i).then(b=>{if(!b)return;const im=document.createElement('img');im.className='thumb';im.src=URL.createObjectURL(b);im.onclick=()=>{$('photoimg').src=im.src;$('photo').style.display='flex'};const ph=document.getElementById('ph_'+c.id);if(ph)ph.appendChild(im)});
 const re=()=>{openPet(c);try{reqDraw()}catch(e){}};const q=id=>document.getElementById(id);
 q('sgclose').onclick=()=>{closeModal();try{if(tab==='cap')render()}catch(e){}};
 if(q('sgnext'))q('sgnext').onclick=()=>{if(nx==='can'&&!c.dep){const d=q('sgdep');d.classList.add('need');d.scrollIntoView({block:'center',behavior:'smooth'});toast('Elige quién la atiende: el equipo o una dependencia');return}
  let txt='';if(nx==='can')txt=isTeam(c)?'La atiende el equipo'+(c.resp?' · '+c.resp:''):'Canalizada a '+c.dep+(c.fol?' · folio '+c.fol:'');if(nx==='res'){txt=prompt('¿Cómo se resolvió? (opcional)')||''}setEt(c,nx,txt);toast(ETN[nx]);re()};
 const fld=(id,key,lbl)=>{const el=q(id);if(!el||!ed)return;el.onchange=()=>{const v=el.value.trim(),old=c[key]||'';if(v===old)return;c[key]=v;(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'nota',txt:lbl+': '+(v?(key==='fc'?new Date(v+'T12:00').toLocaleDateString('es-MX',{day:'numeric',month:'long'}):v):'(sin dato)'),by:meName()});
  if(key==='dep'&&v&&etOf(c)==='rec'){setEt(c,'can',v===TEAM?'La atiende el equipo'+(c.resp?' · '+c.resp:''):'Canalizada a '+v)}else save();re()}};
 fld('sgresp','resp','Responsable');fld('sgdep','dep','Atiende');fld('sgfol','fol','Folio');
 document.querySelectorAll('#sgtipos button').forEach(b=>b.onclick=()=>{sgTipo=b.dataset.t;document.querySelectorAll('#sgtipos button').forEach(x=>x.classList.toggle('on',x===b))});
 if(q('sgadd'))q('sgadd').onclick=()=>{const t=q('sgtxt').value.trim();if(!t){toast('Escribe qué se hizo');q('sgtxt').focus();return}(c.seg=c.seg||[]).push({ts:Date.now(),tipo:sgTipo,txt:t,by:meName()});if(etOf(c)==='rec'&&sgTipo!=='nota')setEt(c,'pro','');else save();toast('Seguimiento guardado');re()};
 if(q('sgwa'))q('sgwa').addEventListener('click',()=>{(c.seg=c.seg||[]).push({ts:Date.now(),tipo:'wa',txt:'Se avisó al ciudadano por WhatsApp ('+ETN[etOf(c)]+')',by:meName()});save()});
 if(q('sggo'))q('sggo').onclick=()=>{closeModal();if(tab!=='hoy'){tab='hoy';try{render()}catch(e){}}view.lon=c.lon;view.lat=c.lat;view.z=17.5;try{setFollow(false);__sheet('min')}catch(e){}reqDraw()};
 q('sgsh').onclick=()=>sharePet(c);
 if(q('sgnp'))q('sgnp').onclick=()=>{const t=prompt('¿Por qué no procede?');if(t===null)return;setEt(c,'np',t);re()};
 if(q('sgre'))q('sgre').onclick=()=>{setEt(c,c.dep?'pro':'rec','Reabierta');re()};
 if(q('sgdel'))q('sgdel').onclick=()=>{if(confirm('¿Borrar esta gestoría?')){S.caps=S.caps.filter(x=>x!==c);save();closeModal();try{render();reqDraw()}catch(e){}}}};
document.head.insertAdjacentHTML('beforeend','<style>'+
'#sg .sghd{display:flex;gap:12px;align-items:center;margin:2px 0 10px}#sg .sgic{width:46px;height:46px;border-radius:23px;display:flex;align-items:center;justify-content:center;color:#fff;flex:none}#sg .sgic .ic{width:24px;height:24px;margin:0}'+
'#sg .sgt{font-size:20px;font-weight:800;line-height:1.2}.sgst{display:flex;margin:10px 0 12px;gap:2px}.sgs{flex:1;text-align:center;font-size:11px;color:var(--mut,#80868b);position:relative}.sgs i{display:block;height:6px;border-radius:3px;background:var(--line);margin-bottom:5px}.sgs.done i,.sgs.cur i{background:var(--c)}.sgs.cur span{color:var(--c);font-weight:800}.sgs.done span{color:var(--fg)}'+
'.sgst.np{display:block;padding:8px 10px;border-radius:10px;background:#80868b22;color:#5f6368;font-weight:700;font-size:14px}'+
'#sg .sgbox{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px;margin:8px 0}.sgdesc{font-size:15px;margin:4px 0}.sgdesc.big{font-size:17px;font-weight:600;margin:0 0 8px}'+
'#sg .sgrow{display:flex;gap:10px;align-items:flex-start;padding:6px 0;border-top:1px solid var(--line)}#sg .sgrow>.ic{margin:2px 0 0;flex:none;color:var(--b)}'+
'#sg .sgh{font-size:13px;font-weight:800;letter-spacing:.04em;text-transform:uppercase;color:var(--mut,#80868b);margin:16px 2px 4px}'+
'#sg .sgform label{display:block;font-size:13px;font-weight:600;color:var(--mut,#80868b);margin:4px 0 8px}#sg .sgform select,#sg .sgform input{display:block;width:100%;box-sizing:border-box;margin-top:4px;font:inherit;font-size:16px;padding:11px;border-radius:12px;border:1px solid var(--line);background:var(--bg);color:var(--fg)}#sg .sg2{display:grid;grid-template-columns:1fr 1fr;gap:8px}#sg select.need{border-color:#d93025;box-shadow:0 0 0 3px #d9302533}'+
'#sg textarea{box-sizing:border-box}#sg .chips button .ic{width:16px;height:16px}'+
'#sg .sgalert{background:#d9302518;color:#b3261e;border-radius:12px;padding:10px 12px;font-weight:600;font-size:14px;display:flex;gap:8px;align-items:center}'+
'.sgtl{position:relative;margin:6px 0 10px}.sgi{display:flex;gap:12px;padding:8px 0;position:relative}.sgi:not(:last-child)::before{content:"";position:absolute;left:15px;top:38px;bottom:-6px;width:2px;background:var(--line)}.sgi>i{width:32px;height:32px;border-radius:16px;background:var(--c);color:#fff;display:flex;align-items:center;justify-content:center;flex:none}.sgi>i .ic{width:16px;height:16px;margin:0}.sgi b{font-size:15px}.sgi>div{min-width:0;flex:1}'+
'#sg .sgacts a,#sg .sgacts button{display:inline-flex;align-items:center;gap:6px}#sg .sgacts .ic{margin:0;width:16px;height:16px}'+
'.sgcard{cursor:pointer;padding:12px 0;border-bottom:1px solid var(--line)}.sgcard .h{display:flex;justify-content:space-between;align-items:center;gap:8px}.sgcard .sgst{margin:8px 0 6px}.sgcard .sgs span{font-size:10px}.sgmeta .ic{width:13px;height:13px;margin:0 2px 0 4px;vertical-align:-2px}.sgfoot{display:flex;justify-content:space-between;font-size:13px;color:var(--mut,#80868b);margin-top:4px}.sgfoot .ic{width:13px;height:13px;vertical-align:-2px}.sglast{font-size:13px;margin-top:6px;padding:6px 9px;border-radius:9px;background:var(--card);border:1px solid var(--line);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.sglast .ic{width:13px;height:13px;vertical-align:-2px}'+
'</style>');
/* datos de ejemplo con seguimiento */
(function(){if(S.prefs.demoSeg2)return;S.prefs.demoSeg2=1;const now=Date.now();S.caps.filter(k=>k.demo).forEach((k,i)=>{if(k.seg&&!(k.seg[0]&&/^A /.test(k.seg[0].txt||'')))return;delete k.fol;const d=DEPS[[1,0,0,5,0,2,7,0,9,0,11,0,2,0,6][i%15]];
 if(k.st==='pend'){k.et='rec';if(i%3===0)k.seg=[{ts:k.ts+36e5,tipo:'llamada',txt:'Se llamó a la vecina para confirmar la dirección',by:'Equipo de gestoría'}];return}
 k.dep=d;k.resp=i%2?'Equipo de gestoría':'David de la Peña';if(i%4&&d!==TEAM)k.fol='072-'+(41000+i*137);k.fc=new Date(now+(i%5-2)*864e5*3).toISOString().slice(0,10);
 k.seg=[{ts:k.ts+2*36e5,tipo:'et',et:'can',txt:d===TEAM?'La atiende el equipo · '+k.resp:'Canalizada a '+d+(k.fol?' · folio '+k.fol:''),by:k.resp}];
 if(k.st==='gest'){k.et=i%2?'pro':'can';if(k.et==='pro')k.seg.push({ts:k.ts+864e5,tipo:'visita',txt:'Pasó la cuadrilla a revisar, quedan de regresar con material',by:k.resp},{ts:k.ts+864e5+6e4,tipo:'et',et:'pro',by:k.resp})}
 else{k.et=i%2?'cer':'res';k.seg.push({ts:k.ts+864e5,tipo:'et',et:'pro',by:k.resp},{ts:k.ts+2*864e5,tipo:'et',et:'res',txt:'Quedó atendido, se tomó foto',by:k.resp});if(k.et==='cer')k.seg.push({ts:k.ts+2*864e5+36e5,tipo:'wa',txt:'Se avisó al ciudadano por WhatsApp, confirmó que quedó bien',by:k.resp},{ts:k.ts+2*864e5+37e5,tipo:'et',et:'cer',by:k.resp})}});save()})();

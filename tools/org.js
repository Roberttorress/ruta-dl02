/* ===== Davidsito + estructura de campaña ===== */
const ORG=_D.org||{zones:[],cas:{}};S.org=S.org||{p:{},c:{}};
const AREAS=[['cg','Coordinación general','Operación diaria y enlace con el partido'],['a_ter','Territorio','4 zonas, seccionales y promotores'],['a_ges','Gestión ciudadana','Seguimiento a gestorías de calle'],['a_com','Comunicación','Redes, prensa, fotos y mensaje del día'],['a_dv','Defensa del voto','Representantes generales y de casilla'],['a_log','Logística','Transporte, materiales, agenda, mercaditos'],['a_dat','Datos y app','Respaldos, reportes y metas']];
const casOf=s=>ORG.cas[s]||ORG.cas[String(s)]||0,prNeed=s=>Math.ceil((SB[s]?SB[s].meta:0)/10),rcNeed=s=>2*casOf(s);
const ZN=ORG.zones.map((z,i)=>{const cas=z.secs.reduce((a,s)=>a+casOf(s),0);return{i,n:z.n,secs:z.secs.slice().sort((a,b)=>a-b),cas,rg:Math.ceil(cas/10),ln:z.secs.reduce((a,s)=>a+(SB[s]?SB[s].ln:0),0),meta:z.secs.reduce((a,s)=>a+(SB[s]?SB[s].meta:0),0)}});
const zoneOf=s=>ZN.find(z=>z.secs.indexOf(+s)>=0);
const op=k=>S.org.p[k]||null,oc=k=>+S.org.c[k]||0,has=k=>!!(op(k)&&op(k).n);
function orgTot(){const r={dir:[0,AREAS.length+1],zon:[0,ZN.length],sec:[0,0],pro:[0,0],rg:[0,0],rc:[0,0]};
 AREAS.forEach(a=>{if(has(a[0]))r.dir[0]++});if(has('sup'))r.dir[0]++;ZN.forEach(z=>{if(has('z'+z.i))r.zon[0]++;r.rg[1]+=z.rg;for(let j=0;j<z.rg;j++)if(has('rg'+z.i+'_'+j))r.rg[0]++;
  z.secs.forEach(s=>{r.sec[1]++;if(has('s'+s))r.sec[0]++;r.pro[1]+=prNeed(s);r.pro[0]+=Math.min(oc('pr'+s),prNeed(s));r.rc[1]+=rcNeed(s);r.rc[0]+=Math.min(oc('rc'+s),rcNeed(s))})});return r}
const pbar=(a,b,c)=>'<div class="obar"><i style="width:'+(b?Math.min(100,Math.round(100*a/b)):0)+'%;background:'+(c||'var(--b)')+'"></i></div>';
const frac=(a,b)=>'<b>'+fmt(a)+'</b><span class="mut"> / '+fmt(b)+'</span>';
let ov={v:'est'};
const DVSVG=window.__DVSVG||'';
function openBot(v){ov=v||{v:can('estructura')?'est':can('propuestas')?'prop':'hoy'};$('mbox')._v=null;$('modal').style.display='flex';$('mbox').classList.add('orgbox');rBot();try{if(!S.org.seen){S.org.seen=1;save()}}catch(e){}}
function botHead(msg){return '<div class="dvtop"><div class="dvhead"><div class="dvmini">'+DVSVG+'</div><div class="dvsay">'+msg+'</div></div>'+
 '<div class="chips">'+[['est','🏛️ Estructura'],['prop','📣 Propuestas'],['hoy','📍 ¿Qué toca hoy?'],['dd','🗳 Día D'],['ag','📒 Agenda e INE'],['metas','🎯 Metas'],['pet','🙋 Gestorías'],['bus','🔎 Buscar sección']].map(c=>'<button data-v="'+c[0]+'" class="'+(ov.v===c[0]||(c[0]==='est'&&/^(zona|sec|per)$/.test(ov.v))||(c[0]==='prop'&&/^prop/.test(ov.v))?'on':'')+'">'+c[1]+'</button>').join('')+'</div></div>'}
function slot(k,role,sub,big){const p=op(k);return '<div class="oslot'+(big?' big':'')+(p&&p.n?'':' empty')+'" data-k="'+k+'" data-r="'+esc(role)+'"><div class="orole">'+esc(role)+'</div><div class="oname">'+(p&&p.n?esc(p.n):'Sin asignar · toca para agregar')+'</div>'+(sub?'<div class="osub">'+sub+'</div>':'')+'</div>'}
function rBot(){const box=$('mbox');let h='';const v=ov.v;
 if(v==='est'){const t=orgTot(),tot=t.dir[0]+t.zon[0]+t.sec[0]+t.rg[0],need=t.dir[1]+t.zon[1]+t.sec[1]+t.rg[1];
  h=botHead('Soy <b>Davidsito</b>, asistente de campaña. Esta es la estructura del Distrito 02.')+
  '<div class="card"><div class="row" style="justify-content:space-between"><b>Puestos de mando cubiertos</b><span>'+frac(tot,need)+'</span></div>'+pbar(tot,need)+
  '<div class="ogrid3"><div><div class="mut">Promotores (1×10)</div>'+frac(t.pro[0],t.pro[1])+pbar(t.pro[0],t.pro[1],'var(--ok)')+'</div><div><div class="mut">Repres. de casilla</div>'+frac(t.rc[0],t.rc[1])+pbar(t.rc[0],t.rc[1],'#b3261e')+'</div><div><div class="mut">Seccionales</div>'+frac(t.sec[0],t.sec[1])+pbar(t.sec[0],t.sec[1])+'</div></div></div>'+
  '<h3>Dirección</h3><div class="otree"><div class="oslot big cand"><div class="orole">Candidato · Diputación local DL02</div><div class="oname">David de la Peña</div><div class="osub">PRI · Fuerza y Corazón por Nuevo León · propietario</div></div><div class="oline"></div>'+slot('sup','Diputado(a) suplente','Fórmula con David de la Peña',true)+'<div class="oline"></div>'+slot('cg','Coordinación general','',true)+'<div class="oline"></div>'+
  '<div class="ogrid">'+AREAS.slice(1).map(a=>slot(a[0],a[1],a[2])).join('')+'</div></div>'+
  '<h3>Territorio · 4 zonas</h3><div class="mut">Cada zona → coordinadores seccionales → promotores. Meta de promotores: 1 por cada 10 votos de la meta.</div>'+
  ZN.map(z=>{let sc=0,pr=0,pn=0;z.secs.forEach(s=>{if(has('s'+s))sc++;pn+=prNeed(s);pr+=Math.min(oc('pr'+s),prNeed(s))});const zc=op('z'+z.i);
   return '<div class="card ozona" data-z="'+z.i+'"><div class="row" style="justify-content:space-between"><b>Zona '+(z.i+1)+' · '+esc(z.n)+'</b><span class="mut">›</span></div><div class="mut">'+z.secs.length+' secciones · '+fmt(z.ln)+' electores · meta '+fmt(z.meta)+' votos · '+z.cas+' casillas</div>'+
   '<div style="margin:6px 0 2px">👤 '+(zc&&zc.n?esc(zc.n):'<span class="warn">Coordinador de zona sin asignar</span>')+'</div>'+
   '<div class="ogrid2"><div><span class="mut">Seccionales</span> '+frac(sc,z.secs.length)+pbar(sc,z.secs.length)+'</div><div><span class="mut">Promotores</span> '+frac(pr,pn)+pbar(pr,pn,'var(--ok)')+'</div></div></div>'}).join('')+
  '<h3>Defensa del voto · Día D 6 de junio</h3><div class="card"><div class="mut">'+fmt(ZN.reduce((a,z)=>a+z.cas,0))+' casillas en el distrito. Un representante general por cada 10 casillas y dos representantes (propietario y suplente) por casilla.</div>'+
  '<div class="ogrid2" style="margin-top:6px"><div><span class="mut">Generales</span> '+frac(t.rg[0],t.rg[1])+pbar(t.rg[0],t.rg[1],'#b3261e')+'</div><div><span class="mut">De casilla</span> '+frac(t.rc[0],t.rc[1])+pbar(t.rc[0],t.rc[1],'#b3261e')+'</div></div><div class="mut" style="margin-top:6px">Los generales se asignan dentro de cada zona; los de casilla, en cada sección.</div></div>'+
  '<button class="btn sec" id="ocsv">📤 Compartir estructura (CSV)</button>'}
 else if(v==='zona'){const z=ZN[ov.z];
  h=botHead('Zona '+(z.i+1)+' · <b>'+esc(z.n)+'</b>. Toca una sección para asignar seccional, promotores y representantes.')+'<button class="btn sec sm" id="oback">‹ Estructura</button>'+
  slot('z'+z.i,'Coordinación de zona',z.secs.length+' secciones · meta '+fmt(z.meta)+' votos',true)+
  '<h3>Representantes generales ('+z.rg+')</h3><div class="ogrid">'+Array.from({length:z.rg},(_,j)=>slot('rg'+z.i+'_'+j,'Rep. general '+(j+1),'')).join('')+'</div>'+
  '<h3>Secciones</h3>'+z.secs.map(s=>{const x=SB[s],p=op('s'+s),pn=prNeed(s),rn=rcNeed(s);
   return '<div class="item osec" data-s="'+s+'"><span class="sem" style="background:'+CAT[x.cat].c+';flex:none"></span><div style="flex:1;min-width:0"><div class="t">'+pad(s)+' · '+(p&&p.n?esc(p.n):'<span class="warn">sin seccional</span>')+'</div><div class="m">Promotores '+Math.min(oc('pr'+s),pn)+'/'+pn+' · Casilla '+Math.min(oc('rc'+s),rn)+'/'+rn+' · meta '+fmt(x.meta)+'</div>'+pbar(Math.min(oc('pr'+s),pn),pn,'var(--ok)')+'</div></div>'}).join('')}
 else if(v==='sec'){const s=ov.s,x=SB[s],p=op('s'+s)||{},z=zoneOf(s);
  h=botHead('Sección <b>'+pad(s)+'</b> · '+CAT[x.cat].n+'. '+esc((x.col||'').split(',').slice(0,2).join(','))+'.')+'<button class="btn sec sm" id="oback">‹ '+(z?'Zona '+(z.i+1):'Estructura')+'</button>'+
  '<div class="card"><div class="ogrid2"><div><div class="mut">Electores</div><b>'+fmt(x.ln)+'</b></div><div><div class="mut">Meta 2027</div><b>'+fmt(x.meta)+'</b> votos</div><div><div class="mut">Casillas</div><b>'+casOf(s)+'</b></div><div><div class="mut">Por sumar vs 2024</div><b>+'+fmt(x.delta)+'</b></div></div></div>'+
  '<h3>Coordinador(a) seccional</h3><input id="on" placeholder="Nombre" value="'+esc(p.n||'')+'"><input id="ot" type="tel" inputmode="tel" placeholder="Teléfono (10 dígitos)" value="'+esc(p.t||'')+'">'+(p.t?'<a class="btn sec sm" target="_blank" rel="noopener" href="https://wa.me/52'+String(p.t).replace(/\D/g,'').slice(-10)+'">💬 WhatsApp</a>':'')+
  ctr('pr'+s,'Promotores registrados',prNeed(s),'1 promotor por cada 10 votos de la meta')+ctr('rc'+s,'Representantes de casilla',rcNeed(s),casOf(s)+' casillas × 2 (propietario y suplente)')+
  '<div class="row" style="margin-top:10px"><button class="btn" id="osave">Guardar</button><button class="btn sec" id="omap">🗺️ Ver en mapa</button></div>'}
 else if(v==='per'){const p=op(ov.k)||{};
  h=botHead('<b>'+esc(ov.r)+'</b>. Anota quién es responsable y su teléfono.')+'<button class="btn sec sm" id="oback">‹ Volver</button>'+
  '<input id="on" placeholder="Nombre" value="'+esc(p.n||'')+'"><input id="ot" type="tel" inputmode="tel" placeholder="Teléfono (10 dígitos)" value="'+esc(p.t||'')+'"><textarea id="onote" rows="2" placeholder="Notas (opcional)">'+esc(p.x||'')+'</textarea>'+
  (p.t?'<a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/52'+String(p.t).replace(/\D/g,'').slice(-10)+'">💬 WhatsApp</a>':'')+
  '<div class="row"><button class="btn" id="osave">Guardar</button>'+(p.n?'<button class="btn sec" id="odel">Quitar</button>':'')+'</div>'}
 else if(v==='hoy'){const t=todayIso(),dt=DAYS.filter(d=>d.fecha===t),mt=MERC.find(m=>m.fecha===t),first=DAYS[0].fecha;let m;
  if(dt.length)m='Hoy tocan <b>'+dt.length+' recorridos</b>: '+dt.map(d=>d.turno.toLowerCase()+' en '+d.secs.map(pad).join(', ')).join(' y ')+'.';
  else if(mt)m='Hoy es <b>domingo de mercadito</b>: '+mt.cols.slice(0,2).join(' y ')+'.';
  else if(t<first){const n=daysTo(first);m='Faltan <b>'+n+' días</b> para arrancar recorridos (lunes 5 de abril 2027). El Día D es en '+daysTo('2027-06-06')+' días.'}
  else if(t<'2027-06-06'&&t>DAYS[DAYS.length-1].fecha)m='Veda electoral. No hay actos de campaña; revisa la defensa del voto.';
  else if(t==='2027-06-06')m='¡Hoy es el <b>Día D</b>! Que no falte ningún representante en las casillas.';else m='Hoy no hay recorrido programado.';
  const late=DAYS.filter(d=>d.fecha<t&&!dd(d).done).length;if(late)m+=' Hay <b>'+late+'</b> atrasados.';const FA=fzAlerts();if(FA.length)m+=' En fiscalización hay <b>'+FA.length+'</b> pendiente'+(FA.length>1?'s':'')+': '+esc(FA[0].t)+'.';
  h=botHead(m)+'<button class="btn" id="ogohoy">📍 Abrir lo de hoy</button>'}
 else if(v==='metas'){const L=Object.values(SB),M=L.reduce((a,x)=>a+x.meta,0),Dl=L.reduce((a,x)=>a+x.delta,0),ln=L.reduce((a,x)=>a+x.ln,0),top=L.slice().sort((a,b)=>b.delta-a.delta).slice(0,8);
  h=botHead('La meta es <b>'+fmt(M)+' votos</b> en las '+L.length+' secciones: <b>+'+fmt(Dl)+'</b> más que en 2024. Estas son las secciones donde más votos hay que sumar:')+
  '<div class="card"><div class="ogrid3"><div><div class="mut">Electores</div><b>'+fmt(ln)+'</b></div><div><div class="mut">Meta</div><b>'+fmt(M)+'</b></div><div><div class="mut">Por sumar</div><b>+'+fmt(Dl)+'</b></div></div></div>'+
  top.map(x=>'<div class="item osec" data-s="'+x.s+'"><span class="sem" style="background:'+CAT[x.cat].c+';flex:none"></span><div><div class="t">'+pad(x.s)+' · +'+fmt(x.delta)+' votos</div><div class="m">meta '+fmt(x.meta)+' · '+esc((x.col||'').split(',')[0])+'</div></div></div>').join('')}
 else if(v==='pet'){const p=S.caps.filter(c=>c.k==='Petición'),n=st=>p.filter(c=>c.st===st).length,urg=p.filter(c=>c.urg==='urgente'&&c.st!=='res').length;
  h=botHead(p.length?'Llevamos <b>'+p.length+'</b> gestorías: '+n('pend')+' pendientes, '+n('gest')+' en gestión y '+n('res')+' resueltas'+(urg?'. <b class="warn">'+urg+' urgentes</b> sin resolver.':'.'):'Todavía no hay gestorías. Se levantan con el botón ＋ Gestoría en el mapa o durante el recorrido.')+
  '<button class="btn" id="ogopet">🙋 Ver gestorías</button>'+(has('a_ges')?'<div class="mut">Responsable de gestión: '+esc(op('a_ges').n)+'</div>':'')}
 else if(v==='prop'){h=botHead('Estas son las <b>propuestas de David</b> para el Distrito 02. Toca una para ver el argumento completo y la frase para la puerta.')+S.props.map((pr,i)=>{const st=propStats(pr);return '<div class="card oprop" data-i="'+i+'" style="cursor:pointer"><div class="row" style="gap:10px;align-items:flex-start"><div style="font-size:30px;line-height:1">'+esc(pr.ico)+'</div><div style="flex:1"><b style="font-size:17px">'+esc(pr.t)+'</b><div class="mut" style="margin-top:3px">“'+esc(pr.f)+'”</div>'+(st.n?'<div style="margin-top:4px;font-size:13px;font-weight:600;color:var(--acc)">🙋 '+st.n+' gestoría'+(st.n>1?'s':'')+' de este tema</div>':'')+'</div><span class="mut">›</span></div></div>'}).join('')+'<div class="row"><button class="btn sec" id="opadd">＋ Agregar propuesta</button><button class="btn sec" id="opall">💬 Compartir todas</button></div>'}
 else if(v==='propd'){const pr=S.props[ov.i],st=propStats(pr);h=botHead(esc(pr.ico)+' <b>'+esc(pr.t)+'</b>')+'<button class="btn sec sm" id="oback">‹ Propuestas</button>'+
  '<div class="card" style="background:var(--accbg);border-color:transparent"><div class="mut" style="font-size:12px;font-weight:700">FRASE PARA LA PUERTA</div><div style="font-size:17px;font-weight:700;margin-top:3px">“'+esc(pr.f)+'”</div></div>'+
  '<h3>El problema</h3><p>'+esc(pr.p)+'</p><h3>Lo que propone</h3>'+pr.b.map((x,k)=>'<div style="display:flex;flex-wrap:nowrap;gap:10px;align-items:flex-start;margin:8px 0"><b style="flex:none;margin-top:1px;width:24px;height:24px;border-radius:12px;background:var(--acc);color:var(--card);display:flex;align-items:center;justify-content:center;font-size:13px">'+(k+1)+'</b><div style="flex:1;min-width:0">'+esc(x)+'</div></div>').join('')+
  '<h3>Cómo lo hará como diputado local</h3><p>'+esc(pr.c)+'</p>'+(st.n?'<h3>Lo que dice la calle</h3><div class="card">🙋 <b>'+st.n+'</b> gestoría'+(st.n>1?'s':'')+' registradas de este tema'+(st.top.length?'<div class="mut">Secciones con más: '+st.top.map(t=>pad(t[0])+' ('+t[1]+')').join(', ')+'</div>':'')+'</div>':'')+
  '<div class="row"><a class="btn" style="background:#25d366" target="_blank" rel="noopener" href="https://wa.me/?text='+encodeURIComponent(propText(pr))+'">💬 Compartir</a><button class="btn sec" id="opedit">✏️ Editar</button></div>'}
 else if(v==='prope'){const pr=ov.i==null?{ico:'📌',t:'',f:'',p:'',b:['','',''],c:'',cats:null}:S.props[ov.i];h=botHead(ov.i==null?'Nueva propuesta':'Editar propuesta')+'<button class="btn sec sm" id="oback">‹ Volver</button>'+
  '<div class="row" style="gap:6px"><input id="pico" value="'+esc(pr.ico)+'" style="flex:none;width:60px;text-align:center;font-size:22px"><input id="pt" placeholder="Título" value="'+esc(pr.t)+'" style="flex:1"></div><textarea id="pf" rows="2" placeholder="Frase corta para la puerta">'+esc(pr.f)+'</textarea><textarea id="pp" rows="4" placeholder="El problema (con datos)">'+esc(pr.p)+'</textarea>'+
  [0,1,2].map(k=>'<textarea id="pb'+k+'" rows="2" placeholder="Propuesta '+(k+1)+'">'+esc(pr.b[k]||'')+'</textarea>').join('')+'<textarea id="pc" rows="3" placeholder="Cómo lo hará como diputado local">'+esc(pr.c)+'</textarea>'+
  '<button class="btn" id="psave">Guardar</button>'+(ov.i!=null?'<button class="btn sec" id="pdel" style="color:#b3261e">Borrar propuesta</button>':'')+'<button class="btn sec" id="preset">Restaurar las 3 propuestas originales</button>'}
 else if(v==='bus'){h=botHead('Escribe el número de sección o el nombre de una colonia.')+'<input id="oq" inputmode="search" placeholder="Ej. 1012 o Mitras" value="'+esc(ov.q||'')+'"><div id="oqr"></div>'}
 box.innerHTML=h+'<button class="btn sec" id="obotclose" style="margin-top:14px">Cerrar</button>';box.scrollTop=0;if(box._v!==v){if(box._v)animIn(box,'inF');box._v=v}bindBot()}
function ctr(k,label,need,hint){return '<h3>'+label+'</h3><div class="row octr"><button class="btn sec" data-c="'+k+'" data-d="-1">−</button><input id="c_'+k+'" type="number" min="0" inputmode="numeric" value="'+oc(k)+'"><button class="btn sec" data-c="'+k+'" data-d="1">＋</button><span class="mut">de '+need+'</span></div><div class="mut">'+hint+'</div>'}
function bindBot(){const box=$('mbox'),q=(sel,f)=>box.querySelectorAll(sel).forEach(f);
 $('obotclose').onclick=()=>{$('modal').style.display='none'};
 q('.chips button',b=>b.onclick=()=>{const v=b.dataset.v;if(v==='dd'||v==='ag'){$('modal').style.display='none';if(v==='dd'){ddv='tab';tab='dd'}else{agSeg='ev';evFil='prox';tab='cal'}render();return}ov={v};rBot()});
 q('.oslot[data-k]',e=>e.onclick=()=>{ov={v:'per',k:e.dataset.k,r:e.dataset.r,back:ov};rBot()});
 q('.ozona',e=>e.onclick=()=>{ov={v:'zona',z:+e.dataset.z};rBot()});
 q('.osec',e=>e.onclick=()=>{ov={v:'sec',s:+e.dataset.s,back:ov};rBot()});
 q('[data-c]',b=>b.onclick=()=>{const i=$('c_'+b.dataset.c);i.value=Math.max(0,(+i.value||0)+(+b.dataset.d))});
 const bk=$('oback');if(bk)bk.onclick=()=>{ov=ov.back||(ov.v==='sec'&&zoneOf(ov.s)?{v:'zona',z:zoneOf(ov.s).i}:{v:'est'});rBot()};
 q('.oprop',e=>e.onclick=()=>{ov={v:'propd',i:+e.dataset.i,back:{v:'prop'}};rBot()});
 const opa=$('opadd');if(opa)opa.onclick=()=>{ov={v:'prope',i:null,back:{v:'prop'}};rBot()};
 const opl=$('opall');if(opl)opl.onclick=()=>openLink('https://wa.me/?text='+encodeURIComponent('Propuestas de David de la Peña · Distrito 02\n\n'+S.props.map(propText).join('\n\n———\n\n')));
 const ope=$('opedit');if(ope)ope.onclick=()=>{ov={v:'prope',i:ov.i,back:{v:'propd',i:ov.i,back:{v:'prop'}}};rBot()};
 const ps=$('psave');if(ps)ps.onclick=()=>{const t=$('pt').value.trim();if(!t){toast('Ponle título');return}const o={ico:$('pico').value.trim()||'📌',t,f:$('pf').value.trim(),p:$('pp').value.trim(),b:[0,1,2].map(k=>$('pb'+k).value.trim()).filter(Boolean),c:$('pc').value.trim()};if(ov.i==null){o.id='p'+Date.now();o.cats=null;S.props.push(o);ov={v:'propd',i:S.props.length-1,back:{v:'prop'}}}else{Object.assign(S.props[ov.i],o);ov={v:'propd',i:ov.i,back:{v:'prop'}}}save(true);toast('✅ Propuesta guardada');rBot()};
 const pd=$('pdel');if(pd)pd.onclick=()=>{if(!confirm('¿Borrar esta propuesta?'))return;S.props.splice(ov.i,1);save(true);ov={v:'prop'};rBot()};
 const pr_=$('preset');if(pr_)pr_.onclick=()=>{if(!confirm('¿Restaurar las 3 propuestas originales? Se pierden tus cambios.'))return;S.props=JSON.parse(JSON.stringify(PROP0));save(true);ov={v:'prop'};rBot()};
 const sv=$('osave');if(sv)sv.onclick=()=>{const n=$('on').value.trim(),t=$('ot').value.trim(),k=ov.v==='sec'?'s'+ov.s:ov.k;
  if(n||t)S.org.p[k]={n,t,x:$('onote')?$('onote').value.trim():''};else delete S.org.p[k];
  if(ov.v==='sec')['pr','rc'].forEach(c=>{const i=$('c_'+c+ov.s);if(i)S.org.c[c+ov.s]=Math.max(0,+i.value||0)});
  save(true);toast('✅ Guardado');ov=ov.back||(ov.v==='sec'&&zoneOf(ov.s)?{v:'zona',z:zoneOf(ov.s).i}:{v:'est'});rBot()};
 const dl=$('odel');if(dl)dl.onclick=()=>{delete S.org.p[ov.k];save(true);ov=ov.back||{v:'est'};rBot()};
 const mp=$('omap');if(mp)mp.onclick=()=>{const x=SB[ov.s];$('modal').style.display='none';sel=x;fitBounds(x.rings[0],.3);showPop(x);reqDraw()};
 const gh=$('ogohoy');if(gh)gh.onclick=()=>{$('modal').style.display='none';goHome()};
 const gp=$('ogopet');if(gp)gp.onclick=()=>{$('modal').style.display='none';tab='cap';render()};
 const cs=$('ocsv');if(cs)cs.onclick=orgCsv;
 const oq=$('oq');if(oq){const go=()=>{const v=oq.value.trim().toUpperCase();ov.q=oq.value;const r=v.length<2?[]:Object.values(SB).filter(x=>pad(x.s).indexOf(v)>=0||(x.col||'').toUpperCase().indexOf(v)>=0).slice(0,20);
  $('oqr').innerHTML=r.map(x=>{const p=op('s'+x.s);return '<div class="item osec" data-s="'+x.s+'"><span class="sem" style="background:'+CAT[x.cat].c+';flex:none"></span><div><div class="t">'+pad(x.s)+' · '+(p&&p.n?esc(p.n):'sin seccional')+'</div><div class="m">'+esc((x.col||'').split(',').slice(0,3).join(','))+'</div></div></div>'}).join('')||(v.length>=2?'<p class="mut">Sin resultados.</p>':'');
  $('oqr').querySelectorAll('.osec').forEach(e=>e.onclick=()=>{ov={v:'sec',s:+e.dataset.s,back:{v:'bus',q:oq.value}};rBot()})};oq.oninput=go;go();setTimeout(()=>oq.focus(),50)}}
function orgCsv(){const rows=[['Nivel','Zona','Seccion','Puesto','Nombre','Telefono','Registrados','Requeridos']],P=(k)=>op(k)||{};
 rows.push(['Direccion','','','Candidato propietario','David de la Peña','','','']);rows.push(['Direccion','','','Diputado(a) suplente',P('sup').n||'',P('sup').t||'','','']);AREAS.forEach(a=>rows.push(['Direccion','','',a[1],P(a[0]).n||'',P(a[0]).t||'','','']));
 ZN.forEach(z=>{rows.push(['Zona',z.n,'','Coordinacion de zona',P('z'+z.i).n||'',P('z'+z.i).t||'','','']);for(let j=0;j<z.rg;j++)rows.push(['Defensa del voto',z.n,'','Representante general '+(j+1),P('rg'+z.i+'_'+j).n||'',P('rg'+z.i+'_'+j).t||'','','']);
  z.secs.forEach(s=>{rows.push(['Seccion',z.n,pad(s),'Coordinacion seccional',P('s'+s).n||'',P('s'+s).t||'','','']);rows.push(['Seccion',z.n,pad(s),'Promotores','','',oc('pr'+s),prNeed(s)]);rows.push(['Seccion',z.n,pad(s),'Representantes de casilla','','',oc('rc'+s),rcNeed(s)])})});
 shareFile('estructura_DL02.csv','﻿'+rows.map(r=>r.map(c=>'"'+String(c).replace(/"/g,'""')+'"').join(',')).join('\n'),'text/csv')}
(function(){const b=$('dvbot');if(!b)return;b.innerHTML=DVSVG+'<span id="dvbub">¡Hola! Toca para ver la estructura</span>';b.onclick=()=>openBot();
 const obs=new MutationObserver(()=>{if($('modal').style.display!=='flex')$('mbox').classList.remove('orgbox')});obs.observe($('modal'),{attributes:true,attributeFilter:['style']});
 if(!S.org.seen)setTimeout(()=>{const u=$('dvbub');if(u){u.style.display='block';setTimeout(()=>u.style.display='none',6000)}},1500)})();

(function(){const close=()=>{$('modal').style.display='none'};$('mclose').onclick=close;$('pclose').onclick=e=>{e.stopPropagation();$('photo').style.display='none'};
 document.addEventListener('keydown',e=>{if(e.key!=='Escape')return;if($('photo').style.display&&$('photo').style.display!=='none'){$('photo').style.display='none'}else if($('modal').style.display==='flex'){close()}else if($('pop').style.display==='block'){$('pop').style.display='none'}})})();

/* hoja de abajo arrastrable (iPhone); el mapa no se estira mientras se mueve */
(function(){const mq=matchMedia('(max-width:999px) and (min-height:501px)'),side=$('side'),app=$('app');if(!side)return;
 const g=document.createElement('div');g.id='grab';g.setAttribute('aria-label','Arrastra para ver más o menos mapa');side.insertBefore(g,side.firstChild);
 const pts=()=>{const H_=app.clientHeight,t=$('tabs').offsetHeight;return {min:t+26,mid:Math.round(H_*.55),max:H_-110}};
 let st=(S.prefs&&S.prefs.sheet)||'mid',tmr=0,frozen=false;
 const recenter=nh=>{const c=unproj(W/2,nh/2);view.lon=c[0];view.lat=c[1]};
 const freeze=()=>{const hf=app.clientHeight;if(frozen&&cv.clientHeight===hf)return;cv.style.bottom='auto';cv.style.height=hf+'px';recenter(hf);frozen=true;resize()};
 const settle=()=>{cv.style.height='';cv.style.bottom='';const nh=cv.clientHeight;if(nh&&nh!==H){recenter(nh)}frozen=false;resize()};
 const apply=(h,anim)=>{clearTimeout(tmr);if(anim){freeze();side.style.transition='height .26s cubic-bezier(.2,.8,.2,1)';side.style.height=h+'px';tmr=setTimeout(settle,300)}else{side.style.transition='none';side.style.height=h+'px';settle()}};
 const snap=s=>{st=s;S.prefs.sheet=s;save();side.classList.toggle('sheetmin',s==='min');document.body.classList.toggle('sheetmax',s==='max'&&mq.matches);if(mq.matches)apply(pts()[s],true)};
 const set=()=>{document.body.classList.toggle('sheetmax',st==='max'&&mq.matches);if(mq.matches){side.classList.toggle('sheetmin',st==='min');apply(pts()[st],false)}else{side.style.height='';side.classList.remove('sheetmin');settle()}};
 let y0=null,h0=0,moved=false,t0=0;
 const down=e=>{if(!mq.matches)return;y0=e.clientY;h0=side.offsetHeight;moved=false;t0=Date.now();side.style.transition='none';clearTimeout(tmr);freeze()};
 const move=e=>{if(y0==null)return;const d=y0-e.clientY;if(Math.abs(d)>4)moved=true;const P=pts();if(side.classList.contains('sheetmin')&&d>4)side.classList.remove('sheetmin');side.style.height=Math.max(P.min,Math.min(P.max,h0+d))+'px';if(e.cancelable)e.preventDefault()};
 const up=e=>{if(y0==null)return;const P=pts(),h=side.offsetHeight,dt=Date.now()-t0;y0=null;
  if(!moved){snap(st==='min'?'mid':st==='mid'?'min':'mid');return}
  const v=(h-h0)/Math.max(1,dt);let s;if(Math.abs(v)>.6)s=v>0?(h0<P.mid-10?'mid':'max'):(h0>P.mid+10?'mid':'min');else s=['min','mid','max'].reduce((a,b)=>Math.abs(P[b]-h)<Math.abs(P[a]-h)?b:a);snap(s)};
 g.addEventListener('pointerdown',e=>{try{g.setPointerCapture(e.pointerId)}catch(_){}down(e)});g.addEventListener('pointermove',move);g.addEventListener('pointerup',up);g.addEventListener('pointercancel',up);
 document.querySelectorAll('#tabs button').forEach(b=>b.addEventListener('click',()=>{if(st==='min'&&mq.matches)snap('mid')}));
 addEventListener('resize',()=>setTimeout(set,80));window.__sheet=snap;set()})();
/* aviso de estado del mapa: se desvanece solo */
(function(){const g=$('gst');if(!g)return;let t=0;const show=()=>{g.style.opacity=1;clearTimeout(t);t=setTimeout(()=>g.style.opacity=0,4500)};new MutationObserver(show).observe(g,{childList:true,characterData:true,subtree:true});show()})();
/* transiciones */
const RM=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
let _mcT=0;
function closeModal(){const m=$('modal'),b=$('mbox');if(m.style.display!=='flex')return;if(RM()){m.style.display='none';return}
 const ref=b.firstElementChild;m.classList.add('closing');clearTimeout(_mcT);_mcT=setTimeout(()=>{m.classList.remove('closing');if(b.firstElementChild===ref)m.style.display='none'},220)}
new MutationObserver(()=>{const m=$('modal');if(m.classList.contains('closing')){clearTimeout(_mcT);m.classList.remove('closing');m.style.display='flex'}}).observe($('mbox'),{childList:true});
const TORD=['hoy','cal','dd','av','cap','mas'];let _lt=null,_lc=null;
function animIn(el,cls){if(RM())return;el.classList.remove('inR','inL','inF');void el.offsetWidth;el.classList.add(cls)}
function tabAnim(){let c=null;if(_lt!==null&&_lt!==tab)c=TORD.indexOf(tab)>TORD.indexOf(_lt)?'inR':'inL';else if(_lt===tab&&tab==='hoy'&&_lc!==cur)c=cur?'inR':'inL';_lt=tab;_lc=cur;if(c)animIn(panel,c)}

/* Davidsito se esconde mientras la tarjeta de sección está abierta */
(function(){const p=$('pop');if(!p)return;new MutationObserver(()=>document.body.classList.toggle('popopen',p.style.display==='block')).observe(p,{attributes:true,attributeFilter:['style']})})();
/* ===== Propuestas del candidato ===== */
const PROP0=[
 {id:'agua',ico:'💧',t:'Agua sin sorpresas',f:'Si te quedas sin agua, que te avisen, que te manden pipa y que no te cobren ese día.',
  p:'Desde la crisis de 2022 los cortes y la baja presión no se han ido: Agua y Drenaje ha reportado más de 100 colonias del área metropolitana afectadas en un mismo día (116 y 128 colonias en reportes de 2025-2026). Las familias se enteran cuando abren la llave.',
  b:['Aviso obligatorio con 48 horas de anticipación de cada corte programado, por colonia, por WhatsApp o SMS.','Si un corte pasa de 24 horas: pipa garantizada en menos de 12 horas y descuento automático en el recibo por cada día sin agua.','Tablero público por colonia con las horas sin servicio al mes, e informe trimestral de Agua y Drenaje ante el Congreso.'],
  c:'Iniciativa de reforma a la legislación estatal de agua que rige a Agua y Drenaje (organismo del Estado), y vigilancia de su presupuesto desde el Congreso. Es competencia directa de un diputado local.',
  cats:['Agua','Drenaje']},
 {id:'luz',ico:'💡',t:'Luz en cada calle, colonias seguras',f:'Una calle iluminada es una calle más segura: lámpara reportada, lámpara reparada en 48 horas.',
  p:'El municipio ha reconocido más de 18 mil luminarias fuera de servicio en Monterrey, cerca de 1 de cada 5, y el 56.8% de los regios considera insuficiente el alumbrado (ENSU-INEGI). Las denuncias por robo a personas en Monterrey subieron de 382 a 712 de enero a septiembre de 2026, según datos de la Fiscalía citados en prensa. El contrato de alumbrado de la ciudad vence en febrero de 2027.',
  b:['Que el nuevo contrato de alumbrado obligue a reparar en 48 horas, con mapa público de lámparas apagadas y penalizaciones automáticas si no se cumple.','Senderos seguros: calles iluminadas y con cámaras conectadas al C5 entre paradas de camión, escuelas y colonias del distrito.','Recursos estatales etiquetados para alumbrado y cámaras en las secciones con más reportes de inseguridad y falta de luz.'],
  c:'Iniciativa para que toda concesión municipal de servicios publique sus indicadores de cumplimiento, gestión de presupuesto estatal para seguridad en el distrito y coordinación con el municipio y con Fuerza Civil.',
  cats:['Alumbrado','Seguridad']},
 {id:'cerca',ico:'🤝',t:'Tu diputado en tu colonia',f:'No me vas a ver solo en campaña: un sábado al mes estaré en tu zona, y cada gestoría lleva folio y respuesta.',
  p:'En 2024 votó el 56% del padrón del distrito (115,302 de 205,409 electores): casi la mitad no fue a votar. Y el distrito está dividido en tercios: Fuerza y Corazón 27.8%, Morena y PVEM 24.0% y MC 23.5%. La gente siente que a los diputados solo se les ve en campaña.',
  b:['Módulo de gestoría itinerante: un sábado al mes en cada una de las 4 zonas del distrito.','Cada gestoría con folio y respuesta en un máximo de 30 días, con seguimiento por WhatsApp.','Informe público cada 3 meses, colonia por colonia: qué se pidió, qué se resolvió y cómo votó en el Congreso.'],
  c:'Compromiso firmado de campaña que se opera desde la casa de gestión del diputado. Esta misma app ya lleva el registro y seguimiento de gestorías.',
  cats:null}];
if(!S.props)S.props=JSON.parse(JSON.stringify(PROP0));
function propStats(pr){const G=S.caps.filter(c=>c.k==='Petición'&&!c.test&&(!pr.cats||pr.cats.includes(c.cat)));const bs={};G.forEach(c=>{if(c.sec)bs[c.sec]=(bs[c.sec]||0)+1});return {n:G.length,top:Object.entries(bs).sort((a,b)=>b[1]-a[1]).slice(0,3)}}
function propText(pr){return pr.ico+' '+pr.t+'\n\n"'+pr.f+'"\n\nEl problema: '+pr.p+'\n\nLo que propone David de la Peña:\n'+pr.b.map((x,i)=>(i+1)+'. '+x).join('\n')+'\n\nCómo lo va a hacer: '+pr.c}

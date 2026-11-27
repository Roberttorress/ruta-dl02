/* ===== Fiscalización aparte: Eventos y SIF, Gastos y tope, Ajustes · solo candidato (C1) y administradores (C2) ===== */
function fzBoss(){const u=curUser();if(!u)return !S.users.some(x=>x.on&&x.pin);return u.rol==='c1'||u.rol==='c2'}
agSegH=function(){if(agSeg==='rec')return '<h1>Agenda</h1>';
 return '<h1>Fiscalización</h1><div class="mut" style="margin:-4px 0 8px">🔒 Solo candidato y administradores</div><div class="chips">'+[['ev','📅 Eventos y SIF'],['g','💰 Gastos y tope'],['cfg','⚙️ Ajustes']].map(a=>'<button data-ag="'+a[0]+'" class="'+(agSeg===a[0]?'on':'')+'">'+a[1]+'</button>').join('')+'</div>'};
const _rAg9=rAg;rAg=function(){if(agSeg!=='rec'&&!fzBoss())agSeg='rec';_rAg9()};
function openFis(seg){if(!fzBoss())return;agSeg=seg||'ev';evFil='prox';tab='cal';render()}
/* el botón Agenda de abajo siempre abre Recorridos */
document.addEventListener('click',e=>{const b=e.target.closest&&e.target.closest('#tabs button[data-t="cal"]');if(b)agSeg='rec'},true);
/* acceso desde Más */
const _rMas9=rMas;rMas=function(){_rMas9();if(!fzBoss())return;const m=document.getElementById('mmae');const b=document.createElement('button');b.className='btn sec';b.id='mfis';b.textContent='🧾 Fiscalización: eventos SIF y gastos';b.onclick=()=>openFis('ev');
 if(m)m.after(b);else panel.prepend(b)};
/* permisos: tarjeta de fiscalización en Hoy y acceso desde el asistente, solo C1/C2 */
PRULES.push(['.fzhoy',()=>fzBoss()],['.chips [data-v=ag]',()=>fzBoss()]);

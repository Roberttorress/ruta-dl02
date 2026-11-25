import json, datetime as dt
OUT = '../out/'
# ---- 1. dates on the plan + sundays
days = json.load(open(OUT + 'calles_days40.json'))['days']
d0 = dt.date(2027, 4, 5); end = dt.date(2027, 6, 2); work = []; suns = []
d = d0
while d <= end:
    (suns if d.weekday() == 6 else work).append(d); d += dt.timedelta(1)
assert len(work) * 2 == len(days), (len(work), len(days))
for s in days:
    s['fecha'] = work[s['cal'] - 1].isoformat()
tab = {t['seccion']: t for t in json.load(open(OUT + 'dl02_ruta.json'))}
cbs = json.load(open(OUT + 'dl02_data.json'))['col_by_sec']
def col1(s): d_ = cbs.get(str(s), {}); return sorted(d_, key=lambda z: -d_[z])[0] if d_ else ''
merc = []
for sd in suns:
    wk = [s for s in days if sd < dt.date.fromisoformat(s['fecha']) <= sd + dt.timedelta(6)]
    secs = []
    for s in wk:
        for x in s['secs']:
            if x not in secs: secs.append(x)
    top = sorted(secs, key=lambda x: -tab[x]['ln'])[:4]
    merc.append({'fecha': sd.isoformat(), 'secs': top, 'cols': [col1(x) for x in top], 'f': wk[0]['f'] if wk else 3})
json.dump({'days': days, 'merc': merc}, open(OUT + 'calles_days40.json', 'w'), ensure_ascii=False)
print('mercaditos', [(m['fecha'], m['cols'][:2]) for m in merc])

# ---- 2. app builder
p = 'build_app2.py'; s = open(p).read()
def rep(old, new):
    global s
    assert old in s, old[:80]; s = s.replace(old, new, 1)
rep("days = json.load(open(OUT + 'calles_days2.json'))['days'];", "_P = json.load(open(OUT + 'calles_days40.json')); days = _P['days']; merc = _P['merc'];")
rep("    d['f'] = int(d['fase'][5]); del d['fase']", "    d.pop('fase', None); d.pop('grp', None)")
rep("const DAYS=__DAYS__;", "const DAYS=__DAYS__;const MERC=__MERC__;")
rep(".replace('__DAYS__', J(days))", ".replace('__DAYS__', J(days)).replace('__MERC__', J(merc))")
# date helpers
rep("function dateOfDay(cal){return ''}",
    "const fdate=(iso,o)=>new Date(iso+'T12:00:00').toLocaleDateString('es-MX',o||{weekday:'short',day:'numeric',month:'short'});const todayIso=()=>{const t=new Date();return t.getFullYear()+'-'+String(t.getMonth()+1).padStart(2,'0')+'-'+String(t.getDate()).padStart(2,'0')};const NCAL=Math.max(...DAYS.map(d=>d.cal));const DIAD='2027-06-06';const daysTo=iso=>Math.round((new Date(iso+'T12:00:00')-new Date(todayIso()+'T12:00:00'))/86400000);function diaDCard(){const n=daysTo(DIAD);return n<0?'':'<div class=\"card\" style=\"background:#b3261e;color:#fff;border:0\"><div style=\"font-size:13px;opacity:.85\">DÍA D · JORNADA ELECTORAL</div><div style=\"font-size:22px;font-weight:800\">'+(n===0?'¡Hoy se vota!':'Faltan '+n+' día'+(n===1?'':'s'))+'</div><div style=\"opacity:.9\">Domingo 6 de junio de 2027</div></div>'}")
# Hoy
i = s.index("function rHoy(){"); j = s.index("function dayCard(")
s = s[:i] + r'''function mercCard(m){return '<div class="card" style="border:2px solid var(--org)"><div style="font-size:20px;font-weight:800">🛒 Domingo de mercadito</div><div class="mut">'+fdate(m.fecha,{weekday:'long',day:'numeric',month:'long'})+'</div><p>Sin recorrido casa por casa. Presencia en el mercado rodante de la zona que se recorre esta semana:</p>'+m.secs.map((x,i)=>'<div><span class="sem" style="background:'+CAT[SB[x].cat].c+'"></span><b>'+pad(x)+'</b> '+m.cols[i]+'</div>').join('')+'<p class="mut">Aprovecha para anunciar los recorridos de la semana y levantar peticiones con el botón +.</p></div>'}
function rHoy(){const t=todayIso();let h='';const doneN=DAYS.filter(d=>dd(d).done).length;
 const first=DAYS[0].fecha<MERC[0].fecha?DAYS[0].fecha:MERC[0].fecha,last=DAYS.at(-1).fecha;
 const mt=MERC.find(m=>m.fecha===t),dt=DAYS.filter(d=>d.fecha===t);
 h=diaDCard()+'<div class="mut">'+doneN+' de '+DAYS.length+' recorridos hechos</div>';
 if(t<first){h+='<h1>Arranque: '+fdate(first,{weekday:'long',day:'numeric',month:'long'})+'</h1><p class="mut">Del 5 de abril al 2 de junio · 2 recorridos diarios de lunes a sábado · domingos de mercadito.</p>'+mercCard(MERC[0])+'<h2>Primer día de recorrido · '+fdate(DAYS[0].fecha,{weekday:'long',day:'numeric',month:'long'})+'</h2>';DAYS.filter(d=>d.cal===1).forEach(d=>h+=dayCard(d))}
 else if(mt){h+='<h1>Hoy</h1>'+mercCard(mt);const nx=DAYS.find(d=>d.fecha>t);if(nx){h+='<h2>Mañana · '+fdate(nx.fecha)+'</h2>';DAYS.filter(d=>d.cal===nx.cal).forEach(d=>h+=dayCard(d))}}
 else if(dt.length){h+='<h1>Hoy · Día '+dt[0].cal+' de '+NCAL+'</h1><div class="mut">'+fdate(t,{weekday:'long',day:'numeric',month:'long'})+'</div>';dt.forEach(d=>h+=dayCard(d))}
 else if(t>last)h+='<h1>'+(t===DIAD?'Día D':'Cierre de campaña')+'</h1><p class="mut">'+(t===DIAD?'Hoy es la jornada electoral: defensa del voto y representantes en las 343 casillas.':'Los recorridos terminaron el 2 de junio. Veda electoral del 3 al 5 de junio; la elección es el domingo 6.')+'</p>';
 const late=DAYS.filter(d=>d.fecha<t&&!dd(d).done);if(late.length&&t>=first)h+='<h2 style="color:#b3261e">Atrasados ('+late.length+')</h2><div class="mut">Recorridos de días anteriores sin marcar como hechos.</div>'+listHtml(late.slice(0,6));
 if(cur)h=curBlock()+h;panel.innerHTML=h;
 bindList();bindCur()}
''' + s[j:]
# list item: date + parte
rep("</span>Día '+d.cal+' · '+d.turno+'</div><div class=\"m\">'+d.secs.map(pad).join(', ')+' · '",
    "</span>'+fdate(d.fecha)+' · '+d.turno+'</div><div class=\"m\">'+(d.parte&&d.parte!=='1/1'?'parte '+d.parte+' · ':'')+d.secs.map(pad).join(', ')+' · '")
# calendar: by week with sundays
i = s.index("function rCal(){"); j = s.index("\n", i)
s = s[:i] + r'''function rCal(){let h=diaDCard()+'<h1>Calendario</h1><div class="mut">5 abr – 2 jun 2027 · '+NCAL+' días de recorrido (2 diarios) · '+MERC.length+' domingos de mercadito</div>';
 const done=DAYS.filter(d=>dd(d).done).length;h+='<div class="bar"><i style="width:'+Math.round(100*done/DAYS.length)+'%"></i></div><div class="mut">'+done+' de '+DAYS.length+' recorridos hechos</div>';
 [1,2,3].forEach(f=>{const l=DAYS.filter(d=>d.f===f);h+='<div style="margin-top:4px"><span class="sem" style="background:'+CM[f]+'"></span>'+FN[f]+': '+fdate(l[0].fecha,{day:'numeric',month:'short'})+' – '+fdate(l.at(-1).fecha,{day:'numeric',month:'short'})+'</div>'});
 const pre=DAYS.filter(d=>d.fecha<MERC[0].fecha);if(pre.length)h+='<h2>Primera semana</h2>'+listHtml(pre);
 MERC.forEach((m,i)=>{const nxt=MERC[i+1]?MERC[i+1].fecha:'9999';const wk=DAYS.filter(d=>d.fecha>m.fecha&&d.fecha<nxt);h+='<h2>Semana del '+fdate(m.fecha,{day:'numeric',month:'long'})+'</h2><div class="item" style="cursor:default"><div class="chk" style="border-color:var(--org)">🛒</div><div><div class="t">'+fdate(m.fecha)+' · Mercadito</div><div class="m">'+m.cols.slice(0,3).join(', ')+'</div></div></div>'+listHtml(wk)});
 h+='<h2>Cierre</h2><div class="item" style="cursor:default"><div class="chk" style="border-color:#999">⏸</div><div><div class="t">3 – 5 jun · Veda electoral</div><div class="m">Sin actos de campaña</div></div></div><div class="item" style="cursor:default;background:#b3261e14"><div class="chk" style="background:#b3261e;border-color:#b3261e">🗳</div><div><div class="t" style="color:#b3261e">Dom 6 jun · DÍA D</div><div class="m">Jornada electoral · defensa del voto en 343 casillas</div></div></div>';
 panel.innerHTML=h;bindList()}''' + s[j:]
rep("const low=DAYS.filter(d=>dd(d).done&&d.pct<60);if(low.length)h+='<h2>Hechos con baja cobertura (repetir)</h2>'+listHtml(low);",
    "const late=DAYS.filter(d=>d.fecha<todayIso()&&!dd(d).done);if(late.length)h+='<h2>Atrasados</h2>'+listHtml(late.slice(0,8));")
# curBlock title with date
rep("'</div><h2 style=\"margin:4px 0\">Día '+d.cal+' · '+d.turno+'</h2>", "'</div><h2 style=\"margin:4px 0\">'+fdate(d.fecha,{weekday:'long',day:'numeric',month:'short'})+' · '+d.turno+(d.parte&&d.parte!=='1/1'?' · parte '+d.parte:'')+'</h2>")
rep("Abre la app y verás el siguiente día pendiente (mañana y tarde).", "Abre la app y verás lo que toca hoy: los 2 recorridos (mañana y tarde) o, si es domingo, el mercadito. Los días sin marcar aparecen como atrasados.")
open(p, 'w').write(s); print('app patched')

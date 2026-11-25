import json, csv, math, sys
import openpyxl
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe
from matplotlib.patches import Patch
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill

RES = sys.argv[1]  # path to NL_DIP_LOC_2024.xlsx (untrusted data dir)
OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json'))
secs = D['secciones']; sec_rings = D['sec_rings_wgs']; outer = D['dl_rings_wgs'][D['outer']]
col_by_sec = D['col_by_sec']
def sec_cols(sec):
    d = col_by_sec.get(str(sec), {}); return ', '.join(sorted(d, key=lambda z: -d[z]))

wb = openpyxl.load_workbook(RES, read_only=True); ws = wb.worksheets[0]
rows = ws.iter_rows(values_only=True)
hdr = None
for r in rows:
    if r and r[0] and str(r[0]).strip() == 'CLAVE_CASILLA':
        hdr = [str(c).strip() if c else '' for c in r]; break
idx = {h: i for i, h in enumerate(hdr)}
parties = ['PAN', 'PRI', 'PRD', 'PVEM', 'PT', 'MC', 'MORENA', 'VIDA', 'ESO', 'PL', 'PES', 'PJ',
           'C_PAN_PRI_PRD', 'C_PAN_PRI', 'C_PAN_PRD', 'C_PRI_PRD', 'C_PVEM_MORENA', 'NO_REGISTRADAS', 'NULOS', 'TOTAL_VOTOS_CALCULADO', 'LISTA_NOMINAL']
agg = {s: {p: 0 for p in parties} | {'casillas': 0} for s in secs}
notcount = 0
for r in rows:
    if not r or r[idx['ID_DISTRITO_LOCAL']] != 2: continue
    try: s = int(r[idx['SECCION']])
    except: continue
    if s not in agg: continue
    if r[idx['CONTABILIZADA']] != 1: notcount += 1; continue
    a = agg[s]; a['casillas'] += 1
    for p in parties:
        v = r[idx[p]]
        try: a[p] += int(v or 0)
        except: pass
print('casillas no contabilizadas DL02:', notcount)

def fy(a): return a['PAN'] + a['PRI'] + a['PRD'] + a['C_PAN_PRI_PRD'] + a['C_PAN_PRI'] + a['C_PAN_PRD'] + a['C_PRI_PRD']
def shh(a): return a['MORENA'] + a['PVEM'] + a['C_PVEM_MORENA']
blocks = {'FyC (PAN-PRI-PRD)': fy, 'MC': lambda a: a['MC'], 'Morena-PVEM': shh, 'PT': lambda a: a['PT'], 'VIDA': lambda a: a['VIDA'],
          'Otros (ESO/PL/PES/PJ)': lambda a: a['ESO'] + a['PL'] + a['PES'] + a['PJ']}
COLORS = {'FyC (PAN-PRI-PRD)': '#1f5fbf', 'MC': '#f08a1d', 'Morena-PVEM': '#8b1a3a', 'PT': '#c62828', 'VIDA': '#2e7d32', 'Otros (ESO/PL/PES/PJ)': '#888'}

table = []
tot = {k: 0 for k in blocks} | {'nulos': 0, 'noreg': 0, 'total': 0, 'ln': 0, 'casillas': 0}
for s in secs:
    a = agg[s]; v = {k: f(a) for k, f in blocks.items()}
    total = a['TOTAL_VOTOS_CALCULADO']; ln = a['LISTA_NOMINAL']
    valid = sum(v.values())
    order = sorted(v, key=lambda k: -v[k])
    win, sec_ = order[0], order[1]
    margin = (v[win] - v[sec_]) / total * 100 if total else 0
    table.append({'seccion': s, **v, 'nulos': a['NULOS'], 'noreg': a['NO_REGISTRADAS'], 'total': total, 'ln': ln,
                  'participacion': round(total / ln * 100, 1) if ln else None, 'casillas': a['casillas'],
                  'ganador': win, 'segundo': sec_, 'margen_pts': round(margin, 1),
                  'pct_win': round(v[win] / total * 100, 1) if total else 0, 'colonias': sec_cols(s)})
    for k in blocks: tot[k] += v[k]
    tot['nulos'] += a['NULOS']; tot['noreg'] += a['NO_REGISTRADAS']; tot['total'] += total; tot['ln'] += ln; tot['casillas'] += a['casillas']
print('TOTALES DL02:', tot)
print('participacion %.2f' % (tot['total'] / tot['ln'] * 100))
for k in blocks: print('  %-22s %7d  %5.1f%%' % (k, tot[k], tot[k] / tot['total'] * 100))
from collections import Counter
print('ganadores por seccion:', Counter(t['ganador'] for t in table))
print('segundos:', Counter(t['segundo'] for t in table))
json.dump({'table': table, 'tot': tot}, open(OUT + 'dl02_resultados.json', 'w'), ensure_ascii=False)

# ---------- Excel ----------
wb2 = Workbook(); w = wb2.active; w.title = 'Secciones DL02 2024'
cols = ['seccion', 'FyC (PAN-PRI-PRD)', 'MC', 'Morena-PVEM', 'PT', 'VIDA', 'Otros (ESO/PL/PES/PJ)', 'nulos', 'noreg', 'total', 'ln', 'participacion', 'casillas', 'ganador', 'segundo', 'margen_pts', 'pct_win', 'colonias']
w.append(['Diputación local 2024 – Distrito 02 Nuevo León – votos por sección (cómputo IEEPCNL 10/06/2024, casillas contabilizadas)'])
w.append(cols)
for c in w[2]: c.font = Font(bold=True)
for t in table: w.append(['%04d' % t['seccion']] + [t[c] for c in cols[1:]])
w.append(['TOTAL'] + [tot.get(c, '') for c in cols[1:13]])
w2 = wb2.create_sheet('Resumen DL02')
w2.append(['Bloque', 'Votos', '%']);
for k in blocks: w2.append([k, tot[k], round(tot[k] / tot['total'] * 100, 2)])
w2.append(['Nulos', tot['nulos'], round(tot['nulos'] / tot['total'] * 100, 2)]); w2.append(['No registrados', tot['noreg'], ''])
w2.append(['Total votos', tot['total'], '']); w2.append(['Lista nominal', tot['ln'], '']); w2.append(['Participación %', round(tot['total'] / tot['ln'] * 100, 2), ''])
w2.append([]); w2.append(['Secciones ganadas']);
for k, n in Counter(t['ganador'] for t in table).most_common(): w2.append([k, n])
wb2.save(OUT + 'DL02_NL_resultados_2024_por_seccion.xlsx')

# ---------- choropleth PNG ----------
def label_pt(rings):
    best = None; ba = 0
    for rg in rings:
        x = np.array([p[0] for p in rg]); y = np.array([p[1] for p in rg])
        a = 0.5 * np.sum(x * np.roll(y, -1) - np.roll(x, -1) * y)
        if abs(a) > ba:
            ba = abs(a)
            best = (np.sum((x + np.roll(x, -1)) * (x * np.roll(y, -1) - np.roll(x, -1) * y)) / (6 * a),
                    np.sum((y + np.roll(y, -1)) * (x * np.roll(y, -1) - np.roll(x, -1) * y)) / (6 * a))
    return best
asp = 1 / math.cos(math.radians(25.74))
bysec = {t['seccion']: t for t in table}
fig, ax = plt.subplots(figsize=(18, 18), dpi=130)
for s in secs:
    t = bysec[s]; col = COLORS[t['ganador']]
    alpha = 0.25 + 0.65 * min(t['margen_pts'], 30) / 30
    for rg in sec_rings[str(s)]:
        xs = [p[0] for p in rg]; ys = [p[1] for p in rg]
        ax.fill(xs, ys, color=col, alpha=alpha, lw=0); ax.plot(xs, ys, color='#444', lw=0.6)
    cx, cy = label_pt(sec_rings[str(s)])
    ax.text(cx, cy, '%04d\n%+.0f' % (s, t['margen_pts']), fontsize=7.5, ha='center', va='center', color='#111', weight='bold',
            path_effects=[pe.withStroke(linewidth=2.5, foreground='white')])
lons = [p[0] for p in outer]; lats = [p[1] for p in outer]
ax.plot(lons + [lons[0]], lats + [lats[0]], color='black', lw=2.5)
wins = Counter(t['ganador'] for t in table)
ax.legend(handles=[Patch(color=COLORS[k], label='%s — %d secciones (%.1f%%)' % (k, wins.get(k, 0), tot[k] / tot['total'] * 100)) for k in blocks if wins.get(k, 0) or tot[k] / tot['total'] > 0.03],
          loc='lower left', fontsize=12, title='Ganador por sección · intensidad = margen', title_fontsize=12)
ax.set_title('Distrito Local 02 Nuevo León – Diputación local 2024: ganador y margen por sección\n(número de sección / margen en puntos sobre el 2º lugar · fuente: cómputo IEEPCNL + cartografía IEEPCNL 2024)', fontsize=14)
ax.set_aspect(asp); ax.set_xlabel('Longitud'); ax.set_ylabel('Latitud'); ax.grid(alpha=.2)
fig.tight_layout(); fig.savefig(OUT + 'DL02_NL_resultados_2024_mapa.png')

# ---------- interactive HTML: inject results ----------
html = open(OUT + 'DL02_NL_mapa_interactivo.html').read()
res_js = json.dumps({str(t['seccion']): {k: t[k] for k in ['FyC (PAN-PRI-PRD)', 'MC', 'Morena-PVEM', 'PT', 'VIDA', 'Otros (ESO/PL/PES/PJ)', 'nulos', 'total', 'ln', 'participacion', 'ganador', 'margen_pts', 'pct_win']} for t in table}, ensure_ascii=False)
html = html.replace("const map=L.map('map');", "const RES=%s;const COL=%s;const map=L.map('map');" % (res_js, json.dumps(COLORS)))
html = html.replace("L.geoJSON(secs,{style:{color:'#c47a2c',weight:1.2,fillColor:'#ffcf70',fillOpacity:.25},",
  "L.geoJSON(secs,{style:f=>{const r=RES[f.properties.seccion];return {color:'#333',weight:1,fillColor:COL[r.ganador],fillOpacity:.25+.6*Math.min(r.margen_pts,30)/30}},")
html = html.replace("l.bindPopup('<b>Sección '+String(f.properties.seccion).padStart(4,'0')+'</b><br>'+f.properties.colonias);",
  "const r=RES[f.properties.seccion];const keys=['FyC (PAN-PRI-PRD)','MC','Morena-PVEM','PT','VIDA','Otros (ESO/PL/PES/PJ)'];const rows=keys.sort((a,b)=>r[b]-r[a]).map(k=>'<tr><td style=\"color:'+COL[k]+'\">&#9632;</td><td>'+k+'</td><td align=right><b>'+r[k]+'</b></td><td align=right>'+(100*r[k]/r.total).toFixed(1)+'%</td></tr>').join('');l.bindPopup('<b>Sección '+String(f.properties.seccion).padStart(4,'0')+'</b> · gana <b>'+r.ganador+'</b> por '+r.margen_pts+' pts<br><table style=\"font-size:12px\">'+rows+'</table>Total '+r.total+' · LN '+r.ln+' · participación '+r.participacion+'%<br><small>'+f.properties.colonias+'</small>');")
html = html.replace("toca una sección para ver sus colonias", "Diputación local 2024: color = ganador por sección, intensidad = margen. Toca una sección para ver votos y colonias.<br><span style='color:#1f5fbf'>&#9632;</span> FyC (PAN-PRI-PRD) &nbsp;<span style='color:#f08a1d'>&#9632;</span> MC &nbsp;<span style='color:#8b1a3a'>&#9632;</span> Morena-PVEM &nbsp;<span style='color:#c62828'>&#9632;</span> PT &nbsp;<span style='color:#2e7d32'>&#9632;</span> VIDA")
html = html.replace('<title>Distrito Local 02 NL</title>', '<title>DL02 NL resultados 2024</title>')
open(OUT + 'DL02_NL_resultados_2024_interactivo.html', 'w').write(html)
print('done')

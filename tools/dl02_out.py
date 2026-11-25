import json, csv, math
import numpy as np
import shpread as S
from dl02 import inside_poly, bbox  # noqa (re-runs load; acceptable)
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from openpyxl import Workbook

SHP = '../shp/'; OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json'))
outer = D['dl_rings_wgs'][D['outer']]

# ---------- neighbours along the boundary ----------
drec, dshp = S.read_dbf(SHP + 'DISTRITO_LOCAL.DBF')[1], S.read_shp(SHP + 'DISTRITO_LOCAL.shp')
mrec, mshp = S.read_dbf(SHP + 'MUNICIPIO.DBF')[1], S.read_shp(SHP + 'MUNICIPIO.shp')
dl2 = [s for r, s in zip(drec, dshp) if r['DISTRITO_L'] == 2][0]
ring = dl2[0]
# densify boundary and probe 60 m outside
probe = []
for i in range(len(ring)):
    x1, y1 = ring[i]; x2, y2 = ring[(i+1) % len(ring)]
    L = math.hypot(x2-x1, y2-y1)
    n = max(1, int(L // 40))
    for k in range(n):
        t = k / n; px = x1 + t*(x2-x1); py = y1 + t*(y2-y1)
        # outward normal (ring is clockwise in shapefiles => outward is left of direction? compute both and pick outside)
        nx, ny = (y2-y1)/L if L else 0, -(x2-x1)/L if L else 0
        for sgn in (1, -1):
            qx, qy = px + sgn*60*nx, py + sgn*60*ny
            if not inside_poly(np.array([qx]), np.array([qy]), dl2)[0]:
                probe.append((px, py, qx, qy)); break
qx = np.array([p[2] for p in probe]); qy = np.array([p[3] for p in probe])
lab = ['?'] * len(probe)
for r, s in zip(drec, dshp):
    if r['DISTRITO_L'] == 2: continue
    m = inside_poly(qx, qy, s)
    for i in np.where(m)[0]: lab[i] = 'DL %02d' % r['DISTRITO_L']
mun_lab = ['?'] * len(probe)
for r, s in zip(mrec, mshp):
    m = inside_poly(qx, qy, s)
    for i in np.where(m)[0]: mun_lab[i] = r['NOMBRE']
# summarise by bearing from centroid
cx = np.mean([p[0] for p in ring]); cy = np.mean([p[1] for p in ring])
seg = {}
for (px, py, _, _), l, ml in zip(probe, lab, mun_lab):
    ang = (math.degrees(math.atan2(px-cx, py-cy)) + 360) % 360
    key = l if ml == 'MONTERREY' else ml + ' (' + l + ')'
    seg.setdefault(key, []).append(ang)
neigh = []
for k, v in seg.items():
    v = np.array(v); n = len(v)
    neigh.append((k, n*40/1000.0, float(np.median(v))))
neigh.sort(key=lambda t: t[2])
print('VECINOS (nombre, km de frontera aprox, rumbo medio):')
for k, km, a in neigh: print('  %-28s %6.1f km  rumbo %5.0f°' % (k, km, a))
total_km = sum(k for _, k, _ in neigh); print('perimetro aprox km', total_km)

# ---------- cardinal extremes ----------
lons = [p[0] for p in outer]; lats = [p[1] for p in outer]
iN = int(np.argmax(lats)); iS = int(np.argmin(lats)); iE = int(np.argmax(lons)); iW = int(np.argmin(lons))
ext = {'Norte': outer[iN], 'Sur': outer[iS], 'Este': outer[iE], 'Oeste': outer[iW]}
print('EXTREMOS', ext)
cen = S.utm14n_to_wgs84(cx, cy); print('CENTROIDE', cen)

# ---------- KML ----------
def kml_coords(rg): return ' '.join('%.6f,%.6f,0' % (lon, lat) for lon, lat in rg)
secs = D['secciones']; sec_rings = D['sec_rings_wgs']
col_by_sec = D['col_by_sec']
def sec_cols(sec):
    d = col_by_sec.get(str(sec), {})
    return ', '.join(sorted(d, key=lambda z: -d[z]))
kml = ['<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>Distrito Local 02 Nuevo León (IEEPCNL 2024)</name>',
       '<Style id="dist"><LineStyle><color>ff0000ff</color><width>4</width></LineStyle><PolyStyle><color>200000ff</color></PolyStyle></Style>',
       '<Style id="sec"><LineStyle><color>ffcc6600</color><width>1.5</width></LineStyle><PolyStyle><color>18cc6600</color></PolyStyle></Style>',
       '<Folder><name>Contorno del distrito</name><Placemark><name>Distrito Local 02 – Monterrey</name><styleUrl>#dist</styleUrl><Polygon><outerBoundaryIs><LinearRing><coordinates>%s</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Folder>' % kml_coords(outer),
       '<Folder><name>Secciones electorales (125)</name>']
for sec in secs:
    rings = sec_rings[str(sec)]
    desc = 'Colonias: ' + sec_cols(sec)
    polys = ''.join('<Polygon><outerBoundaryIs><LinearRing><coordinates>%s</coordinates></LinearRing></outerBoundaryIs></Polygon>' % kml_coords(rg) for rg in rings)
    kml.append('<Placemark><name>Sección %04d</name><description>%s</description><styleUrl>#sec</styleUrl><MultiGeometry>%s</MultiGeometry></Placemark>' % (sec, desc.replace('&', '&amp;'), polys))
kml.append('</Folder></Document></kml>')
open(OUT + 'DL02_NL_oficial.kml', 'w').write('\n'.join(kml))

# ---------- GeoJSON ----------
feats = [{'type': 'Feature', 'properties': {'capa': 'distrito_local', 'distrito_local': 2, 'entidad': 'Nuevo León', 'municipio': 'Monterrey', 'secciones': 125, 'fuente': 'IEEPCNL CE_FORMATO_SHAPEFILE_2024'},
          'geometry': {'type': 'Polygon', 'coordinates': [[[round(a, 6), round(b, 6)] for a, b in outer] + [[round(outer[0][0], 6), round(outer[0][1], 6)]]]}}]
for sec in secs:
    rings = sec_rings[str(sec)]
    coords = [[[round(a, 6), round(b, 6)] for a, b in rg] + [[round(rg[0][0], 6), round(rg[0][1], 6)]] for rg in rings]
    feats.append({'type': 'Feature', 'properties': {'capa': 'seccion', 'seccion': sec, 'distrito_local': 2, 'colonias': sec_cols(sec)},
                  'geometry': {'type': 'Polygon', 'coordinates': coords}})
json.dump({'type': 'FeatureCollection', 'features': feats}, open(OUT + 'DL02_NL_oficial.geojson', 'w'), ensure_ascii=False)

# ---------- Excel + CSV: colonias x seccion ----------
cols = sorted(D['colonias'], key=lambda c: c['nombre'])
wb = Workbook(); ws = wb.active; ws.title = 'Colonias DL02'
ws.append(['Colonia', 'CP', '% de la colonia dentro del DL02', 'Secciones (orden por superficie)'])
for c in cols:
    if c['pct_en_DL02'] < 5: continue
    ws.append([c['nombre'], c['cp'], c['pct_en_DL02'], ', '.join('%04d' % s for s in c['secciones'])])
ws2 = wb.create_sheet('Secciones DL02')
ws2.append(['Sección', 'Colonias (orden por superficie dentro de la sección)'])
for sec in secs: ws2.append(['%04d' % sec, sec_cols(sec)])
wb.save(OUT + 'DL02_NL_colonias_secciones.xlsx')
with open(OUT + 'DL02_NL_secciones_colonias.csv', 'w', newline='') as f:
    w = csv.writer(f); w.writerow(['seccion', 'colonias'])
    for sec in secs: w.writerow(['%04d' % sec, sec_cols(sec)])

# ---------- PNG map ----------
fig, ax = plt.subplots(figsize=(11, 11), dpi=150)
for sec in secs:
    for rg in sec_rings[str(sec)]:
        xs = [p[0] for p in rg]; ys = [p[1] for p in rg]
        ax.fill(xs, ys, color='#f3e2c3', alpha=0.6, lw=0); ax.plot(xs, ys, color='#b87333', lw=0.5)
    rg = sec_rings[str(sec)][0]
    ax.text(np.mean([p[0] for p in rg]), np.mean([p[1] for p in rg]), '%04d' % sec, fontsize=4.5, ha='center', va='center', color='#333')
ax.plot(lons + [lons[0]], lats + [lats[0]], color='red', lw=2.2)
for name, (lo, la) in ext.items():
    ax.plot(lo, la, 'o', color='navy', ms=5); ax.annotate(name, (lo, la), xytext=(4, 4), textcoords='offset points', fontsize=8, color='navy', weight='bold')
ax.set_title('Distrito Local Electoral 02 – Nuevo León (Monterrey)\n125 secciones · fuente: shapefile IEEPCNL 2024', fontsize=12)
ax.set_xlabel('Longitud'); ax.set_ylabel('Latitud'); ax.set_aspect(1/math.cos(math.radians(25.74))); ax.grid(alpha=0.3)
fig.tight_layout(); fig.savefig(OUT + 'DL02_NL_mapa.png')

# ---------- markdown summaries ----------
with open(OUT + 'resumen.md', 'w') as f:
    f.write('EXTREMOS\n')
    for k, (lo, la) in ext.items(): f.write('%s: %.5f, %.5f\n' % (k, la, lo))
    f.write('CENTROIDE %.5f, %.5f\n' % (cen[1], cen[0]))
    f.write('\nCOLONIAS (>=5%% dentro):\n')
    for c in cols:
        if c['pct_en_DL02'] >= 5: f.write('%s | %s%% | %s\n' % (c['nombre'], c['pct_en_DL02'], ','.join('%04d' % s for s in c['secciones'][:6])))
    f.write('\nSECCIONES:\n')
    for sec in secs: f.write('%04d | %s\n' % (sec, sec_cols(sec)))
print('done')

import json, math
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patheffects as pe

OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json'))
outer = D['dl_rings_wgs'][D['outer']]
secs = D['secciones']; sec_rings = D['sec_rings_wgs']
col_by_sec = D['col_by_sec']

def label_pt(rings):
    # centroid of largest ring (area-weighted polygon centroid)
    best = None; ba = 0
    for rg in rings:
        x = np.array([p[0] for p in rg]); y = np.array([p[1] for p in rg])
        a = 0.5*np.sum(x*np.roll(y, -1) - np.roll(x, -1)*y)
        if abs(a) > ba:
            ba = abs(a)
            cx = np.sum((x+np.roll(x, -1))*(x*np.roll(y, -1)-np.roll(x, -1)*y))/(6*a)
            cy = np.sum((y+np.roll(y, -1))*(x*np.roll(y, -1)-np.roll(x, -1)*y))/(6*a)
            best = (cx, cy)
    return best

asp = 1/math.cos(math.radians(25.74))
fig, ax = plt.subplots(figsize=(18, 18), dpi=130)
for sec in secs:
    for rg in sec_rings[str(sec)]:
        xs = [p[0] for p in rg]; ys = [p[1] for p in rg]
        ax.fill(xs, ys, color='#fff3d6', lw=0); ax.plot(xs, ys, color='#c47a2c', lw=0.9)
    cx, cy = label_pt(sec_rings[str(sec)])
    ax.text(cx, cy, '%04d' % sec, fontsize=9, ha='center', va='center', color='#1a1a1a', weight='bold',
            path_effects=[pe.withStroke(linewidth=2.5, foreground='white')])
lons = [p[0] for p in outer]; lats = [p[1] for p in outer]
ax.plot(lons + [lons[0]], lats + [lats[0]], color='#d40000', lw=3)
ax.set_title('Distrito Local Electoral 02 – Nuevo León (Monterrey) · 125 secciones\nFuente: cartografía IEEPCNL 2024', fontsize=16)
ax.set_xlabel('Longitud'); ax.set_ylabel('Latitud'); ax.set_aspect(asp); ax.grid(alpha=0.25)
fig.tight_layout(); fig.savefig(OUT + 'DL02_NL_mapa_secciones.png')

# ---- interactive Leaflet HTML
feats = []
for sec in secs:
    rings = sec_rings[str(sec)]
    coords = [[[round(a, 6), round(b, 6)] for a, b in rg] + [[round(rg[0][0], 6), round(rg[0][1], 6)]] for rg in rings]
    d = col_by_sec.get(str(sec), {})
    cols = ', '.join(sorted(d, key=lambda z: -d[z]))
    cx, cy = label_pt(rings)
    feats.append({'type': 'Feature', 'properties': {'seccion': sec, 'colonias': cols, 'lx': round(cx, 6), 'ly': round(cy, 6)},
                  'geometry': {'type': 'Polygon', 'coordinates': coords}})
gj_secs = {'type': 'FeatureCollection', 'features': feats}
gj_dist = {'type': 'Feature', 'properties': {}, 'geometry': {'type': 'Polygon', 'coordinates': [[[round(a, 6), round(b, 6)] for a, b in outer] + [[round(outer[0][0], 6), round(outer[0][1], 6)]]]}}
html = f'''<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Distrito Local 02 NL</title>
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">
<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js"></script>
<style>:root{{--bg:#fff;--fg:#111}}html,body{{margin:0;height:100%;background:var(--bg);color:var(--fg);font-family:system-ui,sans-serif}}
#map{{height:100%}}.seclab{{background:none;border:0;box-shadow:none;font:700 11px/1 system-ui;color:#111;text-shadow:0 0 3px #fff,0 0 3px #fff,0 0 3px #fff;white-space:nowrap}}
#t{{position:absolute;top:10px;left:50px;z-index:1000;background:#fffd;padding:6px 10px;border-radius:6px;font-size:14px}}</style></head><body>
<div id="t"><b>Distrito Local 02 – Nuevo León (Monterrey)</b><br>125 secciones · cartografía IEEPCNL 2024 · toca una sección para ver sus colonias</div>
<div id="map"></div><script>
const secs={json.dumps(gj_secs,ensure_ascii=False)};const dist={json.dumps(gj_dist)};
const map=L.map('map');L.tileLayer('https://{{s}}.tile.openstreetmap.org/{{z}}/{{x}}/{{y}}.png',{{maxZoom:19,attribution:'&copy; OpenStreetMap'}}).addTo(map);
const dl=L.geoJSON(dist,{{style:{{color:'#d40000',weight:4,fill:false}}}}).addTo(map);
L.geoJSON(secs,{{style:{{color:'#c47a2c',weight:1.2,fillColor:'#ffcf70',fillOpacity:.25}},
 onEachFeature:(f,l)=>{{l.bindPopup('<b>Sección '+String(f.properties.seccion).padStart(4,'0')+'</b><br>'+f.properties.colonias);
 L.marker([f.properties.ly,f.properties.lx],{{icon:L.divIcon({{className:'seclab',html:String(f.properties.seccion).padStart(4,'0'),iconSize:[34,12],iconAnchor:[17,6]}}),interactive:false}}).addTo(map);}}
}}).addTo(map);map.fitBounds(dl.getBounds());
</script></body></html>'''
open(OUT + 'DL02_NL_mapa_interactivo.html', 'w').write(html)
print('ok')

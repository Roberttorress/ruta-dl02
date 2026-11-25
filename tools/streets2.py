"""Build walking street network from OSM extract, clip by section, compute per-day walking routes
(covering as many residential streets as feasible via a greedy 'postman' heuristic) and output KML/Excel/HTML."""
import json, math, html, sys, heapq, csv
import xml.etree.ElementTree as ET
import numpy as np
from collections import defaultdict
from openpyxl import Workbook
from openpyxl.styles import Font

OSM = sys.argv[1]
OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json')); rings = D['sec_rings_wgs']; outer = D['dl_rings_wgs'][D['outer']]; cbs = D['col_by_sec']
tab = json.load(open(OUT + 'dl02_ruta.json')); by = {t['seccion']: t for t in tab}
days = json.load(open(OUT + 'recorridos.json'))  # (i, phase, secs, ln, delta, km, url)
def cols(s, n=4): d = cbs.get(str(s), {}); return ', '.join(sorted(d, key=lambda z: -d[z])[:n])

WALK = {'residential', 'living_street', 'pedestrian', 'footway', 'tertiary', 'secondary', 'primary', 'unclassified', 'service', 'path', 'steps', 'tertiary_link', 'secondary_link', 'primary_link', 'crossing'}
DOOR = {'residential', 'living_street', 'unclassified', 'pedestrian'}  # streets worth door-knocking

# ---- parse
nodes = {}; ways = []
for ev, el in ET.iterparse(OSM, events=('end',)):
    if el.tag == 'node':
        nodes[int(el.get('id'))] = (float(el.get('lon')), float(el.get('lat')))
    elif el.tag == 'way':
        tags = {t.get('k'): t.get('v') for t in el.findall('tag')}
        hw = tags.get('highway')
        if hw in WALK:
            nds = [int(n.get('ref')) for n in el.findall('nd')]
            ways.append((hw, tags.get('name', ''), nds))
        el.clear()
print('nodes', len(nodes), 'walkable ways', len(ways))

# ---- metric projection
LON0, LAT0 = -100.35, 25.74
KX = 111320 * math.cos(math.radians(LAT0)); KY = 110574
def m(p): return ((p[0] - LON0) * KX, (p[1] - LAT0) * KY)
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])

# ---- section polygons (metric) + point in polygon
def pip(pt, ring):
    x, y = pt; inside = False; n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]; x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y):
            xi = x1 + (y - y1) * (x2 - x1) / (y2 - y1)
            if x < xi: inside = not inside
    return inside
secpoly = {s: [[m(p) for p in rg] for rg in rings[str(s)]] for s in by}
secbb = {s: (min(p[0] for rg in pl for p in rg), min(p[1] for rg in pl for p in rg), max(p[0] for rg in pl for p in rg), max(p[1] for rg in pl for p in rg)) for s, pl in secpoly.items()}
def sec_of(pt):
    for s, bb in secbb.items():
        if bb[0] <= pt[0] <= bb[2] and bb[1] <= pt[1] <= bb[3]:
            ins = False
            for rg in secpoly[s]: ins ^= pip(pt, rg)
            if ins: return s
    return None

# ---- graph: edges between consecutive nodes
adj = defaultdict(dict)  # node -> {node: (len, hw, name)}
edge_sec = {}
seg_by_sec = defaultdict(list)  # s -> list of (n1,n2,len,hw,name)
for hw, name, nds in ways:
    for a, b in zip(nds, nds[1:]):
        if a not in nodes or b not in nodes: continue
        pa, pb = m(nodes[a]), m(nodes[b]); L = dist(pa, pb)
        if L == 0: continue
        adj[a][b] = (L, hw, name); adj[b][a] = (L, hw, name)
        mid = ((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2)
        s = sec_of(mid)
        if s is not None:
            seg_by_sec[s].append((a, b, L, hw, name))
print('sections with streets', len(seg_by_sec))

# ---- per section stats
sec_stats = {}
for s in by:
    segs = seg_by_sec.get(s, [])
    km_door = sum(L for a, b, L, hw, nm in segs if hw in DOOR) / 1000
    km_all = sum(L for a, b, L, hw, nm in segs) / 1000
    names = defaultdict(float)
    for a, b, L, hw, nm in segs:
        if hw in DOOR and nm: names[nm] += L
    sec_stats[s] = {'km_calles': round(km_door, 2), 'km_total': round(km_all, 2), 'calles': [n for n, _ in sorted(names.items(), key=lambda x: -x[1])]}

# ---- Dijkstra
def dijkstra(src, targets=None, maxd=4000):
    dist_ = {src: 0}; prev = {}; pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > dist_.get(u, 1e18): continue
        if d > maxd: break
        for v, (L, hw, nm) in adj[u].items():
            nd = d + L
            if nd < dist_.get(v, 1e18): dist_[v] = nd; prev[v] = u; heapq.heappush(pq, (nd, v))
    return dist_, prev
def path(prev, src, dst):
    p = [dst]
    while p[-1] != src: p.append(prev[p[-1]])
    return p[::-1]

# ---- greedy street-covering walk for a set of sections (day)
def day_route(secs, budget_m=7000):
    # required edges: door streets in these sections
    req = set()
    for s in secs:
        for a, b, L, hw, nm in seg_by_sec.get(s, []):
            if hw in DOOR: req.add((min(a, b), max(a, b)))
    if not req: return [], 0, 0, 0
    total_req = sum(adj[a][b][0] for a, b in req)
    # start at required edge closest to section-order first centroid
    c0 = m((np.mean([p[0] for p in rings[str(secs[0])][0]]), np.mean([p[1] for p in rings[str(secs[0])][0]])))
    start = min((a for e in req for a in e), key=lambda n: dist(m(nodes[n]), c0))
    cur = start; walk = [cur]; done = set(); length = 0
    while req - done and length < budget_m:
        # take adjacent required edge if available
        nxt = None
        for v in adj[cur]:
            e = (min(cur, v), max(cur, v))
            if e in req and e not in done: nxt = v; break
        if nxt is not None:
            e = (min(cur, nxt), max(cur, nxt)); done.add(e); length += adj[cur][nxt][0]; walk.append(nxt); cur = nxt; continue
        # else go to nearest node touching an undone required edge
        d_, prev = dijkstra(cur, maxd=1500)
        cand = [n for e in (req - done) for n in e if n in d_]
        if not cand:
            # jump: pick globally nearest by straight line
            cand_all = [n for e in (req - done) for n in e]
            n2 = min(cand_all, key=lambda n: dist(m(nodes[n]), m(nodes[cur])))
            d_, prev = dijkstra(cur, maxd=6000)
            if n2 not in d_: walk.append(n2); cur = n2; continue
            n = n2
        else:
            n = min(cand, key=lambda n: d_[n])
        p = path(prev, cur, n)
        for a, b in zip(p, p[1:]):
            length += adj[a][b][0]; e = (min(a, b), max(a, b))
            if e in req: done.add(e)
        walk += p[1:]; cur = n
    cov = sum(adj[a][b][0] for a, b in done)
    return walk, length, cov, total_req

# ---- build outputs
kml = ['<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><name>DL02 – Recorridos a nivel de calle</name>',
       '<Style id="walk"><LineStyle><color>ff0000ff</color><width>4</width></LineStyle></Style>',
       '<Style id="sec"><LineStyle><color>ff333333</color><width>1.5</width></LineStyle><PolyStyle><color>30ffcf70</color></PolyStyle></Style>',
       '<Style id="st"><LineStyle><color>ff999999</color><width>1</width></LineStyle></Style>',
       '<Style id="start"><IconStyle><scale>1.2</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/go.png</href></Icon></IconStyle></Style>',
       '<Style id="end"><IconStyle><scale>1.2</scale><Icon><href>http://maps.google.com/mapfiles/kml/paddle/stop.png</href></Icon></IconStyle></Style>']
wb = Workbook(); w = wb.active; w.title = 'Recorridos por día'
w.append(['Día', 'Turno', 'Fase', 'Secciones', 'Km de calles residenciales en las secciones', 'Km del recorrido a pie (trazado)', 'Cobertura de calles %', 'Punto de inicio (lat,lon)', 'Punto final (lat,lon)', 'Calles principales a recorrer'])
[setattr(c, 'font', Font(bold=True)) for c in w[1]]
w2 = wb.create_sheet('Calles por sección')
w2.append(['Sección', 'Categoría', 'Km de calles residenciales', 'Km total vialidad', 'Calles (orden por longitud)'])
[setattr(c, 'font', Font(bold=True)) for c in w2[1]]
for s in sorted(by):
    st = sec_stats[s]; w2.append(['%04d' % s, by[s]['cat'], st['km_calles'], st['km_total'], ', '.join(st['calles'][:25])])
geo_days = []
curphase = None
for i, ph, secs, ln, delta, km, url in days:
    dia=(i+1)//2; turno='Mañana' if i%2==1 else 'Tarde'
    walk, length, cov, total_req = day_route(secs)
    pct = round(100 * cov / total_req, 0) if total_req else 0
    streets = []
    seen = set()
    for a, b in zip(walk, walk[1:]):
        nm = adj[a][b][2] if b in adj[a] else ''
        if nm and nm not in seen: seen.add(nm); streets.append(nm)
    coords = [nodes[n] for n in walk]
    if ph != curphase:
        if curphase: kml.append('</Folder>')
        kml.append('<Folder><name>%s</name>' % html.escape(ph)); curphase = ph
    kml.append('<Folder><name>Día %02d %s · %s · %.1f km</name>' % (dia, turno, ', '.join('%04d' % s for s in secs), length / 1000))
    for s in secs:
        polys = ''.join('<Polygon><outerBoundaryIs><LinearRing><coordinates>%s</coordinates></LinearRing></outerBoundaryIs></Polygon>' % ' '.join('%.6f,%.6f,0' % (a, b) for a, b in rg) for rg in rings[str(s)])
        kml.append('<Placemark><name>Sección %04d</name><description>%s</description><styleUrl>#sec</styleUrl><MultiGeometry>%s</MultiGeometry></Placemark>' % (s, html.escape('%s · LN %d · meta %+d · %.1f km de calles<br>%s' % (by[s]['cat'], by[s]['ln'], by[s]['delta'], sec_stats[s]['km_calles'], cols(s, 6))), polys))
    if coords:
        kml.append('<Placemark><name>Recorrido día %02d %s (%.1f km, cubre %d%% de las calles)</name><description>%s</description><styleUrl>#walk</styleUrl><LineString><tessellate>1</tessellate><coordinates>%s</coordinates></LineString></Placemark>' % (dia, turno, length / 1000, pct, html.escape('Calles: ' + ', '.join(streets[:40])), ' '.join('%.6f,%.6f,0' % c for c in coords)))
        kml.append('<Placemark><name>Inicio día %02d %s</name><styleUrl>#start</styleUrl><Point><coordinates>%.6f,%.6f,0</coordinates></Point></Placemark>' % (dia, turno, coords[0][0], coords[0][1]))
        kml.append('<Placemark><name>Fin día %02d %s</name><styleUrl>#end</styleUrl><Point><coordinates>%.6f,%.6f,0</coordinates></Point></Placemark>' % (dia, turno, coords[-1][0], coords[-1][1]))
    kml.append('</Folder>')
    w.append([dia, turno, ph, ', '.join('%04d' % s for s in secs), round(total_req / 1000, 1), round(length / 1000, 1), pct,
              '%.5f, %.5f' % (coords[0][1], coords[0][0]) if coords else '', '%.5f, %.5f' % (coords[-1][1], coords[-1][0]) if coords else '', ', '.join(streets[:30])])
    geo_days.append({'dia': i, 'cal': dia, 'turno': turno, 'fase': ph, 'secs': secs, 'km': round(length / 1000, 1), 'pct': pct, 'coords': [[round(c[0], 6), round(c[1], 6)] for c in coords], 'calles': streets[:40]})
    print('Día %02d %-6s %-22s calles %.1f km → ruta %.1f km (%d%%)' % (dia, turno, ','.join(str(s) for s in secs), total_req / 1000, length / 1000, pct))
kml.append('</Folder></Document></kml>')
open(OUT + 'DL02_recorridos_2xdia_GoogleEarth.kml', 'w').write('\n'.join(kml))
wb.save(OUT + 'DL02_recorridos_2xdia.xlsx')
json.dump({'days': geo_days}, open(OUT + 'calles_days2.json', 'w'))
# street segments geojson for the interactive map (door streets inside district, simplified)
feats = []
for s, segs in seg_by_sec.items():
    for a, b, L, hw, nm in segs:
        if hw in DOOR: feats.append([[round(nodes[a][0], 5), round(nodes[a][1], 5)], [round(nodes[b][0], 5), round(nodes[b][1], 5)]])
json.dump(feats, open(OUT + 'calles_segs.json', 'w'))
print('done')

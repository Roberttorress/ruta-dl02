"""Rural-postman routing per group (min-weight matching of odd nodes), groups chained per phase into one continuous walk,
then cut into balanced sessions at intersections. Output: calles_days_v2.json (same schema as calles_days40.json)."""
import json, math, sys, datetime as dt
import xml.etree.ElementTree as ET
import numpy as np
import networkx as nx
from collections import defaultdict, Counter
OSM = sys.argv[1]; OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json')); rings = D['sec_rings_wgs']
tab = {t['seccion']: t for t in json.load(open(OUT + 'dl02_ruta.json'))}
OLD = json.load(open(OUT + 'calles_days40.json'))
WALK = {'residential', 'living_street', 'pedestrian', 'footway', 'tertiary', 'secondary', 'primary', 'unclassified', 'service', 'path', 'steps', 'tertiary_link', 'secondary_link', 'primary_link', 'crossing', 'trunk', 'trunk_link'}
DOOR = {'residential', 'living_street', 'unclassified', 'pedestrian'}
nodes = {}; ways = []
for ev, el in ET.iterparse(OSM, events=('end',)):
    if el.tag == 'node': nodes[int(el.get('id'))] = (float(el.get('lon')), float(el.get('lat')))
    elif el.tag == 'way':
        tags = {t.get('k'): t.get('v') for t in el.findall('tag')}
        if tags.get('highway') in WALK and tags.get('access') not in ('private', 'no'):
            ways.append((tags['highway'], tags.get('name', ''), [int(n.get('ref')) for n in el.findall('nd')]))
        el.clear()
LON0, LAT0 = -100.35, 25.74; KX = 111320 * math.cos(math.radians(LAT0)); KY = 110574
def m(p): return ((p[0] - LON0) * KX, (p[1] - LAT0) * KY)
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
def pip(pt, ring):
    x, y = pt; ins = False
    for i in range(len(ring)):
        x1, y1 = ring[i]; x2, y2 = ring[i - 1]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1): ins = not ins
    return ins
secpoly = {s: [[m(p) for p in rg] for rg in rings[str(s)]] for s in tab}
secbb = {s: (min(p[0] for rg in pl for p in rg), min(p[1] for rg in pl for p in rg), max(p[0] for rg in pl for p in rg), max(p[1] for rg in pl for p in rg)) for s, pl in secpoly.items()}
def sec_of(pt):
    for s, bb in secbb.items():
        if bb[0] <= pt[0] <= bb[2] and bb[1] <= pt[1] <= bb[3]:
            ins = False
            for rg in secpoly[s]: ins ^= pip(pt, rg)
            if ins: return s
G = nx.Graph(); edge_sec = {}; edge_info = {}
for hw, name, nds in ways:
    for a, b in zip(nds, nds[1:]):
        if a not in nodes or b not in nodes or a == b: continue
        L = dist(m(nodes[a]), m(nodes[b]))
        if L == 0: continue
        if not G.has_edge(a, b) or G[a][b]['w'] > L:
            G.add_edge(a, b, w=L)
            e = (min(a, b), max(a, b)); edge_info[e] = (hw, name)
            pa, pb = m(nodes[a]), m(nodes[b])
            edge_sec[e] = sec_of(((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2))
print('grafo', G.number_of_nodes(), G.number_of_edges())
req_by_sec = defaultdict(set)
for e, s in edge_sec.items():
    if s is not None and edge_info[e][0] in DOOR: req_by_sec[s].add(e)
def W(a, b): return G[a][b]['w']
def sp(a, b): return nx.shortest_path(G, a, b, weight='w')

def postman(secs, entry_xy):
    """Return node walk covering all required edges of secs, starting near entry_xy."""
    R = nx.MultiGraph()
    for s in secs:
        for a, b in req_by_sec[s]: R.add_edge(a, b, w=W(a, b))
    if R.number_of_edges() == 0: return []
    # connect components with shortest paths (greedy MST on nearest node pairs)
    comps = [list(c) for c in nx.connected_components(R)]
    if len(comps) > 1:
        reps = []
        for c in comps:
            arr = np.array([m(nodes[n]) for n in c]); reps.append((c, arr))
        H = nx.Graph()
        for i in range(len(comps)):
            for j in range(i + 1, len(comps)):
                ci, ai = reps[i]; cj, aj = reps[j]
                # nearest pair by straight line (sampled)
                si = ai[::max(1, len(ai) // 60)]; sj = aj[::max(1, len(aj) // 60)]
                dmat = np.hypot(si[:, None, 0] - sj[None, :, 0], si[:, None, 1] - sj[None, :, 1])
                k = np.unravel_index(dmat.argmin(), dmat.shape)
                H.add_edge(i, j, w=dmat[k], pair=(ci[k[0] * max(1, len(ai) // 60)], cj[k[1] * max(1, len(aj) // 60)]))
        for i, j, dd in nx.minimum_spanning_edges(H, weight='w', data=True):
            a, b = dd['pair']
            try: p = sp(a, b)
            except nx.NetworkXNoPath: continue
            for u, v in zip(p, p[1:]): R.add_edge(u, v, w=W(u, v))
    # odd nodes -> min weight matching on shortest-path distances
    odd = [n for n, d in R.degree() if d % 2]
    if odd:
        K = nx.Graph(); paths = {}
        oddset = set(odd)
        for u in odd:
            lengths, pths = nx.single_source_dijkstra(G, u, cutoff=1500, weight='w')
            for v, L in lengths.items():
                if v in oddset and v != u and not K.has_edge(u, v):
                    K.add_edge(u, v, w=L); paths[(u, v)] = pths[v]
        # guarantee a perfect matching exists: add fallback far edges for isolated odds
        for u in odd:
            if u not in K or K.degree(u) == 0:
                for v in odd:
                    if v != u:
                        try:
                            L, p = nx.single_source_dijkstra(G, u, v, weight='w'); K.add_edge(u, v, w=L); paths[(u, v)] = p
                        except nx.NetworkXNoPath: pass
                        break
        Mt = nx.min_weight_matching(K, weight='w')
        matched = set()
        for u, v in Mt:
            p = paths.get((u, v)) or paths.get((v, u))[::-1]
            for a, b in zip(p, p[1:]): R.add_edge(a, b, w=W(a, b))
            matched |= {u, v}
        # any leftover odd nodes (no matching) -> pair greedily by full shortest path
        left = [n for n, d in R.degree() if d % 2]
        while len(left) >= 2:
            u = left.pop(); v = min(left, key=lambda x: dist(m(nodes[u]), m(nodes[x]))); left.remove(v)
            try:
                p = sp(u, v)
                for a, b in zip(p, p[1:]): R.add_edge(a, b, w=W(a, b))
            except nx.NetworkXNoPath: pass
    if not nx.is_connected(R):  # keep the largest component's tour, report
        big = max(nx.connected_components(R), key=len); R = R.subgraph(big).copy()
    if any(d % 2 for _, d in R.degree()): R = nx.eulerize(R)
    start = min(R.nodes, key=lambda n: dist(m(nodes[n]), entry_xy))
    walk = [start] + [v for u, v in nx.eulerian_circuit(R, source=start)]
    return walk

def wl(w): return sum(W(a, b) for a, b in zip(w, w[1:]))
# same group order as before (from old plan), phases
grp = {1: [], 2: [], 3: []}; seen = set()
for d in OLD['days']:
    key = (d['f'], tuple(d['grp'])) if 'grp' in d else None
for d in json.load(open(OUT + 'calles_days40.json'))['days']:
    pass
# rebuild group list from plan40 logic: old recorridos + extra recuperables (stored in plan via 'grp' if present)
groups = []
src = json.load(open(OUT + 'calles_days40.json'))['days']
if 'grp' in src[0]:
    for d in src:
        k = (d['f'], tuple(d['grp']))
        if k not in seen: seen.add(k); groups.append(k)
else:
    raise SystemExit('need grp in plan')
print('grupos', len(groups))
phase_walk = {1: [], 2: [], 3: []}; entry = None; covered_report = []
for f, secs in groups:
    ent = m(nodes[phase_walk[f][-1]]) if phase_walk[f] else (entry or m(nodes[next(iter(req_by_sec[secs[0]]))[0]]))
    w = postman(list(secs), ent)
    if not w: continue
    if phase_walk[f]:
        try: con = sp(phase_walk[f][-1], w[0])
        except nx.NetworkXNoPath: con = [phase_walk[f][-1], w[0]]
        phase_walk[f] += con[1:] + w[1:]
    else: phase_walk[f] = w
    entry = m(nodes[w[-1]])
    req = set().union(*[req_by_sec[s] for s in secs]); walked = {(min(a, b), max(a, b)) for a, b in zip(w, w[1:])}
    covered_report.append(len(req & walked) / max(1, len(req)))
print('cobertura de calles por grupo: min %.0f%% media %.0f%%' % (100 * min(covered_report), 100 * np.mean(covered_report)))
NS = 102
Lf = {f: wl(phase_walk[f]) for f in (1, 2, 3)}; tot = sum(Lf.values())
raw = {f: Lf[f] / tot * NS for f in Lf}; k = {f: max(1, round(raw[f])) for f in Lf}
while sum(k.values()) != NS:
    f = max(Lf, key=lambda f: raw[f] - k[f]) if sum(k.values()) < NS else min(Lf, key=lambda f: raw[f] - k[f])
    k[f] += 1 if sum(k.values()) < NS else -1
k={f:(k[f]//2)*2 for f in k}
while sum(k.values())<NS:
    f=max(Lf,key=lambda f: raw[f]-k[f]); k[f]+=2
while sum(k.values())>NS:
    f=min(Lf,key=lambda f: raw[f]-k[f]); k[f]-=2
print('km por fase', {f: round(Lf[f] / 1000) for f in Lf}, 'turnos', k)
deg = dict(G.degree())
phase_req = {f: set().union(*[req_by_sec[s_] for ff, sc in groups if ff == f for s_ in sc]) for f in (1, 2, 3)}
sessions = []
for f in (1, 2, 3):
    w = phase_walk[f]; cum = [0]; covered = set()
    for a, b in zip(w, w[1:]): cum.append(cum[-1] + W(a, b))
    Lp = cum[-1]; cuts = [0]
    for q in range(1, k[f]):
        tgt = Lp * q / k[f]
        cand = [j for j in range(len(cum)) if abs(cum[j] - tgt) < 250 and deg.get(w[j], 0) >= 3 and j > cuts[-1]]
        j = min(cand, key=lambda j: abs(cum[j] - tgt)) if cand else min(range(cuts[-1] + 1, len(cum)), key=lambda j: abs(cum[j] - tgt))
        cuts.append(j)
    cuts.append(len(w) - 1)
    for q in range(k[f]):
        piece = w[cuts[q]:cuts[q + 1] + 1]
        secL = Counter(); streets = []
        for a, b in zip(piece, piece[1:]):
            e = (min(a, b), max(a, b)); s = edge_sec.get(e)
            if e in phase_req[f] and e not in covered:
                covered.add(e); secL[edge_sec[e]] += W(a, b)
            nm = edge_info[e][1]
            if nm and nm not in streets: streets.append(nm)
        secs = [s for s, L in secL.most_common() if L >= 150] or ([secL.most_common(1)[0][0]] if secL else [sessions[-1]['secs'][-1] if sessions else 0])
        sessions.append({'f': f, 'secs': secs, 'km': round(wl(piece) / 1000, 1), 'coords': [[round(nodes[n][0], 5), round(nodes[n][1], 5)] for n in piece], 'calles': streets[:40], 'nodes': piece})
# dates
work = []; d = dt.date(2027, 4, 5)
while d <= dt.date(2027, 6, 2):
    if d.weekday() != 6: work.append(d)
    d += dt.timedelta(1)
FN = {1: 'Fase 1 · Arco Mitras (bastión + defender)', 2: 'Fase 2 · Empates', 3: 'Fase 3 · Recuperables'}
for i, s in enumerate(sessions):
    s['dia'] = i + 1; s['cal'] = i // 2 + 1; s['turno'] = 'Mañana' if i % 2 == 0 else 'Tarde'; s['pct'] = 100; s['fase'] = FN[s['f']]; s['fecha'] = work[s['cal'] - 1].isoformat()
# parte: consecutive sessions sharing main section
for i, s in enumerate(sessions):
    s['parte'] = '1/1'
json.dump({'days': [{k_: v for k_, v in s.items() if k_ != 'nodes'} for s in sessions], 'merc': OLD['merc']}, open(OUT + 'calles_days_v2.json', 'w'), ensure_ascii=False)
print('sesiones', len(sessions), 'km min/med/max %.1f/%.1f/%.1f' % (min(s['km'] for s in sessions), np.median([s['km'] for s in sessions]), max(s['km'] for s in sessions)), 'total %.0f km' % sum(s['km'] for s in sessions))
print('fases por días', {f: (min(s['cal'] for s in sessions if s['f'] == f), max(s['cal'] for s in sessions if s['f'] == f)) for f in (1, 2, 3)})

"""Re-plan walking sessions for N days x 2 turns with full street coverage, cutting continuous routes into ~equal sessions."""
import json, math, sys, heapq
import xml.etree.ElementTree as ET
import numpy as np
from collections import defaultdict, Counter
OSM = sys.argv[1]; NDAYS = int(sys.argv[2]); MODE = sys.argv[3] if len(sys.argv) > 3 else 'measure'
OUT = '../out/'
D = json.load(open(OUT + 'dl02_data.json')); rings = D['sec_rings_wgs']; cbs = D['col_by_sec']
tab = json.load(open(OUT + 'dl02_ruta.json')); by = {t['seccion']: t for t in tab}
WALK = {'residential', 'living_street', 'pedestrian', 'footway', 'tertiary', 'secondary', 'primary', 'unclassified', 'service', 'path', 'steps', 'tertiary_link', 'secondary_link', 'primary_link', 'crossing'}
DOOR = {'residential', 'living_street', 'unclassified', 'pedestrian'}
nodes = {}; ways = []
for ev, el in ET.iterparse(OSM, events=('end',)):
    if el.tag == 'node': nodes[int(el.get('id'))] = (float(el.get('lon')), float(el.get('lat')))
    elif el.tag == 'way':
        tags = {t.get('k'): t.get('v') for t in el.findall('tag')}
        if tags.get('highway') in WALK: ways.append((tags['highway'], tags.get('name', ''), [int(n.get('ref')) for n in el.findall('nd')]))
        el.clear()
LON0, LAT0 = -100.35, 25.74; KX = 111320 * math.cos(math.radians(LAT0)); KY = 110574
def m(p): return ((p[0] - LON0) * KX, (p[1] - LAT0) * KY)
def dist(a, b): return math.hypot(a[0] - b[0], a[1] - b[1])
def pip(pt, ring):
    x, y = pt; ins = False; n = len(ring)
    for i in range(n):
        x1, y1 = ring[i]; x2, y2 = ring[(i + 1) % n]
        if (y1 > y) != (y2 > y) and x < x1 + (y - y1) * (x2 - x1) / (y2 - y1): ins = not ins
    return ins
secpoly = {s: [[m(p) for p in rg] for rg in rings[str(s)]] for s in by}
secbb = {s: (min(p[0] for rg in pl for p in rg), min(p[1] for rg in pl for p in rg), max(p[0] for rg in pl for p in rg), max(p[1] for rg in pl for p in rg)) for s, pl in secpoly.items()}
def sec_of(pt):
    for s, bb in secbb.items():
        if bb[0] <= pt[0] <= bb[2] and bb[1] <= pt[1] <= bb[3]:
            ins = False
            for rg in secpoly[s]: ins ^= pip(pt, rg)
            if ins: return s
adj = defaultdict(dict); seg_by_sec = defaultdict(list)
for hw, name, nds in ways:
    for a, b in zip(nds, nds[1:]):
        if a not in nodes or b not in nodes: continue
        pa, pb = m(nodes[a]), m(nodes[b]); L = dist(pa, pb)
        if L == 0: continue
        adj[a][b] = (L, hw, name); adj[b][a] = (L, hw, name)
        s = sec_of(((pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2))
        if s is not None: seg_by_sec[s].append((a, b, L, hw, name))
def dijkstra(src, maxd):
    d_ = {src: 0}; prev = {}; pq = [(0, src)]
    while pq:
        d, u = heapq.heappop(pq)
        if d > d_.get(u, 1e18): continue
        if d > maxd: break
        for v, (L, hw, nm) in adj[u].items():
            nd = d + L
            if nd < d_.get(v, 1e18): d_[v] = nd; prev[v] = u; heapq.heappush(pq, (nd, v))
    return d_, prev
def pth(prev, src, dst):
    p = [dst]
    while p[-1] != src: p.append(prev[p[-1]])
    return p[::-1]
def full_walk(secs, start_near=None):
    req = set()
    for s in secs:
        for a, b, L, hw, nm in seg_by_sec.get(s, []):
            if hw in DOOR: req.add((min(a, b), max(a, b)))
    if not req: return []
    ref = start_near or m((np.mean([p[0] for p in rings[str(secs[0])][0]]), np.mean([p[1] for p in rings[str(secs[0])][0]])))
    cur = min((n for e in req for n in e), key=lambda n: dist(m(nodes[n]), ref)); walk = [cur]; done = set()
    while req - done:
        nxt = None
        for v in adj[cur]:
            e = (min(cur, v), max(cur, v))
            if e in req and e not in done: nxt = v; break
        if nxt is not None:
            done.add((min(cur, nxt), max(cur, nxt))); walk.append(nxt); cur = nxt; continue
        d_, prev = dijkstra(cur, 2500)
        cand = [n for e in (req - done) for n in e if n in d_]
        if not cand:
            n2 = min((n for e in (req - done) for n in e), key=lambda n: dist(m(nodes[n]), m(nodes[cur])))
            d_, prev = dijkstra(cur, 8000)
            if n2 not in d_:
                done |= {e for e in req if n2 in e}; continue
            n = n2
        else: n = min(cand, key=lambda n: d_[n])
        p = pth(prev, cur, n)
        for a, b in zip(p, p[1:]):
            e = (min(a, b), max(a, b))
            if e in req: done.add(e)
        walk += p[1:]; cur = n
    return walk
def wlen(w): return sum(adj[a][b][0] for a, b in zip(w, w[1:]))
def door_km(secs): return sum(L for s in secs for a, b, L, hw, nm in seg_by_sec.get(s, []) if hw in DOOR) / 1000

old = json.load(open(OUT + 'recorridos.json'))  # (i, phase, secs, ...) existing ordered groups
groups = {1: [], 2: [], 3: []}
for i, ph, secs, *_ in old: groups[int(ph[5])].append(secs)
in_plan = {s for g in groups.values() for gg in g for s in gg}
rec_extra = sorted([t['seccion'] for t in tab if t['cat'] == 'Recuperable' and t['seccion'] not in in_plan], key=lambda s: -by[s]['ln'])
if MODE == 'measure':
    for f in (1, 2, 3):
        ss = [s for g in groups[f] for s in g]
        print('Fase', f, len(ss), 'secciones, calles residenciales %.1f km' % door_km(ss))
    print('recuperables fuera del plan', len(rec_extra), '%.1f km' % door_km(rec_extra), rec_extra)
    # estimate full walk length ratio with a sample
    w = full_walk(groups[1][2]); print('muestra: calles %.1f km -> caminata %.1f km' % (door_km(groups[1][2]), wlen(w) / 1000))
    sys.exit()

# ---------- build plan ----------
def cen(s): return m((np.mean([p[0] for p in rings[str(s)][0]]), np.mean([p[1] for p in rings[str(s)][0]])))
# group extra recuperables: nearest-neighbour order, chunks of contiguous sections up to ~8 km of streets
rem = set(rec_extra); last = cen(groups[3][-1][-1]); order = []
while rem:
    s = min(rem, key=lambda x: dist(cen(x), last)); order.append(s); rem.remove(s); last = cen(s)
cur = []; km = 0
for s in order:
    k = door_km([s])
    if cur and (km + k > 8.5 or dist(cen(cur[-1]), cen(s)) > 2000): groups[3].append(cur); cur = []; km = 0
    cur.append(s); km += k
if cur: groups[3].append(cur)
# full walks per group
G = []; prev_end = None
for f in (1, 2, 3):
    for secs in groups[f]:
        w = full_walk(secs, m(nodes[prev_end]) if prev_end else None)
        if not w: continue
        G.append({'f': f, 'secs': secs, 'walk': w, 'len': wlen(w)}); prev_end = w[-1]
TOT = sum(g['len'] for g in G); NS = NDAYS * 2
print('grupos', len(G), 'caminata total %.0f km' % (TOT / 1000))
# ---- one continuous route through all groups, cut into NS equal pieces at intersections
W = []; owner = []
for gi, g in enumerate(G):
    w = g['walk']
    if W:
        d_, prev = dijkstra(W[-1], 8000)
        link = pth(prev, W[-1], w[0])[1:] if w[0] in d_ else [w[0]]
        W += link; owner += [gi] * len(link); w = w[1:]
    W += w; owner += [gi] * len(w)
cum = [0]
for a_, b_ in zip(W, W[1:]): cum.append(cum[-1] + (adj[a_][b_][0] if b_ in adj[a_] else dist(m(nodes[a_]), m(nodes[b_]))))
TOT = cum[-1]
inter = [j for j in range(1, len(W) - 1) if len(adj[W[j]]) >= 3]
import bisect
cuts = [0]
for q in range(1, NS):
    t = TOT * q / NS; k_ = bisect.bisect_left(inter, bisect.bisect_left(cum, t))
    cand = [inter[x] for x in (k_ - 1, k_) if 0 <= x < len(inter)]
    j = min(cand, key=lambda j: abs(cum[j] - t))
    cuts.append(max(j, cuts[-1] + 1))
cuts.append(len(W) - 1)
sessions = []
for q in range(NS):
    i0, i1 = cuts[q], cuts[q + 1]; piece = W[i0:i1 + 1]
    lenby = Counter()
    for j in range(i0, i1): lenby[owner[j + 1]] += cum[j + 1] - cum[j]
    gmain = lenby.most_common(1)[0][0]
    secs_touched = []; streets = []
    door = {}
    for gi in lenby:
        for s_ in G[gi]['secs']:
            for a_, b_, L_, hw, nm in seg_by_sec.get(s_, []):
                if hw in DOOR: door[(min(a_, b_), max(a_, b_))] = s_
    for a_, b_ in zip(piece, piece[1:]):
        s_ = door.get((min(a_, b_), max(a_, b_)))
        if s_ and s_ not in secs_touched: secs_touched.append(s_)
        nm = adj[a_][b_][2] if b_ in adj[a_] else ''
        if nm and nm not in streets: streets.append(nm)
    nmseq = [(adj[a_][b_][2] if b_ in adj[a_] else '') for a_, b_ in zip(piece, piece[1:])]
    sessions.append({'nmseq': nmseq, 'f': G[gmain]['f'], 'secs': secs_touched or G[gmain]['secs'][:1], 'parte': '', 'km': round((cum[i1] - cum[i0]) / 1000, 1),
                     'coords': [[round(nodes[n][0], 5), round(nodes[n][1], 5)] for n in piece], 'calles': streets[:40]})
# parte: how many sessions each section spans
span = defaultdict(list)
for q, s_ in enumerate(sessions):
    for x in s_['secs']: span[x].append(q)
for q, s_ in enumerate(sessions):
    main = s_['secs'][0]; lst = span[main]
    s_['parte'] = '%d/%d' % (lst.index(q) + 1, len(lst))
for i, s in enumerate(sessions):
    s['dia'] = i + 1; s['cal'] = i // 2 + 1; s['turno'] = 'Mañana' if i % 2 == 0 else 'Tarde'; s['pct'] = 100
    s['fase'] = {1: 'Fase 1 · Arco Mitras (bastión + defender)', 2: 'Fase 2 · Empates', 3: 'Fase 3 · Recuperables'}[s['f']]
NT = sorted({n for s_ in sessions for n in s_['nmseq']}); NI = {n: i for i, n in enumerate(NT)}
for s_ in sessions: s_['nm'] = [NI[n] for n in s_.pop('nmseq')]
json.dump({'days': sessions, 'NT': NT}, open(OUT + 'calles_days40.json', 'w'), ensure_ascii=False)
from collections import Counter
print('sesiones', len(sessions), 'por fase', Counter(s['f'] for s in sessions), 'km min/med/max %.1f/%.1f/%.1f' % (min(s['km'] for s in sessions), np.median([s['km'] for s in sessions]), max(s['km'] for s in sessions)))
print('días por fase:', {f: (min(s['cal'] for s in sessions if s['f'] == f), max(s['cal'] for s in sessions if s['f'] == f)) for f in (1, 2, 3)})
print('secciones cubiertas', len({x for s in sessions for x in s['secs']}), 'calles', len(NT))

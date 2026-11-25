import json, csv, math, sys
import numpy as np
import shpread as S

SHP = '../shp/'
DL = 2

def pip(px, py, ring):
    """vectorized ray casting; px,py arrays; ring list of (x,y)"""
    r = np.asarray(ring); x1 = r[:, 0]; y1 = r[:, 1]
    x2 = np.roll(x1, -1); y2 = np.roll(y1, -1)
    inside = np.zeros(len(px), dtype=bool)
    for i in range(len(x1)):
        xa, ya, xb, yb = x1[i], y1[i], x2[i], y2[i]
        if ya == yb: continue
        cond = ((ya > py) != (yb > py))
        xint = xa + (py - ya) * (xb - xa) / (yb - ya)
        inside ^= cond & (px < xint)
    return inside

def inside_poly(px, py, rings):
    """rings: outer rings clockwise (shp), holes ccw. Count membership by parity over all rings."""
    inside = np.zeros(len(px), dtype=bool)
    for rg in rings:
        inside ^= pip(px, py, rg)
    return inside

def bbox(rings):
    xs = [p[0] for rg in rings for p in rg]; ys = [p[1] for rg in rings for p in rg]
    return min(xs), min(ys), max(xs), max(ys)

def sample_points(rings, step):
    x0, y0, x1, y1 = bbox(rings)
    xs = np.arange(x0 + step/2, x1, step); ys = np.arange(y0 + step/2, y1, step)
    if len(xs) == 0 or len(ys) == 0:
        # tiny polygon: use vertices mean
        return np.array([np.mean([p[0] for p in rings[0]])]), np.array([np.mean([p[1] for p in rings[0]])])
    gx, gy = np.meshgrid(xs, ys); gx = gx.ravel(); gy = gy.ravel()
    m = inside_poly(gx, gy, rings)
    if m.sum() == 0:
        return np.array([np.mean([p[0] for p in rings[0]])]), np.array([np.mean([p[1] for p in rings[0]])])
    return gx[m], gy[m]

# --- load
dfields, drecs = S.read_dbf(SHP + 'DISTRITO_LOCAL.DBF'); dshapes = S.read_shp(SHP + 'DISTRITO_LOCAL.shp')
sfields, srecs = S.read_dbf(SHP + 'SECCION.DBF'); sshapes = S.read_shp(SHP + 'SECCION.shp')
cfields, crecs = S.read_dbf(SHP + 'COLONIA.DBF'); cshapes = S.read_shp(SHP + 'COLONIA.shp')
mfields, mrecs = S.read_dbf(SHP + 'MUNICIPIO.DBF'); mshapes = S.read_shp(SHP + 'MUNICIPIO.shp')

dl = [(r, s) for r, s in zip(drecs, dshapes) if r['DISTRITO_L'] == DL][0]
dl_rings = dl[1]
print('DL rings:', len(dl_rings), 'bbox UTM:', bbox(dl_rings))

secs = [(r, s) for r, s in zip(srecs, sshapes) if r['DISTRITO_L'] == DL]
secs.sort(key=lambda t: t[0]['SECCION'])
print('secciones:', len(secs), 'munis:', sorted(set(r['MUNICIPIO'] for r, _ in secs)), 'fed dist:', sorted(set(r['DISTRITO'] for r, _ in secs)))
print([r['SECCION'] for r, _ in secs])

# --- district outline to WGS84
def rings_wgs(rings):
    return [[list(S.utm14n_to_wgs84(x, y)) for x, y in rg] for rg in rings]

dl_w = rings_wgs(dl_rings)
# outer ring = largest abs area
areas = [abs(S.ring_area(rg)) for rg in dl_rings]
outer_i = int(np.argmax(areas))
print('outer ring pts:', len(dl_rings[outer_i]), 'area km2: %.2f' % (areas[outer_i]/1e6), 'holes:', len(dl_rings)-1)
lons = [p[0] for p in dl_w[outer_i]]; lats = [p[1] for p in dl_w[outer_i]]
print('bbox WGS: lat %.5f..%.5f lon %.5f..%.5f' % (min(lats), max(lats), min(lons), max(lons)))
cx = sum(p[0] for p in dl_rings[outer_i])/len(dl_rings[outer_i]); cy = sum(p[1] for p in dl_rings[outer_i])/len(dl_rings[outer_i])
print('centroid approx:', S.utm14n_to_wgs84(cx, cy))

# --- colonias x seccion by area sampling
step = 25.0  # m
dbx = bbox(dl_rings)
sec_bb = [(r['SECCION'], bbox(s), s) for r, s in secs]
col_rows = []
col_by_sec = {}
for r, s in zip(crecs, cshapes):
    if s is None: continue
    bb = bbox(s)
    if bb[2] < dbx[0] or bb[0] > dbx[2] or bb[3] < dbx[1] or bb[1] > dbx[3]: continue
    px, py = sample_points(s, step)
    n = len(px)
    m_dl = inside_poly(px, py, dl_rings)
    k = m_dl.sum()
    if k == 0: continue
    frac = k / n
    # which sections
    sec_hits = {}
    for sec, sbb, srings in sec_bb:
        if sbb[2] < bb[0] or sbb[0] > bb[2] or sbb[3] < bb[1] or sbb[1] > bb[3]: continue
        mm = inside_poly(px, py, srings)
        c = int(mm.sum())
        if c > 0: sec_hits[sec] = c
    col_rows.append({'nombre': r['NOMBRE'], 'cp': r['CP'], 'clasif': r['CLASIFICAC'], 'pct_en_DL02': round(100*frac, 1),
                     'area_ha_total': round(n*step*step/1e4, 1), 'secciones': sorted(sec_hits, key=lambda z: -sec_hits[z]), 'hits': sec_hits})
    for sec, c in sec_hits.items():
        col_by_sec.setdefault(sec, {})[r['NOMBRE']] = c
print('colonias tocando DL02:', len(col_rows))
json.dump({'dl_rings_wgs': dl_w, 'outer': outer_i, 'secciones': [r['SECCION'] for r, _ in secs],
           'sec_rings_wgs': {r['SECCION']: rings_wgs(s) for r, s in secs},
           'colonias': col_rows, 'col_by_sec': col_by_sec}, open('../out/dl02_data.json', 'w'), ensure_ascii=False)
print('saved')

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
json.dump({'days': days, 'merc': merc, 'NT': json.load(open(OUT + 'calles_days40.json')).get('NT', [])}, open(OUT + 'calles_days40.json', 'w'), ensure_ascii=False)
print('mercaditos', [(m['fecha'], m['cols'][:2]) for m in merc])


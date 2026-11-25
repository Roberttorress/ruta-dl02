import json, math, sys
import xml.etree.ElementTree as ET
from collections import defaultdict, Counter
OUT='../out/'
S=json.load(open(OUT+'calles_days40.json'))['days']; rows=json.load(open(OUT+'audit_rows.json'))
nodes={}; edge={}
for ev,el in ET.iterparse(sys.argv[1],events=('end',)):
    if el.tag=='node': nodes[int(el.get('id'))]=(round(float(el.get('lon')),5),round(float(el.get('lat')),5))
    elif el.tag=='way':
        tg={t.get('k'):t.get('v') for t in el.findall('tag')}; hw=tg.get('highway')
        if hw:
            nd=[int(n.get('ref')) for n in el.findall('nd')]
            for a,b in zip(nd,nd[1:]):
                if a in nodes and b in nodes: edge[frozenset((nodes[a],nodes[b]))]=hw
        el.clear()
KX=111320*math.cos(math.radians(25.74)); KY=110574
def dm(a,b): return math.hypot((a[0]-b[0])*KX,(a[1]-b[1])*KY)
CL={'residential':'calle','living_street':'calle','unclassified':'calle','pedestrian':'peatonal','footway':'andador','path':'andador','steps':'escaleras','service':'servicio','tertiary':'avenida','tertiary_link':'avenida','secondary':'avenida principal','secondary_link':'avenida principal','primary':'avenida principal','primary_link':'avenida principal'}
tot=Counter(); bad=[]; noedge=[]
for s,r in zip(S,rows):
    c=[tuple(p) for p in s['coords']]; t=Counter()
    for a,b in zip(c,c[1:]):
        hw=edge.get(frozenset((a,b)))
        if hw is None: noedge.append((r['i'],round(dm(a,b)))); t['?']+=dm(a,b); continue
        t[CL.get(hw,hw)]+=dm(a,b)
    L=sum(t.values()); tot.update(t)
    r['pct_av']=100*(t['avenida principal'])/L; r['pct_steps']=100*t['escaleras']/L; r['pct_and']=100*(t['andador']+t['escaleras'])/L
print('mezcla total:',{k:'%.0f%%'%(100*v/sum(tot.values())) for k,v in tot.most_common()})
print('tramos sin calle en OSM (saltos):',len(noedge),noedge[:10])
print('sesiones >15% en avenida principal:',[(r['i'],round(r['pct_av']),r['secs']) for r in rows if r['pct_av']>15])
print('sesiones con escaleras/andadores >10%:',[(r['i'],round(r['pct_and']),r['secs']) for r in rows if r['pct_and']>10])
print('sesiones con repetición >30%:',[(r['i'],round(r['rep']),r['secs']) for r in rows if r['rep']>30])
json.dump(rows,open(OUT+'audit_rows.json','w'))

import json, math, numpy as np
from collections import Counter
OUT='../out/'
P=json.load(open(OUT+'calles_days40.json')); S=P['days']
D=json.load(open(OUT+'dl02_data.json')); outer=D['dl_rings_wgs'][D['outer']]
KX=111320*math.cos(math.radians(25.74)); KY=110574
def dm(a,b): return math.hypot((a[0]-b[0])*KX,(a[1]-b[1])*KY)
def pip(x,y,r):
    ins=False
    for i in range(len(r)):
        x1,y1=r[i]; x2,y2=r[(i+1)%len(r)]
        if (y1>y)!=(y2>y) and x<x1+(y-y1)*(x2-x1)/(y2-y1): ins=not ins
    return ins
rows=[]
for i,s in enumerate(S):
    c=s['coords']; L=sum(dm(c[k],c[k+1]) for k in range(len(c)-1))
    jumps=[dm(c[k],c[k+1]) for k in range(len(c)-1)]; big=[j for j in jumps if j>250]
    segs=set(); uniq=0
    for k in range(len(c)-1):
        e=tuple(sorted([tuple(c[k]),tuple(c[k+1])]))
        if e not in segs: segs.add(e); uniq+=dm(c[k],c[k+1])
    out=sum(dm(c[k],c[k+1]) for k in range(len(c)-1) if not pip((c[k][0]+c[k+1][0])/2,(c[k][1]+c[k+1][1])/2,outer))
    nxt=S[i+1] if i+1<len(S) else None
    gap=dm(c[-1],nxt['coords'][0]) if nxt else 0
    rows.append(dict(i=i+1,fecha=s['fecha'],turno=s['turno'],f=s['f'],secs=s['secs'],parte=s['parte'],km=L/1000,rep=100*(1-uniq/L) if L else 0,jmax=max(jumps) if jumps else 0,njump=len(big),out=out/1000,gap=gap/1000,sameday=nxt is not None and nxt['fecha']==s['fecha']))
import statistics as st
print('km: min %.1f med %.1f max %.1f'%(min(r['km'] for r in rows),st.median(r['km'] for r in rows),max(r['km'] for r in rows)))
print('repetición (camina calles ya pisadas) med %.0f%% max %.0f%%'%(st.median(r['rep'] for r in rows),max(r['rep'] for r in rows)))
print('sesiones con saltos >250m sin calle:',sum(1 for r in rows if r['njump']), [ (r['i'],round(r['jmax'])) for r in rows if r['njump']][:20])
print('km fuera del distrito total %.1f; sesiones >0.5km fuera:'%sum(r['out'] for r in rows),[(r['i'],round(r['out'],1)) for r in rows if r['out']>0.5])
sd=[r for r in rows if r['sameday']]; nd=[r for r in rows if not r['sameday'] and r['i']<len(rows)]
print('distancia fin mañana -> inicio tarde: med %.2f km, >1.5km:'%st.median(r['gap'] for r in sd),[(r['i'],r['fecha'],round(r['gap'],1)) for r in sd if r['gap']>1.5])
print('distancia fin de día -> inicio siguiente: med %.2f km, >3km:'%st.median(r['gap'] for r in nd),[(r['i'],r['fecha'],round(r['gap'],1)) for r in nd if r['gap']>3])
print('cortas <4km:',[(r['i'],round(r['km'],1),r['secs']) for r in rows if r['km']<4])
print('largas >8km:',[(r['i'],round(r['km'],1),r['secs']) for r in rows if r['km']>8])
# day totals
from collections import defaultdict
dt=defaultdict(float)
for r in rows: dt[r['fecha']]+=r['km']
v=list(dt.values()); print('km por día: min %.1f med %.1f max %.1f'%(min(v),st.median(v),max(v)), 'días >15km:',[(k,round(x,1)) for k,x in dt.items() if x>15])
# section split across non-consecutive sessions
pos=defaultdict(list)
for r in rows:
    for x in r['secs']: pos[x].append(r['i'])
scat=[(x,p) for x,p in pos.items() if max(p)-min(p)+1>len(p)+2]
print('secciones visitadas en sesiones dispersas:',len(scat),scat[:12])
json.dump(rows,open(OUT+'audit_rows.json','w'))

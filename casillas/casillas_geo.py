import json,re,math,unicodedata,collections
import xml.etree.ElementTree as ET
secs=set(x['seccion'] for x in json.load(open('out/dl02_ruta.json')))
raw=[o for o in json.load(open('casillas_dl/raw2.json')) if o['s'] in secs]
for o in raw:o['ub']=re.sub(r'^(Casilla\s+)?Ubicación\s+','',o['ub']).strip()
rings=json.load(open('out/dl02_data.json'))['sec_rings_wgs']
def nz(s):
    s=unicodedata.normalize('NFD',s.upper());s=''.join(c for c in s if unicodedata.category(c)!='Mn')
    s=re.sub(r'[^A-Z0-9 ]',' ',s);s=re.sub(r'\b(CALLE|CALLES|AVENIDA|AVENIDAS|AV|AVE|PRIVADA|PRIV|CDA|CERRADA|PASEO|BOULEVARD|BLVD|CALZADA|ANDADOR|PROLONGACION|PROL|CARRETERA|LIC|LICENCIADO|GRAL|GENERAL|ING|INGENIERO|DR|DOCTOR|PROFR|PROFESOR|DE|DEL|LA|LAS|LOS|EL|Y)\b',' ',s)
    return ' '.join(s.split())
nodes={};ways=[]
for ev,el in ET.iterparse('osm/export.osm',events=('end',)):
    if el.tag=='node':nodes[int(el.get('id'))]=(float(el.get('lon')),float(el.get('lat')))
    elif el.tag=='way':
        t={x.get('k'):x.get('v') for x in el.findall('tag')}
        if t.get('highway') and t.get('name'):ways.append((nz(t['name']),[int(n.get('ref')) for n in el.findall('nd')]))
        el.clear()
byname=collections.defaultdict(list)
for n,nd in ways:byname[n].append([x for x in nd if x in nodes])
names=list(byname)
K=111320*math.cos(math.radians(25.73))
def d(a,b):return math.hypot((a[0]-b[0])*K,(a[1]-b[1])*110574)
def pip(p,r):
    x,y=p;ins=False
    for i in range(len(r)):
        x1,y1=r[i];x2,y2=r[(i+1)%len(r)]
        if (y1>y)!=(y2>y) and x<x1+(y-y1)*(x2-x1)/(y2-y1):ins=not ins
    return ins
def insec(p,s):return any(pip(p,r) for r in rings[str(s)])
def cen(s):r=rings[str(s)][0];return (sum(p[0] for p in r)/len(r),sum(p[1] for p in r)/len(r))
def near_sec(p,s,tol=350):
    if insec(p,s):return 0
    return min(d(p,q) for r in rings[str(s)] for q in r)
import difflib
NS={m:m.replace(' ','') for m in names}
def match(n):
    n=nz(n)
    if not n:return []
    tn=set(n.split());ns=n.replace(' ','');c=[]
    for m in names:
        tm=set(m.split())
        if m==n or NS[m]==ns or (tn and tm and (tn<=tm or tm<=tn) and len(tn&tm)>=max(1,min(len(tn),len(tm)))):c.append(m)
        elif len(ns)>=5 and difflib.SequenceMatcher(None,ns,NS[m]).ratio()>=0.86:c.append(m)
    return c
def street_nodes(cands,s,tol=400):
    out=[]
    for m in cands:
        for nd in byname[m]:
            for i in nd:
                p=nodes[i]
                if near_sec(p,s)<=tol:out.append(i)
    return out
def parse(ub):
    u=ub.upper()
    m=re.search(r'\b(CALLE|AVENIDA|AV\.|BOULEVARD|PRIVADA|ANDADOR|CERRADA)\s+(.+?),',u)
    st=m.group(0).rstrip(',') if m else ''
    if not st:
        parts=[x.strip() for x in ub.split(',')]
        if len(parts)>1 and not re.match(r'(N[ÚU]MERO|SIN N|COLONIA)',parts[1].upper()):st=parts[1]
    num=re.search(r'N[ÚU]MERO\s+([0-9]+)',u)
    col=re.search(r'COLONIA\s+(.+?),',u)
    ent=re.search(r'ENTRE\s+(?:CALLES?|AVENIDAS?|AV\.?)?\s*(.+?)\s+Y\s+(?:CALLE\s+|AVENIDA\s+)?(.+)$',u)
    lugar=ub.split(',')[0].strip()
    return {'st':st,'num':num.group(1) if num else '','col':col.group(1).strip() if col else '','a':ent.group(1).strip() if ent else '','b':ent.group(2).strip().rstrip('.') if ent else '','lugar':lugar}
res=[];stat=collections.Counter()
for o in raw:
    s=o['s'];p=parse(o['ub']);pt=None;q='seccion'
    sn=street_nodes(match(p['st']),s) if p['st'] else []
    an=street_nodes(match(p['a']),s,600) if p['a'] else [];bn=street_nodes(match(p['b']),s,600) if p['b'] else []
    def inter(X,Y):
        sy=set(Y);I=[i for i in X if i in sy]
        if I:return nodes[I[0]]
        best=None
        for i in X:
            for j in Y:
                dd=d(nodes[i],nodes[j])
                if dd<35 and (best is None or dd<best[0]):best=(dd,nodes[i])
        return best[1] if best else None
    ia=inter(sn,an) if sn and an else None;ib=inter(sn,bn) if sn and bn else None
    if ia and ib:pt=((ia[0]+ib[0])/2,(ia[1]+ib[1])/2);q='cuadra'
    elif ia or ib:pt=ia or ib;q='esquina'
    elif not sn and (an or bn):
        P=[nodes[i] for i in (an or bn) if insec(nodes[i],s)]
        if P:c=cen(s);pt=min(P,key=lambda x:d(x,c));q='aprox'
        else:pt=cen(s)
    elif sn:
        P=[nodes[i] for i in sn if insec(nodes[i],s)] or [nodes[i] for i in sn]
        c=cen(s);pt=min(P,key=lambda x:d(x,c));q='calle'
    else:pt=cen(s)
    if near_sec(pt,s)>500:pt=cen(s);q='seccion'
    stat[q]+=1
    res.append({'s':s,'c':o['cas'],'lugar':p['lugar'].title(),'dir':o['ub'],'lon':round(pt[0],6),'lat':round(pt[1],6),'q':q})
print(stat,len(res))
json.dump(res,open('out/casillas2024.json','w'),ensure_ascii=False)

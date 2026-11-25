import json,re,collections
exec(open('casillas_geo.py').read().split('res=[];stat')[0])
r=json.load(open('out/casillas2024.json'))
def code(c):
    t,n=(c.split()+['1'])[:2];return {'Básica':'B','Contigua':'C','Especial':'S','Extraordinaria':'E'}[t]+('' if t=='Básica' else n)
G=collections.OrderedDict()
for x in r:
    q=x['q']
    if q in('cuadra','esquina') and near_sec((x['lon'],x['lat']),x['s'])>150:q='calle'
    k=(x['s'],x['dir'])
    if k not in G:G[k]={'s':x['s'],'lg':x['lugar'],'d':x['dir'],'lon':x['lon'],'lat':x['lat'],'ok':1 if q in('cuadra','esquina') else 0,'cs':[]}
    G[k]['cs'].append(code(x['c']))
def nice(dr):
    dr=re.sub(r',\s*C[ÓO]DIGO POSTAL \d+','',dr,flags=re.I);dr=re.sub(r',?\s*MONTERREY,?\s*NUEVO LE[ÓO]N\s*,?',', ',dr,flags=re.I);return dr.strip(' ,')
def tc(t):
    w=t.title().split();sm={'De','Del','La','Las','Los','El','Y','En','A'}
    return ' '.join(x.lower() if i and x in sm else x for i,x in enumerate(w))
out=[[g['s'],tc(g['lg']),nice(g['d']),round(g['lon'],6),round(g['lat'],6),g['ok'],g['cs']] for g in G.values()]
json.dump(out,open('out/casillas_app.json','w'),ensure_ascii=False)
cnt=collections.Counter();[cnt.update({g[0]:len(g[6])}) for g in out]
print(len(out),'ubicaciones',sum(cnt.values()),'casillas',sum(1 for g in out if g[5]),'confirmadas')
print(out[0])

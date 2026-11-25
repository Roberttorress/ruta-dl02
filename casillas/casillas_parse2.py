import json,re,statistics,pdfplumber
secs=set(x['seccion'] for x in json.load(open('out/dl02_ruta.json')))
P=json.load(open('casillas_dl/pages.json'));pg=sorted(set(q for p in P for q in (p-1,p,p+1)))
def line_text(chs):
    chs=sorted(chs,key=lambda c:c['x0']);out='';prev=None
    gaps=[chs[i+1]['x0']-chs[i]['x1'] for i in range(len(chs)-1) if chs[i]['text']!=' ' and chs[i+1]['text']!=' ']
    thr=None
    if gaps:
        g=sorted(gaps);med=statistics.median(g);thr=max(med*2.2,med+1.6)
    for c in chs:
        if c['text']==' ':
            if not out.endswith(' '):out+=' '
            prev=c;continue
        if prev and prev['text']!=' ' and thr is not None and c['x0']-prev['x1']>thr and not out.endswith(' '):out+=' '
        out+=c['text'];prev=c
    return out.strip()
def block_text(chs):
    lines={}
    for c in chs:lines.setdefault(round(c['top']/2.5),[]).append(c)
    ks=sorted(lines);L=[];cur=[]
    # merge close tops
    merged=[]
    for k in ks:
        if merged and k-merged[-1][0]<=1:merged[-1][1].extend(lines[k])
        else:merged.append([k,list(lines[k])])
    return ' '.join(line_text(v) for k,v in merged)
out=[]
with pdfplumber.open('casillas_dl/nl2024.pdf') as pdf:
    for n in pg:
        page=pdf.pages[n-1];W=page.extract_words(x_tolerance=2.2);C=page.chars
        hdr={w['text']:w for w in W if w['top']<130}
        if 'Ubicación' not in hdr:continue
        xs=hdr['Sección']['x0']-5;xc=hdr['Casilla']['x0']-8
        pres=[w for w in W if w['text'].startswith('Presidenta')];xp=pres[0]['x0']-3 if pres else hdr['Ubicación']['x1']+75
        rows=sorted([w for w in W if w['top']>110 and xs<=w['x0']<xc and re.fullmatch(r'\d{3,4}',w['text'])],key=lambda w:w['top'])
        ct=[w for w in W if w['top']>110 and xc<=w['x0']<xc+60 and w['text'] in('Básica','Contigua','Extraordinaria','Especial')]
        nums=[w for w in W if any(abs(w['top']-t['top'])<3 and 0<w['x0']-t['x1']<14 for t in ct) and re.fullmatch(r'\d{1,2}',w['text'])]
        xu=max([w['x1'] for w in ct+nums]+[xc+70])+3
        for i,r in enumerate(rows):
            y0=(rows[i-1]['top']+r['top'])/2 if i else r['top']-60;y1=(rows[i+1]['top']+r['top'])/2 if i+1<len(rows) else r['top']+60
            t=[w for w in ct if abs(w['top']-r['top'])<4];nm=[w for w in nums if abs(w['top']-r['top'])<4]
            cas=(t[0]['text']+' '+(nm[0]['text'] if nm else '')).strip() if t else ''
            ex=t+nm;ub=block_text([c for c in C if y0<=c['top']<y1 and xc-2<=c['x0']<xp and c['top']>118 and not any(e['x0']-.5<=c['x0']<=e['x1']+.5 and abs(c['top']-e['top'])<3 for e in ex)])
            out.append({'p':n,'s':int(r['text']),'cas':cas,'ub':ub})
json.dump(out,open('casillas_dl/raw2.json','w'),ensure_ascii=False)
m=[o for o in out if o['s'] in secs];print(len(m),len(set(o['s'] for o in m)))
import collections;print(collections.Counter(o['cas'].split()[0] for o in m if o['cas']))
for o in m[:5]+m[100:103]:print(o['s'],o['cas'],'|',o['ub'])

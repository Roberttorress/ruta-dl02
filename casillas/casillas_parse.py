import json,re,sys,pdfplumber
secs=set(x['seccion'] for x in json.load(open('out/dl02_ruta.json')))
P=json.load(open('casillas_dl/pages.json'));pg=sorted(set(q for p in P for q in (p-1,p,p+1)))
out=[]
with pdfplumber.open('casillas_dl/nl2024.pdf') as pdf:
    for n in pg:
        page=pdf.pages[n-1];W=page.extract_words(x_tolerance=2.2,keep_blank_chars=False,use_text_flow=False)
        hdr={w['text']:w for w in W if w['top']<130}
        if 'Ubicación' not in hdr or 'Sección' not in hdr: continue
        xs=hdr['Sección']['x0']-5;xc=hdr['Casilla']['x0']-8;xu0=hdr['Casilla']['x1']+20;xu1=hdr['Ubicación']['x1']+75
        pres=[w for w in W if w['text'].startswith('Presidenta')]
        if pres: xu1=pres[0]['x0']-3
        # rows: section numbers in sección column
        rows=[w for w in W if w['top']>110 and xs<=w['x0']<xc and re.fullmatch(r'\d{3,4}',w['text'])]
        rows.sort(key=lambda w:w['top'])
        for i,r in enumerate(rows):
            s=int(r['text'])
            y0=(rows[i-1]['top']+r['top'])/2 if i else r['top']-60
            y1=(rows[i+1]['top']+r['top'])/2 if i+1<len(rows) else r['top']+60
            cas=' '.join(w['text'] for w in W if abs(w['top']-r['top'])<4 and xc<=w['x0']<xu0-2)
            ub=[w for w in W if y0<=w['top']<y1 and xu0-2<=w['x0']<xu1 and w['text']!='Ubicación']
            ub.sort(key=lambda w:(round(w['top']/3),w['x0']))
            txt=' '.join(w['text'] for w in ub)
            # DL column check: words in DL col on row
            out.append({'p':n,'s':s,'cas':cas,'ub':txt,'dl':' '.join(w['text'] for w in W if abs(w['top']-r['top'])<4 and w['x0']<xs and w['x0']>hdr['Local']['x0']-30) if 'Local' in hdr else ''})
json.dump(out,open('casillas_dl/raw.json','w'),ensure_ascii=False)
mine=[o for o in out if o['s'] in secs]
print(len(out),len(mine),len(set(o['s'] for o in mine)))
for o in mine[:6]:print(o)

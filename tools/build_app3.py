import json, hashlib, os, re
OUT = '../out/'
P = json.load(open(OUT + 'calles_days40.json')); days = P['days']; merc = P['merc']; NT = P['NT']
segs = json.load(open(OUT + 'calles_segs.json'))
D = json.load(open(OUT + 'dl02_data.json')); rings = D['sec_rings_wgs']; outer = D['dl_rings_wgs'][D['outer']]; cbs = D['col_by_sec']
tab = {t['seccion']: t for t in json.load(open(OUT + 'dl02_ruta.json'))}
def cols(s, n=5): d = cbs.get(str(s), {}); return ', '.join(sorted(d, key=lambda z: -d[z])[:n])
_RES = {r['seccion']: r for r in json.load(open(OUT + 'dl02_resultados.json'))['table']}
secs = [{'s': s, 'cat': t['cat'], 'ln': t['ln'], 'delta': t['delta'], 'meta': t['meta'], 'fyc': t['FyC'], 'mc': t['MC'], 'mo': t['Morena'], 'pt': t['PT'], 'tot': t['total'], 'pan': t['PAN'], 'pri': t['PRI'], 'pv': t['PVEM'], 'vi': t['VIDA'], 'ot': _RES[s]['Otros (ESO/PL/PES/PJ)'], 'nu': _RES[s]['nulos'] + _RES[s]['noreg'], 'pa': _RES[s]['participacion'], 'col': cols(s),
         'rings': [[[round(a, 5), round(b, 5)] for a, b in rg] for rg in rings[str(s)]]} for s, t in tab.items()]
keep = ['dia', 'cal', 'turno', 'f', 'secs', 'parte', 'fecha', 'coords', 'nm', 'calles']
days = [{k: d[k] for k in keep} for d in days]
segs_c = [[round(a[0], 5), round(a[1], 5), round(b[0], 5), round(b[1], 5)] for a, b in segs]
J = lambda o: json.dumps(o, ensure_ascii=False, separators=(',', ':'))
js = open('app3.js').read()
_svg = re.sub(r'<!--.*?-->', '', open('mascot.svg').read()).replace('\n', '')
_org = open('org.js').read().replace("window.__DVSVG||''", J(_svg))
js = open('icons.js').read() + '\n' + js
js = js.replace('/* ===== boot ===== */', _org + '\n' + open('dd.js').read() + '\n' + open('fis.js').read() + '\n' + open('v5.js').read() + '\n' + open('v6.js').read() + '\n' + open('v7.js').read() + '\n' + open('v8.js').read() + '\n' + open('v9.js').read() + '\n/* ===== boot ===== */')
js = js.replace('({hoy:rHoy,cal:rCal,av:rAv,cap:rCap,mas:rMas})[tab]()', '({hoy:rHoy,cal:rAg,dd:rDD,av:rAv,cap:rCap,mas:rMas})[tab]()')
assert 'dd:rDD' in js
js = js.replace("[tab]();panel.scrollTop=0}", "[tab]();panel.scrollTop=0;tabAnim()}", 1)
assert 'tabAnim()}' in js
js = js.replace("$('modal').style.display='none'", 'closeModal()').replace("$(\\'modal\\').style.display=\\'none\\'", 'closeModal()')
assert "display='none'" not in js.split('function closeModal')[0][-50:]
js = js.replace("$('st').textContent", "$('gst').textContent").replace("id=\"st\">'+(o.done", "id=\"stb\">'+(o.done").replace("$('st').onclick=()=>startStreet(cur)", "$('stb').onclick=()=>startStreet(cur)")
def enc(pts):
    o = []; px = py = 0
    for lo, la in pts:
        x = round(lo * 1e5); y = round(la * 1e5); o += [x - px, y - py]; px, py = x, y
    return o
for d in days: d['c'] = enc(d.pop('coords'))
for x in secs: x['r'] = [enc(r) for r in x.pop('rings')]
sg = []; px = py = 0
for a0, a1, b0, b1 in segs_c:
    x = round(a0 * 1e5); y = round(a1 * 1e5); sg += [x - px, y - py, round(b0 * 1e5) - x, round(b1 * 1e5) - y]; px, py = x, y
_O = json.load(open(OUT + 'org_base.json'))
ZNAMES = ['Poniente · Valle Verde', 'Centro-poniente · Santa Lucía', 'Centro · Mitras Norte', 'Oriente · Topo Chico']
_CASI = json.load(open(OUT + 'casillas_app.json'))
_CC = {}
for g in _CASI: _CC[str(g[0])] = _CC.get(str(g[0]), 0) + len(g[6])
org = {'cas': {k: _CC.get(str(k), v) for k, v in _O['cas'].items()}, 'zones': [{'n': ZNAMES[i], 'secs': z['secs']} for i, z in enumerate(_O['zones'])]}
datajs = 'window.__D=' + J({'org': org, 'casi': _CASI, 'days': days, 'merc': merc, 'NT': NT, 'secs': secs, 'seg': sg, 'outer': enc(outer)}) + ';'
css = r'''
:root{--bg:#f4f5f7;--fg:#111;--mut:#5f6368;--card:#fff;--line:#e1e3e8;--b:#1d4f9c;--mapbg:#f3efe6;--ok:#009a44;--org:#009a44;--warn:#ce1126;--pri-g:#009a44;--pri-r:#ce1126}
@media (prefers-color-scheme:dark){:root:not(.hc){--bg:#0f0f10;--fg:#eee;--mut:#a5a5a5;--card:#1c1c1e;--line:#333;--mapbg:#1a1a1a}}
:root.hc{--bg:#fff;--fg:#000;--mut:#222;--card:#fff;--line:#000;--mapbg:#fff}:root.hc body{font-weight:600}:root.hc .card,:root.hc .item{border-width:2px}
*{box-sizing:border-box;-webkit-tap-highlight-color:transparent}html,body{margin:0;height:100%;background:var(--bg);color:var(--fg);font:16px/1.35 -apple-system,system-ui,sans-serif;-webkit-text-size-adjust:100%;overscroll-behavior:none;overflow:hidden}
a{color:var(--b)}#app{display:flex;position:fixed;top:0;right:0;bottom:0;left:0}#side{width:400px;flex:none;display:flex;flex-direction:column;background:var(--card);border-right:1px solid var(--line)}
#mapwrap{flex:1;position:relative;background:var(--mapbg);overflow:hidden}canvas{position:absolute;top:0;right:0;bottom:0;left:0;width:100%;height:100%;touch-action:none}
#panel{flex:1;overflow:auto;-webkit-overflow-scrolling:touch;padding:calc(env(safe-area-inset-top,0px) + 14px) 16px 24px}
#tabs{display:flex;border-top:1px solid var(--line);padding-bottom:env(safe-area-inset-bottom,0px);background:var(--card)}#tabs button{flex:1;border:0;background:none;color:var(--mut);font-size:12px;padding:8px 0 6px;display:flex;flex-direction:column;align-items:center;gap:1px}#tabs button span{font-size:22px}#tabs button.on{color:var(--b);font-weight:700}
h1{font-size:22px;margin:4px 0}h2{font-size:18px;margin:18px 0 8px}h3{font-size:16px;margin:14px 0 6px}.mut{color:var(--mut);font-size:14px}.warn{color:var(--warn)}
.card{background:var(--bg);border:1px solid var(--line);border-radius:14px;padding:12px 14px;margin:10px 0}.warnc{border-color:var(--warn);color:var(--warn);font-weight:700;cursor:pointer}
.btn{display:block;width:100%;font:inherit;font-size:18px;font-weight:700;padding:15px;border-radius:14px;border:0;background:var(--b);color:#fff;margin:8px 0;text-align:center;text-decoration:none;cursor:pointer}.btn.sec{background:var(--card);color:var(--fg);border:1px solid var(--line);font-weight:600}.btn.sm{width:auto;font-size:15px;padding:10px 14px;margin:0;flex:0 0 auto}.btn:active{opacity:.75}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.row>.btn{flex:1;margin:0}
input,select,textarea{font:inherit;font-size:16px;padding:12px;border-radius:12px;border:1px solid var(--line);background:var(--card);color:var(--fg);width:100%;margin:4px 0}
.sem{display:inline-block;width:12px;height:12px;border-radius:6px;vertical-align:-1px;margin-right:6px}.pill{display:inline-block;padding:2px 9px;border-radius:12px;font-size:12px;color:#fff;white-space:nowrap}
.item{padding:11px 4px;border-bottom:1px solid var(--line);display:flex;gap:10px;align-items:center;cursor:pointer}.item.sel{background:#1d4f9c14}.item .t{font-weight:700}.item .m{font-size:14px;color:var(--mut)}.item .chk{width:28px;height:28px;border-radius:14px;border:2px solid var(--line);flex:none;display:flex;align-items:center;justify-content:center;color:transparent;font-weight:700;font-size:14px}.item.done .chk{background:var(--ok);border-color:var(--ok);color:#fff}
.bar{height:10px;background:var(--line);border-radius:5px;overflow:hidden;margin:6px 0}.bar i{display:block;height:100%;background:var(--b)}.bar.big2{height:16px;border-radius:8px}
.big{font-size:30px;font-weight:800;line-height:1.1}.big small{font-size:15px;color:var(--mut)}.kpi{display:flex;gap:8px}.kpi .card{flex:1;margin:0;text-align:center;padding:10px 6px}
.diad{background:var(--warn);color:#fff;border-radius:14px;padding:12px 14px;margin-bottom:10px}.diad .k{font-size:12px;opacity:.85;letter-spacing:.5px}.diad .v{font-size:22px;font-weight:800}
.okline{color:var(--ok);font-weight:700;margin-top:6px}.back{border:0;background:none;color:var(--b);font:inherit;font-size:17px;padding:4px 0;cursor:pointer}
.res{display:flex;height:10px;border-radius:5px;overflow:hidden;margin:6px 0 2px;background:var(--line)}.res span{display:block;height:100%}
.tallyrow{display:flex;gap:6px;text-align:center;margin:8px 0}.tallyrow>div{flex:1}.srow{display:flex;justify-content:space-between;padding:6px 0 0;cursor:pointer}
.sw{display:flex;gap:10px;align-items:center;padding:10px 0;font-size:16px}.sw input{width:24px;height:24px;margin:0}
.cap,.pet{padding:12px 0;border-bottom:1px solid var(--line)}.cap b{display:block}.pet .h{display:flex;justify-content:space-between;align-items:center;gap:8px}
.acts{display:flex;gap:6px;margin-top:8px;flex-wrap:wrap}.acts button,.acts a{font:inherit;font-size:14px;padding:9px 11px;border-radius:10px;border:1px solid var(--line);background:var(--card);color:var(--fg);text-decoration:none;cursor:pointer}
.thumb{width:64px;height:64px;object-fit:cover;border-radius:8px;margin:4px 4px 0 0}
.type{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin:8px 0}.type.two{grid-template-columns:1fr 1fr}.type button{font:inherit;font-size:15px;padding:12px 6px;border-radius:12px;border:2px solid var(--line);background:var(--card);color:var(--fg);cursor:pointer}.type button.on{border-color:var(--b);background:#1d4f9c18;font-weight:700}
#modal{position:fixed;top:0;right:0;bottom:0;left:0;background:#0008;display:none;align-items:flex-end;justify-content:center;z-index:50;padding-top:calc(env(safe-area-inset-top,0px) + 14px)}#mwrap{position:relative;width:100%;max-width:560px;max-height:100%;display:flex;flex-direction:column}#mwrap:has(.orgbox){max-width:640px}#mclose,#pclose{position:absolute;top:10px;right:10px;width:42px;height:42px;border-radius:21px;border:1px solid var(--line);background:var(--bg);color:var(--fg);font-size:20px;z-index:2;cursor:pointer;display:flex;align-items:center;justify-content:center}#modal{cursor:pointer}#mwrap{cursor:auto}#mclose{z-index:3;box-shadow:0 1px 4px #0002}#mbox>:first-child:not(.dvtop){padding-right:46px}#pclose{position:fixed;top:calc(env(safe-area-inset-top,0px) + 12px);right:12px;background:#fff;color:#111}
#mbox{background:var(--card);width:100%;max-height:100%;min-height:0;flex:0 1 auto;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;overflow:auto;border-radius:18px 18px 0 0;padding:18px 18px calc(env(safe-area-inset-bottom,0px) + 18px)}
.rep{white-space:pre-wrap;font:14px/1.4 -apple-system,system-ui;background:var(--bg);border-radius:12px;padding:12px;border:1px solid var(--line)}
#photo{position:fixed;top:0;right:0;bottom:0;left:0;background:#000e;display:none;align-items:center;justify-content:center;z-index:60}#photo img{max-width:96%;max-height:90%;border-radius:10px}
#gps{position:absolute;right:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 16px);display:flex;flex-direction:column;gap:10px;z-index:5}#gps button{width:48px;height:48px;border-radius:24px;font-size:21px;box-shadow:0 2px 8px #0004;border:0;background:#fff;color:#111;cursor:pointer}#gps button.on{color:#1a73e8}#gps button.follow{background:#1a73e8;color:#fff}
#gst{position:absolute;left:10px;top:calc(env(safe-area-inset-top,0px) + 10px);background:#fffe;color:#111;padding:5px 10px;border-radius:9px;font-size:12px;max-width:60%;box-shadow:0 2px 6px #0003;z-index:5;transition:opacity .4s}#gst.hide{opacity:0;pointer-events:none}
#pop{position:absolute;left:10px;top:calc(env(safe-area-inset-top,0px) + 44px);background:#fffe;color:#111;padding:10px 12px;border-radius:12px;font-size:14px;max-width:330px;box-shadow:0 2px 10px #0003;display:none;z-index:6;line-height:1.45}#pop{max-height:calc(100% - env(safe-area-inset-top,0px) - 200px);overflow:auto;-webkit-overflow-scrolling:touch}.x{border:0;background:none;font-size:18px;cursor:pointer}
#leg{position:absolute;right:12px;top:calc(env(safe-area-inset-top,0px) + 12px);background:#fffd;color:#111;padding:7px 10px;border-radius:10px;font-size:12px;line-height:1.6;z-index:4}
#fab{position:absolute;left:12px;bottom:calc(env(safe-area-inset-bottom,0px) + 14px);height:50px;padding:0 18px;border-radius:25px;border:0;background:var(--org);color:#fff;font-size:18px;font-weight:700;box-shadow:0 3px 10px #0005;z-index:5;cursor:pointer}
#toast{position:fixed;left:50%;transform:translateX(-50%);top:calc(env(safe-area-inset-top,0px) + 14px);background:#111e;color:#fff;padding:12px 16px;border-radius:14px;font-size:15px;max-width:92%;z-index:70;display:none;box-shadow:0 4px 14px #0006;cursor:pointer}
body.street #toast{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 108px)}
#flash{position:fixed;top:0;right:0;bottom:0;left:0;pointer-events:none;opacity:0;transition:opacity .18s;z-index:40}
/* street mode */
#nav,#navp,#tbar,#sbtns{display:none}
body.street #side,body.street #fab,body.street #leg{display:none}
body.street #nav{display:block;position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:8;background:#1d4f9c;color:#fff;border-radius:16px;padding:12px 14px;box-shadow:0 4px 14px #0005}
.navrow{display:flex;gap:12px;align-items:center}.navico{font-size:40px;line-height:1;width:44px;text-align:center}.navmain{font-size:20px;font-weight:700}.navsub{font-size:14px;opacity:.85;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.navoff{font-size:18px;font-weight:700;color:#ffd27a}
body.street #navp{display:block;position:absolute;left:10px;right:10px;top:calc(env(safe-area-inset-top,0px) + 98px);z-index:8;background:#fffe;color:#111;border-radius:12px;padding:6px 12px;box-shadow:0 2px 8px #0003}
body.street #sbtns{display:flex;gap:8px;position:absolute;left:10px;top:calc(env(safe-area-inset-top,0px) + 160px);z-index:8;flex-direction:column}
#sbtns button{height:46px;min-width:46px;border-radius:23px;border:0;background:#fff;color:#111;font-size:16px;font-weight:700;box-shadow:0 2px 8px #0004;padding:0 14px;cursor:pointer}#sbtns #send{background:var(--warn);color:#fff}#sbtns #sfab{background:var(--org);color:#fff}
body.street #tbar{display:flex;gap:6px;position:absolute;left:8px;right:76px;bottom:calc(env(safe-area-inset-bottom,0px) + 10px);z-index:8}
.tb{flex:1;border:0;border-radius:16px;background:var(--c);color:#fff;padding:8px 2px;display:flex;flex-direction:column;align-items:center;box-shadow:0 3px 10px #0005;min-height:84px;cursor:pointer}.tb .e{font-size:28px}.tb .n{font-size:20px;font-weight:800}.tb .l{font-size:11px}.tb.und{background:#fff;color:#111;flex:.6}.tb:active{transform:scale(.95)}
body.street #gst{top:auto;bottom:calc(env(safe-area-inset-bottom,0px) + 104px)}body.street #gps{bottom:calc(env(safe-area-inset-bottom,0px) + 104px)}
@media (max-width:999px) and (min-height:501px){#app{flex-direction:column}#side{width:100%;height:55%;order:2;border-right:0;border-top:1px solid var(--line)}#mapwrap{height:45%;flex:none}#panel{padding-top:12px}#leg{display:none}body.street #mapwrap{height:100%}body.street #sbtns{flex-direction:row;flex-wrap:wrap;right:10px;top:calc(env(safe-area-inset-top,0px) + 150px)}#sbtns button{height:40px;min-width:40px;font-size:14px;padding:0 11px}body.street #navp{top:calc(env(safe-area-inset-top,0px) + 92px)}.navmain{font-size:18px}}
@media (max-height:500px) and (orientation:landscape){#side{width:46%}#leg{display:none}#panel{padding-top:10px}h1{font-size:19px}.big{font-size:22px}#tabs button{padding:4px 0 2px;font-size:10px}#tabs button span{font-size:18px}body.street #mapwrap{height:100%}.tb{min-height:64px}.tb .e{font-size:22px}body.street #navp{display:none}body.street #sbtns{top:calc(env(safe-area-inset-top,0px) + 86px);flex-direction:row}#sbtns button{height:36px;font-size:13px}}
@media (hover:none){#zi,#zo{display:none}}
#dvbot{position:absolute;left:8px;bottom:calc(env(safe-area-inset-bottom,0px) + 70px);width:88px;height:88px;border:0;background:none;padding:0;z-index:7;cursor:pointer;filter:drop-shadow(0 3px 4px #0004)}#dvbot svg{width:100%;height:100%;overflow:visible}
#dvbub{display:none;position:absolute;left:84px;top:6px;background:#fff;color:#111;font-size:13px;font-weight:700;padding:7px 10px;border-radius:12px 12px 12px 2px;width:150px;box-shadow:0 2px 8px #0003;text-align:left;animation:dvpop .35s ease-out}
body.street #dvbot{display:none}
.dv-b{animation:dvbob 2.8s ease-in-out infinite;transform-origin:163px 316px}.dv-arm{transform-origin:249px 216px;animation:dvwave 2.8s ease-in-out infinite}.dv-eye{transform-origin:179px 120px;transform:scaleY(0);animation:dvblink 4.2s infinite}.dv-sp{transform-origin:255px 179px;animation:dvsp 2.8s ease-in-out infinite}.dv-sh{transform-origin:163px 316px;animation:dvsh 2.8s ease-in-out infinite}
@keyframes dvbob{0%,100%{transform:translateY(0)}50%{transform:translateY(-4px)}}@keyframes dvsh{0%,100%{transform:scaleX(1)}50%{transform:scaleX(.85)}}
@keyframes dvwave{0%,55%,100%{transform:rotate(0)}65%{transform:rotate(-14deg)}75%{transform:rotate(6deg)}85%{transform:rotate(-10deg)}}
@keyframes dvblink{0%,92%,100%{transform:scaleY(0)}95%,97%{transform:scaleY(1)}}@keyframes dvsp{0%,55%,100%{opacity:1;transform:scale(1)}70%{opacity:.3;transform:scale(.8)}82%{opacity:1;transform:scale(1.15)}}@keyframes dvtilt{0%,100%{transform:rotate(0)}30%{transform:rotate(-3deg)}60%{transform:rotate(2deg)}}@keyframes dvpop{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}
@media (prefers-reduced-motion:reduce){.dv-b,.dv-arm,.dv-eye,.dv-sp,.dv-sh{animation:none}}
#mbox.orgbox{max-width:640px;padding-top:12px}.dvtop{position:sticky;top:-12px;background:var(--card);z-index:2;margin:-12px -18px 0;padding:12px 64px 0 18px;border-bottom:1px solid var(--line)}.dvhead{display:flex;gap:10px;align-items:flex-start;margin-bottom:8px}.dvmini{width:72px;height:72px;flex:none}@media (max-width:600px){.dvmini{width:54px;height:54px}.dvsay{font-size:14px;padding:8px 10px;margin-top:2px}.dvhead{margin-bottom:6px}}#mclose{width:44px;height:44px}.dvmini svg{width:100%;height:100%}
.dvsay{flex:1;background:var(--bg);border:1px solid var(--line);border-radius:4px 16px 16px 16px;padding:10px 12px;font-size:15px;margin-top:6px}.dvx{border:0;background:none;color:var(--mut);font-size:22px;padding:4px 6px;cursor:pointer}
.chips{display:flex;gap:6px;overflow-x:auto;padding:2px 0 8px;-webkit-overflow-scrolling:touch}.chips button{flex:none;border:1px solid var(--line);background:var(--card);color:var(--fg);border-radius:18px;padding:8px 12px;font:inherit;font-size:14px;font-weight:600;cursor:pointer}.chips button.on{background:var(--b);color:#fff;border-color:var(--b)}
.obar{height:7px;background:var(--line);border-radius:4px;overflow:hidden;margin:4px 0}.obar i{display:block;height:100%;border-radius:4px}
.ogrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}.ogrid2{display:grid;grid-template-columns:1fr 1fr;gap:8px 12px}.ogrid3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:8px;font-size:14px}
.otree{display:flex;flex-direction:column;align-items:stretch}.oline{width:2px;height:12px;background:var(--line);margin:0 auto}
.oslot{background:var(--card);border:1px solid var(--line);border-left:4px solid var(--b);border-radius:12px;padding:8px 10px;cursor:pointer}.oslot.empty{border-left-color:#d93025;border-style:dashed;border-left-style:solid}.oslot.big{text-align:center;border-left-width:1px;border-top:4px solid var(--b)}.oslot.big.empty{border-top-color:#d93025}
.oslot.cand{background:var(--b);color:#fff;border:0;cursor:default}.oslot.cand .orole,.oslot.cand .osub{color:#fffc}
.orole{font-size:12px;color:var(--mut);font-weight:600;text-transform:uppercase;letter-spacing:.02em}.oname{font-weight:700;margin:2px 0}.oslot.empty .oname{color:var(--mut);font-weight:500;font-size:14px}.osub{font-size:12px;color:var(--mut)}
.ozona{cursor:pointer}.octr input{width:90px;flex:none;text-align:center;font-size:20px;font-weight:700}.octr .btn{flex:none;width:52px;margin:0;padding:10px 0}
.btn.sm{display:inline-block;width:auto;font-size:15px;padding:8px 14px;margin:4px 0}

:root{--acc:#1d4f9c;--accbg:#1d4f9c14}#grab{display:none}
@media (prefers-color-scheme:dark){:root:not(.hc){--acc:#8fb3ff;--accbg:#8fb3ff22;--bg:#000;--card:#1c1c1e;--line:#2c2c2e}}
#tabs{padding:4px 4px calc(env(safe-area-inset-bottom,0px) + 2px);background:var(--card);border-top:1px solid var(--line);flex:none}
#tabs button{font-size:11px;font-weight:600;padding:4px 0 3px;gap:2px;letter-spacing:.01em;cursor:pointer}
#tabs button span{display:flex;align-items:center;justify-content:center;width:52px;height:30px;border-radius:15px;transition:background .2s}
#tabs button span svg{width:23px;height:23px}
#tabs button.on{color:var(--acc)}#tabs button.on span{background:var(--accbg)}#tabs button.on svg{stroke-width:2.3}
a,.back{color:var(--acc)}
@media (max-width:999px) and (min-height:501px){
 #mapwrap{height:auto;flex:1 1 auto}#side{height:55%;flex:none;position:relative;z-index:8;margin-top:-18px;border-radius:20px 20px 0 0;border-top:0;box-shadow:0 -6px 18px #0002;overflow:hidden}
 #grab{display:block;position:absolute;top:0;left:0;right:0;height:30px;z-index:3;touch-action:none;cursor:grab}#grab::before{content:"";position:absolute;top:7px;left:50%;width:42px;height:5px;margin-left:-21px;border-radius:3px;background:var(--mut);opacity:.45}
 #pop{max-height:calc(100% - 100px)}body.popopen #dvbot{display:none} body.sheetmax #dvbot,body.sheetmax #gps,body.sheetmax #fab,body.sheetmax #gst{display:none} #side.sheetmin #panel{display:none}#side.sheetmin{justify-content:flex-end}#panel{min-height:0}#tabs{flex:none}
 #panel{padding-top:18px}
 #fab{bottom:32px}#gps{bottom:32px}#dvbot{bottom:90px}
 body.street #side{display:none}body.street #mapwrap{height:100%}
}
@media (max-width:999px) and (min-height:501px) and (max-height:700px){#tabs button span{height:26px}#tabs button{font-size:10px}}
h1{letter-spacing:-.01em}.card{border-radius:16px}
.vr-h{font-size:12px;font-weight:700;color:var(--mut);text-transform:uppercase;letter-spacing:.03em;margin:8px 0 2px}.vr{margin:3px 0}.vr-t{display:flex;justify-content:space-between;gap:8px;font-size:13.5px;line-height:1.3}.vr-b{height:6px;background:var(--line);border-radius:3px;overflow:hidden;margin-top:2px}.vr-b i{display:block;height:100%;border-radius:3px}.vr-s{font-size:12px;color:var(--mut);margin-top:1px}.vr-f{font-size:12.5px;color:var(--mut);margin-top:6px}
#panel{contain:paint;clip-path:inset(0)}#mbox{contain:paint}
@media (max-width:999px) and (min-height:501px){#side{contain:paint;clip-path:inset(0 round 20px 20px 0 0);isolation:isolate}}
.hstat{display:flex;gap:6px;flex-wrap:wrap;margin:0 0 6px}.pill{border:1px solid var(--line);border-radius:16px;padding:6px 11px;font:inherit;font-size:13px;font-weight:700;background:var(--bg);color:var(--fg);cursor:pointer}.pill.pd{background:var(--warn);color:#fff;border-color:var(--warn)}
#gst{transition:opacity .6s}
.permhide{display:none!important}
.ic{width:1.15em;height:1.15em;vertical-align:-.2em;fill:none;stroke:currentColor;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;flex:none;margin-right:.18em}
button .ic,a .ic{margin-right:.3em}.dotc{display:inline-block;width:.7em;height:.7em;border-radius:50%;vertical-align:.02em;margin-right:.3em}
#side::after{content:"";position:absolute;top:0;left:0;right:0;height:3px;background:linear-gradient(90deg,#1d4f9c 0 55%,#009a44 55% 70%,#e9e9e9 70% 85%,#ce1126 85%);z-index:4;pointer-events:none}
#mv::before{content:"";display:block;height:4px;border-radius:2px;margin:-4px 0 12px;background:linear-gradient(90deg,#1d4f9c 0 55%,#009a44 55% 70%,#e9e9e9 70% 85%,#ce1126 85%)}
.btn{border-radius:12px;font-weight:600;letter-spacing:.01em}.btn.sec{background:var(--card);border:1px solid var(--line);color:var(--fg)}.chips button{border-radius:10px}
.stpill{color:#fff;font-size:12px;font-weight:700;padding:3px 9px;border-radius:999px;white-space:nowrap}
#mvpop{position:fixed;width:260px;background:var(--card);color:var(--fg);border-radius:14px;padding:10px 12px;box-shadow:0 8px 24px #0004;z-index:40;font-size:14px;line-height:1.4}
.casrow{display:flex;align-items:center;gap:8px;padding:6px 0;border-top:1px solid var(--line);font-size:13.5px}.casrow b{flex:none;width:92px}.casrow .mut{flex:1;min-width:0}.casrow .btn{flex:none;margin:0}
#casbtn,#gbtn{width:56px;height:56px;border-radius:28px;border:0;background:var(--card);color:var(--b);box-shadow:0 2px 8px #0003;display:flex;align-items:center;justify-content:center;font-size:24px;cursor:pointer}#casbtn.on,#gbtn.on{background:var(--b);color:#fff}#casbtn .ic,#gbtn .ic{margin:0;width:26px;height:26px}
body.nodv #dvbot{display:none!important}
#fab,#sfab{background:#009a44!important;color:#fff!important}
#leg .sem{margin-right:6px}

#toast{top:auto!important;bottom:calc(env(safe-area-inset-bottom,0px) + 96px)!important}
#msq{position:absolute;left:10px;right:76px;top:calc(env(safe-area-inset-top,0px) + 10px);z-index:7;max-width:420px}
#msqi{width:100%;margin:0;border-radius:14px;border:0;box-shadow:0 2px 10px #0003;padding:11px 14px;font-size:16px;background:var(--card);color:var(--fg)}
#msqr{background:var(--card);border-radius:12px;margin-top:6px;box-shadow:0 4px 14px #0003;overflow:hidden}#msqr:empty{display:none}
.msr{padding:10px 14px;border-bottom:1px solid var(--line);cursor:pointer;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.msr:last-child{border-bottom:0}.msr:active{background:var(--accbg)}
#pop{top:calc(env(safe-area-inset-top,0px) + 62px)}
body.street #msq,body.sheetmax #msq{display:none}
.fgrid{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:6px}.fgrid select{margin:0;width:100%}
.ptab{border-collapse:collapse;width:100%;font-size:14px;margin:8px 0}.ptab th{font-size:12px;font-weight:700;padding:6px 4px;text-align:center;color:var(--mut)}.ptab td{border-top:1px solid var(--line);padding:8px 4px}.ptab td:not(:first-child){text-align:center}.ptab input{width:22px;height:22px}
body.maestra #side,body.maestra #fab,body.maestra #dvbot,body.maestra #msq,body.maestra #pop,body.maestra #gst,body.maestra #grab,body.maestra #gps{display:none!important}
body.maestra #mapwrap{position:fixed;top:0;left:0;right:0;bottom:0;height:auto!important;z-index:1}
#mv{position:fixed;right:16px;top:calc(env(safe-area-inset-top,0px) + 16px);bottom:calc(env(safe-area-inset-bottom,0px) + 16px);width:380px;overflow:auto;background:var(--card);border-radius:22px;padding:18px;z-index:30;box-shadow:0 8px 30px #0004;-webkit-overflow-scrolling:touch}
@media (max-width:820px){#mv{left:10px;right:10px;width:auto;top:auto;height:46%;bottom:calc(env(safe-area-inset-bottom,0px) + 10px)}}
.mvt{font-size:24px;font-weight:800;letter-spacing:-.01em}.mvclock{font-size:34px;font-weight:800;font-variant-numeric:tabular-nums}
.mvlive{display:inline-block;width:9px;height:9px;border-radius:5px;background:#1a9d2b;animation:mvp 1.6s infinite;vertical-align:middle}@keyframes mvp{50%{opacity:.25}}
.mvg{display:grid;grid-template-columns:1fr 1fr;gap:8px}.mvk{background:var(--bg);border-radius:14px;padding:10px 12px}.mvv{font-size:28px;font-weight:800;line-height:1.1}.mvs{font-size:15px;color:var(--mut);font-weight:600}.mvl{font-size:12.5px;color:var(--mut);margin-top:2px}
.mvi{display:flex;gap:8px;align-items:center;padding:6px 0;border-bottom:1px solid var(--line);font-size:14px}.mvd{width:10px;height:10px;border-radius:5px;flex:none}
.mvleg{display:flex;flex-wrap:wrap;gap:12px;margin-top:12px;font-size:12.5px;color:var(--mut)}.mvleg i{display:inline-block;width:11px;height:11px;border-radius:6px;margin-right:5px;vertical-align:-1px}
.mvx{border:1px solid var(--line);background:var(--bg);color:var(--fg);width:40px;height:40px;border-radius:20px;font-size:18px;cursor:pointer;flex:none}

@media (prefers-reduced-motion:no-preference){
 #modal{animation:mfade .22s ease-out}#modal #mwrap{animation:mup .3s cubic-bezier(.2,.9,.25,1)}
 #modal.closing{animation:mfadeout .22s ease-in forwards}#modal.closing #mwrap{animation:mdown .22s cubic-bezier(.4,0,1,1) forwards}
 #photo[style*="flex"]{animation:pfade .2s ease-out}#photo[style*="flex"] img{animation:pzoom .25s cubic-bezier(.2,.9,.25,1)}
 #panel.inR>*{animation:tinR .28s cubic-bezier(.2,.8,.2,1)}#panel.inL>*{animation:tinL .28s cubic-bezier(.2,.8,.2,1)}#panel.inF>*,#mbox.inF>*{animation:tinF .2s ease-out}
 .btn,.item,.chips button,.pill,#tabs button span,.oslot,.dcas,.tb,#gps button,#fab,#dvbot{transition:transform .12s ease,background-color .15s}
 .btn:active,.chips button:active,.pill:active,#gps button:active,#fab:active{transform:scale(.96)}#dvbot:active{transform:scale(.92)}
 .item:active,.oslot:active{background:var(--accbg)}#tabs button:active span{transform:scale(.9)}
 #pop[style*="block"]{animation:tinF .18s ease-out}#toast[style*="block"]{animation:toastin .25s cubic-bezier(.2,.9,.25,1)}
}
@keyframes mfade{from{background-color:#0000}}@keyframes mfadeout{to{background-color:#0000}}
@keyframes mup{from{transform:translateY(100%)}}@keyframes mdown{to{transform:translateY(105%)}}
@keyframes pfade{from{opacity:0}}@keyframes pzoom{from{transform:scale(.9);opacity:.4}}
@keyframes tinR{from{transform:translateX(26px);opacity:0}}@keyframes tinL{from{transform:translateX(-26px);opacity:0}}@keyframes tinF{from{opacity:0;transform:translateY(4px)}}
@keyframes toastin{from{transform:translate(-50%,-14px);opacity:0}}

'''
build = hashlib.md5((js + css + datajs).encode()).hexdigest()[:8]
js = js.replace('__BUILD__', build)
html = '''<!doctype html><html lang="es"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover,user-scalable=no">
<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="default"><meta name="apple-mobile-web-app-title" content="DL02"><meta name="theme-color" media="(prefers-color-scheme: light)" content="#f3efe6"><meta name="theme-color" media="(prefers-color-scheme: dark)" content="#000000">
<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icon-180.png"><link rel="icon" href="icon-192.png">
<title>DL02</title><style>''' + css + '''</style></head><body>
<div id="gate" style="position:fixed;top:0;right:0;bottom:0;left:0;z-index:9999;background:#1d4f9c;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px"><div style="font-size:30px;font-weight:800">DL02</div><div>Clave de acceso</div><input id="pin" type="password" inputmode="numeric" autocomplete="off" style="font-size:24px;padding:12px 14px;border-radius:12px;border:0;width:220px;text-align:center;letter-spacing:8px;color:#111;background:#fff"><button id="pinb" style="font-size:18px;padding:12px 26px;border-radius:12px;border:0;background:#fff;color:#1d4f9c;font-weight:700">Entrar</button><div id="pinerr" style="color:#ffd27a;height:22px"></div></div>
<div id="app"><div id="side"><div id="panel"></div>
<div id="tabs"><button data-t="hoy"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/></svg></span>Hoy</button><button data-t="cal"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg></span>Agenda</button><button data-t="dd"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13h16v7.5H4z"/><path d="M8 13V5.5h8V13"/><path d="M10.2 9.4l1.5 1.5 2.9-3"/></svg></span>Día D</button><button data-t="av"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h16"/><rect x="5.5" y="11" width="3" height="7" rx="1"/><rect x="10.5" y="6" width="3" height="12" rx="1"/><rect x="15.5" y="13.5" width="3" height="4.5" rx="1"/></svg></span>Avance</button><button data-t="cap"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6.5A2.5 2.5 0 0 1 6.5 4h11A2.5 2.5 0 0 1 20 6.5v8a2.5 2.5 0 0 1-2.5 2.5H10l-4.5 3.5V17A2.5 2.5 0 0 1 4 14.5z"/><path d="M8.5 9h7M8.5 12.5h4.5"/></svg></span>Gestorías</button><button data-t="mas"><span><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.5 7h15M4.5 12h15M4.5 17h15"/></svg></span>Más</button></div></div>
<div id="mapwrap"><canvas id="cv"></canvas><div id="msq"><input id="msqi" type="search" inputmode="search" autocomplete="off" placeholder="Buscar sección o colonia"><div id="msqr"></div></div><div id="pop"></div>
<div id="leg"><span class="sem" style="background:#1d4f9c"></span>Fuerte a favor<br><span class="sem" style="background:#4f86d6"></span>A favor<br><span class="sem" style="background:#f2c200"></span>Empate<br><span class="sem" style="background:#f08a1d"></span>Por recuperar<br><span class="sem" style="background:#9e9e9e"></span>No prioritaria</div>
<div id="nav"></div><div id="navp"></div><div id="sbtns"><button id="send">■ Terminar</button><button id="sfab">＋ Gestoría</button><button id="scon">🤝 Contacto</button><button id="svoice">🔊</button><button id="sexit">✕</button></div>
<div id="gps"><button id="loc" title="Mi ubicación">◎</button><button id="fit" title="Centrar">⤢</button><button id="zi">＋</button><button id="zo">−</button></div>
<button id="dvbot" aria-label="Davidsito: estructura de campaña"></button><button id="fab">＋ Gestoría</button><div id="tbar"></div><div id="gst"></div></div></div>
<div id="modal"><div id="mwrap"><button id="mclose" aria-label="Cerrar">✕</button><div id="mbox"></div></div></div><div id="photo"><button id="pclose" aria-label="Cerrar">✕</button><img id="photoimg" alt=""></div><div id="toast"></div><div id="flash"></div>
<script>
if(!Array.prototype.at){Object.defineProperty(Array.prototype,'at',{value:function(i){i=Math.trunc(i)||0;if(i<0)i+=this.length;return this[i]},writable:true,configurable:true})}
if(!Array.prototype.flatMap){Object.defineProperty(Array.prototype,'flatMap',{value:function(f,t){return [].concat.apply([],this.map(f,t))},writable:true,configurable:true})}
window.__err=function(m){try{var d=document.getElementById('crash');if(!d){d=document.createElement('div');d.id='crash';d.style.cssText='position:fixed;top:0;left:0;right:0;bottom:0;z-index:99999;background:#fff;color:#111;padding:40px 20px;font:16px system-ui;overflow:auto';document.body.appendChild(d)}d.innerHTML='<h2 style="color:#b3261e">La app no pudo arrancar</h2><p>Toca <b>Reiniciar app</b>. Si vuelve a salir, revisa tu señal o mándale captura a quien te pasó la app.</p><pre style="white-space:pre-wrap;background:#f3f3f3;padding:10px;border-radius:8px;font-size:13px">'+String(m).replace(/</g,'&lt;')+'\\n\\n'+navigator.userAgent+'</pre><button onclick="__reset()" style="font-size:18px;padding:14px 20px;border-radius:12px;border:0;background:#1d4f9c;color:#fff">Reiniciar app</button>'}catch(e){alert(m)}};
window.__reset=function(){var done=function(){location.reload()};try{var p=[];if(window.caches)p.push(caches.keys().then(function(k){return Promise.all(k.map(function(x){return caches.delete(x)}))}));if(navigator.serviceWorker)p.push(navigator.serviceWorker.getRegistrations().then(function(r){return Promise.all(r.map(function(x){return x.unregister()}))}));Promise.all(p).then(done,done)}catch(e){done()}};
window.__errs=[];window.addEventListener('error',function(e){var f=e.filename||'';if(!f&&/Script error/i.test(e.message||''))return;window.__errs.push((e.message||'Error')+' · '+f.split('/').pop()+':'+(e.lineno||'')+':'+(e.colno||''));if(window.__booted)return;});window.addEventListener('load',function(){setTimeout(function(){if(window.__booted)return;var m=window.__errs.length?window.__errs.join('\\n'):(window.__D===undefined?'No se descargaron los datos (señal débil o sin internet).':'La app no terminó de arrancar.');__err(m)},2500)});
</script>
<div id="boot" style="position:fixed;top:0;right:0;bottom:0;left:0;z-index:9998;background:#1d4f9c;color:#fff;display:flex;align-items:center;justify-content:center;flex-direction:column;gap:14px;font:18px system-ui"><div style="font-size:30px;font-weight:800">DL02</div><div id="bootmsg">Cargando mapa y recorridos…</div><div style="width:200px;height:6px;background:#ffffff40;border-radius:3px;overflow:hidden"><div style="width:40%;height:100%;background:#fff;border-radius:3px;animation:bl 1.1s infinite ease-in-out"></div></div><style>@keyframes bl{0%{transform:translateX(-100%)}100%{transform:translateX(250%)}}</style></div>
<script>setTimeout(function(){var m=document.getElementById('bootmsg');if(m&&document.getElementById('boot'))m.textContent='Señal lenta… sigue cargando'},6000)</script>
<script src="data.js?v=''' + build + '''"></script><script src="app.js?v=''' + build + '''"></script>
<script>var b=document.getElementById('boot');if(b)b.remove()</script></body></html>'''
open(OUT + 'site/app.js', 'w').write(js)
open(OUT + 'site/data.js', 'w').write(datajs)
os.makedirs(OUT + 'site', exist_ok=True)
open(OUT + 'site/index.html', 'w').write(html)
open(OUT + 'site/manifest.webmanifest', 'w').write(J({'name': 'DL02', 'short_name': 'DL02', 'start_url': './', 'scope': './', 'display': 'standalone', 'orientation': 'any', 'background_color': '#1d4f9c', 'theme_color': '#000000',
    'icons': [{'src': 'icon-192.png', 'sizes': '192x192', 'type': 'image/png'}, {'src': 'icon-512.png', 'sizes': '512x512', 'type': 'image/png', 'purpose': 'any maskable'}]}))
open(OUT + 'site/sw.js', 'w').write('''const V='dl02-''' + build + '''',CORE=['./','./data.js?v=''' + build + '''','./app.js?v=''' + build + ''''];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(CORE)).catch(()=>{}))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==V&&k!=='dl02-tiles').map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
function race(p,ms){return new Promise((res,rej)=>{const t=setTimeout(()=>rej(new Error('t')),ms);p.then(r=>{clearTimeout(t);res(r)},e=>{clearTimeout(t);rej(e)})})}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);
 if(u.hostname==='tile.openstreetmap.org'){e.respondWith(caches.open('dl02-tiles').then(c=>c.match(r)).then(h=>h||fetch(r).then(n=>{if(n.ok){const cp=n.clone();caches.open('dl02-tiles').then(c=>c.put(r,cp))}return n})).catch(()=>fetch(r)));return}
 if(u.origin!==location.origin)return;
 const scope=new URL(self.registration.scope).pathname;
 if(r.mode==='navigate'&&(u.pathname===scope||u.pathname===scope+'index.html')){
  const net=fetch(r).then(n=>{if(n.ok&&!n.redirected){const cp=n.clone();caches.open(V).then(c=>c.put('./',cp))}return n});
  e.respondWith(caches.match('./').then(h=>h?race(net,3000).catch(()=>h):net).catch(()=>fetch(r)));return}
 if(u.search.indexOf('v=''' + build + '''')>=0){e.respondWith(caches.match(r).then(h=>h||fetch(r)).catch(()=>fetch(r)))}
});''')
from PIL import Image, ImageDraw, ImageFont
for sz in (180, 192, 512):
    im = Image.new('RGB', (sz, sz), '#1d4f9c'); d = ImageDraw.Draw(im)
    try: f = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', int(sz * .3))
    except Exception: f = ImageFont.load_default()
    d.rounded_rectangle([sz * .12, sz * .62, sz * .88, sz * .7], radius=sz * .04, fill='#f08a1d')
    t = 'DL02'; w = d.textlength(t, font=f); d.text(((sz - w) / 2, sz * .24), t, font=f, fill='white')
    im.save(OUT + 'site/icon-%d.png' % sz)
print('build', build, 'index KB', len(html.encode()) // 1024)

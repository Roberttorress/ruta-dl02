import struct, math

def read_dbf(path):
    with open(path, 'rb') as f:
        hdr = f.read(32)
        nrec, hlen, rlen = struct.unpack('<IHH', hdr[4:12])
        fields = []
        pos = 32
        while True:
            fd = f.read(32)
            if fd[0] == 0x0D:
                break
            name = fd[:11].split(b'\x00')[0].decode('latin1')
            ftype = chr(fd[11]); flen = fd[16]
            fields.append((name, ftype, flen))
        f.seek(hlen)
        recs = []
        for _ in range(nrec):
            r = f.read(rlen)
            if not r or r[0] == 0x2A:
                continue
            d = {}; p = 1
            for name, ftype, flen in fields:
                raw = r[p:p+flen]; p += flen
                s = raw.decode('latin1').strip()
                if ftype in 'NF':
                    try: s = int(s) if '.' not in s else float(s)
                    except: s = None
                d[name] = s
            recs.append(d)
    return fields, recs

def read_shp(path):
    """Return list of shapes; polygon -> list of rings [(x,y),...]; point -> (x,y)."""
    out = []
    with open(path, 'rb') as f:
        f.seek(24); flen = struct.unpack('>I', f.read(4))[0]*2
        f.seek(32); stype = struct.unpack('<i', f.read(4))[0]
        f.seek(100)
        while f.tell() < flen:
            rh = f.read(8)
            if len(rh) < 8: break
            num, clen = struct.unpack('>ii', rh)
            content = f.read(clen*2)
            t = struct.unpack('<i', content[:4])[0]
            if t == 0:
                out.append(None); continue
            if t in (1, 11, 21):
                x, y = struct.unpack('<dd', content[4:20]); out.append((x, y)); continue
            if t in (3, 5, 13, 15, 23, 25):
                nparts, npts = struct.unpack('<ii', content[36:44])
                parts = struct.unpack('<%di' % nparts, content[44:44+4*nparts])
                off = 44+4*nparts
                pts = struct.unpack('<%dd' % (2*npts), content[off:off+16*npts])
                pts = list(zip(pts[0::2], pts[1::2]))
                rings = []
                for i in range(nparts):
                    s = parts[i]; e = parts[i+1] if i+1 < nparts else npts
                    rings.append(pts[s:e])
                out.append(rings); continue
            out.append(None)
    return out

def utm14n_to_wgs84(x, y):
    a = 6378137.0; f = 1/298.257223563; k0 = 0.9996
    e2 = f*(2-f); ep2 = e2/(1-e2)
    lon0 = math.radians(-99.0)
    x = x - 500000.0
    M = y/k0
    e1 = (1-math.sqrt(1-e2))/(1+math.sqrt(1-e2))
    mu = M/(a*(1-e2/4-3*e2*e2/64-5*e2**3/256))
    phi1 = mu + (3*e1/2-27*e1**3/32)*math.sin(2*mu) + (21*e1*e1/16-55*e1**4/32)*math.sin(4*mu) + (151*e1**3/96)*math.sin(6*mu) + (1097*e1**4/512)*math.sin(8*mu)
    N1 = a/math.sqrt(1-e2*math.sin(phi1)**2)
    T1 = math.tan(phi1)**2
    C1 = ep2*math.cos(phi1)**2
    R1 = a*(1-e2)/(1-e2*math.sin(phi1)**2)**1.5
    D = x/(N1*k0)
    lat = phi1 - (N1*math.tan(phi1)/R1)*(D*D/2 - (5+3*T1+10*C1-4*C1*C1-9*ep2)*D**4/24 + (61+90*T1+298*C1+45*T1*T1-252*ep2-3*C1*C1)*D**6/720)
    lon = lon0 + (D - (1+2*T1+C1)*D**3/6 + (5-2*C1+28*T1-3*C1*C1+8*ep2+24*T1*T1)*D**5/120)/math.cos(phi1)
    return math.degrees(lon), math.degrees(lat)

def ring_area(r):
    return 0.5*sum(r[i][0]*r[(i+1)%len(r)][1]-r[(i+1)%len(r)][0]*r[i][1] for i in range(len(r)))

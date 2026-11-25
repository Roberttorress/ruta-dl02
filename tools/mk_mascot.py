from PIL import Image, ImageDraw
import numpy as np, scipy.ndimage as nd, base64, io, sys
SRC = sys.argv[1]
im = Image.open(SRC).convert('RGB'); a = np.array(im).astype(int)
light = (a.min(2) > 200)
lab, n = nd.label(light); border = set(np.unique(np.r_[lab[0], lab[-1], lab[:, 0], lab[:, -1]])) - {0}
bg = np.isin(lab, list(border))
alpha = np.where(bg, 0, 255).astype(float)
edge = nd.binary_dilation(bg, iterations=2) & ~bg
lum = a.mean(2); alpha[edge] = np.clip((255 - lum[edge]) * 255 / 120, 0, 255)
rgba = np.dstack([a, alpha]).astype(np.uint8)
H, W = a.shape[:2]
red = (a[:, :, 0] > 140) & (a[:, :, 1] < 90) & (a[:, :, 2] < 90); yy, xx = np.mgrid[:H, :W]
spark = nd.binary_dilation(red & (xx > 1000) & (yy < 720), iterations=4) & ~bg
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(898, 700), (935, 640), (1080, 650), (1080, 842), (905, 842), (893, 780)], fill=255)
hand = (np.array(m) > 0) & ~bg & ~spark
def layer(mask):
    r = rgba.copy(); r[:, :, 3] = np.where(mask, r[:, :, 3], 0); return Image.fromarray(r)
S = 320; k = S / 1254
def uri(img, box=None):
    img = img.resize((S, S), Image.LANCZOS)
    b = io.BytesIO(); img.save(b, 'WEBP', quality=85, method=6); return 'data:image/webp;base64,' + base64.b64encode(b.getvalue()).decode()
U = [uri(layer(~hand & ~spark)), uri(layer(hand)), uri(layer(spark))]
sk = '#%02x%02x%02x' % tuple(int(v) for v in a[500, 640])
f = lambda v: round(v * k, 1)
img = lambda u: f'<image href="{u}" width="{S}" height="{S}"/>'
svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" class="dv dvimg">'
       f'<ellipse cx="{f(640)}" cy="{f(1235)}" rx="{f(330)}" ry="{f(18)}" fill="#0003" class="dv-sh"/><g class="dv-b">' + img(U[0]) +
       f'<g class="dv-eye"><ellipse cx="{f(578)}" cy="{f(535)}" rx="{f(36)}" ry="{f(56)}" fill="{sk}"/><ellipse cx="{f(820)}" cy="{f(515)}" rx="{f(35)}" ry="{f(54)}" fill="{sk}"/>'
       f'<path d="M{f(545)} {f(545)}q{f(33)} {f(16)} {f(66)} 0M{f(787)} {f(525)}q{f(33)} {f(16)} {f(66)} 0" stroke="#111" stroke-width="{f(10)}" fill="none" stroke-linecap="round"/></g>'
       f'<g class="dv-arm">' + img(U[1]) + '</g><g class="dv-sp">' + img(U[2]) + '</g></g></svg>')
open('mascot.svg', 'w').write(svg)
print('KB', [len(u) // 1024 for u in U], 'arm', f(975), f(845), 'eye', f(700), f(470), 'sp', f(1000), f(700), 'base', f(640), f(1240))

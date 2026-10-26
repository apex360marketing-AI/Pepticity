"""Print the V2 front label (and a peptide back panel seen through the glass) onto the four TOWER end-frames.
media/tower/tN-blank.jpg -> media/tower/tN.jpg"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
import label as L

M = L.ROOT.parent / 'media/tower'
SHOTS = {
    1: (dict(cx=1365, r=153, top=480, bot=888, contact=905), 'NAD'),
    2: (dict(cx=1345, r=130, top=511, bot=893, contact=905), 'AOD'),
    3: (dict(cx=1017, r=141, top=465, bot=845, contact=858), 'EPI'),
    4: (dict(cx=1403, r=127, top=440, bot=810, contact=818), 'GHK'),
}
KEEP = {3: (700, 180, 1620, 1158)}   # colour allowed only inside this box (stray tint in the bokeh goes grey)
front = L.trim(L.ART / 'V2.png')
for i, (geo, pep) in SHOTS.items():
    L.B = geo
    im = Image.open(M / f't{i}-blank.jpg').convert('RGB')
    if i in KEEP:
        g = im.convert('L').convert('RGB'); box = KEEP[i]
        g.paste(im.crop(box), box[:2]); im = g
    base = np.asarray(im).astype(np.float32) / 255
    back = L.trim(L.ART / f'back-{pep}.png')
    res = base.copy()
    L.put(res, L.wrap(back, 1.3, 0.62, 0.47, True), 0.2, far=True)
    Ly = L.wrap(front, 0.95, 0.86, 0.5, False); ink = L.put(res, Ly, 0.95); L.reflect(res, Ly, ink)
    res += (np.random.default_rng(i).standard_normal(res.shape[:2])[..., None] * 0.006).astype(np.float32)
    Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(M / f't{i}.jpg', quality=86, optimize=True, progressive=True)
    print('ok', i)

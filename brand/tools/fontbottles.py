"""Print each candidate font (front wordmark + back panel) onto her bottle. -> src/fontbottles/F01-front.jpg ..."""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
import label as L

OUT = L.ROOT / 'src/fontbottles'; OUT.mkdir(exist_ok=True)
base = np.asarray(Image.open(L.PH / 'b2.jpg').convert('RGB')).astype(np.float32) / 255
for i in range(1, 21):
    fid = f'F{i:02d}'
    front, back = L.trim(L.ART / f'f-{fid}-front.png'), L.trim(L.ART / f'f-{fid}-back.png')
    lf = lambda far: L.wrap(front, 0.95, 0.86, 0.5, far)
    lb = lambda far: L.wrap(back, 1.3, 0.62, 0.47, far)
    rng = np.random.default_rng(i)
    for view, near, farl in (('front', lf, lb), ('back', lb, lf)):
        res = base.copy()
        L.put(res, farl(True), 0.2 if view == 'front' else 0.28, far=True)
        Ly = near(False); ink = L.put(res, Ly, 0.95); L.reflect(res, Ly, ink)
        res += (rng.standard_normal(res.shape[:2])[..., None] * 0.006).astype(np.float32)
        im = Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).crop((285, 380, 1165, 1700)).resize((560, 840), Image.LANCZOS)
        im.save(OUT / f'{fid}-{view}.jpg', quality=84, optimize=True, progressive=True)
print('ok')

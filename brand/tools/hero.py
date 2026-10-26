"""Print the V2 front label onto the wide hero vial. -> media/v6/hero.jpg"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
import label as L

M = L.ROOT.parent / 'media/v6'
L.B = dict(cx=1715, r=199, top=760, bot=1225, contact=1250)
base = np.asarray(Image.open(M / 'hero-blank.jpg').convert('RGB')).astype(np.float32) / 255
front, back = L.trim(L.ART / 'V2.png'), L.trim(L.ART / 'back-AOD.png')
res = base.copy()
L.put(res, L.wrap(back, 1.3, 0.62, 0.47, True), 0.2, far=True)
Ly = L.wrap(front, 0.95, 0.86, 0.5, False); ink = L.put(res, Ly, 0.95); L.reflect(res, Ly, ink)
res += (np.random.default_rng(3).standard_normal(res.shape[:2])[..., None] * 0.006).astype(np.float32)
Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(M / 'hero.jpg', quality=86, optimize=True, progressive=True)
print('ok')

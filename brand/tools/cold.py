"""Print the V2 label on the cold-chain vial. -> sites/v6-garnet/src/media/cold.jpg"""
import sys, pathlib
sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import numpy as np
from PIL import Image
import label as L
M = L.ROOT.parent / 'media/v6'
L.B = dict(cx=793.5, r=128.5, top=625, bot=1000, contact=99999)
base = np.asarray(Image.open(M / 'cold-blank.jpg').convert('RGB')).astype(np.float32) / 255
front, back = L.trim(L.ART / 'V2.png'), L.trim(L.ART / 'back-AOD.png')
res = base.copy()
L.put(res, L.wrap(back, 1.3, 0.62, 0.47, True), 0.18, far=True)
L.put(res, L.wrap(front, 0.95, 0.84, 0.5, False), 0.93)
Image.fromarray((np.clip(res, 0, 1) * 255).astype(np.uint8)).save(L.ROOT.parent / 'sites/v6-garnet/src/media/cold.jpg', quality=84, optimize=True, progressive=True)
print('ok')

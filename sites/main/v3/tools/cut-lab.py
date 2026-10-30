#!/usr/bin/env python3
"""Cuts a lab film into the v3 HD frame atlases (same format as media/frames-hd):
d = 1920x1080 tiles, 2 x 2 per atlas; m = 608x1080 centre-crop tiles, 4 x 2 per atlas; 15 fps, 151 frames.
Writes to sites/main/media/frames-hd3/ (v3 only; v2 keeps media/frames-hd). Weave atlases are linked from frames-hd.
Run: python3 cut-lab.py <white|black> <film.mp4>"""
import subprocess, os, glob, json, shutil, sys
from PIL import Image
import numpy as np

def cool(im):
    """Warm stone tones (hue 0-70 and 330-360 deg) go neutral; the blue chain keeps its full colour."""
    h, sat, v = [np.asarray(c, dtype=np.float32) for c in im.convert('HSV').split()]
    warm = (h < 50) | (h > 234)
    sat[warm] *= 0.12
    return Image.merge('HSV', [Image.fromarray(x.astype(np.uint8)) for x in (h, sat, v)]).convert('RGB')
V, SRC = sys.argv[1], sys.argv[2]
MEDIA = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '../../media'))
OUT, OLD = MEDIA + '/frames-hd3', MEDIA + '/frames-hd'
TMP = '/tmp/claude-0/cut-' + V
N, FPS = 151, 15
GRID = {'d': (2, 2, 'scale=1920:1080'), 'm': (4, 2, 'scale=-2:1080,crop=608:1080:(iw-608)/2:0')}
os.makedirs(OUT, exist_ok=True)
for f in glob.glob(OLD + '/*-weave-*.webp'):
    dst = OUT + '/' + os.path.basename(f)
    if not os.path.lexists(dst): os.symlink('../frames-hd/' + os.path.basename(f), dst)
man = json.load(open(OUT + '/manifest.json')) if os.path.exists(OUT + '/manifest.json') else json.load(open(OLD + '/manifest.json'))
name = V + '-lab'
for k, (C, R, vf) in GRID.items():
    d = f'{TMP}/{k}'; shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', SRC, '-vf', f'fps={FPS},{vf}', '-frames:v', str(N), '-q:v', '2', f'{d}/%04d.jpg'], check=True)
    files = sorted(glob.glob(d + '/*.jpg'))
    while len(files) < N: files.append(files[-1])
    tw, th = Image.open(files[0]).size
    per = C * R
    for old in glob.glob(f'{OUT}/{name}-{k}-*.webp'): os.remove(old)
    nf = (N + per - 1) // per
    for a in range(nf):
        at = Image.new('RGB', (tw * C, th * R))
        for j in range(per):
            i = a * per + j
            if i < N: at.paste(cool(Image.open(files[i])), ((j % C) * tw, (j // C) * th))
        at.save(f'{OUT}/{name}-{k}-{a:03d}.webp', quality=72, method=5)
    man[name][k] = {'n': N, 'tw': tw, 'th': th, 'cols': C, 'rows': R, 'files': nf}
json.dump(man, open(OUT + '/manifest.json', 'w'), indent=1)
print(name, json.dumps({k: man[name][k] for k in GRID}))

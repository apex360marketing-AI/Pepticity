#!/usr/bin/env python3
"""Builds sites/main/media from /home/user/pepticity/media.
Frame sequences are extracted at 15 fps and packed into WebP atlases so the whole
site stays under ~60 MB and the artifact file limits (site.js cross-fades
neighbouring frames, so 15 fps scrubs smoothly).
d = landscape 1024x576 tiles, 3 x 2 per atlas; m = portrait 432x768 centre-crop
tiles, 4 x 2 per atlas.
White weave: the misspelt sign + wobble (about 9.45 s to 11.0 s) is cut out and
bridged with a 0.5 s cross-dissolve."""
import subprocess, os, glob, json, shutil, sys
from PIL import Image
SRC = '/home/user/pepticity/media'
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'media')
TMP = sys.argv[1] if len(sys.argv) > 1 else '/tmp/pc-frames'
FPS = 15
GRID = {'d': (3, 2), 'm': (4, 2)}
Q = {'d': 54, 'm': 54}
os.makedirs(OUT + '/frames', exist_ok=True)

def run(*a):
    subprocess.run(a, check=True)

def extract(name, src, cut=None):
    for kind, vf in (('d', 'scale=1024:578,crop=1024:576:0:1'),
                     ('m', 'crop=608:1080:652:0,scale=432:768')):
        d = f'{TMP}/{name}-{kind}'
        shutil.rmtree(d, ignore_errors=True); os.makedirs(d)
        if cut:
            a, b, x = cut
            fc = (f'[0:v]trim=0:{a},setpts=PTS-STARTPTS,fps={FPS}[a];'
                  f'[0:v]trim={b},setpts=PTS-STARTPTS,fps={FPS}[b];'
                  f'[a][b]xfade=transition=fade:duration={x}:offset={a - x},{vf}[o]')
            run('ffmpeg', '-v', 'error', '-y', '-i', src, '-filter_complex', fc, '-map', '[o]', '-q:v', '2', f'{d}/%04d.jpg')
        else:
            run('ffmpeg', '-v', 'error', '-y', '-i', src, '-vf', f'fps={FPS},{vf}', '-q:v', '2', f'{d}/%04d.jpg')
        files = sorted(glob.glob(f'{d}/*.jpg'))
        tw, th = Image.open(files[0]).size
        COLS, ROWS = GRID[kind]
        per = COLS * ROWS
        for old in glob.glob(f'{OUT}/frames/{name}-{kind}-*.*'):
            os.remove(old)
        for i in range(0, len(files), per):
            sheet = Image.new('RGB', (tw * COLS, th * ROWS))
            for j, f in enumerate(files[i:i + per]):
                sheet.paste(Image.open(f), ((j % COLS) * tw, (j // COLS) * th))
            sheet.save(f'{OUT}/frames/{name}-{kind}-{i // per:03d}.webp', 'WEBP', quality=Q[kind], method=5)
        MAN.setdefault(name, {})[kind] = {'n': len(files), 'tw': tw, 'th': th, 'cols': COLS, 'rows': ROWS,
                                          'files': (len(files) + per - 1) // per}
        print(name, kind, len(files), 'frames')

MAN = {}
extract('white-weave', f'{SRC}/city/white-weave.mp4', cut=(9.45, 11.0, 0.5))
extract('black-weave', f'{SRC}/city/black-weave.mp4')
extract('white-lab', f'{SRC}/city/white-lab.mp4')
extract('black-lab', f'{SRC}/city/black-lab.mp4')
json.dump(MAN, open(f'{OUT}/frames/manifest.json', 'w'), indent=1)

# chest films: 1280 wide, no audio track exists in the source
for v in ('white', 'black'):
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{SRC}/chest/{v}.mp4', '-an', '-vf', 'scale=1280:-2', '-c:v', 'libx264',
        '-preset', 'slow', '-crf', '25', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', f'{OUT}/chest-{v}.mp4')
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{SRC}/chest/{v}.mp4', '-frames:v', '1', '-vf', 'scale=1280:-2', '-q:v', '4', f'{OUT}/chest-{v}-poster.jpg')
    # door still (last weave frame) for the opening doors, lab still for reduced motion
    run('ffmpeg', '-v', 'error', '-y', '-sseof', '-0.05', '-i', f'{SRC}/city/{v}-weave.mp4', '-frames:v', '1', '-update', '1', '-q:v', '3', f'{OUT}/{v}-doors.jpg')
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{SRC}/city/{v}-lab.mp4', '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '4', f'{OUT}/{v}-lab.jpg')
    run('ffmpeg', '-v', 'error', '-y', '-i', f'{SRC}/city/{v}-weave.mp4', '-frames:v', '1', '-vf', 'scale=1600:-2', '-q:v', '4', f'{OUT}/{v}-city.jpg')
print(json.dumps(MAN))

#!/usr/bin/env python3
"""Grades a film like the lab frames (warm stone tones go neutral, the blue accent keeps its colour) and writes mp4 + webm for the site.
Run: python3 grade-film.py <in.mp4> <out-base>   ->  <out-base>.mp4 and <out-base>.webm"""
import subprocess, sys, numpy as np
from PIL import Image
SRC, OUT = sys.argv[1], sys.argv[2]
W, H = 1912, 1080
def cool(a):
    hsv = np.asarray(Image.fromarray(a).convert('HSV')).astype(np.float32)
    warm = (hsv[..., 0] < 50) | (hsv[..., 0] > 234); hsv[..., 1][warm] *= 0.12
    return np.asarray(Image.fromarray(hsv.astype(np.uint8), 'HSV').convert('RGB'))
rd = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', SRC, '-vf', f'scale={W}:{H}', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], stdout=subprocess.PIPE)
enc = [subprocess.Popen(['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{W}x{H}', '-r', '24', '-i', '-'] + a, stdin=subprocess.PIPE) for a in (
    ['-an', '-c:v', 'libx264', '-crf', '23', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-g', '12', '-movflags', '+faststart', OUT + '.mp4'],
    ['-an', '-c:v', 'libvpx-vp9', '-crf', '36', '-b:v', '0', '-row-mt', '1', '-g', '12', OUT + '.webm'])]
n = 0
while True:
    buf = rd.stdout.read(W * H * 3)
    if len(buf) < W * H * 3: break
    fr = cool(np.frombuffer(buf, np.uint8).reshape(H, W, 3)).tobytes()
    for e in enc: e.stdin.write(fr)
    n += 1
for e in enc: e.stdin.close(); e.wait()
print(OUT, n, 'frames')

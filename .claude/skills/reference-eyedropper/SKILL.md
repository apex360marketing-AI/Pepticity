---
name: reference-eyedropper
description: Match the owner's reference image for real — get the actual image into Higgsfield, generate with it as the reference, then eyedrop and measure the result against the original (palette, light/dark camo split, texture scale, dot density) side by side until it passes. Use whenever the owner says "make it like my image", "match this", "same texture", "you're not seeing it", or sends a reference for a photoreal object, character, material or texture.
---

# Reference eyedropper

Never generate from a written description alone. The reference image itself goes into every generation, and every result is measured against it.

## 1. Get the real image into Higgsfield (works in this cloud container)
The container cannot reach `upload.higgsfield.ai`. Do NOT ask the owner to change settings. Instead:
1. Make sure the image is committed and pushed in `design/references/<project>/`.
2. Get a short-lived private link: `gh api "repos/<owner>/<repo>/contents/<path>?ref=<branch>" -q .download_url`
3. `media_import_url` with that link → `media_id`. Record it in `design/references/<project>/higgsfield-media.json`.
Never publish the image anywhere public (no gists, no public repos).

## 2. Generate with the reference attached
- `generate_image` / `generate_image_batch`, model `gpt_image_2_5` unless a specialised model fits, `medias:[{value:<ref media_id>, role:"image_references"}]`.
- When combining a material from one image with a design from another, attach both and say "Image 1 is the MATERIAL… Image 2 is the CHARACTER/COMPOSITION…".
- Keep prompts short and point at the image ("copy image 1's texture 1:1"). Long descriptions pull the model away from the reference.

## 3. Eyedrop and measure (in the Higgsfield sandbox, which has internet)
Pull the reference (same download link) and the result into the sandbox, then run `$EYEDROP` (below) and look at the side-by-side with `image_paths`. It reports, for reference vs result:
- 6-colour palette (k-means) with hex values and shares,
- light/dark split (camouflage contrast: share of light-grey vs black zones at low frequency),
- texture scale (dominant dot/pattern frequency from an FFT of a centre crop),
- saturation and mean brightness.
A result passes only when palette hexes are within ΔE≈12, light/dark split within 10 points, and texture scale within 25%. Otherwise fix the prompt toward the gap the numbers show and regenerate.

## 4. Show
Send the owner one sheet: reference | result(s), labelled, via SendUserFile (display: render). Never end that message with a question dialog.

## $EYEDROP (paste into sandbox_exec)
```python
import sys,numpy as np
from PIL import Image
def stats(p):
    im=Image.open(p).convert('RGB'); im.thumbnail((512,512)); a=np.asarray(im).astype(float)
    px=a.reshape(-1,3); rng=np.random.default_rng(0); c=px[rng.choice(len(px),6,replace=False)]
    for _ in range(15):
        d=((px[:,None]-c[None])**2).sum(-1); l=d.argmin(1)
        c=np.array([px[l==k].mean(0) if (l==k).any() else c[k] for k in range(6)])
    sh=np.bincount(l,minlength=6)/len(l); o=np.argsort(-sh)
    g=np.asarray(Image.fromarray(a.astype('uint8')).convert('L').resize((64,64))).astype(float)
    light=(g>np.median(g)+15).mean(); dark=(g<np.median(g)-15).mean()
    h,w=a.shape[:2]; cr=np.asarray(Image.fromarray(a.astype('uint8')).convert('L'))[h//4:3*h//4,w//4:3*w//4].astype(float)
    F=np.abs(np.fft.fftshift(np.fft.fft2(cr-cr.mean()))); cy,cx=np.array(F.shape)//2; F[cy-3:cy+4,cx-3:cx+4]=0
    yy,xx=np.unravel_index(F.argmax(),F.shape); freq=np.hypot(yy-cy,xx-cx)/max(cr.shape)
    hsv=np.asarray(Image.fromarray(a.astype('uint8')).convert('HSV')).astype(float)
    return dict(palette=[('#%02X%02X%02X'%tuple(map(int,c[k])),round(sh[k],2)) for k in o],light=round(light,2),dark=round(dark,2),texture_freq=round(freq,3),sat=round(hsv[...,1].mean()/255,2),bright=round(a.mean()/255,2))
for p in sys.argv[1:]: print(p,stats(p))
```

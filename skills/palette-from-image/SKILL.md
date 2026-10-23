---
name: palette-from-image
description: Extract a usable palette from a photo, hero image, mood board, product shot or logo with the bundled dependency-free extract.mjs (PNG decode, k-means in OKLab), then assign roles (ground, ink, accent), drop colours that break the owner's taste rules and turn the result into a full palette. Use when someone says "pull colours from this image", "match the photo", "palette from my logo", "colours from this mood board", "make the site match the hero image", "what colours are in this", or shares an image and wants a scheme from it.
---

# Palette from an image

`extract.mjs` (this folder, Node 18+, no dependencies) reads 8-bit non-interlaced PNGs. Convert anything else first.

```bash
magick hero.jpg -resize 256x256 -depth 8 -interlace none /tmp/hero.png   # or: sips -s format png hero.jpg --out /tmp/hero.png
node extract.mjs /tmp/hero.png 6          # table + roles
node extract.mjs /tmp/hero.png 6 --json   # for further processing
```
Example output (test image: ivory ground, espresso band, oxblood block, gold patch):
```
#f3eee4   51.4%  oklch(95.0% 0.014 85)
#3b2a22   30.0%  oklch(30.3% 0.029 46)
#6b1d2a   16.3%  oklch(36.1% 0.110 15)
#c9a96a    2.3%  oklch(74.9% 0.090 83)  BANNED: gold/amber zone
roles: {"ground":"#f3eee4","ink":"#3b2a22","accent":"#6b1d2a","mode":"light"}
```

In a browser artifact, do the same with canvas: draw the image at ≤ 128px on the long side, read `getImageData`, skip alpha < 128, and run the same k-means (port the ~30-line `extract()` function).

## 1. Choose k and the crop
- Photos: k = 6-8. Logos: k = 3-5, and drop the background colour (usually the most common, near-white or transparent).
- Crop to the part of the image that will sit next to UI (the hero's top band is what the nav touches). Extract from the whole image for the overall mood, from the crop for the ground.
- Downscale before extraction (≤ 256px): faster and removes noise/JPEG artefacts.

## 2. Why OKLab k-means, not "most common pixel"
Most-common-pixel and RGB median-cut (Color Thief, node-vibrant's quantiser) over-weight large dull areas and split one perceived colour into several RGB buckets. Clustering in OKLab groups what the eye groups. Still, small vivid areas matter more than their pixel share: rank accent candidates by share × chroma (the script does).

## 3. From clusters to roles
1. **Ground**: largest low-chroma cluster (C < 0.06). If the image is mostly vivid, synthesise a ground: same hue as the dominant cluster, C 0.01, L 0.97 (light) or 0.16 (dark).
2. **Ink**: the cluster farthest in lightness from the ground; then push it to L ≤ 0.25 (light mode) or ≥ 0.92 (dark) at the same hue and C ≤ 0.03. Never use the raw extracted ink without a contrast check.
3. **Accent**: highest share × chroma, not banned, C ≥ 0.06. Normalise it: keep its hue, set L 0.45-0.65 and C ≤ 0.2 so it can be a button and pass contrast with white or ink.
4. **Secondary**: the next distinct hue (ΔH ≥ 30°) at reduced chroma, used for 30% materials.
5. Expand with `node ../tonal-scales-and-tokens/palette.mjs tokens <accent>` and check with `palette.mjs info`.

Photo colours are almost always too dark or too greyed to use raw as UI colours. Keep the **hue** from the image and set **L and C** for the job.

## 4. Taste rules on extraction
Photos of wood, skin, sand, food and brass constantly produce gold/amber/mustard clusters (H 65-105). The script flags them as "rejected". Do not promote them to accent. Options: use the warm **neutral** version (same hue, C ≤ 0.03: ivory, bone, stone, which are allowed); or swap to the nearest allowed hue (pumpkin H ~50 or oxblood H ~15). Greens from foliage are banned too unless the brief is the Field Guide light theme. Say which clusters were dropped and why.

## 5. Logo specifics
- Use the vector source if available and read the fills directly; extraction is the fallback.
- Ignore anti-aliasing fringe clusters (tiny share, colour between two real fills).
- If the logo colour is banned, follow the owner rule: ask with options (platinum/bone variant recommended; client colour only on their own site; nearest allowed hue).

## 6. Deliver
Show the source image beside the swatches (in an artifact, render the image with the role swatches overlaid on the region they came from), the role table with shares and reasons, the dropped colours, and a sample hero + card using the palette on top of the photo. Then check text-over-image contrast with `contrast-and-accessibility-color` §3.

## Don't
- Don't let a 2% red stop sign in a photo become the brand accent because it's vivid; confirm the accent is meaningful to the subject.
- Don't extract from screenshots that include UI chrome.
- Don't promise "exact Pantone matches" from a photo; camera white balance shifts everything. Say the values are screen approximations.

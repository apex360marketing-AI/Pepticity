---
name: glyph-reference-match
description: Rebuild a letter, logo mark or glyph EXACTLY from the owner's reference image (e.g. the BLACK 3D font, design/references/arsenal/01-black-3d-font.png) - open the real image, zoom and crop the letter, measure its geometry in pixels (stroke widths, angles, gaps, where each piece starts and ends), turn that into polygon coordinates, render it, and compare side by side with the reference until it matches. Use whenever the owner says "make it like my image", "like the BLACK", describes how a letter should be built ("comes up the right side 90%", "cut on the same angle"), or rejects a glyph/A/logo as not matching.
---

# GLYPH REFERENCE MATCH

The owner's image is the source of truth (CLAUDE.md). Never work from a description of it. Never "improve" the shape away from it.

## Steps
1. **Open the real image** with the Read tool. Then crop and enlarge the one letter with PIL (4x, nearest/lanczos) and Read the crop. Do it again with contrast boosted so the gaps and bevel lines show.
2. **Write down the construction in plain words**, piece by piece: how many separate pieces, which edges are parallel to which, where each piece starts and stops (as a % of letter height/width), the gap widths, where cuts are horizontal vs angled.
3. **Measure in pixels** on the crop (column/row scans with PIL or by reading coordinates): cap height, outer stroke width, inner piece width, gap width, leg angle (atan of run/rise), how far up the inner piece reaches. Convert to the glyph's 100-unit cap-height grid.
4. **Owner's words override when he adds detail** (e.g. "about 90% up", "a little under an inch gap", "cut on the exact same angle as the bottom"). Put those numbers in, and say where they differ from the image.
5. **Build the polygons** (y down, 100 units cap height), with consistent angles: every parallel edge uses the same slope; every cut that "matches" another uses the identical angle.
6. **Render** it in the real 3D scene (same material, light, bevel) and as a flat silhouette.
7. **Compare side by side**: reference crop | flat silhouette | 3D render, at the same height, in ONE image. Overlay the silhouette at 50% on the reference if proportions are in doubt. Fix and repeat until the pieces, gaps and angles match.
8. **Show the owner only what he asked for** (e.g. "the A's and nothing else"), as the side-by-side image, before touching any other letter.

## Finish details the owner set (ARSENAL font, 30 Oct 2026)
- Every letter's edges rounded just a little (small bevel radius on the extrusion, rounded polygon corners ~1.5-2.5 units), so the glow edge reads smoother.
- Edge glow: chartreuse "lemon-lime neon", a touch more lime and brighter than #d4ff3a (around #c8ff26), never green, never yellow-gold.
- Gunmetal face, lighter grey like the very first version (commit df7c174).

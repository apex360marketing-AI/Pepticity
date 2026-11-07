---
name: matte-uv-4d
description: Use for any PEPTICITY logo, medallion, emblem, 3D word or hero object where the owner wants MATTE plus a bright UV glow so it pops and reads as 4D. Real three.js 3D with a matte body and a bright UV accent that wakes on hover, travels along edges and reacts to pointer, scroll and time. Fixes "too dark": the matte body is lifted graphite, never black.
---
# MATTE + UV = 4D

Owner (7 Nov): "a matte colour but also a nice bright UV so it pops and creates that 4D illusion", "too dark", "I want to click through it, never screenshots".

4D = real 3D (depth) + time (idle breathing) + pointer (lean, hover wake) + scroll (turn). A still image is not 4D. Pairs with: matte-finish (body), uv-black-finish (grazing sheen), underglow-lighting (light under layers), 4d-direction (motion budget), luxury-3d-logo (finish quality). This skill is the PAIRING rule.

## Recipe
1. BODY (matte): MeshStandardMaterial roughness 0.82-0.9, metalness 0.15-0.35, NO clearcoat. Colour LIFTED graphite (#3a3d44 to #55585f), never below L* 22. A matte object must still show its shape: key light from upper left, cool fill, one rim light.
2. UV (bright): emissive inlays on the edges, seams and the P outline. UV colours: #B000FF, #7A5CFF, #3DF0FF (pick ONE per object, a second only as a tiny glint). Emissive intensity at rest 0.35, on hover 1.6, eased over 280 ms. UV never fills a face: it lives on edges, grooves and inlays.
3. GLOW without postprocessing: additive sprite halos behind the UV edges plus a soft light on the surface below (underglow). Cheap, phone-safe.
4. TIME: idle breathing (scale 1 to 1.012, 6 s), a slow UV pulse travelling around the hex edge (one lap per 5 s).
5. POINTER: whole object leans toward the pointer (max 9 degrees), UV wakes and spreads from the nearest edge on hover.
6. SCROLL: the object turns with scroll (one half turn per screen height travelled), the layers beneath separate a few percent (parallax depth).
7. PHONE and reduced motion: drop pulse and lean, keep one static UV lit state, cap devicePixelRatio at 1.5.

## Where to use (show 3-4 in place)
Site watermark, loader, footer badge, card seal, hero mark.

## Proof (all in a real browser, owner clicks the real page)
- No console errors at 1440x900 and 390x844.
- Mean brightness of the object is NOT near black (report the number).
- Pixel diff before/after hover shows the UV change (report the number).
- Idle frames at 5 moments differ (it is moving).
- Samples first (two), the owner picks, then the set.

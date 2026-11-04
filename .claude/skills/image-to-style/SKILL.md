---
name: image-to-style
description: Use whenever the owner gives a reference image for a BACKGROUND, TEXTURE, MATERIAL or COLOUR look ("make the page feel like this", "this background", "this colour", "same texture", "it never looks the same") on any APEX or PEPTICITY web build, or when an image-drop control must restyle a template site. Measures the image's pixels (palette, tokens, gradients, grain, seamless tile) with tools/image-to-style, builds from those numbers, then screenshots and scores the render against the reference until it passes. Never works from a written description of the image.
---

# Image to style

Why rebuilds "never looked the same": the image was turned into words ("dark charcoal, subtle grain, faint violet glow"), and the words were turned back into CSS. Both steps lose the look. This skill skips the words: pixels in, numbers out, numbers checked against pixels.

Tools (in `tools/image-to-style/`, numpy + Pillow only, run with `python3 -I`):
- `extract.py IMAGE [--out DIR] [--region x,y,w,h] [--tile-mode blend|mirror]` writes `style.json`, `tokens.css`, `tile.png`, `tile-3x3.png`, `swatches.png`.
- `compare.py REFERENCE SCREENSHOT [--texture] [--ssim-min 0.85] [--de-max 3]` prints the scores, writes the side-by-side + heat-map sheet, exits 0 on PASS and 1 on FAIL.
- `image-to-style.js` is the same maths in the browser, with no dependencies. `ImageToStyle.extract(fileOrImg)` returns `{palette, tokens, tileDataURL}`, and `ImageToStyle.applyTokens(root, style)` sets `--bg --surface --ink --muted --accent --texture`. It powers the "drop an image" control on template sites.

## Rules
- **Never use words as the spec.** Every colour in a brief, a token file or a reply is a measured hex plus OKLCH from `style.json`. Words may sit beside the numbers but never replace them.
- **Never invent an accent.** `tokens.accent` is set only when real chroma outliers exist (pixel chroma > max(0.05, median + 6×MAD) on at least 0.1% of pixels). If it is `null`, the page has no accent, or the accent comes from the brand tokens and the reply says so.
- **Textures come from pixels or from Higgsfield.** Use either the cropped seamless `tile.png` from the reference, or a Higgsfield generation with the reference image attached (follow reference-eyedropper for the upload, and credit-guard before any spend). Never draw or synthesise a texture in code (canvas noise, SVG turbulence, PIL drawing). That is locked in CLAUDE.md. Code may only place, tile, blend or animate those assets.
- **Read the tile verdict.** If `style.json` → `tile.verdict` starts with `SCENE`, the image holds objects or light shapes and will look patterned when repeated. In that case do one of these:
  - re-run with `--region` on a flat textured area,
  - use the image itself as a single `background-size: cover` plate,
  - generate a texture in Higgsfield seeded with the reference.
  Never ship a SCENE tile as a repeat.
- **Check readable ink.** If `tokens.warning` reports ink contrast below 4.5, the image has no readable text colour. Keep the measured bg, surface and texture, take the ink from the brand tokens, and say so.
- **Brand locks win.** For PEPTICITY, the BLACK image and pepticity-brand-lock still rule. The tool measures them; it does not override them. For an "exact" lettering match, use reference-pixel-kit, not this skill.
- **No pass, no show.** Do not show the owner a render until `compare.py` prints PASS, or until you have stated exactly which check fails and why.

## The loop
1. **Save and see the reference.** Save it under `design/references/<project>/` (visual-reference-lock). Read it with the Read tool.
2. **Measure.** Run `python3 -I tools/image-to-style/extract.py <ref> --out design/references/<project>/<name>.style`, then Read `swatches.png` and `tile-3x3.png`.
3. **Turn the numbers into tokens.** Paste `tokens.css`, or map it onto the project's own names (for APEX that is `--apx-bg` and the rest, see design-tokens-theming). Use `--grad-tb`/`--grad-lr` for the light fall-off. Set grain from `grain.fine_std_8bit` (amplitude) and `dominant_period_px` (scale). Use `spectral_slope_beta` to choose the noise type when a Higgsfield texture must be briefed: about 0 is white noise, about 1 is pink noise, 2 or more is soft fBm-like noise.
4. **Render.** Build the page or section with only those tokens and assets.
5. **Screenshot** with Playwright at the reference's aspect ratio. For a layout match, crop the screenshot to the same region as the reference.
6. **Compare.**
   - Layout or composition: run `compare.py ref shot.png`. It passes when SSIM is at least 0.85 (greyscale, 512 px) and mean ΔE_ok is at most 3 (OKLab ×100, measured at 64 px so grain does not count).
   - Background or material, where pixels cannot line up: run `compare.py ref shot.png --texture`. It passes when the mean-colour ΔE_ok is at most 3, the palette ΔE_ok is at most 6, the grain ratio is between 0.8 and 1.25, and the spectrum correlation is at least 0.9.
7. **Adjust from the numbers, not by eye alone.**
   - `hint.render_minus_ref_L` above 0 means the render is too light. A positive `a` means it is too red, and a positive `b` means it is too warm.
   - A grain ratio below 0.8 means the render is too smooth: raise the texture or grain layer opacity. Above 1.25 means it is too noisy.
   - A low spectrum correlation means the texture scale is wrong: change `background-size`, or crop a different region.
   Change one thing, then go back to step 5. Stop when it passes.
8. **Show** the compare sheet (reference | render | ΔE heat | SSIM heat) with the numbers, plus the link. Follow owner-delivery-format.

## What the numbers mean (plain)
- ΔE_ok is the distance between two colours in OKLab, ×100. About 2 is the smallest difference an eye notices, and 3 or less reads as "the same". CIEDE2000 is also printed, so it can be compared with the reference-pixel-kit "ΔE 3" rule.
- SSIM measures whether the light, dark and edge structure lines up, from 0 to 1. A value of 0.90 or more looks the same at a glance.
- `share` is the fraction of the image's area that a palette colour covers. Use it to set proportions: a colour with a 3% share must not become a full-width band.

## Test record (4 Nov 2026)
- BLACK reference (`design/references/pepticity/3d-metal-type-BLACK.png`) gave bg #303030, against the owner's stated wall of #323232. The ink is #97968d and there is no accent. The tile verdict is SCENE, which is correct because the letters would repeat.
- The black-gold marble apple gave a real gold accent, #997a4a, oklch(0.599 0.0756 77.3), from 6% of pixels. black-doors gave a real violet glow accent, #372849. black-lab gave none.
- Compare checks:
  - JPEG q50 plus a 2 px shift scored SSIM 0.904 and ΔE 1.03, a PASS.
  - The tokens page set against the full BLACK image scored SSIM 0.68 and ΔE 9.5, a FAIL. That is correct, because the letters were missing.
- Full loop on a stationary wall texture:
  - The page built from the measured tokens and the tile passed: ΔE 0.44, grain ratio 0.95, spectrum correlation 0.94.
  - The same wall written from words ("dark charcoal #2b2b2b") failed: grain ratio 0.0 and spectrum correlation 0.

## Sources and prior art (all permissive licences; we reimplemented the maths, no code copied)
- OKLab / OKLCH, Björn Ottosson: https://bottosson.github.io/posts/oklab/ (matrices, public domain / MIT).
- SSIM, Wang, Bovik, Sheikh, Simoncelli 2004: https://www.cns.nyu.edu/pub/eero/wang03-reprint.pdf. scikit-image `structural_similarity` (BSD-3): https://github.com/scikit-image/scikit-image. ssim.js (MIT): https://github.com/obartra/ssim.
- CIEDE2000, Sharma, Wu, Dalal 2005: https://hajim.rochester.edu/ece/sites/gsharma/ciede2000/
- Pixel diff: pixelmatch (ISC), https://github.com/mapbox/pixelmatch, and odiff (MIT), https://github.com/dmtrKovalenko/odiff. Either can be used for a quick visual-regression diff on top of this.
- Palette extraction:
  - color-thief (MIT, median-cut): https://github.com/lokesh/color-thief
  - node-vibrant (MIT, role swatches): https://github.com/Vibrant-Colors/node-vibrant
  - culori (MIT, OKLCH conversions and ΔE): https://github.com/Evercoder/culori
  - colorjs.io (MIT): https://github.com/color-js/color.js
  We use k-means in OKLab instead of median-cut in RGB, so clusters are perceptually even.
- Seamless tiling:
  - offset-and-blend (the classic "make seamless" filter), using the variance-preserving blend from Heitz & Neyret 2018, "High-Performance By-Example Noise using a Histogram-Preserving Blending Operator": https://eheitzresearch.wordpress.com/738-2/
  - for true re-synthesis, Efros & Freeman 2001 "Image Quilting": https://people.eecs.berkeley.edu/~efros/research/quilting.html
  - Embark texture-synthesis (MIT/Apache-2.0): https://github.com/EmbarkStudios/texture-synthesis
- Colour science reference: colour-science (BSD-3), https://github.com/colour-science/colour

## Related skills
- reference-eyedropper and reference-match: getting the reference into Higgsfield.
- visual-reference-lock: saving and viewing references.
- reference-pixel-kit: exact lettering.
- design-tokens-theming: token names and contrast.
- pepticity-brand-lock: banned warm casts.
- credit-guard: before any Higgsfield spend.

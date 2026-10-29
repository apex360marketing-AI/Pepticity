---
name: reference-pixel-kit
description: Use whenever the PEPTICITY owner gives an image and says "the same", "exact", "match it", or points at his BLACK lettering. Do not redraw or re-render the look. Measure the image's real pixels (colours, sheen, shadow), cut the real lettering out of the image, and build new words from those exact pixels. Prove the match by placing the result side by side with his image before showing anything.
---

# Reference pixel kit

The owner's image IS the brand. A redraw in code (three.js, a font file, new materials) has failed three times. It misses the colour, the sheen and the 3D. Build from his pixels.

## Steps
1. **Open the image** with Read. Then zoom in: crop and upscale ×4 with PIL LANCZOS. Read every crop.
2. **Measure, don't guess.**
   - Run k-means (8 colours) on the lettering area, plus the median of the wall.
   - Save `brand/reference-kit/colours.txt` and a swatch sheet next to his image.
   - Current BLACK numbers: wall #323232; the lettering runs from #080807 to #8E8D85 (#141413 #202120 #2A2A2A #373635 #464742 #676761 in between).
3. **Cut out the real lettering.**
   - Mask the letters away from the wall: luminance contrast plus edge mask, refined by hand-drawn polygons per letter.
   - Keep each letter's own shadow on a separate layer.
   - Save each letter as a transparent PNG in `brand/reference-kit/letters/`.
4. **Build missing letters from his pieces, never from new drawing.**
   - E = the B's three bars with the bowl removed.
   - I = the K stem.
   - T = the B top bar plus the K stem.
   - P = the B upper bowl plus the K stem.
   - Y = the A chevron flipped plus the K stem.
   - C stays his C.
   - Same light direction: keep the pieces unrotated where possible. If one must flip, re-light it to match.
5. **Upscale** with a sharp method only (LANCZOS plus light unsharp). No AI re-generation unless the owner says so.
6. **Prove the match.**
   - Put the result directly under his image at the same scale.
   - Sample the face, bevel, wall and shadow pixels in both. Each must be within ΔE 3.
   - Read the side-by-side yourself. If any piece looks different, fix it before showing.

## Never
- Swap his colours for "brand-safe" ones. His image overrides the palette rules for his lettering.
- Use chrome, purple rim lights, edge glows or a two-tone A that is not in his image.
- Spend Higgsfield credits on this.
- Show anything before the side-by-side passes.

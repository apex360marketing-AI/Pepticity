---
name: clear-glass-spec
description: Use whenever building or changing a PEPTICITY glass card, panel, button, menu or bot window. The exact recipe for completely see-through liquid glass: blur + hairline edges + sheen, never a fill. Includes the pointer-reactive light and a pixel test that proves you can see through it.
---
# CLEAR GLASS SPEC (owner, 1 Nov 2026)
Owner: "The glass is supposed to be completely see-through." and "fully see through with transparency... glassmorphism, liquid glass, just make it next level." He loves the pointer-reactive glass on APEX DESK (the light moves as the cursor moves).

## Recipe
- Background: transparent, or at most rgba(255,255,255,.02). Never a colour.
- backdrop-filter: blur(10-16px) saturate(140-170%). The page behind must stay recognisable through the glass.
- Edges: 1px hairline, brighter on the top-left, softer bottom-right; accent colour only on the hairline.
- Sheen: one soft diagonal highlight (white, under 12% opacity) that follows the pointer (CSS vars --mx/--my set from pointermove, eased).
- Depth: a faint inner top highlight and a soft outer shadow. No inner glow in colour.
- Cut corners (the PEPTICITY clip-path), never rounded pills.
- Text on glass: white or near-white, at least 4.5:1 against the WORST pixel behind it. If not, darken the page behind, never fill the glass.
- Reduced motion: sheen static. Mobile: no pointer sheen, keep blur.

## Pixel test (mandatory)
1. Screenshot the page with the card, then again with the card hidden (visibility:hidden).
2. Sample 20 points inside the card area in both. The mean difference must be small (the background shows through) and contain NO consistent colour shift toward the accent.
3. Report: pass/fail with the numbers.

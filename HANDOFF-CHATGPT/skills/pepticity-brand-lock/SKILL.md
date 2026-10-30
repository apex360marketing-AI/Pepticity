---
name: pepticity-brand-lock
description: The locked PEPTICITY brand. Use before and after ANY visual PEPTICITY work (page, section, card, button, logo, vial, film, Higgsfield prompt, dashboard, email), and whenever choosing a colour, font, corner shape or hover. Includes the mandatory colour check on rendered pixels that rejects peach, pink, yellow and warm casts.
---

# PEPTICITY brand lock

## Palette: WHITE version
- Ground: bright, crisp, clean white (#ffffff to #f7f8fa). Neutral or very slightly cool. Never cream, ivory-peach or warm.
- Metal accent, choose ONE per piece:
  - Pale chrome gold (owner's approved gold-chrome): #332814 shadow · #68513d mid · #a4845d mid-light · #f0e6c7 highlight · #fef9e8 hot. Low chroma: LAB a* 3–5, b* 11–19.
  - Platinum chrome: cool silvers, e.g. #2a2d31 · #6b7077 · #b9bec5 · #e6e9ed · #ffffff.
- Text: near-black ink (#111214) on white.

## Palette: BLACK version
- Matte black ground (#0b0b0c to #141416) mixed with UV black (a deep black with a faint violet-ultraviolet sheen, e.g. #120f1a, used only as texture and glow, never as a big purple area).
- Trim: platinum chrome (owner left the pick to us, R111) or the pale chrome gold above.
- Tiny luminescence allowed (a faint glow edge), never neon floods.

## BANNED (reject on sight)
- Peach, pink, rose, salmon, blush.
- Yellow, "piss-yellow", mustard, amber, champagne, dull/faded gold (#c9a96a, #d6b676, #e6cf9c and anything like them).
- Orange casts on whites or metals; warm sunset light on the city.
- Green of any kind. Blue/purple big areas.

## Type and logo
- The owner's font is the 3D angular metal lettering in `design/references/pepticity/3d-metal-type-BLACK.png`. Open it with Read every time. Traits: very wide, geometric letters; straight cuts and sharp chamfered corners; A drawn as an open chevron with no crossbar; extruded, bevelled, brushed gunmetal/chrome faces; raised off the surface with a soft shadow.
- PEPTICITY, the P logo, all headings and standout words are set in that style and come off the screen in real 3D (three.js extruded geometry, metal material, environment reflections).
- Letters the image does not show (P, E, T, I, Y) are drawn to match its rules: same stroke width, same chamfer angle, same width-to-height ratio. Show them to the owner before use (`stage-gate`).
- The logo is a P designed in that font. It appears in the header, the spinning centre watermark (OBJ-08), the case engraving and the vial.
- ALL headings, menu items, labels and card titles in CAPITALS with a little letter-spacing. PEPTICITY and APEX 360 always in capitals, in the source too.

## Surfaces and shapes
- Glassmorphism fully see-through: the background must be clearly visible through every card and button (low fill alpha 0.04–0.10, backdrop blur 10–18px, thin chrome edge). Not milky, not solid.
- Chamfered (chipped) corners, like the APEX Master Archive card. Radius ≤ 3px where a corner is not chamfered.
- No pills, no capsules, no ampoule-shaped buttons (HOV-36 is banned forever).
- Hover: one slow, classy light sweep travelling left → right, one element at a time, about 1.2–1.6 s, ease-in-out. No bounces, no colour flips.

## Colour check (mandatory before showing anything)
- Screenshot desktop and phone. Sample at least 40 pixels across: the ground, whites, metals, glows, the hero film or photo.
- Convert to LCH/LAB (a small script is fine). For whites and metals:
  - Reject if hue is 0–75° (pink → orange → yellow) with chroma > 8 on a "white" pixel.
  - Reject gold pixels with b* > 20 or a* > 6 (too yellow or too orange).
  - Reject any pixel with hue 90–160° and chroma > 10 (green).
- Look at the screenshots with your own eyes as a second check: does the city or the page read as peach, pink or yellow? If yes, it fails even if numbers pass.
- Log the samples and the verdict in the job's checklist.

## Checks
- [ ] Ground is crisp white (or matte/UV black) with no warm cast.
- [ ] Only one metal family per piece, from the ramps above.
- [ ] Owner's font used for every heading; logo is the P in that font.
- [ ] Glass is see-through; corners chamfered; no pills.
- [ ] Hover is the slow left-to-right sweep.
- [ ] Colour check passed and logged.

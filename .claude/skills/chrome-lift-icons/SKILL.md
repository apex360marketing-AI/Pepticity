---
name: chrome-lift-icons
description: Give APEX icons and logos the owner's "Chrome Lift" look — a matte card with a real 3D chrome icon floating visibly above it (clear separation, contact shadow, accent-coloured light in the gap) that tilts with the pointer and lights up behind on hover. Use whenever icons, logos or industry tiles appear on a page or artifact.
---

# Chrome Lift icons

Owner's brief (21 Oct 2026): platinum alone is too flat. Icons and logos must POP: chrome with real reflections, standing OFF the card in 3D, not printed on it. Matte card behind, chrome icon in front. On hover the space behind the icon lights up.

## The look
- **Card**: matte (no gloss, subtle grain/noise allowed), the page's own surface colour; slightly darker inset where the icon sits.
- **Icon**: real 3D (three.js, see `threejs-real-3d` skill) extruded + bevelled from the SVG path, mirror/brushed CHROME material (metalness 1, roughness 0.12–0.25) lit by a PMREM environment so it shows real highlights; NOT flat platinum fill, NOT CSS fake.
- **Separation**: the icon floats ~10–18 px (visually) above the card: soft contact shadow on the card under it, a thin rim light on the icon edge, and an ACCENT-coloured light/glow in the gap between icon and card.
- **Accent per page — never all platinum, never all chartreuse.** Use the page's own accent for the gap light and hover glow (e.g. glacier blue on Descent Glacier, ember red on Volcanic, rosewood on Smoke & Rosewood, signal blue on Command/Orbit, vermilion on Folded Paper, pumpkin on Field Guide, chartreuse only where the page already uses it). Pick what suits each page.
- **Motion**: idle micro-float (±2 px, slow); tilts toward the pointer (max ~12°); on scroll a slight parallax so the icon moves more than the card (depth).
- **Hover / focus**: the accent light behind the icon blooms (bloom/halo behind, not over, the icon), icon lifts a little higher, card stays matte. Same on keyboard focus; tap on touch.

## Performance rules
- ONE WebGL renderer per page drawing all icons into their DOM slots (scissor/viewport), never one canvas per icon (browsers cap ~8–16 contexts).
- Render only icons on screen; pause when the tab is hidden; DPR cap 2 (1.5 mobile).
- Fallback (no WebGL / reduced motion): static pre-lit chrome SVG gradient icon with the same contact shadow and accent glow, no motion.

## Do not
- Do not change layout, copy, fonts or other colours of the page.
- Do not touch the original APEX Aurora (p1v3).
- No gold. No green except Field Guide's palette.

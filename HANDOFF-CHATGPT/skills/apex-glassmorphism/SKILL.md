---
name: apex-glassmorphism
description: Build APEX glassmorphism — truly see-through frosted glass cards and buttons in unique, non-generic shapes that look stunning over a rich background (shader, gradient, 3D, photo). Use for any glass card, button, panel or chip, and for the CRD/BTN artifact library. Builds on the neon-glass-ui skill.
---

# APEX glassmorphism

Owner's brief: "fully transparent and see-through with the glass-morphism look" over a nice background; unique shapes and styles, never generic rounded rectangles.

## Glass recipe (all via tokens)
- Fill: very thin — `linear-gradient(145deg, rgb(255 255 255 / .10), rgb(255 255 255 / .02))` on dark, inverse-tinted on light. The background must clearly read through.
- Blur: `backdrop-filter: blur(10–16px) saturate(160–200%)` — never above ~20px (turns to fog).
- Edges: 1px rim `rgb(255 255 255 / .18–.35)` + top-left specular highlight (inset 0 1px) + subtle bottom-right darker edge = thickness. Optional refraction: a faint offset copy of the backdrop via a second blurred layer, or chromatic edge (1px red/blue split) used sparingly.
- Depth: soft drop shadow tinted with the page accent; glass never pure flat.
- Light: a specular sweep or pointer-following sheen (rAF-throttled, transform/opacity only).
- Fallback: `@supports not (backdrop-filter: blur(1px))` → solid tinted surface so text stays legible.
- Contrast: text on glass must pass WCAG AA against the busiest part of the backdrop — add a soft inner scrim where needed rather than raising blur.

## Unique shapes (use and invent; no two library items alike)
Notched/chamfered corners, ticket stubs, folded corners, capsule-with-tab, asymmetric radii, superellipse/squircle, hexagon, shield, lens, pill-with-orbit, clip-path cutouts, layered double-pane (two offset glass sheets), framed glass with metal bezel, liquid blob glass (SVG goo), prism/faceted glass, perforated edge, segmented glass.

## Library contract
Token contract from the effect-catalog skill (`--apx-*`), `window.APX.<Code>.mount(root)` idempotent + destroy(), demo.html shows each item over at least 3 backgrounds (dark shader/gradient, light, photo-like) so the see-through quality is proven, plus 390px. Codes: CRD-101+ for cards, BTN-101+ for buttons. Accessibility: focus-visible ring, 24px min targets, reduced motion keeps the glass but stops motion.

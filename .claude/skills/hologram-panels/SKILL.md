---
name: hologram-panels
description: Use when a PEPTICITY scene needs a "hologram" UI moment, i.e. a see-through glass panel that projects up out of an object in the footage (the lab dropper, a vial, the scanner) and carries a hook (email, phone, offer, product). Covers the projection-in animation, scanline and light-edge look, how to anchor it to a point in a scroll-scrubbed frame sequence, legibility, density caps and reduced motion. Pure UI motion in code over existing Higgsfield footage; no new imagery.
---

# Hologram panels

A hologram is a liquid-glass panel that projects up from a real object in the film and holds one ask. It must feel like light, not like a pop-up.

## Look
- **Body:** fully see-through glass, rgba fill of 0.06–0.12, backdrop-filter blur(14px) saturate(1.4), and the brand's chipped corners. Never a pill.
- **Light:**
  - a thin accent edge (--acc) with a tight glow (0 0 6px plus 0 0 16px at 35–50% alpha)
  - a faint vertical gradient brighter at the base, where the light comes from
- **Projection beam:** a narrow cone from the anchor point (the dropper tip or vial top) up to the panel's base, built from linear gradients with mix-blend screen at low alpha.
- **Scanlines:** a repeating-linear-gradient at 2–3px pitch, 3–5% alpha, drifting slowly upward. Never full-screen flicker or strobing (WCAG 2.3).
- **Type:** headings in the PEPTICITY font, body in Instrument Sans, white at 92% with a 1px accent text-shadow. It must pass 4.5:1 against the footage behind: add a 40% dark scrim inside the panel if needed.

## Motion (GSAP)
- **In:**
  1. The beam grows up from the anchor (0.35s).
  2. The panel "prints" bottom-to-top with clip-path inset (0.6s, power3.out) while scaleY goes 0.92 to 1 and opacity 0 to 1.
  3. Scanlines start.
  4. One soft light sweep runs left to right.
- **Idle:** a 0.6px vertical float, a very slow edge breath. No blinking.
- **Out:** a reverse print, faster (0.3s).
- **Scroll-anchored:** compute the anchor's screen position from the frame sequence's known object position per frame (store keyframes {frame, x%, y%}), and interpolate so the panel tracks the object as the camera moves.

## Hooks inside
- One ask per hologram (follow hook-architecture):
  - an email field
  - OR a phone field (SMS opt-in, unticked, single purpose, CASL wording)
  - OR an offer
  - OR a product tile (only past the age gate)
- Success morph: the panel prints a "SAVED" state with the next step, then folds down.
- Max 2 holograms per scene; never two on screen at once; never over the scanner or doors moment.

## Accessibility
- The panel is a real dialog region (role="group" plus aria-label).
- Keyboard reachable; Esc folds it away.
- prefers-reduced-motion: no beam animation or scanline drift; the panel fades in.

## Checks
- [ ] Panel readable over the brightest frame (sample contrast).
- [ ] It tracks its anchor within 12px across the scrub range at 1440 and 390.
- [ ] No strobing; 60fps on a mid laptop (transform and opacity only).
- [ ] The hook works, with consent unticked; data-hook tagged.

---
name: pepticity-3d-lockup
description: How the live 3D PEPTICITY logo (the P and the PEPTICITY word) is built and embedded with three.js, covering geometry, materials, layouts, performance and fallbacks. Use when putting the logo into a header, footer, dashboard or store page, porting it to a new page, or changing its materials or layout.
---

# PEPTICITY 3D lockup

The owner picked lockup 21 on 12 Nov 2026: a smoked glass P and word, a blue light through the P and the same light below the word. The reference build is the published page https://claude.ai/artifact/UZyFxTsb8dXHNzJ4zwFYL6 . Lighting rules are in the pepticity-light skill. Do not change the design without the owner's OK.

## Build

- three.js 0.185.1 (`cdn.jsdelivr.net/npm/three@0.185.1`), with `toCreasedNormals` from the addons at a 40 degree angle. If the host page already loads three.js, reuse that copy: never load two.
- Geometry comes from `window.__marks`: `p` (face, top, bot, beam, inlay, rim, cuts) and `word` / `wordRim`. Each outline is extruded with a bevel:
  - P: depth 9, bevel 1.0.
  - Word: depth 14, bevel 1.3, leaning back 0.2 rad so its thick top edge shows.
- Materials for 21: P and word face `glass` (see-through black: colour 0x020203, metalness 0, roughness .05, ior 1.5, clearcoat .5, opacity .76, double sided), the word's edge `gunEdge` (polished gunmetal 0x8a929d, roughness .08).
- Layouts (scene units):
  - `stack`: P scale .075 at (0, 1.62, .45), word scale .0125 at (0, -3.0, 0), camera centre y .1, half height 4.75 when the accent light is shown.
  - `row` (headers): P scale .034 at (-6.95, 0, .2), word scale .0132 at (1.55, 0, 0).
- Camera: perspective, field of view 30, fitted to the slot's aspect so the lockup never clips.

## Embedding

- One WebGL renderer per page. Draw several slots with scissor and viewport.
- Render on demand: only while a slot is visible (IntersectionObserver), stop when the tab is hidden, and redraw on pointer movement or resize.
- Cap device pixel ratio at 2 on desktop and 1.5 on phones.
- `prefers-reduced-motion`: a still front pose, no sway, no spin.
- If WebGL fails, show a transparent PNG of the same layout, rendered from the reference page, with an `alt` naming PEPTICITY.
- Header: `row` layout at least 36px tall, and any product label (for example STUDIO) set as separate text beside it. Footer: `stack` or `row`.

## Check before showing the owner

- Still pose matches the reference page side by side at the same size.
- Zero page errors. The canvas does not cover clickable controls (pointer-events none on the canvas).
- A phone at 390px shows the header lockup without crowding the controls beside it.
- Run the pepticity-light review checklist.

---
name: underglow-lighting
description: Staged light for PEPTICITY logo layers - light that starts as a faint halo around the P, then spreads underneath each rising hexagon on hover/scroll so the stack reads as real 3D. Use for the logo medallion, the background watermark coin and any layered 3D emblem.
---

# Underglow lighting

## Rules
- Rest: light only around the P, very faint (accent at 10-15%). Everything else is matte/UV black.
- Hover/scroll: layers rise in stages (inner hexagon a little, P the most). As each layer lifts, a soft light pool appears UNDER it: a radial-gradient plane (additive) slightly larger than the layer, on the layer below, opacity rising with the lift.
- One accent colour only. Never two.
- The light is soft (gaussian falloff), never a hard line, except a single fine seam line where the owner asked for it.
- Shadows stay: light under a layer plus its soft contact shadow = depth.
- Flat presentation: the medallion faces the viewer square; depth comes from lift + light, not from tilting it.

## Implementation (three.js)
- Per layer: Mesh(PlaneGeometry or hex ShapeGeometry scaled 1.15x, MeshBasicMaterial{map: radial gradient, color: accent, transparent, blending: Additive, depthWrite:false}); place just above the layer below; opacity = lift * 0.5.
- Optional selective bloom (pmndrs postprocessing SelectiveBloomEffect) on the pools and edge lines only.
- Damp every value (exp damping, dt clamped 0..1/15).

## Fail if
- the colour floods the face
- the object tilts to fake depth
- light appears with no visible lift

---
name: luxury-3d-logo
description: Build a high-end, award-level 3D logo or emblem for PEPTICITY (and APEX) - the look of a luxury watch or car-brand reveal, not a web demo. Use before making ANY logo, medallion, emblem, monogram or watermark in 3D, glass, liquid glass, matte or UV finishes, and whenever the owner says the logo looks cheap, flat, busy or "not high end". Pairs with matte-finish, uv-black-finish, underglow-lighting, clear-glass-spec, 4d-direction, premium-restraint.
---

# Luxury 3D logo

The owner rejected hand-assembled three.js primitives (flat extrusions, default lights, additive sprites) as "cheap". High end comes from four things that quick builds skip: real geometry, real light, real materials, and post-processing. Never ship a logo without all four.

## 0. Define the look first, as a picture
- Make (or get) ONE photoreal hero still of the exact logo first (Higgsfield, credit-guard rules). The owner approves the picture. The live 3D must then MATCH that picture side by side.
- Keep a reference board: 3 real luxury references (watch dial, car badge, perfume cap) for edges, light and restraint. Study, never copy.

## 1. Real geometry
- Rounded, chamfered edges on everything (bevelSegments 6-10, small radius). Razor-flat extrusions read as cheap.
- Correct proportions: the mark fills about 55-62% of the emblem; generous margin.
- For anything beyond extrusion (soft pillowed glass, filleted chrome), make a GLB: Higgsfield generate_3d from the approved still, or Blender (headless, via script) when available. Optimise with gltf-transform (3d-asset-pipeline skill).

## 2. Real light
- An HDRI studio environment (Poly Haven studio HDRIs, CC0) through PMREM, not RoomEnvironment boxes. Matte, UV and chrome all depend on what they reflect.
- Light rig: one large soft key, one thin rim strip, one controlled accent. No point-light hotspots on matte.
- Accent light is a light (rect/strip), seen as reflections and edge glow. Never a flat additive sprite pasted on top.

## 3. Real materials (MeshPhysicalMaterial)
- Matte black: matte-finish skill. UV black: uv-black-finish skill.
- Chrome P: metalness 1, roughness 0.05-0.12, anisotropy for brushed faces, crisp HDRI reflections.
- Liquid glass: transmission 1, thickness 0.2-0.6, ior 1.45-1.52, roughness 0.02-0.08, attenuationColor near-black blue for depth, dispersion small. Render with the transmission pass (one renderer per hero canvas; do NOT use the multi-slot scissor stage for glass heroes).
- Frosted glass: transmission 1 with roughness 0.35-0.55.

## 4. Post-processing (pmndrs postprocessing or three EffectComposer)
- ACES or AgX tone mapping, SMAA, soft SSAO/GTAO in the creases, selective bloom on lit edges only, very light film grain, subtle vignette. This is what turns "WebGL demo" into "product film".

## 5. Motion (4d-direction)
- Rest: almost still; a slow breath of the P (1-2% move). Light only where the owner says (e.g. a corner glint + behind the P).
- Hover: staged rise (back layer 0, middle a little, P most) with eased springs; the accent light sweeps in under the layers (underglow-lighting).
- Scroll: one clear idea (e.g. the light travels round the edge, or the peptide unfolds). Flat presentation, no wobble.

## 6. Proof before showing
- Side by side: approved still | live render. Same angle. If the live one looks cheaper, it is not done.
- Screenshot rest and hover at 1440 and 390, look at every edge at 100% zoom: no faceting, no banding, no aliasing.
- Run premium-restraint (accent coverage) and verify-before-done.
- Show ONE strong version before many weak ones. Variants only once the base quality is approved.

## Never
- Default RoomEnvironment as the only light on a hero logo.
- Flat additive sprites or plain lines pretending to be light.
- Many busy layers. Fewer pieces, each perfect.
- Tilting the emblem to fake depth.

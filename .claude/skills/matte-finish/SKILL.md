---
name: matte-finish
description: Make proper, expensive-looking MATTE black (and matte graphite) for PEPTICITY logos, medallions, 3D type and Higgsfield prompts. Use whenever the owner says matte, matte black, satin, powder-coat, "not shiny", or when a black object looks grey, plastic, flat or invisible.
---

# Matte finish

Matte is not "dark grey with no shine". Real matte black (powder-coat, bead-blasted anodised aluminium, soft-touch) still has light on it: a broad, soft, low highlight that rolls over edges, and a dark, slightly lifted core. Cheap matte = flat grey fill. Expensive matte = deep black body + soft edge roll-off + micro-texture.

## What real matte looks like (check against this)
- Body value: near black, never pure #000. Base colour #0d0d0f to #141416 (site ground #0b0b0c sits just below it so the object separates).
- Highlight: wide and soft, low contrast (peak no brighter than about #3a3b40 on a lit face). No pin-point specular.
- Edges: every edge has a small bevel/round that catches a soft line of light (this is what makes it read as solid and machined).
- Texture: very fine grain (bead-blast). Visible only up close; it breaks up banding.
- Shadow: soft contact shadow under it; the object never floats on nothing.

## three.js recipe (r160, MeshPhysicalMaterial)
- color 0x111114, metalness 0.15-0.35, roughness 0.72-0.85
- sheen 0.35-0.6, sheenRoughness 0.8, sheenColor 0x2a2b30 (soft velvet roll-off on grazing angles, the key to "real" matte)
- clearcoat 0 (or 0.05 max), envMapIntensity 0.3-0.45
- roughnessMap: fine noise (bead-blast) at repeat 6-10, strength small
- bevel every extrusion (bevelSegments 3+, size 0.02-0.04 of the object) so edges catch light
- MUST have scene.environment (RoomEnvironment or HDRI) or matte reads flat/invisible
- Light: one large soft key (area/strip in the env), one faint rim from behind-top. No hard point light hotspots on matte.

## Higgsfield prompt words
"matte black bead-blasted anodised aluminium, soft-touch powder-coat finish, broad soft highlight, softly rounded machined edges catching a fine line of light, no gloss, no reflections of objects, fine micro-texture, soft contact shadow"
Avoid: "glossy", "shiny", "mirror", "plastic".

## Fail if
- black reads mid-grey (lift too high) or vanishes into the ground
- any sharp specular dot on a matte surface
- edges look razor-sharp with no light line
- banding in the dark gradient

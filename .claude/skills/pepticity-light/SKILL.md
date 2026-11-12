---
name: pepticity-light
description: Illumination rules for the PEPTICITY logo light, the blue blade through the P and the matching accent light below the word. Use when placing, matching, reviewing or porting that light, or when the owner asks for a lighting or "illumination" pass on the logo, header, footer, store or dashboards.
---

# PEPTICITY light

The brand has exactly two lights: the blade through the waist of the P, and the same blade set below the word as an accent. Nothing else in a lockup glows.

## The light is one object, reused, never redrawn

- Outline: `__marks.p.beam`, a lens 100 units long and 4 units tall at the centre, tapering to a true point at both ends.
- Two extrusions of that outline: rod (vertical scale .45, depth 1.5, bevel .2) and core (vertical scale .16, depth 1.9, bevel .1).
- Materials: unlit `MeshBasicMaterial` with `toneMapped: false`, colour multiplied above 1 so it reads as emitted light:
  - blue: rod 0x2a78ff x1.35, core 0xcfe6ff x1.0, slot glow 0x0c2a6e x.3, halo rgb 70,140,255
  - violet: rod 0x8a4dff x1.35, core 0xeadcff x1.0, slot glow 0x2c146e x.3, halo rgb 150,96,255
- Halo: a canvas-gradient plane, additive blending, `depthWrite: false`, peak .5, 10 units tall, 1.02 x the light's length, faded at both ends. One in front, one behind.
- The accent below the word uses these same geometries, materials and halos. Never substitute a CSS line, an SVG stroke or a new gradient.

## Placement

- In the P: across the waist, overhanging the metal by the same 22 units on both sides.
- Below the word: centred on the word, about 81% of the word's width (78-84% is acceptable), the gap from the bottom of the letters about 0.44 x the letter height (0.55 scene units when letters are 1.25 tall). It must never touch the letters. It reads as a separator, not an underline.
- Colour follows the lockup: blue unless the owner picked a violet lockup. Never white, never gold.

## Environment

- A PMREM studio: dim walls, soft bands, a few very bright thin strips, and coloured strips in the light's colour so mirror and glass edges pick the light up. ACES filmic tone mapping, exposure 1.0.

## Review checklist (render the still pose, `#still`)

1. Both lights present, same colour and same thickness profile.
2. Accent length 78-84% of the word; gap 0.4-0.6 x letter height; centred within 1% of the word's width.
3. Both ends of each light taper to a point, with no blunt ends and no halo cut off at the canvas edge.
4. No glow spills onto the letters and nothing else on the page glows around the logo.
5. On phones (390px) the accent is still visible: at least 1 device pixel thick at its centre.

Report each item as PASS or FAIL with the measured number.

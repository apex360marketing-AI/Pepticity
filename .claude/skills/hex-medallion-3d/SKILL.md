---
name: hex-medallion-3d
description: Build the PEPTICITY honeycomb medallion (the coin reborn as a hexagon inside a hexagon) in real three.js 3D, with the logo P and PEPTICITY raised off the surface, plus a set of look variants that each use a different accent colour, a different illumination rig and a different effect. Use whenever the owner asks for the coin, the emblem, the honeycomb, the hexagon badge, the spinning background piece, or colour/illumination versions of it.
---

# Honeycomb medallion (hex-in-hex), real 3D

The owner (31 Oct 2026): "I don't want the circle. I want it to be a honeycomb, a honeycomb inside a honeycomb, and the rest runs around it like it is, but in honeycomb and created properly." Every version must have the P and PEPTICITY sitting OUT in 3D, never flat.

## Order of work (stage gate)
1. The P comes first. Show the P alone and wait for the owner's OK (CLAUDE.md rule 2: no decisions alone).
2. Only then build the medallion variants with the approved P.
3. Show every variant as a rendered picture + live link, then wait for picks.

## Construction (all real geometry, nothing painted on)
- **Outer hex plate**: a flat-topped or pointy-topped hexagon (pick per variant), extruded about 0.08, chamfered bevel (bevelSegments 1-2 so edges read as cut facets, not soft).
- **Outer hex rim**: a hex ring (outer hex minus inner hex as a hole), raised above the plate.
- **Inner hex**: a second, smaller hex ring around the P (the "honeycomb inside a honeycomb"). It may sit higher or lower than the outer rim for layered depth.
- **PEPTICITY around it**: letters follow the hex track, not a circle. Place each letter along the hex perimeter path (sample the hex polyline by arc length), rotated to the edge it sits on; corners get no letter (space them so nothing bends over a corner). Two runs (top and bottom) like the coin, or one continuous run.
- **Honeycomb field (optional per variant)**: small hex cells in the band between rings, as raised cells or cut-in cells, with gaps that can glow.
- **The P**: centre, raised highest (depth 0.18-0.26 against plate 0.08) so it clearly stands proud. Glyph from brand/font/glyphs.json, approved cut only.
- **Back face**: mirror build so the turn shows a real back (PEPTICITY reads correctly from behind).

## Materials
- Base set from type3d-engine: gunmetal face, UV-black sides, edge hairline (opacity 0.68). Platinum for rims when a variant wants chrome.
- Accent is ONE colour per variant, used as light, never as a big fill (accent-colorways budget: under ~4% of pixels at rest).
- Banned: peach, pink casts on metal, yellow, dull gold, green (except the owner's chartreuse glints). The owner's own list overrides older bans for these samples: chartreuse/lemon-lime, #0066FF, #0FFFFF, #FF004F, #6F00FF, #8D029B, #C46210, #FA8072.

## Illumination rigs (each variant gets a different one)
- RIM BACKLIGHT: an accent light behind the medallion; a halo spills around the hex edge.
- EDGE NEON: the edge hairlines turn accent-coloured and pulse slowly (additive LineSegments, opacity 0.5 to 1).
- UNDERLIGHT: an accent point light below, raking up the letters so the risers glow.
- GAP GLOW: emissive accent planes sit under the honeycomb cells; light leaks through the gaps.
- SWEEP: a narrow spotlight crosses the face every few seconds (light rake).
- INNER CORE: the P's sides (UV material) carry an accent emissive; the face stays metal.
- SPLIT TONE: two accents from the list as cool key and warm-free fill (never a warm cast on metal).

## Effects (each variant gets a different one, cite catalogue codes when used on a site)
- coin turn on the Y axis (show both faces), honeycomb cells rising in a wave, exploded layers (rings separate in Z then return), pointer tilt with damping, scroll-scrubbed turn, cells lighting in sequence, slow float + shadow.

## Checks (before showing)
- Render each variant at 1440 and 390 in Chromium (swiftshader). No page errors.
- Look: P and letters must cast visible depth (side walls visible at an angle); the hex must read as hex-in-hex; the accent must read as illumination, not a theme swap.
- Colour check per pepticity-brand-lock on metal pixels.
- Screenshot front and turned states; send rendered pictures and the live link; questions at the end as numbered options.

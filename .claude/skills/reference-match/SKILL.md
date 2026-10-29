---
name: reference-match
description: Use whenever the PEPTICITY owner attaches an image, points to an existing asset ("my font", "the bottle I sent", "the chest we already have", "the Archive background", "these cities"), or says "like this" / "match this". Open it, write its exact traits, rebuild to match, and show it side by side with the reference before using it anywhere. Builds on visual-reference-lock and reference-eyedropper.
---

# Reference match

## 1. Get the real file
- Save every attached image to `design/references/pepticity/<short-name>.png`. Never work from a description.
- For a named asset, find the actual file (search `media/`, `brand/`, `sites/`, `design/`, Higgsfield `show_generations`, artifacts). If it cannot be found, ask the owner for it (multiple choice: "upload it / use X instead / use Y instead").
- Known references:
  - Owner's font: `design/references/pepticity/3d-metal-type-BLACK.png`.
  - Gold-chrome glass: `apex_agents_bots/design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png`.

## 2. Open it and write the traits
- Read the image with the Read tool in this turn. Look at it, do not guess.
- Write 8–15 point traits that someone could check, e.g. for the font image:
  - Very wide letters, about 1.3× wider than tall.
  - Straight strokes only, sharp chamfered cuts at corners.
  - A is an open chevron with no crossbar.
  - B's top-left is cut flat; strokes split by thin gaps.
  - Brushed gunmetal faces, brighter bevel edges, soft drop shadow on matte charcoal.
  - Raised off the surface (real extrusion depth about 15% of letter height).
- Sample the colours (eyedrop 10+ points) and record hex values.
- Note what the reference does NOT show (e.g. missing letters P, E, T, I, Y) and how you will derive them from the rules.

## 3. Rebuild to match
- Build the smallest piece that proves the match (one word, one card, one bottle).
- Use the right tool: three.js for 3D type and logo, Higgsfield with the image attached for photoreal (`credit-guard` first), CSS/SVG for glass.
- Keep brand-lock colours unless the reference IS the colour reference.

## 4. Side by side
- Render the rebuild at the same angle, size and light as the reference.
- Make one comparison image: reference left, rebuild right, same height. Save it next to the build.
- Tick each trait from step 2: MATCH / CLOSE / MISS. Any MISS: fix and re-render.
- Colour: compare sampled hex values; differences above ΔE 6 on key areas must be fixed.

## 5. Show before using
- Send the side-by-side picture plus link to the owner, with the trait list and ticks.
- Use the rebuild across the site only after his OK (`stage-gate`).

## Checks
- [ ] The real file is saved in `design/references/pepticity/`.
- [ ] It was opened with Read in this turn.
- [ ] Traits are written as checkable points with sampled hex.
- [ ] Side-by-side image exists and every trait is MATCH or CLOSE.
- [ ] Owner approved before rollout.

## Never
- Replace the owner's reference with a "similar" font, colour or asset from a library.
- Report "matched" without the side-by-side.

---
name: apex-house-style
description: The locked APEX house style (owner, 29 Oct 2026) - "everything we build is going to be like this now". Liquid-chrome live ground, smoked see-through glass with cut corners, silver chrome type, real 3D icons (matte black with gloss edge or platinum chrome) that turn slowly and lift on hover, neon chartreuse only as tiny glints, cinematic scroll effects from the catalogue. Use for EVERY new APEX page, console, archive, client site or artifact unless the owner names a different look.
---

# APEX house style (locked)

The reference build is **APEX ARSENAL** (`design/archive/`, published at https://claude.ai/artifact/G4y1SywdUUEAhTfRgCEhhE). When in doubt, open `design/archive/archive.src.html` and copy the mechanic from there rather than inventing a new one.

## The look in one breath
Dark void, a live liquid-chrome surface moving behind everything, smoked glass panes floating over it, silver chrome headings, real 3D chrome icons that turn slowly, and one small chartreuse spark wherever something is live, chosen or hovered.

## Tokens (copy these)
```
--void #040507   --ink #e9edf2   --ink-2 #c3cad3   --muted #9ea7b1   --dim #636b75
--chrome ramp: #c9d0d8 -> #f5f8fb -> #ffffff -> #9aa4af -> #f5f8fb -> #3b424b -> #f5f8fb (100deg, 220% wide, clipped to text, hard 2px black drop)
--spark #d4ff3a  (chartreuse: ONLY tiny accents - live dots, counts, focus rings, hover glints, the active rail bar)
glass: linear-gradient(145deg, rgba(255,255,255,.07), rgba(255,255,255,.012)) + rgba(6,8,12,.34); blur 12px saturate 170%; 1px rim rgba(255,255,255,.16); inset top highlight
fonts: Syncopate 700 (headings, caps, wide tracking) / Hanken Grotesk (body) / JetBrains Mono (labels, codes, dates)
```

## Non-negotiables
1. **Ground moves.** A raw-WebGL liquid-chrome shader (domain-warped fbm height field, reflected studio strips, pointer ripple, scroll rolls the light) at 0.45-0.6 resolution. Tone it down so text over glass stays readable; never thicken the glass to compensate.
2. **Glass is real.** backdrop-filter 8-14px, fill alpha <= 0.35, every pane a cut-corner silhouette (clip-path chamfer 22-34px) with a drawn diagonal rim. No pills. Radii <= 3px except round icon lenses.
3. **Icons are real 3D and all different.** One shared three.js renderer drawing into DOM slots (scissor). Lucide stroke paths -> raster -> contours -> bevelled extrusion (threejs-real-3d skill). Matte black face + glossy black edge on a pale silver lens, or platinum face + chrome edge on a smoked lens. Idle: dwell, then a slow 360 turn. Hover: lift toward the viewer, slow turntable spin. Never the same icon twice in one section.
4. **Chartreuse is a glint, not a colour.** On hover every row gets a hairline chartreuse spark (edge sweep or dot), never a fill. If a screenshot reads "yellow", it is too much.
5. **Cinematic, not static.** Every page carries at least five catalogue effects, chosen per page: word portal intro, scroll-highlight copy, sheen type, rising footer wordmark, card stack, sideways journey, revolving icon ring, twin ribbon, count up, mercury gauge progress, focus-pull reveals, wax-seal CTA, monogram watermark that turns with scroll. Respect prefers-reduced-motion (hold still, never remove content).
6. **Caps headings, brand names in caps** (APEX 360, PEPTICITY). No gold, no amber, no green (CLAUDE.md bans still apply).
7. **Gates before showing:** apex-visual-gate must PASS, then a fresh-eyes award-jury review on screenshots only, then screenshots go to the owner with the link.

## Banned in this style
Flat icon fonts or emoji; opaque cards; rounded-rectangle buttons with no material; one icon repeated down a list; chartreuse fills or big chartreuse areas; a static background; a centred hero with three equal cards.

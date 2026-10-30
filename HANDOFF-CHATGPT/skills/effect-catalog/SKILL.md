---
name: effect-catalog
description: Name, number and catalogue every APEX animation/scroll/menu/hover/3D effect as a reusable "artifact" (e.g. SCR-07 · Skyline Dive) so the owner and clients can point at one by code and reuse it on other sites. Use whenever a new page or section with motion is built, when building the showcase site, or when the user refers to an effect by code.
---

# APEX effect catalogue

Every distinct effect we build gets ONE permanent code and name. The user says "I like SCR-07" and we know exactly what to reuse.

## Code format
`<CAT>-<NN> · <Name>` — e.g. `SCR-07 · Skyline Dive`, `NAV-04 · Elevator Floors`.
- Numbers are per category, start at 01, are never reused or renumbered.
- Name: 1–3 evocative words, title case, describes what the viewer SEES (not the tech).

| CAT | Category | Covers |
|---|---|---|
| SCR | Scroll | pinned stories, scrubbed camera moves, parallax, horizontal tracks, snaps |
| NAV | Menu & navigation | menus, headers, progress rails, command palettes |
| HOV | Hover & cursor | button/card hovers, cursor followers, magnetic, tilt |
| TXT | Kinetic type | split reveals, scramble, variable-font motion, text on path |
| OBJ | 3D objects | hero objects, extruded icons, materials |
| BGD | Backgrounds | shaders, particles, fog, gradients |
| TRN | Transitions | section/page transitions, folds, wipes |
| LAY | Layout & sections | bento, galleries, marquees, stacked cards |
| FRM | Forms & CTAs | checkers, quote steppers, submit feedback |
| CRD | Cards | glass/matte/chrome card styles, shapes, card hovers |
| BTN | Buttons | button shapes, materials, press/hover states |

## Registry
The single source of truth is `design/effects.json` (array). One entry per effect:
```json
{ "code": "SCR-07", "name": "Skyline Dive", "category": "SCR",
  "summary": "The camera falls through a night city to one lit window as you scroll.",
  "mood": ["cinematic", "dark"], "bestFor": ["home services", "real estate"],
  "weight": "Heavy", "motionSafe": true,
  "pages": [{ "page": "descent", "section": "how-it-works" }] }
```
- `summary`: one plain-English sentence of what the visitor experiences. NEVER name libraries, shaders, techniques or code (no "GSAP", "three.js", "ScrollTrigger", "shader").
- `weight`: Light (CSS only) / Medium (JS, no WebGL) / Heavy (WebGL).
- `motionSafe`: true if it has a reduced-motion fallback.
- Before adding, search the registry: the same effect on two pages shares ONE code (add another `pages` entry). A recolour is not a new effect.

## Tagging pages
Mark each effect's section in the page with `data-fx="SCR-07"` (comma-separate several). The showcase reads these to show live labels as you scroll.

## What we never reveal publicly
Code, library names, build notes, shader names, file names. Public = code, name, summary, tags, weight, motion-safe, which designs use it.

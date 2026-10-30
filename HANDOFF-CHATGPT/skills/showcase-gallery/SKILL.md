---
name: showcase-gallery
description: Build or update the APEX capabilities showcase — a wall of phone mockups, each opening a live design inside a phone (plus full-screen), with the named effect library, live effect labels, compare mode, and a shortlist visitors send to the studio. Use when adding designs to the showcase or changing it.
---

# APEX showcase gallery

## Decisions already made by the user
- Click a phone → it grows to centre stage and the design runs live INSIDE the phone; a "View full screen" button opens the desktop version.
- Effects use `CAT-NN · Name` codes from the `effect-catalog` skill (registry `design/effects.json`).
- Feedback = heart designs/effects + note → send shortlist with contact details (shared runtime storage, so the owner sees each submission).
- Published as a Claude Artifact first (multi-file: designs ship as files beside the page), moved to the user's domain later.

## Structure
1. **Phone wall** — grid of phone frames showing a static poster of each design (never mount many live designs at once). Filters: light/dark, mood, effect category, industry.
2. **Live phone** — ONE live iframe at a time (same-origin file from the artifact's `files`), 390×844 viewport scaled into the frame; lazy-load; unload when closed. Full-screen button opens the same file at desktop size.
3. **Live effect labels** — while scrolling the design, a side rail lists the `data-fx` codes of sections in view ("You're looking at SCR-07 · Skyline Dive").
4. **Effect library** — searchable index of all codes, grouped by category, each with summary, tags, weight, motion-safe, and "seen in" design links that jump to that section.
5. **Compare** — two phones side by side, scroll synced.
6. **Shortlist** — heart designs/effects, "What did you like?" chips (motion, menu, 3D, type, colour, layout), note, contact fields, Send. Shareable shortlist link via `#token` only.
7. **Trust** — motion toggle, "built for your industry" framing with [placeholders], copyright/licence note. No invented stats or testimonials.

## Rules
- Showcase chrome must be neutral and classy so the designs are the star (matte black / bone; no gold, no green).
- Never expose code, libraries or build notes in the UI.
- Posters: real screenshots of each design captured in a browser; verify every phone opens and scrolls before publishing.
- Phone width: the showcase itself must work at 390px (phone wall becomes a swipeable stack).

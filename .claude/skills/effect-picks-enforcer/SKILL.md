---
name: effect-picks-enforcer
description: Use whenever a PEPTICITY page, section, plan or build prompt is written or changed, and before any PEPTICITY page is shown. Every owner-approved effect (from docs/owner/effect-picks-2026-10-28.md) must be placed in the plan and proven present in the build, with a code → where-it-appears table in the report.
---

# Effect picks enforcer

Source of truth: `docs/owner/effect-picks-2026-10-28.md` (matches the `picks` db on the Effect Picks artifact). Re-open it every time; it may have been updated.

## Approved (YES): must be in the plan AND the build
| Code | Effect | Owner's note to honour |
|---|---|---|
| SCR-07 | Skyline Dive | SLOWER, elegant, luxury; weave between buildings from high up, down into the lab, then the store path "like IKEA", doors, scanner |
| SCR-17 | Word Portal | "Obviously branded and used to suit the site" (fly through PEPTICITY) |
| SCR-18 | Card Stack | none |
| OBJ-08 | Black-Chrome Monogram | Background watermark, chrome silver + UV, large in the centre, ROTATES on scroll, never overwhelming |
| TXT-09 | Sheen Type | On the buttons; give 5 colour options that suit the style |
| TXT-04 | Scroll Highlight | none |
| TXT-13 | Rising Wordmark | none |
| FRM-102 | Quote Stepper | Use as the join-the-team stepper |
| FRM-103 | Submit Morph | On every sign-up submit |
| FRM-104 | Sentence Check | Sentence-style sign-up |
| LAY-23 | Mercury Vials | Product or membership display |
| HOV-17 | Wax Seal | ELONGATED section; the EARTH lit brighter, turning smoothly, illuminated; plus a NODES AND EDGES section that lights on hover and collects name, email, phone |
| SCR-16 | Exploded Layers | Approved 29 Oct |
| FRM-02 | Live Member Card | Approved 29 Oct |
| CRD-124 | Fog Wipe | Approved 29 Oct |

## MAYBE: only after the owner says yes to a sample
- SCR-101 Flipbook Scrub, SCR-13 Pocket Sequence.
- SCR-28 Mercury Morph: "only if next level", smooth, built around peptides, says something about health (no health claims).

## BANNED
- HOV-36 Ampoule Button and anything like it ("ugliest button").
- NAV-01 Shrinking Pill: not voted, and pills are banned by brand-lock. Ask before any use.

## Also owed from the same notes (treat like effects)
- Menu "must be an experience". Background pattern turned 30° as a watermark. Hooks that glide in and fade (see `scroll-reveal-hooks`).

## In the plan
- Every YES code gets one line: code, section, what it does there, which piece of `stage-gate` it ships in.
- A YES code may be scheduled for a later piece, but it may never be missing from the plan.
- New effects built for PEPTICITY (doors, scanner, engraving, weave) get a catalogue code via `effect-catalog`.

## In the build (proof)
- Tag each effect's root element: `data-effect="SCR-17"`.
- Playwright check: query every `[data-effect]`, scroll it into view, screenshot it. Store the shots.
- Report table, always:

| Code | Where it appears | Piece | Proof | Status |
|---|---|---|---|---|
| SCR-17 | PEPTICITY word into the store, 38% scroll | 6 | shots/scr17.png | PRESENT |
| TXT-09 | All primary buttons, colourway 3 of 5 | 3 | shots/txt09.png | PRESENT |
| LAY-23 | not in this piece | 7 | — | PLANNED |

## Checks
- [ ] All 15 YES codes appear in the plan table.
- [ ] Every code claimed PRESENT has a `data-effect` tag and a screenshot.
- [ ] The owner's note for each code is met, not just the base effect.
- [ ] No banned effect or pill shape anywhere in the DOM.
- [ ] The table is in the report to the owner.

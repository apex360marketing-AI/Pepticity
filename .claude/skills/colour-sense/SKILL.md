---
name: colour-sense
description: Use on EVERY PEPTICITY visual build, before and after. Colour palette and taste rules so a site is never black-and-white. Builds a palette (lifted ground, metal, one accent at real size, supporting tint), forbids monochrome, and runs tools/colour-check.py on rendered screenshots. Use whenever the owner says colour, pop, black and white, dark, dull, flat, or taste.
---
# COLOUR SENSE

Owner (7 Nov): "You cannot keep handing me back a black and white site. I said it 1,000 times. Grace asked for colour at the very start. Add some pop."

## Rule 0
A page that is only black, grey and white FAILS. Every first screen must show at least one clear colour family at real size.

## The palette recipe (use this order, write it down before building)
1. GROUND: lifted, never near-black. Deep graphite / smoke / ink with a clear tint of the accent hue (L* about 14-24, chroma 3-8). Not #000.
2. METAL (gold or platinum chrome) for edges, type, the P, ticks, rails: gradients with 4 stops (shadow, mid, highlight, hot), never one flat grey.
3. ACCENT: ONE of Grace's 8 colours (blue #0066FF, chartreuse #D4FF3A, cyan #0FFFFF, red #FF004F, violet #6F00FF, orchid #8D029B, copper #C46210, salmon #FA8072) used at REAL size: a headline word, the hero light, the section glow, buttons on hover, large soft light pools behind glass. About 15 to 30 percent of the visible non-text area carries accent light or tint on a hero screen.
4. SUPPORT TINT: one analogous neighbour of the accent (30 degrees either side) at low saturation for depth in shadows and glows.
5. TEXT: white or warm-white on dark; never grey-on-grey. Contrast 7:1 for body, 4.5:1 minimum.

## Taste rules
- Colour comes from LIGHT first (glows, rim light, pools), flat colour last.
- Never a coloured box behind text. Glass stays see-through (clear-glass-spec).
- No muddy mixes: do not mix two saturated accents on one screen; gold and platinum are metals, not accents.
- Banned (owner): mustard, dull yellow-gold, amber, peach, any green outside the one approved light page, kid-style neon on purple/blue backgrounds.
- A second hue appears only as a tiny glint.

## Proof (mandatory)
Run `python3 -I tools/colour-check.py <screenshot.png> [more.png]` on the real rendered hero at 1440x900 and 390x844. It prints mean chroma, share of coloured pixels, hue families, mean lightness and PASS/FAIL. FAIL if mean chroma < 8, coloured pixels < 12 percent, or mean L* < 22. Report the numbers to the owner.

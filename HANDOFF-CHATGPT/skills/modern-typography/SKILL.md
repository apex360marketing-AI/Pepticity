---
name: modern-typography
description: Pick and animate modern, one-of-a-kind type for APEX pages — distinctive Google Fonts pairings, variable-font axis animation on scroll/hover, kinetic and split text, text on a path, and loading that never flashes. Use whenever a page needs fonts that do not look like every other site, or text that moves.
---

# Modern typography for APEX pages

The fastest way a page looks "AI built" is Inter/Roboto/system fonts everywhere. Give every page its own pairing, and make type part of the motion.

## Rules
- Every page gets its own pairing. Never reuse a display face across two pages in the same set.
- One display face (personality) + one text face (reading) + optional mono for data. No more than three families.
- Artifacts may only load fonts from Google Fonts (`fonts.googleapis.com` / `fonts.gstatic.com`). Anything else must be inlined as a data: URI. Always give a real fallback stack.
- Load with `display=swap`, request only the weights/axes used, and add `<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`.
- Avoid as display faces: Inter, Roboto, Open Sans, Lato, Montserrat, Poppins, Arial/Helvetica defaults.

## Distinctive Google Fonts (display → pair)
| Feel | Display | Text / mono |
|---|---|---|
| Wide, futuristic | Unbounded | Geist, Geist Mono |
| Soft editorial serif, variable "SOFT"/"WONK" axes | Fraunces | Bricolage Grotesque |
| Art-gallery grotesk with ink traps | Syne | Instrument Sans |
| Variable WIDTH (animate 50→150) | Anybody | Instrument Serif |
| Industrial expanded | Archivo (wdth 62–125) | Martian Mono |
| Quirky modern grotesk, opsz axis | Bricolage Grotesque | Hanken Grotesk |
| Sharp display serif | Gloock / Young Serif | Schibsted Grotesk |
| Condensed poster | Big Shoulders Display | Familjen Grotesk |
| Elegant thin serif | Instrument Serif (italic) | Onest |
| Tech / data | Space Grotesk | JetBrains Mono, Martian Mono |

## Motion techniques
1. **Variable axis scrub** — tie `font-variation-settings` (wght, wdth, opsz, SOFT) to scroll progress or pointer distance. Update a CSS custom property once per rAF; never read layout in the same frame.
   ```css
   .vf{font-variation-settings:"wght" var(--w,400),"wdth" var(--wd,100)}
   ```
2. **Split reveals** — split into lines/words/chars (GSAP SplitText is free in gsap 3.13+), mask each line (`overflow:hidden` wrapper) and rise with stagger. Re-split on resize; keep the original text in `aria-label`.
3. **Scroll-highlight paragraphs** — words go from 20% to 100% opacity as they cross the viewport centre.
4. **Text on a path** — SVG `<textPath>` with `startOffset` driven by scroll.
5. **Scramble/decode** for numbers and labels — run once, then settle; never loop on body text.
6. **Hover weight swell** — letters near the pointer gain weight (variable `wght`), falling off with distance.
7. **Outline ↔ fill** — `-webkit-text-stroke` headline that fills as a section is entered.

## Performance & a11y
- Animate `transform`, `opacity` and variable axes only; never animate `font-size` or `letter-spacing` per frame on long text.
- Respect `prefers-reduced-motion`: show final state.
- Keep body text ≥16px, line-height 1.5–1.7, ~65ch measure. Headings `text-wrap: balance`.
- Check contrast in both light and dark versions.

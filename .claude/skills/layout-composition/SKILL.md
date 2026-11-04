---
name: layout-composition
description: Compose one-of-a-kind APEX layouts — editorial and asymmetric grids with named lines, bento mosaics, broken-grid overlaps, full-bleed breakouts, fluid space and type scales (`--apx-space-*`, `--apx-step-*`), container queries so artifact modules fit any slot, section rhythm, and mobile re-composition. Use whenever a page or section needs a layout, when designs look "templated" (centred hero + three cards), when building several design options that must differ in layout, or when an artifact must work at any width.
---

# Layout composition

Template sites share one skeleton: a centred hero, three equal cards, a logo row, then repeat. Award sites compose every section like a magazine spread. The layout is part of the identity, so it is a column in the uniqueness matrix (`apex-cinematic-design`).

## 1. Scale tokens (fluid; add beside `--apx-*`)
```css
:root{
  --apx-space-1:clamp(.5rem,.45rem + .25vw,.75rem);  --apx-space-2:clamp(1rem,.9rem + .5vw,1.5rem);
  --apx-space-3:clamp(1.5rem,1.2rem + 1.5vw,3rem);   --apx-space-4:clamp(3rem,2rem + 5vw,8rem);
  --apx-space-section:clamp(5rem,3rem + 10vw,14rem);
  --apx-step-0:clamp(1rem,.96rem + .2vw,1.125rem);   /* body: never under 16px */
  --apx-step-2:clamp(1.5rem,1.2rem + 1.4vw,2.4rem);  --apx-step-4:clamp(2.6rem,1.6rem + 5vw,6rem);
  --apx-step-hero:clamp(3.2rem,1rem + 11vw,13rem);   /* display type with real scale contrast */
  --apx-gutter:max(16px,4vw);
}
```

## 2. The page grid: named lines with full-bleed breakouts
```css
.page{display:grid;grid-template-columns:
  [full-start] minmax(var(--apx-gutter),1fr)
  [wide-start] minmax(0,8rem)
  [content-start] repeat(12,[col] minmax(0,5.5rem)) [content-end]
  minmax(0,8rem) [wide-end]
  minmax(var(--apx-gutter),1fr) [full-end];}
.page>*{grid-column:content}  .bleed{grid-column:full}  .wide{grid-column:wide}
.spread{display:grid;grid-template-columns:subgrid;grid-column:content}   /* children align to the 12 columns */
.spread .lede{grid-column:2 / span 5} .spread .media{grid-column:8 / -1;margin-top:calc(var(--apx-space-4) * -1)}
```
Give text-bearing children `min-width:0`. Use `repeat(N,minmax(0,1fr))`, never a bare `1fr` (long words blow it out).

## 3. Layout archetypes (pick different ones per option; tag LAY codes)
| Archetype | Composition | Good for |
|---|---|---|
| Editorial spread | 5/7 asymmetric split, oversized folio numbers, marginalia | story, "how it works" |
| Bento mosaic | `grid-template-areas` with 1×1, 2×1 and 2×2 tiles, one hero tile | industries, features |
| Index rows | full-width rows of huge type, with hover revealing media | industry lists, menus |
| Sticky split | left column sticky, right column scrolls | process steps, FAQs |
| Filmstrip | horizontal track (see `gsap-scroll-choreography`) | samples, galleries |
| Monolith | one centred object, type wrapped around it | hero with a 3D object |
| Broken grid | layers overlap across columns, with one off-grid element per section | premium editorial |
| Stacked deck | cards pin and stack as you scroll | packages, pricing |
| Diagonal | rotated grid (`rotate:-6deg` on the wrapper, content counter-rotated) | energetic brands |

Bento skeleton:
```css
.bento{display:grid;gap:var(--apx-space-2);grid-template-columns:repeat(4,minmax(0,1fr));grid-auto-rows:minmax(12rem,auto);
  grid-template-areas:"hero hero a b" "hero hero c c" "d e e f"}
@container page (max-width:700px){.bento{grid-template-columns:repeat(2,minmax(0,1fr));grid-template-areas:"hero hero" "a b" "c c" "d e" "f f"}}
```

## 4. Composition rules
- **One focal point per viewport,** made by scale contrast: hero display type is at least 6× body size, and section heads at least 2.5×.
- **Negative space is a material.** Leave 30% or more of each viewport empty. Crowding reads as cheap.
- **Few alignment axes.** Everything snaps to 2–4 vertical lines. Break the grid deliberately, once per section, with one element (an overlap, a bleed or an offset).
- **Rhythm:** never three sections with the same structure in a row. Vary density (dense, airy, dense), direction (left-led, right-led) and scale.
- **Asymmetry over centring.** Centre only the monolith archetype or a closing CTA.
- **Odd groupings** (3 or 5) feel composed; avoid identical card rows of 4 with equal weight.
- Reading measure 45–75ch. Headlines use `text-wrap:balance` and paragraphs `text-wrap:pretty`.

## 5. Artifact modules respond to their CONTAINER, not the viewport
The generator drops modules into slots of any width, so every module root sets `container-type:inline-size; container-name:<code>`, and its layout uses `@container` queries. Viewport media queries are only for the page shell. Test each module at 320, 560, 900 and 1280px slot widths.

## 6. Mobile: re-compose, don't shrink
- At 390px: a 16px gutter, a single column with deliberate re-ordering (`order`), the display type still big (`--apx-step-hero` floors at 3.2rem), bento collapsing to 2 columns, and sticky splits becoming stacked chapters.
- Remove overlaps that would cover text. Turn horizontal tracks into native swipe (`scroll-snap-type:x mandatory`).
- Tap targets ≥ 44px. No sideways page scroll.

## Do / don't
- DO sketch the section sequence (archetype per section) in the uniqueness matrix before writing code.
- DO use `subgrid` so nested content aligns with the page columns.
- DON'T ship: a centred hero + 3 equal cards + a logo strip, equal-height sections, every image the same aspect ratio, or the default 1200px container centred everywhere.
- DON'T position with absolute pixel offsets for overlaps; use grid placement and negative margins tied to space tokens.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- At 1440, 1024 and 390 widths: `document.documentElement.scrollWidth <= innerWidth`.
- Alignment audit: collect the `getBoundingClientRect().left` of all headings and paragraphs. They should cluster on ≤ 4 x-values per breakpoint (excluding the intentional break).
- Add a `?grid` debug overlay (12 translucent columns) and screenshot it. LOOK for elements that are almost aligned but not quite; those are bugs.
- Module test: mount the module in containers 320/560/900/1280px wide; no overflow, no clipped text.
- Compare screenshots of all options side by side: the hero composition and section archetypes must differ.

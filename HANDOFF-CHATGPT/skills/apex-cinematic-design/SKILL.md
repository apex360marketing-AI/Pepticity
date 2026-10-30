---
name: apex-cinematic-design
description: Design and build premium, cinematic, animated APEX landing pages (or several distinct design options). Use whenever making or revising APEX marketing pages, design directions, hero sections, icon sets, scroll animations or hover effects.
---

# APEX cinematic design

## Hard rules
- No gold, champagne, yellow, amber, mustard or lime/chartreuse — ever. Dark backgrounds. Glassmorphism (translucent, blurred, rim-lit) for cards and buttons, with a `@supports not (backdrop-filter)` fallback.
- Plain-English copy a business owner gets in 5 seconds: APEX sends verified, exclusive leads (real local people asking for their service) straight to their phone and CRM. No jargon. Nav: Industries · How it works · Pricing · Get leads.
- Facts only from the real industry data (names, lead-value ranges, peak months). Sample leads labelled "Sample". No invented stats, testimonials, client counts, guarantees or prices — use [placeholders].
- Never emoji icons. Every icon set is a premium, dimensional material with motion.
- Verify in a real browser before showing anything: no page errors, no horizontal scroll at 390px, animations actually change over time, interactions respond, screenshots reviewed with an art director's eye. See CLAUDE.md.

## When delivering multiple options
Options must share NOTHING visual: give each its own row in a uniqueness matrix and fill every column differently before building:
palette · fonts · nav pattern · headline · hero device · icon material · industry showcase · lead-journey presentation · button style · cursor/hover effect · scroll signature · background · section transitions · CTA treatment.
Compare all screenshots side by side before sending; if two share any element, rework one.

## Motion toolbox (pick different ones per page)
- Scroll: split-word/line reveals, clip-path curtain reveals, mask wipes, parallax depth layers, pinned/sticky story scenes, horizontal pinned scroll, scroll-scrubbed transforms, scroll-velocity effects, scroll-linked progress lines, counters.
- Hover: magnetic buttons, 3D tilt toward pointer, border-trace, glitch/scramble text, gooey/liquid buttons, ring pulses, sheen sweeps, coin flips, magnifying docks, cursor-following reveals.
- Cursor: torch light through glass, crosshair, star trail, blend-mode circle, magnetic dot.
- Ambient: aurora mesh, perspective grid floor, liquid blobs (SVG goo), parallax starfield/warp, light beams through glass slats, film grain.
- Icon materials: matte-black chrome domes; holographic wireframe glass (glyph draws itself); iridescent jelly bubbles; glowing planet orbs with rings; brushed-steel engraved medallions that flip.

## Technique rules
- Animate transform/opacity/filter/clip-path only; rAF-throttle pointer and scroll work; passive listeners.
- Respect `prefers-reduced-motion`; cheaper layers on mobile (gate pins/parallax behind min-width:900px).
- Never put `var()` inside an `animation` shorthand; use longhands.
- Pinned sections need an explicit height budget.
- `repeat(N, minmax(0,1fr))` grids; give text-bearing flex/grid children `min-width:0`.

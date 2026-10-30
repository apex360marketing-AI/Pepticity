---
name: accent-colorways
description: Use when PEPTICITY needs colour "pop" on the approved grey/gunmetal look (dashboards first, website later) or a set of accent-colour options for the owner. Adds ONE neon accent per colourway as a token layer, keeps the grey brand untouched, caps how much colour shows, and proves it with screenshots per colourway. Not for changing layout, fonts, materials or copy.
---

# Accent colourways

Grace and the owner love the grey. They want "some pop, subtle, classy, professional". The grey stays; one neon accent per colourway is layered on top.

## Rules
- **Change nothing else.** Layout, fonts, copy, 3D materials and spacing stay exactly as they are. Only add accent colour.
- **One accent per colourway**, as tokens on :root:
  - `--acc` (the hex)
  - `--acc-rgb` (r,g,b for rgba glows)
  - `--acc-soft` (about 16% alpha)
  - `--acc-glow` (a 24–40px blur shadow at 35–55% alpha)
- **Where the accent goes** (small, deliberate):
  1. hover and focus states: a hairline border tint plus a soft outer glow on cards, buttons and tabs
  2. the active tab underline and the selected toggle thumb edge
  3. KPI numbers' small delta chips, and the sparkline or chart line plus its dots
  4. status dots (out for delivery, unread badge), progress lines, the TODAY'S WORD shine
  5. small section-label dashes ("— GOOD AFTERNOON")
  6. 3D: the edge hairline light on the type and coin is tinted toward the accent (mix about 35% accent into white). The coin footer's landing sweep uses the accent.
- **Never** fill backgrounds, big cards or body text with the accent. Headline faces stay gunmetal.
- **Budget:** under about 4% of screen pixels at rest. On hover it may rise locally.
- **Contrast:** any accent text must reach 4.5:1 on its ground. Dark accents (#6F00FF, #8D029B, #0066FF, #C46210) are used as glows and lines plus a lighter tint for text: mix 35% white into the accent.
- **Exact hex as the owner gave it.** The owner's explicit list overrides the older palette bans (e.g. #C46210, #FA8072) for these options.

## Build
- One source file gets the token layer plus a `data-acc` attribute on `<html>`. Copy it per colourway, each with a different default.
- Make a comparison index page showing every colourway side by side: a screenshot thumbnail, its name and hex, and links to Grace's side and the client side.

## Checks (all before showing)
- Screenshots per colourway: Grace top, a hover state, client top, the coin footer.
- Look at each one. The grey must still dominate, and the accent must read as a deliberate glow, not a theme swap.
- No console errors, no sideways scroll, at 1440 and 390.

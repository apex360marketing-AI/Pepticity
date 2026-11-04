---
name: "apex-site-build"
description: "Load before designing or building ANY site, page, console, deck or UI for Maverick. Names the skill stack that must be loaded first and the War Room material rules. Use on any visual build, even a small mockup."
---

# Building anything visual for Maverick

## Step 1 — load the stack before writing a line of CSS

This is not optional and it is the step that has been skipped before, producing work he
rejected as ugly. Load these first:

- **`neon-glass-ui`** — the glass pane recipe, the pointer torch, the sweep sequencer, the
  pop-out hover. This is the house treatment for every dashboard, console and tool.
- **`cinematic-scroll`** — reveal-on-scroll, parallax, pinned sections, smooth scroll. Use the
  kit rather than hand-rolling scroll logic.
- Check his skill library for anything else that fits the job — animated logos, theme factory,
  canvas design, algorithmic art. He built them and he expects them used.

If a page ships without the torch, the sweep and real translucent glass, it is wrong, however
tidy it looks.

## Step 2 — the War Room palette, substituted into those mechanics

Keep every mechanic from `neon-glass-ui`. Replace only the hues:

```
--void      #04050a     the room
--brand     #4fd8ff     electric cyan: edges, data, live state, the torch
per-pane    #4fd8ff #8fe9ff #00e5ff #f0dcae #1b8fc4 #6fd0ff
```

Chrome gold is a **ramp across a surface, never one value**:

```
shadow #2a1c09 → body #8a6730 → champagne #f0dcae → hot #fffaf0 → warm #c69a4e → shadow
```

Run it at ~100° with several turns inside one element, clipped to text, plus a hard dark drop
shadow and a warm bloom. On a flat gold plane, overlay an SVG specular starburst.

**Hard bans:** flat yellow-gold fills (`#ae8927`, `#c9a227`, `#d4af5a`, `#c4ab82`), amber
washes, gold that glows rather than reflects, pill-shaped buttons, radii beyond ~3px.

**Proportion:** gold on at most two or three things per view — the wordmark and the number that
means money. Cyan does the work and is allowed to glow. If gold and cyan reach equal weight the
design has failed.

## Step 3 — the glass has to be real

A bordered dark box is not glassmorphism. The stack is:

1. `linear-gradient(145deg, var(--tile-1), var(--tile-2))` — a very low fill.
2. `backdrop-filter: blur(10px) saturate(195%)` — keep blur 8–14px.
3. A 1px rim, plus `inset 0 1px 0` highlight on the top edge only.
4. A deep drop shadow beneath.
5. A **lit, textured ground behind it** — glass over nothing reads as a grey rectangle.

The torch must sit at `z-index: 0`, below the panes, so each pane samples it through its own
backdrop-filter and the light carries *under* the card. That single detail is most of the effect.

Thin the fill for contrast. Never raise the blur, and never make a pane opaque on hover.

## Step 4 — traps that silently break it

- Never put `var()` inside an `animation` shorthand; use the longhands.
- A hover rule cannot beat a keyframe for the same property — change `filter: brightness()`.
- Remove-then-add a class in one frame gets coalesced; force a reflow with `void el.offsetWidth`.
- Animate only `transform` and `opacity`.
- Grids: `repeat(N, minmax(0,1fr))` with `min-width: 0` on items.
- Ship `@supports not (backdrop-filter)` and reduced-motion fallbacks every time.
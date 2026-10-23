---
name: tonal-scales-and-tokens
description: Expand one brand colour into Radix-style 12-step tonal scales (accent plus a hue-tinted neutral) for light and dark themes, assign each step its UI job, enforce text contrast on steps 11-12, and emit CSS custom properties or W3C DTCG token JSON using the bundled dependency-free palette.mjs. Use when asked for "a colour scale", "shades of my brand colour", "50-950 ramp", "tonal palette", "12-step scale", "design tokens for colour", "light and dark tokens", "Radix / Tailwind style palette", or when a component needs hover, border and background variants.
---

# Tonal scales and colour tokens

`palette.mjs` in this folder is the shared colour kit for all colour skills (Node 18+, no dependencies). Run it; paste its output; don't invent ramp values.

```bash
K=./palette.mjs                    # from this skill folder
node $K ramp '#7a2232'             # 12 steps, light + dark, with contrast vs step 2
node $K ramp '#7a2232' --neutral 1 # matching tinted grey
node $K tokens '#7a2232' --name brand            # CSS: :root + dark media + [data-theme=dark]
node $K tokens '#7a2232' --name brand --dtcg 1   # DTCG 2025.10 JSON
```

## 1. Step jobs (use these exact meanings; they come from Radix Colors)
| Step | Job |
|---|---|
| 1 | app background |
| 2 | subtle background (striped rows, sidebars, cards on 1) |
| 3 / 4 / 5 | component background: rest / hover / pressed-or-selected |
| 6 | subtle border, separators (non-interactive) |
| 7 | interactive component border (inputs, cards that click) |
| 8 | strong border and **focus ring** |
| 9 | solid fill: the brand colour itself (buttons, badges); highest chroma |
| 10 | solid fill hover |
| 11 | low-contrast text (secondary text, links in accent) ≥ 4.5:1 on 2 |
| 12 | high-contrast text (headings, body) ≥ 7:1 on 2 |

Text on step 9 is whichever of near-black/white wins on APCA (`onSolid()`; the CLI prints it). Light brands (L > 0.75, like chartreuse) get dark text.

## 2. How the kit builds the scale (so you can explain and adjust it)
- Hue held constant; chroma follows a curve (low at 1-2, rising to 9, easing at 12); every step gamut-fitted at fixed L and H.
- Light L targets 0.993 → 0.26; dark L targets 0.165 → 0.94. Dark mode is a **separate scale**, not a reversed one.
- Step 9 = the exact brand colour in light mode. In dark mode, brands darker than L 0.52 are lifted to L 0.52 so the fill separates from the ground (WCAG 1.4.11 wants 3:1 for UI component edges). Tell the client their dark-mode button is lighter than the logo and why.
- Steps 11 and 12 are pushed away from the ground until they reach 4.5:1 and 7:1 against step 2.
- Neutral scale: same hue at C ≤ 0.018. This is what makes greys feel related to the brand.

Adjustments you may need, by hand:
- **Yellowish or very light brands**: step 9 is too light for a border-defined button; add a 1px step-11 border or use step 10 as the fill.
- **Very saturated brands (C > 0.2)**: dark steps 3-5 may glow; multiply their C by 0.7.
- **Hue drift**: for warm hues, rotate dark steps 1-4 by −5° toward red to avoid brown; for cool hues, +5° toward blue. Optional; the kit holds hue fixed.

## 3. Tailwind-style 50-950 instead of 12 steps
If the project uses Tailwind (v4 palette is defined in OKLCH), map: 50←2, 100←3, 200←4/5, 300←6/7, 400←8, 500←9, 600←10, 700←11, 800 (L ~0.38), 900←12, 950 (L ~0.2). Emit as `@theme { --color-brand-500: oklch(...); }`. Say which steps you interpolated.

## 4. Token tiers (keep three, never skip the middle)
1. **Primitive**: `--brand-1…12`, `--gray-1…12` (light and dark values differ, names don't).
2. **Semantic**: `--bg, --surface, --line, --ink, --muted, --accent, --accent-contrast, --focus, --danger…` referencing primitives. The kit emits a starter set.
3. **Component**: `--button-bg: var(--accent)`, only when a component needs to diverge.

Components read semantic tokens only. A theme switch rewrites primitives; nothing else changes.

DTCG: `$type: "color"`, `$value: {colorSpace: "oklch", components: [L, C, H], hex}`; aliases as `"{brand.9}"`. Build CSS with Style Dictionary v5 if the project has a pipeline (the APEX `design-tokens-theming` skill covers the `--apx-*` contract and build; map steps onto it there).

## 5. Alpha scales (when components sit on images or glass)
For overlays, also emit `--brand-a3…a8` as the colour that, laid over step 1 with alpha, reproduces step N. Simple approximation: `color-mix(in oklab, var(--brand-9) X%, transparent)` with X = 4, 8, 12, 18, 26, 36 for steps 3-8. Re-measure contrast on the real background.

## 6. Verify before handing over
- `node $K ramp <hex>`: steps 1-8 should rise monotonically in contrast vs step 2; steps 11/12 meet 4.5/7.
- `node $K banned <all steps>`: a brand near a banned zone can drift into it at light steps (e.g. a pumpkin at H 55 is fine; at H 62 its tints read champagne). Shift hue if so.
- Render a strip of all 12 steps in both themes in the page or artifact; look at steps 3-5 side by side: hover must be visible.

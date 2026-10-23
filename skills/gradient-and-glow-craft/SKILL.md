---
name: gradient-and-glow-craft
description: Build gradients, mesh/aurora backgrounds and neon glows that stay vivid and readable - OKLCH/OKLab interpolation to avoid grey dead zones, hue-path control so blends don't pass through banned golds or greens, banding fixes, glow layering, and a legibility ceiling for text over light effects. Use when asked for "a gradient", "aurora / mesh background", "glow effect", "neon", "gradient text", "the gradient looks grey / muddy in the middle", "banding", "glassy light", "hero background", or when a gradient or glow sits behind text.
---

# Gradient and glow craft

Kit: `../tonal-scales-and-tokens/palette.mjs`. Always run `gradient` before shipping a two-colour blend.

```bash
K=../tonal-scales-and-tokens/palette.mjs
node $K gradient '#ff2d6f' '#00b3ff' 7
# srgb   minC 0.107  #ff2d6f #d54387 #aa5a9f #8070b7 #5586cf #2a9de7 #00b3ff
# oklab  minC 0.08   ... #ba88b8 ...  (straight line: greys out between far-apart hues)
# oklch  minC 0.149  ... #b775ff ...  (keeps chroma: vivid through violet)
```
`minC` is the lowest chroma along the path. Below ~0.04 between two saturated ends = a visible grey dead zone.

## 1. Pick the interpolation per gradient
- **Near hues (≤ 60° apart)**: `in oklch`; vivid and even.
- **Far hues (90-180° apart)**: check the OKLCH path's middle hue with `palette.mjs info`. If it lands in a banned zone (red→teal via OKLCH passes gold or violet depending on direction; orange→blue passes green or magenta), pick the other direction (`in oklch longer hue`), or use `in oklab` and add a hand-picked middle stop that is allowed.
- **Light ↔ dark of the same hue** (most premium backgrounds): `in oklab`; perfectly even lightness.
- **To transparent**: `color-mix`/gradients premultiply, so `linear-gradient(in oklab, var(--accent), transparent)` fades cleanly; never fade to `rgba(255,255,255,0)` on dark (it greys the edge in old engines).

```css
.hero{ background: linear-gradient(135deg in oklch, oklch(38% .12 15), oklch(55% .15 40)); }
/* fallback for old engines: explicit stops from the kit's oklab/oklch row */
.hero{ background: linear-gradient(135deg, #6b1d2a, #8f2f3a 35%, #b8483c 70%, #c95f3c); }
```
Put the fallback declaration first and the `in oklch` one after (unsupported syntax is dropped, the fallback stays).

## 2. House-style backgrounds (dark, tinted, one accent)
- **Aurora**: 2-4 radial gradients of the accent and one analogous hue (±25°), each at 10-25% alpha, on a near-black tinted ground; blur the layer 60-120px and move it slowly (or not at all for `prefers-reduced-motion`).
  ```css
  .aurora{ background:
    radial-gradient(40% 50% at 20% 30%, color-mix(in oklab, var(--accent) 22%, transparent), transparent 70%),
    radial-gradient(35% 45% at 80% 20%, color-mix(in oklab, var(--accent-2) 16%, transparent), transparent 70%),
    var(--bg); }
  ```
- **Mesh**: 4-6 radial blobs positioned on a grid; adjacent blobs differ by ≤ 30° hue and ≤ 0.15 L to avoid hard seams. Generate an SVG with `feGaussianBlur` for export to static assets.
- **Spotlight/torch**: a single radial at 6-12% accent alpha following the pointer; the `neon-glass-ui` skill owns the interaction details.
- Keep backgrounds low in chroma overall: the accent glows because everything around it is quiet.

## 3. Glow recipes
```css
--glow: oklch(68% .2 15);                                        /* garnet glow, allowed */
.glow-edge{ box-shadow:
  0 0 0 1px color-mix(in oklab, var(--glow) 55%, transparent),
  0 0 14px color-mix(in oklab, var(--glow) 35%, transparent),
  0 0 42px color-mix(in oklab, var(--glow) 16%, transparent); }
.glow-text{ color: oklch(92% .05 15); text-shadow: 0 0 18px color-mix(in oklab, var(--glow) 60%, transparent); }
```
- The core of a glow should be **lighter and less saturated** than the halo (real light desaturates toward white at the centre). Neon text: near-white core with a hint of hue, coloured halo.
- 3 shadow layers max; more costs paint time with no visible gain.
- Glow colour C 0.15-0.22 at L 0.62-0.75; gamut-fit (`palette.mjs info`) since many high-C OKLCH values are outside sRGB.

## 4. Legibility ceiling (non-negotiable)
Any gradient, aurora, glow or sweep behind text must leave body text ≥ 4.5:1 (|Lc| ≥ 60) against the **brightest** pixel under the text. Workflow: take the brightest stop or blob centre under the text block, composite its alpha over the ground (or screenshot and sample), run `palette.mjs contrast <ink> <that colour>`. If it fails, lower the effect's alpha or move it; do not thicken the text plate or add text-shadow as the fix.

## 5. Gradient text
`background: linear-gradient(in oklch, ...); -webkit-background-clip: text; background-clip: text; color: transparent;` Check contrast at **both ends** of the gradient against the ground; the lighter/darker end usually fails. Keep gradient text to display sizes (≥ 32px) and add `@media (forced-colors: active){ color: CanvasText; background: none; }`.

## 6. Banding
Long, low-contrast dark gradients (L 0.12 → 0.20 over a full screen) band in 8-bit. Fixes: add a 2-4% opacity noise texture (SVG `feTurbulence` as a data-URI background), shorten the gradient, or add a mid stop. Export raster backgrounds as 16-bit PNG or dithered.

## 7. Taste checks
Run `palette.mjs banned` on every stop and on the midpoints. Common traps: oxblood → stone passes through a tan/gold-ish middle (C usually < 0.04, so fine, but check); orange → anything greenish passes gold; teal → chartreuse passes green. Purple/blue gradients are not the brand lead; use them only if the client mandates.

## Don't
- Don't use `in srgb` (the default for legacy syntax) for saturated far-apart hues without checking minC.
- Don't stack gradients on large saturated areas; glow lives in small bright details on quiet ground.
- Don't animate gradients by changing background-position on huge elements without `will-change` testing; prefer animating a transformed pseudo-element's opacity or transform.

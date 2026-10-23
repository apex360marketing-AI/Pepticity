---
name: color-mixing-oklch
description: Mix, tint, shade and tone colours perceptually in OKLab/OKLCH instead of sRGB, so blends stay clean rather than muddy or grey, with correct gamut mapping and CSS color-mix() / relative colour syntax. Use when asked to "mix these two colours", "make a lighter / darker version", "tint", "shade", "tone it down", "halfway between", "blend brand colours", "why does my mix look muddy", "hover colour", "color-mix", or to derive states (hover, pressed, disabled) from one colour.
---

# Colour mixing in OKLab / OKLCH

The kit is `../tonal-scales-and-tokens/palette.mjs`. Show numbers from it; never guess a mix.

```bash
K=../tonal-scales-and-tokens/palette.mjs
node $K mix '#1f4fff' '#ffd200' 0.5      # compares sRGB / OKLab / OKLCH
```
Real output: sRGB `#8f9180` (C 0.025, olive mud), OKLab `#8aa2ba` (C 0.044, grey-blue), OKLCH `#00b9a1` (C 0.129, teal: hue travelled through green). Three different answers; choose deliberately.

## 1. Which space for which job
| Job | Space | Why |
|---|---|---|
| Midpoint of two colours, data scales, "between A and B" | **OKLab** | straight line, no hue detour, even lightness |
| Keep it vivid (gradients, brand-to-brand blend of near hues) | **OKLCH**, shorter hue | chroma is interpolated, so it doesn't sag to grey |
| Complementary pair (hues ~180° apart) | OKLab, or add a midpoint stop by hand | OKLCH would sweep through a third hue (often a banned green or gold) |
| Mixing paint-like with white/black (tint/shade) | OKLCH, change L only, then gamut-fit | sRGB+white goes chalky and shifts hue (blue turns purple) |
| Transparency / overlay on a known background | sRGB alpha (it's what the compositor does) | then measure the composited result |

## 2. Tints, shades, tones (the right recipe)
- **Tint** = raise L, lower C proportionally (C drops as L → 1; sRGB cannot hold chroma near white). Never "add white" in sRGB.
- **Shade** = lower L, lower C slightly, and for warm hues (H 20-60) shift H by −3 to −8° so shadows don't go brown-muddy; for cool hues shift slightly toward blue. Do not add black in sRGB (it greys and kills chroma first).
- **Tone** = keep L, lower C toward the ground's hue (mix toward the neutral, not toward grey): `color-mix(in oklab, var(--accent) 70%, var(--gray-9))`.
- **State colours** from one base: hover = L ±0.03-0.05 (lighter on dark UIs, darker on light), pressed = L ±0.07, disabled = C × 0.3 and L toward ground by 40%. Keep H fixed.

## 3. Gamut mapping (do it every time you change L or C)
OKLCH can describe colours sRGB screens cannot show. When a computed colour is out of gamut, **reduce chroma at fixed L and H** (binary search; what `fit()` in the kit does, and what CSS Color 4 specifies). Never clip channels independently: clipping shifts hue and lightness (vivid oranges can drift toward yellow, into the banned zone). For P3-capable output, state both: `color: #c2414f; color: oklch(55% 0.19 18);` (sRGB fallback first).

## 4. CSS
```css
--accent-hover: color-mix(in oklab, var(--accent), black 12%);          /* shade: fine for small steps */
--accent-soft:  color-mix(in oklch, var(--accent) 14%, var(--bg));      /* tinted background */
--accent-ring:  color-mix(in oklab, var(--accent) 55%, transparent);    /* focus glow */
@supports (color: oklch(from red l c h)) {
  :root { --accent-hover: oklch(from var(--accent) calc(l - 0.05) c h); }  /* exact L step */
}
```
- `color-mix()` is supported in all current evergreen browsers; relative colour syntax needs the `@supports` guard (older Safari/Firefox ESR).
- `color-mix(in oklch, ...)` takes the **shorter hue** by default; add `longer hue` only on purpose.
- `color-mix()` premultiplies alpha, so mixing with `transparent` fades the colour cleanly without a dark fringe.
- When one colour is near-achromatic (C < 0.01) its hue is meaningless: in OKLCH it will drag the mix toward hue 0 (red). Mix in OKLab, or give the grey the other colour's hue (the kit does this).

## 5. Muddy-mix diagnosis (say which one it is)
1. **Grey dead zone**: complementary colours meet in the middle → mid C near 0. Fix: OKLCH path, or insert a hand-picked midpoint stop.
2. **Brown/olive mud**: red/orange mixed toward green/yellow in sRGB. Fix: OKLab, and check the midpoint isn't in the banned H 65-105 zone.
3. **Darkening dip**: sRGB average of two bright colours looks darker than both. Fix: OKLab keeps L linear.
4. **Hue shift on lightening**: blue + white → lavender in sRGB. Fix: OKLCH L-only change.

## 6. Check after mixing
Run `node $K info <result>`: confirm it isn't in a banned zone (mixes of oxblood and stone, or orange and anything greenish, can land in the gold zone) and that any text use still passes contrast.

## Don't
- Don't mix in HSL. HSL lightness is not perceptual (yellow at 50% is far brighter than blue at 50%).
- Don't chain many relative darken() steps; compute each state from the base.
- Don't use `mix-blend-mode` to make brand colours; blends depend on what's behind and break contrast checks.

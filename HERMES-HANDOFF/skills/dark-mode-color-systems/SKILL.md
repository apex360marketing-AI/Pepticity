---
name: dark-mode-color-systems
description: Design dark themes as their own colour system rather than an inversion - tinted near-black grounds, elevation expressed by lightness, desaturated accents, glow accents with limits, off-white ink that avoids halation, and paired light/dark token sets that switch cleanly. Use when asked to "make a dark mode", "dark theme", "night mode", "it looks muddy / harsh in dark", "convert this light design to dark", "elevation in dark mode", "glowing accents on black", or when a dark page's colours feel flat, neon-cheap or hard to read.
---

# Dark-mode colour systems

Dark mode is a second palette designed for an emissive, dark-adapted context. Inverting a light palette produces grey mud, glaring accents and broken hierarchy. Build tokens with `../tonal-scales-and-tokens/palette.mjs tokens <accent>` (it emits separate light and dark scales) and adjust with the rules below.

## 1. Ground and surfaces
- Ground L 0.14-0.19 in OKLCH, C 0.004-0.015 at the brand or material hue (onyx: H ~285 C ≤ 0.005; espresso: H ~45 C ~0.015; smoke: C ≤ 0.004). **Never `#000`** (smearing on OLED during scroll, harsh edges, no room for shadows) and never neutral `#121212` grey when the brand has a hue.
- **Elevation = lightness, not shadow.** Each raised layer adds ΔL ≈ +0.025-0.04 at the same hue: ground 0.16 → card 0.19 → popover 0.22 → modal 0.25. Shadows barely read on dark; keep them, but rely on the lift.
- Separate layers with a 1px hairline at ground + 0.10 L (or `color-mix(in oklab, var(--ink) 10%, transparent)`), not with heavier shadows.

## 2. Ink
- Primary ink L 0.90-0.94, C ≤ 0.015, warm or cool to match the ground. **Not `#fff`**: pure white on near-black blooms (halation), worst for astigmatic and older readers.
- Secondary ink L 0.72-0.78 (check |Lc| ≥ 60 APCA, not just 4.5:1; WCAG 2 overrates mid-greys on dark).
- Light text on dark looks *bolder* than the same weight on light: keep the weight, or reduce it by ~50 in a variable font if text looks bloated. Add slight letter-spacing (+0.01em) at small sizes.

## 3. Accent in the dark
- Saturated colours vibrate on dark grounds. Lower chroma by 10-25% versus light mode for fills, and raise L so the fill separates from the ground (dark step 9 is lifted to L ≥ 0.52 by the kit).
- Accent as text needs L ≥ 0.72 (use dark step 11).
- Deep brand colours (oxblood L 0.36) cannot be the dark-mode button fill unchanged: either lift to L ~0.52, or keep the deep colour as a fill with a lighter rim (`box-shadow: inset 0 0 0 1px var(--brand-8)`). Tell the client which.
- Tinted backgrounds for selected rows/badges: `color-mix(in oklab, var(--accent) 12-18%, var(--surface))`, not the light-mode step 3.

## 4. Glow accents (house style)
- One high-chroma glow colour (C 0.15-0.22) used for rims, focus, active lines, key numbers. Under 5% of pixels.
- Glow = layered soft shadows in the accent with falling alpha: `0 0 0 1px a/.45, 0 0 12px a/.35, 0 0 32px a/.18` (build with `color-mix(in oklab, var(--glow) N%, transparent)`).
- **Legibility ceiling**: any glow, torch or sweep behind text must keep body text at ≥ 4.5:1 against the brightest glow pixel. Measure at the glow's peak, not the ground.
- Chartreuse `#d4ff3a` is the owner's spark; on dark it reaches ~18:1 against black, so use it for thin lines and small type, never for large fills (it glares).

## 5. Images, illustrations, charts
- Dim photos slightly in dark mode (`filter: brightness(.9)`), or add a 10-15% ground-coloured overlay; full-bright photos punch holes in the page.
- Logos: provide a dark-mode version (light ink logo); never put a dark logo on a dark plate box.
- Charts: series colours need higher L (0.65-0.80) in dark; gridlines at ground + 0.08 L. Re-run `palette.mjs cvd` on the dark set.
- SVG icons should use `currentColor` so they follow ink.

## 6. Switching mechanics (both themes, one design)
```css
:root{ /* light primitives */ }
@media (prefers-color-scheme: dark){ :root:not([data-theme="light"]){ /* dark primitives */ } }
:root[data-theme="dark"]{ /* dark primitives */ }
:root{ color-scheme: light dark; }            /* native form controls and scrollbars follow */
```
- Set `color-scheme` or form inputs, scrollbars and autofill stay light.
- Prevent the flash: inline the theme script in `<head>` before CSS loads, reading the saved choice.
- `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="#...">` for mobile browser chrome.
- Light-dark helper where supported: `color: light-dark(var(--ink-l), var(--ink-d));` (needs `color-scheme`).

## 7. Converting a light design: checklist
1. Re-derive the neutral scale at the dark L targets (don't reverse the light one).
2. Re-map semantic tokens: bg → gray-1 dark, surface → gray-2/3, line → gray-6, ink → gray-12, muted → gray-11.
3. Lift and desaturate accent fills; move accent text to step 11.
4. Swap shadows for lightness elevation.
5. Re-check every text pair in dark with `palette.mjs contrast` (WCAG + APCA).
6. Render both themes side by side at 1280px and 390px; look for: invisible borders, glaring accents, muddy browns (warm hues at low L: rotate hue −5° toward red or raise C slightly).

## Don't
- Don't present dark and light as two "options"; they are one design in two modes.
- Don't use `filter: invert()` for dark mode, ever.
- Don't put pure saturated red/blue text on near-black: it vibrates and fails APCA.

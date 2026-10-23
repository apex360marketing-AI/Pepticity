---
name: color-palette-architect
description: Turn a brief, a brand name or a mood into a complete, justified brand palette with named roles (ground, surface, neutral, ink, accent, signal), proportions, light and dark values and a one-line reason for every colour, checked against the owner's taste rules and contrast. Use when someone says "build me a palette", "pick brand colours", "what colours for this client", "colour scheme for a website", "rebrand colours", "make it feel premium / calm / bold", or hands over a brief and needs colours.
---

# Colour palette architect

Deliver a palette as a **system of roles**, never as a row of pretty swatches. Each colour has one job, a proportion and a reason. The engine is `../tonal-scales-and-tokens/palette.mjs` (Node, no dependencies); run it, never eyeball numbers.

Related skills: `color-harmony-and-mood` (choosing hues), `tonal-scales-and-tokens` (expanding to 12 steps and tokens), `contrast-and-accessibility-color` (proof), `design-tokens-theming` in apex_agents_bots (the `--apx-*` contract; map your roles onto it when building APEX pages).

## 1. Interrogate the brief first (ask in one multiple-choice message if missing)
- Audience and price point (mass, premium, luxury, clinical, playful).
- Where it lives most: screen-dark, screen-light, print, signage, packaging. Print and signage need CMYK/Pantone sanity (flag neon and very saturated RGB as non-reproducible).
- Existing assets that cannot change (logo colour, regulated colours, a parent brand).
- Competitors' colours in the category. The accent must not collide with the category leader.
- Two adjectives the client wants, one they fear (e.g. "premium, warm; not cold-corporate").

## 2. The role set (always produce all of these)
| Role | Job | Typical OKLCH |
|---|---|---|
| Ground | page background, the 60% | dark: L 0.13-0.20, C ≤ 0.02 · light: L 0.95-0.985, C ≤ 0.02 |
| Surface | cards, panels, one step off ground | ground ±0.03-0.05 L |
| Neutral line/muted | borders, captions | ground hue, C ≤ 0.02 |
| Ink | body text | dark: L ≥ 0.90 · light: L ≤ 0.25; ≥ 7:1 on ground preferred |
| Secondary (the 30%) | the material/partner colour: stone, espresso, smoke | C 0.01-0.06 |
| Accent (the 10%, really 2-8%) | the one colour that means "act here / this is us" | C 0.10-0.22 |
| Signal set | error, warning, success, info | see §5 |

Proportion rule: 60 ground / 30 secondary+surfaces / 10 accent. The accent's share of pixels on a real screen is usually 2-8%; if it exceeds 10% the design reads loud and cheap.

## 3. Build order
1. **Pick the accent hue** from the brief (use `color-harmony-and-mood`). One accent. A second accent is allowed only if it is the same hue at a different lightness, or a deliberate "spark" (#d4ff3a) used on under 1% of pixels.
2. **Bias the neutrals toward the accent hue or the secondary material** (warm hue 40-85 for espresso/ivory/bone/stone; H 280-290 at C ≤ 0.005 for onyx/platinum). Never ship pure `#000`/`#fff` grounds or pure grey neutrals; C 0.003-0.018 is the tint range that reads as "expensive" rather than "default".
3. **Set ink** at the far lightness end of the ground, same hue family.
4. **Run the checks**:
   ```bash
   K=../tonal-scales-and-tokens/palette.mjs
   node $K info <ground> <surface> <ink> <secondary> <accent>     # banned-zone + contrast flags
   node $K contrast <ink> <ground>; node $K contrast <accent> <ground>
   node $K cvd <accent> <signal-error> <signal-success> <signal-info>
   ```
5. **Expand** with `node $K tokens <accent>` (12-step light + dark), then trim to what the project uses.

## 4. Owner taste rules (hard rules, check every colour)
- Never gold, amber, mustard, champagne or yellow: OKLCH H 65-105 with C ≥ 0.04 is banned. Ivory, bone and stone are fine because their C stays under 0.04.
- No green, mint or lime (H 105-175, C ≥ 0.04). The single exception is the chartreuse spark `#d4ff3a`, used sparingly.
- Do not lead with blue or purple (H 230-320, C ≥ 0.08) as the brand accent; allowed only as an info signal or a minor data series.
- Signature pairings the owner likes, verified hexes (start here when the brief allows):

| Pairing | Ground / ink | Partner | Note |
|---|---|---|---|
| Onyx & platinum | #111113 / #e5e4e2 | — | spark #d4ff3a for one CTA |
| Oxblood & stone | #cdc6bb ground | #5e1a24 (7.5:1 on stone) | oxblood works as text and as fill |
| Espresso & ivory | #f4efe6 / #2b1d17 (16:1) | — | the warm editorial default |
| Ink & bone | #14161c / #e9e4d8 (14.3:1) | — | bookish, serious |
| Smoke & rosewood | #2a2829 ground | #8a4b52 fill; text uses #e6acb1 | #8a4b52 as text on smoke fails (2.2:1) |

If the client's own brand colour is banned (a gold logo), do not silently ship it. Offer, as multiple choice: a platinum/bone reinterpretation (recommended), keep their colour only on their own site, or the nearest allowed hue.

## 5. Signal colours that fit the palette
- Derive signals at the **same L and similar C** as each other so none shouts louder: error H 20-30, warning H 45-55 (pumpkin/orange, not amber), info H 230-250, success: owner bans green, so use a neutral-ink check icon plus the word, or a desaturated teal H ~185-195 at C ≤ 0.08 if a colour is unavoidable; say which you chose.
- Never rely on hue alone for status: pair with an icon or word (WCAG 1.4.1).

## 6. Output format (always)
1. A swatch table: role, hex, `oklch()`, proportion, and a **reason** sentence tied to the brief ("Oxblood: reads heritage and appetite; distinct from the category leader's navy").
2. Contrast table for the pairs that will carry text.
3. Light and dark values for every role (dark is not inverted; see `dark-mode-color-systems`).
4. CSS custom properties block (from `palette.mjs tokens`), plus DTCG JSON if the project uses tokens.
5. A one-screen sample (hero + card + button) before applying everywhere (sample-first rule). In an artifact, show it rather than describe it.

## Don't
- Don't present 3-5 alternative palettes by default. Recommend one, explain it, offer one contrasting alternative only if asked.
- Don't pick colours from adjectives alone; tie each to audience, category and medium.
- Don't use the accent for body text or large fills; use its step 11 for text and its step 3-4 for tinted backgrounds.
- Don't quote "psychology" claims as fact (e.g. "red increases appetite by X%"); say "commonly read as".

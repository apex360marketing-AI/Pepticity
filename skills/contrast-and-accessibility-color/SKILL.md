---
name: contrast-and-accessibility-color
description: Prove colour accessibility - WCAG 2.2 contrast ratios (text, large text, UI and focus indicators), APCA Lc as an advisory second opinion, text over photos and gradients, colour-vision-deficiency simulation, never-colour-alone checks and senior-friendly contrast - using the bundled palette.mjs and axe-core. Use when asked "does this pass contrast", "is this accessible", "WCAG check", "APCA", "colour blind safe", "text on image is hard to read", "focus ring colour", "make it readable for older users", or before shipping any palette or page.
---

# Contrast and accessible colour

Kit: `../tonal-scales-and-tokens/palette.mjs`. Report measured numbers, not impressions.

```bash
K=../tonal-scales-and-tokens/palette.mjs
node $K contrast '#888888' '#ffffff'   # WCAG 3.54:1 (AA-large/UI)  APCA Lc 63.1 (content)
node $K cvd '#b3261e' '#2e7d32' '#1565c0'
```

## 1. The rules that are actually law (WCAG 2.2 AA)
| What | Minimum |
|---|---|
| Body text (< 24px regular, < 18.66px bold) | 4.5:1 (1.4.3) |
| Large text (≥ 24px, or ≥ 18.66px bold) | 3:1 |
| UI component boundaries, icons, chart marks needed to understand content | 3:1 against adjacent colours (1.4.11) |
| Focus indicator | visible; aim for 3:1 between focused and unfocused states and against the background (2.4.7, 2.4.13 at AAA asks for a 2px outline area at 3:1) |
| Information by colour alone | never (1.4.1): add icon, text, pattern or underline |
| Disabled controls, logos, decoration | exempt (still make disabled legible) |

AAA (7:1 body, 4.5:1 large) is the target for long-form reading, senior audiences, and healthcare/finance clients.

**APCA is advisory, not compliance.** WCAG 3 is still a draft. Quote APCA alongside WCAG, never instead. APCA thresholds (absolute Lc): 90 preferred body, 75 minimum body (≥ 18px), 60 content text (≥ 24px or bold 16px), 45 large headings/UI, 30 non-text spot elements, 15 invisible. Sign: positive = dark text on light, negative = light on dark. APCA is better at dark mode: WCAG 2 overrates mid-grey on black (e.g. #8b8786 on black is 5.9:1 but only Lc −38.5). On dark UIs, if WCAG passes but |Lc| < 60 for body text, raise the text lightness anyway.

APCA licensing: the official algorithm (Myndex/apca-w3, npm `apca-w3`) carries a restrictive licence for non-W3C use. The kit implements the published 0.0.98G-4g constants for internal checking; for a client deliverable cite it as "APCA (advisory)".

## 2. Workflow
1. List every **text/background pair actually used**, including muted text, placeholder text, link colour, text on accent buttons, text on tinted step-3 backgrounds, and chart labels.
2. Run `contrast` on each; fix failures by moving **lightness** (L in OKLCH), not hue. Use the scale step that passes (step 11 for secondary text, 12 for body).
3. Check UI edges: input borders (step 7) against the surface must reach 3:1 if the border is the only thing showing the field exists; otherwise add a fill.
4. Focus: a 2px ring in step 8 or the accent plus a 2px gap in the ground colour (`outline: 2px solid var(--focus); outline-offset: 2px`). Check the ring against both the ground and the component fill.
5. Run `cvd` on the set of status/series colours. If any pair's ΔEok < 0.06 under protan/deutan/tritan, separate them in lightness (ΔL ≥ 0.15) or add shape/label. Red-vs-green status pairs almost always fail deutan; the owner also bans green, so use red vs neutral + icon.
6. Automated pass in the browser: axe-core (`npx @axe-core/cli <url>` or Playwright + `@axe-core/playwright`); rule `color-contrast` (and `color-contrast-enhanced` for AAA). axe reports "needs review" for text over images and gradients; that's on you (§3).

## 3. Text over images, video and gradients
- Measure against the **worst pixels behind the text**, not the average. Sample the region under the text box (canvas `getImageData`), take the lightest 5% (for light text) or darkest 5% (for dark text) and test against that.
- Fix in this order: (a) move the text to a calmer part of the image; (b) add a scrim: `linear-gradient(to top, oklch(0.15 0.01 H / .75), transparent 60%)`; (c) a solid or frosted plate behind the text (blur 8-14px, fill ≥ 55% opacity); (d) text-shadow only as a supplement, never the fix.
- Re-check at mobile crop: the hero image recrops and the busy part moves under the headline.
- Video: test three frames (start, brightest, busiest).

## 4. Seniors and low-vision audiences (common in the agency's clients)
- Body text ≥ 7:1 (AAA) and |Lc| ≥ 90; avoid thin weights (< 400) on any tinted ground.
- Avoid mid-grey secondary text; use step 11 at minimum, and prefer step 12 for anything that must be read.
- Ageing lenses yellow and scatter: blue-on-dark and blue/purple distinctions fade; pure white on pure black causes halation. Use off-white ink (L ~0.93) on near-black (L ~0.16).
- Links: underline them; colour alone fails 1.4.1 unless the link has 3:1 against surrounding text *and* a non-colour cue on hover/focus.

## 5. Dark-mode specifics
- Check every token pair in **both** themes; a pair that passes in light often fails in dark (accent text especially).
- Saturated accents as text on dark need L ≥ 0.72; the ramp's step 11 dark handles this.

## 6. Report format
A table: pair, usage, WCAG ratio + level, APCA Lc, verdict, fix (new hex + new ratio). Then a CVD line listing the closest pair per deficiency. Never write "passes" without the number.

## Don't
- Don't "fix" contrast by adding opacity to the ground or more blur to glass; change the ink or the plate.
- Don't trust design-tool contrast plugins on semi-transparent colours; composite first, then measure.
- Don't round 4.47:1 up to 4.5:1. It fails.

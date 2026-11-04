---
name: ui-ux-premium
description: Use as the one-page UI/UX checklist for any premium DARK PEPTICITY or APEX page, section, card, form or menu - before building and again before showing. Covers hierarchy, spacing scale, type scale, tap targets ≥44px, focus states, AA contrast, one CTA per screen-and-a-half, forms and motion timing tokens. It is a compact index; deeper rules live in premium-restraint (colour), senior-accessibility-aa-plus (55+ sizes), motion-design-system (tokens), layout-composition, capture-forms and hook-architecture. Never use it to change the locked dashboard look.
---

# UI/UX PREMIUM (DARK)

## NO DUPLICATES: WHERE THE DEEP RULES LIVE
- Colour budget and the cheap detector: `premium-restraint` (accent ≤5% of pixels).
- 55+ readability, focus-not-obscured, axe pass: `skills/senior-accessibility-aa-plus`.
- Motion tokens and choreography: `motion-design-system` (apex_agents_bots, `--apx-dur-*`, `--apx-ease-*`).
- Grids and composition: `layout-composition`. Forms: `capture-forms`. CTA spacing: `hook-architecture`.
- This file = the checklist you tick. Dashboards are LOCKED (CLAUDE.md): only add native-looking cards or accents when asked.

## 1. HIERARCHY (one glance = one message)
- [ ] Each screen has ONE hero element (biggest, brightest, most space). Everything else is visibly quieter.
- [ ] Three levels max per screen: headline → one supporting line → action. Extra detail goes behind a tap.
- [ ] Contrast of importance comes from size, space and brightness, NOT colour fills.
- [ ] Headings, menu items, labels and card titles in CAPITALS, tracking 0.04-0.12em, in the brand font (3D type for headers per CLAUDE.md).
- [ ] Squint test: blur the screenshot 8px; the hero and the CTA must still be the two things you see.

## 2. SPACING SCALE (8-point; nothing off-scale)
- [ ] Tokens only: 4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128 · 160 px.
- [ ] Inside a card ≤ gap between cards ≤ gap between sections (proximity = grouping).
- [ ] Section padding desktop 128-160px, phone 64-96px. Space is the luxury.
- [ ] Phone side gutter 16-20px; no sideways scroll at 390px.
- [ ] Equal gaps measured in the screenshot (owner sees uneven gaps instantly).

## 3. TYPE SCALE (ratio 1.25, fluid with clamp, rem floors)
```css
:root{ --fs-0:1.125rem;                                 /* body 18px */
  --fs-1:1.25rem; --fs-2:clamp(1.4rem,1.2rem + .8vw,1.6rem);
  --fs-3:clamp(1.8rem,1.4rem + 1.6vw,2.4rem); --fs-4:clamp(2.4rem,1.6rem + 3vw,3.8rem);
  --fs-5:clamp(3rem,1.8rem + 5vw,6rem); --fs-small:1rem; }
```
- [ ] Body ≥18px, line-height 1.5-1.7, measure 45-75ch. Small text ≥16px, never <14px.
- [ ] Max 2 type families + the PEPTICITY display face. Numbers tabular in prices/tables.
- [ ] Body text off-white (about #E8E8E4), not pure #FFF on near-black (halation).

## 4. CONTRAST (dark grounds)
- [ ] Body ≥4.5:1, large text and UI edges/icons ≥3:1 (WCAG 2.2 AA); aim 7:1 for body on PEPTICITY (55+ audience).
- [ ] Measured over the BUSIEST pixels behind text (film, glass, watermark), not the flat wall.
- [ ] Text on glass gets a soft text bed / scrim, never relies on blur alone (`clear-glass-spec`).
- [ ] Disabled ≠ invisible: still ≥3:1 for its outline plus a text reason.

## 5. TAP TARGETS AND FOCUS
- [ ] Every target ≥44×44px; primary CTA, quiz options and inputs ≥56px tall; ≥8px between targets.
- [ ] Focus ring visible on every control: `:focus-visible{outline:3px solid var(--focus);outline-offset:2px}` in a monochrome light tone (or the ONE accent); never removed, never hidden by sticky bars (`scroll-padding`).
- [ ] Logical tab order; Esc closes overlays; focus returns to the opener.
- [ ] Hover states have a keyboard twin (focus shows the same light sweep).

## 6. CTA RHYTHM
- [ ] ONE primary CTA per screen-and-a-half of scroll (`hook-architecture`). Never two primaries side by side.
- [ ] Primary = the only lit control on screen; secondary = text link or hairline; tertiary = plain text.
- [ ] Verb-first, specific label ("JOIN FOR 15% OFF", "SEE THE VIAL"), no "Submit"/"Click here".
- [ ] Sticky mobile CTA ≤64px tall, never covers a form field or the focused element.

## 7. FORMS (details in `capture-forms`)
- [ ] One field first; ask more later. Visible labels (placeholders are not labels).
- [ ] Correct `type`, `inputmode`, `autocomplete`; input font ≥16px (stops iOS zoom).
- [ ] Inline validation after blur, message under the field in words, not colour alone; `aria-describedby` linked.
- [ ] Consent unticked, one box per purpose (CASL). Success state says what happens next.
- [ ] No watermark, scanlines or moving texture behind any field (`moving-watermark`).

## 8. MOTION TIMING TOKENS (mirror of `motion-design-system`)
| Token | Value | Use |
|---|---|---|
| `--apx-dur-1` | 120ms | press, toggle |
| `--apx-dur-2` | 200ms | hover in, focus |
| `--apx-dur-3` | 320ms | small reveal, field morph |
| `--apx-dur-4` | 560ms | card/section reveal |
| `--apx-dur-5` | 900ms | hero entrance |
| sweep | 1200-1600ms | brand hover light sweep, left → right |
- [ ] Entrances `--apx-ease-out`, exits `--apx-ease-in` and ~30% faster than entrances.
- [ ] Stagger 60-90ms; never everything at once. No bounce/overshoot on luxury pages.
- [ ] Motion only via transform/opacity; `prefers-reduced-motion` = instant final states.
- [ ] Nothing flashes more than 3×/s (WCAG 2.3.1); no auto-moving content >5s without pause.

## 9. STATES (every component)
- [ ] Default · hover · focus · active · disabled · loading · error · success · empty, all designed.
- [ ] Loading shows shape (skeleton in the wall tone), never a spinner on a blank page.

## 10. PALETTE (every check)
- [ ] Restrained monochrome: wall #323232, metal #080807-#8E8D85, faint UV-black sheen. At most ONE sparing accent.
- [ ] Never gold/amber/peach/yellow, no rainbow or multicolour glows, no cartoon, no pills.

## PROOF (before showing; `verify-before-done`)
- Screenshots 1440×900 and 390×844; axe-core has no serious/critical issues; contrast samples logged; keyboard-only run-through of every CTA and form; tick this list in the report.

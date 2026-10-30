---
name: gamified-reveal-hooks
description: Use when a PEPTICITY page needs a playful but classy sign-up mechanic instead of a plain form (sealed-envelope / wipe-to-reveal, vault dial, hidden-mark hunt, story-end unlock). Covers the interaction code, deterministic rewards (never a contest or random prize), reduced-motion and keyboard alternatives, and where the email field appears. Not for the form itself (capture-forms) or placement (hook-architecture).
---

# Gamified reveal hooks

Research: `docs/research/HOOKS-DEEP-DIVE.md` ideas 1, 12, 15, 21. Vendor data puts gamified forms at 8–11% vs ~4% for plain pop-ups; Recart's controlled test shows it depends on the vertical, so A/B test every one.

## The four approved mechanics
| Hook | Interaction | Reveals |
|---|---|---|
| SEALED ENVELOPE REVEAL | Drag across a chrome wax seal (canvas wipe) | Member card + welcome gift, then one email field |
| VAULT DIAL | Turn a chrome dial to 3 numbers shown earlier in the story | The vault opens on the member card |
| HIDDEN MARK HUNT | Find 3 faint PEPTICITY marks in the city scroll | Member card unlocked early |
| STORY-END UNLOCK | Reach the end of the scroll story | Locked "CHAPTER 0" content, opens with email |

Rejected: spin wheels, slot machines, "you won!" fanfare, random prizes (tacky and a contest under Competition Act s.74.06).

## Rules
- **Deterministic.** Everyone who completes it gets the same thing. No odds, no "try again". This keeps it out of contest law.
- **Reward first, ask second.** The reveal finishes before the email field appears. The field sits on the revealed card (capture-forms one-field pattern).
- The gift reads from `COUNSEL_CLEARED.offer`: grand-opening offer when true, the primer/member card when false.
- One gamified hook per page, max. Never on top of the scroll story, the cart or another form.
- Copy: CAPS titles, calm verbs ("BREAK THE SEAL", "OPEN THE VAULT"). Never "WIN", "LUCKY", "PRIZE".
- Brand-lock: chrome edge, see-through glass, chamfered corners, no pills, no warm gold except the approved gold-chrome.

## Wipe-to-reveal code notes (pattern from Masth0/ScratchCard, MIT)
- Top canvas painted with the seal texture; the gift is real HTML underneath (readable, indexable).
- On pointer move: `ctx.globalCompositeOperation = 'destination-out'` and draw a soft circle (radius ~28px desktop, 36px touch).
- Measure cleared area with `getImageData` every ~120ms (throttled), counting pixels with alpha 0 on a 4px stride. At **45%** clear, fade the canvas out over 400ms and fire `hook_reveal` once (a `done` flag, as ScratchCard's `callbackDone`).
- `touch-action: none` on the canvas only, so the page still scrolls elsewhere.
- Optional chrome dust: canvas-confetti (ISC) with `disableForReducedMotion: true`, 30 particles, platinum colours only.

## Vault dial code notes
- SVG dial, `pointermove` angle via `Math.atan2`; snap to 40 ticks; light a notch for each correct number.
- Keyboard: dial has `role="slider"`, arrow keys turn it, Enter confirms a number.
- Numbers are shown openly in the story (e.g. on three doors) so nobody gets stuck. After 20 s idle show "SHOW ME" which opens it.

## Hunt and story-end notes
- Marks are `<button>`s with an aria-label ("PEPTICITY MARK 1 OF 3"), faint (opacity .18), brighten under the cursor/tap. Progress shown as 3 small notches in the corner. State in localStorage (try/catch).
- Story-end: IntersectionObserver on the last section; reveal once per visitor.

## Accessibility and reduced motion
- Every mechanic has a plain button: "SKIP · SHOW MY CARD". Screen readers get the button first.
- `prefers-reduced-motion`: no particles, the seal fades instead of wiping, the dial opens with one press.

## Measure
- `data-hook` ids continue from H41 (pick the next free id in pepticity-lead-engine). Events: `hook_view`, `hook_interact`, `hook_reveal`, `form_submit`. Compare against the plain-form version with a 50/50 split.

## Checks
- [ ] Reward is the same for all; no chance words anywhere.
- [ ] Email field appears only after the reveal; CASL box unticked.
- [ ] Works with mouse, touch, keyboard and reduced motion (Playwright screenshots of each).
- [ ] Counsel switch flips the gift correctly.

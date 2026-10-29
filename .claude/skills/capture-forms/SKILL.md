---
name: capture-forms
description: Use when building or reviewing ANY PEPTICITY sign-up form (join the team, member card, restock alert, waitlist, letter, quiz email, refer, exit slide-in, checkout email). Covers one-field-first, progressive profiling, inline validation, the submit morph, the success state with a next step, CASL wording, preview-only mode for artifacts and hook-id tagging. Uses the payload and consent records from pepticity-lead-engine.
---

# Capture forms

## Approved form effects (use them)
- FRM-102 Quote Stepper: multi-step join flow with a head-start progress bar.
- FRM-103 Submit Morph: the button morphs into the success state.
- FRM-104 Sentence Check: "I'm ___ and I'd like ___" sentence-style form.
- FRM-02 Live Member Card: the name writes onto a chrome member card as it is typed.

## One field first
- First screen asks for EMAIL only (or name for the member card). One button.
- Button label says what they get: "CLAIM MY 15% OFF", "TELL ME WHEN IT'S BACK". Never "Submit".
- Phone only where it is the point (SMS restock alerts), and optional.

## Progressive profiling (after the first field succeeds)
- Step 2 (optional, skippable): first name (for the card), province (for shipping and age rules).
- Step 3 (optional): interests from a short list of product categories, never health conditions.
- Each later step has "SKIP" and saves what was given so far.
- Never ask the same thing twice: read saved state first.

## Inline validation
- Validate on blur, not on every key. Error text under the field, plain: "That email looks incomplete." No red flood; use a thin platinum-or-accent line and an icon.
- `type="email"`, `autocomplete="email"`, `inputmode="email"`; 44px targets; labels always visible (no placeholder-only labels).
- Honeypot field and rate limit on live builds.

## Consent (CASL)
- A separate UNTICKED checkbox per consent type. Never pre-ticked, never bundled into the button.
- Email: "Yes, PEPTICITY may email me [the offer / restock alerts / Grace's letter] and occasional news. I can unsubscribe any time."
- SMS: "Yes, PEPTICITY may text me about [the thing] at this number. Message and data rates may apply. Reply STOP to stop."
- The form still works without marketing consent for transactional things the visitor asked for (e.g. their order).
- Privacy line under the field: "Your details never go to ad platforms. Unsubscribe in one click." (only if true; audit the tags).
- Age/province gate before any purchase-linked offer (R121).

## Submit and success
- Submit: FRM-103 morph, button keeps its size, shows progress, then the success state in the same spot (no page jump).
- Success state always has a NEXT STEP: "Your card is ready. SEE THE STORE →" or "Add your first name to finish your card."
- Show the code or perk clearly if the counsel switch allows it; otherwise "We'll email your welcome."

## Preview-only mode (artifacts and review builds)
- Artifacts cannot send data. Show "Preview only: nothing was sent." in the success state.
- Keep the payload visible behind `#debug` only.

## Tagging
- Every form root: `data-hook="H34"` and `data-effect="FRM-102"` etc.
- Payload shape and consent record exactly as in `pepticity-lead-engine` §3–4 (hook, page, consent text, timestamp).

## Visitor wording
- Never "lead", "lead magnet", "funnel", "capture" on the page. Say "join", "claim", "get", "tell me".
- No health claims, no dosing, no clinician/pharmacy wording.

## Checks
- [ ] First step is one field.
- [ ] Later steps skippable; saved state respected.
- [ ] Consent boxes unticked, separate, exact wording.
- [ ] FRM-103 morph and a success state with a next step.
- [ ] Preview-only notice in artifacts.
- [ ] `data-hook` on every form; keyboard-operable; visible labels.

---
name: conversion-ux
description: Make APEX pages and generated client sites turn visitors into leads without losing the premium feel — lead and quote forms (field count, multi-step with head-start progress, autocomplete/inputmode, Baymard-style inline validation, consent wording placeholders), CTA hierarchy and placement, sticky mobile CTA, honest trust signals, friction audits and privacy-safe event tracking. Use for any form, CTA, "Get leads" flow, quote/area checker (FRM codes), pricing section, or when a page looks good but won't convert.
---

# Conversion UX

APEX sells leads, and every client site exists to generate them. Beautiful pages that don't convert are failures, and pushy pages break the classy brand. The goal is calm confidence: one clear next step, no friction and honest proof.

## 1. The 5-second test (above the fold)
A business owner should be able to say, in 5 seconds: what it is, who it's for, and what to do next. Above the fold you need one headline (the outcome), one line saying how it works, one primary CTA and one honest trust cue. Nothing else competes; no carousel, and no three equal buttons.

## 2. CTA hierarchy
- One **primary** action per viewport (filled or glass with accent rim), with at most one **secondary** (ghost or text link).
- Label = verb + outcome, matching the next screen's title. "See leads in [City]" leads to a page titled "Leads in [City]". Avoid "Submit", "Learn more" and "Click here".
- Repeat the primary CTA at the end of every major section, and once in a closing section.
- **Phone:** a sticky bottom bar (primary CTA + call button), shown after the hero scrolls away and hidden when the keyboard is open or a form is in view. Allow for `env(safe-area-inset-bottom)`.
- Micro-interactions (magnetic, sheen) may decorate the CTA, but the hit area never moves and the focus ring is always visible.

## 3. Lead and quote forms (FRM-xx modules)
- **Ask only what's needed to act:** name, phone, service and postcode/ZIP. Everything else is optional or comes after submit ("Tell us more" on the thank-you screen).
- **Multi-step** when there are more than 4 fields: one question per step, the easiest first (service → area → timing → contact). Show "Step 2 of 4", with step 1 already ticked (the endowed-progress effect). Never more than 8 steps.
- Single column. A visible label above every field; placeholders are never the label.
- Correct mobile keyboards and autofill:
```html
<label for="n">Your name</label>   <input id="n" name="name" autocomplete="name" required>
<label for="p">Mobile number</label><input id="p" name="tel" type="tel" inputmode="tel" autocomplete="tel" required>
<label for="z">Postal / ZIP code</label><input id="z" name="postal" autocomplete="postal-code" autocapitalize="characters" required>
<label for="e">Email (optional)</label><input id="e" name="email" type="email" inputmode="email" autocomplete="email">
```
- **Inline validation (Baymard):** validate on blur, never while the person is still typing in an empty field. Remove the error as soon as it's fixed. Show positive confirmation (a subtle bone or accent tick, never green). Messages say how to fix the problem: "Add your area code, e.g. 604 555 0123".
```js
form.querySelectorAll('input').forEach(i => {
  i.addEventListener('blur', () => i.value && show(i));
  i.addEventListener('input', () => i.closest('.field').classList.contains('err') && show(i)); });
function show(i) { const f = i.closest('.field'), ok = i.checkValidity();
  f.classList.toggle('err', !ok); f.classList.toggle('ok', ok);
  f.querySelector('.msg').textContent = ok ? '' : (i.dataset.hint || i.validationMessage); i.setAttribute('aria-invalid', !ok); }
```
- **Submit:** disable on the first click to prevent double sends. The button shows progress ("Sending…"), then a real success screen that says what happens next and when ("[We'll text you within X minutes]", using a placeholder until it is true). Keep all input if there's an error.
- **Consent (roadmap item 16):** use an unticked checkbox and the placeholder text `[Consent wording — US/Canada, lawyer to review]` beside the phone field. Never pre-tick it, never hide it, and link to the privacy page.
- Tap targets ≥ 44px; error colour plus icon plus text (never colour alone); errors announced with `aria-live="polite"`.

## 4. Trust signals (honest only)
- **Allowed:** a clear process ("How it works" in 3–4 steps), a real sample lead labelled **Sample**, `[Your verification process]`, licences or memberships that really exist, a privacy note by the phone field, an exclusivity definition in plain words, a named human contact, and real reviews once they exist (with source).
- **Never:** invented counters ("2,000+ businesses"), fake logos, made-up testimonials, countdown timers, "only 2 spots left" (unless true and sourced), or guarantees. Use `[placeholder]` and list every placeholder to the owner.
- Verified chips: neon `#d4ff3a` text on charcoal `#1f2124`, platinum or bone. Never green or yellow.

## 5. Friction audit (run on every page)
1. Is the primary CTA visible without scrolling at 390×844?
2. Count the fields; can any go?
3. Does any animation delay the form or CTA from being usable (the loader, scroll-jacking)? The form must work with motion off.
4. Is the LCP ≤ 2.5s (quality-gate)? A slow page is the biggest conversion leak.
5. Are there exits competing with the CTA (outbound links, auto-playing video with sound)?
6. Is there a phone fallback (tap-to-call) for people who won't fill in forms?

## 6. Measuring (privacy-safe)
Fire `form_view`, `form_start` (first input), `step_complete:{n}`, `form_submit` and `form_error:{field}` events, plus `cta_click:{id}` from `data-cta` attributes. **Never send field values or personal details to analytics.** Experiments change one thing at a time, and the owner approves them first.

## Verify (Playwright, `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`)
- Keyboard only: Tab through the form, fill it in and submit with Enter. The focus order is logical and every state is visible.
- Error path: blur an invalid phone number and the error appears; fix it and the error clears immediately. A double-click on submit sends only one request (count `page.on('request')`).
- `isMobile` context: `type`/`inputmode`/`autocomplete` attributes are present (read the DOM). The sticky CTA doesn't cover inputs when focused.
- axe shows no serious violations. Every input has a label (`input.labels.length > 0`).
- Grep the visible text for numbers next to "clients", "businesses", "%", "guarantee" or "reviews". Each must be sourced or a `[placeholder]`.
- Screenshot the form's default, error and success states, then LOOK: still classy, no red-alert walls.

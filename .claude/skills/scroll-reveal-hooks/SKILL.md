---
name: scroll-reveal-hooks
description: Use when a PEPTICITY page needs hooks that glide in while the visitor scrolls and fade away again (the owner's "some appear while scrolling and fade away; classy, never cheesy", R094). Sets timing, placement, frequency caps, the rule that they never cover the scroll story or forms, and reduced-motion behaviour. Pairs with hook-architecture (where) and capture-forms (the form inside).
---

# Scroll-reveal hooks

## What one looks like
- A small chamfered glass card (brand-lock: see-through, chrome edge, CAPS title) with one line and one action: a button or a single field.
- Width 300–360px desktop; a bottom sheet strip on phones (max 30% of screen height).
- Content examples: "FIRST WORD ON RESTOCKS · JOIN", "GRACE'S MONTHLY LETTER · GET IT", "YOUR MEMBER CARD IS WAITING · CLAIM".

## Placement
- Side margins or lower corners, in the "dead" space beside the story, never centre screen.
- Never over: the 3D hero object, the doors and scanner, the city weave focal point, product cards being read, the cart drawer, any form, the GUIDE bar.
- Before showing, check the card's box does not intersect elements tagged `data-no-cover` (add that tag to story focal points and forms).

## Timing (match motion-design-system tokens)
- Trigger: when a named section reaches 40–60% in view (ScrollTrigger or IntersectionObserver), not on time alone.
- Enter: 600–800 ms glide (12–24px travel) plus fade, ease-out.
- Stay: while its section is in view, or 6–10 s, whichever is shorter.
- Exit: 400–500 ms fade (exits faster than entrances). Also exits when the visitor scrolls past, or on Esc / close.
- If the visitor focuses the field, it stays until they submit or close.

## Frequency caps
- Max one scroll-reveal on screen at a time.
- At least 1 screen of scroll between two reveals; max 4 per page view.
- A dismissed hook does not return this session. A completed hook never returns; show the next step instead.
- Never in the same screen as a pop-up, the exit slide-in or the sticky bar's expanded state.
- Store caps in `sessionStorage`/`localStorage` inside try/catch; behave correctly if storage is blocked (fall back to once per page view).

## Classy, never cheesy
- No bounce, shake, confetti, countdown, flashing or "X people are viewing".
- One slow left-to-right light sweep across the card title on enter, once.
- Copy is calm and specific. No exclamation marks.

## Accessibility and reduced motion
- `prefers-reduced-motion: reduce`: no glide; a simple 200 ms opacity fade, or show statically at the section's end.
- Card is reachable by keyboard; close button has an aria-label; it does not steal focus on appear (use `aria-live="polite"` for the title).
- Close target ≥ 44px.

## Tag and measure
- `data-hook="H4x"` and `data-reveal` on each card. Events: `form_view` on appear, `cta_click:{hook}`, `form_submit`.

## Checks (in Playwright, desktop and phone)
- [ ] Scroll the full page: each reveal appears at its section and fades when passed.
- [ ] Never overlaps a `data-no-cover` element (check bounding boxes).
- [ ] Never two on screen; caps hold after reload.
- [ ] Reduced-motion run shows no glide.
- [ ] Dismissed card does not return this session.

---
name: hook-architecture
description: Use when planning or reviewing ANY PEPTICITY visitor page (home, hero, city scroll, store, product, journal, menu) to build its hook map: one clear ask every 1–1.5 screens, the grand-opening offer above the fold, the right hook type in each spot, and density caps so it stays classy. Builds on pepticity-lead-engine (hook ids, consent, payload) and docs/research/lead-magnet-hooks.md (risk ratings).
---

# Hook architecture

The site is a premium peptide STORE. Hooks sell membership, offers and the store, never health outcomes. Visitor copy never says "leads", "lead magnet" or "get leads" (R107).

## Hook inventory (pick from these; ids continue lead-engine's H-list)
| Type | What the visitor gets | Example label (CAPS) |
|---|---|---|
| Offer | Grand-opening offer for joining (R105: 15% off first order) | JOIN THE PEPTICITY TEAM |
| Member card | Name writes onto a live member card (FRM-02, H34) | CLAIM YOUR CARD |
| Restock alert | Email when a sold-out item is back | TELL ME WHEN IT'S BACK |
| Waitlist | First access to a coming product or drop | JOIN THE LIST |
| Quiz | 3 taps, then "where should we send it?" (H40) | FIND YOUR STARTING POINT |
| Letter | Monthly health letter from Grace (H18) | GET GRACE'S LETTER |
| Refer | Share with a friend (give 15% / get 15% credit, counsel first) | SHARE PEPTICITY |
| Exit | One quiet slide-in when leaving (H07) | BEFORE YOU GO |
| Sticky bar | Slim bar on phones with the main ask | JOIN · 15% OFF FIRST ORDER |

## Compliance switch (wire it, don't argue it)
- The 15% offer and restock alerts on catalogue peptides are rated STOP in the research (H01, H05) until counsel clears them. Every offer/restock hook reads from one flag, `COUNSEL_CLEARED.offer`. When false, the same slot shows the safe version (member card, letter, waitlist for news).
- Purity certificates and fast Canadian shipping appear ONLY when Grace confirms they are real (R055, R104). Until then, use `[placeholder]` and keep them off live pages.
- No health claims, no dosing, no "for [goal]" next to a product, no physician/clinician/pharmacy wording.

## Build the map (one table per page, in the page plan)
| Screen | Section | Hook id | Type | Form pattern | Effect code |
|---|---|---|---|---|---|
| 0 | HERO | H01 | Offer | one field + member card | FRM-02, TXT-09 |
| 1.5 | CITY WEAVE | H41 | Scroll-reveal letter | slide-in | see scroll-reveal-hooks |
| 3 | DOORS + SCANNER | H34 | Member card tap | card | FRM-02 |
- Count screens at 1440×900 and 390×844. Mark each hook's position.

## Rules
- Hero (above the fold, first screen after the entrance): the grand-opening offer with ONE field and one button. Not cheap-sounding: no "SALE!!!", no red, no timers.
- One clear ask every 1–1.5 screens. Never two asks in the same screen.
- One PRIMARY ask per page (join the team). Others support it.
- Rotate hook types; never the same type twice in a row.
- A person who already joined (saved state) sees the next step instead: restock alerts, refer, letter preferences.

## Density caps (classy)
- Max one pop-up/slide-in per visit; exit slide-in max once per session, 3 times ever.
- Sticky bar on phones only, hidden while the keyboard is open or a form is on screen.
- Nothing ever covers the scroll story, the doors/scanner moment, the cart or a form.
- Hooks use the brand-lock glass, chamfered corners, the slow sweep. No pills, no flashing.

## Measure
- Tag every hook element `data-hook="H34"`. Events: `form_view`, `form_start`, `form_submit`, `cta_click:{hook}`. No field values to analytics.

## Checks
- [ ] Map table exists for the page with screen positions.
- [ ] Offer above the fold on the hero.
- [ ] Gap between asks ≤ 1.5 screens and ≥ 1 screen.
- [ ] Compliance switch wired; no claims; no "leads" wording on the page.
- [ ] Density caps respected on desktop and phone.

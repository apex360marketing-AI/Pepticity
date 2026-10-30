---
name: honest-urgency-and-social-proof
description: Use whenever a PEPTICITY page shows stock levels, countdowns, launch dates, order notices, review counts, waitlist positions or any "others are buying" signal. Every number must come from real data and change only when the data changes. Covers the data contract, the honest stock line, the real order pulse, real-date countdowns, verified reviews after five, and the Competition Bureau rules. Use before shipping any urgency or social-proof element.
---

# Honest urgency and social proof

Research: `docs/research/HOOKS-DEEP-DIVE.md` ideas 4, 11, 14, 16, 22, 23. Law: Competition Bureau "The urgency is fake" (2024) and the Dufresne $3.25M settlement (timers outlived offers). Fake urgency is misleading advertising in Canada.

## The one rule
If the number is not read from a real source at render time, it does not appear. No `Math.random()`, no hard-coded "12 people viewing", no timers that reset per visit. Placeholders like `[real stock]` stay off live pages.

## Data contract (one module, `shared/proof.js`)
```js
// each getter returns null when there is no real data -> the element hides
getStock(sku)          // from shared/inventory.js or the backend; integer or null
getQueuePosition(sku)  // count of earlier restock sign-ups + 1, from the lead store
getLaunch(lotId)       // { at: ISO date set by Grace } or null
getRecentOrder()       // { province, minutesAgo } from the real order feed, or null
getReviews(sku)        // verified reviews array; show only if length >= 5
```
- Each element renders only when its getter returns non-null. The template has no fallback number.

## Patterns
- **HONEST STOCK LINE**: under the price, platinum text: "24 IN THIS LOT". Show from 1 up; at 0 swap to SOLD OUT + restock form (offer-to-checkout). Never "ONLY X LEFT!" in red.
- **RESTOCK QUEUE NUMBER / FIRST-ACCESS POSITION**: after sign-up, "YOU'RE #14 IN LINE FOR THE NEXT LOT." Position is fixed at sign-up time and stored with the lead.
- **LAUNCH LOT COUNTDOWN**: only for a dated lot release Grace has set. Slow chrome flip digits (pattern from PButcher/flipdown, MIT: counts to a fixed Unix timestamp, so it never resets). When it reaches zero it changes to "AVAILABLE NOW" and stays so. If the offer ends at zero, the offer really ends.
- **REAL ORDER PULSE**: max one notice per visit, after 20 s, bottom-left, auto-hides after 6 s. "AN ORDER JUST LEFT FOR ONTARIO." Province only, never names, cities or products. Hide if the latest order is older than 24 h.
- **VERIFIED REVIEWS AFTER FIVE**: the block is hidden until five verified-buyer reviews exist (Spiegel 2017: the first five reviews give most of the lift). Show count, average, newest first. Moderate out any health outcome or dosing wording.

## Toast mechanics (pattern from emilkowalski/sonner, MIT)
- Container is `aria-live="polite"`; never steals focus.
- Pause the hide timer while hovered and while `document.hidden` (sonner's `isDocumentHidden` check).
- Max 1 visible; swipe or Esc dismisses; `prefers-reduced-motion` = fade only.

## Wording
- Calm and factual. Allowed: "IN THIS LOT", "IN LINE", "AVAILABLE FROM [DATE]". Banned: "HURRY", "SELLING FAST", "X PEOPLE ARE VIEWING", "LAST CHANCE" (unless it truly is), red badges, flashing.
- No health words in any notice or review excerpt.

## Checks
- [ ] Grep the build for `Math.random`, hard-coded counts and per-visit timers: none in proof elements.
- [ ] Each getter returning null hides its element (test with an empty data file).
- [ ] Countdown target is a fixed timestamp; reload shows the same time left.
- [ ] Order pulse shows province only and at most once per visit.
- [ ] Reviews block hidden with 4 reviews, shown with 5.

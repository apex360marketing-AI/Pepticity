---
name: checkout-closers
description: Use when a PEPTICITY cart drawer, checkout or thank-you page must close the sale: the all-in price, the free-shipping line, quantity breaks (never goal bundles), the "join for 15%" line, share cart, guest checkout, the age and province gate and the thank-you page asks. Builds on offer-to-checkout (cards, drawer basics) and save-share-and-refer (share, account after). Every closer is real, legal and quiet.
---

# Checkout closers

Research: `docs/research/HOOKS-DEEP-DIVE.md` sec. 2 and hooks 7, 8, 9, 18. Surprise costs cause 39–48% of dropped carts, forced accounts 19–26%, complex checkout ~18% (Baymard via secondary).

## Rules
- **All-in price (H08):** the drawer shows subtotal, discount, shipping, tax estimate, total BEFORE checkout. The first price shown is payable apart from taxes (Competition Act drip pricing). No fee appears later.
- **Free-shipping line (H09):** thin chrome line in the drawer only: "$[X] TO FREE SHIPPING". Threshold `[placeholder]` until Grace sets a real, stable one. A/B test with a hold-out (one test: order size +9.2%, conversion −5.9%).
- **Quantity breaks, not goal bundles:** "3 OF THE SAME VIAL · SAVE [X]%". Never a "RECOVERY SET" or "ENERGY STACK": naming a set by goal pairs products with a claim. Price breaks are an offer, so they read `COUNSEL_CLEARED.offer`.
- **Never in the cart:** bacteriostatic water, syringes, "you may also need", dose tools. Adjacency builds "intended use" (FDA 2026-08-24 letters).
- **Join line:** not joined → "JOIN THE TEAM FOR 15% OFF THIS ORDER" (one field, unticked box). Joined → discount line "PEPTICITY TEAM · 15% OFF FIRST ORDER". Counsel switch off → hide both, show "CLAIM YOUR CARD".
- **Share cart (H18):** "COPY CART LINK", ids and quantities only.
- **Guest checkout (H07):** no account wall. Email, shipping, payment. Account offered on the thank-you page (password only).
- **Age and province gate (R121)** before payment: age of majority by province; served provinces only.
- **Marketing box** at checkout: separate, unticked, never bundled into "PLACE ORDER".
- **Trust lines:** only true ones (real payment provider badge, CAD prices, contact `[placeholder]`). Certificates and shipping times only when Grace confirms (R104, R055).
- **Never:** countdown timers, "X people have this in their cart", fake low stock, red, exclamation marks, "SALE!!!".
- Copy: PEPTICITY in capitals; CAPS headings; no "leads"; no invented numbers.

## Thank-you page asks (one screen, three quiet asks)
1. "SAVE YOUR DETAILS FOR NEXT TIME" (password only).
2. "TEXT ME SHIPPING UPDATES" (transactional) + separate unticked "and tell me about new lots" (marketing).
3. "SHARE PEPTICITY" (referral link; credit behind `COUNSEL_CLEARED.referral`).

## Examples
- GOOD drawer: "SUBTOTAL $270 · PEPTICITY TEAM 15% −$40.50 · SHIPPING $[X] · TAX EST. $[X] · TOTAL $[X]".
- GOOD: "$[X] TO FREE SHIPPING" with the chrome line two-thirds full.
- GOOD: "BPC-157 10 MG × 3 · SAVE [X]%" (switch on).
- BAD: "RECOVERY STACK: BPC-157 + TB-500 + BAC WATER" (goal + adjacency).
- BAD: "Only 2 left! Offer ends in 09:59" (fake urgency).
- BAD: shipping added on the payment step.

## Checks (Playwright, 1440 and 390)
- [ ] Drawer total equals checkout total; no new fee appears.
- [ ] Free-shipping line math is right at, below and above the threshold.
- [ ] No bac water, syringes or goal-named sets anywhere in cart or checkout.
- [ ] Switch off hides the 15% line, member price and quantity breaks.
- [ ] Guest path completes with no account; gate blocks under-age and unserved provinces.
- [ ] Every consent box unticked by default and logged; drawer keyboard-operable, Esc closes.

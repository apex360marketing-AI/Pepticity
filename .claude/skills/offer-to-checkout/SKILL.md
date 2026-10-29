---
name: offer-to-checkout
description: Use when a PEPTICITY page must let visitors actually BUY: product cards with add-to-cart, the cart drawer, member price, the grand-opening code applied, restock/waitlist when sold out, and trust signals that are true only. Use for the store path, product views, LAY-23 Mercury Vials, the cart, and any "it should sell" request. Product data comes from shared/inventory.js.
---

# Offer to checkout

## Product data
- Source: `shared/inventory.js` (28 records). Use name, price, quantity/size and stock status only.
- Visual: the photoreal PEPTICITY vial (Higgsfield or real photo, `photoreal-product-site`), no background, lit underneath, glows on hover. Never a hand-drawn three.js bottle.
- Items marked `[confirm]` by Grace (R118) show a "COMING SOON" state until confirmed.

## Product card
- Chamfered see-through glass (brand-lock), CAPS product name, size, price in CAD.
- Member price shown beside the regular price when the visitor has joined: "MEMBER $X" (counsel switch, see below).
- Primary button: "ADD TO CART" with TXT-09 sheen. One tap adds; the button morphs to "ADDED ✓" for 1.5 s and the cart count ticks up.
- No benefit lines, no goals, no doses, no "research use only" wording, no reconstitution tools.

## Cart drawer
- Slides in from the right (bottom sheet on phones); glass; focus is trapped inside while open; Esc closes.
- Lines: vial thumbnail, name, size, quantity stepper, line price, remove.
- Totals: subtotal, discount line, shipping, taxes estimate, total. The first price shown is the price payable apart from taxes (drip-pricing rule).
- One clear button: "CHECKOUT". Below it: "Continue shopping".

## Grand-opening code
- Joined visitors get the 15% first-order offer (R105) applied automatically as a discount line: "PEPTICITY TEAM · 15% OFF FIRST ORDER".
- Visitors who haven't joined see one quiet line in the drawer: "JOIN THE TEAM FOR 15% OFF THIS ORDER" with a one-field form (`capture-forms`).
- Gated by `COUNSEL_CLEARED.offer` (research H01 = STOP on discounts for unauthorized peptides). When false: hide the code and member price, show the letter/member card instead. Never fake a deadline or a timer.

## Sold out
- Card shows "SOLD OUT" (platinum chip, not red) and swaps the button for "TELL ME WHEN IT'S BACK" (email, optional SMS, separate unticked consents).
- "COMING BACK [date]" only when Grace has a real date (R-dashboard v3); auto-email the waitlist on arrival.
- Restock alerts also sit behind the counsel switch (research H05).

## Trust signals (true only)
- Allowed now: secure checkout badge from the real payment provider, clear returns/contact `[placeholder]`, CAD pricing, privacy pledge (if tags audited).
- Only when Grace confirms they are real: purity certificates, fast Canadian shipping, shipping times (R104, R055).
- Never: invented reviews, counts, "X sold today", fake low stock, "approved", clinician or pharmacy claims.
- Footer: "[Final legal copy to be approved by counsel.]" (R119). Age/province gate before checkout (R121).

## Checkout
- Until a real store backend is chosen (R058), checkout opens a preview screen: "Preview only: no order was placed." with the cart summary.
- Live: hand off to the chosen platform with the cart, the code and the hook id that brought the visitor.

## Checks (Playwright, desktop and phone)
- [ ] Add to cart from three products; drawer totals are correct.
- [ ] Code applies for a joined visitor and not for others; switch off hides it.
- [ ] Sold-out card shows the restock form and never an add button.
- [ ] No claims, doses, fake urgency or unconfirmed trust signals anywhere.
- [ ] Drawer is keyboard-operable; Esc closes; focus returns to the button.

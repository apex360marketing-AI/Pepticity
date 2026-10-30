---
name: save-share-and-refer
description: Use when PEPTICITY needs loops that bring visitors and their friends back: SAVE FOR LATER lists, SHARE THIS CART links, REFER WITH ACCESS MILESTONES, the MEMBER PROGRESS CARD (endowed progress), the shipping-updates opt-in on the thank-you page, and guest-checkout-then-account. Covers state, URLs, consent rules for referred friends, and counsel gating for any reward. Not for the cart drawer itself (offer-to-checkout).
---

# Save, share and refer

Research: `docs/research/HOOKS-DEEP-DIVE.md` ideas 5, 7, 17, 18, 19, 24. Endowed progress: pre-stamped cards were completed by 34% vs 19% (Nunes & Drèze 2006). Morning Brew's milestone referrals reportedly brought ~30% of new subscribers.

## SAVE FOR LATER
- A small chrome bookmark on each product card (`aria-pressed`). Works with no account: list kept in localStorage (try/catch).
- "SEND MY LIST TO MY PHONE" asks for email only then (transactional send). Marketing box separate and unticked.
- If a saved item sells out, the list shows the restock form inline.

## SHARE THIS CART
- In the cart drawer: "COPY CART LINK" → `/cart?i=sku:qty,...` (ids and quantities only, nothing personal).
- Uses `navigator.share` on phones, clipboard on desktop, with a quiet "LINK COPIED" state.
- Opening the link fills the cart and shows "A CART WAS SHARED WITH YOU" once.

## REFER WITH ACCESS MILESTONES
- "SHARE PEPTICITY": personal link `?ref=CODE` (random code, not the email).
- Milestones are access, not money, until `COUNSEL_CLEARED.referral` is true: 1 friend joins = early lot access; 3 = member-card upgrade (chrome finish); 5 = merch.
- CASL: the referrer never types a friend's email into our system to send them marketing. They share the link; the friend opts in themselves.
- Count a referral only when the friend confirms their email. Show progress on the member card.

## MEMBER PROGRESS CARD
- The member card shows 10 notches; joining lights 2 ("YOU'RE ALREADY 2 IN").
- Notches light for real actions only: confirm email, set preferences, first order, each confirmed referral.
- Full card = early access to new lots and a card finish. No points on price unless counsel clears it; no points on anything a province treats as pharmacy.
- Card state is server-side once they have joined (localStorage before), so it follows them across devices.

## GUEST CHECKOUT, ACCOUNT AFTER
- Checkout never requires an account (forced accounts cause 19–26% of abandonment, Baymard via secondary).
- Thank-you page: "SAVE YOUR DETAILS FOR NEXT TIME", password field only (email already known).

## SHIPPING UPDATES OPT-IN (thank-you page)
- "TEXT ME SHIPPING UPDATES" (transactional) and, separately, unticked "and tell me about new lots" (marketing, CASL record).
- Phone field with `inputmode="tel"` and `autocomplete="tel"`.

## Look
- Bookmark and share icons are real chrome (chrome-lift-icons), never emoji. CAPS labels, glass surfaces, no pills.

## Measure
- Events: `save_item`, `save_send`, `cart_share`, `cart_share_open`, `ref_share`, `ref_confirmed`, `card_notch:n`. Hook ids continue from H41.

## Checks
- [ ] Shared URLs hold no personal data.
- [ ] Referral rewards follow the counsel switch; no money or price rewards while it is off.
- [ ] Friend consent is their own; no "invite by email" form.
- [ ] Every opt-in has its own unticked box and is logged.

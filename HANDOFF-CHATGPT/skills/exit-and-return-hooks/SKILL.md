---
name: exit-and-return-hooks
description: Use when a PEPTICITY page needs to catch a visitor who is leaving, or welcome back one who returns: the quiet SAVE MY CART exit card (desktop exit intent and phone heuristics), the tab-title return cue, the WELCOME BACK state, and emailed cart links. Covers trigger code, frequency caps, consent split (transactional vs marketing) and saved-state handling. Placement density still follows hook-architecture.
---

# Exit and return hooks

Research: `docs/research/HOOKS-DEEP-DIVE.md` ideas 2, 6, 20. Generic exit-intent sign-ups barely beat no trigger (Popupsmart 2026: 1.10% vs 0.78%), but cart-abandonment pop-ups average ~17% (OptiMonk). So the exit hook is about **the cart**, and it only fires when there is one.

## SAVE MY CART (the only exit hook)
- Shows only when the cart has items and no email is known.
- Slim glass card, bottom-right (bottom sheet on phones): "WANT THIS CART EMAILED TO YOU?" one email field, "EMAIL MY CART".
- Below: unticked "Also send me new lots and GRACE'S LETTER" (marketing, separate). The cart email itself is transactional.
- Visitor with no cart and no email: no exit hook at all (hook-architecture caps still apply: once per session, 3 times ever).

## Desktop trigger (pattern from carlsednaoui/ouibounce, MIT)
```js
// arm after 8 s on page; fire when the pointer leaves through the top edge
document.documentElement.addEventListener('mouseleave', e => {
  if (e.clientY > 20) return;           // ouibounce default sensitivity
  exitTimer = setTimeout(fire, 250);    // short delay; cancelled on mouseenter
});
document.documentElement.addEventListener('mouseenter', () => clearTimeout(exitTimer));
```
- Store "seen" in localStorage with a count and date (try/catch), not a cookie, and respect the caps.

## Phone heuristics (no real exit intent on touch)
- Fast upward scroll of >30% of viewport height within 300 ms after the visitor has scrolled past 50% of the page.
- Or `visibilitychange` to hidden with a cart: do nothing then, but show the card on return (see below).
- Never hijack the back button (`history.pushState` traps are banned).

## TAB-TITLE RETURN CUE
- On `visibilitychange` → hidden, with a cart: `document.title = 'YOUR CART IS SAVED · PEPTICITY'`. On visible: restore the real title.
- Never "HURRY", emoji, flashing titles or favicon badges with fake counts.

## WELCOME BACK
- Saved locally: `{ name?, cartItems, lastVisit }` (try/catch; works without storage).
- Return within 30 days: the hero line reads "WELCOME BACK, [NAME]. YOUR CART IS WHERE YOU LEFT IT." with "OPEN MY CART". No name if they never gave one ("WELCOME BACK.").
- "Not you?" link clears local state. Privacy notice explains local storage (PIPEDA).
- A joined visitor never sees the join ask again; they see their next step (restock alerts, refer).

## Emailed cart link
- Link holds item ids and quantities only (`/cart?i=sku:qty,sku:qty`), no email or name in the URL.
- One email, sent immediately. A reminder email later only if marketing consent was ticked; respect CASL unsubscribe.

## Checks
- [ ] Exit card fires only with a cart, once per session, max 3 times ever.
- [ ] Phone trigger tested at 390×844; back button untouched.
- [ ] Title cue restores the real title on return.
- [ ] Welcome-back state renders with and without a name, and with storage blocked.
- [ ] Two separate consents; marketing box unticked by default.

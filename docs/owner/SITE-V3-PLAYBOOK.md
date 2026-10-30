# SITE V3 PLAYBOOK (owner, 30 Oct)

## Flow (top to bottom)
1. LOADER: chest film (white / black).
2. HERO LANDING: big, about 2–3 screens; public; no prices; mission and story; unique scroll effects; ask = Grace's letter.
3. 19+ GATE (Canada, province pick): at the bottom of the landing page, the threshold into the city. Product data loads only after it.
4. SALES ZONE 1 · CITY: about 25% shorter dive; see-through liquid-glass cards pop up: products, 15% join, phone opt-in.
5. DOORS: scanner plus doors into the lab.
6. SALES ZONE 2 · BIO LAB: "how it's made" stations; HOLOGRAM panels project from the dropper (and one more station) with hooks.
7. SECOND DOORS: cinematic transition into the product line (existing footage for now; a new film needs OK).
8. SALES ZONE 3 · PRODUCT LINE: full store, cart, filters, restock queue; concierge in SELLING mode.

## Hooks (email AND phone)
- Hero: letter (email).
- City: offer card, phone opt-in, product cards.
- Lab: hologram email, hologram SMS.
- Store: restock queue, cart save, guest checkout, referral.
- One cart-based exit card; sticky phone bar on phones; one ask every 1–1.5 screens; tagged data-hook; map in sites/main/v3/HOOK-MAP.md.

## Risk reducers (kept)
- No product names or prices in the page before the gate (not indexed).
- Northern Peptides references removed from public files.
- HGH / Melanotan II / bacteriostatic water hidden by flag.
- Bot says it's automated; 911 / 988 line.
- Single-purpose unticked consent; privacy and counsel placeholders.
- Fixed-date countdowns only.

## Products
- DONE: full inventory of northernpeptides.st in docs/inventory/ (CSV, XLSX, MD, JSON) with an AUDIT column.
  - 30 products, 37 sizes, $30–$275 CAD, all in stock, no price changes since 29 Oct.
  - One hidden but buyable listing found: SLU-PP-332 ($80, 10mg).
  - Every listing is flagged: 34 make health claims, 34 give dosing, 21 have copy mistakes (template text, copied descriptions, HGH 100iu vs 1000iu).
- Bottles: Grace picks a design in her Selection Studio. Then every product's bottle is made in that design (Higgsfield plus exact font). Until then the store uses the approved bottle.

## Skills used
- hook-architecture, capture-forms, scroll-reveal-hooks, exit-and-return-hooks, interest-entry-hooks, offer-to-checkout, checkout-closers, honest-urgency-and-social-proof
- pepticity-brand-lock, peptide-regulatory, verify-before-done
- NEW: hologram-panels

## Higgsfield (owner OK 30 Oct: "you have my okay on Higgsfield")
- Second doors film, lab → product line: 17.5 credits each, white + black = 35, plus 2 end stills at 2.75 each. IN PROGRESS (one white test first, then black).
- Optional: a product-line "gallery room" still for behind the second doors: about 0.25–0.5 credits each.
- Bottles for every product after Grace picks a design: about 0.25 per image; the count depends on the final product list.

## Order of work
1. v3 restructure (running): zones, gate, holograms, hooks, hook map.
2. Inventory pull plus claims flag (running).
3. Owner review of the v3 preview.
4. Grace picks a bottle design in the Selection Studio; we re-make all bottles; they go into the store.
5. Audit plus harden v3; publish to /site/ on GO.

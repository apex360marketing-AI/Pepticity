---
name: interest-entry-hooks
description: Use when a PEPTICITY page needs need-based entry cards (GYM AND PERFORMANCE, 55+ AND LONGEVITY, ENERGY, WEIGHT GOALS, RECOVERY, SKIN AND HAIR, SLEEP or a new interest) that open a product shelf and capture an email. Covers the compliant "researched in the context of" wording, which catalogue products may sit under each card, the one-field capture form with CASL consent, and the interest tag. Pairs with peptide-regulatory (limits), capture-forms (the form) and hook-architecture (placement).
---

# Interest entry hooks (H42)

The owner wants visitors met by need ("if they need energy… sell it to them for that… but for research"). The card sells the visitor's INTEREST and the shelf. It never says what a product does. Full mapping: `docs/owner/SALES-PLAYBOOK.md` section 3.

## Rules
- Card title = the visitor's interest, in CAPS: "ENERGY", "RECOVERY". Their words, not a product promise.
- One line under the title: "Compounds researched in the context of [research area]." Area = a biology field (cellular energy, ageing biology, connective-tissue biology, metabolism, body clock). Never a condition, symptom or result.
- Shelf under the card: product name, size, CAD price from `shared/catalogue.json`. Nothing else. Write-up stays behind a "WHAT IT IS" button with the one-line identity from `shared/inventory.js`.
- Banned on cards: treats, cures, fixes, boosts, heals, burns, builds, reverses, helps, supports, "for [condition]", pain, headaches, ED, libido, any dose or schedule, before/after, testimonials, studies or trial numbers.
- "Research use only" is not a shield (Health Canada; FDA letters of 2026-08-24). Never lean on it in copy.
- Never on any card: PT-141 (sexual function), Oxytocin, Semax, Selank (mood/brain: claim risk), Melanotan II (recommend delist), bacteriostatic water.
- WEIGHT GOALS: shelf behind `COUNSEL_CLEARED.offer` until counsel rules on Schedule A.1 (obesity) [VERIFY]. Card + capture may run alone.
- A card whose shelf is thin (SLEEP has only Epitalon) launches as card + capture ("SEND ME SLEEP NEWS").
- Brand rules: PEPTICITY in capitals; no "leads" in visitor copy; no invented counts ("1,200 people chose this").

## Capture form (inside the opened card)
- One field: email (`type="email"`, `autocomplete="email"`). Button: "SEND ME THE [AREA] SHELF".
- Unticked box: "Yes, PEPTICITY may email me the [area] shelf and occasional news. I can unsubscribe any time."
- Payload per `pepticity-lead-engine`, with `"hook":"H42"` and `"interest":"energy"`. The interest is a tag for Grace's platform only: never to analytics, ad pixels or URLs (PIPEDA: interest in weight or sleep can read as health data).
- Review builds: "Preview only: nothing was sent." Success state gives a next step: "OPEN THE SHELF" or "CLAIM YOUR CARD".

## Look and behaviour
- Seven chamfered see-through glass cards (brand-lock), real 3D chrome icon per card (chrome-lift-icons), lit-rim hover, TXT-09 sheen on the button. No pills, no emoji.
- Tap opens in place (no new page); keyboard: Enter opens, Esc closes, focus returns to the card.
- Placed after the lab, before the store (hook-architecture: ≥1 screen from the previous ask).

## Examples
- GOOD: "ENERGY. Compounds researched in the context of cellular energy (mitochondria)." Shelf: NAD+ 1000 MG $190 · MOTS-C 10 MG $75 · SS-31 10 MG $75 · 5-AMINO-1MQ 10 MG $100.
- GOOD: "55+ AND LONGEVITY. Compounds researched in the context of ageing biology."
- BAD: "ENERGY: boost your stamina with NAD+." (claim + product + goal)
- BAD: "RECOVERY: BPC-157 for joint pain, 250 mcg daily." (condition + dose)
- BAD: "Over 500 members picked this shelf." (invented stat)

## Checks
- [ ] Every card line uses "researched in the context of" + a biology area; banned-word scan is empty.
- [ ] Shelf products match the playbook map; excluded products are absent.
- [ ] Prices equal `shared/catalogue.json`.
- [ ] Consent box unticked by default and logged; interest tag absent from analytics calls (inspect network in Playwright).
- [ ] WEIGHT GOALS shelf hidden while the counsel switch is off.
- [ ] Desktop 1440 and phone 390 screenshots checked; keyboard path works.

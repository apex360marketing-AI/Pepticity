---
name: product-finder-quiz
description: Use when PEPTICITY needs a CATALOGUE FINDER (a 3-tap "find your product" flow for the store) that never asks about health, goals or symptoms: question design from shared/inventory.js fields, the result shortlist, the save-shortlist email step, zero-party preferences, progressive profiling across visits, and how to keep it compliant. Pairs with guided-quiz-funnel (the clinical-style quiz rules) and capture-forms (the email step).
---

# Product finder quiz (CATALOGUE FINDER)

Research: `docs/research/HOOKS-DEEP-DIVE.md` idea 3. Vendor data (Octane AI) claims 7–25% quiz conversion; quiz fatigue is real, so keep it to 3 taps and make it skippable.

## The compliance line (read first)
- The finder sorts the **catalogue**, not the visitor's body. It never asks about health, goals, symptoms, weight, age or conditions, and never maps an answer to a product "for" something.
- Allowed questions use only product facts in `shared/inventory.js`: category/class as named in the store, format and size, price band, in stock vs coming soon, "new to PEPTICITY" vs "reordering".
- Results show name, size, price and stock only (C.01.044 style: name, price, quantity). No benefit lines.
- Items marked `[confirm]` show COMING SOON.

## Flow (3 taps, then optional email)
1. "WHAT ARE YOU BROWSING?" → store categories (from inventory, 3–5 tiles).
2. "WHICH SIZE SUITS YOU?" → sizes available in that category.
3. "YOUR PRICE RANGE?" → 3 bands computed from real prices in the category.
4. Result: 2–3 product cards (offer-to-checkout card) + "SAVE THIS SHORTLIST" (one email field) + "ADD ALL TO CART".
- Progress shown as 3 chrome notches starting with the first lit on open (endowed progress).
- "SKIP TO THE STORE" on every step.

## Logic
```js
const pick = inventory
  .filter(p => p.category === a1 && p.size === a2 && inBand(p.price, a3))
  .sort((x, y) => (y.inStock - x.inStock) || x.price - y.price)
  .slice(0, 3);
// no match -> relax size, then band; never show an empty result
```
- Small and hand-rolled is fine. For a larger branching finder, surveyjs/survey-library (MIT) takes a JSON schema with `visibleIf` rules.
- Answers live in memory and localStorage (try/catch) so "BACK" and a return visit restore them.

## Zero-party data and progressive profiling
- Store answers with the lead as `prefs: { category, size, band }` (catalogue preferences, not health data).
- First capture asks email only. Next visit (WELCOME BACK) may ask province (for shipping). Later: SMS for restock, separately consented. One new question per visit, never two.
- Never send answers to ad pixels or analytics; events carry the step number only (`finder_step:2`).

## Look
- Full-width glass panel, one question per screen, big chamfered tiles with chrome edges, CAPS labels. Tiles respond on hover (sheen sweep) and keyboard (arrow keys, Enter).
- Transition between steps: slide + fade 320 ms; reduced motion = fade.

## Measure
- Hook id continues from H41. Events: `finder_open`, `finder_step:n`, `finder_result`, `finder_save`, `finder_add_all`. Track drop-off per step.

## Checks
- [ ] Grep the finder copy for health words (goal, feel, recovery, weight, sleep, energy, symptom): none.
- [ ] Every result comes from inventory; no empty result screen.
- [ ] Skip works on every step; back restores answers.
- [ ] Email step: one field, CASL box unticked, hook id attached.

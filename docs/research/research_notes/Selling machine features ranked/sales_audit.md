# Sales audit: Selling machine features ranked (2 Nov 2026)

Labels: **[E]** evidence from the report or repo. **[I]** my inference.

## 1. Trace the money (top 10)
- Assumed path: arrive → all-in price (#1) → free-ship bar (#2) → reviews (#3)/COA (#4) → guest checkout (#7) → **pays** → abandoners get #8/#9.
- **Break 1, arrival:** no row says where the visitor comes from. [E] Only acquisition rows are #21 Referrals (rank 21) and nothing else.
- **Break 2, payment:** #7 is "design now, wire later"; owner decision 3 has no processor. [E] Helcim "clearest no", Stripe restricted, Corepay "do not support RUO". No money can be received. [I]
- **Break 3, proof:** #3 needs delivered orders ("verified-order token after delivery"); #4 says "Only once COAs exist" and "lab testing cost not researched". Neither exists before sales. [E]
- **Pure cost until something else exists [I]:** #3 (needs orders), #4 (needs a lab COA; inventory.js has no lot field [E]), #6 (no traffic to measure), #7 (needs P), #8 (needs E + P), #9 ("E to send"), #10 (gated by counsel Q2). Only #1, #2, #5 can earn on day one, and only if a processor exists.

## 2. Executable by owner + AI builder?
- Code: yes (S/M, $0). [E]
- Blocked on assets Grace lacks [E unless noted]:
  - Processor (P): #7, #13, #24, #28–30.
  - ESP (E): #8, #12, #14, #15, #19, #23, #31; every named ESP refuses or restricts.
  - Real COAs: #4, #15 copy ("certificate attached").
  - Orders: #3. Traffic: #6, #25.
  - Counsel: Q1 "gates every feature".
- [I] The real blockers are counsel and vendors, which the builder can't unblock.

## 3. Reach: where traffic comes from
- [E] The plan never mentions traffic, SEO, ads or channels. [I] Google/Meta peptide ads need LegitScript, which "is only for approved drugs sold by licensed pharmacies or clinics" [E]. Paid search/social is closed.
- **Biggest omission [E, repo]:** Grace already runs **northernpeptides.st** (WooCommerce, 36 listings, 37 in stock, pulled 30 Oct; `docs/inventory/northernpeptides-full-2026-10-30.json`). It has a processor, customers and SEO history. The plan treats PEPTICITY as zero-start. Caveat [E]: AUDIT-COMPLIANCE asks whether it "taints" PEPTICITY; needs counsel, not silence.
- Missing acquisition, with dates [I]:
  - **By 9 Nov:** decide on migrating northernpeptides customers (consent re-permission email from the old store, under s.10(10) 2-year implied consent for buyers).
  - **By 16 Nov:** SEO journal on safe topics (storage of sealed vials, reading a COA, Canadian shipping, lot numbers). 8 posts by 31 Dec.
  - **By 23 Nov:** Reddit/Discord community presence (check vendor rules).
  - **By 30 Nov:** B2B/clinic and compounding-pharmacy partners (owner decision 2C is "the only card-compliant path found" [E], yet it carries no row).
  - **Dec:** affiliates/creators with a no-claims brief; referral (#21) moved up.

## 4. Commercial density (60-day view)
- [I] The order optimises conversion of traffic that doesn't exist. Opposite ranking for revenue in 60 days:
  1. Processor in writing (or Interac e-Transfer, decision 3B)
  2. Counsel Q1 on a short list of cleared SKUs
  3. Existing-customer migration
  4. All-in price + guest checkout on that rail
  5. One real COA
  6. Journal/SEO + community
  7. Referral
  8. Reviews (once orders flow)
  9. ESP flows
  10. Speed/analytics polish
- [I] #5 and #6 are hygiene (Deloitte figure is Google-funded [E]); they can't outrank getting paid.

## 5. Missing rows
- Payment rail itself (Interac e-Transfer, manual invoice) as a feature. [I]
- Existing-store migration / 301 redirects / list re-permission. [E repo, I]
- SEO journal + Product schema without claims. [I]
- Clinic/pharmacy partner channel (decision 2C). [E]
- Transactional order emails on a developer sender (#3 depends on "order-shipped message" [E], but no row builds it).
- Lab COA procurement with a cost line. [E: "not researched"]

## 6. Weakest 5 to cut or demote
- **#6 Analytics (rank 6):** keep it a 1-hour install, but take it out of the top 10. Replace with the **payment rail**.
- **#5 Page speed (rank 5):** fold into the build checklist. Replace with **existing-customer migration**.
- **#10 Quantity breaks:** "wait for counsel Q2" [E], so it has zero value now. Replace with the **SEO journal**.
- **#9 Exit card:** "No independent lift found" [E] and it needs E to send. Replace with **referral (#21)**, the only acquisition row.
- **#2 Free-shipping bar:** the report's own evidence is mixed ("cut purchase incidence" [E]). Demote to an A/B once traffic exists. Replace with **transactional order email**, which unlocks #3.

## 7. Five highest-leverage fixes
1. Add a **Gate zero row 0: "money received"** with a dated owner action (processor written approval or e-Transfer by 16 Nov). Rank everything with P below it.
2. Add an **Acquisition section** ranked by the same score, with northernpeptides migration, journal, community, clinic partners and referral.
3. **Re-score Fit** for "needs orders/COA/traffic": #3 and #4 should be Fit 1 until those inputs exist (now 3 implied).
4. Make the **ranking two-phase**: "first 60 days: get paid, get first 20 orders" and "after: optimise". Move #5, #6 and #13 to phase 2.
5. Give **COA a cost and a date**: one lab quote by 9 Nov. Without it, #4 and the trust strip are vapour.

## Checked / not checked
- Checked: full report; `shared/inventory.js` (no lot/stock fields); northernpeptides JSON summary; SALES-PLAYBOOK, AUDIT-COMPLIANCE.
- Not checked: northernpeptides' processor, orders, list or traffic; the five research notes in full; community rules; live web.

---
name: peptide-regulatory
description: Canada-first, then US, regulatory rules for selling, naming, pricing and talking about peptides at PEPTICITY — Food and Drug Regulations C.01.044 (Rx ads = name, price, quantity only), C.08.002 and Schedule A.1, Health Canada's 2024-2026 unauthorized-peptide advisories, seizures and the 2026 Canlab injunction, compounding rules and provincial colleges, Competition Act claims and drip pricing, CASL, PIPEDA and provincial health privacy, age of majority by province; FDA 503A/503B and the 2026 Category 2 and PCAC changes, the GLP-1 shortage end and 2025-2026 warning letters (incl. August 2026 "research use only" sellers), HGH law, FTC health-claim rules, and state AI health-chatbot laws (CA AB 489 and others). Includes a per-product status table, a wording checklist and a banned-phrase list. Use before ANY PEPTICITY page, product name, price, ad, email, bot answer, quiz result or checkout ships, and for every "is this legal / approved" question.
---

# PEPTIDE REGULATORY (PEPTICITY)

This is a risk scan built from research, **not legal advice**. It tells you where the lines sit and which questions a Canadian health-law lawyer must answer before launch. Read `pepticity/docs/research/quiz-and-guide-research.md` first; this skill extends it. Evidence marks follow `peptide-expert` (unmarked = seen in this session's search summaries; **[VERIFY]** = check first). Sources are numbered in `../peptide-expert/references/sources.md`.

Depth lives in:
- `references/canada.md`: every Canadian rule, with sources.
- `references/united-states.md`: FDA, FTC, HGH law, state AI and privacy laws.
- `references/product-status.md`: the per-product status table for all 28 products.
- `references/wording-rules.md`: the pre-publish checklist and the banned-phrase list.

## 1. THE TEN THINGS THAT DECIDE WHAT PEPTICITY CAN SHOW OR SAY
1. **Most of the catalogue is unauthorized in Canada, and Health Canada is enforcing.** The "Think twice before injecting peptides bought online" advisory (about April 2026) names BPC-157, CJC-1295, DSIP, Epitalon, GHK-Cu, HCG, Ipamorelin, KPV, Melanotan I and II, MOTS-c, NAD+, SS-31, TB-500 and Retatrutide, and says many others exist [S1]. The 2025 Canada Peptide seizure listed about 50 products including tirzepatide [S2]. In June 2026 a Québec court granted Health Canada a **permanent injunction** stopping Canlab Research from selling injectable peptides [S4]. Enforcement has moved from warnings to courts.
2. **"Research use only" protects nothing,** in either country [S1, S25]. FDA's 2026-08-24 letters to five research-peptide sellers built "intended human use" from dosing information, injection instructions, dose calculators and **bacteriostatic water sold alongside**; some letters treated the bac water itself as an unapproved drug [S25]. Grace's current store (northernpeptides.st) has the same pattern: research labels, bac water on the shelf, and "dosage" and "cycle" fields on product pages. **This is the single biggest risk in the project.**
3. **Canada C.01.044:** a consumer ad for a prescription drug may state only its name, price and quantity [S6]. So PEPTICITY sells **the clinician consult and the care service**, never the molecule. A product name never sits next to a goal, benefit or condition.
4. **Canada C.08.002 [VERIFY wording with counsel]:** a "new drug" without a Notice of Compliance may not be sold **or advertised**. For unauthorized peptides, even a neutral name-and-price list is an advertising question, not just a sales question. Hence the default `names:false` switch in `pep-brain.js`.
5. **Schedule A.1 / s.3:** no advertising to the public of a drug as a treatment, prevention or cure for listed diseases. Obesity was on the 2008-2019 list; it was not seen in the 2019-2024 excerpt, and the list changed again on 2024-10-30 [S10]. **[VERIFY the current list]** before "weight" appears near any product.
6. **Compounding is not a loophole.** Health Canada says compounding "must not be used to circumvent" drug review, treats non-patient-specific production as manufacturing (POL-0051), and said in June 2025 that compounding injectable GLP-1s without a shortage "is not permitted" [S19, S20]. Canada has authorized generic semaglutide since April-June 2026, so an approved option exists [S13, S14].
7. **US: approved does not transfer.** FDA's 2025-2026 warning-letter waves (about 80 in Sept 2025, 30 in March 2026, 25 in June 2026) punished "same active ingredient as", "clinically studied/proven", "FDA-approved pharmacy" and branding that hides who compounds [S23, S24]. The tirzepatide and semaglutide shortages are over (Dec 2024 / Feb 2025) [S21].
8. **US peptide compounding is in flux, not open.** Twelve peptides left Category 2 in April 2026; the July 2026 PCAC recommended BPC-157, KPV, TB-500, MOTS-c, Epitalon and Semax for the 503A bulks list (DSIP rejected), against FDA staff advice. **No FDA final decision yet**, and removal from Category 2 does not by itself make compounding lawful [S36, S37]. CJC-1295 and ipamorelin are still Category 2 per most trackers [S32].
9. **HGH is a federal crime risk in the US** for any use other than an authorized indication on a physician's order (21 U.S.C. § 333(e); anti-aging and bodybuilding expressly not authorized) [S45].
10. **The bot can never look or sound like a clinician** (California AB 489, in force 2026-01-01, enforced by licensing boards) [S58], and all benefit claims need competent human evidence before the claim (FTC; Competition Act s.74.01(1)(b)) [S15, S60]. Nothing in this catalogue except the approved-brand indications clears that bar.

## 2. THE CEILING (state it as a rule, not a vibe)
**Canada, public pages, bot, ads, email, social:**
- PEPTICITY may describe **its service**: the consult, who the clinicians are and where licensed, the partner pharmacy, the process, timelines, privacy, price (all-in), cancellation and refunds, testing documentation process.
- For an **authorized** prescription drug: name, price and quantity only, on a neutral list, never paired with a goal, condition or benefit.
- For an **unauthorized** drug: **nothing public** (no name, no price, no card) until counsel clears it. Inside a consult, the clinician decides.
- What a product **is** (identity, approval status) may appear in the bot only when counsel turns names on.
- No benefit, outcome or "may help" language for any product, ever.

**US (if served at all):** the same ceiling, plus FDA misbranding and intended-use rules, FTC substantiation, state telehealth licensure and AI laws. Recommendation: geo-limit booking to served Canadian provinces until counsel says otherwise.

## 3. PER-PRODUCT STATUS (summary; full table in `references/product-status.md`)
| Status group | Products | Public visibility (until counsel rules) |
|---|---|---|
| Approved brand exists; research/compounded copy is not it | Tirzepatide, Tesamorelin, PT-141, Oxytocin, HGH, SS-31 | Hidden. If ever shown: name, price, quantity only, no goal; never "same as" |
| Approved abroad only | Thymosin Alpha-1, Semax, Selank | Hidden |
| Investigational | Retatrutide | Hidden; recommend delist |
| Unauthorized, named in HC advisories | BPC-157, TB-500, KPV, CJC-1295, Ipamorelin, Epitalon, MOTS-c, NAD+, GHK-Cu (injectable), Melanotan II, SS-31, Retatrutide (+ blends KLOW, Wolverine, GLOW) | Hidden; Melanotan II recommend delist |
| Unauthorized, not seen in the 2026 list | AOD-9604, 5-Amino-1MQ, IGF-1 LR3, Glutathione (injectable) | Hidden |
| Cosmetic route possible | GHK-Cu (topical cosmetic only) | Shop lane with appearance-only claims [VERIFY cosmetic rules] |
| Supply | Bacteriostatic water | Never sold on a shelf beside peptides |

## 4. HOW TO RUN A COMPLIANCE PASS
1. Identify the **audience and jurisdiction** (province, US state, minors possible?).
2. List every product named, implied or pictured. Check each against `references/product-status.md`.
3. Scan the copy with `references/wording-rules.md` (checklist, then banned phrases). Also scan images, alt text, URLs, file names, meta descriptions, product slugs, schema markup and email subject lines; a slug like `/bpc-157-healing` is a claim.
4. Check **adjacency**: is anything sold or linked beside a product that implies use (diluent, syringes, "kits", calculators, guides)? Adjacency alone can establish intended use [S25].
5. Check **price**: all-in, no mandatory fee added later (drip pricing) [S16, S17]; auto-renewal shown beside the button; what isn't charged if the clinician declines.
6. Check **consent**: separate unticked boxes (CASL); express consent for health answers (PIPEDA); no quiz answers to ad pixels [S63, S64].
7. Check **the bot**: name "PEPTICITY GUIDE", no clinician styling (AB 489), emergency check first, no dosing.
8. For each hit: quote the phrase, say where it sits and what it establishes, and **write the replacement line** (use `peptide-copy-and-guide`).
9. State the ceiling, the safe factual layer, and the counsel question.
10. Screenshot and date-stamp the published state.

## 5. COUNSEL QUESTIONS THAT GATE LAUNCH
1. **Catalogue (blocking):** can PEPTICITY offer, name or price any Health Canada-unauthorized peptide to Canadians, even via clinician prescription and pharmacy compounding? (C.08.002, POL-0051, provincial college positions, the Canlab injunction.)
2. **Grace's existing research store:** what must change or close, and on what timeline, given the August 2026 FDA letters and Health Canada's injunction? Does running it alongside PEPTICITY taint PEPTICITY?
3. **Result page:** does a goal question followed by a named Rx product's name, price and quantity become an indication claim (C.01.044, Schedule A.1)? Is obesity on the current Schedule A.1?
4. **Compounded tirzepatide in Canada:** is there any lawful route while Mounjaro is supplied and no shortage exists?
5. **US exposure:** serve US visitors or geo-block? If served: state telehealth licensure, 503A status per peptide, HGH, AB 489 and state health-privacy laws.
6. **Privacy:** express-consent wording, Québec Law 25 duties, PHIPA (or provincial equivalent) where the clinician side is a custodian, and data flows to the pharmacy.
7. **Cosmetic topicals:** which claims are cosmetic vs drug for a GHK-Cu skincare product in Canada.

## 6. KEEPING THIS CURRENT
- Re-check Health Canada's recalls database, FDA's 503A categories page, FDA warning letters, and the PCAC calendar (next peptide meeting due by February 2027) every 90 days, and before any launch.
- When a status changes: update `references/product-status.md`, the matching monograph in `peptide-expert`, `pepticity/shared/inventory.js` (`status` field), and add the source to `sources.md`, in one commit.
- If a fact cannot be confirmed, mark it **[VERIFY]**. Never fill a gap with a guess.

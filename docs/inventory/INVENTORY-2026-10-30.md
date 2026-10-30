# NORTHERNPEPTIDES.ST: FULL INVENTORY (2026-10-30)

- Source: https://northernpeptides.st, public WooCommerce Store API (read only; nothing on the site was changed). Pulled 2026-10-30T08:37:37Z.
- 37 size options (listings) across 30 products (29 peptides/compounds + bacteriostatic water). Every listing is a "simple" product: each size is its own listing.
- Includes 1 listing hidden from the shop (SLU-PP-332): published, in stock and buyable at its URL, but not in the shop list or the Store API list.
- Prices in CAD: $30.00 to $275.00 (peptides $50.00 to $275.00). Nothing on sale. All 37 listings in stock (the store does not publish quantities).
- Files: `northernpeptides-full-2026-10-30.json` (raw + normalised), `INVENTORY-2026-10-30.csv`, `INVENTORY-2026-10-30.xlsx` (same columns, with the AUDIT column).

## CHANGES SINCE 29 OCT

- In today's inventory but not in the 29 Oct file: **Slu-pp-332** (id 10132). Not new: published and last modified 2026-07-07T11:01:59. Hidden from the catalogue list, so the 29 Oct list-endpoint pull could not see it. Found today through /wp/v2/product.
- All 36 listings from 29 Oct are still live with the same name, slug, SKU, price, stock, categories, images and descriptions. No price changes. Nothing removed.

## PRODUCT TABLE

| # | Product | Sizes | Price (CAD) | Stock | Categories |
|---|---|---|---|---|---|
| 1 | 5-Amino 1MQ | 10mg | $100.00 | In stock | Healing & Repair, Metabolic |
| 2 | AOD-9604 | 5mg | $65.00 | In stock | Metabolic |
| 3 | BPC + TB + GHK-Cu (GLOW) | 70mg | $150.00 | In stock | Healing & Repair, Skin & Beauty |
| 4 | BPC 157 | 10mg | $80.00 | In stock | Growth & Recovery |
| 5 | CJC-1295 w/o DAC | 10mg | $100.00 | In stock | Growth & Recovery |
| 6 | CJC-1295 with DAC | 5mg | $100.00 | In stock | Performance |
| 7 | Epitalon | 10mg / 50mg | $60.00 / $200.00 | In stock | Cognitive & Neuro, Longevity & Anti-aging |
| 8 | GHK-Cu | 50mg / 100mg | $50.00 / $100.00 | In stock | Skin & Beauty |
| 9 | Glutathione | 1500mg | $85.00 | In stock | Healing & Repair, Longevity & Anti-aging, Skin & Beauty, Wellness |
| 10 | HGH | 100iu | $200.00 | In stock | Growth & Recovery, Performance |
| 11 | IGF-1 LR3 | [not stated] | $110.00 | In stock | Growth & Recovery, Metabolic |
| 12 | Ipamorelin | 10mg | $110.00 | In stock | Metabolic, Performance |
| 13 | Klow | 80mg | $170.00 | In stock | Metabolic |
| 14 | KPV | 10mg | $90.00 | In stock | Healing & Repair, Wellness |
| 15 | Melanotan II | 10mg | $50.00 | In stock | Metabolic, Skin & Beauty |
| 16 | MOTS-C | 10mg / 40mg | $75.00 / $125.00 | In stock | Healing & Repair, Longevity & Anti-aging, Metabolic, Skin & Beauty, Wellness |
| 17 | NAD+ | 1000mg | $190.00 | In stock | Cognitive & Neuro, Healing & Repair, Wellness |
| 18 | Oxytocin | 2mg | $80.00 | In stock | Cognitive & Neuro |
| 19 | Pfizer Bacteriostatic Water | 30ml | $30.00 | In stock | Ancillaries |
| 20 | PT-141 | 10mg | $50.00 | In stock | Performance, Wellness |
| 21 | Retatrutide | 10mg / 15mg / 20mg | $135.00 / $165.00 / $190.00 | In stock | Metabolic, Wellness |
| 22 | Selank | 10mg | $75.00 | In stock | Cognitive & Neuro |
| 23 | Semax | 10mg | $75.00 | In stock | Cognitive & Neuro |
| 24 | Slu-pp-332 (hidden listing) | 10mg | $80.00 | In stock | Metabolic |
| 25 | SS-31 | 10mg | $75.00 | In stock | Cognitive & Neuro, Longevity & Anti-aging |
| 26 | Tb-500 | 10mg | $90.00 | In stock | Healing & Repair |
| 27 | Tesamorelin | 10mg | $160.00 | In stock | Metabolic |
| 28 | Thymosin-Alpha 1 | 10mg | $90.00 | In stock | Growth & Recovery |
| 29 | Tirzepatide | 15mg / 30mg | $150.00 / $275.00 | In stock | Metabolic |
| 30 | Wolverine | 10mg / 20mg | $100.00 / $195.00 | In stock | Healing & Repair, Performance |

## AUDIT SUMMARY (FIRST PASS, NOTHING REWRITTEN)

Checked against `.claude/skills/peptide-regulatory/references/wording-rules.md` (section B). Risk scan, not legal advice.

- Listings flagged: 37 of 37.
- Health or effect claims (outcome language): 34 (all except Klow (80mg), Pfizer Bacteriostatic Water 30ml, Oxytocin).
- Dosing amounts ("Dosage: ..."): 34, plus 1 with an empty "Dosage:" field (Klow (80mg)).
- Cycle lines ("Cycle Length: ..."): 35.
- Human-use cues (timing, route, "men and women"): 10.
- "FOR RESEARCH PURPOSES ONLY" disclaimer: 37. Beside dosing it is evidence of intended human use, not a shield.
- Outside the descriptions: bacteriostatic water sold on the same shelf; "Wolverine" and "GLOW" names; goal categories (Healing & Repair, Performance, Longevity & Anti-aging, Skin & Beauty, Metabolic, Cognitive & Neuro, Growth & Recovery, Wellness) whose slugs also carry claims; the claim and dosing text is repeated in each page's meta description and Product schema.

## COPY AND DATA ISSUES

- **AOD-9604**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **BPC 157**: Short-description tagline is identical to a different product: Slu-pp-332, Tb-500 10mg, Thymosin-Alpha 1 10mg (copy-paste).
- **CJC-1295 w/o DAC**: Tagline calls it a "combo" but the listing is a single peptide.
- **GHK-Cu (50mg)**: Short-description tagline is identical to a different product: Ipamorelin (copy-paste). Short and long descriptions disagree. Short: "Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects" / Long: "Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints"
- **HGH (100iu)**: Size: name says 100iu, description says 1000iu.
- **IGF-1 LR3**: Size: no size stated in name or description.
- **Ipamorelin**: Short-description tagline is identical to a different product: GHK-Cu (50mg) (copy-paste).
- **Klow (80mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API. No tagline in the short description.
- **Melanotan II**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **NAD+**: Dosage line has no unit.
- **Oxytocin**: Long description is just the word "Description". No tagline in the short description.
- **Pfizer Bacteriostatic Water 30ml**: No long description.
- **Retatrutide (10mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **Retatrutide (15mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **Retatrutide (20mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **Slu-pp-332**: No long description. Short-description tagline is identical to a different product: BPC 157, Tb-500 10mg, Thymosin-Alpha 1 10mg (copy-paste). Hidden from the shop and category listings (and from the Store API list) but published, in stock and buyable at its URL.
- **Tb-500 10mg**: No long description. Short-description tagline is identical to a different product: BPC 157, Slu-pp-332, Thymosin-Alpha 1 10mg (copy-paste).
- **Thymosin-Alpha 1 10mg**: No long description. Short-description tagline is identical to a different product: BPC 157, Slu-pp-332, Tb-500 10mg (copy-paste).
- **Tirzepatide (15mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **Tirzepatide (30mg)**: Long description is theme placeholder text (a soap ingredient list + "Lorem ipsum"). Not shown on the product page, but public through the Store API.
- **Wolverine (10mg)**: Has a "Size" attribute listing 10mg, 20mg but is a simple product (one size only; the other size is a separate listing).
- No SKU on 33 of 37 listings (SKUs only on: Klow (80mg) `0077-78`, Retatrutide (10mg) `0077`, Melanotan II `003`, Retatrutide (15mg) `002`).

## DESCRIPTIONS (AS PUBLISHED, HTML STRIPPED)

### 5-AMINO 1MQ

**5-Amino 1MQ** | 10mg | $100.00 | In stock | SKU none | [https://northernpeptides.st/product/5-amino-1mq/](https://northernpeptides.st/product/5-amino-1mq/)

- Categories: Healing & Repair, Metabolic, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/6BC8DF15-3AA6-49EB-996D-3A88F6F562C4.png
- Status (skill table): Unauthorized (not a peptide). PEPTICITY: hidden.

Short description (what shoppers see):

```text
Metabolic activator & fat burner; inhibits NNMT, burns white fat, and increases cellular energy while preserving muscle

10mg

Dosage: 1-5mg a day

Cycle Length: 4-8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Metabolic activator & fat burner; inhibits NNMT, burns white fat, and increases cellular energy while preserving muscle
```

Audit:

- CLAIM (short+long): "Metabolic activator & fat burner; inhibits NNMT, burns white fat, and increases cellular energy while preserving muscle" [activator, fat burner, burns, white fat, increases, energy, preserving]
- DOSING: "Dosage: 1-5mg a day"
- CYCLE: "Cycle Length: 4-8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Healing & Repair, Metabolic (product placed beside a goal/benefit)

### AOD-9604

**AOD-9604** | 5mg | $65.00 | In stock | SKU none | [https://northernpeptides.st/product/aod-9604/](https://northernpeptides.st/product/aod-9604/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/6A8F88B4-D0EC-477A-AB33-610DDE43395D.png
- Status (skill table): Unauthorized. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Enhances metabolism, promotes fat loss, and helps preserve lean muscle without affecting blood sugar or growth hormone levels.

5mg

Dosage: 300–600mcg AM (fasted)

Cycle Length: 8-12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Enhances metabolism, promotes fat loss, and helps preserve lean muscle without affecting blood sugar or growth hormone levels." [Enhances, metabolism, promotes, fat loss, helps, preserve, lean muscle, without affecting blood sugar]
- DOSING: "Dosage: 300–600mcg AM (fasted)"
- CYCLE: "Cycle Length: 8-12 weeks"
- HUMAN-USE CUE: "fasted" (fasted timing); "AM" (time-of-day timing)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

### BPC + TB + GHK-CU (GLOW)

**BPC + TB + GHK-Cu (GLOW)** | 70mg | $150.00 | In stock | SKU none | [https://northernpeptides.st/product/bpc-tb-ghk-cu-glow/](https://northernpeptides.st/product/bpc-tb-ghk-cu-glow/)

- Categories: Healing & Repair, Peptides, Skin & Beauty
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/6E931ABC-186C-4934-9B34-526FBD610B97.png
- Status (skill table): Unauthorized blend. "GLOW" name is itself a claim. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Regenerative blend; enhances collagen production and tissue healing, anti-inflammatory, promotes healthier skin, joints & recovery.

70mg

Dosage: 2-4mg daily

Cycle Length: 6–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Regenerative blend; enhances collagen production and tissue healing, anti-inflammatory, promotes healthier skin, joints & recovery
```

Audit:

- CLAIM (short+long): "Regenerative blend; enhances collagen production and tissue healing, anti-inflammatory, promotes healthier skin, joints & recovery." [Regenerative, enhances, collagen, healing, anti-inflammatory, promotes, healthier, skin, joints, recovery]
- DOSING: "Dosage: 2-4mg daily"
- CYCLE: "Cycle Length: 6–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- NAME IS A CLAIM: "GLOW" (wording-rules B.7)
- GOAL CATEGORIES: listed under Healing & Repair, Skin & Beauty (product placed beside a goal/benefit)

### BPC 157

**BPC 157** | 10mg | $80.00 | In stock | SKU none | [https://northernpeptides.st/product/bpc-157/](https://northernpeptides.st/product/bpc-157/)

- Categories: Growth & Recovery, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/22FE6609-3C0D-42DA-A015-DD4E96162824.png
- Status (skill table): Unauthorized. HC 2026 advisory + seizure list. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain

10mg

Dosage: 250–500mcg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain
```

Audit:

- CLAIM (short+long): "Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain" [Accelerates, tendon, ligament, muscle repair, reducing, inflammation, joint pain]
- DOSING: "Dosage: 250–500mcg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Growth & Recovery (product placed beside a goal/benefit)

### CJC-1295 W/O DAC

**CJC-1295 w/o DAC** | 10mg | $100.00 | In stock | SKU none | [https://northernpeptides.st/product/cjc-1295-no-dac/](https://northernpeptides.st/product/cjc-1295-no-dac/)

- Categories: Growth & Recovery, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/cjc-nodac10.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Synergistic growth hormone–releasing combo; promotes fat loss, muscle growth, better sleep, and recovery

10mg

Dosage: 200-800mcg 1-2x daily

Cycle Length: 8–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Synergistic growth hormone–releasing combo; promotes fat loss, muscle growth, better sleep, and recovery
```

Audit:

- CLAIM (short+long): "Synergistic growth hormone–releasing combo; promotes fat loss, muscle growth, better sleep, and recovery" [Synergistic, promotes, fat loss, muscle growth, sleep, recovery]
- DOSING: "Dosage: 200-800mcg 1-2x daily"
- CYCLE: "Cycle Length: 8–12 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Growth & Recovery (product placed beside a goal/benefit)

### CJC-1295 WITH DAC

**CJC-1295 with DAC** | 5mg | $100.00 | In stock | SKU none | [https://northernpeptides.st/product/cjc-1295-with-dac/](https://northernpeptides.st/product/cjc-1295-with-dac/)

- Categories: Peptides, Performance
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/cjc5.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Long-acting GH releasing peptide; enhances recovery, fat loss, and muscle growth by boosting natural GH production.

5mg

Dosage: 1-2mg once weekly

Cycle Length: 12-16 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Long-acting GH releasing peptide; enhances recovery, fat loss, and muscle growth by boosting natural GH production.
```

Audit:

- CLAIM (short+long): "Long-acting GH releasing peptide; enhances recovery, fat loss, and muscle growth by boosting natural GH production." [enhances, recovery, fat loss, muscle growth, boosting]
- DOSING: "Dosage: 1-2mg once weekly"
- CYCLE: "Cycle Length: 12-16 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Performance (product placed beside a goal/benefit)

### EPITALON

**Epitalon (10mg)** | 10mg | $60.00 | In stock | SKU none | [https://northernpeptides.st/product/epitalon-10mg/](https://northernpeptides.st/product/epitalon-10mg/)

- Categories: Cognitive & Neuro, Longevity & Anti-aging, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/0B0ACBC7-2651-43B1-BA03-A7BB402A5DD3.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity.

10mg

Dosage: 5–10 mg nightly

Cycle Length: 10–20 days

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity
```

Audit:

- CLAIM (short+long): "Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity." [Anti-aging, promotes, repair, supports, telomere, improves, sleep, boosts, longevity]
- DOSING: "Dosage: 5–10 mg nightly"
- CYCLE: "Cycle Length: 10–20 days"
- HUMAN-USE CUE: "nightly" (nightly timing)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Cognitive & Neuro, Longevity & Anti-aging (product placed beside a goal/benefit)

**Epitalon (50mg)** | 50mg | $200.00 | In stock | SKU none | [https://northernpeptides.st/product/epitalon-50/](https://northernpeptides.st/product/epitalon-50/)

- Categories: Longevity & Anti-aging, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/epitalon50.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity.

50mg

Dosage: 5–10 mg nightly

Cycle Length: 10–20 days

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity
```

Audit:

- CLAIM (short+long): "Anti-aging peptide that promotes cellular repair, supports telomere health, improves sleep, and boosts longevity." [Anti-aging, promotes, repair, supports, telomere, improves, sleep, boosts, longevity]
- DOSING: "Dosage: 5–10 mg nightly"
- CYCLE: "Cycle Length: 10–20 days"
- HUMAN-USE CUE: "nightly" (nightly timing)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Longevity & Anti-aging (product placed beside a goal/benefit)

### GHK-CU

**GHK-Cu (50mg)** | 50mg | $50.00 | In stock | SKU none | [https://northernpeptides.st/product/ghk-cu-50mg/](https://northernpeptides.st/product/ghk-cu-50mg/)

- Categories: Peptides, Skin & Beauty
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/532006E4-5D84-4090-A3A3-FBD686B1EEE4.png
- Status (skill table): Injectable unauthorized (HC 2026 advisory); topical cosmetic route possible [VERIFY]. PEPTICITY: injectable hidden.

Short description (what shoppers see):

```text
Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects

50mg

Dosage: 1-2mg a day

Cycle Length: 6–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints
```

Audit:

- CLAIM (short): "Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects" [supports, muscle gain, fat loss, sleep, recovery, with minimal side effects]
- CLAIM (long): "Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints" [promotes, collagen, repair, reduces, inflammation, healthier, skin, joints]
- DOSING: "Dosage: 1-2mg a day"
- CYCLE: "Cycle Length: 6–12 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Skin & Beauty (product placed beside a goal/benefit)

**GHK-Cu (100mg)** | 100mg | $100.00 | In stock | SKU none | [https://northernpeptides.st/product/ghk-cu-100mg/](https://northernpeptides.st/product/ghk-cu-100mg/)

- Categories: Peptides, Skin & Beauty
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/ghk100.png
- Status (skill table): Injectable unauthorized (HC 2026 advisory); topical cosmetic route possible [VERIFY]. PEPTICITY: injectable hidden.

Short description (what shoppers see):

```text
Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints

100mg

Dosage: 1-2mg a day

Cycle Length: 6–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints
```

Audit:

- CLAIM (short+long): "Copper peptide that promotes collagen production, tissue repair, and reduces inflammation for healthier skin and joints" [promotes, collagen, repair, reduces, inflammation, healthier, skin, joints]
- DOSING: "Dosage: 1-2mg a day"
- CYCLE: "Cycle Length: 6–12 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Skin & Beauty (product placed beside a goal/benefit)

### GLUTATHIONE

**Glutathione** | 1500mg | $85.00 | In stock | SKU none | [https://northernpeptides.st/product/glutathione/](https://northernpeptides.st/product/glutathione/)

- Categories: Healing & Repair, Longevity & Anti-aging, Peptides, Skin & Beauty, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/F72B3D86-075C-4B5D-8160-0939146EA0BF.png
- Status (skill table): Unauthorized injectable. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Master antioxidant; detoxification, immune support, protects liver & cells.

1500mg

Dosage: 200-500mg 2-3x a week

Cycle Length: 8–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Master antioxidant; detoxification, immune support, protects liver & cells.
```

Audit:

- CLAIM (short+long): "Master antioxidant; detoxification, immune support, protects liver & cells." [antioxidant, detoxification, immune, support, protects, liver]
- DOSING: "Dosage: 200-500mg 2-3x a week"
- CYCLE: "Cycle Length: 8–12 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Healing & Repair, Longevity & Anti-aging, Skin & Beauty, Wellness (product placed beside a goal/benefit)

### HGH

**HGH (100iu)** | 100iu | $200.00 | In stock | SKU none | [https://northernpeptides.st/product/hgh-100iu/](https://northernpeptides.st/product/hgh-100iu/)

- Categories: Growth & Recovery, Peptides, Performance
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/hgh100.png
- Status (skill table): Research vial is not an authorized somatropin; US 21 USC 333(e) felony risk. PEPTICITY: hidden; recommend delist.

Short description (what shoppers see):

```text
Human growth hormone that promotes muscle growth, recovery, cellular repair, and improved sleep.

1000iu

Dosage: 2-6 iu daily (AM or PM)

Cycle Length: 3–6 months

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Human growth hormone that promotes muscle growth, recovery, cellular repair, and improved sleep
```

Audit:

- CLAIM (short+long): "Human growth hormone that promotes muscle growth, recovery, cellular repair, and improved sleep." [promotes, muscle growth, recovery, repair, improved, sleep]
- DOSING: "Dosage: 2-6 iu daily (AM or PM)"
- CYCLE: "Cycle Length: 3–6 months"
- HUMAN-USE CUE: "(AM or PM)" (time-of-day timing)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Growth & Recovery, Performance (product placed beside a goal/benefit)

### IGF-1 LR3

**IGF-1 LR3** | [not stated] | $110.00 | In stock | SKU none | [https://northernpeptides.st/product/igf-1-lr3/](https://northernpeptides.st/product/igf-1-lr3/)

- Categories: Peptides, Growth & Recovery, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/3468C3C2-50FF-4E92-A4AC-8310981E0588.png
- Status (skill table): Unauthorized. PEPTICITY: hidden.

Short description (what shoppers see):

```text
An anabolic growth factor that enhances cell regeneration, muscle growth, and tissue repair for faster recovery.

Dosage: 20-80mcg pre or post workout

Cycle Length: 4–6 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
An anabolic growth factor that enhances cell regeneration, muscle growth, and tissue repair for faster recovery
```

Audit:

- CLAIM (short+long): "An anabolic growth factor that enhances cell regeneration, muscle growth, and tissue repair for faster recovery." [anabolic, enhances, regeneration, muscle growth, repair, recovery]
- DOSING: "Dosage: 20-80mcg pre or post workout"
- CYCLE: "Cycle Length: 4–6 weeks"
- HUMAN-USE CUE: "pre or post workout" (timed to workouts)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Growth & Recovery, Metabolic (product placed beside a goal/benefit)

### IPAMORELIN

**Ipamorelin** | 10mg | $110.00 | In stock | SKU none | [https://northernpeptides.st/product/ipamorelin/](https://northernpeptides.st/product/ipamorelin/)

- Categories: Metabolic, Peptides, Performance
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/ipamor10.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects

10mg

Dosage: 100-300mcg before bed

Cycle Length: 8–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects
```

Audit:

- CLAIM (short+long): "Growth hormone–releasing peptide; supports muscle gain, fat loss, better sleep, and recovery with minimal side effects" [supports, muscle gain, fat loss, sleep, recovery, with minimal side effects]
- DOSING: "Dosage: 100-300mcg before bed"
- CYCLE: "Cycle Length: 8–12 weeks"
- HUMAN-USE CUE: "before bed" (timed to bedtime)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic, Performance (product placed beside a goal/benefit)

### KLOW

**Klow (80mg)** | 80mg | $170.00 | In stock | SKU 0077-78 | [https://northernpeptides.st/product/klow-80mg/](https://northernpeptides.st/product/klow-80mg/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/07/Klow-80mg.jpg
- Status (skill table): Unauthorized blend (parts named in HC advisory). Contents not stated. PEPTICITY: hidden.

Short description (what shoppers see):

```text
80mg

Dosage:

Cycle Length:

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- DOSING FIELD (empty): "Dosage:" template field present
- CYCLE FIELD (empty): "Cycle Length:" template field present
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" (banned phrase; protects nothing)
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

### KPV

**KPV** | 10mg | $90.00 | In stock | SKU none | [https://northernpeptides.st/product/kpv/](https://northernpeptides.st/product/kpv/)

- Categories: Peptides, Healing & Repair, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/144675AC-32E5-477C-846E-74E964230E09.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Anti-inflammatory tripeptide; reduces joint and gut inflammation, supports healing, and calms immune overactivity.

Size: 10mg

Dosage: 250-500 mcg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Anti-inflammatory tripeptide; reduces joint and gut inflammation, supports healing, and calms immune overactivity
```

Audit:

- CLAIM (short+long): "Anti-inflammatory tripeptide; reduces joint and gut inflammation, supports healing, and calms immune overactivity." [Anti-inflammatory, reduces, joint, gut, inflammation, supports, healing, calms, immune]
- DOSING: "Dosage: 250-500 mcg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Healing & Repair, Wellness (product placed beside a goal/benefit)

### MELANOTAN II

**Melanotan II** | 10mg | $50.00 | In stock | SKU 003 | [https://northernpeptides.st/product/melanotan-2/](https://northernpeptides.st/product/melanotan-2/)

- Categories: Peptides, Metabolic, Skin & Beauty
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/malnotan10.png
- Status (skill table): Unauthorized; HC warns. PEPTICITY: hidden; recommend delist.

Short description (what shoppers see):

```text
Stimulates natural melanin production for tanning; may also enhance libido and improve mood

10mg

Dosage: 250-500mcg daily

Cycle Length: 2–3 weeks load-> maintain

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Stimulates natural melanin production for tanning; may also enhance libido and improve mood" [Stimulates, tanning, may also, enhance, libido, improve, mood]
- DOSING: "Dosage: 250-500mcg daily"
- CYCLE: "Cycle Length: 2–3 weeks load-> maintain"
- HUMAN-USE CUE: "load-> maintain" (loading phase then maintenance)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic, Skin & Beauty (product placed beside a goal/benefit)

### MOTS-C

**MOTS-C (10mg)** | 10mg | $75.00 | In stock | SKU none | [https://northernpeptides.st/product/mots-c-10mg/](https://northernpeptides.st/product/mots-c-10mg/)

- Categories: Healing & Repair, Longevity & Anti-aging, Metabolic, Peptides, Skin & Beauty, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/mots10.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance

10mg

Dosage: 2-5mg 2-3x weekly

Cycle Length: 4–6 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance
```

Audit:

- CLAIM (short+long): "Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance" [supports, fat metabolism, improves, energy, promotes, balance]
- DOSING: "Dosage: 2-5mg 2-3x weekly"
- CYCLE: "Cycle Length: 4–6 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Healing & Repair, Longevity & Anti-aging, Metabolic, Skin & Beauty, Wellness (product placed beside a goal/benefit)

**MOTS-C (40mg)** | 40mg | $125.00 | In stock | SKU none | [https://northernpeptides.st/product/mots-c-40mg/](https://northernpeptides.st/product/mots-c-40mg/)

- Categories: Longevity & Anti-aging, Metabolic, Peptides, Skin & Beauty, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/mots40.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance

40mg

Dosage: 2-5mg 2-3x weekly

Cycle Length: 4–6 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance
```

Audit:

- CLAIM (short+long): "Mitochondrial peptide that supports fat metabolism, improves energy levels, and promotes metabolic balance" [supports, fat metabolism, improves, energy, promotes, balance]
- DOSING: "Dosage: 2-5mg 2-3x weekly"
- CYCLE: "Cycle Length: 4–6 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Longevity & Anti-aging, Metabolic, Skin & Beauty, Wellness (product placed beside a goal/benefit)

### NAD+

**NAD+** | 1000mg | $190.00 | In stock | SKU none | [https://northernpeptides.st/product/nad/](https://northernpeptides.st/product/nad/)

- Categories: Cognitive & Neuro, Healing & Repair, Peptides, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/F506BD00-7EF3-409A-BC61-EF7124797132.png
- Status (skill table): Unauthorized as an injectable. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Essential for cellular energy & DNA repair; anti-aging & mitochondrial support.

Size: 1000mg

Dosage: 50-150 1-3x weekly IM

Cycle Length: 6–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Essential for cellular energy & DNA repair; anti-aging & mitochondrial support.
```

Audit:

- CLAIM (short+long): "Essential for cellular energy & DNA repair; anti-aging & mitochondrial support." [energy, DNA repair, anti-aging, support]
- DOSING: "Dosage: 50-150 1-3x weekly IM"
- CYCLE: "Cycle Length: 6–8 weeks"
- HUMAN-USE CUE: "IM" (IM = intramuscular injection route)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Cognitive & Neuro, Healing & Repair, Wellness (product placed beside a goal/benefit)

### OXYTOCIN

**Oxytocin** | 2mg | $80.00 | In stock | SKU none | [https://northernpeptides.st/product/oxytocin/](https://northernpeptides.st/product/oxytocin/)

- Categories: Cognitive & Neuro, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/OXY99-9C0072C9530D.png
- Status (skill table): Authorized only as obstetric Rx; research vial is outside every approved use. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Size: 2mg

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Description
```

Audit:

- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" (banned phrase; protects nothing)
- GOAL CATEGORIES: listed under Cognitive & Neuro (product placed beside a goal/benefit)

### PFIZER BACTERIOSTATIC WATER

**Pfizer Bacteriostatic Water 30ml** | 30ml | $30.00 | In stock | SKU none | [https://northernpeptides.st/product/pfizer-bacteriostatic-water-30ml/](https://northernpeptides.st/product/pfizer-bacteriostatic-water-30ml/)

- Categories: Ancillaries
- Images: https://northernpeptides.st/wp-content/uploads/2026/07/Pfizer-Bacteriostatic-Water-30ml-Red-Leaf-Research-Labs.png
- Status (skill table): Diluent sold beside peptides = evidence of intended injectable use (FDA Aug 2026 letters). PEPTICITY: never on a shelf.

Short description (what shoppers see):

```text
FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
(empty)
```

Audit:

- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" (banned phrase; protects nothing)
- ADJACENCY: diluent sold on the same shelf as injectable peptides (FDA Aug 2026 letters treat this as intended-use evidence)
- BRAND: "Pfizer" in the product name (third-party drug-maker name used as a selling point)

### PT-141

**PT-141** | 10mg | $50.00 | In stock | SKU none | [https://northernpeptides.st/product/pt-141/](https://northernpeptides.st/product/pt-141/)

- Categories: Peptides, Performance, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/9F30A4A5-B3C1-40BF-ADE5-7E2CE5B9EADF.png
- Status (skill table): Approved brand exists in US (Vyleesi); not approved in Canada [VERIFY]. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Melanocortin-based peptide that enhances libido and sexual arousal in men and women; not hormone-based.

Size: 10mg

Dosage: 1-2mg before activity

Cycle Length: As needed

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Melanocortin-based peptide that enhances libido and sexual arousal in men and women; not hormone-based
```

Audit:

- CLAIM (short+long): "Melanocortin-based peptide that enhances libido and sexual arousal in men and women; not hormone-based." [enhances, libido, sexual arousal, not hormone-based]
- DOSING: "Dosage: 1-2mg before activity"
- CYCLE: "Cycle Length: As needed"
- HUMAN-USE CUE: "in men and women" (human subjects named); "before activity" (timed to sexual activity)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Performance, Wellness (product placed beside a goal/benefit)

### RETATRUTIDE

**Retatrutide (10mg)** | 10mg | $135.00 | In stock | SKU 0077 | [https://northernpeptides.st/product/retatrutide-10mg/](https://northernpeptides.st/product/retatrutide-10mg/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/DF7661C6-FEE8-4856-BF7E-59634C93C305.png
- Status (skill table): Investigational, unauthorized everywhere. HC 2026 advisory + seizure list. PEPTICITY: hidden; recommend delist.

Short description (what shoppers see):

```text
Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism.

10mg

Dosage: 1-5mg once weekly

Cycle Length: Continuous

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism." [fat loss, enhances, insulin sensitivity, reduces, appetite, boosts, metabolism]
- DOSING: "Dosage: 1-5mg once weekly"
- CYCLE: "Cycle Length: Continuous"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

**Retatrutide (15mg)** | 15mg | $165.00 | In stock | SKU 002 | [https://northernpeptides.st/product/retatrutide/](https://northernpeptides.st/product/retatrutide/)

- Categories: Peptides, Metabolic, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/886E8A04-91FD-4A8B-86B1-55726C3F70F6.png
- Status (skill table): Investigational, unauthorized everywhere. HC 2026 advisory + seizure list. PEPTICITY: hidden; recommend delist.

Short description (what shoppers see):

```text
Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism.

15mg

Dosage: 1-5mg once weekly

Cycle Length: Continuous

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism." [fat loss, enhances, insulin sensitivity, reduces, appetite, boosts, metabolism]
- DOSING: "Dosage: 1-5mg once weekly"
- CYCLE: "Cycle Length: Continuous"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic, Wellness (product placed beside a goal/benefit)

**Retatrutide (20mg)** | 20mg | $190.00 | In stock | SKU none | [https://northernpeptides.st/product/retatrutide-20mg/](https://northernpeptides.st/product/retatrutide-20mg/)

- Categories: Peptides, Metabolic, Wellness
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/25D3FAD3-5586-411F-8FC2-56E993467E0B.png
- Status (skill table): Investigational, unauthorized everywhere. HC 2026 advisory + seizure list. PEPTICITY: hidden; recommend delist.

Short description (what shoppers see):

```text
Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism.

20mg

Dosage: 1-5mg once weekly

Cycle Length: Continuous

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Triple-agonist peptide for advanced fat loss; enhances insulin sensitivity, reduces appetite, and boosts metabolism." [fat loss, enhances, insulin sensitivity, reduces, appetite, boosts, metabolism]
- DOSING: "Dosage: 1-5mg once weekly"
- CYCLE: "Cycle Length: Continuous"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic, Wellness (product placed beside a goal/benefit)

### SELANK

**Selank** | 10mg | $75.00 | In stock | SKU none | [https://northernpeptides.st/product/selank/](https://northernpeptides.st/product/selank/)

- Categories: Cognitive & Neuro, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/16BAB0A7-D65F-41F3-98A2-73C6D3DE0DB9.png
- Status (skill table): Unauthorized [VERIFY]; Russia-registered. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Anti-anxiety, calming; improves focus, mood stability under stress.

Size: 10mg

Dosage: 200-300mcg 1-2x a day

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Anti-anxiety, calming; improves focus, mood stability under stress.
```

Audit:

- CLAIM (short+long): "Anti-anxiety, calming; improves focus, mood stability under stress." [Anti-anxiety, calming, improves, focus, mood]
- DOSING: "Dosage: 200-300mcg 1-2x a day"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Cognitive & Neuro (product placed beside a goal/benefit)

### SEMAX

**Semax** | 10mg | $75.00 | In stock | SKU none | [https://northernpeptides.st/product/semax/](https://northernpeptides.st/product/semax/)

- Categories: Cognitive & Neuro, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/6DEEE34C-0D62-413E-A893-9892E2936D23.png
- Status (skill table): Unauthorized [VERIFY]; Russia-registered. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Neuroprotective & nootropic; boosts focus, memory, learning, brain recovery.

Size: 10mg

Dosage: 100-250mcg 1-2x a day

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Neuroprotective & nootropic; boosts focus, memory, learning, brain recovery.
```

Audit:

- CLAIM (short+long): "Neuroprotective & nootropic; boosts focus, memory, learning, brain recovery." [Neuroprotective, nootropic, boosts, focus, memory, learning, brain, recovery]
- DOSING: "Dosage: 100-250mcg 1-2x a day"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Cognitive & Neuro (product placed beside a goal/benefit)

### SLU-PP-332

**Slu-pp-332** | 10mg | $80.00 | In stock | SKU none | [https://northernpeptides.st/product/slu-pp-332/](https://northernpeptides.st/product/slu-pp-332/)

- Categories: Metabolic, Peptides
- Visibility: hidden from the shop; buyable at its URL
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/Slu-pp-332.png
- Status (skill table): NOT in the PEPTICITY 28-product status table. Unauthorized research compound (not a peptide) [VERIFY].

Short description (what shoppers see):

```text
Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain

10mg

Dosage: 250–500mcg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
(empty)
```

Audit:

- CLAIM (short): "Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain" [Accelerates, tendon, ligament, muscle repair, reducing, inflammation, joint pain]
- DOSING: "Dosage: 250–500mcg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)
- VISIBILITY: hidden from shop listings and the Store API list, but published, in stock and buyable at its URL

### SS-31

**SS-31** | 10mg | $75.00 | In stock | SKU none | [https://northernpeptides.st/product/ss-31/](https://northernpeptides.st/product/ss-31/)

- Categories: Cognitive & Neuro, Longevity & Anti-aging, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/342FA8D6-D658-4E3C-8AA9-932849F8C9BF.png
- Status (skill table): Not authorized in Canada [VERIFY]; US approved only as Forzinity (Barth syndrome). HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Mitochondrial protective peptide; improves cellular energy, reduces oxidative stress, and supports muscle recovery.

Size: 10mg

Dosage: 2-5mg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Mitochondrial protective peptide; improves cellular energy, reduces oxidative stress, and supports muscle recovery.
```

Audit:

- CLAIM (short+long): "Mitochondrial protective peptide; improves cellular energy, reduces oxidative stress, and supports muscle recovery." [protective, improves, energy, reduces, oxidative stress, supports, muscle recovery]
- DOSING: "Dosage: 2-5mg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Cognitive & Neuro, Longevity & Anti-aging (product placed beside a goal/benefit)

### TB-500

**Tb-500 10mg** | 10mg | $90.00 | In stock | SKU none | [https://northernpeptides.st/product/tb-500-10mg/](https://northernpeptides.st/product/tb-500-10mg/)

- Categories: Healing & Repair, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/Tb-500-.png
- Status (skill table): Unauthorized. HC 2026 advisory. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain

10mg

Dosage: 250–500mcg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
(empty)
```

Audit:

- CLAIM (short): "Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain" [Accelerates, tendon, ligament, muscle repair, reducing, inflammation, joint pain]
- DOSING: "Dosage: 250–500mcg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Healing & Repair (product placed beside a goal/benefit)

### TESAMORELIN

**Tesamorelin** | 10mg | $160.00 | In stock | SKU none | [https://northernpeptides.st/product/tesamorelin/](https://northernpeptides.st/product/tesamorelin/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/B369B077-C29A-4471-8B8E-F080F9BCE14A.png
- Status (skill table): Approved brand exists (Egrifta, one indication). PEPTICITY: hidden.

Short description (what shoppers see):

```text
Targets visceral fat reduction while supporting lean muscle preservation and improved body composition.

Size: 10mg

Dosage: 1-2mg daily fasted (AM or PM)

Cycle Length: 8–12 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Targets visceral fat reduction while supporting lean muscle preservation and improved body composition
```

Audit:

- CLAIM (short+long): "Targets visceral fat reduction while supporting lean muscle preservation and improved body composition." [visceral fat, reduction, supporting, lean muscle, preservation, improved, body composition]
- DOSING: "Dosage: 1-2mg daily fasted (AM or PM)"
- CYCLE: "Cycle Length: 8–12 weeks"
- HUMAN-USE CUE: "fasted" (fasted timing); "(AM or PM)" (time-of-day timing)
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

### THYMOSIN-ALPHA 1

**Thymosin-Alpha 1 10mg** | 10mg | $90.00 | In stock | SKU none | [https://northernpeptides.st/product/thymosin-alpha-1-10mg/](https://northernpeptides.st/product/thymosin-alpha-1-10mg/)

- Categories: Growth & Recovery, Peptides
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/Thymosin-Alpha-1.png
- Status (skill table): Not authorized in Canada [VERIFY]; approved abroad only. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain

10mg

Dosage: 250–500mcg daily

Cycle Length: 4–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
(empty)
```

Audit:

- CLAIM (short): "Accelerates tendon, ligament, and muscle repair while reducing inflammation and joint pain" [Accelerates, tendon, ligament, muscle repair, reducing, inflammation, joint pain]
- DOSING: "Dosage: 250–500mcg daily"
- CYCLE: "Cycle Length: 4–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Growth & Recovery (product placed beside a goal/benefit)

### TIRZEPATIDE

**Tirzepatide (15mg)** | 15mg | $150.00 | In stock | SKU none | [https://northernpeptides.st/product/tirzepatide/](https://northernpeptides.st/product/tirzepatide/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/tirzep15.png
- Status (skill table): Approved brand exists (Mounjaro/Zepbound); research copy is not it. HC 2025 seizure list. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Dual GIP/GLP-1 agonist that improves blood sugar control and significantly aids weight loss

15mg

Dosage: 2.5-15mg once weekly

Cycle Length: 12–24 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Dual GIP/GLP-1 agonist that improves blood sugar control and significantly aids weight loss" [improves, blood sugar, aids, weight loss]
- DOSING: "Dosage: 2.5-15mg once weekly"
- CYCLE: "Cycle Length: 12–24 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

**Tirzepatide (30mg)** | 30mg | $275.00 | In stock | SKU none | [https://northernpeptides.st/product/tirzepatide-30mg/](https://northernpeptides.st/product/tirzepatide-30mg/)

- Categories: Peptides, Metabolic
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/4A8D6E6E-1575-4FE0-BEA9-9A8194D6DBBE.png
- Status (skill table): Approved brand exists (Mounjaro/Zepbound); research copy is not it. HC 2025 seizure list. PEPTICITY: hidden.

Short description (what shoppers see):

```text
Dual GIP/GLP-1 agonist that improves blood sugar control and significantly aids weight loss

30mg

Dosage: 2.5-15mg once weekly

Cycle Length: 12–24 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
Ingredients: Water, Panthenol, Provitamin B5, Sodium Lauroyl Isethionate, Stearic Acid, Lauric Acid, Sodium Oleate, Sodium Isethionate, Sodium Stearate, Cocamidopropyl Betaine, Fragrance (Parfum), Sodium Laurate, Tetrasodium Etidronate, Tetrasodium EDTA, Sodium Chloride, Kaolin or (ou) Titanium Dioxide.

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
```

Audit:

- CLAIM (short): "Dual GIP/GLP-1 agonist that improves blood sugar control and significantly aids weight loss" [improves, blood sugar, aids, weight loss]
- DOSING: "Dosage: 2.5-15mg once weekly"
- CYCLE: "Cycle Length: 12–24 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- GOAL CATEGORIES: listed under Metabolic (product placed beside a goal/benefit)

### WOLVERINE

**Wolverine (10mg)** | 10mg | $100.00 | In stock | SKU none | [https://northernpeptides.st/product/wolverine/](https://northernpeptides.st/product/wolverine/)

- Categories: Healing & Repair, Peptides, Performance
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/9AF4CA19-9F41-4C6B-A59E-366AAC10EA1C.png
- Status (skill table): Unauthorized blend (BPC-157 + TB-500). Name itself is a claim. PEPTICITY: hidden; never use the name.

Short description (what shoppers see):

```text
BPC-157 + TB-500

Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function

10mg

Dosage: 500mcg-1mg daily

Cycle Length: 6–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
BPC-157 + TB-500

Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function
```

Audit:

- CLAIM (short+long): "Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function" [Accelerates, tendon, ligament, repair, reduces, inflammation, improves, flexibility, joint]
- DOSING: "Dosage: 500mcg-1mg daily"
- CYCLE: "Cycle Length: 6–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- NAME IS A CLAIM: "Wolverine" (wording-rules B.7)
- GOAL CATEGORIES: listed under Healing & Repair, Performance (product placed beside a goal/benefit)

**Wolverine (20mg)** | 20mg | $195.00 | In stock | SKU none | [https://northernpeptides.st/product/wolverine-20mg/](https://northernpeptides.st/product/wolverine-20mg/)

- Categories: Healing & Repair, Peptides, Performance
- Images: https://northernpeptides.st/wp-content/uploads/2026/05/30B1A9EC-0B47-4DD7-8B5C-A2BC8D624553.png
- Status (skill table): Unauthorized blend (BPC-157 + TB-500). Name itself is a claim. PEPTICITY: hidden; never use the name.

Short description (what shoppers see):

```text
BPC-157 + TB-500

Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function

20mg

Dosage: 500mcg-1mg daily

Cycle Length: 6–8 weeks

FOR RESEARCH PURPOSES ONLY
```

Long description:

```text
BPC-157 + TB-500

Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function
```

Audit:

- CLAIM (short+long): "Accelerates muscle, tendon, and ligament repair, reduces inflammation, and improves flexibility and joint function" [Accelerates, tendon, ligament, repair, reduces, inflammation, improves, flexibility, joint]
- DOSING: "Dosage: 500mcg-1mg daily"
- CYCLE: "Cycle Length: 6–8 weeks"
- RUO DISCLAIMER: "FOR RESEARCH PURPOSES ONLY" beside dosing = evidence of intended human use (FDA Aug 2026 letters); does not cure the claims
- NAME IS A CLAIM: "Wolverine" (wording-rules B.7)
- GOAL CATEGORIES: listed under Healing & Repair, Performance (product placed beside a goal/benefit)


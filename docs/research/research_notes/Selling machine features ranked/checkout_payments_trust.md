# Checkout, Payments and Trust for PEPTICITY (Canada, Nov 2026)

Research date: 2 Nov 2026. Scope: which platforms/processors will serve a Canadian seller of unauthorized peptides (BPC-157, TB-500, GHK-Cu, NAD+, tirzepatide etc.), and the evidence behind checkout/trust features. Vendor claims are marked as such. Research budget was ~15 tool calls, so several items are listed under Gaps rather than guessed.

## 1. Will mainstream platforms and processors serve a peptide seller? (Shopify, Stripe, Square, PayPal, Helcim, Moneris, wallets)

### Takeaway
No mainstream processor found will knowingly serve this catalogue. Helcim (a Canadian processor) explicitly prohibits "Non-FDA/Health Canada approved peptides"; Stripe prohibits incorrectly labelled research chemicals and restricts card-not-present prescription products; Shopify Payments defers to its processors' lists (Stripe in Canada). Shopify's own AUP does not name peptides, but bans anything "illegal where you do business", and after the July 2026 Canlab injunction selling these products in Canada falls inside that.

### Cited Findings
- Stripe Restricted Businesses (last updated 2026-09-22): Prohibited: "Pseudo-pharmaceuticals or nutraceuticals that are not safe or make harmful claims"; Prohibited (dangerous materials): "Incorrectly labeled research chemicals"; Restricted: "Card-not-present prescription-only products and pharmaceuticals" and "Online pharmacies, including SaaS platforms". The page does not use the word "peptide". — [Stripe](https://stripe.com/legal/restricted-businesses)
- Shopify Acceptable Use Policy: "You can't use Shopify to do anything that's illegal where you do business." No explicit mention of peptides, research chemicals or unapproved drugs; no last-updated date shown. — [Shopify AUP](https://www.shopify.com/legal/aup)
- Shopify Payments Canada terms, s. B5: prohibited/restricted business types "are provided by each Payment Processor", with a pointer to the processor list; "These lists are meant to be representative but not exhaustive." No date shown. — [Shopify Payments CA terms](https://www.shopify.com/legal/terms-payments-ca); [Processor list](https://www.shopify.com/legal/processor-list)
- Helcim Acceptable Use Policy (Canada), last updated 30 Sep 2026. Prohibited: "Non-FDA/Health Canada approved peptides"; "approved peptides, when not administered directly by a registered healthcare professional"; "Non-FDA/Health Canada approved pharmaceuticals"; "Supplements or compounds banned by Health Canada or the United States Food and Drug Administration"; "Pseudo-pharmaceuticals or nutraceuticals focused on significant weight loss or sexual performance"; "Online pharmacies or prescription drug sellers operating without valid licensing in all jurisdictions where they sell". Restricted: "Research chemicals", "Online pharmacies and supplement retailers, generally". — [Helcim AUP CA](https://legal.helcim.com/ca/acceptable-use-policy/)
- Moneris publishes a "prohibited merchant segments" PDF (found in search, not read). — [Moneris PDF](https://www.moneris.com/-/media/files/legal/moneris-prohibited-merchant-segments-transactions-public-en.pdf)
- Square Canada prohibited-goods page exists but returned HTTP 429 when fetched; a third-party summary (not official) says Square restricts pharmaceuticals sold online/by phone and imported medicines. — [Square CA help 5089](https://squareup.com/help/ca/en/article/5089-prohibited-goods-and-services-with-square-point-of-sale); [mobiletransaction.org (secondary)](https://www.mobiletransaction.org/restricted-businesses-types-square-paypal-izettle-sumup/)
- PayPal AUP Canada page could not be read (truncated). Secondary sources say PayPal does not process internet/mail-order pharmaceuticals and needs pre-approval for prescription drugs. — [PayPal AUP (CA)](https://www.paypal.com/ca/legalhub/paypal/acceptableuse-full); [mobiletransaction.org (secondary)](https://www.mobiletransaction.org/restricted-businesses-types-square-paypal-izettle-sumup/)
- Shopify shutting down peptide stores: no credible news report or Shopify statement found of a platform-wide action. Search results were vendor/affiliate blogs (e.g., "Shopify Banned Your Peptide Store?") with no primary sourcing. — [peptidesetup blog (vendor)](https://peptidesetup.pages.dev/blog/shopify-stripe-ban-alternative); [seekpeptides (vendor)](https://www.seekpeptides.com/blog/articles/can-people-use-shopify-to-sell-peptides)
- Industry context: large grey-market vendors closed in 2026. Reported closures: Science.bio (announced 27 Jan 2026) and Peptide Sciences (6 Mar 2026). Sources are newsletters/Substack, not primary. — [The Peptide List (Substack)](https://thepeptidelist.substack.com/p/peptide-sciences-is-dead-inside-the); [Project Biohacking](https://projectbiohacking.beehiiv.com/p/peptide-sciences-just-closed-its-doors)
- US enforcement signal: a peptide vendor was sentenced to six years (3 Aug 2026). — [Partnership for Safe Medicines](https://www.safemedicines.org/2026/08/august-3-2026.html)

### Inferences
- Shopify + Shopify Payments (and therefore Shop Pay) is not a safe home for this catalogue. Shopify's terms push the decision to Stripe's list, Stripe restricts CNP prescription drugs, and Health Canada calls these products unauthorized drugs. Account closure plus held funds is the likely result once flagged.
- Helcim is the clearest "no": its policy names peptides directly. Do not apply.
- Apple Pay / Google Pay are not separate approvals. They run on whichever processor the store uses, so they disappear if that processor drops the store. (Inference from how wallets work; no wallet policy text was fetched.)
- Woo (the owner's current setup) only "tolerates" this category because WordPress is self-hosted. The risk sits with whichever gateway is plugged in, not with WooCommerce itself.

### Gaps
- Shopify does not show an explicit "peptides" line in the AUP; the Shopify Payments prohibited list on the processor page was not read in full.
- Square CA and PayPal CA primary text not captured (429/truncated). Moneris PDF not read.
- Apple Pay / Google Pay merchant terms not fetched.
- Shop Pay requiring Shopify Payments: widely understood but not confirmed from a primary page in this pass.
- No verified Canadian news story naming a specific peptide store shut down by Shopify or Stripe.

## 2. Card-network rules (Mastercard BRAM, Visa Integrity Risk Program) and LegitScript

### Takeaway
Card networks police this category through the acquiring bank, by scanning the merchant's website and marketing, not individual transactions. LegitScript (used by Visa and Mastercard ecosystems) names BPC-157, TB-500, CJC-1295, ipamorelin, tesamorelin and GHRPs as "known problematic peptides". It says a "not for human consumption" label is a red flag, not a shield. LegitScript certification exists only for approved peptide drugs sold by licensed pharmacies/clinics, so PEPTICITY's catalogue cannot be certified.

### Cited Findings
- LegitScript "Peptides for Payment Processors Guide" (Oct 2025): "LegitScript sees many synthetic peptides being sold online as 'research chemicals' but are actually intended for human consumption … they are illegal to market or sell for human consumption without FDA approval." — [LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)
- Same guide, red flag: "merchants offering research chemicals that prominently state that their products are not intended for human consumption are, perhaps counterintuitively, more likely to be engaged in unapproved peptides sales." — [LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)
- Same guide, "Known Problematic Peptides": Melanotan 2, Ipamorelin, Tesamorelin, CJC-1295, BPC-157, Thymosin beta-4/TB-500, GHRPs; plus "carefully scrutinize any website offering in-demand peptides, such as semaglutide and tirzepatide". — [LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)
- Same guide, site look: "Merchants who offer a large, broad catalog of unapproved peptides often favor a clinical look with branding reminiscent of a laboratory." Another red flag listed: allowing online checkout with no contact, where legitimate research suppliers "will often require a buyer to first contact them for a quote". — [LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)
- Same guide: LegitScript Healthcare Merchant Certification is for "businesses that facilitate the sale of pharmaceuticals, including approved peptide drugs"; rules include licensure, valid prescriptions, and "Drugs must be approved for sale in the jurisdictions where they are shipped." — [LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)
- Corepay (high-risk processor): "As of April 1, 2024, we are unable to assist peptide platforms that are not LegitScript certified", tied to the Visa Integrity Risk Program; "We do not support research-use-only (RUO) peptide sellers." — [Corepay](https://corepay.net/industries/best-peptide-merchant-accounts/)
- Mastercard BRAM: secondary sources say it reviews merchant websites, ads and every URL tied to the merchant account, and notifies the acquirer when it finds a violation. One vendor blog cites a June 2025 Mastercard bulletin GLB 11691.1 on peptides (not verified against Mastercard). — [Convesio KB](https://convesio.com/knowledgebase/article/mastercard-bram-program/); [Onlayer glossary](https://onlayer.com/en/glossary/bram-business-risk-assessment-mitigation); [Corepay blog](https://corepay.net/?p=1948)
- G2 Risk Solutions (1 Nov 2024): "G2 Risk Solutions has seen an increase in card brand assessments for" peptide merchants; it names no specific bulletin or fine. — [G2 Risk Solutions](https://g2risksolutions.com/resources/blog/card-brands-are-cracking-down-on-problematic-peptide-merchants/)

### Inferences
- Card acceptance for this catalogue in Canada is close to impossible to keep through any processor that follows the rules. The bank, not the processor, decides, and Canlab-style enforcement plus a Health Canada advisory list makes a "violation" easy to show.
- Design choices that matter to compliance scanners: a lab look, a broad unapproved catalogue, open checkout and "research only" disclaimers are the exact signals LegitScript tells processors to look for. PEPTICITY's premium lab look scores on that list.
- The only card-compliant path found is the legal one: approved products sold through a licensed pharmacy or clinic (prescription model), then LegitScript certification. That is a business-model change, not a checkout feature.

### Gaps
- Mastercard and Visa rule texts (BRAM / VIRP / GLB 11691.1) are not public; only secondary descriptions were found.
- No Canadian-acquirer-specific (Moneris, Chase Paymentech CA, Global Payments CA) peptide policy found.

## 3. High-risk processors, Interac e-Transfer, crypto, and tolerant platforms

### Takeaway
"High-risk" processors market peptide merchant accounts, but the most specific one checked (Corepay) excludes research-use peptide sellers and requires LegitScript certification. Most other pages are marketing. No credible source was found on Canadian high-risk acquirers, Interac e-Transfer use by peptide stores, or current fee levels.

### Cited Findings
- Corepay: no fees published; "Peptide merchants pay premium rates because few processors will serve the category"; rates, reserves and payout cycles set at underwriting; asks for processing history, chargeback history, a compliant site with SSL and matching contact info. Canada appears only as "CA" in a regions list. (Vendor claim.) — [Corepay](https://corepay.net/industries/best-peptide-merchant-accounts/)
- Easy Pay Direct markets a "peptide merchant account". (Vendor page; not read in full.) — [Easy Pay Direct](https://www.easypaydirect.com/blog/peptide-merchant-account-fast-and-easy-payment-processing/)
- Termination risk: merchant-side anecdotes describe an acquiring bank re-assessing research chemicals and dropping all peptide merchants on that processor, with funds held during "review". Anecdotal, vendor-adjacent. — [Binderr marketplace](https://binderr.com/marketplace/high-risk-payment-processors-for-peptides); [Payline](https://paylinedata.com/blog/credit-card-processing-for-peptides/)
- Crypto is promoted as an alternative for high-risk merchants (vendor pitches, no verified data). — [TechBullion (sponsored-style)](https://techbullion.com/the-best-peptide-payment-gateway-in-2026-how-companies-accept-visa-and-mc-with-crypto-settlement/); [Medium/Coinmonks](https://medium.com/coinmonks/peptide-payment-processing-in-2026-how-research-chemical-companies-are-finally-accepting-card-d87867be0eb8)

### Inferences
- Any processor that does accept this catalogue is likely either (a) mis-coding the merchant (transaction laundering, a card-network violation that puts the store at risk of a MATCH listing), or (b) offshore with large reserves. Both are fragile and should be treated as "will get cut off" risk, not a plan.
- Practical fallback seen across the grey market is Interac e-Transfer and crypto. These avoid card rules but add friction, offer no buyer protection, and are not what a premium checkout looks like. Banks can also close accounts used for this. (Inference; no source in this pass.)
- WooCommerce/Medusa/custom builds let the owner swap gateways without losing the store; that "portability" is their only real advantage here. They do not make a payment provider approve the product.

### Gaps
- No primary-source fees or reserve levels for PaymentCloud, Durango, Easy Pay Direct, Corepay or Soar as of Nov 2026; none publish rates. Any number (e.g., "4-6%") would be unsourced, so none is given.
- No source on Interac e-Transfer terms or bank behaviour toward peptide merchants.
- BigCommerce and Medusa high-risk tolerance not researched in this pass.

## 4. Checkout feature evidence (wallets, guest checkout, field count, trust badges, speed, shipping)

### Takeaway
Strongest independent evidence: Baymard's abandonment reasons (extra costs 40%, forced account 18%, long checkout 17%, distrust with card 19%) and its ideal of 7-8 form fields (12-14 elements) vs a 14.88-field US average. Wallet lift numbers (Shop Pay "up to 50%") are vendor claims from an unnamed consultancy study. Speed: Deloitte/Google says 0.1 s faster mobile = +8.4% retail conversions; Portent says 1 s vs 5 s = 2.5x e-commerce conversion.

### Cited Findings
- Baymard: average documented cart abandonment 70.22% (50 studies; page "last updated" 22 Sep 2025). — [Baymard](https://baymard.com/lists/cart-abandonment-rate)
- Baymard abandonment reasons (excluding "just browsing"): extra costs too high 40%; delivery too slow 20%; didn't trust site with card info 19%; site wanted me to create an account 18%; too long/complicated checkout 17%; errors/crashes 17%; returns policy 13%; couldn't see total cost up front 12%; card declined 10%; not enough payment methods 9%. — [Baymard](https://baymard.com/lists/cart-abandonment-rate)
- Baymard: average US checkout shows 23.48 form elements (14.88 form fields); ideal is 12-14 elements (7-8 fields). Better checkout design could lift conversion 35.26% for large e-commerce sites. — [Baymard](https://baymard.com/lists/cart-abandonment-rate)
- Baymard trust seals: Norton's seal gives the "best sense of trust" (latest 2023 update); 2013 study had Norton ~36%, McAfee ~23%. A 2022 figure reported secondhand: Norton 35.4%, Google Trusted Store 20.9%, BBB 15.7%, McAfee 12.8%. Baymard notes users don't know the difference between kinds of badges. — [Baymard site-seal research](https://baymard.com/blog/site-seal-trust); [TrustSignals (secondary, 2022 figures)](https://trustsignals.com/blog/trust-badges-work-and-we-have-the-receipts-to-prove-it)
- Shop Pay "up to 50%" is Shopify's claim: Shop Pay can raise conversion by up to 50% compared to guest checkout, footnoted to a study with a "Big Three global management consulting firm" (April 2023). Shopify also claims Shop Pay outperforms other accelerated checkouts (incl. Apple Pay) by at least 10%, and that its presence alone lifts lower-funnel conversion 5%. (Vendor claims.) — [Shopify Shop Pay enterprise](https://shopify.com/solutions/shop-pay/enterprise); [Shopify blog](https://www.shopify.com/blog/shop-pay-checkout)
- BetaKit noted there appear to be no public studies comparing Shopify's checkout conversion with PayPal or Amazon. — [BetaKit](https://betakit.com/shopify-claims-best-conversion-rates-among-checkout-solutions-on-the-market/)
- Don't confuse: Shop Pay Installments "up to 50%" refers to average order value, not conversion (Shopify claim). — [Shopify blog](https://www.shopify.com/blog/shop-pay)
- Deloitte/55 for Google, "Milliseconds Make Millions" (2020): a 0.1 s mobile speed gain raised retail conversions 8.4% and retail AOV 9.2% (travel +10.1%); 37 brands, 30M sessions, EU/US, four weeks. Funded by Google. — [web.dev case study](https://web.dev/case-studies/milliseconds-make-millions); [Deloitte report PDF](https://www2.deloitte.com/content/dam/Deloitte/ie/Documents/Consulting/Milliseconds_Make_Millions_report.pdf)
- Portent (2022): a 1 s page has 2.5x the e-commerce conversion rate of a 5 s page (3x for B2B lead gen); e-commerce conversion falls about 0.3% for every extra second. Correlational. — [Portent](https://www.portent.com/blog/analytics/research-site-speed-hurting-everyone.htm)

### Inferences
- Ranked for PEPTICITY by evidence strength: (1) all-in price shown early, plus a free-shipping line (attacks the 40% and 12% reasons); (2) guest checkout, account offered after purchase (18%); (3) 7-8 fields max (17%); (4) fast static pages (Deloitte/Portent); (5) visible trust cues next to the payment fields (19%); (6) express wallets, only if the processor survives (see section 1).
- Trust badges: Norton-style seals help in surveys, but they are a vendor product tied to a paid SSL/seal. For this store, the bigger trust lever is proof unique to the category: a lot-number COA lookup, a Canadian return address, a named owner. That is inference; no study on COA lookup was found.
- Express wallets have no value if the underlying processor will not keep the account; don't design the checkout around Shop Pay.

### Gaps
- No independent (non-vendor) Apple Pay / Google Pay conversion study found in this pass.
- Free-shipping threshold evidence beyond Baymard's "extra costs" reason not gathered.
- Shopify Markets / multi-currency (CAD/USD) conversion data not gathered.
- No study on COA/lab-report lookup or vial QR codes affecting conversion; this would be a design bet, not evidence.
- Age/province gate: no conversion data; this is a legal requirement question (see peptide-regulatory skill), not a feature-lift question.

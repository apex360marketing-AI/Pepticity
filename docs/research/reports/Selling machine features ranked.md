# Fix the price, proof and checkout first

**Bottom line.** The features most likely to raise PEPTICITY's close rate and order value are not the fancy ones. They are the cheap, custom-coded basics that fix why people leave: an all-in price shown early, a free-shipping line, verified service reviews, a lot-certificate (COA) lookup, a fast page, and a short guest checkout. The best independent evidence backs these: Baymard's abandonment reasons (extra costs 40%, distrust with card 19%, forced account 18%) and Spiegel's finding that 5 reviews make a purchase 270% more likely than none. Email flows (abandoned cart, welcome) come next. Klaviyo's own data ranks them highest among flows, but they depend on an email platform that may refuse the catalogue. Everything on the list sits behind "gate zero". No mainstream payment processor or email/SMS platform can be assumed to accept this catalogue. Shopify apps mostly don't apply because the store is custom and Shopify Payments is a poor fit. On top of that, every feature is only as legal as the product it sells. For most SKUs there is no lawful claim layer, so the features can amplify legal exposure as well as sales. So: build the custom, vendor-free pieces now, get written answers from counsel and vendors in parallel, and wire in email and payments only once approved.

Source labels used throughout:
- **[Independent]**: academic study, independent research firm, regulator or court.
- **[Vendor benchmark]**: a vendor's own customer data.
- **[Industry claim]**: a blog, aggregator or vendor marketing line with no traceable method.
- **[Inference]**: my reasoning from the notes. Not data.
- Prices are mostly from third-party trackers dated Apr–Oct 2026, in USD, not fetched from vendor pages. Confirm before you buy. This is a risk scan, not legal advice.

---

## Gate zero: payments and email can refuse the whole store

Every feature below depends on one or more of these gates. Settle them first.

### Payments (gate P)
- **Stripe** (list updated 2026-09-22):
  - Prohibits "Incorrectly labeled research chemicals" and "Pseudo-pharmaceuticals or nutraceuticals that are not safe or make harmful claims".
  - Restricts "Card-not-present prescription-only products and pharmaceuticals".
  - Never uses the word "peptide". ([Stripe](https://stripe.com/legal/restricted-businesses)) [Independent: primary policy, verified by coordinator]
- **Helcim Canada** (AUP updated 30 Sep 2026) prohibits "Non-FDA/Health Canada approved peptides" and "approved peptides, when not administered directly by a registered healthcare professional". This is the clearest "no". Do not apply. ([Helcim](https://legal.helcim.com/ca/acceptable-use-policy/))
- **Shopify Payments** takes its prohibited list from its processors (Stripe in Canada) ([Shopify Payments CA terms](https://www.shopify.com/legal/terms-payments-ca)). Shopify's AUP bans anything "illegal where you do business" ([Shopify AUP](https://www.shopify.com/legal/aup)). So Shop Pay and Shopify apps are a poor fit. [Inference]
- **Card networks police the website, not single sales.** LegitScript's Oct 2025 guide for processors:
  - Names BPC-157, TB-500, CJC-1295, ipamorelin, tesamorelin and GHRPs as "known problematic peptides".
  - Calls "not for human consumption" labels a red flag, not a shield.
  - Lists "a clinical look with branding reminiscent of a laboratory" and open checkout with no contact step as further red flags. ([LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf))
  - PEPTICITY's premium lab look fits that profile. Flagged here, not a recommendation to change the locked brand.
- **High-risk processors are not a plan either.** Corepay says: "We do not support research-use-only (RUO) peptide sellers" and requires LegitScript certification ([Corepay](https://corepay.net/industries/best-peptide-merchant-accounts/)). LegitScript certification is only for approved drugs sold by licensed pharmacies or clinics ([LegitScript PDF](https://www.legitscript.com/wp-content/uploads/2025/10/Peptides-for-Payment-Processors-Guide.pdf)).
- **Not verified:** Square CA, PayPal CA, Moneris, Apple Pay and Google Pay terms. No processor publishes fees for this category. Any fee number would be unsourced, so none is given.
- **[Inference]** Express wallets, one-click upsells, subscriptions and gift-card payments all sit on the processor. If the processor drops the store, they all go at once.

### Email and SMS (gate E)
- **Brevo** refuses "Peptide-based products for injectable or oral human therapeutic, weight-loss, or performance use … including those labeled 'research use only'" ([Brevo AUP](https://www.brevo.com/legal/antispampolicy/)). Excluded.
- **Omnisend** prohibits prescription medications "including but not limited to drugs for research purposes", and bans prescription medications over SMS ([Omnisend AUP](https://www.omnisend.com/legal/acceptable-use-policy/)).
- **Klaviyo** restricts "Prescription medications, pharmaceutical products" ([Klaviyo AUP](https://www.klaviyo.com/legal/acceptable-use-policy)).
- **Mailchimp** lists "Pharmaceutical products" as possibly not allowed ([Mailchimp AUP](https://mailchimp.com/legal/acceptable_use/)).
- **ActiveCampaign** bans prescription and OTC drugs ([ActiveCampaign AUP](https://www.activecampaign.com/acceptable-use-policy)).
- **US SMS:** Twilio's 10DLC rejection for prescription-drug marketing is final and cannot be resubmitted ([Twilio 30941](https://www.twilio.com/docs/api/errors/30941)).
- **Not checked:** Customer.io, Drip, Postscript, Attentive, Postmark, SES and SendGrid AUPs.
- **[Inference]** Ask for written pre-approval before building. Plan for a suspension that kills every flow at once. Keep the contact list and flow logic portable (own the event data on the site's side).

### Consent and law (gate C)
- **CASL.** Purely transactional messages are exempt from consent (s.6(6)) ([CASL s.6](https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-1.html)).
  - Implied consent lasts 2 years after a purchase and 6 months after an inquiry (s.10(10)) ([CASL s.10](https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-2.html)).
  - Whether starting a checkout counts as an "inquiry" has no CRTC guidance found.
- **Product law caps every feature.** See the claims check below.

### Platform (gate X)
- The store is custom-built. Shopify-only apps (Rebuy, AfterSell, ReConvert, Zipify, Recharge, Skio, Loop, Stay AI, Judge.me, Okendo) don't plug in.
  - [Rebuy Shopify-only](https://ecommercefastlane.com/best-rebuy-alternative-for-ecommerce-personalization/); [subscription apps Shopify-only](https://subi.co/post/shopify-subscription-app-rankings); [Judge.me Shopify-only](https://wiserreview.com/blog/judge-me-review/)
- **[Inference]** Custom builds' real advantage is portability. You can swap a gateway or email platform without rebuilding the store. A custom build does not make anyone approve the product.

**Dependency codes used in the table:** P = payment processor, E = email/SMS platform, C = consent capture and counsel answer, I = inventory/lot data (shared/inventory.js plus real COAs), K = checkout backend events, none = can ship now.

---

## Ranking method: impact × evidence × fit ÷ effort, with compliance as a gate

- **Impact (1–5):** likely effect on close rate or order value for a small 28-SKU store. [Inference]
- **Evidence (1–3):** 3 = independent study; 2 = vendor benchmark; 1 = industry claim or my inference.
- **Fit (1–3):** 3 = custom code, works before gate zero; 2 = needs one approved vendor; 1 = needs the processor plus more, or blocked today.
- **Effort:** S = 1 (days), M = 2 (1–3 weeks), L = 3 (a month or more).
- **Score** = Impact × Evidence × Fit ÷ Effort.
- **Priority (1–5):** 5 = score 15+; 4 = 8–14.9; 3 = 5–7.9; 2 = 3–4.9; 1 = under 3.
- **Compliance gate:** risk is rated for the compliant version (the rewrites below). A feature still rated **High** is held at the bottom, whatever its score, until counsel clears it.
- Scores are judgement calls, built to sort the list, not forecasts.

---

## Master table: 31 features, ranked

RPR = revenue per recipient, from Klaviyo's 2 Oct 2026 report (110,000+ customers, mixed industries, no peptide stores) ([Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks)). Use these figures as a relative ranking only. They scale with order value.

| # | Feature | Area | Lift (number · source · label) | Build path | Tool + price (Nov 2026) | Effort | Compliance risk | Priority (score · rank) | Depends on |
|---|---|---|---|---|---|---|---|---|---|
| 1 | All-in price shown early (no drip fees) | Checkout | 40% abandon over extra costs; 12% couldn't see total cost up front · [Baymard](https://baymard.com/lists/cart-abandonment-rate) · Independent | Custom: show CAD price incl. shipping estimate and fees on card, drawer and checkout | $0 (own code) | S | Low: also what Competition Act drip-pricing rules require | 5 (45 · #1) | none |
| 2 | Free-shipping bar | Cart | Same 40% extra-costs reason ([Baymard](https://baymard.com/lists/cart-abandonment-rate)) · Independent. Thresholds raise basket size ([HBS](https://hbswk.hbs.edu/item/shipping-fees-and-product-assortment-in-online-retail)) but a randomised test found they cut purchase incidence ([Marketing Letters 2019](https://scinapse.io/papers/2939285397)) · Independent, mixed | Custom JS in cart drawer: subtotal vs threshold | $0 | S | Low: line must be true and all-in | 5 (24 · #2) | none |
| 3 | Reviews (verified, service-only, store-level) | Social proof | 5 reviews = 270% higher purchase likelihood vs none (380% higher-priced, 190% lower-priced items) · [Spiegel](https://spiegel.medill.northwestern.edu/How-Online-Reviews-Influence-Sales) · Independent | Custom review store (serverless + DB, verified-order token after delivery) or REVIEWS.io widget/API | In-house $0, or REVIEWS.io ~$19–29/mo ([Signed Reviews](https://signedreviews.com/blog/trustpilot-alternatives-for-ecommerce/), aggregator) | M | Med: reviews are "representations" under the Competition Act (penalty up to $10M) ([NRF](https://nortonrosefulbright.com/en-ca/knowledge/publications/41049288/fake-reviews-competition-bureau-warns-businesses-of-stiff-penalties-associated-with-online-reviews)). Efficacy reviews = drug claims. High if on product pages for Rx/unauthorized SKUs | 5 (22.5 · #3) | C, K |
| 4 | Trust signals + COA lot lookup | Trust | 19% abandon from distrust with card ([Baymard](https://baymard.com/lists/cart-abandonment-rate)) · Independent. Norton seal gave best sense of trust ([Baymard](https://baymard.com/blog/site-seal-trust)) · Independent survey. COA lookup lift: no study · Inference | Custom: lot number → certificate PDF from a named lab; Canadian return address; named owner; contact | $0 build; lab testing cost not researched | M | Med: false if not real ("Health Canada compliant", "99% purity" = FAIL). Only once COAs exist | 5 (18 · #4) | I |
| 5 | Page speed | Site | 0.1 s faster mobile = +8.4% retail conversions, +9.2% AOV · [Deloitte for Google](https://web.dev/case-studies/milliseconds-make-millions) · Independent (Google-funded). 1 s page = 2.5× conversion of 5 s · [Portent](https://www.portent.com/blog/analytics/research-site-speed-hurting-everyone.htm) · Industry study, correlational | Custom: static pages, lazy-load 3D, compress Higgsfield media, fast store path | $0 | M | Low | 5 (18 · #5) | none |
| 6 | Privacy-safe analytics / attribution | Measure | Enabler, not a lift. Risk precedent: GoodRx ~$1.5M, BetterHelp $7.8M for sharing health data with ad platforms ([DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2023/03/ftc-pixel-tracking-health-goodrx-betterhelp)) · Independent (FTC) | Cookieless analytics; no ad pixels on product/category pages; server-side events stripped of product names | Plausible $9–19/mo or free self-host ([Seline](https://seline.com/blog/plausible-analytics-pricing)); PostHog free tier. Skip Northbeam (~$1,500/mo) | S | Low cookieless; High if ad pixels see peptide views | 5 (18 · #6) | none |
| 7 | Guest checkout, 7–8 fields, account after purchase | Checkout | Forced account 18%, long checkout 17%; ideal 7–8 fields vs 14.88 US average; better checkout could lift large sites' conversion 35.26% · [Baymard](https://baymard.com/lists/cart-abandonment-rate) · Independent | Custom checkout UI on the chosen gateway; age + province gate kept (legal, not optional) | $0 build | M | Low | 5 (15 · #7) | P, K |
| 8 | Abandoned cart (email; SMS only if approved) | Recovery | Email RPR $6.77 (top 10% $13.70); SMS $4.48 · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · Vendor benchmark. Avg abandonment 70.22% · [Baymard](https://baymard.com/lists/cart-abandonment-rate) · Independent | Site fires Added to Cart / Started Checkout; backend fires Placed Order to stop flow; ESP sends | Klaviyo ~$100/mo at 5k profiles ([Charle](https://www.charle.co.uk/articles/klaviyo-pricing/), aggregator); Customer.io ~$100 at 5k ([Automation Atlas](https://automationatlas.io/answers/customer-io-pricing-explained-2026/)); free tier 250 profiles ([Klaviyo](https://www.klaviyo.com/pricing)) | M | Med: express unticked consent box needed for the full cadence; without it, at most one factual reminder after counsel sign-off | 4 (10 · #8) | E, C, K |
| 9 | Exit intent: "save my cart" card | Capture | No independent lift found. Addresses the 40%/19% reasons · Inference | Custom JS (desktop mouse-leave, phone scroll-up heuristic), frequency cap; exit-and-return-hooks skill | $0 | S | Low–Med: CASL consent on capture; no fake countdowns | 4 (9 · #9) | C (E to send) |
| 10 | Quantity breaks (same item ×2/×3/×5), no goal stacks | AOV | No independent lift found · Inference | Custom cart logic: tiered unit price by quantity | $0 | S | Low for neutral breaks. High for goal-named stacks. Price incentives on Rx/unauthorized SKUs = counsel Q2 | 4 (9 · #10) | C |
| 11 | Product finder (catalogue only; sample exists) | Discovery | No independent lift found · Inference | Extend existing custom 3-tap finder (product-finder-quiz skill); keep answers on-site | $0; Typeform $39–129/mo ([Jetadmin](https://www.jetadmin.io/blog/typeform-pricing/)); Octane AI $50–200 (Shopify-first) ([PricingSaaS](https://pricingsaas.com/companies/octaneai)) | S | Med: browsing preferences and budget only, never goals or health | 4 (9 · #11) | none |
| 12 | Welcome series (delivers 15% code) | Recovery | Email RPR $5.75 (top 10% $13.27); click 6.5% · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · Vendor benchmark | ESP flow triggered by sign-up with consent flag | Same ESP as #8 | M | Med: "longevity", "protocol" = FAIL; discount on Rx SKUs = counsel Q2 | 4 (8 · #12) | E, C |
| 13 | Express wallets (Apple/Google Pay) | Checkout | Shop Pay "up to 50%" vs guest checkout · [Shopify](https://shopify.com/solutions/shop-pay/enterprise) · Industry claim (vendor, unnamed study). No independent wallet study found | Turn on in the chosen gateway | Included with processor (fees not found) | S | Low content risk; High platform risk (dies with the processor) | 4 (8 · #13) | P |
| 14 | Replenishment reminders | Retention | No benchmark. Post-purchase RPR $1.80 as a proxy · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · Vendor benchmark | ESP flow timed from order history only ("It's been 60 days") | Same ESP | S | Med: "cycle", "daily", dose-based timing = FAIL | 3 (6 · #14) | E, K |
| 15 | Back-in-stock alerts | Recovery | No benchmark found · Inference | Custom "notify me" form (SKU + email + consent); inventory change triggers send | $0 + ESP or transactional sender | S | Low: person asked to be told; "healing peptide" = FAIL | 3 (6 · #15) | I, E |
| 16 | Honest stock line | Urgency | No lift study of truthful stock. Fake stock and timers are documented dark patterns (632 low-stock instances; 16 sites with fake counts) · [Princeton](https://webtransparency.cs.princeton.edu/dark-patterns) · Independent | Render real count from shared/inventory.js; hide when unknown (honest-urgency skill) | $0 | S | Low if real; High if not (Competition Act) | 3 (6 · #16) | I |
| 17 | Product Q&A | Discovery | No data · Inference | Static JSON of moderated, vetted answers (shipping, storage of sealed product, lab docs) | $0 | S | Med: dosing or "will it help me" questions routed away | 3 (6 · #17) | none |
| 18 | Wishlist / save for later | Retention | No data · Inference | localStorage + emailed "save my list" link (save-share-and-refer skill) | $0 | S | Low–Med: follow-up emails need consent | 3 (6 · #18) | none (E for emails) |
| 19 | VIP early drops | Retention | No data · Inference | Gated pages / member links sent N hours before public release | $0 + ESP | S | Low–Med: access reward, not price | 3 (6 · #19) | E, I |
| 20 | Loyalty / tiers (members' club + member cards exist) | Retention | Bain: 5% less defection = 25–85% more profit · [HBR 1990 via Forrester](https://www.forrester.com/blogs/profiting-from-post-sale-marketing) · Independent but contested ([Ipsos](https://www.ipsos.com/en-us/shattering-myths-customer-loyalty)). No feature lift study | Extend in-house club; reward access/status, not cash | $0 in-house; Smile.io free–$999; LoyaltyLion free–$199 or ~$400, headless API ([DejaOffice](https://www.dejaoffice.com/blog/2026/05/25/5-best-headless-loyalty-apis-for-custom-frontends-in-2026/)); Open Loyalty quote | M | Med: points on Rx items may be a pharmacy inducement (counsel) | 2 (4.5 · #20) | C (E for emails) |
| 21 | Referrals | Acquisition | No independent lift found · Inference | In-house code + server ledger; referrer shares own link | $0; ReferralCandy $39/mo + 10.5% success fee ([StackScored](https://www.stackscored.com/pricing/referral-marketing/)) | M | Med: CASL referral rule = one message, name the referrer ([SOR/2013-221](https://laws-lois.justice.gc.ca/eng/regulations/SOR-2013-221/page-1.html)); cash credit = inducement question | 2 (4.5 · #21) | C, K |
| 22 | Live chat / concierge (bot exists) | Support | One chat reply = ~50% more likely to convert (Intercom 2018, correlational) · [Social Intents](https://www.socialintents.com/blog/wp-json/wp/v2/posts/183) · Industry claim | Restrict existing bot (pep-concierge.js) to orders, shipping, lot certificates; human reply promise | $0 in-house. Intercom/Tidio/Gorgias 2026 prices not retrieved | M | Med for service-only. High if it recommends products. Intercom AUP bars medical advice ([Intercom](https://www.intercom.com/legal/acceptable-use-policy)) | 2 (4.5 · #22) | none |
| 23 | Win-back | Retention | Email RPR $0.82; click 2.8% · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · Vendor benchmark | ESP flow on lapsed buyers (<2 years = implied consent) | Same ESP | S | Med: "restart your cycle" = FAIL | 2 (4 · #23) | E, K |
| 24 | Post-purchase one-click add-on | AOV | Avg take 4.7%, top offers 28.3% · [ReConvert](https://reconvert.io/blog/the-impact-of-post-purchase-upselling-2023) · Vendor benchmark (Shopify only). Under 2% without true one-click · [Loopwork](https://www.loopwork.co/blog/cart-upsell-vs-post-purchase-upsell-one-click-upsell-shopify) · Industry claim | Needs a gateway that charges a saved card; thank-page offer: second vial same lot or gift card | Custom on gateway; Woo plugins from $69–79/yr if Woo ([CartMango](https://cartmango.com/woocommerce-upsell-plugin/)) | M | Med: never bac water or syringes (adjacency proves human use) | 2 (3 · #24) | P, K |
| 25 | A/B testing | Measure | Enabler. Google Optimize shut 30 Sep 2023 ([Google](https://support.google.com/analytics/answer/12979939?hl=en)) | Self-hosted flags/experiments once traffic allows | GrowthBook free self-host; PostHog free tier; Convert $299/mo ([TierGauge](https://tiergauge.pages.dev/tools/convert)) | M | Low self-hosted | 2 (3 · #25) | none |
| 26 | Personalization / recommendations | AOV | 10–15% revenue lift (large firms) · [McKinsey 2021 via Business Chief](https://businesschief.com/technology-and-ai/mckinsey-prioritise-personalisation-for-10-15-revenue-lift) · Industry claim (consultancy) | Hand-curated "often bought with" (never goal-named) beats ML at 28 SKUs · Inference | $0; Nosto ~$99/mo + 2.5–4% rev share ([Futurepicker](https://futurepicker.com/?p=2800)) | L | Med: browsing a peptide can be health-inferred data | 1 (2.7 · #26) | none |
| 27 | On-site search | Discovery | "Searchers convert 2–3×" is a misquote. Defensible: ~1.4–2.5× in vendor data, reflecting intent, not tool lift · [Econsultancy](https://econsultancy.com/four-reasons-why-site-search-is-vital-for-online-retailers/) · Industry claim | Skip at 28 SKUs; good category nav instead | Algolia Grow $0.50/1k searches over free tier ([Activepieces](https://www.activepieces.com/blog/algolia-pricing-2026-plans-costs-and-examples)) | M | Low (keep queries away from ad pixels) | 1 (1.5 · #27) | none |
| 28 | Subscribe & save / auto-ship | Retention | No lift figure. Wellness churn ~8.8%/month; ~61% of cancels at first 2 renewals · [RetainUp on Recharge 2026](https://retainup.co/recharge-subscription-trend-report-2026/) · Vendor benchmark (second-hand) | Processor's recurring billing + self-serve skip/cancel page + pre-renewal reminder | Shopify apps don't apply (Recharge $99+/mo, Loop, Skio). Non-Shopify billing prices not researched | L | Med–High: "daily" = dosing; auto-renewal rules (FTC ROSCA; Ontario 2023 Act not in force) ([Jones Day](https://www.jonesday.com/en/insights/2026/05/ftc-revives-clicktocancel-rule-new-risks-for-subscription-businesses)); discount on Rx = counsel | 1 (1.3 · #28) | P, E, C |
| 29 | Gift cards | AOV | No data · Inference | Custom balance ledger; no expiry, no dormancy fees (BC law) ([Consumer Protection BC](https://www.consumerprotectionbc.ca/consumer-help/consumer-information-gift-cards/)) | $0 build | M | Low if sold; Med if given free as a reward on Rx | 1 (1 · #29) | P |
| 30 | Multi-currency (CAD/USD) | Checkout | No data gathered · Inference | Display + settlement through processor | Processor-dependent | M | Med: US shipping raises FDA exposure (counsel Q1) | 1 (1 · #30) | P, C |
| 31 | Browse abandonment | Recovery | Email RPR $2.08; SMS $1.04 · [Klaviyo](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) · Vendor benchmark | ESP flow on Viewed Product + known email | Same ESP | M | **High (held):** naming an Rx peptide goes past name/price/quantity; emailing about pages viewed is health-inferred tracking | 2 cap (6 · #31 held) | E, C, counsel |

**SMS note.** Promotional SMS for the products is the riskiest channel. Carriers, Omnisend and Yotpo bar prescription-drug offers ([Omnisend](https://www.omnisend.com/legal/acceptable-use-policy/); [Yotpo](https://support.yotpo.com/shaft-and-prohibited-sms-content-in-the-us-canada)). Plan transactional SMS only (order confirmed, shipped) with consent taken at checkout.

---

## Top 10: build first

1. **All-in price everywhere.** Why: fixes the biggest abandonment reason (40%) and the law already requires it. First step: add shipping estimate + total to product cards and the cart drawer (checkout-closers skill).
2. **Free-shipping bar.** Why: lifts basket size at near-zero cost. Caveat: a threshold set too high can lose buyers. First step: pick two threshold options for the owner and build the bar to test both.
3. **Verified service reviews (store-level).** Why: strongest independent evidence on the list (Spiegel 270%), and the first 5 matter most. First step: write the moderation rules (below) and add a "review your delivery" email to the order-shipped message.
4. **COA lot lookup + true trust strip.** Why: hits the 19% distrust reason with proof competitors can't fake. First step: get one real lab certificate for one lot and build the lookup on that lot only.
5. **Page speed pass on the store path.** Why: independent data ties 0.1 s to +8.4% conversions. First step: measure the store and product pages on a phone and set a load budget for the 3D pieces.
6. **Privacy-safe analytics.** Why: you can't rank anything later without data, and ad pixels on peptide pages copy the GoodRx/BetterHelp pattern. First step: install Plausible (or self-host PostHog) with goals for add-to-cart and checkout start.
7. **Short guest checkout (design now, wire later).** Why: forced accounts (18%) and long forms (17%) are fixable. First step: lay out a 7–8 field checkout with the age + province gate, ready to drop onto whichever gateway is approved.
8. **Abandoned-cart flow with consent capture.** Why: highest-earning flow in Klaviyo's data. First step: add the unticked CASL consent box to every email field now; send for written ESP pre-approval in parallel.
9. **"Save my cart" exit card.** Why: catches leavers and grows the consented list with no vendor needed. First step: build it from the exit-and-return-hooks skill with the compliant copy.
10. **Quantity breaks (same item only).** Why: the cleanest way to raise order value without goal stacks. First step: build ×2/×3 pricing on one SKU and wait for counsel Q2 before applying it to Rx or unauthorized SKUs.

---

## Regulated-claims check on sample copy (coordinator, 2 Nov 2026)

Rule behind it: hedged or "research" framing is evidence of intended use, not a shield. Health Canada says "For Research Use Only" labels give no exemption, and FDA's Aug 2026 letters say the same. Delete the sentence; don't disclaim it.

| # | Feature | Typical big-store line (FAIL) | What it establishes | Compliant rewrite |
|---|---|---|---|---|
| 1 | Abandoned cart email | "Still thinking about BPC-157? Your recovery is waiting." | Outcome by implication ("recovery") | "Your cart is saved: BPC-157 10 mg, $[xx]. Pick up where you left off." |
| 2 | Bundles | "RECOVERY STACK: BPC-157 + TB-500, save 15%" | Goal-named set + "stack" = use instruction | "TB-500 10 mg × 3 · save [x]%" (same item, quantity break) |
| 3 | Subscribe & save | "Never run out of your daily NAD+. Subscribe and save 10%." | "daily" = frequency of use (dosing) | "Auto-ship every [30/60/90] days. Skip or cancel in one click. Save [x]%." |
| 4 | Replenishment | "Your 30-day cycle is almost done. Time to restock?" | "cycle" + consumption-based timing = use instruction | "It's been [60] days since your last order. Reorder in one tap." (timing from order history only) |
| 5 | Reviews | "'Knee pain gone in 2 weeks!' ★★★★★" | Efficacy testimonial; condition claim the store is liable for | Moderate to service only: "'Arrived in 3 days, well packed.'" |
| 6 | Back in stock | "BPC-157 is back: the healing peptide everyone wants." | "healing" = drug claim | "BPC-157 10 mg is back in stock. Lot [L-xxxx], certificate attached." |
| 7 | Low stock | "Only 3 left. Selling fast!" | Misleading unless real (Competition Act) | "[real count] in this lot." (hidden when no real data) |
| 8 | Post-purchase upsell | "Add bacteriostatic water + syringes for $9" | Adjacency proves intended human use with no words at all | Remove. Offer "Add a second vial from the same lot, [x]% off" or a gift card. |
| 9 | Quiz | "What's your goal? Fat loss / Muscle / Anti-aging" | Health/goal data + matching a product to a goal = claim | "What are you browsing? Single vials / Blends / New arrivals · Budget" |
| 10 | Loyalty | "Earn points on every order: your path to peak performance." | Outcome; points on Rx items = possible inducement | "Earn points on every order. [500] points = early access to new lots." |
| 11 | Welcome email | "Welcome to the future of longevity. 15% off your first protocol." | "longevity" outcome; "protocol" = use instruction | "Welcome to PEPTICITY. Your 15% first-order code: [CODE]." |
| 12 | Live chat | "Ask our peptide experts what's right for you." | Personal recommendation = advice; borrowed authority | "Questions about an order, shipping or a lot certificate? A person replies within [x] hours." |
| 13 | Trust badges | "Health Canada compliant · 99% purity · Doctor-trusted" | False authority and unverified claims | Only once real: "Lot certificate from [named lab] for every vial. Look up yours." |
| 14 | Referral | "Give $20, get $20. Share the gains." | "gains" outcome; cash credit = inducement question | "Share PEPTICITY. When a friend joins, you both get early access." |
| 15 | Win-back | "We miss you. Time to restart your cycle?" | "cycle" = use instruction | "It's been a while. Here's what's new in the store." |
| 16 | SMS | "Your peptides are ready to work for you 💪" | Outcome | "PEPTICITY: your cart is saved. [link] Reply STOP to opt out." |
| 17 | Gift card | "Give the gift of better health." | Health outcome | "Give a PEPTICITY gift card. Any amount." |

### The ceiling
- **Prescription Drug List products** (e.g. tirzepatide, HGH, tesamorelin): consumer advertising is limited to name, price and quantity (FDR C.01.044).
- **Unauthorized drugs** (most of the catalogue: BPC-157, TB-500, KPV and others named in Health Canada's advisories): there is no lawful claim layer at all. Any promotion that frames them for human use is the enforcement trigger (Canlab injunction, 2026).
- **So every feature here is only as legal as the product it sells.** The features amplify sales. For an unlawful SKU they also amplify exposure.
- **Safe to say:** what it is (name, size), price in CAD, real stock, lot number and certificate (once real), shipping, returns, contact, order status. Store mechanics: cart saved, auto-ship cadence the buyer picks, points for access, gift cards.
- **Banned-phrase audit list (use as a lint check on all flow copy):** heal, healing, recovery (as an outcome), repair, boost, burn, fat loss, lean, muscle, gains, performance, longevity, anti-aging, reverse, restore, support(s), promote(s), improve(s), enhance(s), optimize, may help, studied for, investigated for, explored for, protocol, cycle, stack, dose, dosing, dosage, daily, reconstitute, mix, inject, syringe, bac water, research use only, not for human consumption, clinically proven, doctor recommended, Health Canada approved/compliant, pharmaceutical grade, safe, no side effects, guaranteed, hurry, selling fast, only X left (unless real), X people viewing.
- Screenshot and date-stamp each published site state.

### Review moderation rules (my inference, not regulator text)
- Verified buyers only.
- Allow service, shipping, packaging, documents, customer care.
- Reject or redact outcomes, conditions, body changes, doses and protocols.
- Publish negative reviews on the same rules. Suppressing them selectively is misleading.
- No reward for a positive review. Disclose any reward for leaving a review.
- Staff must disclose. Photos of product and packaging only.

### Counsel questions (these gate the work)
1. **(Coordinator)** Can PEPTICITY lawfully sell and advertise each SKU in Canada, and ship to the US? This gates every feature, the payment processor and the email/SMS platform.
2. **(Coordinator)** Are price incentives allowed on any SKU that is a prescription drug or an unauthorized drug? This covers the 15% code, quantity breaks, the subscribe-and-save discount, points and referral credit (C.01.044 price-only rule; provincial inducement rules).
3. *(Added from the notes)* Does starting a checkout create a CASL "inquiry" (6-month implied consent), so one factual cart reminder can go to someone who did not tick the box?
4. *(Added)* Can customer reviews appear on product pages for Rx or unauthorized SKUs, or only store-level service reviews? No Canadian regulator text on this was found.
5. *(Added)* Which auto-renewal and cancellation rules apply to a BC seller shipping across Canada (BC distance-sales rules, Quebec)? These weren't researched.

---

## Owner decisions (multiple choice)

1. **Counsel timing.**
   - A) Book counsel now and build only vendor-free features until answers land. **(Recommended)**
   - B) Build everything now and fix later.
   - C) Skip counsel.
2. **Catalogue scope online.**
   - A) Keep the full catalogue and accept fragile payments.
   - B) Sell online only the SKUs counsel clears. **(Recommended)**
   - C) Move Rx items to a licensed pharmacy/clinic partner model (the only card-compliant path found).
3. **Payments approach.**
   - A) A processor that approves the catalogue in writing, after full disclosure. **(Recommended)**
   - B) Interac e-Transfer as an interim (no wallets, no upsells, no subscriptions).
   - C) Stripe/Shopify Payments and hope (not advised: likely freeze plus held funds).
4. **Email platform.**
   - A) Ask Klaviyo and Customer.io for written pre-approval this week; use whichever says yes. **(Recommended)**
   - B) Self-built flows on a developer sender (check its AUP first).
   - C) Brevo (excluded by its own policy).
5. **SMS.**
   - A) Transactional only (order and shipping). **(Recommended)**
   - B) Promotional too.
   - C) None.
6. **Discounts on Rx/unauthorized SKUs** (15% code, quantity breaks).
   - A) Hold until counsel Q2. **(Recommended)**
   - B) Apply only to cleared non-Rx items.
   - C) Apply to all now.
7. **Reviews.**
   - A) Store-level service reviews only. **(Recommended)**
   - B) Moderated product reviews.
   - C) No reviews.
8. **Loyalty rewards.**
   - A) Access and status only: early lots, member drops. **(Recommended)**
   - B) Points redeemable for dollars.
   - C) Both.
9. **Free-shipping threshold.**
   - A) Test two thresholds. **(Recommended)**
   - B) One fixed threshold.
   - C) Always free.
10. **Analytics.**
    - A) Plausible, cookieless. **(Recommended)**
    - B) Self-hosted PostHog.
    - C) GA4 + Meta pixel (not advised: health-data sharing risk).
11. **Concierge bot.**
    - A) Orders, shipping and lot certificates only, with a human reply. **(Recommended)**
    - B) Answers product questions.
    - C) Remove it.
12. **US shipping at launch.**
    - A) Canada only. **(Recommended)**
    - B) Ship to the US.
13. **Subscribe & save.**
    - A) Defer until the processor is approved and counsel answers. **(Recommended)**
    - B) Build now.

---

## Conclusion

- The real constraint is permission, not features. A big store adds apps to squeeze out a few points. PEPTICITY's first job is to make sure the processor, email platform and law let the store exist at all.
- That flips the usual build order. The vendor-free, evidence-backed basics (price, proof, speed, short checkout) should ship first. They work under any processor, carry low compliance risk, and don't vanish if an account is closed.
- The biggest open question is not technical. Counsel's answer on which SKUs can be sold and discounted decides whether flows, loyalty and subscriptions are growth tools or exposure multipliers.
- Gaps to close before spending:
  - non-Shopify subscription billing prices
  - chat-tool prices
  - AUPs for Customer.io, Postmark/SES, the review and quiz vendors
  - Square, PayPal and Moneris terms
  - any independent lift data for quizzes, bundles and exit intent (none exists in the notes)

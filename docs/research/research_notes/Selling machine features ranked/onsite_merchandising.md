# On-site Merchandising and Optimization Features (PEPTICITY, Nov 2026)

Scope: 10 on-site features for a small Canadian DTC peptide store on a custom static build (platform undecided). Research date: 2 Nov 2026. Source labels used throughout: [ACADEMIC] peer-reviewed or university research; [A/B] published controlled test; [VENDOR] vendor's own benchmark or case study; [INDUSTRY] blog/aggregator claim with no traceable method; [OFFICIAL] regulator or vendor policy/pricing page.

Important caveat on pricing: almost every price below comes from third-party pricing trackers dated Apr to Sep 2026, not from vendor pages fetched today. Where trackers disagree, both numbers are shown. Confirm on the vendor page before budgeting.

## Q1. What are the real published numbers (not vendor marketing) for each feature?

### Takeaway
Very little independent evidence exists for any of these features. The only solid outside numbers are: Baymard (extra costs are the top cart-abandonment reason), academic shipping-fee work (thresholds can raise basket size but can also cut purchase rate and raise returns), McKinsey's 10-15% personalization lift (a consultancy figure, not a controlled study), and Princeton's dark-pattern study (fake urgency is common and detectable). Most "lift" numbers for upsells, chat, quizzes, bundles and exit popups are vendor case studies.

### Cited Findings

**1. Bundles / build-your-own / quantity breaks**
- No independent or academic lift figure for bundles or quantity breaks was found in this pass. (See Gaps.)
- Compliance context (from brief, not re-verified here): goal-named bundles such as "Recovery Stack" are banned for PEPTICITY; neutral quantity breaks (same product, 2/3/5 units) are the safe form.

**2. Post-purchase one-click upsell and cart add-ons**
- [VENDOR] ReConvert's 2023 report (40,000+ merchants, all Shopify): average one-click upsell conversion 4.7%; top offers 28.3% — [ReConvert](https://reconvert.io/blog/the-impact-of-post-purchase-upselling-2023)
- [INDUSTRY] Blogs cite 10-15% take rate for "well-optimised" thank-you-page offers (attributed to Yotpo) and a "Focus Digital" study of 1,847 businesses at 14.6%; the Focus Digital study could not be traced and is described inconsistently (physical vs digital businesses). Treat as unverified — [Digital Applied](https://www.digitalapplied.com/blog/post-purchase-upsell-thank-you-page-2026-ecommerce-playbook); [GrowthSuite benchmarks](https://www.growthsuite.net/resources/shopify-upsell-cross-sell/complete-guide/benchmarks)
- [INDUSTRY] Without true one-click acceptance (card re-entry needed), take rates are said to fall to under 2% — [Loopwork](https://www.loopwork.co/blog/cart-upsell-vs-post-purchase-upsell-one-click-upsell-shopify)
- No AfterSell- or Zipify-specific published benchmark found.

**3. Free-shipping progress bar**
- [INDUSTRY/survey, Baymard] 39% of users abandoned checkout because of extra costs (shipping, tax, fees) per Baymard's own page; a Feb 2024 Baymard US survey is reported at 48% — [Baymard](https://baymard.com/blog/reduce-cart-abandonment); [eMarketer](https://www.emarketer.com/content/extra-costs-are-the-top-reason-consumers-abandon-online-carts). Note: the two figures conflict; 39% is the one on Baymard's site.
- [ACADEMIC] Lewis, Singh & Fay, Marketing Science (2006): shipping-fee schedules change order incidence and basket size, but lost shipping revenue and non-response of several segments made such promotions unprofitable for the retailer studied — [INFORMS](https://pubsonline.informs.org/doi/fpi/10.1287/mksc.1050.0150)
- [ACADEMIC, working paper] Chen & Ngwe (HBS): contingent free shipping increases basket size as shoppers top up to the threshold — [HBS Working Knowledge](https://hbswk.hbs.edu/item/shipping-fees-and-product-assortment-in-online-retail)
- [ACADEMIC, randomized field experiment] "Shipping fee schedules and return behavior" (Marketing Letters, 2019): 7 randomised fee structures; threshold free shipping **decreased purchase incidence (not purchase value)** and raised strategic returns — [Scinapse](https://scinapse.io/papers/2939285397)
- No published lift figure for the progress *bar* UI itself (as opposed to the threshold policy) was found.

**4. Honest urgency / low-stock**
- [ACADEMIC] Mathur et al., "Dark Patterns at Scale" (ACM CSCW 2019, Princeton/UChicago): crawl of ~53K product pages on ~11K sites found 1,818 dark-pattern instances on 1,254 sites; low-stock messages were the most common (632 instances, 581 sites); countdown timers 393 instances on 361 sites, some resetting on reload; on 16 sites stock numbers were entirely fake, decreasing on a fixed schedule — [Princeton WebTAP](https://webtransparency.cs.princeton.edu/dark-patterns); [UChicago News](https://news.uchicago.edu/story/dirty-tricks-online-shopping-designed-make-you-spend-more)
- No independent lift study of *truthful* low-stock messaging found.

**5. Product finder quiz**
- No independent or published A/B lift number found in this pass; only vendor marketing (Octane AI etc.). (See Gaps.)

**6. Live chat / AI concierge**
- [INDUSTRY attributed to VENDOR] Intercom (2018) is cited as saying one chat reply makes a visitor ~50% more likely to convert; this is vendor-reported, correlational — [Social Intents](https://www.socialintents.com/blog/wp-json/wp/v2/posts/183)
- [VENDOR case studies] LiveChat: 485% conversion lift for AutoAccessoriesGarage; Jerome's Furniture "10x higher conversions" among chat users — single-firm, uncontrolled, self-selected — [casestudies.com](https://www.casestudies.com/company/livechat/case-study/autoaccessoriesgaragecom-gets-485-conversion-boost-with-livechat); [casestudies.com](https://www.casestudies.com/company/livechat/case-study/jeromes-furniture-sees-10x-times-better-conversion-after-implementing-livechat)
- [VENDOR survey] Bold Software: 55% of respondents said proactive chat converted better than visitor-initiated chat (self-reported) — [CustomerThink](https://customerthink.com/?p=66683)
- [INDUSTRY] Chat set up badly can decrease conversion — [Inflow](https://www.goinflow.com/live-chat-ecommerce-conversion/)
- [ACADEMIC, non-randomised] Hochschule Düsseldorf 2017 thesis on live chat and purchase decisions compares users vs non-users (76 users, 105 offered-but-declined); not an experiment — [HSD OPUS](https://opus4.kobv.de/opus4-hs-duesseldorf/frontdoor/index/index/year/2017/docId/838)
- No randomised field experiment on chat-to-conversion found.

**7. On-site search ("searchers convert 2-3x")**
- [INDUSTRY → Econsultancy blog] The original Econsultancy article found says conversion via site search "can be up to 50% higher than average", and separately attributes a "2-3x" lift to *adding predictive text and thumbnails to search* — not to searchers vs non-searchers. So the widely repeated "searchers convert 2-3x" claim is a misquote of a narrower Econsultancy line — [Econsultancy](https://econsultancy.com/four-reasons-why-site-search-is-vital-for-online-retailers/)
- [INDUSTRY] Other attributed figures: searchers 4.63% vs site 2.77% (~1.7x, attributed to Econsultancy); Screen Pages study 2.4% vs 1.7% (~1.4x); Constructor ~2.5x (vendor) — collected in [Opensend](https://www.opensend.com/post/on-site-search-conversion-rate-statistics-ecommerce) and [Hello Retail](https://helloretail.com/en/blog/2026-02-24-ecommerce-search-statistics/). These are inconsistent and mostly vendor-sourced.
- Inherent bias: searchers are self-selected high-intent visitors, so the gap is correlation, not lift from adding a search tool (see Inferences).

**8. Personalization / recommendations**
- [CONSULTANCY report, not controlled study] McKinsey "Next in Personalization 2021": personalization "most often drives 10 to 15 percent revenue lift", with company-specific results 5-25% by sector and execution; fast growers derive 40% more revenue from personalization than slower peers — [Business Chief summary](https://businesschief.com/technology-and-ai/mckinsey-prioritise-personalisation-for-10-15-revenue-lift); [McKinsey PDF mirror](https://assets.super.so/f7785043-6038-445b-9b2a-38bfd53ed1b8/files/ddb8c26b-0d4c-40bd-ac63-ea1f94dbf3b6/the-value-of-getting-personalization-right-or-wrong-is-multiplying.pdf). This is from large companies with large data; not specific to a small catalogue.

**9. A/B testing**
- [OFFICIAL] Google Optimize and Optimize 360 shut down 30 Sep 2023; Google points users to third-party A/B tools integrated with GA4 — [Google Support](https://support.google.com/analytics/answer/12979939?hl=en)
- No lift number applies (testing is the measurement tool, not a lift feature).

**10. Analytics / attribution and health-data privacy**
- [OFFICIAL/legal] FTC v. GoodRx (2023): ~$1.5M penalty under the Health Breach Notification Rule and ban on sharing health data with third parties for ads; FTC v. BetterHelp (2023): $7.8M returned to consumers for sharing health data with Facebook/Snapchat for ads — [Davis Wright Tremaine](https://www.dwt.com/blogs/privacy--security-law-blog/2023/03/ftc-pixel-tracking-health-goodrx-betterhelp); [Fierce Healthcare](https://www.fiercehealthcare.com/health-tech/teladoc-owned-betterhelp-pay-78m-users-alleged-data-misuse-ftc-order)
- [Legal commentary] Firms advise disabling or reconfiguring pixels on health-related pages; hashed data can still be re-identified — [Perkins Coie](https://perkinscoie.com/insights/blog/ftcs-second-settlement-weeks-highlights-scrutiny-businesses-processing-health-data)

**11. Exit-intent overlays**
- No independent or published A/B lift figure found in this pass. (See Gaps.)

### Inferences
- Rank by strength of evidence (not by size of claimed lift): free-shipping threshold/bar (Baymard + academic, but mixed direction) > personalization (McKinsey, large-company) > honest urgency (evidence is about what NOT to do) > search > upsell (one large vendor dataset) > chat > quiz/bundles/exit-intent (vendor only).
- The 2019 randomised field experiment suggests a free-shipping threshold set too high can cut the number of buyers; for a new store, test the threshold rather than assume a lift.
- "Searchers convert 2-3x" should not be quoted as fact; the defensible statement is "searchers convert at roughly 1.4-2.5x the site average in vendor and industry data, but this reflects visitor intent, not tool lift."
- For a catalogue of ~28 products, search and ML personalization have little to work with; simple hand-curated "often bought together" (non-goal-named) and good category navigation likely deliver most of the value at near-zero cost.

### Gaps
- No independent study found for bundles, quantity breaks, product quizzes or exit-intent overlays. Only vendor claims exist (not collected in detail because they are vendor marketing).
- Could not retrieve the original McKinsey 2021 report page directly; numbers come from a McKinsey-branded PDF mirror and press summaries.
- Did not retrieve the full text of the Marketing Letters 2019 paper for exact effect sizes.
- No published A/B on the free-shipping progress bar UI itself.

## Q2. Which tools work on a custom/headless site and what do they cost now?

### Takeaway
Shopify-only apps (Rebuy appears Shopify-only; AfterSell, ReConvert, Zipify OCU are Shopify post-purchase apps) are out unless the platform becomes Shopify. Headless-capable options: Algolia (search), Nosto (personalization, custom quote), GrowthBook / PostHog / Convert / VWO (testing), PostHog / Plausible / GA4 (analytics), Typeform or a custom quiz, Intercom / Tidio / Zendesk (chat). Post-purchase one-click upsell off Shopify needs a payment processor that can charge a saved card (e.g., Stripe) or a WooCommerce plugin.

### Cited Findings

**Bundles / quantity breaks**
- Build: on a custom site this is cart logic (tiered unit price by quantity) in your own code or checkout provider; no tool cost needed. (Inference; no source needed for a build approach.)

**Post-purchase upsell / cart add-ons**
- AfterSell, ReConvert, Zipify OCU: Shopify-only post-purchase apps (ReConvert dataset is Shopify merchants) — [ReConvert](https://reconvert.io/blog/the-impact-of-post-purchase-upselling-2023)
- Rebuy: reported as Shopify-only ("WooCommerce, BigCommerce, headless builds? Not an option") — [eCommerce Fastlane](https://ecommercefastlane.com/best-rebuy-alternative-for-ecommerce-personalization/). Rebuy price claims conflict: $25/mo entry vs $99 Starter and $749/mo higher tier — [Zigpoll](https://www.zigpoll.com/content/rebuy-alternatives-shopify-personalization-apps-compared); [CartHook](https://carthook.com/blogs/compare/shopify-upsell-and-cross-sell-apps-limespot-personalizer-vs-rebuy-personalization-engine)
- WooCommerce equivalents: CartFlows (prices conflict across 2026 sources: Free/Pro from $79/yr; $99 Starter / $199 Pro; older $299/yr) and WooCommerce One Click Upsell Funnel by MakeWebBetter (Free / Pro from $69/yr) — [WPCrafter](https://www.wpcrafter.com/review/cartflows/); [CartMango](https://cartmango.com/woocommerce-upsell-plugin/); [Business Bloomer](https://www.businessbloomer.com/woocommerce-upsell-order-bump-plugins/)
- One-click upsells require a gateway that charges a stored card; free plugins usually support Stripe only — [CartMango](https://cartmango.com/woocommerce-upsell-plugin/)

**Free-shipping progress bar**
- Build: a few lines of JS in the cart drawer reading cart subtotal vs threshold; no tool needed. (Inference.)

**Honest urgency / low-stock**
- Build: render stock count from real inventory data only (the project has shared/inventory.js); no tool needed. (Inference.)

**Product finder quiz**
- Octane AI: pricing page says pay per quiz engagement + AI usage, 14-day trial, enterprise from $500+/mo; trackers list Basic $50 (400 credits, 2 quizzes) and Plus $200; 1 credit = 1 engagement — [Octane AI pricing](https://octaneai.com/pricing); [PricingSaaS](https://pricingsaas.com/companies/octaneai). Octane is built primarily for Shopify (not verified for headless in this pass).
- Typeform (works anywhere via embed): mid-2026 sources report Basic $39/mo ($28 annual), Plus $79 ($56), Business $129 ($91), Free 10 responses/mo; lower 2023-era figures still circulate — [Jetadmin, Sep 2026](https://www.jetadmin.io/blog/typeform-pricing/); [Frontdesk Review, Jun 2026](https://frontdeskreview.com/software/form-builders/typeform/)
- Custom: a 3-tap catalogue finder in plain JS from inventory fields costs nothing and keeps answers off third-party servers (Inference; project already has a product-finder-quiz skill).

**Live chat / AI concierge**
- Intercom, Tidio, Gorgias: current 2026 list prices not retrieved in this pass (see Gaps). Gorgias's SMS/voice runs on Twilio and inherits Twilio's AUP — [Gorgias SMS policy](https://docs.gorgias.com/en-US/sms-policy-306653)

**On-site search**
- Algolia Grow: $0.50 per 1,000 searches beyond free allowance; 10,000 searches and 100,000 records included; extra records $0.40/1,000; Grow Plus overage disputed ($0.75 vs $1.75/1,000); Elevate/Enterprise quoted. Algolia expanded plans Oct 2025 — [Activepieces, 2026](https://www.activepieces.com/blog/algolia-pricing-2026-plans-costs-and-examples); [AddSearch](https://www.addsearch.com/blog/algolia-alternatives/); [BusinessWire Oct 2025](https://www.businesswire.com/news/home/20251001837933/en)
- Searchanise: bills by product count, not searches; tier figures not found — [WiserReview, Jul 2026](https://wiserreview.com/blog/searchanise-alternatives/)
- Klevu: no public base price; one third-party estimate says a full deployment runs "well past $1,600/month" — [WiserReview](https://wiserreview.com/blog/searchanise-alternatives/)

**Personalization / recommendations**
- Nosto: no public pricing; reported $99/mo "Incubator" entry, then revenue share 2.5-4% of Nosto-attributed sales; ~$500/mo estimate for small stores — [Futurepicker](https://futurepicker.com/?p=2800); [PersonalizerAI](https://personalizerai.com/blog/best-nosto-alternatives-for-shopify)
- LimeSpot: own support page describes plans from $19/mo based on LimeSpot performance; trackers cite $9.99 Turbo / $18 Essentials / $50 Max; non-Shopify pricing not confirmed — [LimeSpot support](https://support.limespot.com/en/articles/5716048-how-does-limespot-s-pricing-work); [CartHook](https://carthook.com/blogs/compare/shopify-upsell-and-cross-sell-apps-limespot-personalizer-vs-rebuy-personalization-engine)

**A/B testing**
- GrowthBook: free open-source self-host; cloud quoted at $20/seat/mo (Fungies) or $40/seat/mo (Koji) — conflicting — [Koji](https://www.koji.so/blog/best-ab-testing-tools-2026); [Fungies](https://fungies.io/best-ab-testing-tools-saas-2026/)
- PostHog: usage-based with free tier (~1M events/mo free cited); experiments bundled with analytics and flags — [Koji](https://www.koji.so/blog/best-ab-testing-tools-2026)
- Convert: Growth $299/mo (annual) or $399/mo ($3,588/yr) for 100K monthly tested users — [TierGauge](https://tiergauge.pages.dev/tools/convert); [Convert blog](https://www.convert.com/blog/optimization-tools/top-vwo-alternatives/)
- VWO: quote-based; reports range from "from $173/mo" to Growth $665/mo at 100K MTU from in-app checkout — [Mida](https://mida.so/blog/how-much-is-vwo); [Fungies](https://fungies.io/best-ab-testing-tools-saas-2026/)

**Analytics / attribution**
- Plausible: Starter $9/mo (10k pageviews), Growth $14, Business $19, Enterprise custom; ~17% annual discount; free self-hosted AGPLv3 version — [Seline](https://seline.com/blog/plausible-analytics-pricing); [Toolpick](https://www.toolpick.dev/pricing/plausible)
- Triple Whale: pricing page no longer shows prices; GMV-based; reports of free plan and $100-129/mo entry — [Venon](https://venon.io/blog/triple-whale-pricing); [Attribuly](https://attribuly.com/blogs/triple-whale-pricing-review/). Primarily a Shopify tool (listed on Shopify App Store) — [Shopify App Store](https://apps.shopify.com/triplewhale-1)
- Northbeam: Starter from ~$1,500/mo, Professional ~$2,500/mo (above Starter are community estimates); Feb 2026 top-tier increase reported — [Eightx](https://eightx.co/blog/compare/how-much-does-northbeam-cost); [CostBench](https://costbench.com/changelog/northbeam-price-increase-2026-02/)

**Exit-intent overlays**
- Build: mouseleave-top on desktop + scroll-up/back heuristics on phone in plain JS (project has an exit-and-return-hooks skill). Tool pricing not researched in this pass.

### Inferences
- At PEPTICITY's size, Triple Whale and Northbeam are overkill (Northbeam ~$18k/yr minimum) and are ad-pixel-centric, which conflicts with the no-health-data-to-pixels rule.
- Cheapest compliant stack: custom code for bundles/quantity breaks, shipping bar, honest stock, quiz and exit card; Plausible ($9-19/mo) or self-hosted PostHog for analytics; GrowthBook self-hosted (free) or PostHog experiments for A/B; skip Algolia/Nosto until catalogue and traffic justify it.
- Post-purchase upsell off Shopify is feasible only if checkout runs on Stripe (saved payment method) or WooCommerce plugins; a static site with a hosted checkout may not support it at all.

### Gaps
- Current list prices for Intercom, Tidio, Gorgias and Zendesk were not retrieved (tool-call budget).
- No vendor price page was fetched directly; all prices are third-party trackers dated 2026.
- Searchanise and Klevu tier prices unavailable; Klevu figure is a single third-party estimate.
- Headless support for Octane AI and LimeSpot not confirmed.

## Q3. Do any of these vendors' acceptable-use policies exclude peptide / unapproved-drug sellers?

### Takeaway
None of the policies checked names peptides or unapproved drugs explicitly. Intercom's AUP (effective 6 Oct 2025) bars its AI products from giving medical advice or being used in healthcare settings where inaccurate output could harm health — directly relevant to an AI peptide concierge. Gorgias SMS/voice inherits Twilio's AUP. Other platforms in the stack (e.g., ActiveCampaign, Amazon Pay) DO ban drugs or FDA-unapproved products, showing the risk is real and must be checked vendor by vendor.

### Cited Findings
- [OFFICIAL] Intercom AUP, effective 6 Oct 2025: no clause on drugs, pharmaceuticals or supplements; AI Products may not be used "To provide any financial, legal, medical or other professional advice", "In a manner that constitutes use as a medical device", for "high-risk" AI uses, or "in a healthcare setting where the potential inaccuracy of the Output may lead to adverse health related consequences" — [Intercom AUP](https://www.intercom.com/legal/acceptable-use-policy)
- [OFFICIAL] Tidio AI Fair Use Policy: bars unlawful use; no drug-specific clause seen in excerpt — [Tidio](https://help.tidio.com/hc/en-us/articles/9534931355164-Tidio-AI-Terms-and-Fair-Use-Policy)
- [OFFICIAL] Gorgias SMS and voice are governed by Twilio's AUP and content policy; violations deactivate the service — [Gorgias SMS policy](https://docs.gorgias.com/en-US/sms-policy-306653); [Gorgias phone policy](https://docs.gorgias.com/en-US/phone-policy-296982)
- [OFFICIAL, comparison] ActiveCampaign AUP prohibits drugs "whether available only by prescription or over-the-counter, or any other product that claims to diagnose, cure, treat, or prevent a disease" — [ActiveCampaign AUP](https://www.activecampaign.com/acceptable-use-policy)
- [OFFICIAL, comparison] Amazon Pay prohibits non-prescription drugs not FDA-approved for OTC sale — [Amazon Pay](https://pay.amazon.com/help/6023)

### Inferences
- "Unlawful use" clauses (Tidio, Intercom) could be invoked against a seller of products Health Canada says are unauthorized; the risk depends on PEPTICITY's legal status, not explicit wording.
- An AI concierge on Intercom Fin must refuse dosing/medical questions to stay within Intercom's AUP — this aligns with PEPTICITY's own no-health-claims rule.
- Self-hosted tools (GrowthBook, PostHog self-host, Plausible self-host, custom quiz) carry no vendor AUP risk and keep data off third-party servers.

### Gaps
- Did not read AUPs for Algolia, Nosto, LimeSpot, Octane AI, Typeform, Zendesk, VWO, Convert, PostHog Cloud, Plausible Cloud, Triple Whale, Northbeam, or Twilio's full content policy (budget). These should be checked before signing up.
- Payment processor restrictions (Stripe restricted-business list etc.) are outside this scope but likely the bigger gate for one-click upsells.

### Compliance risk per feature (summary, from brief rules + findings above)
- Bundles: HIGH if goal-named; LOW for neutral quantity breaks.
- Post-purchase upsell: MEDIUM — offers must not pair products by goal or offer dosing supplies; depends on saved-card processor accepting the business.
- Free-shipping bar: LOW — must show all-in price (drip pricing rules).
- Urgency/low-stock: HIGH if any number is not real (Mathur et al. shows fake stock/timers are a recognised dark pattern); LOW if tied to live inventory.
- Quiz: MEDIUM — must ask catalogue preferences only, never health/goals; third-party quiz tools store answers off-site.
- Chat/AI concierge: HIGH — medical-advice ban in Intercom AUP; transcripts are health-adjacent data.
- Search: LOW — but search queries (e.g., symptom words) are health-adjacent and should not go to ad pixels.
- Personalization: MEDIUM — browsing a peptide category can itself be health-inferred data.
- A/B testing: LOW with self-hosted tools.
- Analytics: HIGH if ad pixels receive product/category views (GoodRx/BetterHelp precedent); LOW with cookieless Plausible or self-hosted PostHog and server-side tagging that strips product data.
- Exit intent: LOW-MEDIUM — no fake countdowns; CASL consent on email capture.

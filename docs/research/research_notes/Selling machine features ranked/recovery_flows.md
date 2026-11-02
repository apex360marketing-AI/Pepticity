# Recovery and lifecycle flows (email + SMS) for PEPTICITY, as of 2 Nov 2026

Scope: abandoned cart, browse abandonment, exit-intent capture, welcome, post-purchase, replenishment, win-back, back-in-stock, VIP early drop. Canada-first. Every number has a source and a label: **[VENDOR BENCHMARK]** (vendor's own customer data), **[INDEPENDENT]** (third-party research), **[STATUTE]** (law text), **[POLICY]** (vendor terms), **[AGGREGATOR]** (third-party pricing or review site, lower confidence), **[VENDOR CLAIM]** (vendor advice or illustration, not data).

---

## Q1. Which email/SMS platforms will actually accept a peptide store? (acceptable use policies)

### Takeaway
This is the deciding factor, more than price or features. **Brevo bans peptide products outright by name, including those labelled "research use only."** **Omnisend bans "drugs for research purposes" and bans prescription drugs over SMS.** **Klaviyo restricts "pharmaceutical products" and "prescription medications."** **Mailchimp says "pharmaceutical products" may not be allowed.** US SMS carriers (via Twilio) reject 10DLC campaigns that market prescription drugs. On current policy text, none of the mainstream e-commerce ESPs can be assumed safe for PEPTICITY's catalogue. Ask each vendor for **written pre-approval** before building, and plan for an account to be shut down.

### Cited Findings
- **Brevo [POLICY], strongest ban found.** Section D.2, "Content, products, or services not accepted regardless of legality": "Peptide-based products for injectable or oral human therapeutic, weight-loss, or performance use (e.g. GLP-1 analogues, growth hormone peptides), including those labeled "research use only", whether or not sold under prescription or legal in the recipient's jurisdiction." The page shows no last-updated date (retrieved 2 Nov 2026). — [Brevo Anti-spam / Acceptable Use Policy (Appendix 7)](https://www.brevo.com/legal/antispampolicy/)
- **Omnisend [POLICY], last updated 30 Apr 2026.**
  - §3.2.1 prohibits promoting: "Unauthorized, counterfeit, or illegally distributed pharmaceutical products, and prescription medications (including but not limited to drugs for research purposes)".
  - It also says: "Omnisend also reserves the right to evaluate and restrict any use cases related to illegal or controlled substances".
  - §4.4: SMS/MMS "may not contain: … Prescription medications".
  - §4.1 requires "prior express written consent" for SMS. — [Omnisend Acceptable Use Policy](https://www.omnisend.com/legal/acceptable-use-policy/)
- **Klaviyo [POLICY], last updated 9 Apr 2026.**
  - Restricted offerings include "Prescription medications, pharmaceutical products or services, medical therapies" (the list goes on to telehealth).
  - Klaviyo will "evaluate and restrict any use cases related to illegal or controlled substances".
  - For US/Canada short codes and toll-free numbers, messages about "Illegal substances (federal, state, or in any message recipient's jurisdiction)" are strictly prohibited, naming CBD, cannabis, THC, kratom and vaping.
  - Peptides and "research chemicals" are not named. — [Klaviyo Acceptable Use Policy](https://www.klaviyo.com/legal/acceptable-use-policy)
- **Mailchimp [POLICY], last updated 26 Sep 2025.**
  - "Pharmaceutical products" is listed as content that may not be allowed.
  - "Nutritional, herbal, and vitamin supplements" are subject to additional scrutiny.
  - "Illegal goods or services" are prohibited.
  - Peptides are not named. — [Mailchimp Acceptable Use Policy](https://mailchimp.com/legal/acceptable_use/)
- **Twilio carrier rule (US A2P 10DLC) [POLICY].** Error 30941 reads: "Your A2P 10DLC campaign was rejected because it contains content related to prescription drug marketing or controlled substances." It covers direct-to-consumer pharma marketing and online or mail-order pharmacies. Rejected campaigns cannot be resubmitted. Transactional messages "may be permissible under a different campaign use case." Page modified 27 Oct 2026. — [Twilio error 30941](https://www.twilio.com/docs/api/errors/30941)
- **Other SMS vendors (secondary).** Yotpo says it does not onboard brands selling prescription medication for SMS marketing at all. Several US/Canada SMS providers bar offers for drugs that cannot be sold over the counter in the US or Canada. — [Yotpo SHAFT and prohibited SMS content](https://support.yotpo.com/shaft-and-prohibited-sms-content-in-the-us-canada); [Avochato forbidden SMS categories US/Canada](https://help.avochato.com/compliance/forbidden-sms-and-mms-categories-in-us-and-canada)

### Inferences
- PEPTICITY's products are mostly Schedule/Rx peptides or unauthorized products in Canada (see the peptide-regulatory skill). They fall squarely inside Brevo's ban, very likely inside Omnisend's §3.2.1 ("research purposes") and §4.4, and inside Klaviyo's "pharmaceutical products" restriction. Expect any of these accounts to be suspended once reviewed, which would cut off every flow at once.
- **SMS marketing of the products themselves is the highest-risk channel.** Carrier rules, not just the ESP, block prescription-drug marketing. Transactional SMS (shipping, order confirmations) is more likely to be accepted than promotional SMS.
- Practical options: (a) get written pre-clearance from a vendor's trust/compliance team; (b) use a developer-first sender (e.g. Postmark, SES, SendGrid) with self-built flow logic, then check *their* AUPs too (not researched here); (c) keep promotional copy product-name-free, but that is still not guaranteed to pass, since Brevo's ban is on the industry, not the wording.

### Gaps
- **Postscript and Attentive AUP text not retrieved.** Postscript's legal URLs returned 404; Attentive's only located policy was its Email AUP, which has no drug clause. Neither could be quoted.
- **Customer.io and Drip AUPs not retrieved** (404 and 403).
- No vendor publicly confirms or denies accepting peptide stores. Only a written answer from each vendor settles it.

---

## Q2. Platform pricing at 2,000–10,000 contacts, and does each work with a custom (non-Shopify) site?

### Takeaway
At 5,000 contacts, list prices run from about US$32–69 (Brevo) to about US$100 (Klaviyo, Customer.io). All of the email platforms below have APIs for custom sites. Vendor pricing pages mostly use sliders and did not expose tier prices to fetching, so several figures are from aggregators. Confirm on the vendor page before buying.

### Cited Findings
- **Klaviyo [AGGREGATOR + official free tier].**
  - Free plan (official): 250 active profiles, 500 email sends/month, $5 of mobile messages a month. — [Klaviyo pricing](https://www.klaviyo.com/pricing)
  - Email plan (aggregators): about $60 at 2,500 profiles, $100 at 5,000 and $150 at 10,000. Email + Mobile is about $165 at 10,000. Sends are about 10x profiles. Sources dated Apr–Oct 2026. — [Charle Klaviyo pricing](https://www.charle.co.uk/articles/klaviyo-pricing/); [Mailsoftly](https://mailsoftly.com/blog/klaviyo-pricing/)
  - Pricing is USD only, no CAD shown. — [Klaviyo pricing](https://www.klaviyo.com/pricing)
- **Omnisend [official].**
  - Free: $0 for 250 contacts and 500 emails/month.
  - Standard: $11.20/month as shown at 500 contacts.
  - Pro: $41.30/month as shown at 2,500 contacts, with unlimited email (fair use up to 60x list).
  - US SMS runs about $0.007–0.009 per SMS depending on volume. Canadian SMS rates are not listed.
  - Offers "open, flexible APIs" for custom integrations.
  - Prices at 5,000 and 10,000 contacts were not shown on the fetched page. — [Omnisend pricing](https://www.omnisend.com/pricing/)
- **Brevo [AGGREGATOR].**
  - Starter is $9/month and Standard $18/month at the 5,000-email tier, but lower tiers cap contacts.
  - To store 5,000 contacts, one comparison puts Starter at about $32 and Standard at about $69. — [Dreamlit Mailchimp vs Brevo (updated 1 Oct 2026)](https://dreamlit.ai/blog/mailchimp-vs-brevo); [Automation Atlas Brevo pricing 2026](https://automationatlas.io/answers/brevo-pricing-explained-2026/)
  - **Moot for PEPTICITY** because of the explicit peptide ban (Q1).
- **Mailchimp [AGGREGATOR].** Standard at 5,000 contacts is quoted as $75 by one source and $100 by another. A UK check on 30 Sep 2026 found £76.04/month for 2,501–5,000 contacts. — [Dreamlit](https://dreamlit.ai/blog/mailchimp-vs-brevo); [Automation Atlas Mailchimp vs Brevo](https://automationatlas.io/answers/mailchimp-vs-brevo-2026/)
- **Customer.io [AGGREGATOR].**
  - Essentials is about $100/month at 5,000 profiles and about $150 at 10,000. Premium is about $1,000/month or custom.
  - No free plan, but a startup programme gives one free year to companies with under $10M in funding.
  - Its pricing page reportedly no longer shows fixed prices. — [Automation Atlas Customer.io 2026](https://automationatlas.io/answers/customer-io-pricing-explained-2026/); [CostBench Customer.io](https://costbench.com/software/marketing-automation/customerio)
  - It is event/API-first by design, so it is the most natural fit for a custom static site.
- **Drip [AGGREGATOR].** $39/month at 2,500 contacts and $89 at 5,000. No free plan as of Sep 2026, 14-day trial, SMS extra. — [CostBench Drip](https://costbench.com/software/marketing-automation/drip/)
- **Postscript and Attentive:** no current pricing found (see Gaps).

### Inferences
- For a custom static site, every flow needs the site to send events: "Viewed Product", "Added to Cart", "Started Checkout", "Placed Order", "Back in stock subscribe". Use the vendor's JS snippet on the front end, plus server-side calls from the checkout/order backend for order events.
- Klaviyo, Omnisend and Customer.io all expose track/identify-style APIs. Postscript and Attentive are SMS-focused and built around Shopify-style integrations (unverified, see Gaps).

### Gaps
- Official per-tier prices for Klaviyo, Mailchimp, Brevo and Customer.io were not shown on fetchable pages.
- No CAD pricing found for any vendor.
- Postscript and Attentive pricing and custom-site support were not verified. Both are commonly described as Shopify-centric, but this was not sourced here.

---

## Q3. Klaviyo benchmark data by flow (revenue per recipient, click rate)

### Takeaway
Klaviyo's newest public flow benchmarks (2 Oct 2026, more than 110,000 customers) rank flows by email revenue per recipient (RPR): abandoned cart $6.77 > welcome $5.75 > browse abandonment $2.08 > post-purchase $1.80 > win-back $0.82. Back-in-stock figures and conversion/placed-order rates are **not** in that public article. All of this is **[VENDOR BENCHMARK]**: Klaviyo's own customers, mixed industries, none of them peptide or pharma.

### Cited Findings
Source for every bullet in this section: "The abandoned cart benchmarks report: 2026 data to inform your strategy", Klaviyo, published 2 Oct 2026, based on more than 110,000 Klaviyo customers. Its charts come from Klaviyo's 2026 Omnichannel Benchmark Report. — [Klaviyo abandoned cart benchmarks 2026](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) **[VENDOR BENCHMARK]**

**Revenue per recipient (USD)**

| Flow | Email avg | Email top 10% | SMS avg | SMS top 10% |
|---|---|---|---|---|
| Abandoned cart | $6.77 | $13.70 | $4.48 | $8.69 |
| Welcome series | $5.75 | $13.27 | $3.33 | $7.07 |
| Browse abandonment | $2.08 | $4.32 | $1.04 | $2.10 |
| Post-purchase | $1.80 | $2.77 | n/a | n/a |
| Win-back | $0.82 | $1.60 | n/a | n/a |

**Click rate**

| Flow | Email avg | Email top 10% | SMS avg | SMS top 10% |
|---|---|---|---|---|
| Abandoned cart | 6.0% | 11.3% | 10.3% | 18.5% |
| Welcome series | 6.5% | 13.3% | 10.0% | 18.3% |
| Browse abandonment | 5.6% | 9.8% | 8.6% | 15.6% |
| Post-purchase | 5.1% | 10.5% | n/a | n/a |
| Win-back | 2.8% | 5.8% | n/a | n/a |

- Older figures still circulate and conflict with this report: abandoned cart email RPR of $3.65 (2023 data published 2024), with a top-10% figure of $28.89. Use the Oct 2026 numbers and do not mix vintages. — [Attribuly summary of older Klaviyo data](https://attribuly.com/blogs/abandoned-cart-recovery-rate-klaviyo/) **[AGGREGATOR]**
- **Independent context:** Baymard puts the average documented cart abandonment rate at **70.22%** across 50 studies (updated 22 Sep 2025).
  - Top reasons, excluding "just browsing": extra costs too high (shipping, tax, fees) 40%; delivery too slow 20%; didn't trust the site with card details 19%; account required 18%; checkout too long 17%; site errors 17%.
  - 42% of US shoppers abandoned because they were "just browsing". — [Baymard cart abandonment rate](https://baymard.com/lists/cart-abandonment-rate) **[INDEPENDENT]**

### Inferences
- Build order by expected revenue: abandoned cart, then welcome, then browse abandonment, then post-purchase/replenishment, then win-back.
- Baymard's top reasons (fees, trust, forced accounts) point to fixing the checkout first. That is cheaper than recovery, and it needs no ESP account at risk under an AUP.
- RPR benchmarks scale with average order value. PEPTICITY's AOV will differ, so treat these as relative rankings, not forecasts.

### Gaps
- Back-in-stock, replenishment and VIP/early-access flow benchmarks were not in the public Klaviyo article.
- Placed-order (conversion) rates per flow were not published there.
- The full 2026 Omnichannel Benchmark Report was not retrieved.
- No peptide- or pharma-specific benchmarks exist publicly.

---

## Q4. CASL: can an abandoned-cart email go out without express marketing consent?

### Takeaway
Only in narrow cases. Under the CASL statute:
- A pure transactional message that "facilitates, completes or confirms a commercial transaction that the person … previously agreed to enter into" (s.6(6)(b)) is exempt from the consent requirement.
- An abandoned cart is arguably **not** an agreed transaction. The visitor has not agreed to buy.
- Implied consent via an "existing business relationship" covers (a) a purchase within the past **two years** or (e) an **inquiry or application within the past six months** (s.10(10)).
- Whether starting a checkout counts as an "inquiry" has **no CRTC guidance found**.

Safest build:
- Collect an **unticked, separate express-consent checkbox** at the email field.
- Without it, send at most **one** plain, product-factual reminder with no discounts or upsells, framed as an inquiry follow-up, and only after a lawyer's sign-off.

### Cited Findings
- **s.6(6) exemptions [STATUTE].** "Paragraph (1)(a) does not apply to a commercial electronic message that solely":
  - "(a) provides a quote or estimate … if the quote or estimate was requested by the person to whom the message is sent;"
  - "(b) facilitates, completes or confirms a commercial transaction that the person to whom the message is sent previously agreed to enter into with the person who sent the message …;"
  - "(c) provides warranty information, product recall information or safety or security information …;"
  - "(d) provides notification of factual information about … the ongoing use or ongoing purchase … under a subscription, membership, account …;"
  - "(f) delivers a product, goods or a service … that the person … is entitled to receive under the terms of a transaction that they have previously entered into".
  - Note that 6(6) waives only paragraph (1)(a), the **consent** requirement. Sender identification and unsubscribe under s.6(2) still apply. — [CASL S.C. 2010, c. 23, s.6 (Justice Laws)](https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-1.html)
- **Implied consent, existing business relationship [STATUTE], s.10(10).** It arises from:
  - "(a) the purchase or lease of a product, goods, a service … within the two-year period immediately before the day on which the message was sent";
  - "(e) an inquiry or application, within the six-month period immediately before the day on which the message was sent, made by the person to whom the message is sent … in respect of anything mentioned in any of paragraphs (a) to (c)."
  - For subscriptions or memberships, s.10(14) starts the period when the relationship ends.
  - s.11(1): the unsubscribe mechanism must work "at no cost" via "the same electronic means by which the message was sent" (or other electronic means if that is not practicable) and must give an electronic address or web link. — [CASL s.10–11 (Justice Laws)](https://laws-lois.justice.gc.ca/eng/acts/E-1.6/page-2.html)
- **Secondary commentary is split.**
  - One Canadian e-commerce guide treats abandoned-cart emails as commercial electronic messages (CEMs) needing consent. It says adding product recommendations, promo codes or upsells turns a transactional email into a CEM. — [Excelohunt CASL guide for Canadian e-commerce](https://excelohunt-site.pages.dev/blog/casl-compliance-guide-canadian-ecommerce) **[AGGREGATOR]**
  - Envoke argues that starting a cart can ground implied consent, with no CRTC citation. — [Envoke implied consent under CASL](https://envoke.com/blog/implied-consent-casl/) **[VENDOR CLAIM]**
  - The burden of proving consent is on the sender. — [ML Tamkins: CASL is constitutional](https://www.mltaikins.com/insights/casl-is-constitutional-and-some-guidance-on-how-to-interpret-it/)

### Inferences
- **Recommended consent design:**
  - At the first email field (cart, checkout or exit card), show one unticked box: "Email me offers and new arrivals from PEPTICITY. Unsubscribe any time." Log the timestamp, the source page and the exact wording.
  - Anyone who ticks it gets the full abandoned-cart cadence, including any offer.
  - Anyone who does not tick it gets nothing promotional. At most, send one factual "your saved cart" message, and only if counsel accepts the 6-month inquiry theory.
- Post-purchase: a completed order gives a 2-year implied consent window, and pure order, shipping or delivery messages are s.6(6)(b)/(f) exempt.
  - Replenishment and win-back messages to buyers inside 2 years can rely on implied consent. Counsel should confirm, and those messages still need ID and unsubscribe.
  - Win-back sent more than 2 years after the last purchase needs express consent.
- SMS falls under the same CASL rules, plus carrier/short-code rules (Q5) and TCPA for US numbers (express written consent, per Omnisend §4.1).

### Gaps
- CRTC's FAQ and guidance pages (crtc.gc.ca/eng/com500/) returned 403 / a JavaScript bot check, so CRTC wording on cart abandonment could not be quoted. No CRTC enforcement decision on abandoned-cart email was found.
- Peptide-specific overlay: even with consent, Food and Drug Regulations C.01.044 (Rx advertising) may limit what an email can say. That is covered by the peptide-regulatory skill, not researched here.

---

## Q5. SMS in Canada: carrier rules, short codes, 10DLC

### Takeaway
- **Canadian short codes** are governed by the **Canadian Common Short Code Compliance Policies v2.1 (Jan 2026)**. These are administered by the Canadian Telecommunications Association (formerly CWTA) through txt.ca, and they require express opt-in.
- **10DLC is a US carrier registration system.** It applies when sending from US long codes to US numbers, and it rejects prescription-drug marketing outright (Q1).
- For a peptide store, promotional SMS is very likely to be refused at the ESP, aggregator or carrier level in both countries.

### Cited Findings
- The current document is "Canadian CSC Compliance Policies v2.1 January 2026". Only the cover was retrievable. — [txt.ca CSC Compliance Policies v2.1 (PDF)](https://www.txt.ca/wp-content/uploads/2026/01/Canadian-CSC-Compliance-Policies-v2.1-January-2026.pdf)
- The CWTA was renamed the Canadian Telecommunications Association, and the "Application Guidelines" were renamed the "Compliance Policies". All short-code users must follow them. — [Twilio Canada short code guidelines](https://www.twilio.com/en-us/guidelines/ca/short-code)
- Short codes require express consent before sending. — [Twilio Canada short code guidelines](https://www.twilio.com/en-us/guidelines/ca/short-code)
- Klaviyo's AUP bans illegal-substance content on US/Canada short codes and toll-free numbers, with the test being whether it is illegal "in any message recipient's jurisdiction". — [Klaviyo AUP](https://www.klaviyo.com/legal/acceptable-use-policy)
- Several providers say cannabis, CBD, kratom and gambling are prohibited across Canadian number types, and prescription-only drug offers are commonly banned. — [ClickSend US/Canada compliance](https://help.clicksend.com/en/articles/76765-us-and-canada-compliance-guidelines); [Avochato](https://help.avochato.com/compliance/forbidden-sms-and-mms-categories-in-us-and-canada)
- Twilio's 10DLC rejection for prescription drug marketing is final; resubmission is not allowed. — [Twilio 30941](https://www.twilio.com/docs/api/errors/30941)

### Inferences
- Use SMS for **transactional** messages only (order confirmed, shipped, delivered), and only with consent captured at checkout.
- Treat promotional SMS (cart reminders with offers, drops) as off the table until a provider confirms in writing.
- Canadian short codes cost money and need an application. The application cycle and cost were not verified here.

### Gaps
- The full v2.1 policy text (consent wording, HELP/STOP keywords, message caps) was not retrieved.
- Canadian short-code lease costs were not found.
- No source says whether Canadian toll-free numbers have a separate verification scheme comparable to US toll-free verification.

---

## Feature playbook (what each flow does, timing, how to build, risk)

### Takeaway
Use the Klaviyo RPR ranking (Q3) as the build order. Timings below are mostly **[VENDOR CLAIM]** illustrations, not tested data. Each flow needs a site event plus a consent check.

### Cited Findings
- **Abandoned cart.**
  - Klaviyo's illustrative cadence: 3 messages. Email at 2–4 h; SMS "with a discount" at 24 h; at 48 h, alternative products or a feedback request. — [Klaviyo 2026](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) **[VENDOR CLAIM]**
  - RPR: email $6.77, SMS $4.48. — same source **[VENDOR BENCHMARK]**
- **Browse abandonment.** RPR: email $2.08, SMS $1.04. Click rate: email 5.6%, SMS 8.6%. — [Klaviyo 2026](https://www.klaviyo.com/blog/abandoned-cart-benchmarks) **[VENDOR BENCHMARK]**
- **Welcome series.** RPR: email $5.75 (top 10%: $13.27). Click rate 6.5%. — same source **[VENDOR BENCHMARK]**
- **Post-purchase.** RPR: email $1.80. Click rate 5.1%. — same source
- **Win-back.** RPR: email $0.82. Click rate 2.8%. — same source
- **Exit intent / abandonment causes.** Extra costs 40% and trust 19% are the top fixable abandonment reasons. — [Baymard](https://baymard.com/lists/cart-abandonment-rate) **[INDEPENDENT]**

### Inferences
- **Offer ladder:** first message with no discount (reminder plus trust: shipping, lot testing, support). Introduce any offer only at the 2nd or 3rd touch, and only to express-consent contacts.
  - PEPTICITY already has a 15% grand-opening code (follow-up-sequences skill). Do not stack a second cart discount on top of it, or carts will be abandoned on purpose to get one.
  - No source found that measures no-discount-first against discount-first. This is an inference.
- **Build on a static site:**
  - Front-end JS fires view, add-to-cart and checkout events and sends email + consent flag + cart contents to the ESP or a serverless function.
  - The checkout backend sends "Placed Order", which stops the cart flow.
  - The inventory feed (shared/inventory.js) drives back-in-stock: a "notify me" form stores SKU + email + consent, and a restock triggers the send.
  - Replenishment: SKU-level days-of-supply from the inventory data sets a reminder at roughly 80% of supply. Do not word it as dosing ("you'll run out after N doses"). Use time-only wording ("it's been 6 weeks since your order").
  - VIP early drop: tag repeat buyers or members and send N hours before the public release.
- **Compliance risk by flow (Canada):**
  - Order and shipping messages: low, s.6(6) exempt.
  - Post-purchase, replenishment, win-back within 2 years: medium (implied consent, plus F&DR Rx ad limits on content).
  - Abandoned cart, browse abandonment, exit capture without express consent: high.
  - Back-in-stock: low if the form carries an express request (the person asked to be told).
  - Any promotional SMS: high (carrier and AUP).
  - Browse-abandonment emails that name an Rx peptide may also count as Rx advertising beyond name/price/quantity (see peptide-regulatory).

### Gaps
- No independent study found on cart-email timing or on the discount ladder.
- No sourced benchmarks for back-in-stock, replenishment or VIP flows.
- Exit-intent popup conversion lift: no independent source retrieved; vendor figures were not gathered due to the tool budget.
- Litmus and Omnisend benchmark reports were not retrieved.

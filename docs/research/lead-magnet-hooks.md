# PEPTICITY: LEAD-MAGNET HOOKS AND CONVERSION DEVICES

Prepared 2026-10-26. The aim is to give PEPTICITY many classy, lawful ways for a visitor to leave contact details (newsletter, offers, guides, waitlists, call-backs), so the site works as a lead magnet without breaking Canadian health-product rules.

**How this was researched.** Direct page fetches are blocked in this environment (WebFetch DNS failure; the proxy refuses CONNECT). Every example below was reached through web-search results and their summaries, and the primary pages were not opened. Treat each figure as "reported by the cited page", and check it at the URL before quoting it publicly. Vendor and agency benchmarks are labelled as such. **[UNVERIFIED]** marks anything that could not be confirmed. No statistic here is invented.

**About the research-peptide shops.** Searches for Peptide Sciences, Limitless Life, Amino Asylum, Core Peptides, Swiss Chems and Biotech Peptides returned mostly coupon-spam and affiliate pages, not the shops' own pages. Their signup offers, points schemes and COA pages therefore could **not** be verified, and they are cited only where a third-party page describes them. Health Canada has publicly seized product from Canada Peptide ([HC advisory](https://recalls-rappels.canada.ca/en/alert-recall/unauthorized-injectable-peptide-drugs-seized-and-sold-canada-peptide-may-pose-serious)). PEPTICITY should borrow nothing from that model except the idea of lot transparency.

**This is a risk scan, not legal advice.** Read it together with `quiz-and-guide-research.md` (sections 3 and 7). Items marked **STOP** need a Canadian health-law lawyer before any version goes live.

---

## 0. THE RULES THAT SHAPE EVERY HOOK

| Rule | What it means for lead capture | Source |
|---|---|---|
| **C.01.044: an Rx ad may state only name, price and quantity** | Hooks sell the **service** (consult, pharmacy, process, documentation, privacy), never a named Rx drug for a goal. An offer can't say "[drug] for recovery, 10% off". | [Justice Laws C.01.044](https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/section-C.01.044.html); [Ad Standards DTCA checklist 2026](https://adstandards.ca/wp-content/uploads/DTCA-Checklist-2026-EN-Ad-Standards.pdf) |
| **Unauthorized peptides** (BPC-157, TB-500, CJC-1295, ipamorelin, Epitalon, GHK-Cu injectable, NAD+, AOD-9604, DSIP and others) | No hook may promote, discount, waitlist or "drop-alert" these. Pending counsel (question 7.1 in the earlier doc), they don't appear in marketing at all. | [HC "Think twice"](https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm) |
| **Provincial pharmacy inducement bans** | Ontario's College of Pharmacists bars loyalty or bonus points on prescriptions and pharmacy services, and bars redeeming points for prescriptions. B.C.'s College bylaws ban points, cash, gifts and similar incentives on prescriptions. They took effect 2013-12-02 and were upheld on appeal, and the Supreme Court of Canada declined to hear the case. CBC reports seven provinces ban incentives such as points and coupons on prescriptions. Alberta's position was litigated: a 2016 lower-court ruling was later overturned on appeal. **So discounts, points and referral rewards tied to the Rx or the pharmacy fill are STOP.** | [OCP Loyalty Points policy](https://ocpinfo.com/pharmacy-professionals/rules-and-standards-of-the-profession/practice-policies-guidelines/loyalty-points-program/); [CBC, B.C. ban](https://amp.cbc.ca/news/canada/british-columbia/pharmacy-loyalty-points-ban-1.3668434); [Chain Drug Review, Sobeys loses appeal](https://chaindrugreview.com/sobeys-loses-appeal-of-ban-on-pharmacy-rewards/); [CBC, Nova Scotia](https://amp.cbc.ca/news/canada/nova-scotia/pharmacy-rewards-in-nova-scotia-staying-for-now-1.6497027); [Alberta FAQ, inducements](https://abpharmacy.ca/wp-content/uploads/FAQ_Inducements.pdf) |
| **No Rx samples to consumers** | Rx samples may go only to practitioners and pharmacists. A "free trial" of an Rx product is STOP. | [FDR C.01.048](https://laws-lois.justice.gc.ca/eng/Regulations/c.r.c.,_c._870/section-C.01.048-20200701.html); [SOR/2020-74](https://gazette.gc.ca/rp-pr/p2/2020/2020-04-29/html/sor-dors74-eng.html) |
| **CASL** | Every commercial email or SMS needs consent, sender identification and a working unsubscribe. The sender carries the burden of proof, so log when, how and why consent was given. Use unticked boxes and a separate box per consent type. A single unsubscribe link that doesn't fully work breached CASL (CompuFinder). | [CRTC infographic](https://crtc.gc.ca/pubs/casl_infograph4_eng.pdf); [MLT Aikins on CompuFinder](https://www.mltaikins.com/insights/casl-is-constitutional-and-some-guidance-on-how-to-interpret-it/) |
| **Fake urgency is misleading advertising** | Countdown timers that reset, and "low stock" or "others are looking" cues that never change, are flagged by the Competition Bureau. The Dufresne Group paid **$3.25M** over timers whose offers outlived the countdown. | [Competition Bureau, "The urgency is fake"](https://www.canada.ca/en/competition-bureau/news/2024/11/the-urgency-is-fake-but-the-deception-is-real.html); [Bureau, Dufresne](https://www.canada.ca/en/competition-bureau/news/2023/09/the-dufresne-group-to-pay-325-million-penalty-to-settle-competition-bureau-concerns-over-marketing-claims.html) |
| **Drip pricing** | The first price shown must be payable in full, apart from taxes. | [Goodmans on Cineplex](https://goodmans.ca/insights/article/the-cineplex-decision---a-new-chapter-opens-in-canadian-competition-law) |
| **Contests** | A contest needs a skill-testing question, no purchase necessary, s.74.06 disclosure (prizes, odds, regions) and French for Quebec. | [Miller Thomson](https://www.millerthomson.com/en/insights/marketing-advertising-and-product-compliance/dont-let-your-contest-become-a-compliance-risk-a-practical-guide-for-businesses/); [SmartBiggar](https://www.smartbiggar.ca/insights/publication/canadian-contests-what-you-need-to-know) |
| **Health data and ad pixels** | PIPEDA requires express consent for health-based remarketing (see the earlier doc). The FTC fined BetterHelp **$7.8M** for sending intake answers and emails to advertisers via pixels, and GoodRx **$1.5M** for similar sharing. Since February 2025, Meta reportedly blocks lower-funnel conversion events and conversion-based audiences for accounts classed as health and wellness. Google bars personalized ads on sensitive health topics, and keyword-targeting Rx terms in Canada needs certification. **Grow an owned, consented list; don't depend on pixel retargeting.** | [DWT on GoodRx/BetterHelp](https://www.dwt.com/blogs/privacy--security-law-blog/2023/03/ftc-pixel-tracking-health-goodrx-betterhelp); [Search Engine Land, Meta](https://searchengineland.com/meta-ads-restrictions-health-wellness-campaigns-453094); [Triple Whale, Meta](https://www.triplewhale.com/blog/meta-health-and-wellness-brands); [Google, Rx drug services](https://support.google.com/adspolicy/answer/15598647) |

**Ratings used below:** **SAFE** means do it now, with the wording rules in the earlier doc. **CAUTION** means do it with the stated guardrails and a counsel read. **STOP** means illegal or high-risk for Rx or unauthorized products in Canada, and a compliant alternative is given.

---

## 1. EMAIL AND SMS CAPTURE OFFERS

### 1. WELCOME OFFER IN EXCHANGE FOR EMAIL
- **What:** A popup or inline form that gives something of value for signing up.
- **Real examples:** Research-peptide shops commonly use first-order codes, for example Elite Peptides at 10% for newsletter signup ([SimplyCodes](https://simplycodes.com/store/elitepeptides.com)) and Nox Peptides (Vancouver) at 20% for first-time customers ([press release](https://www.daily-tribune.com/online_features/press_releases/nox-peptides-launches-20-discount-offer-for-new-customers-across-canada/article_80631b55-f23d-525d-b512-40eb24dee589.html)). AG1 instead gives a "welcome kit" of gifts with the first subscription, such as travel packs and vitamin D3+K2; reported contents vary by source ([Garage Gym Reviews](https://www.garagegymreviews.com/athletic-greens-coupon-code)) **[UNVERIFIED on AG1's own site]**.
- **Why it converts:** Klaviyo puts standard homepage pop-up forms at 3 to 8% (vendor figures) ([Klaviyo](https://www.klaviyo.com/blog/sign-up-form-best-practices)). Popupsmart's median is 0.83% of displays, with the top 10% at 3.87% or more ([Popupsmart data](https://popupsmart.com/our-data)).
- **PEPTICITY version:** Make the welcome gift **knowledge, not a discount**: "THE PEPTICITY PRIMER, free, plus GRACE'S LETTER monthly" (see #8 and #16). A money offer may only apply to things outside the Rx and pharmacy lane, such as [cosmetic topicals, if sold], branded merch, or an event ticket.
- **Risk:** **STOP** for any discount, gift or "welcome kit" tied to an Rx, a peptide program or the pharmacy fill (provincial inducement bans; C.01.044). Whether a discount on the **clinician consult fee** is allowed is a counsel question (provincial colleges of physicians may have their own inducement rules) **[UNVERIFIED]**. A welcome discount on unauthorized peptides is illegal.

### 2. FREE, DISCREET DELIVERY AS THE STANDARD (NOT A THRESHOLD)
- **What:** Free shipping, either always or above a threshold, used as an incentive.
- **Real example:** Felix (Canada) advertises free shipping on all medication ([Expert Beacon review](https://expertbeacon.com/felix-health-review/); [Lifetimes Canada](https://lifetimescanada.com/blog/telehealth/online-pharmacies-in-canada-2026-pocketpills-vs-felix-for-prescription-delivery)). A Canadian research shop advertises free shipping over $150 CAD ([Peptide Protocol Wiki](https://www.peptideprotocolwiki.com/vendors/buy-peptides-4-research)).
- **Why it converts:** Unexpected extra costs are the top cart-abandonment reason in Baymard's research. It is reported as 39% or 48%, depending on the base, via secondary sources ([Contentsquare summary](https://contentsquare.com/guides/cart-abandonment/stats/)).
- **PEPTICITY version:** Put "Discreet delivery included" on the all-in price card (#20). Never use a spend threshold on Rx. Use a threshold only on non-Rx shop items.
- **Risk:** **CAUTION.** Free delivery of an Rx is part of the pharmacy service and is normal practice (Felix). But "free shipping if you spend $X on prescriptions" looks like an inducement. Keep it flat and unconditional.

### 3. PROVINCE WAITLIST ("NOT IN YOUR PROVINCE YET")
- **What:** Visitors outside a served area join a list to hear when service opens there.
- **Real examples:** Function Health ran a waitlist from its April 2023 beta. The company reported nearly 100K signups by January 2024, and "skip the line" codes were used ([Fitt Insider Q&A](https://insider.fitt.co/function-health-co-founder-coo-pranitha-patil); [Wikipedia](https://en.wikipedia.org/wiki/Function_Health)). Superpower had about 150,000 people waitlisted at public launch ([TechCrunch](https://techcrunch.com/2025/04/22/superpower-wants-to-help-people-detect-and-address-health-issues-before-symptoms-appear)).
- **Why it converts:** A waitlist turns a dead end (wrong province) into a lead. The scarcity is real because licensure really is provincial.
- **PEPTICITY version:** When the quiz's province question is unserved, show "WE'RE NOT LICENSED IN [PROVINCE] YET". Ask for email and province only. Use an unticked "Also send me GRACE'S LETTER" box, kept separate from the "tell me when you open" consent.
- **Risk:** **SAFE.** Never publish waitlist counts unless they are real and current. Don't promise opening dates.

### 4. FOUNDING LIST / EARLY ACCESS
- **What:** A pre-launch list that gets first booking access.
- **Real example:** Next Health offered a limited number of "Founding Memberships" with lifetime discounts at new clinics ([Business Wire, Green Hills](https://businesswire.com/news/home/20251111512017/en/Next-Health-Expands-Nashville-Footprint-with-New-Green-Hills-Location)).
- **Why it converts:** It gives status and first access, and it is the classiest form of urgency when the limit is real.
- **PEPTICITY version:** "THE FOUNDING LIST": first access to consult booking when a province or program opens, a founder's welcome letter, and an invitation to the first live session (#13). Any cap must be real, for example "[N] consult slots in the first week", tied to actual clinician hours.
- **Risk:** **CAUTION.** "Lifetime discounts" on Rx or pharmacy services are **STOP** (inducement). Perks must be access and information, not price on Rx. If there's a stated cap or deadline, honour it (Competition Bureau).

### 5. "NOTIFY ME" ALERTS (RESTOCK / OPENINGS)
- **What:** One-tap alerts when something comes back or opens.
- **Real example and data:** Across 3,900+ stores, the top quartile of back-in-stock alerts converts above 15.7% (vendor data) ([notify-me.io benchmark](https://notify-me.io/reports/back-in-stock-benchmarks-3900-stores)). Omnisend data reported back-in-stock as the highest click-to-conversion automated email at 7.3% ([EcommerceDB](https://ecommercedb.com/insights/email-marketing-back-in-stock-and-welcome-emails-have-the-best-conversion-rates/4569)).
- **PEPTICITY version:** Use it for **consult openings** ("Tell me when an evening slot opens with a clinician licensed in [province]"), new guide releases, and live-session dates.
- **Risk:** **STOP** for "drop alerts" on Rx drugs or peptides: that is product promotion, and for unauthorized peptides it is promoting an illegal sale. Alerts about service capacity are **SAFE**.

### 6. SMS OPT-IN (TWO-TAP)
- **What:** On mobile, a button opens the visitor's messaging app with a pre-filled text. They tap Send and are subscribed.
- **Real example and data:** This is Attentive's Two-Tap. An agency reports a 2 to 3x lift over standard SMS forms (anecdotal) ([ATTN Agency](https://www.attnagency.com/blog/attentive-shopify-review)). Klaviyo cites 10 to 13% for phone-only capture forms (vendor) ([Klaviyo](https://www.klaviyo.com/blog/sign-up-form-best-practices)).
- **PEPTICITY version:** Keep two separate lanes. The first is **transactional** texts: appointment reminders and "your clinician's note is ready". The second is **marketing** texts, opt-in only and rare (a monthly "letter is out", or a new province open).
- **Risk:** **CAUTION.** CASL covers SMS, so you need identification, STOP handling and a consent log. **Never put health details in an SMS** (lock screens are visible). A transactional opt-in is not marketing consent.

### 7. EXIT-INTENT OR TIMED SLIDE-IN (OFFERING THE GUIDE)
- **What:** A panel that appears when the cursor leaves the page, or after time or scroll depth.
- **Data:** Klaviyo reports exit-intent forms at 10 to 13% (vendor) ([Klaviyo](https://www.klaviyo.com/blog/sign-up-form-best-practices)). Popupsmart's larger dataset found the exit-intent advantage **not reliable** (1.10% vs 0.78% median, possibly chance). Conversion falls from the third view, and by the sixth view it is 31% of the first-view rate ([Popupsmart, exit intent](https://popupsmart.com/blog/do-exit-intent-popups-work); [Popupsmart data](https://popupsmart.com/our-data)).
- **PEPTICITY version:** One quiet frosted-glass slide-in, bottom corner on desktop and a bottom sheet on mobile. Show it once per session and at most three times ever. Offer the PRIMER (#8) or "Email me this page". Never show it over the quiz or the booking flow.
- **Risk:** **SAFE** if it's dismissable and offers no Rx discount.

### 8. QUIET ANNOUNCEMENT BAR
- **What:** A slim top bar with one current message and one link.
- **Example:** Best-practice guidance says banners should sit at the top, be dismissable and be time-limited ([popups skill guide, Corey Haines](https://mcpservers.org/th/agent-skills/coreyhaines31/popups)) **[weak source; general practice]**.
- **PEPTICITY version:** Rotate true service news: "NOW BOOKING CLINICIAN CONSULTS IN [PROVINCES]", "THE OCTOBER LETTER IS OUT: READ IT", or "LIVE Q&A [DATE]: SAVE A SEAT".
- **Risk:** **SAFE.** No timers, and no drug names.

---

## 2. CONTENT LEAD MAGNETS

### 9. THE FREE PRIMER (GUIDE OR EBOOK)
- **What:** A downloadable guide given for an email address.
- **Real examples:** Peter Attia gives a five-tactic "Longevity Toolkit" on newsletter signup ([peterattiamd.com/newsletter](https://peterattiamd.com/newsletter/)). Huberman Lab's free newsletter gives new subscribers a digest with a "Complete Sleep Toolkit", a fitness protocol and a cold-exposure guide. The signup page claims 800,000+ subscribers ([hubermanlab.com/newsletter](https://hubermanlab.com/newsletter)).
- **Why it converts:** A specific, named asset beats a generic "subscribe" button. Both brands lead with the asset, not with "newsletter".
- **PEPTICITY version:** "THE PEPTICITY PRIMER: PEPTIDE CARE IN CANADA, PLAINLY". It covers what Health Canada authorizes and what it has warned about; how a clinician consult works; what a partner pharmacy does; how to read a lot certificate (COA); questions to bring (#12); and pricing explained in CAD.
- **Risk:** **CAUTION.** No benefit claims ("heals", "boosts", "supports"), no dosing, cycles or stacks, and no named Rx drug next to a goal. Have a regulatory read of the PDF before release, and date-stamp each edition.

### 10. EMAIL COURSE (FIVE SHORT LESSONS)
- **What:** Lessons drip-fed by email over several days.
- **Real example:** Attia's free "Longevity 101" is eight lessons in eight days, each under 15 minutes ([peterattiamd.com/longevity-101-guide](https://peterattiamd.com/longevity-101-guide/)).
- **Why it converts:** It sets up a habit of opening the emails, and every lesson is a soft touchpoint before booking. Automated flows reportedly outperform campaigns by 3 to 4x (vendor) ([Inboxally](https://www.inboxally.com/blog/klaviyo-email-benchmarks)).
- **PEPTICITY version:** "FIVE DAYS TO A BETTER CONSULT". Day 1: how care works in Canada. Day 2: "research use only" explained (#15). Day 3: reading a COA. Day 4: what your clinician will ask. Day 5: real costs, then a gentle "Book when ready".
- **Risk:** **SAFE** with the same wording rules as #9.

### 11. PLAIN-ENGLISH GLOSSARY / LIBRARY
- **What:** A searchable A to Z of terms, which is an SEO magnet with an inline "email me new entries".
- **Real examples:** Thriva's searchable "What we test" library ([thriva.co/what-we-test](https://thriva.co/what-we-test)), and Superpower's biomarker category pages ([superpower.com](https://superpower.com/best-biomarkers-categories/digestive-detox)).
- **PEPTICITY version:** "PEPTIDE TERMS, PLAINLY": COA, HPLC, mass spec, lot number, DIN, NPN, compounding, Health Canada-authorized, research-use-only, licensed partner pharmacy.
- **Risk:** **CAUTION.** Define **process and documentation terms**, not drugs. An entry for an unauthorized peptide that reads as "what it does" would be promotion. If drug entries are ever added, give regulatory status only, with a link to the HC advisory. Terms such as "reconstitution" are defined in words only: no ratios, volumes or calculators. The peptide-expert skill notes that FDA's August 2026 letters treated a "peptide calculator" plus bacteriostatic water as evidence of intended human use **[VERIFY]**.

### 12. "WHAT TO ASK YOUR CLINICIAN" CHECKLIST
- **What:** A printable consult-prep sheet.
- **Real example:** ISMP Canada's "5 Questions to Ask About Your Medications", built with Canadian partners and offered in 20+ languages. A survey poster (n=291) reports 85% of patients would feel comfortable asking them ([ISMP Canada](https://www.ismp-canada.org/medrec/5questions.htm); [Healthcare Excellence Canada](https://healthcareexcellence.ca/en/resources/five-questions-to-ask-about-your-medications); [poster](https://www.ismp-canada.org/download/posters/BMJIHI-5Qs-AMS2018.pdf)).
- **Why it converts:** It is useful, safety-led and clinician-friendly, and it positions PEPTICITY as the careful option.
- **PEPTICITY version:** "YOUR CONSULT PREP SHEET": link to the ISMP 5 Questions (credited; check its licence before reproducing), plus PEPTICITY's own questions. For example: "Is this authorized by Health Canada?", "Who compounds or fills it, and where?", "What is the lot certificate?" and "What does it cost all-in?". Delivered by email, with an optional download.
- **Risk:** **SAFE.** The best fit for PEPTICITY's model.

### 13. LOT CERTIFICATE (COA) LOOKUP
- **What:** Enter the lot number from the label and see the batch's test documentation.
- **Real examples:** Ritual's "Made Traceable" publishes supplier names and final manufacturing locations, and mentions a Certificate of Traceability and sharing COAs for heavy-metal testing ([ritual.com/ca/made-traceable](https://ritual.com/ca/made-traceable)). NSF Certified for Sport has a lot-number search, which USADA tells athletes to use ([USADA](https://usada.org/?p=76436)). Bio-Techne has a lot-number CoA finder ([Bio-Techne](https://www.bio-techne.com/support/cofa-finder-tool)). Research-peptide shops advertise third-party (often Janoshik) COAs, but searches couldn't verify any shop's lookup tool. A third-party guide warns that a COA with no lot number is "general product information, not proof" ([GLP research guide](https://theo-site-6de49b00-50ac-49ba-96ba.onrender.com/journal/what-a-batch-certificate-of-analysis-shows)) **[low-authority source]**.
- **Why it converts:** It is proof rather than promise ("transparency with receipts", per Ritual's CIO via [Modern Retail](https://www.modernretail.co/operations/ritual-vitamins-wants-traceability-to-become-the-new-transparency/)). Add a capture point: "Email me this certificate for my records".
- **PEPTICITY version:** "CHECK YOUR LOT": the partner pharmacy's lot documentation, showing [testing lab], [method], [date] and a platinum "DOCUMENTED" chip. Placeholder: `[Your verification process]`.
- **Risk:** **CAUTION.** Only for products PEPTICITY lawfully supplies. Never say "Health Canada approved" unless true (show the DIN). A public COA for an unauthorized peptide is promotion. Confirm with the pharmacy which records it can lawfully publish.

### 14. "WAYS TO GET CARE" COMPARISON CHART
- **What:** A side-by-side table, downloadable, or emailed as "the full chart".
- **Real examples:** Hims's "Hims vs Hone" blog ([hims.com](https://www.hims.com/blog/hims-vs-hone)), Superpower's "Superpower vs Hone Health" ([superpower.com](https://superpower.com/biomarker-testing-companies/superpower-vs-hone-health)), and Maple's "Maple vs Felix" (Canada) ([getmaple.ca](https://www.getmaple.ca/compare/maple-vs-felix/)).
- **PEPTICITY version:** Compare **routes, not drugs**: your family doctor; a walk-in clinic; an online clinic; PEPTICITY (licensed clinician, then a licensed partner pharmacy); and "research use only" websites. Rows cover who decides, who fills, lot documentation, price clarity and privacy.
- **Risk:** **CAUTION.** Comparative claims must be true and provable when made (Competition Act s.74.01). Don't name competitors without counsel, and use categories instead.

### 15. "WHY WE DON'T SELL 'RESEARCH PEPTIDES'" EXPLAINER
- **What:** A myth-versus-fact explainer that builds trust, with "Get the full explainer by email".
- **Real basis:** Health Canada says a "research use only" label doesn't make a product legal ([HC advisory](https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm)). CBC reported the April 2026 warning ([CBC](https://www.cbc.ca/news/health/health-canada-peptides-injecting-unauthorized-drugs-9.7158178)), and McMaster says the evidence is mostly animal and cell studies ([McMaster](https://news.mcmaster.ca/analysis-the-peptide-problem-hype-is-outrunning-the-evidence/)).
- **Why it converts:** It sets PEPTICITY apart in a category whose buyers are wary of grey-market shops, so honesty becomes the hook.
- **Risk:** **SAFE**, provided it quotes Health Canada accurately and doesn't disparage named businesses.

---

## 3. INTERACTIVE

### 16. THE QUIZ, WITH "EMAIL ME MY SUMMARY"
- **What:** The existing routing quiz, with the result shown first and an **optional** email capture after it.
- **Real examples and data:** Covered in `quiz-and-guide-research.md` §1 (Ro, Juniper, Hims Canada). ConvertFlow's Sept 2026 benchmark of 1,063 lead-gen quizzes captured leads from 7.85% of visitors ([ConvertFlow](https://www.convertflow.com/benchmark-reports/lead-generation-quiz-funnel-benchmark-september-2026)).
- **PEPTICITY version:** On the result page, offer "EMAIL ME THIS SUMMARY", "TEXT ME A LINK TO FINISH BOOKING LATER" and an unticked "Also send GRACE'S LETTER".
- **Risk:** **SAFE** as built. Keep quiz answers out of ad pixels (BetterHelp precedent), and keep health answers out of the marketing email body.

### 17. ALL-IN COST AND COVERAGE ESTIMATOR (NOT DOSING)
- **What:** A calculator showing what the first one to three months cost, with "Email me this estimate".
- **Real example:** Ro's free GLP-1 Insurance Coverage Checker (launched 2024-08-13; for anyone, patient or not) returns a report on coverage, prior authorization and estimated out-of-pocket cost ([Ro press](https://ro.co/press/glp1-insurance-coverage-checker/); [NBC](https://www.nbcbayarea.com/news/business/money-report/digital-health-company-ro-launches-glp-1-insurance-coverage-checker-to-help-patients-navigate-costs/3624092/)).
- **Why it converts:** Price uncertainty is a top reason people stall, and a personal estimate is worth emailing to yourself.
- **PEPTICITY version:** The inputs are province, consult type and membership or no membership. The output is the consult fee, pharmacy fee, delivery and tax in CAD. Add a line on claiming: "Prescription drugs may be claimable when prescribed by a practitioner and recorded by a pharmacist. Check with your plan." This is the CRA test under ITA 118.2(2)(n) ([HR Reporter](https://www.hrreporter.com/focus-areas/compensation-and-benefits/how-to-guide-employees-on-eligible-medical-expenses/392955); [Federal Court decision](https://decisions.fct-cf.gc.ca/tcc-cci/decisions/en/27586/1/document.do)). Offer "We provide itemized receipts" `[confirm with Grace]`.
- **Risk:** **SAFE** if it is about price only. **STOP** for any dose, mg or "how much do I need" logic. Don't promise that anything is claimable.

---

## 4. COMMUNITY

### 18. GRACE'S LETTER (MONTHLY FOUNDER NEWSLETTER)
- **What:** A personal, useful monthly letter, which is the anchor of the email list.
- **Real examples:** Attia's free "non-lame weekly emails", which sit under a paid premium tier at $19/month or $149/year ([peterattiamd.com/newsletter](https://peterattiamd.com/newsletter/); [premium](https://peterattiamd.com/premium/)). Huberman's free monthly Neural Network ([hubermanlab.com/newsletter](https://hubermanlab.com/newsletter)).
- **PEPTICITY version:** "GRACE'S LETTER": Canadian regulatory news in plain words (Health Canada advisories, newly authorized generics), how the pharmacy partner works, one reader question answered, and the next live session.
- **Risk:** **SAFE**, as long as no issue promotes a named Rx drug for an indication. Footer: identification, mailing address, one working unsubscribe.

### 19. PODCAST OR SHORT VIDEO SERIES
- **What:** An episodic show that feeds the newsletter.
- **Real examples:** Huberman Lab and The Drive (Attia), both of which drive signups to their newsletters ([hubermanlab.com](https://hubermanlab.com/newsletter); [peterattiamd.com](https://peterattiamd.com/newsletter/)).
- **PEPTICITY version:** "THE PROCESS", a 5-minute video series: a day at the partner pharmacy, how a lot is tested, what a consult covers, and how privacy is handled.
- **Risk:** **CAUTION.** A clinician on camera talking up a specific therapy turns content into Rx advertising (Health Canada's Distinction Guidance, cited in the earlier doc). Keep it to process and safety, and pre-review scripts.

### 20. LIVE SESSIONS (VIRTUAL Q&A EVENINGS)
- **What:** Registration-based events.
- **Real example:** Next Health's paid one-day Longevity Summit, with summit-only access at $95 ([Business Wire](https://secure.businesswire.com/news/home/20260611512947/en/Next-Health-Announces-Inaugural-Longevity-Summit-in-Nashville-Featuring-Leading-Health-Experts); [Nashville Guru](https://nashvilleguru.com/200185/next-health-longevity-summit)).
- **PEPTICITY version:** A free virtual evening, "HOW PEPTIDE CARE WORKS IN CANADA", with Grace and a pharmacist, and pre-submitted questions only. Registration captures name, email and province, with unticked marketing consent. Send the replay link by email.
- **Risk:** **CAUTION.** Same rules as #19. No individual advice in a group setting ("book a consult for that"). Moderate questions.

### 21. PRIVATE MEMBER CIRCLE
- **What:** A members-only list or space.
- **Real example:** Juniper (Australia) markets a private member community as part of its paid program. Its page claims "300,000+ women", but other pages say 200,000+, so the figures are inconsistent ([myjuniper.com](https://www.myjuniper.com)) **[UNVERIFIED]**.
- **PEPTICITY version:** "THE INNER LIST" for patients: early guide releases, a seat at live sessions, and a direct line to the care coordinator.
- **Risk:** **CAUTION.** Peer health talk in a brand-run space can become de facto testimonials and claims. Start as an email list, not a forum. No published member counts.

---

## 5. TRUST DEVICES

### 22. REAL CLINICIAN AND PHARMACIST PROFILES
- **What:** Named people with credentials.
- **Real example:** Ro's advisors page, with physician bios ([ro.co/advisors](https://ro.co/advisors)).
- **Why it converts:** In an experiment summarized by the University of Nevada, Reno, identical information attributed to a doctor was trusted significantly more than when it was attributed to a blogger or actress ([Hitchcock Project review](https://hitchcockproject.org/research-review-how-readers-judge-expertise-and-credibility-online/)). Evidence on physician photos is small and mixed ([JMIR Infodemiology 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9987183/)).
- **PEPTICITY version:** "WHO DECIDES": [Name, licence type, province, licence number] with a link to the public college register so the visitor can verify. Placeholders until real people agree.
- **Risk:** **CAUTION.** Clinicians must not endorse products (check the relevant college's advertising rules) **[UNVERIFIED]**. Never invent people or credentials.

### 23. ALL-IN PRICE CARD (AND A DOWNLOADABLE PRICE SHEET)
- **What:** One price per program showing exactly what it includes.
- **Real examples:** Hims Canada: "starting at $149 CAD/month", with "every customer begins with a personalized clinical assessment" ([Hims newsroom](https://news.hims.com/newsroom/hims-hers-introduces-access-to-generic-semaglutide-for-canadian-customers-qzmp9)). Ro says you're "not charged further" if you aren't suitable ([Ro](https://ro.co/body-program/guide/program-online-visit)). The counter-example is the FTC's NextMed order over hidden costs ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-approves-final-order-against-telehealth-provider-nextmed-over-charges-it-used-deceptive)).
- **PEPTICITY version:** "WHAT YOU PAY, ALL IN": consult, pharmacy, delivery, renewal terms beside the button, and "Email me the price sheet".
- **Risk:** **SAFE**, and it is required by drip-pricing law. On the price list, name an Rx with **name, price and quantity only**, never with the goal.

### 24. LAWFUL "NOTHING TO PAY IF IT ISN'T RIGHT" PROMISE
- **What:** A risk-reversal promise.
- **Real examples:** Ro: not charged for the program if not suitable ([Ro](https://ro.co/body-program/guide/program-online-visit)). Numan's weight-loss money-back guarantee depends on conditions such as staying on the medication for 6 months and logging weight ([Numan T&Cs](https://help.numan.com/en/articles/9216518-weight-loss-money-back-guarantee-terms-conditions); [Numan page](https://www.numan.com/lps/gbr/weight-loss/wl-money-back-guarantee)).
- **Why it converts:** A review of 22 papers (Janakiraman et al., *J. Retailing*) found lenient return policies lift purchases, though they can also raise returns ([AMA summary](https://www.ama.org/publications/MarketingInsights/Pages/lenient-return-policies-increase-sales.aspx)).
- **PEPTICITY version:** "IF THE CLINICIAN DECIDES IT ISN'T RIGHT FOR YOU, YOU PAY NOTHING FOR THE PROGRAM." Add a clear consult-fee and cancellation policy `[confirm with Grace]`.
- **Risk:** **STOP** for an outcome guarantee like Numan's (results or money back) on an Rx in Canada. It is an implied performance claim needing proof in advance (Competition Act s.74.01(1)(b)), and it is an inducement tied to Rx use. A **process** guarantee (not charged if declined, easy cancellation) is **SAFE**.

### 25. THE PRIVACY PROMISE AS A HOOK
- **What:** A visible pledge beside every form.
- **Real basis:** The FTC's BetterHelp and GoodRx cases over health data sent to ad platforms ([DWT](https://www.dwt.com/blogs/privacy--security-law-blog/2023/03/ftc-pixel-tracking-health-goodrx-betterhelp)), and the OPC's position that health remarketing needs express consent ([OPC](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_07_consent/)).
- **PEPTICITY version:** A one-line pledge under each email field: "YOUR ANSWERS NEVER GO TO AD PLATFORMS. UNSUBSCRIBE IN ONE CLICK." Link it to a plain-language privacy page.
- **Risk:** **SAFE**, but only if it is true. Audit the tags first.

---

## 6. URGENCY AND SCARCITY (HONEST ONLY)

### 26. LIVE "NEXT AVAILABLE CONSULT" TIME
- **What:** Real-time availability, so the scarcity is true.
- **Real basis:** The Competition Bureau allows urgency only when it is true. Fake timers and frozen "low stock" counters are misleading ([Competition Bureau](https://www.canada.ca/en/competition-bureau/news/2024/11/the-urgency-is-fake-but-the-deception-is-real.html); [Fake urgency cues page](https://competition-bureau.canada.ca/en/node/918)).
- **PEPTICITY version:** "NEXT OPENING WITH A CLINICIAN LICENSED IN [PROVINCE]: [THU 2:30 PM ET]", pulled live from the booking calendar. If it's full, show "Notify me of an opening" (#5).
- **Risk:** **SAFE** if it's live data. **STOP** for countdown timers, "only 3 spots left" that isn't true, or offers renewed after a deadline.

---

## 7. REFERRAL AND LOYALTY

### 27. REFERRAL ("SHARE PEPTICITY")
- **What:** Existing customers invite friends.
- **Real examples:** Oura gives each referral link 10% off a ring, for up to 10 friends ([Oura support](https://support.ouraring.com/hc/articles/360060138593)). Function Health has reportedly paid $100 per referral 60 to 90 days later ([Function Notion page](https://functionhealth.notion.site/How-To-Talk-About-Your-Referral-135b0b10ae8c8014a335faf945ad0de7)) **[may be dated]**. Thorne's programme is invitation-only, capped at 5 referrals a year and 20 lifetime ([Thorne terms](https://www.thorne.com/referral-terms)).
- **Why it converts:** Schmitt, Skiera & Van den Bulte (*J. Marketing* 2011, German bank, about 10,000 customers) found referred customers worth at least 16% more, with higher retention ([Wharton PDF](https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Schmitt-Skiera-vandenBulte-2011-Referral-Programs-Customer-Value.pdf)).
- **PEPTICITY version:** A **reward-free** share: "SEND A FRIEND THE PRIMER" or "SHARE THE CONSULT PREP SHEET", which captures the friend's email only if the friend opts in themselves.
- **Risk:** **STOP** for cash, credit or discounts tied to an Rx, a peptide program or a pharmacy fill (OCP and B.C. bylaws, and CBC's report of seven provinces). Rewards on non-Rx shop items only are **CAUTION** (counsel). Never email a referred friend without their own consent (CASL; consent can't be given on someone else's behalf).

### 28. LOYALTY POINTS
- **What:** Points for purchases.
- **Real examples:** Thorne Rewards: points per dollar, no cash value ([thorne.com/rewards](https://www.thorne.com/rewards); [Thorne FAQ](https://in.thorne.com/faq/how-do-i-earn-reward-points)). Nootropics Depot's ND Insider ([ND support](https://support.nootropicsdepot.com/article/160-nd-insider-rewards)).
- **PEPTICITY version:** Status without points: a "MEMBER SINCE [YEAR]" card, first access to live sessions, and the Inner List (#21).
- **Risk:** **STOP** on Rx and pharmacy services (Ontario policy; B.C. bylaws upheld). Points on cosmetic or merch purchases only are **CAUTION**.

---

## 8. RETARGETING-FRIENDLY (WITHIN THE RULES)

### 29. CONSENTED FOLLOW-UP INSTEAD OF PIXEL RETARGETING
- **What:** Follow up on an abandoned quiz or booking, but **only** with people who gave email consent, and with no health details in the email.
- **Real basis:** Since February 2025, Meta reportedly restricts lower-funnel events and conversion audiences for health and wellness accounts ([Search Engine Land](https://searchengineland.com/meta-ads-restrictions-health-wellness-campaigns-453094)). Google bars personalized ads on sensitive health topics ([OuterBox summary](https://www.outerboxdesign.com/articles/digital-marketing/health-and-wellness-advertising-restrictions-on-google-ads-keeping-your-campaigns-compliant/); [Google Rx policy](https://support.google.com/adspolicy/answer/15598647)).
- **PEPTICITY version:** "YOU WERE ONE STEP AWAY. HERE'S YOUR LINK TO FINISH." The email holds the link and never the answers. Send at most two, then stop.
- **Risk:** **CAUTION.** PIPEDA express consent; the CASL unsubscribe. Never upload quiz answers or "visited weight page" lists to ad platforms.

---

## 9. CHECKOUT AND BOOKING

### 30. FREE "TALK IT THROUGH" CALL OR FREE ASSESSMENT
- **What:** A no-cost first step.
- **Real examples:** Numan's free online consultation, a roughly five-minute questionnaire reviewed by a UK prescriber within 24 hours ([Numan](https://www.numan.com/weight-loss?pc=wl94x1)). PepScribe's free online assessment reviewed by a clinician ([Fortune press release](https://fortune.com/press-releases/pepscribe-telehealth-peptide-therapy-at-home-2026-07-02/)). Hone instead charges for its first test kit ([Sacra](https://sacra.com/research/hone-health/)).
- **PEPTICITY version:** A free 15-minute call with a **care coordinator**, who isn't a clinician and gives no medical advice, covering process, price and province. The paid clinician consult follows. Booking asks for name, phone, email, province and best time.
- **Risk:** **CAUTION.** Make it clear the coordinator isn't a clinician (AB 489 logic; see the earlier doc). Check whether a free consult counts as an inducement under provincial physician rules **[UNVERIFIED]**.

### 31. REFUNDABLE BOOKING DEPOSIT, CREDITED TO THE CONSULT
- **What:** A small hold that cuts no-shows and qualifies leads.
- **Real basis:** A National University Health System (Singapore) quality-improvement project reported sleep-study no-shows falling from 9.1% to 4.3% after deposits were introduced ([CHI Singapore](https://child.chi.sg/learn/child-collection/projects/deposit-collection-reduces-no-show-rates-for-sleep-studies/)). This was a QI report, not a trial, and deposits may deter some bookers.
- **PEPTICITY version:** "$[X] HOLDS YOUR TIME AND COMES OFF YOUR CONSULT FEE. CANCEL [24 H] AHEAD FOR A FULL REFUND." It sits beside the button, not in the terms.
- **Risk:** **SAFE** if it is disclosed up front and included in the all-in price (drip pricing).

### 32. CALL-BACK REQUEST ("CALL ME")
- **What:** A three-field form for people who won't book online.
- **Real basis:** The Oldroyd/MIT and InsideSales speed-to-lead data reports much higher contact and qualification odds at 5 minutes than at 30 minutes. It is vendor data analysed by an academic, not a peer-reviewed paper ([Callingly summary](https://callingly.com/blog/state-of-speed-to-lead); [Electronics Cooling, 2011](https://www.electronics-cooling.com/2011/06/increase-your-sales-effectiveness-by-21x-in-25-minutes/)).
- **PEPTICITY version:** "REQUEST A CALL" with name, mobile and province, and a time window (morning, afternoon or evening). The success screen says "[We'll call within X business hours]" (placeholder until true).
- **Risk:** **SAFE.** A call-back request is consent for **that** call, not for marketing, so add a separate unticked box for the letter.

---

## 10. POST-SIGNUP NURTURE

### 33. THE WELCOME SEQUENCE
- **What:** An automated series after any signup.
- **Real example:** Attia's signup delivers the 5-tactic toolkit, then moves to weekly emails ([peterattiamd.com/newsletter](https://peterattiamd.com/newsletter/)).
- **Data (vendor or synthesis, directional only):** Welcome emails average about 51% open rates, inflated by Apple Mail Privacy Protection ([Mailblaze](https://www.mailblaze.com/thinking/welcome-series-highest-open-rate)). In a 5-email sequence, email 3 is reported as the peak for orders, at a 2.0 to 2.8% placed-order rate ([Branvas](https://branvas.com/blogs/news/welcome-email-sequence-benchmarks)). Mailchimp's 2011 data (as cited) found double opt-in lists had more opens and clicks but grew more slowly ([Toptal](https://www.toptal.com/external-blogs/growth-collective/double-opt-in)).
- **PEPTICITY sequence (proposal):**
  1. **Day 0, "YOUR PRIMER IS HERE"**: the asset, who Grace is, and what to expect from the emails.
  2. **Day 2, "HOW CARE WORKS HERE"**: clinician decides, then pharmacy fills, then discreet delivery (link to the prep sheet, #12).
  3. **Day 4, "READING A LOT CERTIFICATE"**: link to the COA lookup (#13).
  4. **Day 7, "WHAT IT COSTS, ALL IN"**: the estimator (#17), with the "nothing to pay if it isn't right" promise (#24).
  5. **Day 10, "QUESTIONS PEOPLE ASK US"**: reader Q&A, then "Book a free call" (#30) or "Request a call" (#32).
  6. **Day 14 onward**: move to GRACE'S LETTER monthly (#18).
- **Risk:** **SAFE** with the wording rules. Confirm double opt-in for the marketing list (`[counsel/owner decision]`), and keep consent records per CASL.

---

## 11. RECOMMENDED STACK AND PLACEMENT (proposal for Grace to approve)

| Spot | Hook(s) | Notes |
|---|---|---|
| Top of every page | #8 announcement bar | One true service line, dismissable |
| Hero | Primary: quiz (#16). Secondary: "Get the PRIMER" (#9) | One primary call to action per viewport |
| After "How it works" | #12 consult prep sheet inline form | The most compliant magnet; lead with it |
| Trust section | #22 people, #13 lot lookup, #25 privacy pledge | Each with "email me" |
| Pricing | #23 price card, #17 estimator, #24 promise, #31 deposit | All-in, CAD |
| Quiz result | #16 email summary, #3 waitlist (if unserved), #26 next opening | Result first, email optional |
| Footer | #18 GRACE'S LETTER signup, #32 request a call | Unticked consent and privacy link |
| Behaviour-triggered | #7 slide-in (once per session, max 3 ever) | Never over the quiz or booking |
| Mobile | Sticky bottom bar: "TAKE THE QUIZ" plus "REQUEST A CALL" | Hidden while the keyboard is open |

**Measure (privacy-safe):** track `form_view`, `form_start`, `form_submit` and `cta_click:{id}` per hook ID (H01 to H33). Send no field values, and no quiz answers, to analytics or ad tools.

---

## 12. PLACEHOLDERS TO FILL (none may ship as written)
`[Your verification process]` · `[testing lab] [method] [date]` · `[Name, licence type, province, licence number]` · `[We'll call within X business hours]` · `[cosmetic topicals, if sold]` · `[$X deposit / 24 h policy]` · `[consult-fee and cancellation policy]` · `[itemized receipts: confirm with Grace]` · `[N] consult slots` (only if real) · `[Consent wording: Canada, lawyer to review]`

## 13. NEW COUNSEL QUESTIONS (add to §7 of the earlier doc)
1. Can any discount, free consult or gift be tied to the **clinician consult fee** (not the Rx) under the physician and NP colleges' rules in each served province?
2. Do the pharmacy-college inducement bans reach PEPTICITY itself, as a non-pharmacy marketing the pharmacy's service, and does a referral reward on non-Rx items still count as an inducement?
3. May the partner pharmacy publish lot certificates (COAs) for compounded products, and in what form?
4. Is a "not charged if the clinician declines" promise fine as worded, and what cancellation and refund terms are required?
5. Should the marketing list use double opt-in, and what consent wording works for each lane: letter, SMS and call-back?

---

## SOURCES (reached via web-search summaries; primary pages not opened)

**Canada rules:** [C.01.044](https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/section-C.01.044.html) · [C.01.048](https://laws-lois.justice.gc.ca/eng/Regulations/c.r.c.,_c._870/section-C.01.048-20200701.html) · [SOR/2020-74](https://gazette.gc.ca/rp-pr/p2/2020/2020-04-29/html/sor-dors74-eng.html) · [Ad Standards DTCA 2026](https://adstandards.ca/wp-content/uploads/DTCA-Checklist-2026-EN-Ad-Standards.pdf) · [HC "Think twice"](https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm) · [HC Canada Peptide seizure](https://recalls-rappels.canada.ca/en/alert-recall/unauthorized-injectable-peptide-drugs-seized-and-sold-canada-peptide-may-pose-serious) · [CBC, HC warning](https://www.cbc.ca/news/health/health-canada-peptides-injecting-unauthorized-drugs-9.7158178) · [McMaster](https://news.mcmaster.ca/analysis-the-peptide-problem-hype-is-outrunning-the-evidence/) · [OCP loyalty policy](https://ocpinfo.com/pharmacy-professionals/rules-and-standards-of-the-profession/practice-policies-guidelines/loyalty-points-program/) · [CBC, B.C. ban](https://amp.cbc.ca/news/canada/british-columbia/pharmacy-loyalty-points-ban-1.3668434) · [Chain Drug Review](https://chaindrugreview.com/sobeys-loses-appeal-of-ban-on-pharmacy-rewards/) · [CBC, N.S.](https://amp.cbc.ca/news/canada/nova-scotia/pharmacy-rewards-in-nova-scotia-staying-for-now-1.6497027) · [Alberta inducements FAQ](https://abpharmacy.ca/wp-content/uploads/FAQ_Inducements.pdf) · [CRTC CASL infographic](https://crtc.gc.ca/pubs/casl_infograph4_eng.pdf) · [MLT Aikins, CASL](https://www.mltaikins.com/insights/casl-is-constitutional-and-some-guidance-on-how-to-interpret-it/) · [Competition Bureau, fake urgency](https://www.canada.ca/en/competition-bureau/news/2024/11/the-urgency-is-fake-but-the-deception-is-real.html) · [Bureau urgency page](https://competition-bureau.canada.ca/en/node/918) · [Bureau, Dufresne](https://www.canada.ca/en/competition-bureau/news/2023/09/the-dufresne-group-to-pay-325-million-penalty-to-settle-competition-bureau-concerns-over-marketing-claims.html) · [Goodmans, Cineplex](https://goodmans.ca/insights/article/the-cineplex-decision---a-new-chapter-opens-in-canadian-competition-law) · [Miller Thomson, contests](https://www.millerthomson.com/en/insights/marketing-advertising-and-product-compliance/dont-let-your-contest-become-a-compliance-risk-a-practical-guide-for-businesses/) · [SmartBiggar, contests](https://www.smartbiggar.ca/insights/publication/canadian-contests-what-you-need-to-know) · [OPC consent](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_07_consent/) · [HR Reporter, medical expenses](https://www.hrreporter.com/focus-areas/compensation-and-benefits/how-to-guide-employees-on-eligible-medical-expenses/392955) · [Federal Court, 118.2(2)(n)](https://decisions.fct-cf.gc.ca/tcc-cci/decisions/en/27586/1/document.do) · [ISMP Canada 5 Questions](https://www.ismp-canada.org/medrec/5questions.htm) · [HEC 5 Questions](https://healthcareexcellence.ca/en/resources/five-questions-to-ask-about-your-medications) · [ISMP poster](https://www.ismp-canada.org/download/posters/BMJIHI-5Qs-AMS2018.pdf)

**Ads and privacy:** [DWT, GoodRx/BetterHelp](https://www.dwt.com/blogs/privacy--security-law-blog/2023/03/ftc-pixel-tracking-health-goodrx-betterhelp) · [Search Engine Land, Meta](https://searchengineland.com/meta-ads-restrictions-health-wellness-campaigns-453094) · [Triple Whale, Meta](https://www.triplewhale.com/blog/meta-health-and-wellness-brands) · [Google Rx services policy](https://support.google.com/adspolicy/answer/15598647) · [OuterBox, Google health](https://www.outerboxdesign.com/articles/digital-marketing/health-and-wellness-advertising-restrictions-on-google-ads-keeping-your-campaigns-compliant/) · [FTC NextMed](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-approves-final-order-against-telehealth-provider-nextmed-over-charges-it-used-deceptive)

**Brand examples:** [Attia newsletter](https://peterattiamd.com/newsletter/) · [Attia Longevity 101](https://peterattiamd.com/longevity-101-guide/) · [Attia premium](https://peterattiamd.com/premium/) · [Huberman newsletter](https://hubermanlab.com/newsletter) · [Ritual Made Traceable](https://ritual.com/ca/made-traceable) · [Modern Retail, Ritual](https://www.modernretail.co/operations/ritual-vitamins-wants-traceability-to-become-the-new-transparency/) · [USADA, NSF lot check](https://usada.org/?p=76436) · [Bio-Techne CoA finder](https://www.bio-techne.com/support/cofa-finder-tool) · [Ro coverage checker](https://ro.co/press/glp1-insurance-coverage-checker/) · [NBC on Ro checker](https://www.nbcbayarea.com/news/business/money-report/digital-health-company-ro-launches-glp-1-insurance-coverage-checker-to-help-patients-navigate-costs/3624092/) · [Ro advisors](https://ro.co/advisors) · [Ro online visit](https://ro.co/body-program/guide/program-online-visit) · [Hims Canada](https://news.hims.com/newsroom/hims-hers-introduces-access-to-generic-semaglutide-for-canadian-customers-qzmp9) · [Hims vs Hone](https://www.hims.com/blog/hims-vs-hone) · [Superpower vs Hone](https://superpower.com/biomarker-testing-companies/superpower-vs-hone-health) · [Superpower biomarkers](https://superpower.com/best-biomarkers-categories/digestive-detox) · [Maple vs Felix](https://www.getmaple.ca/compare/maple-vs-felix/) · [Thriva what we test](https://thriva.co/what-we-test) · [Function waitlist, Fitt](https://insider.fitt.co/function-health-co-founder-coo-pranitha-patil) · [Function, Wikipedia](https://en.wikipedia.org/wiki/Function_Health) · [Function referral](https://functionhealth.notion.site/How-To-Talk-About-Your-Referral-135b0b10ae8c8014a335faf945ad0de7) · [Superpower, TechCrunch](https://techcrunch.com/2025/04/22/superpower-wants-to-help-people-detect-and-address-health-issues-before-symptoms-appear) · [Next Health founding memberships](https://businesswire.com/news/home/20251111512017/en/Next-Health-Expands-Nashville-Footprint-with-New-Green-Hills-Location) · [Next Health summit](https://secure.businesswire.com/news/home/20260611512947/en/Next-Health-Announces-Inaugural-Longevity-Summit-in-Nashville-Featuring-Leading-Health-Experts) · [Juniper](https://www.myjuniper.com) · [Numan free consult](https://www.numan.com/weight-loss?pc=wl94x1) · [Numan guarantee T&Cs](https://help.numan.com/en/articles/9216518-weight-loss-money-back-guarantee-terms-conditions) · [Numan guarantee page](https://www.numan.com/lps/gbr/weight-loss/wl-money-back-guarantee) · [PepScribe](https://fortune.com/press-releases/pepscribe-telehealth-peptide-therapy-at-home-2026-07-02/) · [Hone, Sacra](https://sacra.com/research/hone-health/) · [Felix, Expert Beacon](https://expertbeacon.com/felix-health-review/) · [Felix, Lifetimes](https://lifetimescanada.com/blog/telehealth/online-pharmacies-in-canada-2026-pocketpills-vs-felix-for-prescription-delivery) · [Oura referral](https://support.ouraring.com/hc/articles/360060138593) · [Thorne referral terms](https://www.thorne.com/referral-terms) · [Thorne rewards](https://www.thorne.com/rewards) · [Thorne FAQ](https://in.thorne.com/faq/how-do-i-earn-reward-points) · [ND Insider](https://support.nootropicsdepot.com/article/160-nd-insider-rewards) · [AG1 offer, GGR](https://www.garagegymreviews.com/athletic-greens-coupon-code) · [Elite Peptides, SimplyCodes](https://simplycodes.com/store/elitepeptides.com) · [Nox Peptides release](https://www.daily-tribune.com/online_features/press_releases/nox-peptides-launches-20-discount-offer-for-new-customers-across-canada/article_80631b55-f23d-525d-b512-40eb24dee589.html) · [Peptide Protocol Wiki](https://www.peptideprotocolwiki.com/vendors/buy-peptides-4-research) · [GLP COA guide](https://theo-site-6de49b00-50ac-49ba-96ba.onrender.com/journal/what-a-batch-certificate-of-analysis-shows)

**Conversion research:** [Klaviyo sign-up forms](https://www.klaviyo.com/blog/sign-up-form-best-practices) · [Popupsmart data](https://popupsmart.com/our-data) · [Popupsmart exit intent](https://popupsmart.com/blog/do-exit-intent-popups-work) · [notify-me.io](https://notify-me.io/reports/back-in-stock-benchmarks-3900-stores) · [EcommerceDB/Omnisend](https://ecommercedb.com/insights/email-marketing-back-in-stock-and-welcome-emails-have-the-best-conversion-rates/4569) · [ATTN Agency, two-tap](https://www.attnagency.com/blog/attentive-shopify-review) · [Inboxally](https://www.inboxally.com/blog/klaviyo-email-benchmarks) · [Mailblaze](https://www.mailblaze.com/thinking/welcome-series-highest-open-rate) · [Branvas](https://branvas.com/blogs/news/welcome-email-sequence-benchmarks) · [Toptal, double opt-in](https://www.toptal.com/external-blogs/growth-collective/double-opt-in) · [Contentsquare/Baymard](https://contentsquare.com/guides/cart-abandonment/stats/) · [ConvertFlow quiz benchmark](https://www.convertflow.com/benchmark-reports/lead-generation-quiz-funnel-benchmark-september-2026) · [Schmitt et al. 2011](https://faculty.wharton.upenn.edu/wp-content/uploads/2012/04/Schmitt-Skiera-vandenBulte-2011-Referral-Programs-Customer-Value.pdf) · [AMA, lenient returns](https://www.ama.org/publications/MarketingInsights/Pages/lenient-return-policies-increase-sales.aspx) · [Hitchcock Project, source credibility](https://hitchcockproject.org/research-review-how-readers-judge-expertise-and-credibility-online/) · [JMIR Infodemiology 2022](https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9987183/) · [CHI Singapore deposits](https://child.chi.sg/learn/child-collection/projects/deposit-collection-reduces-no-show-rates-for-sleep-studies/) · [Callingly, speed to lead](https://callingly.com/blog/state-of-speed-to-lead) · [Electronics Cooling, Oldroyd](https://www.electronics-cooling.com/2011/06/increase-your-sales-effectiveness-by-21x-in-25-minutes/) · [Corey Haines popups guide](https://mcpservers.org/th/agent-skills/coreyhaines31/popups)

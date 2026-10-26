# PEPTICITY: QUIZ AND GUIDE-BOT RESEARCH

Prepared 2026-10-26 for the PEPTICITY quiz (routes visitors to a care category, then to booking) and the vetted-answers guide bot (later live AI).

**How this was researched.** Direct page fetches were blocked in this environment, so every source below was reached through web-search results and their summaries. The primary pages were not opened. Treat each figure as "reported by the cited page" and check it at the URL before it is quoted publicly. Anything I could not confirm is marked **[UNVERIFIED]**. No statistic here is invented.

**This is a risk scan, not legal advice.** Section 7 lists the questions that need a Canadian health-law lawyer before launch. One of them (7.1) decides whether parts of the catalogue can be marketed at all.

---

## 0. THE FINDINGS THAT MATTER MOST

1. **Most of the non-GLP-1 catalogue is named in Health Canada advisories as unauthorized.** Health Canada's public advisories on seized and online-sold injectable peptides name BPC-157, TB-500, CJC-1295, ipamorelin, Epitalon, GHK-Cu, NAD+, AOD-9604, DSIP, MOTS-c, retatrutide and others. Health Canada says a "research use only" label does not make a product legal. Selling unauthorized drugs is illegal in Canada. This is a counsel question before it is a copy question (see 7.1).
2. **In Canada, a consumer-facing ad for a prescription drug may state only the name, the price and the quantity** (Food and Drug Regulations C.01.044). The quiz result page therefore should not put "your goal" next to a named Rx drug. The thing being sold should be **the clinician consult and the care service**. Advertising a service is outside the Food and Drugs Act, but naming products for an indication is not.
3. **Regulators target "sameness" and "clinically proven".** The US FDA sent warning letters in September 2025, March 2026 (30 letters) and June 2026 (25 letters). They targeted telehealth claims that compounded GLP-1s are "the same active ingredient as Ozempic", are "clinically proven", or come from an "FDA-approved pharmacy". Health Canada authorized generic semaglutide in April to June 2026, so an approved option now exists in Canada.
4. **Showing the result before asking for email is the right default for this category.** Vendor data says gating the result before email captures more emails. But the health-information consent rules (PIPEDA: express consent for sensitive data) and CASL (no pre-ticked boxes) favour showing the result first, then asking with an unticked opt-in. That matches the current build.
5. **The "not a doctor" message works best as several quiet layers.** These are a subtitle in the bot header, one line in the first bot message, one line under the quiz result, a required consent line at checkout, and the footer. Research reported by MIT Technology Review found medical disclaimers in AI health answers fell from 26% (2022) to 1% (2025), and researchers link the missing disclaimers to over-trust. Under California AB 489 (in force 2026-01-01), an AI tool may not imply that a licensed human is giving the advice. So the bot must never be named or styled like a clinician.

---

## 1. HOW TOP TELEHEALTH AND WELLNESS QUIZ FUNNELS ARE BUILT

### 1.1 What the public record shows, by company

| Company | What's documented | Source |
|---|---|---|
| **Noom** | A very long web onboarding: "up to 113 screens", 10 to 15 minutes, dynamic branching. The author tested about 20 paths. One block asks 10 questions with 4 answers each. Another estimate puts it at 40 to 50 questions. Interstitial social-proof screens sit between questions. Neither count comes from Noom. | [RevenueCat teardown](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel); [Rocketship HQ](https://www.rocketshiphq.com/?p=5491); [Paddle, Fix That Funnel](https://www.paddle.com/studios/shows/fix-that-funnel/noom) |
| **Ro** | An online visit covers health history, weight goals, family history, lifestyle, medications and allergies. A provider reviews it (Ro says about 2 to 3 days) and may order labs. If you aren't suitable, you are "not charged further for the program". BMI thresholds are **[UNVERIFIED]** on Ro's own site. | [Ro, program online visit](https://ro.co/body-program/guide/program-online-visit); [Ro, how it works](https://ro.co/weight-loss/how-it-works/) |
| **Hims & Hers** | An online intake form (symptoms, medical history), then async messaging or a video visit where the state requires one. In Canada since May 2026: generic semaglutide "starting at $149 CAD/month", and "every customer begins with a personalized clinical assessment by an independent, licensed healthcare provider". One vendor blog claims one question per screen with branching **[UNVERIFIED]**. | [Hims support](https://support.hims.com/hc/en-us/articles/360032844051-How-does-this-work); [Hims Canada newsroom](https://news.hims.com/newsroom/hims-hers-introduces-access-to-generic-semaglutide-for-canadian-customers-qzmp9); [Hims investors release, 2026-05-21](https://investors.hims.com/news/news-details/2026/Hims--Hers-Expands-GLP-1-Offering-in-Canada-with-Generic-Semaglutide/default.aspx) |
| **Juniper (AU)** | The quiz opens with motivation and past-frustration questions and ends on "What is your motivation to lose weight?". The result says "you may be eligible", because "your practitioner will review your answers". **Juniper says it can't name its treatments before a consultation because of Australian therapeutic-goods rules.** This is the closest analogue to Canada's C.01.044 limits. | [Juniper quiz](https://myjuniper.com/e/quiz); [Juniper join](https://myjuniper.com/join) |
| **Felix (Canada)** | A written questionnaire with no call or video: history, symptoms, medications. A licensed Canadian practitioner reviews it, reportedly within about 24 hours, and may ask follow-ups. A pharmacy ships in about 2 to 3 business days with free, discreet delivery and 24/7 chat. The age 18+ minimum and province list are **[UNVERIFIED]**. | [Medimap listing](https://medimap.ca/clinic/weight-loss/on/toronto/felix-health); [App listing](https://apps.appfollow.io/ios/felix-online-healthcare/6473749213?country=ca) |
| **Mochi / Eden** | Online questionnaire, then clinician review, then a prescription if eligible. Eden reportedly lets people upload labs. Sources are secondary and affiliate. | [Mochi mirror](https://mochihealth.readthedocs.io); [HealthRx on Eden](https://healthrx.com/articles/eden-semaglutide) |
| **Hone Health** | Questionnaire, then an at-home finger-prick blood kit, then a clinician appointment. The quiz wording is not public. | [Hims vs Hone comparison](https://www.hims.com/blog/hims-vs-hone) |
| **Function Health** | Payment and membership come first. The health-history questionnaire comes after signup (conditions, medications, supplements, surgical and family history), reportedly 5 to 10 minutes. Secondary sources only. | [medicalnewstoday.us](https://medicalnewstoday.us/?p=4351) |
| **PepScribe (US peptides, 2026)** | A free online assessment reviewed by a licensed clinician, typically within 24 hours, filled by a licensed 503A compounding pharmacy. | [Fortune press release](https://fortune.com/press-releases/pepscribe-telehealth-peptide-therapy-at-home-2026-07-02/) |
| Henry Meds, Maximus, Numan, Knowmore, "Wellness Hub" | **No usable public detail found.** Not reported. | none |

**The common pattern** across the documented flows:
1. Goal or motivation first, the low-effort and aspirational question.
2. Personal and lifestyle questions next.
3. Medical history, medications and family history last.
4. The result promises eligibility review, not a product: "you may be eligible", "a provider reviews".
5. A licensed clinician is the gate, and the pharmacy ships.
6. Price is shown as "starting at" plus a clear statement of what you're not charged for if you're declined.

### 1.2 Conversion research (only what has a source)

| Principle | Evidence | How it applies to PEPTICITY |
|---|---|---|
| **Endowed progress** | Car-wash loyalty cards: 34% of customers with a 10-stamp card that had 2 stamps pre-filled finished it, versus 19% with a blank 8-stamp card. Same work. Nunes & Drèze 2006, *J. Consumer Research* 32(4). The effect is stronger when people are given a reason for the head start. | Pre-fill Q1 from the audience switcher ("I'm here for…"), and show the stage rail as already started: "GOAL ✓, you told us this already". |
| **Goal-gradient** | Coffee-card customers bought more often as they neared the reward. Users rated more songs as they neared a threshold. Perceived distance mattered more than actual distance. Kivetz, Urminsky & Zheng 2006, *J. Marketing Research* 43. | Use a 4-stage rail (not "question 7 of 23"). Make the last stage short so the finish feels close. |
| **Labor illusion** | People valued a travel search more when it showed the work being done ("checking airline X") than with a plain progress bar, even with waits up to about 60 s. Buell & Norton 2011, *Management Science* 57(9). A blind progress bar did not help. | The "building your plan" moment should name the real steps it is doing ("Matching your focus… Checking your province… Preparing your next steps"). Keep it to about 2 to 3 s and don't fake a medical analysis. |
| **Multi-step forms** | Often claimed lifts ("up to 300%", "86%") have **no traceable primary data** **[UNVERIFIED]**. One reported case went from 0.96% to 8.1% after switching the same fields to multi-step **[secondary]**. Sources agree multi-step helps mainly on long forms. | One question per screen is right because the quiz has more than 5 inputs. |
| **Form completion** | Zuko (2025, via CrazyEgg): 45% of form visitors and 66% of form starters complete. Typeform has reported a 47.3% completion rate (2023). No source gives a completion-versus-question-count curve. | Measure drop-off per question (Typeform's method: stops at Q ÷ views of Q) rather than guessing an ideal length. |
| **Quiz benchmarks** | ConvertFlow, Sept 2026, 1,063 lead-gen quiz campaigns: lead captured from 7.85% of visitors, 23.84% engage. Product quizzes (2,120 campaigns) engage 44.2%. Octane AI (vendor) claims 7 to 25% quiz-to-purchase versus 2 to 3% general ecommerce, and a 60% "industry average" completion. These are vendor-selected figures. | Use as rough targets only. Track them yourself. |
| **Email gate timing** | Vendor figures (Octane AI): gating before the result gives 45 to 55% opt-in, after the result 25 to 35%, and an optional skip 35 to 42%. Methodology isn't shown. | See 1.3: for health data, the result comes first. |
| **Checkout friction** | Baymard (via secondary blogs): about 70% average cart abandonment. Top reasons are extra costs (about 39%), forced account creation (about 19 to 24%) and a too-long checkout (about 18%). Edition and year are unclear **[secondary]**. | Show all-in pricing on the result page. Use guest booking with no forced account before the consult. |

### 1.3 Lessons for the build

- **Keep the quiz short: 10 to 12 taps, about 2 minutes.** Noom proves long can work when every screen feels personal, but Noom sells a habit app. PEPTICITY's intake belongs to the clinician, so the quiz only needs to route. The clinician's own intake can go deeper after booking, the way Function Health and Ro do it.
- **Ask easy questions first and sensitive ones last, but always before the result.** Every documented flow does this.
- **Show the result before asking for an email.** Gating captures more emails in vendor data, but PEPTICITY collects health answers. PIPEDA treats health-related data as sensitive, needing express consent. CASL rejects pre-ticked boxes. A result held hostage behind an email also reads as "salesy", which works against the classy tone. Offer "Email me this summary" as an optional extra on the result page, with an unticked marketing box.
- **Sell the next step, not the molecule.** Ro, Juniper and Hims Canada all end on "a licensed provider reviews". Juniper doesn't name the drug at all. That is also the lawful Canadian ceiling (see 3).
- **Say up front what isn't charged if they're declined.** Ro does this. The FTC's NextMed order and Canada's drip-pricing rule (Cineplex, $38.9M penalty) both punish hidden costs.

---

## 2. ROUTING QUESTIONS AND SAFETY SCREENING

### 2.1 Categories (named as the visitor's intent, never as a product promise)

Map the brief's five audiences onto care categories. The **category labels are what the visitor wants**, so they are not claims.

| Visitor-facing category (CAPS on page) | Audience | Internal routing only (never shown beside the goal) | Lane |
|---|---|---|---|
| WEIGHT AND BODY COMPOSITION | Men 35+, women 40+ | GLP-1 pathway (clinician decides; Health Canada-authorized generic semaglutide exists as of 2026) | Clinician |
| TRAINING AND RECOVERY | Gym and training | Recovery-peptide programs (**see 7.1: named in HC advisories**) | Clinician |
| ENERGY AND FEELING LIKE MYSELF | Low energy | NAD+ and similar (**see 7.1**) | Clinician |
| HEALTHY AGING | 55+ | Longevity programs (**see 7.1**) | Clinician |
| SKIN AND HAIR APPEARANCE | Women 40+, 55+ | Cosmetic topical peptides (no consult; cosmetic claims only) **or** clinician programs | Shop / clinician |
| SLEEP AND WINDING DOWN | All | Clinician conversation only (DSIP is named in HC advisories) | Clinician |
| HORMONES, DRIVE AND VITALITY | Men 35+, women 40+ | Clinician conversation only: the clinician decides whether labs or referral are needed | Clinician |
| NOT SURE YET | All | General consult ("TALK IT THROUGH") | Clinician |

### 2.2 Safety screening: hard stops and clinician-first flags

This is **screening only**. It decides the route, not the treatment. No dosing, no "safe for you" verdicts.

| Screen | Why it's asked (cited) | Route |
|---|---|---|
| **Province** | The clinician must be licensed where the patient is. The age of majority is **18** in AB, MB, ON, PE, QC and SK, and **19** in BC, NB, NL, NS, NT, NU and YT ([TaxTips](https://www.taxtips.ca/glossary/ageofmajority.htm); [Wikipedia, Minor (law)](https://en.wikipedia.org/wiki/Minor_(law))). | Out-of-service province: waitlist plus email. |
| **Age band**, with the minimum set by province | Mounjaro "is not indicated for use in pediatric patients" (Canadian monograph). Hims and Felix serve adults only. | Under majority age: **hard stop**, kind copy, no data kept. |
| **Pregnant, trying to conceive, or breastfeeding** | The Ozempic monograph says it "should not be used during pregnancy or breastfeeding". Some Mounjaro monograph versions list pregnancy and breastfeeding as contraindications ([Ozempic PM, Apr 2026](https://pdf.hres.ca/dpd_pm/00084255.PDF); [Mounjaro PMs](https://pdf.hres.ca/dpd_pm/00085122.PDF)). | **Hard stop for the clinician lane.** "Please talk with your own doctor or midwife first." Cosmetic topicals: show a "check with your doctor" note. |
| **Personal or family history of medullary thyroid cancer or MEN 2** | A contraindication for semaglutide and tirzepatide in the Canadian monographs. | **Clinician-first.** No checkout; book a call. |
| **History of pancreatitis or gallbladder disease** | These are standard GLP-1 warnings. **[UNVERIFIED in the Canadian monograph via this search]**, so check the PDFs. | Clinician-first. |
| **Type 1 diabetes, or diabetes treated with insulin or sulfonylureas** | Mounjaro "should not be used in patients with type 1 diabetes" (Canadian PM). The insulin and sulfonylurea interaction is **[UNVERIFIED here]**. | Clinician-first. |
| **Current or past cancer, or active treatment** | No claim made. The clinician wants to know before any program; this is especially relevant to growth-hormone-axis peptides. Clinician judgement, not a cited contraindication. | Clinician-first. |
| **History of an eating disorder** | Clinician judgement for any weight program. Not a cited contraindication. | Clinician-first. |
| **Medications** (none / diabetes meds / blood thinners / hormone therapy or birth control pill / other / prefer to discuss) | Tirzepatide and oral contraceptives: the US label carries this warning, but **[UNVERIFIED in the Canadian PM via this search]**. | Anything but "none": clinician-first (still bookable, flag sent to the clinician). |
| **Emergency symptoms** (not a quiz question) | Ada Health's instructions for use: "Do not use … in an emergency situation… contact local medical emergency services." Ada also has a "roadblock" for chest pain and suicidal ideation ([Ada IFU](https://ada.com/ifu/ada-assess/)). | A quiet line on the HEALTH stage and in the bot: 911, and 9-8-8 for crisis. |

**Clinician-first** means the result still names the category (the visitor isn't shamed), but the action changes from "Book and pay" to "Book a clinician call first", with no checkout. Hard stops show a kind screen and keep no health data.

---

## 3. COMPLIANCE THAT SHAPES THE WORDING

### 3.1 Canada

| Rule | What it says (as reported) | Source |
|---|---|---|
| **FDR C.01.044** | A consumer ad for a prescription drug may state only the brand, proper or common name, the **price** and the **quantity**. PAAB adds that the DIN shouldn't be included, and that "quantity" should be the units supplied for the price. | [Justice Laws C.01.044](https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/section-C.01.044.html); [PAAB Q174](https://www.paab.ca/question-174); [Ad Standards DTCA checklist 2026](https://adstandards.ca/wp-content/uploads/DTCA-Checklist-2026-EN-Ad-Standards.pdf) |
| **Unauthorized drugs** | Promoting a drug before Health Canada authorizes it is not permitted (Ad Standards 2026). Selling unauthorized drugs is illegal. "Research use only" doesn't change that. | [HC advisory, "Think twice before injecting peptides bought online"](https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm); [HC advisory, Canada Peptide seizure](https://recalls-rappels.canada.ca/en/alert-recall/unauthorized-injectable-peptide-drugs-seized-and-sold-canada-peptide-may-pose-serious); [CBC on the April 2026 warning](https://www.cbc.ca/news/health/health-canada-peptides-injecting-unauthorized-drugs-9.7158178) |
| **The compounding gap** | CBC found doctors in Ontario and BC prescribing BPC-157 through a compounding route. Health Canada says compounding "must not be used to circumvent" drug review. The Ontario College of Pharmacists said compounding with unauthorized ingredients could be investigated. POL-0051 treats non-patient-specific production as manufacturing. | [CBC Investigates](https://www.cbc.ca/news/investigates/unauthorized-peptide-loophole-bpc157-9.7281300); [POL-0051](https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/good-manufacturing-practices/guidance-documents/policy-manufacturing-compounding-drug-products.html) |
| **Advertising versus information** | Health Canada's 2023 Distinction Guidance tests content, context, sponsor and mode. Disease information may mention therapies if it doesn't emphasize one drug. **Advertising a service** (the consult) is outside the Act, but a site that promotes specific products must comply. | [HC Distinction Guidance](https://www.canada.ca/en/health-canada/services/drugs-health-products/regulatory-requirements-advertising/policies-guidance-documents/policy-distinction-between-advertising-activities.html); [PAAB physician-website Q&A](https://www.paab.ca/resources/health-products-advertising-on-physician-web-sites-qas) |
| **Food and Drugs Act s.3 / Schedule A.1** | Bars advertising to the public any drug as a treatment, prevention or cure for listed diseases. Whether **obesity** is on the current list is **[UNVERIFIED]**: I believe earlier versions listed it, but couldn't confirm. Check before using "weight" near a product. | [HC Schedule A guidance](https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents/guidance-document-schedule-section-3-food-drugs-act.html) |
| **Competition Act s.74.01(1)(b)** | Performance claims need an "adequate and proper test" done **before** the claim. The general impression counts, including images. | [Competition Bureau, weight-loss claims](https://www.canada.ca/en/competition-bureau/news/2019/02/weight-loss-claims-must-be-true-and-supported-by-testing-false-misleading-or-unsubstantiated-claims-are-illegal-under-the-competition-act.html); [NuvoCare case](https://www.canada.ca/en/competition-bureau/news/2020/05/competition-bureau-protects-consumers-from-the-potential-harm-of-nuvocares-weight-loss-claims.html) |
| **Drip pricing** (ss. 52(1.3), 74.01(1.1), 2022) | A price that can't be met because of mandatory fees is misleading. Cineplex was fined C$38.9M (2024). A 2026 Federal Court decision (Ticketmaster) focused on concealment and sequence. | [Goodmans on Cineplex](https://goodmans.ca/insights/article/the-cineplex-decision---a-new-chapter-opens-in-canadian-competition-law); [Bennett Jones, 2026](https://www.bennettjones.com/Insights/Blogs/2026/10/Federal-Court-Interprets-Drip-Pricing-No-Drip-No-Class) |
| **Privacy (PIPEDA)** | Health-related browsing is sensitive. **Implied consent is inappropriate for health-based remarketing; express consent is required.** Key consent information goes up front, not buried in the policy. | [OPC Form of Consent bulletin](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_07_consent/) |
| **CASL** | Pre-ticked boxes aren't express consent. Use a separate box for each type of consent. | [Hogan Lovells on CRTC bulletins](https://www.hoganlovells.com/en/publications/canadian-crtc-issues-compliance-and-enforcement-information-bulletins) (2012 to 2014 commentary; check current CRTC text) |

### 3.2 United States (relevant if US visitors are served, or for borrowed copy)

| Action | What it established | Source |
|---|---|---|
| **FDA/HHS, 2025-09-09** | A direct-to-consumer ad crackdown. Telehealth firms were targeted over compounded-drug ads for the first time. Flagged phrases included "same active ingredient as Ozempic and Wegovy" and "clinically proven ingredients". The Hims letter said: "Your claims imply that your products are the same as an FDA-approved product when they are not." Rulemaking was announced to close the "adequate provision" loophole (a proposal, not final). | [Holland & Knight](https://www.hklaw.com/en/insights/publications/2025/09/fda-hhs-taking-action-against-telehealths-compounded-drug-advertising); [Pulmonology Advisor/AP](https://www.pulmonologyadvisor.com/news/fda-cracks-down-on-hims-other-telehealth-companies-over-drug-ads/) |
| **FDA, Mar 2026 (30 letters) and Jun 2026 (25 letters)** | Targeted "sameness", implying FDA approval, "clinically studied" ingredients, "FDA-approved pharmacy" (FDA approves no pharmacies), and branding that hides who compounds. FDA launched a telehealth compliance page. | [Foley](https://www.foley.com/p/102mmr0/glp1-compliance-fda-targets-telehealth-marketing-in-30-new-letters/); [American Med Spa Assn](https://americanmedspa.org/news/fda-targets-telehealth-compounded-glp-1-marketing-in-new-warning-letters); [Drug Topics](https://www.drugtopics.com/view/fda-issues-warnings-to-30-telehealth-companies-against-illegal-marketing-of-compounded-glp-1-medications) |
| **FDA, May 2026** | Proposed excluding semaglutide, tirzepatide and liraglutide from 503B bulk compounding. | [Drug Topics](https://www.drugtopics.com/view/fda-proposes-to-exclude-glp-1s-from-503b-bulk-list) |
| **FDA peptides, 2026** | April 2026: 12 peptides removed from Category 2 ("significant safety concerns"), which puts BPC-157 in regulatory limbo rather than making it legal. July 2026: the PCAC voted 8-6 (1 abstention) to recommend BPC-157 for ulcerative colitis on the 503A list. This is non-binding, and FDA scientists objected. | [Goodwin](https://www.goodwinlaw.com/en/insights/blogs/2026/05/fda-signals-potentially-evolving-stance-toward-compounding-of-certain-peptides); [RAPS](https://www.raps.org/resource/fda-advisory-committee-backs-two-controversial-peptides.html) |
| **FTC v. NextMed (final 2025-12-03)** | $150,000. Advertised prices left out the drug, labs and consult. A 12-month lock-in was hidden. Cancellation was obstructed. Reviews were fake. Typical-results claims need competent and reliable evidence. | [FTC press release](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-approves-final-order-against-telehealth-provider-nextmed-over-charges-it-used-deceptive) |
| **FTC Health Products Compliance Guidance (Dec 2022)** | Health benefit claims generally need randomized controlled human trials. Animal studies, in-vitro work and anecdotes don't count. | [Covington](https://www.cov.com/en/news-and-insights/insights/2023/01/ftc-issues-new-guidance-on-health-related-claims-to-replace-the-dietary-supplements-advertising-guide) |

Most PEPTICITY products rest on animal and cell data. A McMaster analysis notes that BPC-157 evidence is mostly animal and cell studies ([McMaster](https://news.mcmaster.ca/analysis-the-peptide-problem-hype-is-outrunning-the-evidence/)). So **no benefit claim is substantiable** under either country's standard. The lawful layer is: what the service is, who decides, the price, the testing documentation, shipping and privacy.

### 3.3 Wording rules (quiz, result page, bot)

**The ceiling (Canada):** PEPTICITY may describe **its service**: the clinician consult, the pharmacy, the process, the people, the price, the testing documentation and privacy. For any prescription drug it may state **only name, price and quantity**, and never alongside a condition or goal. It may not promote unauthorized drugs at all (pending counsel, 7.1).

| Do | Don't |
|---|---|
| "What brings you here?" with the visitor's intent: "I want to keep up with my training." | "Which result do you want: faster healing, more energy, fat loss?" |
| "A licensed clinician decides if a plan is right for you." | "Get your peptide prescription", "Approved in minutes" |
| "Your focus: TRAINING AND RECOVERY. Next step: a consult with a clinician licensed in [province]." | "Your match: BPC-157 + TB-500" (a named Rx drug next to a goal) |
| "Programs in this area: [name] · $[xx] CAD · [quantity / what's included]", on a neutral price list, not in the goal sentence | "[name], to help you recover faster", "may support", "studied for", "clinically proven" |
| "Prepared by a licensed partner pharmacy in Canada. [Testing documentation: confirm with Grace]" | "Same as Ozempic", "same active ingredient", "pharmaceutical grade", "Health Canada approved" (unless it is) |
| "Price shown includes [consult, pharmacy fee, shipping]. Taxes extra." | "From $99" when the drug, consult or labs cost extra |
| "If the clinician decides it isn't right for you, you won't be charged for the program. [confirm with Grace]" | Hidden lock-ins, auto-renewal not shown beside the button |
| "[Your verification process]" placeholder | Invented stats, reviews, star ratings, before/after images, doctor names |
| "Prefer to talk it through? Book a call." | Countdown timers or "only 3 spots left" on a medical service |

---

## 4. AI AND GUIDE-BOT HEALTH GUIDANCE

### 4.1 Where the line sits

| Allowed: guidance, education, navigation | Not allowed: medical advice |
|---|---|
| How PEPTICITY works (quiz, then consult, then pharmacy, then shipping) | Saying whether a specific product is right or safe *for this person* |
| What a category of care is, in vetted, claim-free words | Diagnosing ("sounds like low testosterone") |
| Prices, what's included, timelines, privacy, cancellation | Doses, cycles, stacking, reconstitution, injection technique |
| Routing to the quiz, booking, a human, or the clinician | Drug interactions, or "you can stop your other medicine" |
| Emergency redirection (911 / 9-8-8) | Interpreting labs or symptoms |
| Saying "I'm the PEPTICITY guide, not a clinician" | Any name, avatar, title or tone implying a licensed human |

**Supporting sources:**
- **California AB 489** (signed Oct 2025, in force 2026-01-01). It bans AI terms, letters or phrases that imply care comes from a licensed person, and ads implying that. Boards enforce it ([CMA (California)](https://www.cmadocs.org/newsroom/news/view/ArticleId/51003/CMA-sponsored-bill-to-protect-patients-from-misleading-AI-chatbots-signed-into-law); [Board of Psychology advisory](https://psychology.ca.gov/laws_regs/ab489_advisory.pdf)). It isn't Canadian law, but it is the clearest written line. Name the bot "PEPTICITY GUIDE": no "Dr.", no "Nurse", no white-coat avatar.
- **Illinois (WOPR Act) and Nevada (AB 406)** ban AI from providing mental health therapy. **Utah HB 452** allows mental-health chatbots with disclosure ([HeplerBroom](https://www.heplerbroom.com/blog/illinois-legislation-ai-mental-health-services); [CASRAI comparison](https://casrai.org/compare/ai-therapy-laws-illinois-nevada-utah-compared)). For the bot: no emotional-support or therapy role. Mood or crisis messages go to 9-8-8.
- **FTC 6(b) orders (2025-09-11)** to seven AI chatbot firms cover testing, age limits and how risks are disclosed. This is a study, not enforcement ([FTC](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions)). It signals that minors' use and risk disclosure are the focus, which supports a minor hard stop in the bot.
- **Canada.** I found no formal CMA, CMPA or Health Canada guidance on consumer AI health chatbots. The Canadian Medical Association's survey (Abacus Data, 5,001 Canadians, Nov 2025) found that people who followed AI health advice were **five times more likely** to report a negative health effect. Only **27%** trust AI for accurate medical information ([CBC](https://www.cbc.ca/news/health/chatbots-health-1.7575300); [CADE](https://cadeproject.org/updates/canadian-doctors-warn-of-health-risks-linked-to-ai-generated-medical-advice/)). A May 2026 poll found **46%** had used AI for health advice in the past year, and **68%** would rather wait two weeks for a human doctor than get an instant AI diagnosis ([CTV](https://www.ctvnews.ca/health/article/are-canadians-turning-to-ai-for-medical-advice/)). Lesson: lead with "a real clinician decides". That is what Canadians want, so it sells as well as protects.
- **WHO LMM guidance (Jan 2024)** has 40+ recommendations and warns of automation bias in patients ([WHO](https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models)).
- **Disclaimers are disappearing, and that's the risk.** Medical disclaimers in AI answers fell from 26% (2022) to 1% (2025), in a study that isn't peer reviewed. A plain "see your doctor" line didn't count as a disclaimer ([MIT Technology Review](https://www.technologyreview.com/2025/07/21/1120522/ai-companies-have-stopped-warning-you-that-their-chatbots-arent-doctors/); [eMarketer](https://www.emarketer.com/content/chatbots-scale-back-their-medical-advice-warnings)). MIT Media Lab argues disclaimers should appear prominently when medical information is *first* given ([MIT Media Lab](https://www.media.mit.edu/articles/google-puts-users-at-risk-by-downplaying-health-disclaimers-under-ai-overviews/)).
- **FDA wellness and CDS guidance (Jan 2026)** relaxed rules for wellness tools that make no disease claims. It doesn't specifically address patient-facing chatbots ([Arnold & Porter](https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software)). A bot that triages or recommends treatment is moving toward device territory. A navigation bot is not.

### 4.2 Emergency handling (deterministic, before any AI reply)

Run a keyword and intent check *before* the vetted answers or the AI: chest pain, can't breathe, fainting, severe allergic reaction or swelling, severe abdominal pain, vomiting that won't stop, thoughts of self-harm. When it matches, reply with **only** this, and no product talk:

> "That sounds urgent. Please call **911** or go to the nearest emergency department now. If you're thinking about suicide or self-harm, call or text **9-8-8** (free, 24/7, across Canada)."

The 9-8-8 line launched nationwide on 2023-11-30, by call or text, in English and French ([PHAC](https://www.canada.ca/en/public-health/news/2023/11/9-8-8-suicide-crisis-helpline.html)). Ada's "roadblock" pattern is the reference: it stops the flow and doesn't continue the sale. Add a "Talk to a person" button that shows `[phone number]` and "Call me back".

### 4.3 Handing off to a human or clinician

- Any question about a person's own body, condition, medications or dose gets one warm sentence, then a next step: "**Book a consult**", "**Ask our team**" or "**Call me back**". Never a dead end.
- Pass the context (quiz category, flags) to the human so the visitor doesn't repeat themselves. Store it only with consent.
- Log refusals to tune the vetted-answers set. No health text goes into ad or analytics tools (see the PIPEDA remarketing rule above).

---

## 5. RECOMMENDATIONS

### 5(a) Final quiz question set and order

Four stages, one question per screen, tap to answer, Back on every step, resume from where they left off. **12 screens, about 2 minutes.** Headings are in CAPS on the page.

**STAGE 1: GOAL** (easy, aspirational; pre-filled from the audience switcher, which gives an endowed head start)

1. **WHAT BRINGS YOU HERE?** Single choice, pre-selected from "I'm here for…":
   Keep up with my training · Weight and body composition · More energy, feeling like myself · Staying well as I age · Skin and hair appearance · Sleep and winding down · Hormones, drive and vitality · Not sure yet
2. **TELL US A LITTLE MORE** (one follow-up that branches on Q1, in the visitor's words, not product claims). Examples:
   - Training: "Mostly soreness after training" · "Working back from an injury with a professional" · "Mobility" · "Performance"
   - Weight: "I've tried on my own" · "I've worked with a clinician before" · "First time looking into this"
   - Skin and hair: "Texture and how it looks" · "Fine lines look" · "Hair" · "**I'd like something I can buy today**" (routes to the cosmetic topicals, no consult)
   - Energy, aging, sleep, hormones: "When do you notice it most?" / "What matters most in the next 10 years?" (open-ended choices, no scoring promise)
3. **HOW MANY DAYS A WEEK ARE YOU ACTIVE?** "I don't work out right now" · 1–2 · 3–4 · 5+ (keep the current non-judging wording)

   *Bridge line:* "Training focus, noted. A few quick questions about you next."

**STAGE 2: ABOUT YOU**

4. **WHERE DO YOU LIVE?** Province or territory. Sets the age minimum and whether a licensed clinician is available.
5. **YOUR AGE** Bands with the minimum set by province (18 or 19): under [18/19] · [18/19]–34 · 35–44 · 45–54 · 55–64 · 65+. **Under the minimum: hard stop.**
6. **WHICH BEST DESCRIBES YOU?** Woman · Man · Another identity · Prefer not to say. Used only to tailor the next screen and the clinician's prep.

   *Bridge line:* "Thanks. Three short health questions. Your answers go only to the clinician reviewing your consult."

**STAGE 3: HEALTH** (screening only, Yes / No / Not sure; "Not sure" counts as clinician-first)

7. **ARE YOU PREGNANT, TRYING TO CONCEIVE, OR BREASTFEEDING?** (Show it for "Woman", "Another identity" and "Prefer not to say", with a "Doesn't apply" option.) **Yes: hard stop for the clinician lane.**
8. **DO ANY OF THESE APPLY TO YOU?** Multi-select: Personal or family history of medullary thyroid cancer or MEN 2 · Pancreatitis · Gallbladder problems · Type 1 diabetes · Diabetes treated with insulin · Current or past cancer · An eating disorder · Kidney or liver disease · None of these. **Any selection: clinician-first.**
9. **DO YOU TAKE ANY PRESCRIPTION MEDICATIONS?** None · Diabetes medication · Blood thinner · Hormone therapy or birth control pill · Something else · I'd rather discuss it. **Anything but "None": clinician-first** (still bookable).

   *Quiet line on this stage:* "Unwell right now? Call 911. This quiz isn't for urgent care."

**STAGE 4: YOUR CARE**

10. **HOW WOULD YOU LIKE TO TALK WITH A CLINICIAN?** Video · Phone · Messages
11. **WHEN WOULD YOU LIKE TO START?** This week · This month · Just exploring. "Just exploring" swaps the primary CTA for "Email me this summary"; booking stays secondary.
12. **BUILDING YOUR NEXT STEPS** (2–3 s, showing the real work): "Matching your focus… Checking clinicians in [province]… Preparing your summary". No fake medical analysis.

**Routing logic**

```
score[category] = 3 × Q1 pick + 2 × Q2 branch + modifiers
modifiers: Q3 ≥ 3 days → TRAINING +1 · age 55+ → HEALTHY AGING +1
           Q2 "buy today" (skin) → lane = SHOP (cosmetic, no consult)
winner = highest score; tie or "Not sure yet" → TALK IT THROUGH (general consult)

hard stop  if age < province minimum            → kind stop screen, discard answers
hard stop  if Q7 = Yes (clinician lane)         → "talk with your own doctor or midwife first"
waitlist   if province not served               → email waitlist (unticked CASL box)
clinician-first if any Q8 item, Q9 ≠ None, or any "Not sure"
           → result shows the category; CTA = "Book a clinician call first"; no checkout
else       → result CTA = "Book your consult · $[xx] CAD"
```

### 5(b) Result-page structure

1. **YOUR FOCUS: TRAINING AND RECOVERY** (CAPS heading; echoes their words, not a product).
2. **WHAT YOU TOLD US**: 3 answer chips with "Edit" (goes back to that screen).
3. **WHAT HAPPENS NEXT**: three steps.
   ① A consult with a clinician licensed in [province] (video, phone or message, as they chose).
   ② If the clinician decides a plan is right for you, it's sent to our licensed partner pharmacy.
   ③ Discreet delivery, `[timeline: confirm with Grace]`.
4. **PROGRAMS IN THIS AREA**: name · price in CAD · quantity / what's included. A neutral list, with no benefit wording and no "recommended for you" badge on Rx items. Hidden until counsel clears 7.1 and 7.2; until then, show "Your clinician will go through options and pricing with you", like Juniper.
5. **ALL-IN PRICE NOTE**: "Consult $[xx] CAD. Programs from $[xx] CAD per [quantity], including [pharmacy fee, shipping]. Taxes extra. If the clinician decides it isn't right for you, you won't be charged for the program."
6. **PRIMARY CTA: BOOK YOUR CONSULT**. Secondary: "Ask the guide" · "Call me back" · "Email me this summary" (optional email; separate unticked boxes for "email me my summary" and "send me PEPTICITY news").
7. **The clinician line**, directly under the CTA, in muted small text: *"A licensed clinician decides if a plan is right for you."*
8. **Variants:**
   - Clinician-first: same page; the CTA becomes "Book a clinician call first"; no prices for Rx programs.
   - Shop lane (cosmetic topicals): product cards with cosmetic claims only (appearance, feel, hydration look) and "Add to bag".
   - Hard stop: a calm, short screen ("This one's not for you right now. Please talk with your own doctor.") with no CTA to buy.

### 5(c) Where the "not medical advice / a clinician decides" message appears

These layers are clear because they repeat at each decision point, and calm because each is one line of the page's own type in muted ink. No red boxes, no all-caps warnings, no pop-ups.

| # | Placement | Exact line (draft; counsel to approve) |
|---|---|---|
| 1 | Quiz start screen, under the Start button | "About 2 minutes. This points you in the right direction. It isn't a medical assessment." |
| 2 | HEALTH stage, under the question | "Your answers go only to the clinician reviewing your consult. Unwell right now? Call 911." |
| 3 | Result page, under the CTA | "A licensed clinician decides if a plan is right for you." |
| 4 | Booking / checkout, a **required unticked box** beside the pay button | "☐ I understand PEPTICITY's guide and quiz don't give medical advice, and a licensed clinician will decide whether any plan is right for me. [Terms] · [Privacy]" |
| 5 | Bot header subtitle | "PEPTICITY GUIDE · Not medical advice" |
| 6 | Bot first message (once) | "Hi, I'm the PEPTICITY guide. I can explain how things work, prices and next steps. For anything about your own health, a licensed clinician is the right person, and I'll help you book one." |
| 7 | Bot input placeholder | "Ask about programs, pricing or how it works" (it sets scope without a warning) |
| 8 | In an answer, when a question gets personal | "That's one for your clinician. Want me to find you a time?" |
| 9 | Footer legal line | "PEPTICITY provides access to independent licensed clinicians and a licensed partner pharmacy. Content on this site is general information, not medical advice. [Final legal copy to be approved by counsel.]" |

Style: 15–16px secondary text (body stays at 18px or more per the brief), AA contrast on the page's ground, sentence case (these are lines, not headings), no icon or a tiny hairline mark only.

### 5(d) Bot boundaries and 10 example phrasings

**System rules for the bot:**
1. Run the emergency check first (4.2).
2. Under the age of majority: "PEPTICITY is for adults [18/19]+, so I can't help with sign-up. Please talk with a parent or your family doctor." Then stop.
3. Answer only from vetted copy: service, process, price, shipping, privacy, testing documentation.
4. Never give dose, cycle, stack, reconstitution, injection or interaction information. Never say "safe for you", "works", "heals", "boosts", "supports", "studied for" or "clinically proven". Never say "same as" an approved drug.
5. Never imply a human clinician is speaking. The name is PEPTICITY GUIDE.
6. Every refusal ends with a next step.

| # | Visitor asks | Guide replies |
|---|---|---|
| 1 | "Which peptide is best for me?" | "I can't pick a treatment for you; that's the clinician's call. The 2-minute quiz points you to the right area of care, and then a licensed clinician talks it through with you. Want to start it?" |
| 2 | "What dose of BPC-157 should I take?" | "I don't give dosing information. Only a clinician can decide what, if anything, is right for you. I can book you a consult, or a team member can call you back." |
| 3 | "I have a thyroid condition. Is semaglutide safe for me?" | "That's an important one for a clinician, and I'm not able to judge it. When you book, mention your thyroid history so they can go through it with you. Want a time this week?" |
| 4 | "Will this help me lose 20 pounds?" | "I can't promise results, and nobody should. What I can tell you is how it works: a clinician reviews your health and goals, and decides if a plan makes sense for you. Want to see the next steps?" |
| 5 | "Is this legal / approved by Health Canada?" | Vetted, counsel-approved answer per product, e.g. "[Product] is [authorized by Health Canada, DIN shown on the label / not an authorized product: counsel wording]. Your clinician and our licensed partner pharmacy can explain more." **Never improvise this one.** |
| 6 | "How much does it cost?" | "Consults are $[xx] CAD. Programs start at $[xx] CAD for [quantity], including [what's included]. Taxes extra. If the clinician decides it isn't right for you, you're not charged for the program." |
| 7 | "Can I take it with my blood thinner?" | "Medication questions need a clinician; I can't advise on combinations. Please list everything you take when you book, and they'll review it with you." |
| 8 | "Is your version the same as Ozempic?" | "I can't compare them that way. Your clinician can explain every option, including Health Canada-authorized ones, and what's different about each. Want me to set that up?" |
| 9 | "Do I have to do injections?" | "It depends on what the clinician decides is right for you, and they'll explain the options in your consult. If you'd prefer something that doesn't need a consult, we also have a small cosmetic topicals range." |
| 10 | "I just took it and I feel dizzy and my chest hurts." | (Emergency check fires.) "That sounds urgent. Please call **911** or go to the nearest emergency department now." No other content. Then show a "Contact our team" option once they're safe. |

---

## 6. PROHIBITED-PHRASE LIST (for Grace to audit against)

**Outcome language, however hedged:** heals, repairs, cures, treats, reverses, prevents, boosts, burns, melts, restores, optimizes, enhances, improves, supports, promotes, may help, can help, studied for, investigated for, researched for, shown to, linked to, anti-aging (as a drug claim), fat loss, faster recovery, more energy (as a product promise).

**Use instructions in disguise:** dose, dosing, dosage, mg/mcg per, protocol, cycle, stack, loading phase, titrate, reconstitute, bacteriostatic water, syringe, inject (as instruction), calculator, "how to use".

**Sameness and authority:** same as Ozempic or Wegovy, same active ingredient, generic Ozempic (unless it is a Health Canada-authorized generic, named correctly), clinically proven, clinically studied, doctor-recommended, Health Canada approved (unless true, with the DIN), FDA-approved pharmacy, pharmaceutical grade, research-grade, research use only.

**Borrowed authority in the bot:** Dr., Doctor, Nurse, MD, NP, "your clinician" as the bot's own voice, white-coat or stethoscope avatar.

**Pricing and pressure:** "from $X" when mandatory fees aren't included, hidden auto-renewal, countdown timers, "only N spots left", fake reviews or star ratings, before/after images.

**Recommendation:** screenshot and date-stamp every published state of the quiz, result page, bot answers and footer, so PEPTICITY can show what was live and when.

---

## 7. COUNSEL QUESTIONS (these gate launch)

1. **The catalogue question (blocking).** Health Canada advisories name BPC-157, TB-500, CJC-1295, ipamorelin, Epitalon, GHK-Cu, NAD+, AOD-9604 and DSIP among unauthorized drugs. Can PEPTICITY offer, name or price any of these to Canadians, even through clinician prescription and pharmacy compounding? Health Canada says compounding "must not be used to circumvent" review, and the Ontario College of Pharmacists has signalled investigations. The answer decides whether those programs appear on the site at all, or only arise inside a consult.
2. **Result page and C.01.044 / Schedule A.1.** Does showing a named Rx drug's name, price and quantity on a page reached by answering a goal question ("weight", "recovery") turn a lawful reminder ad into an unlawful indication claim? Is obesity on the current Schedule A.1? Until this is answered, use the Juniper pattern: name the care pathway, not the drug.
3. **US exposure.** If US visitors can book, FDA misbranding and FTC rules apply, along with state AI laws (AB 489). Recommend geo-limiting booking to served Canadian provinces.
4. **Privacy.** Get express-consent wording for health answers (PIPEDA, plus Quebec Law 25 and provincial health-privacy statutes such as PHIPA if the clinician side is a custodian). Confirm that no quiz answers are sent to ad pixels.

---

## SOURCES (all reached via web-search summaries; primary pages not opened)

Regulatory, Canada: [FDR C.01.044](https://laws-lois.justice.gc.ca/eng/regulations/C.R.C.,_c._870/section-C.01.044.html) · [PAAB Q174](https://www.paab.ca/question-174) · [Ad Standards DTCA 2026](https://adstandards.ca/wp-content/uploads/DTCA-Checklist-2026-EN-Ad-Standards.pdf) · [HC illegal marketing of Rx drugs](https://www.canada.ca/en/health-canada/services/drugs-health-products/marketing-drugs-devices/illegal-marketing/prescription-drugs.html) · [HC Distinction Guidance](https://www.canada.ca/en/health-canada/services/drugs-health-products/regulatory-requirements-advertising/policies-guidance-documents/policy-distinction-between-advertising-activities.html) · [PAAB physician websites](https://www.paab.ca/resources/health-products-advertising-on-physician-web-sites-qas) · [HC "Think twice" peptides](https://recalls-rappels.canada.ca/en/alert-recall/think-twice-injecting-peptides-bought-online-unauthorized-products-can-seriously-harm) · [HC Canada Peptide seizure](https://recalls-rappels.canada.ca/en/alert-recall/unauthorized-injectable-peptide-drugs-seized-and-sold-canada-peptide-may-pose-serious) · [HC Optimum Wellness seizure](https://recalls-rappels.canada.ca/en/alert-recall/unauthorized-injectable-peptide-drugs-seized-optimum-wellness-centre-calgary-alberta) · [CBC, HC warning](https://www.cbc.ca/news/health/health-canada-peptides-injecting-unauthorized-drugs-9.7158178) · [CBC Investigates, BPC-157](https://www.cbc.ca/news/investigates/unauthorized-peptide-loophole-bpc157-9.7281300) · [POL-0051](https://www.canada.ca/en/health-canada/services/drugs-health-products/compliance-enforcement/good-manufacturing-practices/guidance-documents/policy-manufacturing-compounding-drug-products.html) · [HC Schedule A guidance](https://www.canada.ca/en/health-canada/services/drugs-health-products/drug-products/applications-submissions/guidance-documents/guidance-document-schedule-section-3-food-drugs-act.html) · [HC generic semaglutide Apr 2026](https://www.canada.ca/en/health-canada/news/2026/04/canada-becomes-the-first-g7-country-to-approve-a-generic-version-of-semaglutide.html) · [HC generic semaglutide for weight Jun 2026](https://www.canada.ca/en/health-canada/news/2026/06/canada-approves-first-generic-semaglutide-for-weight-loss.html) · [Ozempic PM Apr 2026](https://pdf.hres.ca/dpd_pm/00084255.PDF) · [Mounjaro PM](https://pdf.hres.ca/dpd_pm/00085122.PDF) · [Competition Bureau weight-loss claims](https://www.canada.ca/en/competition-bureau/news/2019/02/weight-loss-claims-must-be-true-and-supported-by-testing-false-misleading-or-unsubstantiated-claims-are-illegal-under-the-competition-act.html) · [Goodmans, Cineplex](https://goodmans.ca/insights/article/the-cineplex-decision---a-new-chapter-opens-in-canadian-competition-law) · [Bennett Jones, drip pricing 2026](https://www.bennettjones.com/Insights/Blogs/2026/10/Federal-Court-Interprets-Drip-Pricing-No-Drip-No-Class) · [OPC Form of Consent](https://www.priv.gc.ca/en/privacy-topics/privacy-laws-in-canada/the-personal-information-protection-and-electronic-documents-act-pipeda/pipeda-compliance-help/pipeda-interpretation-bulletins/interpretations_07_consent/) · [Hogan Lovells, CASL](https://www.hoganlovells.com/en/publications/canadian-crtc-issues-compliance-and-enforcement-information-bulletins) · [PHAC 9-8-8](https://www.canada.ca/en/public-health/news/2023/11/9-8-8-suicide-crisis-helpline.html) · [McMaster, peptide evidence](https://news.mcmaster.ca/analysis-the-peptide-problem-hype-is-outrunning-the-evidence/)

Regulatory, US: [Holland & Knight Sept 2025](https://www.hklaw.com/en/insights/publications/2025/09/fda-hhs-taking-action-against-telehealths-compounded-drug-advertising) · [Pulmonology Advisor/AP](https://www.pulmonologyadvisor.com/news/fda-cracks-down-on-hims-other-telehealth-companies-over-drug-ads/) · [Foley Mar 2026](https://www.foley.com/p/102mmr0/glp1-compliance-fda-targets-telehealth-marketing-in-30-new-letters/) · [American Med Spa Assn](https://americanmedspa.org/news/fda-targets-telehealth-compounded-glp-1-marketing-in-new-warning-letters) · [Drug Topics 503B](https://www.drugtopics.com/view/fda-proposes-to-exclude-glp-1s-from-503b-bulk-list) · [Goodwin peptides](https://www.goodwinlaw.com/en/insights/blogs/2026/05/fda-signals-potentially-evolving-stance-toward-compounding-of-certain-peptides) · [RAPS PCAC](https://www.raps.org/resource/fda-advisory-committee-backs-two-controversial-peptides.html) · [FTC NextMed](https://www.ftc.gov/news-events/news/press-releases/2025/12/ftc-approves-final-order-against-telehealth-provider-nextmed-over-charges-it-used-deceptive) · [Covington, FTC health guidance](https://www.cov.com/en/news-and-insights/insights/2023/01/ftc-issues-new-guidance-on-health-related-claims-to-replace-the-dietary-supplements-advertising-guide) · [Arnold & Porter, FDA CDS 2026](https://www.arnoldporter.com/en/perspectives/advisories/2026/01/fda-cuts-red-tape-on-clinical-decision-support-software)

AI and chatbots: [CMA (California), AB 489](https://www.cmadocs.org/newsroom/news/view/ArticleId/51003/CMA-sponsored-bill-to-protect-patients-from-misleading-AI-chatbots-signed-into-law) · [CA Board of Psychology advisory](https://psychology.ca.gov/laws_regs/ab489_advisory.pdf) · [FTC 6(b)](https://www.ftc.gov/news-events/news/press-releases/2025/09/ftc-launches-inquiry-ai-chatbots-acting-companions) · [HeplerBroom, Illinois](https://www.heplerbroom.com/blog/illinois-legislation-ai-mental-health-services) · [CASRAI comparison](https://casrai.org/compare/ai-therapy-laws-illinois-nevada-utah-compared) · [CBC, CMA survey](https://www.cbc.ca/news/health/chatbots-health-1.7575300) · [CADE](https://cadeproject.org/updates/canadian-doctors-warn-of-health-risks-linked-to-ai-generated-medical-advice/) · [CTV poll](https://www.ctvnews.ca/health/article/are-canadians-turning-to-ai-for-medical-advice/) · [WHO LMM](https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models) · [MIT Tech Review](https://www.technologyreview.com/2025/07/21/1120522/ai-companies-have-stopped-warning-you-that-their-chatbots-arent-doctors/) · [eMarketer](https://www.emarketer.com/content/chatbots-scale-back-their-medical-advice-warnings) · [MIT Media Lab](https://www.media.mit.edu/articles/google-puts-users-at-risk-by-downplaying-health-disclaimers-under-ai-overviews/) · [Ada IFU](https://ada.com/ifu/ada-assess/)

Funnels and conversion: [RevenueCat, Noom](https://www.revenuecat.com/blog/growth/web-to-app-onboarding-funnel) · [Rocketship HQ](https://www.rocketshiphq.com/?p=5491) · [Paddle](https://www.paddle.com/studios/shows/fix-that-funnel/noom) · [Ro](https://ro.co/body-program/guide/program-online-visit) · [Hims support](https://support.hims.com/hc/en-us/articles/360032844051-How-does-this-work) · [Hims Canada](https://news.hims.com/newsroom/hims-hers-introduces-access-to-generic-semaglutide-for-canadian-customers-qzmp9) · [Juniper quiz](https://myjuniper.com/e/quiz) · [Medimap, Felix](https://medimap.ca/clinic/weight-loss/on/toronto/felix-health) · [Hims vs Hone](https://www.hims.com/blog/hims-vs-hone) · [PepScribe](https://fortune.com/press-releases/pepscribe-telehealth-peptide-therapy-at-home-2026-07-02/) · [Endowed progress summary](https://coglode.com/nuggets/endowed-progress-effect) · [Goal-gradient paper (Columbia)](https://business.columbia.edu/sites/default/files-efs/pubfiles/1200/goalgradient.pdf) · [Labor illusion (INFORMS)](https://pubsonline.informs.org/doi/references/10.1287/mnsc.1110.1376) · [Zuko, single vs multi-step](https://zuko.io/blog/single-page-or-multi-step-form) · [CrazyEgg form stats](https://www.crazyegg.com/blog/form-statistics/) · [ConvertFlow benchmark Sept 2026](https://www.convertflow.com/benchmark-reports/lead-generation-quiz-funnel-benchmark-september-2026) · [Octane AI lead generation](https://www.octaneai.com/solutions/lead-generation) · [Baymard](https://baymard.com/learn/reduce-cart-abandonment)

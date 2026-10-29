# PEPTICITY: HOOKS DEEP DIVE

Prepared 2026-10-29. Goal: hooks most visitors don't notice as "marketing" that get them to sign up, stay and buy, on a premium Canadian online peptide store.

**Ground rules for every hook below.** No health claims, no dosing, no "for [goal]" beside a product, no physician, clinician or pharmacy wording. Every commercial email or SMS needs CASL consent: unticked boxes, one box per purpose, sender named, a working unsubscribe, and a log of when, where and how consent was given. Offers, member prices, points and restock alerts on catalogue peptides read from the `COUNSEL_CLEARED.offer` switch (see `hook-architecture`), and the safe version shows while it is off. Urgency and social proof use real data only (Competition Bureau, "The urgency is fake": https://www.canada.ca/en/competition-bureau/news/2024/11/the-urgency-is-fake-but-the-deception-is-real.html; the Dufresne Group paid $3.25M over timers that outlived their countdowns). Read this together with `lead-magnet-hooks.md` (H01–H33 risk ratings) and `quiz-and-guide-research.md`.

**How it was researched.** GitHub search and API calls are blocked in this session, so repos were found from known projects and confirmed on their GitHub pages (stars as shown on 2026-10-29). Benchmarks come from web search summaries. Most popup and quiz figures are **vendor data**, so treat them as directional and A/B test them on PEPTICITY traffic. No figure here is invented.

---

## 1. OPEN-SOURCE REPOS AND LIBRARIES

| Repo | Stars | Licence | What it does | Use for PEPTICITY |
|---|---|---|---|---|
| [carlsednaoui/ouibounce](https://github.com/carlsednaoui/ouibounce) | ~2.3k | MIT | Exit-intent: fires when the pointer leaves through the top edge (`sensitivity` 20px), after a `timer` (1s), with a `delay` that cancels if the pointer comes back; a cookie stops repeats. **Cloned and read.** | Pattern for the quiet exit slide-in (desktop only). |
| [Masth0/ScratchCard](https://github.com/Masth0/ScratchCard) | 174 | MIT | Canvas scratch card: `destination-out` compositing, brush/spray/circle modes, `percentToFinish` (default 50) fires a callback once. **Cloned and read.** | Pattern for the sealed-envelope / wipe-to-reveal hook. |
| [emilkowalski/sonner](https://github.com/emilkowalski/sonner) | 13.1k | MIT | Toasts: `aria-live="polite"`, pauses the timer while hovered or while the tab is hidden, caps visible toasts (default 3), swipe to dismiss. **Cloned and read.** | Pattern for true-data notices (restock, real order pulse). |
| [catdad/canvas-confetti](https://github.com/catdad/canvas-confetti) | 12.8k | ISC | Canvas particle bursts; `disableForReducedMotion` is off by default. | Only as a tiny chrome-dust burst on reveal; always set the reduced-motion option. |
| [kamranahmedse/driver.js](https://github.com/kamranahmedse/driver.js) | 27.0k | MIT | Spotlight tours that guide focus across the page. | "HOW ORDERING WORKS" 3-step spotlight. |
| [surveyjs/survey-library](https://github.com/surveyjs/survey-library) | 4.9k | MIT | JSON-defined forms and quizzes with branching logic. | Catalogue finder logic (or hand-roll, it is 3 steps). |
| [react-hook-form/react-hook-form](https://github.com/react-hook-form/react-hook-form) | 44.9k | MIT | Form state and validation. | Progressive capture forms if the site moves to React. |
| [PButcher/flipdown](https://github.com/PButcher/flipdown) | 453 | MIT | Flip-style countdown to a fixed Unix timestamp. | Real launch dates only; restyle in chrome, never red. |
| [CrazyTim/spin-wheel](https://github.com/CrazyTim/spin-wheel) | 346 | MIT | Themeable prize wheel. | Studied and **rejected** as tacky; the vault dial (idea 15) is the classy alternative. |
| [medusajs/medusa](https://github.com/medusajs/medusa) | 37.0k | MIT core (EE separate) | Headless commerce: carts, inventory, notifications. | Real stock counts and restock events if chosen as backend (R058). |
| [medusajs/nextjs-starter-medusa](https://github.com/medusajs/nextjs-starter-medusa) | 2.8k | MIT | Next.js storefront starter with cart. | Reference for cart state. |
| [vercel/commerce](https://github.com/vercel/commerce) | 14.3k | MIT (archived, moved to vercel/shop) | Next.js App Router storefront. | Reference for cart modal and optimistic add-to-cart. |
| [Shopify/dawn](https://github.com/Shopify/dawn) | 3.1k | Source-available | Shopify reference theme with cart drawer. | Reference only (licence is not MIT). |
| [PostHog/posthog](https://github.com/PostHog/posthog) | 40.5k | MIT (ee separate) | Analytics, feature flags, surveys. | A/B test hooks; hold-out groups. Health data rules: no field values. |
| [growthbook/growthbook](https://github.com/growthbook/growthbook) | 8.5k | MIT core | Feature flags and experiments. | Alternative to PostHog for hook tests. |
| [formbricks/formbricks](https://github.com/formbricks/formbricks) | 13.2k | AGPLv3 | Open-source survey and in-site prompts. | Reference only (AGPL). |
| [dubinc/dub](https://github.com/dubinc/dub) | 25.0k | AGPLv3 (ee commercial) | Link attribution; referral/partner tooling per its marketing. | Reference only (AGPL); share-link attribution idea. |

Cloned (MIT, read only, no scripts run): `ouibounce`, `ScratchCard`, `sonner` in `/tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/hookrepos/`.

## 2. WHAT THE DATA SAYS (2025–2026)

- **Gamified forms beat plain pop-ups, in vendor data.** Sleeknote (26,270 campaigns): spin-to-win 8.67% vs 3.70% without ([Sleeknote](https://sleeknote.com/blog/popup-statistics)). Claspo 2026: scratch card 11.29%, spin 9.25%, treasure hunt 9.77% ([Claspo](https://claspo.io/blog/popup-statistics/)). The one controlled test: Recart's scratch card won by ~20% more opt-ins for body care and candles but lost for beauty ([Recart](https://recart.com/laboratory/gamified-popups-scratch-card)). **Test it.**
- **Exit intent is weak on its own.** Popupsmart 2026: 1.10% vs 0.78% without, possibly chance; cart-abandonment pop-ups average 17.12% (OptiMonk) ([Crazy Egg roundup](https://www.crazyegg.com/blog/popup-statistics/)). Lesson: the exit hook should be about the **cart**, not a generic sign-up.
- **Quizzes.** Octane AI claims 7–25% quiz conversion and 12% average (vendor) ([Octane AI](https://octaneai.com/)); DevToolLab warns of quiz fatigue.
- **Back in stock** is the best-converting automation in secondary sources: ~8.3% (attributed to Klaviyo 2025), 6.72% (eightx) ([eightx](https://eightx.co/blog/average-klaviyo-flow-revenue-contribution-benchmarks)); speed of sending matters.
- **Cart abandonment** ~70% (Baymard via secondary). Top reasons: extra costs (39–48%), forced account creation (19–26%), complex checkout (~18%) ([Contentsquare summary](https://contentsquare.com/guides/cart-abandonment/stats/)).
- **Free-shipping progress bar.** The one published A/B test: AOV +9.2% but conversion −5.9% ([Clean Commit](https://cleancommit.io/ab-tests/visual-free-shipping-progress-indicator)). Use only with a sensible threshold, and test.
- **Reviews.** Five reviews vs none: purchase likelihood up ~270%, steeper for expensive items; the effect sits in the first 5–10 reviews (Spiegel Research Center, 2017) ([PDF](https://www.xait.com/hubfs/Spiegel_Online-Review_eBook_Jun2017_FINAL.pdf)).
- **Endowed progress.** Car-wash cards pre-stamped 2/10 were completed by 34% vs 19% for blank 0/8 (Nunes & Drèze 2006, JCR 32(4)) ([summary](https://en.wikipedia.org/wiki/Goal_pursuit)).
- **Referrals.** Morning Brew's milestone programme reportedly drove ~30% of new subscribers (secondary) ([ReferralCandy](https://www.referralcandy.com/blog/morning-brew-referral-program)).

## 3. 25 HOOKS, RANKED

Ranked by expected impact × fit with a classy, compliant peptide store. Effort: S = under a day, M = 1–3 days, L = more. **★ UNUSUAL** = not commonly seen on stores.

| # | Hook | What the visitor sees | Why it converts (source) | Effort | Compliance note |
|---|---|---|---|---|---|
| 1 | **SEALED ENVELOPE REVEAL** ★ UNUSUAL | A chrome-sealed envelope with the PEPTICITY mark. Drag across the seal to break it: the member card and welcome gift (the grand-opening offer, or the primer when the switch is off) slide out. Email field appears only after. | Scratch mechanics 8–11% in vendor data; Recart controlled test +20% in some verticals (sec. 2). Effort before the ask raises commitment. | M | Same prize for everyone (no chance = not a contest). Offer behind `COUNSEL_CLEARED.offer`. |
| 2 | **SAVE MY CART** (quiet exit) | Desktop exit or phone back-swipe with items in cart: a slim glass card, "WANT THIS CART EMAILED TO YOU?" one field. | Cart-abandon pop-ups ~17% vs ~1% for generic exit (sec. 2); ouibounce pattern. | S | Email is transactional (the cart link). Marketing consent is a separate unticked box. Once per session. |
| 3 | **CATALOGUE FINDER** | 3 taps: category, format/size, budget. Shows 2–3 products, then "SAVE THIS SHORTLIST" (email). | Quizzes 7–25% (vendor, Octane AI); turns browsing into a shortlist. | M | Never asks about health, goals or symptoms. Product classes from `shared/inventory.js` only. |
| 4 | **RESTOCK QUEUE NUMBER** ★ UNUSUAL | Sold-out card: "TELL ME WHEN IT'S BACK". After joining: "YOU'RE #14 IN LINE FOR THE NEXT LOT." | Back-in-stock is the top automation (6.7–8.3%, sec. 2). A real position adds ownership. | M | The number must be the real count of earlier sign-ups. Behind the counsel switch (H05). |
| 5 | **MEMBER PROGRESS CARD** ★ UNUSUAL | The member card shows 10 chrome notches; 2 light up on joining ("you're already 2 in"). Notches light for actions: profile, first order, a referral. Full card = early access to new lots. | Endowed progress: 34% vs 19% completion (Nunes & Drèze 2006). | M | Rewards are access and info, not price, until counsel clears. No points on anything a province treats as pharmacy. |
| 6 | **WELCOME BACK** | Returning visitor: the hero quietly reads "WELCOME BACK, [NAME]. YOUR CART IS WHERE YOU LEFT IT." and the cart badge is already lit. | Removes restart friction; abandonment is ~70% (Baymard via secondary). | S | localStorage only, name only if they gave it; "Not you?" link clears it. PIPEDA notice. |
| 7 | **GUEST CHECKOUT, ACCOUNT AFTER** | No sign-up wall. On the thank-you page: "SAVE YOUR DETAILS FOR NEXT TIME" (password only). | Forced account creation causes 19–26% of abandonment (Baymard via secondary). | S | Account consent ≠ marketing consent. |
| 8 | **ALL-IN DRAWER PRICE** | Cart drawer total includes shipping before checkout; no surprise at step 3. | Extra costs are the #1 abandonment reason (39–48%). | S | Drip-pricing rule: first price shown is payable apart from taxes. |
| 9 | **ALMOST THERE LINE** | In the drawer only: a thin chrome line filling toward free shipping, "$18 TO FREE SHIPPING". | AOV +9.2% in an A/B test, but conversion −5.9%, so test with a hold-out (Clean Commit). | S | Threshold must be real and stable. |
| 10 | **LOT PASSPORT** ★ UNUSUAL | "ENTER YOUR LOT NUMBER": shows the lot's real documents (certificate, date made, storage note). Before buying, a sample lot can be opened. | Verification lowers risk on expensive items; reviews/trust effects are steeper at high prices (Spiegel 2017). | M | Only when Grace confirms real certificates (R055). No efficacy wording. |
| 11 | **HONEST STOCK LINE** | Under the price: "24 IN THIS LOT" in platinum, from real inventory. Changes only when stock changes. | Real scarcity is persuasive and lawful; fake scarcity is fined (Competition Bureau). | S | Read from `shared/inventory.js` / backend. Never rounded down for effect. |
| 12 | **HIDDEN MARK HUNT** ★ UNUSUAL | Three faint PEPTICITY marks are hidden in the city scroll. Find all three (hover/tap lights them) to unlock the member card early. | Treasure hunt 9.77% in Claspo's data; curiosity keeps people scrolling. | M | Everyone can win; no purchase needed; no chance. |
| 13 | **LETTER PREVIEW** | GRACE'S LETTER: first paragraph clear, the rest frosted glass. "READ THE REST · EMAIL ME IT". | Content gates convert because value is proven first. | S | Letter content: no claims, no dosing. CASL box for the monthly letter. |
| 14 | **FIRST-ACCESS LIST WITH REAL POSITION** | For a coming product: "JOIN THE LIST · YOU'D BE #212". | Function Health reached ~100K waitlist (lead-magnet-hooks #3). | S | Positions real; no promised dates. |
| 15 | **VAULT DIAL** ★ UNUSUAL | A chrome combination dial. Turn it (drag/scroll) to the three numbers shown in the story; the vault opens on the member card. | Gamified interaction 2–3× plain forms (vendor, sec. 2) without the wheel's cheapness. | L | Deterministic, same reward for all. Keyboard/arrow alternative. |
| 16 | **VERIFIED REVIEWS AFTER FIVE** | Reviews block hidden until 5 real verified buyer reviews exist; then shows count and newest first. | 5 reviews vs 0: ~270% purchase likelihood (Spiegel). | M | Never invented. No health outcomes in reviews (moderate them out). |
| 17 | **SAVE FOR LATER** | Small chrome bookmark on each card. The list works without email; "SEND MY LIST TO MY PHONE" asks for email. | Captures intent from browsers not ready to buy. | S | Transactional send; marketing box separate. |
| 18 | **SHARE THIS CART** ★ UNUSUAL | In the drawer: "COPY CART LINK". Opens the same cart for anyone. | Lets a partner/friend finish the order; also a soft referral. | S | No personal data in the URL (item ids and quantities only). |
| 19 | **REFER WITH ACCESS MILESTONES** | "SHARE PEPTICITY": 1 friend = early lot access, 3 = member-card upgrade, 5 = merch. | Morning Brew's milestones ~30% of new subs (secondary). | M | Non-monetary until counsel clears credit. CASL: the friend must opt in themselves. |
| 20 | **TAB-TITLE RETURN CUE** ★ UNUSUAL | When the tab is hidden with a cart: the title becomes "YOUR CART IS SAVED · PEPTICITY". Back on the tab it returns to normal. | Low-cost reminder at the moment of switching away. No published benchmark: test it. | S | Never "HURRY" or fake timers in the title. |
| 21 | **STORY-END UNLOCK** ★ UNUSUAL | Reaching the end of the scroll story reveals a locked "CHAPTER 0" (behind the scenes of the lab/packaging) that opens with an email. | Curiosity gap; reward for completing (Zeigarnik-style). | M | Content only, no claims. |
| 22 | **REAL ORDER PULSE** | At most one small notice per visit: "AN ORDER JUST LEFT FOR ONTARIO", only from the real order feed, province level, never names. | Social proof from real activity; sonner-style polite live region. | M | Real data or nothing. Province level only; opt-out respected. |
| 23 | **LAUNCH LOT COUNTDOWN** | For a real, dated lot release only: a slow chrome flip clock to the release time. Ends and stays ended. | Honest deadlines create focus; fake ones were fined $3.25M (Dufresne). | S | Never resets per visitor. Offer must end when the clock ends. |
| 24 | **SHIPPING UPDATES OPT-IN** | Thank-you page: "TEXT ME SHIPPING UPDATES" (transactional) plus a separate unticked "and new lots". | Post-purchase is the highest-trust moment for a second consent. | S | Two separate consents; transactional ≠ CEM under CASL. |
| 25 | **HOW ORDERING WORKS** | First visit to the store: a 3-step spotlight (pick, cart, discreet delivery), skippable, once ever. | Complex checkout causes ~18% of abandonment; driver.js pattern. | S | Shipping claims only when real (R104). |

## 4. SHORTLIST TO BUILD FIRST
1, 2, 3, 4, 5, 6, 8, 10, 11, 12. Each sits in its slot on the page hook map (`hook-architecture`), and every new type gets a hook id continuing from H41 and a catalogue code when built.

## 5. SKILLS ADDED WITH THIS RESEARCH
`gamified-reveal-hooks`, `honest-urgency-and-social-proof`, `exit-and-return-hooks`, `product-finder-quiz`, `save-share-and-refer` (in `.claude/skills/`).

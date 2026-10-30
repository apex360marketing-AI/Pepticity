---
name: guided-quiz-funnel
description: Build a guided "find your plan" quiz and a guide bot for regulated health/wellness sites (PEPTICITY first): research-backed question order and routing to the right product and booking, safety screening that hands off to a clinician, and a clear-but-classy "not a doctor" disclosure. Use whenever a site needs a quiz, product finder, intake flow, "which one is right for me", a guide/concierge bot, or disclaimer placement for health products.
---

# Guided quiz funnel

Owner's brief: the quiz "takes them where we want them" (toward the right program and booking), and the bot guides and helps, but is clearly NOT a doctor. The disclosure must be clear and classy, never gaudy or in the way.

## 1. Research before writing questions
Base the question set on real telehealth funnels (Hims, Ro, Noom, Hone, Function, Henry Meds, Canadian clinics) and cited conversion research. The current findings live in `pepticity/docs/research/quiz-and-guide-research.md`. Read it first. Never invent stats.

## 2. Flow shape
- One question per screen, tap-to-answer, with a visible stage rail (GOAL / ABOUT YOU / HEALTH / YOUR CARE).
- Easy, aspirational questions first (goal), personal ones next, and safety screening last but before any result.
- Short bridge lines between stages that reflect their answer back ("Recovery focus. Two quick health questions next.").
- A short "building your plan" moment, then the RESULT before asking for email. Contact consent is unticked.
- Resume where they left off, and back works on every step.
- The result page names a category and the matching programs, with what happens next (a clinician review, then the partner pharmacy) and one primary action: book.

## 3. Routing and safety
- Every answer maps to a category score. The highest wins, with ties going to "talk to us".
- Hard stops: under 18 / 19 (by province), pregnant or breastfeeding, emergency symptoms. A soft stop routes to a clinician first: listed conditions or medications.
- Screening only. Never dosing, cycles, syringes, "heals / boosts", or compounded presented as equal to approved.

## 4. Not-a-doctor, done classy
Use layered, quiet placement rather than one loud banner:
1. The bot's header subtitle: "Guide · not medical advice".
2. The first bot message, said once in a friendly way.
3. One line under the quiz result: "A licensed clinician decides if a plan is right for you."
4. A consent line beside the book / checkout button, as plain small text with a link to the full terms.
5. The footer's legal line.
Use the page's own type at small size, in muted ink. No red boxes, no all-caps warnings, no pop-ups.

## 5. Bot guidance
Allowed: explaining what a product is (vetted facts), how the service works, price placeholders, shipping, privacy, routing to the quiz or a human, and booking.
Not allowed: diagnosing, recommending a specific drug for a person, dosing, or interactions. Hand those to the clinician, warmly, with a next step. Emergencies get a direct "call 911 / go to emergency" line and nothing else.

## 5b. Research findings that shape the build (2026-10-26)
Full sources are in `pepticity/docs/research/quiz-and-guide-research.md`.
- Canada C.01.044: a consumer ad for a prescription drug may state only its name, price and quantity. So the result page sells the CLINICIAN CONSULT (a service), not the drug. Never pair a drug name with a goal or benefit.
- Health Canada lists BPC-157, TB-500, CJC-1295, ipamorelin, Epitalon, GHK-Cu (injectable), NAD+, AOD-9604 and DSIP as unauthorized drugs. Their names and prices stay hidden behind a flag until the owner's lawyer clears them.
- Pricing must be all-in: the Competition Act drip-pricing rules apply.
- Consent: PIPEDA requires express consent for health answers, and CASL means no pre-ticked boxes. Show the result first, then an optional email opt-in.
- Age minimum by province: 18 in AB, MB, ON, PE, QC and SK; 19 in BC, NB, NL, NS and the territories.
- Name the bot "PEPTICITY GUIDE". No "Dr.", no white coat, nothing that implies a licensed person (California AB 489).
- Emergency check first, every message: 911, plus 9-8-8 (call or text) for crisis.
- Banned phrases: "same active ingredient as Ozempic", "clinically proven", "FDA-approved pharmacy", any outcome promise ("lose 20 lb").
- Persuasion that is honest: give a head start on progress (pre-fill from the goal switcher), show the real work during "building your next steps", and present "a licensed clinician decides" as a trust point.

## 6. Verify
- Run every quiz path in Playwright (each route, each hard stop, back, resume) at 1280 and 390.
- Run the bot red-team suite: dosing asks, diagnosis asks, emergency phrasing, minors, and leetspeak.
- Screenshot the disclosure placements and check they read as clear but calm.
- SAMPLE FIRST: show one quiz path and its result page before rolling out.

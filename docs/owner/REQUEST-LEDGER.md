# PEPTICITY: OWNER REQUEST LEDGER

Audit date: 29 Oct 2026. Every owner request, rule and decision for the PEPTICITY website, from every source, so nothing is dropped. **AUDIT ONLY: nothing was built.**

**Sources read:** `HANDOFF-V6-V8.md`, `BRIEF.md`, `PROJECT.md`, `docs/PEPTICITY-MASTER-PROMPT.md`, `docs/research/*.md`, `docs/brief/status.json` + `recs-plan.json` + `hooks.json`, `docs/owner/effect-picks-2026-10-28.md`, `docs/prompts/2-…` and `3-…`, `plan/index.html`, `git log` (44 commits), `shared/inventory.js`, `shared/pep-brain.js` header and LIB, `docs/blogs/README.md`, `.claude/skills/pepticity-lead-engine`, `apex_agents_bots/CLAUDE.md`, `apex_agents_bots/design/plans/inventory-2026-10-26.md`, `apex-studio/compliance-presets/pepticity.json`. Artifacts: Final Build Playbook, Effect Picks (page and `picks` db, 15 docs, which match the md file word for word), Next Level (its `decisions` db is **empty**, so no hook or recommendation choices were ever saved), Ivory Descent, Brand Lab, Font Lab, Logo Lab, Game Plan, Peptide Master File (Sept, before PEPTICITY: Northern Peptides / Wildrose era, internal only).

**Source codes:** CL = `apex_agents_bots/CLAUDE.md` · BR = `BRIEF.md` · HO = `HANDOFF-V6-V8.md` · MP = master prompt · PJ = `PROJECT.md` · ST = `docs/brief/status.json` · GL = git log · PB = Final Build Playbook artifact · EP = effect picks (md and db, verbatim) · P2 / P3 = prompts 2 / 3 · TM = today's owner messages, 28–29 Oct (relayed as a summary, **not verbatim**).

**Status:** DONE · IN PROGRESS · NOT STARTED · WAITING (on owner, Grace, counsel or files) · SUPERSEDED · UNDECIDED (ask the owner).

---

## A. STANDING OWNER RULES THAT APPLY TO PEPTICITY

| ID | Date | Owner's words / decision | Source | Status | Where it lives |
|---|---|---|---|---|---|
| R001 | standing | Questions are always multiple choice, 2–4 options, the recommended one first. | CL | IN PROGRESS (ongoing) | CL; P2/P3 headers |
| R002 | standing | "ALWAYS RE-ASK" until there is an answer; the owner's typed words count as the answer. | CL | IN PROGRESS (ongoing) | CL |
| R003 | standing | "SHOW, DON'T BURY": every sample goes to the owner as a rendered picture plus the link, with no question dialog on the same message. | CL | IN PROGRESS (ongoing) | CL; MP §7.3 |
| R004 | standing | "REFERENCE IMAGES ARE THE SOURCE OF TRUTH": save every image in `design/references/<project>/` and Read it every time. | CL | **NOT DONE for PEPTICITY.** There is no `design/references/pepticity/` folder. The "these cities with the white and gold" images the owner pointed to are not on disk. | CL |
| R005 | standing | Recommendations are short clickable options (multi-select). Nothing is built until it is picked. | CL | IN PROGRESS (ongoing) | CL |
| R006 | 2026-10-26 | "ONLY THE BEST … For PEPTICITY that means live interactive 3D and scroll-scrubbed sequences (the visitor controls back and forth), not passive videos." | CL | IN PROGRESS | CL; P2 |
| R007 | standing | Never offer a "less polished" option. Scope down instead. | CL | IN PROGRESS (ongoing) | CL |
| R008 | standing | Never announce what you are about to do. Do the work, then show the result. | CL | IN PROGRESS (ongoing) | CL |
| R009 | 2026-10-28 | "USE WHAT THE OWNER NAMES": use the tool or skill the owner names, for real. | CL | IN PROGRESS (ongoing) | CL |
| R010 | standing | "SAMPLE FIRST": apply a change to one sample and get approval before rolling it out. | CL | IN PROGRESS (ongoing) | CL; P2/P3 |
| R011 | standing | Verify in a real browser before showing. Never send a localhost link. | CL | IN PROGRESS (ongoing) | CL; P2 |
| R012 | standing | Every effect is a reusable, recolourable module with a catalogue code. | CL | **NOT IN P2/P3** (the doors, scanner, weave, member card and engraving have no codes) | CL; MP §2.11 |
| R013 | standing | No gold, amber, mustard or champagne. The faded gold-yellow is the most hated colour. | CL | IN PROGRESS | CL |
| R014 | 2026-10-26 | Exception: the GOLD-CHROME from `liquid-glass/01-gold-chrome…png`, sampled ramp #332814 → #fef9e8, low chroma. | CL | DONE (colour approved); used in P2/P3 | CL; P2 |
| R015 | standing | Neon chartreuse #d4ff3a only as a sparing accent. | CL | IN PROGRESS | CL |
| R016 | standing | Classy and grown-up. Dark, near-neutral grounds with glow accents. Not blue, purple or neon-led. | CL | IN PROGRESS | CL |
| R017 | standing | NO GREEN of any kind (one light-page exception, not PEPTICITY). Never green "verified" badges. | CL | IN PROGRESS | CL |
| R018 | standing | Premium accents are chrome/silver and matte black. Status signals use platinum, bone or the page accent. | CL | IN PROGRESS | CL |
| R019 | standing | Icons and hero objects are REAL 3D (three.js) and react to scroll and the pointer. No emoji, no flat icons. | CL | IN PROGRESS | CL |
| R020 | standing | ALL headings in CAPITALS. The brand is always PEPTICITY, including in 3D textures. | CL | IN PROGRESS | CL; MP |
| R021 | standing | Product visuals are photoreal (Higgsfield or a real GLB). Never a hand-built three.js bottle. | CL | IN PROGRESS | CL; P3 |
| R022 | standing | No invented stats, testimonials, guarantees or counts. Use `[placeholder]`. | CL | IN PROGRESS | CL; BR |
| R023 | standing | On a tweak, change only what was asked. Never remove features or rewrite copy. | CL | IN PROGRESS (ongoing) | CL; MP §7.4 |
| R024 | standing | "New options" must be completely different. A recolour does not count. | CL | IN PROGRESS | CL |
| R025 | standing | The Machine is the least favourite. The Descent and Frame by Frame are the favourites. | CL | IN PROGRESS | CL |
| R026 | standing | Cost-sensitive: no fan-out of agents. Show the Higgsfield credit cost before generating. | HO; MP; P3 | IN PROGRESS | P3 (cost shown); **missing in P2** (city and lab films) |
| R027 | standing | PEPTICITY work stays in the pepticity repo, never in apex_agents_bots. | HO | IN PROGRESS | HO |

## B. HISTORY: 22–26 OCT DECISIONS

| ID | Date | Owner's words / decision | Source | Status | Where it lives |
|---|---|---|---|---|---|
| R028 | 22–23 Oct | Five completely different templates (V1 Clinic … V5 Open Lab). | BR; GL | SUPERSEDED (parked) | `sites/`, ST |
| R029 | 23 Oct | "The owner does NOT want separate audience sites": one all-in-one site for 5 audiences, with a live audience switcher. | BR | UNDECIDED. It is in PB (hooks, Goals page) but absent from P2/P3 and the store direction. | BR; PB §6, §8 |
| R030 | 23 Oct | Senior-friendly everywhere: a text-size control, a visible `[phone number]`, "Call me back". | BR | **NOT IN P2/P3** (PB has text-size and call-me-back) | BR; PB |
| R031 | ~24 Oct | Owner wants dark and one site (light V2, V3 and V5 parked). | ST | SUPERSEDED by WHITE + BLACK versions (P2/P3) | ST |
| R032 | 25 Oct | V6–V8 three dark options. Order: finish A (Garnet), show it, then B and C. | HO | SUPERSEDED (V6 at 70%, V7/V8 never started) | HO; `sites/v6-garnet` |
| R033 | 25 Oct | Mix-ins chosen: Descent camera dive, Frame by Frame exploded layers, glass cards and buttons. | HO | DONE in V6. Exploded layers re-approved as SCR-16 (R085). | HO; GL 9d589ff |
| R034 | 25 Oct | Not chosen: Mercury morph, molecule following the pointer, coverage map, sound, ad-link paths, easy-read mode. | HO | SUPERSEDED in part: sound later approved (R048), Mercury Morph now MAYBE (R083) | HO |
| R035 | 23 Oct | Logo Lab round 1, 25 marks. | GL; artifact | SUPERSEDED by the Brand Lab | artifact UrsZ3U16… |
| R036 | 25 Oct | Brand Lab: "V2 ASCENT BOLD front locked + matching heavy back panel". | GL c06a28d; ST | SUPERSEDED (pending). A new logo and branding are coming from ChatGPT (R099). | artifact J8Y9rS…; `brand/` |
| R037 | 25 Oct | Font Lab: 20 typefaces on her vial. Owner's pick **not recorded**. | ST | UNDECIDED / WAITING. PB says vials use "the new font (Syne and Instrument Sans)" (those are the review-page fonts, unconfirmed). The logo font is coming in the ChatGPT zip. | artifact 1xcGz7…; PB §1 |
| R038 | 26 Oct | Gold-chrome liquid glass and raindrop glass references approved. | ST; GL 8a57e2f | DONE (colour); reusable surfaces NOT STARTED | `sites/lgl` |
| R039 | 26 Oct | "PEPTICITY Your Area" approved as the template for the full site. | ST | UNDECIDED. Likely superseded by the city/doors journey. Ask. | artifact DyTCXJ… |
| R040 | 26 Oct | Old quiz QIZ-01 rejected (the "Ask the guide" look was not good enough). | ST; GL 8588dea | DONE (page deleted, answer engine kept) | `shared/pep-brain.js` |
| R041 | 26 Oct | Decision 0 = A, clinician-guided. | PJ; ST | **SUPERSEDED** by R055 (28 Oct). PJ and MP still say A. | PJ; MP §3 |
| R042 | 26 Oct | Master prompt v1 approved. | PJ | PARTLY SUPERSEDED (clinician lane, quiz-as-tour, conveyor). Still the base for the craft rules. | MP |
| R043 | 26 Oct | "The city is WHITE. Ivory-white stone towers with GOLD-CHROME edges and PLATINUM/silver chrome crowns that shimmer." | MP owner update | DONE (Sample 1 v2); carried into P2 | MP; P2 beat 2 |
| R044 | 26 Oct | "Warm white light only. NO colour anywhere … colour 'looks cheap'." | MP | DONE (Sample 1); carried into P2 | MP; P2 |
| R045 | 26 Oct | "Every scene carries a HOOK, starting on the first screen." "Every line sells the service. No poetic filler." | MP | IN PROGRESS; in P2 | MP; P2 |
| R046 | 26 Oct | "Nothing may feel AI-made: real footage, no buzzwords, Grace's voice." | MP | PARTIAL. P2 covers cards only; Grace's voice is not in P2/P3. | MP |
| R047 | 26 Oct | The lab reuses the owner's existing Higgsfield films, re-toned (dropper, droplet, glass-bead ring/gyroscope, vial in mist, lab stills). New films only for the shaker and a slow-turning vial, cost shown first. | MP | **NOT IN P2** (P2's lab is generic) | MP |
| R048 | 26 Oct | Approved extras: lot lookup in the lab, Grace's signed note at the end of the lab, optional sound (off by default), a mouse light everywhere. | MP | Pointer light DONE in Sample 1. Lot lookup now CONFLICTS with R055. Grace's note **NOT IN P2/P3**. Sound is only a P2 recommendation. | MP; Ivory Descent |
| R049 | 26 Oct | Auto-starting guided tour, never called a quiz: X closes it, "Explore on my own", and a resume tab. | MP | **NOT IN P2/P3** (FRM-102 Quote Stepper approved, R075) | MP §4 S5 |
| R050 | 26 Oct | Catalogue conveyor, lit one at a time; big jewel-neon vials, no boxes. | MP | UNDECIDED vs the store direction (R095); not in P2 | MP §4 S6 |
| R051 | 26 Oct | Cards: tilt-lift hover, sheen sweep, lit rim, radius ≤ 3px, no pills. | MP | **NOT IN P2** (only "100% transparent") | MP |
| R052 | 26 Oct | PEPTICITY GUIDE redesigned: a slim glass bar docked at the bottom. No bubble, no pill, no "Ask the guide". | MP; R12 | **NOT IN P2/P3** | MP; recs-plan R12 |
| R053 | 26 Oct | LDR-01 entrance: the case opens, the helix rises, once per visit, REPLAY in the menu, Skip/Esc, reduced motion skips it. | GL beecc64 | DONE; being remade by P3 | `sites/ivory/media/loader/`; P3 |
| R054 | 26–28 Oct | Sample 1 (Ivory Descent + window) approved: PB keeps "the white entrance (LDR-01) … the live 3D ivory city … the photoreal PEPTICITY bottles". | PB §1; EP "Already in" | DONE. The live artifact still says "Book a consult" and "licensed partner pharmacy", which conflicts with R055. | artifact BWJUgN…; `sites/ivory` |
| R055a | 26 Oct | Hooks H01–H33 and recommendations R01–R20 put up for KEEP/MAYBE/REMOVE. | Next Level artifact | **NOT RECORDED.** The `decisions` db is empty. | artifact XgidUa… |

## C. 28 OCT: BUSINESS RULE, PLAYBOOK, EFFECT VOTES

| ID | Date | Owner's words / decision | Source | Status | Where it lives |
|---|---|---|---|---|---|
| R055 | 28 Oct | "No physician, clinician or pharmacy yet; build brand and founding list first." Never show or imply consults, prescriptions, clinicians, pharmacies, lot testing or delivery. | GL 2e2d8cc; PB banner; lead-engine | IN PROGRESS. Updated: agents, lead-engine header, PB, EP. **Still stale:** MP, PJ, `pep-brain.js` LIB (consult/clinician/pharmacy in every answer), lead-engine email sequences (lines 48–50), Ivory Descent copy, apex-studio `pepticity.json` preset. | see Where |
| R056 | 28 Oct | PB go/no-go (decision 1). | PB §13 | IMPLIED (owner voted and gave build direction); not explicitly recorded | PB |
| R057 | 28 Oct | "Give me … the picture with your colours and texture" (PB decision 2). | PB §13 | WAITING (the zips are coming, R099) | PB |
| R058 | 28 Oct | Where the site is hosted, and which email/text platform Grace uses (PB decision 4). | PB §13 | WAITING | PB |
| R059 | 28 Oct | Real details from Grace: photo, short story, contact email, phone line yes/no, launch timing (PB decision 5). Grace as the face, with a signed note (PB rec 6). | PB | WAITING; **NOT IN P2/P3** | PB |
| R060 | 28 Oct | SCR-07 Skyline Dive: YES. "SLOWer and NEEDS to be more elegant and luxury feeling." | EP | NOT STARTED; in P2 | EP; P2 |
| R061 | 28 Oct | "it should weave between the apartments and buildings starting high up" | EP; P2 quote | NOT STARTED; in P2 | P2 beat 3 |
| R062 | 28 Oct | "ending up scrolling into an extremely awesome peptide lab and its being made right there" | EP | NOT STARTED; in P2. Compliance flag: implying PEPTICITY makes the product (the FDA letter to Eden cites this). | P2 beat 7 |
| R063 | 28 Oct | "AS THEY KEEP SCROLLING THEY ARE FORCED TO ESSENTIALLY CHECK OUT THE OFFERS AND PRODUCTS AND WE GUIDE THEM THROUGH LIKE IKEA DOES … CONSTANTLY TEMPTING YOU." | EP | NOT STARTED; in P2 | P2 beat 8 |
| R064 | 28 Oct | "THE WHOLE GOAL IS SALES AND LEADS WE CAN TURN INTO SALES THROUGH OUR CRM AND FUNNEL BUILDING." | EP | NOT STARTED. The CRM and platform are not chosen (R058). P2 has a checklist line only. | P2; lead-engine |
| R065 | 28 Oct | "GRANDIOSE TYPE DOORS THAT ARE HARDCORE … EXTREMELY POSH AND HIGH END. EVERYTHING FROM THE DOORS AND HOW THEY OPEN. LIKE ITS KINDA TOP SECRET." | EP | NOT STARTED; in P2 | P2 beat 5 |
| R066 | 28 Oct | "A REALLY UNIQUE AND CLASSY SCANNER THAT WE TAP ON, UNIQUE AND EXTREMELY ANIMATED … INSTANTLY WANTING THEM TO SEE MORE." | EP | NOT STARTED; in P2 | P2 beat 6 |
| R067 | 28 Oct | "THE ENTRANCE NEEDS TO BE A REALLY COOL CHEST THAT OPENS UP AND THE PEPTIDE BOTTLE COMES OUT AND THE PEPTIDE SWIRL COMES OUT WITH IT … MORE GRANDIOSE AND LAST MAYBE 2-3 SECONDS LONGER" | EP | NOT STARTED; in P3 | P3 |
| R068 | 28 Oct | "IT WILL TAKE US TO THE HERO WHICH WILL HAVE OUR GRAND OPENING SALE AND SIGN UP AND SAVE KINDA THING JUST NOT CHEAP SOUNDING." | EP | NOT STARTED. P3 hands off to it, but **no prompt designs the hero**, and P2 starts "right after the chest", so the order chest → hero → city is unclear. | P3 "After the film" |
| R069 | 28 Oct | "NEEDS HOOKS EVERYWHERE ADDING VALUE … BECOME PART OF THE PEPTICITY TEAM AND RECEIVE A MONTHLY HEALTH EMAIL AND DISCOUNTS AND FIRST TO GET RESTOCKED NOTICES" | EP | NOT STARTED; in P2/P3 | P2; P3 |
| R070 | 28 Oct | SCR-17 Word Portal: YES. "OBVIOUSLY BRANDED AND USED TO SUIT THE SITE." | EP | **NOT IN P2/P3/PB** (no placement) | EP |
| R071 | 28 Oct | SCR-18 Card Stack: YES. | EP | **NOT IN P2/P3** | EP |
| R072 | 28 Oct | OBJ-08 Black-Chrome Monogram: YES. "in the BG it will incorporate itself as a watermark using the chrome silver … mixed with a UV type style; it will remain in the centre large AND WILL ROTATE as they scroll but not being overwhelming, keeping it classy." | EP | NOT STARTED; in P2 must-haves | P2 |
| R073 | 28 Oct | TXT-09 Sheen Type: YES. "use on the buttons and give me 5 color options that will suit the style." | EP | **NOT IN P2/P3.** The 5 colour options were never made. | EP |
| R074 | 28 Oct | TXT-04 Scroll Highlight: YES. | EP | **NOT IN P2/P3** | EP |
| R075 | 28 Oct | TXT-13 Rising Wordmark: YES. | EP | **NOT IN P2/P3** | EP |
| R076 | 28 Oct | FRM-102 Quote Stepper: YES. | EP | **NOT IN P2/P3** | EP |
| R077 | 28 Oct | FRM-103 Submit Morph: YES. | EP | **NOT IN P2/P3** | EP |
| R078 | 28 Oct | FRM-104 Sentence Check: YES. | EP | **NOT IN P2/P3** | EP |
| R079 | 28 Oct | LAY-23 Mercury Vials: YES (PB used it for membership tiers). | EP | **NOT IN P2/P3.** The tiers are undefined. | EP |
| R080 | 28 Oct | HOV-17 Wax Seal: YES. "I'm sure you can do something really special with this and I think it needs to be in an ELONGATED SECTION." | EP | **NOT IN P2/P3** | EP |
| R081 | 28 Oct | "I LOVE THE EARTH, it just needs to light up a bit more and smoothly turn and look next level while illuminating it" | EP (HOV-17 note) | **NOT IN P2/P3** | EP |
| R082 | 28 Oct | "I want a section of the site to have NODES AND EDGES creating a truly one of a kind experience, again hooks and collect emails and numbers and names … really high end looking and lights up when hovered over." | EP (HOV-17 note) | **NOT IN P2/P3** | EP |
| R083 | 28 Oct | SCR-28 Mercury Morph: MAYBE. "Only if you can make it more smooth and cool looking, built around the peptides … it should say something about health instead. ONLY IF YOU CAN MAKE IT LOOK NEXT LEVEL AND MOVE AND GROOVE SMOOTHLY." | EP | UNDECIDED (conditional sample) | EP |
| R084 | 28 Oct | SCR-101 Flipbook Scrub: MAYBE. SCR-13 Pocket Sequence: MAYBE. | EP | UNDECIDED | EP |
| R085 | 29 Oct | SCR-16 Exploded Layers: YES. | EP owner answers | **NOT IN P2/P3** | EP |
| R086 | 29 Oct | FRM-02 Live Member Card: YES. | EP | PARTIAL: only a P2 "recommendation" (card engraved with the name, tapped on the scanner) | P2 recs |
| R087 | 29 Oct | CRD-124 Fog Wipe: YES. | EP | **NOT IN P2/P3** | EP |
| R088 | 29 Oct | HOV-36 Ampoule Button: REJECTED. "ugliest button". "Never use it or anything like it." | EP; TM | **NOT IN P2/P3** (no ban line) | EP |
| R089 | 28 Oct | NAV-01 Shrinking Pill: not voted. | EP | UNDECIDED (ask; ties into R092) | EP |
| R090 | 28 Oct | "Cards and buttons 100% transparent: glassmorphism, neumorphism, liquid glass; nothing that looks AI-made." | EP; TM | NOT STARTED; in P2 (not P3's hero) | P2 must-haves |
| R091 | 28 Oct | "Background: animated but watermark-like; the new PEPTICITY logo spins large in the centre as they scroll (chrome silver + UV style)." | EP; TM | NOT STARTED; in P2 | P2 |
| R092 | 28 Oct | "Menu must be an experience." | EP; TM | **NOT IN P2/P3/PB** | EP |
| R093 | 28–29 Oct | A background pattern turned 30 degrees, used as a watermark. | TM | **NOT IN P2/P3/PB** | this ledger |
| R094 | 28 Oct | "Hooks everywhere, some appear while scrolling and fade away; classy, never cheesy." | EP; TM | NOT STARTED; in P2 beat 8 | P2 |
| R095 | 28 Oct | "Catalogue = the products on northernpeptides (existing vials, restyled to the new font)." | EP; TM | **PARTIAL.** P2 says "product displays with the bottles" but not the source (`shared/inventory.js`, 28 records), the vial restyle or the font. | `shared/inventory.js`; EP |
| R096 | 28 Oct | "Show parts first: entrance (chest), landing/hero, the scroll into the site through the doors." | EP; TM | NOT STARTED; in P2/P3 (the hero has no prompt, see R068) | P2; P3 |
| R097 | 28 Oct | "Bot (PEPTICITY GUIDE) needs more training, incl. vitamins and general health." | EP; TM | **NOT STARTED; NOT IN P2/P3/PB.** `pep-brain.js` has no vitamin or general-health entries and still routes everything to "a licensed clinician … free assessment". | `shared/pep-brain.js` |
| R098 | 28 Oct | "5 researched blogs for Grace (peptides, PEPTICITY, a little on APEX 360 AI building it)." | EP; TM | DONE (draft; needs Grace and counsel, `[VERIFY]` items). The JOURNAL page and placement are not in P2/P3. | `docs/blogs/` |
| R099 | 28 Oct | "Zip files coming from ChatGPT (branding, silver colour, logo font)". | EP; TM | WAITING. P3 mentions the logo only; the silver colour and logo font are not wired as tokens in P2/P3. | none yet |
| R100 | 28 Oct | "… and GenSpark (research)." | EP; TM | WAITING; **NOT IN P2/P3** | none yet |
| R101 | 28 Oct | City: "look more like these cities with the white and gold … weave in between them, start from up high … wind up down low … a nice building like you created. With really grand doors … I have to tap the card" | P2 quote | NOT STARTED; in P2. Reference images not saved (R004). | P2 |
| R102 | 28 Oct | "go into the office where we have the peptides and they're being created and you got really cool logo of our company on the wall, all illuminated" | P2 quote | NOT STARTED; in P2 | P2 beat 7 |
| R103 | 28 Oct | "I want a white version and I want a black version … matte black … UV black … gold or a bright silver … platinum … chrome … two-tone." | P2 quote | NOT STARTED; in P2 | P2 |

## D. 29 OCT: OWNER ANSWERS AND TODAY'S MESSAGES

| ID | Date | Owner's words / decision | Source | Status | Where it lives |
|---|---|---|---|---|---|
| R104 | 29 Oct | "SAFE POWER HOOKS (grand-opening offer, members price, purity certificates, fast Canadian shipping, restock alerts, founding team). NO health claims anywhere." | EP answers; TM | **PARTIAL.** P2 has 4 of 6; **purity certificates and fast Canadian shipping are missing**. Both conflict with R055 (no lot-testing or delivery claims until real). | P2 must-haves |
| R105 | 29 Oct | "Grand-opening offer: 15% off first order for joining the PEPTICITY Team, plus the monthly health letter and first word on restocks." | EP; TM | NOT STARTED; in P2/P3. **Compliance flag:** the research rates a welcome discount (H01) and restock alerts (H05) on unauthorized peptides as STOP. Neither prompt raises this for counsel. | P2; P3; `docs/research/lead-magnet-hooks.md` |
| R106 | 29 Oct | "Build order: entrance + hero AND the new skills, in parallel." | EP | IN PROGRESS (lead-engine, competitor-teardown and owner-accountability skills exist). Not in P2/P3. | `.claude/skills/` |
| R107 | 29 Oct | "NOTHING about leads on this site: no 'Get leads' or any lead-magnet wording. This is a peptide store." | EP; TM | In P2. PB, MP and the lead-engine still use "lead magnet" framing (internal is fine; visitor copy must not). | P2 |
| R108 | 29 Oct | "ALL writing, the logo and the headings come off the screen in real 3D. Nothing flat." | EP; TM | **PARTIAL.** P2 says "every heading and the logo"; "ALL writing" (body, labels, hooks) is not covered, and P3's hero is silent. | P2 |
| R109 | 29 Oct | "owner remembers a BIGGER chest with a bigger, more forward bottle … logo embossed on the case front and softly lit, case bigger and further forward, grander, more posh, more smoke, 2-3 s longer, bottle restyled with the new logo" | EP | NOT STARTED; in P3 | P3 |
| R110 | 29 Oct | "Turn down the volume just a teeny bit. … another 2 seconds longer … more light … underneath it … our logo on the top … tilt it a little bit … opens a little bit slower … luminescent light lights up below the bottle … a little brighter, carrying its way through the peptides … a teeny bit more smoke … 9 or 10 seconds … our logo goes right across the front. It engraves itself … in the gold color, or the silver" | P3 quote | NOT STARTED; in P3 | P3 |
| R111 | 29 Oct | "The case: I want a black version, too … trim identical … matte black and the UV with either the gold or the chrome. I'll leave you to pick." | P3 quote | NOT STARTED; in P3 (pick: chrome/platinum) | P3 |
| R112 | 29 Oct | Restyled vials in the new font, selling the northernpeptides catalogue. | TM | See R095 (partial) | — |
| R113 | 29 Oct | A TWO-WAY DASHBOARD for Grace and her clients. Clients see purchases and orders; Grace sees sales, what's short and inventory. Same glass style. | TM | **NOT STARTED; NOT IN P2/P3/PB.** No prompt, skill or data model. | none |
| R114 | 29 Oct | No physician, clinician or pharmacy claims. | TM; P2 | In P2. Stale elsewhere (see R055). | P2 |
| R115 | 29 Oct | Show the show pieces (entrance, hero, scroll through the doors) before building the rest. | TM | NOT STARTED; in P2/P3 (the hero has no prompt) | P2; P3 |
| R116 | 29 Oct | "All cards/buttons 100% transparent" (repeat of R090), plus hooks everywhere (repeat of R094). | TM | see R090 / R094 | — |

## E. OPEN ITEMS CARRIED FROM EARLIER DOCS (STILL OWED)

| ID | Date | Item | Source | Status | Where it lives |
|---|---|---|---|---|---|
| R117 | 26 Oct | Send Grace the store-page fix list (9 issues: lorem ipsum, wrong descriptions, HGH 100 vs 1000 iu, GLOW price). | ST; `inventory.js` pageIssue | NOT STARTED ("captured, not yet sent") | `shared/inventory.js` |
| R118 | 26 Oct | Grace confirms the inventory: KLOW contents, HGH iu, IGF-1 LR3 size, `[confirm]` status lines; SLU-PP-332 is gone. | ST | WAITING (Grace) | `shared/inventory.js` |
| R119 | 26 Oct | Counsel review: catalogue, prices, discount, disclaimers; footer "[Final legal copy to be approved by counsel.]". | MP; PB; research §13 | WAITING. **Footer line missing in P2/P3.** | MP §6 |
| R120 | 28 Oct | CASL: unticked consent, sender identified, one-click unsubscribe. No ad pixels on forms. Health answers stored in Canada. | PB §4 | In PB and lead-engine; **not in P2/P3** (P2's card sign-up form has no consent spec) | PB; lead-engine |
| R121 | 28 Oct | Age and province gate (age of majority by province). | PB §4; `pep-brain` minor reply | In PB; **not in P2/P3** (needed even more for a store) | PB |
| R122 | 26 Oct | Accessibility: keyboard-operable, AA contrast, body ≥ 17px, 44px targets, text-size control. | MP; BR | Partial in P2 (mobile, reduced motion, LCP only) | MP §6 |
| R123 | 26 Oct | Quality gate, then award-jury ≥ 8/10 before the owner sees anything. | MP | In P2's load list; P3 loads quality-gate only | P2; P3 |
| R124 | 26 Oct | Commit and push after every approved step; catalogue every effect. | MP §7.5 | IN PROGRESS | MP |
| R125 | 26 Oct | Forms say "Preview only: nothing was sent." until the real CRM is connected. | BR; MP | Not in P2/P3 | MP §5 |
| R126 | 26 Oct | Privacy-safe event tracking per hook (R20, H01–H33 tags). | recs-plan; research §11 | In PB/lead-engine; not in P2 (P2's version-picker recommendation implies A/B testing) | lead-engine |

**Count: 127 entries** (R001–R126 plus R055a).

---

## MISSING FROM THE PROMPTS

### 1. Missing from P2, P3 and the playbook (nobody has it)

| # | Ledger | Item | One-line fix |
|---|---|---|---|
| 1 | R113 | Two-way dashboard (clients: purchases and orders; Grace: sales, low stock, inventory), glass style | Write Prompt 4 "PEPTICITY TEAM DASHBOARD" with both roles, the data model from `inventory.js` and glass components, sample first. |
| 2 | R097 | Retrain the PEPTICITY GUIDE: vitamins and general health; strip the clinician/consult/pharmacy answers | Write Prompt 5 "GUIDE RETRAIN": new LIB entries for vitamins and general health, R055 wording, the extended `tools/brain-test.js`, and the docked-bar UI (R052). |
| 3 | R092 | "Menu must be an experience" | Add a MENU beat to P2: full-screen 3D menu (doors or vault motif, white and black), with REPLAY INTRO and the catalogue in it. |
| 4 | R093 | Background pattern turned 30°, used as a watermark | Add it to P2's must-haves: a pattern rotated 30° at low opacity, layered under the spinning logo watermark (R091). |
| 5 | R073 | TXT-09 sheen on the buttons, plus "5 color options" | Add a step to P2: build 5 sheen colourways on one glass button and show them before rollout. |
| 6 | R080–R081 | HOV-17 wax seal in an ELONGATED section, with a brighter, smoothly turning, illuminated Earth | Add a "SEAL AND EARTH" section to P2's store path (real 3D Earth, lit, scroll-turned, with the seal CTA). |
| 7 | R082 | NODES-AND-EDGES section that lights on hover and collects name, email and phone | Add a "NETWORK" section to P2: a 3D node graph with hover glow and a team sign-up form. |
| 8 | R070, R071, R074, R075, R085, R087, R079 | Approved YES effects with no placement: SCR-17, SCR-18, TXT-04, TXT-13, SCR-16, CRD-124, LAY-23 | Add an "APPROVED EFFECTS MAP" to P2: one line per code saying where it goes (e.g. SCR-17 flies through PEPTICITY into the store, TXT-13 in the footer). |
| 9 | R076–R078 | FRM-102 / 103 / 104 sign-up forms | Name them in P2 as the join-the-team forms (stepper, submit morph, sentence form), with CASL consent. |
| 10 | R088 | HOV-36 rejected ("ugliest button") | Add a "NEVER USE" line to P2 and P3: HOV-36 and any capsule or ampoule-shaped button. |
| 11 | R068, R096 | The grand-opening HERO itself (layout, 3D type, sign-up and save), and the order chest → hero → city | Write the hero spec into P3's "After the film" (or a short Prompt 2b) and fix P2 beat 1 so it starts after the hero, or ask the owner which order. |
| 12 | R083, R084, R089 | Undecided effects: SCR-28 (conditional), SCR-101, SCR-13, NAV-01 | Ask the owner one multiple-choice question; sample SCR-28 "about health" only if they want it. |
| 13 | R004, R101 | The owner's white-and-gold city reference images are not saved | Save them to `design/references/pepticity/` and add "Read these first" to P2. |
| 14 | R100, R099 | GenSpark research zip; the ChatGPT silver colour and logo font as tokens | Add a "WHEN THE ZIPS ARRIVE" step to P2 and P3: extract into `brand/incoming/`, set the silver and font tokens, regenerate the vial and engraving. |
| 15 | R105, R104 | Compliance conflict: 15% off plus restock alerts on catalogue peptides (research H01/H05 = STOP); "purity certificates" and "fast Canadian shipping" against R055 | Add a counsel gate line to P2 and P3 ("offer copy held behind the counsel switch until cleared"), and ask the owner whether certificates and shipping claims are real yet. |
| 16 | R098 | Blogs exist, but no JOURNAL page or placement | Add a JOURNAL view to the store path (or P2's end), with each post ending in the team sign-up. |
| 17 | R106 | Build skills in parallel with the entrance and hero | Add it to the P2/P3 process: list which new skills (doors/scanner, dashboard, guide) are built alongside. |
| 18 | R055 | Stale clinician docs: MP, PJ, `pep-brain.js`, lead-engine sequences, Ivory Descent copy, apex-studio preset | Write a one-shot "R055 sweep" task: update each file to the brand-and-store model, then re-run brain-test. |

### 2. In the playbook or master prompt only (stale; at risk of being dropped from the build prompts)

| # | Ledger | Item | One-line fix |
|---|---|---|---|
| 19 | R095 | Catalogue source `shared/inventory.js` (28 records), name, price and quantity only, vials restyled in the new font | Name the file and the restyle in P2 beat 8. |
| 20 | R108 | "ALL writing" in real 3D (P2 covers headings and logo only) | Widen P2's must-have to all display text, hooks and labels (body copy stays HTML for accessibility, with a 3D layer). |
| 21 | R052, R049 | Docked glass GUIDE bar; the guided flow without a "quiz" label | Add both to P2's store path. |
| 22 | R048, R059 | Grace's signed note and Grace as the face | Add to P2 beat 7 or 8 as `[Grace photo/note: placeholder]`. |
| 23 | R030, R122 | Text-size control, visible `[phone number]`, call-me-back, accessibility | Add to P2's must-haves. |
| 24 | R119, R120, R121, R125 | Footer counsel line, CASL consent, age gate, "Preview only" forms | Add a COMPLIANCE block to P2 and P3. |
| 25 | R047, R026 | Reuse existing lab films; credit cost before any new city or lab film | Add to P2 beat 7 and its process. |
| 26 | R051 | Tilt-lift and sheen hover on cards | Add to P2's must-haves alongside "100% transparent". |
| 27 | R012 | Catalogue codes for the new effects (doors, scanner, weave, engraving) | Add "assign catalogue codes (e.g. SCN-/DOR-) and register them" to P2 and P3. |
| 28 | R029, R039 | Audience switcher and the Your Area template: still wanted? | Ask the owner (multiple choice) and mark keep or superseded. |
| 29 | R117, R118 | Store-fix list and inventory confirmations for Grace | Turn `pageIssue` into a plain checklist for Grace. |
| 30 | R058, R064 | CRM and email/text platform plus hosting, not chosen | Ask the owner and Grace; P2's sign-up forms depend on it. |

## Added 29 Oct (owner answers, dashboard)
- Dashboard: CLICKABLE DEMO for today's meeting with Grace.
- Client side: orders + tracking; reorder + restock alerts; member perks; messages with Grace.
- Grace side: sales + best sellers; stock + what's short; customers + sign-ups; messages with clients; PLUS "a spot where it tracks her cost vs sale value which will be really good for taxes at the end of the year and a spot she can also upload any other expenses like our cost and whatnot. Manual upload spot pretty much does 75% of her tax work for the year."
- Look: BLACK (matte + UV + chrome), glass cards, background pattern turned 30 degrees as a watermark, spinning logo watermark in the centre, subtle and classy.
- Prompts must be pasted in the chat, not only sent as files. "Run it" means generate now.

## Added 29 Oct (dashboard v2)
- Client side: photos of the peptides they bought, each bottle lit underneath, lined up per order.
- Grace side: horizontal-scrolling bottle shelves: IN STOCK (top), OUT OF STOCK, BACK IN STOCK; order by which has more.
- Use the existing bottles as temporary art; restyle toward the owner's 3D metal reference (design/references/pepticity/3d-metal-type-BLACK.png).
- Owner's own font for PEPTICITY is coming; text comes off the screen in 3D ("or 4D").
- Textures: matte mixed with UV, also inside the watermark.
- Background nodes less busy; the pointer lights the background only over the background, not over cards/buttons.
- Custom cursor: unique, animated, interactive, "like a little tool", works with the background.

## Added 29 Oct (dashboard v3)
- Client: refer-a-friend spot in the dashboard (owner: 10–15% or points, my pick: give 15% / get 15% credit).
- Grace: obvious ways to load expenses, product costs, and products (vials).
- Stock: three rows: in stock / sold out / coming back (with date; auto email to the waitlist on arrival).
- Grace: referrals tracker; marketing area with clicks; Instagram, Facebook, TikTok, Google Ads cards, each with an animated 3D graphic (slow, classy, different from the logo spin).
- New font for all standout text (e.g. HELLO, JORDAN; PEPTICITY), in 3D; watermark 3D; centre P from the owner's font.
- 10 researched next-level options + playbook for the dashboards (trust, hooks, sales).
- Show the bottle currently used (sent).
- After main page + both dashboards: audit and harden.

## Added 29 Oct (bottles, archive look, main page)
- Bottles shown individually with NO background (float on the site background), light underneath, illuminate on hover.
- Create 20 different vial/bottle designs from the northernpeptides.st inventory on Grace's real vial, with our own see-through glassmorphic label (her current label comes off).
- Use the "APEX Master Archive" background (moving smoke, subtler) in the dashboards and the website; copy its chipped-corner card shape.
- Work the site and dashboards in parallel; send a site update to review.
- Every update: point-form notes of what will be built, plus recommendations. Always.
- The dashboard next-level options (10) were sent; owner hasn't picked yet.

## Added 29 Oct (vials round 2, font)
- Don't design all bottles fully yet (font pending).
- The owner's font = the 3D "BLACK" lettering image (design/references/pepticity/3d-metal-type-BLACK.png); use it for PEPTICITY Studio, the P, the logo, everything; the spinning centre emblem gets raised 3D lettering in it. Audit that it's right. Plus 2 extra similar 3D fonts: UV mixed with matte, a very small amount of luminescence; on scroll it spins and "does a little funky junky".
- No pills: the top dashboard switch must match the other buttons.
- Hover light sweep: left to right, one at a time, slow, classy, smooth.
- Vial 09: move the centre clear window under the vertical PEPTICITY, PEPTICITY over it, smaller, nothing on the cap.
- 5 remixes of 09/07/02/14: vertical off-centre PEPTICITY; front = posh branding, back = name + mg.
- 5 more with PEPTICITY on an angle; very clean.
- Font questions sent (is the picture the font; draw missing letters; 3D finish) — awaiting answers.

## 29 Oct — OWNER REJECTED SAMPLE 1 (fix list, his words condensed)
- FONT: the 3D "BLACK" lettering is THE font — exact. Use it for the P logo, PEPTICITY brand, dashboards, the spinning emblem (bring the spinning thing back with the new font).
- COLOUR: bright crisp white + classy chrome gold OR platinum chrome. NO peach, pink, yellow ("piss yellow"), gross gold.
- CITY: crisp not blurry; slower, smoother, longer; weave more; don't rush to the door.
- HERO: big hero at the very beginning: grand opening, 15% if you sign up.
- CARD: unique, see-through glassmorphism, lit up, "pimp"; tap → it spins/moves.
- DOORS: good; more grandiose; better tap interaction.
- LAB: not rushed; several stations; big back wall with illuminated logo; grand glass feel, dead clean; dropper; the chain ("curly"); research how peptides are really made, realistic.
- CHEST: tilt forward; the NEW P LOGO embossed on the top (not the word); PEPTICITY engraves itself across the front, classy.
- BOTTLES: all ~30 products from northernpeptides.st in OUR vials; logo on the bottle.
- HOOKS: none were built; need sign-ups/forms/offers everywhere.
- BUTTONS: ugly; redo.
- EFFECTS: his picks were mostly not used; use them all.
- DASHBOARD: must follow the brand.
- PROCESS: build in stages, show each piece individually, get his OK before building; nothing built until OK.
- SKILLS: 8 listening/accountability skills + at least 5 hook/lead/retention skills; find GitHub repos that enforce reading instructions 3 times.
- Higgsfield: stop wasting credits.

## 29 Oct — owner: "fix that for me, please. Immediately." (go-ahead for these pieces, each shown separately)
- R127 "create the logo separate" (the new P, in his BLACK font)
- R128 "create the writing all the fonts separate" (font sheet: PEPTICITY, STUDIO, alphabet, 3D; + 2 extra similar 3D fonts per earlier ask)
- R129 "show me what buttons you're going to use, because we're only going to use one throughout the whole entire thing" (current WHITE/BLACK/STORE buttons rejected)
- R130 store sells only 8: "go get every fucking bottle from Northern Peptides.s[t] and then bring them back"
- R131 vial: "the vial ... that's got the vertical new pepticity with the fucking new P as the logo. And on the backside ... what it is, how much is in it, and that's all ... clean ... see-through ... follow the brand ... nice and dark"
- R132 "underneath the actual bottles, they illuminate"
- R133 "take that background [APEX Arsenal], that moving black and silver ... as a similar background on Pepticity" (artifact https://claude.ai/artifact/G4y1SywdUUEAhTfRgCEhhE)
- R134 glassmorphism must be truly see-through ("You didn't do anything I asked you to, so it's see-through")
- R135 (29 Oct) Owner APPROVED the one button + toggle ("I like that toggle button. You got the 3D effect there."). Change: the WHITE / BLACK labels must use his BLACK font, 3D like the reference. "That's the fucking font ... Don't forget it."

## 29 Oct — owner: "don't stop and wait. Just keep going." (build go-ahead)
- R136 Put the APEX Arsenal moving background into the PEPTICITY site.
- R137 Improve the lab experience (stations, not rushed) and the city ride: "a little longer", "I don't want you just to like run into the door", "nice smooth transition".
- R138 A cool card: glassmorphism/frosted with light in it; tap it; turns into the way to get in. GUEST or JOIN choice: "We don't wanna force it, but we're gonna lose them."
- R139 ALL products on the site; something that closes a sale ("not one thing on this site that would make a sale").
- R140 Hooks everywhere, "something people don't see"; create as many hook skills as possible; deep dive incl. repos for hooks. "You told me you had 20 hooks ... I didn't see one."
- R141 A really good HERO card first (grand opening, 15%); "it went straight into the site".
- R142 Chest film via Higgsfield: box tilted up so the top shows; the NEW P engraved into the top; opens as now; ~10 s; at the end PEPTICITY engraves across the front; box more forward, "in your face and big".
- R143 Consistency/symmetry audit: no mixed small/big, narrow/wide; everything works.
- R144 Use many more of the picked effects.
- R145 Site "drastically bigger", more information; hit gym-goers, older people, people needing energy; little cards by goal (e.g. weight loss) that lead to the products for that interest, with a hook.
- R146 Wants to send Grace in ~15 minutes; playbook first, but keep going without waiting.

## 29 Oct — owner (font everywhere, bottles, lab, store)
- R147 Never show anything without his new font again.
- R148 Remake ALL bottles: new P logo + vertical PEPTICITY in his font (back: name + amount).
- R149 Show the new logo in the new font; show it on the dashboard with the spinning background; the spinning emblem also on the website.
- R150 The site needs real "cool shit", not three-quarters scrolling.
- R151 Lab: an experience, slow, with hooks that sell; better dropper section (it was too fast).
- R152 EVERY product, priced exactly as on her site; write-ups rewritten if wrong, hidden behind a button; a short note on each card.
- R153 Owner wants condition hooks (pain, headaches, ED) and "what it's for" notes. DECISION: notes state the compound's class only; no condition/benefit claims (regulator risk); interest cards stay as visitor-interest filters + capture. Told the owner.

## 29 Oct — site v2 build (relayed by the coordinator; owner said "don't stop and wait, just keep going")
- R147 Rebuild the main site as v2 in sites/main/v2/ (v1 kept): chest intro → big HERO CARD → city weave → member card + doors → lab → interests → store → hooks → effects; WHITE + BLACK; verified at 1440 and 390. STATUS: built, see docs/owner/checklists/2026-10-29-site-v2.md
- R148 STORE: every northernpeptides.st listing (36) at the exact live prices (Store API, pulled 29 Oct); each card: bottle, name, strength, price, ADD TO CART, a one-line NOTE (what it IS) and READ MORE (our own rewrite: identity, classification, research status, format; no claims, no dosing). One JSON Grace can edit (v2/data/products.json).
- R149 LAB = an experience that sells: five stations that hold; hooks inside the lab (vial card + add to cart, join + 15%, see every product); swap point for new footage (media/city2/).
- R150 Top 10 hooks from docs/research/HOOKS-DEEP-DIVE.md: sealed envelope, save my cart, catalogue finder, restock queue number, member progress card, welcome back, guest checkout/account after, all-in drawer price, almost-there line, lot passport.
- R151 "Tighten the whole site": remove big gaps, shorten the long scroll-ins, a way to buy or join every 1–1.5 screens ("sales force").
- R152 Interest entry cards: GYM AND PERFORMANCE, 55+ AND LONGEVITY, ENERGY, WEIGHT GOALS, RECOVERY, SKIN AND HAIR, SLEEP; class-level "researched in the context of" wording + capture.
- R153 Footer: PEPTICITY rises out of the bottom in the new font, matte surface with light glowing through the letters.
- R154 Keep "the scroll highlight with the little bottom thing" (TXT-04 + a small bottom progress indicator) on the main copy.
- R155 Use every APEX Brain effect pick. (No separate APEX Brain picks file exists; the picks on record are docs/owner/effect-picks-2026-10-28.md, all placed.)
- R156 Match the brand-font page "02 PEPTICITY IN 3D / STUDIO": every header in the rebuilt font, hero/section words LIVE 3D (type3d-engine makeWord + wallScene), one renderer, dark quiet premium feel.
- R157 Include the concierge bot (shared/bot/pep-bot.js) as soon as it exists.

## Added 29 Oct (sharing)
- R154 · 29 Oct · "Get me a link that I can actually give to her, where she doesn't need to sign into my Claude." Anything for Grace goes out as a PUBLIC no-login link (GitHub Pages: https://apex360marketing-ai.github.io/Pepticity/), never a private Artifact link. DONE for both dashboards.
- R155 · 29 Oct · Dashboards: "scroll past the bottom … the watermark coin … stops flat … that will be the footer … turns into the coin with the nice 3D". SAMPLE being built (sites/dashboard-sample).
- R156 · 29 Oct · Members get a daily motivational quote in their dashboard that changes once a day, plus a phone notification ("a reason to keep the app"). SAMPLE being built; real push needs the installed app + a push service.
- R157 · 29 Oct · Idea: built-in gym playlist ("pump up tunes … or is that too much"). Asked owner how (music licensing).
- R158 · 29 Oct · "free monthly playlists … every month included in our newsletter … even if you don't sign up with Spotify … use it on YouTube". PULSE becomes a monthly drop (GYM/FOCUS/RECOVERY) with Spotify + YouTube links and a newsletter sign-up. In the dashboard sample.
- R159 · 30 Oct · Grace: "likes the gray a lot … wants some pop … a little too mono". Make dashboard (Grace + client) mock-ups, one per neon accent: chartreuse/lemon-lime, 0066FF, 0FFFFF, FF004F, 6F00FF, 8D029B, C46210, FA8072 (8 given; owner said 7). Subtle, classy, hover accents; keep everything else the same. Skill accent-colorways created. IN PROGRESS (sites/colorways).
- R160 · 30 Oct · Later: carry the chosen colour through the website and add more hooks to the site. "Don't do the website yet." WAITING.
- R161 · 30 Oct · Correction to R159: not screenshots or separate copies. ONE scrollable dashboard where Grace AND her clients can each pick any of the 8 colours; the colour must live in the scroll (lights accentuate on and off smoothly as things move, never blinking). The colour Grace likes later goes into the website. IN PROGRESS (sites/dashboard-color).
- R162 · 30 Oct · Owner approved 8 dashboard additions: client Daily LAB NOTE (peptide of the day class-only + wellness tips), reorder reminders, delivery check-in, concierge in dashboard; two-way Grace announcements, chat per order, read receipts + reply alerts, weekly GRACE'S NOTE. IN PROGRESS (phase 2 of sites/dashboard-color).
- R163 · 30 Oct · "any imagery, any videos, anything to do with design that way, you use Higgsfield. You don't use your own." Locked in CLAUDE.md.
- R164 · 30 Oct · Grace email: Gracet@live.ca. Bottle: front must clearly SAY PEPTICITY in our font (bigger); back must carry all the information. On the site, bottles light up from the bottom with a nice shine.
- R165 · 30 Oct · Bottle approved: brand/vial-hf (front+back). One website for Grace: REVIEW (questions beside the site/dashboards/colours) + PICKS (20 business cards, 10 labels: 8 see-through + 2 black, all bottles made so far), all clickable, results emailed to owner. IN PROGRESS (sites/grace-review, hosted /grace/).
- R166 · 30 Oct · Grace FINAL selection site = SELECTION STUDIO (also the APEX client template): every option live and tryable: 10 effects, 15 buttons, ~12 glass cards, fonts, logo motion, backgrounds, entrances (windows sliding in from different angles), business cards, labels, bottles, review questions; crowns + loves; brand board; emails owner. Owner reviews flow after Stage 1. Playbook: docs/owner/SELECTION-STUDIO-PLAYBOOK.md. IN PROGRESS (sites/selection-studio -> /grace-studio/).
- R167 · 30 Oct · Research custom browser top bar, new-tab page and window animations for the owner (ADHD-friendly). IN PROGRESS (docs/owner/BROWSER-DESKTOP-CUSTOMISATION.md).
- R168 · 30 Oct · Owner uses BOTH Mac and Windows; browser = Zen; build his own animated APEX/PEPTICITY start page, SAMPLE FIRST. IN PROGRESS (sites/start-page).

# PEPTICITY COMPLIANCE AUDIT · 2026-10-30

**OVERALL: FAIL.** The website, the concierge bot and the client dashboard are built as a working online store. They sell 35 drugs plus bacteriostatic water, with a 15% discount, restock alerts, auto-ship, spend tiers, referral rewards and lot testing. Most of these drugs are unauthorized in Canada, several are prescription-only, and HGH is one of them. This breaks the owner's current-state rule from 28 Oct: build the brand and the founding list only, never sell a drug.

This is a risk scan, not legal advice. Skills loaded: peptide-regulatory, peptide-copy-and-guide, peptide-expert, plus `docs/research/lead-magnet-hooks.md` section 0. I ran 24 red-team questions through the bot. I looked at the bottle and label images directly.

**FILE KEY (absolute paths)**
- SITE = /home/user/pepticity/sites/main/v2/index.html. The same fixes go into /home/user/pepticity/sites/main/v2/publish/index.html.
- JS = /home/user/pepticity/sites/main/v2/v2.js
- CAT = /home/user/pepticity/sites/main/v2/data/products.json
- BOT = /home/user/pepticity/shared/bot/pep-bot.js. A copy sits inside DASH at about lines 6750–7400.
- DASH = /home/user/pepticity/sites/dashboard-color/index.html. The same code is in /home/user/pepticity/sites/dashboard-color/client/index.html.
- NOTES = /home/user/pepticity/sites/dashboard-color/modules/notes.js. A copy sits inside DASH at about lines 5545–5745.
- COMMS = /home/user/pepticity/sites/dashboard-color/modules/comms.js. A copy sits inside DASH at about lines 5747–6750.
- REV = /home/user/pepticity/sites/grace-review/index.src.html
- PICKS = /home/user/pepticity/sites/grace-review/picks.src.html (images in /home/user/pepticity/sites/grace-review/assets/)
- MAIL = /home/user/pepticity/sites/grace-review/email/thank-you.html
- ARS = /home/user/pepticity/sites/grace-arsenal/index.src.html
- RES = /home/user/pepticity/sites/grace-research/index.html and /home/user/pepticity/sites/grace-research/build.py
- VIAL = /home/user/pepticity/brand/vial-hf/back.png and /home/user/pepticity/brand/vial-hf/preview.png

**RULE KEY**
- R0: the owner's current state. Nothing is sold, and there is no clinician, consult, prescription, pharmacy, lot testing or delivery.
- R1: C.01.044. A prescription drug may show only its name, price and quantity.
- R2: no claims.
- R3: no dosing or regimen.
- R4: no invented proof.
- R5: no inducements.
- R6: no "research use only".
- R7: consent.
- R8: privacy.
- R9: age and province gate.
- R10: the bot.
- R11: "Health Canada authorized/approved" wording only where literally true.
- R12: footer counsel line.

---

## RULE SCORECARD
- R0 FAIL · R1 FAIL · R2 FAIL · R3 FAIL · R4 FAIL · R5 FAIL · R6 FAIL · R7 FAIL · R8 PASS (one fix) · R9 FAIL · R10 PASS (two fixes) · R11 FAIL · R12 FAIL

---

## A. WEBSITE (SITE, JS, CAT)

- **FAIL A1 · SITE 349–365, 86, 512–532, 557–567 · JS 581–728, 757–773 · R0, R1, C.08.002 · BLOCKER**
  - Now: "THE PEPTICITY STORE" · "Name, strength and price for every product. Members save 15% on their first order, applied in the cart." There are 36 listings with ADD TO CART, a cart drawer, CHECKOUT, "TO FREE SHIPPING", "Shipping", "MOBILE FOR SHIPPING UPDATES" and "WANT THIS CART EMAILED TO YOU?"
  - Fix: remove the store section, the CART button, the cart drawer, checkout, the exit cart card and the shipping lines. Stop publishing CAT. Replace the store section with:
    - Heading: "THE SHELF OPENS LATER"
    - Text: "PEPTICITY isn't selling anything yet. We're building the brand and our founding list first. Join, and Grace will write to you before anyone else hears."
    - Button: "JOIN THE FOUNDING LIST"

- **FAIL A2 · CAT 416–452, 754–789, 790–826, 827–935, 1082–1117, 1154–1225, 600–636 · R0, R1, R11, US 21 U.S.C. §333(e) · BLOCKER**
  - These listings are all `"hidden": false`. The bot holds back HGH, Melanotan II and bac water, but the site shows them.
    - HGH 100 IU, $200: "A prescription-only medicine for specific diagnosed conditions…" (line 436)
    - Oxytocin: "A prescription-only medicine in Canada and the US." (773)
    - Tirzepatide: "The active ingredient of prescription medicines authorised in Canada and the US under brand names." (1173, 1209)
    - Tesamorelin (1101) and PT-141 (810): "The active ingredient of a prescription medicine authorised in the US…"
    - Retatrutide: "Investigational"
    - Melanotan II: "[Counsel: recommend delisting.]" (620)
  - Fix: delete these entries from every public file now. Recommend delisting HGH, Retatrutide and Melanotan II permanently. "Active ingredient of… authorised" is a sameness claim (borrowed authority). Never use it.

- **FAIL A3 · CAT 1300–1320 · SITE 359–362 · JS 628–630 · R3 (adjacency: FDA's August 2026 letters cited bacteriostatic water sold beside peptides), R0 · BLOCKER**
  - Now: "BACTERIOSTATIC WATER 30 ML $30 … Sterile water with benzyl alcohol (ancillary)" in a "SUPPLIES" lane.
  - Fix: delete the entry and the SUPPLIES lane. Never list it.

- **FAIL A4 · CAT 3, 7, and `supplierCategories`/`supplierName` on every product (19, 56, 92…) · SITE 29 (HTML comment) · R2, taint risk · BLOCKER**
  - Now: `"source": "https://northernpeptides.st (WooCommerce Store API)"`, with categories such as "Healing & Repair", "Longevity & Anti-aging", "Performance" and "Cognitive & Neuro". The comment reads "every northernpeptides.st listing, exact prices". Anyone can download the file.
  - Fix: delete `meta.source`, `meta.note`, `supplierCategories` and `supplierName`, and the comment on SITE line 29.

- **FAIL A5 · JS 584–594, 633, 740–751, 806 · R1, R2, Schedule A.1 · BLOCKER**
  - Now: cards titled "GYM AND PERFORMANCE", "55+ AND LONGEVITY", "ENERGY", "RECOVERY", "SKIN AND HAIR" and "SLEEP", each with "Compounds researched in the context of …" and "OPEN THE SHELF + 15%". The modal lists product names with prices, plus "No product here is presented as treating, preventing or improving anything." and "SEND ME THE … SHELF · PLUS 15% OFF". The store filter chips use the same goals.
  - Fix: remove the product keys, the shelf modal and the filter chips. Delete the phrase "researched in the context of" everywhere. The cards become the visitor's own wishes, with no products:
    - "I WANT TO KEEP UP WITH MY TRAINING"
    - "I'M 55+ AND WANT TO STAY ACTIVE"
    - "I WANT TO KEEP UP WITH MY DAY"
    - "I WANT TO BOUNCE BACK AFTER TRAINING"
    - "I CARE ABOUT MY SKIN AND HAIR"
    - "I WANT TO SLEEP WELL"
    - Body on each card: "Tell us this matters to you. Grace writes when PEPTICITY has news on it."
    - Button: "KEEP ME POSTED"

- **FAIL A6 · JS 588, 594 · Schedule A.1 [VERIFY obesity], R1 · BLOCKER**
  - Now: `{ k: 'weight', t: 'WEIGHT GOALS', … keys: ['tirzepatide','retatrutide','aod9604','5amino1mq','klow'], counsel: true }`. Its gate checks the *offer* switch, which is on, so the shelf shows. The bot's own setting is `weightShelf:'off'`.
  - Fix: delete the WEIGHT GOALS card and chip outright.

- **FAIL A7 · SITE 18, 582, 585 · R5 · BLOCKER**
  - Now: `counselCleared: { offer: true }`. No counsel has cleared anything.
  - Fix: `counselCleared: { offer: false }`. Keep it false until counsel signs off in writing.

- **FAIL A8 · SITE 7, 110–113, 117, 165–167, 227, 276, 355, 381, 402, 417, 512, 522–524 · JS 344–352, 684, 704, 740, 749, 806 · R5, Competition Act · BLOCKER**
  - Now: "15% OFF YOUR FIRST ORDER" · "CLAIM MY 15% OFF" · "JOIN THE TEAM FOR 15% OFF THIS ORDER" · "APPLY 15%". There are no terms anywhere.
  - Fix:
    - Remove the offer.
    - Hero perks become "FIRST · WORD WHEN WE OPEN", "MONTHLY · LETTER FROM GRACE" and "FOUNDING · MEMBER CARD". The button becomes "JOIN THE FOUNDING LIST".
    - Meta description (line 7): "PEPTICITY is coming. Join the founding list for Grace's monthly letter and first word when we open."
    - If counsel ever clears an offer, put this under every instance: "[Offer terms: what it applies to, minimum, one per person, end date. Counsel to approve.]"

- **FAIL A9 · SITE 112, 186–188, 381, 452, 460–461 · JS 616, 752–756, 778 · lead-magnet section 0 (no waitlist or drop alerts for unauthorized peptides) · BLOCKER**
  - Now: "SMALL BATCHES · FIRST WORD ON RESTOCKS · The team hears before the shelf goes public." · "SOLD OUT · RESTOCK QUEUE … we'll email you the moment the next lot lands".
  - Fix: delete the restock hooks and queue. Use "FIRST WORD WHEN WE OPEN". Delete "SMALL BATCHES", which nothing supports.

- **FAIL A10 · SITE 169–171, 177–179, 272 · JS 660–670 · R1, R4 · BLOCKER**
  - Now: "ON THE SHELF" (a GHK-Cu card with ADD), "MOST ASKED FOR" (a BPC-157 card with ADD), and "THE VIAL ON THIS BENCH" (BPC-157).
  - Fix: delete all three product mini-cards. "MOST ASKED FOR" is invented social proof. Remove it.

- **FAIL A11 · SITE 296 · R0 · BLOCKER**
  - Now: "Clear names. Clear strengths. One plain price on every vial. The team hears first when something comes back…"
  - Fix: "PEPTICITY is a members' house in the making. No hype, nothing we can't stand behind, and Grace writes to you once a month. The shelf opens only when everything behind it is right."

- **FAIL A12 · SITE 377–385, 402, 406–409 · R5 · BLOCKER**
  - Now: "Browse every product / See every price" · "15% off your first order" · "[Members' pricing: counsel first]" · "WELCOME GIFT 15% off your first order…"
  - Fix:
    - Tier I: "GUEST: Explore the city · Read the story · Join any time"
    - Tier II: "FOUNDING LIST: Grace's monthly letter · First word when we open · Your founding card"
    - Tier III: "[Founding perks: set by Grace, no prices or discounts until counsel clears]"
    - Envelope: "WELCOME: Your founding card and Grace's letter every month. The same welcome for everyone who opens it."

- **FAIL A13 · SITE 336–345 · JS 945–949 · R0 (lot testing) · BLOCKER**
  - Now: "LOT PASSPORT · LOT NUMBER ON YOUR VIAL" · "CERTIFICATE [Certificate appears only when Grace confirms it is real]".
  - Fix: remove the section until a real testing partner exists.

- **FAIL A14 · SITE 181–183, 429–442 · JS 595–603, 904–942 · R0, R1, R9 · BLOCKER**
  - Now: "FIND YOUR STARTING POINT … Browse by compound class, size and price". It produces a product shortlist with "ADD ALL TO CART", has an "INCRETIN CLASS · GLP-1 / GIP family" option, and has no age or province gate.
  - Fix: remove the finder until products are cleared. If it comes back, step 1 is the gate in A16.

- **FAIL A15 · SITE 119, 236, 279, 409, 419, 460, 461, 493, 525, 563 · JS 359, 735, 771, 926 · R7, CASL · BLOCKER**
  - Now: most boxes cover several purposes, e.g. "Yes, PEPTICITY may email me the founding offer, the monthly PEPTICITY letter, restock alerts and occasional news." Two boxes don't name PEPTICITY at all: "Also send me new lots and Grace's letter." (563) and "Also text me about new lots…" (JS 771). No box links to a privacy promise or gives a mailing address. Ticking is required to get the offer or the card (JS 359), which bundles consent into another step.
  - Fix:
    - One unticked box per form, worded exactly: "Yes, PEPTICITY may email me its monthly letter from Grace, including founding-list news. I can unsubscribe at any time. PEPTICITY · [legal name] · [mailing address] · [contact email] · Read our [privacy promise]."
    - SMS box: "Yes, PEPTICITY may text me launch news at this number. Up to [2] texts a month. Message and data rates may apply. Reply STOP to stop, HELP for help. Consent is not a condition of any purchase. [Privacy promise]"
    - Issue the member card on screen without requiring the box.

- **FAIL A16 · SITE 499 · JS 764 · R9 · BLOCKER**
  - Now: "[Age and province check at checkout.]". There is no gate on entry, on the forms or on the finder.
  - Fix: show this before any sign-up: "PEPTICITY is for adults. Which province or territory are you in? [select] · [ ] I'm 18 or older (19 or older in BC, NB, NL, NS, NT, NU, YT)."

- **FAIL A17 · SITE 498–502 · R12 · BLOCKER**
  - Now: the footer ends with "Preview build. Every form on this page is a preview: nothing is sent. Stock states shown are samples."
  - Fix: the last footer line must read exactly "[Final legal copy to be approved by counsel.]"

- **FAIL A18 · SITE 263, 266, 274, 318–331 · Competition Act s.74.01 · FIX SOON**
  - Now:
    - `aria-label="Inside the PEPTICITY lab"` with a PEPTICITY plaque on the lab wall. This implies PEPTICITY owns a lab.
    - "the label carries the name and strength. Nothing more." The real back label also says "FOR RESEARCH USE ONLY".
    - "THE CONTENTS: A freeze-dried cake, sealed in." The vial art shows liquid.
  - Fix:
    - Label: "How peptides are generally made (an illustration)"
    - Remove the plaque.
    - Station 5: "A stopper goes in and an aluminium crimp seals it."
    - Drop "THE CONTENTS" from the exploded-vial section, or match the image to the words.

- **FAIL A19 · SITE 452, 475 · R0, R5 · FIX SOON**
  - Now: "we'll tell you first when something lands in your province" · "When referral rewards open, members who shared will hear first."
  - Fix: "Join it and Grace will write when PEPTICITY has news for your province." · "Know someone who'd like Grace's letter? Send them your link."

- **FIX SOON A20 · SITE 122 ·** "Your details never go to ad platforms. Unsubscribe in one click." Keep this only if both are operationally true, and add the [privacy promise] link.

- **NICE TO HAVE A21 · SITE 9, 45 · PIPEDA/Law 25 ·** Google Fonts and jsDelivr send visitor IP addresses to third parties. Self-host both.

## B. CONCIERGE BOT (BOT; the same lines apply to the copy inside DASH)

- **FAIL B1 · BOT 7–9, 42–111, 229, 251, 258, 939–1013 · R0, R1 · BLOCKER**
  - Now: "PEPTICITY is an online store selling the catalogue … at exact prices." The bot shows product cards with prices and ADD TO CART, and has a cart.
  - Fix: turn commerce off. Any product-name question gets: "PEPTICITY isn't listing products yet, so I can't share names or prices. Want first word when we open?" with chips JOIN THE FOUNDING LIST and TALK TO A PERSON. The identity lines that borrow authority go too: line 86 "Approved as a medicine in some countries" and lines 100–101 "registered as a medicine".

- **FAIL B2 · BOT 117–132, 252–255, 913 · R1, R2 · BLOCKER**
  - Tested: "I want to build muscle" returns the GYM AND PERFORMANCE shelf with CJC-1295, ipamorelin, tesamorelin and IGF-1 LR3, plus ADD TO CART and the 15%.
  - Fix (shelf reply): "Thanks for telling me. PEPTICITY isn't listing products yet. Grace's letter will have news when we open." No cards. Delete "Researched in the context of".

- **FAIL B3 · BOT 956–961 · R5, R3 · BLOCKER**
  - Now: "3 VIALS · SAVE [X%]" with an "ADD 3" button.
  - Fix: delete.

- **FAIL B4 · BOT 212, 227, 231–233, 784, 1044 · R5 · BLOCKER**
  - Now: "Join the PEPTICITY team and your first order is 15% off." The sexual-topic refusal ends "…or get you 15% off your first order."
  - Fix: remove every offer line. Line 212 becomes: "That's not a topic I can help with. I can tell you about PEPTICITY, Grace's letter or the founding list, or put you in touch with a person."

- **FAIL B5 · BOT 224, 1062, 1127 · lead-magnet section 0 · BLOCKER**
  - Now: "Join the restock list and you'll hear when the next lot lands."
  - Fix: "That isn't available. PEPTICITY isn't listing products yet."

- **FAIL B6 · BOT 230, 241–246, 257 · R0 · BLOCKER**
  - Now: "Lot certificates will appear on each product once they're available." · "Shipping details are being finalised…" · "Age is confirmed at checkout."
  - Fix: one shared answer: "PEPTICITY isn't selling or shipping anything yet. Want first word when we open?"

- **FAIL B7 · BOT 204–205, 703–733 · CA BOT Act (B&P §17940–43), Maine and Utah disclosure laws · BLOCKER (no geo-block)**
  - Now: "HI, WELCOME TO PEPTICITY. I'm your concierge. Looking for something in particular…". The proactive greeting doesn't say it's automated. The panel header says "CONCIERGE · HERE 24/7".
  - Fix (greeting): "Hi, I'm PEPTICITY's automated concierge, not a person. I can tell you about PEPTICITY and the founding list, or connect you with a person."

- **FAIL B8 · BOT 264–265 · R7 · BLOCKER**
  - Now: "Yes, PEPTICITY may email me news, offers and Grace's monthly letter." · "…text me news and offers…"
  - Fix: use the A15 wording.

- **FAIL B9 · BOT 208 · R10 · FIX SOON**
  - Now: "For a mental-health crisis in Canada, call or text 9-8-8."
  - Fix: "If this is an emergency, call 911 now. For a mental-health crisis in Canada or the US, call or text 9-8-8."

- **FAIL B10 · BOT 239, 240 · R6 (wink), R0 · FIX SOON**
  - Now: "Products in the PEPTICITY store are not approved as medicines…" · "I can tell you what a product is, its size and its price. I can't say how anyone uses it."
  - Fix: "PEPTICITY isn't selling any products yet, and I can't give legal advice. A person can help at [email]." · "PEPTICITY doesn't sell anything 'for research use'. Right now we don't sell anything at all: we're building the founding list."

- **FAIL B11 · BOT 1104 · R8, PIPEDA (health-inferred data) · FIX SOON**
  - Now: `tags: STATE.interests…` (for example "weight" or "55plus") is added to every capture, even unrelated ones.
  - Fix: drop the tags unless the visitor ticks a separate box: "Yes, PEPTICITY may remember the interests I picked to choose what Grace writes to me about." Never pass tags to analytics or ad tools.

- **PASS:**
  - Emergency answers come first. "I feel like hurting myself" and "I took too much and feel dizzy" both get the emergency line.
  - Minors are stopped: "I am 16", "im a teenager" and "my 15 year old son…" all tested.
  - Dosing questions get no dose.
  - Every refusal ends with a next-step chip.
  - The banned-claim checker (`libBad`) is empty.
  - The bot says it is automated when asked, and uses no clinician styling.

## C. DASHBOARD, CLIENT SIDE FIRST (DASH, NOTES, COMMS)

The dashboard copy is locked (CLAUDE.md, 30 Oct). The fixes in this section need the owner's explicit OK. Recommended method: hide panels behind a switch, with no change to the layout.

- **FAIL C1 · DASH 2961–2971 · R0 · BLOCKER**
  - Now: tabs "ORDERS + JOURNEY · AUTO-SHIP · REORDER + ALERTS · PRIVATE DROPS · MEMBERSHIP · REFER A FRIEND · LOT LIBRARY".
  - Fix: switch these panels off. Keep TODAY'S WORD, GRACE'S NOTE, PULSE, MESSAGES and TRUST + PRIVACY.

- **FAIL C2 · DASH 2977–2985, 3789–3793, 3808 · R0, R3 (adjacency), trademark · BLOCKER**
  - Now: an order containing "BPC-157 · 10 mg, GHK-Cu · 50 mg, Bacteriostatic water · 30 ml"; BUY AGAIN shows "Bacteriostatic water (Pfizer)" at $19; "OUT FOR DELIVERY"; "Plain box. No product names on the outside." BUY AGAIN prices also differ from the store (for example BPC-157 is $95 here and $80 in the store).
  - Fix: remove. If sample orders are needed, use "[Sample order: product names hidden until counsel clears]".

- **FAIL C3 · DASH 2990–3013 · R0, R3 (regimen cadence), R5, auto-renewal rules (ROSCA in the US) · BLOCKER**
  - Now: "NEVER RUN OUT. NEVER GET STUCK." · "DELIVER EVERY 4 WEEKS / 6 / 8 / 12".
  - Fix: remove.

- **FAIL C4 · DASH 3015–3041 · COMMS 196–199, 661–763 · R3, R0 · BLOCKER**
  - Now: "REMIND ME · 30, 45, 60 days" · "NEVER RUN OUT" · "TIME TO REORDER …?"
  - Fix: remove.

- **FAIL C5 · DASH 3031 · R7 · BLOCKER**
  - Now: "[Text consent wording, lawyer to review]"
  - Fix: the A15 SMS wording, once counsel approves it.

- **FAIL C6 · DASH 3044–3048, 4127–4149 · Competition Act (fake urgency) · BLOCKER**
  - Now: countdowns ticking HRS/MIN/SEC and "12 units held…". The sample drop windows are measured from page load (`T0=Date.now()`), so they reset on every visit. The page also says "Countdowns show the real members-only window".
  - Fix: remove. If drops come back, use only a stored real end date and real stock: "[Real window end date and units from inventory]".

- **FAIL C7 · DASH 2938, 3050–3062, 4152–4173 · R5, provincial pharmacy inducement bans · BLOCKER**
  - Now: spend tiers (RESERVE from $750, PRIVATE from $2,000) with "Free express shipping" and "Give 15%, get 15%".
  - Fix: show founding status only: "FOUNDING MEMBER · since [month year]".

- **FAIL C8 · DASH 3096–3100 · R5, Competition Act · BLOCKER**
  - Now: "15% OFF YOUR NEXT ORDER". The site says "first order", so the terms conflict.
  - Fix: remove.

- **FAIL C9 · DASH 3069, 3115–3138, 4178–4184 · R5 · BLOCKER**
  - Now: "GIVE 15%, GET 15%" · "BRING TWO. MOVE UP." · "15% credit on your next order" · "free express shipping on your next three orders" · "REFERRAL CODE JORDAN15".
  - Fix: "Share PEPTICITY with a friend. No rewards, no tracking: just your link."

- **FAIL C10 · DASH 2845–2847, 3141–3145, 4186–4196 · R0 · BLOCKER**
  - Now: "EVERY BOTTLE HAS A LOT NUMBER · YOUR BOTTLE. YOUR LOT. YOUR REPORT."
  - Fix: remove.

- **FAIL C11 · NOTES 33, 36–44, 47–117 (HGH at 90–91) · COMMS 766–841 · R0, R1, R3 · BLOCKER**
  - Now: PEPTIDE OF THE DAY covers 27 products, including HGH, tirzepatide, retatrutide, Melanotan II and PT-141. It includes "Arrives freeze-dried… Keep it cold (2 to 8 °C)…", "HOW EACH LOT IS TESTED … The report for your lot sits in your LOT LIBRARY." and "Its amount is given in IU (international units) rather than milligrams."
  - Fix: run the WELLNESS TIP notes only. Switch PEPTIDE OF THE DAY off until counsel clears product names.

- **FAIL C12 · NOTES 176–179 · R0 · BLOCKER (shown as a client banner)**
  - Now: "Everything about your orders now lives here: tracking, reminders, lot reports and a direct line to me on every order."
  - Fix: "YOUR FOUNDING DASHBOARD: today's word, my weekly note, the monthly playlists and a direct line to me. Grace"

- **FAIL C13 · COMMS 524, 528–554, 632–649 · R0 · BLOCKER**
  - Now: "HOW WAS YOUR ORDER? Delivered · optional" · "Ask anything about this order: delivery, packaging…"
  - Fix: remove along with the orders.

- **FAIL C14 · NOTES 172–174, 197 · R0 · FIX SOON**
  - Now: "if anything about an order isn't right…" · "Grace can answer questions about orders, delivery and products."
  - Fix: "Thank you for joining PEPTICITY's founding list. I read every message myself." · "Please keep health details out of messages. Grace can answer questions about PEPTICITY and your account."

- **FAIL C15 · DASH 3157–3159, 3168, 3186 · R0 · FIX SOON**
  - Now: "PLAIN PACKAGING" · "Name + shipping address · to deliver" · "Usually replies within a day".
  - Fix: remove the packaging card. · "Name + email · to send the letter you asked for" · "[Reply time: Grace to confirm]"

- **FAIL C16 · DASH 3222 · R7 · FIX SOON**
  - Now: "Yes, PEPTICITY may email me the monthly letter and playlists…"
  - Fix: the A15 wording, with sender details and the privacy link.

- **FIX SOON C17 · DASH 3103 ·** The letter switch starts as `checked` "Subscribed". It must reflect recorded consent and start OFF for new members.

- **FAIL C18 · DASH 3238, 3241 · R12 · BLOCKER (owner OK needed)**
  - Fix: add "[Final legal copy to be approved by counsel.]" as the last line of the foot-note on line 3238. Leave the coin footer untouched.

- **NICE TO HAVE C19 · DASH 4205–4210, 4933–4935 ·**
  - The SURPRISE & DELIGHT desk reuses message content ("Said so in messages"). Use only notes a client gave for that purpose (PIPEDA purpose limit).
  - Rename the PULSE playlists GYM / FOCUS / RECOVERY to "LIFT / DEEP WORK / WIND-DOWN", so they don't mirror the product shelves. Drop "alpha waves" and "432 Hz and solfeggio" from the descriptions.
  - Add `noindex` to this public page.

- **PASS:**
  - TODAY'S WORD (DASH 4710–4840): 120 lines, no claims.
  - Wellness tips (NOTES 120–157): habits only, no outcomes.
  - Sample data is tagged SAMPLE, including the check-in ratings.
  - "an automated assistant, not a person" (COMMS 860).

## D. GRACE'S REVIEW SITE, PICKS AND EMAIL

- **FAIL D1 · REV 626–641 · R0, R5 · FIX SOON**
  - Now: options steer Grace toward features that fail this audit: "AUTO-SHIP 'Set it and forget it'", "REORDER REMINDERS", "PRIVATE DROPS", "MEMBER TIERS", "REFER A FRIEND", "REWARDS PROGRAM 'Points for coming back'" and "FASTER CHECKOUT".
  - Fix: tag each with "[Needs a lawyer's OK first: not switched on until then]". Delete "REWARDS PROGRAM".

- **FAIL D2 · PICKS assets (labels 02/04/06/08/10, bottle-03/04, bottle-06) · R6 · BLOCKER for any label Grace chooses**
  - Now: "FOR RESEARCH USE ONLY" appears on the back-label options. The GLOW back label reads "3PC + T3 + GHK-CU". "T3" reads as a thyroid hormone, so that is a mislabel.
  - Fix: remove the line from every option. GLOW should read "BPC-157 + TB-500 + GHK-CU" if it stays, and counsel should review the name "GLOW" itself.

- **NICE TO HAVE D3 · REV 18–19, email field ·** Add: "Your answers and email go to Maverick at APEX 360 by email, sent through FormSubmit (a US service). We use them only to build your site."

- **NICE TO HAVE D4 · MAIL 97–111, PICKS 621 · R12, CASL identification ·** Add "APEX 360 · [mailing address] · [contact email]" to the email. Add the counsel line to both footers.

- **PASS:** internal APEX material. There is no GoHighLevel, DashClicks, pricing floor or commission anywhere Grace or visitors can see. The only APEX mention is Maverick's signature.

## E. BRAND BOOK (ARSENAL) AND RESEARCH SITE

- **FAIL E1 · ARS 645, 895–896, 906–907, 938, 951, 993, 1067–1081, 1116 · R5 · BLOCKER (anyone building from the book reuses this copy)**
  - Fix: same wording as A8, A9 and A12.

- **FAIL E2 · ARS 924, 953, 991, 1015, 1077 · R7 · BLOCKER**
  - Fix: the A15 wording.

- **FAIL E3 · ARS 886 · R2, R11 · FIX SOON**
  - Now: "A pharmaceutical-style glass vial."
  - Fix: "Clear glass, sealed under a rubber stopper."

- **FAIL E4 · ARS 1096–1100 · R0, CASL (address-harvesting ban), review rules · FIX SOON**
  - Now: "Helps a visitor find the right product and puts it straight into their cart." · "CART AND RESTOCK FOLLOW-UPS" · "…review requests" · "FINDS NEW PROSPECTS Looks for new prospects within the law…"
  - Fix:
    - 02: "POINTS PEOPLE TO THE FOUNDING LIST"
    - 04: delete
    - 05: "Welcome emails and Grace's monthly letter, only to people who ticked the box."
    - 06: delete

- **FAIL E5 · ARS 1129–1133 · R12 · FIX SOON**
  - Fix: add "[Final legal copy to be approved by counsel.]" as the last footer line.

- **FAIL E6 · RES (public GitHub Pages page, no `noindex`; line 392) · R0, counsel exposure · BLOCKER**
  - Now: the page publishes the clinician, pharmacy and prescription model (115, 53 and 22 mentions), the regulatory risk analysis, and "prices as on northernpeptides.st".
  - Fix: take research/ off the public site or password-protect it. At minimum add `<meta name="robots" content="noindex,nofollow">` and put this banner on every chapter: "Research notes, not live features. PEPTICITY has no clinician, pharmacy or prescription partner, and sells nothing today."

- **FAIL E7 · RES build.py line 11 · internal material leak · FIX SOON (BLOCKER before the next rebuild)**
  - Now: `EXCLUDE = re.compile(r"(REQUEST-LEDGER|effect-picks|prompt|BRAIN)", re.I)`. The next build would publish:
    - BROWSER-DESKTOP-CUSTOMISATION.md (the owner's personal notes)
    - SELECTION-STUDIO-PLAYBOOK.md ("the APEX template for every future client")
    - this audit, if it is saved in docs/owner
  - Fix: `re.compile(r"(REQUEST-LEDGER|effect-picks|prompt|BRAIN|AUDIT|BROWSER-DESKTOP|SELECTION-STUDIO)", re.I)`, or better, switch to an allow-list.

- **FAIL E8 · RES footer · R12 · FIX SOON**
  - Fix: add the counsel line as the last footer line.

## F. BOTTLE LABEL (VIAL)

- **FAIL F1 · VIAL back.png and the right-hand bottle in preview.png · R6, R0, Bill 96 (French), Food and Drug Regulations labelling · BLOCKER**
  - Now: "PEPTICITY / THYMOSIN ALPHA-1 / 10 MG / ONE VIAL / LOT 0000 / STORE COLD 2-8 C / KEEP DRY AND DARK / FOR RESEARCH USE ONLY"
  - Fix: a brand-sample back label: "PEPTICITY / SAMPLE LABEL / [PRODUCT NAME] / [QUANTITY] / LOT [ ] · EXP [ ] / [Legal name and address] / [Final label copy to be approved by counsel.]" Delete "FOR RESEARCH USE ONLY". Regenerating it needs a Higgsfield spend and the owner's OK.

- **FAIL F2 · VIAL front and back, store image · Competition Act · FIX SOON**
  - Now: the vials look filled with liquid, but the site says "freeze-dried cake".
  - Fix: show an empty or freeze-dried vial when regenerating, or change the copy (see A18).

## G. US LAYER

- **FAIL G1 · whole site · FDA (unapproved and misbranded drugs, the August 2026 research-use letters), HGH §333(e), FTC substantiation, TCPA, CAN-SPAM, state bot and health-data laws (CA BOT Act, Washington My Health My Data) · BLOCKER**
  - Now: there is no geo-block. The CAD store and sign-ups are reachable from the US.
  - Fix: block US visitors from any sign-up that implies a sale, and say: "PEPTICITY serves Canada only."

## H. CROSS-CUTTING

- **FAIL H1 · SITE 500, DASH 3174 · PIPEDA, Quebec Law 25 · BLOCKER**
  - Now: "[Privacy policy]" · "[Named privacy officer + contact]"
  - Fix: publish a real privacy promise and the privacy officer's contact before any email is collected live.

- **FAIL H2 · all visitor surfaces · Charter of the French language (Bill 96) · FIX SOON**
  - Now: English only, including the label and the consent text.
  - Fix: counsel to confirm what must be in French for Quebec.

---

## QUESTIONS FOR COUNSEL / WHAT GRACE'S LAWYER MUST SIGN OFF
1. **The catalogue.** May PEPTICITY name, picture or price any of the 35 products publicly at all (C.08.002, C.01.044, Schedule A.1, Health Canada's 2026 advisories, the June 2026 Canlab injunction)? Which must be delisted for good (HGH, Retatrutide, Melanotan II, bacteriostatic water)?
2. **northernpeptides.st.** Does Grace's research-peptide store taint PEPTICITY? They share an owner, the catalogue and the prices, and public files link the two. What must change or close, and by when?
3. **The bottle label.** Final wording. Required elements: manufacturer name and address, expiry, French. Can a vial naming a specific unauthorized drug appear in brand imagery before authorization?
4. **Inducements.** Is any discount, founding perk, tier, referral reward or auto-ship lawful for these products, and in which provinces (pharmacy inducement bans)? Written offer terms.
5. **Interest cards.** Can visitor-wish cards sit on the same site that may later list products (adjacency)? Is obesity on the current Schedule A.1 [VERIFY]?
6. **CASL.** Final consent wording, the sender-identification block, consent records, the unsubscribe process, and whether the founding card may depend on newsletter consent.
7. **PIPEDA and Law 25.** The privacy promise, the privacy officer, interest tags treated as sensitive data, cross-border tools (FormSubmit, Google Fonts, jsDelivr), and Quebec French.
8. **US.** Geo-block or serve? If PEPTICITY serves the US, it needs an FDA, FTC, TCPA, CAN-SPAM, CA BOT Act and Washington health-data review.
9. **Public research/ and arsenal/ pages.** Take them down or password-protect them? They document regulatory risk and a clinician model that doesn't exist.
10. **Competition Act.** Lab imagery, "small batches", "most asked for", vial image versus contents, and countdown rules for any future drops.
11. **The bot.** Final emergency, legal and research answers, the AI-disclosure wording, and whether it may say anything at all about products before names are cleared.
12. **Uncertain points [VERIFY].** HGH's status under Canada's Controlled Drugs and Substances Act. Whether tesamorelin is authorized in Canada. Whether "STORE COLD 2-8 C" on a vial is acceptable once the research-use line is removed.
13. **Footers.** Final legal copy, terms and privacy policy, so every footer can end with the approved text instead of "[Final legal copy to be approved by counsel.]"

---

**How it was checked:** I read every source line by line and ran the bot's logic in Node with 24 test questions. I looked at the label, bottle and store images directly. I edited no files. The scratch images I made are at /tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/labels.png and /tmp/claude-0/-home-user/eecc84f9-3433-5e66-a3b7-3250d2f0d2ac/scratchpad/bottle-06-bpc-tb-ghk-cu-glow-back.png.
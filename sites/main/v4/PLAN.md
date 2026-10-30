# PEPTICITY SITE V4 · PLAN + HOOK MAP (30 Oct 2026)

Owner asks: R173 (the 10 picks, lead gen, guided tour, educate, trust) and R174 (do not change the live site, keep the look, better flow, sell to all markets). R175: any new media from Higgsfield.

## Contract (apex-build-contract)
1. AUDIENCE: Canadian adults 19+ curious about peptides: gym/performance, 55+/longevity, women, men, energy, weight goals, recovery, skin/hair, sleep. New and experienced.
2. ONE JOB: walk every visitor through a guided tour that asks plain questions, teaches, earns trust and leaves an email AND a phone number tagged with their answers.
3. DELIVERABLE: sites/main/v4 (copy of v2, same look) → preview at /site-v4/ on gh-pages.
4. OUT OF SCOPE: /site/ (live v2), sites/main/v2, sites/main/v3, /site-preview/, /grace-studio/, dashboards, new films (none needed), shared/bot code changes.
5. DONE WHEN: all 10 picks live and tagged, hook map met (1 ask per 1–1.5 screens, email + phone), 4 audit rounds clean, 1440 + 390 zero console errors, no sideways scroll, live URL checked.

## Kept exactly (R174)
- Chest film loader, liquid glass recipe, WHITE/BLACK colours, smoke ground + 30° watermark + OBJ-08 emblem, 3D PEPTICITY STUDIO type, logo P, the bottle, city film, doors + member card scanner, lab film, SCR-16 vial, SCR-18 tiers, HOV-17 earth, TXT-13 rising footer.

## The guided tour (8 stops; the NAV-102 menu lists them)
| # | Stop | Gate | What it does | Pick |
|---|---|---|---|---|
| 01 | WELCOME (hero) | public | founding ticket, one field | BTN-101 Torn Stub |
| — | TXT-04 statement | public | what PEPTICITY is, in plain words | TXT-04 |
| 02 | WHAT BRINGS YOU HERE | public | 9 market panels (visitor's own words) → start the questions | LAY-102 Panel Accordion |
| 03 | FOUR QUESTIONS | public → 19+ | market, experience, what matters, updates → playback → 19+ check → your shortlist → email + phone | FRM-102 Quote Stepper + BGD-102 Plexus behind |
| 04 | THE THRESHOLD · 19+ | gate | province + age (v3 gate). Skipped if passed in stop 03 | (v3) |
| 05 | THE CITY | 19+ | film + see-through cards picked from the answers | SCR-07 / SCR-17 (kept) |
| 06 | THE DOORS | 19+ | member card + scanner (kept) | FRM-02 (kept) |
| 07 | THE LAB | 19+ | how peptides are generally made, 5 stations | (kept) |
| — | HOW WE CHOOSE | 19+ | 6 cards: source, paperwork, label, storage, price, your questions | SCR-102 Fan Deck |
| — | TXT-04 statement | 19+ | trust promise | TXT-04 |
| 08 | THE COLLECTION | 19+ | store opens on the visitor's market, their shortlist first | (kept store) |
| — | WHAT YOU GET | 19+ | bento: support, letter, alerts, privacy, CAD prices, shipping [placeholder], lot records [placeholder] | LAY-101 Bento Unfold |
| — | FOUNDING PERKS | 19+ | email → wipe the fog to see the perks | CRD-124 Fog Wipe |
| — | TEXT ALERTS | 19+ | phone opt-in with a sample text | CRD-118 Squircle Stack |
| — | MEMBERSHIP / NETWORK / SHARE / LETTER | 19+ | kept | (kept) |

## Hook map (data-hook on every ask)
| Screen (1440) | Section | Hook | Channel |
|---|---|---|---|
| 0 | WELCOME | H01 founding ticket (Torn Stub) | email |
| 0 | WELCOME (returning) | H52 welcome back | return |
| 1.5 | TXT-04 | — (education) | — |
| 2.5 | MARKETS | H42m "START MY TOUR HERE" per panel | tour entry |
| 4 | FOUR QUESTIONS | H60 answers → shortlist → email + phone (tagged with answers) | email + phone |
| 5.5 | THRESHOLD | — (19+ gate) | — |
| 6.5–11 | CITY | H41 ticket · H42 your pick · H43t text alerts · H42b second pick | email / product / phone / product |
| 12 | DOORS | H34 member card | email |
| 13–18 | LAB | H18c letter (station 1) · H44 product (station 3) · H44j join (station 5) | email / product / email |
| 19 | FAN DECK | H61 "ASK GRACE A QUESTION" (last card) | email |
| 21 | COLLECTION | filters, cart H54/H55, restock (flag) | cart |
| 23 | BENTO | H62 tile CTA | email |
| 24.5 | FOG WIPE + SENTENCE | H48 perks · H36 one line | email |
| 26 | TEXT ALERTS | H43 phone | phone |
| 27.5 | TIERS | H01c join | email |
| 29 | NETWORK | H45 email + phone | email + phone |
| 30.5 | SHARE | H46 link | referral |
| 31.5 | LETTER | H18 | email |
| phone | sticky bar | H01b ticket + TEXT ME | email / phone |
| cart only | exit | H48b cart emailed | email |

## Lead quality (every payload)
`{hook, page:'site-v4', email, phone, name, province, tour:{market, experience, priority, updates}, consent_email:{given,text,at}, consent_sms:{given,text,at}, created_at}`. Answers are preference tags for Grace's list only, never sent to analytics. Analytics = event names only.

## Compliance switches (index.html PC_CONFIG)
- `counselCleared.offer` (default false): 15% lines appear only when true; otherwise the founding perks show.
- `showHighRisk` false: HGH, Melanotan II, bacteriostatic water hidden.
- Catalogue fetched only after the 19+ pass. WEIGHT GOALS has no shelf (card + capture only).
- No claims, dosing, clinician/pharmacy words, "leads", invented proof. Lot testing / shipping speed = [placeholders].

# PEPTICITY SALES SITE · TWO COLOURWAYS

Owner brief 9 Nov 2026. Built from Grace's two favourites, the real files:
`sites/versions/9-gold` (GOLD CHROME) and `sites/versions/10-platinum` (PLATINUM CHROME), branch `claude/pepticity-v6-v8`.
Feel model: VESPER BENCH ESTATE WINERY (one shape language, two fonts, slow fixed-pace scenes).
The building / city descent into the store is REMOVED (owner: "too much... not selling").

- `platinum/` · PLATINUM CHROME colourway
- `gold/` · GOLD CHROME colourway (approved pale chrome gold only: #332814 · #68513d · #a4845d · #f0e6c7 · #fef9e8)
- `_core/` · shared cart, forms, finder logic, gate, exit hooks, base CSS, the PEPTICITY font, the approved Higgsfield vial stills

## Effects (design/effects.json codes), no code shared between the two
| Slot | PLATINUM | GOLD |
|---|---|---|
| Entrance | TRN-07 Letterbox Open | TXT-19 Shutter Split |
| Menu | NAV-04 Elevator Floors | NAV-125 Gold Key |
| Background | BGD-18 Darkroom Light Field | BGD-101 Satin Folds |
| Moving type | TXT-20 Chrome Sweep | TXT-103 Tide Fill |
| Signature scroll | SCR-16 Exploded Layers on the real vial: READ THE LABEL (front turns to back, one callout held at a time) | SCR-110 Season Window as THE SHELF WINDOW (one shelf held, the next wipes across at a fixed slow pace) |
| Second scroll moment | SCR-18 Card Stack: HOW IT ARRIVES (hold-and-step) | SCR-111 Come Forward: THE PAPERWORK (lab still opens out of an octagon) |
| Finder | FRM-102 Quote Stepper (one question at a time) | FRM-104 Sentence Check (fill the blanks) |
| Cards hover | HOV-103 Edge Light (one light across all card rims) | HOV-14 Chamfer Plate (polished line runs the cut edge) + HOV-19 Ticket Stub set cards |
| Buttons | BTN-105 Convex Lens (cut-corner plates) | BTN-133 Gold Key Button (key silhouette) |
| Member / cursor | CRD-119 Glass Slab founding card (writes your name live) | HOV-04 Torch Glow |

Headings: the PEPTICITY BLACK font (owner's brand font) with real layered depth: chrome face on a raised Z layer, extruded UV-black body, hairline light edge, pointer tilt on the hero word (4D). Body: Hanken Grotesk.

## Hooks: every section has a buy path AND a capture fallback
| Section | Buy path | Capture fallback |
|---|---|---|
| Hero | SHOP THE COLLECTION / SHELVES | UNLOCK 15% OFF (P) · FOUNDING TICKET email (G) |
| Founding band (P) | - | 15% first-order email |
| Collection / Shelves | ADD TO CART with size picker | COMING SOON: TELL ME WHEN IT LANDS · THE FULL LIST BY EMAIL (G) |
| Label / Paperwork | SHOP | LOT LOOKUP: email a lot's paperwork |
| Finder | ADD ALL THREE | EMAIL MY SHORTLIST |
| Set of three | ADD THE SET (quantity break) | EMAIL ME THIS SET |
| How it arrives (P) | START AN ORDER | - |
| Founding members (P) / Grace's letter (G) | - | email + SMS, separate unticked consents |
| Final | SHOP | SEND ME MY CODE |
| Everywhere | sticky cart bar, cart drawer, age + province gate, checkout preview | exit card: SAVE MY CART (cart) or 15% OFF (no cart), once per session · join-for-15% line in the cart · WELCOME BACK toast · tab-title cue |

Forms: one-field first, visible labels, inline validation on blur, honeypot, single send (button locks), success state with next step, events to dataLayer without field values. PREVIEW BUILD: `FORM_ENDPOINT` is empty, nothing leaves the browser.

## Placeholders to fill (never invented)
- All prices, subtotal, shipping, totals: `$[PRICE]` etc. (store prices are internal only)
- Set of three discount `[X]%` · free shipping threshold `$[X]`
- 15% first-order offer: counsel + Grace to confirm (`COUNSEL.offer` switch)
- Product names shown publicly: counsel to clear (`COUNSEL.names` switch; peptide-regulatory says hidden until cleared)
- SHIPS FROM CANADA · cold-pack · carrier and timing · lot paperwork process · returns policy
- legal name · mailing address · contact email · privacy and terms pages · SMS consent wording
- IGF-1 LR3 size (shown as COMING SOON)
- The approved vial back label reads FOR RESEARCH USE ONLY: counsel to review (image text counts as copy)

# PEPTICITY ledger audit (7 Nov 2026, branch claude/pepticity-v6-v8)

- Source: docs/owner/REQUEST-LEDGER.md: 207 rows covering R001-R195 (12 IDs were reused: R147-R153, R154-R157, R179) plus 3 owner orders of 4 Nov not in the ledger (L-R196..198) and 1 rule conflict (L-R199).
- Evidence: files in sites/, shared/, tools/, brand/, git log (96 commits). Rows that are pure process rules count as DELIVERED when a skill or CLAUDE.md rule exists.

## Totals (ledger rows)
- DELIVERED: 141
- PARTLY: 41
- NOT DONE: 14
- REVERTED: 4
- SUPERSEDED: 11
- SUPERSEDED = the owner later chose differently (not counted as failures, not in the JSON).
- Needing action (JSON): 44 de-duplicated entries (59 rows merged)

## Top 15 most-repeated asks (times asked across ledger rows)
1. logo (new P / new font on everything): 10x (R036, R099, R127, R147, R148, R149, R188, R190, R192, L-R196)
2. hooks: 9x (R045, R069, R094, R104, R116, R140, R150b, R151, R188)
3. new font on every header: 7x (R020, R128, R135, R147, R148, R156, R153b)
4. glass: 6x (R090, R116, R134, R185, R186, R188)
5. slower, smoother city / lab / tour / scroll: 6x (R060, R137, R151, R172, R187, R188)
6. every product in the store, exact prices: 6x (R095, R112, R130, R139, R148b, R152)
7. gold and platinum versions: 6x (R103, R111, R189, R193, R194, R188)
8. 8 accent colours, owner picks: 6x (R159, R160, R161, R181, R182, R185)
9. two-way dashboard Grace + clients: 6x (R113, R155, R156b, R159, R161, R162)
10. lab as a selling experience: 6x (R062, R102, R137, R149b, R151, R172)
11. chest entrance (bigger, new P engraved, longer): 5x (R067, R109, R110, R111, R142)
12. the vial / bottle design: 5x (R131, R132, R148, R164, R165)
13. approve first, pictures + clicks, nothing published unasked: 5x (R003, R183, R184, R192, R194)
14. Higgsfield only for media: 4x (R021, R026, R163, R175)
15. Arsenal spinning background / watermark: 4x (R072, R091, R133, R136)

## Flags
- REVERTED: commit 5d1c081 undid the 4 Nov owner orders from 657e023 (logo P = font P, B flat middle bar, 3D type full resolution; 53 files). The 4 Nov orders are not in the ledger (it stops at 2 Nov).
- CONTRADICTION: HEAD CLAUDE.md line 54 says LOGO P is the old p-mark, "Never the font's cut-out P". That contradicts the owner order in 657e023. The working tree has staged, uncommitted changes that re-apply 657e023 (CLAUDE.md line 54 now follows the 4 Nov order).
- Ledger hygiene: IDs R147-R157 and R179 are used twice; R116 is a pure repeat of R090 and R094.
- Owner conflict to resolve: R130 (store sells only 8) vs R139 and R152 (every product); v5 ships 36 products.

## Every PARTLY / NOT DONE / REVERTED item
- [PARTLY] R004 Save every picture I send in the references folder and look at it every time | rows: R004 | design/references/pepticity/ holds only 1 file (3d-metal-type-BLACK.png); the white-and-gold cities pictures are not saved
- [PARTLY] R012 Every effect is a reusable recolourable module with a catalogue code | rows: R012 | sites/main/v5/fx has 11 coded modules; doors, scanner, member card, weave have no code
- [PARTLY] R029 One all-in-one site for five audiences with a live audience switch | rows: R029 | no audience switch in sites/main/v5; only interest cards; ledger says UNDECIDED
- [PARTLY] R030 Senior-friendly: text-size control, visible phone number, Call me back | rows: R030 | text-size control present in v5 index (2 hits); no Call me back or phone line in v5
- [PARTLY] R038 Reusable gold-chrome and raindrop glass surfaces | rows: R038 | colour approved; only partly reusable via selection-studio modules
- [NOT DONE] R039 PEPTICITY Your Area as the template for the full site | rows: R039 | UNDECIDED in ledger, never resolved
- [PARTLY] R046 Nothing may feel AI-made, written in Grace's voice | rows: R046, R059 | Grace's voice and real details not in site copy (R059 still waiting)
- [PARTLY] R047 Lab reuses my existing Higgsfield films, re-toned | rows: R047 | new lab films made instead (media/frames-hd3); old films not re-toned
- [PARTLY] R048 Lot lookup, Grace's signed note at the end of the lab, optional sound | rows: R048 | sound present; lot lookup conflicts with R055; Grace's note absent in v5
- [NOT DONE] R050 Catalogue conveyor lit one at a time with big jewel vials | rows: R050 | UNDECIDED vs store direction; no conveyor in v5
- [PARTLY] R055 No physician, clinician or pharmacy words anywhere | rows: R055, R114 | shared/pep-brain.js still has 26 consult/clinician mentions; master prompt 9, PROJECT.md 1
- [NOT DONE] R058 Tell me where the site is hosted and which email/text platform Grace uses | rows: R058, R064 | only gh-pages hosting; no platform chosen; ledger WAITING
- [PARTLY] R060 Slower, more elegant, smoother city ride, lab and scroll (the page crosses in 0.25 s) | rows: R060, R137, R151, R172, R188 | calmer films and tour built (v3-v5); owner re-asked at R137, R151, R172, R188 and loader R187; scroll speed fix only on the sample
- [NOT DONE] R059 Real details from Grace: photo, story, email, phone, launch timing | rows: R059 | still placeholders; ledger WAITING
- [PARTLY] R068 Hero with grand-opening sale and sign-up | rows: R068, R105 | hero card built; the 15% offer is OFF until counsel clears (R178)
- [PARTLY] R069 Hooks everywhere: join the team, monthly health email, scroll-in hooks that fade | rows: R069, R094, R104, R140, R150b | hooks and tour built but every form says Preview only; no real email; owner said at R140 he saw none
- [NOT DONE] R073 TXT-09 Sheen Type on buttons plus 5 colour options | rows: R073 | 0 hits for TXT-09 in v5; 5 colour options never made
- [NOT DONE] R083 Mercury Morph and Flipbook Scrub / Pocket Sequence (maybe) | rows: R083, R084 | UNDECIDED conditional samples, never built
- [PARTLY] R090 Every card and button 100% see-through glass, no fill, only coloured edges | rows: R090, R116, R134, R185, R186, R188 | clear-glass-spec skill; fixed on site-one-sample and versions only (R186); asked 6 times
- [NOT DONE] R093 Background pattern turned 30 degrees as a watermark | rows: R093 | no 30 degree pattern in v5
- [NOT DONE] R097 Fully trained bot: vitamins, general health, protein, peptides | rows: R097 | 0 vitamin entries in shared/pep-brain.js; vitamins branch exists on origin but not merged here
- [PARTLY] R098 Five researched blogs and a JOURNAL page | rows: R098 | 5 drafts in docs/blogs; no JOURNAL page on v5; needs Grace and counsel
- [PARTLY] R099 Branding zip files from ChatGPT (silver colour, logo font) wired as tokens | rows: R099, R100 | owner BLACK image and font adopted; ChatGPT zips and GenSpark research (R100) never arrived
- [PARTLY] R101 City like the white-and-gold reference cities | rows: R101 | white city built; reference pictures not saved (R004)
- [PARTLY] R105 15% off first order for joining the Team, monthly letter, free shipping line | rows: R105 | built but offer OFF pending counsel (PC_CONFIG.counselCleared.offer false)
- [PARTLY] R108 ALL writing comes off the screen in real 3D | rows: R108 | headings and logo are 3D; body, labels and hooks are flat
- [PARTLY] R109 Bigger chest, bigger forward bottle, new P engraved on top, black chest, ~10 s | rows: R109, R110, R142 | chest films exist (white and black) but owner asked again at R110, R142 for the new P engraving
- [NOT DONE] R117 Send Grace the 9-issue store fix list | rows: R117 | captured in ledger, never sent
- [NOT DONE] R118 Grace confirms KLOW contents, HGH iu, IGF-1 size, status lines | rows: R118 | ledger WAITING on Grace
- [PARTLY] R119 Counsel review and footer line [Final legal copy to be approved by counsel] | rows: R119 | footer line present in v5; no counsel review recorded
- [PARTLY] R122 Accessibility: AA contrast, 17px body, 44px targets, text-size | rows: R122 | audit docs exist; text-size only partly present
- [PARTLY] R126 Privacy-safe tracking per hook | rows: R126 | spec in lead-engine skill only; forms are preview-only
- [PARTLY] R127 The new P logo in my BLACK font, used everywhere (site, dashboard, emblem) | rows: R127, R147, R148, R149, R190, R192 | approved p-mark in use; new-P ask repeated 10 times; dashboards keep old LOGO_P
- [PARTLY] R143 Symmetry and consistency audit: nothing mixed small/big | rows: R143 | audit docs and common-sense-build skill; owner keeps repeating it
- [PARTLY] R156b Daily motivational quote changing once a day plus phone notification | rows: R156b | quote in sample dashboard; real push needs installed app and push service
- [NOT DONE] R157b Gym playlist / free monthly playlists on Spotify and YouTube | rows: R157b, R158 | no playlist page found; ledger says asked owner how; R188 repeats with Health hub
- [PARTLY] R168 My own animated start page (Zen browser), sample first | rows: R168 | sites/start-page exists as sample, in progress
- [PARTLY] R184 Startup script reviewed item by item by clicking | rows: R184 | startup-review page built (tools/build-startup-review.py); owner review pending
- [PARTLY] R188 Big list of 10: smoother tour, scroll slowed, front video redone, 15 bot designs, 60-second quiz + Health hub, vitamins/protein views | rows: R188 | gold and platinum (10) and skills done; front video, 15 bot samples, quiz, Health hub, third view not found
- [PARTLY] R195 LABYRINTH: DAEDALUS skill builder and MINOTAUR auditor that build a whole business | rows: R195 | plan page and tools/build-labyrinth-page.py only; docs/owner/labyrinth empty; no skills built
- [REVERTED] L-R196 Logo P = the PEPTICITY font P with the cut-off back, matte gunmetal, one hairline of light (4 Nov) | rows: L-R196 | commit 657e023 made it, 5d1c081 reverted it pending a preview; changes now staged uncommitted in working tree
- [REVERTED] L-R197 Font B: middle bar ends flat (4 Nov) | rows: L-R197 | same: built in 657e023, reverted in 5d1c081; not in ledger
- [REVERTED] L-R198 3D type at full device resolution (4 Nov) | rows: L-R198 | same: built in 657e023, reverted in 5d1c081; not in ledger
- [REVERTED] L-R199 CLAUDE.md rule on logo P must follow my 4 Nov order, not contradict it | rows: L-R199 | HEAD CLAUDE.md line 54 says Never the font's cut-out P (contradicts 657e023); working tree line 54 has the 4 Nov rule but is uncommitted

## Other statuses
- SUPERSEDED rows: R028, R031, R032, R034, R035, R036, R037, R041, R042, R089, R130

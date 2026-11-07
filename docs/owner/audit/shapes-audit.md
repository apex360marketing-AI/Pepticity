# PEPTICITY shapes audit (read-only, 7 Nov 2026, 1440x900, Chromium, Google fonts blocked)

Method: static CSS scan (page + linked local CSS) and live computed-style scan of elements visible in the first screen after intro skip (Esc). Screenshots: /tmp/claude-0/s/<page>.png

## Headlines
- All 11 site pages use ONE P in the header/logo: the OLD approved P (symbol `#pmark`, index.html:87 in versions 1-8, :88 in 9, :89 in 10; site-one-sample/index.html:89; brand/logo/p-mark.svg; hero-p.js:19 `P_PATH`, hero-p.js:2 says 'never the font's cut-out P').
- The 3D PEPTICITY headline/wordmark is built from the PepticityBlack font (type3d engine), so its P is the font P with the cut-off back. Result: TWO different Ps on the same first screen of all 11 site pages (header P at top-left + 'JOIN THE PEPTICITY TEAM' 3D word). Seen in site-one-sample.png.
- Commit 657e023 (font P as logo, site-one-sample header + tour bar) was reverted by 5d1c081; nothing currently uses the new P as logo.
- Review pages (tools/review.template.html, docs/owner/{confirm,gold-platinum,labyrinth,startup-review}, sites/review-queue) use NO P mark at all (pm=0); review-queue has a text logo only.
- Symmetry FAIL on all 11 site pages: viewport centre x=720; logo centre x=127-130, headline and hero card centre x=480 (card spans 48-910, left-weighted; hero-card CSS says centred, v5.css:179-180 / v4.css:176-177, so something overrides it at runtime). Headline and card share an axis with each other (480) but not with the page or logo. Versions 1, 5, 9 also pick a card centred at x=1229-1336 (a right-hand card).
- Review pages: headline and card centred at x=720 (PASS); no logo present.

## Per page (runtime visible / static CSS declarations)
| page | pills runtime | plain rects runtime | chamfer clip-path runtime | pill decl static | rect decl static (radius<=16) | circle decl |
|---|---|---|---|---|---|---|
| sites/versions/1-blue | 0 | 11 | 12 | 7 | 35 | 16 |
| sites/versions/2-chartreuse | 0 | 12 | 13 | 11 | 40 | 15 |
| sites/versions/3-cyan | 0 | 14 | 11 | 9 | 34 | 22 |
| sites/versions/4-red | 0 | 12 | 11 | 9 | 43 | 19 |
| sites/versions/5-violet | 0 | 10 | 11 | 6 | 37 | 19 |
| sites/versions/6-orchid | 0 | 13 | 12 | 6 | 32 | 22 |
| sites/versions/7-copper | 0 | 11 | 14 | 7 | 44 | 18 |
| sites/versions/8-salmon | 0 | 12 | 12 | 9 | 31 | 16 |
| sites/versions/9-gold | 1 | 10 | 10 | 9 | 36 | 18 |
| sites/versions/10-platinum | 0 | 9 | 12 | 10 | 47 | 21 |
| sites/site-one-sample | 0 | 5 | 11 | 7 | 34 | 16 |
| docs/owner/confirm | 0 | 3 | 9 | 0 | 0 | 1 |
| docs/owner/gold-platinum | 0 | 2 | 3 | 0 | 0 | 1 |
| docs/owner/labyrinth | 0 | 2 | 9 | 0 | 0 | 1 |
| docs/owner/startup-review | 0 | 1 | 15 | 0 | 0 | 0 |
| sites/review-queue | 0 | 2 | 0 | 1 | 12 | 2 |

Totals runtime, first screen: pills 1, plain rectangles 129. Static declarations over all 17 files: pills 91, small-radius rects 425.

## Pills (shared fx modules, identical in every version)
- fx/NAV-102/module.css:83, fx/LAY-101/module.css:35-36, fx/FRM-102/module.css:61, fx/CRD-124/module.css:50,55, fx/LAY-102/module.css:64 (7 per page; 9-gold adds BTN-174:34 and CRD-122:40; 2-chartreuse/10-platinum/3-cyan 9-11 total). Only one pill is visible on first screen: 9-gold `.apx-b174__g`.
- sites/review-queue/index.html:81 `.toast` border-radius:999px (pill).

## Plain rectangles visible in the first screen
- Every version: `button.pc-btn--sm` (nav buttons), `ul.perks` (3-cell FOUNDING / MONTHLY / FIRST strip), the submit `button.apx-b###.morph` (radius 0-14px, no clip), email input (v5.css:208 / v4.css equivalent, border:0, filled box), consent checkbox (square). See site-one-sample.png: perks strip, email box, checkbox, THE TOUR/COLOUR/WHITE-BLACK buttons.
- fx/NAV-102/module.css:7,14,18,76,87; fx/FRM-102/module.css:31,35,51; fx/CRD-118/module.css:14,40,44; fx/CRD-124/module.css:14; fx/BTN-101/module.css:36; fx/TXT-04/module.css:46.
- Review pages: tools/review.template.html and its 3 copies: `.bar` sticky footer, `textarea#mnote` and `textarea#outText`, `.pic` image frames (square-cornered), `.run` box (confirm); dashed rectangle info box (confirm, see screenshot). Chamfers present: 3 clip-path rules each (template lines 12,22,34).
- sites/review-queue/index.html (all radii, not chamfered, none uses clip-path): :26 .prog 4px, :32 .tag 6px, :37 .shot 14px, :39 .live 10px, :43 .opt 12px, :47 .k 7px, :54 .cm comment textarea 12px, :59 .warn 10px, :62 .btn 12px, :72 .row 12px, :76 .row button 8px, :80 .zoom img 10px. These are rounded rectangles, banned. Circles at :48 .sw and :50 .ck (allowed). Pill :81.
- Allowed shapes found: 44-60 chamfer clip-paths per version, ~16-22 circle radii (dots, pins, swatches).

## Verdict
- Pills: 0-1 visible per page, ~7-11 declared. Rectangles: 5-14 visible per site page, 1-3 per review page, 12 declarations in review-queue.
- P marks: 1 old P (logo) + 1 font P (3D word) on one screen on 11/11 site pages. Review pages: 0.
- Centred on one axis: 0/11 site pages, 5/5 review pages (no logo to align).

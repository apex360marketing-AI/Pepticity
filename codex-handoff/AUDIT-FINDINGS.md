# AUDIT ROUND 5 FINDINGS (16 Nov 2026, on build rc5)

Machine-found, each reproduced twice by the auditor. Repro scripts: work/r5/audit/e2e/*.js (pass the page URL). F4 and F5 are FIXED in rc6 (work/r5/fix/apply_h5.py).

## Scope: Brand audit of rc5 (http://127.0.0.1:8965/new/) against the owner's rules (newest wins, 16 Nov) and the request ledger, measured in Chromium at 1440x900 and 390x844, compared with rc4 (:8964) and rc2 (served read-only on :8971 for the P-size baseline, then stopped). Scripts, logs and screenshots are

- **B1 [medium] Phone: GRACE'S LETTER slide-in and the JOIN bar cover the hero's ask and the vial**
  - Where: aside.pep-hooks-pop (H67), div.pep-hooks-bar (H68); foreignAsks()/anyAskInView() in index.html ~L16314-16326
  - Impact: On a phone the JOIN bar covers the vial at load while CLAIM MY CARD is on screen. After reading half the page and flicking back to the top, GRACE'S LETTER covers CLAIM MY CARD, SEE THE LINEUP and the vial. This breaks the module's own overlay rule. Cause: only form[data-hook] counts as an ask, and rc5 hid the hero form and moved the ask into two links.
  - Fix: In foreignAsks() also count the hero ask, e.g. .concat(qa(doc, '#join .pep-hx-keys')). No visual change.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_exitpop.js http://127.0.0.1:8965/new/`
- **B2 [medium] Founders section is not symmetrical**
  - Where: #founder-card .pep-fr-left / .pep-fr-right inside .pep-hooks-frame (card x 130..1310)
  - Impact: At 1440: gap from the content to the card is 51.8 px on the left and 66.9 px on the right. Column widths are 548.8 vs 460.0 px. Column centres sit -263.8 and +293.1 px from the card centre, so the mirror is 29.4 px off. Column heights are 1191 vs 608 px, so the right column stops 582 px early and leaves an empty block. In the left column the card picture is 548.8 px wide and the form 460 px. Rows 03 and 'NUMBERED CARDS' wrap to 2 lines while the others take 1, and '10%' is wider than its 68 px number column. The title is centred (0.0 px). The phone layout is symmetric (24/24, 310/310).
  - Fix: Give both columns the same max-width (e.g. 500px each, grid 1fr 1fr) and equal side padding, and balance the heights so both columns end level.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B3 [medium] Hero card and Founders card glass wipes out the background (blur 9px), so they read as dark slabs**
  - Where: #join.pep-hero-card::before and #founder-card .pep-hooks-glass (GLASS in apply_r5.py: fill up to rgba(207,230,255,.075) + backdrop-filter blur(9px) saturate(1.5))
  - Impact: Test: card shown vs card hidden, in a text-free gutter. The background pattern correlation is 0.03 for the hero and 0.10-0.32 for Founders, with a lift of about +6 L. The control cards, which have 0% fill and no blur, keep the pattern: picks 0.72, first-access 0.76, share 0.75, a lineup case 1.00. So this is not the clear see-through glass of the vial. Edge brightness (p99 L): hero 255 and Founders 233, against 223 for the vial's glass edge. The older cards are dimmer: share 202, door 201, picks 185, first-access 180, footer 160, lineup case 134. NOTE: this also clashes with the older 14 Nov lock '0% fill, no blur, all the same'.
  - Fix: Remove the backdrop-filter from GLASS for #join::before and #founder-card .pep-hooks-glass; keep the faint sheen.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B4 [medium] PEPTIDES drop-down sheet is 113 px off the menu bar's centre**
  - Where: #pep-header-drop vs [data-module=header]
  - Impact: The bar runs x 192..1248 (centre 0). The sheet runs x 263..1403 (centre +113), sticks out 155 px past the bar's right end and comes within 7 px of the guide bar. Product names in the sheet use system-ui, not the PEPTICITY lettering.
  - Fix: Centre the sheet on the bar (left:50%; translate:-50% 0 relative to the bar) or give it the bar's width.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_menu_drop.js http://127.0.0.1:8965/new/`
- **B5 [medium] Lineup ADD TO CART label wraps to 3 lines (desktop) and 2 lines (phone)**
  - Where: .pep-lineup-add (added to the K25 button list in apply_r5.py: 30px padding, .16em letter spacing)
  - Impact: On desktop the label stacks as ADD / TO / CART and fills its 47-56 px key. On phone it reads ADD TO / CART. This is a regression: rc4 shows one line.
  - Fix: .pep-lineup-add { white-space: nowrap; padding-inline: 14px; letter-spacing: .08em; } or take it out of the K25 list.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_addcart.js http://127.0.0.1:8965/new/ desktop ; NODE_PATH=/opt/node-tools/node_modules node repro_addcart.js http://127.0.0.1:8965/new/ phone`
- **B6 [low] Fixed menu bar covers the pinned THE LINEUP title and the top of the front case**
  - Where: header (fixed) over .pep-lineup-title / .pep-lineup-head at scrollY ~10612
  - Impact: Only 'THE' of THE LINEUP is visible, and the front case's '02' is cut off.
  - Fix: Hide the header while the lineup is pinned, or offset .pep-lineup-head by the header height.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_header_lineup.js http://127.0.0.1:8965/new/`
- **B7 [low] 'OTHER COMPOUNDS' is cut off by its tile (desktop)**
  - Where: #picks .pep-hooks-tile-word inside button.pep-hooks-tile (text 1129..1288, tile clipped at 1271)
  - Impact: The label reads OTHER COMPOUND: the last S is clipped (17 px).
  - Fix: Reduce letter spacing or font size in that tile, or allow a 2-line label.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B8 [low] Phone footer 'GRACE'S DASHBOARD' is cut off**
  - Where: a.pep-footer-link (390 px)
  - Impact: Reads 'DASHBOAF': 20 px clipped.
  - Fix: Use smaller letter spacing on .pep-footer-link at <=480px.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ phone`
- **B9 [low] Right-hand gutter for the guide pushes three sections off-centre**
  - Where: .pep-lineup-all-grid, .pep-doors-row, content inside .pep-footer-pane
  - Impact: Gaps left/right: whole lineup grid 57.6/105.6 px (desktop) and 16/52 (phone). Lab doors 57.6/84.0 and 16/50. Footer content in its pane 43.2/115.2 and 28/62.4. Other sections are centred within 0 px.
  - Fix: Mirror the gutter: same padding on the left as on the right.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B10 [low] Call-to-action keys are not hollow at rest**
  - Where: .pep-k25 and the K25 list ::after (inset 4px, backdrop-filter blur(6px) + rgba(207,230,255,.07) sheen); .pep-lineup-depth-key ::before solid
  - Impact: The key face is brighter than the ground: CLAIM MY CARD L 41.3 vs 25.3, ENGRAVE 38.2 vs 23.8, first-access and share 36.8 vs 20.0, doors 35.4 vs 19.2. The 3D/4D keys have a solid dark face (33.7 vs 12.6) and their light does not change on hover. Hover itself is fine: every k25 comes toward the viewer (scale 1.07, translateZ) and lights up.
  - Fix: Remove the blur and the rest sheen from the k25 ::after; keep both on :hover.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B11 [low] 8 of 11 form fields are drawn as boxes, not open fields on a light line**
  - Where: pep-hooks-lots-email, pep-hooks-share-email, pep-doors-name/org/email/phone, pep-doors-lot-email, pep-hooks-exit-email
  - Impact: Only the 3 Founders fields follow the newest forms rule (open field on a light line).
  - Fix: Reuse the Founders .pep-hooks-well open-line style on these inputs.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B12 [low] 6 kinds of card/key have only 2 cut corners**
  - Where: .pep-hooks-tile, .pep-story-steps, .pep-lineup-item-btn, .pep-hooks-way, .pep-footer-pane, .pep-footer-link
  - Impact: The newest rule says every card has all four corners cut. 49 (desktop) / 50 (phone) shapes checked; the big hooks and doors glass are 4-cut.
  - Fix: Switch those clip-paths to the 8-point octagon already used by the hooks glass.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B13 [low] ASK THE GUIDE crystal is lit blue at rest and has pointed ends (NOTE: clash with his older ask #52)**
  - Where: .pep-guide-launch (.pep-guide-gap::after clip polygon(50% 0, ...), guide-beacon.webp)
  - Impact: 31-35% (desktop) / 9% (phone) of its middle is lit at rest, and both ends are pointed. Newest rule: calm at rest, no points. Ledger #52 asked for the gap to be lit blue to draw attention, so this is his call.
  - Fix: Ask the owner. If he agrees: dim the gap light at rest, light it on hover, and give the crystal flat cut ends.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ desktop`
- **B14 [low] Phone only: hooks cards get blur(6px) and lose the background**
  - Where: .pep-hooks-glass at <=480px (picks, first-access, share, Founders)
  - Impact: Picks card correlation 0.07 and Founders -0.03 on phone, against 0.72 for picks on desktop, so the cards are not see-through on phones. The phone hero card measured 0.87 (not confirmed clear).
  - Fix: Remove the phone-only backdrop-filter on .pep-hooks-glass.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node repro_brand.js http://127.0.0.1:8965/new/ phone`
- **N1 [info] NOTES: older locked rules, owner decisions and words**
  - Where: header, lineup, story, doors, footer
  - Impact: (a) The menu bar is no longer the menu-58 picture (chrome glass frame, plain keys, no crystal), which clashes with the 14 Nov CLAUDE.md lock; C02 asks to see the menu options first. (b) Goal words: the drop-down headings RECOVERY/PERFORMANCE/LONGEVITY/SKIN are his own locked words, and the cases carry METABOLIC / GROWTH HORMONE / TISSUE RESEARCH labels. (c) Visitors see the HIDE BEFORE LAUNCH bands on 10 cases (he asked for them). (d) Placeholders are visible: '[FROM GRACE: ...]' in story, doors and footer, '[counsel to confirm: final legal copy]', 'PREVIEW ONLY: THIS DOOR IS NOT ON THE LIVE STORE.', and a public GRACE'S DASHBOARD link. (e) The story vial's alt text says 'violet light' but the rendered light is blue. (f) Drop-down headings are #fff with a blue glow. (g) Hero card L 282.4 vs vial R 237.1 (45 px off as a pair).
  - Fix: Owner and counsel decisions; fill the placeholders from Grace; fix the alt text to say blue.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/brand && NODE_PATH=/opt/node-tools/node_modules node probe.js http://127.0.0.1:8965/new/ desktop out-d.json`

Not checked: REPORT.md could not be written: the harness blocks subagents from writing report files. This structured answer is the report.; Engraving flow end to end (engrave.js lazy load) and the refer-a-friend dialog: not run.; rc4 comparison for B2 (rc4 has a different Founders layout) and for B14 (phone glass).; Reduced-motion behaviour of the keys and the P.; Option pages and plans (C01, C13, C14, C19, C20, D01-D03): not part of the store page.; Ledger items still NOT DONE in rc5 (measured): #4 product weight; #5 PEPTIDES glow 25%/85%; #6 dimmer bar (unproven); #7 gold light; #9 big P on the bar; #10 glow round PEPTICITY; #12 ice wordmark (preview only); #14 logo in the footer; #18-#20 spinning vial; #21 vial comes toward you (transform none->none); #24 P watermark/3D seat; #29 blue cursor; #33 Founders still 123 words; #34/C08/C09/C11/C12 full FOUNDERS RESERVE page and link (none); #35; #37 widget (0 manifest/service worker); #39; #49 phone field in only 3 of 9 email forms; #51 affiliate; #53 voice; #69 THE STANDARD heading static; C04 symmetry (B2); C06/C07 see-through glass (B3/B14). Regressed: #65 0% fill/no blur; #27 no points (guide crystal). Waiting on owner or counsel: #13, #22, #4
Numbers: Founders inner gaps L/R (desktop): 51.8 / 66.9 px; Founders column widths: 548.8 / 460.0 px; Founders column centres from card centre: -263.8 / +293.1 px (29.4 off); Founders column heights: 1191 / 608 px; Drop-down centre vs bar centre: +113 px (rc4 +31); Glass background-pattern correlation hero/Founders/picks control (desktop): 0.03 / 0.10-0.32 / 0.72; Edge p99 L hero/Founders/vial/share/picks/lineup case: 255 / 233 / 223 / 202 / 185 / 134; k25 face L vs ground (hero CLAIM): 41.3 vs 25.3; Whole lineup gaps L/R desktop / phone: 57.6/105.6 ; 16/52 px; Lab doors gaps L/R desktop / phone: 57.6/84.0 ; 16/50 px; Footer content in pane L/R desktop / phone: 43.2/115.2 ; 28/62.4 px; P size vs rc2 desktop/phone: 75.1% / 75.0%; P spin: 2.000 turns in 20 frames, rests 0.00000 rad off front; Fields boxed: 8 of 11; Visible elements colour-scanned desktop/phone: 680 / 691

## Scope: End-to-end visitor journeys on rc5 (http://127.0.0.1:8965/new/), phone (iPhone 13) and desktop 1440x900, each finding compared with rc4 (8964). Covered: all ten site-e2e-journeys steps plus the owner's named checks: full-page scroll (desktop, phone, phone with CPU 4x), sideways scroll at 6 widths, p

- **F1 [medium] About a 6 s freeze when the Founders card scrolls into view (engrave.js uploads 97 MB of pixels to the GPU)**
  - Where: #founder-card, assets/founders/engrave.js (loaded lazily by assets/founders/founders.js)
  - Impact: The page stops for one frame of 5.8 s on desktop, 6.1 s on iPhone 13 at 4x CPU, and 6.6 s on rc4 desktop when the card enters the screen. A trace puts the time in the GPU process: RasterDecoderImpl::DoWritePixelsINTERNAL, used_bytes 97,106,852. The long-animation-frame entry shows no script time. With engrave.js blocked, the longest frame is 717 ms. SwiftShader inflates the duration, but a 97 MB upload is still jank and memory pressure on a phone.
  - Fix: Size the engraver's working canvases to their on-screen box times devicePixelRatio (cap 2) instead of the 2688 px source, or reuse one buffer instead of re-uploading the whole bitmap with putImageData. Check that the WritePixels task drops below about 50 ms with probe_trace.js. The look does not change.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/e2e && node probe_freeze.js http://127.0.0.1:8965/new/ desktop ; node probe_freeze.js http://127.0.0.1:8965/new/ phone 4 ; BLOCK='engrave\.js' node probe_freeze2.js http://127.0.0.1:8965/new/ desktop ; node probe_trace.js http://127.0.0.1:8965/new/`
- **F2 [medium] At 390 wide the guide launcher sits on the right edge of buttons**
  - Where: fixed button.pep-guide-launch over .pep-hooks-tile (PEPTIDES, BLENDS, OTHER COMPOUNDS in FIND YOUR PICKS), .pep-lineup-add, .pep-lineup-bar, .pep-lineup-more, a.pep-lineup-skip
  - Impact: On a phone, a tap near the right end of those buttons hits the launcher and opens the guide instead. It is still covering after 1.5 s at rest, so it is not a transition.
  - Fix: The launcher already steps aside when a form is under it (modules/40-guide/guide.js around line 495). Apply the same test to buttons and links, at least [data-no-cover], .pep-hooks-tile and the lineup buy row.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/e2e && node overlap390.js http://127.0.0.1:8965/new/ ; node confirm_cover.js http://127.0.0.1:8965/new/`
- **F3 [low] On the first phone screen the JOIN bar (and the launcher) overlap the hero card**
  - Where: fixed .pep-hooks-bar (H68 FOUNDERS RESERVE / JOIN) and button.pep-guide-launch over div.pep-hero-card, iPhone 13 at y=0
  - Impact: The bar covers the bottom 36 px of the hero card's frame and the launcher covers its right frame. CLAIM MY CARD and SEE THE LINEUP stay clear. The bar overlap is new in rc5; the launcher overlap is also in rc4.
  - Fix: In 45-hooks update(), treat .pep-hero-card as protected (protectedInView), so the bar appears only after the hero card has scrolled away. The launcher part is covered by the F2 fix.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/e2e && node overlap390.js http://127.0.0.1:8965/new/ ; node probe_at.js http://127.0.0.1:8965/new/ 365,500 200,565`
- **F4 [low] Phone menu stays open after tapping the PEPTICITY logo**
  - Where: header .pep-header-brand with #pep-header-keys open (modules/05-header/header.js line 134)
  - Impact: The page scrolls to the top but the open menu stays over the hero (aria-expanded stays true). The visitor has to close it by hand.
  - Fix: Add .pep-header-brand to the selector list at header.js line 134 whose click runs went (closeAll).
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/e2e && node probe_phone_menu.js http://127.0.0.1:8965/new/`
- **F5 [low] Founders form (H63) sends the phone number without SMS consent**
  - Where: 45-hooks wireCard extra(), served index.html line 16048: if (tel.length >= 7) { o.phone = tel; if (sms && sms.checked) {...} }
  - Impact: Once an endpoint is set, a visitor who types a phone number but leaves the text-message box unticked still has the number sent; consent_sms is simply absent. H65 refuses a phone number without its SMS box. Today nothing is sent because the endpoint is empty.
  - Fix: Set o.phone only when sms.checked, or refuse the submit with a message when a phone number is typed without the box, as H65 does.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/e2e && ONLY=H63 node forms.js http://127.0.0.1:8965/new/ ok desktop`
- **F6 [info] Footer MY ACCOUNT and GRACE'S DASHBOARD links return 404 on the review servers; the dashboard link is public**
  - Where: footer a[href="../client/"] and a[href="../dashboard/"], served index.html lines 10138 and 10139
  - Impact: Both 404 on 8965 and 8964 because only new/ is served there. The pages exist in /home/user/pepticity/client and /dashboard, so the live site is probably fine. A public footer link labelled GRACE'S DASHBOARD is for the owner to decide on.
  - Fix: Verify both links on the live host. Decide whether the dashboard link belongs in the public footer.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/e2e && node journeys.js http://127.0.0.1:8965/new/ desktop`
- **F7 [info] The phone JOIN bar takes 1 to 2 s to step aside from the Founders email field**
  - Where: .pep-hooks-bar over #pep-hooks-card-email on iPhone 13
  - Impact: When the email field scrolls into view, a tap on its left side lands on the bar for about the first second. After 2 s the bar is hidden and the tap focuses the field.
  - Fix: Set pointer-events:none on .pep-hooks-bar as soon as data-on is removed, before its exit transition ends.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/e2e && node probe_bar.js http://127.0.0.1:8965/new/`

Not checked: REPORT.md: the harness blocks subagents from writing report files, so the report is this answer; Real-GPU frame timing: only SwiftShader is available, so the absolute freeze lengths are environment-scaled. F1's cause is proven by a trace and a block differential, not its exact size on a phone; Cause of the 2.4 s first-screen gaps on phone at 4x CPU (y=0 to 371): not traced; Crest P spin: my DOM-mutation method cannot see canvas-only changes, so it was not re-proved; r4 p_spin.test.js covers it; H67 exit slide-in and H68 bar forms not submitted with an endpoint (they use the same ask() path that H65 and H66 passed); H40 guide chat, the H64 finder result form (needs 3 taps first), and native navigator.share on a real phone were not driven; Endpoint failure modes run on desktop only; The H01 hero form and the H64 twin form are hidden on rc5, so they could not be tested; /client/ and /dashboard/ are not served by the review servers; rc4 was run only for the findings (overlap390, probe_freeze, probe_phone_menu, F5 by source), not for the whole founders, cart, journeys or buttons suites; Usage percentage: no meter is visible from inside this run
Numbers: desktop scroll longest rAF gap: 5133 ms at y=1766 (Founders); 307 gaps > 250 ms; 1681 gaps > 50 ms; iPhone 13 scroll longest rAF gap: 2650 ms at y=1696; 108 gaps > 250 ms; iPhone 13 CPU 4x longest rAF gap: 3300 ms at y=1696; 288 gaps > 250 ms; Founders card single-frame freeze: rc5 desktop 5816 ms, rc5 phone 4x 6133 ms, rc4 desktop 6633 ms, rc5 with engrave.js blocked 717 ms; GPU WritePixels 6237 ms, 97 MB; buttons and links: 240 in DOM; desktop 69 visible, 64 pressed; phone 61 visible, 53 pressed; 0 confirmed dead; overlap390: 61 stops, 329 control checks, 9 overlaps (rc4: 57 stops, 286 checks, 7 overlaps); Tab stops: desktop 84, phone 80, 0 without a visible ring; script claims: founders 56 safe; cart 40 safe; forms 13+9 safe plus F5

## Scope: Speed and SEO basics of rc5 (served :8965; folder is /home/user/work/r4/rc5/site/new, not r5). Lighthouse JSON analysis plus Playwright measurements under load with software WebGL, experiments on an in-memory patched copy, and a SEO head and heading audit. The model cannot see its own usage percenta

- **P1 [high] No compression: 1 MB HTML and 2.1 MB unminified three.js sent raw (host dependent)**
  - Where: index.html (1,017,185 B, gzip 246 K), vendor/three/three.core.js 1.44 MB + three.module.js 650 KB, no Cache-Control
  - Impact: Phone FCP 5.6 s is mostly the raw HTML at 1.6 Mbps. In my run gzip alone took FCP 2.7 -> 0.9 s and LCP 11.7 -> 7.0 s, wire 3.4 -> 2.6 MB.
  - Fix: Enable gzip/brotli and long Cache-Control on assets/ and vendor/ at the host (.htaccess or _headers; GitHub Pages cannot).
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/perf/exp && (python3 server.py & sleep 1; NODE_PATH=/opt/node-tools/node_modules node run_exp.js http://127.0.0.1:8975/plain/new/ --cpu 4 --slow4g; NODE_PATH=/opt/node-tools/node_modules node run_exp.js http://127.0.0.1:8975/gz/new/ --cpu 4 --slow4g; kill %1)`
- **P2 [high] LCP hero image discovered late, no fetchpriority or preload**
  - Where: img.pep-bottle-img (vial-front-clear.webp, hero card, index.html line 8972)
  - Impact: LH: request not discoverable early, load delay 232 ms, render delay 1.6-1.9 s. Preload plus fetchpriority cut MEAS phone LCP 7.0 -> 5.2 s.
  - Fix: Add <link rel=preload as=image href=assets/vial-front-clear.webp fetchpriority=high> in head and fetchpriority=high on the img.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/perf/exp && NODE_PATH=/opt/node-tools/node_modules node run_exp.js http://127.0.0.1:8975/fix1/new/ --cpu 4 --slow4g`
- **P3 [high] Main-thread blocking: all module init runs inline at parse and on load; TBT 12.4 s phone / 5.3 s desktop**
  - Where: 20 inline classic scripts at end of body; lineup.js measure/wire forced layout, standard.js 7 forced reflows, quilt mount, logo3d frames
  - Impact: Trace at 4x CPU: 8.2 s blocking; about 41% is software-GL waits, about 59% (lineup 0.74 s + 0.8 s microtasks, boot, hooks, governor, parse) is page work that also hurts real phones. Blocking quilt or three alone did not lower TBT.
  - Fix: Start each module when its section nears the viewport or on idle, batch layout reads, minify inline JS/CSS.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/perf/exp && NODE_PATH=/opt/node-tools/node_modules node trace.js http://127.0.0.1:8975/gz/new/ 4 ../lh/trace_gz4.json && python3 trace_modules.py ../lh/trace_gz4.json`
- **P4 [medium] About 1.4 MB of below-the-fold images fetched before first scroll**
  - Where: lineup/p-turn.webp 431 KB (3288x2190, not lazy), founders/title.webp 224 KB (not lazy), card-1600.jpg 241 KB (lazy but fetched), 4 lineup vials 4x93 KB, lineup word-N.webp without width/height
  - Impact: Competes with the hero for bandwidth: 44 requests, 4.3 MB before any scroll, only about 0.2 MB needed.
  - Fix: loading=lazy on those images, resize p-turn to about 2400 px, add width/height to word-N, fetch catalogue.json once (requested 5 times).
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/perf && NODE_PATH=/opt/node-tools/node_modules node imgs.js http://127.0.0.1:8965/new/ desktop`
- **P5 [medium] 3D logo engine gives up after a fixed 9 s and on a phone viewport never reports a first frame**
  - Where: modules/02-logo3d/logo3d.js watchdog (9000 ms) and first-frame state; header and hero P
  - Impact: At 4x CPU the engine is switched off at 9 s in every run; at 1x CPU on the Pixel 7 profile data-pep3d-state stayed empty for 93 s while desktop reaches on at about 7 s. Software GL may explain it; a slow real phone on a slow link could hit the same limit. Not confirmed on a real device.
  - Fix: Make the give-up progress-based, start the engine after load on idle, test on a real phone.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/perf && NODE_PATH=/opt/node-tools/node_modules node dbg3d.js http://127.0.0.1:8965/new/ mobile`
- **P6 [low] Layout shift in the hero card on font swap, and on Founders canvas resize**
  - Where: div.pep-hx-keys / ul.pep-hx-hooks / p.pep-hx-offer / section#crest at about 120-170 ms (0.032 desktop, 0.008 phone); canvas#fxCanvas 300x150 -> 296x140 when engrave.js loads on scroll (0.005-0.007)
  - Impact: CLS stays under 0.1, score 1.0; real-user CLS with scroll about 0.039 desktop.
  - Fix: Preload PepticityBlack.woff2 (3 KB, swap, declared under two family names); give #fxCanvas its final width and height attributes.
  - In the area being redesigned: True · Repro: `cd /home/user/work/r5/audit/perf && NODE_PATH=/opt/node-tools/node_modules node cls.js http://127.0.0.1:8965/new/ desktop`
- **S1 [medium] Search basics missing: meta description, canonical, Open Graph, Twitter, JSON-LD, robots.txt, sitemap.xml, favicon, main landmark, one URL only**
  - Where: head of index.html; no robots.txt or sitemap.xml (404); title is 'PEPTICITY'; all pages are #anchors; no <main>
  - Impact: SEO 54 now; 63 with meta description alone; 100 when noindex is removed too (LH weights). Nothing is indexable or shareable as a card.
  - Fix: Add the tags and files listed in REPORT.md section 5, give each of the 9 pages its own URL, wrap content in <main>, remove noindex at launch.
  - In the area being redesigned: False · Repro: `cd /home/user/work/r5/audit/perf && NODE_PATH=/opt/node-tools/node_modules node seo.js http://127.0.0.1:8965/new/`

Not checked: Real GPU or real phone timings (all GL numbers are SwiftShader); Own Lighthouse run (not installed, install forbidden); scenario scores are modelled, not measured; Block-font differential to prove the font swap causes the hero shift; Hosted headers on the final host; Why logo3d reports no first frame at 412 px 1x CPU (software GL versus bug); Image re-encode sizes and sharpness of smaller vial files; Runtime duplicate id pep-hooks-lots-title not re-verified
Numbers: Lighthouse perf phone/desktop: 26 / 35; Phone FCP/LCP/TBT/SI/CLS (LH): 5.6 s / 29.3 s / 12.4 s / 12.8 s / 0.008; Desktop FCP/LCP/TBT/SI/CLS (LH): 1.05 s / 5.9 s / 5.3 s / 6.0 s / 0.032; index.html raw/gzip/brotli: 1,017,185 / 246,455 / 189,421 B; Inline CSS / JS / markup: 466,759 / 406,363 / 144,063 B; three.js (unminified): core 1,443,056 + module 650,153 B (gzip 283 K + 129 K); Before-first-scroll requests/bytes (MEAS): 44 requests, 4.3 MB (JS 2.4 MB, images 1.6 MB); MEAS phone 4x CPU slow4g LCP plain/gz/gz+preload: 11.7 s / 7.0 s / 5.2 s; MEAS 3D first frame desktop: 6.6-7.8 s (software GL); Modelled phone score: about 50-55 cheap fixes, 65-70 with init slicing, 90 not credible; Modelled desktop score: about 60, then about 80; SEO score: 54 -> 63 (description) -> 100 (noindex removed)

## Never ran (weekly usage limit): accessibility audit, live-pages + dashboards audit, security red team (returned nothing). Tool belt summary of rc5: Lighthouse phone 26 / desktop 35, accessibility 99, best practices 100, SEO 54; axe: no main landmark, label mismatch on .pep-hero-bottle.
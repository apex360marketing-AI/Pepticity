# PEPTICITY: HANDOFF TO CODEX / CHATGPT (17 Nov 2026)

You are taking over the build of PEPTICITY, the online peptide store of the client (Grace), built by APEX 360. The owner of the build (APEX 360) gives the orders. Read this whole file, then `brand-rules/pepticity-brand-now.md`, then `AUDIT-FINDINGS.md`, before touching anything.

## LINKS
- Repository: https://github.com/apex360marketing-ai/pepticity (PUBLIC: never commit private notes, emails, phone numbers or keys)
- This handoff: branch `claude/pepticity-codex-handoff`, folder `codex-handoff/`
- Live review build the owner has seen (rc4): https://apex360marketing-ai.github.io/Pepticity/review/
- Store preview (older): https://apex360marketing-ai.github.io/Pepticity/new/
- Grace's store link: https://apex360marketing-ai.github.io/Pepticity/store/ (DO NOT change without the owner's explicit yes)
- Dashboards (live, gh-pages): .../Pepticity/graces-dashboard/ , /dashboard/ , /client/
- Domain: https://pepticity.com (Cloudflare, shows "Coming soon"); private preview: https://preview.pepticity.com (Cloudflare Access, owner + Grace only)
- Carved-glass demo (owner-only link, Claude artifact): https://claude.ai/artifact/67JNuBwfUrUKxGevbX3t33 ; the same page is in `options/carved-glass/` here.

## WHAT IS IN THIS FOLDER
- `built/rc6-new/` the newest build of the store (serve this folder over http; open index.html). rc6 = rc5 + two fixes (below). The owner has NOT seen rc5/rc6.
- `work/` the build system. The page is one ~1 MB index.html made by a patch chain over the live `/new/` page:
  1. `sh setup.sh` (once: rewrites the old absolute paths to this folder)
  2. `sh work/r3/build_chain.sh ./out work/r3tools/apply_r3.py work/r4/fix/apply_r4.py work/r4/fix/apply_r5.py work/r5/fix/apply_h5.py`
  - Base page: `work/live/new/` (= gh-pages `/new/`). Patches run in order; `work/r2sec/apply_sec.py` runs LAST and hashes every inline script into the CSP meta tag. Any edit to an inline script must go through the chain or the browser blocks it.
  - New changes: add `work/r5/fix/apply_<name>.py` (anchored string replacements with an assert on each anchor count, like apply_r5.py) and append it to the chain.
- `work/r4/fix/test/*.js`, `work/r4/sec/repro/*.js`, `work/r3tools/check_r3.js`, `work/r5/audit/e2e/*.js`: Playwright tests and repros (pass the page URL). `work/r5/fix/run-all.sh` runs them all.
- `options/carved-glass/` the approved DIRECTION for glass: trim-less clear glass, carved lettering that is cut in by a point of light as it scrolls up, then only the carving lights (tight near-white light, almost no hue). Owner has not yet picked 01/02/03.
- `options/pick-page-UNFINISHED/` an interrupted pick page (see STATUS). Treat as scrap code to mine, not a deliverable.
- `brand-rules/` the owner's rules as written down over the project. NEWEST RULING WINS (see THE LOOK below).
- `AUDIT-FINDINGS.md` everything the last audit found, with repro commands and fixes.

## STATUS (honest)
- DONE in rc6: (1) Founders form only sends a phone number when the text-message consent box is ticked (CASL); (2) phone menu closes when the logo is tapped. Test results are at the bottom of this file.
- rc5 (inside rc6) added, not yet approved by the owner: GRAND OPENING hero card, slim glass menu, button style "25" (hollow, pops out on hover, blue light runs round it), Founders section with a laser-engraved member card (sample name GRACE TAYLOR), two-step sign-up, REFER A FRIEND dialog (email, text, Facebook, Instagram, TikTok, copy link, personal ?ref=CODE link).
- The owner then REJECTED the chrome-trimmed / tiered-edge glass frames used in rc5 ("the trim is so ugly", "modern and fluid", "edging not tiered"). Every framed plate must go.
- The 10 menus + 10 buttons he asked for were not delivered: Higgsfield (the image service) failed every render on 16 Nov, and the Claude build agents hit a usage limit. This is your first job.
- Backend: none. `window.PEP_CONFIG` form endpoint is empty, so no sign-up is stored anywhere yet.

## YOUR JOBS, IN ORDER (show the owner a picture + a link at each look change and wait for his OK)
1. OPTIONS PAGE (his words: "10 options for each and this has to be the last one... all different, think 3D... 3D glass... outside the box... like a boss... not so dumb shaped... modern, clean and posh"). One page, two tabs, tap to pick:
   - 10 MENUS as real 3D glass objects (CSS 3D or three.js), words carved and lit: PEPTICITY, SHOP, PEPTIDES, RESEARCH, ABOUT, CART. Ideas that were planned: monolith slab, floating stacked shelves, prism, upright fins, arc of plaques, flowing glass ribbon, sliding drawers, tower of floors (PEPTI-CITY), plinth projecting a pane, rotating cube.
   - 10 BUTTONS as 3D glass objects carrying CLAIM MY CARD carved and lit: slab, ingot, prism, floating pane, keystone, lens, hex rod, folded sheet, bridge, double pane.
   - Use the glass + carving technique in `options/carved-glass/index.html`. No chrome frames, no stepped edges, no pills, no pointed ends.
   - The menu itself must be SMALL and "boss" when closed; pressing it opens something "new age... modern... blow people's minds" (planned openings: iris aperture into a full glass page, the key morphing into the panel, vials orbiting the P in 3D, glass shelf of vials, cards dealt in 3D, lobby directory board, page tilting back as the menu floats forward).
2. Build from his picks: menu (small launcher + chosen opening), buttons everywhere, hero card, and FOUNDERS (below).
3. FOUNDERS RESERVE (his rule): the landing page only shows a short teaser and a link; a FULL PAGE explains it with drop-downs (not walls of text), symmetrical, vial-clear glass. The card is issued at sign-up but is NOT ACTIVE and gives NO 10% until the member has (a) shared PEPTICITY on at least one social platform AND (b) referred 2 friends who sign up. Show that clearly (card light off / NOT ACTIVE, three lit steps: GET YOUR CARD, SHARE ON 1 SOCIAL, REFER 2 FRIENDS). Club name: PEPTICITY PLATINUM FOUNDERS RESERVE, 25 numbered cards, "NO. 08 of 25" (lowercase "of"). Collect name for the card, email, phone, two separate unticked consent boxes. Welcome email explains how to activate.
4. AGE GATE at the very start: ask country first, then 19+ (21+ for the United States); block the site until answered; match the brand.
5. BACKEND: store every sign-up with its source/UTM and consent text + time, count referrals, compute card status, feed Grace's dashboard. Recommended: Supabase (Postgres + row-level security) with inserts only through a server function that checks a Cloudflare Turnstile token and a honeypot, idempotent inserts, no personal data in browser storage. Then set the endpoint in PEP_CONFIG (and add its origin to the CSP connect-src in apply_sec.py).
6. Remaining audit fixes (`AUDIT-FINDINGS.md`): 6 s freeze when the Founders card scrolls in (engrave.js canvases far too large), guide launcher covers buttons on phones, JOIN bar over the hero on phones, then the accessibility audit, a security pass on the new code, speed (Lighthouse phone 26: defer the 3D background without changing its look) and SEO (title, description, canonical, OG, sitemap.xml, robots.txt, one h1, one main).
7. Guide chat bar: 10-15% taller; on click it doubles and opens to the left as see-through glass; answers only approved store info; captures name + email/phone with consent.
8. Dashboards: add a bit of the blue, chrome gold (small accent), platinum chrome and black chrome. Restyle ONE first, show before/after, then the rest. Never change their layout.
9. Loading screen (2-5 s, once per session, none with reduced motion, never blocks content).
10. Launch on Cloudflare Pages: deploy to project `pepticity-preview` first, `pepticity` only after the owner says go. Uploads only work from the owner's PC with wrangler 4 (already logged in): `npx wrangler@4 pages deploy <folder> --project-name pepticity-preview --branch main`. Add a `_headers` file (long immutable cache only for content-hashed files, X-Robots-Tag: noindex on the preview only), rel=canonical https://pepticity.com/. The edge already sends frame-ancestors 'none', X-Frame-Options DENY, nosniff, HSTS. Cloudflare Free plan: never collect card numbers on the page (send buyers to the payment provider's hosted page).

## THE LOOK (newest rulings, they override older files)
- Ground near-black; the moving quilt background and its effects stay exactly as they are.
- Glass like the product vial: bright, clear, see-through, soft 3D depth, liquid-glass feel. Trim-less: one clean edge, no frames, no tiered edges.
- Lettering: the PEPTICITY typeface (work/live/new/assets/fonts/PepticityBlack.woff2), CAPITALS, platinum/black chrome or carved-and-lit.
- ONE blue (#2a78ff, hot core #cfe6ff) used only as light. Chrome gold only as a small accent. No violet, purple, yellow, green or warm casts.
- Buttons hollow at rest, never lit; on hover they come toward the viewer and light up.
- Symmetrical and measured; almost no paragraphs, explanations go in drop-downs.
- Every offer is 10% (never 15%).

## HARD RULES
- No health, dosing, treatment or body-goal claims anywhere (peptides are regulated).
- CASL: separate, unticked consent boxes (email, text); store consent text + time with each lead.
- No personal data in localStorage/sessionStorage/cookies/URL.
- Repository is public: no secrets, no private notes, no client emails.
- Never force-push gh-pages; publish by fast-forward only, to a new folder for reviews.
- Images and video are made with Higgsfield (or rendered live in code), never clip-art; say the cost before spending.
- Show the owner pictures + a link before any new look; short point-form messages; multiple-choice questions with a recommendation.

## WHAT THE OWNER STILL HAS TO DECIDE / PROVIDE
- His picks: carved glass 01/02/03, then 1 menu + 1 button from the options page.
- A sender email at pepticity.com, Grace's real proof (lab reports, shipping facts), privacy + terms text or a lawyer's OK, lawyer's OK on "10% off for life" and the referral reward.
- Supabase + Turnstile accounts and keys (enter keys as secrets, never in the page or the repo).

## TEST RESULTS FOR rc6
(filled in below by the test run)
Run on 17 Nov 2026, Chromium (Playwright), 1440x900 + iPhone 13.
- Fix 1, phone sent without text consent: BROKEN on rc5 -> safe on rc6 (4/4 safe).
- Fix 2, phone menu stays open after logo tap: BROKEN on rc5 -> safe on rc6 (2/2 safe).
- founders.test.js: 34 PASS, 0 FAIL on a quiet re-run. One earlier run under heavy machine load failed "phone engraves the typed name"; that matches audit finding F1 (engrave.js freeze), still open.
- menu.test.js: 5/5 PASS, 0 page errors.
- Security repros: 8 claims 0 BROKEN; cover-link 3 claims 0 BROKEN; frame guard 8/8.
- Not run on rc6: accessibility audit, Lighthouse, live-pages audit (see AUDIT-FINDINGS.md).

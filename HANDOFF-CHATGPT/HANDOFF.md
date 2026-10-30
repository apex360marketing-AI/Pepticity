# PEPTICITY: HANDOFF TO CHATGPT (30 Oct 2026)

You are taking over from Claude for a day or two. Read this file first, then LOCKED-DECISIONS-PEPTICITY.md, APEX-OWNER-RULES.md and SKILLS-CORE-PEPTICITY.md. The full skill set is in SKILLS-PACK.md (all repo skills).

## 1. Who and what
- **The owner** runs APEX 360 (AI marketing agency). He is your boss here.
- **The client** is Grace. Her brand is **PEPTICITY**, a Canadian peptide store.
- **What we're building for her:**
  - a cinematic website that sells
  - two-way dashboards (Grace and her clients)
  - a concierge bot
  - brand assets (font, logo, bottle, cards, labels)
  - a Selection Studio where Grace makes her final picks
- **Grace never sees internal APEX material:** pricing, commissions, vendor and tool names.

## 2. Repos (ALL of them, do not miss any)
| Repo | Branch | What's in it |
|---|---|---|
| github.com/apex360marketing-AI/Pepticity | **claude/pepticity-v6-v8** | ALL source, docs, media, skills, this handoff (newest work) |
| github.com/apex360marketing-AI/Pepticity | **main** (default) | fast-forwarded to the same commit as the work branch |
| github.com/apex360marketing-AI/Pepticity | **gh-pages** | the LIVE public pages (what Grace opens) |
| github.com/apex360marketing-AI/apex_agents_bots | **claude/sharp-bohr-u6d7gb** | APEX-wide owner rules (CLAUDE.md, AGENTS.md) + 41 APEX skills in .claude/skills |

- Both repos are under the GitHub account **apex360marketing-AI**.
- WARNING: the Pepticity repo is PUBLIC. Anyone can read the internal docs. The audit recommends making it private and hosting the pages on Cloudflare Pages or Netlify. That decision is waiting on the owner.

## 3. Live links (public, no login; always send Grace these, never private links)
Base: https://apex360marketing-ai.github.io/Pepticity/

| Page | Link |
|---|---|
| Website (v2, live) | site/ |
| Grace's dashboard (one link, owner and client switch) | graces-dashboard/ |
| Owner dashboard | dashboard/ |
| Client dashboard | client/ |
| Colour dashboards (8 accent LED switch) | dashboard-color/ and dashboard-color/client/ |
| Previous versions | previous/ and previous-client/ |
| Concierge bot demo | concierge/ |
| Brand book | arsenal/ |
| Research reading room | research/ |
| Grace's review questionnaire + picks | grace/ and grace/picks.html |

## 4. How to publish a page
1. Check out the gh-pages branch.
2. Copy the built file from the work branch into the matching folder:

| Source (work branch) | Live folder |
|---|---|
| sites/dashboard | dashboard/ AND graces-dashboard/ |
| sites/dashboard-client | client/ |
| sites/dashboard-color | dashboard-color/ |
| sites/grace-review | grace/ |
| sites/grace-arsenal | arsenal/ |
| sites/grace-research | research/ |
| sites/bot-demo | concierge/ (change ../../shared/bot/ to ../shared/bot/) |
| shared/bot | shared/bot/ |
| sites/main/v2/publish | site/ (build with `sh make-publish.sh`) |

3. Commit as "APEX 360" <apex360marketing@gmail.com>.
4. Push. It's live in about 1 minute; check it in a browser.

## 5. State right now
- **Live and done:**
  - website v2
  - all dashboards: the look is FINAL, never change layout, fonts, cards, background or the coin footer
  - concierge, arsenal, research, Grace's review and picks
- **Audit fixes went live today:** safer saved data, CSP, switch tap areas, accessibility labels, and the bot saying it's automated. All 10 live pages were checked: zero errors.
- **Reports:** docs/owner/AUDIT-SECURITY-2026-10-30.md, docs/owner/AUDIT-QA-2026-10-30.md and docs/owner/AUDIT-COMPLIANCE-2026-10-30.md.
- **Site v3 (sites/main/v3/) is being built.** The plan is docs/owner/SITE-V3-PLAYBOOK.md. The order:
  1. loader (chest film)
  2. big public hero landing (no prices)
  3. 19+ Canada age gate
  4. CITY dive (25% shorter) with see-through sales cards
  5. doors
  6. BIO LAB with hologram hook panels rising from the dropper
  7. SECOND DOORS
  8. PRODUCT LINE store with the bot in selling mode
  - Email and phone hooks run throughout; the hook map is sites/main/v3/HOOK-MAP.md.
  - It may be partly finished: check v3 in a browser before you touch it. /site/ stays v2 until the owner says GO.
- **Lab and doors redo (owner, 30 Oct):** "less busy", and the hanging bead strand moves onto the back wall around the PEPTICITY logo, moving, as the ONLY accent colour.
  - Samples are DONE in media/lab3/ (sbs-*.jpg: before/after; the new stills are white-lab-end.png, black-lab-end.png, white-doors.png, black-doors.png). The accent is electric blue #0066FF.
  - **WAITING ON THE OWNER'S OK.** Then:
    - the new lab film, white and black (Higgsfield kling3_0 pro, 10 s, start+end frames, about 17.5 credits each)
    - the second-doors film from the new lab end into the product hall (stills in media/doors2/; the black hall still still has a hanging strand and needs the same fix)
  - The doors in v2 are a still image split by CSS, so the new door stills just replace sites/main/v2/media/white-doors.jpg and black-doors.jpg (after OK).
- **Inventory:** docs/inventory/INVENTORY-2026-10-30.xlsx (also CSV, MD and JSON).
  - 30 products, 37 sizes, $30–$275 CAD.
  - An AUDIT column flags claims, dosing and copy errors on every listing.
  - The next step is to go through it with the owner.
- **Selection Studio** (sites/selection-studio/):
  - shell built, 53 live modules, emails picks via FormSubmit
  - next: publish to /grace-studio/ for owner review (Stage 1); the brief is docs/owner/SELECTION-STUDIO-PLAYBOOK.md
- **Start page** for the owner (sites/start-page/, Zen browser, Mac and Windows): waiting on his OK.
- **Bottles:** the approved bottle is brand/vial-hf. Grace picks a design in the Studio, then every product bottle is remade.
- **Owner decisions waiting:**
  1. OK the lab and doors samples
  2. make the repo private and move hosting
  3. speed up the website (8.5 s main image on a slow phone; frame sheets use a lot of phone memory)
  4. the concierge greeting covers CLAIM MY 15% OFF and the cart CHECKOUT

## 6. Rules you MUST follow (the full list is in the two rule files)
- **Answers:** point form, short. Every question is multiple choice with your recommended option first. Always give a recommendation.
- **Show, don't describe:** send pictures plus links, and check things in a real browser before showing them.
- **Sample first:** show ONE sample before changing the font, logo, bottle or any published page. Change ONLY what was asked: no rebuilds, no "improvements".
- **Brand:**
  - Matte gunmetal / UV-black 3D "PEPTICITY STUDIO" font.
  - The approved P logo (brand/logo/p-mark.svg), never white.
  - The colour source is the owner's BLACK image: wall #323232, metal #080807 to #8E8D85.
  - ALL headings in CAPITALS; PEPTICITY always in capitals.
  - NEVER gold, amber, mustard, peach, pink or warm yellow.
  - No green, except the chartreuse accent #D4FF3A where it fits.
  - Classy and dark, with glow accents only. No pill buttons.
- **All imagery and video comes from Higgsfield**, never drawn in code. State the credit cost before any spend; films and batches need the owner's OK.
- **Compliance:**
  - no health claims, no dosing, no physician, clinician or pharmacy wording
  - never the word "leads" on visitor pages
  - CASL: unticked, single-purpose consent
  - no invented stats or testimonials
  - real-date countdowns only

## 7. Key files
- docs/owner/REQUEST-LEDGER.md: every request the owner ever made (R001–R172). Read the latest entries.
- brand/font/ (type3d-engine.js, build_font.py, glyphs.json, PepticityBlack.woff2): the 3D font.
- brand/ui/button.css: the approved button.
- shared/bot/pep-bot.js and pep-bot.css: the concierge (modes: store / guide / sell).
- shared/inventory.js and sites/main/v3/data/products.json: product data.
- media/: Higgsfield films and stills; jobs.tsv files hold the job ids. docs/owner/higgsfield-spend-log.md logs every spend.

## 8. First thing to do
- Ask the owner one question: "OK the lab and doors samples (media/lab3/sbs-*.jpg)?" with the options: A) OK, make the films. B) Change the colour. C) Change something else.
- Then follow the order in section 5.

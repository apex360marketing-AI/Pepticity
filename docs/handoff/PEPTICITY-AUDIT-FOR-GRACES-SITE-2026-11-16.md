# PEPTICITY · FULL AUDIT + HAND-OFF FOR "GRACE'S PEPTIDE SITE AND DASHBOARDS"

Prepared 16 Nov 2026 for Tyson, from the session "PEPTICITY · NEW LOGO ON SITE + DASHBOARDS".
Paste or attach this file in the session **Grace's peptide site and dashboards** (the only session that changes the site).
Repo: `apex360marketing-AI/Pepticity` (and `apex360marketing-AI/Apex_Agents_Bots` for shared skills).

---

## 0. WHAT TYSON WANTS NEXT (in his words)
- "Grace's peptide site and dashboards" is THE one place PEPTICITY gets built. Every other PEPTICITY / peptide session is archived.
- Only two projects now: **finish PEPTICITY** and **the Brain**.
- Store asks from 15 Nov, for the site session to do:
  1. **Different hero card.** "Make the card a different hero card as the Founders Reserve is right below in another section. I don't want two in a row, and the other one looks much nicer and has more to it." (The top GRAND OPENING / JOIN THE FOUNDER CIRCLE card duplicates the FOUNDER RESERVE section below.)
  2. **Buttons are not on brand.** "Change the buttons as they are not the brand at all." Use the brand's chrome / glass, not the current ones.
  3. **Logo** (see section 1): PEPTICITY word more platinum chrome, glimmering, flatter (face-on); brighter silver on the top of the P; suit the vial.

## 1. THE NEW LOGO (ready to drop in once Tyson approves)
- **Status:** rebuilt 15-16 Nov in the owner-approved APEX STUDIO **platinum chrome**. Waiting on Tyson's final OK (his Question 2).
- **Live preview:** `previews/logo-platinum.html` (runs on its own), and the choices page https://claude.ai/artifact/CaaLsiaP8SJyDLzmVptVKc
- **Files** (branch `claude/pepticity-blue-logo`):
  - `brand/logo-blue/pep-logo-blue.js`: the renderer, marks inlined. It uses `vendor/three/three.module.js` next to it.
  - `brand/logo-blue/pep-logo-blue.css` + `brand/logo-blue/fallback/{lockup,mark}.png`: the still picture shown when WebGL is off.
  - `brand/logo-blue/apply.py`: a small patch script that adds the lockup to a page. **Re-target it before use.** It was written for `/new/` (lockup at the top of the hero, compact copy under the floating bar), and the hero card is changing.
  - `brand/logo-blue/marks.json`: the exact P from PEPTICITY BLACK with the FLARE CUT beam, plus the PEPTICITY wordmark. Source: Apex_Agents_Bots `design/logo/pepticity-flarecut/build.py`.
- **Look:**
  - neutral platinum mirror (face `0xe6e9ed` r 0.06, edge `0xebedf0` r 0.08)
  - the APEX STUDIO studio room exactly, plus a top strip (bright P top) and one thin #2a78ff strip from below (the vial's light)
  - beam #2a78ff with core #cfe6ff
  - P rests at 12° and turns once every 9 s; the word is face-on and still, with a light sweep
- **Brand audit:** the earlier version passed `tools/brand-audit.js` (HELD). Re-run it after placing the logo.
- **Menu 58 conflict:** menu 58's picture already has PEPTICITY in it, so the 3D lockup must not cover the menu (CLAUDE.md lock). It went in the hero instead. Tyson to confirm placement.

## 2. NEW SKILLS EVERY PEPTICITY SESSION SHOULD USE (installed in both repos)
- **Our own (owner-approved values):**
  - `chrome-material`: the ONLY chrome recipe (APEX STUDIO). Read before any metal. Includes a pixel contrast test.
  - `matte-material`: from the PEPTICITY STUDIO lettering.
  - `uv-material`: sheen and edge only.
  - `hologram-3d-object`.
  - `threejs-real-3d` gained an "upgrades" section: bloom, HDRI, anisotropy/iridescence, light sweep, contact shadow.
- **Downloaded (MIT/Apache, licences kept):**
  - GSAP official (8 skills)
  - three.js (22 skills)
  - impeccable, frontend-design, webapp-testing, shader-art-coding, taste-skill, scroll-craft
- **Priority note:** `.claude/skills/EXTERNAL-SKILLS.md`. Brand lock and our skills always win.
- **GitHub design audit (57 repos ranked):** `docs/research/github-design-audit-2026-11-15.md`
- **Owner rule (in CLAUDE.md):** ALWAYS OPEN THE PREVIEW. Every option goes in the side panel, with screenshots (1440 + 390) and the link.

## 3. URGENT / RISK ITEMS FOUND IN OTHER SESSIONS
| # | Item | Where it came from | Action |
|---|---|---|---|
| 1 | **Northern Peptides audit + prototype pages are shared and show internal prices** | "Extraneous peptide sites archive" | Turn off sharing on those artifacts. Its preview: https://claude.ai/artifact/Gu2xSqZB8wMiYwnJPzontb |
| 2 | **Grace's public label and portfolio pages are still LIVE with the wrong designs** | "Grace branding materials and portfolio" | Tyson to decide: take down or replace (gh-pages `labels/`, `brand-portfolio/`) |
| 3 | **Grace assistant names (50) saved only locally**, never committed | "Grace — Assistant Names (50) + Brand Extras" | Likely lost unless that machine still has `GRACE_ASSISTANT_NAMES.md`. Re-create if needed. |
| 4 | Several sessions left owner rules in a **local-only** CLAUDE.md ("Rule One: no push") | site v3 / v4 / Final Changes sessions | Confirm the current CLAUDE.md on main has every rule Tyson wants. |
| 5 | Business plan shows thin BASE profit and a **-$61K worst case** (stage C) | "PEPTICITY · BUSINESS PLAN" | Needs Grace's real traffic/sales before any spend. Branch `claude/pepticity-business-plan`. |
| 6 | **Customer dashboard link leaks owner data** ("close the customer-link owner leak") | "GRACE · DASHBOARDS" audit, branch `claude/grace-dashboards` | Fix first. Security. |
| 7 | Open decisions never answered: Command Center (11, first = publish to Grace's public link), Concierge D1-D12 (https://claude.ai/artifact/RVs6CFZnAnhKwpgdDZ16QZ), Dashboards (5), Bot gallery mascot Q1-Q6 | the GRACE sessions | Re-ask Tyson in Grace's session, as previews |
| 8 | Cloudflare setup for PEPTICITY is **waiting on Tyson** (one Cloudflare token on the secure card) | "PEPTICITY - Cloudflare setup" (child of Grace's session) | **Kept open**, not archived. |

## 4. WORK WORTH PULLING INTO GRACE'S SITE (quality pieces from archived sessions)
| Piece | Branch / link | Why it matters |
|---|---|---|
| Selling machine: ranked conversion report + sales audit | `claude/pepticity-selling-machine` | Checklist of conversion features for the store |
| Bot gallery (15 designs) + model router skill | `claude/pepticity-bot-gallery` | Guide/concierge bot looks |
| Grace Command Center + one-click Setup Kit + blank resale template | `claude/grace-command-center` (gh-pages `command-center/`) | Owner dashboard; resellable |
| Grace Concierge (business-running agent) | `claude/grace-concierge` (gh-pages `concierge/`, `concierge-glass/`) | Agent that runs Grace's business |
| Grace dashboards audit (20 items) + review page | `claude/grace-dashboards` | Open dashboard fixes list |
| Glass skin v2 (colour pairs, pointer torch, lit rims, light sweep) | `claude/grace-glass` (gh-pages `dashboard-glass/`, `client-glass/`) | Matches "glass morphism" Tyson keeps asking for |
| Dashboards brand match + store `/new/` latest (cut corners, no pointed buttons) | `claude/dashboards-brand-match` | Most recent store/dashboard build |
| Smooth scroll (heavier, capped flicks, soft stops at hook cards) | `claude/pepticity-scroll` | Ready to roll out to the store |
| FX kit fixes (hidden sections reveal, phone ring drag) | `claude/awesome-carson-plthso` | Bug fixes |
| Workbench: site-hardening, static-site-security, release gate, workers (fx, cards, hooks, harden, guide) | `claude/pepticity-workbench` | How the store is patched and released safely |
| Full catalogue (27 products from Grace's live store), cart, 4-step checkout, journal | `claude/pepticity-sales-site` (artifact JeFnLthM3erap5q1RKzA1X) | Older store, but its checkout/journal pages may not be in `/new/` yet: **check** |
| Lighting + 3D logo skills (logo 21 era) | `claude/pepticity-light-3d-skills` | Superseded by `chrome-material`, keep for reference |
| Gold × platinum round (bottle, ring, menu choice sheets) | `claude/pepticity-gold-platinum*`, `claude/pepticity-r4-choices`, `claude/pepticity-gp-r3-fixes` | Past decisions. Tyson moved to ONE BLUE on 14 Nov. |
| Protein + creatine own brand, vitamins playbook, supplements audit | `claude/pepticity-protein-creatine`, `claude/pepticity-vitamins` | Future product lines (NHP rules researched) |
| Interactive business plan | `claude/pepticity-business-plan` | Numbers model, see risk #5 |
| PEPTICITY LAUNCHPAD + protect-the-work skill/hook | `claude/pepticity-launchpad` | Guard against overwriting approved work |
| Owner hub (inbox website) | `claude/owner-hub` | Optional |
| V6-V8 site versions, Grace's original orb PNG | `claude/pepticity-v6-v8` | The original orb asset is saved there |
| Evening desk artifact (locked) | https://claude.ai/artifact/GUFRzBMxXhXJBugeqRB7yn | From "review room" |
| 84 P logos review site (select/delete) | https://claude.ai/artifact/D8uVjqK5XLWzZeJRoG9FnM | From APEX LOGO FOUNDRY |
| Sessions review page (11 PEPTICITY + 3 Grace) | https://claude.ai/artifact/SLQAuVtrG2FagQ53oaKGNr | Older index |
| Northern Peptides 32-page site (private) | https://claude.ai/artifact/2B3ugv5jsgGvqWh1s3dT1k | Grace's other brand. Repo push never done. |

**Live public pages (gh-pages):** `new` (the store), `site`, `graces-dashboard`, `dashboard`, `client`, `dashboard-color`, `dashboard-glass`, `client-glass`, `previous`, `previous-client`, `concierge`, `concierge-glass`, `command-center`, `arsenal`, `research`, `grace`, `grace-desk`, `grace-pick`, `grace-studio`, `grace-studio-review`, `labels`, `brand-portfolio`, `print`, `store`, `site-one`, `site-one-sample`, `site-preview`, `site-v4`, `stage1`, `versions`, `original`, `shared`.
**Suggested clean-up:** retire the stale public ones (`site-v4`, `site-one*`, `site-preview`, `stage1`, `versions`, `original`, `store`, and `labels` / `brand-portfolio` per risk #2) once Tyson OKs.

## 5. SESSIONS ARCHIVED ON 16 NOV (PEPTICITY / peptide / Grace, except the kept ones)
**Kept open:**
- Grace's peptide site and dashboards (THE build)
- PEPTICITY · NEW LOGO ON SITE + DASHBOARDS (reference, per Tyson)
- the three Cloudflare setup sessions (children of Grace's session, one waiting on Tyson's token)

**Archived (34):** Extraneous peptide sites archive · APEX LOGO FOUNDRY · Grace branding materials and portfolio · PEPTICITY SITE + APP (GOLD × PLATINUM) · PEPTICITY SALES SITE (2 COLOURWAYS) · PEPTICITY: drop in the new ChatGPT logo · PEPTICITY WEBSITE (clean thread) · PEPTICITY LAUNCHPAD · PEPTICITY supplements audit · Grace review package · Grace Assistant Names · FINAL CHANGES FOR GRACE · SITE VERSIONS + WORKFLOW AUDIT · SELLING MACHINE · GRACE CONCIERGE · GRACE COMMAND CENTER + SETUP KIT · GRACE DASHBOARDS · Grace's dashboards and concierge bot · Pepticity sessions review · SMOOTH SCROLL fix · Grace questionnaire · BOT GALLERY · BUSINESS PLAN · PROTEIN + CREATINE · VITAMINS · Garec dashboards · 8 landing pages · site v4 · site v3 · PEPTICITY WEBSITE · Pepticity website design and branding · Northern Peprides website build · premium peptide education platform · peptide showcase parallax site.

**Could NOT be archived from here: Tyson, archive these 5 yourself in the Claude app** (they only accept your trusted device):
1. Pepticity website build (12 Nov)
2. Pepticity Logo (11 Nov)
3. Pepticity assets audit and Grace portfolio (2 Nov)
4. Grace peptides branding site (29 Oct)
5. Pepticity V6 Garnet implementation (25 Oct)

## 6. MORE ARTIFACTS FOUND WHILE ARCHIVING (for reference)
- **Grace / Command Center:**
  - PEPTICITY Command Center: https://claude.ai/artifact/KUA5q7KkH1u4GrPXdoUDhB and the newer https://claude.ai/artifact/2J8J93yPwNzWdLLjZzjAPY
  - Grace Command Center review: https://claude.ai/artifact/2LtWnmppEoj3jomoRrbrX8
  - Grace's Dashboards review: https://claude.ai/artifact/KrxhUR9hQ584vTK3j2Z82v
  - Grace Build Hub: https://claude.ai/artifact/DHoPsjuuaDw32MDi2WSvnC
- **Money:** Profit Audit https://claude.ai/artifact/JApWJDkqAhtke2EzVB2cP7 · Wellness Line Plan https://claude.ai/artifact/7QK8fY3rNURCRjCsNjESFB · Business Plan https://claude.ai/artifact/3zd2EKEn1ddQtR7YdmDyzE
- **Selling:** Selling Machine ranking https://claude.ai/artifact/92qFn6iQZgM2S9JjUgzw5n
- **Logo:**
  - Glass chrome · 4 versions https://claude.ai/artifact/Mry1aTe7XR4hgr9tYMjiN4
  - Chrome gold standing still https://claude.ai/artifact/HFagJtesqTfKPHNzMXVzzm
  - Every P 11-15 Nov https://claude.ai/artifact/VbpoQbKL6KC4y4RUfxdH3C
- **Brand picks:**
  - Final Build Playbook https://claude.ai/artifact/MaQyspJ7Jug7kyUJpZmoSz · Effect Picks https://claude.ai/artifact/AoDTEAPdLM6PVcVDAY9LkK
  - Buttons and Cards Pick https://claude.ai/artifact/CKVuPWsAfPnxFExxs1L2yZ: **use it for the "buttons not on brand" ask**
  - Pick Room https://claude.ai/artifact/8jzkcQRdiGH8ikzNqXG4Hg
- **Older:** Brand Portfolio v1 (wrong design, see risk #2) https://claude.ai/artifact/N56JwVUAkNAAHXSnnW6eGc · Northern Peptides 32-page site https://claude.ai/artifact/2B3ugv5jsgGvqWh1s3dT1k


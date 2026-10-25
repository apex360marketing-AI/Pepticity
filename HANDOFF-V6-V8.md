# Handoff: Pepticity V6–V8 (three dark options)

Read this fully before writing code. It carries everything from the session that started the work.

## What the owner asked for
- Three dark landing-site options for Grace's peptide brand Pepticity. Each must be **completely different**: palette, fonts, layout, navigation, hero, buttons, motion, and section transitions. A recolour does not count.
  - **A · V6 Garnet "The Specimen"**: obsidian, porcelain and garnet. `sites/v6-garnet/`. About 90% done.
  - **B · V7 Chrome "The Instrument"**: ink, bone and chrome. `sites/v7-chrome/`. Not started.
  - **C · V8 Pearl "The Pearl"**: graphite and pearl, with **tiny** chartreuse `#d4ff3a` sparks only (lot codes, live dots, verified chips, the progress line). `sites/v8-pearl/`. Not started.
- **Order (owner chose):** finish A, show the owner, wait for approval, then build B and C.
- **Mix in (owner chose):**
  - A Descent-style camera dive in the intro: the camera dives down to the product.
  - Frame by Frame exploded layers: the vial or product pulls apart into labelled layers (glass, liquid, label, seal) as you scroll.
  - Glass cards and buttons from the APEX library, used for plans, the lot result and the assessment. The library is in the `apex_agents_bots` repo, branch `claude/sharp-bohr-u6d7gb`, under `design/library/CRD-1xx` and `design/library/BTN-1xx`. Match the look; don't copy whole modules if they clash.
- **Not chosen, so don't add them:** a Mercury liquid-chrome morph, a molecule that follows the pointer between sections, easy-read mode beyond the existing text-size button, ad-link paths, the coverage map, sound.

## Owner rules (also in the owner's CLAUDE.md)
- **Process:**
  - Ask every question as multiple choice, with the recommended option first.
  - Make recommendations clickable, and build only what the owner picks.
  - Never offer a "less polished" option.
  - Verify in a real browser (screenshots) before showing anything.
  - Never send a localhost link. Share by publishing an Artifact.
- **Colour:** no gold, amber or champagne. No green, except chartreuse as a sparing spark. Not blue- or purple-led. Classy, with dark near-neutral grounds and glow accents.
- **3D:** real three.js 3D, never emoji or flat icons.
- **Placeholders:** no invented stats, reviews or prices. Use `[brackets]` for anything Grace hasn't decided.
- **Repos:** keep client work in this repo, never in `apex_agents_bots`.
- **Cost:** the owner is very cost-sensitive. Don't fan out many agents. Keep the session lean.

## Compliance (non-negotiable; see BRIEF.md and plan/index.html)
- **Never:** dosing, cycles, stacks, injection supplies or imagery; "heals / boosts / may help" claims; fake reviews; saying a compounded drug equals an approved one.
- **Always:**
  - "A licensed clinician decides if a plan is right for you."
  - "licensed partner pharmacy".
  - Prices as `$[xx]`.
  - Forms say "Preview only: nothing was sent."
  - A footer disclaimer ending `[Final legal copy to be approved by counsel.]`
- Run the `regulated-claims-check` skill on all copy before showing anything.

## Architecture (already built)
- **`shared/pep-core.js`**: all three sites use it.
  - **Content:** audiences, steps, compare rows, red flags, FAQ, plans, receipt, clinicians and sample lots.
  - **Assessment dialog:** branching questions, an email field, a book-a-call slot picker, and a "Preview only" success message.
  - **Interactive pieces:** the audience switcher (radiogroup, localStorage, `?for=`), the lot lookup, the scrubbable chromatogram canvas, the red-flag checker and the printing receipt.
  - **Page plumbing:** the text-size toggle, preview forms, the hash router (`#home #shop #science #faq`, `#intro` replays) and the intro controller (sessionStorage, Skip, Esc, reduced motion).
  - Each site only styles the markup and adds its own layout, 3D and motion.
  - The router hides `[data-view]:not(html)`. Don't put `data-view` on `<html>`; use `data-page`.
- **`build6.py`**: `python3 build6.py sites/<slug>`.
  - Inlines CSS and JS, including `<script type="module" src>`, and escapes non-ASCII.
  - Writes `dist/index.html` (artifact-ready) and `dist/preview.html`.
  - three.js comes from jsdelivr `three@0.160.0` through an import map. gsap, ScrollTrigger and Lenis come from `vendor/`.
- **`tools/shoot6.js`**: the Playwright test. It covers intro frames, home scroll shots, every view, sideways-scroll checks and the full assessment run.
  - It serves files from `http://127.0.0.1:8765` (start it with `python3 -m http.server 8765 --directory /`).
  - It routes jsdelivr to a local `node_modules/three`. Run `npm i three@0.160.0` somewhere and fix the `NM` path, or let it fetch from jsdelivr if the network allows.
  - Chromium: `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` with `--use-angle=swiftshader --enable-unsafe-swiftshader`.

## V6 Garnet status
- **Built:**
  - Fonts: Bodoni Moda, Hanken Grotesk and Spline Sans Mono.
  - A curtain menu.
  - A 3D glass vial (lathe glass, garnet liquid, chrome crimp cap, a canvas label that peels to reveal the lot label, a garnet halo).
  - An intro (hairline, vial rise, wordmark, curtain lift).
  - A garnet thread through the six steps.
  - The lot ledger, clinician arches, compare table, printing receipt, closer, Membership, Science (with the red-flag checker) and FAQ with a call-back form.
  - Corner-bracket buttons.
- **Tested** at 1440 and 390: 0 errors, no sideways scroll on any view, and the assessment ends on "Preview only: nothing was sent."
- **Fixes still to apply** (the last edit was interrupted):
  1. `site.css`: add `[tabindex="-1"]:focus{outline:none}`, because page titles show a focus box after switching pages.
  2. Dim the vial after the steps start: add `html.gl-dim #gl{opacity:.16}`, plus a ScrollTrigger from `.how` (top 55%) to the end of `.foot` that toggles `gl-dim` on `<html>`.
  3. **Phone:**
     - Give `.peel` a solid background (`rgba(12,10,11,.94)`).
     - Drive `S.peel` from the hero scroll on phones (`max-width: 900px`) instead of `.peel`.
     - Hide `.sticky-cta` while the hero is on screen (`y < innerHeight * .6` on home).
     - On phones, use `.btn-br{letter-spacing:.12em;padding:0 20px}`.
  4. Add the chosen mix-ins:
     - an intro camera dive down to the vial;
     - an exploded-layers scroll scene where the vial separates into labelled glass, liquid, label and seal;
     - glass-style plan cards, a lot result card and assessment panel (frosted, see-through, rim-lit).
  5. Run `regulated-claims-check`, the quality gate and an award-jury review. Then publish `dist/index.html` as an Artifact and show the owner desktop and phone screenshots.

## Uniqueness plan for B and C (fill every column differently)
| | B · Chrome "The Instrument" | C · Pearl "The Pearl" |
|---|---|---|
| Palette | ink `#0a0b0c`, bone `#e9e4da`, chrome greys | graphite `#17181b`, pearl `#f2efea`, iridescent pearl sheen, chartreuse sparks |
| Fonts | Archivo (expanded) + IBM Plex Mono | Newsreader (italic display) + Manrope |
| Navigation | fixed left numbered index rail 01–06 | floating bottom dock (rounded rectangle, not a pill) |
| Hero 3D | a rack of machined chrome vials; scroll explodes one into layers | an iridescent pearl peptide ring of 9 beads, assembling in the intro |
| Intro | a wireframe vial machined into chrome, with mono spec readouts | beads assemble one by one into a ring, then the wordmark |
| Steps | a sideways pinned track | stacked cards that slide over each other |
| Buttons | chamfered chrome plates | soft rectangles with an inner glow |
| Page transition | horizontal shutter | pearl blur crossfade |

The shared core already provides all the functions. Build each site's markup, CSS, `site.js` and `scene.js` the way V6 does.

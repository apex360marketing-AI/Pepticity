# Pepticity template build — shared brief (read fully before building)

You are building ONE full website template for "Pepticity", a peptide brand (owner: Grace). There are five templates in total and they must share NOTHING visually: palette, fonts, nav pattern, hero device, intro, scroll signature, buttons, card shapes and section transitions all differ. Your site's spec is in your prompt. Site 1 already exists at `/home/user/pepticity/src/` (dark ink + rose, Unbounded/Geist, cube-turn intro). Read it to learn the conventions, but do NOT reuse its look, layout, copy structure or effects.

## Files
- Work only in `/home/user/pepticity/sites/<slug>/src/`: `index.html`, `site.css`, `site.js` (plus `intro.js` and helper js if you like).
- Load libraries with `<script src="../vendor/gsap.min.js"></script>`, and the same pattern for `ScrollTrigger.min.js`, `SplitText.min.js` and `lenis.min.js`. The build resolves these to `/home/user/pepticity/vendor/`, and they are gsap 3.15.0 and lenis 1.3.27. Don't add other libraries; write canvas/WebGL yourself (raw WebGL is fine).
- Build with `python3 /home/user/pepticity/build.py /home/user/pepticity/sites/<slug>`. It inlines everything into `sites/<slug>/dist/index.html` (artifact-ready) and `dist/preview.html` (local test copy).
- Google Fonts `<link>` is allowed (the only external host). Every other asset must be inline or under `media/`.
- Media: images live at `sites/<slug>/media/<name>.jpg` and the intro film at `media/intro.mp4`. The files are NOT downloaded yet because the network blocks the host. Reference them by those paths anyway, and give EVERY image and video a designed fallback that looks intentional when it is missing: a CSS gradient or canvas art. Use `onerror="this.remove()"` on img, and the video must check for `canplay`. Your media file names are listed in your prompt.

## Full site = multiple views
Required views: Home (long cinematic scroll), Shop or Programs, Science/About, FAQ & Contact. Use hash-routed views in one file with bare tokens only, `#home #shop #science #faq`, using letters only. Never `#/path`. Open the view in `location.hash` on load. Switch views with a transition that matches your site's style. The nav must work from every view.

## Intro (7–9 s, plays once per session)
- Smooth and fluid, and it hands off into the site with a transition unique to your site.
- Include a Skip button, Esc to skip, and a sessionStorage flag in try/catch.
- `prefers-reduced-motion` skips straight to the site.
- The Higgsfield intro film (`media/intro.mp4`) is a background plate. The intro MUST still look finished without it, with canvas carrying the scene.
- Reveal `#intro` as a replay: the hash `#intro` replays it.
- Clichés to AVOID: a 0→100% counter, an endlessly rotating DNA helix, solid-colour wipes, a lagging ring cursor, magnetic buttons everywhere.

## Motion rules (from the house skills cinematic-scroll / gsap-scroll-choreography)
- Lenis on the GSAP ticker: `lenis.on('scroll', ScrollTrigger.update); gsap.ticker.add(t=>lenis.raf(t*1000)); gsap.ticker.lagSmoothing(0)`.
- `scrub: 1`, not `true`. Pins only at `(min-width: 901px)` via `gsap.matchMedia()`. Run `ScrollTrigger.refresh()` after `document.fonts.ready`.
- Animate transform/opacity/filter/clip-path only. Use one rAF loop. Pause canvases off screen.
- Never put `var()` inside an `animation` shorthand; use longhands.
- **The page is complete at rest.** Anything readable must be visible without JS animation finishing. Animate FROM a visible state, or use gsap.from with immediate content fallback.
- Respect `prefers-reduced-motion`.

## Sales machine (this is a sales site)
- Use ≥6 distinct hooks from your spec. Every 1–1.5 screens: objection → evidence → CTA. Sticky CTA on mobile.
- Include a lead-capture form. Forms `preventDefault` and show "Preview only: nothing was sent." Never pretend to send.
- Prices and offers are bracketed placeholders, e.g. `$[xx]` or `[offer: confirm with Grace]`.
- Phone numbers show as selectable text `[phone number]`.

## Compliance (non-negotiable; FDA/FTC/Health Canada 2026)
- NO dosing, protocols, cycles, stacks, reconstitution, calculators, syringes, injection imagery, or bacteriostatic water.
- NO disease or outcome claims ("heals", "reverses aging", "boosts", "burns fat", "supports X", "may help", "studied for"). Describe the service, the process, the testing, the price and the people. Customer goals can be phrased as the CUSTOMER's intent ("I want to stay active"), never as a product promise.
- NO fake testimonials, reviews, star ratings, before/after images, doctor names or invented stats. Use `[placeholder]` labelled SAMPLE where needed.
- Clinician lane copy: "A licensed clinician decides if a plan is right for you." Pharmacy lane: "licensed partner pharmacy". Never claim a compounded drug equals an approved drug.
- Cosmetic skincare copy: cosmetic claims only (appearance, feel, texture, hydration look), and no drug claims.
- Footer disclaimer, with `[Final legal copy to be approved by counsel.]`.

## Brand rules from the owner
- Never gold, amber, mustard or champagne. No green, except chartreuse #d4ff3a as a spark. Not blue- or purple-led. Classy and grown-up.
- Real-feeling imagery and 3D, no emoji or flat clip-art icons.
- Avoid AI-template looks: warm cream + terracotta serif, everything centred, `rounded-lg` cards everywhere.

## Accessibility
- Body ≥18px (Prime: ≥20px), contrast AA minimum, tap targets ≥44px, visible focus, semantic HTML, alt text, keyboard-operable quiz/forms/menus.

## Verify before reporting (required)
Playwright is installed at `/tmp/claude-0/-home-user/25e96b79-2765-52fa-8447-4959c819aa85/scratchpad/deps/node_modules/playwright-core`. Launch with `executablePath: '/opt/pw-browsers/chromium'`. See `/tmp/claude-0/-home-user/25e96b79-2765-52fa-8447-4959c819aa85/scratchpad/deps/shoot.mjs` for a working example. Put your script in that deps folder so the import resolves.
1. Load `dist/preview.html` at 1440×900 and 390×844.
2. Confirm zero page errors.
3. Confirm `document.documentElement.scrollWidth === innerWidth` on every view.
4. Screenshot intro frames (at ~1.5 s, ~4 s, ~6.5 s, ~8 s) and each view. LOOK at them and fix what's ugly or broken. Fix and re-check once.
5. Save screenshots to `sites/<slug>/shots/`.

## Report back (≤400 words)
- What you built: views, intro beats, effects, and the hooks list.
- File paths.
- Verification results, with numbers.
- Anything not done or known-weak.
Do not publish anything, and do not touch other sites' folders.

---
## CHANGE OF DIRECTION (overrides anything above that conflicts) — read this
The owner does NOT want separate audience sites. **Every template is ONE all-in-one Pepticity site serving ALL audiences**. Each template is a different design version of the same business, with different looks, hooks, effects and intro.
- Audiences that every version must serve: (1) Healthy aging 55+, (2) Low energy / not feeling like yourself, (3) Women 40+, (4) Men 35+, (5) Training & recovery / gym.
- Every version needs an **audience switcher** ("I'm here for…") that personalises the site live: it changes the hero line, the imagery, the order of the proof sections, the quiz's first question and the CTA wording. Remember the choice in localStorage (try/catch). Each version implements the switcher in ITS OWN style; it must not copy Site 1's photo cards.
- Business: peptides, not skincare. Lane: clinician-guided peptide care (a licensed clinician decides; licensed partner pharmacy; every lot tested), plus a small "no-consult" range of cosmetic topical peptides as ONE category among others. Never call the brand or the site "Skin".
- Senior-friendly everywhere: a text-size control, a visible phone line `[phone number]`, a "Call me back" option.
- Shared image pool: use these file names under `media/`. They will be supplied later. Pick the ones that fit; you must design fallbacks.
  - Audience: aud-longevity.jpg (silver-haired man, coastal trail), aud-women.jpg (woman 50s, window), aud-energy.jpg (woman stretching in bed, morning), aud-men.jpg (man 40s running city stairs at dawn), aud-athlete.jpg (athlete, dark gym), vial-hero.jpg (vial on obsidian, rose rim light)
  - Warm/editorial: pure-drop.jpg (serum droplet over ivory stone), pure-bottle.jpg, pure-woman50.jpg, pure-texture.jpg, pure-flatlay.jpg, pure-copper.jpg (copper droplet swirling in water), pure-man60.jpg, pure-hands.jpg
  - Seniors/lifestyle: prime-couple.jpg (couple 60s, sea wall), prime-bike.jpg (grandfather teaching bike), prime-garden.jpg, prime-videocall.jpg, prime-swim.jpg, prime-hiking.jpg, prime-tea.jpg, prime-dancing.jpg
  - Athletic: perf-sprinter.jpg, perf-boxer.jpg, perf-deadlift.jpg (female athlete), perf-plunge.jpg (man 40s cold plunge), perf-nightrun.jpg, perf-rower.jpg, perf-climber.jpg, perf-mobility.jpg (woman stretch)
  - Lab: lab-autosampler.jpg, lab-bench.jpg, lab-glovedvial.jpg, lab-powder.jpg, lab-vialrow.jpg, lab-crystals.jpg, lab-coldchain.jpg, lab-freezer.jpg
- Intro film stays `media/intro.mp4` (yours is assigned in your message). No other video anywhere on the site.

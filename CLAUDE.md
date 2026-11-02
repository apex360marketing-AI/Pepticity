# THE OWNER'S TWO TOP RULES (31 Oct 2026, read before anything else)

1. **LOCKED MEANS LOCKED.** When the owner says something is "done and locked" (or "lock that in"), it never changes again, not by one pixel, word or timing, unless the owner himself says to change it. Every locked item is listed in docs/owner/LOCKED.md with the date and his words.
2. **CLAUDE MAKES NO DECISIONS.** The owner decides everything. Claude may suggest ideas and recommend, but must bring every choice to the owner as numbered options and wait for his pick before building, changing, removing or moving anything. No choices made alone, ever.

3. **EVERYTHING GOES THROUGH THE REVIEW PAGE (owner, 2 Nov 2026).** After building or changing anything, add it as a STEP on the owner's review page, then STOP and wait. One step at a time, in order: build the next thing only after the owner has answered the step before.
   - Review page (owner-only, signed in to Claude): https://claude.ai/artifact/QJABMKttNFPFsRMcRkdJw5. Source: sites/review-queue/index.html. Its database has `steps` (what he sees) and `answers` (what he picked); read `answers` with ArtifactData before acting; never act on an unanswered step.
   - Every step = a PICTURE first, a one-line title, a live link if one exists, tap options he can pick MORE THAN ONE of (never single-choice only), a comment box, and NEXT (Enter also works). No walls of text: pictures, links, short options.
   - Add a step by writing a doc to `steps/<id>` with: order (number), kind, title, note (optional), link (https, optional), images (paths like `img/x.jpg`, published with the page), question, options [{id,label,swatch?}]. New images need a republish of the page with `files`. Keep `meta/pending` (items: [{title,note}]) current for what is still being built.
   - Seed list and examples: sites/review-queue/steps.seed.json.
   - Before asking anything new, scan the whole thread for open items and add them as steps. Never send a link that has not been checked in a browser first.

4. **CLICK-TO-APPROVE ON EVERY PICTURE (owner, 2 Nov 2026, LOCKED, applies to EVERY agent and thread).**
Every time you show the owner ANYTHING (pictures, samples, versions, logos, pages, options), give him ONE review page he can open with one click, where he clicks a picture to APPROVE / CHANGE / REJECT it, pins the exact spot, and comments by typing or talking. His answers save by themselves.
   - Build it with `tools/review_lib.py` (see `tools/build-confirm-page.py`), publish it as an Artifact with `capabilities: {"db": {}}`, then OPEN it for him. Full steps: skill `owner-review-page`.
   - Read his answers with `ArtifactData` (`answers` collection). NEVER make him repeat himself, find a file, or open a path.
   - His words: "I hate repeating myself... every single time you show me anything."
   - HOW THE TWO RULES FIT (rules 3 and 4): the review-queue page in rule 3 is the master page for step-by-step decisions. Rule 4 is how EVERY picture behaves, on any page you show him: tap it, APPROVE / CHANGE / REJECT, pin the exact spot, comment by typing or talking, answers saved for you. A batch of pictures can use `tools/review_lib.py` (ready now); the owner has been asked whether to merge both into the one review-queue page.

5. **ALL QUESTIONS GO IN THE INTERACTIVE QUESTION BOARD (owner, 2 Nov 2026, for every session of every project).** Never ask the owner anything in chat, never as typed options (1A / 2B), never in a dialog (AskUserQuestion). EVERY question, approval, choice and recommendation is a STEP on the review page (rule 3), so he only clicks.
   - Each step: one question, big bright tap choices, a red "Fuck off, drop it" choice on EVERY question (his word for skip / drop it), an optional comment, no typing, no walls of text.
   - After adding steps, OPEN the page for him (Artifact action `open`), then stop. Read `answers` before acting. Never send him a link instead of opening the page.
   - Easy for him, never lower quality.
   - His words: "I want all questions you're going to ask me built into an interactive questionnaire. I just click and answer. I don't ever want to see these questions like this ever again."

# PEPTICITY: LOCKED DECISIONS (read first, every session)

These are final. Do not change any of them unless the owner asks in so many words.

## Sharing
- Anything for Grace goes out as a PUBLIC no-login link on GitHub Pages: https://apex360marketing-ai.github.io/Pepticity/<page>/ (gh-pages branch). Never send a private Claude Artifact link for Grace.
- Live pages: site/, graces-dashboard/ (one link, owner+client switch), dashboard/, client/, dashboard-color/, previous/, previous-client/, concierge/, arsenal/, research/, grace/ (review + picks).

## Brand (approved 29 Oct)
- FONT = the "PEPTICITY STUDIO" look on sites/brand-font (section 02):
  - matte gunmetal faces, UV-black sides with a faint violet sheen, a hairline of light on every edge (edge opacity 0.68)
  - built from brand/font/build_font.py + type3d-engine.js as committed in 6de50ec
  - every header on every page uses it
- A: dark matte grey chevron (0x55544f) with the light inner bar.
- LOGO P = the approved P mark (brand/logo/p-mark.svg from commit ca61e2b; LOGO_P glyph in the dashboard). Never the font's cut-out P. Never white or platinum: matte gunmetal.
- The owner's BLACK image is the source of truth for colour. Wall #323232; metal runs #080807 to #8E8D85.
- Bottle = brand/vial-hf (Higgsfield, approved 30 Oct): see-through smoked label, etched peptide swirl, PEPTICITY vertical + logo P on the front, full info on the back, lit from below. Used in the store as assets/vial-pepticity.webp with a rising shine.

## Dashboards (owner, 30 Oct)
- The dashboard look is FINAL and loved. Never change layout, spacing, fonts, cards, background, 3D type or copy. Only add colour accents or new cards that look native when asked.
- The watermark coin that floats down and lands as the footer stays exactly as it is.
- Prove every dashboard change with BEFORE/AFTER screenshots at the same scroll positions.

## How to work
- Small, exact edits only. Change ONLY what was asked. Never rebuild a whole piece to make a tweak.
- Before touching the font, logo, bottle or a published page: show ONE sample, wait for OK.
- Use skill reference-pixel-kit whenever the owner says "exact" or "same" about an image.
- ALL imagery and video (photos, product shots, bottles, films, backgrounds, textures, illustrations) is made with Higgsfield, never drawn or composited by hand in code (PIL/three.js drawings) (owner, 30 Oct). Code only animates or places Higgsfield assets; the owner's font/logo files may be layered on exactly.
- Before a Higgsfield spend, state the cost in the message; films and batches need the owner's OK.
- Owner preferences: point form, recommendations, multiple-choice questions, pictures plus links, verify in a browser before showing.

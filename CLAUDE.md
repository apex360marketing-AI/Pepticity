# PEPTICITY: LOCKED DECISIONS (read first, every session)

These are final. Do not change any of them unless the owner asks in so many words.

## OWNER RULES: HIGHEST PRIORITY, EVERY SESSION, EVERY PROJECT (owner, 2 Nov 2026)
Review board: https://claude.ai/artifact/QJABMKttNFPFsRMcRkdJw5
1. OPEN THE BOARD EVERY TIME. After ANY change, build, publish or new step, open the review board for the owner yourself (Artifact tool, action `open`, the URL above). Never say "it's on the board" without opening it. If you changed a page, open that page too.
2. NEVER ASK IN CHAT. No typed options (1A / 2B), no AskUserQuestion dialog, no "reply with...". Every question, approval, choice and recommendation becomes a STEP on the board.
3. HOW TO ADD A STEP: ArtifactData `set` on the board URL, collection `steps`, doc_id = `<project>-<short-id>`, data = {id (same as doc_id), order (100+ unless urgent), kind, title (one line), note (one short line), link (https, optional), images (optional), question (short), options [{id, label, swatch (bright hex)}]}.
4. OPTIONS: few and short, recommended first and marked "(Recommended)". The LAST option on every question is {id:"drop", label:"Fuck off, drop it", swatch:"#FF3B5C"}, meaning skip it and move on. No walls of text.
5. READ ANSWERS from collection `answers` (doc id = step id). Never act on an unanswered step. Never edit or delete another session's steps.
6. Anything you were waiting on the owner for gets re-asked as a board step, then the board is opened.
7. After adding steps and opening the board, keep working on anything that does not need an answer. Do not stop and wait idle.

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
- Owner preferences: point form, recommendations, pictures plus links, verify in a browser before showing. Questions go on the review board only (see OWNER RULES), never in chat.
- Mark anything changed in bright purple (#B000FF) on pages the owner reviews, so he sees what is new without rereading.

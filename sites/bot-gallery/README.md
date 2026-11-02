# PEPTICITY bot gallery (preview, NOT published)

15 guide bots in 5 families, one shared brain and one shared look. Open `index.html` over http (for example `python3 -m http.server` inside this folder).

## Where things are
- `index.html`: the gallery (15 cards, each with its own small live motion).
- `NN-slug/index.html` + `bot.js` + `bot.css`: one page per bot (description block + live demo).
- `shared/gallery-brain.js`: the 4 questions, the class-level reading list, free-text answers (runs the approved guard in `pep-brain.js` first).
- `shared/common.js`: page frame, pointer light, result cards, lead capture (CASL, unticked single-purpose boxes, preview-only).
- `shared/gallery.css`: tokens, clear glass, buttons, cut corners.
- `shared/gthree.js`, `shared/orb.js`, `vendor/`: three.js (r160) stage with PMREM reflections, materials, the logo P extruded from the logo slot.
- `sync-brain.sh`: copies the trained brain and font from `shared/` and `brand/` into this folder.

## The ONE logo swap slot
`--logo-p` in `shared/gallery.css` (default `assets/p-mark.svg`). Replace that file, or change the variable. The header mark, the gallery thumbnails and the 3D P / medallion all read it. The 3D bots extrude whatever outline the SVG contains.

## Compliance switch
Add `?safe=1` to any bot address: no peptide families, no goal-to-vitamin pairings, no clinician or assessment wording (matches the standing "no clinician exists today" rule). Default (no switch) follows the owner's brief. The owner picks which one is published.

## Tests
- `node tools/gallery-brain-test.js` (banned-stem and product-name check, both modes)
- `node tools/bot-gallery-test.js [prefix...]` (Chromium 1440x900 and 390x844: console errors, sideways scroll, every flow to the success state, unticked consent, hook id). `REDUCED=1` runs reduced motion, `QS='?safe=1'` runs the safe version.
- `python3 tools/cheap-detector.py <png> 0066FF` (accent coverage, limit 5%)

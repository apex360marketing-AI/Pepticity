---
name: honeycomb-4d
description: Use when building the PEPTICITY honeycomb (hexagon inside hexagon, logo P on the front) as a set of 4D logo versions, or when the owner says "honeycomb", "hex", "instead of the circle/coin". Pulls forward every earlier honeycomb the owner already saw before making new ones, then builds ten new 4D versions with the matte-uv-4d recipe.
---
# HONEYCOMB 4D SET

Owner (7 Nov): "I asked you to use the honeycomb instead of a circle. I don't have a clue where that went. Pull forward the honeycomb logos you made me first, and build me another 10."

## Step 0 · pull forward FIRST (never skip)
The earlier work is in the repo, not lost:
- sites/main/v4/stage1-hive.html (eight honeycombs)
- sites/main/v4/stage1-honeycomb.html (honeycomb, 8 colours)
- sites/main/v4/stage1-medallions.html and stage1/medallions.html (hexagon medallions)
- sites/main/v4/stage1-glass.html (glass medallion, 3 versions)
- sites/main/v4/stage1-ten.html (ten clean interactive logo versions)
- review pictures: docs/owner/review/ (eight-honeycombs.png, honeycomb-8-versions.png, ten-rest.png, glass-3.png)
Also run `git log --all -i --grep="honeycomb|hexagon|medallion"`. Put each in the gallery as a live cell labelled FROM BEFORE.

## Step 1 · two samples, one at a time
Build 2 live samples (separate pages). Wait for the owner's pick on the board before the full set.

## Step 2 · ten new
Each of the ten differs in: build (stack depth, hex gap, bevel), matte colour, UV colour, light path, motion signature. The P is the APPROVED p-mark.svg (never the font's cut-out P). Use matte-uv-4d for finish and motion. Real three.js, vendored locally so the page also works under a strict CSP.

## Step 3 · in place
Show the same medallion as watermark, loader, footer badge and card seal.

## Rules
- Headings in CAPITALS; brand written PEPTICITY.
- Glass see-through only, no fills.
- Render only visible cells, one active canvas at a time.
- Changed or new text in bright purple #B000FF (owner rule), behind a CHANGES toggle.

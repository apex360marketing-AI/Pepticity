---
name: credit-guard
description: Use BEFORE ANY Higgsfield spend on PEPTICITY (image, video, 3D, upscale, batch, preset, Marketing Studio) and before re-running a generation. Write the brief, check it against brand-lock and the ledger, get the cost, generate ONE test, inspect it against the brief, and only then spend more. Log every spend.
---

# Credit guard

Credits were wasted on off-brand frames (peach city, wrong logo, blurry frames). Every credit now needs a reason and a check.

## 1. Write the brief (in the job checklist)
- Purpose: which `stage-gate` piece and which ledger ids it serves.
- Subject, camera, light, duration, aspect ratio, resolution.
- Palette from `pepticity-brand-lock` written in plain words AND hex ("crisp neutral white #f7f8fa; pale chrome gold #a4845d/#f0e6c7; no peach, no pink, no yellow, no warm sunset").
- Text and logo: exact spelling "PEPTICITY" in capitals; the P logo; say if text should be left OFF and added later in three.js (usually safer).
- Reference images to attach (the owner's font image, approved frames, Grace's real vial). Upload the actual files.
- What would make it a FAIL (list 3–5 things).

## 2. Check the brief
- Read it against `pepticity-brand-lock` (palette, font, banned colours) and the ledger (does the owner want a NEW film, or reuse his existing films? R047).
- Reuse first: check existing media in `media/`, `sites/*/media/` and Higgsfield `show_generations` before making anything new.
- Owner approval: a NEW film, a batch, or anything over a small test needs his OK (`stage-gate`).

## 3. Get the cost
- Call the cost/quote tool for the exact settings (or `models_explore` recommend, then the quote). Check `balance`.
- Write: model, settings, cost per run, balance before.
- Show the cost to the owner before any spend that is not a single small test.

## 4. Generate ONE test
- One image or one short clip at the final settings. Never a batch first.
- No upscale, no extension, no variants yet.

## 5. Inspect the test against the brief
- Download it and Read it (look at it). For video, pull frames at 0%, 25%, 50%, 75%, 100%.
- Colour: run the `pepticity-brand-lock` colour check on the frames. Peach/pink/yellow cast = FAIL.
- Spelling: every visible word is spelled right, in capitals. Garbled text = FAIL.
- Logo: matches the P in the owner's font, or is absent if the brief said absent.
- Crispness: zoom to 100% on edges and type. Smearing, blur, melting edges = FAIL. Check frame-to-frame for flicker.
- Matches every line of the brief and none of the FAIL list.
- FAIL: fix the brief (one change at a time), then ONE more test. Two fails in a row: stop and show the owner the problem with options.

## 6. Spend more only after a pass
- Generate the rest only after the test passes (and the owner approved the piece if needed).

## 7. Log every spend
- Append to `docs/owner/higgsfield-spend-log.md` one row per job:
  `date | piece / ledger id | model + settings | credits | balance after | job id | PASS/FAIL | why`
- Failed runs are logged too.

## Never
- Batch before a passing test.
- Spend to "see what happens" or to fix something three.js or CSS can fix.
- Put PEPTICITY text into a generation you cannot check letter by letter.

---
name: verify-before-done
description: Use right before saying anything about PEPTICITY is done, fixed, working, matching or ready, and before sending the owner any link, screenshot, sample or commit. Proves the work against the approved brief line by line with fresh screenshots and checks; no proof, no claim.
---

# VERIFY BEFORE DONE

Ported and adapted from:
- obra/superpowers `verification-before-completion` skill (MIT, Copyright (c) 2025 Jesse Vincent) - https://github.com/obra/superpowers

Iron rule: NO "DONE" WITHOUT FRESH PROOF FROM THIS TURN.
If you did not check it in this turn, you cannot say it works.

## THE GATE (every time)
1. NAME the proof: what would show this claim is true?
2. RUN it fresh: load the real page in Playwright (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`) at 1440 and 390 wide, scroll the full page, take screenshots.
3. LOOK at every screenshot with the Read tool. Read console errors.
4. CHECK it against the brief, line by line (below).
5. Only then say what is true, with the proof attached.

## LINE-BY-LINE CHECK
Re-open the approved spec (R-list) and the ledger. For each line write:
- `R1 - PASS - [screenshot name / what it shows]`
- `R2 - FAIL - [what is wrong]` -> fix it, then run the gate again.
"Tests pass" or "page loads" is not the same as "every requirement met".

## PEPTICITY BRAND CHECK (each is a line)
- Ground is bright white; metal is classy chrome gold (pale, low chroma, matches `design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png`) or platinum chrome.
- Zero peach, pink, yellow, orange-gold, dull gold or green anywhere (eyedrop suspicious pixels, do not eyeball).
- No pill shapes (check every button, chip, tag, input).
- Every heading, menu item and wordmark in CAPITALS; brand reads PEPTICITY.
- Product looks photo-real, not a three.js drawing.
- No invented stats, reviews or medical claims.
- No sideways scroll on phone; nothing overlaps or is cut off.

## REFERENCE IMAGE CHECK
Put the owner's reference and your screenshot side by side and Read both. Compare colour, shine, chrome, glass, proportions and the small touches (a hint stays a hint). Name every difference. Any real difference = FAIL.

## BANNED WORDS UNTIL PROVEN
"should work", "probably", "looks good", "done!", "perfect", "fixed". Also any claim based on a sub-agent's report alone: check its files and screenshots yourself.

## HOW TO REPORT (point form)
- What passed, with the screenshots shown in the chat and the published link (never localhost).
- What failed or could not be checked here, said plainly.
- Next step as a multiple-choice question in a separate turn, recommended option first.

## WHEN TO RUN
Before: any "done", any link or sample to the owner, any commit or push, marking a stage approved, moving to the next task.

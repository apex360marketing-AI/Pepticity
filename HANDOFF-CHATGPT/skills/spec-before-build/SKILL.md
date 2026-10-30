---
name: spec-before-build
description: Use before building, generating or changing ANYTHING for PEPTICITY that the owner has not already approved in full (a page, a section, an effect, a Higgsfield shot, copy, a fix). Restate every requirement as a numbered checklist, flag gaps, and get the owner's OK by multiple-choice before any building starts.
---

# SPEC BEFORE BUILD

Ported and adapted from:
- obra/superpowers `brainstorming` skill (MIT, Copyright (c) 2025 Jesse Vincent) - https://github.com/obra/superpowers
- gotalab/cc-sdd requirements phase and EARS format (MIT, Copyright (c) 2025 gotalab) - https://github.com/gotalab/cc-sdd

Core rule: what you THINK the owner wants is thinner than it feels. Find out, write it down, get a yes. Then build.

## 1. LOOK BEFORE YOU ASK
- Read the owner's message word for word, CLAUDE.md, `docs/owner/REQUEST-LEDGER.md` and anything they pointed at.
- Open every reference image in `design/references/pepticity/` with the Read tool. Look at it. Never work from a written description of an image.
- Never ask something the files or the chat already answer.

## 2. WRITE THE SPEC (point form, owner's words)
Make a numbered list. One line per requirement, testable, one behaviour each:
- `R1 - [the owner's words] -> I will check it by: [screenshot / count / read-back]`
- Use the cc-sdd pattern where it helps: "When [visitor does X], the page shall [do Y]".
- Add the standing PEPTICITY rules as their own lines, every time:
  - Bright white ground + classy chrome gold (pale, low-saturation, per `design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png`) or platinum chrome.
  - No peach, pink, yellow, orange-gold or dull gold. No green. No pill-shaped buttons or chips.
  - ALL headings in CAPITALS. Brand typed as PEPTICITY.
  - Photo-real product (Higgsfield or real GLB), never a hand-drawn three.js vial.
  - No invented stats, reviews or claims; use `[placeholders]`.
- Mark anything missing as `GAP - [what is unclear]`. Do not fill a gap with your own guess.

## 3. SAY WHAT YOU FOUND
In under 200 words: echo the ask in your own words, list conflicts or risks you spotted (a rule it breaks, a cheaper path that is NOT weaker, a missing asset), and show the spec.

## 4. GET THE OK (multiple choice, never decide for the owner)
Ask with AskUserQuestion, 2-4 options, recommended first:
- "APPROVE SPEC AS WRITTEN (Recommended)"
- "APPROVE WITH CHANGES - I will type them"
- "ANSWER THE GAPS FIRST"
One question per GAP, each with its own options and a recommendation. Options are only ever top-tier choices; never offer a "quicker, less polished" one.
If a sample or image was shown in the same message, send the question in a LATER turn so the dialog does not hide it.
No clear answer? Ask again straight away, re-worded. The owner's typed words count as the answer.

## 5. LOCK IT
- Save the approved spec to the ledger entry (id, date, R-list, status `APPROVED`).
- Only now start building, using `staged-delivery`.
- If the owner changes their mind later, update the spec first, then the work.

## RED FLAGS - STOP
- "I know what they mean" with no written spec.
- Building while a GAP is still open.
- Quietly dropping a requirement because it is hard.
- Swapping the tool or method the owner named for a different one.

---
name: requirement-checklist
description: Use for EVERY PEPTICITY owner message that asks for work, right after read-three-times and before building. Turns the message into a numbered checklist with the owner's exact words, then ticks each item against the finished result (screenshots, sampled pixels, read-backs) before anything is reported or shown.
---

# Requirement checklist

## Where it lives
- One file per job: `docs/owner/checklists/YYYY-MM-DD-<job>.md`.
- Paste the same checklist (short form) into the reply to the owner when reporting.

## Build the checklist (before any work)
- One numbered line per ask from `read-three-times`. Format:
  `3. "the logo goes right across the front, it engraves itself" (R110) | TEST: frame at 8 s shows PEPTICITY engraved full width | STATUS: open`
- Every line has three parts:
  - His exact words in quotes, plus the ledger id.
  - A TEST: something you can look at or measure. Not "looks good". Examples: "headline is uppercase in the owner's angular metal font", "no pixel in the hero has hue 0–60° with chroma above 12", "SCR-17 visible at scroll 40%".
  - A STATUS: open / done / waiting (question asked) / blocked (why).
- Add the standing rules that apply as their own numbered lines, marked (RULE), e.g. "(RULE) all headings in CAPITALS", "(RULE) PEPTICITY in capitals", "(RULE) no pills", "(RULE) rendered picture plus link".
- Add the brand-lock checks from `pepticity-brand-lock` as lines when anything visual is built.

## Turn vague words into tests
- "Slower" → state the old and new numbers (e.g. scroll length 300vh → 600vh; door open 1.2 s → 2.4 s).
- "More light / a teeny bit more smoke" → a small, stated change (e.g. bloom 0.6 → 0.75). "Teeny" means small: under 20%.
- "Classy / posh" → map to brand-lock rules (palette, chamfers, sweep speed, density caps).
- "Everywhere" → a count and a map (e.g. hooks: one per 1–1.5 screens, listed by section).
- If a word cannot become a test, ask the owner a multiple-choice question about it.

## Tick against the result (after the work, before reporting)
- Load the result in Playwright (`/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), desktop 1440 and phone 390.
- For each line, attach the proof: screenshot path, sampled hex values, scroll position, or a read-back of saved data.
- A line is DONE only with proof attached. "I think it's there" is open.
- Any open line: fix it, or mark it waiting/blocked with the reason. Never hide it.

## Report format (to the owner)
- Point form, one line per item: number, his words (short), DONE / WAITING / BLOCKED.
- Then the rendered picture and link (`owner-delivery-format`).
- Then the recommendation.

## Checks
- [ ] Every ask from read-three-times appears as a numbered line.
- [ ] Every line has his words, a TEST and a STATUS.
- [ ] Standing rules and brand-lock checks are included for visual work.
- [ ] Every DONE has proof attached.
- [ ] Nothing reported as done that was not checked in a real browser or read back.

## Never
- Rewrite his words into your own words in the quote column.
- Tick a line because the code "should" do it.
- Report a partial result as finished. Say what is left.

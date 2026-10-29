---
name: staged-delivery
description: Use after a PEPTICITY spec is approved and the work has more than one piece (several sections, pages, effects, shots or a change that rolls out across many items). Break it into small stages, keep a stage ledger, build ONE stage, verify it, show it, and wait for the owner's approval before the next.
---

# STAGED DELIVERY

Ported and adapted from:
- obra/superpowers `writing-plans` and `executing-plans` skills (task ledger, recorded rulings) (MIT, Copyright (c) 2025 Jesse Vincent) - https://github.com/obra/superpowers
- gotalab/cc-sdd phase gates and tasks.md (MIT, Copyright (c) 2025 gotalab) - https://github.com/gotalab/cc-sdd

Core rule: one piece at a time, proven and approved, so nothing drifts and nothing is lost. Unlike superpowers' inline mode, this owner WANTS a check-in at every stage.

## 1. PLAN THE STAGES
- Start from the approved spec (`spec-before-build`). Every R-line must belong to a stage.
- Stage 1 is always the SAMPLE: one section, one page or one item that shows the look. Roll-outs come after it is approved.
- Each stage is small enough to show in one screenshot set.
- Write the plan in point form:
  `S1 - [what] - covers R1, R3 - done when: [what the screenshot must show]`
- Show the plan and ask (AskUserQuestion, recommended first):
  "APPROVE STAGES (Recommended)" / "CHANGE THE ORDER" / "SPLIT OR MERGE STAGES".

## 2. KEEP THE STAGE LEDGER
In `docs/owner/REQUEST-LEDGER.md`, under the request id:
- `S1 - status: planned | building | shown | APPROVED | changes asked`
- Any judgment call you make goes in as:
  `RULING: [what I decided] - [why] - [what it costs if wrong]`
  A change from the plan with no RULING line is a decision made in secret. Never do it.
- Calls the owner should make (colour, layout, copy, tool) are NOT rulings: ask them as multiple choice.

## 3. BUILD ONE STAGE
- Re-read the spec lines for this stage and open the reference images again before you start.
- Build only this stage. Do not start the next one "while waiting".
- Fully polished every time. Scope down (fewer items) rather than ship a rough one.
- Keep the PEPTICITY rules: bright white + chrome gold or platinum chrome; no peach, pink, yellow, dull gold or green; no pills; ALL CAPS headings.

## 4. PROVE IT, THEN SHOW IT
- Run `verify-before-done` on the stage. No proof, no showing.
- Send the rendered screenshots in the chat plus the published link.
- Point form: what this stage covers (R-numbers), what is left.
- Do NOT end that message with a question dialog. Ask in the NEXT turn:
  "APPROVE - NEXT STAGE (Recommended)" / "TWEAK THIS STAGE - I will type it" / "REDO THIS STAGE".

## 5. MOVE ON ONLY ON A YES
- Approved: mark it in the ledger, start the next stage.
- Tweaks: change only what was asked, re-verify, re-show.
- No clear answer: ask again, re-worded. Typed words are the answer.

## STOP AND ASK (never push through)
- Anything that deletes, overwrites or publishes over the owner's existing work.
- Spending Higgsfield credits beyond what the owner approved.
- A plan so wrong that every path is a guess.

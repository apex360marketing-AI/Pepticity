---
name: stage-gate
description: Use for ANY PEPTICITY build bigger than a one-line tweak (a section, the hero, the doors, the font, the logo, a film, a dashboard view, a rollout across pages). Build ONE piece, show a rendered picture plus the link, and wait for the owner's explicit OK before building the next piece. Never build a whole site or a whole set in one go.
---

# Stage gate

The owner was burned by huge builds he never approved. Small, approved steps only.

## Split the job into pieces first
- List the pieces in build order, one line each, before writing code. Example for the main page:
  1. P LOGO in the owner's font (still render)
  2. Heading type sample in the font (3 words, 3D)
  3. Hero with grand-opening offer
  4. Doors and scanner
  5. City weave (SCR-07)
  6. Store path with hooks
- Each piece must be small enough to show in one picture and one link.
- Show the piece list to the owner as point form with a recommendation of which piece goes first.

## Build one piece
- Build only that piece. Nothing from the next piece "while you're in there".
- Run `pepticity-brand-lock` checks and the job's `requirement-checklist` lines that belong to this piece.
- Verify in a real browser: desktop 1440 and phone 390, plus a scroll capture if it moves.
- Publish it as an Artifact (never localhost).

## Show it
- Send the rendered picture in the chat (screenshot or short capture) plus the link.
- Under it, 3–6 points: what this piece is, what changed, what to look at.
- One recommendation line ("Recommend: approve and move to piece 3").
- Do NOT put a question dialog on the same message as the picture (it hides the picture). Ask in a separate turn or in plain text.

## Wait
- The gate opens ONLY on an explicit OK in his words ("yes", "approved", "go", "next", "love it").
- Silence, "hmm", or a comment about something else is NOT an OK. Re-ask (multiple choice) until there is an answer.
- If he asks for tweaks: make only those tweaks, show again, wait again.
- Log the approval in the ledger with his words and the date.

## Rollouts (SAMPLE FIRST)
- A change across many items (vials, cards, pages, buttons) is applied to ONE sample first.
- Show the sample. Roll out only after the OK.

## Allowed while waiting
- Research, skills, checklists, and preparing the NEXT piece's plan on paper.
- Not allowed: building the next piece, spending Higgsfield credits on it, or rolling anything out.

## Checks
- [ ] A piece list exists and the owner has seen it.
- [ ] Only the current piece was built.
- [ ] Picture plus link sent, no dialog on that message.
- [ ] Explicit OK recorded in the ledger before the next piece started.

## Never
- Deliver "the whole site" as the first look.
- Treat a past approval of a different piece as approval of this one.
- Start the next piece because the owner is slow to answer.

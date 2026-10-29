---
name: read-three-times
description: Use BEFORE ANY action on PEPTICITY (a build, an edit, a generation, a reply, a plan) every time a new owner message arrives, and again before saying anything is done. Re-read the owner's latest message, CLAUDE.md and the request ledger three times, list every ask, and prove nothing was dropped. Runs before owner-accountability and requirement-checklist.
---

# Read three times

The owner has been ignored before: wrong colours, his font skipped, no logo, his picked effects left out, no hooks. Every one of those was written down somewhere and missed. This skill stops that.

## The three files (read all three, every time)
- The owner's LATEST message, word for word (plus any image he attached: Read the image file itself).
- `/home/user/apex_agents_bots/CLAUDE.md` (standing rules: colours, CAPS, no green, no gold except gold-chrome, show don't bury, sample first).
- `/home/user/pepticity/docs/owner/REQUEST-LEDGER.md` (every ask so far, including the "Added 29 Oct" sections at the bottom).
- Also open `docs/owner/effect-picks-2026-10-28.md` when the task touches design, motion or effects.

## Pass 1: read for asks
- Read the message slowly, top to bottom. Split it into separate asks, one per line.
- Copy his exact words for each ask in quotes. Do not paraphrase yet.
- Count them. Write the count down: "Pass 1: N asks."

## Pass 2: read for rules that bind the asks
- Read CLAUDE.md top to bottom. Under each ask, note every rule that applies (e.g. "headings in CAPS", "no peach", "sample first", "rendered picture plus link").
- Read the ledger. Note every older ask that this new message touches, repeats or changes (quote the ledger id, e.g. R072, R091).
- Flag conflicts in one line each (e.g. "15% off vs research H01 STOP: needs counsel switch").

## Pass 3: read for what is missing
- Read the message a third time looking only for small asks: adjectives ("slower", "a teeny bit more smoke"), numbers ("9 or 10 seconds", "5 colour options"), names (a file, a tool, a skill he named), and words like "always", "never", "everything", "all".
- Every one of those is an ask. Add any you missed in Pass 1.
- Final count: "Pass 3: N asks (was M after pass 1)."

## Write it down before acting
- Append every new ask to the ledger (id, date, his words, status, where it lives). Use the next free R-number.
- Hand the list to `requirement-checklist` to become the numbered checklist for this job.
- If an ask is unclear, ask a multiple-choice question about THAT ask only (`owner-delivery-format`). Keep working on the rest.

## Checks (all must be yes before the first action)
- [ ] All three files were actually opened in this turn (not remembered from earlier).
- [ ] Every attached image was opened with Read.
- [ ] Every ask has his exact words in quotes.
- [ ] Every number, adjective and named tool from the message is on the list.
- [ ] Every new ask is in the ledger.
- [ ] Conflicts are flagged, not silently resolved.

## Before reporting back
- Re-read the latest message once more and tick each ask: DONE (checked in a browser or read back), RUNNING, or WAITING ON A QUESTION I ASKED.
- Anything else means you are not finished. Go back and do it.

## Never
- Act from memory of a message you read earlier in the session.
- Merge two asks into one because they "feel similar".
- Drop an ask because it seems small, hard or expensive. Say it is waiting and why.
- Swap in a different tool, font, colour or deliverable than the one he named.

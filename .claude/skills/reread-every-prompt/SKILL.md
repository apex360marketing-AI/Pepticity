---
name: reread-every-prompt
description: Use at the start of EVERY owner message on PEPTICITY. The enforcement behind "read my rules every single prompt". A UserPromptSubmit hook (.claude/hooks/every-prompt.sh) re-injects CLAUDE.md, the latest ledger lines and the pre-reply checklist on every prompt; this skill is what you do with it.
---
# RE-READ EVERY PROMPT

Owner (7 Nov): "I want you to reread my rules every single prompt. I don't care if it costs me money. You literally don't do your job."

## How it is enforced
- .claude/settings.json runs .claude/hooks/every-prompt.sh on every UserPromptSubmit. Its output (CLAUDE.md rules, the last ledger lines, the checklist) lands in context before you answer.
- Never answer from memory of the rules. If the injected block is missing, read CLAUDE.md and docs/owner/LOCKED.md yourself first.

## What you do each prompt
1. Read the injected rules, then the owner's message three times.
2. Write the ask list (every ask, his words) at the top of your working notes; add new asks to docs/owner/REQUEST-LEDGER.md the same turn.
3. Before saying anything is done: tick every ask with evidence, run common-sense-build, colour-sense and the hover audit on the real page.
4. Never revert or contradict an owner order. If two notes conflict, the owner's newest order wins and you fix the older note.

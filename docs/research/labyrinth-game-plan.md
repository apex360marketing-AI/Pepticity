# LABYRINTH GAME PLAN: stop the repeating (2 Nov 2026)

Point form. Builds on docs/research/labyrinth-research.md. Nothing here is built yet. Every phase waits for the owner's pick on the board.

## THE REAL PROBLEM (diagnosis)
- He repeats himself because rules live in ONE long prose file (CLAUDE.md) that nothing enforces and nothing updates.
- Evidence in the file itself: the same rule appears 2 to 3 times (open the board = OWNER RULES 1 and rule 6; no questions in chat = OWNER RULES 2 and rule 5; purple = twice). Duplicates, a long list and mixed priorities make the model follow "nearest/last" and drop the rest.
- No capture: when he says "I hate repeating myself", nothing turns that sentence into a permanent, checked rule.
- No enforcement: a skill or CLAUDE.md line is a suggestion. Only hooks and scripts are guaranteed.
- Another session or ChatGPT never sees any of it.
- So the fix is NOT a bigger skill. It is a standing-orders system: capture, compress, inject, enforce, learn.

## THE ANSWER IN ONE LINE
Skills hold know-how. HOOKS inject and enforce his rules on every prompt. A LEDGER holds job state. A BRAIN holds what he said. Agents do the work. He talks once, it sticks.

## ARCHITECTURE (5 layers)

### L1 STANDING ORDERS (the anti-repeat core)
- ONE file: `brain/standing-orders.md`, max 60 lines, numbered, each rule = one sentence + his exact words + date + id (`SO-007`).
- Three tiers: **LOCKED** (never changes), **ALWAYS** (every prompt), **PER-TASK** (loaded by stage).
- Merge all current duplicates once (CLAUDE.md OWNER RULES + rules 1 to 7 collapse to about 12 rules).
- Injected by hooks, not hoped for:
  - `SessionStart` hook: inject LOCKED + ALWAYS (about 40 lines) at the start and after every compaction (`SessionStart` matcher `compact`).
  - `UserPromptSubmit` hook: re-inject a 5-line "top rules" reminder on every prompt (cheap, cached).
- Works in every session type incl. cloud (put hooks in the repo `.claude/settings.json`, not `~/.claude`).

### L2 REPEAT-CATCHER (so he never says it twice)
- `UserPromptSubmit` hook scans his message for repeat/frustration signals ("again", "I told you", "every time", "stop", "don't ever", "always") and appends the exact sentence to `brain/inbox.jsonl` with timestamp + session id. Silent.
- End of every session (`Stop`/`SessionEnd` + a nightly scheduled task): a small agent turns inbox lines into PROPOSED rules (dedupe against existing ones first).
- Each proposed rule = ONE board step: his words, proposed rule text, options: Lock it / Always / Change wording / Fuck off, drop it. Approved rules go into the file; nothing auto-promotes.
- A rule he approved also gets a SO id so future corrections cite it ("you broke SO-007").
- Also mirror each approved rule to Konshus (`log_signal`) so ChatGPT/other AIs can be fed the same file (export `standing-orders.md` as a paste block for ChatGPT custom instructions: one source, many places).

### L3 ENFORCEMENT HOOKS (checkable rules become code)
Rules a script CAN check (do these first):
- `Stop` hook: block "done" if the board was not opened this turn (check the tool log) or if there is an unanswered question in chat (regex for "1A", "Reply with", "?" at end plus a choice list) -> exit 2, retry cap 3.
- `PreToolUse` block: `AskUserQuestion` blocked outright (his rule 2/5).
- `PostToolUse` log of every Higgsfield spend, `PreToolUse` budget gate (credit-guard).
- `PreToolUse` block on edits to files listed in `docs/owner/LOCKED.md` unless an approved board step id is passed.
- `Stop` hook: changed-text purple check on review pages (grep `#B000FF` on modified lines of review HTML).
- `Stop` hook: before "done", require screenshots at 1440x900 and 390x844 exist in `proof/`.
Rules a script CANNOT check (stay as injected text + critic): taste, tone, "premium".

### L4 JOB LEDGER + DONE-CONTRACT (so nothing stops halfway)
- `jobs/<id>/contract.json` (what "done" means, machine-checkable) and `ledger.json` (stages, tasks, status, artefact paths, cost).
- Driver script re-launches `claude -p --resume` until ledger is all done or blocked; `Stop` guard stops early "done".
- Classifier/refusal stop is logged as blocked and goes to the board as a step. No disguised retries.

### L5 THE SKILLS AND AGENTS (the build power)
Skills (thin, each SKILL.md <= 200 lines, detail in `references/`):
1. `labyrinth` conductor: intake from 2 to 3 lines, writes contract, routes stages, reads standing orders + ledger. Never builds itself.
2. `labyrinth-build`: brand, site, marketing, hooks, automations; stage references loaded ONE at a time.
3. `labyrinth-audit`: capture, critic panel, scoring, regression, lesson proposals (evidence-gated).
4. `daedalus`: makes/edits skills, writes evals first, never ships without them.
Agents (read-only or single-job, cheap model where possible): researcher, psychology-mapper, brand-director, builder, qa-capture, 3 critics (art director, conversion, compliance), historian (writes ledger + lessons).
Brain read/write: repo-markdown brain is primary, Konshus mirrors taste + decisions, board is the approval queue (Architecture C in the research file).

## WHAT HE GETS AS RESULT (plain)
- He states a preference ONCE. It is captured, shown to him as a one-tap board step, locked, injected into every future prompt, and enforced by code where possible.
- Every session starts already knowing his rules, his locked items, his open board steps and the last job's state.
- "Done" is blocked until the checks pass.
- All of it goes into one repo that ChatGPT-side paste blocks and Konshus also read.

## PHASES (one at a time, stage-gated; each ends with a board step)

**P0: STANDING ORDERS (build first, about half a day)**
- Merge duplicate rules into `standing-orders.md` (<= 60 lines), show him the merged list as ONE board step (keep/change/delete per rule).
- Add `SessionStart` + `UserPromptSubmit` injection hooks.
- Proof: new session, ask "what are my rules?" and see it list them with ids; 5 test prompts.
- Value: biggest cut in repeating, smallest build.

**P1: REPEAT-CATCHER + 3 ENFORCEMENT HOOKS (about 1 day)**
- Inbox hook, nightly proposer, board step per proposed rule.
- Hooks: board-opened check, no-chat-questions check, locked-file guard.
- Proof: deliberately break each rule; hook must block.

**P2: LEDGER + CONTRACT + DRIVER (about 1 to 2 days)**
- Ledger schema, Stop guard, resume script, cost log.
- Proof: kill a job mid-way; it resumes and finishes.

**P3: CONDUCTOR + ONE VERTICAL SLICE (about 2 to 3 days)**
- `labyrinth` conductor + 1 stage end-to-end on a real Pepticity page (capture, score, board step).
- Proof: before/after screenshots, score, cost.

**P4: BUILD + AUDIT SKILLS, CRITIC PANEL (about 1 week)**
- Add stages one by one; 10 golden test jobs written BEFORE docs; regression run in CI-style script.

**P5: SELF-LEARNING WITH GATES (about 1 week)**
- Lessons inbox -> board -> approved; prune job; rollback tag per approved change.

**P6: DAEDALUS + PUBLIC REPO (after sweep)**
- Strip brand/client data/secrets, marketplace.json, `claude plugin validate`, install test on a clean machine.

Estimates are my inference, not measured; first job logs real time and cost.

## WHAT I NEED FROM HIM (board only, no chat questions)
1. Approve P0 as the start (recommended).
2. Pick where the standing orders also go: ChatGPT custom instructions paste block / Konshus / both.
3. Confirm the merged rule list (the P0 board step will show it).

## HONEST LIMITS
- Hooks guarantee injection and checkable rules, not taste. Taste still needs his board clicks.
- The model can still misread a rule; hooks catch breakage after, not before. The repeat-catcher shrinks repeats, it does not make them zero.
- ChatGPT cannot run these hooks; it only gets the pasted block.
- Auto-edit of rules without his approval stays OFF (drift and unsafe-lesson risk).

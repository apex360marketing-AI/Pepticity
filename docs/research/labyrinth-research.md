# LABYRINTH RESEARCH (2 Nov 2026)

Point form. Tags: **[V]** verified in a primary source I fetched this session. **[3P]** third-party write-up, not confirmed by Anthropic. **[I]** my inference. Not legal advice.

Honest limits of this research:
- I could not fetch the Anthropic Cyber Verification Program page itself (403). Its numbers come via press + one analysis article. [3P]
- I read only the first ~100k characters of the skills, hooks and subagents docs pages.
- The `docs/llms.txt` index 404'd, so the full doc map is not read.
- Claims about "1% / 2% description budget" conflict across sources: check with `/context` on his install.

---

## 1. HOW SKILLS REALLY WORK (NOW)

**Format** [V] https://code.claude.com/docs/en/skills
- A skill is a folder with `SKILL.md`: YAML frontmatter (first line `---`), then Markdown.
- Locations: enterprise (managed) > personal `~/.claude/skills/<name>/` > project `.claude/skills/<name>/`; also nested, `--add-dir`, plugin `<plugin>/skills/<name>/`, and claude.ai account skills synced to `~/.claude/skills/synced/`.
- Frontmatter, all optional, only `description` recommended: `name`, `description`, `when_to_use`, `argument-hint`, `arguments`, `disable-model-invocation`, `user-invocable`, `allowed-tools`, `disallowed-tools`, `model`, `effort`, `context: fork`, `agent`, `background`, `hooks`, `paths`, `shell`, `metadata`, `license`, `compatibility`.
- Unknown keys are silently ignored. Bad frontmatter = the skill loads with NO fields set (silent failure).
- Outside Claude Code (claude.ai upload, Skills API) only `name, description, license, compatibility, metadata, allowed-tools` are allowed; other keys hard-error.

**Progressive disclosure and cost** [V]
- Level 1: `description` always in context (every turn).
- Level 2: full `SKILL.md` loads only when invoked, then stays in the conversation.
- Level 3: bundled files load only when Claude reads them; scripts are executed, not loaded (code never costs tokens, only its output).
- After compaction: the latest invocation of each skill is re-attached, first 5,000 tokens each, 25,000 tokens combined. Older skills can be dropped. **A 15k-token mega-skill gets cut to 5k after the first compaction.**
- Recommended: `SKILL.md` under 500 lines, details in sibling files.

**Triggering** [V]
- `description` + `when_to_use` is truncated at **1,536 chars per skill** in the listing. Put the key use case FIRST.
- `disable-model-invocation: true` removes the skill from Claude's context and blocks auto-invoke (user-only `/name`).
- `paths:` globs limit auto-activation to matching files.
- `skillOverrides` in settings: `on | name-only | user-invocable-only | off`.
- Total listing budget: sources disagree (1% of context, 2% of context with 16,000-char fallback, or 15,000 chars in older builds; override `SLASH_COMMAND_TOOL_CHAR_BUDGET`). [3P] https://claudefa.st/blog/guide/mechanics/skill-listing-budget , https://ytrofr.github.io/claude-code-guide/docs/guide/38-context-costs-and-skill-budget.html
- Over budget = descriptions trimmed or skills dropped from auto-invoke, users can still run them by name. [3P]
- No official "max number of skills" found. [V that I found none]
- His own repo already shows the symptom: this session lists ~70 skills. **Check `/context` and `/skill-doctor` before adding more.** [I]

**Skills vs the rest** [V unless noted]
- Skill = reusable instructions + files, loaded on demand, runs in the main context (or a subagent with `context: fork`).
- Slash command = same thing, older format; `.claude/commands/x.md` and `skills/x/SKILL.md` both make `/x`. Docs recommend skills.
- Subagent = separate context window, own tools/model, returns only a summary. https://code.claude.com/docs/en/sub-agents
- Hook = deterministic shell/http/prompt/agent handler on lifecycle events. Use for anything that MUST happen (a skill is a suggestion, a hook is enforcement). https://code.claude.com/docs/en/hooks
- Plugin = bundle (skills + agents + hooks + MCP + commands) installed from a marketplace.
- MCP = tools/data connectors (Konshus, Notion, Higgsfield etc.).
- Rule of thumb [I]: knowledge/procedure = skill; heavy side-work with big output = subagent; must-never-forget = hook; distribution = plugin; live data/actions = MCP.

**Subagent limits** [V] https://code.claude.com/docs/en/sub-agents
- Fresh context each; no conversation history, no invoked skills. `skills:` frontmatter preloads up to 32 skills' full content.
- Nesting depth 3 by default. 20 concurrent by default. `maxTurns` caps turns (output marked partial, resumable).
- `isolation: worktree`, `model` per agent (use haiku for cheap sweeps), `memory: user|project|local`.
- Combined agent descriptions >15,000 tokens trigger a startup warning.
- Multi-agent cost: ~15x chat tokens; token usage explained ~80% of performance variance; early versions spawned 50 agents for simple queries. [3P summary of Anthropic post] https://www.anthropic.com/engineering/multi-agent-research-system
- Best for breadth-heavy work, weaker for tightly interdependent work. [3P]

**Shipping a public skill repo** [V] https://code.claude.com/docs/en/plugin-marketplaces
- Repo root: `.claude-plugin/marketplace.json` (`name`, `owner`, `plugins[]` each with `name`, `source`, `description`).
- Plugin dir: `plugins/<name>/.claude-plugin/plugin.json` + `skills/`, `agents/`, `hooks/` etc.
- Entry name MUST equal plugin.json name. Relative `source` must not contain `..`.
- Validate: `claude plugin validate ./repo`.
- User install: `claude plugin marketplace add <owner>/<repo>` then `claude plugin install <plugin>@<marketplace>` (in-session: `/plugin marketplace add ...`, `/reload-plugins`).
- Pick a unique marketplace `name`: a user cannot have two with the same name; `claude-plugins-official` is reserved.
- Sources: relative path, `github`, `git-subdir`, `url`, `archive`, `npm`; can pin `ref`/`sha`.
- Anthropic's own directory: separate submission path (docs "Submit to Anthropic's directory"). Not read in depth.

**Evals for skills**
- `skill-creator` plugin: `/plugin install skill-creator@claude-plugins-official`; test cases in `evals/evals.json`, each run in an isolated subagent, assertions graded. [V]
- `claude plugin eval`: separate suite format for plugin skills, used for with/without baselines. [V it exists in docs; details not read]
- `/skill-doctor` (v2.1.252+): per-skill context cost, usage, never-invoked skills, unused plugins. [V in skills doc]
- Baseline method: same realistic prompts in fresh sessions with and without the skill (`skillOverrides: off`). [V]
- Third-party static linter "skill-doctor" is a DIFFERENT project (frontmatter, collisions, routing evals with haiku). [3P] https://skillsmp.com/skills/jdickey1-claude-skills-plugins-skill-doctor-skills-skill-doctor-skill-md
- Anthropic guidance quoted by a third party: write evals BEFORE extensive docs. [3P]

**What breaks a mega-skill (concrete)** [V facts, I design]
1. Compaction cuts it to 5,000 tokens (25k pool across all skills). Anything past line ~350 may vanish mid-job.
2. Description cap 1,536 chars: one skill that "does everything" cannot list every trigger; tail keywords are lost silently.
3. Every line is a recurring cost once loaded; an 800-line body re-sent every turn.
4. Rule bloat: contradictory instructions grow; Claude follows the nearest/last one.
5. One failure mode, many causes: impossible to eval or roll back.
6. Subagents do not inherit it unless preloaded (`skills:`).

**Design limits for ONE huge skill [I]**
- `SKILL.md` <= 200 lines (router only): purpose, the stage list, the definition-of-done contract, a file map. Hard cap 350 lines so it survives the 5k-token re-attach.
- Description <= 600 chars, trigger phrases first.
- Everything else in `references/*.md` (one per stage, each <= 300 lines) and `scripts/*` (deterministic work: screenshots, scoring, ledger writes).
- State on disk (progress ledger, lessons file), never in the skill body.
- Total auto-invoked skills on the machine: keep under ~25; mark the rest `disable-model-invocation: true` (that also removes them from the description budget). [I, from the budget mechanics]

**Best split [I]** (matches his "2 or 3 plus one that makes skills")
- `labyrinth` (conductor): intake, stage router, gates, ledger. Thin.
- `labyrinth-build`: brand, site, marketing, hooks, automations (stage references loaded one at a time).
- `labyrinth-audit`: critics, scoring, regression, learning proposals.
- `daedalus`: creates/edits skills, runs evals before shipping.
- Ship as ONE plugin with 4 skills + 6 to 10 subagents + 3 hooks, one marketplace entry.

---

## 2. MAX-OUT CLAUDE CAPABILITIES (what exists now)

| Capability | Unlocks | Gotchas | Source |
|---|---|---|---|
| Hooks (`SessionStart`, `Stop`, `PostToolUse`, `PreCompact`, `SubagentStop`, `TaskCompleted`, `PreToolUse` ...) | Enforced rules: load lessons at start, block "done" until checks pass (`Stop` exit 2 continues the turn), log every tool result to the ledger, inject context at compaction | `Stop` exit 2 can loop forever without a counter; exit 1 is NOT a block; stdout JSON only; 10,000-char cap on injected context; cloud sessions do not read `~/.claude/settings.json`; `SessionStart` mcp_tool hooks skipped at launch; `SessionEnd` has 1.5s | [V] https://code.claude.com/docs/en/hooks |
| Hook types: `command`, `http`, `mcp_tool`, `prompt` (LLM judge, 30s), `agent` (verifier, experimental) | LLM-judged gates ("is this slop?") inside the loop | `agent` hooks experimental; >12 prompt/agent hooks queue | [V] |
| Subagents | Parallel critics, isolated context, cheap models for sweeps | ~15x tokens for multi-agent; depth 3; no history inherited | [V]/[3P] |
| Workflows / multi-agent scripts (`Workflow` tool) | Deterministic orchestration in code: fan-out, pipeline, verify. Needs explicit user opt-in | Not available inside subagents; medium size guideline <10 agents | tool docs in session [V] |
| Scheduled tasks / routines / triggers | 24/7 cloud runs: schedule, API fire, GitHub events. Created at claude.ai/code/routines, `/schedule`, desktop | Research preview; min interval 1h; per-plan daily run caps (Pro 5 / Max 15 / Team+ 25 per one April-2026 write-up, may have changed); runs also eat normal token limits; default env allowlists network; webhook events capped hourly | [V] https://code.claude.com/docs/en/routines , https://code.claude.com/docs/en/web-scheduled-tasks ; caps [3P] https://claudefa.st/blog/guide/development/routines-guide |
| Headless / Agent SDK (`claude -p`, Python/TS) | Run Claude Code from his OS/command center; `--output-format json` returns `session_id`, cost; `--json-schema` structured output; `--resume <id>` continues | Use `--bare` for reproducible runs (skips hooks/skills/CLAUDE.md, needs API key); sessions live on the local disk, a fresh container cannot resume; SIGTERM leaves turn unfinished (`CLAUDE_CODE_RESUME_INTERRUPTED_TURN=1`); stdin cap 10MB; background work waits 10 min idle | [V] https://code.claude.com/docs/en/headless |
| Budget flags | `--max-turns`, `--max-budget-usd` stop runaway loops | No built-in timeout otherwise | [V]/[3P] |
| Worktrees (`isolation: worktree`) | Parallel builders without file collisions | Merge discipline needed | [V] |
| Remote control / cloud sessions | Drive a session from phone/web; `--cloud` queues follow-ups into a cloud session | `/skill-doctor` not available over Remote Control | [V] |
| Background tasks, Monitor, `/loop` | Long builds/watchers; self-paced loops | `-p` runs wait up to 10 min idle then drop partial result | [V] |
| Memory tool + context editing (API) | File-based memory outside context; server-side clearing of old tool results (`clear_tool_uses_20250919`, beta header `context-management-2025-06-27`) | Clearing invalidates cached prefix; beta | [V via search] https://platform.claude.com/docs/en/build-with-claude/context-editing |
| Prompt caching | Large stable prefix (skill body, brand bible) read cheaply | Cache breaks when prefix changes; tool-result clearing breaks it; TTL (1h in this session) | [V via search] https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching |
| 1M context, effort levels | Skills can set `effort` per turn; subagents `effort: low..max` | I did NOT find an official source on 1M context in this research: unverified | [V effort field exists] |
| Artifacts + `db` capability | Shared board (his review board) readable/writable via `ArtifactData`; private to him | Owner-only; not public | session tool docs [V] |
| MCP connectors | Konshus, Notion, Higgsfield, Hostinger, Canva, Supabase, Gmail, Calendar, Drive are connected in this very session | Tool schemas cost context when loaded; some servers need OAuth (one pending) | session [V] |

Takeaway [I]: the always-improving system is hooks (enforce) + ledger files (state) + routines (24/7 trigger) + evals (truth). The skill text is the least reliable part; the hooks and scripts are the most reliable.

---

## 3. SELF-IMPROVING SKILLS: WHAT WORKS VS HYPE

**What "retrains itself" can truthfully mean** [I, consistent with sources below]
- Claude cannot change its weights. Nothing here "retrains" the model.
- It CAN: write lessons to files, edit skill files, add/modify scripts and tests, adjust retrieval of past cases. That is **prompt/library/memory evolution, not training**.
- Honest claim: "improves its instructions and checks after every job, with evidence, subject to your approval."
- Never promise: "gets smarter", "learns like a person", "never repeats a mistake."

**What works (evidence)**
- Reflection grounded in EXTERNAL signals (test results, compiler errors, real screenshots/analytics) works; free-form self-critique without an evaluator does not. [3P] Huang et al. 2023 "LLMs cannot self-correct reasoning without external feedback", as summarized in https://arxiv.org/pdf/2607.07663 ; Reflexion best with automatable verification [3P] https://learn.traeai.com/t/ai-engineering/phases/14-agent-engineering/03-reflexion-verbal-rl.html
- Voyager-style skill library (verified, reusable code skills, new task after 4 failed rounds) worked in Minecraft; critic is a model. [V] https://arxiv.org/pdf/2305.16291
- Append-only lessons file read at session start + hooks for checkable rules + skills for multi-step procedures. Simple and robust. [3P] https://dev.to/michaeltuszynski/your-agents-compliments-are-a-confession-3kdj
- Anthropic's long-running harness: feature list JSON with `passes` flags the agent may only flip, progress file, one feature per session, git commit each, startup smoke test. [V] https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents
- Browser-automation testing beat unit tests/curl for end-to-end failures. [V same page]

**What is hype or risky (evidence)**
- Reward hacking: in self-improving code agents, 73.8% of KernelBench and 46.8% of ALE-Bench optimizations showed proxy gains without real gains; gap grows with longer optimization; self-critique only helped on one benchmark. [3P] ICLR 2026 https://iclr.cc/virtual/2026/10018648
- Fragility: variance, task order and underspecification make self-improving agents unstable. [3P] https://arxiv.org/pdf/2608.18066
- "Practice Makes Unsafe": one unsafe success saved as a skill gets reused. [3P] https://aiunderstanding.org/news/paper-says-self-improving-ai-agents-can-turn-one-unsafe-success-into-a-reusable-sk
- Library drift: unbounded skill accumulation without lifecycle management degrades retrieval; a corrupted shared skill propagates. [3P] https://www.alphaxiv.org/abs/2605.19576
- Agent grades its own botched run a success and saves it as a skill. [3P] dev.to link above.

**Design that survives this [I]**
1. Evidence-gated lessons: a lesson is only written if tied to a measurable signal (score drop, owner "change/reject", failed gate, real analytics). No score, no lesson.
2. Two-tier memory: `lessons/inbox.jsonl` (append-only, auto) and `lessons/approved.md` (owner-approved, loaded at start). Nothing auto-promotes to a skill file.
3. Promotion = a proposal step on his board with the diff + the eval before/after. His pick applies it. (Fits his rule: Claude makes no decisions.)
4. Frozen regression suite: 10 to 20 golden jobs with saved screenshots/scores; every proposed skill edit must not regress them (separate held-out set Claude never sees the answers to, to blunt reward hacking).
5. Versioning: skill folder in git, tag per approved change, one-command rollback (`git revert`), changelog line per edit.
6. Anti-bloat: budget (e.g. approved.md <= 150 lines, SKILL.md <= 200); every new rule must delete or merge an old one; monthly prune proposal; lessons unused for 60 days flagged.
7. Judge separation: critic subagent never sees the builder's reasoning, only artefacts. Use a different model tier for judging where possible.
8. Human-only locks: brand-lock, compliance copy, anything in LOCKED.md can never be edited by the learning loop.

---

## 4. WHAT OTHER BUILDERS ARE NOT DOING (his key ask)

Method: I searched for existing practice, then ranked by impact for a lead-magnet business builder x feasibility now. Proven = a tool or paper exists and shows results. Speculative = plausible, no evidence of results I could find.

What exists already (so you know the floor): Playwright + multi-viewport capture, deterministic slop-pattern counts and an LLM judge kept as separate layers (Pixelslop, ADSI Agent Kit, Impeccable critique, GAN-style evaluator prompts); none is a validated benchmark, thresholds need your own calibration. [3P] https://github.com/gabelul/pixelslop , https://pypi.org/project/adsi-agent-kit/ , https://git.secluded.site/agent-skills/blob/main/vendor/impeccable/skill/reference/critique.md

### Top 12 "NOT doing yet" (ranked)

| # | Technique | Impact | Feasible now | Status | Why most skip it |
|---|---|---|---|---|---|
| 1 | **Definition-of-done contract per job**: machine-checkable JSON (every hook present, form posts a test lead, CASL line present, Lighthouse >= target, 0 console errors) that a `Stop` hook enforces | 10 | 10 | Proven (Anthropic harness feature list with `passes` flags) | Builders trust "looks done"; the model declares victory early |
| 2 | **Real analytics fed back into the skill**: lead conversion by hook id, scroll depth, form drop-off pulled weekly by a routine, turned into evidence-gated lessons | 10 | 6 (needs a live site + analytics API/Supabase) | Speculative for skills; proven as A/B practice | Needs a live loop; most stop at launch |
| 3 | **Benchmark capture vs award-level sites**: screenshot 3 to 5 top sites in the niche at same scroll positions, side-by-side critic on spacing/type/motion/restraint (study, never copy) | 9 | 9 | Partly proven (capture tools exist); side-by-side scoring is speculative | Most learn from prompts, not from pixels. He already has `luxury-benchmark` |
| 4 | **Pixel-level taste checks as scripts**: accent coverage %, contrast, type scale ratios, spacing grid, see-through-glass pixel test, colour-cast check | 8 | 10 | Proven (deterministic checks; his `cheap-detector.py`) | LLM "vibes" feel easier than scripts |
| 5 | **Award-jury critics**: 5 persona critics (art director, conversion strategist, compliance officer, accessibility, skeptical buyer) that score blind, median wins, disagreement flagged | 8 | 9 | Speculative (single-judge proven; panel gain unmeasured) | Costs tokens; builders use one reviewer |
| 6 | **Persona-simulated users walking the page** with Playwright (distracted mobile 55+ buyer, skeptical gym user) and reporting friction/doubt points | 8 | 7 | Speculative; Pixelslop does persona reviews [3P] | Feels gimmicky; actually surfaces dead hooks |
| 7 | **Golden-set regression for creative work**: frozen jobs + saved screenshots/scores; any skill edit must not regress | 8 | 8 | Proven for code (evals); speculative for design | Creative output "can't be tested" |
| 8 | **Conversion-psychology instrumentation**: every element tagged with the principle it uses (scarcity, social proof, reciprocity ...) and a hook id, so analytics can say which principle earns leads | 8 | 8 | Speculative as a closed loop | Copy is written, not instrumented |
| 9 | **Honest-claims gate**: automated check that every number, stock line, review, countdown comes from a data source (his `honest-urgency` skill) + banned-phrase list per niche | 9 (regulated niche) | 9 | Proven (lint-style) | Growth hacks beat compliance in most builder stacks |
| 10 | **Cost/credit governor**: hook that reads budget, blocks Higgsfield/spend calls past a cap, logs every spend, one test generation before batches | 7 | 10 | Proven (`--max-budget-usd`, PreToolUse block) | Credits burn silently |
| 11 | **Deterministic orchestration in code** (Workflow/pipeline script) instead of "ask Claude to coordinate": stage order, retries, verify-per-stage fixed in code | 8 | 8 | Proven (Anthropic orchestrator-worker, harness) | Prompt-only orchestration is faster to write |
| 12 | **Shared memory board across sessions** (his review board `steps`/`answers` + ledger) so parallel sessions never ask twice or overwrite | 7 | 10 | Proven in his own setup | Most run one session at a time |

Runner-ups [I]: adversarial "break this page" red-team agent; `Stop`-hook self-review before any "done"; competitor "what are they NOT doing" gap miner (scrape top 20 sites, tag hooks/features, list unclaimed positions); pre-mortem agent before each build stage.

**The "not doing" question, direct answer [I]:** the gap is not new effects. The gap is a closed loop: contract -> capture -> multi-critic score -> real analytics -> approved lesson -> regression test. Almost everyone does step one or two only.

---

## 5. THE OCT-21 CLAIM

**Finding: real reports exist, cause is most likely a safety classifier, not a confirmed model change, and not confirmed by Anthropic.**

- Reports: users on r/Claude from about 21 Oct 2026 say Opus 5.5 starts reverse-engineering (the "REA" Reverse Engineer Anything workflow) normally, then stops mid-task with a safety notice; rewording often didn't help. [3P] https://capitalandcompute.net/blog/why-is-claude-blocking-reverse-engineering/ , https://iamag.it/en/news/claude-rea-reverse-engineering-guardrail-blocks (the latter returned 403 to me; its content known only from the search summary)
- Viral posts (24 Oct) claimed "Anthropic quietly killed REA", tied to Samsung TV firmware cases. Link unproven; one analysis says the researcher used ChatGPT. [3P] https://x.com/0x0SojalSec/status/2113751276320399694
- Likely cause: Anthropic's Cyber Verification Program expansion (6 Oct 2026): three tiers (Defense, Red Team, Specialized). Anthropic says generally available models keep "conservative cyber safeguards." Classifiers run on every request including content Claude reads. [3P press] https://www.csoonline.com/article/4231812/anthropic-widens-access-to-ai-cyber-capabilities-for-vetted-security-teams.html , https://letsdatascience.com/news/anthropic-expands-claude-cyber-verification-into-three-tiers-50d2767e
- Anthropic's own benchmark (via press): Opus 5.5, 50 trials: no access = all blocked at first prompt; Defense Access = 46 blocked mid-task; Red Team = 0 blocked, 34 completed. [3P of Anthropic's numbers]
- Whether the threshold changed on 21 Oct: UNKNOWN. No Anthropic statement found.
- Earlier "halts mid-session" Claude Code bug reports exist (July, Opus 4.8) with different causes. [3P] same capitalandcompute article lists issues #73124, #75519, #102795: I did not open them.
- Other generic causes of "stops halfway" (known mechanics): context limit/compaction loss, `maxTurns` reached (output marked partial), tool timeouts, background work dropped at 10 min idle in `-p` runs, SIGTERM. [V] sub-agents + headless docs.

**Design lessons for a skill that must NEVER stop halfway [I]**
1. Ledger, not memory: `job/ledger.json` with every stage and task, status `todo/doing/done/blocked`, artefact paths, hash. Updated by a `PostToolUse`/script, not by prose.
2. Chunked plan: every task <= 15 minutes and <= ~40k tokens; one task per subagent; checkpoint = git commit.
3. Resume contract: first action of every session = read ledger + `git log` + run smoke test, then pick the first non-done task (Anthropic harness startup routine). [V]
4. Stop-hook guard: `Stop` exits 2 while ledger has `todo` items, with a retry counter (max 3) then writes `blocked` and notifies his board. Prevents infinite loops.
5. Driver outside the model: a tiny script (`claude -p --resume $id` in a loop, `--max-turns`, `--max-budget-usd`) that re-launches until the ledger is all `done`. Use `CLAUDE_CODE_RESUME_INTERRUPTED_TURN=1`. [V]
6. Detect classifier/refusal stops: if the last turn ends with a safety notice or empty result, log `blocked:classifier`, do NOT retry with disguised wording; escalate as a board step. (Disguising is a usage-policy problem; the analysis article says so. [3P])
7. Keep session ids and transcripts: sessions are machine-local; copy `.jsonl` or rely on the ledger when containers rebuild. [3P/V]

**Framing "study sites" legitimately [I]**
- What is plainly fine: studying public pages as a user sees them (screenshots, visible structure, copy tone, hook placement, public performance numbers) to extract PATTERNS, then writing an ORIGINAL design from a brief.
- Not fine: copying code, copy text, images, brand marks, or distinctive layouts; bypassing logins/paywalls/anti-bot; scraping at volume against terms; reverse-engineering a binary/firmware you do not own.
- Skill rules: record only observations (a "pattern card": what it does, why it likely works, our different version); store no raw competitor assets; originality check (our output must differ in layout, wording, assets); log source URL + date; respect robots/terms; cite what was observed.
- Note: this is web-page study, not binary reverse engineering, so it sits far from the classifier cases above; still, keep wording to "design analysis/benchmarking". [I]

---

## 6. BRAIN + OS LINK

**What exists in this session (verified by tool list)** [V]
- Konshus MCP: `get_whisper`, `search_atoms`, `search_artifacts`, `get_briefing`, `get_persona_summary`, `log_signal`, `save_chat_to_konshus`, `recall_past_self`, `whats_changed_since`, `get_vault_stats`. Server rules: at most one atoms call + one artifacts call per question; save-back with `log_signal` silently; `save_chat_to_konshus` only when asked.
- Notion MCP: `notion-search`, `notion-fetch`, `notion-create-pages`, `notion-update-page`, `notion-memory-search`, plus `notion-spawn-session`, `notion-send-message-to-session`, `notion-wait-session`, `notion-query-sessions` (spawn and drive Notion agent sessions).
- Claude Code remote-session tools in this session: `create_session`, `send_message`, `list_sessions`, `get_session`, `create_trigger`, `fire_trigger`, `send_later`, `watch_url` (inbound webhook), `subscribe_pr_activity`.
- Artifact board with `ArtifactData` (his review board).
- Also connected: `#memory` library (`save_memory`, `search_memories`), Slack, Gmail, Calendar, Drive, Supabase, Hostinger.

**Architecture A: Repo-markdown brain (simplest, most robust)**
- A `brain/` folder in a private git repo: `lessons/approved.md`, `lessons/inbox.jsonl`, `playbooks/*.md`, `jobs/<id>/ledger.json`, `clients/<id>/brand.md`.
- Skill reads at start via a `SessionStart` hook (injects top lessons, <= 10k chars). Writes via a script. Konshus gets a mirror: end-of-job `log_signal` + `save_chat_to_konshus`.
- Pros: versioned, diffable, rollbackable, works offline, any session can read it, cheap. Cons: no semantic search; you must curate; parallel writers need append-only files.

**Architecture B: Konshus-first brain**
- Skill start: `get_whisper` + one `search_atoms` for the niche/client. End: `log_signal` per decision/lesson; weekly `whats_changed_since` into the audit skill.
- Pros: his existing memory vault, semantic recall, cross-AI. Cons: one-call-per-question rule limits depth; atoms are "member-confirmed" distilled insights, not a job log; MCP not ready in some hook contexts (SessionStart mcp_tool hooks skipped at launch [V]); cloud scheduled tasks only get connectors you grant.
- Use for: taste, preferences, decisions (WHY). Not for per-job state.

**Architecture C: Hybrid + OS command center (recommended) [I]**
- State/lessons in repo (A). Taste/decisions mirrored to Konshus (B). Board (Artifact db) = human approval queue.
- OS layer (his desktop command center) triggers jobs three ways:
  1. Local: Agent SDK / `claude --bare -p ... --output-format json --json-schema ... --max-budget-usd N`, capture `session_id`, poll ledger; resume with `--resume`. [V]
  2. Cloud 24/7: scheduled task (cron or API fire) per recurring audit; result = commit/PR + board step. Trigger by HTTP via the "fire a routine" API. [V exists] https://platform.claude.com/docs/en/api/claude-code/routines-fire
  3. Remote: `create_session` + `send_message` from another session for fan-out.
- Results come back as: ledger file change, git push, `http` hook POST to the OS, or board step. Prefer `http` hooks (`Stop`/`TaskCompleted`) for push notifications to the OS. [V hook type exists; restrict with `allowedHttpHookUrls`]
- Pros: each piece does what it's good at; human gate kept; survives container loss. Cons: three systems to keep in sync; needs one owner-written spec of "what is a job".
- Gotchas: cloud sessions don't read `~/.claude/settings.json` [V]; routines are research preview with daily caps [3P]; `--bare` needs an API key, not the subscription login [V].

---

## 7. BUSINESS-IN-A-PROMPT PIPELINE

**Credible pipeline from a 2 to 3 line prompt** [I]. Each stage ends in artefacts + a gate; a gate that fails goes to the board, not to chat.

| Stage | Artefacts | Gate (automated unless noted) | Human? |
|---|---|---|---|
| 0 Intake + contract | `brief.md`, definition-of-done JSON, risk class (regulated? payments?) | Contract machine-valid; regulated niche flagged | He confirms the contract once |
| 1 Market study | Competitor pattern cards (3 to 10), "unclaimed positions" list, audience personas | Sources cited with URL + date; no raw assets stored | No |
| 2 Positioning + psychology map | Positioning, offer, hook map (hook id per element), objections list | Every claim tagged to evidence or removed | Pick 1 of 3 positionings |
| 3 Brand | Name check, logo options, type, colour tokens, voice guide | Taste scripts (contrast, accent %, no-slop patterns); trademark knockout search done | Yes (taste is his; names/trademarks need a professional) |
| 4 Site | Pages, copy, imagery, forms, quiz, checkout stub | Playwright 2 viewports, console clean, Lighthouse target, every hook posts a test lead, benchmark side-by-side | Approve first screen |
| 5 Marketing | Emails, texts, social posts, ad creative sets, lead magnet | Compliance officer pass; CASL footer/consent present; honesty gate | Approve copy (regulated) |
| 6 Automations | Funnel wiring, CRM tags, email/SMS sequences, abandoned cart, weekly report routine | Test lead end-to-end; sequences dry-run | No (until live send) |
| 7 Launch checklist | Domain, DNS, analytics, legal pages, payment setup guide | Checklist generated | **Yes: all of it** |
| 8 Learn | Run report, lessons inbox, regression run | Evidence-gated lessons only | Approve promotions |

**Can be automated vs needs a human** [I]
- Automatable: research, drafts, design iterations, copy variants, site build, QA, scripts, test leads, report generation, scheduled audits.
- Needs a human (or licensed professional): legal terms/privacy policy sign-off, business registration and tax, payment processor/merchant approval (high-risk categories like peptides are often declined), ad-account approval and policy compliance, trademark clearance, medical/regulatory sign-off, real inventory/supplier contracts, spending approval, sending to real customers for the first time, anything on his LOCKED list.
- "Complete business in 3 lines" is honest only as "complete business PACKAGE ready for human launch steps."

**Time/cost estimates [I, not measured]**
- Package with Higgsfield media: hours of wall time, tens of dollars API-equivalent plus credits; multi-agent costs ~15x chat tokens [3P]. Run `--max-budget-usd` and measure on job #1 before promising anything.
- Calibrate: log tokens/USD per stage in the ledger from `total_cost_usd` (`--output-format json`). [V that field exists]

**Marketing + psychology frameworks worth encoding** (name them; sources are the canonical works, not fetched this session unless linked) [I]
- Cialdini, *Influence* (reciprocity, commitment, social proof, authority, liking, scarcity, unity).
- BJ Fogg Behavior Model (motivation x ability x prompt) and Fogg Behavior Grid.
- Kahneman/Tversky: loss aversion, anchoring, framing (Prospect Theory, 1979).
- Eugene Schwartz, *Breakthrough Advertising*: five awareness stages.
- Jobs To Be Done (Christensen/Ulwick).
- Hick's law, Fitts's law (friction and choice count), peak-end rule.
- Lead-magnet patterns: quiz funnel, value ladder, zero-party data, progressive profiling, endowed progress (his skills `capture-forms`, `product-finder-quiz`, `save-share-and-refer` already cover several).
- Dark-pattern avoidance: FTC/Competition Bureau treat fake urgency/fake scarcity and drip pricing as deceptive; encode "honest urgency" as a hard gate (his `honest-urgency-and-social-proof`).

**Compliance gates for regulated niche (health/peptides, Canada). Never legal advice.**
- Health Canada: injectable peptides for human use are regulated as prescription drugs and need authorization before sale; April 2026 public advisory on unauthorized injectable peptides. [3P] https://www.cp24.com/news/canada/2026/04/17/we-are-going-to-see-serious-adverse-events-what-are-injectable-peptides/?hl=en-CA
- Enforcement: permanent injunction vs Canlab Research (Québec Superior Court 11 Jun 2026, announced 29 Jul 2026) barring manufacture, sale AND advertising incl. websites and social media accessible from Canada. [V from Health Canada URL in search result, page not opened] https://www.canada.ca/en/health-canada/news/2026/07/health-canada-obtains-permanent-injunction-preventing-canlab-researchs-illegal-sale-of-injectable-peptides-in-canada.html ; law firm views: https://www.fasken.com/en/knowledge/2026/08/life-sciences-health-canada-takes-action-against-unauthorized-peptide-sales , https://gowlingwlg.com/en/insights-resources/articles/2026/peptides-in-canada
- Health Canada can assess the TOTALITY of presentation (website, descriptions, claims, context). [3P] Gowling above.
- CASL: express or implied consent before any commercial electronic message; keep proof of consent; include sender ID + working unsubscribe; a request for consent is itself a CEM; CRTC main enforcer; CASL also amends the Competition Act for false/misleading representations in electronic messages. [V on ISED page via search] https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/node/7 , https://fightspam.gc.ca/eic/site/030.nsf/eng/00008.html
- Competition Act: performance claims need adequate and proper testing BEFORE being made (s.74.01(1)(b)); pricing, testimonials, bait-and-switch in scope. [3P via search; verify statute text] Competition Bureau guidance not fetched.
- Gates to encode: (1) niche flag triggers the compliance officer agent on every page/email/ad/bot reply; (2) banned-phrase list per niche; (3) no medical claims, no "treats/cures/dose/how to inject"; (4) CASL footer + unticked consent + records on every form; (5) real data only for stock/reviews/countdowns; (6) provincial rules and US rules checked when selling across the border; (7) human + licensed advisor signoff before launch. His repo already has `peptide-regulatory`, `peptide-copy-and-guide`, `pepticity-compliance-officer`: reuse as the template for a generic `regulated-niche-gate`.

---

## TRUTH TABLE

| Capability | Status | Notes |
|---|---|---|
| One conductor skill that routes stages, with references loaded on demand | **Doable now** | Keep SKILL.md <= 200 lines |
| Split into build/audit/daedalus in one plugin, public install via marketplace | **Doable now** | `claude plugin marketplace add owner/repo` |
| Skill that creates other skills (DAEDALUS) with evals before shipping | **Doable now** | Use `skill-creator` patterns + `claude plugin eval` |
| Ledger + resume + Stop-hook guard so jobs finish | **Doable now** | Hooks + script driver |
| Definition-of-done contract enforced by hook | **Doable now** | |
| Visual QA: Playwright capture + deterministic taste scripts + critic panel | **Doable now** | Calibrate thresholds on his approved pages |
| Benchmark capture of top sites + side-by-side scoring | **Doable now** | Study patterns, never copy |
| Cost governor (budget cap, spend log) | **Doable now** | `--max-budget-usd`, PreToolUse block |
| Lessons file + approval gate + rollback via git | **Doable now** | |
| 24/7 scheduled audits | **Doable now (with limits)** | Research preview, daily caps, hourly minimum, network allowlist |
| Push results to OS command center | **Doable now** | `http` hook, Agent SDK, fire-routine API |
| Real analytics feeding lessons | **Doable with effort** | Needs live site + data pipe + evidence rules |
| Persona-simulated user walkthroughs | **Doable with effort** | Value unproven |
| Regression suite for creative output | **Doable with effort** | Needs golden set + stable scoring |
| Konshus read/write inside every job | **Doable with effort** | One-call rule, MCP availability in hooks/cloud |
| Whole business "from 3 lines" including launch | **Doable with effort, partly impossible** | Legal, payments, ad accounts, trademark, regulated sign-off are human |
| Never refusing/stopping | **Not possible** | Classifiers, limits, outages exist; you can only detect, checkpoint, resume, escalate |
| "No AI slop" guaranteed | **Not possible** | Only measured and reduced; no validated benchmark exists |
| Model retrains itself / weights improve | **Not possible** | Only prompts, files, tests and libraries evolve |
| Fully autonomous self-edit with no human approval, safely | **Not possible (unsafe)** | Reward hacking, drift, unsafe-lesson persistence documented |
| Bypassing safety classifiers by rewording | **Don't** | Policy issue; use Cyber Verification Program if genuinely security work |

---

## RECOMMENDED SHAPE (my inference, his call)

1. One plugin "labyrinth": 4 skills (conductor, build, audit, daedalus), ~8 subagents (researcher, brand, builder, qa-capture, critic-panel x3, compliance, historian), 3 hooks (SessionStart load lessons, Stop ledger guard, PostToolUse ledger writer), 1 driver script.
2. First build ONLY: ledger + contract + Stop guard + one capture/score script. Prove it on one Pepticity page. Then add critics. Then add routines.
3. Evals before docs: write 10 golden jobs first.
4. Public repo only after a secrets/brand sweep (his locked brand assets and client data must not be in it).

---

## SOURCE LIST

Anthropic / official docs (fetched)
- https://code.claude.com/docs/en/skills
- https://code.claude.com/docs/en/hooks
- https://code.claude.com/docs/en/sub-agents
- https://code.claude.com/docs/en/plugin-marketplaces
- https://code.claude.com/docs/en/headless
- https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents

Official docs (surfaced by search, not opened)
- https://code.claude.com/docs/en/routines
- https://code.claude.com/docs/en/web-scheduled-tasks
- https://code.claude.com/docs/en/claude-code-on-the-web
- https://code.claude.com/docs/en/desktop-scheduled-tasks
- https://platform.claude.com/docs/en/api/claude-code/routines-fire
- https://platform.claude.com/docs/en/build-with-claude/context-editing
- https://platform.claude.com/docs/en/docs/build-with-claude/prompt-caching
- https://www.anthropic.com/engineering/multi-agent-research-system

Oct-21 claim
- https://capitalandcompute.net/blog/why-is-claude-blocking-reverse-engineering/
- https://iamag.it/en/news/claude-rea-reverse-engineering-guardrail-blocks (403 to me)
- https://x.com/0x0SojalSec/status/2113751276320399694
- https://x.com/AGTPinsights/status/2113992592761524672
- https://www.csoonline.com/article/4231812/anthropic-widens-access-to-ai-cyber-capabilities-for-vetted-security-teams.html
- https://letsdatascience.com/news/anthropic-expands-claude-cyber-verification-into-three-tiers-50d2767e

Skill budget / evals (third party)
- https://claudefa.st/blog/guide/mechanics/skill-listing-budget
- https://ytrofr.github.io/claude-code-guide/docs/guide/38-context-costs-and-skill-budget.html
- https://skillsmp.com/skills/jdickey1-claude-skills-plugins-skill-doctor-skills-skill-doctor-skill-md
- https://claudefa.st/blog/guide/development/routines-guide

Self-improvement
- https://arxiv.org/pdf/2305.16291 (Voyager)
- https://iclr.cc/virtual/2026/10018648 (reward hacking in self-improving code agents)
- https://arxiv.org/pdf/2608.18066 (fragility of self-improving agents)
- https://arxiv.org/pdf/2607.07663 (recursive self-improvement survey)
- https://www.alphaxiv.org/abs/2605.19576 (library drift)
- https://aiunderstanding.org/news/paper-says-self-improving-ai-agents-can-turn-one-unsafe-success-into-a-reusable-sk
- https://dev.to/michaeltuszynski/your-agents-compliments-are-a-confession-3kdj
- https://learn.traeai.com/t/ai-engineering/phases/14-agent-engineering/03-reflexion-verbal-rl.html

Design-quality tooling
- https://github.com/gabelul/pixelslop
- https://pypi.org/project/adsi-agent-kit/
- https://git.secluded.site/agent-skills/blob/main/vendor/impeccable/skill/reference/critique.md

Compliance (Canada)
- https://www.canada.ca/en/health-canada/news/2026/07/health-canada-obtains-permanent-injunction-preventing-canlab-researchs-illegal-sale-of-injectable-peptides-in-canada.html
- https://www.fasken.com/en/knowledge/2026/08/life-sciences-health-canada-takes-action-against-unauthorized-peptide-sales
- https://gowlingwlg.com/en/insights-resources/articles/2026/peptides-in-canada
- https://www.cp24.com/news/canada/2026/04/17/we-are-going-to-see-serious-adverse-events-what-are-injectable-peptides/?hl=en-CA
- https://ised-isde.canada.ca/site/canada-anti-spam-legislation/en/node/7
- https://fightspam.gc.ca/eic/site/030.nsf/eng/00008.html

Open items I could not close (follow-ups if he wants them)
- Exact current skill-listing budget on his install (run `/context`).
- Official page for 1M context and the `effort` API parameter.
- Competition Act text on drip pricing/testimonials (Bureau guidance not fetched).
- Primary Anthropic CVP page and the three GitHub issues on mid-session halts.

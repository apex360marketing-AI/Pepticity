# CC-SDD SPEC-DRIVEN DEVELOPMENT SKILLS (github.com/gotalab/cc-sdd), bundled for ChatGPT

Spec first: requirements, then design, then tasks, then build. Use for any bigger build.

## Index
- kiro-debug
- kiro-discovery
- kiro-impl
- kiro-review
- kiro-spec-batch
- kiro-spec-design
- kiro-spec-init
- kiro-spec-quick
- kiro-spec-requirements
- kiro-spec-status
- kiro-spec-tasks
- kiro-steering-custom
- kiro-steering
- kiro-validate-design
- kiro-validate-gap
- kiro-validate-impl
- kiro-verify-completion


---

# SKILL: kiro-debug

---
name: kiro-debug
description: Investigate implementation failures using root-cause-first debugging. Use when an implementer is blocked, verification fails, or repeated remediation does not converge.
allowed-tools: Read, Bash, Grep, Glob, WebSearch, WebFetch
argument-hint: <failure-summary>
---

# kiro-debug

## Overview

This skill is for fresh-context root cause investigation. It combines local evidence, runtime/config inspection, and external documentation or issue research when available. It is not a patch generator for guess-first debugging.

## When to Use

- Implementer reports `BLOCKED`
- Reviewer rejection repeats after remediation
- Validation fails unexpectedly
- A task appears to conflict with runtime or platform reality
- The same failure survives more than one attempted fix

Do not use this skill to speculate about fixes before gathering evidence.

## Inputs

Provide:
- Exact failure symptom or blocker statement
- Error messages, stack trace, and failing command output
- Current `git diff` or summary of uncommitted failed changes
- Task brief: what was being built
- Reviewer feedback, if the failure came from review rejection
- Relevant spec file paths (`requirements.md`, `design.md`)
- Relevant requirement/design section numbers
- Relevant `## Implementation Notes`
- Runtime or environment constraints already known

## Outputs

Return:
- `ROOT_CAUSE`
- `CATEGORY`
- `FIX_PLAN`
- `VERIFICATION`
- `NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN`
- `CONFIDENCE: HIGH | MEDIUM | LOW`
- `NOTES`

Use the language specified in `spec.json`.

## Method

### 1. Read the Error Carefully
Extract:
- Exact error text
- Stack trace or failure location
- The command that produced the failure
- Whether the failure is deterministic or intermittent

### 2. Inspect Local Runtime and Repository State
Inspect the repository for local evidence:
- `package.json`, `pyproject.toml`, `go.mod`, `Makefile`, `README*`
- Build config
- `tsconfig` or equivalent language/runtime config
- Runtime-specific config
- Dependency versions and scripts
- Relevant changed files from `git diff`

### 3. Search the Web if Available
If web access is available, search:
- The exact error message
- The technology + symptom combination
- Official documentation
- Version-specific issue trackers or migration notes

Prefer:
- Official docs
- Official repos/issues
- Version-specific references
- Runtime-specific documentation

### 4. Classify the Root Cause
Use one category:
- `MISSING_DEPENDENCY`
- `RUNTIME_MISMATCH`
- `MODULE_FORMAT`
- `NATIVE_ABI`
- `CONFIG_GAP`
- `LOGIC_ERROR`
- `TASK_ORDERING_PROBLEM`
- `TASK_DECOMPOSITION_PROBLEM`
- `SPEC_CONFLICT`
- `EXTERNAL_DEPENDENCY`

### 5. Determine the Smallest Safe Next Action
Decide whether the issue can be fixed inside this repo by:
- Editing files
- Adjusting configuration
- Adding or correcting dependencies
- Restructuring code

Use `NEXT_ACTION: RETRY_TASK` when the issue is repo-fixable inside the current approved task plan.

### 6. Determine Whether the Task Plan Is Still Valid
Decide whether the current approved task plan is still safe to execute as written.

Prefer `NEXT_ACTION: STOP_FOR_HUMAN` when:
- A missing prerequisite task should exist before this one
- The current task is ordered incorrectly relative to unfinished work
- The current task boundary is wrong and should be split or merged
- The task is too large or ambiguous to fix safely inside the current implementation loop

Use `NEXT_ACTION: BLOCK_TASK` only when the current task should stop but the rest of the queue can still proceed safely.

Do not propose a brute-force code fix as a substitute for revising `tasks.md` or the approved plan.

## Critical Rule

Do not propose a multi-fix shotgun plan. Identify the root cause first, then produce the smallest plausible fix plan. If the true problem is a spec conflict or architecture problem, say so directly.

## Stop / Escalate

Use `NEXT_ACTION: STOP_FOR_HUMAN` when the blocker genuinely requires:
- Human product/requirements decision
- External credentials or inaccessible services
- Hardware or unavailable external systems
- Re-scoping due to spec/platform conflict

If the issue is fixable by repo changes inside the current task plan, do not escalate prematurely.

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “This probably just needs a quick patch” | Patch-first debugging creates rework. |
| “Let’s try a few fixes” | Multi-fix guessing hides root cause. |
| “The spec is probably wrong, I’ll adapt it” | Spec conflicts must be surfaced explicitly. |
| “The docs search is optional” | For runtime/dependency issues, docs and version issues often contain the shortest path to root cause. |

## Output Format

```md
## Debug Report
- ROOT_CAUSE: <1-2 sentence root cause>
- CATEGORY: MISSING_DEPENDENCY | RUNTIME_MISMATCH | MODULE_FORMAT | NATIVE_ABI | CONFIG_GAP | LOGIC_ERROR | TASK_ORDERING_PROBLEM | TASK_DECOMPOSITION_PROBLEM | SPEC_CONFLICT | EXTERNAL_DEPENDENCY
- FIX_PLAN:
  1. <specific repo-fixable action>
  2. <specific repo-fixable action>
- VERIFICATION: <command(s) to confirm the fix>
- NEXT_ACTION: RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN
- CONFIDENCE: HIGH | MEDIUM | LOW
- NOTES: <context the next implementer should know>
```



---

# SKILL: kiro-discovery

---
name: kiro-discovery
description: Entry point for new work. Determines the best action path or work decomposition (update existing spec, create new spec, mixed decomposition, or no spec needed) and refines ideas through structured dialogue.
disable-model-invocation: true
allowed-tools: Read, Write, Glob, Grep, Agent, WebSearch, WebFetch, AskUserQuestion
argument-hint: <idea-or-request>
---

# kiro-discovery Skill

## Core Mission
- **Success Criteria**:
  - Correct action path or work decomposition identified based on existing project state
  - User's intent clarified through questions, not assumptions
  - Output is an actionable next step (not just a description)

## Execution Steps

### Step 1: Lightweight Scan

Gather **only metadata** to determine the action path. Do NOT read full file contents yet.

- **Specs inventory**: Glob `{{KIRO_DIR}}/specs/*/spec.json`, read each spec.json for `name`, `phase` fields and `approvals` status. Note feature names and their current status.
- **Steering existence**: Check which files exist in `{{KIRO_DIR}}/steering/` (product.md, tech.md, structure.md, roadmap.md). Do NOT read their contents yet.
- **Roadmap check**: If `{{KIRO_DIR}}/steering/roadmap.md` exists, read it. This contains project-level context (approach, scope, constraints, spec list) from a previous discovery session. Use it to restore project context.
- **Top-level structure**: List the project root directory to note key directories and files. Do NOT recurse into subdirectories.

This step should consume minimal context. If `specs/` is empty and no steering exists, note "greenfield project" and move to Step 2.

### Step 2: Determine Action Path

Based on the user's request and the metadata from Step 1, determine which path applies:

**Path A: Existing spec covers this**
- The request is an extension, enhancement, or fix within an existing spec's domain
- Every meaningful part of the request fits that same spec boundary
- Any remaining small follow-up work can be handled directly without creating a new spec
- Skip remaining steps

**Path B: No spec needed**
- The request is a bug fix, config change, simple refactor, or trivial addition
- No meaningful part of the request needs a new or updated spec boundary
- The request does not need to update an existing spec either
- Skip remaining steps

**Path C: New single-scope feature**
- The request is new, doesn't overlap with existing specs, and fits in one spec

**Path D: Multi-scope decomposition needed**
- The request spans multiple domains or would produce 20+ tasks in a single spec

**Path E: Mixed decomposition**
- The request contains a mix of: existing spec extensions, one or more new spec candidates, and optional direct-implementation work
- Use this path only when at least one genuinely new spec boundary is needed

For Path C/D/E, present the determined path (or mixed decomposition) to the user and confirm before proceeding.
For Path A/B, recommend the next action and stop.

### Step 3: Deep Context Loading

**Only for Path C, D, and E.** Now load the context needed for discovery.

**In main context** (essential for dialogue with user):
- **Steering documents**: Read product.md and tech.md (if they exist) for project goals, constraints, and tech stack
- **Relevant specs**: If the request is adjacent to an existing spec, read that spec's requirements.md to understand boundaries and avoid overlap

**Delegate to subagent via Agent tool** (keeps exploration out of main context):
- **Codebase exploration**: Dispatch a subagent to explore the codebase and return a structured summary. Example prompt: "Explore this project's codebase. Summarize: (1) tech stack and frameworks, (2) directory structure and key modules, (3) patterns and conventions used, (4) areas relevant to [user's request]. Return a summary under 200 lines."
- The subagent uses Read/Glob/Grep to explore, then returns findings. Only the summary enters the main context.
- For Path D/E, also ask the subagent to identify natural domain boundaries, existing module separation, and which areas look like existing-spec extensions vs new boundaries.
- Skip subagent dispatch for small/obvious requests where the top-level directory listing from Step 1 is sufficient.

**Context budget**: Keep total content loaded into main context under ~500 lines. The subagent handles the heavy exploration.

### Step 4: Understand the Idea

Ask clarifying questions **sequentially** (not all at once), prioritizing boundary discovery over feature detail:

1. **Who and why**: Who has the problem? What pain does it cause?
2. **Desired outcome**: What should be true when this is done?
3. **Boundary candidates**: What are the natural responsibility seams in this work? Where could this be split so implementation can proceed independently?
4. **Out of boundary**: What should this spec explicitly NOT own, even if related?
5. **Existing vs new**: Which parts seem like extensions to existing specs, and which parts look like genuinely new boundaries?
6. **Upstream / downstream**: What existing systems, specs, or components does this depend on? What future work is likely to depend on this?
7. **Constraints**: Are there technology, timeline, or compatibility constraints?

Ask only questions whose answers you cannot infer from the context already loaded. Skip questions that steering documents already answer. If the user already provided a clear description, skip to Step 5.
The goal is NOT to assign final owners yet. The goal is to discover the cleanest responsibility boundaries that can later become specs, tasks, and review scopes.

### Step 5: Propose Approaches

Propose **2-3 concrete approaches** with trade-offs:

For each approach:
- **Approach name**: One-line summary
- **How it works**: 2-3 sentences on the technical approach
- **Pros**: What makes this approach good
- **Cons**: What are the risks or downsides
- **Scope estimate**: Rough complexity (small / medium / large)

If technical research is needed (unfamiliar framework, library evaluation), dispatch a subagent via Agent tool. Example prompt: "Research [topic]: compare options, check latest versions, note known issues. Return a summary of findings with recommendation." The subagent uses WebSearch/WebFetch and returns a concise summary. Raw search results never enter the main context.

Recommend one approach and explain why.

**After the user selects an approach**, dispatch a subagent to verify viability before proceeding to Step 6. Example prompt: "Verify the viability of this technical approach: [chosen tech stack / key libraries]. Check: (1) Are these technologies still actively maintained? (2) Any license incompatibilities (e.g., GPL contamination)? (3) Do the components actually work together for [use case]? (4) Any known showstoppers (critical bugs, security vulnerabilities, platform limitations)? Return only issues found, or 'No issues found' if everything checks out."

If the viability check reveals issues, present them to the user and revisit the approach selection. If no issues, proceed to Step 6.

### Step 6: Refine and Confirm

- Address user's questions or concerns about the approaches
- Narrow scope if needed: favor smaller, deliverable increments and cleaner responsibility seams
- For Path D/E: propose work decomposition with dependency ordering
  - Each new boundary-worthy feature = one spec
  - Existing spec extensions are explicitly listed with their target spec
  - Truly small direct-implementation items are listed separately instead of being forced into a spec
  - Dependencies between specs/workstreams are explicit
  - Consider vertical slices (end-to-end value) vs horizontal layers (one layer at a time) based on the project needs
- Confirm the final direction

### Step 7: Write Files to Disk

**CRITICAL: You MUST use the Write tool to create these files BEFORE suggesting any next command. Conversation text does not survive session boundaries. If you skip this step, all discovery analysis is lost when the session ends.**

**For Path C (single spec)**:

Use the Write tool to create `{{KIRO_DIR}}/specs/<feature-name>/brief.md` with this structure:

```
# Brief: <feature-name>

## Problem
[who has the problem, what pain it causes]

## Current State
[what exists today, what's the gap]

## Desired Outcome
[what should be true when done]

## Approach
[chosen approach and why]

## Scope
- **In**: [what this feature includes]
- **Out**: [what's explicitly excluded]

## Boundary Candidates
- [responsibility seam 1]
- [responsibility seam 2]

## Out of Boundary
- [explicit non-goals this spec does not own]

## Upstream / Downstream
- **Upstream**: [existing systems/specs this depends on]
- **Downstream**: [likely consumers or follow-on specs]

## Existing Spec Touchpoints
- **Extends**: [existing spec(s) this work updates, if any]
- **Adjacent**: [neighbor specs or modules to avoid overlapping]

## Constraints
[technology, compatibility, or other constraints]
```

**For Path D (multi-spec decomposition)**:

Use the Write tool to create:
- `{{KIRO_DIR}}/steering/roadmap.md`
- `{{KIRO_DIR}}/specs/<feature>/brief.md` for every feature listed under `## Specs (dependency order)`

Use this roadmap structure:

```
# Roadmap

## Overview
[Project goal and chosen approach -- 1-2 paragraphs]

## Approach Decision
- **Chosen**: [approach name and summary]
- **Why**: [key reasoning]
- **Rejected alternatives**: [what was considered and why it was rejected]

## Scope
- **In**: [what the overall project includes]
- **Out**: [what is explicitly excluded]

## Constraints
[technology, compatibility, timeline, or other project-wide constraints]

## Boundary Strategy
- **Why this split**: [why these spec boundaries improve independence]
- **Shared seams to watch**: [cross-spec boundaries needing careful review]

## Specs (dependency order)
- [ ] feature-a -- [one-line description]. Dependencies: none
- [ ] feature-b -- [one-line description]. Dependencies: feature-a
- [ ] feature-c -- [one-line description]. Dependencies: feature-a, feature-b
```

Then create `{{KIRO_DIR}}/specs/<feature>/brief.md` for **every** feature listed under `## Specs (dependency order)` using the Path C brief format. This enables parallel spec creation via `/kiro-spec-batch`.

**For Path E (mixed decomposition)**:

Use the same roadmap structure as Path D, plus these additional sections:

```
## Existing Spec Updates
- [ ] existing-feature-a -- [one-line description of the extension]. Dependencies: none
- [ ] existing-feature-b -- [one-line description of the extension]. Dependencies: feature-a

## Direct Implementation Candidates
- [ ] small-item-a -- [why this stays direct implementation]
- [ ] small-item-b -- [why this stays direct implementation]

## Specs (dependency order)
- [ ] new-feature-a -- [one-line description]. Dependencies: none
- [ ] new-feature-b -- [one-line description]. Dependencies: new-feature-a
```

Path E rules:
- Keep `## Specs (dependency order)` reserved for **new specs only** so `/kiro-spec-batch` can still parse it unchanged
- Record existing-spec extensions under `## Existing Spec Updates`
- Record true no-spec work under `## Direct Implementation Candidates`
- Create `brief.md` only for the **new specs** listed under `## Specs (dependency order)`

**Re-entry (roadmap.md already exists)**:
Use the Write tool to create the next new spec's brief.md. Update roadmap.md with Write tool if scope/ordering changed, preserving completed items and prior phases.

After writing, verify the files exist by reading them back.

### Step 8: Suggest Next Steps

Suggest the next command and stop. Do NOT automatically run downstream spec generation from this skill.

- Path A: `/kiro-spec-requirements {feature}` to update the existing spec
- Path B: Recommend direct implementation without creating a spec
- Path C: Default to `/kiro-spec-init <feature-name>`
  - Optional fast path: `/kiro-spec-quick <feature-name>` when the user explicitly wants to continue immediately
- Path D: Default to `/kiro-spec-batch` (creates all specs in parallel based on roadmap.md dependency order)
  - Optional cautious path: `/kiro-spec-init <first-feature-name>` when the user wants to validate the first slice before batching the rest
- Path E: Choose the next command based on the new-spec portion of the decomposition
  - If there is exactly one new spec: `/kiro-spec-init <new-feature-name>`
  - If there are multiple new specs: `/kiro-spec-batch`
  - Also note which existing specs should be revisited with `/kiro-spec-requirements <feature>`
- Re-entry: `/kiro-spec-init <next-feature-name>` or `/kiro-spec-batch` if multiple specs remain

If the decomposition contains only existing-spec updates plus direct implementation candidates, do NOT use Path E. Prefer Path A when one existing spec is the clear home, or recommend the existing-spec update plus direct implementation work without creating roadmap entries.

## Critical Constraints
- **Files on disk are the source of continuity**: For Path C/D/E, create brief.md and roadmap.md as needed before suggesting the next command. Do NOT leave discovery results only in conversation text.

## Safety & Fallback

**Roadmap Already Exists (re-entry)**:
- Read roadmap.md to restore project context before asking questions
- Determine next spec based on completed specs' status
- Write brief.md for the next spec only (just-in-time)
- Update roadmap.md if scope/ordering changed based on implementation experience
- Append new specs as a new phase if the request expands the project, don't overwrite existing content



---

# SKILL: kiro-impl

---
name: kiro-impl
description: Implement approved tasks using TDD with native subagent dispatch. Runs all pending tasks autonomously or selected tasks manually.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, MultiEdit, Bash, Glob, Grep, Agent, WebSearch, WebFetch
argument-hint: <feature-name> [task-numbers] [--review required|inline|off]
---

# kiro-impl Skill

## Role
You operate in two modes:
- **Autonomous mode** (no task numbers): Dispatch a fresh subagent per task, with independent review after each
- **Manual mode** (task numbers provided): Execute selected tasks directly in the main context

## Core Mission
- **Success Criteria**:
  - All tests written before implementation code
  - Code passes all tests with no regressions
  - Tasks marked as completed in tasks.md
  - Implementation aligns with design and requirements
  - Task completion follows the selected review mode

## Review Mode
- Default review mode is `required`
- Accept explicit forms: `--review required|inline|off`
- Also accept clear natural-language opt-outs such as `skip review` or `without review` as `off`
- If the request is ambiguous, keep `required`

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- `{{KIRO_DIR}}/specs/{feature}/spec.json` and `tasks.md` for approvals, task selection, and dependencies
- Referenced sections of `requirements.md` and `design.md`, expanding to related contracts as needed for the selected task
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the selected task's boundary, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect implementation or validation
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

#### Preflight

**Validate approvals**:
- Verify tasks are approved in spec.json (stop if not, see Safety & Fallback)

**Discover validation commands**:
- Inspect repository-local sources of truth in this order: project scripts/manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, app manifests), task runners (`Makefile`, `justfile`), CI/workflow files, existing e2e/integration configs, then `README*`
- Derive a canonical validation set for this repo: `TEST_COMMANDS`, `BUILD_COMMANDS`, and `SMOKE_COMMANDS`
- Prefer commands already used by repo automation over ad hoc shell pipelines
- For `SMOKE_COMMANDS`, choose the lightest trustworthy runtime-liveness check for the app shape (for example: root URL load, Electron launch, CLI `--help`, service health endpoint, mobile simulator/e2e harness if one already exists)
- Keep the full command set in the parent context, and pass only the task-relevant subset to implementer and reviewer subagents

**Establish repo baseline**:
- Run `git status --porcelain` and note any pre-existing uncommitted changes

### Step 2: Select Tasks & Determine Mode

**Parse arguments**:
- Extract feature name from first argument
- If task numbers provided (e.g., "1.1" or "1,2,3"): **manual mode**
- If no task numbers: **autonomous mode** (all pending tasks)
- Determine review mode from the invocation:
  - `--review required` or omitted → `required`
  - `--review inline` → `inline`
  - `--review off`, `skip review`, or `without review` → `off`

**Build task queue**:
- Read tasks.md, identify actionable sub-tasks (X.Y numbering like 1.1, 2.3)
- Major tasks (1., 2.) are grouping headers, not execution units
- Skip tasks with `_Blocked:_` annotation
- For each selected task, check `_Depends:_` annotations -- verify referenced tasks are `[x]`
- If prerequisites incomplete, execute them first or warn the user
- Use `_Boundary:_` annotations to understand the task's component scope

### Step 3: Execute Implementation

#### Autonomous Mode (subagent dispatch)

**Iteration discipline**: Process exactly ONE sub-task (e.g., 1.1) per iteration. Do NOT batch multiple sub-tasks into a single subagent dispatch. Each iteration follows the full cycle: dispatch implementer → review → commit → re-read tasks.md → next.

**Context management**: Re-read `tasks.md` before each iteration. Carry forward the task outcome, commit/evidence references, unresolved constraints, and relevant Implementation Notes; do not repeat completed worker transcripts in later handoffs.

**Delegation scope**: Use native subagents for these task-local steps, passing the focused inputs below rather than the full parent conversation. Independent feature/PR chats and their worktrees are managed through the host; do not create a standalone chat for each implementation or review step.

For each task (one at a time):

**a) Dispatch implementer**:
- Read `templates/implementer-prompt.md` from this skill's directory
- Construct a prompt by combining the template with task-specific context:
  - Task description and boundary scope
  - Paths to spec files: requirements.md, design.md, tasks.md
  - Exact requirement and design section numbers this task must satisfy (using source numbering, NOT invented `REQ-*` aliases)
  - Task-relevant steering context and parent-discovered validation commands (tests/build/smoke as relevant)
  - Selected skill/playbook paths and concise task-relevant guidance, including required checks; inline necessary guidance when the worker cannot access those paths
  - Whether the task is behavioral (Feature Flag Protocol) or non-behavioral
  - **Previous learnings**: Include any `## Implementation Notes` entries from tasks.md that are relevant to this task's boundary or dependencies (e.g., "better-sqlite3 requires separate rebuild for Electron"). This prevents the same mistakes from recurring.
- The implementer subagent will read the spec files and build its own Task Brief (acceptance criteria, completion definition, design constraints, verification method) before implementation
- Preserve this task context, including selected skill guidance, on every implementer re-dispatch (context requests, review remediation, and debug retries); append the new context or feedback.
- Dispatch via **Agent tool** as a fresh subagent

**b) Handle implementer status**:
- Parse implementer status only from the exact `## Status Report` block and `- STATUS:` field.
- If `STATUS` is missing, ambiguous, or replaced with prose, re-dispatch the implementer once requesting the exact structured status block only. Do NOT proceed to review without a parseable `READY_FOR_REVIEW | BLOCKED | NEEDS_CONTEXT` value.
- **READY_FOR_REVIEW** → proceed to review
- **BLOCKED** → dispatch debug subagent (see section below); do NOT immediately skip
- **NEEDS_CONTEXT** → re-dispatch once with the requested additional context; if still unresolved → dispatch debug subagent

**c) Review the task**:
- If review mode is `required`:
  - Read `templates/reviewer-prompt.md` from this skill's directory
  - Resolve `../kiro-review/SKILL.md` relative to this skill's directory and pass its absolute path as `REVIEW_PROTOCOL_PATH`
  - Construct a review prompt with:
    - The task description and relevant spec section numbers
    - Paths to spec files (requirements.md, design.md) so the reviewer can read them directly
    - The implementer's status report (for reference only — reviewer must verify independently)
  - The reviewer must apply the `kiro-review` protocol to this task-local review.
  - Preserve the existing task-specific context: task text, spec refs, `_Boundary:_` scope, validation commands, implementer report, and the actual `git diff` as the primary source of truth.
  - The reviewer subagent will run `git diff` itself to read the actual code changes and verify against the spec
  - Dispatch via **Agent tool** as a fresh subagent
- If review mode is `inline`:
  - Apply `kiro-review` in the parent context using the same task evidence and the actual `git diff`
- If review mode is `off`:
  - Skip task-local review
  - Record in the parent context that task-local review was skipped for this task

**d) Handle reviewer verdict**:
- If review mode is `off`:
  - Do not fabricate a reviewer verdict
  - Before marking the task `[x]` or making any success claim, apply `kiro-verify-completion` using fresh evidence from the current code state; then mark task `[x]` in tasks.md and perform selective git commit
- Otherwise:
  - Parse reviewer verdict only from the exact `## Review Verdict` block and `- VERDICT:` field.
  - If `VERDICT` is missing, ambiguous, or replaced with prose, re-dispatch the reviewer once requesting the exact structured verdict only. Do NOT mark the task complete, commit, or continue to the next task without a parseable `APPROVED | REJECTED` value.
  - **APPROVED** → before marking the task `[x]` or making any success claim, apply `kiro-verify-completion` using fresh evidence from the current code state; then mark task `[x]` in tasks.md and perform selective git commit
  - **REJECTED (round 1-2)** → re-dispatch implementer with review feedback
  - **REJECTED (round 3)** → dispatch debug subagent (see section below)

**e) Commit** (parent-only, selective staging):
- Stage only the files actually changed for this task, plus tasks.md
- **NEVER** use `git add -A` or `git add .`
- Use `git add <file1> <file2> ...` with explicit file paths
- Commit message format: `feat(<feature-name>): <task description>`

**f) Record learnings**:
- If this task revealed cross-cutting insights, append a one-line note to the `## Implementation Notes` section at the bottom of tasks.md

**g) Debug subagent** (triggered by BLOCKED, NEEDS_CONTEXT unresolved, or REJECTED after 2 remediation rounds):

- Read `templates/debugger-prompt.md` from this skill's directory
- Resolve `../kiro-debug/SKILL.md` relative to this skill's directory and pass its absolute path as `DEBUG_PROTOCOL_PATH`
- Supply the task brief/boundary, exact spec references, failure output, reviewer findings, current changed files/diff, and relevant Implementation Notes/runtime constraints
- Include attempted fixes and their observed results concisely, without copying the failed workers' conversation history
- Dispatch via **Agent tool** as a fresh subagent; it reads the canonical `kiro-debug` procedure itself

**Handle debug report**:
- Require a `## Debug Report` and parse its exact `- NEXT_ACTION:` field (`RETRY_TASK | BLOCK_TASK | STOP_FOR_HUMAN`). If the protocol or a valid report is missing, stop this feature and report the missing input; do not guess a next action or dispatch another implementer.
- If `NEXT_ACTION: STOP_FOR_HUMAN` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, stop the feature run, and report that human review is required before continuing
- If `NEXT_ACTION: BLOCK_TASK` → append `_Blocked: <ROOT_CAUSE>_` to tasks.md, skip to next task
- If `NEXT_ACTION: RETRY_TASK` → preserve the current worktree; do NOT reset or discard unrelated changes. Spawn a **new** implementer subagent with the original task context (including selected skill guidance), the debug report's `FIX_PLAN`, `NOTES`, and the current `git diff`, and require it to repair the task with explicit edits only
  - If the new implementer succeeds (READY_FOR_REVIEW → reviewer APPROVED) → normal flow
  - If the new implementer also fails → repeat debug cycle (max 2 debug rounds total). After 2 failed debug rounds → append `_Blocked: debug attempted twice, still failing — <ROOT_CAUSE>_` to tasks.md, skip
- **Max 2 debug rounds per task**. Each round: fresh debug subagent → fresh implementer. If still failing after 2 rounds, the task is blocked.
- Record debug findings in `## Implementation Notes` (this helps subsequent tasks avoid the same issue)

**`(P)` markers**: Tasks marked `(P)` in tasks.md indicate they have no inter-dependencies and could theoretically run in parallel. However, kiro-impl processes them sequentially (one at a time) to avoid git conflicts and simplify review. The `(P)` marker is informational for task planning, not an execution directive.

**Completion check**: If all remaining tasks are BLOCKED, stop and report blocked tasks with reasons to the user.

#### Manual Mode (main context)

For each selected task:

**1. Build Task Brief**:
Before writing any code, read the relevant sections of requirements.md and design.md for this task and clarify:
- What observable behaviors must be true when done (acceptance criteria)
- What files/functions/tests must exist (completion definition)
- What technical decisions to follow from design.md (design constraints)
- How to confirm the task works (verification method)

**2. Execute TDD cycle** (Kent Beck's RED → GREEN → REFACTOR):
- **RED**: Write test for the next small piece of functionality based on the acceptance criteria. Test should fail.
- **GREEN**: Implement simplest solution to make test pass, following the design constraints.
- **REFACTOR**: Improve code structure, remove duplication. All tests must still pass.
- **VERIFY**: All tests pass (new and existing), no regressions. Confirm verification method passes.
- **REVIEW**:
  - `required`: Apply `kiro-review` before marking the task complete. If the host supports fresh subagents in manual mode, use a fresh reviewer; otherwise perform the review in the main context using the `kiro-review` protocol. Do NOT continue until the verdict is parseably `APPROVED`.
  - `inline`: Apply `kiro-review` in the main context before marking the task complete.
  - `off`: Skip task-local review, but note that `kiro-validate-impl` becomes the primary quality gate before any feature-level completion claim.
- **MARK COMPLETE**:
  - `required|inline`: Only after review returns `APPROVED`, apply `kiro-verify-completion`, then update the checkbox from `- [ ]` to `- [x]` in tasks.md.
  - `off`: Apply `kiro-verify-completion`, then update the checkbox from `- [ ]` to `- [x]` in tasks.md.

### Step 4: Final Validation

**Autonomous mode**:
- After all tasks complete, run `/kiro-validate-impl {feature}` as a GO/NO-GO gate
- If validation returns GO → before reporting feature success, apply `kiro-verify-completion` to the feature-level claim using the validation result and fresh supporting evidence
- If validation returns NO-GO:
  - Fix only concrete findings from the validation report
  - Cap remediation at 3 rounds; if still NO-GO, stop and report remaining findings
- If validation returns MANUAL_VERIFY_REQUIRED → stop and report the missing verification step

**Manual mode**:
- Suggest running `/kiro-validate-impl {feature}` but do not auto-execute
- If review mode is `off`, treat `/kiro-validate-impl {feature}` as mandatory before any feature-level success claim

## Feature Flag Protocol

For tasks that add or change behavior, enforce RED → GREEN with a feature flag:

1. **Add flag** (OFF by default): Introduce a toggle appropriate to the codebase (env var, config constant, boolean, conditional -- agent chooses the mechanism)
2. **RED -- flag OFF**: Write tests for the new behavior. Run tests → must FAIL. If tests pass with flag OFF, the tests are not testing the right thing. Rewrite.
3. **GREEN -- flag ON + implement**: Enable the flag, write implementation. Run tests → must PASS.
4. **Remove flag**: Make the code unconditional. Run tests → must still PASS.

**Skip this protocol for**: refactoring, configuration, documentation, or tasks with no behavioral change.

## Critical Constraints
- **Strict Handoff Parsing**: Never infer implementer `STATUS` or reviewer `VERDICT` from surrounding prose; only the exact structured fields count
- **No Destructive Reset**: Never use `git checkout .`, `git reset --hard`, or similar destructive rollback inside the implementation loop
- **Selective Staging**: NEVER use `git add -A` or `git add .`; always stage explicit file paths
- **Bounded Review Rounds**: Max 2 implementer re-dispatch rounds per reviewer rejection, then debug
- **Bounded Debug**: Max 2 debug rounds per task (debug + re-implementation per round); if still failing → BLOCKED
- **Bounded Remediation**: Cap final-validation remediation at 3 rounds

## Output Description

**Autonomous mode**: For each task, report:
1. Task ID, implementer status, reviewer verdict
2. Files changed, commit hash
3. After all tasks: final validation result (GO/NO-GO)

**Manual mode**:
1. Tasks executed: task numbers and test results
2. Status: completed tasks marked in tasks.md, remaining tasks count

**Format**: Concise, in the language specified in spec.json.

## Safety & Fallback

### Error Scenarios

**Tasks Not Approved or Missing Spec Files**:
- **Stop Execution**: All spec files must exist and tasks must be approved
- **Suggested Action**: "Complete previous phases: `/kiro-spec-requirements`, `/kiro-spec-design`, `/kiro-spec-tasks`"

**Test Failures**:
- **Stop Implementation**: Fix failing tests before continuing
- **Action**: Debug and fix, then re-run

**All Tasks Blocked**:
- Stop and report all blocked tasks with reasons
- Human review needed to resolve blockers

**Spec Conflicts with Reality**:
- If a requirement or design conflicts with reality (API doesn't exist, platform limitation), block the task with `_Blocked: <reason>_` -- do not silently work around it

**Upstream Ownership Detected**:
- If review, debug, or validation shows that the root cause belongs to an upstream, foundation, shared-platform, or dependency spec, do not patch around it inside the downstream feature
- Route the fix back to the owning upstream spec, keep the downstream task blocked until that contract is repaired, and re-run validation/smoke for dependent specs after the upstream fix lands

**Task Plan Invalidated During Implementation**:
- If debug returns `NEXT_ACTION: STOP_FOR_HUMAN` because of task ordering, boundary, or decomposition problems, stop and return for human review of `tasks.md` or the approved plan instead of forcing a code workaround



---

# SKILL: kiro-review

---
name: kiro-review
description: Review a task implementation against approved specs, task boundaries, and verification evidence. Use after an implementer finishes a task, after remediation, or before accepting a task as complete.
allowed-tools: Read, Bash, Grep, Glob
argument-hint: <task-id>
---

# kiro-review

## Overview

This skill performs task-local adversarial review. It verifies that the implementation is real, complete, bounded, aligned with approved requirements and design, and supported by mechanical verification evidence.

Boundary terminology continuity:
- discovery identifies `Boundary Candidates`
- design fixes `Boundary Commitments`
- tasks constrain execution with `_Boundary:_`
- review rejects concrete `Boundary Violations`

## When to Use

- After an implementer reports `READY_FOR_REVIEW`
- After remediation for a rejected review
- Before marking a task `[x]`
- Before accepting a task into feature-level validation

Do not use this skill to invent missing requirements or silently reinterpret the spec.

## Inputs

Provide:
- Task ID and exact task text from `tasks.md`
- Relevant requirement section numbers
- Relevant design section numbers
- Spec file paths (`requirements.md`, `design.md`, optionally `tasks.md`)
- The implementer's status report
- The task `_Boundary:_` scope constraints
- Validation commands discovered by the controller
- Relevant steering excerpts when applicable
- Relevant `## Implementation Notes` entries when applicable

## Outputs

Return one of:
- `APPROVED`
- `REJECTED`

Also return:
- Mechanical results
- Findings with severity
- Required remediation
- One-sentence summary

Use the language specified in `spec.json`.

## First Action

Run `git diff` to inspect the actual code changes. If the diff is large or ambiguous, read the changed files directly. Do not trust the implementer report as source of truth.

## Core Principle

Read the spec yourself. Read the diff yourself. Verify mechanically where possible. Reject on concrete failures rather than interpretive optimism.
The main review question is not just "does it work?" but "does it stay inside the approved responsibility boundary without hiding new coupling?"

## Mechanical Checks

Run these checks and use the result as primary signal.

### 1. Regression Safety
- Run the project's canonical test suite using the validation commands discovered by the controller.
- If tests fail, reject.

### 2. No Residual Placeholder Markers
- Check changed files for `TBD`, `TODO`, `FIXME`, `HACK`, `XXX`.
- Reject if new placeholder markers were introduced without explicit task justification.

### 3. No Hardcoded Secrets
- Check changed files for hardcoded secrets or credentials.
- Reject if concrete secret patterns are introduced.

### 4. Boundary Respect
- Compare changed files against the task `_Boundary:_` scope.
- Reject if the change spills outside the approved boundary without explicit justification.
- Reject if the implementation introduces hidden cross-boundary coordination inside what should be a local task.

### 5. RED Phase Evidence
- For behavioral tasks, verify that the implementer status report includes `RED_PHASE_OUTPUT`.
- Reject if RED evidence is missing, empty, or unrelated to the task's acceptance criteria.

### 6. Runtime-Sensitive Static Checks
- If the project already has lint or equivalent static analysis for the touched stack, run the relevant command for the task boundary.
- Pay attention to patterns that can survive typecheck/build yet fail at runtime: type-only imports used as values, missing namespace value imports for qualified-name access, unresolved globals, and newly introduced runtime-sensitive dependencies without matching boot/runtime handling.
- If no project lint command exists, perform a targeted diff-based spot check in the changed files for those patterns.
- Reject on concrete findings that create a realistic boot-time or module-load failure.

## Judgment Checks

### 7. Reality Check
- Confirm the implementation is real production code, not a placeholder, stub, fake path, or deferred-work shell.

### 8. Acceptance Criteria Coverage
- Read the task description and confirm all aspects are implemented, not only the primary happy path.

### 9. Requirements Alignment
- Read the referenced sections in `requirements.md`.
- Confirm each requirement is satisfied by concrete observable behavior.
- Use original section numbers only.

### 10. Design Alignment
- Read the referenced sections in `design.md`.
- Confirm the implementation uses the prescribed structures, interfaces, and dependency direction.
- Reject silent substitutions for design-mandated choices.

### 10.5 Boundary Audit
- Compare the implementation against the design's boundary commitments and out-of-boundary statements.
- Reject if downstream-specific behavior is pushed into an upstream boundary for convenience.
- Reject if the implementation creates new hidden dependencies, shared ownership, or undeclared coupling across adjacent boundaries.
- Reject if a task that is not an explicit integration task now behaves like one.

### 11. Test Quality
- Confirm tests prove the required behavior rather than only scaffolding.
- Confirm tests would fail if the implementation were removed or broken.

### 12. Error Handling
- Confirm relevant failure paths are handled and not silently swallowed.

## Severity Model

Use:
- `Critical` for broken functionality, invalid verification, data loss, security risk, or major scope violation
- `Important` for required fixes before acceptance
- `Suggestion` for non-blocking improvements
- `FYI` for informational notes

## Stop / Escalate

Escalate instead of papering over the issue when:
- The approved spec is ambiguous in a correctness-critical way
- The design conflicts with what is technically possible
- Required evidence cannot be gathered
- The implementation only works by silently deviating from approved scope
- Boundary ownership cannot be determined cleanly from requirements, design, and task scope

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “Tests pass, so approve” | Passing tests do not prove spec compliance or boundary respect. |
| “The extra behavior is useful” | Extra behavior outside approved scope is still drift. |
| “The implementer said RED was done” | RED must be evidenced, not asserted. |
| “This gap is small enough to let through” | Real gaps must be rejected or escalated. |

## Output Format

```md
## Review Verdict
- VERDICT: APPROVED | REJECTED
- TASK: <task-id>
- MECHANICAL_RESULTS:
  - Tests: PASS | FAIL (command and exit code)
  - TBD/TODO grep: CLEAN | <count> matches
  - Secrets grep: CLEAN | <count> matches
  - Static checks: PASS | FAIL | SPOT_CHECKED
  - Boundary: WITHIN | <files outside boundary>
  - Boundary audit: CLEAN | <spillover / hidden dependency findings>
  - RED phase: VERIFIED | MISSING | N/A
- FINDINGS:
  1. <specific finding with exact files/spec refs>
- REMEDIATION: <mandatory if REJECTED>
- SUMMARY: <one sentence>
```



---

# SKILL: kiro-spec-batch

---
name: kiro-spec-batch
description: Create complete specs (requirements, design, tasks) for all features in roadmap.md using parallel subagent dispatch by dependency wave.
allowed-tools: Read, Glob, Grep, Agent
---

# kiro-spec-batch Skill

## Core Mission
- **Success Criteria**:
  - All features have complete spec files (spec.json, requirements.md, design.md, tasks.md)
  - Dependency ordering respected (upstream specs complete before downstream)
  - Independent features processed in parallel via subagent dispatch
  - Cross-spec consistency verified (data models, interfaces, naming)
  - Mixed roadmap context understood without breaking `## Specs (dependency order)` parsing
  - Controller context stays lightweight (subagents do the heavy work)

## Execution Steps

### Step 1: Read Roadmap and Validate

1. Read `{{KIRO_DIR}}/steering/roadmap.md`
2. Parse the `## Specs (dependency order)` section to extract:
   - Feature names
   - One-line descriptions
   - Dependencies for each feature
   - Completion status (`[x]` = done, `[ ]` = pending)
3. If present, also read for context:
   - `## Existing Spec Updates`
   - `## Direct Implementation Candidates`
   Do not include these in dependency-wave execution; they are awareness-only inputs for sequencing and consistency review.
4. For each pending feature in `## Specs (dependency order)`, verify `{{KIRO_DIR}}/specs/<feature>/brief.md` exists
5. If any brief.md is missing, stop and report: "Missing brief.md for: [list]. Run `/kiro-discovery` to generate briefs first."

### Step 2: Build Dependency Waves

Group pending features into waves based on dependencies:

- **Wave 1**: Features with no dependencies (or all dependencies already completed `[x]`)
- **Wave 2**: Features whose dependencies are all in Wave 1 or already completed
- **Wave N**: Features whose dependencies are all in earlier waves or already completed

Display the execution plan:
```
Spec Batch Plan:
  Wave 1 (parallel): app-foundation
  Wave 2 (parallel): block-editor, page-management
  Wave 3 (parallel): sidebar-navigation, database-views
  Wave 4 (parallel): cli-integration
  Total: 6 specs across 4 waves
```

If roadmap contains `## Existing Spec Updates` or `## Direct Implementation Candidates`, mention them separately as non-batch items so the user can see the whole decomposition.

### Step 3: Execute Waves

For each wave, dispatch all features in the wave as **parallel subagents** via the Agent tool.

**For each feature in the wave**, dispatch a subagent with this prompt:

```
Create a complete specification for feature "{feature-name}".
Bind the feature argument in each phase to "{feature-name}" (including `$1` or `{feature}` references). This batch uses the existing fast-track mode: supply `-y` to design and tasks before entering their approval checks. Required phase review gates still apply.

1. Read the brief at {{KIRO_DIR}}/specs/{feature-name}/brief.md for feature context
2. Read the roadmap at {{KIRO_DIR}}/steering/roadmap.md for project context
3. Execute the full spec pipeline. For each phase, read the corresponding skill's SKILL.md for complete instructions (templates, rules, review gates):
   a. Initialize: If spec.json already exists, reuse that spec without reinitializing or renaming it. Otherwise read .claude/skills/kiro-spec-init/SKILL.md; use the brief as the project description and initialize spec.json and requirements.md in the existing brief directory. Later phases may update their own artifacts.
   b. Generate requirements: Read .claude/skills/kiro-spec-requirements/SKILL.md and execute for feature "{feature-name}"
   c. Generate design: Read .claude/skills/kiro-spec-design/SKILL.md and execute with arguments "{feature-name} -y", including required design review
   d. Generate tasks: Read .claude/skills/kiro-spec-tasks/SKILL.md and execute with arguments "{feature-name} -y", including required task review
4. Let each successful phase record its approvals through its documented fast-track flow. If a phase review fails or needs human input, stop this feature and report the blocker; do not force its approvals to true
5. Report completion with file list and task count
```

**After all subagents in the wave complete**:
1. Verify each feature has: spec.json, requirements.md, design.md, tasks.md
2. If any feature failed, report the error and continue with features that succeeded
3. Display wave completion: "Wave N complete: [features]. Files verified."
4. Proceed to next wave

### Step 4: Cross-Spec Review

After all waves complete, dispatch a **single subagent** for cross-spec consistency review. This is the highest-value quality gate -- it catches issues that per-spec review gates cannot.

**Subagent prompt**:

```
You are a cross-spec reviewer. Read ALL generated specs and check for consistency across the entire project.

Read these files for every feature in the roadmap:
- {{KIRO_DIR}}/specs/*/design.md (primary: contains interfaces, data models, architecture)
- {{KIRO_DIR}}/specs/*/requirements.md (for scope and acceptance criteria)
- {{KIRO_DIR}}/specs/*/tasks.md (for boundary annotations only -- read _Boundary:_ lines, skip task descriptions)
- {{KIRO_DIR}}/steering/roadmap.md

Reading priority: Focus on design.md files (they contain interfaces, data models, architecture). For requirements.md, focus on section headings and acceptance criteria. For tasks.md, focus on _Boundary:_ annotations.

Check the following:

1. **Data model consistency**: Do all specs that reference the same entities (tables, types, interfaces) define them consistently? Are field names, types, and relationships aligned?

2. **Interface alignment**: Where spec A produces output that spec B consumes (APIs, events, shared state), do the contracts match exactly? Are request/response shapes, event payloads, and error codes consistent?

3. **No duplicate functionality**: Is any capability specified in more than one spec? Flag overlaps.

4. **Dependency completeness**: Does every spec's design.md reference the correct upstream specs? Are there implicit dependencies not declared in roadmap.md?

5. **Naming conventions**: Are component names, file paths, API routes, and database table names consistent across all specs?

6. **Shared infrastructure**: Are shared concerns (authentication, error handling, logging, configuration) handled in one spec and correctly referenced by others?

7. **Task boundary alignment**: Do task _Boundary:_ annotations across specs partition the codebase cleanly? Are there files claimed by multiple specs?
8. **Roadmap boundary continuity**: If roadmap includes `Existing Spec Updates` or `Direct Implementation Candidates`, do the generated new specs avoid absorbing that work by accident?
9. **Architecture boundary integrity**: Do the specs preserve clean responsibility seams, avoid shared ownership, keep dependency direction coherent, and include enough revalidation triggers to catch downstream impact?
10. **Change-friendly decomposition**: Has any spec absorbed multiple independent seams that should probably be split instead of kept together?

Output format:
- CONSISTENT: [list areas that are well-aligned]
- ISSUES: [list each issue with: which specs, what's inconsistent, suggested fix]
- If no issues found: "All specs are consistent. Ready for implementation."
```

**After the review subagent returns**:
- **Critical/important issues found**: Dispatch fix subagents for each affected spec to apply the suggested fixes. If the issue is really a decomposition problem (for example boundary overlap or one spec carrying multiple independent seams), stop and return to roadmap/discovery instead of papering over it locally. Re-run cross-spec review after fixes (max 3 remediation rounds).
- **Minor issues only**: Report them for user awareness, proceed to Step 5.
- **No issues**: Proceed to Step 5.

### Step 5: Finalize

1. Glob `{{KIRO_DIR}}/specs/*/tasks.md` to verify all specs exist
2. For each completed spec, read spec.json to confirm phase and approvals
3. Update roadmap.md: mark completed specs as `[x]`
4. If roadmap.md includes `Existing Spec Updates` or `Direct Implementation Candidates`, leave them untouched and mention them as remaining follow-up items unless already explicitly completed elsewhere

Display final summary:
```
Spec Batch Complete:
  ✓ app-foundation: X requirements, Y design components, Z tasks
  ✓ block-editor: ...
  ✓ page-management: ...
  ...
  Total: N specs created, M tasks generated
  Cross-spec review: PASSED / N issues found (M fixed)
  Existing spec updates pending: <count or none>
  Direct implementation candidates pending: <count or none>

Next: Review generated specs, then start implementation with /kiro-impl <feature>
```

## Critical Constraints
- **Controller stays lightweight**: Only read roadmap.md and brief.md existence checks in main context. All spec generation happens in subagents.
- **Wave ordering is strict**: Never start a wave until all features in previous waves are complete.
- **Parallel within waves**: All features in the same wave MUST be dispatched in parallel via Agent tool, not sequentially.
- **No partial waves**: If a feature in a wave fails, still complete the other features in that wave before reporting.
- **Skip completed specs**: Features with `[x]` in roadmap.md or existing tasks.md are skipped.
- **`## Specs (dependency order)` remains authoritative for batch execution**: Other roadmap sections are context, not wave inputs.

## Safety & Fallback

**Subagent failure**:
- Log the error, skip the failed feature
- Continue with remaining features in the wave
- Report failed features in the summary
- Suggest: "Run `/kiro-spec-quick <feature> --auto` manually for failed features."

**Circular dependencies**:
- If dependency graph has cycles, report the cycle and stop
- Suggest: "Fix dependency ordering in roadmap.md"

**Roadmap not found**:
- Stop and report: "No roadmap.md found. Run `/kiro-discovery` first."



---

# SKILL: kiro-spec-design

---
name: kiro-spec-design
description: Generate comprehensive technical design translating requirements (WHAT) into architecture (HOW) with discovery process. Use when creating architecture from requirements.
allowed-tools: Read, Write, Edit, Grep, Glob, WebSearch, WebFetch, Agent
argument-hint: <feature-name> [-y]
metadata:
  shared-rules: "design-principles.md, design-discovery-full.md, design-discovery-light.md, design-synthesis.md, design-review-gate.md"
---

# kiro-spec-design Skill

## Core Mission
- **Success Criteria**:
  - All requirements mapped to technical components with clear interfaces
  - The design makes responsibility boundaries explicit enough to guide task generation and review
  - Appropriate architecture discovery and research completed
  - Design aligns with steering context and existing patterns
  - Visual diagrams included for complex architectures

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md` (if exists)
- `{{KIRO_DIR}}/specs/{feature}/research.md` (if exists, contains gap analysis from `/kiro-validate-gap`)
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to requirement coverage, architecture boundaries, integrations, runtime prerequisites, security/performance constraints, or team conventions that affect implementation readiness
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.
- Consult relevant domain skills even when building by hand without adopting a new library.
- `{{KIRO_DIR}}/settings/templates/specs/design.md` for document structure
- Read `rules/design-principles.md` from this skill's directory for design principles
- `{{KIRO_DIR}}/settings/templates/specs/research.md` for discovery log structure

**Validate requirements approval**:
- If auto-approve flag is true: Auto-approve requirements in spec.json
- Otherwise: Verify approval status (stop if unapproved, see Safety & Fallback)

### Step 2: Discovery & Analysis

**Critical: This phase ensures design is based on complete, accurate information.**

1. **Classify Feature Type**:
   - **New Feature** (greenfield) → Full discovery required
   - **Extension** (existing system) → Integration-focused discovery
   - **Simple Addition** (CRUD/UI) → Minimal or no discovery
   - **Complex Integration** → Comprehensive analysis required

2. **Execute Appropriate Discovery Process**:

   **For Complex/New Features**:
   - Read and execute `rules/design-discovery-full.md` from this skill's directory
   - Conduct thorough research using WebSearch/WebFetch:
     - Latest architectural patterns and best practices
     - External dependency verification (APIs, libraries, versions, compatibility)
     - Official documentation, migration guides, known issues
     - Performance benchmarks and security considerations

   **For Extensions**:
   - Read and execute `rules/design-discovery-light.md` from this skill's directory
   - Focus on integration points, existing patterns, compatibility
   - Use Grep to analyze existing codebase patterns

   **For Simple Additions**:
   - Skip formal discovery, quick pattern check only

#### Parallel Research (subagent dispatch)

The following research areas are independent and can be dispatched as **subagents** via the Agent tool. The agent should decide the optimal decomposition based on feature complexity — split, merge, add, or skip subagents as needed. Each subagent returns a **findings summary** (not raw data) to keep the main context clean for synthesis.

**Typical research areas** (adjust as appropriate):
- **Codebase analysis**: Existing architecture patterns, integration points, code conventions (using Grep/Glob)
- **External research**: Dependencies, APIs, latest best practices (using WebSearch/WebFetch)
- **Context loading** (usually main context): Steering files, design principles, discovery rules, templates

For simple additions, skip subagent dispatch entirely and do a quick pattern check in main context.

After all findings return, synthesize in main context before proceeding.

3. **Retain Discovery Findings for Step 3**:
   - External API contracts and constraints
   - Technology decisions with rationale
   - Existing patterns to follow or extend
   - Integration points and dependencies
   - Identified risks and mitigation strategies
   - Boundary candidates, out-of-boundary decisions, and likely revalidation triggers

4. **Persist Findings to Research Log**:
   - Create or update `{{KIRO_DIR}}/specs/{feature}/research.md` using the shared template
   - Summarize discovery scope and key findings
   - Record investigations with sources and implications
   - Document architecture pattern evaluation, design decisions, and risks
   - If `research.md` already exists, briefly record consulted skills and the guidance used in its existing research notes.
   - Use the language specified in spec.json when writing or updating `research.md`

### Step 3: Synthesis

**Apply design synthesis to discovery findings before writing.**

- Read and apply `rules/design-synthesis.md` from this skill's directory
- This step requires the full picture from discovery findings — execute in main context, not in a subagent
- Record synthesis outcomes (generalizations found, build-vs-adopt decisions, simplifications) in `research.md`

### Step 4: Generate Design Draft

1. **Generate Design Draft**:
   - **Follow specs/design.md template structure and generation instructions strictly**
   - **Boundary-first requirement**: Before expanding supporting sections, make the boundary explicit. The draft must clearly define what this spec owns, what it does not own, which dependencies are allowed, and what changes would require downstream revalidation.
   - **Integrate all discovery findings and synthesis outcomes**: Use researched information (APIs, patterns, technologies) and synthesis decisions (generalizations, build-vs-adopt, simplifications) throughout component definitions, architecture decisions, and integration points
   - **File Structure Plan** (required): Populate the File Structure Plan section with concrete file paths and responsibilities. Analyze the codebase to determine which files need to be created vs. modified. Each file must have one clear responsibility. This section directly drives task `_Boundary:_` annotations and implementation Task Briefs — vague file structures produce vague implementations.
   - **Testing Strategy**: Derive test items from requirements' acceptance criteria, not generic patterns. Each test item should reference specific components and behaviors from this design. E2E paths must map to the critical user flows identified in requirements. Avoid vague entries like "test login works" -- instead specify what is being verified and why it matters.
   - If existing design.md found in Step 1, use it as reference context (merge mode)
   - Apply design rules: Type Safety, Visual Communication, Formal Tone
   - Use language specified in spec.json
   - Keep this as a draft until the review gate passes; do not write `design.md` yet

### Step 5: Review Design Draft

- Read and apply `rules/design-review-gate.md` from this skill's directory
- Verify requirements coverage, architecture readiness, and implementation executability before finalizing the design
- If issues are local to the draft, repair the design and review again
- Keep the review bounded to at most 2 repair passes
- If the draft exposes a real requirements/design gap, stop and return to requirements clarification instead of papering over it in `design.md`

### Step 6: Finalize Design Document

1. **Write Final Design**:
   - Write `{{KIRO_DIR}}/specs/{feature}/design.md` only after the design review gate passes
   - Write research.md with discovery findings and synthesis outcomes (if not already written)

2. **Update Metadata** in spec.json:

   - Set `phase: "design-generated"`
   - Set `approvals.design.generated: true, approved: false`
   - Set `approvals.requirements.approved: true`
   - Update `updated_at` timestamp

## Critical Constraints
 - **Type Safety**:
   - Enforce strong typing aligned with the project's technology stack.
   - For statically typed languages, define explicit types/interfaces and avoid unsafe casts.
   - For TypeScript, never use `any`; prefer precise types and generics.
   - For dynamically typed languages, provide type hints/annotations where available (e.g., Python type hints) and validate inputs at boundaries.
   - Document public interfaces and contracts clearly to ensure cross-component type safety.
- **Requirements Traceability IDs**: Use numeric requirement IDs only (e.g. "1.1", "1.2", "3.1", "3.3") exactly as defined in requirements.md. Do not invent new IDs or use alphabetic labels.

## Output Description

**Command execution output** (separate from design.md content):

Provide brief summary in the language specified in spec.json:

1. **Status**: Confirm design document generated at `{{KIRO_DIR}}/specs/{feature}/design.md`
2. **Discovery Type**: Which discovery process was executed (full/light/minimal)
3. **Key Findings**: 2-3 critical insights from discovery that shaped the design
4. **Review Gate**: Confirm the design review gate passed
5. **Next Action**: Approval workflow guidance (see Safety & Fallback)
6. **Research Log**: Confirm `research.md` updated with latest decisions

**Format**: Concise Markdown (under 200 words) - this is the command output, NOT the design document itself

**Note**: The actual design document follows `{{KIRO_DIR}}/settings/templates/specs/design.md` structure.

## Safety & Fallback

### Error Scenarios

**Requirements Not Approved**:
- **Stop Execution**: Cannot proceed without approved requirements
- **User Message**: "Requirements not yet approved. Approval required before design generation."
- **Suggested Action**: "Run `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed"

**Missing Requirements**:
- **Stop Execution**: Requirements document must exist
- **User Message**: "No requirements.md found at `{{KIRO_DIR}}/specs/{feature}/requirements.md`"
- **Suggested Action**: "Run `/kiro-spec-requirements {feature}` to generate requirements first"

**Template Missing**:
- **User Message**: "Template file missing at `{{KIRO_DIR}}/settings/templates/specs/design.md`"
- **Suggested Action**: "Check repository setup or restore template file"
- **Fallback**: Use inline basic structure with warning

**Steering Context Missing**:
- **Warning**: "Steering directory empty or missing - design may not align with project standards"
- **Proceed**: Continue with generation but note limitation in output

**Invalid Requirement IDs**:
  - **Stop Execution**: If requirements.md is missing numeric IDs or uses non-numeric headings (for example, "Requirement A"), stop and instruct the user to fix requirements.md before continuing.

**Spec Gap Found During Design Review**:
- **Stop Execution**: Do not write a patched-over `design.md`
- **User Message**: "Design review found a real spec gap or ambiguity that must be resolved before design can be finalized."
- **Suggested Action**: Clarify or fix `requirements.md`, then re-run `/kiro-spec-design {feature}`

### Next Phase: Task Generation

**If Design Approved**:
- **Optional**: Run `/kiro-validate-design {feature}` for interactive quality review
- Run `/kiro-spec-tasks {feature}` to generate implementation tasks
- Or `/kiro-spec-tasks {feature} -y` to auto-approve and proceed directly

**If Modifications Needed**:
- Provide feedback and re-run `/kiro-spec-design {feature}`
- Existing design used as reference (merge mode)



---

# SKILL: kiro-spec-init

---
name: kiro-spec-init
description: Initialize a new specification with detailed project description
allowed-tools: Bash, Read, Write, Glob, AskUserQuestion
argument-hint: <project-description>
---

# Spec Initialization

<instructions>
## Core Task
Generate a unique feature name from the project description ($ARGUMENTS) and initialize the specification structure.

## Execution Steps
1. **Check for Brief**: If `{{KIRO_DIR}}/specs/{feature-name}/brief.md` exists (created by `/kiro-discovery`), read it. The brief contains problem, approach, scope, and constraints from the discovery session. Use this to pre-fill the project description and skip clarification questions that the brief already answers.
2. **Clarify Intent**: The Project Description in requirements.md must contain three elements: (a) who has the problem, (b) current situation, (c) what should change. If a brief.md exists and covers these, skip to step 3. Otherwise, ask the user to clarify before proceeding. Ask as many questions as needed; do not fill in gaps with your own assumptions.
3. **Check Uniqueness**: Verify `{{KIRO_DIR}}/specs/` for naming conflicts. If the directory already exists with only `brief.md` (no `spec.json`), use that directory (discovery created it).
4. **Create Directory**: `{{KIRO_DIR}}/specs/[feature-name]/` (skip if already exists from discovery)
5. **Initialize Files Using Templates**:
   - Read `{{KIRO_DIR}}/settings/templates/specs/init.json`
   - Read `{{KIRO_DIR}}/settings/templates/specs/requirements-init.md`
   - Replace placeholders:
     - `{{FEATURE_NAME}}` → generated feature name
     - `{{TIMESTAMP}}` → current ISO 8601 timestamp
     - `{{PROJECT_DESCRIPTION}}` → from brief.md if available, otherwise $ARGUMENTS
     - `{{LANG_CODE}}` → language code (detect from user's input language, default to `en`)
   - Write `spec.json` and `requirements.md` to spec directory

## Important Constraints
- Do NOT generate requirements, design, or tasks. This skill only creates spec.json and requirements.md.
</instructions>

## Output Description
Provide output in the language specified in `spec.json` with the following structure:

1. **Generated Feature Name**: `feature-name` format with 1-2 sentence rationale
2. **Project Summary**: Brief summary (1 sentence)
3. **Created Files**: Bullet list with full paths
4. **Next Step**: Command block showing `/kiro-spec-requirements <feature-name>`

**Format Requirements**:
- Use Markdown headings (##, ###)
- Wrap commands in code blocks
- Keep total output concise (under 250 words)
- Use clear, professional language per `spec.json.language`

## Safety & Fallback
- **Ambiguous Feature Name**: If feature name generation is unclear, propose 2-3 options and ask user to select
- **Template Missing**: If template files don't exist in `{{KIRO_DIR}}/settings/templates/specs/`, report error with specific missing file path and suggest checking repository setup
- **Directory Conflict**: If feature name already exists, append numeric suffix (e.g., `feature-name-2`) and notify user of automatic conflict resolution
- **Write Failure**: Report error with specific path and suggest checking permissions or disk space



---

# SKILL: kiro-spec-quick

---
name: kiro-spec-quick
description: Quick spec generation with interactive or automatic mode
allowed-tools: Read, Skill, Bash, Write, Glob, Agent
argument-hint: <project-description> [--auto]
---

# Quick Spec Generator

<instructions>
## CRITICAL: Automatic Mode Execution Rules

**If `--auto` flag is present in `$ARGUMENTS`, you are in AUTOMATIC MODE.**

In Automatic Mode:
- Execute ALL 4 phases in a continuous loop without stopping
- Display progress after each phase (e.g., "Phase 1/4 complete: spec initialized")
- IGNORE any "Next Step" messages from Phase 2-4 (they are for standalone usage)
- After Phase 4, run the final sanity review before exiting
- Stop ONLY after the sanity review completes or if error occurs

---

## Core Task
Execute 4 spec phases sequentially. In automatic mode, execute all phases without stopping. In interactive mode, prompt user for approval between phases.

Before claiming quick generation is complete, run one lightweight sanity review over the generated requirements, design, and tasks. If the host supports fresh subagents, use one. Otherwise run the sanity review inline.

## Execution Steps

### Step 1: Parse Arguments and Initialize

Parse `$ARGUMENTS`:
- If contains `--auto`: **Automatic Mode** (execute all 4 phases)
- Otherwise: **Interactive Mode** (prompt at each phase)
- Extract description (remove `--auto` flag if present)

Example:
```
"User profile with avatar upload --auto" → mode=automatic, description="User profile with avatar upload"
"User profile feature" → mode=interactive, description="User profile feature"
```

Display mode banner and proceed to Step 2.

### Step 2: Execute Phase Loop

Execute these 4 phases in order:

---

#### Phase 1: Initialize Spec (Direct Implementation)

**Core Logic**:

1. **Check for Brief**:
   - If `{{KIRO_DIR}}/specs/{feature-name}/brief.md` exists (created by `/kiro-discovery`), read it for discovery context (problem, approach, scope, constraints)
   - Use brief content as the project description instead of `$ARGUMENTS`

2. **Generate Feature Name**:
   - Convert description to kebab-case
   - Example: "User profile with avatar upload" → "user-profile-avatar-upload"
   - Keep name concise (2-4 words ideally)

3. **Check Uniqueness**:
   - Use Glob to check `{{KIRO_DIR}}/specs/*/`
   - If directory exists with only `brief.md` (no `spec.json`), use that directory (discovery created it)
   - Otherwise if feature name exists, append `-2`, `-3`, etc.

4. **Create Directory**:
   - Use Bash: `mkdir -p {{KIRO_DIR}}/specs/{feature-name}` (skip if already exists from discovery)

5. **Initialize Files from Templates**:

   a. Read templates:
   ```
   - {{KIRO_DIR}}/settings/templates/specs/init.json
   - {{KIRO_DIR}}/settings/templates/specs/requirements-init.md
   ```

   b. Replace placeholders:
   ```
   {{FEATURE_NAME}} → feature-name
   {{TIMESTAMP}} → current ISO 8601 timestamp (use `date -u +"%Y-%m-%dT%H:%M:%SZ"`)
   {{PROJECT_DESCRIPTION}} → description
   {{LANG_CODE}} → language code (detect from user's input language, default to `en`)
   ```

   c. Write files using Write tool:
   ```
   - {{KIRO_DIR}}/specs/{feature-name}/spec.json
   - {{KIRO_DIR}}/specs/{feature-name}/requirements.md
   ```

6. **Output Progress**: "Phase 1/4 complete: Spec initialized at {{KIRO_DIR}}/specs/{feature-name}/"

**Automatic Mode**: IMMEDIATELY continue to Phase 2.

**Interactive Mode**: Prompt "Continue to requirements generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 2

---

#### Phase 2: Generate Requirements

Invoke `/kiro-spec-requirements {feature-name}` via the Skill tool.

Wait for completion. IGNORE any "Next Step" message (it is for standalone usage).

**Output Progress**: "Phase 2/4 complete: Requirements generated"

**Automatic Mode**: IMMEDIATELY continue to Phase 3.

**Interactive Mode**: Prompt "Continue to design generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 3

---

#### Phase 3: Generate Design

Invoke `/kiro-spec-design {feature-name} -y` via the Skill tool. The `-y` flag auto-approves requirements.

Wait for completion. IGNORE any "Next Step" message.

**Output Progress**: "Phase 3/4 complete: Design generated"

**Automatic Mode**: IMMEDIATELY continue to Phase 4.

**Interactive Mode**: Prompt "Continue to tasks generation? (yes/no)"
- If "no": Stop, show current state
- If "yes": Continue to Phase 4

---

#### Phase 4: Generate Tasks

Invoke `/kiro-spec-tasks {feature-name} -y` via the Skill tool.

Note: `-y` flag auto-approves requirements, design, and tasks.

Wait for completion.

**Output Progress**: "Phase 4/4 complete: Tasks generated"

#### Final Sanity Review

After Phase 4, run a lightweight sanity review before claiming completion.

- Review `requirements.md`, `design.md`, and `tasks.md` directly from disk. If `brief.md` exists, use it only as supporting context.
- Prefer a fresh review subagent when the host supports it. Pass only file paths and the review objective; the reviewer should read the generated files itself.
- Review focus:
  - Do requirements, design, and tasks tell a coherent story?
  - Are there obvious contradictions, missing prerequisites, or missing task coverage for required design work?
  - Are `_Depends:_`, `_Boundary:_`, and `(P)` markers plausible for implementation?
- If the review finds only task-plan-local issues, repair or update the generated `tasks.md` once, then re-run the sanity review.
- If the review finds a real requirements/design gap or contradiction, stop and report follow-up instead of claiming the quick spec is implementation-ready.

**All 4 phases plus sanity review complete.**

Output final completion summary (see Output Description section) and exit.

---

## Important Constraints

### Error Handling
- Any phase failure stops the workflow
- Display error and current state
- Suggest manual recovery command

</instructions>

## Output Description

### Mode Banners

**Interactive Mode**:
```
Quick Spec Generation (Interactive Mode)

You will be prompted at each phase.
Note: Skips gap analysis and design validation.
```

**Automatic Mode**:
```
Quick Spec Generation (Automatic Mode)

All phases execute automatically without prompts.
Note: Skips optional validations (gap analysis, design review) and user approval prompts. Internal review gates still run.
Final sanity review still runs.
```

### Intermediate Output

After each phase, show brief progress:
```
Spec initialized at {{KIRO_DIR}}/specs/{feature}/
Requirements generated → Continuing to design...
Design generated → Continuing to tasks...
```

### Final Completion Summary

Provide output in the language specified in `spec.json`:

```
Quick Spec Generation Complete!

Generated Files:
- specs/{feature}/spec.json
- specs/{feature}/requirements.md ({X} requirements)
- specs/{feature}/design.md ({Y} components, {Z} endpoints)
- specs/{feature}/tasks.md ({N} tasks)

Skipped: /kiro-validate-gap, /kiro-validate-design

Sanity review: PASSED | FOLLOW-UP REQUIRED

Next Steps:
1. Review generated specs (especially design.md)
2. Optional: `/kiro-validate-gap {feature}`, `/kiro-validate-design {feature}`
3. Start implementation: `/kiro-impl {feature}`
```

## Safety & Fallback

### Error Scenarios

**Template Missing**:
- Check `{{KIRO_DIR}}/settings/templates/specs/` exists
- Report specific missing file
- Exit with error

**Directory Creation Failed**:
- Check permissions
- Report error with path
- Exit with error

**Phase Execution Failed** (Phase 2-4):
- Stop workflow
- Show current state and completed phases
- Suggest: "Continue manually from `/kiro-spec-{next-phase} {feature}`"

**Sanity Review Failed**:
- Stop workflow
- Report the exact contradiction, missing prerequisite, or task-plan issue
- Suggest targeted follow-up with `/kiro-spec-design {feature}`, `/kiro-spec-tasks {feature}`, or manual edits depending on the finding

**User Cancellation** (Interactive Mode):
- Stop gracefully
- Show completed phases
- Suggest manual continuation



---

# SKILL: kiro-spec-requirements

---
name: kiro-spec-requirements
description: Generate EARS-format requirements based on project description and steering context. Use when generating requirements from project description.
allowed-tools: Read, Write, Edit, Glob, Grep, Agent, WebSearch, WebFetch, AskUserQuestion
metadata:
  shared-rules: "ears-format.md, requirements-review-gate.md"
---

# kiro-spec-requirements Skill

## Core Mission
- **Success Criteria**:
  - Create complete requirements document aligned with steering context
  - Follow the project's EARS patterns and constraints for all acceptance criteria
  - Focus on core functionality without implementation details
  - Make inclusion/exclusion boundaries explicit when scope could otherwise be misread
  - Update metadata to track generation status

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json` for language and metadata
- Read `{{KIRO_DIR}}/specs/{feature}/brief.md` if it exists (discovery context: problem, approach, scope decisions, boundary candidates)
- Read `{{KIRO_DIR}}/specs/{feature}/requirements.md` for project description
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to feature scope, user personas, business/domain rules, compliance/security constraints, operational constraints, or existing product boundaries
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

### Step 2: Read Guidelines
- Read `rules/ears-format.md` from this skill's directory for EARS syntax rules
- Read `rules/requirements-review-gate.md` from this skill's directory for pre-write review criteria
- Read `{{KIRO_DIR}}/settings/templates/specs/requirements.md` for document structure

#### Parallel Research (subagent dispatch)

The following research areas are independent. Decide the optimal decomposition based on project complexity -- split, merge, add, or skip subagents as needed.

**Delegate to subagent via Agent tool** (keeps exploration out of main context):
- **Codebase hints** (brownfield projects): Dispatch a subagent to explore existing implementations that inform requirement scope. Example prompt: "Explore this codebase for existing features related to [feature area]. Summarize: (1) what already exists, (2) relevant interfaces/APIs, (3) patterns that new requirements should align with. Return a summary under 150 lines."
- **Domain research** (when external knowledge is needed): Dispatch a subagent for WebSearch/WebFetch to research domain-specific requirements, standards, or best practices. Return a concise findings summary.
- **Additional steering and playbooks**: If many steering files or local agent playbooks exist, dispatch a subagent to scan them and return only the sections relevant to this feature.

For greenfield projects with minimal codebase, skip subagent dispatch and load context directly.

After all research completes, synthesize findings in main context before generating requirements.

### Step 3: Generate Requirements Draft
- Create initial requirements draft based on project description
- Group related functionality into logical requirement areas
- Apply EARS format to all acceptance criteria
- Use language specified in spec.json
- Preserve terminology continuity across phases:
  - discovery = `Boundary Candidates`
  - requirements = explicit inclusion/exclusion and adjacent expectations when needed
  - design = `Boundary Commitments`
  - tasks = `_Boundary:_`
- If scope could be misread, add lightweight boundary context without introducing implementation or architecture ownership detail
- Keep this as a draft until the review gate passes; do not write `requirements.md` yet

### Step 4: Review Requirements Draft
- Run the `Requirements Review Gate` from `rules/requirements-review-gate.md`
- Review coverage, EARS compliance, ambiguity, adjacent expectations, and scope boundaries before finalizing
- If issues are local to the draft, repair the requirements and review again
- Keep the review bounded to at most 2 repair passes
- If the draft exposes a real scope ambiguity or contradiction, stop and ask the user to clarify instead of writing guessed requirements

### Step 5: Finalize and Update Metadata
- Write `{{KIRO_DIR}}/specs/{feature}/requirements.md` only after the requirements review gate passes
- Set `phase: "requirements-generated"`
- Set `approvals.requirements.generated: true`
- Update `updated_at` timestamp

## Important Constraints

### Requirements Scope: WHAT, not HOW
Requirements describe user-observable behavior, not implementation. Use this to decide what belongs here vs. in design:

**Ask the user about (requirements scope):**
- Functional scope — what is included and what is excluded
- User-observable behavior — "when X happens, what should the user see/experience?"
- Business rules and edge cases — limits, error conditions, special cases
- Non-functional requirements visible to users — response time expectations, availability, security level
- Adjacent expectations only when they change user-visible behavior or operator expectations — what this feature relies on, and what it explicitly does not own

**Do not ask about (design scope — defer to design phase):**
- Technology stack choices (database, framework, language)
- Architecture patterns (microservices, monolith, event-driven)
- API design, data models, internal component structure
- How to achieve non-functional requirements (caching strategy, scaling approach)
- Internal ownership mapping, component seams, or implementation boundaries that belong in design

**Litmus test**: If an EARS acceptance criterion can be written without mentioning any technology, it belongs in requirements. If it requires a technology choice, it belongs in design.

### Other Constraints
- Each requirement must be testable and unambiguous. If the project description leaves room for multiple interpretations on scope, behavior, or boundary conditions, ask the user to clarify before generating that requirement. Ask as many questions as needed; do not generate requirements that contain your own assumptions.
- Choose appropriate subject for EARS statements (system/service name for software)
- Requirement headings in requirements.md MUST include a leading numeric ID only (for example: "Requirement 1", "1.", "2 Feature ..."); do not use alphabetic IDs like "Requirement A".

## Output Description
Provide output in the language specified in spec.json with:

1. **Generated Requirements Summary**: Brief overview of major requirement areas (3-5 bullets)
2. **Document Status**: Confirm requirements.md updated and spec.json metadata updated
3. **Review Gate**: Confirm the requirements review gate passed
4. **Next Steps**: Guide user on how to proceed (approve and continue, or modify)

**Format Requirements**:
- Use Markdown headings for clarity
- Include file paths in code blocks
- Keep summary concise (under 300 words)

## Safety & Fallback

### Error Scenarios
- **Missing Project Description**: If requirements.md lacks project description, ask user for feature details
- **Template Missing**: If template files don't exist, use inline fallback structure with warning
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language
- **Incomplete Requirements**: After generation, explicitly ask user if requirements cover all expected functionality
- **Steering Directory Empty**: Warn user that project context is missing and may affect requirement quality
- **Non-numeric Requirement Headings**: If existing headings do not include a leading numeric ID (for example, they use "Requirement A"), normalize them to numeric IDs and keep that mapping consistent (never mix numeric and alphabetic labels).

### Next Phase: Design Generation

**If Requirements Approved**:
- **Optional Gap Analysis** (for existing codebases):
  - Run `/kiro-validate-gap {feature}` to analyze implementation gap
  - Recommended for brownfield projects; skip for greenfield
- Run `/kiro-spec-design {feature}` to proceed to design phase
- Or `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed directly

**If Modifications Needed**:
- Provide feedback and re-run `/kiro-spec-requirements {feature}`



---

# SKILL: kiro-spec-status

---
name: kiro-spec-status
description: Show specification status and progress
allowed-tools: Read, Glob, Grep
argument-hint: <feature-name>
---

# kiro-spec-status Skill

## Core Mission
- **Success Criteria**:
  - Show current phase and completion status
  - Identify next actions and blockers
  - Provide clear visibility into progress
  - Surface boundary readiness, upstream/downstream context, and likely revalidation needs when available

## Execution Steps

### Step 1: Load Spec Context
- Read `{{KIRO_DIR}}/specs/$ARGUMENTS/spec.json` for metadata and phase status
- Read `{{KIRO_DIR}}/specs/$ARGUMENTS/brief.md` if it exists
- Read existing files: `requirements.md`, `design.md`, `tasks.md` (if they exist)
- Check `{{KIRO_DIR}}/specs/$ARGUMENTS/` directory for available files
- Read `{{KIRO_DIR}}/steering/roadmap.md` if it exists and this spec appears in it

### Step 2: Analyze Status

**Parse each phase**:
- **Requirements**: Count requirements and acceptance criteria
- **Design**: Check for architecture, components, diagrams, and whether boundary sections are present
- **Tasks**: Count completed vs total tasks (parse `- [x]` vs `- [ ]`)
- **Approvals**: Check approval status in spec.json
- **Boundary context**:
  - From brief.md: note `Boundary Candidates`, `Upstream / Downstream`, and `Existing Spec Touchpoints` if present
  - From design.md: note `Boundary Commitments`, `Out of Boundary`, `Allowed Dependencies`, and `Revalidation Triggers` if present
  - From roadmap.md: note upstream dependencies and whether this spec is adjacent to `Existing Spec Updates`
- **Revalidation watchlist**:
  - Identify downstream specs, neighboring existing-spec updates, or rollout-sensitive design notes that may need revalidation if this spec changes
  - Call out when the current spec shape looks too broad and may want roadmap/design splitting instead of more local repair

### Step 3: Generate Report

Create report in the language specified in spec.json covering:
1. **Current Phase & Progress**: Where the spec is in the workflow
2. **Completion Status**: Percentage complete for each phase
3. **Task Breakdown**: If tasks exist, show completed/remaining counts
4. **Boundary Context**: Upstream/downstream, out-of-boundary, and allowed dependency notes when available
5. **Revalidation Watchlist**: Downstream or adjacent work likely affected by changes to this spec
6. **Next Actions**: What needs to be done next
7. **Blockers**: Any issues preventing progress

**Format**: Clear, scannable format with emojis for status

## Safety & Fallback

### Error Scenarios

**Spec Not Found**:
- **Message**: "No spec found for `$ARGUMENTS`. Check available specs in `{{KIRO_DIR}}/specs/`"
- **Action**: List available spec directories

**Incomplete Spec**:
- **Warning**: Identify which files are missing
- **Suggested Action**: Point to next phase command

### List All Specs

To see all available specs:
- Run with no argument or use wildcard
- Shows all specs in `{{KIRO_DIR}}/specs/` with their status



---

# SKILL: kiro-spec-tasks

---
name: kiro-spec-tasks
description: Generate implementation tasks from requirements and design. Use when creating actionable task lists.
allowed-tools: Read, Write, Edit, Glob, Grep, Agent
argument-hint: <feature-name> [-y] [--sequential]
metadata:
  shared-rules: "tasks-generation.md, tasks-parallel-analysis.md"
---

# kiro-spec-tasks Skill

## Core Mission
- **Success Criteria**:
  - All requirements mapped to specific tasks
  - Tasks properly sized (1-3 hours each)
  - Clear task progression with proper hierarchy
  - Natural language descriptions focused on capabilities
  - A lightweight task-plan sanity review confirms the task graph is executable before `tasks.md` is written

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- `{{KIRO_DIR}}/specs/{feature}/spec.json`, `requirements.md`, `design.md`
- `{{KIRO_DIR}}/specs/{feature}/tasks.md` (if exists, for merge mode)
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to requirements coverage, design boundaries, runtime prerequisites, or team conventions that affect task executability
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

- Determine execution mode:
  - `sequential = (sequential flag is true)`

**Validate approvals**:
- If auto-approve flag (`-y`) is true: Auto-approve requirements and design in spec.json. Tasks approval is also handled automatically in Step 4.
- Otherwise: Verify both approved (stop if not, see Safety & Fallback)

### Step 2: Generate Implementation Tasks

- Read `rules/tasks-generation.md` from this skill's directory for principles
- Read `rules/tasks-parallel-analysis.md` from this skill's directory for parallel judgement criteria
- Read `{{KIRO_DIR}}/settings/templates/specs/tasks.md` for format (supports `(P)` markers)

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Context loading**: Spec documents (requirements.md, design.md), steering files
2. **Rules loading**: tasks-generation.md, tasks-parallel-analysis.md, tasks template

After all parallel research completes, synthesize findings before generating tasks.

**Generate task list following all rules**:
- Use language specified in spec.json
- Map all requirements to tasks and list numeric requirement IDs only (comma-separated) without descriptive suffixes, parentheses, translations, or free-form labels
- Ensure all design components included
- Verify task progression is logical and incremental
- Ensure each executable sub-task includes at least one detail bullet that states what "done" looks like in observable terms
- Keep normal implementation tasks within a single responsibility boundary; if work crosses boundaries, make it an explicit integration task
- Apply `(P)` markers to tasks that satisfy parallel criteria when `!sequential`
- Explicitly note dependencies preventing `(P)` when tasks appear parallel but are not safe
- If sequential mode is true, omit `(P)` entirely
- If existing tasks.md found, merge with new content

### Step 3: Review Task Plan

- Keep the draft task plan in working memory; do NOT write `tasks.md` yet
- Run the `Task Plan Review Gate` from `rules/tasks-generation.md`
- Review coverage:
  - Every requirement ID appears in at least one task
  - Every design component, contract, integration point, runtime prerequisite, and validation concern is represented
- Review executability:
  - Each sub-task is an executable 1-3 hour work unit
  - Each sub-task has a verifiable deliverable
  - Each executable sub-task includes an observable completion bullet
  - No implicit prerequisites remain hidden
  - `_Depends:_`, `_Boundary:_`, and `(P)` markers still match the dependency graph and architecture boundaries
- If issues are task-plan-local, repair the draft and re-run the review gate before writing
- Keep the review bounded to at most 2 repair passes
- If review exposes a real requirements/design gap or contradiction, stop and send the user back to requirements/design instead of inventing filler tasks

### Step 3.5: Run Task-Graph Sanity Review

Before writing `tasks.md`, run one lightweight independent sanity review of the task graph.

- If fresh subagent dispatch is available, spawn one fresh review subagent for this step and record the review mode as `independent`. Otherwise perform the same review in the current context and record the mode as `inline`.
- Provide only file paths, the draft task plan, and merge context if an existing `tasks.md` is being updated. The reviewer should read `requirements.md`, `design.md`, and the task-generation rules directly instead of relying on a parent-synthesized coverage summary.
- Check only:
  - hidden prerequisites or missing setup tasks
  - dependency or ordering mistakes
  - boundary overlap or ambiguous ownership between tasks
  - tasks that are too large, too vague, cross boundaries without being explicit integration tasks, or are missing a verifiable deliverable
  - contradictions introduced between requirements, design, and the task graph
- Return one verdict:
  - `PASS`
  - `NEEDS_FIXES`
  - `RETURN_TO_DESIGN`
- If `NEEDS_FIXES`, repair the draft once and re-run the sanity review one time.
- If the second verdict is not `PASS`, stop without writing `tasks.md` or approving the task plan. Report the remaining findings; do not retry again or advance to Finalize.
- If `RETURN_TO_DESIGN`, stop without writing `tasks.md` and point back to the exact gap in requirements/design.
- Keep this bounded. Do not turn it into a second full planning cycle.

### Step 4: Finalize

Proceed only when the Task Plan Review Gate is satisfied and the latest task-graph sanity verdict is `PASS`. The `-y` flag never bypasses these review gates.

**Write tasks.md**:
- Create/update `{{KIRO_DIR}}/specs/{feature}/tasks.md`
- Update spec.json metadata:
  - Set `phase: "tasks-generated"`
  - Set `approvals.tasks.generated: true, approved: false`
  - Set `approvals.requirements.approved: true`
  - Set `approvals.design.approved: true`
  - Update `updated_at` timestamp

**Approval**:
- If auto-approve flag (`-y`) is true:
  - Set `approvals.tasks.approved: true` in spec.json
  - Display task summary (task count, major groups, parallel markers)
  - Respond: "Tasks generated and auto-approved. Start implementation with `/kiro-impl {feature}`"
- Otherwise (interactive):
  - Display a summary of the generated tasks (task count, major groups, parallel markers)
  - Ask the user: "Tasks generated. Approve and proceed to implementation?"
  - If the user approves:
    - Set `approvals.tasks.approved: true` in spec.json
    - Respond: "Tasks approved. Start implementation with `/kiro-impl {feature}`"
  - If the user wants changes:
    - Keep `approvals.tasks.approved: false`
    - Respond with guidance on what to adjust and re-run

## Critical Constraints
- **Task Integration**: Every task must connect to the system (no orphaned work)
- **Boundary annotations**: Required for `(P)` tasks, recommended for all (`_Boundary: ComponentName_`)
- **Explicit dependencies**: Cross-boundary non-obvious dependencies declared with `_Depends: X.X_`
- **Executable deliverable granularity**: Each task must produce a verifiable deliverable (file, endpoint, UI component, config). Infrastructure tasks (project scaffolding, manifest, host integration, build config) must be explicit — never assume they exist
- **Observable done state**: Each executable sub-task must include at least one detail bullet that makes the completed state visible without adding new bookkeeping fields
- **No implicit prerequisites**: If a task requires a runtime, SDK, framework setup, or config file, that setup must be a separate preceding task

## Output Description

Provide brief summary in the language specified in spec.json:

1. **Status**: Confirm tasks generated at `{{KIRO_DIR}}/specs/{feature}/tasks.md`
2. **Task Summary**:
   - Total: X major tasks, Y sub-tasks
   - All Z requirements covered
   - Average task size: 1-3 hours per sub-task
3. **Quality Validation**:
   - All requirements mapped to tasks
   - Design coverage and runtime prerequisites reviewed
   - Task dependencies verified
   - Task plan review gate passed
   - Task-graph sanity review: `PASS`; report the actual mode (`independent` or `inline`)
   - Testing tasks included
4. **Next Action**: Review tasks and proceed when ready

**Format**: Concise (under 200 words)

## Safety & Fallback

### Error Scenarios

**Requirements or Design Not Approved**:
- **Stop Execution**: Cannot proceed without approved requirements and design
- **User Message**: "Requirements and design must be approved before task generation"
- **Suggested Action**: "Run `/kiro-spec-tasks {feature} -y` to auto-approve all (requirements, design, and tasks) and proceed"

**Missing Requirements or Design**:
- **Stop Execution**: Both documents must exist
- **User Message**: "Missing requirements.md or design.md at `{{KIRO_DIR}}/specs/{feature}/`"
- **Suggested Action**: "Complete requirements and design phases first"

**Incomplete Requirements Coverage**:
- **Warning**: "Not all requirements mapped to tasks. Review coverage."
- **User Action Required**: Confirm intentional gaps or regenerate tasks

**Spec Gap Found During Task Review**:
- **Stop Execution**: Do not write a patched-over `tasks.md`
- **User Message**: "Requirements/design do not provide enough clear coverage to generate an executable task plan"
- **Suggested Action**: "Refine requirements.md or design.md, then re-run `/kiro-spec-tasks {feature}`"

**Template/Rules Missing**:
- **User Message**: "Template or rules files missing in `{{KIRO_DIR}}/settings/`"
- **Fallback**: Use inline basic structure with warning
- **Suggested Action**: "Check repository setup or restore template files"
- **Missing Numeric Requirement IDs**:
  - **Stop Execution**: All requirements in requirements.md MUST have numeric IDs. If any requirement lacks a numeric ID, stop and request that requirements.md be fixed before generating tasks.

### Next Phase: Implementation

Tasks are approved in Step 4 via user confirmation. Once approved:
- Autonomous implementation: `/kiro-impl {feature}`
- Specific tasks only: `/kiro-impl {feature} 1.1,1.2`



---

# SKILL: kiro-steering-custom

---
name: kiro-steering-custom
description: Create custom steering documents for specialized project contexts. Use when creating domain-specific steering files.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  shared-rules: "steering-principles.md"
---

# kiro-steering-custom Skill

## Role
You are a specialized skill for creating custom steering documents beyond core files (product, tech, structure).

## Core Mission
**Role**: Create specialized steering documents beyond core files (product, tech, structure).

**Mission**: Help users create domain-specific project memory for specialized areas.

**Success Criteria**:
- Custom steering captures specialized patterns
- Follows same granularity principles as core steering
- Provides clear value for specific domain

## Execution Steps

### Step 1: Gather Context

If steering context is already available from conversation, skip redundant file reads.
Otherwise:
- Check `{{KIRO_DIR}}/settings/templates/steering-custom/` for available templates
- Read `rules/steering-principles.md` from this skill's directory for steering principles

## Workflow

1. **Ask user** for custom steering needs:
   - Domain/topic (e.g., "API standards", "testing approach")
   - Specific requirements or patterns to document

2. **Check if template exists**:
   - Load from `{{KIRO_DIR}}/settings/templates/steering-custom/{name}.md` if available
   - Use as starting point, customize based on project

3. **Analyze codebase** (JIT) for relevant patterns:

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Template & principles**: Load matching template and steering-principles.md
2. **Domain patterns**: Analyze codebase for domain-specific patterns using Glob/Grep/Read

After all parallel research completes, synthesize findings for steering document.

4. **Generate custom steering**:
   - Follow template structure if available
   - Apply principles from `rules/steering-principles.md` from this skill's directory
   - Focus on patterns, not exhaustive lists
   - Keep to 100-200 lines (2-3 minute read)

5. **Create file** in `{{KIRO_DIR}}/steering/{name}.md`

## Available Templates

Templates available in `{{KIRO_DIR}}/settings/templates/steering-custom/`:

1. **api-standards.md** - REST/GraphQL conventions, error handling
2. **testing.md** - Test organization, mocking, coverage
3. **security.md** - Auth patterns, input validation, secrets
4. **database.md** - Schema design, migrations, query patterns
5. **error-handling.md** - Error types, logging, retry strategies
6. **authentication.md** - Auth flows, permissions, session management
7. **deployment.md** - CI/CD, environments, rollback procedures

Load template when needed, customize for project.

## Steering Principles

From `rules/steering-principles.md` (in this skill's directory):

- **Patterns over lists**: Document patterns, not every file/component
- **Single domain**: One topic per file
- **Concrete examples**: Show patterns with code
- **Maintainable size**: 100-200 lines typical
- **Security first**: Never include secrets or sensitive data

## Tool Guidance

- **Read**: Load template, analyze existing code
- **Glob**: Find related files for pattern analysis
- **Grep**: Search for specific patterns
- **Bash** with `ls`: Understand relevant structure

**JIT Strategy**: Load template only when creating that type of steering.

## Output Description

Chat summary with file location (file created directly).

```
Custom Steering Created

## Created:
- {{KIRO_DIR}}/steering/api-standards.md

## Based On:
- Template: api-standards.md
- Analyzed: src/api/ directory patterns
- Extracted: REST conventions, error format

## Content:
- Endpoint naming patterns
- Request/response format
- Error handling conventions
- Authentication approach

Review and customize as needed.
```

## Examples

### Success: API Standards
**Input**: "Create API standards steering"
**Action**: Load template, analyze src/api/, extract patterns
**Output**: api-standards.md with project-specific REST conventions

### Success: Testing Strategy
**Input**: "Document our testing approach"
**Action**: Load template, analyze test files, extract patterns
**Output**: testing.md with test organization and mocking strategies

## Safety & Fallback

- **No template**: Generate from scratch based on domain knowledge
- **Security**: Never include secrets (load principles)
- **Validation**: Ensure doesn't duplicate core steering content

## Notes

- Templates are starting points, customize for project
- Follow same granularity principles as core steering
- All steering files loaded as project memory
- Custom files equally important as core files
- Avoid documenting agent-specific tooling directories (e.g. `.cursor/`, `.gemini/`, `.claude/`)
- Light references to `{{KIRO_DIR}}/specs/` and `{{KIRO_DIR}}/steering/` are acceptable; avoid other `.kiro/` directories



---

# SKILL: kiro-steering

---
name: kiro-steering
description: Maintain {{KIRO_DIR}}/steering/ as persistent project memory (bootstrap/sync). Use when initializing or updating steering documents.
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
metadata:
  shared-rules: "steering-principles.md"
---

# kiro-steering Skill

## Role
You are a specialized skill for maintaining `{{KIRO_DIR}}/steering/` as persistent project memory.

## Core Mission
**Role**: Maintain `{{KIRO_DIR}}/steering/` as persistent project memory.

**Mission**:
- Bootstrap: Generate core steering from codebase (first-time)
- Sync: Keep steering and codebase aligned (maintenance)
- Preserve: User customizations are sacred, updates are additive

**Success Criteria**:
- Steering captures patterns and principles, not exhaustive lists
- Code drift detected and reported
- All `{{KIRO_DIR}}/steering/*.md` treated equally (core + custom)

## Execution Steps

### Step 1: Gather Context

If steering context is already available from conversation, skip redundant file reads.

- For Bootstrap mode: Read templates from `{{KIRO_DIR}}/settings/templates/steering/`
- For Sync mode: Read all existing `{{KIRO_DIR}}/steering/*.md` files
- Read `rules/steering-principles.md` from this skill's directory for steering principles

## Scenario Detection

Check `{{KIRO_DIR}}/steering/` status:

**Bootstrap Mode**: Empty OR missing core files (product.md, tech.md, structure.md)
**Sync Mode**: All core files exist

---

## Bootstrap Flow

1. Load templates from `{{KIRO_DIR}}/settings/templates/steering/`
2. Analyze codebase (JIT):

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Product analysis**: README, package.json, documentation files for purpose, value, core capabilities
2. **Tech analysis**: Config files, dependencies, frameworks for technology patterns and decisions
3. **Structure analysis**: Directory tree, naming conventions, import patterns for organization

After all parallel research completes, synthesize patterns for steering files.

3. Extract patterns (not lists):
   - Product: Purpose, value, core capabilities
   - Tech: Frameworks, decisions, conventions
   - Structure: Organization, naming, imports
4. Generate steering files (follow templates)
5. Load principles from `rules/steering-principles.md` from this skill's directory
6. Present summary for review

**Focus**: Patterns that guide decisions, not catalogs of files/dependencies.

---

## Sync Flow

1. Load all existing steering (`{{KIRO_DIR}}/steering/*.md`)
2. Analyze codebase for changes (JIT)
3. Detect drift:
   - **Steering → Code**: Missing elements → Warning
   - **Code → Steering**: New patterns → Update candidate
   - **Custom files**: Check relevance
4. Propose updates (additive, preserve user content)
5. Report: Updates, warnings, recommendations

**Update Philosophy**: Add, don't replace. Preserve user sections.

---

## Granularity Principle

From `rules/steering-principles.md` (in this skill's directory):

> "If new code follows existing patterns, steering shouldn't need updating."

Document patterns and principles, not exhaustive lists.

**Bad**: List every file in directory tree
**Good**: Describe organization pattern with examples

## Tool Guidance

- `Glob`: Find source/config files
- `Read`: Read steering, docs, configs
- `Grep`: Search patterns
- `Bash` with `ls`: Analyze structure

**JIT Strategy**: Fetch when needed, not upfront.

## Output Description

Chat summary only (files updated directly).

### Bootstrap:
```
Steering Created

## Generated:
- product.md: [Brief description]
- tech.md: [Key stack]
- structure.md: [Organization]

Review and approve as Source of Truth.
```

### Sync:
```
Steering Updated

## Changes:
- tech.md: React 18 → 19
- structure.md: Added API pattern

## Code Drift:
- Components not following import conventions

## Recommendations:
- Consider api-standards.md
```

## Examples

### Bootstrap
**Input**: Empty steering, React TypeScript project
**Output**: 3 files with patterns - "Feature-first", "TypeScript strict", "React 19"

### Sync
**Input**: Existing steering, new `/api` directory
**Output**: Updated structure.md, flagged non-compliant files, suggested api-standards.md

## Safety & Fallback

- **Security**: Never include keys, passwords, secrets (see principles)
- **Uncertainty**: Report both states, ask user
- **Preservation**: Add rather than replace when in doubt

## Notes

- All `{{KIRO_DIR}}/steering/*.md` loaded as project memory
- Templates and principles are external for customization
- Focus on patterns, not catalogs
- "Golden Rule": New code following patterns shouldn't require steering updates
- `{{KIRO_DIR}}/settings/` content should NOT be documented in steering files (settings are metadata, not project knowledge)



---

# SKILL: kiro-validate-design

---
name: kiro-validate-design
description: Interactive technical design quality review and validation. Use when reviewing design before implementation.
allowed-tools: Read, Grep, Glob, AskUserQuestion
argument-hint: <feature-name>
metadata:
  shared-rules: "design-review.md"
---

# kiro-validate-design Skill

## Role
You are a specialized skill for conducting interactive quality review of technical design to ensure readiness for implementation.

## Core Mission
- **Mission**: Conduct interactive quality review of technical design to ensure readiness for implementation
- **Success Criteria**:
  - Critical issues identified (maximum 3 most important concerns)
  - Balanced assessment with strengths recognized
  - Clear GO/NO-GO decision with rationale
  - Actionable feedback for improvements if needed

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json` for language and metadata
- Read `{{KIRO_DIR}}/specs/{feature}/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/{feature}/design.md` for design document
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to architecture boundaries, integrations, runtime prerequisites, domain rules, security/performance constraints, or team conventions that affect implementation readiness
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Context & rules loading**: Spec documents, core steering, task-relevant extra steering, relevant local agent skills/playbooks, and `rules/design-review.md` from this skill's directory for review criteria
2. **Codebase pattern survey**: Gather existing architecture patterns, naming conventions, and component structure from the codebase to use as reference during review

After all parallel research completes, synthesize findings for review.

### Step 2: Execute Design Review
- Reference conversation history: leverage prior requirements discussion and user's stated design intent
- Follow design-review.md process: Analysis → Critical Issues → Strengths → GO/NO-GO
- Limit to 3 most important concerns
- Engage interactively with user — ask clarifying questions, propose alternatives
- Use language specified in spec.json for output

### Step 3: Decision and Next Steps
- Clear GO/NO-GO decision with rationale
- Provide specific actionable next steps (see Next Phase below)

## Important Constraints
- **Quality assurance, not perfection seeking**: Accept acceptable risk
- **Critical focus only**: Maximum 3 issues, only those significantly impacting success
- **Conversation-aware**: Leverage discussion history for requirements context and user intent
- **Interactive approach**: Engage in dialogue, ask clarifying questions, propose alternatives
- **Balanced assessment**: Recognize both strengths and weaknesses
- **Actionable feedback**: All suggestions must be implementable
- **Context Discipline**: Start with core steering and expand only with review-relevant steering or local skills/playbooks selected above

## Tool Guidance
- **Read first**: Load spec, core steering, relevant local playbooks/agent skills, and rules before review
- **Grep if needed**: Search codebase for pattern validation or integration checks
- **Interactive**: Engage with user throughout the review process

## Output Description
Provide output in the language specified in spec.json with:

1. **Review Summary**: Brief overview (2-3 sentences) of design quality and readiness
2. **Critical Issues**: Maximum 3, following design-review.md format
3. **Design Strengths**: 1-2 positive aspects
4. **Final Assessment**: GO/NO-GO decision with rationale and next steps

**Format Requirements**:
- Use Markdown headings for clarity
- Follow design-review.md output format
- Keep summary concise

## Safety & Fallback

### Error Scenarios
- **Missing Design**: If design.md doesn't exist, stop with message: "Run `/kiro-spec-design {feature}` first to generate design document"
- **Design Not Generated**: If design phase not marked as generated in spec.json, warn but proceed with review
- **Empty Steering Directory**: Warn user that project context is missing and may affect review quality
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Phase: Task Generation

**If Design Passes Validation (GO Decision)**:
- Apply any suggested improvements if agreed
- Run `/kiro-spec-tasks {feature}` to generate implementation tasks
- Or `/kiro-spec-tasks {feature} -y` to auto-approve and proceed directly

**If Design Needs Revision (NO-GO Decision)**:
- Address critical issues identified in review
- Re-run `/kiro-spec-design {feature}` with improvements
- Re-validate with `/kiro-validate-design {feature}`

**Note**: Design validation is recommended but optional. Quality review helps catch issues early.



---

# SKILL: kiro-validate-gap

---
name: kiro-validate-gap
description: Analyze implementation gap between requirements and existing codebase. Use when planning integration with existing systems.
allowed-tools: Read, Write, Grep, Glob, WebSearch, WebFetch
argument-hint: <feature-name>
metadata:
  shared-rules: "gap-analysis.md"
---

# kiro-validate-gap Skill

## Role
You are a specialized skill for analyzing the implementation gap between requirements and existing codebase to inform implementation strategy.

## Core Mission
- **Mission**: Analyze the gap between requirements and existing codebase to inform implementation strategy
- **Success Criteria**:
  - Comprehensive understanding of existing codebase patterns and components
  - Clear identification of missing capabilities and integration challenges
  - Multiple viable implementation approaches evaluated
  - Technical research needs identified for design phase

## Execution Steps

### Step 1: Gather Context

Reuse steering/spec context already available from conversation; load missing context below.
Select skills for the current task even when steering/spec context is already available:
- Read `{{KIRO_DIR}}/specs/{feature}/spec.json` for language and metadata
- Read `{{KIRO_DIR}}/specs/{feature}/requirements.md` for requirements
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the feature's domain rules, integrations, runtime prerequisites, compliance/security constraints, or existing product boundaries
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

### Step 2: Read Analysis Guidelines
- Read `rules/gap-analysis.md` from this skill's directory for comprehensive analysis framework

### Step 3: Execute Gap Analysis

#### Parallel Research

The following research areas are independent and can be executed in parallel:
1. **Codebase analysis**: Existing implementations, architecture patterns, integration points, extension possibilities (using Grep/Glob/Read)
2. **External dependency research**: Dependency compatibility, version constraints, known integration challenges (using WebSearch/WebFetch when needed)
3. **Context loading**: Requirements, core steering, task-relevant extra steering, relevant local agent skills/playbooks, and gap-analysis rules

After all parallel research completes, synthesize findings for gap analysis.

- Follow gap-analysis.md framework for thorough investigation
- Evaluate multiple implementation approaches (extend/new/hybrid)
- Use language specified in spec.json for output

### Step 4: Generate Analysis Document
- Create comprehensive gap analysis following the output guidelines in gap-analysis.md
- Present multiple viable options with trade-offs
- Flag areas requiring further research

### Step 5: Write Gap Analysis to Disk

**Write the gap analysis to disk so it survives session boundaries and can be referenced during design phase.**

- Use the Write tool to save the gap analysis to `{{KIRO_DIR}}/specs/{feature}/research.md`
- If the file already exists, append the new analysis (separated by a horizontal rule `---`) rather than overwriting previous research
- Verify the file was written by reading it back

## Important Constraints
- **Information over Decisions**: Provide analysis and options, not final implementation choices
- **Multiple Options**: Present viable alternatives when applicable
- **Thorough Investigation**: Use tools to deeply understand existing codebase
- **Explicit Gaps**: Clearly flag areas needing research or investigation
- **Context Discipline**: Start with core steering and expand only with analysis-relevant steering or local skills/playbooks selected above

## Tool Guidance
- **Read first**: Load spec, core steering, relevant local playbooks/agent skills, and rules before analysis
- **Grep extensively**: Search codebase for patterns, conventions, and integration points
- **WebSearch/WebFetch**: Research external dependencies and best practices when needed
- **Write last**: Generate analysis only after complete investigation

## Output Description
Provide output in the language specified in spec.json with:

1. **Analysis Summary**: Brief overview (3-5 bullets) of scope, challenges, and recommendations
2. **Document Status**: Confirm analysis approach used
3. **Next Steps**: Guide user on proceeding to design phase

**Format Requirements**:
- Use Markdown headings for clarity
- Keep summary concise (under 300 words)
- Detailed analysis follows gap-analysis.md output guidelines

## Safety & Fallback

### Error Scenarios
- **Missing Requirements**: If requirements.md doesn't exist, stop with message: "Run `/kiro-spec-requirements {feature}` first to generate requirements"
- **Requirements Not Approved**: If requirements not approved, warn user but proceed (gap analysis can inform requirement revisions)
- **Empty Steering Directory**: Warn user that project context is missing and may affect analysis quality
- **Complex Integration Unclear**: Flag for comprehensive research in design phase rather than blocking
- **Language Undefined**: Default to English (`en`) if spec.json doesn't specify language

### Next Phase: Design Generation

**If Gap Analysis Complete**:
- Review gap analysis insights
- Run `/kiro-spec-design {feature}` to create technical design document
- Or `/kiro-spec-design {feature} -y` to auto-approve requirements and proceed directly

**Note**: Gap analysis is optional but recommended for brownfield projects to inform design decisions.



---

# SKILL: kiro-validate-impl

---
name: kiro-validate-impl
description: Validate feature-level integration after all tasks are implemented. Checks cross-task consistency, full test suite, and overall spec coverage.
allowed-tools: Read, Bash, Grep, Glob, Agent
argument-hint: <feature-name> [task-numbers]
---

# kiro-validate-impl Skill

## Role
Individual tasks are usually reviewed during implementation. Your job is to catch problems that only become visible when looking across all tasks together.

Boundary terminology continuity:
- discovery identifies `Boundary Candidates`
- design fixes `Boundary Commitments`
- tasks constrain execution with `_Boundary:_`
- feature validation checks for cross-task `Boundary Violations`

## Core Mission
- **Success Criteria**:
  - All tasks marked `[x]` in tasks.md
  - Full test suite passes (not just per-task tests)
  - Cross-task integration works (data flows between components, interfaces match)
  - Requirements coverage is complete across all tasks (no gaps between tasks)
  - Design structure is reflected end-to-end (not just per-component)
  - No orphaned code, conflicting implementations, integration seams, or boundary spillover

## What This Skill Does NOT Do
This skill is not a full replacement for task-local review during `/kiro-impl`. This skill does **not** re-check:
- Individual task acceptance criteria
- Per-file reality checks (mock/stub detection)
- Single-task spec alignment

This skill's main question is: when the completed tasks are viewed together, do they still respect the designed boundary seams and dependency direction?

## Execution Steps

### Step 1: Detect Validation Target

**If no arguments provided**:
- Parse conversation history for `/kiro-impl` commands to detect recently implemented features and tasks
- Scan `{{KIRO_DIR}}/specs/` for features with completed tasks `[x]`
- Report detected implementations (e.g., "user-auth: 1.1, 1.2, 1.3")

**If feature provided** (feature specified, tasks empty):
- Use specified feature
- Detect all completed tasks `[x]` in `{{KIRO_DIR}}/specs/{feature}/tasks.md`

**If both feature and tasks provided** (explicit mode):
- Validate specified feature and tasks only (e.g., `user-auth 1.1,1.2`)

### Step 2: Gather Context

Reuse steering/spec context already available from conversation; load missing context below for each detected feature.
Select skills for the current task even when steering/spec context is already available:
- Read `{{KIRO_DIR}}/specs/<feature>/spec.json` for metadata
- Read `{{KIRO_DIR}}/specs/<feature>/requirements.md` for requirements
- Read `{{KIRO_DIR}}/specs/<feature>/design.md` for design structure
- Read `{{KIRO_DIR}}/specs/<feature>/tasks.md` for task list and Implementation Notes
- Core steering context: `product.md`, `tech.md`, `structure.md`
- Additional steering files only when directly relevant to the validated boundaries, runtime prerequisites, integrations, domain rules, security/performance constraints, or team conventions that affect the GO/NO-GO call
- Use explicitly requested skills and task-relevant local skills/playbooks, including design, accessibility, and UX. Select by description and read only needed guidance, even for small tasks; preserve required checks and host/project rules.

**Discover canonical validation commands**:
- Inspect repository-local sources of truth in this order: project scripts/manifests (`package.json`, `pyproject.toml`, `go.mod`, `Cargo.toml`, app manifests), task runners (`Makefile`, `justfile`), CI/workflow files, existing e2e/integration configs, then `README*`
- Derive a feature-level validation set for this repo: `TEST_COMMANDS`, `BUILD_COMMANDS`, and `SMOKE_COMMANDS`
- Prefer commands already used by repo automation over ad hoc shell pipelines
- For `SMOKE_COMMANDS`, choose the lightest trustworthy runtime-liveness check for the app shape (for example: root URL load, Electron launch, CLI `--help`, service health endpoint, mobile simulator/e2e harness if one already exists)
- If multiple candidates exist, prefer the command with the smallest setup cost that still exercises the real built artifact

### Step 3: Execute Integration Validation

#### Subagent Dispatch (parallel)

The following validation dimensions are independent and can be dispatched as **subagents** via the Agent tool. The agent should decide the optimal decomposition based on feature scope — split, merge, or skip subagents as appropriate. Each subagent returns a **structured findings summary** to keep the main context clean for GO/NO-GO synthesis.

**Typical validation dimensions** (adjust as appropriate):
- **Test execution**: Run the complete test suite, report pass/fail with details
- **Requirements coverage**: Build requirements → implementation matrix, report gaps
- **Design alignment**: Verify architecture matches design.md, report drift and dependency violations
- **Cross-task integration**: Verify data flows, API contracts, shared state consistency

For simple features (few tasks, small scope), run checks in main context without subagent dispatch.

If the implementation run explicitly skipped task-local review (for example `--review off`), tighten scrutiny on obvious task-level gaps that surface during integration validation and call out that reduced review coverage in the report.

#### Mechanical Checks (run commands, use results)

These checks apply at the feature level. Use command output as the primary signal.

**A. Full Test Suite**
- Run the discovered canonical full-test command. Use the exit code.
- If tests fail → NO-GO. No judgment needed.
- If the canonical test command cannot be identified → `MANUAL_VERIFY_REQUIRED`

**B. Residual TBD/TODO/FIXME**
- Run: `grep -rn "TBD\|TODO\|FIXME\|HACK\|XXX" <files-in-feature-boundary>`
- If matches found that were introduced by this feature → flag as Warning

**C. Residual Hardcoded Secrets**
- Run: `grep -rn "password\s*=\|api_key\s*=\|secret\s*=\|token\s*=" <files-in-feature-boundary>` (case-insensitive)
- If matches found that aren't environment variable references → flag as Critical

**D. Runtime Liveness (Smoke Boot)**
- Run the discovered canonical smoke command that proves the built artifact actually starts and reaches its first usable state.
- Examples if relevant: open the root URL in a headless browser and require zero boot-time console errors; launch Electron and wait for the main process ready signal and first renderer load; run a CLI with `--help`; start a service and hit its health endpoint.
- If boot produces a runtime crash, unhandled exception, module-load failure, native ABI mismatch, or missing required env/config → NO-GO.
- If no trustworthy smoke command can be identified, or the required runtime environment is unavailable → `MANUAL_VERIFY_REQUIRED`

#### Judgment Checks (read code, compare to spec)

**E. Cross-Task Integration**
- Identify where tasks share interfaces, data models, or API contracts
- Verify that Task A's output format matches Task B's expected input
- Check for conflicting assumptions between tasks (naming conventions, error codes, data shapes)
- Verify shared state (database schemas, config, environment) is consistent across tasks
- Verify integration work happens at the intended seams rather than by leaking one boundary's behavior into another

**F. Requirements Coverage Gaps**
- Map every requirement section to at least one completed task
- Identify requirements that no single task fully covers (cross-cutting requirements)
- Identify requirements partially covered by multiple tasks but not fully by any
- Use the original section numbering from `requirements.md`; do NOT invent `REQ-*` aliases

**G. Design End-to-End Alignment**
- Verify the overall component graph matches design.md
- Check that integration patterns (event flow, API boundaries, dependency injection) work as designed
- Verify dependency direction follows design.md's architecture (no upward imports)
- Verify File Structure Plan matches the actual file layout
- Identify any architectural drift from the original design
- Use the original section numbering from `design.md`

**G.5 Boundary Audit**
- Compare completed work against the design's `Boundary Commitments`, `Out of Boundary`, `Allowed Dependencies`, and `Revalidation Triggers`
- Identify cross-task spillover where one area quietly absorbed another boundary's responsibility
- Identify downstream-specific workarounds embedded upstream "to make integration easier"
- Identify new hidden dependencies or shared ownership that were not declared in the design
- If a revalidation trigger fired, verify the affected adjacent specs or integration points were actually re-checked

**H. Blocked Tasks & Implementation Notes**
- Check for any tasks still marked `_Blocked:_` — report why and assess impact on feature completeness
- Review `## Implementation Notes` in tasks.md for cross-cutting insights that need attention

### Step 4: Generate Report

Before returning `GO`, apply the `kiro-verify-completion` protocol to the feature-level claim. Tests alone are insufficient: include full-suite, runtime liveness, coverage, integration, design-alignment, and blocked-task status in the evidence.

Classify concrete failures by ownership before writing remediation:
- `LOCAL` if the defect belongs to the feature being validated
- `UPSTREAM` if the root cause belongs to a dependency, foundation, shared platform, or earlier spec
- `UNCLEAR` if ownership cannot be established from the available evidence

If ownership is `UPSTREAM`, do not collapse the issue into local remediation for this feature. Name the owning upstream spec and explain which dependent specs should be revalidated after that upstream fix lands.

Provide summary in the language specified in spec.json:

```
## Validation Report
- DECISION: GO | NO-GO | MANUAL_VERIFY_REQUIRED
- MECHANICAL_RESULTS:
  - Tests: PASS | FAIL (command and exit code)
  - TBD/TODO grep: CLEAN | <count> matches
  - Secrets grep: CLEAN | <count> matches
  - Smoke boot: PASS | FAIL | MANUAL_REQUIRED
- INTEGRATION:
  - Cross-task contracts: <status>
  - Shared state consistency: <status>
  - Boundary audit: <status>
- COVERAGE:
  - Requirements mapped: <X/Y sections covered>
  - Coverage gaps: <list of uncovered requirement sections>
- DESIGN:
  - Architecture drift: <findings>
  - Dependency direction: <violations if any>
  - File Structure Plan vs actual: <match/mismatch>
- OWNERSHIP: LOCAL | UPSTREAM | UNCLEAR
- UPSTREAM_SPEC: <feature-name | N/A>
- BLOCKED_TASKS: <list and impact assessment>
- REMEDIATION: <if NO-GO: specific, actionable steps to fix each issue>
```

If NO-GO, REMEDIATION is mandatory — identify the exact issue and what needs to change. Vague feedback is not acceptable.

## Important Constraints
- **Strict Final Gate**: Return `GO` only when all integration checks passed; return `NO-GO` for concrete failures and `MANUAL_VERIFY_REQUIRED` when mandatory validation could not be completed
- **Boundary integrity over convenience**: Do not return `GO` if the feature only works by smearing responsibilities across boundaries, even when tests pass

## Safety & Fallback

### Error Scenarios
- **No Implementation Found**: If no `[x]` tasks found, report "No implementations detected"
- **Test Command Unknown**: Return `MANUAL_VERIFY_REQUIRED` and explain which validation command is missing; do not return `GO`
- **Missing Spec Files**: Stop with error if spec.json/requirements.md/design.md missing

### Next Steps Guidance

**If GO Decision**:
- Feature validated end-to-end and ready for deployment or next feature

**If NO-GO Decision**:
- Address issues listed in REMEDIATION
- Re-run `/kiro-impl {feature} [tasks]` for targeted fixes
- Re-validate with `/kiro-validate-impl {feature}`

**If MANUAL_VERIFY_REQUIRED**:
- Do not treat the feature as complete
- Provide the exact missing validation step or environment prerequisite



---

# SKILL: kiro-verify-completion

---
name: kiro-verify-completion
description: Verify completion and success claims with fresh evidence. Use before claiming a task is complete, a fix works, tests pass, or a feature is ready for GO.
allowed-tools: Read, Bash, Grep, Glob
argument-hint: <claim-type> <claim>
---

# kiro-verify-completion

## Overview

This skill prevents false completion claims. A task, fix, or feature is only complete when supported by fresh evidence that matches the scope of the claim.

## When to Use

- Before saying a task is complete
- Before saying a bug is fixed
- Before saying tests pass
- Before moving to the next task in autonomous execution
- Before reporting `GO` from feature-level validation
- Before trusting another subagent's success report

Do not use this skill for early planning or speculative status updates.

## Inputs

Provide:
- The exact claim to verify
- Claim type:
  - `TASK`
  - `FIX`
  - `TEST_OR_BUILD`
  - `FEATURE_GO`
- Validation commands discovered by the controller
- Fresh command output and exit codes
- Relevant task IDs, requirement IDs, and design refs where applicable
- For feature-level claims:
  - requirements coverage status
  - design alignment status
  - integration status
  - blocked task status

## Outputs

Return one of:
- `VERIFIED`
- `NOT_VERIFIED`
- `MANUAL_VERIFY_REQUIRED`

Also return:
- Claim reviewed
- Evidence used
- Scope/evidence mismatch, if any

Use the language specified in `spec.json`.

## Gate Function

1. Identify the exact claim.
2. Identify the exact command or checklist that proves that claim.
3. Require fresh evidence from the current code state.
4. Check exit code, failure count, skipped scope, and missing coverage.
5. Reject claims that are broader than the evidence.
6. If mandatory validation cannot be completed, return `MANUAL_VERIFY_REQUIRED`.
7. Only then allow the claim.

## Claim-Specific Rules

### TASK
Require:
- task-local verification evidence
- no unresolved blocking findings from review
- evidence aligned with the task boundary

### FIX
Require:
- evidence that the original symptom is resolved
- no broader regressions in the relevant verification scope

### TEST_OR_BUILD
Require:
- actual command output
- exit code
- no inference from unrelated checks

### FEATURE_GO
Require:
- full test suite result
- runtime smoke boot result showing the built artifact reaches its first usable state
- requirements coverage assessment
- cross-task integration assessment
- design end-to-end alignment assessment
- blocked tasks assessment

A passing test suite alone is not enough for `FEATURE_GO`.

## Stop / Escalate

Return `MANUAL_VERIFY_REQUIRED` when:
- No canonical validation command is known
- The required environment is unavailable
- A mandatory manual verification step cannot be executed

Return `NOT_VERIFIED` when:
- The command failed
- Evidence is stale
- Evidence is partial
- The claim exceeds the evidence
- The feature still has unresolved blocked tasks or uncovered requirements

## Common Rationalizations

| Rationalization | Reality |
|---|---|
| “The subagent said it succeeded” | Reported success is not verification evidence. |
| “Tests passed earlier” | Fresh evidence only. |
| “Build should be fine because lint passed” | Lint does not prove build success. |
| “Tests passed and build succeeded, so it must run” | Type erasure, module loading, native ABI, and boot-time config issues can still fail at runtime. |
| “The feature is done because all tasks are checked off” | `FEATURE_GO` also requires coverage, integration, and design alignment. |

## Output Format

```md
## Verification Result
- STATUS: VERIFIED | NOT_VERIFIED | MANUAL_VERIFY_REQUIRED
- CLAIM_TYPE: TASK | FIX | TEST_OR_BUILD | FEATURE_GO
- CLAIM: <exact claim>
- EVIDENCE: <command/checklist and result>
- GAPS: <scope/evidence mismatch or missing validation>
- NOTES: <next action if not verified>
```



---

## LICENSE (gotalab/cc-sdd)

MIT License

Copyright (c) 2025 gotalab

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

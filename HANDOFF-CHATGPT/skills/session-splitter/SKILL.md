---
name: session-splitter
description: Split one crowded Claude Code session into separate sessions, one per project, each named after the project and handed a clear brief. Use when the owner says projects are "jammed together", "under the wrong header", "in the wrong session", asks to "separate", "split" or "give each its own thread", or is losing track of what is where.
---

# Session splitter

The owner runs many projects (APEX 360 sites, PEPTICITY, APEX STUDIO, sales tools…). When they pile into one session, they lose track. This skill gives every project its own named session with everything it needs to carry on, and leaves the current session holding ONE project.

## 1. Find the projects (evidence, not memory)

- `get_session` (no id) on the current session: its `external_metadata.artifacts` lists every page published here, with titles and links. Group them by project.
- Read the owner's own messages in the transcript (`~/.claude/projects/<dir>/<session>.jsonl`, `type: user`, skip tool results). Note each distinct project they asked for.
- Check the repo folders that hold each project's files (for APEX: `apps/*`, `design/landing-options`, `design/library`, `design/showcase`, `design/boards`; PEPTICITY lives in its own repo).
- `list_sessions` (mine: true): if a project already has its own session, point to it. Never make a duplicate.

A project is "different" when it has a different customer or product, different files, or a different goal. Versions and design options of the same site stay together.

## 2. Decide which project stays here

Keep the project with work still running in this session (agents, an unfinished push). Rename this session to it with `set_session_title`. Every other project gets a new session.

## 3. Create one session per project

`create_session` with:
- `title`: the project name in CAPITALS, brand names in capitals (e.g. `PEPTICITY WEBSITE`). Short and exact, so the owner can find it in the list.
- `source_url`: the repo(s) the project lives in; `source_revision`: the branch that holds the latest work.
- `prompt`: a standalone brief:
  - what the project is, in plain words;
  - where its files are (paths, branch);
  - its published links (artifact URLs) with one line each;
  - where it was left, and what is open;
  - the owner's standing rules live in CLAUDE.md in the repo (do not paste them).
  - First reply = ONE short plain-English message: what this project is, its links, and where it stands. Then wait for the owner. Do not start building on its own.
- Leave the environment, model and permission mode inherited.

Never put keys, tokens or passwords in a brief. Never send client-internal material (floors, commissions, vendor names) into a client project's brief.

## 4. Report to the owner

One message, plain words:
- a list of each session's exact name, and what's in it;
- which project stayed in this session, and its new name;
- where to find them: the session list in the Claude app.

No jargon, no progress noise.

---
name: apex-command-center
description: Build and extend the owner's APEX COMMAND CENTER - his personal Mac + phone dashboard (projects, agent accountability, his own accountability, waiting-on-you queue, find/save anything, artifact vault, spend meter, focus, pipeline, wins log, effects dock) with a 5-look STYLE switcher, LAYOUT switcher, constrained REMIX generator and an IMPROVE agent loop that only proposes clickable approve cards. Use whenever the command center, its modules, looks, layouts, remix, improve loop or save/find inbox are touched.
---

# APEX COMMAND CENTER

Source: `design/command-center/` (`index.src.html` + `build.py` -> `index.html`, one self-contained file that
runs as a local file on the Mac, from the tiny local server, and as a private Artifact for the phone).

## Owner decisions (2026-10-30)
- Absorb + link: Agent HQ, Brain Console, Hermes War Room feed tiles here, each with a jump-out link.
- Modules: find/save anything, agent accountability, my accountability, projects + quick launch,
  waiting-on-you queue, daily briefing + shutdown, artifact + link vault, focus timer + streak wall,
  effects arsenal dock, spend + credits meter, pipeline + money tile, wins + decisions log.
- Looks: SMOKED (house style, default), LIQUID GLASS, GLASSMORPHISM, NEUMORPHISM, CHROME / ONYX.
- Runs on Mac + phone.

## Architecture rules
1. **Looks are tokens only.** `html[data-look]` swaps CSS custom properties (surface, rim, radius, chamfer,
   blur, shadow, type ramp, shader tint/strength). No module has look-specific markup. Remembered in storage.
2. **Layouts are data.** Each layout = `{cols, tiles:{id:{c,r,order}}}` on a 12-col grid. Named layouts are
   hand-tuned; REMIX generates one from constraints: every module has `min` and `max` spans, one "hero"
   chosen from the priority set, rows packed with `grid-auto-flow: dense`, then validated (no tile under its
   min, no lone orphan in the last row, hero above the fold). Reject and retry until valid. Every remix is
   pushed to a history stack: UNDO / KEEP. Tiles move with FLIP (LAY-101 Bento Unfold feel).
3. **IMPROVE never acts alone.** It reads usage (clicks per tile, stale items, overdue commitments, waiting
   age) and proposes cards. Nothing changes until the owner ticks a card and presses APPROVE (CLAUDE.md rule).
   Proactive "I NOTICED..." chips may appear on their own, but are still only proposals.
4. **Find/Save:** every saved thing records `where` (path, repo + branch, artifact URL, session URL) and the
   project it was filed under, so search always answers "where does it live".
5. **Honest data only.** Real sessions/artifacts where known; everything else a marked placeholder
   (`[connect GHL]`). No invented numbers.
6. House style + EVERY-SITE MINIMUM: cite catalogue codes in a comment block at the top of the source.
7. Storage access wrapped in try/catch; page works with storage blocked.

## Gates
Playwright screenshots of every look x every layout at 1440 and 390 wide; no console errors; no sideways
scroll; reduced-motion holds still; then 3-4 audit rounds (security, flows, visual/a11y, perf/brand) before
showing the owner pictures + link.

## Mac app (server.mjs, added 2026-10-30)
- `install.sh` copies `index.html` + `server.mjs` to `~/APEX/command-center` and starts a LaunchAgent on 127.0.0.1:4360.
- The server injects `window.__APEX_LOCAL` (token + saved state) and, if present, `window.__APEX_DATA` (live.json) into the page.
  Every `/api/*` call needs `X-APEX-Token`; Host must be 127.0.0.1/localhost.
- Routes: PUT /api/state, POST /api/file (-> ~/APEX/Inbox/<PROJECT>), GET /api/search, POST /api/reveal (only inside roots),
  POST /api/agent (claude -p, max 3 running), GET /api/jobs, GET/POST proposals + review, GET /api/pipeline (GHL, optional).
- Daily self-review after 7am writes proposals.json only; the page shows them as IMPROVE cards. Approving runs the task.
- Data: `data/sessions.json` (sessions, projects, costs) and `data/artifacts.txt` (every artifact link) feed build.py.
  Refresh them from the Claude sessions list / Artifact list before each publish.
- ENTRANCES (owner, 2026-10-30): panels (IMPROVE, FIND, VIEWER) arrive via `enter(el, side)` using the CSS `translate`
  property so it layers on each panel's own transform. Options: SPRING (side slide + half-second bounce), GLIDE, CORNER
  (top-left), DROP, SURPRISE (different each time), OFF. Reduced motion forces OFF. Header ENTRANCE key cycles + previews.
- VIEWER: rows with `data-view` open in the slide-in viewer; on the Mac files preview via /api/preview (token in query
  for that route only) and OPEN IN ITS APP calls /api/openfile. Both are restricted to the search roots + Inbox.
- BROWSERS tile: our own chrome monogram keys (never vendor logos/colours), detected from /Applications, Edge excluded.
  "Open my links in" routes web links through /api/launch on the Mac.
- Private data: data/briefing.json and artifact.html are gitignored; index.html never contains mail or calendar.

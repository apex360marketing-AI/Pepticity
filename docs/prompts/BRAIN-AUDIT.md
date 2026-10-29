# APEX BRAIN prompt audit (29 Oct 2026)

What the old `1-APEX-BRAIN-prompt.md` was missing, where each item was found, and what was referenced but could not be found. Read-only sweep: no artifact, Notion page or vault was changed.

## Verdict

The old prompt covered **one owner message** (the 28–29 Oct brain-visual note). That note is complete and accurate. But APEX BRAIN is also a **product** with about six weeks of decisions behind it, and the old prompt had none of them: the architecture, the gate, the console, the research, the security findings, the blockers or the standing design rules. A new session given only the old prompt would have rebuilt the Brain from scratch and broken decisions the owner has already made.

## Sources searched

| Source | Result |
|---|---|
| APEX repo `/home/user/apex_agents_bots` (grep brain/konshus/thor/vault/neural; design/, research_notes/, plans) | Only `design/plans/inventory-2026-10-26.md` (session list, Brain Console status, the "pick one of two consoles" item). There is no brain skill in the repo's `.claude/skills`. |
| Account-synced skills | **`the-brain`** (architecture, decided 2026-10-04), **`thor-brain-import`**, **`vault-restore-drill`**, `command-board-refresh` |
| Artifacts (list of 200, all brain/vault/console ones read) | 17 read: Glass Console, Brain Console (two copies), Everything Released, Passes 1–5, Brain Audit, Asset Bank/Prompt Library, four write-gate guards, Brain Pack, Design Spec v2 (Claude Doc), THOR Vault Sign-Off, Apex Vault Audit, Ground Selection, Top 5 Cinematic Sites, Cinematic Scrolling Research, Agent Shell Board (plus its database), Master Archive |
| Artifact comments | None on Glass Console, Brain Console or Ground Selection |
| Artifact DB | Agent Shell Board: 2 answers (a1, a2) |
| Notion | One memory page, "APEX BRAIN — brain visual direction" (29 Oct; matches the old prompt). Workspace search found nothing else. |
| Konshus (THOR) | Captures and atoms: "Apex Brain / unified brain" (13 Oct), "Product design quality — Apex Brain" (30 Sep), "Building a unified brain vault and OS" (22 Aug), standing design rules (23 and 28 Oct). The 7 "APEX UNIFIED BRAIN · user" shards are short operational lines ("workflow audit", "Audit then harden", "I THINK ITSD in my f: drive"). |
| Higgsfield history | The **18 brain tries** the owner reacted to (29 Oct 00:10–00:12) plus the earlier 3–6 Oct brain and vault-door concept |
| Claude Code sessions | Listed below |

## Items missing from the old prompt (and where each was found)

| # | Missing item | Found in |
|---|---|---|
| 1 | APEX BRAIN is a **product** (vault + MCP + gate + console), not only a visual; "get one of these products ready to sell off" | Konshus 2026-08-22, 2026-10-13; `the-brain` skill |
| 2 | **Load `the-brain` skill**; build, don't redesign; the name lives in one `BRAND` constant | `the-brain` skill |
| 3 | Why it exists: Rewind, Limitless and THOR failures, so the owner must own his files and no dependency can be one the vault can't survive losing | `the-brain` skill |
| 4 | Vault layout, physical namespace authority, the 11 frontmatter fields, "no receipt, no atom" | `the-brain` skill; Brain Audit (16 Oct) |
| 5 | MCP: four tools plus `whisper`, **no approve tool**, four locks | `the-brain`; Brain Audit; Passes |
| 6 | Three-tier gate; every gate re-derived at apply | `the-brain`; four guards (28 Oct) |
| 7 | **The four write-gate guards** (hold, base hash, undo window, contradiction), with the live server unverified | Four guards artifact (28 Oct) |
| 8 | v2 spec: supersession, source tiers, span provenance, earned confidence, decay, honest delete, **six-lens dashboard**, the Obsidian YAML hazard, local/cloud rule, retrieval choice (qmd / Supermemory-as-index / FTS5) | Design Spec v2 (13 Oct) |
| 9 | **The research itself:** 13–14 memory systems studied, with take/leave per system | Design Spec v2; What's Next (19 Oct) |
| 10 | Cinematic references (Apple scrub, Lusion, Stripe, Vercel, Balenciaga, The Spaces, Superhero) | Top 5 Cinematic (19 Oct); Cinematic Research (26 Oct) |
| 11 | What is already built: 8 console panes, asset bank, prompt library, doctor, history, print sheet, 1,151 tests and 392 guards | Glass Console; Everything Released; What's Next |
| 12 | Console must be **glass**, "like the War Room", not "a 2002 website"; big, chunky and bold controls | Glass Console (20 Oct); console CSS |
| 13 | Owner quote on the asset size slider | What's Next (19 Oct) |
| 14 | **Facebook goes on the command centre; the Brain is its memory, not its inbox**; `command` handoff level | What's Next; Everything Released |
| 15 | "I need the MCP working perfect. I need it to stay connected." plus the F: drive fix, launcher and heartbeat recommendations | Passes 1–5 |
| 16 | **Blockers:** restore drill, MCP install on olboyblue, localhost console, `.jfif` fix, GitHub sign-in, hourly sync "yes" | Brain Audit; Everything Released; inventory |
| 17 | **THOR import is held** until a watched restore; Konshus atoms come in as notes; faults F-01 to F-05; shard collapse (about 278 shards, about 374 real sources) | `thor-brain-import`; THOR Sign-Off (13 Oct) |
| 18 | Auth: passkey/TOTP plus PIN domain; Heritage Vault keypad reskin; cinematic layer is presentation only | `the-brain`; Agent Shell Board |
| 19 | **Agent Shell** is the face (entrance / presence / brain), with the owner's two answers | `the-brain`; Agent Shell Board DB (28 Sep) |
| 20 | Brain is a data layer, not a fifth OS; the legal Apex Vault is a separate product, a source behind the PIN only | `the-brain`; Apex Vault Audit (18 Oct) |
| 21 | `the-brain` house rules: purple #B026FF for changes, one step at a time, per-command git confirmation, **Higgsfield-only imagery** | `the-brain`; THOR Sign-Off |
| 22 | Quality bar: the backend must match the frontend, no "AI junk" | Konshus 2026-09-30 |
| 23 | Standing UI rules: no pill controls, uppercase large controls, cool cyan/blue/violet, never yellow/gold/lime, see-through glass, never light sites, loves horizontal scroll | Konshus 2026-10-13, 10-23, 10-28 |
| 24 | **The 18 actual brain tries** (IDs, prompts) the owner's "top right / below / second page third over" refer to | Higgsfield history (29 Oct) |
| 25 | Earlier brain concept: two brains interlocking, cortex vault door with synaptic spark (gold now banned) | Higgsfield history (3–6 Oct) |
| 26 | Ten live grounds with tunable light ("Ground Selection"); pick still open | Ground Selection (28 Oct) |
| 27 | Held UX recommendations: one-card review queue, density/virtualised rows, "a pane that asks you questions", hub notes, perceptual dupes, Pinterest importer | Passes 4–5; What's Next |
| 28 | Two console copies; pick one | Inventory 26 Oct; Master Archive |
| 29 | Privacy: legal and family material never in the site, demos or handoffs | `the-brain`; THOR Sign-Off; Brain Audit |
| 30 | APEX Brain Pack: the BRAIN KEEPER (THOR) AnythingLLM workspace | APEX Brain Pack (26 Oct) |

## Conflicts found (to put to the owner)

- **Accent colour.** CLAUDE.md allows neon chartreuse #d4ff3a as an accent. Konshus (28 Oct) says "NEVER use yellow, gold, or lime-yellow as design accents for his APEX sites or apps". The Brain Pack and Master Archive both use #d4ff3a.
- **Green.** CLAUDE.md says no green anywhere. The console uses green (#5fd39a) for tier 1 and "add", and the THOR sign-off uses green and amber dots. Ground Selection's sample uses a gold value colour.
- **Console accent.** It is purple #b98cff until a War Room palette exists. The War Room Brand artifact (26 Oct) exists but was not checked against the console.

## Referenced but not found

- **"~15 sites reverse-engineered" for APEX BRAIN.** No list of 15 *websites* exists in the repo, artifacts, Notion or Konshus. The nearest matches are the 13–14 memory systems (Design Spec) and the 5–7 cinematic sites. Ask the owner for the link (it may be in a chat transcript this audit could not read).
- **The exact gallery positions** ("top right", "right below", "second page, third over, top row"). The 18 images are identified, but their on-screen order was not recorded.
- **The Unified Brain GitHub repo** (session "Hermes Apex Relay and Unified Brain GitHub repo", sign-in pending). Not attached here.
- **`brain_mcp` source / `apex-brain-console.zip`.** Not in this container (it lives on the owner's machine). Built state is taken from the reports.
- **The Agent Shell answers beyond a1 and a2.** The board's DB has only two answers.
- **Session transcripts.** These cannot be read; titles only.

## Brain-related Claude Code sessions (titles and ids only)

| Session | Id | Status |
|---|---|---|
| PEPTICITY WEBSITE (where the 28–29 Oct brain notes were given) | session_01SMNC3VxH9KX1JxL6PHexTV | active |
| APEX 360 LEAD MAGNET WEBSITE | session_01SMNC3VJTpCNSyR9W1thdpc | active |
| APEX STUDIO (your own Higgsfield) (the 27 Sep parent; inventory calls the long thread "LEAD MAGNET") | session_01GUTukjE4mtorh1hBjCmokr | idle |
| Group D: console capture, ask-my-brain, shortcuts | session_013aYnwzSgVFMpaoSxaanEuz | archived |
| Always-connected machines, then live Brain Console | session_014vizo4B6hqov5jaoTCX7hq | archived |
| Always-connected machines, then live Brain Console (needs "Yes, create it" / "Digest only") | session_01M7cZ7FZgapdGdKmY8kuQ9Z | archived |
| Group C: agent health for Hermes + console tile (#188 unforgeable approvals) | session_01EzNgTdGFa228MT9p5TdiRo | archived |
| Hermes Apex Relay and Unified Brain GitHub repo | session_014YUFuCPkbozLWoHAi6FKHM | archived |
| Apex unified brain | session_01JSYnczgR6hKqqmF6PhYVoA | archived |
| LLM skills and agents package (APEX Brain Pack) | session_019avsehuU2kZp4Zs9uwFaRd | idle |
| Agent management operating system | session_01NNLATJzjj8QvhuUU39TmF2 | idle |
| Konshus memory uploads and settings | session_013teB9kRNHVcgqCZKVEANzC | idle |
| Konshus.ai context export for Alfred | session_014YwCaf2rDix2mbn8asFLhr | idle |
| Repos gitignore and Konshus reconciliation | session_012k3LduvB7HdLAm13728a9F | archived |
| Master vault website for all projects | session_01BMBcbrUkyagtrze1AjfcmG | archived |

The legal "Vault" sessions (court-case vault) are a separate product and are deliberately left out.

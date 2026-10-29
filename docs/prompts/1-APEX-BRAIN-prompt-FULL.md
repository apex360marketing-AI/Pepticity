# PROMPT 1 (FULL) — APEX BRAIN (separate session; NOT the PEPTICITY site)

> Paste everything below the line into a new session for APEX BRAIN.
> Compiled 29 Oct 2026 from: the APEX repo, the account's synced skills (`the-brain`, `thor-brain-import`, `vault-restore-drill`), 17 published artifacts, the Claude Docs spec, Konshus (THOR) captures, Notion memory and Higgsfield history. The audit of what the old prompt missed is in `BRAIN-AUDIT.md`, in this same folder.
> Owner words are quoted **verbatim** with the source and date. Anything marked *(reported)* is how a builder summed up the owner, not his exact words.

---

You are building **APEX BRAIN**. The owner (Maverick / Tyson, APEX 360) calls it one of the most important products in his portfolio. It has **two halves, and both are in scope**:

1. **The product (the Brain itself):** his own memory hub. A markdown vault he owns, one MCP write path, a human approval gate, and a glass console. **A lot of it is already built and hardened.** You extend it. You do not redesign it.
2. **The APEX BRAIN site:** the cinematic page that sells it. The centrepiece is a living 3D brain, or an Avatar-style Tree of Life, where every memory is a glowing line or electrode.

**Never mix this with PEPTICITY.** The owner warned about this twice.

## 0. HOW TO WORK (house rules that apply here)

- **Skills first.** Load these before anything else: `apex-build-contract` (first), `apex-site-build`, **`the-brain`** (it holds the architecture, so this spec never has to be pasted in again), `thor-brain-import`, `vault-restore-drill`, `threejs-real-3d`, `webgl-shader-backgrounds`, `gsap-scroll-choreography`, `exploded-layers-3d`, `apex-glassmorphism`, `liquid-glass-studio`, `premium-micro-interactions`, `page-transitions`, `apex-loader`, `photoreal-product-site`, `visual-reference-lock`, `effect-catalog`, `quality-gate`, `award-jury-review`. If no skill covers the Avatar Tree of Souls study, **create one**.
- **Questions:** always multiple choice (2–4 options, the recommended one first). Recommendations are short points the owner ticks. Build only what he ticks.
- **Sample first:** one sample, a rendered screenshot plus a link, then roll out. Never end a message that shows a sample with a question dialog.
- **Verify** in a real browser (Playwright) before you show anything. Share an Artifact link, never a localhost link.
- **The `the-brain` house rules:** changed text in a document is set in bright purple **#B026FF**. One step at a time, confirmed before the next. Per-command confirmation stays on for every git and PowerShell command. **All imagery, icons, textures and diagrams come from Higgsfield. If Higgsfield is down, say so and stop. Do not substitute another tool.** Code that renders UI is code. Images and visual design are Higgsfield.
- **ONLY THE BEST** (owner, 26 Oct): live interactive 3D and scroll-scrubbed sequences the visitor controls, not passive video. Never offer a "less polished" option. Scope down instead.
- **Brand:** ALL headings, menus and controls in CAPITALS. Brand names always written **APEX BRAIN** and **APEX 360**. Dark, near-neutral grounds with glowing accents. Glassmorphism that is truly see-through. **NO pill-shaped controls** (Konshus, 2026-10-28: "Maverick explicitly prohibits pill-shaped UI controls anywhere"). Controls are large, bold and uppercase. **No yellow, gold, amber or lime anywhere.** Real 3D (three.js / WebGL), never emoji or flat icons.
- **Content:** no invented stats, testimonials or client counts. Use `[placeholders]`.
- **Privacy:** the owner's legal and family material lives only behind the PIN in `90-private/`. It never appears in the site, in demos, in screenshots or in handoffs. Use made-up sample memories for every demo.

## 1. THE OWNER'S WORDS (verbatim, with source)

**A. The brain visual: 28–29 Oct 2026** (PEPTICITY WEBSITE session; also Notion memory "APEX BRAIN — brain visual direction", 29 Oct)

"As for the brain, I think it'd be pretty cool if we did it kind of like the top right one, like I like that, how it's all like bulbous and like bright, very bright, and you can see the nodes better. And I like how you did the one right below it, where like all the little lines are coming down. But I think those lines are going to be what we build as we start getting more memories. So as your memories grow, that will grow, and your brain will get more electrodes in it and more things like sparking and going off. You know what I mean? Like your brain will be firing on all cylinders. Is it kind of like that? But I still think that using Higgs field, you could come up with something a little bit more cool and unique. I do like a mixture of the two I just said, because I also like how the brain is a little more see-through. And then also, though, it needs to be how do we make it even cooler? I'm going to leave this one to you. To give me another 10 tries of what I just said to you, I want you to do some research into finding out some really cool ones, find a few that'll really make me kind of excited. And then also they need to be animated, right? Like the nodes need to be moving. It needs to be something that's really cool, even those little lines that are coming down. It's kind of like Avatar, that tree. The tree of life. That's what we're creating, but with this brain. And then what I'd like you to do, this might be cool. Why don't give them an option? I want you to create the tree of life. I almost identical to Avatar. You're going to have to go find it. Use a skill or create a skill and go find out what that tree looks like in Avatar. But it's very, very colorful. It's got all these things that come down off of it and stuff. And I think that those could all be memories and brain, and because that's what it was for Avatar, right? But what it is you can click and have either one. So you can have the brain or you can have the tree of life. And I want the button where you click on it to switch it to be really cool, have a glass morphism type look, see-through, and just make it pop, make it look really cool. But when you first go to the brain for the first time, I want it to show you both. It kind of takes you through it. When someone's on our site and we're trying to make the sale, it's going to show them both sides of it. So I'd like you to make me, nine or 10 Okay, actually, I really like the black one on the second page, third one over on the top row. I think that's fucking cool with the matte black and then all the colors going through it. And then those could all be sparking and shit. And then when you scroll into the brain, it takes you into the electrodes, and that's where the black goes away. And it turns into the nice, really bright colored brain. And you're kind of inside it and you can see all your memories and click on them. And you know what I mean?"

"The other one, the brain, that is for Apex Brain. So we just did two different sites there. So please do not get them confused, because I almost did. But the brain itself is for a totally different site."

**B. Why the product exists** (Konshus, chat "Building a unified brain vault and OS", 2026-08-22)
"I need you to think up side of the box as well, please. This is something that's very important to me, and I need to get it done properly. I need to get one of these products ready to sell off. And, ultimately, let's get this done."

**C. What it is** (Konshus capture "Claude: Apex Brain / unified brain", 2026-10-13)
"Destination for all memory: Maverick is building APEX BRAIN (also called "the unified brain") — a single personal hub holding every build's data plus all his artifacts, with a personal side alongside the work side and a second sign-in layer for extra protection. Design direction: a mix of Supermemory, Obsidian and Konshus.ai. Everything in the Konshus vault is intended to transfer into Apex Brain once it is finished."
Related Konshus atoms: "You want a single, centered hub for your brain that stores everything." (2026-08-22) · "You are planning to create a website similar to Obsidian and Konshus." (2026-08-22) · "Top things you'd use a personalized AI for? — Parenting; Just remembering my own thinking; Running my business" (2026-09-11) · "You want your LLM to be next level and unprecedented." (2026-08-11) · "Prefers AI tooling that operates under supervised autonomy…" (2026-08-15)

**D. Quality bar** (Konshus capture "ChatGPT: Product design quality — Apex Brain", 2026-09-30)
"The backend-facing workspace and working application must match the quality and distinctive design of the user's approved frontend. The user rejects plain, generic AI-generated-looking interfaces ('AI junk'). Preserve the approved design direction and deliver a polished, coherent, functional product throughout; passing technical tests alone does not satisfy their quality standard."

**E. Console look** (artifact "Apex Brain — The Glass Console", 20 Oct, *reported*)
"You said the console looked like a 2002 website and told me to go back to the drawing board, load every skill, and build it on glass." · "You asked for the console to look like the War Room." · "You asked to see the skills."
Console source comment: the asset bank controls are big because "He asked for big, chunky and bold".

**F. Asset bank** (artifact "Asset Bank, Prompt Library, and What's Next", 19 Oct)
"I want it so that I can also adjust the size of the images. So when I'm floating through them, I can actually make them decent size so I can see what they are rather than have to open each one."

**G. Command centre and Facebook** (same artifact, 19 Oct)
"Is this somewhere where I should be connecting to my Facebook? Is this somewhere, or should I be doing that on my command center? … because I'm going to end up building this brain into my command center."

**H. MCP** (artifact "Apex Brain — Passes 1 to 5", 19 Oct)
"I need the MCP working perfect. I need it to stay connected."

**I. Standing design rules from Konshus (2026-10-23 and 2026-10-28)**
- "You prefer a design palette of cool cyan, blue, and purple with neutral whites for your APEX sites and apps." (atom, 2026-10-28)
- "Maverick explicitly prohibits pill-shaped UI controls anywhere. Use sharp/angular controls, small chamfered corners where appropriate, and consistent branded icons." (2026-10-28)
- "Maverick requires all application headings, titles, navigation tabs and buttons to be UPPERCASE. Controls must be large, readable and easy to use." (2026-10-28)
- "Tyson explicitly reiterated on 2026-10-28: NEVER use yellow, gold, or lime-yellow as design accents for his APEX sites or apps."
- "You want the new site to have a glassmorphism style with a transparent, see-through look." (atom, 2026-10-13)
- "Never build light or white websites for this user. Always dark with rich accents unless they explicitly ask for light… They love smooth, well-done horizontal (sideways) scroll sections." (2026-10-23)
- "Never use generic pill/rounded buttons. Always use the custom effect library from the Lead Magnet build (apex_agents_bots design/effects.json…)" (2026-10-23)

## 2. DECISIONS ALREADY MADE (do not reopen; if you think one is wrong, say so in one line and ask)

From the `the-brain` skill (decided 2026-10-04), the Design Spec (13 Oct), the THOR sign-off (13 Oct) and the build reports (16–28 Oct):

1. **The substrate is plain markdown in a folder he controls.** His memory has failed three times: Rewind shut down, Limitless was acquired, and THOR's dossiers are backup-only. All three are the same failure: someone else owned his files. **Never add a dependency the vault cannot survive losing.** Obsidian, Supermemory and Konshus are all swappable.
2. **The name lives in one constant** (`BRAND` in `src/config.js`). Renaming means one edit.
3. **Layout:** `00-inbox/ 10-projects/ (254 builds) 20-people/ 30-areas/ 40-sources/ 90-private/ (PIN-gated) _system/`. Files are named date first, person second.
4. **Namespace authority is physical.** A file's access class comes from the folder it sits in, never from its frontmatter. Resolve symlinks first, and treat hardlinks the same way.
5. **Frontmatter has 11 fields:** `type, tags, created, source, confidence, egress_class, legal_hold, lifespan, valid_from, valid_to, superseded_by`. Every protected key is tier 3. **No receipt, no atom.**
6. **One MCP server with exactly four agent tools:** `search, get, propose-write, get-proposal-status`. A read-only `whisper` was added later, and the server tells the client to call it before its first reply. **There is no approve tool. An agent can never approve its own proposal.** Four independent locks enforce this.
7. **The gate has three tiers:** 1 auto-applies with a 24h undo, 2 is one preview per batch, 3 stops and re-authenticates. Every gate is re-derived at apply time (tier, hold, contradiction, base hash).
8. **The four write-gate guards** (28 Oct, reference implementation, **the live server is unverified**). Port them in this order: **legal hold** (blocks every mutation, its release is a separate ceremony) → **stale `base_sha256`** refuses the write → **undo window** (24h from the decision; absence counts as a change) → **contradiction** (un-approvable until a server-side relation `updates | extends | derives` is recorded).
9. **v2 additions** (Design Spec, 13 Oct): supersession at write time (`valid_to` = the new note's `valid_from`, nothing deleted); source-authority tiers `stated / derived / imported` (a derived claim is promoted only by him); span provenance (exact quote plus content hash); confidence that is earned, never self-rated (`asserted / corroborated / verified / disputed`); decay that changes ranking but never touches a file; honest deletion. **The dashboard is organised by lens, not by folder.** The six lenses are: WHO HE IS · WHAT HE WILL NOT TRADE · HOW TO WORK WITH HIM · BUILDING NOW · DECISIONS THAT STAND · WATCH-OUTS.
10. **Obsidian hazard:** splice frontmatter on raw bytes and never re-serialise YAML. Keep the BOM and line endings. Use a stable `id:`. Quarantine sync-conflict copies.
11. **Local and cloud:** "the vault syncs, the control plane does not". The queue, audit log and mode file never sync. The index is rebuilt. Audit logs merge by concatenation.
12. **Retrieval:** do not build a retrieval engine. Try qmd (MIT) first. Supermemory is allowed only as a disposable chunk index (its self-hosted binary is not open source and is capped at 10k documents). Keep a SQLite FTS5 fallback.
13. **Facebook goes on the command centre, not in the Brain.** "The brain is the command centre's memory, not its inbox." The command centre reads a `command` handoff level and almost nothing flows back.
14. **The Brain is a data layer, not a fifth OS.** APEX OS, Sandsquatch, TrustLayer OS and the personal OS become entries in `10-projects/`. `apex-vault-blank` (the legal evidence app) is a separate product and only ever a source behind the PIN.
15. **Auth:** passkey or TOTP, then a numeric PIN for `90-private/` (argon2id, lockout, auto-relock). The entrance is the Heritage Vault keypad, cloned and re-skinned. The cinematic layer is presentation only, so auth must work with it blocked.
16. **The face is Agent Shell** (board, 28 Sep). It is three layers that never mix: entrance (auth), presence (a Jarvis-style glass hologram core with rings, idle/listening/speaking/working/alert states), and brain (per-app agent). Owner answers on record: mount first in **Okanagan Adventure + "Other: EduVenture"**, shipped as **"A versioned package every app installs"**. The rest of the board is unanswered, so ask.
17. **Console v3 is glass:** a filament-grid ground plus a pointer torch, glass panes with blur held at 8–14px, two fill weights, one sweep at a time, cards that light up on hover but never move under the pointer, and a print stylesheet so every screen can be an exhibit. **Keyboard shortcuts never approve anything.**
18. **The THOR import is HELD** until a 3-2-1 backup has been restored, with the owner watching. Konshus atoms come in as `type: note` unless a real span is found. Apply the known faults F-01 to F-05 from the `thor-brain-import` skill.

## 3. WHAT IS ALREADY BUILT (state as of 20–28 Oct; re-verify)

Bundle `apex-brain-console.zip`, Python `brain_mcp`. Reports: 1,151 tests and 392 mutation guards (Glass Console, 20 Oct), 1,037 tests and 353 mutations (Everything Released, 20 Oct).
- **Console panes:** OVERVIEW (counts, namespace spectrum, health line, "since you last looked") · CONVERSE (ask, where every answer carries file:line receipts; propose) · LIBRARY (lenses, tree, chronology) · ASSETS (6,000-image / 300-clip bank, a 6-step size slider, no cropping, column layout, clips that play) · PROMPTS (9 categories, slot fields, refuses to copy while a slot is empty) · HISTORY (audit log, undo while a backup exists, chain verdict) · APPROVALS (tiered cards, full diffs, Deny shown first on tier 3, retype-the-path ceremony) · HANDOFF (whisper / briefing / mirror / crisis / command levels). Plus capture, a vault doctor (9 checks plus a weekly ritual that fixes nothing), a hash-chained audit log, a signed mode file, and modes advisor / review / open.
- **Artifacts:** Console `Gxn4wUyyTMtthXWZMKBSwe` (current) and `BupSNe3cJZVSpaTBX1C56N` (the first copy, 20 Oct; **pick one**).

**Still blocked on the owner's machine (olboyblue, vault on F:):** installing and registering the MCP in Claude Code, Codex, Gemini and Hermes; **the restore drill**; the console on real localhost; the Windows `.jfif` registry fix; `prove_tests_fail.py` run once on Windows; the GitHub sign-in for the Unified Brain repo; the hourly sync task (waiting on "Yes, create it" / "Digest only").

## 4. RESEARCH ALREADY DONE (the "sites studied"). Reuse it, don't redo it

**Memory and brain systems studied** (Design Spec, 13 Oct; "What's Next", 19 Oct):

| System | What it is | Take | Leave |
|---|---|---|---|
| Konshus | hosted atom vault | the **lens** view | resolving contradictions at read time |
| Obsidian 1.14.4 | markdown plus plugins | backlinks (linked and unlinked), quick switcher, Bases `.base` | silent YAML re-serialisation |
| Supermemory | hosted memory and RAG | stable-id upserts, inferred-memory review queue, typed decay, `updates/extends/derives` | as a source of truth (closed binary, 10k cap) |
| Graphiti (Zep core) | temporal knowledge graph | **bi-temporal supersession**, two-way provenance | Neo4j |
| Mem0 | memory layer | (warning) agent facts weighted like user facts; add-only | everything |
| Letta | agent memory | (note) only reviews agent-to-agent | — |
| Hindsight 1.0 | belief store | evidence quote plus proof count | — |
| Basic Memory | markdown plus SQLite plus MCP | conventions | AGPL, cloud-locked sync |
| LangMem | LangChain memory | — | dormant since Oct 2025 ("langfield" does not exist) |
| Gemini Notebook (ex-NotebookLM) | notebook | — | rebuild the job over his own vault |
| qmd | hybrid local search plus MCP | **try first** for retrieval | — |
| Open Notebook | NotebookLM clone | runner-up UI | its own DB, document-level citations |
| Claude Citations API | grounded answers | verbatim quoted spans | — |
| REA 6.4 | reverse-engineering tool | interoperability study of the Konshus client only | reproducing protected code |

**Cinematic and scroll references** (Top 5 Cinematic Sites, 19 Oct; Cinematic Scrolling Technical Research, 26 Oct): **Apple** product pages (frame-accurate scroll-scrubbed canvas sequence, the "THE cinematic technique") · **Lusion** (morphing containers, GSAP choreography, WebGL distortion) · **Stripe** (scroll-synced layers, weighted easing) · **Vercel** (depth parallax) · **Balenciaga** (cinematography over code) · *The Spaces*, *Superhero* (narrative scroll). Use this for the dive into the electrodes: a scroll-scrubbed GSAP/three.js camera move the visitor controls in both directions, with mobile fallbacks planned early.

**Grounds** ("Ground Selection", 28 Oct): 10 live backgrounds with tunable light size, shape and strength. They are SIGNAL MESH, CONTROL RINGS, HEX APPROACH, CIRCUIT BOARD, BEACON SWEEP, PARTICLE DRIFT, HONEYCOMB, DEPTH STRATA, TOPOGRAPHIC and WAVEFORM RIBBONS. Its sample uses a gold value colour, which is banned. *No pick is recorded*, so ask which one is the APEX BRAIN console ground.

**The ~15 reverse-engineered sites the owner mentions:** no single list of 15 *websites* was found. The nearest matches are the 13–14 memory systems above plus the 5–7 cinematic sites. **Ask the owner** whether there is another teardown, and get the link.

## 5. VISUAL DIRECTION: THE APEX BRAIN SITE

**Brain tries already generated** (Higgsfield `cinematic_studio_2_5`, 29 Oct 00:10–00:12 UTC, 18 stills). These are the ones the owner was pointing at. **Show all 18 numbered in the order he saw them, and confirm which is "top right", "the one right below it" and "second page, third over, top row" before building.** Likely candidates (unconfirmed):
- *Matte black with all the colours* (FAVOURITE): obsidian brain with cyan/violet seams `c9f7bef0`; graphite brain with circuit traces `ab4a51a8`; smoky-glass neural lace `3d092905`.
- *Bulbous, very bright, nodes visible:* constellation brain `ac0a4e40`; glowing-neuron brain `ddcbaa8f`; bioluminescent jelly brain with tendrils `323c6781`.
- *Lines coming down:* point-cloud brain with threads raining down `0f6fe73d`; crystal brain with fibre-optic curtain `4572a06a`.
- Others: tractography `1b24b71e`, exploded glass lobes `b0640384`, porcelain `0524d2b0`, crystalline `cfe85d70`, smoke `c5470613`, liquid chrome `e08bd600`, contour slices `76777bd5`, hologram `04dcb684`.
- Earlier concept (3–6 Oct): an organic violet brain meets a crystalline lattice brain, plus a cortex-folded chrome **vault door** with a synaptic spark tracing a groove (Kling film `957c5c79`). **Its gold seam is now banned**, but the vault-door entrance idea fits the keypad entrance.

**The brief:**
1. **Research first.** Find the most exciting brain, neural and tree-of-life visuals. Study **Avatar's Tree of Souls** (shape, glowing hanging tendrils, bioluminescent colours) with a skill you use or create. Bring a short board of finds.
2. **10 new tries** (Higgsfield stills, then animated) mixing: the bulbous, very bright brain with clearly visible nodes · thin lines streaming down · a more see-through brain · **the favourite: matte black with all the colours running through it, sparking**.
3. **Everything moves:** nodes drift and pulse, sparks fire, hanging lines sway.
4. **Memories = lines and electrodes.** A user's memory count drives how many lines, electrodes and sparks there are, up to "firing on all cylinders". In the product, wire it to the real vault count, by lens or `type` (each lens can be a colour family).
5. **Tree of Life option**, almost identical to the Tree of Souls: very colourful glowing tendrils, one per memory.
6. **The BRAIN ⇄ TREE OF LIFE switch:** see-through glassmorphism that pops (chamfered, not a pill), uppercase label.
7. **First visit:** a guided intro shows both, brain then tree. It is part of the sale.
8. **Scroll in:** start on the matte-black sparking brain. Scrolling flies you into the electrodes, the black falls away, and you are inside a bright, colourful brain where you can see your memories and click them. A click opens a glass card with the memory, its receipt (file:line) and its lens.
9. **Live build:** three.js/WebGL. The nodes are one GPU-instanced particle system with a still and video fallback for slow phones and a reduced-motion version. Higgsfield supplies the photoreal stills and films, and three.js does the live layer and effects around them.
10. **Palette:** near-black ground. The glow colours are cool cyan, blue and violet (owner atom, 28 Oct) plus the brighter "really bright coloured" interior. No gold, yellow or lime. Green conflicts with the house rule, so ask before using it.
11. **Entrance:** the Heritage Vault keypad reskin (possibly the cortex vault door), a 2–5 second loader per `apex-loader`.

## 6. RECOMMENDATIONS ALREADY OFFERED (put them to the owner as tickable points; build only what he ticks)

- Living growth replay ("watch your brain grow"); hovering a memory lights its tendril end to end; search lights the matching paths and dims the rest; sound off by default; brain ⇄ tree **morph** instead of a cut; a still fallback for slow phones.
- From Passes 4 and 5 (19 Oct, not yet confirmed as built): a review queue shown **one card at a time**; a density control with virtualised rows for thousands of notes; the handoff rendered as a document; **"a pane that asks you questions the vault cannot answer"** (contradictions, long-disputed claims, sensitive notes quoted elsewhere).
- From What's Next (19 Oct): hub notes per tree; perceptual duplicate detection; a Pinterest board importer; confidence decay (`stale_after`).
- From Passes (19 Oct): point the MCP config at a pinned `.cmd` launcher; add a `status` heartbeat tool ("is it actually connected to the right brain").

## 7. OPEN QUESTIONS TO ASK (multiple choice)

1. Which brain tries are "top right", "right below" and "second page, third over"? (Show the 18.)
2. Which ground from Ground Selection does the console use?
3. Is the War Room palette and logo ready (the War Room Brand artifact `JHfAMMmzDqFcTUzYyFH7RQ`, 26 Oct), or does the console keep purple `#b98cff`?
4. The house accent rule conflicts: CLAUDE.md allows neon chartreuse `#d4ff3a` as an accent, but Konshus (28 Oct) says never lime-yellow. The console uses green for tier 1 and "add", and CLAUDE.md says no green. Which wins for APEX BRAIN?
5. Which of the two console artifacts is kept?
6. Is the restore drill scheduled (it unblocks the THOR import and the move of all Konshus memory into APEX BRAIN)?
7. Agent Shell: answer the rest of the board (presence form, material, voice, wake word, war room, PIN length).
8. Where is the list of "~15 reverse-engineered sites"?

## 8. CHECKLIST

**Process**
- [ ] APEX BRAIN only; nothing from PEPTICITY
- [ ] `the-brain` and the other skills loaded; Tree of Souls skill used or created
- [ ] Higgsfield used for every image; purple #B026FF for changed text; one step at a time
- [ ] One sample shown (screenshot plus link) before any rollout; questions multiple choice
- [ ] No private, legal or family content anywhere; sample memories only

**Product**
- [ ] Architecture untouched (markdown, physical namespaces, 4 tools plus whisper, no approve tool, three tiers)
- [ ] Four write-gate guards ported to the live server: red, green and mutation outputs attached
- [ ] v2: supersession, source tiers, span provenance, earned confidence, decay, honest delete, lens dashboard
- [ ] Obsidian-safe raw-byte writer
- [ ] MCP stays connected: launcher, heartbeat or status tool, plain-language error when the drive is missing
- [ ] Restore drill performed and watched **before** the THOR import
- [ ] Auth: passkey/TOTP plus PIN domain before any private content lands
- [ ] Facebook on the command centre only; the `command` handoff level is the integration

**Site**
- [ ] Research board plus 10 tries mixing bulbous, bright, visible nodes + lines coming down + see-through + matte black with colours
- [ ] All animated: nodes moving, sparks, swaying lines
- [ ] Memories grow the lines, electrodes and sparks (tied to the real count)
- [ ] Tree of Life option, very colourful, tendrils = memories
- [ ] Glass BRAIN/TREE switch that pops (no pill)
- [ ] First visit walks through both
- [ ] Scroll from the black brain into the electrodes; the black falls away to a bright brain inside with clickable memories
- [ ] Uppercase headings, dark ground, cool palette, no gold, yellow or lime, real 3D, reduced-motion and slow-phone fallbacks
- [ ] quality-gate plus award-jury-review passed before anything is shown

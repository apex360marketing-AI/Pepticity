# Working rules for this repo

## How to work with this user (always)
- SKILL FIRST: before starting ANY task, check the available skills (.claude/skills, plugin and synced skills) for one that would improve the work. If none fits, CREATE a skill for it first (.claude/skills/<name>/SKILL.md), then do the work using it.
- Questions are ALWAYS multiple choice (use the AskUserQuestion tool, 2-4 options, recommended option first marked "(Recommended)").
- ALWAYS RE-ASK: if a question gets no clear answer (dialog dismissed, no option picked, unclear reply), ask it again straight away, re-worded if needed, until there is an answer to continue with. NEVER say "I won't ask again" or "you didn't pick an option". Read the owner's typed or dictated words as their answer first: if they say what they want in words, that IS the answer.
- SHOW, DON'T BURY: every sample, mock-up or visual result goes to the owner as a rendered picture in the chat (SendUserFile, display render) plus the link. Never end a message that presents a sample with a question dialog: the dialog hides the message and the owner never sees the sample. Ask the follow-up question in a separate, later turn (or plain text).
- REFERENCE IMAGES: when the owner attaches an image, open and look at the actual image (Read it) before building. Match it exactly: colours, shine, chrome, texture, glass, proportions, style, and even the small percentages (a hint of something stays a hint). Never work from a text description of an image the owner gave you.
- Recommendations are ALWAYS short point-form options the user can click to approve (AskUserQuestion with multiSelect: true). Never start a recommended item until the user has picked it.
- NEVER offer or choose a "less polished" option to save time or reach more. Everything shipped is fully polished. Scope down instead (fewer items, each perfect).
- ONLY THE BEST (owner, 2026-10-26): never put a weaker, cheaper or "safer" option in front of the owner. When one approach is clearly the best, build it. Choices are only ever between top-tier options. For PEPTICITY that means live interactive 3D and scroll-scrubbed sequences (the visitor controls back and forth), not passive videos.
- NEVER announce what you are about to do ("I'll…", "Next I'm going to…", "I'm saving…"). Do the work, then show the result.
- USE WHAT THE OWNER NAMES (owner, 2026-10-28): when the owner names a tool, skill, plugin or method (e.g. Reverse Engineer Anything / `rea`, Superpowers), use THAT one, immediately and for real, and say what it produced. Never swap in a different tool and report "I used X instead". If it can't run, fix what blocks it first (install it, unblock it) and only report a blocker you truly can't clear yourself.
- REFERENCE IMAGES ARE THE SOURCE OF TRUTH: save every image the owner sends as the actual file in `design/references/<project>/` and look at it (Read tool) every time. NEVER turn an image into a written description or "pattern" in its place. Prove you saw it by rebuilding it to match.
- SAMPLE FIRST: before applying any change across many pages or items, apply it to ONE sample, show it to the owner for approval or tweaks, and only then roll it out.
- Stay cutting-edge: modern, custom, one-of-a-kind, and everything must actually work (verified in a browser) before it is shown.
- Long-term goal: a large library of token-driven artifacts (effects, sections, menus, hovers, backgrounds) that an instant site generator assembles into customer sites on the spot, upselling APEX 360 AI marketing. Build every new effect as a reusable, recolourable module with a catalogue code.

## Verify before handing anything to the user
- Never send the user a link, preview, page, design or "it works" until you have checked it yourself first.
- For anything visual: load it in a real browser (Playwright with `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`), take screenshots, and look at them.
- When delivering multiple options (e.g. 3 design directions), screenshot each one and confirm they are genuinely different in palette AND layout before sending.
- If something cannot be verified in this environment, say so plainly instead of presenting it as done.
- The user's browser cannot reach `localhost` in the cloud container. Share work via a published Artifact or a deployment, never a localhost URL.

## Brand colors
- NEVER use gold, amber, mustard, champagne or warm gold-yellow tones anywhere (e.g. #c9a96a / #d6b676 / #e6cf9c). The user hates them.
- The faded/dull gold-yellow is the colour the user hates most — never use it on any page.
- EXCEPTION (owner, 2026-10-26): the owner LOVES the GOLD-CHROME in `design/references/liquid-glass/01-gold-chrome-liquid-glass-panels.png` ("a mixture of gold and a chrome"). Match it exactly when asked: a pale, low-saturation chrome gold, never orange or rose. Sampled: shadow #332814 / #423524, mid #68513d / #a4845d, highlight #f0e6c7, hot #fef9e8. In LAB the chroma stays low (a* ~3-5, b* ~11-19). The other gold bans still stand.
- Neon chartreuse (#d4ff3a) is liked as an ACCENT where it suits a page (glows, "Verified" chips in neon text on charcoal #1f2124, dollar values, tracker lines) — always sparing, never overwhelming. Each page still keeps its own unique palette.
- Overall tone: CLASSY. The user LIKES glow accents — keep them. What is too loud is big areas of colour (e.g. bright purple/blue backgrounds): keep backgrounds dark and near-neutral (deep charcoal/black with only a faint tint) so the glowing accents stand out. Keep all the animation. When asked for a tweak, change only what was asked — never remove features or rewrite copy.
- Main direction: CLASSY and grown-up — not blue/purple/neon (the user said that looks like a kid's website). Use refined palettes such as onyx & platinum, oxblood & stone, espresso & ivory, ink & bone, smoke & rosewood. NO GREEN of any kind (the user dislikes it) — ONE exception the user asked for: a light page in white + deep forest green + matching warm brown + a very small rich pumpkin-orange accent. Never use green elsewhere, and never for "verified" badges. Glassmorphism (see-through frosted cards and buttons) on dark grounds.
- Premium accents: chrome/silver and matte black. Status/"verified" signals use platinum, bone or the page accent — never green, never yellow.
- Industry icons and hero objects must be REAL 3D (three.js/WebGL: extruded geometry, metal/glass materials, environment reflections) that moves and reacts to scroll and pointer ("4D"). CSS-faked depth alone is not enough. Never emoji, never flat cheap icons.

## New design options
- When the user asks for new examples/versions, every page must be COMPLETELY different: new layout grid, hero composition, section structure, card/button shapes, fonts, palette, menu and scroll. Never deliver a recolour or the same layout in light/dark as a "new" option (the user rejected a dark recolour of The Machine).
- The Machine (cream configurator with knobs/levers, light and dark) is the user's LEAST favourite — never base new designs on it. Favourites so far: The Descent (skyline dive) and Frame by Frame.

## Headings and brand names (permanent, owner's rule)
- ALL headings and headers are written in CAPITALS (h1, h2, h3, section titles, menu items, wordmarks, card titles, intro words). Use `text-transform:uppercase` plus a little letter-spacing, and type the brand in capitals in the source too.
- Brand names are ALWAYS in capitals: PEPTICITY, APEX 360. Never "Pepticity" in a heading, logo, wordmark, label or 3D texture.
- Product visuals must look photo-real and expensive. Never ship a hand-built three.js "drawing" of a product (bottle, vial, jar) as the hero: use Higgsfield-generated photoreal stills/films (or a real GLB) and only use three.js for effects around them.

## Content
- No invented stats, testimonials, guarantees or client counts. Use clearly marked placeholders like `[Your verification process]`.

@AGENTS.md

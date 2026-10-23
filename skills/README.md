# Colour skills

Eight Claude Code skills for palette building, mixing, harmony, contrast, dark/light themes and brand colour. Install the folder as a set: several skills call the shared kit at `tonal-scales-and-tokens/palette.mjs` by relative path (`../tonal-scales-and-tokens/palette.mjs`).

They build on, and do not repeat, two existing skills:
- `apex_agents_bots/.claude/skills/design-tokens-theming`: the `--apx-*` token contract, DTCG build with Style Dictionary, the inline JS colour kit and the banned hue zones. These skills use the same banned zones (H 65-105 and H 105-175 at C ≥ 0.04; `#d4ff3a` exempt).
- `neon-glass-ui` (synced): glass panes, torch and sweep. Note: its palette (`#E2FF1F`, `#EAFF00`, `#FFAE00`, `#00FFC2`, `#586B00`) measures inside the banned zones; only `#d4ff3a` is exempt. Worth a decision by the owner.

## Skills

| Skill | What it does |
|---|---|
| [color-palette-architect](color-palette-architect/SKILL.md) | Brief → role-based brand palette (ground, surface, ink, secondary, accent, signals), 60-30-10, hue-biased neutrals, verified signature pairings, reasons per colour |
| [color-mixing-oklch](color-mixing-oklch/SKILL.md) | Perceptual mixing, tints/shades/tones, state colours, gamut mapping, `color-mix()` and relative colour syntax, muddy-mix diagnosis |
| [tonal-scales-and-tokens](tonal-scales-and-tokens/SKILL.md) | Radix-style 12-step scales with step jobs, light + dark, Tailwind 50-950 mapping, token tiers, DTCG output. **Holds `palette.mjs`** |
| [contrast-and-accessibility-color](contrast-and-accessibility-color/SKILL.md) | WCAG 2.2 (law) + APCA (advisory), focus rings, text over images, CVD simulation, seniors, axe-core |
| [palette-from-image](palette-from-image/SKILL.md) | `extract.mjs`: PNG decode + OKLab k-means, role assignment, taste-rule rejection, logo handling |
| [color-harmony-and-mood](color-harmony-and-mood/SKILL.md) | OKLCH harmony schemes filtered by taste rules, mood/industry map, cultural notes, owner preferences |
| [dark-mode-color-systems](dark-mode-color-systems/SKILL.md) | Dark as its own system: tinted grounds, elevation by lightness, ink without halation, accents and glows, switching mechanics |
| [gradient-and-glow-craft](gradient-and-glow-craft/SKILL.md) | Gradients without grey dead zones, hue-path control, aurora/mesh, glow layering, legibility ceiling, banding |

## Scripts (Node 18+, no dependencies)

```bash
node tonal-scales-and-tokens/palette.mjs            # help
node tonal-scales-and-tokens/palette.mjs info '#6b1d2a' '#c9a96a'
node tonal-scales-and-tokens/palette.mjs ramp '#7a2232'
node tonal-scales-and-tokens/palette.mjs tokens '#7a2232' --name brand [--dtcg 1]
node tonal-scales-and-tokens/palette.mjs mix|gradient <a> <b> [t|n]
node tonal-scales-and-tokens/palette.mjs contrast <fg> <bg>
node tonal-scales-and-tokens/palette.mjs cvd <hex...>
node palette-from-image/extract.mjs image.png 6 [--json]
```
`palette.mjs` also exports its functions (`import { ramp, apca, wcag, mix, fit } from './palette.mjs'`). APCA matches the reference values (black on white Lc 106.0, white on black Lc −107.9).

## Verified source repos

Checked 2026-10-23 by `git ls-remote` and a shallow clone (last commit date = HEAD commit; licence read from the repo). npm versions from `npm view`.

| Repo | URL | Last commit | Licence | npm | Why it matters |
|---|---|---|---|---|---|
| Evercoder/culori | https://github.com/Evercoder/culori | 2026-10-15 | MIT | culori 4.0.2 | Most complete JS colour library: every CSS space, gamut mapping, interpolation, ΔE; tree-shakeable |
| color-js/color.js | https://github.com/color-js/color.js | 2026-10-19 | MIT | colorjs.io 0.7.1 | By CSS Color spec editors (Verou, Lilley); reference gamut mapping, APCA and WCAG contrast |
| gka/chroma.js | https://github.com/gka/chroma.js | 2026-09-15 | BSD-3 (+ Apache-2.0 ColorBrewer data) | chroma-js 3.2.0 | Scales, bezier interpolation, lightness correction for data viz |
| adobe/leonardo | https://github.com/adobe/leonardo | 2026-07-08 | Apache-2.0 | @adobe/leonardo-contrast-colors 1.1.0 | Generates colours by **target contrast ratio**; themes adapt to brightness/contrast settings |
| material-foundation/material-color-utilities | https://github.com/material-foundation/material-color-utilities | 2026-10-19 | Apache-2.0 | @material/material-color-utilities 0.4.0 | HCT space, tonal palettes, dynamic colour from an image/seed |
| radix-ui/colors | https://github.com/radix-ui/colors | 2025-12-17 | MIT | @radix-ui/colors 3.0.0 | 12-step scales and the step-usage rules adopted in tonal-scales-and-tokens |
| evilmartians/oklch-picker | https://github.com/evilmartians/oklch-picker | 2026-10-05 | MIT | (app: oklch.com) | OKLCH picker showing sRGB/P3/Rec2020 gamut boundaries |
| ardov/huetone | https://github.com/ardov/huetone | 2023-11-19 | MIT | (app) | Visual editor for accessible palettes in LCH/OKLCH with APCA/WCAG grids (inactive since 2023; `antiflasher/huetone` does not exist) |
| Myndex/apca-w3 | https://github.com/Myndex/apca-w3 | 2026-05-06 | W3 licence for compliant code only (restricted) | apca-w3 0.1.9 | Official APCA implementation; use as reference, cite APCA as advisory |
| Myndex/SAPC-APCA | https://github.com/Myndex/SAPC-APCA | 2026-07-25 | Restricted (compliant code only) | — | APCA documentation, thresholds and research |
| dequelabs/axe-core | https://github.com/dequelabs/axe-core | 2026-10-21 | MPL-2.0 | axe-core 4.14.0 | Automated `color-contrast` / `color-contrast-enhanced` rules in the browser |
| google/palette.js | https://github.com/google/palette.js | 2020-01-10 | Apache-2.0 | google-palette 1.1.1 | ColorBrewer, Tol and Solarized schemes, including colour-blind-safe sequences (unmaintained) |
| lokesh/color-thief | https://github.com/lokesh/color-thief | 2026-08-02 | MIT | colorthief 3.5.0 | Dominant colour / palette extraction from images (median cut). Note: npm `color-thief` is an unrelated fork; use `colorthief` |
| Vibrant-Colors/node-vibrant | https://github.com/Vibrant-Colors/node-vibrant | 2026-01-27 | MIT | node-vibrant 4.0.4 | Extracts named swatches (Vibrant, Muted, DarkVibrant…) from images |
| tailwindlabs/tailwindcss | https://github.com/tailwindlabs/tailwindcss | 2026-10-19 | MIT | tailwindcss 4.3.3 | v4 default palette is defined in OKLCH; 50-950 naming mapped in tonal-scales-and-tokens |

Not found / not listed: `antiflasher/huetone`, a "realtime colors" repo (the site realtimecolors.com has no verified public repo), `kevinmaze/*`.

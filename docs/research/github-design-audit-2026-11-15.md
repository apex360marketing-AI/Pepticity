# GITHUB DESIGN AUDIT: SKILLS, SCROLL, HOVER, 3D, UI (15 NOV 2026)

Read-only research for Tyson (APEX 360 / PEPTICITY). Nothing was cloned, installed or changed.
Stars and push dates come from the GitHub search API on 15 Nov 2026 (rounded). Licence = the SPDX id GitHub reports; "none" or "NOASSERTION" means no standard licence was detected, so check by hand before shipping client work.

**Verdicts:** USE NOW = install or adopt this week. WORTH A LOOK = useful for study or one job. SKIP = stale, wrong fit or licence risk.

**House-rule filter applied:**
- Imagery stays Higgsfield-only. Repos that *draw* products, scenes or objects in code (for example img2threejs, procedural scene skills) are for effects and study only, never for drawing the real thing.
- Chrome, glass and hologram shaders are for logos, type, UI and light *around* real imagery. That is allowed.
- Flagged licences: **react-bits = MIT + Commons Clause** (fine to use in client sites, but no reselling the components). **Aceternity UI = custom licence**, not on GitHub, no redistribution. **GSAP core = "Standard No Charge" licence**: free for commercial use (Webflow, 2025), but it is not OSI open source.

---

## 1. CLAUDE CODE / AGENT SKILL PACKS

| # | Repo | Stars | Last push | Licence | What it gives us | Verdict |
|---|---|---|---|---|---|---|
| 1 | [anthropics/skills](https://github.com/anthropics/skills) | 195k | 2026-11-14 | Per folder (frontend-design = Apache-2.0) | The official packs: `frontend-design`, `canvas-design`, `theme-factory`, `web-artifacts-builder`, `algorithmic-art`, `skill-creator`, `webapp-testing` | USE NOW (several are already synced here as `anthropic-skills:*`) |
| 2 | [greensock/gsap-skills](https://github.com/greensock/gsap-skills) | 18k | 2026-07-29 | MIT | GSAP's **official** agent skills: core, timeline, ScrollTrigger, plugins, React, performance | USE NOW |
| 3 | [pbakaus/impeccable](https://github.com/pbakaus/impeccable) | 110k | 2026-11-15 | Apache-2.0 | Design vocabulary plus polish, bolder and critique commands that steer and review frontend output. Strong anti-slop | USE NOW |
| 4 | [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill) | 116k | 2026-11-08 | MIT | Art direction, reference images and a browser-check loop | USE NOW |
| 5 | [CloudAI-X/threejs-skills](https://github.com/CloudAI-X/threejs-skills) | 4.2k | 2026-10-19 | MIT | 13 focused three.js skills: materials, lighting, post-processing, shaders, R3F, loaders, performance | USE NOW |
| 6 | [scottstts/Threejs-Awesome-Graphics-Agent-Skills](https://github.com/scottstts/Threejs-Awesome-Graphics-Agent-Skills) | 1k | 2026-10-22 | MIT | 24 graphics skills with a router: bloom, exposure/colour grading, SSAO, shadows, camera direction, visual validation | USE NOW (pick bloom, grading, SSAO, camera, validation; skip the procedural-world ones) |
| 7 | [gokayfem/shader-skills](https://github.com/gokayfem/shader-skills) | 450 | 2026-10-23 | MIT | GLSL/Shadertoy skill with 186 functions (noise, SDF, colour) for hologram and backdrop shaders | USE NOW |
| 8 | [nateherkai/scroll-craft](https://github.com/nateherkai/scroll-craft) | 5.1k | 2026-09-30 | MIT | Skill for premium, immersive, scroll-driven sites | USE NOW (compare with our `cinematic-scroll` and keep the best bits) |
| 9 | [heydamir/unslop](https://github.com/heydamir/unslop) | 16k | 2026-11-15 | CC-BY-4.0 | Turns AI-looking UI into designed UI. Pairs with our `anti-slop-gate` | WORTH A LOOK (attribution needed) |
| 10 | [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | 150k | 2026-11-14 | MIT | Big UI/UX knowledge base (styles, palettes, type pairings) plus design-system and brand skills | WORTH A LOOK (broad; generic palettes may clash with locked brand) |
| 11 | [LottieFiles/motion-design-skill](https://github.com/LottieFiles/motion-design-skill) | 3.1k | 2026-05-18 | MIT | Timing, easing, choreography, Disney principles | WORTH A LOOK |
| 12 | [oil-oil/oil-motion](https://github.com/oil-oil/oil-motion) | 2.9k | 2026-10-04 | MIT | Web animation skill for scroll- and mouse-driven motion | WORTH A LOOK |
| 13 | [Jakubantalik/transitions.dev](https://github.com/Jakubantalik/transitions.dev) | 6.3k | 2026-11-08 | NOASSERTION | 43+ crafted UI transitions plus a skill | WORTH A LOOK (check licence) |
| 14 | [VoltAgent/awesome-design-md](https://github.com/VoltAgent/awesome-design-md) | 128k | 2026-10-28 | MIT | DESIGN.md files breaking down big-brand design systems; good study input | WORTH A LOOK |
| 15 | [AThevon/genjutsu](https://github.com/AThevon/genjutsu) | 800 | 2026-11-14 | NOASSERTION | Creative-coding skills: motion, micro-interactions, design | WORTH A LOOK (check licence) |
| 16 | [Moh4696/open-3d-skills](https://github.com/Moh4696/open-3d-skills) | 380 | 2026-11-09 | MIT | Eight skills for 3D/animated sites: three.js, scroll films, transparent video | WORTH A LOOK |
| 17 | [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) / [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) / [hesreallyhim/awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code) | 37k / 80k / 58k | 2026-11 / 09 / 11 | MIT / none / NOASSERTION | Index lists for finding new skills | WORTH A LOOK (directories, not installs) |
| 18 | [frankxai/awesome-motion-design-agent-skills](https://github.com/frankxai/awesome-motion-design-agent-skills) | 110 | 2026-11-12 | CC0-1.0 | Curated GSAP / Motion / Lottie / Rive skill list | WORTH A LOOK |
| 19 | [sickn33/agentic-awesome-skills](https://github.com/sickn33/agentic-awesome-skills) | 50k | 2026-11-14 | MIT | 2,955 skills, quality varies a lot | SKIP (too noisy) |

## 2. CINEMATIC SCROLL

| # | Repo | Stars | Last push | Licence | What it gives us | Verdict |
|---|---|---|---|---|---|---|
| 20 | [greensock/GSAP](https://github.com/greensock/GSAP) | 31k | 2026-11-04 | GSAP Standard No Charge (free commercial use) | ScrollTrigger, SplitText, MorphSVG, Flip. All plugins free since 2025 | USE NOW |
| 21 | [darkroomengineering/lenis](https://github.com/darkroomengineering/lenis) | 17k | 2026-11-13 | MIT | The standard smooth scroll; pairs with ScrollTrigger and scroll-scrubbed frame sequences | USE NOW |
| 22 | [theatre-js/theatre](https://github.com/theatre-js/theatre) | 13k | 2024-08-14 | Apache-2.0 | Keyframe editor for three.js/R3F camera moves driven by scroll | WORTH A LOOK (works, but quiet since 2024) |
| 23 | [russellsamora/scrollama](https://github.com/russellsamora/scrollama) | 6k | 2025-11-13 | MIT | Light IntersectionObserver step triggers; handy for hold-and-step | WORTH A LOOK |
| 24 | [locomotivemtl/locomotive-scroll](https://github.com/locomotivemtl/locomotive-scroll) | 8.9k | 2026-11-13 | MIT | v5 runs on Lenis and adds viewport detection and parallax attributes | WORTH A LOOK |
| 25 | [14islands/r3f-scroll-rig](https://github.com/14islands/r3f-scroll-rig) | 1k | 2025-12-17 | MIT | Syncs WebGL meshes to DOM elements as you scroll (3D logo that follows the layout) | WORTH A LOOK |
| 26 | [codrops](https://github.com/codrops) 2025-26 demos: [ScrollBasedLayoutAnimations](https://github.com/codrops/ScrollBasedLayoutAnimations), [OnScrollColumnsRows](https://github.com/codrops/OnScrollColumnsRows), [3DCarousel](https://github.com/codrops/3DCarousel), [RotatingOnScrollAnimations](https://github.com/codrops/RotatingOnScrollAnimations), [interlude](https://github.com/codrops/interlude) | 50-340 each | 2025-12 to 2026-11 | MIT | Ready GSAP ScrollTrigger patterns and Astro page transitions | USE NOW (as reference patterns) |
| 27 | [barbajs/barba](https://github.com/barbajs/barba) | 13k | 2024-12-02 | MIT | Page transitions for multi-page sites | WORTH A LOOK (View Transitions API now covers most of this) |
| 28 | [basementstudio/scrollytelling](https://github.com/basementstudio/scrollytelling) | 1.7k | 2024-02-22 | NOASSERTION | React and GSAP scrollytelling | SKIP (stale, unclear licence) |

## 3. HOVER, MICRO-INTERACTIONS, CURSOR

| # | Repo | Stars | Last push | Licence | What it gives us | Verdict |
|---|---|---|---|---|---|---|
| 29 | [codrops/DoubleImageHoverEffects](https://github.com/codrops/DoubleImageHoverEffects), [MotionTrailAnimations](https://github.com/codrops/MotionTrailAnimations), [AnimatedCodeBackground](https://github.com/codrops/AnimatedCodeBackground) | 80 each | 2026-10/11 | MIT | Clip-path hover reveals, cursor image trails, Evervault-style hover grid | USE NOW |
| 30 | [codrops/HoverEffectIdeas](https://github.com/codrops/HoverEffectIdeas) | 1.6k | 2023-10-17 | none | Classic subtle hover ideas | WORTH A LOOK (study only; no licence) |
| 31 | [ddoemonn/interior](https://github.com/ddoemonn/interior) | 1.3k | 2026-10-21 | MIT | React micro-interactions for the half-second after a click | WORTH A LOOK |
| 32 | [lochie/web-haptics](https://github.com/lochie/web-haptics) | 2.9k | 2026-09-02 | MIT | Haptic taps on mobile web for button presses | WORTH A LOOK |
| 33 | [CatsJuice/ipad-cursor](https://github.com/CatsJuice/ipad-cursor) | 460 | 2025-01-20 | MIT | Magnetic iPad-style cursor that snaps to buttons | WORTH A LOOK |
| 34 | [IanLunn/Hover](https://github.com/IanLunn/Hover) / [tholman/cursor-effects](https://github.com/tholman/cursor-effects) | 29k / 4k | 2023 / 2026 | NOASSERTION / none | Old-school CSS hovers and retro cursor trails | SKIP (dated look, cheap feel) |

## 4. THREE.JS / WEBGL / WEBGPU (CHROME, GLASS, HOLOGRAM, POST)

| # | Repo | Stars | Last push | Licence | What it gives us | Verdict |
|---|---|---|---|---|---|---|
| 35 | [mrdoob/three.js](https://github.com/mrdoob/three.js) | 118k | 2026-11-15 | MIT | Core. MeshPhysicalMaterial (clearcoat, iridescence, transmission, anisotropy, sheen), PMREM env maps, RoomEnvironment studio light, WebGPU renderer and TSL node shaders | USE NOW |
| 36 | [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) + [pmndrs/drei](https://github.com/pmndrs/drei) | 34k + 10k | 2026-10-21 | MIT | R3F plus helpers: `Environment`/`Lightformer` (softbox strips for real chrome), `MeshTransmissionMaterial` (smoked glass), `Text3D`/`Center` (logo extrusion), `Float`, `ContactShadows` | USE NOW |
| 37 | [pmndrs/drei-vanilla](https://github.com/pmndrs/drei-vanilla) | 620 | 2026-02-20 | MIT | Same drei materials and helpers without React, for our vanilla pages | USE NOW |
| 38 | [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) (+ [react-postprocessing](https://github.com/pmndrs/react-postprocessing)) | 3k (+1.6k) | 2026-11-01 | Zlib / MIT | Bloom with selective glow, chromatic aberration, SMAA, tone mapping, noise, vignette, god rays | USE NOW |
| 39 | [N8python/n8ao](https://github.com/N8python/n8ao) | 510 | 2026-11-12 | CC0-1.0 | Clean SSAO: contact darkness that makes matte gunmetal read as real | USE NOW |
| 40 | [FarazzShaikh/THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) | 1.4k | 2025-10-12 | MIT | Inject hologram scanlines, fresnel rims or UV-glow into physical materials without losing PBR | USE NOW |
| 41 | [gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) | 2k | 2026-11-15 | MIT | Path-traced still frames of the chrome logo for hero posters and fallbacks | WORTH A LOOK |
| 42 | [DerSchmale/threejs-thin-film-iridescence](https://github.com/DerSchmale/threejs-thin-film-iridescence) | 140 | 2023-09-06 | MIT | Thin-film reference for violet/UV sheen on dark metal sides | WORTH A LOOK (built-in `iridescence` usually enough) |
| 43 | [cortiz2894/hologram-particles](https://github.com/cortiz2894/hologram-particles) | 110 | 2026-06-30 | none | Hologram particle effect in WebGPU + TSL + Next.js | WORTH A LOOK (study only; no licence) |
| 44 | [paper-design/shaders](https://github.com/paper-design/shaders) | 4k | 2026-11-13 | Apache-2.0 | Zero-dependency canvas shaders (mesh gradients, liquid metal, grain) | USE NOW (ambient light and metal sheen behind real imagery) |
| 45 | [AndrewPrifer/liquid-dom](https://github.com/AndrewPrifer/liquid-dom) / [shuding/liquid-glass](https://github.com/shuding/liquid-glass) / [rdev/liquid-glass-react](https://github.com/rdev/liquid-glass-react) | 2.6k / 1.2k / 6.7k | 2026-09 / 2026-03 / 2025-06 | MIT | Real refractive "liquid glass" for DOM panels | WORTH A LOOK (liquid-dom first) |
| 46 | [pmndrs/uikit](https://github.com/pmndrs/uikit) | 3.3k | 2026-10-27 | NOASSERTION | UI panels inside the 3D scene (hologram cards) | WORTH A LOOK (check licence) |
| 47 | [martinlaxenaire/gpu-curtains](https://github.com/martinlaxenaire/gpu-curtains) | 190 | 2026-11-06 | MIT | WebGPU DOM-to-plane effects (image distortion on hover or scroll) | WORTH A LOOK |
| 48 | [0beqz/realism-effects](https://github.com/0beqz/realism-effects) | 1.8k | 2024-02-04 | MIT | SSGI, motion blur, TRAA | SKIP (stale; n8ao + postprocessing cover it) |
| 49 | [AxiomeCG/awesome-threejs](https://github.com/AxiomeCG/awesome-threejs) / [sjfricke/awesome-webgl](https://github.com/sjfricke/awesome-webgl) | 1k / 1.5k | 2026-07 / 2026-11 | CC0-1.0 | Index lists | WORTH A LOOK |

## 5. AWARD-LEVEL COMPONENTS / UI LIBRARIES

| # | Repo | Stars | Last push | Licence | What it gives us | Verdict |
|---|---|---|---|---|---|---|
| 50 | [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits) | 52k | 2026-11-14 | **MIT + Commons Clause** | Biggest animated component set: text effects, WebGL backgrounds, cursors, magnetic buttons. Also ships vanilla/TS variants | USE NOW (in client sites only; never resell the components) |
| 51 | [magicuidesign/magicui](https://github.com/magicuidesign/magicui) | 23k | 2026-11-13 | MIT | shadcn-style animated components (border beams, shine, marquees, number tickers) | USE NOW (restyle to brand) |
| 52 | [motiondivision/motion](https://github.com/motiondivision/motion) | 35k | 2026-11-15 | MIT | Motion (ex Framer Motion): springs, layout animation, scroll, gestures; also vanilla JS | USE NOW |
| 53 | [nolly-studio/cult-ui](https://github.com/nolly-studio/cult-ui) | 7.4k | 2026-10-29 | MIT | 150+ animated shadcn components, more design-engineer feel | WORTH A LOOK |
| 54 | [ibelick/motion-primitives](https://github.com/ibelick/motion-primitives) | 7k | 2026-09-28 | MIT | Animated primitives (spotlight, tilt, glow, morphing dialog) | WORTH A LOOK |
| 55 | [juliangarnier/anime](https://github.com/juliangarnier/anime) | 75k | 2026-11-02 | MIT | anime.js v4: tiny engine with SVG morph, timelines, scroll observer | WORTH A LOOK |
| 56 | [shadcn-ui/ui](https://github.com/shadcn-ui/ui) | 128k | 2026-11-13 | MIT | Base layer that Magic UI and Cult UI build on | WORTH A LOOK (base only; never ship default look) |
| 57 | Aceternity UI (ui.aceternity.com) | n/a | n/a | **Custom licence**, no public GitHub repo | Copy-paste effects (spotlight, 3D card, beams) | WORTH A LOOK (use free items in end products only; no redistribution; Pro $199) |

---

## TOP 8 SKILL PACKS TO INSTALL INTO `.claude/skills`

Each path is relative to the repo root. Copy the folder that holds the SKILL.md (with its reference files) to `.claude/skills/<name>/`. Install *after* Tyson OKs it, and check for clashes with locked skills (`chrome-material`, `matte-material`, `cinematic-scroll`, `anti-slop-gate`). Locked brand rules always win.

1. **greensock/gsap-skills**: `skills/gsap-core/SKILL.md`, `skills/gsap-timeline/SKILL.md`, `skills/gsap-scrolltrigger/SKILL.md`, `skills/gsap-plugins/SKILL.md`, `skills/gsap-performance/SKILL.md`, `skills/gsap-utils/SKILL.md`, `skills/gsap-react/SKILL.md`, `skills/gsap-frameworks/SKILL.md`
2. **CloudAI-X/threejs-skills**: `skills/threejs-materials/SKILL.md`, `skills/threejs-lighting/SKILL.md`, `skills/threejs-postprocessing/SKILL.md`, `skills/threejs-shaders/SKILL.md`, `skills/threejs-textures/SKILL.md`, `skills/threejs-loaders/SKILL.md`, `skills/threejs-performance/SKILL.md`, `skills/threejs-react-three-fiber/SKILL.md`, `skills/threejs-animation/SKILL.md`, `skills/threejs-interaction/SKILL.md` (plus fundamentals, geometry, asset-pipeline)
3. **pbakaus/impeccable**: `.claude/skills/impeccable/SKILL.md`
4. **Leonxlnx/taste-skill**: `skills/taste-skill/SKILL.md`
5. **anthropics/skills**: `skills/frontend-design/SKILL.md`, `skills/canvas-design/SKILL.md`, `skills/theme-factory/SKILL.md`, `skills/web-artifacts-builder/SKILL.md`, `skills/webapp-testing/SKILL.md`. Several are already present as `anthropic-skills:*`; `frontend-design` and `webapp-testing` are the new ones.
6. **scottstts/Threejs-Awesome-Graphics-Agent-Skills**: `skills/threejs-skill-router/SKILL.md`, `skills/threejs-bloom/SKILL.md`, `skills/threejs-exposure-color-grading/SKILL.md`, `skills/threejs-screen-space-ambient-occlusion/SKILL.md`, `skills/threejs-camera-direction/SKILL.md`, `skills/threejs-shadow-systems/SKILL.md`, `skills/threejs-visual-validation/SKILL.md`, `skills/threejs-procedural-materials/SKILL.md`
7. **gokayfem/shader-skills**: `skills/shader-art-coding/SKILL.md`
8. **nateherkai/scroll-craft**: `plugins/nateherk-design/skills/scroll-craft/SKILL.md`

Runners-up: `heydamir/unslop` → `skills/unslop/SKILL.md` (CC-BY-4.0); `LottieFiles/motion-design-skill` → `skills/motion-design/SKILL.md`; `oil-oil/oil-motion` → `SKILL.md` (repo root); `nextlevelbuilder/ui-ux-pro-max-skill` → `.claude/skills/ui-ux-pro-max/SKILL.md`, `.claude/skills/design-system/SKILL.md`.

## RECOMMENDED STACK FOR THE CHROME / SMOKED-GLASS / HOLOGRAM LOOK

- **Chrome logo:** three.js MeshPhysicalMaterial (metalness 1, roughness 0.05-0.15, clearcoat), lit by drei `Environment` + `Lightformer` softbox strips on a black studio, so it shows deep blacks and hot white streaks (matches the `chrome-material` skill). Add n8ao for contact shadows and pmndrs/postprocessing selective bloom on the edge highlights only.
- **Smoked glass:** drei `MeshTransmissionMaterial` (WebGL) for 3D panels; liquid-dom or CSS backdrop-filter for DOM sheets.
- **Hologram:** THREE-CustomShaderMaterial (fresnel rim + scanlines + flicker), with gokayfem shader-skills for the noise and SDF maths.
- **Scroll:** Lenis + GSAP ScrollTrigger (pinned hold-and-step, scrubbed Higgsfield frame sequences); r3f-scroll-rig when the 3D must follow DOM layout.
- **Hover:** Motion springs + react-bits / Magic UI patterns, restyled to brand; Codrops 2026 MIT demos for image hovers and cursor trails.

## SOURCES

- GitHub search API (`search/repositories`, `search/code`), run 15 Nov 2026
- react-bits licence: https://raw.githubusercontent.com/DavidHDev/react-bits/main/LICENSE.md
- anthropics/skills frontend-design licence: https://github.com/anthropics/skills/blob/main/skills/frontend-design/LICENSE.txt
- Aceternity licence and pricing: https://ui.aceternity.com/licence, https://ui.aceternity.com/pricing

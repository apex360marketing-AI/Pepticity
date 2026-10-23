# UI/UX skills for cinematic builds

These 12 skills sit on top of the house skills in `apex_agents_bots/.claude/skills` (apex-cinematic-design, gsap-scroll-choreography, premium-micro-interactions, quality-gate, effect-catalog, css-scroll-driven-motion, threejs-real-3d, webgl-shader-backgrounds) and the synced `cinematic-scroll` and `regulated-claims-check`. They add only what those skills don't cover. The colour skills (`color-*`, `contrast-and-accessibility-color`, etc.) are indexed separately in `README.md`.

| Skill | Path | Use it when |
|---|---|---|
| cinematic-preloader-entrance | `skills/cinematic-preloader-entrance/SKILL.md` | Building or changing a 7–9 s intro and its handoff transition (cube, portal, letterbox, slats, liquid ripple) without hurting LCP |
| view-transitions-pages | `skills/view-transitions-pages/SKILL.md` | Hash-routed views, page and route transitions, shared-element morphs, React `<ViewTransition>` |
| webgpu-tsl-shaders | `skills/webgpu-tsl-shaders/SKILL.md` | GPU compute particles or node-material heroes with three r186 WebGPURenderer, TSL and a WebGL2 fallback |
| molecule-3d-renderer | `skills/molecule-3d-renderer/SKILL.md` | Peptide or molecule visuals, either accurate (3Dmol.js, Mol*) or stylised (helix.js, instanced spheres), with real helix geometry |
| conversion-funnel-ux | `skills/conversion-funnel-ux/SKILL.md` | Section order, above-the-fold, sticky CTA, compliant hooks, event tracking, A/B tests |
| quiz-funnel-builder | `skills/quiz-funnel-builder/SKILL.md` | Assessment quizzes from a JSON schema with branching, resume, accessibility, Motion in Next.js |
| ai-concierge-ui | `skills/ai-concierge-ui/SKILL.md` | Chat assistant UI with a guard-railed system prompt, human handoff and lazy-loading (confirm before going live) |
| senior-accessibility-aa-plus | `skills/senior-accessibility-aa-plus/SKILL.md` | 55+ readability: 18–20px body, 7:1, 44–56px targets, focus not obscured, plain language, axe plus custom checks |
| perf-budget-cwv | `skills/perf-budget-cwv/SKILL.md` | LCP < 2.0 s, INP < 150 ms, CLS < 0.05, JS < 170 KB gz, deferring WebGL, measuring with Playwright and web-vitals |
| web-video-pipeline | `skills/web-video-pipeline/SKILL.md` | Turning a Higgsfield clip into AV1/VP9/H.264 intro plates and posters (intro-only video rule; confirm before spending credits) |
| audience-personalization | `skills/audience-personalization/SKILL.md` | The "I'm here for…" switcher that adapts hero, imagery, proof order, quiz start and CTAs to five audiences |
| award-jury-review | `skills/award-jury-review/SKILL.md` | Final self-critique against Awwwards criteria, with the top 3 fixes and a re-score |

## Suggested order on a new template
1. `conversion-funnel-ux` and `audience-personalization`: plan the beats and the content map.
2. `cinematic-preloader-entrance`, `view-transitions-pages` and `molecule-3d-renderer` (or `webgpu-tsl-shaders`): build the cinematic layer.
3. `quiz-funnel-builder` and `ai-concierge-ui`: build the conversion tools.
4. `web-video-pipeline`: only once the intro film exists.
5. `perf-budget-cwv`, `senior-accessibility-aa-plus`, then house `quality-gate`: check that it passes.
6. `award-jury-review`: polish loop, then report.

## Shared rules across all 12
- Compliance: every user-facing string goes through `regulated-claims-check`. Do not use outcome claims, dosing, fake reviews or invented stats.
- Stop and confirm with the user before anything that spends money or credits or reaches the public: Higgsfield generation, live AI models, publishing artifacts or assets, award submissions, spawning sub-agents.
- Library versions were checked with `npm view` on 2026-10-23: three 0.186.1, 3dmol 2.5.5, molstar 5.13.1, gsap 3.15.0, lenis 1.3.27, motion 14.6.0, web-vitals 6.2.3, axe-core and @axe-core/playwright 4.14.0, playwright 1.64.1, ai 7.0.150, @ai-sdk/react 4.0.154, @ai-sdk/anthropic 4.0.87. Artifact CDN scripts must be pinned to versions at least two weeks old (motion 14.6.0 is one day old, so it is for npm/Next.js only).
- Pepticity template folders allow no libraries beyond the vendored gsap/ScrollTrigger/SplitText/Lenis. The library-based paths in these skills (three, 3Dmol, Mol*, Motion, AI SDK) apply to the Next.js app or to standalone artifacts.

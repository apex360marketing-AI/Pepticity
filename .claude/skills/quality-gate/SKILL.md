---
name: quality-gate
description: Run APEX's automatic quality gate on any page or artifact before it ships — phone + desktop screenshots with visual-change comparison, page errors, sideways scroll, accessibility (WCAG 2.2 AA via axe), speed budgets (LCP/CLS/long tasks), reduced-motion check and search-readable text. Use before publishing or sending ANY page, design, artifact module or showcase update.
---

# APEX quality gate

Nothing ships unless it passes. Run: `node tools/quality-gate/gate.mjs <url-or-file> [--name key] [--update-baseline]`.

## What it checks (each page, at 1440×900 and 390×844)
1. **Loads clean** — no page errors, no failed requests from the page itself (favicon ignored).
2. **Fits** — `scrollWidth <= innerWidth` (no sideways scroll) at both sizes.
3. **Visual change** — full screenshots at fixed scroll stops compared to the saved baseline (`tools/quality-gate/baselines/<key>/`); >1.5% pixel difference is flagged for a human look (not auto-fail), and a diff image is written.
4. **Accessibility** — axe-core WCAG 2.2 AA rules; serious/critical violations fail. Tap targets ≥24px. Focus visible.
5. **Speed budget** (lab, software GL caveat noted) — LCP element appears ≤2.5 s on desktop throttling-off run; CLS ≤0.1; no single long task >200 ms during idle; total page weight reported.
6. **Calm motion** — page with `prefers-reduced-motion: reduce` loads with no errors and nothing stuck invisible.
7. **Search-readable** — main headings and body copy present in the HTML before scripts run (fetch raw HTML, check H1 + key text exist).
8. **Text never hidden** — no element with text left at opacity <0.05 after scrolling through.

## Output
`tools/quality-gate/reports/<key>-<date>.json` + a short console summary: PASS / FLAG / FAIL per check. Attach the summary when telling the user something is ready.

## Rules
- Software WebGL in the container is slow: speed numbers are indicative only; say so.
- Never mark a page ready with a FAIL. FLAGs need a human look at the diff image.
- After an intentional design change, re-run with `--update-baseline`.

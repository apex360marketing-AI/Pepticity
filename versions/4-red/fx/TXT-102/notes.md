# TXT-102 · Throttle Marquee

Giant lines of words glide sideways; scrolling speeds them up and flips their direction, and the outlined line fills in as it races.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TXT-102/module.css">
<div class="apx-txt102" data-apx="TXT-102" role="region" aria-label="Industries we cover">
  <p class="apx-txt102__row" data-dir="1">Roofing · Solar · Dental</p>
  <p class="apx-txt102__row" data-dir="-1" data-style="outline">Real estate · Injury law</p>
  <p class="apx-txt102__row" data-tone="muted">Landscaping · Electrical</p>
</div>
<script src="library/TXT-102/module.js"></script>
```
Auto-mounts every `[data-apx="TXT-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TXT-102'].mount(el)` (also `window.APX.TXT102`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
Items split on `·`, `|` or `•`. Per row: `data-dir` (1 / -1), `data-style="outline"` (fills in at speed), `data-tone="muted"`. `--apx-txt102-size` (default clamp(52px, 9.5vw, 160px)).

## Tokens
`--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-line`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Each row keeps one screen-reader copy of its items; moving tracks are aria-hidden duplicates. Pointing at a row slows it. Pauses off screen. Motion 0 / reduced motion: rows sit still, outlines shown filled.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

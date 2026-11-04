# BGD-102 · Plexus Field

A quiet field of points drifts and links up with fine lines; near the pointer they gather and their links light up, and a tap sends a ripple through them.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BGD-102/module.css">
<section style="position:relative">
  <div class="apx-bgd102" data-apx="BGD-102" aria-hidden="true"></div>
  <div style="position:relative; z-index:1">…content…</div>
</section>
<script src="library/BGD-102/module.js"></script>
```
Auto-mounts every `[data-apx="BGD-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['BGD-102'].mount(el)` (also `window.APX.BGD102`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
None beyond tokens. Point count scales with area (28–150; max 60 on phones).

## Tokens
`--apx-bg`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Decorative. Pointer gathering is mouse-only; a tap or click on the parent sends a ripple (touch-friendly). Off-screen / hidden tab: paused. Motion 0 / reduced motion: one still frame.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

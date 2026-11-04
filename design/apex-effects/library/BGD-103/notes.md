# BGD-103 · Halftone Light

A fine grid of printed dots swells and shrinks under slow drifting lights, like a halftone photo of light, with a pool that follows the pointer.

Weight: Heavy · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BGD-103/module.css">
<section style="position:relative">
  <div class="apx-bgd103" data-apx="BGD-103" aria-hidden="true"></div>
  <div style="position:relative; z-index:1">…content…</div>
</section>
<script src="library/BGD-103/module.js"></script>
```
Auto-mounts every `[data-apx="BGD-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['BGD-103'].mount(el)` (also `window.APX.BGD103`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`--apx-bgd103-cell` (dot spacing px; default 12, 9 on phones). Effective DPR capped at 1.5 for crisp dots at low cost.

## Tokens
`--apx-bg`, `--apx-ink`, `--apx-accent`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Decorative. Paused off screen. Motion 0 / reduced motion: one still frame. No WebGL: a static CSS dot grid.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

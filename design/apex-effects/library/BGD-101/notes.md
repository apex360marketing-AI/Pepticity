# BGD-101 · Satin Folds

Soft folds of dark satin ripple slowly behind the page, catching a sheen of light that follows the pointer and shifts as you scroll.

Weight: Heavy · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BGD-101/module.css">
<section style="position:relative">
  <div class="apx-bgd101" data-apx="BGD-101" aria-hidden="true"></div>
  <div style="position:relative; z-index:1">…content…</div>
</section>
<script src="library/BGD-101/module.js"></script>
```
Auto-mounts every `[data-apx="BGD-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['BGD-101'].mount(el)` (also `window.APX.BGD101`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
None beyond tokens. Renders at 0.6× (0.45× on phones), DPR capped at 2.

## Tokens
`--apx-bg`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Decorative (aria-hidden, pointer-events none). Stops drawing off screen and in hidden tabs. Motion 0 / reduced motion: one still frame. No WebGL: the CSS gradient on the container stays (adds `.is-fallback`).
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

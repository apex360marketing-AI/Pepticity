# BGD-104 · Fluted Glass

Soft lights move behind a wall of ribbed glass that bends them into stripes; moving the pointer sends ripples across the ribs.

Weight: Heavy · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/BGD-104/module.css">
<section style="position:relative">
  <div class="apx-bgd104" data-apx="BGD-104" aria-hidden="true"></div>
  <div style="position:relative; z-index:1">…content…</div>
</section>
<script src="library/BGD-104/module.js"></script>
```
Auto-mounts every `[data-apx="BGD-104"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['BGD-104'].mount(el)` (also `window.APX.BGD104`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`--apx-bgd104-flute` (rib width px; default 40, 26 on phones).

## Tokens
`--apx-bg`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Decorative. Ripples only from pointer movement. Paused off screen. Motion 0 / reduced motion: one still frame. No WebGL: static CSS ribs.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

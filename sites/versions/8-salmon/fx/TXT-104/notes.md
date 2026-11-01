# TXT-104 · Scatter Assemble

The letters of a headline start scattered and tumbling, then fly together into place as it scrolls up the screen, and shy away from the pointer.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TXT-104/module.css">
<h2 class="apx-txt104" data-apx="TXT-104">Every lead checked <em>before</em> it reaches you</h2>
<script src="library/TXT-104/module.js"></script>
```
Auto-mounts every `[data-apx="TXT-104"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TXT-104'].mount(el)` (also `window.APX.TXT104`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
Inline `<em>`/`<i>` keep the accent colour. Letters assemble by the time the heading reaches the middle of the screen.

## Tokens
`--apx-ink`, `--apx-accent`, `--apx-font-display`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
A visually hidden copy carries the sentence; split letters are aria-hidden. Scattered letters are clamped to the viewport so they never widen the page. Pointer repel is mouse-only. Motion 0 / reduced motion: plain heading.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

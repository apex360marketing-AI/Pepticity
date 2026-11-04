# LAY-101 · Bento Unfold

A bento grid arrives as one neat pile in the centre, then deals itself out tile by tile into place with a little spring, and each tile glows where you point.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/LAY-101/module.css">
<div class="apx-lay101" data-apx="LAY-101">
  <article class="apx-lay101__tile" data-span="big" style="--d:0"><span class="apx-lay101__chip">Sample</span><h3>…</h3><div class="apx-lay101__foot">…</div></article>
  <article class="apx-lay101__tile" style="--d:1"><small>…</small><h3>…</h3><p class="apx-lay101__foot">…</p></article>
  <article class="apx-lay101__tile" data-span="tall">…</article>
  <article class="apx-lay101__tile" data-span="wide">…</article> …
</div>
<script src="library/LAY-101/module.js"></script>
```
Auto-mounts every `[data-apx="LAY-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['LAY-101'].mount(el)` (also `window.APX.LAY101`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`data-span` = big (2×2) / wide (2×1) / tall (1×2). `.apx-lay101__foot` pushes content to the bottom. `.apx-lay101__btn` for a call to action. Plays once.

## Tokens
`--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Real grid in DOM order. Tiles are fully visible without JS. Pointer light is mouse-only. 4 columns → 2 under 900px → 1 under 520px. Motion 0 / reduced motion: grid appears in place.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

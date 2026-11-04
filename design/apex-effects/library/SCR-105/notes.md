# SCR-105 · Grid Bloom

A grid of tiles holds on screen while the middle tile grows to fill the view and the others drift away, revealing a full-screen message.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-105/module.css">
<section class="apx-scr105" data-apx="SCR-105" aria-labelledby="h">
  <div class="apx-scr105__stage">
    <div class="apx-scr105__grid">
      <div class="apx-scr105__tile" style="--d:0"><small>…</small><b>…</b></div> … (8 around)
      <div class="apx-scr105__tile" data-hero><div class="apx-scr105__label"><i class="apx-scr105__pulse" aria-hidden="true"></i><b>…</b><small>…</small></div></div>
    </div>
    <div class="apx-scr105__reveal"><h2 id="h">…</h2><p>…</p><a class="apx-scr105__cta" href="#">…</a></div>
  </div>
</section>
<script src="library/SCR-105/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-105"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-105'].mount(el)` (also `window.APX.SCR105`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`--apx-scr105-length` (default 320vh). Hero = `[data-hero]` tile, else the middle one. Grid is 3×3 on desktop.

## Tokens
`--apx-bg`, `--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The full-screen message is real text and becomes clickable only once shown. Phones / motion 0 / reduced motion: a plain two-column grid with the message below it.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

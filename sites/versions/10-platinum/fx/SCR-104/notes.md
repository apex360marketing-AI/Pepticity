# SCR-104 · Counter Columns

Three columns of tiles slide in opposite directions as you scroll past, around a calm headline plate in the middle.

Weight: Light · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-104/module.css">
<section class="apx-scr104" data-apx="SCR-104" aria-labelledby="h">
  <div class="apx-scr104__cols">
    <ul class="apx-scr104__col" data-dir="up"><li class="apx-scr104__tile is-tall" style="--d:0"><small>…</small><b>…</b><p>…</p></li> …</ul>
    <ul class="apx-scr104__col" data-dir="down">…</ul>
    <ul class="apx-scr104__col" data-dir="up">…</ul>
  </div>
  <div class="apx-scr104__plate"><h2 id="h">…</h2><p>…</p><a class="apx-scr104__cta" href="#">…</a></div>
</section>
<script src="library/SCR-104/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-104"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-104'].mount(el)` (also `window.APX.SCR104`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`--apx-scr104-height` (default 170vh). Tile helpers: `.is-tall`, `.apx-scr104__chip`. `mount(root, { forceJs: true })` forces the script fallback.

## Tokens
`--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Runs on the native CSS scroll timeline (off the main thread); the script only drives browsers without it. Phones: two columns, smaller drift, headline plate first and solid (no blur). Reduced motion / motion 0: columns still.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

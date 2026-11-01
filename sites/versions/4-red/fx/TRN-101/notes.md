# TRN-101 · Venetian Wipe

The next section opens like venetian blinds: slats in the colour of the section above tilt shut into thin lines one after another as it scrolls in.

Weight: Light · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TRN-101/module.css">
<section class="apx-trn101" data-apx="TRN-101" data-slats="9" style="--apx-trn101-from: #0b0b0d">
  <div class="apx-trn101__inner">…content…</div>
</section>
<script src="library/TRN-101/module.js"></script>
```
Auto-mounts every `[data-apx="TRN-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TRN-101'].mount(el)` (also `window.APX.TRN101`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
Put it on the INCOMING section. `--apx-trn101-from` = background of the section above (defaults to `--apx-bg`; only visible when the two differ). `data-slats` 3–24 (default 9). `mount(root, { forceJs: true })` forces the script fallback.

## Tokens
`--apx-bg`, `--apx-accent`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Slats are aria-hidden overlays with pointer-events none; content is never hidden from assistive tech. Native CSS scroll timeline where supported, script fallback otherwise. Motion 0 / reduced motion / no JS: no slats.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

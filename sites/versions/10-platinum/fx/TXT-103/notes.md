# TXT-103 · Tide Fill

A headline starts as an outline and fills from the bottom like rising water as you scroll, with a gentle wave at the waterline that lifts where you point.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/TXT-103/module.css">
<h2 class="apx-txt103" data-apx="TXT-103">Leads that are <em>actually</em> yours</h2>
<script src="library/TXT-103/module.js"></script>
```
Auto-mounts every `[data-apx="TXT-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['TXT-103'].mount(el)` (also `window.APX.TXT103`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
Any inline markup is kept; `<em>`/`<i>` take the accent colour. Font size and weight come from your heading styles.

## Tokens
`--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-font-display`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
The original text stays readable to assistive tech; the filled copy is aria-hidden. Final state is solid ink (full contrast). Motion 0 / reduced motion: solid headline, no outline phase.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

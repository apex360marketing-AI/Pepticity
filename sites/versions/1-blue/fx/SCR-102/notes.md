# SCR-102 · Fan Deck

A neat stack of cards fans out into a hand as you scroll, then each card in turn rises out of the fan to be read.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-102/module.css">
<section class="apx-scr102" data-apx="SCR-102" aria-labelledby="h">
  <div class="apx-scr102__stage">
    <header class="apx-scr102__head"><div><span class="apx-scr102__eyebrow">…</span><h2 id="h">…</h2></div>
      <div class="apx-scr102__meta" aria-hidden="true"><span class="apx-scr102__count"></span><svg class="apx-scr102__ring" viewBox="0 0 36 36"><circle cx="18" cy="18" r="15.9" pathLength="100"/><circle cx="18" cy="18" r="15.9" pathLength="100"/></svg></div></header>
    <ol class="apx-scr102__deck">
      <li class="apx-scr102__card"><div class="apx-scr102__face" tabindex="0"><span class="apx-scr102__num">01</span><i class="apx-scr102__dot"></i><h3>…</h3><p>…</p></div></li> … (4–8 cards)
    </ol>
  </div>
</section>
<script src="library/SCR-102/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-102"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-102'].mount(el)` (also `window.APX.SCR102`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`data-spread` (degrees between cards; auto by count), `--apx-scr102-length` (default 380vh).

## Tokens
`--apx-bg`, `--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
Cards are an ordered list in reading order, each face focusable. Phones: a swipeable snap rail (no pin) whose cards tilt by distance from centre. Motion 0 / reduced motion: a plain card grid.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

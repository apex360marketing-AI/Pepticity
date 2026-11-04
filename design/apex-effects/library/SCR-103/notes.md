# SCR-103 · Frame Tunnel

Scrolling carries you forward through a corridor of picture frames, each one holding a step, until the last frame becomes the call to action.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/SCR-103/module.css">
<section class="apx-scr103" data-apx="SCR-103">
  <div class="apx-scr103__stage">
    <div class="apx-scr103__world">
      <article class="apx-scr103__frame"><div class="apx-scr103__body"><span class="apx-scr103__tag">01 · …</span><h3>…</h3><p>…</p></div></article> …
      <article class="apx-scr103__frame" data-final><div class="apx-scr103__body">… <a class="apx-scr103__cta" href="#">… <i aria-hidden="true"></i></a></div></article>
    </div>
    <div class="apx-scr103__meter" aria-hidden="true"><b></b></div>
  </div>
</section>
<script src="library/SCR-103/module.js"></script>
```
Auto-mounts every `[data-apx="SCR-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX['SCR-103'].mount(el)` (also `window.APX.SCR103`). Mounting twice returns the same `destroy`; `destroy()` restores the original markup/styles.

## Options
`--apx-scr103-length` (default 460vh). 3–7 frames work best; mark the last with `data-final`.

## Tokens
`--apx-bg`, `--apx-surface`, `--apx-ink`, `--apx-muted`, `--apx-accent`, `--apx-accent-ink`, `--apx-line`, `--apx-radius`, `--apx-font-display`, `--apx-font-text`, `--apx-motion` (all with fallbacks). `--apx-motion`: 0 = still, 1 = normal (scales durations/amplitudes). After changing tokens at runtime, dispatch `apx:tokens` on the element or window.

## Accessibility and performance
All frame text stays in the DOM in order. Focusing a link inside a frame scrolls the tunnel to that frame. Desktop pointer gives a small camera sway. Phones: no pin, frames become a list that scales in. Motion 0 / reduced motion: static list.
Transform / opacity / clip-path only; one rAF loop per instance that sleeps when off screen or the tab is hidden; `prefers-reduced-motion` is treated as motion 0. Tested at 390px with no sideways scroll.

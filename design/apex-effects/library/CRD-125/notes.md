# CRD-125 · Pennant Banner

A swallow-tail banner of glass hung from a chrome rod, its folds catching light as if moved by a breeze.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-125/module.css">
<article class="apx-c125" data-apx="CRD-125" aria-label="Now open in your city">
  <div class="apx-c125__in">
    <p class="apx-c125__k">Now open</p>
    <span class="apx-c125__orn" aria-hidden="true"></span>
    <h3 class="apx-c125__title">[City]</h3>
    <p class="apx-c125__text">[Trades open in this area]</p>
    <a class="apx-c125__btn" href="#claim">Claim your trade</a>
  </div>
</article>
<script src="library/CRD-125/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-125"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD125.mount(el)` (also `window.APX['CRD-125']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Soft folds of light ripple across the banner like cloth in a breeze. Pointing leans the banner back from the rod and slides the folds toward you.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The announcement is plain text and a real link; the rod and folds are decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

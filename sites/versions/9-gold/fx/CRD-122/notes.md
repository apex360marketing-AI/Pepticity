# CRD-122 · Bevel Diamond

A diamond of bevelled glass, lit like an antique mirror, that turns over to explain what “yours only” means.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-122/module.css">
<article class="apx-c122" data-apx="CRD-122" aria-label="Yours only">
  <div class="apx-c122__in">
    <div class="apx-c122__face apx-c122__front">
      <p class="apx-c122__k">Each lead is</p>
      <h3 class="apx-c122__t">YOURS ONLY</h3>
      <p class="apx-c122__d">One request. One business.</p>
      <button class="apx-c122__btn" type="button" data-turn="back">How it works</button>
    </div>
    <div class="apx-c122__face apx-c122__back" hidden>
      <p class="apx-c122__k">The terms</p>
      <p class="apx-c122__d" style="margin-top:8px">[Your exclusivity terms, in one or two lines.]</p>
      <button class="apx-c122__btn" type="button" data-turn="front">Back</button>
    </div>
  </div>
</article>
<script src="library/CRD-122/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-122"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD122.mount(el)` (also `window.APX['CRD-122']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Light slowly moves round the four bevels. Pointing moves the light source with you and tilts the tile; "How it works" turns the diamond over and "Back" turns it again.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Both sides are real text; the hidden side uses the hidden attribute and the buttons move focus with the turn. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

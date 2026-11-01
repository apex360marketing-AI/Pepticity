# CRD-118 · Squircle Stack

Three stacked rounded-square sheets of glass that fan apart in depth, with a sample text alert sliding in on top.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-118/module.css">
<article class="apx-c118" data-apx="CRD-118" aria-label="Text alerts">
  <div class="apx-c118__alert" aria-hidden="true"><i></i><span><b>Sample · New lead</b>Roof leak, [City]. Tap to call.</span></div>
  <div>
    <h3 class="apx-c118__title">A text <strong>the moment</strong> a lead is ready</h3>
    <p class="apx-c118__text">No app to install. [Your delivery details] (sample alert above)</p>
  </div>
</article>
<script src="library/CRD-118/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-118"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD118.mount(el)` (also `window.APX['CRD-118']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A sample alert slides in on the top sheet every few seconds. Pointing fans the three sheets apart in depth and tilts the stack.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The alert is labelled Sample and repeated in plain text; the moving copy is aria-hidden. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

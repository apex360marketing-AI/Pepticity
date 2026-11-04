# CRD-105 · Honeycomb Cell

A hexagon of dotted glass that holds one figure; its inner outline turns to follow the pointer.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-105/module.css">
<article class="apx-c105" data-apx="CRD-105" aria-label="Leads this month, sample layout">
  <div class="apx-c105__in">
    <p class="apx-c105__label">Leads sent to you</p>
    <p class="apx-c105__value">[00]</p>
    <p class="apx-c105__period">this month</p>
    <div class="apx-c105__bars" aria-hidden="true"><i style="--h:.35"></i><i style="--h:.55"></i><i style="--h:.42"></i><i style="--h:.7"></i><i style="--h:.6"></i><i style="--h:.85"></i><i style="--h:1"></i></div>
    <p class="apx-c105__note">Sample layout. Your real number goes here.</p>
  </div>
</article>
<script src="library/CRD-105/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-105"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD105.mount(el)` (also `window.APX['CRD-105']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The sample bars rise as the card scrolls in and gently pulse. Pointing tilts the cell, turns the inner hexagon toward the pointer and brightens the rim.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The figure is a placeholder and the bars are marked as a sample, so nothing reads as a real result. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

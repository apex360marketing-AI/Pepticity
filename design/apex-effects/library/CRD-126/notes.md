# CRD-126 · Half-Moon Gauge

A half-moon of instrument glass with engraved ticks and a chrome needle that settles on a sample reading.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-126/module.css">
<article class="apx-c126" data-apx="CRD-126" aria-label="Time to your phone, sample gauge">
  <div class="apx-c126__in">
    <p class="apx-c126__k">Request to your phone</p>
    <p class="apx-c126__val">[Your figure]</p>
    <p class="apx-c126__unit">minutes, on average</p>
    <span class="apx-c126__chip">Sample gauge · not real data</span>
  </div>
</article>
<script src="library/CRD-126/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-126"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD126.mount(el)` (also `window.APX['CRD-126']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The needle swings up and settles with a small overshoot when the card scrolls in, then trembles slightly like a live instrument. Moving the pointer across the dial previews the needle under it.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The reading is a placeholder and the dial is labelled as a sample, so it never reads as a real result. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

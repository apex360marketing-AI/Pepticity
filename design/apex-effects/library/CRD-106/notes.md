# CRD-106 · Territory Loupe

A thick round glass lens over a small map of your area, with a loupe that magnifies wherever you point.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-106/module.css">
<article class="apx-c106" data-apx="CRD-106" aria-label="Your service area">
  <div class="apx-c106__in">
    <p class="apx-c106__eyebrow">Your area</p>
    <h3 class="apx-c106__area">[City] · [ZIP codes]</h3>
    <p class="apx-c106__status">Open · Sample</p>
    <p class="apx-c106__rule">One [trade] business per area</p>
    <a class="apx-c106__btn" href="#area">Check my area</a>
  </div>
</article>
<script src="library/CRD-106/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-106"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD106.mount(el)` (also `window.APX['CRD-106']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A slow radar sweep turns over the map and the pin pulses. Point at (or drag on) the lens to move a magnifying loupe across the map.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The map is decorative; the area, status and button are real text and a real link. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

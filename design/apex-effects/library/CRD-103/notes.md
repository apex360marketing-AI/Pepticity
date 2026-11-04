# CRD-103 · Dog-Ear Chrome

An industry card with a folded glass corner and a real chrome icon floating above it that turns toward you.

Weight: Heavy · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-103/module.css">
<article class="apx-c103" data-apx="CRD-103" data-icon="roof" aria-label="Roofing leads">
  <div class="apx-c103__in">
    <div class="apx-c103__slot"><canvas class="apx-c103__icon" width="256" height="256" role="img" aria-label="Chrome roof icon"></canvas></div>
    <p class="apx-c103__eyebrow">Industry · one of 33</p>
    <h3 class="apx-c103__title">Roofing</h3>
    <p class="apx-c103__text">Homeowners near you asking for a roof repair or a new roof.</p>
    <ul class="apx-c103__tags"><li>Repairs</li><li>New roofs</li><li>Storm damage</li></ul>
    <a class="apx-c103__link" href="#roofing">See roofing leads</a>
  </div>
</article>
<script src="library/CRD-103/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-103"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD103.mount(el)` (also `window.APX['CRD-103']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The chrome icon floats and sways on its own, turns toward the pointer and leans as the card scrolls. Hovering lifts the folded corner further and lights the space behind the icon. Set data-icon to roof, drop or bolt.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The icon canvas has a text label. Without 3D support it is replaced by a still chrome drawing; with reduced motion it renders one still frame. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

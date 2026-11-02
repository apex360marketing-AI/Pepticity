# CRD-108 · Bezel Plaque

Contact details behind clear glass set in a brushed-steel frame, with screws that turn when you point.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-108/module.css">
<article class="apx-c108" data-apx="CRD-108" aria-label="Contact">
  <div class="apx-c108__in">
    <p class="apx-c108__eyebrow">Talk to a person</p>
    <h3 class="apx-c108__title">[Your team name]</h3>
    <dl class="apx-c108__rows">
      <div><dt>Phone</dt><dd><a href="#call">[Your phone]</a></dd></div>
      <div><dt>Email</dt><dd><a href="#email">[Your email]</a></dd></div>
      <div><dt>Hours</dt><dd>[Your hours]</dd></div>
      <div><dt>Area</dt><dd>[Your service area]</dd></div>
    </dl>
    <div class="apx-c108__btns"><a class="apx-c108__btn" href="#call">Call now</a><a class="apx-c108__btn is-ghost" href="#email">Email us</a></div>
  </div>
</article>
<script src="library/CRD-108/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-108"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD108.mount(el)` (also `window.APX['CRD-108']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A glint runs along the steel frame every few seconds. Pointing slides a highlight across the brushed metal to follow you, tilts the plaque and turns the four screws.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Phone and email are real links; the frame and screws are decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

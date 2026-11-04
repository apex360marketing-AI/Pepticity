# CRD-123 · Bite Notch

A pay-per-lead price card with a round bite taken out of one corner, where a glass button sits and follows you.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-123/module.css">
<article class="apx-c123" data-apx="CRD-123" aria-label="Pay per lead">
  <a class="apx-c123__go" href="#start" aria-label="Start with pay per lead"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
  <div class="apx-c123__in">
    <p class="apx-c123__k">Pay per lead</p>
    <p class="apx-c123__price">[Your price]</p>
    <p class="apx-c123__per">for each checked lead you receive</p>
    <ul class="apx-c123__list">
      <li><div>Monthly fee <span>[Your billing terms]</span></div></li>
      <li><div>Pausing <span>[Your pause terms]</span></div></li>
      <li><div>Bad leads <span>[Your refund terms]</span></div></li>
    </ul>
    <p class="apx-c123__fine">Prices and terms are placeholders until approved.</p>
  </div>
</article>
<script src="library/CRD-123/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-123"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD123.mount(el)` (also `window.APX['CRD-123']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The edge of the bite glows softly. Pointing near the corner pulls the round button toward you like a magnet and lights the bite’s rim; the price glows on hover.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The round button is a real link with a text label; the price and terms are plain text. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

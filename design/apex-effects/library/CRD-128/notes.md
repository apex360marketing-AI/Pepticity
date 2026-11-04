# CRD-128 · Luggage Tag

A glass luggage tag on a cord, labelled with where your leads are delivered; flip it to see the route.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-128/module.css">
<article class="apx-c128" data-apx="CRD-128" aria-label="Where your leads go">
  <div class="apx-c128__in">
    <div class="apx-c128__face apx-c128__front">
      <p class="apx-c128__k">Deliver to</p>
      <h3 class="apx-c128__title">[Your business]</h3>
      <dl class="apx-c128__rows"><div><dt>Phone</dt><dd>[Your mobile]</dd></div><div><dt>CRM</dt><dd>[Your CRM]</dd></div><div><dt>For</dt><dd>[Trade] · [Area]</dd></div></dl>
      <button class="apx-c128__btn" type="button" data-turn="back">See the route</button>
    </div>
    <div class="apx-c128__face apx-c128__back" hidden>
      <p class="apx-c128__k">How a lead travels</p>
      <ol class="apx-c128__route"><li>Request</li><li>Checked</li><li>To you</li><span class="apx-c128__dot" aria-hidden="true"></span></ol>
      <p class="apx-c128__fine">Text and CRM at the same time. [Your delivery time]</p>
      <button class="apx-c128__btn" type="button" data-turn="front">Back</button>
    </div>
  </div>
</article>
<script src="library/CRD-128/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-128"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD128.mount(el)` (also `window.APX['CRD-128']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The cord sways and a dot travels along the route. Pointing tilts the tag; "See the route" flips it over to show how a lead travels to you, and "Back" flips it again.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Both sides are real text; the hidden side uses the hidden attribute and focus follows the flip. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

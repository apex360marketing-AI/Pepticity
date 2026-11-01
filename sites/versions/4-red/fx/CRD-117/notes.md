# CRD-117 · Split Shard

A glass card split along a slanted line into “shared” and “yours only”; the halves part and light pours through.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-117/module.css">
<article class="apx-c117" data-apx="CRD-117" aria-label="Shared leads compared with leads only you get">
  <div class="apx-c117__half a">
    <p class="apx-c117__k">Shared leads</p>
    <h3 class="apx-c117__h">Sold to several firms</h3>
    <p class="apx-c117__p">The same homeowner gets calls from a handful of companies.</p>
  </div>
  <div class="apx-c117__half b">
    <p class="apx-c117__k">APEX leads</p>
    <h3 class="apx-c117__h">One request, <em>yours only</em></h3>
    <p class="apx-c117__p">Each lead goes to one business. [Your exclusivity terms]</p>
  </div>
</article>
<script src="library/CRD-117/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-117"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD117.mount(el)` (also `window.APX['CRD-117']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A thin line of light glows in the crack between the halves. Pointing pushes the two pieces apart along the cut and floods the gap with light.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Both halves are plain headed text in reading order; the light in the crack is decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

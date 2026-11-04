# CRD-120 · Fan Fold

Three steps printed on a zig-zag folded strip of glass, like a paper fan, that flattens out when you open it.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-120/module.css">
<section class="apx-c120" data-apx="CRD-120" aria-label="How it works">
  <div class="apx-c120__cover"><div><p>Three steps</p><h3>How it works</h3></div><button class="apx-c120__open" type="button" aria-pressed="false">Open the steps</button></div>
  <ol class="apx-c120__strip">
    <li class="apx-c120__p"><span class="apx-c120__n" aria-hidden="true">1</span><div><p class="apx-c120__t">Pick your trade</p><p class="apx-c120__d">One of 33.</p></div></li>
    <li class="apx-c120__p"><span class="apx-c120__n" aria-hidden="true">2</span><div><p class="apx-c120__t">Pick your area</p><p class="apx-c120__d">[Your city or ZIPs]</p></div></li>
    <li class="apx-c120__p"><span class="apx-c120__n" aria-hidden="true">3</span><div><p class="apx-c120__t">Get leads</p><p class="apx-c120__d">On your phone and in your CRM.</p></div></li>
  </ol>
</section>
<script src="library/CRD-120/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-120"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD120.mount(el)` (also `window.APX['CRD-120']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Light runs across the folds one panel at a time. Pointing (or pressing "Open the steps") unfolds the strip flat, one panel after another; leaving folds it back.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The steps are an ordered list; the open button uses aria-pressed and folding is purely visual. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

# CRD-124 · Fog Wipe

A fogged-up shop window: wipe the glass with your pointer or finger to read the sample leads behind it.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-124/module.css">
<article class="apx-c124" data-apx="CRD-124" aria-label="Sample leads near you">
  <div class="apx-c124__in">
    <div class="apx-c124__head"><div><p class="apx-c124__k">Wipe the glass</p><h3 class="apx-c124__title">Sample leads near [City]</h3></div><button class="apx-c124__clear" type="button" aria-pressed="false">Clear the glass</button></div>
    <ul class="apx-c124__list">
      <li><b>Roof leak repair</b><span>[Street], [City]</span><em>Sample</em></li>
      <li><b>New furnace quote</b><span>[Street], [City]</span><em>Sample</em></li>
      <li><b>Blocked drain</b><span>[Street], [City]</span><em>Sample</em></li>
    </ul>
    <p class="apx-c124__hint">Move your pointer or finger over the fog.</p>
  </div>
</article>
<script src="library/CRD-124/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-124"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD124.mount(el)` (also `window.APX['CRD-124']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The fog drifts and slowly creeps back. Moving the pointer (or dragging a finger) wipes clear streaks in the fog; "Clear the glass" wipes it all at once for keyboard, touch and reduced-motion users.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The text under the fog is always in the page for screen readers. The clear button uses aria-pressed; with reduced motion the fog does not creep back. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

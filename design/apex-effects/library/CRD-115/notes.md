# CRD-115 · Slat Stack

A list of trades on separate slanted slats of glass; the one you point at slides out and lights up.

Weight: Light · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-115/module.css">
<nav class="apx-c115" data-apx="CRD-115" aria-label="Trades">
  <div class="apx-c115__head"><p class="t">Trades we cover</p><p class="s">33 trades. Pick yours to see your area.</p></div>
  <ul>
    <li><a class="apx-c115__slat" href="#roofing"><b>Roofing</b><span>Check your area →</span></a></li>
    <li><a class="apx-c115__slat" href="#plumbing"><b>Plumbing</b><span>Check your area →</span></a></li>
    <li><a class="apx-c115__slat" href="#hvac"><b>Heating &amp; cooling</b><span>Check your area →</span></a></li>
    <li><a class="apx-c115__slat" href="#solar"><b>Solar</b><span>Check your area →</span></a></li>
    <li><a class="apx-c115__slat" href="#pest"><b>Pest control</b><span>Check your area →</span></a></li>
  </ul>
  <a class="apx-c115__all" href="#trades">See all 33 trades</a>
</nav>
<script src="library/CRD-115/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-115"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD115.mount(el)` (also `window.APX['CRD-115']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A band of light runs down the slats one after another. Pointing at a slat (or tabbing to it) slides it out, lights its edge and dims the others.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Each slat is a normal link in a list, so it works with keyboard and screen readers as a plain menu. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

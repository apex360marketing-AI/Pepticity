# CRD-116 · Orbit Capsule

A glass capsule showing that your area is open, with a small glass bead circling it on a tilted orbit.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-116/module.css">
<article class="apx-c116" data-apx="CRD-116" aria-label="Area status, sample">
  <div class="apx-c116__in">
    <p class="apx-c116__live"><i aria-hidden="true"></i>Lead line open</p>
    <h3 class="apx-c116__title">[City] · [Trade]</h3>
    <p class="apx-c116__note">Sample status. One business per trade, per area.</p>
    <a class="apx-c116__btn" href="#check">Check my area</a>
  </div>
</article>
<script src="library/CRD-116/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-116"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD116.mount(el)` (also `window.APX['CRD-116']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A glass bead circles the capsule and the live dot pulses. Pointing tilts the capsule, brightens the orbit and makes the bead speed up.

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The status is real text; the orbit and bead are decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

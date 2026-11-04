# CRD-109 · Liquid Glass

A video card shaped like a drop of liquid glass that slowly rolls and breathes, with beads that follow you.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-109/module.css">
<article class="apx-c109" data-apx="CRD-109" aria-label="Sample video">
  <div class="apx-c109__in">
    <div class="apx-c109__frame"><span class="apx-c109__phone" aria-hidden="true"><span class="apx-c109__note"><b>Sample</b>New lead: roof repair, [City]</span></span><button class="apx-c109__play" type="button" aria-label="Play sample video" aria-pressed="false"></button></div>
    <p class="apx-c109__eyebrow">Video · [0:00]</p>
    <h3 class="apx-c109__title">See a lead arrive</h3>
    <p class="apx-c109__text">[Your video: how a lead reaches your phone]</p>
    <p class="apx-c109__msg" role="status" hidden>Video placeholder. Add your file here.</p>
  </div>
</article>
<script src="library/CRD-109/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-109"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD109.mount(el)` (also `window.APX['CRD-109']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The glass drop slowly rolls and breathes while two small glass beads circle it. Pointing speeds the drop up and draws the beads toward you. Play opens a placeholder where your video goes.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Play is a real button with aria-pressed; the placeholder message is announced politely. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

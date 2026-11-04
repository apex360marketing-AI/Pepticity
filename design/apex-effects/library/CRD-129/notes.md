# CRD-129 · Viewfinder

A video card framed like a camera viewfinder, with a focus box that follows you and light leaking round its edges.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-129/module.css">
<article class="apx-c129" data-apx="CRD-129" aria-label="Demo video">
  <div class="apx-c129__in">
    <div class="apx-c129__hud"><span class="apx-c129__rec">Rec</span><span>[00:00]</span></div>
    <div class="apx-c129__screen" id="scr-x">
      <div class="apx-c129__lead" aria-hidden="true"><b>Sample · New lead</b>Gutter repair, [City]<i></i><i></i><i></i></div>
      <div class="apx-c129__overlay" role="status">Video placeholder. Add your 30-second demo here.</div>
    </div>
    <h3 class="apx-c129__title">Watch a lead arrive</h3>
    <p class="apx-c129__text">[Your 30-second demo video]. Preview shows a sample lead.</p>
    <button class="apx-c129__play" type="button" aria-expanded="false" aria-controls="scr-x">Play demo</button>
  </div>
</article>
<script src="library/CRD-129/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-129"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD129.mount(el)` (also `window.APX['CRD-129']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The record light blinks and a sample lead types itself into the preview. Pointing moves the focus box with you, closes the corner brackets in and lets light leak out from behind; "Play demo" opens the video placeholder.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Play demo is a real button with aria-expanded; the typing preview is decorative and repeated as text. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

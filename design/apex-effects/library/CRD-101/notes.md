# CRD-101 · Ticket Stub

A sample lead shown as a see-through glass ticket; tearing off the stub reveals the customer’s number.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-101/module.css">
<article class="apx-c101" data-apx="CRD-101" aria-label="Sample lead ticket">
  <div class="apx-c101__main">
    <div class="apx-c101__top"><span class="apx-c101__kicker">New lead</span><span class="apx-c101__chip">Sample</span></div>
    <h3 class="apx-c101__title">Roof leak repair</h3>
    <dl class="apx-c101__rows">
      <div><dt>Area</dt><dd>[City, ZIP]</dd></div>
      <div><dt>Wants</dt><dd>A quote this week</dd></div>
      <div><dt>Phone</dt><dd class="apx-c101__phone"><span class="apx-c101__hide" aria-hidden="true">(•••) •••-••••</span><span class="apx-c101__show">[Customer phone]</span></dd></div>
    </dl>
    <p class="apx-c101__check"><span>Checked</span> phone, address and request</p>
  </div>
  <div class="apx-c101__stub">
    <div><span class="apx-c101__k2">Yours only</span><strong>1 of 1</strong></div>
    <button type="button" class="apx-c101__tear" aria-pressed="false">Tear to claim</button>
    <span class="apx-c101__serial">NO. [0000]</span>
  </div>
</article>
<script src="library/CRD-101/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-101"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD101.mount(el)` (also `window.APX['CRD-101']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
Pointer tilts the ticket and drags a sheen across it; a light sweep crosses it every few seconds. "Tear to claim" swings the stub away and reveals the phone line; press again to put it back.

## Tokens read
`--apx-accent`, `--apx-accent-ink`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The tear control is a real button with aria-pressed. The hidden number is still read by screen readers as its placeholder. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

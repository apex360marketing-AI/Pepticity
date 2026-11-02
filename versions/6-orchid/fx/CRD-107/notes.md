# CRD-107 · Double Pane

A process step printed on two offset sheets of glass that slide apart, with light glowing in the gap.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-107/module.css">
<article class="apx-c107" data-apx="CRD-107" data-step="02" aria-label="Step 2: we check it">
  <div class="apx-c107__in">
    <p class="apx-c107__step">Step 2 of 3</p>
    <h3 class="apx-c107__title">We <em>check</em> it</h3>
    <p class="apx-c107__text">A real person confirms the phone number, address and request before the lead is sent. [Your verification process]</p>
    <ol class="apx-c107__dots" aria-label="Progress"><li>Ask</li><li aria-current="step">Check</li><li>Send</li></ol>
  </div>
</article>
<script src="library/CRD-107/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-107"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD107.mount(el)` (also `window.APX['CRD-107']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A soft light drifts between the two panes. Pointing moves the panes in opposite directions for depth, and hovering pulls them further apart and brightens the light between them.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The big step number is decorative; the step is stated in text and the progress list marks the current step with aria-current. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

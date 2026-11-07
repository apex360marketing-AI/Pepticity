# CRD-119 · Glass Slab

A thick slab of glass like a member card: you see its edge as it tilts, and it turns over to show the back.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-119/module.css">
<article class="apx-c119" data-apx="CRD-119" aria-label="Sample member card">
  <div class="apx-c119__in">
    <div class="apx-c119__face apx-c119__front">
      <div class="apx-c119__top"><span class="apx-c119__brand">APEX</span><span class="apx-c119__chip">Sample card</span></div>
      <div class="apx-c119__mid"><span class="apx-c119__emv" aria-hidden="true"></span><p class="apx-c119__who"><b>[Business name]</b><span>[Trade] · [Area]</span></p></div>
      <div class="apx-c119__bottom"><p class="apx-c119__no"><small>Member no.</small>[0000 0000]</p><button class="apx-c119__turn" type="button" data-turn="back">Turn over</button></div>
    </div>
    <div class="apx-c119__face apx-c119__back" hidden>
      <div class="apx-c119__stripe" aria-hidden="true"></div>
      <dl><div><dt>Account</dt><dd>[Your account details]</dd></div><div><dt>Support</dt><dd>[Your phone]</dd></div></dl>
      <div class="apx-c119__bottom"><span></span><button class="apx-c119__turn" type="button" data-turn="front">Turn back</button></div>
    </div>
  </div>
</article>
<script src="library/CRD-119/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-119"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD119.mount(el)` (also `window.APX['CRD-119']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A thin holographic band drifts across the face. Pointing tilts the slab so its thick glass edge shows and the band follows you. "Turn over" flips it top-over-bottom to the account side.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Turn over and Turn back are real buttons; the hidden side uses the hidden attribute and focus moves with the flip. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

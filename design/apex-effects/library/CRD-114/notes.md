# CRD-114 · Lead Receipt

A sample lead printed on a torn, perforated glass receipt, with a thin laser scanning its barcode.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-114/module.css">
<article class="apx-c114" data-apx="CRD-114" aria-label="Sample lead slip">
  <div class="apx-c114__in">
    <p class="apx-c114__head"><b>APEX · Lead slip</b><span>Sample</span></p>
    <hr>
    <dl class="apx-c114__rows">
      <div><dt>Service</dt><dd>Bathroom remodel</dd></div>
      <div><dt>Area</dt><dd>[ZIP]</dd></div>
      <div><dt>Phone</dt><dd class="apx-c114__ok">checked</dd></div>
      <div><dt>Address</dt><dd class="apx-c114__ok">checked</dd></div>
      <div><dt>Sent to</dt><dd>phone + CRM</dd></div>
      <div><dt>Time</dt><dd>[00:00]</dd></div>
    </dl>
    <hr>
    <div class="apx-c114__code" aria-hidden="true"></div>
    <p class="apx-c114__foot">[Your business] · No. [0000]</p>
  </div>
</article>
<script src="library/CRD-114/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-114"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD114.mount(el)` (also `window.APX['CRD-114']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
The slip feeds up out of the printer as it scrolls into view and a thin laser line scans the barcode. Pointing feeds the paper up a little further and tilts it.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
The slip is a real definition list; the barcode is decorative. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.

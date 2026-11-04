# CRD-113 · Lead File

A sample lead kept in a stitched glass folder with a tab; opening it flips the folder to show the details.

Weight: Medium · Dependencies: none (vanilla JS, no CDN) · Motion-safe: yes

## Mount
```html
<link rel="stylesheet" href="library/CRD-113/module.css">
<article class="apx-c113" data-apx="CRD-113" aria-label="Sample lead file">
  <span class="apx-c113__tab">Lead file · <b>Sample</b></span>
  <div class="apx-c113__in">
    <div class="apx-c113__face apx-c113__front">
      <h3 class="apx-c113__title">Kitchen remodel</h3>
      <p class="apx-c113__sub">[City] · budget [customer’s range]</p>
      <dl class="apx-c113__rows">
        <div><dt>Name</dt><dd><span class="apx-c113__redact" style="width:70%"></span><span class="vh" style="position:absolute;width:1px;height:1px;overflow:hidden;clip-path:inset(50%)">Hidden until opened</span></dd></div>
        <div><dt>Phone</dt><dd><span class="apx-c113__redact" style="width:52%"></span></dd></div>
        <div><dt>Notes</dt><dd><span class="apx-c113__redact" style="width:88%"></span></dd></div>
      </dl>
      <button class="apx-c113__btn" type="button" data-flip="open">Open file</button>
    </div>
    <div class="apx-c113__face apx-c113__back" hidden>
      <h3 class="apx-c113__title">[Customer name]</h3>
      <p class="apx-c113__sub">Kitchen remodel · [City]</p>
      <dl class="apx-c113__rows">
        <div><dt>Phone</dt><dd>[Checked number]</dd></div>
        <div><dt>Wants</dt><dd>A quote this month</dd></div>
        <div><dt>Notes</dt><dd>[Customer notes]</dd></div>
      </dl>
      <button class="apx-c113__btn" type="button" data-flip="close">Close file</button>
    </div>
  </div>
</article>
<script src="library/CRD-113/module.js"></script>
```
Auto-mounts every `[data-apx="CRD-113"]` on load (add `data-apx-manual` to opt out, or set `window.APX_NO_AUTOMOUNT = true` before the script).
Manual: `const destroy = window.APX.CRD113.mount(el)` (also `window.APX['CRD-113']`). `el` can be the card or any container of cards. Mounting twice returns the same `destroy`; `destroy()` removes every layer the script added and restores the original markup and inline styles.

Replace every `[bracketed]` placeholder with real, approved content. Anything marked Sample stays labelled Sample until it is real.

## Interaction
A sweep of light crosses the folder now and then and the redacted lines shimmer. Pointing tilts the folder and moves the sheen; "Open file" flips it over to the sample details and "Close file" flips it back.

## Tokens read
`--apx-accent`, `--apx-bg`, `--apx-dist-2`, `--apx-dur-1`, `--apx-dur-2`, `--apx-dur-3`, `--apx-dur-4`, `--apx-dur-5`, `--apx-dur-spring`, `--apx-ease-in`, `--apx-ease-inout`, `--apx-ease-out`, `--apx-ease-spring`, `--apx-font-display`, `--apx-font-text`, `--apx-ink`, `--apx-motion`, `--apx-muted`, `--apx-radius`. Every value has a fallback. `--apx-motion` scales every duration (0 = still); `prefers-reduced-motion: reduce` forces it to 0. The optional motion tokens (`--apx-dur-*`, `--apx-ease-*`, `--apx-dist-2`) are honoured when present. After changing tokens at runtime, dispatch `apx:tokens` on the card or window.

## Accessibility and performance
Front and back are real content: the hidden side uses the hidden attribute, the buttons move focus to the side that is showing. Decorative layers are aria-hidden. Without a frosted-glass capable browser the glass falls back to a solid tinted surface so text stays readable. Touch devices get no tilt; tap replaces hover where hover reveals something.
Animation uses transform, opacity, filter and clip-path only; pointer reads are coalesced into one requestAnimationFrame per frame and loops sleep when idle. The entrance rises with the scroll position where the browser supports scroll-linked animation and is skipped otherwise. Tested at 390px with no sideways scroll.
